(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const r of n)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function t(n){const r={};return n.integrity&&(r.integrity=n.integrity),n.referrerPolicy&&(r.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?r.credentials="include":n.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(n){if(n.ep)return;n.ep=!0;const r=t(n);fetch(n.href,r)}})();/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const xl="185",Qn={ROTATE:0,DOLLY:1,PAN:2},Zn={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},Sd=0,oc=1,Td=2,Vr=1,wd=2,Ps=3,Bi=0,Yt=1,Mi=2,Oi=0,es=1,ac=2,lc=3,cc=4,Ad=5,yn=100,Rd=101,Cd=102,Pd=103,Ld=104,Nd=200,Dd=201,Id=202,Ud=203,Ea=204,Sa=205,Fd=206,Od=207,kd=208,Bd=209,zd=210,Hd=211,Gd=212,Vd=213,Wd=214,Ta=0,wa=1,Aa=2,rs=3,Ra=4,Ca=5,Pa=6,La=7,po=0,Xd=1,qd=2,Si=0,Qh=1,eu=2,tu=3,iu=4,nu=5,su=6,ru=7,hc="attached",$d="detached",ou=300,Sn=301,os=302,Lo=303,No=304,mo=306,Mn=1e3,ti=1001,Na=1002,Ut=1003,Yd=1004,tr=1005,Tt=1006,Do=1007,Fi=1008,ei=1009,au=1010,lu=1011,Hs=1012,vl=1013,wi=1014,ui=1015,zi=1016,yl=1017,bl=1018,Gs=1020,cu=35902,hu=35899,uu=1021,du=1022,ai=1023,Hi=1026,En=1027,fu=1028,Ml=1029,Tn=1030,El=1031,Sl=1033,Wr=33776,Xr=33777,qr=33778,$r=33779,Da=35840,Ia=35841,Ua=35842,Fa=35843,Oa=36196,ka=37492,Ba=37496,za=37488,Ha=37489,Zr=37490,Ga=37491,Va=37808,Wa=37809,Xa=37810,qa=37811,$a=37812,Ya=37813,Ka=37814,Za=37815,Ja=37816,ja=37817,Qa=37818,el=37819,tl=37820,il=37821,nl=36492,sl=36494,rl=36495,ol=36283,al=36284,Jr=36285,ll=36286,Vs=2300,cl=2301,Io=2302,hl=2303,uc=2400,dc=2401,fc=2402,Kd=2500,Zd=3200,jr=0,Jd=1,nn="",ht="srgb",Qr="srgb-linear",eo="linear",tt="srgb",Ln=7680,pc=519,jd=512,Qd=513,ef=514,Tl=515,tf=516,nf=517,wl=518,sf=519,mc=35044,gc="300 es",Ei=2e3,Ws=2001;function rf(s){for(let e=s.length-1;e>=0;--e)if(s[e]>=65535)return!0;return!1}function of(s){return ArrayBuffer.isView(s)&&!(s instanceof DataView)}function Xs(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function af(){const s=Xs("canvas");return s.style.display="block",s}const _c={};function xc(...s){const e="THREE."+s.shift();console.log(e,...s)}function pu(s){const e=s[0];if(typeof e=="string"&&e.startsWith("TSL:")){const t=s[1];t&&t.isStackTrace?s[0]+=" "+t.getLocation():s[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return s}function Le(...s){s=pu(s);const e="THREE."+s.shift();{const t=s[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...s)}}function We(...s){s=pu(s);const e="THREE."+s.shift();{const t=s[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...s)}}function ts(...s){const e=s.join(" ");e in _c||(_c[e]=!0,Le(...s))}function lf(s,e,t){return new Promise(function(i,n){function r(){switch(s.clientWaitSync(e,s.SYNC_FLUSH_COMMANDS_BIT,0)){case s.WAIT_FAILED:n();break;case s.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:i()}}setTimeout(r,t)})}const cf={[Ta]:wa,[Aa]:Pa,[Ra]:La,[rs]:Ca,[wa]:Ta,[Pa]:Aa,[La]:Ra,[Ca]:rs};class an{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){const i=this._listeners;return i===void 0?!1:i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){const i=this._listeners;if(i===void 0)return;const n=i[e];if(n!==void 0){const r=n.indexOf(t);r!==-1&&n.splice(r,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const i=t[e.type];if(i!==void 0){e.target=this;const n=i.slice(0);for(let r=0,o=n.length;r<o;r++)n[r].call(this,e);e.target=null}}}const kt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let vc=1234567;const Fs=Math.PI/180,as=180/Math.PI;function ln(){const s=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(kt[s&255]+kt[s>>8&255]+kt[s>>16&255]+kt[s>>24&255]+"-"+kt[e&255]+kt[e>>8&255]+"-"+kt[e>>16&15|64]+kt[e>>24&255]+"-"+kt[t&63|128]+kt[t>>8&255]+"-"+kt[t>>16&255]+kt[t>>24&255]+kt[i&255]+kt[i>>8&255]+kt[i>>16&255]+kt[i>>24&255]).toLowerCase()}function qe(s,e,t){return Math.max(e,Math.min(t,s))}function Al(s,e){return(s%e+e)%e}function hf(s,e,t,i,n){return i+(s-e)*(n-i)/(t-e)}function uf(s,e,t){return s!==e?(t-s)/(e-s):0}function Os(s,e,t){return(1-t)*s+t*e}function df(s,e,t,i){return Os(s,e,1-Math.exp(-t*i))}function ff(s,e=1){return e-Math.abs(Al(s,e*2)-e)}function pf(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e),s*s*(3-2*s))}function mf(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e),s*s*s*(s*(s*6-15)+10))}function gf(s,e){return s+Math.floor(Math.random()*(e-s+1))}function _f(s,e){return s+Math.random()*(e-s)}function xf(s){return s*(.5-Math.random())}function vf(s){s!==void 0&&(vc=s);let e=vc+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function yf(s){return s*Fs}function bf(s){return s*as}function Mf(s){return(s&s-1)===0&&s!==0}function Ef(s){return Math.pow(2,Math.ceil(Math.log(s)/Math.LN2))}function Sf(s){return Math.pow(2,Math.floor(Math.log(s)/Math.LN2))}function Tf(s,e,t,i,n){const r=Math.cos,o=Math.sin,a=r(t/2),c=o(t/2),l=r((e+i)/2),h=o((e+i)/2),d=r((e-i)/2),u=o((e-i)/2),f=r((i-e)/2),g=o((i-e)/2);switch(n){case"XYX":s.set(a*h,c*d,c*u,a*l);break;case"YZY":s.set(c*u,a*h,c*d,a*l);break;case"ZXZ":s.set(c*d,c*u,a*h,a*l);break;case"XZX":s.set(a*h,c*g,c*f,a*l);break;case"YXY":s.set(c*f,a*h,c*g,a*l);break;case"ZYZ":s.set(c*g,c*f,a*h,a*l);break;default:Le("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+n)}}function Yn(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return s/4294967295;case Uint16Array:return s/65535;case Uint8Array:return s/255;case Int32Array:return Math.max(s/2147483647,-1);case Int16Array:return Math.max(s/32767,-1);case Int8Array:return Math.max(s/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function Vt(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return Math.round(s*4294967295);case Uint16Array:return Math.round(s*65535);case Uint8Array:return Math.round(s*255);case Int32Array:return Math.round(s*2147483647);case Int16Array:return Math.round(s*32767);case Int8Array:return Math.round(s*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}const yi={DEG2RAD:Fs,RAD2DEG:as,generateUUID:ln,clamp:qe,euclideanModulo:Al,mapLinear:hf,inverseLerp:uf,lerp:Os,damp:df,pingpong:ff,smoothstep:pf,smootherstep:mf,randInt:gf,randFloat:_f,randFloatSpread:xf,seededRandom:vf,degToRad:yf,radToDeg:bf,isPowerOfTwo:Mf,ceilPowerOfTwo:Ef,floorPowerOfTwo:Sf,setQuaternionFromProperEuler:Tf,normalize:Vt,denormalize:Yn},ql=class ql{constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,i=this.y,n=e.elements;return this.x=n[0]*t+n[3]*i+n[6],this.y=n[1]*t+n[4]*i+n[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=qe(this.x,e.x,t.x),this.y=qe(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=qe(this.x,e,t),this.y=qe(this.y,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(qe(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(qe(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const i=Math.cos(t),n=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*i-o*n+e.x,this.y=r*n+o*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};ql.prototype.isVector2=!0;let De=ql;class Nt{constructor(e=0,t=0,i=0,n=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=n}static slerpFlat(e,t,i,n,r,o,a){let c=i[n+0],l=i[n+1],h=i[n+2],d=i[n+3],u=r[o+0],f=r[o+1],g=r[o+2],v=r[o+3];if(d!==v||c!==u||l!==f||h!==g){let m=c*u+l*f+h*g+d*v;m<0&&(u=-u,f=-f,g=-g,v=-v,m=-m);let p=1-a;if(m<.9995){const T=Math.acos(m),M=Math.sin(T);p=Math.sin(p*T)/M,a=Math.sin(a*T)/M,c=c*p+u*a,l=l*p+f*a,h=h*p+g*a,d=d*p+v*a}else{c=c*p+u*a,l=l*p+f*a,h=h*p+g*a,d=d*p+v*a;const T=1/Math.sqrt(c*c+l*l+h*h+d*d);c*=T,l*=T,h*=T,d*=T}}e[t]=c,e[t+1]=l,e[t+2]=h,e[t+3]=d}static multiplyQuaternionsFlat(e,t,i,n,r,o){const a=i[n],c=i[n+1],l=i[n+2],h=i[n+3],d=r[o],u=r[o+1],f=r[o+2],g=r[o+3];return e[t]=a*g+h*d+c*f-l*u,e[t+1]=c*g+h*u+l*d-a*f,e[t+2]=l*g+h*f+a*u-c*d,e[t+3]=h*g-a*d-c*u-l*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,n){return this._x=e,this._y=t,this._z=i,this._w=n,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const i=e._x,n=e._y,r=e._z,o=e._order,a=Math.cos,c=Math.sin,l=a(i/2),h=a(n/2),d=a(r/2),u=c(i/2),f=c(n/2),g=c(r/2);switch(o){case"XYZ":this._x=u*h*d+l*f*g,this._y=l*f*d-u*h*g,this._z=l*h*g+u*f*d,this._w=l*h*d-u*f*g;break;case"YXZ":this._x=u*h*d+l*f*g,this._y=l*f*d-u*h*g,this._z=l*h*g-u*f*d,this._w=l*h*d+u*f*g;break;case"ZXY":this._x=u*h*d-l*f*g,this._y=l*f*d+u*h*g,this._z=l*h*g+u*f*d,this._w=l*h*d-u*f*g;break;case"ZYX":this._x=u*h*d-l*f*g,this._y=l*f*d+u*h*g,this._z=l*h*g-u*f*d,this._w=l*h*d+u*f*g;break;case"YZX":this._x=u*h*d+l*f*g,this._y=l*f*d+u*h*g,this._z=l*h*g-u*f*d,this._w=l*h*d-u*f*g;break;case"XZY":this._x=u*h*d-l*f*g,this._y=l*f*d-u*h*g,this._z=l*h*g+u*f*d,this._w=l*h*d+u*f*g;break;default:Le("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const i=t/2,n=Math.sin(i);return this._x=e.x*n,this._y=e.y*n,this._z=e.z*n,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,i=t[0],n=t[4],r=t[8],o=t[1],a=t[5],c=t[9],l=t[2],h=t[6],d=t[10],u=i+a+d;if(u>0){const f=.5/Math.sqrt(u+1);this._w=.25/f,this._x=(h-c)*f,this._y=(r-l)*f,this._z=(o-n)*f}else if(i>a&&i>d){const f=2*Math.sqrt(1+i-a-d);this._w=(h-c)/f,this._x=.25*f,this._y=(n+o)/f,this._z=(r+l)/f}else if(a>d){const f=2*Math.sqrt(1+a-i-d);this._w=(r-l)/f,this._x=(n+o)/f,this._y=.25*f,this._z=(c+h)/f}else{const f=2*Math.sqrt(1+d-i-a);this._w=(o-n)/f,this._x=(r+l)/f,this._y=(c+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<1e-8?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(qe(this.dot(e),-1,1)))}rotateTowards(e,t){const i=this.angleTo(e);if(i===0)return this;const n=Math.min(1,t/i);return this.slerp(e,n),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const i=e._x,n=e._y,r=e._z,o=e._w,a=t._x,c=t._y,l=t._z,h=t._w;return this._x=i*h+o*a+n*l-r*c,this._y=n*h+o*c+r*a-i*l,this._z=r*h+o*l+i*c-n*a,this._w=o*h-i*a-n*c-r*l,this._onChangeCallback(),this}slerp(e,t){let i=e._x,n=e._y,r=e._z,o=e._w,a=this.dot(e);a<0&&(i=-i,n=-n,r=-r,o=-o,a=-a);let c=1-t;if(a<.9995){const l=Math.acos(a),h=Math.sin(l);c=Math.sin(c*l)/h,t=Math.sin(t*l)/h,this._x=this._x*c+i*t,this._y=this._y*c+n*t,this._z=this._z*c+r*t,this._w=this._w*c+o*t,this._onChangeCallback()}else this._x=this._x*c+i*t,this._y=this._y*c+n*t,this._z=this._z*c+r*t,this._w=this._w*c+o*t,this.normalize();return this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),n=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(n*Math.sin(e),n*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}const $l=class $l{constructor(e=0,t=0,i=0){this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(yc.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(yc.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,i=this.y,n=this.z,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6]*n,this.y=r[1]*t+r[4]*i+r[7]*n,this.z=r[2]*t+r[5]*i+r[8]*n,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,i=this.y,n=this.z,r=e.elements,o=1/(r[3]*t+r[7]*i+r[11]*n+r[15]);return this.x=(r[0]*t+r[4]*i+r[8]*n+r[12])*o,this.y=(r[1]*t+r[5]*i+r[9]*n+r[13])*o,this.z=(r[2]*t+r[6]*i+r[10]*n+r[14])*o,this}applyQuaternion(e){const t=this.x,i=this.y,n=this.z,r=e.x,o=e.y,a=e.z,c=e.w,l=2*(o*n-a*i),h=2*(a*t-r*n),d=2*(r*i-o*t);return this.x=t+c*l+o*d-a*h,this.y=i+c*h+a*l-r*d,this.z=n+c*d+r*h-o*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,i=this.y,n=this.z,r=e.elements;return this.x=r[0]*t+r[4]*i+r[8]*n,this.y=r[1]*t+r[5]*i+r[9]*n,this.z=r[2]*t+r[6]*i+r[10]*n,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=qe(this.x,e.x,t.x),this.y=qe(this.y,e.y,t.y),this.z=qe(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=qe(this.x,e,t),this.y=qe(this.y,e,t),this.z=qe(this.z,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(qe(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const i=e.x,n=e.y,r=e.z,o=t.x,a=t.y,c=t.z;return this.x=n*c-r*a,this.y=r*o-i*c,this.z=i*a-n*o,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return Uo.copy(this).projectOnVector(e),this.sub(Uo)}reflect(e){return this.sub(Uo.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(qe(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y,n=this.z-e.z;return t*t+i*i+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){const n=Math.sin(t)*e;return this.x=n*Math.sin(i),this.y=Math.cos(t)*e,this.z=n*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),n=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=n,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};$l.prototype.isVector3=!0;let D=$l;const Uo=new D,yc=new Nt,Yl=class Yl{constructor(e,t,i,n,r,o,a,c,l){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,n,r,o,a,c,l)}set(e,t,i,n,r,o,a,c,l){const h=this.elements;return h[0]=e,h[1]=n,h[2]=a,h[3]=t,h[4]=r,h[5]=c,h[6]=i,h[7]=o,h[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,n=t.elements,r=this.elements,o=i[0],a=i[3],c=i[6],l=i[1],h=i[4],d=i[7],u=i[2],f=i[5],g=i[8],v=n[0],m=n[3],p=n[6],T=n[1],M=n[4],x=n[7],b=n[2],S=n[5],A=n[8];return r[0]=o*v+a*T+c*b,r[3]=o*m+a*M+c*S,r[6]=o*p+a*x+c*A,r[1]=l*v+h*T+d*b,r[4]=l*m+h*M+d*S,r[7]=l*p+h*x+d*A,r[2]=u*v+f*T+g*b,r[5]=u*m+f*M+g*S,r[8]=u*p+f*x+g*A,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[1],n=e[2],r=e[3],o=e[4],a=e[5],c=e[6],l=e[7],h=e[8];return t*o*h-t*a*l-i*r*h+i*a*c+n*r*l-n*o*c}invert(){const e=this.elements,t=e[0],i=e[1],n=e[2],r=e[3],o=e[4],a=e[5],c=e[6],l=e[7],h=e[8],d=h*o-a*l,u=a*c-h*r,f=l*r-o*c,g=t*d+i*u+n*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const v=1/g;return e[0]=d*v,e[1]=(n*l-h*i)*v,e[2]=(a*i-n*o)*v,e[3]=u*v,e[4]=(h*t-n*c)*v,e[5]=(n*r-a*t)*v,e[6]=f*v,e[7]=(i*c-l*t)*v,e[8]=(o*t-i*r)*v,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,n,r,o,a){const c=Math.cos(r),l=Math.sin(r);return this.set(i*c,i*l,-i*(c*o+l*a)+o+e,-n*l,n*c,-n*(-l*o+c*a)+a+t,0,0,1),this}scale(e,t){return ts("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Fo.makeScale(e,t)),this}rotate(e){return ts("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Fo.makeRotation(-e)),this}translate(e,t){return ts("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Fo.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,i=e.elements;for(let n=0;n<9;n++)if(t[n]!==i[n])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}};Yl.prototype.isMatrix3=!0;let ke=Yl;const Fo=new ke,bc=new ke().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Mc=new ke().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function wf(){const s={enabled:!0,workingColorSpace:Qr,spaces:{},convert:function(n,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===tt&&(n.r=ki(n.r),n.g=ki(n.g),n.b=ki(n.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(n.applyMatrix3(this.spaces[r].toXYZ),n.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===tt&&(n.r=is(n.r),n.g=is(n.g),n.b=is(n.b))),n},workingToColorSpace:function(n,r){return this.convert(n,this.workingColorSpace,r)},colorSpaceToWorking:function(n,r){return this.convert(n,r,this.workingColorSpace)},getPrimaries:function(n){return this.spaces[n].primaries},getTransfer:function(n){return n===nn?eo:this.spaces[n].transfer},getToneMappingMode:function(n){return this.spaces[n].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(n,r=this.workingColorSpace){return n.fromArray(this.spaces[r].luminanceCoefficients)},define:function(n){Object.assign(this.spaces,n)},_getMatrix:function(n,r,o){return n.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(n){return this.spaces[n].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(n=this.workingColorSpace){return this.spaces[n].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(n,r){return ts("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),s.workingToColorSpace(n,r)},toWorkingColorSpace:function(n,r){return ts("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),s.colorSpaceToWorking(n,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],i=[.3127,.329];return s.define({[Qr]:{primaries:e,whitePoint:i,transfer:eo,toXYZ:bc,fromXYZ:Mc,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:ht},outputColorSpaceConfig:{drawingBufferColorSpace:ht}},[ht]:{primaries:e,whitePoint:i,transfer:tt,toXYZ:bc,fromXYZ:Mc,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:ht}}}),s}const Xe=wf();function ki(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function is(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}let Nn;class Af{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let i;if(e instanceof HTMLCanvasElement)i=e;else{Nn===void 0&&(Nn=Xs("canvas")),Nn.width=e.width,Nn.height=e.height;const n=Nn.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),i=Nn}return i.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Xs("canvas");t.width=e.width,t.height=e.height;const i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);const n=i.getImageData(0,0,e.width,e.height),r=n.data;for(let o=0;o<r.length;o++)r[o]=ki(r[o]/255)*255;return i.putImageData(n,0,0),t}else if(e.data){const t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(ki(t[i]/255)*255):t[i]=ki(t[i]);return{data:t,width:e.width,height:e.height}}else return Le("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let Rf=0;class Rl{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Rf++}),this.uuid=ln(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const i={uuid:this.uuid,url:""},n=this.data;if(n!==null){let r;if(Array.isArray(n)){r=[];for(let o=0,a=n.length;o<a;o++)n[o].isDataTexture?r.push(Oo(n[o].image)):r.push(Oo(n[o]))}else r=Oo(n);i.url=r}return t||(e.images[this.uuid]=i),i}}function Oo(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?Af.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(Le("Texture: Unable to serialize Texture."),{})}let Cf=0;const ko=new D;class Ht extends an{constructor(e=Ht.DEFAULT_IMAGE,t=Ht.DEFAULT_MAPPING,i=ti,n=ti,r=Tt,o=Fi,a=ai,c=ei,l=Ht.DEFAULT_ANISOTROPY,h=nn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Cf++}),this.uuid=ln(),this.name="",this.source=new Rl(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=n,this.magFilter=r,this.minFilter=o,this.anisotropy=l,this.format=a,this.internalFormat=null,this.type=c,this.offset=new De(0,0),this.repeat=new De(1,1),this.center=new De(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ke,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(ko).x}get height(){return this.source.getSize(ko).y}get depth(){return this.source.getSize(ko).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const i=e[t];if(i===void 0){Le(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const n=this[t];if(n===void 0){Le(`Texture.setValues(): property '${t}' does not exist.`);continue}n&&i&&n.isVector2&&i.isVector2||n&&i&&n.isVector3&&i.isVector3||n&&i&&n.isMatrix3&&i.isMatrix3?n.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==ou)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Mn:e.x=e.x-Math.floor(e.x);break;case ti:e.x=e.x<0?0:1;break;case Na:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Mn:e.y=e.y-Math.floor(e.y);break;case ti:e.y=e.y<0?0:1;break;case Na:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Ht.DEFAULT_IMAGE=null;Ht.DEFAULT_MAPPING=ou;Ht.DEFAULT_ANISOTROPY=1;const Kl=class Kl{constructor(e=0,t=0,i=0,n=1){this.x=e,this.y=t,this.z=i,this.w=n}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,n){return this.x=e,this.y=t,this.z=i,this.w=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,i=this.y,n=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*i+o[8]*n+o[12]*r,this.y=o[1]*t+o[5]*i+o[9]*n+o[13]*r,this.z=o[2]*t+o[6]*i+o[10]*n+o[14]*r,this.w=o[3]*t+o[7]*i+o[11]*n+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,n,r;const c=e.elements,l=c[0],h=c[4],d=c[8],u=c[1],f=c[5],g=c[9],v=c[2],m=c[6],p=c[10];if(Math.abs(h-u)<.01&&Math.abs(d-v)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+u)<.1&&Math.abs(d+v)<.1&&Math.abs(g+m)<.1&&Math.abs(l+f+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const M=(l+1)/2,x=(f+1)/2,b=(p+1)/2,S=(h+u)/4,A=(d+v)/4,_=(g+m)/4;return M>x&&M>b?M<.01?(i=0,n=.707106781,r=.707106781):(i=Math.sqrt(M),n=S/i,r=A/i):x>b?x<.01?(i=.707106781,n=0,r=.707106781):(n=Math.sqrt(x),i=S/n,r=_/n):b<.01?(i=.707106781,n=.707106781,r=0):(r=Math.sqrt(b),i=A/r,n=_/r),this.set(i,n,r,t),this}let T=Math.sqrt((m-g)*(m-g)+(d-v)*(d-v)+(u-h)*(u-h));return Math.abs(T)<.001&&(T=1),this.x=(m-g)/T,this.y=(d-v)/T,this.z=(u-h)/T,this.w=Math.acos((l+f+p-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=qe(this.x,e.x,t.x),this.y=qe(this.y,e.y,t.y),this.z=qe(this.z,e.z,t.z),this.w=qe(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=qe(this.x,e,t),this.y=qe(this.y,e,t),this.z=qe(this.z,e,t),this.w=qe(this.w,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(qe(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};Kl.prototype.isVector4=!0;let st=Kl;class Pf extends an{constructor(e=1,t=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Tt,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=i.depth,this.scissor=new st(0,0,e,t),this.scissorTest=!1,this.viewport=new st(0,0,e,t),this.textures=[];const n={width:e,height:t,depth:i.depth},r=new Ht(n),o=i.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(e={}){const t={minFilter:Tt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let n=0,r=this.textures.length;n<r;n++)this.textures[n].image.width=e,this.textures[n].image.height=t,this.textures[n].image.depth=i,this.textures[n].isData3DTexture!==!0&&(this.textures[n].isArrayTexture=this.textures[n].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,i=e.textures.length;t<i;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const n=Object.assign({},e.textures[t].image);this.textures[t].source=new Rl(n)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Ti extends Pf{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}}class mu extends Ht{constructor(e=null,t=1,i=1,n=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:n},this.magFilter=Ut,this.minFilter=Ut,this.wrapR=ti,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class Lf extends Ht{constructor(e=null,t=1,i=1,n=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:n},this.magFilter=Ut,this.minFilter=Ut,this.wrapR=ti,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const fo=class fo{constructor(e,t,i,n,r,o,a,c,l,h,d,u,f,g,v,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,n,r,o,a,c,l,h,d,u,f,g,v,m)}set(e,t,i,n,r,o,a,c,l,h,d,u,f,g,v,m){const p=this.elements;return p[0]=e,p[4]=t,p[8]=i,p[12]=n,p[1]=r,p[5]=o,p[9]=a,p[13]=c,p[2]=l,p[6]=h,p[10]=d,p[14]=u,p[3]=f,p[7]=g,p[11]=v,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new fo().fromArray(this.elements)}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){const t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),i.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();const t=this.elements,i=e.elements,n=1/Dn.setFromMatrixColumn(e,0).length(),r=1/Dn.setFromMatrixColumn(e,1).length(),o=1/Dn.setFromMatrixColumn(e,2).length();return t[0]=i[0]*n,t[1]=i[1]*n,t[2]=i[2]*n,t[3]=0,t[4]=i[4]*r,t[5]=i[5]*r,t[6]=i[6]*r,t[7]=0,t[8]=i[8]*o,t[9]=i[9]*o,t[10]=i[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,i=e.x,n=e.y,r=e.z,o=Math.cos(i),a=Math.sin(i),c=Math.cos(n),l=Math.sin(n),h=Math.cos(r),d=Math.sin(r);if(e.order==="XYZ"){const u=o*h,f=o*d,g=a*h,v=a*d;t[0]=c*h,t[4]=-c*d,t[8]=l,t[1]=f+g*l,t[5]=u-v*l,t[9]=-a*c,t[2]=v-u*l,t[6]=g+f*l,t[10]=o*c}else if(e.order==="YXZ"){const u=c*h,f=c*d,g=l*h,v=l*d;t[0]=u+v*a,t[4]=g*a-f,t[8]=o*l,t[1]=o*d,t[5]=o*h,t[9]=-a,t[2]=f*a-g,t[6]=v+u*a,t[10]=o*c}else if(e.order==="ZXY"){const u=c*h,f=c*d,g=l*h,v=l*d;t[0]=u-v*a,t[4]=-o*d,t[8]=g+f*a,t[1]=f+g*a,t[5]=o*h,t[9]=v-u*a,t[2]=-o*l,t[6]=a,t[10]=o*c}else if(e.order==="ZYX"){const u=o*h,f=o*d,g=a*h,v=a*d;t[0]=c*h,t[4]=g*l-f,t[8]=u*l+v,t[1]=c*d,t[5]=v*l+u,t[9]=f*l-g,t[2]=-l,t[6]=a*c,t[10]=o*c}else if(e.order==="YZX"){const u=o*c,f=o*l,g=a*c,v=a*l;t[0]=c*h,t[4]=v-u*d,t[8]=g*d+f,t[1]=d,t[5]=o*h,t[9]=-a*h,t[2]=-l*h,t[6]=f*d+g,t[10]=u-v*d}else if(e.order==="XZY"){const u=o*c,f=o*l,g=a*c,v=a*l;t[0]=c*h,t[4]=-d,t[8]=l*h,t[1]=u*d+v,t[5]=o*h,t[9]=f*d-g,t[2]=g*d-f,t[6]=a*h,t[10]=v*d+u}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Nf,e,Df)}lookAt(e,t,i){const n=this.elements;return Zt.subVectors(e,t),Zt.lengthSq()===0&&(Zt.z=1),Zt.normalize(),Xi.crossVectors(i,Zt),Xi.lengthSq()===0&&(Math.abs(i.z)===1?Zt.x+=1e-4:Zt.z+=1e-4,Zt.normalize(),Xi.crossVectors(i,Zt)),Xi.normalize(),ir.crossVectors(Zt,Xi),n[0]=Xi.x,n[4]=ir.x,n[8]=Zt.x,n[1]=Xi.y,n[5]=ir.y,n[9]=Zt.y,n[2]=Xi.z,n[6]=ir.z,n[10]=Zt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,n=t.elements,r=this.elements,o=i[0],a=i[4],c=i[8],l=i[12],h=i[1],d=i[5],u=i[9],f=i[13],g=i[2],v=i[6],m=i[10],p=i[14],T=i[3],M=i[7],x=i[11],b=i[15],S=n[0],A=n[4],_=n[8],E=n[12],R=n[1],C=n[5],L=n[9],k=n[13],q=n[2],U=n[6],N=n[10],F=n[14],W=n[3],K=n[7],ne=n[11],se=n[15];return r[0]=o*S+a*R+c*q+l*W,r[4]=o*A+a*C+c*U+l*K,r[8]=o*_+a*L+c*N+l*ne,r[12]=o*E+a*k+c*F+l*se,r[1]=h*S+d*R+u*q+f*W,r[5]=h*A+d*C+u*U+f*K,r[9]=h*_+d*L+u*N+f*ne,r[13]=h*E+d*k+u*F+f*se,r[2]=g*S+v*R+m*q+p*W,r[6]=g*A+v*C+m*U+p*K,r[10]=g*_+v*L+m*N+p*ne,r[14]=g*E+v*k+m*F+p*se,r[3]=T*S+M*R+x*q+b*W,r[7]=T*A+M*C+x*U+b*K,r[11]=T*_+M*L+x*N+b*ne,r[15]=T*E+M*k+x*F+b*se,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[4],n=e[8],r=e[12],o=e[1],a=e[5],c=e[9],l=e[13],h=e[2],d=e[6],u=e[10],f=e[14],g=e[3],v=e[7],m=e[11],p=e[15],T=c*f-l*u,M=a*f-l*d,x=a*u-c*d,b=o*f-l*h,S=o*u-c*h,A=o*d-a*h;return t*(v*T-m*M+p*x)-i*(g*T-m*b+p*S)+n*(g*M-v*b+p*A)-r*(g*x-v*S+m*A)}determinantAffine(){const e=this.elements,t=e[0],i=e[4],n=e[8],r=e[1],o=e[5],a=e[9],c=e[2],l=e[6],h=e[10];return t*(o*h-a*l)-i*(r*h-a*c)+n*(r*l-o*c)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){const n=this.elements;return e.isVector3?(n[12]=e.x,n[13]=e.y,n[14]=e.z):(n[12]=e,n[13]=t,n[14]=i),this}invert(){const e=this.elements,t=e[0],i=e[1],n=e[2],r=e[3],o=e[4],a=e[5],c=e[6],l=e[7],h=e[8],d=e[9],u=e[10],f=e[11],g=e[12],v=e[13],m=e[14],p=e[15],T=t*a-i*o,M=t*c-n*o,x=t*l-r*o,b=i*c-n*a,S=i*l-r*a,A=n*l-r*c,_=h*v-d*g,E=h*m-u*g,R=h*p-f*g,C=d*m-u*v,L=d*p-f*v,k=u*p-f*m,q=T*k-M*L+x*C+b*R-S*E+A*_;if(q===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const U=1/q;return e[0]=(a*k-c*L+l*C)*U,e[1]=(n*L-i*k-r*C)*U,e[2]=(v*A-m*S+p*b)*U,e[3]=(u*S-d*A-f*b)*U,e[4]=(c*R-o*k-l*E)*U,e[5]=(t*k-n*R+r*E)*U,e[6]=(m*x-g*A-p*M)*U,e[7]=(h*A-u*x+f*M)*U,e[8]=(o*L-a*R+l*_)*U,e[9]=(i*R-t*L-r*_)*U,e[10]=(g*S-v*x+p*T)*U,e[11]=(d*x-h*S-f*T)*U,e[12]=(a*E-o*C-c*_)*U,e[13]=(t*C-i*E+n*_)*U,e[14]=(v*M-g*b-m*T)*U,e[15]=(h*b-d*M+u*T)*U,this}scale(e){const t=this.elements,i=e.x,n=e.y,r=e.z;return t[0]*=i,t[4]*=n,t[8]*=r,t[1]*=i,t[5]*=n,t[9]*=r,t[2]*=i,t[6]*=n,t[10]*=r,t[3]*=i,t[7]*=n,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],n=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,n))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const i=Math.cos(t),n=Math.sin(t),r=1-i,o=e.x,a=e.y,c=e.z,l=r*o,h=r*a;return this.set(l*o+i,l*a-n*c,l*c+n*a,0,l*a+n*c,h*a+i,h*c-n*o,0,l*c-n*a,h*c+n*o,r*c*c+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,n,r,o){return this.set(1,i,r,0,e,1,o,0,t,n,1,0,0,0,0,1),this}compose(e,t,i){const n=this.elements,r=t._x,o=t._y,a=t._z,c=t._w,l=r+r,h=o+o,d=a+a,u=r*l,f=r*h,g=r*d,v=o*h,m=o*d,p=a*d,T=c*l,M=c*h,x=c*d,b=i.x,S=i.y,A=i.z;return n[0]=(1-(v+p))*b,n[1]=(f+x)*b,n[2]=(g-M)*b,n[3]=0,n[4]=(f-x)*S,n[5]=(1-(u+p))*S,n[6]=(m+T)*S,n[7]=0,n[8]=(g+M)*A,n[9]=(m-T)*A,n[10]=(1-(u+v))*A,n[11]=0,n[12]=e.x,n[13]=e.y,n[14]=e.z,n[15]=1,this}decompose(e,t,i){const n=this.elements;e.x=n[12],e.y=n[13],e.z=n[14];const r=this.determinantAffine();if(r===0)return i.set(1,1,1),t.identity(),this;let o=Dn.set(n[0],n[1],n[2]).length();const a=Dn.set(n[4],n[5],n[6]).length(),c=Dn.set(n[8],n[9],n[10]).length();r<0&&(o=-o),li.copy(this);const l=1/o,h=1/a,d=1/c;return li.elements[0]*=l,li.elements[1]*=l,li.elements[2]*=l,li.elements[4]*=h,li.elements[5]*=h,li.elements[6]*=h,li.elements[8]*=d,li.elements[9]*=d,li.elements[10]*=d,t.setFromRotationMatrix(li),i.x=o,i.y=a,i.z=c,this}makePerspective(e,t,i,n,r,o,a=Ei,c=!1){const l=this.elements,h=2*r/(t-e),d=2*r/(i-n),u=(t+e)/(t-e),f=(i+n)/(i-n);let g,v;if(c)g=r/(o-r),v=o*r/(o-r);else if(a===Ei)g=-(o+r)/(o-r),v=-2*o*r/(o-r);else if(a===Ws)g=-o/(o-r),v=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=h,l[4]=0,l[8]=u,l[12]=0,l[1]=0,l[5]=d,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=g,l[14]=v,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,i,n,r,o,a=Ei,c=!1){const l=this.elements,h=2/(t-e),d=2/(i-n),u=-(t+e)/(t-e),f=-(i+n)/(i-n);let g,v;if(c)g=1/(o-r),v=o/(o-r);else if(a===Ei)g=-2/(o-r),v=-(o+r)/(o-r);else if(a===Ws)g=-1/(o-r),v=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=h,l[4]=0,l[8]=0,l[12]=u,l[1]=0,l[5]=d,l[9]=0,l[13]=f,l[2]=0,l[6]=0,l[10]=g,l[14]=v,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const t=this.elements,i=e.elements;for(let n=0;n<16;n++)if(t[n]!==i[n])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}};fo.prototype.isMatrix4=!0;let Oe=fo;const Dn=new D,li=new Oe,Nf=new D(0,0,0),Df=new D(1,1,1),Xi=new D,ir=new D,Zt=new D,Ec=new Oe,Sc=new Nt;class fi{constructor(e=0,t=0,i=0,n=fi.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=n}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,n=this._order){return this._x=e,this._y=t,this._z=i,this._order=n,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){const n=e.elements,r=n[0],o=n[4],a=n[8],c=n[1],l=n[5],h=n[9],d=n[2],u=n[6],f=n[10];switch(t){case"XYZ":this._y=Math.asin(qe(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(u,l),this._z=0);break;case"YXZ":this._x=Math.asin(-qe(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-d,r),this._z=0);break;case"ZXY":this._x=Math.asin(qe(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-d,f),this._z=Math.atan2(-o,l)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-qe(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(u,f),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-o,l));break;case"YZX":this._z=Math.asin(qe(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-h,l),this._y=Math.atan2(-d,r)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-qe(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(u,l),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,f),this._y=0);break;default:Le("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return Ec.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Ec,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Sc.setFromEuler(this),this.setFromQuaternion(Sc,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}fi.DEFAULT_ORDER="XYZ";class gu{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let If=0;const Tc=new D,In=new Nt,Ri=new Oe,nr=new D,xs=new D,Uf=new D,Ff=new Nt,wc=new D(1,0,0),Ac=new D(0,1,0),Rc=new D(0,0,1),Cc={type:"added"},Of={type:"removed"},Un={type:"childadded",child:null},Bo={type:"childremoved",child:null};class dt extends an{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:If++}),this.uuid=ln(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=dt.DEFAULT_UP.clone();const e=new D,t=new fi,i=new Nt,n=new D(1,1,1);function r(){i.setFromEuler(t,!1)}function o(){t.setFromQuaternion(i,void 0,!1)}t._onChange(r),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:n},modelViewMatrix:{value:new Oe},normalMatrix:{value:new ke}}),this.matrix=new Oe,this.matrixWorld=new Oe,this.matrixAutoUpdate=dt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=dt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new gu,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return In.setFromAxisAngle(e,t),this.quaternion.multiply(In),this}rotateOnWorldAxis(e,t){return In.setFromAxisAngle(e,t),this.quaternion.premultiply(In),this}rotateX(e){return this.rotateOnAxis(wc,e)}rotateY(e){return this.rotateOnAxis(Ac,e)}rotateZ(e){return this.rotateOnAxis(Rc,e)}translateOnAxis(e,t){return Tc.copy(e).applyQuaternion(this.quaternion),this.position.add(Tc.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(wc,e)}translateY(e){return this.translateOnAxis(Ac,e)}translateZ(e){return this.translateOnAxis(Rc,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Ri.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?nr.copy(e):nr.set(e,t,i);const n=this.parent;this.updateWorldMatrix(!0,!1),xs.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Ri.lookAt(xs,nr,this.up):Ri.lookAt(nr,xs,this.up),this.quaternion.setFromRotationMatrix(Ri),n&&(Ri.extractRotation(n.matrixWorld),In.setFromRotationMatrix(Ri),this.quaternion.premultiply(In.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(We("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Cc),Un.child=e,this.dispatchEvent(Un),Un.child=null):We("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Of),Bo.child=e,this.dispatchEvent(Bo),Bo.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Ri.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Ri.multiply(e.parent.matrixWorld)),e.applyMatrix4(Ri),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Cc),Un.child=e,this.dispatchEvent(Un),Un.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,n=this.children.length;i<n;i++){const o=this.children[i].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);const n=this.children;for(let r=0,o=n.length;r<o;r++)n[r].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(xs,e,Uf),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(xs,Ff,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let i=0,n=t.length;i<n;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let i=0,n=t.length;i<n;i++)t[i].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);const e=this.pivot;if(e!==null){const t=e.x,i=e.y,n=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*i-r[8]*n,r[13]+=i-r[1]*t-r[5]*i-r[9]*n,r[14]+=n-r[2]*t-r[6]*i-r[10]*n}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let i=0,n=t.length;i<n;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t,i=!1){const n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||i)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,i=!0),t===!0){const r=this.children;for(let o=0,a=r.length;o<a;o++)r[o].updateWorldMatrix(!1,!0,i)}}toJSON(e){const t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const n={};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.castShadow===!0&&(n.castShadow=!0),this.receiveShadow===!0&&(n.receiveShadow=!0),this.visible===!1&&(n.visible=!1),this.frustumCulled===!1&&(n.frustumCulled=!1),this.renderOrder!==0&&(n.renderOrder=this.renderOrder),this.static!==!1&&(n.static=this.static),Object.keys(this.userData).length>0&&(n.userData=this.userData),n.layers=this.layers.mask,n.matrix=this.matrix.toArray(),n.up=this.up.toArray(),this.pivot!==null&&(n.pivot=this.pivot.toArray()),this.matrixAutoUpdate===!1&&(n.matrixAutoUpdate=!1),this.morphTargetDictionary!==void 0&&(n.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(n.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(n.type="InstancedMesh",n.count=this.count,n.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(n.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(n.type="BatchedMesh",n.perObjectFrustumCulled=this.perObjectFrustumCulled,n.sortObjects=this.sortObjects,n.drawRanges=this._drawRanges,n.reservedRanges=this._reservedRanges,n.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),n.instanceInfo=this._instanceInfo.map(a=>({...a})),n.availableInstanceIds=this._availableInstanceIds.slice(),n.availableGeometryIds=this._availableGeometryIds.slice(),n.nextIndexStart=this._nextIndexStart,n.nextVertexStart=this._nextVertexStart,n.geometryCount=this._geometryCount,n.maxInstanceCount=this._maxInstanceCount,n.maxVertexCount=this._maxVertexCount,n.maxIndexCount=this._maxIndexCount,n.geometryInitialized=this._geometryInitialized,n.matricesTexture=this._matricesTexture.toJSON(e),n.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(n.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(n.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(n.boundingBox=this.boundingBox.toJSON()));function r(a,c){return a[c.uuid]===void 0&&(a[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?n.background=this.background.toJSON():this.background.isTexture&&(n.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(n.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){n.geometry=r(e.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const c=a.shapes;if(Array.isArray(c))for(let l=0,h=c.length;l<h;l++){const d=c[l];r(e.shapes,d)}else r(e.shapes,c)}}if(this.isSkinnedMesh&&(n.bindMode=this.bindMode,n.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),n.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let c=0,l=this.material.length;c<l;c++)a.push(r(e.materials,this.material[c]));n.material=a}else n.material=r(e.materials,this.material);if(this.children.length>0){n.children=[];for(let a=0;a<this.children.length;a++)n.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){n.animations=[];for(let a=0;a<this.animations.length;a++){const c=this.animations[a];n.animations.push(r(e.animations,c))}}if(t){const a=o(e.geometries),c=o(e.materials),l=o(e.textures),h=o(e.images),d=o(e.shapes),u=o(e.skeletons),f=o(e.animations),g=o(e.nodes);a.length>0&&(i.geometries=a),c.length>0&&(i.materials=c),l.length>0&&(i.textures=l),h.length>0&&(i.images=h),d.length>0&&(i.shapes=d),u.length>0&&(i.skeletons=u),f.length>0&&(i.animations=f),g.length>0&&(i.nodes=g)}return i.object=n,i;function o(a){const c=[];for(const l in a){const h=a[l];delete h.metadata,c.push(h)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){const n=e.children[i];this.add(n.clone())}return this}}dt.DEFAULT_UP=new D(0,1,0);dt.DEFAULT_MATRIX_AUTO_UPDATE=!0;dt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class sn extends dt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const kf={type:"move"};class zo{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new sn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new sn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new D,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new D),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new sn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new D,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new D,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let n=null,r=null,o=null;const a=this._targetRay,c=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){o=!0;for(const v of e.hand.values()){const m=t.getJointPose(v,i),p=this._getHandJoint(l,v);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}const h=l.joints["index-finger-tip"],d=l.joints["thumb-tip"],u=h.position.distanceTo(d.position),f=.02,g=.005;l.inputState.pinching&&u>f+g?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&u<=f-g&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,i),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1,c.eventsEnabled&&c.dispatchEvent({type:"gripUpdated",data:e,target:this})));a!==null&&(n=t.getPose(e.targetRaySpace,i),n===null&&r!==null&&(n=r),n!==null&&(a.matrix.fromArray(n.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,n.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(n.linearVelocity)):a.hasLinearVelocity=!1,n.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(n.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(kf)))}return a!==null&&(a.visible=n!==null),c!==null&&(c.visible=r!==null),l!==null&&(l.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const i=new sn;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}}const _u={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},qi={h:0,s:0,l:0},sr={h:0,s:0,l:0};function Ho(s,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?s+(e-s)*6*t:t<1/2?e:t<2/3?s+(e-s)*6*(2/3-t):s}class Be{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){const n=e;n&&n.isColor?this.copy(n):typeof n=="number"?this.setHex(n):typeof n=="string"&&this.setStyle(n)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=ht){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Xe.colorSpaceToWorking(this,t),this}setRGB(e,t,i,n=Xe.workingColorSpace){return this.r=e,this.g=t,this.b=i,Xe.colorSpaceToWorking(this,n),this}setHSL(e,t,i,n=Xe.workingColorSpace){if(e=Al(e,1),t=qe(t,0,1),i=qe(i,0,1),t===0)this.r=this.g=this.b=i;else{const r=i<=.5?i*(1+t):i+t-i*t,o=2*i-r;this.r=Ho(o,r,e+1/3),this.g=Ho(o,r,e),this.b=Ho(o,r,e-1/3)}return Xe.colorSpaceToWorking(this,n),this}setStyle(e,t=ht){function i(r){r!==void 0&&parseFloat(r)<1&&Le("Color: Alpha component of "+e+" will be ignored.")}let n;if(n=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const o=n[1],a=n[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:Le("Color: Unknown color model "+e)}}else if(n=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=n[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);Le("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=ht){const i=_u[e.toLowerCase()];return i!==void 0?this.setHex(i,t):Le("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=ki(e.r),this.g=ki(e.g),this.b=ki(e.b),this}copyLinearToSRGB(e){return this.r=is(e.r),this.g=is(e.g),this.b=is(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=ht){return Xe.workingToColorSpace(Bt.copy(this),e),Math.round(qe(Bt.r*255,0,255))*65536+Math.round(qe(Bt.g*255,0,255))*256+Math.round(qe(Bt.b*255,0,255))}getHexString(e=ht){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Xe.workingColorSpace){Xe.workingToColorSpace(Bt.copy(this),t);const i=Bt.r,n=Bt.g,r=Bt.b,o=Math.max(i,n,r),a=Math.min(i,n,r);let c,l;const h=(a+o)/2;if(a===o)c=0,l=0;else{const d=o-a;switch(l=h<=.5?d/(o+a):d/(2-o-a),o){case i:c=(n-r)/d+(n<r?6:0);break;case n:c=(r-i)/d+2;break;case r:c=(i-n)/d+4;break}c/=6}return e.h=c,e.s=l,e.l=h,e}getRGB(e,t=Xe.workingColorSpace){return Xe.workingToColorSpace(Bt.copy(this),t),e.r=Bt.r,e.g=Bt.g,e.b=Bt.b,e}getStyle(e=ht){Xe.workingToColorSpace(Bt.copy(this),e);const t=Bt.r,i=Bt.g,n=Bt.b;return e!==ht?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${n.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(n*255)})`}offsetHSL(e,t,i){return this.getHSL(qi),this.setHSL(qi.h+e,qi.s+t,qi.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(qi),e.getHSL(sr);const i=Os(qi.h,sr.h,t),n=Os(qi.s,sr.s,t),r=Os(qi.l,sr.l,t);return this.setHSL(i,n,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,i=this.g,n=this.b,r=e.elements;return this.r=r[0]*t+r[3]*i+r[6]*n,this.g=r[1]*t+r[4]*i+r[7]*n,this.b=r[2]*t+r[5]*i+r[8]*n,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Bt=new Be;Be.NAMES=_u;class Cl extends dt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new fi,this.environmentIntensity=1,this.environmentRotation=new fi,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}const ci=new D,Ci=new D,Go=new D,Pi=new D,Fn=new D,On=new D,Pc=new D,Vo=new D,Wo=new D,Xo=new D,qo=new st,$o=new st,Yo=new st;class oi{constructor(e=new D,t=new D,i=new D){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,n){n.subVectors(i,t),ci.subVectors(e,t),n.cross(ci);const r=n.lengthSq();return r>0?n.multiplyScalar(1/Math.sqrt(r)):n.set(0,0,0)}static getBarycoord(e,t,i,n,r){ci.subVectors(n,t),Ci.subVectors(i,t),Go.subVectors(e,t);const o=ci.dot(ci),a=ci.dot(Ci),c=ci.dot(Go),l=Ci.dot(Ci),h=Ci.dot(Go),d=o*l-a*a;if(d===0)return r.set(0,0,0),null;const u=1/d,f=(l*c-a*h)*u,g=(o*h-a*c)*u;return r.set(1-f-g,g,f)}static containsPoint(e,t,i,n){return this.getBarycoord(e,t,i,n,Pi)===null?!1:Pi.x>=0&&Pi.y>=0&&Pi.x+Pi.y<=1}static getInterpolation(e,t,i,n,r,o,a,c){return this.getBarycoord(e,t,i,n,Pi)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,Pi.x),c.addScaledVector(o,Pi.y),c.addScaledVector(a,Pi.z),c)}static getInterpolatedAttribute(e,t,i,n,r,o){return qo.setScalar(0),$o.setScalar(0),Yo.setScalar(0),qo.fromBufferAttribute(e,t),$o.fromBufferAttribute(e,i),Yo.fromBufferAttribute(e,n),o.setScalar(0),o.addScaledVector(qo,r.x),o.addScaledVector($o,r.y),o.addScaledVector(Yo,r.z),o}static isFrontFacing(e,t,i,n){return ci.subVectors(i,t),Ci.subVectors(e,t),ci.cross(Ci).dot(n)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,n){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[n]),this}setFromAttributeAndIndices(e,t,i,n){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,n),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return ci.subVectors(this.c,this.b),Ci.subVectors(this.a,this.b),ci.cross(Ci).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return oi.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return oi.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,n,r){return oi.getInterpolation(e,this.a,this.b,this.c,t,i,n,r)}containsPoint(e){return oi.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return oi.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const i=this.a,n=this.b,r=this.c;let o,a;Fn.subVectors(n,i),On.subVectors(r,i),Vo.subVectors(e,i);const c=Fn.dot(Vo),l=On.dot(Vo);if(c<=0&&l<=0)return t.copy(i);Wo.subVectors(e,n);const h=Fn.dot(Wo),d=On.dot(Wo);if(h>=0&&d<=h)return t.copy(n);const u=c*d-h*l;if(u<=0&&c>=0&&h<=0)return o=c/(c-h),t.copy(i).addScaledVector(Fn,o);Xo.subVectors(e,r);const f=Fn.dot(Xo),g=On.dot(Xo);if(g>=0&&f<=g)return t.copy(r);const v=f*l-c*g;if(v<=0&&l>=0&&g<=0)return a=l/(l-g),t.copy(i).addScaledVector(On,a);const m=h*g-f*d;if(m<=0&&d-h>=0&&f-g>=0)return Pc.subVectors(r,n),a=(d-h)/(d-h+(f-g)),t.copy(n).addScaledVector(Pc,a);const p=1/(m+v+u);return o=v*p,a=u*p,t.copy(i).addScaledVector(Fn,o).addScaledVector(On,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}class ds{constructor(e=new D(1/0,1/0,1/0),t=new D(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(hi.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(hi.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const i=hi.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const i=e.geometry;if(i!==void 0){const r=i.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,hi):hi.fromBufferAttribute(r,o),hi.applyMatrix4(e.matrixWorld),this.expandByPoint(hi);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),rr.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),rr.copy(i.boundingBox)),rr.applyMatrix4(e.matrixWorld),this.union(rr)}const n=e.children;for(let r=0,o=n.length;r<o;r++)this.expandByObject(n[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,hi),hi.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(vs),or.subVectors(this.max,vs),kn.subVectors(e.a,vs),Bn.subVectors(e.b,vs),zn.subVectors(e.c,vs),$i.subVectors(Bn,kn),Yi.subVectors(zn,Bn),un.subVectors(kn,zn);let t=[0,-$i.z,$i.y,0,-Yi.z,Yi.y,0,-un.z,un.y,$i.z,0,-$i.x,Yi.z,0,-Yi.x,un.z,0,-un.x,-$i.y,$i.x,0,-Yi.y,Yi.x,0,-un.y,un.x,0];return!Ko(t,kn,Bn,zn,or)||(t=[1,0,0,0,1,0,0,0,1],!Ko(t,kn,Bn,zn,or))?!1:(ar.crossVectors($i,Yi),t=[ar.x,ar.y,ar.z],Ko(t,kn,Bn,zn,or))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,hi).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(hi).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Li[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Li[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Li[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Li[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Li[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Li[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Li[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Li[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Li),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const Li=[new D,new D,new D,new D,new D,new D,new D,new D],hi=new D,rr=new ds,kn=new D,Bn=new D,zn=new D,$i=new D,Yi=new D,un=new D,vs=new D,or=new D,ar=new D,dn=new D;function Ko(s,e,t,i,n){for(let r=0,o=s.length-3;r<=o;r+=3){dn.fromArray(s,r);const a=n.x*Math.abs(dn.x)+n.y*Math.abs(dn.y)+n.z*Math.abs(dn.z),c=e.dot(dn),l=t.dot(dn),h=i.dot(dn);if(Math.max(-Math.max(c,l,h),Math.min(c,l,h))>a)return!1}return!0}const Mt=new D,lr=new De;let Bf=0;class ii extends an{constructor(e,t,i=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Bf++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=mc,this.updateRanges=[],this.gpuType=ui,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let n=0,r=this.itemSize;n<r;n++)this.array[e+n]=t.array[i+n];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)lr.fromBufferAttribute(this,t),lr.applyMatrix3(e),this.setXY(t,lr.x,lr.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)Mt.fromBufferAttribute(this,t),Mt.applyMatrix3(e),this.setXYZ(t,Mt.x,Mt.y,Mt.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)Mt.fromBufferAttribute(this,t),Mt.applyMatrix4(e),this.setXYZ(t,Mt.x,Mt.y,Mt.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)Mt.fromBufferAttribute(this,t),Mt.applyNormalMatrix(e),this.setXYZ(t,Mt.x,Mt.y,Mt.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)Mt.fromBufferAttribute(this,t),Mt.transformDirection(e),this.setXYZ(t,Mt.x,Mt.y,Mt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=Yn(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=Vt(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Yn(t,this.array)),t}setX(e,t){return this.normalized&&(t=Vt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Yn(t,this.array)),t}setY(e,t){return this.normalized&&(t=Vt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Yn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Vt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Yn(t,this.array)),t}setW(e,t){return this.normalized&&(t=Vt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=Vt(t,this.array),i=Vt(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,n){return e*=this.itemSize,this.normalized&&(t=Vt(t,this.array),i=Vt(i,this.array),n=Vt(n,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=n,this}setXYZW(e,t,i,n,r){return e*=this.itemSize,this.normalized&&(t=Vt(t,this.array),i=Vt(i,this.array),n=Vt(n,this.array),r=Vt(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=n,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==mc&&(e.usage=this.usage),e}dispose(){this.dispatchEvent({type:"dispose"})}}class xu extends ii{constructor(e,t,i){super(new Uint16Array(e),t,i)}}class vu extends ii{constructor(e,t,i){super(new Uint32Array(e),t,i)}}class je extends ii{constructor(e,t,i){super(new Float32Array(e),t,i)}}const zf=new ds,ys=new D,Zo=new D;class fs{constructor(e=new D,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const i=this.center;t!==void 0?i.copy(t):zf.setFromPoints(e).getCenter(i);let n=0;for(let r=0,o=e.length;r<o;r++)n=Math.max(n,i.distanceToSquared(e[r]));return this.radius=Math.sqrt(n),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;ys.subVectors(e,this.center);const t=ys.lengthSq();if(t>this.radius*this.radius){const i=Math.sqrt(t),n=(i-this.radius)*.5;this.center.addScaledVector(ys,n/i),this.radius+=n}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Zo.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(ys.copy(e.center).add(Zo)),this.expandByPoint(ys.copy(e.center).sub(Zo))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}let Hf=0;const si=new Oe,Jo=new dt,Hn=new D,Jt=new ds,bs=new ds,Pt=new D;class wt extends an{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Hf++}),this.uuid=ln(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(rf(e)?vu:xu)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const r=new ke().getNormalMatrix(e);i.applyNormalMatrix(r),i.needsUpdate=!0}const n=this.attributes.tangent;return n!==void 0&&(n.transformDirection(e),n.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return si.makeRotationFromQuaternion(e),this.applyMatrix4(si),this}rotateX(e){return si.makeRotationX(e),this.applyMatrix4(si),this}rotateY(e){return si.makeRotationY(e),this.applyMatrix4(si),this}rotateZ(e){return si.makeRotationZ(e),this.applyMatrix4(si),this}translate(e,t,i){return si.makeTranslation(e,t,i),this.applyMatrix4(si),this}scale(e,t,i){return si.makeScale(e,t,i),this.applyMatrix4(si),this}lookAt(e){return Jo.lookAt(e),Jo.updateMatrix(),this.applyMatrix4(Jo.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Hn).negate(),this.translate(Hn.x,Hn.y,Hn.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const i=[];for(let n=0,r=e.length;n<r;n++){const o=e[n];i.push(o.x,o.y,o.z||0)}this.setAttribute("position",new je(i,3))}else{const i=Math.min(e.length,t.count);for(let n=0;n<i;n++){const r=e[n];t.setXYZ(n,r.x,r.y,r.z||0)}e.length>t.count&&Le("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new ds);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){We("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new D(-1/0,-1/0,-1/0),new D(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,n=t.length;i<n;i++){const r=t[i];Jt.setFromBufferAttribute(r),this.morphTargetsRelative?(Pt.addVectors(this.boundingBox.min,Jt.min),this.boundingBox.expandByPoint(Pt),Pt.addVectors(this.boundingBox.max,Jt.max),this.boundingBox.expandByPoint(Pt)):(this.boundingBox.expandByPoint(Jt.min),this.boundingBox.expandByPoint(Jt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&We('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new fs);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){We("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new D,1/0);return}if(e){const i=this.boundingSphere.center;if(Jt.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){const a=t[r];bs.setFromBufferAttribute(a),this.morphTargetsRelative?(Pt.addVectors(Jt.min,bs.min),Jt.expandByPoint(Pt),Pt.addVectors(Jt.max,bs.max),Jt.expandByPoint(Pt)):(Jt.expandByPoint(bs.min),Jt.expandByPoint(bs.max))}Jt.getCenter(i);let n=0;for(let r=0,o=e.count;r<o;r++)Pt.fromBufferAttribute(e,r),n=Math.max(n,i.distanceToSquared(Pt));if(t)for(let r=0,o=t.length;r<o;r++){const a=t[r],c=this.morphTargetsRelative;for(let l=0,h=a.count;l<h;l++)Pt.fromBufferAttribute(a,l),c&&(Hn.fromBufferAttribute(e,l),Pt.add(Hn)),n=Math.max(n,i.distanceToSquared(Pt))}this.boundingSphere.radius=Math.sqrt(n),isNaN(this.boundingSphere.radius)&&We('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){We("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=t.position,n=t.normal,r=t.uv;let o=this.getAttribute("tangent");(o===void 0||o.count!==i.count)&&(o=new ii(new Float32Array(4*i.count),4),this.setAttribute("tangent",o));const a=[],c=[];for(let _=0;_<i.count;_++)a[_]=new D,c[_]=new D;const l=new D,h=new D,d=new D,u=new De,f=new De,g=new De,v=new D,m=new D;function p(_,E,R){l.fromBufferAttribute(i,_),h.fromBufferAttribute(i,E),d.fromBufferAttribute(i,R),u.fromBufferAttribute(r,_),f.fromBufferAttribute(r,E),g.fromBufferAttribute(r,R),h.sub(l),d.sub(l),f.sub(u),g.sub(u);const C=1/(f.x*g.y-g.x*f.y);isFinite(C)&&(v.copy(h).multiplyScalar(g.y).addScaledVector(d,-f.y).multiplyScalar(C),m.copy(d).multiplyScalar(f.x).addScaledVector(h,-g.x).multiplyScalar(C),a[_].add(v),a[E].add(v),a[R].add(v),c[_].add(m),c[E].add(m),c[R].add(m))}let T=this.groups;T.length===0&&(T=[{start:0,count:e.count}]);for(let _=0,E=T.length;_<E;++_){const R=T[_],C=R.start,L=R.count;for(let k=C,q=C+L;k<q;k+=3)p(e.getX(k+0),e.getX(k+1),e.getX(k+2))}const M=new D,x=new D,b=new D,S=new D;function A(_){b.fromBufferAttribute(n,_),S.copy(b);const E=a[_];M.copy(E),M.sub(b.multiplyScalar(b.dot(E))).normalize(),x.crossVectors(S,E);const C=x.dot(c[_])<0?-1:1;o.setXYZW(_,M.x,M.y,M.z,C)}for(let _=0,E=T.length;_<E;++_){const R=T[_],C=R.start,L=R.count;for(let k=C,q=C+L;k<q;k+=3)A(e.getX(k+0)),A(e.getX(k+1)),A(e.getX(k+2))}this._transformed=!0}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==t.count)i=new ii(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let u=0,f=i.count;u<f;u++)i.setXYZ(u,0,0,0);const n=new D,r=new D,o=new D,a=new D,c=new D,l=new D,h=new D,d=new D;if(e)for(let u=0,f=e.count;u<f;u+=3){const g=e.getX(u+0),v=e.getX(u+1),m=e.getX(u+2);n.fromBufferAttribute(t,g),r.fromBufferAttribute(t,v),o.fromBufferAttribute(t,m),h.subVectors(o,r),d.subVectors(n,r),h.cross(d),a.fromBufferAttribute(i,g),c.fromBufferAttribute(i,v),l.fromBufferAttribute(i,m),a.add(h),c.add(h),l.add(h),i.setXYZ(g,a.x,a.y,a.z),i.setXYZ(v,c.x,c.y,c.z),i.setXYZ(m,l.x,l.y,l.z)}else for(let u=0,f=t.count;u<f;u+=3)n.fromBufferAttribute(t,u+0),r.fromBufferAttribute(t,u+1),o.fromBufferAttribute(t,u+2),h.subVectors(o,r),d.subVectors(n,r),h.cross(d),i.setXYZ(u+0,h.x,h.y,h.z),i.setXYZ(u+1,h.x,h.y,h.z),i.setXYZ(u+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)Pt.fromBufferAttribute(e,t),Pt.normalize(),e.setXYZ(t,Pt.x,Pt.y,Pt.z)}toNonIndexed(){function e(a,c){const l=a.array,h=a.itemSize,d=a.normalized,u=new l.constructor(c.length*h);let f=0,g=0;for(let v=0,m=c.length;v<m;v++){a.isInterleavedBufferAttribute?f=c[v]*a.data.stride+a.offset:f=c[v]*h;for(let p=0;p<h;p++)u[g++]=l[f++]}return new ii(u,h,d)}if(this.index===null)return Le("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new wt,i=this.index.array,n=this.attributes;for(const a in n){const c=n[a],l=e(c,i);t.setAttribute(a,l)}const r=this.morphAttributes;for(const a in r){const c=[],l=r[a];for(let h=0,d=l.length;h<d;h++){const u=l[h],f=e(u,i);c.push(f)}t.morphAttributes[a]=c}t.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,c=o.length;a<c;a++){const l=o[a];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){const c=this.parameters;for(const l in c)c[l]!==void 0&&(e[l]=c[l]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const i=this.attributes;for(const c in i){const l=i[c];e.data.attributes[c]=l.toJSON(e.data)}const n={};let r=!1;for(const c in this.morphAttributes){const l=this.morphAttributes[c],h=[];for(let d=0,u=l.length;d<u;d++){const f=l[d];h.push(f.toJSON(e.data))}h.length>0&&(n[c]=h,r=!0)}r&&(e.data.morphAttributes=n,e.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(e.data.boundingSphere=a.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const i=e.index;i!==null&&this.setIndex(i.clone());const n=e.attributes;for(const l in n){const h=n[l];this.setAttribute(l,h.clone(t))}const r=e.morphAttributes;for(const l in r){const h=[],d=r[l];for(let u=0,f=d.length;u<f;u++)h.push(d[u].clone(t));this.morphAttributes[l]=h}this.morphTargetsRelative=e.morphTargetsRelative;const o=e.groups;for(let l=0,h=o.length;l<h;l++){const d=o[l];this.addGroup(d.start,d.count,d.materialIndex)}const a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());const c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}}let Gf=0;class Rn extends an{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Gf++}),this.uuid=ln(),this.name="",this.type="Material",this.blending=es,this.side=Bi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Ea,this.blendDst=Sa,this.blendEquation=yn,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Be(0,0,0),this.blendAlpha=0,this.depthFunc=rs,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=pc,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ln,this.stencilZFail=Ln,this.stencilZPass=Ln,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const i=e[t];if(i===void 0){Le(`Material: parameter '${t}' has value of undefined.`);continue}const n=this[t];if(n===void 0){Le(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}n&&n.isColor?n.set(i):n&&n.isVector2&&i&&i.isVector2||n&&n.isEuler&&i&&i.isEuler||n&&n.isVector3&&i&&i.isVector3?n.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==es&&(i.blending=this.blending),this.side!==Bi&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==Ea&&(i.blendSrc=this.blendSrc),this.blendDst!==Sa&&(i.blendDst=this.blendDst),this.blendEquation!==yn&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==rs&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==pc&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Ln&&(i.stencilFail=this.stencilFail),this.stencilZFail!==Ln&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==Ln&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.allowOverride===!1&&(i.allowOverride=!1),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function n(r){const o=[];for(const a in r){const c=r[a];delete c.metadata,o.push(c)}return o}if(t){const r=n(e.textures),o=n(e.images);r.length>0&&(i.textures=r),o.length>0&&(i.images=o)}return i}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Be().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let i=e.normalScale;Array.isArray(i)===!1&&(i=[i,i]),this.normalScale=new De().fromArray(i)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new De().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let i=null;if(t!==null){const n=t.length;i=new Array(n);for(let r=0;r!==n;++r)i[r]=t[r].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}const Ni=new D,jo=new D,cr=new D,Ki=new D,Qo=new D,hr=new D,ea=new D;class go{constructor(e=new D,t=new D(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Ni)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=Ni.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Ni.copy(this.origin).addScaledVector(this.direction,t),Ni.distanceToSquared(e))}distanceSqToSegment(e,t,i,n){jo.copy(e).add(t).multiplyScalar(.5),cr.copy(t).sub(e).normalize(),Ki.copy(this.origin).sub(jo);const r=e.distanceTo(t)*.5,o=-this.direction.dot(cr),a=Ki.dot(this.direction),c=-Ki.dot(cr),l=Ki.lengthSq(),h=Math.abs(1-o*o);let d,u,f,g;if(h>0)if(d=o*c-a,u=o*a-c,g=r*h,d>=0)if(u>=-g)if(u<=g){const v=1/h;d*=v,u*=v,f=d*(d+o*u+2*a)+u*(o*d+u+2*c)+l}else u=r,d=Math.max(0,-(o*u+a)),f=-d*d+u*(u+2*c)+l;else u=-r,d=Math.max(0,-(o*u+a)),f=-d*d+u*(u+2*c)+l;else u<=-g?(d=Math.max(0,-(-o*r+a)),u=d>0?-r:Math.min(Math.max(-r,-c),r),f=-d*d+u*(u+2*c)+l):u<=g?(d=0,u=Math.min(Math.max(-r,-c),r),f=u*(u+2*c)+l):(d=Math.max(0,-(o*r+a)),u=d>0?r:Math.min(Math.max(-r,-c),r),f=-d*d+u*(u+2*c)+l);else u=o>0?-r:r,d=Math.max(0,-(o*u+a)),f=-d*d+u*(u+2*c)+l;return i&&i.copy(this.origin).addScaledVector(this.direction,d),n&&n.copy(jo).addScaledVector(cr,u),f}intersectSphere(e,t){Ni.subVectors(e.center,this.origin);const i=Ni.dot(this.direction),n=Ni.dot(Ni)-i*i,r=e.radius*e.radius;if(n>r)return null;const o=Math.sqrt(r-n),a=i-o,c=i+o;return c<0?null:a<0?this.at(c,t):this.at(a,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){const i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,n,r,o,a,c;const l=1/this.direction.x,h=1/this.direction.y,d=1/this.direction.z,u=this.origin;return l>=0?(i=(e.min.x-u.x)*l,n=(e.max.x-u.x)*l):(i=(e.max.x-u.x)*l,n=(e.min.x-u.x)*l),h>=0?(r=(e.min.y-u.y)*h,o=(e.max.y-u.y)*h):(r=(e.max.y-u.y)*h,o=(e.min.y-u.y)*h),i>o||r>n||((r>i||isNaN(i))&&(i=r),(o<n||isNaN(n))&&(n=o),d>=0?(a=(e.min.z-u.z)*d,c=(e.max.z-u.z)*d):(a=(e.max.z-u.z)*d,c=(e.min.z-u.z)*d),i>c||a>n)||((a>i||i!==i)&&(i=a),(c<n||n!==n)&&(n=c),n<0)?null:this.at(i>=0?i:n,t)}intersectsBox(e){return this.intersectBox(e,Ni)!==null}intersectTriangle(e,t,i,n,r){Qo.subVectors(t,e),hr.subVectors(i,e),ea.crossVectors(Qo,hr);let o=this.direction.dot(ea),a;if(o>0){if(n)return null;a=1}else if(o<0)a=-1,o=-o;else return null;Ki.subVectors(this.origin,e);const c=a*this.direction.dot(hr.crossVectors(Ki,hr));if(c<0)return null;const l=a*this.direction.dot(Qo.cross(Ki));if(l<0||c+l>o)return null;const h=-a*Ki.dot(ea);return h<0?null:this.at(h/o,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class ls extends Rn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Be(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new fi,this.combine=po,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const Lc=new Oe,fn=new go,ur=new fs,Nc=new D,dr=new D,fr=new D,pr=new D,ta=new D,mr=new D,Dc=new D,gr=new D;class Ft extends dt{constructor(e=new wt,t=new ls){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const n=t[i[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=n.length;r<o;r++){const a=n[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){const i=this.geometry,n=i.attributes.position,r=i.morphAttributes.position,o=i.morphTargetsRelative;t.fromBufferAttribute(n,e);const a=this.morphTargetInfluences;if(r&&a){mr.set(0,0,0);for(let c=0,l=r.length;c<l;c++){const h=a[c],d=r[c];h!==0&&(ta.fromBufferAttribute(d,e),o?mr.addScaledVector(ta,h):mr.addScaledVector(ta.sub(t),h))}t.add(mr)}return t}raycast(e,t){const i=this.geometry,n=this.material,r=this.matrixWorld;n!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),ur.copy(i.boundingSphere),ur.applyMatrix4(r),fn.copy(e.ray).recast(e.near),!(ur.containsPoint(fn.origin)===!1&&(fn.intersectSphere(ur,Nc)===null||fn.origin.distanceToSquared(Nc)>(e.far-e.near)**2))&&(Lc.copy(r).invert(),fn.copy(e.ray).applyMatrix4(Lc),!(i.boundingBox!==null&&fn.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,fn)))}_computeIntersections(e,t,i){let n;const r=this.geometry,o=this.material,a=r.index,c=r.attributes.position,l=r.attributes.uv,h=r.attributes.uv1,d=r.attributes.normal,u=r.groups,f=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,v=u.length;g<v;g++){const m=u[g],p=o[m.materialIndex],T=Math.max(m.start,f.start),M=Math.min(a.count,Math.min(m.start+m.count,f.start+f.count));for(let x=T,b=M;x<b;x+=3){const S=a.getX(x),A=a.getX(x+1),_=a.getX(x+2);n=_r(this,p,e,i,l,h,d,S,A,_),n&&(n.faceIndex=Math.floor(x/3),n.face.materialIndex=m.materialIndex,t.push(n))}}else{const g=Math.max(0,f.start),v=Math.min(a.count,f.start+f.count);for(let m=g,p=v;m<p;m+=3){const T=a.getX(m),M=a.getX(m+1),x=a.getX(m+2);n=_r(this,o,e,i,l,h,d,T,M,x),n&&(n.faceIndex=Math.floor(m/3),t.push(n))}}else if(c!==void 0)if(Array.isArray(o))for(let g=0,v=u.length;g<v;g++){const m=u[g],p=o[m.materialIndex],T=Math.max(m.start,f.start),M=Math.min(c.count,Math.min(m.start+m.count,f.start+f.count));for(let x=T,b=M;x<b;x+=3){const S=x,A=x+1,_=x+2;n=_r(this,p,e,i,l,h,d,S,A,_),n&&(n.faceIndex=Math.floor(x/3),n.face.materialIndex=m.materialIndex,t.push(n))}}else{const g=Math.max(0,f.start),v=Math.min(c.count,f.start+f.count);for(let m=g,p=v;m<p;m+=3){const T=m,M=m+1,x=m+2;n=_r(this,o,e,i,l,h,d,T,M,x),n&&(n.faceIndex=Math.floor(m/3),t.push(n))}}}}function Vf(s,e,t,i,n,r,o,a){let c;if(e.side===Yt?c=i.intersectTriangle(o,r,n,!0,a):c=i.intersectTriangle(n,r,o,e.side===Bi,a),c===null)return null;gr.copy(a),gr.applyMatrix4(s.matrixWorld);const l=t.ray.origin.distanceTo(gr);return l<t.near||l>t.far?null:{distance:l,point:gr.clone(),object:s}}function _r(s,e,t,i,n,r,o,a,c,l){s.getVertexPosition(a,dr),s.getVertexPosition(c,fr),s.getVertexPosition(l,pr);const h=Vf(s,e,t,i,dr,fr,pr,Dc);if(h){const d=new D;oi.getBarycoord(Dc,dr,fr,pr,d),n&&(h.uv=oi.getInterpolatedAttribute(n,a,c,l,d,new De)),r&&(h.uv1=oi.getInterpolatedAttribute(r,a,c,l,d,new De)),o&&(h.normal=oi.getInterpolatedAttribute(o,a,c,l,d,new D),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));const u={a,b:c,c:l,normal:new D,materialIndex:0};oi.getNormal(dr,fr,pr,u.normal),h.face=u,h.barycoord=d}return h}const Ms=new st,Ic=new st,Uc=new st,Wf=new st,Fc=new Oe,xr=new D,ia=new fs,Oc=new Oe,na=new go;class Xf extends Ft{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=hc,this.bindMatrix=new Oe,this.bindMatrixInverse=new Oe,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){const e=this.geometry;this.boundingBox===null&&(this.boundingBox=new ds),this.boundingBox.makeEmpty();const t=e.getAttribute("position");for(let i=0;i<t.count;i++)this.getVertexPosition(i,xr),this.boundingBox.expandByPoint(xr)}computeBoundingSphere(){const e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new fs),this.boundingSphere.makeEmpty();const t=e.getAttribute("position");for(let i=0;i<t.count;i++)this.getVertexPosition(i,xr),this.boundingSphere.expandByPoint(xr)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){const i=this.material,n=this.matrixWorld;i!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),ia.copy(this.boundingSphere),ia.applyMatrix4(n),e.ray.intersectsSphere(ia)!==!1&&(Oc.copy(n).invert(),na.copy(e.ray).applyMatrix4(Oc),!(this.boundingBox!==null&&na.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,na)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){const e=new st,t=this.geometry.attributes.skinWeight;for(let i=0,n=t.count;i<n;i++){e.fromBufferAttribute(t,i);const r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(i,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===hc?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===$d?this.bindMatrixInverse.copy(this.bindMatrix).invert():Le("SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){const i=this.skeleton,n=this.geometry;Ic.fromBufferAttribute(n.attributes.skinIndex,e),Uc.fromBufferAttribute(n.attributes.skinWeight,e),t.isVector4?(Ms.copy(t),t.set(0,0,0,0)):(Ms.set(...t,1),t.set(0,0,0)),Ms.applyMatrix4(this.bindMatrix);for(let r=0;r<4;r++){const o=Uc.getComponent(r);if(o!==0){const a=Ic.getComponent(r);Fc.multiplyMatrices(i.bones[a].matrixWorld,i.boneInverses[a]),t.addScaledVector(Wf.copy(Ms).applyMatrix4(Fc),o)}}return t.isVector4&&(t.w=Ms.w),t.applyMatrix4(this.bindMatrixInverse)}}class yu extends dt{constructor(){super(),this.isBone=!0,this.type="Bone"}}class to extends Ht{constructor(e=null,t=1,i=1,n,r,o,a,c,l=Ut,h=Ut,d,u){super(null,o,a,c,l,h,n,r,d,u),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const kc=new Oe,qf=new Oe;class Pl{constructor(e=[],t=[]){this.uuid=ln(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){const e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){Le("Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let i=0,n=this.bones.length;i<n;i++)this.boneInverses.push(new Oe)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){const i=new Oe;this.bones[e]&&i.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(i)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){const i=this.bones[e];i&&i.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){const i=this.bones[e];i&&(i.parent&&i.parent.isBone?(i.matrix.copy(i.parent.matrixWorld).invert(),i.matrix.multiply(i.matrixWorld)):i.matrix.copy(i.matrixWorld),i.matrix.decompose(i.position,i.quaternion,i.scale))}}update(){const e=this.bones,t=this.boneInverses,i=this.boneMatrices,n=this.boneTexture;for(let r=0,o=e.length;r<o;r++){const a=e[r]?e[r].matrixWorld:qf;kc.multiplyMatrices(a,t[r]),kc.toArray(i,r*16)}n!==null&&(n.needsUpdate=!0)}clone(){return new Pl(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);const t=new Float32Array(e*e*4);t.set(this.boneMatrices);const i=new to(t,e,e,ai,ui);return i.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=i,this}getBoneByName(e){for(let t=0,i=this.bones.length;t<i;t++){const n=this.bones[t];if(n.name===e)return n}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let i=0,n=e.bones.length;i<n;i++){const r=e.bones[i];let o=t[r];o===void 0&&(Le("Skeleton: No bone found with UUID:",r),o=new yu),this.bones.push(o),this.boneInverses.push(new Oe().fromArray(e.boneInverses[i]))}return this.init(),this}toJSON(){const e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;const t=this.bones,i=this.boneInverses;for(let n=0,r=t.length;n<r;n++){const o=t[n];e.bones.push(o.uuid);const a=i[n];e.boneInverses.push(a.toArray())}return e}}const sa=new D,$f=new D,Yf=new ke;class tn{constructor(e=new D(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,n){return this.normal.set(e,t,i),this.constant=n,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){const n=sa.subVectors(i,t).cross($f.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(n,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,i=!0){const n=e.delta(sa),r=this.normal.dot(n);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const o=-(e.start.dot(this.normal)+this.constant)/r;return i===!0&&(o<0||o>1)?null:t.copy(e.start).addScaledVector(n,o)}intersectsLine(e){const t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const i=t||Yf.getNormalMatrix(e),n=this.coplanarPoint(sa).applyMatrix4(e),r=this.normal.applyMatrix3(i).normalize();return this.constant=-n.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const pn=new fs,Kf=new De(.5,.5),vr=new D;class Ll{constructor(e=new tn,t=new tn,i=new tn,n=new tn,r=new tn,o=new tn){this.planes=[e,t,i,n,r,o]}set(e,t,i,n,r,o){const a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(i),a[3].copy(n),a[4].copy(r),a[5].copy(o),this}copy(e){const t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=Ei,i=!1){const n=this.planes,r=e.elements,o=r[0],a=r[1],c=r[2],l=r[3],h=r[4],d=r[5],u=r[6],f=r[7],g=r[8],v=r[9],m=r[10],p=r[11],T=r[12],M=r[13],x=r[14],b=r[15];if(n[0].setComponents(l-o,f-h,p-g,b-T).normalize(),n[1].setComponents(l+o,f+h,p+g,b+T).normalize(),n[2].setComponents(l+a,f+d,p+v,b+M).normalize(),n[3].setComponents(l-a,f-d,p-v,b-M).normalize(),i)n[4].setComponents(c,u,m,x).normalize(),n[5].setComponents(l-c,f-u,p-m,b-x).normalize();else if(n[4].setComponents(l-c,f-u,p-m,b-x).normalize(),t===Ei)n[5].setComponents(l+c,f+u,p+m,b+x).normalize();else if(t===Ws)n[5].setComponents(c,u,m,x).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),pn.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),pn.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(pn)}intersectsSprite(e){pn.center.set(0,0,0);const t=Kf.distanceTo(e.center);return pn.radius=.7071067811865476+t,pn.applyMatrix4(e.matrixWorld),this.intersectsSphere(pn)}intersectsSphere(e){const t=this.planes,i=e.center,n=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(i)<n)return!1;return!0}intersectsBox(e){const t=this.planes;for(let i=0;i<6;i++){const n=t[i];if(vr.x=n.normal.x>0?e.max.x:e.min.x,vr.y=n.normal.y>0?e.max.y:e.min.y,vr.z=n.normal.z>0?e.max.z:e.min.z,n.distanceToPoint(vr)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class wn extends Rn{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Be(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const io=new D,no=new D,Bc=new Oe,Es=new go,yr=new fs,ra=new D,zc=new D;class _o extends dt{constructor(e=new wt,t=new wn){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[0];for(let n=1,r=t.count;n<r;n++)io.fromBufferAttribute(t,n-1),no.fromBufferAttribute(t,n),i[n]=i[n-1],i[n]+=io.distanceTo(no);e.setAttribute("lineDistance",new je(i,1))}else Le("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const i=this.geometry,n=this.matrixWorld,r=e.params.Line.threshold,o=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),yr.copy(i.boundingSphere),yr.applyMatrix4(n),yr.radius+=r,e.ray.intersectsSphere(yr)===!1)return;Bc.copy(n).invert(),Es.copy(e.ray).applyMatrix4(Bc);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=a*a,l=this.isLineSegments?2:1,h=i.index,u=i.attributes.position;if(h!==null){const f=Math.max(0,o.start),g=Math.min(h.count,o.start+o.count);for(let v=f,m=g-1;v<m;v+=l){const p=h.getX(v),T=h.getX(v+1),M=br(this,e,Es,c,p,T,v);M&&t.push(M)}if(this.isLineLoop){const v=h.getX(g-1),m=h.getX(f),p=br(this,e,Es,c,v,m,g-1);p&&t.push(p)}}else{const f=Math.max(0,o.start),g=Math.min(u.count,o.start+o.count);for(let v=f,m=g-1;v<m;v+=l){const p=br(this,e,Es,c,v,v+1,v);p&&t.push(p)}if(this.isLineLoop){const v=br(this,e,Es,c,g-1,f,g-1);v&&t.push(v)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const n=t[i[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=n.length;r<o;r++){const a=n[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function br(s,e,t,i,n,r,o){const a=s.geometry.attributes.position;if(io.fromBufferAttribute(a,n),no.fromBufferAttribute(a,r),t.distanceSqToSegment(io,no,ra,zc)>i)return;ra.applyMatrix4(s.matrixWorld);const l=e.ray.origin.distanceTo(ra);if(!(l<e.near||l>e.far))return{distance:l,point:zc.clone().applyMatrix4(s.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:s}}const Hc=new D,Gc=new D;class Nl extends _o{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[];for(let n=0,r=t.count;n<r;n+=2)Hc.fromBufferAttribute(t,n),Gc.fromBufferAttribute(t,n+1),i[n]=n===0?0:i[n-1],i[n+1]=i[n]+Hc.distanceTo(Gc);e.setAttribute("lineDistance",new je(i,1))}else Le("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class bu extends Ht{constructor(e=[],t=Sn,i,n,r,o,a,c,l,h){super(e,t,i,n,r,o,a,c,l,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class cs extends Ht{constructor(e,t,i=wi,n,r,o,a=Ut,c=Ut,l,h=Hi,d=1){if(h!==Hi&&h!==En)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const u={width:e,height:t,depth:d};super(u,n,r,o,a,c,h,i,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Rl(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class Zf extends cs{constructor(e,t=wi,i=Sn,n,r,o=Ut,a=Ut,c,l=Hi){const h={width:e,height:e,depth:1},d=[h,h,h,h,h,h];super(e,e,t,i,n,r,o,a,c,l),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}}class Mu extends Ht{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class ps extends wt{constructor(e=1,t=1,i=1,n=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:n,heightSegments:r,depthSegments:o};const a=this;n=Math.floor(n),r=Math.floor(r),o=Math.floor(o);const c=[],l=[],h=[],d=[];let u=0,f=0;g("z","y","x",-1,-1,i,t,e,o,r,0),g("z","y","x",1,-1,i,t,-e,o,r,1),g("x","z","y",1,1,e,i,t,n,o,2),g("x","z","y",1,-1,e,i,-t,n,o,3),g("x","y","z",1,-1,e,t,i,n,r,4),g("x","y","z",-1,-1,e,t,-i,n,r,5),this.setIndex(c),this.setAttribute("position",new je(l,3)),this.setAttribute("normal",new je(h,3)),this.setAttribute("uv",new je(d,2));function g(v,m,p,T,M,x,b,S,A,_,E){const R=x/A,C=b/_,L=x/2,k=b/2,q=S/2,U=A+1,N=_+1;let F=0,W=0;const K=new D;for(let ne=0;ne<N;ne++){const se=ne*C-k;for(let re=0;re<U;re++){const xe=re*R-L;K[v]=xe*T,K[m]=se*M,K[p]=q,l.push(K.x,K.y,K.z),K[v]=0,K[m]=0,K[p]=S>0?1:-1,h.push(K.x,K.y,K.z),d.push(re/A),d.push(1-ne/_),F+=1}}for(let ne=0;ne<_;ne++)for(let se=0;se<A;se++){const re=u+se+U*ne,xe=u+se+U*(ne+1),ve=u+(se+1)+U*(ne+1),ae=u+(se+1)+U*ne;c.push(re,xe,ae),c.push(xe,ve,ae),W+=6}a.addGroup(f,W,E),f+=W,u+=F}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ps(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}class xo extends wt{constructor(e=1,t=1,i=1,n=32,r=1,o=!1,a=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:n,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:c};const l=this;n=Math.floor(n),r=Math.floor(r);const h=[],d=[],u=[],f=[];let g=0;const v=[],m=i/2;let p=0;T(),o===!1&&(e>0&&M(!0),t>0&&M(!1)),this.setIndex(h),this.setAttribute("position",new je(d,3)),this.setAttribute("normal",new je(u,3)),this.setAttribute("uv",new je(f,2));function T(){const x=new D,b=new D;let S=0;const A=(t-e)/i;for(let _=0;_<=r;_++){const E=[],R=_/r,C=R*(t-e)+e;for(let L=0;L<=n;L++){const k=L/n,q=k*c+a,U=Math.sin(q),N=Math.cos(q);b.x=C*U,b.y=-R*i+m,b.z=C*N,d.push(b.x,b.y,b.z),x.set(U,A,N).normalize(),u.push(x.x,x.y,x.z),f.push(k,1-R),E.push(g++)}v.push(E)}for(let _=0;_<n;_++)for(let E=0;E<r;E++){const R=v[E][_],C=v[E+1][_],L=v[E+1][_+1],k=v[E][_+1];(e>0||E!==0)&&(h.push(R,C,k),S+=3),(t>0||E!==r-1)&&(h.push(C,L,k),S+=3)}l.addGroup(p,S,0),p+=S}function M(x){const b=g,S=new De,A=new D;let _=0;const E=x===!0?e:t,R=x===!0?1:-1;for(let L=1;L<=n;L++)d.push(0,m*R,0),u.push(0,R,0),f.push(.5,.5),g++;const C=g;for(let L=0;L<=n;L++){const q=L/n*c+a,U=Math.cos(q),N=Math.sin(q);A.x=E*N,A.y=m*R,A.z=E*U,d.push(A.x,A.y,A.z),u.push(0,R,0),S.x=U*.5+.5,S.y=N*.5*R+.5,f.push(S.x,S.y),g++}for(let L=0;L<n;L++){const k=b+L,q=C+L;x===!0?h.push(q,q+1,k):h.push(q+1,q,k),_+=3}l.addGroup(p,_,x===!0?1:2),p+=_}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new xo(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Dl extends xo{constructor(e=1,t=1,i=32,n=1,r=!1,o=0,a=Math.PI*2){super(0,e,t,i,n,r,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:i,heightSegments:n,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(e){return new Dl(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}function Jf(s,e,t=2){const i=e&&e.length,n=i?e[0]*t:s.length;let r=Eu(s,0,n,t,!0);const o=[];if(!r||r.next===r.prev)return o;let a,c,l;if(i&&(r=ip(s,e,r,t)),s.length>80*t){a=s[0],c=s[1];let h=a,d=c;for(let u=t;u<n;u+=t){const f=s[u],g=s[u+1];f<a&&(a=f),g<c&&(c=g),f>h&&(h=f),g>d&&(d=g)}l=Math.max(h-a,d-c),l=l!==0?32767/l:0}return qs(r,o,t,a,c,l,0),o}function Eu(s,e,t,i,n){let r;if(n===fp(s,e,t,i)>0)for(let o=e;o<t;o+=i)r=Vc(o/i|0,s[o],s[o+1],r);else for(let o=t-i;o>=e;o-=i)r=Vc(o/i|0,s[o],s[o+1],r);return r&&hs(r,r.next)&&(Ys(r),r=r.next),r}function An(s,e){if(!s)return s;e||(e=s);let t=s,i;do if(i=!1,!t.steiner&&(hs(t,t.next)||ut(t.prev,t,t.next)===0)){if(Ys(t),t=e=t.prev,t===t.next)break;i=!0}else t=t.next;while(i||t!==e);return e}function qs(s,e,t,i,n,r,o){if(!s)return;!o&&r&&ap(s,i,n,r);let a=s;for(;s.prev!==s.next;){const c=s.prev,l=s.next;if(r?Qf(s,i,n,r):jf(s)){e.push(c.i,s.i,l.i),Ys(s),s=l.next,a=l.next;continue}if(s=l,s===a){o?o===1?(s=ep(An(s),e),qs(s,e,t,i,n,r,2)):o===2&&tp(s,e,t,i,n,r):qs(An(s),e,t,i,n,r,1);break}}}function jf(s){const e=s.prev,t=s,i=s.next;if(ut(e,t,i)>=0)return!1;const n=e.x,r=t.x,o=i.x,a=e.y,c=t.y,l=i.y,h=Math.min(n,r,o),d=Math.min(a,c,l),u=Math.max(n,r,o),f=Math.max(a,c,l);let g=i.next;for(;g!==e;){if(g.x>=h&&g.x<=u&&g.y>=d&&g.y<=f&&Ls(n,a,r,c,o,l,g.x,g.y)&&ut(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function Qf(s,e,t,i){const n=s.prev,r=s,o=s.next;if(ut(n,r,o)>=0)return!1;const a=n.x,c=r.x,l=o.x,h=n.y,d=r.y,u=o.y,f=Math.min(a,c,l),g=Math.min(h,d,u),v=Math.max(a,c,l),m=Math.max(h,d,u),p=ul(f,g,e,t,i),T=ul(v,m,e,t,i);let M=s.prevZ,x=s.nextZ;for(;M&&M.z>=p&&x&&x.z<=T;){if(M.x>=f&&M.x<=v&&M.y>=g&&M.y<=m&&M!==n&&M!==o&&Ls(a,h,c,d,l,u,M.x,M.y)&&ut(M.prev,M,M.next)>=0||(M=M.prevZ,x.x>=f&&x.x<=v&&x.y>=g&&x.y<=m&&x!==n&&x!==o&&Ls(a,h,c,d,l,u,x.x,x.y)&&ut(x.prev,x,x.next)>=0))return!1;x=x.nextZ}for(;M&&M.z>=p;){if(M.x>=f&&M.x<=v&&M.y>=g&&M.y<=m&&M!==n&&M!==o&&Ls(a,h,c,d,l,u,M.x,M.y)&&ut(M.prev,M,M.next)>=0)return!1;M=M.prevZ}for(;x&&x.z<=T;){if(x.x>=f&&x.x<=v&&x.y>=g&&x.y<=m&&x!==n&&x!==o&&Ls(a,h,c,d,l,u,x.x,x.y)&&ut(x.prev,x,x.next)>=0)return!1;x=x.nextZ}return!0}function ep(s,e){let t=s;do{const i=t.prev,n=t.next.next;!hs(i,n)&&Tu(i,t,t.next,n)&&$s(i,n)&&$s(n,i)&&(e.push(i.i,t.i,n.i),Ys(t),Ys(t.next),t=s=n),t=t.next}while(t!==s);return An(t)}function tp(s,e,t,i,n,r){let o=s;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&hp(o,a)){let c=wu(o,a);o=An(o,o.next),c=An(c,c.next),qs(o,e,t,i,n,r,0),qs(c,e,t,i,n,r,0);return}a=a.next}o=o.next}while(o!==s)}function ip(s,e,t,i){const n=[];for(let r=0,o=e.length;r<o;r++){const a=e[r]*i,c=r<o-1?e[r+1]*i:s.length,l=Eu(s,a,c,i,!1);l===l.next&&(l.steiner=!0),n.push(cp(l))}n.sort(np);for(let r=0;r<n.length;r++)t=sp(n[r],t);return t}function np(s,e){let t=s.x-e.x;if(t===0&&(t=s.y-e.y,t===0)){const i=(s.next.y-s.y)/(s.next.x-s.x),n=(e.next.y-e.y)/(e.next.x-e.x);t=i-n}return t}function sp(s,e){const t=rp(s,e);if(!t)return e;const i=wu(t,s);return An(i,i.next),An(t,t.next)}function rp(s,e){let t=e;const i=s.x,n=s.y;let r=-1/0,o;if(hs(s,t))return t;do{if(hs(s,t.next))return t.next;if(n<=t.y&&n>=t.next.y&&t.next.y!==t.y){const d=t.x+(n-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(d<=i&&d>r&&(r=d,o=t.x<t.next.x?t:t.next,d===i))return o}t=t.next}while(t!==e);if(!o)return null;const a=o,c=o.x,l=o.y;let h=1/0;t=o;do{if(i>=t.x&&t.x>=c&&i!==t.x&&Su(n<l?i:r,n,c,l,n<l?r:i,n,t.x,t.y)){const d=Math.abs(n-t.y)/(i-t.x);$s(t,s)&&(d<h||d===h&&(t.x>o.x||t.x===o.x&&op(o,t)))&&(o=t,h=d)}t=t.next}while(t!==a);return o}function op(s,e){return ut(s.prev,s,e.prev)<0&&ut(e.next,s,s.next)<0}function ap(s,e,t,i){let n=s;do n.z===0&&(n.z=ul(n.x,n.y,e,t,i)),n.prevZ=n.prev,n.nextZ=n.next,n=n.next;while(n!==s);n.prevZ.nextZ=null,n.prevZ=null,lp(n)}function lp(s){let e,t=1;do{let i=s,n;s=null;let r=null;for(e=0;i;){e++;let o=i,a=0;for(let l=0;l<t&&(a++,o=o.nextZ,!!o);l++);let c=t;for(;a>0||c>0&&o;)a!==0&&(c===0||!o||i.z<=o.z)?(n=i,i=i.nextZ,a--):(n=o,o=o.nextZ,c--),r?r.nextZ=n:s=n,n.prevZ=r,r=n;i=o}r.nextZ=null,t*=2}while(e>1);return s}function ul(s,e,t,i,n){return s=(s-t)*n|0,e=(e-i)*n|0,s=(s|s<<8)&16711935,s=(s|s<<4)&252645135,s=(s|s<<2)&858993459,s=(s|s<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,s|e<<1}function cp(s){let e=s,t=s;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==s);return t}function Su(s,e,t,i,n,r,o,a){return(n-o)*(e-a)>=(s-o)*(r-a)&&(s-o)*(i-a)>=(t-o)*(e-a)&&(t-o)*(r-a)>=(n-o)*(i-a)}function Ls(s,e,t,i,n,r,o,a){return!(s===o&&e===a)&&Su(s,e,t,i,n,r,o,a)}function hp(s,e){return s.next.i!==e.i&&s.prev.i!==e.i&&!up(s,e)&&($s(s,e)&&$s(e,s)&&dp(s,e)&&(ut(s.prev,s,e.prev)||ut(s,e.prev,e))||hs(s,e)&&ut(s.prev,s,s.next)>0&&ut(e.prev,e,e.next)>0)}function ut(s,e,t){return(e.y-s.y)*(t.x-e.x)-(e.x-s.x)*(t.y-e.y)}function hs(s,e){return s.x===e.x&&s.y===e.y}function Tu(s,e,t,i){const n=Er(ut(s,e,t)),r=Er(ut(s,e,i)),o=Er(ut(t,i,s)),a=Er(ut(t,i,e));return!!(n!==r&&o!==a||n===0&&Mr(s,t,e)||r===0&&Mr(s,i,e)||o===0&&Mr(t,s,i)||a===0&&Mr(t,e,i))}function Mr(s,e,t){return e.x<=Math.max(s.x,t.x)&&e.x>=Math.min(s.x,t.x)&&e.y<=Math.max(s.y,t.y)&&e.y>=Math.min(s.y,t.y)}function Er(s){return s>0?1:s<0?-1:0}function up(s,e){let t=s;do{if(t.i!==s.i&&t.next.i!==s.i&&t.i!==e.i&&t.next.i!==e.i&&Tu(t,t.next,s,e))return!0;t=t.next}while(t!==s);return!1}function $s(s,e){return ut(s.prev,s,s.next)<0?ut(s,e,s.next)>=0&&ut(s,s.prev,e)>=0:ut(s,e,s.prev)<0||ut(s,s.next,e)<0}function dp(s,e){let t=s,i=!1;const n=(s.x+e.x)/2,r=(s.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&n<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(i=!i),t=t.next;while(t!==s);return i}function wu(s,e){const t=dl(s.i,s.x,s.y),i=dl(e.i,e.x,e.y),n=s.next,r=e.prev;return s.next=e,e.prev=s,t.next=n,n.prev=t,i.next=t,t.prev=i,r.next=i,i.prev=r,i}function Vc(s,e,t,i){const n=dl(s,e,t);return i?(n.next=i.next,n.prev=i,i.next.prev=n,i.next=n):(n.prev=n,n.next=n),n}function Ys(s){s.next.prev=s.prev,s.prev.next=s.next,s.prevZ&&(s.prevZ.nextZ=s.nextZ),s.nextZ&&(s.nextZ.prevZ=s.prevZ)}function dl(s,e,t){return{i:s,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function fp(s,e,t,i){let n=0;for(let r=e,o=t-i;r<t;r+=i)n+=(s[o]-s[r])*(s[r+1]+s[o+1]),o=r;return n}class pp{static triangulate(e,t,i=2){return Jf(e,t,i)}}class so{static area(e){const t=e.length;let i=0;for(let n=t-1,r=0;r<t;n=r++)i+=e[n].x*e[r].y-e[r].x*e[n].y;return i*.5}static isClockWise(e){return so.area(e)<0}static triangulateShape(e,t){const i=[],n=[],r=[];Wc(e),Xc(i,e);let o=e.length;t.forEach(Wc);for(let c=0;c<t.length;c++)n.push(o),o+=t[c].length,Xc(i,t[c]);const a=pp.triangulate(i,n);for(let c=0;c<a.length;c+=3)r.push(a.slice(c,c+3));return r}}function Wc(s){const e=s.length;e>2&&s[e-1].equals(s[0])&&s.pop()}function Xc(s,e){for(let t=0;t<e.length;t++)s.push(e[t].x),s.push(e[t].y)}class vo extends wt{constructor(e=1,t=1,i=1,n=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:n};const r=e/2,o=t/2,a=Math.floor(i),c=Math.floor(n),l=a+1,h=c+1,d=e/a,u=t/c,f=[],g=[],v=[],m=[];for(let p=0;p<h;p++){const T=p*u-o;for(let M=0;M<l;M++){const x=M*d-r;g.push(x,-T,0),v.push(0,0,1),m.push(M/a),m.push(1-p/c)}}for(let p=0;p<c;p++)for(let T=0;T<a;T++){const M=T+l*p,x=T+l*(p+1),b=T+1+l*(p+1),S=T+1+l*p;f.push(M,x,S),f.push(x,b,S)}this.setIndex(f),this.setAttribute("position",new je(g,3)),this.setAttribute("normal",new je(v,3)),this.setAttribute("uv",new je(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new vo(e.width,e.height,e.widthSegments,e.heightSegments)}}class yo extends wt{constructor(e=1,t=32,i=16,n=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:n,phiLength:r,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));const c=Math.min(o+a,Math.PI);let l=0;const h=[],d=new D,u=new D,f=[],g=[],v=[],m=[];for(let p=0;p<=i;p++){const T=[],M=p/i,x=o+M*a,b=e*Math.cos(x),S=Math.sqrt(e*e-b*b);let A=0;p===0&&o===0?A=.5/t:p===i&&c===Math.PI&&(A=-.5/t);for(let _=0;_<=t;_++){const E=_/t,R=n+E*r;d.x=-S*Math.cos(R),d.y=b,d.z=S*Math.sin(R),g.push(d.x,d.y,d.z),u.copy(d).normalize(),v.push(u.x,u.y,u.z),m.push(E+A,1-M),T.push(l++)}h.push(T)}for(let p=0;p<i;p++)for(let T=0;T<t;T++){const M=h[p][T+1],x=h[p][T],b=h[p+1][T],S=h[p+1][T+1];(p!==0||o>0)&&f.push(M,x,S),(p!==i-1||c<Math.PI)&&f.push(x,b,S)}this.setIndex(f),this.setAttribute("position",new je(g,3)),this.setAttribute("normal",new je(v,3)),this.setAttribute("uv",new je(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new yo(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}function us(s){const e={};for(const t in s){e[t]={};for(const i in s[t]){const n=s[t][i];if(qc(n))n.isRenderTargetTexture?(Le("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=n.clone();else if(Array.isArray(n))if(qc(n[0])){const r=[];for(let o=0,a=n.length;o<a;o++)r[o]=n[o].clone();e[t][i]=r}else e[t][i]=n.slice();else e[t][i]=n}}return e}function Wt(s){const e={};for(let t=0;t<s.length;t++){const i=us(s[t]);for(const n in i)e[n]=i[n]}return e}function qc(s){return s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)}function mp(s){const e=[];for(let t=0;t<s.length;t++)e.push(s[t].clone());return e}function Au(s){const e=s.getRenderTarget();return e===null?s.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Xe.workingColorSpace}const gp={clone:us,merge:Wt};var _p=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,xp=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Ai extends Rn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=_p,this.fragmentShader=xp,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=us(e.uniforms),this.uniformsGroups=mp(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const n in this.uniforms){const o=this.uniforms[n].value;o&&o.isTexture?t.uniforms[n]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[n]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[n]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[n]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[n]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[n]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[n]={type:"m4",value:o.toArray()}:t.uniforms[n]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const i={};for(const n in this.extensions)this.extensions[n]===!0&&(i[n]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(const i in e.uniforms){const n=e.uniforms[i];switch(this.uniforms[i]={},n.type){case"t":this.uniforms[i].value=t[n.value]||null;break;case"c":this.uniforms[i].value=new Be().setHex(n.value);break;case"v2":this.uniforms[i].value=new De().fromArray(n.value);break;case"v3":this.uniforms[i].value=new D().fromArray(n.value);break;case"v4":this.uniforms[i].value=new st().fromArray(n.value);break;case"m3":this.uniforms[i].value=new ke().fromArray(n.value);break;case"m4":this.uniforms[i].value=new Oe().fromArray(n.value);break;default:this.uniforms[i].value=n.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(const i in e.extensions)this.extensions[i]=e.extensions[i];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}}class vp extends Ai{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class ks extends Rn{constructor(e){super(),this.isMeshPhongMaterial=!0,this.type="MeshPhongMaterial",this.color=new Be(16777215),this.specular=new Be(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Be(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=jr,this.normalScale=new De(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new fi,this.combine=po,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.specular.copy(e.specular),this.shininess=e.shininess,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class yp extends Rn{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Be(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Be(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=jr,this.normalScale=new De(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new fi,this.combine=po,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class bp extends Rn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Zd,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class Mp extends Rn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}function Sr(s,e){return!s||s.constructor===e?s:typeof e.BYTES_PER_ELEMENT=="number"?new e(s):Array.prototype.slice.call(s)}function Ep(s){function e(n,r){return s[n]-s[r]}const t=s.length,i=new Array(t);for(let n=0;n!==t;++n)i[n]=n;return i.sort(e),i}function $c(s,e,t){const i=s.length,n=new s.constructor(i);for(let r=0,o=0;o!==i;++r){const a=t[r]*e;for(let c=0;c!==e;++c)n[o++]=s[a+c]}return n}function Sp(s,e,t,i){let n=1,r=s[0];for(;r!==void 0&&r[i]===void 0;)r=s[n++];if(r===void 0)return;let o=r[i];if(o!==void 0)if(Array.isArray(o))do o=r[i],o!==void 0&&(e.push(r.time),t.push(...o)),r=s[n++];while(r!==void 0);else if(o.toArray!==void 0)do o=r[i],o!==void 0&&(e.push(r.time),o.toArray(t,t.length)),r=s[n++];while(r!==void 0);else do o=r[i],o!==void 0&&(e.push(r.time),t.push(o)),r=s[n++];while(r!==void 0)}class Js{constructor(e,t,i,n){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=n!==void 0?n:new t.constructor(i),this.sampleValues=t,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(e){const t=this.parameterPositions;let i=this._cachedIndex,n=t[i],r=t[i-1];i:{e:{let o;t:{n:if(!(e<n)){for(let a=i+2;;){if(n===void 0){if(e<r)break n;return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===a)break;if(r=n,n=t[++i],e<n)break e}o=t.length;break t}if(!(e>=r)){const a=t[1];e<a&&(i=2,r=a);for(let c=i-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===c)break;if(n=r,r=t[--i-1],e>=r)break e}o=i,i=0;break t}break i}for(;i<o;){const a=i+o>>>1;e<t[a]?o=a:i=a+1}if(n=t[i],r=t[i-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===void 0)return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,r,n)}return this.interpolate_(i,r,e,n)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){const t=this.resultBuffer,i=this.sampleValues,n=this.valueSize,r=e*n;for(let o=0;o!==n;++o)t[o]=i[r+o];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}}class Tp extends Js{constructor(e,t,i,n){super(e,t,i,n),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:uc,endingEnd:uc}}intervalChanged_(e,t,i){const n=this.parameterPositions;let r=e-2,o=e+1,a=n[r],c=n[o];if(a===void 0)switch(this.getSettings_().endingStart){case dc:r=e,a=2*t-i;break;case fc:r=n.length-2,a=t+n[r]-n[r+1];break;default:r=e,a=i}if(c===void 0)switch(this.getSettings_().endingEnd){case dc:o=e,c=2*i-t;break;case fc:o=1,c=i+n[1]-n[0];break;default:o=e-1,c=t}const l=(i-t)*.5,h=this.valueSize;this._weightPrev=l/(t-a),this._weightNext=l/(c-i),this._offsetPrev=r*h,this._offsetNext=o*h}interpolate_(e,t,i,n){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=e*a,l=c-a,h=this._offsetPrev,d=this._offsetNext,u=this._weightPrev,f=this._weightNext,g=(i-t)/(n-t),v=g*g,m=v*g,p=-u*m+2*u*v-u*g,T=(1+u)*m+(-1.5-2*u)*v+(-.5+u)*g+1,M=(-1-f)*m+(1.5+f)*v+.5*g,x=f*m-f*v;for(let b=0;b!==a;++b)r[b]=p*o[h+b]+T*o[l+b]+M*o[c+b]+x*o[d+b];return r}}class wp extends Js{constructor(e,t,i,n){super(e,t,i,n)}interpolate_(e,t,i,n){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=e*a,l=c-a,h=(i-t)/(n-t),d=1-h;for(let u=0;u!==a;++u)r[u]=o[l+u]*d+o[c+u]*h;return r}}class Ap extends Js{constructor(e,t,i,n){super(e,t,i,n)}interpolate_(e){return this.copySampleValue_(e-1)}}class Rp extends Js{interpolate_(e,t,i,n){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=e*a,l=c-a,h=this.inTangents,d=this.outTangents;if(!h||!d){const g=(i-t)/(n-t),v=1-g;for(let m=0;m!==a;++m)r[m]=o[l+m]*v+o[c+m]*g;return r}const u=a*2,f=e-1;for(let g=0;g!==a;++g){const v=o[l+g],m=o[c+g],p=f*u+g*2,T=d[p],M=d[p+1],x=e*u+g*2,b=h[x],S=h[x+1];let A=(i-t)/(n-t),_,E,R,C,L;for(let k=0;k<8;k++){_=A*A,E=_*A,R=1-A,C=R*R,L=C*R;const U=L*t+3*C*A*T+3*R*_*b+E*n-i;if(Math.abs(U)<1e-10)break;const N=3*C*(T-t)+6*R*A*(b-T)+3*_*(n-b);if(Math.abs(N)<1e-10)break;A=A-U/N,A=Math.max(0,Math.min(1,A))}r[g]=L*v+3*C*A*M+3*R*_*S+E*m}return r}}class pi{constructor(e,t,i,n){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Sr(t,this.TimeBufferType),this.values=Sr(i,this.ValueBufferType),this.setInterpolation(n||this.DefaultInterpolation)}static toJSON(e){const t=e.constructor;let i;if(t.toJSON!==this.toJSON)i=t.toJSON(e);else{i={name:e.name,times:Sr(e.times,Array),values:Sr(e.values,Array)};const n=e.getInterpolation();n!==e.DefaultInterpolation&&(i.interpolation=n)}return i.type=e.ValueTypeName,i}InterpolantFactoryMethodDiscrete(e){return new Ap(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new wp(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Tp(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){const t=new Rp(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case Vs:t=this.InterpolantFactoryMethodDiscrete;break;case cl:t=this.InterpolantFactoryMethodLinear;break;case Io:t=this.InterpolantFactoryMethodSmooth;break;case hl:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){const i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return Le("KeyframeTrack:",i),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Vs;case this.InterpolantFactoryMethodLinear:return cl;case this.InterpolantFactoryMethodSmooth:return Io;case this.InterpolantFactoryMethodBezier:return hl}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){const t=this.times;for(let i=0,n=t.length;i!==n;++i)t[i]+=e}return this}scale(e){if(e!==1){const t=this.times;for(let i=0,n=t.length;i!==n;++i)t[i]*=e}return this}trim(e,t){const i=this.times,n=i.length;let r=0,o=n-1;for(;r!==n&&i[r]<e;)++r;for(;o!==-1&&i[o]>t;)--o;if(++o,r!==0||o!==n){r>=o&&(o=Math.max(o,1),r=o-1);const a=this.getValueSize();this.times=i.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let e=!0;const t=this.getValueSize();t-Math.floor(t)!==0&&(We("KeyframeTrack: Invalid value size in track.",this),e=!1);const i=this.times,n=this.values,r=i.length;r===0&&(We("KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==r;a++){const c=i[a];if(typeof c=="number"&&isNaN(c)){We("KeyframeTrack: Time is not a valid number.",this,a,c),e=!1;break}if(o!==null&&o>c){We("KeyframeTrack: Out of order keys.",this,a,c,o),e=!1;break}o=c}if(n!==void 0&&of(n))for(let a=0,c=n.length;a!==c;++a){const l=n[a];if(isNaN(l)){We("KeyframeTrack: Value is not a valid number.",this,a,l),e=!1;break}}return e}optimize(){const e=this.times.slice(),t=this.values.slice(),i=this.getValueSize(),n=this.getInterpolation()===Io,r=e.length-1;let o=1;for(let a=1;a<r;++a){let c=!1;const l=e[a],h=e[a+1];if(l!==h&&(a!==1||l!==e[0]))if(n)c=!0;else{const d=a*i,u=d-i,f=d+i;for(let g=0;g!==i;++g){const v=t[d+g];if(v!==t[u+g]||v!==t[f+g]){c=!0;break}}}if(c){if(a!==o){e[o]=e[a];const d=a*i,u=o*i;for(let f=0;f!==i;++f)t[u+f]=t[d+f]}++o}}if(r>0){e[o]=e[r];for(let a=r*i,c=o*i,l=0;l!==i;++l)t[c+l]=t[a+l];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*i)):(this.times=e,this.values=t),this}clone(){const e=this.times.slice(),t=this.values.slice(),i=this.constructor,n=new i(this.name,e,t);return n.createInterpolant=this.createInterpolant,n}}pi.prototype.ValueTypeName="";pi.prototype.TimeBufferType=Float32Array;pi.prototype.ValueBufferType=Float32Array;pi.prototype.DefaultInterpolation=cl;class ms extends pi{constructor(e,t,i){super(e,t,i)}}ms.prototype.ValueTypeName="bool";ms.prototype.ValueBufferType=Array;ms.prototype.DefaultInterpolation=Vs;ms.prototype.InterpolantFactoryMethodLinear=void 0;ms.prototype.InterpolantFactoryMethodSmooth=void 0;class Ru extends pi{constructor(e,t,i,n){super(e,t,i,n)}}Ru.prototype.ValueTypeName="color";class Il extends pi{constructor(e,t,i,n){super(e,t,i,n)}}Il.prototype.ValueTypeName="number";class Cp extends Js{constructor(e,t,i,n){super(e,t,i,n)}interpolate_(e,t,i,n){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=(i-t)/(n-t);let l=e*a;for(let h=l+a;l!==h;l+=4)Nt.slerpFlat(r,0,o,l-a,o,l,c);return r}}class ns extends pi{constructor(e,t,i,n){super(e,t,i,n)}InterpolantFactoryMethodLinear(e){return new Cp(this.times,this.values,this.getValueSize(),e)}}ns.prototype.ValueTypeName="quaternion";ns.prototype.InterpolantFactoryMethodSmooth=void 0;class gs extends pi{constructor(e,t,i){super(e,t,i)}}gs.prototype.ValueTypeName="string";gs.prototype.ValueBufferType=Array;gs.prototype.DefaultInterpolation=Vs;gs.prototype.InterpolantFactoryMethodLinear=void 0;gs.prototype.InterpolantFactoryMethodSmooth=void 0;class ri extends pi{constructor(e,t,i,n){super(e,t,i,n)}}ri.prototype.ValueTypeName="vector";class Yc{constructor(e="",t=-1,i=[],n=Kd){this.name=e,this.tracks=i,this.duration=t,this.blendMode=n,this.uuid=ln(),this.userData={},this.duration<0&&this.resetDuration()}static parse(e){const t=[],i=e.tracks,n=1/(e.fps||1);for(let o=0,a=i.length;o!==a;++o)t.push(Lp(i[o]).scale(n));const r=new this(e.name,e.duration,t,e.blendMode);return r.uuid=e.uuid,r.userData=JSON.parse(e.userData||"{}"),r}static toJSON(e){const t=[],i=e.tracks,n={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let r=0,o=i.length;r!==o;++r)t.push(pi.toJSON(i[r]));return n}static CreateFromMorphTargetSequence(e,t,i,n){const r=t.length,o=[];for(let a=0;a<r;a++){let c=[],l=[];c.push((a+r-1)%r,a,(a+1)%r),l.push(0,1,0);const h=Ep(c);c=$c(c,1,h),l=$c(l,1,h),!n&&c[0]===0&&(c.push(r),l.push(l[0])),o.push(new Il(".morphTargetInfluences["+t[a].name+"]",c,l).scale(1/i))}return new this(e,-1,o)}static findByName(e,t){let i=e;if(!Array.isArray(e)){const n=e;i=n.geometry&&n.geometry.animations||n.animations}for(let n=0;n<i.length;n++)if(i[n].name===t)return i[n];return null}static CreateClipsFromMorphTargetSequences(e,t,i){const n={},r=/^([\w-]*?)([\d]+)$/;for(let a=0,c=e.length;a<c;a++){const l=e[a],h=l.name.match(r);if(h&&h.length>1){const d=h[1];let u=n[d];u||(n[d]=u=[]),u.push(l)}}const o=[];for(const a in n)o.push(this.CreateFromMorphTargetSequence(a,n[a],t,i));return o}resetDuration(){const e=this.tracks;let t=0;for(let i=0,n=e.length;i!==n;++i){const r=this.tracks[i];t=Math.max(t,r.times[r.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){const e=[];for(let i=0;i<this.tracks.length;i++)e.push(this.tracks[i].clone());const t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}}function Pp(s){switch(s.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return Il;case"vector":case"vector2":case"vector3":case"vector4":return ri;case"color":return Ru;case"quaternion":return ns;case"bool":case"boolean":return ms;case"string":return gs}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+s)}function Lp(s){if(s.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");const e=Pp(s.type);if(s.times===void 0){const t=[],i=[];Sp(s.keys,t,i,"value"),s.times=t,s.values=i}return e.parse!==void 0?e.parse(s):new e(s.name,s.times,s.values,s.interpolation)}const Bs={enabled:!1,files:{},add:function(s,e){this.enabled!==!1&&(Kc(s)||(this.files[s]=e))},get:function(s){if(this.enabled!==!1&&!Kc(s))return this.files[s]},remove:function(s){delete this.files[s]},clear:function(){this.files={}}};function Kc(s){try{const e=s.slice(s.indexOf(":")+1);return new URL(e).protocol==="blob:"}catch{return!1}}class Np{constructor(e,t,i){const n=this;let r=!1,o=0,a=0,c;const l=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=i,this._abortController=null,this.itemStart=function(h){a++,r===!1&&n.onStart!==void 0&&n.onStart(h,o,a),r=!0},this.itemEnd=function(h){o++,n.onProgress!==void 0&&n.onProgress(h,o,a),o===a&&(r=!1,n.onLoad!==void 0&&n.onLoad())},this.itemError=function(h){n.onError!==void 0&&n.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),c?c(h):h},this.setURLModifier=function(h){return c=h,this},this.addHandler=function(h,d){return l.push(h,d),this},this.removeHandler=function(h){const d=l.indexOf(h);return d!==-1&&l.splice(d,2),this},this.getHandler=function(h){for(let d=0,u=l.length;d<u;d+=2){const f=l[d],g=l[d+1];if(f.global&&(f.lastIndex=0),f.test(h))return g}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}}const Cu=new Np;class cn{constructor(e){this.manager=e!==void 0?e:Cu,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){const i=this;return new Promise(function(n,r){i.load(e,n,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}}cn.DEFAULT_MATERIAL_NAME="__DEFAULT";const Di={};class Dp extends Error{constructor(e,t){super(e),this.response=t}}class Ul extends cn{constructor(e){super(e),this.mimeType="",this.responseType="",this._abortController=new AbortController}load(e,t,i,n){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=Bs.get(`file:${e}`);if(r!==void 0){this.manager.itemStart(e),setTimeout(()=>{t&&t(r),this.manager.itemEnd(e)},0);return}if(Di[e]!==void 0){Di[e].push({onLoad:t,onProgress:i,onError:n});return}Di[e]=[],Di[e].push({onLoad:t,onProgress:i,onError:n});const o=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",signal:typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),a=this.mimeType,c=this.responseType;fetch(o).then(l=>{if(l.status===200||l.status===0){if(l.status===0&&Le("FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||l.body===void 0||l.body.getReader===void 0)return l;const h=Di[e],d=l.body.getReader(),u=l.headers.get("X-File-Size")||l.headers.get("Content-Length"),f=u?parseInt(u):0,g=f!==0;let v=0;const m=new ReadableStream({start(p){T();function T(){d.read().then(({done:M,value:x})=>{if(M)p.close();else{v+=x.byteLength;const b=new ProgressEvent("progress",{lengthComputable:g,loaded:v,total:f});for(let S=0,A=h.length;S<A;S++){const _=h[S];_.onProgress&&_.onProgress(b)}p.enqueue(x),T()}},M=>{p.error(M)})}}});return new Response(m)}else throw new Dp(`fetch for "${l.url}" responded with ${l.status}: ${l.statusText}`,l)}).then(l=>{switch(c){case"arraybuffer":return l.arrayBuffer();case"blob":return l.blob();case"document":return l.text().then(h=>new DOMParser().parseFromString(h,a));case"json":return l.json();default:if(a==="")return l.text();{const d=/charset="?([^;"\s]*)"?/i.exec(a),u=d&&d[1]?d[1].toLowerCase():void 0,f=new TextDecoder(u);return l.arrayBuffer().then(g=>f.decode(g))}}}).then(l=>{Bs.add(`file:${e}`,l);const h=Di[e];delete Di[e];for(let d=0,u=h.length;d<u;d++){const f=h[d];f.onLoad&&f.onLoad(l)}}).catch(l=>{const h=Di[e];if(h===void 0)throw this.manager.itemError(e),l;delete Di[e];for(let d=0,u=h.length;d<u;d++){const f=h[d];f.onError&&f.onError(l)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}const Gn=new WeakMap;class Ip extends cn{constructor(e){super(e)}load(e,t,i,n){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,o=Bs.get(`image:${e}`);if(o!==void 0){if(o.complete===!0)r.manager.itemStart(e),setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0);else{let d=Gn.get(o);d===void 0&&(d=[],Gn.set(o,d)),d.push({onLoad:t,onError:n})}return o}const a=Xs("img");function c(){h(),t&&t(this);const d=Gn.get(this)||[];for(let u=0;u<d.length;u++){const f=d[u];f.onLoad&&f.onLoad(this)}Gn.delete(this),r.manager.itemEnd(e)}function l(d){h(),n&&n(d),Bs.remove(`image:${e}`);const u=Gn.get(this)||[];for(let f=0;f<u.length;f++){const g=u[f];g.onError&&g.onError(d)}Gn.delete(this),r.manager.itemError(e),r.manager.itemEnd(e)}function h(){a.removeEventListener("load",c,!1),a.removeEventListener("error",l,!1)}return a.addEventListener("load",c,!1),a.addEventListener("error",l,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),Bs.add(`image:${e}`,a),r.manager.itemStart(e),a.src=e,a}}class Up extends cn{constructor(e){super(e)}load(e,t,i,n){const r=this,o=new to,a=new Ul(this.manager);return a.setResponseType("arraybuffer"),a.setRequestHeader(this.requestHeader),a.setPath(this.path),a.setWithCredentials(r.withCredentials),a.load(e,function(c){let l;try{l=r.parse(c)}catch(h){n!==void 0?n(h):We(h);return}r._applyTexData(o,l),t&&t(o,l)},i,n),o}createDataTexture(e){const t=new to;return this._applyTexData(t,this.parse(e)),t}_applyTexData(e,t){t.image!==void 0?e.image=t.image:t.data!==void 0&&(e.image.width=t.width,e.image.height=t.height,e.image.data=t.data),e.wrapS=t.wrapS!==void 0?t.wrapS:ti,e.wrapT=t.wrapT!==void 0?t.wrapT:ti,e.magFilter=t.magFilter!==void 0?t.magFilter:Tt,e.minFilter=t.minFilter!==void 0?t.minFilter:Tt,e.anisotropy=t.anisotropy!==void 0?t.anisotropy:1,t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.mipmaps!==void 0&&(e.mipmaps=t.mipmaps,e.minFilter=Fi),t.mipmapCount===1&&(e.minFilter=Tt),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),e.needsUpdate=!0}}class Pu extends cn{constructor(e){super(e)}load(e,t,i,n){const r=new Ht,o=new Ip(this.manager);return o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(e,function(a){r.image=a,r.needsUpdate=!0,t!==void 0&&t(r)},i,n),r}}class js extends dt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Be(e),this.intensity=t}dispose(){this.dispatchEvent({type:"dispose"})}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}}class Lu extends js{constructor(e,t,i){super(e,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(dt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Be(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){const t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}}const oa=new Oe,Zc=new D,Jc=new D;class Fl{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new De(512,512),this.mapType=ei,this.map=null,this.mapPass=null,this.matrix=new Oe,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Ll,this._frameExtents=new De(1,1),this._viewportCount=1,this._viewports=[new st(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,i=this.matrix;Zc.setFromMatrixPosition(e.matrixWorld),t.position.copy(Zc),Jc.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Jc),t.updateMatrixWorld(),oa.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(oa,t.coordinateSystem,t.reversedDepth),t.coordinateSystem===Ws||t.reversedDepth?i.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(oa)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}const Tr=new D,wr=new Nt,xi=new D;class Nu extends dt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Oe,this.projectionMatrix=new Oe,this.projectionMatrixInverse=new Oe,this.coordinateSystem=Ei,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Tr,wr,xi),xi.x===1&&xi.y===1&&xi.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Tr,wr,xi.set(1,1,1)).invert()}updateWorldMatrix(e,t,i=!1){super.updateWorldMatrix(e,t,i),this.matrixWorld.decompose(Tr,wr,xi),xi.x===1&&xi.y===1&&xi.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Tr,wr,xi.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}const Zi=new D,jc=new De,Qc=new De;class It extends Nu{constructor(e=50,t=1,i=.1,n=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=n,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=as*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Fs*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return as*2*Math.atan(Math.tan(Fs*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){Zi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Zi.x,Zi.y).multiplyScalar(-e/Zi.z),Zi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Zi.x,Zi.y).multiplyScalar(-e/Zi.z)}getViewSize(e,t){return this.getViewBounds(e,jc,Qc),t.subVectors(Qc,jc)}setViewOffset(e,t,i,n,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=n,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(Fs*.5*this.fov)/this.zoom,i=2*t,n=this.aspect*i,r=-.5*n;const o=this.view;if(this.view!==null&&this.view.enabled){const c=o.fullWidth,l=o.fullHeight;r+=o.offsetX*n/c,t-=o.offsetY*i/l,n*=o.width/c,i*=o.height/l}const a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+n,t,t-i,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}class Fp extends Fl{constructor(){super(new It(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){const t=this.camera,i=as*2*e.angle*this.focus,n=this.mapSize.width/this.mapSize.height*this.aspect,r=e.distance||t.far;(i!==t.fov||n!==t.aspect||r!==t.far)&&(t.fov=i,t.aspect=n,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}}class Op extends js{constructor(e,t,i=0,n=Math.PI/3,r=0,o=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(dt.DEFAULT_UP),this.updateMatrix(),this.target=new dt,this.distance=i,this.angle=n,this.penumbra=r,this.decay=o,this.map=null,this.shadow=new Fp}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.map=e.map,this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.distance=this.distance,t.object.angle=this.angle,t.object.decay=this.decay,t.object.penumbra=this.penumbra,t.object.target=this.target.uuid,this.map&&this.map.isTexture&&(t.object.map=this.map.toJSON(e).uuid),t.object.shadow=this.shadow.toJSON(),t}}class kp extends Fl{constructor(){super(new It(90,1,.5,500)),this.isPointLightShadow=!0}}class Bp extends js{constructor(e,t,i=0,n=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=n,this.shadow=new kp}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}}class bo extends Nu{constructor(e=-1,t=1,i=1,n=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=n,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,n,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=n,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,n=(this.top+this.bottom)/2;let r=i-e,o=i+e,a=n+t,c=n-t;if(this.view!==null&&this.view.enabled){const l=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=l*this.view.offsetX,o=r+l*this.view.width,a-=h*this.view.offsetY,c=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class zp extends Fl{constructor(){super(new bo(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class Du extends js{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(dt.DEFAULT_UP),this.updateMatrix(),this.target=new dt,this.shadow=new zp}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}}class Hp extends js{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}}class Iu{static extractUrlBase(e){const t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}}const Vn=-90,Wn=1;class Gp extends dt{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const n=new It(Vn,Wn,e,t);n.layers=this.layers,this.add(n);const r=new It(Vn,Wn,e,t);r.layers=this.layers,this.add(r);const o=new It(Vn,Wn,e,t);o.layers=this.layers,this.add(o);const a=new It(Vn,Wn,e,t);a.layers=this.layers,this.add(a);const c=new It(Vn,Wn,e,t);c.layers=this.layers,this.add(c);const l=new It(Vn,Wn,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[i,n,r,o,a,c]=t;for(const l of t)this.remove(l);if(e===Ei)i.up.set(0,1,0),i.lookAt(1,0,0),n.up.set(0,1,0),n.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===Ws)i.up.set(0,-1,0),i.lookAt(-1,0,0),n.up.set(0,-1,0),n.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:n}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,o,a,c,l,h]=this.children,d=e.getRenderTarget(),u=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const v=i.texture.generateMipmaps;i.texture.generateMipmaps=!1;let m=!1;e.isWebGLRenderer===!0?m=e.state.buffers.depth.getReversed():m=e.reversedDepthBuffer,e.setRenderTarget(i,0,n),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(i,1,n),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(i,2,n),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(i,3,n),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),e.setRenderTarget(i,4,n),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),i.texture.generateMipmaps=v,e.setRenderTarget(i,5,n),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,h),e.setRenderTarget(d,u,f),e.xr.enabled=g,i.texture.needsPMREMUpdate=!0}}class Vp extends It{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}class eh{constructor(e=1,t=0,i=0){this.radius=e,this.phi=t,this.theta=i}set(e,t,i){return this.radius=e,this.phi=t,this.theta=i,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=qe(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,i){return this.radius=Math.sqrt(e*e+t*t+i*i),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,i),this.phi=Math.acos(qe(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}}const Zl=class Zl{constructor(e,t,i,n){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,i,n)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let i=0;i<4;i++)this.elements[i]=e[i+t];return this}set(e,t,i,n){const r=this.elements;return r[0]=e,r[2]=t,r[1]=i,r[3]=n,this}};Zl.prototype.isMatrix2=!0;let th=Zl;class Uu extends Nl{constructor(e=10,t=10,i=4473924,n=8947848){i=new Be(i),n=new Be(n);const r=t/2,o=e/t,a=e/2,c=[],l=[];for(let u=0,f=0,g=-a;u<=t;u++,g+=o){c.push(-a,0,g,a,0,g),c.push(g,0,-a,g,0,a);const v=u===r?i:n;v.toArray(l,f),f+=3,v.toArray(l,f),f+=3,v.toArray(l,f),f+=3,v.toArray(l,f),f+=3}const h=new wt;h.setAttribute("position",new je(c,3)),h.setAttribute("color",new je(l,3));const d=new wn({vertexColors:!0,toneMapped:!1});super(h,d),this.type="GridHelper"}dispose(){this.geometry.dispose(),this.material.dispose()}}const ih=new D;let Ar,aa;class nh extends dt{constructor(e=new D(0,0,1),t=new D(0,0,0),i=1,n=16776960,r=i*.2,o=r*.2){super(),this.type="ArrowHelper",Ar===void 0&&(Ar=new wt,Ar.setAttribute("position",new je([0,0,0,0,1,0],3)),aa=new Dl(.5,1,5,1),aa.translate(0,-.5,0)),this.position.copy(t),this.line=new _o(Ar,new wn({color:n,toneMapped:!1})),this.line.matrixAutoUpdate=!1,this.add(this.line),this.cone=new Ft(aa,new ls({color:n,toneMapped:!1})),this.cone.matrixAutoUpdate=!1,this.add(this.cone),this.setDirection(e),this.setLength(i,r,o)}setDirection(e){if(e.y>.99999)this.quaternion.set(0,0,0,1);else if(e.y<-.99999)this.quaternion.set(1,0,0,0);else{ih.set(e.z,0,-e.x).normalize();const t=Math.acos(e.y);this.quaternion.setFromAxisAngle(ih,t)}}setLength(e,t=e*.2,i=t*.2){this.line.scale.set(1,Math.max(1e-4,e-t),1),this.line.updateMatrix(),this.cone.scale.set(i,t,i),this.cone.position.y=e,this.cone.updateMatrix()}setColor(e){this.line.material.color.set(e),this.cone.material.color.set(e)}copy(e){return super.copy(e,!1),this.line.copy(e.line),this.cone.copy(e.cone),this}dispose(){this.line.geometry.dispose(),this.line.material.dispose(),this.cone.geometry.dispose(),this.cone.material.dispose()}}class Wp extends Nl{constructor(e=1){const t=[0,0,0,e,0,0,0,0,0,0,e,0,0,0,0,0,0,e],i=[1,0,0,1,.6,0,0,1,0,.6,1,0,0,0,1,0,.6,1],n=new wt;n.setAttribute("position",new je(t,3)),n.setAttribute("color",new je(i,3));const r=new wn({vertexColors:!0,toneMapped:!1});super(n,r),this.type="AxesHelper"}setColors(e,t,i){const n=new Be,r=this.geometry.attributes.color.array;return n.set(e),n.toArray(r,0),n.toArray(r,3),n.set(t),n.toArray(r,6),n.toArray(r,9),n.set(i),n.toArray(r,12),n.toArray(r,15),this.geometry.attributes.color.needsUpdate=!0,this}dispose(){this.geometry.dispose(),this.material.dispose()}}class Xp extends an{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(e){if(e===void 0){Le("Controls: connect() now requires an element.");return}this.domElement!==null&&this.disconnect(),this.domElement=e}disconnect(){}dispose(){}update(){}}function sh(s,e,t,i){const n=qp(i);switch(t){case uu:return s*e;case fu:return s*e/n.components*n.byteLength;case Ml:return s*e/n.components*n.byteLength;case Tn:return s*e*2/n.components*n.byteLength;case El:return s*e*2/n.components*n.byteLength;case du:return s*e*3/n.components*n.byteLength;case ai:return s*e*4/n.components*n.byteLength;case Sl:return s*e*4/n.components*n.byteLength;case Wr:case Xr:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case qr:case $r:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case Ia:case Fa:return Math.max(s,16)*Math.max(e,8)/4;case Da:case Ua:return Math.max(s,8)*Math.max(e,8)/2;case Oa:case ka:case za:case Ha:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case Ba:case Zr:case Ga:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case Va:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case Wa:return Math.floor((s+4)/5)*Math.floor((e+3)/4)*16;case Xa:return Math.floor((s+4)/5)*Math.floor((e+4)/5)*16;case qa:return Math.floor((s+5)/6)*Math.floor((e+4)/5)*16;case $a:return Math.floor((s+5)/6)*Math.floor((e+5)/6)*16;case Ya:return Math.floor((s+7)/8)*Math.floor((e+4)/5)*16;case Ka:return Math.floor((s+7)/8)*Math.floor((e+5)/6)*16;case Za:return Math.floor((s+7)/8)*Math.floor((e+7)/8)*16;case Ja:return Math.floor((s+9)/10)*Math.floor((e+4)/5)*16;case ja:return Math.floor((s+9)/10)*Math.floor((e+5)/6)*16;case Qa:return Math.floor((s+9)/10)*Math.floor((e+7)/8)*16;case el:return Math.floor((s+9)/10)*Math.floor((e+9)/10)*16;case tl:return Math.floor((s+11)/12)*Math.floor((e+9)/10)*16;case il:return Math.floor((s+11)/12)*Math.floor((e+11)/12)*16;case nl:case sl:case rl:return Math.ceil(s/4)*Math.ceil(e/4)*16;case ol:case al:return Math.ceil(s/4)*Math.ceil(e/4)*8;case Jr:case ll:return Math.ceil(s/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function qp(s){switch(s){case ei:case au:return{byteLength:1,components:1};case Hs:case lu:case zi:return{byteLength:2,components:1};case yl:case bl:return{byteLength:2,components:4};case wi:case vl:case ui:return{byteLength:4,components:1};case cu:case hu:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${s}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:xl}}));typeof window<"u"&&(window.__THREE__?Le("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=xl);/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function Fu(){let s=null,e=!1,t=null,i=null;function n(r,o){t(r,o),i=s.requestAnimationFrame(n)}return{start:function(){e!==!0&&t!==null&&s!==null&&(i=s.requestAnimationFrame(n),e=!0)},stop:function(){s!==null&&s.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){s=r}}}function $p(s){const e=new WeakMap;function t(a,c){const l=a.array,h=a.usage,d=l.byteLength,u=s.createBuffer();s.bindBuffer(c,u),s.bufferData(c,l,h),a.onUploadCallback();let f;if(l instanceof Float32Array)f=s.FLOAT;else if(typeof Float16Array<"u"&&l instanceof Float16Array)f=s.HALF_FLOAT;else if(l instanceof Uint16Array)a.isFloat16BufferAttribute?f=s.HALF_FLOAT:f=s.UNSIGNED_SHORT;else if(l instanceof Int16Array)f=s.SHORT;else if(l instanceof Uint32Array)f=s.UNSIGNED_INT;else if(l instanceof Int32Array)f=s.INT;else if(l instanceof Int8Array)f=s.BYTE;else if(l instanceof Uint8Array)f=s.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)f=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:u,type:f,bytesPerElement:l.BYTES_PER_ELEMENT,version:a.version,size:d}}function i(a,c,l){const h=c.array,d=c.updateRanges;if(s.bindBuffer(l,a),d.length===0)s.bufferSubData(l,0,h);else{d.sort((f,g)=>f.start-g.start);let u=0;for(let f=1;f<d.length;f++){const g=d[u],v=d[f];v.start<=g.start+g.count+1?g.count=Math.max(g.count,v.start+v.count-g.start):(++u,d[u]=v)}d.length=u+1;for(let f=0,g=d.length;f<g;f++){const v=d[f];s.bufferSubData(l,v.start*h.BYTES_PER_ELEMENT,h,v.start,v.count)}c.clearUpdateRanges()}c.onUploadCallback()}function n(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);const c=e.get(a);c&&(s.deleteBuffer(c.buffer),e.delete(a))}function o(a,c){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const h=e.get(a);(!h||h.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const l=e.get(a);if(l===void 0)e.set(a,t(a,c));else if(l.version<a.version){if(l.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(l.buffer,a,c),l.version=a.version}}return{get:n,remove:r,update:o}}var Yp=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Kp=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Zp=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Jp=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,jp=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Qp=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,em=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,tm=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,im=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,nm=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,sm=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,rm=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,om=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,am=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,lm=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,cm=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,hm=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,um=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,dm=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,fm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,pm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,mm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,gm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,_m=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,xm=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,vm=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,ym=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,bm=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Mm=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Em=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Sm="gl_FragColor = linearToOutputTexel( gl_FragColor );",Tm=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,wm=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,Am=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,Rm=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Cm=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Pm=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Lm=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Nm=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Dm=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Im=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Um=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Fm=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Om=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,km=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Bm=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,zm=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,Hm=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Gm=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Vm=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Wm=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Xm=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,qm=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
		vec3 iridescenceFresnelDielectric;
		vec3 iridescenceFresnelMetallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = texture2D( dfgLUT, vec2( material.roughness, dotNV ) ).rg;
	vec2 dfgL = texture2D( dfgLUT, vec2( material.roughness, dotNL ) ).rg;
	vec3 FssEss_V = material.specularColorBlended * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColorBlended * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColorBlended + ( 1.0 - material.specularColorBlended ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnelDielectric, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceFresnelMetallic, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,$m=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( material.iridescenceFresnelDielectric, material.iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Ym=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Km=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Zm=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,Jm=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,jm=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Qm=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,eg=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,tg=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,ig=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,ng=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,sg=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,rg=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,og=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,ag=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,lg=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,cg=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,hg=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,ug=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,dg=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,fg=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,pg=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,mg=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,gg=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,_g=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,xg=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,vg=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,yg=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,bg=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Mg=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Eg=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,Sg=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Tg=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,wg=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Ag=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Rg=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Cg=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Pg=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,Lg=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Ng=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Dg=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Ig=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Ug=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Fg=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Og=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,kg=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Bg=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,zg=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Hg=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Gg=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Vg=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Wg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Xg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,qg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,$g=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Yg=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Kg=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Zg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Jg=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,jg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Qg=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,e_=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,t_=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,i_=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,n_=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,s_=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,r_=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,o_=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,a_=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,l_=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,c_=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,h_=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,u_=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,d_=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,f_=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,p_=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,m_=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,g_=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,__=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,x_=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,v_=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,y_=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,b_=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,M_=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,E_=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,S_=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,T_=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,w_=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,A_=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Ge={alphahash_fragment:Yp,alphahash_pars_fragment:Kp,alphamap_fragment:Zp,alphamap_pars_fragment:Jp,alphatest_fragment:jp,alphatest_pars_fragment:Qp,aomap_fragment:em,aomap_pars_fragment:tm,batching_pars_vertex:im,batching_vertex:nm,begin_vertex:sm,beginnormal_vertex:rm,bsdfs:om,iridescence_fragment:am,bumpmap_pars_fragment:lm,clipping_planes_fragment:cm,clipping_planes_pars_fragment:hm,clipping_planes_pars_vertex:um,clipping_planes_vertex:dm,color_fragment:fm,color_pars_fragment:pm,color_pars_vertex:mm,color_vertex:gm,common:_m,cube_uv_reflection_fragment:xm,defaultnormal_vertex:vm,displacementmap_pars_vertex:ym,displacementmap_vertex:bm,emissivemap_fragment:Mm,emissivemap_pars_fragment:Em,colorspace_fragment:Sm,colorspace_pars_fragment:Tm,envmap_fragment:wm,envmap_common_pars_fragment:Am,envmap_pars_fragment:Rm,envmap_pars_vertex:Cm,envmap_physical_pars_fragment:zm,envmap_vertex:Pm,fog_vertex:Lm,fog_pars_vertex:Nm,fog_fragment:Dm,fog_pars_fragment:Im,gradientmap_pars_fragment:Um,lightmap_pars_fragment:Fm,lights_lambert_fragment:Om,lights_lambert_pars_fragment:km,lights_pars_begin:Bm,lights_toon_fragment:Hm,lights_toon_pars_fragment:Gm,lights_phong_fragment:Vm,lights_phong_pars_fragment:Wm,lights_physical_fragment:Xm,lights_physical_pars_fragment:qm,lights_fragment_begin:$m,lights_fragment_maps:Ym,lights_fragment_end:Km,lightprobes_pars_fragment:Zm,logdepthbuf_fragment:Jm,logdepthbuf_pars_fragment:jm,logdepthbuf_pars_vertex:Qm,logdepthbuf_vertex:eg,map_fragment:tg,map_pars_fragment:ig,map_particle_fragment:ng,map_particle_pars_fragment:sg,metalnessmap_fragment:rg,metalnessmap_pars_fragment:og,morphinstance_vertex:ag,morphcolor_vertex:lg,morphnormal_vertex:cg,morphtarget_pars_vertex:hg,morphtarget_vertex:ug,normal_fragment_begin:dg,normal_fragment_maps:fg,normal_pars_fragment:pg,normal_pars_vertex:mg,normal_vertex:gg,normalmap_pars_fragment:_g,clearcoat_normal_fragment_begin:xg,clearcoat_normal_fragment_maps:vg,clearcoat_pars_fragment:yg,iridescence_pars_fragment:bg,opaque_fragment:Mg,packing:Eg,premultiplied_alpha_fragment:Sg,project_vertex:Tg,dithering_fragment:wg,dithering_pars_fragment:Ag,roughnessmap_fragment:Rg,roughnessmap_pars_fragment:Cg,shadowmap_pars_fragment:Pg,shadowmap_pars_vertex:Lg,shadowmap_vertex:Ng,shadowmask_pars_fragment:Dg,skinbase_vertex:Ig,skinning_pars_vertex:Ug,skinning_vertex:Fg,skinnormal_vertex:Og,specularmap_fragment:kg,specularmap_pars_fragment:Bg,tonemapping_fragment:zg,tonemapping_pars_fragment:Hg,transmission_fragment:Gg,transmission_pars_fragment:Vg,uv_pars_fragment:Wg,uv_pars_vertex:Xg,uv_vertex:qg,worldpos_vertex:$g,background_vert:Yg,background_frag:Kg,backgroundCube_vert:Zg,backgroundCube_frag:Jg,cube_vert:jg,cube_frag:Qg,depth_vert:e_,depth_frag:t_,distance_vert:i_,distance_frag:n_,equirect_vert:s_,equirect_frag:r_,linedashed_vert:o_,linedashed_frag:a_,meshbasic_vert:l_,meshbasic_frag:c_,meshlambert_vert:h_,meshlambert_frag:u_,meshmatcap_vert:d_,meshmatcap_frag:f_,meshnormal_vert:p_,meshnormal_frag:m_,meshphong_vert:g_,meshphong_frag:__,meshphysical_vert:x_,meshphysical_frag:v_,meshtoon_vert:y_,meshtoon_frag:b_,points_vert:M_,points_frag:E_,shadow_vert:S_,shadow_frag:T_,sprite_vert:w_,sprite_frag:A_},pe={common:{diffuse:{value:new Be(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ke},alphaMap:{value:null},alphaMapTransform:{value:new ke},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ke}},envmap:{envMap:{value:null},envMapRotation:{value:new ke},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ke}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ke}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ke},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ke},normalScale:{value:new De(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ke},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ke}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ke}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ke}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Be(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new D},probesMax:{value:new D},probesResolution:{value:new D}},points:{diffuse:{value:new Be(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ke},alphaTest:{value:0},uvTransform:{value:new ke}},sprite:{diffuse:{value:new Be(16777215)},opacity:{value:1},center:{value:new De(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ke},alphaMap:{value:null},alphaMapTransform:{value:new ke},alphaTest:{value:0}}},bi={basic:{uniforms:Wt([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.fog]),vertexShader:Ge.meshbasic_vert,fragmentShader:Ge.meshbasic_frag},lambert:{uniforms:Wt([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,pe.lights,{emissive:{value:new Be(0)},envMapIntensity:{value:1}}]),vertexShader:Ge.meshlambert_vert,fragmentShader:Ge.meshlambert_frag},phong:{uniforms:Wt([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,pe.lights,{emissive:{value:new Be(0)},specular:{value:new Be(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Ge.meshphong_vert,fragmentShader:Ge.meshphong_frag},standard:{uniforms:Wt([pe.common,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.roughnessmap,pe.metalnessmap,pe.fog,pe.lights,{emissive:{value:new Be(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ge.meshphysical_vert,fragmentShader:Ge.meshphysical_frag},toon:{uniforms:Wt([pe.common,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.gradientmap,pe.fog,pe.lights,{emissive:{value:new Be(0)}}]),vertexShader:Ge.meshtoon_vert,fragmentShader:Ge.meshtoon_frag},matcap:{uniforms:Wt([pe.common,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,{matcap:{value:null}}]),vertexShader:Ge.meshmatcap_vert,fragmentShader:Ge.meshmatcap_frag},points:{uniforms:Wt([pe.points,pe.fog]),vertexShader:Ge.points_vert,fragmentShader:Ge.points_frag},dashed:{uniforms:Wt([pe.common,pe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ge.linedashed_vert,fragmentShader:Ge.linedashed_frag},depth:{uniforms:Wt([pe.common,pe.displacementmap]),vertexShader:Ge.depth_vert,fragmentShader:Ge.depth_frag},normal:{uniforms:Wt([pe.common,pe.bumpmap,pe.normalmap,pe.displacementmap,{opacity:{value:1}}]),vertexShader:Ge.meshnormal_vert,fragmentShader:Ge.meshnormal_frag},sprite:{uniforms:Wt([pe.sprite,pe.fog]),vertexShader:Ge.sprite_vert,fragmentShader:Ge.sprite_frag},background:{uniforms:{uvTransform:{value:new ke},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ge.background_vert,fragmentShader:Ge.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ke}},vertexShader:Ge.backgroundCube_vert,fragmentShader:Ge.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ge.cube_vert,fragmentShader:Ge.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ge.equirect_vert,fragmentShader:Ge.equirect_frag},distance:{uniforms:Wt([pe.common,pe.displacementmap,{referencePosition:{value:new D},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ge.distance_vert,fragmentShader:Ge.distance_frag},shadow:{uniforms:Wt([pe.lights,pe.fog,{color:{value:new Be(0)},opacity:{value:1}}]),vertexShader:Ge.shadow_vert,fragmentShader:Ge.shadow_frag}};bi.physical={uniforms:Wt([bi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ke},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ke},clearcoatNormalScale:{value:new De(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ke},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ke},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ke},sheen:{value:0},sheenColor:{value:new Be(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ke},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ke},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ke},transmissionSamplerSize:{value:new De},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ke},attenuationDistance:{value:0},attenuationColor:{value:new Be(0)},specularColor:{value:new Be(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ke},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ke},anisotropyVector:{value:new De},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ke}}]),vertexShader:Ge.meshphysical_vert,fragmentShader:Ge.meshphysical_frag};const Rr={r:0,b:0,g:0},R_=new Oe,Ou=new ke;Ou.set(-1,0,0,0,1,0,0,0,1);function C_(s,e,t,i,n,r){const o=new Be(0);let a=n===!0?0:1,c,l,h=null,d=0,u=null;function f(T){let M=T.isScene===!0?T.background:null;if(M&&M.isTexture){const x=T.backgroundBlurriness>0;M=e.get(M,x)}return M}function g(T){let M=!1;const x=f(T);x===null?m(o,a):x&&x.isColor&&(m(x,1),M=!0);const b=s.xr.getEnvironmentBlendMode();b==="additive"?t.buffers.color.setClear(0,0,0,1,r):b==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(s.autoClear||M)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil))}function v(T,M){const x=f(M);x&&(x.isCubeTexture||x.mapping===mo)?(l===void 0&&(l=new Ft(new ps(1,1,1),new Ai({name:"BackgroundCubeMaterial",uniforms:us(bi.backgroundCube.uniforms),vertexShader:bi.backgroundCube.vertexShader,fragmentShader:bi.backgroundCube.fragmentShader,side:Yt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),l.geometry.deleteAttribute("uv"),l.onBeforeRender=function(b,S,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(l)),l.material.uniforms.envMap.value=x,l.material.uniforms.backgroundBlurriness.value=M.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(R_.makeRotationFromEuler(M.backgroundRotation)).transpose(),x.isCubeTexture&&x.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(Ou),l.material.toneMapped=Xe.getTransfer(x.colorSpace)!==tt,(h!==x||d!==x.version||u!==s.toneMapping)&&(l.material.needsUpdate=!0,h=x,d=x.version,u=s.toneMapping),l.layers.enableAll(),T.unshift(l,l.geometry,l.material,0,0,null)):x&&x.isTexture&&(c===void 0&&(c=new Ft(new vo(2,2),new Ai({name:"BackgroundMaterial",uniforms:us(bi.background.uniforms),vertexShader:bi.background.vertexShader,fragmentShader:bi.background.fragmentShader,side:Bi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(c)),c.material.uniforms.t2D.value=x,c.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,c.material.toneMapped=Xe.getTransfer(x.colorSpace)!==tt,x.matrixAutoUpdate===!0&&x.updateMatrix(),c.material.uniforms.uvTransform.value.copy(x.matrix),(h!==x||d!==x.version||u!==s.toneMapping)&&(c.material.needsUpdate=!0,h=x,d=x.version,u=s.toneMapping),c.layers.enableAll(),T.unshift(c,c.geometry,c.material,0,0,null))}function m(T,M){T.getRGB(Rr,Au(s)),t.buffers.color.setClear(Rr.r,Rr.g,Rr.b,M,r)}function p(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(T,M=1){o.set(T),a=M,m(o,a)},getClearAlpha:function(){return a},setClearAlpha:function(T){a=T,m(o,a)},render:g,addToRenderList:v,dispose:p}}function P_(s,e){const t=s.getParameter(s.MAX_VERTEX_ATTRIBS),i={},n=u(null);let r=n,o=!1;function a(C,L,k,q,U){let N=!1;const F=d(C,q,k,L);r!==F&&(r=F,l(r.object)),N=f(C,q,k,U),N&&g(C,q,k,U),U!==null&&e.update(U,s.ELEMENT_ARRAY_BUFFER),(N||o)&&(o=!1,x(C,L,k,q),U!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,e.get(U).buffer))}function c(){return s.createVertexArray()}function l(C){return s.bindVertexArray(C)}function h(C){return s.deleteVertexArray(C)}function d(C,L,k,q){const U=q.wireframe===!0;let N=i[L.id];N===void 0&&(N={},i[L.id]=N);const F=C.isInstancedMesh===!0?C.id:0;let W=N[F];W===void 0&&(W={},N[F]=W);let K=W[k.id];K===void 0&&(K={},W[k.id]=K);let ne=K[U];return ne===void 0&&(ne=u(c()),K[U]=ne),ne}function u(C){const L=[],k=[],q=[];for(let U=0;U<t;U++)L[U]=0,k[U]=0,q[U]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:L,enabledAttributes:k,attributeDivisors:q,object:C,attributes:{},index:null}}function f(C,L,k,q){const U=r.attributes,N=L.attributes;let F=0;const W=k.getAttributes();for(const K in W)if(W[K].location>=0){const se=U[K];let re=N[K];if(re===void 0&&(K==="instanceMatrix"&&C.instanceMatrix&&(re=C.instanceMatrix),K==="instanceColor"&&C.instanceColor&&(re=C.instanceColor)),se===void 0||se.attribute!==re||re&&se.data!==re.data)return!0;F++}return r.attributesNum!==F||r.index!==q}function g(C,L,k,q){const U={},N=L.attributes;let F=0;const W=k.getAttributes();for(const K in W)if(W[K].location>=0){let se=N[K];se===void 0&&(K==="instanceMatrix"&&C.instanceMatrix&&(se=C.instanceMatrix),K==="instanceColor"&&C.instanceColor&&(se=C.instanceColor));const re={};re.attribute=se,se&&se.data&&(re.data=se.data),U[K]=re,F++}r.attributes=U,r.attributesNum=F,r.index=q}function v(){const C=r.newAttributes;for(let L=0,k=C.length;L<k;L++)C[L]=0}function m(C){p(C,0)}function p(C,L){const k=r.newAttributes,q=r.enabledAttributes,U=r.attributeDivisors;k[C]=1,q[C]===0&&(s.enableVertexAttribArray(C),q[C]=1),U[C]!==L&&(s.vertexAttribDivisor(C,L),U[C]=L)}function T(){const C=r.newAttributes,L=r.enabledAttributes;for(let k=0,q=L.length;k<q;k++)L[k]!==C[k]&&(s.disableVertexAttribArray(k),L[k]=0)}function M(C,L,k,q,U,N,F){F===!0?s.vertexAttribIPointer(C,L,k,U,N):s.vertexAttribPointer(C,L,k,q,U,N)}function x(C,L,k,q){v();const U=q.attributes,N=k.getAttributes(),F=L.defaultAttributeValues;for(const W in N){const K=N[W];if(K.location>=0){let ne=U[W];if(ne===void 0&&(W==="instanceMatrix"&&C.instanceMatrix&&(ne=C.instanceMatrix),W==="instanceColor"&&C.instanceColor&&(ne=C.instanceColor)),ne!==void 0){const se=ne.normalized,re=ne.itemSize,xe=e.get(ne);if(xe===void 0)continue;const ve=xe.buffer,ae=xe.type,z=xe.bytesPerElement,j=ae===s.INT||ae===s.UNSIGNED_INT||ne.gpuType===vl;if(ne.isInterleavedBufferAttribute){const te=ne.data,we=te.stride,Fe=ne.offset;if(te.isInstancedInterleavedBuffer){for(let Ie=0;Ie<K.locationSize;Ie++)p(K.location+Ie,te.meshPerAttribute);C.isInstancedMesh!==!0&&q._maxInstanceCount===void 0&&(q._maxInstanceCount=te.meshPerAttribute*te.count)}else for(let Ie=0;Ie<K.locationSize;Ie++)m(K.location+Ie);s.bindBuffer(s.ARRAY_BUFFER,ve);for(let Ie=0;Ie<K.locationSize;Ie++)M(K.location+Ie,re/K.locationSize,ae,se,we*z,(Fe+re/K.locationSize*Ie)*z,j)}else{if(ne.isInstancedBufferAttribute){for(let te=0;te<K.locationSize;te++)p(K.location+te,ne.meshPerAttribute);C.isInstancedMesh!==!0&&q._maxInstanceCount===void 0&&(q._maxInstanceCount=ne.meshPerAttribute*ne.count)}else for(let te=0;te<K.locationSize;te++)m(K.location+te);s.bindBuffer(s.ARRAY_BUFFER,ve);for(let te=0;te<K.locationSize;te++)M(K.location+te,re/K.locationSize,ae,se,re*z,re/K.locationSize*te*z,j)}}else if(F!==void 0){const se=F[W];if(se!==void 0)switch(se.length){case 2:s.vertexAttrib2fv(K.location,se);break;case 3:s.vertexAttrib3fv(K.location,se);break;case 4:s.vertexAttrib4fv(K.location,se);break;default:s.vertexAttrib1fv(K.location,se)}}}}T()}function b(){E();for(const C in i){const L=i[C];for(const k in L){const q=L[k];for(const U in q){const N=q[U];for(const F in N)h(N[F].object),delete N[F];delete q[U]}}delete i[C]}}function S(C){if(i[C.id]===void 0)return;const L=i[C.id];for(const k in L){const q=L[k];for(const U in q){const N=q[U];for(const F in N)h(N[F].object),delete N[F];delete q[U]}}delete i[C.id]}function A(C){for(const L in i){const k=i[L];for(const q in k){const U=k[q];if(U[C.id]===void 0)continue;const N=U[C.id];for(const F in N)h(N[F].object),delete N[F];delete U[C.id]}}}function _(C){for(const L in i){const k=i[L],q=C.isInstancedMesh===!0?C.id:0,U=k[q];if(U!==void 0){for(const N in U){const F=U[N];for(const W in F)h(F[W].object),delete F[W];delete U[N]}delete k[q],Object.keys(k).length===0&&delete i[L]}}}function E(){R(),o=!0,r!==n&&(r=n,l(r.object))}function R(){n.geometry=null,n.program=null,n.wireframe=!1}return{setup:a,reset:E,resetDefaultState:R,dispose:b,releaseStatesOfGeometry:S,releaseStatesOfObject:_,releaseStatesOfProgram:A,initAttributes:v,enableAttribute:m,disableUnusedAttributes:T}}function L_(s,e,t){let i;function n(c){i=c}function r(c,l){s.drawArrays(i,c,l),t.update(l,i,1)}function o(c,l,h){h!==0&&(s.drawArraysInstanced(i,c,l,h),t.update(l,i,h))}function a(c,l,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,l,0,h);let u=0;for(let f=0;f<h;f++)u+=l[f];t.update(u,i,1)}this.setMode=n,this.render=r,this.renderInstances=o,this.renderMultiDraw=a}function N_(s,e,t,i){let n;function r(){if(n!==void 0)return n;if(e.has("EXT_texture_filter_anisotropic")===!0){const A=e.get("EXT_texture_filter_anisotropic");n=s.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else n=0;return n}function o(A){return!(A!==ai&&i.convert(A)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(A){const _=A===zi&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(A!==ei&&i.convert(A)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE)&&A!==ui&&!_)}function c(A){if(A==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=t.precision!==void 0?t.precision:"highp";const h=c(l);h!==l&&(Le("WebGLRenderer:",l,"not supported, using",h,"instead."),l=h);const d=t.logarithmicDepthBuffer===!0,u=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&u===!1&&Le("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");const f=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),g=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=s.getParameter(s.MAX_TEXTURE_SIZE),m=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),p=s.getParameter(s.MAX_VERTEX_ATTRIBS),T=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),M=s.getParameter(s.MAX_VARYING_VECTORS),x=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),b=s.getParameter(s.MAX_SAMPLES),S=s.getParameter(s.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:a,precision:l,logarithmicDepthBuffer:d,reversedDepthBuffer:u,maxTextures:f,maxVertexTextures:g,maxTextureSize:v,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:T,maxVaryings:M,maxFragmentUniforms:x,maxSamples:b,samples:S}}function D_(s){const e=this;let t=null,i=0,n=!1,r=!1;const o=new tn,a=new ke,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(d,u){const f=d.length!==0||u||i!==0||n;return n=u,i=d.length,f},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(d,u){t=h(d,u,0)},this.setState=function(d,u,f){const g=d.clippingPlanes,v=d.clipIntersection,m=d.clipShadows,p=s.get(d);if(!n||g===null||g.length===0||r&&!m)r?h(null):l();else{const T=r?0:i,M=T*4;let x=p.clippingState||null;c.value=x,x=h(g,u,M,f);for(let b=0;b!==M;++b)x[b]=t[b];p.clippingState=x,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=T}};function l(){c.value!==t&&(c.value=t,c.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function h(d,u,f,g){const v=d!==null?d.length:0;let m=null;if(v!==0){if(m=c.value,g!==!0||m===null){const p=f+v*4,T=u.matrixWorldInverse;a.getNormalMatrix(T),(m===null||m.length<p)&&(m=new Float32Array(p));for(let M=0,x=f;M!==v;++M,x+=4)o.copy(d[M]).applyMatrix4(T,a),o.normal.toArray(m,x),m[x+3]=o.constant}c.value=m,c.needsUpdate=!0}return e.numPlanes=v,e.numIntersection=0,m}}const rn=4,rh=[.125,.215,.35,.446,.526,.582],bn=20,I_=256,Ss=new bo,oh=new Be;let la=null,ca=0,ha=0,ua=!1;const U_=new D;class ah{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,i=.1,n=100,r={}){const{size:o=256,position:a=U_}=r;la=this._renderer.getRenderTarget(),ca=this._renderer.getActiveCubeFace(),ha=this._renderer.getActiveMipmapLevel(),ua=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);const c=this._allocateTargets();return c.depthBuffer=!0,this._sceneToCubeUV(e,i,n,c,a),t>0&&this._blur(c,0,0,t),this._applyPMREM(c),this._cleanup(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=hh(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=ch(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(la,ca,ha),this._renderer.xr.enabled=ua,e.scissorTest=!1,Xn(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Sn||e.mapping===os?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),la=this._renderer.getRenderTarget(),ca=this._renderer.getActiveCubeFace(),ha=this._renderer.getActiveMipmapLevel(),ua=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:Tt,minFilter:Tt,generateMipmaps:!1,type:zi,format:ai,colorSpace:Qr,depthBuffer:!1},n=lh(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=lh(e,t,i);const{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=F_(r)),this._blurMaterial=k_(r,e,t),this._ggxMaterial=O_(r,e,t)}return n}_compileMaterial(e){const t=new Ft(new wt,e);this._renderer.compile(t,Ss)}_sceneToCubeUV(e,t,i,n,r){const c=new It(90,1,t,i),l=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],d=this._renderer,u=d.autoClear,f=d.toneMapping;d.getClearColor(oh),d.toneMapping=Si,d.autoClear=!1,d.state.buffers.depth.getReversed()&&(d.setRenderTarget(n),d.clearDepth(),d.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new Ft(new ps,new ls({name:"PMREM.Background",side:Yt,depthWrite:!1,depthTest:!1})));const v=this._backgroundBox,m=v.material;let p=!1;const T=e.background;T?T.isColor&&(m.color.copy(T),e.background=null,p=!0):(m.color.copy(oh),p=!0);for(let M=0;M<6;M++){const x=M%3;x===0?(c.up.set(0,l[M],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x+h[M],r.y,r.z)):x===1?(c.up.set(0,0,l[M]),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y+h[M],r.z)):(c.up.set(0,l[M],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y,r.z+h[M]));const b=this._cubeSize;Xn(n,x*b,M>2?b:0,b,b),d.setRenderTarget(n),p&&d.render(v,c),d.render(e,c)}d.toneMapping=f,d.autoClear=u,e.background=T}_textureToCubeUV(e,t){const i=this._renderer,n=e.mapping===Sn||e.mapping===os;n?(this._cubemapMaterial===null&&(this._cubemapMaterial=hh()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=ch());const r=n?this._cubemapMaterial:this._equirectMaterial,o=this._lodMeshes[0];o.material=r;const a=r.uniforms;a.envMap.value=e;const c=this._cubeSize;Xn(t,0,0,3*c,2*c),i.setRenderTarget(t),i.render(o,Ss)}_applyPMREM(e){const t=this._renderer,i=t.autoClear;t.autoClear=!1;const n=this._lodMeshes.length;for(let r=1;r<n;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=i}_applyGGXFilter(e,t,i){const n=this._renderer,r=this._pingPongRenderTarget,o=this._ggxMaterial,a=this._lodMeshes[i];a.material=o;const c=o.uniforms,l=i/(this._lodMeshes.length-1),h=t/(this._lodMeshes.length-1),d=Math.sqrt(l*l-h*h),u=0+l*1.25,f=d*u,{_lodMax:g}=this,v=this._sizeLods[i],m=3*v*(i>g-rn?i-g+rn:0),p=4*(this._cubeSize-v);c.envMap.value=e.texture,c.roughness.value=f,c.mipInt.value=g-t,Xn(r,m,p,3*v,2*v),n.setRenderTarget(r),n.render(a,Ss),c.envMap.value=r.texture,c.roughness.value=0,c.mipInt.value=g-i,Xn(e,m,p,3*v,2*v),n.setRenderTarget(e),n.render(a,Ss)}_blur(e,t,i,n,r){const o=this._pingPongRenderTarget;this._halfBlur(e,o,t,i,n,"latitudinal",r),this._halfBlur(o,e,i,i,n,"longitudinal",r)}_halfBlur(e,t,i,n,r,o,a){const c=this._renderer,l=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&We("blur direction must be either latitudinal or longitudinal!");const h=3,d=this._lodMeshes[n];d.material=l;const u=l.uniforms,f=this._sizeLods[i]-1,g=isFinite(r)?Math.PI/(2*f):2*Math.PI/(2*bn-1),v=r/g,m=isFinite(r)?1+Math.floor(h*v):bn;m>bn&&Le(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${bn}`);const p=[];let T=0;for(let A=0;A<bn;++A){const _=A/v,E=Math.exp(-_*_/2);p.push(E),A===0?T+=E:A<m&&(T+=2*E)}for(let A=0;A<p.length;A++)p[A]=p[A]/T;u.envMap.value=e.texture,u.samples.value=m,u.weights.value=p,u.latitudinal.value=o==="latitudinal",a&&(u.poleAxis.value=a);const{_lodMax:M}=this;u.dTheta.value=g,u.mipInt.value=M-i;const x=this._sizeLods[n],b=3*x*(n>M-rn?n-M+rn:0),S=4*(this._cubeSize-x);Xn(t,b,S,3*x,2*x),c.setRenderTarget(t),c.render(d,Ss)}}function F_(s){const e=[],t=[],i=[];let n=s;const r=s-rn+1+rh.length;for(let o=0;o<r;o++){const a=Math.pow(2,n);e.push(a);let c=1/a;o>s-rn?c=rh[o-s+rn-1]:o===0&&(c=0),t.push(c);const l=1/(a-2),h=-l,d=1+l,u=[h,h,d,h,d,d,h,h,d,d,h,d],f=6,g=6,v=3,m=2,p=1,T=new Float32Array(v*g*f),M=new Float32Array(m*g*f),x=new Float32Array(p*g*f);for(let S=0;S<f;S++){const A=S%3*2/3-1,_=S>2?0:-1,E=[A,_,0,A+2/3,_,0,A+2/3,_+1,0,A,_,0,A+2/3,_+1,0,A,_+1,0];T.set(E,v*g*S),M.set(u,m*g*S);const R=[S,S,S,S,S,S];x.set(R,p*g*S)}const b=new wt;b.setAttribute("position",new ii(T,v)),b.setAttribute("uv",new ii(M,m)),b.setAttribute("faceIndex",new ii(x,p)),i.push(new Ft(b,null)),n>rn&&n--}return{lodMeshes:i,sizeLods:e,sigmas:t}}function lh(s,e,t){const i=new Ti(s,e,t);return i.texture.mapping=mo,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Xn(s,e,t,i,n){s.viewport.set(e,t,i,n),s.scissor.set(e,t,i,n)}function O_(s,e,t){return new Ai({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:I_,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Mo(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:Oi,depthTest:!1,depthWrite:!1})}function k_(s,e,t){const i=new Float32Array(bn),n=new D(0,1,0);return new Ai({name:"SphericalGaussianBlur",defines:{n:bn,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:n}},vertexShader:Mo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Oi,depthTest:!1,depthWrite:!1})}function ch(){return new Ai({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Mo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Oi,depthTest:!1,depthWrite:!1})}function hh(){return new Ai({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Mo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Oi,depthTest:!1,depthWrite:!1})}function Mo(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}class ku extends Ti{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const i={width:e,height:e,depth:1},n=[i,i,i,i,i,i];this.texture=new bu(n),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},n=new ps(5,5,5),r=new Ai({name:"CubemapFromEquirect",uniforms:us(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:Yt,blending:Oi});r.uniforms.tEquirect.value=t;const o=new Ft(n,r),a=t.minFilter;return t.minFilter===Fi&&(t.minFilter=Tt),new Gp(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,i=!0,n=!0){const r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,i,n);e.setRenderTarget(r)}}function B_(s){let e=new WeakMap,t=new WeakMap,i=null;function n(u,f=!1){return u==null?null:f?o(u):r(u)}function r(u){if(u&&u.isTexture){const f=u.mapping;if(f===Lo||f===No)if(e.has(u)){const g=e.get(u).texture;return a(g,u.mapping)}else{const g=u.image;if(g&&g.height>0){const v=new ku(g.height);return v.fromEquirectangularTexture(s,u),e.set(u,v),u.addEventListener("dispose",l),a(v.texture,u.mapping)}else return null}}return u}function o(u){if(u&&u.isTexture){const f=u.mapping,g=f===Lo||f===No,v=f===Sn||f===os;if(g||v){let m=t.get(u);const p=m!==void 0?m.texture.pmremVersion:0;if(u.isRenderTargetTexture&&u.pmremVersion!==p)return i===null&&(i=new ah(s)),m=g?i.fromEquirectangular(u,m):i.fromCubemap(u,m),m.texture.pmremVersion=u.pmremVersion,t.set(u,m),m.texture;if(m!==void 0)return m.texture;{const T=u.image;return g&&T&&T.height>0||v&&T&&c(T)?(i===null&&(i=new ah(s)),m=g?i.fromEquirectangular(u):i.fromCubemap(u),m.texture.pmremVersion=u.pmremVersion,t.set(u,m),u.addEventListener("dispose",h),m.texture):null}}}return u}function a(u,f){return f===Lo?u.mapping=Sn:f===No&&(u.mapping=os),u}function c(u){let f=0;const g=6;for(let v=0;v<g;v++)u[v]!==void 0&&f++;return f===g}function l(u){const f=u.target;f.removeEventListener("dispose",l);const g=e.get(f);g!==void 0&&(e.delete(f),g.dispose())}function h(u){const f=u.target;f.removeEventListener("dispose",h);const g=t.get(f);g!==void 0&&(t.delete(f),g.dispose())}function d(){e=new WeakMap,t=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:n,dispose:d}}function z_(s){const e={};function t(i){if(e[i]!==void 0)return e[i];const n=s.getExtension(i);return e[i]=n,n}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){const n=t(i);return n===null&&ts("WebGLRenderer: "+i+" extension not supported."),n}}}function H_(s,e,t,i){const n={},r=new WeakMap;function o(d){const u=d.target;u.index!==null&&e.remove(u.index);for(const g in u.attributes)e.remove(u.attributes[g]);u.removeEventListener("dispose",o),delete n[u.id];const f=r.get(u);f&&(e.remove(f),r.delete(u)),i.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,t.memory.geometries--}function a(d,u){return n[u.id]===!0||(u.addEventListener("dispose",o),n[u.id]=!0,t.memory.geometries++),u}function c(d){const u=d.attributes;for(const f in u)e.update(u[f],s.ARRAY_BUFFER)}function l(d){const u=[],f=d.index,g=d.attributes.position;let v=0;if(g===void 0)return;if(f!==null){const T=f.array;v=f.version;for(let M=0,x=T.length;M<x;M+=3){const b=T[M+0],S=T[M+1],A=T[M+2];u.push(b,S,S,A,A,b)}}else{const T=g.array;v=g.version;for(let M=0,x=T.length/3-1;M<x;M+=3){const b=M+0,S=M+1,A=M+2;u.push(b,S,S,A,A,b)}}const m=new(g.count>=65535?vu:xu)(u,1);m.version=v;const p=r.get(d);p&&e.remove(p),r.set(d,m)}function h(d){const u=r.get(d);if(u){const f=d.index;f!==null&&u.version<f.version&&l(d)}else l(d);return r.get(d)}return{get:a,update:c,getWireframeAttribute:h}}function G_(s,e,t){let i;function n(d){i=d}let r,o;function a(d){r=d.type,o=d.bytesPerElement}function c(d,u){s.drawElements(i,u,r,d*o),t.update(u,i,1)}function l(d,u,f){f!==0&&(s.drawElementsInstanced(i,u,r,d*o,f),t.update(u,i,f))}function h(d,u,f){if(f===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,u,0,r,d,0,f);let v=0;for(let m=0;m<f;m++)v+=u[m];t.update(v,i,1)}this.setMode=n,this.setIndex=a,this.render=c,this.renderInstances=l,this.renderMultiDraw=h}function V_(s){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,o,a){switch(t.calls++,o){case s.TRIANGLES:t.triangles+=a*(r/3);break;case s.LINES:t.lines+=a*(r/2);break;case s.LINE_STRIP:t.lines+=a*(r-1);break;case s.LINE_LOOP:t.lines+=a*r;break;case s.POINTS:t.points+=a*r;break;default:We("WebGLInfo: Unknown draw mode:",o);break}}function n(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:n,update:i}}function W_(s,e,t){const i=new WeakMap,n=new st;function r(o,a,c){const l=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,d=h!==void 0?h.length:0;let u=i.get(a);if(u===void 0||u.count!==d){let R=function(){_.dispose(),i.delete(a),a.removeEventListener("dispose",R)};var f=R;u!==void 0&&u.texture.dispose();const g=a.morphAttributes.position!==void 0,v=a.morphAttributes.normal!==void 0,m=a.morphAttributes.color!==void 0,p=a.morphAttributes.position||[],T=a.morphAttributes.normal||[],M=a.morphAttributes.color||[];let x=0;g===!0&&(x=1),v===!0&&(x=2),m===!0&&(x=3);let b=a.attributes.position.count*x,S=1;b>e.maxTextureSize&&(S=Math.ceil(b/e.maxTextureSize),b=e.maxTextureSize);const A=new Float32Array(b*S*4*d),_=new mu(A,b,S,d);_.type=ui,_.needsUpdate=!0;const E=x*4;for(let C=0;C<d;C++){const L=p[C],k=T[C],q=M[C],U=b*S*4*C;for(let N=0;N<L.count;N++){const F=N*E;g===!0&&(n.fromBufferAttribute(L,N),A[U+F+0]=n.x,A[U+F+1]=n.y,A[U+F+2]=n.z,A[U+F+3]=0),v===!0&&(n.fromBufferAttribute(k,N),A[U+F+4]=n.x,A[U+F+5]=n.y,A[U+F+6]=n.z,A[U+F+7]=0),m===!0&&(n.fromBufferAttribute(q,N),A[U+F+8]=n.x,A[U+F+9]=n.y,A[U+F+10]=n.z,A[U+F+11]=q.itemSize===4?n.w:1)}}u={count:d,texture:_,size:new De(b,S)},i.set(a,u),a.addEventListener("dispose",R)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)c.getUniforms().setValue(s,"morphTexture",o.morphTexture,t);else{let g=0;for(let m=0;m<l.length;m++)g+=l[m];const v=a.morphTargetsRelative?1:1-g;c.getUniforms().setValue(s,"morphTargetBaseInfluence",v),c.getUniforms().setValue(s,"morphTargetInfluences",l)}c.getUniforms().setValue(s,"morphTargetsTexture",u.texture,t),c.getUniforms().setValue(s,"morphTargetsTextureSize",u.size)}return{update:r}}function X_(s,e,t,i,n){let r=new WeakMap;function o(l){const h=n.render.frame,d=l.geometry,u=e.get(l,d);if(r.get(u)!==h&&(e.update(u),r.set(u,h)),l.isInstancedMesh&&(l.hasEventListener("dispose",c)===!1&&l.addEventListener("dispose",c),r.get(l)!==h&&(t.update(l.instanceMatrix,s.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,s.ARRAY_BUFFER),r.set(l,h))),l.isSkinnedMesh){const f=l.skeleton;r.get(f)!==h&&(f.update(),r.set(f,h))}return u}function a(){r=new WeakMap}function c(l){const h=l.target;h.removeEventListener("dispose",c),i.releaseStatesOfObject(h),t.remove(h.instanceMatrix),h.instanceColor!==null&&t.remove(h.instanceColor)}return{update:o,dispose:a}}const q_={[Qh]:"LINEAR_TONE_MAPPING",[eu]:"REINHARD_TONE_MAPPING",[tu]:"CINEON_TONE_MAPPING",[iu]:"ACES_FILMIC_TONE_MAPPING",[su]:"AGX_TONE_MAPPING",[ru]:"NEUTRAL_TONE_MAPPING",[nu]:"CUSTOM_TONE_MAPPING"};function $_(s,e,t,i,n,r){const o=new Ti(e,t,{type:s,depthBuffer:n,stencilBuffer:r,samples:i?4:0,depthTexture:n?new cs(e,t):void 0}),a=new Ti(e,t,{type:zi,depthBuffer:!1,stencilBuffer:!1}),c=new wt;c.setAttribute("position",new je([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new je([0,2,0,0,2,0],2));const l=new vp({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),h=new Ft(c,l),d=new bo(-1,1,1,-1,0,1);let u=null,f=null,g=!1,v,m=null,p=[],T=!1;this.setSize=function(M,x){o.setSize(M,x),a.setSize(M,x);for(let b=0;b<p.length;b++){const S=p[b];S.setSize&&S.setSize(M,x)}},this.setEffects=function(M){p=M,T=p.length>0&&p[0].isRenderPass===!0;const x=o.width,b=o.height;for(let S=0;S<p.length;S++){const A=p[S];A.setSize&&A.setSize(x,b)}},this.begin=function(M,x){if(g||M.toneMapping===Si&&p.length===0)return!1;if(m=x,x!==null){const b=x.width,S=x.height;(o.width!==b||o.height!==S)&&this.setSize(b,S)}return T===!1&&M.setRenderTarget(o),v=M.toneMapping,M.toneMapping=Si,!0},this.hasRenderPass=function(){return T},this.end=function(M,x){M.toneMapping=v,g=!0;let b=o,S=a;for(let A=0;A<p.length;A++){const _=p[A];if(_.enabled!==!1&&(_.render(M,S,b,x),_.needsSwap!==!1)){const E=b;b=S,S=E}}if(u!==M.outputColorSpace||f!==M.toneMapping){u=M.outputColorSpace,f=M.toneMapping,l.defines={},Xe.getTransfer(u)===tt&&(l.defines.SRGB_TRANSFER="");const A=q_[f];A&&(l.defines[A]=""),l.needsUpdate=!0}l.uniforms.tDiffuse.value=b.texture,M.setRenderTarget(m),M.render(h,d),m=null,g=!1},this.isCompositing=function(){return g},this.dispose=function(){o.depthTexture&&o.depthTexture.dispose(),o.dispose(),a.dispose(),c.dispose(),l.dispose()}}const Bu=new Ht,fl=new cs(1,1),zu=new mu,Hu=new Lf,Gu=new bu,uh=[],dh=[],fh=new Float32Array(16),ph=new Float32Array(9),mh=new Float32Array(4);function _s(s,e,t){const i=s[0];if(i<=0||i>0)return s;const n=e*t;let r=uh[n];if(r===void 0&&(r=new Float32Array(n),uh[n]=r),e!==0){i.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,s[o].toArray(r,a)}return r}function At(s,e){if(s.length!==e.length)return!1;for(let t=0,i=s.length;t<i;t++)if(s[t]!==e[t])return!1;return!0}function Rt(s,e){for(let t=0,i=e.length;t<i;t++)s[t]=e[t]}function Eo(s,e){let t=dh[e];t===void 0&&(t=new Int32Array(e),dh[e]=t);for(let i=0;i!==e;++i)t[i]=s.allocateTextureUnit();return t}function Y_(s,e){const t=this.cache;t[0]!==e&&(s.uniform1f(this.addr,e),t[0]=e)}function K_(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(At(t,e))return;s.uniform2fv(this.addr,e),Rt(t,e)}}function Z_(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(s.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(At(t,e))return;s.uniform3fv(this.addr,e),Rt(t,e)}}function J_(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(At(t,e))return;s.uniform4fv(this.addr,e),Rt(t,e)}}function j_(s,e){const t=this.cache,i=e.elements;if(i===void 0){if(At(t,e))return;s.uniformMatrix2fv(this.addr,!1,e),Rt(t,e)}else{if(At(t,i))return;mh.set(i),s.uniformMatrix2fv(this.addr,!1,mh),Rt(t,i)}}function Q_(s,e){const t=this.cache,i=e.elements;if(i===void 0){if(At(t,e))return;s.uniformMatrix3fv(this.addr,!1,e),Rt(t,e)}else{if(At(t,i))return;ph.set(i),s.uniformMatrix3fv(this.addr,!1,ph),Rt(t,i)}}function e0(s,e){const t=this.cache,i=e.elements;if(i===void 0){if(At(t,e))return;s.uniformMatrix4fv(this.addr,!1,e),Rt(t,e)}else{if(At(t,i))return;fh.set(i),s.uniformMatrix4fv(this.addr,!1,fh),Rt(t,i)}}function t0(s,e){const t=this.cache;t[0]!==e&&(s.uniform1i(this.addr,e),t[0]=e)}function i0(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(At(t,e))return;s.uniform2iv(this.addr,e),Rt(t,e)}}function n0(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(At(t,e))return;s.uniform3iv(this.addr,e),Rt(t,e)}}function s0(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(At(t,e))return;s.uniform4iv(this.addr,e),Rt(t,e)}}function r0(s,e){const t=this.cache;t[0]!==e&&(s.uniform1ui(this.addr,e),t[0]=e)}function o0(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(At(t,e))return;s.uniform2uiv(this.addr,e),Rt(t,e)}}function a0(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(At(t,e))return;s.uniform3uiv(this.addr,e),Rt(t,e)}}function l0(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(At(t,e))return;s.uniform4uiv(this.addr,e),Rt(t,e)}}function c0(s,e,t){const i=this.cache,n=t.allocateTextureUnit();i[0]!==n&&(s.uniform1i(this.addr,n),i[0]=n);let r;this.type===s.SAMPLER_2D_SHADOW?(fl.compareFunction=t.isReversedDepthBuffer()?wl:Tl,r=fl):r=Bu,t.setTexture2D(e||r,n)}function h0(s,e,t){const i=this.cache,n=t.allocateTextureUnit();i[0]!==n&&(s.uniform1i(this.addr,n),i[0]=n),t.setTexture3D(e||Hu,n)}function u0(s,e,t){const i=this.cache,n=t.allocateTextureUnit();i[0]!==n&&(s.uniform1i(this.addr,n),i[0]=n),t.setTextureCube(e||Gu,n)}function d0(s,e,t){const i=this.cache,n=t.allocateTextureUnit();i[0]!==n&&(s.uniform1i(this.addr,n),i[0]=n),t.setTexture2DArray(e||zu,n)}function f0(s){switch(s){case 5126:return Y_;case 35664:return K_;case 35665:return Z_;case 35666:return J_;case 35674:return j_;case 35675:return Q_;case 35676:return e0;case 5124:case 35670:return t0;case 35667:case 35671:return i0;case 35668:case 35672:return n0;case 35669:case 35673:return s0;case 5125:return r0;case 36294:return o0;case 36295:return a0;case 36296:return l0;case 35678:case 36198:case 36298:case 36306:case 35682:return c0;case 35679:case 36299:case 36307:return h0;case 35680:case 36300:case 36308:case 36293:return u0;case 36289:case 36303:case 36311:case 36292:return d0}}function p0(s,e){s.uniform1fv(this.addr,e)}function m0(s,e){const t=_s(e,this.size,2);s.uniform2fv(this.addr,t)}function g0(s,e){const t=_s(e,this.size,3);s.uniform3fv(this.addr,t)}function _0(s,e){const t=_s(e,this.size,4);s.uniform4fv(this.addr,t)}function x0(s,e){const t=_s(e,this.size,4);s.uniformMatrix2fv(this.addr,!1,t)}function v0(s,e){const t=_s(e,this.size,9);s.uniformMatrix3fv(this.addr,!1,t)}function y0(s,e){const t=_s(e,this.size,16);s.uniformMatrix4fv(this.addr,!1,t)}function b0(s,e){s.uniform1iv(this.addr,e)}function M0(s,e){s.uniform2iv(this.addr,e)}function E0(s,e){s.uniform3iv(this.addr,e)}function S0(s,e){s.uniform4iv(this.addr,e)}function T0(s,e){s.uniform1uiv(this.addr,e)}function w0(s,e){s.uniform2uiv(this.addr,e)}function A0(s,e){s.uniform3uiv(this.addr,e)}function R0(s,e){s.uniform4uiv(this.addr,e)}function C0(s,e,t){const i=this.cache,n=e.length,r=Eo(t,n);At(i,r)||(s.uniform1iv(this.addr,r),Rt(i,r));let o;this.type===s.SAMPLER_2D_SHADOW?o=fl:o=Bu;for(let a=0;a!==n;++a)t.setTexture2D(e[a]||o,r[a])}function P0(s,e,t){const i=this.cache,n=e.length,r=Eo(t,n);At(i,r)||(s.uniform1iv(this.addr,r),Rt(i,r));for(let o=0;o!==n;++o)t.setTexture3D(e[o]||Hu,r[o])}function L0(s,e,t){const i=this.cache,n=e.length,r=Eo(t,n);At(i,r)||(s.uniform1iv(this.addr,r),Rt(i,r));for(let o=0;o!==n;++o)t.setTextureCube(e[o]||Gu,r[o])}function N0(s,e,t){const i=this.cache,n=e.length,r=Eo(t,n);At(i,r)||(s.uniform1iv(this.addr,r),Rt(i,r));for(let o=0;o!==n;++o)t.setTexture2DArray(e[o]||zu,r[o])}function D0(s){switch(s){case 5126:return p0;case 35664:return m0;case 35665:return g0;case 35666:return _0;case 35674:return x0;case 35675:return v0;case 35676:return y0;case 5124:case 35670:return b0;case 35667:case 35671:return M0;case 35668:case 35672:return E0;case 35669:case 35673:return S0;case 5125:return T0;case 36294:return w0;case 36295:return A0;case 36296:return R0;case 35678:case 36198:case 36298:case 36306:case 35682:return C0;case 35679:case 36299:case 36307:return P0;case 35680:case 36300:case 36308:case 36293:return L0;case 36289:case 36303:case 36311:case 36292:return N0}}class I0{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=f0(t.type)}}class U0{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=D0(t.type)}}class F0{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){const n=this.seq;for(let r=0,o=n.length;r!==o;++r){const a=n[r];a.setValue(e,t[a.id],i)}}}const da=/(\w+)(\])?(\[|\.)?/g;function gh(s,e){s.seq.push(e),s.map[e.id]=e}function O0(s,e,t){const i=s.name,n=i.length;for(da.lastIndex=0;;){const r=da.exec(i),o=da.lastIndex;let a=r[1];const c=r[2]==="]",l=r[3];if(c&&(a=a|0),l===void 0||l==="["&&o+2===n){gh(t,l===void 0?new I0(a,s,e):new U0(a,s,e));break}else{let d=t.map[a];d===void 0&&(d=new F0(a),gh(t,d)),t=d}}}class Yr{constructor(e,t){this.seq=[],this.map={};const i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let o=0;o<i;++o){const a=e.getActiveUniform(t,o),c=e.getUniformLocation(t,a.name);O0(a,c,this)}const n=[],r=[];for(const o of this.seq)o.type===e.SAMPLER_2D_SHADOW||o.type===e.SAMPLER_CUBE_SHADOW||o.type===e.SAMPLER_2D_ARRAY_SHADOW?n.push(o):r.push(o);n.length>0&&(this.seq=n.concat(r))}setValue(e,t,i,n){const r=this.map[t];r!==void 0&&r.setValue(e,i,n)}setOptional(e,t,i){const n=t[i];n!==void 0&&this.setValue(e,i,n)}static upload(e,t,i,n){for(let r=0,o=t.length;r!==o;++r){const a=t[r],c=i[a.id];c.needsUpdate!==!1&&a.setValue(e,c.value,n)}}static seqWithValue(e,t){const i=[];for(let n=0,r=e.length;n!==r;++n){const o=e[n];o.id in t&&i.push(o)}return i}}function _h(s,e,t){const i=s.createShader(e);return s.shaderSource(i,t),s.compileShader(i),i}const k0=37297;let B0=0;function z0(s,e){const t=s.split(`
`),i=[],n=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=n;o<r;o++){const a=o+1;i.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return i.join(`
`)}const xh=new ke;function H0(s){Xe._getMatrix(xh,Xe.workingColorSpace,s);const e=`mat3( ${xh.elements.map(t=>t.toFixed(4))} )`;switch(Xe.getTransfer(s)){case eo:return[e,"LinearTransferOETF"];case tt:return[e,"sRGBTransferOETF"];default:return Le("WebGLProgram: Unsupported color space: ",s),[e,"LinearTransferOETF"]}}function vh(s,e,t){const i=s.getShaderParameter(e,s.COMPILE_STATUS),r=(s.getShaderInfoLog(e)||"").trim();if(i&&r==="")return"";const o=/ERROR: 0:(\d+)/.exec(r);if(o){const a=parseInt(o[1]);return t.toUpperCase()+`

`+r+`

`+z0(s.getShaderSource(e),a)}else return r}function G0(s,e){const t=H0(e);return[`vec4 ${s}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}const V0={[Qh]:"Linear",[eu]:"Reinhard",[tu]:"Cineon",[iu]:"ACESFilmic",[su]:"AgX",[ru]:"Neutral",[nu]:"Custom"};function W0(s,e){const t=V0[e];return t===void 0?(Le("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+s+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+s+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const Cr=new D;function X0(){Xe.getLuminanceCoefficients(Cr);const s=Cr.x.toFixed(4),e=Cr.y.toFixed(4),t=Cr.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${s}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function q0(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Ns).join(`
`)}function $0(s){const e=[];for(const t in s){const i=s[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function Y0(s,e){const t={},i=s.getProgramParameter(e,s.ACTIVE_ATTRIBUTES);for(let n=0;n<i;n++){const r=s.getActiveAttrib(e,n),o=r.name;let a=1;r.type===s.FLOAT_MAT2&&(a=2),r.type===s.FLOAT_MAT3&&(a=3),r.type===s.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:s.getAttribLocation(e,o),locationSize:a}}return t}function Ns(s){return s!==""}function yh(s,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return s.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function bh(s,e){return s.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const K0=/^[ \t]*#include +<([\w\d./]+)>/gm;function pl(s){return s.replace(K0,J0)}const Z0=new Map;function J0(s,e){let t=Ge[e];if(t===void 0){const i=Z0.get(e);if(i!==void 0)t=Ge[i],Le('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return pl(t)}const j0=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Mh(s){return s.replace(j0,Q0)}function Q0(s,e,t,i){let n="";for(let r=parseInt(e);r<parseInt(t);r++)n+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return n}function Eh(s){let e=`precision ${s.precision} float;
	precision ${s.precision} int;
	precision ${s.precision} sampler2D;
	precision ${s.precision} samplerCube;
	precision ${s.precision} sampler3D;
	precision ${s.precision} sampler2DArray;
	precision ${s.precision} sampler2DShadow;
	precision ${s.precision} samplerCubeShadow;
	precision ${s.precision} sampler2DArrayShadow;
	precision ${s.precision} isampler2D;
	precision ${s.precision} isampler3D;
	precision ${s.precision} isamplerCube;
	precision ${s.precision} isampler2DArray;
	precision ${s.precision} usampler2D;
	precision ${s.precision} usampler3D;
	precision ${s.precision} usamplerCube;
	precision ${s.precision} usampler2DArray;
	`;return s.precision==="highp"?e+=`
#define HIGH_PRECISION`:s.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:s.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}const ex={[Vr]:"SHADOWMAP_TYPE_PCF",[Ps]:"SHADOWMAP_TYPE_VSM"};function tx(s){return ex[s.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const ix={[Sn]:"ENVMAP_TYPE_CUBE",[os]:"ENVMAP_TYPE_CUBE",[mo]:"ENVMAP_TYPE_CUBE_UV"};function nx(s){return s.envMap===!1?"ENVMAP_TYPE_CUBE":ix[s.envMapMode]||"ENVMAP_TYPE_CUBE"}const sx={[os]:"ENVMAP_MODE_REFRACTION"};function rx(s){return s.envMap===!1?"ENVMAP_MODE_REFLECTION":sx[s.envMapMode]||"ENVMAP_MODE_REFLECTION"}const ox={[po]:"ENVMAP_BLENDING_MULTIPLY",[Xd]:"ENVMAP_BLENDING_MIX",[qd]:"ENVMAP_BLENDING_ADD"};function ax(s){return s.envMap===!1?"ENVMAP_BLENDING_NONE":ox[s.combine]||"ENVMAP_BLENDING_NONE"}function lx(s){const e=s.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),7*16)),texelHeight:i,maxMip:t}}function cx(s,e,t,i){const n=s.getContext(),r=t.defines;let o=t.vertexShader,a=t.fragmentShader;const c=tx(t),l=nx(t),h=rx(t),d=ax(t),u=lx(t),f=q0(t),g=$0(r),v=n.createProgram();let m,p,T=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Ns).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Ns).join(`
`),p.length>0&&(p+=`
`)):(m=[Eh(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Ns).join(`
`),p=[Eh(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+l:"",t.envMap?"#define "+h:"",t.envMap?"#define "+d:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Si?"#define TONE_MAPPING":"",t.toneMapping!==Si?Ge.tonemapping_pars_fragment:"",t.toneMapping!==Si?W0("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Ge.colorspace_pars_fragment,G0("linearToOutputTexel",t.outputColorSpace),X0(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Ns).join(`
`)),o=pl(o),o=yh(o,t),o=bh(o,t),a=pl(a),a=yh(a,t),a=bh(a,t),o=Mh(o),a=Mh(a),t.isRawShaderMaterial!==!0&&(T=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",t.glslVersion===gc?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===gc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);const M=T+m+o,x=T+p+a,b=_h(n,n.VERTEX_SHADER,M),S=_h(n,n.FRAGMENT_SHADER,x);n.attachShader(v,b),n.attachShader(v,S),t.index0AttributeName!==void 0?n.bindAttribLocation(v,0,t.index0AttributeName):t.hasPositionAttribute===!0&&n.bindAttribLocation(v,0,"position"),n.linkProgram(v);function A(C){if(s.debug.checkShaderErrors){const L=n.getProgramInfoLog(v)||"",k=n.getShaderInfoLog(b)||"",q=n.getShaderInfoLog(S)||"",U=L.trim(),N=k.trim(),F=q.trim();let W=!0,K=!0;if(n.getProgramParameter(v,n.LINK_STATUS)===!1)if(W=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(n,v,b,S);else{const ne=vh(n,b,"vertex"),se=vh(n,S,"fragment");We("WebGLProgram: Shader Error "+n.getError()+" - VALIDATE_STATUS "+n.getProgramParameter(v,n.VALIDATE_STATUS)+`

Material Name: `+C.name+`
Material Type: `+C.type+`

Program Info Log: `+U+`
`+ne+`
`+se)}else U!==""?Le("WebGLProgram: Program Info Log:",U):(N===""||F==="")&&(K=!1);K&&(C.diagnostics={runnable:W,programLog:U,vertexShader:{log:N,prefix:m},fragmentShader:{log:F,prefix:p}})}n.deleteShader(b),n.deleteShader(S),_=new Yr(n,v),E=Y0(n,v)}let _;this.getUniforms=function(){return _===void 0&&A(this),_};let E;this.getAttributes=function(){return E===void 0&&A(this),E};let R=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return R===!1&&(R=n.getProgramParameter(v,k0)),R},this.destroy=function(){i.releaseStatesOfProgram(this),n.deleteProgram(v),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=B0++,this.cacheKey=e,this.usedTimes=1,this.program=v,this.vertexShader=b,this.fragmentShader=S,this}let hx=0;class ux{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,i){const n=this._getShaderCacheForMaterial(e);return n.has(t)===!1&&(n.add(t),t.usedTimes++),n.has(i)===!1&&(n.add(i),i.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){const t=this.shaderCache;let i=t.get(e);return i===void 0&&(i=new dx(e),t.set(e,i)),i}}class dx{constructor(e){this.id=hx++,this.code=e,this.usedTimes=0}}function fx(s){return s===Tn||s===Zr||s===Jr}function px(s,e,t,i,n,r){const o=new gu,a=new ux,c=new Set,l=[],h=new Map,d=i.logarithmicDepthBuffer;let u=i.precision;const f={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(_){return c.add(_),_===0?"uv":`uv${_}`}function v(_,E,R,C,L,k){const q=C.fog,U=L.geometry,N=_.isMeshStandardMaterial||_.isMeshLambertMaterial||_.isMeshPhongMaterial?C.environment:null,F=_.isMeshStandardMaterial||_.isMeshLambertMaterial&&!_.envMap||_.isMeshPhongMaterial&&!_.envMap,W=e.get(_.envMap||N,F),K=W&&W.mapping===mo?W.image.height:null,ne=f[_.type];_.precision!==null&&(u=i.getMaxPrecision(_.precision),u!==_.precision&&Le("WebGLProgram.getParameters:",_.precision,"not supported, using",u,"instead."));const se=U.morphAttributes.position||U.morphAttributes.normal||U.morphAttributes.color,re=se!==void 0?se.length:0;let xe=0;U.morphAttributes.position!==void 0&&(xe=1),U.morphAttributes.normal!==void 0&&(xe=2),U.morphAttributes.color!==void 0&&(xe=3);let ve,ae,z,j;if(ne){const Me=bi[ne];ve=Me.vertexShader,ae=Me.fragmentShader}else{ve=_.vertexShader,ae=_.fragmentShader;const Me=a.getVertexShaderStage(_),pt=a.getFragmentShaderStage(_);a.update(_,Me,pt),z=Me.id,j=pt.id}const te=s.getRenderTarget(),we=s.state.buffers.depth.getReversed(),Fe=L.isInstancedMesh===!0,Ie=L.isBatchedMesh===!0,gt=!!_.map,$e=!!_.matcap,rt=!!W,Je=!!_.aoMap,Ke=!!_.lightMap,yt=!!_.bumpMap&&_.wireframe===!1,Et=!!_.normalMap,Ct=!!_.displacementMap,Dt=!!_.emissiveMap,ft=!!_.metalnessMap,bt=!!_.roughnessMap,O=_.anisotropy>0,qt=_.clearcoat>0,et=_.dispersion>0,P=_.iridescence>0,y=_.sheen>0,H=_.transmission>0,X=O&&!!_.anisotropyMap,Z=qt&&!!_.clearcoatMap,oe=qt&&!!_.clearcoatNormalMap,ce=qt&&!!_.clearcoatRoughnessMap,J=P&&!!_.iridescenceMap,ee=P&&!!_.iridescenceThicknessMap,he=y&&!!_.sheenColorMap,Ae=y&&!!_.sheenRoughnessMap,fe=!!_.specularMap,ue=!!_.specularColorMap,Ne=!!_.specularIntensityMap,Ue=H&&!!_.transmissionMap,ze=H&&!!_.thicknessMap,I=!!_.gradientMap,le=!!_.alphaMap,Q=_.alphaTest>0,de=!!_.alphaHash,_e=!!_.extensions;let ie=Si;_.toneMapped&&(te===null||te.isXRRenderTarget===!0)&&(ie=s.toneMapping);const Te={shaderID:ne,shaderType:_.type,shaderName:_.name,vertexShader:ve,fragmentShader:ae,defines:_.defines,customVertexShaderID:z,customFragmentShaderID:j,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:u,batching:Ie,batchingColor:Ie&&L._colorsTexture!==null,instancing:Fe,instancingColor:Fe&&L.instanceColor!==null,instancingMorph:Fe&&L.morphTexture!==null,outputColorSpace:te===null?s.outputColorSpace:te.isXRRenderTarget===!0?te.texture.colorSpace:Xe.workingColorSpace,alphaToCoverage:!!_.alphaToCoverage,map:gt,matcap:$e,envMap:rt,envMapMode:rt&&W.mapping,envMapCubeUVHeight:K,aoMap:Je,lightMap:Ke,bumpMap:yt,normalMap:Et,displacementMap:Ct,emissiveMap:Dt,normalMapObjectSpace:Et&&_.normalMapType===Jd,normalMapTangentSpace:Et&&_.normalMapType===jr,packedNormalMap:Et&&_.normalMapType===jr&&fx(_.normalMap.format),metalnessMap:ft,roughnessMap:bt,anisotropy:O,anisotropyMap:X,clearcoat:qt,clearcoatMap:Z,clearcoatNormalMap:oe,clearcoatRoughnessMap:ce,dispersion:et,iridescence:P,iridescenceMap:J,iridescenceThicknessMap:ee,sheen:y,sheenColorMap:he,sheenRoughnessMap:Ae,specularMap:fe,specularColorMap:ue,specularIntensityMap:Ne,transmission:H,transmissionMap:Ue,thicknessMap:ze,gradientMap:I,opaque:_.transparent===!1&&_.blending===es&&_.alphaToCoverage===!1,alphaMap:le,alphaTest:Q,alphaHash:de,combine:_.combine,mapUv:gt&&g(_.map.channel),aoMapUv:Je&&g(_.aoMap.channel),lightMapUv:Ke&&g(_.lightMap.channel),bumpMapUv:yt&&g(_.bumpMap.channel),normalMapUv:Et&&g(_.normalMap.channel),displacementMapUv:Ct&&g(_.displacementMap.channel),emissiveMapUv:Dt&&g(_.emissiveMap.channel),metalnessMapUv:ft&&g(_.metalnessMap.channel),roughnessMapUv:bt&&g(_.roughnessMap.channel),anisotropyMapUv:X&&g(_.anisotropyMap.channel),clearcoatMapUv:Z&&g(_.clearcoatMap.channel),clearcoatNormalMapUv:oe&&g(_.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ce&&g(_.clearcoatRoughnessMap.channel),iridescenceMapUv:J&&g(_.iridescenceMap.channel),iridescenceThicknessMapUv:ee&&g(_.iridescenceThicknessMap.channel),sheenColorMapUv:he&&g(_.sheenColorMap.channel),sheenRoughnessMapUv:Ae&&g(_.sheenRoughnessMap.channel),specularMapUv:fe&&g(_.specularMap.channel),specularColorMapUv:ue&&g(_.specularColorMap.channel),specularIntensityMapUv:Ne&&g(_.specularIntensityMap.channel),transmissionMapUv:Ue&&g(_.transmissionMap.channel),thicknessMapUv:ze&&g(_.thicknessMap.channel),alphaMapUv:le&&g(_.alphaMap.channel),vertexTangents:!!U.attributes.tangent&&(Et||O),vertexNormals:!!U.attributes.normal,vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!U.attributes.color&&U.attributes.color.itemSize===4,pointsUvs:L.isPoints===!0&&!!U.attributes.uv&&(gt||le),fog:!!q,useFog:_.fog===!0,fogExp2:!!q&&q.isFogExp2,flatShading:_.wireframe===!1&&(_.flatShading===!0||U.attributes.normal===void 0&&Et===!1&&(_.isMeshLambertMaterial||_.isMeshPhongMaterial||_.isMeshStandardMaterial||_.isMeshPhysicalMaterial)),sizeAttenuation:_.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:we,skinning:L.isSkinnedMesh===!0,hasPositionAttribute:U.attributes.position!==void 0,morphTargets:U.morphAttributes.position!==void 0,morphNormals:U.morphAttributes.normal!==void 0,morphColors:U.morphAttributes.color!==void 0,morphTargetsCount:re,morphTextureStride:xe,numDirLights:E.directional.length,numPointLights:E.point.length,numSpotLights:E.spot.length,numSpotLightMaps:E.spotLightMap.length,numRectAreaLights:E.rectArea.length,numHemiLights:E.hemi.length,numDirLightShadows:E.directionalShadowMap.length,numPointLightShadows:E.pointShadowMap.length,numSpotLightShadows:E.spotShadowMap.length,numSpotLightShadowsWithMaps:E.numSpotLightShadowsWithMaps,numLightProbes:E.numLightProbes,numLightProbeGrids:k.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:_.dithering,shadowMapEnabled:s.shadowMap.enabled&&R.length>0,shadowMapType:s.shadowMap.type,toneMapping:ie,decodeVideoTexture:gt&&_.map.isVideoTexture===!0&&Xe.getTransfer(_.map.colorSpace)===tt,decodeVideoTextureEmissive:Dt&&_.emissiveMap.isVideoTexture===!0&&Xe.getTransfer(_.emissiveMap.colorSpace)===tt,premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===Mi,flipSided:_.side===Yt,useDepthPacking:_.depthPacking>=0,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionClipCullDistance:_e&&_.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(_e&&_.extensions.multiDraw===!0||Ie)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:_.customProgramCacheKey()};return Te.vertexUv1s=c.has(1),Te.vertexUv2s=c.has(2),Te.vertexUv3s=c.has(3),c.clear(),Te}function m(_){const E=[];if(_.shaderID?E.push(_.shaderID):(E.push(_.customVertexShaderID),E.push(_.customFragmentShaderID)),_.defines!==void 0)for(const R in _.defines)E.push(R),E.push(_.defines[R]);return _.isRawShaderMaterial===!1&&(p(E,_),T(E,_),E.push(s.outputColorSpace)),E.push(_.customProgramCacheKey),E.join()}function p(_,E){_.push(E.precision),_.push(E.outputColorSpace),_.push(E.envMapMode),_.push(E.envMapCubeUVHeight),_.push(E.mapUv),_.push(E.alphaMapUv),_.push(E.lightMapUv),_.push(E.aoMapUv),_.push(E.bumpMapUv),_.push(E.normalMapUv),_.push(E.displacementMapUv),_.push(E.emissiveMapUv),_.push(E.metalnessMapUv),_.push(E.roughnessMapUv),_.push(E.anisotropyMapUv),_.push(E.clearcoatMapUv),_.push(E.clearcoatNormalMapUv),_.push(E.clearcoatRoughnessMapUv),_.push(E.iridescenceMapUv),_.push(E.iridescenceThicknessMapUv),_.push(E.sheenColorMapUv),_.push(E.sheenRoughnessMapUv),_.push(E.specularMapUv),_.push(E.specularColorMapUv),_.push(E.specularIntensityMapUv),_.push(E.transmissionMapUv),_.push(E.thicknessMapUv),_.push(E.combine),_.push(E.fogExp2),_.push(E.sizeAttenuation),_.push(E.morphTargetsCount),_.push(E.morphAttributeCount),_.push(E.numDirLights),_.push(E.numPointLights),_.push(E.numSpotLights),_.push(E.numSpotLightMaps),_.push(E.numHemiLights),_.push(E.numRectAreaLights),_.push(E.numDirLightShadows),_.push(E.numPointLightShadows),_.push(E.numSpotLightShadows),_.push(E.numSpotLightShadowsWithMaps),_.push(E.numLightProbes),_.push(E.shadowMapType),_.push(E.toneMapping),_.push(E.numClippingPlanes),_.push(E.numClipIntersection),_.push(E.depthPacking)}function T(_,E){o.disableAll(),E.instancing&&o.enable(0),E.instancingColor&&o.enable(1),E.instancingMorph&&o.enable(2),E.matcap&&o.enable(3),E.envMap&&o.enable(4),E.normalMapObjectSpace&&o.enable(5),E.normalMapTangentSpace&&o.enable(6),E.clearcoat&&o.enable(7),E.iridescence&&o.enable(8),E.alphaTest&&o.enable(9),E.vertexColors&&o.enable(10),E.vertexAlphas&&o.enable(11),E.vertexUv1s&&o.enable(12),E.vertexUv2s&&o.enable(13),E.vertexUv3s&&o.enable(14),E.vertexTangents&&o.enable(15),E.anisotropy&&o.enable(16),E.alphaHash&&o.enable(17),E.batching&&o.enable(18),E.dispersion&&o.enable(19),E.batchingColor&&o.enable(20),E.gradientMap&&o.enable(21),E.packedNormalMap&&o.enable(22),E.vertexNormals&&o.enable(23),_.push(o.mask),o.disableAll(),E.fog&&o.enable(0),E.useFog&&o.enable(1),E.flatShading&&o.enable(2),E.logarithmicDepthBuffer&&o.enable(3),E.reversedDepthBuffer&&o.enable(4),E.skinning&&o.enable(5),E.morphTargets&&o.enable(6),E.morphNormals&&o.enable(7),E.morphColors&&o.enable(8),E.premultipliedAlpha&&o.enable(9),E.shadowMapEnabled&&o.enable(10),E.doubleSided&&o.enable(11),E.flipSided&&o.enable(12),E.useDepthPacking&&o.enable(13),E.dithering&&o.enable(14),E.transmission&&o.enable(15),E.sheen&&o.enable(16),E.opaque&&o.enable(17),E.pointsUvs&&o.enable(18),E.decodeVideoTexture&&o.enable(19),E.decodeVideoTextureEmissive&&o.enable(20),E.alphaToCoverage&&o.enable(21),E.numLightProbeGrids>0&&o.enable(22),E.hasPositionAttribute&&o.enable(23),_.push(o.mask)}function M(_){const E=f[_.type];let R;if(E){const C=bi[E];R=gp.clone(C.uniforms)}else R=_.uniforms;return R}function x(_,E){let R=h.get(E);return R!==void 0?++R.usedTimes:(R=new cx(s,E,_,n),l.push(R),h.set(E,R)),R}function b(_){if(--_.usedTimes===0){const E=l.indexOf(_);l[E]=l[l.length-1],l.pop(),h.delete(_.cacheKey),_.destroy()}}function S(_){a.remove(_)}function A(){a.dispose()}return{getParameters:v,getProgramCacheKey:m,getUniforms:M,acquireProgram:x,releaseProgram:b,releaseShaderCache:S,programs:l,dispose:A}}function mx(){let s=new WeakMap;function e(o){return s.has(o)}function t(o){let a=s.get(o);return a===void 0&&(a={},s.set(o,a)),a}function i(o){s.delete(o)}function n(o,a,c){s.get(o)[a]=c}function r(){s=new WeakMap}return{has:e,get:t,remove:i,update:n,dispose:r}}function gx(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.material.id!==e.material.id?s.material.id-e.material.id:s.materialVariant!==e.materialVariant?s.materialVariant-e.materialVariant:s.z!==e.z?s.z-e.z:s.id-e.id}function Sh(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.z!==e.z?e.z-s.z:s.id-e.id}function Th(){const s=[];let e=0;const t=[],i=[],n=[];function r(){e=0,t.length=0,i.length=0,n.length=0}function o(u){let f=0;return u.isInstancedMesh&&(f+=2),u.isSkinnedMesh&&(f+=1),f}function a(u,f,g,v,m,p){let T=s[e];return T===void 0?(T={id:u.id,object:u,geometry:f,material:g,materialVariant:o(u),groupOrder:v,renderOrder:u.renderOrder,z:m,group:p},s[e]=T):(T.id=u.id,T.object=u,T.geometry=f,T.material=g,T.materialVariant=o(u),T.groupOrder=v,T.renderOrder=u.renderOrder,T.z=m,T.group=p),e++,T}function c(u,f,g,v,m,p){const T=a(u,f,g,v,m,p);g.transmission>0?i.push(T):g.transparent===!0?n.push(T):t.push(T)}function l(u,f,g,v,m,p){const T=a(u,f,g,v,m,p);g.transmission>0?i.unshift(T):g.transparent===!0?n.unshift(T):t.unshift(T)}function h(u,f,g){t.length>1&&t.sort(u||gx),i.length>1&&i.sort(f||Sh),n.length>1&&n.sort(f||Sh),g&&(t.reverse(),i.reverse(),n.reverse())}function d(){for(let u=e,f=s.length;u<f;u++){const g=s[u];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:t,transmissive:i,transparent:n,init:r,push:c,unshift:l,finish:d,sort:h}}function _x(){let s=new WeakMap;function e(i,n){const r=s.get(i);let o;return r===void 0?(o=new Th,s.set(i,[o])):n>=r.length?(o=new Th,r.push(o)):o=r[n],o}function t(){s=new WeakMap}return{get:e,dispose:t}}function xx(){const s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new D,color:new Be};break;case"SpotLight":t={position:new D,direction:new D,color:new Be,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new D,color:new Be,distance:0,decay:0};break;case"HemisphereLight":t={direction:new D,skyColor:new Be,groundColor:new Be};break;case"RectAreaLight":t={color:new Be,position:new D,halfWidth:new D,halfHeight:new D};break}return s[e.id]=t,t}}}function vx(){const s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new De};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new De};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new De,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[e.id]=t,t}}}let yx=0;function bx(s,e){return(e.castShadow?2:0)-(s.castShadow?2:0)+(e.map?1:0)-(s.map?1:0)}function Mx(s){const e=new xx,t=vx(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)i.probe.push(new D);const n=new D,r=new Oe,o=new Oe;function a(l){let h=0,d=0,u=0;for(let E=0;E<9;E++)i.probe[E].set(0,0,0);let f=0,g=0,v=0,m=0,p=0,T=0,M=0,x=0,b=0,S=0,A=0;l.sort(bx);for(let E=0,R=l.length;E<R;E++){const C=l[E],L=C.color,k=C.intensity,q=C.distance;let U=null;if(C.shadow&&C.shadow.map&&(C.shadow.map.texture.format===Tn?U=C.shadow.map.texture:U=C.shadow.map.depthTexture||C.shadow.map.texture),C.isAmbientLight)h+=L.r*k,d+=L.g*k,u+=L.b*k;else if(C.isLightProbe){for(let N=0;N<9;N++)i.probe[N].addScaledVector(C.sh.coefficients[N],k);A++}else if(C.isDirectionalLight){const N=e.get(C);if(N.color.copy(C.color).multiplyScalar(C.intensity),C.castShadow){const F=C.shadow,W=t.get(C);W.shadowIntensity=F.intensity,W.shadowBias=F.bias,W.shadowNormalBias=F.normalBias,W.shadowRadius=F.radius,W.shadowMapSize=F.mapSize,i.directionalShadow[f]=W,i.directionalShadowMap[f]=U,i.directionalShadowMatrix[f]=C.shadow.matrix,T++}i.directional[f]=N,f++}else if(C.isSpotLight){const N=e.get(C);N.position.setFromMatrixPosition(C.matrixWorld),N.color.copy(L).multiplyScalar(k),N.distance=q,N.coneCos=Math.cos(C.angle),N.penumbraCos=Math.cos(C.angle*(1-C.penumbra)),N.decay=C.decay,i.spot[v]=N;const F=C.shadow;if(C.map&&(i.spotLightMap[b]=C.map,b++,F.updateMatrices(C),C.castShadow&&S++),i.spotLightMatrix[v]=F.matrix,C.castShadow){const W=t.get(C);W.shadowIntensity=F.intensity,W.shadowBias=F.bias,W.shadowNormalBias=F.normalBias,W.shadowRadius=F.radius,W.shadowMapSize=F.mapSize,i.spotShadow[v]=W,i.spotShadowMap[v]=U,x++}v++}else if(C.isRectAreaLight){const N=e.get(C);N.color.copy(L).multiplyScalar(k),N.halfWidth.set(C.width*.5,0,0),N.halfHeight.set(0,C.height*.5,0),i.rectArea[m]=N,m++}else if(C.isPointLight){const N=e.get(C);if(N.color.copy(C.color).multiplyScalar(C.intensity),N.distance=C.distance,N.decay=C.decay,C.castShadow){const F=C.shadow,W=t.get(C);W.shadowIntensity=F.intensity,W.shadowBias=F.bias,W.shadowNormalBias=F.normalBias,W.shadowRadius=F.radius,W.shadowMapSize=F.mapSize,W.shadowCameraNear=F.camera.near,W.shadowCameraFar=F.camera.far,i.pointShadow[g]=W,i.pointShadowMap[g]=U,i.pointShadowMatrix[g]=C.shadow.matrix,M++}i.point[g]=N,g++}else if(C.isHemisphereLight){const N=e.get(C);N.skyColor.copy(C.color).multiplyScalar(k),N.groundColor.copy(C.groundColor).multiplyScalar(k),i.hemi[p]=N,p++}}m>0&&(s.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=pe.LTC_FLOAT_1,i.rectAreaLTC2=pe.LTC_FLOAT_2):(i.rectAreaLTC1=pe.LTC_HALF_1,i.rectAreaLTC2=pe.LTC_HALF_2)),i.ambient[0]=h,i.ambient[1]=d,i.ambient[2]=u;const _=i.hash;(_.directionalLength!==f||_.pointLength!==g||_.spotLength!==v||_.rectAreaLength!==m||_.hemiLength!==p||_.numDirectionalShadows!==T||_.numPointShadows!==M||_.numSpotShadows!==x||_.numSpotMaps!==b||_.numLightProbes!==A)&&(i.directional.length=f,i.spot.length=v,i.rectArea.length=m,i.point.length=g,i.hemi.length=p,i.directionalShadow.length=T,i.directionalShadowMap.length=T,i.pointShadow.length=M,i.pointShadowMap.length=M,i.spotShadow.length=x,i.spotShadowMap.length=x,i.directionalShadowMatrix.length=T,i.pointShadowMatrix.length=M,i.spotLightMatrix.length=x+b-S,i.spotLightMap.length=b,i.numSpotLightShadowsWithMaps=S,i.numLightProbes=A,_.directionalLength=f,_.pointLength=g,_.spotLength=v,_.rectAreaLength=m,_.hemiLength=p,_.numDirectionalShadows=T,_.numPointShadows=M,_.numSpotShadows=x,_.numSpotMaps=b,_.numLightProbes=A,i.version=yx++)}function c(l,h){let d=0,u=0,f=0,g=0,v=0;const m=h.matrixWorldInverse;for(let p=0,T=l.length;p<T;p++){const M=l[p];if(M.isDirectionalLight){const x=i.directional[d];x.direction.setFromMatrixPosition(M.matrixWorld),n.setFromMatrixPosition(M.target.matrixWorld),x.direction.sub(n),x.direction.transformDirection(m),d++}else if(M.isSpotLight){const x=i.spot[f];x.position.setFromMatrixPosition(M.matrixWorld),x.position.applyMatrix4(m),x.direction.setFromMatrixPosition(M.matrixWorld),n.setFromMatrixPosition(M.target.matrixWorld),x.direction.sub(n),x.direction.transformDirection(m),f++}else if(M.isRectAreaLight){const x=i.rectArea[g];x.position.setFromMatrixPosition(M.matrixWorld),x.position.applyMatrix4(m),o.identity(),r.copy(M.matrixWorld),r.premultiply(m),o.extractRotation(r),x.halfWidth.set(M.width*.5,0,0),x.halfHeight.set(0,M.height*.5,0),x.halfWidth.applyMatrix4(o),x.halfHeight.applyMatrix4(o),g++}else if(M.isPointLight){const x=i.point[u];x.position.setFromMatrixPosition(M.matrixWorld),x.position.applyMatrix4(m),u++}else if(M.isHemisphereLight){const x=i.hemi[v];x.direction.setFromMatrixPosition(M.matrixWorld),x.direction.transformDirection(m),v++}}}return{setup:a,setupView:c,state:i}}function wh(s){const e=new Mx(s),t=[],i=[],n=[];function r(u){d.camera=u,t.length=0,i.length=0,n.length=0}function o(u){t.push(u)}function a(u){i.push(u)}function c(u){n.push(u)}function l(){e.setup(t)}function h(u){e.setupView(t,u)}const d={lightsArray:t,shadowsArray:i,lightProbeGridArray:n,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:d,setupLights:l,setupLightsView:h,pushLight:o,pushShadow:a,pushLightProbeGrid:c}}function Ex(s){let e=new WeakMap;function t(n,r=0){const o=e.get(n);let a;return o===void 0?(a=new wh(s),e.set(n,[a])):r>=o.length?(a=new wh(s),o.push(a)):a=o[r],a}function i(){e=new WeakMap}return{get:t,dispose:i}}const Sx=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Tx=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,wx=[new D(1,0,0),new D(-1,0,0),new D(0,1,0),new D(0,-1,0),new D(0,0,1),new D(0,0,-1)],Ax=[new D(0,-1,0),new D(0,-1,0),new D(0,0,1),new D(0,0,-1),new D(0,-1,0),new D(0,-1,0)],Ah=new Oe,Ts=new D,fa=new D;function Rx(s,e,t){let i=new Ll;const n=new De,r=new De,o=new st,a=new bp,c=new Mp,l={},h=t.maxTextureSize,d={[Bi]:Yt,[Yt]:Bi,[Mi]:Mi},u=new Ai({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new De},radius:{value:4}},vertexShader:Sx,fragmentShader:Tx}),f=u.clone();f.defines.HORIZONTAL_PASS=1;const g=new wt;g.setAttribute("position",new ii(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const v=new Ft(g,u),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Vr;let p=this.type;this.render=function(S,A,_){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||S.length===0)return;this.type===wd&&(Le("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),this.type=Vr);const E=s.getRenderTarget(),R=s.getActiveCubeFace(),C=s.getActiveMipmapLevel(),L=s.state;L.setBlending(Oi),L.buffers.depth.getReversed()===!0?L.buffers.color.setClear(0,0,0,0):L.buffers.color.setClear(1,1,1,1),L.buffers.depth.setTest(!0),L.setScissorTest(!1);const k=p!==this.type;k&&A.traverse(function(q){q.material&&(Array.isArray(q.material)?q.material.forEach(U=>U.needsUpdate=!0):q.material.needsUpdate=!0)});for(let q=0,U=S.length;q<U;q++){const N=S[q],F=N.shadow;if(F===void 0){Le("WebGLShadowMap:",N,"has no shadow.");continue}if(F.autoUpdate===!1&&F.needsUpdate===!1)continue;n.copy(F.mapSize);const W=F.getFrameExtents();n.multiply(W),r.copy(F.mapSize),(n.x>h||n.y>h)&&(n.x>h&&(r.x=Math.floor(h/W.x),n.x=r.x*W.x,F.mapSize.x=r.x),n.y>h&&(r.y=Math.floor(h/W.y),n.y=r.y*W.y,F.mapSize.y=r.y));const K=s.state.buffers.depth.getReversed();if(F.camera._reversedDepth=K,F.map===null||k===!0){if(F.map!==null&&(F.map.depthTexture!==null&&(F.map.depthTexture.dispose(),F.map.depthTexture=null),F.map.dispose()),this.type===Ps){if(N.isPointLight){Le("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}F.map=new Ti(n.x,n.y,{format:Tn,type:zi,minFilter:Tt,magFilter:Tt,generateMipmaps:!1}),F.map.texture.name=N.name+".shadowMap",F.map.depthTexture=new cs(n.x,n.y,ui),F.map.depthTexture.name=N.name+".shadowMapDepth",F.map.depthTexture.format=Hi,F.map.depthTexture.compareFunction=null,F.map.depthTexture.minFilter=Ut,F.map.depthTexture.magFilter=Ut}else N.isPointLight?(F.map=new ku(n.x),F.map.depthTexture=new Zf(n.x,wi)):(F.map=new Ti(n.x,n.y),F.map.depthTexture=new cs(n.x,n.y,wi)),F.map.depthTexture.name=N.name+".shadowMap",F.map.depthTexture.format=Hi,this.type===Vr?(F.map.depthTexture.compareFunction=K?wl:Tl,F.map.depthTexture.minFilter=Tt,F.map.depthTexture.magFilter=Tt):(F.map.depthTexture.compareFunction=null,F.map.depthTexture.minFilter=Ut,F.map.depthTexture.magFilter=Ut);F.camera.updateProjectionMatrix()}const ne=F.map.isWebGLCubeRenderTarget?6:1;for(let se=0;se<ne;se++){if(F.map.isWebGLCubeRenderTarget)s.setRenderTarget(F.map,se),s.clear();else{se===0&&(s.setRenderTarget(F.map),s.clear());const re=F.getViewport(se);o.set(r.x*re.x,r.y*re.y,r.x*re.z,r.y*re.w),L.viewport(o)}if(N.isPointLight){const re=F.camera,xe=F.matrix,ve=N.distance||re.far;ve!==re.far&&(re.far=ve,re.updateProjectionMatrix()),Ts.setFromMatrixPosition(N.matrixWorld),re.position.copy(Ts),fa.copy(re.position),fa.add(wx[se]),re.up.copy(Ax[se]),re.lookAt(fa),re.updateMatrixWorld(),xe.makeTranslation(-Ts.x,-Ts.y,-Ts.z),Ah.multiplyMatrices(re.projectionMatrix,re.matrixWorldInverse),F._frustum.setFromProjectionMatrix(Ah,re.coordinateSystem,re.reversedDepth)}else F.updateMatrices(N);i=F.getFrustum(),x(A,_,F.camera,N,this.type)}F.isPointLightShadow!==!0&&this.type===Ps&&T(F,_),F.needsUpdate=!1}p=this.type,m.needsUpdate=!1,s.setRenderTarget(E,R,C)};function T(S,A){const _=e.update(v);u.defines.VSM_SAMPLES!==S.blurSamples&&(u.defines.VSM_SAMPLES=S.blurSamples,f.defines.VSM_SAMPLES=S.blurSamples,u.needsUpdate=!0,f.needsUpdate=!0),S.mapPass===null&&(S.mapPass=new Ti(n.x,n.y,{format:Tn,type:zi})),u.uniforms.shadow_pass.value=S.map.depthTexture,u.uniforms.resolution.value=S.mapSize,u.uniforms.radius.value=S.radius,s.setRenderTarget(S.mapPass),s.clear(),s.renderBufferDirect(A,null,_,u,v,null),f.uniforms.shadow_pass.value=S.mapPass.texture,f.uniforms.resolution.value=S.mapSize,f.uniforms.radius.value=S.radius,s.setRenderTarget(S.map),s.clear(),s.renderBufferDirect(A,null,_,f,v,null)}function M(S,A,_,E){let R=null;const C=_.isPointLight===!0?S.customDistanceMaterial:S.customDepthMaterial;if(C!==void 0)R=C;else if(R=_.isPointLight===!0?c:a,s.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0||A.alphaToCoverage===!0){const L=R.uuid,k=A.uuid;let q=l[L];q===void 0&&(q={},l[L]=q);let U=q[k];U===void 0&&(U=R.clone(),q[k]=U,A.addEventListener("dispose",b)),R=U}if(R.visible=A.visible,R.wireframe=A.wireframe,E===Ps?R.side=A.shadowSide!==null?A.shadowSide:A.side:R.side=A.shadowSide!==null?A.shadowSide:d[A.side],R.alphaMap=A.alphaMap,R.alphaTest=A.alphaToCoverage===!0?.5:A.alphaTest,R.map=A.map,R.clipShadows=A.clipShadows,R.clippingPlanes=A.clippingPlanes,R.clipIntersection=A.clipIntersection,R.displacementMap=A.displacementMap,R.displacementScale=A.displacementScale,R.displacementBias=A.displacementBias,R.wireframeLinewidth=A.wireframeLinewidth,R.linewidth=A.linewidth,_.isPointLight===!0&&R.isMeshDistanceMaterial===!0){const L=s.properties.get(R);L.light=_}return R}function x(S,A,_,E,R){if(S.visible===!1)return;if(S.layers.test(A.layers)&&(S.isMesh||S.isLine||S.isPoints)&&(S.castShadow||S.receiveShadow&&R===Ps)&&(!S.frustumCulled||i.intersectsObject(S))){S.modelViewMatrix.multiplyMatrices(_.matrixWorldInverse,S.matrixWorld);const k=e.update(S),q=S.material;if(Array.isArray(q)){const U=k.groups;for(let N=0,F=U.length;N<F;N++){const W=U[N],K=q[W.materialIndex];if(K&&K.visible){const ne=M(S,K,E,R);S.onBeforeShadow(s,S,A,_,k,ne,W),s.renderBufferDirect(_,null,k,ne,S,W),S.onAfterShadow(s,S,A,_,k,ne,W)}}}else if(q.visible){const U=M(S,q,E,R);S.onBeforeShadow(s,S,A,_,k,U,null),s.renderBufferDirect(_,null,k,U,S,null),S.onAfterShadow(s,S,A,_,k,U,null)}}const L=S.children;for(let k=0,q=L.length;k<q;k++)x(L[k],A,_,E,R)}function b(S){S.target.removeEventListener("dispose",b);for(const _ in l){const E=l[_],R=S.target.uuid;R in E&&(E[R].dispose(),delete E[R])}}}function Cx(s,e){function t(){let I=!1;const le=new st;let Q=null;const de=new st(0,0,0,0);return{setMask:function(_e){Q!==_e&&!I&&(s.colorMask(_e,_e,_e,_e),Q=_e)},setLocked:function(_e){I=_e},setClear:function(_e,ie,Te,Me,pt){pt===!0&&(_e*=Me,ie*=Me,Te*=Me),le.set(_e,ie,Te,Me),de.equals(le)===!1&&(s.clearColor(_e,ie,Te,Me),de.copy(le))},reset:function(){I=!1,Q=null,de.set(-1,0,0,0)}}}function i(){let I=!1,le=!1,Q=null,de=null,_e=null;return{setReversed:function(ie){if(le!==ie){const Te=e.get("EXT_clip_control");ie?Te.clipControlEXT(Te.LOWER_LEFT_EXT,Te.ZERO_TO_ONE_EXT):Te.clipControlEXT(Te.LOWER_LEFT_EXT,Te.NEGATIVE_ONE_TO_ONE_EXT),le=ie;const Me=_e;_e=null,this.setClear(Me)}},getReversed:function(){return le},setTest:function(ie){ie?te(s.DEPTH_TEST):we(s.DEPTH_TEST)},setMask:function(ie){Q!==ie&&!I&&(s.depthMask(ie),Q=ie)},setFunc:function(ie){if(le&&(ie=cf[ie]),de!==ie){switch(ie){case Ta:s.depthFunc(s.NEVER);break;case wa:s.depthFunc(s.ALWAYS);break;case Aa:s.depthFunc(s.LESS);break;case rs:s.depthFunc(s.LEQUAL);break;case Ra:s.depthFunc(s.EQUAL);break;case Ca:s.depthFunc(s.GEQUAL);break;case Pa:s.depthFunc(s.GREATER);break;case La:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}de=ie}},setLocked:function(ie){I=ie},setClear:function(ie){_e!==ie&&(_e=ie,le&&(ie=1-ie),s.clearDepth(ie))},reset:function(){I=!1,Q=null,de=null,_e=null,le=!1}}}function n(){let I=!1,le=null,Q=null,de=null,_e=null,ie=null,Te=null,Me=null,pt=null;return{setTest:function(lt){I||(lt?te(s.STENCIL_TEST):we(s.STENCIL_TEST))},setMask:function(lt){le!==lt&&!I&&(s.stencilMask(lt),le=lt)},setFunc:function(lt,mi,gi){(Q!==lt||de!==mi||_e!==gi)&&(s.stencilFunc(lt,mi,gi),Q=lt,de=mi,_e=gi)},setOp:function(lt,mi,gi){(ie!==lt||Te!==mi||Me!==gi)&&(s.stencilOp(lt,mi,gi),ie=lt,Te=mi,Me=gi)},setLocked:function(lt){I=lt},setClear:function(lt){pt!==lt&&(s.clearStencil(lt),pt=lt)},reset:function(){I=!1,le=null,Q=null,de=null,_e=null,ie=null,Te=null,Me=null,pt=null}}}const r=new t,o=new i,a=new n,c=new WeakMap,l=new WeakMap;let h={},d={},u={},f=new WeakMap,g=[],v=null,m=!1,p=null,T=null,M=null,x=null,b=null,S=null,A=null,_=new Be(0,0,0),E=0,R=!1,C=null,L=null,k=null,q=null,U=null;const N=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let F=!1,W=0;const K=s.getParameter(s.VERSION);K.indexOf("WebGL")!==-1?(W=parseFloat(/^WebGL (\d)/.exec(K)[1]),F=W>=1):K.indexOf("OpenGL ES")!==-1&&(W=parseFloat(/^OpenGL ES (\d)/.exec(K)[1]),F=W>=2);let ne=null,se={};const re=s.getParameter(s.SCISSOR_BOX),xe=s.getParameter(s.VIEWPORT),ve=new st().fromArray(re),ae=new st().fromArray(xe);function z(I,le,Q,de){const _e=new Uint8Array(4),ie=s.createTexture();s.bindTexture(I,ie),s.texParameteri(I,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(I,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let Te=0;Te<Q;Te++)I===s.TEXTURE_3D||I===s.TEXTURE_2D_ARRAY?s.texImage3D(le,0,s.RGBA,1,1,de,0,s.RGBA,s.UNSIGNED_BYTE,_e):s.texImage2D(le+Te,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,_e);return ie}const j={};j[s.TEXTURE_2D]=z(s.TEXTURE_2D,s.TEXTURE_2D,1),j[s.TEXTURE_CUBE_MAP]=z(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),j[s.TEXTURE_2D_ARRAY]=z(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),j[s.TEXTURE_3D]=z(s.TEXTURE_3D,s.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),te(s.DEPTH_TEST),o.setFunc(rs),yt(!1),Et(oc),te(s.CULL_FACE),Je(Oi);function te(I){h[I]!==!0&&(s.enable(I),h[I]=!0)}function we(I){h[I]!==!1&&(s.disable(I),h[I]=!1)}function Fe(I,le){return u[I]!==le?(s.bindFramebuffer(I,le),u[I]=le,I===s.DRAW_FRAMEBUFFER&&(u[s.FRAMEBUFFER]=le),I===s.FRAMEBUFFER&&(u[s.DRAW_FRAMEBUFFER]=le),!0):!1}function Ie(I,le){let Q=g,de=!1;if(I){Q=f.get(le),Q===void 0&&(Q=[],f.set(le,Q));const _e=I.textures;if(Q.length!==_e.length||Q[0]!==s.COLOR_ATTACHMENT0){for(let ie=0,Te=_e.length;ie<Te;ie++)Q[ie]=s.COLOR_ATTACHMENT0+ie;Q.length=_e.length,de=!0}}else Q[0]!==s.BACK&&(Q[0]=s.BACK,de=!0);de&&s.drawBuffers(Q)}function gt(I){return v!==I?(s.useProgram(I),v=I,!0):!1}const $e={[yn]:s.FUNC_ADD,[Rd]:s.FUNC_SUBTRACT,[Cd]:s.FUNC_REVERSE_SUBTRACT};$e[Pd]=s.MIN,$e[Ld]=s.MAX;const rt={[Nd]:s.ZERO,[Dd]:s.ONE,[Id]:s.SRC_COLOR,[Ea]:s.SRC_ALPHA,[zd]:s.SRC_ALPHA_SATURATE,[kd]:s.DST_COLOR,[Fd]:s.DST_ALPHA,[Ud]:s.ONE_MINUS_SRC_COLOR,[Sa]:s.ONE_MINUS_SRC_ALPHA,[Bd]:s.ONE_MINUS_DST_COLOR,[Od]:s.ONE_MINUS_DST_ALPHA,[Hd]:s.CONSTANT_COLOR,[Gd]:s.ONE_MINUS_CONSTANT_COLOR,[Vd]:s.CONSTANT_ALPHA,[Wd]:s.ONE_MINUS_CONSTANT_ALPHA};function Je(I,le,Q,de,_e,ie,Te,Me,pt,lt){if(I===Oi){m===!0&&(we(s.BLEND),m=!1);return}if(m===!1&&(te(s.BLEND),m=!0),I!==Ad){if(I!==p||lt!==R){if((T!==yn||b!==yn)&&(s.blendEquation(s.FUNC_ADD),T=yn,b=yn),lt)switch(I){case es:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case ac:s.blendFunc(s.ONE,s.ONE);break;case lc:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case cc:s.blendFuncSeparate(s.DST_COLOR,s.ONE_MINUS_SRC_ALPHA,s.ZERO,s.ONE);break;default:We("WebGLState: Invalid blending: ",I);break}else switch(I){case es:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case ac:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE,s.ONE,s.ONE);break;case lc:We("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case cc:We("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:We("WebGLState: Invalid blending: ",I);break}M=null,x=null,S=null,A=null,_.set(0,0,0),E=0,p=I,R=lt}return}_e=_e||le,ie=ie||Q,Te=Te||de,(le!==T||_e!==b)&&(s.blendEquationSeparate($e[le],$e[_e]),T=le,b=_e),(Q!==M||de!==x||ie!==S||Te!==A)&&(s.blendFuncSeparate(rt[Q],rt[de],rt[ie],rt[Te]),M=Q,x=de,S=ie,A=Te),(Me.equals(_)===!1||pt!==E)&&(s.blendColor(Me.r,Me.g,Me.b,pt),_.copy(Me),E=pt),p=I,R=!1}function Ke(I,le){I.side===Mi?we(s.CULL_FACE):te(s.CULL_FACE);let Q=I.side===Yt;le&&(Q=!Q),yt(Q),I.blending===es&&I.transparent===!1?Je(Oi):Je(I.blending,I.blendEquation,I.blendSrc,I.blendDst,I.blendEquationAlpha,I.blendSrcAlpha,I.blendDstAlpha,I.blendColor,I.blendAlpha,I.premultipliedAlpha),o.setFunc(I.depthFunc),o.setTest(I.depthTest),o.setMask(I.depthWrite),r.setMask(I.colorWrite);const de=I.stencilWrite;a.setTest(de),de&&(a.setMask(I.stencilWriteMask),a.setFunc(I.stencilFunc,I.stencilRef,I.stencilFuncMask),a.setOp(I.stencilFail,I.stencilZFail,I.stencilZPass)),Dt(I.polygonOffset,I.polygonOffsetFactor,I.polygonOffsetUnits),I.alphaToCoverage===!0?te(s.SAMPLE_ALPHA_TO_COVERAGE):we(s.SAMPLE_ALPHA_TO_COVERAGE)}function yt(I){C!==I&&(I?s.frontFace(s.CW):s.frontFace(s.CCW),C=I)}function Et(I){I!==Sd?(te(s.CULL_FACE),I!==L&&(I===oc?s.cullFace(s.BACK):I===Td?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):we(s.CULL_FACE),L=I}function Ct(I){I!==k&&(F&&s.lineWidth(I),k=I)}function Dt(I,le,Q){I?(te(s.POLYGON_OFFSET_FILL),(q!==le||U!==Q)&&(q=le,U=Q,o.getReversed()&&(le=-le),s.polygonOffset(le,Q))):we(s.POLYGON_OFFSET_FILL)}function ft(I){I?te(s.SCISSOR_TEST):we(s.SCISSOR_TEST)}function bt(I){I===void 0&&(I=s.TEXTURE0+N-1),ne!==I&&(s.activeTexture(I),ne=I)}function O(I,le,Q){Q===void 0&&(ne===null?Q=s.TEXTURE0+N-1:Q=ne);let de=se[Q];de===void 0&&(de={type:void 0,texture:void 0},se[Q]=de),(de.type!==I||de.texture!==le)&&(ne!==Q&&(s.activeTexture(Q),ne=Q),s.bindTexture(I,le||j[I]),de.type=I,de.texture=le)}function qt(){const I=se[ne];I!==void 0&&I.type!==void 0&&(s.bindTexture(I.type,null),I.type=void 0,I.texture=void 0)}function et(){try{s.compressedTexImage2D(...arguments)}catch(I){We("WebGLState:",I)}}function P(){try{s.compressedTexImage3D(...arguments)}catch(I){We("WebGLState:",I)}}function y(){try{s.texSubImage2D(...arguments)}catch(I){We("WebGLState:",I)}}function H(){try{s.texSubImage3D(...arguments)}catch(I){We("WebGLState:",I)}}function X(){try{s.compressedTexSubImage2D(...arguments)}catch(I){We("WebGLState:",I)}}function Z(){try{s.compressedTexSubImage3D(...arguments)}catch(I){We("WebGLState:",I)}}function oe(){try{s.texStorage2D(...arguments)}catch(I){We("WebGLState:",I)}}function ce(){try{s.texStorage3D(...arguments)}catch(I){We("WebGLState:",I)}}function J(){try{s.texImage2D(...arguments)}catch(I){We("WebGLState:",I)}}function ee(){try{s.texImage3D(...arguments)}catch(I){We("WebGLState:",I)}}function he(I){return d[I]!==void 0?d[I]:s.getParameter(I)}function Ae(I,le){d[I]!==le&&(s.pixelStorei(I,le),d[I]=le)}function fe(I){ve.equals(I)===!1&&(s.scissor(I.x,I.y,I.z,I.w),ve.copy(I))}function ue(I){ae.equals(I)===!1&&(s.viewport(I.x,I.y,I.z,I.w),ae.copy(I))}function Ne(I,le){let Q=l.get(le);Q===void 0&&(Q=new WeakMap,l.set(le,Q));let de=Q.get(I);de===void 0&&(de=s.getUniformBlockIndex(le,I.name),Q.set(I,de))}function Ue(I,le){const de=l.get(le).get(I);c.get(le)!==de&&(s.uniformBlockBinding(le,de,I.__bindingPointIndex),c.set(le,de))}function ze(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),o.setReversed(!1),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),s.pixelStorei(s.PACK_ALIGNMENT,4),s.pixelStorei(s.UNPACK_ALIGNMENT,4),s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,!1),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,s.BROWSER_DEFAULT_WEBGL),s.pixelStorei(s.PACK_ROW_LENGTH,0),s.pixelStorei(s.PACK_SKIP_PIXELS,0),s.pixelStorei(s.PACK_SKIP_ROWS,0),s.pixelStorei(s.UNPACK_ROW_LENGTH,0),s.pixelStorei(s.UNPACK_IMAGE_HEIGHT,0),s.pixelStorei(s.UNPACK_SKIP_PIXELS,0),s.pixelStorei(s.UNPACK_SKIP_ROWS,0),s.pixelStorei(s.UNPACK_SKIP_IMAGES,0),h={},d={},ne=null,se={},u={},f=new WeakMap,g=[],v=null,m=!1,p=null,T=null,M=null,x=null,b=null,S=null,A=null,_=new Be(0,0,0),E=0,R=!1,C=null,L=null,k=null,q=null,U=null,ve.set(0,0,s.canvas.width,s.canvas.height),ae.set(0,0,s.canvas.width,s.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:te,disable:we,bindFramebuffer:Fe,drawBuffers:Ie,useProgram:gt,setBlending:Je,setMaterial:Ke,setFlipSided:yt,setCullFace:Et,setLineWidth:Ct,setPolygonOffset:Dt,setScissorTest:ft,activeTexture:bt,bindTexture:O,unbindTexture:qt,compressedTexImage2D:et,compressedTexImage3D:P,texImage2D:J,texImage3D:ee,pixelStorei:Ae,getParameter:he,updateUBOMapping:Ne,uniformBlockBinding:Ue,texStorage2D:oe,texStorage3D:ce,texSubImage2D:y,texSubImage3D:H,compressedTexSubImage2D:X,compressedTexSubImage3D:Z,scissor:fe,viewport:ue,reset:ze}}function Px(s,e,t,i,n,r,o){const a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new De,h=new WeakMap,d=new Set;let u;const f=new WeakMap;let g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function v(P,y){return g?new OffscreenCanvas(P,y):Xs("canvas")}function m(P,y,H){let X=1;const Z=et(P);if((Z.width>H||Z.height>H)&&(X=H/Math.max(Z.width,Z.height)),X<1)if(typeof HTMLImageElement<"u"&&P instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&P instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&P instanceof ImageBitmap||typeof VideoFrame<"u"&&P instanceof VideoFrame){const oe=Math.floor(X*Z.width),ce=Math.floor(X*Z.height);u===void 0&&(u=v(oe,ce));const J=y?v(oe,ce):u;return J.width=oe,J.height=ce,J.getContext("2d").drawImage(P,0,0,oe,ce),Le("WebGLRenderer: Texture has been resized from ("+Z.width+"x"+Z.height+") to ("+oe+"x"+ce+")."),J}else return"data"in P&&Le("WebGLRenderer: Image in DataTexture is too big ("+Z.width+"x"+Z.height+")."),P;return P}function p(P){return P.generateMipmaps}function T(P){s.generateMipmap(P)}function M(P){return P.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:P.isWebGL3DRenderTarget?s.TEXTURE_3D:P.isWebGLArrayRenderTarget||P.isCompressedArrayTexture?s.TEXTURE_2D_ARRAY:s.TEXTURE_2D}function x(P,y,H,X,Z,oe=!1){if(P!==null){if(s[P]!==void 0)return s[P];Le("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+P+"'")}let ce;X&&(ce=e.get("EXT_texture_norm16"),ce||Le("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let J=y;if(y===s.RED&&(H===s.FLOAT&&(J=s.R32F),H===s.HALF_FLOAT&&(J=s.R16F),H===s.UNSIGNED_BYTE&&(J=s.R8),H===s.UNSIGNED_SHORT&&ce&&(J=ce.R16_EXT),H===s.SHORT&&ce&&(J=ce.R16_SNORM_EXT)),y===s.RED_INTEGER&&(H===s.UNSIGNED_BYTE&&(J=s.R8UI),H===s.UNSIGNED_SHORT&&(J=s.R16UI),H===s.UNSIGNED_INT&&(J=s.R32UI),H===s.BYTE&&(J=s.R8I),H===s.SHORT&&(J=s.R16I),H===s.INT&&(J=s.R32I)),y===s.RG&&(H===s.FLOAT&&(J=s.RG32F),H===s.HALF_FLOAT&&(J=s.RG16F),H===s.UNSIGNED_BYTE&&(J=s.RG8),H===s.UNSIGNED_SHORT&&ce&&(J=ce.RG16_EXT),H===s.SHORT&&ce&&(J=ce.RG16_SNORM_EXT)),y===s.RG_INTEGER&&(H===s.UNSIGNED_BYTE&&(J=s.RG8UI),H===s.UNSIGNED_SHORT&&(J=s.RG16UI),H===s.UNSIGNED_INT&&(J=s.RG32UI),H===s.BYTE&&(J=s.RG8I),H===s.SHORT&&(J=s.RG16I),H===s.INT&&(J=s.RG32I)),y===s.RGB_INTEGER&&(H===s.UNSIGNED_BYTE&&(J=s.RGB8UI),H===s.UNSIGNED_SHORT&&(J=s.RGB16UI),H===s.UNSIGNED_INT&&(J=s.RGB32UI),H===s.BYTE&&(J=s.RGB8I),H===s.SHORT&&(J=s.RGB16I),H===s.INT&&(J=s.RGB32I)),y===s.RGBA_INTEGER&&(H===s.UNSIGNED_BYTE&&(J=s.RGBA8UI),H===s.UNSIGNED_SHORT&&(J=s.RGBA16UI),H===s.UNSIGNED_INT&&(J=s.RGBA32UI),H===s.BYTE&&(J=s.RGBA8I),H===s.SHORT&&(J=s.RGBA16I),H===s.INT&&(J=s.RGBA32I)),y===s.RGB&&(H===s.UNSIGNED_SHORT&&ce&&(J=ce.RGB16_EXT),H===s.SHORT&&ce&&(J=ce.RGB16_SNORM_EXT),H===s.UNSIGNED_INT_5_9_9_9_REV&&(J=s.RGB9_E5),H===s.UNSIGNED_INT_10F_11F_11F_REV&&(J=s.R11F_G11F_B10F)),y===s.RGBA){const ee=oe?eo:Xe.getTransfer(Z);H===s.FLOAT&&(J=s.RGBA32F),H===s.HALF_FLOAT&&(J=s.RGBA16F),H===s.UNSIGNED_BYTE&&(J=ee===tt?s.SRGB8_ALPHA8:s.RGBA8),H===s.UNSIGNED_SHORT&&ce&&(J=ce.RGBA16_EXT),H===s.SHORT&&ce&&(J=ce.RGBA16_SNORM_EXT),H===s.UNSIGNED_SHORT_4_4_4_4&&(J=s.RGBA4),H===s.UNSIGNED_SHORT_5_5_5_1&&(J=s.RGB5_A1)}return(J===s.R16F||J===s.R32F||J===s.RG16F||J===s.RG32F||J===s.RGBA16F||J===s.RGBA32F)&&e.get("EXT_color_buffer_float"),J}function b(P,y){let H;return P?y===null||y===wi||y===Gs?H=s.DEPTH24_STENCIL8:y===ui?H=s.DEPTH32F_STENCIL8:y===Hs&&(H=s.DEPTH24_STENCIL8,Le("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):y===null||y===wi||y===Gs?H=s.DEPTH_COMPONENT24:y===ui?H=s.DEPTH_COMPONENT32F:y===Hs&&(H=s.DEPTH_COMPONENT16),H}function S(P,y){return p(P)===!0||P.isFramebufferTexture&&P.minFilter!==Ut&&P.minFilter!==Tt?Math.log2(Math.max(y.width,y.height))+1:P.mipmaps!==void 0&&P.mipmaps.length>0?P.mipmaps.length:P.isCompressedTexture&&Array.isArray(P.image)?y.mipmaps.length:1}function A(P){const y=P.target;y.removeEventListener("dispose",A),E(y),y.isVideoTexture&&h.delete(y),y.isHTMLTexture&&d.delete(y)}function _(P){const y=P.target;y.removeEventListener("dispose",_),C(y)}function E(P){const y=i.get(P);if(y.__webglInit===void 0)return;const H=P.source,X=f.get(H);if(X){const Z=X[y.__cacheKey];Z.usedTimes--,Z.usedTimes===0&&R(P),Object.keys(X).length===0&&f.delete(H)}i.remove(P)}function R(P){const y=i.get(P);s.deleteTexture(y.__webglTexture);const H=P.source,X=f.get(H);delete X[y.__cacheKey],o.memory.textures--}function C(P){const y=i.get(P);if(P.depthTexture&&(P.depthTexture.dispose(),i.remove(P.depthTexture)),P.isWebGLCubeRenderTarget)for(let X=0;X<6;X++){if(Array.isArray(y.__webglFramebuffer[X]))for(let Z=0;Z<y.__webglFramebuffer[X].length;Z++)s.deleteFramebuffer(y.__webglFramebuffer[X][Z]);else s.deleteFramebuffer(y.__webglFramebuffer[X]);y.__webglDepthbuffer&&s.deleteRenderbuffer(y.__webglDepthbuffer[X])}else{if(Array.isArray(y.__webglFramebuffer))for(let X=0;X<y.__webglFramebuffer.length;X++)s.deleteFramebuffer(y.__webglFramebuffer[X]);else s.deleteFramebuffer(y.__webglFramebuffer);if(y.__webglDepthbuffer&&s.deleteRenderbuffer(y.__webglDepthbuffer),y.__webglMultisampledFramebuffer&&s.deleteFramebuffer(y.__webglMultisampledFramebuffer),y.__webglColorRenderbuffer)for(let X=0;X<y.__webglColorRenderbuffer.length;X++)y.__webglColorRenderbuffer[X]&&s.deleteRenderbuffer(y.__webglColorRenderbuffer[X]);y.__webglDepthRenderbuffer&&s.deleteRenderbuffer(y.__webglDepthRenderbuffer)}const H=P.textures;for(let X=0,Z=H.length;X<Z;X++){const oe=i.get(H[X]);oe.__webglTexture&&(s.deleteTexture(oe.__webglTexture),o.memory.textures--),i.remove(H[X])}i.remove(P)}let L=0;function k(){L=0}function q(){return L}function U(P){L=P}function N(){const P=L;return P>=n.maxTextures&&Le("WebGLTextures: Trying to use "+P+" texture units while this GPU supports only "+n.maxTextures),L+=1,P}function F(P){const y=[];return y.push(P.wrapS),y.push(P.wrapT),y.push(P.wrapR||0),y.push(P.magFilter),y.push(P.minFilter),y.push(P.anisotropy),y.push(P.internalFormat),y.push(P.format),y.push(P.type),y.push(P.generateMipmaps),y.push(P.premultiplyAlpha),y.push(P.flipY),y.push(P.unpackAlignment),y.push(P.colorSpace),y.join()}function W(P,y){const H=i.get(P);if(P.isVideoTexture&&O(P),P.isRenderTargetTexture===!1&&P.isExternalTexture!==!0&&P.version>0&&H.__version!==P.version){const X=P.image;if(X===null)Le("WebGLRenderer: Texture marked for update but no image data found.");else if(X.complete===!1)Le("WebGLRenderer: Texture marked for update but image is incomplete");else{we(H,P,y);return}}else P.isExternalTexture&&(H.__webglTexture=P.sourceTexture?P.sourceTexture:null);t.bindTexture(s.TEXTURE_2D,H.__webglTexture,s.TEXTURE0+y)}function K(P,y){const H=i.get(P);if(P.isRenderTargetTexture===!1&&P.version>0&&H.__version!==P.version){we(H,P,y);return}else P.isExternalTexture&&(H.__webglTexture=P.sourceTexture?P.sourceTexture:null);t.bindTexture(s.TEXTURE_2D_ARRAY,H.__webglTexture,s.TEXTURE0+y)}function ne(P,y){const H=i.get(P);if(P.isRenderTargetTexture===!1&&P.version>0&&H.__version!==P.version){we(H,P,y);return}t.bindTexture(s.TEXTURE_3D,H.__webglTexture,s.TEXTURE0+y)}function se(P,y){const H=i.get(P);if(P.isCubeDepthTexture!==!0&&P.version>0&&H.__version!==P.version){Fe(H,P,y);return}t.bindTexture(s.TEXTURE_CUBE_MAP,H.__webglTexture,s.TEXTURE0+y)}const re={[Mn]:s.REPEAT,[ti]:s.CLAMP_TO_EDGE,[Na]:s.MIRRORED_REPEAT},xe={[Ut]:s.NEAREST,[Yd]:s.NEAREST_MIPMAP_NEAREST,[tr]:s.NEAREST_MIPMAP_LINEAR,[Tt]:s.LINEAR,[Do]:s.LINEAR_MIPMAP_NEAREST,[Fi]:s.LINEAR_MIPMAP_LINEAR},ve={[jd]:s.NEVER,[sf]:s.ALWAYS,[Qd]:s.LESS,[Tl]:s.LEQUAL,[ef]:s.EQUAL,[wl]:s.GEQUAL,[tf]:s.GREATER,[nf]:s.NOTEQUAL};function ae(P,y){if(y.type===ui&&e.has("OES_texture_float_linear")===!1&&(y.magFilter===Tt||y.magFilter===Do||y.magFilter===tr||y.magFilter===Fi||y.minFilter===Tt||y.minFilter===Do||y.minFilter===tr||y.minFilter===Fi)&&Le("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(P,s.TEXTURE_WRAP_S,re[y.wrapS]),s.texParameteri(P,s.TEXTURE_WRAP_T,re[y.wrapT]),(P===s.TEXTURE_3D||P===s.TEXTURE_2D_ARRAY)&&s.texParameteri(P,s.TEXTURE_WRAP_R,re[y.wrapR]),s.texParameteri(P,s.TEXTURE_MAG_FILTER,xe[y.magFilter]),s.texParameteri(P,s.TEXTURE_MIN_FILTER,xe[y.minFilter]),y.compareFunction&&(s.texParameteri(P,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(P,s.TEXTURE_COMPARE_FUNC,ve[y.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(y.magFilter===Ut||y.minFilter!==tr&&y.minFilter!==Fi||y.type===ui&&e.has("OES_texture_float_linear")===!1)return;if(y.anisotropy>1||i.get(y).__currentAnisotropy){const H=e.get("EXT_texture_filter_anisotropic");s.texParameterf(P,H.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(y.anisotropy,n.getMaxAnisotropy())),i.get(y).__currentAnisotropy=y.anisotropy}}}function z(P,y){let H=!1;P.__webglInit===void 0&&(P.__webglInit=!0,y.addEventListener("dispose",A));const X=y.source;let Z=f.get(X);Z===void 0&&(Z={},f.set(X,Z));const oe=F(y);if(oe!==P.__cacheKey){Z[oe]===void 0&&(Z[oe]={texture:s.createTexture(),usedTimes:0},o.memory.textures++,H=!0),Z[oe].usedTimes++;const ce=Z[P.__cacheKey];ce!==void 0&&(Z[P.__cacheKey].usedTimes--,ce.usedTimes===0&&R(y)),P.__cacheKey=oe,P.__webglTexture=Z[oe].texture}return H}function j(P,y,H){return Math.floor(Math.floor(P/H)/y)}function te(P,y,H,X){const oe=P.updateRanges;if(oe.length===0)t.texSubImage2D(s.TEXTURE_2D,0,0,0,y.width,y.height,H,X,y.data);else{oe.sort((Ae,fe)=>Ae.start-fe.start);let ce=0;for(let Ae=1;Ae<oe.length;Ae++){const fe=oe[ce],ue=oe[Ae],Ne=fe.start+fe.count,Ue=j(ue.start,y.width,4),ze=j(fe.start,y.width,4);ue.start<=Ne+1&&Ue===ze&&j(ue.start+ue.count-1,y.width,4)===Ue?fe.count=Math.max(fe.count,ue.start+ue.count-fe.start):(++ce,oe[ce]=ue)}oe.length=ce+1;const J=t.getParameter(s.UNPACK_ROW_LENGTH),ee=t.getParameter(s.UNPACK_SKIP_PIXELS),he=t.getParameter(s.UNPACK_SKIP_ROWS);t.pixelStorei(s.UNPACK_ROW_LENGTH,y.width);for(let Ae=0,fe=oe.length;Ae<fe;Ae++){const ue=oe[Ae],Ne=Math.floor(ue.start/4),Ue=Math.ceil(ue.count/4),ze=Ne%y.width,I=Math.floor(Ne/y.width),le=Ue,Q=1;t.pixelStorei(s.UNPACK_SKIP_PIXELS,ze),t.pixelStorei(s.UNPACK_SKIP_ROWS,I),t.texSubImage2D(s.TEXTURE_2D,0,ze,I,le,Q,H,X,y.data)}P.clearUpdateRanges(),t.pixelStorei(s.UNPACK_ROW_LENGTH,J),t.pixelStorei(s.UNPACK_SKIP_PIXELS,ee),t.pixelStorei(s.UNPACK_SKIP_ROWS,he)}}function we(P,y,H){let X=s.TEXTURE_2D;(y.isDataArrayTexture||y.isCompressedArrayTexture)&&(X=s.TEXTURE_2D_ARRAY),y.isData3DTexture&&(X=s.TEXTURE_3D);const Z=z(P,y),oe=y.source;t.bindTexture(X,P.__webglTexture,s.TEXTURE0+H);const ce=i.get(oe);if(oe.version!==ce.__version||Z===!0){if(t.activeTexture(s.TEXTURE0+H),(typeof ImageBitmap<"u"&&y.image instanceof ImageBitmap)===!1){const Q=Xe.getPrimaries(Xe.workingColorSpace),de=y.colorSpace===nn?null:Xe.getPrimaries(y.colorSpace),_e=y.colorSpace===nn||Q===de?s.NONE:s.BROWSER_DEFAULT_WEBGL;t.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,y.flipY),t.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),t.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,_e)}t.pixelStorei(s.UNPACK_ALIGNMENT,y.unpackAlignment);let ee=m(y.image,!1,n.maxTextureSize);ee=qt(y,ee);const he=r.convert(y.format,y.colorSpace),Ae=r.convert(y.type);let fe=x(y.internalFormat,he,Ae,y.normalized,y.colorSpace,y.isVideoTexture);ae(X,y);let ue;const Ne=y.mipmaps,Ue=y.isVideoTexture!==!0,ze=ce.__version===void 0||Z===!0,I=oe.dataReady,le=S(y,ee);if(y.isDepthTexture)fe=b(y.format===En,y.type),ze&&(Ue?t.texStorage2D(s.TEXTURE_2D,1,fe,ee.width,ee.height):t.texImage2D(s.TEXTURE_2D,0,fe,ee.width,ee.height,0,he,Ae,null));else if(y.isDataTexture)if(Ne.length>0){Ue&&ze&&t.texStorage2D(s.TEXTURE_2D,le,fe,Ne[0].width,Ne[0].height);for(let Q=0,de=Ne.length;Q<de;Q++)ue=Ne[Q],Ue?I&&t.texSubImage2D(s.TEXTURE_2D,Q,0,0,ue.width,ue.height,he,Ae,ue.data):t.texImage2D(s.TEXTURE_2D,Q,fe,ue.width,ue.height,0,he,Ae,ue.data);y.generateMipmaps=!1}else Ue?(ze&&t.texStorage2D(s.TEXTURE_2D,le,fe,ee.width,ee.height),I&&te(y,ee,he,Ae)):t.texImage2D(s.TEXTURE_2D,0,fe,ee.width,ee.height,0,he,Ae,ee.data);else if(y.isCompressedTexture)if(y.isCompressedArrayTexture){Ue&&ze&&t.texStorage3D(s.TEXTURE_2D_ARRAY,le,fe,Ne[0].width,Ne[0].height,ee.depth);for(let Q=0,de=Ne.length;Q<de;Q++)if(ue=Ne[Q],y.format!==ai)if(he!==null)if(Ue){if(I)if(y.layerUpdates.size>0){const _e=sh(ue.width,ue.height,y.format,y.type);for(const ie of y.layerUpdates){const Te=ue.data.subarray(ie*_e/ue.data.BYTES_PER_ELEMENT,(ie+1)*_e/ue.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,Q,0,0,ie,ue.width,ue.height,1,he,Te)}y.clearLayerUpdates()}else t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,Q,0,0,0,ue.width,ue.height,ee.depth,he,ue.data)}else t.compressedTexImage3D(s.TEXTURE_2D_ARRAY,Q,fe,ue.width,ue.height,ee.depth,0,ue.data,0,0);else Le("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ue?I&&t.texSubImage3D(s.TEXTURE_2D_ARRAY,Q,0,0,0,ue.width,ue.height,ee.depth,he,Ae,ue.data):t.texImage3D(s.TEXTURE_2D_ARRAY,Q,fe,ue.width,ue.height,ee.depth,0,he,Ae,ue.data)}else{Ue&&ze&&t.texStorage2D(s.TEXTURE_2D,le,fe,Ne[0].width,Ne[0].height);for(let Q=0,de=Ne.length;Q<de;Q++)ue=Ne[Q],y.format!==ai?he!==null?Ue?I&&t.compressedTexSubImage2D(s.TEXTURE_2D,Q,0,0,ue.width,ue.height,he,ue.data):t.compressedTexImage2D(s.TEXTURE_2D,Q,fe,ue.width,ue.height,0,ue.data):Le("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ue?I&&t.texSubImage2D(s.TEXTURE_2D,Q,0,0,ue.width,ue.height,he,Ae,ue.data):t.texImage2D(s.TEXTURE_2D,Q,fe,ue.width,ue.height,0,he,Ae,ue.data)}else if(y.isDataArrayTexture)if(Ue){if(ze&&t.texStorage3D(s.TEXTURE_2D_ARRAY,le,fe,ee.width,ee.height,ee.depth),I)if(y.layerUpdates.size>0){const Q=sh(ee.width,ee.height,y.format,y.type);for(const de of y.layerUpdates){const _e=ee.data.subarray(de*Q/ee.data.BYTES_PER_ELEMENT,(de+1)*Q/ee.data.BYTES_PER_ELEMENT);t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,de,ee.width,ee.height,1,he,Ae,_e)}y.clearLayerUpdates()}else t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,ee.width,ee.height,ee.depth,he,Ae,ee.data)}else t.texImage3D(s.TEXTURE_2D_ARRAY,0,fe,ee.width,ee.height,ee.depth,0,he,Ae,ee.data);else if(y.isData3DTexture)Ue?(ze&&t.texStorage3D(s.TEXTURE_3D,le,fe,ee.width,ee.height,ee.depth),I&&t.texSubImage3D(s.TEXTURE_3D,0,0,0,0,ee.width,ee.height,ee.depth,he,Ae,ee.data)):t.texImage3D(s.TEXTURE_3D,0,fe,ee.width,ee.height,ee.depth,0,he,Ae,ee.data);else if(y.isFramebufferTexture){if(ze)if(Ue)t.texStorage2D(s.TEXTURE_2D,le,fe,ee.width,ee.height);else{let Q=ee.width,de=ee.height;for(let _e=0;_e<le;_e++)t.texImage2D(s.TEXTURE_2D,_e,fe,Q,de,0,he,Ae,null),Q>>=1,de>>=1}}else if(y.isHTMLTexture){if("texElementImage2D"in s){const Q=s.canvas;if(Q.hasAttribute("layoutsubtree")||Q.setAttribute("layoutsubtree","true"),ee.parentNode!==Q){Q.appendChild(ee),d.add(y),Q.onpaint=de=>{const _e=de.changedElements;for(const ie of d)_e.includes(ie.image)&&(ie.needsUpdate=!0)},Q.requestPaint();return}if(s.texElementImage2D.length===3)s.texElementImage2D(s.TEXTURE_2D,s.RGBA8,ee);else{const _e=s.RGBA,ie=s.RGBA,Te=s.UNSIGNED_BYTE;s.texElementImage2D(s.TEXTURE_2D,0,_e,ie,Te,ee)}s.texParameteri(s.TEXTURE_2D,s.TEXTURE_MIN_FILTER,s.LINEAR),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_S,s.CLAMP_TO_EDGE),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_T,s.CLAMP_TO_EDGE)}}else if(Ne.length>0){if(Ue&&ze){const Q=et(Ne[0]);t.texStorage2D(s.TEXTURE_2D,le,fe,Q.width,Q.height)}for(let Q=0,de=Ne.length;Q<de;Q++)ue=Ne[Q],Ue?I&&t.texSubImage2D(s.TEXTURE_2D,Q,0,0,he,Ae,ue):t.texImage2D(s.TEXTURE_2D,Q,fe,he,Ae,ue);y.generateMipmaps=!1}else if(Ue){if(ze){const Q=et(ee);t.texStorage2D(s.TEXTURE_2D,le,fe,Q.width,Q.height)}I&&t.texSubImage2D(s.TEXTURE_2D,0,0,0,he,Ae,ee)}else t.texImage2D(s.TEXTURE_2D,0,fe,he,Ae,ee);p(y)&&T(X),ce.__version=oe.version,y.onUpdate&&y.onUpdate(y)}P.__version=y.version}function Fe(P,y,H){if(y.image.length!==6)return;const X=z(P,y),Z=y.source;t.bindTexture(s.TEXTURE_CUBE_MAP,P.__webglTexture,s.TEXTURE0+H);const oe=i.get(Z);if(Z.version!==oe.__version||X===!0){t.activeTexture(s.TEXTURE0+H);const ce=Xe.getPrimaries(Xe.workingColorSpace),J=y.colorSpace===nn?null:Xe.getPrimaries(y.colorSpace),ee=y.colorSpace===nn||ce===J?s.NONE:s.BROWSER_DEFAULT_WEBGL;t.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,y.flipY),t.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),t.pixelStorei(s.UNPACK_ALIGNMENT,y.unpackAlignment),t.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,ee);const he=y.isCompressedTexture||y.image[0].isCompressedTexture,Ae=y.image[0]&&y.image[0].isDataTexture,fe=[];for(let ie=0;ie<6;ie++)!he&&!Ae?fe[ie]=m(y.image[ie],!0,n.maxCubemapSize):fe[ie]=Ae?y.image[ie].image:y.image[ie],fe[ie]=qt(y,fe[ie]);const ue=fe[0],Ne=r.convert(y.format,y.colorSpace),Ue=r.convert(y.type),ze=x(y.internalFormat,Ne,Ue,y.normalized,y.colorSpace),I=y.isVideoTexture!==!0,le=oe.__version===void 0||X===!0,Q=Z.dataReady;let de=S(y,ue);ae(s.TEXTURE_CUBE_MAP,y);let _e;if(he){I&&le&&t.texStorage2D(s.TEXTURE_CUBE_MAP,de,ze,ue.width,ue.height);for(let ie=0;ie<6;ie++){_e=fe[ie].mipmaps;for(let Te=0;Te<_e.length;Te++){const Me=_e[Te];y.format!==ai?Ne!==null?I?Q&&t.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Te,0,0,Me.width,Me.height,Ne,Me.data):t.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Te,ze,Me.width,Me.height,0,Me.data):Le("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):I?Q&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Te,0,0,Me.width,Me.height,Ne,Ue,Me.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Te,ze,Me.width,Me.height,0,Ne,Ue,Me.data)}}}else{if(_e=y.mipmaps,I&&le){_e.length>0&&de++;const ie=et(fe[0]);t.texStorage2D(s.TEXTURE_CUBE_MAP,de,ze,ie.width,ie.height)}for(let ie=0;ie<6;ie++)if(Ae){I?Q&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,0,0,fe[ie].width,fe[ie].height,Ne,Ue,fe[ie].data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,ze,fe[ie].width,fe[ie].height,0,Ne,Ue,fe[ie].data);for(let Te=0;Te<_e.length;Te++){const pt=_e[Te].image[ie].image;I?Q&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Te+1,0,0,pt.width,pt.height,Ne,Ue,pt.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Te+1,ze,pt.width,pt.height,0,Ne,Ue,pt.data)}}else{I?Q&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,0,0,Ne,Ue,fe[ie]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,ze,Ne,Ue,fe[ie]);for(let Te=0;Te<_e.length;Te++){const Me=_e[Te];I?Q&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Te+1,0,0,Ne,Ue,Me.image[ie]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Te+1,ze,Ne,Ue,Me.image[ie])}}}p(y)&&T(s.TEXTURE_CUBE_MAP),oe.__version=Z.version,y.onUpdate&&y.onUpdate(y)}P.__version=y.version}function Ie(P,y,H,X,Z,oe){const ce=r.convert(H.format,H.colorSpace),J=r.convert(H.type),ee=x(H.internalFormat,ce,J,H.normalized,H.colorSpace),he=i.get(y),Ae=i.get(H);if(Ae.__renderTarget=y,!he.__hasExternalTextures){const fe=Math.max(1,y.width>>oe),ue=Math.max(1,y.height>>oe);Z===s.TEXTURE_3D||Z===s.TEXTURE_2D_ARRAY?t.texImage3D(Z,oe,ee,fe,ue,y.depth,0,ce,J,null):t.texImage2D(Z,oe,ee,fe,ue,0,ce,J,null)}t.bindFramebuffer(s.FRAMEBUFFER,P),bt(y)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,X,Z,Ae.__webglTexture,0,ft(y)):(Z===s.TEXTURE_2D||Z>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&Z<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,X,Z,Ae.__webglTexture,oe),t.bindFramebuffer(s.FRAMEBUFFER,null)}function gt(P,y,H){if(s.bindRenderbuffer(s.RENDERBUFFER,P),y.depthBuffer){const X=y.depthTexture,Z=X&&X.isDepthTexture?X.type:null,oe=b(y.stencilBuffer,Z),ce=y.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;bt(y)?a.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,ft(y),oe,y.width,y.height):H?s.renderbufferStorageMultisample(s.RENDERBUFFER,ft(y),oe,y.width,y.height):s.renderbufferStorage(s.RENDERBUFFER,oe,y.width,y.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,ce,s.RENDERBUFFER,P)}else{const X=y.textures;for(let Z=0;Z<X.length;Z++){const oe=X[Z],ce=r.convert(oe.format,oe.colorSpace),J=r.convert(oe.type),ee=x(oe.internalFormat,ce,J,oe.normalized,oe.colorSpace);bt(y)?a.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,ft(y),ee,y.width,y.height):H?s.renderbufferStorageMultisample(s.RENDERBUFFER,ft(y),ee,y.width,y.height):s.renderbufferStorage(s.RENDERBUFFER,ee,y.width,y.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function $e(P,y,H){const X=y.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(s.FRAMEBUFFER,P),!(y.depthTexture&&y.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");const Z=i.get(y.depthTexture);if(Z.__renderTarget=y,(!Z.__webglTexture||y.depthTexture.image.width!==y.width||y.depthTexture.image.height!==y.height)&&(y.depthTexture.image.width=y.width,y.depthTexture.image.height=y.height,y.depthTexture.needsUpdate=!0),X){if(Z.__webglInit===void 0&&(Z.__webglInit=!0,y.depthTexture.addEventListener("dispose",A)),Z.__webglTexture===void 0){Z.__webglTexture=s.createTexture(),t.bindTexture(s.TEXTURE_CUBE_MAP,Z.__webglTexture),ae(s.TEXTURE_CUBE_MAP,y.depthTexture);const he=r.convert(y.depthTexture.format),Ae=r.convert(y.depthTexture.type);let fe;y.depthTexture.format===Hi?fe=s.DEPTH_COMPONENT24:y.depthTexture.format===En&&(fe=s.DEPTH24_STENCIL8);for(let ue=0;ue<6;ue++)s.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ue,0,fe,y.width,y.height,0,he,Ae,null)}}else W(y.depthTexture,0);const oe=Z.__webglTexture,ce=ft(y),J=X?s.TEXTURE_CUBE_MAP_POSITIVE_X+H:s.TEXTURE_2D,ee=y.depthTexture.format===En?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;if(y.depthTexture.format===Hi)bt(y)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,ee,J,oe,0,ce):s.framebufferTexture2D(s.FRAMEBUFFER,ee,J,oe,0);else if(y.depthTexture.format===En)bt(y)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,ee,J,oe,0,ce):s.framebufferTexture2D(s.FRAMEBUFFER,ee,J,oe,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function rt(P){const y=i.get(P),H=P.isWebGLCubeRenderTarget===!0;if(y.__boundDepthTexture!==P.depthTexture){const X=P.depthTexture;if(y.__depthDisposeCallback&&y.__depthDisposeCallback(),X){const Z=()=>{delete y.__boundDepthTexture,delete y.__depthDisposeCallback,X.removeEventListener("dispose",Z)};X.addEventListener("dispose",Z),y.__depthDisposeCallback=Z}y.__boundDepthTexture=X}if(P.depthTexture&&!y.__autoAllocateDepthBuffer)if(H)for(let X=0;X<6;X++)$e(y.__webglFramebuffer[X],P,X);else{const X=P.texture.mipmaps;X&&X.length>0?$e(y.__webglFramebuffer[0],P,0):$e(y.__webglFramebuffer,P,0)}else if(H){y.__webglDepthbuffer=[];for(let X=0;X<6;X++)if(t.bindFramebuffer(s.FRAMEBUFFER,y.__webglFramebuffer[X]),y.__webglDepthbuffer[X]===void 0)y.__webglDepthbuffer[X]=s.createRenderbuffer(),gt(y.__webglDepthbuffer[X],P,!1);else{const Z=P.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,oe=y.__webglDepthbuffer[X];s.bindRenderbuffer(s.RENDERBUFFER,oe),s.framebufferRenderbuffer(s.FRAMEBUFFER,Z,s.RENDERBUFFER,oe)}}else{const X=P.texture.mipmaps;if(X&&X.length>0?t.bindFramebuffer(s.FRAMEBUFFER,y.__webglFramebuffer[0]):t.bindFramebuffer(s.FRAMEBUFFER,y.__webglFramebuffer),y.__webglDepthbuffer===void 0)y.__webglDepthbuffer=s.createRenderbuffer(),gt(y.__webglDepthbuffer,P,!1);else{const Z=P.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,oe=y.__webglDepthbuffer;s.bindRenderbuffer(s.RENDERBUFFER,oe),s.framebufferRenderbuffer(s.FRAMEBUFFER,Z,s.RENDERBUFFER,oe)}}t.bindFramebuffer(s.FRAMEBUFFER,null)}function Je(P,y,H){const X=i.get(P);y!==void 0&&Ie(X.__webglFramebuffer,P,P.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),H!==void 0&&rt(P)}function Ke(P){const y=P.texture,H=i.get(P),X=i.get(y);P.addEventListener("dispose",_);const Z=P.textures,oe=P.isWebGLCubeRenderTarget===!0,ce=Z.length>1;if(ce||(X.__webglTexture===void 0&&(X.__webglTexture=s.createTexture()),X.__version=y.version,o.memory.textures++),oe){H.__webglFramebuffer=[];for(let J=0;J<6;J++)if(y.mipmaps&&y.mipmaps.length>0){H.__webglFramebuffer[J]=[];for(let ee=0;ee<y.mipmaps.length;ee++)H.__webglFramebuffer[J][ee]=s.createFramebuffer()}else H.__webglFramebuffer[J]=s.createFramebuffer()}else{if(y.mipmaps&&y.mipmaps.length>0){H.__webglFramebuffer=[];for(let J=0;J<y.mipmaps.length;J++)H.__webglFramebuffer[J]=s.createFramebuffer()}else H.__webglFramebuffer=s.createFramebuffer();if(ce)for(let J=0,ee=Z.length;J<ee;J++){const he=i.get(Z[J]);he.__webglTexture===void 0&&(he.__webglTexture=s.createTexture(),o.memory.textures++)}if(P.samples>0&&bt(P)===!1){H.__webglMultisampledFramebuffer=s.createFramebuffer(),H.__webglColorRenderbuffer=[],t.bindFramebuffer(s.FRAMEBUFFER,H.__webglMultisampledFramebuffer);for(let J=0;J<Z.length;J++){const ee=Z[J];H.__webglColorRenderbuffer[J]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,H.__webglColorRenderbuffer[J]);const he=r.convert(ee.format,ee.colorSpace),Ae=r.convert(ee.type),fe=x(ee.internalFormat,he,Ae,ee.normalized,ee.colorSpace,P.isXRRenderTarget===!0),ue=ft(P);s.renderbufferStorageMultisample(s.RENDERBUFFER,ue,fe,P.width,P.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+J,s.RENDERBUFFER,H.__webglColorRenderbuffer[J])}s.bindRenderbuffer(s.RENDERBUFFER,null),P.depthBuffer&&(H.__webglDepthRenderbuffer=s.createRenderbuffer(),gt(H.__webglDepthRenderbuffer,P,!0)),t.bindFramebuffer(s.FRAMEBUFFER,null)}}if(oe){t.bindTexture(s.TEXTURE_CUBE_MAP,X.__webglTexture),ae(s.TEXTURE_CUBE_MAP,y);for(let J=0;J<6;J++)if(y.mipmaps&&y.mipmaps.length>0)for(let ee=0;ee<y.mipmaps.length;ee++)Ie(H.__webglFramebuffer[J][ee],P,y,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+J,ee);else Ie(H.__webglFramebuffer[J],P,y,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+J,0);p(y)&&T(s.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(ce){for(let J=0,ee=Z.length;J<ee;J++){const he=Z[J],Ae=i.get(he);let fe=s.TEXTURE_2D;(P.isWebGL3DRenderTarget||P.isWebGLArrayRenderTarget)&&(fe=P.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),t.bindTexture(fe,Ae.__webglTexture),ae(fe,he),Ie(H.__webglFramebuffer,P,he,s.COLOR_ATTACHMENT0+J,fe,0),p(he)&&T(fe)}t.unbindTexture()}else{let J=s.TEXTURE_2D;if((P.isWebGL3DRenderTarget||P.isWebGLArrayRenderTarget)&&(J=P.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),t.bindTexture(J,X.__webglTexture),ae(J,y),y.mipmaps&&y.mipmaps.length>0)for(let ee=0;ee<y.mipmaps.length;ee++)Ie(H.__webglFramebuffer[ee],P,y,s.COLOR_ATTACHMENT0,J,ee);else Ie(H.__webglFramebuffer,P,y,s.COLOR_ATTACHMENT0,J,0);p(y)&&T(J),t.unbindTexture()}P.depthBuffer&&rt(P)}function yt(P){const y=P.textures;for(let H=0,X=y.length;H<X;H++){const Z=y[H];if(p(Z)){const oe=M(P),ce=i.get(Z).__webglTexture;t.bindTexture(oe,ce),T(oe),t.unbindTexture()}}}const Et=[],Ct=[];function Dt(P){if(P.samples>0){if(bt(P)===!1){const y=P.textures,H=P.width,X=P.height;let Z=s.COLOR_BUFFER_BIT;const oe=P.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,ce=i.get(P),J=y.length>1;if(J)for(let he=0;he<y.length;he++)t.bindFramebuffer(s.FRAMEBUFFER,ce.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+he,s.RENDERBUFFER,null),t.bindFramebuffer(s.FRAMEBUFFER,ce.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+he,s.TEXTURE_2D,null,0);t.bindFramebuffer(s.READ_FRAMEBUFFER,ce.__webglMultisampledFramebuffer);const ee=P.texture.mipmaps;ee&&ee.length>0?t.bindFramebuffer(s.DRAW_FRAMEBUFFER,ce.__webglFramebuffer[0]):t.bindFramebuffer(s.DRAW_FRAMEBUFFER,ce.__webglFramebuffer);for(let he=0;he<y.length;he++){if(P.resolveDepthBuffer&&(P.depthBuffer&&(Z|=s.DEPTH_BUFFER_BIT),P.stencilBuffer&&P.resolveStencilBuffer&&(Z|=s.STENCIL_BUFFER_BIT)),J){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,ce.__webglColorRenderbuffer[he]);const Ae=i.get(y[he]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,Ae,0)}s.blitFramebuffer(0,0,H,X,0,0,H,X,Z,s.NEAREST),c===!0&&(Et.length=0,Ct.length=0,Et.push(s.COLOR_ATTACHMENT0+he),P.depthBuffer&&P.resolveDepthBuffer===!1&&(Et.push(oe),Ct.push(oe),s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,Ct)),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,Et))}if(t.bindFramebuffer(s.READ_FRAMEBUFFER,null),t.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),J)for(let he=0;he<y.length;he++){t.bindFramebuffer(s.FRAMEBUFFER,ce.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+he,s.RENDERBUFFER,ce.__webglColorRenderbuffer[he]);const Ae=i.get(y[he]).__webglTexture;t.bindFramebuffer(s.FRAMEBUFFER,ce.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+he,s.TEXTURE_2D,Ae,0)}t.bindFramebuffer(s.DRAW_FRAMEBUFFER,ce.__webglMultisampledFramebuffer)}else if(P.depthBuffer&&P.resolveDepthBuffer===!1&&c){const y=P.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[y])}}}function ft(P){return Math.min(n.maxSamples,P.samples)}function bt(P){const y=i.get(P);return P.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&y.__useRenderToTexture!==!1}function O(P){const y=o.render.frame;h.get(P)!==y&&(h.set(P,y),P.update())}function qt(P,y){const H=P.colorSpace,X=P.format,Z=P.type;return P.isCompressedTexture===!0||P.isVideoTexture===!0||H!==Qr&&H!==nn&&(Xe.getTransfer(H)===tt?(X!==ai||Z!==ei)&&Le("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):We("WebGLTextures: Unsupported texture color space:",H)),y}function et(P){return typeof HTMLImageElement<"u"&&P instanceof HTMLImageElement?(l.width=P.naturalWidth||P.width,l.height=P.naturalHeight||P.height):typeof VideoFrame<"u"&&P instanceof VideoFrame?(l.width=P.displayWidth,l.height=P.displayHeight):(l.width=P.width,l.height=P.height),l}this.allocateTextureUnit=N,this.resetTextureUnits=k,this.getTextureUnits=q,this.setTextureUnits=U,this.setTexture2D=W,this.setTexture2DArray=K,this.setTexture3D=ne,this.setTextureCube=se,this.rebindTextures=Je,this.setupRenderTarget=Ke,this.updateRenderTargetMipmap=yt,this.updateMultisampleRenderTarget=Dt,this.setupDepthRenderbuffer=rt,this.setupFrameBufferTexture=Ie,this.useMultisampledRTT=bt,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function Lx(s,e){function t(i,n=nn){let r;const o=Xe.getTransfer(n);if(i===ei)return s.UNSIGNED_BYTE;if(i===yl)return s.UNSIGNED_SHORT_4_4_4_4;if(i===bl)return s.UNSIGNED_SHORT_5_5_5_1;if(i===cu)return s.UNSIGNED_INT_5_9_9_9_REV;if(i===hu)return s.UNSIGNED_INT_10F_11F_11F_REV;if(i===au)return s.BYTE;if(i===lu)return s.SHORT;if(i===Hs)return s.UNSIGNED_SHORT;if(i===vl)return s.INT;if(i===wi)return s.UNSIGNED_INT;if(i===ui)return s.FLOAT;if(i===zi)return s.HALF_FLOAT;if(i===uu)return s.ALPHA;if(i===du)return s.RGB;if(i===ai)return s.RGBA;if(i===Hi)return s.DEPTH_COMPONENT;if(i===En)return s.DEPTH_STENCIL;if(i===fu)return s.RED;if(i===Ml)return s.RED_INTEGER;if(i===Tn)return s.RG;if(i===El)return s.RG_INTEGER;if(i===Sl)return s.RGBA_INTEGER;if(i===Wr||i===Xr||i===qr||i===$r)if(o===tt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===Wr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Xr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===qr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===$r)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===Wr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Xr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===qr)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===$r)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Da||i===Ia||i===Ua||i===Fa)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===Da)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Ia)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Ua)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Fa)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Oa||i===ka||i===Ba||i===za||i===Ha||i===Zr||i===Ga)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(i===Oa||i===ka)return o===tt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===Ba)return o===tt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(i===za)return r.COMPRESSED_R11_EAC;if(i===Ha)return r.COMPRESSED_SIGNED_R11_EAC;if(i===Zr)return r.COMPRESSED_RG11_EAC;if(i===Ga)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===Va||i===Wa||i===Xa||i===qa||i===$a||i===Ya||i===Ka||i===Za||i===Ja||i===ja||i===Qa||i===el||i===tl||i===il)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(i===Va)return o===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Wa)return o===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Xa)return o===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===qa)return o===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===$a)return o===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Ya)return o===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Ka)return o===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===Za)return o===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Ja)return o===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===ja)return o===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Qa)return o===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===el)return o===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===tl)return o===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===il)return o===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===nl||i===sl||i===rl)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(i===nl)return o===tt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===sl)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===rl)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===ol||i===al||i===Jr||i===ll)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(i===ol)return r.COMPRESSED_RED_RGTC1_EXT;if(i===al)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Jr)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===ll)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===Gs?s.UNSIGNED_INT_24_8:s[i]!==void 0?s[i]:null}return{convert:t}}const Nx=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Dx=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class Ix{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const i=new Mu(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,i=new Ai({vertexShader:Nx,fragmentShader:Dx,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Ft(new vo(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class Ux extends an{constructor(e,t){super();const i=this;let n=null,r=1,o=null,a="local-floor",c=1,l=null,h=null,d=null,u=null,f=null,g=null;const v=typeof XRWebGLBinding<"u",m=new Ix,p={},T=t.getContextAttributes();let M=null,x=null;const b=[],S=[],A=new De;let _=null;const E=new It;E.viewport=new st;const R=new It;R.viewport=new st;const C=[E,R],L=new Vp;let k=null,q=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(z){let j=b[z];return j===void 0&&(j=new zo,b[z]=j),j.getTargetRaySpace()},this.getControllerGrip=function(z){let j=b[z];return j===void 0&&(j=new zo,b[z]=j),j.getGripSpace()},this.getHand=function(z){let j=b[z];return j===void 0&&(j=new zo,b[z]=j),j.getHandSpace()};function U(z){const j=S.indexOf(z.inputSource);if(j===-1)return;const te=b[j];te!==void 0&&(te.update(z.inputSource,z.frame,l||o),te.dispatchEvent({type:z.type,data:z.inputSource}))}function N(){n.removeEventListener("select",U),n.removeEventListener("selectstart",U),n.removeEventListener("selectend",U),n.removeEventListener("squeeze",U),n.removeEventListener("squeezestart",U),n.removeEventListener("squeezeend",U),n.removeEventListener("end",N),n.removeEventListener("inputsourceschange",F);for(let z=0;z<b.length;z++){const j=S[z];j!==null&&(S[z]=null,b[z].disconnect(j))}k=null,q=null,m.reset();for(const z in p)delete p[z];e.setRenderTarget(M),f=null,u=null,d=null,n=null,x=null,ae.stop(),i.isPresenting=!1,e.setPixelRatio(_),e.setSize(A.width,A.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(z){r=z,i.isPresenting===!0&&Le("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(z){a=z,i.isPresenting===!0&&Le("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||o},this.setReferenceSpace=function(z){l=z},this.getBaseLayer=function(){return u!==null?u:f},this.getBinding=function(){return d===null&&v&&(d=new XRWebGLBinding(n,t)),d},this.getFrame=function(){return g},this.getSession=function(){return n},this.setSession=async function(z){if(n=z,n!==null){if(M=e.getRenderTarget(),n.addEventListener("select",U),n.addEventListener("selectstart",U),n.addEventListener("selectend",U),n.addEventListener("squeeze",U),n.addEventListener("squeezestart",U),n.addEventListener("squeezeend",U),n.addEventListener("end",N),n.addEventListener("inputsourceschange",F),T.xrCompatible!==!0&&await t.makeXRCompatible(),_=e.getPixelRatio(),e.getSize(A),v&&"createProjectionLayer"in XRWebGLBinding.prototype){let te=null,we=null,Fe=null;T.depth&&(Fe=T.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,te=T.stencil?En:Hi,we=T.stencil?Gs:wi);const Ie={colorFormat:t.RGBA8,depthFormat:Fe,scaleFactor:r};d=this.getBinding(),u=d.createProjectionLayer(Ie),n.updateRenderState({layers:[u]}),e.setPixelRatio(1),e.setSize(u.textureWidth,u.textureHeight,!1),x=new Ti(u.textureWidth,u.textureHeight,{format:ai,type:ei,depthTexture:new cs(u.textureWidth,u.textureHeight,we,void 0,void 0,void 0,void 0,void 0,void 0,te),stencilBuffer:T.stencil,colorSpace:e.outputColorSpace,samples:T.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1})}else{const te={antialias:T.antialias,alpha:!0,depth:T.depth,stencil:T.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(n,t,te),n.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),x=new Ti(f.framebufferWidth,f.framebufferHeight,{format:ai,type:ei,colorSpace:e.outputColorSpace,stencilBuffer:T.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}x.isXRRenderTarget=!0,this.setFoveation(c),l=null,o=await n.requestReferenceSpace(a),ae.setContext(n),ae.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(n!==null)return n.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function F(z){for(let j=0;j<z.removed.length;j++){const te=z.removed[j],we=S.indexOf(te);we>=0&&(S[we]=null,b[we].disconnect(te))}for(let j=0;j<z.added.length;j++){const te=z.added[j];let we=S.indexOf(te);if(we===-1){for(let Ie=0;Ie<b.length;Ie++)if(Ie>=S.length){S.push(te),we=Ie;break}else if(S[Ie]===null){S[Ie]=te,we=Ie;break}if(we===-1)break}const Fe=b[we];Fe&&Fe.connect(te)}}const W=new D,K=new D;function ne(z,j,te){W.setFromMatrixPosition(j.matrixWorld),K.setFromMatrixPosition(te.matrixWorld);const we=W.distanceTo(K),Fe=j.projectionMatrix.elements,Ie=te.projectionMatrix.elements,gt=Fe[14]/(Fe[10]-1),$e=Fe[14]/(Fe[10]+1),rt=(Fe[9]+1)/Fe[5],Je=(Fe[9]-1)/Fe[5],Ke=(Fe[8]-1)/Fe[0],yt=(Ie[8]+1)/Ie[0],Et=gt*Ke,Ct=gt*yt,Dt=we/(-Ke+yt),ft=Dt*-Ke;if(j.matrixWorld.decompose(z.position,z.quaternion,z.scale),z.translateX(ft),z.translateZ(Dt),z.matrixWorld.compose(z.position,z.quaternion,z.scale),z.matrixWorldInverse.copy(z.matrixWorld).invert(),Fe[10]===-1)z.projectionMatrix.copy(j.projectionMatrix),z.projectionMatrixInverse.copy(j.projectionMatrixInverse);else{const bt=gt+Dt,O=$e+Dt,qt=Et-ft,et=Ct+(we-ft),P=rt*$e/O*bt,y=Je*$e/O*bt;z.projectionMatrix.makePerspective(qt,et,P,y,bt,O),z.projectionMatrixInverse.copy(z.projectionMatrix).invert()}}function se(z,j){j===null?z.matrixWorld.copy(z.matrix):z.matrixWorld.multiplyMatrices(j.matrixWorld,z.matrix),z.matrixWorldInverse.copy(z.matrixWorld).invert()}this.updateCamera=function(z){if(n===null)return;let j=z.near,te=z.far;m.texture!==null&&(m.depthNear>0&&(j=m.depthNear),m.depthFar>0&&(te=m.depthFar)),L.near=R.near=E.near=j,L.far=R.far=E.far=te,(k!==L.near||q!==L.far)&&(n.updateRenderState({depthNear:L.near,depthFar:L.far}),k=L.near,q=L.far),L.layers.mask=z.layers.mask|6,E.layers.mask=L.layers.mask&-5,R.layers.mask=L.layers.mask&-3;const we=z.parent,Fe=L.cameras;se(L,we);for(let Ie=0;Ie<Fe.length;Ie++)se(Fe[Ie],we);Fe.length===2?ne(L,E,R):L.projectionMatrix.copy(E.projectionMatrix),re(z,L,we)};function re(z,j,te){te===null?z.matrix.copy(j.matrixWorld):(z.matrix.copy(te.matrixWorld),z.matrix.invert(),z.matrix.multiply(j.matrixWorld)),z.matrix.decompose(z.position,z.quaternion,z.scale),z.updateMatrixWorld(!0),z.projectionMatrix.copy(j.projectionMatrix),z.projectionMatrixInverse.copy(j.projectionMatrixInverse),z.isPerspectiveCamera&&(z.fov=as*2*Math.atan(1/z.projectionMatrix.elements[5]),z.zoom=1)}this.getCamera=function(){return L},this.getFoveation=function(){if(!(u===null&&f===null))return c},this.setFoveation=function(z){c=z,u!==null&&(u.fixedFoveation=z),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=z)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(L)},this.getCameraTexture=function(z){return p[z]};let xe=null;function ve(z,j){if(h=j.getViewerPose(l||o),g=j,h!==null){const te=h.views;f!==null&&(e.setRenderTargetFramebuffer(x,f.framebuffer),e.setRenderTarget(x));let we=!1;te.length!==L.cameras.length&&(L.cameras.length=0,we=!0);for(let $e=0;$e<te.length;$e++){const rt=te[$e];let Je=null;if(f!==null)Je=f.getViewport(rt);else{const yt=d.getViewSubImage(u,rt);Je=yt.viewport,$e===0&&(e.setRenderTargetTextures(x,yt.colorTexture,yt.depthStencilTexture),e.setRenderTarget(x))}let Ke=C[$e];Ke===void 0&&(Ke=new It,Ke.layers.enable($e),Ke.viewport=new st,C[$e]=Ke),Ke.matrix.fromArray(rt.transform.matrix),Ke.matrix.decompose(Ke.position,Ke.quaternion,Ke.scale),Ke.projectionMatrix.fromArray(rt.projectionMatrix),Ke.projectionMatrixInverse.copy(Ke.projectionMatrix).invert(),Ke.viewport.set(Je.x,Je.y,Je.width,Je.height),$e===0&&(L.matrix.copy(Ke.matrix),L.matrix.decompose(L.position,L.quaternion,L.scale)),we===!0&&L.cameras.push(Ke)}const Fe=n.enabledFeatures;if(Fe&&Fe.includes("depth-sensing")&&n.depthUsage=="gpu-optimized"&&v){d=i.getBinding();const $e=d.getDepthInformation(te[0]);$e&&$e.isValid&&$e.texture&&m.init($e,n.renderState)}if(Fe&&Fe.includes("camera-access")&&v){e.state.unbindTexture(),d=i.getBinding();for(let $e=0;$e<te.length;$e++){const rt=te[$e].camera;if(rt){let Je=p[rt];Je||(Je=new Mu,p[rt]=Je);const Ke=d.getCameraImage(rt);Je.sourceTexture=Ke}}}}for(let te=0;te<b.length;te++){const we=S[te],Fe=b[te];we!==null&&Fe!==void 0&&Fe.update(we,j,l||o)}xe&&xe(z,j),j.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:j}),g=null}const ae=new Fu;ae.setAnimationLoop(ve),this.setAnimationLoop=function(z){xe=z},this.dispose=function(){}}}const Fx=new Oe,Vu=new ke;Vu.set(-1,0,0,0,1,0,0,0,1);function Ox(s,e){function t(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function i(m,p){p.color.getRGB(m.fogColor.value,Au(s)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function n(m,p,T,M,x){p.isNodeMaterial?p.uniformsNeedUpdate=!1:p.isMeshBasicMaterial?r(m,p):p.isMeshLambertMaterial?(r(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshToonMaterial?(r(m,p),d(m,p)):p.isMeshPhongMaterial?(r(m,p),h(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshStandardMaterial?(r(m,p),u(m,p),p.isMeshPhysicalMaterial&&f(m,p,x)):p.isMeshMatcapMaterial?(r(m,p),g(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),v(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(o(m,p),p.isLineDashedMaterial&&a(m,p)):p.isPointsMaterial?c(m,p,T,M):p.isSpriteMaterial?l(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,t(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===Yt&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,t(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===Yt&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,t(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,t(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);const T=e.get(p),M=T.envMap,x=T.envMapRotation;M&&(m.envMap.value=M,m.envMapRotation.value.setFromMatrix4(Fx.makeRotationFromEuler(x)).transpose(),M.isCubeTexture&&M.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(Vu),m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,m.aoMapTransform))}function o(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform))}function a(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function c(m,p,T,M){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*T,m.scale.value=M*.5,p.map&&(m.map.value=p.map,t(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function l(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function h(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function d(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function u(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function f(m,p,T){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Yt&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=T.texture,m.transmissionSamplerSize.value.set(T.width,T.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function v(m,p){const T=e.get(p).light;m.referencePosition.value.setFromMatrixPosition(T.matrixWorld),m.nearDistance.value=T.shadow.camera.near,m.farDistance.value=T.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:n}}function kx(s,e,t,i){let n={},r={},o=[];const a=s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);function c(x,b){const S=b.program;i.uniformBlockBinding(x,S)}function l(x,b){let S=n[x.id];S===void 0&&(m(x),S=h(x),n[x.id]=S,x.addEventListener("dispose",T));const A=b.program;i.updateUBOMapping(x,A);const _=e.render.frame;r[x.id]!==_&&(u(x),r[x.id]=_)}function h(x){const b=d();x.__bindingPointIndex=b;const S=s.createBuffer(),A=x.__size,_=x.usage;return s.bindBuffer(s.UNIFORM_BUFFER,S),s.bufferData(s.UNIFORM_BUFFER,A,_),s.bindBuffer(s.UNIFORM_BUFFER,null),s.bindBufferBase(s.UNIFORM_BUFFER,b,S),S}function d(){for(let x=0;x<a;x++)if(o.indexOf(x)===-1)return o.push(x),x;return We("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(x){const b=n[x.id],S=x.uniforms,A=x.__cache;s.bindBuffer(s.UNIFORM_BUFFER,b);for(let _=0,E=S.length;_<E;_++){const R=S[_];if(Array.isArray(R))for(let C=0,L=R.length;C<L;C++)f(R[C],_,C,A);else f(R,_,0,A)}s.bindBuffer(s.UNIFORM_BUFFER,null)}function f(x,b,S,A){if(v(x,b,S,A)===!0){const _=x.__offset,E=x.value;if(Array.isArray(E)){let R=0;for(let C=0;C<E.length;C++){const L=E[C],k=p(L);g(L,x.__data,R),typeof L!="number"&&typeof L!="boolean"&&!L.isMatrix3&&!ArrayBuffer.isView(L)&&(R+=k.storage/Float32Array.BYTES_PER_ELEMENT)}}else g(E,x.__data,0);s.bufferSubData(s.UNIFORM_BUFFER,_,x.__data)}}function g(x,b,S){typeof x=="number"||typeof x=="boolean"?b[0]=x:x.isMatrix3?(b[0]=x.elements[0],b[1]=x.elements[1],b[2]=x.elements[2],b[3]=0,b[4]=x.elements[3],b[5]=x.elements[4],b[6]=x.elements[5],b[7]=0,b[8]=x.elements[6],b[9]=x.elements[7],b[10]=x.elements[8],b[11]=0):ArrayBuffer.isView(x)?b.set(new x.constructor(x.buffer,x.byteOffset,b.length)):x.toArray(b,S)}function v(x,b,S,A){const _=x.value,E=b+"_"+S;if(A[E]===void 0)return typeof _=="number"||typeof _=="boolean"?A[E]=_:ArrayBuffer.isView(_)?A[E]=_.slice():A[E]=_.clone(),!0;{const R=A[E];if(typeof _=="number"||typeof _=="boolean"){if(R!==_)return A[E]=_,!0}else{if(ArrayBuffer.isView(_))return!0;if(R.equals(_)===!1)return R.copy(_),!0}}return!1}function m(x){const b=x.uniforms;let S=0;const A=16;for(let E=0,R=b.length;E<R;E++){const C=Array.isArray(b[E])?b[E]:[b[E]];for(let L=0,k=C.length;L<k;L++){const q=C[L],U=Array.isArray(q.value)?q.value:[q.value];for(let N=0,F=U.length;N<F;N++){const W=U[N],K=p(W),ne=S%A,se=ne%K.boundary,re=ne+se;S+=se,re!==0&&A-re<K.storage&&(S+=A-re),q.__data=new Float32Array(K.storage/Float32Array.BYTES_PER_ELEMENT),q.__offset=S,S+=K.storage}}}const _=S%A;return _>0&&(S+=A-_),x.__size=S,x.__cache={},this}function p(x){const b={boundary:0,storage:0};return typeof x=="number"||typeof x=="boolean"?(b.boundary=4,b.storage=4):x.isVector2?(b.boundary=8,b.storage=8):x.isVector3||x.isColor?(b.boundary=16,b.storage=12):x.isVector4?(b.boundary=16,b.storage=16):x.isMatrix3?(b.boundary=48,b.storage=48):x.isMatrix4?(b.boundary=64,b.storage=64):x.isTexture?Le("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(x)?(b.boundary=16,b.storage=x.byteLength):Le("WebGLRenderer: Unsupported uniform value type.",x),b}function T(x){const b=x.target;b.removeEventListener("dispose",T);const S=o.indexOf(b.__bindingPointIndex);o.splice(S,1),s.deleteBuffer(n[b.id]),delete n[b.id],delete r[b.id]}function M(){for(const x in n)s.deleteBuffer(n[x]);o=[],n={},r={}}return{bind:c,update:l,dispose:M}}const Bx=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let vi=null;function zx(){return vi===null&&(vi=new to(Bx,16,16,Tn,zi),vi.name="DFG_LUT",vi.minFilter=Tt,vi.magFilter=Tt,vi.wrapS=ti,vi.wrapT=ti,vi.generateMipmaps=!1,vi.needsUpdate=!0),vi}class Wu{constructor(e={}){const{canvas:t=af(),context:i=null,depth:n=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:u=!1,outputBufferType:f=ei}=e;this.isWebGLRenderer=!0;let g;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=i.getContextAttributes().alpha}else g=o;const v=f,m=new Set([Sl,El,Ml]),p=new Set([ei,wi,Hs,Gs,yl,bl]),T=new Uint32Array(4),M=new Int32Array(4),x=new D;let b=null,S=null;const A=[],_=[];let E=null;this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Si,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const R=this;let C=!1,L=null,k=null,q=null,U=null;this._outputColorSpace=ht;let N=0,F=0,W=null,K=-1,ne=null;const se=new st,re=new st;let xe=null;const ve=new Be(0);let ae=0,z=t.width,j=t.height,te=1,we=null,Fe=null;const Ie=new st(0,0,z,j),gt=new st(0,0,z,j);let $e=!1;const rt=new Ll;let Je=!1,Ke=!1;const yt=new Oe,Et=new D,Ct=new st,Dt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let ft=!1;function bt(){return W===null?te:1}let O=i;function qt(w,B){return t.getContext(w,B)}try{const w={alpha:!0,depth:n,stencil:r,antialias:a,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:h,failIfMajorPerformanceCaveat:d};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${xl}`),t.addEventListener("webglcontextlost",pt,!1),t.addEventListener("webglcontextrestored",lt,!1),t.addEventListener("webglcontextcreationerror",mi,!1),O===null){const B="webgl2";if(O=qt(B,w),O===null)throw qt(B)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}}catch(w){throw We("WebGLRenderer: "+w.message),w}let et,P,y,H,X,Z,oe,ce,J,ee,he,Ae,fe,ue,Ne,Ue,ze,I,le,Q,de,_e,ie;function Te(){et=new z_(O),et.init(),de=new Lx(O,et),P=new N_(O,et,e,de),y=new Cx(O,et),P.reversedDepthBuffer&&u&&y.buffers.depth.setReversed(!0),k=O.createFramebuffer(),q=O.createFramebuffer(),U=O.createFramebuffer(),H=new V_(O),X=new mx,Z=new Px(O,et,y,X,P,de,H),oe=new B_(R),ce=new $p(O),_e=new P_(O,ce),J=new H_(O,ce,H,_e),ee=new X_(O,J,ce,_e,H),I=new W_(O,P,Z),Ne=new D_(X),he=new px(R,oe,et,P,_e,Ne),Ae=new Ox(R,X),fe=new _x,ue=new Ex(et),ze=new C_(R,oe,y,ee,g,c),Ue=new Rx(R,ee,P),ie=new kx(O,H,P,y),le=new L_(O,et,H),Q=new G_(O,et,H),H.programs=he.programs,R.capabilities=P,R.extensions=et,R.properties=X,R.renderLists=fe,R.shadowMap=Ue,R.state=y,R.info=H}Te(),v!==ei&&(E=new $_(v,t.width,t.height,a,n,r));const Me=new Ux(R,O);this.xr=Me,this.getContext=function(){return O},this.getContextAttributes=function(){return O.getContextAttributes()},this.forceContextLoss=function(){const w=et.get("WEBGL_lose_context");w&&w.loseContext()},this.forceContextRestore=function(){const w=et.get("WEBGL_lose_context");w&&w.restoreContext()},this.getPixelRatio=function(){return te},this.setPixelRatio=function(w){w!==void 0&&(te=w,this.setSize(z,j,!1))},this.getSize=function(w){return w.set(z,j)},this.setSize=function(w,B,Y=!0){if(Me.isPresenting){Le("WebGLRenderer: Can't change size while VR device is presenting.");return}z=w,j=B,t.width=Math.floor(w*te),t.height=Math.floor(B*te),Y===!0&&(t.style.width=w+"px",t.style.height=B+"px"),E!==null&&E.setSize(t.width,t.height),this.setViewport(0,0,w,B)},this.getDrawingBufferSize=function(w){return w.set(z*te,j*te).floor()},this.setDrawingBufferSize=function(w,B,Y){z=w,j=B,te=Y,t.width=Math.floor(w*Y),t.height=Math.floor(B*Y),this.setViewport(0,0,w,B)},this.setEffects=function(w){if(v===ei){We("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(w){for(let B=0;B<w.length;B++)if(w[B].isOutputPass===!0){Le("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}E.setEffects(w||[])},this.getCurrentViewport=function(w){return w.copy(se)},this.getViewport=function(w){return w.copy(Ie)},this.setViewport=function(w,B,Y,G){w.isVector4?Ie.set(w.x,w.y,w.z,w.w):Ie.set(w,B,Y,G),y.viewport(se.copy(Ie).multiplyScalar(te).round())},this.getScissor=function(w){return w.copy(gt)},this.setScissor=function(w,B,Y,G){w.isVector4?gt.set(w.x,w.y,w.z,w.w):gt.set(w,B,Y,G),y.scissor(re.copy(gt).multiplyScalar(te).round())},this.getScissorTest=function(){return $e},this.setScissorTest=function(w){y.setScissorTest($e=w)},this.setOpaqueSort=function(w){we=w},this.setTransparentSort=function(w){Fe=w},this.getClearColor=function(w){return w.copy(ze.getClearColor())},this.setClearColor=function(){ze.setClearColor(...arguments)},this.getClearAlpha=function(){return ze.getClearAlpha()},this.setClearAlpha=function(){ze.setClearAlpha(...arguments)},this.clear=function(w=!0,B=!0,Y=!0){let G=0;if(w){let V=!1;if(W!==null){const ge=W.texture.format;V=m.has(ge)}if(V){const ge=W.texture.type,be=p.has(ge),me=ze.getClearColor(),Ee=ze.getClearAlpha(),Re=me.r,He=me.g,Ve=me.b;be?(T[0]=Re,T[1]=He,T[2]=Ve,T[3]=Ee,O.clearBufferuiv(O.COLOR,0,T)):(M[0]=Re,M[1]=He,M[2]=Ve,M[3]=Ee,O.clearBufferiv(O.COLOR,0,M))}else G|=O.COLOR_BUFFER_BIT}B&&(G|=O.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),Y&&(G|=O.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),G!==0&&O.clear(G)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(w){w.setRenderer(this),L=w},this.dispose=function(){t.removeEventListener("webglcontextlost",pt,!1),t.removeEventListener("webglcontextrestored",lt,!1),t.removeEventListener("webglcontextcreationerror",mi,!1),ze.dispose(),fe.dispose(),ue.dispose(),X.dispose(),oe.dispose(),ee.dispose(),_e.dispose(),ie.dispose(),he.dispose(),Me.dispose(),Me.removeEventListener("sessionstart",jl),Me.removeEventListener("sessionend",Ql),hn.stop()};function pt(w){w.preventDefault(),xc("WebGLRenderer: Context Lost."),C=!0}function lt(){xc("WebGLRenderer: Context Restored."),C=!1;const w=H.autoReset,B=Ue.enabled,Y=Ue.autoUpdate,G=Ue.needsUpdate,V=Ue.type;Te(),H.autoReset=w,Ue.enabled=B,Ue.autoUpdate=Y,Ue.needsUpdate=G,Ue.type=V}function mi(w){We("WebGLRenderer: A WebGL context could not be created. Reason: ",w.statusMessage)}function gi(w){const B=w.target;B.removeEventListener("dispose",gi),_d(B)}function _d(w){xd(w),X.remove(w)}function xd(w){const B=X.get(w).programs;B!==void 0&&(B.forEach(function(Y){he.releaseProgram(Y)}),w.isShaderMaterial&&he.releaseShaderCache(w))}this.renderBufferDirect=function(w,B,Y,G,V,ge){B===null&&(B=Dt);const be=V.isMesh&&V.matrixWorld.determinantAffine()<0,me=bd(w,B,Y,G,V);y.setMaterial(G,be);let Ee=Y.index,Re=1;if(G.wireframe===!0){if(Ee=J.getWireframeAttribute(Y),Ee===void 0)return;Re=2}const He=Y.drawRange,Ve=Y.attributes.position;let Pe=He.start*Re,it=(He.start+He.count)*Re;ge!==null&&(Pe=Math.max(Pe,ge.start*Re),it=Math.min(it,(ge.start+ge.count)*Re)),Ee!==null?(Pe=Math.max(Pe,0),it=Math.min(it,Ee.count)):Ve!=null&&(Pe=Math.max(Pe,0),it=Math.min(it,Ve.count));const _t=it-Pe;if(_t<0||_t===1/0)return;_e.setup(V,G,me,Y,Ee);let mt,ot=le;if(Ee!==null&&(mt=ce.get(Ee),ot=Q,ot.setIndex(mt)),V.isMesh)G.wireframe===!0?(y.setLineWidth(G.wireframeLinewidth*bt()),ot.setMode(O.LINES)):ot.setMode(O.TRIANGLES);else if(V.isLine){let Ot=G.linewidth;Ot===void 0&&(Ot=1),y.setLineWidth(Ot*bt()),V.isLineSegments?ot.setMode(O.LINES):V.isLineLoop?ot.setMode(O.LINE_LOOP):ot.setMode(O.LINE_STRIP)}else V.isPoints?ot.setMode(O.POINTS):V.isSprite&&ot.setMode(O.TRIANGLES);if(V.isBatchedMesh)if(et.get("WEBGL_multi_draw"))ot.renderMultiDraw(V._multiDrawStarts,V._multiDrawCounts,V._multiDrawCount);else{const Ot=V._multiDrawStarts,ye=V._multiDrawCounts,Kt=V._multiDrawCount,Ze=Ee?ce.get(Ee).bytesPerElement:1,ni=X.get(G).currentProgram.getUniforms();for(let _i=0;_i<Kt;_i++)ni.setValue(O,"_gl_DrawID",_i),ot.render(Ot[_i]/Ze,ye[_i])}else if(V.isInstancedMesh)ot.renderInstances(Pe,_t,V.count);else if(Y.isInstancedBufferGeometry){const Ot=Y._maxInstanceCount!==void 0?Y._maxInstanceCount:1/0,ye=Math.min(Y.instanceCount,Ot);ot.renderInstances(Pe,_t,ye)}else ot.render(Pe,_t)};function Jl(w,B,Y){w.transparent===!0&&w.side===Mi&&w.forceSinglePass===!1?(w.side=Yt,w.needsUpdate=!0,er(w,B,Y),w.side=Bi,w.needsUpdate=!0,er(w,B,Y),w.side=Mi):er(w,B,Y)}this.compile=function(w,B,Y=null){Y===null&&(Y=w),S=ue.get(Y),S.init(B),_.push(S),Y.traverseVisible(function(V){V.isLight&&V.layers.test(B.layers)&&(S.pushLight(V),V.castShadow&&S.pushShadow(V))}),w!==Y&&w.traverseVisible(function(V){V.isLight&&V.layers.test(B.layers)&&(S.pushLight(V),V.castShadow&&S.pushShadow(V))}),S.setupLights();const G=new Set;return w.traverse(function(V){if(!(V.isMesh||V.isPoints||V.isLine||V.isSprite))return;const ge=V.material;if(ge)if(Array.isArray(ge))for(let be=0;be<ge.length;be++){const me=ge[be];Jl(me,Y,V),G.add(me)}else Jl(ge,Y,V),G.add(ge)}),S=_.pop(),G},this.compileAsync=function(w,B,Y=null){const G=this.compile(w,B,Y);return new Promise(V=>{function ge(){if(G.forEach(function(be){X.get(be).currentProgram.isReady()&&G.delete(be)}),G.size===0){V(w);return}setTimeout(ge,10)}et.get("KHR_parallel_shader_compile")!==null?ge():setTimeout(ge,10)})};let Co=null;function vd(w){Co&&Co(w)}function jl(){hn.stop()}function Ql(){hn.start()}const hn=new Fu;hn.setAnimationLoop(vd),typeof self<"u"&&hn.setContext(self),this.setAnimationLoop=function(w){Co=w,Me.setAnimationLoop(w),w===null?hn.stop():hn.start()},Me.addEventListener("sessionstart",jl),Me.addEventListener("sessionend",Ql),this.render=function(w,B){if(B!==void 0&&B.isCamera!==!0){We("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(C===!0)return;L!==null&&L.renderStart(w,B);const Y=Me.enabled===!0&&Me.isPresenting===!0,G=E!==null&&(W===null||Y)&&E.begin(R,W);if(w.matrixWorldAutoUpdate===!0&&w.updateMatrixWorld(),B.parent===null&&B.matrixWorldAutoUpdate===!0&&B.updateMatrixWorld(),Me.enabled===!0&&Me.isPresenting===!0&&(E===null||E.isCompositing()===!1)&&(Me.cameraAutoUpdate===!0&&Me.updateCamera(B),B=Me.getCamera()),w.isScene===!0&&w.onBeforeRender(R,w,B,W),S=ue.get(w,_.length),S.init(B),S.state.textureUnits=Z.getTextureUnits(),_.push(S),yt.multiplyMatrices(B.projectionMatrix,B.matrixWorldInverse),rt.setFromProjectionMatrix(yt,Ei,B.reversedDepth),Ke=this.localClippingEnabled,Je=Ne.init(this.clippingPlanes,Ke),b=fe.get(w,A.length),b.init(),A.push(b),Me.enabled===!0&&Me.isPresenting===!0){const be=R.xr.getDepthSensingMesh();be!==null&&Po(be,B,-1/0,R.sortObjects)}Po(w,B,0,R.sortObjects),b.finish(),R.sortObjects===!0&&b.sort(we,Fe,B.reversedDepth),ft=Me.enabled===!1||Me.isPresenting===!1||Me.hasDepthSensing()===!1,ft&&ze.addToRenderList(b,w),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),Je===!0&&Ne.beginShadows();const V=S.state.shadowsArray;if(Ue.render(V,w,B),Je===!0&&Ne.endShadows(),(G&&E.hasRenderPass())===!1){const be=b.opaque,me=b.transmissive;if(S.setupLights(),B.isArrayCamera){const Ee=B.cameras;if(me.length>0)for(let Re=0,He=Ee.length;Re<He;Re++){const Ve=Ee[Re];tc(be,me,w,Ve)}ft&&ze.render(w);for(let Re=0,He=Ee.length;Re<He;Re++){const Ve=Ee[Re];ec(b,w,Ve,Ve.viewport)}}else me.length>0&&tc(be,me,w,B),ft&&ze.render(w),ec(b,w,B)}W!==null&&F===0&&(Z.updateMultisampleRenderTarget(W),Z.updateRenderTargetMipmap(W)),G&&E.end(R),w.isScene===!0&&w.onAfterRender(R,w,B),_e.resetDefaultState(),K=-1,ne=null,_.pop(),_.length>0?(S=_[_.length-1],Z.setTextureUnits(S.state.textureUnits),Je===!0&&Ne.setGlobalState(R.clippingPlanes,S.state.camera)):S=null,A.pop(),A.length>0?b=A[A.length-1]:b=null,L!==null&&L.renderEnd()};function Po(w,B,Y,G){if(w.visible===!1)return;if(w.layers.test(B.layers)){if(w.isGroup)Y=w.renderOrder;else if(w.isLOD)w.autoUpdate===!0&&w.update(B);else if(w.isLightProbeGrid)S.pushLightProbeGrid(w);else if(w.isLight)S.pushLight(w),w.castShadow&&S.pushShadow(w);else if(w.isSprite){if(!w.frustumCulled||rt.intersectsSprite(w)){G&&Ct.setFromMatrixPosition(w.matrixWorld).applyMatrix4(yt);const be=ee.update(w),me=w.material;me.visible&&b.push(w,be,me,Y,Ct.z,null)}}else if((w.isMesh||w.isLine||w.isPoints)&&(!w.frustumCulled||rt.intersectsObject(w))){const be=ee.update(w),me=w.material;if(G&&(w.boundingSphere!==void 0?(w.boundingSphere===null&&w.computeBoundingSphere(),Ct.copy(w.boundingSphere.center)):(be.boundingSphere===null&&be.computeBoundingSphere(),Ct.copy(be.boundingSphere.center)),Ct.applyMatrix4(w.matrixWorld).applyMatrix4(yt)),Array.isArray(me)){const Ee=be.groups;for(let Re=0,He=Ee.length;Re<He;Re++){const Ve=Ee[Re],Pe=me[Ve.materialIndex];Pe&&Pe.visible&&b.push(w,be,Pe,Y,Ct.z,Ve)}}else me.visible&&b.push(w,be,me,Y,Ct.z,null)}}const ge=w.children;for(let be=0,me=ge.length;be<me;be++)Po(ge[be],B,Y,G)}function ec(w,B,Y,G){const{opaque:V,transmissive:ge,transparent:be}=w;S.setupLightsView(Y),Je===!0&&Ne.setGlobalState(R.clippingPlanes,Y),G&&y.viewport(se.copy(G)),V.length>0&&Qs(V,B,Y),ge.length>0&&Qs(ge,B,Y),be.length>0&&Qs(be,B,Y),y.buffers.depth.setTest(!0),y.buffers.depth.setMask(!0),y.buffers.color.setMask(!0),y.setPolygonOffset(!1)}function tc(w,B,Y,G){if((Y.isScene===!0?Y.overrideMaterial:null)!==null)return;if(S.state.transmissionRenderTarget[G.id]===void 0){const Pe=et.has("EXT_color_buffer_half_float")||et.has("EXT_color_buffer_float");S.state.transmissionRenderTarget[G.id]=new Ti(1,1,{generateMipmaps:!0,type:Pe?zi:ei,minFilter:Fi,samples:Math.max(4,P.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Xe.workingColorSpace})}const ge=S.state.transmissionRenderTarget[G.id],be=G.viewport||se;ge.setSize(be.z*R.transmissionResolutionScale,be.w*R.transmissionResolutionScale);const me=R.getRenderTarget(),Ee=R.getActiveCubeFace(),Re=R.getActiveMipmapLevel();R.setRenderTarget(ge),R.getClearColor(ve),ae=R.getClearAlpha(),ae<1&&R.setClearColor(16777215,.5),R.clear(),ft&&ze.render(Y);const He=R.toneMapping;R.toneMapping=Si;const Ve=G.viewport;if(G.viewport!==void 0&&(G.viewport=void 0),S.setupLightsView(G),Je===!0&&Ne.setGlobalState(R.clippingPlanes,G),Qs(w,Y,G),Z.updateMultisampleRenderTarget(ge),Z.updateRenderTargetMipmap(ge),et.has("WEBGL_multisampled_render_to_texture")===!1){let Pe=!1;for(let it=0,_t=B.length;it<_t;it++){const mt=B[it],{object:ot,geometry:Ot,material:ye,group:Kt}=mt;if(ye.side===Mi&&ot.layers.test(G.layers)){const Ze=ye.side;ye.side=Yt,ye.needsUpdate=!0,ic(ot,Y,G,Ot,ye,Kt),ye.side=Ze,ye.needsUpdate=!0,Pe=!0}}Pe===!0&&(Z.updateMultisampleRenderTarget(ge),Z.updateRenderTargetMipmap(ge))}R.setRenderTarget(me,Ee,Re),R.setClearColor(ve,ae),Ve!==void 0&&(G.viewport=Ve),R.toneMapping=He}function Qs(w,B,Y){const G=B.isScene===!0?B.overrideMaterial:null;for(let V=0,ge=w.length;V<ge;V++){const be=w[V],{object:me,geometry:Ee,group:Re}=be;let He=be.material;He.allowOverride===!0&&G!==null&&(He=G),me.layers.test(Y.layers)&&ic(me,B,Y,Ee,He,Re)}}function ic(w,B,Y,G,V,ge){w.onBeforeRender(R,B,Y,G,V,ge),w.modelViewMatrix.multiplyMatrices(Y.matrixWorldInverse,w.matrixWorld),w.normalMatrix.getNormalMatrix(w.modelViewMatrix),V.onBeforeRender(R,B,Y,G,w,ge),V.transparent===!0&&V.side===Mi&&V.forceSinglePass===!1?(V.side=Yt,V.needsUpdate=!0,R.renderBufferDirect(Y,B,G,V,w,ge),V.side=Bi,V.needsUpdate=!0,R.renderBufferDirect(Y,B,G,V,w,ge),V.side=Mi):R.renderBufferDirect(Y,B,G,V,w,ge),w.onAfterRender(R,B,Y,G,V,ge)}function er(w,B,Y){B.isScene!==!0&&(B=Dt);const G=X.get(w),V=S.state.lights,ge=S.state.shadowsArray,be=V.state.version,me=he.getParameters(w,V.state,ge,B,Y,S.state.lightProbeGridArray),Ee=he.getProgramCacheKey(me);let Re=G.programs;G.environment=w.isMeshStandardMaterial||w.isMeshLambertMaterial||w.isMeshPhongMaterial?B.environment:null,G.fog=B.fog;const He=w.isMeshStandardMaterial||w.isMeshLambertMaterial&&!w.envMap||w.isMeshPhongMaterial&&!w.envMap;G.envMap=oe.get(w.envMap||G.environment,He),G.envMapRotation=G.environment!==null&&w.envMap===null?B.environmentRotation:w.envMapRotation,Re===void 0&&(w.addEventListener("dispose",gi),Re=new Map,G.programs=Re);let Ve=Re.get(Ee);if(Ve!==void 0){if(G.currentProgram===Ve&&G.lightsStateVersion===be)return sc(w,me),Ve}else me.uniforms=he.getUniforms(w),L!==null&&w.isNodeMaterial&&L.build(w,Y,me),w.onBeforeCompile(me,R),Ve=he.acquireProgram(me,Ee),Re.set(Ee,Ve),G.uniforms=me.uniforms;const Pe=G.uniforms;return(!w.isShaderMaterial&&!w.isRawShaderMaterial||w.clipping===!0)&&(Pe.clippingPlanes=Ne.uniform),sc(w,me),G.needsLights=Ed(w),G.lightsStateVersion=be,G.needsLights&&(Pe.ambientLightColor.value=V.state.ambient,Pe.lightProbe.value=V.state.probe,Pe.directionalLights.value=V.state.directional,Pe.directionalLightShadows.value=V.state.directionalShadow,Pe.spotLights.value=V.state.spot,Pe.spotLightShadows.value=V.state.spotShadow,Pe.rectAreaLights.value=V.state.rectArea,Pe.ltc_1.value=V.state.rectAreaLTC1,Pe.ltc_2.value=V.state.rectAreaLTC2,Pe.pointLights.value=V.state.point,Pe.pointLightShadows.value=V.state.pointShadow,Pe.hemisphereLights.value=V.state.hemi,Pe.directionalShadowMatrix.value=V.state.directionalShadowMatrix,Pe.spotLightMatrix.value=V.state.spotLightMatrix,Pe.spotLightMap.value=V.state.spotLightMap,Pe.pointShadowMatrix.value=V.state.pointShadowMatrix),G.lightProbeGrid=S.state.lightProbeGridArray.length>0,G.currentProgram=Ve,G.uniformsList=null,Ve}function nc(w){if(w.uniformsList===null){const B=w.currentProgram.getUniforms();w.uniformsList=Yr.seqWithValue(B.seq,w.uniforms)}return w.uniformsList}function sc(w,B){const Y=X.get(w);Y.outputColorSpace=B.outputColorSpace,Y.batching=B.batching,Y.batchingColor=B.batchingColor,Y.instancing=B.instancing,Y.instancingColor=B.instancingColor,Y.instancingMorph=B.instancingMorph,Y.skinning=B.skinning,Y.morphTargets=B.morphTargets,Y.morphNormals=B.morphNormals,Y.morphColors=B.morphColors,Y.morphTargetsCount=B.morphTargetsCount,Y.numClippingPlanes=B.numClippingPlanes,Y.numIntersection=B.numClipIntersection,Y.vertexAlphas=B.vertexAlphas,Y.vertexTangents=B.vertexTangents,Y.toneMapping=B.toneMapping}function yd(w,B){if(w.length===0)return null;if(w.length===1)return w[0].texture!==null?w[0]:null;x.setFromMatrixPosition(B.matrixWorld);for(let Y=0,G=w.length;Y<G;Y++){const V=w[Y];if(V.texture!==null&&V.boundingBox.containsPoint(x))return V}return null}function bd(w,B,Y,G,V){B.isScene!==!0&&(B=Dt),Z.resetTextureUnits();const ge=B.fog,be=G.isMeshStandardMaterial||G.isMeshLambertMaterial||G.isMeshPhongMaterial?B.environment:null,me=W===null?R.outputColorSpace:W.isXRRenderTarget===!0?W.texture.colorSpace:Xe.workingColorSpace,Ee=G.isMeshStandardMaterial||G.isMeshLambertMaterial&&!G.envMap||G.isMeshPhongMaterial&&!G.envMap,Re=oe.get(G.envMap||be,Ee),He=G.vertexColors===!0&&!!Y.attributes.color&&Y.attributes.color.itemSize===4,Ve=!!Y.attributes.tangent&&(!!G.normalMap||G.anisotropy>0),Pe=!!Y.morphAttributes.position,it=!!Y.morphAttributes.normal,_t=!!Y.morphAttributes.color;let mt=Si;G.toneMapped&&(W===null||W.isXRRenderTarget===!0)&&(mt=R.toneMapping);const ot=Y.morphAttributes.position||Y.morphAttributes.normal||Y.morphAttributes.color,Ot=ot!==void 0?ot.length:0,ye=X.get(G),Kt=S.state.lights;if(Je===!0&&(Ke===!0||w!==ne)){const ct=w===ne&&G.id===K;Ne.setState(G,w,ct)}let Ze=!1;G.version===ye.__version?(ye.needsLights&&ye.lightsStateVersion!==Kt.state.version||ye.outputColorSpace!==me||V.isBatchedMesh&&ye.batching===!1||!V.isBatchedMesh&&ye.batching===!0||V.isBatchedMesh&&ye.batchingColor===!0&&V.colorTexture===null||V.isBatchedMesh&&ye.batchingColor===!1&&V.colorTexture!==null||V.isInstancedMesh&&ye.instancing===!1||!V.isInstancedMesh&&ye.instancing===!0||V.isSkinnedMesh&&ye.skinning===!1||!V.isSkinnedMesh&&ye.skinning===!0||V.isInstancedMesh&&ye.instancingColor===!0&&V.instanceColor===null||V.isInstancedMesh&&ye.instancingColor===!1&&V.instanceColor!==null||V.isInstancedMesh&&ye.instancingMorph===!0&&V.morphTexture===null||V.isInstancedMesh&&ye.instancingMorph===!1&&V.morphTexture!==null||ye.envMap!==Re||G.fog===!0&&ye.fog!==ge||ye.numClippingPlanes!==void 0&&(ye.numClippingPlanes!==Ne.numPlanes||ye.numIntersection!==Ne.numIntersection)||ye.vertexAlphas!==He||ye.vertexTangents!==Ve||ye.morphTargets!==Pe||ye.morphNormals!==it||ye.morphColors!==_t||ye.toneMapping!==mt||ye.morphTargetsCount!==Ot||!!ye.lightProbeGrid!=S.state.lightProbeGridArray.length>0)&&(Ze=!0):(Ze=!0,ye.__version=G.version);let ni=ye.currentProgram;Ze===!0&&(ni=er(G,B,V),L&&G.isNodeMaterial&&L.onUpdateProgram(G,ni,ye));let _i=!1,Gi=!1,Cn=!1;const at=ni.getUniforms(),xt=ye.uniforms;if(y.useProgram(ni.program)&&(_i=!0,Gi=!0,Cn=!0),G.id!==K&&(K=G.id,Gi=!0),ye.needsLights){const ct=yd(S.state.lightProbeGridArray,V);ye.lightProbeGrid!==ct&&(ye.lightProbeGrid=ct,Gi=!0)}if(_i||ne!==w){y.buffers.depth.getReversed()&&w.reversedDepth!==!0&&(w._reversedDepth=!0,w.updateProjectionMatrix()),at.setValue(O,"projectionMatrix",w.projectionMatrix),at.setValue(O,"viewMatrix",w.matrixWorldInverse);const Wi=at.map.cameraPosition;Wi!==void 0&&Wi.setValue(O,Et.setFromMatrixPosition(w.matrixWorld)),P.logarithmicDepthBuffer&&at.setValue(O,"logDepthBufFC",2/(Math.log(w.far+1)/Math.LN2)),(G.isMeshPhongMaterial||G.isMeshToonMaterial||G.isMeshLambertMaterial||G.isMeshBasicMaterial||G.isMeshStandardMaterial||G.isShaderMaterial)&&at.setValue(O,"isOrthographic",w.isOrthographicCamera===!0),ne!==w&&(ne=w,Gi=!0,Cn=!0)}if(ye.needsLights&&(Kt.state.directionalShadowMap.length>0&&at.setValue(O,"directionalShadowMap",Kt.state.directionalShadowMap,Z),Kt.state.spotShadowMap.length>0&&at.setValue(O,"spotShadowMap",Kt.state.spotShadowMap,Z),Kt.state.pointShadowMap.length>0&&at.setValue(O,"pointShadowMap",Kt.state.pointShadowMap,Z)),V.isSkinnedMesh){at.setOptional(O,V,"bindMatrix"),at.setOptional(O,V,"bindMatrixInverse");const ct=V.skeleton;ct&&(ct.boneTexture===null&&ct.computeBoneTexture(),at.setValue(O,"boneTexture",ct.boneTexture,Z))}V.isBatchedMesh&&(at.setOptional(O,V,"batchingTexture"),at.setValue(O,"batchingTexture",V._matricesTexture,Z),at.setOptional(O,V,"batchingIdTexture"),at.setValue(O,"batchingIdTexture",V._indirectTexture,Z),at.setOptional(O,V,"batchingColorTexture"),V._colorsTexture!==null&&at.setValue(O,"batchingColorTexture",V._colorsTexture,Z));const Vi=Y.morphAttributes;if((Vi.position!==void 0||Vi.normal!==void 0||Vi.color!==void 0)&&I.update(V,Y,ni),(Gi||ye.receiveShadow!==V.receiveShadow)&&(ye.receiveShadow=V.receiveShadow,at.setValue(O,"receiveShadow",V.receiveShadow)),(G.isMeshStandardMaterial||G.isMeshLambertMaterial||G.isMeshPhongMaterial)&&G.envMap===null&&B.environment!==null&&(xt.envMapIntensity.value=B.environmentIntensity),xt.dfgLUT!==void 0&&(xt.dfgLUT.value=zx()),Gi){if(at.setValue(O,"toneMappingExposure",R.toneMappingExposure),ye.needsLights&&Md(xt,Cn),ge&&G.fog===!0&&Ae.refreshFogUniforms(xt,ge),Ae.refreshMaterialUniforms(xt,G,te,j,S.state.transmissionRenderTarget[w.id]),ye.needsLights&&ye.lightProbeGrid){const ct=ye.lightProbeGrid;xt.probesSH.value=ct.texture,xt.probesMin.value.copy(ct.boundingBox.min),xt.probesMax.value.copy(ct.boundingBox.max),xt.probesResolution.value.copy(ct.resolution)}Yr.upload(O,nc(ye),xt,Z)}if(G.isShaderMaterial&&G.uniformsNeedUpdate===!0&&(Yr.upload(O,nc(ye),xt,Z),G.uniformsNeedUpdate=!1),G.isSpriteMaterial&&at.setValue(O,"center",V.center),at.setValue(O,"modelViewMatrix",V.modelViewMatrix),at.setValue(O,"normalMatrix",V.normalMatrix),at.setValue(O,"modelMatrix",V.matrixWorld),G.uniformsGroups!==void 0){const ct=G.uniformsGroups;for(let Wi=0,Pn=ct.length;Wi<Pn;Wi++){const rc=ct[Wi];ie.update(rc,ni),ie.bind(rc,ni)}}return ni}function Md(w,B){w.ambientLightColor.needsUpdate=B,w.lightProbe.needsUpdate=B,w.directionalLights.needsUpdate=B,w.directionalLightShadows.needsUpdate=B,w.pointLights.needsUpdate=B,w.pointLightShadows.needsUpdate=B,w.spotLights.needsUpdate=B,w.spotLightShadows.needsUpdate=B,w.rectAreaLights.needsUpdate=B,w.hemisphereLights.needsUpdate=B}function Ed(w){return w.isMeshLambertMaterial||w.isMeshToonMaterial||w.isMeshPhongMaterial||w.isMeshStandardMaterial||w.isShadowMaterial||w.isShaderMaterial&&w.lights===!0}this.getActiveCubeFace=function(){return N},this.getActiveMipmapLevel=function(){return F},this.getRenderTarget=function(){return W},this.setRenderTargetTextures=function(w,B,Y){const G=X.get(w);G.__autoAllocateDepthBuffer=w.resolveDepthBuffer===!1,G.__autoAllocateDepthBuffer===!1&&(G.__useRenderToTexture=!1),X.get(w.texture).__webglTexture=B,X.get(w.depthTexture).__webglTexture=G.__autoAllocateDepthBuffer?void 0:Y,G.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(w,B){const Y=X.get(w);Y.__webglFramebuffer=B,Y.__useDefaultFramebuffer=B===void 0},this.setRenderTarget=function(w,B=0,Y=0){W=w,N=B,F=Y;let G=null,V=!1,ge=!1;if(w){const me=X.get(w);if(me.__useDefaultFramebuffer!==void 0){y.bindFramebuffer(O.FRAMEBUFFER,me.__webglFramebuffer),se.copy(w.viewport),re.copy(w.scissor),xe=w.scissorTest,y.viewport(se),y.scissor(re),y.setScissorTest(xe),K=-1;return}else if(me.__webglFramebuffer===void 0)Z.setupRenderTarget(w);else if(me.__hasExternalTextures)Z.rebindTextures(w,X.get(w.texture).__webglTexture,X.get(w.depthTexture).__webglTexture);else if(w.depthBuffer){const He=w.depthTexture;if(me.__boundDepthTexture!==He){if(He!==null&&X.has(He)&&(w.width!==He.image.width||w.height!==He.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");Z.setupDepthRenderbuffer(w)}}const Ee=w.texture;(Ee.isData3DTexture||Ee.isDataArrayTexture||Ee.isCompressedArrayTexture)&&(ge=!0);const Re=X.get(w).__webglFramebuffer;w.isWebGLCubeRenderTarget?(Array.isArray(Re[B])?G=Re[B][Y]:G=Re[B],V=!0):w.samples>0&&Z.useMultisampledRTT(w)===!1?G=X.get(w).__webglMultisampledFramebuffer:Array.isArray(Re)?G=Re[Y]:G=Re,se.copy(w.viewport),re.copy(w.scissor),xe=w.scissorTest}else se.copy(Ie).multiplyScalar(te).floor(),re.copy(gt).multiplyScalar(te).floor(),xe=$e;if(Y!==0&&(G=k),y.bindFramebuffer(O.FRAMEBUFFER,G)&&y.drawBuffers(w,G),y.viewport(se),y.scissor(re),y.setScissorTest(xe),V){const me=X.get(w.texture);O.framebufferTexture2D(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_CUBE_MAP_POSITIVE_X+B,me.__webglTexture,Y)}else if(ge){const me=B;for(let Ee=0;Ee<w.textures.length;Ee++){const Re=X.get(w.textures[Ee]);O.framebufferTextureLayer(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0+Ee,Re.__webglTexture,Y,me)}}else if(w!==null&&Y!==0){const me=X.get(w.texture);O.framebufferTexture2D(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_2D,me.__webglTexture,Y)}K=-1},this.readRenderTargetPixels=function(w,B,Y,G,V,ge,be,me=0){if(!(w&&w.isWebGLRenderTarget)){We("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ee=X.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&be!==void 0&&(Ee=Ee[be]),Ee){y.bindFramebuffer(O.FRAMEBUFFER,Ee);try{const Re=w.textures[me],He=Re.format,Ve=Re.type;if(w.textures.length>1&&O.readBuffer(O.COLOR_ATTACHMENT0+me),!P.textureFormatReadable(He)){We("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!P.textureTypeReadable(Ve)){We("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}B>=0&&B<=w.width-G&&Y>=0&&Y<=w.height-V&&O.readPixels(B,Y,G,V,de.convert(He),de.convert(Ve),ge)}finally{const Re=W!==null?X.get(W).__webglFramebuffer:null;y.bindFramebuffer(O.FRAMEBUFFER,Re)}}},this.readRenderTargetPixelsAsync=async function(w,B,Y,G,V,ge,be,me=0){if(!(w&&w.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ee=X.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&be!==void 0&&(Ee=Ee[be]),Ee)if(B>=0&&B<=w.width-G&&Y>=0&&Y<=w.height-V){y.bindFramebuffer(O.FRAMEBUFFER,Ee);const Re=w.textures[me],He=Re.format,Ve=Re.type;if(w.textures.length>1&&O.readBuffer(O.COLOR_ATTACHMENT0+me),!P.textureFormatReadable(He))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!P.textureTypeReadable(Ve))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const Pe=O.createBuffer();O.bindBuffer(O.PIXEL_PACK_BUFFER,Pe),O.bufferData(O.PIXEL_PACK_BUFFER,ge.byteLength,O.STREAM_READ),O.readPixels(B,Y,G,V,de.convert(He),de.convert(Ve),0);const it=W!==null?X.get(W).__webglFramebuffer:null;y.bindFramebuffer(O.FRAMEBUFFER,it);const _t=O.fenceSync(O.SYNC_GPU_COMMANDS_COMPLETE,0);return O.flush(),await lf(O,_t,4),O.bindBuffer(O.PIXEL_PACK_BUFFER,Pe),O.getBufferSubData(O.PIXEL_PACK_BUFFER,0,ge),O.deleteBuffer(Pe),O.deleteSync(_t),ge}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(w,B=null,Y=0){const G=Math.pow(2,-Y),V=Math.floor(w.image.width*G),ge=Math.floor(w.image.height*G),be=B!==null?B.x:0,me=B!==null?B.y:0;Z.setTexture2D(w,0),O.copyTexSubImage2D(O.TEXTURE_2D,Y,0,0,be,me,V,ge),y.unbindTexture()},this.copyTextureToTexture=function(w,B,Y=null,G=null,V=0,ge=0){let be,me,Ee,Re,He,Ve,Pe,it,_t;const mt=w.isCompressedTexture?w.mipmaps[ge]:w.image;if(Y!==null)be=Y.max.x-Y.min.x,me=Y.max.y-Y.min.y,Ee=Y.isBox3?Y.max.z-Y.min.z:1,Re=Y.min.x,He=Y.min.y,Ve=Y.isBox3?Y.min.z:0;else{const xt=Math.pow(2,-V);be=Math.floor(mt.width*xt),me=Math.floor(mt.height*xt),w.isDataArrayTexture?Ee=mt.depth:w.isData3DTexture?Ee=Math.floor(mt.depth*xt):Ee=1,Re=0,He=0,Ve=0}G!==null?(Pe=G.x,it=G.y,_t=G.z):(Pe=0,it=0,_t=0);const ot=de.convert(B.format),Ot=de.convert(B.type);let ye;B.isData3DTexture?(Z.setTexture3D(B,0),ye=O.TEXTURE_3D):B.isDataArrayTexture||B.isCompressedArrayTexture?(Z.setTexture2DArray(B,0),ye=O.TEXTURE_2D_ARRAY):(Z.setTexture2D(B,0),ye=O.TEXTURE_2D),y.activeTexture(O.TEXTURE0),y.pixelStorei(O.UNPACK_FLIP_Y_WEBGL,B.flipY),y.pixelStorei(O.UNPACK_PREMULTIPLY_ALPHA_WEBGL,B.premultiplyAlpha),y.pixelStorei(O.UNPACK_ALIGNMENT,B.unpackAlignment);const Kt=y.getParameter(O.UNPACK_ROW_LENGTH),Ze=y.getParameter(O.UNPACK_IMAGE_HEIGHT),ni=y.getParameter(O.UNPACK_SKIP_PIXELS),_i=y.getParameter(O.UNPACK_SKIP_ROWS),Gi=y.getParameter(O.UNPACK_SKIP_IMAGES);y.pixelStorei(O.UNPACK_ROW_LENGTH,mt.width),y.pixelStorei(O.UNPACK_IMAGE_HEIGHT,mt.height),y.pixelStorei(O.UNPACK_SKIP_PIXELS,Re),y.pixelStorei(O.UNPACK_SKIP_ROWS,He),y.pixelStorei(O.UNPACK_SKIP_IMAGES,Ve);const Cn=w.isDataArrayTexture||w.isData3DTexture,at=B.isDataArrayTexture||B.isData3DTexture;if(w.isDepthTexture){const xt=X.get(w),Vi=X.get(B),ct=X.get(xt.__renderTarget),Wi=X.get(Vi.__renderTarget);y.bindFramebuffer(O.READ_FRAMEBUFFER,ct.__webglFramebuffer),y.bindFramebuffer(O.DRAW_FRAMEBUFFER,Wi.__webglFramebuffer);for(let Pn=0;Pn<Ee;Pn++)Cn&&(O.framebufferTextureLayer(O.READ_FRAMEBUFFER,O.COLOR_ATTACHMENT0,X.get(w).__webglTexture,V,Ve+Pn),O.framebufferTextureLayer(O.DRAW_FRAMEBUFFER,O.COLOR_ATTACHMENT0,X.get(B).__webglTexture,ge,_t+Pn)),O.blitFramebuffer(Re,He,be,me,Pe,it,be,me,O.DEPTH_BUFFER_BIT,O.NEAREST);y.bindFramebuffer(O.READ_FRAMEBUFFER,null),y.bindFramebuffer(O.DRAW_FRAMEBUFFER,null)}else if(V!==0||w.isRenderTargetTexture||X.has(w)){const xt=X.get(w),Vi=X.get(B);y.bindFramebuffer(O.READ_FRAMEBUFFER,q),y.bindFramebuffer(O.DRAW_FRAMEBUFFER,U);for(let ct=0;ct<Ee;ct++)Cn?O.framebufferTextureLayer(O.READ_FRAMEBUFFER,O.COLOR_ATTACHMENT0,xt.__webglTexture,V,Ve+ct):O.framebufferTexture2D(O.READ_FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_2D,xt.__webglTexture,V),at?O.framebufferTextureLayer(O.DRAW_FRAMEBUFFER,O.COLOR_ATTACHMENT0,Vi.__webglTexture,ge,_t+ct):O.framebufferTexture2D(O.DRAW_FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_2D,Vi.__webglTexture,ge),V!==0?O.blitFramebuffer(Re,He,be,me,Pe,it,be,me,O.COLOR_BUFFER_BIT,O.NEAREST):at?O.copyTexSubImage3D(ye,ge,Pe,it,_t+ct,Re,He,be,me):O.copyTexSubImage2D(ye,ge,Pe,it,Re,He,be,me);y.bindFramebuffer(O.READ_FRAMEBUFFER,null),y.bindFramebuffer(O.DRAW_FRAMEBUFFER,null)}else at?w.isDataTexture||w.isData3DTexture?O.texSubImage3D(ye,ge,Pe,it,_t,be,me,Ee,ot,Ot,mt.data):B.isCompressedArrayTexture?O.compressedTexSubImage3D(ye,ge,Pe,it,_t,be,me,Ee,ot,mt.data):O.texSubImage3D(ye,ge,Pe,it,_t,be,me,Ee,ot,Ot,mt):w.isDataTexture?O.texSubImage2D(O.TEXTURE_2D,ge,Pe,it,be,me,ot,Ot,mt.data):w.isCompressedTexture?O.compressedTexSubImage2D(O.TEXTURE_2D,ge,Pe,it,mt.width,mt.height,ot,mt.data):O.texSubImage2D(O.TEXTURE_2D,ge,Pe,it,be,me,ot,Ot,mt);y.pixelStorei(O.UNPACK_ROW_LENGTH,Kt),y.pixelStorei(O.UNPACK_IMAGE_HEIGHT,Ze),y.pixelStorei(O.UNPACK_SKIP_PIXELS,ni),y.pixelStorei(O.UNPACK_SKIP_ROWS,_i),y.pixelStorei(O.UNPACK_SKIP_IMAGES,Gi),ge===0&&B.generateMipmaps&&O.generateMipmap(ye),y.unbindTexture()},this.initRenderTarget=function(w){X.get(w).__webglFramebuffer===void 0&&Z.setupRenderTarget(w)},this.initTexture=function(w){w.isCubeTexture?Z.setTextureCube(w,0):w.isData3DTexture?Z.setTexture3D(w,0):w.isDataArrayTexture||w.isCompressedArrayTexture?Z.setTexture2DArray(w,0):Z.setTexture2D(w,0),y.unbindTexture()},this.resetState=function(){N=0,F=0,W=null,y.reset(),_e.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Ei}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=Xe._getDrawingBufferColorSpace(e),t.unpackColorSpace=Xe._getUnpackColorSpace()}}const Rh={type:"change"},Ol={type:"start"},Xu={type:"end"},Pr=new go,Ch=new tn,Hx=Math.cos(70*yi.DEG2RAD),St=new D,$t=2*Math.PI,nt={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},pa=1e-6;class qu extends Xp{constructor(e,t=null){super(e,t),this.state=nt.NONE,this.target=new D,this.cursor=new D,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:Qn.ROTATE,MIDDLE:Qn.DOLLY,RIGHT:Qn.PAN},this.touches={ONE:Zn.ROTATE,TWO:Zn.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle="auto",this._domElementKeyEvents=null,this._lastPosition=new D,this._lastQuaternion=new Nt,this._lastTargetPosition=new D,this._quat=new Nt().setFromUnitVectors(e.up,new D(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new eh,this._sphericalDelta=new eh,this._scale=1,this._panOffset=new D,this._rotateStart=new De,this._rotateEnd=new De,this._rotateDelta=new De,this._panStart=new De,this._panEnd=new De,this._panDelta=new De,this._dollyStart=new De,this._dollyEnd=new De,this._dollyDelta=new De,this._dollyDirection=new D,this._mouse=new De,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=Vx.bind(this),this._onPointerDown=Gx.bind(this),this._onPointerUp=Wx.bind(this),this._onContextMenu=Jx.bind(this),this._onMouseWheel=$x.bind(this),this._onKeyDown=Yx.bind(this),this._onTouchStart=Kx.bind(this),this._onTouchMove=Zx.bind(this),this._onMouseDown=Xx.bind(this),this._onMouseMove=qx.bind(this),this._interceptControlDown=jx.bind(this),this._interceptControlUp=Qx.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(e){this._cursorStyle=e,e==="grab"?this.domElement.style.cursor="grab":this.domElement.style.cursor="auto"}get cursorStyle(){return this._cursorStyle}connect(e){super.connect(e),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction=""}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(Rh),this.update(),this.state=nt.NONE}pan(e,t){this._pan(e,t),this.update()}dollyIn(e){this._dollyIn(e),this.update()}dollyOut(e){this._dollyOut(e),this.update()}rotateLeft(e){this._rotateLeft(e),this.update()}rotateUp(e){this._rotateUp(e),this.update()}update(e=null){const t=this.object.position;St.copy(t).sub(this.target),St.applyQuaternion(this._quat),this._spherical.setFromVector3(St),this.autoRotate&&this.state===nt.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let i=this.minAzimuthAngle,n=this.maxAzimuthAngle;isFinite(i)&&isFinite(n)&&(i<-Math.PI?i+=$t:i>Math.PI&&(i-=$t),n<-Math.PI?n+=$t:n>Math.PI&&(n-=$t),i<=n?this._spherical.theta=Math.max(i,Math.min(n,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(i+n)/2?Math.max(i,this._spherical.theta):Math.min(n,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{const o=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=o!=this._spherical.radius}if(St.setFromSpherical(this._spherical),St.applyQuaternion(this._quatInverse),t.copy(this.target).add(St),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let o=null;if(this.object.isPerspectiveCamera){const a=St.length();o=this._clampDistance(a*this._scale);const c=a-o;this.object.position.addScaledVector(this._dollyDirection,c),this.object.updateMatrixWorld(),r=!!c}else if(this.object.isOrthographicCamera){const a=new D(this._mouse.x,this._mouse.y,0);a.unproject(this.object);const c=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=c!==this.object.zoom;const l=new D(this._mouse.x,this._mouse.y,0);l.unproject(this.object),this.object.position.sub(l).add(a),this.object.updateMatrixWorld(),o=St.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;o!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(o).add(this.object.position):(Pr.origin.copy(this.object.position),Pr.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(Pr.direction))<Hx?this.object.lookAt(this.target):(Ch.setFromNormalAndCoplanarPoint(this.object.up,this.target),Pr.intersectPlane(Ch,this.target))))}else if(this.object.isOrthographicCamera){const o=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),o!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>pa||8*(1-this._lastQuaternion.dot(this.object.quaternion))>pa||this._lastTargetPosition.distanceToSquared(this.target)>pa?(this.dispatchEvent(Rh),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?$t/60*this.autoRotateSpeed*e:$t/60/60*this.autoRotateSpeed}_getZoomScale(e){const t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){St.setFromMatrixColumn(t,0),St.multiplyScalar(-e),this._panOffset.add(St)}_panUp(e,t){this.screenSpacePanning===!0?St.setFromMatrixColumn(t,1):(St.setFromMatrixColumn(t,0),St.crossVectors(this.object.up,St)),St.multiplyScalar(e),this._panOffset.add(St)}_pan(e,t){const i=this.domElement;if(this.object.isPerspectiveCamera){const n=this.object.position;St.copy(n).sub(this.target);let r=St.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*r/i.clientHeight,this.object.matrix),this._panUp(2*t*r/i.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/i.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/i.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;const i=this.domElement.getBoundingClientRect(),n=e-i.left,r=t-i.top,o=i.width,a=i.height;this._mouse.x=n/o*2-1,this._mouse.y=-(r/a)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const t=this.domElement;this._rotateLeft($t*this._rotateDelta.x/t.clientHeight),this._rotateUp($t*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp($t*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-$t*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft($t*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-$t*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),n=.5*(e.pageY+t.y);this._rotateStart.set(i,n)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),n=.5*(e.pageY+t.y);this._panStart.set(i,n)}}_handleTouchStartDolly(e){const t=this._getSecondPointerPosition(e),i=e.pageX-t.x,n=e.pageY-t.y,r=Math.sqrt(i*i+n*n);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{const i=this._getSecondPointerPosition(e),n=.5*(e.pageX+i.x),r=.5*(e.pageY+i.y);this._rotateEnd.set(n,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const t=this.domElement;this._rotateLeft($t*this._rotateDelta.x/t.clientHeight),this._rotateUp($t*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),n=.5*(e.pageY+t.y);this._panEnd.set(i,n)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){const t=this._getSecondPointerPosition(e),i=e.pageX-t.x,n=e.pageY-t.y,r=Math.sqrt(i*i+n*n);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);const o=(e.pageX+t.x)*.5,a=(e.pageY+t.y)*.5;this._updateZoomParameters(o,a)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new De,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){const t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){const t=e.deltaMode,i={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:i.deltaY*=16;break;case 2:i.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(i.deltaY*=10),i}}function Gx(s){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(s.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(s)&&(this._addPointer(s),s.pointerType==="touch"?this._onTouchStart(s):this._onMouseDown(s),this._cursorStyle==="grab"&&(this.domElement.style.cursor="grabbing")))}function Vx(s){this.enabled!==!1&&(s.pointerType==="touch"?this._onTouchMove(s):this._onMouseMove(s))}function Wx(s){switch(this._removePointer(s),this._pointers.length){case 0:this.domElement.releasePointerCapture(s.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(Xu),this.state=nt.NONE,this._cursorStyle==="grab"&&(this.domElement.style.cursor="grab");break;case 1:const e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function Xx(s){let e;switch(s.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case Qn.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(s),this.state=nt.DOLLY;break;case Qn.ROTATE:if(s.ctrlKey||s.metaKey||s.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(s),this.state=nt.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(s),this.state=nt.ROTATE}break;case Qn.PAN:if(s.ctrlKey||s.metaKey||s.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(s),this.state=nt.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(s),this.state=nt.PAN}break;default:this.state=nt.NONE}this.state!==nt.NONE&&this.dispatchEvent(Ol)}function qx(s){switch(this.state){case nt.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(s);break;case nt.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(s);break;case nt.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(s);break}}function $x(s){this.enabled===!1||this.enableZoom===!1||this.state!==nt.NONE||(s.preventDefault(),this.dispatchEvent(Ol),this._handleMouseWheel(this._customWheelEvent(s)),this.dispatchEvent(Xu))}function Yx(s){this.enabled!==!1&&this._handleKeyDown(s)}function Kx(s){switch(this._trackPointer(s),this._pointers.length){case 1:switch(this.touches.ONE){case Zn.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(s),this.state=nt.TOUCH_ROTATE;break;case Zn.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(s),this.state=nt.TOUCH_PAN;break;default:this.state=nt.NONE}break;case 2:switch(this.touches.TWO){case Zn.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(s),this.state=nt.TOUCH_DOLLY_PAN;break;case Zn.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(s),this.state=nt.TOUCH_DOLLY_ROTATE;break;default:this.state=nt.NONE}break;default:this.state=nt.NONE}this.state!==nt.NONE&&this.dispatchEvent(Ol)}function Zx(s){switch(this._trackPointer(s),this.state){case nt.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(s),this.update();break;case nt.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(s),this.update();break;case nt.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(s),this.update();break;case nt.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(s),this.update();break;default:this.state=nt.NONE}}function Jx(s){this.enabled!==!1&&s.preventDefault()}function jx(s){s.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function Qx(s){s.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}class ev extends cn{constructor(e){super(e)}load(e,t,i,n){const r=this,o=new Ul(this.manager);o.setPath(this.path),o.setResponseType("arraybuffer"),o.setRequestHeader(this.requestHeader),o.setWithCredentials(this.withCredentials),o.load(e,function(a){try{t(r.parse(a))}catch(c){n?n(c):console.error(c),r.manager.itemError(e)}},i,n)}parse(e){function t(l){const h=new DataView(l),d=32/8*3+32/8*3*3+16/8,u=h.getUint32(80,!0);if(80+32/8+u*d===h.byteLength)return!0;const g=[115,111,108,105,100];for(let v=0;v<5;v++)if(i(g,h,v))return!1;return!0}function i(l,h,d){for(let u=0,f=l.length;u<f;u++)if(l[u]!==h.getUint8(d+u))return!1;return!0}function n(l){const h=new DataView(l),d=h.getUint32(80,!0);let u,f,g,v=!1,m,p,T,M,x;for(let C=0;C<70;C++)h.getUint32(C,!1)==1129270351&&h.getUint8(C+4)==82&&h.getUint8(C+5)==61&&(v=!0,m=new Float32Array(d*3*3),p=h.getUint8(C+6)/255,T=h.getUint8(C+7)/255,M=h.getUint8(C+8)/255,x=h.getUint8(C+9)/255);const b=84,S=12*4+2,A=new wt,_=new Float32Array(d*3*3),E=new Float32Array(d*3*3),R=new Be;for(let C=0;C<d;C++){const L=b+C*S,k=h.getFloat32(L,!0),q=h.getFloat32(L+4,!0),U=h.getFloat32(L+8,!0);if(v){const N=h.getUint16(L+48,!0);N&32768?(u=p,f=T,g=M):(u=(N&31)/31,f=(N>>5&31)/31,g=(N>>10&31)/31)}for(let N=1;N<=3;N++){const F=L+N*12,W=C*3*3+(N-1)*3;_[W]=h.getFloat32(F,!0),_[W+1]=h.getFloat32(F+4,!0),_[W+2]=h.getFloat32(F+8,!0),E[W]=k,E[W+1]=q,E[W+2]=U,v&&(R.setRGB(u,f,g,ht),m[W]=R.r,m[W+1]=R.g,m[W+2]=R.b)}}return A.setAttribute("position",new ii(_,3)),A.setAttribute("normal",new ii(E,3)),v&&(A.setAttribute("color",new ii(m,3)),A.hasColors=!0,A.alpha=x),A}function r(l){const h=new wt,d=/solid([\s\S]*?)endsolid/g,u=/facet([\s\S]*?)endfacet/g,f=/solid\s(.+)/;let g=0;const v=/[\s]+([+-]?(?:\d*)(?:\.\d*)?(?:[eE][+-]?\d+)?)/.source,m=new RegExp("vertex"+v+v+v,"g"),p=new RegExp("normal"+v+v+v,"g"),T=[],M=[],x=[],b=new D;let S,A=0,_=0,E=0;for(;(S=d.exec(l))!==null;){_=E;const R=S[0],C=(S=f.exec(R))!==null?S[1]:"";for(x.push(C);(S=u.exec(R))!==null;){let q=0,U=0;const N=S[0];for(;(S=p.exec(N))!==null;)b.x=parseFloat(S[1]),b.y=parseFloat(S[2]),b.z=parseFloat(S[3]),U++;for(;(S=m.exec(N))!==null;)T.push(parseFloat(S[1]),parseFloat(S[2]),parseFloat(S[3])),M.push(b.x,b.y,b.z),q++,E++;U!==1&&console.error("THREE.STLLoader: Something isn't right with the normal of face number "+g),q!==3&&console.error("THREE.STLLoader: Something isn't right with the vertices of face number "+g),g++}const L=_,k=E-_;h.userData.groupNames=x,h.addGroup(L,k,A),A++}return h.setAttribute("position",new je(T,3)),h.setAttribute("normal",new je(M,3)),h}function o(l){return typeof l!="string"?new TextDecoder().decode(l):l}function a(l){if(typeof l=="string"){const h=new Uint8Array(l.length);for(let d=0;d<l.length;d++)h[d]=l.charCodeAt(d)&255;return h.buffer||h}else return l}const c=a(e);return t(c)?n(c):r(o(e))}}class Ph extends Up{constructor(e){super(e)}parse(e){function t(N){switch(N.image_type){case u:case v:if(N.colormap_length>256||N.colormap_size!==24||N.colormap_type!==1)throw new Error("THREE.TGALoader: Invalid type colormap data for indexed type.");break;case f:case g:case m:case p:if(N.colormap_type)throw new Error("THREE.TGALoader: Invalid type colormap data for colormap type.");break;case d:throw new Error("THREE.TGALoader: No data.");default:throw new Error("THREE.TGALoader: Invalid type "+N.image_type)}if(N.width<=0||N.height<=0)throw new Error("THREE.TGALoader: Invalid image size.");if(N.pixel_size!==8&&N.pixel_size!==16&&N.pixel_size!==24&&N.pixel_size!==32)throw new Error("THREE.TGALoader: Invalid pixel size "+N.pixel_size)}function i(N,F,W,K,ne){let se,re;const xe=W.pixel_size>>3,ve=W.width*W.height*xe;if(F&&(re=ne.subarray(K,K+=W.colormap_length*(W.colormap_size>>3))),N){se=new Uint8Array(ve);let ae,z,j,te=0;const we=new Uint8Array(xe);for(;te<ve;)if(ae=ne[K++],z=(ae&127)+1,ae&128){for(j=0;j<xe;++j)we[j]=ne[K++];for(j=0;j<z;++j)se.set(we,te+j*xe);te+=xe*z}else{for(z*=xe,j=0;j<z;++j)se[te+j]=ne[K++];te+=z}}else se=ne.subarray(K,K+=F?W.width*W.height:ve);return{pixel_data:se,palettes:re}}function n(N,F,W,K,ne,se,re,xe,ve){const ae=ve;let z,j=0,te,we;const Fe=R.width;for(we=F;we!==K;we+=W)for(te=ne;te!==re;te+=se,j++)z=xe[j],N[(te+Fe*we)*4+3]=255,N[(te+Fe*we)*4+2]=ae[z*3+0],N[(te+Fe*we)*4+1]=ae[z*3+1],N[(te+Fe*we)*4+0]=ae[z*3+2];return N}function r(N,F,W,K,ne,se,re,xe){let ve,ae=0,z,j;const te=R.width;for(j=F;j!==K;j+=W)for(z=ne;z!==re;z+=se,ae+=2)ve=xe[ae+0]+(xe[ae+1]<<8),N[(z+te*j)*4+0]=(ve&31744)>>7,N[(z+te*j)*4+1]=(ve&992)>>2,N[(z+te*j)*4+2]=(ve&31)<<3,N[(z+te*j)*4+3]=ve&32768?0:255;return N}function o(N,F,W,K,ne,se,re,xe){let ve=0,ae,z;const j=R.width;for(z=F;z!==K;z+=W)for(ae=ne;ae!==re;ae+=se,ve+=3)N[(ae+j*z)*4+3]=255,N[(ae+j*z)*4+2]=xe[ve+0],N[(ae+j*z)*4+1]=xe[ve+1],N[(ae+j*z)*4+0]=xe[ve+2];return N}function a(N,F,W,K,ne,se,re,xe){let ve=0,ae,z;const j=R.width;for(z=F;z!==K;z+=W)for(ae=ne;ae!==re;ae+=se,ve+=4)N[(ae+j*z)*4+2]=xe[ve+0],N[(ae+j*z)*4+1]=xe[ve+1],N[(ae+j*z)*4+0]=xe[ve+2],N[(ae+j*z)*4+3]=xe[ve+3];return N}function c(N,F,W,K,ne,se,re,xe){let ve,ae=0,z,j;const te=R.width;for(j=F;j!==K;j+=W)for(z=ne;z!==re;z+=se,ae++)ve=xe[ae],N[(z+te*j)*4+0]=ve,N[(z+te*j)*4+1]=ve,N[(z+te*j)*4+2]=ve,N[(z+te*j)*4+3]=255;return N}function l(N,F,W,K,ne,se,re,xe){let ve=0,ae,z;const j=R.width;for(z=F;z!==K;z+=W)for(ae=ne;ae!==re;ae+=se,ve+=2)N[(ae+j*z)*4+0]=xe[ve+0],N[(ae+j*z)*4+1]=xe[ve+0],N[(ae+j*z)*4+2]=xe[ve+0],N[(ae+j*z)*4+3]=xe[ve+1];return N}function h(N,F,W,K,ne){let se,re,xe,ve,ae,z;switch((R.flags&T)>>M){default:case S:se=0,xe=1,ae=F,re=0,ve=1,z=W;break;case x:se=0,xe=1,ae=F,re=W-1,ve=-1,z=-1;break;case A:se=F-1,xe=-1,ae=-1,re=0,ve=1,z=W;break;case b:se=F-1,xe=-1,ae=-1,re=W-1,ve=-1,z=-1;break}if(k)switch(R.pixel_size){case 8:c(N,re,ve,z,se,xe,ae,K);break;case 16:l(N,re,ve,z,se,xe,ae,K);break;default:throw new Error("THREE.TGALoader: Format not supported.")}else switch(R.pixel_size){case 8:n(N,re,ve,z,se,xe,ae,K,ne);break;case 16:r(N,re,ve,z,se,xe,ae,K);break;case 24:o(N,re,ve,z,se,xe,ae,K);break;case 32:a(N,re,ve,z,se,xe,ae,K);break;default:throw new Error("THREE.TGALoader: Format not supported.")}return N}const d=0,u=1,f=2,g=3,v=9,m=10,p=11,T=48,M=4,x=0,b=1,S=2,A=3;if(e.length<19)throw new Error("THREE.TGALoader: Not enough data to contain header.");let _=0;const E=new Uint8Array(e),R={id_length:E[_++],colormap_type:E[_++],image_type:E[_++],colormap_index:E[_++]|E[_++]<<8,colormap_length:E[_++]|E[_++]<<8,colormap_size:E[_++],origin:[E[_++]|E[_++]<<8,E[_++]|E[_++]<<8],width:E[_++]|E[_++]<<8,height:E[_++]|E[_++]<<8,pixel_size:E[_++],flags:E[_++]};if(t(R),R.id_length+_>e.length)throw new Error("THREE.TGALoader: No data.");_+=R.id_length;let C=!1,L=!1,k=!1;switch(R.image_type){case v:C=!0,L=!0;break;case u:L=!0;break;case m:C=!0;break;case f:break;case p:C=!0,k=!0;break;case g:k=!0;break}const q=new Uint8Array(R.width*R.height*4),U=i(C,L,R,_,E);return h(q,R.width,R.height,U.pixel_data,U.palettes),{data:q,width:R.width,height:R.height,flipY:!0,generateMipmaps:!0,minFilter:Fi}}}function Qt(s,e){const t=[],i=s.childNodes;for(let n=0,r=i.length;n<r;n++){const o=i[n];o.nodeName===e&&t.push(o)}return t}function tv(s){return s.length===0?[]:s.trim().split(/\s+/)}function Xt(s){return s.length===0?[]:s.trim().split(/\s+/).map(parseFloat)}function Lr(s){return s.length===0?[]:s.trim().split(/\s+/).map(e=>parseInt(e))}function Lt(s){return s.substring(1)}class iv{constructor(){this.count=0}generateId(){return"three_default_"+this.count++}parse(e){if(e.length===0)return null;const t=new DOMParser().parseFromString(e,"application/xml"),i=Qt(t,"COLLADA")[0],n=t.getElementsByTagName("parsererror")[0];if(n!==void 0){const c=Qt(n,"div")[0];let l;return c?l=c.textContent:l=this.parserErrorToText(n),console.error(`THREE.ColladaLoader: Failed to parse collada file.
`,l),null}const r=i.getAttribute("version");console.debug("THREE.ColladaLoader: File version",r);const o=this.parseAsset(Qt(i,"asset")[0]),a={animations:{},clips:{},controllers:{},images:{},effects:{},materials:{},cameras:{},lights:{},geometries:{},nodes:{},visualScenes:{},kinematicsModels:{},physicsModels:{},kinematicsScenes:{},joints:{}};return this.library=a,this.collada=i,this.parseLibrary(i,"library_animations","animation",this.parseAnimation.bind(this)),this.parseLibrary(i,"library_animation_clips","animation_clip",this.parseAnimationClip.bind(this)),this.parseLibrary(i,"library_controllers","controller",this.parseController.bind(this)),this.parseLibrary(i,"library_images","image",this.parseImage.bind(this)),this.parseLibrary(i,"library_effects","effect",this.parseEffect.bind(this)),this.parseLibrary(i,"library_materials","material",this.parseMaterial.bind(this)),this.parseLibrary(i,"library_cameras","camera",this.parseCamera.bind(this)),this.parseLibrary(i,"library_lights","light",this.parseLight.bind(this)),this.parseLibrary(i,"library_geometries","geometry",this.parseGeometry.bind(this)),this.parseLibrary(i,"library_nodes","node",this.parseNode.bind(this)),this.parseLibrary(i,"library_visual_scenes","visual_scene",this.parseVisualScene.bind(this)),this.parseLibrary(i,"library_joints","joint",this.parseLibraryJoint.bind(this)),this.parseLibrary(i,"library_kinematics_models","kinematics_model",this.parseKinematicsModel.bind(this)),this.parseLibrary(i,"library_physics_models","physics_model",this.parsePhysicsModel.bind(this)),this.parseLibrary(i,"scene","instance_kinematics_scene",this.parseKinematicsScene.bind(this)),{library:a,asset:o,collada:i}}parserErrorToText(e){const t=[],i=[e];for(;i.length;){const n=i.shift();n.nodeType===Node.TEXT_NODE?t.push(n.textContent):(t.push(`
`),i.push(...n.childNodes))}return t.join("").trim()}parseAsset(e){return{unit:this.parseAssetUnit(Qt(e,"unit")[0]),upAxis:this.parseAssetUpAxis(Qt(e,"up_axis")[0])}}parseAssetUnit(e){return e!==void 0&&e.hasAttribute("meter")===!0?parseFloat(e.getAttribute("meter")):1}parseAssetUpAxis(e){return e!==void 0?e.textContent:"Y_UP"}parseLibrary(e,t,i,n){const r=Qt(e,t)[0];if(r!==void 0){const o=Qt(r,i);for(let a=0;a<o.length;a++)n(o[a])}}parseAnimation(e){const t={sources:{},samplers:{},channels:{}};let i=!1;for(let n=0,r=e.childNodes.length;n<r;n++){const o=e.childNodes[n];if(o.nodeType!==1)continue;let a;switch(o.nodeName){case"source":a=o.getAttribute("id"),t.sources[a]=this.parseSource(o);break;case"sampler":a=o.getAttribute("id"),t.samplers[a]=this.parseAnimationSampler(o);break;case"channel":a=o.getAttribute("target"),t.channels[a]=this.parseAnimationChannel(o);break;case"animation":this.parseAnimation(o),i=!0;break}}i===!1&&(this.library.animations[e.getAttribute("id")||yi.generateUUID()]=t)}parseAnimationSampler(e){const t={inputs:{}};for(let i=0,n=e.childNodes.length;i<n;i++){const r=e.childNodes[i];if(r.nodeType===1)switch(r.nodeName){case"input":const o=Lt(r.getAttribute("source")),a=r.getAttribute("semantic");t.inputs[a]=o;break}}return t}parseAnimationChannel(e){const t={};let n=e.getAttribute("target").split("/");const r=n.shift();let o=n.shift();const a=o.indexOf("(")!==-1,c=o.indexOf(".")!==-1;if(c)n=o.split("."),o=n.shift(),t.member=n.shift();else if(a){const l=o.split("(");o=l.shift();for(let h=0;h<l.length;h++)l[h]=parseInt(l[h].replace(/\)/,""));t.indices=l}return t.id=r,t.sid=o,t.arraySyntax=a,t.memberSyntax=c,t.sampler=Lt(e.getAttribute("source")),t}parseAnimationClip(e){const t={name:e.getAttribute("id")||"default",start:parseFloat(e.getAttribute("start")||0),end:parseFloat(e.getAttribute("end")||0),animations:[]};for(let i=0,n=e.childNodes.length;i<n;i++){const r=e.childNodes[i];if(r.nodeType===1)switch(r.nodeName){case"instance_animation":t.animations.push(Lt(r.getAttribute("url")));break}}this.library.clips[e.getAttribute("id")]=t}parseController(e){const t={};for(let i=0,n=e.childNodes.length;i<n;i++){const r=e.childNodes[i];if(r.nodeType===1)switch(r.nodeName){case"skin":t.id=Lt(r.getAttribute("source")),t.skin=this.parseSkin(r);break;case"morph":t.id=Lt(r.getAttribute("source")),console.warn("THREE.ColladaLoader: Morph target animation not supported yet.");break}}this.library.controllers[e.getAttribute("id")]=t}parseSkin(e){const t={sources:{}};for(let i=0,n=e.childNodes.length;i<n;i++){const r=e.childNodes[i];if(r.nodeType===1)switch(r.nodeName){case"bind_shape_matrix":t.bindShapeMatrix=Xt(r.textContent);break;case"source":const o=r.getAttribute("id");t.sources[o]=this.parseSource(r);break;case"joints":t.joints=this.parseJoints(r);break;case"vertex_weights":t.vertexWeights=this.parseVertexWeights(r);break}}return t}parseJoints(e){const t={inputs:{}};for(let i=0,n=e.childNodes.length;i<n;i++){const r=e.childNodes[i];if(r.nodeType===1)switch(r.nodeName){case"input":const o=r.getAttribute("semantic"),a=Lt(r.getAttribute("source"));t.inputs[o]=a;break}}return t}parseVertexWeights(e){const t={inputs:{}};for(let i=0,n=e.childNodes.length;i<n;i++){const r=e.childNodes[i];if(r.nodeType===1)switch(r.nodeName){case"input":const o=r.getAttribute("semantic"),a=Lt(r.getAttribute("source")),c=parseInt(r.getAttribute("offset"));t.inputs[o]={id:a,offset:c};break;case"vcount":t.vcount=Lr(r.textContent);break;case"v":t.v=Lr(r.textContent);break}}return t}parseImage(e){const t={init_from:Qt(e,"init_from")[0].textContent};this.library.images[e.getAttribute("id")]=t}parseEffect(e){const t={};for(let i=0,n=e.childNodes.length;i<n;i++){const r=e.childNodes[i];if(r.nodeType===1)switch(r.nodeName){case"profile_COMMON":t.profile=this.parseEffectProfileCOMMON(r);break}}this.library.effects[e.getAttribute("id")]=t}parseEffectProfileCOMMON(e){const t={surfaces:{},samplers:{}};for(let i=0,n=e.childNodes.length;i<n;i++){const r=e.childNodes[i];if(r.nodeType===1)switch(r.nodeName){case"newparam":this.parseEffectNewparam(r,t);break;case"technique":t.technique=this.parseEffectTechnique(r);break;case"extra":t.extra=this.parseEffectExtra(r);break}}return t}parseEffectNewparam(e,t){const i=e.getAttribute("sid");for(let n=0,r=e.childNodes.length;n<r;n++){const o=e.childNodes[n];if(o.nodeType===1)switch(o.nodeName){case"surface":t.surfaces[i]=this.parseEffectSurface(o);break;case"sampler2D":t.samplers[i]=this.parseEffectSampler(o);break}}}parseEffectSurface(e){const t={};for(let i=0,n=e.childNodes.length;i<n;i++){const r=e.childNodes[i];if(r.nodeType===1)switch(r.nodeName){case"init_from":t.init_from=r.textContent;break}}return t}parseEffectSampler(e){const t={};for(let i=0,n=e.childNodes.length;i<n;i++){const r=e.childNodes[i];if(r.nodeType===1)switch(r.nodeName){case"source":t.source=r.textContent;break}}return t}parseEffectTechnique(e){const t={};for(let i=0,n=e.childNodes.length;i<n;i++){const r=e.childNodes[i];if(r.nodeType===1)switch(r.nodeName){case"constant":case"lambert":case"blinn":case"phong":t.type=r.nodeName,t.parameters=this.parseEffectParameters(r);break;case"extra":t.extra=this.parseEffectExtra(r);break}}return t}parseEffectParameters(e){const t={};for(let i=0,n=e.childNodes.length;i<n;i++){const r=e.childNodes[i];if(r.nodeType===1)switch(r.nodeName){case"emission":case"diffuse":case"specular":case"bump":case"ambient":case"shininess":case"transparency":t[r.nodeName]=this.parseEffectParameter(r);break;case"transparent":t[r.nodeName]={opaque:r.hasAttribute("opaque")?r.getAttribute("opaque"):"A_ONE",data:this.parseEffectParameter(r)};break}}return t}parseEffectParameter(e){const t={};for(let i=0,n=e.childNodes.length;i<n;i++){const r=e.childNodes[i];if(r.nodeType===1)switch(r.nodeName){case"color":t[r.nodeName]=Xt(r.textContent);break;case"float":t[r.nodeName]=parseFloat(r.textContent);break;case"texture":t[r.nodeName]={id:r.getAttribute("texture"),extra:this.parseEffectParameterTexture(r)};break}}return t}parseEffectParameterTexture(e){const t={technique:{}};for(let i=0,n=e.childNodes.length;i<n;i++){const r=e.childNodes[i];if(r.nodeType===1)switch(r.nodeName){case"extra":this.parseEffectParameterTextureExtra(r,t);break}}return t}parseEffectParameterTextureExtra(e,t){for(let i=0,n=e.childNodes.length;i<n;i++){const r=e.childNodes[i];if(r.nodeType===1)switch(r.nodeName){case"technique":this.parseEffectParameterTextureExtraTechnique(r,t);break}}}parseEffectParameterTextureExtraTechnique(e,t){for(let i=0,n=e.childNodes.length;i<n;i++){const r=e.childNodes[i];if(r.nodeType===1)switch(r.nodeName){case"repeatU":case"repeatV":case"offsetU":case"offsetV":t.technique[r.nodeName]=parseFloat(r.textContent);break;case"wrapU":case"wrapV":r.textContent.toUpperCase()==="TRUE"?t.technique[r.nodeName]=1:r.textContent.toUpperCase()==="FALSE"?t.technique[r.nodeName]=0:t.technique[r.nodeName]=parseInt(r.textContent);break;case"bump":t[r.nodeName]=this.parseEffectExtraTechniqueBump(r);break}}}parseEffectExtra(e){const t={};for(let i=0,n=e.childNodes.length;i<n;i++){const r=e.childNodes[i];if(r.nodeType===1)switch(r.nodeName){case"technique":t.technique=this.parseEffectExtraTechnique(r);break}}return t}parseEffectExtraTechnique(e){const t={};for(let i=0,n=e.childNodes.length;i<n;i++){const r=e.childNodes[i];if(r.nodeType===1)switch(r.nodeName){case"double_sided":t[r.nodeName]=parseInt(r.textContent);break;case"bump":t[r.nodeName]=this.parseEffectExtraTechniqueBump(r);break}}return t}parseEffectExtraTechniqueBump(e){const t={};for(let i=0,n=e.childNodes.length;i<n;i++){const r=e.childNodes[i];if(r.nodeType===1)switch(r.nodeName){case"texture":t[r.nodeName]={id:r.getAttribute("texture"),texcoord:r.getAttribute("texcoord"),extra:this.parseEffectParameterTexture(r)};break}}return t}parseMaterial(e){const t={name:e.getAttribute("name")};for(let i=0,n=e.childNodes.length;i<n;i++){const r=e.childNodes[i];if(r.nodeType===1)switch(r.nodeName){case"instance_effect":t.url=Lt(r.getAttribute("url"));break}}this.library.materials[e.getAttribute("id")]=t}parseCamera(e){const t={name:e.getAttribute("name")};for(let i=0,n=e.childNodes.length;i<n;i++){const r=e.childNodes[i];if(r.nodeType===1)switch(r.nodeName){case"optics":t.optics=this.parseCameraOptics(r);break}}this.library.cameras[e.getAttribute("id")]=t}parseCameraOptics(e){for(let t=0;t<e.childNodes.length;t++){const i=e.childNodes[t];switch(i.nodeName){case"technique_common":return this.parseCameraTechnique(i)}}return{}}parseCameraTechnique(e){const t={};for(let i=0;i<e.childNodes.length;i++){const n=e.childNodes[i];switch(n.nodeName){case"perspective":case"orthographic":t.technique=n.nodeName,t.parameters=this.parseCameraParameters(n);break}}return t}parseCameraParameters(e){const t={};for(let i=0;i<e.childNodes.length;i++){const n=e.childNodes[i];switch(n.nodeName){case"xfov":case"yfov":case"xmag":case"ymag":case"znear":case"zfar":case"aspect_ratio":t[n.nodeName]=parseFloat(n.textContent);break}}return t}parseLight(e){let t={};for(let i=0,n=e.childNodes.length;i<n;i++){const r=e.childNodes[i];if(r.nodeType===1)switch(r.nodeName){case"technique_common":t=this.parseLightTechnique(r);break}}this.library.lights[e.getAttribute("id")]=t}parseLightTechnique(e){const t={};for(let i=0,n=e.childNodes.length;i<n;i++){const r=e.childNodes[i];if(r.nodeType===1)switch(r.nodeName){case"directional":case"point":case"spot":case"ambient":t.technique=r.nodeName,t.parameters=this.parseLightParameters(r);break}}return t}parseLightParameters(e){const t={};for(let i=0,n=e.childNodes.length;i<n;i++){const r=e.childNodes[i];if(r.nodeType===1)switch(r.nodeName){case"color":const o=Xt(r.textContent);t.color=new Be().fromArray(o),Xe.colorSpaceToWorking(t.color,ht);break;case"falloff_angle":t.falloffAngle=parseFloat(r.textContent);break;case"quadratic_attenuation":const a=parseFloat(r.textContent);t.distance=a?Math.sqrt(1/a):0;break}}return t}parseGeometry(e){const t={name:e.getAttribute("name"),sources:{},vertices:{},primitives:[]},i=Qt(e,"mesh")[0];if(i!==void 0){for(let n=0;n<i.childNodes.length;n++){const r=i.childNodes[n];if(r.nodeType!==1)continue;const o=r.getAttribute("id");switch(r.nodeName){case"source":t.sources[o]=this.parseSource(r);break;case"vertices":t.vertices=this.parseGeometryVertices(r);break;case"polygons":case"lines":case"linestrips":case"polylist":case"triangles":t.primitives.push(this.parseGeometryPrimitive(r));break}}this.library.geometries[e.getAttribute("id")]=t}}parseSource(e){const t={array:[],stride:3};for(let i=0;i<e.childNodes.length;i++){const n=e.childNodes[i];if(n.nodeType===1)switch(n.nodeName){case"float_array":t.array=Xt(n.textContent);break;case"Name_array":t.array=tv(n.textContent);break;case"technique_common":const r=Qt(n,"accessor")[0];r!==void 0&&(t.stride=parseInt(r.getAttribute("stride")));break}}return t}parseGeometryVertices(e){const t={};for(let i=0;i<e.childNodes.length;i++){const n=e.childNodes[i];n.nodeType===1&&(t[n.getAttribute("semantic")]=Lt(n.getAttribute("source")))}return t}parseGeometryPrimitive(e){const t={type:e.nodeName,material:e.getAttribute("material"),count:parseInt(e.getAttribute("count")),inputs:{},stride:0,hasUV:!1};for(let i=0,n=e.childNodes.length;i<n;i++){const r=e.childNodes[i];if(r.nodeType===1)switch(r.nodeName){case"input":const o=Lt(r.getAttribute("source")),a=r.getAttribute("semantic"),c=parseInt(r.getAttribute("offset")),l=parseInt(r.getAttribute("set")),h=l>0?a+l:a;t.inputs[h]={id:o,offset:c},t.stride=Math.max(t.stride,c+1),a==="TEXCOORD"&&(t.hasUV=!0);break;case"vcount":t.vcount=Lr(r.textContent);break;case"p":t.p=Lr(r.textContent);break}}return t.type==="polygons"&&(t.vcount=[t.p.length/t.stride]),t}parseLibraryJoint(e){this.library.joints[e.getAttribute("id")]=this.parseKinematicsJoint(e)}parseKinematicsModel(e){const t={name:e.getAttribute("name")||"",joints:{},links:[]};for(let i=0;i<e.childNodes.length;i++){const n=e.childNodes[i];if(n.nodeType===1)switch(n.nodeName){case"technique_common":this.parseKinematicsTechniqueCommon(n,t);break}}this.library.kinematicsModels[e.getAttribute("id")]=t}parseKinematicsTechniqueCommon(e,t){for(let i=0;i<e.childNodes.length;i++){const n=e.childNodes[i];if(n.nodeType===1)switch(n.nodeName){case"joint":t.joints[n.getAttribute("sid")]=this.parseKinematicsJoint(n);break;case"instance_joint":t.joints[n.getAttribute("sid")]=this.library.joints[Lt(n.getAttribute("url"))];break;case"link":t.links.push(this.parseKinematicsLink(n));break}}}parseKinematicsJoint(e){let t;for(let i=0;i<e.childNodes.length;i++){const n=e.childNodes[i];if(n.nodeType===1)switch(n.nodeName){case"prismatic":case"revolute":t=this.parseKinematicsJointParameter(n);break}}return t}parseKinematicsJointParameter(e){const t={sid:e.getAttribute("sid"),name:e.getAttribute("name")||"",axis:new D,limits:{min:0,max:0},type:e.nodeName,static:!1,zeroPosition:0,middlePosition:0};for(let i=0;i<e.childNodes.length;i++){const n=e.childNodes[i];if(n.nodeType===1)switch(n.nodeName){case"axis":const r=Xt(n.textContent);t.axis.fromArray(r);break;case"limits":const o=n.getElementsByTagName("max")[0],a=n.getElementsByTagName("min")[0];t.limits.max=parseFloat(o.textContent),t.limits.min=parseFloat(a.textContent);break}}return t.limits.min>=t.limits.max&&(t.static=!0),t.middlePosition=(t.limits.min+t.limits.max)/2,t}parseKinematicsLink(e){const t={sid:e.getAttribute("sid"),name:e.getAttribute("name")||"",attachments:[],transforms:[]};for(let i=0;i<e.childNodes.length;i++){const n=e.childNodes[i];if(n.nodeType===1)switch(n.nodeName){case"attachment_full":t.attachments.push(this.parseKinematicsAttachment(n));break;case"matrix":case"translate":case"rotate":t.transforms.push(this.parseKinematicsTransform(n));break}}return t}parseKinematicsAttachment(e){const t={joint:e.getAttribute("joint").split("/").pop(),transforms:[],links:[]};for(let i=0;i<e.childNodes.length;i++){const n=e.childNodes[i];if(n.nodeType===1)switch(n.nodeName){case"link":t.links.push(this.parseKinematicsLink(n));break;case"matrix":case"translate":case"rotate":t.transforms.push(this.parseKinematicsTransform(n));break}}return t}parseKinematicsTransform(e){const t={type:e.nodeName},i=Xt(e.textContent);switch(t.type){case"matrix":t.obj=new Oe,t.obj.fromArray(i).transpose();break;case"translate":t.obj=new D,t.obj.fromArray(i);break;case"rotate":t.obj=new D,t.obj.fromArray(i),t.angle=yi.degToRad(i[3]);break}return t}parsePhysicsModel(e){const t={name:e.getAttribute("name")||"",rigidBodies:{}};for(let i=0;i<e.childNodes.length;i++){const n=e.childNodes[i];if(n.nodeType===1)switch(n.nodeName){case"rigid_body":t.rigidBodies[n.getAttribute("name")]={},this.parsePhysicsRigidBody(n,t.rigidBodies[n.getAttribute("name")]);break}}this.library.physicsModels[e.getAttribute("id")]=t}parsePhysicsRigidBody(e,t){for(let i=0;i<e.childNodes.length;i++){const n=e.childNodes[i];if(n.nodeType===1)switch(n.nodeName){case"technique_common":this.parsePhysicsTechniqueCommon(n,t);break}}}parsePhysicsTechniqueCommon(e,t){for(let i=0;i<e.childNodes.length;i++){const n=e.childNodes[i];if(n.nodeType===1)switch(n.nodeName){case"inertia":t.inertia=Xt(n.textContent);break;case"mass":t.mass=Xt(n.textContent)[0];break}}}parseKinematicsScene(e){const t={bindJointAxis:[]};for(let i=0;i<e.childNodes.length;i++){const n=e.childNodes[i];if(n.nodeType===1)switch(n.nodeName){case"bind_joint_axis":t.bindJointAxis.push(this.parseKinematicsBindJointAxis(n));break}}this.library.kinematicsScenes[Lt(e.getAttribute("url"))]=t}parseKinematicsBindJointAxis(e){const t={target:e.getAttribute("target").split("/").pop()};for(let i=0;i<e.childNodes.length;i++){const n=e.childNodes[i];if(n.nodeType===1)switch(n.nodeName){case"axis":const r=n.getElementsByTagName("param")[0];t.axis=r.textContent;const o=t.axis.split("inst_").pop().split("axis")[0];t.jointIndex=o.substring(0,o.length-1);break}}return t}prepareNodes(e){const t=e.getElementsByTagName("node");for(let i=0;i<t.length;i++){const n=t[i];n.hasAttribute("id")===!1&&n.setAttribute("id",this.generateId())}}parseNode(e){const t=new Oe,i=new D,n={name:e.getAttribute("name")||"",type:e.getAttribute("type"),id:e.getAttribute("id"),sid:e.getAttribute("sid"),matrix:new Oe,nodes:[],instanceCameras:[],instanceControllers:[],instanceLights:[],instanceGeometries:[],instanceNodes:[],transforms:{},transformData:{},transformOrder:[]};for(let r=0;r<e.childNodes.length;r++){const o=e.childNodes[r];if(o.nodeType!==1)continue;let a;switch(o.nodeName){case"node":n.nodes.push(o.getAttribute("id")),this.parseNode(o);break;case"instance_camera":n.instanceCameras.push(Lt(o.getAttribute("url")));break;case"instance_controller":n.instanceControllers.push(this.parseNodeInstance(o));break;case"instance_light":n.instanceLights.push(Lt(o.getAttribute("url")));break;case"instance_geometry":n.instanceGeometries.push(this.parseNodeInstance(o));break;case"instance_node":n.instanceNodes.push(Lt(o.getAttribute("url")));break;case"matrix":a=Xt(o.textContent),n.matrix.multiply(t.fromArray(a).transpose());{const c=o.getAttribute("sid");n.transforms[c]=o.nodeName,n.transformData[c]={type:"matrix",array:a},n.transformOrder.push(c)}break;case"translate":a=Xt(o.textContent),i.fromArray(a),n.matrix.multiply(t.makeTranslation(i.x,i.y,i.z));{const c=o.getAttribute("sid");n.transforms[c]=o.nodeName,n.transformData[c]={type:"translate",x:a[0],y:a[1],z:a[2]},n.transformOrder.push(c)}break;case"rotate":a=Xt(o.textContent);{const c=yi.degToRad(a[3]);n.matrix.multiply(t.makeRotationAxis(i.fromArray(a),c));const l=o.getAttribute("sid");n.transforms[l]=o.nodeName,n.transformData[l]={type:"rotate",axis:[a[0],a[1],a[2]],angle:a[3]},n.transformOrder.push(l)}break;case"scale":a=Xt(o.textContent),n.matrix.scale(i.fromArray(a));{const c=o.getAttribute("sid");n.transforms[c]=o.nodeName,n.transformData[c]={type:"scale",x:a[0],y:a[1],z:a[2]},n.transformOrder.push(c)}break}}return this.hasNode(n.id)?console.warn("THREE.ColladaLoader: There is already a node with ID %s. Exclude current node from further processing.",n.id):this.library.nodes[n.id]=n,n}parseNodeInstance(e){const t={id:Lt(e.getAttribute("url")),materials:{},skeletons:[]};for(let i=0;i<e.childNodes.length;i++){const n=e.childNodes[i];switch(n.nodeName){case"bind_material":const r=n.getElementsByTagName("instance_material");for(let o=0;o<r.length;o++){const a=r[o],c=a.getAttribute("symbol"),l=a.getAttribute("target");t.materials[c]=Lt(l)}break;case"skeleton":t.skeletons.push(Lt(n.textContent));break}}return t}parseVisualScene(e){const t={name:e.getAttribute("name"),children:[]};this.prepareNodes(e);const i=Qt(e,"node");for(let n=0;n<i.length;n++)t.children.push(this.parseNode(i[n]));this.library.visualScenes[e.getAttribute("id")]=t}hasNode(e){return this.library.nodes[e]!==void 0}}class nv{constructor(e,t,i,n){this.library=e,this.collada=t,this.textureLoader=i,this.tgaLoader=n,this.tempColor=new Be,this.animations=[],this.kinematics={},this.position=new D,this.scale=new D,this.quaternion=new Nt,this.matrix=new Oe,this.deferredPivotAnimations={},this.transformNodes={}}compose(){const e=this.library;this.buildLibrary(e.animations,this.buildAnimation.bind(this)),this.buildLibrary(e.clips,this.buildAnimationClip.bind(this)),this.buildLibrary(e.controllers,this.buildController.bind(this)),this.buildLibrary(e.images,this.buildImage.bind(this)),this.buildLibrary(e.effects,this.buildEffect.bind(this)),this.buildLibrary(e.materials,this.buildMaterial.bind(this)),this.buildLibrary(e.cameras,this.buildCamera.bind(this)),this.buildLibrary(e.lights,this.buildLight.bind(this)),this.buildLibrary(e.geometries,this.buildGeometry.bind(this)),this.buildLibrary(e.visualScenes,this.buildVisualScene.bind(this)),this.setupAnimations(),this.setupKinematics();const t=this.parseScene(Qt(this.collada,"scene")[0]);return t.animations=this.animations,{scene:t,animations:this.animations,kinematics:this.kinematics}}buildLibrary(e,t){for(const i in e){const n=e[i];n.build=t(e[i])}}getBuild(e,t){return e.build!==void 0||(e.build=t(e)),e.build}isEmpty(e){return Object.keys(e).length===0}buildAnimation(e){const t=[],i=e.channels,n=e.samplers,r=e.sources,o=this.aggregateAnimationChannels(i,n,r);for(const a in o){const c=this.library.nodes[a];if(!c)continue;const l=o[a];if(this.hasPivotTransforms(c))this.collectDeferredPivotAnimation(a,l);else{const h=this.getNode(a);let d=!1;for(const u in l){const f=c.transforms[u],g=c.transformData[u],v=l[u];switch(f){case"matrix":this.buildMatrixTracks(h,v,c,t);break;case"translate":this.buildTranslateTrack(h,v,g,t);break;case"rotate":d||(this.buildRotateTrack(h,u,v,g,c,t),d=!0);break;case"scale":this.buildScaleTrack(h,v,g,t);break}}}}return t}collectDeferredPivotAnimation(e,t){this.deferredPivotAnimations[e]||(this.deferredPivotAnimations[e]={});const i=this.deferredPivotAnimations[e];for(const n in t){i[n]||(i[n]={});for(const r in t[n])i[n][r]=t[n][r]}}hasPivotTransforms(e){const t=["rotatePivot","rotatePivotInverse","rotatePivotTranslation","scalePivot","scalePivotInverse","scalePivotTranslation"];for(const i of t)if(e.transforms[i]!==void 0)return!0;return!1}getAnimation(e){return this.getBuild(this.library.animations[e],this.buildAnimation.bind(this))}aggregateAnimationChannels(e,t,i){const n={};for(const r in e){if(!e.hasOwnProperty(r))continue;const o=e[r],a=t[o.sampler],c=a.inputs.INPUT,l=a.inputs.OUTPUT,h=i[c],d=i[l],u=a.inputs.INTERPOLATION,f=a.inputs.IN_TANGENT,g=a.inputs.OUT_TANGENT,v=u?i[u]:null,m=f?i[f]:null,p=g?i[g]:null,T=o.id,M=o.sid,x=o.member||"default";n[T]||(n[T]={}),n[T][M]||(n[T][M]={}),n[T][M][x]={times:h.array,values:d.array,stride:d.stride,arraySyntax:o.arraySyntax,indices:o.indices,interpolation:v?v.array:null,inTangent:m?m.array:null,outTangent:p?p.array:null,inTangentStride:m?m.stride:0,outTangentStride:p?p.stride:0}}return n}buildMatrixTracks(e,t,i,n){const r=i.matrix.clone().transpose(),o={};for(const l in t){const h=t[l],d=h.times,u=h.values,f=h.stride;for(let g=0,v=d.length;g<v;g++){const m=d[g],p=g*f;if(o[m]===void 0&&(o[m]={}),h.arraySyntax===!0){const T=u[p],M=h.indices[0]+4*h.indices[1];o[m][M]=T}else for(let T=0;T<f;T++)o[m][T]=u[p+T]}}const a=this.prepareAnimationData(o,r),c={name:e.uuid,keyframes:a};this.createKeyframeTracks(c,n)}buildTranslateTrack(e,t,i,n){if(t.default&&t.default.stride===3){const l=t.default,h=Array.from(l.times),d=Array.from(l.values),u=new ri(e.uuid+".position",h,d),f=this.getInterpolationInfo(t);this.applyInterpolation(u,f,t),n.push(u);return}const r=this.getTimesForAllAxes(t);if(r.length===0)return;const o=[],a=this.getInterpolationInfo(t);for(let l=0;l<r.length;l++){const h=r[l],d=this.getValueAtTime(t.X,h,i.x),u=this.getValueAtTime(t.Y,h,i.y),f=this.getValueAtTime(t.Z,h,i.z);o.push(d,u,f)}const c=new ri(e.uuid+".position",r,o);this.applyInterpolation(c,a),n.push(c)}buildRotateTrack(e,t,i,n,r,o){const a=i.ANGLE||i.default;if(!a)return;const c=Array.from(a.times);if(c.length===0)return;const l=[];for(const m of r.transformOrder)if(r.transforms[m]==="rotate"){const T=r.transformData[m];l.push({sid:m,axis:new D(T.axis[0],T.axis[1],T.axis[2]),defaultAngle:T.angle})}const h=new Nt,d=new Nt,u=new Nt,f=[],g=this.getInterpolationInfo(i);for(let m=0;m<c.length;m++){const p=c[m];h.identity();for(const T of l){let M;T.sid===t?M=this.getValueAtTime(a,p,T.defaultAngle):M=T.defaultAngle;const x=yi.degToRad(M);u.setFromAxisAngle(T.axis,x),h.multiply(u)}m>0&&d.dot(h)<0&&(h.x=-h.x,h.y=-h.y,h.z=-h.z,h.w=-h.w),d.copy(h),f.push(h.x,h.y,h.z,h.w)}const v=new ns(e.uuid+".quaternion",c,f);this.applyInterpolation(v,g),o.push(v)}buildScaleTrack(e,t,i,n){if(t.default&&t.default.stride===3){const l=t.default,h=Array.from(l.times),d=Array.from(l.values),u=new ri(e.uuid+".scale",h,d),f=this.getInterpolationInfo(t);this.applyInterpolation(u,f,t),n.push(u);return}const r=this.getTimesForAllAxes(t);if(r.length===0)return;const o=[],a=this.getInterpolationInfo(t);for(let l=0;l<r.length;l++){const h=r[l],d=this.getValueAtTime(t.X,h,i.x),u=this.getValueAtTime(t.Y,h,i.y),f=this.getValueAtTime(t.Z,h,i.z);o.push(d,u,f)}const c=new ri(e.uuid+".scale",r,o);this.applyInterpolation(c,a),n.push(c)}getTimesForAllAxes(e){let t=[];return e.X&&(t=t.concat(Array.from(e.X.times))),e.Y&&(t=t.concat(Array.from(e.Y.times))),e.Z&&(t=t.concat(Array.from(e.Z.times))),e.ANGLE&&(t=t.concat(Array.from(e.ANGLE.times))),e.default&&(t=t.concat(Array.from(e.default.times))),t=[...new Set(t)].sort((i,n)=>i-n),t}getValueAtTime(e,t,i){if(!e)return i;const n=e.times,r=e.values,o=e.interpolation;for(let a=0;a<n.length;a++){if(n[a]===t)return r[a];if(n[a]>t){if(a===0)return r[0];const c=a-1,l=a,h=n[c],d=n[l],u=r[c],f=r[l],g=o?o[c]:"LINEAR";if(g==="STEP")return u;if(g==="BEZIER"&&e.inTangent&&e.outTangent)return this.evaluateBezierComponent(e,c,l,h,d,t);{const v=(t-h)/(d-h);return u+v*(f-u)}}}return r[r.length-1]}evaluateBezierComponent(e,t,i,n,r,o){const a=e.values,c=e.inTangent,l=e.outTangent,h=e.inTangentStride||1,d=a[t],u=a[i];let f,g,v,m;h===2?(f=l[t*2],g=l[t*2+1],v=c[i*2],m=c[i*2+1]):(f=n+(r-n)/3,g=l[t],v=r-(r-n)/3,m=c[i]);let p=(o-n)/(r-n);for(let A=0;A<8;A++){const _=p*p,E=_*p,R=1-p,C=R*R,k=C*R*n+3*C*p*f+3*R*_*v+E*r,q=3*C*(f-n)+6*R*p*(v-f)+3*_*(r-v);if(Math.abs(q)<1e-10)break;const U=k-o;if(Math.abs(U)<1e-10)break;p=p-U/q,p=Math.max(0,Math.min(1,p))}const T=p*p,M=T*p,x=1-p,b=x*x;return b*x*d+3*b*p*g+3*x*T*m+M*u}getInterpolationInfo(e){const t=["X","Y","Z","ANGLE","default"];let i=null,n=!0;for(const r of t){const o=e[r];if(!o||!o.interpolation)continue;const a=o.interpolation;for(let c=0;c<a.length;c++){const l=a[c];i===null?i=l:l!==i&&(n=!1)}}return{type:i||"LINEAR",uniform:n}}applyInterpolation(e,t,i=null){if(t.type==="STEP"&&t.uniform)e.setInterpolation(Vs);else if(t.type==="BEZIER"&&t.uniform&&i){const n=i.default;n&&n.inTangent&&n.outTangent&&(e.setInterpolation(hl),e.settings={inTangents:new Float32Array(n.inTangent),outTangents:new Float32Array(n.outTangent)})}}prepareAnimationData(e,t){const i=[];for(const n in e)i.push({time:parseFloat(n),value:e[n]});i.sort((n,r)=>n.time-r.time);for(let n=0;n<16;n++)this.transformAnimationData(i,n,t.elements[n]);return i}createKeyframeTracks(e,t){const i=e.keyframes,n=e.name,r=[],o=[],a=[],c=[],l=this.position,h=this.quaternion,d=this.scale,u=this.matrix;for(let f=0,g=i.length;f<g;f++){const v=i[f],m=v.time,p=v.value;u.fromArray(p).transpose(),u.decompose(l,h,d),r.push(m),o.push(l.x,l.y,l.z),a.push(h.x,h.y,h.z,h.w),c.push(d.x,d.y,d.z)}return o.length>0&&t.push(new ri(n+".position",r,o)),a.length>0&&t.push(new ns(n+".quaternion",r,a)),c.length>0&&t.push(new ri(n+".scale",r,c)),t}transformAnimationData(e,t,i){let n,r=!0,o,a;for(o=0,a=e.length;o<a;o++)n=e[o],n.value[t]===void 0?n.value[t]=null:r=!1;if(r===!0)for(o=0,a=e.length;o<a;o++)n=e[o],n.value[t]=i;else this.createMissingKeyframes(e,t)}createMissingKeyframes(e,t){let i,n;for(let r=0,o=e.length;r<o;r++){const a=e[r];if(a.value[t]===null){if(i=this.getPrev(e,r,t),n=this.getNext(e,r,t),i===null){a.value[t]=n.value[t];continue}if(n===null){a.value[t]=i.value[t];continue}this.interpolate(a,i,n,t)}}}getPrev(e,t,i){for(;t>=0;){const n=e[t];if(n.value[i]!==null)return n;t--}return null}getNext(e,t,i){for(;t<e.length;){const n=e[t];if(n.value[i]!==null)return n;t++}return null}interpolate(e,t,i,n){if(i.time-t.time===0){e.value[n]=t.value[n];return}e.value[n]=(e.time-t.time)*(i.value[n]-t.value[n])/(i.time-t.time)+t.value[n]}buildAnimationClip(e){const t=[],i=e.name,n=e.end-e.start||-1,r=e.animations;for(let o=0,a=r.length;o<a;o++){const c=this.getAnimation(r[o]);for(let l=0,h=c.length;l<h;l++)t.push(c[l])}return new Yc(i,n,t)}getAnimationClip(e){return this.getBuild(this.library.clips[e],this.buildAnimationClip.bind(this))}buildController(e){const t={id:e.id},i=this.library.geometries[t.id];return e.skin!==void 0&&(t.skin=this.buildSkin(e.skin),i.sources.skinIndices=t.skin.indices,i.sources.skinWeights=t.skin.weights),t}buildSkin(e){const i={joints:[],indices:{array:[],stride:4},weights:{array:[],stride:4}},n=e.sources,r=e.vertexWeights,o=r.vcount,a=r.v,c=r.inputs.JOINT.offset,l=r.inputs.WEIGHT.offset,h=e.sources[e.joints.inputs.JOINT],d=e.sources[e.joints.inputs.INV_BIND_MATRIX],u=n[r.inputs.WEIGHT.id].array;let f=0,g,v,m;for(g=0,m=o.length;g<m;g++){const T=o[g],M=[];for(v=0;v<T;v++){const x=a[f+c],b=a[f+l],S=u[b];M.push({index:x,weight:S}),f+=2}for(M.sort(p),v=0;v<4;v++){const x=M[v];x!==void 0?(i.indices.array.push(x.index),i.weights.array.push(x.weight)):(i.indices.array.push(0),i.weights.array.push(0))}}for(e.bindShapeMatrix?i.bindMatrix=new Oe().fromArray(e.bindShapeMatrix).transpose():i.bindMatrix=new Oe().identity(),g=0,m=h.array.length;g<m;g++){const T=h.array[g],M=new Oe().fromArray(d.array,g*d.stride).transpose();i.joints.push({name:T,boneInverse:M})}return i;function p(T,M){return M.weight-T.weight}}getController(e){return this.getBuild(this.library.controllers[e],this.buildController.bind(this))}buildImage(e){return e.build!==void 0?e.build:e.init_from}getImage(e){const t=this.library.images[e];return t!==void 0?this.getBuild(t,this.buildImage.bind(this)):(console.warn("THREE.ColladaLoader: Couldn't find image with ID:",e),null)}buildEffect(e){return e}getEffect(e){return this.getBuild(this.library.effects[e],this.buildEffect.bind(this))}getTextureLoader(e){let t,i=e.slice((e.lastIndexOf(".")-1>>>0)+2);switch(i=i.toLowerCase(),i){case"tga":t=this.tgaLoader;break;default:t=this.textureLoader}return t}buildMaterial(e){const t=this.getEffect(e.url),i=t.profile.technique;let n;switch(i.type){case"phong":case"blinn":n=new ks;break;case"lambert":n=new yp;break;default:n=new ls;break}n.name=e.name||"";const r=this;function o(h,d=null){const u=t.profile.samplers[h.id];let f=null;if(u!==void 0){const g=t.profile.surfaces[u.source];f=r.getImage(g.init_from)}else console.warn("THREE.ColladaLoader: Undefined sampler. Access image directly (see #12530)."),f=r.getImage(h.id);if(f!==null){const g=r.getTextureLoader(f);if(g!==void 0){const v=g.load(f),m=h.extra;if(m!==void 0&&m.technique!==void 0&&r.isEmpty(m.technique)===!1){const p=m.technique;v.wrapS=p.wrapU?Mn:ti,v.wrapT=p.wrapV?Mn:ti,v.offset.set(p.offsetU||0,p.offsetV||0),v.repeat.set(p.repeatU||1,p.repeatV||1)}else v.wrapS=Mn,v.wrapT=Mn;return d!==null&&(v.colorSpace=d),v}else return console.warn("THREE.ColladaLoader: Loader for texture %s not found.",f),null}else return console.warn("THREE.ColladaLoader: Couldn't create texture with ID:",h.id),null}const a=i.parameters;for(const h in a){const d=a[h];switch(h){case"diffuse":d.color&&n.color.fromArray(d.color),d.texture&&(n.map=o(d.texture,ht));break;case"specular":d.color&&n.specular&&n.specular.fromArray(d.color),d.texture&&(n.specularMap=o(d.texture));break;case"bump":d.texture&&(n.normalMap=o(d.texture));break;case"ambient":d.texture&&(n.lightMap=o(d.texture,ht));break;case"shininess":d.float&&n.shininess&&(n.shininess=d.float);break;case"emission":d.color&&n.emissive&&n.emissive.fromArray(d.color),d.texture&&(n.emissiveMap=o(d.texture,ht));break}}Xe.colorSpaceToWorking(n.color,ht),n.specular&&Xe.colorSpaceToWorking(n.specular,ht),n.emissive&&Xe.colorSpaceToWorking(n.emissive,ht);let c=a.transparent,l=a.transparency;if(l===void 0&&c&&(l={float:1}),c===void 0&&l&&(c={opaque:"A_ONE",data:{color:[1,1,1,1]}}),c&&l)if(c.data.texture)n.transparent=!0;else{const h=c.data.color;switch(c.opaque){case"A_ONE":n.opacity=h[3]*l.float;break;case"RGB_ZERO":n.opacity=1-h[0]*l.float;break;case"A_ZERO":n.opacity=1-h[3]*l.float;break;case"RGB_ONE":n.opacity=h[0]*l.float;break;default:console.warn('THREE.ColladaLoader: Invalid opaque type "%s" of transparent tag.',c.opaque)}n.opacity<1&&(n.transparent=!0)}if(i.extra!==void 0&&i.extra.technique!==void 0){const h=i.extra.technique;for(const d in h){const u=h[d];switch(d){case"double_sided":n.side=u===1?Mi:Bi;break;case"bump":n.normalMap=o(u.texture),n.normalScale=new De(1,1);break}}}return n}getMaterial(e){return this.getBuild(this.library.materials[e],this.buildMaterial.bind(this))}buildCamera(e){let t;switch(e.optics.technique){case"perspective":t=new It(e.optics.parameters.yfov,e.optics.parameters.aspect_ratio,e.optics.parameters.znear,e.optics.parameters.zfar);break;case"orthographic":let i=e.optics.parameters.ymag,n=e.optics.parameters.xmag;const r=e.optics.parameters.aspect_ratio;n=n===void 0?i*r:n,i=i===void 0?n/r:i,n*=.5,i*=.5,t=new bo(-n,n,i,-i,e.optics.parameters.znear,e.optics.parameters.zfar);break;default:t=new It;break}return t.name=e.name||"",t}getCamera(e){const t=this.library.cameras[e];return t!==void 0?this.getBuild(t,this.buildCamera.bind(this)):(console.warn("THREE.ColladaLoader: Couldn't find camera with ID:",e),null)}buildLight(e){let t;switch(e.technique){case"directional":t=new Du;break;case"point":t=new Bp;break;case"spot":t=new Op;break;case"ambient":t=new Hp;break}return e.parameters.color&&t.color.copy(e.parameters.color),e.parameters.distance&&(t.distance=e.parameters.distance),e.parameters.falloffAngle&&(t.angle=yi.degToRad(e.parameters.falloffAngle)),t}getLight(e){const t=this.library.lights[e];return t!==void 0?this.getBuild(t,this.buildLight.bind(this)):(console.warn("THREE.ColladaLoader: Couldn't find light with ID:",e),null)}groupPrimitives(e){const t={};for(let i=0;i<e.length;i++){const n=e[i];t[n.type]===void 0&&(t[n.type]=[]),t[n.type].push(n)}return t}checkUVCoordinates(e){let t=0;for(let i=0,n=e.length;i<n;i++)e[i].hasUV===!0&&t++;t>0&&t<e.length&&(e.uvsNeedsFix=!0)}buildGeometry(e){const t={},i=e.sources,n=e.vertices,r=e.primitives;if(r.length===0)return{};const o=this.groupPrimitives(r);for(const a in o){const c=o[a];this.checkUVCoordinates(c),t[a]=this.buildGeometryType(c,i,n)}return t}buildGeometryType(e,t,i){const n={},r={array:[],stride:0},o={array:[],stride:0},a={array:[],stride:0},c={array:[],stride:0},l={array:[],stride:0},h={array:[],stride:4},d={array:[],stride:4},u=new wt,f=[];let g=0;for(let v=0;v<e.length;v++){const m=e[v],p=m.inputs;let T=0;switch(m.type){case"lines":case"linestrips":T=m.count*2;break;case"triangles":T=m.count*3;break;case"polygons":case"polylist":for(let M=0;M<m.count;M++){const x=m.vcount[M];switch(x){case 3:T+=3;break;case 4:T+=6;break;default:T+=(x-2)*3;break}}break;default:console.warn("THREE.ColladaLoader: Unknown primitive type:",m.type)}u.addGroup(g,T,v),g+=T,m.material&&f.push(m.material);for(const M in p){const x=p[M];switch(M){case"VERTEX":for(const b in i){const S=i[b];switch(b){case"POSITION":const A=r.array.length;if(this.buildGeometryData(m,t[S],x.offset,r.array),r.stride=t[S].stride,t.skinWeights&&t.skinIndices&&(this.buildGeometryData(m,t.skinIndices,x.offset,h.array),this.buildGeometryData(m,t.skinWeights,x.offset,d.array)),m.hasUV===!1&&e.uvsNeedsFix===!0){const _=(r.array.length-A)/r.stride;for(let E=0;E<_;E++)a.array.push(0,0)}break;case"NORMAL":this.buildGeometryData(m,t[S],x.offset,o.array),o.stride=t[S].stride;break;case"COLOR":this.buildGeometryData(m,t[S],x.offset,l.array),l.stride=t[S].stride;break;case"TEXCOORD":this.buildGeometryData(m,t[S],x.offset,a.array),a.stride=t[S].stride;break;case"TEXCOORD1":this.buildGeometryData(m,t[S],x.offset,c.array),a.stride=t[S].stride;break;default:console.warn('THREE.ColladaLoader: Semantic "%s" not handled in geometry build process.',b)}}break;case"NORMAL":this.buildGeometryData(m,t[x.id],x.offset,o.array),o.stride=t[x.id].stride;break;case"COLOR":this.buildGeometryData(m,t[x.id],x.offset,l.array,!0),l.stride=t[x.id].stride;break;case"TEXCOORD":this.buildGeometryData(m,t[x.id],x.offset,a.array),a.stride=t[x.id].stride;break;case"TEXCOORD1":this.buildGeometryData(m,t[x.id],x.offset,c.array),c.stride=t[x.id].stride;break}}}return r.array.length>0&&u.setAttribute("position",new je(r.array,r.stride)),o.array.length>0&&u.setAttribute("normal",new je(o.array,o.stride)),l.array.length>0&&u.setAttribute("color",new je(l.array,l.stride)),a.array.length>0&&u.setAttribute("uv",new je(a.array,a.stride)),c.array.length>0&&u.setAttribute("uv1",new je(c.array,c.stride)),h.array.length>0&&u.setAttribute("skinIndex",new je(h.array,h.stride)),d.array.length>0&&u.setAttribute("skinWeight",new je(d.array,d.stride)),n.data=u,n.type=e[0].type,n.materialKeys=f,n}buildGeometryData(e,t,i,n,r=!1){const o=e.p,a=e.stride,c=e.vcount,l=this.tempColor;function h(f){let g=o[f+i]*u;const v=g+u;for(;g<v;g++)n.push(d[g]);if(r){const m=n.length-u-1;l.setRGB(n[m+0],n[m+1],n[m+2],ht),n[m+0]=l.r,n[m+1]=l.g,n[m+2]=l.b}}const d=t.array,u=t.stride;if(e.vcount!==void 0){let f=0;for(let g=0,v=c.length;g<v;g++){const m=c[g];if(m===4){const p=f+a*0,T=f+a*1,M=f+a*2,x=f+a*3;h(p),h(T),h(x),h(T),h(M),h(x)}else if(m===3){const p=f+a*0,T=f+a*1,M=f+a*2;h(p),h(T),h(M)}else if(m>4){const p=[];for(let A=0;A<m;A++){const _=f+a*A,E=o[_]*u,R=d[E],C=d[E+1],L=d[E+2];p.push(new D(R,C,L))}const T=new D,M=new oi;M.a=p[0],M.b=p[1],M.c=p[2],M.getNormal(T);const x=[];if(Math.abs(T.x)>Math.abs(T.y)&&Math.abs(T.x)>Math.abs(T.z))for(let A=0;A<m;A++)x.push(new De(p[A].y,p[A].z));else if(Math.abs(T.y)>Math.abs(T.z))for(let A=0;A<m;A++)x.push(new De(p[A].x,p[A].z));else for(let A=0;A<m;A++)x.push(new De(p[A].x,p[A].y));const b=so.isClockWise(x);b===!0&&x.reverse();const S=so.triangulateShape(x,[]);for(let A=0;A<S.length;A++){const _=S[A];let E,R,C;b===!1?(E=_[0],R=_[1],C=_[2]):(E=m-1-_[0],R=m-1-_[2],C=m-1-_[1]);const L=f+a*E,k=f+a*R,q=f+a*C;h(L),h(k),h(q)}}f+=a*m}}else for(let f=0,g=o.length;f<g;f+=a)h(f)}getGeometry(e){return this.getBuild(this.library.geometries[e],this.buildGeometry.bind(this))}buildKinematicsModel(e){return e.build!==void 0?e.build:e}getKinematicsModel(e){return this.getBuild(this.library.kinematicsModels[e],this.buildKinematicsModel.bind(this))}buildKinematicsScene(e){return e.build!==void 0?e.build:e}getKinematicsScene(e){return this.getBuild(this.library.kinematicsScenes[e],this.buildKinematicsScene.bind(this))}setupKinematics(){const e=Object.keys(this.library.kinematicsModels)[0],t=Object.keys(this.library.kinematicsScenes)[0],i=Object.keys(this.library.visualScenes)[0];if(e===void 0||t===void 0)return;const n=this.getKinematicsModel(e),r=this.getKinematicsScene(t),o=this.getVisualScene(i),a=r.bindJointAxis,c={},l=this.collada,h=this;for(let g=0,v=a.length;g<v;g++){const m=a[g],p=l.querySelector('[sid="'+m.target+'"]');if(p){const T=p.parentElement;d(m.jointIndex,T)}}function d(g,v){const m=v.getAttribute("name"),p=n.joints[g],T=h.buildTransformList(v);o.traverse(function(M){M.name===m&&(c[g]={object:M,transforms:T,joint:p,position:p.zeroPosition})})}const u=new Oe,f=this.matrix;this.kinematics={joints:n&&n.joints,getJointValue:function(g){const v=c[g];if(v)return v.position;console.warn("THREE.ColladaLoader: Joint "+g+" doesn't exist.")},setJointValue:function(g,v){const m=c[g];if(m){const p=m.joint;if(v>p.limits.max||v<p.limits.min)console.warn("THREE.ColladaLoader: Joint "+g+" value "+v+" outside of limits (min: "+p.limits.min+", max: "+p.limits.max+").");else if(p.static)console.warn("THREE.ColladaLoader: Joint "+g+" is static.");else{const T=m.object,M=p.axis,x=m.transforms;f.identity();for(let b=0;b<x.length;b++){const S=x[b];if(S.sid&&S.sid.indexOf(g)!==-1)switch(p.type){case"revolute":f.multiply(u.makeRotationAxis(M,yi.degToRad(v)));break;case"prismatic":f.multiply(u.makeTranslation(M.x*v,M.y*v,M.z*v));break;default:console.warn("THREE.ColladaLoader: Unknown joint type: "+p.type);break}else switch(S.type){case"matrix":f.multiply(S.obj);break;case"translate":f.multiply(u.makeTranslation(S.obj.x,S.obj.y,S.obj.z));break;case"scale":f.scale(S.obj);break;case"rotate":f.multiply(u.makeRotationAxis(S.obj,S.angle));break}}T.matrix.copy(f),T.matrix.decompose(T.position,T.quaternion,T.scale),c[g].position=v}}else console.warn("THREE.ColladaLoader: Joint "+g+" does not exist.")}}}buildTransformList(e){const t=[],i=this.collada.querySelector('[id="'+e.id+'"]');for(let n=0;n<i.childNodes.length;n++){const r=i.childNodes[n];if(r.nodeType!==1)continue;let o,a;switch(r.nodeName){case"matrix":o=Xt(r.textContent);const c=new Oe().fromArray(o).transpose();t.push({sid:r.getAttribute("sid"),type:r.nodeName,obj:c});break;case"translate":case"scale":o=Xt(r.textContent),a=new D().fromArray(o),t.push({sid:r.getAttribute("sid"),type:r.nodeName,obj:a});break;case"rotate":o=Xt(r.textContent),a=new D().fromArray(o);const l=yi.degToRad(o[3]);t.push({sid:r.getAttribute("sid"),type:r.nodeName,obj:a,angle:l});break}}return t}buildSkeleton(e,t){const i=[],n=[];let r,o,a;for(r=0;r<e.length;r++){const h=e[r];let d;if(this.hasNode(h))d=this.getNode(h),this.buildBoneHierarchy(d,t,i);else if(this.hasVisualScene(h)){const f=this.library.visualScenes[h].children;for(let g=0;g<f.length;g++){const v=f[g];if(v.type==="JOINT"){const m=this.getNode(v.id);this.buildBoneHierarchy(m,t,i)}}}else console.error("THREE.ColladaLoader: Unable to find root bone of skeleton with ID:",h)}for(r=0;r<t.length;r++)for(o=0;o<i.length;o++)if(a=i[o],a.bone.name===t[r].name){n[r]=a,a.processed=!0;break}for(r=0;r<i.length;r++)a=i[r],a.processed===!1&&(n.push(a),a.processed=!0);const c=[],l=[];for(r=0;r<n.length;r++)a=n[r],c.push(a.bone),l.push(a.boneInverse);return new Pl(c,l)}buildBoneHierarchy(e,t,i){e.traverse(function(n){if(n.isBone===!0){let r;for(let o=0;o<t.length;o++){const a=t[o];if(a.name===n.name){r=a.boneInverse;break}}r===void 0&&(r=new Oe),i.push({bone:n,boneInverse:r,processed:!1})}})}buildNode(e){const t=[],i=e.matrix,n=e.nodes,r=e.type,o=e.instanceCameras,a=e.instanceControllers,c=e.instanceLights,l=e.instanceGeometries,h=e.instanceNodes;for(let u=0,f=n.length;u<f;u++)t.push(this.getNode(n[u]));for(let u=0,f=o.length;u<f;u++){const g=this.getCamera(o[u]);g!==null&&t.push(g.clone())}for(let u=0,f=a.length;u<f;u++){const g=a[u],v=this.getController(g.id),m=this.getGeometry(v.id),p=this.buildObjects(m,g.materials),T=g.skeletons,M=v.skin.joints,x=this.buildSkeleton(T,M);for(let b=0,S=p.length;b<S;b++){const A=p[b];A.isSkinnedMesh&&(A.bind(x,v.skin.bindMatrix),A.normalizeSkinWeights()),t.push(A)}}for(let u=0,f=c.length;u<f;u++){const g=this.getLight(c[u]);g!==null&&t.push(g.clone())}for(let u=0,f=l.length;u<f;u++){const g=l[u],v=this.getGeometry(g.id),m=this.buildObjects(v,g.materials);for(let p=0,T=m.length;p<T;p++)t.push(m[p])}for(let u=0,f=h.length;u<f;u++)t.push(this.getNode(h[u]).clone());let d;if(n.length===0&&t.length===1)d=t[0];else{d=r==="JOINT"?new yu:new sn;for(let u=0;u<t.length;u++)d.add(t[u])}return d.name=r==="JOINT"?e.sid:e.name,r!=="JOINT"&&this.hasPivotTransforms(e)?this.wrapWithTransformHierarchy(d,e):(d.matrix.copy(i),d.matrix.decompose(d.position,d.quaternion,d.scale),d)}wrapWithTransformHierarchy(e,t){const i=t.id;this.transformNodes[i]={};const n=t.transformOrder,r=t.transformData,o=new sn;o.name=t.name;let a=o;for(let c=0;c<n.length;c++){const l=n[c],h=r[l],d=new sn;switch(d.name=t.name+"_"+l,h.type){case"translate":d.position.set(h.x,h.y,h.z);break;case"rotate":{const u=new D(h.axis[0],h.axis[1],h.axis[2]),f=yi.degToRad(h.angle);d.quaternion.setFromAxisAngle(u,f),d.userData.rotationAxis=u;break}case"scale":d.scale.set(h.x,h.y,h.z);break;case"matrix":{new Oe().fromArray(h.array).transpose().decompose(d.position,d.quaternion,d.scale);break}}this.transformNodes[i][l]=d,a.add(d),a=d}return a.add(e),o}resolveMaterialBinding(e,t){const i=[];for(let n=0,r=e.length;n<r;n++){const o=t[e[n]];o===void 0?(console.warn("THREE.ColladaLoader: Material with key %s not found. Apply fallback material.",e[n]),i.push(this.fallbackMaterial)):i.push(this.getMaterial(o))}return i}get fallbackMaterial(){return this._fallbackMaterial===void 0&&(this._fallbackMaterial=new ls({name:cn.DEFAULT_MATERIAL_NAME,color:16711935})),this._fallbackMaterial}buildObjects(e,t){const i=[];for(const n in e){const r=e[n],o=this.resolveMaterialBinding(r.materialKeys,t);if(o.length===0&&(n==="lines"||n==="linestrips"?o.push(new wn):o.push(new ks)),n==="lines"||n==="linestrips")for(let h=0,d=o.length;h<d;h++){const u=o[h];if(u.isMeshPhongMaterial===!0||u.isMeshLambertMaterial===!0){const f=new wn;f.color.copy(u.color),f.opacity=u.opacity,f.transparent=u.transparent,o[h]=f}}const a=r.data.attributes.skinIndex!==void 0,c=o.length===1?o[0]:o;let l;switch(n){case"lines":l=new Nl(r.data,c);break;case"linestrips":l=new _o(r.data,c);break;case"triangles":case"polygons":case"polylist":a?l=new Xf(r.data,c):l=new Ft(r.data,c);break}i.push(l)}return i}hasNode(e){return this.library.nodes[e]!==void 0}getNode(e){return this.getBuild(this.library.nodes[e],this.buildNode.bind(this))}buildVisualScene(e){const t=new sn;t.name=e.name;const i=e.children;for(let n=0;n<i.length;n++){const r=i[n];t.add(this.getNode(r.id))}return t}hasVisualScene(e){return this.library.visualScenes[e]!==void 0}getVisualScene(e){return this.getBuild(this.library.visualScenes[e],this.buildVisualScene.bind(this))}parseScene(e){const t=Qt(e,"instance_visual_scene")[0];return this.getVisualScene(this.parseId(t.getAttribute("url")))}parseId(e){return e.substring(1)}setupAnimations(){const e=this.library.clips;if(this.isEmpty(e)===!0){if(this.isEmpty(this.library.animations)===!1){const t=[];for(const i in this.library.animations){const n=this.getAnimation(i);for(let r=0,o=n.length;r<o;r++)t.push(n[r])}this.buildDeferredPivotAnimationTracks(t),this.animations.push(new Yc("default",-1,t))}}else for(const t in e)this.animations.push(this.getAnimationClip(t))}buildDeferredPivotAnimationTracks(e){for(const t in this.deferredPivotAnimations){const i=this.library.nodes[t];if(!i)continue;const n=this.deferredPivotAnimations[t];this.buildTransformHierarchyTracks(t,n,i,e)}}buildTransformHierarchyTracks(e,t,i,n){const r=this.transformNodes[e];if(!r){console.warn("THREE.ColladaLoader: Transform hierarchy not found for node:",e);return}for(const o in t){const a=r[o];if(!a)continue;const c=i.transforms[o],l=i.transformData[o],h=t[o];switch(c){case"translate":this.buildHierarchyTranslateTrack(a,h,l,n);break;case"rotate":this.buildHierarchyRotateTrack(a,h,l,n);break;case"scale":this.buildHierarchyScaleTrack(a,h,l,n);break}}}buildHierarchyTranslateTrack(e,t,i,n){if(t.default&&t.default.stride===3){const l=t.default,h=new ri(e.uuid+".position",Array.from(l.times),Array.from(l.values)),d=this.getInterpolationInfo(t);this.applyInterpolation(h,d,t),n.push(h);return}const r=this.getTimesForAllAxes(t);if(r.length===0)return;const o=[],a=this.getInterpolationInfo(t);for(let l=0;l<r.length;l++){const h=r[l],d=this.getValueAtTime(t.X,h,i.x),u=this.getValueAtTime(t.Y,h,i.y),f=this.getValueAtTime(t.Z,h,i.z);o.push(d,u,f)}const c=new ri(e.uuid+".position",r,o);this.applyInterpolation(c,a),n.push(c)}buildHierarchyRotateTrack(e,t,i,n){const r=t.ANGLE||t.default;if(!r)return;const o=Array.from(r.times);if(o.length===0)return;const a=e.userData.rotationAxis||new D(i.axis[0],i.axis[1],i.axis[2]),c=new Nt,l=new Nt,h=[],d=this.getInterpolationInfo(t);for(let f=0;f<o.length;f++){const g=o[f],v=this.getValueAtTime(r,g,i.angle),m=yi.degToRad(v);c.setFromAxisAngle(a,m),f>0&&l.dot(c)<0&&(c.x=-c.x,c.y=-c.y,c.z=-c.z,c.w=-c.w),l.copy(c),h.push(c.x,c.y,c.z,c.w)}const u=new ns(e.uuid+".quaternion",o,h);this.applyInterpolation(u,d),n.push(u)}buildHierarchyScaleTrack(e,t,i,n){if(t.default&&t.default.stride===3){const l=t.default,h=new ri(e.uuid+".scale",Array.from(l.times),Array.from(l.values)),d=this.getInterpolationInfo(t);this.applyInterpolation(h,d,t),n.push(h);return}const r=this.getTimesForAllAxes(t);if(r.length===0)return;const o=[],a=this.getInterpolationInfo(t);for(let l=0;l<r.length;l++){const h=r[l],d=this.getValueAtTime(t.X,h,i.x),u=this.getValueAtTime(t.Y,h,i.y),f=this.getValueAtTime(t.Z,h,i.z);o.push(d,u,f)}const c=new ri(e.uuid+".scale",r,o);this.applyInterpolation(c,a),n.push(c)}}class sv extends cn{load(e,t,i,n){const r=this,o=r.path===""?Iu.extractUrlBase(e):r.path,a=new Ul(r.manager);a.setPath(r.path),a.setRequestHeader(r.requestHeader),a.setWithCredentials(r.withCredentials),a.load(e,function(c){try{t(r.parse(c,o))}catch(l){n?n(l):console.error(l),r.manager.itemError(e)}},i,n)}parse(e,t){if(e.length===0)return{scene:new Cl};const n=new iv().parse(e);if(n===null)return null;const{library:r,asset:o,collada:a}=n,c=new Pu(this.manager);c.setPath(this.resourcePath||t).setCrossOrigin(this.crossOrigin);let l;Ph&&(l=new Ph(this.manager),l.setPath(this.resourcePath||t));const h=new nv(r,a,c,l),{scene:d,animations:u,kinematics:f}=h.compose();return d.animations=u,o.upAxis==="Z_UP"&&(console.warn("THREE.ColladaLoader: You are loading an asset with a Z-UP coordinate system. The loader just rotates the asset to transform it into Y-UP. The vertex data are not converted, see #24289."),d.rotation.set(-Math.PI/2,0,0)),d.scale.multiplyScalar(o.unit),{get animations(){return console.warn("THREE.ColladaLoader: Please access animations over scene.animations now."),u},kinematics:f,library:r,scene:d}}}const Lh=new D,rv=new fi,Nr=new Oe,Ji=new Oe,Dr=new Nt,Ir=new D(1,1,1),Ur=new D;class So extends dt{constructor(...e){super(...e),this.urdfNode=null,this.urdfName=""}copy(e,t){return super.copy(e,t),this.urdfNode=e.urdfNode,this.urdfName=e.urdfName,this}}class ov extends So{constructor(...e){super(...e),this.isURDFCollider=!0,this.type="URDFCollider"}}class av extends So{constructor(...e){super(...e),this.isURDFVisual=!0,this.type="URDFVisual"}}class $u extends So{constructor(...e){super(...e),this.isURDFLink=!0,this.type="URDFLink",this.name="",this.inertial={mass:0,origin:{xyz:[0,0,0],rpy:[0,0,0]},inertia:{ixx:0,ixy:0,ixz:0,iyy:0,iyz:0,izz:0}}}copy(e,t){return super.copy(e,t),this.inertial={mass:e.inertial.mass,origin:{xyz:[...e.inertial.origin.xyz],rpy:[...e.inertial.origin.rpy]},inertia:{...e.inertial.inertia}},this}}class Yu extends So{get jointType(){return this._jointType}set jointType(e){if(this.jointType!==e)switch(this._jointType=e,this.matrixWorldNeedsUpdate=!0,e){case"fixed":this.jointValue=[];break;case"continuous":case"revolute":case"prismatic":this.jointValue=new Array(1).fill(0);break;case"planar":this.jointValue=new Array(3).fill(0),this.axis=new D(0,0,1);break;case"floating":this.jointValue=new Array(6).fill(0);break}}get angle(){return this.jointValue[0]}constructor(...e){super(...e),this.isURDFJoint=!0,this.type="URDFJoint",this.name="",this.jointValue=null,this.jointType="fixed",this.axis=new D(1,0,0),this.limit={lower:0,upper:0,effort:0,velocity:0},this.ignoreLimits=!1,this.origPosition=null,this.origQuaternion=null,this.mimicJoints=[]}copy(e,t){return super.copy(e,t),this.jointType=e.jointType,this.axis=e.axis.clone(),this.limit.lower=e.limit.lower,this.limit.upper=e.limit.upper,this.limit.effort=e.limit.effort,this.limit.velocity=e.limit.velocity,this.ignoreLimits=!1,this.jointValue=[...e.jointValue],this.origPosition=e.origPosition?e.origPosition.clone():null,this.origQuaternion=e.origQuaternion?e.origQuaternion.clone():null,this.mimicJoints=[...e.mimicJoints],this}setJointValue(...e){e=e.map(i=>i===null?null:parseFloat(i)),(!this.origPosition||!this.origQuaternion)&&(this.origPosition=this.position.clone(),this.origQuaternion=this.quaternion.clone());let t=!1;switch(this.mimicJoints.forEach(i=>{t=i.updateFromMimickedJoint(...e)||t}),this.jointType){case"fixed":return t;case"continuous":case"revolute":{let i=e[0];return i==null||i===this.jointValue[0]?t:(!this.ignoreLimits&&this.jointType==="revolute"&&(i=Math.min(this.limit.upper,i),i=Math.max(this.limit.lower,i)),this.quaternion.setFromAxisAngle(this.axis,i).premultiply(this.origQuaternion),this.jointValue[0]!==i?(this.jointValue[0]=i,this.matrixWorldNeedsUpdate=!0,!0):t)}case"prismatic":{let i=e[0];return i==null||i===this.jointValue[0]?t:(this.ignoreLimits||(i=Math.min(this.limit.upper,i),i=Math.max(this.limit.lower,i)),this.position.copy(this.origPosition),Lh.copy(this.axis).applyEuler(this.rotation),this.position.addScaledVector(Lh,i),this.jointValue[0]!==i?(this.jointValue[0]=i,this.matrixWorldNeedsUpdate=!0,!0):t)}case"floating":return this.jointValue.every((i,n)=>e[n]===i||e[n]===null)?t:(this.jointValue[0]=e[0]!==null?e[0]:this.jointValue[0],this.jointValue[1]=e[1]!==null?e[1]:this.jointValue[1],this.jointValue[2]=e[2]!==null?e[2]:this.jointValue[2],this.jointValue[3]=e[3]!==null?e[3]:this.jointValue[3],this.jointValue[4]=e[4]!==null?e[4]:this.jointValue[4],this.jointValue[5]=e[5]!==null?e[5]:this.jointValue[5],Ji.compose(this.origPosition,this.origQuaternion,Ir),Dr.setFromEuler(rv.set(this.jointValue[3],this.jointValue[4],this.jointValue[5],"XYZ")),Ur.set(this.jointValue[0],this.jointValue[1],this.jointValue[2]),Nr.compose(Ur,Dr,Ir),Ji.premultiply(Nr),this.position.setFromMatrixPosition(Ji),this.rotation.setFromRotationMatrix(Ji),this.matrixWorldNeedsUpdate=!0,!0);case"planar":return this.jointValue.every((i,n)=>e[n]===i||e[n]===null)?t:(this.jointValue[0]=e[0]!==null?e[0]:this.jointValue[0],this.jointValue[1]=e[1]!==null?e[1]:this.jointValue[1],this.jointValue[2]=e[2]!==null?e[2]:this.jointValue[2],Ji.compose(this.origPosition,this.origQuaternion,Ir),Dr.setFromAxisAngle(this.axis,this.jointValue[2]),Ur.set(this.jointValue[0],this.jointValue[1],0),Nr.compose(Ur,Dr,Ir),Ji.premultiply(Nr),this.position.setFromMatrixPosition(Ji),this.rotation.setFromRotationMatrix(Ji),this.matrixWorldNeedsUpdate=!0,!0)}return t}}class Nh extends Yu{constructor(...e){super(...e),this.type="URDFMimicJoint",this.mimicJoint=null,this.offset=0,this.multiplier=1}updateFromMimickedJoint(...e){const t=e.map(i=>i===null?null:i*this.multiplier+this.offset);return super.setJointValue(...t)}copy(e,t){return super.copy(e,t),this.mimicJoint=e.mimicJoint,this.offset=e.offset,this.multiplier=e.multiplier,this}}class lv extends $u{constructor(...e){super(...e),this.isURDFRobot=!0,this.urdfNode=null,this.urdfRobotNode=null,this.robotName=null,this.links=null,this.joints=null,this.colliders=null,this.visual=null,this.frames=null}copy(e,t){super.copy(e,t),this.urdfRobotNode=e.urdfRobotNode,this.robotName=e.robotName,this.links={},this.joints={},this.colliders={},this.visual={},this.traverse(i=>{i.isURDFJoint&&i.urdfName in e.joints&&(this.joints[i.urdfName]=i),i.isURDFLink&&i.urdfName in e.links&&(this.links[i.urdfName]=i),i.isURDFCollider&&i.urdfName in e.colliders&&(this.colliders[i.urdfName]=i),i.isURDFVisual&&i.urdfName in e.visual&&(this.visual[i.urdfName]=i)});for(const i in this.joints)this.joints[i].mimicJoints=this.joints[i].mimicJoints.map(n=>this.joints[n.name]);return this.frames={...this.colliders,...this.visual,...this.links,...this.joints},this}getFrame(e){return this.frames[e]}setJointValue(e,...t){const i=this.joints[e];return i?i.setJointValue(...t):!1}setJointValues(e){let t=!1;for(const i in e){const n=e[i];Array.isArray(n)?t=this.setJointValue(i,...n)||t:t=this.setJointValue(i,n)||t}return t}}const ma=new Nt,Dh=new fi;function ji(s){return s?s.trim().split(/\s+/g).map(e=>parseFloat(e)):[0,0,0]}function Ih(s,e,t=!1){t||s.rotation.set(0,0,0),Dh.set(e[0],e[1],e[2],"ZYX"),ma.setFromEuler(Dh),ma.multiply(s.quaternion),s.quaternion.copy(ma)}class cv{constructor(e){this.manager=e||Cu,this.loadMeshCb=this.defaultMeshLoader.bind(this),this.parseVisual=!0,this.parseCollision=!1,this.packages="",this.workingPath="",this.fetchOptions={}}loadAsync(e){return new Promise((t,i)=>{this.load(e,t,null,i)})}load(e,t,i,n){const r=this.manager,o=Iu.extractUrlBase(e),a=this.manager.resolveURL(e);r.itemStart(a),fetch(a,this.fetchOptions).then(c=>{if(c.ok)return i&&i(null),c.text();throw new Error(`URDFLoader: Failed to load url '${a}' with error code ${c.status} : ${c.statusText}.`)}).then(c=>{const l=this.parse(c,this.workingPath||o);t(l),r.itemEnd(a)}).catch(c=>{n?n(c):console.error("URDFLoader: Error loading file.",c),r.itemError(a),r.itemEnd(a)})}parse(e,t=this.workingPath){const i=this.packages,n=this.loadMeshCb,r=this.parseVisual,o=this.parseCollision,a=this.manager,c={},l={},h={};function d(T){if(!/^package:\/\//.test(T))return t?t+T:T;const[M,x]=T.replace(/^package:\/\//,"").split(/\/(.+)/);if(typeof i=="string")return i.endsWith(M)?i+"/"+x:i+"/"+M+"/"+x;if(typeof i=="function")return i(M)+"/"+x;if(typeof i=="object")return M in i?i[M]+"/"+x:(console.error(`URDFLoader : ${M} not found in provided package list.`),null)}function u(T){let M;T instanceof Document?M=[...T.children]:T instanceof Element?M=[T]:M=[...new DOMParser().parseFromString(T,"text/xml").children];const x=M.filter(b=>b.nodeName==="robot").pop();return f(x)}function f(T){const M=[...T.children],x=M.filter(C=>C.nodeName.toLowerCase()==="link"),b=M.filter(C=>C.nodeName.toLowerCase()==="joint"),S=M.filter(C=>C.nodeName.toLowerCase()==="material"),A=new lv;A.robotName=T.getAttribute("name"),A.urdfRobotNode=T,S.forEach(C=>{const L=C.getAttribute("name");h[L]=m(C)});const _={},E={};x.forEach(C=>{const L=C.getAttribute("name"),k=T.querySelector(`child[link="${L}"]`)===null;c[L]=v(C,_,E,k?A:null)}),b.forEach(C=>{const L=C.getAttribute("name");l[L]=g(C)}),A.joints=l,A.links=c,A.colliders=E,A.visual=_;const R=Object.values(l);return R.forEach(C=>{C instanceof Nh&&l[C.mimicJoint].mimicJoints.push(C)}),R.forEach(C=>{const L=new Set,k=q=>{if(L.has(q))throw new Error("URDFLoader: Detected an infinite loop of mimic joints.");L.add(q),q.mimicJoints.forEach(U=>{k(U)})};k(C)}),A.frames={...E,..._,...c,...l},A}function g(T){const M=[...T.children],x=T.getAttribute("type");let b;const S=M.find(L=>L.nodeName.toLowerCase()==="mimic");S?(b=new Nh,b.mimicJoint=S.getAttribute("joint"),b.multiplier=parseFloat(S.getAttribute("multiplier")||1),b.offset=parseFloat(S.getAttribute("offset")||0)):b=new Yu,b.urdfNode=T,b.name=T.getAttribute("name"),b.urdfName=b.name,b.jointType=x;let A=null,_=null,E=[0,0,0],R=[0,0,0];M.forEach(L=>{const k=L.nodeName.toLowerCase();k==="origin"?(E=ji(L.getAttribute("xyz")),R=ji(L.getAttribute("rpy"))):k==="child"?_=c[L.getAttribute("link")]:k==="parent"?A=c[L.getAttribute("link")]:k==="limit"&&(b.limit.lower=parseFloat(L.getAttribute("lower")||b.limit.lower),b.limit.upper=parseFloat(L.getAttribute("upper")||b.limit.upper),b.limit.effort=parseFloat(L.getAttribute("effort")||b.limit.effort),b.limit.velocity=parseFloat(L.getAttribute("velocity")||b.limit.velocity))}),A.add(b),b.add(_),Ih(b,R),b.position.set(E[0],E[1],E[2]);const C=M.filter(L=>L.nodeName.toLowerCase()==="axis")[0];if(C){const L=C.getAttribute("xyz").split(/\s+/g).map(k=>parseFloat(k));b.axis=new D(L[0],L[1],L[2]),b.axis.normalize()}return b}function v(T,M,x,b=null){b===null&&(b=new $u);const S=[...T.children];b.name=T.getAttribute("name"),b.urdfName=b.name,b.urdfNode=T;const A=S.find(_=>_.nodeName.toLowerCase()==="inertial");return A&&[...A.children].forEach(_=>{const E=_.nodeName.toLowerCase();E==="origin"?(b.inertial.origin.xyz=ji(_.getAttribute("xyz")),b.inertial.origin.rpy=ji(_.getAttribute("rpy"))):E==="mass"?b.inertial.mass=parseFloat(_.getAttribute("value"))||0:E==="inertia"&&(b.inertial.inertia.ixx=parseFloat(_.getAttribute("ixx"))||0,b.inertial.inertia.ixy=parseFloat(_.getAttribute("ixy"))||0,b.inertial.inertia.ixz=parseFloat(_.getAttribute("ixz"))||0,b.inertial.inertia.iyy=parseFloat(_.getAttribute("iyy"))||0,b.inertial.inertia.iyz=parseFloat(_.getAttribute("iyz"))||0,b.inertial.inertia.izz=parseFloat(_.getAttribute("izz"))||0)}),r&&S.filter(E=>E.nodeName.toLowerCase()==="visual").forEach(E=>{const R=p(E,h);if(b.add(R),E.hasAttribute("name")){const C=E.getAttribute("name");R.name=C,R.urdfName=C,M[C]=R}}),o&&S.filter(E=>E.nodeName.toLowerCase()==="collision").forEach(E=>{const R=p(E);if(b.add(R),E.hasAttribute("name")){const C=E.getAttribute("name");R.name=C,R.urdfName=C,x[C]=R}}),b}function m(T){const M=[...T.children],x=new ks;return x.name=T.getAttribute("name")||"",M.forEach(b=>{const S=b.nodeName.toLowerCase();if(S==="color"){const A=b.getAttribute("rgba").split(/\s/g).map(_=>parseFloat(_));x.color.setRGB(A[0],A[1],A[2]),x.opacity=A[3],x.transparent=A[3]<1,x.depthWrite=!x.transparent}else if(S==="texture"){const A=b.getAttribute("filename");if(A){const _=new Pu(a),E=d(A);x.map=_.load(E),x.map.colorSpace=ht}}}),x}function p(T,M={}){const x=T.nodeName.toLowerCase()==="collision",b=[...T.children];let S=null;const A=b.filter(E=>E.nodeName.toLowerCase()==="material")[0];if(A){const E=A.getAttribute("name");E&&E in M?S=M[E]:S=m(A)}else S=new ks;const _=x?new ov:new av;return _.urdfNode=T,b.forEach(E=>{const R=E.nodeName.toLowerCase();if(R==="geometry"){const C=E.children[0].nodeName.toLowerCase();if(C==="mesh"){const L=E.children[0].getAttribute("filename"),k=d(L);if(k!==null){const q=E.children[0].getAttribute("scale");if(q){const U=ji(q);_.scale.set(U[0],U[1],U[2])}n(k,a,S,(U,N)=>{N?console.error("URDFLoader: Error loading mesh.",N):U&&(U.position.set(0,0,0),U.quaternion.identity(),_.add(U))})}}else if(C==="box"){const L=new Ft;L.geometry=new ps(1,1,1),L.material=S;const k=ji(E.children[0].getAttribute("size"));L.scale.set(k[0],k[1],k[2]),_.add(L)}else if(C==="sphere"){const L=new Ft;L.geometry=new yo(1,30,30),L.material=S;const k=parseFloat(E.children[0].getAttribute("radius"))||0;L.scale.set(k,k,k),_.add(L)}else if(C==="cylinder"){const L=new Ft;L.geometry=new xo(1,1,1,30),L.material=S;const k=parseFloat(E.children[0].getAttribute("radius"))||0,q=parseFloat(E.children[0].getAttribute("length"))||0;L.scale.set(k,q,k),L.rotation.set(Math.PI/2,0,0),_.add(L)}}else if(R==="origin"){const C=ji(E.getAttribute("xyz")),L=ji(E.getAttribute("rpy"));_.position.set(C[0],C[1],C[2]),_.rotation.set(0,0,0),Ih(_,L)}}),_}return u(e)}defaultMeshLoader(e,t,i,n){/\.stl$/i.test(e)?new ev(t).load(e,o=>{const a=new Ft(o,i||new ks);n(a)},null,o=>n(null,o)):/\.dae$/i.test(e)?new sv(t).load(e,o=>n(o.scene),null,o=>n(null,o)):console.warn(`URDFLoader: Could not load model at ${e}.
No loader available`)}}class ${static getElements(e,t=document){if(typeof e=="string"){const i="getElementById"in t?t:void 0;if(i&&!isNaN(+e[0])){const r=i.getElementById(e);return r?[r]:[]}let n=t.querySelectorAll(e);if(!n.length&&e[0]!=="."&&e[0]!=="#"&&(n=t.querySelectorAll("."+e),n.length||(n=t.querySelectorAll("#"+e)),!n.length)){const r=t.querySelector(`[gs-id="${e}"]`);return r?[r]:[]}return Array.from(n)}return[e]}static getElement(e,t=document){if(typeof e=="string"){const i="getElementById"in t?t:void 0;if(!e.length)return null;if(i&&e[0]==="#")return i.getElementById(e.substring(1));if(e[0]==="#"||e[0]==="."||e[0]==="[")return t.querySelector(e);if(i&&!isNaN(+e[0]))return i.getElementById(e);let n=t.querySelector(e);return i&&!n&&(n=i.getElementById(e)),n||(n=t.querySelector("."+e)),n}return e}static lazyLoad(e){var t,i;return!!(e.lazyLoad||(i=(t=e.grid)==null?void 0:t.opts)!=null&&i.lazyLoad&&e.lazyLoad!==!1)}static createDiv(e,t){const i=document.createElement("div");return e.forEach(n=>{n&&i.classList.add(n)}),t==null||t.appendChild(i),i}static shouldSizeToContent(e,t=!1){return!!(e!=null&&e.grid&&(t?e.sizeToContent===!0||e.grid.opts.sizeToContent===!0&&e.sizeToContent===void 0:e.sizeToContent||e.grid.opts.sizeToContent&&e.sizeToContent!==!1))}static isIntercepted(e,t){return!(e.y>=t.y+t.h||e.y+e.h<=t.y||e.x+e.w<=t.x||e.x>=t.x+t.w)}static isTouching(e,t){return $.isIntercepted(e,{x:t.x-.5,y:t.y-.5,w:t.w+1,h:t.h+1})}static areaIntercept(e,t){const i=e.x>t.x?e.x:t.x,n=e.x+e.w<t.x+t.w?e.x+e.w:t.x+t.w;if(n<=i)return 0;const r=e.y>t.y?e.y:t.y,o=e.y+e.h<t.y+t.h?e.y+e.h:t.y+t.h;return o<=r?0:(n-i)*(o-r)}static area(e){return e.w*e.h}static sort(e,t=1){const i=Number.MAX_SAFE_INTEGER;return e.sort((n,r)=>{const o=t*((n.y??i)-(r.y??i));return o===0?t*((n.x??i)-(r.x??i)):o})}static find(e,t){return t?e.find(i=>i.id===t):void 0}static findInGrid(e,t,i){const n=e.engine.nodes.find(r=>String(r.id)===t);if(n||!i)return n;for(const r of e.engine.nodes)if(r.subGrid){const o=$.findInGrid(r.subGrid,t);if(o)return o}}static toBool(e){return typeof e=="boolean"?e:typeof e=="string"?(e=e.toLowerCase(),!(e===""||e==="no"||e==="false"||e==="0")):!!e}static toNumber(e){return e===null||e.length===0?void 0:Number(e)}static parseHeight(e){let t,i="px";if(typeof e=="string")if(e==="auto"||e==="")t=0;else{const n=e.match(/^(-[0-9]+\.[0-9]+|[0-9]*\.[0-9]+|-[0-9]+|[0-9]+)(px|em|rem|vh|vw|%|cm|mm)?$/);if(!n)throw new Error(`Invalid height val = ${e}`);i=n[2]||"px",t=parseFloat(n[1])}else t=e;return{h:t,unit:i}}static defaults(e,...t){return t.forEach(i=>{for(const n in i){if(!Object.prototype.hasOwnProperty.call(i,n))return;e[n]===null||e[n]===void 0?e[n]=i[n]:typeof i[n]=="object"&&typeof e[n]=="object"&&$.defaults(e[n],i[n])}}),e}static same(e,t){if(typeof e!="object")return e==t;if(typeof e!=typeof t)return!1;const i=e,n=t;if(Object.keys(i).length!==Object.keys(n).length)return!1;for(const r in i)if(i[r]!==n[r])return!1;return!0}static copyPos(e,t,i=!1){return t.x!==void 0&&(e.x=t.x),t.y!==void 0&&(e.y=t.y),t.w!==void 0&&(e.w=t.w),t.h!==void 0&&(e.h=t.h),i&&(t.minW&&(e.minW=t.minW),t.minH&&(e.minH=t.minH),t.maxW&&(e.maxW=t.maxW),t.maxH&&(e.maxH=t.maxH)),e}static samePos(e,t){return e&&t&&e.x===t.x&&e.y===t.y&&(e.w||1)===(t.w||1)&&(e.h||1)===(t.h||1)}static sanitizeMinMax(e){e.minW||delete e.minW,e.minH||delete e.minH,e.maxW||delete e.maxW,e.maxH||delete e.maxH}static removeInternalAndSame(e,t){if(typeof e!="object"||typeof t!="object"||!e||!t||Array.isArray(e)||Array.isArray(t))return;const i=e,n=t;for(const r in i){const o=i[r],a=n[r];r[0]==="_"||o===a?delete i[r]:o&&typeof o=="object"&&a!==void 0&&($.removeInternalAndSame(o,a),Object.keys(o).length||delete i[r])}}static removeInternalForSave(e,t=!0){const i=e;for(const n in i)(n[0]==="_"||i[n]===null||i[n]===void 0)&&delete i[n];delete e.grid,t&&delete e.el,e.autoPosition||delete e.autoPosition,e.noResize||delete e.noResize,e.noMove||delete e.noMove,e.locked||delete e.locked,(e.w===1||e.w===e.minW)&&delete e.w,(e.h===1||e.h===e.minH)&&delete e.h}static throttle(e,t){let i=!1;return(...n)=>{i||(i=!0,setTimeout(()=>{e(...n),i=!1},t))}}static removePositioningStyles(e){const t=e.style;t.position&&t.removeProperty("position"),t.left&&t.removeProperty("left"),t.top&&t.removeProperty("top"),t.width&&t.removeProperty("width"),t.height&&t.removeProperty("height")}static getScrollElement(e){if(!e)return document.scrollingElement||document.documentElement;const t=getComputedStyle(e).overflowY;return(t==="auto"||t==="scroll")&&e.scrollHeight>e.clientHeight?e:$.getScrollElement(e.parentElement??void 0)}static updateScrollResize(e,t,i){const n=$.getScrollElement(t),r=n.clientHeight,o=n===$.getScrollElement()?0:n.getBoundingClientRect().top,a=e.clientY-o,c=a<i,l=a>r-i;c?n.scrollBy({behavior:"smooth",top:a-i}):l&&n.scrollBy({behavior:"smooth",top:i-(r-a)})}static pauseIframePointerEvents(e){document.querySelectorAll("iframe").forEach(t=>{t.style.pointerEvents=e?"none":""})}static clone(e){return e==null||typeof e!="object"?e:e instanceof Array?[...e]:{...e}}static cloneDeep(e){const t=["parentGrid","el","grid","subGrid","engine"],i=$.clone(e);for(const n in i)Object.prototype.hasOwnProperty.call(i,n)&&typeof i[n]=="object"&&n.substring(0,2)!=="__"&&!t.find(r=>r===n)&&(i[n]=$.cloneDeep(e[n]));return i}static cloneNode(e){const t=e.cloneNode(!0);return t.removeAttribute("id"),t}static appendTo(e,t){let i;typeof t=="string"?i=$.getElement(t):i=t,i&&i.appendChild(e)}static addElStyles(e,t){if(t instanceof Object){const i=e.style;for(const n in t)Object.prototype.hasOwnProperty.call(t,n)&&(Array.isArray(t[n])?t[n].forEach(r=>{i[n]=r}):i[n]=t[n])}}static initEvent(e,t){const i={type:t.type},n={button:0,which:0,buttons:1,bubbles:!0,cancelable:!0,target:t.target?t.target:e.target},r=e;return["altKey","ctrlKey","metaKey","shiftKey"].forEach(o=>i[o]=r[o]),["pageX","pageY","clientX","clientY","screenX","screenY"].forEach(o=>i[o]=r[o]),{...i,...n}}static simulateMouseEvent(e,t,i){const n=e,r=new MouseEvent(t,{bubbles:!0,composed:!0,cancelable:!0,view:window,detail:1,screenX:e.screenX,screenY:e.screenY,clientX:e.clientX,clientY:e.clientY,ctrlKey:n.ctrlKey??!1,altKey:n.altKey??!1,shiftKey:n.shiftKey??!1,metaKey:n.metaKey??!1,button:0,relatedTarget:e.target});(i||e.target).dispatchEvent(r)}static getValuesFromTransformedElement(e){const t=document.createElement("div");$.addElStyles(t,{opacity:"0",position:"fixed",top:"0px",left:"0px",width:"1px",height:"1px",zIndex:"-999999"}),e.appendChild(t);const i=t.getBoundingClientRect();return e.removeChild(t),t.remove(),{xScale:1/i.width,yScale:1/i.height,xOffset:i.left,yOffset:i.top}}static swap(e,t,i){if(!e)return;const n=e,r=n[t];n[t]=n[i],n[i]=r}static canBeRotated(e){var t;return!(!e||e.w===e.h||e.locked||e.noResize||(t=e.grid)!=null&&t.opts.disableResize||e.minW&&e.minW===e.maxW||e.minH&&e.minH===e.maxH)}}class Ui{constructor(e={}){this.addedNodes=[],this.removedNodes=[],this.defaultColumn=12,this.column=e.column||this.defaultColumn,this.column>this.defaultColumn&&(this.defaultColumn=this.column),this.maxRow=e.maxRow??0,this._float=e.float??!1,this.nodes=e.nodes||[],this.onChange=e.onChange??(()=>{})}batchUpdate(e=!0,t=!0){return!!this.batchMode===e?this:(this.batchMode=e,e?(this._prevFloat=this._float,this._float=!0,this.cleanNodes(),this.nodes.some(i=>i._updating)||this.saveInitial()):(this._float=this._prevFloat??!1,delete this._prevFloat,t&&this._packNodes(),this._notify()),this)}_useEntireRowArea(e,t){return(!this.float||this.batchMode&&!this._prevFloat)&&!this._hasLocked&&(!e._moving||e._skipDown||t.y<=e.y)}_fixCollisions(e,t=e,i,n={}){if(this.sortNodes(-1),i=i||this.collide(e,t),!i)return!1;if(e._moving&&!e._isExternal&&!n.nested&&!this.float&&this.swap(e,i))return!0;let r=t;!this._loading&&this._useEntireRowArea(e,t)&&(r={x:0,w:this.column,y:t.y,h:t.h},i=this.collide(e,r,n.skip));let o=!1;const a={nested:!0,pack:!1};let c=0;for(;i=i||this.collide(e,r,n.skip);){if(c++>this.nodes.length*2)throw new Error("Infinite collide check");let l;if(i.locked||this._loading||e._moving&&!e._skipDown&&t.y>e.y&&!this.float&&(!this.collide(i,{...i,y:e.y},e)||!this.collide(i,{...i,y:t.y-i.h},e))){e._skipDown=e._skipDown||t.y>e.y;const h={...t,y:i.y+i.h,...a};l=this._loading&&$.samePos(e,h)?!0:this.moveNode(e,h),(i.locked||this._loading)&&l?$.copyPos(t,e):!i.locked&&l&&n.pack&&(this._packNodes(),t.y=i.y+i.h,$.copyPos(e,t)),o=o||l}else l=this.moveNode(i,{...i,y:t.y+t.h,skip:e,...a});if(!l)return o;i=void 0}return o}collide(e,t=e,i){const n=e._id,r=i==null?void 0:i._id;return this.nodes.find(o=>o._id!==n&&o._id!==r&&$.isIntercepted(o,t))}collideAll(e,t=e,i){const n=e._id,r=i==null?void 0:i._id;return this.nodes.filter(o=>o._id!==n&&o._id!==r&&$.isIntercepted(o,t))}directionCollideCoverage(e,t,i){if(!t.rect||!e._rect)return;const n=e._rect,r={...t.rect};r.y>n.y?(r.h=r.h+r.y-n.y,r.y=n.y):r.h=r.h+n.y-r.y,r.x>n.x?(r.w=r.w+r.x-n.x,r.x=n.x):r.w=r.w+n.x-r.x;let o,a=.5;for(const c of i){if(c.locked||!c._rect)continue;const l=c._rect;let h=Number.MAX_VALUE,d=Number.MAX_VALUE;n.y<l.y?h=(r.y+r.h-l.y)/l.h:n.y+n.h>l.y+l.h&&(h=(l.y+l.h-r.y)/l.h),n.x<l.x?d=(r.x+r.w-l.x)/l.w:n.x+n.w>l.x+l.w&&(d=(l.x+l.w-r.x)/l.w);const u=Math.min(d,h);u>a&&(a=u,o=c)}return t.collide=o,o}cacheRects(e,t,i,n,r,o){return this.nodes.forEach(a=>a._rect={y:a.y*t+i,x:a.x*e+o,w:a.w*e-o-n,h:a.h*t-i-r}),this}swap(e,t){if(!t||t.locked||!e||e.locked)return!1;function i(){const r=t.x,o=t.y;return t.x=e.x,t.y=e.y,e.h!=t.h?(e.x=r,e.y=t.y+t.h):e.w!=t.w?(e.x=t.x+t.w,e.y=o):(e.x=r,e.y=o),e._dirty=t._dirty=!0,!0}let n;if(e.w===t.w&&e.h===t.h&&(e.x===t.x||e.y===t.y)&&(n=$.isTouching(e,t)))return i();if(n!==!1){if(e.w===t.w&&e.x===t.x&&(n||(n=$.isTouching(e,t)))){if(t.y<e.y){const r=e;e=t,t=r}return i()}if(n!==!1){if(e.h===t.h&&e.y===t.y&&(n||(n=$.isTouching(e,t)))){if(t.x<e.x){const r=e;e=t,t=r}return i()}return!1}}}isAreaEmpty(e,t,i,n){const r={x:e||0,y:t||0,w:i||1,h:n||1};return!this.collide(r)}compact(e="compact",t=!0){if(this.nodes.length===0)return this;t&&this.sortNodes();const i=this.batchMode;i||this.batchUpdate();const n=this._inColumnResize;n||(this._inColumnResize=!0);const r=this.nodes;return this.nodes=[],r.forEach((o,a,c)=>{let l;o.locked||(o.autoPosition=!0,e==="list"&&a&&(l=c[a-1])),this.addNode(o,!1,l)}),n||delete this._inColumnResize,i||this.batchUpdate(!1),this}set float(e){this._float!==e&&(this._float=e||!1,e||this._packNodes()._notify())}get float(){return this._float||!1}sortNodes(e=1){return this.nodes=$.sort(this.nodes,e),this}_packNodes(){return this.batchMode?this:(this.sortNodes(),this.float?this.nodes.forEach(e=>{if(e._updating||e._orig===void 0||e.y===e._orig.y)return;let t=e.y;for(;t>e._orig.y;)--t,this.collide(e,{x:e.x,y:t,w:e.w,h:e.h})||(e._dirty=!0,e.y=t)}):this.nodes.forEach((e,t)=>{if(!e.locked)for(;e.y>0;){const i=t===0?0:e.y-1;if(!(t===0||!this.collide(e,{x:e.x,y:i,w:e.w,h:e.h})))break;e._dirty=e.y!==i,e.y=i}}),this)}prepareNode(e,t){e._id=e._id??Ui._idSeq++;const i=e.id;if(i){let r=1;for(;this.nodes.find(o=>o.id===e.id&&o!==e);)e.id=i+"_"+r++}(e.x===void 0||e.y===void 0||e.x===null||e.y===null)&&(e.autoPosition=!0);const n={x:0,y:0,w:1,h:1};return $.defaults(e,n),e.autoPosition||delete e.autoPosition,e.noResize||delete e.noResize,e.noMove||delete e.noMove,$.sanitizeMinMax(e),typeof e.x=="string"&&(e.x=Number(e.x)),typeof e.y=="string"&&(e.y=Number(e.y)),typeof e.w=="string"&&(e.w=Number(e.w)),typeof e.h=="string"&&(e.h=Number(e.h)),isNaN(e.x)&&(e.x=n.x,e.autoPosition=!0),isNaN(e.y)&&(e.y=n.y,e.autoPosition=!0),isNaN(e.w)&&(e.w=n.w),isNaN(e.h)&&(e.h=n.h),this.nodeBoundFix(e,t),e}nodeBoundFix(e,t){const i=e._orig||$.copyPos({},e);if(e.maxW&&(e.w=Math.min(e.w||1,e.maxW)),e.maxH&&(e.h=Math.min(e.h||1,e.maxH)),e.minW&&(e.w=Math.max(e.w||1,e.minW)),e.minH&&(e.h=Math.max(e.h||1,e.minH)),(e.x||0)+(e.w||1)>this.column&&this.column<this.defaultColumn&&!this._inColumnResize&&!this.skipCacheUpdate&&e._id!=null&&this.findCacheLayout(e,this.defaultColumn)===-1){const r={...e};r.autoPosition||r.x===void 0?(delete r.x,delete r.y):r.x=Math.min(this.defaultColumn-1,r.x),r.w=Math.min(this.defaultColumn,r.w||1),this.cacheOneLayout(r,this.defaultColumn)}return e.w>this.column?e.w=this.column:e.w<1&&(e.w=1),this.maxRow&&e.h>this.maxRow?e.h=this.maxRow:e.h<1&&(e.h=1),e.x<0&&(e.x=0),e.y<0&&(e.y=0),e.x+e.w>this.column&&(t?e.w=this.column-e.x:e.x=this.column-e.w),this.maxRow&&e.y+e.h>this.maxRow&&(t?e.h=this.maxRow-e.y:e.y=this.maxRow-e.h),$.samePos(e,i)||(e._dirty=!0),this}getDirtyNodes(e){return e?this.nodes.filter(t=>t._dirty&&t._orig&&!$.samePos(t,t._orig)):this.nodes.filter(t=>t._dirty)}_notify(e){if(this.batchMode||!this.onChange)return this;const t=(e||[]).concat(this.getDirtyNodes());return this.onChange(t),this}cleanNodes(){return this.batchMode?this:(this.nodes.forEach(e=>{delete e._dirty,delete e._lastTried}),this)}saveInitial(){return this.nodes.forEach(e=>{e._orig=$.copyPos({},e),delete e._dirty}),this._hasLocked=this.nodes.some(e=>e.locked),this}restoreInitial(){return this.nodes.forEach(e=>{!e._orig||$.samePos(e,e._orig)||($.copyPos(e,e._orig),e._dirty=!0)}),this._notify(),this}findEmptyPosition(e,t=this.nodes,i=this.column,n){const r=n?n.y*i+(n.x+n.w):0;let o=!1;for(let a=r;!o;++a){const c=a%i,l=Math.floor(a/i);if(c+e.w>i)continue;const h={x:c,y:l,w:e.w,h:e.h};t.find(d=>$.isIntercepted(h,d))||((e.x!==c||e.y!==l)&&(e._dirty=!0),e.x=c,e.y=l,delete e.autoPosition,o=!0)}return o}addNode(e,t=!1,i){const n=this.nodes.find(o=>o._id===e._id);if(n)return n;this._inColumnResize?this.nodeBoundFix(e):this.prepareNode(e),delete e._temporaryRemoved,delete e._removeDOM;let r=!1;return e.autoPosition&&this.findEmptyPosition(e,this.nodes,this.column,i)&&(delete e.autoPosition,r=!0),this.nodes.push(e),t&&this.addedNodes.push(e),r||this._fixCollisions(e),this.batchMode||this._packNodes()._notify(),e}removeNode(e,t=!0,i=!1){return this.nodes.find(n=>n._id===e._id)?(i&&this.removedNodes.push(e),t&&(e._removeDOM=!0),this.nodes=this.nodes.filter(n=>n._id!==e._id),e._isAboutToRemove||this._packNodes(),this._notify([e]),this):this}removeAll(e=!0,t=!0){if(delete this._layouts,!this.nodes.length)return this;e&&this.nodes.forEach(n=>n._removeDOM=!0);const i=this.nodes;return this.removedNodes=t?i:[],this.nodes=[],this._notify(i)}moveNodeCheck(e,t){var o;if(!this.changedPosConstrain(e,t))return!1;if(t.pack=!0,!this.maxRow)return this.moveNode(e,t);let i;const n=new Ui({column:this.column,float:this.float,nodes:this.nodes.map(a=>a._id===e._id?(i={...a},i):{...a})});if(!i)return!1;const r=n.moveNode(i,t)&&n.getRow()<=Math.max(this.getRow(),this.maxRow);if(!r&&!t.resizing&&t.collide&&!e._isExternal){const a=(o=t.collide.el)==null?void 0:o.gridstackNode;if(a&&this.swap(e,a))return this._notify(),!0}return r?(n.nodes.filter(a=>a._dirty).forEach(a=>{const c=this.nodes.find(l=>l._id===a._id);c&&($.copyPos(c,a),c._dirty=!0)}),this._notify(),!0):!1}willItFit(e){if(delete e._willFitPos,!this.maxRow)return!0;const t=new Ui({column:this.column,float:this.float,nodes:this.nodes.map(n=>({...n}))}),i={...e};return this.cleanupNode(i),delete i.el,delete i._id,delete i.content,delete i.grid,t.addNode(i),t.getRow()<=this.maxRow?(e._willFitPos=$.copyPos({},i),!0):!1}changedPosConstrain(e,t){return t.w=t.w||e.w,t.h=t.h||e.h,e.x!==t.x||e.y!==t.y?!0:(e.maxW&&(t.w=Math.min(t.w,e.maxW)),e.maxH&&(t.h=Math.min(t.h,e.maxH)),e.minW&&(t.w=Math.max(t.w,e.minW)),e.minH&&(t.h=Math.max(t.h,e.minH)),e.w!==t.w||e.h!==t.h)}moveNode(e,t){var l,h;if(!e||!t)return!1;let i=!1;t.pack===void 0&&!this.batchMode&&(i=t.pack=!0),typeof t.x!="number"&&(t.x=e.x),typeof t.y!="number"&&(t.y=e.y),typeof t.w!="number"&&(t.w=e.w),typeof t.h!="number"&&(t.h=e.h);const n=e.w!==t.w||e.h!==t.h,r=$.copyPos({},e,!0);if($.copyPos(r,t),this.nodeBoundFix(r,n),$.copyPos(t,r),!t.forceCollide&&$.samePos(e,t))return!1;const o=$.copyPos({},e),a=this.collideAll(e,r,t.skip);let c=!0;if(a.length){const d=e._moving&&!t.nested;let u=d?this.directionCollideCoverage(e,t,a):a[0];if(d&&u&&((h=(l=e.grid)==null?void 0:l.opts)!=null&&h.subGridDynamic)&&!e.grid._isTemp){const f=$.areaIntercept(t.rect,u._rect),g=$.area(t.rect),v=$.area(u._rect);f/(g<v?g:v)>.8&&(u.grid.makeSubGrid(u.el,void 0,e),u=void 0)}u?c=!this._fixCollisions(e,r,u,t):(c=!1,i&&delete t.pack)}return c&&!$.samePos(e,r)&&(e._dirty=!0,$.copyPos(e,r)),t.pack&&this._packNodes()._notify(),!$.samePos(e,o)}getRow(){return this.nodes.reduce((e,t)=>Math.max(e,t.y+t.h),0)}beginUpdate(e){return e._updating||(e._updating=!0,delete e._skipDown,this.batchMode||this.saveInitial()),this}endUpdate(){const e=this.nodes.find(t=>t._updating);return e&&(delete e._updating,delete e._skipDown),this}save(e=!0,t,i){var a;const n=((a=this._layouts)==null?void 0:a.length)||0;let r;n&&(i?i!==this.column&&(r=this._layouts[i]):this.column!==n-1&&(r=this._layouts[n-1]));const o=[];return this.sortNodes(),this.nodes.forEach(c=>{const l=r==null?void 0:r.find(d=>d._id===c._id),h={...c,...l||{}};$.removeInternalForSave(h,!e),t&&t(c,h),o.push(h)}),o}layoutsNodesChange(e){return!this._layouts||this._inColumnResize?this:(this._layouts.forEach((t,i)=>{if(!(!t||i===this.column))if(i<this.column)this._layouts[i]=void 0;else{const n=i/this.column;e.forEach(r=>{if(!r._orig)return;const o=t.find(a=>a._id===r._id);o&&(o.y>=0&&r.y!==r._orig.y&&(o.y=o.y+(r.y-r._orig.y),o.y<0&&(o.y=0)),r.x!==r._orig.x&&(o.x=Math.round(r.x*n),o.x<0&&(o.x=0)),r.w!==r._orig.w&&(o.w=Math.round(r.w*n),o.w<1&&(o.w=1)))})}}),this)}columnChanged(e,t,i="moveScale"){var a;if(!this.nodes.length||!t||e===t)return this;const n=i==="compact"||i==="list";n&&this.sortNodes(1),t<e&&this.cacheLayout(this.nodes,e),this.batchUpdate();let r=[],o=n?this.nodes:$.sort(this.nodes,-1);if(t>e&&this._layouts){const c=this._layouts[t]||[],l=this._layouts.length-1;!c.length&&e!==l&&((a=this._layouts[l])!=null&&a.length)&&(e=l,this._layouts[l].forEach(h=>{const d=o.find(u=>u._id===h._id);d&&(!n&&!h.autoPosition&&(d.x=h.x??d.x,d.y=h.y??d.y),d.w=h.w??d.w,(h.x==null||h.y===void 0)&&(d.autoPosition=!0))})),c.forEach(h=>{const d=o.findIndex(u=>u._id===h._id);if(d!==-1){const u=o[d];if(n){u.w=h.w;return}(h.autoPosition||isNaN(h.x)||isNaN(h.y))&&this.findEmptyPosition(h,r),h.autoPosition||(u.x=h.x??u.x,u.y=h.y??u.y,u.w=h.w??u.w,r.push(u)),o.splice(d,1)}})}if(n)this.compact(i,!1);else{if(o.length)if(typeof i=="function")i(t,e,r,o);else{const c=n||i==="none"?1:t/e,l=i==="move"||i==="moveScale",h=i==="scale"||i==="moveScale";o.forEach(d=>{d.x=t===1?0:l?Math.round(d.x*c):Math.min(d.x,t-1),d.w=t===1||e===1?1:h?Math.round(d.w*c)||1:Math.min(d.w,t),r.push(d)}),o=[]}r=$.sort(r,-1),this._inColumnResize=!0,this.nodes=[],r.forEach(c=>{this.addNode(c,!1),delete c._orig})}return this.nodes.forEach(c=>delete c._orig),this.batchUpdate(!1,!n),delete this._inColumnResize,this}cacheLayout(e,t,i=!1){const n=[];return e.forEach((r,o)=>{if(r._id===void 0){const a=r.id?this.nodes.find(c=>c.id===r.id):void 0;r._id=(a==null?void 0:a._id)??Ui._idSeq++}n[o]={x:r.x,y:r.y,w:r.w,_id:r._id}}),this._layouts=i?[]:this._layouts||[],this._layouts[t]=n,this}cacheOneLayout(e,t){e._id=e._id??Ui._idSeq++;const i={x:e.x,y:e.y,w:e.w,_id:e._id};(e.autoPosition||e.x===void 0)&&(delete i.x,delete i.y,e.autoPosition&&(i.autoPosition=!0)),this._layouts=this._layouts||[],this._layouts[t]=this._layouts[t]||[];const n=this.findCacheLayout(e,t);return n===-1?this._layouts[t].push(i):this._layouts[t][n]=i,this}findCacheLayout(e,t){var i,n;return((n=(i=this._layouts)==null?void 0:i[t])==null?void 0:n.findIndex(r=>r._id===e._id))??-1}removeNodeFromLayoutCache(e){if(this._layouts)for(let t=0;t<this._layouts.length;t++){const i=this.findCacheLayout(e,t);i!==-1&&this._layouts[t].splice(i,1)}}cleanupNode(e){const t=e;for(const i in t)i[0]==="_"&&i!=="_id"&&delete t[i];return this}}Ui._idSeq=0;const jt={alwaysShowResizeHandle:"mobile",animate:!0,auto:!0,cellHeight:"auto",cellHeightThrottle:100,cellHeightUnit:"px",column:12,draggable:{handle:".grid-stack-item-content",appendTo:"body",scroll:!0},handle:".grid-stack-item-content",itemClass:"grid-stack-item",margin:10,marginUnit:"px",maxRow:0,minRow:0,placeholderClass:"grid-stack-placeholder",placeholderText:"",removableOptions:{accept:"grid-stack-item",decline:"grid-stack-non-removable"},resizable:{handles:"se"},rtl:"auto"};class Se{}const di=typeof window<"u"&&typeof document<"u"&&("ontouchstart"in document||"ontouchstart"in window||window.DocumentTouch&&document instanceof window.DocumentTouch||navigator.maxTouchPoints>0&&window.matchMedia("(any-pointer: coarse)").matches||navigator.msMaxTouchPoints>0),hv=300,uv=10;class vt{}function ro(s){s.preventDefault()}function dv(){document.addEventListener("contextmenu",ro,!0),document.addEventListener("selectstart",ro,!0)}function Ku(){document.removeEventListener("contextmenu",ro,!0),document.removeEventListener("selectstart",ro,!0)}function Uh(s,e,t){s.removeEventListener("touchmove",e),s.removeEventListener("touchend",t),s.removeEventListener("touchcancel",t),kl()}function kl(){vt.touchDelayTimer&&(window.clearTimeout(vt.touchDelayTimer),delete vt.touchDelayTimer),Ku()}function oo(s,e){s.touches.length>1||(s.cancelable&&s.preventDefault(),$.simulateMouseEvent(s.changedTouches[0],e))}function Zu(s,e){s.cancelable&&s.preventDefault(),$.simulateMouseEvent(s,e)}function ao(s){if(vt.touchHandled)return;const e=s.currentTarget,t=s.touches[0].clientX,i=s.touches[0].clientY,n=()=>Uh(e,r,n),r=o=>{const a=o.touches[0];Math.abs(a.clientX-t)+Math.abs(a.clientY-i)>uv&&n()};e.addEventListener("touchmove",r,{passive:!0}),e.addEventListener("touchend",n,{passive:!0}),e.addEventListener("touchcancel",n,{passive:!0}),vt.touchDelayTimer=window.setTimeout(()=>{Uh(e,r,n),vt.touchHandled=!0,vt.wasDelayed=!0,dv(),oo(s,"mousedown"),delete vt.wasDelayed},hv)}function lo(s){vt.touchHandled&&oo(s,"mousemove")}function on(s){if(!vt.touchHandled)return;Ku(),vt.pointerLeaveTimeout&&(window.clearTimeout(vt.pointerLeaveTimeout),delete vt.pointerLeaveTimeout);const e=!!Se.dragElement;oo(s,"mouseup"),!e&&s.type!=="touchcancel"&&oo(s,"click"),vt.touchHandled=!1}function co(s){s.pointerType!=="mouse"&&s.target.releasePointerCapture(s.pointerId)}function Fh(s){Se.dragElement&&s.pointerType!=="mouse"&&Zu(s,"mouseenter")}function Oh(s){Se.dragElement&&s.pointerType!=="mouse"&&(vt.pointerLeaveTimeout=window.setTimeout(()=>{delete vt.pointerLeaveTimeout,Zu(s,"mouseleave")},10))}class To{constructor(e,t,i){this.host=e,this.dir=t,this.option=i,this._mouseDown=this._mouseDown.bind(this),this._mouseMove=this._mouseMove.bind(this),this._mouseUp=this._mouseUp.bind(this),this._keyEvent=this._keyEvent.bind(this),this._init()}_init(){if(this.option.element)try{this.el=this.option.element instanceof HTMLElement?this.option.element:this.host.querySelector(this.option.element)}catch(e){this.option.element=void 0,console.error("Query for resizeable handle failed, falling back",e)}return this.el||(this.el=document.createElement("div"),this.host.appendChild(this.el)),this.el.classList.add("ui-resizable-handle"),this.el.classList.add(`${To.prefix}${this.dir}`),this.el.addEventListener("mousedown",this._mouseDown),di&&(this.el.addEventListener("touchstart",ao),this.el.addEventListener("pointerdown",co)),this}destroy(){return this.mouseDownEvent&&this._mouseUp(this.mouseDownEvent),kl(),this.el.removeEventListener("mousedown",this._mouseDown),di&&(this.el.removeEventListener("touchstart",ao),this.el.removeEventListener("pointerdown",co)),this.option.element||this.host.removeChild(this.el),this}_mouseDown(e){this.mouseDownEvent=e,document.addEventListener("mousemove",this._mouseMove,{capture:!0,passive:!0}),document.addEventListener("mouseup",this._mouseUp,!0),di&&(this.el.addEventListener("touchmove",lo),this.el.addEventListener("touchend",on),this.el.addEventListener("touchcancel",on)),vt.wasDelayed&&this.el.classList.add("ui-resizable-armed"),e.stopPropagation(),e.preventDefault()}_mouseMove(e){const t=this.mouseDownEvent;this.moving?this._triggerEvent("move",e):Math.abs(e.x-t.x)+Math.abs(e.y-t.y)>2&&(this.moving=!0,this.el.classList.remove("ui-resizable-armed"),this._triggerEvent("start",this.mouseDownEvent),this._triggerEvent("move",e),document.addEventListener("keydown",this._keyEvent)),e.stopPropagation()}_mouseUp(e){this.moving&&(this._triggerEvent("stop",e),document.removeEventListener("keydown",this._keyEvent)),this.el.classList.remove("ui-resizable-armed"),document.removeEventListener("mousemove",this._mouseMove,!0),document.removeEventListener("mouseup",this._mouseUp,!0),di&&(this.el.removeEventListener("touchmove",lo),this.el.removeEventListener("touchend",on),this.el.removeEventListener("touchcancel",on)),delete this.moving,delete this.mouseDownEvent,e.stopPropagation(),e.preventDefault()}_keyEvent(e){var t,i;e.key==="Escape"&&((i=(t=this.host.gridstackNode)==null?void 0:t.grid)==null||i.engine.restoreInitial(),this._mouseUp(this.mouseDownEvent))}_triggerEvent(e,t){const i=this.option;return i[e]&&i[e](t),this}}To.prefix="ui-resizable-";class Bl{constructor(){this._eventRegister={}}get disabled(){return this._disabled}on(e,t){this._eventRegister[e]=t}off(e){delete this._eventRegister[e]}enable(){this._disabled=!1}disable(){this._disabled=!0}destroy(){this._eventRegister={}}triggerEvent(e,t){if(!this.disabled&&this._eventRegister[e])return this._eventRegister[e](t)}}class Ks extends Bl{constructor(e,t={}){super(),this.el=e,this.option=t,this.rectScale={x:1,y:1},this._ui=()=>{const n=this.el.parentElement.getBoundingClientRect(),r={width:this.originalRect.width,height:this.originalRect.height+this.scrolled,left:this.originalRect.left,right:this.originalRect.right,top:this.originalRect.top-this.scrolled},o=this.temporalRect||r;return{position:{left:this.option.rtl?(n.right-o.right)*this.rectScale.x:(o.left-n.left)*this.rectScale.x,top:(o.top-n.top)*this.rectScale.y},size:{width:o.width*this.rectScale.x,height:o.height*this.rectScale.y}}},this._mouseOver=this._mouseOver.bind(this),this._mouseOut=this._mouseOut.bind(this),this.enable(),this._setupAutoHide(!!this.option.autoHide),this._setupHandlers()}on(e,t){super.on(e,t)}off(e){super.off(e)}enable(){super.enable(),this.el.classList.remove("ui-resizable-disabled"),this._setupAutoHide(!!this.option.autoHide)}disable(){super.disable(),this.el.classList.add("ui-resizable-disabled"),this._setupAutoHide(!1)}destroy(){this._removeHandlers(),this._setupAutoHide(!1),delete this.el,super.destroy()}updateOption(e){const t=e.handles&&e.handles!==this.option.handles,i=e.autoHide&&e.autoHide!==this.option.autoHide;return Object.assign(this.option,e),t&&(this._removeHandlers(),this._setupHandlers()),i&&this._setupAutoHide(!!this.option.autoHide),this}_setupAutoHide(e){return e?(this.el.classList.add("ui-resizable-autohide"),this.el.addEventListener("mouseover",this._mouseOver),this.el.addEventListener("mouseout",this._mouseOut)):(this.el.classList.remove("ui-resizable-autohide"),this.el.removeEventListener("mouseover",this._mouseOver),this.el.removeEventListener("mouseout",this._mouseOut),Se.overResizeElement===this&&delete Se.overResizeElement),this}_mouseOver(e){Se.overResizeElement||Se.dragElement||(Se.overResizeElement=this,this.el.classList.remove("ui-resizable-autohide"))}_mouseOut(e){Se.overResizeElement===this&&(delete Se.overResizeElement,this.el.classList.add("ui-resizable-autohide"))}_setupHandlers(){return this.handlers=(this.option.handles??"se").split(",").map(e=>e.trim()).map(e=>new To(this.el,e,{element:this.option.element,start:t=>this._resizeStart(t),stop:t=>this._resizeStop(t),move:t=>this._resizing(t,e)})),this}_resizeStart(e){this.sizeToContent=$.shouldSizeToContent(this.el.gridstackNode,!0),this.originalRect=this.el.getBoundingClientRect(),this.scrollEl=$.getScrollElement(this.el),this.scrollY=this.scrollEl.scrollTop,this.scrolled=0,this.startEvent=e,$.pauseIframePointerEvents(!0),this._setupHelper(),this._applyChange();const t=$.initEvent(e,{type:"resizestart",target:this.el});return this.option.start&&this.option.start(t,this._ui()),this.el.classList.add("ui-resizable-resizing"),this.triggerEvent("resizestart",t),this}_resizing(e,t){this.scrolled=this.scrollEl.scrollTop-this.scrollY,this.temporalRect=this._getChange(e,t),this._applyChange();const i=$.initEvent(e,{type:"resize",target:this.el});return i.resizeDir=t,i.hasMovedX=this.option.rtl?t.includes("e"):t.includes("w"),i.hasMovedY=t.includes("n"),this.option.resize&&this.option.resize(i,this._ui()),this.triggerEvent("resize",i),this}_resizeStop(e){const t=$.initEvent(e,{type:"resizestop",target:this.el});return $.pauseIframePointerEvents(!1),this._cleanHelper(),this.option.stop&&this.option.stop(t),this.el.classList.remove("ui-resizable-resizing"),this.triggerEvent("resizestop",t),delete this.startEvent,delete this.originalRect,delete this.temporalRect,delete this.scrollY,delete this.scrolled,this}_setupHelper(){this.elOriginStyleVal=Ks._originStyleProp.map(i=>this.el.style[i]);const e=this.el.parentElement;this.parentOriginStylePosition=e.style.position;const t=$.getValuesFromTransformedElement(e);return this.rectScale={x:t.xScale,y:t.yScale},getComputedStyle(e).position.match(/static/)&&(e.style.position="relative"),this.el.style.position="absolute",this.el.style.opacity="0.8",this}_cleanHelper(){return Ks._originStyleProp.forEach((e,t)=>{this.el.style[e]=this.elOriginStyleVal[t]||null}),this.el.parentElement.style.position=this.parentOriginStylePosition||null,this}_getChange(e,t){const i=this.startEvent,n={width:this.originalRect.width,height:this.originalRect.height+this.scrolled,left:this.originalRect.left,right:this.originalRect.right,top:this.originalRect.top-this.scrolled},r=e.clientX-i.clientX,o=this.sizeToContent?0:e.clientY-i.clientY;let a=!1,c=!1;const l=this.option.rtl;!l&&t.indexOf("e")>-1?n.width+=r:l&&t.indexOf("w")>-1?n.width-=r:!l&&t.indexOf("w")>-1?(n.width-=r,n.left+=r,a=!0):l&&t.indexOf("e")>-1&&(n.width+=r,n.right+=r,a=!0),t.indexOf("s")>-1?n.height+=o:t.indexOf("n")>-1&&(n.height-=o,n.top+=o,c=!0);const h=this._constrainSize(n.width,n.height,a,c);return Math.round(n.width)!==Math.round(h.width)&&(!l&&t.indexOf("w")>-1?n.left+=n.width-h.width:l&&t.indexOf("e")>-1&&(n.right-=n.width-h.width),n.width=h.width),Math.round(n.height)!==Math.round(h.height)&&(t.indexOf("n")>-1&&(n.top+=n.height-h.height),n.height=h.height),n}_constrainSize(e,t,i,n){const r=this.option,o=(i?r.maxWidthMoveLeft:r.maxWidth)||Number.MAX_SAFE_INTEGER,a=(r.minWidth??0)/this.rectScale.x||e,c=(n?r.maxHeightMoveUp:r.maxHeight)||Number.MAX_SAFE_INTEGER,l=(r.minHeight??0)/this.rectScale.y||t,h=Math.min(o,Math.max(a,e)),d=Math.min(c,Math.max(l,t));return{width:h,height:d}}_applyChange(){let e={left:0,right:0,top:0,width:0,height:0};if(this.el.style.position==="absolute"){const i=this.el.parentElement,{left:n,right:r,top:o}=i.getBoundingClientRect();e={left:n,right:r,top:o,width:0,height:0}}if(!this.temporalRect)return this;const t=e;return Object.entries(this.temporalRect).forEach(([i,n])=>{if(this.option.rtl?i==="left":i==="right")return;const r=i==="width"||i==="left"||i==="right"?this.rectScale.x:i==="height"||i==="top"?this.rectScale.y:1;let o;i==="right"?o=(e.right-n)*this.rectScale.x+"px":o=(n-t[i])*r+"px",this.el.style[i]=o}),this}_removeHandlers(){return this.handlers.forEach(e=>e.destroy()),delete this.handlers,this}}Ks._originStyleProp=["width","height","position","left","right","top","opacity","zIndex"];const fv='input,textarea,button,select,option,[contenteditable="true"],.ui-resizable-handle';class ss extends Bl{constructor(e,t={}){var r;super(),this.el=e,this.option=t,this.dragTransform={xScale:1,yScale:1,xOffset:0,yOffset:0},this._autoScrollTick=()=>{const o=this.helper,a=this._autoScrollContainer;if(!o||!a){this._stopScrolling();return}const c=this._getClipping(o,a);if(c===0){this._stopScrolling();return}if(!this._autoScrollMaxSpeed){const f=window.innerHeight||document.documentElement.clientHeight;this._autoScrollMaxSpeed=Math.max(f/150,4)}const l=Math.abs(c),h=Math.min(l*.5,this._autoScrollMaxSpeed),d=c>0?h:-h,u=a.scrollTop;if(a.scrollTop+=d,a.scrollTop===u){this._stopScrolling();return}this.dragging&&this.lastDrag&&(this._dragFollow(this.lastDrag),this._callDrag(this.lastDrag)),this._autoScrollAnimId=requestAnimationFrame(this._autoScrollTick)};const i=(r=t==null?void 0:t.handle)==null?void 0:r.substring(1),n=e.gridstackNode;this.dragEls=!i||e.classList.contains(i)?[e]:n!=null&&n.subGrid?[e.querySelector(t.handle)||e]:this.getAllHandles(),this.dragEls.length===0&&(this.dragEls=[e]),this._mouseDown=this._mouseDown.bind(this),this._mouseMove=this._mouseMove.bind(this),this._mouseUp=this._mouseUp.bind(this),this._keyEvent=this._keyEvent.bind(this),this.enable()}getAllHandles(){return Array.from(this.el.querySelectorAll(this.option.handle)).filter(e=>{if(!(e instanceof HTMLElement))return!1;const t=e.closest(".grid-stack-item");return t===this.el||!t})}on(e,t){super.on(e,t)}off(e){super.off(e)}enable(){this.disabled!==!1&&(super.enable(),this.dragEls.forEach(e=>{e.addEventListener("mousedown",this._mouseDown),di&&(e.addEventListener("touchstart",ao),e.addEventListener("pointerdown",co))}),this.el.classList.remove("ui-draggable-disabled"))}disable(e=!1){this.disabled!==!0&&(super.disable(),kl(),this.dragEls.forEach(t=>{t.removeEventListener("mousedown",this._mouseDown),di&&(t.removeEventListener("touchstart",ao),t.removeEventListener("pointerdown",co))}),e||this.el.classList.add("ui-draggable-disabled"))}destroy(){this.dragTimeout&&window.clearTimeout(this.dragTimeout),delete this.dragTimeout,this.mouseDownEvent&&this._mouseUp(this.mouseDownEvent),this.disable(!0),delete this.el,delete this.option,super.destroy()}updateOption(e){return Object.assign(this.option,e),this}refreshHandles(){var n,r;const e=this.disabled;e||this.disable(!0);const t=(r=(n=this.option)==null?void 0:n.handle)==null?void 0:r.substring(1),i=this.el.gridstackNode;this.dragEls=!t||this.el.classList.contains(t)?[this.el]:i!=null&&i.subGrid?[this.el.querySelector(this.option.handle)||this.el]:this.getAllHandles(),this.dragEls.length===0&&(this.dragEls=[this.el]),e||this.enable()}_mouseDown(e){return e.isTrusted&&(vt.touchHandled&&(vt.touchHandled=!1),Se.mouseHandled&&e.timeStamp!==Se.mouseHandledTimeStamp&&delete Se.mouseHandled),Se.mouseHandled||e.button!==0||!this.dragEls.find(t=>t===e.target)&&e.target.closest(fv)||this.option.cancel&&e.target.closest(this.option.cancel)||(this.mouseDownEvent=e,delete this.dragging,delete Se.dragElement,delete Se.dropElement,delete this._autoScrollMaxSpeed,delete this._autoScrollContainer,document.addEventListener("mousemove",this._mouseMove,{capture:!0,passive:!0}),document.addEventListener("mouseup",this._mouseUp,!0),di&&e.currentTarget&&(e.currentTarget.addEventListener("touchmove",lo),e.currentTarget.addEventListener("touchend",on),e.currentTarget.addEventListener("touchcancel",on)),vt.wasDelayed&&this.el.classList.add("ui-draggable-armed"),e.preventDefault(),document.activeElement&&document.activeElement.blur(),Se.mouseHandled=!0,Se.mouseHandledTimeStamp=e.timeStamp),!0}_callDrag(e){if(!this.dragging)return;const t=$.initEvent(e,{target:this.el,type:"drag"});this.option.drag&&this.option.drag(t,this.ui()),this.triggerEvent("drag",t)}_mouseMove(e){var i,n;const t=this.mouseDownEvent;if(this.lastDrag=e,this.dragging)if(this._dragFollow(e),Se.pauseDrag){const r=Number.isInteger(Se.pauseDrag)?Se.pauseDrag:100;this.dragTimeout&&window.clearTimeout(this.dragTimeout),this.dragTimeout=window.setTimeout(()=>this._callDrag(e),r)}else this._callDrag(e);else if(Math.abs(e.x-t.x)+Math.abs(e.y-t.y)>3){this.dragging=!0,$.pauseIframePointerEvents(!0),this.el.classList.remove("ui-draggable-armed"),Se.dragElement=this;const r=(i=this.el.gridstackNode)==null?void 0:i.grid;r?Se.dropElement=(n=r.el.ddElement)==null?void 0:n.ddDroppable:delete Se.dropElement,this.helper=this._createHelper(),this._setupHelperContainmentStyle(),this.dragTransform=$.getValuesFromTransformedElement(this.helperContainment),this.dragOffset=this._getDragOffset(e,this.el,this.helperContainment),this._setupHelperStyle(e);const o=$.initEvent(e,{target:this.el,type:"dragstart"});this.option.start&&this.option.start(o,this.ui()),this.triggerEvent("dragstart",o),document.addEventListener("keydown",this._keyEvent)}return!0}_mouseUp(e){var t,i;if(this._stopScrolling(),this.el.classList.remove("ui-draggable-armed"),document.removeEventListener("mousemove",this._mouseMove,!0),document.removeEventListener("mouseup",this._mouseUp,!0),di&&e.currentTarget&&(e.currentTarget.removeEventListener("touchmove",lo,!0),e.currentTarget.removeEventListener("touchend",on,!0),e.currentTarget.removeEventListener("touchcancel",on,!0)),this.dragging){delete this.dragging,$.pauseIframePointerEvents(!1),(t=this.el.gridstackNode)==null||delete t._origRotate,document.removeEventListener("keydown",this._keyEvent),((i=Se.dropElement)==null?void 0:i.el)===this.el.parentElement&&delete Se.dropElement,this.helperContainment.style.position=this.parentOriginStylePosition||null,this.helper&&this.helper!==this.el&&this.helper.remove(),this._removeHelperStyle();const n=$.initEvent(e,{target:this.el,type:"dragstop"});this.option.stop&&this.option.stop(n),this.triggerEvent("dragstop",n),Se.dropElement&&Se.dropElement.drop(e)}delete this.helper,delete this.mouseDownEvent,delete Se.dragElement,delete Se.dropElement,delete Se.mouseHandled,delete Se.mouseHandledTimeStamp,e.preventDefault()}_keyEvent(e){var n,r;const t=this.el.gridstackNode,i=(t==null?void 0:t.grid)||((r=(n=Se.dropElement)==null?void 0:n.el)==null?void 0:r.gridstack);if(e.key==="Escape")t&&t._origRotate&&(t._orig=t._origRotate,delete t._origRotate),i==null||i.cancelDrag(),this._mouseUp(this.mouseDownEvent);else if(t&&i&&(e.key==="r"||e.key==="R")){if(!$.canBeRotated(t))return;t._origRotate=t._origRotate||{...t._orig},delete t._moving,i.setAnimation(!1).rotate(t.el,{top:-this.dragOffset.offsetTop,left:-this.dragOffset.offsetX}).setAnimation(),t._moving=!0,this.dragOffset=this._getDragOffset(this.lastDrag,t.el,this.helperContainment),this.helper.style.width=this.dragOffset.width+"px",this.helper.style.height=this.dragOffset.height+"px",$.swap(t._orig,"w","h"),delete t._rect,this._mouseMove(this.lastDrag)}}_createHelper(){let e=this.el;return typeof this.option.helper=="function"?e=this.option.helper(this.el):this.option.helper==="clone"&&(e=$.cloneNode(this.el)),e.parentElement||$.appendTo(e,this.option.appendTo==="parent"?this.el.parentElement:this.option.appendTo??"body"),this.dragElementOriginStyle=ss.originStyleProp.map(t=>this.el.style[t]),e}_setupHelperStyle(e){var i,n;this.helper.classList.add("ui-draggable-dragging"),(n=(i=this.el.gridstackNode)==null?void 0:i.grid)==null||n.el.classList.add("grid-stack-dragging");const t=this.helper.style;return t.pointerEvents="none",t.width=this.dragOffset.width+"px",t.height=this.dragOffset.height+"px",t.willChange="left, right, top",t.position="fixed",this._dragFollow(e),t.transition="none",setTimeout(()=>{this.helper&&(t.transition=null)},0),this}_removeHelperStyle(){var t,i,n;this.helper.classList.remove("ui-draggable-dragging"),(i=(t=this.el._gridstackNodeOrig||this.el.gridstackNode)==null?void 0:t.grid)==null||i.el.classList.remove("grid-stack-dragging");const e=(n=this.helper)==null?void 0:n.gridstackNode;if(!(e!=null&&e._isAboutToRemove)&&this.dragElementOriginStyle){const r=this.helper,o=this.dragElementOriginStyle,a=ss.originStyleProp.indexOf("transition"),c=o[a]||null;r.style.transition=o[a]="none";const l=r.style;ss.originStyleProp.forEach((h,d)=>l[h]=o[d]||null),setTimeout(()=>r.style.transition=c||"",50)}return delete this.dragElementOriginStyle,this}_dragFollow(e){const t=this.helper.style,i=this.dragOffset;this.option.rtl?(t.right=(window.innerWidth-e.clientX+i.offsetX)*this.dragTransform.xScale+"px",t.left&&(t.left="")):(t.left=(e.clientX+i.offsetX)*this.dragTransform.xScale+"px",t.right&&(t.right="")),t.top=(e.clientY+i.offsetTop)*this.dragTransform.yScale+"px"}_setupHelperContainmentStyle(){return this.helperContainment=this.helper.parentElement,this.helper.style.position!=="fixed"&&(this.parentOriginStylePosition=this.helperContainment.style.position,getComputedStyle(this.helperContainment).position.match(/static/)&&(this.helperContainment.style.position="relative")),this}_getDragOffset(e,t,i){let n=0,r=0;i&&(n=this.dragTransform.xOffset,r=this.dragTransform.yOffset);const o=t.getBoundingClientRect();let a=this.option.rtl?o.right:o.left,c=this.option.rtl?e.clientX-o.right+n:-e.clientX+o.left-n;return{x:a,top:o.top,offsetX:c,offsetTop:-e.clientY+o.top-r,width:o.width*this.dragTransform.xScale,height:o.height*this.dragTransform.yScale}}updateScrollPosition(e){this._autoScrollContainer=$.getScrollElement(e),this._getClipping(this.helper,this._autoScrollContainer)===0?this._stopScrolling():this._autoScrollAnimId||(this._autoScrollAnimId=requestAnimationFrame(this._autoScrollTick))}_getClipping(e,t){const i=e.getBoundingClientRect(),n=t.getBoundingClientRect(),r=window.innerHeight||document.documentElement.clientHeight;if(i.bottom<n.top||i.top>n.bottom)return 0;const o=i.bottom-Math.min(n.bottom,r),a=i.top-Math.max(n.top,0);return a<0?a:o>0?o:0}_stopScrolling(){this._autoScrollAnimId&&(cancelAnimationFrame(this._autoScrollAnimId),delete this._autoScrollAnimId)}ui(){const t=this.el.parentElement.getBoundingClientRect(),i=this.helper.getBoundingClientRect(),n=this.option.rtl?(t.right-i.right)*this.dragTransform.xScale:(i.left-t.left)*this.dragTransform.xScale;return{position:{top:(i.top-t.top)*this.dragTransform.yScale,left:n}}}}ss.originStyleProp=["width","height","transform","transform-origin","transition","pointerEvents","position","left","right","top","minWidth","willChange"];class pv extends Bl{constructor(e,t={}){super(),this.el=e,this.option=t,this._mouseEnter=this._mouseEnter.bind(this),this._mouseLeave=this._mouseLeave.bind(this),this.eventEl=this.el.closest(".grid-stack-item")||this.el,this.enable(),this._setupAccept()}on(e,t){super.on(e,t)}off(e){super.off(e)}enable(){this.disabled!==!1&&(super.enable(),this.el.classList.add("ui-droppable"),this.el.classList.remove("ui-droppable-disabled"),this.eventEl.addEventListener("mouseenter",this._mouseEnter),this.eventEl.addEventListener("mouseleave",this._mouseLeave),di&&(this.eventEl.addEventListener("pointerenter",Fh),this.eventEl.addEventListener("pointerleave",Oh)))}disable(e=!1){this.disabled!==!0&&(super.disable(),this.el.classList.remove("ui-droppable"),e||this.el.classList.add("ui-droppable-disabled"),this.eventEl.removeEventListener("mouseenter",this._mouseEnter),this.eventEl.removeEventListener("mouseleave",this._mouseLeave),di&&(this.eventEl.removeEventListener("pointerenter",Fh),this.eventEl.removeEventListener("pointerleave",Oh)))}destroy(){this.disable(!0),this.el.classList.remove("ui-droppable"),this.el.classList.remove("ui-droppable-disabled"),super.destroy()}updateOption(e){return Object.assign(this.option,e),this._setupAccept(),this}_mouseEnter(e){if(!Se.dragElement||vt.touchHandled&&e.isTrusted||!this._canDrop(Se.dragElement.el))return;e.preventDefault(),e.stopPropagation(),Se.dragElement._stopScrolling(),Se.dropElement&&Se.dropElement!==this&&Se.dropElement._mouseLeave(e,!0),Se.dropElement=this;const t=$.initEvent(e,{target:this.el,type:"dropover"});this.option.over&&this.option.over(t,this._ui(Se.dragElement)),this.triggerEvent("dropover",t),this.el.classList.add("ui-droppable-over")}_mouseLeave(e,t=!1){var n;if(!Se.dragElement||Se.dropElement!==this)return;e.preventDefault(),e.stopPropagation(),t&&Se.dragElement._stopScrolling();const i=$.initEvent(e,{target:this.el,type:"dropout"});if(this.option.out&&this.option.out(i,this._ui(Se.dragElement)),this.triggerEvent("dropout",i),Se.dropElement===this&&(delete Se.dropElement,!t)){let r,o=this.el.parentElement;for(;!r&&o;)r=(n=o.ddElement)==null?void 0:n.ddDroppable,o=o.parentElement;r&&r._mouseEnter(e)}}drop(e){e.preventDefault();const t=$.initEvent(e,{target:this.el,type:"drop"});this.option.drop&&this.option.drop(t,this._ui(Se.dragElement)),this.triggerEvent("drop",t)}_canDrop(e){return e&&(!this.accept||this.accept(e))}_setupAccept(){return this.option.accept?(typeof this.option.accept=="string"?this.accept=e=>e.classList.contains(this.option.accept)||e.matches(this.option.accept):this.accept=this.option.accept,this):this}_ui(e){return{draggable:e.el,...e.ui()}}}class zl{static init(e){return e.ddElement||(e.ddElement=new zl(e)),e.ddElement}constructor(e){this.el=e}on(e,t){return this.ddDraggable&&["drag","dragstart","dragstop"].indexOf(e)>-1?this.ddDraggable.on(e,t):this.ddDroppable&&["drop","dropover","dropout"].indexOf(e)>-1?this.ddDroppable.on(e,t):this.ddResizable&&["resizestart","resize","resizestop"].indexOf(e)>-1&&this.ddResizable.on(e,t),this}off(e){return this.ddDraggable&&["drag","dragstart","dragstop"].indexOf(e)>-1?this.ddDraggable.off(e):this.ddDroppable&&["drop","dropover","dropout"].indexOf(e)>-1?this.ddDroppable.off(e):this.ddResizable&&["resizestart","resize","resizestop"].indexOf(e)>-1&&this.ddResizable.off(e),this}setupDraggable(e){return this.ddDraggable?this.ddDraggable.updateOption(e):this.ddDraggable=new ss(this.el,e),this}cleanDraggable(){return this.ddDraggable&&(this.ddDraggable.destroy(),delete this.ddDraggable),this}setupResizable(e){return this.ddResizable?this.ddResizable.updateOption(e):this.ddResizable=new Ks(this.el,e),this}cleanResizable(){return this.ddResizable&&(this.ddResizable.destroy(),delete this.ddResizable),this}setupDroppable(e){return this.ddDroppable?this.ddDroppable.updateOption(e):this.ddDroppable=new pv(this.el,e),this}cleanDroppable(){return this.ddDroppable&&(this.ddDroppable.destroy(),delete this.ddDroppable),this}}class mv{resizable(e,t,i,n){return this._getDDElements(e,typeof t=="string"?t:void 0).forEach(r=>{if(t==="disable"||t==="enable")r.ddResizable&&r.ddResizable[t]();else if(t==="destroy")r.ddResizable&&r.cleanResizable();else if(t==="option")r.setupResizable({[i]:n});else{const a=r.el.gridstackNode.grid;let c=r.el.getAttribute("gs-resize-handles")||a.opts.resizable.handles||"e,s,se";c==="all"&&(c="n,e,s,w,se,sw,ne,nw");const l=!a.opts.alwaysShowResizeHandle,h=t;r.setupResizable({...a.opts.resizable,handles:c,autoHide:l,start:h.start,stop:h.stop,resize:h.resize,rtl:h.rtl})}}),this}draggable(e,t,i,n){return this._getDDElements(e,typeof t=="string"?t:void 0).forEach(r=>{if(t==="disable"||t==="enable")r.ddDraggable&&r.ddDraggable[t]();else if(t==="destroy")r.ddDraggable&&r.cleanDraggable();else if(t==="option")r.setupDraggable({[i]:n});else{const o=r.el.gridstackNode.grid,a=t;r.setupDraggable({...o.opts.draggable,start:a.start,stop:a.stop,drag:a.drag,rtl:a.rtl})}}),this}dragIn(e,t){return this._getDDElements(e).forEach(i=>i.setupDraggable(t)),this}droppable(e,t,i,n){if(typeof t!="string"){const o=t;typeof o.accept=="function"&&!o._accept&&(o._accept=o.accept,o.accept=a=>o._accept(a))}const r=typeof t=="string"?t:void 0;return this._getDDElements(e,r).forEach(o=>{t==="disable"||t==="enable"?o.ddDroppable&&o.ddDroppable[t]():t==="destroy"?o.ddDroppable&&o.cleanDroppable():t==="option"?o.setupDroppable({[i]:n}):o.setupDroppable(t)}),this}isDroppable(e){var t;return!!((t=e==null?void 0:e.ddElement)!=null&&t.ddDroppable&&!e.ddElement.ddDroppable.disabled)}isDraggable(e){var t;return!!((t=e==null?void 0:e.ddElement)!=null&&t.ddDraggable&&!e.ddElement.ddDraggable.disabled)}isResizable(e){var t;return!!((t=e==null?void 0:e.ddElement)!=null&&t.ddResizable&&!e.ddElement.ddResizable.disabled)}on(e,t,i){return this._getDDElements(e).forEach(n=>n.on(t,r=>{i(r,Se.dragElement?Se.dragElement.el:r.target,Se.dragElement?Se.dragElement.helper:void 0)})),this}off(e,t){return this._getDDElements(e).forEach(i=>i.off(t)),this}_getDDElements(e,t){const i=e.gridstack||t!=="destroy"&&t!=="disable",n=$.getElements(e);return n.length?n.map(o=>o.ddElement||(i?zl.init(o):null)).filter(o=>!!o):[]}}/*!
 * GridStack 13.3.0
 * https://gridstackjs.com/
 *
 * Copyright (c) 2021-2025  Alain Dumesny
 * see root license https://github.com/gridstack/gridstack.js/tree/master/LICENSE
 */const Gt=new mv;class Ce{static init(e={},t=".grid-stack"){if(typeof document>"u")return null;const i=Ce.getGridElement(t);return i?(i.gridstack||(i.gridstack=new Ce(i,$.cloneDeep(e))),i.gridstack):(console.error(typeof t=="string"?'GridStack.initAll() no grid was found with selector "'+t+`" - element missing or wrong selector ?
Note: ".grid-stack" is required for proper CSS styling and drag/drop, and is the default selector.`:"GridStack.init() no grid element was passed."),null)}static initAll(e={},t=".grid-stack"){const i=[];return typeof document>"u"||(Ce.getGridElements(t).forEach(n=>{n.gridstack||(n.gridstack=new Ce(n,$.cloneDeep(e))),i.push(n.gridstack)}),i.length===0&&console.error('GridStack.initAll() no grid was found with selector "'+t+`" - element missing or wrong selector ?
Note: ".grid-stack" is required for proper CSS styling and drag/drop, and is the default selector.`)),i}static addGrid(e,t={}){if(!e)return null;let i=e;if(i.gridstack){const o=i.gridstack;return t&&(o.opts={...o.opts,...t}),t.children!==void 0&&o.load(t.children),o}return(!e.classList.contains("grid-stack")||Ce.addRemoveCB)&&(Ce.addRemoveCB?i=Ce.addRemoveCB(e,t,!0,!0):i=$.createDiv(["grid-stack",t.class],e)),Ce.init(t,i)}static registerEngine(e){Ce.engineClass=e}get placeholder(){if(!this._placeholder){this._placeholder=$.createDiv([this.opts.placeholderClass,jt.itemClass,this.opts.itemClass]);const e=$.createDiv(["placeholder-content"],this._placeholder);this.opts.placeholderText&&(e.textContent=this.opts.placeholderText)}return this._placeholder}constructor(e,t={}){var l;this.el=e,this.opts=t,this.animationDelay=310,this._gsEventHandler={},this._extraDragRow=0,this.dragTransform={xScale:1,yScale:1,xOffset:0,yOffset:0},e.gridstack=this,this.opts=t=t||{},e.classList.contains("grid-stack")||this.el.classList.add("grid-stack"),t.row&&(t.minRow=t.maxRow=t.row,delete t.row);const i=$.toNumber(e.getAttribute("gs-row"));t.column==="auto"&&delete t.column,t.alwaysShowResizeHandle!==void 0&&(t._alwaysShowResizeHandle=t.alwaysShowResizeHandle);const n=t.columnOpts;if(n){const h=n.breakpoints;!n.columnWidth&&!(h!=null&&h.length)?delete t.columnOpts:h&&h.length>1?(h.sort((d,u)=>(u.w||0)-(d.w||0)),delete n.columnWidth):n.columnMax=n.columnMax||12}const r={...$.cloneDeep(jt),column:$.toNumber(e.getAttribute("gs-column"))||jt.column,minRow:i||$.toNumber(e.getAttribute("gs-min-row"))||jt.minRow,maxRow:i||$.toNumber(e.getAttribute("gs-max-row"))||jt.maxRow,staticGrid:$.toBool(e.getAttribute("gs-static"))||jt.staticGrid,sizeToContent:$.toBool(e.getAttribute("gs-size-to-content"))||void 0,draggable:{handle:(t.handleClass?"."+t.handleClass:t.handle?t.handle:"")||jt.draggable.handle},removableOptions:{accept:t.itemClass||jt.removableOptions.accept,decline:jt.removableOptions.decline}};e.getAttribute("gs-animate")&&(r.animate=$.toBool(e.getAttribute("gs-animate"))),t=$.defaults(t,r),this._initMargin(),this.checkDynamicColumn(),this._updateColumnVar(t),t.rtl==="auto"&&(t.rtl=e.style.direction==="rtl"),t.rtl&&this.el.classList.add("grid-stack-rtl");const o=this.el.closest("."+jt.itemClass),a=o==null?void 0:o.gridstackNode;if(a&&(a.subGrid=this,this.parentGridNode=a,this.el.classList.add("grid-stack-nested"),a.el.classList.add("grid-stack-sub-grid")),this._isAutoCellHeight=t.cellHeight==="auto",this._isAutoCellHeight||t.cellHeight==="initial")this.cellHeight(void 0);else{typeof t.cellHeight=="number"&&t.cellHeightUnit&&t.cellHeightUnit!==jt.cellHeightUnit&&(t.cellHeight=t.cellHeight+t.cellHeightUnit,delete t.cellHeightUnit);const h=t.cellHeight;delete t.cellHeight,this.cellHeight(h)}t.alwaysShowResizeHandle==="mobile"&&(t.alwaysShowResizeHandle=di),this._setStaticClass();const c=t.engineClass||Ce.engineClass||Ui;if(this.engine=new c({column:this.getColumn(),float:t.float,maxRow:t.maxRow,onChange:h=>{h.forEach(d=>{const u=d.el;u&&(d._removeDOM?(u&&u.remove(),delete d._removeDOM):this._writePosAttr(u,d))}),this._updateContainerHeight()}}),t.auto&&(this.batchUpdate(),this.engine._loading=!0,this.getGridItems().forEach(h=>this._prepareElement(h)),delete this.engine._loading,this.batchUpdate(!1)),t.children){const h=t.children;delete t.children,h.length&&this.load(h)}this.setAnimation(),t.subGridDynamic&&!Se.pauseDrag&&(Se.pauseDrag=!0),((l=t.draggable)==null?void 0:l.pause)!==void 0&&(Se.pauseDrag=t.draggable.pause),this._setupRemoveDrop(),this._setupAcceptWidget(),this._updateResizeEvent()}_updateColumnVar(e=this.opts){this.el.classList.add("gs-"+e.column),typeof e.column=="number"&&(this.el.style.setProperty("--gs-column-width",`${100/e.column}%`),this.el.style.setProperty("--gs-columns",String(e.column)))}addWidget(e){if(!e)return;if(typeof e=="string"){console.error("V11: GridStack.addWidget() does not support string anymore. see #2736");return}if(e.ELEMENT_NODE)return console.error("V11: GridStack.addWidget() does not support HTMLElement anymore. use makeWidget()"),this.makeWidget(e);let t,i=e;if(i.grid=this,i.el?t=i.el:Ce.addRemoveCB?t=Ce.addRemoveCB(this.el,e,!0,!1):t=this.createWidgetDivs(i),!t)return;if(i=t.gridstackNode,i&&t.parentElement===this.el&&this.engine.nodes.find(r=>r._id===i._id))return t;const n=this._readAttr(t);return $.defaults(e,n),this.engine.prepareNode(e),this.el.appendChild(t),this.makeWidget(t,e),t}createWidgetDivs(e){const t=$.createDiv(["grid-stack-item",this.opts.itemClass]),i=$.createDiv(["grid-stack-item-content"],t);return $.lazyLoad(e)?e.visibleObservable||(e.visibleObservable=new IntersectionObserver(([n])=>{var r,o;n.isIntersecting&&((r=e.visibleObservable)==null||r.disconnect(),delete e.visibleObservable,Ce.renderCB(i,e),(o=e.grid)==null||o.prepareDragDrop(e.el))}),window.setTimeout(()=>{var n;return(n=e.visibleObservable)==null?void 0:n.observe(t)})):Ce.renderCB(i,e),t}makeSubGrid(e,t,i,n=!0){var f,g,v;let r=e.gridstackNode;if(r||(r=this.makeWidget(e).gridstackNode),(f=r.subGrid)!=null&&f.el)return r.subGrid;let o,a=this;for(;a&&!o;)o=(g=a.opts)==null?void 0:g.subGridOpts,a=(v=a.parentGridNode)==null?void 0:v.grid;t=$.cloneDeep({...this.opts,id:void 0,children:void 0,column:"auto",columnOpts:void 0,layout:"list",subGridOpts:void 0,...o||{},...t||r.subGridOpts||{}}),r.subGridOpts=t;let c=!1;t.column==="auto"&&(c=!0,t.column=Math.max(r.w||1,(i==null?void 0:i.w)||1),delete t.columnOpts);let l=r.el.querySelector(".grid-stack-item-content"),h,d;if(n&&(this._removeDD(r.el),d={...r,x:0,y:0},$.removeInternalForSave(d),delete d.subGridOpts,r.content&&(d.content=r.content,delete r.content),Ce.addRemoveCB?h=Ce.addRemoveCB(this.el,d,!0,!1)||void 0:(h=$.createDiv(["grid-stack-item"]),h.appendChild(l),l=$.createDiv(["grid-stack-item-content"],r.el)),this.prepareDragDrop(r.el)),i){const m=c?t.column:r.w,p=r.h+i.h,T=r.el.style;T.transition="none",this.update(r.el,{w:m,h:p}),setTimeout(()=>T.transition="")}const u=r.subGrid=Ce.addGrid(l,t)||void 0;return i!=null&&i._moving&&(u._isTemp=!0),c&&(u._autoColumn=!0),n&&u.makeWidget(h,d),i&&(i._moving?window.setTimeout(()=>$.simulateMouseEvent(i._event,"mouseenter",u.el),0):u.makeWidget(r.el,r)),this.resizeToContentCheck(!1,r),u}removeAsSubGrid(e){var i,n;const t=(i=this.parentGridNode)==null?void 0:i.grid;if(t&&(t.batchUpdate(),t.removeWidget(this.parentGridNode.el,!0,!0),this.engine.nodes.forEach(r=>{r.x=(r.x??0)+(this.parentGridNode.x??0),r.y=(r.y??0)+(this.parentGridNode.y??0),this._removeDD(r.el),r.el.remove(),delete r.el.gridstackNode,t.makeWidget(r.el,r)}),t.batchUpdate(!1),this.parentGridNode&&delete this.parentGridNode.subGrid,delete this.parentGridNode,e)){const r=(n=e.el)==null?void 0:n.gridstackNode;r&&r!==e&&(r._temporaryRemoved=!0),window.setTimeout(()=>{var a;const o=((a=Se.dragElement)==null?void 0:a.lastDrag)||e._event;o&&$.simulateMouseEvent(o,"mouseenter",t.el)},0)}}save(e=!0,t=!1,i=Ce.saveCB,n){const r=this.engine.save(e,i,n);if(r.forEach(o=>{var a;if(e&&o.el&&!o.subGrid&&!i){const c=o.el.querySelector(".grid-stack-item-content");o.content=c==null?void 0:c.innerHTML,o.content||delete o.content}else if(!e&&!i&&delete o.content,(a=o.subGrid)!=null&&a.el){const c=o.w||o.subGrid.getColumn(),l=o.subGrid.save(e,t,i,c);o.subGridOpts=t?l:{children:l},delete o.subGrid}delete o.el}),t){const o=$.cloneDeep(this.opts);o.marginBottom===o.marginTop&&o.marginRight===o.marginLeft&&o.marginTop===o.marginRight&&(o.margin=o.marginTop,delete o.marginTop,delete o.marginRight,delete o.marginBottom,delete o.marginLeft),o.rtl===(this.el.style.direction==="rtl")&&(o.rtl="auto"),this._isAutoCellHeight&&(o.cellHeight="auto"),this._autoColumn&&(o.column="auto");const a=o._alwaysShowResizeHandle;return delete o._alwaysShowResizeHandle,a!==void 0?o.alwaysShowResizeHandle=a:delete o.alwaysShowResizeHandle,$.removeInternalAndSame(o,jt),o.children=r,o}return r}load(e,t=Ce.addRemoveCB||!0){e.forEach(h=>{h.w=h.w||h.minW||1,h.h=h.h||h.minH||1}),e=$.sort(e),this.engine.skipCacheUpdate=this._ignoreLayoutsNodeChange=!0;let i=0;e.forEach(h=>{i=Math.max(i,(h.x||0)+h.w)}),i>this.engine.defaultColumn&&(this.engine.defaultColumn=i);const n=this.getColumn();i>n&&(this.engine.nodes.length===0&&this.responseLayout?(this.engine.nodes=e,this.engine.columnChanged(i,n,this.responseLayout),e=this.engine.nodes,this.engine.nodes=[],delete this.responseLayout):this.engine.cacheLayout(e,i,!0));const r=Ce.addRemoveCB;typeof t=="function"&&(Ce.addRemoveCB=t);const o=[];this.batchUpdate();const a=!this.engine.nodes.length,c=a&&this.opts.animate;c&&this.setAnimation(!1),!a&&t&&[...this.engine.nodes].forEach(d=>{if(!d.id)return;$.find(e,d.id)||(Ce.addRemoveCB&&Ce.addRemoveCB(this.el,d,!1,!1),o.push(d),this.removeWidget(d.el,!0,!1))}),this.engine._loading=!0;const l=[];return this.engine.nodes=this.engine.nodes.filter(h=>h.id&&$.find(e,h.id)?(l.push(h),!1):!0),e.forEach(h=>{var u;const d=h.id?$.find(l,h.id):void 0;if(d){if($.shouldSizeToContent(d)&&(h.h=d.h),this.engine.nodeBoundFix(h),(h.autoPosition||h.x===void 0||h.y===void 0)&&(h.w=h.w||d.w,h.h=h.h||d.h,this.engine.findEmptyPosition(h)),this.engine.nodes.push(d),$.samePos(d,h)&&this.engine.nodes.length>1&&(this.moveNode(d,{...h,forceCollide:!0}),$.copyPos(h,d)),this.update(d.el,h),(u=h.subGridOpts)!=null&&u.children){const f=d.el.querySelector(".grid-stack");f&&f.gridstack&&f.gridstack.load(h.subGridOpts.children)}}else t&&this.addWidget(h)}),delete this.engine._loading,this.engine.removedNodes=o,this.batchUpdate(!1),delete this._ignoreLayoutsNodeChange,delete this.engine.skipCacheUpdate,r?Ce.addRemoveCB=r:delete Ce.addRemoveCB,c&&this.setAnimation(!0,!0),this}batchUpdate(e=!0){return this.engine.batchUpdate(e),e||(this._updateContainerHeight(),this._triggerRemoveEvent(),this._triggerAddEvent(),this._triggerChangeEvent()),this}getCellHeight(e=!1){if(this.opts.cellHeight&&this.opts.cellHeight!=="auto"&&(!e||!this.opts.cellHeightUnit||this.opts.cellHeightUnit==="px"))return this.opts.cellHeight;if(this.opts.cellHeightUnit==="rem")return this.opts.cellHeight*parseFloat(getComputedStyle(document.documentElement).fontSize);if(this.opts.cellHeightUnit==="em")return this.opts.cellHeight*parseFloat(getComputedStyle(this.el).fontSize);if(this.opts.cellHeightUnit==="cm")return this.opts.cellHeight*(96/2.54);if(this.opts.cellHeightUnit==="mm")return this.opts.cellHeight*(96/2.54)/10;const t=this.el.querySelector("."+this.opts.itemClass);if(t){const n=$.toNumber(t.getAttribute("gs-h"))||1;return Math.round(t.offsetHeight/n)}const i=parseInt(this.el.getAttribute("gs-current-row")||"0");return i?Math.round(this.el.getBoundingClientRect().height/i):this.opts.cellHeight}cellHeight(e){if(e!==void 0&&this._isAutoCellHeight!==(e==="auto")&&(this._isAutoCellHeight=e==="auto",this._updateResizeEvent()),(e==="initial"||e==="auto")&&(e=void 0),e===void 0){const i=-this.opts.marginRight-this.opts.marginLeft+this.opts.marginTop+this.opts.marginBottom;e=this.cellWidth()+i}const t=$.parseHeight(e);return this.opts.cellHeightUnit===t.unit&&this.opts.cellHeight===t.h?this:(this.opts.cellHeightUnit=t.unit,this.opts.cellHeight=t.h,this.el.style.setProperty("--gs-cell-height",`${this.opts.cellHeight}${this.opts.cellHeightUnit}`),this._updateContainerHeight(),this.resizeToContentCheck(),this)}cellWidth(){return this._widthOrContainer()/this.getColumn()}_widthOrContainer(e=!1){var t;return e&&((t=this.opts.columnOpts)!=null&&t.breakpointForWindow)?window.innerWidth:this.el.clientWidth||this.el.parentElement.clientWidth||window.innerWidth}checkDynamicColumn(){var r,o;const e=this.opts.columnOpts;if(!e||!e.columnWidth&&!((r=e.breakpoints)!=null&&r.length))return!1;const t=this.getColumn();let i=t;const n=this._widthOrContainer(!0);if(e.columnWidth)i=Math.min(Math.round(n/e.columnWidth)||1,e.columnMax);else{i=e.columnMax;let a=0;for(;a<e.breakpoints.length&&n<=e.breakpoints[a].w;)i=e.breakpoints[a++].c||t}if(i!==t){const a=(o=e.breakpoints)==null?void 0:o.find(c=>c.c===i);return this.column(i,(a==null?void 0:a.layout)||e.layout),!0}return!1}compact(e="compact",t=!0){return this.engine.compact(e,t),this._triggerChangeEvent(),this}column(e,t="moveScale"){if(!e||e<1||this.opts.column===e)return this;const i=this.getColumn();return this.opts.column=e,this.engine?(this.engine.column=e,this.el.classList.remove("gs-"+i),this._updateColumnVar(),this.engine.columnChanged(i,e,t),this._isAutoCellHeight&&this.cellHeight(),this.resizeToContentCheck(!0),this._ignoreLayoutsNodeChange=!0,this._triggerChangeEvent(),delete this._ignoreLayoutsNodeChange,this):(this.responseLayout=t,this)}getColumn(){return this.opts.column}getGridItems(){return Array.from(this.el.children).filter(e=>e.matches("."+this.opts.itemClass)&&!e.matches("."+this.opts.placeholderClass))}isIgnoreChangeCB(){return!!this._ignoreLayoutsNodeChange}destroy(e=!0){var t;return this.el?(this.offAll(),this._updateResizeEvent(!0),this.setStatic(!0,!1),this.setAnimation(!1),e?this.el.parentNode.removeChild(this.el):(this.removeAll(e),this.el.removeAttribute("gs-current-row")),this.parentGridNode&&delete this.parentGridNode.subGrid,delete this.parentGridNode,delete this.opts,(t=this._placeholder)==null||delete t.gridstackNode,delete this._placeholder,delete this.engine,delete this.el.gridstack,delete this.el,this):this}float(e){return this.opts.float!==e&&(this.opts.float=this.engine.float=e,this._triggerChangeEvent()),this}getFloat(){return this.engine.float}getCellFromPixel(e,t=!1){const i=this.el.getBoundingClientRect();let n;t?n={top:i.top+document.documentElement.scrollTop,left:i.left}:n={top:this.el.offsetTop,left:this.el.offsetLeft};const r=e.left-n.left,o=e.top-n.top,a=i.width/this.getColumn(),c=i.height/parseInt(this.el.getAttribute("gs-current-row")||"0");return{x:Math.floor(r/a),y:Math.floor(o/c)}}getRow(){return Math.max(this.engine.getRow(),this.opts.minRow||0)}isAreaEmpty(e,t,i,n){return this.engine.isAreaEmpty(e,t,i,n)}makeWidget(e,t){const i=Ce.getElement(e);if(!i||i.gridstackNode)return i;i.parentElement||this.el.appendChild(i),this._prepareElement(i,!0,t);const n=i.gridstackNode;this._updateContainerHeight(),n.subGridOpts&&this.makeSubGrid(i,n.subGridOpts,void 0,!1);let r=!1;return this.opts.column===1&&!this._ignoreLayoutsNodeChange&&(r=this._ignoreLayoutsNodeChange=!0),this._triggerAddEvent(),this._triggerChangeEvent(),r&&delete this._ignoreLayoutsNodeChange,i}on(e,t){return e.indexOf(" ")!==-1?(e.split(" ").forEach(n=>this.on(n,t)),this):(e==="change"||e==="added"||e==="removed"||e==="enable"||e==="disable"?(e==="enable"||e==="disable"?this._gsEventHandler[e]=n=>t(n):this._gsEventHandler[e]=n=>{n.detail&&t(n,n.detail)},this.el.addEventListener(e,this._gsEventHandler[e])):e==="drag"||e==="dragstart"||e==="dragstop"||e==="resizestart"||e==="resize"||e==="resizestop"||e==="dropped"||e==="resizecontent"?this._gsEventHandler[e]=t:console.error("GridStack.on("+e+") event not supported"),this)}off(e){return e.indexOf(" ")!==-1?(e.split(" ").forEach(i=>this.off(i)),this):((e==="change"||e==="added"||e==="removed"||e==="enable"||e==="disable")&&this._gsEventHandler[e]&&this.el.removeEventListener(e,this._gsEventHandler[e]),delete this._gsEventHandler[e],this)}offAll(){return Object.keys(this._gsEventHandler).forEach(e=>this.off(e)),this}removeWidget(e,t=!0,i=!0){return e?(Ce.getElements(e).forEach(n=>{if(n.parentElement&&n.parentElement!==this.el)return;let r=n.gridstackNode;r||(r=this.engine.nodes.find(o=>n===o.el)),r&&(t&&Ce.addRemoveCB&&Ce.addRemoveCB(this.el,r,!1,!1),delete n.gridstackNode,this._removeDD(n),this.engine.removeNode(r,t,i),t&&n.parentElement&&n.remove())}),i&&(this._triggerRemoveEvent(),this._triggerChangeEvent()),this):(console.error("Error: GridStack.removeWidget(undefined) called"),this)}removeAll(e=!0,t=!0){return this.engine.nodes.forEach(i=>{e&&Ce.addRemoveCB&&Ce.addRemoveCB(this.el,i,!1,!1),delete i.el.gridstackNode,this.opts.staticGrid||this._removeDD(i.el)}),this.engine.removeAll(e,t),t&&this._triggerRemoveEvent(),this}setAnimation(e=this.opts.animate,t){return t?setTimeout(()=>{this.opts&&this.setAnimation(e)}):e?this.el.classList.add("grid-stack-animate"):this.el.classList.remove("grid-stack-animate"),this.opts.animate=e,this}hasAnimationCSS(){return this.el.classList.contains("grid-stack-animate")}setStatic(e,t=!0,i=!0){return!!this.opts.staticGrid===e?this:(e?this.opts.staticGrid=!0:delete this.opts.staticGrid,this._setupRemoveDrop(),this._setupAcceptWidget(),this.engine.nodes.forEach(n=>{this.prepareDragDrop(n.el),n.subGrid&&i&&n.subGrid.setStatic(e,t,i)}),t&&this._setStaticClass(),this)}updateOptions(e){var i;const t=this.opts;if(e===t)return this;if(e.acceptWidgets!==void 0&&(t.acceptWidgets=e.acceptWidgets,this._setupAcceptWidget()),e.animate!==void 0&&this.setAnimation(e.animate),e.cellHeight&&this.cellHeight(e.cellHeight),e.class!==void 0&&e.class!==t.class&&(t.class&&this.el.classList.remove(t.class),e.class&&this.el.classList.add(e.class)),e.columnOpts){const n=!!this.opts.columnOpts;this.opts.columnOpts=e.columnOpts,n!==!!this.opts.columnOpts&&this._updateResizeEvent(),this.checkDynamicColumn()}else e.columnOpts===null&&this.opts.columnOpts?(delete this.opts.columnOpts,this._updateResizeEvent()):typeof e.column=="number"&&this.column(e.column);return e.margin!==void 0&&this.margin(e.margin),e.staticGrid!==void 0&&this.setStatic(e.staticGrid),e.disableDrag!==void 0&&!e.staticGrid&&this.enableMove(!e.disableDrag),e.disableResize!==void 0&&!e.staticGrid&&this.enableResize(!e.disableResize),e.float!==void 0&&this.float(e.float),e.row!==void 0?(t.minRow=t.maxRow=this.engine.maxRow=t.row=e.row,this._updateContainerHeight(),this.engine.getRow()>e.row&&this.compact()):(e.minRow!==void 0&&(t.minRow=e.minRow,this._updateContainerHeight()),e.maxRow!==void 0&&(t.maxRow=this.engine.maxRow=e.maxRow,this.engine.getRow()>e.maxRow&&this.compact())),e.lazyLoad!==void 0&&(t.lazyLoad=e.lazyLoad),(i=e.children)!=null&&i.length&&this.load(e.children),this}update(e,t){return Ce.getElements(e).forEach(i=>{var u;const n=i==null?void 0:i.gridstackNode;if(!n)return;const r={...$.copyPos({},n),...$.cloneDeep(t)};this.engine.nodeBoundFix(r),delete r.autoPosition;const o=["x","y","w","h"];let a;const c=r,l=n;if(o.some(f=>c[f]!==void 0&&c[f]!==l[f])){a={};const f=a;o.forEach(g=>{f[g]=c[g]!==void 0?c[g]:l[g],delete c[g]})}if(!a&&(r.minW||r.minH||r.maxW||r.maxH)&&(a={}),r.content!==void 0){const f=i.querySelector(".grid-stack-item-content");f&&f.textContent!==r.content&&(n.content=r.content,Ce.renderCB(f,r),(u=n.subGrid)!=null&&u.el&&(f.appendChild(n.subGrid.el),n.subGrid._updateContainerHeight())),delete r.content}let h=!1,d=!1;for(const f in c)f[0]!=="_"&&l[f]!==c[f]&&(l[f]=c[f],h=!0,d=d||!this.opts.staticGrid&&(f==="noResize"||f==="noMove"||f==="locked"));if($.sanitizeMinMax(n),a){const f=a.w!==void 0&&a.w!==n.w;this.moveNode(n,a),f&&n.subGrid?n.subGrid.onResize(this.hasAnimationCSS()?n.w:void 0):this.resizeToContentCheck(f,n),delete n._orig}(a||h)&&this._writeAttr(i,n),d&&this.prepareDragDrop(n.el),Ce.updateCB&&Ce.updateCB(n)}),this}moveNode(e,t){const i=e._updating;i||this.engine.cleanNodes().beginUpdate(e),this.engine.moveNode(e,t),this._updateContainerHeight(),i||(this._triggerChangeEvent(),this.engine.endUpdate())}resizeToContent(e){var u,f;if(!e||(e.classList.remove("size-to-content-max"),!e.clientHeight))return;const t=e.gridstackNode;if(!t)return;const i=t.grid;if(!i||e.parentElement!==i.el)return;const n=i.getCellHeight(!0);if(!n)return;let r=t.h?t.h*n:e.clientHeight,o=null;if(t.resizeToContentParent&&(o=e.querySelector(t.resizeToContentParent)),o||(o=e.querySelector(Ce.resizeToContentParent)),!o)return;const a=e.clientHeight-o.clientHeight,c=t.h?t.h*n-a:o.clientHeight;let l;if(t.subGrid){l=t.subGrid.getRow()*t.subGrid.getCellHeight(!0);const g=t.subGrid.el.getBoundingClientRect(),v=e.getBoundingClientRect();l+=g.top-v.top}else{if((f=(u=t.subGridOpts)==null?void 0:u.children)!=null&&f.length)return;{const g=o.firstElementChild;if(!g){console.error(`Error: GridStack.resizeToContent() widget id:${t.id} '${Ce.resizeToContentParent}'.firstElementChild is null, make sure to have a div like container. Skipping sizing.`);return}l=g.getBoundingClientRect().height||c}}if(c===l)return;r+=l-c;let h=Math.ceil(r/n);const d=Number.isInteger(t.sizeToContent)?t.sizeToContent:0;d&&h>d&&(h=d,e.classList.add("size-to-content-max")),t.minH&&h<t.minH?h=t.minH:t.maxH&&h>t.maxH&&(h=t.maxH),h!==t.h&&(i._ignoreLayoutsNodeChange=!0,i.moveNode(t,{h}),delete i._ignoreLayoutsNodeChange)}resizeToContentCBCheck(e){Ce.resizeToContentCB?Ce.resizeToContentCB(e):this.resizeToContent(e)}rotate(e,t){return Ce.getElements(e).forEach(i=>{const n=i.gridstackNode;if(!n||!$.canBeRotated(n))return;const r={w:n.h,h:n.w,minH:n.minW,minW:n.minH,maxH:n.maxW,maxW:n.maxH};if(t){const c=t.left>0?Math.floor(t.left/this.cellWidth()):0,l=t.top>0?Math.floor(t.top/this.opts.cellHeight):0;r.x=n.x+c-(n.h-(l+1)),r.y=n.y+l-c}const o=r;Object.keys(o).forEach(c=>{o[c]===void 0&&delete o[c]});const a=n._orig;this.update(i,r),n._orig=a}),this}margin(e){if(!(typeof e=="string"&&e.split(" ").length>1)){const i=$.parseHeight(e);if(this.opts.marginUnit===i.unit&&this.opts.margin===i.h)return this}return this.opts.margin=e,this.opts.marginTop=this.opts.marginBottom=this.opts.marginLeft=this.opts.marginRight=void 0,this._initMargin(),this}getMargin(){return this.opts.margin}willItFit(e){return this.engine.willItFit(e)}_triggerChangeEvent(){if(this.engine.batchMode)return this;const e=this.engine.getDirtyNodes(!0);return e&&e.length&&(this._ignoreLayoutsNodeChange||this.engine.layoutsNodesChange(e),this._triggerEvent("change",e)),this.engine.saveInitial(),this._sortDom(),this}_sortDom(){var i;let e=this.engine.nodes;if(e.forEach(n=>{n.subGrid&&n.subGrid._sortDom()}),e.length<2)return this;this.engine.sortNodes(),e=this.engine.nodes;const t=this.el.children;if(e.some((n,r)=>n.el!==t[r])){const n=(i=this.el.moveBefore)==null?void 0:i.bind(this.el);e.forEach(r=>{r.el&&r.el.parentElement===this.el&&(n?n(r.el,null):this.el.appendChild(r.el))})}return this}_triggerAddEvent(){var e;if(this.engine.batchMode)return this;if((e=this.engine.addedNodes)!=null&&e.length){this._ignoreLayoutsNodeChange||this.engine.layoutsNodesChange(this.engine.addedNodes),this.engine.addedNodes.forEach(i=>{delete i._dirty});const t=[...this.engine.addedNodes];this.engine.addedNodes=[],this._triggerEvent("added",t)}return this}_triggerRemoveEvent(){var e;if(this.engine.batchMode)return this;if((e=this.engine.removedNodes)!=null&&e.length){const t=[...this.engine.removedNodes];this.engine.removedNodes=[],this._triggerEvent("removed",t)}return this}_triggerEvent(e,t){const i=t?new CustomEvent(e,{bubbles:!1,detail:t}):new Event(e);let n=this;for(;n.parentGridNode;)n=n.parentGridNode.grid;return n.el.dispatchEvent(i),this}_updateContainerHeight(){if(!this.engine||this.engine.batchMode)return this;const e=this.parentGridNode;let t=this.getRow()+this._extraDragRow;const i=this.opts.cellHeight,n=this.opts.cellHeightUnit;if(!i)return this;if(!e&&!this.opts.minRow){const r=$.parseHeight(getComputedStyle(this.el).minHeight);if(r.h>0&&r.unit===n){const o=Math.floor(r.h/i);t<o&&(t=o)}}return this.el.setAttribute("gs-current-row",String(t)),this.el.style.removeProperty("min-height"),this.el.style.removeProperty("height"),t&&(this.el.style[e?"minHeight":"height"]=t*i+n),e&&$.shouldSizeToContent(e)&&e.grid.resizeToContentCBCheck(e.el),this}_prepareElement(e,t=!1,i){i=i||this._readAttr(e),e.gridstackNode=i,i.el=e,i.grid=this,i=this.engine.addNode(i,t),this._writeAttr(e,i),e.classList.add(jt.itemClass,this.opts.itemClass);const n=$.shouldSizeToContent(i);return n?e.classList.add("size-to-content"):e.classList.remove("size-to-content"),n&&this.resizeToContentCheck(!1,i),(!$.lazyLoad(i)||!i.visibleObservable)&&this.prepareDragDrop(i.el),this}_writePosAttr(e,t){if(!t._moving&&!t._resizing||this._placeholder===e){const i=this.opts.rtl?"right":"left",n=e.style;n.top=t.y?t.y===1?"var(--gs-cell-height)":`calc(${t.y} * var(--gs-cell-height))`:null,n[i]=t.x?t.x===1?"var(--gs-column-width)":`calc(${t.x} * var(--gs-column-width))`:null,n.width=t.w>1?`calc(${t.w} * var(--gs-column-width))`:null,n.height=t.h>1?`calc(${t.h} * var(--gs-cell-height))`:null}return e.style.setProperty("--gs-x",String(t.x||0)),e.style.setProperty("--gs-y",String(t.y||0)),e.style.setProperty("--gs-w",String(t.w||1)),e.style.setProperty("--gs-h",String(t.h||1)),e.setAttribute("gs-x",String(t.x??0)),e.setAttribute("gs-y",String(t.y??0)),t.w>1?e.setAttribute("gs-w",String(t.w)):e.removeAttribute("gs-w"),t.h>1?e.setAttribute("gs-h",String(t.h)):e.removeAttribute("gs-h"),this}_writeAttr(e,t){if(!t)return this;this._writePosAttr(e,t);const i={noResize:"gs-no-resize",noMove:"gs-no-move",locked:"gs-locked",id:"gs-id",sizeToContent:"gs-size-to-content"},n=t,r=i;for(const a in r)n[a]!==void 0&&n[a]!==null&&n[a]!==!1?e.setAttribute(r[a],String(n[a])):e.removeAttribute(r[a]);const o=t.print;return o?(o.pageBreak?e.setAttribute("gs-page-break",String(o.pageBreak)):e.removeAttribute("gs-page-break"),o.hide?e.classList.add("gs-print-hide"):e.classList.remove("gs-print-hide"),o.orientation?e.setAttribute("gs-print-orientation",String(o.orientation)):e.removeAttribute("gs-print-orientation"),o.breakInside?e.setAttribute("gs-break-inside",String(o.breakInside)):e.removeAttribute("gs-break-inside")):(e.removeAttribute("gs-page-break"),e.classList.remove("gs-print-hide"),e.removeAttribute("gs-print-orientation"),e.removeAttribute("gs-break-inside")),this}_readAttr(e,t=!0){const i={};i.x=$.toNumber(e.getAttribute("gs-x")),i.y=$.toNumber(e.getAttribute("gs-y")),i.w=$.toNumber(e.getAttribute("gs-w")),i.h=$.toNumber(e.getAttribute("gs-h")),i.autoPosition=$.toBool(e.getAttribute("gs-auto-position")),i.noResize=$.toBool(e.getAttribute("gs-no-resize")),i.noMove=$.toBool(e.getAttribute("gs-no-move")),i.locked=$.toBool(e.getAttribute("gs-locked"));let n=e.getAttribute("gs-page-break"),r=e.classList.contains("gs-print-hide"),o=e.getAttribute("gs-print-orientation"),a=e.getAttribute("gs-break-inside");(n||r||o||a)&&(i.print={},n&&(i.print.pageBreak=$.toBool(n)),r&&(i.print.hide=!0),o&&(i.print.orientation=o),a&&(i.print.breakInside=$.toBool(a)));const c=e.getAttribute("gs-size-to-content");c&&(c==="true"||c==="false"?i.sizeToContent=$.toBool(c):i.sizeToContent=parseInt(c,10)),i.id=e.getAttribute("gs-id")??void 0,i.maxW=$.toNumber(e.getAttribute("gs-max-w")),i.minW=$.toNumber(e.getAttribute("gs-min-w")),i.maxH=$.toNumber(e.getAttribute("gs-max-h")),i.minH=$.toNumber(e.getAttribute("gs-min-h")),t&&(i.w===1&&e.removeAttribute("gs-w"),i.h===1&&e.removeAttribute("gs-h"),i.maxW&&e.removeAttribute("gs-max-w"),i.minW&&e.removeAttribute("gs-min-w"),i.maxH&&e.removeAttribute("gs-max-h"),i.minH&&e.removeAttribute("gs-min-h"));const l=i;for(const h in l)i.hasOwnProperty(h)&&!l[h]&&l[h]!==0&&h!=="sizeToContent"&&delete l[h];return i}_setStaticClass(){const e=["grid-stack-static"];return this.opts.staticGrid?(this.el.classList.add(...e),this.el.setAttribute("gs-static","true")):(this.el.classList.remove(...e),this.el.removeAttribute("gs-static")),this}onResize(e=(t=>(t=this.el)==null?void 0:t.clientWidth)()){if(!e)return this;if(this.prevWidth===e)return this;this.prevWidth=e,this.batchUpdate();let i=!1;return this._autoColumn&&this.parentGridNode?this.opts.column!==this.parentGridNode.w&&(this.column(this.parentGridNode.w,this.opts.layout||"list"),i=!0):i=this.checkDynamicColumn(),this._isAutoCellHeight&&this.cellHeight(),this.engine.nodes.forEach(n=>{n.subGrid&&n.subGrid.onResize()}),this._skipInitialResize||this.resizeToContentCheck(i),delete this._skipInitialResize,this.batchUpdate(!1),this}resizeToContentCheck(e=!1,t){if(!this.engine)return;if(e&&this.hasAnimationCSS()){setTimeout(()=>this.resizeToContentCheck(!1,t),this.animationDelay);return}if(t)$.shouldSizeToContent(t)&&this.resizeToContentCBCheck(t.el);else if(this.engine.nodes.some(n=>$.shouldSizeToContent(n))){const n=[...this.engine.nodes];this.batchUpdate(),n.forEach(r=>{$.shouldSizeToContent(r)&&this.resizeToContentCBCheck(r.el)}),this._ignoreLayoutsNodeChange=!0,this.batchUpdate(!1),this._ignoreLayoutsNodeChange=!1}const i=this._gsEventHandler.resizecontent;i&&i(new Event("resizecontent"),t?[t]:this.engine.nodes)}_updateResizeEvent(e=!1){const t=!this.parentGridNode&&(this._isAutoCellHeight||this.opts.sizeToContent||this.opts.columnOpts||this.engine.nodes.find(i=>i.sizeToContent));return!e&&t&&!this.resizeObserver?(this._sizeThrottle=$.throttle(()=>this.onResize(),this.opts.cellHeightThrottle),this.resizeObserver=new ResizeObserver(()=>this._sizeThrottle()),this.resizeObserver.observe(this.el),this._skipInitialResize=!0):(e||!t)&&this.resizeObserver&&(this.resizeObserver.disconnect(),delete this.resizeObserver,delete this._sizeThrottle),this}static getElement(e=".grid-stack-item"){return $.getElement(e)}static getElements(e=".grid-stack-item"){return $.getElements(e)}static getGridElement(e){return Ce.getElement(e)}static getGridElements(e){return $.getElements(e)}_initMargin(){let e={h:0,unit:"px"},t=0,i=[];typeof this.opts.margin=="string"&&(i=this.opts.margin.split(" ")),i.length===2?(this.opts.marginTop=this.opts.marginBottom=i[0],this.opts.marginLeft=this.opts.marginRight=i[1]):i.length===4?(this.opts.marginTop=i[0],this.opts.marginRight=i[1],this.opts.marginBottom=i[2],this.opts.marginLeft=i[3]):(e=$.parseHeight(this.opts.margin),this.opts.marginUnit=e.unit,t=this.opts.margin=e.h);const n=["marginTop","marginRight","marginBottom","marginLeft"],r=this.opts;n.forEach(a=>{r[a]===void 0?r[a]=t:(e=$.parseHeight(r[a]),r[a]=e.h,delete this.opts.margin)}),this.opts.marginUnit=e.unit,this.opts.marginTop===this.opts.marginBottom&&this.opts.marginLeft===this.opts.marginRight&&this.opts.marginTop===this.opts.marginRight&&(this.opts.margin=this.opts.marginTop);const o=this.el.style;return o.setProperty("--gs-item-margin-top",`${this.opts.marginTop}${this.opts.marginUnit}`),o.setProperty("--gs-item-margin-bottom",`${this.opts.marginBottom}${this.opts.marginUnit}`),o.setProperty("--gs-item-margin-right",`${this.opts.marginRight}${this.opts.marginUnit}`),o.setProperty("--gs-item-margin-left",`${this.opts.marginLeft}${this.opts.marginUnit}`),this}static getDD(){return Gt}static setupDragIn(e,t,i,n=document){(t==null?void 0:t.pause)!==void 0&&(Se.pauseDrag=t.pause),t={appendTo:"body",helper:"clone",...t||{}},(typeof e=="string"?$.getElements(e,n):e).forEach((o,a)=>{Gt.isDraggable(o)||Gt.dragIn(o,t),i!=null&&i[a]&&(o.gridstackNode=i[a])})}movable(e,t){return this.opts.staticGrid?this:(Ce.getElements(e).forEach(i=>{const n=i.gridstackNode;n&&(t?delete n.noMove:n.noMove=!0,this.prepareDragDrop(n.el))}),this)}resizable(e,t){return this.opts.staticGrid?this:(Ce.getElements(e).forEach(i=>{const n=i.gridstackNode;n&&(t?delete n.noResize:n.noResize=!0,this.prepareDragDrop(n.el))}),this)}disable(e=!0){return this.opts.staticGrid?this:(this.enableMove(!1,e),this.enableResize(!1,e),this._triggerEvent("disable"),this)}enable(e=!0){return this.opts.staticGrid?this:(this.enableMove(!0,e),this.enableResize(!0,e),this._triggerEvent("enable"),this)}enableMove(e,t=!0){return this.opts.staticGrid?this:(e?delete this.opts.disableDrag:this.opts.disableDrag=!0,this.engine.nodes.forEach(i=>{this.prepareDragDrop(i.el),i.subGrid&&t&&i.subGrid.enableMove(e,t)}),this)}enableResize(e,t=!0){return this.opts.staticGrid?this:(e?delete this.opts.disableResize:this.opts.disableResize=!0,this.engine.nodes.forEach(i=>{this.prepareDragDrop(i.el),i.subGrid&&t&&i.subGrid.enableResize(e,t)}),this)}cancelDrag(){var i,n,r;const e=(i=Se.dragElement)==null?void 0:i.el;if(e!=null&&e._gridstackNodeOrig){const o=e._gridstackNodeOrig,a=o.grid,c=(n=this._placeholder)==null?void 0:n.gridstackNode;c&&(c._isAboutToRemove=!0,this.engine.removeNode(c)),this.engine.restoreInitial(),e.gridstackNode=o,delete e._gridstackNodeOrig,delete Se.dropElement,a&&(a.engine.addNode(o,!1),a.engine.restoreInitial());return}const t=(r=this._placeholder)==null?void 0:r.gridstackNode;t&&(t._isExternal?(t._isAboutToRemove=!0,this.engine.removeNode(t)):t._isAboutToRemove&&Ce._itemRemoving(t.el,!1),this.engine.restoreInitial())}_removeDD(e){return Gt.draggable(e,"destroy").resizable(e,"destroy"),e.gridstackNode&&delete e.gridstackNode._initDD,delete e.ddElement,this}_setupAcceptWidget(){if(this.opts.staticGrid||!this.opts.acceptWidgets&&!this.opts.removable)return Gt.droppable(this.el,"destroy"),this;let e,t;const i=(n,r,o)=>{var u;o=o||r;const a=o.gridstackNode;if(!a)return;if(!((u=a.grid)!=null&&u.el)){o.style.transform=`scale(${1/this.dragTransform.xScale},${1/this.dragTransform.yScale})`;const f=o.getBoundingClientRect();o.style.left=f.x+(this.dragTransform.xScale-1)*(n.clientX-f.x)/this.dragTransform.xScale+"px",o.style.top=f.y+(this.dragTransform.yScale-1)*(n.clientY-f.y)/this.dragTransform.yScale+"px",o.style.transformOrigin="0px 0px"}let{top:c,left:l}=o.getBoundingClientRect();const h=this.el.getBoundingClientRect();l-=h.left,c-=h.top;const d={position:{top:c*this.dragTransform.xScale,left:l*this.dragTransform.yScale}};if(a._temporaryRemoved){if(a.x=Math.max(0,Math.round(l/t)),a.y=Math.max(0,Math.round(c/e)),delete a.autoPosition,this.engine.nodeBoundFix(a),!this.engine.willItFit(a)){if(a.autoPosition=!0,!this.engine.willItFit(a)){Gt.off(r,"drag");return}a._willFitPos&&($.copyPos(a,a._willFitPos),delete a._willFitPos)}this._onStartMoving(o,n,d,a,t,e)}else this._dragOrResize(o,n,d,a,t,e)};return Gt.droppable(this.el,{accept:n=>{const r=n.gridstackNode||this._readAttr(n,!1);if((r==null?void 0:r.grid)===this)return!0;if(!this.opts.acceptWidgets)return!1;let o=!0;if(typeof this.opts.acceptWidgets=="function")o=this.opts.acceptWidgets(n);else{const a=this.opts.acceptWidgets===!0?".grid-stack-item":this.opts.acceptWidgets;o=n.matches(a)}if(o&&r&&this.opts.maxRow){const a={w:r.w,h:r.h,minW:r.minW,minH:r.minH};o=this.engine.willItFit(a)}return o}}).on(this.el,"dropover",(n,r,o)=>{let a=(o==null?void 0:o.gridstackNode)||r.gridstackNode;if((a==null?void 0:a.grid)===this&&!a._temporaryRemoved)return!1;if(a!=null&&a._sidebarOrig&&(a.w=a._sidebarOrig.w,a.h=a._sidebarOrig.h),a!=null&&a.grid&&a.grid!==this&&!a._temporaryRemoved&&a.grid._leave(r,o),o=o||r,t=this.cellWidth(),e=this.getCellHeight(!0),!a){const h=o.getAttribute("data-gs-widget")||o.getAttribute("gridstacknode");if(h){try{a=JSON.parse(h)}catch{console.error("Gridstack dropover: Bad JSON format: ",h)}o.removeAttribute("data-gs-widget"),o.removeAttribute("gridstacknode")}a||(a=this._readAttr(o)),a._sidebarOrig={w:a.w,h:a.h}}a.grid||(a.el||(a={...a}),a._isExternal=!0,o.gridstackNode=a);const c=a.w||Math.round(o.offsetWidth/t)||1,l=a.h||Math.round(o.offsetHeight/e)||1;return a.grid&&a.grid!==this?(r._gridstackNodeOrig||(r._gridstackNodeOrig=a),r.gridstackNode=a={...a,w:c,h:l,grid:this},delete a.x,delete a.y,this.engine.cleanupNode(a).nodeBoundFix(a),a._initDD=a._isExternal=a._temporaryRemoved=!0):(a.w=c,a.h=l,a._temporaryRemoved=!0),Ce._itemRemoving(a.el,!1),Gt.on(r,"drag",i),i(n,r,o),!1}).on(this.el,"dropout",(n,r,o)=>{const a=(o==null?void 0:o.gridstackNode)||r.gridstackNode;return a&&(!a.grid||a.grid===this)&&(this._leave(r,o),this._isTemp&&this.removeAsSubGrid(a)),!1}).on(this.el,"drop",(n,r,o)=>{var u,f,g;const a=(o==null?void 0:o.gridstackNode)||r.gridstackNode;if((a==null?void 0:a.grid)===this&&!a._isExternal)return!1;const c=!!this.placeholder.parentElement,l=r!==o;this.placeholder.remove(),delete this.placeholder.gridstackNode,c&&this.opts.animate&&(this.setAnimation(!1),this.setAnimation(!0,!0));const h=r._gridstackNodeOrig;if(delete r._gridstackNodeOrig,c&&(h!=null&&h.grid)&&h.grid!==this){const v=h.grid;v.engine.removeNodeFromLayoutCache(h),v.engine.removedNodes.push(h),v._triggerRemoveEvent()._triggerChangeEvent(),v.parentGridNode&&!v.engine.nodes.length&&v.opts.subGridDynamic&&v.removeAsSubGrid()}if(!a||(c&&(this.engine.cleanupNode(a),a.grid=this),(u=a.grid)==null||delete u._isTemp,Gt.off(r,"drag"),o&&o!==r?(o.remove(),r=o):r.remove(),this._removeDD(r),!c))return!1;const d=(g=(f=a.subGrid)==null?void 0:f.el)==null?void 0:g.gridstack;return $.copyPos(a,this._readAttr(this.placeholder)),$.removePositioningStyles(r),l&&(a.content||a.subGridOpts||Ce.addRemoveCB)?(delete a.el,r=this.addWidget(a)||r):(this._prepareElement(r,!0,a),this.el.appendChild(r),this.resizeToContentCheck(!1,a),d&&(d.parentGridNode=a),this._updateContainerHeight()),this.engine.addedNodes.push(a),this._triggerAddEvent(),this._triggerChangeEvent(),this.engine.endUpdate(),this._gsEventHandler.dropped&&this._gsEventHandler.dropped({...n,type:"dropped"},h&&h.grid?h:void 0,a),!1}),this}static _itemRemoving(e,t){if(!e)return;const i=e?e.gridstackNode:void 0;!(i!=null&&i.grid)||e.classList.contains(i.grid.opts.removableOptions.decline)||(t?i._isAboutToRemove=!0:delete i._isAboutToRemove,t?e.classList.add("grid-stack-item-removing"):e.classList.remove("grid-stack-item-removing"))}_setupRemoveDrop(){if(typeof this.opts.removable!="string")return this;const e=document.querySelector(this.opts.removable);return e?(!this.opts.staticGrid&&!Gt.isDroppable(e)&&Gt.droppable(e,this.opts.removableOptions).on(e,"dropover",(t,i)=>Ce._itemRemoving(i,!0)).on(e,"dropout",(t,i)=>Ce._itemRemoving(i,!1)),this):this}refreshDragHandles(e){return Ce.getElements(e).forEach(t=>{var i,n;(n=(i=t.ddElement)==null?void 0:i.ddDraggable)==null||n.refreshHandles()}),this}prepareDragDrop(e,t=!1){const i=e==null?void 0:e.gridstackNode;if(!i)return this;const n=i.noMove||this.opts.disableDrag,r=i.noResize||this.opts.disableResize,o=this.opts.staticGrid||n&&r;if((t||o)&&(i._initDD&&(this._removeDD(e),delete i._initDD),o))return e.classList.add("ui-draggable-disabled","ui-resizable-disabled"),this;if(!i._initDD){let a,c;const l=(u,f)=>{this.triggerEvent(u,u.target),a=this.cellWidth(),c=this.getCellHeight(!0),this._onStartMoving(e,u,f,i,a,c)},h=(u,f)=>{this._dragOrResize(e,u,f,i,a,c)},d=u=>{this.placeholder.remove(),delete this.placeholder.gridstackNode,delete i._moving,delete i._resizing,delete i._event,delete i._lastTried;const f=i.w!==i._orig.w,g=u.target;if(!(!g.gridstackNode||g.gridstackNode.grid!==this)){if(i.el=g,i._isAboutToRemove){const v=e.gridstackNode.grid;v._gsEventHandler[u.type]&&v._gsEventHandler[u.type](u,g),v.engine.nodes.push(i),v.removeWidget(e,!0,!0)}else $.removePositioningStyles(g),i._temporaryRemoved?(this._writePosAttr(g,i),this.engine.addNode(i)):this._writePosAttr(g,i),this.triggerEvent(u,g);this._extraDragRow=0,this._updateContainerHeight(),this._triggerChangeEvent(),this.engine.endUpdate(),u.type==="resizestop"&&(Number.isInteger(i.sizeToContent)&&(i.sizeToContent=i.h),this.resizeToContentCheck(f,i))}};Gt.draggable(e,{start:l,stop:d,drag:h,rtl:this.opts.rtl==="auto"?void 0:this.opts.rtl}).resizable(e,{start:l,stop:d,resize:h,rtl:this.opts.rtl==="auto"?void 0:this.opts.rtl}),i._initDD=!0}return Gt.draggable(e,n?"disable":"enable").resizable(e,r?"disable":"enable"),this}_onStartMoving(e,t,i,n,r,o){var a;if(this.engine.cleanNodes().beginUpdate(n),this._writePosAttr(this.placeholder,n),this.el.appendChild(this.placeholder),this.placeholder.gridstackNode=n,(a=n.grid)!=null&&a.el)this.dragTransform=$.getValuesFromTransformedElement(e);else if(this.placeholder&&this.placeholder.closest(".grid-stack")){const c=this.placeholder.closest(".grid-stack");this.dragTransform=$.getValuesFromTransformedElement(c)}else this.dragTransform={xScale:1,xOffset:0,yScale:1,yOffset:0};if(n.el=this.placeholder,n._lastUiPosition=i.position,n._prevYPix=i.position.top,n._moving=t.type==="dragstart",n._resizing=t.type==="resizestart",delete n._lastTried,t.type==="dropover"&&n._temporaryRemoved&&(this.engine.addNode(n),n._moving=!0),this.engine.cacheRects(r,o,this.opts.marginTop,this.opts.marginRight,this.opts.marginBottom,this.opts.marginLeft),t.type==="resizestart"){const c=this.getColumn()-n.x,l=(this.opts.maxRow||Number.MAX_SAFE_INTEGER)-n.y;Gt.resizable(e,"option","minWidth",r*Math.min(n.minW||1,c)).resizable(e,"option","minHeight",o*Math.min(n.minH||1,l)).resizable(e,"option","maxWidth",r*Math.min(n.maxW||Number.MAX_SAFE_INTEGER,c)).resizable(e,"option","maxWidthMoveLeft",r*Math.min(n.maxW||Number.MAX_SAFE_INTEGER,n.x+n.w)).resizable(e,"option","maxHeight",o*Math.min(n.maxH||Number.MAX_SAFE_INTEGER,l)).resizable(e,"option","maxHeightMoveUp",o*Math.min(n.maxH||Number.MAX_SAFE_INTEGER,n.y+n.h))}}_dragOrResize(e,t,i,n,r,o){var m;const a={...n._orig};let c=!1,l=this.opts.marginLeft,h=this.opts.marginRight,d=this.opts.marginTop,u=this.opts.marginBottom;const f=Math.round(o*.1),g=Math.round(r*.1);if(l=Math.min(l,g),h=Math.min(h,g),d=Math.min(d,f),u=Math.min(u,f),t.type==="drag"){if(n._temporaryRemoved)return;n._prevYPix=i.position.top,this.opts.draggable.scroll!==!1&&((m=Se.dragElement)==null||m.updateScrollPosition(this.el));const p=i.position.left+(i.position.left>n._lastUiPosition.left?-h:l),T=i.position.top+(i.position.top>n._lastUiPosition.top?-u:d);a.x=Math.round(p/r),a.y=Math.round(T/o);const M=this._extraDragRow;if(this.engine.collide(n,a)){const x=this.getRow();let b=Math.max(0,a.y+n.h-x);this.opts.maxRow&&x+b>this.opts.maxRow&&(b=Math.max(0,this.opts.maxRow-x)),this._extraDragRow=b}else this._extraDragRow=0;if(this._extraDragRow!==M&&this._updateContainerHeight(),n.x===a.x&&n.y===a.y)return}else if(t.type==="resize"){if((a.x??0)<0||($.updateScrollResize(t,e,o),a.w=Math.round((i.size.width-l)/r),a.h=Math.round((i.size.height-d)/o),n.w===a.w&&n.h===a.h)||n._lastTried&&n._lastTried.w===a.w&&n._lastTried.h===a.h)return;if(t.hasMovedX){const p=n.x-(a.w-n.w);a.x=p<0?0:p}if(t.hasMovedY){const p=n.y-(a.h-n.h);a.y=p<0?0:p}c=!0}n._event=t,n._lastTried=a;const v={x:i.position.left+l,y:i.position.top+d,w:(i.size?i.size.width:n.w*r)-l-h,h:(i.size?i.size.height:n.h*o)-d-u};if(this.engine.moveNodeCheck(n,{...a,cellWidth:r,cellHeight:o,rect:v,resizing:c})){n._lastUiPosition=i.position,this.engine.cacheRects(r,o,d,h,u,l),delete n._skipDown,c&&n.subGrid&&n.subGrid.onResize(),this._extraDragRow=0,this._updateContainerHeight();const p=t.target;n._sidebarOrig||this._writePosAttr(p,n),this.triggerEvent(t,p)}}triggerEvent(e,t){let i=this;for(;i.parentGridNode;)i=i.parentGridNode.grid;i._gsEventHandler[e.type]&&i._gsEventHandler[e.type](e,t)}_leave(e,t){t=t||e;const i=t.gridstackNode;if(!i||(t.style.transform=t.style.transformOrigin="",Gt.off(e,"drag"),i._temporaryRemoved))return;i._temporaryRemoved=!0,this.engine.removeNode(i),i.el=i._isExternal&&t?t:e;const n=i._sidebarOrig;i._isExternal&&this.engine.cleanupNode(i),i._sidebarOrig=n,this.opts.removable===!0&&Ce._itemRemoving(e,!0),e._gridstackNodeOrig?(e.gridstackNode=e._gridstackNodeOrig,delete e._gridstackNodeOrig):i._isExternal&&this.engine.restoreInitial()}}Ce.renderCB=(s,e)=>{s&&(e!=null&&e.content)&&(s.textContent=e.content)};Ce.resizeToContentParent=".grid-stack-item-content";Ce.Utils=$;Ce.Engine=Ui;Ce.GDRev="13.3.0";const Kn=s=>document.querySelector(s);function Qi(s){return s.replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]??e)}function ga(s,e=!1){const t=Kn("#toast");t&&(t.textContent=s,t.className=`toast show${e?" error":""}`,window.setTimeout(()=>{t.className="toast"},4200))}function gv(s){const e=Kn("#replay-search"),t=Kn("#replay-filter"),i=Kn("#replay-episodes"),n=Kn("#replay-hidden"),r=Kn("#replay-count");let o=[],a=[],c=null;function l(){const M=e.value.trim().toLowerCase(),x=t.value;return o.filter(b=>!(x&&(b.task??"")!==x||M&&!`${b.session_id} ${b.task??""}`.toLowerCase().includes(M)))}function h(){const M=[...new Set(o.map(b=>b.task).filter(b=>!!b))],x=t.value;t.innerHTML='<option value="">全部 task</option>'+M.map(b=>`<option value="${Qi(b)}">${Qi(b)}</option>`).join(""),M.includes(x)&&(t.value=x)}function d(M,x){const b=M.task?`<small>${Qi(M.task)}</small>`:"",S=x==="visible"&&c===M.session_id?" active":"",A=x==="visible"?`<div class="episode-actions"><button class="episode-action" data-action="edit" data-session="${Qi(M.session_id)}" title="编辑 task 标签">编辑</button><button class="episode-action" data-action="hide" data-session="${Qi(M.session_id)}" title="隐藏该 episode">隐藏</button></div>`:`<button class="episode-action" data-action="restore" data-session="${Qi(M.session_id)}" title="恢复该 episode">恢复</button>`;return`<div class="episode-item${S}" data-session="${Qi(M.session_id)}"><div class="episode-main"><strong>${Qi(M.session_id)}</strong>${b}<small>${M.frames} 帧 · ${M.fps} Hz</small></div>${A}</div>`}function u(){const M=l();r.textContent=o.length?`${o.length} 个数据集`:"暂无",i.innerHTML=M.length?M.map(x=>d(x,"visible")).join(""):'<div class="empty">暂无已导出 episode</div>',n.innerHTML=a.length?'<div class="hidden-heading">已隐藏</div>'+a.map(x=>d(x,"hidden")).join(""):"",n.style.display=a.length?"":"none"}async function f(){var M;try{const[x,b]=await Promise.all([fetch("/api/lerobot"),fetch("/api/lerobot/trash")]);if(!x.ok)throw new Error(`HTTP ${x.status}`);if(!b.ok)throw new Error(`HTTP ${b.status}`);const[S,A]=await Promise.all([x.json(),b.json()]);o=S.sessions??[],a=A.sessions??[]}catch{r.textContent="回放不可用"}h(),u(),(M=s.onRefreshed)==null||M.call(s,o)}async function g(M,x){try{const b=await fetch(`/api/lerobot/${encodeURIComponent(M)}/${x}`,{method:"POST"});if(!b.ok)throw new Error(`HTTP ${b.status}`);return!0}catch{return!1}}async function v(M,x){try{const b=await fetch(`/api/lerobot/${encodeURIComponent(M)}/task`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({task:x})});if(!b.ok)throw new Error(`HTTP ${b.status}`);return!0}catch{return!1}}async function m(M,x){const b=x==="delete"?"隐藏":"恢复",S=(x==="delete"?o:a).find(E=>E.session_id===M),A=(S==null?void 0:S.session_id)??M;if(!window.confirm(`确定要${b} episode ${A} 吗？`))return;if(!await g(M,x)){ga(`${b}失败`,!0);return}await f(),s.onChanged()}async function p(M){const x=o.find(_=>_.session_id===M),b=window.prompt("编辑 task 标签",(x==null?void 0:x.task)??"");if(b===null)return;const S=b.trim();if(!S){ga("task 不能为空",!0);return}if(!await v(M,S)){ga("编辑失败",!0);return}await f()}function T(M){const x=M.target.closest("[data-session]");if(!x)return;const b=x.dataset.session??"",S=M.target.closest("[data-action]");if(S){const A=S.getAttribute("data-action");A==="hide"?m(b,"delete"):A==="restore"?m(b,"restore"):A==="edit"&&p(b);return}s.onSelect(b)}return i.addEventListener("click",T),n.addEventListener("click",T),e.addEventListener("input",u),t.addEventListener("change",u),f(),{refresh:f,getSession:M=>o.find(x=>x.session_id===M),getEpisodes:()=>o,setActive:M=>{c=M,u()}}}const _a=s=>document.querySelector(s);function ml(s){return s.replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]??e)}function Fr(s){return s>=60?`${(s/60).toFixed(1)} 分`:`${s.toFixed(1)} 秒`}function en(s,e){return`<div class="analysis-row"><span>${ml(s)}</span><b>${ml(e)}</b></div>`}function _v(s){var l;const e=_a("#analysis-overview"),t=_a("#analysis-duration"),i=_a("#analysis-tasks");if(!e||!t||!i)return;if(!s.length){e.innerHTML='<div class="empty">暂无数据</div>',t.innerHTML='<div class="empty">暂无数据</div>',i.innerHTML='<div class="empty">暂无数据</div>';return}const n=s.length,r=s.reduce((h,d)=>h+(d.frames||0),0),o=((l=s.find(h=>(h.fps??0)>0))==null?void 0:l.fps)??0,a=s.filter(h=>(h.fps??0)>0).map(h=>(h.frames||0)/(h.fps||1));if(e.innerHTML=en("Episode 数",String(n))+en("总帧数",r.toLocaleString())+en("FPS",o?String(o):"—")+en("格式","LeRobot v3"),a.length){const h=a.reduce((M,x)=>M+x,0),d=Math.min(...a),u=Math.max(...a),f=h/a.length,g=s.map(M=>M.frames||0),v=Math.min(...g),m=Math.max(...g),p=r/n,T=m>v?(p-v)/(m-v)*100:50;t.innerHTML=en("总时长",Fr(h))+en("最短",Fr(d))+en("平均",Fr(f))+en("最长",Fr(u))+`<div class="analysis-length"><div class="analysis-length-track"><div class="analysis-length-fill" style="left:${T.toFixed(1)}%"></div></div><div class="analysis-length-labels"><span>${v} 帧</span><span>平均 ${p.toFixed(0)}</span><span>${m} 帧</span></div></div>`}else t.innerHTML='<div class="empty">暂无数据</div>';const c=new Map;for(const h of s){const d=h.task||"未标注";c.set(d,(c.get(d)||0)+1)}i.innerHTML=[...c.entries()].sort((h,d)=>d[1]-h[1]).map(([h,d])=>{const u=(d/n*100).toFixed(1);return`<div class="analysis-task"><div class="analysis-task-head"><span>${ml(h)}</span><b>${d} · ${u}%</b></div><div class="analysis-task-bar"><div style="width:${u}%"></div></div></div>`}).join("")}const mn=s=>document.querySelector(s);function xv(s){return s.replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]??e)}function vv(s){const e=mn("#replay-cameras"),t=mn("#replay-camera-count"),i=mn("#replay-play"),n=mn("#replay-prev"),r=mn("#replay-next"),o=mn("#replay-slider"),a=mn("#replay-speed");let c=[],l=null,h=0,d=!1,u=0;function f(_){return!l||l.frameCount<=0?0:Math.min(l.frameCount-1,Math.max(0,_))}function g(_){if(!l)return;h=f(_);const E=h/l.fps;for(const R of c)try{R.currentTime=E}catch{}o.value=String(h)}function v(){return c.length?c[0].currentTime:0}function m(){if(!d||!l)return;const _=f(Math.round(v()*l.fps));if(_!==h&&(h=_,o.value=String(_),s.onFrameChange(_)),_>=l.frameCount-1){T();return}u=requestAnimationFrame(m)}function p(){if(!l||!c.length)return;d=!0,i.textContent="⏸ 暂停";const _=Number(a.value||1);for(const E of c)E.playbackRate=_,E.play().catch(()=>{});cancelAnimationFrame(u),u=requestAnimationFrame(m)}function T(){d=!1,i.textContent="▶ 播放";for(const _ of c)_.pause();cancelAnimationFrame(u)}function M(){d?T():p()}function x(_){if(!l)return;T();const E=f(h+_);g(E),s.onFrameChange(E)}function b(_){for(const E of c)E.playbackRate=_}function S(){const _=s.getSession();if(_){if(A(),l=_,!_.cameraIds.length)e.innerHTML='<div class="empty">该 Episode 无相机字段</div>',t.textContent="该 Episode 无相机字段";else{t.textContent=`${_.cameraIds.length} 路 · 同步视频`;for(const E of _.cameraIds){const R=document.createElement("div");R.className="camera-card",R.dataset.camera=E,R.innerHTML=`<video muted playsinline preload="auto" src="/api/lerobot/${encodeURIComponent(_.sessionId)}/video/${encodeURIComponent(E)}"></video><span class="camera-label">${xv(E)}</span>`;const C=R.querySelector("video");C&&c.push(C),e.append(R)}}o.max=String(Math.max(0,_.frameCount-1)),g(0),i.style.display=""}}function A(){T(),l=null,c=[],h=0,e.innerHTML='<div class="empty">选择一个 Episode 开始回放</div>',t.textContent="选择 Episode 后显示",o.max="0",o.value="0",i.style.display="none",i.textContent="▶ 播放"}return i.addEventListener("click",M),n.addEventListener("click",()=>x(-1)),r.addEventListener("click",()=>x(1)),o.addEventListener("input",()=>{if(!l)return;T();const _=f(Number(o.value));g(_),s.onFrameChange(_)}),a.addEventListener("change",()=>b(Number(a.value||1))),document.addEventListener("keydown",_=>{var E;l&&((E=_.target)!=null&&E.matches("input,select,textarea")||(_.key==="ArrowLeft"?(_.preventDefault(),x(-1)):_.key==="ArrowRight"?(_.preventDefault(),x(1)):_.key===" "&&(_.preventDefault(),M())))}),{load:S,clear:A,toggle:M,step:x,setSpeed:b,isPlaying:()=>d}}const Ii=s=>document.querySelector(s);function ws(s){return s.replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]??e)}function Kr(s){return typeof s=="number"&&Number.isFinite(s)?[s]:typeof s=="boolean"?[s?1:0]:Array.isArray(s)?s.flatMap(e=>Kr(e)):[]}const kh=["#67d391","#55a6ff","#f4bb63","#ff717c","#b18cff","#4ec9d8","#e8c547","#ff9e64","#7ee787","#79c0ff","#f97583","#d2a8ff","#56d4dd","#e3b341","#ffa657","#a5d6ff","#6ee7b7","#c084fc"];function As(s){return kh[s%kh.length]??"#67d391"}function yv(s,e,t,i){var M;const n=(M=t[s])==null?void 0:M.names;if(Array.isArray(n)&&n.length===e&&n.every(x=>typeof x=="string"&&x.length>0))return n;const r=Array.isArray(i.quality_sync_source_ids)?i.quality_sync_source_ids.filter(x=>typeof x=="string"):[];if(s==="quality.sync_error_ns"&&r.length===e)return r;const o=Array.isArray(i.joint_names)?i.joint_names.filter(x=>typeof x=="string"):[],a=Array.isArray(i.base_frames)?i.base_frames.filter(x=>typeof x=="string"):[],c=a.map(x=>x.split("/")[0]);if(["observation.joint_position","observation.joint_velocity","observation.joint_effort"].includes(s)&&o.length&&c.length*o.length===e)return c.flatMap(x=>o.map(b=>`${x}.${b}`));const h=["x","y","z"],d=["qx","qy","qz","qw"],u=["vx","vy","vz"],f=["wx","wy","wz"],g=["vx","vy","vz","wx","wy","wz"],v=i.cartesian_command,m=Array.isArray(v==null?void 0:v.frames)?v.frames.filter(x=>typeof x=="string"):[],p=s==="observation.ee_position"?h:s==="observation.ee_rotation"?d:s==="observation.ee_linear_velocity"?u:s==="observation.ee_angular_velocity"?f:s==="action.command_action"||s==="action.executed_action"?g:[],T=s==="action.command_action"?m:a;return p.length&&T.length*p.length===e?T.flatMap(x=>p.map(b=>`${x.split("/")[0]}.${b}`)):Array.from({length:e},(x,b)=>`${s.split(".").at(-1)}[${b}]`)}const Rs=320,Or=160,zt=8;function bv(){const s=Ii("#replay-feature-select"),e=Ii("#replay-joint-filter"),t=Ii("#replay-chart-legend"),i=Ii("#replay-feature-chart"),n=Ii("#replay-split-charts"),r=Ii("#replay-split-toggle"),o=Ii("#replay-feature-raw"),a=Ii("#replay-feature-count");let c={},l={},h="",d=[],u=new Set,f=!1,g="",v=null;function m(S,A){c=(A==null?void 0:A.features)??{},l=(A==null?void 0:A.canonical)??{},g="",v=null,s.innerHTML=S.map(_=>`<option value="${ws(_)}">${ws(_)}</option>`).join(""),h=S[0]??"",d=[],u=new Set,a.textContent=`${S.length} fields`,e.innerHTML="",t.innerHTML="",i.innerHTML="",n.innerHTML="",o.textContent="选择一个字段查看数据"}function p(S){S.length!==d.length&&(d=S,u=new Set(S.map((A,_)=>_)),e.innerHTML=S.map((A,_)=>`<label class="joint-chip"><input type="checkbox" data-dim="${_}" checked><span style="--chip:${As(_)}">${ws(A)}</span></label>`).join(""),e.querySelectorAll("input[data-dim]").forEach(A=>{A.addEventListener("change",()=>{const _=Number(A.dataset.dim);A.checked?u.add(_):u.delete(_),g="",v=null})}))}function T(S,A){const _=d.map((F,W)=>({dim:W,values:S.map(K=>{var ne;return Kr((ne=K.features)==null?void 0:ne[h])[W]??Number.NaN})})).filter(F=>u.has(F.dim));if(!_.length){i.innerHTML="",t.innerHTML="";return}const E=_.flatMap(F=>F.values).filter(F=>Number.isFinite(F));if(!E.length){i.innerHTML="";return}const R=Math.min(...E),C=Math.max(...E),L=C-R||1,k=F=>zt+F/Math.max(1,S.length-1)*(Rs-zt*2),q=F=>Or-zt-(F-R)/L*(Or-zt*2),U=(F,W)=>`<polyline points="${F.map((K,ne)=>Number.isFinite(K)?`${k(ne).toFixed(1)},${q(K).toFixed(1)}`:"").filter(Boolean).join(" ")}" fill="none" stroke="${W}" stroke-width="1.5"/>`;i.innerHTML=_.map(F=>U(F.values,As(F.dim))).join("")+`<line class="chart-marker" x1="0" x2="0" y1="${zt}" y2="${Or-zt}" stroke="#8793a8" stroke-width="1"/><text x="${zt}" y="${Or-2}" fill="#8793a8" font-size="9">${R.toPrecision(4)} — ${C.toPrecision(4)}</text>`,v=i.querySelector("line.chart-marker"),t.innerHTML=_.map(F=>`<span class="legend-chip"><i style="background:${As(F.dim)}"></i>${ws(d[F.dim])}</span>`).join("");const N=zt+A/Math.max(1,S.length-1)*(Rs-zt*2);v&&(v.setAttribute("x1",N.toFixed(1)),v.setAttribute("x2",N.toFixed(1)))}function M(S,A){const _=d.map((E,R)=>({dim:R,values:S.map(C=>{var L;return Kr((L=C.features)==null?void 0:L[h])[R]??Number.NaN})})).filter(E=>u.has(E.dim));n.innerHTML=_.length?_.map(E=>{const R=E.values,C=R.filter(K=>Number.isFinite(K)),L=C.length?Math.min(...C):0,k=C.length?Math.max(...C):1,q=k-L||1,U=K=>zt+K/Math.max(1,R.length-1)*(Rs-zt*2),N=K=>48-zt-(K-L)/q*(48-zt*2),F=R.map((K,ne)=>Number.isFinite(K)?`${U(ne).toFixed(1)},${N(K).toFixed(1)}`:"").filter(Boolean).join(" "),W=zt+A/Math.max(1,R.length-1)*(Rs-zt*2);return`<div class="split-mini"><div class="split-mini-head"><span style="--chip:${As(E.dim)}">${ws(d[E.dim])}</span><b>${k.toPrecision(3)}</b></div><svg viewBox="0 0 ${Rs} 48" preserveAspectRatio="none"><polyline points="${F}" fill="none" stroke="${As(E.dim)}" stroke-width="1.5"/><line x1="${W.toFixed(1)}" x2="${W.toFixed(1)}" y1="${zt}" y2="40" stroke="#8793a8" stroke-width="1"/></svg></div>`}).join(""):'<div class="empty">未选择任何维度</div>',t.innerHTML=""}function x(S,A,_){var C,L;if(h=s.value,!h)return;const E=Kr((C=S.features)==null?void 0:C[h]),R=yv(h,E.length,c,l);if(p(R),o.textContent=JSON.stringify({feature:h,value:(L=S.features)==null?void 0:L[h],frame_index:S.frame_index,dimensions:R},null,2),f){i.innerHTML="",M(A,_);return}n.innerHTML="",T(A,_)}function b(){g="",v=null,h="",d=[],u=new Set,s.innerHTML="",e.innerHTML="",t.innerHTML="",i.innerHTML="",n.innerHTML="",a.textContent="—",o.textContent="选择一个字段查看数据",r.classList.remove("active"),f=!1}return r.addEventListener("click",()=>{f=!f,r.classList.toggle("active",f),g="",v=null}),{setFeatures:m,render:x,clear:b}}function Ju(s){const e=Ii("#replay-health");if(!e)return;if(!s){e.innerHTML='<div class="empty">选择 Episode 后显示健康统计</div>';return}const t=s.valid_frames??0,i=s.invalid_frames??0,n=s.max_sync_error_ns,r=n==null?"—":n<1e6?`${(n/1e3).toFixed(1)} µs`:`${(n/1e6).toFixed(2)} ms`;e.innerHTML=`<div class="health-stat"><span>有效帧</span><b>${t}</b></div><div class="health-stat"><span>无效帧</span><b>${i}</b></div><div class="health-stat"><span>最大同步误差</span><b>${r}</b></div>`}const gn=s=>document.querySelector(s);function Mv(s){return s.replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]??e)}function Ev(s){const e=gn("#annotation-toggle"),t=gn("#annotation-panel"),i=gn("#annotation-status"),n=gn("#annotation-frame"),r=gn("#annotation-list"),o=gn("#annotation-save"),a=gn("#annotation-cancel");let c=null,l=[],h=!1,d=null,u=0,f=Promise.resolve();function g(){return h&&c!==null}function v(){if(!g()){i.textContent="",n.textContent="";return}i.innerHTML=d!==null?`起点帧 <b>${d}</b> · 按 <b>R</b> 标记终点`:"按 <b>Q</b> 标记起点",n.textContent=`当前帧 ${s.getCurrentFrame()}`}function m(){r.innerHTML=l.length?l.map(R=>`<div class="annotation-segment"><span class="annotation-label">${Mv(R.label)}</span><span class="annotation-range">${R.start_frame} – ${R.end_frame}</span><button class="annotation-remove" data-index="${R.index}" title="删除该段">×</button></div>`).join(""):'<div class="annotation-empty">暂无已标注段</div>'}function p(){const R=g();t.hidden=!R,e.textContent=h?"退出标注":"标注",e.classList.toggle("active",h),v(),R&&m()}function T(){l.sort((R,C)=>R.start_frame-C.start_frame),l=l.map((R,C)=>({...R,index:C}))}function M(){g()&&(d=s.getCurrentFrame(),v())}function x(){if(!g()||d===null)return;const R=d,C=s.getCurrentFrame();if(C<R){s.notify("终点帧不能早于起点帧",!0),v();return}const L=window.prompt("段标签（必填）","");if(L===null){v();return}const k=L.trim();if(!k){s.notify("标签不能为空",!0),v();return}d=null,l.push({index:l.length,label:k,start_frame:R,end_frame:C}),T(),u+=1,p(),A()}function b(R){l=l.filter(C=>C.index!==R),T(),u+=1,p(),A()}async function S(){if(!c)return;const R=c,C=l.map(q=>({...q})),L=u,k=await fetch(`/api/lerobot/${encodeURIComponent(R)}/subtasks`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({subtasks:C})});if(!k.ok)throw new Error(`HTTP ${k.status}`);if(c===R){if(u===L)try{const q=await fetch(`/api/lerobot/${encodeURIComponent(R)}/subtasks`);if(!q.ok)throw new Error(`HTTP ${q.status}`);const U=await q.json();c===R&&u===L&&(l=Array.isArray(U.subtasks)?U.subtasks:[],p())}catch{}s.notify("标注已保存")}}function A(){f=f.then(()=>S()).catch(R=>s.notify(`保存失败: ${String(R)}`,!0))}async function _(R){c=R,d=null,l=[],u+=1;const C=u;p();try{const L=await fetch(`/api/lerobot/${encodeURIComponent(R)}/subtasks`);if(!L.ok)throw new Error(`HTTP ${L.status}`);const k=await L.json();if(c!==R||u!==C)return;l=Array.isArray(k.subtasks)?k.subtasks:[]}catch(L){if(c!==R)return;u===C&&(l=[]),s.notify(`加载标注失败: ${String(L)}`,!0)}p()}function E(){c=null,l=[],d=null,u+=1,p()}return e.addEventListener("click",()=>{if(!c){s.notify("请先选择一个 Episode",!0);return}h=!h,p()}),o.addEventListener("click",A),a.addEventListener("click",()=>{d!==null&&(d=null,v())}),r.addEventListener("click",R=>{const C=R.target.closest("[data-index]");C&&b(Number(C.dataset.index))}),document.addEventListener("keydown",R=>{var C;g()&&((C=R.target)!=null&&C.matches("input,select,textarea")||(R.key==="q"||R.key==="Q"?(R.preventDefault(),M()):(R.key==="r"||R.key==="R")&&(R.preventDefault(),x())))}),p(),{load:_,clear:E,onFrameChange:()=>{g()&&v()}}}const Ye=s=>document.querySelector(s);function Bh(s){return s.replace(/[&<>\"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]??e)}const Sv=Ye("#recording"),kr=Ye("#connection"),ju=Ye("#arms"),Br=Ye("#previews"),xa=Ye("#toast"),Ds=Ye("#viewer-state"),Qu=Ye("#joint-stamp"),zh=Ye("#canvas"),Tv=Ye("#viewer"),Hh=Ye("#motion-canvas"),ho=Ye("#motion-viewer"),wv=Ye("#motion-cards"),Av=Ye("#motion-3d-status");let Is=null,Cs=null,Gh,_n,Jn,xn,zr,qn,Us,vn,Hr;const wo={},Vh={},jn={},gl={};let _l=null;const Rv=80,ed=Ye("#grippers"),va=Ye("#export-panel"),$n=Ye("#export-state"),ya=Ye("#export-progress"),ba=Ye("#export-dir"),Wh=Ye("#queue-panel"),Xh=Ye("#queue-count"),qh=Ye("#lerobot-queue"),Hl=Ye("#replay-exit"),td=Ye("#replay-frame-label"),id=Ye("#replay-task"),nd=Ye("#replay-dataset-meta"),sd=Ye("#replay-time-label"),rd=Ye("#pose-count"),od=Ye("#gripper-count");function Gl(s,e=!1){xa.textContent=s,xa.className=`toast show${e?" error":""}`,clearTimeout(Gh),Gh=window.setTimeout(()=>xa.className="toast",4200)}function Vl(s,e){const t=wo[s];t==null||t.setJointValues(Object.fromEntries(e.map((i,n)=>[`joint_${n+1}`,i]))),t==null||t.updateMatrixWorld(!0)}function Wl(s){const e=wo[s];if(!e)return null;try{const t=e.links??{},i=t.base_link,n=t.link_6;if(!i||!n)return null;const r=i.matrixWorld.clone().invert().multiply(n.matrixWorld);return{basePosition:new D().setFromMatrixPosition(r),baseQuaternion:new Nt().setFromRotationMatrix(r),worldPosition:new D().setFromMatrixPosition(n.matrixWorld)}}catch{return null}}function uo(s,e=3){return s?`[${s.x.toFixed(e)}, ${s.y.toFixed(e)}, ${s.z.toFixed(e)}]`:"—"}function Gr(s){return!Array.isArray(s)||s.length!==3||!s.every(Number.isFinite)?null:new D(Number(s[0]),Number(s[1]),Number(s[2]))}function Cv(){const s={l:5613311,m:6804369,r:16038755};Object.keys(s).forEach(e=>{if(gl[e])return;const t=new _o(new wt,new wn({color:s[e],transparent:!0,opacity:.82})),i=new Ft(new yo(.026,16,12),new ls({color:s[e],transparent:!0,opacity:.95}));i.visible=!1;const n=new nh(new D(1,0,0),new D,.001,6804369,.035,.018),r=new nh(new D(1,0,0),new D,.001,5613311,.028,.014);n.visible=!1,r.visible=!1,Us.add(t,i,n,r),gl[e]={trail:t,marker:i,actualArrow:n,commandedArrow:r,points:[]}})}function Pv(s,e){const t=gl[s];if(!t||!e.pose)return;t.marker.visible=!0,t.marker.position.copy(e.pose.worldPosition);const i=t.points.at(-1);(!i||i.distanceToSquared(e.pose.worldPosition)>1e-10)&&(t.points.push(e.pose.worldPosition.clone()),t.points.length>Rv&&t.points.shift(),t.trail.geometry.setFromPoints(t.points));const n=(r,o,a,c)=>{var u,f;const l=(o==null?void 0:o.length())??0;if(r.visible=l>1e-5,!o||l<=1e-5)return;const h=(f=(u=wo[s])==null?void 0:u.links)==null?void 0:f.base_link,d=h?o.clone().transformDirection(h.matrixWorld):o.clone().normalize();r.position.copy(e.pose.worldPosition),r.setDirection(d),r.setLength(Math.min(.35,Math.max(.04,l*.35)),a,c)};n(t.actualArrow,e.measuredLinearMps,.035,.018),n(t.commandedArrow,e.commandedLinearMps,.028,.014)}function Lv(s,e){const t=Wl(s),i=jn[s],n=Gr(e==null?void 0:e.commanded_linear_velocity_mps),r=Gr(e==null?void 0:e.commanded_angular_velocity_radps),o=(e==null?void 0:e.measured_frame_id)===`${s}/base_link`,a=e!=null&&e.measured_valid&&o?Gr(e.measured_linear_velocity_mps):null,c=e!=null&&e.measured_valid&&o?Gr(e.measured_angular_velocity_radps):null,l=[...(i==null?void 0:i.history)??[],{commandLinear:(n==null?void 0:n.length())??0,measuredLinear:(a==null?void 0:a.length())??null,commandAngular:(r==null?void 0:r.length())??0,measuredAngular:(c==null?void 0:c.length())??null}].slice(-60),h={pose:t,commandedLinearMps:n,commandedAngularRadps:r,measuredLinearMps:a,measuredAngularRadps:c,measuredAgeMs:Number.isFinite(e==null?void 0:e.measured_age_ms)?Number(e==null?void 0:e.measured_age_ms):null,measuredFrameMatchesBase:o,history:l};return jn[s]=h,Pv(s,h),h}function $h(s,e,t){return s.map((r,o)=>{const a=r[e],c=s.length>1?o*240/(s.length-1):240,l=a===null?46:46-Number(a)/t*46;return`${o?"L":"M"}${c.toFixed(1)},${l.toFixed(1)}`}).join(" ")}function Yh(s,e,t,i){const n=s.flatMap(o=>[o[t],o[i]]).filter(o=>o!==null),r=Math.max(.001,...n);return`<svg viewBox="0 0 240 62" role="img" aria-label="控制与实际${e}速度曲线"><path class="motion-gridline" d="M0 46H240"/><path class="motion-command" d="${$h(s,t,r)}"/><path class="motion-measured" d="${$h(s,i,r)}"/><text x="0" y="60">0</text><text x="238" y="60" text-anchor="end">${r.toFixed(2)} ${e}</text></svg>`}function Nv(){const s=["l","m","r"],e=s.filter(n=>{var r;return(r=jn[n])==null?void 0:r.pose}).length,t=s.some(n=>{var r;return!!((r=jn[n])!=null&&r.measuredLinearMps)}),i=s.some(n=>{var r;return!!((r=jn[n])!=null&&r.commandedLinearMps)});Av.textContent=e?`${e} / 3 末端可视化`:"等待末端数据",Tv.dataset.motionVisualization=e?"active":"waiting",ho.dataset.endEffectorMarkers=e?"active":"waiting",ho.dataset.velocityVectors=t&&i?"actual+commanded":t?"actual":i?"commanded":"waiting",wv.innerHTML=s.map(n=>{const r=jn[n],o=r==null?void 0:r.commandedLinearMps,a=r==null?void 0:r.commandedAngularRadps,c=r==null?void 0:r.measuredLinearMps,l=r==null?void 0:r.measuredAngularRadps,h=r?r.measuredFrameMatchesBase?c?`驱动测量 · ${r.measuredAgeMs??"—"} ms`:"驱动测量无效":"测量坐标系不匹配":"等待驱动状态",d=r?`<div class="motion-charts"><div><small>线速度 · 控制 / 实际</small>${Yh(r.history,"m/s","commandLinear","measuredLinear")}</div><div><small>角速度 · 控制 / 实际</small>${Yh(r.history,"rad/s","commandAngular","measuredAngular")}</div></div>`:"";return`<article id="motion-${n}" class="motion-card"><h4>${n.toUpperCase()} 末端 <span>FK · base_link</span></h4><div class="motion-values"><span>位置 <b>${r!=null&&r.pose?uo(r.pose.basePosition):"等待 URDF FK"} ${r!=null&&r.pose?"m":""}</b></span><span>控制线速度 <b>${o?`${o.length().toFixed(3)} m/s`:"—"}</b></span><span>驱动线速度 <b class="${c?"speed":"unavailable"}">${c?`${c.length().toFixed(3)} m/s`:"—"}</b></span><span>控制角速度 <b>${a?`${a.length().toFixed(3)} rad/s`:"—"}</b></span><span>驱动角速度 <b class="${l?"speed":"unavailable"}">${l?`${l.length().toFixed(3)} rad/s`:"—"}</b></span><span>实际 XYZ <b>${uo(c)}</b></span><span class="motion-source"><b>${h}</b></span></div>${d}</article>`}).join("")}function Dv(){_n=new Wu({canvas:zh,antialias:!0,alpha:!0,preserveDrawingBuffer:!0}),_n.setPixelRatio(Math.min(window.devicePixelRatio,2)),_n.outputColorSpace=ht,_n.setClearColor(594196,1),_n.shadowMap.enabled=!0,Jn=new Cl,xn=new It(35,1,.01,100),xn.up.set(0,0,1),xn.position.set(1.2,-1.8,1.25),zr=new qu(xn,zh),zr.enableDamping=!0,zr.target.set(0,0,.55);const s=document.querySelector("#viewer"),e=()=>{const i=s.getBoundingClientRect();!i.width||!i.height||(_n.setSize(i.width,i.height,!1),xn.aspect=i.width/i.height,xn.updateProjectionMatrix())};new ResizeObserver(e).observe(s),e();const t=()=>{requestAnimationFrame(t),zr.update(),_n.render(Jn,xn)};t()}function Iv(){qn=new Wu({canvas:Hh,antialias:!0,alpha:!0}),qn.setPixelRatio(Math.min(window.devicePixelRatio,2)),qn.outputColorSpace=ht,qn.setClearColor(594196,1),Us=new Cl,vn=new It(38,1,.01,100),vn.up.set(0,0,1),vn.position.set(1.2,-1.8,1.25),Hr=new qu(vn,Hh),Hr.enableDamping=!0,Hr.target.set(0,0,.55),Us.add(new Lu(15200493,2503736,2.5));const s=new Uu(3.5,22,5664888,2505536);s.rotation.x=Math.PI/2,Us.add(s,new Wp(.25));const e=()=>{const i=ho.getBoundingClientRect();!i.width||!i.height||(qn.setSize(i.width,i.height,!1),vn.aspect=i.width/i.height,vn.updateProjectionMatrix())};new ResizeObserver(e).observe(ho),e();const t=()=>{requestAnimationFrame(t),Hr.update(),qn.render(Us,vn)};t()}async function Uv(){var e;if(!Is)return;Ds.textContent="加载 URDF…",Ds.removeAttribute("hidden");const s=new cv;s.packages={rm65_description:`${location.origin}/models`};try{Jn.add(new Lu(15200493,2503736,2.5));const t=new Du(16777215,4);t.position.set(2,-3,4),t.castShadow=!0,Jn.add(t);const i=new Uu(3.5,22,5664888,2505536);i.rotation.x=Math.PI/2,Jn.add(i),Cv();const n=(e=Is.robots.find(r=>r.id==="m"))==null?void 0:e.transform;if(!n)throw new Error("middle-arm transform is missing from the layout manifest");for(const r of Is.robots){const o=await s.loadAsync(`${location.origin}${r.urdf_url}`);o.position.set(r.transform.x-n.x,r.transform.y-n.y,r.transform.z-n.z),o.rotation.set(r.transform.roll,r.transform.pitch,r.transform.yaw,"ZYX"),Jn.add(o),wo[r.id]=o,Vl(r.id,Array(6).fill(Is.default_joint_position_rad))}Ds.setAttribute("hidden",""),_l&&ud(_l)}catch(t){Ds.textContent=`URDF 加载失败: ${String(t)}`}}function Fv(s){const e=Object.keys(s),t=e.filter(i=>{var n;return(n=s[i])==null?void 0:n.connected}).length;Ye("#arm-count").textContent=`${t} / ${e.length||3} online`,e.length&&(ju.innerHTML=e.map(i=>{const n=s[i]??{},r=n.positions_rad??[],o=Wl(i),a=o?`<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--line);font:11px ui-monospace,Menlo,monospace;color:var(--muted)">位置 <b style="color:var(--text)">${uo(o.basePosition)}</b> m<br>姿态 <b style="color:var(--text)">[${o.baseQuaternion.w.toFixed(3)}, ${o.baseQuaternion.x.toFixed(3)}, ${o.baseQuaternion.y.toFixed(3)}, ${o.baseQuaternion.z.toFixed(3)}]</b></div>`:"";return`<article class="arm-card ${n.connected?"connected":""}"><h4>${i.toUpperCase()} <span>${n.connected?"CONNECTED":"OFFLINE"}</span></h4><div class="joint-list">${r.length?r.map((c,l)=>`<span>J${l+1} <b>${(c*180/Math.PI).toFixed(1)}°</b></span>`).join(""):"<span>暂无关节数据</span>"}</div>${a}</article>`}).join(""))}const Kh={};function Ov(s){var t;const e=Object.keys(s);Ye("#camera-count").textContent=e.length?`${e.length} 路 · 低清预览`:"等待视频流",e.length&&((t=Br.querySelector(".empty"))==null||t.remove(),e.forEach(i=>{let n=Br.querySelector(`[data-camera="${CSS.escape(i)}"]`);n||(n=document.createElement("div"),n.className="camera-card",n.setAttribute("data-camera",i),n.innerHTML=`<img class="preview-img" alt="${i}" style="display:none"><div class="no-feed">等待视频帧…</div><span class="camera-label">${i}</span><span class="camera-health">NO SIGNAL</span>`,Br.append(n)),n.style.display="block";const r=n.querySelector(".camera-health"),o=s[i]?(Date.now()*1e6-s[i])/1e9:1/0;if(r&&(r.textContent=o<3?`LIVE · ${o.toFixed(1)}s`:"NO SIGNAL"),!s[i])return;const a=Date.now(),c=Kh[i]||0;if(a-c<3e3)return;Kh[i]=a;const l=n.querySelector(".preview-img");l&&(l.style.display="block",l.onload=()=>{var h;(h=n.querySelector(".no-feed"))==null||h.remove()},l.src=`/preview/${encodeURIComponent(i)}.jpg?ts=${a}`)}),[...Br.children].forEach(i=>{const n=i.dataset.camera;n&&!e.includes(n)&&(i.style.display="none")}))}function kv(s){const e=s.recording??{};Sv.textContent=e.detail||"等待设备数据",Ye("#elapsed").textContent=`${(e.elapsed_sec||0).toFixed(1)}s`,Ye("#remaining").textContent=e.remaining_sec>0?`${e.remaining_sec.toFixed(1)}s`:"—",Ye("#dropped").textContent=e.dropped_samples||0,Ye("#status-pulse").style.background=e.state===2?"var(--green)":e.state===7?"var(--red)":"var(--amber)";const t=Number(e.export_progress??0),i=String(e.export_dir??""),n=String(e.export_error??"");n?(va.style.display="",$n.textContent="转换失败",$n.style.color="var(--red)",ya.style.width="100%",ba.textContent=`错误: ${n}`):t>0&&t<1?(va.style.display="",$n.textContent=`转换中 ${Math.round(t*100)}%`,$n.style.color="",ya.style.width=`${Math.round(t*100)}%`,ba.textContent="",zv(t)):t>=1&&i&&(va.style.display="",$n.textContent="转换完成",$n.style.color="",ya.style.width="100%",ba.textContent=`数据目录: ${i}`),!Qe&&(_l=s,ud(s))}const Bv=[{state:"RUNNING",label:"转换中"},{state:"QUEUED",label:"排队中"},{state:"SUCCEEDED",label:"已完成"},{state:"FAILED",label:"失败"}];let ad=[],ld=0,Zh=-1;function Ma(s,e){const t=s.export_state==="RUNNING"?` · ${Math.round(ld*100)}%`:"",i=s.error?` · ${Bh(s.error)}`:"";return`<div class="queue-row"><span class="queue-session">${Bh(s.session_id)}</span><span class="queue-state">${e}${t}${i}</span></div>`}function cd(){var n;const s=ad.filter(r=>r.decision==="ADOPTED"&&r.export_state);if(!s.length){Wh.style.display="none",qh.innerHTML='<div class="empty">暂无待转换会话</div>',Xh.textContent="0 个会话";return}Wh.style.display="",Xh.textContent=`${s.length} 个会话`;const e=[];for(const r of["RUNNING","QUEUED"]){const o=s.filter(c=>c.export_state===r);if(!o.length)continue;const a=((n=Bv.find(c=>c.state===r))==null?void 0:n.label)??r;e.push(`<div class="queue-group"><span class="queue-group-label">${a}</span>${o.map(c=>Ma(c,a)).join("")}</div>`)}const t=s.filter(r=>r.export_state==="SUCCEEDED"),i=s.filter(r=>r.export_state==="FAILED");if(t.length||i.length){const r=`${t.length} 完成${i.length?` · ${i.length} 失败`:""}`,o=(t.length?`<div class="queue-group"><span class="queue-group-label">已完成</span>${t.map(a=>Ma(a,"已完成")).join("")}</div>`:"")+(i.length?`<div class="queue-group"><span class="queue-group-label">失败</span>${i.map(a=>Ma(a,"失败")).join("")}</div>`:"");e.push(`<details class="queue-done"><summary>历史记录 · ${r}</summary>${o}</details>`)}qh.innerHTML=e.join("")}function hd(){fetch("/api/lerobot/queue").then(s=>s.ok?s.json():Promise.reject(new Error(String(s.status)))).then(s=>{ad=s.jobs??[],cd()}).catch(()=>{})}function zv(s){ld=s;const e=Math.round(s*100);e!==Zh&&(Zh=e,cd())}function ud(s){const e=s.arms??{};for(const[i,n]of Object.entries(e)){const r=n.positions_rad;r!=null&&r.length&&(Vl(i,r),Vh[i]=new Date().toISOString())}const t=Object.values(Vh);Qu.textContent=t.length?`joint_states · ${t[t.length-1]}`:"等待 joint_states",Fv(e),Object.keys(e).forEach(i=>{var n;return Lv(i,(n=e[i])==null?void 0:n.cartesian_velocity)}),Nv(),Vv(s.grippers??{}),Ov(s.preview_cameras??{})}const Hv={right:{open:4e3,close:12e3},left:{open:400,close:949},mid:{open:0,close:9e3}};function Gv(s,e){const t=Hv[s.replace("gripper_","")];if(!t)return 0;const i=t.close-t.open;if(i<=0)return 0;const n=Math.min(1,Math.max(0,(t.close-e)/i));return Math.round(n*100)}function dd(s,e){const t=s.replace("gripper_",""),i=Gv(s,e);return`<article class="gripper-card"><h4>${t}</h4><div style="margin-bottom:8px;font:11px ui-monospace,Menlo,monospace;color:#8793a8">开合度 ${i}%</div><div style="height:8px;background:#0b0f17;border:1px solid #202c40;border-radius:4px;overflow:hidden"><div style="height:100%;width:${i}%;background:linear-gradient(90deg,#55a6ff,#67d391);transition:width .2s"></div></div></article>`}function Vv(s){const e=Object.entries(s);if(!e.length)return;const t=e.filter(([i])=>i.endsWith("/position"));t.length&&(ed.innerHTML=t.map(([i,n])=>dd(i.split("/").filter(Boolean)[0]??"gripper",Number(n.position??0))).join(""))}let Qe=null;async function Wv(s){var e,t,i,n,r;if(!s){Ao();return}try{const[o,a]=await Promise.all([fetch(`/api/lerobot/${encodeURIComponent(s)}/frames`),fetch(`/api/lerobot/${encodeURIComponent(s)}/summary`)]);if(!o.ok||!a.ok)throw new Error(`回放接口错误 (${o.status}/${a.status})`);const c=await o.json(),l=await a.json(),h=zs.getSession(s),d=Object.keys(((t=(e=c.frames)==null?void 0:e[0])==null?void 0:t.features)??{}),u=d.length?d:Object.keys(l.features??{}),f=Object.keys(l.features??{}).filter(m=>m.startsWith("observation.images.")),g=f.length?f.map(m=>m.slice(19)):Object.keys(((n=(i=c.frames)==null?void 0:i[0])==null?void 0:n.cameras)??{});Qe={session:s,frames:c.frames??[],index:0,fps:(h==null?void 0:h.fps)||15,summary:l,cameras:g},Ro.setFeatures(u,l),id.textContent=(h==null?void 0:h.task)||"未标注 task";const v=((r=l.quality)==null?void 0:r.invalid_frames)??0;nd.textContent=`${(h==null?void 0:h.frames)??Qe.frames.length} 帧 · ${(h==null?void 0:h.fps)??Qe.fps} Hz · quality invalid ${v}`,Hl.style.display="",md.load(),Ju(l.quality??(h==null?void 0:h.quality)),Xl.load(s),fd(0)}catch(o){Gl(`回放加载失败: ${String(o)}`,!0)}}function Ao(){md.clear(),Ro.clear(),Xl.clear(),Ju(void 0),zs.setActive(null),Qe=null,Hl.style.display="none",td.textContent="— / —",sd.textContent="—",id.textContent="—",nd.textContent="—",rd.textContent="URDF 实时关节",od.textContent="实时输入"}function fd(s){if(!Qe)return;const e=Qe.frames[s];if(!e)return;Qe.index=s,td.textContent=`${s+1} / ${Qe.frames.length}`,sd.textContent=`${(e.timestamp_ns/1e9).toFixed(3)} s`,Qu.textContent=`回放帧 ${s+1} · ${new Date(e.timestamp_ns/1e6).toISOString()}`,rd.textContent="回放关节",od.textContent="回放";const t=["l","m","r"];ju.innerHTML=t.map((i,n)=>{const r=e.state.slice(n*6,n*6+6);Vl(i,r);const o=r.map((l,h)=>`<span>J${h+1} <b>${(l*180/Math.PI).toFixed(1)}°</b></span>`).join(""),a=Wl(i),c=a?`<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--line);font:11px ui-monospace,Menlo,monospace;color:var(--muted)">位置 <b style="color:var(--text)">${uo(a.basePosition)}</b> m<br>姿态 <b style="color:var(--text)">[${a.baseQuaternion.w.toFixed(3)}, ${a.baseQuaternion.x.toFixed(3)}, ${a.baseQuaternion.y.toFixed(3)}, ${a.baseQuaternion.z.toFixed(3)}]</b></div>`:"";return`<article class="arm-card"><h4>${i.toUpperCase()} <span style="color:var(--blue)">REPLAY</span></h4><div class="joint-list">${o}</div>${c}</article>`}).join(""),Ye("#arm-count").textContent=`回放帧 ${s+1}/${Qe.frames.length}`,ed.innerHTML=["left","mid","right"].map((i,n)=>dd(i,e.state[18+n]??0)).join(""),Ro.render(e,Qe.frames,Qe.index),Xl.onFrameChange(s)}function pd(){Cs=new WebSocket(`${location.protocol==="https:"?"wss":"ws"}://${location.host}/ws`),Cs.onopen=()=>{kr.className="connection online",kr.querySelector("span").textContent="WebSocket 已连接 · 只读机器人"},Cs.onclose=()=>{kr.className="connection",kr.querySelector("span").textContent="已断开 · 2 秒后重连",setTimeout(pd,2e3)},Cs.onerror=()=>Gl("无法连接录制服务",!0),Cs.onmessage=s=>{const e=JSON.parse(s.data);e.type==="recording_snapshot"&&kv(e)}}Dv();Iv();fetch("/api/layout").then(s=>s.json()).then(s=>(Is=s,Uv())).catch(s=>{Ds.textContent=`布局加载失败: ${String(s)}`});pd();hd();setInterval(hd,5e3);Hl.addEventListener("click",Ao);function Xv(){return Qe?{sessionId:Qe.session,fps:Qe.fps,frameCount:Qe.frames.length,cameraIds:Qe.cameras}:null}const md=vv({getSession:Xv,onFrameChange:fd}),Ro=bv(),Xl=Ev({getSessionId:()=>(Qe==null?void 0:Qe.session)??null,getCurrentFrame:()=>(Qe==null?void 0:Qe.index)??0,notify:Gl}),zs=gv({onSelect:s=>{zs.setActive(s),Wv(s)},onChanged:()=>{zs.refresh().then(()=>{Qe&&!zs.getSession(Qe.session)&&Ao()})},onRefreshed:s=>_v(s)});var jh;for(const s of["#replay-feature-select"])(jh=document.querySelector(s))==null||jh.addEventListener("change",()=>{Qe&&Ro.render(Qe.frames[Qe.index],Qe.frames,Qe.index)});for(const s of document.querySelectorAll(".sidebar-tab"))s.addEventListener("click",()=>{const e=s.getAttribute("data-sidebar-tab");document.querySelectorAll(".sidebar-tab").forEach(n=>n.classList.toggle("active",n===s));const t=document.querySelector("#sidebar-episodes"),i=document.querySelector("#sidebar-analysis");t&&(t.style.display=e==="episodes"?"":"none"),i&&(i.style.display=e==="analysis"?"":"none")});const Zs=Ce.init({column:12,cellHeight:60,margin:12,float:!1,animate:!0,draggable:{handle:".panel-head"}},".layout.grid-stack"),gd="recording-layout-v3",Jh=localStorage.getItem(gd);if(Jh)try{Zs.load(JSON.parse(Jh))}catch{}Zs.on("change",()=>{localStorage.setItem(gd,JSON.stringify(Zs.save(!1)))});function qv(s){document.querySelectorAll(".tab").forEach(n=>{n.classList.toggle("active",n.getAttribute("data-tab")===s)});const e=document.querySelector("#tab-record"),t=document.querySelector("#tab-replay"),i=document.querySelector(".layout.grid-stack");e&&e.classList.toggle("replay-mode",s==="replay"),t&&(t.style.display=s==="replay"?"":"none"),s==="replay"?(i==null||i.classList.add("replay-layout"),Zs.disable()):(Qe&&Ao(),i==null||i.classList.remove("replay-layout"),Zs.enable())}document.querySelectorAll(".tab").forEach(s=>{s.addEventListener("click",()=>qv(s.getAttribute("data-tab")))});
