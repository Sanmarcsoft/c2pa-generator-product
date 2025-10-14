# instructions for provisioning an ec2 instance from scratch for the DEV phenom backend

# first connect via aws to your EC2 instance (vanilla)

# once in, run these commands to install git

sudo yum groupinstall "Development Tools" -y
sudo yum install curl-devel expat-devel gettext-devel openssl-devel perl-devel zlib-devel -y

sudo yum remove git -y

cd /usr/src
sudo curl -O https://mirrors.edge.kernel.org/pub/software/scm/git/git-2.43.0.tar.gz
sudo tar -zxf git-2.43.0.tar.gz
cd git-2.43.0
sudo make prefix=/usr/local all
sudo make prefix=/usr/local install

git --version
git config --list

# update the path to where the legit git was installed and source it for immediate usage

echo 'export PATH=/usr/local/bin:$PATH' >> ~/.bash_profile
source ~/.bash_profile

# add identifying information for this instance (REPLACE BELOW, DO NOT COPY PASTE)

git config --global user.name "Jonathan Hart - EC2 id: i-063eedf2b0c805374"
git config --global user.email "jonathan.hart@gmail.com"

# this will preserve your one time credentials for convenience on subsequent git pulls
git config --global credential.helper store

# GENERATE your personal token in github, ensuring it's a classic token and the top repo box of permissions is checked
# enter in your github username and generated token (see above) as the password

# clone the repository to ~/
git clone https://github.com/Phenom-earth/phenom-backend

# Update and install Docker
sudo yum update -y
sudo amazon-linux-extras enable docker
sudo yum install -y docker

# Start Docker and enable it at boot
sudo systemctl start docker
sudo systemctl enable docker

# Add current user to the docker group
sudo usermod -aG docker $USER

# Apply group change immediately (no logout needed)
newgrp docker <<EONG

# Create CLI plugins folder
mkdir -p ~/.docker/cli-plugins

# Download Docker Compose v2
curl -SL https://github.com/docker/compose/releases/download/v2.27.0/docker-compose-linux-x86_64 \
  -o ~/.docker/cli-plugins/docker-compose

# Make it executable
chmod +x ~/.docker/cli-plugins/docker-compose

# Test Docker and Docker Compose
docker version
docker compose version

EONG

