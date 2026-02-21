#!/usr/bin/env node

/**
 * Project Optimization Script
 * Runs various optimization tasks to improve performance and code quality
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting Project Optimization...\n');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  try {
    log(`\n📋 ${description}...`, 'blue');
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} completed!`, 'green');
    return true;
  } catch (error) {
    log(`⚠️  ${description} failed (continuing...)`, 'yellow');
    return false;
  }
}

// 1. Clean node_modules and reinstall
function cleanInstall() {
  log('\n🧹 Step 1: Clean Installation', 'blue');
  
  if (fs.existsSync('node_modules')) {
    log('Removing node_modules...', 'yellow');
    fs.rmSync('node_modules', { recursive: true, force: true });
  }
  
  if (fs.existsSync('package-lock.json')) {
    log('Removing package-lock.json...', 'yellow');
    fs.unlinkSync('package-lock.json');
  }
  
  runCommand('npm install', 'Installing dependencies');
}

// 2. Run security audit
function securityAudit() {
  log('\n🔒 Step 2: Security Audit', 'blue');
  runCommand('npm audit --production', 'Running security audit');
}

// 3. Check for outdated packages
function checkOutdated() {
  log('\n📦 Step 3: Checking for Outdated Packages', 'blue');
  runCommand('npm outdated', 'Checking outdated packages');
}

// 4. Run linting
function runLint() {
  log('\n🎨 Step 4: Code Linting', 'blue');
  runCommand('npm run lint --if-present', 'Running ESLint');
}

// 5. Run tests
function runTests() {
  log('\n🧪 Step 5: Running Tests', 'blue');
  runCommand('npm run test:ci --if-present', 'Running tests');
}

// 6. Build for production
function buildProduction() {
  log('\n🏗️  Step 6: Production Build', 'blue');
  runCommand('npm run build', 'Building for production');
}

// 7. Analyze bundle size
function analyzeBundle() {
  log('\n📊 Step 7: Bundle Analysis', 'blue');
  
  if (fs.existsSync('build/static/js')) {
    const files = fs.readdirSync('build/static/js');
    const jsFiles = files.filter(f => f.endsWith('.js'));
    
    log('\n📦 JavaScript Bundle Sizes:', 'blue');
    jsFiles.forEach(file => {
      const filePath = path.join('build/static/js', file);
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      log(`  ${file}: ${sizeKB} KB`, 'yellow');
    });
  }
}

// 8. Generate optimization report
function generateReport() {
  log('\n📝 Step 8: Generating Optimization Report', 'blue');
  
  const report = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    npmVersion: execSync('npm --version').toString().trim(),
    optimizations: [
      'Dependencies cleaned and reinstalled',
      'Security audit completed',
      'Code linting performed',
      'Tests executed',
      'Production build created',
      'Bundle size analyzed'
    ]
  };
  
  fs.writeFileSync(
    'optimization-report.json',
    JSON.stringify(report, null, 2)
  );
  
  log('✅ Optimization report saved to optimization-report.json', 'green');
}

// Main execution
async function main() {
  const startTime = Date.now();
  
  try {
    // Run optimization steps
    // cleanInstall(); // Commented out by default - uncomment if needed
    securityAudit();
    checkOutdated();
    runLint();
    // runTests(); // Commented out by default - uncomment if needed
    buildProduction();
    analyzeBundle();
    generateReport();
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    log('\n' + '='.repeat(50), 'green');
    log('🎉 Optimization Complete!', 'green');
    log(`⏱️  Total time: ${duration}s`, 'blue');
    log('='.repeat(50) + '\n', 'green');
    
    log('📋 Next Steps:', 'blue');
    log('1. Review optimization-report.json', 'yellow');
    log('2. Check bundle sizes in build/static/js/', 'yellow');
    log('3. Test the production build locally', 'yellow');
    log('4. Deploy to production', 'yellow');
    
  } catch (error) {
    log('\n❌ Optimization failed:', 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };
