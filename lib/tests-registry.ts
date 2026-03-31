export interface TestConfig {
  id: string
  title: string
  skill: 'listening' | 'reading' | 'writing' | 'speaking'
  type: string
  file: string
  level: string
  duration: string
  requires?: string
  unlocked?: boolean
  completed?: boolean
  score?: number
}

export const TM_TESTS: TestConfig[] = [
  {
    id: 'L_AP_01', 
    title: 'All Parts - Set 1', 
    skill: 'listening', 
    type: 'all-parts', 
    file: 'Tests/practice/Listening/Full/All-parts-Set1.html',
    level: 'Academic',
    duration: '30'
  },
  {
    id: 'R_AP_01', 
    title: 'Academic Reading - Set 1', 
    skill: 'reading', 
    type: 'academic', 
    file: 'Tests/practice/Reading/Academic/Reading-Set1.html',
    level: 'Academic',
    duration: '60'
  },
  {
    id: 'W_AT_01', 
    title: 'Academic Writing Task 1 & 2', 
    skill: 'writing', 
    type: 'academic', 
    file: 'Tests/practice/Writing/Academic/Writing-Task1-2.html',
    level: 'Academic',
    duration: '60'
  },
  {
    id: 'S_AP_01', 
    title: 'Speaking Test - Set 1', 
    skill: 'speaking', 
    type: 'full-test', 
    file: 'Tests/practice/Speaking/Full/Speaking-Set1.html',
    level: 'Academic/General',
    duration: '15'
  },
  {
    id: 'L_AP_02', title: 'All Parts — Set 2', skill: 'listening', type: 'all-parts', file: 'Tests/practice/Listening/Full/All-parts-Set2.html', level: 'Academic/General', duration: '32 mins', requires: 'L_AP_01' },
  {
    id: 'L_AP_03', title: 'All Parts — Set 3', skill: 'listening', type: 'all-parts', file: 'Tests/practice/Listening/Full/All-parts-Set3.html', level: 'Academic/General', duration: '32 mins', requires: 'L_AP_02' },
  {
    id: 'L_AP_04', title: 'All Parts — Set 4', skill: 'listening', type: 'all-parts', file: 'Tests/practice/Listening/Full/All-parts-Set4.html', level: 'Academic/General', duration: '32 mins', requires: 'L_AP_03' },
  {
    id: 'L_AP_05', title: 'All Parts — Set 5', skill: 'listening', type: 'all-parts', file: 'Tests/practice/Listening/Full/All-parts-Set5.html', level: 'Academic/General', duration: '32 mins', requires: 'L_AP_04' },
  {
    id: 'L_AP_06', title: 'All Parts — Set 6', skill: 'listening', type: 'all-parts', file: 'Tests/practice/Listening/Full/All-parts-Set6.html', level: 'Academic/General', duration: '32 mins', requires: 'L_AP_05' },
  {
    id: 'L_AP_07', title: 'All Parts — Set 7', skill: 'listening', type: 'all-parts', file: 'Tests/practice/Listening/Full/All-parts-Set7.html', level: 'Academic/General', duration: '32 mins', requires: 'L_AP_06' },
  {
    id: 'L_AP_08', title: 'All Parts — Set 8', skill: 'listening', type: 'all-parts', file: 'Tests/practice/Listening/Full/All-parts-Set8.html', level: 'Academic/General', duration: '32 mins', requires: 'L_AP_07' },
  {
    id: 'L_AP_09', title: 'All Parts — Set 9', skill: 'listening', type: 'all-parts', file: 'Tests/practice/Listening/Full/All-parts-Set9.html', level: 'Academic/General', duration: '32 mins', requires: 'L_AP_08' },
  {
    id: 'L_AP_10', title: 'All Parts — Set 10', skill: 'listening', type: 'all-parts', file: 'Tests/practice/Listening/Full/All-parts-Set10.html', level: 'Academic/General', duration: '32 mins', requires: 'L_AP_09' },
  {
    id: 'R_AP_01', 
    title: 'All Passages — Set 1', 
    skill: 'reading', 
    type: 'all-passages', 
    file: 'Tests/practice/Reading/All Passages/All-Passages-Set1.html',
    level: 'Academic',
    duration: '60 mins'
  },
  {
    id: 'R_AP_02', title: 'All Passages — Set 2', skill: 'reading', type: 'all-passages', file: 'Tests/practice/Reading/All Passages/All-Passages-Set2.html', level: 'Academic/General', duration: '60 mins', requires: 'R_AP_01' },
  {
    id: 'R_AP_03', title: 'All Passages — Set 3', skill: 'reading', type: 'all-passages', file: 'Tests/practice/Reading/All Passages/All-Passages-Set3.html', level: 'Academic/General', duration: '60 mins', requires: 'R_AP_02' },
  {
    id: 'R_AP_04', title: 'All Passages — Set 4', skill: 'reading', type: 'all-passages', file: 'Tests/practice/Reading/All Passages/All-Passages-Set4.html', level: 'Academic/General', duration: '60 mins', requires: 'R_AP_03' },
  {
    id: 'R_AP_05', title: 'All Passages — Set 5', skill: 'reading', type: 'all-passages', file: 'Tests/practice/Reading/All Passages/All-Passages-Set5.html', level: 'Academic/General', duration: '60 mins', requires: 'R_AP_04' },
  {
    id: 'R_AP_06', title: 'All Passages — Set 6', skill: 'reading', type: 'all-passages', file: 'Tests/practice/Reading/All Passages/All-Passages-Set6.html', level: 'Academic/General', duration: '60 mins', requires: 'R_AP_05' },
  {
    id: 'R_AP_07', title: 'All Passages — Set 7', skill: 'reading', type: 'all-passages', file: 'Tests/practice/Reading/All Passages/All-Passages-Set7.html', level: 'Academic/General', duration: '60 mins', requires: 'R_AP_06' },
  {
    id: 'R_AP_08', title: 'All Passages — Set 8', skill: 'reading', type: 'all-passages', file: 'Tests/practice/Reading/All Passages/All-Passages-Set8.html', level: 'Academic/General', duration: '60 mins', requires: 'R_AP_07' },
  {
    id: 'R_AP_09', title: 'All Passages — Set 9', skill: 'reading', type: 'all-passages', file: 'Tests/practice/Reading/All Passages/All-Passages-Set9.html', level: 'Academic/General', duration: '60 mins', requires: 'R_AP_08' },
  {
    id: 'R_AP_10', title: 'All Passages — Set 10', skill: 'reading', type: 'all-passages', file: 'Tests/practice/Reading/All Passages/All-Passages-Set10.html', level: 'Academic/General', duration: '60 mins', requires: 'R_AP_09' },
  {
    id: 'W_AT_01', 
    title: 'All Tasks — Set 1', 
    skill: 'writing', 
    type: 'all-tasks', 
    file: 'Tests/practice/Writing/All Tasks/All-Tasks-Set1.html',
    level: 'Academic',
    duration: '60 mins'
  },
  {
    id: 'W_AT_02', title: 'All Tasks — Set 2', skill: 'writing', type: 'all-tasks', file: 'Tests/practice/Writing/All Tasks/All-Tasks-Set2.html', level: 'Academic/General', duration: '60 mins', requires: 'W_AT_01' },
  {
    id: 'W_AT_03', title: 'All Tasks — Set 3', skill: 'writing', type: 'all-tasks', file: 'Tests/practice/Writing/All Tasks/All-Tasks-Set3.html', level: 'Academic/General', duration: '60 mins', requires: 'W_AT_02' },
  {
    id: 'W_AT_04', title: 'All Tasks — Set 4', skill: 'writing', type: 'all-tasks', file: 'Tests/practice/Writing/All Tasks/All-Tasks-Set4.html', level: 'Academic/General', duration: '60 mins', requires: 'W_AT_03' },
  {
    id: 'W_AT_05', title: 'All Tasks — Set 5', skill: 'writing', type: 'all-tasks', file: 'Tests/practice/Writing/All Tasks/All-Tasks-Set5.html', level: 'Academic/General', duration: '60 mins', requires: 'W_AT_04' },
  {
    id: 'W_AT_06', title: 'All Tasks — Set 6', skill: 'writing', type: 'all-tasks', file: 'Tests/practice/Writing/All Tasks/All-Tasks-Set6.html', level: 'Academic/General', duration: '60 mins', requires: 'W_AT_05' },
  {
    id: 'W_AT_07', title: 'All Tasks — Set 7', skill: 'writing', type: 'all-tasks', file: 'Tests/practice/Writing/All Tasks/All-Tasks-Set7.html', level: 'Academic/General', duration: '60 mins', requires: 'W_AT_06' },
  {
    id: 'W_AT_08', title: 'All Tasks — Set 8', skill: 'writing', type: 'all-tasks', file: 'Tests/practice/Writing/All Tasks/All-Tasks-Set8.html', level: 'Academic/General', duration: '60 mins', requires: 'W_AT_07' },
  {
    id: 'W_AT_09', title: 'All Tasks — Set 9', skill: 'writing', type: 'all-tasks', file: 'Tests/practice/Writing/All Tasks/All-Tasks-Set9.html', level: 'Academic/General', duration: '60 mins', requires: 'W_AT_08' },
  {
    id: 'W_AT_10', title: 'All Tasks — Set 10', skill: 'writing', type: 'all-tasks', file: 'Tests/practice/Writing/All Tasks/All-Tasks-Set10.html', level: 'Academic/General', duration: '60 mins', requires: 'W_AT_09' },
  {
    id: 'S_AP_01', 
    title: 'All Parts — Set 1', 
    skill: 'speaking', 
    type: 'all-parts', 
    file: 'Tests/practice/Speaking/All Parts/All-Parts-Set1.html',
    level: 'Academic/General',
    duration: '14 mins'
  },
  {
    id: 'S_AP_02', 
    title: 'All Parts — Set 2', 
    skill: 'speaking', 
    type: 'all-parts', 
    file: 'Tests/practice/Speaking/All Parts/All-Parts-Set2.html',
    level: 'Academic/General',
    duration: '11-14 mins',
    requires: 'S_AP_01' 
  },
  {
    id: 'S_AP_03', 
    title: 'All Parts — Set 3', 
    skill: 'speaking', 
    type: 'all-parts', 
    file: 'Tests/practice/Speaking/All Parts/All-Parts-Set3.html',
    level: 'Academic/General',
    duration: '11-14 mins',
    requires: 'S_AP_02' 
  },
  {
    id: 'S_AP_04', 
    title: 'All Parts — Set 4', 
    skill: 'speaking', 
    type: 'all-parts', 
    file: 'Tests/practice/Speaking/All Parts/All-Parts-Set4.html',
    level: 'Academic/General',
    duration: '11-14 mins',
    requires: 'S_AP_03' 
  },
  {
    id: 'S_AP_05', 
    title: 'All Parts — Set 5', 
    skill: 'speaking', 
    type: 'all-parts', 
    file: 'Tests/practice/Speaking/All Parts/All-Parts-Set5.html',
    level: 'Academic/General',
    duration: '11-14 mins',
    requires: 'S_AP_04' 
  },
  {
    id: 'S_AP_06', 
    title: 'All Parts — Set 6', 
    skill: 'speaking', 
    type: 'all-parts', 
    file: 'Tests/practice/Speaking/All Parts/All-Parts-Set6.html',
    level: 'Academic/General',
    duration: '11-14 mins',
    requires: 'S_AP_05' 
  },
  {
    id: 'S_AP_07', 
    title: 'All Parts — Set 7', 
    skill: 'speaking', 
    type: 'all-parts', 
    file: 'Tests/practice/Speaking/All Parts/All-Parts-Set7.html',
    level: 'Academic/General',
    duration: '11-14 mins',
    requires: 'S_AP_06' 
  },
  {
    id: 'S_AP_08', 
    title: 'All Parts — Set 8', 
    skill: 'speaking', 
    type: 'all-parts', 
    file: 'Tests/practice/Speaking/All Parts/All-Parts-Set8.html',
    level: 'Academic/General',
    duration: '11-14 mins',
    requires: 'S_AP_07' 
  },
  {
    id: 'S_AP_09', 
    title: 'All Parts — Set 9', 
    skill: 'speaking', 
    type: 'all-parts', 
    file: 'Tests/practice/Speaking/All Parts/All-Parts-Set9.html',
    level: 'Academic/General',
    duration: '11-14 mins',
    requires: 'S_AP_08' 
  },
  {
    id: 'S_AP_10', 
    title: 'All Parts — Set 10', 
    skill: 'speaking', 
    type: 'all-parts', 
    file: 'Tests/practice/Speaking/All Parts/All-Parts-Set10.html',
    level: 'Academic/General',
    duration: '11-14 mins',
    requires: 'S_AP_09' 
  }
]

export function getTestById(id: string): TestConfig | undefined {
  return TM_TESTS.find(test => test.id === id)
}

export function getTestsBySkill(skill: TestConfig['skill']): TestConfig[] {
  return TM_TESTS.filter(test => test.skill === skill)
}

export function getTestsByType(skill: TestConfig['skill'], type: string): TestConfig[] {
  return TM_TESTS.filter(test => test.skill === skill && test.type === type)
}
