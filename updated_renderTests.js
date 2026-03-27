// ─── UPDATED renderTests FUNCTION ─────────────────────────────────────────────
// Fixed version that properly handles drill-down tests from TM_TESTS array
function renderTests() {
  var grid = document.getElementById('testSeqGrid');
  if (!grid) return;

  var skill = (tmState && tmState.skill) ? tmState.skill : 'all';
  var qtype = (tmState && tmState.questionType) ? tmState.questionType : 'all';

  // ── FILTER PASS 1: by section (skill) ─────────────────────────
  // 'all' → Full Tests mode (4-module sequential cards)
  if (skill === 'all') {
    var html = '';
    for (var n = 1; n <= TOTAL_TESTS; n++) {
      var testKey = 'test' + n;
      var unlocked = isTestUnlocked(n);
      var allDone = getCompletedCount(testKey) === 4;
      var pct = (getCompletedCount(testKey) / 4) * 100;

      var cardClass = 'test-seq-card' + (unlocked ? '' : ' locked-test');
      var clickAttr = unlocked
        ? ' onclick="tmLaunchTest(\'full\',' + n + ',null,\'' + testKey + '\')" style="cursor:pointer;"'
        : '';

      var badge = unlocked
        ? (allDone
            ? '<span class="ts-unlock-badge">' + CHECK_SVG + ' Completed</span>'
            : '<span class="ts-unlock-badge">' + PLAY_SVG + ' Unlocked</span>')
        : '<span class="ts-lock-badge">' + LOCK_SVG + ' Locked</span>';

      var desc = allDone
        ? 'All four modules completed. Excellent work!'
        : (unlocked
            ? 'Master all four skills — Listening, Reading, Writing & Speaking — to unlock Test ' + (n + 1) + '.'
            : 'Complete all modules of Test ' + (n - 1) + ' to unlock this level.');

      var modulesHtml = '';
      TEST_MODULES.forEach(function(mod) {
        var status = (userProgress[testKey] && userProgress[testKey][mod.key]) || 'not-started';
        var done = (status === 'completed');
        var indicator = done
          ? '<span class="ts-mod-check">' + CHECK_SVG + '</span>'
          : '<span class="ts-mod-pending"></span>';
        modulesHtml +=
          '<div class="ts-module">' +
            '<div class="ts-mod-left">' +
              '<span class="ts-mod-dot" style="background:' + mod.color + '"></span>' +
              '<span class="ts-mod-name">' + mod.label + '</span>' +
            '</div>' +
            indicator +
          '</div>';
      });

      var btnHtml = unlocked
        ? '<button class="ts-action-btn" onclick="event.stopPropagation();tmLaunchTest(\'full\',' + n + ',null,\'' + testKey + '\')">' + PLAY_SVG + ' ' + (allDone ? 'Review Test ' + n : 'Continue Test ' + n) + '</button>'
        : '<button class="ts-action-btn" disabled style="background:var(--brd);color:var(--muted);cursor:not-allowed;">' + LOCK_SVG + ' Locked</button>';

      html +=
        '<div class="' + cardClass + '"' + clickAttr + ' data-test-id="' + testKey + '" style="animation-delay:' + ((n - 1) * 0.06) + 's">' +
          '<div class="ts-header"><span class="ts-number">Test ' + n + '</span>' + badge + '</div>' +
          '<div class="ts-title">Full Practice Test ' + n + '</div>' +
          '<div class="ts-desc">' + desc + '</div>' +
          '<div class="ts-prog-header"><span class="ts-prog-label">Modules completed</span><span class="ts-prog-count">' + getCompletedCount(testKey) + ' / 4</span></div>' +
          '<div class="ts-track"><div class="ts-fill" style="width:' + pct + '%"></div></div>' +
          '<div class="ts-modules">' + modulesHtml + '</div>' +
          btnHtml +
        '</div>';
    }
  } else {
    // ── Drill-Down mode: filter pass 1 = skill, filter pass 2 = qtype ──
    var skillMeta = (typeof TM_SKILL_META !== 'undefined' && TM_SKILL_META[skill]) || {};
    var skillColor = skillMeta.color || '#1C6758';

    // FILTER PASS 2: resolve which question types to render
    var allTypesForSkill = (typeof TM_QUESTION_TYPES !== 'undefined' && TM_QUESTION_TYPES[skill]) || [];

    var typesToRender;
    if (qtype === 'all') {
      // No sub-type filter — show ALL types for this skill
      typesToRender = allTypesForSkill;
    } else {
      // Specific sub-type selected — filter strictly to matching type
      typesToRender = allTypesForSkill.filter(function(t) { return t.key === qtype; });
    }

    // ── Empty state when no type matches the double-filter ────────
    if (typesToRender.length === 0) {
      var skillLabel = skillMeta.label || skill;
      var qtLabel = qtype;
      if (qtype !== 'all') {
        var found = allTypesForSkill.find ? allTypesForSkill.find(function(t) { return t.key === qtype; }) : null;
        qtLabel = found ? found.label : qtype;
      }
      grid.innerHTML =
        '<div class="tm-empty">' +
          '<div class="tm-empty-icon">📭</div>' +
          '<div class="tm-empty-msg">No tests found for this criteria.</div>' +
          '<div style="margin-top:8px;font-size:12px;color:var(--muted);">Section: <strong>' + escHtml(skillLabel) + '</strong> · Type: <strong>' + escHtml(qtLabel) + '</strong></div>' +
        '</div>';
      return;
    }

    var html = '';
    typesToRender.forEach(function(typeObj) {
      var tKey = typeObj.key;
      
      // 🔥 DYNAMIC FILTERING: Only render tests that exist in TM_TESTS
      var matchingTests = TM_TESTS.filter(function(test) {
        return test.skill === skill && test.type === tKey;
      });

      // Only render cards for tests that actually exist in TM_TESTS
      matchingTests.forEach(function(test, index) {
        var testId = test.id;
        
        // 🔥 IMPROVED PROGRESS CHECKING: Handle both old and new structures
        var isDone = false;
        if (userProgress[testId] && typeof userProgress[testId] === 'object') {
          // New structure: { testId: { status: 'completed', score: 85, ... } }
          isDone = userProgress[testId].status === 'completed';
        } else if (userProgress[testId] === 'completed') {
          // Simple structure: { testId: 'completed' }
          isDone = true;
        }
        
        // 🔥 SIMPLIFIED UNLOCKING: Drill-down tests are always unlocked
        var isDrillUnlocked = true;
        
        var pct2 = isDone ? 100 : 0;
        var cardClass2 = 'test-seq-card' + (isDrillUnlocked ? '' : ' locked-test');
        
        // 🔥 CLEAN NAVIGATION: Use actual test.id and test.file
        var clickAttr2 = isDrillUnlocked
          ? ' onclick="tmLaunchTest(\'' + testId + '\')" style="cursor:pointer;"'
          : '';

        var badge2 = isDrillUnlocked
          ? (isDone
              ? '<span class="ts-unlock-badge">' + CHECK_SVG + ' Done</span>'
              : '<span class="ts-unlock-badge">' + PLAY_SVG + ' Unlocked</span>')
          : '<span class="ts-lock-badge">' + LOCK_SVG + ' Locked</span>';

        // 🔥 DYNAMIC CONTENT: Use actual test data
        var desc2 = isDone
          ? 'Completed! Great work on ' + escHtml(test.title) + '.'
          : 'Practice ' + escHtml(test.title) + ' — ' + test.level + ' level, ' + test.duration + '.';

        var modulesHtml2 =
          '<div class="ts-module" style="grid-column:span 2;">' +
            '<div class="ts-mod-left"><span class="ts-mod-dot" style="background:' + skillColor + '"></span><span class="ts-mod-name">' + escHtml(test.title) + '</span></div>' +
            (isDone ? '<span class="ts-mod-check">' + CHECK_SVG + '</span>' : '<span class="ts-mod-pending"></span>') +
          '</div>';

        // 🔥 CLEAN BUTTON: Use test.title and proper navigation
        var btnHtml2 = isDrillUnlocked
          ? '<button class="ts-action-btn" style="background:' + skillColor + '" onclick="event.stopPropagation();tmLaunchTest(\'' + testId + '\')">' + PLAY_SVG + ' ' + (isDone ? 'Redo' : 'Start') + ' ' + escHtml(test.title) + '</button>'
          : '<button class="ts-action-btn" disabled style="background:var(--brd);color:var(--muted);cursor:not-allowed;">' + LOCK_SVG + ' Locked</button>';

        html +=
          '<div class="' + cardClass2 + '"' + clickAttr2 + ' data-test-id="' + testId + '" style="animation-delay:' + (index * 0.06) + 's">' +
            '<div class="ts-header"><span class="ts-number">' + escHtml(typeObj.label) + '</span>' + badge2 + '</div>' +
            '<div class="ts-title">' + escHtml(test.title) + '</div>' +
            '<div class="ts-desc">' + desc2 + '</div>' +
            '<div class="ts-prog-header"><span class="ts-prog-label">Progress</span><span class="ts-prog-count" style="color:' + skillColor + '">' + (isDone ? '1' : '0') + ' / 1</span></div>' +
            '<div class="ts-track"><div class="ts-fill" style="width:' + pct2 + '%;background:' + skillColor + '"></div></div>' +
            '<div class="ts-modules">' + modulesHtml2 + '</div>' +
            btnHtml2 +
          '</div>';
      });
    });

    if (!html) {
      html = '<div class="tm-empty"><div class="tm-empty-icon">🎯</div><div class="tm-empty-msg">No matching drills found.</div></div>';
    }
  }

  grid.innerHTML = html;
}

// ─── UPDATED tmLaunchTest FUNCTION ─────────────────────────────────────────────
// Handles both full tests (4 parameters) and drill-down tests (1 parameter)
function tmLaunchTest(skillOrTestId, testNumber, qtype, testId) {
  // Check if this is a drill-down test (single parameter = testId)
  if (arguments.length === 1) {
    testId = skillOrTestId;
    var test = TM_TESTS.find(function(t) { 
      return t.id === testId; 
    });
    
    if (test && test.file) {
      // 🔥 CLEAN NAVIGATION: Direct file path from TM_TESTS
      window.location.href = test.file;
      return;
    } else {
      showToast('Drill-down test not found: ' + testId);
      return;
    }
  }
  
  // Handle full tests (old parameter structure)
  var skill = skillOrTestId;
  var label = skill === 'full'
    ? 'Full Practice Test ' + testNumber
    : escHtml(skill) + (qtype ? ' · ' + escHtml(qtype) : '') + ' — Set ' + testNumber;

  // Find test in TM_TESTS array (for drill-down tests)
  var test = TM_TESTS.find(function(t) { 
    return t.id === testId; 
  });

  if (test && test.file) {
    // Navigate to test file
    window.location.href = test.file;
  } else {
    // Fallback for full tests or when test not found
    showToast('Test not found: ' + testId);
  }
}

// ─── PROGRESS TRACKING HELPERS ─────────────────────────────────────────────
// These functions help manage progress for both full tests and drill-down tests

// Mark a drill-down test as completed
function markDrillDownTestCompleted(testId, score = null) {
  if (!userProgress[testId]) {
    userProgress[testId] = {};
  }
  userProgress[testId].status = 'completed';
  if (score !== null) {
    userProgress[testId].score = score;
  }
  userProgress[testId].completedAt = new Date().toISOString();
  
  // Save to backend
  saveUserProgress();
  renderTests();
}

// Check if a drill-down test is completed
function isDrillDownTestCompleted(testId) {
  if (userProgress[testId] && typeof userProgress[testId] === 'object') {
    return userProgress[testId].status === 'completed';
  } else if (userProgress[testId] === 'completed') {
    return true;
  }
  return false;
}
