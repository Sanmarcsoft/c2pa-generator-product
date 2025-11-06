import { useState, useEffect } from 'react';
import { useProduct } from '../contexts/ProductContext';
import { useAuth } from '../contexts/AuthContext';
import SimpleProgressChart from '../components/SimpleProgressChart';
import PopupChat from '../components/PopupChat';
import EmbeddedDocumentUpload from '../components/EmbeddedDocumentUpload';
import './IntegratedProgressPage.css';

/**
 * IntegratedProgressPage - Product-scoped progress tracking
 *
 * Combines progress visualization with product selection.
 * This replaces the standalone ProgressPage with multi-product support.
 */
function IntegratedProgressPage() {
  const { selectedProduct, products, selectProduct, loading: productLoading } = useProduct();
  const { token } = useAuth();

  const [phases, setPhases] = useState([
    { id: 1, name: 'Introduction & Prerequisites', status: 'pending', progress: 0 },
    { id: 2, name: 'Understanding Requirements', status: 'pending', progress: 0 },
    { id: 3, name: 'Document Review', status: 'pending', progress: 0 },
    { id: 4, name: 'Application Preparation', status: 'pending', progress: 0 },
    { id: 5, name: 'Submission & Follow-up', status: 'pending', progress: 0 },
    { id: 6, name: 'Certification Maintenance', status: 'pending', progress: 0 }
  ]);
  const [completedPhases, setCompletedPhases] = useState([]);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [overallProgress, setOverallProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    if (selectedProduct && token) {
      fetchProgress();
    }
  }, [selectedProduct, token]);

  const fetchProgress = async () => {
    if (!selectedProduct) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Fetch product-specific progress from the new API endpoint
      const response = await fetch(`/api/products/${selectedProduct.id}/progress`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success && data.progress) {
        const progressData = data.progress;

        // Convert by_phase array to a map for easier lookup
        const phaseMap = {};
        if (progressData.by_phase) {
          progressData.by_phase.forEach(p => {
            phaseMap[p.phase] = p;
          });
        }

        // Map progress data to phases
        const completed = [];
        const updatedPhases = phases.map((phase) => {
          const phaseProgress = phaseMap[phase.id] || { status: 'pending', document_count: 0 };

          // Calculate progress percentage for in-progress phases
          let progressPercent = 0;
          if (phaseProgress.status === 'completed') {
            progressPercent = 100;
            completed.push(phase.id);
          } else if (phaseProgress.status === 'in-progress') {
            // Calculate based on approved vs required documents
            const approved = phaseProgress.approved_count || 0;
            const required = phaseProgress.required_count || 1;
            progressPercent = Math.min(90, Math.round((approved / required) * 100));
          }

          return {
            ...phase,
            status: phaseProgress.status || 'pending',
            progress: progressPercent,
            document_count: phaseProgress.document_count || 0,
            approved_count: phaseProgress.approved_count || 0,
            required_count: phaseProgress.required_count || 0,
            status_reason: phaseProgress.status_reason,
            missing_requirements: phaseProgress.missing_requirements || []
          };
        });

        setCompletedPhases(completed);
        setPhases(updatedPhases);
        setOverallProgress(progressData.overall_percentage || 0);

        // Extract current phase number from current_phase string (e.g., "phase-1" -> 1)
        const currentPhaseStr = progressData.current_phase || selectedProduct.current_phase || 'phase-1';
        const phaseNum = parseInt(currentPhaseStr.replace('phase-', ''));
        setCurrentPhase(phaseNum);
      } else {
        // Fallback: Use product's current_phase if no detailed progress
        if (selectedProduct.current_phase) {
          const phaseNum = parseInt(selectedProduct.current_phase.replace('phase-', ''));
          setCurrentPhase(phaseNum);
        }
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductChange = (e) => {
    const productId = e.target.value;
    selectProduct(productId);
  };

  if (productLoading || loading) {
    return (
      <div className="progress-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading progress...</p>
        </div>
      </div>
    );
  }

  if (!selectedProduct) {
    return (
      <div className="progress-page">
        <div className="empty-state retro-card">
          <h2>NO PRODUCT SELECTED</h2>
          <p>Please select or create a product to view certification progress.</p>
          <a href="/products" className="btn-primary">
            Go to Products
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="integrated-progress-page">
      <div className="page-header">
        <h1 className="page-title">CERTIFICATION PROGRESS</h1>

        {/* Product Selector */}
        {products.length > 1 && (
          <div className="product-selector">
            <label htmlFor="product-select">Current Product:</label>
            <select
              id="product-select"
              value={selectedProduct.id}
              onChange={handleProductChange}
              className="product-select-dropdown"
            >
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="company-info">
        <h2>{selectedProduct.name}</h2>
        <p className="text-cyan">{selectedProduct.description || 'Generator Product Certification Journey'}</p>
        <div className="product-meta">
          <span className={`status-badge ${selectedProduct.status}`}>
            {selectedProduct.status.toUpperCase()}
          </span>
          <span className="product-type">{selectedProduct.product_type || 'Generator Product'}</span>
        </div>
      </div>

      {/* Full Width Progress Chart */}
      <div className="progress-content">
        <SimpleProgressChart
          currentPhase={`phase-${currentPhase}`}
          phases={phases.map(phase => ({
            id: `phase-${phase.id}`,
            number: phase.id,
            name: phase.name,
            status: phase.status,
            completedTasks: phase.completedTasks,
            totalTasks: phase.totalTasks
          }))}
        />

        {/* Document Upload Section */}
        <div className="document-upload-section">
          <EmbeddedDocumentUpload
            productId={selectedProduct.id}
            currentPhase={currentPhase}
            onUploadSuccess={() => fetchProgress()}
          />
        </div>
      </div>

      {/* Floating Chat Button */}
      <button
        className={`chat-fab ${isChatOpen ? 'active' : ''}`}
        onClick={() => setIsChatOpen(!isChatOpen)}
        aria-label={isChatOpen ? 'Close chat' : 'Open chat'}
      >
        {isChatOpen ? '×' : '💬'}
      </button>

      {/* Popup Chat Overlay */}
      <PopupChat
        productId={selectedProduct.id}
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(false)}
      />
    </div>
  );
}

export default IntegratedProgressPage;
