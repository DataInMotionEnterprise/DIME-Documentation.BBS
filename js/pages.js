/**
 * Page registry — assembles the PAGES array from individual page files.
 *
 * Each page file (js/pages/page-CONNN.js, page-EXNN.js, page-REFNN.js)
 * registers itself into DIME_PAGES.
 * This file collects them into the ordered PAGES array that app.js uses.
 *
 * To add a new page:
 *   1. Create js/pages/page-CONNN.js (or EXNN / REFNN)
 *   2. Add a <script> tag for it in index.html (before this file)
 *   3. Add 'CONNN' to PAGE_ORDER below
 */

/* Global map populated by individual page-*.js files */
var DIME_PAGES = DIME_PAGES || {};

var PAGE_ORDER = [
  'CON01', 'CON02', 'CON03', 'CON04', 'CON05', 'CON06', 'CON07', 'CON08', 'CON09', 'CON10',
  'CON11', 'CON12', 'CON13', 'CON14', 'CON15', 'CON16', 'CON17', 'CON18', 'CON19', 'CON20',
  'CON21', 'CON22', 'CON23', 'CON24', 'CON25', 'CON26', 'CON27', 'CON28', 'CON29', 'CON30',
  'EX01', 'EX02', 'EX03', 'EX04', 'EX05', 'EX06', 'EX07', 'EX08', 'EX09', 'EX10',
  'EX11', 'EX12', 'EX13', 'EX14', 'EX15', 'EX16', 'EX17', 'EX18', 'EX19', 'EX20',
  'EX21', 'EX22', 'EX23', 'EX24', 'EX25', 'EX26', 'EX27', 'EX28', 'EX29', 'EX30',
  'EX31', 'EX32', 'EX33', 'EX34', 'EX35',
  'REFIN', 'REFOUT',
  'REF01', 'REF02', 'REF03', 'REF04', 'REF05', 'REF06', 'REF07', 'REF08', 'REF09', 'REF10',
  'REF11', 'REF12', 'REF13', 'REF14', 'REF15', 'REF16', 'REF17', 'REF18', 'REF19', 'REF20',
  'REF21', 'REF22', 'REF23', 'REF24', 'REF25', 'REF26', 'REF27', 'REF28', 'REF29', 'REF30',
  'REF31', 'REF32', 'REF33', 'REF34', 'REF35', 'REF36', 'REF37', 'REF38', 'REF39', 'REF40',
  'REF41', 'REF42'
];

var PAGES = [];
for (var i = 0; i < PAGE_ORDER.length; i++) {
  var id = PAGE_ORDER[i];
  if (DIME_PAGES[id]) {
    PAGES.push(DIME_PAGES[id]);
  }
}
