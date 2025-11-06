# Global Haiku Agents - Quick Reference

**Last Updated:** 2025-11-03
**Location:** `~/.claude/agents/`
**Status:** ✅ Active System-Wide

---

## 6 Global Haiku-Optimized Agents

### 1. statusline-setup
- **Model:** haiku
- **Use When:** Configuring Claude Code status line settings
- **Tools:** Read, Edit
- **Cost:** 95% cheaper than Sonnet
- **Path:** `~/.claude/agents/statusline-setup.md`

### 2. accountant
- **Model:** haiku
- **Use When:** Cost estimation, budget tracking, expense analysis
- **Tools:** Read, Grep, WebFetch
- **Cost:** 95% cheaper than Sonnet
- **Path:** `~/.claude/agents/accountant.md`

### 3. qa-test-engineer
- **Model:** haiku
- **Use When:** Generating tests, analyzing test coverage
- **Tools:** Read, Write, Grep, Glob, Bash
- **Cost:** 95% cheaper than Sonnet
- **Path:** `~/.claude/agents/qa-test-engineer.md`

### 4. technical-documentation-writer
- **Model:** haiku
- **Use When:** Creating API docs, READMEs, code comments
- **Tools:** Write, Read, Grep, Glob
- **Cost:** 95% cheaper than Sonnet
- **Path:** `~/.claude/agents/technical-documentation-writer.md`

### 5. toolchain-environment-manager
- **Model:** haiku
- **Use When:** Docker configs, .env templates, environment setup
- **Tools:** Write, Read, Grep, Glob, Bash
- **Cost:** 95% cheaper than Sonnet
- **Path:** `~/.claude/agents/toolchain-environment-manager.md`

### 6. ui-ux-designer
- **Model:** haiku
- **Use When:** Design specs, wireframes, component breakdowns
- **Tools:** Read, Write
- **Cost:** 95% cheaper than Sonnet
- **Path:** `~/.claude/agents/ui-ux-designer.md`

---

## Quick Commands

### View All Global Agents
```bash
ls -la ~/.claude/agents/
```

### Check Haiku Configuration
```bash
grep "model: haiku" ~/.claude/agents/*.md
```

### Edit a Global Agent
```bash
# Open in default editor
$EDITOR ~/.claude/agents/agent-name.md

# Or use vim
vim ~/.claude/agents/agent-name.md
```

### Test an Agent
From any project:
```
"Create a README for this project"
→ Uses technical-documentation-writer (Haiku)
```

---

## Cost Comparison

| Model | Input | Output | Savings |
|-------|-------|--------|---------|
| Sonnet 4.5 | $3.00/M | $15.00/M | - |
| **Haiku** | **$0.15/M** | **$0.75/M** | **95%** |

**Example:**
- 30 agent calls/day × 10K tokens × 30 days
- **Sonnet:** $1,350/month
- **Haiku:** $67.50/month
- **Savings:** $1,282.50/month

---

## Agent Priority

Claude Code uses this order:

1. **Project `.claude/agents/`** (highest priority)
2. **Global `~/.claude/agents/`** ← These agents
3. **Built-in default** (fallback)

---

## When NOT to Use Haiku

These agents should stay on Sonnet (complex reasoning required):
- software-architect
- bug-diagnostician
- api-developer / frontend-developer
- database-administrator
- requirements-analyst
- devops-engineer
- project-coordinator
- meta-agent

---

## Rollback

To revert an agent to Sonnet:

**Option 1:** Remove model line
```bash
# Edit agent file, remove:
# model: haiku
```

**Option 2:** Project override
```bash
# Copy to project, remove model line
cp ~/.claude/agents/agent-name.md ./.claude/agents/
```

**Option 3:** Delete global agent
```bash
rm ~/.claude/agents/agent-name.md
```

---

## Documentation

- **Analysis:** `.claude/AGENT_MODEL_OPTIMIZATION_REPORT.md`
- **Implementation:** `.claude/IMPLEMENTATION_SUMMARY.md`
- **Migration:** `.claude/GLOBAL_AGENT_MIGRATION.md`
- **This Guide:** `.claude/GLOBAL_AGENT_QUICK_REFERENCE.md`

---

**Status:** ✅ All 6 agents active system-wide
**Benefit:** 95% cost reduction for these operations
**Scope:** Available in ALL your projects automatically
