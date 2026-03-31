#!/bin/bash

# IELTS Practice Platform - Production Deployment Script
# This script handles the complete deployment process

set -e  # Exit on any error

echo "🚀 Starting IELTS Practice Platform Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if required tools are installed
check_dependencies() {
    log_info "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    if ! command -v npx &> /dev/null; then
        log_error "npx is not installed. Please install npx first."
        exit 1
    fi
    
    log_success "All dependencies are installed"
}

# Setup environment
setup_environment() {
    log_info "Setting up environment..."
    
    if [ ! -f ".env" ]; then
        log_warning ".env file not found. Creating from template..."
        if [ -f "env.example" ]; then
            cp env.example .env
            log_warning "Please edit .env file with your actual values before continuing"
            log_info "Required variables:"
            echo "  - DATABASE_URL"
            echo "  - NEXTAUTH_SECRET"
            echo "  - NEXTAUTH_URL"
            echo "  - GOOGLE_API_KEY (for AI features)"
            read -p "Press Enter after updating .env file..."
        else
            log_error "env.example file not found. Please create .env file manually."
            exit 1
        fi
    fi
    
    log_success "Environment setup complete"
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    npm install
    log_success "Dependencies installed"
}

# Database operations
setup_database() {
    log_info "Setting up database..."
    
    # Generate Prisma client
    npx prisma generate
    
    # Push database schema
    npx prisma db push
    
    # Seed the database
    npx prisma db seed
    
    log_success "Database setup complete"
}

# Build the application
build_application() {
    log_info "Building application..."
    npm run build
    log_success "Application built successfully"
}

# Deploy to Vercel
deploy_to_vercel() {
    log_info "Deploying to Vercel..."
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        log_info "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    # Check if user is logged in
    if ! vercel whoami &> /dev/null; then
        log_info "Please login to Vercel:"
        vercel login
    fi
    
    # Deploy to production
    vercel --prod
    
    log_success "Deployment complete"
}

# Main deployment flow
main() {
    echo "========================================"
    echo "🎯 IELTS Practice Platform Deployment"
    echo "========================================"
    echo ""
    
    check_dependencies
    setup_environment
    install_dependencies
    setup_database
    build_application
    deploy_to_vercel
    
    echo ""
    echo "========================================"
    log_success "🎉 DEPLOYMENT COMPLETE!"
    echo "========================================"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Set up environment variables in Vercel dashboard:"
    echo "   - DATABASE_URL"
    echo "   - NEXTAUTH_SECRET"
    echo "   - NEXTAUTH_URL"
    echo "   - GOOGLE_API_KEY"
    echo ""
    echo "2. Configure custom domain in Vercel dashboard (optional)"
    echo "3. Set up SSL certificates (handled by Vercel automatically)"
    echo "4. Monitor deployment logs in Vercel dashboard"
    echo ""
    echo "� Your application is now live!"
    echo ""
    echo "📋 Test Accounts:"
    echo "CEO: ceo@ieltspractice.com / password123"
    echo "Admin: admin@ieltspractice.com / password123"
    echo "Teacher: teacher1@ieltspractice.com / password123"
    echo "Student: student1@ieltspractice.com / password123"
    echo ""
}

# Handle script arguments
case "${1:-}" in
    "local")
        log_info "Running local setup only..."
        check_dependencies
        setup_environment
        install_dependencies
        setup_database
        log_success "Local setup complete! Run 'npm run dev' to start development server."
        ;;
    "build")
        log_info "Building for production..."
        check_dependencies
        setup_environment
        install_dependencies
        setup_database
        build_application
        log_success "Build complete! Files are in .next directory."
        ;;
    "deploy")
        main
        ;;
    *)
        echo "Usage: $0 [local|build|deploy]"
        echo "  local  - Setup local environment only"
        echo "  build  - Build for production only"
        echo "  deploy  - Full deployment to Vercel (default)"
        exit 1
        ;;
esac
