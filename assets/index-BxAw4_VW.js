(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))n(e);new MutationObserver(e=>{for(const i of e)if(i.type==="childList")for(const a of i.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function s(e){const i={};return e.integrity&&(i.integrity=e.integrity),e.referrerPolicy&&(i.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?i.credentials="include":e.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(e){if(e.ep)return;e.ep=!0;const i=s(e);fetch(e.href,i)}})();document.querySelector("#app").innerHTML=`
  <div>
    <h1>Countdown Timer</h1>
    <p id="timer-display"></p>
    <div id="timer-inputs">
        <div class="dial-container">
            <div class="dial">
                <div class="dial-display" id="hours-display">00</div>
            </div>
            <div class="dial-label">Hours</div>
        </div>
        <div class="dial-separator"></div>
        <div class="dial-container">
            <div class="dial">
                <div class="dial-display" id="minutes-display">01</div>
            </div>
            <div class="dial-label">Minutes</div>
        </div>
        <div class="dial-separator"></div>
        <div class="dial-container">
            <div class="dial">
                <div class="dial-display" id="seconds-display">30</div>
            </div>
            <div class="dial-label">Seconds</div>
        </div>
    </div>
    <button id="start-btn">Start</button>
  </div>
`;const v=document.querySelector("#start-btn"),f=document.querySelector("#timer-display"),D=document.querySelector("#timer-inputs"),d={hours:0,minutes:1,seconds:0},q={hours:document.querySelector("#hours-display"),minutes:document.querySelector("#minutes-display"),seconds:document.querySelector("#seconds-display")};function p(t){q[t].textContent=String(d[t]).padStart(2,"0")}function A(){for(const t of Object.keys(d))p(t)}let C=!1,M,T,u=null;const I=15;let L=0,b=0,h=0,m=null;function x(t,o){c||t.target.classList.contains("dial-btn")||(C=!0,u=o,M="touches"in t?t.touches[0].clientY:t.clientY,T=d[o],b=M,L=performance.now(),h=0,m!==null&&(cancelAnimationFrame(m),m=null),document.body.style.cursor="ns-resize",D.style.pointerEvents="none",t.preventDefault(),window.addEventListener("mousemove",y),window.addEventListener("touchmove",y,{passive:!1}),window.addEventListener("mouseup",g),window.addEventListener("touchend",g))}function y(t){if(!C||!u)return;t.preventDefault();const o="touches"in t?t.touches[0].clientY:t.clientY,s=M-o,n=Math.floor(s/I);let e=T+n;const i=u;i==="minutes"||i==="seconds"?e=Math.max(0,Math.min(59,e)):e=Math.max(0,Math.min(24,e)),d[i]!==e&&(d[i]=e,p(i));const a=performance.now(),l=b-o,r=a-L;r>0&&(h=l/r),b=o,L=a}function g(){C=!1,document.body.style.cursor="default",D.style.pointerEvents="auto",window.removeEventListener("mousemove",y),window.removeEventListener("touchmove",y),window.removeEventListener("mouseup",g),window.removeEventListener("touchend",g),u&&Math.abs(h)>.05&&F(u,h),u=null}function F(t,o){let s=d[t],n=o*10;const e=.92,i=.7,a=()=>{(t==="minutes"||t==="seconds")&&Math.abs(n)>.1&&Math.abs(s%5-5*Math.round(s/5))<1&&(n*=i),s+=n,t==="minutes"||t==="seconds"?(s<0&&(s=0,n=0),s>59&&(s=59,n=0)):(s<0&&(s=0,n=0),s>24&&(s=24,n=0));const l=Math.round(s);if(d[t]!==l&&(d[t]=l,p(t)),n*=e,Math.abs(n)>.1)m=requestAnimationFrame(a);else{if(t==="minutes"||t==="seconds"){const r=l%5;if(r!==0&&Math.abs(r)<2){const S=Math.round(l/5)*5;d[t]=Math.max(0,Math.min(59,S)),p(t)}}m=null}};m=requestAnimationFrame(a)}Object.entries(q).forEach(([t,o])=>{const s=o.parentElement;s.addEventListener("mousedown",n=>x(n,t)),s.addEventListener("touchstart",n=>x(n,t),{passive:!1})});let c;function E(t){D.classList.toggle("disabled",!t)}v.addEventListener("click",()=>{c?(clearInterval(c),c=void 0,f.textContent="",E(!0),v.textContent="Start"):N()});function N(){const{hours:t,minutes:o,seconds:s}=d,n=t*3600+o*60+s;if(n<=0){f.textContent="Please set a time.";return}const e=n,i=Date.now()+n*1e3;E(!1),v.textContent="Cancel";const a=()=>{const l=i-Date.now();if(l<=0){clearInterval(c),c=void 0,f.textContent="Time's up!",E(!0),v.textContent="Start";return}const r=Math.round(l/1e3),S=Math.floor(r/3600),O=Math.floor(r%3600/60),Y=r%60;let w="";e>=3600&&(w+=`${String(S).padStart(2,"0")}:`),w+=`${String(O).padStart(2,"0")}:${String(Y).padStart(2,"0")}`,f.textContent=w};a(),c=setInterval(a,250)}A();
