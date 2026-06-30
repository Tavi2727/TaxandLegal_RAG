// Generates 100 source documents + 100 golden set Q&A pairs as SQL INSERT statements.
// Output: /tmp/seed_docs.sql and /tmp/seed_golden.sql

const fs = require('fs');

// ---- Tax & Legal domain data pools ----
const acts = [
  { title: "Internal Revenue Code of 1986", category: "Income Tax", year: 1986, jurisdiction: "US Federal" },
  { title: "Tax Cuts and Jobs Act", category: "Income Tax", year: 2017, jurisdiction: "US Federal" },
  { title: "Affordable Care Act", category: "Healthcare Tax", year: 2010, jurisdiction: "US Federal" },
  { title: "Inflation Reduction Act", category: "Corporate Tax", year: 2022, jurisdiction: "US Federal" },
  { title: "CHIPS and Science Act", category: "Corporate Tax", year: 2022, jurisdiction: "US Federal" },
  { title: "American Rescue Plan Act", category: "Income Tax", year: 2021, jurisdiction: "US Federal" },
  { title: "CARES Act", category: "Income Tax", year: 2020, jurisdiction: "US Federal" },
  { title: "SECURE Act 2.0", category: "Retirement Tax", year: 2022, jurisdiction: "US Federal" },
  { title: "Tax Reform Act of 1986", category: "Income Tax", year: 1986, jurisdiction: "US Federal" },
  { title: "Bipartisan Budget Act", category: "Corporate Tax", year: 2015, jurisdiction: "US Federal" },
  { title: "Sarbanes-Oxley Act", category: "Corporate Governance", year: 2002, jurisdiction: "US Federal" },
  { title: "Dodd-Frank Wall Street Reform Act", category: "Financial Regulation", year: 2010, jurisdiction: "US Federal" },
  { title: "Bank Secrecy Act", category: "Financial Regulation", year: 1970, jurisdiction: "US Federal" },
  { title: "USA PATRIOT Act", category: "Financial Regulation", year: 2001, jurisdiction: "US Federal" },
  { title: "Foreign Account Tax Compliance Act (FATCA)", category: "International Tax", year: 2010, jurisdiction: "US Federal" },
  { title: "Employee Retirement Income Security Act (ERISA)", category: "ERISA", year: 1974, jurisdiction: "US Federal" },
  { title: "Consolidated Omnibus Budget Reconciliation Act (COBRA)", category: "Healthcare Tax", year: 1985, jurisdiction: "US Federal" },
  { title: "Health Insurance Portability and Accountability Act (HIPAA)", category: "Healthcare Tax", year: 1996, jurisdiction: "US Federal" },
  { title: "Family and Medical Leave Act (FMLA)", category: "Employment Law", year: 1993, jurisdiction: "US Federal" },
  { title: "Fair Labor Standards Act (FLSA)", category: "Employment Law", year: 1938, jurisdiction: "US Federal" },
  { title: "National Labor Relations Act (NLRA)", category: "Employment Law", year: 1935, jurisdiction: "US Federal" },
  { title: "Occupational Safety and Health Act (OSHA)", category: "Employment Law", year: 1970, jurisdiction: "US Federal" },
  { title: "Americans with Disabilities Act (ADA)", category: "Employment Law", year: 1990, jurisdiction: "US Federal" },
  { title: "Civil Rights Act of 1964", category: "Employment Law", year: 1964, jurisdiction: "US Federal" },
  { title: "Age Discrimination in Employment Act (ADEA)", category: "Employment Law", year: 1967, jurisdiction: "US Federal" },
  { title: "Equal Pay Act", category: "Employment Law", year: 1963, jurisdiction: "US Federal" },
  { title: "Immigration and Nationality Act (INA)", category: "Immigration Law", year: 1952, jurisdiction: "US Federal" },
  { title: "Immigration Reform and Control Act (IRCA)", category: "Immigration Law", year: 1986, jurisdiction: "US Federal" },
  { title: "Homeland Security Act", category: "Immigration Law", year: 2002, jurisdiction: "US Federal" },
  { title: "Clean Air Act", category: "Environmental Law", year: 1970, jurisdiction: "US Federal" },
  { title: "Clean Water Act", category: "Environmental Law", year: 1972, jurisdiction: "US Federal" },
  { title: "Comprehensive Environmental Response, Compensation, and Liability Act (CERCLA)", category: "Environmental Law", year: 1980, jurisdiction: "US Federal" },
  { title: "Resource Conservation and Recovery Act (RCRA)", category: "Environmental Law", year: 1976, jurisdiction: "US Federal" },
  { title: "Endangered Species Act", category: "Environmental Law", year: 1973, jurisdiction: "US Federal" },
  { title: "Toxic Substances Control Act (TSCA)", category: "Environmental Law", year: 1976, jurisdiction: "US Federal" },
  { title: "Federal Insecticide, Fungicide, and Rodenticide Act (FIFRA)", category: "Environmental Law", year: 1947, jurisdiction: "US Federal" },
  { title: "Securities Act of 1933", category: "Securities Law", year: 1933, jurisdiction: "US Federal" },
  { title: "Securities Exchange Act of 1934", category: "Securities Law", year: 1934, jurisdiction: "US Federal" },
  { title: "Investment Company Act of 1940", category: "Securities Law", year: 1940, jurisdiction: "US Federal" },
  { title: "Investment Advisers Act of 1940", category: "Securities Law", year: 1940, jurisdiction: "US Federal" },
  { title: "Bankruptcy Code (Title 11)", category: "Bankruptcy Law", year: 1978, jurisdiction: "US Federal" },
  { title: "Bankruptcy Abuse Prevention and Consumer Protection Act", category: "Bankruptcy Law", year: 2005, jurisdiction: "US Federal" },
  { title: "Small Business Job Protection Act", category: "Corporate Tax", year: 1996, jurisdiction: "US Federal" },
  { title: "Taxpayer Relief Act of 1997", category: "Income Tax", year: 1997, jurisdiction: "US Federal" },
  { title: "Economic Growth and Tax Relief Reconciliation Act (EGTRRA)", category: "Income Tax", year: 2001, jurisdiction: "US Federal" },
  { title: "Jobs and Growth Tax Relief Reconciliation Act (JGTRRA)", category: "Income Tax", year: 2003, jurisdiction: "US Federal" },
  { title: "HIRE Act", category: "International Tax", year: 2010, jurisdiction: "US Federal" },
  { title: "PATH Act (Protecting Americans from Tax Hikes)", category: "Income Tax", year: 2015, jurisdiction: "US Federal" },
  { title: "Tax Increase Prevention Act", category: "Income Tax", year: 2014, jurisdiction: "US Federal" },
];

const courtCases = [
  { title: "Marbury v. Madison", category: "Constitutional Law", year: 1803, jurisdiction: "US Federal" },
  { title: "McCulloch v. Maryland", category: "Constitutional Law", year: 1819, jurisdiction: "US Federal" },
  { title: "Gibbons v. Ogden", category: "Constitutional Law", year: 1824, jurisdiction: "US Federal" },
  { title: "Dred Scott v. Sandford", category: "Constitutional Law", year: 1857, jurisdiction: "US Federal" },
  { title: "Plessy v. Ferguson", category: "Civil Rights", year: 1896, jurisdiction: "US Federal" },
  { title: "Lochner v. New York", category: "Employment Law", year: 1905, jurisdiction: "US Federal" },
  { title: "Schenck v. United States", category: "First Amendment", year: 1919, jurisdiction: "US Federal" },
  { title: "Brown v. Board of Education", category: "Civil Rights", year: 1954, jurisdiction: "US Federal" },
  { title: "Baker v. Carr", category: "Constitutional Law", year: 1962, jurisdiction: "US Federal" },
  { title: "Gideon v. Wainwright", category: "Criminal Procedure", year: 1963, jurisdiction: "US Federal" },
  { title: "New York Times Co. v. Sullivan", category: "First Amendment", year: 1964, jurisdiction: "US Federal" },
  { title: "Miranda v. Arizona", category: "Criminal Procedure", year: 1966, jurisdiction: "US Federal" },
  { title: "Katz v. United States", category: "Fourth Amendment", year: 1967, jurisdiction: "US Federal" },
  { title: "Tinker v. Des Moines", category: "First Amendment", year: 1969, jurisdiction: "US Federal" },
  { title: "Roe v. Wade", category: "Constitutional Law", year: 1973, jurisdiction: "US Federal" },
  { title: "United States v. Nixon", category: "Executive Power", year: 1974, jurisdiction: "US Federal" },
  { title: "Regents of the University of California v. Bakke", category: "Civil Rights", year: 1978, jurisdiction: "US Federal" },
  { title: "Texas v. Johnson", category: "First Amendment", year: 1989, jurisdiction: "US Federal" },
  { title: "Planned Parenthood v. Casey", category: "Constitutional Law", year: 1992, jurisdiction: "US Federal" },
  { title: "United States v. Lopez", category: "Constitutional Law", year: 1995, jurisdiction: "US Federal" },
  { title: "Bush v. Gore", category: "Election Law", year: 2000, jurisdiction: "US Federal" },
  { title: "Citizens United v. FEC", category: "First Amendment", year: 2010, jurisdiction: "US Federal" },
  { title: "National Federation of Independent Business v. Sebelius", category: "Healthcare Tax", year: 2012, jurisdiction: "US Federal" },
  { title: "Obergefell v. Hodges", category: "Civil Rights", year: 2015, jurisdiction: "US Federal" },
  { title: "South Dakota v. Wayfair, Inc.", category: "Sales Tax", year: 2018, jurisdiction: "US Federal" },
  { title: "Bostock v. Clayton County", category: "Employment Law", year: 2020, jurisdiction: "US Federal" },
  { title: "Dobbs v. Jackson Women's Health Organization", category: "Constitutional Law", year: 2022, jurisdiction: "US Federal" },
  { title: "Bruen v. New York State Pistol & Rifle Association", category: "Second Amendment", year: 2022, jurisdiction: "US Federal" },
  { title: "Students for Fair Admissions v. Harvard", category: "Civil Rights", year: 2023, jurisdiction: "US Federal" },
  { title: "Loper Bright Enterprises v. Raimondo", category: "Administrative Law", year: 2024, jurisdiction: "US Federal" },
  { title: "Chevron U.S.A. v. Natural Resources Defense Council", category: "Administrative Law", year: 1984, jurisdiction: "US Federal" },
  { title: "Grutter v. Bollinger", category: "Civil Rights", year: 2003, jurisdiction: "US Federal" },
  { title: "District of Columbia v. Heller", category: "Second Amendment", year: 2008, jurisdiction: "US Federal" },
  { title: "McDonald v. City of Chicago", category: "Second Amendment", year: 2010, jurisdiction: "US Federal" },
  { title: "Shelby County v. Holder", category: "Civil Rights", year: 2013, jurisdiction: "US Federal" },
  { title: "Rucho v. Common Cause", category: "Election Law", year: 2019, jurisdiction: "US Federal" },
  { title: "West Virginia v. EPA", category: "Environmental Law", year: 2022, jurisdiction: "US Federal" },
  { title: "303 Creative LLC v. Elenis", category: "First Amendment", year: 2023, jurisdiction: "US Federal" },
  { title: "Moore v. Harper", category: "Election Law", year: 2023, jurisdiction: "US Federal" },
  { title: "Allen v. Milligan", category: "Civil Rights", year: 2023, jurisdiction: "US Federal" },
  { title: "Biden v. Nebraska", category: "Administrative Law", year: 2023, jurisdiction: "US Federal" },
];

const pocs = [
  { title: "POV: The Future of US Corporate Taxation", category: "Corporate Tax", year: 2024, jurisdiction: "US Federal" },
  { title: "POV: Minimum Tax and Global Competitiveness", category: "Corporate Tax", year: 2023, jurisdiction: "US Federal" },
  { title: "POV: R&D Capitalization Under Section 174", category: "Corporate Tax", year: 2023, jurisdiction: "US Federal" },
  { title: "POV: The State of Estate Planning After TCJA", category: "Estate Tax", year: 2024, jurisdiction: "US Federal" },
  { title: "POV: Crypto Asset Reporting and Form 1099-DA", category: "Digital Assets", year: 2024, jurisdiction: "US Federal" },
  { title: "POV: The Inflation Reduction Act's Clean Energy Credits", category: "Energy Tax", year: 2023, jurisdiction: "US Federal" },
  { title: "POV: Transfer Pricing in the Digital Economy", category: "International Tax", year: 2024, jurisdiction: "US Federal" },
  { title: "POV: GILTI and the Pillar Two Framework", category: "International Tax", year: 2023, jurisdiction: "US Federal" },
  { title: "POV: SALT Cap Workarounds and Pass-Through Entities", category: "State Tax", year: 2024, jurisdiction: "US Federal" },
  { title: "POV: Remote Work and Nexus After Wayfair", category: "State Tax", year: 2023, jurisdiction: "US Federal" },
];

// ---- Helpers ----
function genContent(title, docType, category, year) {
  const intro = `${title} is a ${docType === 'act' ? 'federal statute' : docType === 'court_judgement' ? 'judicial decision' : 'professional viewpoint'} in the area of ${category}, originating in ${year}. `;
  const body = `This document addresses key provisions, interpretations, and implications relevant to ${category.toLowerCase()} practice in the United States. It establishes principles that practitioners, taxpayers, and courts rely upon when analyzing ${category.toLowerCase()} matters. The full text includes statutory language, judicial reasoning, and analytical commentary covering scope, applicability, exceptions, and procedural requirements. Key sections discuss definitions, substantive rules, compliance obligations, enforcement mechanisms, and interaction with other legal authorities. Practitioners should consult this document alongside current regulations, subsequent amendments, and interpretive guidance issued by the relevant agency or court.`;
  return intro + body;
}

function genSummary(title, docType, category, year) {
  const t = docType === 'act' ? 'statute' : docType === 'court_judgement' ? 'case' : 'viewpoint';
  return `${title} (${year}) is a ${t} addressing ${category.toLowerCase()} under US Federal jurisdiction. It defines core obligations, exceptions, and procedural rules that govern ${category.toLowerCase()} analysis. The document is frequently cited in matters involving compliance, enforcement, and interpretive disputes within this domain.`;
}

function genCitations(title, category, year) {
  return JSON.stringify([
    { type: 'statute', ref: `26 U.S.C. § ${1000 + (year % 9000)}` },
    { type: 'regulation', ref: `Treas. Reg. § 1.${year % 1000}-${(year % 90) + 10}` },
    { type: 'case', ref: `${title.split(' v.')[0]} v. Commissioner, ${year} T.C. ${100 + (year % 800)}` },
  ]);
}

function genRelated(idx, total) {
  const rels = [];
  for (let i = 0; i < 2; i++) {
    const r = (idx + (i + 1) * 7) % total;
    if (r !== idx) rels.push({ doc_index: r, relation: i === 0 ? 'cites' : 'related' });
  }
  return JSON.stringify(rels);
}

function genKeywords(title, category) {
  const base = category
    .toLowerCase()
    .split(/[\s/]+/)
    .filter(w => w.length > 3);

  const titleWords = title
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .split(' ')
    .filter(w => w.length > 3)
    .slice(0, 4);

  const words = [...new Set([...base, ...titleWords])];

  return `ARRAY[${words.map(w => `'${w}'`).join(',')}]`;
}

// ---- Build 100 documents ----
const allDocs = [];
acts.forEach((a, i) => allDocs.push({ ...a, doc_type: 'act', idx: i }));
courtCases.forEach((c, i) => allDocs.push({ ...c, doc_type: 'court_judgement', idx: acts.length + i }));
pocs.forEach((p, i) => allDocs.push({ ...p, doc_type: 'pov', idx: acts.length + courtCases.length + i }));

const TOTAL = allDocs.length; // 100

function sqlEscape(s) { return s.replace(/'/g, "''"); }

let docSql = 'INSERT INTO documents (title, doc_type, category, jurisdiction, year, content, summary, citations, related_docs, keywords, page_count) VALUES\n';
const docValues = allDocs.map((d, i) => {
  const content = genContent(d.title, d.doc_type, d.category, d.year);
  const summary = genSummary(d.title, d.doc_type, d.category, d.year);
  const citations = genCitations(d.title, d.category, d.year);
  const related = genRelated(i, TOTAL);
  const keywords = genKeywords(d.title, d.category);
  const pageCount = 3 + (i % 12);
  return `('${sqlEscape(d.title)}', '${d.doc_type}', '${sqlEscape(d.category)}', '${sqlEscape(d.jurisdiction)}', ${d.year}, '${sqlEscape(content)}', '${sqlEscape(summary)}', '${sqlEscape(citations)}'::jsonb, '${sqlEscape(related)}'::jsonb, ${keywords}, ${pageCount})`;
});
docSql += docValues.join(',\n') + ';';
fs.writeFileSync('seed_docs.sql', docSql);
console.log('Wrote seed_docs.sql with', TOTAL, 'documents');

// ---- Build 100 golden set Q&A pairs ----
const searchTypes = ['keyword', 'vector', 'hybrid', 'graph_rag', 'page_index'];
const difficulties = ['easy', 'medium', 'hard'];

function genQA(i) {
  const doc = allDocs[i % TOTAL];
  const st = searchTypes[i % searchTypes.length];
  const diff = difficulties[i % 3];
  const queries = [
    `What does ${doc.title} establish regarding ${doc.category.toLowerCase()}?`,
    `Under ${doc.title}, what are the key compliance obligations?`,
    `How does ${doc.title} define the scope of ${doc.category.toLowerCase()}?`,
    `What exceptions apply under ${doc.title}?`,
    `What is the procedural requirement established by ${doc.title}?`,
    `How does ${doc.title} interact with other ${doc.category.toLowerCase()} authorities?`,
    `What enforcement mechanisms does ${doc.title} provide?`,
    `What is the significance of ${doc.title} for ${doc.category.toLowerCase()} practice?`,
    `What definitions are provided in ${doc.title}?`,
    `How should practitioners interpret ${doc.title}?`,
  ];
  const answers = [
    `${doc.title} establishes the core framework for ${doc.category.toLowerCase()} matters, defining obligations, scope, and exceptions that practitioners must apply. It is a ${doc.doc_type === 'act' ? 'statute' : doc.doc_type === 'court_judgement' ? 'judicial decision' : 'professional viewpoint'} from ${doc.year}.`,
    `Under ${doc.title}, compliance requires adherence to the substantive rules and procedural requirements set forth in the document. Key obligations include meeting definitional thresholds and following the prescribed enforcement mechanisms.`,
    `${doc.title} defines the scope of ${doc.category.toLowerCase()} by establishing who is covered, what activities are regulated, and the boundaries of applicability. The document provides specific definitions and exceptions.`,
    `Exceptions under ${doc.title} apply where the substantive rules carve out specific circumstances, such as de minimis thresholds, jurisdictional limits, or categorical exclusions recognized in the ${doc.category.toLowerCase()} domain.`,
    `${doc.title} prescribes specific procedural steps including filing, notice, and review requirements that must be followed to invoke or comply with its provisions.`,
    `${doc.title} interacts with other ${doc.category.toLowerCase()} authorities by supplementing, modifying, or interpreting existing rules. Practitioners must read it alongside related statutes, regulations, and case law.`,
    `Enforcement under ${doc.title} is carried out through the mechanisms established in the document, which may include penalties, judicial review, and agency oversight.`,
    `${doc.title} is significant for ${doc.category.toLowerCase()} practice because it clarifies, expands, or constrains the rules that practitioners apply when advising clients or litigating disputes.`,
    `${doc.title} provides definitions for key terms used throughout the ${doc.category.toLowerCase()} framework, ensuring consistent interpretation across applications.`,
    `Practitioners should interpret ${doc.title} by considering its text, purpose, and the interpretive guidance issued by the relevant authority, while accounting for subsequent amendments and case law.`,
  ];
  return {
    query: queries[i % queries.length],
    answer: answers[i % answers.length],
    search_type: st,
    difficulty: diff,
    category: doc.category,
    doc_index: i % TOTAL,
  };
}

let goldenSql = `INSERT INTO golden_set (query, answer, source_doc_ids, search_type, difficulty, category)
SELECT
  q.query, q.answer, ARRAY(
    SELECT id FROM documents WHERE title = q.source_title LIMIT 1
  ),
  q.search_type, q.difficulty, q.category
FROM (
  VALUES\n`;

const goldenValues = [];
for (let i = 0; i < 100; i++) {
  const qa = genQA(i);
  const sourceTitle = allDocs[qa.doc_index].title;
  goldenValues.push(
    `('${sqlEscape(qa.query)}', '${sqlEscape(qa.answer)}', '${sqlEscape(sourceTitle)}', '${qa.search_type}', '${qa.difficulty}', '${sqlEscape(qa.category)}')`
  );
}
goldenSql += goldenValues.join(',\n') + '\n) AS q(query, answer, source_title, search_type, difficulty, category);';
fs.writeFileSync('seed_golden.sql', goldenSql);
console.log('Wrote seed_golden.sql with 100 golden set entries');
