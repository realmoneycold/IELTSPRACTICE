// 📖 READING TEST COMPLETION TRACKING SNIPPET
// Add this to checkAnswers() function in ALL Reading test files (Sets 1-10)

// Find the checkAnswers function and add this completion logic
function addReadingCompletionTracking() {
  // Get current test ID from file path
  var testId = window.location.pathname.match(/All-Passages-Set(\d+)\.html/);
  if (!testId) return;
  
  var setId = testId[1];
  var fullTestId = 'R_AP_' + (setId.length === 1 ? '0' + setId : setId);
  
  // Mark test as completed when answers are submitted
  var originalCheckAnswers = window.checkAnswers;
  window.checkAnswers = function() {
    // Call original function first
    var result = originalCheckAnswers.apply(this, arguments);
    
    // If answers are correct/accepted, mark test as completed
    if (result && (result.passed || result.score !== undefined || result.submitted)) {
      var completedTests = JSON.parse(localStorage.getItem('completedTests') || '[]');
      if (completedTests.indexOf(fullTestId) === -1) {
        completedTests.push(fullTestId);
        localStorage.setItem('completedTests', JSON.stringify(completedTests));
        console.log('Reading test marked as completed:', fullTestId);
        
        // Show completion message and redirect
        setTimeout(function() {
          alert('🎉 Test completed! Next test unlocked.');
          window.location.href = '../../dashboard.html';
        }, 1500);
      }
    }
    
    return result;
  };
}

// Alternative: If checkAnswers doesn't exist or you want to add to submit button
function addSubmitButtonTracking() {
  var submitBtn = document.querySelector('button[type="submit"], .submit-btn, .deliver-btn, #submit-btn, .finish-btn');
  
  if (submitBtn) {
    submitBtn.addEventListener('click', function(e) {
      var testId = window.location.pathname.match(/All-Passages-Set(\d+)\.html/);
      if (testId) {
        var setId = testId[1];
        var fullTestId = 'R_AP_' + (setId.length === 1 ? '0' + setId : setId);
        
        // Mark test as completed
        var completedTests = JSON.parse(localStorage.getItem('completedTests') || '[]');
        if (completedTests.indexOf(fullTestId) === -1) {
          completedTests.push(fullTestId);
          localStorage.setItem('completedTests', JSON.stringify(completedTests));
          console.log('Reading test marked as completed:', fullTestId);
        }
        
        // Redirect to dashboard
        setTimeout(function() {
          window.location.href = '../../dashboard.html';
        }, 1500);
      }
    });
  }
}

// Initialize tracking when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addReadingCompletionTracking);
} else {
  addReadingCompletionTracking();
}

// Also add submit button tracking as backup
addSubmitButtonTracking();
