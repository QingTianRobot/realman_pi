import"./theme-SxNs_qlC.js";import{A as um}from"./arm_icon-CMxfLtlC.js";/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const id="185",Qs={ROTATE:0,DOLLY:1,PAN:2},Ys={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},hm=0,pu=1,fm=2,Qa=1,pm=2,Er=3,mi=0,nn=1,Rn=2,di=0,er=1,mu=2,gu=3,_u=4,mm=5,os=100,gm=101,_m=102,vm=103,xm=104,bm=200,ym=201,Mm=202,Sm=203,ec=204,tc=205,Em=206,Tm=207,Am=208,wm=209,Rm=210,Cm=211,Pm=212,Lm=213,Nm=214,nc=0,ic=1,sc=2,rr=3,rc=4,ac=5,oc=6,lc=7,zo=0,Im=1,Dm=2,qn=0,vf=1,xf=2,bf=3,yf=4,Mf=5,Sf=6,Ef=7,vu="attached",Um="detached",Tf=300,xs=301,ar=302,tl=303,nl=304,Vo=306,ds=1e3,dn=1001,cc=1002,zt=1003,Fm=1004,pa=1005,Pt=1006,il=1007,oi=1008,cn=1009,Af=1010,wf=1011,Br=1012,sd=1013,Yn=1014,Cn=1015,gi=1016,rd=1017,ad=1018,zr=1020,Rf=35902,Cf=35899,Pf=1021,Lf=1022,vn=1023,_i=1026,us=1027,Nf=1028,od=1029,bs=1030,ld=1031,cd=1033,eo=33776,to=33777,no=33778,io=33779,dc=35840,uc=35841,hc=35842,fc=35843,pc=36196,mc=37492,gc=37496,_c=37488,vc=37489,po=37490,xc=37491,bc=37808,yc=37809,Mc=37810,Sc=37811,Ec=37812,Tc=37813,Ac=37814,wc=37815,Rc=37816,Cc=37817,Pc=37818,Lc=37819,Nc=37820,Ic=37821,Dc=36492,Uc=36494,Fc=36495,Oc=36283,kc=36284,mo=36285,Bc=36286,Vr=2300,zc=2301,sl=2302,Vc=2303,xu=2400,bu=2401,yu=2402,Om=2500,km=3200,Gr=0,Bm=1,Di="",dt="srgb",go="srgb-linear",_o="linear",tt="srgb",Ns=7680,Mu=519,zm=512,Vm=513,Gm=514,dd=515,Hm=516,Wm=517,ud=518,Xm=519,Su=35044,Eu="300 es",Hn=2e3,Hr=2001;function qm(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function $m(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function Wr(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Ym(){const i=Wr("canvas");return i.style.display="block",i}const Tu={};function Au(...i){const e="THREE."+i.shift();console.log(e,...i)}function If(i){const e=i[0];if(typeof e=="string"&&e.startsWith("TSL:")){const t=i[1];t&&t.isStackTrace?i[0]+=" "+t.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function Pe(...i){i=If(i);const e="THREE."+i.shift();{const t=i[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...i)}}function He(...i){i=If(i);const e="THREE."+i.shift();{const t=i[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...i)}}function tr(...i){const e=i.join(" ");e in Tu||(Tu[e]=!0,Pe(...i))}function Km(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}const Zm={[nc]:ic,[sc]:oc,[rc]:lc,[rr]:ac,[ic]:nc,[oc]:sc,[lc]:rc,[ac]:rr};class Zi{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){const n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){const n=this._listeners;if(n===void 0)return;const s=n[e];if(s!==void 0){const r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const n=t[e.type];if(n!==void 0){e.target=this;const s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}}const Ht=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let wu=1234567;const wr=Math.PI/180,or=180/Math.PI;function Ji(){const i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Ht[i&255]+Ht[i>>8&255]+Ht[i>>16&255]+Ht[i>>24&255]+"-"+Ht[e&255]+Ht[e>>8&255]+"-"+Ht[e>>16&15|64]+Ht[e>>24&255]+"-"+Ht[t&63|128]+Ht[t>>8&255]+"-"+Ht[t>>16&255]+Ht[t>>24&255]+Ht[n&255]+Ht[n>>8&255]+Ht[n>>16&255]+Ht[n>>24&255]).toLowerCase()}function qe(i,e,t){return Math.max(e,Math.min(t,i))}function hd(i,e){return(i%e+e)%e}function Jm(i,e,t,n,s){return n+(i-e)*(s-n)/(t-e)}function jm(i,e,t){return i!==e?(t-i)/(e-i):0}function Rr(i,e,t){return(1-t)*i+t*e}function Qm(i,e,t,n){return Rr(i,e,1-Math.exp(-t*n))}function eg(i,e=1){return e-Math.abs(hd(i,e*2)-e)}function tg(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function ng(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function ig(i,e){return i+Math.floor(Math.random()*(e-i+1))}function sg(i,e){return i+Math.random()*(e-i)}function rg(i){return i*(.5-Math.random())}function ag(i){i!==void 0&&(wu=i);let e=wu+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function og(i){return i*wr}function lg(i){return i*or}function cg(i){return(i&i-1)===0&&i!==0}function dg(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function ug(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function hg(i,e,t,n,s){const r=Math.cos,a=Math.sin,o=r(t/2),l=a(t/2),c=r((e+n)/2),u=a((e+n)/2),h=r((e-n)/2),d=a((e-n)/2),f=r((n-e)/2),g=a((n-e)/2);switch(s){case"XYX":i.set(o*u,l*h,l*d,o*c);break;case"YZY":i.set(l*d,o*u,l*h,o*c);break;case"ZXZ":i.set(l*h,l*d,o*u,o*c);break;case"XZX":i.set(o*u,l*g,l*f,o*c);break;case"YXY":i.set(l*f,o*u,l*g,o*c);break;case"ZYZ":i.set(l*g,l*f,o*u,o*c);break;default:Pe("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function $s(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function Kt(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}const kn={DEG2RAD:wr,RAD2DEG:or,generateUUID:Ji,clamp:qe,euclideanModulo:hd,mapLinear:Jm,inverseLerp:jm,lerp:Rr,damp:Qm,pingpong:eg,smoothstep:tg,smootherstep:ng,randInt:ig,randFloat:sg,randFloatSpread:rg,seededRandom:ag,degToRad:og,radToDeg:lg,isPowerOfTwo:cg,ceilPowerOfTwo:dg,floorPowerOfTwo:ug,setQuaternionFromProperEuler:hg,normalize:Kt,denormalize:$s},eu=class eu{constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=qe(this.x,e.x,t.x),this.y=qe(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=qe(this.x,e,t),this.y=qe(this.y,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(qe(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(qe(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*n-a*s+e.x,this.y=r*s+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};eu.prototype.isVector2=!0;let Ne=eu;class kt{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,a,o){let l=n[s+0],c=n[s+1],u=n[s+2],h=n[s+3],d=r[a+0],f=r[a+1],g=r[a+2],v=r[a+3];if(h!==v||l!==d||c!==f||u!==g){let m=l*d+c*f+u*g+h*v;m<0&&(d=-d,f=-f,g=-g,v=-v,m=-m);let p=1-o;if(m<.9995){const S=Math.acos(m),A=Math.sin(S);p=Math.sin(p*S)/A,o=Math.sin(o*S)/A,l=l*p+d*o,c=c*p+f*o,u=u*p+g*o,h=h*p+v*o}else{l=l*p+d*o,c=c*p+f*o,u=u*p+g*o,h=h*p+v*o;const S=1/Math.sqrt(l*l+c*c+u*u+h*h);l*=S,c*=S,u*=S,h*=S}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=h}static multiplyQuaternionsFlat(e,t,n,s,r,a){const o=n[s],l=n[s+1],c=n[s+2],u=n[s+3],h=r[a],d=r[a+1],f=r[a+2],g=r[a+3];return e[t]=o*g+u*h+l*f-c*d,e[t+1]=l*g+u*d+c*h-o*f,e[t+2]=c*g+u*f+o*d-l*h,e[t+3]=u*g-o*h-l*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(n/2),u=o(s/2),h=o(r/2),d=l(n/2),f=l(s/2),g=l(r/2);switch(a){case"XYZ":this._x=d*u*h+c*f*g,this._y=c*f*h-d*u*g,this._z=c*u*g+d*f*h,this._w=c*u*h-d*f*g;break;case"YXZ":this._x=d*u*h+c*f*g,this._y=c*f*h-d*u*g,this._z=c*u*g-d*f*h,this._w=c*u*h+d*f*g;break;case"ZXY":this._x=d*u*h-c*f*g,this._y=c*f*h+d*u*g,this._z=c*u*g+d*f*h,this._w=c*u*h-d*f*g;break;case"ZYX":this._x=d*u*h-c*f*g,this._y=c*f*h+d*u*g,this._z=c*u*g-d*f*h,this._w=c*u*h+d*f*g;break;case"YZX":this._x=d*u*h+c*f*g,this._y=c*f*h+d*u*g,this._z=c*u*g-d*f*h,this._w=c*u*h-d*f*g;break;case"XZY":this._x=d*u*h-c*f*g,this._y=c*f*h-d*u*g,this._z=c*u*g+d*f*h,this._w=c*u*h+d*f*g;break;default:Pe("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],s=t[4],r=t[8],a=t[1],o=t[5],l=t[9],c=t[2],u=t[6],h=t[10],d=n+o+h;if(d>0){const f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(u-l)*f,this._y=(r-c)*f,this._z=(a-s)*f}else if(n>o&&n>h){const f=2*Math.sqrt(1+n-o-h);this._w=(u-l)/f,this._x=.25*f,this._y=(s+a)/f,this._z=(r+c)/f}else if(o>h){const f=2*Math.sqrt(1+o-n-h);this._w=(r-c)/f,this._x=(s+a)/f,this._y=.25*f,this._z=(l+u)/f}else{const f=2*Math.sqrt(1+h-n-o);this._w=(a-s)/f,this._x=(r+c)/f,this._y=(l+u)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(qe(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,s=e._y,r=e._z,a=e._w,o=t._x,l=t._y,c=t._z,u=t._w;return this._x=n*u+a*o+s*c-r*l,this._y=s*u+a*l+r*o-n*c,this._z=r*u+a*c+n*l-s*o,this._w=a*u-n*o-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,s=-s,r=-r,a=-a,o=-o);let l=1-t;if(o<.9995){const c=Math.acos(o),u=Math.sin(c);l=Math.sin(l*c)/u,t=Math.sin(t*c)/u,this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this._onChangeCallback()}else this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}const tu=class tu{constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Ru.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Ru.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(e){const t=this.x,n=this.y,s=this.z,r=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*s-o*n),u=2*(o*t-r*s),h=2*(r*n-a*t);return this.x=t+l*c+a*h-o*u,this.y=n+l*u+o*c-r*h,this.z=s+l*h+r*u-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=qe(this.x,e.x,t.x),this.y=qe(this.y,e.y,t.y),this.z=qe(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=qe(this.x,e,t),this.y=qe(this.y,e,t),this.z=qe(this.z,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(qe(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,s=e.y,r=e.z,a=t.x,o=t.y,l=t.z;return this.x=s*l-r*o,this.y=r*a-n*l,this.z=n*o-s*a,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return rl.copy(this).projectOnVector(e),this.sub(rl)}reflect(e){return this.sub(rl.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(qe(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};tu.prototype.isVector3=!0;let I=tu;const rl=new I,Ru=new kt,nu=class nu{constructor(e,t,n,s,r,a,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c)}set(e,t,n,s,r,a,o,l,c){const u=this.elements;return u[0]=e,u[1]=s,u[2]=o,u[3]=t,u[4]=r,u[5]=l,u[6]=n,u[7]=a,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],u=n[4],h=n[7],d=n[2],f=n[5],g=n[8],v=s[0],m=s[3],p=s[6],S=s[1],A=s[4],b=s[7],T=s[2],M=s[5],w=s[8];return r[0]=a*v+o*S+l*T,r[3]=a*m+o*A+l*M,r[6]=a*p+o*b+l*w,r[1]=c*v+u*S+h*T,r[4]=c*m+u*A+h*M,r[7]=c*p+u*b+h*w,r[2]=d*v+f*S+g*T,r[5]=d*m+f*A+g*M,r[8]=d*p+f*b+g*w,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8];return t*a*u-t*o*c-n*r*u+n*o*l+s*r*c-s*a*l}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8],h=u*a-o*c,d=o*l-u*r,f=c*r-a*l,g=t*h+n*d+s*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const v=1/g;return e[0]=h*v,e[1]=(s*c-u*n)*v,e[2]=(o*n-s*a)*v,e[3]=d*v,e[4]=(u*t-s*l)*v,e[5]=(s*r-o*t)*v,e[6]=f*v,e[7]=(n*l-c*t)*v,e[8]=(a*t-n*r)*v,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,a,o){const l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+e,-s*c,s*l,-s*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return tr("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(al.makeScale(e,t)),this}rotate(e){return tr("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(al.makeRotation(-e)),this}translate(e,t){return tr("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(al.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}};nu.prototype.isMatrix3=!0;let Be=nu;const al=new Be,Cu=new Be().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Pu=new Be().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function fg(){const i={enabled:!0,workingColorSpace:go,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===tt&&(s.r=ui(s.r),s.g=ui(s.g),s.b=ui(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===tt&&(s.r=nr(s.r),s.g=nr(s.g),s.b=nr(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Di?_o:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return tr("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return tr("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[go]:{primaries:e,whitePoint:n,transfer:_o,toXYZ:Cu,fromXYZ:Pu,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:dt},outputColorSpaceConfig:{drawingBufferColorSpace:dt}},[dt]:{primaries:e,whitePoint:n,transfer:tt,toXYZ:Cu,fromXYZ:Pu,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:dt}}}),i}const Xe=fg();function ui(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function nr(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}let Is;class pg{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Is===void 0&&(Is=Wr("canvas")),Is.width=e.width,Is.height=e.height;const s=Is.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=Is}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Wr("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=ui(r[a]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(ui(t[n]/255)*255):t[n]=ui(t[n]);return{data:t,width:e.width,height:e.height}}else return Pe("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let mg=0;class fd{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:mg++}),this.uuid=Ji(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(ol(s[a].image)):r.push(ol(s[a]))}else r=ol(s);n.url=r}return t||(e.images[this.uuid]=n),n}}function ol(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?pg.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(Pe("Texture: Unable to serialize Texture."),{})}let gg=0;const ll=new I;class $t extends Zi{constructor(e=$t.DEFAULT_IMAGE,t=$t.DEFAULT_MAPPING,n=dn,s=dn,r=Pt,a=oi,o=vn,l=cn,c=$t.DEFAULT_ANISOTROPY,u=Di){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:gg++}),this.uuid=Ji(),this.name="",this.source=new fd(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new Ne(0,0),this.repeat=new Ne(1,1),this.center=new Ne(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Be,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(ll).x}get height(){return this.source.getSize(ll).y}get depth(){return this.source.getSize(ll).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const n=e[t];if(n===void 0){Pe(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){Pe(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Tf)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case ds:e.x=e.x-Math.floor(e.x);break;case dn:e.x=e.x<0?0:1;break;case cc:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case ds:e.y=e.y-Math.floor(e.y);break;case dn:e.y=e.y<0?0:1;break;case cc:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}$t.DEFAULT_IMAGE=null;$t.DEFAULT_MAPPING=Tf;$t.DEFAULT_ANISOTROPY=1;const iu=class iu{constructor(e=0,t=0,n=0,s=1){this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*n+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r;const l=e.elements,c=l[0],u=l[4],h=l[8],d=l[1],f=l[5],g=l[9],v=l[2],m=l[6],p=l[10];if(Math.abs(u-d)<.01&&Math.abs(h-v)<.01&&Math.abs(g-m)<.01){if(Math.abs(u+d)<.1&&Math.abs(h+v)<.1&&Math.abs(g+m)<.1&&Math.abs(c+f+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const A=(c+1)/2,b=(f+1)/2,T=(p+1)/2,M=(u+d)/4,w=(h+v)/4,_=(g+m)/4;return A>b&&A>T?A<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(A),s=M/n,r=w/n):b>T?b<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(b),n=M/s,r=_/s):T<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(T),n=w/r,s=_/r),this.set(n,s,r,t),this}let S=Math.sqrt((m-g)*(m-g)+(h-v)*(h-v)+(d-u)*(d-u));return Math.abs(S)<.001&&(S=1),this.x=(m-g)/S,this.y=(h-v)/S,this.z=(d-u)/S,this.w=Math.acos((c+f+p-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=qe(this.x,e.x,t.x),this.y=qe(this.y,e.y,t.y),this.z=qe(this.z,e.z,t.z),this.w=qe(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=qe(this.x,e,t),this.y=qe(this.y,e,t),this.z=qe(this.z,e,t),this.w=qe(this.w,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(qe(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};iu.prototype.isVector4=!0;let st=iu;class _g extends Zi{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Pt,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new st(0,0,e,t),this.scissorTest=!1,this.viewport=new st(0,0,e,t),this.textures=[];const s={width:e,height:t,depth:n.depth},r=new $t(s),a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){const t={minFilter:Pt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const s=Object.assign({},e.textures[t].image);this.textures[t].source=new fd(s)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}}class $n extends _g{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class Df extends $t{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=zt,this.minFilter=zt,this.wrapR=dn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class vg extends $t{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=zt,this.minFilter=zt,this.wrapR=dn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const Bo=class Bo{constructor(e,t,n,s,r,a,o,l,c,u,h,d,f,g,v,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c,u,h,d,f,g,v,m)}set(e,t,n,s,r,a,o,l,c,u,h,d,f,g,v,m){const p=this.elements;return p[0]=e,p[4]=t,p[8]=n,p[12]=s,p[1]=r,p[5]=a,p[9]=o,p[13]=l,p[2]=c,p[6]=u,p[10]=h,p[14]=d,p[3]=f,p[7]=g,p[11]=v,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Bo().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();const t=this.elements,n=e.elements,s=1/Ds.setFromMatrixColumn(e,0).length(),r=1/Ds.setFromMatrixColumn(e,1).length(),a=1/Ds.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,s=e.y,r=e.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(s),c=Math.sin(s),u=Math.cos(r),h=Math.sin(r);if(e.order==="XYZ"){const d=a*u,f=a*h,g=o*u,v=o*h;t[0]=l*u,t[4]=-l*h,t[8]=c,t[1]=f+g*c,t[5]=d-v*c,t[9]=-o*l,t[2]=v-d*c,t[6]=g+f*c,t[10]=a*l}else if(e.order==="YXZ"){const d=l*u,f=l*h,g=c*u,v=c*h;t[0]=d+v*o,t[4]=g*o-f,t[8]=a*c,t[1]=a*h,t[5]=a*u,t[9]=-o,t[2]=f*o-g,t[6]=v+d*o,t[10]=a*l}else if(e.order==="ZXY"){const d=l*u,f=l*h,g=c*u,v=c*h;t[0]=d-v*o,t[4]=-a*h,t[8]=g+f*o,t[1]=f+g*o,t[5]=a*u,t[9]=v-d*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){const d=a*u,f=a*h,g=o*u,v=o*h;t[0]=l*u,t[4]=g*c-f,t[8]=d*c+v,t[1]=l*h,t[5]=v*c+d,t[9]=f*c-g,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){const d=a*l,f=a*c,g=o*l,v=o*c;t[0]=l*u,t[4]=v-d*h,t[8]=g*h+f,t[1]=h,t[5]=a*u,t[9]=-o*u,t[2]=-c*u,t[6]=f*h+g,t[10]=d-v*h}else if(e.order==="XZY"){const d=a*l,f=a*c,g=o*l,v=o*c;t[0]=l*u,t[4]=-h,t[8]=c*u,t[1]=d*h+v,t[5]=a*u,t[9]=f*h-g,t[2]=g*h-f,t[6]=o*u,t[10]=v*h+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(xg,e,bg)}lookAt(e,t,n){const s=this.elements;return rn.subVectors(e,t),rn.lengthSq()===0&&(rn.z=1),rn.normalize(),Mi.crossVectors(n,rn),Mi.lengthSq()===0&&(Math.abs(n.z)===1?rn.x+=1e-4:rn.z+=1e-4,rn.normalize(),Mi.crossVectors(n,rn)),Mi.normalize(),ma.crossVectors(rn,Mi),s[0]=Mi.x,s[4]=ma.x,s[8]=rn.x,s[1]=Mi.y,s[5]=ma.y,s[9]=rn.y,s[2]=Mi.z,s[6]=ma.z,s[10]=rn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],u=n[1],h=n[5],d=n[9],f=n[13],g=n[2],v=n[6],m=n[10],p=n[14],S=n[3],A=n[7],b=n[11],T=n[15],M=s[0],w=s[4],_=s[8],y=s[12],P=s[1],R=s[5],L=s[9],z=s[13],X=s[2],O=s[6],N=s[10],V=s[14],$=s[3],j=s[7],re=s[11],se=s[15];return r[0]=a*M+o*P+l*X+c*$,r[4]=a*w+o*R+l*O+c*j,r[8]=a*_+o*L+l*N+c*re,r[12]=a*y+o*z+l*V+c*se,r[1]=u*M+h*P+d*X+f*$,r[5]=u*w+h*R+d*O+f*j,r[9]=u*_+h*L+d*N+f*re,r[13]=u*y+h*z+d*V+f*se,r[2]=g*M+v*P+m*X+p*$,r[6]=g*w+v*R+m*O+p*j,r[10]=g*_+v*L+m*N+p*re,r[14]=g*y+v*z+m*V+p*se,r[3]=S*M+A*P+b*X+T*$,r[7]=S*w+A*R+b*O+T*j,r[11]=S*_+A*L+b*N+T*re,r[15]=S*y+A*z+b*V+T*se,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],a=e[1],o=e[5],l=e[9],c=e[13],u=e[2],h=e[6],d=e[10],f=e[14],g=e[3],v=e[7],m=e[11],p=e[15],S=l*f-c*d,A=o*f-c*h,b=o*d-l*h,T=a*f-c*u,M=a*d-l*u,w=a*h-o*u;return t*(v*S-m*A+p*b)-n*(g*S-m*T+p*M)+s*(g*A-v*T+p*w)-r*(g*b-v*M+m*w)}determinantAffine(){const e=this.elements,t=e[0],n=e[4],s=e[8],r=e[1],a=e[5],o=e[9],l=e[2],c=e[6],u=e[10];return t*(a*u-o*c)-n*(r*u-o*l)+s*(r*c-a*l)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8],h=e[9],d=e[10],f=e[11],g=e[12],v=e[13],m=e[14],p=e[15],S=t*o-n*a,A=t*l-s*a,b=t*c-r*a,T=n*l-s*o,M=n*c-r*o,w=s*c-r*l,_=u*v-h*g,y=u*m-d*g,P=u*p-f*g,R=h*m-d*v,L=h*p-f*v,z=d*p-f*m,X=S*z-A*L+b*R+T*P-M*y+w*_;if(X===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const O=1/X;return e[0]=(o*z-l*L+c*R)*O,e[1]=(s*L-n*z-r*R)*O,e[2]=(v*w-m*M+p*T)*O,e[3]=(d*M-h*w-f*T)*O,e[4]=(l*P-a*z-c*y)*O,e[5]=(t*z-s*P+r*y)*O,e[6]=(m*b-g*w-p*A)*O,e[7]=(u*w-d*b+f*A)*O,e[8]=(a*L-o*P+c*_)*O,e[9]=(n*P-t*L-r*_)*O,e[10]=(g*M-v*b+p*S)*O,e[11]=(h*b-u*M-f*S)*O,e[12]=(o*y-a*R-l*_)*O,e[13]=(t*R-n*y+s*_)*O,e[14]=(v*A-g*T-m*S)*O,e[15]=(u*T-h*A+d*S)*O,this}scale(e){const t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),s=Math.sin(t),r=1-n,a=e.x,o=e.y,l=e.z,c=r*a,u=r*o;return this.set(c*a+n,c*o-s*l,c*l+s*o,0,c*o+s*l,u*o+n,u*l-s*a,0,c*l-s*o,u*l+s*a,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,a){return this.set(1,n,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){const s=this.elements,r=t._x,a=t._y,o=t._z,l=t._w,c=r+r,u=a+a,h=o+o,d=r*c,f=r*u,g=r*h,v=a*u,m=a*h,p=o*h,S=l*c,A=l*u,b=l*h,T=n.x,M=n.y,w=n.z;return s[0]=(1-(v+p))*T,s[1]=(f+b)*T,s[2]=(g-A)*T,s[3]=0,s[4]=(f-b)*M,s[5]=(1-(d+p))*M,s[6]=(m+S)*M,s[7]=0,s[8]=(g+A)*w,s[9]=(m-S)*w,s[10]=(1-(d+v))*w,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){const s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];const r=this.determinantAffine();if(r===0)return n.set(1,1,1),t.identity(),this;let a=Ds.set(s[0],s[1],s[2]).length();const o=Ds.set(s[4],s[5],s[6]).length(),l=Ds.set(s[8],s[9],s[10]).length();r<0&&(a=-a),En.copy(this);const c=1/a,u=1/o,h=1/l;return En.elements[0]*=c,En.elements[1]*=c,En.elements[2]*=c,En.elements[4]*=u,En.elements[5]*=u,En.elements[6]*=u,En.elements[8]*=h,En.elements[9]*=h,En.elements[10]*=h,t.setFromRotationMatrix(En),n.x=a,n.y=o,n.z=l,this}makePerspective(e,t,n,s,r,a,o=Hn,l=!1){const c=this.elements,u=2*r/(t-e),h=2*r/(n-s),d=(t+e)/(t-e),f=(n+s)/(n-s);let g,v;if(l)g=r/(a-r),v=a*r/(a-r);else if(o===Hn)g=-(a+r)/(a-r),v=-2*a*r/(a-r);else if(o===Hr)g=-a/(a-r),v=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=h,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=v,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,s,r,a,o=Hn,l=!1){const c=this.elements,u=2/(t-e),h=2/(n-s),d=-(t+e)/(t-e),f=-(n+s)/(n-s);let g,v;if(l)g=1/(a-r),v=a/(a-r);else if(o===Hn)g=-2/(a-r),v=-(a+r)/(a-r);else if(o===Hr)g=-1/(a-r),v=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=h,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=g,c[14]=v,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}};Bo.prototype.isMatrix4=!0;let Oe=Bo;const Ds=new I,En=new Oe,xg=new I(0,0,0),bg=new I(1,1,1),Mi=new I,ma=new I,rn=new I,Lu=new Oe,Nu=new kt;class Mn{constructor(e=0,t=0,n=0,s=Mn.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const s=e.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],u=s[9],h=s[2],d=s[6],f=s[10];switch(t){case"XYZ":this._y=Math.asin(qe(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,f),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-qe(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-h,r),this._z=0);break;case"ZXY":this._x=Math.asin(qe(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-h,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-qe(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(qe(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-h,r)):(this._x=0,this._y=Math.atan2(o,f));break;case"XZY":this._z=Math.asin(-qe(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-u,f),this._y=0);break;default:Pe("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Lu.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Lu,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Nu.setFromEuler(this),this.setFromQuaternion(Nu,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Mn.DEFAULT_ORDER="XYZ";class pd{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let yg=0;const Iu=new I,Us=new kt,Jn=new Oe,ga=new I,gr=new I,Mg=new I,Sg=new kt,Du=new I(1,0,0),Uu=new I(0,1,0),Fu=new I(0,0,1),Ou={type:"added"},Eg={type:"removed"},Fs={type:"childadded",child:null},cl={type:"childremoved",child:null};class _t extends Zi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:yg++}),this.uuid=Ji(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=_t.DEFAULT_UP.clone();const e=new I,t=new Mn,n=new kt,s=new I(1,1,1);function r(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Oe},normalMatrix:{value:new Be}}),this.matrix=new Oe,this.matrixWorld=new Oe,this.matrixAutoUpdate=_t.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=_t.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new pd,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Us.setFromAxisAngle(e,t),this.quaternion.multiply(Us),this}rotateOnWorldAxis(e,t){return Us.setFromAxisAngle(e,t),this.quaternion.premultiply(Us),this}rotateX(e){return this.rotateOnAxis(Du,e)}rotateY(e){return this.rotateOnAxis(Uu,e)}rotateZ(e){return this.rotateOnAxis(Fu,e)}translateOnAxis(e,t){return Iu.copy(e).applyQuaternion(this.quaternion),this.position.add(Iu.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Du,e)}translateY(e){return this.translateOnAxis(Uu,e)}translateZ(e){return this.translateOnAxis(Fu,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Jn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?ga.copy(e):ga.set(e,t,n);const s=this.parent;this.updateWorldMatrix(!0,!1),gr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Jn.lookAt(gr,ga,this.up):Jn.lookAt(ga,gr,this.up),this.quaternion.setFromRotationMatrix(Jn),s&&(Jn.extractRotation(s.matrixWorld),Us.setFromRotationMatrix(Jn),this.quaternion.premultiply(Us.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(He("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Ou),Fs.child=e,this.dispatchEvent(Fs),Fs.child=null):He("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Eg),cl.child=e,this.dispatchEvent(cl),cl.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Jn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Jn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Jn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Ou),Fs.child=e,this.dispatchEvent(Fs),Fs.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){const a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(gr,e,Mg),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(gr,Sg,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);const e=this.pivot;if(e!==null){const t=e.x,n=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*n-r[8]*s,r[13]+=n-r[1]*t-r[5]*n-r[9]*s,r[14]+=s-r[2]*t-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){const s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){const r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,n)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),this.static!==!1&&(s.static=this.static),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){const h=l[c];r(e.shapes,h)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(e.materials,this.material[l]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];s.animations.push(r(e.animations,l))}}if(t){const o=a(e.geometries),l=a(e.materials),c=a(e.textures),u=a(e.images),h=a(e.shapes),d=a(e.skeletons),f=a(e.animations),g=a(e.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),h.length>0&&(n.shapes=h),d.length>0&&(n.skeletons=d),f.length>0&&(n.animations=f),g.length>0&&(n.nodes=g)}return n.object=s,n;function a(o){const l=[];for(const c in o){const u=o[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const s=e.children[n];this.add(s.clone())}return this}}_t.DEFAULT_UP=new I(0,1,0);_t.DEFAULT_MATRIX_AUTO_UPDATE=!0;_t.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class Fi extends _t{constructor(){super(),this.isGroup=!0,this.type="Group"}}const Tg={type:"move"};class dl{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Fi,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Fi,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new I,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new I),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Fi,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new I,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new I,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,a=null;const o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(const v of e.hand.values()){const m=t.getJointPose(v,n),p=this._getHandJoint(c,v);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}const u=c.joints["index-finger-tip"],h=c.joints["thumb-tip"],d=u.position.distanceTo(h.position),f=.02,g=.005;c.inputState.pinching&&d>f+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&d<=f-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Tg)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new Fi;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}const Uf={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Si={h:0,s:0,l:0},_a={h:0,s:0,l:0};function ul(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}class ke{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=dt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Xe.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=Xe.workingColorSpace){return this.r=e,this.g=t,this.b=n,Xe.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=Xe.workingColorSpace){if(e=hd(e,1),t=qe(t,0,1),n=qe(n,0,1),t===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+t):n+t-n*t,a=2*n-r;this.r=ul(a,r,e+1/3),this.g=ul(a,r,e),this.b=ul(a,r,e-1/3)}return Xe.colorSpaceToWorking(this,s),this}setStyle(e,t=dt){function n(r){r!==void 0&&parseFloat(r)<1&&Pe("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:Pe("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);Pe("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=dt){const n=Uf[e.toLowerCase()];return n!==void 0?this.setHex(n,t):Pe("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=ui(e.r),this.g=ui(e.g),this.b=ui(e.b),this}copyLinearToSRGB(e){return this.r=nr(e.r),this.g=nr(e.g),this.b=nr(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=dt){return Xe.workingToColorSpace(Wt.copy(this),e),Math.round(qe(Wt.r*255,0,255))*65536+Math.round(qe(Wt.g*255,0,255))*256+Math.round(qe(Wt.b*255,0,255))}getHexString(e=dt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Xe.workingColorSpace){Xe.workingToColorSpace(Wt.copy(this),t);const n=Wt.r,s=Wt.g,r=Wt.b,a=Math.max(n,s,r),o=Math.min(n,s,r);let l,c;const u=(o+a)/2;if(o===a)l=0,c=0;else{const h=a-o;switch(c=u<=.5?h/(a+o):h/(2-a-o),a){case n:l=(s-r)/h+(s<r?6:0);break;case s:l=(r-n)/h+2;break;case r:l=(n-s)/h+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=Xe.workingColorSpace){return Xe.workingToColorSpace(Wt.copy(this),t),e.r=Wt.r,e.g=Wt.g,e.b=Wt.b,e}getStyle(e=dt){Xe.workingToColorSpace(Wt.copy(this),e);const t=Wt.r,n=Wt.g,s=Wt.b;return e!==dt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(Si),this.setHSL(Si.h+e,Si.s+t,Si.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Si),e.getHSL(_a);const n=Rr(Si.h,_a.h,t),s=Rr(Si.s,_a.s,t),r=Rr(Si.l,_a.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Wt=new ke;ke.NAMES=Uf;class Ff extends _t{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Mn,this.environmentIntensity=1,this.environmentRotation=new Mn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}const Tn=new I,jn=new I,hl=new I,Qn=new I,Os=new I,ks=new I,ku=new I,fl=new I,pl=new I,ml=new I,gl=new st,_l=new st,vl=new st;class _n{constructor(e=new I,t=new I,n=new I){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),Tn.subVectors(e,t),s.cross(Tn);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){Tn.subVectors(s,t),jn.subVectors(n,t),hl.subVectors(e,t);const a=Tn.dot(Tn),o=Tn.dot(jn),l=Tn.dot(hl),c=jn.dot(jn),u=jn.dot(hl),h=a*c-o*o;if(h===0)return r.set(0,0,0),null;const d=1/h,f=(c*l-o*u)*d,g=(a*u-o*l)*d;return r.set(1-f-g,g,f)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,Qn)===null?!1:Qn.x>=0&&Qn.y>=0&&Qn.x+Qn.y<=1}static getInterpolation(e,t,n,s,r,a,o,l){return this.getBarycoord(e,t,n,s,Qn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Qn.x),l.addScaledVector(a,Qn.y),l.addScaledVector(o,Qn.z),l)}static getInterpolatedAttribute(e,t,n,s,r,a){return gl.setScalar(0),_l.setScalar(0),vl.setScalar(0),gl.fromBufferAttribute(e,t),_l.fromBufferAttribute(e,n),vl.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector(gl,r.x),a.addScaledVector(_l,r.y),a.addScaledVector(vl,r.z),a}static isFrontFacing(e,t,n,s){return Tn.subVectors(n,t),jn.subVectors(e,t),Tn.cross(jn).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Tn.subVectors(this.c,this.b),jn.subVectors(this.a,this.b),Tn.cross(jn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return _n.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return _n.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return _n.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return _n.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return _n.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,s=this.b,r=this.c;let a,o;Os.subVectors(s,n),ks.subVectors(r,n),fl.subVectors(e,n);const l=Os.dot(fl),c=ks.dot(fl);if(l<=0&&c<=0)return t.copy(n);pl.subVectors(e,s);const u=Os.dot(pl),h=ks.dot(pl);if(u>=0&&h<=u)return t.copy(s);const d=l*h-u*c;if(d<=0&&l>=0&&u<=0)return a=l/(l-u),t.copy(n).addScaledVector(Os,a);ml.subVectors(e,r);const f=Os.dot(ml),g=ks.dot(ml);if(g>=0&&f<=g)return t.copy(r);const v=f*c-l*g;if(v<=0&&c>=0&&g<=0)return o=c/(c-g),t.copy(n).addScaledVector(ks,o);const m=u*g-f*h;if(m<=0&&h-u>=0&&f-g>=0)return ku.subVectors(r,s),o=(h-u)/(h-u+(f-g)),t.copy(s).addScaledVector(ku,o);const p=1/(m+v+d);return a=v*p,o=d*p,t.copy(n).addScaledVector(Os,a).addScaledVector(ks,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}class Ts{constructor(e=new I(1/0,1/0,1/0),t=new I(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(An.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(An.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=An.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,An):An.fromBufferAttribute(r,a),An.applyMatrix4(e.matrixWorld),this.expandByPoint(An);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),va.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),va.copy(n.boundingBox)),va.applyMatrix4(e.matrixWorld),this.union(va)}const s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,An),An.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(_r),xa.subVectors(this.max,_r),Bs.subVectors(e.a,_r),zs.subVectors(e.b,_r),Vs.subVectors(e.c,_r),Ei.subVectors(zs,Bs),Ti.subVectors(Vs,zs),ts.subVectors(Bs,Vs);let t=[0,-Ei.z,Ei.y,0,-Ti.z,Ti.y,0,-ts.z,ts.y,Ei.z,0,-Ei.x,Ti.z,0,-Ti.x,ts.z,0,-ts.x,-Ei.y,Ei.x,0,-Ti.y,Ti.x,0,-ts.y,ts.x,0];return!xl(t,Bs,zs,Vs,xa)||(t=[1,0,0,0,1,0,0,0,1],!xl(t,Bs,zs,Vs,xa))?!1:(ba.crossVectors(Ei,Ti),t=[ba.x,ba.y,ba.z],xl(t,Bs,zs,Vs,xa))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,An).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(An).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(ei[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),ei[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),ei[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),ei[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),ei[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),ei[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),ei[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),ei[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(ei),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const ei=[new I,new I,new I,new I,new I,new I,new I,new I],An=new I,va=new Ts,Bs=new I,zs=new I,Vs=new I,Ei=new I,Ti=new I,ts=new I,_r=new I,xa=new I,ba=new I,ns=new I;function xl(i,e,t,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){ns.fromArray(i,r);const o=s.x*Math.abs(ns.x)+s.y*Math.abs(ns.y)+s.z*Math.abs(ns.z),l=e.dot(ns),c=t.dot(ns),u=n.dot(ns);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>o)return!1}return!0}const Et=new I,ya=new Ne;let Ag=0;class un extends Zi{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Ag++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Su,this.updateRanges=[],this.gpuType=Cn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)ya.fromBufferAttribute(this,t),ya.applyMatrix3(e),this.setXY(t,ya.x,ya.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Et.fromBufferAttribute(this,t),Et.applyMatrix3(e),this.setXYZ(t,Et.x,Et.y,Et.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Et.fromBufferAttribute(this,t),Et.applyMatrix4(e),this.setXYZ(t,Et.x,Et.y,Et.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Et.fromBufferAttribute(this,t),Et.applyNormalMatrix(e),this.setXYZ(t,Et.x,Et.y,Et.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Et.fromBufferAttribute(this,t),Et.transformDirection(e),this.setXYZ(t,Et.x,Et.y,Et.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=$s(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Kt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=$s(t,this.array)),t}setX(e,t){return this.normalized&&(t=Kt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=$s(t,this.array)),t}setY(e,t){return this.normalized&&(t=Kt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=$s(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Kt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=$s(t,this.array)),t}setW(e,t){return this.normalized&&(t=Kt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Kt(t,this.array),n=Kt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=Kt(t,this.array),n=Kt(n,this.array),s=Kt(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=Kt(t,this.array),n=Kt(n,this.array),s=Kt(s,this.array),r=Kt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Su&&(e.usage=this.usage),e}dispose(){this.dispatchEvent({type:"dispose"})}}class Of extends un{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class kf extends un{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class Qe extends un{constructor(e,t,n){super(new Float32Array(e),t,n)}}const wg=new Ts,vr=new I,bl=new I;class hr{constructor(e=new I,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):wg.setFromPoints(e).getCenter(n);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;vr.subVectors(e,this.center);const t=vr.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(vr,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(bl.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(vr.copy(e.center).add(bl)),this.expandByPoint(vr.copy(e.center).sub(bl))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}let Rg=0;const pn=new Oe,yl=new _t,Gs=new I,an=new Ts,xr=new Ts,Dt=new I;class Vt extends Zi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Rg++}),this.uuid=Ji(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(qm(e)?kf:Of)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new Be().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return pn.makeRotationFromQuaternion(e),this.applyMatrix4(pn),this}rotateX(e){return pn.makeRotationX(e),this.applyMatrix4(pn),this}rotateY(e){return pn.makeRotationY(e),this.applyMatrix4(pn),this}rotateZ(e){return pn.makeRotationZ(e),this.applyMatrix4(pn),this}translate(e,t,n){return pn.makeTranslation(e,t,n),this.applyMatrix4(pn),this}scale(e,t,n){return pn.makeScale(e,t,n),this.applyMatrix4(pn),this}lookAt(e){return yl.lookAt(e),yl.updateMatrix(),this.applyMatrix4(yl.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Gs).negate(),this.translate(Gs.x,Gs.y,Gs.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const n=[];for(let s=0,r=e.length;s<r;s++){const a=e[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new Qe(n,3))}else{const n=Math.min(e.length,t.count);for(let s=0;s<n;s++){const r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&Pe("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Ts);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){He("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new I(-1/0,-1/0,-1/0),new I(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){const r=t[n];an.setFromBufferAttribute(r),this.morphTargetsRelative?(Dt.addVectors(this.boundingBox.min,an.min),this.boundingBox.expandByPoint(Dt),Dt.addVectors(this.boundingBox.max,an.max),this.boundingBox.expandByPoint(Dt)):(this.boundingBox.expandByPoint(an.min),this.boundingBox.expandByPoint(an.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&He('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new hr);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){He("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new I,1/0);return}if(e){const n=this.boundingSphere.center;if(an.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){const o=t[r];xr.setFromBufferAttribute(o),this.morphTargetsRelative?(Dt.addVectors(an.min,xr.min),an.expandByPoint(Dt),Dt.addVectors(an.max,xr.max),an.expandByPoint(Dt)):(an.expandByPoint(xr.min),an.expandByPoint(xr.max))}an.getCenter(n);let s=0;for(let r=0,a=e.count;r<a;r++)Dt.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(Dt));if(t)for(let r=0,a=t.length;r<a;r++){const o=t[r],l=this.morphTargetsRelative;for(let c=0,u=o.count;c<u;c++)Dt.fromBufferAttribute(o,c),l&&(Gs.fromBufferAttribute(e,c),Dt.add(Gs)),s=Math.max(s,n.distanceToSquared(Dt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&He('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){He("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,s=t.normal,r=t.uv;let a=this.getAttribute("tangent");(a===void 0||a.count!==n.count)&&(a=new un(new Float32Array(4*n.count),4),this.setAttribute("tangent",a));const o=[],l=[];for(let _=0;_<n.count;_++)o[_]=new I,l[_]=new I;const c=new I,u=new I,h=new I,d=new Ne,f=new Ne,g=new Ne,v=new I,m=new I;function p(_,y,P){c.fromBufferAttribute(n,_),u.fromBufferAttribute(n,y),h.fromBufferAttribute(n,P),d.fromBufferAttribute(r,_),f.fromBufferAttribute(r,y),g.fromBufferAttribute(r,P),u.sub(c),h.sub(c),f.sub(d),g.sub(d);const R=1/(f.x*g.y-g.x*f.y);isFinite(R)&&(v.copy(u).multiplyScalar(g.y).addScaledVector(h,-f.y).multiplyScalar(R),m.copy(h).multiplyScalar(f.x).addScaledVector(u,-g.x).multiplyScalar(R),o[_].add(v),o[y].add(v),o[P].add(v),l[_].add(m),l[y].add(m),l[P].add(m))}let S=this.groups;S.length===0&&(S=[{start:0,count:e.count}]);for(let _=0,y=S.length;_<y;++_){const P=S[_],R=P.start,L=P.count;for(let z=R,X=R+L;z<X;z+=3)p(e.getX(z+0),e.getX(z+1),e.getX(z+2))}const A=new I,b=new I,T=new I,M=new I;function w(_){T.fromBufferAttribute(s,_),M.copy(T);const y=o[_];A.copy(y),A.sub(T.multiplyScalar(T.dot(y))).normalize(),b.crossVectors(M,y);const R=b.dot(l[_])<0?-1:1;a.setXYZW(_,A.x,A.y,A.z,R)}for(let _=0,y=S.length;_<y;++_){const P=S[_],R=P.start,L=P.count;for(let z=R,X=R+L;z<X;z+=3)w(e.getX(z+0)),w(e.getX(z+1)),w(e.getX(z+2))}this._transformed=!0}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==t.count)n=new un(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let d=0,f=n.count;d<f;d++)n.setXYZ(d,0,0,0);const s=new I,r=new I,a=new I,o=new I,l=new I,c=new I,u=new I,h=new I;if(e)for(let d=0,f=e.count;d<f;d+=3){const g=e.getX(d+0),v=e.getX(d+1),m=e.getX(d+2);s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,v),a.fromBufferAttribute(t,m),u.subVectors(a,r),h.subVectors(s,r),u.cross(h),o.fromBufferAttribute(n,g),l.fromBufferAttribute(n,v),c.fromBufferAttribute(n,m),o.add(u),l.add(u),c.add(u),n.setXYZ(g,o.x,o.y,o.z),n.setXYZ(v,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let d=0,f=t.count;d<f;d+=3)s.fromBufferAttribute(t,d+0),r.fromBufferAttribute(t,d+1),a.fromBufferAttribute(t,d+2),u.subVectors(a,r),h.subVectors(s,r),u.cross(h),n.setXYZ(d+0,u.x,u.y,u.z),n.setXYZ(d+1,u.x,u.y,u.z),n.setXYZ(d+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Dt.fromBufferAttribute(e,t),Dt.normalize(),e.setXYZ(t,Dt.x,Dt.y,Dt.z)}toNonIndexed(){function e(o,l){const c=o.array,u=o.itemSize,h=o.normalized,d=new c.constructor(l.length*u);let f=0,g=0;for(let v=0,m=l.length;v<m;v++){o.isInterleavedBufferAttribute?f=l[v]*o.data.stride+o.offset:f=l[v]*u;for(let p=0;p<u;p++)d[g++]=c[f++]}return new un(d,u,h)}if(this.index===null)return Pe("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new Vt,n=this.index.array,s=this.attributes;for(const o in s){const l=s[o],c=e(l,n);t.setAttribute(o,c)}const r=this.morphAttributes;for(const o in r){const l=[],c=r[o];for(let u=0,h=c.length;u<h;u++){const d=c[u],f=e(d,n);l.push(f)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const l in n){const c=n[l];e.data.attributes[l]=c.toJSON(e.data)}const s={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],u=[];for(let h=0,d=c.length;h<d;h++){const f=c[h];u.push(f.toJSON(e.data))}u.length>0&&(s[l]=u,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone());const s=e.attributes;for(const c in s){const u=s[c];this.setAttribute(c,u.clone(t))}const r=e.morphAttributes;for(const c in r){const u=[],h=r[c];for(let d=0,f=h.length;d<f;d++)u.push(h[d].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let c=0,u=a.length;c<u;c++){const h=a[c];this.addGroup(h.start,h.count,h.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}}let Cg=0;class ji extends Zi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Cg++}),this.uuid=Ji(),this.name="",this.type="Material",this.blending=er,this.side=mi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=ec,this.blendDst=tc,this.blendEquation=os,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new ke(0,0,0),this.blendAlpha=0,this.depthFunc=rr,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Mu,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ns,this.stencilZFail=Ns,this.stencilZPass=Ns,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){Pe(`Material: parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){Pe(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==er&&(n.blending=this.blending),this.side!==mi&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==ec&&(n.blendSrc=this.blendSrc),this.blendDst!==tc&&(n.blendDst=this.blendDst),this.blendEquation!==os&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==rr&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Mu&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Ns&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Ns&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Ns&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.allowOverride===!1&&(n.allowOverride=!1),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){const a=[];for(const o in r){const l=r[o];delete l.metadata,a.push(l)}return a}if(t){const r=s(e.textures),a=s(e.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new ke().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let n=e.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new Ne().fromArray(n)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Ne().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}const ti=new I,Ml=new I,Ma=new I,Ai=new I,Sl=new I,Sa=new I,El=new I;class sa{constructor(e=new I,t=new I(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,ti)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=ti.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(ti.copy(this.origin).addScaledVector(this.direction,t),ti.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){Ml.copy(e).add(t).multiplyScalar(.5),Ma.copy(t).sub(e).normalize(),Ai.copy(this.origin).sub(Ml);const r=e.distanceTo(t)*.5,a=-this.direction.dot(Ma),o=Ai.dot(this.direction),l=-Ai.dot(Ma),c=Ai.lengthSq(),u=Math.abs(1-a*a);let h,d,f,g;if(u>0)if(h=a*l-o,d=a*o-l,g=r*u,h>=0)if(d>=-g)if(d<=g){const v=1/u;h*=v,d*=v,f=h*(h+a*d+2*o)+d*(a*h+d+2*l)+c}else d=r,h=Math.max(0,-(a*d+o)),f=-h*h+d*(d+2*l)+c;else d=-r,h=Math.max(0,-(a*d+o)),f=-h*h+d*(d+2*l)+c;else d<=-g?(h=Math.max(0,-(-a*r+o)),d=h>0?-r:Math.min(Math.max(-r,-l),r),f=-h*h+d*(d+2*l)+c):d<=g?(h=0,d=Math.min(Math.max(-r,-l),r),f=d*(d+2*l)+c):(h=Math.max(0,-(a*r+o)),d=h>0?r:Math.min(Math.max(-r,-l),r),f=-h*h+d*(d+2*l)+c);else d=a>0?-r:r,h=Math.max(0,-(a*d+o)),f=-h*h+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,h),s&&s.copy(Ml).addScaledVector(Ma,d),f}intersectSphere(e,t){ti.subVectors(e.center,this.origin);const n=ti.dot(this.direction),s=ti.dot(ti)-n*n,r=e.radius*e.radius;if(s>r)return null;const a=Math.sqrt(r-s),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,a,o,l;const c=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,s=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,s=(e.min.x-d.x)*c),u>=0?(r=(e.min.y-d.y)*u,a=(e.max.y-d.y)*u):(r=(e.max.y-d.y)*u,a=(e.min.y-d.y)*u),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),h>=0?(o=(e.min.z-d.z)*h,l=(e.max.z-d.z)*h):(o=(e.max.z-d.z)*h,l=(e.min.z-d.z)*h),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,ti)!==null}intersectTriangle(e,t,n,s,r){Sl.subVectors(t,e),Sa.subVectors(n,e),El.crossVectors(Sl,Sa);let a=this.direction.dot(El),o;if(a>0){if(s)return null;o=1}else if(a<0)o=-1,a=-a;else return null;Ai.subVectors(this.origin,e);const l=o*this.direction.dot(Sa.crossVectors(Ai,Sa));if(l<0)return null;const c=o*this.direction.dot(Sl.cross(Ai));if(c<0||l+c>a)return null;const u=-o*Ai.dot(El);return u<0?null:this.at(u/a,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Xr extends ji{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new ke(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Mn,this.combine=zo,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const Bu=new Oe,is=new sa,Ea=new hr,zu=new I,Ta=new I,Aa=new I,wa=new I,Tl=new I,Ra=new I,Vu=new I,Ca=new I;class gt extends _t{constructor(e=new Vt,t=new Xr){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){const n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(s,e);const o=this.morphTargetInfluences;if(r&&o){Ra.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const u=o[l],h=r[l];u!==0&&(Tl.fromBufferAttribute(h,e),a?Ra.addScaledVector(Tl,u):Ra.addScaledVector(Tl.sub(t),u))}t.add(Ra)}return t}raycast(e,t){const n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Ea.copy(n.boundingSphere),Ea.applyMatrix4(r),is.copy(e.ray).recast(e.near),!(Ea.containsPoint(is.origin)===!1&&(is.intersectSphere(Ea,zu)===null||is.origin.distanceToSquared(zu)>(e.far-e.near)**2))&&(Bu.copy(r).invert(),is.copy(e.ray).applyMatrix4(Bu),!(n.boundingBox!==null&&is.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,is)))}_computeIntersections(e,t,n){let s;const r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,u=r.attributes.uv1,h=r.attributes.normal,d=r.groups,f=r.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,v=d.length;g<v;g++){const m=d[g],p=a[m.materialIndex],S=Math.max(m.start,f.start),A=Math.min(o.count,Math.min(m.start+m.count,f.start+f.count));for(let b=S,T=A;b<T;b+=3){const M=o.getX(b),w=o.getX(b+1),_=o.getX(b+2);s=Pa(this,p,e,n,c,u,h,M,w,_),s&&(s.faceIndex=Math.floor(b/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const g=Math.max(0,f.start),v=Math.min(o.count,f.start+f.count);for(let m=g,p=v;m<p;m+=3){const S=o.getX(m),A=o.getX(m+1),b=o.getX(m+2);s=Pa(this,a,e,n,c,u,h,S,A,b),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let g=0,v=d.length;g<v;g++){const m=d[g],p=a[m.materialIndex],S=Math.max(m.start,f.start),A=Math.min(l.count,Math.min(m.start+m.count,f.start+f.count));for(let b=S,T=A;b<T;b+=3){const M=b,w=b+1,_=b+2;s=Pa(this,p,e,n,c,u,h,M,w,_),s&&(s.faceIndex=Math.floor(b/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const g=Math.max(0,f.start),v=Math.min(l.count,f.start+f.count);for(let m=g,p=v;m<p;m+=3){const S=m,A=m+1,b=m+2;s=Pa(this,a,e,n,c,u,h,S,A,b),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}}function Pg(i,e,t,n,s,r,a,o){let l;if(e.side===nn?l=n.intersectTriangle(a,r,s,!0,o):l=n.intersectTriangle(s,r,a,e.side===mi,o),l===null)return null;Ca.copy(o),Ca.applyMatrix4(i.matrixWorld);const c=t.ray.origin.distanceTo(Ca);return c<t.near||c>t.far?null:{distance:c,point:Ca.clone(),object:i}}function Pa(i,e,t,n,s,r,a,o,l,c){i.getVertexPosition(o,Ta),i.getVertexPosition(l,Aa),i.getVertexPosition(c,wa);const u=Pg(i,e,t,n,Ta,Aa,wa,Vu);if(u){const h=new I;_n.getBarycoord(Vu,Ta,Aa,wa,h),s&&(u.uv=_n.getInterpolatedAttribute(s,o,l,c,h,new Ne)),r&&(u.uv1=_n.getInterpolatedAttribute(r,o,l,c,h,new Ne)),a&&(u.normal=_n.getInterpolatedAttribute(a,o,l,c,h,new I),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));const d={a:o,b:l,c,normal:new I,materialIndex:0};_n.getNormal(Ta,Aa,wa,d.normal),u.face=d,u.barycoord=h}return u}const br=new st,Gu=new st,Hu=new st,Lg=new st,Wu=new Oe,La=new I,Al=new hr,Xu=new Oe,wl=new sa;class Ng extends gt{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=vu,this.bindMatrix=new Oe,this.bindMatrixInverse=new Oe,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){const e=this.geometry;this.boundingBox===null&&(this.boundingBox=new Ts),this.boundingBox.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,La),this.boundingBox.expandByPoint(La)}computeBoundingSphere(){const e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new hr),this.boundingSphere.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,La),this.boundingSphere.expandByPoint(La)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){const n=this.material,s=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Al.copy(this.boundingSphere),Al.applyMatrix4(s),e.ray.intersectsSphere(Al)!==!1&&(Xu.copy(s).invert(),wl.copy(e.ray).applyMatrix4(Xu),!(this.boundingBox!==null&&wl.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,wl)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){const e=new st,t=this.geometry.attributes.skinWeight;for(let n=0,s=t.count;n<s;n++){e.fromBufferAttribute(t,n);const r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===vu?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===Um?this.bindMatrixInverse.copy(this.bindMatrix).invert():Pe("SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){const n=this.skeleton,s=this.geometry;Gu.fromBufferAttribute(s.attributes.skinIndex,e),Hu.fromBufferAttribute(s.attributes.skinWeight,e),t.isVector4?(br.copy(t),t.set(0,0,0,0)):(br.set(...t,1),t.set(0,0,0)),br.applyMatrix4(this.bindMatrix);for(let r=0;r<4;r++){const a=Hu.getComponent(r);if(a!==0){const o=Gu.getComponent(r);Wu.multiplyMatrices(n.bones[o].matrixWorld,n.boneInverses[o]),t.addScaledVector(Lg.copy(br).applyMatrix4(Wu),a)}}return t.isVector4&&(t.w=br.w),t.applyMatrix4(this.bindMatrixInverse)}}class Bf extends _t{constructor(){super(),this.isBone=!0,this.type="Bone"}}class vo extends $t{constructor(e=null,t=1,n=1,s,r,a,o,l,c=zt,u=zt,h,d){super(null,a,o,l,c,u,s,r,h,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const qu=new Oe,Ig=new Oe;class md{constructor(e=[],t=[]){this.uuid=Ji(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){const e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){Pe("Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,s=this.bones.length;n<s;n++)this.boneInverses.push(new Oe)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){const n=new Oe;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){const e=this.bones,t=this.boneInverses,n=this.boneMatrices,s=this.boneTexture;for(let r=0,a=e.length;r<a;r++){const o=e[r]?e[r].matrixWorld:Ig;qu.multiplyMatrices(o,t[r]),qu.toArray(n,r*16)}s!==null&&(s.needsUpdate=!0)}clone(){return new md(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);const t=new Float32Array(e*e*4);t.set(this.boneMatrices);const n=new vo(t,e,e,vn,Cn);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){const s=this.bones[t];if(s.name===e)return s}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,s=e.bones.length;n<s;n++){const r=e.bones[n];let a=t[r];a===void 0&&(Pe("Skeleton: No bone found with UUID:",r),a=new Bf),this.bones.push(a),this.boneInverses.push(new Oe().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){const e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;const t=this.bones,n=this.boneInverses;for(let s=0,r=t.length;s<r;s++){const a=t[s];e.bones.push(a.uuid);const o=n[s];e.boneInverses.push(o.toArray())}return e}}const Rl=new I,Dg=new I,Ug=new Be;class Pi{constructor(e=new I(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const s=Rl.subVectors(n,t).cross(Dg.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){const s=e.delta(Rl),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const a=-(e.start.dot(this.normal)+this.constant)/r;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(s,a)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||Ug.getNormalMatrix(e),s=this.coplanarPoint(Rl).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const ss=new hr,Fg=new Ne(.5,.5),Na=new I;class gd{constructor(e=new Pi,t=new Pi,n=new Pi,s=new Pi,r=new Pi,a=new Pi){this.planes=[e,t,n,s,r,a]}set(e,t,n,s,r,a){const o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Hn,n=!1){const s=this.planes,r=e.elements,a=r[0],o=r[1],l=r[2],c=r[3],u=r[4],h=r[5],d=r[6],f=r[7],g=r[8],v=r[9],m=r[10],p=r[11],S=r[12],A=r[13],b=r[14],T=r[15];if(s[0].setComponents(c-a,f-u,p-g,T-S).normalize(),s[1].setComponents(c+a,f+u,p+g,T+S).normalize(),s[2].setComponents(c+o,f+h,p+v,T+A).normalize(),s[3].setComponents(c-o,f-h,p-v,T-A).normalize(),n)s[4].setComponents(l,d,m,b).normalize(),s[5].setComponents(c-l,f-d,p-m,T-b).normalize();else if(s[4].setComponents(c-l,f-d,p-m,T-b).normalize(),t===Hn)s[5].setComponents(c+l,f+d,p+m,T+b).normalize();else if(t===Hr)s[5].setComponents(l,d,m,b).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),ss.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),ss.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(ss)}intersectsSprite(e){ss.center.set(0,0,0);const t=Fg.distanceTo(e.center);return ss.radius=.7071067811865476+t,ss.applyMatrix4(e.matrixWorld),this.intersectsSphere(ss)}intersectsSphere(e){const t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const s=t[n];if(Na.x=s.normal.x>0?e.max.x:e.min.x,Na.y=s.normal.y>0?e.max.y:e.min.y,Na.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Na)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class qr extends ji{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new ke(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const xo=new I,bo=new I,$u=new Oe,yr=new sa,Ia=new hr,Cl=new I,Yu=new I;class zf extends _t{constructor(e=new Vt,t=new qr){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[0];for(let s=1,r=t.count;s<r;s++)xo.fromBufferAttribute(t,s-1),bo.fromBufferAttribute(t,s),n[s]=n[s-1],n[s]+=xo.distanceTo(bo);e.setAttribute("lineDistance",new Qe(n,1))}else Pe("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const n=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Ia.copy(n.boundingSphere),Ia.applyMatrix4(s),Ia.radius+=r,e.ray.intersectsSphere(Ia)===!1)return;$u.copy(s).invert(),yr.copy(e.ray).applyMatrix4($u);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,u=n.index,d=n.attributes.position;if(u!==null){const f=Math.max(0,a.start),g=Math.min(u.count,a.start+a.count);for(let v=f,m=g-1;v<m;v+=c){const p=u.getX(v),S=u.getX(v+1),A=Da(this,e,yr,l,p,S,v);A&&t.push(A)}if(this.isLineLoop){const v=u.getX(g-1),m=u.getX(f),p=Da(this,e,yr,l,v,m,g-1);p&&t.push(p)}}else{const f=Math.max(0,a.start),g=Math.min(d.count,a.start+a.count);for(let v=f,m=g-1;v<m;v+=c){const p=Da(this,e,yr,l,v,v+1,v);p&&t.push(p)}if(this.isLineLoop){const v=Da(this,e,yr,l,g-1,f,g-1);v&&t.push(v)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function Da(i,e,t,n,s,r,a){const o=i.geometry.attributes.position;if(xo.fromBufferAttribute(o,s),bo.fromBufferAttribute(o,r),t.distanceSqToSegment(xo,bo,Cl,Yu)>n)return;Cl.applyMatrix4(i.matrixWorld);const c=e.ray.origin.distanceTo(Cl);if(!(c<e.near||c>e.far))return{distance:c,point:Yu.clone().applyMatrix4(i.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:i}}const Ku=new I,Zu=new I;class _d extends zf{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[];for(let s=0,r=t.count;s<r;s+=2)Ku.fromBufferAttribute(t,s),Zu.fromBufferAttribute(t,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+Ku.distanceTo(Zu);e.setAttribute("lineDistance",new Qe(n,1))}else Pe("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class Vf extends $t{constructor(e=[],t=xs,n,s,r,a,o,l,c,u){super(e,t,n,s,r,a,o,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class lr extends $t{constructor(e,t,n=Yn,s,r,a,o=zt,l=zt,c,u=_i,h=1){if(u!==_i&&u!==us)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const d={width:e,height:t,depth:h};super(d,s,r,a,o,l,u,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new fd(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class Og extends lr{constructor(e,t=Yn,n=xs,s,r,a=zt,o=zt,l,c=_i){const u={width:e,height:e,depth:1},h=[u,u,u,u,u,u];super(e,e,t,n,s,r,a,o,l,c),this.image=h,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}}class Gf extends $t{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class As extends Vt{constructor(e=1,t=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};const o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);const l=[],c=[],u=[],h=[];let d=0,f=0;g("z","y","x",-1,-1,n,t,e,a,r,0),g("z","y","x",1,-1,n,t,-e,a,r,1),g("x","z","y",1,1,e,n,t,s,a,2),g("x","z","y",1,-1,e,n,-t,s,a,3),g("x","y","z",1,-1,e,t,n,s,r,4),g("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new Qe(c,3)),this.setAttribute("normal",new Qe(u,3)),this.setAttribute("uv",new Qe(h,2));function g(v,m,p,S,A,b,T,M,w,_,y){const P=b/w,R=T/_,L=b/2,z=T/2,X=M/2,O=w+1,N=_+1;let V=0,$=0;const j=new I;for(let re=0;re<N;re++){const se=re*R-z;for(let ae=0;ae<O;ae++){const xe=ae*P-L;j[v]=xe*S,j[m]=se*A,j[p]=X,c.push(j.x,j.y,j.z),j[v]=0,j[m]=0,j[p]=M>0?1:-1,u.push(j.x,j.y,j.z),h.push(ae/w),h.push(1-re/_),V+=1}}for(let re=0;re<_;re++)for(let se=0;se<w;se++){const ae=d+se+O*re,xe=d+se+O*(re+1),be=d+(se+1)+O*(re+1),le=d+(se+1)+O*re;l.push(ae,xe,le),l.push(xe,be,le),$+=6}o.addGroup(f,$,y),f+=$,d+=V}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new As(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}class vd extends Vt{constructor(e=1,t=1,n=1,s=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};const c=this;s=Math.floor(s),r=Math.floor(r);const u=[],h=[],d=[],f=[];let g=0;const v=[],m=n/2;let p=0;S(),a===!1&&(e>0&&A(!0),t>0&&A(!1)),this.setIndex(u),this.setAttribute("position",new Qe(h,3)),this.setAttribute("normal",new Qe(d,3)),this.setAttribute("uv",new Qe(f,2));function S(){const b=new I,T=new I;let M=0;const w=(t-e)/n;for(let _=0;_<=r;_++){const y=[],P=_/r,R=P*(t-e)+e;for(let L=0;L<=s;L++){const z=L/s,X=z*l+o,O=Math.sin(X),N=Math.cos(X);T.x=R*O,T.y=-P*n+m,T.z=R*N,h.push(T.x,T.y,T.z),b.set(O,w,N).normalize(),d.push(b.x,b.y,b.z),f.push(z,1-P),y.push(g++)}v.push(y)}for(let _=0;_<s;_++)for(let y=0;y<r;y++){const P=v[y][_],R=v[y+1][_],L=v[y+1][_+1],z=v[y][_+1];(e>0||y!==0)&&(u.push(P,R,z),M+=3),(t>0||y!==r-1)&&(u.push(R,L,z),M+=3)}c.addGroup(p,M,0),p+=M}function A(b){const T=g,M=new Ne,w=new I;let _=0;const y=b===!0?e:t,P=b===!0?1:-1;for(let L=1;L<=s;L++)h.push(0,m*P,0),d.push(0,P,0),f.push(.5,.5),g++;const R=g;for(let L=0;L<=s;L++){const X=L/s*l+o,O=Math.cos(X),N=Math.sin(X);w.x=y*N,w.y=m*P,w.z=y*O,h.push(w.x,w.y,w.z),d.push(0,P,0),M.x=O*.5+.5,M.y=N*.5*P+.5,f.push(M.x,M.y),g++}for(let L=0;L<s;L++){const z=T+L,X=R+L;b===!0?u.push(X,X+1,z):u.push(X+1,X,z),_+=3}c.addGroup(p,_,b===!0?1:2),p+=_}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new vd(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}function kg(i,e,t=2){const n=e&&e.length,s=n?e[0]*t:i.length;let r=Hf(i,0,s,t,!0);const a=[];if(!r||r.next===r.prev)return a;let o,l,c;if(n&&(r=Hg(i,e,r,t)),i.length>80*t){o=i[0],l=i[1];let u=o,h=l;for(let d=t;d<s;d+=t){const f=i[d],g=i[d+1];f<o&&(o=f),g<l&&(l=g),f>u&&(u=f),g>h&&(h=g)}c=Math.max(u-o,h-l),c=c!==0?32767/c:0}return $r(r,a,t,o,l,c,0),a}function Hf(i,e,t,n,s){let r;if(s===e_(i,e,t,n)>0)for(let a=e;a<t;a+=n)r=Ju(a/n|0,i[a],i[a+1],r);else for(let a=t-n;a>=e;a-=n)r=Ju(a/n|0,i[a],i[a+1],r);return r&&cr(r,r.next)&&(Kr(r),r=r.next),r}function ys(i,e){if(!i)return i;e||(e=i);let t=i,n;do if(n=!1,!t.steiner&&(cr(t,t.next)||ut(t.prev,t,t.next)===0)){if(Kr(t),t=e=t.prev,t===t.next)break;n=!0}else t=t.next;while(n||t!==e);return e}function $r(i,e,t,n,s,r,a){if(!i)return;!a&&r&&Yg(i,n,s,r);let o=i;for(;i.prev!==i.next;){const l=i.prev,c=i.next;if(r?zg(i,n,s,r):Bg(i)){e.push(l.i,i.i,c.i),Kr(i),i=c.next,o=c.next;continue}if(i=c,i===o){a?a===1?(i=Vg(ys(i),e),$r(i,e,t,n,s,r,2)):a===2&&Gg(i,e,t,n,s,r):$r(ys(i),e,t,n,s,r,1);break}}}function Bg(i){const e=i.prev,t=i,n=i.next;if(ut(e,t,n)>=0)return!1;const s=e.x,r=t.x,a=n.x,o=e.y,l=t.y,c=n.y,u=Math.min(s,r,a),h=Math.min(o,l,c),d=Math.max(s,r,a),f=Math.max(o,l,c);let g=n.next;for(;g!==e;){if(g.x>=u&&g.x<=d&&g.y>=h&&g.y<=f&&Tr(s,o,r,l,a,c,g.x,g.y)&&ut(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function zg(i,e,t,n){const s=i.prev,r=i,a=i.next;if(ut(s,r,a)>=0)return!1;const o=s.x,l=r.x,c=a.x,u=s.y,h=r.y,d=a.y,f=Math.min(o,l,c),g=Math.min(u,h,d),v=Math.max(o,l,c),m=Math.max(u,h,d),p=Gc(f,g,e,t,n),S=Gc(v,m,e,t,n);let A=i.prevZ,b=i.nextZ;for(;A&&A.z>=p&&b&&b.z<=S;){if(A.x>=f&&A.x<=v&&A.y>=g&&A.y<=m&&A!==s&&A!==a&&Tr(o,u,l,h,c,d,A.x,A.y)&&ut(A.prev,A,A.next)>=0||(A=A.prevZ,b.x>=f&&b.x<=v&&b.y>=g&&b.y<=m&&b!==s&&b!==a&&Tr(o,u,l,h,c,d,b.x,b.y)&&ut(b.prev,b,b.next)>=0))return!1;b=b.nextZ}for(;A&&A.z>=p;){if(A.x>=f&&A.x<=v&&A.y>=g&&A.y<=m&&A!==s&&A!==a&&Tr(o,u,l,h,c,d,A.x,A.y)&&ut(A.prev,A,A.next)>=0)return!1;A=A.prevZ}for(;b&&b.z<=S;){if(b.x>=f&&b.x<=v&&b.y>=g&&b.y<=m&&b!==s&&b!==a&&Tr(o,u,l,h,c,d,b.x,b.y)&&ut(b.prev,b,b.next)>=0)return!1;b=b.nextZ}return!0}function Vg(i,e){let t=i;do{const n=t.prev,s=t.next.next;!cr(n,s)&&Xf(n,t,t.next,s)&&Yr(n,s)&&Yr(s,n)&&(e.push(n.i,t.i,s.i),Kr(t),Kr(t.next),t=i=s),t=t.next}while(t!==i);return ys(t)}function Gg(i,e,t,n,s,r){let a=i;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&Jg(a,o)){let l=qf(a,o);a=ys(a,a.next),l=ys(l,l.next),$r(a,e,t,n,s,r,0),$r(l,e,t,n,s,r,0);return}o=o.next}a=a.next}while(a!==i)}function Hg(i,e,t,n){const s=[];for(let r=0,a=e.length;r<a;r++){const o=e[r]*n,l=r<a-1?e[r+1]*n:i.length,c=Hf(i,o,l,n,!1);c===c.next&&(c.steiner=!0),s.push(Zg(c))}s.sort(Wg);for(let r=0;r<s.length;r++)t=Xg(s[r],t);return t}function Wg(i,e){let t=i.x-e.x;if(t===0&&(t=i.y-e.y,t===0)){const n=(i.next.y-i.y)/(i.next.x-i.x),s=(e.next.y-e.y)/(e.next.x-e.x);t=n-s}return t}function Xg(i,e){const t=qg(i,e);if(!t)return e;const n=qf(t,i);return ys(n,n.next),ys(t,t.next)}function qg(i,e){let t=e;const n=i.x,s=i.y;let r=-1/0,a;if(cr(i,t))return t;do{if(cr(i,t.next))return t.next;if(s<=t.y&&s>=t.next.y&&t.next.y!==t.y){const h=t.x+(s-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(h<=n&&h>r&&(r=h,a=t.x<t.next.x?t:t.next,h===n))return a}t=t.next}while(t!==e);if(!a)return null;const o=a,l=a.x,c=a.y;let u=1/0;t=a;do{if(n>=t.x&&t.x>=l&&n!==t.x&&Wf(s<c?n:r,s,l,c,s<c?r:n,s,t.x,t.y)){const h=Math.abs(s-t.y)/(n-t.x);Yr(t,i)&&(h<u||h===u&&(t.x>a.x||t.x===a.x&&$g(a,t)))&&(a=t,u=h)}t=t.next}while(t!==o);return a}function $g(i,e){return ut(i.prev,i,e.prev)<0&&ut(e.next,i,i.next)<0}function Yg(i,e,t,n){let s=i;do s.z===0&&(s.z=Gc(s.x,s.y,e,t,n)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==i);s.prevZ.nextZ=null,s.prevZ=null,Kg(s)}function Kg(i){let e,t=1;do{let n=i,s;i=null;let r=null;for(e=0;n;){e++;let a=n,o=0;for(let c=0;c<t&&(o++,a=a.nextZ,!!a);c++);let l=t;for(;o>0||l>0&&a;)o!==0&&(l===0||!a||n.z<=a.z)?(s=n,n=n.nextZ,o--):(s=a,a=a.nextZ,l--),r?r.nextZ=s:i=s,s.prevZ=r,r=s;n=a}r.nextZ=null,t*=2}while(e>1);return i}function Gc(i,e,t,n,s){return i=(i-t)*s|0,e=(e-n)*s|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,i|e<<1}function Zg(i){let e=i,t=i;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==i);return t}function Wf(i,e,t,n,s,r,a,o){return(s-a)*(e-o)>=(i-a)*(r-o)&&(i-a)*(n-o)>=(t-a)*(e-o)&&(t-a)*(r-o)>=(s-a)*(n-o)}function Tr(i,e,t,n,s,r,a,o){return!(i===a&&e===o)&&Wf(i,e,t,n,s,r,a,o)}function Jg(i,e){return i.next.i!==e.i&&i.prev.i!==e.i&&!jg(i,e)&&(Yr(i,e)&&Yr(e,i)&&Qg(i,e)&&(ut(i.prev,i,e.prev)||ut(i,e.prev,e))||cr(i,e)&&ut(i.prev,i,i.next)>0&&ut(e.prev,e,e.next)>0)}function ut(i,e,t){return(e.y-i.y)*(t.x-e.x)-(e.x-i.x)*(t.y-e.y)}function cr(i,e){return i.x===e.x&&i.y===e.y}function Xf(i,e,t,n){const s=Fa(ut(i,e,t)),r=Fa(ut(i,e,n)),a=Fa(ut(t,n,i)),o=Fa(ut(t,n,e));return!!(s!==r&&a!==o||s===0&&Ua(i,t,e)||r===0&&Ua(i,n,e)||a===0&&Ua(t,i,n)||o===0&&Ua(t,e,n))}function Ua(i,e,t){return e.x<=Math.max(i.x,t.x)&&e.x>=Math.min(i.x,t.x)&&e.y<=Math.max(i.y,t.y)&&e.y>=Math.min(i.y,t.y)}function Fa(i){return i>0?1:i<0?-1:0}function jg(i,e){let t=i;do{if(t.i!==i.i&&t.next.i!==i.i&&t.i!==e.i&&t.next.i!==e.i&&Xf(t,t.next,i,e))return!0;t=t.next}while(t!==i);return!1}function Yr(i,e){return ut(i.prev,i,i.next)<0?ut(i,e,i.next)>=0&&ut(i,i.prev,e)>=0:ut(i,e,i.prev)<0||ut(i,i.next,e)<0}function Qg(i,e){let t=i,n=!1;const s=(i.x+e.x)/2,r=(i.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&s<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(n=!n),t=t.next;while(t!==i);return n}function qf(i,e){const t=Hc(i.i,i.x,i.y),n=Hc(e.i,e.x,e.y),s=i.next,r=e.prev;return i.next=e,e.prev=i,t.next=s,s.prev=t,n.next=t,t.prev=n,r.next=n,n.prev=r,n}function Ju(i,e,t,n){const s=Hc(i,e,t);return n?(s.next=n.next,s.prev=n,n.next.prev=s,n.next=s):(s.prev=s,s.next=s),s}function Kr(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function Hc(i,e,t){return{i,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function e_(i,e,t,n){let s=0;for(let r=e,a=t-n;r<t;r+=n)s+=(i[a]-i[r])*(i[r+1]+i[a+1]),a=r;return s}class t_{static triangulate(e,t,n=2){return kg(e,t,n)}}class yo{static area(e){const t=e.length;let n=0;for(let s=t-1,r=0;r<t;s=r++)n+=e[s].x*e[r].y-e[r].x*e[s].y;return n*.5}static isClockWise(e){return yo.area(e)<0}static triangulateShape(e,t){const n=[],s=[],r=[];ju(e),Qu(n,e);let a=e.length;t.forEach(ju);for(let l=0;l<t.length;l++)s.push(a),a+=t[l].length,Qu(n,t[l]);const o=t_.triangulate(n,s);for(let l=0;l<o.length;l+=3)r.push(o.slice(l,l+3));return r}}function ju(i){const e=i.length;e>2&&i[e-1].equals(i[0])&&i.pop()}function Qu(i,e){for(let t=0;t<e.length;t++)i.push(e[t].x),i.push(e[t].y)}class Go extends Vt{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};const r=e/2,a=t/2,o=Math.floor(n),l=Math.floor(s),c=o+1,u=l+1,h=e/o,d=t/l,f=[],g=[],v=[],m=[];for(let p=0;p<u;p++){const S=p*d-a;for(let A=0;A<c;A++){const b=A*h-r;g.push(b,-S,0),v.push(0,0,1),m.push(A/o),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let S=0;S<o;S++){const A=S+c*p,b=S+c*(p+1),T=S+1+c*(p+1),M=S+1+c*p;f.push(A,b,M),f.push(b,T,M)}this.setIndex(f),this.setAttribute("position",new Qe(g,3)),this.setAttribute("normal",new Qe(v,3)),this.setAttribute("uv",new Qe(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Go(e.width,e.height,e.widthSegments,e.heightSegments)}}class xd extends Vt{constructor(e=1,t=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));const l=Math.min(a+o,Math.PI);let c=0;const u=[],h=new I,d=new I,f=[],g=[],v=[],m=[];for(let p=0;p<=n;p++){const S=[],A=p/n,b=a+A*o,T=e*Math.cos(b),M=Math.sqrt(e*e-T*T);let w=0;p===0&&a===0?w=.5/t:p===n&&l===Math.PI&&(w=-.5/t);for(let _=0;_<=t;_++){const y=_/t,P=s+y*r;h.x=-M*Math.cos(P),h.y=T,h.z=M*Math.sin(P),g.push(h.x,h.y,h.z),d.copy(h).normalize(),v.push(d.x,d.y,d.z),m.push(y+w,1-A),S.push(c++)}u.push(S)}for(let p=0;p<n;p++)for(let S=0;S<t;S++){const A=u[p][S+1],b=u[p][S],T=u[p+1][S],M=u[p+1][S+1];(p!==0||a>0)&&f.push(A,b,M),(p!==n-1||l<Math.PI)&&f.push(b,T,M)}this.setIndex(f),this.setAttribute("position",new Qe(g,3)),this.setAttribute("normal",new Qe(v,3)),this.setAttribute("uv",new Qe(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new xd(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}function dr(i){const e={};for(const t in i){e[t]={};for(const n in i[t]){const s=i[t][n];if(eh(s))s.isRenderTargetTexture?(Pe("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone();else if(Array.isArray(s))if(eh(s[0])){const r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();e[t][n]=r}else e[t][n]=s.slice();else e[t][n]=s}}return e}function Zt(i){const e={};for(let t=0;t<i.length;t++){const n=dr(i[t]);for(const s in n)e[s]=n[s]}return e}function eh(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function n_(i){const e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function $f(i){const e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Xe.workingColorSpace}const i_={clone:dr,merge:Zt};var s_=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,r_=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Kn extends ji{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=s_,this.fragmentShader=r_,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=dr(e.uniforms),this.uniformsGroups=n_(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const s in this.uniforms){const a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(const n in e.uniforms){const s=e.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=t[s.value]||null;break;case"c":this.uniforms[n].value=new ke().setHex(s.value);break;case"v2":this.uniforms[n].value=new Ne().fromArray(s.value);break;case"v3":this.uniforms[n].value=new I().fromArray(s.value);break;case"v4":this.uniforms[n].value=new st().fromArray(s.value);break;case"m3":this.uniforms[n].value=new Be().fromArray(s.value);break;case"m4":this.uniforms[n].value=new Oe().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(const n in e.extensions)this.extensions[n]=e.extensions[n];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}}class a_ extends Kn{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class Ho extends ji{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new ke(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new ke(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Gr,this.normalScale=new Ne(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Mn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Cr extends ji{constructor(e){super(),this.isMeshPhongMaterial=!0,this.type="MeshPhongMaterial",this.color=new ke(16777215),this.specular=new ke(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new ke(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Gr,this.normalScale=new Ne(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Mn,this.combine=zo,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.specular.copy(e.specular),this.shininess=e.shininess,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class o_ extends ji{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new ke(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new ke(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Gr,this.normalScale=new Ne(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Mn,this.combine=zo,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class l_ extends ji{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=km,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class c_ extends ji{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}function Oa(i,e){return!i||i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function d_(i){function e(s,r){return i[s]-i[r]}const t=i.length,n=new Array(t);for(let s=0;s!==t;++s)n[s]=s;return n.sort(e),n}function th(i,e,t){const n=i.length,s=new i.constructor(n);for(let r=0,a=0;a!==n;++r){const o=t[r]*e;for(let l=0;l!==e;++l)s[a++]=i[o+l]}return s}function u_(i,e,t,n){let s=1,r=i[0];for(;r!==void 0&&r[n]===void 0;)r=i[s++];if(r===void 0)return;let a=r[n];if(a!==void 0)if(Array.isArray(a))do a=r[n],a!==void 0&&(e.push(r.time),t.push(...a)),r=i[s++];while(r!==void 0);else if(a.toArray!==void 0)do a=r[n],a!==void 0&&(e.push(r.time),a.toArray(t,t.length)),r=i[s++];while(r!==void 0);else do a=r[n],a!==void 0&&(e.push(r.time),t.push(a)),r=i[s++];while(r!==void 0)}class ra{constructor(e,t,n,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){const t=this.parameterPositions;let n=this._cachedIndex,s=t[n],r=t[n-1];n:{e:{let a;t:{i:if(!(e<s)){for(let o=n+2;;){if(s===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=s,s=t[++n],e<s)break e}a=t.length;break t}if(!(e>=r)){const o=t[1];e<o&&(n=2,r=o);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=t[--n-1],e>=r)break e}a=n,n=0;break t}break n}for(;n<a;){const o=n+a>>>1;e<t[o]?a=o:n=o+1}if(s=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s;for(let a=0;a!==s;++a)t[a]=n[r+a];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}}class h_ extends ra{constructor(e,t,n,s){super(e,t,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:xu,endingEnd:xu}}intervalChanged_(e,t,n){const s=this.parameterPositions;let r=e-2,a=e+1,o=s[r],l=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case bu:r=e,o=2*t-n;break;case yu:r=s.length-2,o=t+s[r]-s[r+1];break;default:r=e,o=n}if(l===void 0)switch(this.getSettings_().endingEnd){case bu:a=e,l=2*n-t;break;case yu:a=1,l=n+s[1]-s[0];break;default:a=e-1,l=t}const c=(n-t)*.5,u=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(l-n),this._offsetPrev=r*u,this._offsetNext=a*u}interpolate_(e,t,n,s){const r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,u=this._offsetPrev,h=this._offsetNext,d=this._weightPrev,f=this._weightNext,g=(n-t)/(s-t),v=g*g,m=v*g,p=-d*m+2*d*v-d*g,S=(1+d)*m+(-1.5-2*d)*v+(-.5+d)*g+1,A=(-1-f)*m+(1.5+f)*v+.5*g,b=f*m-f*v;for(let T=0;T!==o;++T)r[T]=p*a[u+T]+S*a[c+T]+A*a[l+T]+b*a[h+T];return r}}class f_ extends ra{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){const r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,u=(n-t)/(s-t),h=1-u;for(let d=0;d!==o;++d)r[d]=a[c+d]*h+a[l+d]*u;return r}}class p_ extends ra{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e){return this.copySampleValue_(e-1)}}class m_ extends ra{interpolate_(e,t,n,s){const r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,u=this.inTangents,h=this.outTangents;if(!u||!h){const g=(n-t)/(s-t),v=1-g;for(let m=0;m!==o;++m)r[m]=a[c+m]*v+a[l+m]*g;return r}const d=o*2,f=e-1;for(let g=0;g!==o;++g){const v=a[c+g],m=a[l+g],p=f*d+g*2,S=h[p],A=h[p+1],b=e*d+g*2,T=u[b],M=u[b+1];let w=(n-t)/(s-t),_,y,P,R,L;for(let z=0;z<8;z++){_=w*w,y=_*w,P=1-w,R=P*P,L=R*P;const O=L*t+3*R*w*S+3*P*_*T+y*s-n;if(Math.abs(O)<1e-10)break;const N=3*R*(S-t)+6*P*w*(T-S)+3*_*(s-T);if(Math.abs(N)<1e-10)break;w=w-O/N,w=Math.max(0,Math.min(1,w))}r[g]=L*v+3*R*w*A+3*P*_*M+y*m}return r}}class Ln{constructor(e,t,n,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Oa(t,this.TimeBufferType),this.values=Oa(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){const t=e.constructor;let n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Oa(e.times,Array),values:Oa(e.values,Array)};const s=e.getInterpolation();s!==e.DefaultInterpolation&&(n.interpolation=s)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new p_(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new f_(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new h_(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){const t=new m_(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case Vr:t=this.InterpolantFactoryMethodDiscrete;break;case zc:t=this.InterpolantFactoryMethodLinear;break;case sl:t=this.InterpolantFactoryMethodSmooth;break;case Vc:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){const n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return Pe("KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Vr;case this.InterpolantFactoryMethodLinear:return zc;case this.InterpolantFactoryMethodSmooth:return sl;case this.InterpolantFactoryMethodBezier:return Vc}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){const t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]+=e}return this}scale(e){if(e!==1){const t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]*=e}return this}trim(e,t){const n=this.times,s=n.length;let r=0,a=s-1;for(;r!==s&&n[r]<e;)++r;for(;a!==-1&&n[a]>t;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);const o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let e=!0;const t=this.getValueSize();t-Math.floor(t)!==0&&(He("KeyframeTrack: Invalid value size in track.",this),e=!1);const n=this.times,s=this.values,r=n.length;r===0&&(He("KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==r;o++){const l=n[o];if(typeof l=="number"&&isNaN(l)){He("KeyframeTrack: Time is not a valid number.",this,o,l),e=!1;break}if(a!==null&&a>l){He("KeyframeTrack: Out of order keys.",this,o,l,a),e=!1;break}a=l}if(s!==void 0&&$m(s))for(let o=0,l=s.length;o!==l;++o){const c=s[o];if(isNaN(c)){He("KeyframeTrack: Value is not a valid number.",this,o,c),e=!1;break}}return e}optimize(){const e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===sl,r=e.length-1;let a=1;for(let o=1;o<r;++o){let l=!1;const c=e[o],u=e[o+1];if(c!==u&&(o!==1||c!==e[0]))if(s)l=!0;else{const h=o*n,d=h-n,f=h+n;for(let g=0;g!==n;++g){const v=t[h+g];if(v!==t[d+g]||v!==t[f+g]){l=!0;break}}}if(l){if(o!==a){e[a]=e[o];const h=o*n,d=a*n;for(let f=0;f!==n;++f)t[d+f]=t[h+f]}++a}}if(r>0){e[a]=e[r];for(let o=r*n,l=a*n,c=0;c!==n;++c)t[l+c]=t[o+c];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*n)):(this.times=e,this.values=t),this}clone(){const e=this.times.slice(),t=this.values.slice(),n=this.constructor,s=new n(this.name,e,t);return s.createInterpolant=this.createInterpolant,s}}Ln.prototype.ValueTypeName="";Ln.prototype.TimeBufferType=Float32Array;Ln.prototype.ValueBufferType=Float32Array;Ln.prototype.DefaultInterpolation=zc;class fr extends Ln{constructor(e,t,n){super(e,t,n)}}fr.prototype.ValueTypeName="bool";fr.prototype.ValueBufferType=Array;fr.prototype.DefaultInterpolation=Vr;fr.prototype.InterpolantFactoryMethodLinear=void 0;fr.prototype.InterpolantFactoryMethodSmooth=void 0;class Yf extends Ln{constructor(e,t,n,s){super(e,t,n,s)}}Yf.prototype.ValueTypeName="color";class bd extends Ln{constructor(e,t,n,s){super(e,t,n,s)}}bd.prototype.ValueTypeName="number";class g_ extends ra{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){const r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(n-t)/(s-t);let c=e*o;for(let u=c+o;c!==u;c+=4)kt.slerpFlat(r,0,a,c-o,a,c,l);return r}}class ir extends Ln{constructor(e,t,n,s){super(e,t,n,s)}InterpolantFactoryMethodLinear(e){return new g_(this.times,this.values,this.getValueSize(),e)}}ir.prototype.ValueTypeName="quaternion";ir.prototype.InterpolantFactoryMethodSmooth=void 0;class pr extends Ln{constructor(e,t,n){super(e,t,n)}}pr.prototype.ValueTypeName="string";pr.prototype.ValueBufferType=Array;pr.prototype.DefaultInterpolation=Vr;pr.prototype.InterpolantFactoryMethodLinear=void 0;pr.prototype.InterpolantFactoryMethodSmooth=void 0;class mn extends Ln{constructor(e,t,n,s){super(e,t,n,s)}}mn.prototype.ValueTypeName="vector";class nh{constructor(e="",t=-1,n=[],s=Om){this.name=e,this.tracks=n,this.duration=t,this.blendMode=s,this.uuid=Ji(),this.userData={},this.duration<0&&this.resetDuration()}static parse(e){const t=[],n=e.tracks,s=1/(e.fps||1);for(let a=0,o=n.length;a!==o;++a)t.push(v_(n[a]).scale(s));const r=new this(e.name,e.duration,t,e.blendMode);return r.uuid=e.uuid,r.userData=JSON.parse(e.userData||"{}"),r}static toJSON(e){const t=[],n=e.tracks,s={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let r=0,a=n.length;r!==a;++r)t.push(Ln.toJSON(n[r]));return s}static CreateFromMorphTargetSequence(e,t,n,s){const r=t.length,a=[];for(let o=0;o<r;o++){let l=[],c=[];l.push((o+r-1)%r,o,(o+1)%r),c.push(0,1,0);const u=d_(l);l=th(l,1,u),c=th(c,1,u),!s&&l[0]===0&&(l.push(r),c.push(c[0])),a.push(new bd(".morphTargetInfluences["+t[o].name+"]",l,c).scale(1/n))}return new this(e,-1,a)}static findByName(e,t){let n=e;if(!Array.isArray(e)){const s=e;n=s.geometry&&s.geometry.animations||s.animations}for(let s=0;s<n.length;s++)if(n[s].name===t)return n[s];return null}static CreateClipsFromMorphTargetSequences(e,t,n){const s={},r=/^([\w-]*?)([\d]+)$/;for(let o=0,l=e.length;o<l;o++){const c=e[o],u=c.name.match(r);if(u&&u.length>1){const h=u[1];let d=s[h];d||(s[h]=d=[]),d.push(c)}}const a=[];for(const o in s)a.push(this.CreateFromMorphTargetSequence(o,s[o],t,n));return a}resetDuration(){const e=this.tracks;let t=0;for(let n=0,s=e.length;n!==s;++n){const r=this.tracks[n];t=Math.max(t,r.times[r.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){const e=[];for(let n=0;n<this.tracks.length;n++)e.push(this.tracks[n].clone());const t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}}function __(i){switch(i.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return bd;case"vector":case"vector2":case"vector3":case"vector4":return mn;case"color":return Yf;case"quaternion":return ir;case"bool":case"boolean":return fr;case"string":return pr}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+i)}function v_(i){if(i.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");const e=__(i.type);if(i.times===void 0){const t=[],n=[];u_(i.keys,t,n,"value"),i.times=t,i.values=n}return e.parse!==void 0?e.parse(i):new e(i.name,i.times,i.values,i.interpolation)}const Pr={enabled:!1,files:{},add:function(i,e){this.enabled!==!1&&(ih(i)||(this.files[i]=e))},get:function(i){if(this.enabled!==!1&&!ih(i))return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}};function ih(i){try{const e=i.slice(i.indexOf(":")+1);return new URL(e).protocol==="blob:"}catch{return!1}}class x_{constructor(e,t,n){const s=this;let r=!1,a=0,o=0,l;const c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(u){o++,r===!1&&s.onStart!==void 0&&s.onStart(u,a,o),r=!0},this.itemEnd=function(u){a++,s.onProgress!==void 0&&s.onProgress(u,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(u){s.onError!==void 0&&s.onError(u)},this.resolveURL=function(u){return u=u.normalize("NFC"),l?l(u):u},this.setURLModifier=function(u){return l=u,this},this.addHandler=function(u,h){return c.push(u,h),this},this.removeHandler=function(u){const h=c.indexOf(u);return h!==-1&&c.splice(h,2),this},this.getHandler=function(u){for(let h=0,d=c.length;h<d;h+=2){const f=c[h],g=c[h+1];if(f.global&&(f.lastIndex=0),f.test(u))return g}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}}const Kf=new x_;class Qi{constructor(e){this.manager=e!==void 0?e:Kf,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){const n=this;return new Promise(function(s,r){n.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}}Qi.DEFAULT_MATERIAL_NAME="__DEFAULT";const ni={};class b_ extends Error{constructor(e,t){super(e),this.response=t}}class yd extends Qi{constructor(e){super(e),this.mimeType="",this.responseType="",this._abortController=new AbortController}load(e,t,n,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=Pr.get(`file:${e}`);if(r!==void 0){this.manager.itemStart(e),setTimeout(()=>{t&&t(r),this.manager.itemEnd(e)},0);return}if(ni[e]!==void 0){ni[e].push({onLoad:t,onProgress:n,onError:s});return}ni[e]=[],ni[e].push({onLoad:t,onProgress:n,onError:s});const a=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",signal:typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),o=this.mimeType,l=this.responseType;fetch(a).then(c=>{if(c.status===200||c.status===0){if(c.status===0&&Pe("FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||c.body===void 0||c.body.getReader===void 0)return c;const u=ni[e],h=c.body.getReader(),d=c.headers.get("X-File-Size")||c.headers.get("Content-Length"),f=d?parseInt(d):0,g=f!==0;let v=0;const m=new ReadableStream({start(p){S();function S(){h.read().then(({done:A,value:b})=>{if(A)p.close();else{v+=b.byteLength;const T=new ProgressEvent("progress",{lengthComputable:g,loaded:v,total:f});for(let M=0,w=u.length;M<w;M++){const _=u[M];_.onProgress&&_.onProgress(T)}p.enqueue(b),S()}},A=>{p.error(A)})}}});return new Response(m)}else throw new b_(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`,c)}).then(c=>{switch(l){case"arraybuffer":return c.arrayBuffer();case"blob":return c.blob();case"document":return c.text().then(u=>new DOMParser().parseFromString(u,o));case"json":return c.json();default:if(o==="")return c.text();{const h=/charset="?([^;"\s]*)"?/i.exec(o),d=h&&h[1]?h[1].toLowerCase():void 0,f=new TextDecoder(d);return c.arrayBuffer().then(g=>f.decode(g))}}}).then(c=>{Pr.add(`file:${e}`,c);const u=ni[e];delete ni[e];for(let h=0,d=u.length;h<d;h++){const f=u[h];f.onLoad&&f.onLoad(c)}}).catch(c=>{const u=ni[e];if(u===void 0)throw this.manager.itemError(e),c;delete ni[e];for(let h=0,d=u.length;h<d;h++){const f=u[h];f.onError&&f.onError(c)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}const Hs=new WeakMap;class y_ extends Qi{constructor(e){super(e)}load(e,t,n,s){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,a=Pr.get(`image:${e}`);if(a!==void 0){if(a.complete===!0)r.manager.itemStart(e),setTimeout(function(){t&&t(a),r.manager.itemEnd(e)},0);else{let h=Hs.get(a);h===void 0&&(h=[],Hs.set(a,h)),h.push({onLoad:t,onError:s})}return a}const o=Wr("img");function l(){u(),t&&t(this);const h=Hs.get(this)||[];for(let d=0;d<h.length;d++){const f=h[d];f.onLoad&&f.onLoad(this)}Hs.delete(this),r.manager.itemEnd(e)}function c(h){u(),s&&s(h),Pr.remove(`image:${e}`);const d=Hs.get(this)||[];for(let f=0;f<d.length;f++){const g=d[f];g.onError&&g.onError(h)}Hs.delete(this),r.manager.itemError(e),r.manager.itemEnd(e)}function u(){o.removeEventListener("load",l,!1),o.removeEventListener("error",c,!1)}return o.addEventListener("load",l,!1),o.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),Pr.add(`image:${e}`,o),r.manager.itemStart(e),o.src=e,o}}class M_ extends Qi{constructor(e){super(e)}load(e,t,n,s){const r=this,a=new vo,o=new yd(this.manager);return o.setResponseType("arraybuffer"),o.setRequestHeader(this.requestHeader),o.setPath(this.path),o.setWithCredentials(r.withCredentials),o.load(e,function(l){let c;try{c=r.parse(l)}catch(u){s!==void 0?s(u):He(u);return}r._applyTexData(a,c),t&&t(a,c)},n,s),a}createDataTexture(e){const t=new vo;return this._applyTexData(t,this.parse(e)),t}_applyTexData(e,t){t.image!==void 0?e.image=t.image:t.data!==void 0&&(e.image.width=t.width,e.image.height=t.height,e.image.data=t.data),e.wrapS=t.wrapS!==void 0?t.wrapS:dn,e.wrapT=t.wrapT!==void 0?t.wrapT:dn,e.magFilter=t.magFilter!==void 0?t.magFilter:Pt,e.minFilter=t.minFilter!==void 0?t.minFilter:Pt,e.anisotropy=t.anisotropy!==void 0?t.anisotropy:1,t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.mipmaps!==void 0&&(e.mipmaps=t.mipmaps,e.minFilter=oi),t.mipmapCount===1&&(e.minFilter=Pt),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),e.needsUpdate=!0}}class Zf extends Qi{constructor(e){super(e)}load(e,t,n,s){const r=new $t,a=new y_(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(o){r.image=o,r.needsUpdate=!0,t!==void 0&&t(r)},n,s),r}}class aa extends _t{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new ke(e),this.intensity=t}dispose(){this.dispatchEvent({type:"dispose"})}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}}class S_ extends aa{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(_t.DEFAULT_UP),this.updateMatrix(),this.groundColor=new ke(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){const t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}}const Pl=new Oe,sh=new I,rh=new I;class Md{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Ne(512,512),this.mapType=cn,this.map=null,this.mapPass=null,this.matrix=new Oe,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new gd,this._frameExtents=new Ne(1,1),this._viewportCount=1,this._viewports=[new st(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,n=this.matrix;sh.setFromMatrixPosition(e.matrixWorld),t.position.copy(sh),rh.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(rh),t.updateMatrixWorld(),Pl.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Pl,t.coordinateSystem,t.reversedDepth),t.coordinateSystem===Hr||t.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Pl)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}const ka=new I,Ba=new kt,Un=new I;class Jf extends _t{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Oe,this.projectionMatrix=new Oe,this.projectionMatrixInverse=new Oe,this.coordinateSystem=Hn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(ka,Ba,Un),Un.x===1&&Un.y===1&&Un.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(ka,Ba,Un.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(ka,Ba,Un),Un.x===1&&Un.y===1&&Un.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(ka,Ba,Un.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}const wi=new I,ah=new Ne,oh=new Ne;class Xt extends Jf{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=or*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(wr*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return or*2*Math.atan(Math.tan(wr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){wi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(wi.x,wi.y).multiplyScalar(-e/wi.z),wi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(wi.x,wi.y).multiplyScalar(-e/wi.z)}getViewSize(e,t){return this.getViewBounds(e,ah,oh),t.subVectors(oh,ah)}setViewOffset(e,t,n,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(wr*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,t-=a.offsetY*n/c,s*=a.width/l,n*=a.height/c}const o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}class E_ extends Md{constructor(){super(new Xt(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){const t=this.camera,n=or*2*e.angle*this.focus,s=this.mapSize.width/this.mapSize.height*this.aspect,r=e.distance||t.far;(n!==t.fov||s!==t.aspect||r!==t.far)&&(t.fov=n,t.aspect=s,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}}class T_ extends aa{constructor(e,t,n=0,s=Math.PI/3,r=0,a=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(_t.DEFAULT_UP),this.updateMatrix(),this.target=new _t,this.distance=n,this.angle=s,this.penumbra=r,this.decay=a,this.map=null,this.shadow=new E_}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.map=e.map,this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.distance=this.distance,t.object.angle=this.angle,t.object.decay=this.decay,t.object.penumbra=this.penumbra,t.object.target=this.target.uuid,this.map&&this.map.isTexture&&(t.object.map=this.map.toJSON(e).uuid),t.object.shadow=this.shadow.toJSON(),t}}class A_ extends Md{constructor(){super(new Xt(90,1,.5,500)),this.isPointLightShadow=!0}}class w_ extends aa{constructor(e,t,n=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new A_}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}}class Wo extends Jf{constructor(e=-1,t=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=n-e,a=n+e,o=s+t,l=s-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=u*this.view.offsetY,l=o-u*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class R_ extends Md{constructor(){super(new Wo(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class jf extends aa{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(_t.DEFAULT_UP),this.updateMatrix(),this.target=new _t,this.shadow=new R_}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}}class C_ extends aa{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}}class Qf{static extractUrlBase(e){const t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}}const Ws=-90,Xs=1;class P_ extends _t{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new Xt(Ws,Xs,e,t);s.layers=this.layers,this.add(s);const r=new Xt(Ws,Xs,e,t);r.layers=this.layers,this.add(r);const a=new Xt(Ws,Xs,e,t);a.layers=this.layers,this.add(a);const o=new Xt(Ws,Xs,e,t);o.layers=this.layers,this.add(o);const l=new Xt(Ws,Xs,e,t);l.layers=this.layers,this.add(l);const c=new Xt(Ws,Xs,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,s,r,a,o,l]=t;for(const c of t)this.remove(c);if(e===Hn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===Hr)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,a,o,l,c,u]=this.children,h=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const v=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let m=!1;e.isWebGLRenderer===!0?m=e.state.buffers.depth.getReversed():m=e.reversedDepthBuffer,e.setRenderTarget(n,0,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(n,1,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(n,4,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.generateMipmaps=v,e.setRenderTarget(n,5,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,u),e.setRenderTarget(h,d,f),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class L_ extends Xt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}const lh=new Oe;class N_{constructor(e,t,n=0,s=1/0){this.ray=new sa(e,t),this.near=n,this.far=s,this.camera=null,this.layers=new pd,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,t.projectionMatrix.elements[14]).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):He("Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return lh.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(lh),this}intersectObject(e,t=!0,n=[]){return Wc(e,this,n,t),n.sort(ch),n}intersectObjects(e,t=!0,n=[]){for(let s=0,r=e.length;s<r;s++)Wc(e[s],this,n,t);return n.sort(ch),n}}function ch(i,e){return i.distance-e.distance}function Wc(i,e,t,n){let s=!0;if(i.layers.test(e.layers)&&i.raycast(e,t)===!1&&(s=!1),s===!0&&n===!0){const r=i.children;for(let a=0,o=r.length;a<o;a++)Wc(r[a],e,t,!0)}}class dh{constructor(e=1,t=0,n=0){this.radius=e,this.phi=t,this.theta=n}set(e,t,n){return this.radius=e,this.phi=t,this.theta=n,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=qe(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,n){return this.radius=Math.sqrt(e*e+t*t+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,n),this.phi=Math.acos(qe(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}}const su=class su{constructor(e,t,n,s){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,s){const r=this.elements;return r[0]=e,r[2]=t,r[1]=n,r[3]=s,this}};su.prototype.isMatrix2=!0;let uh=su;class I_ extends _d{constructor(e=10,t=10,n=4473924,s=8947848){n=new ke(n),s=new ke(s);const r=t/2,a=e/t,o=e/2,l=[],c=[];for(let d=0,f=0,g=-o;d<=t;d++,g+=a){l.push(-o,0,g,o,0,g),l.push(g,0,-o,g,0,o);const v=d===r?n:s;v.toArray(c,f),f+=3,v.toArray(c,f),f+=3,v.toArray(c,f),f+=3,v.toArray(c,f),f+=3}const u=new Vt;u.setAttribute("position",new Qe(l,3)),u.setAttribute("color",new Qe(c,3));const h=new qr({vertexColors:!0,toneMapped:!1});super(u,h),this.type="GridHelper"}dispose(){this.geometry.dispose(),this.material.dispose()}}class D_ extends _d{constructor(e=1){const t=[0,0,0,e,0,0,0,0,0,0,e,0,0,0,0,0,0,e],n=[1,0,0,1,.6,0,0,1,0,.6,1,0,0,0,1,0,.6,1],s=new Vt;s.setAttribute("position",new Qe(t,3)),s.setAttribute("color",new Qe(n,3));const r=new qr({vertexColors:!0,toneMapped:!1});super(s,r),this.type="AxesHelper"}setColors(e,t,n){const s=new ke,r=this.geometry.attributes.color.array;return s.set(e),s.toArray(r,0),s.toArray(r,3),s.set(t),s.toArray(r,6),s.toArray(r,9),s.set(n),s.toArray(r,12),s.toArray(r,15),this.geometry.attributes.color.needsUpdate=!0,this}dispose(){this.geometry.dispose(),this.material.dispose()}}class U_ extends Zi{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(e){if(e===void 0){Pe("Controls: connect() now requires an element.");return}this.domElement!==null&&this.disconnect(),this.domElement=e}disconnect(){}dispose(){}update(){}}function hh(i,e,t,n){const s=F_(n);switch(t){case Pf:return i*e;case Nf:return i*e/s.components*s.byteLength;case od:return i*e/s.components*s.byteLength;case bs:return i*e*2/s.components*s.byteLength;case ld:return i*e*2/s.components*s.byteLength;case Lf:return i*e*3/s.components*s.byteLength;case vn:return i*e*4/s.components*s.byteLength;case cd:return i*e*4/s.components*s.byteLength;case eo:case to:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case no:case io:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case uc:case fc:return Math.max(i,16)*Math.max(e,8)/4;case dc:case hc:return Math.max(i,8)*Math.max(e,8)/2;case pc:case mc:case _c:case vc:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case gc:case po:case xc:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case bc:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case yc:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case Mc:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case Sc:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case Ec:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case Tc:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case Ac:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case wc:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case Rc:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case Cc:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case Pc:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case Lc:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case Nc:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case Ic:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case Dc:case Uc:case Fc:return Math.ceil(i/4)*Math.ceil(e/4)*16;case Oc:case kc:return Math.ceil(i/4)*Math.ceil(e/4)*8;case mo:case Bc:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function F_(i){switch(i){case cn:case Af:return{byteLength:1,components:1};case Br:case wf:case gi:return{byteLength:2,components:1};case rd:case ad:return{byteLength:2,components:4};case Yn:case sd:case Cn:return{byteLength:4,components:1};case Rf:case Cf:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:id}}));typeof window<"u"&&(window.__THREE__?Pe("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=id);/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function ep(){let i=null,e=!1,t=null,n=null;function s(r,a){t(r,a),n=i.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&i!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function O_(i){const e=new WeakMap;function t(o,l){const c=o.array,u=o.usage,h=c.byteLength,d=i.createBuffer();i.bindBuffer(l,d),i.bufferData(l,c,u),o.onUploadCallback();let f;if(c instanceof Float32Array)f=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)f=i.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?f=i.HALF_FLOAT:f=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=i.SHORT;else if(c instanceof Uint32Array)f=i.UNSIGNED_INT;else if(c instanceof Int32Array)f=i.INT;else if(c instanceof Int8Array)f=i.BYTE;else if(c instanceof Uint8Array)f=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:h}}function n(o,l,c){const u=l.array,h=l.updateRanges;if(i.bindBuffer(c,o),h.length===0)i.bufferSubData(c,0,u);else{h.sort((f,g)=>f.start-g.start);let d=0;for(let f=1;f<h.length;f++){const g=h[d],v=h[f];v.start<=g.start+g.count+1?g.count=Math.max(g.count,v.start+v.count-g.start):(++d,h[d]=v)}h.length=d+1;for(let f=0,g=h.length;f<g;f++){const v=h[f];i.bufferSubData(c,v.start*u.BYTES_PER_ELEMENT,u,v.start,v.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=e.get(o);l&&(i.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const u=e.get(o);(!u||u.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var k_=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,B_=`#ifdef USE_ALPHAHASH
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
#endif`,z_=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,V_=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,G_=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,H_=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,W_=`#ifdef USE_AOMAP
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
#endif`,X_=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,q_=`#ifdef USE_BATCHING
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
#endif`,$_=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Y_=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,K_=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Z_=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,J_=`#ifdef USE_IRIDESCENCE
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
#endif`,j_=`#ifdef USE_BUMPMAP
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
#endif`,Q_=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,e0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,t0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,n0=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,i0=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,s0=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,r0=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,a0=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,o0=`#define PI 3.141592653589793
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
} // validated`,l0=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,c0=`vec3 transformedNormal = objectNormal;
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
#endif`,d0=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,u0=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,h0=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,f0=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,p0="gl_FragColor = linearToOutputTexel( gl_FragColor );",m0=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,g0=`#ifdef USE_ENVMAP
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
#endif`,_0=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,v0=`#ifdef USE_ENVMAP
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
#endif`,x0=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,b0=`#ifdef USE_ENVMAP
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
#endif`,y0=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,M0=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,S0=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,E0=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,T0=`#ifdef USE_GRADIENTMAP
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
}`,A0=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,w0=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,R0=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,C0=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,P0=`#ifdef USE_ENVMAP
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
#endif`,L0=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,N0=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,I0=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,D0=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,U0=`PhysicalMaterial material;
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
#endif`,F0=`uniform sampler2D dfgLUT;
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
}`,O0=`
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
#endif`,k0=`#if defined( RE_IndirectDiffuse )
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
#endif`,B0=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,z0=`#ifdef USE_LIGHT_PROBES_GRID
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
#endif`,V0=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,G0=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,H0=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,W0=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,X0=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,q0=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,$0=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Y0=`#if defined( USE_POINTS_UV )
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
#endif`,K0=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Z0=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,J0=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,j0=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Q0=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,ev=`#ifdef USE_MORPHTARGETS
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
#endif`,tv=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,nv=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,iv=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,sv=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,rv=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,av=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,ov=`#ifdef USE_NORMALMAP
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
#endif`,lv=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,cv=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,dv=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,uv=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,hv=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,fv=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,pv=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,mv=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,gv=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,_v=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,vv=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,xv=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,bv=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,yv=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Mv=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,Sv=`float getShadowMask() {
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
}`,Ev=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Tv=`#ifdef USE_SKINNING
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
#endif`,Av=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,wv=`#ifdef USE_SKINNING
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
#endif`,Rv=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Cv=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Pv=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Lv=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,Nv=`#ifdef USE_TRANSMISSION
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
#endif`,Iv=`#ifdef USE_TRANSMISSION
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
#endif`,Dv=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Uv=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Fv=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Ov=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const kv=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Bv=`uniform sampler2D t2D;
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
}`,zv=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Vv=`#ifdef ENVMAP_TYPE_CUBE
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
}`,Gv=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Hv=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Wv=`#include <common>
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
}`,Xv=`#if DEPTH_PACKING == 3200
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
}`,qv=`#define DISTANCE
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
}`,$v=`#define DISTANCE
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
}`,Yv=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Kv=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Zv=`uniform float scale;
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
}`,Jv=`uniform vec3 diffuse;
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
}`,jv=`#include <common>
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
}`,Qv=`uniform vec3 diffuse;
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
}`,ex=`#define LAMBERT
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
}`,tx=`#define LAMBERT
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
}`,nx=`#define MATCAP
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
}`,ix=`#define MATCAP
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
}`,sx=`#define NORMAL
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
}`,rx=`#define NORMAL
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
}`,ax=`#define PHONG
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
}`,ox=`#define PHONG
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
}`,lx=`#define STANDARD
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
}`,cx=`#define STANDARD
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
}`,dx=`#define TOON
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
}`,ux=`#define TOON
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
}`,hx=`uniform float size;
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
}`,fx=`uniform vec3 diffuse;
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
}`,px=`#include <common>
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
}`,mx=`uniform vec3 color;
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
}`,gx=`uniform float rotation;
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
}`,_x=`uniform vec3 diffuse;
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
}`,Ge={alphahash_fragment:k_,alphahash_pars_fragment:B_,alphamap_fragment:z_,alphamap_pars_fragment:V_,alphatest_fragment:G_,alphatest_pars_fragment:H_,aomap_fragment:W_,aomap_pars_fragment:X_,batching_pars_vertex:q_,batching_vertex:$_,begin_vertex:Y_,beginnormal_vertex:K_,bsdfs:Z_,iridescence_fragment:J_,bumpmap_pars_fragment:j_,clipping_planes_fragment:Q_,clipping_planes_pars_fragment:e0,clipping_planes_pars_vertex:t0,clipping_planes_vertex:n0,color_fragment:i0,color_pars_fragment:s0,color_pars_vertex:r0,color_vertex:a0,common:o0,cube_uv_reflection_fragment:l0,defaultnormal_vertex:c0,displacementmap_pars_vertex:d0,displacementmap_vertex:u0,emissivemap_fragment:h0,emissivemap_pars_fragment:f0,colorspace_fragment:p0,colorspace_pars_fragment:m0,envmap_fragment:g0,envmap_common_pars_fragment:_0,envmap_pars_fragment:v0,envmap_pars_vertex:x0,envmap_physical_pars_fragment:P0,envmap_vertex:b0,fog_vertex:y0,fog_pars_vertex:M0,fog_fragment:S0,fog_pars_fragment:E0,gradientmap_pars_fragment:T0,lightmap_pars_fragment:A0,lights_lambert_fragment:w0,lights_lambert_pars_fragment:R0,lights_pars_begin:C0,lights_toon_fragment:L0,lights_toon_pars_fragment:N0,lights_phong_fragment:I0,lights_phong_pars_fragment:D0,lights_physical_fragment:U0,lights_physical_pars_fragment:F0,lights_fragment_begin:O0,lights_fragment_maps:k0,lights_fragment_end:B0,lightprobes_pars_fragment:z0,logdepthbuf_fragment:V0,logdepthbuf_pars_fragment:G0,logdepthbuf_pars_vertex:H0,logdepthbuf_vertex:W0,map_fragment:X0,map_pars_fragment:q0,map_particle_fragment:$0,map_particle_pars_fragment:Y0,metalnessmap_fragment:K0,metalnessmap_pars_fragment:Z0,morphinstance_vertex:J0,morphcolor_vertex:j0,morphnormal_vertex:Q0,morphtarget_pars_vertex:ev,morphtarget_vertex:tv,normal_fragment_begin:nv,normal_fragment_maps:iv,normal_pars_fragment:sv,normal_pars_vertex:rv,normal_vertex:av,normalmap_pars_fragment:ov,clearcoat_normal_fragment_begin:lv,clearcoat_normal_fragment_maps:cv,clearcoat_pars_fragment:dv,iridescence_pars_fragment:uv,opaque_fragment:hv,packing:fv,premultiplied_alpha_fragment:pv,project_vertex:mv,dithering_fragment:gv,dithering_pars_fragment:_v,roughnessmap_fragment:vv,roughnessmap_pars_fragment:xv,shadowmap_pars_fragment:bv,shadowmap_pars_vertex:yv,shadowmap_vertex:Mv,shadowmask_pars_fragment:Sv,skinbase_vertex:Ev,skinning_pars_vertex:Tv,skinning_vertex:Av,skinnormal_vertex:wv,specularmap_fragment:Rv,specularmap_pars_fragment:Cv,tonemapping_fragment:Pv,tonemapping_pars_fragment:Lv,transmission_fragment:Nv,transmission_pars_fragment:Iv,uv_pars_fragment:Dv,uv_pars_vertex:Uv,uv_vertex:Fv,worldpos_vertex:Ov,background_vert:kv,background_frag:Bv,backgroundCube_vert:zv,backgroundCube_frag:Vv,cube_vert:Gv,cube_frag:Hv,depth_vert:Wv,depth_frag:Xv,distance_vert:qv,distance_frag:$v,equirect_vert:Yv,equirect_frag:Kv,linedashed_vert:Zv,linedashed_frag:Jv,meshbasic_vert:jv,meshbasic_frag:Qv,meshlambert_vert:ex,meshlambert_frag:tx,meshmatcap_vert:nx,meshmatcap_frag:ix,meshnormal_vert:sx,meshnormal_frag:rx,meshphong_vert:ax,meshphong_frag:ox,meshphysical_vert:lx,meshphysical_frag:cx,meshtoon_vert:dx,meshtoon_frag:ux,points_vert:hx,points_frag:fx,shadow_vert:px,shadow_frag:mx,sprite_vert:gx,sprite_frag:_x},me={common:{diffuse:{value:new ke(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Be},alphaMap:{value:null},alphaMapTransform:{value:new Be},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Be}},envmap:{envMap:{value:null},envMapRotation:{value:new Be},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Be}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Be}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Be},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Be},normalScale:{value:new Ne(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Be},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Be}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Be}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Be}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new ke(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new I},probesMax:{value:new I},probesResolution:{value:new I}},points:{diffuse:{value:new ke(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Be},alphaTest:{value:0},uvTransform:{value:new Be}},sprite:{diffuse:{value:new ke(16777215)},opacity:{value:1},center:{value:new Ne(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Be},alphaMap:{value:null},alphaMapTransform:{value:new Be},alphaTest:{value:0}}},Bn={basic:{uniforms:Zt([me.common,me.specularmap,me.envmap,me.aomap,me.lightmap,me.fog]),vertexShader:Ge.meshbasic_vert,fragmentShader:Ge.meshbasic_frag},lambert:{uniforms:Zt([me.common,me.specularmap,me.envmap,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.fog,me.lights,{emissive:{value:new ke(0)},envMapIntensity:{value:1}}]),vertexShader:Ge.meshlambert_vert,fragmentShader:Ge.meshlambert_frag},phong:{uniforms:Zt([me.common,me.specularmap,me.envmap,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.fog,me.lights,{emissive:{value:new ke(0)},specular:{value:new ke(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Ge.meshphong_vert,fragmentShader:Ge.meshphong_frag},standard:{uniforms:Zt([me.common,me.envmap,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.roughnessmap,me.metalnessmap,me.fog,me.lights,{emissive:{value:new ke(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ge.meshphysical_vert,fragmentShader:Ge.meshphysical_frag},toon:{uniforms:Zt([me.common,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.gradientmap,me.fog,me.lights,{emissive:{value:new ke(0)}}]),vertexShader:Ge.meshtoon_vert,fragmentShader:Ge.meshtoon_frag},matcap:{uniforms:Zt([me.common,me.bumpmap,me.normalmap,me.displacementmap,me.fog,{matcap:{value:null}}]),vertexShader:Ge.meshmatcap_vert,fragmentShader:Ge.meshmatcap_frag},points:{uniforms:Zt([me.points,me.fog]),vertexShader:Ge.points_vert,fragmentShader:Ge.points_frag},dashed:{uniforms:Zt([me.common,me.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ge.linedashed_vert,fragmentShader:Ge.linedashed_frag},depth:{uniforms:Zt([me.common,me.displacementmap]),vertexShader:Ge.depth_vert,fragmentShader:Ge.depth_frag},normal:{uniforms:Zt([me.common,me.bumpmap,me.normalmap,me.displacementmap,{opacity:{value:1}}]),vertexShader:Ge.meshnormal_vert,fragmentShader:Ge.meshnormal_frag},sprite:{uniforms:Zt([me.sprite,me.fog]),vertexShader:Ge.sprite_vert,fragmentShader:Ge.sprite_frag},background:{uniforms:{uvTransform:{value:new Be},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ge.background_vert,fragmentShader:Ge.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Be}},vertexShader:Ge.backgroundCube_vert,fragmentShader:Ge.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ge.cube_vert,fragmentShader:Ge.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ge.equirect_vert,fragmentShader:Ge.equirect_frag},distance:{uniforms:Zt([me.common,me.displacementmap,{referencePosition:{value:new I},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ge.distance_vert,fragmentShader:Ge.distance_frag},shadow:{uniforms:Zt([me.lights,me.fog,{color:{value:new ke(0)},opacity:{value:1}}]),vertexShader:Ge.shadow_vert,fragmentShader:Ge.shadow_frag}};Bn.physical={uniforms:Zt([Bn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Be},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Be},clearcoatNormalScale:{value:new Ne(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Be},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Be},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Be},sheen:{value:0},sheenColor:{value:new ke(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Be},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Be},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Be},transmissionSamplerSize:{value:new Ne},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Be},attenuationDistance:{value:0},attenuationColor:{value:new ke(0)},specularColor:{value:new ke(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Be},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Be},anisotropyVector:{value:new Ne},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Be}}]),vertexShader:Ge.meshphysical_vert,fragmentShader:Ge.meshphysical_frag};const za={r:0,b:0,g:0},vx=new Oe,tp=new Be;tp.set(-1,0,0,0,1,0,0,0,1);function xx(i,e,t,n,s,r){const a=new ke(0);let o=s===!0?0:1,l,c,u=null,h=0,d=null;function f(S){let A=S.isScene===!0?S.background:null;if(A&&A.isTexture){const b=S.backgroundBlurriness>0;A=e.get(A,b)}return A}function g(S){let A=!1;const b=f(S);b===null?m(a,o):b&&b.isColor&&(m(b,1),A=!0);const T=i.xr.getEnvironmentBlendMode();T==="additive"?t.buffers.color.setClear(0,0,0,1,r):T==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(i.autoClear||A)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function v(S,A){const b=f(A);b&&(b.isCubeTexture||b.mapping===Vo)?(c===void 0&&(c=new gt(new As(1,1,1),new Kn({name:"BackgroundCubeMaterial",uniforms:dr(Bn.backgroundCube.uniforms),vertexShader:Bn.backgroundCube.vertexShader,fragmentShader:Bn.backgroundCube.fragmentShader,side:nn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(T,M,w){this.matrixWorld.copyPosition(w.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=b,c.material.uniforms.backgroundBlurriness.value=A.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(vx.makeRotationFromEuler(A.backgroundRotation)).transpose(),b.isCubeTexture&&b.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(tp),c.material.toneMapped=Xe.getTransfer(b.colorSpace)!==tt,(u!==b||h!==b.version||d!==i.toneMapping)&&(c.material.needsUpdate=!0,u=b,h=b.version,d=i.toneMapping),c.layers.enableAll(),S.unshift(c,c.geometry,c.material,0,0,null)):b&&b.isTexture&&(l===void 0&&(l=new gt(new Go(2,2),new Kn({name:"BackgroundMaterial",uniforms:dr(Bn.background.uniforms),vertexShader:Bn.background.vertexShader,fragmentShader:Bn.background.fragmentShader,side:mi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=b,l.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,l.material.toneMapped=Xe.getTransfer(b.colorSpace)!==tt,b.matrixAutoUpdate===!0&&b.updateMatrix(),l.material.uniforms.uvTransform.value.copy(b.matrix),(u!==b||h!==b.version||d!==i.toneMapping)&&(l.material.needsUpdate=!0,u=b,h=b.version,d=i.toneMapping),l.layers.enableAll(),S.unshift(l,l.geometry,l.material,0,0,null))}function m(S,A){S.getRGB(za,$f(i)),t.buffers.color.setClear(za.r,za.g,za.b,A,r)}function p(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(S,A=1){a.set(S),o=A,m(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(S){o=S,m(a,o)},render:g,addToRenderList:v,dispose:p}}function bx(i,e){const t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=d(null);let r=s,a=!1;function o(R,L,z,X,O){let N=!1;const V=h(R,X,z,L);r!==V&&(r=V,c(r.object)),N=f(R,X,z,O),N&&g(R,X,z,O),O!==null&&e.update(O,i.ELEMENT_ARRAY_BUFFER),(N||a)&&(a=!1,b(R,L,z,X),O!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(O).buffer))}function l(){return i.createVertexArray()}function c(R){return i.bindVertexArray(R)}function u(R){return i.deleteVertexArray(R)}function h(R,L,z,X){const O=X.wireframe===!0;let N=n[L.id];N===void 0&&(N={},n[L.id]=N);const V=R.isInstancedMesh===!0?R.id:0;let $=N[V];$===void 0&&($={},N[V]=$);let j=$[z.id];j===void 0&&(j={},$[z.id]=j);let re=j[O];return re===void 0&&(re=d(l()),j[O]=re),re}function d(R){const L=[],z=[],X=[];for(let O=0;O<t;O++)L[O]=0,z[O]=0,X[O]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:L,enabledAttributes:z,attributeDivisors:X,object:R,attributes:{},index:null}}function f(R,L,z,X){const O=r.attributes,N=L.attributes;let V=0;const $=z.getAttributes();for(const j in $)if($[j].location>=0){const se=O[j];let ae=N[j];if(ae===void 0&&(j==="instanceMatrix"&&R.instanceMatrix&&(ae=R.instanceMatrix),j==="instanceColor"&&R.instanceColor&&(ae=R.instanceColor)),se===void 0||se.attribute!==ae||ae&&se.data!==ae.data)return!0;V++}return r.attributesNum!==V||r.index!==X}function g(R,L,z,X){const O={},N=L.attributes;let V=0;const $=z.getAttributes();for(const j in $)if($[j].location>=0){let se=N[j];se===void 0&&(j==="instanceMatrix"&&R.instanceMatrix&&(se=R.instanceMatrix),j==="instanceColor"&&R.instanceColor&&(se=R.instanceColor));const ae={};ae.attribute=se,se&&se.data&&(ae.data=se.data),O[j]=ae,V++}r.attributes=O,r.attributesNum=V,r.index=X}function v(){const R=r.newAttributes;for(let L=0,z=R.length;L<z;L++)R[L]=0}function m(R){p(R,0)}function p(R,L){const z=r.newAttributes,X=r.enabledAttributes,O=r.attributeDivisors;z[R]=1,X[R]===0&&(i.enableVertexAttribArray(R),X[R]=1),O[R]!==L&&(i.vertexAttribDivisor(R,L),O[R]=L)}function S(){const R=r.newAttributes,L=r.enabledAttributes;for(let z=0,X=L.length;z<X;z++)L[z]!==R[z]&&(i.disableVertexAttribArray(z),L[z]=0)}function A(R,L,z,X,O,N,V){V===!0?i.vertexAttribIPointer(R,L,z,O,N):i.vertexAttribPointer(R,L,z,X,O,N)}function b(R,L,z,X){v();const O=X.attributes,N=z.getAttributes(),V=L.defaultAttributeValues;for(const $ in N){const j=N[$];if(j.location>=0){let re=O[$];if(re===void 0&&($==="instanceMatrix"&&R.instanceMatrix&&(re=R.instanceMatrix),$==="instanceColor"&&R.instanceColor&&(re=R.instanceColor)),re!==void 0){const se=re.normalized,ae=re.itemSize,xe=e.get(re);if(xe===void 0)continue;const be=xe.buffer,le=xe.type,k=xe.bytesPerElement,J=le===i.INT||le===i.UNSIGNED_INT||re.gpuType===sd;if(re.isInterleavedBufferAttribute){const te=re.data,Ae=te.stride,Fe=re.offset;if(te.isInstancedInterleavedBuffer){for(let Ie=0;Ie<j.locationSize;Ie++)p(j.location+Ie,te.meshPerAttribute);R.isInstancedMesh!==!0&&X._maxInstanceCount===void 0&&(X._maxInstanceCount=te.meshPerAttribute*te.count)}else for(let Ie=0;Ie<j.locationSize;Ie++)m(j.location+Ie);i.bindBuffer(i.ARRAY_BUFFER,be);for(let Ie=0;Ie<j.locationSize;Ie++)A(j.location+Ie,ae/j.locationSize,le,se,Ae*k,(Fe+ae/j.locationSize*Ie)*k,J)}else{if(re.isInstancedBufferAttribute){for(let te=0;te<j.locationSize;te++)p(j.location+te,re.meshPerAttribute);R.isInstancedMesh!==!0&&X._maxInstanceCount===void 0&&(X._maxInstanceCount=re.meshPerAttribute*re.count)}else for(let te=0;te<j.locationSize;te++)m(j.location+te);i.bindBuffer(i.ARRAY_BUFFER,be);for(let te=0;te<j.locationSize;te++)A(j.location+te,ae/j.locationSize,le,se,ae*k,ae/j.locationSize*te*k,J)}}else if(V!==void 0){const se=V[$];if(se!==void 0)switch(se.length){case 2:i.vertexAttrib2fv(j.location,se);break;case 3:i.vertexAttrib3fv(j.location,se);break;case 4:i.vertexAttrib4fv(j.location,se);break;default:i.vertexAttrib1fv(j.location,se)}}}}S()}function T(){y();for(const R in n){const L=n[R];for(const z in L){const X=L[z];for(const O in X){const N=X[O];for(const V in N)u(N[V].object),delete N[V];delete X[O]}}delete n[R]}}function M(R){if(n[R.id]===void 0)return;const L=n[R.id];for(const z in L){const X=L[z];for(const O in X){const N=X[O];for(const V in N)u(N[V].object),delete N[V];delete X[O]}}delete n[R.id]}function w(R){for(const L in n){const z=n[L];for(const X in z){const O=z[X];if(O[R.id]===void 0)continue;const N=O[R.id];for(const V in N)u(N[V].object),delete N[V];delete O[R.id]}}}function _(R){for(const L in n){const z=n[L],X=R.isInstancedMesh===!0?R.id:0,O=z[X];if(O!==void 0){for(const N in O){const V=O[N];for(const $ in V)u(V[$].object),delete V[$];delete O[N]}delete z[X],Object.keys(z).length===0&&delete n[L]}}}function y(){P(),a=!0,r!==s&&(r=s,c(r.object))}function P(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:y,resetDefaultState:P,dispose:T,releaseStatesOfGeometry:M,releaseStatesOfObject:_,releaseStatesOfProgram:w,initAttributes:v,enableAttribute:m,disableUnusedAttributes:S}}function yx(i,e,t){let n;function s(l){n=l}function r(l,c){i.drawArrays(n,l,c),t.update(c,n,1)}function a(l,c,u){u!==0&&(i.drawArraysInstanced(n,l,c,u),t.update(c,n,u))}function o(l,c,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,u);let d=0;for(let f=0;f<u;f++)d+=c[f];t.update(d,n,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function Mx(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){const w=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(w.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(w){return!(w!==vn&&n.convert(w)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(w){const _=w===gi&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(w!==cn&&n.convert(w)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&w!==Cn&&!_)}function l(w){if(w==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";w="mediump"}return w==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const u=l(c);u!==c&&(Pe("WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);const h=t.logarithmicDepthBuffer===!0,d=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&d===!1&&Pe("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");const f=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),p=i.getParameter(i.MAX_VERTEX_ATTRIBS),S=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),A=i.getParameter(i.MAX_VARYING_VECTORS),b=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),T=i.getParameter(i.MAX_SAMPLES),M=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:h,reversedDepthBuffer:d,maxTextures:f,maxVertexTextures:g,maxTextureSize:v,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:S,maxVaryings:A,maxFragmentUniforms:b,maxSamples:T,samples:M}}function Sx(i){const e=this;let t=null,n=0,s=!1,r=!1;const a=new Pi,o=new Be,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,d){const f=h.length!==0||d||n!==0||s;return s=d,n=h.length,f},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(h,d){t=u(h,d,0)},this.setState=function(h,d,f){const g=h.clippingPlanes,v=h.clipIntersection,m=h.clipShadows,p=i.get(h);if(!s||g===null||g.length===0||r&&!m)r?u(null):c();else{const S=r?0:n,A=S*4;let b=p.clippingState||null;l.value=b,b=u(g,d,A,f);for(let T=0;T!==A;++T)b[T]=t[T];p.clippingState=b,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=S}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function u(h,d,f,g){const v=h!==null?h.length:0;let m=null;if(v!==0){if(m=l.value,g!==!0||m===null){const p=f+v*4,S=d.matrixWorldInverse;o.getNormalMatrix(S),(m===null||m.length<p)&&(m=new Float32Array(p));for(let A=0,b=f;A!==v;++A,b+=4)a.copy(h[A]).applyMatrix4(S,o),a.normal.toArray(m,b),m[b+3]=a.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=v,e.numIntersection=0,m}}const Oi=4,fh=[.125,.215,.35,.446,.526,.582],ls=20,Ex=256,Mr=new Wo,ph=new ke;let Ll=null,Nl=0,Il=0,Dl=!1;const Tx=new I;class mh{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,s=100,r={}){const{size:a=256,position:o=Tx}=r;Ll=this._renderer.getRenderTarget(),Nl=this._renderer.getActiveCubeFace(),Il=this._renderer.getActiveMipmapLevel(),Dl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);const l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,n,s,l,o),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=vh(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=_h(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(Ll,Nl,Il),this._renderer.xr.enabled=Dl,e.scissorTest=!1,qs(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===xs||e.mapping===ar?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Ll=this._renderer.getRenderTarget(),Nl=this._renderer.getActiveCubeFace(),Il=this._renderer.getActiveMipmapLevel(),Dl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Pt,minFilter:Pt,generateMipmaps:!1,type:gi,format:vn,colorSpace:go,depthBuffer:!1},s=gh(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=gh(e,t,n);const{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=Ax(r)),this._blurMaterial=Rx(r,e,t),this._ggxMaterial=wx(r,e,t)}return s}_compileMaterial(e){const t=new gt(new Vt,e);this._renderer.compile(t,Mr)}_sceneToCubeUV(e,t,n,s,r){const l=new Xt(90,1,t,n),c=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],h=this._renderer,d=h.autoClear,f=h.toneMapping;h.getClearColor(ph),h.toneMapping=qn,h.autoClear=!1,h.state.buffers.depth.getReversed()&&(h.setRenderTarget(s),h.clearDepth(),h.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new gt(new As,new Xr({name:"PMREM.Background",side:nn,depthWrite:!1,depthTest:!1})));const v=this._backgroundBox,m=v.material;let p=!1;const S=e.background;S?S.isColor&&(m.color.copy(S),e.background=null,p=!0):(m.color.copy(ph),p=!0);for(let A=0;A<6;A++){const b=A%3;b===0?(l.up.set(0,c[A],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+u[A],r.y,r.z)):b===1?(l.up.set(0,0,c[A]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+u[A],r.z)):(l.up.set(0,c[A],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+u[A]));const T=this._cubeSize;qs(s,b*T,A>2?T:0,T,T),h.setRenderTarget(s),p&&h.render(v,l),h.render(e,l)}h.toneMapping=f,h.autoClear=d,e.background=S}_textureToCubeUV(e,t){const n=this._renderer,s=e.mapping===xs||e.mapping===ar;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=vh()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=_h());const r=s?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;const o=r.uniforms;o.envMap.value=e;const l=this._cubeSize;qs(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(a,Mr)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;const s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=n}_applyGGXFilter(e,t,n){const s=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;const l=a.uniforms,c=n/(this._lodMeshes.length-1),u=t/(this._lodMeshes.length-1),h=Math.sqrt(c*c-u*u),d=0+c*1.25,f=h*d,{_lodMax:g}=this,v=this._sizeLods[n],m=3*v*(n>g-Oi?n-g+Oi:0),p=4*(this._cubeSize-v);l.envMap.value=e.texture,l.roughness.value=f,l.mipInt.value=g-t,qs(r,m,p,3*v,2*v),s.setRenderTarget(r),s.render(o,Mr),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=g-n,qs(e,m,p,3*v,2*v),s.setRenderTarget(e),s.render(o,Mr)}_blur(e,t,n,s,r){const a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,s,"latitudinal",r),this._halfBlur(a,e,n,n,s,"longitudinal",r)}_halfBlur(e,t,n,s,r,a,o){const l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&He("blur direction must be either latitudinal or longitudinal!");const u=3,h=this._lodMeshes[s];h.material=c;const d=c.uniforms,f=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*f):2*Math.PI/(2*ls-1),v=r/g,m=isFinite(r)?1+Math.floor(u*v):ls;m>ls&&Pe(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${ls}`);const p=[];let S=0;for(let w=0;w<ls;++w){const _=w/v,y=Math.exp(-_*_/2);p.push(y),w===0?S+=y:w<m&&(S+=2*y)}for(let w=0;w<p.length;w++)p[w]=p[w]/S;d.envMap.value=e.texture,d.samples.value=m,d.weights.value=p,d.latitudinal.value=a==="latitudinal",o&&(d.poleAxis.value=o);const{_lodMax:A}=this;d.dTheta.value=g,d.mipInt.value=A-n;const b=this._sizeLods[s],T=3*b*(s>A-Oi?s-A+Oi:0),M=4*(this._cubeSize-b);qs(t,T,M,3*b,2*b),l.setRenderTarget(t),l.render(h,Mr)}}function Ax(i){const e=[],t=[],n=[];let s=i;const r=i-Oi+1+fh.length;for(let a=0;a<r;a++){const o=Math.pow(2,s);e.push(o);let l=1/o;a>i-Oi?l=fh[a-i+Oi-1]:a===0&&(l=0),t.push(l);const c=1/(o-2),u=-c,h=1+c,d=[u,u,h,u,h,h,u,u,h,h,u,h],f=6,g=6,v=3,m=2,p=1,S=new Float32Array(v*g*f),A=new Float32Array(m*g*f),b=new Float32Array(p*g*f);for(let M=0;M<f;M++){const w=M%3*2/3-1,_=M>2?0:-1,y=[w,_,0,w+2/3,_,0,w+2/3,_+1,0,w,_,0,w+2/3,_+1,0,w,_+1,0];S.set(y,v*g*M),A.set(d,m*g*M);const P=[M,M,M,M,M,M];b.set(P,p*g*M)}const T=new Vt;T.setAttribute("position",new un(S,v)),T.setAttribute("uv",new un(A,m)),T.setAttribute("faceIndex",new un(b,p)),n.push(new gt(T,null)),s>Oi&&s--}return{lodMeshes:n,sizeLods:e,sigmas:t}}function gh(i,e,t){const n=new $n(i,e,t);return n.texture.mapping=Vo,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function qs(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function wx(i,e,t){return new Kn({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:Ex,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Xo(),fragmentShader:`

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
		`,blending:di,depthTest:!1,depthWrite:!1})}function Rx(i,e,t){const n=new Float32Array(ls),s=new I(0,1,0);return new Kn({name:"SphericalGaussianBlur",defines:{n:ls,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:Xo(),fragmentShader:`

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
		`,blending:di,depthTest:!1,depthWrite:!1})}function _h(){return new Kn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Xo(),fragmentShader:`

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
		`,blending:di,depthTest:!1,depthWrite:!1})}function vh(){return new Kn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Xo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:di,depthTest:!1,depthWrite:!1})}function Xo(){return`

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
	`}class np extends $n{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new Vf(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new As(5,5,5),r=new Kn({name:"CubemapFromEquirect",uniforms:dr(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:nn,blending:di});r.uniforms.tEquirect.value=t;const a=new gt(s,r),o=t.minFilter;return t.minFilter===oi&&(t.minFilter=Pt),new P_(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){const r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,s);e.setRenderTarget(r)}}function Cx(i){let e=new WeakMap,t=new WeakMap,n=null;function s(d,f=!1){return d==null?null:f?a(d):r(d)}function r(d){if(d&&d.isTexture){const f=d.mapping;if(f===tl||f===nl)if(e.has(d)){const g=e.get(d).texture;return o(g,d.mapping)}else{const g=d.image;if(g&&g.height>0){const v=new np(g.height);return v.fromEquirectangularTexture(i,d),e.set(d,v),d.addEventListener("dispose",c),o(v.texture,d.mapping)}else return null}}return d}function a(d){if(d&&d.isTexture){const f=d.mapping,g=f===tl||f===nl,v=f===xs||f===ar;if(g||v){let m=t.get(d);const p=m!==void 0?m.texture.pmremVersion:0;if(d.isRenderTargetTexture&&d.pmremVersion!==p)return n===null&&(n=new mh(i)),m=g?n.fromEquirectangular(d,m):n.fromCubemap(d,m),m.texture.pmremVersion=d.pmremVersion,t.set(d,m),m.texture;if(m!==void 0)return m.texture;{const S=d.image;return g&&S&&S.height>0||v&&S&&l(S)?(n===null&&(n=new mh(i)),m=g?n.fromEquirectangular(d):n.fromCubemap(d),m.texture.pmremVersion=d.pmremVersion,t.set(d,m),d.addEventListener("dispose",u),m.texture):null}}}return d}function o(d,f){return f===tl?d.mapping=xs:f===nl&&(d.mapping=ar),d}function l(d){let f=0;const g=6;for(let v=0;v<g;v++)d[v]!==void 0&&f++;return f===g}function c(d){const f=d.target;f.removeEventListener("dispose",c);const g=e.get(f);g!==void 0&&(e.delete(f),g.dispose())}function u(d){const f=d.target;f.removeEventListener("dispose",u);const g=t.get(f);g!==void 0&&(t.delete(f),g.dispose())}function h(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:h}}function Px(i){const e={};function t(n){if(e[n]!==void 0)return e[n];const s=i.getExtension(n);return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const s=t(n);return s===null&&tr("WebGLRenderer: "+n+" extension not supported."),s}}}function Lx(i,e,t,n){const s={},r=new WeakMap;function a(h){const d=h.target;d.index!==null&&e.remove(d.index);for(const g in d.attributes)e.remove(d.attributes[g]);d.removeEventListener("dispose",a),delete s[d.id];const f=r.get(d);f&&(e.remove(f),r.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function o(h,d){return s[d.id]===!0||(d.addEventListener("dispose",a),s[d.id]=!0,t.memory.geometries++),d}function l(h){const d=h.attributes;for(const f in d)e.update(d[f],i.ARRAY_BUFFER)}function c(h){const d=[],f=h.index,g=h.attributes.position;let v=0;if(g===void 0)return;if(f!==null){const S=f.array;v=f.version;for(let A=0,b=S.length;A<b;A+=3){const T=S[A+0],M=S[A+1],w=S[A+2];d.push(T,M,M,w,w,T)}}else{const S=g.array;v=g.version;for(let A=0,b=S.length/3-1;A<b;A+=3){const T=A+0,M=A+1,w=A+2;d.push(T,M,M,w,w,T)}}const m=new(g.count>=65535?kf:Of)(d,1);m.version=v;const p=r.get(h);p&&e.remove(p),r.set(h,m)}function u(h){const d=r.get(h);if(d){const f=h.index;f!==null&&d.version<f.version&&c(h)}else c(h);return r.get(h)}return{get:o,update:l,getWireframeAttribute:u}}function Nx(i,e,t){let n;function s(h){n=h}let r,a;function o(h){r=h.type,a=h.bytesPerElement}function l(h,d){i.drawElements(n,d,r,h*a),t.update(d,n,1)}function c(h,d,f){f!==0&&(i.drawElementsInstanced(n,d,r,h*a,f),t.update(d,n,f))}function u(h,d,f){if(f===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,d,0,r,h,0,f);let v=0;for(let m=0;m<f;m++)v+=d[m];t.update(v,n,1)}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=u}function Ix(i){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(t.calls++,a){case i.TRIANGLES:t.triangles+=o*(r/3);break;case i.LINES:t.lines+=o*(r/2);break;case i.LINE_STRIP:t.lines+=o*(r-1);break;case i.LINE_LOOP:t.lines+=o*r;break;case i.POINTS:t.points+=o*r;break;default:He("WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function Dx(i,e,t){const n=new WeakMap,s=new st;function r(a,o,l){const c=a.morphTargetInfluences,u=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,h=u!==void 0?u.length:0;let d=n.get(o);if(d===void 0||d.count!==h){let y=function(){w.dispose(),n.delete(o),o.removeEventListener("dispose",y)};d!==void 0&&d.texture.dispose();const f=o.morphAttributes.position!==void 0,g=o.morphAttributes.normal!==void 0,v=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],p=o.morphAttributes.normal||[],S=o.morphAttributes.color||[];let A=0;f===!0&&(A=1),g===!0&&(A=2),v===!0&&(A=3);let b=o.attributes.position.count*A,T=1;b>e.maxTextureSize&&(T=Math.ceil(b/e.maxTextureSize),b=e.maxTextureSize);const M=new Float32Array(b*T*4*h),w=new Df(M,b,T,h);w.type=Cn,w.needsUpdate=!0;const _=A*4;for(let P=0;P<h;P++){const R=m[P],L=p[P],z=S[P],X=b*T*4*P;for(let O=0;O<R.count;O++){const N=O*_;f===!0&&(s.fromBufferAttribute(R,O),M[X+N+0]=s.x,M[X+N+1]=s.y,M[X+N+2]=s.z,M[X+N+3]=0),g===!0&&(s.fromBufferAttribute(L,O),M[X+N+4]=s.x,M[X+N+5]=s.y,M[X+N+6]=s.z,M[X+N+7]=0),v===!0&&(s.fromBufferAttribute(z,O),M[X+N+8]=s.x,M[X+N+9]=s.y,M[X+N+10]=s.z,M[X+N+11]=z.itemSize===4?s.w:1)}}d={count:h,texture:w,size:new Ne(b,T)},n.set(o,d),o.addEventListener("dispose",y)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,t);else{let f=0;for(let v=0;v<c.length;v++)f+=c[v];const g=o.morphTargetsRelative?1:1-f;l.getUniforms().setValue(i,"morphTargetBaseInfluence",g),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",d.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",d.size)}return{update:r}}function Ux(i,e,t,n,s){let r=new WeakMap;function a(c){const u=s.render.frame,h=c.geometry,d=e.get(c,h);if(r.get(d)!==u&&(e.update(d),r.set(d,u)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==u&&(t.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,i.ARRAY_BUFFER),r.set(c,u))),c.isSkinnedMesh){const f=c.skeleton;r.get(f)!==u&&(f.update(),r.set(f,u))}return d}function o(){r=new WeakMap}function l(c){const u=c.target;u.removeEventListener("dispose",l),n.releaseStatesOfObject(u),t.remove(u.instanceMatrix),u.instanceColor!==null&&t.remove(u.instanceColor)}return{update:a,dispose:o}}const Fx={[vf]:"LINEAR_TONE_MAPPING",[xf]:"REINHARD_TONE_MAPPING",[bf]:"CINEON_TONE_MAPPING",[yf]:"ACES_FILMIC_TONE_MAPPING",[Sf]:"AGX_TONE_MAPPING",[Ef]:"NEUTRAL_TONE_MAPPING",[Mf]:"CUSTOM_TONE_MAPPING"};function Ox(i,e,t,n,s,r){const a=new $n(e,t,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,depthTexture:s?new lr(e,t):void 0}),o=new $n(e,t,{type:gi,depthBuffer:!1,stencilBuffer:!1}),l=new Vt;l.setAttribute("position",new Qe([-1,3,0,-1,-1,0,3,-1,0],3)),l.setAttribute("uv",new Qe([0,2,0,0,2,0],2));const c=new a_({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),u=new gt(l,c),h=new Wo(-1,1,1,-1,0,1);let d=null,f=null,g=!1,v,m=null,p=[],S=!1;this.setSize=function(A,b){a.setSize(A,b),o.setSize(A,b);for(let T=0;T<p.length;T++){const M=p[T];M.setSize&&M.setSize(A,b)}},this.setEffects=function(A){p=A,S=p.length>0&&p[0].isRenderPass===!0;const b=a.width,T=a.height;for(let M=0;M<p.length;M++){const w=p[M];w.setSize&&w.setSize(b,T)}},this.begin=function(A,b){if(g||A.toneMapping===qn&&p.length===0)return!1;if(m=b,b!==null){const T=b.width,M=b.height;(a.width!==T||a.height!==M)&&this.setSize(T,M)}return S===!1&&A.setRenderTarget(a),v=A.toneMapping,A.toneMapping=qn,!0},this.hasRenderPass=function(){return S},this.end=function(A,b){A.toneMapping=v,g=!0;let T=a,M=o;for(let w=0;w<p.length;w++){const _=p[w];if(_.enabled!==!1&&(_.render(A,M,T,b),_.needsSwap!==!1)){const y=T;T=M,M=y}}if(d!==A.outputColorSpace||f!==A.toneMapping){d=A.outputColorSpace,f=A.toneMapping,c.defines={},Xe.getTransfer(d)===tt&&(c.defines.SRGB_TRANSFER="");const w=Fx[f];w&&(c.defines[w]=""),c.needsUpdate=!0}c.uniforms.tDiffuse.value=T.texture,A.setRenderTarget(m),A.render(u,h),m=null,g=!1},this.isCompositing=function(){return g},this.dispose=function(){a.depthTexture&&a.depthTexture.dispose(),a.dispose(),o.dispose(),l.dispose(),c.dispose()}}const ip=new $t,Xc=new lr(1,1),sp=new Df,rp=new vg,ap=new Vf,xh=[],bh=[],yh=new Float32Array(16),Mh=new Float32Array(9),Sh=new Float32Array(4);function mr(i,e,t){const n=i[0];if(n<=0||n>0)return i;const s=e*t;let r=xh[s];if(r===void 0&&(r=new Float32Array(s),xh[s]=r),e!==0){n.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,i[a].toArray(r,o)}return r}function Lt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function Nt(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function qo(i,e){let t=bh[e];t===void 0&&(t=new Int32Array(e),bh[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function kx(i,e){const t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function Bx(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Lt(t,e))return;i.uniform2fv(this.addr,e),Nt(t,e)}}function zx(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Lt(t,e))return;i.uniform3fv(this.addr,e),Nt(t,e)}}function Vx(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Lt(t,e))return;i.uniform4fv(this.addr,e),Nt(t,e)}}function Gx(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Lt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),Nt(t,e)}else{if(Lt(t,n))return;Sh.set(n),i.uniformMatrix2fv(this.addr,!1,Sh),Nt(t,n)}}function Hx(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Lt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),Nt(t,e)}else{if(Lt(t,n))return;Mh.set(n),i.uniformMatrix3fv(this.addr,!1,Mh),Nt(t,n)}}function Wx(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Lt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),Nt(t,e)}else{if(Lt(t,n))return;yh.set(n),i.uniformMatrix4fv(this.addr,!1,yh),Nt(t,n)}}function Xx(i,e){const t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function qx(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Lt(t,e))return;i.uniform2iv(this.addr,e),Nt(t,e)}}function $x(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Lt(t,e))return;i.uniform3iv(this.addr,e),Nt(t,e)}}function Yx(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Lt(t,e))return;i.uniform4iv(this.addr,e),Nt(t,e)}}function Kx(i,e){const t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function Zx(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Lt(t,e))return;i.uniform2uiv(this.addr,e),Nt(t,e)}}function Jx(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Lt(t,e))return;i.uniform3uiv(this.addr,e),Nt(t,e)}}function jx(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Lt(t,e))return;i.uniform4uiv(this.addr,e),Nt(t,e)}}function Qx(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(Xc.compareFunction=t.isReversedDepthBuffer()?ud:dd,r=Xc):r=ip,t.setTexture2D(e||r,s)}function eb(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||rp,s)}function tb(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||ap,s)}function nb(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||sp,s)}function ib(i){switch(i){case 5126:return kx;case 35664:return Bx;case 35665:return zx;case 35666:return Vx;case 35674:return Gx;case 35675:return Hx;case 35676:return Wx;case 5124:case 35670:return Xx;case 35667:case 35671:return qx;case 35668:case 35672:return $x;case 35669:case 35673:return Yx;case 5125:return Kx;case 36294:return Zx;case 36295:return Jx;case 36296:return jx;case 35678:case 36198:case 36298:case 36306:case 35682:return Qx;case 35679:case 36299:case 36307:return eb;case 35680:case 36300:case 36308:case 36293:return tb;case 36289:case 36303:case 36311:case 36292:return nb}}function sb(i,e){i.uniform1fv(this.addr,e)}function rb(i,e){const t=mr(e,this.size,2);i.uniform2fv(this.addr,t)}function ab(i,e){const t=mr(e,this.size,3);i.uniform3fv(this.addr,t)}function ob(i,e){const t=mr(e,this.size,4);i.uniform4fv(this.addr,t)}function lb(i,e){const t=mr(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function cb(i,e){const t=mr(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function db(i,e){const t=mr(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function ub(i,e){i.uniform1iv(this.addr,e)}function hb(i,e){i.uniform2iv(this.addr,e)}function fb(i,e){i.uniform3iv(this.addr,e)}function pb(i,e){i.uniform4iv(this.addr,e)}function mb(i,e){i.uniform1uiv(this.addr,e)}function gb(i,e){i.uniform2uiv(this.addr,e)}function _b(i,e){i.uniform3uiv(this.addr,e)}function vb(i,e){i.uniform4uiv(this.addr,e)}function xb(i,e,t){const n=this.cache,s=e.length,r=qo(t,s);Lt(n,r)||(i.uniform1iv(this.addr,r),Nt(n,r));let a;this.type===i.SAMPLER_2D_SHADOW?a=Xc:a=ip;for(let o=0;o!==s;++o)t.setTexture2D(e[o]||a,r[o])}function bb(i,e,t){const n=this.cache,s=e.length,r=qo(t,s);Lt(n,r)||(i.uniform1iv(this.addr,r),Nt(n,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||rp,r[a])}function yb(i,e,t){const n=this.cache,s=e.length,r=qo(t,s);Lt(n,r)||(i.uniform1iv(this.addr,r),Nt(n,r));for(let a=0;a!==s;++a)t.setTextureCube(e[a]||ap,r[a])}function Mb(i,e,t){const n=this.cache,s=e.length,r=qo(t,s);Lt(n,r)||(i.uniform1iv(this.addr,r),Nt(n,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||sp,r[a])}function Sb(i){switch(i){case 5126:return sb;case 35664:return rb;case 35665:return ab;case 35666:return ob;case 35674:return lb;case 35675:return cb;case 35676:return db;case 5124:case 35670:return ub;case 35667:case 35671:return hb;case 35668:case 35672:return fb;case 35669:case 35673:return pb;case 5125:return mb;case 36294:return gb;case 36295:return _b;case 36296:return vb;case 35678:case 36198:case 36298:case 36306:case 35682:return xb;case 35679:case 36299:case 36307:return bb;case 35680:case 36300:case 36308:case 36293:return yb;case 36289:case 36303:case 36311:case 36292:return Mb}}class Eb{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=ib(t.type)}}class Tb{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Sb(t.type)}}class Ab{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const s=this.seq;for(let r=0,a=s.length;r!==a;++r){const o=s[r];o.setValue(e,t[o.id],n)}}}const Ul=/(\w+)(\])?(\[|\.)?/g;function Eh(i,e){i.seq.push(e),i.map[e.id]=e}function wb(i,e,t){const n=i.name,s=n.length;for(Ul.lastIndex=0;;){const r=Ul.exec(n),a=Ul.lastIndex;let o=r[1];const l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){Eh(t,c===void 0?new Eb(o,i,e):new Tb(o,i,e));break}else{let h=t.map[o];h===void 0&&(h=new Ab(o),Eh(t,h)),t=h}}}class so{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<n;++a){const o=e.getActiveUniform(t,a),l=e.getUniformLocation(t,o.name);wb(o,l,this)}const s=[],r=[];for(const a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,n,s){const r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){const s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,a=t.length;r!==a;++r){const o=t[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,s)}}static seqWithValue(e,t){const n=[];for(let s=0,r=e.length;s!==r;++s){const a=e[s];a.id in t&&n.push(a)}return n}}function Th(i,e,t){const n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}const Rb=37297;let Cb=0;function Pb(i,e){const t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){const o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}const Ah=new Be;function Lb(i){Xe._getMatrix(Ah,Xe.workingColorSpace,i);const e=`mat3( ${Ah.elements.map(t=>t.toFixed(4))} )`;switch(Xe.getTransfer(i)){case _o:return[e,"LinearTransferOETF"];case tt:return[e,"sRGBTransferOETF"];default:return Pe("WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function wh(i,e,t){const n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";const a=/ERROR: 0:(\d+)/.exec(r);if(a){const o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+Pb(i.getShaderSource(e),o)}else return r}function Nb(i,e){const t=Lb(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}const Ib={[vf]:"Linear",[xf]:"Reinhard",[bf]:"Cineon",[yf]:"ACESFilmic",[Sf]:"AgX",[Ef]:"Neutral",[Mf]:"Custom"};function Db(i,e){const t=Ib[e];return t===void 0?(Pe("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const Va=new I;function Ub(){Xe.getLuminanceCoefficients(Va);const i=Va.x.toFixed(4),e=Va.y.toFixed(4),t=Va.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Fb(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Ar).join(`
`)}function Ob(i){const e=[];for(const t in i){const n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function kb(i,e){const t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){const r=i.getActiveAttrib(e,s),a=r.name;let o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:i.getAttribLocation(e,a),locationSize:o}}return t}function Ar(i){return i!==""}function Rh(i,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Ch(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const Bb=/^[ \t]*#include +<([\w\d./]+)>/gm;function qc(i){return i.replace(Bb,Vb)}const zb=new Map;function Vb(i,e){let t=Ge[e];if(t===void 0){const n=zb.get(e);if(n!==void 0)t=Ge[n],Pe('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return qc(t)}const Gb=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Ph(i){return i.replace(Gb,Hb)}function Hb(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Lh(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}const Wb={[Qa]:"SHADOWMAP_TYPE_PCF",[Er]:"SHADOWMAP_TYPE_VSM"};function Xb(i){return Wb[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const qb={[xs]:"ENVMAP_TYPE_CUBE",[ar]:"ENVMAP_TYPE_CUBE",[Vo]:"ENVMAP_TYPE_CUBE_UV"};function $b(i){return i.envMap===!1?"ENVMAP_TYPE_CUBE":qb[i.envMapMode]||"ENVMAP_TYPE_CUBE"}const Yb={[ar]:"ENVMAP_MODE_REFRACTION"};function Kb(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":Yb[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}const Zb={[zo]:"ENVMAP_BLENDING_MULTIPLY",[Im]:"ENVMAP_BLENDING_MIX",[Dm]:"ENVMAP_BLENDING_ADD"};function Jb(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":Zb[i.combine]||"ENVMAP_BLENDING_NONE"}function jb(i){const e=i.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),7*16)),texelHeight:n,maxMip:t}}function Qb(i,e,t,n){const s=i.getContext(),r=t.defines;let a=t.vertexShader,o=t.fragmentShader;const l=Xb(t),c=$b(t),u=Kb(t),h=Jb(t),d=jb(t),f=Fb(t),g=Ob(r),v=s.createProgram();let m,p,S=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Ar).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Ar).join(`
`),p.length>0&&(p+=`
`)):(m=[Lh(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Ar).join(`
`),p=[Lh(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+h:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==qn?"#define TONE_MAPPING":"",t.toneMapping!==qn?Ge.tonemapping_pars_fragment:"",t.toneMapping!==qn?Db("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Ge.colorspace_pars_fragment,Nb("linearToOutputTexel",t.outputColorSpace),Ub(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Ar).join(`
`)),a=qc(a),a=Rh(a,t),a=Ch(a,t),o=qc(o),o=Rh(o,t),o=Ch(o,t),a=Ph(a),o=Ph(o),t.isRawShaderMaterial!==!0&&(S=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",t.glslVersion===Eu?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Eu?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);const A=S+m+a,b=S+p+o,T=Th(s,s.VERTEX_SHADER,A),M=Th(s,s.FRAGMENT_SHADER,b);s.attachShader(v,T),s.attachShader(v,M),t.index0AttributeName!==void 0?s.bindAttribLocation(v,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(v,0,"position"),s.linkProgram(v);function w(R){if(i.debug.checkShaderErrors){const L=s.getProgramInfoLog(v)||"",z=s.getShaderInfoLog(T)||"",X=s.getShaderInfoLog(M)||"",O=L.trim(),N=z.trim(),V=X.trim();let $=!0,j=!0;if(s.getProgramParameter(v,s.LINK_STATUS)===!1)if($=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,v,T,M);else{const re=wh(s,T,"vertex"),se=wh(s,M,"fragment");He("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(v,s.VALIDATE_STATUS)+`

Material Name: `+R.name+`
Material Type: `+R.type+`

Program Info Log: `+O+`
`+re+`
`+se)}else O!==""?Pe("WebGLProgram: Program Info Log:",O):(N===""||V==="")&&(j=!1);j&&(R.diagnostics={runnable:$,programLog:O,vertexShader:{log:N,prefix:m},fragmentShader:{log:V,prefix:p}})}s.deleteShader(T),s.deleteShader(M),_=new so(s,v),y=kb(s,v)}let _;this.getUniforms=function(){return _===void 0&&w(this),_};let y;this.getAttributes=function(){return y===void 0&&w(this),y};let P=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return P===!1&&(P=s.getProgramParameter(v,Rb)),P},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(v),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Cb++,this.cacheKey=e,this.usedTimes=1,this.program=v,this.vertexShader=T,this.fragmentShader=M,this}let ey=0;class ty{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){const s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new ny(e),t.set(e,n)),n}}class ny{constructor(e){this.id=ey++,this.code=e,this.usedTimes=0}}function iy(i){return i===bs||i===po||i===mo}function sy(i,e,t,n,s,r){const a=new pd,o=new ty,l=new Set,c=[],u=new Map,h=n.logarithmicDepthBuffer;let d=n.precision;const f={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(_){return l.add(_),_===0?"uv":`uv${_}`}function v(_,y,P,R,L,z){const X=R.fog,O=L.geometry,N=_.isMeshStandardMaterial||_.isMeshLambertMaterial||_.isMeshPhongMaterial?R.environment:null,V=_.isMeshStandardMaterial||_.isMeshLambertMaterial&&!_.envMap||_.isMeshPhongMaterial&&!_.envMap,$=e.get(_.envMap||N,V),j=$&&$.mapping===Vo?$.image.height:null,re=f[_.type];_.precision!==null&&(d=n.getMaxPrecision(_.precision),d!==_.precision&&Pe("WebGLProgram.getParameters:",_.precision,"not supported, using",d,"instead."));const se=O.morphAttributes.position||O.morphAttributes.normal||O.morphAttributes.color,ae=se!==void 0?se.length:0;let xe=0;O.morphAttributes.position!==void 0&&(xe=1),O.morphAttributes.normal!==void 0&&(xe=2),O.morphAttributes.color!==void 0&&(xe=3);let be,le,k,J;if(re){const Se=Bn[re];be=Se.vertexShader,le=Se.fragmentShader}else{be=_.vertexShader,le=_.fragmentShader;const Se=o.getVertexShaderStage(_),ft=o.getFragmentShaderStage(_);o.update(_,Se,ft),k=Se.id,J=ft.id}const te=i.getRenderTarget(),Ae=i.state.buffers.depth.getReversed(),Fe=L.isInstancedMesh===!0,Ie=L.isBatchedMesh===!0,vt=!!_.map,Ye=!!_.matcap,rt=!!$,Je=!!_.aoMap,Ke=!!_.lightMap,Mt=!!_.bumpMap&&_.wireframe===!1,At=!!_.normalMap,It=!!_.displacementMap,Ft=!!_.emissiveMap,ht=!!_.metalnessMap,St=!!_.roughnessMap,U=_.anisotropy>0,Qt=_.clearcoat>0,et=_.dispersion>0,C=_.iridescence>0,x=_.sheen>0,B=_.transmission>0,W=U&&!!_.anisotropyMap,K=Qt&&!!_.clearcoatMap,oe=Qt&&!!_.clearcoatNormalMap,de=Qt&&!!_.clearcoatRoughnessMap,Z=C&&!!_.iridescenceMap,ee=C&&!!_.iridescenceThicknessMap,ue=x&&!!_.sheenColorMap,we=x&&!!_.sheenRoughnessMap,pe=!!_.specularMap,he=!!_.specularColorMap,Le=!!_.specularIntensityMap,De=B&&!!_.transmissionMap,ze=B&&!!_.thicknessMap,D=!!_.gradientMap,ce=!!_.alphaMap,Q=_.alphaTest>0,fe=!!_.alphaHash,ve=!!_.extensions;let ie=qn;_.toneMapped&&(te===null||te.isXRRenderTarget===!0)&&(ie=i.toneMapping);const Te={shaderID:re,shaderType:_.type,shaderName:_.name,vertexShader:be,fragmentShader:le,defines:_.defines,customVertexShaderID:k,customFragmentShaderID:J,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:d,batching:Ie,batchingColor:Ie&&L._colorsTexture!==null,instancing:Fe,instancingColor:Fe&&L.instanceColor!==null,instancingMorph:Fe&&L.morphTexture!==null,outputColorSpace:te===null?i.outputColorSpace:te.isXRRenderTarget===!0?te.texture.colorSpace:Xe.workingColorSpace,alphaToCoverage:!!_.alphaToCoverage,map:vt,matcap:Ye,envMap:rt,envMapMode:rt&&$.mapping,envMapCubeUVHeight:j,aoMap:Je,lightMap:Ke,bumpMap:Mt,normalMap:At,displacementMap:It,emissiveMap:Ft,normalMapObjectSpace:At&&_.normalMapType===Bm,normalMapTangentSpace:At&&_.normalMapType===Gr,packedNormalMap:At&&_.normalMapType===Gr&&iy(_.normalMap.format),metalnessMap:ht,roughnessMap:St,anisotropy:U,anisotropyMap:W,clearcoat:Qt,clearcoatMap:K,clearcoatNormalMap:oe,clearcoatRoughnessMap:de,dispersion:et,iridescence:C,iridescenceMap:Z,iridescenceThicknessMap:ee,sheen:x,sheenColorMap:ue,sheenRoughnessMap:we,specularMap:pe,specularColorMap:he,specularIntensityMap:Le,transmission:B,transmissionMap:De,thicknessMap:ze,gradientMap:D,opaque:_.transparent===!1&&_.blending===er&&_.alphaToCoverage===!1,alphaMap:ce,alphaTest:Q,alphaHash:fe,combine:_.combine,mapUv:vt&&g(_.map.channel),aoMapUv:Je&&g(_.aoMap.channel),lightMapUv:Ke&&g(_.lightMap.channel),bumpMapUv:Mt&&g(_.bumpMap.channel),normalMapUv:At&&g(_.normalMap.channel),displacementMapUv:It&&g(_.displacementMap.channel),emissiveMapUv:Ft&&g(_.emissiveMap.channel),metalnessMapUv:ht&&g(_.metalnessMap.channel),roughnessMapUv:St&&g(_.roughnessMap.channel),anisotropyMapUv:W&&g(_.anisotropyMap.channel),clearcoatMapUv:K&&g(_.clearcoatMap.channel),clearcoatNormalMapUv:oe&&g(_.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:de&&g(_.clearcoatRoughnessMap.channel),iridescenceMapUv:Z&&g(_.iridescenceMap.channel),iridescenceThicknessMapUv:ee&&g(_.iridescenceThicknessMap.channel),sheenColorMapUv:ue&&g(_.sheenColorMap.channel),sheenRoughnessMapUv:we&&g(_.sheenRoughnessMap.channel),specularMapUv:pe&&g(_.specularMap.channel),specularColorMapUv:he&&g(_.specularColorMap.channel),specularIntensityMapUv:Le&&g(_.specularIntensityMap.channel),transmissionMapUv:De&&g(_.transmissionMap.channel),thicknessMapUv:ze&&g(_.thicknessMap.channel),alphaMapUv:ce&&g(_.alphaMap.channel),vertexTangents:!!O.attributes.tangent&&(At||U),vertexNormals:!!O.attributes.normal,vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!O.attributes.color&&O.attributes.color.itemSize===4,pointsUvs:L.isPoints===!0&&!!O.attributes.uv&&(vt||ce),fog:!!X,useFog:_.fog===!0,fogExp2:!!X&&X.isFogExp2,flatShading:_.wireframe===!1&&(_.flatShading===!0||O.attributes.normal===void 0&&At===!1&&(_.isMeshLambertMaterial||_.isMeshPhongMaterial||_.isMeshStandardMaterial||_.isMeshPhysicalMaterial)),sizeAttenuation:_.sizeAttenuation===!0,logarithmicDepthBuffer:h,reversedDepthBuffer:Ae,skinning:L.isSkinnedMesh===!0,hasPositionAttribute:O.attributes.position!==void 0,morphTargets:O.morphAttributes.position!==void 0,morphNormals:O.morphAttributes.normal!==void 0,morphColors:O.morphAttributes.color!==void 0,morphTargetsCount:ae,morphTextureStride:xe,numDirLights:y.directional.length,numPointLights:y.point.length,numSpotLights:y.spot.length,numSpotLightMaps:y.spotLightMap.length,numRectAreaLights:y.rectArea.length,numHemiLights:y.hemi.length,numDirLightShadows:y.directionalShadowMap.length,numPointLightShadows:y.pointShadowMap.length,numSpotLightShadows:y.spotShadowMap.length,numSpotLightShadowsWithMaps:y.numSpotLightShadowsWithMaps,numLightProbes:y.numLightProbes,numLightProbeGrids:z.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:_.dithering,shadowMapEnabled:i.shadowMap.enabled&&P.length>0,shadowMapType:i.shadowMap.type,toneMapping:ie,decodeVideoTexture:vt&&_.map.isVideoTexture===!0&&Xe.getTransfer(_.map.colorSpace)===tt,decodeVideoTextureEmissive:Ft&&_.emissiveMap.isVideoTexture===!0&&Xe.getTransfer(_.emissiveMap.colorSpace)===tt,premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===Rn,flipSided:_.side===nn,useDepthPacking:_.depthPacking>=0,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionClipCullDistance:ve&&_.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ve&&_.extensions.multiDraw===!0||Ie)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:_.customProgramCacheKey()};return Te.vertexUv1s=l.has(1),Te.vertexUv2s=l.has(2),Te.vertexUv3s=l.has(3),l.clear(),Te}function m(_){const y=[];if(_.shaderID?y.push(_.shaderID):(y.push(_.customVertexShaderID),y.push(_.customFragmentShaderID)),_.defines!==void 0)for(const P in _.defines)y.push(P),y.push(_.defines[P]);return _.isRawShaderMaterial===!1&&(p(y,_),S(y,_),y.push(i.outputColorSpace)),y.push(_.customProgramCacheKey),y.join()}function p(_,y){_.push(y.precision),_.push(y.outputColorSpace),_.push(y.envMapMode),_.push(y.envMapCubeUVHeight),_.push(y.mapUv),_.push(y.alphaMapUv),_.push(y.lightMapUv),_.push(y.aoMapUv),_.push(y.bumpMapUv),_.push(y.normalMapUv),_.push(y.displacementMapUv),_.push(y.emissiveMapUv),_.push(y.metalnessMapUv),_.push(y.roughnessMapUv),_.push(y.anisotropyMapUv),_.push(y.clearcoatMapUv),_.push(y.clearcoatNormalMapUv),_.push(y.clearcoatRoughnessMapUv),_.push(y.iridescenceMapUv),_.push(y.iridescenceThicknessMapUv),_.push(y.sheenColorMapUv),_.push(y.sheenRoughnessMapUv),_.push(y.specularMapUv),_.push(y.specularColorMapUv),_.push(y.specularIntensityMapUv),_.push(y.transmissionMapUv),_.push(y.thicknessMapUv),_.push(y.combine),_.push(y.fogExp2),_.push(y.sizeAttenuation),_.push(y.morphTargetsCount),_.push(y.morphAttributeCount),_.push(y.numDirLights),_.push(y.numPointLights),_.push(y.numSpotLights),_.push(y.numSpotLightMaps),_.push(y.numHemiLights),_.push(y.numRectAreaLights),_.push(y.numDirLightShadows),_.push(y.numPointLightShadows),_.push(y.numSpotLightShadows),_.push(y.numSpotLightShadowsWithMaps),_.push(y.numLightProbes),_.push(y.shadowMapType),_.push(y.toneMapping),_.push(y.numClippingPlanes),_.push(y.numClipIntersection),_.push(y.depthPacking)}function S(_,y){a.disableAll(),y.instancing&&a.enable(0),y.instancingColor&&a.enable(1),y.instancingMorph&&a.enable(2),y.matcap&&a.enable(3),y.envMap&&a.enable(4),y.normalMapObjectSpace&&a.enable(5),y.normalMapTangentSpace&&a.enable(6),y.clearcoat&&a.enable(7),y.iridescence&&a.enable(8),y.alphaTest&&a.enable(9),y.vertexColors&&a.enable(10),y.vertexAlphas&&a.enable(11),y.vertexUv1s&&a.enable(12),y.vertexUv2s&&a.enable(13),y.vertexUv3s&&a.enable(14),y.vertexTangents&&a.enable(15),y.anisotropy&&a.enable(16),y.alphaHash&&a.enable(17),y.batching&&a.enable(18),y.dispersion&&a.enable(19),y.batchingColor&&a.enable(20),y.gradientMap&&a.enable(21),y.packedNormalMap&&a.enable(22),y.vertexNormals&&a.enable(23),_.push(a.mask),a.disableAll(),y.fog&&a.enable(0),y.useFog&&a.enable(1),y.flatShading&&a.enable(2),y.logarithmicDepthBuffer&&a.enable(3),y.reversedDepthBuffer&&a.enable(4),y.skinning&&a.enable(5),y.morphTargets&&a.enable(6),y.morphNormals&&a.enable(7),y.morphColors&&a.enable(8),y.premultipliedAlpha&&a.enable(9),y.shadowMapEnabled&&a.enable(10),y.doubleSided&&a.enable(11),y.flipSided&&a.enable(12),y.useDepthPacking&&a.enable(13),y.dithering&&a.enable(14),y.transmission&&a.enable(15),y.sheen&&a.enable(16),y.opaque&&a.enable(17),y.pointsUvs&&a.enable(18),y.decodeVideoTexture&&a.enable(19),y.decodeVideoTextureEmissive&&a.enable(20),y.alphaToCoverage&&a.enable(21),y.numLightProbeGrids>0&&a.enable(22),y.hasPositionAttribute&&a.enable(23),_.push(a.mask)}function A(_){const y=f[_.type];let P;if(y){const R=Bn[y];P=i_.clone(R.uniforms)}else P=_.uniforms;return P}function b(_,y){let P=u.get(y);return P!==void 0?++P.usedTimes:(P=new Qb(i,y,_,s),c.push(P),u.set(y,P)),P}function T(_){if(--_.usedTimes===0){const y=c.indexOf(_);c[y]=c[c.length-1],c.pop(),u.delete(_.cacheKey),_.destroy()}}function M(_){o.remove(_)}function w(){o.dispose()}return{getParameters:v,getProgramCacheKey:m,getUniforms:A,acquireProgram:b,releaseProgram:T,releaseShaderCache:M,programs:c,dispose:w}}function ry(){let i=new WeakMap;function e(a){return i.has(a)}function t(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,l){i.get(a)[o]=l}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function ay(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.materialVariant!==e.materialVariant?i.materialVariant-e.materialVariant:i.z!==e.z?i.z-e.z:i.id-e.id}function Nh(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function Ih(){const i=[];let e=0;const t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function a(d){let f=0;return d.isInstancedMesh&&(f+=2),d.isSkinnedMesh&&(f+=1),f}function o(d,f,g,v,m,p){let S=i[e];return S===void 0?(S={id:d.id,object:d,geometry:f,material:g,materialVariant:a(d),groupOrder:v,renderOrder:d.renderOrder,z:m,group:p},i[e]=S):(S.id=d.id,S.object=d,S.geometry=f,S.material=g,S.materialVariant=a(d),S.groupOrder=v,S.renderOrder=d.renderOrder,S.z=m,S.group=p),e++,S}function l(d,f,g,v,m,p){const S=o(d,f,g,v,m,p);g.transmission>0?n.push(S):g.transparent===!0?s.push(S):t.push(S)}function c(d,f,g,v,m,p){const S=o(d,f,g,v,m,p);g.transmission>0?n.unshift(S):g.transparent===!0?s.unshift(S):t.unshift(S)}function u(d,f,g){t.length>1&&t.sort(d||ay),n.length>1&&n.sort(f||Nh),s.length>1&&s.sort(f||Nh),g&&(t.reverse(),n.reverse(),s.reverse())}function h(){for(let d=e,f=i.length;d<f;d++){const g=i[d];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:l,unshift:c,finish:h,sort:u}}function oy(){let i=new WeakMap;function e(n,s){const r=i.get(n);let a;return r===void 0?(a=new Ih,i.set(n,[a])):s>=r.length?(a=new Ih,r.push(a)):a=r[s],a}function t(){i=new WeakMap}return{get:e,dispose:t}}function ly(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new I,color:new ke};break;case"SpotLight":t={position:new I,direction:new I,color:new ke,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new I,color:new ke,distance:0,decay:0};break;case"HemisphereLight":t={direction:new I,skyColor:new ke,groundColor:new ke};break;case"RectAreaLight":t={color:new ke,position:new I,halfWidth:new I,halfHeight:new I};break}return i[e.id]=t,t}}}function cy(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ne};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ne};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ne,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}let dy=0;function uy(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function hy(i){const e=new ly,t=cy(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new I);const s=new I,r=new Oe,a=new Oe;function o(c){let u=0,h=0,d=0;for(let y=0;y<9;y++)n.probe[y].set(0,0,0);let f=0,g=0,v=0,m=0,p=0,S=0,A=0,b=0,T=0,M=0,w=0;c.sort(uy);for(let y=0,P=c.length;y<P;y++){const R=c[y],L=R.color,z=R.intensity,X=R.distance;let O=null;if(R.shadow&&R.shadow.map&&(R.shadow.map.texture.format===bs?O=R.shadow.map.texture:O=R.shadow.map.depthTexture||R.shadow.map.texture),R.isAmbientLight)u+=L.r*z,h+=L.g*z,d+=L.b*z;else if(R.isLightProbe){for(let N=0;N<9;N++)n.probe[N].addScaledVector(R.sh.coefficients[N],z);w++}else if(R.isDirectionalLight){const N=e.get(R);if(N.color.copy(R.color).multiplyScalar(R.intensity),R.castShadow){const V=R.shadow,$=t.get(R);$.shadowIntensity=V.intensity,$.shadowBias=V.bias,$.shadowNormalBias=V.normalBias,$.shadowRadius=V.radius,$.shadowMapSize=V.mapSize,n.directionalShadow[f]=$,n.directionalShadowMap[f]=O,n.directionalShadowMatrix[f]=R.shadow.matrix,S++}n.directional[f]=N,f++}else if(R.isSpotLight){const N=e.get(R);N.position.setFromMatrixPosition(R.matrixWorld),N.color.copy(L).multiplyScalar(z),N.distance=X,N.coneCos=Math.cos(R.angle),N.penumbraCos=Math.cos(R.angle*(1-R.penumbra)),N.decay=R.decay,n.spot[v]=N;const V=R.shadow;if(R.map&&(n.spotLightMap[T]=R.map,T++,V.updateMatrices(R),R.castShadow&&M++),n.spotLightMatrix[v]=V.matrix,R.castShadow){const $=t.get(R);$.shadowIntensity=V.intensity,$.shadowBias=V.bias,$.shadowNormalBias=V.normalBias,$.shadowRadius=V.radius,$.shadowMapSize=V.mapSize,n.spotShadow[v]=$,n.spotShadowMap[v]=O,b++}v++}else if(R.isRectAreaLight){const N=e.get(R);N.color.copy(L).multiplyScalar(z),N.halfWidth.set(R.width*.5,0,0),N.halfHeight.set(0,R.height*.5,0),n.rectArea[m]=N,m++}else if(R.isPointLight){const N=e.get(R);if(N.color.copy(R.color).multiplyScalar(R.intensity),N.distance=R.distance,N.decay=R.decay,R.castShadow){const V=R.shadow,$=t.get(R);$.shadowIntensity=V.intensity,$.shadowBias=V.bias,$.shadowNormalBias=V.normalBias,$.shadowRadius=V.radius,$.shadowMapSize=V.mapSize,$.shadowCameraNear=V.camera.near,$.shadowCameraFar=V.camera.far,n.pointShadow[g]=$,n.pointShadowMap[g]=O,n.pointShadowMatrix[g]=R.shadow.matrix,A++}n.point[g]=N,g++}else if(R.isHemisphereLight){const N=e.get(R);N.skyColor.copy(R.color).multiplyScalar(z),N.groundColor.copy(R.groundColor).multiplyScalar(z),n.hemi[p]=N,p++}}m>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=me.LTC_FLOAT_1,n.rectAreaLTC2=me.LTC_FLOAT_2):(n.rectAreaLTC1=me.LTC_HALF_1,n.rectAreaLTC2=me.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=h,n.ambient[2]=d;const _=n.hash;(_.directionalLength!==f||_.pointLength!==g||_.spotLength!==v||_.rectAreaLength!==m||_.hemiLength!==p||_.numDirectionalShadows!==S||_.numPointShadows!==A||_.numSpotShadows!==b||_.numSpotMaps!==T||_.numLightProbes!==w)&&(n.directional.length=f,n.spot.length=v,n.rectArea.length=m,n.point.length=g,n.hemi.length=p,n.directionalShadow.length=S,n.directionalShadowMap.length=S,n.pointShadow.length=A,n.pointShadowMap.length=A,n.spotShadow.length=b,n.spotShadowMap.length=b,n.directionalShadowMatrix.length=S,n.pointShadowMatrix.length=A,n.spotLightMatrix.length=b+T-M,n.spotLightMap.length=T,n.numSpotLightShadowsWithMaps=M,n.numLightProbes=w,_.directionalLength=f,_.pointLength=g,_.spotLength=v,_.rectAreaLength=m,_.hemiLength=p,_.numDirectionalShadows=S,_.numPointShadows=A,_.numSpotShadows=b,_.numSpotMaps=T,_.numLightProbes=w,n.version=dy++)}function l(c,u){let h=0,d=0,f=0,g=0,v=0;const m=u.matrixWorldInverse;for(let p=0,S=c.length;p<S;p++){const A=c[p];if(A.isDirectionalLight){const b=n.directional[h];b.direction.setFromMatrixPosition(A.matrixWorld),s.setFromMatrixPosition(A.target.matrixWorld),b.direction.sub(s),b.direction.transformDirection(m),h++}else if(A.isSpotLight){const b=n.spot[f];b.position.setFromMatrixPosition(A.matrixWorld),b.position.applyMatrix4(m),b.direction.setFromMatrixPosition(A.matrixWorld),s.setFromMatrixPosition(A.target.matrixWorld),b.direction.sub(s),b.direction.transformDirection(m),f++}else if(A.isRectAreaLight){const b=n.rectArea[g];b.position.setFromMatrixPosition(A.matrixWorld),b.position.applyMatrix4(m),a.identity(),r.copy(A.matrixWorld),r.premultiply(m),a.extractRotation(r),b.halfWidth.set(A.width*.5,0,0),b.halfHeight.set(0,A.height*.5,0),b.halfWidth.applyMatrix4(a),b.halfHeight.applyMatrix4(a),g++}else if(A.isPointLight){const b=n.point[d];b.position.setFromMatrixPosition(A.matrixWorld),b.position.applyMatrix4(m),d++}else if(A.isHemisphereLight){const b=n.hemi[v];b.direction.setFromMatrixPosition(A.matrixWorld),b.direction.transformDirection(m),v++}}}return{setup:o,setupView:l,state:n}}function Dh(i){const e=new hy(i),t=[],n=[],s=[];function r(d){h.camera=d,t.length=0,n.length=0,s.length=0}function a(d){t.push(d)}function o(d){n.push(d)}function l(d){s.push(d)}function c(){e.setup(t)}function u(d){e.setupView(t,d)}const h={lightsArray:t,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:h,setupLights:c,setupLightsView:u,pushLight:a,pushShadow:o,pushLightProbeGrid:l}}function fy(i){let e=new WeakMap;function t(s,r=0){const a=e.get(s);let o;return a===void 0?(o=new Dh(i),e.set(s,[o])):r>=a.length?(o=new Dh(i),a.push(o)):o=a[r],o}function n(){e=new WeakMap}return{get:t,dispose:n}}const py=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,my=`uniform sampler2D shadow_pass;
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
}`,gy=[new I(1,0,0),new I(-1,0,0),new I(0,1,0),new I(0,-1,0),new I(0,0,1),new I(0,0,-1)],_y=[new I(0,-1,0),new I(0,-1,0),new I(0,0,1),new I(0,0,-1),new I(0,-1,0),new I(0,-1,0)],Uh=new Oe,Sr=new I,Fl=new I;function vy(i,e,t){let n=new gd;const s=new Ne,r=new Ne,a=new st,o=new l_,l=new c_,c={},u=t.maxTextureSize,h={[mi]:nn,[nn]:mi,[Rn]:Rn},d=new Kn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Ne},radius:{value:4}},vertexShader:py,fragmentShader:my}),f=d.clone();f.defines.HORIZONTAL_PASS=1;const g=new Vt;g.setAttribute("position",new un(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const v=new gt(g,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Qa;let p=this.type;this.render=function(M,w,_){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||M.length===0)return;this.type===pm&&(Pe("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),this.type=Qa);const y=i.getRenderTarget(),P=i.getActiveCubeFace(),R=i.getActiveMipmapLevel(),L=i.state;L.setBlending(di),L.buffers.depth.getReversed()===!0?L.buffers.color.setClear(0,0,0,0):L.buffers.color.setClear(1,1,1,1),L.buffers.depth.setTest(!0),L.setScissorTest(!1);const z=p!==this.type;z&&w.traverse(function(X){X.material&&(Array.isArray(X.material)?X.material.forEach(O=>O.needsUpdate=!0):X.material.needsUpdate=!0)});for(let X=0,O=M.length;X<O;X++){const N=M[X],V=N.shadow;if(V===void 0){Pe("WebGLShadowMap:",N,"has no shadow.");continue}if(V.autoUpdate===!1&&V.needsUpdate===!1)continue;s.copy(V.mapSize);const $=V.getFrameExtents();s.multiply($),r.copy(V.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/$.x),s.x=r.x*$.x,V.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/$.y),s.y=r.y*$.y,V.mapSize.y=r.y));const j=i.state.buffers.depth.getReversed();if(V.camera._reversedDepth=j,V.map===null||z===!0){if(V.map!==null&&(V.map.depthTexture!==null&&(V.map.depthTexture.dispose(),V.map.depthTexture=null),V.map.dispose()),this.type===Er){if(N.isPointLight){Pe("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}V.map=new $n(s.x,s.y,{format:bs,type:gi,minFilter:Pt,magFilter:Pt,generateMipmaps:!1}),V.map.texture.name=N.name+".shadowMap",V.map.depthTexture=new lr(s.x,s.y,Cn),V.map.depthTexture.name=N.name+".shadowMapDepth",V.map.depthTexture.format=_i,V.map.depthTexture.compareFunction=null,V.map.depthTexture.minFilter=zt,V.map.depthTexture.magFilter=zt}else N.isPointLight?(V.map=new np(s.x),V.map.depthTexture=new Og(s.x,Yn)):(V.map=new $n(s.x,s.y),V.map.depthTexture=new lr(s.x,s.y,Yn)),V.map.depthTexture.name=N.name+".shadowMap",V.map.depthTexture.format=_i,this.type===Qa?(V.map.depthTexture.compareFunction=j?ud:dd,V.map.depthTexture.minFilter=Pt,V.map.depthTexture.magFilter=Pt):(V.map.depthTexture.compareFunction=null,V.map.depthTexture.minFilter=zt,V.map.depthTexture.magFilter=zt);V.camera.updateProjectionMatrix()}const re=V.map.isWebGLCubeRenderTarget?6:1;for(let se=0;se<re;se++){if(V.map.isWebGLCubeRenderTarget)i.setRenderTarget(V.map,se),i.clear();else{se===0&&(i.setRenderTarget(V.map),i.clear());const ae=V.getViewport(se);a.set(r.x*ae.x,r.y*ae.y,r.x*ae.z,r.y*ae.w),L.viewport(a)}if(N.isPointLight){const ae=V.camera,xe=V.matrix,be=N.distance||ae.far;be!==ae.far&&(ae.far=be,ae.updateProjectionMatrix()),Sr.setFromMatrixPosition(N.matrixWorld),ae.position.copy(Sr),Fl.copy(ae.position),Fl.add(gy[se]),ae.up.copy(_y[se]),ae.lookAt(Fl),ae.updateMatrixWorld(),xe.makeTranslation(-Sr.x,-Sr.y,-Sr.z),Uh.multiplyMatrices(ae.projectionMatrix,ae.matrixWorldInverse),V._frustum.setFromProjectionMatrix(Uh,ae.coordinateSystem,ae.reversedDepth)}else V.updateMatrices(N);n=V.getFrustum(),b(w,_,V.camera,N,this.type)}V.isPointLightShadow!==!0&&this.type===Er&&S(V,_),V.needsUpdate=!1}p=this.type,m.needsUpdate=!1,i.setRenderTarget(y,P,R)};function S(M,w){const _=e.update(v);d.defines.VSM_SAMPLES!==M.blurSamples&&(d.defines.VSM_SAMPLES=M.blurSamples,f.defines.VSM_SAMPLES=M.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),M.mapPass===null&&(M.mapPass=new $n(s.x,s.y,{format:bs,type:gi})),d.uniforms.shadow_pass.value=M.map.depthTexture,d.uniforms.resolution.value=M.mapSize,d.uniforms.radius.value=M.radius,i.setRenderTarget(M.mapPass),i.clear(),i.renderBufferDirect(w,null,_,d,v,null),f.uniforms.shadow_pass.value=M.mapPass.texture,f.uniforms.resolution.value=M.mapSize,f.uniforms.radius.value=M.radius,i.setRenderTarget(M.map),i.clear(),i.renderBufferDirect(w,null,_,f,v,null)}function A(M,w,_,y){let P=null;const R=_.isPointLight===!0?M.customDistanceMaterial:M.customDepthMaterial;if(R!==void 0)P=R;else if(P=_.isPointLight===!0?l:o,i.localClippingEnabled&&w.clipShadows===!0&&Array.isArray(w.clippingPlanes)&&w.clippingPlanes.length!==0||w.displacementMap&&w.displacementScale!==0||w.alphaMap&&w.alphaTest>0||w.map&&w.alphaTest>0||w.alphaToCoverage===!0){const L=P.uuid,z=w.uuid;let X=c[L];X===void 0&&(X={},c[L]=X);let O=X[z];O===void 0&&(O=P.clone(),X[z]=O,w.addEventListener("dispose",T)),P=O}if(P.visible=w.visible,P.wireframe=w.wireframe,y===Er?P.side=w.shadowSide!==null?w.shadowSide:w.side:P.side=w.shadowSide!==null?w.shadowSide:h[w.side],P.alphaMap=w.alphaMap,P.alphaTest=w.alphaToCoverage===!0?.5:w.alphaTest,P.map=w.map,P.clipShadows=w.clipShadows,P.clippingPlanes=w.clippingPlanes,P.clipIntersection=w.clipIntersection,P.displacementMap=w.displacementMap,P.displacementScale=w.displacementScale,P.displacementBias=w.displacementBias,P.wireframeLinewidth=w.wireframeLinewidth,P.linewidth=w.linewidth,_.isPointLight===!0&&P.isMeshDistanceMaterial===!0){const L=i.properties.get(P);L.light=_}return P}function b(M,w,_,y,P){if(M.visible===!1)return;if(M.layers.test(w.layers)&&(M.isMesh||M.isLine||M.isPoints)&&(M.castShadow||M.receiveShadow&&P===Er)&&(!M.frustumCulled||n.intersectsObject(M))){M.modelViewMatrix.multiplyMatrices(_.matrixWorldInverse,M.matrixWorld);const z=e.update(M),X=M.material;if(Array.isArray(X)){const O=z.groups;for(let N=0,V=O.length;N<V;N++){const $=O[N],j=X[$.materialIndex];if(j&&j.visible){const re=A(M,j,y,P);M.onBeforeShadow(i,M,w,_,z,re,$),i.renderBufferDirect(_,null,z,re,M,$),M.onAfterShadow(i,M,w,_,z,re,$)}}}else if(X.visible){const O=A(M,X,y,P);M.onBeforeShadow(i,M,w,_,z,O,null),i.renderBufferDirect(_,null,z,O,M,null),M.onAfterShadow(i,M,w,_,z,O,null)}}const L=M.children;for(let z=0,X=L.length;z<X;z++)b(L[z],w,_,y,P)}function T(M){M.target.removeEventListener("dispose",T);for(const _ in c){const y=c[_],P=M.target.uuid;P in y&&(y[P].dispose(),delete y[P])}}}function xy(i,e){function t(){let D=!1;const ce=new st;let Q=null;const fe=new st(0,0,0,0);return{setMask:function(ve){Q!==ve&&!D&&(i.colorMask(ve,ve,ve,ve),Q=ve)},setLocked:function(ve){D=ve},setClear:function(ve,ie,Te,Se,ft){ft===!0&&(ve*=Se,ie*=Se,Te*=Se),ce.set(ve,ie,Te,Se),fe.equals(ce)===!1&&(i.clearColor(ve,ie,Te,Se),fe.copy(ce))},reset:function(){D=!1,Q=null,fe.set(-1,0,0,0)}}}function n(){let D=!1,ce=!1,Q=null,fe=null,ve=null;return{setReversed:function(ie){if(ce!==ie){const Te=e.get("EXT_clip_control");ie?Te.clipControlEXT(Te.LOWER_LEFT_EXT,Te.ZERO_TO_ONE_EXT):Te.clipControlEXT(Te.LOWER_LEFT_EXT,Te.NEGATIVE_ONE_TO_ONE_EXT),ce=ie;const Se=ve;ve=null,this.setClear(Se)}},getReversed:function(){return ce},setTest:function(ie){ie?te(i.DEPTH_TEST):Ae(i.DEPTH_TEST)},setMask:function(ie){Q!==ie&&!D&&(i.depthMask(ie),Q=ie)},setFunc:function(ie){if(ce&&(ie=Zm[ie]),fe!==ie){switch(ie){case nc:i.depthFunc(i.NEVER);break;case ic:i.depthFunc(i.ALWAYS);break;case sc:i.depthFunc(i.LESS);break;case rr:i.depthFunc(i.LEQUAL);break;case rc:i.depthFunc(i.EQUAL);break;case ac:i.depthFunc(i.GEQUAL);break;case oc:i.depthFunc(i.GREATER);break;case lc:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}fe=ie}},setLocked:function(ie){D=ie},setClear:function(ie){ve!==ie&&(ve=ie,ce&&(ie=1-ie),i.clearDepth(ie))},reset:function(){D=!1,Q=null,fe=null,ve=null,ce=!1}}}function s(){let D=!1,ce=null,Q=null,fe=null,ve=null,ie=null,Te=null,Se=null,ft=null;return{setTest:function(lt){D||(lt?te(i.STENCIL_TEST):Ae(i.STENCIL_TEST))},setMask:function(lt){ce!==lt&&!D&&(i.stencilMask(lt),ce=lt)},setFunc:function(lt,Nn,In){(Q!==lt||fe!==Nn||ve!==In)&&(i.stencilFunc(lt,Nn,In),Q=lt,fe=Nn,ve=In)},setOp:function(lt,Nn,In){(ie!==lt||Te!==Nn||Se!==In)&&(i.stencilOp(lt,Nn,In),ie=lt,Te=Nn,Se=In)},setLocked:function(lt){D=lt},setClear:function(lt){ft!==lt&&(i.clearStencil(lt),ft=lt)},reset:function(){D=!1,ce=null,Q=null,fe=null,ve=null,ie=null,Te=null,Se=null,ft=null}}}const r=new t,a=new n,o=new s,l=new WeakMap,c=new WeakMap;let u={},h={},d={},f=new WeakMap,g=[],v=null,m=!1,p=null,S=null,A=null,b=null,T=null,M=null,w=null,_=new ke(0,0,0),y=0,P=!1,R=null,L=null,z=null,X=null,O=null;const N=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let V=!1,$=0;const j=i.getParameter(i.VERSION);j.indexOf("WebGL")!==-1?($=parseFloat(/^WebGL (\d)/.exec(j)[1]),V=$>=1):j.indexOf("OpenGL ES")!==-1&&($=parseFloat(/^OpenGL ES (\d)/.exec(j)[1]),V=$>=2);let re=null,se={};const ae=i.getParameter(i.SCISSOR_BOX),xe=i.getParameter(i.VIEWPORT),be=new st().fromArray(ae),le=new st().fromArray(xe);function k(D,ce,Q,fe){const ve=new Uint8Array(4),ie=i.createTexture();i.bindTexture(D,ie),i.texParameteri(D,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(D,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Te=0;Te<Q;Te++)D===i.TEXTURE_3D||D===i.TEXTURE_2D_ARRAY?i.texImage3D(ce,0,i.RGBA,1,1,fe,0,i.RGBA,i.UNSIGNED_BYTE,ve):i.texImage2D(ce+Te,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,ve);return ie}const J={};J[i.TEXTURE_2D]=k(i.TEXTURE_2D,i.TEXTURE_2D,1),J[i.TEXTURE_CUBE_MAP]=k(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),J[i.TEXTURE_2D_ARRAY]=k(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),J[i.TEXTURE_3D]=k(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),te(i.DEPTH_TEST),a.setFunc(rr),Mt(!1),At(pu),te(i.CULL_FACE),Je(di);function te(D){u[D]!==!0&&(i.enable(D),u[D]=!0)}function Ae(D){u[D]!==!1&&(i.disable(D),u[D]=!1)}function Fe(D,ce){return d[D]!==ce?(i.bindFramebuffer(D,ce),d[D]=ce,D===i.DRAW_FRAMEBUFFER&&(d[i.FRAMEBUFFER]=ce),D===i.FRAMEBUFFER&&(d[i.DRAW_FRAMEBUFFER]=ce),!0):!1}function Ie(D,ce){let Q=g,fe=!1;if(D){Q=f.get(ce),Q===void 0&&(Q=[],f.set(ce,Q));const ve=D.textures;if(Q.length!==ve.length||Q[0]!==i.COLOR_ATTACHMENT0){for(let ie=0,Te=ve.length;ie<Te;ie++)Q[ie]=i.COLOR_ATTACHMENT0+ie;Q.length=ve.length,fe=!0}}else Q[0]!==i.BACK&&(Q[0]=i.BACK,fe=!0);fe&&i.drawBuffers(Q)}function vt(D){return v!==D?(i.useProgram(D),v=D,!0):!1}const Ye={[os]:i.FUNC_ADD,[gm]:i.FUNC_SUBTRACT,[_m]:i.FUNC_REVERSE_SUBTRACT};Ye[vm]=i.MIN,Ye[xm]=i.MAX;const rt={[bm]:i.ZERO,[ym]:i.ONE,[Mm]:i.SRC_COLOR,[ec]:i.SRC_ALPHA,[Rm]:i.SRC_ALPHA_SATURATE,[Am]:i.DST_COLOR,[Em]:i.DST_ALPHA,[Sm]:i.ONE_MINUS_SRC_COLOR,[tc]:i.ONE_MINUS_SRC_ALPHA,[wm]:i.ONE_MINUS_DST_COLOR,[Tm]:i.ONE_MINUS_DST_ALPHA,[Cm]:i.CONSTANT_COLOR,[Pm]:i.ONE_MINUS_CONSTANT_COLOR,[Lm]:i.CONSTANT_ALPHA,[Nm]:i.ONE_MINUS_CONSTANT_ALPHA};function Je(D,ce,Q,fe,ve,ie,Te,Se,ft,lt){if(D===di){m===!0&&(Ae(i.BLEND),m=!1);return}if(m===!1&&(te(i.BLEND),m=!0),D!==mm){if(D!==p||lt!==P){if((S!==os||T!==os)&&(i.blendEquation(i.FUNC_ADD),S=os,T=os),lt)switch(D){case er:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case mu:i.blendFunc(i.ONE,i.ONE);break;case gu:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case _u:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:He("WebGLState: Invalid blending: ",D);break}else switch(D){case er:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case mu:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case gu:He("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case _u:He("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:He("WebGLState: Invalid blending: ",D);break}A=null,b=null,M=null,w=null,_.set(0,0,0),y=0,p=D,P=lt}return}ve=ve||ce,ie=ie||Q,Te=Te||fe,(ce!==S||ve!==T)&&(i.blendEquationSeparate(Ye[ce],Ye[ve]),S=ce,T=ve),(Q!==A||fe!==b||ie!==M||Te!==w)&&(i.blendFuncSeparate(rt[Q],rt[fe],rt[ie],rt[Te]),A=Q,b=fe,M=ie,w=Te),(Se.equals(_)===!1||ft!==y)&&(i.blendColor(Se.r,Se.g,Se.b,ft),_.copy(Se),y=ft),p=D,P=!1}function Ke(D,ce){D.side===Rn?Ae(i.CULL_FACE):te(i.CULL_FACE);let Q=D.side===nn;ce&&(Q=!Q),Mt(Q),D.blending===er&&D.transparent===!1?Je(di):Je(D.blending,D.blendEquation,D.blendSrc,D.blendDst,D.blendEquationAlpha,D.blendSrcAlpha,D.blendDstAlpha,D.blendColor,D.blendAlpha,D.premultipliedAlpha),a.setFunc(D.depthFunc),a.setTest(D.depthTest),a.setMask(D.depthWrite),r.setMask(D.colorWrite);const fe=D.stencilWrite;o.setTest(fe),fe&&(o.setMask(D.stencilWriteMask),o.setFunc(D.stencilFunc,D.stencilRef,D.stencilFuncMask),o.setOp(D.stencilFail,D.stencilZFail,D.stencilZPass)),Ft(D.polygonOffset,D.polygonOffsetFactor,D.polygonOffsetUnits),D.alphaToCoverage===!0?te(i.SAMPLE_ALPHA_TO_COVERAGE):Ae(i.SAMPLE_ALPHA_TO_COVERAGE)}function Mt(D){R!==D&&(D?i.frontFace(i.CW):i.frontFace(i.CCW),R=D)}function At(D){D!==hm?(te(i.CULL_FACE),D!==L&&(D===pu?i.cullFace(i.BACK):D===fm?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Ae(i.CULL_FACE),L=D}function It(D){D!==z&&(V&&i.lineWidth(D),z=D)}function Ft(D,ce,Q){D?(te(i.POLYGON_OFFSET_FILL),(X!==ce||O!==Q)&&(X=ce,O=Q,a.getReversed()&&(ce=-ce),i.polygonOffset(ce,Q))):Ae(i.POLYGON_OFFSET_FILL)}function ht(D){D?te(i.SCISSOR_TEST):Ae(i.SCISSOR_TEST)}function St(D){D===void 0&&(D=i.TEXTURE0+N-1),re!==D&&(i.activeTexture(D),re=D)}function U(D,ce,Q){Q===void 0&&(re===null?Q=i.TEXTURE0+N-1:Q=re);let fe=se[Q];fe===void 0&&(fe={type:void 0,texture:void 0},se[Q]=fe),(fe.type!==D||fe.texture!==ce)&&(re!==Q&&(i.activeTexture(Q),re=Q),i.bindTexture(D,ce||J[D]),fe.type=D,fe.texture=ce)}function Qt(){const D=se[re];D!==void 0&&D.type!==void 0&&(i.bindTexture(D.type,null),D.type=void 0,D.texture=void 0)}function et(){try{i.compressedTexImage2D(...arguments)}catch(D){He("WebGLState:",D)}}function C(){try{i.compressedTexImage3D(...arguments)}catch(D){He("WebGLState:",D)}}function x(){try{i.texSubImage2D(...arguments)}catch(D){He("WebGLState:",D)}}function B(){try{i.texSubImage3D(...arguments)}catch(D){He("WebGLState:",D)}}function W(){try{i.compressedTexSubImage2D(...arguments)}catch(D){He("WebGLState:",D)}}function K(){try{i.compressedTexSubImage3D(...arguments)}catch(D){He("WebGLState:",D)}}function oe(){try{i.texStorage2D(...arguments)}catch(D){He("WebGLState:",D)}}function de(){try{i.texStorage3D(...arguments)}catch(D){He("WebGLState:",D)}}function Z(){try{i.texImage2D(...arguments)}catch(D){He("WebGLState:",D)}}function ee(){try{i.texImage3D(...arguments)}catch(D){He("WebGLState:",D)}}function ue(D){return h[D]!==void 0?h[D]:i.getParameter(D)}function we(D,ce){h[D]!==ce&&(i.pixelStorei(D,ce),h[D]=ce)}function pe(D){be.equals(D)===!1&&(i.scissor(D.x,D.y,D.z,D.w),be.copy(D))}function he(D){le.equals(D)===!1&&(i.viewport(D.x,D.y,D.z,D.w),le.copy(D))}function Le(D,ce){let Q=c.get(ce);Q===void 0&&(Q=new WeakMap,c.set(ce,Q));let fe=Q.get(D);fe===void 0&&(fe=i.getUniformBlockIndex(ce,D.name),Q.set(D,fe))}function De(D,ce){const fe=c.get(ce).get(D);l.get(ce)!==fe&&(i.uniformBlockBinding(ce,fe,D.__bindingPointIndex),l.set(ce,fe))}function ze(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),u={},h={},re=null,se={},d={},f=new WeakMap,g=[],v=null,m=!1,p=null,S=null,A=null,b=null,T=null,M=null,w=null,_=new ke(0,0,0),y=0,P=!1,R=null,L=null,z=null,X=null,O=null,be.set(0,0,i.canvas.width,i.canvas.height),le.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:te,disable:Ae,bindFramebuffer:Fe,drawBuffers:Ie,useProgram:vt,setBlending:Je,setMaterial:Ke,setFlipSided:Mt,setCullFace:At,setLineWidth:It,setPolygonOffset:Ft,setScissorTest:ht,activeTexture:St,bindTexture:U,unbindTexture:Qt,compressedTexImage2D:et,compressedTexImage3D:C,texImage2D:Z,texImage3D:ee,pixelStorei:we,getParameter:ue,updateUBOMapping:Le,uniformBlockBinding:De,texStorage2D:oe,texStorage3D:de,texSubImage2D:x,texSubImage3D:B,compressedTexSubImage2D:W,compressedTexSubImage3D:K,scissor:pe,viewport:he,reset:ze}}function by(i,e,t,n,s,r,a){const o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Ne,u=new WeakMap,h=new Set;let d;const f=new WeakMap;let g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function v(C,x){return g?new OffscreenCanvas(C,x):Wr("canvas")}function m(C,x,B){let W=1;const K=et(C);if((K.width>B||K.height>B)&&(W=B/Math.max(K.width,K.height)),W<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){const oe=Math.floor(W*K.width),de=Math.floor(W*K.height);d===void 0&&(d=v(oe,de));const Z=x?v(oe,de):d;return Z.width=oe,Z.height=de,Z.getContext("2d").drawImage(C,0,0,oe,de),Pe("WebGLRenderer: Texture has been resized from ("+K.width+"x"+K.height+") to ("+oe+"x"+de+")."),Z}else return"data"in C&&Pe("WebGLRenderer: Image in DataTexture is too big ("+K.width+"x"+K.height+")."),C;return C}function p(C){return C.generateMipmaps}function S(C){i.generateMipmap(C)}function A(C){return C.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:C.isWebGL3DRenderTarget?i.TEXTURE_3D:C.isWebGLArrayRenderTarget||C.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function b(C,x,B,W,K,oe=!1){if(C!==null){if(i[C]!==void 0)return i[C];Pe("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let de;W&&(de=e.get("EXT_texture_norm16"),de||Pe("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let Z=x;if(x===i.RED&&(B===i.FLOAT&&(Z=i.R32F),B===i.HALF_FLOAT&&(Z=i.R16F),B===i.UNSIGNED_BYTE&&(Z=i.R8),B===i.UNSIGNED_SHORT&&de&&(Z=de.R16_EXT),B===i.SHORT&&de&&(Z=de.R16_SNORM_EXT)),x===i.RED_INTEGER&&(B===i.UNSIGNED_BYTE&&(Z=i.R8UI),B===i.UNSIGNED_SHORT&&(Z=i.R16UI),B===i.UNSIGNED_INT&&(Z=i.R32UI),B===i.BYTE&&(Z=i.R8I),B===i.SHORT&&(Z=i.R16I),B===i.INT&&(Z=i.R32I)),x===i.RG&&(B===i.FLOAT&&(Z=i.RG32F),B===i.HALF_FLOAT&&(Z=i.RG16F),B===i.UNSIGNED_BYTE&&(Z=i.RG8),B===i.UNSIGNED_SHORT&&de&&(Z=de.RG16_EXT),B===i.SHORT&&de&&(Z=de.RG16_SNORM_EXT)),x===i.RG_INTEGER&&(B===i.UNSIGNED_BYTE&&(Z=i.RG8UI),B===i.UNSIGNED_SHORT&&(Z=i.RG16UI),B===i.UNSIGNED_INT&&(Z=i.RG32UI),B===i.BYTE&&(Z=i.RG8I),B===i.SHORT&&(Z=i.RG16I),B===i.INT&&(Z=i.RG32I)),x===i.RGB_INTEGER&&(B===i.UNSIGNED_BYTE&&(Z=i.RGB8UI),B===i.UNSIGNED_SHORT&&(Z=i.RGB16UI),B===i.UNSIGNED_INT&&(Z=i.RGB32UI),B===i.BYTE&&(Z=i.RGB8I),B===i.SHORT&&(Z=i.RGB16I),B===i.INT&&(Z=i.RGB32I)),x===i.RGBA_INTEGER&&(B===i.UNSIGNED_BYTE&&(Z=i.RGBA8UI),B===i.UNSIGNED_SHORT&&(Z=i.RGBA16UI),B===i.UNSIGNED_INT&&(Z=i.RGBA32UI),B===i.BYTE&&(Z=i.RGBA8I),B===i.SHORT&&(Z=i.RGBA16I),B===i.INT&&(Z=i.RGBA32I)),x===i.RGB&&(B===i.UNSIGNED_SHORT&&de&&(Z=de.RGB16_EXT),B===i.SHORT&&de&&(Z=de.RGB16_SNORM_EXT),B===i.UNSIGNED_INT_5_9_9_9_REV&&(Z=i.RGB9_E5),B===i.UNSIGNED_INT_10F_11F_11F_REV&&(Z=i.R11F_G11F_B10F)),x===i.RGBA){const ee=oe?_o:Xe.getTransfer(K);B===i.FLOAT&&(Z=i.RGBA32F),B===i.HALF_FLOAT&&(Z=i.RGBA16F),B===i.UNSIGNED_BYTE&&(Z=ee===tt?i.SRGB8_ALPHA8:i.RGBA8),B===i.UNSIGNED_SHORT&&de&&(Z=de.RGBA16_EXT),B===i.SHORT&&de&&(Z=de.RGBA16_SNORM_EXT),B===i.UNSIGNED_SHORT_4_4_4_4&&(Z=i.RGBA4),B===i.UNSIGNED_SHORT_5_5_5_1&&(Z=i.RGB5_A1)}return(Z===i.R16F||Z===i.R32F||Z===i.RG16F||Z===i.RG32F||Z===i.RGBA16F||Z===i.RGBA32F)&&e.get("EXT_color_buffer_float"),Z}function T(C,x){let B;return C?x===null||x===Yn||x===zr?B=i.DEPTH24_STENCIL8:x===Cn?B=i.DEPTH32F_STENCIL8:x===Br&&(B=i.DEPTH24_STENCIL8,Pe("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):x===null||x===Yn||x===zr?B=i.DEPTH_COMPONENT24:x===Cn?B=i.DEPTH_COMPONENT32F:x===Br&&(B=i.DEPTH_COMPONENT16),B}function M(C,x){return p(C)===!0||C.isFramebufferTexture&&C.minFilter!==zt&&C.minFilter!==Pt?Math.log2(Math.max(x.width,x.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?x.mipmaps.length:1}function w(C){const x=C.target;x.removeEventListener("dispose",w),y(x),x.isVideoTexture&&u.delete(x),x.isHTMLTexture&&h.delete(x)}function _(C){const x=C.target;x.removeEventListener("dispose",_),R(x)}function y(C){const x=n.get(C);if(x.__webglInit===void 0)return;const B=C.source,W=f.get(B);if(W){const K=W[x.__cacheKey];K.usedTimes--,K.usedTimes===0&&P(C),Object.keys(W).length===0&&f.delete(B)}n.remove(C)}function P(C){const x=n.get(C);i.deleteTexture(x.__webglTexture);const B=C.source,W=f.get(B);delete W[x.__cacheKey],a.memory.textures--}function R(C){const x=n.get(C);if(C.depthTexture&&(C.depthTexture.dispose(),n.remove(C.depthTexture)),C.isWebGLCubeRenderTarget)for(let W=0;W<6;W++){if(Array.isArray(x.__webglFramebuffer[W]))for(let K=0;K<x.__webglFramebuffer[W].length;K++)i.deleteFramebuffer(x.__webglFramebuffer[W][K]);else i.deleteFramebuffer(x.__webglFramebuffer[W]);x.__webglDepthbuffer&&i.deleteRenderbuffer(x.__webglDepthbuffer[W])}else{if(Array.isArray(x.__webglFramebuffer))for(let W=0;W<x.__webglFramebuffer.length;W++)i.deleteFramebuffer(x.__webglFramebuffer[W]);else i.deleteFramebuffer(x.__webglFramebuffer);if(x.__webglDepthbuffer&&i.deleteRenderbuffer(x.__webglDepthbuffer),x.__webglMultisampledFramebuffer&&i.deleteFramebuffer(x.__webglMultisampledFramebuffer),x.__webglColorRenderbuffer)for(let W=0;W<x.__webglColorRenderbuffer.length;W++)x.__webglColorRenderbuffer[W]&&i.deleteRenderbuffer(x.__webglColorRenderbuffer[W]);x.__webglDepthRenderbuffer&&i.deleteRenderbuffer(x.__webglDepthRenderbuffer)}const B=C.textures;for(let W=0,K=B.length;W<K;W++){const oe=n.get(B[W]);oe.__webglTexture&&(i.deleteTexture(oe.__webglTexture),a.memory.textures--),n.remove(B[W])}n.remove(C)}let L=0;function z(){L=0}function X(){return L}function O(C){L=C}function N(){const C=L;return C>=s.maxTextures&&Pe("WebGLTextures: Trying to use "+C+" texture units while this GPU supports only "+s.maxTextures),L+=1,C}function V(C){const x=[];return x.push(C.wrapS),x.push(C.wrapT),x.push(C.wrapR||0),x.push(C.magFilter),x.push(C.minFilter),x.push(C.anisotropy),x.push(C.internalFormat),x.push(C.format),x.push(C.type),x.push(C.generateMipmaps),x.push(C.premultiplyAlpha),x.push(C.flipY),x.push(C.unpackAlignment),x.push(C.colorSpace),x.join()}function $(C,x){const B=n.get(C);if(C.isVideoTexture&&U(C),C.isRenderTargetTexture===!1&&C.isExternalTexture!==!0&&C.version>0&&B.__version!==C.version){const W=C.image;if(W===null)Pe("WebGLRenderer: Texture marked for update but no image data found.");else if(W.complete===!1)Pe("WebGLRenderer: Texture marked for update but image is incomplete");else{Ae(B,C,x);return}}else C.isExternalTexture&&(B.__webglTexture=C.sourceTexture?C.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,B.__webglTexture,i.TEXTURE0+x)}function j(C,x){const B=n.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&B.__version!==C.version){Ae(B,C,x);return}else C.isExternalTexture&&(B.__webglTexture=C.sourceTexture?C.sourceTexture:null);t.bindTexture(i.TEXTURE_2D_ARRAY,B.__webglTexture,i.TEXTURE0+x)}function re(C,x){const B=n.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&B.__version!==C.version){Ae(B,C,x);return}t.bindTexture(i.TEXTURE_3D,B.__webglTexture,i.TEXTURE0+x)}function se(C,x){const B=n.get(C);if(C.isCubeDepthTexture!==!0&&C.version>0&&B.__version!==C.version){Fe(B,C,x);return}t.bindTexture(i.TEXTURE_CUBE_MAP,B.__webglTexture,i.TEXTURE0+x)}const ae={[ds]:i.REPEAT,[dn]:i.CLAMP_TO_EDGE,[cc]:i.MIRRORED_REPEAT},xe={[zt]:i.NEAREST,[Fm]:i.NEAREST_MIPMAP_NEAREST,[pa]:i.NEAREST_MIPMAP_LINEAR,[Pt]:i.LINEAR,[il]:i.LINEAR_MIPMAP_NEAREST,[oi]:i.LINEAR_MIPMAP_LINEAR},be={[zm]:i.NEVER,[Xm]:i.ALWAYS,[Vm]:i.LESS,[dd]:i.LEQUAL,[Gm]:i.EQUAL,[ud]:i.GEQUAL,[Hm]:i.GREATER,[Wm]:i.NOTEQUAL};function le(C,x){if(x.type===Cn&&e.has("OES_texture_float_linear")===!1&&(x.magFilter===Pt||x.magFilter===il||x.magFilter===pa||x.magFilter===oi||x.minFilter===Pt||x.minFilter===il||x.minFilter===pa||x.minFilter===oi)&&Pe("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(C,i.TEXTURE_WRAP_S,ae[x.wrapS]),i.texParameteri(C,i.TEXTURE_WRAP_T,ae[x.wrapT]),(C===i.TEXTURE_3D||C===i.TEXTURE_2D_ARRAY)&&i.texParameteri(C,i.TEXTURE_WRAP_R,ae[x.wrapR]),i.texParameteri(C,i.TEXTURE_MAG_FILTER,xe[x.magFilter]),i.texParameteri(C,i.TEXTURE_MIN_FILTER,xe[x.minFilter]),x.compareFunction&&(i.texParameteri(C,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(C,i.TEXTURE_COMPARE_FUNC,be[x.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(x.magFilter===zt||x.minFilter!==pa&&x.minFilter!==oi||x.type===Cn&&e.has("OES_texture_float_linear")===!1)return;if(x.anisotropy>1||n.get(x).__currentAnisotropy){const B=e.get("EXT_texture_filter_anisotropic");i.texParameterf(C,B.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(x.anisotropy,s.getMaxAnisotropy())),n.get(x).__currentAnisotropy=x.anisotropy}}}function k(C,x){let B=!1;C.__webglInit===void 0&&(C.__webglInit=!0,x.addEventListener("dispose",w));const W=x.source;let K=f.get(W);K===void 0&&(K={},f.set(W,K));const oe=V(x);if(oe!==C.__cacheKey){K[oe]===void 0&&(K[oe]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,B=!0),K[oe].usedTimes++;const de=K[C.__cacheKey];de!==void 0&&(K[C.__cacheKey].usedTimes--,de.usedTimes===0&&P(x)),C.__cacheKey=oe,C.__webglTexture=K[oe].texture}return B}function J(C,x,B){return Math.floor(Math.floor(C/B)/x)}function te(C,x,B,W){const oe=C.updateRanges;if(oe.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,x.width,x.height,B,W,x.data);else{oe.sort((we,pe)=>we.start-pe.start);let de=0;for(let we=1;we<oe.length;we++){const pe=oe[de],he=oe[we],Le=pe.start+pe.count,De=J(he.start,x.width,4),ze=J(pe.start,x.width,4);he.start<=Le+1&&De===ze&&J(he.start+he.count-1,x.width,4)===De?pe.count=Math.max(pe.count,he.start+he.count-pe.start):(++de,oe[de]=he)}oe.length=de+1;const Z=t.getParameter(i.UNPACK_ROW_LENGTH),ee=t.getParameter(i.UNPACK_SKIP_PIXELS),ue=t.getParameter(i.UNPACK_SKIP_ROWS);t.pixelStorei(i.UNPACK_ROW_LENGTH,x.width);for(let we=0,pe=oe.length;we<pe;we++){const he=oe[we],Le=Math.floor(he.start/4),De=Math.ceil(he.count/4),ze=Le%x.width,D=Math.floor(Le/x.width),ce=De,Q=1;t.pixelStorei(i.UNPACK_SKIP_PIXELS,ze),t.pixelStorei(i.UNPACK_SKIP_ROWS,D),t.texSubImage2D(i.TEXTURE_2D,0,ze,D,ce,Q,B,W,x.data)}C.clearUpdateRanges(),t.pixelStorei(i.UNPACK_ROW_LENGTH,Z),t.pixelStorei(i.UNPACK_SKIP_PIXELS,ee),t.pixelStorei(i.UNPACK_SKIP_ROWS,ue)}}function Ae(C,x,B){let W=i.TEXTURE_2D;(x.isDataArrayTexture||x.isCompressedArrayTexture)&&(W=i.TEXTURE_2D_ARRAY),x.isData3DTexture&&(W=i.TEXTURE_3D);const K=k(C,x),oe=x.source;t.bindTexture(W,C.__webglTexture,i.TEXTURE0+B);const de=n.get(oe);if(oe.version!==de.__version||K===!0){if(t.activeTexture(i.TEXTURE0+B),(typeof ImageBitmap<"u"&&x.image instanceof ImageBitmap)===!1){const Q=Xe.getPrimaries(Xe.workingColorSpace),fe=x.colorSpace===Di?null:Xe.getPrimaries(x.colorSpace),ve=x.colorSpace===Di||Q===fe?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,x.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ve)}t.pixelStorei(i.UNPACK_ALIGNMENT,x.unpackAlignment);let ee=m(x.image,!1,s.maxTextureSize);ee=Qt(x,ee);const ue=r.convert(x.format,x.colorSpace),we=r.convert(x.type);let pe=b(x.internalFormat,ue,we,x.normalized,x.colorSpace,x.isVideoTexture);le(W,x);let he;const Le=x.mipmaps,De=x.isVideoTexture!==!0,ze=de.__version===void 0||K===!0,D=oe.dataReady,ce=M(x,ee);if(x.isDepthTexture)pe=T(x.format===us,x.type),ze&&(De?t.texStorage2D(i.TEXTURE_2D,1,pe,ee.width,ee.height):t.texImage2D(i.TEXTURE_2D,0,pe,ee.width,ee.height,0,ue,we,null));else if(x.isDataTexture)if(Le.length>0){De&&ze&&t.texStorage2D(i.TEXTURE_2D,ce,pe,Le[0].width,Le[0].height);for(let Q=0,fe=Le.length;Q<fe;Q++)he=Le[Q],De?D&&t.texSubImage2D(i.TEXTURE_2D,Q,0,0,he.width,he.height,ue,we,he.data):t.texImage2D(i.TEXTURE_2D,Q,pe,he.width,he.height,0,ue,we,he.data);x.generateMipmaps=!1}else De?(ze&&t.texStorage2D(i.TEXTURE_2D,ce,pe,ee.width,ee.height),D&&te(x,ee,ue,we)):t.texImage2D(i.TEXTURE_2D,0,pe,ee.width,ee.height,0,ue,we,ee.data);else if(x.isCompressedTexture)if(x.isCompressedArrayTexture){De&&ze&&t.texStorage3D(i.TEXTURE_2D_ARRAY,ce,pe,Le[0].width,Le[0].height,ee.depth);for(let Q=0,fe=Le.length;Q<fe;Q++)if(he=Le[Q],x.format!==vn)if(ue!==null)if(De){if(D)if(x.layerUpdates.size>0){const ve=hh(he.width,he.height,x.format,x.type);for(const ie of x.layerUpdates){const Te=he.data.subarray(ie*ve/he.data.BYTES_PER_ELEMENT,(ie+1)*ve/he.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,Q,0,0,ie,he.width,he.height,1,ue,Te)}x.clearLayerUpdates()}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,Q,0,0,0,he.width,he.height,ee.depth,ue,he.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,Q,pe,he.width,he.height,ee.depth,0,he.data,0,0);else Pe("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else De?D&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,Q,0,0,0,he.width,he.height,ee.depth,ue,we,he.data):t.texImage3D(i.TEXTURE_2D_ARRAY,Q,pe,he.width,he.height,ee.depth,0,ue,we,he.data)}else{De&&ze&&t.texStorage2D(i.TEXTURE_2D,ce,pe,Le[0].width,Le[0].height);for(let Q=0,fe=Le.length;Q<fe;Q++)he=Le[Q],x.format!==vn?ue!==null?De?D&&t.compressedTexSubImage2D(i.TEXTURE_2D,Q,0,0,he.width,he.height,ue,he.data):t.compressedTexImage2D(i.TEXTURE_2D,Q,pe,he.width,he.height,0,he.data):Pe("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):De?D&&t.texSubImage2D(i.TEXTURE_2D,Q,0,0,he.width,he.height,ue,we,he.data):t.texImage2D(i.TEXTURE_2D,Q,pe,he.width,he.height,0,ue,we,he.data)}else if(x.isDataArrayTexture)if(De){if(ze&&t.texStorage3D(i.TEXTURE_2D_ARRAY,ce,pe,ee.width,ee.height,ee.depth),D)if(x.layerUpdates.size>0){const Q=hh(ee.width,ee.height,x.format,x.type);for(const fe of x.layerUpdates){const ve=ee.data.subarray(fe*Q/ee.data.BYTES_PER_ELEMENT,(fe+1)*Q/ee.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,fe,ee.width,ee.height,1,ue,we,ve)}x.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,ee.width,ee.height,ee.depth,ue,we,ee.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,pe,ee.width,ee.height,ee.depth,0,ue,we,ee.data);else if(x.isData3DTexture)De?(ze&&t.texStorage3D(i.TEXTURE_3D,ce,pe,ee.width,ee.height,ee.depth),D&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,ee.width,ee.height,ee.depth,ue,we,ee.data)):t.texImage3D(i.TEXTURE_3D,0,pe,ee.width,ee.height,ee.depth,0,ue,we,ee.data);else if(x.isFramebufferTexture){if(ze)if(De)t.texStorage2D(i.TEXTURE_2D,ce,pe,ee.width,ee.height);else{let Q=ee.width,fe=ee.height;for(let ve=0;ve<ce;ve++)t.texImage2D(i.TEXTURE_2D,ve,pe,Q,fe,0,ue,we,null),Q>>=1,fe>>=1}}else if(x.isHTMLTexture){if("texElementImage2D"in i){const Q=i.canvas;if(Q.hasAttribute("layoutsubtree")||Q.setAttribute("layoutsubtree","true"),ee.parentNode!==Q){Q.appendChild(ee),h.add(x),Q.onpaint=fe=>{const ve=fe.changedElements;for(const ie of h)ve.includes(ie.image)&&(ie.needsUpdate=!0)},Q.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,ee);else{const ve=i.RGBA,ie=i.RGBA,Te=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,ve,ie,Te,ee)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(Le.length>0){if(De&&ze){const Q=et(Le[0]);t.texStorage2D(i.TEXTURE_2D,ce,pe,Q.width,Q.height)}for(let Q=0,fe=Le.length;Q<fe;Q++)he=Le[Q],De?D&&t.texSubImage2D(i.TEXTURE_2D,Q,0,0,ue,we,he):t.texImage2D(i.TEXTURE_2D,Q,pe,ue,we,he);x.generateMipmaps=!1}else if(De){if(ze){const Q=et(ee);t.texStorage2D(i.TEXTURE_2D,ce,pe,Q.width,Q.height)}D&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,ue,we,ee)}else t.texImage2D(i.TEXTURE_2D,0,pe,ue,we,ee);p(x)&&S(W),de.__version=oe.version,x.onUpdate&&x.onUpdate(x)}C.__version=x.version}function Fe(C,x,B){if(x.image.length!==6)return;const W=k(C,x),K=x.source;t.bindTexture(i.TEXTURE_CUBE_MAP,C.__webglTexture,i.TEXTURE0+B);const oe=n.get(K);if(K.version!==oe.__version||W===!0){t.activeTexture(i.TEXTURE0+B);const de=Xe.getPrimaries(Xe.workingColorSpace),Z=x.colorSpace===Di?null:Xe.getPrimaries(x.colorSpace),ee=x.colorSpace===Di||de===Z?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,x.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),t.pixelStorei(i.UNPACK_ALIGNMENT,x.unpackAlignment),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ee);const ue=x.isCompressedTexture||x.image[0].isCompressedTexture,we=x.image[0]&&x.image[0].isDataTexture,pe=[];for(let ie=0;ie<6;ie++)!ue&&!we?pe[ie]=m(x.image[ie],!0,s.maxCubemapSize):pe[ie]=we?x.image[ie].image:x.image[ie],pe[ie]=Qt(x,pe[ie]);const he=pe[0],Le=r.convert(x.format,x.colorSpace),De=r.convert(x.type),ze=b(x.internalFormat,Le,De,x.normalized,x.colorSpace),D=x.isVideoTexture!==!0,ce=oe.__version===void 0||W===!0,Q=K.dataReady;let fe=M(x,he);le(i.TEXTURE_CUBE_MAP,x);let ve;if(ue){D&&ce&&t.texStorage2D(i.TEXTURE_CUBE_MAP,fe,ze,he.width,he.height);for(let ie=0;ie<6;ie++){ve=pe[ie].mipmaps;for(let Te=0;Te<ve.length;Te++){const Se=ve[Te];x.format!==vn?Le!==null?D?Q&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Te,0,0,Se.width,Se.height,Le,Se.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Te,ze,Se.width,Se.height,0,Se.data):Pe("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):D?Q&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Te,0,0,Se.width,Se.height,Le,De,Se.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Te,ze,Se.width,Se.height,0,Le,De,Se.data)}}}else{if(ve=x.mipmaps,D&&ce){ve.length>0&&fe++;const ie=et(pe[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,fe,ze,ie.width,ie.height)}for(let ie=0;ie<6;ie++)if(we){D?Q&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,0,0,pe[ie].width,pe[ie].height,Le,De,pe[ie].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,ze,pe[ie].width,pe[ie].height,0,Le,De,pe[ie].data);for(let Te=0;Te<ve.length;Te++){const ft=ve[Te].image[ie].image;D?Q&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Te+1,0,0,ft.width,ft.height,Le,De,ft.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Te+1,ze,ft.width,ft.height,0,Le,De,ft.data)}}else{D?Q&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,0,0,Le,De,pe[ie]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,ze,Le,De,pe[ie]);for(let Te=0;Te<ve.length;Te++){const Se=ve[Te];D?Q&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Te+1,0,0,Le,De,Se.image[ie]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Te+1,ze,Le,De,Se.image[ie])}}}p(x)&&S(i.TEXTURE_CUBE_MAP),oe.__version=K.version,x.onUpdate&&x.onUpdate(x)}C.__version=x.version}function Ie(C,x,B,W,K,oe){const de=r.convert(B.format,B.colorSpace),Z=r.convert(B.type),ee=b(B.internalFormat,de,Z,B.normalized,B.colorSpace),ue=n.get(x),we=n.get(B);if(we.__renderTarget=x,!ue.__hasExternalTextures){const pe=Math.max(1,x.width>>oe),he=Math.max(1,x.height>>oe);K===i.TEXTURE_3D||K===i.TEXTURE_2D_ARRAY?t.texImage3D(K,oe,ee,pe,he,x.depth,0,de,Z,null):t.texImage2D(K,oe,ee,pe,he,0,de,Z,null)}t.bindFramebuffer(i.FRAMEBUFFER,C),St(x)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,W,K,we.__webglTexture,0,ht(x)):(K===i.TEXTURE_2D||K>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&K<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,W,K,we.__webglTexture,oe),t.bindFramebuffer(i.FRAMEBUFFER,null)}function vt(C,x,B){if(i.bindRenderbuffer(i.RENDERBUFFER,C),x.depthBuffer){const W=x.depthTexture,K=W&&W.isDepthTexture?W.type:null,oe=T(x.stencilBuffer,K),de=x.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;St(x)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ht(x),oe,x.width,x.height):B?i.renderbufferStorageMultisample(i.RENDERBUFFER,ht(x),oe,x.width,x.height):i.renderbufferStorage(i.RENDERBUFFER,oe,x.width,x.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,de,i.RENDERBUFFER,C)}else{const W=x.textures;for(let K=0;K<W.length;K++){const oe=W[K],de=r.convert(oe.format,oe.colorSpace),Z=r.convert(oe.type),ee=b(oe.internalFormat,de,Z,oe.normalized,oe.colorSpace);St(x)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ht(x),ee,x.width,x.height):B?i.renderbufferStorageMultisample(i.RENDERBUFFER,ht(x),ee,x.width,x.height):i.renderbufferStorage(i.RENDERBUFFER,ee,x.width,x.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Ye(C,x,B){const W=x.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(i.FRAMEBUFFER,C),!(x.depthTexture&&x.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");const K=n.get(x.depthTexture);if(K.__renderTarget=x,(!K.__webglTexture||x.depthTexture.image.width!==x.width||x.depthTexture.image.height!==x.height)&&(x.depthTexture.image.width=x.width,x.depthTexture.image.height=x.height,x.depthTexture.needsUpdate=!0),W){if(K.__webglInit===void 0&&(K.__webglInit=!0,x.depthTexture.addEventListener("dispose",w)),K.__webglTexture===void 0){K.__webglTexture=i.createTexture(),t.bindTexture(i.TEXTURE_CUBE_MAP,K.__webglTexture),le(i.TEXTURE_CUBE_MAP,x.depthTexture);const ue=r.convert(x.depthTexture.format),we=r.convert(x.depthTexture.type);let pe;x.depthTexture.format===_i?pe=i.DEPTH_COMPONENT24:x.depthTexture.format===us&&(pe=i.DEPTH24_STENCIL8);for(let he=0;he<6;he++)i.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+he,0,pe,x.width,x.height,0,ue,we,null)}}else $(x.depthTexture,0);const oe=K.__webglTexture,de=ht(x),Z=W?i.TEXTURE_CUBE_MAP_POSITIVE_X+B:i.TEXTURE_2D,ee=x.depthTexture.format===us?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(x.depthTexture.format===_i)St(x)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ee,Z,oe,0,de):i.framebufferTexture2D(i.FRAMEBUFFER,ee,Z,oe,0);else if(x.depthTexture.format===us)St(x)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ee,Z,oe,0,de):i.framebufferTexture2D(i.FRAMEBUFFER,ee,Z,oe,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function rt(C){const x=n.get(C),B=C.isWebGLCubeRenderTarget===!0;if(x.__boundDepthTexture!==C.depthTexture){const W=C.depthTexture;if(x.__depthDisposeCallback&&x.__depthDisposeCallback(),W){const K=()=>{delete x.__boundDepthTexture,delete x.__depthDisposeCallback,W.removeEventListener("dispose",K)};W.addEventListener("dispose",K),x.__depthDisposeCallback=K}x.__boundDepthTexture=W}if(C.depthTexture&&!x.__autoAllocateDepthBuffer)if(B)for(let W=0;W<6;W++)Ye(x.__webglFramebuffer[W],C,W);else{const W=C.texture.mipmaps;W&&W.length>0?Ye(x.__webglFramebuffer[0],C,0):Ye(x.__webglFramebuffer,C,0)}else if(B){x.__webglDepthbuffer=[];for(let W=0;W<6;W++)if(t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer[W]),x.__webglDepthbuffer[W]===void 0)x.__webglDepthbuffer[W]=i.createRenderbuffer(),vt(x.__webglDepthbuffer[W],C,!1);else{const K=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,oe=x.__webglDepthbuffer[W];i.bindRenderbuffer(i.RENDERBUFFER,oe),i.framebufferRenderbuffer(i.FRAMEBUFFER,K,i.RENDERBUFFER,oe)}}else{const W=C.texture.mipmaps;if(W&&W.length>0?t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer),x.__webglDepthbuffer===void 0)x.__webglDepthbuffer=i.createRenderbuffer(),vt(x.__webglDepthbuffer,C,!1);else{const K=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,oe=x.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,oe),i.framebufferRenderbuffer(i.FRAMEBUFFER,K,i.RENDERBUFFER,oe)}}t.bindFramebuffer(i.FRAMEBUFFER,null)}function Je(C,x,B){const W=n.get(C);x!==void 0&&Ie(W.__webglFramebuffer,C,C.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),B!==void 0&&rt(C)}function Ke(C){const x=C.texture,B=n.get(C),W=n.get(x);C.addEventListener("dispose",_);const K=C.textures,oe=C.isWebGLCubeRenderTarget===!0,de=K.length>1;if(de||(W.__webglTexture===void 0&&(W.__webglTexture=i.createTexture()),W.__version=x.version,a.memory.textures++),oe){B.__webglFramebuffer=[];for(let Z=0;Z<6;Z++)if(x.mipmaps&&x.mipmaps.length>0){B.__webglFramebuffer[Z]=[];for(let ee=0;ee<x.mipmaps.length;ee++)B.__webglFramebuffer[Z][ee]=i.createFramebuffer()}else B.__webglFramebuffer[Z]=i.createFramebuffer()}else{if(x.mipmaps&&x.mipmaps.length>0){B.__webglFramebuffer=[];for(let Z=0;Z<x.mipmaps.length;Z++)B.__webglFramebuffer[Z]=i.createFramebuffer()}else B.__webglFramebuffer=i.createFramebuffer();if(de)for(let Z=0,ee=K.length;Z<ee;Z++){const ue=n.get(K[Z]);ue.__webglTexture===void 0&&(ue.__webglTexture=i.createTexture(),a.memory.textures++)}if(C.samples>0&&St(C)===!1){B.__webglMultisampledFramebuffer=i.createFramebuffer(),B.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,B.__webglMultisampledFramebuffer);for(let Z=0;Z<K.length;Z++){const ee=K[Z];B.__webglColorRenderbuffer[Z]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,B.__webglColorRenderbuffer[Z]);const ue=r.convert(ee.format,ee.colorSpace),we=r.convert(ee.type),pe=b(ee.internalFormat,ue,we,ee.normalized,ee.colorSpace,C.isXRRenderTarget===!0),he=ht(C);i.renderbufferStorageMultisample(i.RENDERBUFFER,he,pe,C.width,C.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Z,i.RENDERBUFFER,B.__webglColorRenderbuffer[Z])}i.bindRenderbuffer(i.RENDERBUFFER,null),C.depthBuffer&&(B.__webglDepthRenderbuffer=i.createRenderbuffer(),vt(B.__webglDepthRenderbuffer,C,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(oe){t.bindTexture(i.TEXTURE_CUBE_MAP,W.__webglTexture),le(i.TEXTURE_CUBE_MAP,x);for(let Z=0;Z<6;Z++)if(x.mipmaps&&x.mipmaps.length>0)for(let ee=0;ee<x.mipmaps.length;ee++)Ie(B.__webglFramebuffer[Z][ee],C,x,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,ee);else Ie(B.__webglFramebuffer[Z],C,x,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0);p(x)&&S(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(de){for(let Z=0,ee=K.length;Z<ee;Z++){const ue=K[Z],we=n.get(ue);let pe=i.TEXTURE_2D;(C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(pe=C.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(pe,we.__webglTexture),le(pe,ue),Ie(B.__webglFramebuffer,C,ue,i.COLOR_ATTACHMENT0+Z,pe,0),p(ue)&&S(pe)}t.unbindTexture()}else{let Z=i.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(Z=C.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(Z,W.__webglTexture),le(Z,x),x.mipmaps&&x.mipmaps.length>0)for(let ee=0;ee<x.mipmaps.length;ee++)Ie(B.__webglFramebuffer[ee],C,x,i.COLOR_ATTACHMENT0,Z,ee);else Ie(B.__webglFramebuffer,C,x,i.COLOR_ATTACHMENT0,Z,0);p(x)&&S(Z),t.unbindTexture()}C.depthBuffer&&rt(C)}function Mt(C){const x=C.textures;for(let B=0,W=x.length;B<W;B++){const K=x[B];if(p(K)){const oe=A(C),de=n.get(K).__webglTexture;t.bindTexture(oe,de),S(oe),t.unbindTexture()}}}const At=[],It=[];function Ft(C){if(C.samples>0){if(St(C)===!1){const x=C.textures,B=C.width,W=C.height;let K=i.COLOR_BUFFER_BIT;const oe=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,de=n.get(C),Z=x.length>1;if(Z)for(let ue=0;ue<x.length;ue++)t.bindFramebuffer(i.FRAMEBUFFER,de.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ue,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,de.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ue,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,de.__webglMultisampledFramebuffer);const ee=C.texture.mipmaps;ee&&ee.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,de.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,de.__webglFramebuffer);for(let ue=0;ue<x.length;ue++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(K|=i.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(K|=i.STENCIL_BUFFER_BIT)),Z){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,de.__webglColorRenderbuffer[ue]);const we=n.get(x[ue]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,we,0)}i.blitFramebuffer(0,0,B,W,0,0,B,W,K,i.NEAREST),l===!0&&(At.length=0,It.length=0,At.push(i.COLOR_ATTACHMENT0+ue),C.depthBuffer&&C.resolveDepthBuffer===!1&&(At.push(oe),It.push(oe),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,It)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,At))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),Z)for(let ue=0;ue<x.length;ue++){t.bindFramebuffer(i.FRAMEBUFFER,de.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ue,i.RENDERBUFFER,de.__webglColorRenderbuffer[ue]);const we=n.get(x[ue]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,de.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ue,i.TEXTURE_2D,we,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,de.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.resolveDepthBuffer===!1&&l){const x=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[x])}}}function ht(C){return Math.min(s.maxSamples,C.samples)}function St(C){const x=n.get(C);return C.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&x.__useRenderToTexture!==!1}function U(C){const x=a.render.frame;u.get(C)!==x&&(u.set(C,x),C.update())}function Qt(C,x){const B=C.colorSpace,W=C.format,K=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||B!==go&&B!==Di&&(Xe.getTransfer(B)===tt?(W!==vn||K!==cn)&&Pe("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):He("WebGLTextures: Unsupported texture color space:",B)),x}function et(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(c.width=C.naturalWidth||C.width,c.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(c.width=C.displayWidth,c.height=C.displayHeight):(c.width=C.width,c.height=C.height),c}this.allocateTextureUnit=N,this.resetTextureUnits=z,this.getTextureUnits=X,this.setTextureUnits=O,this.setTexture2D=$,this.setTexture2DArray=j,this.setTexture3D=re,this.setTextureCube=se,this.rebindTextures=Je,this.setupRenderTarget=Ke,this.updateRenderTargetMipmap=Mt,this.updateMultisampleRenderTarget=Ft,this.setupDepthRenderbuffer=rt,this.setupFrameBufferTexture=Ie,this.useMultisampledRTT=St,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function yy(i,e){function t(n,s=Di){let r;const a=Xe.getTransfer(s);if(n===cn)return i.UNSIGNED_BYTE;if(n===rd)return i.UNSIGNED_SHORT_4_4_4_4;if(n===ad)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Rf)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Cf)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===Af)return i.BYTE;if(n===wf)return i.SHORT;if(n===Br)return i.UNSIGNED_SHORT;if(n===sd)return i.INT;if(n===Yn)return i.UNSIGNED_INT;if(n===Cn)return i.FLOAT;if(n===gi)return i.HALF_FLOAT;if(n===Pf)return i.ALPHA;if(n===Lf)return i.RGB;if(n===vn)return i.RGBA;if(n===_i)return i.DEPTH_COMPONENT;if(n===us)return i.DEPTH_STENCIL;if(n===Nf)return i.RED;if(n===od)return i.RED_INTEGER;if(n===bs)return i.RG;if(n===ld)return i.RG_INTEGER;if(n===cd)return i.RGBA_INTEGER;if(n===eo||n===to||n===no||n===io)if(a===tt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===eo)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===to)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===no)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===io)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===eo)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===to)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===no)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===io)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===dc||n===uc||n===hc||n===fc)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===dc)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===uc)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===hc)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===fc)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===pc||n===mc||n===gc||n===_c||n===vc||n===po||n===xc)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===pc||n===mc)return a===tt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===gc)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===_c)return r.COMPRESSED_R11_EAC;if(n===vc)return r.COMPRESSED_SIGNED_R11_EAC;if(n===po)return r.COMPRESSED_RG11_EAC;if(n===xc)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===bc||n===yc||n===Mc||n===Sc||n===Ec||n===Tc||n===Ac||n===wc||n===Rc||n===Cc||n===Pc||n===Lc||n===Nc||n===Ic)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===bc)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===yc)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Mc)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Sc)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Ec)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Tc)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Ac)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===wc)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Rc)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Cc)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Pc)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Lc)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Nc)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Ic)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Dc||n===Uc||n===Fc)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===Dc)return a===tt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Uc)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Fc)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Oc||n===kc||n===mo||n===Bc)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===Oc)return r.COMPRESSED_RED_RGTC1_EXT;if(n===kc)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===mo)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Bc)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===zr?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}const My=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Sy=`
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

}`;class Ey{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const n=new Gf(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new Kn({vertexShader:My,fragmentShader:Sy,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new gt(new Go(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class Ty extends Zi{constructor(e,t){super();const n=this;let s=null,r=1,a=null,o="local-floor",l=1,c=null,u=null,h=null,d=null,f=null,g=null;const v=typeof XRWebGLBinding<"u",m=new Ey,p={},S=t.getContextAttributes();let A=null,b=null;const T=[],M=[],w=new Ne;let _=null;const y=new Xt;y.viewport=new st;const P=new Xt;P.viewport=new st;const R=[y,P],L=new L_;let z=null,X=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(k){let J=T[k];return J===void 0&&(J=new dl,T[k]=J),J.getTargetRaySpace()},this.getControllerGrip=function(k){let J=T[k];return J===void 0&&(J=new dl,T[k]=J),J.getGripSpace()},this.getHand=function(k){let J=T[k];return J===void 0&&(J=new dl,T[k]=J),J.getHandSpace()};function O(k){const J=M.indexOf(k.inputSource);if(J===-1)return;const te=T[J];te!==void 0&&(te.update(k.inputSource,k.frame,c||a),te.dispatchEvent({type:k.type,data:k.inputSource}))}function N(){s.removeEventListener("select",O),s.removeEventListener("selectstart",O),s.removeEventListener("selectend",O),s.removeEventListener("squeeze",O),s.removeEventListener("squeezestart",O),s.removeEventListener("squeezeend",O),s.removeEventListener("end",N),s.removeEventListener("inputsourceschange",V);for(let k=0;k<T.length;k++){const J=M[k];J!==null&&(M[k]=null,T[k].disconnect(J))}z=null,X=null,m.reset();for(const k in p)delete p[k];e.setRenderTarget(A),f=null,d=null,h=null,s=null,b=null,le.stop(),n.isPresenting=!1,e.setPixelRatio(_),e.setSize(w.width,w.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(k){r=k,n.isPresenting===!0&&Pe("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(k){o=k,n.isPresenting===!0&&Pe("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(k){c=k},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return h===null&&v&&(h=new XRWebGLBinding(s,t)),h},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(k){if(s=k,s!==null){if(A=e.getRenderTarget(),s.addEventListener("select",O),s.addEventListener("selectstart",O),s.addEventListener("selectend",O),s.addEventListener("squeeze",O),s.addEventListener("squeezestart",O),s.addEventListener("squeezeend",O),s.addEventListener("end",N),s.addEventListener("inputsourceschange",V),S.xrCompatible!==!0&&await t.makeXRCompatible(),_=e.getPixelRatio(),e.getSize(w),v&&"createProjectionLayer"in XRWebGLBinding.prototype){let te=null,Ae=null,Fe=null;S.depth&&(Fe=S.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,te=S.stencil?us:_i,Ae=S.stencil?zr:Yn);const Ie={colorFormat:t.RGBA8,depthFormat:Fe,scaleFactor:r};h=this.getBinding(),d=h.createProjectionLayer(Ie),s.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),b=new $n(d.textureWidth,d.textureHeight,{format:vn,type:cn,depthTexture:new lr(d.textureWidth,d.textureHeight,Ae,void 0,void 0,void 0,void 0,void 0,void 0,te),stencilBuffer:S.stencil,colorSpace:e.outputColorSpace,samples:S.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}else{const te={antialias:S.antialias,alpha:!0,depth:S.depth,stencil:S.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,t,te),s.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),b=new $n(f.framebufferWidth,f.framebufferHeight,{format:vn,type:cn,colorSpace:e.outputColorSpace,stencilBuffer:S.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}b.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),le.setContext(s),le.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function V(k){for(let J=0;J<k.removed.length;J++){const te=k.removed[J],Ae=M.indexOf(te);Ae>=0&&(M[Ae]=null,T[Ae].disconnect(te))}for(let J=0;J<k.added.length;J++){const te=k.added[J];let Ae=M.indexOf(te);if(Ae===-1){for(let Ie=0;Ie<T.length;Ie++)if(Ie>=M.length){M.push(te),Ae=Ie;break}else if(M[Ie]===null){M[Ie]=te,Ae=Ie;break}if(Ae===-1)break}const Fe=T[Ae];Fe&&Fe.connect(te)}}const $=new I,j=new I;function re(k,J,te){$.setFromMatrixPosition(J.matrixWorld),j.setFromMatrixPosition(te.matrixWorld);const Ae=$.distanceTo(j),Fe=J.projectionMatrix.elements,Ie=te.projectionMatrix.elements,vt=Fe[14]/(Fe[10]-1),Ye=Fe[14]/(Fe[10]+1),rt=(Fe[9]+1)/Fe[5],Je=(Fe[9]-1)/Fe[5],Ke=(Fe[8]-1)/Fe[0],Mt=(Ie[8]+1)/Ie[0],At=vt*Ke,It=vt*Mt,Ft=Ae/(-Ke+Mt),ht=Ft*-Ke;if(J.matrixWorld.decompose(k.position,k.quaternion,k.scale),k.translateX(ht),k.translateZ(Ft),k.matrixWorld.compose(k.position,k.quaternion,k.scale),k.matrixWorldInverse.copy(k.matrixWorld).invert(),Fe[10]===-1)k.projectionMatrix.copy(J.projectionMatrix),k.projectionMatrixInverse.copy(J.projectionMatrixInverse);else{const St=vt+Ft,U=Ye+Ft,Qt=At-ht,et=It+(Ae-ht),C=rt*Ye/U*St,x=Je*Ye/U*St;k.projectionMatrix.makePerspective(Qt,et,C,x,St,U),k.projectionMatrixInverse.copy(k.projectionMatrix).invert()}}function se(k,J){J===null?k.matrixWorld.copy(k.matrix):k.matrixWorld.multiplyMatrices(J.matrixWorld,k.matrix),k.matrixWorldInverse.copy(k.matrixWorld).invert()}this.updateCamera=function(k){if(s===null)return;let J=k.near,te=k.far;m.texture!==null&&(m.depthNear>0&&(J=m.depthNear),m.depthFar>0&&(te=m.depthFar)),L.near=P.near=y.near=J,L.far=P.far=y.far=te,(z!==L.near||X!==L.far)&&(s.updateRenderState({depthNear:L.near,depthFar:L.far}),z=L.near,X=L.far),L.layers.mask=k.layers.mask|6,y.layers.mask=L.layers.mask&-5,P.layers.mask=L.layers.mask&-3;const Ae=k.parent,Fe=L.cameras;se(L,Ae);for(let Ie=0;Ie<Fe.length;Ie++)se(Fe[Ie],Ae);Fe.length===2?re(L,y,P):L.projectionMatrix.copy(y.projectionMatrix),ae(k,L,Ae)};function ae(k,J,te){te===null?k.matrix.copy(J.matrixWorld):(k.matrix.copy(te.matrixWorld),k.matrix.invert(),k.matrix.multiply(J.matrixWorld)),k.matrix.decompose(k.position,k.quaternion,k.scale),k.updateMatrixWorld(!0),k.projectionMatrix.copy(J.projectionMatrix),k.projectionMatrixInverse.copy(J.projectionMatrixInverse),k.isPerspectiveCamera&&(k.fov=or*2*Math.atan(1/k.projectionMatrix.elements[5]),k.zoom=1)}this.getCamera=function(){return L},this.getFoveation=function(){if(!(d===null&&f===null))return l},this.setFoveation=function(k){l=k,d!==null&&(d.fixedFoveation=k),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=k)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(L)},this.getCameraTexture=function(k){return p[k]};let xe=null;function be(k,J){if(u=J.getViewerPose(c||a),g=J,u!==null){const te=u.views;f!==null&&(e.setRenderTargetFramebuffer(b,f.framebuffer),e.setRenderTarget(b));let Ae=!1;te.length!==L.cameras.length&&(L.cameras.length=0,Ae=!0);for(let Ye=0;Ye<te.length;Ye++){const rt=te[Ye];let Je=null;if(f!==null)Je=f.getViewport(rt);else{const Mt=h.getViewSubImage(d,rt);Je=Mt.viewport,Ye===0&&(e.setRenderTargetTextures(b,Mt.colorTexture,Mt.depthStencilTexture),e.setRenderTarget(b))}let Ke=R[Ye];Ke===void 0&&(Ke=new Xt,Ke.layers.enable(Ye),Ke.viewport=new st,R[Ye]=Ke),Ke.matrix.fromArray(rt.transform.matrix),Ke.matrix.decompose(Ke.position,Ke.quaternion,Ke.scale),Ke.projectionMatrix.fromArray(rt.projectionMatrix),Ke.projectionMatrixInverse.copy(Ke.projectionMatrix).invert(),Ke.viewport.set(Je.x,Je.y,Je.width,Je.height),Ye===0&&(L.matrix.copy(Ke.matrix),L.matrix.decompose(L.position,L.quaternion,L.scale)),Ae===!0&&L.cameras.push(Ke)}const Fe=s.enabledFeatures;if(Fe&&Fe.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&v){h=n.getBinding();const Ye=h.getDepthInformation(te[0]);Ye&&Ye.isValid&&Ye.texture&&m.init(Ye,s.renderState)}if(Fe&&Fe.includes("camera-access")&&v){e.state.unbindTexture(),h=n.getBinding();for(let Ye=0;Ye<te.length;Ye++){const rt=te[Ye].camera;if(rt){let Je=p[rt];Je||(Je=new Gf,p[rt]=Je);const Ke=h.getCameraImage(rt);Je.sourceTexture=Ke}}}}for(let te=0;te<T.length;te++){const Ae=M[te],Fe=T[te];Ae!==null&&Fe!==void 0&&Fe.update(Ae,J,c||a)}xe&&xe(k,J),J.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:J}),g=null}const le=new ep;le.setAnimationLoop(be),this.setAnimationLoop=function(k){xe=k},this.dispose=function(){}}}const Ay=new Oe,op=new Be;op.set(-1,0,0,0,1,0,0,0,1);function wy(i,e){function t(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,$f(i)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function s(m,p,S,A,b){p.isNodeMaterial?p.uniformsNeedUpdate=!1:p.isMeshBasicMaterial?r(m,p):p.isMeshLambertMaterial?(r(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshToonMaterial?(r(m,p),h(m,p)):p.isMeshPhongMaterial?(r(m,p),u(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshStandardMaterial?(r(m,p),d(m,p),p.isMeshPhysicalMaterial&&f(m,p,b)):p.isMeshMatcapMaterial?(r(m,p),g(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),v(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(a(m,p),p.isLineDashedMaterial&&o(m,p)):p.isPointsMaterial?l(m,p,S,A):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,t(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===nn&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,t(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===nn&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,t(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,t(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);const S=e.get(p),A=S.envMap,b=S.envMapRotation;A&&(m.envMap.value=A,m.envMapRotation.value.setFromMatrix4(Ay.makeRotationFromEuler(b)).transpose(),A.isCubeTexture&&A.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(op),m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,m.aoMapTransform))}function a(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform))}function o(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,S,A){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*S,m.scale.value=A*.5,p.map&&(m.map.value=p.map,t(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function u(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function h(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function d(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function f(m,p,S){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===nn&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=S.texture,m.transmissionSamplerSize.value.set(S.width,S.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function v(m,p){const S=e.get(p).light;m.referencePosition.value.setFromMatrixPosition(S.matrixWorld),m.nearDistance.value=S.shadow.camera.near,m.farDistance.value=S.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function Ry(i,e,t,n){let s={},r={},a=[];const o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(b,T){const M=T.program;n.uniformBlockBinding(b,M)}function c(b,T){let M=s[b.id];M===void 0&&(m(b),M=u(b),s[b.id]=M,b.addEventListener("dispose",S));const w=T.program;n.updateUBOMapping(b,w);const _=e.render.frame;r[b.id]!==_&&(d(b),r[b.id]=_)}function u(b){const T=h();b.__bindingPointIndex=T;const M=i.createBuffer(),w=b.__size,_=b.usage;return i.bindBuffer(i.UNIFORM_BUFFER,M),i.bufferData(i.UNIFORM_BUFFER,w,_),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,T,M),M}function h(){for(let b=0;b<o;b++)if(a.indexOf(b)===-1)return a.push(b),b;return He("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(b){const T=s[b.id],M=b.uniforms,w=b.__cache;i.bindBuffer(i.UNIFORM_BUFFER,T);for(let _=0,y=M.length;_<y;_++){const P=M[_];if(Array.isArray(P))for(let R=0,L=P.length;R<L;R++)f(P[R],_,R,w);else f(P,_,0,w)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function f(b,T,M,w){if(v(b,T,M,w)===!0){const _=b.__offset,y=b.value;if(Array.isArray(y)){let P=0;for(let R=0;R<y.length;R++){const L=y[R],z=p(L);g(L,b.__data,P),typeof L!="number"&&typeof L!="boolean"&&!L.isMatrix3&&!ArrayBuffer.isView(L)&&(P+=z.storage/Float32Array.BYTES_PER_ELEMENT)}}else g(y,b.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,_,b.__data)}}function g(b,T,M){typeof b=="number"||typeof b=="boolean"?T[0]=b:b.isMatrix3?(T[0]=b.elements[0],T[1]=b.elements[1],T[2]=b.elements[2],T[3]=0,T[4]=b.elements[3],T[5]=b.elements[4],T[6]=b.elements[5],T[7]=0,T[8]=b.elements[6],T[9]=b.elements[7],T[10]=b.elements[8],T[11]=0):ArrayBuffer.isView(b)?T.set(new b.constructor(b.buffer,b.byteOffset,T.length)):b.toArray(T,M)}function v(b,T,M,w){const _=b.value,y=T+"_"+M;if(w[y]===void 0)return typeof _=="number"||typeof _=="boolean"?w[y]=_:ArrayBuffer.isView(_)?w[y]=_.slice():w[y]=_.clone(),!0;{const P=w[y];if(typeof _=="number"||typeof _=="boolean"){if(P!==_)return w[y]=_,!0}else{if(ArrayBuffer.isView(_))return!0;if(P.equals(_)===!1)return P.copy(_),!0}}return!1}function m(b){const T=b.uniforms;let M=0;const w=16;for(let y=0,P=T.length;y<P;y++){const R=Array.isArray(T[y])?T[y]:[T[y]];for(let L=0,z=R.length;L<z;L++){const X=R[L],O=Array.isArray(X.value)?X.value:[X.value];for(let N=0,V=O.length;N<V;N++){const $=O[N],j=p($),re=M%w,se=re%j.boundary,ae=re+se;M+=se,ae!==0&&w-ae<j.storage&&(M+=w-ae),X.__data=new Float32Array(j.storage/Float32Array.BYTES_PER_ELEMENT),X.__offset=M,M+=j.storage}}}const _=M%w;return _>0&&(M+=w-_),b.__size=M,b.__cache={},this}function p(b){const T={boundary:0,storage:0};return typeof b=="number"||typeof b=="boolean"?(T.boundary=4,T.storage=4):b.isVector2?(T.boundary=8,T.storage=8):b.isVector3||b.isColor?(T.boundary=16,T.storage=12):b.isVector4?(T.boundary=16,T.storage=16):b.isMatrix3?(T.boundary=48,T.storage=48):b.isMatrix4?(T.boundary=64,T.storage=64):b.isTexture?Pe("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(b)?(T.boundary=16,T.storage=b.byteLength):Pe("WebGLRenderer: Unsupported uniform value type.",b),T}function S(b){const T=b.target;T.removeEventListener("dispose",S);const M=a.indexOf(T.__bindingPointIndex);a.splice(M,1),i.deleteBuffer(s[T.id]),delete s[T.id],delete r[T.id]}function A(){for(const b in s)i.deleteBuffer(s[b]);a=[],s={},r={}}return{bind:l,update:c,dispose:A}}const Cy=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let Fn=null;function Py(){return Fn===null&&(Fn=new vo(Cy,16,16,bs,gi),Fn.name="DFG_LUT",Fn.minFilter=Pt,Fn.magFilter=Pt,Fn.wrapS=dn,Fn.wrapT=dn,Fn.generateMipmaps=!1,Fn.needsUpdate=!0),Fn}class Ly{constructor(e={}){const{canvas:t=Ym(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1,reversedDepthBuffer:d=!1,outputBufferType:f=cn}=e;this.isWebGLRenderer=!0;let g;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=n.getContextAttributes().alpha}else g=a;const v=f,m=new Set([cd,ld,od]),p=new Set([cn,Yn,Br,zr,rd,ad]),S=new Uint32Array(4),A=new Int32Array(4),b=new I;let T=null,M=null;const w=[],_=[];let y=null;this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=qn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const P=this;let R=!1,L=null,z=null,X=null,O=null;this._outputColorSpace=dt;let N=0,V=0,$=null,j=-1,re=null;const se=new st,ae=new st;let xe=null;const be=new ke(0);let le=0,k=t.width,J=t.height,te=1,Ae=null,Fe=null;const Ie=new st(0,0,k,J),vt=new st(0,0,k,J);let Ye=!1;const rt=new gd;let Je=!1,Ke=!1;const Mt=new Oe,At=new I,It=new st,Ft={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let ht=!1;function St(){return $===null?te:1}let U=n;function Qt(E,F){return t.getContext(E,F)}try{const E={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${id}`),t.addEventListener("webglcontextlost",ft,!1),t.addEventListener("webglcontextrestored",lt,!1),t.addEventListener("webglcontextcreationerror",Nn,!1),U===null){const F="webgl2";if(U=Qt(F,E),U===null)throw Qt(F)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}}catch(E){throw He("WebGLRenderer: "+E.message),E}let et,C,x,B,W,K,oe,de,Z,ee,ue,we,pe,he,Le,De,ze,D,ce,Q,fe,ve,ie;function Te(){et=new Px(U),et.init(),fe=new yy(U,et),C=new Mx(U,et,e,fe),x=new xy(U,et),C.reversedDepthBuffer&&d&&x.buffers.depth.setReversed(!0),z=U.createFramebuffer(),X=U.createFramebuffer(),O=U.createFramebuffer(),B=new Ix(U),W=new ry,K=new by(U,et,x,W,C,fe,B),oe=new Cx(P),de=new O_(U),ve=new bx(U,de),Z=new Lx(U,de,B,ve),ee=new Ux(U,Z,de,ve,B),D=new Dx(U,C,K),Le=new Sx(W),ue=new sy(P,oe,et,C,ve,Le),we=new wy(P,W),pe=new oy,he=new fy(et),ze=new xx(P,oe,x,ee,g,l),De=new vy(P,ee,C),ie=new Ry(U,B,C,x),ce=new yx(U,et,B),Q=new Nx(U,et,B),B.programs=ue.programs,P.capabilities=C,P.extensions=et,P.properties=W,P.renderLists=pe,P.shadowMap=De,P.state=x,P.info=B}Te(),v!==cn&&(y=new Ox(v,t.width,t.height,o,s,r));const Se=new Ty(P,U);this.xr=Se,this.getContext=function(){return U},this.getContextAttributes=function(){return U.getContextAttributes()},this.forceContextLoss=function(){const E=et.get("WEBGL_lose_context");E&&E.loseContext()},this.forceContextRestore=function(){const E=et.get("WEBGL_lose_context");E&&E.restoreContext()},this.getPixelRatio=function(){return te},this.setPixelRatio=function(E){E!==void 0&&(te=E,this.setSize(k,J,!1))},this.getSize=function(E){return E.set(k,J)},this.setSize=function(E,F,q=!0){if(Se.isPresenting){Pe("WebGLRenderer: Can't change size while VR device is presenting.");return}k=E,J=F,t.width=Math.floor(E*te),t.height=Math.floor(F*te),q===!0&&(t.style.width=E+"px",t.style.height=F+"px"),y!==null&&y.setSize(t.width,t.height),this.setViewport(0,0,E,F)},this.getDrawingBufferSize=function(E){return E.set(k*te,J*te).floor()},this.setDrawingBufferSize=function(E,F,q){k=E,J=F,te=q,t.width=Math.floor(E*q),t.height=Math.floor(F*q),this.setViewport(0,0,E,F)},this.setEffects=function(E){if(v===cn){He("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(E){for(let F=0;F<E.length;F++)if(E[F].isOutputPass===!0){Pe("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}y.setEffects(E||[])},this.getCurrentViewport=function(E){return E.copy(se)},this.getViewport=function(E){return E.copy(Ie)},this.setViewport=function(E,F,q,G){E.isVector4?Ie.set(E.x,E.y,E.z,E.w):Ie.set(E,F,q,G),x.viewport(se.copy(Ie).multiplyScalar(te).round())},this.getScissor=function(E){return E.copy(vt)},this.setScissor=function(E,F,q,G){E.isVector4?vt.set(E.x,E.y,E.z,E.w):vt.set(E,F,q,G),x.scissor(ae.copy(vt).multiplyScalar(te).round())},this.getScissorTest=function(){return Ye},this.setScissorTest=function(E){x.setScissorTest(Ye=E)},this.setOpaqueSort=function(E){Ae=E},this.setTransparentSort=function(E){Fe=E},this.getClearColor=function(E){return E.copy(ze.getClearColor())},this.setClearColor=function(){ze.setClearColor(...arguments)},this.getClearAlpha=function(){return ze.getClearAlpha()},this.setClearAlpha=function(){ze.setClearAlpha(...arguments)},this.clear=function(E=!0,F=!0,q=!0){let G=0;if(E){let H=!1;if($!==null){const _e=$.texture.format;H=m.has(_e)}if(H){const _e=$.texture.type,Me=p.has(_e),ge=ze.getClearColor(),Ee=ze.getClearAlpha(),Re=ge.r,Ve=ge.g,We=ge.b;Me?(S[0]=Re,S[1]=Ve,S[2]=We,S[3]=Ee,U.clearBufferuiv(U.COLOR,0,S)):(A[0]=Re,A[1]=Ve,A[2]=We,A[3]=Ee,U.clearBufferiv(U.COLOR,0,A))}else G|=U.COLOR_BUFFER_BIT}F&&(G|=U.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),q&&(G|=U.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),G!==0&&U.clear(G)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(E){E.setRenderer(this),L=E},this.dispose=function(){t.removeEventListener("webglcontextlost",ft,!1),t.removeEventListener("webglcontextrestored",lt,!1),t.removeEventListener("webglcontextcreationerror",Nn,!1),ze.dispose(),pe.dispose(),he.dispose(),W.dispose(),oe.dispose(),ee.dispose(),ve.dispose(),ie.dispose(),ue.dispose(),Se.dispose(),Se.removeEventListener("sessionstart",au),Se.removeEventListener("sessionend",ou),es.stop()};function ft(E){E.preventDefault(),Au("WebGLRenderer: Context Lost."),R=!0}function lt(){Au("WebGLRenderer: Context Restored."),R=!1;const E=B.autoReset,F=De.enabled,q=De.autoUpdate,G=De.needsUpdate,H=De.type;Te(),B.autoReset=E,De.enabled=F,De.autoUpdate=q,De.needsUpdate=G,De.type=H}function Nn(E){He("WebGLRenderer: A WebGL context could not be created. Reason: ",E.statusMessage)}function In(E){const F=E.target;F.removeEventListener("dispose",In),sm(F)}function sm(E){rm(E),W.remove(E)}function rm(E){const F=W.get(E).programs;F!==void 0&&(F.forEach(function(q){ue.releaseProgram(q)}),E.isShaderMaterial&&ue.releaseShaderCache(E))}this.renderBufferDirect=function(E,F,q,G,H,_e){F===null&&(F=Ft);const Me=H.isMesh&&H.matrixWorld.determinantAffine()<0,ge=lm(E,F,q,G,H);x.setMaterial(G,Me);let Ee=q.index,Re=1;if(G.wireframe===!0){if(Ee=Z.getWireframeAttribute(q),Ee===void 0)return;Re=2}const Ve=q.drawRange,We=q.attributes.position;let Ce=Ve.start*Re,nt=(Ve.start+Ve.count)*Re;_e!==null&&(Ce=Math.max(Ce,_e.start*Re),nt=Math.min(nt,(_e.start+_e.count)*Re)),Ee!==null?(Ce=Math.max(Ce,0),nt=Math.min(nt,Ee.count)):We!=null&&(Ce=Math.max(Ce,0),nt=Math.min(nt,We.count));const xt=nt-Ce;if(xt<0||xt===1/0)return;ve.setup(H,G,ge,q,Ee);let pt,at=ce;if(Ee!==null&&(pt=de.get(Ee),at=Q,at.setIndex(pt)),H.isMesh)G.wireframe===!0?(x.setLineWidth(G.wireframeLinewidth*St()),at.setMode(U.LINES)):at.setMode(U.TRIANGLES);else if(H.isLine){let Gt=G.linewidth;Gt===void 0&&(Gt=1),x.setLineWidth(Gt*St()),H.isLineSegments?at.setMode(U.LINES):H.isLineLoop?at.setMode(U.LINE_LOOP):at.setMode(U.LINE_STRIP)}else H.isPoints?at.setMode(U.POINTS):H.isSprite&&at.setMode(U.TRIANGLES);if(H.isBatchedMesh)if(et.get("WEBGL_multi_draw"))at.renderMultiDraw(H._multiDrawStarts,H._multiDrawCounts,H._multiDrawCount);else{const Gt=H._multiDrawStarts,ye=H._multiDrawCounts,sn=H._multiDrawCount,Ze=Ee?de.get(Ee).bytesPerElement:1,fn=W.get(G).currentProgram.getUniforms();for(let Dn=0;Dn<sn;Dn++)fn.setValue(U,"_gl_DrawID",Dn),at.render(Gt[Dn]/Ze,ye[Dn])}else if(H.isInstancedMesh)at.renderInstances(Ce,xt,H.count);else if(q.isInstancedBufferGeometry){const Gt=q._maxInstanceCount!==void 0?q._maxInstanceCount:1/0,ye=Math.min(q.instanceCount,Gt);at.renderInstances(Ce,xt,ye)}else at.render(Ce,xt)};function ru(E,F,q){E.transparent===!0&&E.side===Rn&&E.forceSinglePass===!1?(E.side=nn,E.needsUpdate=!0,fa(E,F,q),E.side=mi,E.needsUpdate=!0,fa(E,F,q),E.side=Rn):fa(E,F,q)}this.compile=function(E,F,q=null){q===null&&(q=E),M=he.get(q),M.init(F),_.push(M),q.traverseVisible(function(H){H.isLight&&H.layers.test(F.layers)&&(M.pushLight(H),H.castShadow&&M.pushShadow(H))}),E!==q&&E.traverseVisible(function(H){H.isLight&&H.layers.test(F.layers)&&(M.pushLight(H),H.castShadow&&M.pushShadow(H))}),M.setupLights();const G=new Set;return E.traverse(function(H){if(!(H.isMesh||H.isPoints||H.isLine||H.isSprite))return;const _e=H.material;if(_e)if(Array.isArray(_e))for(let Me=0;Me<_e.length;Me++){const ge=_e[Me];ru(ge,q,H),G.add(ge)}else ru(_e,q,H),G.add(_e)}),M=_.pop(),G},this.compileAsync=function(E,F,q=null){const G=this.compile(E,F,q);return new Promise(H=>{function _e(){if(G.forEach(function(Me){W.get(Me).currentProgram.isReady()&&G.delete(Me)}),G.size===0){H(E);return}setTimeout(_e,10)}et.get("KHR_parallel_shader_compile")!==null?_e():setTimeout(_e,10)})};let Qo=null;function am(E){Qo&&Qo(E)}function au(){es.stop()}function ou(){es.start()}const es=new ep;es.setAnimationLoop(am),typeof self<"u"&&es.setContext(self),this.setAnimationLoop=function(E){Qo=E,Se.setAnimationLoop(E),E===null?es.stop():es.start()},Se.addEventListener("sessionstart",au),Se.addEventListener("sessionend",ou),this.render=function(E,F){if(F!==void 0&&F.isCamera!==!0){He("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(R===!0)return;L!==null&&L.renderStart(E,F);const q=Se.enabled===!0&&Se.isPresenting===!0,G=y!==null&&($===null||q)&&y.begin(P,$);if(E.matrixWorldAutoUpdate===!0&&E.updateMatrixWorld(),F.parent===null&&F.matrixWorldAutoUpdate===!0&&F.updateMatrixWorld(),Se.enabled===!0&&Se.isPresenting===!0&&(y===null||y.isCompositing()===!1)&&(Se.cameraAutoUpdate===!0&&Se.updateCamera(F),F=Se.getCamera()),E.isScene===!0&&E.onBeforeRender(P,E,F,$),M=he.get(E,_.length),M.init(F),M.state.textureUnits=K.getTextureUnits(),_.push(M),Mt.multiplyMatrices(F.projectionMatrix,F.matrixWorldInverse),rt.setFromProjectionMatrix(Mt,Hn,F.reversedDepth),Ke=this.localClippingEnabled,Je=Le.init(this.clippingPlanes,Ke),T=pe.get(E,w.length),T.init(),w.push(T),Se.enabled===!0&&Se.isPresenting===!0){const Me=P.xr.getDepthSensingMesh();Me!==null&&el(Me,F,-1/0,P.sortObjects)}el(E,F,0,P.sortObjects),T.finish(),P.sortObjects===!0&&T.sort(Ae,Fe,F.reversedDepth),ht=Se.enabled===!1||Se.isPresenting===!1||Se.hasDepthSensing()===!1,ht&&ze.addToRenderList(T,E),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),Je===!0&&Le.beginShadows();const H=M.state.shadowsArray;if(De.render(H,E,F),Je===!0&&Le.endShadows(),(G&&y.hasRenderPass())===!1){const Me=T.opaque,ge=T.transmissive;if(M.setupLights(),F.isArrayCamera){const Ee=F.cameras;if(ge.length>0)for(let Re=0,Ve=Ee.length;Re<Ve;Re++){const We=Ee[Re];cu(Me,ge,E,We)}ht&&ze.render(E);for(let Re=0,Ve=Ee.length;Re<Ve;Re++){const We=Ee[Re];lu(T,E,We,We.viewport)}}else ge.length>0&&cu(Me,ge,E,F),ht&&ze.render(E),lu(T,E,F)}$!==null&&V===0&&(K.updateMultisampleRenderTarget($),K.updateRenderTargetMipmap($)),G&&y.end(P),E.isScene===!0&&E.onAfterRender(P,E,F),ve.resetDefaultState(),j=-1,re=null,_.pop(),_.length>0?(M=_[_.length-1],K.setTextureUnits(M.state.textureUnits),Je===!0&&Le.setGlobalState(P.clippingPlanes,M.state.camera)):M=null,w.pop(),w.length>0?T=w[w.length-1]:T=null,L!==null&&L.renderEnd()};function el(E,F,q,G){if(E.visible===!1)return;if(E.layers.test(F.layers)){if(E.isGroup)q=E.renderOrder;else if(E.isLOD)E.autoUpdate===!0&&E.update(F);else if(E.isLightProbeGrid)M.pushLightProbeGrid(E);else if(E.isLight)M.pushLight(E),E.castShadow&&M.pushShadow(E);else if(E.isSprite){if(!E.frustumCulled||rt.intersectsSprite(E)){G&&It.setFromMatrixPosition(E.matrixWorld).applyMatrix4(Mt);const Me=ee.update(E),ge=E.material;ge.visible&&T.push(E,Me,ge,q,It.z,null)}}else if((E.isMesh||E.isLine||E.isPoints)&&(!E.frustumCulled||rt.intersectsObject(E))){const Me=ee.update(E),ge=E.material;if(G&&(E.boundingSphere!==void 0?(E.boundingSphere===null&&E.computeBoundingSphere(),It.copy(E.boundingSphere.center)):(Me.boundingSphere===null&&Me.computeBoundingSphere(),It.copy(Me.boundingSphere.center)),It.applyMatrix4(E.matrixWorld).applyMatrix4(Mt)),Array.isArray(ge)){const Ee=Me.groups;for(let Re=0,Ve=Ee.length;Re<Ve;Re++){const We=Ee[Re],Ce=ge[We.materialIndex];Ce&&Ce.visible&&T.push(E,Me,Ce,q,It.z,We)}}else ge.visible&&T.push(E,Me,ge,q,It.z,null)}}const _e=E.children;for(let Me=0,ge=_e.length;Me<ge;Me++)el(_e[Me],F,q,G)}function lu(E,F,q,G){const{opaque:H,transmissive:_e,transparent:Me}=E;M.setupLightsView(q),Je===!0&&Le.setGlobalState(P.clippingPlanes,q),G&&x.viewport(se.copy(G)),H.length>0&&ha(H,F,q),_e.length>0&&ha(_e,F,q),Me.length>0&&ha(Me,F,q),x.buffers.depth.setTest(!0),x.buffers.depth.setMask(!0),x.buffers.color.setMask(!0),x.setPolygonOffset(!1)}function cu(E,F,q,G){if((q.isScene===!0?q.overrideMaterial:null)!==null)return;if(M.state.transmissionRenderTarget[G.id]===void 0){const Ce=et.has("EXT_color_buffer_half_float")||et.has("EXT_color_buffer_float");M.state.transmissionRenderTarget[G.id]=new $n(1,1,{generateMipmaps:!0,type:Ce?gi:cn,minFilter:oi,samples:Math.max(4,C.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Xe.workingColorSpace})}const _e=M.state.transmissionRenderTarget[G.id],Me=G.viewport||se;_e.setSize(Me.z*P.transmissionResolutionScale,Me.w*P.transmissionResolutionScale);const ge=P.getRenderTarget(),Ee=P.getActiveCubeFace(),Re=P.getActiveMipmapLevel();P.setRenderTarget(_e),P.getClearColor(be),le=P.getClearAlpha(),le<1&&P.setClearColor(16777215,.5),P.clear(),ht&&ze.render(q);const Ve=P.toneMapping;P.toneMapping=qn;const We=G.viewport;if(G.viewport!==void 0&&(G.viewport=void 0),M.setupLightsView(G),Je===!0&&Le.setGlobalState(P.clippingPlanes,G),ha(E,q,G),K.updateMultisampleRenderTarget(_e),K.updateRenderTargetMipmap(_e),et.has("WEBGL_multisampled_render_to_texture")===!1){let Ce=!1;for(let nt=0,xt=F.length;nt<xt;nt++){const pt=F[nt],{object:at,geometry:Gt,material:ye,group:sn}=pt;if(ye.side===Rn&&at.layers.test(G.layers)){const Ze=ye.side;ye.side=nn,ye.needsUpdate=!0,du(at,q,G,Gt,ye,sn),ye.side=Ze,ye.needsUpdate=!0,Ce=!0}}Ce===!0&&(K.updateMultisampleRenderTarget(_e),K.updateRenderTargetMipmap(_e))}P.setRenderTarget(ge,Ee,Re),P.setClearColor(be,le),We!==void 0&&(G.viewport=We),P.toneMapping=Ve}function ha(E,F,q){const G=F.isScene===!0?F.overrideMaterial:null;for(let H=0,_e=E.length;H<_e;H++){const Me=E[H],{object:ge,geometry:Ee,group:Re}=Me;let Ve=Me.material;Ve.allowOverride===!0&&G!==null&&(Ve=G),ge.layers.test(q.layers)&&du(ge,F,q,Ee,Ve,Re)}}function du(E,F,q,G,H,_e){E.onBeforeRender(P,F,q,G,H,_e),E.modelViewMatrix.multiplyMatrices(q.matrixWorldInverse,E.matrixWorld),E.normalMatrix.getNormalMatrix(E.modelViewMatrix),H.onBeforeRender(P,F,q,G,E,_e),H.transparent===!0&&H.side===Rn&&H.forceSinglePass===!1?(H.side=nn,H.needsUpdate=!0,P.renderBufferDirect(q,F,G,H,E,_e),H.side=mi,H.needsUpdate=!0,P.renderBufferDirect(q,F,G,H,E,_e),H.side=Rn):P.renderBufferDirect(q,F,G,H,E,_e),E.onAfterRender(P,F,q,G,H,_e)}function fa(E,F,q){F.isScene!==!0&&(F=Ft);const G=W.get(E),H=M.state.lights,_e=M.state.shadowsArray,Me=H.state.version,ge=ue.getParameters(E,H.state,_e,F,q,M.state.lightProbeGridArray),Ee=ue.getProgramCacheKey(ge);let Re=G.programs;G.environment=E.isMeshStandardMaterial||E.isMeshLambertMaterial||E.isMeshPhongMaterial?F.environment:null,G.fog=F.fog;const Ve=E.isMeshStandardMaterial||E.isMeshLambertMaterial&&!E.envMap||E.isMeshPhongMaterial&&!E.envMap;G.envMap=oe.get(E.envMap||G.environment,Ve),G.envMapRotation=G.environment!==null&&E.envMap===null?F.environmentRotation:E.envMapRotation,Re===void 0&&(E.addEventListener("dispose",In),Re=new Map,G.programs=Re);let We=Re.get(Ee);if(We!==void 0){if(G.currentProgram===We&&G.lightsStateVersion===Me)return hu(E,ge),We}else ge.uniforms=ue.getUniforms(E),L!==null&&E.isNodeMaterial&&L.build(E,q,ge),E.onBeforeCompile(ge,P),We=ue.acquireProgram(ge,Ee),Re.set(Ee,We),G.uniforms=ge.uniforms;const Ce=G.uniforms;return(!E.isShaderMaterial&&!E.isRawShaderMaterial||E.clipping===!0)&&(Ce.clippingPlanes=Le.uniform),hu(E,ge),G.needsLights=dm(E),G.lightsStateVersion=Me,G.needsLights&&(Ce.ambientLightColor.value=H.state.ambient,Ce.lightProbe.value=H.state.probe,Ce.directionalLights.value=H.state.directional,Ce.directionalLightShadows.value=H.state.directionalShadow,Ce.spotLights.value=H.state.spot,Ce.spotLightShadows.value=H.state.spotShadow,Ce.rectAreaLights.value=H.state.rectArea,Ce.ltc_1.value=H.state.rectAreaLTC1,Ce.ltc_2.value=H.state.rectAreaLTC2,Ce.pointLights.value=H.state.point,Ce.pointLightShadows.value=H.state.pointShadow,Ce.hemisphereLights.value=H.state.hemi,Ce.directionalShadowMatrix.value=H.state.directionalShadowMatrix,Ce.spotLightMatrix.value=H.state.spotLightMatrix,Ce.spotLightMap.value=H.state.spotLightMap,Ce.pointShadowMatrix.value=H.state.pointShadowMatrix),G.lightProbeGrid=M.state.lightProbeGridArray.length>0,G.currentProgram=We,G.uniformsList=null,We}function uu(E){if(E.uniformsList===null){const F=E.currentProgram.getUniforms();E.uniformsList=so.seqWithValue(F.seq,E.uniforms)}return E.uniformsList}function hu(E,F){const q=W.get(E);q.outputColorSpace=F.outputColorSpace,q.batching=F.batching,q.batchingColor=F.batchingColor,q.instancing=F.instancing,q.instancingColor=F.instancingColor,q.instancingMorph=F.instancingMorph,q.skinning=F.skinning,q.morphTargets=F.morphTargets,q.morphNormals=F.morphNormals,q.morphColors=F.morphColors,q.morphTargetsCount=F.morphTargetsCount,q.numClippingPlanes=F.numClippingPlanes,q.numIntersection=F.numClipIntersection,q.vertexAlphas=F.vertexAlphas,q.vertexTangents=F.vertexTangents,q.toneMapping=F.toneMapping}function om(E,F){if(E.length===0)return null;if(E.length===1)return E[0].texture!==null?E[0]:null;b.setFromMatrixPosition(F.matrixWorld);for(let q=0,G=E.length;q<G;q++){const H=E[q];if(H.texture!==null&&H.boundingBox.containsPoint(b))return H}return null}function lm(E,F,q,G,H){F.isScene!==!0&&(F=Ft),K.resetTextureUnits();const _e=F.fog,Me=G.isMeshStandardMaterial||G.isMeshLambertMaterial||G.isMeshPhongMaterial?F.environment:null,ge=$===null?P.outputColorSpace:$.isXRRenderTarget===!0?$.texture.colorSpace:Xe.workingColorSpace,Ee=G.isMeshStandardMaterial||G.isMeshLambertMaterial&&!G.envMap||G.isMeshPhongMaterial&&!G.envMap,Re=oe.get(G.envMap||Me,Ee),Ve=G.vertexColors===!0&&!!q.attributes.color&&q.attributes.color.itemSize===4,We=!!q.attributes.tangent&&(!!G.normalMap||G.anisotropy>0),Ce=!!q.morphAttributes.position,nt=!!q.morphAttributes.normal,xt=!!q.morphAttributes.color;let pt=qn;G.toneMapped&&($===null||$.isXRRenderTarget===!0)&&(pt=P.toneMapping);const at=q.morphAttributes.position||q.morphAttributes.normal||q.morphAttributes.color,Gt=at!==void 0?at.length:0,ye=W.get(G),sn=M.state.lights;if(Je===!0&&(Ke===!0||E!==re)){const ct=E===re&&G.id===j;Le.setState(G,E,ct)}let Ze=!1;G.version===ye.__version?(ye.needsLights&&ye.lightsStateVersion!==sn.state.version||ye.outputColorSpace!==ge||H.isBatchedMesh&&ye.batching===!1||!H.isBatchedMesh&&ye.batching===!0||H.isBatchedMesh&&ye.batchingColor===!0&&H.colorTexture===null||H.isBatchedMesh&&ye.batchingColor===!1&&H.colorTexture!==null||H.isInstancedMesh&&ye.instancing===!1||!H.isInstancedMesh&&ye.instancing===!0||H.isSkinnedMesh&&ye.skinning===!1||!H.isSkinnedMesh&&ye.skinning===!0||H.isInstancedMesh&&ye.instancingColor===!0&&H.instanceColor===null||H.isInstancedMesh&&ye.instancingColor===!1&&H.instanceColor!==null||H.isInstancedMesh&&ye.instancingMorph===!0&&H.morphTexture===null||H.isInstancedMesh&&ye.instancingMorph===!1&&H.morphTexture!==null||ye.envMap!==Re||G.fog===!0&&ye.fog!==_e||ye.numClippingPlanes!==void 0&&(ye.numClippingPlanes!==Le.numPlanes||ye.numIntersection!==Le.numIntersection)||ye.vertexAlphas!==Ve||ye.vertexTangents!==We||ye.morphTargets!==Ce||ye.morphNormals!==nt||ye.morphColors!==xt||ye.toneMapping!==pt||ye.morphTargetsCount!==Gt||!!ye.lightProbeGrid!=M.state.lightProbeGridArray.length>0)&&(Ze=!0):(Ze=!0,ye.__version=G.version);let fn=ye.currentProgram;Ze===!0&&(fn=fa(G,F,H),L&&G.isNodeMaterial&&L.onUpdateProgram(G,fn,ye));let Dn=!1,xi=!1,Ps=!1;const ot=fn.getUniforms(),bt=ye.uniforms;if(x.useProgram(fn.program)&&(Dn=!0,xi=!0,Ps=!0),G.id!==j&&(j=G.id,xi=!0),ye.needsLights){const ct=om(M.state.lightProbeGridArray,H);ye.lightProbeGrid!==ct&&(ye.lightProbeGrid=ct,xi=!0)}if(Dn||re!==E){x.buffers.depth.getReversed()&&E.reversedDepth!==!0&&(E._reversedDepth=!0,E.updateProjectionMatrix()),ot.setValue(U,"projectionMatrix",E.projectionMatrix),ot.setValue(U,"viewMatrix",E.matrixWorldInverse);const yi=ot.map.cameraPosition;yi!==void 0&&yi.setValue(U,At.setFromMatrixPosition(E.matrixWorld)),C.logarithmicDepthBuffer&&ot.setValue(U,"logDepthBufFC",2/(Math.log(E.far+1)/Math.LN2)),(G.isMeshPhongMaterial||G.isMeshToonMaterial||G.isMeshLambertMaterial||G.isMeshBasicMaterial||G.isMeshStandardMaterial||G.isShaderMaterial)&&ot.setValue(U,"isOrthographic",E.isOrthographicCamera===!0),re!==E&&(re=E,xi=!0,Ps=!0)}if(ye.needsLights&&(sn.state.directionalShadowMap.length>0&&ot.setValue(U,"directionalShadowMap",sn.state.directionalShadowMap,K),sn.state.spotShadowMap.length>0&&ot.setValue(U,"spotShadowMap",sn.state.spotShadowMap,K),sn.state.pointShadowMap.length>0&&ot.setValue(U,"pointShadowMap",sn.state.pointShadowMap,K)),H.isSkinnedMesh){ot.setOptional(U,H,"bindMatrix"),ot.setOptional(U,H,"bindMatrixInverse");const ct=H.skeleton;ct&&(ct.boneTexture===null&&ct.computeBoneTexture(),ot.setValue(U,"boneTexture",ct.boneTexture,K))}H.isBatchedMesh&&(ot.setOptional(U,H,"batchingTexture"),ot.setValue(U,"batchingTexture",H._matricesTexture,K),ot.setOptional(U,H,"batchingIdTexture"),ot.setValue(U,"batchingIdTexture",H._indirectTexture,K),ot.setOptional(U,H,"batchingColorTexture"),H._colorsTexture!==null&&ot.setValue(U,"batchingColorTexture",H._colorsTexture,K));const bi=q.morphAttributes;if((bi.position!==void 0||bi.normal!==void 0||bi.color!==void 0)&&D.update(H,q,fn),(xi||ye.receiveShadow!==H.receiveShadow)&&(ye.receiveShadow=H.receiveShadow,ot.setValue(U,"receiveShadow",H.receiveShadow)),(G.isMeshStandardMaterial||G.isMeshLambertMaterial||G.isMeshPhongMaterial)&&G.envMap===null&&F.environment!==null&&(bt.envMapIntensity.value=F.environmentIntensity),bt.dfgLUT!==void 0&&(bt.dfgLUT.value=Py()),xi){if(ot.setValue(U,"toneMappingExposure",P.toneMappingExposure),ye.needsLights&&cm(bt,Ps),_e&&G.fog===!0&&we.refreshFogUniforms(bt,_e),we.refreshMaterialUniforms(bt,G,te,J,M.state.transmissionRenderTarget[E.id]),ye.needsLights&&ye.lightProbeGrid){const ct=ye.lightProbeGrid;bt.probesSH.value=ct.texture,bt.probesMin.value.copy(ct.boundingBox.min),bt.probesMax.value.copy(ct.boundingBox.max),bt.probesResolution.value.copy(ct.resolution)}so.upload(U,uu(ye),bt,K)}if(G.isShaderMaterial&&G.uniformsNeedUpdate===!0&&(so.upload(U,uu(ye),bt,K),G.uniformsNeedUpdate=!1),G.isSpriteMaterial&&ot.setValue(U,"center",H.center),ot.setValue(U,"modelViewMatrix",H.modelViewMatrix),ot.setValue(U,"normalMatrix",H.normalMatrix),ot.setValue(U,"modelMatrix",H.matrixWorld),G.uniformsGroups!==void 0){const ct=G.uniformsGroups;for(let yi=0,Ls=ct.length;yi<Ls;yi++){const fu=ct[yi];ie.update(fu,fn),ie.bind(fu,fn)}}return fn}function cm(E,F){E.ambientLightColor.needsUpdate=F,E.lightProbe.needsUpdate=F,E.directionalLights.needsUpdate=F,E.directionalLightShadows.needsUpdate=F,E.pointLights.needsUpdate=F,E.pointLightShadows.needsUpdate=F,E.spotLights.needsUpdate=F,E.spotLightShadows.needsUpdate=F,E.rectAreaLights.needsUpdate=F,E.hemisphereLights.needsUpdate=F}function dm(E){return E.isMeshLambertMaterial||E.isMeshToonMaterial||E.isMeshPhongMaterial||E.isMeshStandardMaterial||E.isShadowMaterial||E.isShaderMaterial&&E.lights===!0}this.getActiveCubeFace=function(){return N},this.getActiveMipmapLevel=function(){return V},this.getRenderTarget=function(){return $},this.setRenderTargetTextures=function(E,F,q){const G=W.get(E);G.__autoAllocateDepthBuffer=E.resolveDepthBuffer===!1,G.__autoAllocateDepthBuffer===!1&&(G.__useRenderToTexture=!1),W.get(E.texture).__webglTexture=F,W.get(E.depthTexture).__webglTexture=G.__autoAllocateDepthBuffer?void 0:q,G.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(E,F){const q=W.get(E);q.__webglFramebuffer=F,q.__useDefaultFramebuffer=F===void 0},this.setRenderTarget=function(E,F=0,q=0){$=E,N=F,V=q;let G=null,H=!1,_e=!1;if(E){const ge=W.get(E);if(ge.__useDefaultFramebuffer!==void 0){x.bindFramebuffer(U.FRAMEBUFFER,ge.__webglFramebuffer),se.copy(E.viewport),ae.copy(E.scissor),xe=E.scissorTest,x.viewport(se),x.scissor(ae),x.setScissorTest(xe),j=-1;return}else if(ge.__webglFramebuffer===void 0)K.setupRenderTarget(E);else if(ge.__hasExternalTextures)K.rebindTextures(E,W.get(E.texture).__webglTexture,W.get(E.depthTexture).__webglTexture);else if(E.depthBuffer){const Ve=E.depthTexture;if(ge.__boundDepthTexture!==Ve){if(Ve!==null&&W.has(Ve)&&(E.width!==Ve.image.width||E.height!==Ve.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");K.setupDepthRenderbuffer(E)}}const Ee=E.texture;(Ee.isData3DTexture||Ee.isDataArrayTexture||Ee.isCompressedArrayTexture)&&(_e=!0);const Re=W.get(E).__webglFramebuffer;E.isWebGLCubeRenderTarget?(Array.isArray(Re[F])?G=Re[F][q]:G=Re[F],H=!0):E.samples>0&&K.useMultisampledRTT(E)===!1?G=W.get(E).__webglMultisampledFramebuffer:Array.isArray(Re)?G=Re[q]:G=Re,se.copy(E.viewport),ae.copy(E.scissor),xe=E.scissorTest}else se.copy(Ie).multiplyScalar(te).floor(),ae.copy(vt).multiplyScalar(te).floor(),xe=Ye;if(q!==0&&(G=z),x.bindFramebuffer(U.FRAMEBUFFER,G)&&x.drawBuffers(E,G),x.viewport(se),x.scissor(ae),x.setScissorTest(xe),H){const ge=W.get(E.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_CUBE_MAP_POSITIVE_X+F,ge.__webglTexture,q)}else if(_e){const ge=F;for(let Ee=0;Ee<E.textures.length;Ee++){const Re=W.get(E.textures[Ee]);U.framebufferTextureLayer(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0+Ee,Re.__webglTexture,q,ge)}}else if(E!==null&&q!==0){const ge=W.get(E.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,ge.__webglTexture,q)}j=-1},this.readRenderTargetPixels=function(E,F,q,G,H,_e,Me,ge=0){if(!(E&&E.isWebGLRenderTarget)){He("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ee=W.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&Me!==void 0&&(Ee=Ee[Me]),Ee){x.bindFramebuffer(U.FRAMEBUFFER,Ee);try{const Re=E.textures[ge],Ve=Re.format,We=Re.type;if(E.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+ge),!C.textureFormatReadable(Ve)){He("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!C.textureTypeReadable(We)){He("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}F>=0&&F<=E.width-G&&q>=0&&q<=E.height-H&&U.readPixels(F,q,G,H,fe.convert(Ve),fe.convert(We),_e)}finally{const Re=$!==null?W.get($).__webglFramebuffer:null;x.bindFramebuffer(U.FRAMEBUFFER,Re)}}},this.readRenderTargetPixelsAsync=async function(E,F,q,G,H,_e,Me,ge=0){if(!(E&&E.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ee=W.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&Me!==void 0&&(Ee=Ee[Me]),Ee)if(F>=0&&F<=E.width-G&&q>=0&&q<=E.height-H){x.bindFramebuffer(U.FRAMEBUFFER,Ee);const Re=E.textures[ge],Ve=Re.format,We=Re.type;if(E.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+ge),!C.textureFormatReadable(Ve))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!C.textureTypeReadable(We))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const Ce=U.createBuffer();U.bindBuffer(U.PIXEL_PACK_BUFFER,Ce),U.bufferData(U.PIXEL_PACK_BUFFER,_e.byteLength,U.STREAM_READ),U.readPixels(F,q,G,H,fe.convert(Ve),fe.convert(We),0);const nt=$!==null?W.get($).__webglFramebuffer:null;x.bindFramebuffer(U.FRAMEBUFFER,nt);const xt=U.fenceSync(U.SYNC_GPU_COMMANDS_COMPLETE,0);return U.flush(),await Km(U,xt,4),U.bindBuffer(U.PIXEL_PACK_BUFFER,Ce),U.getBufferSubData(U.PIXEL_PACK_BUFFER,0,_e),U.deleteBuffer(Ce),U.deleteSync(xt),_e}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(E,F=null,q=0){const G=Math.pow(2,-q),H=Math.floor(E.image.width*G),_e=Math.floor(E.image.height*G),Me=F!==null?F.x:0,ge=F!==null?F.y:0;K.setTexture2D(E,0),U.copyTexSubImage2D(U.TEXTURE_2D,q,0,0,Me,ge,H,_e),x.unbindTexture()},this.copyTextureToTexture=function(E,F,q=null,G=null,H=0,_e=0){let Me,ge,Ee,Re,Ve,We,Ce,nt,xt;const pt=E.isCompressedTexture?E.mipmaps[_e]:E.image;if(q!==null)Me=q.max.x-q.min.x,ge=q.max.y-q.min.y,Ee=q.isBox3?q.max.z-q.min.z:1,Re=q.min.x,Ve=q.min.y,We=q.isBox3?q.min.z:0;else{const bt=Math.pow(2,-H);Me=Math.floor(pt.width*bt),ge=Math.floor(pt.height*bt),E.isDataArrayTexture?Ee=pt.depth:E.isData3DTexture?Ee=Math.floor(pt.depth*bt):Ee=1,Re=0,Ve=0,We=0}G!==null?(Ce=G.x,nt=G.y,xt=G.z):(Ce=0,nt=0,xt=0);const at=fe.convert(F.format),Gt=fe.convert(F.type);let ye;F.isData3DTexture?(K.setTexture3D(F,0),ye=U.TEXTURE_3D):F.isDataArrayTexture||F.isCompressedArrayTexture?(K.setTexture2DArray(F,0),ye=U.TEXTURE_2D_ARRAY):(K.setTexture2D(F,0),ye=U.TEXTURE_2D),x.activeTexture(U.TEXTURE0),x.pixelStorei(U.UNPACK_FLIP_Y_WEBGL,F.flipY),x.pixelStorei(U.UNPACK_PREMULTIPLY_ALPHA_WEBGL,F.premultiplyAlpha),x.pixelStorei(U.UNPACK_ALIGNMENT,F.unpackAlignment);const sn=x.getParameter(U.UNPACK_ROW_LENGTH),Ze=x.getParameter(U.UNPACK_IMAGE_HEIGHT),fn=x.getParameter(U.UNPACK_SKIP_PIXELS),Dn=x.getParameter(U.UNPACK_SKIP_ROWS),xi=x.getParameter(U.UNPACK_SKIP_IMAGES);x.pixelStorei(U.UNPACK_ROW_LENGTH,pt.width),x.pixelStorei(U.UNPACK_IMAGE_HEIGHT,pt.height),x.pixelStorei(U.UNPACK_SKIP_PIXELS,Re),x.pixelStorei(U.UNPACK_SKIP_ROWS,Ve),x.pixelStorei(U.UNPACK_SKIP_IMAGES,We);const Ps=E.isDataArrayTexture||E.isData3DTexture,ot=F.isDataArrayTexture||F.isData3DTexture;if(E.isDepthTexture){const bt=W.get(E),bi=W.get(F),ct=W.get(bt.__renderTarget),yi=W.get(bi.__renderTarget);x.bindFramebuffer(U.READ_FRAMEBUFFER,ct.__webglFramebuffer),x.bindFramebuffer(U.DRAW_FRAMEBUFFER,yi.__webglFramebuffer);for(let Ls=0;Ls<Ee;Ls++)Ps&&(U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,W.get(E).__webglTexture,H,We+Ls),U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,W.get(F).__webglTexture,_e,xt+Ls)),U.blitFramebuffer(Re,Ve,Me,ge,Ce,nt,Me,ge,U.DEPTH_BUFFER_BIT,U.NEAREST);x.bindFramebuffer(U.READ_FRAMEBUFFER,null),x.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else if(H!==0||E.isRenderTargetTexture||W.has(E)){const bt=W.get(E),bi=W.get(F);x.bindFramebuffer(U.READ_FRAMEBUFFER,X),x.bindFramebuffer(U.DRAW_FRAMEBUFFER,O);for(let ct=0;ct<Ee;ct++)Ps?U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,bt.__webglTexture,H,We+ct):U.framebufferTexture2D(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,bt.__webglTexture,H),ot?U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,bi.__webglTexture,_e,xt+ct):U.framebufferTexture2D(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,bi.__webglTexture,_e),H!==0?U.blitFramebuffer(Re,Ve,Me,ge,Ce,nt,Me,ge,U.COLOR_BUFFER_BIT,U.NEAREST):ot?U.copyTexSubImage3D(ye,_e,Ce,nt,xt+ct,Re,Ve,Me,ge):U.copyTexSubImage2D(ye,_e,Ce,nt,Re,Ve,Me,ge);x.bindFramebuffer(U.READ_FRAMEBUFFER,null),x.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else ot?E.isDataTexture||E.isData3DTexture?U.texSubImage3D(ye,_e,Ce,nt,xt,Me,ge,Ee,at,Gt,pt.data):F.isCompressedArrayTexture?U.compressedTexSubImage3D(ye,_e,Ce,nt,xt,Me,ge,Ee,at,pt.data):U.texSubImage3D(ye,_e,Ce,nt,xt,Me,ge,Ee,at,Gt,pt):E.isDataTexture?U.texSubImage2D(U.TEXTURE_2D,_e,Ce,nt,Me,ge,at,Gt,pt.data):E.isCompressedTexture?U.compressedTexSubImage2D(U.TEXTURE_2D,_e,Ce,nt,pt.width,pt.height,at,pt.data):U.texSubImage2D(U.TEXTURE_2D,_e,Ce,nt,Me,ge,at,Gt,pt);x.pixelStorei(U.UNPACK_ROW_LENGTH,sn),x.pixelStorei(U.UNPACK_IMAGE_HEIGHT,Ze),x.pixelStorei(U.UNPACK_SKIP_PIXELS,fn),x.pixelStorei(U.UNPACK_SKIP_ROWS,Dn),x.pixelStorei(U.UNPACK_SKIP_IMAGES,xi),_e===0&&F.generateMipmaps&&U.generateMipmap(ye),x.unbindTexture()},this.initRenderTarget=function(E){W.get(E).__webglFramebuffer===void 0&&K.setupRenderTarget(E)},this.initTexture=function(E){E.isCubeTexture?K.setTextureCube(E,0):E.isData3DTexture?K.setTexture3D(E,0):E.isDataArrayTexture||E.isCompressedArrayTexture?K.setTexture2DArray(E,0):K.setTexture2D(E,0),x.unbindTexture()},this.resetState=function(){N=0,V=0,$=null,x.reset(),ve.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Hn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=Xe._getDrawingBufferColorSpace(e),t.unpackColorSpace=Xe._getUnpackColorSpace()}}const Fh={type:"change"},Sd={type:"start"},lp={type:"end"},Ga=new sa,Oh=new Pi,Ny=Math.cos(70*kn.DEG2RAD),wt=new I,en=2*Math.PI,it={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},Ol=1e-6;class Iy extends U_{constructor(e,t=null){super(e,t),this.state=it.NONE,this.target=new I,this.cursor=new I,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:Qs.ROTATE,MIDDLE:Qs.DOLLY,RIGHT:Qs.PAN},this.touches={ONE:Ys.ROTATE,TWO:Ys.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle="auto",this._domElementKeyEvents=null,this._lastPosition=new I,this._lastQuaternion=new kt,this._lastTargetPosition=new I,this._quat=new kt().setFromUnitVectors(e.up,new I(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new dh,this._sphericalDelta=new dh,this._scale=1,this._panOffset=new I,this._rotateStart=new Ne,this._rotateEnd=new Ne,this._rotateDelta=new Ne,this._panStart=new Ne,this._panEnd=new Ne,this._panDelta=new Ne,this._dollyStart=new Ne,this._dollyEnd=new Ne,this._dollyDelta=new Ne,this._dollyDirection=new I,this._mouse=new Ne,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=Uy.bind(this),this._onPointerDown=Dy.bind(this),this._onPointerUp=Fy.bind(this),this._onContextMenu=Hy.bind(this),this._onMouseWheel=By.bind(this),this._onKeyDown=zy.bind(this),this._onTouchStart=Vy.bind(this),this._onTouchMove=Gy.bind(this),this._onMouseDown=Oy.bind(this),this._onMouseMove=ky.bind(this),this._interceptControlDown=Wy.bind(this),this._interceptControlUp=Xy.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(e){this._cursorStyle=e,e==="grab"?this.domElement.style.cursor="grab":this.domElement.style.cursor="auto"}get cursorStyle(){return this._cursorStyle}connect(e){super.connect(e),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction=""}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(Fh),this.update(),this.state=it.NONE}pan(e,t){this._pan(e,t),this.update()}dollyIn(e){this._dollyIn(e),this.update()}dollyOut(e){this._dollyOut(e),this.update()}rotateLeft(e){this._rotateLeft(e),this.update()}rotateUp(e){this._rotateUp(e),this.update()}update(e=null){const t=this.object.position;wt.copy(t).sub(this.target),wt.applyQuaternion(this._quat),this._spherical.setFromVector3(wt),this.autoRotate&&this.state===it.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(n)&&isFinite(s)&&(n<-Math.PI?n+=en:n>Math.PI&&(n-=en),s<-Math.PI?s+=en:s>Math.PI&&(s-=en),n<=s?this._spherical.theta=Math.max(n,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+s)/2?Math.max(n,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{const a=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=a!=this._spherical.radius}if(wt.setFromSpherical(this._spherical),wt.applyQuaternion(this._quatInverse),t.copy(this.target).add(wt),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let a=null;if(this.object.isPerspectiveCamera){const o=wt.length();a=this._clampDistance(o*this._scale);const l=o-a;this.object.position.addScaledVector(this._dollyDirection,l),this.object.updateMatrixWorld(),r=!!l}else if(this.object.isOrthographicCamera){const o=new I(this._mouse.x,this._mouse.y,0);o.unproject(this.object);const l=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=l!==this.object.zoom;const c=new I(this._mouse.x,this._mouse.y,0);c.unproject(this.object),this.object.position.sub(c).add(o),this.object.updateMatrixWorld(),a=wt.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;a!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(a).add(this.object.position):(Ga.origin.copy(this.object.position),Ga.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(Ga.direction))<Ny?this.object.lookAt(this.target):(Oh.setFromNormalAndCoplanarPoint(this.object.up,this.target),Ga.intersectPlane(Oh,this.target))))}else if(this.object.isOrthographicCamera){const a=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),a!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>Ol||8*(1-this._lastQuaternion.dot(this.object.quaternion))>Ol||this._lastTargetPosition.distanceToSquared(this.target)>Ol?(this.dispatchEvent(Fh),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?en/60*this.autoRotateSpeed*e:en/60/60*this.autoRotateSpeed}_getZoomScale(e){const t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){wt.setFromMatrixColumn(t,0),wt.multiplyScalar(-e),this._panOffset.add(wt)}_panUp(e,t){this.screenSpacePanning===!0?wt.setFromMatrixColumn(t,1):(wt.setFromMatrixColumn(t,0),wt.crossVectors(this.object.up,wt)),wt.multiplyScalar(e),this._panOffset.add(wt)}_pan(e,t){const n=this.domElement;if(this.object.isPerspectiveCamera){const s=this.object.position;wt.copy(s).sub(this.target);let r=wt.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*r/n.clientHeight,this.object.matrix),this._panUp(2*t*r/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;const n=this.domElement.getBoundingClientRect(),s=e-n.left,r=t-n.top,a=n.width,o=n.height;this._mouse.x=s/a*2-1,this._mouse.y=-(r/o)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const t=this.domElement;this._rotateLeft(en*this._rotateDelta.x/t.clientHeight),this._rotateUp(en*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(en*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-en*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(en*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-en*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._rotateStart.set(n,s)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panStart.set(n,s)}}_handleTouchStartDolly(e){const t=this._getSecondPointerPosition(e),n=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(n*n+s*s);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{const n=this._getSecondPointerPosition(e),s=.5*(e.pageX+n.x),r=.5*(e.pageY+n.y);this._rotateEnd.set(s,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const t=this.domElement;this._rotateLeft(en*this._rotateDelta.x/t.clientHeight),this._rotateUp(en*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panEnd.set(n,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){const t=this._getSecondPointerPosition(e),n=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(n*n+s*s);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);const a=(e.pageX+t.x)*.5,o=(e.pageY+t.y)*.5;this._updateZoomParameters(a,o)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new Ne,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){const t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){const t=e.deltaMode,n={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}}function Dy(i){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(i.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(i)&&(this._addPointer(i),i.pointerType==="touch"?this._onTouchStart(i):this._onMouseDown(i),this._cursorStyle==="grab"&&(this.domElement.style.cursor="grabbing")))}function Uy(i){this.enabled!==!1&&(i.pointerType==="touch"?this._onTouchMove(i):this._onMouseMove(i))}function Fy(i){switch(this._removePointer(i),this._pointers.length){case 0:this.domElement.releasePointerCapture(i.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(lp),this.state=it.NONE,this._cursorStyle==="grab"&&(this.domElement.style.cursor="grab");break;case 1:const e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function Oy(i){let e;switch(i.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case Qs.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(i),this.state=it.DOLLY;break;case Qs.ROTATE:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=it.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=it.ROTATE}break;case Qs.PAN:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=it.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=it.PAN}break;default:this.state=it.NONE}this.state!==it.NONE&&this.dispatchEvent(Sd)}function ky(i){switch(this.state){case it.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(i);break;case it.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(i);break;case it.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(i);break}}function By(i){this.enabled===!1||this.enableZoom===!1||this.state!==it.NONE||(i.preventDefault(),this.dispatchEvent(Sd),this._handleMouseWheel(this._customWheelEvent(i)),this.dispatchEvent(lp))}function zy(i){this.enabled!==!1&&this._handleKeyDown(i)}function Vy(i){switch(this._trackPointer(i),this._pointers.length){case 1:switch(this.touches.ONE){case Ys.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(i),this.state=it.TOUCH_ROTATE;break;case Ys.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(i),this.state=it.TOUCH_PAN;break;default:this.state=it.NONE}break;case 2:switch(this.touches.TWO){case Ys.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(i),this.state=it.TOUCH_DOLLY_PAN;break;case Ys.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(i),this.state=it.TOUCH_DOLLY_ROTATE;break;default:this.state=it.NONE}break;default:this.state=it.NONE}this.state!==it.NONE&&this.dispatchEvent(Sd)}function Gy(i){switch(this._trackPointer(i),this.state){case it.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(i),this.update();break;case it.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(i),this.update();break;case it.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(i),this.update();break;case it.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(i),this.update();break;default:this.state=it.NONE}}function Hy(i){this.enabled!==!1&&i.preventDefault()}function Wy(i){i.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function Xy(i){i.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}class qy extends Qi{constructor(e){super(e)}load(e,t,n,s){const r=this,a=new yd(this.manager);a.setPath(this.path),a.setResponseType("arraybuffer"),a.setRequestHeader(this.requestHeader),a.setWithCredentials(this.withCredentials),a.load(e,function(o){try{t(r.parse(o))}catch(l){s?s(l):console.error(l),r.manager.itemError(e)}},n,s)}parse(e){function t(c){const u=new DataView(c),h=32/8*3+32/8*3*3+16/8,d=u.getUint32(80,!0);if(80+32/8+d*h===u.byteLength)return!0;const g=[115,111,108,105,100];for(let v=0;v<5;v++)if(n(g,u,v))return!1;return!0}function n(c,u,h){for(let d=0,f=c.length;d<f;d++)if(c[d]!==u.getUint8(h+d))return!1;return!0}function s(c){const u=new DataView(c),h=u.getUint32(80,!0);let d,f,g,v=!1,m,p,S,A,b;for(let R=0;R<70;R++)u.getUint32(R,!1)==1129270351&&u.getUint8(R+4)==82&&u.getUint8(R+5)==61&&(v=!0,m=new Float32Array(h*3*3),p=u.getUint8(R+6)/255,S=u.getUint8(R+7)/255,A=u.getUint8(R+8)/255,b=u.getUint8(R+9)/255);const T=84,M=12*4+2,w=new Vt,_=new Float32Array(h*3*3),y=new Float32Array(h*3*3),P=new ke;for(let R=0;R<h;R++){const L=T+R*M,z=u.getFloat32(L,!0),X=u.getFloat32(L+4,!0),O=u.getFloat32(L+8,!0);if(v){const N=u.getUint16(L+48,!0);N&32768?(d=p,f=S,g=A):(d=(N&31)/31,f=(N>>5&31)/31,g=(N>>10&31)/31)}for(let N=1;N<=3;N++){const V=L+N*12,$=R*3*3+(N-1)*3;_[$]=u.getFloat32(V,!0),_[$+1]=u.getFloat32(V+4,!0),_[$+2]=u.getFloat32(V+8,!0),y[$]=z,y[$+1]=X,y[$+2]=O,v&&(P.setRGB(d,f,g,dt),m[$]=P.r,m[$+1]=P.g,m[$+2]=P.b)}}return w.setAttribute("position",new un(_,3)),w.setAttribute("normal",new un(y,3)),v&&(w.setAttribute("color",new un(m,3)),w.hasColors=!0,w.alpha=b),w}function r(c){const u=new Vt,h=/solid([\s\S]*?)endsolid/g,d=/facet([\s\S]*?)endfacet/g,f=/solid\s(.+)/;let g=0;const v=/[\s]+([+-]?(?:\d*)(?:\.\d*)?(?:[eE][+-]?\d+)?)/.source,m=new RegExp("vertex"+v+v+v,"g"),p=new RegExp("normal"+v+v+v,"g"),S=[],A=[],b=[],T=new I;let M,w=0,_=0,y=0;for(;(M=h.exec(c))!==null;){_=y;const P=M[0],R=(M=f.exec(P))!==null?M[1]:"";for(b.push(R);(M=d.exec(P))!==null;){let X=0,O=0;const N=M[0];for(;(M=p.exec(N))!==null;)T.x=parseFloat(M[1]),T.y=parseFloat(M[2]),T.z=parseFloat(M[3]),O++;for(;(M=m.exec(N))!==null;)S.push(parseFloat(M[1]),parseFloat(M[2]),parseFloat(M[3])),A.push(T.x,T.y,T.z),X++,y++;O!==1&&console.error("THREE.STLLoader: Something isn't right with the normal of face number "+g),X!==3&&console.error("THREE.STLLoader: Something isn't right with the vertices of face number "+g),g++}const L=_,z=y-_;u.userData.groupNames=b,u.addGroup(L,z,w),w++}return u.setAttribute("position",new Qe(S,3)),u.setAttribute("normal",new Qe(A,3)),u}function a(c){return typeof c!="string"?new TextDecoder().decode(c):c}function o(c){if(typeof c=="string"){const u=new Uint8Array(c.length);for(let h=0;h<c.length;h++)u[h]=c.charCodeAt(h)&255;return u.buffer||u}else return c}const l=o(e);return t(l)?s(l):r(a(e))}}class kh extends M_{constructor(e){super(e)}parse(e){function t(N){switch(N.image_type){case d:case v:if(N.colormap_length>256||N.colormap_size!==24||N.colormap_type!==1)throw new Error("THREE.TGALoader: Invalid type colormap data for indexed type.");break;case f:case g:case m:case p:if(N.colormap_type)throw new Error("THREE.TGALoader: Invalid type colormap data for colormap type.");break;case h:throw new Error("THREE.TGALoader: No data.");default:throw new Error("THREE.TGALoader: Invalid type "+N.image_type)}if(N.width<=0||N.height<=0)throw new Error("THREE.TGALoader: Invalid image size.");if(N.pixel_size!==8&&N.pixel_size!==16&&N.pixel_size!==24&&N.pixel_size!==32)throw new Error("THREE.TGALoader: Invalid pixel size "+N.pixel_size)}function n(N,V,$,j,re){let se,ae;const xe=$.pixel_size>>3,be=$.width*$.height*xe;if(V&&(ae=re.subarray(j,j+=$.colormap_length*($.colormap_size>>3))),N){se=new Uint8Array(be);let le,k,J,te=0;const Ae=new Uint8Array(xe);for(;te<be;)if(le=re[j++],k=(le&127)+1,le&128){for(J=0;J<xe;++J)Ae[J]=re[j++];for(J=0;J<k;++J)se.set(Ae,te+J*xe);te+=xe*k}else{for(k*=xe,J=0;J<k;++J)se[te+J]=re[j++];te+=k}}else se=re.subarray(j,j+=V?$.width*$.height:be);return{pixel_data:se,palettes:ae}}function s(N,V,$,j,re,se,ae,xe,be){const le=be;let k,J=0,te,Ae;const Fe=P.width;for(Ae=V;Ae!==j;Ae+=$)for(te=re;te!==ae;te+=se,J++)k=xe[J],N[(te+Fe*Ae)*4+3]=255,N[(te+Fe*Ae)*4+2]=le[k*3+0],N[(te+Fe*Ae)*4+1]=le[k*3+1],N[(te+Fe*Ae)*4+0]=le[k*3+2];return N}function r(N,V,$,j,re,se,ae,xe){let be,le=0,k,J;const te=P.width;for(J=V;J!==j;J+=$)for(k=re;k!==ae;k+=se,le+=2)be=xe[le+0]+(xe[le+1]<<8),N[(k+te*J)*4+0]=(be&31744)>>7,N[(k+te*J)*4+1]=(be&992)>>2,N[(k+te*J)*4+2]=(be&31)<<3,N[(k+te*J)*4+3]=be&32768?0:255;return N}function a(N,V,$,j,re,se,ae,xe){let be=0,le,k;const J=P.width;for(k=V;k!==j;k+=$)for(le=re;le!==ae;le+=se,be+=3)N[(le+J*k)*4+3]=255,N[(le+J*k)*4+2]=xe[be+0],N[(le+J*k)*4+1]=xe[be+1],N[(le+J*k)*4+0]=xe[be+2];return N}function o(N,V,$,j,re,se,ae,xe){let be=0,le,k;const J=P.width;for(k=V;k!==j;k+=$)for(le=re;le!==ae;le+=se,be+=4)N[(le+J*k)*4+2]=xe[be+0],N[(le+J*k)*4+1]=xe[be+1],N[(le+J*k)*4+0]=xe[be+2],N[(le+J*k)*4+3]=xe[be+3];return N}function l(N,V,$,j,re,se,ae,xe){let be,le=0,k,J;const te=P.width;for(J=V;J!==j;J+=$)for(k=re;k!==ae;k+=se,le++)be=xe[le],N[(k+te*J)*4+0]=be,N[(k+te*J)*4+1]=be,N[(k+te*J)*4+2]=be,N[(k+te*J)*4+3]=255;return N}function c(N,V,$,j,re,se,ae,xe){let be=0,le,k;const J=P.width;for(k=V;k!==j;k+=$)for(le=re;le!==ae;le+=se,be+=2)N[(le+J*k)*4+0]=xe[be+0],N[(le+J*k)*4+1]=xe[be+0],N[(le+J*k)*4+2]=xe[be+0],N[(le+J*k)*4+3]=xe[be+1];return N}function u(N,V,$,j,re){let se,ae,xe,be,le,k;switch((P.flags&S)>>A){default:case M:se=0,xe=1,le=V,ae=0,be=1,k=$;break;case b:se=0,xe=1,le=V,ae=$-1,be=-1,k=-1;break;case w:se=V-1,xe=-1,le=-1,ae=0,be=1,k=$;break;case T:se=V-1,xe=-1,le=-1,ae=$-1,be=-1,k=-1;break}if(z)switch(P.pixel_size){case 8:l(N,ae,be,k,se,xe,le,j);break;case 16:c(N,ae,be,k,se,xe,le,j);break;default:throw new Error("THREE.TGALoader: Format not supported.")}else switch(P.pixel_size){case 8:s(N,ae,be,k,se,xe,le,j,re);break;case 16:r(N,ae,be,k,se,xe,le,j);break;case 24:a(N,ae,be,k,se,xe,le,j);break;case 32:o(N,ae,be,k,se,xe,le,j);break;default:throw new Error("THREE.TGALoader: Format not supported.")}return N}const h=0,d=1,f=2,g=3,v=9,m=10,p=11,S=48,A=4,b=0,T=1,M=2,w=3;if(e.length<19)throw new Error("THREE.TGALoader: Not enough data to contain header.");let _=0;const y=new Uint8Array(e),P={id_length:y[_++],colormap_type:y[_++],image_type:y[_++],colormap_index:y[_++]|y[_++]<<8,colormap_length:y[_++]|y[_++]<<8,colormap_size:y[_++],origin:[y[_++]|y[_++]<<8,y[_++]|y[_++]<<8],width:y[_++]|y[_++]<<8,height:y[_++]|y[_++]<<8,pixel_size:y[_++],flags:y[_++]};if(t(P),P.id_length+_>e.length)throw new Error("THREE.TGALoader: No data.");_+=P.id_length;let R=!1,L=!1,z=!1;switch(P.image_type){case v:R=!0,L=!0;break;case d:L=!0;break;case m:R=!0;break;case f:break;case p:R=!0,z=!0;break;case g:z=!0;break}const X=new Uint8Array(P.width*P.height*4),O=n(R,L,P,_,y);return u(X,P.width,P.height,O.pixel_data,O.palettes),{data:X,width:P.width,height:P.height,flipY:!0,generateMipmaps:!0,minFilter:oi}}}function on(i,e){const t=[],n=i.childNodes;for(let s=0,r=n.length;s<r;s++){const a=n[s];a.nodeName===e&&t.push(a)}return t}function $y(i){return i.length===0?[]:i.trim().split(/\s+/)}function Jt(i){return i.length===0?[]:i.trim().split(/\s+/).map(parseFloat)}function Ha(i){return i.length===0?[]:i.trim().split(/\s+/).map(e=>parseInt(e))}function Ut(i){return i.substring(1)}class Yy{constructor(){this.count=0}generateId(){return"three_default_"+this.count++}parse(e){if(e.length===0)return null;const t=new DOMParser().parseFromString(e,"application/xml"),n=on(t,"COLLADA")[0],s=t.getElementsByTagName("parsererror")[0];if(s!==void 0){const l=on(s,"div")[0];let c;return l?c=l.textContent:c=this.parserErrorToText(s),console.error(`THREE.ColladaLoader: Failed to parse collada file.
`,c),null}const r=n.getAttribute("version");console.debug("THREE.ColladaLoader: File version",r);const a=this.parseAsset(on(n,"asset")[0]),o={animations:{},clips:{},controllers:{},images:{},effects:{},materials:{},cameras:{},lights:{},geometries:{},nodes:{},visualScenes:{},kinematicsModels:{},physicsModels:{},kinematicsScenes:{},joints:{}};return this.library=o,this.collada=n,this.parseLibrary(n,"library_animations","animation",this.parseAnimation.bind(this)),this.parseLibrary(n,"library_animation_clips","animation_clip",this.parseAnimationClip.bind(this)),this.parseLibrary(n,"library_controllers","controller",this.parseController.bind(this)),this.parseLibrary(n,"library_images","image",this.parseImage.bind(this)),this.parseLibrary(n,"library_effects","effect",this.parseEffect.bind(this)),this.parseLibrary(n,"library_materials","material",this.parseMaterial.bind(this)),this.parseLibrary(n,"library_cameras","camera",this.parseCamera.bind(this)),this.parseLibrary(n,"library_lights","light",this.parseLight.bind(this)),this.parseLibrary(n,"library_geometries","geometry",this.parseGeometry.bind(this)),this.parseLibrary(n,"library_nodes","node",this.parseNode.bind(this)),this.parseLibrary(n,"library_visual_scenes","visual_scene",this.parseVisualScene.bind(this)),this.parseLibrary(n,"library_joints","joint",this.parseLibraryJoint.bind(this)),this.parseLibrary(n,"library_kinematics_models","kinematics_model",this.parseKinematicsModel.bind(this)),this.parseLibrary(n,"library_physics_models","physics_model",this.parsePhysicsModel.bind(this)),this.parseLibrary(n,"scene","instance_kinematics_scene",this.parseKinematicsScene.bind(this)),{library:o,asset:a,collada:n}}parserErrorToText(e){const t=[],n=[e];for(;n.length;){const s=n.shift();s.nodeType===Node.TEXT_NODE?t.push(s.textContent):(t.push(`
`),n.push(...s.childNodes))}return t.join("").trim()}parseAsset(e){return{unit:this.parseAssetUnit(on(e,"unit")[0]),upAxis:this.parseAssetUpAxis(on(e,"up_axis")[0])}}parseAssetUnit(e){return e!==void 0&&e.hasAttribute("meter")===!0?parseFloat(e.getAttribute("meter")):1}parseAssetUpAxis(e){return e!==void 0?e.textContent:"Y_UP"}parseLibrary(e,t,n,s){const r=on(e,t)[0];if(r!==void 0){const a=on(r,n);for(let o=0;o<a.length;o++)s(a[o])}}parseAnimation(e){const t={sources:{},samplers:{},channels:{}};let n=!1;for(let s=0,r=e.childNodes.length;s<r;s++){const a=e.childNodes[s];if(a.nodeType!==1)continue;let o;switch(a.nodeName){case"source":o=a.getAttribute("id"),t.sources[o]=this.parseSource(a);break;case"sampler":o=a.getAttribute("id"),t.samplers[o]=this.parseAnimationSampler(a);break;case"channel":o=a.getAttribute("target"),t.channels[o]=this.parseAnimationChannel(a);break;case"animation":this.parseAnimation(a),n=!0;break}}n===!1&&(this.library.animations[e.getAttribute("id")||kn.generateUUID()]=t)}parseAnimationSampler(e){const t={inputs:{}};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"input":const a=Ut(r.getAttribute("source")),o=r.getAttribute("semantic");t.inputs[o]=a;break}}return t}parseAnimationChannel(e){const t={};let s=e.getAttribute("target").split("/");const r=s.shift();let a=s.shift();const o=a.indexOf("(")!==-1,l=a.indexOf(".")!==-1;if(l)s=a.split("."),a=s.shift(),t.member=s.shift();else if(o){const c=a.split("(");a=c.shift();for(let u=0;u<c.length;u++)c[u]=parseInt(c[u].replace(/\)/,""));t.indices=c}return t.id=r,t.sid=a,t.arraySyntax=o,t.memberSyntax=l,t.sampler=Ut(e.getAttribute("source")),t}parseAnimationClip(e){const t={name:e.getAttribute("id")||"default",start:parseFloat(e.getAttribute("start")||0),end:parseFloat(e.getAttribute("end")||0),animations:[]};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"instance_animation":t.animations.push(Ut(r.getAttribute("url")));break}}this.library.clips[e.getAttribute("id")]=t}parseController(e){const t={};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"skin":t.id=Ut(r.getAttribute("source")),t.skin=this.parseSkin(r);break;case"morph":t.id=Ut(r.getAttribute("source")),console.warn("THREE.ColladaLoader: Morph target animation not supported yet.");break}}this.library.controllers[e.getAttribute("id")]=t}parseSkin(e){const t={sources:{}};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"bind_shape_matrix":t.bindShapeMatrix=Jt(r.textContent);break;case"source":const a=r.getAttribute("id");t.sources[a]=this.parseSource(r);break;case"joints":t.joints=this.parseJoints(r);break;case"vertex_weights":t.vertexWeights=this.parseVertexWeights(r);break}}return t}parseJoints(e){const t={inputs:{}};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"input":const a=r.getAttribute("semantic"),o=Ut(r.getAttribute("source"));t.inputs[a]=o;break}}return t}parseVertexWeights(e){const t={inputs:{}};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"input":const a=r.getAttribute("semantic"),o=Ut(r.getAttribute("source")),l=parseInt(r.getAttribute("offset"));t.inputs[a]={id:o,offset:l};break;case"vcount":t.vcount=Ha(r.textContent);break;case"v":t.v=Ha(r.textContent);break}}return t}parseImage(e){const t={init_from:on(e,"init_from")[0].textContent};this.library.images[e.getAttribute("id")]=t}parseEffect(e){const t={};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"profile_COMMON":t.profile=this.parseEffectProfileCOMMON(r);break}}this.library.effects[e.getAttribute("id")]=t}parseEffectProfileCOMMON(e){const t={surfaces:{},samplers:{}};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"newparam":this.parseEffectNewparam(r,t);break;case"technique":t.technique=this.parseEffectTechnique(r);break;case"extra":t.extra=this.parseEffectExtra(r);break}}return t}parseEffectNewparam(e,t){const n=e.getAttribute("sid");for(let s=0,r=e.childNodes.length;s<r;s++){const a=e.childNodes[s];if(a.nodeType===1)switch(a.nodeName){case"surface":t.surfaces[n]=this.parseEffectSurface(a);break;case"sampler2D":t.samplers[n]=this.parseEffectSampler(a);break}}}parseEffectSurface(e){const t={};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"init_from":t.init_from=r.textContent;break}}return t}parseEffectSampler(e){const t={};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"source":t.source=r.textContent;break}}return t}parseEffectTechnique(e){const t={};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"constant":case"lambert":case"blinn":case"phong":t.type=r.nodeName,t.parameters=this.parseEffectParameters(r);break;case"extra":t.extra=this.parseEffectExtra(r);break}}return t}parseEffectParameters(e){const t={};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"emission":case"diffuse":case"specular":case"bump":case"ambient":case"shininess":case"transparency":t[r.nodeName]=this.parseEffectParameter(r);break;case"transparent":t[r.nodeName]={opaque:r.hasAttribute("opaque")?r.getAttribute("opaque"):"A_ONE",data:this.parseEffectParameter(r)};break}}return t}parseEffectParameter(e){const t={};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"color":t[r.nodeName]=Jt(r.textContent);break;case"float":t[r.nodeName]=parseFloat(r.textContent);break;case"texture":t[r.nodeName]={id:r.getAttribute("texture"),extra:this.parseEffectParameterTexture(r)};break}}return t}parseEffectParameterTexture(e){const t={technique:{}};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"extra":this.parseEffectParameterTextureExtra(r,t);break}}return t}parseEffectParameterTextureExtra(e,t){for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"technique":this.parseEffectParameterTextureExtraTechnique(r,t);break}}}parseEffectParameterTextureExtraTechnique(e,t){for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"repeatU":case"repeatV":case"offsetU":case"offsetV":t.technique[r.nodeName]=parseFloat(r.textContent);break;case"wrapU":case"wrapV":r.textContent.toUpperCase()==="TRUE"?t.technique[r.nodeName]=1:r.textContent.toUpperCase()==="FALSE"?t.technique[r.nodeName]=0:t.technique[r.nodeName]=parseInt(r.textContent);break;case"bump":t[r.nodeName]=this.parseEffectExtraTechniqueBump(r);break}}}parseEffectExtra(e){const t={};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"technique":t.technique=this.parseEffectExtraTechnique(r);break}}return t}parseEffectExtraTechnique(e){const t={};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"double_sided":t[r.nodeName]=parseInt(r.textContent);break;case"bump":t[r.nodeName]=this.parseEffectExtraTechniqueBump(r);break}}return t}parseEffectExtraTechniqueBump(e){const t={};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"texture":t[r.nodeName]={id:r.getAttribute("texture"),texcoord:r.getAttribute("texcoord"),extra:this.parseEffectParameterTexture(r)};break}}return t}parseMaterial(e){const t={name:e.getAttribute("name")};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"instance_effect":t.url=Ut(r.getAttribute("url"));break}}this.library.materials[e.getAttribute("id")]=t}parseCamera(e){const t={name:e.getAttribute("name")};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"optics":t.optics=this.parseCameraOptics(r);break}}this.library.cameras[e.getAttribute("id")]=t}parseCameraOptics(e){for(let t=0;t<e.childNodes.length;t++){const n=e.childNodes[t];switch(n.nodeName){case"technique_common":return this.parseCameraTechnique(n)}}return{}}parseCameraTechnique(e){const t={};for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];switch(s.nodeName){case"perspective":case"orthographic":t.technique=s.nodeName,t.parameters=this.parseCameraParameters(s);break}}return t}parseCameraParameters(e){const t={};for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];switch(s.nodeName){case"xfov":case"yfov":case"xmag":case"ymag":case"znear":case"zfar":case"aspect_ratio":t[s.nodeName]=parseFloat(s.textContent);break}}return t}parseLight(e){let t={};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"technique_common":t=this.parseLightTechnique(r);break}}this.library.lights[e.getAttribute("id")]=t}parseLightTechnique(e){const t={};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"directional":case"point":case"spot":case"ambient":t.technique=r.nodeName,t.parameters=this.parseLightParameters(r);break}}return t}parseLightParameters(e){const t={};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"color":const a=Jt(r.textContent);t.color=new ke().fromArray(a),Xe.colorSpaceToWorking(t.color,dt);break;case"falloff_angle":t.falloffAngle=parseFloat(r.textContent);break;case"quadratic_attenuation":const o=parseFloat(r.textContent);t.distance=o?Math.sqrt(1/o):0;break}}return t}parseGeometry(e){const t={name:e.getAttribute("name"),sources:{},vertices:{},primitives:[]},n=on(e,"mesh")[0];if(n!==void 0){for(let s=0;s<n.childNodes.length;s++){const r=n.childNodes[s];if(r.nodeType!==1)continue;const a=r.getAttribute("id");switch(r.nodeName){case"source":t.sources[a]=this.parseSource(r);break;case"vertices":t.vertices=this.parseGeometryVertices(r);break;case"polygons":case"lines":case"linestrips":case"polylist":case"triangles":t.primitives.push(this.parseGeometryPrimitive(r));break}}this.library.geometries[e.getAttribute("id")]=t}}parseSource(e){const t={array:[],stride:3};for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];if(s.nodeType===1)switch(s.nodeName){case"float_array":t.array=Jt(s.textContent);break;case"Name_array":t.array=$y(s.textContent);break;case"technique_common":const r=on(s,"accessor")[0];r!==void 0&&(t.stride=parseInt(r.getAttribute("stride")));break}}return t}parseGeometryVertices(e){const t={};for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];s.nodeType===1&&(t[s.getAttribute("semantic")]=Ut(s.getAttribute("source")))}return t}parseGeometryPrimitive(e){const t={type:e.nodeName,material:e.getAttribute("material"),count:parseInt(e.getAttribute("count")),inputs:{},stride:0,hasUV:!1};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"input":const a=Ut(r.getAttribute("source")),o=r.getAttribute("semantic"),l=parseInt(r.getAttribute("offset")),c=parseInt(r.getAttribute("set")),u=c>0?o+c:o;t.inputs[u]={id:a,offset:l},t.stride=Math.max(t.stride,l+1),o==="TEXCOORD"&&(t.hasUV=!0);break;case"vcount":t.vcount=Ha(r.textContent);break;case"p":t.p=Ha(r.textContent);break}}return t.type==="polygons"&&(t.vcount=[t.p.length/t.stride]),t}parseLibraryJoint(e){this.library.joints[e.getAttribute("id")]=this.parseKinematicsJoint(e)}parseKinematicsModel(e){const t={name:e.getAttribute("name")||"",joints:{},links:[]};for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];if(s.nodeType===1)switch(s.nodeName){case"technique_common":this.parseKinematicsTechniqueCommon(s,t);break}}this.library.kinematicsModels[e.getAttribute("id")]=t}parseKinematicsTechniqueCommon(e,t){for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];if(s.nodeType===1)switch(s.nodeName){case"joint":t.joints[s.getAttribute("sid")]=this.parseKinematicsJoint(s);break;case"instance_joint":t.joints[s.getAttribute("sid")]=this.library.joints[Ut(s.getAttribute("url"))];break;case"link":t.links.push(this.parseKinematicsLink(s));break}}}parseKinematicsJoint(e){let t;for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];if(s.nodeType===1)switch(s.nodeName){case"prismatic":case"revolute":t=this.parseKinematicsJointParameter(s);break}}return t}parseKinematicsJointParameter(e){const t={sid:e.getAttribute("sid"),name:e.getAttribute("name")||"",axis:new I,limits:{min:0,max:0},type:e.nodeName,static:!1,zeroPosition:0,middlePosition:0};for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];if(s.nodeType===1)switch(s.nodeName){case"axis":const r=Jt(s.textContent);t.axis.fromArray(r);break;case"limits":const a=s.getElementsByTagName("max")[0],o=s.getElementsByTagName("min")[0];t.limits.max=parseFloat(a.textContent),t.limits.min=parseFloat(o.textContent);break}}return t.limits.min>=t.limits.max&&(t.static=!0),t.middlePosition=(t.limits.min+t.limits.max)/2,t}parseKinematicsLink(e){const t={sid:e.getAttribute("sid"),name:e.getAttribute("name")||"",attachments:[],transforms:[]};for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];if(s.nodeType===1)switch(s.nodeName){case"attachment_full":t.attachments.push(this.parseKinematicsAttachment(s));break;case"matrix":case"translate":case"rotate":t.transforms.push(this.parseKinematicsTransform(s));break}}return t}parseKinematicsAttachment(e){const t={joint:e.getAttribute("joint").split("/").pop(),transforms:[],links:[]};for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];if(s.nodeType===1)switch(s.nodeName){case"link":t.links.push(this.parseKinematicsLink(s));break;case"matrix":case"translate":case"rotate":t.transforms.push(this.parseKinematicsTransform(s));break}}return t}parseKinematicsTransform(e){const t={type:e.nodeName},n=Jt(e.textContent);switch(t.type){case"matrix":t.obj=new Oe,t.obj.fromArray(n).transpose();break;case"translate":t.obj=new I,t.obj.fromArray(n);break;case"rotate":t.obj=new I,t.obj.fromArray(n),t.angle=kn.degToRad(n[3]);break}return t}parsePhysicsModel(e){const t={name:e.getAttribute("name")||"",rigidBodies:{}};for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];if(s.nodeType===1)switch(s.nodeName){case"rigid_body":t.rigidBodies[s.getAttribute("name")]={},this.parsePhysicsRigidBody(s,t.rigidBodies[s.getAttribute("name")]);break}}this.library.physicsModels[e.getAttribute("id")]=t}parsePhysicsRigidBody(e,t){for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];if(s.nodeType===1)switch(s.nodeName){case"technique_common":this.parsePhysicsTechniqueCommon(s,t);break}}}parsePhysicsTechniqueCommon(e,t){for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];if(s.nodeType===1)switch(s.nodeName){case"inertia":t.inertia=Jt(s.textContent);break;case"mass":t.mass=Jt(s.textContent)[0];break}}}parseKinematicsScene(e){const t={bindJointAxis:[]};for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];if(s.nodeType===1)switch(s.nodeName){case"bind_joint_axis":t.bindJointAxis.push(this.parseKinematicsBindJointAxis(s));break}}this.library.kinematicsScenes[Ut(e.getAttribute("url"))]=t}parseKinematicsBindJointAxis(e){const t={target:e.getAttribute("target").split("/").pop()};for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];if(s.nodeType===1)switch(s.nodeName){case"axis":const r=s.getElementsByTagName("param")[0];t.axis=r.textContent;const a=t.axis.split("inst_").pop().split("axis")[0];t.jointIndex=a.substring(0,a.length-1);break}}return t}prepareNodes(e){const t=e.getElementsByTagName("node");for(let n=0;n<t.length;n++){const s=t[n];s.hasAttribute("id")===!1&&s.setAttribute("id",this.generateId())}}parseNode(e){const t=new Oe,n=new I,s={name:e.getAttribute("name")||"",type:e.getAttribute("type"),id:e.getAttribute("id"),sid:e.getAttribute("sid"),matrix:new Oe,nodes:[],instanceCameras:[],instanceControllers:[],instanceLights:[],instanceGeometries:[],instanceNodes:[],transforms:{},transformData:{},transformOrder:[]};for(let r=0;r<e.childNodes.length;r++){const a=e.childNodes[r];if(a.nodeType!==1)continue;let o;switch(a.nodeName){case"node":s.nodes.push(a.getAttribute("id")),this.parseNode(a);break;case"instance_camera":s.instanceCameras.push(Ut(a.getAttribute("url")));break;case"instance_controller":s.instanceControllers.push(this.parseNodeInstance(a));break;case"instance_light":s.instanceLights.push(Ut(a.getAttribute("url")));break;case"instance_geometry":s.instanceGeometries.push(this.parseNodeInstance(a));break;case"instance_node":s.instanceNodes.push(Ut(a.getAttribute("url")));break;case"matrix":o=Jt(a.textContent),s.matrix.multiply(t.fromArray(o).transpose());{const l=a.getAttribute("sid");s.transforms[l]=a.nodeName,s.transformData[l]={type:"matrix",array:o},s.transformOrder.push(l)}break;case"translate":o=Jt(a.textContent),n.fromArray(o),s.matrix.multiply(t.makeTranslation(n.x,n.y,n.z));{const l=a.getAttribute("sid");s.transforms[l]=a.nodeName,s.transformData[l]={type:"translate",x:o[0],y:o[1],z:o[2]},s.transformOrder.push(l)}break;case"rotate":o=Jt(a.textContent);{const l=kn.degToRad(o[3]);s.matrix.multiply(t.makeRotationAxis(n.fromArray(o),l));const c=a.getAttribute("sid");s.transforms[c]=a.nodeName,s.transformData[c]={type:"rotate",axis:[o[0],o[1],o[2]],angle:o[3]},s.transformOrder.push(c)}break;case"scale":o=Jt(a.textContent),s.matrix.scale(n.fromArray(o));{const l=a.getAttribute("sid");s.transforms[l]=a.nodeName,s.transformData[l]={type:"scale",x:o[0],y:o[1],z:o[2]},s.transformOrder.push(l)}break}}return this.hasNode(s.id)?console.warn("THREE.ColladaLoader: There is already a node with ID %s. Exclude current node from further processing.",s.id):this.library.nodes[s.id]=s,s}parseNodeInstance(e){const t={id:Ut(e.getAttribute("url")),materials:{},skeletons:[]};for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];switch(s.nodeName){case"bind_material":const r=s.getElementsByTagName("instance_material");for(let a=0;a<r.length;a++){const o=r[a],l=o.getAttribute("symbol"),c=o.getAttribute("target");t.materials[l]=Ut(c)}break;case"skeleton":t.skeletons.push(Ut(s.textContent));break}}return t}parseVisualScene(e){const t={name:e.getAttribute("name"),children:[]};this.prepareNodes(e);const n=on(e,"node");for(let s=0;s<n.length;s++)t.children.push(this.parseNode(n[s]));this.library.visualScenes[e.getAttribute("id")]=t}hasNode(e){return this.library.nodes[e]!==void 0}}class Ky{constructor(e,t,n,s){this.library=e,this.collada=t,this.textureLoader=n,this.tgaLoader=s,this.tempColor=new ke,this.animations=[],this.kinematics={},this.position=new I,this.scale=new I,this.quaternion=new kt,this.matrix=new Oe,this.deferredPivotAnimations={},this.transformNodes={}}compose(){const e=this.library;this.buildLibrary(e.animations,this.buildAnimation.bind(this)),this.buildLibrary(e.clips,this.buildAnimationClip.bind(this)),this.buildLibrary(e.controllers,this.buildController.bind(this)),this.buildLibrary(e.images,this.buildImage.bind(this)),this.buildLibrary(e.effects,this.buildEffect.bind(this)),this.buildLibrary(e.materials,this.buildMaterial.bind(this)),this.buildLibrary(e.cameras,this.buildCamera.bind(this)),this.buildLibrary(e.lights,this.buildLight.bind(this)),this.buildLibrary(e.geometries,this.buildGeometry.bind(this)),this.buildLibrary(e.visualScenes,this.buildVisualScene.bind(this)),this.setupAnimations(),this.setupKinematics();const t=this.parseScene(on(this.collada,"scene")[0]);return t.animations=this.animations,{scene:t,animations:this.animations,kinematics:this.kinematics}}buildLibrary(e,t){for(const n in e){const s=e[n];s.build=t(e[n])}}getBuild(e,t){return e.build!==void 0||(e.build=t(e)),e.build}isEmpty(e){return Object.keys(e).length===0}buildAnimation(e){const t=[],n=e.channels,s=e.samplers,r=e.sources,a=this.aggregateAnimationChannels(n,s,r);for(const o in a){const l=this.library.nodes[o];if(!l)continue;const c=a[o];if(this.hasPivotTransforms(l))this.collectDeferredPivotAnimation(o,c);else{const u=this.getNode(o);let h=!1;for(const d in c){const f=l.transforms[d],g=l.transformData[d],v=c[d];switch(f){case"matrix":this.buildMatrixTracks(u,v,l,t);break;case"translate":this.buildTranslateTrack(u,v,g,t);break;case"rotate":h||(this.buildRotateTrack(u,d,v,g,l,t),h=!0);break;case"scale":this.buildScaleTrack(u,v,g,t);break}}}}return t}collectDeferredPivotAnimation(e,t){this.deferredPivotAnimations[e]||(this.deferredPivotAnimations[e]={});const n=this.deferredPivotAnimations[e];for(const s in t){n[s]||(n[s]={});for(const r in t[s])n[s][r]=t[s][r]}}hasPivotTransforms(e){const t=["rotatePivot","rotatePivotInverse","rotatePivotTranslation","scalePivot","scalePivotInverse","scalePivotTranslation"];for(const n of t)if(e.transforms[n]!==void 0)return!0;return!1}getAnimation(e){return this.getBuild(this.library.animations[e],this.buildAnimation.bind(this))}aggregateAnimationChannels(e,t,n){const s={};for(const r in e){if(!e.hasOwnProperty(r))continue;const a=e[r],o=t[a.sampler],l=o.inputs.INPUT,c=o.inputs.OUTPUT,u=n[l],h=n[c],d=o.inputs.INTERPOLATION,f=o.inputs.IN_TANGENT,g=o.inputs.OUT_TANGENT,v=d?n[d]:null,m=f?n[f]:null,p=g?n[g]:null,S=a.id,A=a.sid,b=a.member||"default";s[S]||(s[S]={}),s[S][A]||(s[S][A]={}),s[S][A][b]={times:u.array,values:h.array,stride:h.stride,arraySyntax:a.arraySyntax,indices:a.indices,interpolation:v?v.array:null,inTangent:m?m.array:null,outTangent:p?p.array:null,inTangentStride:m?m.stride:0,outTangentStride:p?p.stride:0}}return s}buildMatrixTracks(e,t,n,s){const r=n.matrix.clone().transpose(),a={};for(const c in t){const u=t[c],h=u.times,d=u.values,f=u.stride;for(let g=0,v=h.length;g<v;g++){const m=h[g],p=g*f;if(a[m]===void 0&&(a[m]={}),u.arraySyntax===!0){const S=d[p],A=u.indices[0]+4*u.indices[1];a[m][A]=S}else for(let S=0;S<f;S++)a[m][S]=d[p+S]}}const o=this.prepareAnimationData(a,r),l={name:e.uuid,keyframes:o};this.createKeyframeTracks(l,s)}buildTranslateTrack(e,t,n,s){if(t.default&&t.default.stride===3){const c=t.default,u=Array.from(c.times),h=Array.from(c.values),d=new mn(e.uuid+".position",u,h),f=this.getInterpolationInfo(t);this.applyInterpolation(d,f,t),s.push(d);return}const r=this.getTimesForAllAxes(t);if(r.length===0)return;const a=[],o=this.getInterpolationInfo(t);for(let c=0;c<r.length;c++){const u=r[c],h=this.getValueAtTime(t.X,u,n.x),d=this.getValueAtTime(t.Y,u,n.y),f=this.getValueAtTime(t.Z,u,n.z);a.push(h,d,f)}const l=new mn(e.uuid+".position",r,a);this.applyInterpolation(l,o),s.push(l)}buildRotateTrack(e,t,n,s,r,a){const o=n.ANGLE||n.default;if(!o)return;const l=Array.from(o.times);if(l.length===0)return;const c=[];for(const m of r.transformOrder)if(r.transforms[m]==="rotate"){const S=r.transformData[m];c.push({sid:m,axis:new I(S.axis[0],S.axis[1],S.axis[2]),defaultAngle:S.angle})}const u=new kt,h=new kt,d=new kt,f=[],g=this.getInterpolationInfo(n);for(let m=0;m<l.length;m++){const p=l[m];u.identity();for(const S of c){let A;S.sid===t?A=this.getValueAtTime(o,p,S.defaultAngle):A=S.defaultAngle;const b=kn.degToRad(A);d.setFromAxisAngle(S.axis,b),u.multiply(d)}m>0&&h.dot(u)<0&&(u.x=-u.x,u.y=-u.y,u.z=-u.z,u.w=-u.w),h.copy(u),f.push(u.x,u.y,u.z,u.w)}const v=new ir(e.uuid+".quaternion",l,f);this.applyInterpolation(v,g),a.push(v)}buildScaleTrack(e,t,n,s){if(t.default&&t.default.stride===3){const c=t.default,u=Array.from(c.times),h=Array.from(c.values),d=new mn(e.uuid+".scale",u,h),f=this.getInterpolationInfo(t);this.applyInterpolation(d,f,t),s.push(d);return}const r=this.getTimesForAllAxes(t);if(r.length===0)return;const a=[],o=this.getInterpolationInfo(t);for(let c=0;c<r.length;c++){const u=r[c],h=this.getValueAtTime(t.X,u,n.x),d=this.getValueAtTime(t.Y,u,n.y),f=this.getValueAtTime(t.Z,u,n.z);a.push(h,d,f)}const l=new mn(e.uuid+".scale",r,a);this.applyInterpolation(l,o),s.push(l)}getTimesForAllAxes(e){let t=[];return e.X&&(t=t.concat(Array.from(e.X.times))),e.Y&&(t=t.concat(Array.from(e.Y.times))),e.Z&&(t=t.concat(Array.from(e.Z.times))),e.ANGLE&&(t=t.concat(Array.from(e.ANGLE.times))),e.default&&(t=t.concat(Array.from(e.default.times))),t=[...new Set(t)].sort((n,s)=>n-s),t}getValueAtTime(e,t,n){if(!e)return n;const s=e.times,r=e.values,a=e.interpolation;for(let o=0;o<s.length;o++){if(s[o]===t)return r[o];if(s[o]>t){if(o===0)return r[0];const l=o-1,c=o,u=s[l],h=s[c],d=r[l],f=r[c],g=a?a[l]:"LINEAR";if(g==="STEP")return d;if(g==="BEZIER"&&e.inTangent&&e.outTangent)return this.evaluateBezierComponent(e,l,c,u,h,t);{const v=(t-u)/(h-u);return d+v*(f-d)}}}return r[r.length-1]}evaluateBezierComponent(e,t,n,s,r,a){const o=e.values,l=e.inTangent,c=e.outTangent,u=e.inTangentStride||1,h=o[t],d=o[n];let f,g,v,m;u===2?(f=c[t*2],g=c[t*2+1],v=l[n*2],m=l[n*2+1]):(f=s+(r-s)/3,g=c[t],v=r-(r-s)/3,m=l[n]);let p=(a-s)/(r-s);for(let w=0;w<8;w++){const _=p*p,y=_*p,P=1-p,R=P*P,z=R*P*s+3*R*p*f+3*P*_*v+y*r,X=3*R*(f-s)+6*P*p*(v-f)+3*_*(r-v);if(Math.abs(X)<1e-10)break;const O=z-a;if(Math.abs(O)<1e-10)break;p=p-O/X,p=Math.max(0,Math.min(1,p))}const S=p*p,A=S*p,b=1-p,T=b*b;return T*b*h+3*T*p*g+3*b*S*m+A*d}getInterpolationInfo(e){const t=["X","Y","Z","ANGLE","default"];let n=null,s=!0;for(const r of t){const a=e[r];if(!a||!a.interpolation)continue;const o=a.interpolation;for(let l=0;l<o.length;l++){const c=o[l];n===null?n=c:c!==n&&(s=!1)}}return{type:n||"LINEAR",uniform:s}}applyInterpolation(e,t,n=null){if(t.type==="STEP"&&t.uniform)e.setInterpolation(Vr);else if(t.type==="BEZIER"&&t.uniform&&n){const s=n.default;s&&s.inTangent&&s.outTangent&&(e.setInterpolation(Vc),e.settings={inTangents:new Float32Array(s.inTangent),outTangents:new Float32Array(s.outTangent)})}}prepareAnimationData(e,t){const n=[];for(const s in e)n.push({time:parseFloat(s),value:e[s]});n.sort((s,r)=>s.time-r.time);for(let s=0;s<16;s++)this.transformAnimationData(n,s,t.elements[s]);return n}createKeyframeTracks(e,t){const n=e.keyframes,s=e.name,r=[],a=[],o=[],l=[],c=this.position,u=this.quaternion,h=this.scale,d=this.matrix;for(let f=0,g=n.length;f<g;f++){const v=n[f],m=v.time,p=v.value;d.fromArray(p).transpose(),d.decompose(c,u,h),r.push(m),a.push(c.x,c.y,c.z),o.push(u.x,u.y,u.z,u.w),l.push(h.x,h.y,h.z)}return a.length>0&&t.push(new mn(s+".position",r,a)),o.length>0&&t.push(new ir(s+".quaternion",r,o)),l.length>0&&t.push(new mn(s+".scale",r,l)),t}transformAnimationData(e,t,n){let s,r=!0,a,o;for(a=0,o=e.length;a<o;a++)s=e[a],s.value[t]===void 0?s.value[t]=null:r=!1;if(r===!0)for(a=0,o=e.length;a<o;a++)s=e[a],s.value[t]=n;else this.createMissingKeyframes(e,t)}createMissingKeyframes(e,t){let n,s;for(let r=0,a=e.length;r<a;r++){const o=e[r];if(o.value[t]===null){if(n=this.getPrev(e,r,t),s=this.getNext(e,r,t),n===null){o.value[t]=s.value[t];continue}if(s===null){o.value[t]=n.value[t];continue}this.interpolate(o,n,s,t)}}}getPrev(e,t,n){for(;t>=0;){const s=e[t];if(s.value[n]!==null)return s;t--}return null}getNext(e,t,n){for(;t<e.length;){const s=e[t];if(s.value[n]!==null)return s;t++}return null}interpolate(e,t,n,s){if(n.time-t.time===0){e.value[s]=t.value[s];return}e.value[s]=(e.time-t.time)*(n.value[s]-t.value[s])/(n.time-t.time)+t.value[s]}buildAnimationClip(e){const t=[],n=e.name,s=e.end-e.start||-1,r=e.animations;for(let a=0,o=r.length;a<o;a++){const l=this.getAnimation(r[a]);for(let c=0,u=l.length;c<u;c++)t.push(l[c])}return new nh(n,s,t)}getAnimationClip(e){return this.getBuild(this.library.clips[e],this.buildAnimationClip.bind(this))}buildController(e){const t={id:e.id},n=this.library.geometries[t.id];return e.skin!==void 0&&(t.skin=this.buildSkin(e.skin),n.sources.skinIndices=t.skin.indices,n.sources.skinWeights=t.skin.weights),t}buildSkin(e){const n={joints:[],indices:{array:[],stride:4},weights:{array:[],stride:4}},s=e.sources,r=e.vertexWeights,a=r.vcount,o=r.v,l=r.inputs.JOINT.offset,c=r.inputs.WEIGHT.offset,u=e.sources[e.joints.inputs.JOINT],h=e.sources[e.joints.inputs.INV_BIND_MATRIX],d=s[r.inputs.WEIGHT.id].array;let f=0,g,v,m;for(g=0,m=a.length;g<m;g++){const S=a[g],A=[];for(v=0;v<S;v++){const b=o[f+l],T=o[f+c],M=d[T];A.push({index:b,weight:M}),f+=2}for(A.sort(p),v=0;v<4;v++){const b=A[v];b!==void 0?(n.indices.array.push(b.index),n.weights.array.push(b.weight)):(n.indices.array.push(0),n.weights.array.push(0))}}for(e.bindShapeMatrix?n.bindMatrix=new Oe().fromArray(e.bindShapeMatrix).transpose():n.bindMatrix=new Oe().identity(),g=0,m=u.array.length;g<m;g++){const S=u.array[g],A=new Oe().fromArray(h.array,g*h.stride).transpose();n.joints.push({name:S,boneInverse:A})}return n;function p(S,A){return A.weight-S.weight}}getController(e){return this.getBuild(this.library.controllers[e],this.buildController.bind(this))}buildImage(e){return e.build!==void 0?e.build:e.init_from}getImage(e){const t=this.library.images[e];return t!==void 0?this.getBuild(t,this.buildImage.bind(this)):(console.warn("THREE.ColladaLoader: Couldn't find image with ID:",e),null)}buildEffect(e){return e}getEffect(e){return this.getBuild(this.library.effects[e],this.buildEffect.bind(this))}getTextureLoader(e){let t,n=e.slice((e.lastIndexOf(".")-1>>>0)+2);switch(n=n.toLowerCase(),n){case"tga":t=this.tgaLoader;break;default:t=this.textureLoader}return t}buildMaterial(e){const t=this.getEffect(e.url),n=t.profile.technique;let s;switch(n.type){case"phong":case"blinn":s=new Cr;break;case"lambert":s=new o_;break;default:s=new Xr;break}s.name=e.name||"";const r=this;function a(u,h=null){const d=t.profile.samplers[u.id];let f=null;if(d!==void 0){const g=t.profile.surfaces[d.source];f=r.getImage(g.init_from)}else console.warn("THREE.ColladaLoader: Undefined sampler. Access image directly (see #12530)."),f=r.getImage(u.id);if(f!==null){const g=r.getTextureLoader(f);if(g!==void 0){const v=g.load(f),m=u.extra;if(m!==void 0&&m.technique!==void 0&&r.isEmpty(m.technique)===!1){const p=m.technique;v.wrapS=p.wrapU?ds:dn,v.wrapT=p.wrapV?ds:dn,v.offset.set(p.offsetU||0,p.offsetV||0),v.repeat.set(p.repeatU||1,p.repeatV||1)}else v.wrapS=ds,v.wrapT=ds;return h!==null&&(v.colorSpace=h),v}else return console.warn("THREE.ColladaLoader: Loader for texture %s not found.",f),null}else return console.warn("THREE.ColladaLoader: Couldn't create texture with ID:",u.id),null}const o=n.parameters;for(const u in o){const h=o[u];switch(u){case"diffuse":h.color&&s.color.fromArray(h.color),h.texture&&(s.map=a(h.texture,dt));break;case"specular":h.color&&s.specular&&s.specular.fromArray(h.color),h.texture&&(s.specularMap=a(h.texture));break;case"bump":h.texture&&(s.normalMap=a(h.texture));break;case"ambient":h.texture&&(s.lightMap=a(h.texture,dt));break;case"shininess":h.float&&s.shininess&&(s.shininess=h.float);break;case"emission":h.color&&s.emissive&&s.emissive.fromArray(h.color),h.texture&&(s.emissiveMap=a(h.texture,dt));break}}Xe.colorSpaceToWorking(s.color,dt),s.specular&&Xe.colorSpaceToWorking(s.specular,dt),s.emissive&&Xe.colorSpaceToWorking(s.emissive,dt);let l=o.transparent,c=o.transparency;if(c===void 0&&l&&(c={float:1}),l===void 0&&c&&(l={opaque:"A_ONE",data:{color:[1,1,1,1]}}),l&&c)if(l.data.texture)s.transparent=!0;else{const u=l.data.color;switch(l.opaque){case"A_ONE":s.opacity=u[3]*c.float;break;case"RGB_ZERO":s.opacity=1-u[0]*c.float;break;case"A_ZERO":s.opacity=1-u[3]*c.float;break;case"RGB_ONE":s.opacity=u[0]*c.float;break;default:console.warn('THREE.ColladaLoader: Invalid opaque type "%s" of transparent tag.',l.opaque)}s.opacity<1&&(s.transparent=!0)}if(n.extra!==void 0&&n.extra.technique!==void 0){const u=n.extra.technique;for(const h in u){const d=u[h];switch(h){case"double_sided":s.side=d===1?Rn:mi;break;case"bump":s.normalMap=a(d.texture),s.normalScale=new Ne(1,1);break}}}return s}getMaterial(e){return this.getBuild(this.library.materials[e],this.buildMaterial.bind(this))}buildCamera(e){let t;switch(e.optics.technique){case"perspective":t=new Xt(e.optics.parameters.yfov,e.optics.parameters.aspect_ratio,e.optics.parameters.znear,e.optics.parameters.zfar);break;case"orthographic":let n=e.optics.parameters.ymag,s=e.optics.parameters.xmag;const r=e.optics.parameters.aspect_ratio;s=s===void 0?n*r:s,n=n===void 0?s/r:n,s*=.5,n*=.5,t=new Wo(-s,s,n,-n,e.optics.parameters.znear,e.optics.parameters.zfar);break;default:t=new Xt;break}return t.name=e.name||"",t}getCamera(e){const t=this.library.cameras[e];return t!==void 0?this.getBuild(t,this.buildCamera.bind(this)):(console.warn("THREE.ColladaLoader: Couldn't find camera with ID:",e),null)}buildLight(e){let t;switch(e.technique){case"directional":t=new jf;break;case"point":t=new w_;break;case"spot":t=new T_;break;case"ambient":t=new C_;break}return e.parameters.color&&t.color.copy(e.parameters.color),e.parameters.distance&&(t.distance=e.parameters.distance),e.parameters.falloffAngle&&(t.angle=kn.degToRad(e.parameters.falloffAngle)),t}getLight(e){const t=this.library.lights[e];return t!==void 0?this.getBuild(t,this.buildLight.bind(this)):(console.warn("THREE.ColladaLoader: Couldn't find light with ID:",e),null)}groupPrimitives(e){const t={};for(let n=0;n<e.length;n++){const s=e[n];t[s.type]===void 0&&(t[s.type]=[]),t[s.type].push(s)}return t}checkUVCoordinates(e){let t=0;for(let n=0,s=e.length;n<s;n++)e[n].hasUV===!0&&t++;t>0&&t<e.length&&(e.uvsNeedsFix=!0)}buildGeometry(e){const t={},n=e.sources,s=e.vertices,r=e.primitives;if(r.length===0)return{};const a=this.groupPrimitives(r);for(const o in a){const l=a[o];this.checkUVCoordinates(l),t[o]=this.buildGeometryType(l,n,s)}return t}buildGeometryType(e,t,n){const s={},r={array:[],stride:0},a={array:[],stride:0},o={array:[],stride:0},l={array:[],stride:0},c={array:[],stride:0},u={array:[],stride:4},h={array:[],stride:4},d=new Vt,f=[];let g=0;for(let v=0;v<e.length;v++){const m=e[v],p=m.inputs;let S=0;switch(m.type){case"lines":case"linestrips":S=m.count*2;break;case"triangles":S=m.count*3;break;case"polygons":case"polylist":for(let A=0;A<m.count;A++){const b=m.vcount[A];switch(b){case 3:S+=3;break;case 4:S+=6;break;default:S+=(b-2)*3;break}}break;default:console.warn("THREE.ColladaLoader: Unknown primitive type:",m.type)}d.addGroup(g,S,v),g+=S,m.material&&f.push(m.material);for(const A in p){const b=p[A];switch(A){case"VERTEX":for(const T in n){const M=n[T];switch(T){case"POSITION":const w=r.array.length;if(this.buildGeometryData(m,t[M],b.offset,r.array),r.stride=t[M].stride,t.skinWeights&&t.skinIndices&&(this.buildGeometryData(m,t.skinIndices,b.offset,u.array),this.buildGeometryData(m,t.skinWeights,b.offset,h.array)),m.hasUV===!1&&e.uvsNeedsFix===!0){const _=(r.array.length-w)/r.stride;for(let y=0;y<_;y++)o.array.push(0,0)}break;case"NORMAL":this.buildGeometryData(m,t[M],b.offset,a.array),a.stride=t[M].stride;break;case"COLOR":this.buildGeometryData(m,t[M],b.offset,c.array),c.stride=t[M].stride;break;case"TEXCOORD":this.buildGeometryData(m,t[M],b.offset,o.array),o.stride=t[M].stride;break;case"TEXCOORD1":this.buildGeometryData(m,t[M],b.offset,l.array),o.stride=t[M].stride;break;default:console.warn('THREE.ColladaLoader: Semantic "%s" not handled in geometry build process.',T)}}break;case"NORMAL":this.buildGeometryData(m,t[b.id],b.offset,a.array),a.stride=t[b.id].stride;break;case"COLOR":this.buildGeometryData(m,t[b.id],b.offset,c.array,!0),c.stride=t[b.id].stride;break;case"TEXCOORD":this.buildGeometryData(m,t[b.id],b.offset,o.array),o.stride=t[b.id].stride;break;case"TEXCOORD1":this.buildGeometryData(m,t[b.id],b.offset,l.array),l.stride=t[b.id].stride;break}}}return r.array.length>0&&d.setAttribute("position",new Qe(r.array,r.stride)),a.array.length>0&&d.setAttribute("normal",new Qe(a.array,a.stride)),c.array.length>0&&d.setAttribute("color",new Qe(c.array,c.stride)),o.array.length>0&&d.setAttribute("uv",new Qe(o.array,o.stride)),l.array.length>0&&d.setAttribute("uv1",new Qe(l.array,l.stride)),u.array.length>0&&d.setAttribute("skinIndex",new Qe(u.array,u.stride)),h.array.length>0&&d.setAttribute("skinWeight",new Qe(h.array,h.stride)),s.data=d,s.type=e[0].type,s.materialKeys=f,s}buildGeometryData(e,t,n,s,r=!1){const a=e.p,o=e.stride,l=e.vcount,c=this.tempColor;function u(f){let g=a[f+n]*d;const v=g+d;for(;g<v;g++)s.push(h[g]);if(r){const m=s.length-d-1;c.setRGB(s[m+0],s[m+1],s[m+2],dt),s[m+0]=c.r,s[m+1]=c.g,s[m+2]=c.b}}const h=t.array,d=t.stride;if(e.vcount!==void 0){let f=0;for(let g=0,v=l.length;g<v;g++){const m=l[g];if(m===4){const p=f+o*0,S=f+o*1,A=f+o*2,b=f+o*3;u(p),u(S),u(b),u(S),u(A),u(b)}else if(m===3){const p=f+o*0,S=f+o*1,A=f+o*2;u(p),u(S),u(A)}else if(m>4){const p=[];for(let w=0;w<m;w++){const _=f+o*w,y=a[_]*d,P=h[y],R=h[y+1],L=h[y+2];p.push(new I(P,R,L))}const S=new I,A=new _n;A.a=p[0],A.b=p[1],A.c=p[2],A.getNormal(S);const b=[];if(Math.abs(S.x)>Math.abs(S.y)&&Math.abs(S.x)>Math.abs(S.z))for(let w=0;w<m;w++)b.push(new Ne(p[w].y,p[w].z));else if(Math.abs(S.y)>Math.abs(S.z))for(let w=0;w<m;w++)b.push(new Ne(p[w].x,p[w].z));else for(let w=0;w<m;w++)b.push(new Ne(p[w].x,p[w].y));const T=yo.isClockWise(b);T===!0&&b.reverse();const M=yo.triangulateShape(b,[]);for(let w=0;w<M.length;w++){const _=M[w];let y,P,R;T===!1?(y=_[0],P=_[1],R=_[2]):(y=m-1-_[0],P=m-1-_[2],R=m-1-_[1]);const L=f+o*y,z=f+o*P,X=f+o*R;u(L),u(z),u(X)}}f+=o*m}}else for(let f=0,g=a.length;f<g;f+=o)u(f)}getGeometry(e){return this.getBuild(this.library.geometries[e],this.buildGeometry.bind(this))}buildKinematicsModel(e){return e.build!==void 0?e.build:e}getKinematicsModel(e){return this.getBuild(this.library.kinematicsModels[e],this.buildKinematicsModel.bind(this))}buildKinematicsScene(e){return e.build!==void 0?e.build:e}getKinematicsScene(e){return this.getBuild(this.library.kinematicsScenes[e],this.buildKinematicsScene.bind(this))}setupKinematics(){const e=Object.keys(this.library.kinematicsModels)[0],t=Object.keys(this.library.kinematicsScenes)[0],n=Object.keys(this.library.visualScenes)[0];if(e===void 0||t===void 0)return;const s=this.getKinematicsModel(e),r=this.getKinematicsScene(t),a=this.getVisualScene(n),o=r.bindJointAxis,l={},c=this.collada,u=this;for(let g=0,v=o.length;g<v;g++){const m=o[g],p=c.querySelector('[sid="'+m.target+'"]');if(p){const S=p.parentElement;h(m.jointIndex,S)}}function h(g,v){const m=v.getAttribute("name"),p=s.joints[g],S=u.buildTransformList(v);a.traverse(function(A){A.name===m&&(l[g]={object:A,transforms:S,joint:p,position:p.zeroPosition})})}const d=new Oe,f=this.matrix;this.kinematics={joints:s&&s.joints,getJointValue:function(g){const v=l[g];if(v)return v.position;console.warn("THREE.ColladaLoader: Joint "+g+" doesn't exist.")},setJointValue:function(g,v){const m=l[g];if(m){const p=m.joint;if(v>p.limits.max||v<p.limits.min)console.warn("THREE.ColladaLoader: Joint "+g+" value "+v+" outside of limits (min: "+p.limits.min+", max: "+p.limits.max+").");else if(p.static)console.warn("THREE.ColladaLoader: Joint "+g+" is static.");else{const S=m.object,A=p.axis,b=m.transforms;f.identity();for(let T=0;T<b.length;T++){const M=b[T];if(M.sid&&M.sid.indexOf(g)!==-1)switch(p.type){case"revolute":f.multiply(d.makeRotationAxis(A,kn.degToRad(v)));break;case"prismatic":f.multiply(d.makeTranslation(A.x*v,A.y*v,A.z*v));break;default:console.warn("THREE.ColladaLoader: Unknown joint type: "+p.type);break}else switch(M.type){case"matrix":f.multiply(M.obj);break;case"translate":f.multiply(d.makeTranslation(M.obj.x,M.obj.y,M.obj.z));break;case"scale":f.scale(M.obj);break;case"rotate":f.multiply(d.makeRotationAxis(M.obj,M.angle));break}}S.matrix.copy(f),S.matrix.decompose(S.position,S.quaternion,S.scale),l[g].position=v}}else console.warn("THREE.ColladaLoader: Joint "+g+" does not exist.")}}}buildTransformList(e){const t=[],n=this.collada.querySelector('[id="'+e.id+'"]');for(let s=0;s<n.childNodes.length;s++){const r=n.childNodes[s];if(r.nodeType!==1)continue;let a,o;switch(r.nodeName){case"matrix":a=Jt(r.textContent);const l=new Oe().fromArray(a).transpose();t.push({sid:r.getAttribute("sid"),type:r.nodeName,obj:l});break;case"translate":case"scale":a=Jt(r.textContent),o=new I().fromArray(a),t.push({sid:r.getAttribute("sid"),type:r.nodeName,obj:o});break;case"rotate":a=Jt(r.textContent),o=new I().fromArray(a);const c=kn.degToRad(a[3]);t.push({sid:r.getAttribute("sid"),type:r.nodeName,obj:o,angle:c});break}}return t}buildSkeleton(e,t){const n=[],s=[];let r,a,o;for(r=0;r<e.length;r++){const u=e[r];let h;if(this.hasNode(u))h=this.getNode(u),this.buildBoneHierarchy(h,t,n);else if(this.hasVisualScene(u)){const f=this.library.visualScenes[u].children;for(let g=0;g<f.length;g++){const v=f[g];if(v.type==="JOINT"){const m=this.getNode(v.id);this.buildBoneHierarchy(m,t,n)}}}else console.error("THREE.ColladaLoader: Unable to find root bone of skeleton with ID:",u)}for(r=0;r<t.length;r++)for(a=0;a<n.length;a++)if(o=n[a],o.bone.name===t[r].name){s[r]=o,o.processed=!0;break}for(r=0;r<n.length;r++)o=n[r],o.processed===!1&&(s.push(o),o.processed=!0);const l=[],c=[];for(r=0;r<s.length;r++)o=s[r],l.push(o.bone),c.push(o.boneInverse);return new md(l,c)}buildBoneHierarchy(e,t,n){e.traverse(function(s){if(s.isBone===!0){let r;for(let a=0;a<t.length;a++){const o=t[a];if(o.name===s.name){r=o.boneInverse;break}}r===void 0&&(r=new Oe),n.push({bone:s,boneInverse:r,processed:!1})}})}buildNode(e){const t=[],n=e.matrix,s=e.nodes,r=e.type,a=e.instanceCameras,o=e.instanceControllers,l=e.instanceLights,c=e.instanceGeometries,u=e.instanceNodes;for(let d=0,f=s.length;d<f;d++)t.push(this.getNode(s[d]));for(let d=0,f=a.length;d<f;d++){const g=this.getCamera(a[d]);g!==null&&t.push(g.clone())}for(let d=0,f=o.length;d<f;d++){const g=o[d],v=this.getController(g.id),m=this.getGeometry(v.id),p=this.buildObjects(m,g.materials),S=g.skeletons,A=v.skin.joints,b=this.buildSkeleton(S,A);for(let T=0,M=p.length;T<M;T++){const w=p[T];w.isSkinnedMesh&&(w.bind(b,v.skin.bindMatrix),w.normalizeSkinWeights()),t.push(w)}}for(let d=0,f=l.length;d<f;d++){const g=this.getLight(l[d]);g!==null&&t.push(g.clone())}for(let d=0,f=c.length;d<f;d++){const g=c[d],v=this.getGeometry(g.id),m=this.buildObjects(v,g.materials);for(let p=0,S=m.length;p<S;p++)t.push(m[p])}for(let d=0,f=u.length;d<f;d++)t.push(this.getNode(u[d]).clone());let h;if(s.length===0&&t.length===1)h=t[0];else{h=r==="JOINT"?new Bf:new Fi;for(let d=0;d<t.length;d++)h.add(t[d])}return h.name=r==="JOINT"?e.sid:e.name,r!=="JOINT"&&this.hasPivotTransforms(e)?this.wrapWithTransformHierarchy(h,e):(h.matrix.copy(n),h.matrix.decompose(h.position,h.quaternion,h.scale),h)}wrapWithTransformHierarchy(e,t){const n=t.id;this.transformNodes[n]={};const s=t.transformOrder,r=t.transformData,a=new Fi;a.name=t.name;let o=a;for(let l=0;l<s.length;l++){const c=s[l],u=r[c],h=new Fi;switch(h.name=t.name+"_"+c,u.type){case"translate":h.position.set(u.x,u.y,u.z);break;case"rotate":{const d=new I(u.axis[0],u.axis[1],u.axis[2]),f=kn.degToRad(u.angle);h.quaternion.setFromAxisAngle(d,f),h.userData.rotationAxis=d;break}case"scale":h.scale.set(u.x,u.y,u.z);break;case"matrix":{new Oe().fromArray(u.array).transpose().decompose(h.position,h.quaternion,h.scale);break}}this.transformNodes[n][c]=h,o.add(h),o=h}return o.add(e),a}resolveMaterialBinding(e,t){const n=[];for(let s=0,r=e.length;s<r;s++){const a=t[e[s]];a===void 0?(console.warn("THREE.ColladaLoader: Material with key %s not found. Apply fallback material.",e[s]),n.push(this.fallbackMaterial)):n.push(this.getMaterial(a))}return n}get fallbackMaterial(){return this._fallbackMaterial===void 0&&(this._fallbackMaterial=new Xr({name:Qi.DEFAULT_MATERIAL_NAME,color:16711935})),this._fallbackMaterial}buildObjects(e,t){const n=[];for(const s in e){const r=e[s],a=this.resolveMaterialBinding(r.materialKeys,t);if(a.length===0&&(s==="lines"||s==="linestrips"?a.push(new qr):a.push(new Cr)),s==="lines"||s==="linestrips")for(let u=0,h=a.length;u<h;u++){const d=a[u];if(d.isMeshPhongMaterial===!0||d.isMeshLambertMaterial===!0){const f=new qr;f.color.copy(d.color),f.opacity=d.opacity,f.transparent=d.transparent,a[u]=f}}const o=r.data.attributes.skinIndex!==void 0,l=a.length===1?a[0]:a;let c;switch(s){case"lines":c=new _d(r.data,l);break;case"linestrips":c=new zf(r.data,l);break;case"triangles":case"polygons":case"polylist":o?c=new Ng(r.data,l):c=new gt(r.data,l);break}n.push(c)}return n}hasNode(e){return this.library.nodes[e]!==void 0}getNode(e){return this.getBuild(this.library.nodes[e],this.buildNode.bind(this))}buildVisualScene(e){const t=new Fi;t.name=e.name;const n=e.children;for(let s=0;s<n.length;s++){const r=n[s];t.add(this.getNode(r.id))}return t}hasVisualScene(e){return this.library.visualScenes[e]!==void 0}getVisualScene(e){return this.getBuild(this.library.visualScenes[e],this.buildVisualScene.bind(this))}parseScene(e){const t=on(e,"instance_visual_scene")[0];return this.getVisualScene(this.parseId(t.getAttribute("url")))}parseId(e){return e.substring(1)}setupAnimations(){const e=this.library.clips;if(this.isEmpty(e)===!0){if(this.isEmpty(this.library.animations)===!1){const t=[];for(const n in this.library.animations){const s=this.getAnimation(n);for(let r=0,a=s.length;r<a;r++)t.push(s[r])}this.buildDeferredPivotAnimationTracks(t),this.animations.push(new nh("default",-1,t))}}else for(const t in e)this.animations.push(this.getAnimationClip(t))}buildDeferredPivotAnimationTracks(e){for(const t in this.deferredPivotAnimations){const n=this.library.nodes[t];if(!n)continue;const s=this.deferredPivotAnimations[t];this.buildTransformHierarchyTracks(t,s,n,e)}}buildTransformHierarchyTracks(e,t,n,s){const r=this.transformNodes[e];if(!r){console.warn("THREE.ColladaLoader: Transform hierarchy not found for node:",e);return}for(const a in t){const o=r[a];if(!o)continue;const l=n.transforms[a],c=n.transformData[a],u=t[a];switch(l){case"translate":this.buildHierarchyTranslateTrack(o,u,c,s);break;case"rotate":this.buildHierarchyRotateTrack(o,u,c,s);break;case"scale":this.buildHierarchyScaleTrack(o,u,c,s);break}}}buildHierarchyTranslateTrack(e,t,n,s){if(t.default&&t.default.stride===3){const c=t.default,u=new mn(e.uuid+".position",Array.from(c.times),Array.from(c.values)),h=this.getInterpolationInfo(t);this.applyInterpolation(u,h,t),s.push(u);return}const r=this.getTimesForAllAxes(t);if(r.length===0)return;const a=[],o=this.getInterpolationInfo(t);for(let c=0;c<r.length;c++){const u=r[c],h=this.getValueAtTime(t.X,u,n.x),d=this.getValueAtTime(t.Y,u,n.y),f=this.getValueAtTime(t.Z,u,n.z);a.push(h,d,f)}const l=new mn(e.uuid+".position",r,a);this.applyInterpolation(l,o),s.push(l)}buildHierarchyRotateTrack(e,t,n,s){const r=t.ANGLE||t.default;if(!r)return;const a=Array.from(r.times);if(a.length===0)return;const o=e.userData.rotationAxis||new I(n.axis[0],n.axis[1],n.axis[2]),l=new kt,c=new kt,u=[],h=this.getInterpolationInfo(t);for(let f=0;f<a.length;f++){const g=a[f],v=this.getValueAtTime(r,g,n.angle),m=kn.degToRad(v);l.setFromAxisAngle(o,m),f>0&&c.dot(l)<0&&(l.x=-l.x,l.y=-l.y,l.z=-l.z,l.w=-l.w),c.copy(l),u.push(l.x,l.y,l.z,l.w)}const d=new ir(e.uuid+".quaternion",a,u);this.applyInterpolation(d,h),s.push(d)}buildHierarchyScaleTrack(e,t,n,s){if(t.default&&t.default.stride===3){const c=t.default,u=new mn(e.uuid+".scale",Array.from(c.times),Array.from(c.values)),h=this.getInterpolationInfo(t);this.applyInterpolation(u,h,t),s.push(u);return}const r=this.getTimesForAllAxes(t);if(r.length===0)return;const a=[],o=this.getInterpolationInfo(t);for(let c=0;c<r.length;c++){const u=r[c],h=this.getValueAtTime(t.X,u,n.x),d=this.getValueAtTime(t.Y,u,n.y),f=this.getValueAtTime(t.Z,u,n.z);a.push(h,d,f)}const l=new mn(e.uuid+".scale",r,a);this.applyInterpolation(l,o),s.push(l)}}class Zy extends Qi{load(e,t,n,s){const r=this,a=r.path===""?Qf.extractUrlBase(e):r.path,o=new yd(r.manager);o.setPath(r.path),o.setRequestHeader(r.requestHeader),o.setWithCredentials(r.withCredentials),o.load(e,function(l){try{t(r.parse(l,a))}catch(c){s?s(c):console.error(c),r.manager.itemError(e)}},n,s)}parse(e,t){if(e.length===0)return{scene:new Ff};const s=new Yy().parse(e);if(s===null)return null;const{library:r,asset:a,collada:o}=s,l=new Zf(this.manager);l.setPath(this.resourcePath||t).setCrossOrigin(this.crossOrigin);let c;kh&&(c=new kh(this.manager),c.setPath(this.resourcePath||t));const u=new Ky(r,o,l,c),{scene:h,animations:d,kinematics:f}=u.compose();return h.animations=d,a.upAxis==="Z_UP"&&(console.warn("THREE.ColladaLoader: You are loading an asset with a Z-UP coordinate system. The loader just rotates the asset to transform it into Y-UP. The vertex data are not converted, see #24289."),h.rotation.set(-Math.PI/2,0,0)),h.scale.multiplyScalar(a.unit),{get animations(){return console.warn("THREE.ColladaLoader: Please access animations over scene.animations now."),d},kinematics:f,library:r,scene:h}}}const Bh=new I,Jy=new Mn,Wa=new Oe,Ri=new Oe,Xa=new kt,qa=new I(1,1,1),$a=new I;class $o extends _t{constructor(...e){super(...e),this.urdfNode=null,this.urdfName=""}copy(e,t){return super.copy(e,t),this.urdfNode=e.urdfNode,this.urdfName=e.urdfName,this}}class jy extends $o{constructor(...e){super(...e),this.isURDFCollider=!0,this.type="URDFCollider"}}class Qy extends $o{constructor(...e){super(...e),this.isURDFVisual=!0,this.type="URDFVisual"}}class cp extends $o{constructor(...e){super(...e),this.isURDFLink=!0,this.type="URDFLink",this.name="",this.inertial={mass:0,origin:{xyz:[0,0,0],rpy:[0,0,0]},inertia:{ixx:0,ixy:0,ixz:0,iyy:0,iyz:0,izz:0}}}copy(e,t){return super.copy(e,t),this.inertial={mass:e.inertial.mass,origin:{xyz:[...e.inertial.origin.xyz],rpy:[...e.inertial.origin.rpy]},inertia:{...e.inertial.inertia}},this}}class dp extends $o{get jointType(){return this._jointType}set jointType(e){if(this.jointType!==e)switch(this._jointType=e,this.matrixWorldNeedsUpdate=!0,e){case"fixed":this.jointValue=[];break;case"continuous":case"revolute":case"prismatic":this.jointValue=new Array(1).fill(0);break;case"planar":this.jointValue=new Array(3).fill(0),this.axis=new I(0,0,1);break;case"floating":this.jointValue=new Array(6).fill(0);break}}get angle(){return this.jointValue[0]}constructor(...e){super(...e),this.isURDFJoint=!0,this.type="URDFJoint",this.name="",this.jointValue=null,this.jointType="fixed",this.axis=new I(1,0,0),this.limit={lower:0,upper:0,effort:0,velocity:0},this.ignoreLimits=!1,this.origPosition=null,this.origQuaternion=null,this.mimicJoints=[]}copy(e,t){return super.copy(e,t),this.jointType=e.jointType,this.axis=e.axis.clone(),this.limit.lower=e.limit.lower,this.limit.upper=e.limit.upper,this.limit.effort=e.limit.effort,this.limit.velocity=e.limit.velocity,this.ignoreLimits=!1,this.jointValue=[...e.jointValue],this.origPosition=e.origPosition?e.origPosition.clone():null,this.origQuaternion=e.origQuaternion?e.origQuaternion.clone():null,this.mimicJoints=[...e.mimicJoints],this}setJointValue(...e){e=e.map(n=>n===null?null:parseFloat(n)),(!this.origPosition||!this.origQuaternion)&&(this.origPosition=this.position.clone(),this.origQuaternion=this.quaternion.clone());let t=!1;switch(this.mimicJoints.forEach(n=>{t=n.updateFromMimickedJoint(...e)||t}),this.jointType){case"fixed":return t;case"continuous":case"revolute":{let n=e[0];return n==null||n===this.jointValue[0]?t:(!this.ignoreLimits&&this.jointType==="revolute"&&(n=Math.min(this.limit.upper,n),n=Math.max(this.limit.lower,n)),this.quaternion.setFromAxisAngle(this.axis,n).premultiply(this.origQuaternion),this.jointValue[0]!==n?(this.jointValue[0]=n,this.matrixWorldNeedsUpdate=!0,!0):t)}case"prismatic":{let n=e[0];return n==null||n===this.jointValue[0]?t:(this.ignoreLimits||(n=Math.min(this.limit.upper,n),n=Math.max(this.limit.lower,n)),this.position.copy(this.origPosition),Bh.copy(this.axis).applyEuler(this.rotation),this.position.addScaledVector(Bh,n),this.jointValue[0]!==n?(this.jointValue[0]=n,this.matrixWorldNeedsUpdate=!0,!0):t)}case"floating":return this.jointValue.every((n,s)=>e[s]===n||e[s]===null)?t:(this.jointValue[0]=e[0]!==null?e[0]:this.jointValue[0],this.jointValue[1]=e[1]!==null?e[1]:this.jointValue[1],this.jointValue[2]=e[2]!==null?e[2]:this.jointValue[2],this.jointValue[3]=e[3]!==null?e[3]:this.jointValue[3],this.jointValue[4]=e[4]!==null?e[4]:this.jointValue[4],this.jointValue[5]=e[5]!==null?e[5]:this.jointValue[5],Ri.compose(this.origPosition,this.origQuaternion,qa),Xa.setFromEuler(Jy.set(this.jointValue[3],this.jointValue[4],this.jointValue[5],"XYZ")),$a.set(this.jointValue[0],this.jointValue[1],this.jointValue[2]),Wa.compose($a,Xa,qa),Ri.premultiply(Wa),this.position.setFromMatrixPosition(Ri),this.rotation.setFromRotationMatrix(Ri),this.matrixWorldNeedsUpdate=!0,!0);case"planar":return this.jointValue.every((n,s)=>e[s]===n||e[s]===null)?t:(this.jointValue[0]=e[0]!==null?e[0]:this.jointValue[0],this.jointValue[1]=e[1]!==null?e[1]:this.jointValue[1],this.jointValue[2]=e[2]!==null?e[2]:this.jointValue[2],Ri.compose(this.origPosition,this.origQuaternion,qa),Xa.setFromAxisAngle(this.axis,this.jointValue[2]),$a.set(this.jointValue[0],this.jointValue[1],0),Wa.compose($a,Xa,qa),Ri.premultiply(Wa),this.position.setFromMatrixPosition(Ri),this.rotation.setFromRotationMatrix(Ri),this.matrixWorldNeedsUpdate=!0,!0)}return t}}class zh extends dp{constructor(...e){super(...e),this.type="URDFMimicJoint",this.mimicJoint=null,this.offset=0,this.multiplier=1}updateFromMimickedJoint(...e){const t=e.map(n=>n===null?null:n*this.multiplier+this.offset);return super.setJointValue(...t)}copy(e,t){return super.copy(e,t),this.mimicJoint=e.mimicJoint,this.offset=e.offset,this.multiplier=e.multiplier,this}}class eM extends cp{constructor(...e){super(...e),this.isURDFRobot=!0,this.urdfNode=null,this.urdfRobotNode=null,this.robotName=null,this.links=null,this.joints=null,this.colliders=null,this.visual=null,this.frames=null}copy(e,t){super.copy(e,t),this.urdfRobotNode=e.urdfRobotNode,this.robotName=e.robotName,this.links={},this.joints={},this.colliders={},this.visual={},this.traverse(n=>{n.isURDFJoint&&n.urdfName in e.joints&&(this.joints[n.urdfName]=n),n.isURDFLink&&n.urdfName in e.links&&(this.links[n.urdfName]=n),n.isURDFCollider&&n.urdfName in e.colliders&&(this.colliders[n.urdfName]=n),n.isURDFVisual&&n.urdfName in e.visual&&(this.visual[n.urdfName]=n)});for(const n in this.joints)this.joints[n].mimicJoints=this.joints[n].mimicJoints.map(s=>this.joints[s.name]);return this.frames={...this.colliders,...this.visual,...this.links,...this.joints},this}getFrame(e){return this.frames[e]}setJointValue(e,...t){const n=this.joints[e];return n?n.setJointValue(...t):!1}setJointValues(e){let t=!1;for(const n in e){const s=e[n];Array.isArray(s)?t=this.setJointValue(n,...s)||t:t=this.setJointValue(n,s)||t}return t}}const kl=new kt,Vh=new Mn;function Ci(i){return i?i.trim().split(/\s+/g).map(e=>parseFloat(e)):[0,0,0]}function Gh(i,e,t=!1){t||i.rotation.set(0,0,0),Vh.set(e[0],e[1],e[2],"ZYX"),kl.setFromEuler(Vh),kl.multiply(i.quaternion),i.quaternion.copy(kl)}class tM{constructor(e){this.manager=e||Kf,this.loadMeshCb=this.defaultMeshLoader.bind(this),this.parseVisual=!0,this.parseCollision=!1,this.packages="",this.workingPath="",this.fetchOptions={}}loadAsync(e){return new Promise((t,n)=>{this.load(e,t,null,n)})}load(e,t,n,s){const r=this.manager,a=Qf.extractUrlBase(e),o=this.manager.resolveURL(e);r.itemStart(o),fetch(o,this.fetchOptions).then(l=>{if(l.ok)return n&&n(null),l.text();throw new Error(`URDFLoader: Failed to load url '${o}' with error code ${l.status} : ${l.statusText}.`)}).then(l=>{const c=this.parse(l,this.workingPath||a);t(c),r.itemEnd(o)}).catch(l=>{s?s(l):console.error("URDFLoader: Error loading file.",l),r.itemError(o),r.itemEnd(o)})}parse(e,t=this.workingPath){const n=this.packages,s=this.loadMeshCb,r=this.parseVisual,a=this.parseCollision,o=this.manager,l={},c={},u={};function h(S){if(!/^package:\/\//.test(S))return t?t+S:S;const[A,b]=S.replace(/^package:\/\//,"").split(/\/(.+)/);if(typeof n=="string")return n.endsWith(A)?n+"/"+b:n+"/"+A+"/"+b;if(typeof n=="function")return n(A)+"/"+b;if(typeof n=="object")return A in n?n[A]+"/"+b:(console.error(`URDFLoader : ${A} not found in provided package list.`),null)}function d(S){let A;S instanceof Document?A=[...S.children]:S instanceof Element?A=[S]:A=[...new DOMParser().parseFromString(S,"text/xml").children];const b=A.filter(T=>T.nodeName==="robot").pop();return f(b)}function f(S){const A=[...S.children],b=A.filter(R=>R.nodeName.toLowerCase()==="link"),T=A.filter(R=>R.nodeName.toLowerCase()==="joint"),M=A.filter(R=>R.nodeName.toLowerCase()==="material"),w=new eM;w.robotName=S.getAttribute("name"),w.urdfRobotNode=S,M.forEach(R=>{const L=R.getAttribute("name");u[L]=m(R)});const _={},y={};b.forEach(R=>{const L=R.getAttribute("name"),z=S.querySelector(`child[link="${L}"]`)===null;l[L]=v(R,_,y,z?w:null)}),T.forEach(R=>{const L=R.getAttribute("name");c[L]=g(R)}),w.joints=c,w.links=l,w.colliders=y,w.visual=_;const P=Object.values(c);return P.forEach(R=>{R instanceof zh&&c[R.mimicJoint].mimicJoints.push(R)}),P.forEach(R=>{const L=new Set,z=X=>{if(L.has(X))throw new Error("URDFLoader: Detected an infinite loop of mimic joints.");L.add(X),X.mimicJoints.forEach(O=>{z(O)})};z(R)}),w.frames={...y,..._,...l,...c},w}function g(S){const A=[...S.children],b=S.getAttribute("type");let T;const M=A.find(L=>L.nodeName.toLowerCase()==="mimic");M?(T=new zh,T.mimicJoint=M.getAttribute("joint"),T.multiplier=parseFloat(M.getAttribute("multiplier")||1),T.offset=parseFloat(M.getAttribute("offset")||0)):T=new dp,T.urdfNode=S,T.name=S.getAttribute("name"),T.urdfName=T.name,T.jointType=b;let w=null,_=null,y=[0,0,0],P=[0,0,0];A.forEach(L=>{const z=L.nodeName.toLowerCase();z==="origin"?(y=Ci(L.getAttribute("xyz")),P=Ci(L.getAttribute("rpy"))):z==="child"?_=l[L.getAttribute("link")]:z==="parent"?w=l[L.getAttribute("link")]:z==="limit"&&(T.limit.lower=parseFloat(L.getAttribute("lower")||T.limit.lower),T.limit.upper=parseFloat(L.getAttribute("upper")||T.limit.upper),T.limit.effort=parseFloat(L.getAttribute("effort")||T.limit.effort),T.limit.velocity=parseFloat(L.getAttribute("velocity")||T.limit.velocity))}),w.add(T),T.add(_),Gh(T,P),T.position.set(y[0],y[1],y[2]);const R=A.filter(L=>L.nodeName.toLowerCase()==="axis")[0];if(R){const L=R.getAttribute("xyz").split(/\s+/g).map(z=>parseFloat(z));T.axis=new I(L[0],L[1],L[2]),T.axis.normalize()}return T}function v(S,A,b,T=null){T===null&&(T=new cp);const M=[...S.children];T.name=S.getAttribute("name"),T.urdfName=T.name,T.urdfNode=S;const w=M.find(_=>_.nodeName.toLowerCase()==="inertial");return w&&[...w.children].forEach(_=>{const y=_.nodeName.toLowerCase();y==="origin"?(T.inertial.origin.xyz=Ci(_.getAttribute("xyz")),T.inertial.origin.rpy=Ci(_.getAttribute("rpy"))):y==="mass"?T.inertial.mass=parseFloat(_.getAttribute("value"))||0:y==="inertia"&&(T.inertial.inertia.ixx=parseFloat(_.getAttribute("ixx"))||0,T.inertial.inertia.ixy=parseFloat(_.getAttribute("ixy"))||0,T.inertial.inertia.ixz=parseFloat(_.getAttribute("ixz"))||0,T.inertial.inertia.iyy=parseFloat(_.getAttribute("iyy"))||0,T.inertial.inertia.iyz=parseFloat(_.getAttribute("iyz"))||0,T.inertial.inertia.izz=parseFloat(_.getAttribute("izz"))||0)}),r&&M.filter(y=>y.nodeName.toLowerCase()==="visual").forEach(y=>{const P=p(y,u);if(T.add(P),y.hasAttribute("name")){const R=y.getAttribute("name");P.name=R,P.urdfName=R,A[R]=P}}),a&&M.filter(y=>y.nodeName.toLowerCase()==="collision").forEach(y=>{const P=p(y);if(T.add(P),y.hasAttribute("name")){const R=y.getAttribute("name");P.name=R,P.urdfName=R,b[R]=P}}),T}function m(S){const A=[...S.children],b=new Cr;return b.name=S.getAttribute("name")||"",A.forEach(T=>{const M=T.nodeName.toLowerCase();if(M==="color"){const w=T.getAttribute("rgba").split(/\s/g).map(_=>parseFloat(_));b.color.setRGB(w[0],w[1],w[2]),b.opacity=w[3],b.transparent=w[3]<1,b.depthWrite=!b.transparent}else if(M==="texture"){const w=T.getAttribute("filename");if(w){const _=new Zf(o),y=h(w);b.map=_.load(y),b.map.colorSpace=dt}}}),b}function p(S,A={}){const b=S.nodeName.toLowerCase()==="collision",T=[...S.children];let M=null;const w=T.filter(y=>y.nodeName.toLowerCase()==="material")[0];if(w){const y=w.getAttribute("name");y&&y in A?M=A[y]:M=m(w)}else M=new Cr;const _=b?new jy:new Qy;return _.urdfNode=S,T.forEach(y=>{const P=y.nodeName.toLowerCase();if(P==="geometry"){const R=y.children[0].nodeName.toLowerCase();if(R==="mesh"){const L=y.children[0].getAttribute("filename"),z=h(L);if(z!==null){const X=y.children[0].getAttribute("scale");if(X){const O=Ci(X);_.scale.set(O[0],O[1],O[2])}s(z,o,M,(O,N)=>{N?console.error("URDFLoader: Error loading mesh.",N):O&&(O.position.set(0,0,0),O.quaternion.identity(),_.add(O))})}}else if(R==="box"){const L=new gt;L.geometry=new As(1,1,1),L.material=M;const z=Ci(y.children[0].getAttribute("size"));L.scale.set(z[0],z[1],z[2]),_.add(L)}else if(R==="sphere"){const L=new gt;L.geometry=new xd(1,30,30),L.material=M;const z=parseFloat(y.children[0].getAttribute("radius"))||0;L.scale.set(z,z,z),_.add(L)}else if(R==="cylinder"){const L=new gt;L.geometry=new vd(1,1,1,30),L.material=M;const z=parseFloat(y.children[0].getAttribute("radius"))||0,X=parseFloat(y.children[0].getAttribute("length"))||0;L.scale.set(z,X,z),L.rotation.set(Math.PI/2,0,0),_.add(L)}}else if(P==="origin"){const R=Ci(y.getAttribute("xyz")),L=Ci(y.getAttribute("rpy"));_.position.set(R[0],R[1],R[2]),_.rotation.set(0,0,0),Gh(_,L)}}),_}return d(e)}defaultMeshLoader(e,t,n,s){/\.stl$/i.test(e)?new qy(t).load(e,a=>{const o=new gt(a,n||new Cr);s(o)},null,a=>s(null,a)):/\.dae$/i.test(e)?new Zy(t).load(e,a=>s(a.scene),null,a=>s(null,a)):console.warn(`URDFLoader: Could not load model at ${e}.
No loader available`)}}const up=["#e5484d","#30a46c","#3e63dd"],Vn=1e4,Bl=600;function Hh(i){return Array.isArray(i)&&i.length===3&&i.every(Number.isFinite)?i:null}function nM(i){const t=10**Math.floor(Math.log10(i));for(const n of[1,2,2.5,5,10])if(i<=n*t+1e-12)return n*t;return 10*t}function iM(i){return i===0?"0":String(Number(i.toPrecision(3)))}class sM{constructor(e,t){this.canvas=e,this.minScale=t,this.samples=[],this.shrinkSince=0,this.context=e.getContext("2d"),this.scale=t}push(e,t,n){var a;const s={t:e,measured:Hh(t),command:Hh(n)};this.samples.push(s),this.canvas.dataset.lastCommand=JSON.stringify(((a=s.command)==null?void 0:a.map(o=>Number(o.toFixed(4))))??null);const r=e-Vn-Bl;for(;this.samples.length&&this.samples[0].t<r;)this.samples.shift()}draw(e){const t=this.context,{clientWidth:n,clientHeight:s}=this.canvas;if(!t||!n||!s)return;const r=Math.min(window.devicePixelRatio||1,2);(this.canvas.width!==Math.round(n*r)||this.canvas.height!==Math.round(s*r))&&(this.canvas.width=Math.round(n*r),this.canvas.height=Math.round(s*r)),t.setTransform(r,0,0,r,0,0),t.clearRect(0,0,n,s);const a=e-Vn,o=this.samples.filter(M=>M.t>=a-Bl);let l=0;for(const M of o)for(const w of[M.measured,M.command])if(w)for(const _ of w)l=Math.max(l,Math.abs(_));const c=nM(Math.max(l*1.1,this.minScale));c>this.scale?(this.scale=c,this.shrinkSince=0):c<this.scale?(this.shrinkSince||(this.shrinkSince=e),e-this.shrinkSince>1e3&&(this.scale=c,this.shrinkSince=0)):this.shrinkSince=0,this.canvas.dataset.yMax=String(this.scale),this.canvas.dataset.samples=String(o.length);const u=38,h=8,d=8,f=18,g=n-u-h,v=s-d-f,m=M=>u+(M-a)/Vn*g,p=M=>d+v/2-M/this.scale*(v/2),S=getComputedStyle(this.canvas),A=S.getPropertyValue("--trace-grid").trim()||"#e3e9f0",b=S.getPropertyValue("--trace-axis").trim()||"#9fb0c4",T=S.getPropertyValue("--trace-label").trim()||"#7c8a9c";t.font="9px Inter, ui-sans-serif, system-ui, sans-serif",t.lineWidth=1,t.textAlign="right",t.textBaseline="middle";for(const M of[1,.5,0,-.5,-1]){const w=this.scale*M,_=Math.round(d+v/2-M*(v/2))+.5;t.strokeStyle=M===0?b:A,t.beginPath(),t.moveTo(u,_),t.lineTo(u+g,_),t.stroke(),t.fillStyle=T,t.fillText(iM(w),u-5,_)}t.textAlign="center",t.textBaseline="top";for(let M=-10;M<=0;M+=2){const w=Math.round(u+(M*1e3+Vn)/Vn*g)+.5;t.strokeStyle=A,t.beginPath(),t.moveTo(w,d),t.lineTo(w,d+v),t.stroke(),t.fillStyle=T,t.fillText(M===0?"0 s":`${M}`,w,d+v+4)}t.save(),t.beginPath(),t.rect(u,d,g,v),t.clip();for(const M of["command","measured"]){t.setLineDash(M==="command"?[5,4]:[]),t.lineWidth=M==="command"?1.4:1.8,t.globalAlpha=M==="command"?.85:1;for(let w=0;w<3;w+=1){t.strokeStyle=up[w],t.beginPath();let _;for(const y of o){const P=y[M];if(!P){_=void 0;continue}const R=m(y.t),L=p(P[w]);_&&_[M]&&y.t-_.t<=Bl?t.lineTo(R,L):t.moveTo(R,L),_=y}t.stroke()}}t.restore(),t.setLineDash([]),t.globalAlpha=1}}const Ed=["#e5484d","#f76b15","#30a46c","#12a594","#3e63dd","#8e4ec6"],zl=600,Wh=150,rM="#e5484d";class aM{constructor(e,t){this.canvas=e,this.limitsMa=t,this.samples=[],this.scale=Wh,this.shrinkSince=0,this.context=e.getContext("2d")}push(e,t){const s=Array.isArray(t)&&t.length===6&&t.every(Number.isFinite)?t.map((a,o)=>Math.abs(a)/this.limitsMa[o]*100):null;this.samples.push({t:e,percent:s}),this.canvas.dataset.lastPercent=JSON.stringify((s==null?void 0:s.map(a=>Math.round(a)))??null);const r=e-Vn-zl;for(;this.samples.length&&this.samples[0].t<r;)this.samples.shift()}draw(e){const t=this.context,{clientWidth:n,clientHeight:s}=this.canvas;if(!t||!n||!s)return;const r=Math.min(window.devicePixelRatio||1,2);(this.canvas.width!==Math.round(n*r)||this.canvas.height!==Math.round(s*r))&&(this.canvas.width=Math.round(n*r),this.canvas.height=Math.round(s*r)),t.setTransform(r,0,0,r,0,0),t.clearRect(0,0,n,s);const a=e-Vn,o=this.samples.filter(_=>_.t>=a-zl);let l=0;for(const _ of o)_.percent&&(l=Math.max(l,..._.percent));const c=Math.max(Wh,Math.ceil(l*1.1/50)*50);c>this.scale?(this.scale=c,this.shrinkSince=0):c<this.scale?(this.shrinkSince||(this.shrinkSince=e),e-this.shrinkSince>1e3&&(this.scale=c,this.shrinkSince=0)):this.shrinkSince=0,this.canvas.dataset.yMax=String(this.scale),this.canvas.dataset.samples=String(o.length);const u=38,h=8,d=8,f=18,g=n-u-h,v=s-d-f,m=_=>u+(_-a)/Vn*g,p=_=>d+v-_/this.scale*v,S=getComputedStyle(this.canvas),A=S.getPropertyValue("--trace-grid").trim()||"#e3e9f0",b=S.getPropertyValue("--trace-axis").trim()||"#9fb0c4",T=S.getPropertyValue("--trace-label").trim()||"#7c8a9c";t.font="9px Inter, ui-sans-serif, system-ui, sans-serif",t.lineWidth=1,t.textAlign="right",t.textBaseline="middle";const M=this.scale<=200?50:this.scale<=500?100:250;for(let _=0;_<=this.scale+1e-9;_+=M){const y=Math.round(p(_))+.5;t.strokeStyle=_===0?b:A,t.beginPath(),t.moveTo(u,y),t.lineTo(u+g,y),t.stroke(),t.fillStyle=T,t.fillText(`${_}%`,u-5,y)}t.textAlign="center",t.textBaseline="top";for(let _=-10;_<=0;_+=2){const y=Math.round(u+(_*1e3+Vn)/Vn*g)+.5;t.strokeStyle=A,t.beginPath(),t.moveTo(y,d),t.lineTo(y,d+v),t.stroke(),t.fillStyle=T,t.fillText(_===0?"0 s":`${_}`,y,d+v+4)}const w=Math.round(p(100))+.5;t.strokeStyle=rM,t.lineWidth=1.4,t.setLineDash([5,4]),t.beginPath(),t.moveTo(u,w),t.lineTo(u+g,w),t.stroke(),t.setLineDash([]),t.save(),t.beginPath(),t.rect(u,d,g,v),t.clip(),t.lineWidth=1.6;for(let _=0;_<6;_+=1){t.strokeStyle=Ed[_],t.beginPath();let y;for(const P of o){if(!P.percent){y=void 0;continue}const R=m(P.t),L=p(P.percent[_]);y&&P.t-y.t<=zl?t.lineTo(R,L):t.moveTo(R,L),y=P}t.stroke()}t.restore()}}function oM(i){var n;const e=new Map;let t;for(const s of i){const r={...s,children:[]};e.set(s.path,r);const a=s.path.lastIndexOf("/");a<0?t??(t=r):(n=e.get(s.path.slice(0,a)))==null||n.children.push(r)}return t}function lM(i){const e=[i];for(;e.length;){const t=e.pop();if(t.kind==="Control"&&/Fallback$/.test(t.registration_name)&&t.children.length>1&&t.children.every(n=>{var s;return((s=n.children[0])==null?void 0:s.registration_name)==="InputModeGuard"}))return t;e.push(...t.children)}}function cM(i,e){return i.children.find(t=>e&&t.name===`${e}_branch`)??i.children.find(t=>{var n;return((n=t.children[0])==null?void 0:n.status)==="SUCCESS"&&t.status!=="IDLE"})??i.children.find(t=>t.status==="RUNNING")}function dM(i,e){const t=[];let n=i;for(;n&&n.path!==e;)t.push(n),n=n.children.find(s=>e===s.path||e.startsWith(`${s.path}/`));return t}const uM={Control:"◆",Decorator:"◇",Action:"▶",Condition:"?",SubTree:"▣"};function hs(i){return i.replace(/[&<>"']/g,e=>`&#${e.charCodeAt(0)};`)}function hp(i){return`<span class="bt-status bt-${i.toLowerCase()}">${hs(i)}</span>`}function fp(i){const e=i.name&&i.name!==i.registration_name;return`<span class="bt-name">${hs(e?i.name:i.registration_name)}</span>${e?`<span class="bt-type">${hs(i.registration_name)}</span>`:""}`}function $c(i,e,t=new Set){const n=i.children.length>0,s=t.has(i.path),r=n&&(e.get(i.path)??(i.status==="IDLE"||s));return`<li class="bt-node bt-kind-${i.kind.toLowerCase()}${s?" bt-muted":""}" data-path="${hs(i.path)}" data-status="${i.status}">
    <div class="bt-row">${n?`<button type="button" class="bt-caret" data-bt-toggle="${hs(i.path)}" aria-expanded="${!r}" aria-label="${r?"展开":"折叠"}">${r?"▸":"▾"}</button>`:'<span class="bt-caret-spacer"></span>'}<span class="bt-icon" title="${hs(i.kind)}">${uM[i.kind]??"•"}</span>${fp(i)}${hp(i.status)}</div>
    ${i.failure_reason?`<div class="bt-reason">${hs(i.failure_reason)}</div>`:""}
    ${n&&!r?`<ul class="bt-children">${i.children.map(a=>$c(a,e,t)).join("")}</ul>`:""}
  </li>`}function hM(i){return i.map(e=>`<span class="bt-crumb">${fp(e)}${hp(e.status)}</span>`).join('<span class="bt-crumb-sep">›</span>')}const fM=document.querySelector("#app");fM.innerHTML=`
  <header class="topbar">
    <div class="brand"><span class="brand-mark">${um}</span><div><strong>RealMan Web Control</strong><small>ROS 2 action console</small></div></div>
    <label class="arm-picker">ARM <select id="arm-select"><option value="l">LEFT / 123</option><option value="m">MIDDLE / 125</option><option value="r">RIGHT / 124</option></select></label>
    <span id="connection" class="status-pill offline">OFFLINE</span>
    <span id="mode" class="status-pill ready">CONTROL READY</span>
    <span id="auth-button" class="status-pill ready">CONTROL OPEN</span>
    <a href="/calibration.html" class="button ghost">相机标定</a>
    <a href="/params.html" class="button ghost">参数调试</a>
    <span id="docker-restart-state" class="status-pill" hidden></span>
    <button id="docker-restart" class="button ghost" type="button" hidden>重启 Docker</button>
    <button id="cancel-motion" class="button ghost" type="button" disabled>取消 Action</button>
    <button id="recover-motion" class="button secondary" type="button" disabled>恢复机械臂</button>
    <button id="stop-button" class="button danger" type="button" disabled>■ 软件停止</button>
  </header>
  <main class="workspace">
    <div class="visualization-column">
      <section class="viewer-panel panel">
        <div class="panel-heading"><div><span class="eyebrow">LIVE / TARGET</span><h1>三维姿态</h1></div><div id="model-label" class="muted">loading model</div></div>
        <div class="viewer-layout">
          <div id="fleet-strip" class="fleet-strip"></div>
          <div class="viewer-column">
            <div id="viewer" class="viewer"><canvas id="canvas" aria-label="RealMan URDF 三维模型"></canvas><div id="viewer-hover" class="viewer-hover" hidden></div><div id="viewer-state" class="viewer-state">加载 URDF…</div><div id="keyboard-frame-legend" class="keyboard-frame-legend" hidden><strong>L WORK</strong><strong>R WORK</strong><span class="axis-x">X</span><span class="axis-y">Y</span><span class="axis-z">Z</span></div><div class="legend"><span class="legend-live"></span>实体姿态 <span class="legend-shadow"></span>目标影子</div></div>
            <div class="viewer-footer"><span id="joint-stamp">等待 joint_states</span><span id="root-frame"></span></div>
          </div>
        </div>
      </section>
      <div class="status-row">
        <section id="coordinate-panel" class="panel panel-section"><div class="panel-heading compact"><div><span class="eyebrow">COORDINATES</span><h2>当前坐标</h2></div><div class="coordinate-actions"><button id="copy-current-joints" class="button ghost" type="button" disabled>复制当前角度</button><span id="coordinate-state" class="mini-state">WAIT</span></div></div><div id="coordinate-summary" class="coordinate-summary"></div><div id="joint-copy-status" class="joint-copy-status" aria-live="polite">等待有效 joint_states</div></section>
        <section id="action-monitor-panel" class="panel panel-section"><div class="panel-heading compact"><div><span class="eyebrow">ACTION MONITOR</span><h2>运行反馈</h2></div><span id="action-state" class="mini-state">IDLE</span></div><div class="progress-track"><div id="progress" class="progress-bar"></div></div><div id="feedback" class="feedback">尚未发送 Action</div><pre id="result" class="result" aria-live="polite">等待结果…</pre></section>
      </div>
      <section id="velocity-telemetry-panel" class="panel panel-section"><div class="panel-heading compact"><div><span class="eyebrow">VELOCITY TELEMETRY</span><h2>命令与实际末端速度</h2></div><span class="mini-state">L + R</span></div><div class="telemetry-legend" id="velocity-telemetry-legend">${["X","Y","Z"].map((i,e)=>`<span class="legend-axis"><i style="background: ${up[e]}"></i>${i}</span>`).join("")}<span class="legend-line solid"><i></i>实际</span><span class="legend-line dashed"><i></i>命令（限速后）</span><span class="legend-hint">最近 10 s · 纵轴按数据自动缩放</span></div><div id="velocity-telemetry-grid" class="velocity-telemetry-grid"></div></section>
      <section id="joint-current-panel" class="panel panel-section"><div class="panel-heading compact"><div><span class="eyebrow">JOINT CURRENT</span><h2>关节电流</h2></div><span class="mini-state">L + R</span></div><div class="telemetry-legend" id="joint-current-legend">${Ed.map((i,e)=>`<span class="legend-axis"><i style="background: ${i}"></i>J${e+1}</span>`).join("")}<span class="legend-line dashed limit"><i></i>保护阈值 100%</span><span class="legend-hint" id="joint-current-hint">最近 10 s · 纵轴为 |电流| / 阈值</span></div><div id="joint-current-grid" class="velocity-telemetry-grid"></div></section>
    </div>
    <aside class="controls">
      <section id="input-mode-card" class="panel panel-section input-mode-card" hidden>
        <div class="panel-heading compact"><div><span class="eyebrow">GLOBAL INPUT</span><h2>输入模式</h2></div><span id="input-mode-active" class="mini-state">WAIT</span></div>
        <div class="input-mode-body"><div class="input-mode-row"><label>当前选择<select id="input-mode-select" aria-label="输入模式"></select></label><button id="input-mode-restart" class="button ghost" type="button" title="先切到无输入分支，再切回当前分支，重新开始该分支" disabled>重启此分支</button></div><div id="input-mode-detail" class="input-mode-detail" aria-live="polite">等待输入模式状态</div></div>
      </section>
      <section id="bt-panel" class="panel panel-section bt-panel" aria-label="行为树" hidden>
        <div class="panel-heading compact"><div><span class="eyebrow">BEHAVIOR TREE</span><h2>行为树<span id="bt-dot" class="tab-dot"></span></h2></div><div class="panel-actions"><span id="bt-root-status" class="bt-status bt-idle">未运行</span><button id="bt-stop" class="button danger" type="button" hidden>终止行为树</button><button id="bt-collapse" class="bt-collapse" type="button" aria-expanded="true" aria-controls="bt-body" title="收起">▾</button></div></div>
        <div id="bt-body">
        <div id="bt-launcher" class="bt-launcher" hidden>
          <div class="bt-launcher-row">
            <div class="bt-picker">
              <button id="bt-picker-button" class="bt-picker-button" type="button" aria-haspopup="listbox" aria-expanded="false"><span id="bt-picker-label" class="bt-picker-label">选择行为树</span><span id="bt-picker-meta" class="bt-picker-meta"></span><span class="bt-picker-caret">▾</span></button>
              <div id="bt-picker-list" class="bt-picker-list" role="listbox" aria-label="行为树文件" hidden></div>
            </div>
            <label class="bt-real-motion" title="不勾选则 dry-run：行为树运行但不发送真实运动"><input id="bt-real-motion" type="checkbox" checked /> 真实运动</label>
            <button id="bt-start" class="button primary" type="button" disabled>启动</button>
          </div>
          <div id="bt-start-status" class="bt-stop-status" role="status" aria-live="polite" hidden></div>
          <pre id="bt-start-log" class="bt-start-log" hidden></pre>
        </div>
        <div id="bt-running" hidden>
          <div id="bt-stop-status" class="bt-stop-status" role="status" aria-live="polite" hidden></div>
          <div class="bt-meta"><span id="bt-tree-id"></span><button id="bt-scope-toggle" class="text-button" type="button" hidden>显示整棵树</button></div>
          <div id="bt-mode-reason" class="bt-mode-reason" role="status" aria-live="polite" hidden></div>
          <div id="bt-breadcrumb" class="bt-breadcrumb" hidden></div>
          <div id="bt-failure" class="bt-reason bt-root-reason" hidden></div>
          <ul id="bt-tree" class="bt-tree" aria-live="off"></ul>
        </div>
        </div>
      </section>
      <div id="control-tabs" class="control-tabs" role="tablist" aria-label="操作面板">
        <button type="button" role="tab" id="control-tab-motion" data-control-tab="motion" aria-controls="motion-panel">运动</button>
        <button type="button" role="tab" id="control-tab-velocity" data-control-tab="velocity" aria-controls="velocity-panel">速度</button>
        <button type="button" role="tab" id="control-tab-gripper" data-control-tab="gripper" aria-controls="gripper-panel">夹爪</button>
        <button type="button" role="tab" id="control-tab-keyboard" data-control-tab="keyboard" aria-controls="keyboard-control-card" hidden>键盘</button>
      </div>
      <section id="keyboard-control-card" class="panel panel-section keyboard-control-card" role="tabpanel" aria-labelledby="control-tab-keyboard" data-control-panel="keyboard" hidden>
        <div class="panel-heading compact"><div><span class="eyebrow">KEYBOARD / L + R</span><h2>双臂键盘速度与夹爪</h2></div><span id="keyboard-control-state" class="mini-state">RELEASED</span></div>
        <p class="keyboard-help">切换到“Web / 键盘速度控制”后：机械臂按住运动，松键、失焦或通信超时停止；夹爪按一次全开／全闭，松键不撤销已提交目标。仅在在线且无报警时接收新夹爪指令。</p>
        <div class="keyboard-arm-grid">
          <div id="keyboard-left" class="keyboard-arm" data-arm="l"></div>
          <div id="keyboard-right" class="keyboard-arm" data-arm="r"></div>
        </div>
      </section>
      <section id="motion-panel" class="panel panel-section motion-panel" role="tabpanel" aria-labelledby="control-tab-motion" data-control-panel="motion">
        <div class="panel-heading compact"><div><span class="eyebrow">MOTION TARGET</span><h2>一次性运动</h2></div><div class="panel-actions"><span id="selected-arm-label" class="mini-state">L</span><button id="reset-preview" class="text-button" type="button">重置目标</button></div></div>
        <div id="motion-mode" class="segmented-control" aria-label="运动类型">
          <button type="button" class="selected" data-motion-command="0" aria-pressed="true">MOVEJ</button>
          <button type="button" data-motion-command="1" aria-pressed="false">MOVEL</button>
          <button type="button" data-motion-command="2" aria-pressed="false">MOVEP</button>
        </div>
        <div id="joint-target">
          <div class="joint-toolbar"><span class="target-field-label">关节目标 (degree)</span></div>
          <div id="joint-controls" class="joint-controls"></div>
        </div>
        <div id="pose-target" class="pose-target" hidden>
          <div class="target-field-label">位置 (m)</div>
          <div class="pose-inputs position-inputs">
            <label>X<input id="pose-x" type="number" step="0.001" inputmode="decimal" /></label>
            <label>Y<input id="pose-y" type="number" step="0.001" inputmode="decimal" /></label>
            <label>Z<input id="pose-z" type="number" step="0.001" inputmode="decimal" /></label>
          </div>
          <div class="pose-reference-picker">
            <label>参考坐标系<select id="pose-reference-frame"></select></label>
          </div>
          <div id="pose-sliders" class="pose-sliders" aria-label="XYZ position sliders"></div>
          <div class="target-field-label">四元数 WXYZ</div>
          <div class="pose-inputs quaternion-inputs">
            <label>W<input id="pose-qw" type="number" step="0.001" inputmode="decimal" /></label>
            <label>X<input id="pose-qx" type="number" step="0.001" inputmode="decimal" /></label>
            <label>Y<input id="pose-qy" type="number" step="0.001" inputmode="decimal" /></label>
            <label>Z<input id="pose-qz" type="number" step="0.001" inputmode="decimal" /></label>
          </div>
          <div id="pose-kinematics-actions" class="pose-kinematics-actions" hidden>
            <button id="fill-current-pose" class="button secondary" type="button">填入当前位置</button>
            <button id="solve-ik" class="button ghost" type="button">计算逆解</button>
          </div>
          <div id="kinematics-status" class="kinematics-status" aria-live="polite">MOVEL 逆解仅更新影子预览</div>
        </div>
        <div class="joint-records">
          <div class="target-field-label">关节记录</div>
          <div class="record-save-row">
            <input id="record-name" type="text" maxlength="64" placeholder="record name" />
            <button id="save-record" class="button secondary" type="button" disabled>记录当前</button>
          </div>
          <div class="record-apply-row">
            <select id="record-select"></select>
            <button id="apply-record" class="button ghost" type="button" disabled>填入</button>
            <button id="delete-record" class="button danger" type="button" disabled>删除</button>
          </div>
          <div id="record-status" class="record-status" aria-live="polite">等待记录列表</div>
        </div>
        <div class="motion-parameters">
          <label>激活参考系<output id="motion-reference">BASE / base</output></label>
          <label>速度 (%)<input id="motion-velocity" type="number" min="1" max="100" step="1" value="30" /></label>
          <label>超时 (s)<input id="motion-timeout" type="number" min="0.1" step="0.1" /></label>
        </div>
        <button id="execute-motion" class="button primary full" type="button" disabled>发送 MOVEJ</button>
      </section>
      <section id="velocity-panel" class="panel panel-section" role="tabpanel" aria-labelledby="control-tab-velocity" data-control-panel="velocity"><div class="panel-heading compact"><div><span class="eyebrow">CARTESIAN</span><h2>末端速度</h2></div><span id="velocity-state" class="mini-state">IDLE</span></div><div class="form-grid"><label>参考系<select id="velocity-frame"></select></label><label>周期 (ms)<input id="velocity-period" type="number" min="1" step="1" /></label><label>看门狗 (ms)<input id="velocity-watchdog" type="number" min="1" step="1" /></label><label>线加速度<input id="linear-accel" type="number" min="0.001" step="0.01" /></label><label>角加速度<input id="angular-accel" type="number" min="0.001" step="0.01" /></label></div><div id="velocity-inputs" class="velocity-inputs"></div><div class="inline-actions"><button id="start-velocity" class="button secondary" type="button" disabled>启动速度 Action</button><button id="cancel-velocity" class="button ghost" type="button" disabled>取消</button></div></section>
      <section id="gripper-panel" class="panel panel-section" role="tabpanel" aria-labelledby="control-tab-gripper" data-control-panel="gripper"><div class="panel-heading compact"><div><span class="eyebrow">GRIPPER</span><h2>夹爪控制</h2></div><span id="gripper-state" class="mini-state">WAIT</span></div><div class="form-grid"><label>设备<select id="gripper-select"></select></label><label>开合度 (0=闭合)<input id="gripper-percentage" type="range" min="0" max="1" step="0.01" value="1" /></label></div><div class="inline-actions"><button id="gripper-open" class="button secondary" type="button">打开</button><button id="gripper-close" class="button secondary" type="button">闭合</button><button id="gripper-enable" class="button ghost" type="button">使能</button><button id="gripper-reset" class="button danger" type="button">复位</button></div><div id="gripper-feedback" class="feedback">等待夹爪状态</div><details id="gripper-limits" class="gripper-limits"><summary>行程设置</summary><div class="gripper-limits-body"><div class="form-grid"><label>开位<input id="gripper-open-position" type="number" step="1" /></label><label>闭位<input id="gripper-close-position" type="number" step="1" /></label></div><div class="inline-actions"><button id="gripper-teach-open" class="button ghost" type="button">开位=当前位置</button><button id="gripper-teach-close" class="button ghost" type="button">闭位=当前位置</button></div><label class="gripper-raw">原始位置 <output id="gripper-raw-value">0</output><input id="gripper-raw-position" type="range" min="0" max="1" step="1" value="0" /></label><button id="gripper-limits-apply" class="button primary full" type="button">应用行程</button><div id="gripper-limits-range" class="feedback"></div><div id="gripper-limits-status" class="feedback" role="status" aria-live="polite"></div></div></details></section>
    </aside>
  </main>
`;const Y=i=>document.querySelector(i),pM={l:2988957,m:13924166,r:8688794},Wi=Y("#arm-select"),Xh=Y("#connection"),qh=Y("#mode"),pp=Y("#stop-button"),mp=Y("#cancel-motion"),gp=Y("#recover-motion"),Td=Y("#execute-motion"),_p=Y("#start-velocity"),vp=Y("#cancel-velocity"),Ya=Y("#action-state"),mM=Y("#velocity-state"),$h=Y("#coordinate-state"),Yh=Y("#coordinate-summary"),ii=Y("#feedback"),Li=Y("#result"),Vl=Y("#progress"),cs=Y("#viewer-state"),fs=Y("#canvas"),ln=Y("#viewer"),Gl=Y("#fleet-strip"),Mo=Y("#selected-arm-label"),gM=Y("#input-mode-card"),ki=Y("#input-mode-select"),Kh=Y("#input-mode-active"),_M=Y("#input-mode-detail"),xp=Y("#input-mode-restart"),Zh=Y("#keyboard-control-card"),Jh=Y("#keyboard-control-state"),vM=Y("#keyboard-frame-legend"),Yc=Y("#control-tab-keyboard"),bp="realman-web-control.tab";let Zr="motion";try{const i=window.localStorage.getItem(bp);(i==="motion"||i==="velocity"||i==="gripper"||i==="keyboard")&&(Zr=i)}catch{}function yp(i,e=!0){if(Zr=i,e)try{window.localStorage.setItem(bp,i)}catch{}Ad()}function Ad(){const i=document.querySelector(`[data-control-tab="${Zr}"]`),e=i!=null&&i.hidden?"motion":Zr;document.querySelectorAll("[data-control-tab]").forEach(t=>{const n=t.dataset.controlTab===e;t.classList.toggle("selected",n),t.setAttribute("aria-selected",String(n)),t.tabIndex=n?0:-1}),document.querySelectorAll("[data-control-panel]").forEach(t=>{t.hidden=t.dataset.controlPanel!==e})}Y("#control-tabs").addEventListener("click",i=>{const e=i.target.closest("[data-control-tab]");if(!e||e.hidden)return;const t=e.dataset.controlTab==="motion"&&Zr!=="motion";yp(e.dataset.controlTab),t&&Kd()});Ad();const Hl=Y("#velocity-telemetry-grid"),Wl=Y("#joint-current-grid"),Mp=Y("#motion-mode"),xM=Y("#joint-target"),bM=Y("#pose-target"),Lr=Y("#pose-reference-frame"),ro=Y("#pose-sliders"),yM=Y("#pose-kinematics-actions"),Sp=Y("#fill-current-pose"),wd=Y("#solve-ik"),Rd=Y("#kinematics-status"),Ep=Y("#reset-preview"),So=Y("#motion-reference"),Eo=Y("#motion-velocity"),To=Y("#motion-timeout"),Tp=Y("#copy-current-joints"),Ao=Y("#joint-copy-status"),Yo=Y("#record-name"),Ap=Y("#save-record"),xn=Y("#record-select"),wp=Y("#apply-record"),Cd=Y("#delete-record"),Rp=Y("#record-status"),MM=["pose-x","pose-y","pose-z","pose-qw","pose-qx","pose-qy","pose-qz"],Pd={0:"MOVEJ",1:"MOVEL",2:"MOVEP"},SM={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};let Ue,ne="l",mt=0,Bt=[],Ko=[],Ot;const ws={},Jr={},Ni={};let hn="",oa=!1,ao=!1,Tt,$e,Ks="",vi="",jr,wo="",Ld="",Ct="",wn=0,Gn="",li=0;const Zn={l:new Set,r:new Set},EM={l:0,r:0};let Nr=0,ci=!1,jh,Ka=0;const Rs={},Nd={},Ms={},Bi={},Xl={},$i={},Qr={},Yi={},ms={},Kc={},ea={},Id={},Cp={},zi={},gs={},Ro={},Vi={},Dd={},_s={},Ir={},Ui={},Pn={},Qh={};let On,gn,tn,ri,ql=null,ef=0;function Co(){if(!Ue)throw new Error("manifest not loaded");return Ue.robots.find(i=>i.id===ne)}function Zo(i){if(!Ue)throw new Error("manifest not loaded");return Ue.robots.find(e=>e.id===i)}function Sn(i){return`${i}-${Date.now()}-${Math.random().toString(16).slice(2,8)}`}function yt(){return!ao&&(Ot==null?void 0:Ot.readyState)===WebSocket.OPEN}function Zs(i){var e;return((e=Tt==null?void 0:Tt.find(t=>t.id===i))==null?void 0:e.label)??i}function Ud(){return!!(Tt!=null&&Tt.some(i=>i.id==="keyboard"&&i.selectable))}function Fd(){return ci&&Ud()&&($e==null?void 0:$e.phase)==="ACTIVE"&&$e.active_mode==="keyboard"}function Pp(){return Ud()&&($e==null?void 0:$e.phase)==="ACTIVE"&&$e.active_mode==="keyboard"}function ta(i){var n,s,r;const e=(n=Ue==null?void 0:Ue.keyboard_control)==null?void 0:n.arms[i],t=Rs[i];return!!(e&&(t==null?void 0:t.motion_allowed)===!0&&t.work_matched===!0&&t.current_work===e.work_reference_name&&t.expected_work===e.work_reference_name&&((s=t.work)==null?void 0:s.name)===e.work_reference_name&&((r=t.work)==null?void 0:r.frame_id)===e.work_frame_id)}function Po(i){const e=ws[i==="l"?"gripper_left":"gripper_right"];return(e==null?void 0:e.connected)===!0&&e.alarm===0}function Lp(i){var t,n;const e=((n=(t=Ue==null?void 0:Ue.keyboard_control)==null?void 0:t.arms[i])==null?void 0:n.bindings)??{};return new Set(Object.values(e).flatMap(s=>[s.positive,s.negative]))}function Np(i){var e,t;return new Set(Object.values(((t=(e=Ue==null?void 0:Ue.keyboard_control)==null?void 0:e.grippers)==null?void 0:t[i])??{}))}function Ip(i,e){return Fd()&&yt()&&!document.hidden&&(Np(i).has(e)?Po(i):ta(i))}function Dp(i){for(const e of["l","r"])if(Lp(e).has(i)||Np(e).has(i))return e}function Up(i){Yt({type:"keyboard_state",arm:i,keys:[...Zn[i]].sort(),sequence:++EM[i]})}function na(){for(const i of["l","r"])Up(i)}function TM(){Nr&&window.clearInterval(Nr),Nr=0}function Xi(){const i=ci&&(Ot==null?void 0:Ot.readyState)===WebSocket.OPEN;Zn.l.clear(),Zn.r.clear(),TM(),i&&na(),la()}function ia(){if(!Fd()||!yt()){Xi();return}for(const i of["l","r"]){let e=!1;for(const t of Zn[i])Ip(i,t)||(Zn[i].delete(t),e=!0);e&&Up(i)}Nr||(na(),Nr=window.setInterval(na,Ue.keyboard_control.heartbeat_period_ms)),la()}function tf(i){var l,c,u;const e=Y(i==="l"?"#keyboard-left":"#keyboard-right"),t=(l=Ue==null?void 0:Ue.keyboard_control)==null?void 0:l.arms[i];if(!t){e.replaceChildren();return}const n={vx:"X",vy:"Y",vz:"Z",wx:"RX",wy:"RY",wz:"RZ"},s=h=>qt(h.replace(/^(Key|Digit)/,"")),r=(u=(c=Ue==null?void 0:Ue.keyboard_control)==null?void 0:c.grippers)==null?void 0:u[i],a=ws[i==="l"?"gripper_left":"gripper_right"],o=(a==null?void 0:a.connected)!==!0?"OFFLINE":a.alarm!==0?"ALARM":"READY";e.innerHTML=`<div class="keyboard-arm-heading"><strong>${i==="l"?"LEFT / L":"RIGHT / R"}</strong><span>${qt(t.work_frame_id)}</span></div><div class="keyboard-bindings ${ta(i)?"":"unavailable"}">${Object.entries(t.bindings).map(([h,d])=>`
    <div class="keyboard-binding"><span>${n[h]??h}</span><kbd data-code="${qt(d.positive)}">${s(d.positive)}</kbd><em>+</em><kbd data-code="${qt(d.negative)}">${s(d.negative)}</kbd><em>−</em></div>`).join("")}</div>
    ${r?`<div class="keyboard-gripper ${Po(i)?"":"unavailable"}"><div class="keyboard-arm-heading"><strong>夹爪 / 单次目标</strong><span>${o}</span></div><div class="keyboard-binding gripper-binding"><kbd data-code="${qt(r.open)}">${s(r.open)}</kbd><span>全开</span><kbd data-code="${qt(r.close)}">${s(r.close)}</kbd><span>全闭</span></div></div>`:""}`,e.querySelectorAll("kbd[data-code]").forEach(h=>h.classList.toggle("pressed",Zn[i].has(h.dataset.code??"")))}function la(){const i=Ud()&&!!(Ue!=null&&Ue.keyboard_control);if(Yc.hidden!==!i&&(Yc.hidden=!i,Ad()),!i)return;tf("l"),tf("r");const e=["l","r"].some(r=>[...Zn[r]].some(a=>Lp(r).has(a))),t=ta("l")||ta("r"),n=Po("l")||Po("r"),s=Pp()?ci?t?e?"MOVING":"READY":n?"GRIPPER ONLY":"WORK UNAVAILABLE":"REMOTE":"RELEASED";Jh.textContent=s,Jh.className=`mini-state keyboard-${s.toLowerCase().replaceAll(" ","-")}`}function AM(i){var s,r,a;const e=(s=Rs[i])==null?void 0:s.work,t=(r=e==null?void 0:e.xyz_m)==null?void 0:r.map(Number),n=(a=e==null?void 0:e.quaternion_wxyz)==null?void 0:a.map(Number);if(!(!ta(i)||(t==null?void 0:t.length)!==3||(n==null?void 0:n.length)!==4||![...t,...n].every(Number.isFinite)||Math.hypot(...n)<1e-9))return{position:t,quaternion:n}}function Lo(){const i=[];for(const e of["l","r"]){const t=Pn[e];let n=Qh[e];t!=null&&t.live&&(n==null?void 0:n.parent)!==t.live&&(n==null||n.removeFromParent(),n=new D_(.18),n.name=`${e}-keyboard-work-frame`,n.renderOrder=20,n.traverse(a=>{a.material&&(a.material.depthTest=!1,a.material.transparent=!0)}),t.live.add(n),Qh[e]=n);const s=AM(e),r=!!(n&&Pp()&&s);n&&(n.visible=r,s&&(n.position.fromArray(s.position),n.quaternion.set(s.quaternion[1],s.quaternion[2],s.quaternion[3],s.quaternion[0]).normalize(),n.updateMatrixWorld(!0))),r&&i.push(e)}ln.dataset.keyboardWorkFrames=i.join(","),vM.hidden=i.length===0}function wM(){!Fd()||($e==null?void 0:$e.epoch)===jh||Yc.hidden||(jh=$e.epoch,yp("keyboard",!1),Zh.classList.add("keyboard-guide-active"),Ka&&window.clearTimeout(Ka),Ka=window.setTimeout(()=>{Zh.classList.remove("keyboard-guide-active"),Ka=0},1800))}function No(i){return Tt==null?void 0:Tt.find(e=>e.id===i&&e.id!=="web"&&e.selectable)}function Fp(){const i=$e;if(!((i==null?void 0:i.phase)!=="ACTIVE"||i.active_mode==="none"||!No("none")))return No(i.active_mode)}function Op(){ki.disabled=!yt()||!!vi||($e==null?void 0:$e.phase)==="SWITCHING"||!(Tt!=null&&Tt.some(i=>i.id!=="web"&&i.selectable)),xp.disabled=!yt()||!!vi||!Fp()}function Dr(){vi="",jr=void 0,wo="",Ld=""}function Od(i,e){vi=Sn("input-mode"),jr=void 0,wo=i.id,Ks=e,as(),Yt({type:"select_input_mode",request_id:vi,mode_id:i.id})}function as(){if(gM.hidden=!Tt,!Tt){ia(),Lo();return}const e=($e==null?void 0:$e.phase)==="ACTIVE"&&$e.active_mode==="keyboard"&&!ci&&!wo?"":wo||($e==null?void 0:$e.selected_mode);ki.replaceChildren(...Tt.filter(s=>s.id!=="web").map(s=>{const r=document.createElement("option");return r.value=s.id,r.textContent=s.label,r.disabled=!s.selectable,r})),e&&Array.from(ki.options).some(s=>s.value===e)?ki.value=e:ki.selectedIndex=-1;const t=$e;Kh.textContent=t?`${Zs(t.active_mode)} / ${t.phase}`:"WAIT",Kh.className=`mini-state ${(t==null?void 0:t.phase.toLowerCase())??""}`;const n=t?t.phase==="ACTIVE"?`行为树已切换到 ${Zs(t.active_mode)}（epoch ${t.epoch}）`:t.phase==="SWITCHING"?`正在切换到 ${Zs(t.requested_mode)}…`:t.phase==="FAILED"?`切换到 ${Zs(t.requested_mode)} 失败`:t.phase:"等待输入模式状态";_M.textContent=(t==null?void 0:t.detail)||Ks||n,Op(),ia(),wM(),Lo()}function nf(){if(!vi||jr===void 0||!$e||$e.request_id!==jr||!["ACTIVE","FAILED"].includes($e.phase))return;ki.blur();const i=Ld;if(Dr(),!i)return;const e=No(i);$e.phase==="ACTIVE"&&$e.active_mode==="none"&&e&&yt()&&Od(e,`重启 ${e.label}：正在切回…`)}function qi(i,e=2){return Number.isFinite(i)?i.toFixed(e):""}function Wn(i,e=2){const t=Number(i);return Number.isFinite(t)?t.toFixed(e):String(i??"")}function RM(i){return`[${i.map(e=>(e*180/Math.PI).toFixed(3)).join(", ")}]`}async function CM(i){var n;if((n=navigator.clipboard)!=null&&n.writeText){await navigator.clipboard.writeText(i);return}const e=document.createElement("textarea");e.value=i,e.setAttribute("readonly",""),e.style.position="fixed",e.style.opacity="0",document.body.append(e),e.select();const t=document.execCommand("copy");if(e.remove(),!t)throw new Error("clipboard copy failed")}function bn(i){return i?`${i.type===1?"WORK":i.type===2?"TOOL":i.type===3?"TF":"BASE"} / ${i.name}`:"BASE / base"}function qt(i){return i.replace(/[&<>"']/g,e=>SM[e]??e)}function Jo(){return Rs[ne]}function Io(){return Pn[ne]}function ca(i){const e=Zo(i);return Ms[i]??e.joints.map(()=>Ue.default_joint_position_rad)}function kd(i){return $i[i]??ca(i)}function kp(i=mt){return i===1?"位姿已修改：影子等待“计算逆解”成功后更新":i===2?"MOVEP 位姿目标已修改：MOVEP 不提供逆解/影子预览，影子不会跟随滑轨；可直接发送 MOVEP":"位姿已修改"}function PM(){var i;Ko=[...ca(ne)],Bt=[...kd(ne)],jo(Bt,!0),Yp(),(i=Io())!=null&&i.shadow&&Es(Io().shadow,Bt),Mo.textContent=ne.toUpperCase(),Mo.className="mini-state active-arm",Bd(),Rd.textContent=Id[ne]??"MOVEL 逆解仅更新影子预览",Xd(),Js(),Ao.textContent=Bi[ne]===void 0?"等待有效 joint_states":"可复制当前关节角",Hd(),je()}function Bd(){var e,t,n,s,r;const i=Jo();if(So.textContent=bn(i==null?void 0:i.preferred_reference),$h.textContent=i?i.motion_allowed?"READY":"BLOCKED":"WAIT",$h.className=i?`mini-state ${i.motion_allowed?"accepted":"stopping"}`:"mini-state",!i){Yh.innerHTML='<div class="coordinate-empty">等待坐标状态</div>';return}Yh.innerHTML=`
    <div class="coordinate-row"><span>MOVE</span><strong>${bn(i.preferred_reference)}</strong></div>
    <div class="coordinate-row"><span>TOOL</span><strong>${bn(i.tool)}</strong></div>
    <div class="coordinate-meta">${((e=i.tool)==null?void 0:e.controller_name)??i.current_tool} ${((t=i.tool)==null?void 0:t.payload_kg)!=null?` / ${qi(i.tool.payload_kg)} kg`:""}</div>
    <div class="coordinate-meta">${(n=i.tool)!=null&&n.xyz_m?`xyz ${i.tool.xyz_m.map(a=>qi(a)).join(", ")}`:""}</div>
    <div class="coordinate-row"><span>WORK</span><strong>${bn(i.work)}</strong></div>
    <div class="coordinate-meta">${((s=i.work)==null?void 0:s.controller_name)??i.current_work}</div>
    <div class="coordinate-meta">${(r=i.work)!=null&&r.xyz_m?`xyz ${i.work.xyz_m.map(a=>qi(a)).join(", ")}`:""}</div>
  `}function sf(i){return`${i.reference_type===1?"WORK":i.reference_type===2?"TOOL":"BASE"} / ${i.reference_name||"unknown"}`}function rf(i,[e,t,n,s]){const[r,a,o]=i,l=2*(n*o-s*a),c=2*(s*r-t*o),u=2*(t*a-n*r);return[r+e*l+(n*u-s*c),a+e*c+(s*l-t*u),o+e*u+(t*c-n*l)]}function Bp(i,e){var l,c;const t=e.limited_linear_velocity_mps,n=e.limited_angular_velocity_radps;if(e.reference_type===0)return{linear:t,angular:n};if(e.reference_type===2)return{reason:"TOOL 坐标系命令随末端旋转，未叠加命令"};const s=(l=Rs[i])==null?void 0:l.work,r=(c=s==null?void 0:s.quaternion_wxyz)==null?void 0:c.map(Number);if(!s||s.name!==e.reference_name||(r==null?void 0:r.length)!==4||!r.every(Number.isFinite)||Math.hypot(...r)<1e-9)return{reason:`缺少 WORK / ${e.reference_name||"unknown"} 的姿态，未叠加命令`};const a=Math.hypot(...r),o=r.map(u=>u/a);return{linear:rf(t,o),angular:rf(n,o)}}const Do={};function zp(){if(Hl.childElementCount)return;Hl.innerHTML=["l","r"].map(t=>`<article class="velocity-telemetry-arm" id="velocity-telemetry-${t}" data-arm="${t}">
      <div class="velocity-telemetry-heading"><strong>${t==="l"?"LEFT / L":"RIGHT / R"}</strong><span class="telemetry-pills"><span class="telemetry-status" data-field="session">WAIT</span><span class="telemetry-status" data-field="measured-status">WAIT</span></span></div>
      <div class="telemetry-frames"><span>实测 <strong data-field="measured-frame">${t}/base_link</strong></span><span>命令 <strong data-field="command-frame">--</strong></span></div>
      <div class="telemetry-note" data-field="overlay-note">等待 /${t}/cartesian_velocity/state</div>
      ${["linear","angular"].map(n=>`<figure class="velocity-trace" data-trace="${n}"><figcaption>${n==="linear"?"线速度":"角速度"}<span>${n==="linear"?"m/s":"rad/s"}</span></figcaption><canvas data-field="${n}-trace" aria-label="${t.toUpperCase()} ${n==="linear"?"线速度":"角速度"}：最近 10 秒命令（虚线）与实际（实线）"></canvas></figure>`).join("")}
    </article>`).join("");for(const t of["l","r"])for(const n of["linear","angular"]){const s=Hl.querySelector(`#velocity-telemetry-${t} [data-field="${n}-trace"]`);Do[`${t}-${n}`]=new sM(s,n==="linear"?.01:.02)}let i=0;const e=t=>{if(requestAnimationFrame(e),!(document.hidden||t-i<33)){i=t;for(const n of Object.values(Do))n==null||n.draw(t)}};requestAnimationFrame(e)}const LM=1e3,Zc={},Vp={},oo={l:Array(6).fill(null),r:Array(6).fill(null)};function Gp(i){if(Wl.childElementCount)return;const e=s=>String(Number((s/1e3).toFixed(1)));Y("#joint-current-hint").textContent=`最近 10 s · 纵轴为 |电流| / 阈值 · ${i.policy_arm.toUpperCase()} 臂持续 ${i.sustain_sec} s 超过 100% 时，PolicyRun 结束本次尝试并重新抓取`,Wl.innerHTML=["l","r"].map(s=>{const r=i.enabled&&i.policy_arm===s;return`<article class="velocity-telemetry-arm" id="joint-current-${s}" data-arm="${s}">
      <div class="velocity-telemetry-heading"><strong>${s==="l"?"LEFT / L":"RIGHT / R"}</strong><span class="telemetry-pills"><span class="telemetry-status ${r?"active":""}" data-field="guard" title="${r?"policy 运行时由 PolicyRun 判定":"只显示，不拦截"}">${r?"保护 ON":"仅监测"}</span><span class="telemetry-status" data-field="status">WAIT</span></span></div>
      <div class="current-chips">${i.limits_ma.map((a,o)=>`<span class="current-chip" data-joint="${o+1}"><i style="background: ${Ed[o]}"></i>J${o+1} <strong data-field="j${o+1}">--</strong><small>/ ${e(a)} A</small></span>`).join("")}</div>
      <figure class="velocity-trace"><figcaption>|电流| / 阈值<span>%</span></figcaption><canvas data-field="current-trace" aria-label="${s.toUpperCase()} 关节电流：最近 10 秒，按各关节阈值归一化，虚线为 100%"></canvas></figure>
    </article>`}).join("");for(const s of["l","r"])Zc[s]=new aM(Wl.querySelector(`#joint-current-${s} [data-field="current-trace"]`),i.limits_ma);let t=0;const n=s=>{var r;if(requestAnimationFrame(n),!(document.hidden||s-t<33)){t=s;for(const a of["l","r"])(r=Zc[a])==null||r.draw(s),IM(a,i,s)}};requestAnimationFrame(n)}function NM(i,e){var r;const t=Ue==null?void 0:Ue.joint_current;if(!t||(Gp(t),!Array.isArray(e)||e.length!==6||!e.every(Number.isFinite)))return;const n=performance.now();Vp[i]={t:n,currents:e},(r=Zc[i])==null||r.push(n,e);const s=Y(`#joint-current-${i}`);e.forEach((a,o)=>{const l=Math.abs(a)>t.limits_ma[o],c=oo[i];c[o]=l?c[o]??n:null,s.querySelector(`[data-field="j${o+1}"]`).textContent=(Math.abs(a)/1e3).toFixed(2),s.querySelector(`.current-chip[data-joint="${o+1}"]`).classList.toggle("over",l)})}function IM(i,e,t){const n=document.querySelector(`#joint-current-${i} [data-field="status"]`);if(!n)return;const s=Vp[i];let r="WAIT",a="";if(s&&t-s.t>LM)r="STALE / NO DATA",a="stale";else if(s){let l=-1;if(oo[i].forEach((c,u)=>{c!==null&&(l<0||c<oo[i][l])&&(l=u)}),l<0)r="正常",a="valid";else{const c=(t-oo[i][l])/1e3;r=`J${l+1} 超限 ${c.toFixed(1)} s`,a=c>=e.sustain_sec?"over":"stale"}}n.textContent!==r&&(n.textContent=r);const o=`telemetry-status ${a}`.trim();n.className!==o&&(n.className=o)}function DM(i,e){var r,a;zp();const t=performance.now(),n=Bp(i,e),s="linear"in n;(r=Do[`${i}-linear`])==null||r.push(t,e.measured_valid?e.measured_linear_velocity_mps:null,s?n.linear:null),(a=Do[`${i}-angular`])==null||a.push(t,e.measured_valid?e.measured_angular_velocity_radps:null,s?n.angular:null)}function Hp(){zp();for(const i of["l","r"]){const e=Cp[i];if(!e)continue;const t=Y(`#velocity-telemetry-${i}`),n=l=>t.querySelector(`[data-field="${l}"]`),s=n("session");s.textContent=e.session_active?"ACTIVE":"IDLE",s.className=`telemetry-status ${e.session_active?"active":""}`;const r=n("measured-status");r.textContent=e.measured_valid?"VALID":"STALE / NO DATA",r.className=`telemetry-status ${e.measured_valid?"valid":"stale"}`,n("measured-frame").textContent=e.measured_frame_id||`${i}/base_link`,n("command-frame").textContent=e.command_frame_id||sf(e);const a=Bp(i,e),o=n("overlay-note");o.textContent="reason"in a?a.reason:e.reference_type===0?"命令与实测同为 base 坐标系":`命令已从 ${sf(e)} 旋转到实测坐标系`,o.classList.toggle("warn","reason"in a)}}function Js(){var e;if(!Ue)return;const i=new Set(Ue.robots.map(t=>t.id));for(const t of Ue.robots){const n=t.id,s=n===ne,r=Rs[n],a=Nd[n],o=a===void 0?"WAIT":a?"ONLINE":"OFFLINE",l=r?r.motion_allowed?"READY":"BLOCKED":"WAIT",c=((e=Ms[n])==null?void 0:e.length)||0;let u=Gl.querySelector(`button[data-arm="${n}"]`);u||(u=document.createElement("button"),u.type="button",u.className="fleet-chip",u.dataset.arm=n,u.innerHTML=`
        <span class="fleet-chip-arm">${n.toUpperCase()}</span>
        <span class="fleet-chip-state"></span>
        <span class="fleet-chip-motion"></span>
        <span class="fleet-chip-meta"></span>
      `,u.addEventListener("click",h=>{const d=h.currentTarget;Wi.value=d.dataset.arm,Wi.dispatchEvent(new Event("change"))}),Gl.append(u)),u.classList.toggle("selected",s),u.querySelector(".fleet-chip-state").textContent=o,u.querySelector(".fleet-chip-motion").textContent=l,u.querySelector(".fleet-chip-meta").textContent=c?`${c} joints`:t.model}Gl.querySelectorAll("button[data-arm]").forEach(t=>{i.has(t.dataset.arm)||t.remove()})}function Wp(){const i=Jo();return i!=null&&i.preferred_reference?i.preferred_reference:{type:0,name:"base",frame_id:`${ne}/base_link`}}function hi(i=ne){if(ms[i])return ms[i];const e=Rs[i];return e!=null&&e.preferred_reference?e.preferred_reference:{type:0,name:"base",frame_id:`${i}/base_link`}}function UM(i){const e=Zo(i).frames;return Object.values(e).map(t=>({type:t.type,name:t.name,frame_id:t.frame_id}))}function Xp(i){const e=UM(i),t=new Set(e.map(s=>s.frame_id)),n=(Kc[i]??[]).filter(s=>!t.has(s.frame_id));return[...e,...n]}function zd(){const i=Xp(ne),e=hi(ne);Lr.innerHTML=i.map(n=>`<option value="${qt(n.frame_id??n.name)}">${qt(bn(n))}</option>`).join("");const t=e.frame_id??e.name;i.some(n=>(n.frame_id??n.name)===t)?Lr.value=t:i[0]&&(Lr.value=i[0].frame_id??i[0].name,ms[ne]=i[0])}function FM(){var n;const i=((n=Yi[ne])==null?void 0:n.slice(0,3).map(Number))??[];if(i.length!==3||!i.every(Number.isFinite)){ro.innerHTML="";return}const e=ea[ne]??i;ea[ne]=[...e];const t=["X","Y","Z"];ro.innerHTML=t.map((s,r)=>{const a=e[r],o=a-.2,l=a+.2;return`<label>${s}<input data-pose-slider-index="${r}" type="range" min="${o.toFixed(2)}" max="${l.toFixed(2)}" step="0.001" value="${qi(i[r])}" /></label>`}).join(""),ro.querySelectorAll("input[data-pose-slider-index]").forEach(s=>{s.addEventListener("input",()=>{const r=Number(s.dataset.poseSliderIndex),a=Ss()[r];a.value=s.value,Yi[ne]=Ss().map(o=>o.value),gs[ne]=!1,zn(ne,kp()),fi(ne),je()})})}function OM(){ro.querySelectorAll("input[data-pose-slider-index]").forEach(i=>{const e=Number(Ss()[Number(i.dataset.poseSliderIndex)].value);Number.isFinite(e)&&(i.value=String(e))})}function Ss(){return MM.map(i=>Y(`#${i}`))}function lo(){const i=Yi[ne]??["","","","1","0","0","0"];Ss().forEach((e,t)=>{const n=i[t]??"";e.value=n===""?"":Wn(n)}),zd(),FM()}function Uo(){const i=Ss().map(n=>n.value.trim());if(i.some(n=>n===""))return null;const e=i.map(Number);if(!e.every(Number.isFinite))return null;const t=e.slice(3);return Math.hypot(...t)<1e-9?null:{position:e.slice(0,3),quaternion:t}}function qp(){const i=Number(Eo.value),e=Number(To.value);return!Number.isInteger(i)||i<1||i>100||!Number.isFinite(e)||e<=0?null:{velocity:i,timeout:e}}function $p(i){const e=mt;mt=i,Mp.querySelectorAll("button[data-motion-command]").forEach(t=>{const n=Number(t.dataset.motionCommand)===i;t.classList.toggle("selected",n),t.setAttribute("aria-pressed",String(n))}),xM.hidden=i!==0,bM.hidden=i===0,Ep.hidden=i!==0,yM.hidden=i===0,wd.hidden=i!==1,Cd.hidden=i!==0,Td.textContent=`发送 ${Pd[i]}`,fi(ne),i!==0&&(e===0||e!==i)&&Vd(ne),je()}function Yp(){var e;lo(),Ur();const i=Ro[ne];i&&(Eo.value=Wn(i.velocity),To.value=Wn(i.timeout)),So.textContent=bn((e=Jo())==null?void 0:e.preferred_reference),mt!==0&&(zd(),So.textContent=bn(hi())),Rd.textContent=Id[ne]??"MOVEL 逆解仅更新影子预览",$p(mt)}function Vd(i,e=!1){if(!yt()||!e&&zi[i])return;const t=Sn("current-pose"),n=hi(i);zi[i]=t,zn(i,`读取 ${bn(n)} 当前位姿…`),Yt({type:"get_current_pose",request_id:t,arm:i,reference:{reference_type:n.type,reference_name:n.name}}),je()}function Yt(i){(Ot==null?void 0:Ot.readyState)===WebSocket.OPEN&&Ot.send(JSON.stringify(i))}document.querySelectorAll('input[type="number"]').forEach(i=>{i.addEventListener("blur",()=>{i.value.trim()!==""&&(i.value=Wn(i.value))})});function Ur(){const i=Vi[ne]??[],e=xn.value;xn.innerHTML=i.length?i.map(t=>`<option value="${qt(t.id)}">${qt(t.label)}</option>`).join(""):'<option value="">无记录</option>',i.some(t=>t.id===e)&&(xn.value=e),Rp.textContent=Dd[ne]??(i.length?`${i.length} 条记录`:"无记录")}function zn(i,e){Id[i]=e,i===ne&&(Rd.textContent=e)}function ai(i,e){Dd[i]=e,i===ne&&(Rp.textContent=e)}function Gd(i,e,t){const n=Ir[i];n&&window.clearTimeout(n),_s[i]=e,ai(i,t),Ir[i]=window.setTimeout(()=>{_s[i]===e&&(delete _s[i],delete Ir[i],ai(i,"记录请求超时：请确认网页连接后重试"),je())},8e3)}function Za(i,e){if(_s[i]!==e)return!1;delete _s[i];const t=Ir[i];return t&&window.clearTimeout(t),delete Ir[i],!0}function Jc(i){Xh.textContent=i?"ROS ONLINE":"OFFLINE",Xh.classList.toggle("offline",!i)}function Hd(){const i=!!Nd[ne];Jc(i)}function Kp(){const i=Y("#joint-controls");i.innerHTML=Co().joints.map((e,t)=>`
    <label class="joint-row"><span>J${t+1}<output id="joint-value-${t}">${qi(Bt[t]*180/Math.PI)}°</output></span>
    <input data-joint-index="${t}" type="range" min="${e.lower_deg}" max="${e.upper_deg}" step="0.1" value="${Bt[t]*180/Math.PI}" /></label>
  `).join(""),i.querySelectorAll("input[data-joint-index]").forEach(e=>e.addEventListener("input",()=>{var n,s;const t=Number(e.dataset.jointIndex);Bt[t]=Number(e.value)*Math.PI/180,$i[ne]=[...Bt],Qr[ne]=!0,Y(`#joint-value-${t}`).textContent=`${qi(Number(e.value))}°`,(s=(n=Io())==null?void 0:n.shadow)==null||s.setJointValues(Object.fromEntries(Bt.map((r,a)=>[`joint_${a+1}`,r])))}))}function jo(i,e=!1){i.forEach((t,n)=>{const s=Y(`input[data-joint-index="${n}"]`),r=Y(`#joint-value-${n}`);if(!s||!r)return;const a=t*180/Math.PI;e&&(Bt[n]=t,s.value=String(a)),r.textContent=`${qi(a)}°`})}function Es(i,e){i==null||i.setJointValues(Object.fromEntries(e.map((t,n)=>[`joint_${n+1}`,t]))),i==null||i.updateMatrixWorld(!0)}function af(i,e,t){var a;const n=Ue==null?void 0:Ue.robots.find(o=>o.id===i);if(!(e.length===6&&(n==null?void 0:n.joints.every((o,l)=>Number.isFinite(Number(e[l]))&&Number(e[l])>=o.lower_deg&&Number(e[l])<=o.upper_deg))))return ai(i,"记录关节角超出限制"),!1;const r=e.map(o=>Number(o)*Math.PI/180);return $i[i]=[...r],Qr[i]=!0,gs[i]=!0,i===ne&&(Bt=[...r],jo(r,!0)),Es((a=Pn[i])==null?void 0:a.shadow,r),ai(i,t),i===ne&&(fi(i),Wd(!0)),!0}function of(i,e,t){i==null||i.traverse(n=>{n instanceof gt&&(n.material=e?new Xr({color:14715474,transparent:!0,opacity:t===ne?.28:0,depthWrite:!1,depthTest:!1,side:Rn}):new Ho({color:pM[t],metalness:.25,roughness:.56,depthWrite:!0,depthTest:!0}),n.castShadow=!e,n.receiveShadow=!e,n.renderOrder=e?10:0,n.frustumCulled=!e)})}function kM(i){i==null||i.traverse(e=>{e instanceof gt&&(e.material=new Ho({color:2831416,metalness:.35,roughness:.5}),e.castShadow=!0,e.receiveShadow=!0)})}function fi(i){var n,s;const e=ql?(n=Pn[ql])==null?void 0:n.shadow:null;e==null||e.traverse(r=>{r instanceof gt&&"opacity"in r.material&&(r.material.opacity=0)});const t=(s=Pn[i])==null?void 0:s.shadow;t==null||t.traverse(r=>{if(r instanceof gt&&"opacity"in r.material){const a=mt===0||mt===1&&gs[i]?.28:0;r.material.opacity=a}}),ql=i}function Wd(i=!1){if(!Ue||!tn||!ri||!gn)return;const e=new Ts;if(Ue.robots.forEach(({id:r})=>{const a=Pn[r];a&&(e.expandByObject(a.live),i&&r===ne&&e.expandByObject(a.shadow))}),e.isEmpty())return;const t=e.getSize(new I),n=Math.max(t.x,t.y,t.z,.5),s=e.min.z+t.z*.36;ri.target.set(0,0,s),tn.position.set(n*1.18,-n*1.65,s+n*.82),tn.lookAt(ri.target),ri.update()}function co(i){let e=0;return i==null||i.traverse(t=>{t instanceof gt&&(e+=1)}),e}async function lf(i,e=7){for(let t=0;t<160;t+=1){if(i.every(n=>co(n)>=e))return;await new Promise(n=>window.setTimeout(n,50))}throw new Error("URDF mesh loading timed out")}async function BM(){var t;const i=++ef;cs.textContent="加载 URDF…",cs.removeAttribute("hidden");const e=new tM;e.packages={rm65_description:`${location.origin}/models`};for(const n of Object.keys(Ni))delete Ni[n];try{const n=await Promise.all(Ue.robots.map(async u=>{var v;const h=await e.loadAsync(`${location.origin}${u.urdf_url}`),d=await e.loadAsync(`${location.origin}${u.urdf_url}`),f=(v=Ue.end_effectors)==null?void 0:v[u.id],g=f?await e.loadAsync(`${location.origin}${f.urdf_url}`):null;return{config:u,live:h,shadow:d,mount:f,gripper:g}}));if(i!==ef)return;if(!gn)throw new Error("WebGL scene was not initialized");gn.clear(),gn.add(new S_(16777215,13884389,2.4));const s=new jf(16777215,4);s.position.set(2,-3,4),s.castShadow=!0,gn.add(s);const r=new I_(3.5,22,11780561,14542060);r.rotation.x=Math.PI/2,gn.add(r);const a=[],o=(t=Ue.robots.find(u=>u.id==="m"))==null?void 0:t.transform;if(!o)throw new Error("middle-arm transform is missing from the layout manifest");const l=Ue.pedestal;if(l){const u=new gt(new As(l.size_xy[0],l.size_xy[1],l.top_z-l.bottom_z),new Ho({color:l.color,metalness:.1,roughness:.8}));u.name="pedestal",u.position.set(l.center_xy[0]-o.x,l.center_xy[1]-o.y,(l.top_z+l.bottom_z)/2-o.z),u.castShadow=!0,u.receiveShadow=!0,gn.add(u),r.position.z=l.bottom_z-o.z-.002,ln.dataset.pedestal="1"}else delete ln.dataset.pedestal;n.forEach(({config:u,live:h,shadow:d,mount:f,gripper:g})=>{var m;h.position.set(u.transform.x-o.x,u.transform.y-o.y,u.transform.z-o.z),h.rotation.set(u.transform.roll,u.transform.pitch,u.transform.yaw,"ZYX"),d.position.set(u.transform.x-o.x,u.transform.y-o.y,u.transform.z-o.z),d.rotation.set(u.transform.roll,u.transform.pitch,u.transform.yaw,"ZYX");const v=f&&g?(m=h.links)==null?void 0:m[f.parent_link]:null;f&&g&&v&&(g.position.set(...f.xyz),g.rotation.set(f.rpy[0],f.rpy[1],f.rpy[2],"ZYX"),v.add(g),Ni[u.id]=g,g.setJointValue(f.driving_joint,f.open_rad)),gn.add(h),gn.add(d),Pn[u.id]={live:h,shadow:d},a.push(h,d)}),await lf(a),await lf(Object.values(Ni),9),n.forEach(({config:u,live:h,shadow:d})=>{of(h,!1,u.id),kM(Ni[u.id]),of(d,!0,u.id),Es(h,ca(u.id)),Es(d,kd(u.id)),h.updateMatrixWorld(!0)}),Lo();const c=Zo(ne);fi(ne),Wd(!1),ln.dataset.liveMeshes=String(n.reduce((u,{live:h})=>u+co(h),0)),ln.dataset.shadowMeshes=String(n.reduce((u,{shadow:h})=>u+co(h),0)),ln.dataset.gripperMeshes=String(Object.values(Ni).reduce((u,h)=>u+co(h),0)),qd(),ln.dataset.visualizationReferenceArm="m",cs.setAttribute("hidden",""),Y("#model-label").textContent=`${c.model} / ${ne.toUpperCase()} + 3 arms`}catch(n){cs.textContent=`URDF 加载失败: ${String(n)}`,cs.removeAttribute("hidden")}}function zM(){On=new Ly({canvas:fs,antialias:!0,alpha:!0,preserveDrawingBuffer:!0}),ln.dataset.renderer="webgl",On.setPixelRatio(Math.min(window.devicePixelRatio,2)),On.outputColorSpace=dt,On.setClearColor(16185595,1),On.shadowMap.enabled=!0,gn=new Ff,tn=new Xt(35,1,.01,100),tn.up.set(0,0,1),tn.position.set(1.2,-1.8,1.25),ri=new Iy(tn,fs),ri.enableDamping=!0,ri.target.set(0,0,.55);const i=()=>{const t=ln.getBoundingClientRect();!t.width||!t.height||!On||!tn||(On.setSize(t.width,t.height,!1),tn.aspect=t.width/t.height,tn.updateProjectionMatrix())};new ResizeObserver(i).observe(ln),i(),VM();const e=()=>{requestAnimationFrame(e),!(!On||!gn||!tn||!ri)&&(ri.update(),On.render(gn,tn))};e()}const rs=Y("#viewer-hover"),cf=new N_;let df;function uf(i){var e;if(i!==df){for(const[t,n]of Object.entries(Pn))(e=n.live)==null||e.traverse(s=>{s instanceof gt&&s.material instanceof Ho&&(s.material.emissive.set(t===i?4088797:0),s.material.emissiveIntensity=t===i?.28:0)});df=i,ln.classList.toggle("hovering-arm",!!i)}}function hf(i){if(!tn)return;const e=fs.getBoundingClientRect();cf.setFromCamera(new Ne((i.clientX-e.left)/e.width*2-1,-((i.clientY-e.top)/e.height)*2+1),tn);let t;for(const[n,s]of Object.entries(Pn)){if(!s.live)continue;const r=cf.intersectObject(s.live,!0)[0];if(!r||t&&t.distance<=r.distance)continue;let a=r.object,o=!1;for(;a&&!a.isURDFLink;)a=a.parent;for(let l=a;l;l=l.parent)o||(o=l===Ni[n]);t={arm:n,link:o?"夹爪":(a==null?void 0:a.name)??"",distance:r.distance}}return t&&{arm:t.arm,link:t.link}}function VM(){let i=0,e;fs.addEventListener("pointermove",t=>{if(t.buttons){rs.hidden=!0;return}i||(i=requestAnimationFrame(()=>{var a;i=0;const n=hf(t);if(uf(n==null?void 0:n.arm),rs.hidden=!n,!n)return;const s=((a=Wi.querySelector(`option[value="${n.arm}"]`))==null?void 0:a.textContent)??n.arm.toUpperCase();rs.innerHTML=`${qt(s)}<span>${qt(n.link)}${n.arm===ne?"":" · 点击选中"}</span>`;const r=ln.getBoundingClientRect();rs.style.left=`${t.clientX-r.left}px`,rs.style.top=`${t.clientY-r.top}px`}))}),fs.addEventListener("pointerleave",()=>{uf(void 0),rs.hidden=!0}),fs.addEventListener("pointerdown",t=>{e={x:t.clientX,y:t.clientY}}),fs.addEventListener("pointerup",t=>{const n=e&&Math.hypot(t.clientX-e.x,t.clientY-e.y)<4;if(e=void 0,!n)return;const s=hf(t);!s||s.arm===ne||(Wi.value=s.arm,Wi.dispatchEvent(new Event("change")),rs.hidden=!0)})}function Xd(){const i=Co().motion;Y("#velocity-frame").innerHTML=Object.entries(Co().frames).map(([n,s])=>`<option value="${n}">${n.toUpperCase()} / ${s.name}</option>`).join(""),Y("#velocity-period").setAttribute("value",Wn(i.velocity_control_period_ms)),Y("#velocity-watchdog").setAttribute("value",Wn(i.velocity_watchdog_ms)),Y("#linear-accel").setAttribute("value",Wn(i.max_linear_accel_mps2)),Y("#angular-accel").setAttribute("value",Wn(i.max_angular_accel_radps2));const e=["vx","vy","vz","wx","wy","wz"];Y("#velocity-inputs").innerHTML=e.map((n,s)=>`<label>${n}<input id="velocity-${s}" type="number" step="0.01" value="0.00" /></label>`).join("");const t=Jo();if(t!=null&&t.preferred_reference){const n=t.preferred_reference.type===1?"work":t.preferred_reference.type===2?"tool":"base";Y("#velocity-frame").value=n}}function Cs(i,e={}){!hn||!yt()||Yt({type:"gripper_command",request_id:Sn("gripper"),name:hn,command:i,...e})}function Zp(i){var s,r,a;const e=Number((s=ws[i])==null?void 0:s.position),t=Number((r=Jr[i])==null?void 0:r.open_position),n=Number((a=Jr[i])==null?void 0:a.close_position);return!Number.isFinite(e)||!Number.isFinite(t)||!Number.isFinite(n)||t===n?null:Math.min(Math.max((e-n)/(t-n),0),1)}function qd(){var i;for(const e of["l","m","r"]){const t=Ni[e],n=(i=Ue==null?void 0:Ue.end_effectors)==null?void 0:i[e];if(!t||!n)continue;const s=Zp(n.gripper_name);s!==null&&(t.setJointValue(n.driving_joint,n.closed_rad+(n.open_rad-n.closed_rad)*s),ln.dataset[`gripper${e.toUpperCase()}`]=s.toFixed(2))}}function $d(){const i=ws[hn];if(!i)return;Y("#gripper-state").textContent=i.connected?"ONLINE":"OFFLINE",ua();const e=Zp(hn),t=e===null?"":`开合 ${Math.round(e*100)}% / `;Y("#gripper-feedback").textContent=`${t}位置 ${i.position??0} / 速度 ${i.speed??0} / 电流 ${i.current??0} / 力矩 ${i.torque_reached?"到达":"未到达"} / 报警 0x${Number(i.alarm??0).toString(16)}`}function da(i){Y("#gripper-limits-status").textContent=i}function Yd(){return{open:Y("#gripper-open-position"),close:Y("#gripper-close-position"),raw:Y("#gripper-raw-position"),rawValue:Y("#gripper-raw-value"),apply:Y("#gripper-limits-apply"),teachOpen:Y("#gripper-teach-open"),teachClose:Y("#gripper-teach-close")}}function ua(){const i=Jr[hn],e=ws[hn],t=Yd(),n=yt()&&!!i,s=n&&(e==null?void 0:e.connected)===!0&&Number(e.speed)===0;if(i){const r=Number(i.min_position??0),a=Number(i.max_position??0);t.raw.min=String(r),t.raw.max=String(a),Y("#gripper-limits-range").textContent=`允许范围 ${r}..${a}（min/max 只能在 gripper.yaml 中修改）`;const o=document.activeElement===t.open||document.activeElement===t.close;!oa&&!o&&(t.open.value=String(i.open_position),t.close.value=String(i.close_position))}e&&document.activeElement!==t.raw&&(t.raw.value=String(Math.round(Number(e.position)||0)),t.rawValue.textContent=t.raw.value);for(const r of[t.open,t.close,t.raw,t.apply])r.disabled=!n;t.teachOpen.disabled=!s,t.teachClose.disabled=!s}function Jp(i){var t;const e=Number((t=ws[hn])==null?void 0:t.position);Number.isFinite(e)&&(Yd()[i].value=String(Math.round(e)),oa=!0,da(""))}function GM(){const i=Jr[hn];if(!i||!yt())return;const{open:e,close:t}=Yd(),n=Number(e.value),s=Number(t.value);if(e.value===""||t.value===""||!Number.isInteger(n)||!Number.isInteger(s)){da("开位和闭位必须是整数");return}window.confirm(`确认修改 ${hn} 的行程？
开位 ${i.open_position} → ${n}
闭位 ${i.close_position} → ${s}`)&&Cs("set_limits",{open_position:n,close_position:s})}function HM(i){const e=Y("#gripper-select");e.innerHTML=i.map(t=>`<option value="${String(t.name)}">${String(t.name)}</option>`).join("");for(const t of i)Jr[String(t.name)]=t;qd(),!hn&&i.length&&(hn=String(i[0].name)),e.value=hn,$d(),ua()}function WM(i){var e,t,n,s,r,a,o,l,c,u,h;if(i.type==="hello")ao=!!i.read_only,qh.textContent=ao?"READ ONLY":"CONTROL READY",qh.classList.toggle("ready",!ao),i.layout?Qp(i.layout):je();else if(i.type==="input_mode_list")i.available?Tt=Array.isArray(i.modes)?i.modes.reduce((d,f)=>(typeof(f==null?void 0:f.id)=="string"&&typeof(f==null?void 0:f.label)=="string"&&typeof(f==null?void 0:f.selectable)=="boolean"&&d.push({id:f.id,label:f.label,selectable:f.selectable}),d),[]):[]:(Tt=void 0,$e=void 0,Ks="",Dr()),as();else if(i.type==="keyboard_lease")ci=!!i.active,ci||Xi(),as();else if(i.type==="input_mode_result"){const d={request_id:String(i.request_id??""),executor_request_id:Number(i.executor_request_id),accepted:!!i.accepted,message:String(i.message??"")};d.request_id===vi&&(Ks=d.message,d.accepted&&Number.isFinite(d.executor_request_id)?(jr=d.executor_request_id,nf()):Dr(),as())}else if(i.type==="input_mode_state"){const d=String(i.phase??""),f=String(i.active_mode??""),g=$e!==void 0&&$e.epoch!==Number(i.epoch)||d!=="ACTIVE"||f!=="keyboard";g&&Xi(),$e={requested_mode:String(i.requested_mode??""),selected_mode:String(i.selected_mode??""),active_mode:String(i.active_mode??""),phase:String(i.phase??""),request_id:Number(i.request_id),epoch:Number(i.epoch),detail:String(i.detail??"")},g&&(ci=!1),nf(),as(),ur()}else if(i.type==="gripper_list")HM(Array.isArray(i.grippers)?i.grippers:[]);else if(i.type==="gripper_state")ws[String(i.name)]=i,$d(),qd(),ia();else if(i.type==="gripper_result"){if(i.command==="set_limits"||i.command==="move_raw"){if(i.message){const d=i.success===!1?"失败：":i.command==="set_limits"&&i.success===!0?"已应用：":"";da(`${d}${String(i.message)}`)}}else i.message&&(Y("#gripper-feedback").textContent=String(i.message));i.command==="set_limits"&&i.state==="completed"&&i.success===!0&&(oa=!1,ua())}else if(i.type==="coordinate_state")Rs[i.arm]=i,ia(),Lo(),Js(),i.arm===ne&&(Bd(),Ue&&Xd());else if(i.type==="cartesian_velocity_state"){const d=i.arm;if(!["l","m","r"].includes(d))return;const f=i.state;if(!f)return;Cp[d]=f,d!=="m"&&DM(d,f),Hp()}else if(i.type==="joint_currents"){const d=i.arm;(d==="l"||d==="r")&&NM(d,i.currents_ma)}else if(i.type==="tf_frames"){const d=i.arm;if(Kc[d]=Array.isArray(i.frames)?i.frames:[],d===ne&&Ue){const f=hi(d);f.type===3&&!((e=Kc[d])!=null&&e.some(g=>g.frame_id===f.frame_id))&&delete ms[d],zd(),lo(),je()}}else if(i.type==="connection")Nd[i.arm]=!!i.connected,Js(),i.arm===ne&&Hd();else if(i.type==="joint_state"){const d=i.arm,f=Array.isArray(i.positions_rad)?i.positions_rad.map(Number):[],g=Number(i.stamp_ns);if(!["l","m","r"].includes(d)||f.length!==6||!f.every(Number.isFinite)||!Number.isFinite(g)||g<=0||Bi[d]!==void 0&&g<=Bi[d])return;const v=f.every(p=>p===0);if(v&&Xl[d])return;const m=Bi[d]===void 0||!v&&!Xl[d];Bi[d]=g,v||(Xl[d]=!0),Ms[d]=f,Qr[d]||($i[d]=[...f]),Es((t=Pn[d])==null?void 0:t.live,f),d===ne&&(Ko=f,Y("#joint-stamp").textContent=`joint_states / ${g}`,Ao.textContent="可复制当前关节角",m&&Kd()),Js()}else if(i.type==="joint_records")Vi[i.arm]=Array.isArray(i.records)?i.records:[],Dd[i.arm]||ai(i.arm,`${((n=Vi[i.arm])==null?void 0:n.length)??0} 条记录`),i.arm===ne&&Ur(),je();else if(i.type==="joint_record_saved"){const d=i.arm;if(!Za(d,i.request_id))return;ai(d,`已记录 ${((s=i.record)==null?void 0:s.label)??""}`),Yo.value="",d===ne&&Ur(),je()}else if(i.type==="joint_record_deleted"){const d=i.arm;if(!Za(d,i.request_id))return;const f=String(((r=i.record)==null?void 0:r.id)??"");Vi[d]=(Vi[d]??[]).filter(g=>g.id!==f),ai(d,`已删除 ${((a=i.record)==null?void 0:a.label)??"记录"}`),d===ne&&Ur(),je()}else if(i.type==="joint_record_applied"){const d=i.arm;if(!Za(d,i.request_id))return;const f=Array.isArray(i.joint_degrees)?i.joint_degrees:[],g=Number(i.command);if(g===0)af(d,f,`已填入 ${((o=i.record)==null?void 0:o.label)??"记录"} / MOVEJ`);else{const v=Array.isArray(i.pose_position_m)?i.pose_position_m:[],m=Array.isArray(i.pose_quaternion_wxyz)?i.pose_quaternion_wxyz:[];if(i.success&&v.length===3&&m.length===4&&af(d,f,`已填入 ${((l=i.record)==null?void 0:l.label)??"记录"} / ${Pd[g]}`)){Yi[d]=[...v,...m].map(S=>String(S));const p=i.reference;(p==null?void 0:p.type)===3&&(ms[d]=p),ea[d]=[...v],zn(d,`记录正解已填入 / ${bn(p??hi(d))}`),d===ne&&lo()}else ai(d,`记录正解失败 / ${i.message||"forward kinematics failed"}`)}je()}else if(i.type==="kinematics_result"){const d=i.arm;if(zi[d]!==i.request_id)return;if(delete zi[d],i.operation==="get_current_pose"){const f=Array.isArray(i.pose_position_m)?i.pose_position_m:[],g=Array.isArray(i.pose_quaternion_wxyz)?i.pose_quaternion_wxyz:[];if(i.success&&f.length===3&&g.length===4){Yi[d]=[...f,...g].map(m=>String(m));const v=i.reference;(v==null?void 0:v.type)===3&&(ms[d]=v),ea[d]=[...f],gs[d]=!1,zn(d,`当前位置已填入 / ${bn(v??hi(d))}`),d===ne&&lo(),d===ne&&fi(d)}else zn(d,`当前位置读取失败 / ${i.message||"unknown error"}`)}else if(i.operation==="solve_ik"){const f=Array.isArray(i.joint_degrees)?i.joint_degrees:[],g=Ue==null?void 0:Ue.robots.find(m=>m.id===d);if(!!i.success&&f.length===6&&(g==null?void 0:g.joints.every((m,p)=>Number.isFinite(Number(f[p]))&&Number(f[p])>=m.lower_deg&&Number(f[p])<=m.upper_deg))){const m=f.map(p=>Number(p)*Math.PI/180);$i[d]=[...m],Qr[d]=!0,gs[d]=!0,d===ne&&(Bt=[...m],jo(m,!0)),Es((c=Pn[d])==null?void 0:c.shadow,m),zn(d,`逆解成功 / 影子已更新 / ${f.map(p=>Number(p).toFixed(2)).join(", ")}°`),d===ne&&(fi(d),Wd(!0))}else gs[d]=!1,zn(d,`逆解失败 / ${i.message||"target is unreachable"}`),d===ne&&fi(d)}je()}else if(i.type==="action_state"){if(i.arm!==ne){Js();return}if(i.action==="execute_motion"&&Ct&&i.request_id&&i.request_id!==Ct)return;Ya.textContent=String(i.state).toUpperCase(),Ya.className=`mini-state ${i.state}`,i.action==="cartesian_velocity"&&(mM.textContent=String(i.state).toUpperCase()),["rejected","error","stopped"].includes(i.state)&&(i.action==="execute_motion"&&(window.clearTimeout(wn),wn=0,ii.textContent=`${i.action} / ${i.message||`action ${i.state}`}`,Vl.style.width="0%",Ct=""),i.action==="cartesian_velocity"&&(Gn="",window.clearInterval(li),li=0),je())}else if(i.type==="action_feedback"){if(i.arm!==ne)return;if(i.action==="execute_motion"){if(Ct&&i.request_id&&i.request_id!==Ct)return;window.clearTimeout(wn),wn=0}const d=i.feedback||{};ii.textContent=`${i.action} / ${d.detail||"executing"} / progress ${d.progress??"-"}`,Array.isArray(d.commanded_linear_velocity_mps)&&(ii.textContent=`velocity / ${d.commanded_linear_velocity_mps.map(f=>qi(f)).join(", ")}`),Vl.style.width=`${Math.max(0,Math.min(100,Number(d.progress||0)*100))}%`}else if(i.type==="action_result"){if(i.arm!==ne)return;if(i.action==="execute_motion"){if(Ct&&i.request_id&&i.request_id!==Ct)return;window.clearTimeout(wn),wn=0,(ii.textContent.includes("等待 feedback")||ii.textContent.includes("尚未收到"))&&(ii.textContent=`${i.action} / ${((u=i.result)==null?void 0:u.message)||"已收到运行结果"}`)}Li.textContent=JSON.stringify(i.result,null,2),Ya.textContent="RESULT",Ct=i.action==="execute_motion"?"":Ct,Gn=i.action==="cartesian_velocity"?"":Gn,je()}else if(i.type==="software_stop_result")Li.textContent=`软件停止: ${i.success?"成功":"失败"} / ${i.message}`;else if(i.type==="motion_recovery_state"){const d=i.arm;if(Ui[d]!==i.request_id)return;Li.textContent=`${d.toUpperCase()} 恢复请求中 / ${i.state}`,je()}else if(i.type==="motion_recovery_result"){const d=i.arm;if(Ui[d]!==i.request_id)return;delete Ui[d];const f=i.success?i.recovered?"已恢复":"无需恢复":"恢复失败";Li.textContent=`${d.toUpperCase()} ${f} / ${i.message||"unknown error"}`,d===ne&&(Ya.textContent=f.toUpperCase()),je()}else if(i.type==="bt_runtime")Rt=((h=i.runtime)==null?void 0:h.available)===!0?i.runtime:{available:!1},ur();else if(i.type==="behavior_tree_stop_result"){if(i.request_id!==yn)return;Oo(i.success?`已请求终止（${i.message}），等待行为树取消动作并退出…`:`终止失败：${i.message}`,!i.success),i.success||(yn=""),vs()}else if(i.type==="error"&&i.request_id&&i.request_id===yn)yn="",Oo(`终止失败：${i.message}`,!0),vs();else if(i.type==="error"){if(i.code==="keyboard_lease"||i.code==="keyboard_inactive"){ci=!1,Xi(),Ks=`${i.code}: ${i.message}`,as();return}Li.textContent=`${i.code}: ${i.message}`,i.request_id===vi&&(Ks=`${i.code}: ${i.message}`,Dr(),as()),Ct&&i.request_id===Ct&&(window.clearTimeout(wn),wn=0,ii.textContent=`execute_motion / ${i.code}: ${i.message}`,Vl.style.width="0%",Ct=""),i.request_id===Gn&&(Gn="",window.clearInterval(li),li=0);for(const d of["l","m","r"])i.request_id===zi[d]&&(delete zi[d],zn(d,`${i.code}: ${i.message}`)),i.request_id===_s[d]&&(Za(d,i.request_id),ai(d,`${i.code}: ${i.message}`)),i.request_id===Ui[d]&&(delete Ui[d],Li.textContent=`${d.toUpperCase()} 恢复失败 / ${i.code}: ${i.message}`);je()}}function jp(){ci=!1,Xi(),Ot==null||Ot.close();const i=location.protocol==="https:"?"wss":"ws";Ot=new WebSocket(`${i}://${location.host}/ws`),Ot.addEventListener("open",()=>{Jc(!0),je()}),Ot.addEventListener("close",()=>{Xi(),Jc(!1),Dr(),Rt={available:!1},ur(),je(),window.setTimeout(jp,2e3)}),Ot.addEventListener("message",e=>{try{WM(JSON.parse(e.data))}catch{Li.textContent="收到无法解析的服务器消息"}})}function je(){var s;const i=yt(),e=!!qp()&&(mt===0||!!Uo());Td.disabled=!i||!!Ct||!e,_p.disabled=!i||!!Gn,vp.disabled=!i||!Gn,mp.disabled=!i||!Ct,gp.disabled=!i||!!Ui[ne],pp.disabled=!i;const t=!!zi[ne];Sp.disabled=!i||mt===0,wd.disabled=!i||mt!==1||t||!Uo();const n=!!_s[ne];Tp.disabled=!i||Bi[ne]===void 0,Ap.disabled=!i||n||Yo.value.trim()===""||(((s=Ms[ne])==null?void 0:s.length)??0)!==6,wp.disabled=!i||n||!xn.value,Cd.disabled=!i||mt!==0||n||!xn.value,Op(),ua()}function Qp(i){Ue=i,i.joint_current&&Gp(i.joint_current),la(),ne=Wi.value,i.robots.forEach(e=>{const t=e.joints.map(()=>i.default_joint_position_rad);Ms[e.id]=Ms[e.id]??[...t],$i[e.id]=$i[e.id]??[...t],Yi[e.id]=Yi[e.id]??["","","","1","0","0","0"],Vi[e.id]=Vi[e.id]??[],Ro[e.id]=Ro[e.id]??{velocity:Wn(30),timeout:Wn(e.motion.default_timeout_sec)}}),Ko=[...ca(ne)],Bt=[...kd(ne)],Y("#root-frame").textContent=`TF / ${i.root_frame}`,Mo.textContent=ne.toUpperCase(),Mo.className="mini-state active-arm",Kp(),Ur(),Yp(),Xd(),Bd(),Hp(),Js(),Hd(),On||zM(),BM(),je()}window.addEventListener("keydown",i=>{const e=i.target;if(i.repeat||i.ctrlKey||i.altKey||i.metaKey||i.shiftKey||i.isComposing||e!=null&&e.closest("input, textarea, select")||e!=null&&e.isContentEditable)return;const t=Dp(i.code);!t||!Ip(t,i.code)||(i.preventDefault(),Zn[t].has(i.code)||(Zn[t].add(i.code),ia(),na(),la()))});window.addEventListener("keyup",i=>{const e=Dp(i.code);!e||!Zn[e].delete(i.code)||(i.preventDefault(),na(),la())});window.addEventListener("blur",Xi);document.addEventListener("visibilitychange",()=>{document.hidden&&Xi()});function Kd(){var i;Bi[ne]!==void 0&&(Bt=[...Ko],$i[ne]=[...Bt],Qr[ne]=!0,jo(Bt,!0),Es((i=Io())==null?void 0:i.shadow,Bt))}Ep.addEventListener("click",Kd);Wi.addEventListener("change",()=>{ne=Wi.value,Ct="",Gn="",window.clearInterval(li),li=0,Kp(),fi(ne),PM();const i=Zo(ne);Y("#model-label").textContent=`${i.model} / ${ne.toUpperCase()} + 3 arms`});ki.addEventListener("change",()=>{const i=Tt==null?void 0:Tt.find(e=>e.id===ki.value);!i||!i.selectable||i.id==="web"||!yt()||Od(i,`请求切换到 ${i.label}…`)});xp.addEventListener("click",()=>{const i=Fp(),e=No("none");!i||!e||vi||!yt()||(Od(e,`重启 ${i.label}：先切换到 ${e.label}…`),Ld=i.id)});Mp.querySelectorAll("button[data-motion-command]").forEach(i=>{i.addEventListener("click",()=>{const e=Number(i.dataset.motionCommand);(e===0||e===1||e===2)&&$p(e)})});Ss().forEach(i=>{i.addEventListener("input",()=>{Yi[ne]=Ss().map(e=>e.value),OM(),gs[ne]=!1,zn(ne,kp()),fi(ne),je()})});[Eo,To].forEach(i=>{i.addEventListener("input",()=>{Ro[ne]={velocity:Eo.value,timeout:To.value},je()})});Yo.addEventListener("input",je);xn.addEventListener("change",je);Tp.addEventListener("click",async()=>{const i=Ms[ne];if(!(!i||i.length!==6||Bi[ne]===void 0))try{await CM(RM(i)),Ao.textContent="已复制当前关节角"}catch{Ao.textContent="复制失败，请检查浏览器剪贴板权限"}});Ap.addEventListener("click",()=>{if(!yt())return;const i=Yo.value.trim();if(!i)return;const e=Sn("save-record");Gd(ne,e,"保存当前关节角…"),Yt({type:"save_joint_record",request_id:e,arm:ne,label:i}),je()});wp.addEventListener("click",()=>{if(!yt()||!xn.value)return;const i=Sn("apply-record"),e=mt===0?Wp():hi();Gd(ne,i,"读取记录…"),Yt({type:"apply_joint_record",request_id:i,arm:ne,record_id:xn.value,command:mt,reference:{reference_type:e.type,reference_name:e.name}}),je()});Cd.addEventListener("click",()=>{var t;if(!yt()||mt!==0||!xn.value)return;const i=(t=Vi[ne])==null?void 0:t.find(n=>n.id===xn.value);if(!window.confirm(`删除关节记录“${(i==null?void 0:i.label)??xn.value}”？此操作不可撤销。`))return;const e=Sn("delete-record");Gd(ne,e,"删除关节记录…"),Yt({type:"delete_joint_record",request_id:e,arm:ne,record_id:xn.value}),je()});Td.addEventListener("click",()=>{const i=qp(),e=mt===0?null:Uo();if(!yt()||!i||mt!==0&&!e)return;const t=Pd[mt];Ct=Sn(t.toLowerCase());const n=mt===0?Wp():hi();Yt({type:"execute_motion",request_id:Ct,arm:ne,goal:{command:mt,reference_type:n.type,reference_name:n.name,joint_degrees:mt===0?Bt.map(a=>a*180/Math.PI):[0,0,0,0,0,0],pose_position_m:(e==null?void 0:e.position)??[0,0,0],pose_quaternion_wxyz:(e==null?void 0:e.quaternion)??[1,0,0,0],velocity_percent:i.velocity,blend_radius_percent:0,timeout_sec:i.timeout}}),ii.textContent=`${t} / ${bn(n)} / 等待 feedback…`,window.clearTimeout(wn);const s=Ct,r=ne;wn=window.setTimeout(()=>{wn=0,!(Ct!==s||ne!==r)&&(ii.textContent=`${t} / 尚未收到 Action feedback；运行状态未知，请勿重复发送。检查 /${r}/execute_motion 和驱动日志，必要时使用软件停止。`)},8e3),je()});Sp.addEventListener("click",()=>{mt!==0&&Vd(ne,!0)});wd.addEventListener("click",()=>{const i=Uo(),e=hi(),t=ca(ne);if(!yt()||mt!==1||!i||t.length!==6)return;const n=Sn("solve-ik");zi[ne]=n,zn(ne,"计算逆解…"),Yt({type:"solve_ik",request_id:n,arm:ne,goal:{reference_type:e.type,reference_name:e.name,seed_joint_degrees:t.map(s=>s*180/Math.PI),pose_position_m:i.position,pose_quaternion_wxyz:i.quaternion}}),je()});_p.addEventListener("click",()=>{if(!yt())return;const i=Co().frames[Y("#velocity-frame").value];Gn=Sn("velocity"),Yt({type:"start_cartesian_velocity",request_id:Gn,arm:ne,goal:{reference_type:i.type,reference_name:i.name,control_period_ms:Number(Y("#velocity-period").value),watchdog_ms:Number(Y("#velocity-watchdog").value),max_linear_accel_mps2:Number(Y("#linear-accel").value),max_angular_accel_radps2:Number(Y("#angular-accel").value),follow:!1,trajectory_mode:0,radio:0}}),je(),li=window.setInterval(()=>{const e=Array.from({length:6},(t,n)=>Number(Y(`#velocity-${n}`).value));Yt({type:"velocity_command",arm:ne,linear:e.slice(0,3),angular:e.slice(3)})},20)});Lr.addEventListener("change",()=>{const i=Xp(ne).find(e=>(e.frame_id??e.name)===Lr.value);i&&(ms[ne]=i,So.textContent=bn(i),ea[ne]=void 0,Vd(ne,!0))});vp.addEventListener("click",()=>{Yt({type:"cancel_action",arm:ne,action:"cartesian_velocity"}),window.clearInterval(li),li=0});mp.addEventListener("click",()=>{Yt({type:"cancel_action",arm:ne,action:"execute_motion"})});pp.addEventListener("click",()=>{Yt({type:"software_stop",request_id:Sn("stop"),arm:ne})});gp.addEventListener("click",()=>{if(!yt()||Ui[ne])return;const i=Sn("recover");Ui[ne]=i,Li.textContent=`${ne.toUpperCase()} 恢复请求中…`,Yt({type:"recover_motion",request_id:i,arm:ne}),je()});fetch("/api/layout").then(i=>i.json()).then(Qp).catch(i=>{const e=String(i);cs.textContent=e.includes("WebGL")?`WebGL 渲染失败: ${e}`:`布局加载失败: ${e}`,cs.removeAttribute("hidden")});Y("#gripper-select").addEventListener("change",i=>{hn=i.target.value,oa=!1,da(""),$d(),ua()});Y("#gripper-open").addEventListener("click",()=>Cs("open"));Y("#gripper-close").addEventListener("click",()=>Cs("close"));Y("#gripper-enable").addEventListener("click",()=>Cs("enable"));Y("#gripper-reset").addEventListener("click",()=>Cs("reset"));Y("#gripper-percentage").addEventListener("change",i=>Cs("percentage",{percentage:Number(i.target.value)}));for(const i of["#gripper-open-position","#gripper-close-position"])Y(i).addEventListener("input",()=>{oa=!0,da("")});Y("#gripper-teach-open").addEventListener("click",()=>Jp("open"));Y("#gripper-teach-close").addEventListener("click",()=>Jp("close"));Y("#gripper-limits-apply").addEventListener("click",GM);const Fo=Y("#gripper-raw-position");Fo.addEventListener("input",()=>{Y("#gripper-raw-value").textContent=Fo.value});Fo.addEventListener("change",()=>Cs("move_raw",{position:Number(Fo.value)}));jp();const $l=Y("#bt-panel"),ff=Y("#bt-dot"),uo=Y("#bt-collapse"),XM=Y("#bt-body"),em="realman-web-control.bt-collapsed";let Gi=!1;try{Gi=window.localStorage.getItem(em)==="true"}catch{}function tm(){XM.hidden=Gi,uo.textContent=Gi?"▸":"▾",uo.title=Gi?"展开":"收起",uo.setAttribute("aria-expanded",String(!Gi))}uo.addEventListener("click",()=>{Gi=!Gi;try{window.localStorage.setItem(em,String(Gi))}catch{}tm()});tm();const Ja=Y("#bt-root-status"),qM=Y("#bt-tree-id"),jc=Y("#bt-scope-toggle"),pf=Y("#bt-breadcrumb"),mf=Y("#bt-failure"),Yl=Y("#bt-mode-reason"),Qc=Y("#bt-tree"),ed=new Map;let Rt={available:!1},Fr=!1,Kl="",gf=!1;function $M(){const i=$e,e=(i==null?void 0:i.phase)==="FAILED",t=i!==void 0&&(i.requested_mode==="none"||i.phase==="ACTIVE"&&i.active_mode==="none"),n=!!(i!=null&&i.detail)&&(e||t);Yl.hidden=!n,Yl.classList.toggle("bt-mode-reason-failure",n&&(e||/ failed: /.test(i.detail))),Yl.textContent=n?e?`${Zs(i.requested_mode)} 失败：${i.detail}`:`切换到 ${Zs("none")} 分支的原因：${i.detail}`:""}function ur(){if($l.hidden=!Rt.available&&!Xn.available,Rt.available&&!gf&&($l.classList.add("bt-attention"),window.setTimeout(()=>$l.classList.remove("bt-attention"),4e3)),gf=Rt.available,JM.hidden=!Rt.available,Or.hidden=!Rt.available,Hi(),!Rt.available){Ja.textContent="未运行",Ja.className="bt-status bt-idle",ff.className="tab-dot",Kl="",yn&&Oo("",!1),yn="",kr=0,vs();return}vs();const i=oM(Rt.nodes);if(Ja.textContent=Rt.root_status,Ja.className=`bt-status bt-${Rt.root_status.toLowerCase()}`,ff.className=`tab-dot bt-dot-${Rt.root_status.toLowerCase()}`,mf.hidden=!Rt.failure_reason,mf.textContent=Rt.failure_reason,$M(),!i)return;const e=lM(i),t=e&&cM(e,$e==null?void 0:$e.active_mode),n=e&&!Fr?t:void 0;jc.hidden=!e,jc.textContent=Fr?"只看当前分支":"显示整棵树",qM.textContent=e?`${Rt.tree_id||"tree"} · 输入路由 ${t?t.name:"（无活动分支）"}`:`${Rt.tree_id||"tree"} · 整棵树`,pf.hidden=!n;const s=n?$c(n,ed):e&&!Fr?'<li class="bt-empty">没有处于活动状态的输入分支</li>':$c(i,ed,new Set(e==null?void 0:e.children.filter(a=>a!==t).map(a=>a.path))),r=n?hM(dM(i,n.path)):"";s+r!==Kl&&(Kl=s+r,pf.innerHTML=r,Qc.innerHTML=s,Qc.dataset.scope=n?n.name:"tree")}Qc.addEventListener("click",i=>{const e=i.target.closest("[data-bt-toggle]");e&&(ed.set(e.dataset.btToggle,e.getAttribute("aria-expanded")==="true"),ur())});const Or=Y("#bt-stop"),Zl=Y("#bt-stop-status");let yn="",kr=0;function Oo(i,e){Zl.hidden=!i,Zl.textContent=i,Zl.classList.toggle("error",e)}function vs(){const i=kr>Date.now();Or.disabled=!yt()||!!yn,Or.textContent=yn?"正在终止…":i?"确认终止？":"终止行为树",Or.classList.toggle("armed",i&&!yn)}Or.addEventListener("click",()=>{if(!(!yt()||yn)){if(kr<=Date.now()){kr=Date.now()+4e3,vs(),window.setTimeout(vs,4100);return}kr=0,yn=Sn("bt-stop"),Yt({type:"stop_behavior_tree",request_id:yn}),Oo("已发送终止请求…",!1),vs()}});jc.addEventListener("click",()=>{Fr=!Fr,ur()});const YM=Y("#bt-launcher"),td=Y("#bt-picker-button"),KM=Y("#bt-picker-label"),ZM=Y("#bt-picker-meta"),Ki=Y("#bt-picker-list"),ko=Y("#bt-real-motion"),js=Y("#bt-start"),Jl=Y("#bt-start-status"),_f=Y("#bt-start-log"),JM=Y("#bt-running"),nm="realman-web-control.bt-tree";let Xn={available:!1},pi="";try{pi=window.localStorage.getItem(nm)??""}catch{}let sr=0,jt;function im(i){return i.valid?[i.launch||"launch?",i.arms.length?i.arms.join(","):""].filter(Boolean).join(" · "):"XML 无法解析"}function ps(i,e=!1,t=[]){Jl.hidden=!i,Jl.textContent=i,Jl.classList.toggle("error",e),_f.hidden=!t.length,_f.textContent=t.join(`
`)}function Zd(){const i=Xn.trees??[],e=s=>`<div class="bt-option${s.name===pi?" selected":""}${s.valid?"":" invalid"}" role="option" aria-selected="${s.name===pi}" data-tree="${qt(s.name)}">
      <button type="button" class="bt-star${s.favorite?" on":""}" data-favorite-toggle="${qt(s.name)}" aria-pressed="${s.favorite}" title="${s.favorite?"取消收藏":"收藏置顶"}">${s.favorite?"★":"☆"}</button>
      <span class="bt-option-name">${qt(s.name.replace(/\.xml$/,""))}</span><span class="bt-option-meta">${qt(im(s))}</span></div>`,t=i.filter(s=>s.favorite),n=i.filter(s=>!s.favorite);Ki.innerHTML=(t.length?`<div class="bt-option-group">收藏</div>${t.map(e).join("")}`:"")+`<div class="bt-option-group">${t.length?"其它":"全部"}</div>${n.map(e).join("")||'<div class="bt-option-empty">没有行为树文件</div>'}`}function Hi(){var r;YM.hidden=Rt.available||!Xn.available;const i=Xn.trees??[];i.some(a=>a.name===pi)||(pi=((r=i.find(a=>a.valid))==null?void 0:r.name)??"");const e=i.find(a=>a.name===pi);KM.textContent=e?`${e.favorite?"★ ":""}${e.name.replace(/\.xml$/,"")}`:"选择行为树",ZM.textContent=e?im(e):"",Ki.hidden||Zd();const t=Xn.launcher??{},n=!!t.running||!!jt,s=sr>Date.now();js.disabled=!Xn.available||!(e!=null&&e.valid)||n,js.classList.toggle("armed",s&&!n),js.classList.toggle("danger",s&&ko.checked),js.textContent=jt?"正在启动…":s?ko.checked?"确认启动（真实运动）？":"确认启动（dry-run）？":"启动",Rt.available&&jt?(jt=void 0,ps("")):jt?t.tree===jt.tree&&t.started_at_ms===jt.startedAt&&typeof t.exit_code=="number"?(ps(`启动失败：bt-start 退出码 ${t.exit_code}（日志 ${t.log??""}）`,!0,t.log_tail??[]),jt=void 0):Date.now()-jt.since>6e4&&(ps(`${jt.tree} 60 s 内仍未运行，请查看日志 ${t.log??""}`,!0),jt=void 0):!Rt.available&&t.running&&!t.launched_here&&ps("已有行为树进程在运行（例如终端里的 ./rm65 bt），等待其监视器…")}function Jd(){Ki.hidden=!0,td.setAttribute("aria-expanded","false")}td.addEventListener("click",()=>{const i=Ki.hidden;Ki.hidden=!i,td.setAttribute("aria-expanded",String(i)),i&&Zd()});document.addEventListener("click",i=>{!Ki.hidden&&!i.target.closest(".bt-picker")&&Jd()});document.addEventListener("keydown",i=>{i.key==="Escape"&&!Ki.hidden&&Jd()});Ki.addEventListener("click",async i=>{const e=i.target,t=e.closest("[data-favorite-toggle]");if(t){const s=t.dataset.favoriteToggle,r=await fetch("/api/bt/favorites",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:s,favorite:t.getAttribute("aria-pressed")!=="true"})}).catch(()=>{}),a=r&&await r.json().catch(()=>{});a!=null&&a.ok?Xn={...Xn,trees:a.trees}:ps(`收藏失败：${(a==null?void 0:a.error)??"网络错误"}`,!0),Hi(),Zd();return}const n=e.closest("[data-tree]");if(!(!n||n.classList.contains("invalid"))){pi=n.dataset.tree;try{window.localStorage.setItem(nm,pi)}catch{}sr=0,Jd(),Hi()}});ko.addEventListener("change",()=>{sr=0,Hi()});js.addEventListener("click",async()=>{if(js.disabled)return;if(sr<=Date.now()){sr=Date.now()+4e3,Hi(),window.setTimeout(Hi,4100);return}sr=0;const i=pi,e=!ko.checked;jt={tree:i,dryRun:e,since:Date.now()},ps(`正在启动 ${i}（${e?"dry-run":"真实运动"}），等待机械臂 Action 就绪…`),Hi();const t=await fetch("/api/bt/start",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({tree:i,dry_run:e})}).catch(()=>{}),n=t&&await t.json().catch(()=>{});!(t!=null&&t.ok)||!(n!=null&&n.ok)?(jt=void 0,ps(`启动失败：${(n==null?void 0:n.error)??"网络错误"}`,!0)):jt&&(jt.startedAt=n.started_at_ms),Hi(),jd()});let jl=!1;async function jd(){if(!(jl||document.hidden)){jl=!0;try{const i=await fetch("/api/bt/trees",{cache:"no-store"});Xn=i.ok?await i.json():{available:!1}}catch{Xn={available:!1}}finally{jl=!1}ur()}}window.setInterval(jd,2e3);jd();const Ii=Y("#docker-restart"),ja=Y("#docker-restart-state");let si={available:!1},ho=0,nd=!1;function fo(){const i=si.available||!!si.error;Ii.hidden=!i;const e=si.helper,t=nd||!!(e!=null&&e.restarting),n=ho>Date.now()&&!t,s=si.service??"realman_bringup_remote";Ii.disabled=!si.available||t,Ii.classList.toggle("danger",n),Ii.classList.toggle("ghost",!n),Ii.textContent=t?"重启中…":n?"确认重启？":"重启 Docker",Ii.title=si.error?si.error:`docker compose restart ${s}：机械臂驱动、夹爪和行为树启动器会断开约 10–30 s，运行中的 Action 和行为树会中断`;let r="",a="",o="";if(t)r=`RESTARTING ${e!=null&&e.started_at_ms?Math.max(0,Math.round((Date.now()-e.started_at_ms)/1e3)):0}s`;else if(e&&typeof e.exit_code=="number"&&e.finished_at_ms){const l=new Date(e.finished_at_ms).toLocaleTimeString("zh-CN",{hour12:!1});r=e.exit_code===0?`RESTARTED ${l}`:`RESTART FAILED ${e.exit_code}`,a=e.exit_code===0?"ready":"offline",o=(e.output_tail??[]).join(`
`)}ja.hidden=!r,ja.textContent=r,ja.className=`status-pill${a?` ${a}`:""}`,ja.title=o}let Ql=!1;async function Qd(){if(!(Ql||document.hidden)){Ql=!0;try{const i=await fetch("/api/docker/restart",{cache:"no-store"});si=i.ok?await i.json():{available:!1}}catch{si={available:!1}}finally{Ql=!1}fo()}}Ii.addEventListener("click",async()=>{if(Ii.disabled)return;if(ho<=Date.now()){ho=Date.now()+4e3,fo(),window.setTimeout(fo,4100);return}ho=0,nd=!0,fo();const i=await fetch("/api/docker/restart",{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"}).catch(()=>{}),e=i&&await i.json().catch(()=>{});nd=!1,(!(i!=null&&i.ok)||!(e!=null&&e.ok))&&window.alert(`重启失败：${(e==null?void 0:e.error)??"网络错误"}`),await Qd()});window.setInterval(Qd,1e3);Qd();
