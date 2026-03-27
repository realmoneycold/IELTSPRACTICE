// 🎯 TEST COMPLETION TRACKING SNIPPET
// Add this script to ALL Listening test files (Sets 1-10)
// Place before closing </body> tag

(function() {
  // Find the submit/deliver button (multiple selectors for compatibility)
  var submitBtn = document.querySelector('button[type="submit"], .submit-btn, .deliver-btn, #submit-btn, .finish-btn');
  
  if (submitBtn) {
    submitBtn.addEventListener('click', function(e) {
      // Extract test ID from file path
      var testId = window.location.pathname.match(/All-parts-Set(\d+)\.html/);
      if (testId) {
        var setId = testId[1];
        var fullTestId = 'L_AP_' + (setId.length === 1 ? '0' + setId : setId);
        
        // Mark test as completed in localStorage
        var completedTests = JSON.parse(localStorage.getItem('completedTests') || '[]');
        if (completedTests.indexOf(fullTestId) === -1) {
          completedTests.push(fullTestId);
          localStorage.setItem('completedTests', JSON.stringify(completedTests));
          console.log('Test marked as completed:', fullTestId);
        }
        
        // Redirect to dashboard after completion
        setTimeout(function() {
          window.location.href = '../../dashboard.html';
        }, 1500);
      }
    });
  } else {
    // Fallback: Try to find any button that might be the submit button
    var allButtons = document.querySelectorAll('button');
    for (var i = 0; i < allButtons.length; i++) {
      var btn = allButtons[i];
      var btnText = btn.textContent.toLowerCase();
      if (btnText.includes('submit') || btnText.includes('deliver') || 
          btnText.includes('finish') || btnText.includes('complete')) {
        btn.addEventListener('click', function(e) {
          var testId = window.location.pathname.match(/All-parts-Set(\d+)\.html/);
          if (testId) {
            var setId = testId[1];
            var fullTestId = 'L_AP_' + (setId.length === 1 ? '0' + setId : setId);
            
            var completedTests = JSON.parse(localStorage.getItem('completedTests') || '[]');
            if (completedTests.indexOf(fullTestId) === -1) {
              completedTests.push(fullTestId);
              localStorage.setItem('completedTests', JSON.stringify(completedTests));
              console.log('Test marked as completed:', fullTestId);
            }
            
            setTimeout(function() {
              window.location.href = '../../dashboard.html';
            }, 1500);
          }
        });
        break;
      }
    }
  }
})();
