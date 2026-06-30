const fs = require('fs');
let sql = fs.readFileSync('seed_docs.sql','utf8');
// Simple approach: find all '["...","..."]'::text[] patterns and convert
// Pattern: '[...]'::text[] where [...] contains quoted strings
sql = sql.replace(/'\[("[^"]*"(,"[^"]*")*)\]'::text\[\]/g, (match, inner) => {
  // Extract quoted strings from inner
  const items = [];
  const re = /"([^"]*)"/g;
  let m;
  while ((m = re.exec(inner)) !== null) items.push(m[1]);
  return "'{" + items.join(',') + "}'::text[]";
});
fs.writeFileSync('seed_docs_fixed.sql', sql);
const fixed = sql.match(/'\{[^}]*\}'::text\[\]/g);
console.log('Fixed arrays:', fixed ? fixed.length : 0);
const unfixed = sql.match(/'\[[^\]]*\]'::text\[\]/g);
console.log('Unfixed arrays:', unfixed ? unfixed.length : 0);
if (fixed && fixed.length > 0) console.log('Sample:', fixed[0]);
