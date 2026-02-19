/**
 * Page registry — assembles the PAGES array from individual page files.
 *
 * Each page file (js/pages/page-NN.js) registers itself into DIME_PAGES.
 * This file collects them into the ordered PAGES array that app.js uses.
 *
 * To add a new page:
 *   1. Create js/pages/page-NN.js
 *   2. Add a <script> tag for it in index.html (before this file)
 *   3. Add 'NN' to PAGE_ORDER below
 */

/* Global map populated by individual page-NN.js files */
var DIME_PAGES = DIME_PAGES || {};

var PAGE_ORDER = [
  '01', '02', '03', '04', '05', '06', '07', '08', '09', '10',
  '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
  '21', '22', '23', '24', '25', '26', '27', '28', '29', '30',
  'EX01', 'EX02', 'EX03', 'EX04', 'EX05', 'EX06', 'EX07', 'EX08', 'EX09', 'EX10',
  'EX11', 'EX12', 'EX13', 'EX14', 'EX15', 'EX16', 'EX17', 'EX18', 'EX19', 'EX20',
  'EX21', 'EX22', 'EX23', 'EX24', 'EX25', 'EX26', 'EX27', 'EX28', 'EX29', 'EX30',
  'EX31', 'EX32', 'EX33', 'EX34', 'EX35'
];

var PAGES = [];
for (var i = 0; i < PAGE_ORDER.length; i++) {
  var id = PAGE_ORDER[i];
  if (DIME_PAGES[id]) {
    PAGES.push(DIME_PAGES[id]);
  }
}
