(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const s of n)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function t(n){const s={};return n.integrity&&(s.integrity=n.integrity),n.referrerPolicy&&(s.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?s.credentials="include":n.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(n){if(n.ep)return;n.ep=!0;const s=t(n);fetch(n.href,s)}})();/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const hl="185",Jn={ROTATE:0,DOLLY:1,PAN:2},Yn={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},md=0,jl=1,gd=2,kr=1,_d=2,ws=3,Oi=0,$t=1,bi=2,Ui=0,jn=1,Ql=2,ec=3,tc=4,xd=5,xn=100,vd=101,yd=102,bd=103,Md=104,Sd=200,Ed=201,Td=202,wd=203,ga=204,_a=205,Ad=206,Rd=207,Cd=208,Pd=209,Ld=210,Nd=211,Dd=212,Id=213,Ud=214,xa=0,va=1,ya=2,ns=3,ba=4,Ma=5,Sa=6,Ea=7,ao=0,Fd=1,Od=2,Si=0,Wh=1,Xh=2,qh=3,$h=4,Yh=5,Kh=6,Zh=7,ic="attached",kd="detached",Jh=300,Mn=301,ss=302,To=303,wo=304,lo=306,yn=1e3,ei=1001,Ta=1002,Ut=1003,Bd=1004,js=1005,Tt=1006,Ao=1007,Ii=1008,Qt=1009,jh=1010,Qh=1011,ks=1012,ul=1013,Ti=1014,hi=1015,ki=1016,dl=1017,fl=1018,Bs=1020,eu=35902,tu=35899,iu=1021,nu=1022,oi=1023,Bi=1026,bn=1027,su=1028,pl=1029,Sn=1030,ml=1031,gl=1033,Br=33776,zr=33777,Hr=33778,Gr=33779,wa=35840,Aa=35841,Ra=35842,Ca=35843,Pa=36196,La=37492,Na=37496,Da=37488,Ia=37489,Wr=37490,Ua=37491,Fa=37808,Oa=37809,ka=37810,Ba=37811,za=37812,Ha=37813,Ga=37814,Va=37815,Wa=37816,Xa=37817,qa=37818,$a=37819,Ya=37820,Ka=37821,Za=36492,Ja=36494,ja=36495,Qa=36283,el=36284,Xr=36285,tl=36286,zs=2300,il=2301,Ro=2302,nl=2303,nc=2400,sc=2401,rc=2402,zd=2500,Hd=3200,qr=0,Gd=1,Qi="",ht="srgb",$r="srgb-linear",Yr="linear",tt="srgb",Cn=7680,oc=519,Vd=512,Wd=513,Xd=514,_l=515,qd=516,$d=517,xl=518,Yd=519,ac=35044,lc="300 es",Mi=2e3,Hs=2001;function Kd(r){for(let e=r.length-1;e>=0;--e)if(r[e]>=65535)return!0;return!1}function Zd(r){return ArrayBuffer.isView(r)&&!(r instanceof DataView)}function Gs(r){return document.createElementNS("http://www.w3.org/1999/xhtml",r)}function Jd(){const r=Gs("canvas");return r.style.display="block",r}const cc={};function hc(...r){const e="THREE."+r.shift();console.log(e,...r)}function ru(r){const e=r[0];if(typeof e=="string"&&e.startsWith("TSL:")){const t=r[1];t&&t.isStackTrace?r[0]+=" "+t.getLocation():r[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return r}function Ne(...r){r=ru(r);const e="THREE."+r.shift();{const t=r[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...r)}}function We(...r){r=ru(r);const e="THREE."+r.shift();{const t=r[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...r)}}function Qn(...r){const e=r.join(" ");e in cc||(cc[e]=!0,Ne(...r))}function jd(r,e,t){return new Promise(function(i,n){function s(){switch(r.clientWaitSync(e,r.SYNC_FLUSH_COMMANDS_BIT,0)){case r.WAIT_FAILED:n();break;case r.TIMEOUT_EXPIRED:setTimeout(s,t);break;default:i()}}setTimeout(s,t)})}const Qd={[xa]:va,[ya]:Sa,[ba]:Ea,[ns]:Ma,[va]:xa,[Sa]:ya,[Ea]:ba,[Ma]:ns};class sn{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){const i=this._listeners;return i===void 0?!1:i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){const i=this._listeners;if(i===void 0)return;const n=i[e];if(n!==void 0){const s=n.indexOf(t);s!==-1&&n.splice(s,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const i=t[e.type];if(i!==void 0){e.target=this;const n=i.slice(0);for(let s=0,o=n.length;s<o;s++)n[s].call(this,e);e.target=null}}}const kt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let uc=1234567;const Ds=Math.PI/180,rs=180/Math.PI;function rn(){const r=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(kt[r&255]+kt[r>>8&255]+kt[r>>16&255]+kt[r>>24&255]+"-"+kt[e&255]+kt[e>>8&255]+"-"+kt[e>>16&15|64]+kt[e>>24&255]+"-"+kt[t&63|128]+kt[t>>8&255]+"-"+kt[t>>16&255]+kt[t>>24&255]+kt[i&255]+kt[i>>8&255]+kt[i>>16&255]+kt[i>>24&255]).toLowerCase()}function qe(r,e,t){return Math.max(e,Math.min(t,r))}function vl(r,e){return(r%e+e)%e}function ef(r,e,t,i,n){return i+(r-e)*(n-i)/(t-e)}function tf(r,e,t){return r!==e?(t-r)/(e-r):0}function Is(r,e,t){return(1-t)*r+t*e}function nf(r,e,t,i){return Is(r,e,1-Math.exp(-t*i))}function sf(r,e=1){return e-Math.abs(vl(r,e*2)-e)}function rf(r,e,t){return r<=e?0:r>=t?1:(r=(r-e)/(t-e),r*r*(3-2*r))}function of(r,e,t){return r<=e?0:r>=t?1:(r=(r-e)/(t-e),r*r*r*(r*(r*6-15)+10))}function af(r,e){return r+Math.floor(Math.random()*(e-r+1))}function lf(r,e){return r+Math.random()*(e-r)}function cf(r){return r*(.5-Math.random())}function hf(r){r!==void 0&&(uc=r);let e=uc+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function uf(r){return r*Ds}function df(r){return r*rs}function ff(r){return(r&r-1)===0&&r!==0}function pf(r){return Math.pow(2,Math.ceil(Math.log(r)/Math.LN2))}function mf(r){return Math.pow(2,Math.floor(Math.log(r)/Math.LN2))}function gf(r,e,t,i,n){const s=Math.cos,o=Math.sin,a=s(t/2),c=o(t/2),l=s((e+i)/2),h=o((e+i)/2),d=s((e-i)/2),u=o((e-i)/2),f=s((i-e)/2),g=o((i-e)/2);switch(n){case"XYX":r.set(a*h,c*d,c*u,a*l);break;case"YZY":r.set(c*u,a*h,c*d,a*l);break;case"ZXZ":r.set(c*d,c*u,a*h,a*l);break;case"XZX":r.set(a*h,c*g,c*f,a*l);break;case"YXY":r.set(c*f,a*h,c*g,a*l);break;case"ZYZ":r.set(c*g,c*f,a*h,a*l);break;default:Ne("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+n)}}function qn(r,e){switch(e.constructor){case Float32Array:return r;case Uint32Array:return r/4294967295;case Uint16Array:return r/65535;case Uint8Array:return r/255;case Int32Array:return Math.max(r/2147483647,-1);case Int16Array:return Math.max(r/32767,-1);case Int8Array:return Math.max(r/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function Gt(r,e){switch(e.constructor){case Float32Array:return r;case Uint32Array:return Math.round(r*4294967295);case Uint16Array:return Math.round(r*65535);case Uint8Array:return Math.round(r*255);case Int32Array:return Math.round(r*2147483647);case Int16Array:return Math.round(r*32767);case Int8Array:return Math.round(r*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}const vi={DEG2RAD:Ds,RAD2DEG:rs,generateUUID:rn,clamp:qe,euclideanModulo:vl,mapLinear:ef,inverseLerp:tf,lerp:Is,damp:nf,pingpong:sf,smoothstep:rf,smootherstep:of,randInt:af,randFloat:lf,randFloatSpread:cf,seededRandom:hf,degToRad:uf,radToDeg:df,isPowerOfTwo:ff,ceilPowerOfTwo:pf,floorPowerOfTwo:mf,setQuaternionFromProperEuler:gf,normalize:Gt,denormalize:qn},kl=class kl{constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,i=this.y,n=e.elements;return this.x=n[0]*t+n[3]*i+n[6],this.y=n[1]*t+n[4]*i+n[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=qe(this.x,e.x,t.x),this.y=qe(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=qe(this.x,e,t),this.y=qe(this.y,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(qe(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(qe(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const i=Math.cos(t),n=Math.sin(t),s=this.x-e.x,o=this.y-e.y;return this.x=s*i-o*n+e.x,this.y=s*n+o*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};kl.prototype.isVector2=!0;let Ue=kl;class Nt{constructor(e=0,t=0,i=0,n=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=n}static slerpFlat(e,t,i,n,s,o,a){let c=i[n+0],l=i[n+1],h=i[n+2],d=i[n+3],u=s[o+0],f=s[o+1],g=s[o+2],v=s[o+3];if(d!==v||c!==u||l!==f||h!==g){let m=c*u+l*f+h*g+d*v;m<0&&(u=-u,f=-f,g=-g,v=-v,m=-m);let p=1-a;if(m<.9995){const E=Math.acos(m),b=Math.sin(E);p=Math.sin(p*E)/b,a=Math.sin(a*E)/b,c=c*p+u*a,l=l*p+f*a,h=h*p+g*a,d=d*p+v*a}else{c=c*p+u*a,l=l*p+f*a,h=h*p+g*a,d=d*p+v*a;const E=1/Math.sqrt(c*c+l*l+h*h+d*d);c*=E,l*=E,h*=E,d*=E}}e[t]=c,e[t+1]=l,e[t+2]=h,e[t+3]=d}static multiplyQuaternionsFlat(e,t,i,n,s,o){const a=i[n],c=i[n+1],l=i[n+2],h=i[n+3],d=s[o],u=s[o+1],f=s[o+2],g=s[o+3];return e[t]=a*g+h*d+c*f-l*u,e[t+1]=c*g+h*u+l*d-a*f,e[t+2]=l*g+h*f+a*u-c*d,e[t+3]=h*g-a*d-c*u-l*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,n){return this._x=e,this._y=t,this._z=i,this._w=n,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const i=e._x,n=e._y,s=e._z,o=e._order,a=Math.cos,c=Math.sin,l=a(i/2),h=a(n/2),d=a(s/2),u=c(i/2),f=c(n/2),g=c(s/2);switch(o){case"XYZ":this._x=u*h*d+l*f*g,this._y=l*f*d-u*h*g,this._z=l*h*g+u*f*d,this._w=l*h*d-u*f*g;break;case"YXZ":this._x=u*h*d+l*f*g,this._y=l*f*d-u*h*g,this._z=l*h*g-u*f*d,this._w=l*h*d+u*f*g;break;case"ZXY":this._x=u*h*d-l*f*g,this._y=l*f*d+u*h*g,this._z=l*h*g+u*f*d,this._w=l*h*d-u*f*g;break;case"ZYX":this._x=u*h*d-l*f*g,this._y=l*f*d+u*h*g,this._z=l*h*g-u*f*d,this._w=l*h*d+u*f*g;break;case"YZX":this._x=u*h*d+l*f*g,this._y=l*f*d+u*h*g,this._z=l*h*g-u*f*d,this._w=l*h*d-u*f*g;break;case"XZY":this._x=u*h*d-l*f*g,this._y=l*f*d-u*h*g,this._z=l*h*g+u*f*d,this._w=l*h*d+u*f*g;break;default:Ne("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const i=t/2,n=Math.sin(i);return this._x=e.x*n,this._y=e.y*n,this._z=e.z*n,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,i=t[0],n=t[4],s=t[8],o=t[1],a=t[5],c=t[9],l=t[2],h=t[6],d=t[10],u=i+a+d;if(u>0){const f=.5/Math.sqrt(u+1);this._w=.25/f,this._x=(h-c)*f,this._y=(s-l)*f,this._z=(o-n)*f}else if(i>a&&i>d){const f=2*Math.sqrt(1+i-a-d);this._w=(h-c)/f,this._x=.25*f,this._y=(n+o)/f,this._z=(s+l)/f}else if(a>d){const f=2*Math.sqrt(1+a-i-d);this._w=(s-l)/f,this._x=(n+o)/f,this._y=.25*f,this._z=(c+h)/f}else{const f=2*Math.sqrt(1+d-i-a);this._w=(o-n)/f,this._x=(s+l)/f,this._y=(c+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<1e-8?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(qe(this.dot(e),-1,1)))}rotateTowards(e,t){const i=this.angleTo(e);if(i===0)return this;const n=Math.min(1,t/i);return this.slerp(e,n),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const i=e._x,n=e._y,s=e._z,o=e._w,a=t._x,c=t._y,l=t._z,h=t._w;return this._x=i*h+o*a+n*l-s*c,this._y=n*h+o*c+s*a-i*l,this._z=s*h+o*l+i*c-n*a,this._w=o*h-i*a-n*c-s*l,this._onChangeCallback(),this}slerp(e,t){let i=e._x,n=e._y,s=e._z,o=e._w,a=this.dot(e);a<0&&(i=-i,n=-n,s=-s,o=-o,a=-a);let c=1-t;if(a<.9995){const l=Math.acos(a),h=Math.sin(l);c=Math.sin(c*l)/h,t=Math.sin(t*l)/h,this._x=this._x*c+i*t,this._y=this._y*c+n*t,this._z=this._z*c+s*t,this._w=this._w*c+o*t,this._onChangeCallback()}else this._x=this._x*c+i*t,this._y=this._y*c+n*t,this._z=this._z*c+s*t,this._w=this._w*c+o*t,this.normalize();return this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),n=Math.sqrt(1-i),s=Math.sqrt(i);return this.set(n*Math.sin(e),n*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}const Bl=class Bl{constructor(e=0,t=0,i=0){this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(dc.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(dc.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,i=this.y,n=this.z,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6]*n,this.y=s[1]*t+s[4]*i+s[7]*n,this.z=s[2]*t+s[5]*i+s[8]*n,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,i=this.y,n=this.z,s=e.elements,o=1/(s[3]*t+s[7]*i+s[11]*n+s[15]);return this.x=(s[0]*t+s[4]*i+s[8]*n+s[12])*o,this.y=(s[1]*t+s[5]*i+s[9]*n+s[13])*o,this.z=(s[2]*t+s[6]*i+s[10]*n+s[14])*o,this}applyQuaternion(e){const t=this.x,i=this.y,n=this.z,s=e.x,o=e.y,a=e.z,c=e.w,l=2*(o*n-a*i),h=2*(a*t-s*n),d=2*(s*i-o*t);return this.x=t+c*l+o*d-a*h,this.y=i+c*h+a*l-s*d,this.z=n+c*d+s*h-o*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,i=this.y,n=this.z,s=e.elements;return this.x=s[0]*t+s[4]*i+s[8]*n,this.y=s[1]*t+s[5]*i+s[9]*n,this.z=s[2]*t+s[6]*i+s[10]*n,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=qe(this.x,e.x,t.x),this.y=qe(this.y,e.y,t.y),this.z=qe(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=qe(this.x,e,t),this.y=qe(this.y,e,t),this.z=qe(this.z,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(qe(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const i=e.x,n=e.y,s=e.z,o=t.x,a=t.y,c=t.z;return this.x=n*c-s*a,this.y=s*o-i*c,this.z=i*a-n*o,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return Co.copy(this).projectOnVector(e),this.sub(Co)}reflect(e){return this.sub(Co.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(qe(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y,n=this.z-e.z;return t*t+i*i+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){const n=Math.sin(t)*e;return this.x=n*Math.sin(i),this.y=Math.cos(t)*e,this.z=n*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),n=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=n,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};Bl.prototype.isVector3=!0;let D=Bl;const Co=new D,dc=new Nt,zl=class zl{constructor(e,t,i,n,s,o,a,c,l){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,n,s,o,a,c,l)}set(e,t,i,n,s,o,a,c,l){const h=this.elements;return h[0]=e,h[1]=n,h[2]=a,h[3]=t,h[4]=s,h[5]=c,h[6]=i,h[7]=o,h[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,n=t.elements,s=this.elements,o=i[0],a=i[3],c=i[6],l=i[1],h=i[4],d=i[7],u=i[2],f=i[5],g=i[8],v=n[0],m=n[3],p=n[6],E=n[1],b=n[4],x=n[7],M=n[2],T=n[5],A=n[8];return s[0]=o*v+a*E+c*M,s[3]=o*m+a*b+c*T,s[6]=o*p+a*x+c*A,s[1]=l*v+h*E+d*M,s[4]=l*m+h*b+d*T,s[7]=l*p+h*x+d*A,s[2]=u*v+f*E+g*M,s[5]=u*m+f*b+g*T,s[8]=u*p+f*x+g*A,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[1],n=e[2],s=e[3],o=e[4],a=e[5],c=e[6],l=e[7],h=e[8];return t*o*h-t*a*l-i*s*h+i*a*c+n*s*l-n*o*c}invert(){const e=this.elements,t=e[0],i=e[1],n=e[2],s=e[3],o=e[4],a=e[5],c=e[6],l=e[7],h=e[8],d=h*o-a*l,u=a*c-h*s,f=l*s-o*c,g=t*d+i*u+n*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const v=1/g;return e[0]=d*v,e[1]=(n*l-h*i)*v,e[2]=(a*i-n*o)*v,e[3]=u*v,e[4]=(h*t-n*c)*v,e[5]=(n*s-a*t)*v,e[6]=f*v,e[7]=(i*c-l*t)*v,e[8]=(o*t-i*s)*v,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,n,s,o,a){const c=Math.cos(s),l=Math.sin(s);return this.set(i*c,i*l,-i*(c*o+l*a)+o+e,-n*l,n*c,-n*(-l*o+c*a)+a+t,0,0,1),this}scale(e,t){return Qn("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Po.makeScale(e,t)),this}rotate(e){return Qn("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Po.makeRotation(-e)),this}translate(e,t){return Qn("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Po.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,i=e.elements;for(let n=0;n<9;n++)if(t[n]!==i[n])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}};zl.prototype.isMatrix3=!0;let ke=zl;const Po=new ke,fc=new ke().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),pc=new ke().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function _f(){const r={enabled:!0,workingColorSpace:$r,spaces:{},convert:function(n,s,o){return this.enabled===!1||s===o||!s||!o||(this.spaces[s].transfer===tt&&(n.r=Fi(n.r),n.g=Fi(n.g),n.b=Fi(n.b)),this.spaces[s].primaries!==this.spaces[o].primaries&&(n.applyMatrix3(this.spaces[s].toXYZ),n.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===tt&&(n.r=es(n.r),n.g=es(n.g),n.b=es(n.b))),n},workingToColorSpace:function(n,s){return this.convert(n,this.workingColorSpace,s)},colorSpaceToWorking:function(n,s){return this.convert(n,s,this.workingColorSpace)},getPrimaries:function(n){return this.spaces[n].primaries},getTransfer:function(n){return n===Qi?Yr:this.spaces[n].transfer},getToneMappingMode:function(n){return this.spaces[n].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(n,s=this.workingColorSpace){return n.fromArray(this.spaces[s].luminanceCoefficients)},define:function(n){Object.assign(this.spaces,n)},_getMatrix:function(n,s,o){return n.copy(this.spaces[s].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(n){return this.spaces[n].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(n=this.workingColorSpace){return this.spaces[n].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(n,s){return Qn("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),r.workingToColorSpace(n,s)},toWorkingColorSpace:function(n,s){return Qn("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),r.colorSpaceToWorking(n,s)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],i=[.3127,.329];return r.define({[$r]:{primaries:e,whitePoint:i,transfer:Yr,toXYZ:fc,fromXYZ:pc,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:ht},outputColorSpaceConfig:{drawingBufferColorSpace:ht}},[ht]:{primaries:e,whitePoint:i,transfer:tt,toXYZ:fc,fromXYZ:pc,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:ht}}}),r}const Xe=_f();function Fi(r){return r<.04045?r*.0773993808:Math.pow(r*.9478672986+.0521327014,2.4)}function es(r){return r<.0031308?r*12.92:1.055*Math.pow(r,.41666)-.055}let Pn;class xf{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let i;if(e instanceof HTMLCanvasElement)i=e;else{Pn===void 0&&(Pn=Gs("canvas")),Pn.width=e.width,Pn.height=e.height;const n=Pn.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),i=Pn}return i.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Gs("canvas");t.width=e.width,t.height=e.height;const i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);const n=i.getImageData(0,0,e.width,e.height),s=n.data;for(let o=0;o<s.length;o++)s[o]=Fi(s[o]/255)*255;return i.putImageData(n,0,0),t}else if(e.data){const t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(Fi(t[i]/255)*255):t[i]=Fi(t[i]);return{data:t,width:e.width,height:e.height}}else return Ne("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let vf=0;class yl{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:vf++}),this.uuid=rn(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const i={uuid:this.uuid,url:""},n=this.data;if(n!==null){let s;if(Array.isArray(n)){s=[];for(let o=0,a=n.length;o<a;o++)n[o].isDataTexture?s.push(Lo(n[o].image)):s.push(Lo(n[o]))}else s=Lo(n);i.url=s}return t||(e.images[this.uuid]=i),i}}function Lo(r){return typeof HTMLImageElement<"u"&&r instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&r instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&r instanceof ImageBitmap?xf.getDataURL(r):r.data?{data:Array.from(r.data),width:r.width,height:r.height,type:r.data.constructor.name}:(Ne("Texture: Unable to serialize Texture."),{})}let yf=0;const No=new D;class zt extends sn{constructor(e=zt.DEFAULT_IMAGE,t=zt.DEFAULT_MAPPING,i=ei,n=ei,s=Tt,o=Ii,a=oi,c=Qt,l=zt.DEFAULT_ANISOTROPY,h=Qi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:yf++}),this.uuid=rn(),this.name="",this.source=new yl(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=n,this.magFilter=s,this.minFilter=o,this.anisotropy=l,this.format=a,this.internalFormat=null,this.type=c,this.offset=new Ue(0,0),this.repeat=new Ue(1,1),this.center=new Ue(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ke,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(No).x}get height(){return this.source.getSize(No).y}get depth(){return this.source.getSize(No).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const i=e[t];if(i===void 0){Ne(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const n=this[t];if(n===void 0){Ne(`Texture.setValues(): property '${t}' does not exist.`);continue}n&&i&&n.isVector2&&i.isVector2||n&&i&&n.isVector3&&i.isVector3||n&&i&&n.isMatrix3&&i.isMatrix3?n.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Jh)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case yn:e.x=e.x-Math.floor(e.x);break;case ei:e.x=e.x<0?0:1;break;case Ta:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case yn:e.y=e.y-Math.floor(e.y);break;case ei:e.y=e.y<0?0:1;break;case Ta:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}zt.DEFAULT_IMAGE=null;zt.DEFAULT_MAPPING=Jh;zt.DEFAULT_ANISOTROPY=1;const Hl=class Hl{constructor(e=0,t=0,i=0,n=1){this.x=e,this.y=t,this.z=i,this.w=n}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,n){return this.x=e,this.y=t,this.z=i,this.w=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,i=this.y,n=this.z,s=this.w,o=e.elements;return this.x=o[0]*t+o[4]*i+o[8]*n+o[12]*s,this.y=o[1]*t+o[5]*i+o[9]*n+o[13]*s,this.z=o[2]*t+o[6]*i+o[10]*n+o[14]*s,this.w=o[3]*t+o[7]*i+o[11]*n+o[15]*s,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,n,s;const c=e.elements,l=c[0],h=c[4],d=c[8],u=c[1],f=c[5],g=c[9],v=c[2],m=c[6],p=c[10];if(Math.abs(h-u)<.01&&Math.abs(d-v)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+u)<.1&&Math.abs(d+v)<.1&&Math.abs(g+m)<.1&&Math.abs(l+f+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const b=(l+1)/2,x=(f+1)/2,M=(p+1)/2,T=(h+u)/4,A=(d+v)/4,_=(g+m)/4;return b>x&&b>M?b<.01?(i=0,n=.707106781,s=.707106781):(i=Math.sqrt(b),n=T/i,s=A/i):x>M?x<.01?(i=.707106781,n=0,s=.707106781):(n=Math.sqrt(x),i=T/n,s=_/n):M<.01?(i=.707106781,n=.707106781,s=0):(s=Math.sqrt(M),i=A/s,n=_/s),this.set(i,n,s,t),this}let E=Math.sqrt((m-g)*(m-g)+(d-v)*(d-v)+(u-h)*(u-h));return Math.abs(E)<.001&&(E=1),this.x=(m-g)/E,this.y=(d-v)/E,this.z=(u-h)/E,this.w=Math.acos((l+f+p-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=qe(this.x,e.x,t.x),this.y=qe(this.y,e.y,t.y),this.z=qe(this.z,e.z,t.z),this.w=qe(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=qe(this.x,e,t),this.y=qe(this.y,e,t),this.z=qe(this.z,e,t),this.w=qe(this.w,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(qe(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};Hl.prototype.isVector4=!0;let st=Hl;class bf extends sn{constructor(e=1,t=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Tt,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=i.depth,this.scissor=new st(0,0,e,t),this.scissorTest=!1,this.viewport=new st(0,0,e,t),this.textures=[];const n={width:e,height:t,depth:i.depth},s=new zt(n),o=i.count;for(let a=0;a<o;a++)this.textures[a]=s.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(e={}){const t={minFilter:Tt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let n=0,s=this.textures.length;n<s;n++)this.textures[n].image.width=e,this.textures[n].image.height=t,this.textures[n].image.depth=i,this.textures[n].isData3DTexture!==!0&&(this.textures[n].isArrayTexture=this.textures[n].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,i=e.textures.length;t<i;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const n=Object.assign({},e.textures[t].image);this.textures[t].source=new yl(n)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Ei extends bf{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}}class ou extends zt{constructor(e=null,t=1,i=1,n=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:n},this.magFilter=Ut,this.minFilter=Ut,this.wrapR=ei,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class Mf extends zt{constructor(e=null,t=1,i=1,n=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:n},this.magFilter=Ut,this.minFilter=Ut,this.wrapR=ei,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const oo=class oo{constructor(e,t,i,n,s,o,a,c,l,h,d,u,f,g,v,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,n,s,o,a,c,l,h,d,u,f,g,v,m)}set(e,t,i,n,s,o,a,c,l,h,d,u,f,g,v,m){const p=this.elements;return p[0]=e,p[4]=t,p[8]=i,p[12]=n,p[1]=s,p[5]=o,p[9]=a,p[13]=c,p[2]=l,p[6]=h,p[10]=d,p[14]=u,p[3]=f,p[7]=g,p[11]=v,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new oo().fromArray(this.elements)}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){const t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),i.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();const t=this.elements,i=e.elements,n=1/Ln.setFromMatrixColumn(e,0).length(),s=1/Ln.setFromMatrixColumn(e,1).length(),o=1/Ln.setFromMatrixColumn(e,2).length();return t[0]=i[0]*n,t[1]=i[1]*n,t[2]=i[2]*n,t[3]=0,t[4]=i[4]*s,t[5]=i[5]*s,t[6]=i[6]*s,t[7]=0,t[8]=i[8]*o,t[9]=i[9]*o,t[10]=i[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,i=e.x,n=e.y,s=e.z,o=Math.cos(i),a=Math.sin(i),c=Math.cos(n),l=Math.sin(n),h=Math.cos(s),d=Math.sin(s);if(e.order==="XYZ"){const u=o*h,f=o*d,g=a*h,v=a*d;t[0]=c*h,t[4]=-c*d,t[8]=l,t[1]=f+g*l,t[5]=u-v*l,t[9]=-a*c,t[2]=v-u*l,t[6]=g+f*l,t[10]=o*c}else if(e.order==="YXZ"){const u=c*h,f=c*d,g=l*h,v=l*d;t[0]=u+v*a,t[4]=g*a-f,t[8]=o*l,t[1]=o*d,t[5]=o*h,t[9]=-a,t[2]=f*a-g,t[6]=v+u*a,t[10]=o*c}else if(e.order==="ZXY"){const u=c*h,f=c*d,g=l*h,v=l*d;t[0]=u-v*a,t[4]=-o*d,t[8]=g+f*a,t[1]=f+g*a,t[5]=o*h,t[9]=v-u*a,t[2]=-o*l,t[6]=a,t[10]=o*c}else if(e.order==="ZYX"){const u=o*h,f=o*d,g=a*h,v=a*d;t[0]=c*h,t[4]=g*l-f,t[8]=u*l+v,t[1]=c*d,t[5]=v*l+u,t[9]=f*l-g,t[2]=-l,t[6]=a*c,t[10]=o*c}else if(e.order==="YZX"){const u=o*c,f=o*l,g=a*c,v=a*l;t[0]=c*h,t[4]=v-u*d,t[8]=g*d+f,t[1]=d,t[5]=o*h,t[9]=-a*h,t[2]=-l*h,t[6]=f*d+g,t[10]=u-v*d}else if(e.order==="XZY"){const u=o*c,f=o*l,g=a*c,v=a*l;t[0]=c*h,t[4]=-d,t[8]=l*h,t[1]=u*d+v,t[5]=o*h,t[9]=f*d-g,t[2]=g*d-f,t[6]=a*h,t[10]=v*d+u}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Sf,e,Ef)}lookAt(e,t,i){const n=this.elements;return Kt.subVectors(e,t),Kt.lengthSq()===0&&(Kt.z=1),Kt.normalize(),Vi.crossVectors(i,Kt),Vi.lengthSq()===0&&(Math.abs(i.z)===1?Kt.x+=1e-4:Kt.z+=1e-4,Kt.normalize(),Vi.crossVectors(i,Kt)),Vi.normalize(),Qs.crossVectors(Kt,Vi),n[0]=Vi.x,n[4]=Qs.x,n[8]=Kt.x,n[1]=Vi.y,n[5]=Qs.y,n[9]=Kt.y,n[2]=Vi.z,n[6]=Qs.z,n[10]=Kt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,n=t.elements,s=this.elements,o=i[0],a=i[4],c=i[8],l=i[12],h=i[1],d=i[5],u=i[9],f=i[13],g=i[2],v=i[6],m=i[10],p=i[14],E=i[3],b=i[7],x=i[11],M=i[15],T=n[0],A=n[4],_=n[8],S=n[12],R=n[1],C=n[5],L=n[9],B=n[13],X=n[2],U=n[6],N=n[10],z=n[14],$=n[3],j=n[7],se=n[11],ie=n[15];return s[0]=o*T+a*R+c*X+l*$,s[4]=o*A+a*C+c*U+l*j,s[8]=o*_+a*L+c*N+l*se,s[12]=o*S+a*B+c*z+l*ie,s[1]=h*T+d*R+u*X+f*$,s[5]=h*A+d*C+u*U+f*j,s[9]=h*_+d*L+u*N+f*se,s[13]=h*S+d*B+u*z+f*ie,s[2]=g*T+v*R+m*X+p*$,s[6]=g*A+v*C+m*U+p*j,s[10]=g*_+v*L+m*N+p*se,s[14]=g*S+v*B+m*z+p*ie,s[3]=E*T+b*R+x*X+M*$,s[7]=E*A+b*C+x*U+M*j,s[11]=E*_+b*L+x*N+M*se,s[15]=E*S+b*B+x*z+M*ie,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[4],n=e[8],s=e[12],o=e[1],a=e[5],c=e[9],l=e[13],h=e[2],d=e[6],u=e[10],f=e[14],g=e[3],v=e[7],m=e[11],p=e[15],E=c*f-l*u,b=a*f-l*d,x=a*u-c*d,M=o*f-l*h,T=o*u-c*h,A=o*d-a*h;return t*(v*E-m*b+p*x)-i*(g*E-m*M+p*T)+n*(g*b-v*M+p*A)-s*(g*x-v*T+m*A)}determinantAffine(){const e=this.elements,t=e[0],i=e[4],n=e[8],s=e[1],o=e[5],a=e[9],c=e[2],l=e[6],h=e[10];return t*(o*h-a*l)-i*(s*h-a*c)+n*(s*l-o*c)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){const n=this.elements;return e.isVector3?(n[12]=e.x,n[13]=e.y,n[14]=e.z):(n[12]=e,n[13]=t,n[14]=i),this}invert(){const e=this.elements,t=e[0],i=e[1],n=e[2],s=e[3],o=e[4],a=e[5],c=e[6],l=e[7],h=e[8],d=e[9],u=e[10],f=e[11],g=e[12],v=e[13],m=e[14],p=e[15],E=t*a-i*o,b=t*c-n*o,x=t*l-s*o,M=i*c-n*a,T=i*l-s*a,A=n*l-s*c,_=h*v-d*g,S=h*m-u*g,R=h*p-f*g,C=d*m-u*v,L=d*p-f*v,B=u*p-f*m,X=E*B-b*L+x*C+M*R-T*S+A*_;if(X===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const U=1/X;return e[0]=(a*B-c*L+l*C)*U,e[1]=(n*L-i*B-s*C)*U,e[2]=(v*A-m*T+p*M)*U,e[3]=(u*T-d*A-f*M)*U,e[4]=(c*R-o*B-l*S)*U,e[5]=(t*B-n*R+s*S)*U,e[6]=(m*x-g*A-p*b)*U,e[7]=(h*A-u*x+f*b)*U,e[8]=(o*L-a*R+l*_)*U,e[9]=(i*R-t*L-s*_)*U,e[10]=(g*T-v*x+p*E)*U,e[11]=(d*x-h*T-f*E)*U,e[12]=(a*S-o*C-c*_)*U,e[13]=(t*C-i*S+n*_)*U,e[14]=(v*b-g*M-m*E)*U,e[15]=(h*M-d*b+u*E)*U,this}scale(e){const t=this.elements,i=e.x,n=e.y,s=e.z;return t[0]*=i,t[4]*=n,t[8]*=s,t[1]*=i,t[5]*=n,t[9]*=s,t[2]*=i,t[6]*=n,t[10]*=s,t[3]*=i,t[7]*=n,t[11]*=s,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],n=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,n))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const i=Math.cos(t),n=Math.sin(t),s=1-i,o=e.x,a=e.y,c=e.z,l=s*o,h=s*a;return this.set(l*o+i,l*a-n*c,l*c+n*a,0,l*a+n*c,h*a+i,h*c-n*o,0,l*c-n*a,h*c+n*o,s*c*c+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,n,s,o){return this.set(1,i,s,0,e,1,o,0,t,n,1,0,0,0,0,1),this}compose(e,t,i){const n=this.elements,s=t._x,o=t._y,a=t._z,c=t._w,l=s+s,h=o+o,d=a+a,u=s*l,f=s*h,g=s*d,v=o*h,m=o*d,p=a*d,E=c*l,b=c*h,x=c*d,M=i.x,T=i.y,A=i.z;return n[0]=(1-(v+p))*M,n[1]=(f+x)*M,n[2]=(g-b)*M,n[3]=0,n[4]=(f-x)*T,n[5]=(1-(u+p))*T,n[6]=(m+E)*T,n[7]=0,n[8]=(g+b)*A,n[9]=(m-E)*A,n[10]=(1-(u+v))*A,n[11]=0,n[12]=e.x,n[13]=e.y,n[14]=e.z,n[15]=1,this}decompose(e,t,i){const n=this.elements;e.x=n[12],e.y=n[13],e.z=n[14];const s=this.determinantAffine();if(s===0)return i.set(1,1,1),t.identity(),this;let o=Ln.set(n[0],n[1],n[2]).length();const a=Ln.set(n[4],n[5],n[6]).length(),c=Ln.set(n[8],n[9],n[10]).length();s<0&&(o=-o),ai.copy(this);const l=1/o,h=1/a,d=1/c;return ai.elements[0]*=l,ai.elements[1]*=l,ai.elements[2]*=l,ai.elements[4]*=h,ai.elements[5]*=h,ai.elements[6]*=h,ai.elements[8]*=d,ai.elements[9]*=d,ai.elements[10]*=d,t.setFromRotationMatrix(ai),i.x=o,i.y=a,i.z=c,this}makePerspective(e,t,i,n,s,o,a=Mi,c=!1){const l=this.elements,h=2*s/(t-e),d=2*s/(i-n),u=(t+e)/(t-e),f=(i+n)/(i-n);let g,v;if(c)g=s/(o-s),v=o*s/(o-s);else if(a===Mi)g=-(o+s)/(o-s),v=-2*o*s/(o-s);else if(a===Hs)g=-o/(o-s),v=-o*s/(o-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=h,l[4]=0,l[8]=u,l[12]=0,l[1]=0,l[5]=d,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=g,l[14]=v,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,i,n,s,o,a=Mi,c=!1){const l=this.elements,h=2/(t-e),d=2/(i-n),u=-(t+e)/(t-e),f=-(i+n)/(i-n);let g,v;if(c)g=1/(o-s),v=o/(o-s);else if(a===Mi)g=-2/(o-s),v=-(o+s)/(o-s);else if(a===Hs)g=-1/(o-s),v=-s/(o-s);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=h,l[4]=0,l[8]=0,l[12]=u,l[1]=0,l[5]=d,l[9]=0,l[13]=f,l[2]=0,l[6]=0,l[10]=g,l[14]=v,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const t=this.elements,i=e.elements;for(let n=0;n<16;n++)if(t[n]!==i[n])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}};oo.prototype.isMatrix4=!0;let Oe=oo;const Ln=new D,ai=new Oe,Sf=new D(0,0,0),Ef=new D(1,1,1),Vi=new D,Qs=new D,Kt=new D,mc=new Oe,gc=new Nt;class di{constructor(e=0,t=0,i=0,n=di.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=n}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,n=this._order){return this._x=e,this._y=t,this._z=i,this._order=n,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){const n=e.elements,s=n[0],o=n[4],a=n[8],c=n[1],l=n[5],h=n[9],d=n[2],u=n[6],f=n[10];switch(t){case"XYZ":this._y=Math.asin(qe(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-o,s)):(this._x=Math.atan2(u,l),this._z=0);break;case"YXZ":this._x=Math.asin(-qe(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-d,s),this._z=0);break;case"ZXY":this._x=Math.asin(qe(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-d,f),this._z=Math.atan2(-o,l)):(this._y=0,this._z=Math.atan2(c,s));break;case"ZYX":this._y=Math.asin(-qe(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(u,f),this._z=Math.atan2(c,s)):(this._x=0,this._z=Math.atan2(-o,l));break;case"YZX":this._z=Math.asin(qe(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-h,l),this._y=Math.atan2(-d,s)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-qe(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(u,l),this._y=Math.atan2(a,s)):(this._x=Math.atan2(-h,f),this._y=0);break;default:Ne("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return mc.makeRotationFromQuaternion(e),this.setFromRotationMatrix(mc,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return gc.setFromEuler(this),this.setFromQuaternion(gc,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}di.DEFAULT_ORDER="XYZ";class au{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let Tf=0;const _c=new D,Nn=new Nt,Ai=new Oe,er=new D,gs=new D,wf=new D,Af=new Nt,xc=new D(1,0,0),vc=new D(0,1,0),yc=new D(0,0,1),bc={type:"added"},Rf={type:"removed"},Dn={type:"childadded",child:null},Do={type:"childremoved",child:null};class dt extends sn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Tf++}),this.uuid=rn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=dt.DEFAULT_UP.clone();const e=new D,t=new di,i=new Nt,n=new D(1,1,1);function s(){i.setFromEuler(t,!1)}function o(){t.setFromQuaternion(i,void 0,!1)}t._onChange(s),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:n},modelViewMatrix:{value:new Oe},normalMatrix:{value:new ke}}),this.matrix=new Oe,this.matrixWorld=new Oe,this.matrixAutoUpdate=dt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=dt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new au,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Nn.setFromAxisAngle(e,t),this.quaternion.multiply(Nn),this}rotateOnWorldAxis(e,t){return Nn.setFromAxisAngle(e,t),this.quaternion.premultiply(Nn),this}rotateX(e){return this.rotateOnAxis(xc,e)}rotateY(e){return this.rotateOnAxis(vc,e)}rotateZ(e){return this.rotateOnAxis(yc,e)}translateOnAxis(e,t){return _c.copy(e).applyQuaternion(this.quaternion),this.position.add(_c.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(xc,e)}translateY(e){return this.translateOnAxis(vc,e)}translateZ(e){return this.translateOnAxis(yc,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Ai.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?er.copy(e):er.set(e,t,i);const n=this.parent;this.updateWorldMatrix(!0,!1),gs.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Ai.lookAt(gs,er,this.up):Ai.lookAt(er,gs,this.up),this.quaternion.setFromRotationMatrix(Ai),n&&(Ai.extractRotation(n.matrixWorld),Nn.setFromRotationMatrix(Ai),this.quaternion.premultiply(Nn.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(We("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(bc),Dn.child=e,this.dispatchEvent(Dn),Dn.child=null):We("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Rf),Do.child=e,this.dispatchEvent(Do),Do.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Ai.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Ai.multiply(e.parent.matrixWorld)),e.applyMatrix4(Ai),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(bc),Dn.child=e,this.dispatchEvent(Dn),Dn.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,n=this.children.length;i<n;i++){const o=this.children[i].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);const n=this.children;for(let s=0,o=n.length;s<o;s++)n[s].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(gs,e,wf),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(gs,Af,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let i=0,n=t.length;i<n;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let i=0,n=t.length;i<n;i++)t[i].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);const e=this.pivot;if(e!==null){const t=e.x,i=e.y,n=e.z,s=this.matrix.elements;s[12]+=t-s[0]*t-s[4]*i-s[8]*n,s[13]+=i-s[1]*t-s[5]*i-s[9]*n,s[14]+=n-s[2]*t-s[6]*i-s[10]*n}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let i=0,n=t.length;i<n;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t,i=!1){const n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||i)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,i=!0),t===!0){const s=this.children;for(let o=0,a=s.length;o<a;o++)s[o].updateWorldMatrix(!1,!0,i)}}toJSON(e){const t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const n={};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.castShadow===!0&&(n.castShadow=!0),this.receiveShadow===!0&&(n.receiveShadow=!0),this.visible===!1&&(n.visible=!1),this.frustumCulled===!1&&(n.frustumCulled=!1),this.renderOrder!==0&&(n.renderOrder=this.renderOrder),this.static!==!1&&(n.static=this.static),Object.keys(this.userData).length>0&&(n.userData=this.userData),n.layers=this.layers.mask,n.matrix=this.matrix.toArray(),n.up=this.up.toArray(),this.pivot!==null&&(n.pivot=this.pivot.toArray()),this.matrixAutoUpdate===!1&&(n.matrixAutoUpdate=!1),this.morphTargetDictionary!==void 0&&(n.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(n.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(n.type="InstancedMesh",n.count=this.count,n.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(n.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(n.type="BatchedMesh",n.perObjectFrustumCulled=this.perObjectFrustumCulled,n.sortObjects=this.sortObjects,n.drawRanges=this._drawRanges,n.reservedRanges=this._reservedRanges,n.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),n.instanceInfo=this._instanceInfo.map(a=>({...a})),n.availableInstanceIds=this._availableInstanceIds.slice(),n.availableGeometryIds=this._availableGeometryIds.slice(),n.nextIndexStart=this._nextIndexStart,n.nextVertexStart=this._nextVertexStart,n.geometryCount=this._geometryCount,n.maxInstanceCount=this._maxInstanceCount,n.maxVertexCount=this._maxVertexCount,n.maxIndexCount=this._maxIndexCount,n.geometryInitialized=this._geometryInitialized,n.matricesTexture=this._matricesTexture.toJSON(e),n.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(n.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(n.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(n.boundingBox=this.boundingBox.toJSON()));function s(a,c){return a[c.uuid]===void 0&&(a[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?n.background=this.background.toJSON():this.background.isTexture&&(n.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(n.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){n.geometry=s(e.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const c=a.shapes;if(Array.isArray(c))for(let l=0,h=c.length;l<h;l++){const d=c[l];s(e.shapes,d)}else s(e.shapes,c)}}if(this.isSkinnedMesh&&(n.bindMode=this.bindMode,n.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),n.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let c=0,l=this.material.length;c<l;c++)a.push(s(e.materials,this.material[c]));n.material=a}else n.material=s(e.materials,this.material);if(this.children.length>0){n.children=[];for(let a=0;a<this.children.length;a++)n.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){n.animations=[];for(let a=0;a<this.animations.length;a++){const c=this.animations[a];n.animations.push(s(e.animations,c))}}if(t){const a=o(e.geometries),c=o(e.materials),l=o(e.textures),h=o(e.images),d=o(e.shapes),u=o(e.skeletons),f=o(e.animations),g=o(e.nodes);a.length>0&&(i.geometries=a),c.length>0&&(i.materials=c),l.length>0&&(i.textures=l),h.length>0&&(i.images=h),d.length>0&&(i.shapes=d),u.length>0&&(i.skeletons=u),f.length>0&&(i.animations=f),g.length>0&&(i.nodes=g)}return i.object=n,i;function o(a){const c=[];for(const l in a){const h=a[l];delete h.metadata,c.push(h)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){const n=e.children[i];this.add(n.clone())}return this}}dt.DEFAULT_UP=new D(0,1,0);dt.DEFAULT_MATRIX_AUTO_UPDATE=!0;dt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class en extends dt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const Cf={type:"move"};class Io{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new en,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new en,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new D,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new D),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new en,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new D,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new D,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let n=null,s=null,o=null;const a=this._targetRay,c=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){o=!0;for(const v of e.hand.values()){const m=t.getJointPose(v,i),p=this._getHandJoint(l,v);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}const h=l.joints["index-finger-tip"],d=l.joints["thumb-tip"],u=h.position.distanceTo(d.position),f=.02,g=.005;l.inputState.pinching&&u>f+g?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&u<=f-g&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,i),s!==null&&(c.matrix.fromArray(s.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,s.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(s.linearVelocity)):c.hasLinearVelocity=!1,s.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(s.angularVelocity)):c.hasAngularVelocity=!1,c.eventsEnabled&&c.dispatchEvent({type:"gripUpdated",data:e,target:this})));a!==null&&(n=t.getPose(e.targetRaySpace,i),n===null&&s!==null&&(n=s),n!==null&&(a.matrix.fromArray(n.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,n.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(n.linearVelocity)):a.hasLinearVelocity=!1,n.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(n.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Cf)))}return a!==null&&(a.visible=n!==null),c!==null&&(c.visible=s!==null),l!==null&&(l.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const i=new en;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}}const lu={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Wi={h:0,s:0,l:0},tr={h:0,s:0,l:0};function Uo(r,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?r+(e-r)*6*t:t<1/2?e:t<2/3?r+(e-r)*6*(2/3-t):r}class Be{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){const n=e;n&&n.isColor?this.copy(n):typeof n=="number"?this.setHex(n):typeof n=="string"&&this.setStyle(n)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=ht){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Xe.colorSpaceToWorking(this,t),this}setRGB(e,t,i,n=Xe.workingColorSpace){return this.r=e,this.g=t,this.b=i,Xe.colorSpaceToWorking(this,n),this}setHSL(e,t,i,n=Xe.workingColorSpace){if(e=vl(e,1),t=qe(t,0,1),i=qe(i,0,1),t===0)this.r=this.g=this.b=i;else{const s=i<=.5?i*(1+t):i+t-i*t,o=2*i-s;this.r=Uo(o,s,e+1/3),this.g=Uo(o,s,e),this.b=Uo(o,s,e-1/3)}return Xe.colorSpaceToWorking(this,n),this}setStyle(e,t=ht){function i(s){s!==void 0&&parseFloat(s)<1&&Ne("Color: Alpha component of "+e+" will be ignored.")}let n;if(n=/^(\w+)\(([^\)]*)\)/.exec(e)){let s;const o=n[1],a=n[2];switch(o){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:Ne("Color: Unknown color model "+e)}}else if(n=/^\#([A-Fa-f\d]+)$/.exec(e)){const s=n[1],o=s.length;if(o===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(s,16),t);Ne("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=ht){const i=lu[e.toLowerCase()];return i!==void 0?this.setHex(i,t):Ne("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Fi(e.r),this.g=Fi(e.g),this.b=Fi(e.b),this}copyLinearToSRGB(e){return this.r=es(e.r),this.g=es(e.g),this.b=es(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=ht){return Xe.workingToColorSpace(Bt.copy(this),e),Math.round(qe(Bt.r*255,0,255))*65536+Math.round(qe(Bt.g*255,0,255))*256+Math.round(qe(Bt.b*255,0,255))}getHexString(e=ht){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Xe.workingColorSpace){Xe.workingToColorSpace(Bt.copy(this),t);const i=Bt.r,n=Bt.g,s=Bt.b,o=Math.max(i,n,s),a=Math.min(i,n,s);let c,l;const h=(a+o)/2;if(a===o)c=0,l=0;else{const d=o-a;switch(l=h<=.5?d/(o+a):d/(2-o-a),o){case i:c=(n-s)/d+(n<s?6:0);break;case n:c=(s-i)/d+2;break;case s:c=(i-n)/d+4;break}c/=6}return e.h=c,e.s=l,e.l=h,e}getRGB(e,t=Xe.workingColorSpace){return Xe.workingToColorSpace(Bt.copy(this),t),e.r=Bt.r,e.g=Bt.g,e.b=Bt.b,e}getStyle(e=ht){Xe.workingToColorSpace(Bt.copy(this),e);const t=Bt.r,i=Bt.g,n=Bt.b;return e!==ht?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${n.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(n*255)})`}offsetHSL(e,t,i){return this.getHSL(Wi),this.setHSL(Wi.h+e,Wi.s+t,Wi.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(Wi),e.getHSL(tr);const i=Is(Wi.h,tr.h,t),n=Is(Wi.s,tr.s,t),s=Is(Wi.l,tr.l,t);return this.setHSL(i,n,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,i=this.g,n=this.b,s=e.elements;return this.r=s[0]*t+s[3]*i+s[6]*n,this.g=s[1]*t+s[4]*i+s[7]*n,this.b=s[2]*t+s[5]*i+s[8]*n,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Bt=new Be;Be.NAMES=lu;class bl extends dt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new di,this.environmentIntensity=1,this.environmentRotation=new di,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}const li=new D,Ri=new D,Fo=new D,Ci=new D,In=new D,Un=new D,Mc=new D,Oo=new D,ko=new D,Bo=new D,zo=new st,Ho=new st,Go=new st;class ri{constructor(e=new D,t=new D,i=new D){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,n){n.subVectors(i,t),li.subVectors(e,t),n.cross(li);const s=n.lengthSq();return s>0?n.multiplyScalar(1/Math.sqrt(s)):n.set(0,0,0)}static getBarycoord(e,t,i,n,s){li.subVectors(n,t),Ri.subVectors(i,t),Fo.subVectors(e,t);const o=li.dot(li),a=li.dot(Ri),c=li.dot(Fo),l=Ri.dot(Ri),h=Ri.dot(Fo),d=o*l-a*a;if(d===0)return s.set(0,0,0),null;const u=1/d,f=(l*c-a*h)*u,g=(o*h-a*c)*u;return s.set(1-f-g,g,f)}static containsPoint(e,t,i,n){return this.getBarycoord(e,t,i,n,Ci)===null?!1:Ci.x>=0&&Ci.y>=0&&Ci.x+Ci.y<=1}static getInterpolation(e,t,i,n,s,o,a,c){return this.getBarycoord(e,t,i,n,Ci)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(s,Ci.x),c.addScaledVector(o,Ci.y),c.addScaledVector(a,Ci.z),c)}static getInterpolatedAttribute(e,t,i,n,s,o){return zo.setScalar(0),Ho.setScalar(0),Go.setScalar(0),zo.fromBufferAttribute(e,t),Ho.fromBufferAttribute(e,i),Go.fromBufferAttribute(e,n),o.setScalar(0),o.addScaledVector(zo,s.x),o.addScaledVector(Ho,s.y),o.addScaledVector(Go,s.z),o}static isFrontFacing(e,t,i,n){return li.subVectors(i,t),Ri.subVectors(e,t),li.cross(Ri).dot(n)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,n){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[n]),this}setFromAttributeAndIndices(e,t,i,n){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,n),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return li.subVectors(this.c,this.b),Ri.subVectors(this.a,this.b),li.cross(Ri).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return ri.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return ri.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,n,s){return ri.getInterpolation(e,this.a,this.b,this.c,t,i,n,s)}containsPoint(e){return ri.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return ri.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const i=this.a,n=this.b,s=this.c;let o,a;In.subVectors(n,i),Un.subVectors(s,i),Oo.subVectors(e,i);const c=In.dot(Oo),l=Un.dot(Oo);if(c<=0&&l<=0)return t.copy(i);ko.subVectors(e,n);const h=In.dot(ko),d=Un.dot(ko);if(h>=0&&d<=h)return t.copy(n);const u=c*d-h*l;if(u<=0&&c>=0&&h<=0)return o=c/(c-h),t.copy(i).addScaledVector(In,o);Bo.subVectors(e,s);const f=In.dot(Bo),g=Un.dot(Bo);if(g>=0&&f<=g)return t.copy(s);const v=f*l-c*g;if(v<=0&&l>=0&&g<=0)return a=l/(l-g),t.copy(i).addScaledVector(Un,a);const m=h*g-f*d;if(m<=0&&d-h>=0&&f-g>=0)return Mc.subVectors(s,n),a=(d-h)/(d-h+(f-g)),t.copy(n).addScaledVector(Mc,a);const p=1/(m+v+u);return o=v*p,a=u*p,t.copy(i).addScaledVector(In,o).addScaledVector(Un,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}class hs{constructor(e=new D(1/0,1/0,1/0),t=new D(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(ci.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(ci.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const i=ci.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const i=e.geometry;if(i!==void 0){const s=i.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=s.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,ci):ci.fromBufferAttribute(s,o),ci.applyMatrix4(e.matrixWorld),this.expandByPoint(ci);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),ir.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),ir.copy(i.boundingBox)),ir.applyMatrix4(e.matrixWorld),this.union(ir)}const n=e.children;for(let s=0,o=n.length;s<o;s++)this.expandByObject(n[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,ci),ci.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(_s),nr.subVectors(this.max,_s),Fn.subVectors(e.a,_s),On.subVectors(e.b,_s),kn.subVectors(e.c,_s),Xi.subVectors(On,Fn),qi.subVectors(kn,On),ln.subVectors(Fn,kn);let t=[0,-Xi.z,Xi.y,0,-qi.z,qi.y,0,-ln.z,ln.y,Xi.z,0,-Xi.x,qi.z,0,-qi.x,ln.z,0,-ln.x,-Xi.y,Xi.x,0,-qi.y,qi.x,0,-ln.y,ln.x,0];return!Vo(t,Fn,On,kn,nr)||(t=[1,0,0,0,1,0,0,0,1],!Vo(t,Fn,On,kn,nr))?!1:(sr.crossVectors(Xi,qi),t=[sr.x,sr.y,sr.z],Vo(t,Fn,On,kn,nr))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,ci).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(ci).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Pi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Pi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Pi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Pi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Pi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Pi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Pi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Pi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Pi),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const Pi=[new D,new D,new D,new D,new D,new D,new D,new D],ci=new D,ir=new hs,Fn=new D,On=new D,kn=new D,Xi=new D,qi=new D,ln=new D,_s=new D,nr=new D,sr=new D,cn=new D;function Vo(r,e,t,i,n){for(let s=0,o=r.length-3;s<=o;s+=3){cn.fromArray(r,s);const a=n.x*Math.abs(cn.x)+n.y*Math.abs(cn.y)+n.z*Math.abs(cn.z),c=e.dot(cn),l=t.dot(cn),h=i.dot(cn);if(Math.max(-Math.max(c,l,h),Math.min(c,l,h))>a)return!1}return!0}const Mt=new D,rr=new Ue;let Pf=0;class ti extends sn{constructor(e,t,i=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Pf++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=ac,this.updateRanges=[],this.gpuType=hi,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let n=0,s=this.itemSize;n<s;n++)this.array[e+n]=t.array[i+n];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)rr.fromBufferAttribute(this,t),rr.applyMatrix3(e),this.setXY(t,rr.x,rr.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)Mt.fromBufferAttribute(this,t),Mt.applyMatrix3(e),this.setXYZ(t,Mt.x,Mt.y,Mt.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)Mt.fromBufferAttribute(this,t),Mt.applyMatrix4(e),this.setXYZ(t,Mt.x,Mt.y,Mt.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)Mt.fromBufferAttribute(this,t),Mt.applyNormalMatrix(e),this.setXYZ(t,Mt.x,Mt.y,Mt.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)Mt.fromBufferAttribute(this,t),Mt.transformDirection(e),this.setXYZ(t,Mt.x,Mt.y,Mt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=qn(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=Gt(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=qn(t,this.array)),t}setX(e,t){return this.normalized&&(t=Gt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=qn(t,this.array)),t}setY(e,t){return this.normalized&&(t=Gt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=qn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Gt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=qn(t,this.array)),t}setW(e,t){return this.normalized&&(t=Gt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=Gt(t,this.array),i=Gt(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,n){return e*=this.itemSize,this.normalized&&(t=Gt(t,this.array),i=Gt(i,this.array),n=Gt(n,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=n,this}setXYZW(e,t,i,n,s){return e*=this.itemSize,this.normalized&&(t=Gt(t,this.array),i=Gt(i,this.array),n=Gt(n,this.array),s=Gt(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=n,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==ac&&(e.usage=this.usage),e}dispose(){this.dispatchEvent({type:"dispose"})}}class cu extends ti{constructor(e,t,i){super(new Uint16Array(e),t,i)}}class hu extends ti{constructor(e,t,i){super(new Uint32Array(e),t,i)}}class je extends ti{constructor(e,t,i){super(new Float32Array(e),t,i)}}const Lf=new hs,xs=new D,Wo=new D;class us{constructor(e=new D,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const i=this.center;t!==void 0?i.copy(t):Lf.setFromPoints(e).getCenter(i);let n=0;for(let s=0,o=e.length;s<o;s++)n=Math.max(n,i.distanceToSquared(e[s]));return this.radius=Math.sqrt(n),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;xs.subVectors(e,this.center);const t=xs.lengthSq();if(t>this.radius*this.radius){const i=Math.sqrt(t),n=(i-this.radius)*.5;this.center.addScaledVector(xs,n/i),this.radius+=n}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Wo.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(xs.copy(e.center).add(Wo)),this.expandByPoint(xs.copy(e.center).sub(Wo))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}let Nf=0;const ni=new Oe,Xo=new dt,Bn=new D,Zt=new hs,vs=new hs,Pt=new D;class wt extends sn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Nf++}),this.uuid=rn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Kd(e)?hu:cu)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const s=new ke().getNormalMatrix(e);i.applyNormalMatrix(s),i.needsUpdate=!0}const n=this.attributes.tangent;return n!==void 0&&(n.transformDirection(e),n.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return ni.makeRotationFromQuaternion(e),this.applyMatrix4(ni),this}rotateX(e){return ni.makeRotationX(e),this.applyMatrix4(ni),this}rotateY(e){return ni.makeRotationY(e),this.applyMatrix4(ni),this}rotateZ(e){return ni.makeRotationZ(e),this.applyMatrix4(ni),this}translate(e,t,i){return ni.makeTranslation(e,t,i),this.applyMatrix4(ni),this}scale(e,t,i){return ni.makeScale(e,t,i),this.applyMatrix4(ni),this}lookAt(e){return Xo.lookAt(e),Xo.updateMatrix(),this.applyMatrix4(Xo.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Bn).negate(),this.translate(Bn.x,Bn.y,Bn.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const i=[];for(let n=0,s=e.length;n<s;n++){const o=e[n];i.push(o.x,o.y,o.z||0)}this.setAttribute("position",new je(i,3))}else{const i=Math.min(e.length,t.count);for(let n=0;n<i;n++){const s=e[n];t.setXYZ(n,s.x,s.y,s.z||0)}e.length>t.count&&Ne("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new hs);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){We("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new D(-1/0,-1/0,-1/0),new D(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,n=t.length;i<n;i++){const s=t[i];Zt.setFromBufferAttribute(s),this.morphTargetsRelative?(Pt.addVectors(this.boundingBox.min,Zt.min),this.boundingBox.expandByPoint(Pt),Pt.addVectors(this.boundingBox.max,Zt.max),this.boundingBox.expandByPoint(Pt)):(this.boundingBox.expandByPoint(Zt.min),this.boundingBox.expandByPoint(Zt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&We('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new us);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){We("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new D,1/0);return}if(e){const i=this.boundingSphere.center;if(Zt.setFromBufferAttribute(e),t)for(let s=0,o=t.length;s<o;s++){const a=t[s];vs.setFromBufferAttribute(a),this.morphTargetsRelative?(Pt.addVectors(Zt.min,vs.min),Zt.expandByPoint(Pt),Pt.addVectors(Zt.max,vs.max),Zt.expandByPoint(Pt)):(Zt.expandByPoint(vs.min),Zt.expandByPoint(vs.max))}Zt.getCenter(i);let n=0;for(let s=0,o=e.count;s<o;s++)Pt.fromBufferAttribute(e,s),n=Math.max(n,i.distanceToSquared(Pt));if(t)for(let s=0,o=t.length;s<o;s++){const a=t[s],c=this.morphTargetsRelative;for(let l=0,h=a.count;l<h;l++)Pt.fromBufferAttribute(a,l),c&&(Bn.fromBufferAttribute(e,l),Pt.add(Bn)),n=Math.max(n,i.distanceToSquared(Pt))}this.boundingSphere.radius=Math.sqrt(n),isNaN(this.boundingSphere.radius)&&We('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){We("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=t.position,n=t.normal,s=t.uv;let o=this.getAttribute("tangent");(o===void 0||o.count!==i.count)&&(o=new ti(new Float32Array(4*i.count),4),this.setAttribute("tangent",o));const a=[],c=[];for(let _=0;_<i.count;_++)a[_]=new D,c[_]=new D;const l=new D,h=new D,d=new D,u=new Ue,f=new Ue,g=new Ue,v=new D,m=new D;function p(_,S,R){l.fromBufferAttribute(i,_),h.fromBufferAttribute(i,S),d.fromBufferAttribute(i,R),u.fromBufferAttribute(s,_),f.fromBufferAttribute(s,S),g.fromBufferAttribute(s,R),h.sub(l),d.sub(l),f.sub(u),g.sub(u);const C=1/(f.x*g.y-g.x*f.y);isFinite(C)&&(v.copy(h).multiplyScalar(g.y).addScaledVector(d,-f.y).multiplyScalar(C),m.copy(d).multiplyScalar(f.x).addScaledVector(h,-g.x).multiplyScalar(C),a[_].add(v),a[S].add(v),a[R].add(v),c[_].add(m),c[S].add(m),c[R].add(m))}let E=this.groups;E.length===0&&(E=[{start:0,count:e.count}]);for(let _=0,S=E.length;_<S;++_){const R=E[_],C=R.start,L=R.count;for(let B=C,X=C+L;B<X;B+=3)p(e.getX(B+0),e.getX(B+1),e.getX(B+2))}const b=new D,x=new D,M=new D,T=new D;function A(_){M.fromBufferAttribute(n,_),T.copy(M);const S=a[_];b.copy(S),b.sub(M.multiplyScalar(M.dot(S))).normalize(),x.crossVectors(T,S);const C=x.dot(c[_])<0?-1:1;o.setXYZW(_,b.x,b.y,b.z,C)}for(let _=0,S=E.length;_<S;++_){const R=E[_],C=R.start,L=R.count;for(let B=C,X=C+L;B<X;B+=3)A(e.getX(B+0)),A(e.getX(B+1)),A(e.getX(B+2))}this._transformed=!0}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==t.count)i=new ti(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let u=0,f=i.count;u<f;u++)i.setXYZ(u,0,0,0);const n=new D,s=new D,o=new D,a=new D,c=new D,l=new D,h=new D,d=new D;if(e)for(let u=0,f=e.count;u<f;u+=3){const g=e.getX(u+0),v=e.getX(u+1),m=e.getX(u+2);n.fromBufferAttribute(t,g),s.fromBufferAttribute(t,v),o.fromBufferAttribute(t,m),h.subVectors(o,s),d.subVectors(n,s),h.cross(d),a.fromBufferAttribute(i,g),c.fromBufferAttribute(i,v),l.fromBufferAttribute(i,m),a.add(h),c.add(h),l.add(h),i.setXYZ(g,a.x,a.y,a.z),i.setXYZ(v,c.x,c.y,c.z),i.setXYZ(m,l.x,l.y,l.z)}else for(let u=0,f=t.count;u<f;u+=3)n.fromBufferAttribute(t,u+0),s.fromBufferAttribute(t,u+1),o.fromBufferAttribute(t,u+2),h.subVectors(o,s),d.subVectors(n,s),h.cross(d),i.setXYZ(u+0,h.x,h.y,h.z),i.setXYZ(u+1,h.x,h.y,h.z),i.setXYZ(u+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)Pt.fromBufferAttribute(e,t),Pt.normalize(),e.setXYZ(t,Pt.x,Pt.y,Pt.z)}toNonIndexed(){function e(a,c){const l=a.array,h=a.itemSize,d=a.normalized,u=new l.constructor(c.length*h);let f=0,g=0;for(let v=0,m=c.length;v<m;v++){a.isInterleavedBufferAttribute?f=c[v]*a.data.stride+a.offset:f=c[v]*h;for(let p=0;p<h;p++)u[g++]=l[f++]}return new ti(u,h,d)}if(this.index===null)return Ne("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new wt,i=this.index.array,n=this.attributes;for(const a in n){const c=n[a],l=e(c,i);t.setAttribute(a,l)}const s=this.morphAttributes;for(const a in s){const c=[],l=s[a];for(let h=0,d=l.length;h<d;h++){const u=l[h],f=e(u,i);c.push(f)}t.morphAttributes[a]=c}t.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,c=o.length;a<c;a++){const l=o[a];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){const c=this.parameters;for(const l in c)c[l]!==void 0&&(e[l]=c[l]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const i=this.attributes;for(const c in i){const l=i[c];e.data.attributes[c]=l.toJSON(e.data)}const n={};let s=!1;for(const c in this.morphAttributes){const l=this.morphAttributes[c],h=[];for(let d=0,u=l.length;d<u;d++){const f=l[d];h.push(f.toJSON(e.data))}h.length>0&&(n[c]=h,s=!0)}s&&(e.data.morphAttributes=n,e.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(e.data.boundingSphere=a.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const i=e.index;i!==null&&this.setIndex(i.clone());const n=e.attributes;for(const l in n){const h=n[l];this.setAttribute(l,h.clone(t))}const s=e.morphAttributes;for(const l in s){const h=[],d=s[l];for(let u=0,f=d.length;u<f;u++)h.push(d[u].clone(t));this.morphAttributes[l]=h}this.morphTargetsRelative=e.morphTargetsRelative;const o=e.groups;for(let l=0,h=o.length;l<h;l++){const d=o[l];this.addGroup(d.start,d.count,d.materialIndex)}const a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());const c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}}let Df=0;class wn extends sn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Df++}),this.uuid=rn(),this.name="",this.type="Material",this.blending=jn,this.side=Oi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=ga,this.blendDst=_a,this.blendEquation=xn,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Be(0,0,0),this.blendAlpha=0,this.depthFunc=ns,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=oc,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Cn,this.stencilZFail=Cn,this.stencilZPass=Cn,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const i=e[t];if(i===void 0){Ne(`Material: parameter '${t}' has value of undefined.`);continue}const n=this[t];if(n===void 0){Ne(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}n&&n.isColor?n.set(i):n&&n.isVector2&&i&&i.isVector2||n&&n.isEuler&&i&&i.isEuler||n&&n.isVector3&&i&&i.isVector3?n.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==jn&&(i.blending=this.blending),this.side!==Oi&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==ga&&(i.blendSrc=this.blendSrc),this.blendDst!==_a&&(i.blendDst=this.blendDst),this.blendEquation!==xn&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==ns&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==oc&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Cn&&(i.stencilFail=this.stencilFail),this.stencilZFail!==Cn&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==Cn&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.allowOverride===!1&&(i.allowOverride=!1),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function n(s){const o=[];for(const a in s){const c=s[a];delete c.metadata,o.push(c)}return o}if(t){const s=n(e.textures),o=n(e.images);s.length>0&&(i.textures=s),o.length>0&&(i.images=o)}return i}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Be().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let i=e.normalScale;Array.isArray(i)===!1&&(i=[i,i]),this.normalScale=new Ue().fromArray(i)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Ue().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let i=null;if(t!==null){const n=t.length;i=new Array(n);for(let s=0;s!==n;++s)i[s]=t[s].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}const Li=new D,qo=new D,or=new D,$i=new D,$o=new D,ar=new D,Yo=new D;class co{constructor(e=new D,t=new D(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Li)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=Li.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Li.copy(this.origin).addScaledVector(this.direction,t),Li.distanceToSquared(e))}distanceSqToSegment(e,t,i,n){qo.copy(e).add(t).multiplyScalar(.5),or.copy(t).sub(e).normalize(),$i.copy(this.origin).sub(qo);const s=e.distanceTo(t)*.5,o=-this.direction.dot(or),a=$i.dot(this.direction),c=-$i.dot(or),l=$i.lengthSq(),h=Math.abs(1-o*o);let d,u,f,g;if(h>0)if(d=o*c-a,u=o*a-c,g=s*h,d>=0)if(u>=-g)if(u<=g){const v=1/h;d*=v,u*=v,f=d*(d+o*u+2*a)+u*(o*d+u+2*c)+l}else u=s,d=Math.max(0,-(o*u+a)),f=-d*d+u*(u+2*c)+l;else u=-s,d=Math.max(0,-(o*u+a)),f=-d*d+u*(u+2*c)+l;else u<=-g?(d=Math.max(0,-(-o*s+a)),u=d>0?-s:Math.min(Math.max(-s,-c),s),f=-d*d+u*(u+2*c)+l):u<=g?(d=0,u=Math.min(Math.max(-s,-c),s),f=u*(u+2*c)+l):(d=Math.max(0,-(o*s+a)),u=d>0?s:Math.min(Math.max(-s,-c),s),f=-d*d+u*(u+2*c)+l);else u=o>0?-s:s,d=Math.max(0,-(o*u+a)),f=-d*d+u*(u+2*c)+l;return i&&i.copy(this.origin).addScaledVector(this.direction,d),n&&n.copy(qo).addScaledVector(or,u),f}intersectSphere(e,t){Li.subVectors(e.center,this.origin);const i=Li.dot(this.direction),n=Li.dot(Li)-i*i,s=e.radius*e.radius;if(n>s)return null;const o=Math.sqrt(s-n),a=i-o,c=i+o;return c<0?null:a<0?this.at(c,t):this.at(a,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){const i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,n,s,o,a,c;const l=1/this.direction.x,h=1/this.direction.y,d=1/this.direction.z,u=this.origin;return l>=0?(i=(e.min.x-u.x)*l,n=(e.max.x-u.x)*l):(i=(e.max.x-u.x)*l,n=(e.min.x-u.x)*l),h>=0?(s=(e.min.y-u.y)*h,o=(e.max.y-u.y)*h):(s=(e.max.y-u.y)*h,o=(e.min.y-u.y)*h),i>o||s>n||((s>i||isNaN(i))&&(i=s),(o<n||isNaN(n))&&(n=o),d>=0?(a=(e.min.z-u.z)*d,c=(e.max.z-u.z)*d):(a=(e.max.z-u.z)*d,c=(e.min.z-u.z)*d),i>c||a>n)||((a>i||i!==i)&&(i=a),(c<n||n!==n)&&(n=c),n<0)?null:this.at(i>=0?i:n,t)}intersectsBox(e){return this.intersectBox(e,Li)!==null}intersectTriangle(e,t,i,n,s){$o.subVectors(t,e),ar.subVectors(i,e),Yo.crossVectors($o,ar);let o=this.direction.dot(Yo),a;if(o>0){if(n)return null;a=1}else if(o<0)a=-1,o=-o;else return null;$i.subVectors(this.origin,e);const c=a*this.direction.dot(ar.crossVectors($i,ar));if(c<0)return null;const l=a*this.direction.dot($o.cross($i));if(l<0||c+l>o)return null;const h=-a*$i.dot(Yo);return h<0?null:this.at(h/o,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class os extends wn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Be(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new di,this.combine=ao,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const Sc=new Oe,hn=new co,lr=new us,Ec=new D,cr=new D,hr=new D,ur=new D,Ko=new D,dr=new D,Tc=new D,fr=new D;class Ft extends dt{constructor(e=new wt,t=new os){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const n=t[i[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=n.length;s<o;s++){const a=n[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}getVertexPosition(e,t){const i=this.geometry,n=i.attributes.position,s=i.morphAttributes.position,o=i.morphTargetsRelative;t.fromBufferAttribute(n,e);const a=this.morphTargetInfluences;if(s&&a){dr.set(0,0,0);for(let c=0,l=s.length;c<l;c++){const h=a[c],d=s[c];h!==0&&(Ko.fromBufferAttribute(d,e),o?dr.addScaledVector(Ko,h):dr.addScaledVector(Ko.sub(t),h))}t.add(dr)}return t}raycast(e,t){const i=this.geometry,n=this.material,s=this.matrixWorld;n!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),lr.copy(i.boundingSphere),lr.applyMatrix4(s),hn.copy(e.ray).recast(e.near),!(lr.containsPoint(hn.origin)===!1&&(hn.intersectSphere(lr,Ec)===null||hn.origin.distanceToSquared(Ec)>(e.far-e.near)**2))&&(Sc.copy(s).invert(),hn.copy(e.ray).applyMatrix4(Sc),!(i.boundingBox!==null&&hn.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,hn)))}_computeIntersections(e,t,i){let n;const s=this.geometry,o=this.material,a=s.index,c=s.attributes.position,l=s.attributes.uv,h=s.attributes.uv1,d=s.attributes.normal,u=s.groups,f=s.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,v=u.length;g<v;g++){const m=u[g],p=o[m.materialIndex],E=Math.max(m.start,f.start),b=Math.min(a.count,Math.min(m.start+m.count,f.start+f.count));for(let x=E,M=b;x<M;x+=3){const T=a.getX(x),A=a.getX(x+1),_=a.getX(x+2);n=pr(this,p,e,i,l,h,d,T,A,_),n&&(n.faceIndex=Math.floor(x/3),n.face.materialIndex=m.materialIndex,t.push(n))}}else{const g=Math.max(0,f.start),v=Math.min(a.count,f.start+f.count);for(let m=g,p=v;m<p;m+=3){const E=a.getX(m),b=a.getX(m+1),x=a.getX(m+2);n=pr(this,o,e,i,l,h,d,E,b,x),n&&(n.faceIndex=Math.floor(m/3),t.push(n))}}else if(c!==void 0)if(Array.isArray(o))for(let g=0,v=u.length;g<v;g++){const m=u[g],p=o[m.materialIndex],E=Math.max(m.start,f.start),b=Math.min(c.count,Math.min(m.start+m.count,f.start+f.count));for(let x=E,M=b;x<M;x+=3){const T=x,A=x+1,_=x+2;n=pr(this,p,e,i,l,h,d,T,A,_),n&&(n.faceIndex=Math.floor(x/3),n.face.materialIndex=m.materialIndex,t.push(n))}}else{const g=Math.max(0,f.start),v=Math.min(c.count,f.start+f.count);for(let m=g,p=v;m<p;m+=3){const E=m,b=m+1,x=m+2;n=pr(this,o,e,i,l,h,d,E,b,x),n&&(n.faceIndex=Math.floor(m/3),t.push(n))}}}}function If(r,e,t,i,n,s,o,a){let c;if(e.side===$t?c=i.intersectTriangle(o,s,n,!0,a):c=i.intersectTriangle(n,s,o,e.side===Oi,a),c===null)return null;fr.copy(a),fr.applyMatrix4(r.matrixWorld);const l=t.ray.origin.distanceTo(fr);return l<t.near||l>t.far?null:{distance:l,point:fr.clone(),object:r}}function pr(r,e,t,i,n,s,o,a,c,l){r.getVertexPosition(a,cr),r.getVertexPosition(c,hr),r.getVertexPosition(l,ur);const h=If(r,e,t,i,cr,hr,ur,Tc);if(h){const d=new D;ri.getBarycoord(Tc,cr,hr,ur,d),n&&(h.uv=ri.getInterpolatedAttribute(n,a,c,l,d,new Ue)),s&&(h.uv1=ri.getInterpolatedAttribute(s,a,c,l,d,new Ue)),o&&(h.normal=ri.getInterpolatedAttribute(o,a,c,l,d,new D),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));const u={a,b:c,c:l,normal:new D,materialIndex:0};ri.getNormal(cr,hr,ur,u.normal),h.face=u,h.barycoord=d}return h}const ys=new st,wc=new st,Ac=new st,Uf=new st,Rc=new Oe,mr=new D,Zo=new us,Cc=new Oe,Jo=new co;class Ff extends Ft{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=ic,this.bindMatrix=new Oe,this.bindMatrixInverse=new Oe,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){const e=this.geometry;this.boundingBox===null&&(this.boundingBox=new hs),this.boundingBox.makeEmpty();const t=e.getAttribute("position");for(let i=0;i<t.count;i++)this.getVertexPosition(i,mr),this.boundingBox.expandByPoint(mr)}computeBoundingSphere(){const e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new us),this.boundingSphere.makeEmpty();const t=e.getAttribute("position");for(let i=0;i<t.count;i++)this.getVertexPosition(i,mr),this.boundingSphere.expandByPoint(mr)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){const i=this.material,n=this.matrixWorld;i!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Zo.copy(this.boundingSphere),Zo.applyMatrix4(n),e.ray.intersectsSphere(Zo)!==!1&&(Cc.copy(n).invert(),Jo.copy(e.ray).applyMatrix4(Cc),!(this.boundingBox!==null&&Jo.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,Jo)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){const e=new st,t=this.geometry.attributes.skinWeight;for(let i=0,n=t.count;i<n;i++){e.fromBufferAttribute(t,i);const s=1/e.manhattanLength();s!==1/0?e.multiplyScalar(s):e.set(1,0,0,0),t.setXYZW(i,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===ic?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===kd?this.bindMatrixInverse.copy(this.bindMatrix).invert():Ne("SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){const i=this.skeleton,n=this.geometry;wc.fromBufferAttribute(n.attributes.skinIndex,e),Ac.fromBufferAttribute(n.attributes.skinWeight,e),t.isVector4?(ys.copy(t),t.set(0,0,0,0)):(ys.set(...t,1),t.set(0,0,0)),ys.applyMatrix4(this.bindMatrix);for(let s=0;s<4;s++){const o=Ac.getComponent(s);if(o!==0){const a=wc.getComponent(s);Rc.multiplyMatrices(i.bones[a].matrixWorld,i.boneInverses[a]),t.addScaledVector(Uf.copy(ys).applyMatrix4(Rc),o)}}return t.isVector4&&(t.w=ys.w),t.applyMatrix4(this.bindMatrixInverse)}}class uu extends dt{constructor(){super(),this.isBone=!0,this.type="Bone"}}class Kr extends zt{constructor(e=null,t=1,i=1,n,s,o,a,c,l=Ut,h=Ut,d,u){super(null,o,a,c,l,h,n,s,d,u),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const Pc=new Oe,Of=new Oe;class Ml{constructor(e=[],t=[]){this.uuid=rn(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){const e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){Ne("Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let i=0,n=this.bones.length;i<n;i++)this.boneInverses.push(new Oe)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){const i=new Oe;this.bones[e]&&i.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(i)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){const i=this.bones[e];i&&i.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){const i=this.bones[e];i&&(i.parent&&i.parent.isBone?(i.matrix.copy(i.parent.matrixWorld).invert(),i.matrix.multiply(i.matrixWorld)):i.matrix.copy(i.matrixWorld),i.matrix.decompose(i.position,i.quaternion,i.scale))}}update(){const e=this.bones,t=this.boneInverses,i=this.boneMatrices,n=this.boneTexture;for(let s=0,o=e.length;s<o;s++){const a=e[s]?e[s].matrixWorld:Of;Pc.multiplyMatrices(a,t[s]),Pc.toArray(i,s*16)}n!==null&&(n.needsUpdate=!0)}clone(){return new Ml(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);const t=new Float32Array(e*e*4);t.set(this.boneMatrices);const i=new Kr(t,e,e,oi,hi);return i.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=i,this}getBoneByName(e){for(let t=0,i=this.bones.length;t<i;t++){const n=this.bones[t];if(n.name===e)return n}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let i=0,n=e.bones.length;i<n;i++){const s=e.bones[i];let o=t[s];o===void 0&&(Ne("Skeleton: No bone found with UUID:",s),o=new uu),this.bones.push(o),this.boneInverses.push(new Oe().fromArray(e.boneInverses[i]))}return this.init(),this}toJSON(){const e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;const t=this.bones,i=this.boneInverses;for(let n=0,s=t.length;n<s;n++){const o=t[n];e.bones.push(o.uuid);const a=i[n];e.boneInverses.push(a.toArray())}return e}}const jo=new D,kf=new D,Bf=new ke;class ji{constructor(e=new D(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,n){return this.normal.set(e,t,i),this.constant=n,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){const n=jo.subVectors(i,t).cross(kf.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(n,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,i=!0){const n=e.delta(jo),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const o=-(e.start.dot(this.normal)+this.constant)/s;return i===!0&&(o<0||o>1)?null:t.copy(e.start).addScaledVector(n,o)}intersectsLine(e){const t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const i=t||Bf.getNormalMatrix(e),n=this.coplanarPoint(jo).applyMatrix4(e),s=this.normal.applyMatrix3(i).normalize();return this.constant=-n.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const un=new us,zf=new Ue(.5,.5),gr=new D;class Sl{constructor(e=new ji,t=new ji,i=new ji,n=new ji,s=new ji,o=new ji){this.planes=[e,t,i,n,s,o]}set(e,t,i,n,s,o){const a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(i),a[3].copy(n),a[4].copy(s),a[5].copy(o),this}copy(e){const t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=Mi,i=!1){const n=this.planes,s=e.elements,o=s[0],a=s[1],c=s[2],l=s[3],h=s[4],d=s[5],u=s[6],f=s[7],g=s[8],v=s[9],m=s[10],p=s[11],E=s[12],b=s[13],x=s[14],M=s[15];if(n[0].setComponents(l-o,f-h,p-g,M-E).normalize(),n[1].setComponents(l+o,f+h,p+g,M+E).normalize(),n[2].setComponents(l+a,f+d,p+v,M+b).normalize(),n[3].setComponents(l-a,f-d,p-v,M-b).normalize(),i)n[4].setComponents(c,u,m,x).normalize(),n[5].setComponents(l-c,f-u,p-m,M-x).normalize();else if(n[4].setComponents(l-c,f-u,p-m,M-x).normalize(),t===Mi)n[5].setComponents(l+c,f+u,p+m,M+x).normalize();else if(t===Hs)n[5].setComponents(c,u,m,x).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),un.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),un.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(un)}intersectsSprite(e){un.center.set(0,0,0);const t=zf.distanceTo(e.center);return un.radius=.7071067811865476+t,un.applyMatrix4(e.matrixWorld),this.intersectsSphere(un)}intersectsSphere(e){const t=this.planes,i=e.center,n=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(i)<n)return!1;return!0}intersectsBox(e){const t=this.planes;for(let i=0;i<6;i++){const n=t[i];if(gr.x=n.normal.x>0?e.max.x:e.min.x,gr.y=n.normal.y>0?e.max.y:e.min.y,gr.z=n.normal.z>0?e.max.z:e.min.z,n.distanceToPoint(gr)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class En extends wn{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Be(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const Zr=new D,Jr=new D,Lc=new Oe,bs=new co,_r=new us,Qo=new D,Nc=new D;class ho extends dt{constructor(e=new wt,t=new En){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[0];for(let n=1,s=t.count;n<s;n++)Zr.fromBufferAttribute(t,n-1),Jr.fromBufferAttribute(t,n),i[n]=i[n-1],i[n]+=Zr.distanceTo(Jr);e.setAttribute("lineDistance",new je(i,1))}else Ne("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const i=this.geometry,n=this.matrixWorld,s=e.params.Line.threshold,o=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),_r.copy(i.boundingSphere),_r.applyMatrix4(n),_r.radius+=s,e.ray.intersectsSphere(_r)===!1)return;Lc.copy(n).invert(),bs.copy(e.ray).applyMatrix4(Lc);const a=s/((this.scale.x+this.scale.y+this.scale.z)/3),c=a*a,l=this.isLineSegments?2:1,h=i.index,u=i.attributes.position;if(h!==null){const f=Math.max(0,o.start),g=Math.min(h.count,o.start+o.count);for(let v=f,m=g-1;v<m;v+=l){const p=h.getX(v),E=h.getX(v+1),b=xr(this,e,bs,c,p,E,v);b&&t.push(b)}if(this.isLineLoop){const v=h.getX(g-1),m=h.getX(f),p=xr(this,e,bs,c,v,m,g-1);p&&t.push(p)}}else{const f=Math.max(0,o.start),g=Math.min(u.count,o.start+o.count);for(let v=f,m=g-1;v<m;v+=l){const p=xr(this,e,bs,c,v,v+1,v);p&&t.push(p)}if(this.isLineLoop){const v=xr(this,e,bs,c,g-1,f,g-1);v&&t.push(v)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const n=t[i[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=n.length;s<o;s++){const a=n[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}}function xr(r,e,t,i,n,s,o){const a=r.geometry.attributes.position;if(Zr.fromBufferAttribute(a,n),Jr.fromBufferAttribute(a,s),t.distanceSqToSegment(Zr,Jr,Qo,Nc)>i)return;Qo.applyMatrix4(r.matrixWorld);const l=e.ray.origin.distanceTo(Qo);if(!(l<e.near||l>e.far))return{distance:l,point:Nc.clone().applyMatrix4(r.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:r}}const Dc=new D,Ic=new D;class El extends ho{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[];for(let n=0,s=t.count;n<s;n+=2)Dc.fromBufferAttribute(t,n),Ic.fromBufferAttribute(t,n+1),i[n]=n===0?0:i[n-1],i[n+1]=i[n]+Dc.distanceTo(Ic);e.setAttribute("lineDistance",new je(i,1))}else Ne("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class du extends zt{constructor(e=[],t=Mn,i,n,s,o,a,c,l,h){super(e,t,i,n,s,o,a,c,l,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class as extends zt{constructor(e,t,i=Ti,n,s,o,a=Ut,c=Ut,l,h=Bi,d=1){if(h!==Bi&&h!==bn)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const u={width:e,height:t,depth:d};super(u,n,s,o,a,c,h,i,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new yl(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class Hf extends as{constructor(e,t=Ti,i=Mn,n,s,o=Ut,a=Ut,c,l=Bi){const h={width:e,height:e,depth:1},d=[h,h,h,h,h,h];super(e,e,t,i,n,s,o,a,c,l),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}}class fu extends zt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class ds extends wt{constructor(e=1,t=1,i=1,n=1,s=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:n,heightSegments:s,depthSegments:o};const a=this;n=Math.floor(n),s=Math.floor(s),o=Math.floor(o);const c=[],l=[],h=[],d=[];let u=0,f=0;g("z","y","x",-1,-1,i,t,e,o,s,0),g("z","y","x",1,-1,i,t,-e,o,s,1),g("x","z","y",1,1,e,i,t,n,o,2),g("x","z","y",1,-1,e,i,-t,n,o,3),g("x","y","z",1,-1,e,t,i,n,s,4),g("x","y","z",-1,-1,e,t,-i,n,s,5),this.setIndex(c),this.setAttribute("position",new je(l,3)),this.setAttribute("normal",new je(h,3)),this.setAttribute("uv",new je(d,2));function g(v,m,p,E,b,x,M,T,A,_,S){const R=x/A,C=M/_,L=x/2,B=M/2,X=T/2,U=A+1,N=_+1;let z=0,$=0;const j=new D;for(let se=0;se<N;se++){const ie=se*C-B;for(let re=0;re<U;re++){const me=re*R-L;j[v]=me*E,j[m]=ie*b,j[p]=X,l.push(j.x,j.y,j.z),j[v]=0,j[m]=0,j[p]=T>0?1:-1,h.push(j.x,j.y,j.z),d.push(re/A),d.push(1-se/_),z+=1}}for(let se=0;se<_;se++)for(let ie=0;ie<A;ie++){const re=u+ie+U*se,me=u+ie+U*(se+1),ve=u+(ie+1)+U*(se+1),ae=u+(ie+1)+U*se;c.push(re,me,ae),c.push(me,ve,ae),$+=6}a.addGroup(f,$,S),f+=$,u+=z}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ds(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}class uo extends wt{constructor(e=1,t=1,i=1,n=32,s=1,o=!1,a=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:n,heightSegments:s,openEnded:o,thetaStart:a,thetaLength:c};const l=this;n=Math.floor(n),s=Math.floor(s);const h=[],d=[],u=[],f=[];let g=0;const v=[],m=i/2;let p=0;E(),o===!1&&(e>0&&b(!0),t>0&&b(!1)),this.setIndex(h),this.setAttribute("position",new je(d,3)),this.setAttribute("normal",new je(u,3)),this.setAttribute("uv",new je(f,2));function E(){const x=new D,M=new D;let T=0;const A=(t-e)/i;for(let _=0;_<=s;_++){const S=[],R=_/s,C=R*(t-e)+e;for(let L=0;L<=n;L++){const B=L/n,X=B*c+a,U=Math.sin(X),N=Math.cos(X);M.x=C*U,M.y=-R*i+m,M.z=C*N,d.push(M.x,M.y,M.z),x.set(U,A,N).normalize(),u.push(x.x,x.y,x.z),f.push(B,1-R),S.push(g++)}v.push(S)}for(let _=0;_<n;_++)for(let S=0;S<s;S++){const R=v[S][_],C=v[S+1][_],L=v[S+1][_+1],B=v[S][_+1];(e>0||S!==0)&&(h.push(R,C,B),T+=3),(t>0||S!==s-1)&&(h.push(C,L,B),T+=3)}l.addGroup(p,T,0),p+=T}function b(x){const M=g,T=new Ue,A=new D;let _=0;const S=x===!0?e:t,R=x===!0?1:-1;for(let L=1;L<=n;L++)d.push(0,m*R,0),u.push(0,R,0),f.push(.5,.5),g++;const C=g;for(let L=0;L<=n;L++){const X=L/n*c+a,U=Math.cos(X),N=Math.sin(X);A.x=S*N,A.y=m*R,A.z=S*U,d.push(A.x,A.y,A.z),u.push(0,R,0),T.x=U*.5+.5,T.y=N*.5*R+.5,f.push(T.x,T.y),g++}for(let L=0;L<n;L++){const B=M+L,X=C+L;x===!0?h.push(X,X+1,B):h.push(X+1,X,B),_+=3}l.addGroup(p,_,x===!0?1:2),p+=_}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new uo(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Tl extends uo{constructor(e=1,t=1,i=32,n=1,s=!1,o=0,a=Math.PI*2){super(0,e,t,i,n,s,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:i,heightSegments:n,openEnded:s,thetaStart:o,thetaLength:a}}static fromJSON(e){return new Tl(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}function Gf(r,e,t=2){const i=e&&e.length,n=i?e[0]*t:r.length;let s=pu(r,0,n,t,!0);const o=[];if(!s||s.next===s.prev)return o;let a,c,l;if(i&&(s=$f(r,e,s,t)),r.length>80*t){a=r[0],c=r[1];let h=a,d=c;for(let u=t;u<n;u+=t){const f=r[u],g=r[u+1];f<a&&(a=f),g<c&&(c=g),f>h&&(h=f),g>d&&(d=g)}l=Math.max(h-a,d-c),l=l!==0?32767/l:0}return Vs(s,o,t,a,c,l,0),o}function pu(r,e,t,i,n){let s;if(n===sp(r,e,t,i)>0)for(let o=e;o<t;o+=i)s=Uc(o/i|0,r[o],r[o+1],s);else for(let o=t-i;o>=e;o-=i)s=Uc(o/i|0,r[o],r[o+1],s);return s&&ls(s,s.next)&&(Xs(s),s=s.next),s}function Tn(r,e){if(!r)return r;e||(e=r);let t=r,i;do if(i=!1,!t.steiner&&(ls(t,t.next)||ut(t.prev,t,t.next)===0)){if(Xs(t),t=e=t.prev,t===t.next)break;i=!0}else t=t.next;while(i||t!==e);return e}function Vs(r,e,t,i,n,s,o){if(!r)return;!o&&s&&jf(r,i,n,s);let a=r;for(;r.prev!==r.next;){const c=r.prev,l=r.next;if(s?Wf(r,i,n,s):Vf(r)){e.push(c.i,r.i,l.i),Xs(r),r=l.next,a=l.next;continue}if(r=l,r===a){o?o===1?(r=Xf(Tn(r),e),Vs(r,e,t,i,n,s,2)):o===2&&qf(r,e,t,i,n,s):Vs(Tn(r),e,t,i,n,s,1);break}}}function Vf(r){const e=r.prev,t=r,i=r.next;if(ut(e,t,i)>=0)return!1;const n=e.x,s=t.x,o=i.x,a=e.y,c=t.y,l=i.y,h=Math.min(n,s,o),d=Math.min(a,c,l),u=Math.max(n,s,o),f=Math.max(a,c,l);let g=i.next;for(;g!==e;){if(g.x>=h&&g.x<=u&&g.y>=d&&g.y<=f&&As(n,a,s,c,o,l,g.x,g.y)&&ut(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function Wf(r,e,t,i){const n=r.prev,s=r,o=r.next;if(ut(n,s,o)>=0)return!1;const a=n.x,c=s.x,l=o.x,h=n.y,d=s.y,u=o.y,f=Math.min(a,c,l),g=Math.min(h,d,u),v=Math.max(a,c,l),m=Math.max(h,d,u),p=sl(f,g,e,t,i),E=sl(v,m,e,t,i);let b=r.prevZ,x=r.nextZ;for(;b&&b.z>=p&&x&&x.z<=E;){if(b.x>=f&&b.x<=v&&b.y>=g&&b.y<=m&&b!==n&&b!==o&&As(a,h,c,d,l,u,b.x,b.y)&&ut(b.prev,b,b.next)>=0||(b=b.prevZ,x.x>=f&&x.x<=v&&x.y>=g&&x.y<=m&&x!==n&&x!==o&&As(a,h,c,d,l,u,x.x,x.y)&&ut(x.prev,x,x.next)>=0))return!1;x=x.nextZ}for(;b&&b.z>=p;){if(b.x>=f&&b.x<=v&&b.y>=g&&b.y<=m&&b!==n&&b!==o&&As(a,h,c,d,l,u,b.x,b.y)&&ut(b.prev,b,b.next)>=0)return!1;b=b.prevZ}for(;x&&x.z<=E;){if(x.x>=f&&x.x<=v&&x.y>=g&&x.y<=m&&x!==n&&x!==o&&As(a,h,c,d,l,u,x.x,x.y)&&ut(x.prev,x,x.next)>=0)return!1;x=x.nextZ}return!0}function Xf(r,e){let t=r;do{const i=t.prev,n=t.next.next;!ls(i,n)&&gu(i,t,t.next,n)&&Ws(i,n)&&Ws(n,i)&&(e.push(i.i,t.i,n.i),Xs(t),Xs(t.next),t=r=n),t=t.next}while(t!==r);return Tn(t)}function qf(r,e,t,i,n,s){let o=r;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&tp(o,a)){let c=_u(o,a);o=Tn(o,o.next),c=Tn(c,c.next),Vs(o,e,t,i,n,s,0),Vs(c,e,t,i,n,s,0);return}a=a.next}o=o.next}while(o!==r)}function $f(r,e,t,i){const n=[];for(let s=0,o=e.length;s<o;s++){const a=e[s]*i,c=s<o-1?e[s+1]*i:r.length,l=pu(r,a,c,i,!1);l===l.next&&(l.steiner=!0),n.push(ep(l))}n.sort(Yf);for(let s=0;s<n.length;s++)t=Kf(n[s],t);return t}function Yf(r,e){let t=r.x-e.x;if(t===0&&(t=r.y-e.y,t===0)){const i=(r.next.y-r.y)/(r.next.x-r.x),n=(e.next.y-e.y)/(e.next.x-e.x);t=i-n}return t}function Kf(r,e){const t=Zf(r,e);if(!t)return e;const i=_u(t,r);return Tn(i,i.next),Tn(t,t.next)}function Zf(r,e){let t=e;const i=r.x,n=r.y;let s=-1/0,o;if(ls(r,t))return t;do{if(ls(r,t.next))return t.next;if(n<=t.y&&n>=t.next.y&&t.next.y!==t.y){const d=t.x+(n-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(d<=i&&d>s&&(s=d,o=t.x<t.next.x?t:t.next,d===i))return o}t=t.next}while(t!==e);if(!o)return null;const a=o,c=o.x,l=o.y;let h=1/0;t=o;do{if(i>=t.x&&t.x>=c&&i!==t.x&&mu(n<l?i:s,n,c,l,n<l?s:i,n,t.x,t.y)){const d=Math.abs(n-t.y)/(i-t.x);Ws(t,r)&&(d<h||d===h&&(t.x>o.x||t.x===o.x&&Jf(o,t)))&&(o=t,h=d)}t=t.next}while(t!==a);return o}function Jf(r,e){return ut(r.prev,r,e.prev)<0&&ut(e.next,r,r.next)<0}function jf(r,e,t,i){let n=r;do n.z===0&&(n.z=sl(n.x,n.y,e,t,i)),n.prevZ=n.prev,n.nextZ=n.next,n=n.next;while(n!==r);n.prevZ.nextZ=null,n.prevZ=null,Qf(n)}function Qf(r){let e,t=1;do{let i=r,n;r=null;let s=null;for(e=0;i;){e++;let o=i,a=0;for(let l=0;l<t&&(a++,o=o.nextZ,!!o);l++);let c=t;for(;a>0||c>0&&o;)a!==0&&(c===0||!o||i.z<=o.z)?(n=i,i=i.nextZ,a--):(n=o,o=o.nextZ,c--),s?s.nextZ=n:r=n,n.prevZ=s,s=n;i=o}s.nextZ=null,t*=2}while(e>1);return r}function sl(r,e,t,i,n){return r=(r-t)*n|0,e=(e-i)*n|0,r=(r|r<<8)&16711935,r=(r|r<<4)&252645135,r=(r|r<<2)&858993459,r=(r|r<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,r|e<<1}function ep(r){let e=r,t=r;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==r);return t}function mu(r,e,t,i,n,s,o,a){return(n-o)*(e-a)>=(r-o)*(s-a)&&(r-o)*(i-a)>=(t-o)*(e-a)&&(t-o)*(s-a)>=(n-o)*(i-a)}function As(r,e,t,i,n,s,o,a){return!(r===o&&e===a)&&mu(r,e,t,i,n,s,o,a)}function tp(r,e){return r.next.i!==e.i&&r.prev.i!==e.i&&!ip(r,e)&&(Ws(r,e)&&Ws(e,r)&&np(r,e)&&(ut(r.prev,r,e.prev)||ut(r,e.prev,e))||ls(r,e)&&ut(r.prev,r,r.next)>0&&ut(e.prev,e,e.next)>0)}function ut(r,e,t){return(e.y-r.y)*(t.x-e.x)-(e.x-r.x)*(t.y-e.y)}function ls(r,e){return r.x===e.x&&r.y===e.y}function gu(r,e,t,i){const n=yr(ut(r,e,t)),s=yr(ut(r,e,i)),o=yr(ut(t,i,r)),a=yr(ut(t,i,e));return!!(n!==s&&o!==a||n===0&&vr(r,t,e)||s===0&&vr(r,i,e)||o===0&&vr(t,r,i)||a===0&&vr(t,e,i))}function vr(r,e,t){return e.x<=Math.max(r.x,t.x)&&e.x>=Math.min(r.x,t.x)&&e.y<=Math.max(r.y,t.y)&&e.y>=Math.min(r.y,t.y)}function yr(r){return r>0?1:r<0?-1:0}function ip(r,e){let t=r;do{if(t.i!==r.i&&t.next.i!==r.i&&t.i!==e.i&&t.next.i!==e.i&&gu(t,t.next,r,e))return!0;t=t.next}while(t!==r);return!1}function Ws(r,e){return ut(r.prev,r,r.next)<0?ut(r,e,r.next)>=0&&ut(r,r.prev,e)>=0:ut(r,e,r.prev)<0||ut(r,r.next,e)<0}function np(r,e){let t=r,i=!1;const n=(r.x+e.x)/2,s=(r.y+e.y)/2;do t.y>s!=t.next.y>s&&t.next.y!==t.y&&n<(t.next.x-t.x)*(s-t.y)/(t.next.y-t.y)+t.x&&(i=!i),t=t.next;while(t!==r);return i}function _u(r,e){const t=rl(r.i,r.x,r.y),i=rl(e.i,e.x,e.y),n=r.next,s=e.prev;return r.next=e,e.prev=r,t.next=n,n.prev=t,i.next=t,t.prev=i,s.next=i,i.prev=s,i}function Uc(r,e,t,i){const n=rl(r,e,t);return i?(n.next=i.next,n.prev=i,i.next.prev=n,i.next=n):(n.prev=n,n.next=n),n}function Xs(r){r.next.prev=r.prev,r.prev.next=r.next,r.prevZ&&(r.prevZ.nextZ=r.nextZ),r.nextZ&&(r.nextZ.prevZ=r.prevZ)}function rl(r,e,t){return{i:r,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function sp(r,e,t,i){let n=0;for(let s=e,o=t-i;s<t;s+=i)n+=(r[o]-r[s])*(r[s+1]+r[o+1]),o=s;return n}class rp{static triangulate(e,t,i=2){return Gf(e,t,i)}}class jr{static area(e){const t=e.length;let i=0;for(let n=t-1,s=0;s<t;n=s++)i+=e[n].x*e[s].y-e[s].x*e[n].y;return i*.5}static isClockWise(e){return jr.area(e)<0}static triangulateShape(e,t){const i=[],n=[],s=[];Fc(e),Oc(i,e);let o=e.length;t.forEach(Fc);for(let c=0;c<t.length;c++)n.push(o),o+=t[c].length,Oc(i,t[c]);const a=rp.triangulate(i,n);for(let c=0;c<a.length;c+=3)s.push(a.slice(c,c+3));return s}}function Fc(r){const e=r.length;e>2&&r[e-1].equals(r[0])&&r.pop()}function Oc(r,e){for(let t=0;t<e.length;t++)r.push(e[t].x),r.push(e[t].y)}class fo extends wt{constructor(e=1,t=1,i=1,n=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:n};const s=e/2,o=t/2,a=Math.floor(i),c=Math.floor(n),l=a+1,h=c+1,d=e/a,u=t/c,f=[],g=[],v=[],m=[];for(let p=0;p<h;p++){const E=p*u-o;for(let b=0;b<l;b++){const x=b*d-s;g.push(x,-E,0),v.push(0,0,1),m.push(b/a),m.push(1-p/c)}}for(let p=0;p<c;p++)for(let E=0;E<a;E++){const b=E+l*p,x=E+l*(p+1),M=E+1+l*(p+1),T=E+1+l*p;f.push(b,x,T),f.push(x,M,T)}this.setIndex(f),this.setAttribute("position",new je(g,3)),this.setAttribute("normal",new je(v,3)),this.setAttribute("uv",new je(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new fo(e.width,e.height,e.widthSegments,e.heightSegments)}}class po extends wt{constructor(e=1,t=32,i=16,n=0,s=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:n,phiLength:s,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));const c=Math.min(o+a,Math.PI);let l=0;const h=[],d=new D,u=new D,f=[],g=[],v=[],m=[];for(let p=0;p<=i;p++){const E=[],b=p/i,x=o+b*a,M=e*Math.cos(x),T=Math.sqrt(e*e-M*M);let A=0;p===0&&o===0?A=.5/t:p===i&&c===Math.PI&&(A=-.5/t);for(let _=0;_<=t;_++){const S=_/t,R=n+S*s;d.x=-T*Math.cos(R),d.y=M,d.z=T*Math.sin(R),g.push(d.x,d.y,d.z),u.copy(d).normalize(),v.push(u.x,u.y,u.z),m.push(S+A,1-b),E.push(l++)}h.push(E)}for(let p=0;p<i;p++)for(let E=0;E<t;E++){const b=h[p][E+1],x=h[p][E],M=h[p+1][E],T=h[p+1][E+1];(p!==0||o>0)&&f.push(b,x,T),(p!==i-1||c<Math.PI)&&f.push(x,M,T)}this.setIndex(f),this.setAttribute("position",new je(g,3)),this.setAttribute("normal",new je(v,3)),this.setAttribute("uv",new je(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new po(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}function cs(r){const e={};for(const t in r){e[t]={};for(const i in r[t]){const n=r[t][i];if(kc(n))n.isRenderTargetTexture?(Ne("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=n.clone();else if(Array.isArray(n))if(kc(n[0])){const s=[];for(let o=0,a=n.length;o<a;o++)s[o]=n[o].clone();e[t][i]=s}else e[t][i]=n.slice();else e[t][i]=n}}return e}function Vt(r){const e={};for(let t=0;t<r.length;t++){const i=cs(r[t]);for(const n in i)e[n]=i[n]}return e}function kc(r){return r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)}function op(r){const e=[];for(let t=0;t<r.length;t++)e.push(r[t].clone());return e}function xu(r){const e=r.getRenderTarget();return e===null?r.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Xe.workingColorSpace}const ap={clone:cs,merge:Vt};var lp=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,cp=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class wi extends wn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=lp,this.fragmentShader=cp,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=cs(e.uniforms),this.uniformsGroups=op(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const n in this.uniforms){const o=this.uniforms[n].value;o&&o.isTexture?t.uniforms[n]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[n]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[n]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[n]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[n]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[n]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[n]={type:"m4",value:o.toArray()}:t.uniforms[n]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const i={};for(const n in this.extensions)this.extensions[n]===!0&&(i[n]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(const i in e.uniforms){const n=e.uniforms[i];switch(this.uniforms[i]={},n.type){case"t":this.uniforms[i].value=t[n.value]||null;break;case"c":this.uniforms[i].value=new Be().setHex(n.value);break;case"v2":this.uniforms[i].value=new Ue().fromArray(n.value);break;case"v3":this.uniforms[i].value=new D().fromArray(n.value);break;case"v4":this.uniforms[i].value=new st().fromArray(n.value);break;case"m3":this.uniforms[i].value=new ke().fromArray(n.value);break;case"m4":this.uniforms[i].value=new Oe().fromArray(n.value);break;default:this.uniforms[i].value=n.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(const i in e.extensions)this.extensions[i]=e.extensions[i];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}}class hp extends wi{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class Us extends wn{constructor(e){super(),this.isMeshPhongMaterial=!0,this.type="MeshPhongMaterial",this.color=new Be(16777215),this.specular=new Be(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Be(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=qr,this.normalScale=new Ue(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new di,this.combine=ao,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.specular.copy(e.specular),this.shininess=e.shininess,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class up extends wn{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Be(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Be(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=qr,this.normalScale=new Ue(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new di,this.combine=ao,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class dp extends wn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Hd,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class fp extends wn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}function br(r,e){return!r||r.constructor===e?r:typeof e.BYTES_PER_ELEMENT=="number"?new e(r):Array.prototype.slice.call(r)}function pp(r){function e(n,s){return r[n]-r[s]}const t=r.length,i=new Array(t);for(let n=0;n!==t;++n)i[n]=n;return i.sort(e),i}function Bc(r,e,t){const i=r.length,n=new r.constructor(i);for(let s=0,o=0;o!==i;++s){const a=t[s]*e;for(let c=0;c!==e;++c)n[o++]=r[a+c]}return n}function mp(r,e,t,i){let n=1,s=r[0];for(;s!==void 0&&s[i]===void 0;)s=r[n++];if(s===void 0)return;let o=s[i];if(o!==void 0)if(Array.isArray(o))do o=s[i],o!==void 0&&(e.push(s.time),t.push(...o)),s=r[n++];while(s!==void 0);else if(o.toArray!==void 0)do o=s[i],o!==void 0&&(e.push(s.time),o.toArray(t,t.length)),s=r[n++];while(s!==void 0);else do o=s[i],o!==void 0&&(e.push(s.time),t.push(o)),s=r[n++];while(s!==void 0)}class Ys{constructor(e,t,i,n){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=n!==void 0?n:new t.constructor(i),this.sampleValues=t,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(e){const t=this.parameterPositions;let i=this._cachedIndex,n=t[i],s=t[i-1];i:{e:{let o;t:{n:if(!(e<n)){for(let a=i+2;;){if(n===void 0){if(e<s)break n;return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===a)break;if(s=n,n=t[++i],e<n)break e}o=t.length;break t}if(!(e>=s)){const a=t[1];e<a&&(i=2,s=a);for(let c=i-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===c)break;if(n=s,s=t[--i-1],e>=s)break e}o=i,i=0;break t}break i}for(;i<o;){const a=i+o>>>1;e<t[a]?o=a:i=a+1}if(n=t[i],s=t[i-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===void 0)return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,s,n)}return this.interpolate_(i,s,e,n)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){const t=this.resultBuffer,i=this.sampleValues,n=this.valueSize,s=e*n;for(let o=0;o!==n;++o)t[o]=i[s+o];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}}class gp extends Ys{constructor(e,t,i,n){super(e,t,i,n),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:nc,endingEnd:nc}}intervalChanged_(e,t,i){const n=this.parameterPositions;let s=e-2,o=e+1,a=n[s],c=n[o];if(a===void 0)switch(this.getSettings_().endingStart){case sc:s=e,a=2*t-i;break;case rc:s=n.length-2,a=t+n[s]-n[s+1];break;default:s=e,a=i}if(c===void 0)switch(this.getSettings_().endingEnd){case sc:o=e,c=2*i-t;break;case rc:o=1,c=i+n[1]-n[0];break;default:o=e-1,c=t}const l=(i-t)*.5,h=this.valueSize;this._weightPrev=l/(t-a),this._weightNext=l/(c-i),this._offsetPrev=s*h,this._offsetNext=o*h}interpolate_(e,t,i,n){const s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=e*a,l=c-a,h=this._offsetPrev,d=this._offsetNext,u=this._weightPrev,f=this._weightNext,g=(i-t)/(n-t),v=g*g,m=v*g,p=-u*m+2*u*v-u*g,E=(1+u)*m+(-1.5-2*u)*v+(-.5+u)*g+1,b=(-1-f)*m+(1.5+f)*v+.5*g,x=f*m-f*v;for(let M=0;M!==a;++M)s[M]=p*o[h+M]+E*o[l+M]+b*o[c+M]+x*o[d+M];return s}}class _p extends Ys{constructor(e,t,i,n){super(e,t,i,n)}interpolate_(e,t,i,n){const s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=e*a,l=c-a,h=(i-t)/(n-t),d=1-h;for(let u=0;u!==a;++u)s[u]=o[l+u]*d+o[c+u]*h;return s}}class xp extends Ys{constructor(e,t,i,n){super(e,t,i,n)}interpolate_(e){return this.copySampleValue_(e-1)}}class vp extends Ys{interpolate_(e,t,i,n){const s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=e*a,l=c-a,h=this.inTangents,d=this.outTangents;if(!h||!d){const g=(i-t)/(n-t),v=1-g;for(let m=0;m!==a;++m)s[m]=o[l+m]*v+o[c+m]*g;return s}const u=a*2,f=e-1;for(let g=0;g!==a;++g){const v=o[l+g],m=o[c+g],p=f*u+g*2,E=d[p],b=d[p+1],x=e*u+g*2,M=h[x],T=h[x+1];let A=(i-t)/(n-t),_,S,R,C,L;for(let B=0;B<8;B++){_=A*A,S=_*A,R=1-A,C=R*R,L=C*R;const U=L*t+3*C*A*E+3*R*_*M+S*n-i;if(Math.abs(U)<1e-10)break;const N=3*C*(E-t)+6*R*A*(M-E)+3*_*(n-M);if(Math.abs(N)<1e-10)break;A=A-U/N,A=Math.max(0,Math.min(1,A))}s[g]=L*v+3*C*A*b+3*R*_*T+S*m}return s}}class fi{constructor(e,t,i,n){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=br(t,this.TimeBufferType),this.values=br(i,this.ValueBufferType),this.setInterpolation(n||this.DefaultInterpolation)}static toJSON(e){const t=e.constructor;let i;if(t.toJSON!==this.toJSON)i=t.toJSON(e);else{i={name:e.name,times:br(e.times,Array),values:br(e.values,Array)};const n=e.getInterpolation();n!==e.DefaultInterpolation&&(i.interpolation=n)}return i.type=e.ValueTypeName,i}InterpolantFactoryMethodDiscrete(e){return new xp(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new _p(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new gp(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){const t=new vp(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case zs:t=this.InterpolantFactoryMethodDiscrete;break;case il:t=this.InterpolantFactoryMethodLinear;break;case Ro:t=this.InterpolantFactoryMethodSmooth;break;case nl:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){const i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return Ne("KeyframeTrack:",i),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return zs;case this.InterpolantFactoryMethodLinear:return il;case this.InterpolantFactoryMethodSmooth:return Ro;case this.InterpolantFactoryMethodBezier:return nl}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){const t=this.times;for(let i=0,n=t.length;i!==n;++i)t[i]+=e}return this}scale(e){if(e!==1){const t=this.times;for(let i=0,n=t.length;i!==n;++i)t[i]*=e}return this}trim(e,t){const i=this.times,n=i.length;let s=0,o=n-1;for(;s!==n&&i[s]<e;)++s;for(;o!==-1&&i[o]>t;)--o;if(++o,s!==0||o!==n){s>=o&&(o=Math.max(o,1),s=o-1);const a=this.getValueSize();this.times=i.slice(s,o),this.values=this.values.slice(s*a,o*a)}return this}validate(){let e=!0;const t=this.getValueSize();t-Math.floor(t)!==0&&(We("KeyframeTrack: Invalid value size in track.",this),e=!1);const i=this.times,n=this.values,s=i.length;s===0&&(We("KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==s;a++){const c=i[a];if(typeof c=="number"&&isNaN(c)){We("KeyframeTrack: Time is not a valid number.",this,a,c),e=!1;break}if(o!==null&&o>c){We("KeyframeTrack: Out of order keys.",this,a,c,o),e=!1;break}o=c}if(n!==void 0&&Zd(n))for(let a=0,c=n.length;a!==c;++a){const l=n[a];if(isNaN(l)){We("KeyframeTrack: Value is not a valid number.",this,a,l),e=!1;break}}return e}optimize(){const e=this.times.slice(),t=this.values.slice(),i=this.getValueSize(),n=this.getInterpolation()===Ro,s=e.length-1;let o=1;for(let a=1;a<s;++a){let c=!1;const l=e[a],h=e[a+1];if(l!==h&&(a!==1||l!==e[0]))if(n)c=!0;else{const d=a*i,u=d-i,f=d+i;for(let g=0;g!==i;++g){const v=t[d+g];if(v!==t[u+g]||v!==t[f+g]){c=!0;break}}}if(c){if(a!==o){e[o]=e[a];const d=a*i,u=o*i;for(let f=0;f!==i;++f)t[u+f]=t[d+f]}++o}}if(s>0){e[o]=e[s];for(let a=s*i,c=o*i,l=0;l!==i;++l)t[c+l]=t[a+l];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*i)):(this.times=e,this.values=t),this}clone(){const e=this.times.slice(),t=this.values.slice(),i=this.constructor,n=new i(this.name,e,t);return n.createInterpolant=this.createInterpolant,n}}fi.prototype.ValueTypeName="";fi.prototype.TimeBufferType=Float32Array;fi.prototype.ValueBufferType=Float32Array;fi.prototype.DefaultInterpolation=il;class fs extends fi{constructor(e,t,i){super(e,t,i)}}fs.prototype.ValueTypeName="bool";fs.prototype.ValueBufferType=Array;fs.prototype.DefaultInterpolation=zs;fs.prototype.InterpolantFactoryMethodLinear=void 0;fs.prototype.InterpolantFactoryMethodSmooth=void 0;class vu extends fi{constructor(e,t,i,n){super(e,t,i,n)}}vu.prototype.ValueTypeName="color";class wl extends fi{constructor(e,t,i,n){super(e,t,i,n)}}wl.prototype.ValueTypeName="number";class yp extends Ys{constructor(e,t,i,n){super(e,t,i,n)}interpolate_(e,t,i,n){const s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=(i-t)/(n-t);let l=e*a;for(let h=l+a;l!==h;l+=4)Nt.slerpFlat(s,0,o,l-a,o,l,c);return s}}class ts extends fi{constructor(e,t,i,n){super(e,t,i,n)}InterpolantFactoryMethodLinear(e){return new yp(this.times,this.values,this.getValueSize(),e)}}ts.prototype.ValueTypeName="quaternion";ts.prototype.InterpolantFactoryMethodSmooth=void 0;class ps extends fi{constructor(e,t,i){super(e,t,i)}}ps.prototype.ValueTypeName="string";ps.prototype.ValueBufferType=Array;ps.prototype.DefaultInterpolation=zs;ps.prototype.InterpolantFactoryMethodLinear=void 0;ps.prototype.InterpolantFactoryMethodSmooth=void 0;class si extends fi{constructor(e,t,i,n){super(e,t,i,n)}}si.prototype.ValueTypeName="vector";class zc{constructor(e="",t=-1,i=[],n=zd){this.name=e,this.tracks=i,this.duration=t,this.blendMode=n,this.uuid=rn(),this.userData={},this.duration<0&&this.resetDuration()}static parse(e){const t=[],i=e.tracks,n=1/(e.fps||1);for(let o=0,a=i.length;o!==a;++o)t.push(Mp(i[o]).scale(n));const s=new this(e.name,e.duration,t,e.blendMode);return s.uuid=e.uuid,s.userData=JSON.parse(e.userData||"{}"),s}static toJSON(e){const t=[],i=e.tracks,n={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let s=0,o=i.length;s!==o;++s)t.push(fi.toJSON(i[s]));return n}static CreateFromMorphTargetSequence(e,t,i,n){const s=t.length,o=[];for(let a=0;a<s;a++){let c=[],l=[];c.push((a+s-1)%s,a,(a+1)%s),l.push(0,1,0);const h=pp(c);c=Bc(c,1,h),l=Bc(l,1,h),!n&&c[0]===0&&(c.push(s),l.push(l[0])),o.push(new wl(".morphTargetInfluences["+t[a].name+"]",c,l).scale(1/i))}return new this(e,-1,o)}static findByName(e,t){let i=e;if(!Array.isArray(e)){const n=e;i=n.geometry&&n.geometry.animations||n.animations}for(let n=0;n<i.length;n++)if(i[n].name===t)return i[n];return null}static CreateClipsFromMorphTargetSequences(e,t,i){const n={},s=/^([\w-]*?)([\d]+)$/;for(let a=0,c=e.length;a<c;a++){const l=e[a],h=l.name.match(s);if(h&&h.length>1){const d=h[1];let u=n[d];u||(n[d]=u=[]),u.push(l)}}const o=[];for(const a in n)o.push(this.CreateFromMorphTargetSequence(a,n[a],t,i));return o}resetDuration(){const e=this.tracks;let t=0;for(let i=0,n=e.length;i!==n;++i){const s=this.tracks[i];t=Math.max(t,s.times[s.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){const e=[];for(let i=0;i<this.tracks.length;i++)e.push(this.tracks[i].clone());const t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}}function bp(r){switch(r.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return wl;case"vector":case"vector2":case"vector3":case"vector4":return si;case"color":return vu;case"quaternion":return ts;case"bool":case"boolean":return fs;case"string":return ps}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+r)}function Mp(r){if(r.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");const e=bp(r.type);if(r.times===void 0){const t=[],i=[];mp(r.keys,t,i,"value"),r.times=t,r.values=i}return e.parse!==void 0?e.parse(r):new e(r.name,r.times,r.values,r.interpolation)}const Fs={enabled:!1,files:{},add:function(r,e){this.enabled!==!1&&(Hc(r)||(this.files[r]=e))},get:function(r){if(this.enabled!==!1&&!Hc(r))return this.files[r]},remove:function(r){delete this.files[r]},clear:function(){this.files={}}};function Hc(r){try{const e=r.slice(r.indexOf(":")+1);return new URL(e).protocol==="blob:"}catch{return!1}}class Sp{constructor(e,t,i){const n=this;let s=!1,o=0,a=0,c;const l=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=i,this._abortController=null,this.itemStart=function(h){a++,s===!1&&n.onStart!==void 0&&n.onStart(h,o,a),s=!0},this.itemEnd=function(h){o++,n.onProgress!==void 0&&n.onProgress(h,o,a),o===a&&(s=!1,n.onLoad!==void 0&&n.onLoad())},this.itemError=function(h){n.onError!==void 0&&n.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),c?c(h):h},this.setURLModifier=function(h){return c=h,this},this.addHandler=function(h,d){return l.push(h,d),this},this.removeHandler=function(h){const d=l.indexOf(h);return d!==-1&&l.splice(d,2),this},this.getHandler=function(h){for(let d=0,u=l.length;d<u;d+=2){const f=l[d],g=l[d+1];if(f.global&&(f.lastIndex=0),f.test(h))return g}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}}const yu=new Sp;class on{constructor(e){this.manager=e!==void 0?e:yu,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){const i=this;return new Promise(function(n,s){i.load(e,n,t,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}}on.DEFAULT_MATERIAL_NAME="__DEFAULT";const Ni={};class Ep extends Error{constructor(e,t){super(e),this.response=t}}class Al extends on{constructor(e){super(e),this.mimeType="",this.responseType="",this._abortController=new AbortController}load(e,t,i,n){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=Fs.get(`file:${e}`);if(s!==void 0){this.manager.itemStart(e),setTimeout(()=>{t&&t(s),this.manager.itemEnd(e)},0);return}if(Ni[e]!==void 0){Ni[e].push({onLoad:t,onProgress:i,onError:n});return}Ni[e]=[],Ni[e].push({onLoad:t,onProgress:i,onError:n});const o=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",signal:typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),a=this.mimeType,c=this.responseType;fetch(o).then(l=>{if(l.status===200||l.status===0){if(l.status===0&&Ne("FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||l.body===void 0||l.body.getReader===void 0)return l;const h=Ni[e],d=l.body.getReader(),u=l.headers.get("X-File-Size")||l.headers.get("Content-Length"),f=u?parseInt(u):0,g=f!==0;let v=0;const m=new ReadableStream({start(p){E();function E(){d.read().then(({done:b,value:x})=>{if(b)p.close();else{v+=x.byteLength;const M=new ProgressEvent("progress",{lengthComputable:g,loaded:v,total:f});for(let T=0,A=h.length;T<A;T++){const _=h[T];_.onProgress&&_.onProgress(M)}p.enqueue(x),E()}},b=>{p.error(b)})}}});return new Response(m)}else throw new Ep(`fetch for "${l.url}" responded with ${l.status}: ${l.statusText}`,l)}).then(l=>{switch(c){case"arraybuffer":return l.arrayBuffer();case"blob":return l.blob();case"document":return l.text().then(h=>new DOMParser().parseFromString(h,a));case"json":return l.json();default:if(a==="")return l.text();{const d=/charset="?([^;"\s]*)"?/i.exec(a),u=d&&d[1]?d[1].toLowerCase():void 0,f=new TextDecoder(u);return l.arrayBuffer().then(g=>f.decode(g))}}}).then(l=>{Fs.add(`file:${e}`,l);const h=Ni[e];delete Ni[e];for(let d=0,u=h.length;d<u;d++){const f=h[d];f.onLoad&&f.onLoad(l)}}).catch(l=>{const h=Ni[e];if(h===void 0)throw this.manager.itemError(e),l;delete Ni[e];for(let d=0,u=h.length;d<u;d++){const f=h[d];f.onError&&f.onError(l)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}const zn=new WeakMap;class Tp extends on{constructor(e){super(e)}load(e,t,i,n){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=this,o=Fs.get(`image:${e}`);if(o!==void 0){if(o.complete===!0)s.manager.itemStart(e),setTimeout(function(){t&&t(o),s.manager.itemEnd(e)},0);else{let d=zn.get(o);d===void 0&&(d=[],zn.set(o,d)),d.push({onLoad:t,onError:n})}return o}const a=Gs("img");function c(){h(),t&&t(this);const d=zn.get(this)||[];for(let u=0;u<d.length;u++){const f=d[u];f.onLoad&&f.onLoad(this)}zn.delete(this),s.manager.itemEnd(e)}function l(d){h(),n&&n(d),Fs.remove(`image:${e}`);const u=zn.get(this)||[];for(let f=0;f<u.length;f++){const g=u[f];g.onError&&g.onError(d)}zn.delete(this),s.manager.itemError(e),s.manager.itemEnd(e)}function h(){a.removeEventListener("load",c,!1),a.removeEventListener("error",l,!1)}return a.addEventListener("load",c,!1),a.addEventListener("error",l,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),Fs.add(`image:${e}`,a),s.manager.itemStart(e),a.src=e,a}}class wp extends on{constructor(e){super(e)}load(e,t,i,n){const s=this,o=new Kr,a=new Al(this.manager);return a.setResponseType("arraybuffer"),a.setRequestHeader(this.requestHeader),a.setPath(this.path),a.setWithCredentials(s.withCredentials),a.load(e,function(c){let l;try{l=s.parse(c)}catch(h){n!==void 0?n(h):We(h);return}s._applyTexData(o,l),t&&t(o,l)},i,n),o}createDataTexture(e){const t=new Kr;return this._applyTexData(t,this.parse(e)),t}_applyTexData(e,t){t.image!==void 0?e.image=t.image:t.data!==void 0&&(e.image.width=t.width,e.image.height=t.height,e.image.data=t.data),e.wrapS=t.wrapS!==void 0?t.wrapS:ei,e.wrapT=t.wrapT!==void 0?t.wrapT:ei,e.magFilter=t.magFilter!==void 0?t.magFilter:Tt,e.minFilter=t.minFilter!==void 0?t.minFilter:Tt,e.anisotropy=t.anisotropy!==void 0?t.anisotropy:1,t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.mipmaps!==void 0&&(e.mipmaps=t.mipmaps,e.minFilter=Ii),t.mipmapCount===1&&(e.minFilter=Tt),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),e.needsUpdate=!0}}class bu extends on{constructor(e){super(e)}load(e,t,i,n){const s=new zt,o=new Tp(this.manager);return o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(e,function(a){s.image=a,s.needsUpdate=!0,t!==void 0&&t(s)},i,n),s}}class Ks extends dt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Be(e),this.intensity=t}dispose(){this.dispatchEvent({type:"dispose"})}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}}class Mu extends Ks{constructor(e,t,i){super(e,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(dt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Be(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){const t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}}const ea=new Oe,Gc=new D,Vc=new D;class Rl{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Ue(512,512),this.mapType=Qt,this.map=null,this.mapPass=null,this.matrix=new Oe,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Sl,this._frameExtents=new Ue(1,1),this._viewportCount=1,this._viewports=[new st(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,i=this.matrix;Gc.setFromMatrixPosition(e.matrixWorld),t.position.copy(Gc),Vc.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Vc),t.updateMatrixWorld(),ea.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(ea,t.coordinateSystem,t.reversedDepth),t.coordinateSystem===Hs||t.reversedDepth?i.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(ea)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}const Mr=new D,Sr=new Nt,_i=new D;class Su extends dt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Oe,this.projectionMatrix=new Oe,this.projectionMatrixInverse=new Oe,this.coordinateSystem=Mi,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Mr,Sr,_i),_i.x===1&&_i.y===1&&_i.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Mr,Sr,_i.set(1,1,1)).invert()}updateWorldMatrix(e,t,i=!1){super.updateWorldMatrix(e,t,i),this.matrixWorld.decompose(Mr,Sr,_i),_i.x===1&&_i.y===1&&_i.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Mr,Sr,_i.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}const Yi=new D,Wc=new Ue,Xc=new Ue;class It extends Su{constructor(e=50,t=1,i=.1,n=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=n,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=rs*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Ds*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return rs*2*Math.atan(Math.tan(Ds*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){Yi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Yi.x,Yi.y).multiplyScalar(-e/Yi.z),Yi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Yi.x,Yi.y).multiplyScalar(-e/Yi.z)}getViewSize(e,t){return this.getViewBounds(e,Wc,Xc),t.subVectors(Xc,Wc)}setViewOffset(e,t,i,n,s,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=n,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(Ds*.5*this.fov)/this.zoom,i=2*t,n=this.aspect*i,s=-.5*n;const o=this.view;if(this.view!==null&&this.view.enabled){const c=o.fullWidth,l=o.fullHeight;s+=o.offsetX*n/c,t-=o.offsetY*i/l,n*=o.width/c,i*=o.height/l}const a=this.filmOffset;a!==0&&(s+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+n,t,t-i,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}class Ap extends Rl{constructor(){super(new It(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){const t=this.camera,i=rs*2*e.angle*this.focus,n=this.mapSize.width/this.mapSize.height*this.aspect,s=e.distance||t.far;(i!==t.fov||n!==t.aspect||s!==t.far)&&(t.fov=i,t.aspect=n,t.far=s,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}}class Rp extends Ks{constructor(e,t,i=0,n=Math.PI/3,s=0,o=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(dt.DEFAULT_UP),this.updateMatrix(),this.target=new dt,this.distance=i,this.angle=n,this.penumbra=s,this.decay=o,this.map=null,this.shadow=new Ap}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.map=e.map,this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.distance=this.distance,t.object.angle=this.angle,t.object.decay=this.decay,t.object.penumbra=this.penumbra,t.object.target=this.target.uuid,this.map&&this.map.isTexture&&(t.object.map=this.map.toJSON(e).uuid),t.object.shadow=this.shadow.toJSON(),t}}class Cp extends Rl{constructor(){super(new It(90,1,.5,500)),this.isPointLightShadow=!0}}class Pp extends Ks{constructor(e,t,i=0,n=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=n,this.shadow=new Cp}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}}class mo extends Su{constructor(e=-1,t=1,i=1,n=-1,s=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=n,this.near=s,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,n,s,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=n,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,n=(this.top+this.bottom)/2;let s=i-e,o=i+e,a=n+t,c=n-t;if(this.view!==null&&this.view.enabled){const l=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=l*this.view.offsetX,o=s+l*this.view.width,a-=h*this.view.offsetY,c=a-h*this.view.height}this.projectionMatrix.makeOrthographic(s,o,a,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class Lp extends Rl{constructor(){super(new mo(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class Eu extends Ks{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(dt.DEFAULT_UP),this.updateMatrix(),this.target=new dt,this.shadow=new Lp}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}}class Np extends Ks{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}}class Tu{static extractUrlBase(e){const t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}}const Hn=-90,Gn=1;class Dp extends dt{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const n=new It(Hn,Gn,e,t);n.layers=this.layers,this.add(n);const s=new It(Hn,Gn,e,t);s.layers=this.layers,this.add(s);const o=new It(Hn,Gn,e,t);o.layers=this.layers,this.add(o);const a=new It(Hn,Gn,e,t);a.layers=this.layers,this.add(a);const c=new It(Hn,Gn,e,t);c.layers=this.layers,this.add(c);const l=new It(Hn,Gn,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[i,n,s,o,a,c]=t;for(const l of t)this.remove(l);if(e===Mi)i.up.set(0,1,0),i.lookAt(1,0,0),n.up.set(0,1,0),n.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===Hs)i.up.set(0,-1,0),i.lookAt(-1,0,0),n.up.set(0,-1,0),n.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:n}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[s,o,a,c,l,h]=this.children,d=e.getRenderTarget(),u=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const v=i.texture.generateMipmaps;i.texture.generateMipmaps=!1;let m=!1;e.isWebGLRenderer===!0?m=e.state.buffers.depth.getReversed():m=e.reversedDepthBuffer,e.setRenderTarget(i,0,n),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(i,1,n),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(i,2,n),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(i,3,n),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),e.setRenderTarget(i,4,n),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),i.texture.generateMipmaps=v,e.setRenderTarget(i,5,n),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,h),e.setRenderTarget(d,u,f),e.xr.enabled=g,i.texture.needsPMREMUpdate=!0}}class Ip extends It{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}class qc{constructor(e=1,t=0,i=0){this.radius=e,this.phi=t,this.theta=i}set(e,t,i){return this.radius=e,this.phi=t,this.theta=i,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=qe(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,i){return this.radius=Math.sqrt(e*e+t*t+i*i),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,i),this.phi=Math.acos(qe(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}}const Gl=class Gl{constructor(e,t,i,n){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,i,n)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let i=0;i<4;i++)this.elements[i]=e[i+t];return this}set(e,t,i,n){const s=this.elements;return s[0]=e,s[2]=t,s[1]=i,s[3]=n,this}};Gl.prototype.isMatrix2=!0;let $c=Gl;class wu extends El{constructor(e=10,t=10,i=4473924,n=8947848){i=new Be(i),n=new Be(n);const s=t/2,o=e/t,a=e/2,c=[],l=[];for(let u=0,f=0,g=-a;u<=t;u++,g+=o){c.push(-a,0,g,a,0,g),c.push(g,0,-a,g,0,a);const v=u===s?i:n;v.toArray(l,f),f+=3,v.toArray(l,f),f+=3,v.toArray(l,f),f+=3,v.toArray(l,f),f+=3}const h=new wt;h.setAttribute("position",new je(c,3)),h.setAttribute("color",new je(l,3));const d=new En({vertexColors:!0,toneMapped:!1});super(h,d),this.type="GridHelper"}dispose(){this.geometry.dispose(),this.material.dispose()}}const Yc=new D;let Er,ta;class Kc extends dt{constructor(e=new D(0,0,1),t=new D(0,0,0),i=1,n=16776960,s=i*.2,o=s*.2){super(),this.type="ArrowHelper",Er===void 0&&(Er=new wt,Er.setAttribute("position",new je([0,0,0,0,1,0],3)),ta=new Tl(.5,1,5,1),ta.translate(0,-.5,0)),this.position.copy(t),this.line=new ho(Er,new En({color:n,toneMapped:!1})),this.line.matrixAutoUpdate=!1,this.add(this.line),this.cone=new Ft(ta,new os({color:n,toneMapped:!1})),this.cone.matrixAutoUpdate=!1,this.add(this.cone),this.setDirection(e),this.setLength(i,s,o)}setDirection(e){if(e.y>.99999)this.quaternion.set(0,0,0,1);else if(e.y<-.99999)this.quaternion.set(1,0,0,0);else{Yc.set(e.z,0,-e.x).normalize();const t=Math.acos(e.y);this.quaternion.setFromAxisAngle(Yc,t)}}setLength(e,t=e*.2,i=t*.2){this.line.scale.set(1,Math.max(1e-4,e-t),1),this.line.updateMatrix(),this.cone.scale.set(i,t,i),this.cone.position.y=e,this.cone.updateMatrix()}setColor(e){this.line.material.color.set(e),this.cone.material.color.set(e)}copy(e){return super.copy(e,!1),this.line.copy(e.line),this.cone.copy(e.cone),this}dispose(){this.line.geometry.dispose(),this.line.material.dispose(),this.cone.geometry.dispose(),this.cone.material.dispose()}}class Up extends El{constructor(e=1){const t=[0,0,0,e,0,0,0,0,0,0,e,0,0,0,0,0,0,e],i=[1,0,0,1,.6,0,0,1,0,.6,1,0,0,0,1,0,.6,1],n=new wt;n.setAttribute("position",new je(t,3)),n.setAttribute("color",new je(i,3));const s=new En({vertexColors:!0,toneMapped:!1});super(n,s),this.type="AxesHelper"}setColors(e,t,i){const n=new Be,s=this.geometry.attributes.color.array;return n.set(e),n.toArray(s,0),n.toArray(s,3),n.set(t),n.toArray(s,6),n.toArray(s,9),n.set(i),n.toArray(s,12),n.toArray(s,15),this.geometry.attributes.color.needsUpdate=!0,this}dispose(){this.geometry.dispose(),this.material.dispose()}}class Fp extends sn{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(e){if(e===void 0){Ne("Controls: connect() now requires an element.");return}this.domElement!==null&&this.disconnect(),this.domElement=e}disconnect(){}dispose(){}update(){}}function Zc(r,e,t,i){const n=Op(i);switch(t){case iu:return r*e;case su:return r*e/n.components*n.byteLength;case pl:return r*e/n.components*n.byteLength;case Sn:return r*e*2/n.components*n.byteLength;case ml:return r*e*2/n.components*n.byteLength;case nu:return r*e*3/n.components*n.byteLength;case oi:return r*e*4/n.components*n.byteLength;case gl:return r*e*4/n.components*n.byteLength;case Br:case zr:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*8;case Hr:case Gr:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case Aa:case Ca:return Math.max(r,16)*Math.max(e,8)/4;case wa:case Ra:return Math.max(r,8)*Math.max(e,8)/2;case Pa:case La:case Da:case Ia:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*8;case Na:case Wr:case Ua:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case Fa:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case Oa:return Math.floor((r+4)/5)*Math.floor((e+3)/4)*16;case ka:return Math.floor((r+4)/5)*Math.floor((e+4)/5)*16;case Ba:return Math.floor((r+5)/6)*Math.floor((e+4)/5)*16;case za:return Math.floor((r+5)/6)*Math.floor((e+5)/6)*16;case Ha:return Math.floor((r+7)/8)*Math.floor((e+4)/5)*16;case Ga:return Math.floor((r+7)/8)*Math.floor((e+5)/6)*16;case Va:return Math.floor((r+7)/8)*Math.floor((e+7)/8)*16;case Wa:return Math.floor((r+9)/10)*Math.floor((e+4)/5)*16;case Xa:return Math.floor((r+9)/10)*Math.floor((e+5)/6)*16;case qa:return Math.floor((r+9)/10)*Math.floor((e+7)/8)*16;case $a:return Math.floor((r+9)/10)*Math.floor((e+9)/10)*16;case Ya:return Math.floor((r+11)/12)*Math.floor((e+9)/10)*16;case Ka:return Math.floor((r+11)/12)*Math.floor((e+11)/12)*16;case Za:case Ja:case ja:return Math.ceil(r/4)*Math.ceil(e/4)*16;case Qa:case el:return Math.ceil(r/4)*Math.ceil(e/4)*8;case Xr:case tl:return Math.ceil(r/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Op(r){switch(r){case Qt:case jh:return{byteLength:1,components:1};case ks:case Qh:case ki:return{byteLength:2,components:1};case dl:case fl:return{byteLength:2,components:4};case Ti:case ul:case hi:return{byteLength:4,components:1};case eu:case tu:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${r}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:hl}}));typeof window<"u"&&(window.__THREE__?Ne("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=hl);/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function Au(){let r=null,e=!1,t=null,i=null;function n(s,o){t(s,o),i=r.requestAnimationFrame(n)}return{start:function(){e!==!0&&t!==null&&r!==null&&(i=r.requestAnimationFrame(n),e=!0)},stop:function(){r!==null&&r.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){r=s}}}function kp(r){const e=new WeakMap;function t(a,c){const l=a.array,h=a.usage,d=l.byteLength,u=r.createBuffer();r.bindBuffer(c,u),r.bufferData(c,l,h),a.onUploadCallback();let f;if(l instanceof Float32Array)f=r.FLOAT;else if(typeof Float16Array<"u"&&l instanceof Float16Array)f=r.HALF_FLOAT;else if(l instanceof Uint16Array)a.isFloat16BufferAttribute?f=r.HALF_FLOAT:f=r.UNSIGNED_SHORT;else if(l instanceof Int16Array)f=r.SHORT;else if(l instanceof Uint32Array)f=r.UNSIGNED_INT;else if(l instanceof Int32Array)f=r.INT;else if(l instanceof Int8Array)f=r.BYTE;else if(l instanceof Uint8Array)f=r.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)f=r.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:u,type:f,bytesPerElement:l.BYTES_PER_ELEMENT,version:a.version,size:d}}function i(a,c,l){const h=c.array,d=c.updateRanges;if(r.bindBuffer(l,a),d.length===0)r.bufferSubData(l,0,h);else{d.sort((f,g)=>f.start-g.start);let u=0;for(let f=1;f<d.length;f++){const g=d[u],v=d[f];v.start<=g.start+g.count+1?g.count=Math.max(g.count,v.start+v.count-g.start):(++u,d[u]=v)}d.length=u+1;for(let f=0,g=d.length;f<g;f++){const v=d[f];r.bufferSubData(l,v.start*h.BYTES_PER_ELEMENT,h,v.start,v.count)}c.clearUpdateRanges()}c.onUploadCallback()}function n(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function s(a){a.isInterleavedBufferAttribute&&(a=a.data);const c=e.get(a);c&&(r.deleteBuffer(c.buffer),e.delete(a))}function o(a,c){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const h=e.get(a);(!h||h.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const l=e.get(a);if(l===void 0)e.set(a,t(a,c));else if(l.version<a.version){if(l.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(l.buffer,a,c),l.version=a.version}}return{get:n,remove:s,update:o}}var Bp=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,zp=`#ifdef USE_ALPHAHASH
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
#endif`,Hp=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Gp=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Vp=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Wp=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Xp=`#ifdef USE_AOMAP
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
#endif`,qp=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,$p=`#ifdef USE_BATCHING
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
#endif`,Yp=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Kp=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Zp=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Jp=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,jp=`#ifdef USE_IRIDESCENCE
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
#endif`,Qp=`#ifdef USE_BUMPMAP
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
#endif`,em=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,tm=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,im=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,nm=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,sm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,rm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,om=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,am=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,lm=`#define PI 3.141592653589793
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
} // validated`,cm=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,hm=`vec3 transformedNormal = objectNormal;
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
#endif`,um=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,dm=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,fm=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,pm=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,mm="gl_FragColor = linearToOutputTexel( gl_FragColor );",gm=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,_m=`#ifdef USE_ENVMAP
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
#endif`,xm=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,vm=`#ifdef USE_ENVMAP
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
#endif`,ym=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,bm=`#ifdef USE_ENVMAP
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
#endif`,Mm=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Sm=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Em=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Tm=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,wm=`#ifdef USE_GRADIENTMAP
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
}`,Am=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Rm=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Cm=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Pm=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,Lm=`#ifdef USE_ENVMAP
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
#endif`,Nm=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Dm=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Im=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Um=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Fm=`PhysicalMaterial material;
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
#endif`,Om=`uniform sampler2D dfgLUT;
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
}`,km=`
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
#endif`,Bm=`#if defined( RE_IndirectDiffuse )
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
#endif`,zm=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Hm=`#ifdef USE_LIGHT_PROBES_GRID
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
#endif`,Gm=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Vm=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Wm=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Xm=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,qm=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,$m=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Ym=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Km=`#if defined( USE_POINTS_UV )
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
#endif`,Zm=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Jm=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,jm=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Qm=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,eg=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,tg=`#ifdef USE_MORPHTARGETS
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
#endif`,ig=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,ng=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,sg=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,rg=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,og=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,ag=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,lg=`#ifdef USE_NORMALMAP
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
#endif`,cg=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,hg=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,ug=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,dg=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,fg=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,pg=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,mg=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,gg=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,_g=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,xg=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,vg=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,yg=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,bg=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Mg=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Sg=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,Eg=`float getShadowMask() {
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
}`,Tg=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,wg=`#ifdef USE_SKINNING
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
#endif`,Ag=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Rg=`#ifdef USE_SKINNING
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
#endif`,Cg=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Pg=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Lg=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Ng=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,Dg=`#ifdef USE_TRANSMISSION
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
#endif`,Ig=`#ifdef USE_TRANSMISSION
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
#endif`,Ug=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Fg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Og=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,kg=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Bg=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,zg=`uniform sampler2D t2D;
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
}`,Hg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Gg=`#ifdef ENVMAP_TYPE_CUBE
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
}`,Vg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Wg=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Xg=`#include <common>
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
}`,qg=`#if DEPTH_PACKING == 3200
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
}`,$g=`#define DISTANCE
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
}`,Yg=`#define DISTANCE
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
}`,Kg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Zg=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Jg=`uniform float scale;
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
}`,jg=`uniform vec3 diffuse;
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
}`,Qg=`#include <common>
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
}`,e_=`uniform vec3 diffuse;
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
}`,t_=`#define LAMBERT
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
}`,i_=`#define LAMBERT
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
}`,n_=`#define MATCAP
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
}`,s_=`#define MATCAP
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
}`,r_=`#define NORMAL
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
}`,o_=`#define NORMAL
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
}`,a_=`#define PHONG
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
}`,l_=`#define PHONG
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
}`,c_=`#define STANDARD
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
}`,h_=`#define STANDARD
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
}`,u_=`#define TOON
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
}`,d_=`#define TOON
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
}`,f_=`uniform float size;
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
}`,p_=`uniform vec3 diffuse;
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
}`,m_=`#include <common>
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
}`,g_=`uniform vec3 color;
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
}`,__=`uniform float rotation;
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
}`,x_=`uniform vec3 diffuse;
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
}`,Ge={alphahash_fragment:Bp,alphahash_pars_fragment:zp,alphamap_fragment:Hp,alphamap_pars_fragment:Gp,alphatest_fragment:Vp,alphatest_pars_fragment:Wp,aomap_fragment:Xp,aomap_pars_fragment:qp,batching_pars_vertex:$p,batching_vertex:Yp,begin_vertex:Kp,beginnormal_vertex:Zp,bsdfs:Jp,iridescence_fragment:jp,bumpmap_pars_fragment:Qp,clipping_planes_fragment:em,clipping_planes_pars_fragment:tm,clipping_planes_pars_vertex:im,clipping_planes_vertex:nm,color_fragment:sm,color_pars_fragment:rm,color_pars_vertex:om,color_vertex:am,common:lm,cube_uv_reflection_fragment:cm,defaultnormal_vertex:hm,displacementmap_pars_vertex:um,displacementmap_vertex:dm,emissivemap_fragment:fm,emissivemap_pars_fragment:pm,colorspace_fragment:mm,colorspace_pars_fragment:gm,envmap_fragment:_m,envmap_common_pars_fragment:xm,envmap_pars_fragment:vm,envmap_pars_vertex:ym,envmap_physical_pars_fragment:Lm,envmap_vertex:bm,fog_vertex:Mm,fog_pars_vertex:Sm,fog_fragment:Em,fog_pars_fragment:Tm,gradientmap_pars_fragment:wm,lightmap_pars_fragment:Am,lights_lambert_fragment:Rm,lights_lambert_pars_fragment:Cm,lights_pars_begin:Pm,lights_toon_fragment:Nm,lights_toon_pars_fragment:Dm,lights_phong_fragment:Im,lights_phong_pars_fragment:Um,lights_physical_fragment:Fm,lights_physical_pars_fragment:Om,lights_fragment_begin:km,lights_fragment_maps:Bm,lights_fragment_end:zm,lightprobes_pars_fragment:Hm,logdepthbuf_fragment:Gm,logdepthbuf_pars_fragment:Vm,logdepthbuf_pars_vertex:Wm,logdepthbuf_vertex:Xm,map_fragment:qm,map_pars_fragment:$m,map_particle_fragment:Ym,map_particle_pars_fragment:Km,metalnessmap_fragment:Zm,metalnessmap_pars_fragment:Jm,morphinstance_vertex:jm,morphcolor_vertex:Qm,morphnormal_vertex:eg,morphtarget_pars_vertex:tg,morphtarget_vertex:ig,normal_fragment_begin:ng,normal_fragment_maps:sg,normal_pars_fragment:rg,normal_pars_vertex:og,normal_vertex:ag,normalmap_pars_fragment:lg,clearcoat_normal_fragment_begin:cg,clearcoat_normal_fragment_maps:hg,clearcoat_pars_fragment:ug,iridescence_pars_fragment:dg,opaque_fragment:fg,packing:pg,premultiplied_alpha_fragment:mg,project_vertex:gg,dithering_fragment:_g,dithering_pars_fragment:xg,roughnessmap_fragment:vg,roughnessmap_pars_fragment:yg,shadowmap_pars_fragment:bg,shadowmap_pars_vertex:Mg,shadowmap_vertex:Sg,shadowmask_pars_fragment:Eg,skinbase_vertex:Tg,skinning_pars_vertex:wg,skinning_vertex:Ag,skinnormal_vertex:Rg,specularmap_fragment:Cg,specularmap_pars_fragment:Pg,tonemapping_fragment:Lg,tonemapping_pars_fragment:Ng,transmission_fragment:Dg,transmission_pars_fragment:Ig,uv_pars_fragment:Ug,uv_pars_vertex:Fg,uv_vertex:Og,worldpos_vertex:kg,background_vert:Bg,background_frag:zg,backgroundCube_vert:Hg,backgroundCube_frag:Gg,cube_vert:Vg,cube_frag:Wg,depth_vert:Xg,depth_frag:qg,distance_vert:$g,distance_frag:Yg,equirect_vert:Kg,equirect_frag:Zg,linedashed_vert:Jg,linedashed_frag:jg,meshbasic_vert:Qg,meshbasic_frag:e_,meshlambert_vert:t_,meshlambert_frag:i_,meshmatcap_vert:n_,meshmatcap_frag:s_,meshnormal_vert:r_,meshnormal_frag:o_,meshphong_vert:a_,meshphong_frag:l_,meshphysical_vert:c_,meshphysical_frag:h_,meshtoon_vert:u_,meshtoon_frag:d_,points_vert:f_,points_frag:p_,shadow_vert:m_,shadow_frag:g_,sprite_vert:__,sprite_frag:x_},pe={common:{diffuse:{value:new Be(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ke},alphaMap:{value:null},alphaMapTransform:{value:new ke},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ke}},envmap:{envMap:{value:null},envMapRotation:{value:new ke},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ke}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ke}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ke},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ke},normalScale:{value:new Ue(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ke},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ke}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ke}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ke}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Be(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new D},probesMax:{value:new D},probesResolution:{value:new D}},points:{diffuse:{value:new Be(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ke},alphaTest:{value:0},uvTransform:{value:new ke}},sprite:{diffuse:{value:new Be(16777215)},opacity:{value:1},center:{value:new Ue(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ke},alphaMap:{value:null},alphaMapTransform:{value:new ke},alphaTest:{value:0}}},yi={basic:{uniforms:Vt([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.fog]),vertexShader:Ge.meshbasic_vert,fragmentShader:Ge.meshbasic_frag},lambert:{uniforms:Vt([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,pe.lights,{emissive:{value:new Be(0)},envMapIntensity:{value:1}}]),vertexShader:Ge.meshlambert_vert,fragmentShader:Ge.meshlambert_frag},phong:{uniforms:Vt([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,pe.lights,{emissive:{value:new Be(0)},specular:{value:new Be(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Ge.meshphong_vert,fragmentShader:Ge.meshphong_frag},standard:{uniforms:Vt([pe.common,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.roughnessmap,pe.metalnessmap,pe.fog,pe.lights,{emissive:{value:new Be(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ge.meshphysical_vert,fragmentShader:Ge.meshphysical_frag},toon:{uniforms:Vt([pe.common,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.gradientmap,pe.fog,pe.lights,{emissive:{value:new Be(0)}}]),vertexShader:Ge.meshtoon_vert,fragmentShader:Ge.meshtoon_frag},matcap:{uniforms:Vt([pe.common,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,{matcap:{value:null}}]),vertexShader:Ge.meshmatcap_vert,fragmentShader:Ge.meshmatcap_frag},points:{uniforms:Vt([pe.points,pe.fog]),vertexShader:Ge.points_vert,fragmentShader:Ge.points_frag},dashed:{uniforms:Vt([pe.common,pe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ge.linedashed_vert,fragmentShader:Ge.linedashed_frag},depth:{uniforms:Vt([pe.common,pe.displacementmap]),vertexShader:Ge.depth_vert,fragmentShader:Ge.depth_frag},normal:{uniforms:Vt([pe.common,pe.bumpmap,pe.normalmap,pe.displacementmap,{opacity:{value:1}}]),vertexShader:Ge.meshnormal_vert,fragmentShader:Ge.meshnormal_frag},sprite:{uniforms:Vt([pe.sprite,pe.fog]),vertexShader:Ge.sprite_vert,fragmentShader:Ge.sprite_frag},background:{uniforms:{uvTransform:{value:new ke},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ge.background_vert,fragmentShader:Ge.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ke}},vertexShader:Ge.backgroundCube_vert,fragmentShader:Ge.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ge.cube_vert,fragmentShader:Ge.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ge.equirect_vert,fragmentShader:Ge.equirect_frag},distance:{uniforms:Vt([pe.common,pe.displacementmap,{referencePosition:{value:new D},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ge.distance_vert,fragmentShader:Ge.distance_frag},shadow:{uniforms:Vt([pe.lights,pe.fog,{color:{value:new Be(0)},opacity:{value:1}}]),vertexShader:Ge.shadow_vert,fragmentShader:Ge.shadow_frag}};yi.physical={uniforms:Vt([yi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ke},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ke},clearcoatNormalScale:{value:new Ue(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ke},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ke},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ke},sheen:{value:0},sheenColor:{value:new Be(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ke},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ke},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ke},transmissionSamplerSize:{value:new Ue},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ke},attenuationDistance:{value:0},attenuationColor:{value:new Be(0)},specularColor:{value:new Be(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ke},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ke},anisotropyVector:{value:new Ue},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ke}}]),vertexShader:Ge.meshphysical_vert,fragmentShader:Ge.meshphysical_frag};const Tr={r:0,b:0,g:0},v_=new Oe,Ru=new ke;Ru.set(-1,0,0,0,1,0,0,0,1);function y_(r,e,t,i,n,s){const o=new Be(0);let a=n===!0?0:1,c,l,h=null,d=0,u=null;function f(E){let b=E.isScene===!0?E.background:null;if(b&&b.isTexture){const x=E.backgroundBlurriness>0;b=e.get(b,x)}return b}function g(E){let b=!1;const x=f(E);x===null?m(o,a):x&&x.isColor&&(m(x,1),b=!0);const M=r.xr.getEnvironmentBlendMode();M==="additive"?t.buffers.color.setClear(0,0,0,1,s):M==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,s),(r.autoClear||b)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),r.clear(r.autoClearColor,r.autoClearDepth,r.autoClearStencil))}function v(E,b){const x=f(b);x&&(x.isCubeTexture||x.mapping===lo)?(l===void 0&&(l=new Ft(new ds(1,1,1),new wi({name:"BackgroundCubeMaterial",uniforms:cs(yi.backgroundCube.uniforms),vertexShader:yi.backgroundCube.vertexShader,fragmentShader:yi.backgroundCube.fragmentShader,side:$t,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),l.geometry.deleteAttribute("uv"),l.onBeforeRender=function(M,T,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(l)),l.material.uniforms.envMap.value=x,l.material.uniforms.backgroundBlurriness.value=b.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(v_.makeRotationFromEuler(b.backgroundRotation)).transpose(),x.isCubeTexture&&x.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(Ru),l.material.toneMapped=Xe.getTransfer(x.colorSpace)!==tt,(h!==x||d!==x.version||u!==r.toneMapping)&&(l.material.needsUpdate=!0,h=x,d=x.version,u=r.toneMapping),l.layers.enableAll(),E.unshift(l,l.geometry,l.material,0,0,null)):x&&x.isTexture&&(c===void 0&&(c=new Ft(new fo(2,2),new wi({name:"BackgroundMaterial",uniforms:cs(yi.background.uniforms),vertexShader:yi.background.vertexShader,fragmentShader:yi.background.fragmentShader,side:Oi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(c)),c.material.uniforms.t2D.value=x,c.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,c.material.toneMapped=Xe.getTransfer(x.colorSpace)!==tt,x.matrixAutoUpdate===!0&&x.updateMatrix(),c.material.uniforms.uvTransform.value.copy(x.matrix),(h!==x||d!==x.version||u!==r.toneMapping)&&(c.material.needsUpdate=!0,h=x,d=x.version,u=r.toneMapping),c.layers.enableAll(),E.unshift(c,c.geometry,c.material,0,0,null))}function m(E,b){E.getRGB(Tr,xu(r)),t.buffers.color.setClear(Tr.r,Tr.g,Tr.b,b,s)}function p(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(E,b=1){o.set(E),a=b,m(o,a)},getClearAlpha:function(){return a},setClearAlpha:function(E){a=E,m(o,a)},render:g,addToRenderList:v,dispose:p}}function b_(r,e){const t=r.getParameter(r.MAX_VERTEX_ATTRIBS),i={},n=u(null);let s=n,o=!1;function a(C,L,B,X,U){let N=!1;const z=d(C,X,B,L);s!==z&&(s=z,l(s.object)),N=f(C,X,B,U),N&&g(C,X,B,U),U!==null&&e.update(U,r.ELEMENT_ARRAY_BUFFER),(N||o)&&(o=!1,x(C,L,B,X),U!==null&&r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,e.get(U).buffer))}function c(){return r.createVertexArray()}function l(C){return r.bindVertexArray(C)}function h(C){return r.deleteVertexArray(C)}function d(C,L,B,X){const U=X.wireframe===!0;let N=i[L.id];N===void 0&&(N={},i[L.id]=N);const z=C.isInstancedMesh===!0?C.id:0;let $=N[z];$===void 0&&($={},N[z]=$);let j=$[B.id];j===void 0&&(j={},$[B.id]=j);let se=j[U];return se===void 0&&(se=u(c()),j[U]=se),se}function u(C){const L=[],B=[],X=[];for(let U=0;U<t;U++)L[U]=0,B[U]=0,X[U]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:L,enabledAttributes:B,attributeDivisors:X,object:C,attributes:{},index:null}}function f(C,L,B,X){const U=s.attributes,N=L.attributes;let z=0;const $=B.getAttributes();for(const j in $)if($[j].location>=0){const ie=U[j];let re=N[j];if(re===void 0&&(j==="instanceMatrix"&&C.instanceMatrix&&(re=C.instanceMatrix),j==="instanceColor"&&C.instanceColor&&(re=C.instanceColor)),ie===void 0||ie.attribute!==re||re&&ie.data!==re.data)return!0;z++}return s.attributesNum!==z||s.index!==X}function g(C,L,B,X){const U={},N=L.attributes;let z=0;const $=B.getAttributes();for(const j in $)if($[j].location>=0){let ie=N[j];ie===void 0&&(j==="instanceMatrix"&&C.instanceMatrix&&(ie=C.instanceMatrix),j==="instanceColor"&&C.instanceColor&&(ie=C.instanceColor));const re={};re.attribute=ie,ie&&ie.data&&(re.data=ie.data),U[j]=re,z++}s.attributes=U,s.attributesNum=z,s.index=X}function v(){const C=s.newAttributes;for(let L=0,B=C.length;L<B;L++)C[L]=0}function m(C){p(C,0)}function p(C,L){const B=s.newAttributes,X=s.enabledAttributes,U=s.attributeDivisors;B[C]=1,X[C]===0&&(r.enableVertexAttribArray(C),X[C]=1),U[C]!==L&&(r.vertexAttribDivisor(C,L),U[C]=L)}function E(){const C=s.newAttributes,L=s.enabledAttributes;for(let B=0,X=L.length;B<X;B++)L[B]!==C[B]&&(r.disableVertexAttribArray(B),L[B]=0)}function b(C,L,B,X,U,N,z){z===!0?r.vertexAttribIPointer(C,L,B,U,N):r.vertexAttribPointer(C,L,B,X,U,N)}function x(C,L,B,X){v();const U=X.attributes,N=B.getAttributes(),z=L.defaultAttributeValues;for(const $ in N){const j=N[$];if(j.location>=0){let se=U[$];if(se===void 0&&($==="instanceMatrix"&&C.instanceMatrix&&(se=C.instanceMatrix),$==="instanceColor"&&C.instanceColor&&(se=C.instanceColor)),se!==void 0){const ie=se.normalized,re=se.itemSize,me=e.get(se);if(me===void 0)continue;const ve=me.buffer,ae=me.type,k=me.bytesPerElement,Z=ae===r.INT||ae===r.UNSIGNED_INT||se.gpuType===ul;if(se.isInterleavedBufferAttribute){const ee=se.data,ye=ee.stride,Pe=se.offset;if(ee.isInstancedInterleavedBuffer){for(let Ie=0;Ie<j.locationSize;Ie++)p(j.location+Ie,ee.meshPerAttribute);C.isInstancedMesh!==!0&&X._maxInstanceCount===void 0&&(X._maxInstanceCount=ee.meshPerAttribute*ee.count)}else for(let Ie=0;Ie<j.locationSize;Ie++)m(j.location+Ie);r.bindBuffer(r.ARRAY_BUFFER,ve);for(let Ie=0;Ie<j.locationSize;Ie++)b(j.location+Ie,re/j.locationSize,ae,ie,ye*k,(Pe+re/j.locationSize*Ie)*k,Z)}else{if(se.isInstancedBufferAttribute){for(let ee=0;ee<j.locationSize;ee++)p(j.location+ee,se.meshPerAttribute);C.isInstancedMesh!==!0&&X._maxInstanceCount===void 0&&(X._maxInstanceCount=se.meshPerAttribute*se.count)}else for(let ee=0;ee<j.locationSize;ee++)m(j.location+ee);r.bindBuffer(r.ARRAY_BUFFER,ve);for(let ee=0;ee<j.locationSize;ee++)b(j.location+ee,re/j.locationSize,ae,ie,re*k,re/j.locationSize*ee*k,Z)}}else if(z!==void 0){const ie=z[$];if(ie!==void 0)switch(ie.length){case 2:r.vertexAttrib2fv(j.location,ie);break;case 3:r.vertexAttrib3fv(j.location,ie);break;case 4:r.vertexAttrib4fv(j.location,ie);break;default:r.vertexAttrib1fv(j.location,ie)}}}}E()}function M(){S();for(const C in i){const L=i[C];for(const B in L){const X=L[B];for(const U in X){const N=X[U];for(const z in N)h(N[z].object),delete N[z];delete X[U]}}delete i[C]}}function T(C){if(i[C.id]===void 0)return;const L=i[C.id];for(const B in L){const X=L[B];for(const U in X){const N=X[U];for(const z in N)h(N[z].object),delete N[z];delete X[U]}}delete i[C.id]}function A(C){for(const L in i){const B=i[L];for(const X in B){const U=B[X];if(U[C.id]===void 0)continue;const N=U[C.id];for(const z in N)h(N[z].object),delete N[z];delete U[C.id]}}}function _(C){for(const L in i){const B=i[L],X=C.isInstancedMesh===!0?C.id:0,U=B[X];if(U!==void 0){for(const N in U){const z=U[N];for(const $ in z)h(z[$].object),delete z[$];delete U[N]}delete B[X],Object.keys(B).length===0&&delete i[L]}}}function S(){R(),o=!0,s!==n&&(s=n,l(s.object))}function R(){n.geometry=null,n.program=null,n.wireframe=!1}return{setup:a,reset:S,resetDefaultState:R,dispose:M,releaseStatesOfGeometry:T,releaseStatesOfObject:_,releaseStatesOfProgram:A,initAttributes:v,enableAttribute:m,disableUnusedAttributes:E}}function M_(r,e,t){let i;function n(c){i=c}function s(c,l){r.drawArrays(i,c,l),t.update(l,i,1)}function o(c,l,h){h!==0&&(r.drawArraysInstanced(i,c,l,h),t.update(l,i,h))}function a(c,l,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,l,0,h);let u=0;for(let f=0;f<h;f++)u+=l[f];t.update(u,i,1)}this.setMode=n,this.render=s,this.renderInstances=o,this.renderMultiDraw=a}function S_(r,e,t,i){let n;function s(){if(n!==void 0)return n;if(e.has("EXT_texture_filter_anisotropic")===!0){const A=e.get("EXT_texture_filter_anisotropic");n=r.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else n=0;return n}function o(A){return!(A!==oi&&i.convert(A)!==r.getParameter(r.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(A){const _=A===ki&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(A!==Qt&&i.convert(A)!==r.getParameter(r.IMPLEMENTATION_COLOR_READ_TYPE)&&A!==hi&&!_)}function c(A){if(A==="highp"){if(r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.HIGH_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.MEDIUM_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=t.precision!==void 0?t.precision:"highp";const h=c(l);h!==l&&(Ne("WebGLRenderer:",l,"not supported, using",h,"instead."),l=h);const d=t.logarithmicDepthBuffer===!0,u=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&u===!1&&Ne("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");const f=r.getParameter(r.MAX_TEXTURE_IMAGE_UNITS),g=r.getParameter(r.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=r.getParameter(r.MAX_TEXTURE_SIZE),m=r.getParameter(r.MAX_CUBE_MAP_TEXTURE_SIZE),p=r.getParameter(r.MAX_VERTEX_ATTRIBS),E=r.getParameter(r.MAX_VERTEX_UNIFORM_VECTORS),b=r.getParameter(r.MAX_VARYING_VECTORS),x=r.getParameter(r.MAX_FRAGMENT_UNIFORM_VECTORS),M=r.getParameter(r.MAX_SAMPLES),T=r.getParameter(r.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:a,precision:l,logarithmicDepthBuffer:d,reversedDepthBuffer:u,maxTextures:f,maxVertexTextures:g,maxTextureSize:v,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:E,maxVaryings:b,maxFragmentUniforms:x,maxSamples:M,samples:T}}function E_(r){const e=this;let t=null,i=0,n=!1,s=!1;const o=new ji,a=new ke,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(d,u){const f=d.length!==0||u||i!==0||n;return n=u,i=d.length,f},this.beginShadows=function(){s=!0,h(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(d,u){t=h(d,u,0)},this.setState=function(d,u,f){const g=d.clippingPlanes,v=d.clipIntersection,m=d.clipShadows,p=r.get(d);if(!n||g===null||g.length===0||s&&!m)s?h(null):l();else{const E=s?0:i,b=E*4;let x=p.clippingState||null;c.value=x,x=h(g,u,b,f);for(let M=0;M!==b;++M)x[M]=t[M];p.clippingState=x,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=E}};function l(){c.value!==t&&(c.value=t,c.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function h(d,u,f,g){const v=d!==null?d.length:0;let m=null;if(v!==0){if(m=c.value,g!==!0||m===null){const p=f+v*4,E=u.matrixWorldInverse;a.getNormalMatrix(E),(m===null||m.length<p)&&(m=new Float32Array(p));for(let b=0,x=f;b!==v;++b,x+=4)o.copy(d[b]).applyMatrix4(E,a),o.normal.toArray(m,x),m[x+3]=o.constant}c.value=m,c.needsUpdate=!0}return e.numPlanes=v,e.numIntersection=0,m}}const tn=4,Jc=[.125,.215,.35,.446,.526,.582],vn=20,T_=256,Ms=new mo,jc=new Be;let ia=null,na=0,sa=0,ra=!1;const w_=new D;class Qc{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,i=.1,n=100,s={}){const{size:o=256,position:a=w_}=s;ia=this._renderer.getRenderTarget(),na=this._renderer.getActiveCubeFace(),sa=this._renderer.getActiveMipmapLevel(),ra=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);const c=this._allocateTargets();return c.depthBuffer=!0,this._sceneToCubeUV(e,i,n,c,a),t>0&&this._blur(c,0,0,t),this._applyPMREM(c),this._cleanup(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=ih(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=th(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(ia,na,sa),this._renderer.xr.enabled=ra,e.scissorTest=!1,Vn(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Mn||e.mapping===ss?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),ia=this._renderer.getRenderTarget(),na=this._renderer.getActiveCubeFace(),sa=this._renderer.getActiveMipmapLevel(),ra=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:Tt,minFilter:Tt,generateMipmaps:!1,type:ki,format:oi,colorSpace:$r,depthBuffer:!1},n=eh(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=eh(e,t,i);const{_lodMax:s}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=A_(s)),this._blurMaterial=C_(s,e,t),this._ggxMaterial=R_(s,e,t)}return n}_compileMaterial(e){const t=new Ft(new wt,e);this._renderer.compile(t,Ms)}_sceneToCubeUV(e,t,i,n,s){const c=new It(90,1,t,i),l=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],d=this._renderer,u=d.autoClear,f=d.toneMapping;d.getClearColor(jc),d.toneMapping=Si,d.autoClear=!1,d.state.buffers.depth.getReversed()&&(d.setRenderTarget(n),d.clearDepth(),d.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new Ft(new ds,new os({name:"PMREM.Background",side:$t,depthWrite:!1,depthTest:!1})));const v=this._backgroundBox,m=v.material;let p=!1;const E=e.background;E?E.isColor&&(m.color.copy(E),e.background=null,p=!0):(m.color.copy(jc),p=!0);for(let b=0;b<6;b++){const x=b%3;x===0?(c.up.set(0,l[b],0),c.position.set(s.x,s.y,s.z),c.lookAt(s.x+h[b],s.y,s.z)):x===1?(c.up.set(0,0,l[b]),c.position.set(s.x,s.y,s.z),c.lookAt(s.x,s.y+h[b],s.z)):(c.up.set(0,l[b],0),c.position.set(s.x,s.y,s.z),c.lookAt(s.x,s.y,s.z+h[b]));const M=this._cubeSize;Vn(n,x*M,b>2?M:0,M,M),d.setRenderTarget(n),p&&d.render(v,c),d.render(e,c)}d.toneMapping=f,d.autoClear=u,e.background=E}_textureToCubeUV(e,t){const i=this._renderer,n=e.mapping===Mn||e.mapping===ss;n?(this._cubemapMaterial===null&&(this._cubemapMaterial=ih()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=th());const s=n?this._cubemapMaterial:this._equirectMaterial,o=this._lodMeshes[0];o.material=s;const a=s.uniforms;a.envMap.value=e;const c=this._cubeSize;Vn(t,0,0,3*c,2*c),i.setRenderTarget(t),i.render(o,Ms)}_applyPMREM(e){const t=this._renderer,i=t.autoClear;t.autoClear=!1;const n=this._lodMeshes.length;for(let s=1;s<n;s++)this._applyGGXFilter(e,s-1,s);t.autoClear=i}_applyGGXFilter(e,t,i){const n=this._renderer,s=this._pingPongRenderTarget,o=this._ggxMaterial,a=this._lodMeshes[i];a.material=o;const c=o.uniforms,l=i/(this._lodMeshes.length-1),h=t/(this._lodMeshes.length-1),d=Math.sqrt(l*l-h*h),u=0+l*1.25,f=d*u,{_lodMax:g}=this,v=this._sizeLods[i],m=3*v*(i>g-tn?i-g+tn:0),p=4*(this._cubeSize-v);c.envMap.value=e.texture,c.roughness.value=f,c.mipInt.value=g-t,Vn(s,m,p,3*v,2*v),n.setRenderTarget(s),n.render(a,Ms),c.envMap.value=s.texture,c.roughness.value=0,c.mipInt.value=g-i,Vn(e,m,p,3*v,2*v),n.setRenderTarget(e),n.render(a,Ms)}_blur(e,t,i,n,s){const o=this._pingPongRenderTarget;this._halfBlur(e,o,t,i,n,"latitudinal",s),this._halfBlur(o,e,i,i,n,"longitudinal",s)}_halfBlur(e,t,i,n,s,o,a){const c=this._renderer,l=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&We("blur direction must be either latitudinal or longitudinal!");const h=3,d=this._lodMeshes[n];d.material=l;const u=l.uniforms,f=this._sizeLods[i]-1,g=isFinite(s)?Math.PI/(2*f):2*Math.PI/(2*vn-1),v=s/g,m=isFinite(s)?1+Math.floor(h*v):vn;m>vn&&Ne(`sigmaRadians, ${s}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${vn}`);const p=[];let E=0;for(let A=0;A<vn;++A){const _=A/v,S=Math.exp(-_*_/2);p.push(S),A===0?E+=S:A<m&&(E+=2*S)}for(let A=0;A<p.length;A++)p[A]=p[A]/E;u.envMap.value=e.texture,u.samples.value=m,u.weights.value=p,u.latitudinal.value=o==="latitudinal",a&&(u.poleAxis.value=a);const{_lodMax:b}=this;u.dTheta.value=g,u.mipInt.value=b-i;const x=this._sizeLods[n],M=3*x*(n>b-tn?n-b+tn:0),T=4*(this._cubeSize-x);Vn(t,M,T,3*x,2*x),c.setRenderTarget(t),c.render(d,Ms)}}function A_(r){const e=[],t=[],i=[];let n=r;const s=r-tn+1+Jc.length;for(let o=0;o<s;o++){const a=Math.pow(2,n);e.push(a);let c=1/a;o>r-tn?c=Jc[o-r+tn-1]:o===0&&(c=0),t.push(c);const l=1/(a-2),h=-l,d=1+l,u=[h,h,d,h,d,d,h,h,d,d,h,d],f=6,g=6,v=3,m=2,p=1,E=new Float32Array(v*g*f),b=new Float32Array(m*g*f),x=new Float32Array(p*g*f);for(let T=0;T<f;T++){const A=T%3*2/3-1,_=T>2?0:-1,S=[A,_,0,A+2/3,_,0,A+2/3,_+1,0,A,_,0,A+2/3,_+1,0,A,_+1,0];E.set(S,v*g*T),b.set(u,m*g*T);const R=[T,T,T,T,T,T];x.set(R,p*g*T)}const M=new wt;M.setAttribute("position",new ti(E,v)),M.setAttribute("uv",new ti(b,m)),M.setAttribute("faceIndex",new ti(x,p)),i.push(new Ft(M,null)),n>tn&&n--}return{lodMeshes:i,sizeLods:e,sigmas:t}}function eh(r,e,t){const i=new Ei(r,e,t);return i.texture.mapping=lo,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Vn(r,e,t,i,n){r.viewport.set(e,t,i,n),r.scissor.set(e,t,i,n)}function R_(r,e,t){return new wi({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:T_,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${r}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:go(),fragmentShader:`

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
		`,blending:Ui,depthTest:!1,depthWrite:!1})}function C_(r,e,t){const i=new Float32Array(vn),n=new D(0,1,0);return new wi({name:"SphericalGaussianBlur",defines:{n:vn,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${r}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:n}},vertexShader:go(),fragmentShader:`

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
		`,blending:Ui,depthTest:!1,depthWrite:!1})}function th(){return new wi({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:go(),fragmentShader:`

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
		`,blending:Ui,depthTest:!1,depthWrite:!1})}function ih(){return new wi({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:go(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Ui,depthTest:!1,depthWrite:!1})}function go(){return`

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
	`}class Cu extends Ei{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const i={width:e,height:e,depth:1},n=[i,i,i,i,i,i];this.texture=new du(n),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},n=new ds(5,5,5),s=new wi({name:"CubemapFromEquirect",uniforms:cs(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:$t,blending:Ui});s.uniforms.tEquirect.value=t;const o=new Ft(n,s),a=t.minFilter;return t.minFilter===Ii&&(t.minFilter=Tt),new Dp(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,i=!0,n=!0){const s=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,i,n);e.setRenderTarget(s)}}function P_(r){let e=new WeakMap,t=new WeakMap,i=null;function n(u,f=!1){return u==null?null:f?o(u):s(u)}function s(u){if(u&&u.isTexture){const f=u.mapping;if(f===To||f===wo)if(e.has(u)){const g=e.get(u).texture;return a(g,u.mapping)}else{const g=u.image;if(g&&g.height>0){const v=new Cu(g.height);return v.fromEquirectangularTexture(r,u),e.set(u,v),u.addEventListener("dispose",l),a(v.texture,u.mapping)}else return null}}return u}function o(u){if(u&&u.isTexture){const f=u.mapping,g=f===To||f===wo,v=f===Mn||f===ss;if(g||v){let m=t.get(u);const p=m!==void 0?m.texture.pmremVersion:0;if(u.isRenderTargetTexture&&u.pmremVersion!==p)return i===null&&(i=new Qc(r)),m=g?i.fromEquirectangular(u,m):i.fromCubemap(u,m),m.texture.pmremVersion=u.pmremVersion,t.set(u,m),m.texture;if(m!==void 0)return m.texture;{const E=u.image;return g&&E&&E.height>0||v&&E&&c(E)?(i===null&&(i=new Qc(r)),m=g?i.fromEquirectangular(u):i.fromCubemap(u),m.texture.pmremVersion=u.pmremVersion,t.set(u,m),u.addEventListener("dispose",h),m.texture):null}}}return u}function a(u,f){return f===To?u.mapping=Mn:f===wo&&(u.mapping=ss),u}function c(u){let f=0;const g=6;for(let v=0;v<g;v++)u[v]!==void 0&&f++;return f===g}function l(u){const f=u.target;f.removeEventListener("dispose",l);const g=e.get(f);g!==void 0&&(e.delete(f),g.dispose())}function h(u){const f=u.target;f.removeEventListener("dispose",h);const g=t.get(f);g!==void 0&&(t.delete(f),g.dispose())}function d(){e=new WeakMap,t=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:n,dispose:d}}function L_(r){const e={};function t(i){if(e[i]!==void 0)return e[i];const n=r.getExtension(i);return e[i]=n,n}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){const n=t(i);return n===null&&Qn("WebGLRenderer: "+i+" extension not supported."),n}}}function N_(r,e,t,i){const n={},s=new WeakMap;function o(d){const u=d.target;u.index!==null&&e.remove(u.index);for(const g in u.attributes)e.remove(u.attributes[g]);u.removeEventListener("dispose",o),delete n[u.id];const f=s.get(u);f&&(e.remove(f),s.delete(u)),i.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,t.memory.geometries--}function a(d,u){return n[u.id]===!0||(u.addEventListener("dispose",o),n[u.id]=!0,t.memory.geometries++),u}function c(d){const u=d.attributes;for(const f in u)e.update(u[f],r.ARRAY_BUFFER)}function l(d){const u=[],f=d.index,g=d.attributes.position;let v=0;if(g===void 0)return;if(f!==null){const E=f.array;v=f.version;for(let b=0,x=E.length;b<x;b+=3){const M=E[b+0],T=E[b+1],A=E[b+2];u.push(M,T,T,A,A,M)}}else{const E=g.array;v=g.version;for(let b=0,x=E.length/3-1;b<x;b+=3){const M=b+0,T=b+1,A=b+2;u.push(M,T,T,A,A,M)}}const m=new(g.count>=65535?hu:cu)(u,1);m.version=v;const p=s.get(d);p&&e.remove(p),s.set(d,m)}function h(d){const u=s.get(d);if(u){const f=d.index;f!==null&&u.version<f.version&&l(d)}else l(d);return s.get(d)}return{get:a,update:c,getWireframeAttribute:h}}function D_(r,e,t){let i;function n(d){i=d}let s,o;function a(d){s=d.type,o=d.bytesPerElement}function c(d,u){r.drawElements(i,u,s,d*o),t.update(u,i,1)}function l(d,u,f){f!==0&&(r.drawElementsInstanced(i,u,s,d*o,f),t.update(u,i,f))}function h(d,u,f){if(f===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,u,0,s,d,0,f);let v=0;for(let m=0;m<f;m++)v+=u[m];t.update(v,i,1)}this.setMode=n,this.setIndex=a,this.render=c,this.renderInstances=l,this.renderMultiDraw=h}function I_(r){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(s,o,a){switch(t.calls++,o){case r.TRIANGLES:t.triangles+=a*(s/3);break;case r.LINES:t.lines+=a*(s/2);break;case r.LINE_STRIP:t.lines+=a*(s-1);break;case r.LINE_LOOP:t.lines+=a*s;break;case r.POINTS:t.points+=a*s;break;default:We("WebGLInfo: Unknown draw mode:",o);break}}function n(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:n,update:i}}function U_(r,e,t){const i=new WeakMap,n=new st;function s(o,a,c){const l=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,d=h!==void 0?h.length:0;let u=i.get(a);if(u===void 0||u.count!==d){let R=function(){_.dispose(),i.delete(a),a.removeEventListener("dispose",R)};var f=R;u!==void 0&&u.texture.dispose();const g=a.morphAttributes.position!==void 0,v=a.morphAttributes.normal!==void 0,m=a.morphAttributes.color!==void 0,p=a.morphAttributes.position||[],E=a.morphAttributes.normal||[],b=a.morphAttributes.color||[];let x=0;g===!0&&(x=1),v===!0&&(x=2),m===!0&&(x=3);let M=a.attributes.position.count*x,T=1;M>e.maxTextureSize&&(T=Math.ceil(M/e.maxTextureSize),M=e.maxTextureSize);const A=new Float32Array(M*T*4*d),_=new ou(A,M,T,d);_.type=hi,_.needsUpdate=!0;const S=x*4;for(let C=0;C<d;C++){const L=p[C],B=E[C],X=b[C],U=M*T*4*C;for(let N=0;N<L.count;N++){const z=N*S;g===!0&&(n.fromBufferAttribute(L,N),A[U+z+0]=n.x,A[U+z+1]=n.y,A[U+z+2]=n.z,A[U+z+3]=0),v===!0&&(n.fromBufferAttribute(B,N),A[U+z+4]=n.x,A[U+z+5]=n.y,A[U+z+6]=n.z,A[U+z+7]=0),m===!0&&(n.fromBufferAttribute(X,N),A[U+z+8]=n.x,A[U+z+9]=n.y,A[U+z+10]=n.z,A[U+z+11]=X.itemSize===4?n.w:1)}}u={count:d,texture:_,size:new Ue(M,T)},i.set(a,u),a.addEventListener("dispose",R)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)c.getUniforms().setValue(r,"morphTexture",o.morphTexture,t);else{let g=0;for(let m=0;m<l.length;m++)g+=l[m];const v=a.morphTargetsRelative?1:1-g;c.getUniforms().setValue(r,"morphTargetBaseInfluence",v),c.getUniforms().setValue(r,"morphTargetInfluences",l)}c.getUniforms().setValue(r,"morphTargetsTexture",u.texture,t),c.getUniforms().setValue(r,"morphTargetsTextureSize",u.size)}return{update:s}}function F_(r,e,t,i,n){let s=new WeakMap;function o(l){const h=n.render.frame,d=l.geometry,u=e.get(l,d);if(s.get(u)!==h&&(e.update(u),s.set(u,h)),l.isInstancedMesh&&(l.hasEventListener("dispose",c)===!1&&l.addEventListener("dispose",c),s.get(l)!==h&&(t.update(l.instanceMatrix,r.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,r.ARRAY_BUFFER),s.set(l,h))),l.isSkinnedMesh){const f=l.skeleton;s.get(f)!==h&&(f.update(),s.set(f,h))}return u}function a(){s=new WeakMap}function c(l){const h=l.target;h.removeEventListener("dispose",c),i.releaseStatesOfObject(h),t.remove(h.instanceMatrix),h.instanceColor!==null&&t.remove(h.instanceColor)}return{update:o,dispose:a}}const O_={[Wh]:"LINEAR_TONE_MAPPING",[Xh]:"REINHARD_TONE_MAPPING",[qh]:"CINEON_TONE_MAPPING",[$h]:"ACES_FILMIC_TONE_MAPPING",[Kh]:"AGX_TONE_MAPPING",[Zh]:"NEUTRAL_TONE_MAPPING",[Yh]:"CUSTOM_TONE_MAPPING"};function k_(r,e,t,i,n,s){const o=new Ei(e,t,{type:r,depthBuffer:n,stencilBuffer:s,samples:i?4:0,depthTexture:n?new as(e,t):void 0}),a=new Ei(e,t,{type:ki,depthBuffer:!1,stencilBuffer:!1}),c=new wt;c.setAttribute("position",new je([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new je([0,2,0,0,2,0],2));const l=new hp({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),h=new Ft(c,l),d=new mo(-1,1,1,-1,0,1);let u=null,f=null,g=!1,v,m=null,p=[],E=!1;this.setSize=function(b,x){o.setSize(b,x),a.setSize(b,x);for(let M=0;M<p.length;M++){const T=p[M];T.setSize&&T.setSize(b,x)}},this.setEffects=function(b){p=b,E=p.length>0&&p[0].isRenderPass===!0;const x=o.width,M=o.height;for(let T=0;T<p.length;T++){const A=p[T];A.setSize&&A.setSize(x,M)}},this.begin=function(b,x){if(g||b.toneMapping===Si&&p.length===0)return!1;if(m=x,x!==null){const M=x.width,T=x.height;(o.width!==M||o.height!==T)&&this.setSize(M,T)}return E===!1&&b.setRenderTarget(o),v=b.toneMapping,b.toneMapping=Si,!0},this.hasRenderPass=function(){return E},this.end=function(b,x){b.toneMapping=v,g=!0;let M=o,T=a;for(let A=0;A<p.length;A++){const _=p[A];if(_.enabled!==!1&&(_.render(b,T,M,x),_.needsSwap!==!1)){const S=M;M=T,T=S}}if(u!==b.outputColorSpace||f!==b.toneMapping){u=b.outputColorSpace,f=b.toneMapping,l.defines={},Xe.getTransfer(u)===tt&&(l.defines.SRGB_TRANSFER="");const A=O_[f];A&&(l.defines[A]=""),l.needsUpdate=!0}l.uniforms.tDiffuse.value=M.texture,b.setRenderTarget(m),b.render(h,d),m=null,g=!1},this.isCompositing=function(){return g},this.dispose=function(){o.depthTexture&&o.depthTexture.dispose(),o.dispose(),a.dispose(),c.dispose(),l.dispose()}}const Pu=new zt,ol=new as(1,1),Lu=new ou,Nu=new Mf,Du=new du,nh=[],sh=[],rh=new Float32Array(16),oh=new Float32Array(9),ah=new Float32Array(4);function ms(r,e,t){const i=r[0];if(i<=0||i>0)return r;const n=e*t;let s=nh[n];if(s===void 0&&(s=new Float32Array(n),nh[n]=s),e!==0){i.toArray(s,0);for(let o=1,a=0;o!==e;++o)a+=t,r[o].toArray(s,a)}return s}function At(r,e){if(r.length!==e.length)return!1;for(let t=0,i=r.length;t<i;t++)if(r[t]!==e[t])return!1;return!0}function Rt(r,e){for(let t=0,i=e.length;t<i;t++)r[t]=e[t]}function _o(r,e){let t=sh[e];t===void 0&&(t=new Int32Array(e),sh[e]=t);for(let i=0;i!==e;++i)t[i]=r.allocateTextureUnit();return t}function B_(r,e){const t=this.cache;t[0]!==e&&(r.uniform1f(this.addr,e),t[0]=e)}function z_(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(r.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(At(t,e))return;r.uniform2fv(this.addr,e),Rt(t,e)}}function H_(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(r.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(r.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(At(t,e))return;r.uniform3fv(this.addr,e),Rt(t,e)}}function G_(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(r.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(At(t,e))return;r.uniform4fv(this.addr,e),Rt(t,e)}}function V_(r,e){const t=this.cache,i=e.elements;if(i===void 0){if(At(t,e))return;r.uniformMatrix2fv(this.addr,!1,e),Rt(t,e)}else{if(At(t,i))return;ah.set(i),r.uniformMatrix2fv(this.addr,!1,ah),Rt(t,i)}}function W_(r,e){const t=this.cache,i=e.elements;if(i===void 0){if(At(t,e))return;r.uniformMatrix3fv(this.addr,!1,e),Rt(t,e)}else{if(At(t,i))return;oh.set(i),r.uniformMatrix3fv(this.addr,!1,oh),Rt(t,i)}}function X_(r,e){const t=this.cache,i=e.elements;if(i===void 0){if(At(t,e))return;r.uniformMatrix4fv(this.addr,!1,e),Rt(t,e)}else{if(At(t,i))return;rh.set(i),r.uniformMatrix4fv(this.addr,!1,rh),Rt(t,i)}}function q_(r,e){const t=this.cache;t[0]!==e&&(r.uniform1i(this.addr,e),t[0]=e)}function $_(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(r.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(At(t,e))return;r.uniform2iv(this.addr,e),Rt(t,e)}}function Y_(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(r.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(At(t,e))return;r.uniform3iv(this.addr,e),Rt(t,e)}}function K_(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(r.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(At(t,e))return;r.uniform4iv(this.addr,e),Rt(t,e)}}function Z_(r,e){const t=this.cache;t[0]!==e&&(r.uniform1ui(this.addr,e),t[0]=e)}function J_(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(r.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(At(t,e))return;r.uniform2uiv(this.addr,e),Rt(t,e)}}function j_(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(r.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(At(t,e))return;r.uniform3uiv(this.addr,e),Rt(t,e)}}function Q_(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(r.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(At(t,e))return;r.uniform4uiv(this.addr,e),Rt(t,e)}}function e0(r,e,t){const i=this.cache,n=t.allocateTextureUnit();i[0]!==n&&(r.uniform1i(this.addr,n),i[0]=n);let s;this.type===r.SAMPLER_2D_SHADOW?(ol.compareFunction=t.isReversedDepthBuffer()?xl:_l,s=ol):s=Pu,t.setTexture2D(e||s,n)}function t0(r,e,t){const i=this.cache,n=t.allocateTextureUnit();i[0]!==n&&(r.uniform1i(this.addr,n),i[0]=n),t.setTexture3D(e||Nu,n)}function i0(r,e,t){const i=this.cache,n=t.allocateTextureUnit();i[0]!==n&&(r.uniform1i(this.addr,n),i[0]=n),t.setTextureCube(e||Du,n)}function n0(r,e,t){const i=this.cache,n=t.allocateTextureUnit();i[0]!==n&&(r.uniform1i(this.addr,n),i[0]=n),t.setTexture2DArray(e||Lu,n)}function s0(r){switch(r){case 5126:return B_;case 35664:return z_;case 35665:return H_;case 35666:return G_;case 35674:return V_;case 35675:return W_;case 35676:return X_;case 5124:case 35670:return q_;case 35667:case 35671:return $_;case 35668:case 35672:return Y_;case 35669:case 35673:return K_;case 5125:return Z_;case 36294:return J_;case 36295:return j_;case 36296:return Q_;case 35678:case 36198:case 36298:case 36306:case 35682:return e0;case 35679:case 36299:case 36307:return t0;case 35680:case 36300:case 36308:case 36293:return i0;case 36289:case 36303:case 36311:case 36292:return n0}}function r0(r,e){r.uniform1fv(this.addr,e)}function o0(r,e){const t=ms(e,this.size,2);r.uniform2fv(this.addr,t)}function a0(r,e){const t=ms(e,this.size,3);r.uniform3fv(this.addr,t)}function l0(r,e){const t=ms(e,this.size,4);r.uniform4fv(this.addr,t)}function c0(r,e){const t=ms(e,this.size,4);r.uniformMatrix2fv(this.addr,!1,t)}function h0(r,e){const t=ms(e,this.size,9);r.uniformMatrix3fv(this.addr,!1,t)}function u0(r,e){const t=ms(e,this.size,16);r.uniformMatrix4fv(this.addr,!1,t)}function d0(r,e){r.uniform1iv(this.addr,e)}function f0(r,e){r.uniform2iv(this.addr,e)}function p0(r,e){r.uniform3iv(this.addr,e)}function m0(r,e){r.uniform4iv(this.addr,e)}function g0(r,e){r.uniform1uiv(this.addr,e)}function _0(r,e){r.uniform2uiv(this.addr,e)}function x0(r,e){r.uniform3uiv(this.addr,e)}function v0(r,e){r.uniform4uiv(this.addr,e)}function y0(r,e,t){const i=this.cache,n=e.length,s=_o(t,n);At(i,s)||(r.uniform1iv(this.addr,s),Rt(i,s));let o;this.type===r.SAMPLER_2D_SHADOW?o=ol:o=Pu;for(let a=0;a!==n;++a)t.setTexture2D(e[a]||o,s[a])}function b0(r,e,t){const i=this.cache,n=e.length,s=_o(t,n);At(i,s)||(r.uniform1iv(this.addr,s),Rt(i,s));for(let o=0;o!==n;++o)t.setTexture3D(e[o]||Nu,s[o])}function M0(r,e,t){const i=this.cache,n=e.length,s=_o(t,n);At(i,s)||(r.uniform1iv(this.addr,s),Rt(i,s));for(let o=0;o!==n;++o)t.setTextureCube(e[o]||Du,s[o])}function S0(r,e,t){const i=this.cache,n=e.length,s=_o(t,n);At(i,s)||(r.uniform1iv(this.addr,s),Rt(i,s));for(let o=0;o!==n;++o)t.setTexture2DArray(e[o]||Lu,s[o])}function E0(r){switch(r){case 5126:return r0;case 35664:return o0;case 35665:return a0;case 35666:return l0;case 35674:return c0;case 35675:return h0;case 35676:return u0;case 5124:case 35670:return d0;case 35667:case 35671:return f0;case 35668:case 35672:return p0;case 35669:case 35673:return m0;case 5125:return g0;case 36294:return _0;case 36295:return x0;case 36296:return v0;case 35678:case 36198:case 36298:case 36306:case 35682:return y0;case 35679:case 36299:case 36307:return b0;case 35680:case 36300:case 36308:case 36293:return M0;case 36289:case 36303:case 36311:case 36292:return S0}}class T0{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=s0(t.type)}}class w0{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=E0(t.type)}}class A0{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){const n=this.seq;for(let s=0,o=n.length;s!==o;++s){const a=n[s];a.setValue(e,t[a.id],i)}}}const oa=/(\w+)(\])?(\[|\.)?/g;function lh(r,e){r.seq.push(e),r.map[e.id]=e}function R0(r,e,t){const i=r.name,n=i.length;for(oa.lastIndex=0;;){const s=oa.exec(i),o=oa.lastIndex;let a=s[1];const c=s[2]==="]",l=s[3];if(c&&(a=a|0),l===void 0||l==="["&&o+2===n){lh(t,l===void 0?new T0(a,r,e):new w0(a,r,e));break}else{let d=t.map[a];d===void 0&&(d=new A0(a),lh(t,d)),t=d}}}class Vr{constructor(e,t){this.seq=[],this.map={};const i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let o=0;o<i;++o){const a=e.getActiveUniform(t,o),c=e.getUniformLocation(t,a.name);R0(a,c,this)}const n=[],s=[];for(const o of this.seq)o.type===e.SAMPLER_2D_SHADOW||o.type===e.SAMPLER_CUBE_SHADOW||o.type===e.SAMPLER_2D_ARRAY_SHADOW?n.push(o):s.push(o);n.length>0&&(this.seq=n.concat(s))}setValue(e,t,i,n){const s=this.map[t];s!==void 0&&s.setValue(e,i,n)}setOptional(e,t,i){const n=t[i];n!==void 0&&this.setValue(e,i,n)}static upload(e,t,i,n){for(let s=0,o=t.length;s!==o;++s){const a=t[s],c=i[a.id];c.needsUpdate!==!1&&a.setValue(e,c.value,n)}}static seqWithValue(e,t){const i=[];for(let n=0,s=e.length;n!==s;++n){const o=e[n];o.id in t&&i.push(o)}return i}}function ch(r,e,t){const i=r.createShader(e);return r.shaderSource(i,t),r.compileShader(i),i}const C0=37297;let P0=0;function L0(r,e){const t=r.split(`
`),i=[],n=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let o=n;o<s;o++){const a=o+1;i.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return i.join(`
`)}const hh=new ke;function N0(r){Xe._getMatrix(hh,Xe.workingColorSpace,r);const e=`mat3( ${hh.elements.map(t=>t.toFixed(4))} )`;switch(Xe.getTransfer(r)){case Yr:return[e,"LinearTransferOETF"];case tt:return[e,"sRGBTransferOETF"];default:return Ne("WebGLProgram: Unsupported color space: ",r),[e,"LinearTransferOETF"]}}function uh(r,e,t){const i=r.getShaderParameter(e,r.COMPILE_STATUS),s=(r.getShaderInfoLog(e)||"").trim();if(i&&s==="")return"";const o=/ERROR: 0:(\d+)/.exec(s);if(o){const a=parseInt(o[1]);return t.toUpperCase()+`

`+s+`

`+L0(r.getShaderSource(e),a)}else return s}function D0(r,e){const t=N0(e);return[`vec4 ${r}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}const I0={[Wh]:"Linear",[Xh]:"Reinhard",[qh]:"Cineon",[$h]:"ACESFilmic",[Kh]:"AgX",[Zh]:"Neutral",[Yh]:"Custom"};function U0(r,e){const t=I0[e];return t===void 0?(Ne("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+r+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+r+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const wr=new D;function F0(){Xe.getLuminanceCoefficients(wr);const r=wr.x.toFixed(4),e=wr.y.toFixed(4),t=wr.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${r}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function O0(r){return[r.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",r.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Rs).join(`
`)}function k0(r){const e=[];for(const t in r){const i=r[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function B0(r,e){const t={},i=r.getProgramParameter(e,r.ACTIVE_ATTRIBUTES);for(let n=0;n<i;n++){const s=r.getActiveAttrib(e,n),o=s.name;let a=1;s.type===r.FLOAT_MAT2&&(a=2),s.type===r.FLOAT_MAT3&&(a=3),s.type===r.FLOAT_MAT4&&(a=4),t[o]={type:s.type,location:r.getAttribLocation(e,o),locationSize:a}}return t}function Rs(r){return r!==""}function dh(r,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return r.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function fh(r,e){return r.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const z0=/^[ \t]*#include +<([\w\d./]+)>/gm;function al(r){return r.replace(z0,G0)}const H0=new Map;function G0(r,e){let t=Ge[e];if(t===void 0){const i=H0.get(e);if(i!==void 0)t=Ge[i],Ne('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return al(t)}const V0=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function ph(r){return r.replace(V0,W0)}function W0(r,e,t,i){let n="";for(let s=parseInt(e);s<parseInt(t);s++)n+=i.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return n}function mh(r){let e=`precision ${r.precision} float;
	precision ${r.precision} int;
	precision ${r.precision} sampler2D;
	precision ${r.precision} samplerCube;
	precision ${r.precision} sampler3D;
	precision ${r.precision} sampler2DArray;
	precision ${r.precision} sampler2DShadow;
	precision ${r.precision} samplerCubeShadow;
	precision ${r.precision} sampler2DArrayShadow;
	precision ${r.precision} isampler2D;
	precision ${r.precision} isampler3D;
	precision ${r.precision} isamplerCube;
	precision ${r.precision} isampler2DArray;
	precision ${r.precision} usampler2D;
	precision ${r.precision} usampler3D;
	precision ${r.precision} usamplerCube;
	precision ${r.precision} usampler2DArray;
	`;return r.precision==="highp"?e+=`
#define HIGH_PRECISION`:r.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:r.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}const X0={[kr]:"SHADOWMAP_TYPE_PCF",[ws]:"SHADOWMAP_TYPE_VSM"};function q0(r){return X0[r.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const $0={[Mn]:"ENVMAP_TYPE_CUBE",[ss]:"ENVMAP_TYPE_CUBE",[lo]:"ENVMAP_TYPE_CUBE_UV"};function Y0(r){return r.envMap===!1?"ENVMAP_TYPE_CUBE":$0[r.envMapMode]||"ENVMAP_TYPE_CUBE"}const K0={[ss]:"ENVMAP_MODE_REFRACTION"};function Z0(r){return r.envMap===!1?"ENVMAP_MODE_REFLECTION":K0[r.envMapMode]||"ENVMAP_MODE_REFLECTION"}const J0={[ao]:"ENVMAP_BLENDING_MULTIPLY",[Fd]:"ENVMAP_BLENDING_MIX",[Od]:"ENVMAP_BLENDING_ADD"};function j0(r){return r.envMap===!1?"ENVMAP_BLENDING_NONE":J0[r.combine]||"ENVMAP_BLENDING_NONE"}function Q0(r){const e=r.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),7*16)),texelHeight:i,maxMip:t}}function ex(r,e,t,i){const n=r.getContext(),s=t.defines;let o=t.vertexShader,a=t.fragmentShader;const c=q0(t),l=Y0(t),h=Z0(t),d=j0(t),u=Q0(t),f=O0(t),g=k0(s),v=n.createProgram();let m,p,E=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Rs).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Rs).join(`
`),p.length>0&&(p+=`
`)):(m=[mh(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Rs).join(`
`),p=[mh(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+l:"",t.envMap?"#define "+h:"",t.envMap?"#define "+d:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Si?"#define TONE_MAPPING":"",t.toneMapping!==Si?Ge.tonemapping_pars_fragment:"",t.toneMapping!==Si?U0("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Ge.colorspace_pars_fragment,D0("linearToOutputTexel",t.outputColorSpace),F0(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Rs).join(`
`)),o=al(o),o=dh(o,t),o=fh(o,t),a=al(a),a=dh(a,t),a=fh(a,t),o=ph(o),a=ph(a),t.isRawShaderMaterial!==!0&&(E=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",t.glslVersion===lc?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===lc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);const b=E+m+o,x=E+p+a,M=ch(n,n.VERTEX_SHADER,b),T=ch(n,n.FRAGMENT_SHADER,x);n.attachShader(v,M),n.attachShader(v,T),t.index0AttributeName!==void 0?n.bindAttribLocation(v,0,t.index0AttributeName):t.hasPositionAttribute===!0&&n.bindAttribLocation(v,0,"position"),n.linkProgram(v);function A(C){if(r.debug.checkShaderErrors){const L=n.getProgramInfoLog(v)||"",B=n.getShaderInfoLog(M)||"",X=n.getShaderInfoLog(T)||"",U=L.trim(),N=B.trim(),z=X.trim();let $=!0,j=!0;if(n.getProgramParameter(v,n.LINK_STATUS)===!1)if($=!1,typeof r.debug.onShaderError=="function")r.debug.onShaderError(n,v,M,T);else{const se=uh(n,M,"vertex"),ie=uh(n,T,"fragment");We("WebGLProgram: Shader Error "+n.getError()+" - VALIDATE_STATUS "+n.getProgramParameter(v,n.VALIDATE_STATUS)+`

Material Name: `+C.name+`
Material Type: `+C.type+`

Program Info Log: `+U+`
`+se+`
`+ie)}else U!==""?Ne("WebGLProgram: Program Info Log:",U):(N===""||z==="")&&(j=!1);j&&(C.diagnostics={runnable:$,programLog:U,vertexShader:{log:N,prefix:m},fragmentShader:{log:z,prefix:p}})}n.deleteShader(M),n.deleteShader(T),_=new Vr(n,v),S=B0(n,v)}let _;this.getUniforms=function(){return _===void 0&&A(this),_};let S;this.getAttributes=function(){return S===void 0&&A(this),S};let R=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return R===!1&&(R=n.getProgramParameter(v,C0)),R},this.destroy=function(){i.releaseStatesOfProgram(this),n.deleteProgram(v),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=P0++,this.cacheKey=e,this.usedTimes=1,this.program=v,this.vertexShader=M,this.fragmentShader=T,this}let tx=0;class ix{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,i){const n=this._getShaderCacheForMaterial(e);return n.has(t)===!1&&(n.add(t),t.usedTimes++),n.has(i)===!1&&(n.add(i),i.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){const t=this.shaderCache;let i=t.get(e);return i===void 0&&(i=new nx(e),t.set(e,i)),i}}class nx{constructor(e){this.id=tx++,this.code=e,this.usedTimes=0}}function sx(r){return r===Sn||r===Wr||r===Xr}function rx(r,e,t,i,n,s){const o=new au,a=new ix,c=new Set,l=[],h=new Map,d=i.logarithmicDepthBuffer;let u=i.precision;const f={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(_){return c.add(_),_===0?"uv":`uv${_}`}function v(_,S,R,C,L,B){const X=C.fog,U=L.geometry,N=_.isMeshStandardMaterial||_.isMeshLambertMaterial||_.isMeshPhongMaterial?C.environment:null,z=_.isMeshStandardMaterial||_.isMeshLambertMaterial&&!_.envMap||_.isMeshPhongMaterial&&!_.envMap,$=e.get(_.envMap||N,z),j=$&&$.mapping===lo?$.image.height:null,se=f[_.type];_.precision!==null&&(u=i.getMaxPrecision(_.precision),u!==_.precision&&Ne("WebGLProgram.getParameters:",_.precision,"not supported, using",u,"instead."));const ie=U.morphAttributes.position||U.morphAttributes.normal||U.morphAttributes.color,re=ie!==void 0?ie.length:0;let me=0;U.morphAttributes.position!==void 0&&(me=1),U.morphAttributes.normal!==void 0&&(me=2),U.morphAttributes.color!==void 0&&(me=3);let ve,ae,k,Z;if(se){const Se=yi[se];ve=Se.vertexShader,ae=Se.fragmentShader}else{ve=_.vertexShader,ae=_.fragmentShader;const Se=a.getVertexShaderStage(_),pt=a.getFragmentShaderStage(_);a.update(_,Se,pt),k=Se.id,Z=pt.id}const ee=r.getRenderTarget(),ye=r.state.buffers.depth.getReversed(),Pe=L.isInstancedMesh===!0,Ie=L.isBatchedMesh===!0,gt=!!_.map,$e=!!_.matcap,rt=!!$,Je=!!_.aoMap,Ke=!!_.lightMap,yt=!!_.bumpMap&&_.wireframe===!1,St=!!_.normalMap,Ct=!!_.displacementMap,Dt=!!_.emissiveMap,ft=!!_.metalnessMap,bt=!!_.roughnessMap,F=_.anisotropy>0,Xt=_.clearcoat>0,et=_.dispersion>0,P=_.iridescence>0,y=_.sheen>0,H=_.transmission>0,W=F&&!!_.anisotropyMap,K=Xt&&!!_.clearcoatMap,oe=Xt&&!!_.clearcoatNormalMap,ce=Xt&&!!_.clearcoatRoughnessMap,J=P&&!!_.iridescenceMap,te=P&&!!_.iridescenceThicknessMap,he=y&&!!_.sheenColorMap,Ae=y&&!!_.sheenRoughnessMap,fe=!!_.specularMap,ue=!!_.specularColorMap,De=!!_.specularIntensityMap,Fe=H&&!!_.transmissionMap,ze=H&&!!_.thicknessMap,I=!!_.gradientMap,le=!!_.alphaMap,Q=_.alphaTest>0,de=!!_.alphaHash,xe=!!_.extensions;let ne=Si;_.toneMapped&&(ee===null||ee.isXRRenderTarget===!0)&&(ne=r.toneMapping);const we={shaderID:se,shaderType:_.type,shaderName:_.name,vertexShader:ve,fragmentShader:ae,defines:_.defines,customVertexShaderID:k,customFragmentShaderID:Z,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:u,batching:Ie,batchingColor:Ie&&L._colorsTexture!==null,instancing:Pe,instancingColor:Pe&&L.instanceColor!==null,instancingMorph:Pe&&L.morphTexture!==null,outputColorSpace:ee===null?r.outputColorSpace:ee.isXRRenderTarget===!0?ee.texture.colorSpace:Xe.workingColorSpace,alphaToCoverage:!!_.alphaToCoverage,map:gt,matcap:$e,envMap:rt,envMapMode:rt&&$.mapping,envMapCubeUVHeight:j,aoMap:Je,lightMap:Ke,bumpMap:yt,normalMap:St,displacementMap:Ct,emissiveMap:Dt,normalMapObjectSpace:St&&_.normalMapType===Gd,normalMapTangentSpace:St&&_.normalMapType===qr,packedNormalMap:St&&_.normalMapType===qr&&sx(_.normalMap.format),metalnessMap:ft,roughnessMap:bt,anisotropy:F,anisotropyMap:W,clearcoat:Xt,clearcoatMap:K,clearcoatNormalMap:oe,clearcoatRoughnessMap:ce,dispersion:et,iridescence:P,iridescenceMap:J,iridescenceThicknessMap:te,sheen:y,sheenColorMap:he,sheenRoughnessMap:Ae,specularMap:fe,specularColorMap:ue,specularIntensityMap:De,transmission:H,transmissionMap:Fe,thicknessMap:ze,gradientMap:I,opaque:_.transparent===!1&&_.blending===jn&&_.alphaToCoverage===!1,alphaMap:le,alphaTest:Q,alphaHash:de,combine:_.combine,mapUv:gt&&g(_.map.channel),aoMapUv:Je&&g(_.aoMap.channel),lightMapUv:Ke&&g(_.lightMap.channel),bumpMapUv:yt&&g(_.bumpMap.channel),normalMapUv:St&&g(_.normalMap.channel),displacementMapUv:Ct&&g(_.displacementMap.channel),emissiveMapUv:Dt&&g(_.emissiveMap.channel),metalnessMapUv:ft&&g(_.metalnessMap.channel),roughnessMapUv:bt&&g(_.roughnessMap.channel),anisotropyMapUv:W&&g(_.anisotropyMap.channel),clearcoatMapUv:K&&g(_.clearcoatMap.channel),clearcoatNormalMapUv:oe&&g(_.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ce&&g(_.clearcoatRoughnessMap.channel),iridescenceMapUv:J&&g(_.iridescenceMap.channel),iridescenceThicknessMapUv:te&&g(_.iridescenceThicknessMap.channel),sheenColorMapUv:he&&g(_.sheenColorMap.channel),sheenRoughnessMapUv:Ae&&g(_.sheenRoughnessMap.channel),specularMapUv:fe&&g(_.specularMap.channel),specularColorMapUv:ue&&g(_.specularColorMap.channel),specularIntensityMapUv:De&&g(_.specularIntensityMap.channel),transmissionMapUv:Fe&&g(_.transmissionMap.channel),thicknessMapUv:ze&&g(_.thicknessMap.channel),alphaMapUv:le&&g(_.alphaMap.channel),vertexTangents:!!U.attributes.tangent&&(St||F),vertexNormals:!!U.attributes.normal,vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!U.attributes.color&&U.attributes.color.itemSize===4,pointsUvs:L.isPoints===!0&&!!U.attributes.uv&&(gt||le),fog:!!X,useFog:_.fog===!0,fogExp2:!!X&&X.isFogExp2,flatShading:_.wireframe===!1&&(_.flatShading===!0||U.attributes.normal===void 0&&St===!1&&(_.isMeshLambertMaterial||_.isMeshPhongMaterial||_.isMeshStandardMaterial||_.isMeshPhysicalMaterial)),sizeAttenuation:_.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:ye,skinning:L.isSkinnedMesh===!0,hasPositionAttribute:U.attributes.position!==void 0,morphTargets:U.morphAttributes.position!==void 0,morphNormals:U.morphAttributes.normal!==void 0,morphColors:U.morphAttributes.color!==void 0,morphTargetsCount:re,morphTextureStride:me,numDirLights:S.directional.length,numPointLights:S.point.length,numSpotLights:S.spot.length,numSpotLightMaps:S.spotLightMap.length,numRectAreaLights:S.rectArea.length,numHemiLights:S.hemi.length,numDirLightShadows:S.directionalShadowMap.length,numPointLightShadows:S.pointShadowMap.length,numSpotLightShadows:S.spotShadowMap.length,numSpotLightShadowsWithMaps:S.numSpotLightShadowsWithMaps,numLightProbes:S.numLightProbes,numLightProbeGrids:B.length,numClippingPlanes:s.numPlanes,numClipIntersection:s.numIntersection,dithering:_.dithering,shadowMapEnabled:r.shadowMap.enabled&&R.length>0,shadowMapType:r.shadowMap.type,toneMapping:ne,decodeVideoTexture:gt&&_.map.isVideoTexture===!0&&Xe.getTransfer(_.map.colorSpace)===tt,decodeVideoTextureEmissive:Dt&&_.emissiveMap.isVideoTexture===!0&&Xe.getTransfer(_.emissiveMap.colorSpace)===tt,premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===bi,flipSided:_.side===$t,useDepthPacking:_.depthPacking>=0,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionClipCullDistance:xe&&_.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(xe&&_.extensions.multiDraw===!0||Ie)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:_.customProgramCacheKey()};return we.vertexUv1s=c.has(1),we.vertexUv2s=c.has(2),we.vertexUv3s=c.has(3),c.clear(),we}function m(_){const S=[];if(_.shaderID?S.push(_.shaderID):(S.push(_.customVertexShaderID),S.push(_.customFragmentShaderID)),_.defines!==void 0)for(const R in _.defines)S.push(R),S.push(_.defines[R]);return _.isRawShaderMaterial===!1&&(p(S,_),E(S,_),S.push(r.outputColorSpace)),S.push(_.customProgramCacheKey),S.join()}function p(_,S){_.push(S.precision),_.push(S.outputColorSpace),_.push(S.envMapMode),_.push(S.envMapCubeUVHeight),_.push(S.mapUv),_.push(S.alphaMapUv),_.push(S.lightMapUv),_.push(S.aoMapUv),_.push(S.bumpMapUv),_.push(S.normalMapUv),_.push(S.displacementMapUv),_.push(S.emissiveMapUv),_.push(S.metalnessMapUv),_.push(S.roughnessMapUv),_.push(S.anisotropyMapUv),_.push(S.clearcoatMapUv),_.push(S.clearcoatNormalMapUv),_.push(S.clearcoatRoughnessMapUv),_.push(S.iridescenceMapUv),_.push(S.iridescenceThicknessMapUv),_.push(S.sheenColorMapUv),_.push(S.sheenRoughnessMapUv),_.push(S.specularMapUv),_.push(S.specularColorMapUv),_.push(S.specularIntensityMapUv),_.push(S.transmissionMapUv),_.push(S.thicknessMapUv),_.push(S.combine),_.push(S.fogExp2),_.push(S.sizeAttenuation),_.push(S.morphTargetsCount),_.push(S.morphAttributeCount),_.push(S.numDirLights),_.push(S.numPointLights),_.push(S.numSpotLights),_.push(S.numSpotLightMaps),_.push(S.numHemiLights),_.push(S.numRectAreaLights),_.push(S.numDirLightShadows),_.push(S.numPointLightShadows),_.push(S.numSpotLightShadows),_.push(S.numSpotLightShadowsWithMaps),_.push(S.numLightProbes),_.push(S.shadowMapType),_.push(S.toneMapping),_.push(S.numClippingPlanes),_.push(S.numClipIntersection),_.push(S.depthPacking)}function E(_,S){o.disableAll(),S.instancing&&o.enable(0),S.instancingColor&&o.enable(1),S.instancingMorph&&o.enable(2),S.matcap&&o.enable(3),S.envMap&&o.enable(4),S.normalMapObjectSpace&&o.enable(5),S.normalMapTangentSpace&&o.enable(6),S.clearcoat&&o.enable(7),S.iridescence&&o.enable(8),S.alphaTest&&o.enable(9),S.vertexColors&&o.enable(10),S.vertexAlphas&&o.enable(11),S.vertexUv1s&&o.enable(12),S.vertexUv2s&&o.enable(13),S.vertexUv3s&&o.enable(14),S.vertexTangents&&o.enable(15),S.anisotropy&&o.enable(16),S.alphaHash&&o.enable(17),S.batching&&o.enable(18),S.dispersion&&o.enable(19),S.batchingColor&&o.enable(20),S.gradientMap&&o.enable(21),S.packedNormalMap&&o.enable(22),S.vertexNormals&&o.enable(23),_.push(o.mask),o.disableAll(),S.fog&&o.enable(0),S.useFog&&o.enable(1),S.flatShading&&o.enable(2),S.logarithmicDepthBuffer&&o.enable(3),S.reversedDepthBuffer&&o.enable(4),S.skinning&&o.enable(5),S.morphTargets&&o.enable(6),S.morphNormals&&o.enable(7),S.morphColors&&o.enable(8),S.premultipliedAlpha&&o.enable(9),S.shadowMapEnabled&&o.enable(10),S.doubleSided&&o.enable(11),S.flipSided&&o.enable(12),S.useDepthPacking&&o.enable(13),S.dithering&&o.enable(14),S.transmission&&o.enable(15),S.sheen&&o.enable(16),S.opaque&&o.enable(17),S.pointsUvs&&o.enable(18),S.decodeVideoTexture&&o.enable(19),S.decodeVideoTextureEmissive&&o.enable(20),S.alphaToCoverage&&o.enable(21),S.numLightProbeGrids>0&&o.enable(22),S.hasPositionAttribute&&o.enable(23),_.push(o.mask)}function b(_){const S=f[_.type];let R;if(S){const C=yi[S];R=ap.clone(C.uniforms)}else R=_.uniforms;return R}function x(_,S){let R=h.get(S);return R!==void 0?++R.usedTimes:(R=new ex(r,S,_,n),l.push(R),h.set(S,R)),R}function M(_){if(--_.usedTimes===0){const S=l.indexOf(_);l[S]=l[l.length-1],l.pop(),h.delete(_.cacheKey),_.destroy()}}function T(_){a.remove(_)}function A(){a.dispose()}return{getParameters:v,getProgramCacheKey:m,getUniforms:b,acquireProgram:x,releaseProgram:M,releaseShaderCache:T,programs:l,dispose:A}}function ox(){let r=new WeakMap;function e(o){return r.has(o)}function t(o){let a=r.get(o);return a===void 0&&(a={},r.set(o,a)),a}function i(o){r.delete(o)}function n(o,a,c){r.get(o)[a]=c}function s(){r=new WeakMap}return{has:e,get:t,remove:i,update:n,dispose:s}}function ax(r,e){return r.groupOrder!==e.groupOrder?r.groupOrder-e.groupOrder:r.renderOrder!==e.renderOrder?r.renderOrder-e.renderOrder:r.material.id!==e.material.id?r.material.id-e.material.id:r.materialVariant!==e.materialVariant?r.materialVariant-e.materialVariant:r.z!==e.z?r.z-e.z:r.id-e.id}function gh(r,e){return r.groupOrder!==e.groupOrder?r.groupOrder-e.groupOrder:r.renderOrder!==e.renderOrder?r.renderOrder-e.renderOrder:r.z!==e.z?e.z-r.z:r.id-e.id}function _h(){const r=[];let e=0;const t=[],i=[],n=[];function s(){e=0,t.length=0,i.length=0,n.length=0}function o(u){let f=0;return u.isInstancedMesh&&(f+=2),u.isSkinnedMesh&&(f+=1),f}function a(u,f,g,v,m,p){let E=r[e];return E===void 0?(E={id:u.id,object:u,geometry:f,material:g,materialVariant:o(u),groupOrder:v,renderOrder:u.renderOrder,z:m,group:p},r[e]=E):(E.id=u.id,E.object=u,E.geometry=f,E.material=g,E.materialVariant=o(u),E.groupOrder=v,E.renderOrder=u.renderOrder,E.z=m,E.group=p),e++,E}function c(u,f,g,v,m,p){const E=a(u,f,g,v,m,p);g.transmission>0?i.push(E):g.transparent===!0?n.push(E):t.push(E)}function l(u,f,g,v,m,p){const E=a(u,f,g,v,m,p);g.transmission>0?i.unshift(E):g.transparent===!0?n.unshift(E):t.unshift(E)}function h(u,f,g){t.length>1&&t.sort(u||ax),i.length>1&&i.sort(f||gh),n.length>1&&n.sort(f||gh),g&&(t.reverse(),i.reverse(),n.reverse())}function d(){for(let u=e,f=r.length;u<f;u++){const g=r[u];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:t,transmissive:i,transparent:n,init:s,push:c,unshift:l,finish:d,sort:h}}function lx(){let r=new WeakMap;function e(i,n){const s=r.get(i);let o;return s===void 0?(o=new _h,r.set(i,[o])):n>=s.length?(o=new _h,s.push(o)):o=s[n],o}function t(){r=new WeakMap}return{get:e,dispose:t}}function cx(){const r={};return{get:function(e){if(r[e.id]!==void 0)return r[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new D,color:new Be};break;case"SpotLight":t={position:new D,direction:new D,color:new Be,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new D,color:new Be,distance:0,decay:0};break;case"HemisphereLight":t={direction:new D,skyColor:new Be,groundColor:new Be};break;case"RectAreaLight":t={color:new Be,position:new D,halfWidth:new D,halfHeight:new D};break}return r[e.id]=t,t}}}function hx(){const r={};return{get:function(e){if(r[e.id]!==void 0)return r[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ue};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ue};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ue,shadowCameraNear:1,shadowCameraFar:1e3};break}return r[e.id]=t,t}}}let ux=0;function dx(r,e){return(e.castShadow?2:0)-(r.castShadow?2:0)+(e.map?1:0)-(r.map?1:0)}function fx(r){const e=new cx,t=hx(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)i.probe.push(new D);const n=new D,s=new Oe,o=new Oe;function a(l){let h=0,d=0,u=0;for(let S=0;S<9;S++)i.probe[S].set(0,0,0);let f=0,g=0,v=0,m=0,p=0,E=0,b=0,x=0,M=0,T=0,A=0;l.sort(dx);for(let S=0,R=l.length;S<R;S++){const C=l[S],L=C.color,B=C.intensity,X=C.distance;let U=null;if(C.shadow&&C.shadow.map&&(C.shadow.map.texture.format===Sn?U=C.shadow.map.texture:U=C.shadow.map.depthTexture||C.shadow.map.texture),C.isAmbientLight)h+=L.r*B,d+=L.g*B,u+=L.b*B;else if(C.isLightProbe){for(let N=0;N<9;N++)i.probe[N].addScaledVector(C.sh.coefficients[N],B);A++}else if(C.isDirectionalLight){const N=e.get(C);if(N.color.copy(C.color).multiplyScalar(C.intensity),C.castShadow){const z=C.shadow,$=t.get(C);$.shadowIntensity=z.intensity,$.shadowBias=z.bias,$.shadowNormalBias=z.normalBias,$.shadowRadius=z.radius,$.shadowMapSize=z.mapSize,i.directionalShadow[f]=$,i.directionalShadowMap[f]=U,i.directionalShadowMatrix[f]=C.shadow.matrix,E++}i.directional[f]=N,f++}else if(C.isSpotLight){const N=e.get(C);N.position.setFromMatrixPosition(C.matrixWorld),N.color.copy(L).multiplyScalar(B),N.distance=X,N.coneCos=Math.cos(C.angle),N.penumbraCos=Math.cos(C.angle*(1-C.penumbra)),N.decay=C.decay,i.spot[v]=N;const z=C.shadow;if(C.map&&(i.spotLightMap[M]=C.map,M++,z.updateMatrices(C),C.castShadow&&T++),i.spotLightMatrix[v]=z.matrix,C.castShadow){const $=t.get(C);$.shadowIntensity=z.intensity,$.shadowBias=z.bias,$.shadowNormalBias=z.normalBias,$.shadowRadius=z.radius,$.shadowMapSize=z.mapSize,i.spotShadow[v]=$,i.spotShadowMap[v]=U,x++}v++}else if(C.isRectAreaLight){const N=e.get(C);N.color.copy(L).multiplyScalar(B),N.halfWidth.set(C.width*.5,0,0),N.halfHeight.set(0,C.height*.5,0),i.rectArea[m]=N,m++}else if(C.isPointLight){const N=e.get(C);if(N.color.copy(C.color).multiplyScalar(C.intensity),N.distance=C.distance,N.decay=C.decay,C.castShadow){const z=C.shadow,$=t.get(C);$.shadowIntensity=z.intensity,$.shadowBias=z.bias,$.shadowNormalBias=z.normalBias,$.shadowRadius=z.radius,$.shadowMapSize=z.mapSize,$.shadowCameraNear=z.camera.near,$.shadowCameraFar=z.camera.far,i.pointShadow[g]=$,i.pointShadowMap[g]=U,i.pointShadowMatrix[g]=C.shadow.matrix,b++}i.point[g]=N,g++}else if(C.isHemisphereLight){const N=e.get(C);N.skyColor.copy(C.color).multiplyScalar(B),N.groundColor.copy(C.groundColor).multiplyScalar(B),i.hemi[p]=N,p++}}m>0&&(r.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=pe.LTC_FLOAT_1,i.rectAreaLTC2=pe.LTC_FLOAT_2):(i.rectAreaLTC1=pe.LTC_HALF_1,i.rectAreaLTC2=pe.LTC_HALF_2)),i.ambient[0]=h,i.ambient[1]=d,i.ambient[2]=u;const _=i.hash;(_.directionalLength!==f||_.pointLength!==g||_.spotLength!==v||_.rectAreaLength!==m||_.hemiLength!==p||_.numDirectionalShadows!==E||_.numPointShadows!==b||_.numSpotShadows!==x||_.numSpotMaps!==M||_.numLightProbes!==A)&&(i.directional.length=f,i.spot.length=v,i.rectArea.length=m,i.point.length=g,i.hemi.length=p,i.directionalShadow.length=E,i.directionalShadowMap.length=E,i.pointShadow.length=b,i.pointShadowMap.length=b,i.spotShadow.length=x,i.spotShadowMap.length=x,i.directionalShadowMatrix.length=E,i.pointShadowMatrix.length=b,i.spotLightMatrix.length=x+M-T,i.spotLightMap.length=M,i.numSpotLightShadowsWithMaps=T,i.numLightProbes=A,_.directionalLength=f,_.pointLength=g,_.spotLength=v,_.rectAreaLength=m,_.hemiLength=p,_.numDirectionalShadows=E,_.numPointShadows=b,_.numSpotShadows=x,_.numSpotMaps=M,_.numLightProbes=A,i.version=ux++)}function c(l,h){let d=0,u=0,f=0,g=0,v=0;const m=h.matrixWorldInverse;for(let p=0,E=l.length;p<E;p++){const b=l[p];if(b.isDirectionalLight){const x=i.directional[d];x.direction.setFromMatrixPosition(b.matrixWorld),n.setFromMatrixPosition(b.target.matrixWorld),x.direction.sub(n),x.direction.transformDirection(m),d++}else if(b.isSpotLight){const x=i.spot[f];x.position.setFromMatrixPosition(b.matrixWorld),x.position.applyMatrix4(m),x.direction.setFromMatrixPosition(b.matrixWorld),n.setFromMatrixPosition(b.target.matrixWorld),x.direction.sub(n),x.direction.transformDirection(m),f++}else if(b.isRectAreaLight){const x=i.rectArea[g];x.position.setFromMatrixPosition(b.matrixWorld),x.position.applyMatrix4(m),o.identity(),s.copy(b.matrixWorld),s.premultiply(m),o.extractRotation(s),x.halfWidth.set(b.width*.5,0,0),x.halfHeight.set(0,b.height*.5,0),x.halfWidth.applyMatrix4(o),x.halfHeight.applyMatrix4(o),g++}else if(b.isPointLight){const x=i.point[u];x.position.setFromMatrixPosition(b.matrixWorld),x.position.applyMatrix4(m),u++}else if(b.isHemisphereLight){const x=i.hemi[v];x.direction.setFromMatrixPosition(b.matrixWorld),x.direction.transformDirection(m),v++}}}return{setup:a,setupView:c,state:i}}function xh(r){const e=new fx(r),t=[],i=[],n=[];function s(u){d.camera=u,t.length=0,i.length=0,n.length=0}function o(u){t.push(u)}function a(u){i.push(u)}function c(u){n.push(u)}function l(){e.setup(t)}function h(u){e.setupView(t,u)}const d={lightsArray:t,shadowsArray:i,lightProbeGridArray:n,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:s,state:d,setupLights:l,setupLightsView:h,pushLight:o,pushShadow:a,pushLightProbeGrid:c}}function px(r){let e=new WeakMap;function t(n,s=0){const o=e.get(n);let a;return o===void 0?(a=new xh(r),e.set(n,[a])):s>=o.length?(a=new xh(r),o.push(a)):a=o[s],a}function i(){e=new WeakMap}return{get:t,dispose:i}}const mx=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,gx=`uniform sampler2D shadow_pass;
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
}`,_x=[new D(1,0,0),new D(-1,0,0),new D(0,1,0),new D(0,-1,0),new D(0,0,1),new D(0,0,-1)],xx=[new D(0,-1,0),new D(0,-1,0),new D(0,0,1),new D(0,0,-1),new D(0,-1,0),new D(0,-1,0)],vh=new Oe,Ss=new D,aa=new D;function vx(r,e,t){let i=new Sl;const n=new Ue,s=new Ue,o=new st,a=new dp,c=new fp,l={},h=t.maxTextureSize,d={[Oi]:$t,[$t]:Oi,[bi]:bi},u=new wi({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Ue},radius:{value:4}},vertexShader:mx,fragmentShader:gx}),f=u.clone();f.defines.HORIZONTAL_PASS=1;const g=new wt;g.setAttribute("position",new ti(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const v=new Ft(g,u),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=kr;let p=this.type;this.render=function(T,A,_){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||T.length===0)return;this.type===_d&&(Ne("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),this.type=kr);const S=r.getRenderTarget(),R=r.getActiveCubeFace(),C=r.getActiveMipmapLevel(),L=r.state;L.setBlending(Ui),L.buffers.depth.getReversed()===!0?L.buffers.color.setClear(0,0,0,0):L.buffers.color.setClear(1,1,1,1),L.buffers.depth.setTest(!0),L.setScissorTest(!1);const B=p!==this.type;B&&A.traverse(function(X){X.material&&(Array.isArray(X.material)?X.material.forEach(U=>U.needsUpdate=!0):X.material.needsUpdate=!0)});for(let X=0,U=T.length;X<U;X++){const N=T[X],z=N.shadow;if(z===void 0){Ne("WebGLShadowMap:",N,"has no shadow.");continue}if(z.autoUpdate===!1&&z.needsUpdate===!1)continue;n.copy(z.mapSize);const $=z.getFrameExtents();n.multiply($),s.copy(z.mapSize),(n.x>h||n.y>h)&&(n.x>h&&(s.x=Math.floor(h/$.x),n.x=s.x*$.x,z.mapSize.x=s.x),n.y>h&&(s.y=Math.floor(h/$.y),n.y=s.y*$.y,z.mapSize.y=s.y));const j=r.state.buffers.depth.getReversed();if(z.camera._reversedDepth=j,z.map===null||B===!0){if(z.map!==null&&(z.map.depthTexture!==null&&(z.map.depthTexture.dispose(),z.map.depthTexture=null),z.map.dispose()),this.type===ws){if(N.isPointLight){Ne("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}z.map=new Ei(n.x,n.y,{format:Sn,type:ki,minFilter:Tt,magFilter:Tt,generateMipmaps:!1}),z.map.texture.name=N.name+".shadowMap",z.map.depthTexture=new as(n.x,n.y,hi),z.map.depthTexture.name=N.name+".shadowMapDepth",z.map.depthTexture.format=Bi,z.map.depthTexture.compareFunction=null,z.map.depthTexture.minFilter=Ut,z.map.depthTexture.magFilter=Ut}else N.isPointLight?(z.map=new Cu(n.x),z.map.depthTexture=new Hf(n.x,Ti)):(z.map=new Ei(n.x,n.y),z.map.depthTexture=new as(n.x,n.y,Ti)),z.map.depthTexture.name=N.name+".shadowMap",z.map.depthTexture.format=Bi,this.type===kr?(z.map.depthTexture.compareFunction=j?xl:_l,z.map.depthTexture.minFilter=Tt,z.map.depthTexture.magFilter=Tt):(z.map.depthTexture.compareFunction=null,z.map.depthTexture.minFilter=Ut,z.map.depthTexture.magFilter=Ut);z.camera.updateProjectionMatrix()}const se=z.map.isWebGLCubeRenderTarget?6:1;for(let ie=0;ie<se;ie++){if(z.map.isWebGLCubeRenderTarget)r.setRenderTarget(z.map,ie),r.clear();else{ie===0&&(r.setRenderTarget(z.map),r.clear());const re=z.getViewport(ie);o.set(s.x*re.x,s.y*re.y,s.x*re.z,s.y*re.w),L.viewport(o)}if(N.isPointLight){const re=z.camera,me=z.matrix,ve=N.distance||re.far;ve!==re.far&&(re.far=ve,re.updateProjectionMatrix()),Ss.setFromMatrixPosition(N.matrixWorld),re.position.copy(Ss),aa.copy(re.position),aa.add(_x[ie]),re.up.copy(xx[ie]),re.lookAt(aa),re.updateMatrixWorld(),me.makeTranslation(-Ss.x,-Ss.y,-Ss.z),vh.multiplyMatrices(re.projectionMatrix,re.matrixWorldInverse),z._frustum.setFromProjectionMatrix(vh,re.coordinateSystem,re.reversedDepth)}else z.updateMatrices(N);i=z.getFrustum(),x(A,_,z.camera,N,this.type)}z.isPointLightShadow!==!0&&this.type===ws&&E(z,_),z.needsUpdate=!1}p=this.type,m.needsUpdate=!1,r.setRenderTarget(S,R,C)};function E(T,A){const _=e.update(v);u.defines.VSM_SAMPLES!==T.blurSamples&&(u.defines.VSM_SAMPLES=T.blurSamples,f.defines.VSM_SAMPLES=T.blurSamples,u.needsUpdate=!0,f.needsUpdate=!0),T.mapPass===null&&(T.mapPass=new Ei(n.x,n.y,{format:Sn,type:ki})),u.uniforms.shadow_pass.value=T.map.depthTexture,u.uniforms.resolution.value=T.mapSize,u.uniforms.radius.value=T.radius,r.setRenderTarget(T.mapPass),r.clear(),r.renderBufferDirect(A,null,_,u,v,null),f.uniforms.shadow_pass.value=T.mapPass.texture,f.uniforms.resolution.value=T.mapSize,f.uniforms.radius.value=T.radius,r.setRenderTarget(T.map),r.clear(),r.renderBufferDirect(A,null,_,f,v,null)}function b(T,A,_,S){let R=null;const C=_.isPointLight===!0?T.customDistanceMaterial:T.customDepthMaterial;if(C!==void 0)R=C;else if(R=_.isPointLight===!0?c:a,r.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0||A.alphaToCoverage===!0){const L=R.uuid,B=A.uuid;let X=l[L];X===void 0&&(X={},l[L]=X);let U=X[B];U===void 0&&(U=R.clone(),X[B]=U,A.addEventListener("dispose",M)),R=U}if(R.visible=A.visible,R.wireframe=A.wireframe,S===ws?R.side=A.shadowSide!==null?A.shadowSide:A.side:R.side=A.shadowSide!==null?A.shadowSide:d[A.side],R.alphaMap=A.alphaMap,R.alphaTest=A.alphaToCoverage===!0?.5:A.alphaTest,R.map=A.map,R.clipShadows=A.clipShadows,R.clippingPlanes=A.clippingPlanes,R.clipIntersection=A.clipIntersection,R.displacementMap=A.displacementMap,R.displacementScale=A.displacementScale,R.displacementBias=A.displacementBias,R.wireframeLinewidth=A.wireframeLinewidth,R.linewidth=A.linewidth,_.isPointLight===!0&&R.isMeshDistanceMaterial===!0){const L=r.properties.get(R);L.light=_}return R}function x(T,A,_,S,R){if(T.visible===!1)return;if(T.layers.test(A.layers)&&(T.isMesh||T.isLine||T.isPoints)&&(T.castShadow||T.receiveShadow&&R===ws)&&(!T.frustumCulled||i.intersectsObject(T))){T.modelViewMatrix.multiplyMatrices(_.matrixWorldInverse,T.matrixWorld);const B=e.update(T),X=T.material;if(Array.isArray(X)){const U=B.groups;for(let N=0,z=U.length;N<z;N++){const $=U[N],j=X[$.materialIndex];if(j&&j.visible){const se=b(T,j,S,R);T.onBeforeShadow(r,T,A,_,B,se,$),r.renderBufferDirect(_,null,B,se,T,$),T.onAfterShadow(r,T,A,_,B,se,$)}}}else if(X.visible){const U=b(T,X,S,R);T.onBeforeShadow(r,T,A,_,B,U,null),r.renderBufferDirect(_,null,B,U,T,null),T.onAfterShadow(r,T,A,_,B,U,null)}}const L=T.children;for(let B=0,X=L.length;B<X;B++)x(L[B],A,_,S,R)}function M(T){T.target.removeEventListener("dispose",M);for(const _ in l){const S=l[_],R=T.target.uuid;R in S&&(S[R].dispose(),delete S[R])}}}function yx(r,e){function t(){let I=!1;const le=new st;let Q=null;const de=new st(0,0,0,0);return{setMask:function(xe){Q!==xe&&!I&&(r.colorMask(xe,xe,xe,xe),Q=xe)},setLocked:function(xe){I=xe},setClear:function(xe,ne,we,Se,pt){pt===!0&&(xe*=Se,ne*=Se,we*=Se),le.set(xe,ne,we,Se),de.equals(le)===!1&&(r.clearColor(xe,ne,we,Se),de.copy(le))},reset:function(){I=!1,Q=null,de.set(-1,0,0,0)}}}function i(){let I=!1,le=!1,Q=null,de=null,xe=null;return{setReversed:function(ne){if(le!==ne){const we=e.get("EXT_clip_control");ne?we.clipControlEXT(we.LOWER_LEFT_EXT,we.ZERO_TO_ONE_EXT):we.clipControlEXT(we.LOWER_LEFT_EXT,we.NEGATIVE_ONE_TO_ONE_EXT),le=ne;const Se=xe;xe=null,this.setClear(Se)}},getReversed:function(){return le},setTest:function(ne){ne?ee(r.DEPTH_TEST):ye(r.DEPTH_TEST)},setMask:function(ne){Q!==ne&&!I&&(r.depthMask(ne),Q=ne)},setFunc:function(ne){if(le&&(ne=Qd[ne]),de!==ne){switch(ne){case xa:r.depthFunc(r.NEVER);break;case va:r.depthFunc(r.ALWAYS);break;case ya:r.depthFunc(r.LESS);break;case ns:r.depthFunc(r.LEQUAL);break;case ba:r.depthFunc(r.EQUAL);break;case Ma:r.depthFunc(r.GEQUAL);break;case Sa:r.depthFunc(r.GREATER);break;case Ea:r.depthFunc(r.NOTEQUAL);break;default:r.depthFunc(r.LEQUAL)}de=ne}},setLocked:function(ne){I=ne},setClear:function(ne){xe!==ne&&(xe=ne,le&&(ne=1-ne),r.clearDepth(ne))},reset:function(){I=!1,Q=null,de=null,xe=null,le=!1}}}function n(){let I=!1,le=null,Q=null,de=null,xe=null,ne=null,we=null,Se=null,pt=null;return{setTest:function(lt){I||(lt?ee(r.STENCIL_TEST):ye(r.STENCIL_TEST))},setMask:function(lt){le!==lt&&!I&&(r.stencilMask(lt),le=lt)},setFunc:function(lt,pi,mi){(Q!==lt||de!==pi||xe!==mi)&&(r.stencilFunc(lt,pi,mi),Q=lt,de=pi,xe=mi)},setOp:function(lt,pi,mi){(ne!==lt||we!==pi||Se!==mi)&&(r.stencilOp(lt,pi,mi),ne=lt,we=pi,Se=mi)},setLocked:function(lt){I=lt},setClear:function(lt){pt!==lt&&(r.clearStencil(lt),pt=lt)},reset:function(){I=!1,le=null,Q=null,de=null,xe=null,ne=null,we=null,Se=null,pt=null}}}const s=new t,o=new i,a=new n,c=new WeakMap,l=new WeakMap;let h={},d={},u={},f=new WeakMap,g=[],v=null,m=!1,p=null,E=null,b=null,x=null,M=null,T=null,A=null,_=new Be(0,0,0),S=0,R=!1,C=null,L=null,B=null,X=null,U=null;const N=r.getParameter(r.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let z=!1,$=0;const j=r.getParameter(r.VERSION);j.indexOf("WebGL")!==-1?($=parseFloat(/^WebGL (\d)/.exec(j)[1]),z=$>=1):j.indexOf("OpenGL ES")!==-1&&($=parseFloat(/^OpenGL ES (\d)/.exec(j)[1]),z=$>=2);let se=null,ie={};const re=r.getParameter(r.SCISSOR_BOX),me=r.getParameter(r.VIEWPORT),ve=new st().fromArray(re),ae=new st().fromArray(me);function k(I,le,Q,de){const xe=new Uint8Array(4),ne=r.createTexture();r.bindTexture(I,ne),r.texParameteri(I,r.TEXTURE_MIN_FILTER,r.NEAREST),r.texParameteri(I,r.TEXTURE_MAG_FILTER,r.NEAREST);for(let we=0;we<Q;we++)I===r.TEXTURE_3D||I===r.TEXTURE_2D_ARRAY?r.texImage3D(le,0,r.RGBA,1,1,de,0,r.RGBA,r.UNSIGNED_BYTE,xe):r.texImage2D(le+we,0,r.RGBA,1,1,0,r.RGBA,r.UNSIGNED_BYTE,xe);return ne}const Z={};Z[r.TEXTURE_2D]=k(r.TEXTURE_2D,r.TEXTURE_2D,1),Z[r.TEXTURE_CUBE_MAP]=k(r.TEXTURE_CUBE_MAP,r.TEXTURE_CUBE_MAP_POSITIVE_X,6),Z[r.TEXTURE_2D_ARRAY]=k(r.TEXTURE_2D_ARRAY,r.TEXTURE_2D_ARRAY,1,1),Z[r.TEXTURE_3D]=k(r.TEXTURE_3D,r.TEXTURE_3D,1,1),s.setClear(0,0,0,1),o.setClear(1),a.setClear(0),ee(r.DEPTH_TEST),o.setFunc(ns),yt(!1),St(jl),ee(r.CULL_FACE),Je(Ui);function ee(I){h[I]!==!0&&(r.enable(I),h[I]=!0)}function ye(I){h[I]!==!1&&(r.disable(I),h[I]=!1)}function Pe(I,le){return u[I]!==le?(r.bindFramebuffer(I,le),u[I]=le,I===r.DRAW_FRAMEBUFFER&&(u[r.FRAMEBUFFER]=le),I===r.FRAMEBUFFER&&(u[r.DRAW_FRAMEBUFFER]=le),!0):!1}function Ie(I,le){let Q=g,de=!1;if(I){Q=f.get(le),Q===void 0&&(Q=[],f.set(le,Q));const xe=I.textures;if(Q.length!==xe.length||Q[0]!==r.COLOR_ATTACHMENT0){for(let ne=0,we=xe.length;ne<we;ne++)Q[ne]=r.COLOR_ATTACHMENT0+ne;Q.length=xe.length,de=!0}}else Q[0]!==r.BACK&&(Q[0]=r.BACK,de=!0);de&&r.drawBuffers(Q)}function gt(I){return v!==I?(r.useProgram(I),v=I,!0):!1}const $e={[xn]:r.FUNC_ADD,[vd]:r.FUNC_SUBTRACT,[yd]:r.FUNC_REVERSE_SUBTRACT};$e[bd]=r.MIN,$e[Md]=r.MAX;const rt={[Sd]:r.ZERO,[Ed]:r.ONE,[Td]:r.SRC_COLOR,[ga]:r.SRC_ALPHA,[Ld]:r.SRC_ALPHA_SATURATE,[Cd]:r.DST_COLOR,[Ad]:r.DST_ALPHA,[wd]:r.ONE_MINUS_SRC_COLOR,[_a]:r.ONE_MINUS_SRC_ALPHA,[Pd]:r.ONE_MINUS_DST_COLOR,[Rd]:r.ONE_MINUS_DST_ALPHA,[Nd]:r.CONSTANT_COLOR,[Dd]:r.ONE_MINUS_CONSTANT_COLOR,[Id]:r.CONSTANT_ALPHA,[Ud]:r.ONE_MINUS_CONSTANT_ALPHA};function Je(I,le,Q,de,xe,ne,we,Se,pt,lt){if(I===Ui){m===!0&&(ye(r.BLEND),m=!1);return}if(m===!1&&(ee(r.BLEND),m=!0),I!==xd){if(I!==p||lt!==R){if((E!==xn||M!==xn)&&(r.blendEquation(r.FUNC_ADD),E=xn,M=xn),lt)switch(I){case jn:r.blendFuncSeparate(r.ONE,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case Ql:r.blendFunc(r.ONE,r.ONE);break;case ec:r.blendFuncSeparate(r.ZERO,r.ONE_MINUS_SRC_COLOR,r.ZERO,r.ONE);break;case tc:r.blendFuncSeparate(r.DST_COLOR,r.ONE_MINUS_SRC_ALPHA,r.ZERO,r.ONE);break;default:We("WebGLState: Invalid blending: ",I);break}else switch(I){case jn:r.blendFuncSeparate(r.SRC_ALPHA,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case Ql:r.blendFuncSeparate(r.SRC_ALPHA,r.ONE,r.ONE,r.ONE);break;case ec:We("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case tc:We("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:We("WebGLState: Invalid blending: ",I);break}b=null,x=null,T=null,A=null,_.set(0,0,0),S=0,p=I,R=lt}return}xe=xe||le,ne=ne||Q,we=we||de,(le!==E||xe!==M)&&(r.blendEquationSeparate($e[le],$e[xe]),E=le,M=xe),(Q!==b||de!==x||ne!==T||we!==A)&&(r.blendFuncSeparate(rt[Q],rt[de],rt[ne],rt[we]),b=Q,x=de,T=ne,A=we),(Se.equals(_)===!1||pt!==S)&&(r.blendColor(Se.r,Se.g,Se.b,pt),_.copy(Se),S=pt),p=I,R=!1}function Ke(I,le){I.side===bi?ye(r.CULL_FACE):ee(r.CULL_FACE);let Q=I.side===$t;le&&(Q=!Q),yt(Q),I.blending===jn&&I.transparent===!1?Je(Ui):Je(I.blending,I.blendEquation,I.blendSrc,I.blendDst,I.blendEquationAlpha,I.blendSrcAlpha,I.blendDstAlpha,I.blendColor,I.blendAlpha,I.premultipliedAlpha),o.setFunc(I.depthFunc),o.setTest(I.depthTest),o.setMask(I.depthWrite),s.setMask(I.colorWrite);const de=I.stencilWrite;a.setTest(de),de&&(a.setMask(I.stencilWriteMask),a.setFunc(I.stencilFunc,I.stencilRef,I.stencilFuncMask),a.setOp(I.stencilFail,I.stencilZFail,I.stencilZPass)),Dt(I.polygonOffset,I.polygonOffsetFactor,I.polygonOffsetUnits),I.alphaToCoverage===!0?ee(r.SAMPLE_ALPHA_TO_COVERAGE):ye(r.SAMPLE_ALPHA_TO_COVERAGE)}function yt(I){C!==I&&(I?r.frontFace(r.CW):r.frontFace(r.CCW),C=I)}function St(I){I!==md?(ee(r.CULL_FACE),I!==L&&(I===jl?r.cullFace(r.BACK):I===gd?r.cullFace(r.FRONT):r.cullFace(r.FRONT_AND_BACK))):ye(r.CULL_FACE),L=I}function Ct(I){I!==B&&(z&&r.lineWidth(I),B=I)}function Dt(I,le,Q){I?(ee(r.POLYGON_OFFSET_FILL),(X!==le||U!==Q)&&(X=le,U=Q,o.getReversed()&&(le=-le),r.polygonOffset(le,Q))):ye(r.POLYGON_OFFSET_FILL)}function ft(I){I?ee(r.SCISSOR_TEST):ye(r.SCISSOR_TEST)}function bt(I){I===void 0&&(I=r.TEXTURE0+N-1),se!==I&&(r.activeTexture(I),se=I)}function F(I,le,Q){Q===void 0&&(se===null?Q=r.TEXTURE0+N-1:Q=se);let de=ie[Q];de===void 0&&(de={type:void 0,texture:void 0},ie[Q]=de),(de.type!==I||de.texture!==le)&&(se!==Q&&(r.activeTexture(Q),se=Q),r.bindTexture(I,le||Z[I]),de.type=I,de.texture=le)}function Xt(){const I=ie[se];I!==void 0&&I.type!==void 0&&(r.bindTexture(I.type,null),I.type=void 0,I.texture=void 0)}function et(){try{r.compressedTexImage2D(...arguments)}catch(I){We("WebGLState:",I)}}function P(){try{r.compressedTexImage3D(...arguments)}catch(I){We("WebGLState:",I)}}function y(){try{r.texSubImage2D(...arguments)}catch(I){We("WebGLState:",I)}}function H(){try{r.texSubImage3D(...arguments)}catch(I){We("WebGLState:",I)}}function W(){try{r.compressedTexSubImage2D(...arguments)}catch(I){We("WebGLState:",I)}}function K(){try{r.compressedTexSubImage3D(...arguments)}catch(I){We("WebGLState:",I)}}function oe(){try{r.texStorage2D(...arguments)}catch(I){We("WebGLState:",I)}}function ce(){try{r.texStorage3D(...arguments)}catch(I){We("WebGLState:",I)}}function J(){try{r.texImage2D(...arguments)}catch(I){We("WebGLState:",I)}}function te(){try{r.texImage3D(...arguments)}catch(I){We("WebGLState:",I)}}function he(I){return d[I]!==void 0?d[I]:r.getParameter(I)}function Ae(I,le){d[I]!==le&&(r.pixelStorei(I,le),d[I]=le)}function fe(I){ve.equals(I)===!1&&(r.scissor(I.x,I.y,I.z,I.w),ve.copy(I))}function ue(I){ae.equals(I)===!1&&(r.viewport(I.x,I.y,I.z,I.w),ae.copy(I))}function De(I,le){let Q=l.get(le);Q===void 0&&(Q=new WeakMap,l.set(le,Q));let de=Q.get(I);de===void 0&&(de=r.getUniformBlockIndex(le,I.name),Q.set(I,de))}function Fe(I,le){const de=l.get(le).get(I);c.get(le)!==de&&(r.uniformBlockBinding(le,de,I.__bindingPointIndex),c.set(le,de))}function ze(){r.disable(r.BLEND),r.disable(r.CULL_FACE),r.disable(r.DEPTH_TEST),r.disable(r.POLYGON_OFFSET_FILL),r.disable(r.SCISSOR_TEST),r.disable(r.STENCIL_TEST),r.disable(r.SAMPLE_ALPHA_TO_COVERAGE),r.blendEquation(r.FUNC_ADD),r.blendFunc(r.ONE,r.ZERO),r.blendFuncSeparate(r.ONE,r.ZERO,r.ONE,r.ZERO),r.blendColor(0,0,0,0),r.colorMask(!0,!0,!0,!0),r.clearColor(0,0,0,0),r.depthMask(!0),r.depthFunc(r.LESS),o.setReversed(!1),r.clearDepth(1),r.stencilMask(4294967295),r.stencilFunc(r.ALWAYS,0,4294967295),r.stencilOp(r.KEEP,r.KEEP,r.KEEP),r.clearStencil(0),r.cullFace(r.BACK),r.frontFace(r.CCW),r.polygonOffset(0,0),r.activeTexture(r.TEXTURE0),r.bindFramebuffer(r.FRAMEBUFFER,null),r.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),r.bindFramebuffer(r.READ_FRAMEBUFFER,null),r.useProgram(null),r.lineWidth(1),r.scissor(0,0,r.canvas.width,r.canvas.height),r.viewport(0,0,r.canvas.width,r.canvas.height),r.pixelStorei(r.PACK_ALIGNMENT,4),r.pixelStorei(r.UNPACK_ALIGNMENT,4),r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,!1),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,r.BROWSER_DEFAULT_WEBGL),r.pixelStorei(r.PACK_ROW_LENGTH,0),r.pixelStorei(r.PACK_SKIP_PIXELS,0),r.pixelStorei(r.PACK_SKIP_ROWS,0),r.pixelStorei(r.UNPACK_ROW_LENGTH,0),r.pixelStorei(r.UNPACK_IMAGE_HEIGHT,0),r.pixelStorei(r.UNPACK_SKIP_PIXELS,0),r.pixelStorei(r.UNPACK_SKIP_ROWS,0),r.pixelStorei(r.UNPACK_SKIP_IMAGES,0),h={},d={},se=null,ie={},u={},f=new WeakMap,g=[],v=null,m=!1,p=null,E=null,b=null,x=null,M=null,T=null,A=null,_=new Be(0,0,0),S=0,R=!1,C=null,L=null,B=null,X=null,U=null,ve.set(0,0,r.canvas.width,r.canvas.height),ae.set(0,0,r.canvas.width,r.canvas.height),s.reset(),o.reset(),a.reset()}return{buffers:{color:s,depth:o,stencil:a},enable:ee,disable:ye,bindFramebuffer:Pe,drawBuffers:Ie,useProgram:gt,setBlending:Je,setMaterial:Ke,setFlipSided:yt,setCullFace:St,setLineWidth:Ct,setPolygonOffset:Dt,setScissorTest:ft,activeTexture:bt,bindTexture:F,unbindTexture:Xt,compressedTexImage2D:et,compressedTexImage3D:P,texImage2D:J,texImage3D:te,pixelStorei:Ae,getParameter:he,updateUBOMapping:De,uniformBlockBinding:Fe,texStorage2D:oe,texStorage3D:ce,texSubImage2D:y,texSubImage3D:H,compressedTexSubImage2D:W,compressedTexSubImage3D:K,scissor:fe,viewport:ue,reset:ze}}function bx(r,e,t,i,n,s,o){const a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new Ue,h=new WeakMap,d=new Set;let u;const f=new WeakMap;let g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function v(P,y){return g?new OffscreenCanvas(P,y):Gs("canvas")}function m(P,y,H){let W=1;const K=et(P);if((K.width>H||K.height>H)&&(W=H/Math.max(K.width,K.height)),W<1)if(typeof HTMLImageElement<"u"&&P instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&P instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&P instanceof ImageBitmap||typeof VideoFrame<"u"&&P instanceof VideoFrame){const oe=Math.floor(W*K.width),ce=Math.floor(W*K.height);u===void 0&&(u=v(oe,ce));const J=y?v(oe,ce):u;return J.width=oe,J.height=ce,J.getContext("2d").drawImage(P,0,0,oe,ce),Ne("WebGLRenderer: Texture has been resized from ("+K.width+"x"+K.height+") to ("+oe+"x"+ce+")."),J}else return"data"in P&&Ne("WebGLRenderer: Image in DataTexture is too big ("+K.width+"x"+K.height+")."),P;return P}function p(P){return P.generateMipmaps}function E(P){r.generateMipmap(P)}function b(P){return P.isWebGLCubeRenderTarget?r.TEXTURE_CUBE_MAP:P.isWebGL3DRenderTarget?r.TEXTURE_3D:P.isWebGLArrayRenderTarget||P.isCompressedArrayTexture?r.TEXTURE_2D_ARRAY:r.TEXTURE_2D}function x(P,y,H,W,K,oe=!1){if(P!==null){if(r[P]!==void 0)return r[P];Ne("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+P+"'")}let ce;W&&(ce=e.get("EXT_texture_norm16"),ce||Ne("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let J=y;if(y===r.RED&&(H===r.FLOAT&&(J=r.R32F),H===r.HALF_FLOAT&&(J=r.R16F),H===r.UNSIGNED_BYTE&&(J=r.R8),H===r.UNSIGNED_SHORT&&ce&&(J=ce.R16_EXT),H===r.SHORT&&ce&&(J=ce.R16_SNORM_EXT)),y===r.RED_INTEGER&&(H===r.UNSIGNED_BYTE&&(J=r.R8UI),H===r.UNSIGNED_SHORT&&(J=r.R16UI),H===r.UNSIGNED_INT&&(J=r.R32UI),H===r.BYTE&&(J=r.R8I),H===r.SHORT&&(J=r.R16I),H===r.INT&&(J=r.R32I)),y===r.RG&&(H===r.FLOAT&&(J=r.RG32F),H===r.HALF_FLOAT&&(J=r.RG16F),H===r.UNSIGNED_BYTE&&(J=r.RG8),H===r.UNSIGNED_SHORT&&ce&&(J=ce.RG16_EXT),H===r.SHORT&&ce&&(J=ce.RG16_SNORM_EXT)),y===r.RG_INTEGER&&(H===r.UNSIGNED_BYTE&&(J=r.RG8UI),H===r.UNSIGNED_SHORT&&(J=r.RG16UI),H===r.UNSIGNED_INT&&(J=r.RG32UI),H===r.BYTE&&(J=r.RG8I),H===r.SHORT&&(J=r.RG16I),H===r.INT&&(J=r.RG32I)),y===r.RGB_INTEGER&&(H===r.UNSIGNED_BYTE&&(J=r.RGB8UI),H===r.UNSIGNED_SHORT&&(J=r.RGB16UI),H===r.UNSIGNED_INT&&(J=r.RGB32UI),H===r.BYTE&&(J=r.RGB8I),H===r.SHORT&&(J=r.RGB16I),H===r.INT&&(J=r.RGB32I)),y===r.RGBA_INTEGER&&(H===r.UNSIGNED_BYTE&&(J=r.RGBA8UI),H===r.UNSIGNED_SHORT&&(J=r.RGBA16UI),H===r.UNSIGNED_INT&&(J=r.RGBA32UI),H===r.BYTE&&(J=r.RGBA8I),H===r.SHORT&&(J=r.RGBA16I),H===r.INT&&(J=r.RGBA32I)),y===r.RGB&&(H===r.UNSIGNED_SHORT&&ce&&(J=ce.RGB16_EXT),H===r.SHORT&&ce&&(J=ce.RGB16_SNORM_EXT),H===r.UNSIGNED_INT_5_9_9_9_REV&&(J=r.RGB9_E5),H===r.UNSIGNED_INT_10F_11F_11F_REV&&(J=r.R11F_G11F_B10F)),y===r.RGBA){const te=oe?Yr:Xe.getTransfer(K);H===r.FLOAT&&(J=r.RGBA32F),H===r.HALF_FLOAT&&(J=r.RGBA16F),H===r.UNSIGNED_BYTE&&(J=te===tt?r.SRGB8_ALPHA8:r.RGBA8),H===r.UNSIGNED_SHORT&&ce&&(J=ce.RGBA16_EXT),H===r.SHORT&&ce&&(J=ce.RGBA16_SNORM_EXT),H===r.UNSIGNED_SHORT_4_4_4_4&&(J=r.RGBA4),H===r.UNSIGNED_SHORT_5_5_5_1&&(J=r.RGB5_A1)}return(J===r.R16F||J===r.R32F||J===r.RG16F||J===r.RG32F||J===r.RGBA16F||J===r.RGBA32F)&&e.get("EXT_color_buffer_float"),J}function M(P,y){let H;return P?y===null||y===Ti||y===Bs?H=r.DEPTH24_STENCIL8:y===hi?H=r.DEPTH32F_STENCIL8:y===ks&&(H=r.DEPTH24_STENCIL8,Ne("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):y===null||y===Ti||y===Bs?H=r.DEPTH_COMPONENT24:y===hi?H=r.DEPTH_COMPONENT32F:y===ks&&(H=r.DEPTH_COMPONENT16),H}function T(P,y){return p(P)===!0||P.isFramebufferTexture&&P.minFilter!==Ut&&P.minFilter!==Tt?Math.log2(Math.max(y.width,y.height))+1:P.mipmaps!==void 0&&P.mipmaps.length>0?P.mipmaps.length:P.isCompressedTexture&&Array.isArray(P.image)?y.mipmaps.length:1}function A(P){const y=P.target;y.removeEventListener("dispose",A),S(y),y.isVideoTexture&&h.delete(y),y.isHTMLTexture&&d.delete(y)}function _(P){const y=P.target;y.removeEventListener("dispose",_),C(y)}function S(P){const y=i.get(P);if(y.__webglInit===void 0)return;const H=P.source,W=f.get(H);if(W){const K=W[y.__cacheKey];K.usedTimes--,K.usedTimes===0&&R(P),Object.keys(W).length===0&&f.delete(H)}i.remove(P)}function R(P){const y=i.get(P);r.deleteTexture(y.__webglTexture);const H=P.source,W=f.get(H);delete W[y.__cacheKey],o.memory.textures--}function C(P){const y=i.get(P);if(P.depthTexture&&(P.depthTexture.dispose(),i.remove(P.depthTexture)),P.isWebGLCubeRenderTarget)for(let W=0;W<6;W++){if(Array.isArray(y.__webglFramebuffer[W]))for(let K=0;K<y.__webglFramebuffer[W].length;K++)r.deleteFramebuffer(y.__webglFramebuffer[W][K]);else r.deleteFramebuffer(y.__webglFramebuffer[W]);y.__webglDepthbuffer&&r.deleteRenderbuffer(y.__webglDepthbuffer[W])}else{if(Array.isArray(y.__webglFramebuffer))for(let W=0;W<y.__webglFramebuffer.length;W++)r.deleteFramebuffer(y.__webglFramebuffer[W]);else r.deleteFramebuffer(y.__webglFramebuffer);if(y.__webglDepthbuffer&&r.deleteRenderbuffer(y.__webglDepthbuffer),y.__webglMultisampledFramebuffer&&r.deleteFramebuffer(y.__webglMultisampledFramebuffer),y.__webglColorRenderbuffer)for(let W=0;W<y.__webglColorRenderbuffer.length;W++)y.__webglColorRenderbuffer[W]&&r.deleteRenderbuffer(y.__webglColorRenderbuffer[W]);y.__webglDepthRenderbuffer&&r.deleteRenderbuffer(y.__webglDepthRenderbuffer)}const H=P.textures;for(let W=0,K=H.length;W<K;W++){const oe=i.get(H[W]);oe.__webglTexture&&(r.deleteTexture(oe.__webglTexture),o.memory.textures--),i.remove(H[W])}i.remove(P)}let L=0;function B(){L=0}function X(){return L}function U(P){L=P}function N(){const P=L;return P>=n.maxTextures&&Ne("WebGLTextures: Trying to use "+P+" texture units while this GPU supports only "+n.maxTextures),L+=1,P}function z(P){const y=[];return y.push(P.wrapS),y.push(P.wrapT),y.push(P.wrapR||0),y.push(P.magFilter),y.push(P.minFilter),y.push(P.anisotropy),y.push(P.internalFormat),y.push(P.format),y.push(P.type),y.push(P.generateMipmaps),y.push(P.premultiplyAlpha),y.push(P.flipY),y.push(P.unpackAlignment),y.push(P.colorSpace),y.join()}function $(P,y){const H=i.get(P);if(P.isVideoTexture&&F(P),P.isRenderTargetTexture===!1&&P.isExternalTexture!==!0&&P.version>0&&H.__version!==P.version){const W=P.image;if(W===null)Ne("WebGLRenderer: Texture marked for update but no image data found.");else if(W.complete===!1)Ne("WebGLRenderer: Texture marked for update but image is incomplete");else{ye(H,P,y);return}}else P.isExternalTexture&&(H.__webglTexture=P.sourceTexture?P.sourceTexture:null);t.bindTexture(r.TEXTURE_2D,H.__webglTexture,r.TEXTURE0+y)}function j(P,y){const H=i.get(P);if(P.isRenderTargetTexture===!1&&P.version>0&&H.__version!==P.version){ye(H,P,y);return}else P.isExternalTexture&&(H.__webglTexture=P.sourceTexture?P.sourceTexture:null);t.bindTexture(r.TEXTURE_2D_ARRAY,H.__webglTexture,r.TEXTURE0+y)}function se(P,y){const H=i.get(P);if(P.isRenderTargetTexture===!1&&P.version>0&&H.__version!==P.version){ye(H,P,y);return}t.bindTexture(r.TEXTURE_3D,H.__webglTexture,r.TEXTURE0+y)}function ie(P,y){const H=i.get(P);if(P.isCubeDepthTexture!==!0&&P.version>0&&H.__version!==P.version){Pe(H,P,y);return}t.bindTexture(r.TEXTURE_CUBE_MAP,H.__webglTexture,r.TEXTURE0+y)}const re={[yn]:r.REPEAT,[ei]:r.CLAMP_TO_EDGE,[Ta]:r.MIRRORED_REPEAT},me={[Ut]:r.NEAREST,[Bd]:r.NEAREST_MIPMAP_NEAREST,[js]:r.NEAREST_MIPMAP_LINEAR,[Tt]:r.LINEAR,[Ao]:r.LINEAR_MIPMAP_NEAREST,[Ii]:r.LINEAR_MIPMAP_LINEAR},ve={[Vd]:r.NEVER,[Yd]:r.ALWAYS,[Wd]:r.LESS,[_l]:r.LEQUAL,[Xd]:r.EQUAL,[xl]:r.GEQUAL,[qd]:r.GREATER,[$d]:r.NOTEQUAL};function ae(P,y){if(y.type===hi&&e.has("OES_texture_float_linear")===!1&&(y.magFilter===Tt||y.magFilter===Ao||y.magFilter===js||y.magFilter===Ii||y.minFilter===Tt||y.minFilter===Ao||y.minFilter===js||y.minFilter===Ii)&&Ne("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),r.texParameteri(P,r.TEXTURE_WRAP_S,re[y.wrapS]),r.texParameteri(P,r.TEXTURE_WRAP_T,re[y.wrapT]),(P===r.TEXTURE_3D||P===r.TEXTURE_2D_ARRAY)&&r.texParameteri(P,r.TEXTURE_WRAP_R,re[y.wrapR]),r.texParameteri(P,r.TEXTURE_MAG_FILTER,me[y.magFilter]),r.texParameteri(P,r.TEXTURE_MIN_FILTER,me[y.minFilter]),y.compareFunction&&(r.texParameteri(P,r.TEXTURE_COMPARE_MODE,r.COMPARE_REF_TO_TEXTURE),r.texParameteri(P,r.TEXTURE_COMPARE_FUNC,ve[y.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(y.magFilter===Ut||y.minFilter!==js&&y.minFilter!==Ii||y.type===hi&&e.has("OES_texture_float_linear")===!1)return;if(y.anisotropy>1||i.get(y).__currentAnisotropy){const H=e.get("EXT_texture_filter_anisotropic");r.texParameterf(P,H.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(y.anisotropy,n.getMaxAnisotropy())),i.get(y).__currentAnisotropy=y.anisotropy}}}function k(P,y){let H=!1;P.__webglInit===void 0&&(P.__webglInit=!0,y.addEventListener("dispose",A));const W=y.source;let K=f.get(W);K===void 0&&(K={},f.set(W,K));const oe=z(y);if(oe!==P.__cacheKey){K[oe]===void 0&&(K[oe]={texture:r.createTexture(),usedTimes:0},o.memory.textures++,H=!0),K[oe].usedTimes++;const ce=K[P.__cacheKey];ce!==void 0&&(K[P.__cacheKey].usedTimes--,ce.usedTimes===0&&R(y)),P.__cacheKey=oe,P.__webglTexture=K[oe].texture}return H}function Z(P,y,H){return Math.floor(Math.floor(P/H)/y)}function ee(P,y,H,W){const oe=P.updateRanges;if(oe.length===0)t.texSubImage2D(r.TEXTURE_2D,0,0,0,y.width,y.height,H,W,y.data);else{oe.sort((Ae,fe)=>Ae.start-fe.start);let ce=0;for(let Ae=1;Ae<oe.length;Ae++){const fe=oe[ce],ue=oe[Ae],De=fe.start+fe.count,Fe=Z(ue.start,y.width,4),ze=Z(fe.start,y.width,4);ue.start<=De+1&&Fe===ze&&Z(ue.start+ue.count-1,y.width,4)===Fe?fe.count=Math.max(fe.count,ue.start+ue.count-fe.start):(++ce,oe[ce]=ue)}oe.length=ce+1;const J=t.getParameter(r.UNPACK_ROW_LENGTH),te=t.getParameter(r.UNPACK_SKIP_PIXELS),he=t.getParameter(r.UNPACK_SKIP_ROWS);t.pixelStorei(r.UNPACK_ROW_LENGTH,y.width);for(let Ae=0,fe=oe.length;Ae<fe;Ae++){const ue=oe[Ae],De=Math.floor(ue.start/4),Fe=Math.ceil(ue.count/4),ze=De%y.width,I=Math.floor(De/y.width),le=Fe,Q=1;t.pixelStorei(r.UNPACK_SKIP_PIXELS,ze),t.pixelStorei(r.UNPACK_SKIP_ROWS,I),t.texSubImage2D(r.TEXTURE_2D,0,ze,I,le,Q,H,W,y.data)}P.clearUpdateRanges(),t.pixelStorei(r.UNPACK_ROW_LENGTH,J),t.pixelStorei(r.UNPACK_SKIP_PIXELS,te),t.pixelStorei(r.UNPACK_SKIP_ROWS,he)}}function ye(P,y,H){let W=r.TEXTURE_2D;(y.isDataArrayTexture||y.isCompressedArrayTexture)&&(W=r.TEXTURE_2D_ARRAY),y.isData3DTexture&&(W=r.TEXTURE_3D);const K=k(P,y),oe=y.source;t.bindTexture(W,P.__webglTexture,r.TEXTURE0+H);const ce=i.get(oe);if(oe.version!==ce.__version||K===!0){if(t.activeTexture(r.TEXTURE0+H),(typeof ImageBitmap<"u"&&y.image instanceof ImageBitmap)===!1){const Q=Xe.getPrimaries(Xe.workingColorSpace),de=y.colorSpace===Qi?null:Xe.getPrimaries(y.colorSpace),xe=y.colorSpace===Qi||Q===de?r.NONE:r.BROWSER_DEFAULT_WEBGL;t.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,y.flipY),t.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),t.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,xe)}t.pixelStorei(r.UNPACK_ALIGNMENT,y.unpackAlignment);let te=m(y.image,!1,n.maxTextureSize);te=Xt(y,te);const he=s.convert(y.format,y.colorSpace),Ae=s.convert(y.type);let fe=x(y.internalFormat,he,Ae,y.normalized,y.colorSpace,y.isVideoTexture);ae(W,y);let ue;const De=y.mipmaps,Fe=y.isVideoTexture!==!0,ze=ce.__version===void 0||K===!0,I=oe.dataReady,le=T(y,te);if(y.isDepthTexture)fe=M(y.format===bn,y.type),ze&&(Fe?t.texStorage2D(r.TEXTURE_2D,1,fe,te.width,te.height):t.texImage2D(r.TEXTURE_2D,0,fe,te.width,te.height,0,he,Ae,null));else if(y.isDataTexture)if(De.length>0){Fe&&ze&&t.texStorage2D(r.TEXTURE_2D,le,fe,De[0].width,De[0].height);for(let Q=0,de=De.length;Q<de;Q++)ue=De[Q],Fe?I&&t.texSubImage2D(r.TEXTURE_2D,Q,0,0,ue.width,ue.height,he,Ae,ue.data):t.texImage2D(r.TEXTURE_2D,Q,fe,ue.width,ue.height,0,he,Ae,ue.data);y.generateMipmaps=!1}else Fe?(ze&&t.texStorage2D(r.TEXTURE_2D,le,fe,te.width,te.height),I&&ee(y,te,he,Ae)):t.texImage2D(r.TEXTURE_2D,0,fe,te.width,te.height,0,he,Ae,te.data);else if(y.isCompressedTexture)if(y.isCompressedArrayTexture){Fe&&ze&&t.texStorage3D(r.TEXTURE_2D_ARRAY,le,fe,De[0].width,De[0].height,te.depth);for(let Q=0,de=De.length;Q<de;Q++)if(ue=De[Q],y.format!==oi)if(he!==null)if(Fe){if(I)if(y.layerUpdates.size>0){const xe=Zc(ue.width,ue.height,y.format,y.type);for(const ne of y.layerUpdates){const we=ue.data.subarray(ne*xe/ue.data.BYTES_PER_ELEMENT,(ne+1)*xe/ue.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,Q,0,0,ne,ue.width,ue.height,1,he,we)}y.clearLayerUpdates()}else t.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,Q,0,0,0,ue.width,ue.height,te.depth,he,ue.data)}else t.compressedTexImage3D(r.TEXTURE_2D_ARRAY,Q,fe,ue.width,ue.height,te.depth,0,ue.data,0,0);else Ne("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Fe?I&&t.texSubImage3D(r.TEXTURE_2D_ARRAY,Q,0,0,0,ue.width,ue.height,te.depth,he,Ae,ue.data):t.texImage3D(r.TEXTURE_2D_ARRAY,Q,fe,ue.width,ue.height,te.depth,0,he,Ae,ue.data)}else{Fe&&ze&&t.texStorage2D(r.TEXTURE_2D,le,fe,De[0].width,De[0].height);for(let Q=0,de=De.length;Q<de;Q++)ue=De[Q],y.format!==oi?he!==null?Fe?I&&t.compressedTexSubImage2D(r.TEXTURE_2D,Q,0,0,ue.width,ue.height,he,ue.data):t.compressedTexImage2D(r.TEXTURE_2D,Q,fe,ue.width,ue.height,0,ue.data):Ne("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Fe?I&&t.texSubImage2D(r.TEXTURE_2D,Q,0,0,ue.width,ue.height,he,Ae,ue.data):t.texImage2D(r.TEXTURE_2D,Q,fe,ue.width,ue.height,0,he,Ae,ue.data)}else if(y.isDataArrayTexture)if(Fe){if(ze&&t.texStorage3D(r.TEXTURE_2D_ARRAY,le,fe,te.width,te.height,te.depth),I)if(y.layerUpdates.size>0){const Q=Zc(te.width,te.height,y.format,y.type);for(const de of y.layerUpdates){const xe=te.data.subarray(de*Q/te.data.BYTES_PER_ELEMENT,(de+1)*Q/te.data.BYTES_PER_ELEMENT);t.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,de,te.width,te.height,1,he,Ae,xe)}y.clearLayerUpdates()}else t.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,0,te.width,te.height,te.depth,he,Ae,te.data)}else t.texImage3D(r.TEXTURE_2D_ARRAY,0,fe,te.width,te.height,te.depth,0,he,Ae,te.data);else if(y.isData3DTexture)Fe?(ze&&t.texStorage3D(r.TEXTURE_3D,le,fe,te.width,te.height,te.depth),I&&t.texSubImage3D(r.TEXTURE_3D,0,0,0,0,te.width,te.height,te.depth,he,Ae,te.data)):t.texImage3D(r.TEXTURE_3D,0,fe,te.width,te.height,te.depth,0,he,Ae,te.data);else if(y.isFramebufferTexture){if(ze)if(Fe)t.texStorage2D(r.TEXTURE_2D,le,fe,te.width,te.height);else{let Q=te.width,de=te.height;for(let xe=0;xe<le;xe++)t.texImage2D(r.TEXTURE_2D,xe,fe,Q,de,0,he,Ae,null),Q>>=1,de>>=1}}else if(y.isHTMLTexture){if("texElementImage2D"in r){const Q=r.canvas;if(Q.hasAttribute("layoutsubtree")||Q.setAttribute("layoutsubtree","true"),te.parentNode!==Q){Q.appendChild(te),d.add(y),Q.onpaint=de=>{const xe=de.changedElements;for(const ne of d)xe.includes(ne.image)&&(ne.needsUpdate=!0)},Q.requestPaint();return}if(r.texElementImage2D.length===3)r.texElementImage2D(r.TEXTURE_2D,r.RGBA8,te);else{const xe=r.RGBA,ne=r.RGBA,we=r.UNSIGNED_BYTE;r.texElementImage2D(r.TEXTURE_2D,0,xe,ne,we,te)}r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MIN_FILTER,r.LINEAR),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_S,r.CLAMP_TO_EDGE),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_T,r.CLAMP_TO_EDGE)}}else if(De.length>0){if(Fe&&ze){const Q=et(De[0]);t.texStorage2D(r.TEXTURE_2D,le,fe,Q.width,Q.height)}for(let Q=0,de=De.length;Q<de;Q++)ue=De[Q],Fe?I&&t.texSubImage2D(r.TEXTURE_2D,Q,0,0,he,Ae,ue):t.texImage2D(r.TEXTURE_2D,Q,fe,he,Ae,ue);y.generateMipmaps=!1}else if(Fe){if(ze){const Q=et(te);t.texStorage2D(r.TEXTURE_2D,le,fe,Q.width,Q.height)}I&&t.texSubImage2D(r.TEXTURE_2D,0,0,0,he,Ae,te)}else t.texImage2D(r.TEXTURE_2D,0,fe,he,Ae,te);p(y)&&E(W),ce.__version=oe.version,y.onUpdate&&y.onUpdate(y)}P.__version=y.version}function Pe(P,y,H){if(y.image.length!==6)return;const W=k(P,y),K=y.source;t.bindTexture(r.TEXTURE_CUBE_MAP,P.__webglTexture,r.TEXTURE0+H);const oe=i.get(K);if(K.version!==oe.__version||W===!0){t.activeTexture(r.TEXTURE0+H);const ce=Xe.getPrimaries(Xe.workingColorSpace),J=y.colorSpace===Qi?null:Xe.getPrimaries(y.colorSpace),te=y.colorSpace===Qi||ce===J?r.NONE:r.BROWSER_DEFAULT_WEBGL;t.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,y.flipY),t.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),t.pixelStorei(r.UNPACK_ALIGNMENT,y.unpackAlignment),t.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,te);const he=y.isCompressedTexture||y.image[0].isCompressedTexture,Ae=y.image[0]&&y.image[0].isDataTexture,fe=[];for(let ne=0;ne<6;ne++)!he&&!Ae?fe[ne]=m(y.image[ne],!0,n.maxCubemapSize):fe[ne]=Ae?y.image[ne].image:y.image[ne],fe[ne]=Xt(y,fe[ne]);const ue=fe[0],De=s.convert(y.format,y.colorSpace),Fe=s.convert(y.type),ze=x(y.internalFormat,De,Fe,y.normalized,y.colorSpace),I=y.isVideoTexture!==!0,le=oe.__version===void 0||W===!0,Q=K.dataReady;let de=T(y,ue);ae(r.TEXTURE_CUBE_MAP,y);let xe;if(he){I&&le&&t.texStorage2D(r.TEXTURE_CUBE_MAP,de,ze,ue.width,ue.height);for(let ne=0;ne<6;ne++){xe=fe[ne].mipmaps;for(let we=0;we<xe.length;we++){const Se=xe[we];y.format!==oi?De!==null?I?Q&&t.compressedTexSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ne,we,0,0,Se.width,Se.height,De,Se.data):t.compressedTexImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ne,we,ze,Se.width,Se.height,0,Se.data):Ne("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):I?Q&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ne,we,0,0,Se.width,Se.height,De,Fe,Se.data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ne,we,ze,Se.width,Se.height,0,De,Fe,Se.data)}}}else{if(xe=y.mipmaps,I&&le){xe.length>0&&de++;const ne=et(fe[0]);t.texStorage2D(r.TEXTURE_CUBE_MAP,de,ze,ne.width,ne.height)}for(let ne=0;ne<6;ne++)if(Ae){I?Q&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,0,0,fe[ne].width,fe[ne].height,De,Fe,fe[ne].data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,ze,fe[ne].width,fe[ne].height,0,De,Fe,fe[ne].data);for(let we=0;we<xe.length;we++){const pt=xe[we].image[ne].image;I?Q&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ne,we+1,0,0,pt.width,pt.height,De,Fe,pt.data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ne,we+1,ze,pt.width,pt.height,0,De,Fe,pt.data)}}else{I?Q&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,0,0,De,Fe,fe[ne]):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,ze,De,Fe,fe[ne]);for(let we=0;we<xe.length;we++){const Se=xe[we];I?Q&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ne,we+1,0,0,De,Fe,Se.image[ne]):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ne,we+1,ze,De,Fe,Se.image[ne])}}}p(y)&&E(r.TEXTURE_CUBE_MAP),oe.__version=K.version,y.onUpdate&&y.onUpdate(y)}P.__version=y.version}function Ie(P,y,H,W,K,oe){const ce=s.convert(H.format,H.colorSpace),J=s.convert(H.type),te=x(H.internalFormat,ce,J,H.normalized,H.colorSpace),he=i.get(y),Ae=i.get(H);if(Ae.__renderTarget=y,!he.__hasExternalTextures){const fe=Math.max(1,y.width>>oe),ue=Math.max(1,y.height>>oe);K===r.TEXTURE_3D||K===r.TEXTURE_2D_ARRAY?t.texImage3D(K,oe,te,fe,ue,y.depth,0,ce,J,null):t.texImage2D(K,oe,te,fe,ue,0,ce,J,null)}t.bindFramebuffer(r.FRAMEBUFFER,P),bt(y)?a.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,W,K,Ae.__webglTexture,0,ft(y)):(K===r.TEXTURE_2D||K>=r.TEXTURE_CUBE_MAP_POSITIVE_X&&K<=r.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&r.framebufferTexture2D(r.FRAMEBUFFER,W,K,Ae.__webglTexture,oe),t.bindFramebuffer(r.FRAMEBUFFER,null)}function gt(P,y,H){if(r.bindRenderbuffer(r.RENDERBUFFER,P),y.depthBuffer){const W=y.depthTexture,K=W&&W.isDepthTexture?W.type:null,oe=M(y.stencilBuffer,K),ce=y.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT;bt(y)?a.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,ft(y),oe,y.width,y.height):H?r.renderbufferStorageMultisample(r.RENDERBUFFER,ft(y),oe,y.width,y.height):r.renderbufferStorage(r.RENDERBUFFER,oe,y.width,y.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,ce,r.RENDERBUFFER,P)}else{const W=y.textures;for(let K=0;K<W.length;K++){const oe=W[K],ce=s.convert(oe.format,oe.colorSpace),J=s.convert(oe.type),te=x(oe.internalFormat,ce,J,oe.normalized,oe.colorSpace);bt(y)?a.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,ft(y),te,y.width,y.height):H?r.renderbufferStorageMultisample(r.RENDERBUFFER,ft(y),te,y.width,y.height):r.renderbufferStorage(r.RENDERBUFFER,te,y.width,y.height)}}r.bindRenderbuffer(r.RENDERBUFFER,null)}function $e(P,y,H){const W=y.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(r.FRAMEBUFFER,P),!(y.depthTexture&&y.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");const K=i.get(y.depthTexture);if(K.__renderTarget=y,(!K.__webglTexture||y.depthTexture.image.width!==y.width||y.depthTexture.image.height!==y.height)&&(y.depthTexture.image.width=y.width,y.depthTexture.image.height=y.height,y.depthTexture.needsUpdate=!0),W){if(K.__webglInit===void 0&&(K.__webglInit=!0,y.depthTexture.addEventListener("dispose",A)),K.__webglTexture===void 0){K.__webglTexture=r.createTexture(),t.bindTexture(r.TEXTURE_CUBE_MAP,K.__webglTexture),ae(r.TEXTURE_CUBE_MAP,y.depthTexture);const he=s.convert(y.depthTexture.format),Ae=s.convert(y.depthTexture.type);let fe;y.depthTexture.format===Bi?fe=r.DEPTH_COMPONENT24:y.depthTexture.format===bn&&(fe=r.DEPTH24_STENCIL8);for(let ue=0;ue<6;ue++)r.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ue,0,fe,y.width,y.height,0,he,Ae,null)}}else $(y.depthTexture,0);const oe=K.__webglTexture,ce=ft(y),J=W?r.TEXTURE_CUBE_MAP_POSITIVE_X+H:r.TEXTURE_2D,te=y.depthTexture.format===bn?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT;if(y.depthTexture.format===Bi)bt(y)?a.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,te,J,oe,0,ce):r.framebufferTexture2D(r.FRAMEBUFFER,te,J,oe,0);else if(y.depthTexture.format===bn)bt(y)?a.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,te,J,oe,0,ce):r.framebufferTexture2D(r.FRAMEBUFFER,te,J,oe,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function rt(P){const y=i.get(P),H=P.isWebGLCubeRenderTarget===!0;if(y.__boundDepthTexture!==P.depthTexture){const W=P.depthTexture;if(y.__depthDisposeCallback&&y.__depthDisposeCallback(),W){const K=()=>{delete y.__boundDepthTexture,delete y.__depthDisposeCallback,W.removeEventListener("dispose",K)};W.addEventListener("dispose",K),y.__depthDisposeCallback=K}y.__boundDepthTexture=W}if(P.depthTexture&&!y.__autoAllocateDepthBuffer)if(H)for(let W=0;W<6;W++)$e(y.__webglFramebuffer[W],P,W);else{const W=P.texture.mipmaps;W&&W.length>0?$e(y.__webglFramebuffer[0],P,0):$e(y.__webglFramebuffer,P,0)}else if(H){y.__webglDepthbuffer=[];for(let W=0;W<6;W++)if(t.bindFramebuffer(r.FRAMEBUFFER,y.__webglFramebuffer[W]),y.__webglDepthbuffer[W]===void 0)y.__webglDepthbuffer[W]=r.createRenderbuffer(),gt(y.__webglDepthbuffer[W],P,!1);else{const K=P.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,oe=y.__webglDepthbuffer[W];r.bindRenderbuffer(r.RENDERBUFFER,oe),r.framebufferRenderbuffer(r.FRAMEBUFFER,K,r.RENDERBUFFER,oe)}}else{const W=P.texture.mipmaps;if(W&&W.length>0?t.bindFramebuffer(r.FRAMEBUFFER,y.__webglFramebuffer[0]):t.bindFramebuffer(r.FRAMEBUFFER,y.__webglFramebuffer),y.__webglDepthbuffer===void 0)y.__webglDepthbuffer=r.createRenderbuffer(),gt(y.__webglDepthbuffer,P,!1);else{const K=P.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,oe=y.__webglDepthbuffer;r.bindRenderbuffer(r.RENDERBUFFER,oe),r.framebufferRenderbuffer(r.FRAMEBUFFER,K,r.RENDERBUFFER,oe)}}t.bindFramebuffer(r.FRAMEBUFFER,null)}function Je(P,y,H){const W=i.get(P);y!==void 0&&Ie(W.__webglFramebuffer,P,P.texture,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,0),H!==void 0&&rt(P)}function Ke(P){const y=P.texture,H=i.get(P),W=i.get(y);P.addEventListener("dispose",_);const K=P.textures,oe=P.isWebGLCubeRenderTarget===!0,ce=K.length>1;if(ce||(W.__webglTexture===void 0&&(W.__webglTexture=r.createTexture()),W.__version=y.version,o.memory.textures++),oe){H.__webglFramebuffer=[];for(let J=0;J<6;J++)if(y.mipmaps&&y.mipmaps.length>0){H.__webglFramebuffer[J]=[];for(let te=0;te<y.mipmaps.length;te++)H.__webglFramebuffer[J][te]=r.createFramebuffer()}else H.__webglFramebuffer[J]=r.createFramebuffer()}else{if(y.mipmaps&&y.mipmaps.length>0){H.__webglFramebuffer=[];for(let J=0;J<y.mipmaps.length;J++)H.__webglFramebuffer[J]=r.createFramebuffer()}else H.__webglFramebuffer=r.createFramebuffer();if(ce)for(let J=0,te=K.length;J<te;J++){const he=i.get(K[J]);he.__webglTexture===void 0&&(he.__webglTexture=r.createTexture(),o.memory.textures++)}if(P.samples>0&&bt(P)===!1){H.__webglMultisampledFramebuffer=r.createFramebuffer(),H.__webglColorRenderbuffer=[],t.bindFramebuffer(r.FRAMEBUFFER,H.__webglMultisampledFramebuffer);for(let J=0;J<K.length;J++){const te=K[J];H.__webglColorRenderbuffer[J]=r.createRenderbuffer(),r.bindRenderbuffer(r.RENDERBUFFER,H.__webglColorRenderbuffer[J]);const he=s.convert(te.format,te.colorSpace),Ae=s.convert(te.type),fe=x(te.internalFormat,he,Ae,te.normalized,te.colorSpace,P.isXRRenderTarget===!0),ue=ft(P);r.renderbufferStorageMultisample(r.RENDERBUFFER,ue,fe,P.width,P.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+J,r.RENDERBUFFER,H.__webglColorRenderbuffer[J])}r.bindRenderbuffer(r.RENDERBUFFER,null),P.depthBuffer&&(H.__webglDepthRenderbuffer=r.createRenderbuffer(),gt(H.__webglDepthRenderbuffer,P,!0)),t.bindFramebuffer(r.FRAMEBUFFER,null)}}if(oe){t.bindTexture(r.TEXTURE_CUBE_MAP,W.__webglTexture),ae(r.TEXTURE_CUBE_MAP,y);for(let J=0;J<6;J++)if(y.mipmaps&&y.mipmaps.length>0)for(let te=0;te<y.mipmaps.length;te++)Ie(H.__webglFramebuffer[J][te],P,y,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+J,te);else Ie(H.__webglFramebuffer[J],P,y,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+J,0);p(y)&&E(r.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(ce){for(let J=0,te=K.length;J<te;J++){const he=K[J],Ae=i.get(he);let fe=r.TEXTURE_2D;(P.isWebGL3DRenderTarget||P.isWebGLArrayRenderTarget)&&(fe=P.isWebGL3DRenderTarget?r.TEXTURE_3D:r.TEXTURE_2D_ARRAY),t.bindTexture(fe,Ae.__webglTexture),ae(fe,he),Ie(H.__webglFramebuffer,P,he,r.COLOR_ATTACHMENT0+J,fe,0),p(he)&&E(fe)}t.unbindTexture()}else{let J=r.TEXTURE_2D;if((P.isWebGL3DRenderTarget||P.isWebGLArrayRenderTarget)&&(J=P.isWebGL3DRenderTarget?r.TEXTURE_3D:r.TEXTURE_2D_ARRAY),t.bindTexture(J,W.__webglTexture),ae(J,y),y.mipmaps&&y.mipmaps.length>0)for(let te=0;te<y.mipmaps.length;te++)Ie(H.__webglFramebuffer[te],P,y,r.COLOR_ATTACHMENT0,J,te);else Ie(H.__webglFramebuffer,P,y,r.COLOR_ATTACHMENT0,J,0);p(y)&&E(J),t.unbindTexture()}P.depthBuffer&&rt(P)}function yt(P){const y=P.textures;for(let H=0,W=y.length;H<W;H++){const K=y[H];if(p(K)){const oe=b(P),ce=i.get(K).__webglTexture;t.bindTexture(oe,ce),E(oe),t.unbindTexture()}}}const St=[],Ct=[];function Dt(P){if(P.samples>0){if(bt(P)===!1){const y=P.textures,H=P.width,W=P.height;let K=r.COLOR_BUFFER_BIT;const oe=P.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,ce=i.get(P),J=y.length>1;if(J)for(let he=0;he<y.length;he++)t.bindFramebuffer(r.FRAMEBUFFER,ce.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+he,r.RENDERBUFFER,null),t.bindFramebuffer(r.FRAMEBUFFER,ce.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+he,r.TEXTURE_2D,null,0);t.bindFramebuffer(r.READ_FRAMEBUFFER,ce.__webglMultisampledFramebuffer);const te=P.texture.mipmaps;te&&te.length>0?t.bindFramebuffer(r.DRAW_FRAMEBUFFER,ce.__webglFramebuffer[0]):t.bindFramebuffer(r.DRAW_FRAMEBUFFER,ce.__webglFramebuffer);for(let he=0;he<y.length;he++){if(P.resolveDepthBuffer&&(P.depthBuffer&&(K|=r.DEPTH_BUFFER_BIT),P.stencilBuffer&&P.resolveStencilBuffer&&(K|=r.STENCIL_BUFFER_BIT)),J){r.framebufferRenderbuffer(r.READ_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.RENDERBUFFER,ce.__webglColorRenderbuffer[he]);const Ae=i.get(y[he]).__webglTexture;r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,Ae,0)}r.blitFramebuffer(0,0,H,W,0,0,H,W,K,r.NEAREST),c===!0&&(St.length=0,Ct.length=0,St.push(r.COLOR_ATTACHMENT0+he),P.depthBuffer&&P.resolveDepthBuffer===!1&&(St.push(oe),Ct.push(oe),r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,Ct)),r.invalidateFramebuffer(r.READ_FRAMEBUFFER,St))}if(t.bindFramebuffer(r.READ_FRAMEBUFFER,null),t.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),J)for(let he=0;he<y.length;he++){t.bindFramebuffer(r.FRAMEBUFFER,ce.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+he,r.RENDERBUFFER,ce.__webglColorRenderbuffer[he]);const Ae=i.get(y[he]).__webglTexture;t.bindFramebuffer(r.FRAMEBUFFER,ce.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+he,r.TEXTURE_2D,Ae,0)}t.bindFramebuffer(r.DRAW_FRAMEBUFFER,ce.__webglMultisampledFramebuffer)}else if(P.depthBuffer&&P.resolveDepthBuffer===!1&&c){const y=P.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT;r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,[y])}}}function ft(P){return Math.min(n.maxSamples,P.samples)}function bt(P){const y=i.get(P);return P.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&y.__useRenderToTexture!==!1}function F(P){const y=o.render.frame;h.get(P)!==y&&(h.set(P,y),P.update())}function Xt(P,y){const H=P.colorSpace,W=P.format,K=P.type;return P.isCompressedTexture===!0||P.isVideoTexture===!0||H!==$r&&H!==Qi&&(Xe.getTransfer(H)===tt?(W!==oi||K!==Qt)&&Ne("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):We("WebGLTextures: Unsupported texture color space:",H)),y}function et(P){return typeof HTMLImageElement<"u"&&P instanceof HTMLImageElement?(l.width=P.naturalWidth||P.width,l.height=P.naturalHeight||P.height):typeof VideoFrame<"u"&&P instanceof VideoFrame?(l.width=P.displayWidth,l.height=P.displayHeight):(l.width=P.width,l.height=P.height),l}this.allocateTextureUnit=N,this.resetTextureUnits=B,this.getTextureUnits=X,this.setTextureUnits=U,this.setTexture2D=$,this.setTexture2DArray=j,this.setTexture3D=se,this.setTextureCube=ie,this.rebindTextures=Je,this.setupRenderTarget=Ke,this.updateRenderTargetMipmap=yt,this.updateMultisampleRenderTarget=Dt,this.setupDepthRenderbuffer=rt,this.setupFrameBufferTexture=Ie,this.useMultisampledRTT=bt,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function Mx(r,e){function t(i,n=Qi){let s;const o=Xe.getTransfer(n);if(i===Qt)return r.UNSIGNED_BYTE;if(i===dl)return r.UNSIGNED_SHORT_4_4_4_4;if(i===fl)return r.UNSIGNED_SHORT_5_5_5_1;if(i===eu)return r.UNSIGNED_INT_5_9_9_9_REV;if(i===tu)return r.UNSIGNED_INT_10F_11F_11F_REV;if(i===jh)return r.BYTE;if(i===Qh)return r.SHORT;if(i===ks)return r.UNSIGNED_SHORT;if(i===ul)return r.INT;if(i===Ti)return r.UNSIGNED_INT;if(i===hi)return r.FLOAT;if(i===ki)return r.HALF_FLOAT;if(i===iu)return r.ALPHA;if(i===nu)return r.RGB;if(i===oi)return r.RGBA;if(i===Bi)return r.DEPTH_COMPONENT;if(i===bn)return r.DEPTH_STENCIL;if(i===su)return r.RED;if(i===pl)return r.RED_INTEGER;if(i===Sn)return r.RG;if(i===ml)return r.RG_INTEGER;if(i===gl)return r.RGBA_INTEGER;if(i===Br||i===zr||i===Hr||i===Gr)if(o===tt)if(s=e.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(i===Br)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===zr)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Hr)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Gr)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=e.get("WEBGL_compressed_texture_s3tc"),s!==null){if(i===Br)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===zr)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Hr)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Gr)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===wa||i===Aa||i===Ra||i===Ca)if(s=e.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(i===wa)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Aa)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Ra)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Ca)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Pa||i===La||i===Na||i===Da||i===Ia||i===Wr||i===Ua)if(s=e.get("WEBGL_compressed_texture_etc"),s!==null){if(i===Pa||i===La)return o===tt?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(i===Na)return o===tt?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC;if(i===Da)return s.COMPRESSED_R11_EAC;if(i===Ia)return s.COMPRESSED_SIGNED_R11_EAC;if(i===Wr)return s.COMPRESSED_RG11_EAC;if(i===Ua)return s.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===Fa||i===Oa||i===ka||i===Ba||i===za||i===Ha||i===Ga||i===Va||i===Wa||i===Xa||i===qa||i===$a||i===Ya||i===Ka)if(s=e.get("WEBGL_compressed_texture_astc"),s!==null){if(i===Fa)return o===tt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Oa)return o===tt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===ka)return o===tt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Ba)return o===tt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===za)return o===tt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Ha)return o===tt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Ga)return o===tt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===Va)return o===tt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Wa)return o===tt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Xa)return o===tt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===qa)return o===tt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===$a)return o===tt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Ya)return o===tt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===Ka)return o===tt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Za||i===Ja||i===ja)if(s=e.get("EXT_texture_compression_bptc"),s!==null){if(i===Za)return o===tt?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===Ja)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===ja)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===Qa||i===el||i===Xr||i===tl)if(s=e.get("EXT_texture_compression_rgtc"),s!==null){if(i===Qa)return s.COMPRESSED_RED_RGTC1_EXT;if(i===el)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Xr)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===tl)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===Bs?r.UNSIGNED_INT_24_8:r[i]!==void 0?r[i]:null}return{convert:t}}const Sx=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Ex=`
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

}`;class Tx{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const i=new fu(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,i=new wi({vertexShader:Sx,fragmentShader:Ex,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Ft(new fo(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class wx extends sn{constructor(e,t){super();const i=this;let n=null,s=1,o=null,a="local-floor",c=1,l=null,h=null,d=null,u=null,f=null,g=null;const v=typeof XRWebGLBinding<"u",m=new Tx,p={},E=t.getContextAttributes();let b=null,x=null;const M=[],T=[],A=new Ue;let _=null;const S=new It;S.viewport=new st;const R=new It;R.viewport=new st;const C=[S,R],L=new Ip;let B=null,X=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(k){let Z=M[k];return Z===void 0&&(Z=new Io,M[k]=Z),Z.getTargetRaySpace()},this.getControllerGrip=function(k){let Z=M[k];return Z===void 0&&(Z=new Io,M[k]=Z),Z.getGripSpace()},this.getHand=function(k){let Z=M[k];return Z===void 0&&(Z=new Io,M[k]=Z),Z.getHandSpace()};function U(k){const Z=T.indexOf(k.inputSource);if(Z===-1)return;const ee=M[Z];ee!==void 0&&(ee.update(k.inputSource,k.frame,l||o),ee.dispatchEvent({type:k.type,data:k.inputSource}))}function N(){n.removeEventListener("select",U),n.removeEventListener("selectstart",U),n.removeEventListener("selectend",U),n.removeEventListener("squeeze",U),n.removeEventListener("squeezestart",U),n.removeEventListener("squeezeend",U),n.removeEventListener("end",N),n.removeEventListener("inputsourceschange",z);for(let k=0;k<M.length;k++){const Z=T[k];Z!==null&&(T[k]=null,M[k].disconnect(Z))}B=null,X=null,m.reset();for(const k in p)delete p[k];e.setRenderTarget(b),f=null,u=null,d=null,n=null,x=null,ae.stop(),i.isPresenting=!1,e.setPixelRatio(_),e.setSize(A.width,A.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(k){s=k,i.isPresenting===!0&&Ne("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(k){a=k,i.isPresenting===!0&&Ne("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||o},this.setReferenceSpace=function(k){l=k},this.getBaseLayer=function(){return u!==null?u:f},this.getBinding=function(){return d===null&&v&&(d=new XRWebGLBinding(n,t)),d},this.getFrame=function(){return g},this.getSession=function(){return n},this.setSession=async function(k){if(n=k,n!==null){if(b=e.getRenderTarget(),n.addEventListener("select",U),n.addEventListener("selectstart",U),n.addEventListener("selectend",U),n.addEventListener("squeeze",U),n.addEventListener("squeezestart",U),n.addEventListener("squeezeend",U),n.addEventListener("end",N),n.addEventListener("inputsourceschange",z),E.xrCompatible!==!0&&await t.makeXRCompatible(),_=e.getPixelRatio(),e.getSize(A),v&&"createProjectionLayer"in XRWebGLBinding.prototype){let ee=null,ye=null,Pe=null;E.depth&&(Pe=E.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ee=E.stencil?bn:Bi,ye=E.stencil?Bs:Ti);const Ie={colorFormat:t.RGBA8,depthFormat:Pe,scaleFactor:s};d=this.getBinding(),u=d.createProjectionLayer(Ie),n.updateRenderState({layers:[u]}),e.setPixelRatio(1),e.setSize(u.textureWidth,u.textureHeight,!1),x=new Ei(u.textureWidth,u.textureHeight,{format:oi,type:Qt,depthTexture:new as(u.textureWidth,u.textureHeight,ye,void 0,void 0,void 0,void 0,void 0,void 0,ee),stencilBuffer:E.stencil,colorSpace:e.outputColorSpace,samples:E.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1})}else{const ee={antialias:E.antialias,alpha:!0,depth:E.depth,stencil:E.stencil,framebufferScaleFactor:s};f=new XRWebGLLayer(n,t,ee),n.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),x=new Ei(f.framebufferWidth,f.framebufferHeight,{format:oi,type:Qt,colorSpace:e.outputColorSpace,stencilBuffer:E.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}x.isXRRenderTarget=!0,this.setFoveation(c),l=null,o=await n.requestReferenceSpace(a),ae.setContext(n),ae.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(n!==null)return n.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function z(k){for(let Z=0;Z<k.removed.length;Z++){const ee=k.removed[Z],ye=T.indexOf(ee);ye>=0&&(T[ye]=null,M[ye].disconnect(ee))}for(let Z=0;Z<k.added.length;Z++){const ee=k.added[Z];let ye=T.indexOf(ee);if(ye===-1){for(let Ie=0;Ie<M.length;Ie++)if(Ie>=T.length){T.push(ee),ye=Ie;break}else if(T[Ie]===null){T[Ie]=ee,ye=Ie;break}if(ye===-1)break}const Pe=M[ye];Pe&&Pe.connect(ee)}}const $=new D,j=new D;function se(k,Z,ee){$.setFromMatrixPosition(Z.matrixWorld),j.setFromMatrixPosition(ee.matrixWorld);const ye=$.distanceTo(j),Pe=Z.projectionMatrix.elements,Ie=ee.projectionMatrix.elements,gt=Pe[14]/(Pe[10]-1),$e=Pe[14]/(Pe[10]+1),rt=(Pe[9]+1)/Pe[5],Je=(Pe[9]-1)/Pe[5],Ke=(Pe[8]-1)/Pe[0],yt=(Ie[8]+1)/Ie[0],St=gt*Ke,Ct=gt*yt,Dt=ye/(-Ke+yt),ft=Dt*-Ke;if(Z.matrixWorld.decompose(k.position,k.quaternion,k.scale),k.translateX(ft),k.translateZ(Dt),k.matrixWorld.compose(k.position,k.quaternion,k.scale),k.matrixWorldInverse.copy(k.matrixWorld).invert(),Pe[10]===-1)k.projectionMatrix.copy(Z.projectionMatrix),k.projectionMatrixInverse.copy(Z.projectionMatrixInverse);else{const bt=gt+Dt,F=$e+Dt,Xt=St-ft,et=Ct+(ye-ft),P=rt*$e/F*bt,y=Je*$e/F*bt;k.projectionMatrix.makePerspective(Xt,et,P,y,bt,F),k.projectionMatrixInverse.copy(k.projectionMatrix).invert()}}function ie(k,Z){Z===null?k.matrixWorld.copy(k.matrix):k.matrixWorld.multiplyMatrices(Z.matrixWorld,k.matrix),k.matrixWorldInverse.copy(k.matrixWorld).invert()}this.updateCamera=function(k){if(n===null)return;let Z=k.near,ee=k.far;m.texture!==null&&(m.depthNear>0&&(Z=m.depthNear),m.depthFar>0&&(ee=m.depthFar)),L.near=R.near=S.near=Z,L.far=R.far=S.far=ee,(B!==L.near||X!==L.far)&&(n.updateRenderState({depthNear:L.near,depthFar:L.far}),B=L.near,X=L.far),L.layers.mask=k.layers.mask|6,S.layers.mask=L.layers.mask&-5,R.layers.mask=L.layers.mask&-3;const ye=k.parent,Pe=L.cameras;ie(L,ye);for(let Ie=0;Ie<Pe.length;Ie++)ie(Pe[Ie],ye);Pe.length===2?se(L,S,R):L.projectionMatrix.copy(S.projectionMatrix),re(k,L,ye)};function re(k,Z,ee){ee===null?k.matrix.copy(Z.matrixWorld):(k.matrix.copy(ee.matrixWorld),k.matrix.invert(),k.matrix.multiply(Z.matrixWorld)),k.matrix.decompose(k.position,k.quaternion,k.scale),k.updateMatrixWorld(!0),k.projectionMatrix.copy(Z.projectionMatrix),k.projectionMatrixInverse.copy(Z.projectionMatrixInverse),k.isPerspectiveCamera&&(k.fov=rs*2*Math.atan(1/k.projectionMatrix.elements[5]),k.zoom=1)}this.getCamera=function(){return L},this.getFoveation=function(){if(!(u===null&&f===null))return c},this.setFoveation=function(k){c=k,u!==null&&(u.fixedFoveation=k),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=k)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(L)},this.getCameraTexture=function(k){return p[k]};let me=null;function ve(k,Z){if(h=Z.getViewerPose(l||o),g=Z,h!==null){const ee=h.views;f!==null&&(e.setRenderTargetFramebuffer(x,f.framebuffer),e.setRenderTarget(x));let ye=!1;ee.length!==L.cameras.length&&(L.cameras.length=0,ye=!0);for(let $e=0;$e<ee.length;$e++){const rt=ee[$e];let Je=null;if(f!==null)Je=f.getViewport(rt);else{const yt=d.getViewSubImage(u,rt);Je=yt.viewport,$e===0&&(e.setRenderTargetTextures(x,yt.colorTexture,yt.depthStencilTexture),e.setRenderTarget(x))}let Ke=C[$e];Ke===void 0&&(Ke=new It,Ke.layers.enable($e),Ke.viewport=new st,C[$e]=Ke),Ke.matrix.fromArray(rt.transform.matrix),Ke.matrix.decompose(Ke.position,Ke.quaternion,Ke.scale),Ke.projectionMatrix.fromArray(rt.projectionMatrix),Ke.projectionMatrixInverse.copy(Ke.projectionMatrix).invert(),Ke.viewport.set(Je.x,Je.y,Je.width,Je.height),$e===0&&(L.matrix.copy(Ke.matrix),L.matrix.decompose(L.position,L.quaternion,L.scale)),ye===!0&&L.cameras.push(Ke)}const Pe=n.enabledFeatures;if(Pe&&Pe.includes("depth-sensing")&&n.depthUsage=="gpu-optimized"&&v){d=i.getBinding();const $e=d.getDepthInformation(ee[0]);$e&&$e.isValid&&$e.texture&&m.init($e,n.renderState)}if(Pe&&Pe.includes("camera-access")&&v){e.state.unbindTexture(),d=i.getBinding();for(let $e=0;$e<ee.length;$e++){const rt=ee[$e].camera;if(rt){let Je=p[rt];Je||(Je=new fu,p[rt]=Je);const Ke=d.getCameraImage(rt);Je.sourceTexture=Ke}}}}for(let ee=0;ee<M.length;ee++){const ye=T[ee],Pe=M[ee];ye!==null&&Pe!==void 0&&Pe.update(ye,Z,l||o)}me&&me(k,Z),Z.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:Z}),g=null}const ae=new Au;ae.setAnimationLoop(ve),this.setAnimationLoop=function(k){me=k},this.dispose=function(){}}}const Ax=new Oe,Iu=new ke;Iu.set(-1,0,0,0,1,0,0,0,1);function Rx(r,e){function t(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function i(m,p){p.color.getRGB(m.fogColor.value,xu(r)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function n(m,p,E,b,x){p.isNodeMaterial?p.uniformsNeedUpdate=!1:p.isMeshBasicMaterial?s(m,p):p.isMeshLambertMaterial?(s(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshToonMaterial?(s(m,p),d(m,p)):p.isMeshPhongMaterial?(s(m,p),h(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshStandardMaterial?(s(m,p),u(m,p),p.isMeshPhysicalMaterial&&f(m,p,x)):p.isMeshMatcapMaterial?(s(m,p),g(m,p)):p.isMeshDepthMaterial?s(m,p):p.isMeshDistanceMaterial?(s(m,p),v(m,p)):p.isMeshNormalMaterial?s(m,p):p.isLineBasicMaterial?(o(m,p),p.isLineDashedMaterial&&a(m,p)):p.isPointsMaterial?c(m,p,E,b):p.isSpriteMaterial?l(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function s(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,t(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===$t&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,t(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===$t&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,t(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,t(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);const E=e.get(p),b=E.envMap,x=E.envMapRotation;b&&(m.envMap.value=b,m.envMapRotation.value.setFromMatrix4(Ax.makeRotationFromEuler(x)).transpose(),b.isCubeTexture&&b.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(Iu),m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,m.aoMapTransform))}function o(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform))}function a(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function c(m,p,E,b){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*E,m.scale.value=b*.5,p.map&&(m.map.value=p.map,t(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function l(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function h(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function d(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function u(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function f(m,p,E){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===$t&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=E.texture,m.transmissionSamplerSize.value.set(E.width,E.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function v(m,p){const E=e.get(p).light;m.referencePosition.value.setFromMatrixPosition(E.matrixWorld),m.nearDistance.value=E.shadow.camera.near,m.farDistance.value=E.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:n}}function Cx(r,e,t,i){let n={},s={},o=[];const a=r.getParameter(r.MAX_UNIFORM_BUFFER_BINDINGS);function c(x,M){const T=M.program;i.uniformBlockBinding(x,T)}function l(x,M){let T=n[x.id];T===void 0&&(m(x),T=h(x),n[x.id]=T,x.addEventListener("dispose",E));const A=M.program;i.updateUBOMapping(x,A);const _=e.render.frame;s[x.id]!==_&&(u(x),s[x.id]=_)}function h(x){const M=d();x.__bindingPointIndex=M;const T=r.createBuffer(),A=x.__size,_=x.usage;return r.bindBuffer(r.UNIFORM_BUFFER,T),r.bufferData(r.UNIFORM_BUFFER,A,_),r.bindBuffer(r.UNIFORM_BUFFER,null),r.bindBufferBase(r.UNIFORM_BUFFER,M,T),T}function d(){for(let x=0;x<a;x++)if(o.indexOf(x)===-1)return o.push(x),x;return We("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(x){const M=n[x.id],T=x.uniforms,A=x.__cache;r.bindBuffer(r.UNIFORM_BUFFER,M);for(let _=0,S=T.length;_<S;_++){const R=T[_];if(Array.isArray(R))for(let C=0,L=R.length;C<L;C++)f(R[C],_,C,A);else f(R,_,0,A)}r.bindBuffer(r.UNIFORM_BUFFER,null)}function f(x,M,T,A){if(v(x,M,T,A)===!0){const _=x.__offset,S=x.value;if(Array.isArray(S)){let R=0;for(let C=0;C<S.length;C++){const L=S[C],B=p(L);g(L,x.__data,R),typeof L!="number"&&typeof L!="boolean"&&!L.isMatrix3&&!ArrayBuffer.isView(L)&&(R+=B.storage/Float32Array.BYTES_PER_ELEMENT)}}else g(S,x.__data,0);r.bufferSubData(r.UNIFORM_BUFFER,_,x.__data)}}function g(x,M,T){typeof x=="number"||typeof x=="boolean"?M[0]=x:x.isMatrix3?(M[0]=x.elements[0],M[1]=x.elements[1],M[2]=x.elements[2],M[3]=0,M[4]=x.elements[3],M[5]=x.elements[4],M[6]=x.elements[5],M[7]=0,M[8]=x.elements[6],M[9]=x.elements[7],M[10]=x.elements[8],M[11]=0):ArrayBuffer.isView(x)?M.set(new x.constructor(x.buffer,x.byteOffset,M.length)):x.toArray(M,T)}function v(x,M,T,A){const _=x.value,S=M+"_"+T;if(A[S]===void 0)return typeof _=="number"||typeof _=="boolean"?A[S]=_:ArrayBuffer.isView(_)?A[S]=_.slice():A[S]=_.clone(),!0;{const R=A[S];if(typeof _=="number"||typeof _=="boolean"){if(R!==_)return A[S]=_,!0}else{if(ArrayBuffer.isView(_))return!0;if(R.equals(_)===!1)return R.copy(_),!0}}return!1}function m(x){const M=x.uniforms;let T=0;const A=16;for(let S=0,R=M.length;S<R;S++){const C=Array.isArray(M[S])?M[S]:[M[S]];for(let L=0,B=C.length;L<B;L++){const X=C[L],U=Array.isArray(X.value)?X.value:[X.value];for(let N=0,z=U.length;N<z;N++){const $=U[N],j=p($),se=T%A,ie=se%j.boundary,re=se+ie;T+=ie,re!==0&&A-re<j.storage&&(T+=A-re),X.__data=new Float32Array(j.storage/Float32Array.BYTES_PER_ELEMENT),X.__offset=T,T+=j.storage}}}const _=T%A;return _>0&&(T+=A-_),x.__size=T,x.__cache={},this}function p(x){const M={boundary:0,storage:0};return typeof x=="number"||typeof x=="boolean"?(M.boundary=4,M.storage=4):x.isVector2?(M.boundary=8,M.storage=8):x.isVector3||x.isColor?(M.boundary=16,M.storage=12):x.isVector4?(M.boundary=16,M.storage=16):x.isMatrix3?(M.boundary=48,M.storage=48):x.isMatrix4?(M.boundary=64,M.storage=64):x.isTexture?Ne("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(x)?(M.boundary=16,M.storage=x.byteLength):Ne("WebGLRenderer: Unsupported uniform value type.",x),M}function E(x){const M=x.target;M.removeEventListener("dispose",E);const T=o.indexOf(M.__bindingPointIndex);o.splice(T,1),r.deleteBuffer(n[M.id]),delete n[M.id],delete s[M.id]}function b(){for(const x in n)r.deleteBuffer(n[x]);o=[],n={},s={}}return{bind:c,update:l,dispose:b}}const Px=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let xi=null;function Lx(){return xi===null&&(xi=new Kr(Px,16,16,Sn,ki),xi.name="DFG_LUT",xi.minFilter=Tt,xi.magFilter=Tt,xi.wrapS=ei,xi.wrapT=ei,xi.generateMipmaps=!1,xi.needsUpdate=!0),xi}class Uu{constructor(e={}){const{canvas:t=Jd(),context:i=null,depth:n=!0,stencil:s=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:u=!1,outputBufferType:f=Qt}=e;this.isWebGLRenderer=!0;let g;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=i.getContextAttributes().alpha}else g=o;const v=f,m=new Set([gl,ml,pl]),p=new Set([Qt,Ti,ks,Bs,dl,fl]),E=new Uint32Array(4),b=new Int32Array(4),x=new D;let M=null,T=null;const A=[],_=[];let S=null;this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Si,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const R=this;let C=!1,L=null,B=null,X=null,U=null;this._outputColorSpace=ht;let N=0,z=0,$=null,j=-1,se=null;const ie=new st,re=new st;let me=null;const ve=new Be(0);let ae=0,k=t.width,Z=t.height,ee=1,ye=null,Pe=null;const Ie=new st(0,0,k,Z),gt=new st(0,0,k,Z);let $e=!1;const rt=new Sl;let Je=!1,Ke=!1;const yt=new Oe,St=new D,Ct=new st,Dt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let ft=!1;function bt(){return $===null?ee:1}let F=i;function Xt(w,O){return t.getContext(w,O)}try{const w={alpha:!0,depth:n,stencil:s,antialias:a,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:h,failIfMajorPerformanceCaveat:d};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${hl}`),t.addEventListener("webglcontextlost",pt,!1),t.addEventListener("webglcontextrestored",lt,!1),t.addEventListener("webglcontextcreationerror",pi,!1),F===null){const O="webgl2";if(F=Xt(O,w),F===null)throw Xt(O)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}}catch(w){throw We("WebGLRenderer: "+w.message),w}let et,P,y,H,W,K,oe,ce,J,te,he,Ae,fe,ue,De,Fe,ze,I,le,Q,de,xe,ne;function we(){et=new L_(F),et.init(),de=new Mx(F,et),P=new S_(F,et,e,de),y=new yx(F,et),P.reversedDepthBuffer&&u&&y.buffers.depth.setReversed(!0),B=F.createFramebuffer(),X=F.createFramebuffer(),U=F.createFramebuffer(),H=new I_(F),W=new ox,K=new bx(F,et,y,W,P,de,H),oe=new P_(R),ce=new kp(F),xe=new b_(F,ce),J=new N_(F,ce,H,xe),te=new F_(F,J,ce,xe,H),I=new U_(F,P,K),De=new E_(W),he=new rx(R,oe,et,P,xe,De),Ae=new Rx(R,W),fe=new lx,ue=new px(et),ze=new y_(R,oe,y,te,g,c),Fe=new vx(R,te,P),ne=new Cx(F,H,P,y),le=new M_(F,et,H),Q=new D_(F,et,H),H.programs=he.programs,R.capabilities=P,R.extensions=et,R.properties=W,R.renderLists=fe,R.shadowMap=Fe,R.state=y,R.info=H}we(),v!==Qt&&(S=new k_(v,t.width,t.height,a,n,s));const Se=new wx(R,F);this.xr=Se,this.getContext=function(){return F},this.getContextAttributes=function(){return F.getContextAttributes()},this.forceContextLoss=function(){const w=et.get("WEBGL_lose_context");w&&w.loseContext()},this.forceContextRestore=function(){const w=et.get("WEBGL_lose_context");w&&w.restoreContext()},this.getPixelRatio=function(){return ee},this.setPixelRatio=function(w){w!==void 0&&(ee=w,this.setSize(k,Z,!1))},this.getSize=function(w){return w.set(k,Z)},this.setSize=function(w,O,Y=!0){if(Se.isPresenting){Ne("WebGLRenderer: Can't change size while VR device is presenting.");return}k=w,Z=O,t.width=Math.floor(w*ee),t.height=Math.floor(O*ee),Y===!0&&(t.style.width=w+"px",t.style.height=O+"px"),S!==null&&S.setSize(t.width,t.height),this.setViewport(0,0,w,O)},this.getDrawingBufferSize=function(w){return w.set(k*ee,Z*ee).floor()},this.setDrawingBufferSize=function(w,O,Y){k=w,Z=O,ee=Y,t.width=Math.floor(w*Y),t.height=Math.floor(O*Y),this.setViewport(0,0,w,O)},this.setEffects=function(w){if(v===Qt){We("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(w){for(let O=0;O<w.length;O++)if(w[O].isOutputPass===!0){Ne("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}S.setEffects(w||[])},this.getCurrentViewport=function(w){return w.copy(ie)},this.getViewport=function(w){return w.copy(Ie)},this.setViewport=function(w,O,Y,G){w.isVector4?Ie.set(w.x,w.y,w.z,w.w):Ie.set(w,O,Y,G),y.viewport(ie.copy(Ie).multiplyScalar(ee).round())},this.getScissor=function(w){return w.copy(gt)},this.setScissor=function(w,O,Y,G){w.isVector4?gt.set(w.x,w.y,w.z,w.w):gt.set(w,O,Y,G),y.scissor(re.copy(gt).multiplyScalar(ee).round())},this.getScissorTest=function(){return $e},this.setScissorTest=function(w){y.setScissorTest($e=w)},this.setOpaqueSort=function(w){ye=w},this.setTransparentSort=function(w){Pe=w},this.getClearColor=function(w){return w.copy(ze.getClearColor())},this.setClearColor=function(){ze.setClearColor(...arguments)},this.getClearAlpha=function(){return ze.getClearAlpha()},this.setClearAlpha=function(){ze.setClearAlpha(...arguments)},this.clear=function(w=!0,O=!0,Y=!0){let G=0;if(w){let V=!1;if($!==null){const _e=$.texture.format;V=m.has(_e)}if(V){const _e=$.texture.type,Me=p.has(_e),ge=ze.getClearColor(),Ee=ze.getClearAlpha(),Re=ge.r,He=ge.g,Ve=ge.b;Me?(E[0]=Re,E[1]=He,E[2]=Ve,E[3]=Ee,F.clearBufferuiv(F.COLOR,0,E)):(b[0]=Re,b[1]=He,b[2]=Ve,b[3]=Ee,F.clearBufferiv(F.COLOR,0,b))}else G|=F.COLOR_BUFFER_BIT}O&&(G|=F.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),Y&&(G|=F.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),G!==0&&F.clear(G)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(w){w.setRenderer(this),L=w},this.dispose=function(){t.removeEventListener("webglcontextlost",pt,!1),t.removeEventListener("webglcontextrestored",lt,!1),t.removeEventListener("webglcontextcreationerror",pi,!1),ze.dispose(),fe.dispose(),ue.dispose(),W.dispose(),oe.dispose(),te.dispose(),xe.dispose(),ne.dispose(),he.dispose(),Se.dispose(),Se.removeEventListener("sessionstart",Wl),Se.removeEventListener("sessionend",Xl),an.stop()};function pt(w){w.preventDefault(),hc("WebGLRenderer: Context Lost."),C=!0}function lt(){hc("WebGLRenderer: Context Restored."),C=!1;const w=H.autoReset,O=Fe.enabled,Y=Fe.autoUpdate,G=Fe.needsUpdate,V=Fe.type;we(),H.autoReset=w,Fe.enabled=O,Fe.autoUpdate=Y,Fe.needsUpdate=G,Fe.type=V}function pi(w){We("WebGLRenderer: A WebGL context could not be created. Reason: ",w.statusMessage)}function mi(w){const O=w.target;O.removeEventListener("dispose",mi),ld(O)}function ld(w){cd(w),W.remove(w)}function cd(w){const O=W.get(w).programs;O!==void 0&&(O.forEach(function(Y){he.releaseProgram(Y)}),w.isShaderMaterial&&he.releaseShaderCache(w))}this.renderBufferDirect=function(w,O,Y,G,V,_e){O===null&&(O=Dt);const Me=V.isMesh&&V.matrixWorld.determinantAffine()<0,ge=dd(w,O,Y,G,V);y.setMaterial(G,Me);let Ee=Y.index,Re=1;if(G.wireframe===!0){if(Ee=J.getWireframeAttribute(Y),Ee===void 0)return;Re=2}const He=Y.drawRange,Ve=Y.attributes.position;let Le=He.start*Re,it=(He.start+He.count)*Re;_e!==null&&(Le=Math.max(Le,_e.start*Re),it=Math.min(it,(_e.start+_e.count)*Re)),Ee!==null?(Le=Math.max(Le,0),it=Math.min(it,Ee.count)):Ve!=null&&(Le=Math.max(Le,0),it=Math.min(it,Ve.count));const _t=it-Le;if(_t<0||_t===1/0)return;xe.setup(V,G,ge,Y,Ee);let mt,ot=le;if(Ee!==null&&(mt=ce.get(Ee),ot=Q,ot.setIndex(mt)),V.isMesh)G.wireframe===!0?(y.setLineWidth(G.wireframeLinewidth*bt()),ot.setMode(F.LINES)):ot.setMode(F.TRIANGLES);else if(V.isLine){let Ot=G.linewidth;Ot===void 0&&(Ot=1),y.setLineWidth(Ot*bt()),V.isLineSegments?ot.setMode(F.LINES):V.isLineLoop?ot.setMode(F.LINE_LOOP):ot.setMode(F.LINE_STRIP)}else V.isPoints?ot.setMode(F.POINTS):V.isSprite&&ot.setMode(F.TRIANGLES);if(V.isBatchedMesh)if(et.get("WEBGL_multi_draw"))ot.renderMultiDraw(V._multiDrawStarts,V._multiDrawCounts,V._multiDrawCount);else{const Ot=V._multiDrawStarts,be=V._multiDrawCounts,Yt=V._multiDrawCount,Ze=Ee?ce.get(Ee).bytesPerElement:1,ii=W.get(G).currentProgram.getUniforms();for(let gi=0;gi<Yt;gi++)ii.setValue(F,"_gl_DrawID",gi),ot.render(Ot[gi]/Ze,be[gi])}else if(V.isInstancedMesh)ot.renderInstances(Le,_t,V.count);else if(Y.isInstancedBufferGeometry){const Ot=Y._maxInstanceCount!==void 0?Y._maxInstanceCount:1/0,be=Math.min(Y.instanceCount,Ot);ot.renderInstances(Le,_t,be)}else ot.render(Le,_t)};function Vl(w,O,Y){w.transparent===!0&&w.side===bi&&w.forceSinglePass===!1?(w.side=$t,w.needsUpdate=!0,Js(w,O,Y),w.side=Oi,w.needsUpdate=!0,Js(w,O,Y),w.side=bi):Js(w,O,Y)}this.compile=function(w,O,Y=null){Y===null&&(Y=w),T=ue.get(Y),T.init(O),_.push(T),Y.traverseVisible(function(V){V.isLight&&V.layers.test(O.layers)&&(T.pushLight(V),V.castShadow&&T.pushShadow(V))}),w!==Y&&w.traverseVisible(function(V){V.isLight&&V.layers.test(O.layers)&&(T.pushLight(V),V.castShadow&&T.pushShadow(V))}),T.setupLights();const G=new Set;return w.traverse(function(V){if(!(V.isMesh||V.isPoints||V.isLine||V.isSprite))return;const _e=V.material;if(_e)if(Array.isArray(_e))for(let Me=0;Me<_e.length;Me++){const ge=_e[Me];Vl(ge,Y,V),G.add(ge)}else Vl(_e,Y,V),G.add(_e)}),T=_.pop(),G},this.compileAsync=function(w,O,Y=null){const G=this.compile(w,O,Y);return new Promise(V=>{function _e(){if(G.forEach(function(Me){W.get(Me).currentProgram.isReady()&&G.delete(Me)}),G.size===0){V(w);return}setTimeout(_e,10)}et.get("KHR_parallel_shader_compile")!==null?_e():setTimeout(_e,10)})};let So=null;function hd(w){So&&So(w)}function Wl(){an.stop()}function Xl(){an.start()}const an=new Au;an.setAnimationLoop(hd),typeof self<"u"&&an.setContext(self),this.setAnimationLoop=function(w){So=w,Se.setAnimationLoop(w),w===null?an.stop():an.start()},Se.addEventListener("sessionstart",Wl),Se.addEventListener("sessionend",Xl),this.render=function(w,O){if(O!==void 0&&O.isCamera!==!0){We("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(C===!0)return;L!==null&&L.renderStart(w,O);const Y=Se.enabled===!0&&Se.isPresenting===!0,G=S!==null&&($===null||Y)&&S.begin(R,$);if(w.matrixWorldAutoUpdate===!0&&w.updateMatrixWorld(),O.parent===null&&O.matrixWorldAutoUpdate===!0&&O.updateMatrixWorld(),Se.enabled===!0&&Se.isPresenting===!0&&(S===null||S.isCompositing()===!1)&&(Se.cameraAutoUpdate===!0&&Se.updateCamera(O),O=Se.getCamera()),w.isScene===!0&&w.onBeforeRender(R,w,O,$),T=ue.get(w,_.length),T.init(O),T.state.textureUnits=K.getTextureUnits(),_.push(T),yt.multiplyMatrices(O.projectionMatrix,O.matrixWorldInverse),rt.setFromProjectionMatrix(yt,Mi,O.reversedDepth),Ke=this.localClippingEnabled,Je=De.init(this.clippingPlanes,Ke),M=fe.get(w,A.length),M.init(),A.push(M),Se.enabled===!0&&Se.isPresenting===!0){const Me=R.xr.getDepthSensingMesh();Me!==null&&Eo(Me,O,-1/0,R.sortObjects)}Eo(w,O,0,R.sortObjects),M.finish(),R.sortObjects===!0&&M.sort(ye,Pe,O.reversedDepth),ft=Se.enabled===!1||Se.isPresenting===!1||Se.hasDepthSensing()===!1,ft&&ze.addToRenderList(M,w),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),Je===!0&&De.beginShadows();const V=T.state.shadowsArray;if(Fe.render(V,w,O),Je===!0&&De.endShadows(),(G&&S.hasRenderPass())===!1){const Me=M.opaque,ge=M.transmissive;if(T.setupLights(),O.isArrayCamera){const Ee=O.cameras;if(ge.length>0)for(let Re=0,He=Ee.length;Re<He;Re++){const Ve=Ee[Re];$l(Me,ge,w,Ve)}ft&&ze.render(w);for(let Re=0,He=Ee.length;Re<He;Re++){const Ve=Ee[Re];ql(M,w,Ve,Ve.viewport)}}else ge.length>0&&$l(Me,ge,w,O),ft&&ze.render(w),ql(M,w,O)}$!==null&&z===0&&(K.updateMultisampleRenderTarget($),K.updateRenderTargetMipmap($)),G&&S.end(R),w.isScene===!0&&w.onAfterRender(R,w,O),xe.resetDefaultState(),j=-1,se=null,_.pop(),_.length>0?(T=_[_.length-1],K.setTextureUnits(T.state.textureUnits),Je===!0&&De.setGlobalState(R.clippingPlanes,T.state.camera)):T=null,A.pop(),A.length>0?M=A[A.length-1]:M=null,L!==null&&L.renderEnd()};function Eo(w,O,Y,G){if(w.visible===!1)return;if(w.layers.test(O.layers)){if(w.isGroup)Y=w.renderOrder;else if(w.isLOD)w.autoUpdate===!0&&w.update(O);else if(w.isLightProbeGrid)T.pushLightProbeGrid(w);else if(w.isLight)T.pushLight(w),w.castShadow&&T.pushShadow(w);else if(w.isSprite){if(!w.frustumCulled||rt.intersectsSprite(w)){G&&Ct.setFromMatrixPosition(w.matrixWorld).applyMatrix4(yt);const Me=te.update(w),ge=w.material;ge.visible&&M.push(w,Me,ge,Y,Ct.z,null)}}else if((w.isMesh||w.isLine||w.isPoints)&&(!w.frustumCulled||rt.intersectsObject(w))){const Me=te.update(w),ge=w.material;if(G&&(w.boundingSphere!==void 0?(w.boundingSphere===null&&w.computeBoundingSphere(),Ct.copy(w.boundingSphere.center)):(Me.boundingSphere===null&&Me.computeBoundingSphere(),Ct.copy(Me.boundingSphere.center)),Ct.applyMatrix4(w.matrixWorld).applyMatrix4(yt)),Array.isArray(ge)){const Ee=Me.groups;for(let Re=0,He=Ee.length;Re<He;Re++){const Ve=Ee[Re],Le=ge[Ve.materialIndex];Le&&Le.visible&&M.push(w,Me,Le,Y,Ct.z,Ve)}}else ge.visible&&M.push(w,Me,ge,Y,Ct.z,null)}}const _e=w.children;for(let Me=0,ge=_e.length;Me<ge;Me++)Eo(_e[Me],O,Y,G)}function ql(w,O,Y,G){const{opaque:V,transmissive:_e,transparent:Me}=w;T.setupLightsView(Y),Je===!0&&De.setGlobalState(R.clippingPlanes,Y),G&&y.viewport(ie.copy(G)),V.length>0&&Zs(V,O,Y),_e.length>0&&Zs(_e,O,Y),Me.length>0&&Zs(Me,O,Y),y.buffers.depth.setTest(!0),y.buffers.depth.setMask(!0),y.buffers.color.setMask(!0),y.setPolygonOffset(!1)}function $l(w,O,Y,G){if((Y.isScene===!0?Y.overrideMaterial:null)!==null)return;if(T.state.transmissionRenderTarget[G.id]===void 0){const Le=et.has("EXT_color_buffer_half_float")||et.has("EXT_color_buffer_float");T.state.transmissionRenderTarget[G.id]=new Ei(1,1,{generateMipmaps:!0,type:Le?ki:Qt,minFilter:Ii,samples:Math.max(4,P.samples),stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Xe.workingColorSpace})}const _e=T.state.transmissionRenderTarget[G.id],Me=G.viewport||ie;_e.setSize(Me.z*R.transmissionResolutionScale,Me.w*R.transmissionResolutionScale);const ge=R.getRenderTarget(),Ee=R.getActiveCubeFace(),Re=R.getActiveMipmapLevel();R.setRenderTarget(_e),R.getClearColor(ve),ae=R.getClearAlpha(),ae<1&&R.setClearColor(16777215,.5),R.clear(),ft&&ze.render(Y);const He=R.toneMapping;R.toneMapping=Si;const Ve=G.viewport;if(G.viewport!==void 0&&(G.viewport=void 0),T.setupLightsView(G),Je===!0&&De.setGlobalState(R.clippingPlanes,G),Zs(w,Y,G),K.updateMultisampleRenderTarget(_e),K.updateRenderTargetMipmap(_e),et.has("WEBGL_multisampled_render_to_texture")===!1){let Le=!1;for(let it=0,_t=O.length;it<_t;it++){const mt=O[it],{object:ot,geometry:Ot,material:be,group:Yt}=mt;if(be.side===bi&&ot.layers.test(G.layers)){const Ze=be.side;be.side=$t,be.needsUpdate=!0,Yl(ot,Y,G,Ot,be,Yt),be.side=Ze,be.needsUpdate=!0,Le=!0}}Le===!0&&(K.updateMultisampleRenderTarget(_e),K.updateRenderTargetMipmap(_e))}R.setRenderTarget(ge,Ee,Re),R.setClearColor(ve,ae),Ve!==void 0&&(G.viewport=Ve),R.toneMapping=He}function Zs(w,O,Y){const G=O.isScene===!0?O.overrideMaterial:null;for(let V=0,_e=w.length;V<_e;V++){const Me=w[V],{object:ge,geometry:Ee,group:Re}=Me;let He=Me.material;He.allowOverride===!0&&G!==null&&(He=G),ge.layers.test(Y.layers)&&Yl(ge,O,Y,Ee,He,Re)}}function Yl(w,O,Y,G,V,_e){w.onBeforeRender(R,O,Y,G,V,_e),w.modelViewMatrix.multiplyMatrices(Y.matrixWorldInverse,w.matrixWorld),w.normalMatrix.getNormalMatrix(w.modelViewMatrix),V.onBeforeRender(R,O,Y,G,w,_e),V.transparent===!0&&V.side===bi&&V.forceSinglePass===!1?(V.side=$t,V.needsUpdate=!0,R.renderBufferDirect(Y,O,G,V,w,_e),V.side=Oi,V.needsUpdate=!0,R.renderBufferDirect(Y,O,G,V,w,_e),V.side=bi):R.renderBufferDirect(Y,O,G,V,w,_e),w.onAfterRender(R,O,Y,G,V,_e)}function Js(w,O,Y){O.isScene!==!0&&(O=Dt);const G=W.get(w),V=T.state.lights,_e=T.state.shadowsArray,Me=V.state.version,ge=he.getParameters(w,V.state,_e,O,Y,T.state.lightProbeGridArray),Ee=he.getProgramCacheKey(ge);let Re=G.programs;G.environment=w.isMeshStandardMaterial||w.isMeshLambertMaterial||w.isMeshPhongMaterial?O.environment:null,G.fog=O.fog;const He=w.isMeshStandardMaterial||w.isMeshLambertMaterial&&!w.envMap||w.isMeshPhongMaterial&&!w.envMap;G.envMap=oe.get(w.envMap||G.environment,He),G.envMapRotation=G.environment!==null&&w.envMap===null?O.environmentRotation:w.envMapRotation,Re===void 0&&(w.addEventListener("dispose",mi),Re=new Map,G.programs=Re);let Ve=Re.get(Ee);if(Ve!==void 0){if(G.currentProgram===Ve&&G.lightsStateVersion===Me)return Zl(w,ge),Ve}else ge.uniforms=he.getUniforms(w),L!==null&&w.isNodeMaterial&&L.build(w,Y,ge),w.onBeforeCompile(ge,R),Ve=he.acquireProgram(ge,Ee),Re.set(Ee,Ve),G.uniforms=ge.uniforms;const Le=G.uniforms;return(!w.isShaderMaterial&&!w.isRawShaderMaterial||w.clipping===!0)&&(Le.clippingPlanes=De.uniform),Zl(w,ge),G.needsLights=pd(w),G.lightsStateVersion=Me,G.needsLights&&(Le.ambientLightColor.value=V.state.ambient,Le.lightProbe.value=V.state.probe,Le.directionalLights.value=V.state.directional,Le.directionalLightShadows.value=V.state.directionalShadow,Le.spotLights.value=V.state.spot,Le.spotLightShadows.value=V.state.spotShadow,Le.rectAreaLights.value=V.state.rectArea,Le.ltc_1.value=V.state.rectAreaLTC1,Le.ltc_2.value=V.state.rectAreaLTC2,Le.pointLights.value=V.state.point,Le.pointLightShadows.value=V.state.pointShadow,Le.hemisphereLights.value=V.state.hemi,Le.directionalShadowMatrix.value=V.state.directionalShadowMatrix,Le.spotLightMatrix.value=V.state.spotLightMatrix,Le.spotLightMap.value=V.state.spotLightMap,Le.pointShadowMatrix.value=V.state.pointShadowMatrix),G.lightProbeGrid=T.state.lightProbeGridArray.length>0,G.currentProgram=Ve,G.uniformsList=null,Ve}function Kl(w){if(w.uniformsList===null){const O=w.currentProgram.getUniforms();w.uniformsList=Vr.seqWithValue(O.seq,w.uniforms)}return w.uniformsList}function Zl(w,O){const Y=W.get(w);Y.outputColorSpace=O.outputColorSpace,Y.batching=O.batching,Y.batchingColor=O.batchingColor,Y.instancing=O.instancing,Y.instancingColor=O.instancingColor,Y.instancingMorph=O.instancingMorph,Y.skinning=O.skinning,Y.morphTargets=O.morphTargets,Y.morphNormals=O.morphNormals,Y.morphColors=O.morphColors,Y.morphTargetsCount=O.morphTargetsCount,Y.numClippingPlanes=O.numClippingPlanes,Y.numIntersection=O.numClipIntersection,Y.vertexAlphas=O.vertexAlphas,Y.vertexTangents=O.vertexTangents,Y.toneMapping=O.toneMapping}function ud(w,O){if(w.length===0)return null;if(w.length===1)return w[0].texture!==null?w[0]:null;x.setFromMatrixPosition(O.matrixWorld);for(let Y=0,G=w.length;Y<G;Y++){const V=w[Y];if(V.texture!==null&&V.boundingBox.containsPoint(x))return V}return null}function dd(w,O,Y,G,V){O.isScene!==!0&&(O=Dt),K.resetTextureUnits();const _e=O.fog,Me=G.isMeshStandardMaterial||G.isMeshLambertMaterial||G.isMeshPhongMaterial?O.environment:null,ge=$===null?R.outputColorSpace:$.isXRRenderTarget===!0?$.texture.colorSpace:Xe.workingColorSpace,Ee=G.isMeshStandardMaterial||G.isMeshLambertMaterial&&!G.envMap||G.isMeshPhongMaterial&&!G.envMap,Re=oe.get(G.envMap||Me,Ee),He=G.vertexColors===!0&&!!Y.attributes.color&&Y.attributes.color.itemSize===4,Ve=!!Y.attributes.tangent&&(!!G.normalMap||G.anisotropy>0),Le=!!Y.morphAttributes.position,it=!!Y.morphAttributes.normal,_t=!!Y.morphAttributes.color;let mt=Si;G.toneMapped&&($===null||$.isXRRenderTarget===!0)&&(mt=R.toneMapping);const ot=Y.morphAttributes.position||Y.morphAttributes.normal||Y.morphAttributes.color,Ot=ot!==void 0?ot.length:0,be=W.get(G),Yt=T.state.lights;if(Je===!0&&(Ke===!0||w!==se)){const ct=w===se&&G.id===j;De.setState(G,w,ct)}let Ze=!1;G.version===be.__version?(be.needsLights&&be.lightsStateVersion!==Yt.state.version||be.outputColorSpace!==ge||V.isBatchedMesh&&be.batching===!1||!V.isBatchedMesh&&be.batching===!0||V.isBatchedMesh&&be.batchingColor===!0&&V.colorTexture===null||V.isBatchedMesh&&be.batchingColor===!1&&V.colorTexture!==null||V.isInstancedMesh&&be.instancing===!1||!V.isInstancedMesh&&be.instancing===!0||V.isSkinnedMesh&&be.skinning===!1||!V.isSkinnedMesh&&be.skinning===!0||V.isInstancedMesh&&be.instancingColor===!0&&V.instanceColor===null||V.isInstancedMesh&&be.instancingColor===!1&&V.instanceColor!==null||V.isInstancedMesh&&be.instancingMorph===!0&&V.morphTexture===null||V.isInstancedMesh&&be.instancingMorph===!1&&V.morphTexture!==null||be.envMap!==Re||G.fog===!0&&be.fog!==_e||be.numClippingPlanes!==void 0&&(be.numClippingPlanes!==De.numPlanes||be.numIntersection!==De.numIntersection)||be.vertexAlphas!==He||be.vertexTangents!==Ve||be.morphTargets!==Le||be.morphNormals!==it||be.morphColors!==_t||be.toneMapping!==mt||be.morphTargetsCount!==Ot||!!be.lightProbeGrid!=T.state.lightProbeGridArray.length>0)&&(Ze=!0):(Ze=!0,be.__version=G.version);let ii=be.currentProgram;Ze===!0&&(ii=Js(G,O,V),L&&G.isNodeMaterial&&L.onUpdateProgram(G,ii,be));let gi=!1,zi=!1,An=!1;const at=ii.getUniforms(),xt=be.uniforms;if(y.useProgram(ii.program)&&(gi=!0,zi=!0,An=!0),G.id!==j&&(j=G.id,zi=!0),be.needsLights){const ct=ud(T.state.lightProbeGridArray,V);be.lightProbeGrid!==ct&&(be.lightProbeGrid=ct,zi=!0)}if(gi||se!==w){y.buffers.depth.getReversed()&&w.reversedDepth!==!0&&(w._reversedDepth=!0,w.updateProjectionMatrix()),at.setValue(F,"projectionMatrix",w.projectionMatrix),at.setValue(F,"viewMatrix",w.matrixWorldInverse);const Gi=at.map.cameraPosition;Gi!==void 0&&Gi.setValue(F,St.setFromMatrixPosition(w.matrixWorld)),P.logarithmicDepthBuffer&&at.setValue(F,"logDepthBufFC",2/(Math.log(w.far+1)/Math.LN2)),(G.isMeshPhongMaterial||G.isMeshToonMaterial||G.isMeshLambertMaterial||G.isMeshBasicMaterial||G.isMeshStandardMaterial||G.isShaderMaterial)&&at.setValue(F,"isOrthographic",w.isOrthographicCamera===!0),se!==w&&(se=w,zi=!0,An=!0)}if(be.needsLights&&(Yt.state.directionalShadowMap.length>0&&at.setValue(F,"directionalShadowMap",Yt.state.directionalShadowMap,K),Yt.state.spotShadowMap.length>0&&at.setValue(F,"spotShadowMap",Yt.state.spotShadowMap,K),Yt.state.pointShadowMap.length>0&&at.setValue(F,"pointShadowMap",Yt.state.pointShadowMap,K)),V.isSkinnedMesh){at.setOptional(F,V,"bindMatrix"),at.setOptional(F,V,"bindMatrixInverse");const ct=V.skeleton;ct&&(ct.boneTexture===null&&ct.computeBoneTexture(),at.setValue(F,"boneTexture",ct.boneTexture,K))}V.isBatchedMesh&&(at.setOptional(F,V,"batchingTexture"),at.setValue(F,"batchingTexture",V._matricesTexture,K),at.setOptional(F,V,"batchingIdTexture"),at.setValue(F,"batchingIdTexture",V._indirectTexture,K),at.setOptional(F,V,"batchingColorTexture"),V._colorsTexture!==null&&at.setValue(F,"batchingColorTexture",V._colorsTexture,K));const Hi=Y.morphAttributes;if((Hi.position!==void 0||Hi.normal!==void 0||Hi.color!==void 0)&&I.update(V,Y,ii),(zi||be.receiveShadow!==V.receiveShadow)&&(be.receiveShadow=V.receiveShadow,at.setValue(F,"receiveShadow",V.receiveShadow)),(G.isMeshStandardMaterial||G.isMeshLambertMaterial||G.isMeshPhongMaterial)&&G.envMap===null&&O.environment!==null&&(xt.envMapIntensity.value=O.environmentIntensity),xt.dfgLUT!==void 0&&(xt.dfgLUT.value=Lx()),zi){if(at.setValue(F,"toneMappingExposure",R.toneMappingExposure),be.needsLights&&fd(xt,An),_e&&G.fog===!0&&Ae.refreshFogUniforms(xt,_e),Ae.refreshMaterialUniforms(xt,G,ee,Z,T.state.transmissionRenderTarget[w.id]),be.needsLights&&be.lightProbeGrid){const ct=be.lightProbeGrid;xt.probesSH.value=ct.texture,xt.probesMin.value.copy(ct.boundingBox.min),xt.probesMax.value.copy(ct.boundingBox.max),xt.probesResolution.value.copy(ct.resolution)}Vr.upload(F,Kl(be),xt,K)}if(G.isShaderMaterial&&G.uniformsNeedUpdate===!0&&(Vr.upload(F,Kl(be),xt,K),G.uniformsNeedUpdate=!1),G.isSpriteMaterial&&at.setValue(F,"center",V.center),at.setValue(F,"modelViewMatrix",V.modelViewMatrix),at.setValue(F,"normalMatrix",V.normalMatrix),at.setValue(F,"modelMatrix",V.matrixWorld),G.uniformsGroups!==void 0){const ct=G.uniformsGroups;for(let Gi=0,Rn=ct.length;Gi<Rn;Gi++){const Jl=ct[Gi];ne.update(Jl,ii),ne.bind(Jl,ii)}}return ii}function fd(w,O){w.ambientLightColor.needsUpdate=O,w.lightProbe.needsUpdate=O,w.directionalLights.needsUpdate=O,w.directionalLightShadows.needsUpdate=O,w.pointLights.needsUpdate=O,w.pointLightShadows.needsUpdate=O,w.spotLights.needsUpdate=O,w.spotLightShadows.needsUpdate=O,w.rectAreaLights.needsUpdate=O,w.hemisphereLights.needsUpdate=O}function pd(w){return w.isMeshLambertMaterial||w.isMeshToonMaterial||w.isMeshPhongMaterial||w.isMeshStandardMaterial||w.isShadowMaterial||w.isShaderMaterial&&w.lights===!0}this.getActiveCubeFace=function(){return N},this.getActiveMipmapLevel=function(){return z},this.getRenderTarget=function(){return $},this.setRenderTargetTextures=function(w,O,Y){const G=W.get(w);G.__autoAllocateDepthBuffer=w.resolveDepthBuffer===!1,G.__autoAllocateDepthBuffer===!1&&(G.__useRenderToTexture=!1),W.get(w.texture).__webglTexture=O,W.get(w.depthTexture).__webglTexture=G.__autoAllocateDepthBuffer?void 0:Y,G.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(w,O){const Y=W.get(w);Y.__webglFramebuffer=O,Y.__useDefaultFramebuffer=O===void 0},this.setRenderTarget=function(w,O=0,Y=0){$=w,N=O,z=Y;let G=null,V=!1,_e=!1;if(w){const ge=W.get(w);if(ge.__useDefaultFramebuffer!==void 0){y.bindFramebuffer(F.FRAMEBUFFER,ge.__webglFramebuffer),ie.copy(w.viewport),re.copy(w.scissor),me=w.scissorTest,y.viewport(ie),y.scissor(re),y.setScissorTest(me),j=-1;return}else if(ge.__webglFramebuffer===void 0)K.setupRenderTarget(w);else if(ge.__hasExternalTextures)K.rebindTextures(w,W.get(w.texture).__webglTexture,W.get(w.depthTexture).__webglTexture);else if(w.depthBuffer){const He=w.depthTexture;if(ge.__boundDepthTexture!==He){if(He!==null&&W.has(He)&&(w.width!==He.image.width||w.height!==He.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");K.setupDepthRenderbuffer(w)}}const Ee=w.texture;(Ee.isData3DTexture||Ee.isDataArrayTexture||Ee.isCompressedArrayTexture)&&(_e=!0);const Re=W.get(w).__webglFramebuffer;w.isWebGLCubeRenderTarget?(Array.isArray(Re[O])?G=Re[O][Y]:G=Re[O],V=!0):w.samples>0&&K.useMultisampledRTT(w)===!1?G=W.get(w).__webglMultisampledFramebuffer:Array.isArray(Re)?G=Re[Y]:G=Re,ie.copy(w.viewport),re.copy(w.scissor),me=w.scissorTest}else ie.copy(Ie).multiplyScalar(ee).floor(),re.copy(gt).multiplyScalar(ee).floor(),me=$e;if(Y!==0&&(G=B),y.bindFramebuffer(F.FRAMEBUFFER,G)&&y.drawBuffers(w,G),y.viewport(ie),y.scissor(re),y.setScissorTest(me),V){const ge=W.get(w.texture);F.framebufferTexture2D(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_CUBE_MAP_POSITIVE_X+O,ge.__webglTexture,Y)}else if(_e){const ge=O;for(let Ee=0;Ee<w.textures.length;Ee++){const Re=W.get(w.textures[Ee]);F.framebufferTextureLayer(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0+Ee,Re.__webglTexture,Y,ge)}}else if(w!==null&&Y!==0){const ge=W.get(w.texture);F.framebufferTexture2D(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,ge.__webglTexture,Y)}j=-1},this.readRenderTargetPixels=function(w,O,Y,G,V,_e,Me,ge=0){if(!(w&&w.isWebGLRenderTarget)){We("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ee=W.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&Me!==void 0&&(Ee=Ee[Me]),Ee){y.bindFramebuffer(F.FRAMEBUFFER,Ee);try{const Re=w.textures[ge],He=Re.format,Ve=Re.type;if(w.textures.length>1&&F.readBuffer(F.COLOR_ATTACHMENT0+ge),!P.textureFormatReadable(He)){We("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!P.textureTypeReadable(Ve)){We("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}O>=0&&O<=w.width-G&&Y>=0&&Y<=w.height-V&&F.readPixels(O,Y,G,V,de.convert(He),de.convert(Ve),_e)}finally{const Re=$!==null?W.get($).__webglFramebuffer:null;y.bindFramebuffer(F.FRAMEBUFFER,Re)}}},this.readRenderTargetPixelsAsync=async function(w,O,Y,G,V,_e,Me,ge=0){if(!(w&&w.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ee=W.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&Me!==void 0&&(Ee=Ee[Me]),Ee)if(O>=0&&O<=w.width-G&&Y>=0&&Y<=w.height-V){y.bindFramebuffer(F.FRAMEBUFFER,Ee);const Re=w.textures[ge],He=Re.format,Ve=Re.type;if(w.textures.length>1&&F.readBuffer(F.COLOR_ATTACHMENT0+ge),!P.textureFormatReadable(He))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!P.textureTypeReadable(Ve))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const Le=F.createBuffer();F.bindBuffer(F.PIXEL_PACK_BUFFER,Le),F.bufferData(F.PIXEL_PACK_BUFFER,_e.byteLength,F.STREAM_READ),F.readPixels(O,Y,G,V,de.convert(He),de.convert(Ve),0);const it=$!==null?W.get($).__webglFramebuffer:null;y.bindFramebuffer(F.FRAMEBUFFER,it);const _t=F.fenceSync(F.SYNC_GPU_COMMANDS_COMPLETE,0);return F.flush(),await jd(F,_t,4),F.bindBuffer(F.PIXEL_PACK_BUFFER,Le),F.getBufferSubData(F.PIXEL_PACK_BUFFER,0,_e),F.deleteBuffer(Le),F.deleteSync(_t),_e}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(w,O=null,Y=0){const G=Math.pow(2,-Y),V=Math.floor(w.image.width*G),_e=Math.floor(w.image.height*G),Me=O!==null?O.x:0,ge=O!==null?O.y:0;K.setTexture2D(w,0),F.copyTexSubImage2D(F.TEXTURE_2D,Y,0,0,Me,ge,V,_e),y.unbindTexture()},this.copyTextureToTexture=function(w,O,Y=null,G=null,V=0,_e=0){let Me,ge,Ee,Re,He,Ve,Le,it,_t;const mt=w.isCompressedTexture?w.mipmaps[_e]:w.image;if(Y!==null)Me=Y.max.x-Y.min.x,ge=Y.max.y-Y.min.y,Ee=Y.isBox3?Y.max.z-Y.min.z:1,Re=Y.min.x,He=Y.min.y,Ve=Y.isBox3?Y.min.z:0;else{const xt=Math.pow(2,-V);Me=Math.floor(mt.width*xt),ge=Math.floor(mt.height*xt),w.isDataArrayTexture?Ee=mt.depth:w.isData3DTexture?Ee=Math.floor(mt.depth*xt):Ee=1,Re=0,He=0,Ve=0}G!==null?(Le=G.x,it=G.y,_t=G.z):(Le=0,it=0,_t=0);const ot=de.convert(O.format),Ot=de.convert(O.type);let be;O.isData3DTexture?(K.setTexture3D(O,0),be=F.TEXTURE_3D):O.isDataArrayTexture||O.isCompressedArrayTexture?(K.setTexture2DArray(O,0),be=F.TEXTURE_2D_ARRAY):(K.setTexture2D(O,0),be=F.TEXTURE_2D),y.activeTexture(F.TEXTURE0),y.pixelStorei(F.UNPACK_FLIP_Y_WEBGL,O.flipY),y.pixelStorei(F.UNPACK_PREMULTIPLY_ALPHA_WEBGL,O.premultiplyAlpha),y.pixelStorei(F.UNPACK_ALIGNMENT,O.unpackAlignment);const Yt=y.getParameter(F.UNPACK_ROW_LENGTH),Ze=y.getParameter(F.UNPACK_IMAGE_HEIGHT),ii=y.getParameter(F.UNPACK_SKIP_PIXELS),gi=y.getParameter(F.UNPACK_SKIP_ROWS),zi=y.getParameter(F.UNPACK_SKIP_IMAGES);y.pixelStorei(F.UNPACK_ROW_LENGTH,mt.width),y.pixelStorei(F.UNPACK_IMAGE_HEIGHT,mt.height),y.pixelStorei(F.UNPACK_SKIP_PIXELS,Re),y.pixelStorei(F.UNPACK_SKIP_ROWS,He),y.pixelStorei(F.UNPACK_SKIP_IMAGES,Ve);const An=w.isDataArrayTexture||w.isData3DTexture,at=O.isDataArrayTexture||O.isData3DTexture;if(w.isDepthTexture){const xt=W.get(w),Hi=W.get(O),ct=W.get(xt.__renderTarget),Gi=W.get(Hi.__renderTarget);y.bindFramebuffer(F.READ_FRAMEBUFFER,ct.__webglFramebuffer),y.bindFramebuffer(F.DRAW_FRAMEBUFFER,Gi.__webglFramebuffer);for(let Rn=0;Rn<Ee;Rn++)An&&(F.framebufferTextureLayer(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,W.get(w).__webglTexture,V,Ve+Rn),F.framebufferTextureLayer(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,W.get(O).__webglTexture,_e,_t+Rn)),F.blitFramebuffer(Re,He,Me,ge,Le,it,Me,ge,F.DEPTH_BUFFER_BIT,F.NEAREST);y.bindFramebuffer(F.READ_FRAMEBUFFER,null),y.bindFramebuffer(F.DRAW_FRAMEBUFFER,null)}else if(V!==0||w.isRenderTargetTexture||W.has(w)){const xt=W.get(w),Hi=W.get(O);y.bindFramebuffer(F.READ_FRAMEBUFFER,X),y.bindFramebuffer(F.DRAW_FRAMEBUFFER,U);for(let ct=0;ct<Ee;ct++)An?F.framebufferTextureLayer(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,xt.__webglTexture,V,Ve+ct):F.framebufferTexture2D(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,xt.__webglTexture,V),at?F.framebufferTextureLayer(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,Hi.__webglTexture,_e,_t+ct):F.framebufferTexture2D(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,Hi.__webglTexture,_e),V!==0?F.blitFramebuffer(Re,He,Me,ge,Le,it,Me,ge,F.COLOR_BUFFER_BIT,F.NEAREST):at?F.copyTexSubImage3D(be,_e,Le,it,_t+ct,Re,He,Me,ge):F.copyTexSubImage2D(be,_e,Le,it,Re,He,Me,ge);y.bindFramebuffer(F.READ_FRAMEBUFFER,null),y.bindFramebuffer(F.DRAW_FRAMEBUFFER,null)}else at?w.isDataTexture||w.isData3DTexture?F.texSubImage3D(be,_e,Le,it,_t,Me,ge,Ee,ot,Ot,mt.data):O.isCompressedArrayTexture?F.compressedTexSubImage3D(be,_e,Le,it,_t,Me,ge,Ee,ot,mt.data):F.texSubImage3D(be,_e,Le,it,_t,Me,ge,Ee,ot,Ot,mt):w.isDataTexture?F.texSubImage2D(F.TEXTURE_2D,_e,Le,it,Me,ge,ot,Ot,mt.data):w.isCompressedTexture?F.compressedTexSubImage2D(F.TEXTURE_2D,_e,Le,it,mt.width,mt.height,ot,mt.data):F.texSubImage2D(F.TEXTURE_2D,_e,Le,it,Me,ge,ot,Ot,mt);y.pixelStorei(F.UNPACK_ROW_LENGTH,Yt),y.pixelStorei(F.UNPACK_IMAGE_HEIGHT,Ze),y.pixelStorei(F.UNPACK_SKIP_PIXELS,ii),y.pixelStorei(F.UNPACK_SKIP_ROWS,gi),y.pixelStorei(F.UNPACK_SKIP_IMAGES,zi),_e===0&&O.generateMipmaps&&F.generateMipmap(be),y.unbindTexture()},this.initRenderTarget=function(w){W.get(w).__webglFramebuffer===void 0&&K.setupRenderTarget(w)},this.initTexture=function(w){w.isCubeTexture?K.setTextureCube(w,0):w.isData3DTexture?K.setTexture3D(w,0):w.isDataArrayTexture||w.isCompressedArrayTexture?K.setTexture2DArray(w,0):K.setTexture2D(w,0),y.unbindTexture()},this.resetState=function(){N=0,z=0,$=null,y.reset(),xe.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Mi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=Xe._getDrawingBufferColorSpace(e),t.unpackColorSpace=Xe._getUnpackColorSpace()}}const yh={type:"change"},Cl={type:"start"},Fu={type:"end"},Ar=new co,bh=new ji,Nx=Math.cos(70*vi.DEG2RAD),Et=new D,qt=2*Math.PI,nt={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},la=1e-6;class Ou extends Fp{constructor(e,t=null){super(e,t),this.state=nt.NONE,this.target=new D,this.cursor=new D,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:Jn.ROTATE,MIDDLE:Jn.DOLLY,RIGHT:Jn.PAN},this.touches={ONE:Yn.ROTATE,TWO:Yn.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle="auto",this._domElementKeyEvents=null,this._lastPosition=new D,this._lastQuaternion=new Nt,this._lastTargetPosition=new D,this._quat=new Nt().setFromUnitVectors(e.up,new D(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new qc,this._sphericalDelta=new qc,this._scale=1,this._panOffset=new D,this._rotateStart=new Ue,this._rotateEnd=new Ue,this._rotateDelta=new Ue,this._panStart=new Ue,this._panEnd=new Ue,this._panDelta=new Ue,this._dollyStart=new Ue,this._dollyEnd=new Ue,this._dollyDelta=new Ue,this._dollyDirection=new D,this._mouse=new Ue,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=Ix.bind(this),this._onPointerDown=Dx.bind(this),this._onPointerUp=Ux.bind(this),this._onContextMenu=Gx.bind(this),this._onMouseWheel=kx.bind(this),this._onKeyDown=Bx.bind(this),this._onTouchStart=zx.bind(this),this._onTouchMove=Hx.bind(this),this._onMouseDown=Fx.bind(this),this._onMouseMove=Ox.bind(this),this._interceptControlDown=Vx.bind(this),this._interceptControlUp=Wx.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(e){this._cursorStyle=e,e==="grab"?this.domElement.style.cursor="grab":this.domElement.style.cursor="auto"}get cursorStyle(){return this._cursorStyle}connect(e){super.connect(e),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction=""}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(yh),this.update(),this.state=nt.NONE}pan(e,t){this._pan(e,t),this.update()}dollyIn(e){this._dollyIn(e),this.update()}dollyOut(e){this._dollyOut(e),this.update()}rotateLeft(e){this._rotateLeft(e),this.update()}rotateUp(e){this._rotateUp(e),this.update()}update(e=null){const t=this.object.position;Et.copy(t).sub(this.target),Et.applyQuaternion(this._quat),this._spherical.setFromVector3(Et),this.autoRotate&&this.state===nt.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let i=this.minAzimuthAngle,n=this.maxAzimuthAngle;isFinite(i)&&isFinite(n)&&(i<-Math.PI?i+=qt:i>Math.PI&&(i-=qt),n<-Math.PI?n+=qt:n>Math.PI&&(n-=qt),i<=n?this._spherical.theta=Math.max(i,Math.min(n,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(i+n)/2?Math.max(i,this._spherical.theta):Math.min(n,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let s=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{const o=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),s=o!=this._spherical.radius}if(Et.setFromSpherical(this._spherical),Et.applyQuaternion(this._quatInverse),t.copy(this.target).add(Et),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let o=null;if(this.object.isPerspectiveCamera){const a=Et.length();o=this._clampDistance(a*this._scale);const c=a-o;this.object.position.addScaledVector(this._dollyDirection,c),this.object.updateMatrixWorld(),s=!!c}else if(this.object.isOrthographicCamera){const a=new D(this._mouse.x,this._mouse.y,0);a.unproject(this.object);const c=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),s=c!==this.object.zoom;const l=new D(this._mouse.x,this._mouse.y,0);l.unproject(this.object),this.object.position.sub(l).add(a),this.object.updateMatrixWorld(),o=Et.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;o!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(o).add(this.object.position):(Ar.origin.copy(this.object.position),Ar.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(Ar.direction))<Nx?this.object.lookAt(this.target):(bh.setFromNormalAndCoplanarPoint(this.object.up,this.target),Ar.intersectPlane(bh,this.target))))}else if(this.object.isOrthographicCamera){const o=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),o!==this.object.zoom&&(this.object.updateProjectionMatrix(),s=!0)}return this._scale=1,this._performCursorZoom=!1,s||this._lastPosition.distanceToSquared(this.object.position)>la||8*(1-this._lastQuaternion.dot(this.object.quaternion))>la||this._lastTargetPosition.distanceToSquared(this.target)>la?(this.dispatchEvent(yh),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?qt/60*this.autoRotateSpeed*e:qt/60/60*this.autoRotateSpeed}_getZoomScale(e){const t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){Et.setFromMatrixColumn(t,0),Et.multiplyScalar(-e),this._panOffset.add(Et)}_panUp(e,t){this.screenSpacePanning===!0?Et.setFromMatrixColumn(t,1):(Et.setFromMatrixColumn(t,0),Et.crossVectors(this.object.up,Et)),Et.multiplyScalar(e),this._panOffset.add(Et)}_pan(e,t){const i=this.domElement;if(this.object.isPerspectiveCamera){const n=this.object.position;Et.copy(n).sub(this.target);let s=Et.length();s*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*s/i.clientHeight,this.object.matrix),this._panUp(2*t*s/i.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/i.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/i.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;const i=this.domElement.getBoundingClientRect(),n=e-i.left,s=t-i.top,o=i.width,a=i.height;this._mouse.x=n/o*2-1,this._mouse.y=-(s/a)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const t=this.domElement;this._rotateLeft(qt*this._rotateDelta.x/t.clientHeight),this._rotateUp(qt*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(qt*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-qt*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(qt*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-qt*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),n=.5*(e.pageY+t.y);this._rotateStart.set(i,n)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),n=.5*(e.pageY+t.y);this._panStart.set(i,n)}}_handleTouchStartDolly(e){const t=this._getSecondPointerPosition(e),i=e.pageX-t.x,n=e.pageY-t.y,s=Math.sqrt(i*i+n*n);this._dollyStart.set(0,s)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{const i=this._getSecondPointerPosition(e),n=.5*(e.pageX+i.x),s=.5*(e.pageY+i.y);this._rotateEnd.set(n,s)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const t=this.domElement;this._rotateLeft(qt*this._rotateDelta.x/t.clientHeight),this._rotateUp(qt*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),n=.5*(e.pageY+t.y);this._panEnd.set(i,n)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){const t=this._getSecondPointerPosition(e),i=e.pageX-t.x,n=e.pageY-t.y,s=Math.sqrt(i*i+n*n);this._dollyEnd.set(0,s),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);const o=(e.pageX+t.x)*.5,a=(e.pageY+t.y)*.5;this._updateZoomParameters(o,a)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new Ue,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){const t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){const t=e.deltaMode,i={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:i.deltaY*=16;break;case 2:i.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(i.deltaY*=10),i}}function Dx(r){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(r.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(r)&&(this._addPointer(r),r.pointerType==="touch"?this._onTouchStart(r):this._onMouseDown(r),this._cursorStyle==="grab"&&(this.domElement.style.cursor="grabbing")))}function Ix(r){this.enabled!==!1&&(r.pointerType==="touch"?this._onTouchMove(r):this._onMouseMove(r))}function Ux(r){switch(this._removePointer(r),this._pointers.length){case 0:this.domElement.releasePointerCapture(r.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(Fu),this.state=nt.NONE,this._cursorStyle==="grab"&&(this.domElement.style.cursor="grab");break;case 1:const e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function Fx(r){let e;switch(r.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case Jn.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(r),this.state=nt.DOLLY;break;case Jn.ROTATE:if(r.ctrlKey||r.metaKey||r.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(r),this.state=nt.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(r),this.state=nt.ROTATE}break;case Jn.PAN:if(r.ctrlKey||r.metaKey||r.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(r),this.state=nt.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(r),this.state=nt.PAN}break;default:this.state=nt.NONE}this.state!==nt.NONE&&this.dispatchEvent(Cl)}function Ox(r){switch(this.state){case nt.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(r);break;case nt.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(r);break;case nt.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(r);break}}function kx(r){this.enabled===!1||this.enableZoom===!1||this.state!==nt.NONE||(r.preventDefault(),this.dispatchEvent(Cl),this._handleMouseWheel(this._customWheelEvent(r)),this.dispatchEvent(Fu))}function Bx(r){this.enabled!==!1&&this._handleKeyDown(r)}function zx(r){switch(this._trackPointer(r),this._pointers.length){case 1:switch(this.touches.ONE){case Yn.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(r),this.state=nt.TOUCH_ROTATE;break;case Yn.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(r),this.state=nt.TOUCH_PAN;break;default:this.state=nt.NONE}break;case 2:switch(this.touches.TWO){case Yn.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(r),this.state=nt.TOUCH_DOLLY_PAN;break;case Yn.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(r),this.state=nt.TOUCH_DOLLY_ROTATE;break;default:this.state=nt.NONE}break;default:this.state=nt.NONE}this.state!==nt.NONE&&this.dispatchEvent(Cl)}function Hx(r){switch(this._trackPointer(r),this.state){case nt.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(r),this.update();break;case nt.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(r),this.update();break;case nt.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(r),this.update();break;case nt.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(r),this.update();break;default:this.state=nt.NONE}}function Gx(r){this.enabled!==!1&&r.preventDefault()}function Vx(r){r.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function Wx(r){r.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}class Xx extends on{constructor(e){super(e)}load(e,t,i,n){const s=this,o=new Al(this.manager);o.setPath(this.path),o.setResponseType("arraybuffer"),o.setRequestHeader(this.requestHeader),o.setWithCredentials(this.withCredentials),o.load(e,function(a){try{t(s.parse(a))}catch(c){n?n(c):console.error(c),s.manager.itemError(e)}},i,n)}parse(e){function t(l){const h=new DataView(l),d=32/8*3+32/8*3*3+16/8,u=h.getUint32(80,!0);if(80+32/8+u*d===h.byteLength)return!0;const g=[115,111,108,105,100];for(let v=0;v<5;v++)if(i(g,h,v))return!1;return!0}function i(l,h,d){for(let u=0,f=l.length;u<f;u++)if(l[u]!==h.getUint8(d+u))return!1;return!0}function n(l){const h=new DataView(l),d=h.getUint32(80,!0);let u,f,g,v=!1,m,p,E,b,x;for(let C=0;C<70;C++)h.getUint32(C,!1)==1129270351&&h.getUint8(C+4)==82&&h.getUint8(C+5)==61&&(v=!0,m=new Float32Array(d*3*3),p=h.getUint8(C+6)/255,E=h.getUint8(C+7)/255,b=h.getUint8(C+8)/255,x=h.getUint8(C+9)/255);const M=84,T=12*4+2,A=new wt,_=new Float32Array(d*3*3),S=new Float32Array(d*3*3),R=new Be;for(let C=0;C<d;C++){const L=M+C*T,B=h.getFloat32(L,!0),X=h.getFloat32(L+4,!0),U=h.getFloat32(L+8,!0);if(v){const N=h.getUint16(L+48,!0);N&32768?(u=p,f=E,g=b):(u=(N&31)/31,f=(N>>5&31)/31,g=(N>>10&31)/31)}for(let N=1;N<=3;N++){const z=L+N*12,$=C*3*3+(N-1)*3;_[$]=h.getFloat32(z,!0),_[$+1]=h.getFloat32(z+4,!0),_[$+2]=h.getFloat32(z+8,!0),S[$]=B,S[$+1]=X,S[$+2]=U,v&&(R.setRGB(u,f,g,ht),m[$]=R.r,m[$+1]=R.g,m[$+2]=R.b)}}return A.setAttribute("position",new ti(_,3)),A.setAttribute("normal",new ti(S,3)),v&&(A.setAttribute("color",new ti(m,3)),A.hasColors=!0,A.alpha=x),A}function s(l){const h=new wt,d=/solid([\s\S]*?)endsolid/g,u=/facet([\s\S]*?)endfacet/g,f=/solid\s(.+)/;let g=0;const v=/[\s]+([+-]?(?:\d*)(?:\.\d*)?(?:[eE][+-]?\d+)?)/.source,m=new RegExp("vertex"+v+v+v,"g"),p=new RegExp("normal"+v+v+v,"g"),E=[],b=[],x=[],M=new D;let T,A=0,_=0,S=0;for(;(T=d.exec(l))!==null;){_=S;const R=T[0],C=(T=f.exec(R))!==null?T[1]:"";for(x.push(C);(T=u.exec(R))!==null;){let X=0,U=0;const N=T[0];for(;(T=p.exec(N))!==null;)M.x=parseFloat(T[1]),M.y=parseFloat(T[2]),M.z=parseFloat(T[3]),U++;for(;(T=m.exec(N))!==null;)E.push(parseFloat(T[1]),parseFloat(T[2]),parseFloat(T[3])),b.push(M.x,M.y,M.z),X++,S++;U!==1&&console.error("THREE.STLLoader: Something isn't right with the normal of face number "+g),X!==3&&console.error("THREE.STLLoader: Something isn't right with the vertices of face number "+g),g++}const L=_,B=S-_;h.userData.groupNames=x,h.addGroup(L,B,A),A++}return h.setAttribute("position",new je(E,3)),h.setAttribute("normal",new je(b,3)),h}function o(l){return typeof l!="string"?new TextDecoder().decode(l):l}function a(l){if(typeof l=="string"){const h=new Uint8Array(l.length);for(let d=0;d<l.length;d++)h[d]=l.charCodeAt(d)&255;return h.buffer||h}else return l}const c=a(e);return t(c)?n(c):s(o(e))}}class Mh extends wp{constructor(e){super(e)}parse(e){function t(N){switch(N.image_type){case u:case v:if(N.colormap_length>256||N.colormap_size!==24||N.colormap_type!==1)throw new Error("THREE.TGALoader: Invalid type colormap data for indexed type.");break;case f:case g:case m:case p:if(N.colormap_type)throw new Error("THREE.TGALoader: Invalid type colormap data for colormap type.");break;case d:throw new Error("THREE.TGALoader: No data.");default:throw new Error("THREE.TGALoader: Invalid type "+N.image_type)}if(N.width<=0||N.height<=0)throw new Error("THREE.TGALoader: Invalid image size.");if(N.pixel_size!==8&&N.pixel_size!==16&&N.pixel_size!==24&&N.pixel_size!==32)throw new Error("THREE.TGALoader: Invalid pixel size "+N.pixel_size)}function i(N,z,$,j,se){let ie,re;const me=$.pixel_size>>3,ve=$.width*$.height*me;if(z&&(re=se.subarray(j,j+=$.colormap_length*($.colormap_size>>3))),N){ie=new Uint8Array(ve);let ae,k,Z,ee=0;const ye=new Uint8Array(me);for(;ee<ve;)if(ae=se[j++],k=(ae&127)+1,ae&128){for(Z=0;Z<me;++Z)ye[Z]=se[j++];for(Z=0;Z<k;++Z)ie.set(ye,ee+Z*me);ee+=me*k}else{for(k*=me,Z=0;Z<k;++Z)ie[ee+Z]=se[j++];ee+=k}}else ie=se.subarray(j,j+=z?$.width*$.height:ve);return{pixel_data:ie,palettes:re}}function n(N,z,$,j,se,ie,re,me,ve){const ae=ve;let k,Z=0,ee,ye;const Pe=R.width;for(ye=z;ye!==j;ye+=$)for(ee=se;ee!==re;ee+=ie,Z++)k=me[Z],N[(ee+Pe*ye)*4+3]=255,N[(ee+Pe*ye)*4+2]=ae[k*3+0],N[(ee+Pe*ye)*4+1]=ae[k*3+1],N[(ee+Pe*ye)*4+0]=ae[k*3+2];return N}function s(N,z,$,j,se,ie,re,me){let ve,ae=0,k,Z;const ee=R.width;for(Z=z;Z!==j;Z+=$)for(k=se;k!==re;k+=ie,ae+=2)ve=me[ae+0]+(me[ae+1]<<8),N[(k+ee*Z)*4+0]=(ve&31744)>>7,N[(k+ee*Z)*4+1]=(ve&992)>>2,N[(k+ee*Z)*4+2]=(ve&31)<<3,N[(k+ee*Z)*4+3]=ve&32768?0:255;return N}function o(N,z,$,j,se,ie,re,me){let ve=0,ae,k;const Z=R.width;for(k=z;k!==j;k+=$)for(ae=se;ae!==re;ae+=ie,ve+=3)N[(ae+Z*k)*4+3]=255,N[(ae+Z*k)*4+2]=me[ve+0],N[(ae+Z*k)*4+1]=me[ve+1],N[(ae+Z*k)*4+0]=me[ve+2];return N}function a(N,z,$,j,se,ie,re,me){let ve=0,ae,k;const Z=R.width;for(k=z;k!==j;k+=$)for(ae=se;ae!==re;ae+=ie,ve+=4)N[(ae+Z*k)*4+2]=me[ve+0],N[(ae+Z*k)*4+1]=me[ve+1],N[(ae+Z*k)*4+0]=me[ve+2],N[(ae+Z*k)*4+3]=me[ve+3];return N}function c(N,z,$,j,se,ie,re,me){let ve,ae=0,k,Z;const ee=R.width;for(Z=z;Z!==j;Z+=$)for(k=se;k!==re;k+=ie,ae++)ve=me[ae],N[(k+ee*Z)*4+0]=ve,N[(k+ee*Z)*4+1]=ve,N[(k+ee*Z)*4+2]=ve,N[(k+ee*Z)*4+3]=255;return N}function l(N,z,$,j,se,ie,re,me){let ve=0,ae,k;const Z=R.width;for(k=z;k!==j;k+=$)for(ae=se;ae!==re;ae+=ie,ve+=2)N[(ae+Z*k)*4+0]=me[ve+0],N[(ae+Z*k)*4+1]=me[ve+0],N[(ae+Z*k)*4+2]=me[ve+0],N[(ae+Z*k)*4+3]=me[ve+1];return N}function h(N,z,$,j,se){let ie,re,me,ve,ae,k;switch((R.flags&E)>>b){default:case T:ie=0,me=1,ae=z,re=0,ve=1,k=$;break;case x:ie=0,me=1,ae=z,re=$-1,ve=-1,k=-1;break;case A:ie=z-1,me=-1,ae=-1,re=0,ve=1,k=$;break;case M:ie=z-1,me=-1,ae=-1,re=$-1,ve=-1,k=-1;break}if(B)switch(R.pixel_size){case 8:c(N,re,ve,k,ie,me,ae,j);break;case 16:l(N,re,ve,k,ie,me,ae,j);break;default:throw new Error("THREE.TGALoader: Format not supported.")}else switch(R.pixel_size){case 8:n(N,re,ve,k,ie,me,ae,j,se);break;case 16:s(N,re,ve,k,ie,me,ae,j);break;case 24:o(N,re,ve,k,ie,me,ae,j);break;case 32:a(N,re,ve,k,ie,me,ae,j);break;default:throw new Error("THREE.TGALoader: Format not supported.")}return N}const d=0,u=1,f=2,g=3,v=9,m=10,p=11,E=48,b=4,x=0,M=1,T=2,A=3;if(e.length<19)throw new Error("THREE.TGALoader: Not enough data to contain header.");let _=0;const S=new Uint8Array(e),R={id_length:S[_++],colormap_type:S[_++],image_type:S[_++],colormap_index:S[_++]|S[_++]<<8,colormap_length:S[_++]|S[_++]<<8,colormap_size:S[_++],origin:[S[_++]|S[_++]<<8,S[_++]|S[_++]<<8],width:S[_++]|S[_++]<<8,height:S[_++]|S[_++]<<8,pixel_size:S[_++],flags:S[_++]};if(t(R),R.id_length+_>e.length)throw new Error("THREE.TGALoader: No data.");_+=R.id_length;let C=!1,L=!1,B=!1;switch(R.image_type){case v:C=!0,L=!0;break;case u:L=!0;break;case m:C=!0;break;case f:break;case p:C=!0,B=!0;break;case g:B=!0;break}const X=new Uint8Array(R.width*R.height*4),U=i(C,L,R,_,S);return h(X,R.width,R.height,U.pixel_data,U.palettes),{data:X,width:R.width,height:R.height,flipY:!0,generateMipmaps:!0,minFilter:Ii}}}function jt(r,e){const t=[],i=r.childNodes;for(let n=0,s=i.length;n<s;n++){const o=i[n];o.nodeName===e&&t.push(o)}return t}function qx(r){return r.length===0?[]:r.trim().split(/\s+/)}function Wt(r){return r.length===0?[]:r.trim().split(/\s+/).map(parseFloat)}function Rr(r){return r.length===0?[]:r.trim().split(/\s+/).map(e=>parseInt(e))}function Lt(r){return r.substring(1)}class $x{constructor(){this.count=0}generateId(){return"three_default_"+this.count++}parse(e){if(e.length===0)return null;const t=new DOMParser().parseFromString(e,"application/xml"),i=jt(t,"COLLADA")[0],n=t.getElementsByTagName("parsererror")[0];if(n!==void 0){const c=jt(n,"div")[0];let l;return c?l=c.textContent:l=this.parserErrorToText(n),console.error(`THREE.ColladaLoader: Failed to parse collada file.
`,l),null}const s=i.getAttribute("version");console.debug("THREE.ColladaLoader: File version",s);const o=this.parseAsset(jt(i,"asset")[0]),a={animations:{},clips:{},controllers:{},images:{},effects:{},materials:{},cameras:{},lights:{},geometries:{},nodes:{},visualScenes:{},kinematicsModels:{},physicsModels:{},kinematicsScenes:{},joints:{}};return this.library=a,this.collada=i,this.parseLibrary(i,"library_animations","animation",this.parseAnimation.bind(this)),this.parseLibrary(i,"library_animation_clips","animation_clip",this.parseAnimationClip.bind(this)),this.parseLibrary(i,"library_controllers","controller",this.parseController.bind(this)),this.parseLibrary(i,"library_images","image",this.parseImage.bind(this)),this.parseLibrary(i,"library_effects","effect",this.parseEffect.bind(this)),this.parseLibrary(i,"library_materials","material",this.parseMaterial.bind(this)),this.parseLibrary(i,"library_cameras","camera",this.parseCamera.bind(this)),this.parseLibrary(i,"library_lights","light",this.parseLight.bind(this)),this.parseLibrary(i,"library_geometries","geometry",this.parseGeometry.bind(this)),this.parseLibrary(i,"library_nodes","node",this.parseNode.bind(this)),this.parseLibrary(i,"library_visual_scenes","visual_scene",this.parseVisualScene.bind(this)),this.parseLibrary(i,"library_joints","joint",this.parseLibraryJoint.bind(this)),this.parseLibrary(i,"library_kinematics_models","kinematics_model",this.parseKinematicsModel.bind(this)),this.parseLibrary(i,"library_physics_models","physics_model",this.parsePhysicsModel.bind(this)),this.parseLibrary(i,"scene","instance_kinematics_scene",this.parseKinematicsScene.bind(this)),{library:a,asset:o,collada:i}}parserErrorToText(e){const t=[],i=[e];for(;i.length;){const n=i.shift();n.nodeType===Node.TEXT_NODE?t.push(n.textContent):(t.push(`
`),i.push(...n.childNodes))}return t.join("").trim()}parseAsset(e){return{unit:this.parseAssetUnit(jt(e,"unit")[0]),upAxis:this.parseAssetUpAxis(jt(e,"up_axis")[0])}}parseAssetUnit(e){return e!==void 0&&e.hasAttribute("meter")===!0?parseFloat(e.getAttribute("meter")):1}parseAssetUpAxis(e){return e!==void 0?e.textContent:"Y_UP"}parseLibrary(e,t,i,n){const s=jt(e,t)[0];if(s!==void 0){const o=jt(s,i);for(let a=0;a<o.length;a++)n(o[a])}}parseAnimation(e){const t={sources:{},samplers:{},channels:{}};let i=!1;for(let n=0,s=e.childNodes.length;n<s;n++){const o=e.childNodes[n];if(o.nodeType!==1)continue;let a;switch(o.nodeName){case"source":a=o.getAttribute("id"),t.sources[a]=this.parseSource(o);break;case"sampler":a=o.getAttribute("id"),t.samplers[a]=this.parseAnimationSampler(o);break;case"channel":a=o.getAttribute("target"),t.channels[a]=this.parseAnimationChannel(o);break;case"animation":this.parseAnimation(o),i=!0;break}}i===!1&&(this.library.animations[e.getAttribute("id")||vi.generateUUID()]=t)}parseAnimationSampler(e){const t={inputs:{}};for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"input":const o=Lt(s.getAttribute("source")),a=s.getAttribute("semantic");t.inputs[a]=o;break}}return t}parseAnimationChannel(e){const t={};let n=e.getAttribute("target").split("/");const s=n.shift();let o=n.shift();const a=o.indexOf("(")!==-1,c=o.indexOf(".")!==-1;if(c)n=o.split("."),o=n.shift(),t.member=n.shift();else if(a){const l=o.split("(");o=l.shift();for(let h=0;h<l.length;h++)l[h]=parseInt(l[h].replace(/\)/,""));t.indices=l}return t.id=s,t.sid=o,t.arraySyntax=a,t.memberSyntax=c,t.sampler=Lt(e.getAttribute("source")),t}parseAnimationClip(e){const t={name:e.getAttribute("id")||"default",start:parseFloat(e.getAttribute("start")||0),end:parseFloat(e.getAttribute("end")||0),animations:[]};for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"instance_animation":t.animations.push(Lt(s.getAttribute("url")));break}}this.library.clips[e.getAttribute("id")]=t}parseController(e){const t={};for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"skin":t.id=Lt(s.getAttribute("source")),t.skin=this.parseSkin(s);break;case"morph":t.id=Lt(s.getAttribute("source")),console.warn("THREE.ColladaLoader: Morph target animation not supported yet.");break}}this.library.controllers[e.getAttribute("id")]=t}parseSkin(e){const t={sources:{}};for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"bind_shape_matrix":t.bindShapeMatrix=Wt(s.textContent);break;case"source":const o=s.getAttribute("id");t.sources[o]=this.parseSource(s);break;case"joints":t.joints=this.parseJoints(s);break;case"vertex_weights":t.vertexWeights=this.parseVertexWeights(s);break}}return t}parseJoints(e){const t={inputs:{}};for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"input":const o=s.getAttribute("semantic"),a=Lt(s.getAttribute("source"));t.inputs[o]=a;break}}return t}parseVertexWeights(e){const t={inputs:{}};for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"input":const o=s.getAttribute("semantic"),a=Lt(s.getAttribute("source")),c=parseInt(s.getAttribute("offset"));t.inputs[o]={id:a,offset:c};break;case"vcount":t.vcount=Rr(s.textContent);break;case"v":t.v=Rr(s.textContent);break}}return t}parseImage(e){const t={init_from:jt(e,"init_from")[0].textContent};this.library.images[e.getAttribute("id")]=t}parseEffect(e){const t={};for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"profile_COMMON":t.profile=this.parseEffectProfileCOMMON(s);break}}this.library.effects[e.getAttribute("id")]=t}parseEffectProfileCOMMON(e){const t={surfaces:{},samplers:{}};for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"newparam":this.parseEffectNewparam(s,t);break;case"technique":t.technique=this.parseEffectTechnique(s);break;case"extra":t.extra=this.parseEffectExtra(s);break}}return t}parseEffectNewparam(e,t){const i=e.getAttribute("sid");for(let n=0,s=e.childNodes.length;n<s;n++){const o=e.childNodes[n];if(o.nodeType===1)switch(o.nodeName){case"surface":t.surfaces[i]=this.parseEffectSurface(o);break;case"sampler2D":t.samplers[i]=this.parseEffectSampler(o);break}}}parseEffectSurface(e){const t={};for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"init_from":t.init_from=s.textContent;break}}return t}parseEffectSampler(e){const t={};for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"source":t.source=s.textContent;break}}return t}parseEffectTechnique(e){const t={};for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"constant":case"lambert":case"blinn":case"phong":t.type=s.nodeName,t.parameters=this.parseEffectParameters(s);break;case"extra":t.extra=this.parseEffectExtra(s);break}}return t}parseEffectParameters(e){const t={};for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"emission":case"diffuse":case"specular":case"bump":case"ambient":case"shininess":case"transparency":t[s.nodeName]=this.parseEffectParameter(s);break;case"transparent":t[s.nodeName]={opaque:s.hasAttribute("opaque")?s.getAttribute("opaque"):"A_ONE",data:this.parseEffectParameter(s)};break}}return t}parseEffectParameter(e){const t={};for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"color":t[s.nodeName]=Wt(s.textContent);break;case"float":t[s.nodeName]=parseFloat(s.textContent);break;case"texture":t[s.nodeName]={id:s.getAttribute("texture"),extra:this.parseEffectParameterTexture(s)};break}}return t}parseEffectParameterTexture(e){const t={technique:{}};for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"extra":this.parseEffectParameterTextureExtra(s,t);break}}return t}parseEffectParameterTextureExtra(e,t){for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"technique":this.parseEffectParameterTextureExtraTechnique(s,t);break}}}parseEffectParameterTextureExtraTechnique(e,t){for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"repeatU":case"repeatV":case"offsetU":case"offsetV":t.technique[s.nodeName]=parseFloat(s.textContent);break;case"wrapU":case"wrapV":s.textContent.toUpperCase()==="TRUE"?t.technique[s.nodeName]=1:s.textContent.toUpperCase()==="FALSE"?t.technique[s.nodeName]=0:t.technique[s.nodeName]=parseInt(s.textContent);break;case"bump":t[s.nodeName]=this.parseEffectExtraTechniqueBump(s);break}}}parseEffectExtra(e){const t={};for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"technique":t.technique=this.parseEffectExtraTechnique(s);break}}return t}parseEffectExtraTechnique(e){const t={};for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"double_sided":t[s.nodeName]=parseInt(s.textContent);break;case"bump":t[s.nodeName]=this.parseEffectExtraTechniqueBump(s);break}}return t}parseEffectExtraTechniqueBump(e){const t={};for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"texture":t[s.nodeName]={id:s.getAttribute("texture"),texcoord:s.getAttribute("texcoord"),extra:this.parseEffectParameterTexture(s)};break}}return t}parseMaterial(e){const t={name:e.getAttribute("name")};for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"instance_effect":t.url=Lt(s.getAttribute("url"));break}}this.library.materials[e.getAttribute("id")]=t}parseCamera(e){const t={name:e.getAttribute("name")};for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"optics":t.optics=this.parseCameraOptics(s);break}}this.library.cameras[e.getAttribute("id")]=t}parseCameraOptics(e){for(let t=0;t<e.childNodes.length;t++){const i=e.childNodes[t];switch(i.nodeName){case"technique_common":return this.parseCameraTechnique(i)}}return{}}parseCameraTechnique(e){const t={};for(let i=0;i<e.childNodes.length;i++){const n=e.childNodes[i];switch(n.nodeName){case"perspective":case"orthographic":t.technique=n.nodeName,t.parameters=this.parseCameraParameters(n);break}}return t}parseCameraParameters(e){const t={};for(let i=0;i<e.childNodes.length;i++){const n=e.childNodes[i];switch(n.nodeName){case"xfov":case"yfov":case"xmag":case"ymag":case"znear":case"zfar":case"aspect_ratio":t[n.nodeName]=parseFloat(n.textContent);break}}return t}parseLight(e){let t={};for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"technique_common":t=this.parseLightTechnique(s);break}}this.library.lights[e.getAttribute("id")]=t}parseLightTechnique(e){const t={};for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"directional":case"point":case"spot":case"ambient":t.technique=s.nodeName,t.parameters=this.parseLightParameters(s);break}}return t}parseLightParameters(e){const t={};for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"color":const o=Wt(s.textContent);t.color=new Be().fromArray(o),Xe.colorSpaceToWorking(t.color,ht);break;case"falloff_angle":t.falloffAngle=parseFloat(s.textContent);break;case"quadratic_attenuation":const a=parseFloat(s.textContent);t.distance=a?Math.sqrt(1/a):0;break}}return t}parseGeometry(e){const t={name:e.getAttribute("name"),sources:{},vertices:{},primitives:[]},i=jt(e,"mesh")[0];if(i!==void 0){for(let n=0;n<i.childNodes.length;n++){const s=i.childNodes[n];if(s.nodeType!==1)continue;const o=s.getAttribute("id");switch(s.nodeName){case"source":t.sources[o]=this.parseSource(s);break;case"vertices":t.vertices=this.parseGeometryVertices(s);break;case"polygons":case"lines":case"linestrips":case"polylist":case"triangles":t.primitives.push(this.parseGeometryPrimitive(s));break}}this.library.geometries[e.getAttribute("id")]=t}}parseSource(e){const t={array:[],stride:3};for(let i=0;i<e.childNodes.length;i++){const n=e.childNodes[i];if(n.nodeType===1)switch(n.nodeName){case"float_array":t.array=Wt(n.textContent);break;case"Name_array":t.array=qx(n.textContent);break;case"technique_common":const s=jt(n,"accessor")[0];s!==void 0&&(t.stride=parseInt(s.getAttribute("stride")));break}}return t}parseGeometryVertices(e){const t={};for(let i=0;i<e.childNodes.length;i++){const n=e.childNodes[i];n.nodeType===1&&(t[n.getAttribute("semantic")]=Lt(n.getAttribute("source")))}return t}parseGeometryPrimitive(e){const t={type:e.nodeName,material:e.getAttribute("material"),count:parseInt(e.getAttribute("count")),inputs:{},stride:0,hasUV:!1};for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"input":const o=Lt(s.getAttribute("source")),a=s.getAttribute("semantic"),c=parseInt(s.getAttribute("offset")),l=parseInt(s.getAttribute("set")),h=l>0?a+l:a;t.inputs[h]={id:o,offset:c},t.stride=Math.max(t.stride,c+1),a==="TEXCOORD"&&(t.hasUV=!0);break;case"vcount":t.vcount=Rr(s.textContent);break;case"p":t.p=Rr(s.textContent);break}}return t.type==="polygons"&&(t.vcount=[t.p.length/t.stride]),t}parseLibraryJoint(e){this.library.joints[e.getAttribute("id")]=this.parseKinematicsJoint(e)}parseKinematicsModel(e){const t={name:e.getAttribute("name")||"",joints:{},links:[]};for(let i=0;i<e.childNodes.length;i++){const n=e.childNodes[i];if(n.nodeType===1)switch(n.nodeName){case"technique_common":this.parseKinematicsTechniqueCommon(n,t);break}}this.library.kinematicsModels[e.getAttribute("id")]=t}parseKinematicsTechniqueCommon(e,t){for(let i=0;i<e.childNodes.length;i++){const n=e.childNodes[i];if(n.nodeType===1)switch(n.nodeName){case"joint":t.joints[n.getAttribute("sid")]=this.parseKinematicsJoint(n);break;case"instance_joint":t.joints[n.getAttribute("sid")]=this.library.joints[Lt(n.getAttribute("url"))];break;case"link":t.links.push(this.parseKinematicsLink(n));break}}}parseKinematicsJoint(e){let t;for(let i=0;i<e.childNodes.length;i++){const n=e.childNodes[i];if(n.nodeType===1)switch(n.nodeName){case"prismatic":case"revolute":t=this.parseKinematicsJointParameter(n);break}}return t}parseKinematicsJointParameter(e){const t={sid:e.getAttribute("sid"),name:e.getAttribute("name")||"",axis:new D,limits:{min:0,max:0},type:e.nodeName,static:!1,zeroPosition:0,middlePosition:0};for(let i=0;i<e.childNodes.length;i++){const n=e.childNodes[i];if(n.nodeType===1)switch(n.nodeName){case"axis":const s=Wt(n.textContent);t.axis.fromArray(s);break;case"limits":const o=n.getElementsByTagName("max")[0],a=n.getElementsByTagName("min")[0];t.limits.max=parseFloat(o.textContent),t.limits.min=parseFloat(a.textContent);break}}return t.limits.min>=t.limits.max&&(t.static=!0),t.middlePosition=(t.limits.min+t.limits.max)/2,t}parseKinematicsLink(e){const t={sid:e.getAttribute("sid"),name:e.getAttribute("name")||"",attachments:[],transforms:[]};for(let i=0;i<e.childNodes.length;i++){const n=e.childNodes[i];if(n.nodeType===1)switch(n.nodeName){case"attachment_full":t.attachments.push(this.parseKinematicsAttachment(n));break;case"matrix":case"translate":case"rotate":t.transforms.push(this.parseKinematicsTransform(n));break}}return t}parseKinematicsAttachment(e){const t={joint:e.getAttribute("joint").split("/").pop(),transforms:[],links:[]};for(let i=0;i<e.childNodes.length;i++){const n=e.childNodes[i];if(n.nodeType===1)switch(n.nodeName){case"link":t.links.push(this.parseKinematicsLink(n));break;case"matrix":case"translate":case"rotate":t.transforms.push(this.parseKinematicsTransform(n));break}}return t}parseKinematicsTransform(e){const t={type:e.nodeName},i=Wt(e.textContent);switch(t.type){case"matrix":t.obj=new Oe,t.obj.fromArray(i).transpose();break;case"translate":t.obj=new D,t.obj.fromArray(i);break;case"rotate":t.obj=new D,t.obj.fromArray(i),t.angle=vi.degToRad(i[3]);break}return t}parsePhysicsModel(e){const t={name:e.getAttribute("name")||"",rigidBodies:{}};for(let i=0;i<e.childNodes.length;i++){const n=e.childNodes[i];if(n.nodeType===1)switch(n.nodeName){case"rigid_body":t.rigidBodies[n.getAttribute("name")]={},this.parsePhysicsRigidBody(n,t.rigidBodies[n.getAttribute("name")]);break}}this.library.physicsModels[e.getAttribute("id")]=t}parsePhysicsRigidBody(e,t){for(let i=0;i<e.childNodes.length;i++){const n=e.childNodes[i];if(n.nodeType===1)switch(n.nodeName){case"technique_common":this.parsePhysicsTechniqueCommon(n,t);break}}}parsePhysicsTechniqueCommon(e,t){for(let i=0;i<e.childNodes.length;i++){const n=e.childNodes[i];if(n.nodeType===1)switch(n.nodeName){case"inertia":t.inertia=Wt(n.textContent);break;case"mass":t.mass=Wt(n.textContent)[0];break}}}parseKinematicsScene(e){const t={bindJointAxis:[]};for(let i=0;i<e.childNodes.length;i++){const n=e.childNodes[i];if(n.nodeType===1)switch(n.nodeName){case"bind_joint_axis":t.bindJointAxis.push(this.parseKinematicsBindJointAxis(n));break}}this.library.kinematicsScenes[Lt(e.getAttribute("url"))]=t}parseKinematicsBindJointAxis(e){const t={target:e.getAttribute("target").split("/").pop()};for(let i=0;i<e.childNodes.length;i++){const n=e.childNodes[i];if(n.nodeType===1)switch(n.nodeName){case"axis":const s=n.getElementsByTagName("param")[0];t.axis=s.textContent;const o=t.axis.split("inst_").pop().split("axis")[0];t.jointIndex=o.substring(0,o.length-1);break}}return t}prepareNodes(e){const t=e.getElementsByTagName("node");for(let i=0;i<t.length;i++){const n=t[i];n.hasAttribute("id")===!1&&n.setAttribute("id",this.generateId())}}parseNode(e){const t=new Oe,i=new D,n={name:e.getAttribute("name")||"",type:e.getAttribute("type"),id:e.getAttribute("id"),sid:e.getAttribute("sid"),matrix:new Oe,nodes:[],instanceCameras:[],instanceControllers:[],instanceLights:[],instanceGeometries:[],instanceNodes:[],transforms:{},transformData:{},transformOrder:[]};for(let s=0;s<e.childNodes.length;s++){const o=e.childNodes[s];if(o.nodeType!==1)continue;let a;switch(o.nodeName){case"node":n.nodes.push(o.getAttribute("id")),this.parseNode(o);break;case"instance_camera":n.instanceCameras.push(Lt(o.getAttribute("url")));break;case"instance_controller":n.instanceControllers.push(this.parseNodeInstance(o));break;case"instance_light":n.instanceLights.push(Lt(o.getAttribute("url")));break;case"instance_geometry":n.instanceGeometries.push(this.parseNodeInstance(o));break;case"instance_node":n.instanceNodes.push(Lt(o.getAttribute("url")));break;case"matrix":a=Wt(o.textContent),n.matrix.multiply(t.fromArray(a).transpose());{const c=o.getAttribute("sid");n.transforms[c]=o.nodeName,n.transformData[c]={type:"matrix",array:a},n.transformOrder.push(c)}break;case"translate":a=Wt(o.textContent),i.fromArray(a),n.matrix.multiply(t.makeTranslation(i.x,i.y,i.z));{const c=o.getAttribute("sid");n.transforms[c]=o.nodeName,n.transformData[c]={type:"translate",x:a[0],y:a[1],z:a[2]},n.transformOrder.push(c)}break;case"rotate":a=Wt(o.textContent);{const c=vi.degToRad(a[3]);n.matrix.multiply(t.makeRotationAxis(i.fromArray(a),c));const l=o.getAttribute("sid");n.transforms[l]=o.nodeName,n.transformData[l]={type:"rotate",axis:[a[0],a[1],a[2]],angle:a[3]},n.transformOrder.push(l)}break;case"scale":a=Wt(o.textContent),n.matrix.scale(i.fromArray(a));{const c=o.getAttribute("sid");n.transforms[c]=o.nodeName,n.transformData[c]={type:"scale",x:a[0],y:a[1],z:a[2]},n.transformOrder.push(c)}break}}return this.hasNode(n.id)?console.warn("THREE.ColladaLoader: There is already a node with ID %s. Exclude current node from further processing.",n.id):this.library.nodes[n.id]=n,n}parseNodeInstance(e){const t={id:Lt(e.getAttribute("url")),materials:{},skeletons:[]};for(let i=0;i<e.childNodes.length;i++){const n=e.childNodes[i];switch(n.nodeName){case"bind_material":const s=n.getElementsByTagName("instance_material");for(let o=0;o<s.length;o++){const a=s[o],c=a.getAttribute("symbol"),l=a.getAttribute("target");t.materials[c]=Lt(l)}break;case"skeleton":t.skeletons.push(Lt(n.textContent));break}}return t}parseVisualScene(e){const t={name:e.getAttribute("name"),children:[]};this.prepareNodes(e);const i=jt(e,"node");for(let n=0;n<i.length;n++)t.children.push(this.parseNode(i[n]));this.library.visualScenes[e.getAttribute("id")]=t}hasNode(e){return this.library.nodes[e]!==void 0}}class Yx{constructor(e,t,i,n){this.library=e,this.collada=t,this.textureLoader=i,this.tgaLoader=n,this.tempColor=new Be,this.animations=[],this.kinematics={},this.position=new D,this.scale=new D,this.quaternion=new Nt,this.matrix=new Oe,this.deferredPivotAnimations={},this.transformNodes={}}compose(){const e=this.library;this.buildLibrary(e.animations,this.buildAnimation.bind(this)),this.buildLibrary(e.clips,this.buildAnimationClip.bind(this)),this.buildLibrary(e.controllers,this.buildController.bind(this)),this.buildLibrary(e.images,this.buildImage.bind(this)),this.buildLibrary(e.effects,this.buildEffect.bind(this)),this.buildLibrary(e.materials,this.buildMaterial.bind(this)),this.buildLibrary(e.cameras,this.buildCamera.bind(this)),this.buildLibrary(e.lights,this.buildLight.bind(this)),this.buildLibrary(e.geometries,this.buildGeometry.bind(this)),this.buildLibrary(e.visualScenes,this.buildVisualScene.bind(this)),this.setupAnimations(),this.setupKinematics();const t=this.parseScene(jt(this.collada,"scene")[0]);return t.animations=this.animations,{scene:t,animations:this.animations,kinematics:this.kinematics}}buildLibrary(e,t){for(const i in e){const n=e[i];n.build=t(e[i])}}getBuild(e,t){return e.build!==void 0||(e.build=t(e)),e.build}isEmpty(e){return Object.keys(e).length===0}buildAnimation(e){const t=[],i=e.channels,n=e.samplers,s=e.sources,o=this.aggregateAnimationChannels(i,n,s);for(const a in o){const c=this.library.nodes[a];if(!c)continue;const l=o[a];if(this.hasPivotTransforms(c))this.collectDeferredPivotAnimation(a,l);else{const h=this.getNode(a);let d=!1;for(const u in l){const f=c.transforms[u],g=c.transformData[u],v=l[u];switch(f){case"matrix":this.buildMatrixTracks(h,v,c,t);break;case"translate":this.buildTranslateTrack(h,v,g,t);break;case"rotate":d||(this.buildRotateTrack(h,u,v,g,c,t),d=!0);break;case"scale":this.buildScaleTrack(h,v,g,t);break}}}}return t}collectDeferredPivotAnimation(e,t){this.deferredPivotAnimations[e]||(this.deferredPivotAnimations[e]={});const i=this.deferredPivotAnimations[e];for(const n in t){i[n]||(i[n]={});for(const s in t[n])i[n][s]=t[n][s]}}hasPivotTransforms(e){const t=["rotatePivot","rotatePivotInverse","rotatePivotTranslation","scalePivot","scalePivotInverse","scalePivotTranslation"];for(const i of t)if(e.transforms[i]!==void 0)return!0;return!1}getAnimation(e){return this.getBuild(this.library.animations[e],this.buildAnimation.bind(this))}aggregateAnimationChannels(e,t,i){const n={};for(const s in e){if(!e.hasOwnProperty(s))continue;const o=e[s],a=t[o.sampler],c=a.inputs.INPUT,l=a.inputs.OUTPUT,h=i[c],d=i[l],u=a.inputs.INTERPOLATION,f=a.inputs.IN_TANGENT,g=a.inputs.OUT_TANGENT,v=u?i[u]:null,m=f?i[f]:null,p=g?i[g]:null,E=o.id,b=o.sid,x=o.member||"default";n[E]||(n[E]={}),n[E][b]||(n[E][b]={}),n[E][b][x]={times:h.array,values:d.array,stride:d.stride,arraySyntax:o.arraySyntax,indices:o.indices,interpolation:v?v.array:null,inTangent:m?m.array:null,outTangent:p?p.array:null,inTangentStride:m?m.stride:0,outTangentStride:p?p.stride:0}}return n}buildMatrixTracks(e,t,i,n){const s=i.matrix.clone().transpose(),o={};for(const l in t){const h=t[l],d=h.times,u=h.values,f=h.stride;for(let g=0,v=d.length;g<v;g++){const m=d[g],p=g*f;if(o[m]===void 0&&(o[m]={}),h.arraySyntax===!0){const E=u[p],b=h.indices[0]+4*h.indices[1];o[m][b]=E}else for(let E=0;E<f;E++)o[m][E]=u[p+E]}}const a=this.prepareAnimationData(o,s),c={name:e.uuid,keyframes:a};this.createKeyframeTracks(c,n)}buildTranslateTrack(e,t,i,n){if(t.default&&t.default.stride===3){const l=t.default,h=Array.from(l.times),d=Array.from(l.values),u=new si(e.uuid+".position",h,d),f=this.getInterpolationInfo(t);this.applyInterpolation(u,f,t),n.push(u);return}const s=this.getTimesForAllAxes(t);if(s.length===0)return;const o=[],a=this.getInterpolationInfo(t);for(let l=0;l<s.length;l++){const h=s[l],d=this.getValueAtTime(t.X,h,i.x),u=this.getValueAtTime(t.Y,h,i.y),f=this.getValueAtTime(t.Z,h,i.z);o.push(d,u,f)}const c=new si(e.uuid+".position",s,o);this.applyInterpolation(c,a),n.push(c)}buildRotateTrack(e,t,i,n,s,o){const a=i.ANGLE||i.default;if(!a)return;const c=Array.from(a.times);if(c.length===0)return;const l=[];for(const m of s.transformOrder)if(s.transforms[m]==="rotate"){const E=s.transformData[m];l.push({sid:m,axis:new D(E.axis[0],E.axis[1],E.axis[2]),defaultAngle:E.angle})}const h=new Nt,d=new Nt,u=new Nt,f=[],g=this.getInterpolationInfo(i);for(let m=0;m<c.length;m++){const p=c[m];h.identity();for(const E of l){let b;E.sid===t?b=this.getValueAtTime(a,p,E.defaultAngle):b=E.defaultAngle;const x=vi.degToRad(b);u.setFromAxisAngle(E.axis,x),h.multiply(u)}m>0&&d.dot(h)<0&&(h.x=-h.x,h.y=-h.y,h.z=-h.z,h.w=-h.w),d.copy(h),f.push(h.x,h.y,h.z,h.w)}const v=new ts(e.uuid+".quaternion",c,f);this.applyInterpolation(v,g),o.push(v)}buildScaleTrack(e,t,i,n){if(t.default&&t.default.stride===3){const l=t.default,h=Array.from(l.times),d=Array.from(l.values),u=new si(e.uuid+".scale",h,d),f=this.getInterpolationInfo(t);this.applyInterpolation(u,f,t),n.push(u);return}const s=this.getTimesForAllAxes(t);if(s.length===0)return;const o=[],a=this.getInterpolationInfo(t);for(let l=0;l<s.length;l++){const h=s[l],d=this.getValueAtTime(t.X,h,i.x),u=this.getValueAtTime(t.Y,h,i.y),f=this.getValueAtTime(t.Z,h,i.z);o.push(d,u,f)}const c=new si(e.uuid+".scale",s,o);this.applyInterpolation(c,a),n.push(c)}getTimesForAllAxes(e){let t=[];return e.X&&(t=t.concat(Array.from(e.X.times))),e.Y&&(t=t.concat(Array.from(e.Y.times))),e.Z&&(t=t.concat(Array.from(e.Z.times))),e.ANGLE&&(t=t.concat(Array.from(e.ANGLE.times))),e.default&&(t=t.concat(Array.from(e.default.times))),t=[...new Set(t)].sort((i,n)=>i-n),t}getValueAtTime(e,t,i){if(!e)return i;const n=e.times,s=e.values,o=e.interpolation;for(let a=0;a<n.length;a++){if(n[a]===t)return s[a];if(n[a]>t){if(a===0)return s[0];const c=a-1,l=a,h=n[c],d=n[l],u=s[c],f=s[l],g=o?o[c]:"LINEAR";if(g==="STEP")return u;if(g==="BEZIER"&&e.inTangent&&e.outTangent)return this.evaluateBezierComponent(e,c,l,h,d,t);{const v=(t-h)/(d-h);return u+v*(f-u)}}}return s[s.length-1]}evaluateBezierComponent(e,t,i,n,s,o){const a=e.values,c=e.inTangent,l=e.outTangent,h=e.inTangentStride||1,d=a[t],u=a[i];let f,g,v,m;h===2?(f=l[t*2],g=l[t*2+1],v=c[i*2],m=c[i*2+1]):(f=n+(s-n)/3,g=l[t],v=s-(s-n)/3,m=c[i]);let p=(o-n)/(s-n);for(let A=0;A<8;A++){const _=p*p,S=_*p,R=1-p,C=R*R,B=C*R*n+3*C*p*f+3*R*_*v+S*s,X=3*C*(f-n)+6*R*p*(v-f)+3*_*(s-v);if(Math.abs(X)<1e-10)break;const U=B-o;if(Math.abs(U)<1e-10)break;p=p-U/X,p=Math.max(0,Math.min(1,p))}const E=p*p,b=E*p,x=1-p,M=x*x;return M*x*d+3*M*p*g+3*x*E*m+b*u}getInterpolationInfo(e){const t=["X","Y","Z","ANGLE","default"];let i=null,n=!0;for(const s of t){const o=e[s];if(!o||!o.interpolation)continue;const a=o.interpolation;for(let c=0;c<a.length;c++){const l=a[c];i===null?i=l:l!==i&&(n=!1)}}return{type:i||"LINEAR",uniform:n}}applyInterpolation(e,t,i=null){if(t.type==="STEP"&&t.uniform)e.setInterpolation(zs);else if(t.type==="BEZIER"&&t.uniform&&i){const n=i.default;n&&n.inTangent&&n.outTangent&&(e.setInterpolation(nl),e.settings={inTangents:new Float32Array(n.inTangent),outTangents:new Float32Array(n.outTangent)})}}prepareAnimationData(e,t){const i=[];for(const n in e)i.push({time:parseFloat(n),value:e[n]});i.sort((n,s)=>n.time-s.time);for(let n=0;n<16;n++)this.transformAnimationData(i,n,t.elements[n]);return i}createKeyframeTracks(e,t){const i=e.keyframes,n=e.name,s=[],o=[],a=[],c=[],l=this.position,h=this.quaternion,d=this.scale,u=this.matrix;for(let f=0,g=i.length;f<g;f++){const v=i[f],m=v.time,p=v.value;u.fromArray(p).transpose(),u.decompose(l,h,d),s.push(m),o.push(l.x,l.y,l.z),a.push(h.x,h.y,h.z,h.w),c.push(d.x,d.y,d.z)}return o.length>0&&t.push(new si(n+".position",s,o)),a.length>0&&t.push(new ts(n+".quaternion",s,a)),c.length>0&&t.push(new si(n+".scale",s,c)),t}transformAnimationData(e,t,i){let n,s=!0,o,a;for(o=0,a=e.length;o<a;o++)n=e[o],n.value[t]===void 0?n.value[t]=null:s=!1;if(s===!0)for(o=0,a=e.length;o<a;o++)n=e[o],n.value[t]=i;else this.createMissingKeyframes(e,t)}createMissingKeyframes(e,t){let i,n;for(let s=0,o=e.length;s<o;s++){const a=e[s];if(a.value[t]===null){if(i=this.getPrev(e,s,t),n=this.getNext(e,s,t),i===null){a.value[t]=n.value[t];continue}if(n===null){a.value[t]=i.value[t];continue}this.interpolate(a,i,n,t)}}}getPrev(e,t,i){for(;t>=0;){const n=e[t];if(n.value[i]!==null)return n;t--}return null}getNext(e,t,i){for(;t<e.length;){const n=e[t];if(n.value[i]!==null)return n;t++}return null}interpolate(e,t,i,n){if(i.time-t.time===0){e.value[n]=t.value[n];return}e.value[n]=(e.time-t.time)*(i.value[n]-t.value[n])/(i.time-t.time)+t.value[n]}buildAnimationClip(e){const t=[],i=e.name,n=e.end-e.start||-1,s=e.animations;for(let o=0,a=s.length;o<a;o++){const c=this.getAnimation(s[o]);for(let l=0,h=c.length;l<h;l++)t.push(c[l])}return new zc(i,n,t)}getAnimationClip(e){return this.getBuild(this.library.clips[e],this.buildAnimationClip.bind(this))}buildController(e){const t={id:e.id},i=this.library.geometries[t.id];return e.skin!==void 0&&(t.skin=this.buildSkin(e.skin),i.sources.skinIndices=t.skin.indices,i.sources.skinWeights=t.skin.weights),t}buildSkin(e){const i={joints:[],indices:{array:[],stride:4},weights:{array:[],stride:4}},n=e.sources,s=e.vertexWeights,o=s.vcount,a=s.v,c=s.inputs.JOINT.offset,l=s.inputs.WEIGHT.offset,h=e.sources[e.joints.inputs.JOINT],d=e.sources[e.joints.inputs.INV_BIND_MATRIX],u=n[s.inputs.WEIGHT.id].array;let f=0,g,v,m;for(g=0,m=o.length;g<m;g++){const E=o[g],b=[];for(v=0;v<E;v++){const x=a[f+c],M=a[f+l],T=u[M];b.push({index:x,weight:T}),f+=2}for(b.sort(p),v=0;v<4;v++){const x=b[v];x!==void 0?(i.indices.array.push(x.index),i.weights.array.push(x.weight)):(i.indices.array.push(0),i.weights.array.push(0))}}for(e.bindShapeMatrix?i.bindMatrix=new Oe().fromArray(e.bindShapeMatrix).transpose():i.bindMatrix=new Oe().identity(),g=0,m=h.array.length;g<m;g++){const E=h.array[g],b=new Oe().fromArray(d.array,g*d.stride).transpose();i.joints.push({name:E,boneInverse:b})}return i;function p(E,b){return b.weight-E.weight}}getController(e){return this.getBuild(this.library.controllers[e],this.buildController.bind(this))}buildImage(e){return e.build!==void 0?e.build:e.init_from}getImage(e){const t=this.library.images[e];return t!==void 0?this.getBuild(t,this.buildImage.bind(this)):(console.warn("THREE.ColladaLoader: Couldn't find image with ID:",e),null)}buildEffect(e){return e}getEffect(e){return this.getBuild(this.library.effects[e],this.buildEffect.bind(this))}getTextureLoader(e){let t,i=e.slice((e.lastIndexOf(".")-1>>>0)+2);switch(i=i.toLowerCase(),i){case"tga":t=this.tgaLoader;break;default:t=this.textureLoader}return t}buildMaterial(e){const t=this.getEffect(e.url),i=t.profile.technique;let n;switch(i.type){case"phong":case"blinn":n=new Us;break;case"lambert":n=new up;break;default:n=new os;break}n.name=e.name||"";const s=this;function o(h,d=null){const u=t.profile.samplers[h.id];let f=null;if(u!==void 0){const g=t.profile.surfaces[u.source];f=s.getImage(g.init_from)}else console.warn("THREE.ColladaLoader: Undefined sampler. Access image directly (see #12530)."),f=s.getImage(h.id);if(f!==null){const g=s.getTextureLoader(f);if(g!==void 0){const v=g.load(f),m=h.extra;if(m!==void 0&&m.technique!==void 0&&s.isEmpty(m.technique)===!1){const p=m.technique;v.wrapS=p.wrapU?yn:ei,v.wrapT=p.wrapV?yn:ei,v.offset.set(p.offsetU||0,p.offsetV||0),v.repeat.set(p.repeatU||1,p.repeatV||1)}else v.wrapS=yn,v.wrapT=yn;return d!==null&&(v.colorSpace=d),v}else return console.warn("THREE.ColladaLoader: Loader for texture %s not found.",f),null}else return console.warn("THREE.ColladaLoader: Couldn't create texture with ID:",h.id),null}const a=i.parameters;for(const h in a){const d=a[h];switch(h){case"diffuse":d.color&&n.color.fromArray(d.color),d.texture&&(n.map=o(d.texture,ht));break;case"specular":d.color&&n.specular&&n.specular.fromArray(d.color),d.texture&&(n.specularMap=o(d.texture));break;case"bump":d.texture&&(n.normalMap=o(d.texture));break;case"ambient":d.texture&&(n.lightMap=o(d.texture,ht));break;case"shininess":d.float&&n.shininess&&(n.shininess=d.float);break;case"emission":d.color&&n.emissive&&n.emissive.fromArray(d.color),d.texture&&(n.emissiveMap=o(d.texture,ht));break}}Xe.colorSpaceToWorking(n.color,ht),n.specular&&Xe.colorSpaceToWorking(n.specular,ht),n.emissive&&Xe.colorSpaceToWorking(n.emissive,ht);let c=a.transparent,l=a.transparency;if(l===void 0&&c&&(l={float:1}),c===void 0&&l&&(c={opaque:"A_ONE",data:{color:[1,1,1,1]}}),c&&l)if(c.data.texture)n.transparent=!0;else{const h=c.data.color;switch(c.opaque){case"A_ONE":n.opacity=h[3]*l.float;break;case"RGB_ZERO":n.opacity=1-h[0]*l.float;break;case"A_ZERO":n.opacity=1-h[3]*l.float;break;case"RGB_ONE":n.opacity=h[0]*l.float;break;default:console.warn('THREE.ColladaLoader: Invalid opaque type "%s" of transparent tag.',c.opaque)}n.opacity<1&&(n.transparent=!0)}if(i.extra!==void 0&&i.extra.technique!==void 0){const h=i.extra.technique;for(const d in h){const u=h[d];switch(d){case"double_sided":n.side=u===1?bi:Oi;break;case"bump":n.normalMap=o(u.texture),n.normalScale=new Ue(1,1);break}}}return n}getMaterial(e){return this.getBuild(this.library.materials[e],this.buildMaterial.bind(this))}buildCamera(e){let t;switch(e.optics.technique){case"perspective":t=new It(e.optics.parameters.yfov,e.optics.parameters.aspect_ratio,e.optics.parameters.znear,e.optics.parameters.zfar);break;case"orthographic":let i=e.optics.parameters.ymag,n=e.optics.parameters.xmag;const s=e.optics.parameters.aspect_ratio;n=n===void 0?i*s:n,i=i===void 0?n/s:i,n*=.5,i*=.5,t=new mo(-n,n,i,-i,e.optics.parameters.znear,e.optics.parameters.zfar);break;default:t=new It;break}return t.name=e.name||"",t}getCamera(e){const t=this.library.cameras[e];return t!==void 0?this.getBuild(t,this.buildCamera.bind(this)):(console.warn("THREE.ColladaLoader: Couldn't find camera with ID:",e),null)}buildLight(e){let t;switch(e.technique){case"directional":t=new Eu;break;case"point":t=new Pp;break;case"spot":t=new Rp;break;case"ambient":t=new Np;break}return e.parameters.color&&t.color.copy(e.parameters.color),e.parameters.distance&&(t.distance=e.parameters.distance),e.parameters.falloffAngle&&(t.angle=vi.degToRad(e.parameters.falloffAngle)),t}getLight(e){const t=this.library.lights[e];return t!==void 0?this.getBuild(t,this.buildLight.bind(this)):(console.warn("THREE.ColladaLoader: Couldn't find light with ID:",e),null)}groupPrimitives(e){const t={};for(let i=0;i<e.length;i++){const n=e[i];t[n.type]===void 0&&(t[n.type]=[]),t[n.type].push(n)}return t}checkUVCoordinates(e){let t=0;for(let i=0,n=e.length;i<n;i++)e[i].hasUV===!0&&t++;t>0&&t<e.length&&(e.uvsNeedsFix=!0)}buildGeometry(e){const t={},i=e.sources,n=e.vertices,s=e.primitives;if(s.length===0)return{};const o=this.groupPrimitives(s);for(const a in o){const c=o[a];this.checkUVCoordinates(c),t[a]=this.buildGeometryType(c,i,n)}return t}buildGeometryType(e,t,i){const n={},s={array:[],stride:0},o={array:[],stride:0},a={array:[],stride:0},c={array:[],stride:0},l={array:[],stride:0},h={array:[],stride:4},d={array:[],stride:4},u=new wt,f=[];let g=0;for(let v=0;v<e.length;v++){const m=e[v],p=m.inputs;let E=0;switch(m.type){case"lines":case"linestrips":E=m.count*2;break;case"triangles":E=m.count*3;break;case"polygons":case"polylist":for(let b=0;b<m.count;b++){const x=m.vcount[b];switch(x){case 3:E+=3;break;case 4:E+=6;break;default:E+=(x-2)*3;break}}break;default:console.warn("THREE.ColladaLoader: Unknown primitive type:",m.type)}u.addGroup(g,E,v),g+=E,m.material&&f.push(m.material);for(const b in p){const x=p[b];switch(b){case"VERTEX":for(const M in i){const T=i[M];switch(M){case"POSITION":const A=s.array.length;if(this.buildGeometryData(m,t[T],x.offset,s.array),s.stride=t[T].stride,t.skinWeights&&t.skinIndices&&(this.buildGeometryData(m,t.skinIndices,x.offset,h.array),this.buildGeometryData(m,t.skinWeights,x.offset,d.array)),m.hasUV===!1&&e.uvsNeedsFix===!0){const _=(s.array.length-A)/s.stride;for(let S=0;S<_;S++)a.array.push(0,0)}break;case"NORMAL":this.buildGeometryData(m,t[T],x.offset,o.array),o.stride=t[T].stride;break;case"COLOR":this.buildGeometryData(m,t[T],x.offset,l.array),l.stride=t[T].stride;break;case"TEXCOORD":this.buildGeometryData(m,t[T],x.offset,a.array),a.stride=t[T].stride;break;case"TEXCOORD1":this.buildGeometryData(m,t[T],x.offset,c.array),a.stride=t[T].stride;break;default:console.warn('THREE.ColladaLoader: Semantic "%s" not handled in geometry build process.',M)}}break;case"NORMAL":this.buildGeometryData(m,t[x.id],x.offset,o.array),o.stride=t[x.id].stride;break;case"COLOR":this.buildGeometryData(m,t[x.id],x.offset,l.array,!0),l.stride=t[x.id].stride;break;case"TEXCOORD":this.buildGeometryData(m,t[x.id],x.offset,a.array),a.stride=t[x.id].stride;break;case"TEXCOORD1":this.buildGeometryData(m,t[x.id],x.offset,c.array),c.stride=t[x.id].stride;break}}}return s.array.length>0&&u.setAttribute("position",new je(s.array,s.stride)),o.array.length>0&&u.setAttribute("normal",new je(o.array,o.stride)),l.array.length>0&&u.setAttribute("color",new je(l.array,l.stride)),a.array.length>0&&u.setAttribute("uv",new je(a.array,a.stride)),c.array.length>0&&u.setAttribute("uv1",new je(c.array,c.stride)),h.array.length>0&&u.setAttribute("skinIndex",new je(h.array,h.stride)),d.array.length>0&&u.setAttribute("skinWeight",new je(d.array,d.stride)),n.data=u,n.type=e[0].type,n.materialKeys=f,n}buildGeometryData(e,t,i,n,s=!1){const o=e.p,a=e.stride,c=e.vcount,l=this.tempColor;function h(f){let g=o[f+i]*u;const v=g+u;for(;g<v;g++)n.push(d[g]);if(s){const m=n.length-u-1;l.setRGB(n[m+0],n[m+1],n[m+2],ht),n[m+0]=l.r,n[m+1]=l.g,n[m+2]=l.b}}const d=t.array,u=t.stride;if(e.vcount!==void 0){let f=0;for(let g=0,v=c.length;g<v;g++){const m=c[g];if(m===4){const p=f+a*0,E=f+a*1,b=f+a*2,x=f+a*3;h(p),h(E),h(x),h(E),h(b),h(x)}else if(m===3){const p=f+a*0,E=f+a*1,b=f+a*2;h(p),h(E),h(b)}else if(m>4){const p=[];for(let A=0;A<m;A++){const _=f+a*A,S=o[_]*u,R=d[S],C=d[S+1],L=d[S+2];p.push(new D(R,C,L))}const E=new D,b=new ri;b.a=p[0],b.b=p[1],b.c=p[2],b.getNormal(E);const x=[];if(Math.abs(E.x)>Math.abs(E.y)&&Math.abs(E.x)>Math.abs(E.z))for(let A=0;A<m;A++)x.push(new Ue(p[A].y,p[A].z));else if(Math.abs(E.y)>Math.abs(E.z))for(let A=0;A<m;A++)x.push(new Ue(p[A].x,p[A].z));else for(let A=0;A<m;A++)x.push(new Ue(p[A].x,p[A].y));const M=jr.isClockWise(x);M===!0&&x.reverse();const T=jr.triangulateShape(x,[]);for(let A=0;A<T.length;A++){const _=T[A];let S,R,C;M===!1?(S=_[0],R=_[1],C=_[2]):(S=m-1-_[0],R=m-1-_[2],C=m-1-_[1]);const L=f+a*S,B=f+a*R,X=f+a*C;h(L),h(B),h(X)}}f+=a*m}}else for(let f=0,g=o.length;f<g;f+=a)h(f)}getGeometry(e){return this.getBuild(this.library.geometries[e],this.buildGeometry.bind(this))}buildKinematicsModel(e){return e.build!==void 0?e.build:e}getKinematicsModel(e){return this.getBuild(this.library.kinematicsModels[e],this.buildKinematicsModel.bind(this))}buildKinematicsScene(e){return e.build!==void 0?e.build:e}getKinematicsScene(e){return this.getBuild(this.library.kinematicsScenes[e],this.buildKinematicsScene.bind(this))}setupKinematics(){const e=Object.keys(this.library.kinematicsModels)[0],t=Object.keys(this.library.kinematicsScenes)[0],i=Object.keys(this.library.visualScenes)[0];if(e===void 0||t===void 0)return;const n=this.getKinematicsModel(e),s=this.getKinematicsScene(t),o=this.getVisualScene(i),a=s.bindJointAxis,c={},l=this.collada,h=this;for(let g=0,v=a.length;g<v;g++){const m=a[g],p=l.querySelector('[sid="'+m.target+'"]');if(p){const E=p.parentElement;d(m.jointIndex,E)}}function d(g,v){const m=v.getAttribute("name"),p=n.joints[g],E=h.buildTransformList(v);o.traverse(function(b){b.name===m&&(c[g]={object:b,transforms:E,joint:p,position:p.zeroPosition})})}const u=new Oe,f=this.matrix;this.kinematics={joints:n&&n.joints,getJointValue:function(g){const v=c[g];if(v)return v.position;console.warn("THREE.ColladaLoader: Joint "+g+" doesn't exist.")},setJointValue:function(g,v){const m=c[g];if(m){const p=m.joint;if(v>p.limits.max||v<p.limits.min)console.warn("THREE.ColladaLoader: Joint "+g+" value "+v+" outside of limits (min: "+p.limits.min+", max: "+p.limits.max+").");else if(p.static)console.warn("THREE.ColladaLoader: Joint "+g+" is static.");else{const E=m.object,b=p.axis,x=m.transforms;f.identity();for(let M=0;M<x.length;M++){const T=x[M];if(T.sid&&T.sid.indexOf(g)!==-1)switch(p.type){case"revolute":f.multiply(u.makeRotationAxis(b,vi.degToRad(v)));break;case"prismatic":f.multiply(u.makeTranslation(b.x*v,b.y*v,b.z*v));break;default:console.warn("THREE.ColladaLoader: Unknown joint type: "+p.type);break}else switch(T.type){case"matrix":f.multiply(T.obj);break;case"translate":f.multiply(u.makeTranslation(T.obj.x,T.obj.y,T.obj.z));break;case"scale":f.scale(T.obj);break;case"rotate":f.multiply(u.makeRotationAxis(T.obj,T.angle));break}}E.matrix.copy(f),E.matrix.decompose(E.position,E.quaternion,E.scale),c[g].position=v}}else console.warn("THREE.ColladaLoader: Joint "+g+" does not exist.")}}}buildTransformList(e){const t=[],i=this.collada.querySelector('[id="'+e.id+'"]');for(let n=0;n<i.childNodes.length;n++){const s=i.childNodes[n];if(s.nodeType!==1)continue;let o,a;switch(s.nodeName){case"matrix":o=Wt(s.textContent);const c=new Oe().fromArray(o).transpose();t.push({sid:s.getAttribute("sid"),type:s.nodeName,obj:c});break;case"translate":case"scale":o=Wt(s.textContent),a=new D().fromArray(o),t.push({sid:s.getAttribute("sid"),type:s.nodeName,obj:a});break;case"rotate":o=Wt(s.textContent),a=new D().fromArray(o);const l=vi.degToRad(o[3]);t.push({sid:s.getAttribute("sid"),type:s.nodeName,obj:a,angle:l});break}}return t}buildSkeleton(e,t){const i=[],n=[];let s,o,a;for(s=0;s<e.length;s++){const h=e[s];let d;if(this.hasNode(h))d=this.getNode(h),this.buildBoneHierarchy(d,t,i);else if(this.hasVisualScene(h)){const f=this.library.visualScenes[h].children;for(let g=0;g<f.length;g++){const v=f[g];if(v.type==="JOINT"){const m=this.getNode(v.id);this.buildBoneHierarchy(m,t,i)}}}else console.error("THREE.ColladaLoader: Unable to find root bone of skeleton with ID:",h)}for(s=0;s<t.length;s++)for(o=0;o<i.length;o++)if(a=i[o],a.bone.name===t[s].name){n[s]=a,a.processed=!0;break}for(s=0;s<i.length;s++)a=i[s],a.processed===!1&&(n.push(a),a.processed=!0);const c=[],l=[];for(s=0;s<n.length;s++)a=n[s],c.push(a.bone),l.push(a.boneInverse);return new Ml(c,l)}buildBoneHierarchy(e,t,i){e.traverse(function(n){if(n.isBone===!0){let s;for(let o=0;o<t.length;o++){const a=t[o];if(a.name===n.name){s=a.boneInverse;break}}s===void 0&&(s=new Oe),i.push({bone:n,boneInverse:s,processed:!1})}})}buildNode(e){const t=[],i=e.matrix,n=e.nodes,s=e.type,o=e.instanceCameras,a=e.instanceControllers,c=e.instanceLights,l=e.instanceGeometries,h=e.instanceNodes;for(let u=0,f=n.length;u<f;u++)t.push(this.getNode(n[u]));for(let u=0,f=o.length;u<f;u++){const g=this.getCamera(o[u]);g!==null&&t.push(g.clone())}for(let u=0,f=a.length;u<f;u++){const g=a[u],v=this.getController(g.id),m=this.getGeometry(v.id),p=this.buildObjects(m,g.materials),E=g.skeletons,b=v.skin.joints,x=this.buildSkeleton(E,b);for(let M=0,T=p.length;M<T;M++){const A=p[M];A.isSkinnedMesh&&(A.bind(x,v.skin.bindMatrix),A.normalizeSkinWeights()),t.push(A)}}for(let u=0,f=c.length;u<f;u++){const g=this.getLight(c[u]);g!==null&&t.push(g.clone())}for(let u=0,f=l.length;u<f;u++){const g=l[u],v=this.getGeometry(g.id),m=this.buildObjects(v,g.materials);for(let p=0,E=m.length;p<E;p++)t.push(m[p])}for(let u=0,f=h.length;u<f;u++)t.push(this.getNode(h[u]).clone());let d;if(n.length===0&&t.length===1)d=t[0];else{d=s==="JOINT"?new uu:new en;for(let u=0;u<t.length;u++)d.add(t[u])}return d.name=s==="JOINT"?e.sid:e.name,s!=="JOINT"&&this.hasPivotTransforms(e)?this.wrapWithTransformHierarchy(d,e):(d.matrix.copy(i),d.matrix.decompose(d.position,d.quaternion,d.scale),d)}wrapWithTransformHierarchy(e,t){const i=t.id;this.transformNodes[i]={};const n=t.transformOrder,s=t.transformData,o=new en;o.name=t.name;let a=o;for(let c=0;c<n.length;c++){const l=n[c],h=s[l],d=new en;switch(d.name=t.name+"_"+l,h.type){case"translate":d.position.set(h.x,h.y,h.z);break;case"rotate":{const u=new D(h.axis[0],h.axis[1],h.axis[2]),f=vi.degToRad(h.angle);d.quaternion.setFromAxisAngle(u,f),d.userData.rotationAxis=u;break}case"scale":d.scale.set(h.x,h.y,h.z);break;case"matrix":{new Oe().fromArray(h.array).transpose().decompose(d.position,d.quaternion,d.scale);break}}this.transformNodes[i][l]=d,a.add(d),a=d}return a.add(e),o}resolveMaterialBinding(e,t){const i=[];for(let n=0,s=e.length;n<s;n++){const o=t[e[n]];o===void 0?(console.warn("THREE.ColladaLoader: Material with key %s not found. Apply fallback material.",e[n]),i.push(this.fallbackMaterial)):i.push(this.getMaterial(o))}return i}get fallbackMaterial(){return this._fallbackMaterial===void 0&&(this._fallbackMaterial=new os({name:on.DEFAULT_MATERIAL_NAME,color:16711935})),this._fallbackMaterial}buildObjects(e,t){const i=[];for(const n in e){const s=e[n],o=this.resolveMaterialBinding(s.materialKeys,t);if(o.length===0&&(n==="lines"||n==="linestrips"?o.push(new En):o.push(new Us)),n==="lines"||n==="linestrips")for(let h=0,d=o.length;h<d;h++){const u=o[h];if(u.isMeshPhongMaterial===!0||u.isMeshLambertMaterial===!0){const f=new En;f.color.copy(u.color),f.opacity=u.opacity,f.transparent=u.transparent,o[h]=f}}const a=s.data.attributes.skinIndex!==void 0,c=o.length===1?o[0]:o;let l;switch(n){case"lines":l=new El(s.data,c);break;case"linestrips":l=new ho(s.data,c);break;case"triangles":case"polygons":case"polylist":a?l=new Ff(s.data,c):l=new Ft(s.data,c);break}i.push(l)}return i}hasNode(e){return this.library.nodes[e]!==void 0}getNode(e){return this.getBuild(this.library.nodes[e],this.buildNode.bind(this))}buildVisualScene(e){const t=new en;t.name=e.name;const i=e.children;for(let n=0;n<i.length;n++){const s=i[n];t.add(this.getNode(s.id))}return t}hasVisualScene(e){return this.library.visualScenes[e]!==void 0}getVisualScene(e){return this.getBuild(this.library.visualScenes[e],this.buildVisualScene.bind(this))}parseScene(e){const t=jt(e,"instance_visual_scene")[0];return this.getVisualScene(this.parseId(t.getAttribute("url")))}parseId(e){return e.substring(1)}setupAnimations(){const e=this.library.clips;if(this.isEmpty(e)===!0){if(this.isEmpty(this.library.animations)===!1){const t=[];for(const i in this.library.animations){const n=this.getAnimation(i);for(let s=0,o=n.length;s<o;s++)t.push(n[s])}this.buildDeferredPivotAnimationTracks(t),this.animations.push(new zc("default",-1,t))}}else for(const t in e)this.animations.push(this.getAnimationClip(t))}buildDeferredPivotAnimationTracks(e){for(const t in this.deferredPivotAnimations){const i=this.library.nodes[t];if(!i)continue;const n=this.deferredPivotAnimations[t];this.buildTransformHierarchyTracks(t,n,i,e)}}buildTransformHierarchyTracks(e,t,i,n){const s=this.transformNodes[e];if(!s){console.warn("THREE.ColladaLoader: Transform hierarchy not found for node:",e);return}for(const o in t){const a=s[o];if(!a)continue;const c=i.transforms[o],l=i.transformData[o],h=t[o];switch(c){case"translate":this.buildHierarchyTranslateTrack(a,h,l,n);break;case"rotate":this.buildHierarchyRotateTrack(a,h,l,n);break;case"scale":this.buildHierarchyScaleTrack(a,h,l,n);break}}}buildHierarchyTranslateTrack(e,t,i,n){if(t.default&&t.default.stride===3){const l=t.default,h=new si(e.uuid+".position",Array.from(l.times),Array.from(l.values)),d=this.getInterpolationInfo(t);this.applyInterpolation(h,d,t),n.push(h);return}const s=this.getTimesForAllAxes(t);if(s.length===0)return;const o=[],a=this.getInterpolationInfo(t);for(let l=0;l<s.length;l++){const h=s[l],d=this.getValueAtTime(t.X,h,i.x),u=this.getValueAtTime(t.Y,h,i.y),f=this.getValueAtTime(t.Z,h,i.z);o.push(d,u,f)}const c=new si(e.uuid+".position",s,o);this.applyInterpolation(c,a),n.push(c)}buildHierarchyRotateTrack(e,t,i,n){const s=t.ANGLE||t.default;if(!s)return;const o=Array.from(s.times);if(o.length===0)return;const a=e.userData.rotationAxis||new D(i.axis[0],i.axis[1],i.axis[2]),c=new Nt,l=new Nt,h=[],d=this.getInterpolationInfo(t);for(let f=0;f<o.length;f++){const g=o[f],v=this.getValueAtTime(s,g,i.angle),m=vi.degToRad(v);c.setFromAxisAngle(a,m),f>0&&l.dot(c)<0&&(c.x=-c.x,c.y=-c.y,c.z=-c.z,c.w=-c.w),l.copy(c),h.push(c.x,c.y,c.z,c.w)}const u=new ts(e.uuid+".quaternion",o,h);this.applyInterpolation(u,d),n.push(u)}buildHierarchyScaleTrack(e,t,i,n){if(t.default&&t.default.stride===3){const l=t.default,h=new si(e.uuid+".scale",Array.from(l.times),Array.from(l.values)),d=this.getInterpolationInfo(t);this.applyInterpolation(h,d,t),n.push(h);return}const s=this.getTimesForAllAxes(t);if(s.length===0)return;const o=[],a=this.getInterpolationInfo(t);for(let l=0;l<s.length;l++){const h=s[l],d=this.getValueAtTime(t.X,h,i.x),u=this.getValueAtTime(t.Y,h,i.y),f=this.getValueAtTime(t.Z,h,i.z);o.push(d,u,f)}const c=new si(e.uuid+".scale",s,o);this.applyInterpolation(c,a),n.push(c)}}class Kx extends on{load(e,t,i,n){const s=this,o=s.path===""?Tu.extractUrlBase(e):s.path,a=new Al(s.manager);a.setPath(s.path),a.setRequestHeader(s.requestHeader),a.setWithCredentials(s.withCredentials),a.load(e,function(c){try{t(s.parse(c,o))}catch(l){n?n(l):console.error(l),s.manager.itemError(e)}},i,n)}parse(e,t){if(e.length===0)return{scene:new bl};const n=new $x().parse(e);if(n===null)return null;const{library:s,asset:o,collada:a}=n,c=new bu(this.manager);c.setPath(this.resourcePath||t).setCrossOrigin(this.crossOrigin);let l;Mh&&(l=new Mh(this.manager),l.setPath(this.resourcePath||t));const h=new Yx(s,a,c,l),{scene:d,animations:u,kinematics:f}=h.compose();return d.animations=u,o.upAxis==="Z_UP"&&(console.warn("THREE.ColladaLoader: You are loading an asset with a Z-UP coordinate system. The loader just rotates the asset to transform it into Y-UP. The vertex data are not converted, see #24289."),d.rotation.set(-Math.PI/2,0,0)),d.scale.multiplyScalar(o.unit),{get animations(){return console.warn("THREE.ColladaLoader: Please access animations over scene.animations now."),u},kinematics:f,library:s,scene:d}}}const Sh=new D,Zx=new di,Cr=new Oe,Ki=new Oe,Pr=new Nt,Lr=new D(1,1,1),Nr=new D;class xo extends dt{constructor(...e){super(...e),this.urdfNode=null,this.urdfName=""}copy(e,t){return super.copy(e,t),this.urdfNode=e.urdfNode,this.urdfName=e.urdfName,this}}class Jx extends xo{constructor(...e){super(...e),this.isURDFCollider=!0,this.type="URDFCollider"}}class jx extends xo{constructor(...e){super(...e),this.isURDFVisual=!0,this.type="URDFVisual"}}class ku extends xo{constructor(...e){super(...e),this.isURDFLink=!0,this.type="URDFLink",this.name="",this.inertial={mass:0,origin:{xyz:[0,0,0],rpy:[0,0,0]},inertia:{ixx:0,ixy:0,ixz:0,iyy:0,iyz:0,izz:0}}}copy(e,t){return super.copy(e,t),this.inertial={mass:e.inertial.mass,origin:{xyz:[...e.inertial.origin.xyz],rpy:[...e.inertial.origin.rpy]},inertia:{...e.inertial.inertia}},this}}class Bu extends xo{get jointType(){return this._jointType}set jointType(e){if(this.jointType!==e)switch(this._jointType=e,this.matrixWorldNeedsUpdate=!0,e){case"fixed":this.jointValue=[];break;case"continuous":case"revolute":case"prismatic":this.jointValue=new Array(1).fill(0);break;case"planar":this.jointValue=new Array(3).fill(0),this.axis=new D(0,0,1);break;case"floating":this.jointValue=new Array(6).fill(0);break}}get angle(){return this.jointValue[0]}constructor(...e){super(...e),this.isURDFJoint=!0,this.type="URDFJoint",this.name="",this.jointValue=null,this.jointType="fixed",this.axis=new D(1,0,0),this.limit={lower:0,upper:0,effort:0,velocity:0},this.ignoreLimits=!1,this.origPosition=null,this.origQuaternion=null,this.mimicJoints=[]}copy(e,t){return super.copy(e,t),this.jointType=e.jointType,this.axis=e.axis.clone(),this.limit.lower=e.limit.lower,this.limit.upper=e.limit.upper,this.limit.effort=e.limit.effort,this.limit.velocity=e.limit.velocity,this.ignoreLimits=!1,this.jointValue=[...e.jointValue],this.origPosition=e.origPosition?e.origPosition.clone():null,this.origQuaternion=e.origQuaternion?e.origQuaternion.clone():null,this.mimicJoints=[...e.mimicJoints],this}setJointValue(...e){e=e.map(i=>i===null?null:parseFloat(i)),(!this.origPosition||!this.origQuaternion)&&(this.origPosition=this.position.clone(),this.origQuaternion=this.quaternion.clone());let t=!1;switch(this.mimicJoints.forEach(i=>{t=i.updateFromMimickedJoint(...e)||t}),this.jointType){case"fixed":return t;case"continuous":case"revolute":{let i=e[0];return i==null||i===this.jointValue[0]?t:(!this.ignoreLimits&&this.jointType==="revolute"&&(i=Math.min(this.limit.upper,i),i=Math.max(this.limit.lower,i)),this.quaternion.setFromAxisAngle(this.axis,i).premultiply(this.origQuaternion),this.jointValue[0]!==i?(this.jointValue[0]=i,this.matrixWorldNeedsUpdate=!0,!0):t)}case"prismatic":{let i=e[0];return i==null||i===this.jointValue[0]?t:(this.ignoreLimits||(i=Math.min(this.limit.upper,i),i=Math.max(this.limit.lower,i)),this.position.copy(this.origPosition),Sh.copy(this.axis).applyEuler(this.rotation),this.position.addScaledVector(Sh,i),this.jointValue[0]!==i?(this.jointValue[0]=i,this.matrixWorldNeedsUpdate=!0,!0):t)}case"floating":return this.jointValue.every((i,n)=>e[n]===i||e[n]===null)?t:(this.jointValue[0]=e[0]!==null?e[0]:this.jointValue[0],this.jointValue[1]=e[1]!==null?e[1]:this.jointValue[1],this.jointValue[2]=e[2]!==null?e[2]:this.jointValue[2],this.jointValue[3]=e[3]!==null?e[3]:this.jointValue[3],this.jointValue[4]=e[4]!==null?e[4]:this.jointValue[4],this.jointValue[5]=e[5]!==null?e[5]:this.jointValue[5],Ki.compose(this.origPosition,this.origQuaternion,Lr),Pr.setFromEuler(Zx.set(this.jointValue[3],this.jointValue[4],this.jointValue[5],"XYZ")),Nr.set(this.jointValue[0],this.jointValue[1],this.jointValue[2]),Cr.compose(Nr,Pr,Lr),Ki.premultiply(Cr),this.position.setFromMatrixPosition(Ki),this.rotation.setFromRotationMatrix(Ki),this.matrixWorldNeedsUpdate=!0,!0);case"planar":return this.jointValue.every((i,n)=>e[n]===i||e[n]===null)?t:(this.jointValue[0]=e[0]!==null?e[0]:this.jointValue[0],this.jointValue[1]=e[1]!==null?e[1]:this.jointValue[1],this.jointValue[2]=e[2]!==null?e[2]:this.jointValue[2],Ki.compose(this.origPosition,this.origQuaternion,Lr),Pr.setFromAxisAngle(this.axis,this.jointValue[2]),Nr.set(this.jointValue[0],this.jointValue[1],0),Cr.compose(Nr,Pr,Lr),Ki.premultiply(Cr),this.position.setFromMatrixPosition(Ki),this.rotation.setFromRotationMatrix(Ki),this.matrixWorldNeedsUpdate=!0,!0)}return t}}class Eh extends Bu{constructor(...e){super(...e),this.type="URDFMimicJoint",this.mimicJoint=null,this.offset=0,this.multiplier=1}updateFromMimickedJoint(...e){const t=e.map(i=>i===null?null:i*this.multiplier+this.offset);return super.setJointValue(...t)}copy(e,t){return super.copy(e,t),this.mimicJoint=e.mimicJoint,this.offset=e.offset,this.multiplier=e.multiplier,this}}class Qx extends ku{constructor(...e){super(...e),this.isURDFRobot=!0,this.urdfNode=null,this.urdfRobotNode=null,this.robotName=null,this.links=null,this.joints=null,this.colliders=null,this.visual=null,this.frames=null}copy(e,t){super.copy(e,t),this.urdfRobotNode=e.urdfRobotNode,this.robotName=e.robotName,this.links={},this.joints={},this.colliders={},this.visual={},this.traverse(i=>{i.isURDFJoint&&i.urdfName in e.joints&&(this.joints[i.urdfName]=i),i.isURDFLink&&i.urdfName in e.links&&(this.links[i.urdfName]=i),i.isURDFCollider&&i.urdfName in e.colliders&&(this.colliders[i.urdfName]=i),i.isURDFVisual&&i.urdfName in e.visual&&(this.visual[i.urdfName]=i)});for(const i in this.joints)this.joints[i].mimicJoints=this.joints[i].mimicJoints.map(n=>this.joints[n.name]);return this.frames={...this.colliders,...this.visual,...this.links,...this.joints},this}getFrame(e){return this.frames[e]}setJointValue(e,...t){const i=this.joints[e];return i?i.setJointValue(...t):!1}setJointValues(e){let t=!1;for(const i in e){const n=e[i];Array.isArray(n)?t=this.setJointValue(i,...n)||t:t=this.setJointValue(i,n)||t}return t}}const ca=new Nt,Th=new di;function Zi(r){return r?r.trim().split(/\s+/g).map(e=>parseFloat(e)):[0,0,0]}function wh(r,e,t=!1){t||r.rotation.set(0,0,0),Th.set(e[0],e[1],e[2],"ZYX"),ca.setFromEuler(Th),ca.multiply(r.quaternion),r.quaternion.copy(ca)}class ev{constructor(e){this.manager=e||yu,this.loadMeshCb=this.defaultMeshLoader.bind(this),this.parseVisual=!0,this.parseCollision=!1,this.packages="",this.workingPath="",this.fetchOptions={}}loadAsync(e){return new Promise((t,i)=>{this.load(e,t,null,i)})}load(e,t,i,n){const s=this.manager,o=Tu.extractUrlBase(e),a=this.manager.resolveURL(e);s.itemStart(a),fetch(a,this.fetchOptions).then(c=>{if(c.ok)return i&&i(null),c.text();throw new Error(`URDFLoader: Failed to load url '${a}' with error code ${c.status} : ${c.statusText}.`)}).then(c=>{const l=this.parse(c,this.workingPath||o);t(l),s.itemEnd(a)}).catch(c=>{n?n(c):console.error("URDFLoader: Error loading file.",c),s.itemError(a),s.itemEnd(a)})}parse(e,t=this.workingPath){const i=this.packages,n=this.loadMeshCb,s=this.parseVisual,o=this.parseCollision,a=this.manager,c={},l={},h={};function d(E){if(!/^package:\/\//.test(E))return t?t+E:E;const[b,x]=E.replace(/^package:\/\//,"").split(/\/(.+)/);if(typeof i=="string")return i.endsWith(b)?i+"/"+x:i+"/"+b+"/"+x;if(typeof i=="function")return i(b)+"/"+x;if(typeof i=="object")return b in i?i[b]+"/"+x:(console.error(`URDFLoader : ${b} not found in provided package list.`),null)}function u(E){let b;E instanceof Document?b=[...E.children]:E instanceof Element?b=[E]:b=[...new DOMParser().parseFromString(E,"text/xml").children];const x=b.filter(M=>M.nodeName==="robot").pop();return f(x)}function f(E){const b=[...E.children],x=b.filter(C=>C.nodeName.toLowerCase()==="link"),M=b.filter(C=>C.nodeName.toLowerCase()==="joint"),T=b.filter(C=>C.nodeName.toLowerCase()==="material"),A=new Qx;A.robotName=E.getAttribute("name"),A.urdfRobotNode=E,T.forEach(C=>{const L=C.getAttribute("name");h[L]=m(C)});const _={},S={};x.forEach(C=>{const L=C.getAttribute("name"),B=E.querySelector(`child[link="${L}"]`)===null;c[L]=v(C,_,S,B?A:null)}),M.forEach(C=>{const L=C.getAttribute("name");l[L]=g(C)}),A.joints=l,A.links=c,A.colliders=S,A.visual=_;const R=Object.values(l);return R.forEach(C=>{C instanceof Eh&&l[C.mimicJoint].mimicJoints.push(C)}),R.forEach(C=>{const L=new Set,B=X=>{if(L.has(X))throw new Error("URDFLoader: Detected an infinite loop of mimic joints.");L.add(X),X.mimicJoints.forEach(U=>{B(U)})};B(C)}),A.frames={...S,..._,...c,...l},A}function g(E){const b=[...E.children],x=E.getAttribute("type");let M;const T=b.find(L=>L.nodeName.toLowerCase()==="mimic");T?(M=new Eh,M.mimicJoint=T.getAttribute("joint"),M.multiplier=parseFloat(T.getAttribute("multiplier")||1),M.offset=parseFloat(T.getAttribute("offset")||0)):M=new Bu,M.urdfNode=E,M.name=E.getAttribute("name"),M.urdfName=M.name,M.jointType=x;let A=null,_=null,S=[0,0,0],R=[0,0,0];b.forEach(L=>{const B=L.nodeName.toLowerCase();B==="origin"?(S=Zi(L.getAttribute("xyz")),R=Zi(L.getAttribute("rpy"))):B==="child"?_=c[L.getAttribute("link")]:B==="parent"?A=c[L.getAttribute("link")]:B==="limit"&&(M.limit.lower=parseFloat(L.getAttribute("lower")||M.limit.lower),M.limit.upper=parseFloat(L.getAttribute("upper")||M.limit.upper),M.limit.effort=parseFloat(L.getAttribute("effort")||M.limit.effort),M.limit.velocity=parseFloat(L.getAttribute("velocity")||M.limit.velocity))}),A.add(M),M.add(_),wh(M,R),M.position.set(S[0],S[1],S[2]);const C=b.filter(L=>L.nodeName.toLowerCase()==="axis")[0];if(C){const L=C.getAttribute("xyz").split(/\s+/g).map(B=>parseFloat(B));M.axis=new D(L[0],L[1],L[2]),M.axis.normalize()}return M}function v(E,b,x,M=null){M===null&&(M=new ku);const T=[...E.children];M.name=E.getAttribute("name"),M.urdfName=M.name,M.urdfNode=E;const A=T.find(_=>_.nodeName.toLowerCase()==="inertial");return A&&[...A.children].forEach(_=>{const S=_.nodeName.toLowerCase();S==="origin"?(M.inertial.origin.xyz=Zi(_.getAttribute("xyz")),M.inertial.origin.rpy=Zi(_.getAttribute("rpy"))):S==="mass"?M.inertial.mass=parseFloat(_.getAttribute("value"))||0:S==="inertia"&&(M.inertial.inertia.ixx=parseFloat(_.getAttribute("ixx"))||0,M.inertial.inertia.ixy=parseFloat(_.getAttribute("ixy"))||0,M.inertial.inertia.ixz=parseFloat(_.getAttribute("ixz"))||0,M.inertial.inertia.iyy=parseFloat(_.getAttribute("iyy"))||0,M.inertial.inertia.iyz=parseFloat(_.getAttribute("iyz"))||0,M.inertial.inertia.izz=parseFloat(_.getAttribute("izz"))||0)}),s&&T.filter(S=>S.nodeName.toLowerCase()==="visual").forEach(S=>{const R=p(S,h);if(M.add(R),S.hasAttribute("name")){const C=S.getAttribute("name");R.name=C,R.urdfName=C,b[C]=R}}),o&&T.filter(S=>S.nodeName.toLowerCase()==="collision").forEach(S=>{const R=p(S);if(M.add(R),S.hasAttribute("name")){const C=S.getAttribute("name");R.name=C,R.urdfName=C,x[C]=R}}),M}function m(E){const b=[...E.children],x=new Us;return x.name=E.getAttribute("name")||"",b.forEach(M=>{const T=M.nodeName.toLowerCase();if(T==="color"){const A=M.getAttribute("rgba").split(/\s/g).map(_=>parseFloat(_));x.color.setRGB(A[0],A[1],A[2]),x.opacity=A[3],x.transparent=A[3]<1,x.depthWrite=!x.transparent}else if(T==="texture"){const A=M.getAttribute("filename");if(A){const _=new bu(a),S=d(A);x.map=_.load(S),x.map.colorSpace=ht}}}),x}function p(E,b={}){const x=E.nodeName.toLowerCase()==="collision",M=[...E.children];let T=null;const A=M.filter(S=>S.nodeName.toLowerCase()==="material")[0];if(A){const S=A.getAttribute("name");S&&S in b?T=b[S]:T=m(A)}else T=new Us;const _=x?new Jx:new jx;return _.urdfNode=E,M.forEach(S=>{const R=S.nodeName.toLowerCase();if(R==="geometry"){const C=S.children[0].nodeName.toLowerCase();if(C==="mesh"){const L=S.children[0].getAttribute("filename"),B=d(L);if(B!==null){const X=S.children[0].getAttribute("scale");if(X){const U=Zi(X);_.scale.set(U[0],U[1],U[2])}n(B,a,T,(U,N)=>{N?console.error("URDFLoader: Error loading mesh.",N):U&&(U.position.set(0,0,0),U.quaternion.identity(),_.add(U))})}}else if(C==="box"){const L=new Ft;L.geometry=new ds(1,1,1),L.material=T;const B=Zi(S.children[0].getAttribute("size"));L.scale.set(B[0],B[1],B[2]),_.add(L)}else if(C==="sphere"){const L=new Ft;L.geometry=new po(1,30,30),L.material=T;const B=parseFloat(S.children[0].getAttribute("radius"))||0;L.scale.set(B,B,B),_.add(L)}else if(C==="cylinder"){const L=new Ft;L.geometry=new uo(1,1,1,30),L.material=T;const B=parseFloat(S.children[0].getAttribute("radius"))||0,X=parseFloat(S.children[0].getAttribute("length"))||0;L.scale.set(B,X,B),L.rotation.set(Math.PI/2,0,0),_.add(L)}}else if(R==="origin"){const C=Zi(S.getAttribute("xyz")),L=Zi(S.getAttribute("rpy"));_.position.set(C[0],C[1],C[2]),_.rotation.set(0,0,0),wh(_,L)}}),_}return u(e)}defaultMeshLoader(e,t,i,n){/\.stl$/i.test(e)?new Xx(t).load(e,o=>{const a=new Ft(o,i||new Us);n(a)},null,o=>n(null,o)):/\.dae$/i.test(e)?new Kx(t).load(e,o=>n(o.scene),null,o=>n(null,o)):console.warn(`URDFLoader: Could not load model at ${e}.
No loader available`)}}class q{static getElements(e,t=document){if(typeof e=="string"){const i="getElementById"in t?t:void 0;if(i&&!isNaN(+e[0])){const s=i.getElementById(e);return s?[s]:[]}let n=t.querySelectorAll(e);if(!n.length&&e[0]!=="."&&e[0]!=="#"&&(n=t.querySelectorAll("."+e),n.length||(n=t.querySelectorAll("#"+e)),!n.length)){const s=t.querySelector(`[gs-id="${e}"]`);return s?[s]:[]}return Array.from(n)}return[e]}static getElement(e,t=document){if(typeof e=="string"){const i="getElementById"in t?t:void 0;if(!e.length)return null;if(i&&e[0]==="#")return i.getElementById(e.substring(1));if(e[0]==="#"||e[0]==="."||e[0]==="[")return t.querySelector(e);if(i&&!isNaN(+e[0]))return i.getElementById(e);let n=t.querySelector(e);return i&&!n&&(n=i.getElementById(e)),n||(n=t.querySelector("."+e)),n}return e}static lazyLoad(e){var t,i;return!!(e.lazyLoad||(i=(t=e.grid)==null?void 0:t.opts)!=null&&i.lazyLoad&&e.lazyLoad!==!1)}static createDiv(e,t){const i=document.createElement("div");return e.forEach(n=>{n&&i.classList.add(n)}),t==null||t.appendChild(i),i}static shouldSizeToContent(e,t=!1){return!!(e!=null&&e.grid&&(t?e.sizeToContent===!0||e.grid.opts.sizeToContent===!0&&e.sizeToContent===void 0:e.sizeToContent||e.grid.opts.sizeToContent&&e.sizeToContent!==!1))}static isIntercepted(e,t){return!(e.y>=t.y+t.h||e.y+e.h<=t.y||e.x+e.w<=t.x||e.x>=t.x+t.w)}static isTouching(e,t){return q.isIntercepted(e,{x:t.x-.5,y:t.y-.5,w:t.w+1,h:t.h+1})}static areaIntercept(e,t){const i=e.x>t.x?e.x:t.x,n=e.x+e.w<t.x+t.w?e.x+e.w:t.x+t.w;if(n<=i)return 0;const s=e.y>t.y?e.y:t.y,o=e.y+e.h<t.y+t.h?e.y+e.h:t.y+t.h;return o<=s?0:(n-i)*(o-s)}static area(e){return e.w*e.h}static sort(e,t=1){const i=Number.MAX_SAFE_INTEGER;return e.sort((n,s)=>{const o=t*((n.y??i)-(s.y??i));return o===0?t*((n.x??i)-(s.x??i)):o})}static find(e,t){return t?e.find(i=>i.id===t):void 0}static findInGrid(e,t,i){const n=e.engine.nodes.find(s=>String(s.id)===t);if(n||!i)return n;for(const s of e.engine.nodes)if(s.subGrid){const o=q.findInGrid(s.subGrid,t);if(o)return o}}static toBool(e){return typeof e=="boolean"?e:typeof e=="string"?(e=e.toLowerCase(),!(e===""||e==="no"||e==="false"||e==="0")):!!e}static toNumber(e){return e===null||e.length===0?void 0:Number(e)}static parseHeight(e){let t,i="px";if(typeof e=="string")if(e==="auto"||e==="")t=0;else{const n=e.match(/^(-[0-9]+\.[0-9]+|[0-9]*\.[0-9]+|-[0-9]+|[0-9]+)(px|em|rem|vh|vw|%|cm|mm)?$/);if(!n)throw new Error(`Invalid height val = ${e}`);i=n[2]||"px",t=parseFloat(n[1])}else t=e;return{h:t,unit:i}}static defaults(e,...t){return t.forEach(i=>{for(const n in i){if(!Object.prototype.hasOwnProperty.call(i,n))return;e[n]===null||e[n]===void 0?e[n]=i[n]:typeof i[n]=="object"&&typeof e[n]=="object"&&q.defaults(e[n],i[n])}}),e}static same(e,t){if(typeof e!="object")return e==t;if(typeof e!=typeof t)return!1;const i=e,n=t;if(Object.keys(i).length!==Object.keys(n).length)return!1;for(const s in i)if(i[s]!==n[s])return!1;return!0}static copyPos(e,t,i=!1){return t.x!==void 0&&(e.x=t.x),t.y!==void 0&&(e.y=t.y),t.w!==void 0&&(e.w=t.w),t.h!==void 0&&(e.h=t.h),i&&(t.minW&&(e.minW=t.minW),t.minH&&(e.minH=t.minH),t.maxW&&(e.maxW=t.maxW),t.maxH&&(e.maxH=t.maxH)),e}static samePos(e,t){return e&&t&&e.x===t.x&&e.y===t.y&&(e.w||1)===(t.w||1)&&(e.h||1)===(t.h||1)}static sanitizeMinMax(e){e.minW||delete e.minW,e.minH||delete e.minH,e.maxW||delete e.maxW,e.maxH||delete e.maxH}static removeInternalAndSame(e,t){if(typeof e!="object"||typeof t!="object"||!e||!t||Array.isArray(e)||Array.isArray(t))return;const i=e,n=t;for(const s in i){const o=i[s],a=n[s];s[0]==="_"||o===a?delete i[s]:o&&typeof o=="object"&&a!==void 0&&(q.removeInternalAndSame(o,a),Object.keys(o).length||delete i[s])}}static removeInternalForSave(e,t=!0){const i=e;for(const n in i)(n[0]==="_"||i[n]===null||i[n]===void 0)&&delete i[n];delete e.grid,t&&delete e.el,e.autoPosition||delete e.autoPosition,e.noResize||delete e.noResize,e.noMove||delete e.noMove,e.locked||delete e.locked,(e.w===1||e.w===e.minW)&&delete e.w,(e.h===1||e.h===e.minH)&&delete e.h}static throttle(e,t){let i=!1;return(...n)=>{i||(i=!0,setTimeout(()=>{e(...n),i=!1},t))}}static removePositioningStyles(e){const t=e.style;t.position&&t.removeProperty("position"),t.left&&t.removeProperty("left"),t.top&&t.removeProperty("top"),t.width&&t.removeProperty("width"),t.height&&t.removeProperty("height")}static getScrollElement(e){if(!e)return document.scrollingElement||document.documentElement;const t=getComputedStyle(e).overflowY;return(t==="auto"||t==="scroll")&&e.scrollHeight>e.clientHeight?e:q.getScrollElement(e.parentElement??void 0)}static updateScrollResize(e,t,i){const n=q.getScrollElement(t),s=n.clientHeight,o=n===q.getScrollElement()?0:n.getBoundingClientRect().top,a=e.clientY-o,c=a<i,l=a>s-i;c?n.scrollBy({behavior:"smooth",top:a-i}):l&&n.scrollBy({behavior:"smooth",top:i-(s-a)})}static pauseIframePointerEvents(e){document.querySelectorAll("iframe").forEach(t=>{t.style.pointerEvents=e?"none":""})}static clone(e){return e==null||typeof e!="object"?e:e instanceof Array?[...e]:{...e}}static cloneDeep(e){const t=["parentGrid","el","grid","subGrid","engine"],i=q.clone(e);for(const n in i)Object.prototype.hasOwnProperty.call(i,n)&&typeof i[n]=="object"&&n.substring(0,2)!=="__"&&!t.find(s=>s===n)&&(i[n]=q.cloneDeep(e[n]));return i}static cloneNode(e){const t=e.cloneNode(!0);return t.removeAttribute("id"),t}static appendTo(e,t){let i;typeof t=="string"?i=q.getElement(t):i=t,i&&i.appendChild(e)}static addElStyles(e,t){if(t instanceof Object){const i=e.style;for(const n in t)Object.prototype.hasOwnProperty.call(t,n)&&(Array.isArray(t[n])?t[n].forEach(s=>{i[n]=s}):i[n]=t[n])}}static initEvent(e,t){const i={type:t.type},n={button:0,which:0,buttons:1,bubbles:!0,cancelable:!0,target:t.target?t.target:e.target},s=e;return["altKey","ctrlKey","metaKey","shiftKey"].forEach(o=>i[o]=s[o]),["pageX","pageY","clientX","clientY","screenX","screenY"].forEach(o=>i[o]=s[o]),{...i,...n}}static simulateMouseEvent(e,t,i){const n=e,s=new MouseEvent(t,{bubbles:!0,composed:!0,cancelable:!0,view:window,detail:1,screenX:e.screenX,screenY:e.screenY,clientX:e.clientX,clientY:e.clientY,ctrlKey:n.ctrlKey??!1,altKey:n.altKey??!1,shiftKey:n.shiftKey??!1,metaKey:n.metaKey??!1,button:0,relatedTarget:e.target});(i||e.target).dispatchEvent(s)}static getValuesFromTransformedElement(e){const t=document.createElement("div");q.addElStyles(t,{opacity:"0",position:"fixed",top:"0px",left:"0px",width:"1px",height:"1px",zIndex:"-999999"}),e.appendChild(t);const i=t.getBoundingClientRect();return e.removeChild(t),t.remove(),{xScale:1/i.width,yScale:1/i.height,xOffset:i.left,yOffset:i.top}}static swap(e,t,i){if(!e)return;const n=e,s=n[t];n[t]=n[i],n[i]=s}static canBeRotated(e){var t;return!(!e||e.w===e.h||e.locked||e.noResize||(t=e.grid)!=null&&t.opts.disableResize||e.minW&&e.minW===e.maxW||e.minH&&e.minH===e.maxH)}}class Di{constructor(e={}){this.addedNodes=[],this.removedNodes=[],this.defaultColumn=12,this.column=e.column||this.defaultColumn,this.column>this.defaultColumn&&(this.defaultColumn=this.column),this.maxRow=e.maxRow??0,this._float=e.float??!1,this.nodes=e.nodes||[],this.onChange=e.onChange??(()=>{})}batchUpdate(e=!0,t=!0){return!!this.batchMode===e?this:(this.batchMode=e,e?(this._prevFloat=this._float,this._float=!0,this.cleanNodes(),this.nodes.some(i=>i._updating)||this.saveInitial()):(this._float=this._prevFloat??!1,delete this._prevFloat,t&&this._packNodes(),this._notify()),this)}_useEntireRowArea(e,t){return(!this.float||this.batchMode&&!this._prevFloat)&&!this._hasLocked&&(!e._moving||e._skipDown||t.y<=e.y)}_fixCollisions(e,t=e,i,n={}){if(this.sortNodes(-1),i=i||this.collide(e,t),!i)return!1;if(e._moving&&!e._isExternal&&!n.nested&&!this.float&&this.swap(e,i))return!0;let s=t;!this._loading&&this._useEntireRowArea(e,t)&&(s={x:0,w:this.column,y:t.y,h:t.h},i=this.collide(e,s,n.skip));let o=!1;const a={nested:!0,pack:!1};let c=0;for(;i=i||this.collide(e,s,n.skip);){if(c++>this.nodes.length*2)throw new Error("Infinite collide check");let l;if(i.locked||this._loading||e._moving&&!e._skipDown&&t.y>e.y&&!this.float&&(!this.collide(i,{...i,y:e.y},e)||!this.collide(i,{...i,y:t.y-i.h},e))){e._skipDown=e._skipDown||t.y>e.y;const h={...t,y:i.y+i.h,...a};l=this._loading&&q.samePos(e,h)?!0:this.moveNode(e,h),(i.locked||this._loading)&&l?q.copyPos(t,e):!i.locked&&l&&n.pack&&(this._packNodes(),t.y=i.y+i.h,q.copyPos(e,t)),o=o||l}else l=this.moveNode(i,{...i,y:t.y+t.h,skip:e,...a});if(!l)return o;i=void 0}return o}collide(e,t=e,i){const n=e._id,s=i==null?void 0:i._id;return this.nodes.find(o=>o._id!==n&&o._id!==s&&q.isIntercepted(o,t))}collideAll(e,t=e,i){const n=e._id,s=i==null?void 0:i._id;return this.nodes.filter(o=>o._id!==n&&o._id!==s&&q.isIntercepted(o,t))}directionCollideCoverage(e,t,i){if(!t.rect||!e._rect)return;const n=e._rect,s={...t.rect};s.y>n.y?(s.h=s.h+s.y-n.y,s.y=n.y):s.h=s.h+n.y-s.y,s.x>n.x?(s.w=s.w+s.x-n.x,s.x=n.x):s.w=s.w+n.x-s.x;let o,a=.5;for(const c of i){if(c.locked||!c._rect)continue;const l=c._rect;let h=Number.MAX_VALUE,d=Number.MAX_VALUE;n.y<l.y?h=(s.y+s.h-l.y)/l.h:n.y+n.h>l.y+l.h&&(h=(l.y+l.h-s.y)/l.h),n.x<l.x?d=(s.x+s.w-l.x)/l.w:n.x+n.w>l.x+l.w&&(d=(l.x+l.w-s.x)/l.w);const u=Math.min(d,h);u>a&&(a=u,o=c)}return t.collide=o,o}cacheRects(e,t,i,n,s,o){return this.nodes.forEach(a=>a._rect={y:a.y*t+i,x:a.x*e+o,w:a.w*e-o-n,h:a.h*t-i-s}),this}swap(e,t){if(!t||t.locked||!e||e.locked)return!1;function i(){const s=t.x,o=t.y;return t.x=e.x,t.y=e.y,e.h!=t.h?(e.x=s,e.y=t.y+t.h):e.w!=t.w?(e.x=t.x+t.w,e.y=o):(e.x=s,e.y=o),e._dirty=t._dirty=!0,!0}let n;if(e.w===t.w&&e.h===t.h&&(e.x===t.x||e.y===t.y)&&(n=q.isTouching(e,t)))return i();if(n!==!1){if(e.w===t.w&&e.x===t.x&&(n||(n=q.isTouching(e,t)))){if(t.y<e.y){const s=e;e=t,t=s}return i()}if(n!==!1){if(e.h===t.h&&e.y===t.y&&(n||(n=q.isTouching(e,t)))){if(t.x<e.x){const s=e;e=t,t=s}return i()}return!1}}}isAreaEmpty(e,t,i,n){const s={x:e||0,y:t||0,w:i||1,h:n||1};return!this.collide(s)}compact(e="compact",t=!0){if(this.nodes.length===0)return this;t&&this.sortNodes();const i=this.batchMode;i||this.batchUpdate();const n=this._inColumnResize;n||(this._inColumnResize=!0);const s=this.nodes;return this.nodes=[],s.forEach((o,a,c)=>{let l;o.locked||(o.autoPosition=!0,e==="list"&&a&&(l=c[a-1])),this.addNode(o,!1,l)}),n||delete this._inColumnResize,i||this.batchUpdate(!1),this}set float(e){this._float!==e&&(this._float=e||!1,e||this._packNodes()._notify())}get float(){return this._float||!1}sortNodes(e=1){return this.nodes=q.sort(this.nodes,e),this}_packNodes(){return this.batchMode?this:(this.sortNodes(),this.float?this.nodes.forEach(e=>{if(e._updating||e._orig===void 0||e.y===e._orig.y)return;let t=e.y;for(;t>e._orig.y;)--t,this.collide(e,{x:e.x,y:t,w:e.w,h:e.h})||(e._dirty=!0,e.y=t)}):this.nodes.forEach((e,t)=>{if(!e.locked)for(;e.y>0;){const i=t===0?0:e.y-1;if(!(t===0||!this.collide(e,{x:e.x,y:i,w:e.w,h:e.h})))break;e._dirty=e.y!==i,e.y=i}}),this)}prepareNode(e,t){e._id=e._id??Di._idSeq++;const i=e.id;if(i){let s=1;for(;this.nodes.find(o=>o.id===e.id&&o!==e);)e.id=i+"_"+s++}(e.x===void 0||e.y===void 0||e.x===null||e.y===null)&&(e.autoPosition=!0);const n={x:0,y:0,w:1,h:1};return q.defaults(e,n),e.autoPosition||delete e.autoPosition,e.noResize||delete e.noResize,e.noMove||delete e.noMove,q.sanitizeMinMax(e),typeof e.x=="string"&&(e.x=Number(e.x)),typeof e.y=="string"&&(e.y=Number(e.y)),typeof e.w=="string"&&(e.w=Number(e.w)),typeof e.h=="string"&&(e.h=Number(e.h)),isNaN(e.x)&&(e.x=n.x,e.autoPosition=!0),isNaN(e.y)&&(e.y=n.y,e.autoPosition=!0),isNaN(e.w)&&(e.w=n.w),isNaN(e.h)&&(e.h=n.h),this.nodeBoundFix(e,t),e}nodeBoundFix(e,t){const i=e._orig||q.copyPos({},e);if(e.maxW&&(e.w=Math.min(e.w||1,e.maxW)),e.maxH&&(e.h=Math.min(e.h||1,e.maxH)),e.minW&&(e.w=Math.max(e.w||1,e.minW)),e.minH&&(e.h=Math.max(e.h||1,e.minH)),(e.x||0)+(e.w||1)>this.column&&this.column<this.defaultColumn&&!this._inColumnResize&&!this.skipCacheUpdate&&e._id!=null&&this.findCacheLayout(e,this.defaultColumn)===-1){const s={...e};s.autoPosition||s.x===void 0?(delete s.x,delete s.y):s.x=Math.min(this.defaultColumn-1,s.x),s.w=Math.min(this.defaultColumn,s.w||1),this.cacheOneLayout(s,this.defaultColumn)}return e.w>this.column?e.w=this.column:e.w<1&&(e.w=1),this.maxRow&&e.h>this.maxRow?e.h=this.maxRow:e.h<1&&(e.h=1),e.x<0&&(e.x=0),e.y<0&&(e.y=0),e.x+e.w>this.column&&(t?e.w=this.column-e.x:e.x=this.column-e.w),this.maxRow&&e.y+e.h>this.maxRow&&(t?e.h=this.maxRow-e.y:e.y=this.maxRow-e.h),q.samePos(e,i)||(e._dirty=!0),this}getDirtyNodes(e){return e?this.nodes.filter(t=>t._dirty&&t._orig&&!q.samePos(t,t._orig)):this.nodes.filter(t=>t._dirty)}_notify(e){if(this.batchMode||!this.onChange)return this;const t=(e||[]).concat(this.getDirtyNodes());return this.onChange(t),this}cleanNodes(){return this.batchMode?this:(this.nodes.forEach(e=>{delete e._dirty,delete e._lastTried}),this)}saveInitial(){return this.nodes.forEach(e=>{e._orig=q.copyPos({},e),delete e._dirty}),this._hasLocked=this.nodes.some(e=>e.locked),this}restoreInitial(){return this.nodes.forEach(e=>{!e._orig||q.samePos(e,e._orig)||(q.copyPos(e,e._orig),e._dirty=!0)}),this._notify(),this}findEmptyPosition(e,t=this.nodes,i=this.column,n){const s=n?n.y*i+(n.x+n.w):0;let o=!1;for(let a=s;!o;++a){const c=a%i,l=Math.floor(a/i);if(c+e.w>i)continue;const h={x:c,y:l,w:e.w,h:e.h};t.find(d=>q.isIntercepted(h,d))||((e.x!==c||e.y!==l)&&(e._dirty=!0),e.x=c,e.y=l,delete e.autoPosition,o=!0)}return o}addNode(e,t=!1,i){const n=this.nodes.find(o=>o._id===e._id);if(n)return n;this._inColumnResize?this.nodeBoundFix(e):this.prepareNode(e),delete e._temporaryRemoved,delete e._removeDOM;let s=!1;return e.autoPosition&&this.findEmptyPosition(e,this.nodes,this.column,i)&&(delete e.autoPosition,s=!0),this.nodes.push(e),t&&this.addedNodes.push(e),s||this._fixCollisions(e),this.batchMode||this._packNodes()._notify(),e}removeNode(e,t=!0,i=!1){return this.nodes.find(n=>n._id===e._id)?(i&&this.removedNodes.push(e),t&&(e._removeDOM=!0),this.nodes=this.nodes.filter(n=>n._id!==e._id),e._isAboutToRemove||this._packNodes(),this._notify([e]),this):this}removeAll(e=!0,t=!0){if(delete this._layouts,!this.nodes.length)return this;e&&this.nodes.forEach(n=>n._removeDOM=!0);const i=this.nodes;return this.removedNodes=t?i:[],this.nodes=[],this._notify(i)}moveNodeCheck(e,t){var o;if(!this.changedPosConstrain(e,t))return!1;if(t.pack=!0,!this.maxRow)return this.moveNode(e,t);let i;const n=new Di({column:this.column,float:this.float,nodes:this.nodes.map(a=>a._id===e._id?(i={...a},i):{...a})});if(!i)return!1;const s=n.moveNode(i,t)&&n.getRow()<=Math.max(this.getRow(),this.maxRow);if(!s&&!t.resizing&&t.collide&&!e._isExternal){const a=(o=t.collide.el)==null?void 0:o.gridstackNode;if(a&&this.swap(e,a))return this._notify(),!0}return s?(n.nodes.filter(a=>a._dirty).forEach(a=>{const c=this.nodes.find(l=>l._id===a._id);c&&(q.copyPos(c,a),c._dirty=!0)}),this._notify(),!0):!1}willItFit(e){if(delete e._willFitPos,!this.maxRow)return!0;const t=new Di({column:this.column,float:this.float,nodes:this.nodes.map(n=>({...n}))}),i={...e};return this.cleanupNode(i),delete i.el,delete i._id,delete i.content,delete i.grid,t.addNode(i),t.getRow()<=this.maxRow?(e._willFitPos=q.copyPos({},i),!0):!1}changedPosConstrain(e,t){return t.w=t.w||e.w,t.h=t.h||e.h,e.x!==t.x||e.y!==t.y?!0:(e.maxW&&(t.w=Math.min(t.w,e.maxW)),e.maxH&&(t.h=Math.min(t.h,e.maxH)),e.minW&&(t.w=Math.max(t.w,e.minW)),e.minH&&(t.h=Math.max(t.h,e.minH)),e.w!==t.w||e.h!==t.h)}moveNode(e,t){var l,h;if(!e||!t)return!1;let i=!1;t.pack===void 0&&!this.batchMode&&(i=t.pack=!0),typeof t.x!="number"&&(t.x=e.x),typeof t.y!="number"&&(t.y=e.y),typeof t.w!="number"&&(t.w=e.w),typeof t.h!="number"&&(t.h=e.h);const n=e.w!==t.w||e.h!==t.h,s=q.copyPos({},e,!0);if(q.copyPos(s,t),this.nodeBoundFix(s,n),q.copyPos(t,s),!t.forceCollide&&q.samePos(e,t))return!1;const o=q.copyPos({},e),a=this.collideAll(e,s,t.skip);let c=!0;if(a.length){const d=e._moving&&!t.nested;let u=d?this.directionCollideCoverage(e,t,a):a[0];if(d&&u&&((h=(l=e.grid)==null?void 0:l.opts)!=null&&h.subGridDynamic)&&!e.grid._isTemp){const f=q.areaIntercept(t.rect,u._rect),g=q.area(t.rect),v=q.area(u._rect);f/(g<v?g:v)>.8&&(u.grid.makeSubGrid(u.el,void 0,e),u=void 0)}u?c=!this._fixCollisions(e,s,u,t):(c=!1,i&&delete t.pack)}return c&&!q.samePos(e,s)&&(e._dirty=!0,q.copyPos(e,s)),t.pack&&this._packNodes()._notify(),!q.samePos(e,o)}getRow(){return this.nodes.reduce((e,t)=>Math.max(e,t.y+t.h),0)}beginUpdate(e){return e._updating||(e._updating=!0,delete e._skipDown,this.batchMode||this.saveInitial()),this}endUpdate(){const e=this.nodes.find(t=>t._updating);return e&&(delete e._updating,delete e._skipDown),this}save(e=!0,t,i){var a;const n=((a=this._layouts)==null?void 0:a.length)||0;let s;n&&(i?i!==this.column&&(s=this._layouts[i]):this.column!==n-1&&(s=this._layouts[n-1]));const o=[];return this.sortNodes(),this.nodes.forEach(c=>{const l=s==null?void 0:s.find(d=>d._id===c._id),h={...c,...l||{}};q.removeInternalForSave(h,!e),t&&t(c,h),o.push(h)}),o}layoutsNodesChange(e){return!this._layouts||this._inColumnResize?this:(this._layouts.forEach((t,i)=>{if(!(!t||i===this.column))if(i<this.column)this._layouts[i]=void 0;else{const n=i/this.column;e.forEach(s=>{if(!s._orig)return;const o=t.find(a=>a._id===s._id);o&&(o.y>=0&&s.y!==s._orig.y&&(o.y=o.y+(s.y-s._orig.y),o.y<0&&(o.y=0)),s.x!==s._orig.x&&(o.x=Math.round(s.x*n),o.x<0&&(o.x=0)),s.w!==s._orig.w&&(o.w=Math.round(s.w*n),o.w<1&&(o.w=1)))})}}),this)}columnChanged(e,t,i="moveScale"){var a;if(!this.nodes.length||!t||e===t)return this;const n=i==="compact"||i==="list";n&&this.sortNodes(1),t<e&&this.cacheLayout(this.nodes,e),this.batchUpdate();let s=[],o=n?this.nodes:q.sort(this.nodes,-1);if(t>e&&this._layouts){const c=this._layouts[t]||[],l=this._layouts.length-1;!c.length&&e!==l&&((a=this._layouts[l])!=null&&a.length)&&(e=l,this._layouts[l].forEach(h=>{const d=o.find(u=>u._id===h._id);d&&(!n&&!h.autoPosition&&(d.x=h.x??d.x,d.y=h.y??d.y),d.w=h.w??d.w,(h.x==null||h.y===void 0)&&(d.autoPosition=!0))})),c.forEach(h=>{const d=o.findIndex(u=>u._id===h._id);if(d!==-1){const u=o[d];if(n){u.w=h.w;return}(h.autoPosition||isNaN(h.x)||isNaN(h.y))&&this.findEmptyPosition(h,s),h.autoPosition||(u.x=h.x??u.x,u.y=h.y??u.y,u.w=h.w??u.w,s.push(u)),o.splice(d,1)}})}if(n)this.compact(i,!1);else{if(o.length)if(typeof i=="function")i(t,e,s,o);else{const c=n||i==="none"?1:t/e,l=i==="move"||i==="moveScale",h=i==="scale"||i==="moveScale";o.forEach(d=>{d.x=t===1?0:l?Math.round(d.x*c):Math.min(d.x,t-1),d.w=t===1||e===1?1:h?Math.round(d.w*c)||1:Math.min(d.w,t),s.push(d)}),o=[]}s=q.sort(s,-1),this._inColumnResize=!0,this.nodes=[],s.forEach(c=>{this.addNode(c,!1),delete c._orig})}return this.nodes.forEach(c=>delete c._orig),this.batchUpdate(!1,!n),delete this._inColumnResize,this}cacheLayout(e,t,i=!1){const n=[];return e.forEach((s,o)=>{if(s._id===void 0){const a=s.id?this.nodes.find(c=>c.id===s.id):void 0;s._id=(a==null?void 0:a._id)??Di._idSeq++}n[o]={x:s.x,y:s.y,w:s.w,_id:s._id}}),this._layouts=i?[]:this._layouts||[],this._layouts[t]=n,this}cacheOneLayout(e,t){e._id=e._id??Di._idSeq++;const i={x:e.x,y:e.y,w:e.w,_id:e._id};(e.autoPosition||e.x===void 0)&&(delete i.x,delete i.y,e.autoPosition&&(i.autoPosition=!0)),this._layouts=this._layouts||[],this._layouts[t]=this._layouts[t]||[];const n=this.findCacheLayout(e,t);return n===-1?this._layouts[t].push(i):this._layouts[t][n]=i,this}findCacheLayout(e,t){var i,n;return((n=(i=this._layouts)==null?void 0:i[t])==null?void 0:n.findIndex(s=>s._id===e._id))??-1}removeNodeFromLayoutCache(e){if(this._layouts)for(let t=0;t<this._layouts.length;t++){const i=this.findCacheLayout(e,t);i!==-1&&this._layouts[t].splice(i,1)}}cleanupNode(e){const t=e;for(const i in t)i[0]==="_"&&i!=="_id"&&delete t[i];return this}}Di._idSeq=0;const Jt={alwaysShowResizeHandle:"mobile",animate:!0,auto:!0,cellHeight:"auto",cellHeightThrottle:100,cellHeightUnit:"px",column:12,draggable:{handle:".grid-stack-item-content",appendTo:"body",scroll:!0},handle:".grid-stack-item-content",itemClass:"grid-stack-item",margin:10,marginUnit:"px",maxRow:0,minRow:0,placeholderClass:"grid-stack-placeholder",placeholderText:"",removableOptions:{accept:"grid-stack-item",decline:"grid-stack-non-removable"},resizable:{handles:"se"},rtl:"auto"};class Te{}const ui=typeof window<"u"&&typeof document<"u"&&("ontouchstart"in document||"ontouchstart"in window||window.DocumentTouch&&document instanceof window.DocumentTouch||navigator.maxTouchPoints>0&&window.matchMedia("(any-pointer: coarse)").matches||navigator.msMaxTouchPoints>0),tv=300,iv=10;class vt{}function Qr(r){r.preventDefault()}function nv(){document.addEventListener("contextmenu",Qr,!0),document.addEventListener("selectstart",Qr,!0)}function zu(){document.removeEventListener("contextmenu",Qr,!0),document.removeEventListener("selectstart",Qr,!0)}function Ah(r,e,t){r.removeEventListener("touchmove",e),r.removeEventListener("touchend",t),r.removeEventListener("touchcancel",t),Pl()}function Pl(){vt.touchDelayTimer&&(window.clearTimeout(vt.touchDelayTimer),delete vt.touchDelayTimer),zu()}function eo(r,e){r.touches.length>1||(r.cancelable&&r.preventDefault(),q.simulateMouseEvent(r.changedTouches[0],e))}function Hu(r,e){r.cancelable&&r.preventDefault(),q.simulateMouseEvent(r,e)}function to(r){if(vt.touchHandled)return;const e=r.currentTarget,t=r.touches[0].clientX,i=r.touches[0].clientY,n=()=>Ah(e,s,n),s=o=>{const a=o.touches[0];Math.abs(a.clientX-t)+Math.abs(a.clientY-i)>iv&&n()};e.addEventListener("touchmove",s,{passive:!0}),e.addEventListener("touchend",n,{passive:!0}),e.addEventListener("touchcancel",n,{passive:!0}),vt.touchDelayTimer=window.setTimeout(()=>{Ah(e,s,n),vt.touchHandled=!0,vt.wasDelayed=!0,nv(),eo(r,"mousedown"),delete vt.wasDelayed},tv)}function io(r){vt.touchHandled&&eo(r,"mousemove")}function nn(r){if(!vt.touchHandled)return;zu(),vt.pointerLeaveTimeout&&(window.clearTimeout(vt.pointerLeaveTimeout),delete vt.pointerLeaveTimeout);const e=!!Te.dragElement;eo(r,"mouseup"),!e&&r.type!=="touchcancel"&&eo(r,"click"),vt.touchHandled=!1}function no(r){r.pointerType!=="mouse"&&r.target.releasePointerCapture(r.pointerId)}function Rh(r){Te.dragElement&&r.pointerType!=="mouse"&&Hu(r,"mouseenter")}function Ch(r){Te.dragElement&&r.pointerType!=="mouse"&&(vt.pointerLeaveTimeout=window.setTimeout(()=>{delete vt.pointerLeaveTimeout,Hu(r,"mouseleave")},10))}class vo{constructor(e,t,i){this.host=e,this.dir=t,this.option=i,this._mouseDown=this._mouseDown.bind(this),this._mouseMove=this._mouseMove.bind(this),this._mouseUp=this._mouseUp.bind(this),this._keyEvent=this._keyEvent.bind(this),this._init()}_init(){if(this.option.element)try{this.el=this.option.element instanceof HTMLElement?this.option.element:this.host.querySelector(this.option.element)}catch(e){this.option.element=void 0,console.error("Query for resizeable handle failed, falling back",e)}return this.el||(this.el=document.createElement("div"),this.host.appendChild(this.el)),this.el.classList.add("ui-resizable-handle"),this.el.classList.add(`${vo.prefix}${this.dir}`),this.el.addEventListener("mousedown",this._mouseDown),ui&&(this.el.addEventListener("touchstart",to),this.el.addEventListener("pointerdown",no)),this}destroy(){return this.mouseDownEvent&&this._mouseUp(this.mouseDownEvent),Pl(),this.el.removeEventListener("mousedown",this._mouseDown),ui&&(this.el.removeEventListener("touchstart",to),this.el.removeEventListener("pointerdown",no)),this.option.element||this.host.removeChild(this.el),this}_mouseDown(e){this.mouseDownEvent=e,document.addEventListener("mousemove",this._mouseMove,{capture:!0,passive:!0}),document.addEventListener("mouseup",this._mouseUp,!0),ui&&(this.el.addEventListener("touchmove",io),this.el.addEventListener("touchend",nn),this.el.addEventListener("touchcancel",nn)),vt.wasDelayed&&this.el.classList.add("ui-resizable-armed"),e.stopPropagation(),e.preventDefault()}_mouseMove(e){const t=this.mouseDownEvent;this.moving?this._triggerEvent("move",e):Math.abs(e.x-t.x)+Math.abs(e.y-t.y)>2&&(this.moving=!0,this.el.classList.remove("ui-resizable-armed"),this._triggerEvent("start",this.mouseDownEvent),this._triggerEvent("move",e),document.addEventListener("keydown",this._keyEvent)),e.stopPropagation()}_mouseUp(e){this.moving&&(this._triggerEvent("stop",e),document.removeEventListener("keydown",this._keyEvent)),this.el.classList.remove("ui-resizable-armed"),document.removeEventListener("mousemove",this._mouseMove,!0),document.removeEventListener("mouseup",this._mouseUp,!0),ui&&(this.el.removeEventListener("touchmove",io),this.el.removeEventListener("touchend",nn),this.el.removeEventListener("touchcancel",nn)),delete this.moving,delete this.mouseDownEvent,e.stopPropagation(),e.preventDefault()}_keyEvent(e){var t,i;e.key==="Escape"&&((i=(t=this.host.gridstackNode)==null?void 0:t.grid)==null||i.engine.restoreInitial(),this._mouseUp(this.mouseDownEvent))}_triggerEvent(e,t){const i=this.option;return i[e]&&i[e](t),this}}vo.prefix="ui-resizable-";class Ll{constructor(){this._eventRegister={}}get disabled(){return this._disabled}on(e,t){this._eventRegister[e]=t}off(e){delete this._eventRegister[e]}enable(){this._disabled=!1}disable(){this._disabled=!0}destroy(){this._eventRegister={}}triggerEvent(e,t){if(!this.disabled&&this._eventRegister[e])return this._eventRegister[e](t)}}class qs extends Ll{constructor(e,t={}){super(),this.el=e,this.option=t,this.rectScale={x:1,y:1},this._ui=()=>{const n=this.el.parentElement.getBoundingClientRect(),s={width:this.originalRect.width,height:this.originalRect.height+this.scrolled,left:this.originalRect.left,right:this.originalRect.right,top:this.originalRect.top-this.scrolled},o=this.temporalRect||s;return{position:{left:this.option.rtl?(n.right-o.right)*this.rectScale.x:(o.left-n.left)*this.rectScale.x,top:(o.top-n.top)*this.rectScale.y},size:{width:o.width*this.rectScale.x,height:o.height*this.rectScale.y}}},this._mouseOver=this._mouseOver.bind(this),this._mouseOut=this._mouseOut.bind(this),this.enable(),this._setupAutoHide(!!this.option.autoHide),this._setupHandlers()}on(e,t){super.on(e,t)}off(e){super.off(e)}enable(){super.enable(),this.el.classList.remove("ui-resizable-disabled"),this._setupAutoHide(!!this.option.autoHide)}disable(){super.disable(),this.el.classList.add("ui-resizable-disabled"),this._setupAutoHide(!1)}destroy(){this._removeHandlers(),this._setupAutoHide(!1),delete this.el,super.destroy()}updateOption(e){const t=e.handles&&e.handles!==this.option.handles,i=e.autoHide&&e.autoHide!==this.option.autoHide;return Object.assign(this.option,e),t&&(this._removeHandlers(),this._setupHandlers()),i&&this._setupAutoHide(!!this.option.autoHide),this}_setupAutoHide(e){return e?(this.el.classList.add("ui-resizable-autohide"),this.el.addEventListener("mouseover",this._mouseOver),this.el.addEventListener("mouseout",this._mouseOut)):(this.el.classList.remove("ui-resizable-autohide"),this.el.removeEventListener("mouseover",this._mouseOver),this.el.removeEventListener("mouseout",this._mouseOut),Te.overResizeElement===this&&delete Te.overResizeElement),this}_mouseOver(e){Te.overResizeElement||Te.dragElement||(Te.overResizeElement=this,this.el.classList.remove("ui-resizable-autohide"))}_mouseOut(e){Te.overResizeElement===this&&(delete Te.overResizeElement,this.el.classList.add("ui-resizable-autohide"))}_setupHandlers(){return this.handlers=(this.option.handles??"se").split(",").map(e=>e.trim()).map(e=>new vo(this.el,e,{element:this.option.element,start:t=>this._resizeStart(t),stop:t=>this._resizeStop(t),move:t=>this._resizing(t,e)})),this}_resizeStart(e){this.sizeToContent=q.shouldSizeToContent(this.el.gridstackNode,!0),this.originalRect=this.el.getBoundingClientRect(),this.scrollEl=q.getScrollElement(this.el),this.scrollY=this.scrollEl.scrollTop,this.scrolled=0,this.startEvent=e,q.pauseIframePointerEvents(!0),this._setupHelper(),this._applyChange();const t=q.initEvent(e,{type:"resizestart",target:this.el});return this.option.start&&this.option.start(t,this._ui()),this.el.classList.add("ui-resizable-resizing"),this.triggerEvent("resizestart",t),this}_resizing(e,t){this.scrolled=this.scrollEl.scrollTop-this.scrollY,this.temporalRect=this._getChange(e,t),this._applyChange();const i=q.initEvent(e,{type:"resize",target:this.el});return i.resizeDir=t,i.hasMovedX=this.option.rtl?t.includes("e"):t.includes("w"),i.hasMovedY=t.includes("n"),this.option.resize&&this.option.resize(i,this._ui()),this.triggerEvent("resize",i),this}_resizeStop(e){const t=q.initEvent(e,{type:"resizestop",target:this.el});return q.pauseIframePointerEvents(!1),this._cleanHelper(),this.option.stop&&this.option.stop(t),this.el.classList.remove("ui-resizable-resizing"),this.triggerEvent("resizestop",t),delete this.startEvent,delete this.originalRect,delete this.temporalRect,delete this.scrollY,delete this.scrolled,this}_setupHelper(){this.elOriginStyleVal=qs._originStyleProp.map(i=>this.el.style[i]);const e=this.el.parentElement;this.parentOriginStylePosition=e.style.position;const t=q.getValuesFromTransformedElement(e);return this.rectScale={x:t.xScale,y:t.yScale},getComputedStyle(e).position.match(/static/)&&(e.style.position="relative"),this.el.style.position="absolute",this.el.style.opacity="0.8",this}_cleanHelper(){return qs._originStyleProp.forEach((e,t)=>{this.el.style[e]=this.elOriginStyleVal[t]||null}),this.el.parentElement.style.position=this.parentOriginStylePosition||null,this}_getChange(e,t){const i=this.startEvent,n={width:this.originalRect.width,height:this.originalRect.height+this.scrolled,left:this.originalRect.left,right:this.originalRect.right,top:this.originalRect.top-this.scrolled},s=e.clientX-i.clientX,o=this.sizeToContent?0:e.clientY-i.clientY;let a=!1,c=!1;const l=this.option.rtl;!l&&t.indexOf("e")>-1?n.width+=s:l&&t.indexOf("w")>-1?n.width-=s:!l&&t.indexOf("w")>-1?(n.width-=s,n.left+=s,a=!0):l&&t.indexOf("e")>-1&&(n.width+=s,n.right+=s,a=!0),t.indexOf("s")>-1?n.height+=o:t.indexOf("n")>-1&&(n.height-=o,n.top+=o,c=!0);const h=this._constrainSize(n.width,n.height,a,c);return Math.round(n.width)!==Math.round(h.width)&&(!l&&t.indexOf("w")>-1?n.left+=n.width-h.width:l&&t.indexOf("e")>-1&&(n.right-=n.width-h.width),n.width=h.width),Math.round(n.height)!==Math.round(h.height)&&(t.indexOf("n")>-1&&(n.top+=n.height-h.height),n.height=h.height),n}_constrainSize(e,t,i,n){const s=this.option,o=(i?s.maxWidthMoveLeft:s.maxWidth)||Number.MAX_SAFE_INTEGER,a=(s.minWidth??0)/this.rectScale.x||e,c=(n?s.maxHeightMoveUp:s.maxHeight)||Number.MAX_SAFE_INTEGER,l=(s.minHeight??0)/this.rectScale.y||t,h=Math.min(o,Math.max(a,e)),d=Math.min(c,Math.max(l,t));return{width:h,height:d}}_applyChange(){let e={left:0,right:0,top:0,width:0,height:0};if(this.el.style.position==="absolute"){const i=this.el.parentElement,{left:n,right:s,top:o}=i.getBoundingClientRect();e={left:n,right:s,top:o,width:0,height:0}}if(!this.temporalRect)return this;const t=e;return Object.entries(this.temporalRect).forEach(([i,n])=>{if(this.option.rtl?i==="left":i==="right")return;const s=i==="width"||i==="left"||i==="right"?this.rectScale.x:i==="height"||i==="top"?this.rectScale.y:1;let o;i==="right"?o=(e.right-n)*this.rectScale.x+"px":o=(n-t[i])*s+"px",this.el.style[i]=o}),this}_removeHandlers(){return this.handlers.forEach(e=>e.destroy()),delete this.handlers,this}}qs._originStyleProp=["width","height","position","left","right","top","opacity","zIndex"];const sv='input,textarea,button,select,option,[contenteditable="true"],.ui-resizable-handle';class is extends Ll{constructor(e,t={}){var s;super(),this.el=e,this.option=t,this.dragTransform={xScale:1,yScale:1,xOffset:0,yOffset:0},this._autoScrollTick=()=>{const o=this.helper,a=this._autoScrollContainer;if(!o||!a){this._stopScrolling();return}const c=this._getClipping(o,a);if(c===0){this._stopScrolling();return}if(!this._autoScrollMaxSpeed){const f=window.innerHeight||document.documentElement.clientHeight;this._autoScrollMaxSpeed=Math.max(f/150,4)}const l=Math.abs(c),h=Math.min(l*.5,this._autoScrollMaxSpeed),d=c>0?h:-h,u=a.scrollTop;if(a.scrollTop+=d,a.scrollTop===u){this._stopScrolling();return}this.dragging&&this.lastDrag&&(this._dragFollow(this.lastDrag),this._callDrag(this.lastDrag)),this._autoScrollAnimId=requestAnimationFrame(this._autoScrollTick)};const i=(s=t==null?void 0:t.handle)==null?void 0:s.substring(1),n=e.gridstackNode;this.dragEls=!i||e.classList.contains(i)?[e]:n!=null&&n.subGrid?[e.querySelector(t.handle)||e]:this.getAllHandles(),this.dragEls.length===0&&(this.dragEls=[e]),this._mouseDown=this._mouseDown.bind(this),this._mouseMove=this._mouseMove.bind(this),this._mouseUp=this._mouseUp.bind(this),this._keyEvent=this._keyEvent.bind(this),this.enable()}getAllHandles(){return Array.from(this.el.querySelectorAll(this.option.handle)).filter(e=>{if(!(e instanceof HTMLElement))return!1;const t=e.closest(".grid-stack-item");return t===this.el||!t})}on(e,t){super.on(e,t)}off(e){super.off(e)}enable(){this.disabled!==!1&&(super.enable(),this.dragEls.forEach(e=>{e.addEventListener("mousedown",this._mouseDown),ui&&(e.addEventListener("touchstart",to),e.addEventListener("pointerdown",no))}),this.el.classList.remove("ui-draggable-disabled"))}disable(e=!1){this.disabled!==!0&&(super.disable(),Pl(),this.dragEls.forEach(t=>{t.removeEventListener("mousedown",this._mouseDown),ui&&(t.removeEventListener("touchstart",to),t.removeEventListener("pointerdown",no))}),e||this.el.classList.add("ui-draggable-disabled"))}destroy(){this.dragTimeout&&window.clearTimeout(this.dragTimeout),delete this.dragTimeout,this.mouseDownEvent&&this._mouseUp(this.mouseDownEvent),this.disable(!0),delete this.el,delete this.option,super.destroy()}updateOption(e){return Object.assign(this.option,e),this}refreshHandles(){var n,s;const e=this.disabled;e||this.disable(!0);const t=(s=(n=this.option)==null?void 0:n.handle)==null?void 0:s.substring(1),i=this.el.gridstackNode;this.dragEls=!t||this.el.classList.contains(t)?[this.el]:i!=null&&i.subGrid?[this.el.querySelector(this.option.handle)||this.el]:this.getAllHandles(),this.dragEls.length===0&&(this.dragEls=[this.el]),e||this.enable()}_mouseDown(e){return e.isTrusted&&(vt.touchHandled&&(vt.touchHandled=!1),Te.mouseHandled&&e.timeStamp!==Te.mouseHandledTimeStamp&&delete Te.mouseHandled),Te.mouseHandled||e.button!==0||!this.dragEls.find(t=>t===e.target)&&e.target.closest(sv)||this.option.cancel&&e.target.closest(this.option.cancel)||(this.mouseDownEvent=e,delete this.dragging,delete Te.dragElement,delete Te.dropElement,delete this._autoScrollMaxSpeed,delete this._autoScrollContainer,document.addEventListener("mousemove",this._mouseMove,{capture:!0,passive:!0}),document.addEventListener("mouseup",this._mouseUp,!0),ui&&e.currentTarget&&(e.currentTarget.addEventListener("touchmove",io),e.currentTarget.addEventListener("touchend",nn),e.currentTarget.addEventListener("touchcancel",nn)),vt.wasDelayed&&this.el.classList.add("ui-draggable-armed"),e.preventDefault(),document.activeElement&&document.activeElement.blur(),Te.mouseHandled=!0,Te.mouseHandledTimeStamp=e.timeStamp),!0}_callDrag(e){if(!this.dragging)return;const t=q.initEvent(e,{target:this.el,type:"drag"});this.option.drag&&this.option.drag(t,this.ui()),this.triggerEvent("drag",t)}_mouseMove(e){var i,n;const t=this.mouseDownEvent;if(this.lastDrag=e,this.dragging)if(this._dragFollow(e),Te.pauseDrag){const s=Number.isInteger(Te.pauseDrag)?Te.pauseDrag:100;this.dragTimeout&&window.clearTimeout(this.dragTimeout),this.dragTimeout=window.setTimeout(()=>this._callDrag(e),s)}else this._callDrag(e);else if(Math.abs(e.x-t.x)+Math.abs(e.y-t.y)>3){this.dragging=!0,q.pauseIframePointerEvents(!0),this.el.classList.remove("ui-draggable-armed"),Te.dragElement=this;const s=(i=this.el.gridstackNode)==null?void 0:i.grid;s?Te.dropElement=(n=s.el.ddElement)==null?void 0:n.ddDroppable:delete Te.dropElement,this.helper=this._createHelper(),this._setupHelperContainmentStyle(),this.dragTransform=q.getValuesFromTransformedElement(this.helperContainment),this.dragOffset=this._getDragOffset(e,this.el,this.helperContainment),this._setupHelperStyle(e);const o=q.initEvent(e,{target:this.el,type:"dragstart"});this.option.start&&this.option.start(o,this.ui()),this.triggerEvent("dragstart",o),document.addEventListener("keydown",this._keyEvent)}return!0}_mouseUp(e){var t,i;if(this._stopScrolling(),this.el.classList.remove("ui-draggable-armed"),document.removeEventListener("mousemove",this._mouseMove,!0),document.removeEventListener("mouseup",this._mouseUp,!0),ui&&e.currentTarget&&(e.currentTarget.removeEventListener("touchmove",io,!0),e.currentTarget.removeEventListener("touchend",nn,!0),e.currentTarget.removeEventListener("touchcancel",nn,!0)),this.dragging){delete this.dragging,q.pauseIframePointerEvents(!1),(t=this.el.gridstackNode)==null||delete t._origRotate,document.removeEventListener("keydown",this._keyEvent),((i=Te.dropElement)==null?void 0:i.el)===this.el.parentElement&&delete Te.dropElement,this.helperContainment.style.position=this.parentOriginStylePosition||null,this.helper&&this.helper!==this.el&&this.helper.remove(),this._removeHelperStyle();const n=q.initEvent(e,{target:this.el,type:"dragstop"});this.option.stop&&this.option.stop(n),this.triggerEvent("dragstop",n),Te.dropElement&&Te.dropElement.drop(e)}delete this.helper,delete this.mouseDownEvent,delete Te.dragElement,delete Te.dropElement,delete Te.mouseHandled,delete Te.mouseHandledTimeStamp,e.preventDefault()}_keyEvent(e){var n,s;const t=this.el.gridstackNode,i=(t==null?void 0:t.grid)||((s=(n=Te.dropElement)==null?void 0:n.el)==null?void 0:s.gridstack);if(e.key==="Escape")t&&t._origRotate&&(t._orig=t._origRotate,delete t._origRotate),i==null||i.cancelDrag(),this._mouseUp(this.mouseDownEvent);else if(t&&i&&(e.key==="r"||e.key==="R")){if(!q.canBeRotated(t))return;t._origRotate=t._origRotate||{...t._orig},delete t._moving,i.setAnimation(!1).rotate(t.el,{top:-this.dragOffset.offsetTop,left:-this.dragOffset.offsetX}).setAnimation(),t._moving=!0,this.dragOffset=this._getDragOffset(this.lastDrag,t.el,this.helperContainment),this.helper.style.width=this.dragOffset.width+"px",this.helper.style.height=this.dragOffset.height+"px",q.swap(t._orig,"w","h"),delete t._rect,this._mouseMove(this.lastDrag)}}_createHelper(){let e=this.el;return typeof this.option.helper=="function"?e=this.option.helper(this.el):this.option.helper==="clone"&&(e=q.cloneNode(this.el)),e.parentElement||q.appendTo(e,this.option.appendTo==="parent"?this.el.parentElement:this.option.appendTo??"body"),this.dragElementOriginStyle=is.originStyleProp.map(t=>this.el.style[t]),e}_setupHelperStyle(e){var i,n;this.helper.classList.add("ui-draggable-dragging"),(n=(i=this.el.gridstackNode)==null?void 0:i.grid)==null||n.el.classList.add("grid-stack-dragging");const t=this.helper.style;return t.pointerEvents="none",t.width=this.dragOffset.width+"px",t.height=this.dragOffset.height+"px",t.willChange="left, right, top",t.position="fixed",this._dragFollow(e),t.transition="none",setTimeout(()=>{this.helper&&(t.transition=null)},0),this}_removeHelperStyle(){var t,i,n;this.helper.classList.remove("ui-draggable-dragging"),(i=(t=this.el._gridstackNodeOrig||this.el.gridstackNode)==null?void 0:t.grid)==null||i.el.classList.remove("grid-stack-dragging");const e=(n=this.helper)==null?void 0:n.gridstackNode;if(!(e!=null&&e._isAboutToRemove)&&this.dragElementOriginStyle){const s=this.helper,o=this.dragElementOriginStyle,a=is.originStyleProp.indexOf("transition"),c=o[a]||null;s.style.transition=o[a]="none";const l=s.style;is.originStyleProp.forEach((h,d)=>l[h]=o[d]||null),setTimeout(()=>s.style.transition=c||"",50)}return delete this.dragElementOriginStyle,this}_dragFollow(e){const t=this.helper.style,i=this.dragOffset;this.option.rtl?(t.right=(window.innerWidth-e.clientX+i.offsetX)*this.dragTransform.xScale+"px",t.left&&(t.left="")):(t.left=(e.clientX+i.offsetX)*this.dragTransform.xScale+"px",t.right&&(t.right="")),t.top=(e.clientY+i.offsetTop)*this.dragTransform.yScale+"px"}_setupHelperContainmentStyle(){return this.helperContainment=this.helper.parentElement,this.helper.style.position!=="fixed"&&(this.parentOriginStylePosition=this.helperContainment.style.position,getComputedStyle(this.helperContainment).position.match(/static/)&&(this.helperContainment.style.position="relative")),this}_getDragOffset(e,t,i){let n=0,s=0;i&&(n=this.dragTransform.xOffset,s=this.dragTransform.yOffset);const o=t.getBoundingClientRect();let a=this.option.rtl?o.right:o.left,c=this.option.rtl?e.clientX-o.right+n:-e.clientX+o.left-n;return{x:a,top:o.top,offsetX:c,offsetTop:-e.clientY+o.top-s,width:o.width*this.dragTransform.xScale,height:o.height*this.dragTransform.yScale}}updateScrollPosition(e){this._autoScrollContainer=q.getScrollElement(e),this._getClipping(this.helper,this._autoScrollContainer)===0?this._stopScrolling():this._autoScrollAnimId||(this._autoScrollAnimId=requestAnimationFrame(this._autoScrollTick))}_getClipping(e,t){const i=e.getBoundingClientRect(),n=t.getBoundingClientRect(),s=window.innerHeight||document.documentElement.clientHeight;if(i.bottom<n.top||i.top>n.bottom)return 0;const o=i.bottom-Math.min(n.bottom,s),a=i.top-Math.max(n.top,0);return a<0?a:o>0?o:0}_stopScrolling(){this._autoScrollAnimId&&(cancelAnimationFrame(this._autoScrollAnimId),delete this._autoScrollAnimId)}ui(){const t=this.el.parentElement.getBoundingClientRect(),i=this.helper.getBoundingClientRect(),n=this.option.rtl?(t.right-i.right)*this.dragTransform.xScale:(i.left-t.left)*this.dragTransform.xScale;return{position:{top:(i.top-t.top)*this.dragTransform.yScale,left:n}}}}is.originStyleProp=["width","height","transform","transform-origin","transition","pointerEvents","position","left","right","top","minWidth","willChange"];class rv extends Ll{constructor(e,t={}){super(),this.el=e,this.option=t,this._mouseEnter=this._mouseEnter.bind(this),this._mouseLeave=this._mouseLeave.bind(this),this.eventEl=this.el.closest(".grid-stack-item")||this.el,this.enable(),this._setupAccept()}on(e,t){super.on(e,t)}off(e){super.off(e)}enable(){this.disabled!==!1&&(super.enable(),this.el.classList.add("ui-droppable"),this.el.classList.remove("ui-droppable-disabled"),this.eventEl.addEventListener("mouseenter",this._mouseEnter),this.eventEl.addEventListener("mouseleave",this._mouseLeave),ui&&(this.eventEl.addEventListener("pointerenter",Rh),this.eventEl.addEventListener("pointerleave",Ch)))}disable(e=!1){this.disabled!==!0&&(super.disable(),this.el.classList.remove("ui-droppable"),e||this.el.classList.add("ui-droppable-disabled"),this.eventEl.removeEventListener("mouseenter",this._mouseEnter),this.eventEl.removeEventListener("mouseleave",this._mouseLeave),ui&&(this.eventEl.removeEventListener("pointerenter",Rh),this.eventEl.removeEventListener("pointerleave",Ch)))}destroy(){this.disable(!0),this.el.classList.remove("ui-droppable"),this.el.classList.remove("ui-droppable-disabled"),super.destroy()}updateOption(e){return Object.assign(this.option,e),this._setupAccept(),this}_mouseEnter(e){if(!Te.dragElement||vt.touchHandled&&e.isTrusted||!this._canDrop(Te.dragElement.el))return;e.preventDefault(),e.stopPropagation(),Te.dragElement._stopScrolling(),Te.dropElement&&Te.dropElement!==this&&Te.dropElement._mouseLeave(e,!0),Te.dropElement=this;const t=q.initEvent(e,{target:this.el,type:"dropover"});this.option.over&&this.option.over(t,this._ui(Te.dragElement)),this.triggerEvent("dropover",t),this.el.classList.add("ui-droppable-over")}_mouseLeave(e,t=!1){var n;if(!Te.dragElement||Te.dropElement!==this)return;e.preventDefault(),e.stopPropagation(),t&&Te.dragElement._stopScrolling();const i=q.initEvent(e,{target:this.el,type:"dropout"});if(this.option.out&&this.option.out(i,this._ui(Te.dragElement)),this.triggerEvent("dropout",i),Te.dropElement===this&&(delete Te.dropElement,!t)){let s,o=this.el.parentElement;for(;!s&&o;)s=(n=o.ddElement)==null?void 0:n.ddDroppable,o=o.parentElement;s&&s._mouseEnter(e)}}drop(e){e.preventDefault();const t=q.initEvent(e,{target:this.el,type:"drop"});this.option.drop&&this.option.drop(t,this._ui(Te.dragElement)),this.triggerEvent("drop",t)}_canDrop(e){return e&&(!this.accept||this.accept(e))}_setupAccept(){return this.option.accept?(typeof this.option.accept=="string"?this.accept=e=>e.classList.contains(this.option.accept)||e.matches(this.option.accept):this.accept=this.option.accept,this):this}_ui(e){return{draggable:e.el,...e.ui()}}}class Nl{static init(e){return e.ddElement||(e.ddElement=new Nl(e)),e.ddElement}constructor(e){this.el=e}on(e,t){return this.ddDraggable&&["drag","dragstart","dragstop"].indexOf(e)>-1?this.ddDraggable.on(e,t):this.ddDroppable&&["drop","dropover","dropout"].indexOf(e)>-1?this.ddDroppable.on(e,t):this.ddResizable&&["resizestart","resize","resizestop"].indexOf(e)>-1&&this.ddResizable.on(e,t),this}off(e){return this.ddDraggable&&["drag","dragstart","dragstop"].indexOf(e)>-1?this.ddDraggable.off(e):this.ddDroppable&&["drop","dropover","dropout"].indexOf(e)>-1?this.ddDroppable.off(e):this.ddResizable&&["resizestart","resize","resizestop"].indexOf(e)>-1&&this.ddResizable.off(e),this}setupDraggable(e){return this.ddDraggable?this.ddDraggable.updateOption(e):this.ddDraggable=new is(this.el,e),this}cleanDraggable(){return this.ddDraggable&&(this.ddDraggable.destroy(),delete this.ddDraggable),this}setupResizable(e){return this.ddResizable?this.ddResizable.updateOption(e):this.ddResizable=new qs(this.el,e),this}cleanResizable(){return this.ddResizable&&(this.ddResizable.destroy(),delete this.ddResizable),this}setupDroppable(e){return this.ddDroppable?this.ddDroppable.updateOption(e):this.ddDroppable=new rv(this.el,e),this}cleanDroppable(){return this.ddDroppable&&(this.ddDroppable.destroy(),delete this.ddDroppable),this}}class ov{resizable(e,t,i,n){return this._getDDElements(e,typeof t=="string"?t:void 0).forEach(s=>{if(t==="disable"||t==="enable")s.ddResizable&&s.ddResizable[t]();else if(t==="destroy")s.ddResizable&&s.cleanResizable();else if(t==="option")s.setupResizable({[i]:n});else{const a=s.el.gridstackNode.grid;let c=s.el.getAttribute("gs-resize-handles")||a.opts.resizable.handles||"e,s,se";c==="all"&&(c="n,e,s,w,se,sw,ne,nw");const l=!a.opts.alwaysShowResizeHandle,h=t;s.setupResizable({...a.opts.resizable,handles:c,autoHide:l,start:h.start,stop:h.stop,resize:h.resize,rtl:h.rtl})}}),this}draggable(e,t,i,n){return this._getDDElements(e,typeof t=="string"?t:void 0).forEach(s=>{if(t==="disable"||t==="enable")s.ddDraggable&&s.ddDraggable[t]();else if(t==="destroy")s.ddDraggable&&s.cleanDraggable();else if(t==="option")s.setupDraggable({[i]:n});else{const o=s.el.gridstackNode.grid,a=t;s.setupDraggable({...o.opts.draggable,start:a.start,stop:a.stop,drag:a.drag,rtl:a.rtl})}}),this}dragIn(e,t){return this._getDDElements(e).forEach(i=>i.setupDraggable(t)),this}droppable(e,t,i,n){if(typeof t!="string"){const o=t;typeof o.accept=="function"&&!o._accept&&(o._accept=o.accept,o.accept=a=>o._accept(a))}const s=typeof t=="string"?t:void 0;return this._getDDElements(e,s).forEach(o=>{t==="disable"||t==="enable"?o.ddDroppable&&o.ddDroppable[t]():t==="destroy"?o.ddDroppable&&o.cleanDroppable():t==="option"?o.setupDroppable({[i]:n}):o.setupDroppable(t)}),this}isDroppable(e){var t;return!!((t=e==null?void 0:e.ddElement)!=null&&t.ddDroppable&&!e.ddElement.ddDroppable.disabled)}isDraggable(e){var t;return!!((t=e==null?void 0:e.ddElement)!=null&&t.ddDraggable&&!e.ddElement.ddDraggable.disabled)}isResizable(e){var t;return!!((t=e==null?void 0:e.ddElement)!=null&&t.ddResizable&&!e.ddElement.ddResizable.disabled)}on(e,t,i){return this._getDDElements(e).forEach(n=>n.on(t,s=>{i(s,Te.dragElement?Te.dragElement.el:s.target,Te.dragElement?Te.dragElement.helper:void 0)})),this}off(e,t){return this._getDDElements(e).forEach(i=>i.off(t)),this}_getDDElements(e,t){const i=e.gridstack||t!=="destroy"&&t!=="disable",n=q.getElements(e);return n.length?n.map(o=>o.ddElement||(i?Nl.init(o):null)).filter(o=>!!o):[]}}/*!
 * GridStack 13.3.0
 * https://gridstackjs.com/
 *
 * Copyright (c) 2021-2025  Alain Dumesny
 * see root license https://github.com/gridstack/gridstack.js/tree/master/LICENSE
 */const Ht=new ov;class Ce{static init(e={},t=".grid-stack"){if(typeof document>"u")return null;const i=Ce.getGridElement(t);return i?(i.gridstack||(i.gridstack=new Ce(i,q.cloneDeep(e))),i.gridstack):(console.error(typeof t=="string"?'GridStack.initAll() no grid was found with selector "'+t+`" - element missing or wrong selector ?
Note: ".grid-stack" is required for proper CSS styling and drag/drop, and is the default selector.`:"GridStack.init() no grid element was passed."),null)}static initAll(e={},t=".grid-stack"){const i=[];return typeof document>"u"||(Ce.getGridElements(t).forEach(n=>{n.gridstack||(n.gridstack=new Ce(n,q.cloneDeep(e))),i.push(n.gridstack)}),i.length===0&&console.error('GridStack.initAll() no grid was found with selector "'+t+`" - element missing or wrong selector ?
Note: ".grid-stack" is required for proper CSS styling and drag/drop, and is the default selector.`)),i}static addGrid(e,t={}){if(!e)return null;let i=e;if(i.gridstack){const o=i.gridstack;return t&&(o.opts={...o.opts,...t}),t.children!==void 0&&o.load(t.children),o}return(!e.classList.contains("grid-stack")||Ce.addRemoveCB)&&(Ce.addRemoveCB?i=Ce.addRemoveCB(e,t,!0,!0):i=q.createDiv(["grid-stack",t.class],e)),Ce.init(t,i)}static registerEngine(e){Ce.engineClass=e}get placeholder(){if(!this._placeholder){this._placeholder=q.createDiv([this.opts.placeholderClass,Jt.itemClass,this.opts.itemClass]);const e=q.createDiv(["placeholder-content"],this._placeholder);this.opts.placeholderText&&(e.textContent=this.opts.placeholderText)}return this._placeholder}constructor(e,t={}){var l;this.el=e,this.opts=t,this.animationDelay=310,this._gsEventHandler={},this._extraDragRow=0,this.dragTransform={xScale:1,yScale:1,xOffset:0,yOffset:0},e.gridstack=this,this.opts=t=t||{},e.classList.contains("grid-stack")||this.el.classList.add("grid-stack"),t.row&&(t.minRow=t.maxRow=t.row,delete t.row);const i=q.toNumber(e.getAttribute("gs-row"));t.column==="auto"&&delete t.column,t.alwaysShowResizeHandle!==void 0&&(t._alwaysShowResizeHandle=t.alwaysShowResizeHandle);const n=t.columnOpts;if(n){const h=n.breakpoints;!n.columnWidth&&!(h!=null&&h.length)?delete t.columnOpts:h&&h.length>1?(h.sort((d,u)=>(u.w||0)-(d.w||0)),delete n.columnWidth):n.columnMax=n.columnMax||12}const s={...q.cloneDeep(Jt),column:q.toNumber(e.getAttribute("gs-column"))||Jt.column,minRow:i||q.toNumber(e.getAttribute("gs-min-row"))||Jt.minRow,maxRow:i||q.toNumber(e.getAttribute("gs-max-row"))||Jt.maxRow,staticGrid:q.toBool(e.getAttribute("gs-static"))||Jt.staticGrid,sizeToContent:q.toBool(e.getAttribute("gs-size-to-content"))||void 0,draggable:{handle:(t.handleClass?"."+t.handleClass:t.handle?t.handle:"")||Jt.draggable.handle},removableOptions:{accept:t.itemClass||Jt.removableOptions.accept,decline:Jt.removableOptions.decline}};e.getAttribute("gs-animate")&&(s.animate=q.toBool(e.getAttribute("gs-animate"))),t=q.defaults(t,s),this._initMargin(),this.checkDynamicColumn(),this._updateColumnVar(t),t.rtl==="auto"&&(t.rtl=e.style.direction==="rtl"),t.rtl&&this.el.classList.add("grid-stack-rtl");const o=this.el.closest("."+Jt.itemClass),a=o==null?void 0:o.gridstackNode;if(a&&(a.subGrid=this,this.parentGridNode=a,this.el.classList.add("grid-stack-nested"),a.el.classList.add("grid-stack-sub-grid")),this._isAutoCellHeight=t.cellHeight==="auto",this._isAutoCellHeight||t.cellHeight==="initial")this.cellHeight(void 0);else{typeof t.cellHeight=="number"&&t.cellHeightUnit&&t.cellHeightUnit!==Jt.cellHeightUnit&&(t.cellHeight=t.cellHeight+t.cellHeightUnit,delete t.cellHeightUnit);const h=t.cellHeight;delete t.cellHeight,this.cellHeight(h)}t.alwaysShowResizeHandle==="mobile"&&(t.alwaysShowResizeHandle=ui),this._setStaticClass();const c=t.engineClass||Ce.engineClass||Di;if(this.engine=new c({column:this.getColumn(),float:t.float,maxRow:t.maxRow,onChange:h=>{h.forEach(d=>{const u=d.el;u&&(d._removeDOM?(u&&u.remove(),delete d._removeDOM):this._writePosAttr(u,d))}),this._updateContainerHeight()}}),t.auto&&(this.batchUpdate(),this.engine._loading=!0,this.getGridItems().forEach(h=>this._prepareElement(h)),delete this.engine._loading,this.batchUpdate(!1)),t.children){const h=t.children;delete t.children,h.length&&this.load(h)}this.setAnimation(),t.subGridDynamic&&!Te.pauseDrag&&(Te.pauseDrag=!0),((l=t.draggable)==null?void 0:l.pause)!==void 0&&(Te.pauseDrag=t.draggable.pause),this._setupRemoveDrop(),this._setupAcceptWidget(),this._updateResizeEvent()}_updateColumnVar(e=this.opts){this.el.classList.add("gs-"+e.column),typeof e.column=="number"&&(this.el.style.setProperty("--gs-column-width",`${100/e.column}%`),this.el.style.setProperty("--gs-columns",String(e.column)))}addWidget(e){if(!e)return;if(typeof e=="string"){console.error("V11: GridStack.addWidget() does not support string anymore. see #2736");return}if(e.ELEMENT_NODE)return console.error("V11: GridStack.addWidget() does not support HTMLElement anymore. use makeWidget()"),this.makeWidget(e);let t,i=e;if(i.grid=this,i.el?t=i.el:Ce.addRemoveCB?t=Ce.addRemoveCB(this.el,e,!0,!1):t=this.createWidgetDivs(i),!t)return;if(i=t.gridstackNode,i&&t.parentElement===this.el&&this.engine.nodes.find(s=>s._id===i._id))return t;const n=this._readAttr(t);return q.defaults(e,n),this.engine.prepareNode(e),this.el.appendChild(t),this.makeWidget(t,e),t}createWidgetDivs(e){const t=q.createDiv(["grid-stack-item",this.opts.itemClass]),i=q.createDiv(["grid-stack-item-content"],t);return q.lazyLoad(e)?e.visibleObservable||(e.visibleObservable=new IntersectionObserver(([n])=>{var s,o;n.isIntersecting&&((s=e.visibleObservable)==null||s.disconnect(),delete e.visibleObservable,Ce.renderCB(i,e),(o=e.grid)==null||o.prepareDragDrop(e.el))}),window.setTimeout(()=>{var n;return(n=e.visibleObservable)==null?void 0:n.observe(t)})):Ce.renderCB(i,e),t}makeSubGrid(e,t,i,n=!0){var f,g,v;let s=e.gridstackNode;if(s||(s=this.makeWidget(e).gridstackNode),(f=s.subGrid)!=null&&f.el)return s.subGrid;let o,a=this;for(;a&&!o;)o=(g=a.opts)==null?void 0:g.subGridOpts,a=(v=a.parentGridNode)==null?void 0:v.grid;t=q.cloneDeep({...this.opts,id:void 0,children:void 0,column:"auto",columnOpts:void 0,layout:"list",subGridOpts:void 0,...o||{},...t||s.subGridOpts||{}}),s.subGridOpts=t;let c=!1;t.column==="auto"&&(c=!0,t.column=Math.max(s.w||1,(i==null?void 0:i.w)||1),delete t.columnOpts);let l=s.el.querySelector(".grid-stack-item-content"),h,d;if(n&&(this._removeDD(s.el),d={...s,x:0,y:0},q.removeInternalForSave(d),delete d.subGridOpts,s.content&&(d.content=s.content,delete s.content),Ce.addRemoveCB?h=Ce.addRemoveCB(this.el,d,!0,!1)||void 0:(h=q.createDiv(["grid-stack-item"]),h.appendChild(l),l=q.createDiv(["grid-stack-item-content"],s.el)),this.prepareDragDrop(s.el)),i){const m=c?t.column:s.w,p=s.h+i.h,E=s.el.style;E.transition="none",this.update(s.el,{w:m,h:p}),setTimeout(()=>E.transition="")}const u=s.subGrid=Ce.addGrid(l,t)||void 0;return i!=null&&i._moving&&(u._isTemp=!0),c&&(u._autoColumn=!0),n&&u.makeWidget(h,d),i&&(i._moving?window.setTimeout(()=>q.simulateMouseEvent(i._event,"mouseenter",u.el),0):u.makeWidget(s.el,s)),this.resizeToContentCheck(!1,s),u}removeAsSubGrid(e){var i,n;const t=(i=this.parentGridNode)==null?void 0:i.grid;if(t&&(t.batchUpdate(),t.removeWidget(this.parentGridNode.el,!0,!0),this.engine.nodes.forEach(s=>{s.x=(s.x??0)+(this.parentGridNode.x??0),s.y=(s.y??0)+(this.parentGridNode.y??0),this._removeDD(s.el),s.el.remove(),delete s.el.gridstackNode,t.makeWidget(s.el,s)}),t.batchUpdate(!1),this.parentGridNode&&delete this.parentGridNode.subGrid,delete this.parentGridNode,e)){const s=(n=e.el)==null?void 0:n.gridstackNode;s&&s!==e&&(s._temporaryRemoved=!0),window.setTimeout(()=>{var a;const o=((a=Te.dragElement)==null?void 0:a.lastDrag)||e._event;o&&q.simulateMouseEvent(o,"mouseenter",t.el)},0)}}save(e=!0,t=!1,i=Ce.saveCB,n){const s=this.engine.save(e,i,n);if(s.forEach(o=>{var a;if(e&&o.el&&!o.subGrid&&!i){const c=o.el.querySelector(".grid-stack-item-content");o.content=c==null?void 0:c.innerHTML,o.content||delete o.content}else if(!e&&!i&&delete o.content,(a=o.subGrid)!=null&&a.el){const c=o.w||o.subGrid.getColumn(),l=o.subGrid.save(e,t,i,c);o.subGridOpts=t?l:{children:l},delete o.subGrid}delete o.el}),t){const o=q.cloneDeep(this.opts);o.marginBottom===o.marginTop&&o.marginRight===o.marginLeft&&o.marginTop===o.marginRight&&(o.margin=o.marginTop,delete o.marginTop,delete o.marginRight,delete o.marginBottom,delete o.marginLeft),o.rtl===(this.el.style.direction==="rtl")&&(o.rtl="auto"),this._isAutoCellHeight&&(o.cellHeight="auto"),this._autoColumn&&(o.column="auto");const a=o._alwaysShowResizeHandle;return delete o._alwaysShowResizeHandle,a!==void 0?o.alwaysShowResizeHandle=a:delete o.alwaysShowResizeHandle,q.removeInternalAndSame(o,Jt),o.children=s,o}return s}load(e,t=Ce.addRemoveCB||!0){e.forEach(h=>{h.w=h.w||h.minW||1,h.h=h.h||h.minH||1}),e=q.sort(e),this.engine.skipCacheUpdate=this._ignoreLayoutsNodeChange=!0;let i=0;e.forEach(h=>{i=Math.max(i,(h.x||0)+h.w)}),i>this.engine.defaultColumn&&(this.engine.defaultColumn=i);const n=this.getColumn();i>n&&(this.engine.nodes.length===0&&this.responseLayout?(this.engine.nodes=e,this.engine.columnChanged(i,n,this.responseLayout),e=this.engine.nodes,this.engine.nodes=[],delete this.responseLayout):this.engine.cacheLayout(e,i,!0));const s=Ce.addRemoveCB;typeof t=="function"&&(Ce.addRemoveCB=t);const o=[];this.batchUpdate();const a=!this.engine.nodes.length,c=a&&this.opts.animate;c&&this.setAnimation(!1),!a&&t&&[...this.engine.nodes].forEach(d=>{if(!d.id)return;q.find(e,d.id)||(Ce.addRemoveCB&&Ce.addRemoveCB(this.el,d,!1,!1),o.push(d),this.removeWidget(d.el,!0,!1))}),this.engine._loading=!0;const l=[];return this.engine.nodes=this.engine.nodes.filter(h=>h.id&&q.find(e,h.id)?(l.push(h),!1):!0),e.forEach(h=>{var u;const d=h.id?q.find(l,h.id):void 0;if(d){if(q.shouldSizeToContent(d)&&(h.h=d.h),this.engine.nodeBoundFix(h),(h.autoPosition||h.x===void 0||h.y===void 0)&&(h.w=h.w||d.w,h.h=h.h||d.h,this.engine.findEmptyPosition(h)),this.engine.nodes.push(d),q.samePos(d,h)&&this.engine.nodes.length>1&&(this.moveNode(d,{...h,forceCollide:!0}),q.copyPos(h,d)),this.update(d.el,h),(u=h.subGridOpts)!=null&&u.children){const f=d.el.querySelector(".grid-stack");f&&f.gridstack&&f.gridstack.load(h.subGridOpts.children)}}else t&&this.addWidget(h)}),delete this.engine._loading,this.engine.removedNodes=o,this.batchUpdate(!1),delete this._ignoreLayoutsNodeChange,delete this.engine.skipCacheUpdate,s?Ce.addRemoveCB=s:delete Ce.addRemoveCB,c&&this.setAnimation(!0,!0),this}batchUpdate(e=!0){return this.engine.batchUpdate(e),e||(this._updateContainerHeight(),this._triggerRemoveEvent(),this._triggerAddEvent(),this._triggerChangeEvent()),this}getCellHeight(e=!1){if(this.opts.cellHeight&&this.opts.cellHeight!=="auto"&&(!e||!this.opts.cellHeightUnit||this.opts.cellHeightUnit==="px"))return this.opts.cellHeight;if(this.opts.cellHeightUnit==="rem")return this.opts.cellHeight*parseFloat(getComputedStyle(document.documentElement).fontSize);if(this.opts.cellHeightUnit==="em")return this.opts.cellHeight*parseFloat(getComputedStyle(this.el).fontSize);if(this.opts.cellHeightUnit==="cm")return this.opts.cellHeight*(96/2.54);if(this.opts.cellHeightUnit==="mm")return this.opts.cellHeight*(96/2.54)/10;const t=this.el.querySelector("."+this.opts.itemClass);if(t){const n=q.toNumber(t.getAttribute("gs-h"))||1;return Math.round(t.offsetHeight/n)}const i=parseInt(this.el.getAttribute("gs-current-row")||"0");return i?Math.round(this.el.getBoundingClientRect().height/i):this.opts.cellHeight}cellHeight(e){if(e!==void 0&&this._isAutoCellHeight!==(e==="auto")&&(this._isAutoCellHeight=e==="auto",this._updateResizeEvent()),(e==="initial"||e==="auto")&&(e=void 0),e===void 0){const i=-this.opts.marginRight-this.opts.marginLeft+this.opts.marginTop+this.opts.marginBottom;e=this.cellWidth()+i}const t=q.parseHeight(e);return this.opts.cellHeightUnit===t.unit&&this.opts.cellHeight===t.h?this:(this.opts.cellHeightUnit=t.unit,this.opts.cellHeight=t.h,this.el.style.setProperty("--gs-cell-height",`${this.opts.cellHeight}${this.opts.cellHeightUnit}`),this._updateContainerHeight(),this.resizeToContentCheck(),this)}cellWidth(){return this._widthOrContainer()/this.getColumn()}_widthOrContainer(e=!1){var t;return e&&((t=this.opts.columnOpts)!=null&&t.breakpointForWindow)?window.innerWidth:this.el.clientWidth||this.el.parentElement.clientWidth||window.innerWidth}checkDynamicColumn(){var s,o;const e=this.opts.columnOpts;if(!e||!e.columnWidth&&!((s=e.breakpoints)!=null&&s.length))return!1;const t=this.getColumn();let i=t;const n=this._widthOrContainer(!0);if(e.columnWidth)i=Math.min(Math.round(n/e.columnWidth)||1,e.columnMax);else{i=e.columnMax;let a=0;for(;a<e.breakpoints.length&&n<=e.breakpoints[a].w;)i=e.breakpoints[a++].c||t}if(i!==t){const a=(o=e.breakpoints)==null?void 0:o.find(c=>c.c===i);return this.column(i,(a==null?void 0:a.layout)||e.layout),!0}return!1}compact(e="compact",t=!0){return this.engine.compact(e,t),this._triggerChangeEvent(),this}column(e,t="moveScale"){if(!e||e<1||this.opts.column===e)return this;const i=this.getColumn();return this.opts.column=e,this.engine?(this.engine.column=e,this.el.classList.remove("gs-"+i),this._updateColumnVar(),this.engine.columnChanged(i,e,t),this._isAutoCellHeight&&this.cellHeight(),this.resizeToContentCheck(!0),this._ignoreLayoutsNodeChange=!0,this._triggerChangeEvent(),delete this._ignoreLayoutsNodeChange,this):(this.responseLayout=t,this)}getColumn(){return this.opts.column}getGridItems(){return Array.from(this.el.children).filter(e=>e.matches("."+this.opts.itemClass)&&!e.matches("."+this.opts.placeholderClass))}isIgnoreChangeCB(){return!!this._ignoreLayoutsNodeChange}destroy(e=!0){var t;return this.el?(this.offAll(),this._updateResizeEvent(!0),this.setStatic(!0,!1),this.setAnimation(!1),e?this.el.parentNode.removeChild(this.el):(this.removeAll(e),this.el.removeAttribute("gs-current-row")),this.parentGridNode&&delete this.parentGridNode.subGrid,delete this.parentGridNode,delete this.opts,(t=this._placeholder)==null||delete t.gridstackNode,delete this._placeholder,delete this.engine,delete this.el.gridstack,delete this.el,this):this}float(e){return this.opts.float!==e&&(this.opts.float=this.engine.float=e,this._triggerChangeEvent()),this}getFloat(){return this.engine.float}getCellFromPixel(e,t=!1){const i=this.el.getBoundingClientRect();let n;t?n={top:i.top+document.documentElement.scrollTop,left:i.left}:n={top:this.el.offsetTop,left:this.el.offsetLeft};const s=e.left-n.left,o=e.top-n.top,a=i.width/this.getColumn(),c=i.height/parseInt(this.el.getAttribute("gs-current-row")||"0");return{x:Math.floor(s/a),y:Math.floor(o/c)}}getRow(){return Math.max(this.engine.getRow(),this.opts.minRow||0)}isAreaEmpty(e,t,i,n){return this.engine.isAreaEmpty(e,t,i,n)}makeWidget(e,t){const i=Ce.getElement(e);if(!i||i.gridstackNode)return i;i.parentElement||this.el.appendChild(i),this._prepareElement(i,!0,t);const n=i.gridstackNode;this._updateContainerHeight(),n.subGridOpts&&this.makeSubGrid(i,n.subGridOpts,void 0,!1);let s=!1;return this.opts.column===1&&!this._ignoreLayoutsNodeChange&&(s=this._ignoreLayoutsNodeChange=!0),this._triggerAddEvent(),this._triggerChangeEvent(),s&&delete this._ignoreLayoutsNodeChange,i}on(e,t){return e.indexOf(" ")!==-1?(e.split(" ").forEach(n=>this.on(n,t)),this):(e==="change"||e==="added"||e==="removed"||e==="enable"||e==="disable"?(e==="enable"||e==="disable"?this._gsEventHandler[e]=n=>t(n):this._gsEventHandler[e]=n=>{n.detail&&t(n,n.detail)},this.el.addEventListener(e,this._gsEventHandler[e])):e==="drag"||e==="dragstart"||e==="dragstop"||e==="resizestart"||e==="resize"||e==="resizestop"||e==="dropped"||e==="resizecontent"?this._gsEventHandler[e]=t:console.error("GridStack.on("+e+") event not supported"),this)}off(e){return e.indexOf(" ")!==-1?(e.split(" ").forEach(i=>this.off(i)),this):((e==="change"||e==="added"||e==="removed"||e==="enable"||e==="disable")&&this._gsEventHandler[e]&&this.el.removeEventListener(e,this._gsEventHandler[e]),delete this._gsEventHandler[e],this)}offAll(){return Object.keys(this._gsEventHandler).forEach(e=>this.off(e)),this}removeWidget(e,t=!0,i=!0){return e?(Ce.getElements(e).forEach(n=>{if(n.parentElement&&n.parentElement!==this.el)return;let s=n.gridstackNode;s||(s=this.engine.nodes.find(o=>n===o.el)),s&&(t&&Ce.addRemoveCB&&Ce.addRemoveCB(this.el,s,!1,!1),delete n.gridstackNode,this._removeDD(n),this.engine.removeNode(s,t,i),t&&n.parentElement&&n.remove())}),i&&(this._triggerRemoveEvent(),this._triggerChangeEvent()),this):(console.error("Error: GridStack.removeWidget(undefined) called"),this)}removeAll(e=!0,t=!0){return this.engine.nodes.forEach(i=>{e&&Ce.addRemoveCB&&Ce.addRemoveCB(this.el,i,!1,!1),delete i.el.gridstackNode,this.opts.staticGrid||this._removeDD(i.el)}),this.engine.removeAll(e,t),t&&this._triggerRemoveEvent(),this}setAnimation(e=this.opts.animate,t){return t?setTimeout(()=>{this.opts&&this.setAnimation(e)}):e?this.el.classList.add("grid-stack-animate"):this.el.classList.remove("grid-stack-animate"),this.opts.animate=e,this}hasAnimationCSS(){return this.el.classList.contains("grid-stack-animate")}setStatic(e,t=!0,i=!0){return!!this.opts.staticGrid===e?this:(e?this.opts.staticGrid=!0:delete this.opts.staticGrid,this._setupRemoveDrop(),this._setupAcceptWidget(),this.engine.nodes.forEach(n=>{this.prepareDragDrop(n.el),n.subGrid&&i&&n.subGrid.setStatic(e,t,i)}),t&&this._setStaticClass(),this)}updateOptions(e){var i;const t=this.opts;if(e===t)return this;if(e.acceptWidgets!==void 0&&(t.acceptWidgets=e.acceptWidgets,this._setupAcceptWidget()),e.animate!==void 0&&this.setAnimation(e.animate),e.cellHeight&&this.cellHeight(e.cellHeight),e.class!==void 0&&e.class!==t.class&&(t.class&&this.el.classList.remove(t.class),e.class&&this.el.classList.add(e.class)),e.columnOpts){const n=!!this.opts.columnOpts;this.opts.columnOpts=e.columnOpts,n!==!!this.opts.columnOpts&&this._updateResizeEvent(),this.checkDynamicColumn()}else e.columnOpts===null&&this.opts.columnOpts?(delete this.opts.columnOpts,this._updateResizeEvent()):typeof e.column=="number"&&this.column(e.column);return e.margin!==void 0&&this.margin(e.margin),e.staticGrid!==void 0&&this.setStatic(e.staticGrid),e.disableDrag!==void 0&&!e.staticGrid&&this.enableMove(!e.disableDrag),e.disableResize!==void 0&&!e.staticGrid&&this.enableResize(!e.disableResize),e.float!==void 0&&this.float(e.float),e.row!==void 0?(t.minRow=t.maxRow=this.engine.maxRow=t.row=e.row,this._updateContainerHeight(),this.engine.getRow()>e.row&&this.compact()):(e.minRow!==void 0&&(t.minRow=e.minRow,this._updateContainerHeight()),e.maxRow!==void 0&&(t.maxRow=this.engine.maxRow=e.maxRow,this.engine.getRow()>e.maxRow&&this.compact())),e.lazyLoad!==void 0&&(t.lazyLoad=e.lazyLoad),(i=e.children)!=null&&i.length&&this.load(e.children),this}update(e,t){return Ce.getElements(e).forEach(i=>{var u;const n=i==null?void 0:i.gridstackNode;if(!n)return;const s={...q.copyPos({},n),...q.cloneDeep(t)};this.engine.nodeBoundFix(s),delete s.autoPosition;const o=["x","y","w","h"];let a;const c=s,l=n;if(o.some(f=>c[f]!==void 0&&c[f]!==l[f])){a={};const f=a;o.forEach(g=>{f[g]=c[g]!==void 0?c[g]:l[g],delete c[g]})}if(!a&&(s.minW||s.minH||s.maxW||s.maxH)&&(a={}),s.content!==void 0){const f=i.querySelector(".grid-stack-item-content");f&&f.textContent!==s.content&&(n.content=s.content,Ce.renderCB(f,s),(u=n.subGrid)!=null&&u.el&&(f.appendChild(n.subGrid.el),n.subGrid._updateContainerHeight())),delete s.content}let h=!1,d=!1;for(const f in c)f[0]!=="_"&&l[f]!==c[f]&&(l[f]=c[f],h=!0,d=d||!this.opts.staticGrid&&(f==="noResize"||f==="noMove"||f==="locked"));if(q.sanitizeMinMax(n),a){const f=a.w!==void 0&&a.w!==n.w;this.moveNode(n,a),f&&n.subGrid?n.subGrid.onResize(this.hasAnimationCSS()?n.w:void 0):this.resizeToContentCheck(f,n),delete n._orig}(a||h)&&this._writeAttr(i,n),d&&this.prepareDragDrop(n.el),Ce.updateCB&&Ce.updateCB(n)}),this}moveNode(e,t){const i=e._updating;i||this.engine.cleanNodes().beginUpdate(e),this.engine.moveNode(e,t),this._updateContainerHeight(),i||(this._triggerChangeEvent(),this.engine.endUpdate())}resizeToContent(e){var u,f;if(!e||(e.classList.remove("size-to-content-max"),!e.clientHeight))return;const t=e.gridstackNode;if(!t)return;const i=t.grid;if(!i||e.parentElement!==i.el)return;const n=i.getCellHeight(!0);if(!n)return;let s=t.h?t.h*n:e.clientHeight,o=null;if(t.resizeToContentParent&&(o=e.querySelector(t.resizeToContentParent)),o||(o=e.querySelector(Ce.resizeToContentParent)),!o)return;const a=e.clientHeight-o.clientHeight,c=t.h?t.h*n-a:o.clientHeight;let l;if(t.subGrid){l=t.subGrid.getRow()*t.subGrid.getCellHeight(!0);const g=t.subGrid.el.getBoundingClientRect(),v=e.getBoundingClientRect();l+=g.top-v.top}else{if((f=(u=t.subGridOpts)==null?void 0:u.children)!=null&&f.length)return;{const g=o.firstElementChild;if(!g){console.error(`Error: GridStack.resizeToContent() widget id:${t.id} '${Ce.resizeToContentParent}'.firstElementChild is null, make sure to have a div like container. Skipping sizing.`);return}l=g.getBoundingClientRect().height||c}}if(c===l)return;s+=l-c;let h=Math.ceil(s/n);const d=Number.isInteger(t.sizeToContent)?t.sizeToContent:0;d&&h>d&&(h=d,e.classList.add("size-to-content-max")),t.minH&&h<t.minH?h=t.minH:t.maxH&&h>t.maxH&&(h=t.maxH),h!==t.h&&(i._ignoreLayoutsNodeChange=!0,i.moveNode(t,{h}),delete i._ignoreLayoutsNodeChange)}resizeToContentCBCheck(e){Ce.resizeToContentCB?Ce.resizeToContentCB(e):this.resizeToContent(e)}rotate(e,t){return Ce.getElements(e).forEach(i=>{const n=i.gridstackNode;if(!n||!q.canBeRotated(n))return;const s={w:n.h,h:n.w,minH:n.minW,minW:n.minH,maxH:n.maxW,maxW:n.maxH};if(t){const c=t.left>0?Math.floor(t.left/this.cellWidth()):0,l=t.top>0?Math.floor(t.top/this.opts.cellHeight):0;s.x=n.x+c-(n.h-(l+1)),s.y=n.y+l-c}const o=s;Object.keys(o).forEach(c=>{o[c]===void 0&&delete o[c]});const a=n._orig;this.update(i,s),n._orig=a}),this}margin(e){if(!(typeof e=="string"&&e.split(" ").length>1)){const i=q.parseHeight(e);if(this.opts.marginUnit===i.unit&&this.opts.margin===i.h)return this}return this.opts.margin=e,this.opts.marginTop=this.opts.marginBottom=this.opts.marginLeft=this.opts.marginRight=void 0,this._initMargin(),this}getMargin(){return this.opts.margin}willItFit(e){return this.engine.willItFit(e)}_triggerChangeEvent(){if(this.engine.batchMode)return this;const e=this.engine.getDirtyNodes(!0);return e&&e.length&&(this._ignoreLayoutsNodeChange||this.engine.layoutsNodesChange(e),this._triggerEvent("change",e)),this.engine.saveInitial(),this._sortDom(),this}_sortDom(){var i;let e=this.engine.nodes;if(e.forEach(n=>{n.subGrid&&n.subGrid._sortDom()}),e.length<2)return this;this.engine.sortNodes(),e=this.engine.nodes;const t=this.el.children;if(e.some((n,s)=>n.el!==t[s])){const n=(i=this.el.moveBefore)==null?void 0:i.bind(this.el);e.forEach(s=>{s.el&&s.el.parentElement===this.el&&(n?n(s.el,null):this.el.appendChild(s.el))})}return this}_triggerAddEvent(){var e;if(this.engine.batchMode)return this;if((e=this.engine.addedNodes)!=null&&e.length){this._ignoreLayoutsNodeChange||this.engine.layoutsNodesChange(this.engine.addedNodes),this.engine.addedNodes.forEach(i=>{delete i._dirty});const t=[...this.engine.addedNodes];this.engine.addedNodes=[],this._triggerEvent("added",t)}return this}_triggerRemoveEvent(){var e;if(this.engine.batchMode)return this;if((e=this.engine.removedNodes)!=null&&e.length){const t=[...this.engine.removedNodes];this.engine.removedNodes=[],this._triggerEvent("removed",t)}return this}_triggerEvent(e,t){const i=t?new CustomEvent(e,{bubbles:!1,detail:t}):new Event(e);let n=this;for(;n.parentGridNode;)n=n.parentGridNode.grid;return n.el.dispatchEvent(i),this}_updateContainerHeight(){if(!this.engine||this.engine.batchMode)return this;const e=this.parentGridNode;let t=this.getRow()+this._extraDragRow;const i=this.opts.cellHeight,n=this.opts.cellHeightUnit;if(!i)return this;if(!e&&!this.opts.minRow){const s=q.parseHeight(getComputedStyle(this.el).minHeight);if(s.h>0&&s.unit===n){const o=Math.floor(s.h/i);t<o&&(t=o)}}return this.el.setAttribute("gs-current-row",String(t)),this.el.style.removeProperty("min-height"),this.el.style.removeProperty("height"),t&&(this.el.style[e?"minHeight":"height"]=t*i+n),e&&q.shouldSizeToContent(e)&&e.grid.resizeToContentCBCheck(e.el),this}_prepareElement(e,t=!1,i){i=i||this._readAttr(e),e.gridstackNode=i,i.el=e,i.grid=this,i=this.engine.addNode(i,t),this._writeAttr(e,i),e.classList.add(Jt.itemClass,this.opts.itemClass);const n=q.shouldSizeToContent(i);return n?e.classList.add("size-to-content"):e.classList.remove("size-to-content"),n&&this.resizeToContentCheck(!1,i),(!q.lazyLoad(i)||!i.visibleObservable)&&this.prepareDragDrop(i.el),this}_writePosAttr(e,t){if(!t._moving&&!t._resizing||this._placeholder===e){const i=this.opts.rtl?"right":"left",n=e.style;n.top=t.y?t.y===1?"var(--gs-cell-height)":`calc(${t.y} * var(--gs-cell-height))`:null,n[i]=t.x?t.x===1?"var(--gs-column-width)":`calc(${t.x} * var(--gs-column-width))`:null,n.width=t.w>1?`calc(${t.w} * var(--gs-column-width))`:null,n.height=t.h>1?`calc(${t.h} * var(--gs-cell-height))`:null}return e.style.setProperty("--gs-x",String(t.x||0)),e.style.setProperty("--gs-y",String(t.y||0)),e.style.setProperty("--gs-w",String(t.w||1)),e.style.setProperty("--gs-h",String(t.h||1)),e.setAttribute("gs-x",String(t.x??0)),e.setAttribute("gs-y",String(t.y??0)),t.w>1?e.setAttribute("gs-w",String(t.w)):e.removeAttribute("gs-w"),t.h>1?e.setAttribute("gs-h",String(t.h)):e.removeAttribute("gs-h"),this}_writeAttr(e,t){if(!t)return this;this._writePosAttr(e,t);const i={noResize:"gs-no-resize",noMove:"gs-no-move",locked:"gs-locked",id:"gs-id",sizeToContent:"gs-size-to-content"},n=t,s=i;for(const a in s)n[a]!==void 0&&n[a]!==null&&n[a]!==!1?e.setAttribute(s[a],String(n[a])):e.removeAttribute(s[a]);const o=t.print;return o?(o.pageBreak?e.setAttribute("gs-page-break",String(o.pageBreak)):e.removeAttribute("gs-page-break"),o.hide?e.classList.add("gs-print-hide"):e.classList.remove("gs-print-hide"),o.orientation?e.setAttribute("gs-print-orientation",String(o.orientation)):e.removeAttribute("gs-print-orientation"),o.breakInside?e.setAttribute("gs-break-inside",String(o.breakInside)):e.removeAttribute("gs-break-inside")):(e.removeAttribute("gs-page-break"),e.classList.remove("gs-print-hide"),e.removeAttribute("gs-print-orientation"),e.removeAttribute("gs-break-inside")),this}_readAttr(e,t=!0){const i={};i.x=q.toNumber(e.getAttribute("gs-x")),i.y=q.toNumber(e.getAttribute("gs-y")),i.w=q.toNumber(e.getAttribute("gs-w")),i.h=q.toNumber(e.getAttribute("gs-h")),i.autoPosition=q.toBool(e.getAttribute("gs-auto-position")),i.noResize=q.toBool(e.getAttribute("gs-no-resize")),i.noMove=q.toBool(e.getAttribute("gs-no-move")),i.locked=q.toBool(e.getAttribute("gs-locked"));let n=e.getAttribute("gs-page-break"),s=e.classList.contains("gs-print-hide"),o=e.getAttribute("gs-print-orientation"),a=e.getAttribute("gs-break-inside");(n||s||o||a)&&(i.print={},n&&(i.print.pageBreak=q.toBool(n)),s&&(i.print.hide=!0),o&&(i.print.orientation=o),a&&(i.print.breakInside=q.toBool(a)));const c=e.getAttribute("gs-size-to-content");c&&(c==="true"||c==="false"?i.sizeToContent=q.toBool(c):i.sizeToContent=parseInt(c,10)),i.id=e.getAttribute("gs-id")??void 0,i.maxW=q.toNumber(e.getAttribute("gs-max-w")),i.minW=q.toNumber(e.getAttribute("gs-min-w")),i.maxH=q.toNumber(e.getAttribute("gs-max-h")),i.minH=q.toNumber(e.getAttribute("gs-min-h")),t&&(i.w===1&&e.removeAttribute("gs-w"),i.h===1&&e.removeAttribute("gs-h"),i.maxW&&e.removeAttribute("gs-max-w"),i.minW&&e.removeAttribute("gs-min-w"),i.maxH&&e.removeAttribute("gs-max-h"),i.minH&&e.removeAttribute("gs-min-h"));const l=i;for(const h in l)i.hasOwnProperty(h)&&!l[h]&&l[h]!==0&&h!=="sizeToContent"&&delete l[h];return i}_setStaticClass(){const e=["grid-stack-static"];return this.opts.staticGrid?(this.el.classList.add(...e),this.el.setAttribute("gs-static","true")):(this.el.classList.remove(...e),this.el.removeAttribute("gs-static")),this}onResize(e=(t=>(t=this.el)==null?void 0:t.clientWidth)()){if(!e)return this;if(this.prevWidth===e)return this;this.prevWidth=e,this.batchUpdate();let i=!1;return this._autoColumn&&this.parentGridNode?this.opts.column!==this.parentGridNode.w&&(this.column(this.parentGridNode.w,this.opts.layout||"list"),i=!0):i=this.checkDynamicColumn(),this._isAutoCellHeight&&this.cellHeight(),this.engine.nodes.forEach(n=>{n.subGrid&&n.subGrid.onResize()}),this._skipInitialResize||this.resizeToContentCheck(i),delete this._skipInitialResize,this.batchUpdate(!1),this}resizeToContentCheck(e=!1,t){if(!this.engine)return;if(e&&this.hasAnimationCSS()){setTimeout(()=>this.resizeToContentCheck(!1,t),this.animationDelay);return}if(t)q.shouldSizeToContent(t)&&this.resizeToContentCBCheck(t.el);else if(this.engine.nodes.some(n=>q.shouldSizeToContent(n))){const n=[...this.engine.nodes];this.batchUpdate(),n.forEach(s=>{q.shouldSizeToContent(s)&&this.resizeToContentCBCheck(s.el)}),this._ignoreLayoutsNodeChange=!0,this.batchUpdate(!1),this._ignoreLayoutsNodeChange=!1}const i=this._gsEventHandler.resizecontent;i&&i(new Event("resizecontent"),t?[t]:this.engine.nodes)}_updateResizeEvent(e=!1){const t=!this.parentGridNode&&(this._isAutoCellHeight||this.opts.sizeToContent||this.opts.columnOpts||this.engine.nodes.find(i=>i.sizeToContent));return!e&&t&&!this.resizeObserver?(this._sizeThrottle=q.throttle(()=>this.onResize(),this.opts.cellHeightThrottle),this.resizeObserver=new ResizeObserver(()=>this._sizeThrottle()),this.resizeObserver.observe(this.el),this._skipInitialResize=!0):(e||!t)&&this.resizeObserver&&(this.resizeObserver.disconnect(),delete this.resizeObserver,delete this._sizeThrottle),this}static getElement(e=".grid-stack-item"){return q.getElement(e)}static getElements(e=".grid-stack-item"){return q.getElements(e)}static getGridElement(e){return Ce.getElement(e)}static getGridElements(e){return q.getElements(e)}_initMargin(){let e={h:0,unit:"px"},t=0,i=[];typeof this.opts.margin=="string"&&(i=this.opts.margin.split(" ")),i.length===2?(this.opts.marginTop=this.opts.marginBottom=i[0],this.opts.marginLeft=this.opts.marginRight=i[1]):i.length===4?(this.opts.marginTop=i[0],this.opts.marginRight=i[1],this.opts.marginBottom=i[2],this.opts.marginLeft=i[3]):(e=q.parseHeight(this.opts.margin),this.opts.marginUnit=e.unit,t=this.opts.margin=e.h);const n=["marginTop","marginRight","marginBottom","marginLeft"],s=this.opts;n.forEach(a=>{s[a]===void 0?s[a]=t:(e=q.parseHeight(s[a]),s[a]=e.h,delete this.opts.margin)}),this.opts.marginUnit=e.unit,this.opts.marginTop===this.opts.marginBottom&&this.opts.marginLeft===this.opts.marginRight&&this.opts.marginTop===this.opts.marginRight&&(this.opts.margin=this.opts.marginTop);const o=this.el.style;return o.setProperty("--gs-item-margin-top",`${this.opts.marginTop}${this.opts.marginUnit}`),o.setProperty("--gs-item-margin-bottom",`${this.opts.marginBottom}${this.opts.marginUnit}`),o.setProperty("--gs-item-margin-right",`${this.opts.marginRight}${this.opts.marginUnit}`),o.setProperty("--gs-item-margin-left",`${this.opts.marginLeft}${this.opts.marginUnit}`),this}static getDD(){return Ht}static setupDragIn(e,t,i,n=document){(t==null?void 0:t.pause)!==void 0&&(Te.pauseDrag=t.pause),t={appendTo:"body",helper:"clone",...t||{}},(typeof e=="string"?q.getElements(e,n):e).forEach((o,a)=>{Ht.isDraggable(o)||Ht.dragIn(o,t),i!=null&&i[a]&&(o.gridstackNode=i[a])})}movable(e,t){return this.opts.staticGrid?this:(Ce.getElements(e).forEach(i=>{const n=i.gridstackNode;n&&(t?delete n.noMove:n.noMove=!0,this.prepareDragDrop(n.el))}),this)}resizable(e,t){return this.opts.staticGrid?this:(Ce.getElements(e).forEach(i=>{const n=i.gridstackNode;n&&(t?delete n.noResize:n.noResize=!0,this.prepareDragDrop(n.el))}),this)}disable(e=!0){return this.opts.staticGrid?this:(this.enableMove(!1,e),this.enableResize(!1,e),this._triggerEvent("disable"),this)}enable(e=!0){return this.opts.staticGrid?this:(this.enableMove(!0,e),this.enableResize(!0,e),this._triggerEvent("enable"),this)}enableMove(e,t=!0){return this.opts.staticGrid?this:(e?delete this.opts.disableDrag:this.opts.disableDrag=!0,this.engine.nodes.forEach(i=>{this.prepareDragDrop(i.el),i.subGrid&&t&&i.subGrid.enableMove(e,t)}),this)}enableResize(e,t=!0){return this.opts.staticGrid?this:(e?delete this.opts.disableResize:this.opts.disableResize=!0,this.engine.nodes.forEach(i=>{this.prepareDragDrop(i.el),i.subGrid&&t&&i.subGrid.enableResize(e,t)}),this)}cancelDrag(){var i,n,s;const e=(i=Te.dragElement)==null?void 0:i.el;if(e!=null&&e._gridstackNodeOrig){const o=e._gridstackNodeOrig,a=o.grid,c=(n=this._placeholder)==null?void 0:n.gridstackNode;c&&(c._isAboutToRemove=!0,this.engine.removeNode(c)),this.engine.restoreInitial(),e.gridstackNode=o,delete e._gridstackNodeOrig,delete Te.dropElement,a&&(a.engine.addNode(o,!1),a.engine.restoreInitial());return}const t=(s=this._placeholder)==null?void 0:s.gridstackNode;t&&(t._isExternal?(t._isAboutToRemove=!0,this.engine.removeNode(t)):t._isAboutToRemove&&Ce._itemRemoving(t.el,!1),this.engine.restoreInitial())}_removeDD(e){return Ht.draggable(e,"destroy").resizable(e,"destroy"),e.gridstackNode&&delete e.gridstackNode._initDD,delete e.ddElement,this}_setupAcceptWidget(){if(this.opts.staticGrid||!this.opts.acceptWidgets&&!this.opts.removable)return Ht.droppable(this.el,"destroy"),this;let e,t;const i=(n,s,o)=>{var u;o=o||s;const a=o.gridstackNode;if(!a)return;if(!((u=a.grid)!=null&&u.el)){o.style.transform=`scale(${1/this.dragTransform.xScale},${1/this.dragTransform.yScale})`;const f=o.getBoundingClientRect();o.style.left=f.x+(this.dragTransform.xScale-1)*(n.clientX-f.x)/this.dragTransform.xScale+"px",o.style.top=f.y+(this.dragTransform.yScale-1)*(n.clientY-f.y)/this.dragTransform.yScale+"px",o.style.transformOrigin="0px 0px"}let{top:c,left:l}=o.getBoundingClientRect();const h=this.el.getBoundingClientRect();l-=h.left,c-=h.top;const d={position:{top:c*this.dragTransform.xScale,left:l*this.dragTransform.yScale}};if(a._temporaryRemoved){if(a.x=Math.max(0,Math.round(l/t)),a.y=Math.max(0,Math.round(c/e)),delete a.autoPosition,this.engine.nodeBoundFix(a),!this.engine.willItFit(a)){if(a.autoPosition=!0,!this.engine.willItFit(a)){Ht.off(s,"drag");return}a._willFitPos&&(q.copyPos(a,a._willFitPos),delete a._willFitPos)}this._onStartMoving(o,n,d,a,t,e)}else this._dragOrResize(o,n,d,a,t,e)};return Ht.droppable(this.el,{accept:n=>{const s=n.gridstackNode||this._readAttr(n,!1);if((s==null?void 0:s.grid)===this)return!0;if(!this.opts.acceptWidgets)return!1;let o=!0;if(typeof this.opts.acceptWidgets=="function")o=this.opts.acceptWidgets(n);else{const a=this.opts.acceptWidgets===!0?".grid-stack-item":this.opts.acceptWidgets;o=n.matches(a)}if(o&&s&&this.opts.maxRow){const a={w:s.w,h:s.h,minW:s.minW,minH:s.minH};o=this.engine.willItFit(a)}return o}}).on(this.el,"dropover",(n,s,o)=>{let a=(o==null?void 0:o.gridstackNode)||s.gridstackNode;if((a==null?void 0:a.grid)===this&&!a._temporaryRemoved)return!1;if(a!=null&&a._sidebarOrig&&(a.w=a._sidebarOrig.w,a.h=a._sidebarOrig.h),a!=null&&a.grid&&a.grid!==this&&!a._temporaryRemoved&&a.grid._leave(s,o),o=o||s,t=this.cellWidth(),e=this.getCellHeight(!0),!a){const h=o.getAttribute("data-gs-widget")||o.getAttribute("gridstacknode");if(h){try{a=JSON.parse(h)}catch{console.error("Gridstack dropover: Bad JSON format: ",h)}o.removeAttribute("data-gs-widget"),o.removeAttribute("gridstacknode")}a||(a=this._readAttr(o)),a._sidebarOrig={w:a.w,h:a.h}}a.grid||(a.el||(a={...a}),a._isExternal=!0,o.gridstackNode=a);const c=a.w||Math.round(o.offsetWidth/t)||1,l=a.h||Math.round(o.offsetHeight/e)||1;return a.grid&&a.grid!==this?(s._gridstackNodeOrig||(s._gridstackNodeOrig=a),s.gridstackNode=a={...a,w:c,h:l,grid:this},delete a.x,delete a.y,this.engine.cleanupNode(a).nodeBoundFix(a),a._initDD=a._isExternal=a._temporaryRemoved=!0):(a.w=c,a.h=l,a._temporaryRemoved=!0),Ce._itemRemoving(a.el,!1),Ht.on(s,"drag",i),i(n,s,o),!1}).on(this.el,"dropout",(n,s,o)=>{const a=(o==null?void 0:o.gridstackNode)||s.gridstackNode;return a&&(!a.grid||a.grid===this)&&(this._leave(s,o),this._isTemp&&this.removeAsSubGrid(a)),!1}).on(this.el,"drop",(n,s,o)=>{var u,f,g;const a=(o==null?void 0:o.gridstackNode)||s.gridstackNode;if((a==null?void 0:a.grid)===this&&!a._isExternal)return!1;const c=!!this.placeholder.parentElement,l=s!==o;this.placeholder.remove(),delete this.placeholder.gridstackNode,c&&this.opts.animate&&(this.setAnimation(!1),this.setAnimation(!0,!0));const h=s._gridstackNodeOrig;if(delete s._gridstackNodeOrig,c&&(h!=null&&h.grid)&&h.grid!==this){const v=h.grid;v.engine.removeNodeFromLayoutCache(h),v.engine.removedNodes.push(h),v._triggerRemoveEvent()._triggerChangeEvent(),v.parentGridNode&&!v.engine.nodes.length&&v.opts.subGridDynamic&&v.removeAsSubGrid()}if(!a||(c&&(this.engine.cleanupNode(a),a.grid=this),(u=a.grid)==null||delete u._isTemp,Ht.off(s,"drag"),o&&o!==s?(o.remove(),s=o):s.remove(),this._removeDD(s),!c))return!1;const d=(g=(f=a.subGrid)==null?void 0:f.el)==null?void 0:g.gridstack;return q.copyPos(a,this._readAttr(this.placeholder)),q.removePositioningStyles(s),l&&(a.content||a.subGridOpts||Ce.addRemoveCB)?(delete a.el,s=this.addWidget(a)||s):(this._prepareElement(s,!0,a),this.el.appendChild(s),this.resizeToContentCheck(!1,a),d&&(d.parentGridNode=a),this._updateContainerHeight()),this.engine.addedNodes.push(a),this._triggerAddEvent(),this._triggerChangeEvent(),this.engine.endUpdate(),this._gsEventHandler.dropped&&this._gsEventHandler.dropped({...n,type:"dropped"},h&&h.grid?h:void 0,a),!1}),this}static _itemRemoving(e,t){if(!e)return;const i=e?e.gridstackNode:void 0;!(i!=null&&i.grid)||e.classList.contains(i.grid.opts.removableOptions.decline)||(t?i._isAboutToRemove=!0:delete i._isAboutToRemove,t?e.classList.add("grid-stack-item-removing"):e.classList.remove("grid-stack-item-removing"))}_setupRemoveDrop(){if(typeof this.opts.removable!="string")return this;const e=document.querySelector(this.opts.removable);return e?(!this.opts.staticGrid&&!Ht.isDroppable(e)&&Ht.droppable(e,this.opts.removableOptions).on(e,"dropover",(t,i)=>Ce._itemRemoving(i,!0)).on(e,"dropout",(t,i)=>Ce._itemRemoving(i,!1)),this):this}refreshDragHandles(e){return Ce.getElements(e).forEach(t=>{var i,n;(n=(i=t.ddElement)==null?void 0:i.ddDraggable)==null||n.refreshHandles()}),this}prepareDragDrop(e,t=!1){const i=e==null?void 0:e.gridstackNode;if(!i)return this;const n=i.noMove||this.opts.disableDrag,s=i.noResize||this.opts.disableResize,o=this.opts.staticGrid||n&&s;if((t||o)&&(i._initDD&&(this._removeDD(e),delete i._initDD),o))return e.classList.add("ui-draggable-disabled","ui-resizable-disabled"),this;if(!i._initDD){let a,c;const l=(u,f)=>{this.triggerEvent(u,u.target),a=this.cellWidth(),c=this.getCellHeight(!0),this._onStartMoving(e,u,f,i,a,c)},h=(u,f)=>{this._dragOrResize(e,u,f,i,a,c)},d=u=>{this.placeholder.remove(),delete this.placeholder.gridstackNode,delete i._moving,delete i._resizing,delete i._event,delete i._lastTried;const f=i.w!==i._orig.w,g=u.target;if(!(!g.gridstackNode||g.gridstackNode.grid!==this)){if(i.el=g,i._isAboutToRemove){const v=e.gridstackNode.grid;v._gsEventHandler[u.type]&&v._gsEventHandler[u.type](u,g),v.engine.nodes.push(i),v.removeWidget(e,!0,!0)}else q.removePositioningStyles(g),i._temporaryRemoved?(this._writePosAttr(g,i),this.engine.addNode(i)):this._writePosAttr(g,i),this.triggerEvent(u,g);this._extraDragRow=0,this._updateContainerHeight(),this._triggerChangeEvent(),this.engine.endUpdate(),u.type==="resizestop"&&(Number.isInteger(i.sizeToContent)&&(i.sizeToContent=i.h),this.resizeToContentCheck(f,i))}};Ht.draggable(e,{start:l,stop:d,drag:h,rtl:this.opts.rtl==="auto"?void 0:this.opts.rtl}).resizable(e,{start:l,stop:d,resize:h,rtl:this.opts.rtl==="auto"?void 0:this.opts.rtl}),i._initDD=!0}return Ht.draggable(e,n?"disable":"enable").resizable(e,s?"disable":"enable"),this}_onStartMoving(e,t,i,n,s,o){var a;if(this.engine.cleanNodes().beginUpdate(n),this._writePosAttr(this.placeholder,n),this.el.appendChild(this.placeholder),this.placeholder.gridstackNode=n,(a=n.grid)!=null&&a.el)this.dragTransform=q.getValuesFromTransformedElement(e);else if(this.placeholder&&this.placeholder.closest(".grid-stack")){const c=this.placeholder.closest(".grid-stack");this.dragTransform=q.getValuesFromTransformedElement(c)}else this.dragTransform={xScale:1,xOffset:0,yScale:1,yOffset:0};if(n.el=this.placeholder,n._lastUiPosition=i.position,n._prevYPix=i.position.top,n._moving=t.type==="dragstart",n._resizing=t.type==="resizestart",delete n._lastTried,t.type==="dropover"&&n._temporaryRemoved&&(this.engine.addNode(n),n._moving=!0),this.engine.cacheRects(s,o,this.opts.marginTop,this.opts.marginRight,this.opts.marginBottom,this.opts.marginLeft),t.type==="resizestart"){const c=this.getColumn()-n.x,l=(this.opts.maxRow||Number.MAX_SAFE_INTEGER)-n.y;Ht.resizable(e,"option","minWidth",s*Math.min(n.minW||1,c)).resizable(e,"option","minHeight",o*Math.min(n.minH||1,l)).resizable(e,"option","maxWidth",s*Math.min(n.maxW||Number.MAX_SAFE_INTEGER,c)).resizable(e,"option","maxWidthMoveLeft",s*Math.min(n.maxW||Number.MAX_SAFE_INTEGER,n.x+n.w)).resizable(e,"option","maxHeight",o*Math.min(n.maxH||Number.MAX_SAFE_INTEGER,l)).resizable(e,"option","maxHeightMoveUp",o*Math.min(n.maxH||Number.MAX_SAFE_INTEGER,n.y+n.h))}}_dragOrResize(e,t,i,n,s,o){var m;const a={...n._orig};let c=!1,l=this.opts.marginLeft,h=this.opts.marginRight,d=this.opts.marginTop,u=this.opts.marginBottom;const f=Math.round(o*.1),g=Math.round(s*.1);if(l=Math.min(l,g),h=Math.min(h,g),d=Math.min(d,f),u=Math.min(u,f),t.type==="drag"){if(n._temporaryRemoved)return;n._prevYPix=i.position.top,this.opts.draggable.scroll!==!1&&((m=Te.dragElement)==null||m.updateScrollPosition(this.el));const p=i.position.left+(i.position.left>n._lastUiPosition.left?-h:l),E=i.position.top+(i.position.top>n._lastUiPosition.top?-u:d);a.x=Math.round(p/s),a.y=Math.round(E/o);const b=this._extraDragRow;if(this.engine.collide(n,a)){const x=this.getRow();let M=Math.max(0,a.y+n.h-x);this.opts.maxRow&&x+M>this.opts.maxRow&&(M=Math.max(0,this.opts.maxRow-x)),this._extraDragRow=M}else this._extraDragRow=0;if(this._extraDragRow!==b&&this._updateContainerHeight(),n.x===a.x&&n.y===a.y)return}else if(t.type==="resize"){if((a.x??0)<0||(q.updateScrollResize(t,e,o),a.w=Math.round((i.size.width-l)/s),a.h=Math.round((i.size.height-d)/o),n.w===a.w&&n.h===a.h)||n._lastTried&&n._lastTried.w===a.w&&n._lastTried.h===a.h)return;if(t.hasMovedX){const p=n.x-(a.w-n.w);a.x=p<0?0:p}if(t.hasMovedY){const p=n.y-(a.h-n.h);a.y=p<0?0:p}c=!0}n._event=t,n._lastTried=a;const v={x:i.position.left+l,y:i.position.top+d,w:(i.size?i.size.width:n.w*s)-l-h,h:(i.size?i.size.height:n.h*o)-d-u};if(this.engine.moveNodeCheck(n,{...a,cellWidth:s,cellHeight:o,rect:v,resizing:c})){n._lastUiPosition=i.position,this.engine.cacheRects(s,o,d,h,u,l),delete n._skipDown,c&&n.subGrid&&n.subGrid.onResize(),this._extraDragRow=0,this._updateContainerHeight();const p=t.target;n._sidebarOrig||this._writePosAttr(p,n),this.triggerEvent(t,p)}}triggerEvent(e,t){let i=this;for(;i.parentGridNode;)i=i.parentGridNode.grid;i._gsEventHandler[e.type]&&i._gsEventHandler[e.type](e,t)}_leave(e,t){t=t||e;const i=t.gridstackNode;if(!i||(t.style.transform=t.style.transformOrigin="",Ht.off(e,"drag"),i._temporaryRemoved))return;i._temporaryRemoved=!0,this.engine.removeNode(i),i.el=i._isExternal&&t?t:e;const n=i._sidebarOrig;i._isExternal&&this.engine.cleanupNode(i),i._sidebarOrig=n,this.opts.removable===!0&&Ce._itemRemoving(e,!0),e._gridstackNodeOrig?(e.gridstackNode=e._gridstackNodeOrig,delete e._gridstackNodeOrig):i._isExternal&&this.engine.restoreInitial()}}Ce.renderCB=(r,e)=>{r&&(e!=null&&e.content)&&(r.textContent=e.content)};Ce.resizeToContentParent=".grid-stack-item-content";Ce.Utils=q;Ce.Engine=Di;Ce.GDRev="13.3.0";const $n=r=>document.querySelector(r);function Ji(r){return r.replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]??e)}function ha(r,e=!1){const t=$n("#toast");t&&(t.textContent=r,t.className=`toast show${e?" error":""}`,window.setTimeout(()=>{t.className="toast"},4200))}function av(r){const e=$n("#replay-search"),t=$n("#replay-filter"),i=$n("#replay-episodes"),n=$n("#replay-hidden"),s=$n("#replay-count");let o=[],a=[],c=null;function l(){const b=e.value.trim().toLowerCase(),x=t.value;return o.filter(M=>!(x&&(M.task??"")!==x||b&&!`${M.session_id} ${M.task??""}`.toLowerCase().includes(b)))}function h(){const b=[...new Set(o.map(M=>M.task).filter(M=>!!M))],x=t.value;t.innerHTML='<option value="">全部 task</option>'+b.map(M=>`<option value="${Ji(M)}">${Ji(M)}</option>`).join(""),b.includes(x)&&(t.value=x)}function d(b,x){const M=b.task?`<small>${Ji(b.task)}</small>`:"",T=x==="visible"&&c===b.session_id?" active":"",A=x==="visible"?`<div class="episode-actions"><button class="episode-action" data-action="edit" data-session="${Ji(b.session_id)}" title="编辑 task 标签">编辑</button><button class="episode-action" data-action="hide" data-session="${Ji(b.session_id)}" title="隐藏该 episode">隐藏</button></div>`:`<button class="episode-action" data-action="restore" data-session="${Ji(b.session_id)}" title="恢复该 episode">恢复</button>`;return`<div class="episode-item${T}" data-session="${Ji(b.session_id)}"><div class="episode-main"><strong>${Ji(b.session_id)}</strong>${M}<small>${b.frames} 帧 · ${b.fps} Hz</small></div>${A}</div>`}function u(){const b=l();s.textContent=o.length?`${o.length} 个数据集`:"暂无",i.innerHTML=b.length?b.map(x=>d(x,"visible")).join(""):'<div class="empty">暂无已导出 episode</div>',n.innerHTML=a.length?'<div class="hidden-heading">已隐藏</div>'+a.map(x=>d(x,"hidden")).join(""):"",n.style.display=a.length?"":"none"}async function f(){try{const[b,x]=await Promise.all([fetch("/api/lerobot"),fetch("/api/lerobot/trash")]);if(!b.ok)throw new Error(`HTTP ${b.status}`);if(!x.ok)throw new Error(`HTTP ${x.status}`);const[M,T]=await Promise.all([b.json(),x.json()]);o=M.sessions??[],a=T.sessions??[]}catch{s.textContent="回放不可用"}h(),u()}async function g(b,x){try{const M=await fetch(`/api/lerobot/${encodeURIComponent(b)}/${x}`,{method:"POST"});if(!M.ok)throw new Error(`HTTP ${M.status}`);return!0}catch{return!1}}async function v(b,x){try{const M=await fetch(`/api/lerobot/${encodeURIComponent(b)}/task`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({task:x})});if(!M.ok)throw new Error(`HTTP ${M.status}`);return!0}catch{return!1}}async function m(b,x){const M=x==="delete"?"隐藏":"恢复",T=(x==="delete"?o:a).find(S=>S.session_id===b),A=(T==null?void 0:T.session_id)??b;if(!window.confirm(`确定要${M} episode ${A} 吗？`))return;if(!await g(b,x)){ha(`${M}失败`,!0);return}await f(),r.onChanged()}async function p(b){const x=o.find(_=>_.session_id===b),M=window.prompt("编辑 task 标签",(x==null?void 0:x.task)??"");if(M===null)return;const T=M.trim();if(!T){ha("task 不能为空",!0);return}if(!await v(b,T)){ha("编辑失败",!0);return}await f()}function E(b){const x=b.target.closest("[data-session]");if(!x)return;const M=x.dataset.session??"",T=b.target.closest("[data-action]");if(T){const A=T.getAttribute("data-action");A==="hide"?m(M,"delete"):A==="restore"?m(M,"restore"):A==="edit"&&p(M);return}r.onSelect(M)}return i.addEventListener("click",E),n.addEventListener("click",E),e.addEventListener("input",u),t.addEventListener("change",u),f(),{refresh:f,getSession:b=>o.find(x=>x.session_id===b),getEpisodes:()=>o,setActive:b=>{c=b,u()}}}const dn=r=>document.querySelector(r);function lv(r){return r.replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]??e)}function cv(r){const e=dn("#replay-cameras"),t=dn("#replay-camera-count"),i=dn("#replay-play"),n=dn("#replay-prev"),s=dn("#replay-next"),o=dn("#replay-slider"),a=dn("#replay-speed");let c=[],l=null,h=0,d=!1,u=0;function f(_){return!l||l.frameCount<=0?0:Math.min(l.frameCount-1,Math.max(0,_))}function g(_){if(!l)return;h=f(_);const S=h/l.fps;for(const R of c)try{R.currentTime=S}catch{}o.value=String(h)}function v(){return c.length?c[0].currentTime:0}function m(){if(!d||!l)return;const _=f(Math.round(v()*l.fps));if(_!==h&&(h=_,o.value=String(_),r.onFrameChange(_)),_>=l.frameCount-1){E();return}u=requestAnimationFrame(m)}function p(){if(!l||!c.length)return;d=!0,i.textContent="⏸ 暂停";const _=Number(a.value||1);for(const S of c)S.playbackRate=_,S.play().catch(()=>{});cancelAnimationFrame(u),u=requestAnimationFrame(m)}function E(){d=!1,i.textContent="▶ 播放";for(const _ of c)_.pause();cancelAnimationFrame(u)}function b(){d?E():p()}function x(_){if(!l)return;E();const S=f(h+_);g(S),r.onFrameChange(S)}function M(_){for(const S of c)S.playbackRate=_}function T(){const _=r.getSession();if(_){if(A(),l=_,!_.cameraIds.length)e.innerHTML='<div class="empty">该 Episode 无相机字段</div>',t.textContent="该 Episode 无相机字段";else{t.textContent=`${_.cameraIds.length} 路 · 同步视频`;for(const S of _.cameraIds){const R=document.createElement("div");R.className="camera-card",R.dataset.camera=S,R.innerHTML=`<video muted playsinline preload="auto" src="/api/lerobot/${encodeURIComponent(_.sessionId)}/video/${encodeURIComponent(S)}"></video><span class="camera-label">${lv(S)}</span>`;const C=R.querySelector("video");C&&c.push(C),e.append(R)}}o.max=String(Math.max(0,_.frameCount-1)),g(0),i.style.display=""}}function A(){E(),l=null,c=[],h=0,e.innerHTML='<div class="empty">选择一个 Episode 开始回放</div>',t.textContent="选择 Episode 后显示",o.max="0",o.value="0",i.style.display="none",i.textContent="▶ 播放"}return i.addEventListener("click",b),n.addEventListener("click",()=>x(-1)),s.addEventListener("click",()=>x(1)),o.addEventListener("input",()=>{if(!l)return;E();const _=f(Number(o.value));g(_),r.onFrameChange(_)}),a.addEventListener("change",()=>M(Number(a.value||1))),document.addEventListener("keydown",_=>{var S;l&&((S=_.target)!=null&&S.matches("input,select,textarea")||(_.key==="ArrowLeft"?(_.preventDefault(),x(-1)):_.key==="ArrowRight"?(_.preventDefault(),x(1)):_.key===" "&&(_.preventDefault(),b())))}),{load:T,clear:A,toggle:b,step:x,setSpeed:M,isPlaying:()=>d}}const _n=r=>document.querySelector(r);function Es(r){return r.replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]??e)}function Cs(r){return typeof r=="number"&&Number.isFinite(r)?[r]:typeof r=="boolean"?[r?1:0]:Array.isArray(r)?r.flatMap(e=>Cs(e)):[]}function hv(r,e,t,i){var b;const n=(b=t[r])==null?void 0:b.names;if(Array.isArray(n)&&n.length===e&&n.every(x=>typeof x=="string"&&x.length>0))return n;const s=Array.isArray(i.quality_sync_source_ids)?i.quality_sync_source_ids.filter(x=>typeof x=="string"):[];if(r==="quality.sync_error_ns"&&s.length===e)return s;const o=Array.isArray(i.joint_names)?i.joint_names.filter(x=>typeof x=="string"):[],a=Array.isArray(i.base_frames)?i.base_frames.filter(x=>typeof x=="string"):[],c=a.map(x=>x.split("/")[0]);if(["observation.joint_position","observation.joint_velocity","observation.joint_effort"].includes(r)&&o.length&&c.length*o.length===e)return c.flatMap(x=>o.map(M=>`${x}.${M}`));const h=["x","y","z"],d=["qx","qy","qz","qw"],u=["vx","vy","vz"],f=["wx","wy","wz"],g=["vx","vy","vz","wx","wy","wz"],v=i.cartesian_command,m=Array.isArray(v==null?void 0:v.frames)?v.frames.filter(x=>typeof x=="string"):[],p=r==="observation.ee_position"?h:r==="observation.ee_rotation"?d:r==="observation.ee_linear_velocity"?u:r==="observation.ee_angular_velocity"?f:r==="action.command_action"||r==="action.executed_action"?g:[],E=r==="action.command_action"?m:a;return p.length&&E.length*p.length===e?E.flatMap(x=>p.map(M=>`${x.split("/")[0]}.${M}`)):Array.from({length:e},(x,M)=>`${r.split(".").at(-1)}[${M}]`)}function uv(){const r=_n("#replay-feature-select"),e=_n("#replay-action-select"),t=_n("#replay-feature-component"),i=_n("#replay-feature-chart"),n=_n("#replay-feature-raw"),s=_n("#replay-feature-count");let o={},a={};const c=320,l=120,h=8;let d="",u=null;function f(m,p){o=(p==null?void 0:p.features)??{},a=(p==null?void 0:p.canonical)??{},d="",u=null;const E=m.filter(x=>!x.startsWith("action.")),b=m.filter(x=>x.startsWith("action."));r.innerHTML=E.map(x=>`<option value="${Es(x)}">${Es(x)}</option>`).join(""),e.innerHTML=b.length?b.map(x=>`<option value="${Es(x)}">${Es(x)}</option>`).join(""):'<option value="">— 无动作字段 —</option>',s.textContent=`${m.length} fields`,r.value=E[0]??"",e.value=b[0]??"",t.innerHTML="",t.hidden=!0}function g(m,p,E){var N,z,$,j;const b=r.value,x=e.value,M=Cs((N=m.features)==null?void 0:N[b]),T=Cs((z=m.features)==null?void 0:z[x]),A=M.length,_=hv(b,A,o,a),S=[...t.options].map(se=>`${se.value}	${se.text}`).join(`
`),R=_.map((se,ie)=>`${ie}	${se}`).join(`
`),C=Number(t.value||0);S!==R&&(t.innerHTML=_.map((se,ie)=>`<option value="${ie}">${Es(se)}</option>`).join("")),t.hidden=A<2;const L=Math.min(Math.max(0,C),Math.max(0,A-1));A&&(t.value=String(L));const B=_[L];n.textContent=JSON.stringify({state_feature:b||null,action_feature:x||null,state_value:($=m.features)==null?void 0:$[b],action_value:(j=m.features)==null?void 0:j[x],component:B,component_index:L,state_component:M[L],action_component:T[L],frame_index:m.frame_index,source_timestamps_ns:m.source_timestamps_ns??{},metadata:a},null,2);const X=`${b}\0${x}\0${L}\0${p.length}`;if(d!==X){d=X,u=null;const se=p.map(ye=>{var Pe;return Cs((Pe=ye.features)==null?void 0:Pe[b])[L]??Number.NaN}),ie=p.map(ye=>{var Pe;return Cs((Pe=ye.features)==null?void 0:Pe[x])[L]??Number.NaN}),re=[...se,...ie].filter(ye=>Number.isFinite(ye));if(!A||!re.length){i.innerHTML="";return}const me=Math.min(...re),ve=Math.max(...re),ae=ve-me||1,k=ye=>h+ye/Math.max(1,p.length-1)*(c-h*2),Z=ye=>l-h-(ye-me)/ae*(l-h*2),ee=ye=>ye.map((Pe,Ie)=>Number.isFinite(Pe)?`${k(Ie).toFixed(1)},${Z(Pe).toFixed(1)}`:"").filter(Boolean).join(" ");i.innerHTML=`<polyline class="chart-state" points="${ee(se)}" fill="none" stroke="#67d391" stroke-width="1.7"/><polyline class="chart-action" points="${ee(ie)}" fill="none" stroke="#55a6ff" stroke-width="1.5" stroke-dasharray="4 3"/><line x1="0" x2="0" y1="${h}" y2="${l-h}" stroke="#67d391" stroke-width="1"/><text x="${h}" y="${l-2}" fill="#8793a8" font-size="9">${me.toPrecision(4)} — ${ve.toPrecision(4)}</text>`,u=i.querySelector("line")}const U=h+E/Math.max(1,p.length-1)*(c-h*2);u&&(u.setAttribute("x1",U.toFixed(1)),u.setAttribute("x2",U.toFixed(1)))}function v(){d="",u=null,r.innerHTML="",e.innerHTML="",t.innerHTML="",t.hidden=!0,s.textContent="—",i.innerHTML="",n.textContent="选择一个字段查看数据"}return{setFeatures:f,render:g,clear:v}}function Gu(r){const e=_n("#replay-health");if(!e)return;if(!r){e.innerHTML='<div class="empty">选择 Episode 后显示健康统计</div>';return}const t=r.valid_frames??0,i=r.invalid_frames??0,n=r.max_sync_error_ns,s=n==null?"—":n<1e6?`${(n/1e3).toFixed(1)} µs`:`${(n/1e6).toFixed(2)} ms`;e.innerHTML=`<div class="health-stat"><span>有效帧</span><b>${t}</b></div><div class="health-stat"><span>无效帧</span><b>${i}</b></div><div class="health-stat"><span>最大同步误差</span><b>${s}</b></div>`}const fn=r=>document.querySelector(r);function dv(r){return r.replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]??e)}function fv(r){const e=fn("#annotation-toggle"),t=fn("#annotation-panel"),i=fn("#annotation-status"),n=fn("#annotation-frame"),s=fn("#annotation-list"),o=fn("#annotation-save"),a=fn("#annotation-cancel");let c=null,l=[],h=!1,d=null,u=0,f=Promise.resolve();function g(){return h&&c!==null}function v(){if(!g()){i.textContent="",n.textContent="";return}i.innerHTML=d!==null?`起点帧 <b>${d}</b> · 按 <b>R</b> 标记终点`:"按 <b>Q</b> 标记起点",n.textContent=`当前帧 ${r.getCurrentFrame()}`}function m(){s.innerHTML=l.length?l.map(R=>`<div class="annotation-segment"><span class="annotation-label">${dv(R.label)}</span><span class="annotation-range">${R.start_frame} – ${R.end_frame}</span><button class="annotation-remove" data-index="${R.index}" title="删除该段">×</button></div>`).join(""):'<div class="annotation-empty">暂无已标注段</div>'}function p(){const R=g();t.hidden=!R,e.textContent=h?"退出标注":"标注",e.classList.toggle("active",h),v(),R&&m()}function E(){l.sort((R,C)=>R.start_frame-C.start_frame),l=l.map((R,C)=>({...R,index:C}))}function b(){g()&&(d=r.getCurrentFrame(),v())}function x(){if(!g()||d===null)return;const R=d,C=r.getCurrentFrame();if(C<R){r.notify("终点帧不能早于起点帧",!0),v();return}const L=window.prompt("段标签（必填）","");if(L===null){v();return}const B=L.trim();if(!B){r.notify("标签不能为空",!0),v();return}d=null,l.push({index:l.length,label:B,start_frame:R,end_frame:C}),E(),u+=1,p(),A()}function M(R){l=l.filter(C=>C.index!==R),E(),u+=1,p(),A()}async function T(){if(!c)return;const R=c,C=l.map(X=>({...X})),L=u,B=await fetch(`/api/lerobot/${encodeURIComponent(R)}/subtasks`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({subtasks:C})});if(!B.ok)throw new Error(`HTTP ${B.status}`);if(c===R){if(u===L)try{const X=await fetch(`/api/lerobot/${encodeURIComponent(R)}/subtasks`);if(!X.ok)throw new Error(`HTTP ${X.status}`);const U=await X.json();c===R&&u===L&&(l=Array.isArray(U.subtasks)?U.subtasks:[],p())}catch{}r.notify("标注已保存")}}function A(){f=f.then(()=>T()).catch(R=>r.notify(`保存失败: ${String(R)}`,!0))}async function _(R){c=R,d=null,l=[],u+=1;const C=u;p();try{const L=await fetch(`/api/lerobot/${encodeURIComponent(R)}/subtasks`);if(!L.ok)throw new Error(`HTTP ${L.status}`);const B=await L.json();if(c!==R||u!==C)return;l=Array.isArray(B.subtasks)?B.subtasks:[]}catch(L){if(c!==R)return;u===C&&(l=[]),r.notify(`加载标注失败: ${String(L)}`,!0)}p()}function S(){c=null,l=[],d=null,u+=1,p()}return e.addEventListener("click",()=>{if(!c){r.notify("请先选择一个 Episode",!0);return}h=!h,p()}),o.addEventListener("click",A),a.addEventListener("click",()=>{d!==null&&(d=null,v())}),s.addEventListener("click",R=>{const C=R.target.closest("[data-index]");C&&M(Number(C.dataset.index))}),document.addEventListener("keydown",R=>{var C;g()&&((C=R.target)!=null&&C.matches("input,select,textarea")||(R.key==="q"||R.key==="Q"?(R.preventDefault(),b()):(R.key==="r"||R.key==="R")&&(R.preventDefault(),x())))}),p(),{load:_,clear:S,onFrameChange:()=>{g()&&v()}}}const Ye=r=>document.querySelector(r);function Ph(r){return r.replace(/[&<>\"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]??e)}const pv=Ye("#recording"),Dr=Ye("#connection"),Vu=Ye("#arms"),Ir=Ye("#previews"),ua=Ye("#toast"),Ps=Ye("#viewer-state"),Wu=Ye("#joint-stamp"),Lh=Ye("#canvas"),mv=Ye("#viewer"),Nh=Ye("#motion-canvas"),so=Ye("#motion-viewer"),gv=Ye("#motion-cards"),_v=Ye("#motion-3d-status");let Ls=null,Ts=null,Dh,pn,Kn,mn,Ur,Wn,Ns,gn,Fr;const yo={},Ih={},Zn={},ll={};let cl=null;const xv=80,Xu=Ye("#grippers"),da=Ye("#export-panel"),Xn=Ye("#export-state"),fa=Ye("#export-progress"),pa=Ye("#export-dir"),Uh=Ye("#queue-panel"),Fh=Ye("#queue-count"),Oh=Ye("#lerobot-queue"),Dl=Ye("#replay-exit"),qu=Ye("#replay-frame-label"),$u=Ye("#replay-task"),Yu=Ye("#replay-dataset-meta"),Ku=Ye("#replay-time-label"),Zu=Ye("#pose-count"),Ju=Ye("#gripper-count");function Il(r,e=!1){ua.textContent=r,ua.className=`toast show${e?" error":""}`,clearTimeout(Dh),Dh=window.setTimeout(()=>ua.className="toast",4200)}function Ul(r,e){const t=yo[r];t==null||t.setJointValues(Object.fromEntries(e.map((i,n)=>[`joint_${n+1}`,i]))),t==null||t.updateMatrixWorld(!0)}function Fl(r){const e=yo[r];if(!e)return null;try{const t=e.links??{},i=t.base_link,n=t.link_6;if(!i||!n)return null;const s=i.matrixWorld.clone().invert().multiply(n.matrixWorld);return{basePosition:new D().setFromMatrixPosition(s),baseQuaternion:new Nt().setFromRotationMatrix(s),worldPosition:new D().setFromMatrixPosition(n.matrixWorld)}}catch{return null}}function ro(r,e=3){return r?`[${r.x.toFixed(e)}, ${r.y.toFixed(e)}, ${r.z.toFixed(e)}]`:"—"}function Or(r){return!Array.isArray(r)||r.length!==3||!r.every(Number.isFinite)?null:new D(Number(r[0]),Number(r[1]),Number(r[2]))}function vv(){const r={l:5613311,m:6804369,r:16038755};Object.keys(r).forEach(e=>{if(ll[e])return;const t=new ho(new wt,new En({color:r[e],transparent:!0,opacity:.82})),i=new Ft(new po(.026,16,12),new os({color:r[e],transparent:!0,opacity:.95}));i.visible=!1;const n=new Kc(new D(1,0,0),new D,.001,6804369,.035,.018),s=new Kc(new D(1,0,0),new D,.001,5613311,.028,.014);n.visible=!1,s.visible=!1,Ns.add(t,i,n,s),ll[e]={trail:t,marker:i,actualArrow:n,commandedArrow:s,points:[]}})}function yv(r,e){const t=ll[r];if(!t||!e.pose)return;t.marker.visible=!0,t.marker.position.copy(e.pose.worldPosition);const i=t.points.at(-1);(!i||i.distanceToSquared(e.pose.worldPosition)>1e-10)&&(t.points.push(e.pose.worldPosition.clone()),t.points.length>xv&&t.points.shift(),t.trail.geometry.setFromPoints(t.points));const n=(s,o,a,c)=>{var u,f;const l=(o==null?void 0:o.length())??0;if(s.visible=l>1e-5,!o||l<=1e-5)return;const h=(f=(u=yo[r])==null?void 0:u.links)==null?void 0:f.base_link,d=h?o.clone().transformDirection(h.matrixWorld):o.clone().normalize();s.position.copy(e.pose.worldPosition),s.setDirection(d),s.setLength(Math.min(.35,Math.max(.04,l*.35)),a,c)};n(t.actualArrow,e.measuredLinearMps,.035,.018),n(t.commandedArrow,e.commandedLinearMps,.028,.014)}function bv(r,e){const t=Fl(r),i=Zn[r],n=Or(e==null?void 0:e.commanded_linear_velocity_mps),s=Or(e==null?void 0:e.commanded_angular_velocity_radps),o=(e==null?void 0:e.measured_frame_id)===`${r}/base_link`,a=e!=null&&e.measured_valid&&o?Or(e.measured_linear_velocity_mps):null,c=e!=null&&e.measured_valid&&o?Or(e.measured_angular_velocity_radps):null,l=[...(i==null?void 0:i.history)??[],{commandLinear:(n==null?void 0:n.length())??0,measuredLinear:(a==null?void 0:a.length())??null,commandAngular:(s==null?void 0:s.length())??0,measuredAngular:(c==null?void 0:c.length())??null}].slice(-60),h={pose:t,commandedLinearMps:n,commandedAngularRadps:s,measuredLinearMps:a,measuredAngularRadps:c,measuredAgeMs:Number.isFinite(e==null?void 0:e.measured_age_ms)?Number(e==null?void 0:e.measured_age_ms):null,measuredFrameMatchesBase:o,history:l};return Zn[r]=h,yv(r,h),h}function kh(r,e,t){return r.map((s,o)=>{const a=s[e],c=r.length>1?o*240/(r.length-1):240,l=a===null?46:46-Number(a)/t*46;return`${o?"L":"M"}${c.toFixed(1)},${l.toFixed(1)}`}).join(" ")}function Bh(r,e,t,i){const n=r.flatMap(o=>[o[t],o[i]]).filter(o=>o!==null),s=Math.max(.001,...n);return`<svg viewBox="0 0 240 62" role="img" aria-label="控制与实际${e}速度曲线"><path class="motion-gridline" d="M0 46H240"/><path class="motion-command" d="${kh(r,t,s)}"/><path class="motion-measured" d="${kh(r,i,s)}"/><text x="0" y="60">0</text><text x="238" y="60" text-anchor="end">${s.toFixed(2)} ${e}</text></svg>`}function Mv(){const r=["l","m","r"],e=r.filter(n=>{var s;return(s=Zn[n])==null?void 0:s.pose}).length,t=r.some(n=>{var s;return!!((s=Zn[n])!=null&&s.measuredLinearMps)}),i=r.some(n=>{var s;return!!((s=Zn[n])!=null&&s.commandedLinearMps)});_v.textContent=e?`${e} / 3 末端可视化`:"等待末端数据",mv.dataset.motionVisualization=e?"active":"waiting",so.dataset.endEffectorMarkers=e?"active":"waiting",so.dataset.velocityVectors=t&&i?"actual+commanded":t?"actual":i?"commanded":"waiting",gv.innerHTML=r.map(n=>{const s=Zn[n],o=s==null?void 0:s.commandedLinearMps,a=s==null?void 0:s.commandedAngularRadps,c=s==null?void 0:s.measuredLinearMps,l=s==null?void 0:s.measuredAngularRadps,h=s?s.measuredFrameMatchesBase?c?`驱动测量 · ${s.measuredAgeMs??"—"} ms`:"驱动测量无效":"测量坐标系不匹配":"等待驱动状态",d=s?`<div class="motion-charts"><div><small>线速度 · 控制 / 实际</small>${Bh(s.history,"m/s","commandLinear","measuredLinear")}</div><div><small>角速度 · 控制 / 实际</small>${Bh(s.history,"rad/s","commandAngular","measuredAngular")}</div></div>`:"";return`<article id="motion-${n}" class="motion-card"><h4>${n.toUpperCase()} 末端 <span>FK · base_link</span></h4><div class="motion-values"><span>位置 <b>${s!=null&&s.pose?ro(s.pose.basePosition):"等待 URDF FK"} ${s!=null&&s.pose?"m":""}</b></span><span>控制线速度 <b>${o?`${o.length().toFixed(3)} m/s`:"—"}</b></span><span>驱动线速度 <b class="${c?"speed":"unavailable"}">${c?`${c.length().toFixed(3)} m/s`:"—"}</b></span><span>控制角速度 <b>${a?`${a.length().toFixed(3)} rad/s`:"—"}</b></span><span>驱动角速度 <b class="${l?"speed":"unavailable"}">${l?`${l.length().toFixed(3)} rad/s`:"—"}</b></span><span>实际 XYZ <b>${ro(c)}</b></span><span class="motion-source"><b>${h}</b></span></div>${d}</article>`}).join("")}function Sv(){pn=new Uu({canvas:Lh,antialias:!0,alpha:!0,preserveDrawingBuffer:!0}),pn.setPixelRatio(Math.min(window.devicePixelRatio,2)),pn.outputColorSpace=ht,pn.setClearColor(594196,1),pn.shadowMap.enabled=!0,Kn=new bl,mn=new It(35,1,.01,100),mn.up.set(0,0,1),mn.position.set(1.2,-1.8,1.25),Ur=new Ou(mn,Lh),Ur.enableDamping=!0,Ur.target.set(0,0,.55);const r=document.querySelector("#viewer"),e=()=>{const i=r.getBoundingClientRect();!i.width||!i.height||(pn.setSize(i.width,i.height,!1),mn.aspect=i.width/i.height,mn.updateProjectionMatrix())};new ResizeObserver(e).observe(r),e();const t=()=>{requestAnimationFrame(t),Ur.update(),pn.render(Kn,mn)};t()}function Ev(){Wn=new Uu({canvas:Nh,antialias:!0,alpha:!0}),Wn.setPixelRatio(Math.min(window.devicePixelRatio,2)),Wn.outputColorSpace=ht,Wn.setClearColor(594196,1),Ns=new bl,gn=new It(38,1,.01,100),gn.up.set(0,0,1),gn.position.set(1.2,-1.8,1.25),Fr=new Ou(gn,Nh),Fr.enableDamping=!0,Fr.target.set(0,0,.55),Ns.add(new Mu(15200493,2503736,2.5));const r=new wu(3.5,22,5664888,2505536);r.rotation.x=Math.PI/2,Ns.add(r,new Up(.25));const e=()=>{const i=so.getBoundingClientRect();!i.width||!i.height||(Wn.setSize(i.width,i.height,!1),gn.aspect=i.width/i.height,gn.updateProjectionMatrix())};new ResizeObserver(e).observe(so),e();const t=()=>{requestAnimationFrame(t),Fr.update(),Wn.render(Ns,gn)};t()}async function Tv(){var e;if(!Ls)return;Ps.textContent="加载 URDF…",Ps.removeAttribute("hidden");const r=new ev;r.packages={rm65_description:`${location.origin}/models`};try{Kn.add(new Mu(15200493,2503736,2.5));const t=new Eu(16777215,4);t.position.set(2,-3,4),t.castShadow=!0,Kn.add(t);const i=new wu(3.5,22,5664888,2505536);i.rotation.x=Math.PI/2,Kn.add(i),vv();const n=(e=Ls.robots.find(s=>s.id==="m"))==null?void 0:e.transform;if(!n)throw new Error("middle-arm transform is missing from the layout manifest");for(const s of Ls.robots){const o=await r.loadAsync(`${location.origin}${s.urdf_url}`);o.position.set(s.transform.x-n.x,s.transform.y-n.y,s.transform.z-n.z),o.rotation.set(s.transform.roll,s.transform.pitch,s.transform.yaw,"ZYX"),Kn.add(o),yo[s.id]=o,Ul(s.id,Array(6).fill(Ls.default_joint_position_rad))}Ps.setAttribute("hidden",""),cl&&id(cl)}catch(t){Ps.textContent=`URDF 加载失败: ${String(t)}`}}function wv(r){const e=Object.keys(r),t=e.filter(i=>{var n;return(n=r[i])==null?void 0:n.connected}).length;Ye("#arm-count").textContent=`${t} / ${e.length||3} online`,e.length&&(Vu.innerHTML=e.map(i=>{const n=r[i]??{},s=n.positions_rad??[],o=Fl(i),a=o?`<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--line);font:11px ui-monospace,Menlo,monospace;color:var(--muted)">位置 <b style="color:var(--text)">${ro(o.basePosition)}</b> m<br>姿态 <b style="color:var(--text)">[${o.baseQuaternion.w.toFixed(3)}, ${o.baseQuaternion.x.toFixed(3)}, ${o.baseQuaternion.y.toFixed(3)}, ${o.baseQuaternion.z.toFixed(3)}]</b></div>`:"";return`<article class="arm-card ${n.connected?"connected":""}"><h4>${i.toUpperCase()} <span>${n.connected?"CONNECTED":"OFFLINE"}</span></h4><div class="joint-list">${s.length?s.map((c,l)=>`<span>J${l+1} <b>${(c*180/Math.PI).toFixed(1)}°</b></span>`).join(""):"<span>暂无关节数据</span>"}</div>${a}</article>`}).join(""))}const zh={};function Av(r){var t;const e=Object.keys(r);Ye("#camera-count").textContent=e.length?`${e.length} 路 · 低清预览`:"等待视频流",e.length&&((t=Ir.querySelector(".empty"))==null||t.remove(),e.forEach(i=>{let n=Ir.querySelector(`[data-camera="${CSS.escape(i)}"]`);n||(n=document.createElement("div"),n.className="camera-card",n.setAttribute("data-camera",i),n.innerHTML=`<img class="preview-img" alt="${i}" style="display:none"><div class="no-feed">等待视频帧…</div><span class="camera-label">${i}</span><span class="camera-health">NO SIGNAL</span>`,Ir.append(n)),n.style.display="block";const s=n.querySelector(".camera-health"),o=r[i]?(Date.now()*1e6-r[i])/1e9:1/0;if(s&&(s.textContent=o<3?`LIVE · ${o.toFixed(1)}s`:"NO SIGNAL"),!r[i])return;const a=Date.now(),c=zh[i]||0;if(a-c<3e3)return;zh[i]=a;const l=n.querySelector(".preview-img");l&&(l.style.display="block",l.onload=()=>{var h;(h=n.querySelector(".no-feed"))==null||h.remove()},l.src=`/preview/${encodeURIComponent(i)}.jpg?ts=${a}`)}),[...Ir.children].forEach(i=>{const n=i.dataset.camera;n&&!e.includes(n)&&(i.style.display="none")}))}function Rv(r){const e=r.recording??{};pv.textContent=e.detail||"等待设备数据",Ye("#elapsed").textContent=`${(e.elapsed_sec||0).toFixed(1)}s`,Ye("#remaining").textContent=e.remaining_sec>0?`${e.remaining_sec.toFixed(1)}s`:"—",Ye("#dropped").textContent=e.dropped_samples||0,Ye("#status-pulse").style.background=e.state===2?"var(--green)":e.state===7?"var(--red)":"var(--amber)";const t=Number(e.export_progress??0),i=String(e.export_dir??""),n=String(e.export_error??"");n?(da.style.display="",Xn.textContent="转换失败",Xn.style.color="var(--red)",fa.style.width="100%",pa.textContent=`错误: ${n}`):t>0&&t<1?(da.style.display="",Xn.textContent=`转换中 ${Math.round(t*100)}%`,Xn.style.color="",fa.style.width=`${Math.round(t*100)}%`,pa.textContent="",Pv(t)):t>=1&&i&&(da.style.display="",Xn.textContent="转换完成",Xn.style.color="",fa.style.width="100%",pa.textContent=`数据目录: ${i}`),!Qe&&(cl=r,id(r))}const Cv=[{state:"RUNNING",label:"转换中"},{state:"QUEUED",label:"排队中"},{state:"SUCCEEDED",label:"已完成"},{state:"FAILED",label:"失败"}];let ju=[],Qu=0,Hh=-1;function ma(r,e){const t=r.export_state==="RUNNING"?` · ${Math.round(Qu*100)}%`:"",i=r.error?` · ${Ph(r.error)}`:"";return`<div class="queue-row"><span class="queue-session">${Ph(r.session_id)}</span><span class="queue-state">${e}${t}${i}</span></div>`}function ed(){var n;const r=ju.filter(s=>s.decision==="ADOPTED"&&s.export_state);if(!r.length){Uh.style.display="none",Oh.innerHTML='<div class="empty">暂无待转换会话</div>',Fh.textContent="0 个会话";return}Uh.style.display="",Fh.textContent=`${r.length} 个会话`;const e=[];for(const s of["RUNNING","QUEUED"]){const o=r.filter(c=>c.export_state===s);if(!o.length)continue;const a=((n=Cv.find(c=>c.state===s))==null?void 0:n.label)??s;e.push(`<div class="queue-group"><span class="queue-group-label">${a}</span>${o.map(c=>ma(c,a)).join("")}</div>`)}const t=r.filter(s=>s.export_state==="SUCCEEDED"),i=r.filter(s=>s.export_state==="FAILED");if(t.length||i.length){const s=`${t.length} 完成${i.length?` · ${i.length} 失败`:""}`,o=(t.length?`<div class="queue-group"><span class="queue-group-label">已完成</span>${t.map(a=>ma(a,"已完成")).join("")}</div>`:"")+(i.length?`<div class="queue-group"><span class="queue-group-label">失败</span>${i.map(a=>ma(a,"失败")).join("")}</div>`:"");e.push(`<details class="queue-done"><summary>历史记录 · ${s}</summary>${o}</details>`)}Oh.innerHTML=e.join("")}function td(){fetch("/api/lerobot/queue").then(r=>r.ok?r.json():Promise.reject(new Error(String(r.status)))).then(r=>{ju=r.jobs??[],ed()}).catch(()=>{})}function Pv(r){Qu=r;const e=Math.round(r*100);e!==Hh&&(Hh=e,ed())}function id(r){const e=r.arms??{};for(const[i,n]of Object.entries(e)){const s=n.positions_rad;s!=null&&s.length&&(Ul(i,s),Ih[i]=new Date().toISOString())}const t=Object.values(Ih);Wu.textContent=t.length?`joint_states · ${t[t.length-1]}`:"等待 joint_states",wv(e),Object.keys(e).forEach(i=>{var n;return bv(i,(n=e[i])==null?void 0:n.cartesian_velocity)}),Mv(),Dv(r.grippers??{}),Av(r.preview_cameras??{})}const Lv={right:{open:4e3,close:12e3},left:{open:400,close:949},mid:{open:0,close:9e3}};function Nv(r,e){const t=Lv[r.replace("gripper_","")];if(!t)return 0;const i=t.close-t.open;if(i<=0)return 0;const n=Math.min(1,Math.max(0,(t.close-e)/i));return Math.round(n*100)}function nd(r,e){const t=r.replace("gripper_",""),i=Nv(r,e);return`<article class="gripper-card"><h4>${t}</h4><div style="margin-bottom:8px;font:11px ui-monospace,Menlo,monospace;color:#8793a8">开合度 ${i}%</div><div style="height:8px;background:#0b0f17;border:1px solid #202c40;border-radius:4px;overflow:hidden"><div style="height:100%;width:${i}%;background:linear-gradient(90deg,#55a6ff,#67d391);transition:width .2s"></div></div></article>`}function Dv(r){const e=Object.entries(r);if(!e.length)return;const t=e.filter(([i])=>i.endsWith("/position"));t.length&&(Xu.innerHTML=t.map(([i,n])=>nd(i.split("/").filter(Boolean)[0]??"gripper",Number(n.position??0))).join(""))}let Qe=null;async function Iv(r){var e,t,i,n,s;if(!r){bo();return}try{const[o,a]=await Promise.all([fetch(`/api/lerobot/${encodeURIComponent(r)}/frames`),fetch(`/api/lerobot/${encodeURIComponent(r)}/summary`)]);if(!o.ok||!a.ok)throw new Error(`回放接口错误 (${o.status}/${a.status})`);const c=await o.json(),l=await a.json(),h=Os.getSession(r),d=Object.keys(((t=(e=c.frames)==null?void 0:e[0])==null?void 0:t.features)??{}),u=d.length?d:Object.keys(l.features??{}),f=Object.keys(l.features??{}).filter(m=>m.startsWith("observation.images.")),g=f.length?f.map(m=>m.slice(19)):Object.keys(((n=(i=c.frames)==null?void 0:i[0])==null?void 0:n.cameras)??{});Qe={session:r,frames:c.frames??[],index:0,fps:(h==null?void 0:h.fps)||15,summary:l,cameras:g},Mo.setFeatures(u,l),$u.textContent=(h==null?void 0:h.task)||"未标注 task";const v=((s=l.quality)==null?void 0:s.invalid_frames)??0;Yu.textContent=`${(h==null?void 0:h.frames)??Qe.frames.length} 帧 · ${(h==null?void 0:h.fps)??Qe.fps} Hz · quality invalid ${v}`,Dl.style.display="",od.load(),Gu(l.quality??(h==null?void 0:h.quality)),Ol.load(r),sd(0)}catch(o){Il(`回放加载失败: ${String(o)}`,!0)}}function bo(){od.clear(),Mo.clear(),Ol.clear(),Gu(void 0),Os.setActive(null),Qe=null,Dl.style.display="none",qu.textContent="— / —",Ku.textContent="—",$u.textContent="—",Yu.textContent="—",Zu.textContent="URDF 实时关节",Ju.textContent="实时输入"}function sd(r){if(!Qe)return;const e=Qe.frames[r];if(!e)return;Qe.index=r,qu.textContent=`${r+1} / ${Qe.frames.length}`,Ku.textContent=`${(e.timestamp_ns/1e9).toFixed(3)} s`,Wu.textContent=`回放帧 ${r+1} · ${new Date(e.timestamp_ns/1e6).toISOString()}`,Zu.textContent="回放关节",Ju.textContent="回放";const t=["l","m","r"];Vu.innerHTML=t.map((i,n)=>{const s=e.state.slice(n*6,n*6+6);Ul(i,s);const o=s.map((l,h)=>`<span>J${h+1} <b>${(l*180/Math.PI).toFixed(1)}°</b></span>`).join(""),a=Fl(i),c=a?`<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--line);font:11px ui-monospace,Menlo,monospace;color:var(--muted)">位置 <b style="color:var(--text)">${ro(a.basePosition)}</b> m<br>姿态 <b style="color:var(--text)">[${a.baseQuaternion.w.toFixed(3)}, ${a.baseQuaternion.x.toFixed(3)}, ${a.baseQuaternion.y.toFixed(3)}, ${a.baseQuaternion.z.toFixed(3)}]</b></div>`:"";return`<article class="arm-card"><h4>${i.toUpperCase()} <span style="color:var(--blue)">REPLAY</span></h4><div class="joint-list">${o}</div>${c}</article>`}).join(""),Ye("#arm-count").textContent=`回放帧 ${r+1}/${Qe.frames.length}`,Xu.innerHTML=["left","mid","right"].map((i,n)=>nd(i,e.state[18+n]??0)).join(""),Mo.render(e,Qe.frames,Qe.index),Ol.onFrameChange(r)}function rd(){Ts=new WebSocket(`${location.protocol==="https:"?"wss":"ws"}://${location.host}/ws`),Ts.onopen=()=>{Dr.className="connection online",Dr.querySelector("span").textContent="WebSocket 已连接 · 只读机器人"},Ts.onclose=()=>{Dr.className="connection",Dr.querySelector("span").textContent="已断开 · 2 秒后重连",setTimeout(rd,2e3)},Ts.onerror=()=>Il("无法连接录制服务",!0),Ts.onmessage=r=>{const e=JSON.parse(r.data);e.type==="recording_snapshot"&&Rv(e)}}Sv();Ev();fetch("/api/layout").then(r=>r.json()).then(r=>(Ls=r,Tv())).catch(r=>{Ps.textContent=`布局加载失败: ${String(r)}`});rd();td();setInterval(td,5e3);Dl.addEventListener("click",bo);function Uv(){return Qe?{sessionId:Qe.session,fps:Qe.fps,frameCount:Qe.frames.length,cameraIds:Qe.cameras}:null}const od=cv({getSession:Uv,onFrameChange:sd}),Mo=uv(),Ol=fv({getSessionId:()=>(Qe==null?void 0:Qe.session)??null,getCurrentFrame:()=>(Qe==null?void 0:Qe.index)??0,notify:Il}),Os=av({onSelect:r=>{Os.setActive(r),Iv(r)},onChanged:()=>{Os.refresh().then(()=>{Qe&&!Os.getSession(Qe.session)&&bo()})}});var Vh;for(const r of["#replay-feature-select","#replay-action-select","#replay-feature-component"])(Vh=document.querySelector(r))==null||Vh.addEventListener("change",()=>{Qe&&Mo.render(Qe.frames[Qe.index],Qe.frames,Qe.index)});const $s=Ce.init({column:12,cellHeight:60,margin:12,float:!1,animate:!0,draggable:{handle:".panel-head"}},".layout.grid-stack"),ad="recording-layout-v3",Gh=localStorage.getItem(ad);if(Gh)try{$s.load(JSON.parse(Gh))}catch{}$s.on("change",()=>{localStorage.setItem(ad,JSON.stringify($s.save(!1)))});function Fv(r){document.querySelectorAll(".tab").forEach(n=>{n.classList.toggle("active",n.getAttribute("data-tab")===r)});const e=document.querySelector("#tab-record"),t=document.querySelector("#tab-replay"),i=document.querySelector(".layout.grid-stack");e&&e.classList.toggle("replay-mode",r==="replay"),t&&(t.style.display=r==="replay"?"":"none"),r==="replay"?(i==null||i.classList.add("replay-layout"),$s.disable()):(Qe&&bo(),i==null||i.classList.remove("replay-layout"),$s.enable())}document.querySelectorAll(".tab").forEach(r=>{r.addEventListener("click",()=>Fv(r.getAttribute("data-tab")))});
