/* ===== 유틸 ===== */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/** 값 -> number 또는 NaN */
function toNum(v){
    const n = typeof v === 'number' ? v : parseFloat(String(v).trim());
    return Number.isFinite(n) ? n : NaN;
}
/** 빈칸인지(=숫자가 아닌지) */
function isEmptyNumber(n){ return Number.isNaN(n); }
/** 소수 자리수 깔끔하게 */
function neat(n){
    if (!Number.isFinite(n)) return '';
    // 정수면 그대로, 아니면 최대 6자리까지 반올림
    return Number.isInteger(n) ? String(n) : String(parseFloat(n.toFixed(6)));
}

/** A:B = C:D 에서 네 값 중 정확히 하나만 비어있을 때 계산 */
function solveRatio({a,b,c,d}){
    const A = toNum(a), B = toNum(b), C = toNum(c), D = toNum(d);
    const empty = [A,B,C,D].map(isEmptyNumber).reduce((acc, v) => acc + (v?1:0), 0);
    if (empty === 0) return { type:'all-filled' };
    if (empty > 1)  return { type:'need-3' };

    if (isEmptyNumber(A)){
        if (B === 0 || D === 0) return { type:'invalid' };
        return { type:'ok', target:'a', value: (B*C)/D };
    }
    if (isEmptyNumber(B)){
        if (A === 0 || C === 0) return { type:'invalid' };
        return { type:'ok', target:'b', value: (A*D)/C };
    }
    if (isEmptyNumber(C)){
        if (B === 0) return { type:'invalid' };
        return { type:'ok', target:'c', value: (A*D)/B };
    }
    if (isEmptyNumber(D)){
        if (A === 0) return { type:'invalid' };
        return { type:'ok', target:'d', value: (B*C)/A };
    }
    return { type:'error' };
}

/* ===== DOM 바인딩 ===== */
const form = $('#ratio-form');
const inputA = form.elements['a'];
const inputB = form.elements['b'];
const inputC = form.elements['c'];
const inputD = form.elements['d'];

const btnOK   = $('#result');
const btnReset= $('#reset');
const chips   = $$('#ratio .chip');
const box     = $('#ratiocal');

/* 로드 시 살짝 스크롤(모바일 주소창 감추기 느낌) */
window.addEventListener('load', () => {
    setTimeout(() => { try { scrollTo(0,1); } catch(e){} }, 0);
});

/* OK 버튼 클릭 -> 계산 */
btnOK.addEventListener('click', () => {
    const res = solveRatio({
        a: inputA.value, b: inputB.value, c: inputC.value, d: inputD.value
    });

    if (res.type === 'ok'){
        const v = neat(res.value);
        if (res.target === 'a') inputA.value = v;
        if (res.target === 'b') inputB.value = v;
        if (res.target === 'c') inputC.value = v;
        if (res.target === 'd') inputD.value = v;
    } else if (res.type === 'all-filled'){
        alert('You have filled in all four fields! Leave one blank to calculate. 🙂\nYou can use the [Clear] button above to reset.');
    } else if (res.type === 'need-3'){
        alert('Please enter exactly 3 fields. The remaining 1 field will be calculated for you.');
    } else {
        alert('Please check your input values. Division by zero is not allowed.');
    }
});

/* Esc = Reset, Enter = OK */
box.addEventListener('keydown', (e) => {
    if (e.key === 'Enter'){
        e.preventDefault();
        btnOK.click();
    } else if (e.key === 'Escape'){
        e.preventDefault();
        btnReset.click();
    }
});

/* 빠른 액션(칩)들: 이벤트 위임 없이 각자 바인딩 */
chips.forEach(chip => {
    chip.addEventListener('click', () => {
        const act = chip.getAttribute('data-action');
        const asp = chip.getAttribute('data-aspect');
        const tgt = chip.getAttribute('data-target');

        if (act === 'clear-cd'){
            inputC.value = ''; inputD.value = '';
            inputC.focus();
            return;
        }
        if (act === 'clear-dc'){
            inputC.value = ''; inputD.value = '';
            inputD.focus();
            return;
        }

        if (asp){
            // asp 예: "16:9"
            const [w,h] = asp.split(':').map(s=>parseFloat(s));
            if (!Number.isFinite(w) || !Number.isFinite(h) || w<=0 || h<=0) return;

            inputA.value = neat(w);
            inputB.value = neat(h);
            inputC.value = '';
            inputD.value = '';
            if (tgt === 'c') inputC.focus();
            else inputD.focus();
        }
    });
});

