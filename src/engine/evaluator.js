// ════════════════════════════════════════════════════════════
//  MemViz — Expression Evaluator
// ════════════════════════════════════════════════════════════

export function evalExpr(raw, vars) {
  if (raw === undefined || raw === null) return undefined;
  let e = String(raw).trim().replace(/;$/, '').trim();
  if (!e) return undefined;
  // string literals
  if ((e[0] === '"' && e[e.length - 1] === '"') || (e[0] === "'" && e[e.length - 1] === "'")) return e.slice(1, -1);
  // booleans
  if (e === 'true' || e === 'True' || e === 'TRUE') return true;
  if (e === 'false' || e === 'False' || e === 'FALSE') return false;
  if (e === 'null' || e === 'NULL' || e === 'None' || e === 'nullptr') return null;
  // numbers
  if (/^-?\d+(\.\d+)?[fFdDlL]?$/.test(e)) return parseFloat(e);
  // new Foo(val)
  const nm = e.match(/^new\s+\w+\((.+)\)/);
  if (nm) return evalExpr(nm[1], vars);
  // substitute vars
  const keys = (vars || []).slice().sort((a, b) => b.name.length - a.name.length);
  let s = e;
  keys.forEach(v => {
    if (typeof v.value === 'number' || typeof v.value === 'boolean') {
      s = s.replace(new RegExp('\\b' + v.name + '\\b', 'g'), v.value);
    }
  });
  try {
    const r = Function('"use strict";return(' + s + ')')();
    if (r !== undefined && r !== null && typeof r !== 'object') return r;
  } catch (_) {}
  return e;
}

export function typeClass(t) {
  if (!t) return 'auto';
  const l = t.toLowerCase().replace(/[*&\s]/g, '');
  if (['int', 'long', 'short', 'uint32_t', 'int32_t', 'size_t', 'uint64_t', 'byte', 'sbyte', 'uint', 'ulong', 'ushort', 'integer'].includes(l)) return 'int';
  if (['float', 'double', 'real', 'decimal'].includes(l)) return 'float';
  if (['bool', 'boolean'].includes(l)) return 'bool';
  if (l.includes('string') || l === 'str') return 'string';
  if (l === 'char') return 'char';
  if (l.includes('*') || l.includes('ptr')) return 'pointer';
  return 'auto';
}
