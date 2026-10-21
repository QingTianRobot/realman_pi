import"./theme-Cqnpw2CK.js";/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Hc="185",Js={ROTATE:0,DOLLY:1,PAN:2},$s={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},Gp=0,Zd=1,Hp=2,Za=1,Wp=2,Mr=3,mi=0,nn=1,Rn=2,di=0,js=1,Jd=2,jd=3,Qd=4,Xp=5,as=100,qp=101,$p=102,Yp=103,Kp=104,Zp=200,Jp=201,jp=202,Qp=203,Gl=204,Hl=205,em=206,tm=207,nm=208,im=209,sm=210,rm=211,am=212,om=213,lm=214,Wl=0,Xl=1,ql=2,ir=3,$l=4,Yl=5,Kl=6,Zl=7,No=0,cm=1,dm=2,qn=0,jh=1,Qh=2,ef=3,tf=4,nf=5,sf=6,rf=7,eu="attached",um="detached",af=300,vs=301,sr=302,$o=303,Yo=304,Io=306,cs=1e3,dn=1001,Jl=1002,Bt=1003,hm=1004,ua=1005,Rt=1006,Ko=1007,ai=1008,cn=1009,of=1010,lf=1011,Fr=1012,Wc=1013,Yn=1014,Pn=1015,gi=1016,Xc=1017,qc=1018,Or=1020,cf=35902,df=35899,uf=1021,hf=1022,vn=1023,_i=1026,ds=1027,ff=1028,$c=1029,xs=1030,Yc=1031,Kc=1033,Ja=33776,ja=33777,Qa=33778,eo=33779,jl=35840,Ql=35841,ec=35842,tc=35843,nc=36196,ic=37492,sc=37496,rc=37488,ac=37489,oo=37490,oc=37491,lc=37808,cc=37809,dc=37810,uc=37811,hc=37812,fc=37813,pc=37814,mc=37815,gc=37816,_c=37817,vc=37818,xc=37819,bc=37820,yc=37821,Mc=36492,Sc=36494,Ec=36495,Tc=36283,Ac=36284,lo=36285,wc=36286,kr=2300,Rc=2301,Zo=2302,Cc=2303,tu=2400,nu=2401,iu=2402,fm=2500,pm=3200,Br=0,mm=1,Ni="",dt="srgb",co="srgb-linear",uo="linear",tt="srgb",Ls=7680,su=519,gm=512,_m=513,vm=514,Zc=515,xm=516,bm=517,Jc=518,ym=519,ru=35044,au="300 es",Hn=2e3,zr=2001;function Mm(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function Sm(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function Vr(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Em(){const i=Vr("canvas");return i.style.display="block",i}const ou={};function lu(...i){const e="THREE."+i.shift();console.log(e,...i)}function pf(i){const e=i[0];if(typeof e=="string"&&e.startsWith("TSL:")){const t=i[1];t&&t.isStackTrace?i[0]+=" "+t.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function Pe(...i){i=pf(i);const e="THREE."+i.shift();{const t=i[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...i)}}function He(...i){i=pf(i);const e="THREE."+i.shift();{const t=i[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...i)}}function Qs(...i){const e=i.join(" ");e in ou||(ou[e]=!0,Pe(...i))}function Tm(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}const Am={[Wl]:Xl,[ql]:Kl,[$l]:Zl,[ir]:Yl,[Xl]:Wl,[Kl]:ql,[Zl]:$l,[Yl]:ir};class Ki{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){const n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){const n=this._listeners;if(n===void 0)return;const s=n[e];if(s!==void 0){const r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const n=t[e.type];if(n!==void 0){e.target=this;const s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}}const Ht=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let cu=1234567;const Tr=Math.PI/180,rr=180/Math.PI;function Zi(){const i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Ht[i&255]+Ht[i>>8&255]+Ht[i>>16&255]+Ht[i>>24&255]+"-"+Ht[e&255]+Ht[e>>8&255]+"-"+Ht[e>>16&15|64]+Ht[e>>24&255]+"-"+Ht[t&63|128]+Ht[t>>8&255]+"-"+Ht[t>>16&255]+Ht[t>>24&255]+Ht[n&255]+Ht[n>>8&255]+Ht[n>>16&255]+Ht[n>>24&255]).toLowerCase()}function qe(i,e,t){return Math.max(e,Math.min(t,i))}function jc(i,e){return(i%e+e)%e}function wm(i,e,t,n,s){return n+(i-e)*(s-n)/(t-e)}function Rm(i,e,t){return i!==e?(t-i)/(e-i):0}function Ar(i,e,t){return(1-t)*i+t*e}function Cm(i,e,t,n){return Ar(i,e,1-Math.exp(-t*n))}function Pm(i,e=1){return e-Math.abs(jc(i,e*2)-e)}function Lm(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function Nm(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function Im(i,e){return i+Math.floor(Math.random()*(e-i+1))}function Dm(i,e){return i+Math.random()*(e-i)}function Um(i){return i*(.5-Math.random())}function Fm(i){i!==void 0&&(cu=i);let e=cu+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Om(i){return i*Tr}function km(i){return i*rr}function Bm(i){return(i&i-1)===0&&i!==0}function zm(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function Vm(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function Gm(i,e,t,n,s){const r=Math.cos,a=Math.sin,o=r(t/2),l=a(t/2),c=r((e+n)/2),u=a((e+n)/2),h=r((e-n)/2),d=a((e-n)/2),f=r((n-e)/2),g=a((n-e)/2);switch(s){case"XYX":i.set(o*u,l*h,l*d,o*c);break;case"YZY":i.set(l*d,o*u,l*h,o*c);break;case"ZXZ":i.set(l*h,l*d,o*u,o*c);break;case"XZX":i.set(o*u,l*g,l*f,o*c);break;case"YXY":i.set(l*f,o*u,l*g,o*c);break;case"ZYZ":i.set(l*g,l*f,o*u,o*c);break;default:Pe("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function qs(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function Kt(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}const Bn={DEG2RAD:Tr,RAD2DEG:rr,generateUUID:Zi,clamp:qe,euclideanModulo:jc,mapLinear:wm,inverseLerp:Rm,lerp:Ar,damp:Cm,pingpong:Pm,smoothstep:Lm,smootherstep:Nm,randInt:Im,randFloat:Dm,randFloatSpread:Um,seededRandom:Fm,degToRad:Om,radToDeg:km,isPowerOfTwo:Bm,ceilPowerOfTwo:zm,floorPowerOfTwo:Vm,setQuaternionFromProperEuler:Gm,normalize:Kt,denormalize:qs},Fd=class Fd{constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=qe(this.x,e.x,t.x),this.y=qe(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=qe(this.x,e,t),this.y=qe(this.y,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(qe(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(qe(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*n-a*s+e.x,this.y=r*s+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};Fd.prototype.isVector2=!0;let Ne=Fd;class Ot{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,a,o){let l=n[s+0],c=n[s+1],u=n[s+2],h=n[s+3],d=r[a+0],f=r[a+1],g=r[a+2],x=r[a+3];if(h!==x||l!==d||c!==f||u!==g){let m=l*d+c*f+u*g+h*x;m<0&&(d=-d,f=-f,g=-g,x=-x,m=-m);let p=1-o;if(m<.9995){const E=Math.acos(m),A=Math.sin(E);p=Math.sin(p*E)/A,o=Math.sin(o*E)/A,l=l*p+d*o,c=c*p+f*o,u=u*p+g*o,h=h*p+x*o}else{l=l*p+d*o,c=c*p+f*o,u=u*p+g*o,h=h*p+x*o;const E=1/Math.sqrt(l*l+c*c+u*u+h*h);l*=E,c*=E,u*=E,h*=E}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=h}static multiplyQuaternionsFlat(e,t,n,s,r,a){const o=n[s],l=n[s+1],c=n[s+2],u=n[s+3],h=r[a],d=r[a+1],f=r[a+2],g=r[a+3];return e[t]=o*g+u*h+l*f-c*d,e[t+1]=l*g+u*d+c*h-o*f,e[t+2]=c*g+u*f+o*d-l*h,e[t+3]=u*g-o*h-l*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(n/2),u=o(s/2),h=o(r/2),d=l(n/2),f=l(s/2),g=l(r/2);switch(a){case"XYZ":this._x=d*u*h+c*f*g,this._y=c*f*h-d*u*g,this._z=c*u*g+d*f*h,this._w=c*u*h-d*f*g;break;case"YXZ":this._x=d*u*h+c*f*g,this._y=c*f*h-d*u*g,this._z=c*u*g-d*f*h,this._w=c*u*h+d*f*g;break;case"ZXY":this._x=d*u*h-c*f*g,this._y=c*f*h+d*u*g,this._z=c*u*g+d*f*h,this._w=c*u*h-d*f*g;break;case"ZYX":this._x=d*u*h-c*f*g,this._y=c*f*h+d*u*g,this._z=c*u*g-d*f*h,this._w=c*u*h+d*f*g;break;case"YZX":this._x=d*u*h+c*f*g,this._y=c*f*h+d*u*g,this._z=c*u*g-d*f*h,this._w=c*u*h-d*f*g;break;case"XZY":this._x=d*u*h-c*f*g,this._y=c*f*h-d*u*g,this._z=c*u*g+d*f*h,this._w=c*u*h+d*f*g;break;default:Pe("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],s=t[4],r=t[8],a=t[1],o=t[5],l=t[9],c=t[2],u=t[6],h=t[10],d=n+o+h;if(d>0){const f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(u-l)*f,this._y=(r-c)*f,this._z=(a-s)*f}else if(n>o&&n>h){const f=2*Math.sqrt(1+n-o-h);this._w=(u-l)/f,this._x=.25*f,this._y=(s+a)/f,this._z=(r+c)/f}else if(o>h){const f=2*Math.sqrt(1+o-n-h);this._w=(r-c)/f,this._x=(s+a)/f,this._y=.25*f,this._z=(l+u)/f}else{const f=2*Math.sqrt(1+h-n-o);this._w=(a-s)/f,this._x=(r+c)/f,this._y=(l+u)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(qe(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,s=e._y,r=e._z,a=e._w,o=t._x,l=t._y,c=t._z,u=t._w;return this._x=n*u+a*o+s*c-r*l,this._y=s*u+a*l+r*o-n*c,this._z=r*u+a*c+n*l-s*o,this._w=a*u-n*o-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,s=-s,r=-r,a=-a,o=-o);let l=1-t;if(o<.9995){const c=Math.acos(o),u=Math.sin(c);l=Math.sin(l*c)/u,t=Math.sin(t*c)/u,this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this._onChangeCallback()}else this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}const Od=class Od{constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(du.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(du.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(e){const t=this.x,n=this.y,s=this.z,r=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*s-o*n),u=2*(o*t-r*s),h=2*(r*n-a*t);return this.x=t+l*c+a*h-o*u,this.y=n+l*u+o*c-r*h,this.z=s+l*h+r*u-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=qe(this.x,e.x,t.x),this.y=qe(this.y,e.y,t.y),this.z=qe(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=qe(this.x,e,t),this.y=qe(this.y,e,t),this.z=qe(this.z,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(qe(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,s=e.y,r=e.z,a=t.x,o=t.y,l=t.z;return this.x=s*l-r*o,this.y=r*a-n*l,this.z=n*o-s*a,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Jo.copy(this).projectOnVector(e),this.sub(Jo)}reflect(e){return this.sub(Jo.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(qe(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};Od.prototype.isVector3=!0;let I=Od;const Jo=new I,du=new Ot,kd=class kd{constructor(e,t,n,s,r,a,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c)}set(e,t,n,s,r,a,o,l,c){const u=this.elements;return u[0]=e,u[1]=s,u[2]=o,u[3]=t,u[4]=r,u[5]=l,u[6]=n,u[7]=a,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],u=n[4],h=n[7],d=n[2],f=n[5],g=n[8],x=s[0],m=s[3],p=s[6],E=s[1],A=s[4],b=s[7],T=s[2],y=s[5],w=s[8];return r[0]=a*x+o*E+l*T,r[3]=a*m+o*A+l*y,r[6]=a*p+o*b+l*w,r[1]=c*x+u*E+h*T,r[4]=c*m+u*A+h*y,r[7]=c*p+u*b+h*w,r[2]=d*x+f*E+g*T,r[5]=d*m+f*A+g*y,r[8]=d*p+f*b+g*w,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8];return t*a*u-t*o*c-n*r*u+n*o*l+s*r*c-s*a*l}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8],h=u*a-o*c,d=o*l-u*r,f=c*r-a*l,g=t*h+n*d+s*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const x=1/g;return e[0]=h*x,e[1]=(s*c-u*n)*x,e[2]=(o*n-s*a)*x,e[3]=d*x,e[4]=(u*t-s*l)*x,e[5]=(s*r-o*t)*x,e[6]=f*x,e[7]=(n*l-c*t)*x,e[8]=(a*t-n*r)*x,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,a,o){const l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+e,-s*c,s*l,-s*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return Qs("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(jo.makeScale(e,t)),this}rotate(e){return Qs("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(jo.makeRotation(-e)),this}translate(e,t){return Qs("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(jo.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}};kd.prototype.isMatrix3=!0;let Be=kd;const jo=new Be,uu=new Be().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),hu=new Be().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Hm(){const i={enabled:!0,workingColorSpace:co,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===tt&&(s.r=ui(s.r),s.g=ui(s.g),s.b=ui(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===tt&&(s.r=er(s.r),s.g=er(s.g),s.b=er(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Ni?uo:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return Qs("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return Qs("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[co]:{primaries:e,whitePoint:n,transfer:uo,toXYZ:uu,fromXYZ:hu,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:dt},outputColorSpaceConfig:{drawingBufferColorSpace:dt}},[dt]:{primaries:e,whitePoint:n,transfer:tt,toXYZ:uu,fromXYZ:hu,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:dt}}}),i}const Xe=Hm();function ui(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function er(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}let Ns;class Wm{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Ns===void 0&&(Ns=Vr("canvas")),Ns.width=e.width,Ns.height=e.height;const s=Ns.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=Ns}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Vr("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=ui(r[a]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(ui(t[n]/255)*255):t[n]=ui(t[n]);return{data:t,width:e.width,height:e.height}}else return Pe("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let Xm=0;class Qc{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Xm++}),this.uuid=Zi(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(Qo(s[a].image)):r.push(Qo(s[a]))}else r=Qo(s);n.url=r}return t||(e.images[this.uuid]=n),n}}function Qo(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Wm.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(Pe("Texture: Unable to serialize Texture."),{})}let qm=0;const el=new I;class $t extends Ki{constructor(e=$t.DEFAULT_IMAGE,t=$t.DEFAULT_MAPPING,n=dn,s=dn,r=Rt,a=ai,o=vn,l=cn,c=$t.DEFAULT_ANISOTROPY,u=Ni){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:qm++}),this.uuid=Zi(),this.name="",this.source=new Qc(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new Ne(0,0),this.repeat=new Ne(1,1),this.center=new Ne(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Be,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(el).x}get height(){return this.source.getSize(el).y}get depth(){return this.source.getSize(el).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const n=e[t];if(n===void 0){Pe(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){Pe(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==af)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case cs:e.x=e.x-Math.floor(e.x);break;case dn:e.x=e.x<0?0:1;break;case Jl:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case cs:e.y=e.y-Math.floor(e.y);break;case dn:e.y=e.y<0?0:1;break;case Jl:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}$t.DEFAULT_IMAGE=null;$t.DEFAULT_MAPPING=af;$t.DEFAULT_ANISOTROPY=1;const Bd=class Bd{constructor(e=0,t=0,n=0,s=1){this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*n+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r;const l=e.elements,c=l[0],u=l[4],h=l[8],d=l[1],f=l[5],g=l[9],x=l[2],m=l[6],p=l[10];if(Math.abs(u-d)<.01&&Math.abs(h-x)<.01&&Math.abs(g-m)<.01){if(Math.abs(u+d)<.1&&Math.abs(h+x)<.1&&Math.abs(g+m)<.1&&Math.abs(c+f+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const A=(c+1)/2,b=(f+1)/2,T=(p+1)/2,y=(u+d)/4,w=(h+x)/4,_=(g+m)/4;return A>b&&A>T?A<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(A),s=y/n,r=w/n):b>T?b<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(b),n=y/s,r=_/s):T<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(T),n=w/r,s=_/r),this.set(n,s,r,t),this}let E=Math.sqrt((m-g)*(m-g)+(h-x)*(h-x)+(d-u)*(d-u));return Math.abs(E)<.001&&(E=1),this.x=(m-g)/E,this.y=(h-x)/E,this.z=(d-u)/E,this.w=Math.acos((c+f+p-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=qe(this.x,e.x,t.x),this.y=qe(this.y,e.y,t.y),this.z=qe(this.z,e.z,t.z),this.w=qe(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=qe(this.x,e,t),this.y=qe(this.y,e,t),this.z=qe(this.z,e,t),this.w=qe(this.w,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(qe(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};Bd.prototype.isVector4=!0;let st=Bd;class $m extends Ki{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Rt,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new st(0,0,e,t),this.scissorTest=!1,this.viewport=new st(0,0,e,t),this.textures=[];const s={width:e,height:t,depth:n.depth},r=new $t(s),a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){const t={minFilter:Rt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const s=Object.assign({},e.textures[t].image);this.textures[t].source=new Qc(s)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}}class $n extends $m{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class mf extends $t{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Bt,this.minFilter=Bt,this.wrapR=dn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class Ym extends $t{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Bt,this.minFilter=Bt,this.wrapR=dn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const Lo=class Lo{constructor(e,t,n,s,r,a,o,l,c,u,h,d,f,g,x,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c,u,h,d,f,g,x,m)}set(e,t,n,s,r,a,o,l,c,u,h,d,f,g,x,m){const p=this.elements;return p[0]=e,p[4]=t,p[8]=n,p[12]=s,p[1]=r,p[5]=a,p[9]=o,p[13]=l,p[2]=c,p[6]=u,p[10]=h,p[14]=d,p[3]=f,p[7]=g,p[11]=x,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Lo().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();const t=this.elements,n=e.elements,s=1/Is.setFromMatrixColumn(e,0).length(),r=1/Is.setFromMatrixColumn(e,1).length(),a=1/Is.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,s=e.y,r=e.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(s),c=Math.sin(s),u=Math.cos(r),h=Math.sin(r);if(e.order==="XYZ"){const d=a*u,f=a*h,g=o*u,x=o*h;t[0]=l*u,t[4]=-l*h,t[8]=c,t[1]=f+g*c,t[5]=d-x*c,t[9]=-o*l,t[2]=x-d*c,t[6]=g+f*c,t[10]=a*l}else if(e.order==="YXZ"){const d=l*u,f=l*h,g=c*u,x=c*h;t[0]=d+x*o,t[4]=g*o-f,t[8]=a*c,t[1]=a*h,t[5]=a*u,t[9]=-o,t[2]=f*o-g,t[6]=x+d*o,t[10]=a*l}else if(e.order==="ZXY"){const d=l*u,f=l*h,g=c*u,x=c*h;t[0]=d-x*o,t[4]=-a*h,t[8]=g+f*o,t[1]=f+g*o,t[5]=a*u,t[9]=x-d*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){const d=a*u,f=a*h,g=o*u,x=o*h;t[0]=l*u,t[4]=g*c-f,t[8]=d*c+x,t[1]=l*h,t[5]=x*c+d,t[9]=f*c-g,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){const d=a*l,f=a*c,g=o*l,x=o*c;t[0]=l*u,t[4]=x-d*h,t[8]=g*h+f,t[1]=h,t[5]=a*u,t[9]=-o*u,t[2]=-c*u,t[6]=f*h+g,t[10]=d-x*h}else if(e.order==="XZY"){const d=a*l,f=a*c,g=o*l,x=o*c;t[0]=l*u,t[4]=-h,t[8]=c*u,t[1]=d*h+x,t[5]=a*u,t[9]=f*h-g,t[2]=g*h-f,t[6]=o*u,t[10]=x*h+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Km,e,Zm)}lookAt(e,t,n){const s=this.elements;return rn.subVectors(e,t),rn.lengthSq()===0&&(rn.z=1),rn.normalize(),yi.crossVectors(n,rn),yi.lengthSq()===0&&(Math.abs(n.z)===1?rn.x+=1e-4:rn.z+=1e-4,rn.normalize(),yi.crossVectors(n,rn)),yi.normalize(),ha.crossVectors(rn,yi),s[0]=yi.x,s[4]=ha.x,s[8]=rn.x,s[1]=yi.y,s[5]=ha.y,s[9]=rn.y,s[2]=yi.z,s[6]=ha.z,s[10]=rn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],u=n[1],h=n[5],d=n[9],f=n[13],g=n[2],x=n[6],m=n[10],p=n[14],E=n[3],A=n[7],b=n[11],T=n[15],y=s[0],w=s[4],_=s[8],M=s[12],P=s[1],R=s[5],L=s[9],z=s[13],X=s[2],O=s[6],N=s[10],V=s[14],$=s[3],j=s[7],re=s[11],se=s[15];return r[0]=a*y+o*P+l*X+c*$,r[4]=a*w+o*R+l*O+c*j,r[8]=a*_+o*L+l*N+c*re,r[12]=a*M+o*z+l*V+c*se,r[1]=u*y+h*P+d*X+f*$,r[5]=u*w+h*R+d*O+f*j,r[9]=u*_+h*L+d*N+f*re,r[13]=u*M+h*z+d*V+f*se,r[2]=g*y+x*P+m*X+p*$,r[6]=g*w+x*R+m*O+p*j,r[10]=g*_+x*L+m*N+p*re,r[14]=g*M+x*z+m*V+p*se,r[3]=E*y+A*P+b*X+T*$,r[7]=E*w+A*R+b*O+T*j,r[11]=E*_+A*L+b*N+T*re,r[15]=E*M+A*z+b*V+T*se,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],a=e[1],o=e[5],l=e[9],c=e[13],u=e[2],h=e[6],d=e[10],f=e[14],g=e[3],x=e[7],m=e[11],p=e[15],E=l*f-c*d,A=o*f-c*h,b=o*d-l*h,T=a*f-c*u,y=a*d-l*u,w=a*h-o*u;return t*(x*E-m*A+p*b)-n*(g*E-m*T+p*y)+s*(g*A-x*T+p*w)-r*(g*b-x*y+m*w)}determinantAffine(){const e=this.elements,t=e[0],n=e[4],s=e[8],r=e[1],a=e[5],o=e[9],l=e[2],c=e[6],u=e[10];return t*(a*u-o*c)-n*(r*u-o*l)+s*(r*c-a*l)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8],h=e[9],d=e[10],f=e[11],g=e[12],x=e[13],m=e[14],p=e[15],E=t*o-n*a,A=t*l-s*a,b=t*c-r*a,T=n*l-s*o,y=n*c-r*o,w=s*c-r*l,_=u*x-h*g,M=u*m-d*g,P=u*p-f*g,R=h*m-d*x,L=h*p-f*x,z=d*p-f*m,X=E*z-A*L+b*R+T*P-y*M+w*_;if(X===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const O=1/X;return e[0]=(o*z-l*L+c*R)*O,e[1]=(s*L-n*z-r*R)*O,e[2]=(x*w-m*y+p*T)*O,e[3]=(d*y-h*w-f*T)*O,e[4]=(l*P-a*z-c*M)*O,e[5]=(t*z-s*P+r*M)*O,e[6]=(m*b-g*w-p*A)*O,e[7]=(u*w-d*b+f*A)*O,e[8]=(a*L-o*P+c*_)*O,e[9]=(n*P-t*L-r*_)*O,e[10]=(g*y-x*b+p*E)*O,e[11]=(h*b-u*y-f*E)*O,e[12]=(o*M-a*R-l*_)*O,e[13]=(t*R-n*M+s*_)*O,e[14]=(x*A-g*T-m*E)*O,e[15]=(u*T-h*A+d*E)*O,this}scale(e){const t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),s=Math.sin(t),r=1-n,a=e.x,o=e.y,l=e.z,c=r*a,u=r*o;return this.set(c*a+n,c*o-s*l,c*l+s*o,0,c*o+s*l,u*o+n,u*l-s*a,0,c*l-s*o,u*l+s*a,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,a){return this.set(1,n,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){const s=this.elements,r=t._x,a=t._y,o=t._z,l=t._w,c=r+r,u=a+a,h=o+o,d=r*c,f=r*u,g=r*h,x=a*u,m=a*h,p=o*h,E=l*c,A=l*u,b=l*h,T=n.x,y=n.y,w=n.z;return s[0]=(1-(x+p))*T,s[1]=(f+b)*T,s[2]=(g-A)*T,s[3]=0,s[4]=(f-b)*y,s[5]=(1-(d+p))*y,s[6]=(m+E)*y,s[7]=0,s[8]=(g+A)*w,s[9]=(m-E)*w,s[10]=(1-(d+x))*w,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){const s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];const r=this.determinantAffine();if(r===0)return n.set(1,1,1),t.identity(),this;let a=Is.set(s[0],s[1],s[2]).length();const o=Is.set(s[4],s[5],s[6]).length(),l=Is.set(s[8],s[9],s[10]).length();r<0&&(a=-a),En.copy(this);const c=1/a,u=1/o,h=1/l;return En.elements[0]*=c,En.elements[1]*=c,En.elements[2]*=c,En.elements[4]*=u,En.elements[5]*=u,En.elements[6]*=u,En.elements[8]*=h,En.elements[9]*=h,En.elements[10]*=h,t.setFromRotationMatrix(En),n.x=a,n.y=o,n.z=l,this}makePerspective(e,t,n,s,r,a,o=Hn,l=!1){const c=this.elements,u=2*r/(t-e),h=2*r/(n-s),d=(t+e)/(t-e),f=(n+s)/(n-s);let g,x;if(l)g=r/(a-r),x=a*r/(a-r);else if(o===Hn)g=-(a+r)/(a-r),x=-2*a*r/(a-r);else if(o===zr)g=-a/(a-r),x=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=h,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=x,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,s,r,a,o=Hn,l=!1){const c=this.elements,u=2/(t-e),h=2/(n-s),d=-(t+e)/(t-e),f=-(n+s)/(n-s);let g,x;if(l)g=1/(a-r),x=a/(a-r);else if(o===Hn)g=-2/(a-r),x=-(a+r)/(a-r);else if(o===zr)g=-1/(a-r),x=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=h,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=g,c[14]=x,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}};Lo.prototype.isMatrix4=!0;let Fe=Lo;const Is=new I,En=new Fe,Km=new I(0,0,0),Zm=new I(1,1,1),yi=new I,ha=new I,rn=new I,fu=new Fe,pu=new Ot;class Mn{constructor(e=0,t=0,n=0,s=Mn.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const s=e.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],u=s[9],h=s[2],d=s[6],f=s[10];switch(t){case"XYZ":this._y=Math.asin(qe(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,f),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-qe(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-h,r),this._z=0);break;case"ZXY":this._x=Math.asin(qe(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-h,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-qe(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(qe(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-h,r)):(this._x=0,this._y=Math.atan2(o,f));break;case"XZY":this._z=Math.asin(-qe(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-u,f),this._y=0);break;default:Pe("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return fu.makeRotationFromQuaternion(e),this.setFromRotationMatrix(fu,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return pu.setFromEuler(this),this.setFromQuaternion(pu,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Mn.DEFAULT_ORDER="XYZ";class ed{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let Jm=0;const mu=new I,Ds=new Ot,Jn=new Fe,fa=new I,fr=new I,jm=new I,Qm=new Ot,gu=new I(1,0,0),_u=new I(0,1,0),vu=new I(0,0,1),xu={type:"added"},eg={type:"removed"},Us={type:"childadded",child:null},tl={type:"childremoved",child:null};class _t extends Ki{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Jm++}),this.uuid=Zi(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=_t.DEFAULT_UP.clone();const e=new I,t=new Mn,n=new Ot,s=new I(1,1,1);function r(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Fe},normalMatrix:{value:new Be}}),this.matrix=new Fe,this.matrixWorld=new Fe,this.matrixAutoUpdate=_t.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=_t.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new ed,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Ds.setFromAxisAngle(e,t),this.quaternion.multiply(Ds),this}rotateOnWorldAxis(e,t){return Ds.setFromAxisAngle(e,t),this.quaternion.premultiply(Ds),this}rotateX(e){return this.rotateOnAxis(gu,e)}rotateY(e){return this.rotateOnAxis(_u,e)}rotateZ(e){return this.rotateOnAxis(vu,e)}translateOnAxis(e,t){return mu.copy(e).applyQuaternion(this.quaternion),this.position.add(mu.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(gu,e)}translateY(e){return this.translateOnAxis(_u,e)}translateZ(e){return this.translateOnAxis(vu,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Jn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?fa.copy(e):fa.set(e,t,n);const s=this.parent;this.updateWorldMatrix(!0,!1),fr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Jn.lookAt(fr,fa,this.up):Jn.lookAt(fa,fr,this.up),this.quaternion.setFromRotationMatrix(Jn),s&&(Jn.extractRotation(s.matrixWorld),Ds.setFromRotationMatrix(Jn),this.quaternion.premultiply(Ds.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(He("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(xu),Us.child=e,this.dispatchEvent(Us),Us.child=null):He("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(eg),tl.child=e,this.dispatchEvent(tl),tl.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Jn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Jn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Jn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(xu),Us.child=e,this.dispatchEvent(Us),Us.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){const a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(fr,e,jm),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(fr,Qm,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);const e=this.pivot;if(e!==null){const t=e.x,n=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*n-r[8]*s,r[13]+=n-r[1]*t-r[5]*n-r[9]*s,r[14]+=s-r[2]*t-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){const s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){const r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,n)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),this.static!==!1&&(s.static=this.static),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){const h=l[c];r(e.shapes,h)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(e.materials,this.material[l]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];s.animations.push(r(e.animations,l))}}if(t){const o=a(e.geometries),l=a(e.materials),c=a(e.textures),u=a(e.images),h=a(e.shapes),d=a(e.skeletons),f=a(e.animations),g=a(e.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),h.length>0&&(n.shapes=h),d.length>0&&(n.skeletons=d),f.length>0&&(n.animations=f),g.length>0&&(n.nodes=g)}return n.object=s,n;function a(o){const l=[];for(const c in o){const u=o[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const s=e.children[n];this.add(s.clone())}return this}}_t.DEFAULT_UP=new I(0,1,0);_t.DEFAULT_MATRIX_AUTO_UPDATE=!0;_t.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class Di extends _t{constructor(){super(),this.isGroup=!0,this.type="Group"}}const tg={type:"move"};class nl{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Di,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Di,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new I,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new I),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Di,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new I,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new I,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,a=null;const o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(const x of e.hand.values()){const m=t.getJointPose(x,n),p=this._getHandJoint(c,x);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}const u=c.joints["index-finger-tip"],h=c.joints["thumb-tip"],d=u.position.distanceTo(h.position),f=.02,g=.005;c.inputState.pinching&&d>f+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&d<=f-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(tg)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new Di;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}const gf={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Mi={h:0,s:0,l:0},pa={h:0,s:0,l:0};function il(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}class Oe{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=dt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Xe.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=Xe.workingColorSpace){return this.r=e,this.g=t,this.b=n,Xe.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=Xe.workingColorSpace){if(e=jc(e,1),t=qe(t,0,1),n=qe(n,0,1),t===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+t):n+t-n*t,a=2*n-r;this.r=il(a,r,e+1/3),this.g=il(a,r,e),this.b=il(a,r,e-1/3)}return Xe.colorSpaceToWorking(this,s),this}setStyle(e,t=dt){function n(r){r!==void 0&&parseFloat(r)<1&&Pe("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:Pe("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);Pe("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=dt){const n=gf[e.toLowerCase()];return n!==void 0?this.setHex(n,t):Pe("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=ui(e.r),this.g=ui(e.g),this.b=ui(e.b),this}copyLinearToSRGB(e){return this.r=er(e.r),this.g=er(e.g),this.b=er(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=dt){return Xe.workingToColorSpace(Wt.copy(this),e),Math.round(qe(Wt.r*255,0,255))*65536+Math.round(qe(Wt.g*255,0,255))*256+Math.round(qe(Wt.b*255,0,255))}getHexString(e=dt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Xe.workingColorSpace){Xe.workingToColorSpace(Wt.copy(this),t);const n=Wt.r,s=Wt.g,r=Wt.b,a=Math.max(n,s,r),o=Math.min(n,s,r);let l,c;const u=(o+a)/2;if(o===a)l=0,c=0;else{const h=a-o;switch(c=u<=.5?h/(a+o):h/(2-a-o),a){case n:l=(s-r)/h+(s<r?6:0);break;case s:l=(r-n)/h+2;break;case r:l=(n-s)/h+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=Xe.workingColorSpace){return Xe.workingToColorSpace(Wt.copy(this),t),e.r=Wt.r,e.g=Wt.g,e.b=Wt.b,e}getStyle(e=dt){Xe.workingToColorSpace(Wt.copy(this),e);const t=Wt.r,n=Wt.g,s=Wt.b;return e!==dt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(Mi),this.setHSL(Mi.h+e,Mi.s+t,Mi.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Mi),e.getHSL(pa);const n=Ar(Mi.h,pa.h,t),s=Ar(Mi.s,pa.s,t),r=Ar(Mi.l,pa.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Wt=new Oe;Oe.NAMES=gf;class _f extends _t{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Mn,this.environmentIntensity=1,this.environmentRotation=new Mn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}const Tn=new I,jn=new I,sl=new I,Qn=new I,Fs=new I,Os=new I,bu=new I,rl=new I,al=new I,ol=new I,ll=new st,cl=new st,dl=new st;class _n{constructor(e=new I,t=new I,n=new I){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),Tn.subVectors(e,t),s.cross(Tn);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){Tn.subVectors(s,t),jn.subVectors(n,t),sl.subVectors(e,t);const a=Tn.dot(Tn),o=Tn.dot(jn),l=Tn.dot(sl),c=jn.dot(jn),u=jn.dot(sl),h=a*c-o*o;if(h===0)return r.set(0,0,0),null;const d=1/h,f=(c*l-o*u)*d,g=(a*u-o*l)*d;return r.set(1-f-g,g,f)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,Qn)===null?!1:Qn.x>=0&&Qn.y>=0&&Qn.x+Qn.y<=1}static getInterpolation(e,t,n,s,r,a,o,l){return this.getBarycoord(e,t,n,s,Qn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Qn.x),l.addScaledVector(a,Qn.y),l.addScaledVector(o,Qn.z),l)}static getInterpolatedAttribute(e,t,n,s,r,a){return ll.setScalar(0),cl.setScalar(0),dl.setScalar(0),ll.fromBufferAttribute(e,t),cl.fromBufferAttribute(e,n),dl.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector(ll,r.x),a.addScaledVector(cl,r.y),a.addScaledVector(dl,r.z),a}static isFrontFacing(e,t,n,s){return Tn.subVectors(n,t),jn.subVectors(e,t),Tn.cross(jn).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Tn.subVectors(this.c,this.b),jn.subVectors(this.a,this.b),Tn.cross(jn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return _n.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return _n.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return _n.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return _n.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return _n.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,s=this.b,r=this.c;let a,o;Fs.subVectors(s,n),Os.subVectors(r,n),rl.subVectors(e,n);const l=Fs.dot(rl),c=Os.dot(rl);if(l<=0&&c<=0)return t.copy(n);al.subVectors(e,s);const u=Fs.dot(al),h=Os.dot(al);if(u>=0&&h<=u)return t.copy(s);const d=l*h-u*c;if(d<=0&&l>=0&&u<=0)return a=l/(l-u),t.copy(n).addScaledVector(Fs,a);ol.subVectors(e,r);const f=Fs.dot(ol),g=Os.dot(ol);if(g>=0&&f<=g)return t.copy(r);const x=f*c-l*g;if(x<=0&&c>=0&&g<=0)return o=c/(c-g),t.copy(n).addScaledVector(Os,o);const m=u*g-f*h;if(m<=0&&h-u>=0&&f-g>=0)return bu.subVectors(r,s),o=(h-u)/(h-u+(f-g)),t.copy(s).addScaledVector(bu,o);const p=1/(m+x+d);return a=x*p,o=d*p,t.copy(n).addScaledVector(Fs,a).addScaledVector(Os,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}class Es{constructor(e=new I(1/0,1/0,1/0),t=new I(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(An.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(An.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=An.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,An):An.fromBufferAttribute(r,a),An.applyMatrix4(e.matrixWorld),this.expandByPoint(An);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),ma.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),ma.copy(n.boundingBox)),ma.applyMatrix4(e.matrixWorld),this.union(ma)}const s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,An),An.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(pr),ga.subVectors(this.max,pr),ks.subVectors(e.a,pr),Bs.subVectors(e.b,pr),zs.subVectors(e.c,pr),Si.subVectors(Bs,ks),Ei.subVectors(zs,Bs),es.subVectors(ks,zs);let t=[0,-Si.z,Si.y,0,-Ei.z,Ei.y,0,-es.z,es.y,Si.z,0,-Si.x,Ei.z,0,-Ei.x,es.z,0,-es.x,-Si.y,Si.x,0,-Ei.y,Ei.x,0,-es.y,es.x,0];return!ul(t,ks,Bs,zs,ga)||(t=[1,0,0,0,1,0,0,0,1],!ul(t,ks,Bs,zs,ga))?!1:(_a.crossVectors(Si,Ei),t=[_a.x,_a.y,_a.z],ul(t,ks,Bs,zs,ga))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,An).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(An).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(ei[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),ei[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),ei[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),ei[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),ei[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),ei[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),ei[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),ei[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(ei),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const ei=[new I,new I,new I,new I,new I,new I,new I,new I],An=new I,ma=new Es,ks=new I,Bs=new I,zs=new I,Si=new I,Ei=new I,es=new I,pr=new I,ga=new I,_a=new I,ts=new I;function ul(i,e,t,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){ts.fromArray(i,r);const o=s.x*Math.abs(ts.x)+s.y*Math.abs(ts.y)+s.z*Math.abs(ts.z),l=e.dot(ts),c=t.dot(ts),u=n.dot(ts);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>o)return!1}return!0}const St=new I,va=new Ne;let ng=0;class un extends Ki{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:ng++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=ru,this.updateRanges=[],this.gpuType=Pn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)va.fromBufferAttribute(this,t),va.applyMatrix3(e),this.setXY(t,va.x,va.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)St.fromBufferAttribute(this,t),St.applyMatrix3(e),this.setXYZ(t,St.x,St.y,St.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)St.fromBufferAttribute(this,t),St.applyMatrix4(e),this.setXYZ(t,St.x,St.y,St.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)St.fromBufferAttribute(this,t),St.applyNormalMatrix(e),this.setXYZ(t,St.x,St.y,St.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)St.fromBufferAttribute(this,t),St.transformDirection(e),this.setXYZ(t,St.x,St.y,St.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=qs(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Kt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=qs(t,this.array)),t}setX(e,t){return this.normalized&&(t=Kt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=qs(t,this.array)),t}setY(e,t){return this.normalized&&(t=Kt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=qs(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Kt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=qs(t,this.array)),t}setW(e,t){return this.normalized&&(t=Kt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Kt(t,this.array),n=Kt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=Kt(t,this.array),n=Kt(n,this.array),s=Kt(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=Kt(t,this.array),n=Kt(n,this.array),s=Kt(s,this.array),r=Kt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==ru&&(e.usage=this.usage),e}dispose(){this.dispatchEvent({type:"dispose"})}}class vf extends un{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class xf extends un{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class Qe extends un{constructor(e,t,n){super(new Float32Array(e),t,n)}}const ig=new Es,mr=new I,hl=new I;class cr{constructor(e=new I,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):ig.setFromPoints(e).getCenter(n);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;mr.subVectors(e,this.center);const t=mr.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(mr,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(hl.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(mr.copy(e.center).add(hl)),this.expandByPoint(mr.copy(e.center).sub(hl))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}let sg=0;const pn=new Fe,fl=new _t,Vs=new I,an=new Es,gr=new Es,Nt=new I;class Vt extends Ki{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:sg++}),this.uuid=Zi(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Mm(e)?xf:vf)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new Be().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return pn.makeRotationFromQuaternion(e),this.applyMatrix4(pn),this}rotateX(e){return pn.makeRotationX(e),this.applyMatrix4(pn),this}rotateY(e){return pn.makeRotationY(e),this.applyMatrix4(pn),this}rotateZ(e){return pn.makeRotationZ(e),this.applyMatrix4(pn),this}translate(e,t,n){return pn.makeTranslation(e,t,n),this.applyMatrix4(pn),this}scale(e,t,n){return pn.makeScale(e,t,n),this.applyMatrix4(pn),this}lookAt(e){return fl.lookAt(e),fl.updateMatrix(),this.applyMatrix4(fl.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Vs).negate(),this.translate(Vs.x,Vs.y,Vs.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const n=[];for(let s=0,r=e.length;s<r;s++){const a=e[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new Qe(n,3))}else{const n=Math.min(e.length,t.count);for(let s=0;s<n;s++){const r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&Pe("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Es);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){He("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new I(-1/0,-1/0,-1/0),new I(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){const r=t[n];an.setFromBufferAttribute(r),this.morphTargetsRelative?(Nt.addVectors(this.boundingBox.min,an.min),this.boundingBox.expandByPoint(Nt),Nt.addVectors(this.boundingBox.max,an.max),this.boundingBox.expandByPoint(Nt)):(this.boundingBox.expandByPoint(an.min),this.boundingBox.expandByPoint(an.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&He('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new cr);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){He("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new I,1/0);return}if(e){const n=this.boundingSphere.center;if(an.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){const o=t[r];gr.setFromBufferAttribute(o),this.morphTargetsRelative?(Nt.addVectors(an.min,gr.min),an.expandByPoint(Nt),Nt.addVectors(an.max,gr.max),an.expandByPoint(Nt)):(an.expandByPoint(gr.min),an.expandByPoint(gr.max))}an.getCenter(n);let s=0;for(let r=0,a=e.count;r<a;r++)Nt.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(Nt));if(t)for(let r=0,a=t.length;r<a;r++){const o=t[r],l=this.morphTargetsRelative;for(let c=0,u=o.count;c<u;c++)Nt.fromBufferAttribute(o,c),l&&(Vs.fromBufferAttribute(e,c),Nt.add(Vs)),s=Math.max(s,n.distanceToSquared(Nt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&He('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){He("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,s=t.normal,r=t.uv;let a=this.getAttribute("tangent");(a===void 0||a.count!==n.count)&&(a=new un(new Float32Array(4*n.count),4),this.setAttribute("tangent",a));const o=[],l=[];for(let _=0;_<n.count;_++)o[_]=new I,l[_]=new I;const c=new I,u=new I,h=new I,d=new Ne,f=new Ne,g=new Ne,x=new I,m=new I;function p(_,M,P){c.fromBufferAttribute(n,_),u.fromBufferAttribute(n,M),h.fromBufferAttribute(n,P),d.fromBufferAttribute(r,_),f.fromBufferAttribute(r,M),g.fromBufferAttribute(r,P),u.sub(c),h.sub(c),f.sub(d),g.sub(d);const R=1/(f.x*g.y-g.x*f.y);isFinite(R)&&(x.copy(u).multiplyScalar(g.y).addScaledVector(h,-f.y).multiplyScalar(R),m.copy(h).multiplyScalar(f.x).addScaledVector(u,-g.x).multiplyScalar(R),o[_].add(x),o[M].add(x),o[P].add(x),l[_].add(m),l[M].add(m),l[P].add(m))}let E=this.groups;E.length===0&&(E=[{start:0,count:e.count}]);for(let _=0,M=E.length;_<M;++_){const P=E[_],R=P.start,L=P.count;for(let z=R,X=R+L;z<X;z+=3)p(e.getX(z+0),e.getX(z+1),e.getX(z+2))}const A=new I,b=new I,T=new I,y=new I;function w(_){T.fromBufferAttribute(s,_),y.copy(T);const M=o[_];A.copy(M),A.sub(T.multiplyScalar(T.dot(M))).normalize(),b.crossVectors(y,M);const R=b.dot(l[_])<0?-1:1;a.setXYZW(_,A.x,A.y,A.z,R)}for(let _=0,M=E.length;_<M;++_){const P=E[_],R=P.start,L=P.count;for(let z=R,X=R+L;z<X;z+=3)w(e.getX(z+0)),w(e.getX(z+1)),w(e.getX(z+2))}this._transformed=!0}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==t.count)n=new un(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let d=0,f=n.count;d<f;d++)n.setXYZ(d,0,0,0);const s=new I,r=new I,a=new I,o=new I,l=new I,c=new I,u=new I,h=new I;if(e)for(let d=0,f=e.count;d<f;d+=3){const g=e.getX(d+0),x=e.getX(d+1),m=e.getX(d+2);s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,x),a.fromBufferAttribute(t,m),u.subVectors(a,r),h.subVectors(s,r),u.cross(h),o.fromBufferAttribute(n,g),l.fromBufferAttribute(n,x),c.fromBufferAttribute(n,m),o.add(u),l.add(u),c.add(u),n.setXYZ(g,o.x,o.y,o.z),n.setXYZ(x,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let d=0,f=t.count;d<f;d+=3)s.fromBufferAttribute(t,d+0),r.fromBufferAttribute(t,d+1),a.fromBufferAttribute(t,d+2),u.subVectors(a,r),h.subVectors(s,r),u.cross(h),n.setXYZ(d+0,u.x,u.y,u.z),n.setXYZ(d+1,u.x,u.y,u.z),n.setXYZ(d+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Nt.fromBufferAttribute(e,t),Nt.normalize(),e.setXYZ(t,Nt.x,Nt.y,Nt.z)}toNonIndexed(){function e(o,l){const c=o.array,u=o.itemSize,h=o.normalized,d=new c.constructor(l.length*u);let f=0,g=0;for(let x=0,m=l.length;x<m;x++){o.isInterleavedBufferAttribute?f=l[x]*o.data.stride+o.offset:f=l[x]*u;for(let p=0;p<u;p++)d[g++]=c[f++]}return new un(d,u,h)}if(this.index===null)return Pe("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new Vt,n=this.index.array,s=this.attributes;for(const o in s){const l=s[o],c=e(l,n);t.setAttribute(o,c)}const r=this.morphAttributes;for(const o in r){const l=[],c=r[o];for(let u=0,h=c.length;u<h;u++){const d=c[u],f=e(d,n);l.push(f)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const l in n){const c=n[l];e.data.attributes[l]=c.toJSON(e.data)}const s={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],u=[];for(let h=0,d=c.length;h<d;h++){const f=c[h];u.push(f.toJSON(e.data))}u.length>0&&(s[l]=u,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone());const s=e.attributes;for(const c in s){const u=s[c];this.setAttribute(c,u.clone(t))}const r=e.morphAttributes;for(const c in r){const u=[],h=r[c];for(let d=0,f=h.length;d<f;d++)u.push(h[d].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let c=0,u=a.length;c<u;c++){const h=a[c];this.addGroup(h.start,h.count,h.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}}let rg=0;class Ji extends Ki{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:rg++}),this.uuid=Zi(),this.name="",this.type="Material",this.blending=js,this.side=mi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Gl,this.blendDst=Hl,this.blendEquation=as,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Oe(0,0,0),this.blendAlpha=0,this.depthFunc=ir,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=su,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ls,this.stencilZFail=Ls,this.stencilZPass=Ls,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){Pe(`Material: parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){Pe(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==js&&(n.blending=this.blending),this.side!==mi&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Gl&&(n.blendSrc=this.blendSrc),this.blendDst!==Hl&&(n.blendDst=this.blendDst),this.blendEquation!==as&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==ir&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==su&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Ls&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Ls&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Ls&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.allowOverride===!1&&(n.allowOverride=!1),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){const a=[];for(const o in r){const l=r[o];delete l.metadata,a.push(l)}return a}if(t){const r=s(e.textures),a=s(e.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Oe().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let n=e.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new Ne().fromArray(n)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Ne().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}const ti=new I,pl=new I,xa=new I,Ti=new I,ml=new I,ba=new I,gl=new I;class ea{constructor(e=new I,t=new I(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,ti)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=ti.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(ti.copy(this.origin).addScaledVector(this.direction,t),ti.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){pl.copy(e).add(t).multiplyScalar(.5),xa.copy(t).sub(e).normalize(),Ti.copy(this.origin).sub(pl);const r=e.distanceTo(t)*.5,a=-this.direction.dot(xa),o=Ti.dot(this.direction),l=-Ti.dot(xa),c=Ti.lengthSq(),u=Math.abs(1-a*a);let h,d,f,g;if(u>0)if(h=a*l-o,d=a*o-l,g=r*u,h>=0)if(d>=-g)if(d<=g){const x=1/u;h*=x,d*=x,f=h*(h+a*d+2*o)+d*(a*h+d+2*l)+c}else d=r,h=Math.max(0,-(a*d+o)),f=-h*h+d*(d+2*l)+c;else d=-r,h=Math.max(0,-(a*d+o)),f=-h*h+d*(d+2*l)+c;else d<=-g?(h=Math.max(0,-(-a*r+o)),d=h>0?-r:Math.min(Math.max(-r,-l),r),f=-h*h+d*(d+2*l)+c):d<=g?(h=0,d=Math.min(Math.max(-r,-l),r),f=d*(d+2*l)+c):(h=Math.max(0,-(a*r+o)),d=h>0?r:Math.min(Math.max(-r,-l),r),f=-h*h+d*(d+2*l)+c);else d=a>0?-r:r,h=Math.max(0,-(a*d+o)),f=-h*h+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,h),s&&s.copy(pl).addScaledVector(xa,d),f}intersectSphere(e,t){ti.subVectors(e.center,this.origin);const n=ti.dot(this.direction),s=ti.dot(ti)-n*n,r=e.radius*e.radius;if(s>r)return null;const a=Math.sqrt(r-s),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,a,o,l;const c=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,s=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,s=(e.min.x-d.x)*c),u>=0?(r=(e.min.y-d.y)*u,a=(e.max.y-d.y)*u):(r=(e.max.y-d.y)*u,a=(e.min.y-d.y)*u),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),h>=0?(o=(e.min.z-d.z)*h,l=(e.max.z-d.z)*h):(o=(e.max.z-d.z)*h,l=(e.min.z-d.z)*h),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,ti)!==null}intersectTriangle(e,t,n,s,r){ml.subVectors(t,e),ba.subVectors(n,e),gl.crossVectors(ml,ba);let a=this.direction.dot(gl),o;if(a>0){if(s)return null;o=1}else if(a<0)o=-1,a=-a;else return null;Ti.subVectors(this.origin,e);const l=o*this.direction.dot(ba.crossVectors(Ti,ba));if(l<0)return null;const c=o*this.direction.dot(ml.cross(Ti));if(c<0||l+c>a)return null;const u=-o*Ti.dot(gl);return u<0?null:this.at(u/a,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Gr extends Ji{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Oe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Mn,this.combine=No,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const yu=new Fe,ns=new ea,ya=new cr,Mu=new I,Ma=new I,Sa=new I,Ea=new I,_l=new I,Ta=new I,Su=new I,Aa=new I;class gt extends _t{constructor(e=new Vt,t=new Gr){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){const n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(s,e);const o=this.morphTargetInfluences;if(r&&o){Ta.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const u=o[l],h=r[l];u!==0&&(_l.fromBufferAttribute(h,e),a?Ta.addScaledVector(_l,u):Ta.addScaledVector(_l.sub(t),u))}t.add(Ta)}return t}raycast(e,t){const n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),ya.copy(n.boundingSphere),ya.applyMatrix4(r),ns.copy(e.ray).recast(e.near),!(ya.containsPoint(ns.origin)===!1&&(ns.intersectSphere(ya,Mu)===null||ns.origin.distanceToSquared(Mu)>(e.far-e.near)**2))&&(yu.copy(r).invert(),ns.copy(e.ray).applyMatrix4(yu),!(n.boundingBox!==null&&ns.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,ns)))}_computeIntersections(e,t,n){let s;const r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,u=r.attributes.uv1,h=r.attributes.normal,d=r.groups,f=r.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,x=d.length;g<x;g++){const m=d[g],p=a[m.materialIndex],E=Math.max(m.start,f.start),A=Math.min(o.count,Math.min(m.start+m.count,f.start+f.count));for(let b=E,T=A;b<T;b+=3){const y=o.getX(b),w=o.getX(b+1),_=o.getX(b+2);s=wa(this,p,e,n,c,u,h,y,w,_),s&&(s.faceIndex=Math.floor(b/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const g=Math.max(0,f.start),x=Math.min(o.count,f.start+f.count);for(let m=g,p=x;m<p;m+=3){const E=o.getX(m),A=o.getX(m+1),b=o.getX(m+2);s=wa(this,a,e,n,c,u,h,E,A,b),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let g=0,x=d.length;g<x;g++){const m=d[g],p=a[m.materialIndex],E=Math.max(m.start,f.start),A=Math.min(l.count,Math.min(m.start+m.count,f.start+f.count));for(let b=E,T=A;b<T;b+=3){const y=b,w=b+1,_=b+2;s=wa(this,p,e,n,c,u,h,y,w,_),s&&(s.faceIndex=Math.floor(b/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const g=Math.max(0,f.start),x=Math.min(l.count,f.start+f.count);for(let m=g,p=x;m<p;m+=3){const E=m,A=m+1,b=m+2;s=wa(this,a,e,n,c,u,h,E,A,b),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}}function ag(i,e,t,n,s,r,a,o){let l;if(e.side===nn?l=n.intersectTriangle(a,r,s,!0,o):l=n.intersectTriangle(s,r,a,e.side===mi,o),l===null)return null;Aa.copy(o),Aa.applyMatrix4(i.matrixWorld);const c=t.ray.origin.distanceTo(Aa);return c<t.near||c>t.far?null:{distance:c,point:Aa.clone(),object:i}}function wa(i,e,t,n,s,r,a,o,l,c){i.getVertexPosition(o,Ma),i.getVertexPosition(l,Sa),i.getVertexPosition(c,Ea);const u=ag(i,e,t,n,Ma,Sa,Ea,Su);if(u){const h=new I;_n.getBarycoord(Su,Ma,Sa,Ea,h),s&&(u.uv=_n.getInterpolatedAttribute(s,o,l,c,h,new Ne)),r&&(u.uv1=_n.getInterpolatedAttribute(r,o,l,c,h,new Ne)),a&&(u.normal=_n.getInterpolatedAttribute(a,o,l,c,h,new I),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));const d={a:o,b:l,c,normal:new I,materialIndex:0};_n.getNormal(Ma,Sa,Ea,d.normal),u.face=d,u.barycoord=h}return u}const _r=new st,Eu=new st,Tu=new st,og=new st,Au=new Fe,Ra=new I,vl=new cr,wu=new Fe,xl=new ea;class lg extends gt{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=eu,this.bindMatrix=new Fe,this.bindMatrixInverse=new Fe,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){const e=this.geometry;this.boundingBox===null&&(this.boundingBox=new Es),this.boundingBox.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,Ra),this.boundingBox.expandByPoint(Ra)}computeBoundingSphere(){const e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new cr),this.boundingSphere.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,Ra),this.boundingSphere.expandByPoint(Ra)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){const n=this.material,s=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),vl.copy(this.boundingSphere),vl.applyMatrix4(s),e.ray.intersectsSphere(vl)!==!1&&(wu.copy(s).invert(),xl.copy(e.ray).applyMatrix4(wu),!(this.boundingBox!==null&&xl.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,xl)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){const e=new st,t=this.geometry.attributes.skinWeight;for(let n=0,s=t.count;n<s;n++){e.fromBufferAttribute(t,n);const r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===eu?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===um?this.bindMatrixInverse.copy(this.bindMatrix).invert():Pe("SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){const n=this.skeleton,s=this.geometry;Eu.fromBufferAttribute(s.attributes.skinIndex,e),Tu.fromBufferAttribute(s.attributes.skinWeight,e),t.isVector4?(_r.copy(t),t.set(0,0,0,0)):(_r.set(...t,1),t.set(0,0,0)),_r.applyMatrix4(this.bindMatrix);for(let r=0;r<4;r++){const a=Tu.getComponent(r);if(a!==0){const o=Eu.getComponent(r);Au.multiplyMatrices(n.bones[o].matrixWorld,n.boneInverses[o]),t.addScaledVector(og.copy(_r).applyMatrix4(Au),a)}}return t.isVector4&&(t.w=_r.w),t.applyMatrix4(this.bindMatrixInverse)}}class bf extends _t{constructor(){super(),this.isBone=!0,this.type="Bone"}}class ho extends $t{constructor(e=null,t=1,n=1,s,r,a,o,l,c=Bt,u=Bt,h,d){super(null,a,o,l,c,u,s,r,h,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const Ru=new Fe,cg=new Fe;class td{constructor(e=[],t=[]){this.uuid=Zi(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){const e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){Pe("Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,s=this.bones.length;n<s;n++)this.boneInverses.push(new Fe)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){const n=new Fe;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){const e=this.bones,t=this.boneInverses,n=this.boneMatrices,s=this.boneTexture;for(let r=0,a=e.length;r<a;r++){const o=e[r]?e[r].matrixWorld:cg;Ru.multiplyMatrices(o,t[r]),Ru.toArray(n,r*16)}s!==null&&(s.needsUpdate=!0)}clone(){return new td(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);const t=new Float32Array(e*e*4);t.set(this.boneMatrices);const n=new ho(t,e,e,vn,Pn);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){const s=this.bones[t];if(s.name===e)return s}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,s=e.bones.length;n<s;n++){const r=e.bones[n];let a=t[r];a===void 0&&(Pe("Skeleton: No bone found with UUID:",r),a=new bf),this.bones.push(a),this.boneInverses.push(new Fe().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){const e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;const t=this.bones,n=this.boneInverses;for(let s=0,r=t.length;s<r;s++){const a=t[s];e.bones.push(a.uuid);const o=n[s];e.boneInverses.push(o.toArray())}return e}}const bl=new I,dg=new I,ug=new Be;class Ci{constructor(e=new I(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const s=bl.subVectors(n,t).cross(dg.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){const s=e.delta(bl),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const a=-(e.start.dot(this.normal)+this.constant)/r;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(s,a)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||ug.getNormalMatrix(e),s=this.coplanarPoint(bl).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const is=new cr,hg=new Ne(.5,.5),Ca=new I;class nd{constructor(e=new Ci,t=new Ci,n=new Ci,s=new Ci,r=new Ci,a=new Ci){this.planes=[e,t,n,s,r,a]}set(e,t,n,s,r,a){const o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Hn,n=!1){const s=this.planes,r=e.elements,a=r[0],o=r[1],l=r[2],c=r[3],u=r[4],h=r[5],d=r[6],f=r[7],g=r[8],x=r[9],m=r[10],p=r[11],E=r[12],A=r[13],b=r[14],T=r[15];if(s[0].setComponents(c-a,f-u,p-g,T-E).normalize(),s[1].setComponents(c+a,f+u,p+g,T+E).normalize(),s[2].setComponents(c+o,f+h,p+x,T+A).normalize(),s[3].setComponents(c-o,f-h,p-x,T-A).normalize(),n)s[4].setComponents(l,d,m,b).normalize(),s[5].setComponents(c-l,f-d,p-m,T-b).normalize();else if(s[4].setComponents(c-l,f-d,p-m,T-b).normalize(),t===Hn)s[5].setComponents(c+l,f+d,p+m,T+b).normalize();else if(t===zr)s[5].setComponents(l,d,m,b).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),is.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),is.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(is)}intersectsSprite(e){is.center.set(0,0,0);const t=hg.distanceTo(e.center);return is.radius=.7071067811865476+t,is.applyMatrix4(e.matrixWorld),this.intersectsSphere(is)}intersectsSphere(e){const t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const s=t[n];if(Ca.x=s.normal.x>0?e.max.x:e.min.x,Ca.y=s.normal.y>0?e.max.y:e.min.y,Ca.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Ca)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class Hr extends Ji{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Oe(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const fo=new I,po=new I,Cu=new Fe,vr=new ea,Pa=new cr,yl=new I,Pu=new I;class yf extends _t{constructor(e=new Vt,t=new Hr){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[0];for(let s=1,r=t.count;s<r;s++)fo.fromBufferAttribute(t,s-1),po.fromBufferAttribute(t,s),n[s]=n[s-1],n[s]+=fo.distanceTo(po);e.setAttribute("lineDistance",new Qe(n,1))}else Pe("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const n=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Pa.copy(n.boundingSphere),Pa.applyMatrix4(s),Pa.radius+=r,e.ray.intersectsSphere(Pa)===!1)return;Cu.copy(s).invert(),vr.copy(e.ray).applyMatrix4(Cu);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,u=n.index,d=n.attributes.position;if(u!==null){const f=Math.max(0,a.start),g=Math.min(u.count,a.start+a.count);for(let x=f,m=g-1;x<m;x+=c){const p=u.getX(x),E=u.getX(x+1),A=La(this,e,vr,l,p,E,x);A&&t.push(A)}if(this.isLineLoop){const x=u.getX(g-1),m=u.getX(f),p=La(this,e,vr,l,x,m,g-1);p&&t.push(p)}}else{const f=Math.max(0,a.start),g=Math.min(d.count,a.start+a.count);for(let x=f,m=g-1;x<m;x+=c){const p=La(this,e,vr,l,x,x+1,x);p&&t.push(p)}if(this.isLineLoop){const x=La(this,e,vr,l,g-1,f,g-1);x&&t.push(x)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function La(i,e,t,n,s,r,a){const o=i.geometry.attributes.position;if(fo.fromBufferAttribute(o,s),po.fromBufferAttribute(o,r),t.distanceSqToSegment(fo,po,yl,Pu)>n)return;yl.applyMatrix4(i.matrixWorld);const c=e.ray.origin.distanceTo(yl);if(!(c<e.near||c>e.far))return{distance:c,point:Pu.clone().applyMatrix4(i.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:i}}const Lu=new I,Nu=new I;class id extends yf{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[];for(let s=0,r=t.count;s<r;s+=2)Lu.fromBufferAttribute(t,s),Nu.fromBufferAttribute(t,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+Lu.distanceTo(Nu);e.setAttribute("lineDistance",new Qe(n,1))}else Pe("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class Mf extends $t{constructor(e=[],t=vs,n,s,r,a,o,l,c,u){super(e,t,n,s,r,a,o,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class ar extends $t{constructor(e,t,n=Yn,s,r,a,o=Bt,l=Bt,c,u=_i,h=1){if(u!==_i&&u!==ds)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const d={width:e,height:t,depth:h};super(d,s,r,a,o,l,u,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Qc(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class fg extends ar{constructor(e,t=Yn,n=vs,s,r,a=Bt,o=Bt,l,c=_i){const u={width:e,height:e,depth:1},h=[u,u,u,u,u,u];super(e,e,t,n,s,r,a,o,l,c),this.image=h,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}}class Sf extends $t{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class Ts extends Vt{constructor(e=1,t=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};const o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);const l=[],c=[],u=[],h=[];let d=0,f=0;g("z","y","x",-1,-1,n,t,e,a,r,0),g("z","y","x",1,-1,n,t,-e,a,r,1),g("x","z","y",1,1,e,n,t,s,a,2),g("x","z","y",1,-1,e,n,-t,s,a,3),g("x","y","z",1,-1,e,t,n,s,r,4),g("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new Qe(c,3)),this.setAttribute("normal",new Qe(u,3)),this.setAttribute("uv",new Qe(h,2));function g(x,m,p,E,A,b,T,y,w,_,M){const P=b/w,R=T/_,L=b/2,z=T/2,X=y/2,O=w+1,N=_+1;let V=0,$=0;const j=new I;for(let re=0;re<N;re++){const se=re*R-z;for(let ae=0;ae<O;ae++){const xe=ae*P-L;j[x]=xe*E,j[m]=se*A,j[p]=X,c.push(j.x,j.y,j.z),j[x]=0,j[m]=0,j[p]=y>0?1:-1,u.push(j.x,j.y,j.z),h.push(ae/w),h.push(1-re/_),V+=1}}for(let re=0;re<_;re++)for(let se=0;se<w;se++){const ae=d+se+O*re,xe=d+se+O*(re+1),be=d+(se+1)+O*(re+1),le=d+(se+1)+O*re;l.push(ae,xe,le),l.push(xe,be,le),$+=6}o.addGroup(f,$,M),f+=$,d+=V}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ts(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}class sd extends Vt{constructor(e=1,t=1,n=1,s=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};const c=this;s=Math.floor(s),r=Math.floor(r);const u=[],h=[],d=[],f=[];let g=0;const x=[],m=n/2;let p=0;E(),a===!1&&(e>0&&A(!0),t>0&&A(!1)),this.setIndex(u),this.setAttribute("position",new Qe(h,3)),this.setAttribute("normal",new Qe(d,3)),this.setAttribute("uv",new Qe(f,2));function E(){const b=new I,T=new I;let y=0;const w=(t-e)/n;for(let _=0;_<=r;_++){const M=[],P=_/r,R=P*(t-e)+e;for(let L=0;L<=s;L++){const z=L/s,X=z*l+o,O=Math.sin(X),N=Math.cos(X);T.x=R*O,T.y=-P*n+m,T.z=R*N,h.push(T.x,T.y,T.z),b.set(O,w,N).normalize(),d.push(b.x,b.y,b.z),f.push(z,1-P),M.push(g++)}x.push(M)}for(let _=0;_<s;_++)for(let M=0;M<r;M++){const P=x[M][_],R=x[M+1][_],L=x[M+1][_+1],z=x[M][_+1];(e>0||M!==0)&&(u.push(P,R,z),y+=3),(t>0||M!==r-1)&&(u.push(R,L,z),y+=3)}c.addGroup(p,y,0),p+=y}function A(b){const T=g,y=new Ne,w=new I;let _=0;const M=b===!0?e:t,P=b===!0?1:-1;for(let L=1;L<=s;L++)h.push(0,m*P,0),d.push(0,P,0),f.push(.5,.5),g++;const R=g;for(let L=0;L<=s;L++){const X=L/s*l+o,O=Math.cos(X),N=Math.sin(X);w.x=M*N,w.y=m*P,w.z=M*O,h.push(w.x,w.y,w.z),d.push(0,P,0),y.x=O*.5+.5,y.y=N*.5*P+.5,f.push(y.x,y.y),g++}for(let L=0;L<s;L++){const z=T+L,X=R+L;b===!0?u.push(X,X+1,z):u.push(X+1,X,z),_+=3}c.addGroup(p,_,b===!0?1:2),p+=_}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new sd(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}function pg(i,e,t=2){const n=e&&e.length,s=n?e[0]*t:i.length;let r=Ef(i,0,s,t,!0);const a=[];if(!r||r.next===r.prev)return a;let o,l,c;if(n&&(r=xg(i,e,r,t)),i.length>80*t){o=i[0],l=i[1];let u=o,h=l;for(let d=t;d<s;d+=t){const f=i[d],g=i[d+1];f<o&&(o=f),g<l&&(l=g),f>u&&(u=f),g>h&&(h=g)}c=Math.max(u-o,h-l),c=c!==0?32767/c:0}return Wr(r,a,t,o,l,c,0),a}function Ef(i,e,t,n,s){let r;if(s===Pg(i,e,t,n)>0)for(let a=e;a<t;a+=n)r=Iu(a/n|0,i[a],i[a+1],r);else for(let a=t-n;a>=e;a-=n)r=Iu(a/n|0,i[a],i[a+1],r);return r&&or(r,r.next)&&(qr(r),r=r.next),r}function bs(i,e){if(!i)return i;e||(e=i);let t=i,n;do if(n=!1,!t.steiner&&(or(t,t.next)||ut(t.prev,t,t.next)===0)){if(qr(t),t=e=t.prev,t===t.next)break;n=!0}else t=t.next;while(n||t!==e);return e}function Wr(i,e,t,n,s,r,a){if(!i)return;!a&&r&&Eg(i,n,s,r);let o=i;for(;i.prev!==i.next;){const l=i.prev,c=i.next;if(r?gg(i,n,s,r):mg(i)){e.push(l.i,i.i,c.i),qr(i),i=c.next,o=c.next;continue}if(i=c,i===o){a?a===1?(i=_g(bs(i),e),Wr(i,e,t,n,s,r,2)):a===2&&vg(i,e,t,n,s,r):Wr(bs(i),e,t,n,s,r,1);break}}}function mg(i){const e=i.prev,t=i,n=i.next;if(ut(e,t,n)>=0)return!1;const s=e.x,r=t.x,a=n.x,o=e.y,l=t.y,c=n.y,u=Math.min(s,r,a),h=Math.min(o,l,c),d=Math.max(s,r,a),f=Math.max(o,l,c);let g=n.next;for(;g!==e;){if(g.x>=u&&g.x<=d&&g.y>=h&&g.y<=f&&Sr(s,o,r,l,a,c,g.x,g.y)&&ut(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function gg(i,e,t,n){const s=i.prev,r=i,a=i.next;if(ut(s,r,a)>=0)return!1;const o=s.x,l=r.x,c=a.x,u=s.y,h=r.y,d=a.y,f=Math.min(o,l,c),g=Math.min(u,h,d),x=Math.max(o,l,c),m=Math.max(u,h,d),p=Pc(f,g,e,t,n),E=Pc(x,m,e,t,n);let A=i.prevZ,b=i.nextZ;for(;A&&A.z>=p&&b&&b.z<=E;){if(A.x>=f&&A.x<=x&&A.y>=g&&A.y<=m&&A!==s&&A!==a&&Sr(o,u,l,h,c,d,A.x,A.y)&&ut(A.prev,A,A.next)>=0||(A=A.prevZ,b.x>=f&&b.x<=x&&b.y>=g&&b.y<=m&&b!==s&&b!==a&&Sr(o,u,l,h,c,d,b.x,b.y)&&ut(b.prev,b,b.next)>=0))return!1;b=b.nextZ}for(;A&&A.z>=p;){if(A.x>=f&&A.x<=x&&A.y>=g&&A.y<=m&&A!==s&&A!==a&&Sr(o,u,l,h,c,d,A.x,A.y)&&ut(A.prev,A,A.next)>=0)return!1;A=A.prevZ}for(;b&&b.z<=E;){if(b.x>=f&&b.x<=x&&b.y>=g&&b.y<=m&&b!==s&&b!==a&&Sr(o,u,l,h,c,d,b.x,b.y)&&ut(b.prev,b,b.next)>=0)return!1;b=b.nextZ}return!0}function _g(i,e){let t=i;do{const n=t.prev,s=t.next.next;!or(n,s)&&Af(n,t,t.next,s)&&Xr(n,s)&&Xr(s,n)&&(e.push(n.i,t.i,s.i),qr(t),qr(t.next),t=i=s),t=t.next}while(t!==i);return bs(t)}function vg(i,e,t,n,s,r){let a=i;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&wg(a,o)){let l=wf(a,o);a=bs(a,a.next),l=bs(l,l.next),Wr(a,e,t,n,s,r,0),Wr(l,e,t,n,s,r,0);return}o=o.next}a=a.next}while(a!==i)}function xg(i,e,t,n){const s=[];for(let r=0,a=e.length;r<a;r++){const o=e[r]*n,l=r<a-1?e[r+1]*n:i.length,c=Ef(i,o,l,n,!1);c===c.next&&(c.steiner=!0),s.push(Ag(c))}s.sort(bg);for(let r=0;r<s.length;r++)t=yg(s[r],t);return t}function bg(i,e){let t=i.x-e.x;if(t===0&&(t=i.y-e.y,t===0)){const n=(i.next.y-i.y)/(i.next.x-i.x),s=(e.next.y-e.y)/(e.next.x-e.x);t=n-s}return t}function yg(i,e){const t=Mg(i,e);if(!t)return e;const n=wf(t,i);return bs(n,n.next),bs(t,t.next)}function Mg(i,e){let t=e;const n=i.x,s=i.y;let r=-1/0,a;if(or(i,t))return t;do{if(or(i,t.next))return t.next;if(s<=t.y&&s>=t.next.y&&t.next.y!==t.y){const h=t.x+(s-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(h<=n&&h>r&&(r=h,a=t.x<t.next.x?t:t.next,h===n))return a}t=t.next}while(t!==e);if(!a)return null;const o=a,l=a.x,c=a.y;let u=1/0;t=a;do{if(n>=t.x&&t.x>=l&&n!==t.x&&Tf(s<c?n:r,s,l,c,s<c?r:n,s,t.x,t.y)){const h=Math.abs(s-t.y)/(n-t.x);Xr(t,i)&&(h<u||h===u&&(t.x>a.x||t.x===a.x&&Sg(a,t)))&&(a=t,u=h)}t=t.next}while(t!==o);return a}function Sg(i,e){return ut(i.prev,i,e.prev)<0&&ut(e.next,i,i.next)<0}function Eg(i,e,t,n){let s=i;do s.z===0&&(s.z=Pc(s.x,s.y,e,t,n)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==i);s.prevZ.nextZ=null,s.prevZ=null,Tg(s)}function Tg(i){let e,t=1;do{let n=i,s;i=null;let r=null;for(e=0;n;){e++;let a=n,o=0;for(let c=0;c<t&&(o++,a=a.nextZ,!!a);c++);let l=t;for(;o>0||l>0&&a;)o!==0&&(l===0||!a||n.z<=a.z)?(s=n,n=n.nextZ,o--):(s=a,a=a.nextZ,l--),r?r.nextZ=s:i=s,s.prevZ=r,r=s;n=a}r.nextZ=null,t*=2}while(e>1);return i}function Pc(i,e,t,n,s){return i=(i-t)*s|0,e=(e-n)*s|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,i|e<<1}function Ag(i){let e=i,t=i;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==i);return t}function Tf(i,e,t,n,s,r,a,o){return(s-a)*(e-o)>=(i-a)*(r-o)&&(i-a)*(n-o)>=(t-a)*(e-o)&&(t-a)*(r-o)>=(s-a)*(n-o)}function Sr(i,e,t,n,s,r,a,o){return!(i===a&&e===o)&&Tf(i,e,t,n,s,r,a,o)}function wg(i,e){return i.next.i!==e.i&&i.prev.i!==e.i&&!Rg(i,e)&&(Xr(i,e)&&Xr(e,i)&&Cg(i,e)&&(ut(i.prev,i,e.prev)||ut(i,e.prev,e))||or(i,e)&&ut(i.prev,i,i.next)>0&&ut(e.prev,e,e.next)>0)}function ut(i,e,t){return(e.y-i.y)*(t.x-e.x)-(e.x-i.x)*(t.y-e.y)}function or(i,e){return i.x===e.x&&i.y===e.y}function Af(i,e,t,n){const s=Ia(ut(i,e,t)),r=Ia(ut(i,e,n)),a=Ia(ut(t,n,i)),o=Ia(ut(t,n,e));return!!(s!==r&&a!==o||s===0&&Na(i,t,e)||r===0&&Na(i,n,e)||a===0&&Na(t,i,n)||o===0&&Na(t,e,n))}function Na(i,e,t){return e.x<=Math.max(i.x,t.x)&&e.x>=Math.min(i.x,t.x)&&e.y<=Math.max(i.y,t.y)&&e.y>=Math.min(i.y,t.y)}function Ia(i){return i>0?1:i<0?-1:0}function Rg(i,e){let t=i;do{if(t.i!==i.i&&t.next.i!==i.i&&t.i!==e.i&&t.next.i!==e.i&&Af(t,t.next,i,e))return!0;t=t.next}while(t!==i);return!1}function Xr(i,e){return ut(i.prev,i,i.next)<0?ut(i,e,i.next)>=0&&ut(i,i.prev,e)>=0:ut(i,e,i.prev)<0||ut(i,i.next,e)<0}function Cg(i,e){let t=i,n=!1;const s=(i.x+e.x)/2,r=(i.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&s<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(n=!n),t=t.next;while(t!==i);return n}function wf(i,e){const t=Lc(i.i,i.x,i.y),n=Lc(e.i,e.x,e.y),s=i.next,r=e.prev;return i.next=e,e.prev=i,t.next=s,s.prev=t,n.next=t,t.prev=n,r.next=n,n.prev=r,n}function Iu(i,e,t,n){const s=Lc(i,e,t);return n?(s.next=n.next,s.prev=n,n.next.prev=s,n.next=s):(s.prev=s,s.next=s),s}function qr(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function Lc(i,e,t){return{i,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function Pg(i,e,t,n){let s=0;for(let r=e,a=t-n;r<t;r+=n)s+=(i[a]-i[r])*(i[r+1]+i[a+1]),a=r;return s}class Lg{static triangulate(e,t,n=2){return pg(e,t,n)}}class mo{static area(e){const t=e.length;let n=0;for(let s=t-1,r=0;r<t;s=r++)n+=e[s].x*e[r].y-e[r].x*e[s].y;return n*.5}static isClockWise(e){return mo.area(e)<0}static triangulateShape(e,t){const n=[],s=[],r=[];Du(e),Uu(n,e);let a=e.length;t.forEach(Du);for(let l=0;l<t.length;l++)s.push(a),a+=t[l].length,Uu(n,t[l]);const o=Lg.triangulate(n,s);for(let l=0;l<o.length;l+=3)r.push(o.slice(l,l+3));return r}}function Du(i){const e=i.length;e>2&&i[e-1].equals(i[0])&&i.pop()}function Uu(i,e){for(let t=0;t<e.length;t++)i.push(e[t].x),i.push(e[t].y)}class Do extends Vt{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};const r=e/2,a=t/2,o=Math.floor(n),l=Math.floor(s),c=o+1,u=l+1,h=e/o,d=t/l,f=[],g=[],x=[],m=[];for(let p=0;p<u;p++){const E=p*d-a;for(let A=0;A<c;A++){const b=A*h-r;g.push(b,-E,0),x.push(0,0,1),m.push(A/o),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let E=0;E<o;E++){const A=E+c*p,b=E+c*(p+1),T=E+1+c*(p+1),y=E+1+c*p;f.push(A,b,y),f.push(b,T,y)}this.setIndex(f),this.setAttribute("position",new Qe(g,3)),this.setAttribute("normal",new Qe(x,3)),this.setAttribute("uv",new Qe(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Do(e.width,e.height,e.widthSegments,e.heightSegments)}}class rd extends Vt{constructor(e=1,t=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));const l=Math.min(a+o,Math.PI);let c=0;const u=[],h=new I,d=new I,f=[],g=[],x=[],m=[];for(let p=0;p<=n;p++){const E=[],A=p/n,b=a+A*o,T=e*Math.cos(b),y=Math.sqrt(e*e-T*T);let w=0;p===0&&a===0?w=.5/t:p===n&&l===Math.PI&&(w=-.5/t);for(let _=0;_<=t;_++){const M=_/t,P=s+M*r;h.x=-y*Math.cos(P),h.y=T,h.z=y*Math.sin(P),g.push(h.x,h.y,h.z),d.copy(h).normalize(),x.push(d.x,d.y,d.z),m.push(M+w,1-A),E.push(c++)}u.push(E)}for(let p=0;p<n;p++)for(let E=0;E<t;E++){const A=u[p][E+1],b=u[p][E],T=u[p+1][E],y=u[p+1][E+1];(p!==0||a>0)&&f.push(A,b,y),(p!==n-1||l<Math.PI)&&f.push(b,T,y)}this.setIndex(f),this.setAttribute("position",new Qe(g,3)),this.setAttribute("normal",new Qe(x,3)),this.setAttribute("uv",new Qe(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new rd(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}function lr(i){const e={};for(const t in i){e[t]={};for(const n in i[t]){const s=i[t][n];if(Fu(s))s.isRenderTargetTexture?(Pe("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone();else if(Array.isArray(s))if(Fu(s[0])){const r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();e[t][n]=r}else e[t][n]=s.slice();else e[t][n]=s}}return e}function Zt(i){const e={};for(let t=0;t<i.length;t++){const n=lr(i[t]);for(const s in n)e[s]=n[s]}return e}function Fu(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function Ng(i){const e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function Rf(i){const e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Xe.workingColorSpace}const Ig={clone:lr,merge:Zt};var Dg=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Ug=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Kn extends Ji{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Dg,this.fragmentShader=Ug,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=lr(e.uniforms),this.uniformsGroups=Ng(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const s in this.uniforms){const a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(const n in e.uniforms){const s=e.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=t[s.value]||null;break;case"c":this.uniforms[n].value=new Oe().setHex(s.value);break;case"v2":this.uniforms[n].value=new Ne().fromArray(s.value);break;case"v3":this.uniforms[n].value=new I().fromArray(s.value);break;case"v4":this.uniforms[n].value=new st().fromArray(s.value);break;case"m3":this.uniforms[n].value=new Be().fromArray(s.value);break;case"m4":this.uniforms[n].value=new Fe().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(const n in e.extensions)this.extensions[n]=e.extensions[n];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}}class Fg extends Kn{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class Uo extends Ji{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Oe(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Oe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Br,this.normalScale=new Ne(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Mn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class wr extends Ji{constructor(e){super(),this.isMeshPhongMaterial=!0,this.type="MeshPhongMaterial",this.color=new Oe(16777215),this.specular=new Oe(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Oe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Br,this.normalScale=new Ne(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Mn,this.combine=No,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.specular.copy(e.specular),this.shininess=e.shininess,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Og extends Ji{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Oe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Oe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Br,this.normalScale=new Ne(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Mn,this.combine=No,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class kg extends Ji{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=pm,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class Bg extends Ji{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}function Da(i,e){return!i||i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function zg(i){function e(s,r){return i[s]-i[r]}const t=i.length,n=new Array(t);for(let s=0;s!==t;++s)n[s]=s;return n.sort(e),n}function Ou(i,e,t){const n=i.length,s=new i.constructor(n);for(let r=0,a=0;a!==n;++r){const o=t[r]*e;for(let l=0;l!==e;++l)s[a++]=i[o+l]}return s}function Vg(i,e,t,n){let s=1,r=i[0];for(;r!==void 0&&r[n]===void 0;)r=i[s++];if(r===void 0)return;let a=r[n];if(a!==void 0)if(Array.isArray(a))do a=r[n],a!==void 0&&(e.push(r.time),t.push(...a)),r=i[s++];while(r!==void 0);else if(a.toArray!==void 0)do a=r[n],a!==void 0&&(e.push(r.time),a.toArray(t,t.length)),r=i[s++];while(r!==void 0);else do a=r[n],a!==void 0&&(e.push(r.time),t.push(a)),r=i[s++];while(r!==void 0)}class ta{constructor(e,t,n,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){const t=this.parameterPositions;let n=this._cachedIndex,s=t[n],r=t[n-1];n:{e:{let a;t:{i:if(!(e<s)){for(let o=n+2;;){if(s===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=s,s=t[++n],e<s)break e}a=t.length;break t}if(!(e>=r)){const o=t[1];e<o&&(n=2,r=o);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=t[--n-1],e>=r)break e}a=n,n=0;break t}break n}for(;n<a;){const o=n+a>>>1;e<t[o]?a=o:n=o+1}if(s=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s;for(let a=0;a!==s;++a)t[a]=n[r+a];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}}class Gg extends ta{constructor(e,t,n,s){super(e,t,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:tu,endingEnd:tu}}intervalChanged_(e,t,n){const s=this.parameterPositions;let r=e-2,a=e+1,o=s[r],l=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case nu:r=e,o=2*t-n;break;case iu:r=s.length-2,o=t+s[r]-s[r+1];break;default:r=e,o=n}if(l===void 0)switch(this.getSettings_().endingEnd){case nu:a=e,l=2*n-t;break;case iu:a=1,l=n+s[1]-s[0];break;default:a=e-1,l=t}const c=(n-t)*.5,u=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(l-n),this._offsetPrev=r*u,this._offsetNext=a*u}interpolate_(e,t,n,s){const r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,u=this._offsetPrev,h=this._offsetNext,d=this._weightPrev,f=this._weightNext,g=(n-t)/(s-t),x=g*g,m=x*g,p=-d*m+2*d*x-d*g,E=(1+d)*m+(-1.5-2*d)*x+(-.5+d)*g+1,A=(-1-f)*m+(1.5+f)*x+.5*g,b=f*m-f*x;for(let T=0;T!==o;++T)r[T]=p*a[u+T]+E*a[c+T]+A*a[l+T]+b*a[h+T];return r}}class Hg extends ta{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){const r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,u=(n-t)/(s-t),h=1-u;for(let d=0;d!==o;++d)r[d]=a[c+d]*h+a[l+d]*u;return r}}class Wg extends ta{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e){return this.copySampleValue_(e-1)}}class Xg extends ta{interpolate_(e,t,n,s){const r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,u=this.inTangents,h=this.outTangents;if(!u||!h){const g=(n-t)/(s-t),x=1-g;for(let m=0;m!==o;++m)r[m]=a[c+m]*x+a[l+m]*g;return r}const d=o*2,f=e-1;for(let g=0;g!==o;++g){const x=a[c+g],m=a[l+g],p=f*d+g*2,E=h[p],A=h[p+1],b=e*d+g*2,T=u[b],y=u[b+1];let w=(n-t)/(s-t),_,M,P,R,L;for(let z=0;z<8;z++){_=w*w,M=_*w,P=1-w,R=P*P,L=R*P;const O=L*t+3*R*w*E+3*P*_*T+M*s-n;if(Math.abs(O)<1e-10)break;const N=3*R*(E-t)+6*P*w*(T-E)+3*_*(s-T);if(Math.abs(N)<1e-10)break;w=w-O/N,w=Math.max(0,Math.min(1,w))}r[g]=L*x+3*R*w*A+3*P*_*y+M*m}return r}}class Nn{constructor(e,t,n,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Da(t,this.TimeBufferType),this.values=Da(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){const t=e.constructor;let n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Da(e.times,Array),values:Da(e.values,Array)};const s=e.getInterpolation();s!==e.DefaultInterpolation&&(n.interpolation=s)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Wg(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Hg(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Gg(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){const t=new Xg(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case kr:t=this.InterpolantFactoryMethodDiscrete;break;case Rc:t=this.InterpolantFactoryMethodLinear;break;case Zo:t=this.InterpolantFactoryMethodSmooth;break;case Cc:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){const n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return Pe("KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return kr;case this.InterpolantFactoryMethodLinear:return Rc;case this.InterpolantFactoryMethodSmooth:return Zo;case this.InterpolantFactoryMethodBezier:return Cc}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){const t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]+=e}return this}scale(e){if(e!==1){const t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]*=e}return this}trim(e,t){const n=this.times,s=n.length;let r=0,a=s-1;for(;r!==s&&n[r]<e;)++r;for(;a!==-1&&n[a]>t;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);const o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let e=!0;const t=this.getValueSize();t-Math.floor(t)!==0&&(He("KeyframeTrack: Invalid value size in track.",this),e=!1);const n=this.times,s=this.values,r=n.length;r===0&&(He("KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==r;o++){const l=n[o];if(typeof l=="number"&&isNaN(l)){He("KeyframeTrack: Time is not a valid number.",this,o,l),e=!1;break}if(a!==null&&a>l){He("KeyframeTrack: Out of order keys.",this,o,l,a),e=!1;break}a=l}if(s!==void 0&&Sm(s))for(let o=0,l=s.length;o!==l;++o){const c=s[o];if(isNaN(c)){He("KeyframeTrack: Value is not a valid number.",this,o,c),e=!1;break}}return e}optimize(){const e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===Zo,r=e.length-1;let a=1;for(let o=1;o<r;++o){let l=!1;const c=e[o],u=e[o+1];if(c!==u&&(o!==1||c!==e[0]))if(s)l=!0;else{const h=o*n,d=h-n,f=h+n;for(let g=0;g!==n;++g){const x=t[h+g];if(x!==t[d+g]||x!==t[f+g]){l=!0;break}}}if(l){if(o!==a){e[a]=e[o];const h=o*n,d=a*n;for(let f=0;f!==n;++f)t[d+f]=t[h+f]}++a}}if(r>0){e[a]=e[r];for(let o=r*n,l=a*n,c=0;c!==n;++c)t[l+c]=t[o+c];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*n)):(this.times=e,this.values=t),this}clone(){const e=this.times.slice(),t=this.values.slice(),n=this.constructor,s=new n(this.name,e,t);return s.createInterpolant=this.createInterpolant,s}}Nn.prototype.ValueTypeName="";Nn.prototype.TimeBufferType=Float32Array;Nn.prototype.ValueBufferType=Float32Array;Nn.prototype.DefaultInterpolation=Rc;class dr extends Nn{constructor(e,t,n){super(e,t,n)}}dr.prototype.ValueTypeName="bool";dr.prototype.ValueBufferType=Array;dr.prototype.DefaultInterpolation=kr;dr.prototype.InterpolantFactoryMethodLinear=void 0;dr.prototype.InterpolantFactoryMethodSmooth=void 0;class Cf extends Nn{constructor(e,t,n,s){super(e,t,n,s)}}Cf.prototype.ValueTypeName="color";class ad extends Nn{constructor(e,t,n,s){super(e,t,n,s)}}ad.prototype.ValueTypeName="number";class qg extends ta{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){const r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(n-t)/(s-t);let c=e*o;for(let u=c+o;c!==u;c+=4)Ot.slerpFlat(r,0,a,c-o,a,c,l);return r}}class tr extends Nn{constructor(e,t,n,s){super(e,t,n,s)}InterpolantFactoryMethodLinear(e){return new qg(this.times,this.values,this.getValueSize(),e)}}tr.prototype.ValueTypeName="quaternion";tr.prototype.InterpolantFactoryMethodSmooth=void 0;class ur extends Nn{constructor(e,t,n){super(e,t,n)}}ur.prototype.ValueTypeName="string";ur.prototype.ValueBufferType=Array;ur.prototype.DefaultInterpolation=kr;ur.prototype.InterpolantFactoryMethodLinear=void 0;ur.prototype.InterpolantFactoryMethodSmooth=void 0;class mn extends Nn{constructor(e,t,n,s){super(e,t,n,s)}}mn.prototype.ValueTypeName="vector";class ku{constructor(e="",t=-1,n=[],s=fm){this.name=e,this.tracks=n,this.duration=t,this.blendMode=s,this.uuid=Zi(),this.userData={},this.duration<0&&this.resetDuration()}static parse(e){const t=[],n=e.tracks,s=1/(e.fps||1);for(let a=0,o=n.length;a!==o;++a)t.push(Yg(n[a]).scale(s));const r=new this(e.name,e.duration,t,e.blendMode);return r.uuid=e.uuid,r.userData=JSON.parse(e.userData||"{}"),r}static toJSON(e){const t=[],n=e.tracks,s={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let r=0,a=n.length;r!==a;++r)t.push(Nn.toJSON(n[r]));return s}static CreateFromMorphTargetSequence(e,t,n,s){const r=t.length,a=[];for(let o=0;o<r;o++){let l=[],c=[];l.push((o+r-1)%r,o,(o+1)%r),c.push(0,1,0);const u=zg(l);l=Ou(l,1,u),c=Ou(c,1,u),!s&&l[0]===0&&(l.push(r),c.push(c[0])),a.push(new ad(".morphTargetInfluences["+t[o].name+"]",l,c).scale(1/n))}return new this(e,-1,a)}static findByName(e,t){let n=e;if(!Array.isArray(e)){const s=e;n=s.geometry&&s.geometry.animations||s.animations}for(let s=0;s<n.length;s++)if(n[s].name===t)return n[s];return null}static CreateClipsFromMorphTargetSequences(e,t,n){const s={},r=/^([\w-]*?)([\d]+)$/;for(let o=0,l=e.length;o<l;o++){const c=e[o],u=c.name.match(r);if(u&&u.length>1){const h=u[1];let d=s[h];d||(s[h]=d=[]),d.push(c)}}const a=[];for(const o in s)a.push(this.CreateFromMorphTargetSequence(o,s[o],t,n));return a}resetDuration(){const e=this.tracks;let t=0;for(let n=0,s=e.length;n!==s;++n){const r=this.tracks[n];t=Math.max(t,r.times[r.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){const e=[];for(let n=0;n<this.tracks.length;n++)e.push(this.tracks[n].clone());const t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}}function $g(i){switch(i.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return ad;case"vector":case"vector2":case"vector3":case"vector4":return mn;case"color":return Cf;case"quaternion":return tr;case"bool":case"boolean":return dr;case"string":return ur}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+i)}function Yg(i){if(i.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");const e=$g(i.type);if(i.times===void 0){const t=[],n=[];Vg(i.keys,t,n,"value"),i.times=t,i.values=n}return e.parse!==void 0?e.parse(i):new e(i.name,i.times,i.values,i.interpolation)}const Rr={enabled:!1,files:{},add:function(i,e){this.enabled!==!1&&(Bu(i)||(this.files[i]=e))},get:function(i){if(this.enabled!==!1&&!Bu(i))return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}};function Bu(i){try{const e=i.slice(i.indexOf(":")+1);return new URL(e).protocol==="blob:"}catch{return!1}}class Kg{constructor(e,t,n){const s=this;let r=!1,a=0,o=0,l;const c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(u){o++,r===!1&&s.onStart!==void 0&&s.onStart(u,a,o),r=!0},this.itemEnd=function(u){a++,s.onProgress!==void 0&&s.onProgress(u,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(u){s.onError!==void 0&&s.onError(u)},this.resolveURL=function(u){return u=u.normalize("NFC"),l?l(u):u},this.setURLModifier=function(u){return l=u,this},this.addHandler=function(u,h){return c.push(u,h),this},this.removeHandler=function(u){const h=c.indexOf(u);return h!==-1&&c.splice(h,2),this},this.getHandler=function(u){for(let h=0,d=c.length;h<d;h+=2){const f=c[h],g=c[h+1];if(f.global&&(f.lastIndex=0),f.test(u))return g}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}}const Pf=new Kg;class ji{constructor(e){this.manager=e!==void 0?e:Pf,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){const n=this;return new Promise(function(s,r){n.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}}ji.DEFAULT_MATERIAL_NAME="__DEFAULT";const ni={};class Zg extends Error{constructor(e,t){super(e),this.response=t}}class od extends ji{constructor(e){super(e),this.mimeType="",this.responseType="",this._abortController=new AbortController}load(e,t,n,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=Rr.get(`file:${e}`);if(r!==void 0){this.manager.itemStart(e),setTimeout(()=>{t&&t(r),this.manager.itemEnd(e)},0);return}if(ni[e]!==void 0){ni[e].push({onLoad:t,onProgress:n,onError:s});return}ni[e]=[],ni[e].push({onLoad:t,onProgress:n,onError:s});const a=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",signal:typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),o=this.mimeType,l=this.responseType;fetch(a).then(c=>{if(c.status===200||c.status===0){if(c.status===0&&Pe("FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||c.body===void 0||c.body.getReader===void 0)return c;const u=ni[e],h=c.body.getReader(),d=c.headers.get("X-File-Size")||c.headers.get("Content-Length"),f=d?parseInt(d):0,g=f!==0;let x=0;const m=new ReadableStream({start(p){E();function E(){h.read().then(({done:A,value:b})=>{if(A)p.close();else{x+=b.byteLength;const T=new ProgressEvent("progress",{lengthComputable:g,loaded:x,total:f});for(let y=0,w=u.length;y<w;y++){const _=u[y];_.onProgress&&_.onProgress(T)}p.enqueue(b),E()}},A=>{p.error(A)})}}});return new Response(m)}else throw new Zg(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`,c)}).then(c=>{switch(l){case"arraybuffer":return c.arrayBuffer();case"blob":return c.blob();case"document":return c.text().then(u=>new DOMParser().parseFromString(u,o));case"json":return c.json();default:if(o==="")return c.text();{const h=/charset="?([^;"\s]*)"?/i.exec(o),d=h&&h[1]?h[1].toLowerCase():void 0,f=new TextDecoder(d);return c.arrayBuffer().then(g=>f.decode(g))}}}).then(c=>{Rr.add(`file:${e}`,c);const u=ni[e];delete ni[e];for(let h=0,d=u.length;h<d;h++){const f=u[h];f.onLoad&&f.onLoad(c)}}).catch(c=>{const u=ni[e];if(u===void 0)throw this.manager.itemError(e),c;delete ni[e];for(let h=0,d=u.length;h<d;h++){const f=u[h];f.onError&&f.onError(c)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}const Gs=new WeakMap;class Jg extends ji{constructor(e){super(e)}load(e,t,n,s){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,a=Rr.get(`image:${e}`);if(a!==void 0){if(a.complete===!0)r.manager.itemStart(e),setTimeout(function(){t&&t(a),r.manager.itemEnd(e)},0);else{let h=Gs.get(a);h===void 0&&(h=[],Gs.set(a,h)),h.push({onLoad:t,onError:s})}return a}const o=Vr("img");function l(){u(),t&&t(this);const h=Gs.get(this)||[];for(let d=0;d<h.length;d++){const f=h[d];f.onLoad&&f.onLoad(this)}Gs.delete(this),r.manager.itemEnd(e)}function c(h){u(),s&&s(h),Rr.remove(`image:${e}`);const d=Gs.get(this)||[];for(let f=0;f<d.length;f++){const g=d[f];g.onError&&g.onError(h)}Gs.delete(this),r.manager.itemError(e),r.manager.itemEnd(e)}function u(){o.removeEventListener("load",l,!1),o.removeEventListener("error",c,!1)}return o.addEventListener("load",l,!1),o.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),Rr.add(`image:${e}`,o),r.manager.itemStart(e),o.src=e,o}}class jg extends ji{constructor(e){super(e)}load(e,t,n,s){const r=this,a=new ho,o=new od(this.manager);return o.setResponseType("arraybuffer"),o.setRequestHeader(this.requestHeader),o.setPath(this.path),o.setWithCredentials(r.withCredentials),o.load(e,function(l){let c;try{c=r.parse(l)}catch(u){s!==void 0?s(u):He(u);return}r._applyTexData(a,c),t&&t(a,c)},n,s),a}createDataTexture(e){const t=new ho;return this._applyTexData(t,this.parse(e)),t}_applyTexData(e,t){t.image!==void 0?e.image=t.image:t.data!==void 0&&(e.image.width=t.width,e.image.height=t.height,e.image.data=t.data),e.wrapS=t.wrapS!==void 0?t.wrapS:dn,e.wrapT=t.wrapT!==void 0?t.wrapT:dn,e.magFilter=t.magFilter!==void 0?t.magFilter:Rt,e.minFilter=t.minFilter!==void 0?t.minFilter:Rt,e.anisotropy=t.anisotropy!==void 0?t.anisotropy:1,t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.mipmaps!==void 0&&(e.mipmaps=t.mipmaps,e.minFilter=ai),t.mipmapCount===1&&(e.minFilter=Rt),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),e.needsUpdate=!0}}class Lf extends ji{constructor(e){super(e)}load(e,t,n,s){const r=new $t,a=new Jg(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(o){r.image=o,r.needsUpdate=!0,t!==void 0&&t(r)},n,s),r}}class na extends _t{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Oe(e),this.intensity=t}dispose(){this.dispatchEvent({type:"dispose"})}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}}class Qg extends na{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(_t.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Oe(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){const t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}}const Ml=new Fe,zu=new I,Vu=new I;class ld{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Ne(512,512),this.mapType=cn,this.map=null,this.mapPass=null,this.matrix=new Fe,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new nd,this._frameExtents=new Ne(1,1),this._viewportCount=1,this._viewports=[new st(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,n=this.matrix;zu.setFromMatrixPosition(e.matrixWorld),t.position.copy(zu),Vu.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Vu),t.updateMatrixWorld(),Ml.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Ml,t.coordinateSystem,t.reversedDepth),t.coordinateSystem===zr||t.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Ml)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}const Ua=new I,Fa=new Ot,Fn=new I;class Nf extends _t{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Fe,this.projectionMatrix=new Fe,this.projectionMatrixInverse=new Fe,this.coordinateSystem=Hn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Ua,Fa,Fn),Fn.x===1&&Fn.y===1&&Fn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ua,Fa,Fn.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(Ua,Fa,Fn),Fn.x===1&&Fn.y===1&&Fn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ua,Fa,Fn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}const Ai=new I,Gu=new Ne,Hu=new Ne;class Xt extends Nf{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=rr*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Tr*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return rr*2*Math.atan(Math.tan(Tr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Ai.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Ai.x,Ai.y).multiplyScalar(-e/Ai.z),Ai.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Ai.x,Ai.y).multiplyScalar(-e/Ai.z)}getViewSize(e,t){return this.getViewBounds(e,Gu,Hu),t.subVectors(Hu,Gu)}setViewOffset(e,t,n,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(Tr*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,t-=a.offsetY*n/c,s*=a.width/l,n*=a.height/c}const o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}class e_ extends ld{constructor(){super(new Xt(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){const t=this.camera,n=rr*2*e.angle*this.focus,s=this.mapSize.width/this.mapSize.height*this.aspect,r=e.distance||t.far;(n!==t.fov||s!==t.aspect||r!==t.far)&&(t.fov=n,t.aspect=s,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}}class t_ extends na{constructor(e,t,n=0,s=Math.PI/3,r=0,a=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(_t.DEFAULT_UP),this.updateMatrix(),this.target=new _t,this.distance=n,this.angle=s,this.penumbra=r,this.decay=a,this.map=null,this.shadow=new e_}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.map=e.map,this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.distance=this.distance,t.object.angle=this.angle,t.object.decay=this.decay,t.object.penumbra=this.penumbra,t.object.target=this.target.uuid,this.map&&this.map.isTexture&&(t.object.map=this.map.toJSON(e).uuid),t.object.shadow=this.shadow.toJSON(),t}}class n_ extends ld{constructor(){super(new Xt(90,1,.5,500)),this.isPointLightShadow=!0}}class i_ extends na{constructor(e,t,n=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new n_}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}}class Fo extends Nf{constructor(e=-1,t=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=n-e,a=n+e,o=s+t,l=s-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=u*this.view.offsetY,l=o-u*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class s_ extends ld{constructor(){super(new Fo(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class If extends na{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(_t.DEFAULT_UP),this.updateMatrix(),this.target=new _t,this.shadow=new s_}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}}class r_ extends na{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}}class Df{static extractUrlBase(e){const t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}}const Hs=-90,Ws=1;class a_ extends _t{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new Xt(Hs,Ws,e,t);s.layers=this.layers,this.add(s);const r=new Xt(Hs,Ws,e,t);r.layers=this.layers,this.add(r);const a=new Xt(Hs,Ws,e,t);a.layers=this.layers,this.add(a);const o=new Xt(Hs,Ws,e,t);o.layers=this.layers,this.add(o);const l=new Xt(Hs,Ws,e,t);l.layers=this.layers,this.add(l);const c=new Xt(Hs,Ws,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,s,r,a,o,l]=t;for(const c of t)this.remove(c);if(e===Hn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===zr)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,a,o,l,c,u]=this.children,h=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const x=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let m=!1;e.isWebGLRenderer===!0?m=e.state.buffers.depth.getReversed():m=e.reversedDepthBuffer,e.setRenderTarget(n,0,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(n,1,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(n,4,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.generateMipmaps=x,e.setRenderTarget(n,5,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,u),e.setRenderTarget(h,d,f),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class o_ extends Xt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}const Wu=new Fe;class l_{constructor(e,t,n=0,s=1/0){this.ray=new ea(e,t),this.near=n,this.far=s,this.camera=null,this.layers=new ed,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,t.projectionMatrix.elements[14]).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):He("Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return Wu.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Wu),this}intersectObject(e,t=!0,n=[]){return Nc(e,this,n,t),n.sort(Xu),n}intersectObjects(e,t=!0,n=[]){for(let s=0,r=e.length;s<r;s++)Nc(e[s],this,n,t);return n.sort(Xu),n}}function Xu(i,e){return i.distance-e.distance}function Nc(i,e,t,n){let s=!0;if(i.layers.test(e.layers)&&i.raycast(e,t)===!1&&(s=!1),s===!0&&n===!0){const r=i.children;for(let a=0,o=r.length;a<o;a++)Nc(r[a],e,t,!0)}}class qu{constructor(e=1,t=0,n=0){this.radius=e,this.phi=t,this.theta=n}set(e,t,n){return this.radius=e,this.phi=t,this.theta=n,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=qe(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,n){return this.radius=Math.sqrt(e*e+t*t+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,n),this.phi=Math.acos(qe(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}}const zd=class zd{constructor(e,t,n,s){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,s){const r=this.elements;return r[0]=e,r[2]=t,r[1]=n,r[3]=s,this}};zd.prototype.isMatrix2=!0;let $u=zd;class c_ extends id{constructor(e=10,t=10,n=4473924,s=8947848){n=new Oe(n),s=new Oe(s);const r=t/2,a=e/t,o=e/2,l=[],c=[];for(let d=0,f=0,g=-o;d<=t;d++,g+=a){l.push(-o,0,g,o,0,g),l.push(g,0,-o,g,0,o);const x=d===r?n:s;x.toArray(c,f),f+=3,x.toArray(c,f),f+=3,x.toArray(c,f),f+=3,x.toArray(c,f),f+=3}const u=new Vt;u.setAttribute("position",new Qe(l,3)),u.setAttribute("color",new Qe(c,3));const h=new Hr({vertexColors:!0,toneMapped:!1});super(u,h),this.type="GridHelper"}dispose(){this.geometry.dispose(),this.material.dispose()}}class d_ extends id{constructor(e=1){const t=[0,0,0,e,0,0,0,0,0,0,e,0,0,0,0,0,0,e],n=[1,0,0,1,.6,0,0,1,0,.6,1,0,0,0,1,0,.6,1],s=new Vt;s.setAttribute("position",new Qe(t,3)),s.setAttribute("color",new Qe(n,3));const r=new Hr({vertexColors:!0,toneMapped:!1});super(s,r),this.type="AxesHelper"}setColors(e,t,n){const s=new Oe,r=this.geometry.attributes.color.array;return s.set(e),s.toArray(r,0),s.toArray(r,3),s.set(t),s.toArray(r,6),s.toArray(r,9),s.set(n),s.toArray(r,12),s.toArray(r,15),this.geometry.attributes.color.needsUpdate=!0,this}dispose(){this.geometry.dispose(),this.material.dispose()}}class u_ extends Ki{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(e){if(e===void 0){Pe("Controls: connect() now requires an element.");return}this.domElement!==null&&this.disconnect(),this.domElement=e}disconnect(){}dispose(){}update(){}}function Yu(i,e,t,n){const s=h_(n);switch(t){case uf:return i*e;case ff:return i*e/s.components*s.byteLength;case $c:return i*e/s.components*s.byteLength;case xs:return i*e*2/s.components*s.byteLength;case Yc:return i*e*2/s.components*s.byteLength;case hf:return i*e*3/s.components*s.byteLength;case vn:return i*e*4/s.components*s.byteLength;case Kc:return i*e*4/s.components*s.byteLength;case Ja:case ja:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Qa:case eo:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Ql:case tc:return Math.max(i,16)*Math.max(e,8)/4;case jl:case ec:return Math.max(i,8)*Math.max(e,8)/2;case nc:case ic:case rc:case ac:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case sc:case oo:case oc:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case lc:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case cc:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case dc:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case uc:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case hc:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case fc:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case pc:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case mc:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case gc:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case _c:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case vc:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case xc:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case bc:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case yc:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case Mc:case Sc:case Ec:return Math.ceil(i/4)*Math.ceil(e/4)*16;case Tc:case Ac:return Math.ceil(i/4)*Math.ceil(e/4)*8;case lo:case wc:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function h_(i){switch(i){case cn:case of:return{byteLength:1,components:1};case Fr:case lf:case gi:return{byteLength:2,components:1};case Xc:case qc:return{byteLength:2,components:4};case Yn:case Wc:case Pn:return{byteLength:4,components:1};case cf:case df:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Hc}}));typeof window<"u"&&(window.__THREE__?Pe("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Hc);/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function Uf(){let i=null,e=!1,t=null,n=null;function s(r,a){t(r,a),n=i.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&i!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function f_(i){const e=new WeakMap;function t(o,l){const c=o.array,u=o.usage,h=c.byteLength,d=i.createBuffer();i.bindBuffer(l,d),i.bufferData(l,c,u),o.onUploadCallback();let f;if(c instanceof Float32Array)f=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)f=i.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?f=i.HALF_FLOAT:f=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=i.SHORT;else if(c instanceof Uint32Array)f=i.UNSIGNED_INT;else if(c instanceof Int32Array)f=i.INT;else if(c instanceof Int8Array)f=i.BYTE;else if(c instanceof Uint8Array)f=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:h}}function n(o,l,c){const u=l.array,h=l.updateRanges;if(i.bindBuffer(c,o),h.length===0)i.bufferSubData(c,0,u);else{h.sort((f,g)=>f.start-g.start);let d=0;for(let f=1;f<h.length;f++){const g=h[d],x=h[f];x.start<=g.start+g.count+1?g.count=Math.max(g.count,x.start+x.count-g.start):(++d,h[d]=x)}h.length=d+1;for(let f=0,g=h.length;f<g;f++){const x=h[f];i.bufferSubData(c,x.start*u.BYTES_PER_ELEMENT,u,x.start,x.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=e.get(o);l&&(i.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const u=e.get(o);(!u||u.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var p_=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,m_=`#ifdef USE_ALPHAHASH
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
#endif`,g_=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,__=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,v_=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,x_=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,b_=`#ifdef USE_AOMAP
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
#endif`,y_=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,M_=`#ifdef USE_BATCHING
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
#endif`,S_=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,E_=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,T_=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,A_=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,w_=`#ifdef USE_IRIDESCENCE
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
#endif`,R_=`#ifdef USE_BUMPMAP
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
#endif`,C_=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,P_=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,L_=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,N_=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,I_=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,D_=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,U_=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,F_=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,O_=`#define PI 3.141592653589793
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
} // validated`,k_=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,B_=`vec3 transformedNormal = objectNormal;
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
#endif`,z_=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,V_=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,G_=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,H_=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,W_="gl_FragColor = linearToOutputTexel( gl_FragColor );",X_=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,q_=`#ifdef USE_ENVMAP
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
#endif`,$_=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,Y_=`#ifdef USE_ENVMAP
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
#endif`,K_=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Z_=`#ifdef USE_ENVMAP
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
#endif`,J_=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,j_=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Q_=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,e0=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,t0=`#ifdef USE_GRADIENTMAP
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
}`,n0=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,i0=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,s0=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,r0=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,a0=`#ifdef USE_ENVMAP
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
#endif`,o0=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,l0=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,c0=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,d0=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,u0=`PhysicalMaterial material;
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
#endif`,h0=`uniform sampler2D dfgLUT;
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
}`,f0=`
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
#endif`,p0=`#if defined( RE_IndirectDiffuse )
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
#endif`,m0=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,g0=`#ifdef USE_LIGHT_PROBES_GRID
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
#endif`,_0=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,v0=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,x0=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,b0=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,y0=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,M0=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,S0=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,E0=`#if defined( USE_POINTS_UV )
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
#endif`,T0=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,A0=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,w0=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,R0=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,C0=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,P0=`#ifdef USE_MORPHTARGETS
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
#endif`,L0=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,N0=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,I0=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,D0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,U0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,F0=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,O0=`#ifdef USE_NORMALMAP
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
#endif`,k0=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,B0=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,z0=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,V0=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,G0=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,H0=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,W0=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,X0=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,q0=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,$0=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Y0=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,K0=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Z0=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,J0=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,j0=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,Q0=`float getShadowMask() {
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
}`,ev=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,tv=`#ifdef USE_SKINNING
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
#endif`,nv=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,iv=`#ifdef USE_SKINNING
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
#endif`,sv=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,rv=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,av=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,ov=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,lv=`#ifdef USE_TRANSMISSION
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
#endif`,cv=`#ifdef USE_TRANSMISSION
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
#endif`,dv=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,uv=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,hv=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,fv=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const pv=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,mv=`uniform sampler2D t2D;
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
}`,gv=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,_v=`#ifdef ENVMAP_TYPE_CUBE
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
}`,vv=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,xv=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,bv=`#include <common>
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
}`,yv=`#if DEPTH_PACKING == 3200
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
}`,Mv=`#define DISTANCE
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
}`,Sv=`#define DISTANCE
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
}`,Ev=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Tv=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Av=`uniform float scale;
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
}`,wv=`uniform vec3 diffuse;
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
}`,Rv=`#include <common>
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
}`,Cv=`uniform vec3 diffuse;
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
}`,Pv=`#define LAMBERT
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
}`,Lv=`#define LAMBERT
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
}`,Nv=`#define MATCAP
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
}`,Iv=`#define MATCAP
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
}`,Dv=`#define NORMAL
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
}`,Uv=`#define NORMAL
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
}`,Fv=`#define PHONG
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
}`,Ov=`#define PHONG
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
}`,kv=`#define STANDARD
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
}`,Bv=`#define STANDARD
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
}`,zv=`#define TOON
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
}`,Vv=`#define TOON
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
}`,Gv=`uniform float size;
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
}`,Hv=`uniform vec3 diffuse;
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
}`,Wv=`#include <common>
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
}`,Xv=`uniform vec3 color;
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
}`,qv=`uniform float rotation;
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
}`,$v=`uniform vec3 diffuse;
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
}`,Ge={alphahash_fragment:p_,alphahash_pars_fragment:m_,alphamap_fragment:g_,alphamap_pars_fragment:__,alphatest_fragment:v_,alphatest_pars_fragment:x_,aomap_fragment:b_,aomap_pars_fragment:y_,batching_pars_vertex:M_,batching_vertex:S_,begin_vertex:E_,beginnormal_vertex:T_,bsdfs:A_,iridescence_fragment:w_,bumpmap_pars_fragment:R_,clipping_planes_fragment:C_,clipping_planes_pars_fragment:P_,clipping_planes_pars_vertex:L_,clipping_planes_vertex:N_,color_fragment:I_,color_pars_fragment:D_,color_pars_vertex:U_,color_vertex:F_,common:O_,cube_uv_reflection_fragment:k_,defaultnormal_vertex:B_,displacementmap_pars_vertex:z_,displacementmap_vertex:V_,emissivemap_fragment:G_,emissivemap_pars_fragment:H_,colorspace_fragment:W_,colorspace_pars_fragment:X_,envmap_fragment:q_,envmap_common_pars_fragment:$_,envmap_pars_fragment:Y_,envmap_pars_vertex:K_,envmap_physical_pars_fragment:a0,envmap_vertex:Z_,fog_vertex:J_,fog_pars_vertex:j_,fog_fragment:Q_,fog_pars_fragment:e0,gradientmap_pars_fragment:t0,lightmap_pars_fragment:n0,lights_lambert_fragment:i0,lights_lambert_pars_fragment:s0,lights_pars_begin:r0,lights_toon_fragment:o0,lights_toon_pars_fragment:l0,lights_phong_fragment:c0,lights_phong_pars_fragment:d0,lights_physical_fragment:u0,lights_physical_pars_fragment:h0,lights_fragment_begin:f0,lights_fragment_maps:p0,lights_fragment_end:m0,lightprobes_pars_fragment:g0,logdepthbuf_fragment:_0,logdepthbuf_pars_fragment:v0,logdepthbuf_pars_vertex:x0,logdepthbuf_vertex:b0,map_fragment:y0,map_pars_fragment:M0,map_particle_fragment:S0,map_particle_pars_fragment:E0,metalnessmap_fragment:T0,metalnessmap_pars_fragment:A0,morphinstance_vertex:w0,morphcolor_vertex:R0,morphnormal_vertex:C0,morphtarget_pars_vertex:P0,morphtarget_vertex:L0,normal_fragment_begin:N0,normal_fragment_maps:I0,normal_pars_fragment:D0,normal_pars_vertex:U0,normal_vertex:F0,normalmap_pars_fragment:O0,clearcoat_normal_fragment_begin:k0,clearcoat_normal_fragment_maps:B0,clearcoat_pars_fragment:z0,iridescence_pars_fragment:V0,opaque_fragment:G0,packing:H0,premultiplied_alpha_fragment:W0,project_vertex:X0,dithering_fragment:q0,dithering_pars_fragment:$0,roughnessmap_fragment:Y0,roughnessmap_pars_fragment:K0,shadowmap_pars_fragment:Z0,shadowmap_pars_vertex:J0,shadowmap_vertex:j0,shadowmask_pars_fragment:Q0,skinbase_vertex:ev,skinning_pars_vertex:tv,skinning_vertex:nv,skinnormal_vertex:iv,specularmap_fragment:sv,specularmap_pars_fragment:rv,tonemapping_fragment:av,tonemapping_pars_fragment:ov,transmission_fragment:lv,transmission_pars_fragment:cv,uv_pars_fragment:dv,uv_pars_vertex:uv,uv_vertex:hv,worldpos_vertex:fv,background_vert:pv,background_frag:mv,backgroundCube_vert:gv,backgroundCube_frag:_v,cube_vert:vv,cube_frag:xv,depth_vert:bv,depth_frag:yv,distance_vert:Mv,distance_frag:Sv,equirect_vert:Ev,equirect_frag:Tv,linedashed_vert:Av,linedashed_frag:wv,meshbasic_vert:Rv,meshbasic_frag:Cv,meshlambert_vert:Pv,meshlambert_frag:Lv,meshmatcap_vert:Nv,meshmatcap_frag:Iv,meshnormal_vert:Dv,meshnormal_frag:Uv,meshphong_vert:Fv,meshphong_frag:Ov,meshphysical_vert:kv,meshphysical_frag:Bv,meshtoon_vert:zv,meshtoon_frag:Vv,points_vert:Gv,points_frag:Hv,shadow_vert:Wv,shadow_frag:Xv,sprite_vert:qv,sprite_frag:$v},me={common:{diffuse:{value:new Oe(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Be},alphaMap:{value:null},alphaMapTransform:{value:new Be},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Be}},envmap:{envMap:{value:null},envMapRotation:{value:new Be},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Be}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Be}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Be},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Be},normalScale:{value:new Ne(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Be},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Be}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Be}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Be}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Oe(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new I},probesMax:{value:new I},probesResolution:{value:new I}},points:{diffuse:{value:new Oe(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Be},alphaTest:{value:0},uvTransform:{value:new Be}},sprite:{diffuse:{value:new Oe(16777215)},opacity:{value:1},center:{value:new Ne(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Be},alphaMap:{value:null},alphaMapTransform:{value:new Be},alphaTest:{value:0}}},zn={basic:{uniforms:Zt([me.common,me.specularmap,me.envmap,me.aomap,me.lightmap,me.fog]),vertexShader:Ge.meshbasic_vert,fragmentShader:Ge.meshbasic_frag},lambert:{uniforms:Zt([me.common,me.specularmap,me.envmap,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.fog,me.lights,{emissive:{value:new Oe(0)},envMapIntensity:{value:1}}]),vertexShader:Ge.meshlambert_vert,fragmentShader:Ge.meshlambert_frag},phong:{uniforms:Zt([me.common,me.specularmap,me.envmap,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.fog,me.lights,{emissive:{value:new Oe(0)},specular:{value:new Oe(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Ge.meshphong_vert,fragmentShader:Ge.meshphong_frag},standard:{uniforms:Zt([me.common,me.envmap,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.roughnessmap,me.metalnessmap,me.fog,me.lights,{emissive:{value:new Oe(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ge.meshphysical_vert,fragmentShader:Ge.meshphysical_frag},toon:{uniforms:Zt([me.common,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.gradientmap,me.fog,me.lights,{emissive:{value:new Oe(0)}}]),vertexShader:Ge.meshtoon_vert,fragmentShader:Ge.meshtoon_frag},matcap:{uniforms:Zt([me.common,me.bumpmap,me.normalmap,me.displacementmap,me.fog,{matcap:{value:null}}]),vertexShader:Ge.meshmatcap_vert,fragmentShader:Ge.meshmatcap_frag},points:{uniforms:Zt([me.points,me.fog]),vertexShader:Ge.points_vert,fragmentShader:Ge.points_frag},dashed:{uniforms:Zt([me.common,me.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ge.linedashed_vert,fragmentShader:Ge.linedashed_frag},depth:{uniforms:Zt([me.common,me.displacementmap]),vertexShader:Ge.depth_vert,fragmentShader:Ge.depth_frag},normal:{uniforms:Zt([me.common,me.bumpmap,me.normalmap,me.displacementmap,{opacity:{value:1}}]),vertexShader:Ge.meshnormal_vert,fragmentShader:Ge.meshnormal_frag},sprite:{uniforms:Zt([me.sprite,me.fog]),vertexShader:Ge.sprite_vert,fragmentShader:Ge.sprite_frag},background:{uniforms:{uvTransform:{value:new Be},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ge.background_vert,fragmentShader:Ge.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Be}},vertexShader:Ge.backgroundCube_vert,fragmentShader:Ge.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ge.cube_vert,fragmentShader:Ge.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ge.equirect_vert,fragmentShader:Ge.equirect_frag},distance:{uniforms:Zt([me.common,me.displacementmap,{referencePosition:{value:new I},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ge.distance_vert,fragmentShader:Ge.distance_frag},shadow:{uniforms:Zt([me.lights,me.fog,{color:{value:new Oe(0)},opacity:{value:1}}]),vertexShader:Ge.shadow_vert,fragmentShader:Ge.shadow_frag}};zn.physical={uniforms:Zt([zn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Be},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Be},clearcoatNormalScale:{value:new Ne(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Be},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Be},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Be},sheen:{value:0},sheenColor:{value:new Oe(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Be},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Be},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Be},transmissionSamplerSize:{value:new Ne},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Be},attenuationDistance:{value:0},attenuationColor:{value:new Oe(0)},specularColor:{value:new Oe(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Be},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Be},anisotropyVector:{value:new Ne},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Be}}]),vertexShader:Ge.meshphysical_vert,fragmentShader:Ge.meshphysical_frag};const Oa={r:0,b:0,g:0},Yv=new Fe,Ff=new Be;Ff.set(-1,0,0,0,1,0,0,0,1);function Kv(i,e,t,n,s,r){const a=new Oe(0);let o=s===!0?0:1,l,c,u=null,h=0,d=null;function f(E){let A=E.isScene===!0?E.background:null;if(A&&A.isTexture){const b=E.backgroundBlurriness>0;A=e.get(A,b)}return A}function g(E){let A=!1;const b=f(E);b===null?m(a,o):b&&b.isColor&&(m(b,1),A=!0);const T=i.xr.getEnvironmentBlendMode();T==="additive"?t.buffers.color.setClear(0,0,0,1,r):T==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(i.autoClear||A)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function x(E,A){const b=f(A);b&&(b.isCubeTexture||b.mapping===Io)?(c===void 0&&(c=new gt(new Ts(1,1,1),new Kn({name:"BackgroundCubeMaterial",uniforms:lr(zn.backgroundCube.uniforms),vertexShader:zn.backgroundCube.vertexShader,fragmentShader:zn.backgroundCube.fragmentShader,side:nn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(T,y,w){this.matrixWorld.copyPosition(w.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=b,c.material.uniforms.backgroundBlurriness.value=A.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(Yv.makeRotationFromEuler(A.backgroundRotation)).transpose(),b.isCubeTexture&&b.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(Ff),c.material.toneMapped=Xe.getTransfer(b.colorSpace)!==tt,(u!==b||h!==b.version||d!==i.toneMapping)&&(c.material.needsUpdate=!0,u=b,h=b.version,d=i.toneMapping),c.layers.enableAll(),E.unshift(c,c.geometry,c.material,0,0,null)):b&&b.isTexture&&(l===void 0&&(l=new gt(new Do(2,2),new Kn({name:"BackgroundMaterial",uniforms:lr(zn.background.uniforms),vertexShader:zn.background.vertexShader,fragmentShader:zn.background.fragmentShader,side:mi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=b,l.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,l.material.toneMapped=Xe.getTransfer(b.colorSpace)!==tt,b.matrixAutoUpdate===!0&&b.updateMatrix(),l.material.uniforms.uvTransform.value.copy(b.matrix),(u!==b||h!==b.version||d!==i.toneMapping)&&(l.material.needsUpdate=!0,u=b,h=b.version,d=i.toneMapping),l.layers.enableAll(),E.unshift(l,l.geometry,l.material,0,0,null))}function m(E,A){E.getRGB(Oa,Rf(i)),t.buffers.color.setClear(Oa.r,Oa.g,Oa.b,A,r)}function p(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(E,A=1){a.set(E),o=A,m(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(E){o=E,m(a,o)},render:g,addToRenderList:x,dispose:p}}function Zv(i,e){const t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=d(null);let r=s,a=!1;function o(R,L,z,X,O){let N=!1;const V=h(R,X,z,L);r!==V&&(r=V,c(r.object)),N=f(R,X,z,O),N&&g(R,X,z,O),O!==null&&e.update(O,i.ELEMENT_ARRAY_BUFFER),(N||a)&&(a=!1,b(R,L,z,X),O!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(O).buffer))}function l(){return i.createVertexArray()}function c(R){return i.bindVertexArray(R)}function u(R){return i.deleteVertexArray(R)}function h(R,L,z,X){const O=X.wireframe===!0;let N=n[L.id];N===void 0&&(N={},n[L.id]=N);const V=R.isInstancedMesh===!0?R.id:0;let $=N[V];$===void 0&&($={},N[V]=$);let j=$[z.id];j===void 0&&(j={},$[z.id]=j);let re=j[O];return re===void 0&&(re=d(l()),j[O]=re),re}function d(R){const L=[],z=[],X=[];for(let O=0;O<t;O++)L[O]=0,z[O]=0,X[O]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:L,enabledAttributes:z,attributeDivisors:X,object:R,attributes:{},index:null}}function f(R,L,z,X){const O=r.attributes,N=L.attributes;let V=0;const $=z.getAttributes();for(const j in $)if($[j].location>=0){const se=O[j];let ae=N[j];if(ae===void 0&&(j==="instanceMatrix"&&R.instanceMatrix&&(ae=R.instanceMatrix),j==="instanceColor"&&R.instanceColor&&(ae=R.instanceColor)),se===void 0||se.attribute!==ae||ae&&se.data!==ae.data)return!0;V++}return r.attributesNum!==V||r.index!==X}function g(R,L,z,X){const O={},N=L.attributes;let V=0;const $=z.getAttributes();for(const j in $)if($[j].location>=0){let se=N[j];se===void 0&&(j==="instanceMatrix"&&R.instanceMatrix&&(se=R.instanceMatrix),j==="instanceColor"&&R.instanceColor&&(se=R.instanceColor));const ae={};ae.attribute=se,se&&se.data&&(ae.data=se.data),O[j]=ae,V++}r.attributes=O,r.attributesNum=V,r.index=X}function x(){const R=r.newAttributes;for(let L=0,z=R.length;L<z;L++)R[L]=0}function m(R){p(R,0)}function p(R,L){const z=r.newAttributes,X=r.enabledAttributes,O=r.attributeDivisors;z[R]=1,X[R]===0&&(i.enableVertexAttribArray(R),X[R]=1),O[R]!==L&&(i.vertexAttribDivisor(R,L),O[R]=L)}function E(){const R=r.newAttributes,L=r.enabledAttributes;for(let z=0,X=L.length;z<X;z++)L[z]!==R[z]&&(i.disableVertexAttribArray(z),L[z]=0)}function A(R,L,z,X,O,N,V){V===!0?i.vertexAttribIPointer(R,L,z,O,N):i.vertexAttribPointer(R,L,z,X,O,N)}function b(R,L,z,X){x();const O=X.attributes,N=z.getAttributes(),V=L.defaultAttributeValues;for(const $ in N){const j=N[$];if(j.location>=0){let re=O[$];if(re===void 0&&($==="instanceMatrix"&&R.instanceMatrix&&(re=R.instanceMatrix),$==="instanceColor"&&R.instanceColor&&(re=R.instanceColor)),re!==void 0){const se=re.normalized,ae=re.itemSize,xe=e.get(re);if(xe===void 0)continue;const be=xe.buffer,le=xe.type,k=xe.bytesPerElement,Z=le===i.INT||le===i.UNSIGNED_INT||re.gpuType===Wc;if(re.isInterleavedBufferAttribute){const te=re.data,Ae=te.stride,Ue=re.offset;if(te.isInstancedInterleavedBuffer){for(let Ie=0;Ie<j.locationSize;Ie++)p(j.location+Ie,te.meshPerAttribute);R.isInstancedMesh!==!0&&X._maxInstanceCount===void 0&&(X._maxInstanceCount=te.meshPerAttribute*te.count)}else for(let Ie=0;Ie<j.locationSize;Ie++)m(j.location+Ie);i.bindBuffer(i.ARRAY_BUFFER,be);for(let Ie=0;Ie<j.locationSize;Ie++)A(j.location+Ie,ae/j.locationSize,le,se,Ae*k,(Ue+ae/j.locationSize*Ie)*k,Z)}else{if(re.isInstancedBufferAttribute){for(let te=0;te<j.locationSize;te++)p(j.location+te,re.meshPerAttribute);R.isInstancedMesh!==!0&&X._maxInstanceCount===void 0&&(X._maxInstanceCount=re.meshPerAttribute*re.count)}else for(let te=0;te<j.locationSize;te++)m(j.location+te);i.bindBuffer(i.ARRAY_BUFFER,be);for(let te=0;te<j.locationSize;te++)A(j.location+te,ae/j.locationSize,le,se,ae*k,ae/j.locationSize*te*k,Z)}}else if(V!==void 0){const se=V[$];if(se!==void 0)switch(se.length){case 2:i.vertexAttrib2fv(j.location,se);break;case 3:i.vertexAttrib3fv(j.location,se);break;case 4:i.vertexAttrib4fv(j.location,se);break;default:i.vertexAttrib1fv(j.location,se)}}}}E()}function T(){M();for(const R in n){const L=n[R];for(const z in L){const X=L[z];for(const O in X){const N=X[O];for(const V in N)u(N[V].object),delete N[V];delete X[O]}}delete n[R]}}function y(R){if(n[R.id]===void 0)return;const L=n[R.id];for(const z in L){const X=L[z];for(const O in X){const N=X[O];for(const V in N)u(N[V].object),delete N[V];delete X[O]}}delete n[R.id]}function w(R){for(const L in n){const z=n[L];for(const X in z){const O=z[X];if(O[R.id]===void 0)continue;const N=O[R.id];for(const V in N)u(N[V].object),delete N[V];delete O[R.id]}}}function _(R){for(const L in n){const z=n[L],X=R.isInstancedMesh===!0?R.id:0,O=z[X];if(O!==void 0){for(const N in O){const V=O[N];for(const $ in V)u(V[$].object),delete V[$];delete O[N]}delete z[X],Object.keys(z).length===0&&delete n[L]}}}function M(){P(),a=!0,r!==s&&(r=s,c(r.object))}function P(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:M,resetDefaultState:P,dispose:T,releaseStatesOfGeometry:y,releaseStatesOfObject:_,releaseStatesOfProgram:w,initAttributes:x,enableAttribute:m,disableUnusedAttributes:E}}function Jv(i,e,t){let n;function s(l){n=l}function r(l,c){i.drawArrays(n,l,c),t.update(c,n,1)}function a(l,c,u){u!==0&&(i.drawArraysInstanced(n,l,c,u),t.update(c,n,u))}function o(l,c,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,u);let d=0;for(let f=0;f<u;f++)d+=c[f];t.update(d,n,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function jv(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){const w=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(w.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(w){return!(w!==vn&&n.convert(w)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(w){const _=w===gi&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(w!==cn&&n.convert(w)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&w!==Pn&&!_)}function l(w){if(w==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";w="mediump"}return w==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const u=l(c);u!==c&&(Pe("WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);const h=t.logarithmicDepthBuffer===!0,d=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&d===!1&&Pe("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");const f=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),x=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),p=i.getParameter(i.MAX_VERTEX_ATTRIBS),E=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),A=i.getParameter(i.MAX_VARYING_VECTORS),b=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),T=i.getParameter(i.MAX_SAMPLES),y=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:h,reversedDepthBuffer:d,maxTextures:f,maxVertexTextures:g,maxTextureSize:x,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:E,maxVaryings:A,maxFragmentUniforms:b,maxSamples:T,samples:y}}function Qv(i){const e=this;let t=null,n=0,s=!1,r=!1;const a=new Ci,o=new Be,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,d){const f=h.length!==0||d||n!==0||s;return s=d,n=h.length,f},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(h,d){t=u(h,d,0)},this.setState=function(h,d,f){const g=h.clippingPlanes,x=h.clipIntersection,m=h.clipShadows,p=i.get(h);if(!s||g===null||g.length===0||r&&!m)r?u(null):c();else{const E=r?0:n,A=E*4;let b=p.clippingState||null;l.value=b,b=u(g,d,A,f);for(let T=0;T!==A;++T)b[T]=t[T];p.clippingState=b,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=E}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function u(h,d,f,g){const x=h!==null?h.length:0;let m=null;if(x!==0){if(m=l.value,g!==!0||m===null){const p=f+x*4,E=d.matrixWorldInverse;o.getNormalMatrix(E),(m===null||m.length<p)&&(m=new Float32Array(p));for(let A=0,b=f;A!==x;++A,b+=4)a.copy(h[A]).applyMatrix4(E,o),a.normal.toArray(m,b),m[b+3]=a.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=x,e.numIntersection=0,m}}const Ui=4,Ku=[.125,.215,.35,.446,.526,.582],os=20,ex=256,xr=new Fo,Zu=new Oe;let Sl=null,El=0,Tl=0,Al=!1;const tx=new I;class Ju{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,s=100,r={}){const{size:a=256,position:o=tx}=r;Sl=this._renderer.getRenderTarget(),El=this._renderer.getActiveCubeFace(),Tl=this._renderer.getActiveMipmapLevel(),Al=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);const l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,n,s,l,o),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=eh(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Qu(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(Sl,El,Tl),this._renderer.xr.enabled=Al,e.scissorTest=!1,Xs(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===vs||e.mapping===sr?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Sl=this._renderer.getRenderTarget(),El=this._renderer.getActiveCubeFace(),Tl=this._renderer.getActiveMipmapLevel(),Al=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Rt,minFilter:Rt,generateMipmaps:!1,type:gi,format:vn,colorSpace:co,depthBuffer:!1},s=ju(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=ju(e,t,n);const{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=nx(r)),this._blurMaterial=sx(r,e,t),this._ggxMaterial=ix(r,e,t)}return s}_compileMaterial(e){const t=new gt(new Vt,e);this._renderer.compile(t,xr)}_sceneToCubeUV(e,t,n,s,r){const l=new Xt(90,1,t,n),c=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],h=this._renderer,d=h.autoClear,f=h.toneMapping;h.getClearColor(Zu),h.toneMapping=qn,h.autoClear=!1,h.state.buffers.depth.getReversed()&&(h.setRenderTarget(s),h.clearDepth(),h.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new gt(new Ts,new Gr({name:"PMREM.Background",side:nn,depthWrite:!1,depthTest:!1})));const x=this._backgroundBox,m=x.material;let p=!1;const E=e.background;E?E.isColor&&(m.color.copy(E),e.background=null,p=!0):(m.color.copy(Zu),p=!0);for(let A=0;A<6;A++){const b=A%3;b===0?(l.up.set(0,c[A],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+u[A],r.y,r.z)):b===1?(l.up.set(0,0,c[A]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+u[A],r.z)):(l.up.set(0,c[A],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+u[A]));const T=this._cubeSize;Xs(s,b*T,A>2?T:0,T,T),h.setRenderTarget(s),p&&h.render(x,l),h.render(e,l)}h.toneMapping=f,h.autoClear=d,e.background=E}_textureToCubeUV(e,t){const n=this._renderer,s=e.mapping===vs||e.mapping===sr;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=eh()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Qu());const r=s?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;const o=r.uniforms;o.envMap.value=e;const l=this._cubeSize;Xs(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(a,xr)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;const s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=n}_applyGGXFilter(e,t,n){const s=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;const l=a.uniforms,c=n/(this._lodMeshes.length-1),u=t/(this._lodMeshes.length-1),h=Math.sqrt(c*c-u*u),d=0+c*1.25,f=h*d,{_lodMax:g}=this,x=this._sizeLods[n],m=3*x*(n>g-Ui?n-g+Ui:0),p=4*(this._cubeSize-x);l.envMap.value=e.texture,l.roughness.value=f,l.mipInt.value=g-t,Xs(r,m,p,3*x,2*x),s.setRenderTarget(r),s.render(o,xr),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=g-n,Xs(e,m,p,3*x,2*x),s.setRenderTarget(e),s.render(o,xr)}_blur(e,t,n,s,r){const a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,s,"latitudinal",r),this._halfBlur(a,e,n,n,s,"longitudinal",r)}_halfBlur(e,t,n,s,r,a,o){const l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&He("blur direction must be either latitudinal or longitudinal!");const u=3,h=this._lodMeshes[s];h.material=c;const d=c.uniforms,f=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*f):2*Math.PI/(2*os-1),x=r/g,m=isFinite(r)?1+Math.floor(u*x):os;m>os&&Pe(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${os}`);const p=[];let E=0;for(let w=0;w<os;++w){const _=w/x,M=Math.exp(-_*_/2);p.push(M),w===0?E+=M:w<m&&(E+=2*M)}for(let w=0;w<p.length;w++)p[w]=p[w]/E;d.envMap.value=e.texture,d.samples.value=m,d.weights.value=p,d.latitudinal.value=a==="latitudinal",o&&(d.poleAxis.value=o);const{_lodMax:A}=this;d.dTheta.value=g,d.mipInt.value=A-n;const b=this._sizeLods[s],T=3*b*(s>A-Ui?s-A+Ui:0),y=4*(this._cubeSize-b);Xs(t,T,y,3*b,2*b),l.setRenderTarget(t),l.render(h,xr)}}function nx(i){const e=[],t=[],n=[];let s=i;const r=i-Ui+1+Ku.length;for(let a=0;a<r;a++){const o=Math.pow(2,s);e.push(o);let l=1/o;a>i-Ui?l=Ku[a-i+Ui-1]:a===0&&(l=0),t.push(l);const c=1/(o-2),u=-c,h=1+c,d=[u,u,h,u,h,h,u,u,h,h,u,h],f=6,g=6,x=3,m=2,p=1,E=new Float32Array(x*g*f),A=new Float32Array(m*g*f),b=new Float32Array(p*g*f);for(let y=0;y<f;y++){const w=y%3*2/3-1,_=y>2?0:-1,M=[w,_,0,w+2/3,_,0,w+2/3,_+1,0,w,_,0,w+2/3,_+1,0,w,_+1,0];E.set(M,x*g*y),A.set(d,m*g*y);const P=[y,y,y,y,y,y];b.set(P,p*g*y)}const T=new Vt;T.setAttribute("position",new un(E,x)),T.setAttribute("uv",new un(A,m)),T.setAttribute("faceIndex",new un(b,p)),n.push(new gt(T,null)),s>Ui&&s--}return{lodMeshes:n,sizeLods:e,sigmas:t}}function ju(i,e,t){const n=new $n(i,e,t);return n.texture.mapping=Io,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Xs(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function ix(i,e,t){return new Kn({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:ex,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Oo(),fragmentShader:`

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
		`,blending:di,depthTest:!1,depthWrite:!1})}function sx(i,e,t){const n=new Float32Array(os),s=new I(0,1,0);return new Kn({name:"SphericalGaussianBlur",defines:{n:os,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:Oo(),fragmentShader:`

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
		`,blending:di,depthTest:!1,depthWrite:!1})}function Qu(){return new Kn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Oo(),fragmentShader:`

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
		`,blending:di,depthTest:!1,depthWrite:!1})}function eh(){return new Kn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Oo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:di,depthTest:!1,depthWrite:!1})}function Oo(){return`

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
	`}class Of extends $n{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new Mf(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new Ts(5,5,5),r=new Kn({name:"CubemapFromEquirect",uniforms:lr(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:nn,blending:di});r.uniforms.tEquirect.value=t;const a=new gt(s,r),o=t.minFilter;return t.minFilter===ai&&(t.minFilter=Rt),new a_(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){const r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,s);e.setRenderTarget(r)}}function rx(i){let e=new WeakMap,t=new WeakMap,n=null;function s(d,f=!1){return d==null?null:f?a(d):r(d)}function r(d){if(d&&d.isTexture){const f=d.mapping;if(f===$o||f===Yo)if(e.has(d)){const g=e.get(d).texture;return o(g,d.mapping)}else{const g=d.image;if(g&&g.height>0){const x=new Of(g.height);return x.fromEquirectangularTexture(i,d),e.set(d,x),d.addEventListener("dispose",c),o(x.texture,d.mapping)}else return null}}return d}function a(d){if(d&&d.isTexture){const f=d.mapping,g=f===$o||f===Yo,x=f===vs||f===sr;if(g||x){let m=t.get(d);const p=m!==void 0?m.texture.pmremVersion:0;if(d.isRenderTargetTexture&&d.pmremVersion!==p)return n===null&&(n=new Ju(i)),m=g?n.fromEquirectangular(d,m):n.fromCubemap(d,m),m.texture.pmremVersion=d.pmremVersion,t.set(d,m),m.texture;if(m!==void 0)return m.texture;{const E=d.image;return g&&E&&E.height>0||x&&E&&l(E)?(n===null&&(n=new Ju(i)),m=g?n.fromEquirectangular(d):n.fromCubemap(d),m.texture.pmremVersion=d.pmremVersion,t.set(d,m),d.addEventListener("dispose",u),m.texture):null}}}return d}function o(d,f){return f===$o?d.mapping=vs:f===Yo&&(d.mapping=sr),d}function l(d){let f=0;const g=6;for(let x=0;x<g;x++)d[x]!==void 0&&f++;return f===g}function c(d){const f=d.target;f.removeEventListener("dispose",c);const g=e.get(f);g!==void 0&&(e.delete(f),g.dispose())}function u(d){const f=d.target;f.removeEventListener("dispose",u);const g=t.get(f);g!==void 0&&(t.delete(f),g.dispose())}function h(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:h}}function ax(i){const e={};function t(n){if(e[n]!==void 0)return e[n];const s=i.getExtension(n);return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const s=t(n);return s===null&&Qs("WebGLRenderer: "+n+" extension not supported."),s}}}function ox(i,e,t,n){const s={},r=new WeakMap;function a(h){const d=h.target;d.index!==null&&e.remove(d.index);for(const g in d.attributes)e.remove(d.attributes[g]);d.removeEventListener("dispose",a),delete s[d.id];const f=r.get(d);f&&(e.remove(f),r.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function o(h,d){return s[d.id]===!0||(d.addEventListener("dispose",a),s[d.id]=!0,t.memory.geometries++),d}function l(h){const d=h.attributes;for(const f in d)e.update(d[f],i.ARRAY_BUFFER)}function c(h){const d=[],f=h.index,g=h.attributes.position;let x=0;if(g===void 0)return;if(f!==null){const E=f.array;x=f.version;for(let A=0,b=E.length;A<b;A+=3){const T=E[A+0],y=E[A+1],w=E[A+2];d.push(T,y,y,w,w,T)}}else{const E=g.array;x=g.version;for(let A=0,b=E.length/3-1;A<b;A+=3){const T=A+0,y=A+1,w=A+2;d.push(T,y,y,w,w,T)}}const m=new(g.count>=65535?xf:vf)(d,1);m.version=x;const p=r.get(h);p&&e.remove(p),r.set(h,m)}function u(h){const d=r.get(h);if(d){const f=h.index;f!==null&&d.version<f.version&&c(h)}else c(h);return r.get(h)}return{get:o,update:l,getWireframeAttribute:u}}function lx(i,e,t){let n;function s(h){n=h}let r,a;function o(h){r=h.type,a=h.bytesPerElement}function l(h,d){i.drawElements(n,d,r,h*a),t.update(d,n,1)}function c(h,d,f){f!==0&&(i.drawElementsInstanced(n,d,r,h*a,f),t.update(d,n,f))}function u(h,d,f){if(f===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,d,0,r,h,0,f);let x=0;for(let m=0;m<f;m++)x+=d[m];t.update(x,n,1)}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=u}function cx(i){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(t.calls++,a){case i.TRIANGLES:t.triangles+=o*(r/3);break;case i.LINES:t.lines+=o*(r/2);break;case i.LINE_STRIP:t.lines+=o*(r-1);break;case i.LINE_LOOP:t.lines+=o*r;break;case i.POINTS:t.points+=o*r;break;default:He("WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function dx(i,e,t){const n=new WeakMap,s=new st;function r(a,o,l){const c=a.morphTargetInfluences,u=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,h=u!==void 0?u.length:0;let d=n.get(o);if(d===void 0||d.count!==h){let M=function(){w.dispose(),n.delete(o),o.removeEventListener("dispose",M)};d!==void 0&&d.texture.dispose();const f=o.morphAttributes.position!==void 0,g=o.morphAttributes.normal!==void 0,x=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],p=o.morphAttributes.normal||[],E=o.morphAttributes.color||[];let A=0;f===!0&&(A=1),g===!0&&(A=2),x===!0&&(A=3);let b=o.attributes.position.count*A,T=1;b>e.maxTextureSize&&(T=Math.ceil(b/e.maxTextureSize),b=e.maxTextureSize);const y=new Float32Array(b*T*4*h),w=new mf(y,b,T,h);w.type=Pn,w.needsUpdate=!0;const _=A*4;for(let P=0;P<h;P++){const R=m[P],L=p[P],z=E[P],X=b*T*4*P;for(let O=0;O<R.count;O++){const N=O*_;f===!0&&(s.fromBufferAttribute(R,O),y[X+N+0]=s.x,y[X+N+1]=s.y,y[X+N+2]=s.z,y[X+N+3]=0),g===!0&&(s.fromBufferAttribute(L,O),y[X+N+4]=s.x,y[X+N+5]=s.y,y[X+N+6]=s.z,y[X+N+7]=0),x===!0&&(s.fromBufferAttribute(z,O),y[X+N+8]=s.x,y[X+N+9]=s.y,y[X+N+10]=s.z,y[X+N+11]=z.itemSize===4?s.w:1)}}d={count:h,texture:w,size:new Ne(b,T)},n.set(o,d),o.addEventListener("dispose",M)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,t);else{let f=0;for(let x=0;x<c.length;x++)f+=c[x];const g=o.morphTargetsRelative?1:1-f;l.getUniforms().setValue(i,"morphTargetBaseInfluence",g),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",d.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",d.size)}return{update:r}}function ux(i,e,t,n,s){let r=new WeakMap;function a(c){const u=s.render.frame,h=c.geometry,d=e.get(c,h);if(r.get(d)!==u&&(e.update(d),r.set(d,u)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==u&&(t.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,i.ARRAY_BUFFER),r.set(c,u))),c.isSkinnedMesh){const f=c.skeleton;r.get(f)!==u&&(f.update(),r.set(f,u))}return d}function o(){r=new WeakMap}function l(c){const u=c.target;u.removeEventListener("dispose",l),n.releaseStatesOfObject(u),t.remove(u.instanceMatrix),u.instanceColor!==null&&t.remove(u.instanceColor)}return{update:a,dispose:o}}const hx={[jh]:"LINEAR_TONE_MAPPING",[Qh]:"REINHARD_TONE_MAPPING",[ef]:"CINEON_TONE_MAPPING",[tf]:"ACES_FILMIC_TONE_MAPPING",[sf]:"AGX_TONE_MAPPING",[rf]:"NEUTRAL_TONE_MAPPING",[nf]:"CUSTOM_TONE_MAPPING"};function fx(i,e,t,n,s,r){const a=new $n(e,t,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,depthTexture:s?new ar(e,t):void 0}),o=new $n(e,t,{type:gi,depthBuffer:!1,stencilBuffer:!1}),l=new Vt;l.setAttribute("position",new Qe([-1,3,0,-1,-1,0,3,-1,0],3)),l.setAttribute("uv",new Qe([0,2,0,0,2,0],2));const c=new Fg({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),u=new gt(l,c),h=new Fo(-1,1,1,-1,0,1);let d=null,f=null,g=!1,x,m=null,p=[],E=!1;this.setSize=function(A,b){a.setSize(A,b),o.setSize(A,b);for(let T=0;T<p.length;T++){const y=p[T];y.setSize&&y.setSize(A,b)}},this.setEffects=function(A){p=A,E=p.length>0&&p[0].isRenderPass===!0;const b=a.width,T=a.height;for(let y=0;y<p.length;y++){const w=p[y];w.setSize&&w.setSize(b,T)}},this.begin=function(A,b){if(g||A.toneMapping===qn&&p.length===0)return!1;if(m=b,b!==null){const T=b.width,y=b.height;(a.width!==T||a.height!==y)&&this.setSize(T,y)}return E===!1&&A.setRenderTarget(a),x=A.toneMapping,A.toneMapping=qn,!0},this.hasRenderPass=function(){return E},this.end=function(A,b){A.toneMapping=x,g=!0;let T=a,y=o;for(let w=0;w<p.length;w++){const _=p[w];if(_.enabled!==!1&&(_.render(A,y,T,b),_.needsSwap!==!1)){const M=T;T=y,y=M}}if(d!==A.outputColorSpace||f!==A.toneMapping){d=A.outputColorSpace,f=A.toneMapping,c.defines={},Xe.getTransfer(d)===tt&&(c.defines.SRGB_TRANSFER="");const w=hx[f];w&&(c.defines[w]=""),c.needsUpdate=!0}c.uniforms.tDiffuse.value=T.texture,A.setRenderTarget(m),A.render(u,h),m=null,g=!1},this.isCompositing=function(){return g},this.dispose=function(){a.depthTexture&&a.depthTexture.dispose(),a.dispose(),o.dispose(),l.dispose(),c.dispose()}}const kf=new $t,Ic=new ar(1,1),Bf=new mf,zf=new Ym,Vf=new Mf,th=[],nh=[],ih=new Float32Array(16),sh=new Float32Array(9),rh=new Float32Array(4);function hr(i,e,t){const n=i[0];if(n<=0||n>0)return i;const s=e*t;let r=th[s];if(r===void 0&&(r=new Float32Array(s),th[s]=r),e!==0){n.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,i[a].toArray(r,o)}return r}function Ct(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function Pt(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function ko(i,e){let t=nh[e];t===void 0&&(t=new Int32Array(e),nh[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function px(i,e){const t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function mx(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ct(t,e))return;i.uniform2fv(this.addr,e),Pt(t,e)}}function gx(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Ct(t,e))return;i.uniform3fv(this.addr,e),Pt(t,e)}}function _x(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ct(t,e))return;i.uniform4fv(this.addr,e),Pt(t,e)}}function vx(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Ct(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),Pt(t,e)}else{if(Ct(t,n))return;rh.set(n),i.uniformMatrix2fv(this.addr,!1,rh),Pt(t,n)}}function xx(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Ct(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),Pt(t,e)}else{if(Ct(t,n))return;sh.set(n),i.uniformMatrix3fv(this.addr,!1,sh),Pt(t,n)}}function bx(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Ct(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),Pt(t,e)}else{if(Ct(t,n))return;ih.set(n),i.uniformMatrix4fv(this.addr,!1,ih),Pt(t,n)}}function yx(i,e){const t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function Mx(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ct(t,e))return;i.uniform2iv(this.addr,e),Pt(t,e)}}function Sx(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Ct(t,e))return;i.uniform3iv(this.addr,e),Pt(t,e)}}function Ex(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ct(t,e))return;i.uniform4iv(this.addr,e),Pt(t,e)}}function Tx(i,e){const t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function Ax(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ct(t,e))return;i.uniform2uiv(this.addr,e),Pt(t,e)}}function wx(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Ct(t,e))return;i.uniform3uiv(this.addr,e),Pt(t,e)}}function Rx(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ct(t,e))return;i.uniform4uiv(this.addr,e),Pt(t,e)}}function Cx(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(Ic.compareFunction=t.isReversedDepthBuffer()?Jc:Zc,r=Ic):r=kf,t.setTexture2D(e||r,s)}function Px(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||zf,s)}function Lx(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||Vf,s)}function Nx(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||Bf,s)}function Ix(i){switch(i){case 5126:return px;case 35664:return mx;case 35665:return gx;case 35666:return _x;case 35674:return vx;case 35675:return xx;case 35676:return bx;case 5124:case 35670:return yx;case 35667:case 35671:return Mx;case 35668:case 35672:return Sx;case 35669:case 35673:return Ex;case 5125:return Tx;case 36294:return Ax;case 36295:return wx;case 36296:return Rx;case 35678:case 36198:case 36298:case 36306:case 35682:return Cx;case 35679:case 36299:case 36307:return Px;case 35680:case 36300:case 36308:case 36293:return Lx;case 36289:case 36303:case 36311:case 36292:return Nx}}function Dx(i,e){i.uniform1fv(this.addr,e)}function Ux(i,e){const t=hr(e,this.size,2);i.uniform2fv(this.addr,t)}function Fx(i,e){const t=hr(e,this.size,3);i.uniform3fv(this.addr,t)}function Ox(i,e){const t=hr(e,this.size,4);i.uniform4fv(this.addr,t)}function kx(i,e){const t=hr(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function Bx(i,e){const t=hr(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function zx(i,e){const t=hr(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function Vx(i,e){i.uniform1iv(this.addr,e)}function Gx(i,e){i.uniform2iv(this.addr,e)}function Hx(i,e){i.uniform3iv(this.addr,e)}function Wx(i,e){i.uniform4iv(this.addr,e)}function Xx(i,e){i.uniform1uiv(this.addr,e)}function qx(i,e){i.uniform2uiv(this.addr,e)}function $x(i,e){i.uniform3uiv(this.addr,e)}function Yx(i,e){i.uniform4uiv(this.addr,e)}function Kx(i,e,t){const n=this.cache,s=e.length,r=ko(t,s);Ct(n,r)||(i.uniform1iv(this.addr,r),Pt(n,r));let a;this.type===i.SAMPLER_2D_SHADOW?a=Ic:a=kf;for(let o=0;o!==s;++o)t.setTexture2D(e[o]||a,r[o])}function Zx(i,e,t){const n=this.cache,s=e.length,r=ko(t,s);Ct(n,r)||(i.uniform1iv(this.addr,r),Pt(n,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||zf,r[a])}function Jx(i,e,t){const n=this.cache,s=e.length,r=ko(t,s);Ct(n,r)||(i.uniform1iv(this.addr,r),Pt(n,r));for(let a=0;a!==s;++a)t.setTextureCube(e[a]||Vf,r[a])}function jx(i,e,t){const n=this.cache,s=e.length,r=ko(t,s);Ct(n,r)||(i.uniform1iv(this.addr,r),Pt(n,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||Bf,r[a])}function Qx(i){switch(i){case 5126:return Dx;case 35664:return Ux;case 35665:return Fx;case 35666:return Ox;case 35674:return kx;case 35675:return Bx;case 35676:return zx;case 5124:case 35670:return Vx;case 35667:case 35671:return Gx;case 35668:case 35672:return Hx;case 35669:case 35673:return Wx;case 5125:return Xx;case 36294:return qx;case 36295:return $x;case 36296:return Yx;case 35678:case 36198:case 36298:case 36306:case 35682:return Kx;case 35679:case 36299:case 36307:return Zx;case 35680:case 36300:case 36308:case 36293:return Jx;case 36289:case 36303:case 36311:case 36292:return jx}}class eb{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Ix(t.type)}}class tb{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Qx(t.type)}}class nb{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const s=this.seq;for(let r=0,a=s.length;r!==a;++r){const o=s[r];o.setValue(e,t[o.id],n)}}}const wl=/(\w+)(\])?(\[|\.)?/g;function ah(i,e){i.seq.push(e),i.map[e.id]=e}function ib(i,e,t){const n=i.name,s=n.length;for(wl.lastIndex=0;;){const r=wl.exec(n),a=wl.lastIndex;let o=r[1];const l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){ah(t,c===void 0?new eb(o,i,e):new tb(o,i,e));break}else{let h=t.map[o];h===void 0&&(h=new nb(o),ah(t,h)),t=h}}}class to{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<n;++a){const o=e.getActiveUniform(t,a),l=e.getUniformLocation(t,o.name);ib(o,l,this)}const s=[],r=[];for(const a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,n,s){const r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){const s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,a=t.length;r!==a;++r){const o=t[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,s)}}static seqWithValue(e,t){const n=[];for(let s=0,r=e.length;s!==r;++s){const a=e[s];a.id in t&&n.push(a)}return n}}function oh(i,e,t){const n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}const sb=37297;let rb=0;function ab(i,e){const t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){const o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}const lh=new Be;function ob(i){Xe._getMatrix(lh,Xe.workingColorSpace,i);const e=`mat3( ${lh.elements.map(t=>t.toFixed(4))} )`;switch(Xe.getTransfer(i)){case uo:return[e,"LinearTransferOETF"];case tt:return[e,"sRGBTransferOETF"];default:return Pe("WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function ch(i,e,t){const n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";const a=/ERROR: 0:(\d+)/.exec(r);if(a){const o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+ab(i.getShaderSource(e),o)}else return r}function lb(i,e){const t=ob(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}const cb={[jh]:"Linear",[Qh]:"Reinhard",[ef]:"Cineon",[tf]:"ACESFilmic",[sf]:"AgX",[rf]:"Neutral",[nf]:"Custom"};function db(i,e){const t=cb[e];return t===void 0?(Pe("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const ka=new I;function ub(){Xe.getLuminanceCoefficients(ka);const i=ka.x.toFixed(4),e=ka.y.toFixed(4),t=ka.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function hb(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Er).join(`
`)}function fb(i){const e=[];for(const t in i){const n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function pb(i,e){const t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){const r=i.getActiveAttrib(e,s),a=r.name;let o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:i.getAttribLocation(e,a),locationSize:o}}return t}function Er(i){return i!==""}function dh(i,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function uh(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const mb=/^[ \t]*#include +<([\w\d./]+)>/gm;function Dc(i){return i.replace(mb,_b)}const gb=new Map;function _b(i,e){let t=Ge[e];if(t===void 0){const n=gb.get(e);if(n!==void 0)t=Ge[n],Pe('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return Dc(t)}const vb=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function hh(i){return i.replace(vb,xb)}function xb(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function fh(i){let e=`precision ${i.precision} float;
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
#define LOW_PRECISION`),e}const bb={[Za]:"SHADOWMAP_TYPE_PCF",[Mr]:"SHADOWMAP_TYPE_VSM"};function yb(i){return bb[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const Mb={[vs]:"ENVMAP_TYPE_CUBE",[sr]:"ENVMAP_TYPE_CUBE",[Io]:"ENVMAP_TYPE_CUBE_UV"};function Sb(i){return i.envMap===!1?"ENVMAP_TYPE_CUBE":Mb[i.envMapMode]||"ENVMAP_TYPE_CUBE"}const Eb={[sr]:"ENVMAP_MODE_REFRACTION"};function Tb(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":Eb[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}const Ab={[No]:"ENVMAP_BLENDING_MULTIPLY",[cm]:"ENVMAP_BLENDING_MIX",[dm]:"ENVMAP_BLENDING_ADD"};function wb(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":Ab[i.combine]||"ENVMAP_BLENDING_NONE"}function Rb(i){const e=i.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),7*16)),texelHeight:n,maxMip:t}}function Cb(i,e,t,n){const s=i.getContext(),r=t.defines;let a=t.vertexShader,o=t.fragmentShader;const l=yb(t),c=Sb(t),u=Tb(t),h=wb(t),d=Rb(t),f=hb(t),g=fb(r),x=s.createProgram();let m,p,E=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Er).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Er).join(`
`),p.length>0&&(p+=`
`)):(m=[fh(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Er).join(`
`),p=[fh(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+h:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==qn?"#define TONE_MAPPING":"",t.toneMapping!==qn?Ge.tonemapping_pars_fragment:"",t.toneMapping!==qn?db("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Ge.colorspace_pars_fragment,lb("linearToOutputTexel",t.outputColorSpace),ub(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Er).join(`
`)),a=Dc(a),a=dh(a,t),a=uh(a,t),o=Dc(o),o=dh(o,t),o=uh(o,t),a=hh(a),o=hh(o),t.isRawShaderMaterial!==!0&&(E=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",t.glslVersion===au?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===au?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);const A=E+m+a,b=E+p+o,T=oh(s,s.VERTEX_SHADER,A),y=oh(s,s.FRAGMENT_SHADER,b);s.attachShader(x,T),s.attachShader(x,y),t.index0AttributeName!==void 0?s.bindAttribLocation(x,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(x,0,"position"),s.linkProgram(x);function w(R){if(i.debug.checkShaderErrors){const L=s.getProgramInfoLog(x)||"",z=s.getShaderInfoLog(T)||"",X=s.getShaderInfoLog(y)||"",O=L.trim(),N=z.trim(),V=X.trim();let $=!0,j=!0;if(s.getProgramParameter(x,s.LINK_STATUS)===!1)if($=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,x,T,y);else{const re=ch(s,T,"vertex"),se=ch(s,y,"fragment");He("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(x,s.VALIDATE_STATUS)+`

Material Name: `+R.name+`
Material Type: `+R.type+`

Program Info Log: `+O+`
`+re+`
`+se)}else O!==""?Pe("WebGLProgram: Program Info Log:",O):(N===""||V==="")&&(j=!1);j&&(R.diagnostics={runnable:$,programLog:O,vertexShader:{log:N,prefix:m},fragmentShader:{log:V,prefix:p}})}s.deleteShader(T),s.deleteShader(y),_=new to(s,x),M=pb(s,x)}let _;this.getUniforms=function(){return _===void 0&&w(this),_};let M;this.getAttributes=function(){return M===void 0&&w(this),M};let P=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return P===!1&&(P=s.getProgramParameter(x,sb)),P},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(x),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=rb++,this.cacheKey=e,this.usedTimes=1,this.program=x,this.vertexShader=T,this.fragmentShader=y,this}let Pb=0;class Lb{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){const s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new Nb(e),t.set(e,n)),n}}class Nb{constructor(e){this.id=Pb++,this.code=e,this.usedTimes=0}}function Ib(i){return i===xs||i===oo||i===lo}function Db(i,e,t,n,s,r){const a=new ed,o=new Lb,l=new Set,c=[],u=new Map,h=n.logarithmicDepthBuffer;let d=n.precision;const f={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(_){return l.add(_),_===0?"uv":`uv${_}`}function x(_,M,P,R,L,z){const X=R.fog,O=L.geometry,N=_.isMeshStandardMaterial||_.isMeshLambertMaterial||_.isMeshPhongMaterial?R.environment:null,V=_.isMeshStandardMaterial||_.isMeshLambertMaterial&&!_.envMap||_.isMeshPhongMaterial&&!_.envMap,$=e.get(_.envMap||N,V),j=$&&$.mapping===Io?$.image.height:null,re=f[_.type];_.precision!==null&&(d=n.getMaxPrecision(_.precision),d!==_.precision&&Pe("WebGLProgram.getParameters:",_.precision,"not supported, using",d,"instead."));const se=O.morphAttributes.position||O.morphAttributes.normal||O.morphAttributes.color,ae=se!==void 0?se.length:0;let xe=0;O.morphAttributes.position!==void 0&&(xe=1),O.morphAttributes.normal!==void 0&&(xe=2),O.morphAttributes.color!==void 0&&(xe=3);let be,le,k,Z;if(re){const Se=zn[re];be=Se.vertexShader,le=Se.fragmentShader}else{be=_.vertexShader,le=_.fragmentShader;const Se=o.getVertexShaderStage(_),ft=o.getFragmentShaderStage(_);o.update(_,Se,ft),k=Se.id,Z=ft.id}const te=i.getRenderTarget(),Ae=i.state.buffers.depth.getReversed(),Ue=L.isInstancedMesh===!0,Ie=L.isBatchedMesh===!0,vt=!!_.map,$e=!!_.matcap,rt=!!$,Je=!!_.aoMap,Ye=!!_.lightMap,yt=!!_.bumpMap&&_.wireframe===!1,Et=!!_.normalMap,Lt=!!_.displacementMap,Ut=!!_.emissiveMap,ht=!!_.metalnessMap,Mt=!!_.roughnessMap,U=_.anisotropy>0,Qt=_.clearcoat>0,et=_.dispersion>0,C=_.iridescence>0,v=_.sheen>0,B=_.transmission>0,W=U&&!!_.anisotropyMap,Y=Qt&&!!_.clearcoatMap,oe=Qt&&!!_.clearcoatNormalMap,de=Qt&&!!_.clearcoatRoughnessMap,K=C&&!!_.iridescenceMap,ee=C&&!!_.iridescenceThicknessMap,ue=v&&!!_.sheenColorMap,we=v&&!!_.sheenRoughnessMap,pe=!!_.specularMap,he=!!_.specularColorMap,Le=!!_.specularIntensityMap,De=B&&!!_.transmissionMap,ze=B&&!!_.thicknessMap,D=!!_.gradientMap,ce=!!_.alphaMap,Q=_.alphaTest>0,fe=!!_.alphaHash,ve=!!_.extensions;let ie=qn;_.toneMapped&&(te===null||te.isXRRenderTarget===!0)&&(ie=i.toneMapping);const Te={shaderID:re,shaderType:_.type,shaderName:_.name,vertexShader:be,fragmentShader:le,defines:_.defines,customVertexShaderID:k,customFragmentShaderID:Z,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:d,batching:Ie,batchingColor:Ie&&L._colorsTexture!==null,instancing:Ue,instancingColor:Ue&&L.instanceColor!==null,instancingMorph:Ue&&L.morphTexture!==null,outputColorSpace:te===null?i.outputColorSpace:te.isXRRenderTarget===!0?te.texture.colorSpace:Xe.workingColorSpace,alphaToCoverage:!!_.alphaToCoverage,map:vt,matcap:$e,envMap:rt,envMapMode:rt&&$.mapping,envMapCubeUVHeight:j,aoMap:Je,lightMap:Ye,bumpMap:yt,normalMap:Et,displacementMap:Lt,emissiveMap:Ut,normalMapObjectSpace:Et&&_.normalMapType===mm,normalMapTangentSpace:Et&&_.normalMapType===Br,packedNormalMap:Et&&_.normalMapType===Br&&Ib(_.normalMap.format),metalnessMap:ht,roughnessMap:Mt,anisotropy:U,anisotropyMap:W,clearcoat:Qt,clearcoatMap:Y,clearcoatNormalMap:oe,clearcoatRoughnessMap:de,dispersion:et,iridescence:C,iridescenceMap:K,iridescenceThicknessMap:ee,sheen:v,sheenColorMap:ue,sheenRoughnessMap:we,specularMap:pe,specularColorMap:he,specularIntensityMap:Le,transmission:B,transmissionMap:De,thicknessMap:ze,gradientMap:D,opaque:_.transparent===!1&&_.blending===js&&_.alphaToCoverage===!1,alphaMap:ce,alphaTest:Q,alphaHash:fe,combine:_.combine,mapUv:vt&&g(_.map.channel),aoMapUv:Je&&g(_.aoMap.channel),lightMapUv:Ye&&g(_.lightMap.channel),bumpMapUv:yt&&g(_.bumpMap.channel),normalMapUv:Et&&g(_.normalMap.channel),displacementMapUv:Lt&&g(_.displacementMap.channel),emissiveMapUv:Ut&&g(_.emissiveMap.channel),metalnessMapUv:ht&&g(_.metalnessMap.channel),roughnessMapUv:Mt&&g(_.roughnessMap.channel),anisotropyMapUv:W&&g(_.anisotropyMap.channel),clearcoatMapUv:Y&&g(_.clearcoatMap.channel),clearcoatNormalMapUv:oe&&g(_.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:de&&g(_.clearcoatRoughnessMap.channel),iridescenceMapUv:K&&g(_.iridescenceMap.channel),iridescenceThicknessMapUv:ee&&g(_.iridescenceThicknessMap.channel),sheenColorMapUv:ue&&g(_.sheenColorMap.channel),sheenRoughnessMapUv:we&&g(_.sheenRoughnessMap.channel),specularMapUv:pe&&g(_.specularMap.channel),specularColorMapUv:he&&g(_.specularColorMap.channel),specularIntensityMapUv:Le&&g(_.specularIntensityMap.channel),transmissionMapUv:De&&g(_.transmissionMap.channel),thicknessMapUv:ze&&g(_.thicknessMap.channel),alphaMapUv:ce&&g(_.alphaMap.channel),vertexTangents:!!O.attributes.tangent&&(Et||U),vertexNormals:!!O.attributes.normal,vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!O.attributes.color&&O.attributes.color.itemSize===4,pointsUvs:L.isPoints===!0&&!!O.attributes.uv&&(vt||ce),fog:!!X,useFog:_.fog===!0,fogExp2:!!X&&X.isFogExp2,flatShading:_.wireframe===!1&&(_.flatShading===!0||O.attributes.normal===void 0&&Et===!1&&(_.isMeshLambertMaterial||_.isMeshPhongMaterial||_.isMeshStandardMaterial||_.isMeshPhysicalMaterial)),sizeAttenuation:_.sizeAttenuation===!0,logarithmicDepthBuffer:h,reversedDepthBuffer:Ae,skinning:L.isSkinnedMesh===!0,hasPositionAttribute:O.attributes.position!==void 0,morphTargets:O.morphAttributes.position!==void 0,morphNormals:O.morphAttributes.normal!==void 0,morphColors:O.morphAttributes.color!==void 0,morphTargetsCount:ae,morphTextureStride:xe,numDirLights:M.directional.length,numPointLights:M.point.length,numSpotLights:M.spot.length,numSpotLightMaps:M.spotLightMap.length,numRectAreaLights:M.rectArea.length,numHemiLights:M.hemi.length,numDirLightShadows:M.directionalShadowMap.length,numPointLightShadows:M.pointShadowMap.length,numSpotLightShadows:M.spotShadowMap.length,numSpotLightShadowsWithMaps:M.numSpotLightShadowsWithMaps,numLightProbes:M.numLightProbes,numLightProbeGrids:z.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:_.dithering,shadowMapEnabled:i.shadowMap.enabled&&P.length>0,shadowMapType:i.shadowMap.type,toneMapping:ie,decodeVideoTexture:vt&&_.map.isVideoTexture===!0&&Xe.getTransfer(_.map.colorSpace)===tt,decodeVideoTextureEmissive:Ut&&_.emissiveMap.isVideoTexture===!0&&Xe.getTransfer(_.emissiveMap.colorSpace)===tt,premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===Rn,flipSided:_.side===nn,useDepthPacking:_.depthPacking>=0,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionClipCullDistance:ve&&_.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ve&&_.extensions.multiDraw===!0||Ie)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:_.customProgramCacheKey()};return Te.vertexUv1s=l.has(1),Te.vertexUv2s=l.has(2),Te.vertexUv3s=l.has(3),l.clear(),Te}function m(_){const M=[];if(_.shaderID?M.push(_.shaderID):(M.push(_.customVertexShaderID),M.push(_.customFragmentShaderID)),_.defines!==void 0)for(const P in _.defines)M.push(P),M.push(_.defines[P]);return _.isRawShaderMaterial===!1&&(p(M,_),E(M,_),M.push(i.outputColorSpace)),M.push(_.customProgramCacheKey),M.join()}function p(_,M){_.push(M.precision),_.push(M.outputColorSpace),_.push(M.envMapMode),_.push(M.envMapCubeUVHeight),_.push(M.mapUv),_.push(M.alphaMapUv),_.push(M.lightMapUv),_.push(M.aoMapUv),_.push(M.bumpMapUv),_.push(M.normalMapUv),_.push(M.displacementMapUv),_.push(M.emissiveMapUv),_.push(M.metalnessMapUv),_.push(M.roughnessMapUv),_.push(M.anisotropyMapUv),_.push(M.clearcoatMapUv),_.push(M.clearcoatNormalMapUv),_.push(M.clearcoatRoughnessMapUv),_.push(M.iridescenceMapUv),_.push(M.iridescenceThicknessMapUv),_.push(M.sheenColorMapUv),_.push(M.sheenRoughnessMapUv),_.push(M.specularMapUv),_.push(M.specularColorMapUv),_.push(M.specularIntensityMapUv),_.push(M.transmissionMapUv),_.push(M.thicknessMapUv),_.push(M.combine),_.push(M.fogExp2),_.push(M.sizeAttenuation),_.push(M.morphTargetsCount),_.push(M.morphAttributeCount),_.push(M.numDirLights),_.push(M.numPointLights),_.push(M.numSpotLights),_.push(M.numSpotLightMaps),_.push(M.numHemiLights),_.push(M.numRectAreaLights),_.push(M.numDirLightShadows),_.push(M.numPointLightShadows),_.push(M.numSpotLightShadows),_.push(M.numSpotLightShadowsWithMaps),_.push(M.numLightProbes),_.push(M.shadowMapType),_.push(M.toneMapping),_.push(M.numClippingPlanes),_.push(M.numClipIntersection),_.push(M.depthPacking)}function E(_,M){a.disableAll(),M.instancing&&a.enable(0),M.instancingColor&&a.enable(1),M.instancingMorph&&a.enable(2),M.matcap&&a.enable(3),M.envMap&&a.enable(4),M.normalMapObjectSpace&&a.enable(5),M.normalMapTangentSpace&&a.enable(6),M.clearcoat&&a.enable(7),M.iridescence&&a.enable(8),M.alphaTest&&a.enable(9),M.vertexColors&&a.enable(10),M.vertexAlphas&&a.enable(11),M.vertexUv1s&&a.enable(12),M.vertexUv2s&&a.enable(13),M.vertexUv3s&&a.enable(14),M.vertexTangents&&a.enable(15),M.anisotropy&&a.enable(16),M.alphaHash&&a.enable(17),M.batching&&a.enable(18),M.dispersion&&a.enable(19),M.batchingColor&&a.enable(20),M.gradientMap&&a.enable(21),M.packedNormalMap&&a.enable(22),M.vertexNormals&&a.enable(23),_.push(a.mask),a.disableAll(),M.fog&&a.enable(0),M.useFog&&a.enable(1),M.flatShading&&a.enable(2),M.logarithmicDepthBuffer&&a.enable(3),M.reversedDepthBuffer&&a.enable(4),M.skinning&&a.enable(5),M.morphTargets&&a.enable(6),M.morphNormals&&a.enable(7),M.morphColors&&a.enable(8),M.premultipliedAlpha&&a.enable(9),M.shadowMapEnabled&&a.enable(10),M.doubleSided&&a.enable(11),M.flipSided&&a.enable(12),M.useDepthPacking&&a.enable(13),M.dithering&&a.enable(14),M.transmission&&a.enable(15),M.sheen&&a.enable(16),M.opaque&&a.enable(17),M.pointsUvs&&a.enable(18),M.decodeVideoTexture&&a.enable(19),M.decodeVideoTextureEmissive&&a.enable(20),M.alphaToCoverage&&a.enable(21),M.numLightProbeGrids>0&&a.enable(22),M.hasPositionAttribute&&a.enable(23),_.push(a.mask)}function A(_){const M=f[_.type];let P;if(M){const R=zn[M];P=Ig.clone(R.uniforms)}else P=_.uniforms;return P}function b(_,M){let P=u.get(M);return P!==void 0?++P.usedTimes:(P=new Cb(i,M,_,s),c.push(P),u.set(M,P)),P}function T(_){if(--_.usedTimes===0){const M=c.indexOf(_);c[M]=c[c.length-1],c.pop(),u.delete(_.cacheKey),_.destroy()}}function y(_){o.remove(_)}function w(){o.dispose()}return{getParameters:x,getProgramCacheKey:m,getUniforms:A,acquireProgram:b,releaseProgram:T,releaseShaderCache:y,programs:c,dispose:w}}function Ub(){let i=new WeakMap;function e(a){return i.has(a)}function t(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,l){i.get(a)[o]=l}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function Fb(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.materialVariant!==e.materialVariant?i.materialVariant-e.materialVariant:i.z!==e.z?i.z-e.z:i.id-e.id}function ph(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function mh(){const i=[];let e=0;const t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function a(d){let f=0;return d.isInstancedMesh&&(f+=2),d.isSkinnedMesh&&(f+=1),f}function o(d,f,g,x,m,p){let E=i[e];return E===void 0?(E={id:d.id,object:d,geometry:f,material:g,materialVariant:a(d),groupOrder:x,renderOrder:d.renderOrder,z:m,group:p},i[e]=E):(E.id=d.id,E.object=d,E.geometry=f,E.material=g,E.materialVariant=a(d),E.groupOrder=x,E.renderOrder=d.renderOrder,E.z=m,E.group=p),e++,E}function l(d,f,g,x,m,p){const E=o(d,f,g,x,m,p);g.transmission>0?n.push(E):g.transparent===!0?s.push(E):t.push(E)}function c(d,f,g,x,m,p){const E=o(d,f,g,x,m,p);g.transmission>0?n.unshift(E):g.transparent===!0?s.unshift(E):t.unshift(E)}function u(d,f,g){t.length>1&&t.sort(d||Fb),n.length>1&&n.sort(f||ph),s.length>1&&s.sort(f||ph),g&&(t.reverse(),n.reverse(),s.reverse())}function h(){for(let d=e,f=i.length;d<f;d++){const g=i[d];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:l,unshift:c,finish:h,sort:u}}function Ob(){let i=new WeakMap;function e(n,s){const r=i.get(n);let a;return r===void 0?(a=new mh,i.set(n,[a])):s>=r.length?(a=new mh,r.push(a)):a=r[s],a}function t(){i=new WeakMap}return{get:e,dispose:t}}function kb(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new I,color:new Oe};break;case"SpotLight":t={position:new I,direction:new I,color:new Oe,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new I,color:new Oe,distance:0,decay:0};break;case"HemisphereLight":t={direction:new I,skyColor:new Oe,groundColor:new Oe};break;case"RectAreaLight":t={color:new Oe,position:new I,halfWidth:new I,halfHeight:new I};break}return i[e.id]=t,t}}}function Bb(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ne};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ne};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ne,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}let zb=0;function Vb(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function Gb(i){const e=new kb,t=Bb(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new I);const s=new I,r=new Fe,a=new Fe;function o(c){let u=0,h=0,d=0;for(let M=0;M<9;M++)n.probe[M].set(0,0,0);let f=0,g=0,x=0,m=0,p=0,E=0,A=0,b=0,T=0,y=0,w=0;c.sort(Vb);for(let M=0,P=c.length;M<P;M++){const R=c[M],L=R.color,z=R.intensity,X=R.distance;let O=null;if(R.shadow&&R.shadow.map&&(R.shadow.map.texture.format===xs?O=R.shadow.map.texture:O=R.shadow.map.depthTexture||R.shadow.map.texture),R.isAmbientLight)u+=L.r*z,h+=L.g*z,d+=L.b*z;else if(R.isLightProbe){for(let N=0;N<9;N++)n.probe[N].addScaledVector(R.sh.coefficients[N],z);w++}else if(R.isDirectionalLight){const N=e.get(R);if(N.color.copy(R.color).multiplyScalar(R.intensity),R.castShadow){const V=R.shadow,$=t.get(R);$.shadowIntensity=V.intensity,$.shadowBias=V.bias,$.shadowNormalBias=V.normalBias,$.shadowRadius=V.radius,$.shadowMapSize=V.mapSize,n.directionalShadow[f]=$,n.directionalShadowMap[f]=O,n.directionalShadowMatrix[f]=R.shadow.matrix,E++}n.directional[f]=N,f++}else if(R.isSpotLight){const N=e.get(R);N.position.setFromMatrixPosition(R.matrixWorld),N.color.copy(L).multiplyScalar(z),N.distance=X,N.coneCos=Math.cos(R.angle),N.penumbraCos=Math.cos(R.angle*(1-R.penumbra)),N.decay=R.decay,n.spot[x]=N;const V=R.shadow;if(R.map&&(n.spotLightMap[T]=R.map,T++,V.updateMatrices(R),R.castShadow&&y++),n.spotLightMatrix[x]=V.matrix,R.castShadow){const $=t.get(R);$.shadowIntensity=V.intensity,$.shadowBias=V.bias,$.shadowNormalBias=V.normalBias,$.shadowRadius=V.radius,$.shadowMapSize=V.mapSize,n.spotShadow[x]=$,n.spotShadowMap[x]=O,b++}x++}else if(R.isRectAreaLight){const N=e.get(R);N.color.copy(L).multiplyScalar(z),N.halfWidth.set(R.width*.5,0,0),N.halfHeight.set(0,R.height*.5,0),n.rectArea[m]=N,m++}else if(R.isPointLight){const N=e.get(R);if(N.color.copy(R.color).multiplyScalar(R.intensity),N.distance=R.distance,N.decay=R.decay,R.castShadow){const V=R.shadow,$=t.get(R);$.shadowIntensity=V.intensity,$.shadowBias=V.bias,$.shadowNormalBias=V.normalBias,$.shadowRadius=V.radius,$.shadowMapSize=V.mapSize,$.shadowCameraNear=V.camera.near,$.shadowCameraFar=V.camera.far,n.pointShadow[g]=$,n.pointShadowMap[g]=O,n.pointShadowMatrix[g]=R.shadow.matrix,A++}n.point[g]=N,g++}else if(R.isHemisphereLight){const N=e.get(R);N.skyColor.copy(R.color).multiplyScalar(z),N.groundColor.copy(R.groundColor).multiplyScalar(z),n.hemi[p]=N,p++}}m>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=me.LTC_FLOAT_1,n.rectAreaLTC2=me.LTC_FLOAT_2):(n.rectAreaLTC1=me.LTC_HALF_1,n.rectAreaLTC2=me.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=h,n.ambient[2]=d;const _=n.hash;(_.directionalLength!==f||_.pointLength!==g||_.spotLength!==x||_.rectAreaLength!==m||_.hemiLength!==p||_.numDirectionalShadows!==E||_.numPointShadows!==A||_.numSpotShadows!==b||_.numSpotMaps!==T||_.numLightProbes!==w)&&(n.directional.length=f,n.spot.length=x,n.rectArea.length=m,n.point.length=g,n.hemi.length=p,n.directionalShadow.length=E,n.directionalShadowMap.length=E,n.pointShadow.length=A,n.pointShadowMap.length=A,n.spotShadow.length=b,n.spotShadowMap.length=b,n.directionalShadowMatrix.length=E,n.pointShadowMatrix.length=A,n.spotLightMatrix.length=b+T-y,n.spotLightMap.length=T,n.numSpotLightShadowsWithMaps=y,n.numLightProbes=w,_.directionalLength=f,_.pointLength=g,_.spotLength=x,_.rectAreaLength=m,_.hemiLength=p,_.numDirectionalShadows=E,_.numPointShadows=A,_.numSpotShadows=b,_.numSpotMaps=T,_.numLightProbes=w,n.version=zb++)}function l(c,u){let h=0,d=0,f=0,g=0,x=0;const m=u.matrixWorldInverse;for(let p=0,E=c.length;p<E;p++){const A=c[p];if(A.isDirectionalLight){const b=n.directional[h];b.direction.setFromMatrixPosition(A.matrixWorld),s.setFromMatrixPosition(A.target.matrixWorld),b.direction.sub(s),b.direction.transformDirection(m),h++}else if(A.isSpotLight){const b=n.spot[f];b.position.setFromMatrixPosition(A.matrixWorld),b.position.applyMatrix4(m),b.direction.setFromMatrixPosition(A.matrixWorld),s.setFromMatrixPosition(A.target.matrixWorld),b.direction.sub(s),b.direction.transformDirection(m),f++}else if(A.isRectAreaLight){const b=n.rectArea[g];b.position.setFromMatrixPosition(A.matrixWorld),b.position.applyMatrix4(m),a.identity(),r.copy(A.matrixWorld),r.premultiply(m),a.extractRotation(r),b.halfWidth.set(A.width*.5,0,0),b.halfHeight.set(0,A.height*.5,0),b.halfWidth.applyMatrix4(a),b.halfHeight.applyMatrix4(a),g++}else if(A.isPointLight){const b=n.point[d];b.position.setFromMatrixPosition(A.matrixWorld),b.position.applyMatrix4(m),d++}else if(A.isHemisphereLight){const b=n.hemi[x];b.direction.setFromMatrixPosition(A.matrixWorld),b.direction.transformDirection(m),x++}}}return{setup:o,setupView:l,state:n}}function gh(i){const e=new Gb(i),t=[],n=[],s=[];function r(d){h.camera=d,t.length=0,n.length=0,s.length=0}function a(d){t.push(d)}function o(d){n.push(d)}function l(d){s.push(d)}function c(){e.setup(t)}function u(d){e.setupView(t,d)}const h={lightsArray:t,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:h,setupLights:c,setupLightsView:u,pushLight:a,pushShadow:o,pushLightProbeGrid:l}}function Hb(i){let e=new WeakMap;function t(s,r=0){const a=e.get(s);let o;return a===void 0?(o=new gh(i),e.set(s,[o])):r>=a.length?(o=new gh(i),a.push(o)):o=a[r],o}function n(){e=new WeakMap}return{get:t,dispose:n}}const Wb=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Xb=`uniform sampler2D shadow_pass;
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
}`,qb=[new I(1,0,0),new I(-1,0,0),new I(0,1,0),new I(0,-1,0),new I(0,0,1),new I(0,0,-1)],$b=[new I(0,-1,0),new I(0,-1,0),new I(0,0,1),new I(0,0,-1),new I(0,-1,0),new I(0,-1,0)],_h=new Fe,br=new I,Rl=new I;function Yb(i,e,t){let n=new nd;const s=new Ne,r=new Ne,a=new st,o=new kg,l=new Bg,c={},u=t.maxTextureSize,h={[mi]:nn,[nn]:mi,[Rn]:Rn},d=new Kn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Ne},radius:{value:4}},vertexShader:Wb,fragmentShader:Xb}),f=d.clone();f.defines.HORIZONTAL_PASS=1;const g=new Vt;g.setAttribute("position",new un(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const x=new gt(g,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Za;let p=this.type;this.render=function(y,w,_){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||y.length===0)return;this.type===Wp&&(Pe("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),this.type=Za);const M=i.getRenderTarget(),P=i.getActiveCubeFace(),R=i.getActiveMipmapLevel(),L=i.state;L.setBlending(di),L.buffers.depth.getReversed()===!0?L.buffers.color.setClear(0,0,0,0):L.buffers.color.setClear(1,1,1,1),L.buffers.depth.setTest(!0),L.setScissorTest(!1);const z=p!==this.type;z&&w.traverse(function(X){X.material&&(Array.isArray(X.material)?X.material.forEach(O=>O.needsUpdate=!0):X.material.needsUpdate=!0)});for(let X=0,O=y.length;X<O;X++){const N=y[X],V=N.shadow;if(V===void 0){Pe("WebGLShadowMap:",N,"has no shadow.");continue}if(V.autoUpdate===!1&&V.needsUpdate===!1)continue;s.copy(V.mapSize);const $=V.getFrameExtents();s.multiply($),r.copy(V.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/$.x),s.x=r.x*$.x,V.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/$.y),s.y=r.y*$.y,V.mapSize.y=r.y));const j=i.state.buffers.depth.getReversed();if(V.camera._reversedDepth=j,V.map===null||z===!0){if(V.map!==null&&(V.map.depthTexture!==null&&(V.map.depthTexture.dispose(),V.map.depthTexture=null),V.map.dispose()),this.type===Mr){if(N.isPointLight){Pe("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}V.map=new $n(s.x,s.y,{format:xs,type:gi,minFilter:Rt,magFilter:Rt,generateMipmaps:!1}),V.map.texture.name=N.name+".shadowMap",V.map.depthTexture=new ar(s.x,s.y,Pn),V.map.depthTexture.name=N.name+".shadowMapDepth",V.map.depthTexture.format=_i,V.map.depthTexture.compareFunction=null,V.map.depthTexture.minFilter=Bt,V.map.depthTexture.magFilter=Bt}else N.isPointLight?(V.map=new Of(s.x),V.map.depthTexture=new fg(s.x,Yn)):(V.map=new $n(s.x,s.y),V.map.depthTexture=new ar(s.x,s.y,Yn)),V.map.depthTexture.name=N.name+".shadowMap",V.map.depthTexture.format=_i,this.type===Za?(V.map.depthTexture.compareFunction=j?Jc:Zc,V.map.depthTexture.minFilter=Rt,V.map.depthTexture.magFilter=Rt):(V.map.depthTexture.compareFunction=null,V.map.depthTexture.minFilter=Bt,V.map.depthTexture.magFilter=Bt);V.camera.updateProjectionMatrix()}const re=V.map.isWebGLCubeRenderTarget?6:1;for(let se=0;se<re;se++){if(V.map.isWebGLCubeRenderTarget)i.setRenderTarget(V.map,se),i.clear();else{se===0&&(i.setRenderTarget(V.map),i.clear());const ae=V.getViewport(se);a.set(r.x*ae.x,r.y*ae.y,r.x*ae.z,r.y*ae.w),L.viewport(a)}if(N.isPointLight){const ae=V.camera,xe=V.matrix,be=N.distance||ae.far;be!==ae.far&&(ae.far=be,ae.updateProjectionMatrix()),br.setFromMatrixPosition(N.matrixWorld),ae.position.copy(br),Rl.copy(ae.position),Rl.add(qb[se]),ae.up.copy($b[se]),ae.lookAt(Rl),ae.updateMatrixWorld(),xe.makeTranslation(-br.x,-br.y,-br.z),_h.multiplyMatrices(ae.projectionMatrix,ae.matrixWorldInverse),V._frustum.setFromProjectionMatrix(_h,ae.coordinateSystem,ae.reversedDepth)}else V.updateMatrices(N);n=V.getFrustum(),b(w,_,V.camera,N,this.type)}V.isPointLightShadow!==!0&&this.type===Mr&&E(V,_),V.needsUpdate=!1}p=this.type,m.needsUpdate=!1,i.setRenderTarget(M,P,R)};function E(y,w){const _=e.update(x);d.defines.VSM_SAMPLES!==y.blurSamples&&(d.defines.VSM_SAMPLES=y.blurSamples,f.defines.VSM_SAMPLES=y.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),y.mapPass===null&&(y.mapPass=new $n(s.x,s.y,{format:xs,type:gi})),d.uniforms.shadow_pass.value=y.map.depthTexture,d.uniforms.resolution.value=y.mapSize,d.uniforms.radius.value=y.radius,i.setRenderTarget(y.mapPass),i.clear(),i.renderBufferDirect(w,null,_,d,x,null),f.uniforms.shadow_pass.value=y.mapPass.texture,f.uniforms.resolution.value=y.mapSize,f.uniforms.radius.value=y.radius,i.setRenderTarget(y.map),i.clear(),i.renderBufferDirect(w,null,_,f,x,null)}function A(y,w,_,M){let P=null;const R=_.isPointLight===!0?y.customDistanceMaterial:y.customDepthMaterial;if(R!==void 0)P=R;else if(P=_.isPointLight===!0?l:o,i.localClippingEnabled&&w.clipShadows===!0&&Array.isArray(w.clippingPlanes)&&w.clippingPlanes.length!==0||w.displacementMap&&w.displacementScale!==0||w.alphaMap&&w.alphaTest>0||w.map&&w.alphaTest>0||w.alphaToCoverage===!0){const L=P.uuid,z=w.uuid;let X=c[L];X===void 0&&(X={},c[L]=X);let O=X[z];O===void 0&&(O=P.clone(),X[z]=O,w.addEventListener("dispose",T)),P=O}if(P.visible=w.visible,P.wireframe=w.wireframe,M===Mr?P.side=w.shadowSide!==null?w.shadowSide:w.side:P.side=w.shadowSide!==null?w.shadowSide:h[w.side],P.alphaMap=w.alphaMap,P.alphaTest=w.alphaToCoverage===!0?.5:w.alphaTest,P.map=w.map,P.clipShadows=w.clipShadows,P.clippingPlanes=w.clippingPlanes,P.clipIntersection=w.clipIntersection,P.displacementMap=w.displacementMap,P.displacementScale=w.displacementScale,P.displacementBias=w.displacementBias,P.wireframeLinewidth=w.wireframeLinewidth,P.linewidth=w.linewidth,_.isPointLight===!0&&P.isMeshDistanceMaterial===!0){const L=i.properties.get(P);L.light=_}return P}function b(y,w,_,M,P){if(y.visible===!1)return;if(y.layers.test(w.layers)&&(y.isMesh||y.isLine||y.isPoints)&&(y.castShadow||y.receiveShadow&&P===Mr)&&(!y.frustumCulled||n.intersectsObject(y))){y.modelViewMatrix.multiplyMatrices(_.matrixWorldInverse,y.matrixWorld);const z=e.update(y),X=y.material;if(Array.isArray(X)){const O=z.groups;for(let N=0,V=O.length;N<V;N++){const $=O[N],j=X[$.materialIndex];if(j&&j.visible){const re=A(y,j,M,P);y.onBeforeShadow(i,y,w,_,z,re,$),i.renderBufferDirect(_,null,z,re,y,$),y.onAfterShadow(i,y,w,_,z,re,$)}}}else if(X.visible){const O=A(y,X,M,P);y.onBeforeShadow(i,y,w,_,z,O,null),i.renderBufferDirect(_,null,z,O,y,null),y.onAfterShadow(i,y,w,_,z,O,null)}}const L=y.children;for(let z=0,X=L.length;z<X;z++)b(L[z],w,_,M,P)}function T(y){y.target.removeEventListener("dispose",T);for(const _ in c){const M=c[_],P=y.target.uuid;P in M&&(M[P].dispose(),delete M[P])}}}function Kb(i,e){function t(){let D=!1;const ce=new st;let Q=null;const fe=new st(0,0,0,0);return{setMask:function(ve){Q!==ve&&!D&&(i.colorMask(ve,ve,ve,ve),Q=ve)},setLocked:function(ve){D=ve},setClear:function(ve,ie,Te,Se,ft){ft===!0&&(ve*=Se,ie*=Se,Te*=Se),ce.set(ve,ie,Te,Se),fe.equals(ce)===!1&&(i.clearColor(ve,ie,Te,Se),fe.copy(ce))},reset:function(){D=!1,Q=null,fe.set(-1,0,0,0)}}}function n(){let D=!1,ce=!1,Q=null,fe=null,ve=null;return{setReversed:function(ie){if(ce!==ie){const Te=e.get("EXT_clip_control");ie?Te.clipControlEXT(Te.LOWER_LEFT_EXT,Te.ZERO_TO_ONE_EXT):Te.clipControlEXT(Te.LOWER_LEFT_EXT,Te.NEGATIVE_ONE_TO_ONE_EXT),ce=ie;const Se=ve;ve=null,this.setClear(Se)}},getReversed:function(){return ce},setTest:function(ie){ie?te(i.DEPTH_TEST):Ae(i.DEPTH_TEST)},setMask:function(ie){Q!==ie&&!D&&(i.depthMask(ie),Q=ie)},setFunc:function(ie){if(ce&&(ie=Am[ie]),fe!==ie){switch(ie){case Wl:i.depthFunc(i.NEVER);break;case Xl:i.depthFunc(i.ALWAYS);break;case ql:i.depthFunc(i.LESS);break;case ir:i.depthFunc(i.LEQUAL);break;case $l:i.depthFunc(i.EQUAL);break;case Yl:i.depthFunc(i.GEQUAL);break;case Kl:i.depthFunc(i.GREATER);break;case Zl:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}fe=ie}},setLocked:function(ie){D=ie},setClear:function(ie){ve!==ie&&(ve=ie,ce&&(ie=1-ie),i.clearDepth(ie))},reset:function(){D=!1,Q=null,fe=null,ve=null,ce=!1}}}function s(){let D=!1,ce=null,Q=null,fe=null,ve=null,ie=null,Te=null,Se=null,ft=null;return{setTest:function(lt){D||(lt?te(i.STENCIL_TEST):Ae(i.STENCIL_TEST))},setMask:function(lt){ce!==lt&&!D&&(i.stencilMask(lt),ce=lt)},setFunc:function(lt,In,Dn){(Q!==lt||fe!==In||ve!==Dn)&&(i.stencilFunc(lt,In,Dn),Q=lt,fe=In,ve=Dn)},setOp:function(lt,In,Dn){(ie!==lt||Te!==In||Se!==Dn)&&(i.stencilOp(lt,In,Dn),ie=lt,Te=In,Se=Dn)},setLocked:function(lt){D=lt},setClear:function(lt){ft!==lt&&(i.clearStencil(lt),ft=lt)},reset:function(){D=!1,ce=null,Q=null,fe=null,ve=null,ie=null,Te=null,Se=null,ft=null}}}const r=new t,a=new n,o=new s,l=new WeakMap,c=new WeakMap;let u={},h={},d={},f=new WeakMap,g=[],x=null,m=!1,p=null,E=null,A=null,b=null,T=null,y=null,w=null,_=new Oe(0,0,0),M=0,P=!1,R=null,L=null,z=null,X=null,O=null;const N=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let V=!1,$=0;const j=i.getParameter(i.VERSION);j.indexOf("WebGL")!==-1?($=parseFloat(/^WebGL (\d)/.exec(j)[1]),V=$>=1):j.indexOf("OpenGL ES")!==-1&&($=parseFloat(/^OpenGL ES (\d)/.exec(j)[1]),V=$>=2);let re=null,se={};const ae=i.getParameter(i.SCISSOR_BOX),xe=i.getParameter(i.VIEWPORT),be=new st().fromArray(ae),le=new st().fromArray(xe);function k(D,ce,Q,fe){const ve=new Uint8Array(4),ie=i.createTexture();i.bindTexture(D,ie),i.texParameteri(D,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(D,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Te=0;Te<Q;Te++)D===i.TEXTURE_3D||D===i.TEXTURE_2D_ARRAY?i.texImage3D(ce,0,i.RGBA,1,1,fe,0,i.RGBA,i.UNSIGNED_BYTE,ve):i.texImage2D(ce+Te,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,ve);return ie}const Z={};Z[i.TEXTURE_2D]=k(i.TEXTURE_2D,i.TEXTURE_2D,1),Z[i.TEXTURE_CUBE_MAP]=k(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),Z[i.TEXTURE_2D_ARRAY]=k(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),Z[i.TEXTURE_3D]=k(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),te(i.DEPTH_TEST),a.setFunc(ir),yt(!1),Et(Zd),te(i.CULL_FACE),Je(di);function te(D){u[D]!==!0&&(i.enable(D),u[D]=!0)}function Ae(D){u[D]!==!1&&(i.disable(D),u[D]=!1)}function Ue(D,ce){return d[D]!==ce?(i.bindFramebuffer(D,ce),d[D]=ce,D===i.DRAW_FRAMEBUFFER&&(d[i.FRAMEBUFFER]=ce),D===i.FRAMEBUFFER&&(d[i.DRAW_FRAMEBUFFER]=ce),!0):!1}function Ie(D,ce){let Q=g,fe=!1;if(D){Q=f.get(ce),Q===void 0&&(Q=[],f.set(ce,Q));const ve=D.textures;if(Q.length!==ve.length||Q[0]!==i.COLOR_ATTACHMENT0){for(let ie=0,Te=ve.length;ie<Te;ie++)Q[ie]=i.COLOR_ATTACHMENT0+ie;Q.length=ve.length,fe=!0}}else Q[0]!==i.BACK&&(Q[0]=i.BACK,fe=!0);fe&&i.drawBuffers(Q)}function vt(D){return x!==D?(i.useProgram(D),x=D,!0):!1}const $e={[as]:i.FUNC_ADD,[qp]:i.FUNC_SUBTRACT,[$p]:i.FUNC_REVERSE_SUBTRACT};$e[Yp]=i.MIN,$e[Kp]=i.MAX;const rt={[Zp]:i.ZERO,[Jp]:i.ONE,[jp]:i.SRC_COLOR,[Gl]:i.SRC_ALPHA,[sm]:i.SRC_ALPHA_SATURATE,[nm]:i.DST_COLOR,[em]:i.DST_ALPHA,[Qp]:i.ONE_MINUS_SRC_COLOR,[Hl]:i.ONE_MINUS_SRC_ALPHA,[im]:i.ONE_MINUS_DST_COLOR,[tm]:i.ONE_MINUS_DST_ALPHA,[rm]:i.CONSTANT_COLOR,[am]:i.ONE_MINUS_CONSTANT_COLOR,[om]:i.CONSTANT_ALPHA,[lm]:i.ONE_MINUS_CONSTANT_ALPHA};function Je(D,ce,Q,fe,ve,ie,Te,Se,ft,lt){if(D===di){m===!0&&(Ae(i.BLEND),m=!1);return}if(m===!1&&(te(i.BLEND),m=!0),D!==Xp){if(D!==p||lt!==P){if((E!==as||T!==as)&&(i.blendEquation(i.FUNC_ADD),E=as,T=as),lt)switch(D){case js:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Jd:i.blendFunc(i.ONE,i.ONE);break;case jd:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Qd:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:He("WebGLState: Invalid blending: ",D);break}else switch(D){case js:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Jd:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case jd:He("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Qd:He("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:He("WebGLState: Invalid blending: ",D);break}A=null,b=null,y=null,w=null,_.set(0,0,0),M=0,p=D,P=lt}return}ve=ve||ce,ie=ie||Q,Te=Te||fe,(ce!==E||ve!==T)&&(i.blendEquationSeparate($e[ce],$e[ve]),E=ce,T=ve),(Q!==A||fe!==b||ie!==y||Te!==w)&&(i.blendFuncSeparate(rt[Q],rt[fe],rt[ie],rt[Te]),A=Q,b=fe,y=ie,w=Te),(Se.equals(_)===!1||ft!==M)&&(i.blendColor(Se.r,Se.g,Se.b,ft),_.copy(Se),M=ft),p=D,P=!1}function Ye(D,ce){D.side===Rn?Ae(i.CULL_FACE):te(i.CULL_FACE);let Q=D.side===nn;ce&&(Q=!Q),yt(Q),D.blending===js&&D.transparent===!1?Je(di):Je(D.blending,D.blendEquation,D.blendSrc,D.blendDst,D.blendEquationAlpha,D.blendSrcAlpha,D.blendDstAlpha,D.blendColor,D.blendAlpha,D.premultipliedAlpha),a.setFunc(D.depthFunc),a.setTest(D.depthTest),a.setMask(D.depthWrite),r.setMask(D.colorWrite);const fe=D.stencilWrite;o.setTest(fe),fe&&(o.setMask(D.stencilWriteMask),o.setFunc(D.stencilFunc,D.stencilRef,D.stencilFuncMask),o.setOp(D.stencilFail,D.stencilZFail,D.stencilZPass)),Ut(D.polygonOffset,D.polygonOffsetFactor,D.polygonOffsetUnits),D.alphaToCoverage===!0?te(i.SAMPLE_ALPHA_TO_COVERAGE):Ae(i.SAMPLE_ALPHA_TO_COVERAGE)}function yt(D){R!==D&&(D?i.frontFace(i.CW):i.frontFace(i.CCW),R=D)}function Et(D){D!==Gp?(te(i.CULL_FACE),D!==L&&(D===Zd?i.cullFace(i.BACK):D===Hp?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Ae(i.CULL_FACE),L=D}function Lt(D){D!==z&&(V&&i.lineWidth(D),z=D)}function Ut(D,ce,Q){D?(te(i.POLYGON_OFFSET_FILL),(X!==ce||O!==Q)&&(X=ce,O=Q,a.getReversed()&&(ce=-ce),i.polygonOffset(ce,Q))):Ae(i.POLYGON_OFFSET_FILL)}function ht(D){D?te(i.SCISSOR_TEST):Ae(i.SCISSOR_TEST)}function Mt(D){D===void 0&&(D=i.TEXTURE0+N-1),re!==D&&(i.activeTexture(D),re=D)}function U(D,ce,Q){Q===void 0&&(re===null?Q=i.TEXTURE0+N-1:Q=re);let fe=se[Q];fe===void 0&&(fe={type:void 0,texture:void 0},se[Q]=fe),(fe.type!==D||fe.texture!==ce)&&(re!==Q&&(i.activeTexture(Q),re=Q),i.bindTexture(D,ce||Z[D]),fe.type=D,fe.texture=ce)}function Qt(){const D=se[re];D!==void 0&&D.type!==void 0&&(i.bindTexture(D.type,null),D.type=void 0,D.texture=void 0)}function et(){try{i.compressedTexImage2D(...arguments)}catch(D){He("WebGLState:",D)}}function C(){try{i.compressedTexImage3D(...arguments)}catch(D){He("WebGLState:",D)}}function v(){try{i.texSubImage2D(...arguments)}catch(D){He("WebGLState:",D)}}function B(){try{i.texSubImage3D(...arguments)}catch(D){He("WebGLState:",D)}}function W(){try{i.compressedTexSubImage2D(...arguments)}catch(D){He("WebGLState:",D)}}function Y(){try{i.compressedTexSubImage3D(...arguments)}catch(D){He("WebGLState:",D)}}function oe(){try{i.texStorage2D(...arguments)}catch(D){He("WebGLState:",D)}}function de(){try{i.texStorage3D(...arguments)}catch(D){He("WebGLState:",D)}}function K(){try{i.texImage2D(...arguments)}catch(D){He("WebGLState:",D)}}function ee(){try{i.texImage3D(...arguments)}catch(D){He("WebGLState:",D)}}function ue(D){return h[D]!==void 0?h[D]:i.getParameter(D)}function we(D,ce){h[D]!==ce&&(i.pixelStorei(D,ce),h[D]=ce)}function pe(D){be.equals(D)===!1&&(i.scissor(D.x,D.y,D.z,D.w),be.copy(D))}function he(D){le.equals(D)===!1&&(i.viewport(D.x,D.y,D.z,D.w),le.copy(D))}function Le(D,ce){let Q=c.get(ce);Q===void 0&&(Q=new WeakMap,c.set(ce,Q));let fe=Q.get(D);fe===void 0&&(fe=i.getUniformBlockIndex(ce,D.name),Q.set(D,fe))}function De(D,ce){const fe=c.get(ce).get(D);l.get(ce)!==fe&&(i.uniformBlockBinding(ce,fe,D.__bindingPointIndex),l.set(ce,fe))}function ze(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),u={},h={},re=null,se={},d={},f=new WeakMap,g=[],x=null,m=!1,p=null,E=null,A=null,b=null,T=null,y=null,w=null,_=new Oe(0,0,0),M=0,P=!1,R=null,L=null,z=null,X=null,O=null,be.set(0,0,i.canvas.width,i.canvas.height),le.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:te,disable:Ae,bindFramebuffer:Ue,drawBuffers:Ie,useProgram:vt,setBlending:Je,setMaterial:Ye,setFlipSided:yt,setCullFace:Et,setLineWidth:Lt,setPolygonOffset:Ut,setScissorTest:ht,activeTexture:Mt,bindTexture:U,unbindTexture:Qt,compressedTexImage2D:et,compressedTexImage3D:C,texImage2D:K,texImage3D:ee,pixelStorei:we,getParameter:ue,updateUBOMapping:Le,uniformBlockBinding:De,texStorage2D:oe,texStorage3D:de,texSubImage2D:v,texSubImage3D:B,compressedTexSubImage2D:W,compressedTexSubImage3D:Y,scissor:pe,viewport:he,reset:ze}}function Zb(i,e,t,n,s,r,a){const o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Ne,u=new WeakMap,h=new Set;let d;const f=new WeakMap;let g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function x(C,v){return g?new OffscreenCanvas(C,v):Vr("canvas")}function m(C,v,B){let W=1;const Y=et(C);if((Y.width>B||Y.height>B)&&(W=B/Math.max(Y.width,Y.height)),W<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){const oe=Math.floor(W*Y.width),de=Math.floor(W*Y.height);d===void 0&&(d=x(oe,de));const K=v?x(oe,de):d;return K.width=oe,K.height=de,K.getContext("2d").drawImage(C,0,0,oe,de),Pe("WebGLRenderer: Texture has been resized from ("+Y.width+"x"+Y.height+") to ("+oe+"x"+de+")."),K}else return"data"in C&&Pe("WebGLRenderer: Image in DataTexture is too big ("+Y.width+"x"+Y.height+")."),C;return C}function p(C){return C.generateMipmaps}function E(C){i.generateMipmap(C)}function A(C){return C.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:C.isWebGL3DRenderTarget?i.TEXTURE_3D:C.isWebGLArrayRenderTarget||C.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function b(C,v,B,W,Y,oe=!1){if(C!==null){if(i[C]!==void 0)return i[C];Pe("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let de;W&&(de=e.get("EXT_texture_norm16"),de||Pe("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let K=v;if(v===i.RED&&(B===i.FLOAT&&(K=i.R32F),B===i.HALF_FLOAT&&(K=i.R16F),B===i.UNSIGNED_BYTE&&(K=i.R8),B===i.UNSIGNED_SHORT&&de&&(K=de.R16_EXT),B===i.SHORT&&de&&(K=de.R16_SNORM_EXT)),v===i.RED_INTEGER&&(B===i.UNSIGNED_BYTE&&(K=i.R8UI),B===i.UNSIGNED_SHORT&&(K=i.R16UI),B===i.UNSIGNED_INT&&(K=i.R32UI),B===i.BYTE&&(K=i.R8I),B===i.SHORT&&(K=i.R16I),B===i.INT&&(K=i.R32I)),v===i.RG&&(B===i.FLOAT&&(K=i.RG32F),B===i.HALF_FLOAT&&(K=i.RG16F),B===i.UNSIGNED_BYTE&&(K=i.RG8),B===i.UNSIGNED_SHORT&&de&&(K=de.RG16_EXT),B===i.SHORT&&de&&(K=de.RG16_SNORM_EXT)),v===i.RG_INTEGER&&(B===i.UNSIGNED_BYTE&&(K=i.RG8UI),B===i.UNSIGNED_SHORT&&(K=i.RG16UI),B===i.UNSIGNED_INT&&(K=i.RG32UI),B===i.BYTE&&(K=i.RG8I),B===i.SHORT&&(K=i.RG16I),B===i.INT&&(K=i.RG32I)),v===i.RGB_INTEGER&&(B===i.UNSIGNED_BYTE&&(K=i.RGB8UI),B===i.UNSIGNED_SHORT&&(K=i.RGB16UI),B===i.UNSIGNED_INT&&(K=i.RGB32UI),B===i.BYTE&&(K=i.RGB8I),B===i.SHORT&&(K=i.RGB16I),B===i.INT&&(K=i.RGB32I)),v===i.RGBA_INTEGER&&(B===i.UNSIGNED_BYTE&&(K=i.RGBA8UI),B===i.UNSIGNED_SHORT&&(K=i.RGBA16UI),B===i.UNSIGNED_INT&&(K=i.RGBA32UI),B===i.BYTE&&(K=i.RGBA8I),B===i.SHORT&&(K=i.RGBA16I),B===i.INT&&(K=i.RGBA32I)),v===i.RGB&&(B===i.UNSIGNED_SHORT&&de&&(K=de.RGB16_EXT),B===i.SHORT&&de&&(K=de.RGB16_SNORM_EXT),B===i.UNSIGNED_INT_5_9_9_9_REV&&(K=i.RGB9_E5),B===i.UNSIGNED_INT_10F_11F_11F_REV&&(K=i.R11F_G11F_B10F)),v===i.RGBA){const ee=oe?uo:Xe.getTransfer(Y);B===i.FLOAT&&(K=i.RGBA32F),B===i.HALF_FLOAT&&(K=i.RGBA16F),B===i.UNSIGNED_BYTE&&(K=ee===tt?i.SRGB8_ALPHA8:i.RGBA8),B===i.UNSIGNED_SHORT&&de&&(K=de.RGBA16_EXT),B===i.SHORT&&de&&(K=de.RGBA16_SNORM_EXT),B===i.UNSIGNED_SHORT_4_4_4_4&&(K=i.RGBA4),B===i.UNSIGNED_SHORT_5_5_5_1&&(K=i.RGB5_A1)}return(K===i.R16F||K===i.R32F||K===i.RG16F||K===i.RG32F||K===i.RGBA16F||K===i.RGBA32F)&&e.get("EXT_color_buffer_float"),K}function T(C,v){let B;return C?v===null||v===Yn||v===Or?B=i.DEPTH24_STENCIL8:v===Pn?B=i.DEPTH32F_STENCIL8:v===Fr&&(B=i.DEPTH24_STENCIL8,Pe("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):v===null||v===Yn||v===Or?B=i.DEPTH_COMPONENT24:v===Pn?B=i.DEPTH_COMPONENT32F:v===Fr&&(B=i.DEPTH_COMPONENT16),B}function y(C,v){return p(C)===!0||C.isFramebufferTexture&&C.minFilter!==Bt&&C.minFilter!==Rt?Math.log2(Math.max(v.width,v.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?v.mipmaps.length:1}function w(C){const v=C.target;v.removeEventListener("dispose",w),M(v),v.isVideoTexture&&u.delete(v),v.isHTMLTexture&&h.delete(v)}function _(C){const v=C.target;v.removeEventListener("dispose",_),R(v)}function M(C){const v=n.get(C);if(v.__webglInit===void 0)return;const B=C.source,W=f.get(B);if(W){const Y=W[v.__cacheKey];Y.usedTimes--,Y.usedTimes===0&&P(C),Object.keys(W).length===0&&f.delete(B)}n.remove(C)}function P(C){const v=n.get(C);i.deleteTexture(v.__webglTexture);const B=C.source,W=f.get(B);delete W[v.__cacheKey],a.memory.textures--}function R(C){const v=n.get(C);if(C.depthTexture&&(C.depthTexture.dispose(),n.remove(C.depthTexture)),C.isWebGLCubeRenderTarget)for(let W=0;W<6;W++){if(Array.isArray(v.__webglFramebuffer[W]))for(let Y=0;Y<v.__webglFramebuffer[W].length;Y++)i.deleteFramebuffer(v.__webglFramebuffer[W][Y]);else i.deleteFramebuffer(v.__webglFramebuffer[W]);v.__webglDepthbuffer&&i.deleteRenderbuffer(v.__webglDepthbuffer[W])}else{if(Array.isArray(v.__webglFramebuffer))for(let W=0;W<v.__webglFramebuffer.length;W++)i.deleteFramebuffer(v.__webglFramebuffer[W]);else i.deleteFramebuffer(v.__webglFramebuffer);if(v.__webglDepthbuffer&&i.deleteRenderbuffer(v.__webglDepthbuffer),v.__webglMultisampledFramebuffer&&i.deleteFramebuffer(v.__webglMultisampledFramebuffer),v.__webglColorRenderbuffer)for(let W=0;W<v.__webglColorRenderbuffer.length;W++)v.__webglColorRenderbuffer[W]&&i.deleteRenderbuffer(v.__webglColorRenderbuffer[W]);v.__webglDepthRenderbuffer&&i.deleteRenderbuffer(v.__webglDepthRenderbuffer)}const B=C.textures;for(let W=0,Y=B.length;W<Y;W++){const oe=n.get(B[W]);oe.__webglTexture&&(i.deleteTexture(oe.__webglTexture),a.memory.textures--),n.remove(B[W])}n.remove(C)}let L=0;function z(){L=0}function X(){return L}function O(C){L=C}function N(){const C=L;return C>=s.maxTextures&&Pe("WebGLTextures: Trying to use "+C+" texture units while this GPU supports only "+s.maxTextures),L+=1,C}function V(C){const v=[];return v.push(C.wrapS),v.push(C.wrapT),v.push(C.wrapR||0),v.push(C.magFilter),v.push(C.minFilter),v.push(C.anisotropy),v.push(C.internalFormat),v.push(C.format),v.push(C.type),v.push(C.generateMipmaps),v.push(C.premultiplyAlpha),v.push(C.flipY),v.push(C.unpackAlignment),v.push(C.colorSpace),v.join()}function $(C,v){const B=n.get(C);if(C.isVideoTexture&&U(C),C.isRenderTargetTexture===!1&&C.isExternalTexture!==!0&&C.version>0&&B.__version!==C.version){const W=C.image;if(W===null)Pe("WebGLRenderer: Texture marked for update but no image data found.");else if(W.complete===!1)Pe("WebGLRenderer: Texture marked for update but image is incomplete");else{Ae(B,C,v);return}}else C.isExternalTexture&&(B.__webglTexture=C.sourceTexture?C.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,B.__webglTexture,i.TEXTURE0+v)}function j(C,v){const B=n.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&B.__version!==C.version){Ae(B,C,v);return}else C.isExternalTexture&&(B.__webglTexture=C.sourceTexture?C.sourceTexture:null);t.bindTexture(i.TEXTURE_2D_ARRAY,B.__webglTexture,i.TEXTURE0+v)}function re(C,v){const B=n.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&B.__version!==C.version){Ae(B,C,v);return}t.bindTexture(i.TEXTURE_3D,B.__webglTexture,i.TEXTURE0+v)}function se(C,v){const B=n.get(C);if(C.isCubeDepthTexture!==!0&&C.version>0&&B.__version!==C.version){Ue(B,C,v);return}t.bindTexture(i.TEXTURE_CUBE_MAP,B.__webglTexture,i.TEXTURE0+v)}const ae={[cs]:i.REPEAT,[dn]:i.CLAMP_TO_EDGE,[Jl]:i.MIRRORED_REPEAT},xe={[Bt]:i.NEAREST,[hm]:i.NEAREST_MIPMAP_NEAREST,[ua]:i.NEAREST_MIPMAP_LINEAR,[Rt]:i.LINEAR,[Ko]:i.LINEAR_MIPMAP_NEAREST,[ai]:i.LINEAR_MIPMAP_LINEAR},be={[gm]:i.NEVER,[ym]:i.ALWAYS,[_m]:i.LESS,[Zc]:i.LEQUAL,[vm]:i.EQUAL,[Jc]:i.GEQUAL,[xm]:i.GREATER,[bm]:i.NOTEQUAL};function le(C,v){if(v.type===Pn&&e.has("OES_texture_float_linear")===!1&&(v.magFilter===Rt||v.magFilter===Ko||v.magFilter===ua||v.magFilter===ai||v.minFilter===Rt||v.minFilter===Ko||v.minFilter===ua||v.minFilter===ai)&&Pe("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(C,i.TEXTURE_WRAP_S,ae[v.wrapS]),i.texParameteri(C,i.TEXTURE_WRAP_T,ae[v.wrapT]),(C===i.TEXTURE_3D||C===i.TEXTURE_2D_ARRAY)&&i.texParameteri(C,i.TEXTURE_WRAP_R,ae[v.wrapR]),i.texParameteri(C,i.TEXTURE_MAG_FILTER,xe[v.magFilter]),i.texParameteri(C,i.TEXTURE_MIN_FILTER,xe[v.minFilter]),v.compareFunction&&(i.texParameteri(C,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(C,i.TEXTURE_COMPARE_FUNC,be[v.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(v.magFilter===Bt||v.minFilter!==ua&&v.minFilter!==ai||v.type===Pn&&e.has("OES_texture_float_linear")===!1)return;if(v.anisotropy>1||n.get(v).__currentAnisotropy){const B=e.get("EXT_texture_filter_anisotropic");i.texParameterf(C,B.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(v.anisotropy,s.getMaxAnisotropy())),n.get(v).__currentAnisotropy=v.anisotropy}}}function k(C,v){let B=!1;C.__webglInit===void 0&&(C.__webglInit=!0,v.addEventListener("dispose",w));const W=v.source;let Y=f.get(W);Y===void 0&&(Y={},f.set(W,Y));const oe=V(v);if(oe!==C.__cacheKey){Y[oe]===void 0&&(Y[oe]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,B=!0),Y[oe].usedTimes++;const de=Y[C.__cacheKey];de!==void 0&&(Y[C.__cacheKey].usedTimes--,de.usedTimes===0&&P(v)),C.__cacheKey=oe,C.__webglTexture=Y[oe].texture}return B}function Z(C,v,B){return Math.floor(Math.floor(C/B)/v)}function te(C,v,B,W){const oe=C.updateRanges;if(oe.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,v.width,v.height,B,W,v.data);else{oe.sort((we,pe)=>we.start-pe.start);let de=0;for(let we=1;we<oe.length;we++){const pe=oe[de],he=oe[we],Le=pe.start+pe.count,De=Z(he.start,v.width,4),ze=Z(pe.start,v.width,4);he.start<=Le+1&&De===ze&&Z(he.start+he.count-1,v.width,4)===De?pe.count=Math.max(pe.count,he.start+he.count-pe.start):(++de,oe[de]=he)}oe.length=de+1;const K=t.getParameter(i.UNPACK_ROW_LENGTH),ee=t.getParameter(i.UNPACK_SKIP_PIXELS),ue=t.getParameter(i.UNPACK_SKIP_ROWS);t.pixelStorei(i.UNPACK_ROW_LENGTH,v.width);for(let we=0,pe=oe.length;we<pe;we++){const he=oe[we],Le=Math.floor(he.start/4),De=Math.ceil(he.count/4),ze=Le%v.width,D=Math.floor(Le/v.width),ce=De,Q=1;t.pixelStorei(i.UNPACK_SKIP_PIXELS,ze),t.pixelStorei(i.UNPACK_SKIP_ROWS,D),t.texSubImage2D(i.TEXTURE_2D,0,ze,D,ce,Q,B,W,v.data)}C.clearUpdateRanges(),t.pixelStorei(i.UNPACK_ROW_LENGTH,K),t.pixelStorei(i.UNPACK_SKIP_PIXELS,ee),t.pixelStorei(i.UNPACK_SKIP_ROWS,ue)}}function Ae(C,v,B){let W=i.TEXTURE_2D;(v.isDataArrayTexture||v.isCompressedArrayTexture)&&(W=i.TEXTURE_2D_ARRAY),v.isData3DTexture&&(W=i.TEXTURE_3D);const Y=k(C,v),oe=v.source;t.bindTexture(W,C.__webglTexture,i.TEXTURE0+B);const de=n.get(oe);if(oe.version!==de.__version||Y===!0){if(t.activeTexture(i.TEXTURE0+B),(typeof ImageBitmap<"u"&&v.image instanceof ImageBitmap)===!1){const Q=Xe.getPrimaries(Xe.workingColorSpace),fe=v.colorSpace===Ni?null:Xe.getPrimaries(v.colorSpace),ve=v.colorSpace===Ni||Q===fe?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,v.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ve)}t.pixelStorei(i.UNPACK_ALIGNMENT,v.unpackAlignment);let ee=m(v.image,!1,s.maxTextureSize);ee=Qt(v,ee);const ue=r.convert(v.format,v.colorSpace),we=r.convert(v.type);let pe=b(v.internalFormat,ue,we,v.normalized,v.colorSpace,v.isVideoTexture);le(W,v);let he;const Le=v.mipmaps,De=v.isVideoTexture!==!0,ze=de.__version===void 0||Y===!0,D=oe.dataReady,ce=y(v,ee);if(v.isDepthTexture)pe=T(v.format===ds,v.type),ze&&(De?t.texStorage2D(i.TEXTURE_2D,1,pe,ee.width,ee.height):t.texImage2D(i.TEXTURE_2D,0,pe,ee.width,ee.height,0,ue,we,null));else if(v.isDataTexture)if(Le.length>0){De&&ze&&t.texStorage2D(i.TEXTURE_2D,ce,pe,Le[0].width,Le[0].height);for(let Q=0,fe=Le.length;Q<fe;Q++)he=Le[Q],De?D&&t.texSubImage2D(i.TEXTURE_2D,Q,0,0,he.width,he.height,ue,we,he.data):t.texImage2D(i.TEXTURE_2D,Q,pe,he.width,he.height,0,ue,we,he.data);v.generateMipmaps=!1}else De?(ze&&t.texStorage2D(i.TEXTURE_2D,ce,pe,ee.width,ee.height),D&&te(v,ee,ue,we)):t.texImage2D(i.TEXTURE_2D,0,pe,ee.width,ee.height,0,ue,we,ee.data);else if(v.isCompressedTexture)if(v.isCompressedArrayTexture){De&&ze&&t.texStorage3D(i.TEXTURE_2D_ARRAY,ce,pe,Le[0].width,Le[0].height,ee.depth);for(let Q=0,fe=Le.length;Q<fe;Q++)if(he=Le[Q],v.format!==vn)if(ue!==null)if(De){if(D)if(v.layerUpdates.size>0){const ve=Yu(he.width,he.height,v.format,v.type);for(const ie of v.layerUpdates){const Te=he.data.subarray(ie*ve/he.data.BYTES_PER_ELEMENT,(ie+1)*ve/he.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,Q,0,0,ie,he.width,he.height,1,ue,Te)}v.clearLayerUpdates()}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,Q,0,0,0,he.width,he.height,ee.depth,ue,he.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,Q,pe,he.width,he.height,ee.depth,0,he.data,0,0);else Pe("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else De?D&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,Q,0,0,0,he.width,he.height,ee.depth,ue,we,he.data):t.texImage3D(i.TEXTURE_2D_ARRAY,Q,pe,he.width,he.height,ee.depth,0,ue,we,he.data)}else{De&&ze&&t.texStorage2D(i.TEXTURE_2D,ce,pe,Le[0].width,Le[0].height);for(let Q=0,fe=Le.length;Q<fe;Q++)he=Le[Q],v.format!==vn?ue!==null?De?D&&t.compressedTexSubImage2D(i.TEXTURE_2D,Q,0,0,he.width,he.height,ue,he.data):t.compressedTexImage2D(i.TEXTURE_2D,Q,pe,he.width,he.height,0,he.data):Pe("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):De?D&&t.texSubImage2D(i.TEXTURE_2D,Q,0,0,he.width,he.height,ue,we,he.data):t.texImage2D(i.TEXTURE_2D,Q,pe,he.width,he.height,0,ue,we,he.data)}else if(v.isDataArrayTexture)if(De){if(ze&&t.texStorage3D(i.TEXTURE_2D_ARRAY,ce,pe,ee.width,ee.height,ee.depth),D)if(v.layerUpdates.size>0){const Q=Yu(ee.width,ee.height,v.format,v.type);for(const fe of v.layerUpdates){const ve=ee.data.subarray(fe*Q/ee.data.BYTES_PER_ELEMENT,(fe+1)*Q/ee.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,fe,ee.width,ee.height,1,ue,we,ve)}v.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,ee.width,ee.height,ee.depth,ue,we,ee.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,pe,ee.width,ee.height,ee.depth,0,ue,we,ee.data);else if(v.isData3DTexture)De?(ze&&t.texStorage3D(i.TEXTURE_3D,ce,pe,ee.width,ee.height,ee.depth),D&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,ee.width,ee.height,ee.depth,ue,we,ee.data)):t.texImage3D(i.TEXTURE_3D,0,pe,ee.width,ee.height,ee.depth,0,ue,we,ee.data);else if(v.isFramebufferTexture){if(ze)if(De)t.texStorage2D(i.TEXTURE_2D,ce,pe,ee.width,ee.height);else{let Q=ee.width,fe=ee.height;for(let ve=0;ve<ce;ve++)t.texImage2D(i.TEXTURE_2D,ve,pe,Q,fe,0,ue,we,null),Q>>=1,fe>>=1}}else if(v.isHTMLTexture){if("texElementImage2D"in i){const Q=i.canvas;if(Q.hasAttribute("layoutsubtree")||Q.setAttribute("layoutsubtree","true"),ee.parentNode!==Q){Q.appendChild(ee),h.add(v),Q.onpaint=fe=>{const ve=fe.changedElements;for(const ie of h)ve.includes(ie.image)&&(ie.needsUpdate=!0)},Q.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,ee);else{const ve=i.RGBA,ie=i.RGBA,Te=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,ve,ie,Te,ee)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(Le.length>0){if(De&&ze){const Q=et(Le[0]);t.texStorage2D(i.TEXTURE_2D,ce,pe,Q.width,Q.height)}for(let Q=0,fe=Le.length;Q<fe;Q++)he=Le[Q],De?D&&t.texSubImage2D(i.TEXTURE_2D,Q,0,0,ue,we,he):t.texImage2D(i.TEXTURE_2D,Q,pe,ue,we,he);v.generateMipmaps=!1}else if(De){if(ze){const Q=et(ee);t.texStorage2D(i.TEXTURE_2D,ce,pe,Q.width,Q.height)}D&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,ue,we,ee)}else t.texImage2D(i.TEXTURE_2D,0,pe,ue,we,ee);p(v)&&E(W),de.__version=oe.version,v.onUpdate&&v.onUpdate(v)}C.__version=v.version}function Ue(C,v,B){if(v.image.length!==6)return;const W=k(C,v),Y=v.source;t.bindTexture(i.TEXTURE_CUBE_MAP,C.__webglTexture,i.TEXTURE0+B);const oe=n.get(Y);if(Y.version!==oe.__version||W===!0){t.activeTexture(i.TEXTURE0+B);const de=Xe.getPrimaries(Xe.workingColorSpace),K=v.colorSpace===Ni?null:Xe.getPrimaries(v.colorSpace),ee=v.colorSpace===Ni||de===K?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,v.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),t.pixelStorei(i.UNPACK_ALIGNMENT,v.unpackAlignment),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ee);const ue=v.isCompressedTexture||v.image[0].isCompressedTexture,we=v.image[0]&&v.image[0].isDataTexture,pe=[];for(let ie=0;ie<6;ie++)!ue&&!we?pe[ie]=m(v.image[ie],!0,s.maxCubemapSize):pe[ie]=we?v.image[ie].image:v.image[ie],pe[ie]=Qt(v,pe[ie]);const he=pe[0],Le=r.convert(v.format,v.colorSpace),De=r.convert(v.type),ze=b(v.internalFormat,Le,De,v.normalized,v.colorSpace),D=v.isVideoTexture!==!0,ce=oe.__version===void 0||W===!0,Q=Y.dataReady;let fe=y(v,he);le(i.TEXTURE_CUBE_MAP,v);let ve;if(ue){D&&ce&&t.texStorage2D(i.TEXTURE_CUBE_MAP,fe,ze,he.width,he.height);for(let ie=0;ie<6;ie++){ve=pe[ie].mipmaps;for(let Te=0;Te<ve.length;Te++){const Se=ve[Te];v.format!==vn?Le!==null?D?Q&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Te,0,0,Se.width,Se.height,Le,Se.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Te,ze,Se.width,Se.height,0,Se.data):Pe("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):D?Q&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Te,0,0,Se.width,Se.height,Le,De,Se.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Te,ze,Se.width,Se.height,0,Le,De,Se.data)}}}else{if(ve=v.mipmaps,D&&ce){ve.length>0&&fe++;const ie=et(pe[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,fe,ze,ie.width,ie.height)}for(let ie=0;ie<6;ie++)if(we){D?Q&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,0,0,pe[ie].width,pe[ie].height,Le,De,pe[ie].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,ze,pe[ie].width,pe[ie].height,0,Le,De,pe[ie].data);for(let Te=0;Te<ve.length;Te++){const ft=ve[Te].image[ie].image;D?Q&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Te+1,0,0,ft.width,ft.height,Le,De,ft.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Te+1,ze,ft.width,ft.height,0,Le,De,ft.data)}}else{D?Q&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,0,0,Le,De,pe[ie]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,ze,Le,De,pe[ie]);for(let Te=0;Te<ve.length;Te++){const Se=ve[Te];D?Q&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Te+1,0,0,Le,De,Se.image[ie]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Te+1,ze,Le,De,Se.image[ie])}}}p(v)&&E(i.TEXTURE_CUBE_MAP),oe.__version=Y.version,v.onUpdate&&v.onUpdate(v)}C.__version=v.version}function Ie(C,v,B,W,Y,oe){const de=r.convert(B.format,B.colorSpace),K=r.convert(B.type),ee=b(B.internalFormat,de,K,B.normalized,B.colorSpace),ue=n.get(v),we=n.get(B);if(we.__renderTarget=v,!ue.__hasExternalTextures){const pe=Math.max(1,v.width>>oe),he=Math.max(1,v.height>>oe);Y===i.TEXTURE_3D||Y===i.TEXTURE_2D_ARRAY?t.texImage3D(Y,oe,ee,pe,he,v.depth,0,de,K,null):t.texImage2D(Y,oe,ee,pe,he,0,de,K,null)}t.bindFramebuffer(i.FRAMEBUFFER,C),Mt(v)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,W,Y,we.__webglTexture,0,ht(v)):(Y===i.TEXTURE_2D||Y>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&Y<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,W,Y,we.__webglTexture,oe),t.bindFramebuffer(i.FRAMEBUFFER,null)}function vt(C,v,B){if(i.bindRenderbuffer(i.RENDERBUFFER,C),v.depthBuffer){const W=v.depthTexture,Y=W&&W.isDepthTexture?W.type:null,oe=T(v.stencilBuffer,Y),de=v.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;Mt(v)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ht(v),oe,v.width,v.height):B?i.renderbufferStorageMultisample(i.RENDERBUFFER,ht(v),oe,v.width,v.height):i.renderbufferStorage(i.RENDERBUFFER,oe,v.width,v.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,de,i.RENDERBUFFER,C)}else{const W=v.textures;for(let Y=0;Y<W.length;Y++){const oe=W[Y],de=r.convert(oe.format,oe.colorSpace),K=r.convert(oe.type),ee=b(oe.internalFormat,de,K,oe.normalized,oe.colorSpace);Mt(v)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ht(v),ee,v.width,v.height):B?i.renderbufferStorageMultisample(i.RENDERBUFFER,ht(v),ee,v.width,v.height):i.renderbufferStorage(i.RENDERBUFFER,ee,v.width,v.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function $e(C,v,B){const W=v.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(i.FRAMEBUFFER,C),!(v.depthTexture&&v.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");const Y=n.get(v.depthTexture);if(Y.__renderTarget=v,(!Y.__webglTexture||v.depthTexture.image.width!==v.width||v.depthTexture.image.height!==v.height)&&(v.depthTexture.image.width=v.width,v.depthTexture.image.height=v.height,v.depthTexture.needsUpdate=!0),W){if(Y.__webglInit===void 0&&(Y.__webglInit=!0,v.depthTexture.addEventListener("dispose",w)),Y.__webglTexture===void 0){Y.__webglTexture=i.createTexture(),t.bindTexture(i.TEXTURE_CUBE_MAP,Y.__webglTexture),le(i.TEXTURE_CUBE_MAP,v.depthTexture);const ue=r.convert(v.depthTexture.format),we=r.convert(v.depthTexture.type);let pe;v.depthTexture.format===_i?pe=i.DEPTH_COMPONENT24:v.depthTexture.format===ds&&(pe=i.DEPTH24_STENCIL8);for(let he=0;he<6;he++)i.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+he,0,pe,v.width,v.height,0,ue,we,null)}}else $(v.depthTexture,0);const oe=Y.__webglTexture,de=ht(v),K=W?i.TEXTURE_CUBE_MAP_POSITIVE_X+B:i.TEXTURE_2D,ee=v.depthTexture.format===ds?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(v.depthTexture.format===_i)Mt(v)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ee,K,oe,0,de):i.framebufferTexture2D(i.FRAMEBUFFER,ee,K,oe,0);else if(v.depthTexture.format===ds)Mt(v)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ee,K,oe,0,de):i.framebufferTexture2D(i.FRAMEBUFFER,ee,K,oe,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function rt(C){const v=n.get(C),B=C.isWebGLCubeRenderTarget===!0;if(v.__boundDepthTexture!==C.depthTexture){const W=C.depthTexture;if(v.__depthDisposeCallback&&v.__depthDisposeCallback(),W){const Y=()=>{delete v.__boundDepthTexture,delete v.__depthDisposeCallback,W.removeEventListener("dispose",Y)};W.addEventListener("dispose",Y),v.__depthDisposeCallback=Y}v.__boundDepthTexture=W}if(C.depthTexture&&!v.__autoAllocateDepthBuffer)if(B)for(let W=0;W<6;W++)$e(v.__webglFramebuffer[W],C,W);else{const W=C.texture.mipmaps;W&&W.length>0?$e(v.__webglFramebuffer[0],C,0):$e(v.__webglFramebuffer,C,0)}else if(B){v.__webglDepthbuffer=[];for(let W=0;W<6;W++)if(t.bindFramebuffer(i.FRAMEBUFFER,v.__webglFramebuffer[W]),v.__webglDepthbuffer[W]===void 0)v.__webglDepthbuffer[W]=i.createRenderbuffer(),vt(v.__webglDepthbuffer[W],C,!1);else{const Y=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,oe=v.__webglDepthbuffer[W];i.bindRenderbuffer(i.RENDERBUFFER,oe),i.framebufferRenderbuffer(i.FRAMEBUFFER,Y,i.RENDERBUFFER,oe)}}else{const W=C.texture.mipmaps;if(W&&W.length>0?t.bindFramebuffer(i.FRAMEBUFFER,v.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,v.__webglFramebuffer),v.__webglDepthbuffer===void 0)v.__webglDepthbuffer=i.createRenderbuffer(),vt(v.__webglDepthbuffer,C,!1);else{const Y=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,oe=v.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,oe),i.framebufferRenderbuffer(i.FRAMEBUFFER,Y,i.RENDERBUFFER,oe)}}t.bindFramebuffer(i.FRAMEBUFFER,null)}function Je(C,v,B){const W=n.get(C);v!==void 0&&Ie(W.__webglFramebuffer,C,C.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),B!==void 0&&rt(C)}function Ye(C){const v=C.texture,B=n.get(C),W=n.get(v);C.addEventListener("dispose",_);const Y=C.textures,oe=C.isWebGLCubeRenderTarget===!0,de=Y.length>1;if(de||(W.__webglTexture===void 0&&(W.__webglTexture=i.createTexture()),W.__version=v.version,a.memory.textures++),oe){B.__webglFramebuffer=[];for(let K=0;K<6;K++)if(v.mipmaps&&v.mipmaps.length>0){B.__webglFramebuffer[K]=[];for(let ee=0;ee<v.mipmaps.length;ee++)B.__webglFramebuffer[K][ee]=i.createFramebuffer()}else B.__webglFramebuffer[K]=i.createFramebuffer()}else{if(v.mipmaps&&v.mipmaps.length>0){B.__webglFramebuffer=[];for(let K=0;K<v.mipmaps.length;K++)B.__webglFramebuffer[K]=i.createFramebuffer()}else B.__webglFramebuffer=i.createFramebuffer();if(de)for(let K=0,ee=Y.length;K<ee;K++){const ue=n.get(Y[K]);ue.__webglTexture===void 0&&(ue.__webglTexture=i.createTexture(),a.memory.textures++)}if(C.samples>0&&Mt(C)===!1){B.__webglMultisampledFramebuffer=i.createFramebuffer(),B.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,B.__webglMultisampledFramebuffer);for(let K=0;K<Y.length;K++){const ee=Y[K];B.__webglColorRenderbuffer[K]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,B.__webglColorRenderbuffer[K]);const ue=r.convert(ee.format,ee.colorSpace),we=r.convert(ee.type),pe=b(ee.internalFormat,ue,we,ee.normalized,ee.colorSpace,C.isXRRenderTarget===!0),he=ht(C);i.renderbufferStorageMultisample(i.RENDERBUFFER,he,pe,C.width,C.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+K,i.RENDERBUFFER,B.__webglColorRenderbuffer[K])}i.bindRenderbuffer(i.RENDERBUFFER,null),C.depthBuffer&&(B.__webglDepthRenderbuffer=i.createRenderbuffer(),vt(B.__webglDepthRenderbuffer,C,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(oe){t.bindTexture(i.TEXTURE_CUBE_MAP,W.__webglTexture),le(i.TEXTURE_CUBE_MAP,v);for(let K=0;K<6;K++)if(v.mipmaps&&v.mipmaps.length>0)for(let ee=0;ee<v.mipmaps.length;ee++)Ie(B.__webglFramebuffer[K][ee],C,v,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+K,ee);else Ie(B.__webglFramebuffer[K],C,v,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+K,0);p(v)&&E(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(de){for(let K=0,ee=Y.length;K<ee;K++){const ue=Y[K],we=n.get(ue);let pe=i.TEXTURE_2D;(C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(pe=C.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(pe,we.__webglTexture),le(pe,ue),Ie(B.__webglFramebuffer,C,ue,i.COLOR_ATTACHMENT0+K,pe,0),p(ue)&&E(pe)}t.unbindTexture()}else{let K=i.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(K=C.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(K,W.__webglTexture),le(K,v),v.mipmaps&&v.mipmaps.length>0)for(let ee=0;ee<v.mipmaps.length;ee++)Ie(B.__webglFramebuffer[ee],C,v,i.COLOR_ATTACHMENT0,K,ee);else Ie(B.__webglFramebuffer,C,v,i.COLOR_ATTACHMENT0,K,0);p(v)&&E(K),t.unbindTexture()}C.depthBuffer&&rt(C)}function yt(C){const v=C.textures;for(let B=0,W=v.length;B<W;B++){const Y=v[B];if(p(Y)){const oe=A(C),de=n.get(Y).__webglTexture;t.bindTexture(oe,de),E(oe),t.unbindTexture()}}}const Et=[],Lt=[];function Ut(C){if(C.samples>0){if(Mt(C)===!1){const v=C.textures,B=C.width,W=C.height;let Y=i.COLOR_BUFFER_BIT;const oe=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,de=n.get(C),K=v.length>1;if(K)for(let ue=0;ue<v.length;ue++)t.bindFramebuffer(i.FRAMEBUFFER,de.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ue,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,de.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ue,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,de.__webglMultisampledFramebuffer);const ee=C.texture.mipmaps;ee&&ee.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,de.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,de.__webglFramebuffer);for(let ue=0;ue<v.length;ue++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(Y|=i.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(Y|=i.STENCIL_BUFFER_BIT)),K){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,de.__webglColorRenderbuffer[ue]);const we=n.get(v[ue]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,we,0)}i.blitFramebuffer(0,0,B,W,0,0,B,W,Y,i.NEAREST),l===!0&&(Et.length=0,Lt.length=0,Et.push(i.COLOR_ATTACHMENT0+ue),C.depthBuffer&&C.resolveDepthBuffer===!1&&(Et.push(oe),Lt.push(oe),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,Lt)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,Et))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),K)for(let ue=0;ue<v.length;ue++){t.bindFramebuffer(i.FRAMEBUFFER,de.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ue,i.RENDERBUFFER,de.__webglColorRenderbuffer[ue]);const we=n.get(v[ue]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,de.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ue,i.TEXTURE_2D,we,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,de.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.resolveDepthBuffer===!1&&l){const v=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[v])}}}function ht(C){return Math.min(s.maxSamples,C.samples)}function Mt(C){const v=n.get(C);return C.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&v.__useRenderToTexture!==!1}function U(C){const v=a.render.frame;u.get(C)!==v&&(u.set(C,v),C.update())}function Qt(C,v){const B=C.colorSpace,W=C.format,Y=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||B!==co&&B!==Ni&&(Xe.getTransfer(B)===tt?(W!==vn||Y!==cn)&&Pe("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):He("WebGLTextures: Unsupported texture color space:",B)),v}function et(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(c.width=C.naturalWidth||C.width,c.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(c.width=C.displayWidth,c.height=C.displayHeight):(c.width=C.width,c.height=C.height),c}this.allocateTextureUnit=N,this.resetTextureUnits=z,this.getTextureUnits=X,this.setTextureUnits=O,this.setTexture2D=$,this.setTexture2DArray=j,this.setTexture3D=re,this.setTextureCube=se,this.rebindTextures=Je,this.setupRenderTarget=Ye,this.updateRenderTargetMipmap=yt,this.updateMultisampleRenderTarget=Ut,this.setupDepthRenderbuffer=rt,this.setupFrameBufferTexture=Ie,this.useMultisampledRTT=Mt,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function Jb(i,e){function t(n,s=Ni){let r;const a=Xe.getTransfer(s);if(n===cn)return i.UNSIGNED_BYTE;if(n===Xc)return i.UNSIGNED_SHORT_4_4_4_4;if(n===qc)return i.UNSIGNED_SHORT_5_5_5_1;if(n===cf)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===df)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===of)return i.BYTE;if(n===lf)return i.SHORT;if(n===Fr)return i.UNSIGNED_SHORT;if(n===Wc)return i.INT;if(n===Yn)return i.UNSIGNED_INT;if(n===Pn)return i.FLOAT;if(n===gi)return i.HALF_FLOAT;if(n===uf)return i.ALPHA;if(n===hf)return i.RGB;if(n===vn)return i.RGBA;if(n===_i)return i.DEPTH_COMPONENT;if(n===ds)return i.DEPTH_STENCIL;if(n===ff)return i.RED;if(n===$c)return i.RED_INTEGER;if(n===xs)return i.RG;if(n===Yc)return i.RG_INTEGER;if(n===Kc)return i.RGBA_INTEGER;if(n===Ja||n===ja||n===Qa||n===eo)if(a===tt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Ja)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===ja)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Qa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===eo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Ja)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===ja)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Qa)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===eo)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===jl||n===Ql||n===ec||n===tc)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===jl)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Ql)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===ec)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===tc)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===nc||n===ic||n===sc||n===rc||n===ac||n===oo||n===oc)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===nc||n===ic)return a===tt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===sc)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===rc)return r.COMPRESSED_R11_EAC;if(n===ac)return r.COMPRESSED_SIGNED_R11_EAC;if(n===oo)return r.COMPRESSED_RG11_EAC;if(n===oc)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===lc||n===cc||n===dc||n===uc||n===hc||n===fc||n===pc||n===mc||n===gc||n===_c||n===vc||n===xc||n===bc||n===yc)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===lc)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===cc)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===dc)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===uc)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===hc)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===fc)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===pc)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===mc)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===gc)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===_c)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===vc)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===xc)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===bc)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===yc)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Mc||n===Sc||n===Ec)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===Mc)return a===tt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Sc)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Ec)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Tc||n===Ac||n===lo||n===wc)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===Tc)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Ac)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===lo)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===wc)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Or?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}const jb=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Qb=`
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

}`;class ey{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const n=new Sf(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new Kn({vertexShader:jb,fragmentShader:Qb,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new gt(new Do(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class ty extends Ki{constructor(e,t){super();const n=this;let s=null,r=1,a=null,o="local-floor",l=1,c=null,u=null,h=null,d=null,f=null,g=null;const x=typeof XRWebGLBinding<"u",m=new ey,p={},E=t.getContextAttributes();let A=null,b=null;const T=[],y=[],w=new Ne;let _=null;const M=new Xt;M.viewport=new st;const P=new Xt;P.viewport=new st;const R=[M,P],L=new o_;let z=null,X=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(k){let Z=T[k];return Z===void 0&&(Z=new nl,T[k]=Z),Z.getTargetRaySpace()},this.getControllerGrip=function(k){let Z=T[k];return Z===void 0&&(Z=new nl,T[k]=Z),Z.getGripSpace()},this.getHand=function(k){let Z=T[k];return Z===void 0&&(Z=new nl,T[k]=Z),Z.getHandSpace()};function O(k){const Z=y.indexOf(k.inputSource);if(Z===-1)return;const te=T[Z];te!==void 0&&(te.update(k.inputSource,k.frame,c||a),te.dispatchEvent({type:k.type,data:k.inputSource}))}function N(){s.removeEventListener("select",O),s.removeEventListener("selectstart",O),s.removeEventListener("selectend",O),s.removeEventListener("squeeze",O),s.removeEventListener("squeezestart",O),s.removeEventListener("squeezeend",O),s.removeEventListener("end",N),s.removeEventListener("inputsourceschange",V);for(let k=0;k<T.length;k++){const Z=y[k];Z!==null&&(y[k]=null,T[k].disconnect(Z))}z=null,X=null,m.reset();for(const k in p)delete p[k];e.setRenderTarget(A),f=null,d=null,h=null,s=null,b=null,le.stop(),n.isPresenting=!1,e.setPixelRatio(_),e.setSize(w.width,w.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(k){r=k,n.isPresenting===!0&&Pe("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(k){o=k,n.isPresenting===!0&&Pe("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(k){c=k},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return h===null&&x&&(h=new XRWebGLBinding(s,t)),h},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(k){if(s=k,s!==null){if(A=e.getRenderTarget(),s.addEventListener("select",O),s.addEventListener("selectstart",O),s.addEventListener("selectend",O),s.addEventListener("squeeze",O),s.addEventListener("squeezestart",O),s.addEventListener("squeezeend",O),s.addEventListener("end",N),s.addEventListener("inputsourceschange",V),E.xrCompatible!==!0&&await t.makeXRCompatible(),_=e.getPixelRatio(),e.getSize(w),x&&"createProjectionLayer"in XRWebGLBinding.prototype){let te=null,Ae=null,Ue=null;E.depth&&(Ue=E.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,te=E.stencil?ds:_i,Ae=E.stencil?Or:Yn);const Ie={colorFormat:t.RGBA8,depthFormat:Ue,scaleFactor:r};h=this.getBinding(),d=h.createProjectionLayer(Ie),s.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),b=new $n(d.textureWidth,d.textureHeight,{format:vn,type:cn,depthTexture:new ar(d.textureWidth,d.textureHeight,Ae,void 0,void 0,void 0,void 0,void 0,void 0,te),stencilBuffer:E.stencil,colorSpace:e.outputColorSpace,samples:E.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}else{const te={antialias:E.antialias,alpha:!0,depth:E.depth,stencil:E.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,t,te),s.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),b=new $n(f.framebufferWidth,f.framebufferHeight,{format:vn,type:cn,colorSpace:e.outputColorSpace,stencilBuffer:E.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}b.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),le.setContext(s),le.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function V(k){for(let Z=0;Z<k.removed.length;Z++){const te=k.removed[Z],Ae=y.indexOf(te);Ae>=0&&(y[Ae]=null,T[Ae].disconnect(te))}for(let Z=0;Z<k.added.length;Z++){const te=k.added[Z];let Ae=y.indexOf(te);if(Ae===-1){for(let Ie=0;Ie<T.length;Ie++)if(Ie>=y.length){y.push(te),Ae=Ie;break}else if(y[Ie]===null){y[Ie]=te,Ae=Ie;break}if(Ae===-1)break}const Ue=T[Ae];Ue&&Ue.connect(te)}}const $=new I,j=new I;function re(k,Z,te){$.setFromMatrixPosition(Z.matrixWorld),j.setFromMatrixPosition(te.matrixWorld);const Ae=$.distanceTo(j),Ue=Z.projectionMatrix.elements,Ie=te.projectionMatrix.elements,vt=Ue[14]/(Ue[10]-1),$e=Ue[14]/(Ue[10]+1),rt=(Ue[9]+1)/Ue[5],Je=(Ue[9]-1)/Ue[5],Ye=(Ue[8]-1)/Ue[0],yt=(Ie[8]+1)/Ie[0],Et=vt*Ye,Lt=vt*yt,Ut=Ae/(-Ye+yt),ht=Ut*-Ye;if(Z.matrixWorld.decompose(k.position,k.quaternion,k.scale),k.translateX(ht),k.translateZ(Ut),k.matrixWorld.compose(k.position,k.quaternion,k.scale),k.matrixWorldInverse.copy(k.matrixWorld).invert(),Ue[10]===-1)k.projectionMatrix.copy(Z.projectionMatrix),k.projectionMatrixInverse.copy(Z.projectionMatrixInverse);else{const Mt=vt+Ut,U=$e+Ut,Qt=Et-ht,et=Lt+(Ae-ht),C=rt*$e/U*Mt,v=Je*$e/U*Mt;k.projectionMatrix.makePerspective(Qt,et,C,v,Mt,U),k.projectionMatrixInverse.copy(k.projectionMatrix).invert()}}function se(k,Z){Z===null?k.matrixWorld.copy(k.matrix):k.matrixWorld.multiplyMatrices(Z.matrixWorld,k.matrix),k.matrixWorldInverse.copy(k.matrixWorld).invert()}this.updateCamera=function(k){if(s===null)return;let Z=k.near,te=k.far;m.texture!==null&&(m.depthNear>0&&(Z=m.depthNear),m.depthFar>0&&(te=m.depthFar)),L.near=P.near=M.near=Z,L.far=P.far=M.far=te,(z!==L.near||X!==L.far)&&(s.updateRenderState({depthNear:L.near,depthFar:L.far}),z=L.near,X=L.far),L.layers.mask=k.layers.mask|6,M.layers.mask=L.layers.mask&-5,P.layers.mask=L.layers.mask&-3;const Ae=k.parent,Ue=L.cameras;se(L,Ae);for(let Ie=0;Ie<Ue.length;Ie++)se(Ue[Ie],Ae);Ue.length===2?re(L,M,P):L.projectionMatrix.copy(M.projectionMatrix),ae(k,L,Ae)};function ae(k,Z,te){te===null?k.matrix.copy(Z.matrixWorld):(k.matrix.copy(te.matrixWorld),k.matrix.invert(),k.matrix.multiply(Z.matrixWorld)),k.matrix.decompose(k.position,k.quaternion,k.scale),k.updateMatrixWorld(!0),k.projectionMatrix.copy(Z.projectionMatrix),k.projectionMatrixInverse.copy(Z.projectionMatrixInverse),k.isPerspectiveCamera&&(k.fov=rr*2*Math.atan(1/k.projectionMatrix.elements[5]),k.zoom=1)}this.getCamera=function(){return L},this.getFoveation=function(){if(!(d===null&&f===null))return l},this.setFoveation=function(k){l=k,d!==null&&(d.fixedFoveation=k),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=k)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(L)},this.getCameraTexture=function(k){return p[k]};let xe=null;function be(k,Z){if(u=Z.getViewerPose(c||a),g=Z,u!==null){const te=u.views;f!==null&&(e.setRenderTargetFramebuffer(b,f.framebuffer),e.setRenderTarget(b));let Ae=!1;te.length!==L.cameras.length&&(L.cameras.length=0,Ae=!0);for(let $e=0;$e<te.length;$e++){const rt=te[$e];let Je=null;if(f!==null)Je=f.getViewport(rt);else{const yt=h.getViewSubImage(d,rt);Je=yt.viewport,$e===0&&(e.setRenderTargetTextures(b,yt.colorTexture,yt.depthStencilTexture),e.setRenderTarget(b))}let Ye=R[$e];Ye===void 0&&(Ye=new Xt,Ye.layers.enable($e),Ye.viewport=new st,R[$e]=Ye),Ye.matrix.fromArray(rt.transform.matrix),Ye.matrix.decompose(Ye.position,Ye.quaternion,Ye.scale),Ye.projectionMatrix.fromArray(rt.projectionMatrix),Ye.projectionMatrixInverse.copy(Ye.projectionMatrix).invert(),Ye.viewport.set(Je.x,Je.y,Je.width,Je.height),$e===0&&(L.matrix.copy(Ye.matrix),L.matrix.decompose(L.position,L.quaternion,L.scale)),Ae===!0&&L.cameras.push(Ye)}const Ue=s.enabledFeatures;if(Ue&&Ue.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&x){h=n.getBinding();const $e=h.getDepthInformation(te[0]);$e&&$e.isValid&&$e.texture&&m.init($e,s.renderState)}if(Ue&&Ue.includes("camera-access")&&x){e.state.unbindTexture(),h=n.getBinding();for(let $e=0;$e<te.length;$e++){const rt=te[$e].camera;if(rt){let Je=p[rt];Je||(Je=new Sf,p[rt]=Je);const Ye=h.getCameraImage(rt);Je.sourceTexture=Ye}}}}for(let te=0;te<T.length;te++){const Ae=y[te],Ue=T[te];Ae!==null&&Ue!==void 0&&Ue.update(Ae,Z,c||a)}xe&&xe(k,Z),Z.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:Z}),g=null}const le=new Uf;le.setAnimationLoop(be),this.setAnimationLoop=function(k){xe=k},this.dispose=function(){}}}const ny=new Fe,Gf=new Be;Gf.set(-1,0,0,0,1,0,0,0,1);function iy(i,e){function t(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,Rf(i)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function s(m,p,E,A,b){p.isNodeMaterial?p.uniformsNeedUpdate=!1:p.isMeshBasicMaterial?r(m,p):p.isMeshLambertMaterial?(r(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshToonMaterial?(r(m,p),h(m,p)):p.isMeshPhongMaterial?(r(m,p),u(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshStandardMaterial?(r(m,p),d(m,p),p.isMeshPhysicalMaterial&&f(m,p,b)):p.isMeshMatcapMaterial?(r(m,p),g(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),x(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(a(m,p),p.isLineDashedMaterial&&o(m,p)):p.isPointsMaterial?l(m,p,E,A):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,t(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===nn&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,t(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===nn&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,t(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,t(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);const E=e.get(p),A=E.envMap,b=E.envMapRotation;A&&(m.envMap.value=A,m.envMapRotation.value.setFromMatrix4(ny.makeRotationFromEuler(b)).transpose(),A.isCubeTexture&&A.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(Gf),m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,m.aoMapTransform))}function a(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform))}function o(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,E,A){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*E,m.scale.value=A*.5,p.map&&(m.map.value=p.map,t(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function u(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function h(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function d(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function f(m,p,E){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===nn&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=E.texture,m.transmissionSamplerSize.value.set(E.width,E.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function x(m,p){const E=e.get(p).light;m.referencePosition.value.setFromMatrixPosition(E.matrixWorld),m.nearDistance.value=E.shadow.camera.near,m.farDistance.value=E.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function sy(i,e,t,n){let s={},r={},a=[];const o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(b,T){const y=T.program;n.uniformBlockBinding(b,y)}function c(b,T){let y=s[b.id];y===void 0&&(m(b),y=u(b),s[b.id]=y,b.addEventListener("dispose",E));const w=T.program;n.updateUBOMapping(b,w);const _=e.render.frame;r[b.id]!==_&&(d(b),r[b.id]=_)}function u(b){const T=h();b.__bindingPointIndex=T;const y=i.createBuffer(),w=b.__size,_=b.usage;return i.bindBuffer(i.UNIFORM_BUFFER,y),i.bufferData(i.UNIFORM_BUFFER,w,_),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,T,y),y}function h(){for(let b=0;b<o;b++)if(a.indexOf(b)===-1)return a.push(b),b;return He("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(b){const T=s[b.id],y=b.uniforms,w=b.__cache;i.bindBuffer(i.UNIFORM_BUFFER,T);for(let _=0,M=y.length;_<M;_++){const P=y[_];if(Array.isArray(P))for(let R=0,L=P.length;R<L;R++)f(P[R],_,R,w);else f(P,_,0,w)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function f(b,T,y,w){if(x(b,T,y,w)===!0){const _=b.__offset,M=b.value;if(Array.isArray(M)){let P=0;for(let R=0;R<M.length;R++){const L=M[R],z=p(L);g(L,b.__data,P),typeof L!="number"&&typeof L!="boolean"&&!L.isMatrix3&&!ArrayBuffer.isView(L)&&(P+=z.storage/Float32Array.BYTES_PER_ELEMENT)}}else g(M,b.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,_,b.__data)}}function g(b,T,y){typeof b=="number"||typeof b=="boolean"?T[0]=b:b.isMatrix3?(T[0]=b.elements[0],T[1]=b.elements[1],T[2]=b.elements[2],T[3]=0,T[4]=b.elements[3],T[5]=b.elements[4],T[6]=b.elements[5],T[7]=0,T[8]=b.elements[6],T[9]=b.elements[7],T[10]=b.elements[8],T[11]=0):ArrayBuffer.isView(b)?T.set(new b.constructor(b.buffer,b.byteOffset,T.length)):b.toArray(T,y)}function x(b,T,y,w){const _=b.value,M=T+"_"+y;if(w[M]===void 0)return typeof _=="number"||typeof _=="boolean"?w[M]=_:ArrayBuffer.isView(_)?w[M]=_.slice():w[M]=_.clone(),!0;{const P=w[M];if(typeof _=="number"||typeof _=="boolean"){if(P!==_)return w[M]=_,!0}else{if(ArrayBuffer.isView(_))return!0;if(P.equals(_)===!1)return P.copy(_),!0}}return!1}function m(b){const T=b.uniforms;let y=0;const w=16;for(let M=0,P=T.length;M<P;M++){const R=Array.isArray(T[M])?T[M]:[T[M]];for(let L=0,z=R.length;L<z;L++){const X=R[L],O=Array.isArray(X.value)?X.value:[X.value];for(let N=0,V=O.length;N<V;N++){const $=O[N],j=p($),re=y%w,se=re%j.boundary,ae=re+se;y+=se,ae!==0&&w-ae<j.storage&&(y+=w-ae),X.__data=new Float32Array(j.storage/Float32Array.BYTES_PER_ELEMENT),X.__offset=y,y+=j.storage}}}const _=y%w;return _>0&&(y+=w-_),b.__size=y,b.__cache={},this}function p(b){const T={boundary:0,storage:0};return typeof b=="number"||typeof b=="boolean"?(T.boundary=4,T.storage=4):b.isVector2?(T.boundary=8,T.storage=8):b.isVector3||b.isColor?(T.boundary=16,T.storage=12):b.isVector4?(T.boundary=16,T.storage=16):b.isMatrix3?(T.boundary=48,T.storage=48):b.isMatrix4?(T.boundary=64,T.storage=64):b.isTexture?Pe("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(b)?(T.boundary=16,T.storage=b.byteLength):Pe("WebGLRenderer: Unsupported uniform value type.",b),T}function E(b){const T=b.target;T.removeEventListener("dispose",E);const y=a.indexOf(T.__bindingPointIndex);a.splice(y,1),i.deleteBuffer(s[T.id]),delete s[T.id],delete r[T.id]}function A(){for(const b in s)i.deleteBuffer(s[b]);a=[],s={},r={}}return{bind:l,update:c,dispose:A}}const ry=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let On=null;function ay(){return On===null&&(On=new ho(ry,16,16,xs,gi),On.name="DFG_LUT",On.minFilter=Rt,On.magFilter=Rt,On.wrapS=dn,On.wrapT=dn,On.generateMipmaps=!1,On.needsUpdate=!0),On}class oy{constructor(e={}){const{canvas:t=Em(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1,reversedDepthBuffer:d=!1,outputBufferType:f=cn}=e;this.isWebGLRenderer=!0;let g;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=n.getContextAttributes().alpha}else g=a;const x=f,m=new Set([Kc,Yc,$c]),p=new Set([cn,Yn,Fr,Or,Xc,qc]),E=new Uint32Array(4),A=new Int32Array(4),b=new I;let T=null,y=null;const w=[],_=[];let M=null;this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=qn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const P=this;let R=!1,L=null,z=null,X=null,O=null;this._outputColorSpace=dt;let N=0,V=0,$=null,j=-1,re=null;const se=new st,ae=new st;let xe=null;const be=new Oe(0);let le=0,k=t.width,Z=t.height,te=1,Ae=null,Ue=null;const Ie=new st(0,0,k,Z),vt=new st(0,0,k,Z);let $e=!1;const rt=new nd;let Je=!1,Ye=!1;const yt=new Fe,Et=new I,Lt=new st,Ut={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let ht=!1;function Mt(){return $===null?te:1}let U=n;function Qt(S,F){return t.getContext(S,F)}try{const S={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${Hc}`),t.addEventListener("webglcontextlost",ft,!1),t.addEventListener("webglcontextrestored",lt,!1),t.addEventListener("webglcontextcreationerror",In,!1),U===null){const F="webgl2";if(U=Qt(F,S),U===null)throw Qt(F)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}}catch(S){throw He("WebGLRenderer: "+S.message),S}let et,C,v,B,W,Y,oe,de,K,ee,ue,we,pe,he,Le,De,ze,D,ce,Q,fe,ve,ie;function Te(){et=new ax(U),et.init(),fe=new Jb(U,et),C=new jv(U,et,e,fe),v=new Kb(U,et),C.reversedDepthBuffer&&d&&v.buffers.depth.setReversed(!0),z=U.createFramebuffer(),X=U.createFramebuffer(),O=U.createFramebuffer(),B=new cx(U),W=new Ub,Y=new Zb(U,et,v,W,C,fe,B),oe=new rx(P),de=new f_(U),ve=new Zv(U,de),K=new ox(U,de,B,ve),ee=new ux(U,K,de,ve,B),D=new dx(U,C,Y),Le=new Qv(W),ue=new Db(P,oe,et,C,ve,Le),we=new iy(P,W),pe=new Ob,he=new Hb(et),ze=new Kv(P,oe,v,ee,g,l),De=new Yb(P,ee,C),ie=new sy(U,B,C,v),ce=new Jv(U,et,B),Q=new lx(U,et,B),B.programs=ue.programs,P.capabilities=C,P.extensions=et,P.properties=W,P.renderLists=pe,P.shadowMap=De,P.state=v,P.info=B}Te(),x!==cn&&(M=new fx(x,t.width,t.height,o,s,r));const Se=new ty(P,U);this.xr=Se,this.getContext=function(){return U},this.getContextAttributes=function(){return U.getContextAttributes()},this.forceContextLoss=function(){const S=et.get("WEBGL_lose_context");S&&S.loseContext()},this.forceContextRestore=function(){const S=et.get("WEBGL_lose_context");S&&S.restoreContext()},this.getPixelRatio=function(){return te},this.setPixelRatio=function(S){S!==void 0&&(te=S,this.setSize(k,Z,!1))},this.getSize=function(S){return S.set(k,Z)},this.setSize=function(S,F,q=!0){if(Se.isPresenting){Pe("WebGLRenderer: Can't change size while VR device is presenting.");return}k=S,Z=F,t.width=Math.floor(S*te),t.height=Math.floor(F*te),q===!0&&(t.style.width=S+"px",t.style.height=F+"px"),M!==null&&M.setSize(t.width,t.height),this.setViewport(0,0,S,F)},this.getDrawingBufferSize=function(S){return S.set(k*te,Z*te).floor()},this.setDrawingBufferSize=function(S,F,q){k=S,Z=F,te=q,t.width=Math.floor(S*q),t.height=Math.floor(F*q),this.setViewport(0,0,S,F)},this.setEffects=function(S){if(x===cn){He("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(S){for(let F=0;F<S.length;F++)if(S[F].isOutputPass===!0){Pe("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}M.setEffects(S||[])},this.getCurrentViewport=function(S){return S.copy(se)},this.getViewport=function(S){return S.copy(Ie)},this.setViewport=function(S,F,q,G){S.isVector4?Ie.set(S.x,S.y,S.z,S.w):Ie.set(S,F,q,G),v.viewport(se.copy(Ie).multiplyScalar(te).round())},this.getScissor=function(S){return S.copy(vt)},this.setScissor=function(S,F,q,G){S.isVector4?vt.set(S.x,S.y,S.z,S.w):vt.set(S,F,q,G),v.scissor(ae.copy(vt).multiplyScalar(te).round())},this.getScissorTest=function(){return $e},this.setScissorTest=function(S){v.setScissorTest($e=S)},this.setOpaqueSort=function(S){Ae=S},this.setTransparentSort=function(S){Ue=S},this.getClearColor=function(S){return S.copy(ze.getClearColor())},this.setClearColor=function(){ze.setClearColor(...arguments)},this.getClearAlpha=function(){return ze.getClearAlpha()},this.setClearAlpha=function(){ze.setClearAlpha(...arguments)},this.clear=function(S=!0,F=!0,q=!0){let G=0;if(S){let H=!1;if($!==null){const _e=$.texture.format;H=m.has(_e)}if(H){const _e=$.texture.type,Me=p.has(_e),ge=ze.getClearColor(),Ee=ze.getClearAlpha(),Re=ge.r,Ve=ge.g,We=ge.b;Me?(E[0]=Re,E[1]=Ve,E[2]=We,E[3]=Ee,U.clearBufferuiv(U.COLOR,0,E)):(A[0]=Re,A[1]=Ve,A[2]=We,A[3]=Ee,U.clearBufferiv(U.COLOR,0,A))}else G|=U.COLOR_BUFFER_BIT}F&&(G|=U.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),q&&(G|=U.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),G!==0&&U.clear(G)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(S){S.setRenderer(this),L=S},this.dispose=function(){t.removeEventListener("webglcontextlost",ft,!1),t.removeEventListener("webglcontextrestored",lt,!1),t.removeEventListener("webglcontextcreationerror",In,!1),ze.dispose(),pe.dispose(),he.dispose(),W.dispose(),oe.dispose(),ee.dispose(),ve.dispose(),ie.dispose(),ue.dispose(),Se.dispose(),Se.removeEventListener("sessionstart",Gd),Se.removeEventListener("sessionend",Hd),Qi.stop()};function ft(S){S.preventDefault(),lu("WebGLRenderer: Context Lost."),R=!0}function lt(){lu("WebGLRenderer: Context Restored."),R=!1;const S=B.autoReset,F=De.enabled,q=De.autoUpdate,G=De.needsUpdate,H=De.type;Te(),B.autoReset=S,De.enabled=F,De.autoUpdate=q,De.needsUpdate=G,De.type=H}function In(S){He("WebGLRenderer: A WebGL context could not be created. Reason: ",S.statusMessage)}function Dn(S){const F=S.target;F.removeEventListener("dispose",Dn),Up(F)}function Up(S){Fp(S),W.remove(S)}function Fp(S){const F=W.get(S).programs;F!==void 0&&(F.forEach(function(q){ue.releaseProgram(q)}),S.isShaderMaterial&&ue.releaseShaderCache(S))}this.renderBufferDirect=function(S,F,q,G,H,_e){F===null&&(F=Ut);const Me=H.isMesh&&H.matrixWorld.determinantAffine()<0,ge=Bp(S,F,q,G,H);v.setMaterial(G,Me);let Ee=q.index,Re=1;if(G.wireframe===!0){if(Ee=K.getWireframeAttribute(q),Ee===void 0)return;Re=2}const Ve=q.drawRange,We=q.attributes.position;let Ce=Ve.start*Re,nt=(Ve.start+Ve.count)*Re;_e!==null&&(Ce=Math.max(Ce,_e.start*Re),nt=Math.min(nt,(_e.start+_e.count)*Re)),Ee!==null?(Ce=Math.max(Ce,0),nt=Math.min(nt,Ee.count)):We!=null&&(Ce=Math.max(Ce,0),nt=Math.min(nt,We.count));const xt=nt-Ce;if(xt<0||xt===1/0)return;ve.setup(H,G,ge,q,Ee);let pt,at=ce;if(Ee!==null&&(pt=de.get(Ee),at=Q,at.setIndex(pt)),H.isMesh)G.wireframe===!0?(v.setLineWidth(G.wireframeLinewidth*Mt()),at.setMode(U.LINES)):at.setMode(U.TRIANGLES);else if(H.isLine){let Gt=G.linewidth;Gt===void 0&&(Gt=1),v.setLineWidth(Gt*Mt()),H.isLineSegments?at.setMode(U.LINES):H.isLineLoop?at.setMode(U.LINE_LOOP):at.setMode(U.LINE_STRIP)}else H.isPoints?at.setMode(U.POINTS):H.isSprite&&at.setMode(U.TRIANGLES);if(H.isBatchedMesh)if(et.get("WEBGL_multi_draw"))at.renderMultiDraw(H._multiDrawStarts,H._multiDrawCounts,H._multiDrawCount);else{const Gt=H._multiDrawStarts,ye=H._multiDrawCounts,sn=H._multiDrawCount,Ke=Ee?de.get(Ee).bytesPerElement:1,fn=W.get(G).currentProgram.getUniforms();for(let Un=0;Un<sn;Un++)fn.setValue(U,"_gl_DrawID",Un),at.render(Gt[Un]/Ke,ye[Un])}else if(H.isInstancedMesh)at.renderInstances(Ce,xt,H.count);else if(q.isInstancedBufferGeometry){const Gt=q._maxInstanceCount!==void 0?q._maxInstanceCount:1/0,ye=Math.min(q.instanceCount,Gt);at.renderInstances(Ce,xt,ye)}else at.render(Ce,xt)};function Vd(S,F,q){S.transparent===!0&&S.side===Rn&&S.forceSinglePass===!1?(S.side=nn,S.needsUpdate=!0,da(S,F,q),S.side=mi,S.needsUpdate=!0,da(S,F,q),S.side=Rn):da(S,F,q)}this.compile=function(S,F,q=null){q===null&&(q=S),y=he.get(q),y.init(F),_.push(y),q.traverseVisible(function(H){H.isLight&&H.layers.test(F.layers)&&(y.pushLight(H),H.castShadow&&y.pushShadow(H))}),S!==q&&S.traverseVisible(function(H){H.isLight&&H.layers.test(F.layers)&&(y.pushLight(H),H.castShadow&&y.pushShadow(H))}),y.setupLights();const G=new Set;return S.traverse(function(H){if(!(H.isMesh||H.isPoints||H.isLine||H.isSprite))return;const _e=H.material;if(_e)if(Array.isArray(_e))for(let Me=0;Me<_e.length;Me++){const ge=_e[Me];Vd(ge,q,H),G.add(ge)}else Vd(_e,q,H),G.add(_e)}),y=_.pop(),G},this.compileAsync=function(S,F,q=null){const G=this.compile(S,F,q);return new Promise(H=>{function _e(){if(G.forEach(function(Me){W.get(Me).currentProgram.isReady()&&G.delete(Me)}),G.size===0){H(S);return}setTimeout(_e,10)}et.get("KHR_parallel_shader_compile")!==null?_e():setTimeout(_e,10)})};let Xo=null;function Op(S){Xo&&Xo(S)}function Gd(){Qi.stop()}function Hd(){Qi.start()}const Qi=new Uf;Qi.setAnimationLoop(Op),typeof self<"u"&&Qi.setContext(self),this.setAnimationLoop=function(S){Xo=S,Se.setAnimationLoop(S),S===null?Qi.stop():Qi.start()},Se.addEventListener("sessionstart",Gd),Se.addEventListener("sessionend",Hd),this.render=function(S,F){if(F!==void 0&&F.isCamera!==!0){He("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(R===!0)return;L!==null&&L.renderStart(S,F);const q=Se.enabled===!0&&Se.isPresenting===!0,G=M!==null&&($===null||q)&&M.begin(P,$);if(S.matrixWorldAutoUpdate===!0&&S.updateMatrixWorld(),F.parent===null&&F.matrixWorldAutoUpdate===!0&&F.updateMatrixWorld(),Se.enabled===!0&&Se.isPresenting===!0&&(M===null||M.isCompositing()===!1)&&(Se.cameraAutoUpdate===!0&&Se.updateCamera(F),F=Se.getCamera()),S.isScene===!0&&S.onBeforeRender(P,S,F,$),y=he.get(S,_.length),y.init(F),y.state.textureUnits=Y.getTextureUnits(),_.push(y),yt.multiplyMatrices(F.projectionMatrix,F.matrixWorldInverse),rt.setFromProjectionMatrix(yt,Hn,F.reversedDepth),Ye=this.localClippingEnabled,Je=Le.init(this.clippingPlanes,Ye),T=pe.get(S,w.length),T.init(),w.push(T),Se.enabled===!0&&Se.isPresenting===!0){const Me=P.xr.getDepthSensingMesh();Me!==null&&qo(Me,F,-1/0,P.sortObjects)}qo(S,F,0,P.sortObjects),T.finish(),P.sortObjects===!0&&T.sort(Ae,Ue,F.reversedDepth),ht=Se.enabled===!1||Se.isPresenting===!1||Se.hasDepthSensing()===!1,ht&&ze.addToRenderList(T,S),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),Je===!0&&Le.beginShadows();const H=y.state.shadowsArray;if(De.render(H,S,F),Je===!0&&Le.endShadows(),(G&&M.hasRenderPass())===!1){const Me=T.opaque,ge=T.transmissive;if(y.setupLights(),F.isArrayCamera){const Ee=F.cameras;if(ge.length>0)for(let Re=0,Ve=Ee.length;Re<Ve;Re++){const We=Ee[Re];Xd(Me,ge,S,We)}ht&&ze.render(S);for(let Re=0,Ve=Ee.length;Re<Ve;Re++){const We=Ee[Re];Wd(T,S,We,We.viewport)}}else ge.length>0&&Xd(Me,ge,S,F),ht&&ze.render(S),Wd(T,S,F)}$!==null&&V===0&&(Y.updateMultisampleRenderTarget($),Y.updateRenderTargetMipmap($)),G&&M.end(P),S.isScene===!0&&S.onAfterRender(P,S,F),ve.resetDefaultState(),j=-1,re=null,_.pop(),_.length>0?(y=_[_.length-1],Y.setTextureUnits(y.state.textureUnits),Je===!0&&Le.setGlobalState(P.clippingPlanes,y.state.camera)):y=null,w.pop(),w.length>0?T=w[w.length-1]:T=null,L!==null&&L.renderEnd()};function qo(S,F,q,G){if(S.visible===!1)return;if(S.layers.test(F.layers)){if(S.isGroup)q=S.renderOrder;else if(S.isLOD)S.autoUpdate===!0&&S.update(F);else if(S.isLightProbeGrid)y.pushLightProbeGrid(S);else if(S.isLight)y.pushLight(S),S.castShadow&&y.pushShadow(S);else if(S.isSprite){if(!S.frustumCulled||rt.intersectsSprite(S)){G&&Lt.setFromMatrixPosition(S.matrixWorld).applyMatrix4(yt);const Me=ee.update(S),ge=S.material;ge.visible&&T.push(S,Me,ge,q,Lt.z,null)}}else if((S.isMesh||S.isLine||S.isPoints)&&(!S.frustumCulled||rt.intersectsObject(S))){const Me=ee.update(S),ge=S.material;if(G&&(S.boundingSphere!==void 0?(S.boundingSphere===null&&S.computeBoundingSphere(),Lt.copy(S.boundingSphere.center)):(Me.boundingSphere===null&&Me.computeBoundingSphere(),Lt.copy(Me.boundingSphere.center)),Lt.applyMatrix4(S.matrixWorld).applyMatrix4(yt)),Array.isArray(ge)){const Ee=Me.groups;for(let Re=0,Ve=Ee.length;Re<Ve;Re++){const We=Ee[Re],Ce=ge[We.materialIndex];Ce&&Ce.visible&&T.push(S,Me,Ce,q,Lt.z,We)}}else ge.visible&&T.push(S,Me,ge,q,Lt.z,null)}}const _e=S.children;for(let Me=0,ge=_e.length;Me<ge;Me++)qo(_e[Me],F,q,G)}function Wd(S,F,q,G){const{opaque:H,transmissive:_e,transparent:Me}=S;y.setupLightsView(q),Je===!0&&Le.setGlobalState(P.clippingPlanes,q),G&&v.viewport(se.copy(G)),H.length>0&&ca(H,F,q),_e.length>0&&ca(_e,F,q),Me.length>0&&ca(Me,F,q),v.buffers.depth.setTest(!0),v.buffers.depth.setMask(!0),v.buffers.color.setMask(!0),v.setPolygonOffset(!1)}function Xd(S,F,q,G){if((q.isScene===!0?q.overrideMaterial:null)!==null)return;if(y.state.transmissionRenderTarget[G.id]===void 0){const Ce=et.has("EXT_color_buffer_half_float")||et.has("EXT_color_buffer_float");y.state.transmissionRenderTarget[G.id]=new $n(1,1,{generateMipmaps:!0,type:Ce?gi:cn,minFilter:ai,samples:Math.max(4,C.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Xe.workingColorSpace})}const _e=y.state.transmissionRenderTarget[G.id],Me=G.viewport||se;_e.setSize(Me.z*P.transmissionResolutionScale,Me.w*P.transmissionResolutionScale);const ge=P.getRenderTarget(),Ee=P.getActiveCubeFace(),Re=P.getActiveMipmapLevel();P.setRenderTarget(_e),P.getClearColor(be),le=P.getClearAlpha(),le<1&&P.setClearColor(16777215,.5),P.clear(),ht&&ze.render(q);const Ve=P.toneMapping;P.toneMapping=qn;const We=G.viewport;if(G.viewport!==void 0&&(G.viewport=void 0),y.setupLightsView(G),Je===!0&&Le.setGlobalState(P.clippingPlanes,G),ca(S,q,G),Y.updateMultisampleRenderTarget(_e),Y.updateRenderTargetMipmap(_e),et.has("WEBGL_multisampled_render_to_texture")===!1){let Ce=!1;for(let nt=0,xt=F.length;nt<xt;nt++){const pt=F[nt],{object:at,geometry:Gt,material:ye,group:sn}=pt;if(ye.side===Rn&&at.layers.test(G.layers)){const Ke=ye.side;ye.side=nn,ye.needsUpdate=!0,qd(at,q,G,Gt,ye,sn),ye.side=Ke,ye.needsUpdate=!0,Ce=!0}}Ce===!0&&(Y.updateMultisampleRenderTarget(_e),Y.updateRenderTargetMipmap(_e))}P.setRenderTarget(ge,Ee,Re),P.setClearColor(be,le),We!==void 0&&(G.viewport=We),P.toneMapping=Ve}function ca(S,F,q){const G=F.isScene===!0?F.overrideMaterial:null;for(let H=0,_e=S.length;H<_e;H++){const Me=S[H],{object:ge,geometry:Ee,group:Re}=Me;let Ve=Me.material;Ve.allowOverride===!0&&G!==null&&(Ve=G),ge.layers.test(q.layers)&&qd(ge,F,q,Ee,Ve,Re)}}function qd(S,F,q,G,H,_e){S.onBeforeRender(P,F,q,G,H,_e),S.modelViewMatrix.multiplyMatrices(q.matrixWorldInverse,S.matrixWorld),S.normalMatrix.getNormalMatrix(S.modelViewMatrix),H.onBeforeRender(P,F,q,G,S,_e),H.transparent===!0&&H.side===Rn&&H.forceSinglePass===!1?(H.side=nn,H.needsUpdate=!0,P.renderBufferDirect(q,F,G,H,S,_e),H.side=mi,H.needsUpdate=!0,P.renderBufferDirect(q,F,G,H,S,_e),H.side=Rn):P.renderBufferDirect(q,F,G,H,S,_e),S.onAfterRender(P,F,q,G,H,_e)}function da(S,F,q){F.isScene!==!0&&(F=Ut);const G=W.get(S),H=y.state.lights,_e=y.state.shadowsArray,Me=H.state.version,ge=ue.getParameters(S,H.state,_e,F,q,y.state.lightProbeGridArray),Ee=ue.getProgramCacheKey(ge);let Re=G.programs;G.environment=S.isMeshStandardMaterial||S.isMeshLambertMaterial||S.isMeshPhongMaterial?F.environment:null,G.fog=F.fog;const Ve=S.isMeshStandardMaterial||S.isMeshLambertMaterial&&!S.envMap||S.isMeshPhongMaterial&&!S.envMap;G.envMap=oe.get(S.envMap||G.environment,Ve),G.envMapRotation=G.environment!==null&&S.envMap===null?F.environmentRotation:S.envMapRotation,Re===void 0&&(S.addEventListener("dispose",Dn),Re=new Map,G.programs=Re);let We=Re.get(Ee);if(We!==void 0){if(G.currentProgram===We&&G.lightsStateVersion===Me)return Yd(S,ge),We}else ge.uniforms=ue.getUniforms(S),L!==null&&S.isNodeMaterial&&L.build(S,q,ge),S.onBeforeCompile(ge,P),We=ue.acquireProgram(ge,Ee),Re.set(Ee,We),G.uniforms=ge.uniforms;const Ce=G.uniforms;return(!S.isShaderMaterial&&!S.isRawShaderMaterial||S.clipping===!0)&&(Ce.clippingPlanes=Le.uniform),Yd(S,ge),G.needsLights=Vp(S),G.lightsStateVersion=Me,G.needsLights&&(Ce.ambientLightColor.value=H.state.ambient,Ce.lightProbe.value=H.state.probe,Ce.directionalLights.value=H.state.directional,Ce.directionalLightShadows.value=H.state.directionalShadow,Ce.spotLights.value=H.state.spot,Ce.spotLightShadows.value=H.state.spotShadow,Ce.rectAreaLights.value=H.state.rectArea,Ce.ltc_1.value=H.state.rectAreaLTC1,Ce.ltc_2.value=H.state.rectAreaLTC2,Ce.pointLights.value=H.state.point,Ce.pointLightShadows.value=H.state.pointShadow,Ce.hemisphereLights.value=H.state.hemi,Ce.directionalShadowMatrix.value=H.state.directionalShadowMatrix,Ce.spotLightMatrix.value=H.state.spotLightMatrix,Ce.spotLightMap.value=H.state.spotLightMap,Ce.pointShadowMatrix.value=H.state.pointShadowMatrix),G.lightProbeGrid=y.state.lightProbeGridArray.length>0,G.currentProgram=We,G.uniformsList=null,We}function $d(S){if(S.uniformsList===null){const F=S.currentProgram.getUniforms();S.uniformsList=to.seqWithValue(F.seq,S.uniforms)}return S.uniformsList}function Yd(S,F){const q=W.get(S);q.outputColorSpace=F.outputColorSpace,q.batching=F.batching,q.batchingColor=F.batchingColor,q.instancing=F.instancing,q.instancingColor=F.instancingColor,q.instancingMorph=F.instancingMorph,q.skinning=F.skinning,q.morphTargets=F.morphTargets,q.morphNormals=F.morphNormals,q.morphColors=F.morphColors,q.morphTargetsCount=F.morphTargetsCount,q.numClippingPlanes=F.numClippingPlanes,q.numIntersection=F.numClipIntersection,q.vertexAlphas=F.vertexAlphas,q.vertexTangents=F.vertexTangents,q.toneMapping=F.toneMapping}function kp(S,F){if(S.length===0)return null;if(S.length===1)return S[0].texture!==null?S[0]:null;b.setFromMatrixPosition(F.matrixWorld);for(let q=0,G=S.length;q<G;q++){const H=S[q];if(H.texture!==null&&H.boundingBox.containsPoint(b))return H}return null}function Bp(S,F,q,G,H){F.isScene!==!0&&(F=Ut),Y.resetTextureUnits();const _e=F.fog,Me=G.isMeshStandardMaterial||G.isMeshLambertMaterial||G.isMeshPhongMaterial?F.environment:null,ge=$===null?P.outputColorSpace:$.isXRRenderTarget===!0?$.texture.colorSpace:Xe.workingColorSpace,Ee=G.isMeshStandardMaterial||G.isMeshLambertMaterial&&!G.envMap||G.isMeshPhongMaterial&&!G.envMap,Re=oe.get(G.envMap||Me,Ee),Ve=G.vertexColors===!0&&!!q.attributes.color&&q.attributes.color.itemSize===4,We=!!q.attributes.tangent&&(!!G.normalMap||G.anisotropy>0),Ce=!!q.morphAttributes.position,nt=!!q.morphAttributes.normal,xt=!!q.morphAttributes.color;let pt=qn;G.toneMapped&&($===null||$.isXRRenderTarget===!0)&&(pt=P.toneMapping);const at=q.morphAttributes.position||q.morphAttributes.normal||q.morphAttributes.color,Gt=at!==void 0?at.length:0,ye=W.get(G),sn=y.state.lights;if(Je===!0&&(Ye===!0||S!==re)){const ct=S===re&&G.id===j;Le.setState(G,S,ct)}let Ke=!1;G.version===ye.__version?(ye.needsLights&&ye.lightsStateVersion!==sn.state.version||ye.outputColorSpace!==ge||H.isBatchedMesh&&ye.batching===!1||!H.isBatchedMesh&&ye.batching===!0||H.isBatchedMesh&&ye.batchingColor===!0&&H.colorTexture===null||H.isBatchedMesh&&ye.batchingColor===!1&&H.colorTexture!==null||H.isInstancedMesh&&ye.instancing===!1||!H.isInstancedMesh&&ye.instancing===!0||H.isSkinnedMesh&&ye.skinning===!1||!H.isSkinnedMesh&&ye.skinning===!0||H.isInstancedMesh&&ye.instancingColor===!0&&H.instanceColor===null||H.isInstancedMesh&&ye.instancingColor===!1&&H.instanceColor!==null||H.isInstancedMesh&&ye.instancingMorph===!0&&H.morphTexture===null||H.isInstancedMesh&&ye.instancingMorph===!1&&H.morphTexture!==null||ye.envMap!==Re||G.fog===!0&&ye.fog!==_e||ye.numClippingPlanes!==void 0&&(ye.numClippingPlanes!==Le.numPlanes||ye.numIntersection!==Le.numIntersection)||ye.vertexAlphas!==Ve||ye.vertexTangents!==We||ye.morphTargets!==Ce||ye.morphNormals!==nt||ye.morphColors!==xt||ye.toneMapping!==pt||ye.morphTargetsCount!==Gt||!!ye.lightProbeGrid!=y.state.lightProbeGridArray.length>0)&&(Ke=!0):(Ke=!0,ye.__version=G.version);let fn=ye.currentProgram;Ke===!0&&(fn=da(G,F,H),L&&G.isNodeMaterial&&L.onUpdateProgram(G,fn,ye));let Un=!1,vi=!1,Cs=!1;const ot=fn.getUniforms(),bt=ye.uniforms;if(v.useProgram(fn.program)&&(Un=!0,vi=!0,Cs=!0),G.id!==j&&(j=G.id,vi=!0),ye.needsLights){const ct=kp(y.state.lightProbeGridArray,H);ye.lightProbeGrid!==ct&&(ye.lightProbeGrid=ct,vi=!0)}if(Un||re!==S){v.buffers.depth.getReversed()&&S.reversedDepth!==!0&&(S._reversedDepth=!0,S.updateProjectionMatrix()),ot.setValue(U,"projectionMatrix",S.projectionMatrix),ot.setValue(U,"viewMatrix",S.matrixWorldInverse);const bi=ot.map.cameraPosition;bi!==void 0&&bi.setValue(U,Et.setFromMatrixPosition(S.matrixWorld)),C.logarithmicDepthBuffer&&ot.setValue(U,"logDepthBufFC",2/(Math.log(S.far+1)/Math.LN2)),(G.isMeshPhongMaterial||G.isMeshToonMaterial||G.isMeshLambertMaterial||G.isMeshBasicMaterial||G.isMeshStandardMaterial||G.isShaderMaterial)&&ot.setValue(U,"isOrthographic",S.isOrthographicCamera===!0),re!==S&&(re=S,vi=!0,Cs=!0)}if(ye.needsLights&&(sn.state.directionalShadowMap.length>0&&ot.setValue(U,"directionalShadowMap",sn.state.directionalShadowMap,Y),sn.state.spotShadowMap.length>0&&ot.setValue(U,"spotShadowMap",sn.state.spotShadowMap,Y),sn.state.pointShadowMap.length>0&&ot.setValue(U,"pointShadowMap",sn.state.pointShadowMap,Y)),H.isSkinnedMesh){ot.setOptional(U,H,"bindMatrix"),ot.setOptional(U,H,"bindMatrixInverse");const ct=H.skeleton;ct&&(ct.boneTexture===null&&ct.computeBoneTexture(),ot.setValue(U,"boneTexture",ct.boneTexture,Y))}H.isBatchedMesh&&(ot.setOptional(U,H,"batchingTexture"),ot.setValue(U,"batchingTexture",H._matricesTexture,Y),ot.setOptional(U,H,"batchingIdTexture"),ot.setValue(U,"batchingIdTexture",H._indirectTexture,Y),ot.setOptional(U,H,"batchingColorTexture"),H._colorsTexture!==null&&ot.setValue(U,"batchingColorTexture",H._colorsTexture,Y));const xi=q.morphAttributes;if((xi.position!==void 0||xi.normal!==void 0||xi.color!==void 0)&&D.update(H,q,fn),(vi||ye.receiveShadow!==H.receiveShadow)&&(ye.receiveShadow=H.receiveShadow,ot.setValue(U,"receiveShadow",H.receiveShadow)),(G.isMeshStandardMaterial||G.isMeshLambertMaterial||G.isMeshPhongMaterial)&&G.envMap===null&&F.environment!==null&&(bt.envMapIntensity.value=F.environmentIntensity),bt.dfgLUT!==void 0&&(bt.dfgLUT.value=ay()),vi){if(ot.setValue(U,"toneMappingExposure",P.toneMappingExposure),ye.needsLights&&zp(bt,Cs),_e&&G.fog===!0&&we.refreshFogUniforms(bt,_e),we.refreshMaterialUniforms(bt,G,te,Z,y.state.transmissionRenderTarget[S.id]),ye.needsLights&&ye.lightProbeGrid){const ct=ye.lightProbeGrid;bt.probesSH.value=ct.texture,bt.probesMin.value.copy(ct.boundingBox.min),bt.probesMax.value.copy(ct.boundingBox.max),bt.probesResolution.value.copy(ct.resolution)}to.upload(U,$d(ye),bt,Y)}if(G.isShaderMaterial&&G.uniformsNeedUpdate===!0&&(to.upload(U,$d(ye),bt,Y),G.uniformsNeedUpdate=!1),G.isSpriteMaterial&&ot.setValue(U,"center",H.center),ot.setValue(U,"modelViewMatrix",H.modelViewMatrix),ot.setValue(U,"normalMatrix",H.normalMatrix),ot.setValue(U,"modelMatrix",H.matrixWorld),G.uniformsGroups!==void 0){const ct=G.uniformsGroups;for(let bi=0,Ps=ct.length;bi<Ps;bi++){const Kd=ct[bi];ie.update(Kd,fn),ie.bind(Kd,fn)}}return fn}function zp(S,F){S.ambientLightColor.needsUpdate=F,S.lightProbe.needsUpdate=F,S.directionalLights.needsUpdate=F,S.directionalLightShadows.needsUpdate=F,S.pointLights.needsUpdate=F,S.pointLightShadows.needsUpdate=F,S.spotLights.needsUpdate=F,S.spotLightShadows.needsUpdate=F,S.rectAreaLights.needsUpdate=F,S.hemisphereLights.needsUpdate=F}function Vp(S){return S.isMeshLambertMaterial||S.isMeshToonMaterial||S.isMeshPhongMaterial||S.isMeshStandardMaterial||S.isShadowMaterial||S.isShaderMaterial&&S.lights===!0}this.getActiveCubeFace=function(){return N},this.getActiveMipmapLevel=function(){return V},this.getRenderTarget=function(){return $},this.setRenderTargetTextures=function(S,F,q){const G=W.get(S);G.__autoAllocateDepthBuffer=S.resolveDepthBuffer===!1,G.__autoAllocateDepthBuffer===!1&&(G.__useRenderToTexture=!1),W.get(S.texture).__webglTexture=F,W.get(S.depthTexture).__webglTexture=G.__autoAllocateDepthBuffer?void 0:q,G.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(S,F){const q=W.get(S);q.__webglFramebuffer=F,q.__useDefaultFramebuffer=F===void 0},this.setRenderTarget=function(S,F=0,q=0){$=S,N=F,V=q;let G=null,H=!1,_e=!1;if(S){const ge=W.get(S);if(ge.__useDefaultFramebuffer!==void 0){v.bindFramebuffer(U.FRAMEBUFFER,ge.__webglFramebuffer),se.copy(S.viewport),ae.copy(S.scissor),xe=S.scissorTest,v.viewport(se),v.scissor(ae),v.setScissorTest(xe),j=-1;return}else if(ge.__webglFramebuffer===void 0)Y.setupRenderTarget(S);else if(ge.__hasExternalTextures)Y.rebindTextures(S,W.get(S.texture).__webglTexture,W.get(S.depthTexture).__webglTexture);else if(S.depthBuffer){const Ve=S.depthTexture;if(ge.__boundDepthTexture!==Ve){if(Ve!==null&&W.has(Ve)&&(S.width!==Ve.image.width||S.height!==Ve.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");Y.setupDepthRenderbuffer(S)}}const Ee=S.texture;(Ee.isData3DTexture||Ee.isDataArrayTexture||Ee.isCompressedArrayTexture)&&(_e=!0);const Re=W.get(S).__webglFramebuffer;S.isWebGLCubeRenderTarget?(Array.isArray(Re[F])?G=Re[F][q]:G=Re[F],H=!0):S.samples>0&&Y.useMultisampledRTT(S)===!1?G=W.get(S).__webglMultisampledFramebuffer:Array.isArray(Re)?G=Re[q]:G=Re,se.copy(S.viewport),ae.copy(S.scissor),xe=S.scissorTest}else se.copy(Ie).multiplyScalar(te).floor(),ae.copy(vt).multiplyScalar(te).floor(),xe=$e;if(q!==0&&(G=z),v.bindFramebuffer(U.FRAMEBUFFER,G)&&v.drawBuffers(S,G),v.viewport(se),v.scissor(ae),v.setScissorTest(xe),H){const ge=W.get(S.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_CUBE_MAP_POSITIVE_X+F,ge.__webglTexture,q)}else if(_e){const ge=F;for(let Ee=0;Ee<S.textures.length;Ee++){const Re=W.get(S.textures[Ee]);U.framebufferTextureLayer(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0+Ee,Re.__webglTexture,q,ge)}}else if(S!==null&&q!==0){const ge=W.get(S.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,ge.__webglTexture,q)}j=-1},this.readRenderTargetPixels=function(S,F,q,G,H,_e,Me,ge=0){if(!(S&&S.isWebGLRenderTarget)){He("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ee=W.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&Me!==void 0&&(Ee=Ee[Me]),Ee){v.bindFramebuffer(U.FRAMEBUFFER,Ee);try{const Re=S.textures[ge],Ve=Re.format,We=Re.type;if(S.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+ge),!C.textureFormatReadable(Ve)){He("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!C.textureTypeReadable(We)){He("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}F>=0&&F<=S.width-G&&q>=0&&q<=S.height-H&&U.readPixels(F,q,G,H,fe.convert(Ve),fe.convert(We),_e)}finally{const Re=$!==null?W.get($).__webglFramebuffer:null;v.bindFramebuffer(U.FRAMEBUFFER,Re)}}},this.readRenderTargetPixelsAsync=async function(S,F,q,G,H,_e,Me,ge=0){if(!(S&&S.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ee=W.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&Me!==void 0&&(Ee=Ee[Me]),Ee)if(F>=0&&F<=S.width-G&&q>=0&&q<=S.height-H){v.bindFramebuffer(U.FRAMEBUFFER,Ee);const Re=S.textures[ge],Ve=Re.format,We=Re.type;if(S.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+ge),!C.textureFormatReadable(Ve))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!C.textureTypeReadable(We))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const Ce=U.createBuffer();U.bindBuffer(U.PIXEL_PACK_BUFFER,Ce),U.bufferData(U.PIXEL_PACK_BUFFER,_e.byteLength,U.STREAM_READ),U.readPixels(F,q,G,H,fe.convert(Ve),fe.convert(We),0);const nt=$!==null?W.get($).__webglFramebuffer:null;v.bindFramebuffer(U.FRAMEBUFFER,nt);const xt=U.fenceSync(U.SYNC_GPU_COMMANDS_COMPLETE,0);return U.flush(),await Tm(U,xt,4),U.bindBuffer(U.PIXEL_PACK_BUFFER,Ce),U.getBufferSubData(U.PIXEL_PACK_BUFFER,0,_e),U.deleteBuffer(Ce),U.deleteSync(xt),_e}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(S,F=null,q=0){const G=Math.pow(2,-q),H=Math.floor(S.image.width*G),_e=Math.floor(S.image.height*G),Me=F!==null?F.x:0,ge=F!==null?F.y:0;Y.setTexture2D(S,0),U.copyTexSubImage2D(U.TEXTURE_2D,q,0,0,Me,ge,H,_e),v.unbindTexture()},this.copyTextureToTexture=function(S,F,q=null,G=null,H=0,_e=0){let Me,ge,Ee,Re,Ve,We,Ce,nt,xt;const pt=S.isCompressedTexture?S.mipmaps[_e]:S.image;if(q!==null)Me=q.max.x-q.min.x,ge=q.max.y-q.min.y,Ee=q.isBox3?q.max.z-q.min.z:1,Re=q.min.x,Ve=q.min.y,We=q.isBox3?q.min.z:0;else{const bt=Math.pow(2,-H);Me=Math.floor(pt.width*bt),ge=Math.floor(pt.height*bt),S.isDataArrayTexture?Ee=pt.depth:S.isData3DTexture?Ee=Math.floor(pt.depth*bt):Ee=1,Re=0,Ve=0,We=0}G!==null?(Ce=G.x,nt=G.y,xt=G.z):(Ce=0,nt=0,xt=0);const at=fe.convert(F.format),Gt=fe.convert(F.type);let ye;F.isData3DTexture?(Y.setTexture3D(F,0),ye=U.TEXTURE_3D):F.isDataArrayTexture||F.isCompressedArrayTexture?(Y.setTexture2DArray(F,0),ye=U.TEXTURE_2D_ARRAY):(Y.setTexture2D(F,0),ye=U.TEXTURE_2D),v.activeTexture(U.TEXTURE0),v.pixelStorei(U.UNPACK_FLIP_Y_WEBGL,F.flipY),v.pixelStorei(U.UNPACK_PREMULTIPLY_ALPHA_WEBGL,F.premultiplyAlpha),v.pixelStorei(U.UNPACK_ALIGNMENT,F.unpackAlignment);const sn=v.getParameter(U.UNPACK_ROW_LENGTH),Ke=v.getParameter(U.UNPACK_IMAGE_HEIGHT),fn=v.getParameter(U.UNPACK_SKIP_PIXELS),Un=v.getParameter(U.UNPACK_SKIP_ROWS),vi=v.getParameter(U.UNPACK_SKIP_IMAGES);v.pixelStorei(U.UNPACK_ROW_LENGTH,pt.width),v.pixelStorei(U.UNPACK_IMAGE_HEIGHT,pt.height),v.pixelStorei(U.UNPACK_SKIP_PIXELS,Re),v.pixelStorei(U.UNPACK_SKIP_ROWS,Ve),v.pixelStorei(U.UNPACK_SKIP_IMAGES,We);const Cs=S.isDataArrayTexture||S.isData3DTexture,ot=F.isDataArrayTexture||F.isData3DTexture;if(S.isDepthTexture){const bt=W.get(S),xi=W.get(F),ct=W.get(bt.__renderTarget),bi=W.get(xi.__renderTarget);v.bindFramebuffer(U.READ_FRAMEBUFFER,ct.__webglFramebuffer),v.bindFramebuffer(U.DRAW_FRAMEBUFFER,bi.__webglFramebuffer);for(let Ps=0;Ps<Ee;Ps++)Cs&&(U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,W.get(S).__webglTexture,H,We+Ps),U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,W.get(F).__webglTexture,_e,xt+Ps)),U.blitFramebuffer(Re,Ve,Me,ge,Ce,nt,Me,ge,U.DEPTH_BUFFER_BIT,U.NEAREST);v.bindFramebuffer(U.READ_FRAMEBUFFER,null),v.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else if(H!==0||S.isRenderTargetTexture||W.has(S)){const bt=W.get(S),xi=W.get(F);v.bindFramebuffer(U.READ_FRAMEBUFFER,X),v.bindFramebuffer(U.DRAW_FRAMEBUFFER,O);for(let ct=0;ct<Ee;ct++)Cs?U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,bt.__webglTexture,H,We+ct):U.framebufferTexture2D(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,bt.__webglTexture,H),ot?U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,xi.__webglTexture,_e,xt+ct):U.framebufferTexture2D(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,xi.__webglTexture,_e),H!==0?U.blitFramebuffer(Re,Ve,Me,ge,Ce,nt,Me,ge,U.COLOR_BUFFER_BIT,U.NEAREST):ot?U.copyTexSubImage3D(ye,_e,Ce,nt,xt+ct,Re,Ve,Me,ge):U.copyTexSubImage2D(ye,_e,Ce,nt,Re,Ve,Me,ge);v.bindFramebuffer(U.READ_FRAMEBUFFER,null),v.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else ot?S.isDataTexture||S.isData3DTexture?U.texSubImage3D(ye,_e,Ce,nt,xt,Me,ge,Ee,at,Gt,pt.data):F.isCompressedArrayTexture?U.compressedTexSubImage3D(ye,_e,Ce,nt,xt,Me,ge,Ee,at,pt.data):U.texSubImage3D(ye,_e,Ce,nt,xt,Me,ge,Ee,at,Gt,pt):S.isDataTexture?U.texSubImage2D(U.TEXTURE_2D,_e,Ce,nt,Me,ge,at,Gt,pt.data):S.isCompressedTexture?U.compressedTexSubImage2D(U.TEXTURE_2D,_e,Ce,nt,pt.width,pt.height,at,pt.data):U.texSubImage2D(U.TEXTURE_2D,_e,Ce,nt,Me,ge,at,Gt,pt);v.pixelStorei(U.UNPACK_ROW_LENGTH,sn),v.pixelStorei(U.UNPACK_IMAGE_HEIGHT,Ke),v.pixelStorei(U.UNPACK_SKIP_PIXELS,fn),v.pixelStorei(U.UNPACK_SKIP_ROWS,Un),v.pixelStorei(U.UNPACK_SKIP_IMAGES,vi),_e===0&&F.generateMipmaps&&U.generateMipmap(ye),v.unbindTexture()},this.initRenderTarget=function(S){W.get(S).__webglFramebuffer===void 0&&Y.setupRenderTarget(S)},this.initTexture=function(S){S.isCubeTexture?Y.setTextureCube(S,0):S.isData3DTexture?Y.setTexture3D(S,0):S.isDataArrayTexture||S.isCompressedArrayTexture?Y.setTexture2DArray(S,0):Y.setTexture2D(S,0),v.unbindTexture()},this.resetState=function(){N=0,V=0,$=null,v.reset(),ve.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Hn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=Xe._getDrawingBufferColorSpace(e),t.unpackColorSpace=Xe._getUnpackColorSpace()}}const vh={type:"change"},cd={type:"start"},Hf={type:"end"},Ba=new ea,xh=new Ci,ly=Math.cos(70*Bn.DEG2RAD),Tt=new I,en=2*Math.PI,it={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},Cl=1e-6;class cy extends u_{constructor(e,t=null){super(e,t),this.state=it.NONE,this.target=new I,this.cursor=new I,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:Js.ROTATE,MIDDLE:Js.DOLLY,RIGHT:Js.PAN},this.touches={ONE:$s.ROTATE,TWO:$s.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle="auto",this._domElementKeyEvents=null,this._lastPosition=new I,this._lastQuaternion=new Ot,this._lastTargetPosition=new I,this._quat=new Ot().setFromUnitVectors(e.up,new I(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new qu,this._sphericalDelta=new qu,this._scale=1,this._panOffset=new I,this._rotateStart=new Ne,this._rotateEnd=new Ne,this._rotateDelta=new Ne,this._panStart=new Ne,this._panEnd=new Ne,this._panDelta=new Ne,this._dollyStart=new Ne,this._dollyEnd=new Ne,this._dollyDelta=new Ne,this._dollyDirection=new I,this._mouse=new Ne,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=uy.bind(this),this._onPointerDown=dy.bind(this),this._onPointerUp=hy.bind(this),this._onContextMenu=xy.bind(this),this._onMouseWheel=my.bind(this),this._onKeyDown=gy.bind(this),this._onTouchStart=_y.bind(this),this._onTouchMove=vy.bind(this),this._onMouseDown=fy.bind(this),this._onMouseMove=py.bind(this),this._interceptControlDown=by.bind(this),this._interceptControlUp=yy.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(e){this._cursorStyle=e,e==="grab"?this.domElement.style.cursor="grab":this.domElement.style.cursor="auto"}get cursorStyle(){return this._cursorStyle}connect(e){super.connect(e),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction=""}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(vh),this.update(),this.state=it.NONE}pan(e,t){this._pan(e,t),this.update()}dollyIn(e){this._dollyIn(e),this.update()}dollyOut(e){this._dollyOut(e),this.update()}rotateLeft(e){this._rotateLeft(e),this.update()}rotateUp(e){this._rotateUp(e),this.update()}update(e=null){const t=this.object.position;Tt.copy(t).sub(this.target),Tt.applyQuaternion(this._quat),this._spherical.setFromVector3(Tt),this.autoRotate&&this.state===it.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(n)&&isFinite(s)&&(n<-Math.PI?n+=en:n>Math.PI&&(n-=en),s<-Math.PI?s+=en:s>Math.PI&&(s-=en),n<=s?this._spherical.theta=Math.max(n,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+s)/2?Math.max(n,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{const a=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=a!=this._spherical.radius}if(Tt.setFromSpherical(this._spherical),Tt.applyQuaternion(this._quatInverse),t.copy(this.target).add(Tt),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let a=null;if(this.object.isPerspectiveCamera){const o=Tt.length();a=this._clampDistance(o*this._scale);const l=o-a;this.object.position.addScaledVector(this._dollyDirection,l),this.object.updateMatrixWorld(),r=!!l}else if(this.object.isOrthographicCamera){const o=new I(this._mouse.x,this._mouse.y,0);o.unproject(this.object);const l=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=l!==this.object.zoom;const c=new I(this._mouse.x,this._mouse.y,0);c.unproject(this.object),this.object.position.sub(c).add(o),this.object.updateMatrixWorld(),a=Tt.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;a!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(a).add(this.object.position):(Ba.origin.copy(this.object.position),Ba.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(Ba.direction))<ly?this.object.lookAt(this.target):(xh.setFromNormalAndCoplanarPoint(this.object.up,this.target),Ba.intersectPlane(xh,this.target))))}else if(this.object.isOrthographicCamera){const a=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),a!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>Cl||8*(1-this._lastQuaternion.dot(this.object.quaternion))>Cl||this._lastTargetPosition.distanceToSquared(this.target)>Cl?(this.dispatchEvent(vh),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?en/60*this.autoRotateSpeed*e:en/60/60*this.autoRotateSpeed}_getZoomScale(e){const t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){Tt.setFromMatrixColumn(t,0),Tt.multiplyScalar(-e),this._panOffset.add(Tt)}_panUp(e,t){this.screenSpacePanning===!0?Tt.setFromMatrixColumn(t,1):(Tt.setFromMatrixColumn(t,0),Tt.crossVectors(this.object.up,Tt)),Tt.multiplyScalar(e),this._panOffset.add(Tt)}_pan(e,t){const n=this.domElement;if(this.object.isPerspectiveCamera){const s=this.object.position;Tt.copy(s).sub(this.target);let r=Tt.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*r/n.clientHeight,this.object.matrix),this._panUp(2*t*r/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;const n=this.domElement.getBoundingClientRect(),s=e-n.left,r=t-n.top,a=n.width,o=n.height;this._mouse.x=s/a*2-1,this._mouse.y=-(r/o)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const t=this.domElement;this._rotateLeft(en*this._rotateDelta.x/t.clientHeight),this._rotateUp(en*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(en*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-en*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(en*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-en*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._rotateStart.set(n,s)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panStart.set(n,s)}}_handleTouchStartDolly(e){const t=this._getSecondPointerPosition(e),n=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(n*n+s*s);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{const n=this._getSecondPointerPosition(e),s=.5*(e.pageX+n.x),r=.5*(e.pageY+n.y);this._rotateEnd.set(s,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const t=this.domElement;this._rotateLeft(en*this._rotateDelta.x/t.clientHeight),this._rotateUp(en*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panEnd.set(n,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){const t=this._getSecondPointerPosition(e),n=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(n*n+s*s);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);const a=(e.pageX+t.x)*.5,o=(e.pageY+t.y)*.5;this._updateZoomParameters(a,o)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new Ne,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){const t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){const t=e.deltaMode,n={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}}function dy(i){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(i.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(i)&&(this._addPointer(i),i.pointerType==="touch"?this._onTouchStart(i):this._onMouseDown(i),this._cursorStyle==="grab"&&(this.domElement.style.cursor="grabbing")))}function uy(i){this.enabled!==!1&&(i.pointerType==="touch"?this._onTouchMove(i):this._onMouseMove(i))}function hy(i){switch(this._removePointer(i),this._pointers.length){case 0:this.domElement.releasePointerCapture(i.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(Hf),this.state=it.NONE,this._cursorStyle==="grab"&&(this.domElement.style.cursor="grab");break;case 1:const e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function fy(i){let e;switch(i.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case Js.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(i),this.state=it.DOLLY;break;case Js.ROTATE:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=it.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=it.ROTATE}break;case Js.PAN:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=it.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=it.PAN}break;default:this.state=it.NONE}this.state!==it.NONE&&this.dispatchEvent(cd)}function py(i){switch(this.state){case it.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(i);break;case it.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(i);break;case it.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(i);break}}function my(i){this.enabled===!1||this.enableZoom===!1||this.state!==it.NONE||(i.preventDefault(),this.dispatchEvent(cd),this._handleMouseWheel(this._customWheelEvent(i)),this.dispatchEvent(Hf))}function gy(i){this.enabled!==!1&&this._handleKeyDown(i)}function _y(i){switch(this._trackPointer(i),this._pointers.length){case 1:switch(this.touches.ONE){case $s.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(i),this.state=it.TOUCH_ROTATE;break;case $s.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(i),this.state=it.TOUCH_PAN;break;default:this.state=it.NONE}break;case 2:switch(this.touches.TWO){case $s.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(i),this.state=it.TOUCH_DOLLY_PAN;break;case $s.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(i),this.state=it.TOUCH_DOLLY_ROTATE;break;default:this.state=it.NONE}break;default:this.state=it.NONE}this.state!==it.NONE&&this.dispatchEvent(cd)}function vy(i){switch(this._trackPointer(i),this.state){case it.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(i),this.update();break;case it.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(i),this.update();break;case it.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(i),this.update();break;case it.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(i),this.update();break;default:this.state=it.NONE}}function xy(i){this.enabled!==!1&&i.preventDefault()}function by(i){i.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function yy(i){i.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}class My extends ji{constructor(e){super(e)}load(e,t,n,s){const r=this,a=new od(this.manager);a.setPath(this.path),a.setResponseType("arraybuffer"),a.setRequestHeader(this.requestHeader),a.setWithCredentials(this.withCredentials),a.load(e,function(o){try{t(r.parse(o))}catch(l){s?s(l):console.error(l),r.manager.itemError(e)}},n,s)}parse(e){function t(c){const u=new DataView(c),h=32/8*3+32/8*3*3+16/8,d=u.getUint32(80,!0);if(80+32/8+d*h===u.byteLength)return!0;const g=[115,111,108,105,100];for(let x=0;x<5;x++)if(n(g,u,x))return!1;return!0}function n(c,u,h){for(let d=0,f=c.length;d<f;d++)if(c[d]!==u.getUint8(h+d))return!1;return!0}function s(c){const u=new DataView(c),h=u.getUint32(80,!0);let d,f,g,x=!1,m,p,E,A,b;for(let R=0;R<70;R++)u.getUint32(R,!1)==1129270351&&u.getUint8(R+4)==82&&u.getUint8(R+5)==61&&(x=!0,m=new Float32Array(h*3*3),p=u.getUint8(R+6)/255,E=u.getUint8(R+7)/255,A=u.getUint8(R+8)/255,b=u.getUint8(R+9)/255);const T=84,y=12*4+2,w=new Vt,_=new Float32Array(h*3*3),M=new Float32Array(h*3*3),P=new Oe;for(let R=0;R<h;R++){const L=T+R*y,z=u.getFloat32(L,!0),X=u.getFloat32(L+4,!0),O=u.getFloat32(L+8,!0);if(x){const N=u.getUint16(L+48,!0);N&32768?(d=p,f=E,g=A):(d=(N&31)/31,f=(N>>5&31)/31,g=(N>>10&31)/31)}for(let N=1;N<=3;N++){const V=L+N*12,$=R*3*3+(N-1)*3;_[$]=u.getFloat32(V,!0),_[$+1]=u.getFloat32(V+4,!0),_[$+2]=u.getFloat32(V+8,!0),M[$]=z,M[$+1]=X,M[$+2]=O,x&&(P.setRGB(d,f,g,dt),m[$]=P.r,m[$+1]=P.g,m[$+2]=P.b)}}return w.setAttribute("position",new un(_,3)),w.setAttribute("normal",new un(M,3)),x&&(w.setAttribute("color",new un(m,3)),w.hasColors=!0,w.alpha=b),w}function r(c){const u=new Vt,h=/solid([\s\S]*?)endsolid/g,d=/facet([\s\S]*?)endfacet/g,f=/solid\s(.+)/;let g=0;const x=/[\s]+([+-]?(?:\d*)(?:\.\d*)?(?:[eE][+-]?\d+)?)/.source,m=new RegExp("vertex"+x+x+x,"g"),p=new RegExp("normal"+x+x+x,"g"),E=[],A=[],b=[],T=new I;let y,w=0,_=0,M=0;for(;(y=h.exec(c))!==null;){_=M;const P=y[0],R=(y=f.exec(P))!==null?y[1]:"";for(b.push(R);(y=d.exec(P))!==null;){let X=0,O=0;const N=y[0];for(;(y=p.exec(N))!==null;)T.x=parseFloat(y[1]),T.y=parseFloat(y[2]),T.z=parseFloat(y[3]),O++;for(;(y=m.exec(N))!==null;)E.push(parseFloat(y[1]),parseFloat(y[2]),parseFloat(y[3])),A.push(T.x,T.y,T.z),X++,M++;O!==1&&console.error("THREE.STLLoader: Something isn't right with the normal of face number "+g),X!==3&&console.error("THREE.STLLoader: Something isn't right with the vertices of face number "+g),g++}const L=_,z=M-_;u.userData.groupNames=b,u.addGroup(L,z,w),w++}return u.setAttribute("position",new Qe(E,3)),u.setAttribute("normal",new Qe(A,3)),u}function a(c){return typeof c!="string"?new TextDecoder().decode(c):c}function o(c){if(typeof c=="string"){const u=new Uint8Array(c.length);for(let h=0;h<c.length;h++)u[h]=c.charCodeAt(h)&255;return u.buffer||u}else return c}const l=o(e);return t(l)?s(l):r(a(e))}}class bh extends jg{constructor(e){super(e)}parse(e){function t(N){switch(N.image_type){case d:case x:if(N.colormap_length>256||N.colormap_size!==24||N.colormap_type!==1)throw new Error("THREE.TGALoader: Invalid type colormap data for indexed type.");break;case f:case g:case m:case p:if(N.colormap_type)throw new Error("THREE.TGALoader: Invalid type colormap data for colormap type.");break;case h:throw new Error("THREE.TGALoader: No data.");default:throw new Error("THREE.TGALoader: Invalid type "+N.image_type)}if(N.width<=0||N.height<=0)throw new Error("THREE.TGALoader: Invalid image size.");if(N.pixel_size!==8&&N.pixel_size!==16&&N.pixel_size!==24&&N.pixel_size!==32)throw new Error("THREE.TGALoader: Invalid pixel size "+N.pixel_size)}function n(N,V,$,j,re){let se,ae;const xe=$.pixel_size>>3,be=$.width*$.height*xe;if(V&&(ae=re.subarray(j,j+=$.colormap_length*($.colormap_size>>3))),N){se=new Uint8Array(be);let le,k,Z,te=0;const Ae=new Uint8Array(xe);for(;te<be;)if(le=re[j++],k=(le&127)+1,le&128){for(Z=0;Z<xe;++Z)Ae[Z]=re[j++];for(Z=0;Z<k;++Z)se.set(Ae,te+Z*xe);te+=xe*k}else{for(k*=xe,Z=0;Z<k;++Z)se[te+Z]=re[j++];te+=k}}else se=re.subarray(j,j+=V?$.width*$.height:be);return{pixel_data:se,palettes:ae}}function s(N,V,$,j,re,se,ae,xe,be){const le=be;let k,Z=0,te,Ae;const Ue=P.width;for(Ae=V;Ae!==j;Ae+=$)for(te=re;te!==ae;te+=se,Z++)k=xe[Z],N[(te+Ue*Ae)*4+3]=255,N[(te+Ue*Ae)*4+2]=le[k*3+0],N[(te+Ue*Ae)*4+1]=le[k*3+1],N[(te+Ue*Ae)*4+0]=le[k*3+2];return N}function r(N,V,$,j,re,se,ae,xe){let be,le=0,k,Z;const te=P.width;for(Z=V;Z!==j;Z+=$)for(k=re;k!==ae;k+=se,le+=2)be=xe[le+0]+(xe[le+1]<<8),N[(k+te*Z)*4+0]=(be&31744)>>7,N[(k+te*Z)*4+1]=(be&992)>>2,N[(k+te*Z)*4+2]=(be&31)<<3,N[(k+te*Z)*4+3]=be&32768?0:255;return N}function a(N,V,$,j,re,se,ae,xe){let be=0,le,k;const Z=P.width;for(k=V;k!==j;k+=$)for(le=re;le!==ae;le+=se,be+=3)N[(le+Z*k)*4+3]=255,N[(le+Z*k)*4+2]=xe[be+0],N[(le+Z*k)*4+1]=xe[be+1],N[(le+Z*k)*4+0]=xe[be+2];return N}function o(N,V,$,j,re,se,ae,xe){let be=0,le,k;const Z=P.width;for(k=V;k!==j;k+=$)for(le=re;le!==ae;le+=se,be+=4)N[(le+Z*k)*4+2]=xe[be+0],N[(le+Z*k)*4+1]=xe[be+1],N[(le+Z*k)*4+0]=xe[be+2],N[(le+Z*k)*4+3]=xe[be+3];return N}function l(N,V,$,j,re,se,ae,xe){let be,le=0,k,Z;const te=P.width;for(Z=V;Z!==j;Z+=$)for(k=re;k!==ae;k+=se,le++)be=xe[le],N[(k+te*Z)*4+0]=be,N[(k+te*Z)*4+1]=be,N[(k+te*Z)*4+2]=be,N[(k+te*Z)*4+3]=255;return N}function c(N,V,$,j,re,se,ae,xe){let be=0,le,k;const Z=P.width;for(k=V;k!==j;k+=$)for(le=re;le!==ae;le+=se,be+=2)N[(le+Z*k)*4+0]=xe[be+0],N[(le+Z*k)*4+1]=xe[be+0],N[(le+Z*k)*4+2]=xe[be+0],N[(le+Z*k)*4+3]=xe[be+1];return N}function u(N,V,$,j,re){let se,ae,xe,be,le,k;switch((P.flags&E)>>A){default:case y:se=0,xe=1,le=V,ae=0,be=1,k=$;break;case b:se=0,xe=1,le=V,ae=$-1,be=-1,k=-1;break;case w:se=V-1,xe=-1,le=-1,ae=0,be=1,k=$;break;case T:se=V-1,xe=-1,le=-1,ae=$-1,be=-1,k=-1;break}if(z)switch(P.pixel_size){case 8:l(N,ae,be,k,se,xe,le,j);break;case 16:c(N,ae,be,k,se,xe,le,j);break;default:throw new Error("THREE.TGALoader: Format not supported.")}else switch(P.pixel_size){case 8:s(N,ae,be,k,se,xe,le,j,re);break;case 16:r(N,ae,be,k,se,xe,le,j);break;case 24:a(N,ae,be,k,se,xe,le,j);break;case 32:o(N,ae,be,k,se,xe,le,j);break;default:throw new Error("THREE.TGALoader: Format not supported.")}return N}const h=0,d=1,f=2,g=3,x=9,m=10,p=11,E=48,A=4,b=0,T=1,y=2,w=3;if(e.length<19)throw new Error("THREE.TGALoader: Not enough data to contain header.");let _=0;const M=new Uint8Array(e),P={id_length:M[_++],colormap_type:M[_++],image_type:M[_++],colormap_index:M[_++]|M[_++]<<8,colormap_length:M[_++]|M[_++]<<8,colormap_size:M[_++],origin:[M[_++]|M[_++]<<8,M[_++]|M[_++]<<8],width:M[_++]|M[_++]<<8,height:M[_++]|M[_++]<<8,pixel_size:M[_++],flags:M[_++]};if(t(P),P.id_length+_>e.length)throw new Error("THREE.TGALoader: No data.");_+=P.id_length;let R=!1,L=!1,z=!1;switch(P.image_type){case x:R=!0,L=!0;break;case d:L=!0;break;case m:R=!0;break;case f:break;case p:R=!0,z=!0;break;case g:z=!0;break}const X=new Uint8Array(P.width*P.height*4),O=n(R,L,P,_,M);return u(X,P.width,P.height,O.pixel_data,O.palettes),{data:X,width:P.width,height:P.height,flipY:!0,generateMipmaps:!0,minFilter:ai}}}function on(i,e){const t=[],n=i.childNodes;for(let s=0,r=n.length;s<r;s++){const a=n[s];a.nodeName===e&&t.push(a)}return t}function Sy(i){return i.length===0?[]:i.trim().split(/\s+/)}function Jt(i){return i.length===0?[]:i.trim().split(/\s+/).map(parseFloat)}function za(i){return i.length===0?[]:i.trim().split(/\s+/).map(e=>parseInt(e))}function It(i){return i.substring(1)}class Ey{constructor(){this.count=0}generateId(){return"three_default_"+this.count++}parse(e){if(e.length===0)return null;const t=new DOMParser().parseFromString(e,"application/xml"),n=on(t,"COLLADA")[0],s=t.getElementsByTagName("parsererror")[0];if(s!==void 0){const l=on(s,"div")[0];let c;return l?c=l.textContent:c=this.parserErrorToText(s),console.error(`THREE.ColladaLoader: Failed to parse collada file.
`,c),null}const r=n.getAttribute("version");console.debug("THREE.ColladaLoader: File version",r);const a=this.parseAsset(on(n,"asset")[0]),o={animations:{},clips:{},controllers:{},images:{},effects:{},materials:{},cameras:{},lights:{},geometries:{},nodes:{},visualScenes:{},kinematicsModels:{},physicsModels:{},kinematicsScenes:{},joints:{}};return this.library=o,this.collada=n,this.parseLibrary(n,"library_animations","animation",this.parseAnimation.bind(this)),this.parseLibrary(n,"library_animation_clips","animation_clip",this.parseAnimationClip.bind(this)),this.parseLibrary(n,"library_controllers","controller",this.parseController.bind(this)),this.parseLibrary(n,"library_images","image",this.parseImage.bind(this)),this.parseLibrary(n,"library_effects","effect",this.parseEffect.bind(this)),this.parseLibrary(n,"library_materials","material",this.parseMaterial.bind(this)),this.parseLibrary(n,"library_cameras","camera",this.parseCamera.bind(this)),this.parseLibrary(n,"library_lights","light",this.parseLight.bind(this)),this.parseLibrary(n,"library_geometries","geometry",this.parseGeometry.bind(this)),this.parseLibrary(n,"library_nodes","node",this.parseNode.bind(this)),this.parseLibrary(n,"library_visual_scenes","visual_scene",this.parseVisualScene.bind(this)),this.parseLibrary(n,"library_joints","joint",this.parseLibraryJoint.bind(this)),this.parseLibrary(n,"library_kinematics_models","kinematics_model",this.parseKinematicsModel.bind(this)),this.parseLibrary(n,"library_physics_models","physics_model",this.parsePhysicsModel.bind(this)),this.parseLibrary(n,"scene","instance_kinematics_scene",this.parseKinematicsScene.bind(this)),{library:o,asset:a,collada:n}}parserErrorToText(e){const t=[],n=[e];for(;n.length;){const s=n.shift();s.nodeType===Node.TEXT_NODE?t.push(s.textContent):(t.push(`
`),n.push(...s.childNodes))}return t.join("").trim()}parseAsset(e){return{unit:this.parseAssetUnit(on(e,"unit")[0]),upAxis:this.parseAssetUpAxis(on(e,"up_axis")[0])}}parseAssetUnit(e){return e!==void 0&&e.hasAttribute("meter")===!0?parseFloat(e.getAttribute("meter")):1}parseAssetUpAxis(e){return e!==void 0?e.textContent:"Y_UP"}parseLibrary(e,t,n,s){const r=on(e,t)[0];if(r!==void 0){const a=on(r,n);for(let o=0;o<a.length;o++)s(a[o])}}parseAnimation(e){const t={sources:{},samplers:{},channels:{}};let n=!1;for(let s=0,r=e.childNodes.length;s<r;s++){const a=e.childNodes[s];if(a.nodeType!==1)continue;let o;switch(a.nodeName){case"source":o=a.getAttribute("id"),t.sources[o]=this.parseSource(a);break;case"sampler":o=a.getAttribute("id"),t.samplers[o]=this.parseAnimationSampler(a);break;case"channel":o=a.getAttribute("target"),t.channels[o]=this.parseAnimationChannel(a);break;case"animation":this.parseAnimation(a),n=!0;break}}n===!1&&(this.library.animations[e.getAttribute("id")||Bn.generateUUID()]=t)}parseAnimationSampler(e){const t={inputs:{}};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"input":const a=It(r.getAttribute("source")),o=r.getAttribute("semantic");t.inputs[o]=a;break}}return t}parseAnimationChannel(e){const t={};let s=e.getAttribute("target").split("/");const r=s.shift();let a=s.shift();const o=a.indexOf("(")!==-1,l=a.indexOf(".")!==-1;if(l)s=a.split("."),a=s.shift(),t.member=s.shift();else if(o){const c=a.split("(");a=c.shift();for(let u=0;u<c.length;u++)c[u]=parseInt(c[u].replace(/\)/,""));t.indices=c}return t.id=r,t.sid=a,t.arraySyntax=o,t.memberSyntax=l,t.sampler=It(e.getAttribute("source")),t}parseAnimationClip(e){const t={name:e.getAttribute("id")||"default",start:parseFloat(e.getAttribute("start")||0),end:parseFloat(e.getAttribute("end")||0),animations:[]};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"instance_animation":t.animations.push(It(r.getAttribute("url")));break}}this.library.clips[e.getAttribute("id")]=t}parseController(e){const t={};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"skin":t.id=It(r.getAttribute("source")),t.skin=this.parseSkin(r);break;case"morph":t.id=It(r.getAttribute("source")),console.warn("THREE.ColladaLoader: Morph target animation not supported yet.");break}}this.library.controllers[e.getAttribute("id")]=t}parseSkin(e){const t={sources:{}};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"bind_shape_matrix":t.bindShapeMatrix=Jt(r.textContent);break;case"source":const a=r.getAttribute("id");t.sources[a]=this.parseSource(r);break;case"joints":t.joints=this.parseJoints(r);break;case"vertex_weights":t.vertexWeights=this.parseVertexWeights(r);break}}return t}parseJoints(e){const t={inputs:{}};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"input":const a=r.getAttribute("semantic"),o=It(r.getAttribute("source"));t.inputs[a]=o;break}}return t}parseVertexWeights(e){const t={inputs:{}};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"input":const a=r.getAttribute("semantic"),o=It(r.getAttribute("source")),l=parseInt(r.getAttribute("offset"));t.inputs[a]={id:o,offset:l};break;case"vcount":t.vcount=za(r.textContent);break;case"v":t.v=za(r.textContent);break}}return t}parseImage(e){const t={init_from:on(e,"init_from")[0].textContent};this.library.images[e.getAttribute("id")]=t}parseEffect(e){const t={};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"profile_COMMON":t.profile=this.parseEffectProfileCOMMON(r);break}}this.library.effects[e.getAttribute("id")]=t}parseEffectProfileCOMMON(e){const t={surfaces:{},samplers:{}};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"newparam":this.parseEffectNewparam(r,t);break;case"technique":t.technique=this.parseEffectTechnique(r);break;case"extra":t.extra=this.parseEffectExtra(r);break}}return t}parseEffectNewparam(e,t){const n=e.getAttribute("sid");for(let s=0,r=e.childNodes.length;s<r;s++){const a=e.childNodes[s];if(a.nodeType===1)switch(a.nodeName){case"surface":t.surfaces[n]=this.parseEffectSurface(a);break;case"sampler2D":t.samplers[n]=this.parseEffectSampler(a);break}}}parseEffectSurface(e){const t={};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"init_from":t.init_from=r.textContent;break}}return t}parseEffectSampler(e){const t={};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"source":t.source=r.textContent;break}}return t}parseEffectTechnique(e){const t={};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"constant":case"lambert":case"blinn":case"phong":t.type=r.nodeName,t.parameters=this.parseEffectParameters(r);break;case"extra":t.extra=this.parseEffectExtra(r);break}}return t}parseEffectParameters(e){const t={};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"emission":case"diffuse":case"specular":case"bump":case"ambient":case"shininess":case"transparency":t[r.nodeName]=this.parseEffectParameter(r);break;case"transparent":t[r.nodeName]={opaque:r.hasAttribute("opaque")?r.getAttribute("opaque"):"A_ONE",data:this.parseEffectParameter(r)};break}}return t}parseEffectParameter(e){const t={};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"color":t[r.nodeName]=Jt(r.textContent);break;case"float":t[r.nodeName]=parseFloat(r.textContent);break;case"texture":t[r.nodeName]={id:r.getAttribute("texture"),extra:this.parseEffectParameterTexture(r)};break}}return t}parseEffectParameterTexture(e){const t={technique:{}};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"extra":this.parseEffectParameterTextureExtra(r,t);break}}return t}parseEffectParameterTextureExtra(e,t){for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"technique":this.parseEffectParameterTextureExtraTechnique(r,t);break}}}parseEffectParameterTextureExtraTechnique(e,t){for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"repeatU":case"repeatV":case"offsetU":case"offsetV":t.technique[r.nodeName]=parseFloat(r.textContent);break;case"wrapU":case"wrapV":r.textContent.toUpperCase()==="TRUE"?t.technique[r.nodeName]=1:r.textContent.toUpperCase()==="FALSE"?t.technique[r.nodeName]=0:t.technique[r.nodeName]=parseInt(r.textContent);break;case"bump":t[r.nodeName]=this.parseEffectExtraTechniqueBump(r);break}}}parseEffectExtra(e){const t={};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"technique":t.technique=this.parseEffectExtraTechnique(r);break}}return t}parseEffectExtraTechnique(e){const t={};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"double_sided":t[r.nodeName]=parseInt(r.textContent);break;case"bump":t[r.nodeName]=this.parseEffectExtraTechniqueBump(r);break}}return t}parseEffectExtraTechniqueBump(e){const t={};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"texture":t[r.nodeName]={id:r.getAttribute("texture"),texcoord:r.getAttribute("texcoord"),extra:this.parseEffectParameterTexture(r)};break}}return t}parseMaterial(e){const t={name:e.getAttribute("name")};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"instance_effect":t.url=It(r.getAttribute("url"));break}}this.library.materials[e.getAttribute("id")]=t}parseCamera(e){const t={name:e.getAttribute("name")};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"optics":t.optics=this.parseCameraOptics(r);break}}this.library.cameras[e.getAttribute("id")]=t}parseCameraOptics(e){for(let t=0;t<e.childNodes.length;t++){const n=e.childNodes[t];switch(n.nodeName){case"technique_common":return this.parseCameraTechnique(n)}}return{}}parseCameraTechnique(e){const t={};for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];switch(s.nodeName){case"perspective":case"orthographic":t.technique=s.nodeName,t.parameters=this.parseCameraParameters(s);break}}return t}parseCameraParameters(e){const t={};for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];switch(s.nodeName){case"xfov":case"yfov":case"xmag":case"ymag":case"znear":case"zfar":case"aspect_ratio":t[s.nodeName]=parseFloat(s.textContent);break}}return t}parseLight(e){let t={};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"technique_common":t=this.parseLightTechnique(r);break}}this.library.lights[e.getAttribute("id")]=t}parseLightTechnique(e){const t={};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"directional":case"point":case"spot":case"ambient":t.technique=r.nodeName,t.parameters=this.parseLightParameters(r);break}}return t}parseLightParameters(e){const t={};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"color":const a=Jt(r.textContent);t.color=new Oe().fromArray(a),Xe.colorSpaceToWorking(t.color,dt);break;case"falloff_angle":t.falloffAngle=parseFloat(r.textContent);break;case"quadratic_attenuation":const o=parseFloat(r.textContent);t.distance=o?Math.sqrt(1/o):0;break}}return t}parseGeometry(e){const t={name:e.getAttribute("name"),sources:{},vertices:{},primitives:[]},n=on(e,"mesh")[0];if(n!==void 0){for(let s=0;s<n.childNodes.length;s++){const r=n.childNodes[s];if(r.nodeType!==1)continue;const a=r.getAttribute("id");switch(r.nodeName){case"source":t.sources[a]=this.parseSource(r);break;case"vertices":t.vertices=this.parseGeometryVertices(r);break;case"polygons":case"lines":case"linestrips":case"polylist":case"triangles":t.primitives.push(this.parseGeometryPrimitive(r));break}}this.library.geometries[e.getAttribute("id")]=t}}parseSource(e){const t={array:[],stride:3};for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];if(s.nodeType===1)switch(s.nodeName){case"float_array":t.array=Jt(s.textContent);break;case"Name_array":t.array=Sy(s.textContent);break;case"technique_common":const r=on(s,"accessor")[0];r!==void 0&&(t.stride=parseInt(r.getAttribute("stride")));break}}return t}parseGeometryVertices(e){const t={};for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];s.nodeType===1&&(t[s.getAttribute("semantic")]=It(s.getAttribute("source")))}return t}parseGeometryPrimitive(e){const t={type:e.nodeName,material:e.getAttribute("material"),count:parseInt(e.getAttribute("count")),inputs:{},stride:0,hasUV:!1};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"input":const a=It(r.getAttribute("source")),o=r.getAttribute("semantic"),l=parseInt(r.getAttribute("offset")),c=parseInt(r.getAttribute("set")),u=c>0?o+c:o;t.inputs[u]={id:a,offset:l},t.stride=Math.max(t.stride,l+1),o==="TEXCOORD"&&(t.hasUV=!0);break;case"vcount":t.vcount=za(r.textContent);break;case"p":t.p=za(r.textContent);break}}return t.type==="polygons"&&(t.vcount=[t.p.length/t.stride]),t}parseLibraryJoint(e){this.library.joints[e.getAttribute("id")]=this.parseKinematicsJoint(e)}parseKinematicsModel(e){const t={name:e.getAttribute("name")||"",joints:{},links:[]};for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];if(s.nodeType===1)switch(s.nodeName){case"technique_common":this.parseKinematicsTechniqueCommon(s,t);break}}this.library.kinematicsModels[e.getAttribute("id")]=t}parseKinematicsTechniqueCommon(e,t){for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];if(s.nodeType===1)switch(s.nodeName){case"joint":t.joints[s.getAttribute("sid")]=this.parseKinematicsJoint(s);break;case"instance_joint":t.joints[s.getAttribute("sid")]=this.library.joints[It(s.getAttribute("url"))];break;case"link":t.links.push(this.parseKinematicsLink(s));break}}}parseKinematicsJoint(e){let t;for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];if(s.nodeType===1)switch(s.nodeName){case"prismatic":case"revolute":t=this.parseKinematicsJointParameter(s);break}}return t}parseKinematicsJointParameter(e){const t={sid:e.getAttribute("sid"),name:e.getAttribute("name")||"",axis:new I,limits:{min:0,max:0},type:e.nodeName,static:!1,zeroPosition:0,middlePosition:0};for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];if(s.nodeType===1)switch(s.nodeName){case"axis":const r=Jt(s.textContent);t.axis.fromArray(r);break;case"limits":const a=s.getElementsByTagName("max")[0],o=s.getElementsByTagName("min")[0];t.limits.max=parseFloat(a.textContent),t.limits.min=parseFloat(o.textContent);break}}return t.limits.min>=t.limits.max&&(t.static=!0),t.middlePosition=(t.limits.min+t.limits.max)/2,t}parseKinematicsLink(e){const t={sid:e.getAttribute("sid"),name:e.getAttribute("name")||"",attachments:[],transforms:[]};for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];if(s.nodeType===1)switch(s.nodeName){case"attachment_full":t.attachments.push(this.parseKinematicsAttachment(s));break;case"matrix":case"translate":case"rotate":t.transforms.push(this.parseKinematicsTransform(s));break}}return t}parseKinematicsAttachment(e){const t={joint:e.getAttribute("joint").split("/").pop(),transforms:[],links:[]};for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];if(s.nodeType===1)switch(s.nodeName){case"link":t.links.push(this.parseKinematicsLink(s));break;case"matrix":case"translate":case"rotate":t.transforms.push(this.parseKinematicsTransform(s));break}}return t}parseKinematicsTransform(e){const t={type:e.nodeName},n=Jt(e.textContent);switch(t.type){case"matrix":t.obj=new Fe,t.obj.fromArray(n).transpose();break;case"translate":t.obj=new I,t.obj.fromArray(n);break;case"rotate":t.obj=new I,t.obj.fromArray(n),t.angle=Bn.degToRad(n[3]);break}return t}parsePhysicsModel(e){const t={name:e.getAttribute("name")||"",rigidBodies:{}};for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];if(s.nodeType===1)switch(s.nodeName){case"rigid_body":t.rigidBodies[s.getAttribute("name")]={},this.parsePhysicsRigidBody(s,t.rigidBodies[s.getAttribute("name")]);break}}this.library.physicsModels[e.getAttribute("id")]=t}parsePhysicsRigidBody(e,t){for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];if(s.nodeType===1)switch(s.nodeName){case"technique_common":this.parsePhysicsTechniqueCommon(s,t);break}}}parsePhysicsTechniqueCommon(e,t){for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];if(s.nodeType===1)switch(s.nodeName){case"inertia":t.inertia=Jt(s.textContent);break;case"mass":t.mass=Jt(s.textContent)[0];break}}}parseKinematicsScene(e){const t={bindJointAxis:[]};for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];if(s.nodeType===1)switch(s.nodeName){case"bind_joint_axis":t.bindJointAxis.push(this.parseKinematicsBindJointAxis(s));break}}this.library.kinematicsScenes[It(e.getAttribute("url"))]=t}parseKinematicsBindJointAxis(e){const t={target:e.getAttribute("target").split("/").pop()};for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];if(s.nodeType===1)switch(s.nodeName){case"axis":const r=s.getElementsByTagName("param")[0];t.axis=r.textContent;const a=t.axis.split("inst_").pop().split("axis")[0];t.jointIndex=a.substring(0,a.length-1);break}}return t}prepareNodes(e){const t=e.getElementsByTagName("node");for(let n=0;n<t.length;n++){const s=t[n];s.hasAttribute("id")===!1&&s.setAttribute("id",this.generateId())}}parseNode(e){const t=new Fe,n=new I,s={name:e.getAttribute("name")||"",type:e.getAttribute("type"),id:e.getAttribute("id"),sid:e.getAttribute("sid"),matrix:new Fe,nodes:[],instanceCameras:[],instanceControllers:[],instanceLights:[],instanceGeometries:[],instanceNodes:[],transforms:{},transformData:{},transformOrder:[]};for(let r=0;r<e.childNodes.length;r++){const a=e.childNodes[r];if(a.nodeType!==1)continue;let o;switch(a.nodeName){case"node":s.nodes.push(a.getAttribute("id")),this.parseNode(a);break;case"instance_camera":s.instanceCameras.push(It(a.getAttribute("url")));break;case"instance_controller":s.instanceControllers.push(this.parseNodeInstance(a));break;case"instance_light":s.instanceLights.push(It(a.getAttribute("url")));break;case"instance_geometry":s.instanceGeometries.push(this.parseNodeInstance(a));break;case"instance_node":s.instanceNodes.push(It(a.getAttribute("url")));break;case"matrix":o=Jt(a.textContent),s.matrix.multiply(t.fromArray(o).transpose());{const l=a.getAttribute("sid");s.transforms[l]=a.nodeName,s.transformData[l]={type:"matrix",array:o},s.transformOrder.push(l)}break;case"translate":o=Jt(a.textContent),n.fromArray(o),s.matrix.multiply(t.makeTranslation(n.x,n.y,n.z));{const l=a.getAttribute("sid");s.transforms[l]=a.nodeName,s.transformData[l]={type:"translate",x:o[0],y:o[1],z:o[2]},s.transformOrder.push(l)}break;case"rotate":o=Jt(a.textContent);{const l=Bn.degToRad(o[3]);s.matrix.multiply(t.makeRotationAxis(n.fromArray(o),l));const c=a.getAttribute("sid");s.transforms[c]=a.nodeName,s.transformData[c]={type:"rotate",axis:[o[0],o[1],o[2]],angle:o[3]},s.transformOrder.push(c)}break;case"scale":o=Jt(a.textContent),s.matrix.scale(n.fromArray(o));{const l=a.getAttribute("sid");s.transforms[l]=a.nodeName,s.transformData[l]={type:"scale",x:o[0],y:o[1],z:o[2]},s.transformOrder.push(l)}break}}return this.hasNode(s.id)?console.warn("THREE.ColladaLoader: There is already a node with ID %s. Exclude current node from further processing.",s.id):this.library.nodes[s.id]=s,s}parseNodeInstance(e){const t={id:It(e.getAttribute("url")),materials:{},skeletons:[]};for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];switch(s.nodeName){case"bind_material":const r=s.getElementsByTagName("instance_material");for(let a=0;a<r.length;a++){const o=r[a],l=o.getAttribute("symbol"),c=o.getAttribute("target");t.materials[l]=It(c)}break;case"skeleton":t.skeletons.push(It(s.textContent));break}}return t}parseVisualScene(e){const t={name:e.getAttribute("name"),children:[]};this.prepareNodes(e);const n=on(e,"node");for(let s=0;s<n.length;s++)t.children.push(this.parseNode(n[s]));this.library.visualScenes[e.getAttribute("id")]=t}hasNode(e){return this.library.nodes[e]!==void 0}}class Ty{constructor(e,t,n,s){this.library=e,this.collada=t,this.textureLoader=n,this.tgaLoader=s,this.tempColor=new Oe,this.animations=[],this.kinematics={},this.position=new I,this.scale=new I,this.quaternion=new Ot,this.matrix=new Fe,this.deferredPivotAnimations={},this.transformNodes={}}compose(){const e=this.library;this.buildLibrary(e.animations,this.buildAnimation.bind(this)),this.buildLibrary(e.clips,this.buildAnimationClip.bind(this)),this.buildLibrary(e.controllers,this.buildController.bind(this)),this.buildLibrary(e.images,this.buildImage.bind(this)),this.buildLibrary(e.effects,this.buildEffect.bind(this)),this.buildLibrary(e.materials,this.buildMaterial.bind(this)),this.buildLibrary(e.cameras,this.buildCamera.bind(this)),this.buildLibrary(e.lights,this.buildLight.bind(this)),this.buildLibrary(e.geometries,this.buildGeometry.bind(this)),this.buildLibrary(e.visualScenes,this.buildVisualScene.bind(this)),this.setupAnimations(),this.setupKinematics();const t=this.parseScene(on(this.collada,"scene")[0]);return t.animations=this.animations,{scene:t,animations:this.animations,kinematics:this.kinematics}}buildLibrary(e,t){for(const n in e){const s=e[n];s.build=t(e[n])}}getBuild(e,t){return e.build!==void 0||(e.build=t(e)),e.build}isEmpty(e){return Object.keys(e).length===0}buildAnimation(e){const t=[],n=e.channels,s=e.samplers,r=e.sources,a=this.aggregateAnimationChannels(n,s,r);for(const o in a){const l=this.library.nodes[o];if(!l)continue;const c=a[o];if(this.hasPivotTransforms(l))this.collectDeferredPivotAnimation(o,c);else{const u=this.getNode(o);let h=!1;for(const d in c){const f=l.transforms[d],g=l.transformData[d],x=c[d];switch(f){case"matrix":this.buildMatrixTracks(u,x,l,t);break;case"translate":this.buildTranslateTrack(u,x,g,t);break;case"rotate":h||(this.buildRotateTrack(u,d,x,g,l,t),h=!0);break;case"scale":this.buildScaleTrack(u,x,g,t);break}}}}return t}collectDeferredPivotAnimation(e,t){this.deferredPivotAnimations[e]||(this.deferredPivotAnimations[e]={});const n=this.deferredPivotAnimations[e];for(const s in t){n[s]||(n[s]={});for(const r in t[s])n[s][r]=t[s][r]}}hasPivotTransforms(e){const t=["rotatePivot","rotatePivotInverse","rotatePivotTranslation","scalePivot","scalePivotInverse","scalePivotTranslation"];for(const n of t)if(e.transforms[n]!==void 0)return!0;return!1}getAnimation(e){return this.getBuild(this.library.animations[e],this.buildAnimation.bind(this))}aggregateAnimationChannels(e,t,n){const s={};for(const r in e){if(!e.hasOwnProperty(r))continue;const a=e[r],o=t[a.sampler],l=o.inputs.INPUT,c=o.inputs.OUTPUT,u=n[l],h=n[c],d=o.inputs.INTERPOLATION,f=o.inputs.IN_TANGENT,g=o.inputs.OUT_TANGENT,x=d?n[d]:null,m=f?n[f]:null,p=g?n[g]:null,E=a.id,A=a.sid,b=a.member||"default";s[E]||(s[E]={}),s[E][A]||(s[E][A]={}),s[E][A][b]={times:u.array,values:h.array,stride:h.stride,arraySyntax:a.arraySyntax,indices:a.indices,interpolation:x?x.array:null,inTangent:m?m.array:null,outTangent:p?p.array:null,inTangentStride:m?m.stride:0,outTangentStride:p?p.stride:0}}return s}buildMatrixTracks(e,t,n,s){const r=n.matrix.clone().transpose(),a={};for(const c in t){const u=t[c],h=u.times,d=u.values,f=u.stride;for(let g=0,x=h.length;g<x;g++){const m=h[g],p=g*f;if(a[m]===void 0&&(a[m]={}),u.arraySyntax===!0){const E=d[p],A=u.indices[0]+4*u.indices[1];a[m][A]=E}else for(let E=0;E<f;E++)a[m][E]=d[p+E]}}const o=this.prepareAnimationData(a,r),l={name:e.uuid,keyframes:o};this.createKeyframeTracks(l,s)}buildTranslateTrack(e,t,n,s){if(t.default&&t.default.stride===3){const c=t.default,u=Array.from(c.times),h=Array.from(c.values),d=new mn(e.uuid+".position",u,h),f=this.getInterpolationInfo(t);this.applyInterpolation(d,f,t),s.push(d);return}const r=this.getTimesForAllAxes(t);if(r.length===0)return;const a=[],o=this.getInterpolationInfo(t);for(let c=0;c<r.length;c++){const u=r[c],h=this.getValueAtTime(t.X,u,n.x),d=this.getValueAtTime(t.Y,u,n.y),f=this.getValueAtTime(t.Z,u,n.z);a.push(h,d,f)}const l=new mn(e.uuid+".position",r,a);this.applyInterpolation(l,o),s.push(l)}buildRotateTrack(e,t,n,s,r,a){const o=n.ANGLE||n.default;if(!o)return;const l=Array.from(o.times);if(l.length===0)return;const c=[];for(const m of r.transformOrder)if(r.transforms[m]==="rotate"){const E=r.transformData[m];c.push({sid:m,axis:new I(E.axis[0],E.axis[1],E.axis[2]),defaultAngle:E.angle})}const u=new Ot,h=new Ot,d=new Ot,f=[],g=this.getInterpolationInfo(n);for(let m=0;m<l.length;m++){const p=l[m];u.identity();for(const E of c){let A;E.sid===t?A=this.getValueAtTime(o,p,E.defaultAngle):A=E.defaultAngle;const b=Bn.degToRad(A);d.setFromAxisAngle(E.axis,b),u.multiply(d)}m>0&&h.dot(u)<0&&(u.x=-u.x,u.y=-u.y,u.z=-u.z,u.w=-u.w),h.copy(u),f.push(u.x,u.y,u.z,u.w)}const x=new tr(e.uuid+".quaternion",l,f);this.applyInterpolation(x,g),a.push(x)}buildScaleTrack(e,t,n,s){if(t.default&&t.default.stride===3){const c=t.default,u=Array.from(c.times),h=Array.from(c.values),d=new mn(e.uuid+".scale",u,h),f=this.getInterpolationInfo(t);this.applyInterpolation(d,f,t),s.push(d);return}const r=this.getTimesForAllAxes(t);if(r.length===0)return;const a=[],o=this.getInterpolationInfo(t);for(let c=0;c<r.length;c++){const u=r[c],h=this.getValueAtTime(t.X,u,n.x),d=this.getValueAtTime(t.Y,u,n.y),f=this.getValueAtTime(t.Z,u,n.z);a.push(h,d,f)}const l=new mn(e.uuid+".scale",r,a);this.applyInterpolation(l,o),s.push(l)}getTimesForAllAxes(e){let t=[];return e.X&&(t=t.concat(Array.from(e.X.times))),e.Y&&(t=t.concat(Array.from(e.Y.times))),e.Z&&(t=t.concat(Array.from(e.Z.times))),e.ANGLE&&(t=t.concat(Array.from(e.ANGLE.times))),e.default&&(t=t.concat(Array.from(e.default.times))),t=[...new Set(t)].sort((n,s)=>n-s),t}getValueAtTime(e,t,n){if(!e)return n;const s=e.times,r=e.values,a=e.interpolation;for(let o=0;o<s.length;o++){if(s[o]===t)return r[o];if(s[o]>t){if(o===0)return r[0];const l=o-1,c=o,u=s[l],h=s[c],d=r[l],f=r[c],g=a?a[l]:"LINEAR";if(g==="STEP")return d;if(g==="BEZIER"&&e.inTangent&&e.outTangent)return this.evaluateBezierComponent(e,l,c,u,h,t);{const x=(t-u)/(h-u);return d+x*(f-d)}}}return r[r.length-1]}evaluateBezierComponent(e,t,n,s,r,a){const o=e.values,l=e.inTangent,c=e.outTangent,u=e.inTangentStride||1,h=o[t],d=o[n];let f,g,x,m;u===2?(f=c[t*2],g=c[t*2+1],x=l[n*2],m=l[n*2+1]):(f=s+(r-s)/3,g=c[t],x=r-(r-s)/3,m=l[n]);let p=(a-s)/(r-s);for(let w=0;w<8;w++){const _=p*p,M=_*p,P=1-p,R=P*P,z=R*P*s+3*R*p*f+3*P*_*x+M*r,X=3*R*(f-s)+6*P*p*(x-f)+3*_*(r-x);if(Math.abs(X)<1e-10)break;const O=z-a;if(Math.abs(O)<1e-10)break;p=p-O/X,p=Math.max(0,Math.min(1,p))}const E=p*p,A=E*p,b=1-p,T=b*b;return T*b*h+3*T*p*g+3*b*E*m+A*d}getInterpolationInfo(e){const t=["X","Y","Z","ANGLE","default"];let n=null,s=!0;for(const r of t){const a=e[r];if(!a||!a.interpolation)continue;const o=a.interpolation;for(let l=0;l<o.length;l++){const c=o[l];n===null?n=c:c!==n&&(s=!1)}}return{type:n||"LINEAR",uniform:s}}applyInterpolation(e,t,n=null){if(t.type==="STEP"&&t.uniform)e.setInterpolation(kr);else if(t.type==="BEZIER"&&t.uniform&&n){const s=n.default;s&&s.inTangent&&s.outTangent&&(e.setInterpolation(Cc),e.settings={inTangents:new Float32Array(s.inTangent),outTangents:new Float32Array(s.outTangent)})}}prepareAnimationData(e,t){const n=[];for(const s in e)n.push({time:parseFloat(s),value:e[s]});n.sort((s,r)=>s.time-r.time);for(let s=0;s<16;s++)this.transformAnimationData(n,s,t.elements[s]);return n}createKeyframeTracks(e,t){const n=e.keyframes,s=e.name,r=[],a=[],o=[],l=[],c=this.position,u=this.quaternion,h=this.scale,d=this.matrix;for(let f=0,g=n.length;f<g;f++){const x=n[f],m=x.time,p=x.value;d.fromArray(p).transpose(),d.decompose(c,u,h),r.push(m),a.push(c.x,c.y,c.z),o.push(u.x,u.y,u.z,u.w),l.push(h.x,h.y,h.z)}return a.length>0&&t.push(new mn(s+".position",r,a)),o.length>0&&t.push(new tr(s+".quaternion",r,o)),l.length>0&&t.push(new mn(s+".scale",r,l)),t}transformAnimationData(e,t,n){let s,r=!0,a,o;for(a=0,o=e.length;a<o;a++)s=e[a],s.value[t]===void 0?s.value[t]=null:r=!1;if(r===!0)for(a=0,o=e.length;a<o;a++)s=e[a],s.value[t]=n;else this.createMissingKeyframes(e,t)}createMissingKeyframes(e,t){let n,s;for(let r=0,a=e.length;r<a;r++){const o=e[r];if(o.value[t]===null){if(n=this.getPrev(e,r,t),s=this.getNext(e,r,t),n===null){o.value[t]=s.value[t];continue}if(s===null){o.value[t]=n.value[t];continue}this.interpolate(o,n,s,t)}}}getPrev(e,t,n){for(;t>=0;){const s=e[t];if(s.value[n]!==null)return s;t--}return null}getNext(e,t,n){for(;t<e.length;){const s=e[t];if(s.value[n]!==null)return s;t++}return null}interpolate(e,t,n,s){if(n.time-t.time===0){e.value[s]=t.value[s];return}e.value[s]=(e.time-t.time)*(n.value[s]-t.value[s])/(n.time-t.time)+t.value[s]}buildAnimationClip(e){const t=[],n=e.name,s=e.end-e.start||-1,r=e.animations;for(let a=0,o=r.length;a<o;a++){const l=this.getAnimation(r[a]);for(let c=0,u=l.length;c<u;c++)t.push(l[c])}return new ku(n,s,t)}getAnimationClip(e){return this.getBuild(this.library.clips[e],this.buildAnimationClip.bind(this))}buildController(e){const t={id:e.id},n=this.library.geometries[t.id];return e.skin!==void 0&&(t.skin=this.buildSkin(e.skin),n.sources.skinIndices=t.skin.indices,n.sources.skinWeights=t.skin.weights),t}buildSkin(e){const n={joints:[],indices:{array:[],stride:4},weights:{array:[],stride:4}},s=e.sources,r=e.vertexWeights,a=r.vcount,o=r.v,l=r.inputs.JOINT.offset,c=r.inputs.WEIGHT.offset,u=e.sources[e.joints.inputs.JOINT],h=e.sources[e.joints.inputs.INV_BIND_MATRIX],d=s[r.inputs.WEIGHT.id].array;let f=0,g,x,m;for(g=0,m=a.length;g<m;g++){const E=a[g],A=[];for(x=0;x<E;x++){const b=o[f+l],T=o[f+c],y=d[T];A.push({index:b,weight:y}),f+=2}for(A.sort(p),x=0;x<4;x++){const b=A[x];b!==void 0?(n.indices.array.push(b.index),n.weights.array.push(b.weight)):(n.indices.array.push(0),n.weights.array.push(0))}}for(e.bindShapeMatrix?n.bindMatrix=new Fe().fromArray(e.bindShapeMatrix).transpose():n.bindMatrix=new Fe().identity(),g=0,m=u.array.length;g<m;g++){const E=u.array[g],A=new Fe().fromArray(h.array,g*h.stride).transpose();n.joints.push({name:E,boneInverse:A})}return n;function p(E,A){return A.weight-E.weight}}getController(e){return this.getBuild(this.library.controllers[e],this.buildController.bind(this))}buildImage(e){return e.build!==void 0?e.build:e.init_from}getImage(e){const t=this.library.images[e];return t!==void 0?this.getBuild(t,this.buildImage.bind(this)):(console.warn("THREE.ColladaLoader: Couldn't find image with ID:",e),null)}buildEffect(e){return e}getEffect(e){return this.getBuild(this.library.effects[e],this.buildEffect.bind(this))}getTextureLoader(e){let t,n=e.slice((e.lastIndexOf(".")-1>>>0)+2);switch(n=n.toLowerCase(),n){case"tga":t=this.tgaLoader;break;default:t=this.textureLoader}return t}buildMaterial(e){const t=this.getEffect(e.url),n=t.profile.technique;let s;switch(n.type){case"phong":case"blinn":s=new wr;break;case"lambert":s=new Og;break;default:s=new Gr;break}s.name=e.name||"";const r=this;function a(u,h=null){const d=t.profile.samplers[u.id];let f=null;if(d!==void 0){const g=t.profile.surfaces[d.source];f=r.getImage(g.init_from)}else console.warn("THREE.ColladaLoader: Undefined sampler. Access image directly (see #12530)."),f=r.getImage(u.id);if(f!==null){const g=r.getTextureLoader(f);if(g!==void 0){const x=g.load(f),m=u.extra;if(m!==void 0&&m.technique!==void 0&&r.isEmpty(m.technique)===!1){const p=m.technique;x.wrapS=p.wrapU?cs:dn,x.wrapT=p.wrapV?cs:dn,x.offset.set(p.offsetU||0,p.offsetV||0),x.repeat.set(p.repeatU||1,p.repeatV||1)}else x.wrapS=cs,x.wrapT=cs;return h!==null&&(x.colorSpace=h),x}else return console.warn("THREE.ColladaLoader: Loader for texture %s not found.",f),null}else return console.warn("THREE.ColladaLoader: Couldn't create texture with ID:",u.id),null}const o=n.parameters;for(const u in o){const h=o[u];switch(u){case"diffuse":h.color&&s.color.fromArray(h.color),h.texture&&(s.map=a(h.texture,dt));break;case"specular":h.color&&s.specular&&s.specular.fromArray(h.color),h.texture&&(s.specularMap=a(h.texture));break;case"bump":h.texture&&(s.normalMap=a(h.texture));break;case"ambient":h.texture&&(s.lightMap=a(h.texture,dt));break;case"shininess":h.float&&s.shininess&&(s.shininess=h.float);break;case"emission":h.color&&s.emissive&&s.emissive.fromArray(h.color),h.texture&&(s.emissiveMap=a(h.texture,dt));break}}Xe.colorSpaceToWorking(s.color,dt),s.specular&&Xe.colorSpaceToWorking(s.specular,dt),s.emissive&&Xe.colorSpaceToWorking(s.emissive,dt);let l=o.transparent,c=o.transparency;if(c===void 0&&l&&(c={float:1}),l===void 0&&c&&(l={opaque:"A_ONE",data:{color:[1,1,1,1]}}),l&&c)if(l.data.texture)s.transparent=!0;else{const u=l.data.color;switch(l.opaque){case"A_ONE":s.opacity=u[3]*c.float;break;case"RGB_ZERO":s.opacity=1-u[0]*c.float;break;case"A_ZERO":s.opacity=1-u[3]*c.float;break;case"RGB_ONE":s.opacity=u[0]*c.float;break;default:console.warn('THREE.ColladaLoader: Invalid opaque type "%s" of transparent tag.',l.opaque)}s.opacity<1&&(s.transparent=!0)}if(n.extra!==void 0&&n.extra.technique!==void 0){const u=n.extra.technique;for(const h in u){const d=u[h];switch(h){case"double_sided":s.side=d===1?Rn:mi;break;case"bump":s.normalMap=a(d.texture),s.normalScale=new Ne(1,1);break}}}return s}getMaterial(e){return this.getBuild(this.library.materials[e],this.buildMaterial.bind(this))}buildCamera(e){let t;switch(e.optics.technique){case"perspective":t=new Xt(e.optics.parameters.yfov,e.optics.parameters.aspect_ratio,e.optics.parameters.znear,e.optics.parameters.zfar);break;case"orthographic":let n=e.optics.parameters.ymag,s=e.optics.parameters.xmag;const r=e.optics.parameters.aspect_ratio;s=s===void 0?n*r:s,n=n===void 0?s/r:n,s*=.5,n*=.5,t=new Fo(-s,s,n,-n,e.optics.parameters.znear,e.optics.parameters.zfar);break;default:t=new Xt;break}return t.name=e.name||"",t}getCamera(e){const t=this.library.cameras[e];return t!==void 0?this.getBuild(t,this.buildCamera.bind(this)):(console.warn("THREE.ColladaLoader: Couldn't find camera with ID:",e),null)}buildLight(e){let t;switch(e.technique){case"directional":t=new If;break;case"point":t=new i_;break;case"spot":t=new t_;break;case"ambient":t=new r_;break}return e.parameters.color&&t.color.copy(e.parameters.color),e.parameters.distance&&(t.distance=e.parameters.distance),e.parameters.falloffAngle&&(t.angle=Bn.degToRad(e.parameters.falloffAngle)),t}getLight(e){const t=this.library.lights[e];return t!==void 0?this.getBuild(t,this.buildLight.bind(this)):(console.warn("THREE.ColladaLoader: Couldn't find light with ID:",e),null)}groupPrimitives(e){const t={};for(let n=0;n<e.length;n++){const s=e[n];t[s.type]===void 0&&(t[s.type]=[]),t[s.type].push(s)}return t}checkUVCoordinates(e){let t=0;for(let n=0,s=e.length;n<s;n++)e[n].hasUV===!0&&t++;t>0&&t<e.length&&(e.uvsNeedsFix=!0)}buildGeometry(e){const t={},n=e.sources,s=e.vertices,r=e.primitives;if(r.length===0)return{};const a=this.groupPrimitives(r);for(const o in a){const l=a[o];this.checkUVCoordinates(l),t[o]=this.buildGeometryType(l,n,s)}return t}buildGeometryType(e,t,n){const s={},r={array:[],stride:0},a={array:[],stride:0},o={array:[],stride:0},l={array:[],stride:0},c={array:[],stride:0},u={array:[],stride:4},h={array:[],stride:4},d=new Vt,f=[];let g=0;for(let x=0;x<e.length;x++){const m=e[x],p=m.inputs;let E=0;switch(m.type){case"lines":case"linestrips":E=m.count*2;break;case"triangles":E=m.count*3;break;case"polygons":case"polylist":for(let A=0;A<m.count;A++){const b=m.vcount[A];switch(b){case 3:E+=3;break;case 4:E+=6;break;default:E+=(b-2)*3;break}}break;default:console.warn("THREE.ColladaLoader: Unknown primitive type:",m.type)}d.addGroup(g,E,x),g+=E,m.material&&f.push(m.material);for(const A in p){const b=p[A];switch(A){case"VERTEX":for(const T in n){const y=n[T];switch(T){case"POSITION":const w=r.array.length;if(this.buildGeometryData(m,t[y],b.offset,r.array),r.stride=t[y].stride,t.skinWeights&&t.skinIndices&&(this.buildGeometryData(m,t.skinIndices,b.offset,u.array),this.buildGeometryData(m,t.skinWeights,b.offset,h.array)),m.hasUV===!1&&e.uvsNeedsFix===!0){const _=(r.array.length-w)/r.stride;for(let M=0;M<_;M++)o.array.push(0,0)}break;case"NORMAL":this.buildGeometryData(m,t[y],b.offset,a.array),a.stride=t[y].stride;break;case"COLOR":this.buildGeometryData(m,t[y],b.offset,c.array),c.stride=t[y].stride;break;case"TEXCOORD":this.buildGeometryData(m,t[y],b.offset,o.array),o.stride=t[y].stride;break;case"TEXCOORD1":this.buildGeometryData(m,t[y],b.offset,l.array),o.stride=t[y].stride;break;default:console.warn('THREE.ColladaLoader: Semantic "%s" not handled in geometry build process.',T)}}break;case"NORMAL":this.buildGeometryData(m,t[b.id],b.offset,a.array),a.stride=t[b.id].stride;break;case"COLOR":this.buildGeometryData(m,t[b.id],b.offset,c.array,!0),c.stride=t[b.id].stride;break;case"TEXCOORD":this.buildGeometryData(m,t[b.id],b.offset,o.array),o.stride=t[b.id].stride;break;case"TEXCOORD1":this.buildGeometryData(m,t[b.id],b.offset,l.array),l.stride=t[b.id].stride;break}}}return r.array.length>0&&d.setAttribute("position",new Qe(r.array,r.stride)),a.array.length>0&&d.setAttribute("normal",new Qe(a.array,a.stride)),c.array.length>0&&d.setAttribute("color",new Qe(c.array,c.stride)),o.array.length>0&&d.setAttribute("uv",new Qe(o.array,o.stride)),l.array.length>0&&d.setAttribute("uv1",new Qe(l.array,l.stride)),u.array.length>0&&d.setAttribute("skinIndex",new Qe(u.array,u.stride)),h.array.length>0&&d.setAttribute("skinWeight",new Qe(h.array,h.stride)),s.data=d,s.type=e[0].type,s.materialKeys=f,s}buildGeometryData(e,t,n,s,r=!1){const a=e.p,o=e.stride,l=e.vcount,c=this.tempColor;function u(f){let g=a[f+n]*d;const x=g+d;for(;g<x;g++)s.push(h[g]);if(r){const m=s.length-d-1;c.setRGB(s[m+0],s[m+1],s[m+2],dt),s[m+0]=c.r,s[m+1]=c.g,s[m+2]=c.b}}const h=t.array,d=t.stride;if(e.vcount!==void 0){let f=0;for(let g=0,x=l.length;g<x;g++){const m=l[g];if(m===4){const p=f+o*0,E=f+o*1,A=f+o*2,b=f+o*3;u(p),u(E),u(b),u(E),u(A),u(b)}else if(m===3){const p=f+o*0,E=f+o*1,A=f+o*2;u(p),u(E),u(A)}else if(m>4){const p=[];for(let w=0;w<m;w++){const _=f+o*w,M=a[_]*d,P=h[M],R=h[M+1],L=h[M+2];p.push(new I(P,R,L))}const E=new I,A=new _n;A.a=p[0],A.b=p[1],A.c=p[2],A.getNormal(E);const b=[];if(Math.abs(E.x)>Math.abs(E.y)&&Math.abs(E.x)>Math.abs(E.z))for(let w=0;w<m;w++)b.push(new Ne(p[w].y,p[w].z));else if(Math.abs(E.y)>Math.abs(E.z))for(let w=0;w<m;w++)b.push(new Ne(p[w].x,p[w].z));else for(let w=0;w<m;w++)b.push(new Ne(p[w].x,p[w].y));const T=mo.isClockWise(b);T===!0&&b.reverse();const y=mo.triangulateShape(b,[]);for(let w=0;w<y.length;w++){const _=y[w];let M,P,R;T===!1?(M=_[0],P=_[1],R=_[2]):(M=m-1-_[0],P=m-1-_[2],R=m-1-_[1]);const L=f+o*M,z=f+o*P,X=f+o*R;u(L),u(z),u(X)}}f+=o*m}}else for(let f=0,g=a.length;f<g;f+=o)u(f)}getGeometry(e){return this.getBuild(this.library.geometries[e],this.buildGeometry.bind(this))}buildKinematicsModel(e){return e.build!==void 0?e.build:e}getKinematicsModel(e){return this.getBuild(this.library.kinematicsModels[e],this.buildKinematicsModel.bind(this))}buildKinematicsScene(e){return e.build!==void 0?e.build:e}getKinematicsScene(e){return this.getBuild(this.library.kinematicsScenes[e],this.buildKinematicsScene.bind(this))}setupKinematics(){const e=Object.keys(this.library.kinematicsModels)[0],t=Object.keys(this.library.kinematicsScenes)[0],n=Object.keys(this.library.visualScenes)[0];if(e===void 0||t===void 0)return;const s=this.getKinematicsModel(e),r=this.getKinematicsScene(t),a=this.getVisualScene(n),o=r.bindJointAxis,l={},c=this.collada,u=this;for(let g=0,x=o.length;g<x;g++){const m=o[g],p=c.querySelector('[sid="'+m.target+'"]');if(p){const E=p.parentElement;h(m.jointIndex,E)}}function h(g,x){const m=x.getAttribute("name"),p=s.joints[g],E=u.buildTransformList(x);a.traverse(function(A){A.name===m&&(l[g]={object:A,transforms:E,joint:p,position:p.zeroPosition})})}const d=new Fe,f=this.matrix;this.kinematics={joints:s&&s.joints,getJointValue:function(g){const x=l[g];if(x)return x.position;console.warn("THREE.ColladaLoader: Joint "+g+" doesn't exist.")},setJointValue:function(g,x){const m=l[g];if(m){const p=m.joint;if(x>p.limits.max||x<p.limits.min)console.warn("THREE.ColladaLoader: Joint "+g+" value "+x+" outside of limits (min: "+p.limits.min+", max: "+p.limits.max+").");else if(p.static)console.warn("THREE.ColladaLoader: Joint "+g+" is static.");else{const E=m.object,A=p.axis,b=m.transforms;f.identity();for(let T=0;T<b.length;T++){const y=b[T];if(y.sid&&y.sid.indexOf(g)!==-1)switch(p.type){case"revolute":f.multiply(d.makeRotationAxis(A,Bn.degToRad(x)));break;case"prismatic":f.multiply(d.makeTranslation(A.x*x,A.y*x,A.z*x));break;default:console.warn("THREE.ColladaLoader: Unknown joint type: "+p.type);break}else switch(y.type){case"matrix":f.multiply(y.obj);break;case"translate":f.multiply(d.makeTranslation(y.obj.x,y.obj.y,y.obj.z));break;case"scale":f.scale(y.obj);break;case"rotate":f.multiply(d.makeRotationAxis(y.obj,y.angle));break}}E.matrix.copy(f),E.matrix.decompose(E.position,E.quaternion,E.scale),l[g].position=x}}else console.warn("THREE.ColladaLoader: Joint "+g+" does not exist.")}}}buildTransformList(e){const t=[],n=this.collada.querySelector('[id="'+e.id+'"]');for(let s=0;s<n.childNodes.length;s++){const r=n.childNodes[s];if(r.nodeType!==1)continue;let a,o;switch(r.nodeName){case"matrix":a=Jt(r.textContent);const l=new Fe().fromArray(a).transpose();t.push({sid:r.getAttribute("sid"),type:r.nodeName,obj:l});break;case"translate":case"scale":a=Jt(r.textContent),o=new I().fromArray(a),t.push({sid:r.getAttribute("sid"),type:r.nodeName,obj:o});break;case"rotate":a=Jt(r.textContent),o=new I().fromArray(a);const c=Bn.degToRad(a[3]);t.push({sid:r.getAttribute("sid"),type:r.nodeName,obj:o,angle:c});break}}return t}buildSkeleton(e,t){const n=[],s=[];let r,a,o;for(r=0;r<e.length;r++){const u=e[r];let h;if(this.hasNode(u))h=this.getNode(u),this.buildBoneHierarchy(h,t,n);else if(this.hasVisualScene(u)){const f=this.library.visualScenes[u].children;for(let g=0;g<f.length;g++){const x=f[g];if(x.type==="JOINT"){const m=this.getNode(x.id);this.buildBoneHierarchy(m,t,n)}}}else console.error("THREE.ColladaLoader: Unable to find root bone of skeleton with ID:",u)}for(r=0;r<t.length;r++)for(a=0;a<n.length;a++)if(o=n[a],o.bone.name===t[r].name){s[r]=o,o.processed=!0;break}for(r=0;r<n.length;r++)o=n[r],o.processed===!1&&(s.push(o),o.processed=!0);const l=[],c=[];for(r=0;r<s.length;r++)o=s[r],l.push(o.bone),c.push(o.boneInverse);return new td(l,c)}buildBoneHierarchy(e,t,n){e.traverse(function(s){if(s.isBone===!0){let r;for(let a=0;a<t.length;a++){const o=t[a];if(o.name===s.name){r=o.boneInverse;break}}r===void 0&&(r=new Fe),n.push({bone:s,boneInverse:r,processed:!1})}})}buildNode(e){const t=[],n=e.matrix,s=e.nodes,r=e.type,a=e.instanceCameras,o=e.instanceControllers,l=e.instanceLights,c=e.instanceGeometries,u=e.instanceNodes;for(let d=0,f=s.length;d<f;d++)t.push(this.getNode(s[d]));for(let d=0,f=a.length;d<f;d++){const g=this.getCamera(a[d]);g!==null&&t.push(g.clone())}for(let d=0,f=o.length;d<f;d++){const g=o[d],x=this.getController(g.id),m=this.getGeometry(x.id),p=this.buildObjects(m,g.materials),E=g.skeletons,A=x.skin.joints,b=this.buildSkeleton(E,A);for(let T=0,y=p.length;T<y;T++){const w=p[T];w.isSkinnedMesh&&(w.bind(b,x.skin.bindMatrix),w.normalizeSkinWeights()),t.push(w)}}for(let d=0,f=l.length;d<f;d++){const g=this.getLight(l[d]);g!==null&&t.push(g.clone())}for(let d=0,f=c.length;d<f;d++){const g=c[d],x=this.getGeometry(g.id),m=this.buildObjects(x,g.materials);for(let p=0,E=m.length;p<E;p++)t.push(m[p])}for(let d=0,f=u.length;d<f;d++)t.push(this.getNode(u[d]).clone());let h;if(s.length===0&&t.length===1)h=t[0];else{h=r==="JOINT"?new bf:new Di;for(let d=0;d<t.length;d++)h.add(t[d])}return h.name=r==="JOINT"?e.sid:e.name,r!=="JOINT"&&this.hasPivotTransforms(e)?this.wrapWithTransformHierarchy(h,e):(h.matrix.copy(n),h.matrix.decompose(h.position,h.quaternion,h.scale),h)}wrapWithTransformHierarchy(e,t){const n=t.id;this.transformNodes[n]={};const s=t.transformOrder,r=t.transformData,a=new Di;a.name=t.name;let o=a;for(let l=0;l<s.length;l++){const c=s[l],u=r[c],h=new Di;switch(h.name=t.name+"_"+c,u.type){case"translate":h.position.set(u.x,u.y,u.z);break;case"rotate":{const d=new I(u.axis[0],u.axis[1],u.axis[2]),f=Bn.degToRad(u.angle);h.quaternion.setFromAxisAngle(d,f),h.userData.rotationAxis=d;break}case"scale":h.scale.set(u.x,u.y,u.z);break;case"matrix":{new Fe().fromArray(u.array).transpose().decompose(h.position,h.quaternion,h.scale);break}}this.transformNodes[n][c]=h,o.add(h),o=h}return o.add(e),a}resolveMaterialBinding(e,t){const n=[];for(let s=0,r=e.length;s<r;s++){const a=t[e[s]];a===void 0?(console.warn("THREE.ColladaLoader: Material with key %s not found. Apply fallback material.",e[s]),n.push(this.fallbackMaterial)):n.push(this.getMaterial(a))}return n}get fallbackMaterial(){return this._fallbackMaterial===void 0&&(this._fallbackMaterial=new Gr({name:ji.DEFAULT_MATERIAL_NAME,color:16711935})),this._fallbackMaterial}buildObjects(e,t){const n=[];for(const s in e){const r=e[s],a=this.resolveMaterialBinding(r.materialKeys,t);if(a.length===0&&(s==="lines"||s==="linestrips"?a.push(new Hr):a.push(new wr)),s==="lines"||s==="linestrips")for(let u=0,h=a.length;u<h;u++){const d=a[u];if(d.isMeshPhongMaterial===!0||d.isMeshLambertMaterial===!0){const f=new Hr;f.color.copy(d.color),f.opacity=d.opacity,f.transparent=d.transparent,a[u]=f}}const o=r.data.attributes.skinIndex!==void 0,l=a.length===1?a[0]:a;let c;switch(s){case"lines":c=new id(r.data,l);break;case"linestrips":c=new yf(r.data,l);break;case"triangles":case"polygons":case"polylist":o?c=new lg(r.data,l):c=new gt(r.data,l);break}n.push(c)}return n}hasNode(e){return this.library.nodes[e]!==void 0}getNode(e){return this.getBuild(this.library.nodes[e],this.buildNode.bind(this))}buildVisualScene(e){const t=new Di;t.name=e.name;const n=e.children;for(let s=0;s<n.length;s++){const r=n[s];t.add(this.getNode(r.id))}return t}hasVisualScene(e){return this.library.visualScenes[e]!==void 0}getVisualScene(e){return this.getBuild(this.library.visualScenes[e],this.buildVisualScene.bind(this))}parseScene(e){const t=on(e,"instance_visual_scene")[0];return this.getVisualScene(this.parseId(t.getAttribute("url")))}parseId(e){return e.substring(1)}setupAnimations(){const e=this.library.clips;if(this.isEmpty(e)===!0){if(this.isEmpty(this.library.animations)===!1){const t=[];for(const n in this.library.animations){const s=this.getAnimation(n);for(let r=0,a=s.length;r<a;r++)t.push(s[r])}this.buildDeferredPivotAnimationTracks(t),this.animations.push(new ku("default",-1,t))}}else for(const t in e)this.animations.push(this.getAnimationClip(t))}buildDeferredPivotAnimationTracks(e){for(const t in this.deferredPivotAnimations){const n=this.library.nodes[t];if(!n)continue;const s=this.deferredPivotAnimations[t];this.buildTransformHierarchyTracks(t,s,n,e)}}buildTransformHierarchyTracks(e,t,n,s){const r=this.transformNodes[e];if(!r){console.warn("THREE.ColladaLoader: Transform hierarchy not found for node:",e);return}for(const a in t){const o=r[a];if(!o)continue;const l=n.transforms[a],c=n.transformData[a],u=t[a];switch(l){case"translate":this.buildHierarchyTranslateTrack(o,u,c,s);break;case"rotate":this.buildHierarchyRotateTrack(o,u,c,s);break;case"scale":this.buildHierarchyScaleTrack(o,u,c,s);break}}}buildHierarchyTranslateTrack(e,t,n,s){if(t.default&&t.default.stride===3){const c=t.default,u=new mn(e.uuid+".position",Array.from(c.times),Array.from(c.values)),h=this.getInterpolationInfo(t);this.applyInterpolation(u,h,t),s.push(u);return}const r=this.getTimesForAllAxes(t);if(r.length===0)return;const a=[],o=this.getInterpolationInfo(t);for(let c=0;c<r.length;c++){const u=r[c],h=this.getValueAtTime(t.X,u,n.x),d=this.getValueAtTime(t.Y,u,n.y),f=this.getValueAtTime(t.Z,u,n.z);a.push(h,d,f)}const l=new mn(e.uuid+".position",r,a);this.applyInterpolation(l,o),s.push(l)}buildHierarchyRotateTrack(e,t,n,s){const r=t.ANGLE||t.default;if(!r)return;const a=Array.from(r.times);if(a.length===0)return;const o=e.userData.rotationAxis||new I(n.axis[0],n.axis[1],n.axis[2]),l=new Ot,c=new Ot,u=[],h=this.getInterpolationInfo(t);for(let f=0;f<a.length;f++){const g=a[f],x=this.getValueAtTime(r,g,n.angle),m=Bn.degToRad(x);l.setFromAxisAngle(o,m),f>0&&c.dot(l)<0&&(l.x=-l.x,l.y=-l.y,l.z=-l.z,l.w=-l.w),c.copy(l),u.push(l.x,l.y,l.z,l.w)}const d=new tr(e.uuid+".quaternion",a,u);this.applyInterpolation(d,h),s.push(d)}buildHierarchyScaleTrack(e,t,n,s){if(t.default&&t.default.stride===3){const c=t.default,u=new mn(e.uuid+".scale",Array.from(c.times),Array.from(c.values)),h=this.getInterpolationInfo(t);this.applyInterpolation(u,h,t),s.push(u);return}const r=this.getTimesForAllAxes(t);if(r.length===0)return;const a=[],o=this.getInterpolationInfo(t);for(let c=0;c<r.length;c++){const u=r[c],h=this.getValueAtTime(t.X,u,n.x),d=this.getValueAtTime(t.Y,u,n.y),f=this.getValueAtTime(t.Z,u,n.z);a.push(h,d,f)}const l=new mn(e.uuid+".scale",r,a);this.applyInterpolation(l,o),s.push(l)}}class Ay extends ji{load(e,t,n,s){const r=this,a=r.path===""?Df.extractUrlBase(e):r.path,o=new od(r.manager);o.setPath(r.path),o.setRequestHeader(r.requestHeader),o.setWithCredentials(r.withCredentials),o.load(e,function(l){try{t(r.parse(l,a))}catch(c){s?s(c):console.error(c),r.manager.itemError(e)}},n,s)}parse(e,t){if(e.length===0)return{scene:new _f};const s=new Ey().parse(e);if(s===null)return null;const{library:r,asset:a,collada:o}=s,l=new Lf(this.manager);l.setPath(this.resourcePath||t).setCrossOrigin(this.crossOrigin);let c;bh&&(c=new bh(this.manager),c.setPath(this.resourcePath||t));const u=new Ty(r,o,l,c),{scene:h,animations:d,kinematics:f}=u.compose();return h.animations=d,a.upAxis==="Z_UP"&&(console.warn("THREE.ColladaLoader: You are loading an asset with a Z-UP coordinate system. The loader just rotates the asset to transform it into Y-UP. The vertex data are not converted, see #24289."),h.rotation.set(-Math.PI/2,0,0)),h.scale.multiplyScalar(a.unit),{get animations(){return console.warn("THREE.ColladaLoader: Please access animations over scene.animations now."),d},kinematics:f,library:r,scene:h}}}const yh=new I,wy=new Mn,Va=new Fe,wi=new Fe,Ga=new Ot,Ha=new I(1,1,1),Wa=new I;class Bo extends _t{constructor(...e){super(...e),this.urdfNode=null,this.urdfName=""}copy(e,t){return super.copy(e,t),this.urdfNode=e.urdfNode,this.urdfName=e.urdfName,this}}class Ry extends Bo{constructor(...e){super(...e),this.isURDFCollider=!0,this.type="URDFCollider"}}class Cy extends Bo{constructor(...e){super(...e),this.isURDFVisual=!0,this.type="URDFVisual"}}class Wf extends Bo{constructor(...e){super(...e),this.isURDFLink=!0,this.type="URDFLink",this.name="",this.inertial={mass:0,origin:{xyz:[0,0,0],rpy:[0,0,0]},inertia:{ixx:0,ixy:0,ixz:0,iyy:0,iyz:0,izz:0}}}copy(e,t){return super.copy(e,t),this.inertial={mass:e.inertial.mass,origin:{xyz:[...e.inertial.origin.xyz],rpy:[...e.inertial.origin.rpy]},inertia:{...e.inertial.inertia}},this}}class Xf extends Bo{get jointType(){return this._jointType}set jointType(e){if(this.jointType!==e)switch(this._jointType=e,this.matrixWorldNeedsUpdate=!0,e){case"fixed":this.jointValue=[];break;case"continuous":case"revolute":case"prismatic":this.jointValue=new Array(1).fill(0);break;case"planar":this.jointValue=new Array(3).fill(0),this.axis=new I(0,0,1);break;case"floating":this.jointValue=new Array(6).fill(0);break}}get angle(){return this.jointValue[0]}constructor(...e){super(...e),this.isURDFJoint=!0,this.type="URDFJoint",this.name="",this.jointValue=null,this.jointType="fixed",this.axis=new I(1,0,0),this.limit={lower:0,upper:0,effort:0,velocity:0},this.ignoreLimits=!1,this.origPosition=null,this.origQuaternion=null,this.mimicJoints=[]}copy(e,t){return super.copy(e,t),this.jointType=e.jointType,this.axis=e.axis.clone(),this.limit.lower=e.limit.lower,this.limit.upper=e.limit.upper,this.limit.effort=e.limit.effort,this.limit.velocity=e.limit.velocity,this.ignoreLimits=!1,this.jointValue=[...e.jointValue],this.origPosition=e.origPosition?e.origPosition.clone():null,this.origQuaternion=e.origQuaternion?e.origQuaternion.clone():null,this.mimicJoints=[...e.mimicJoints],this}setJointValue(...e){e=e.map(n=>n===null?null:parseFloat(n)),(!this.origPosition||!this.origQuaternion)&&(this.origPosition=this.position.clone(),this.origQuaternion=this.quaternion.clone());let t=!1;switch(this.mimicJoints.forEach(n=>{t=n.updateFromMimickedJoint(...e)||t}),this.jointType){case"fixed":return t;case"continuous":case"revolute":{let n=e[0];return n==null||n===this.jointValue[0]?t:(!this.ignoreLimits&&this.jointType==="revolute"&&(n=Math.min(this.limit.upper,n),n=Math.max(this.limit.lower,n)),this.quaternion.setFromAxisAngle(this.axis,n).premultiply(this.origQuaternion),this.jointValue[0]!==n?(this.jointValue[0]=n,this.matrixWorldNeedsUpdate=!0,!0):t)}case"prismatic":{let n=e[0];return n==null||n===this.jointValue[0]?t:(this.ignoreLimits||(n=Math.min(this.limit.upper,n),n=Math.max(this.limit.lower,n)),this.position.copy(this.origPosition),yh.copy(this.axis).applyEuler(this.rotation),this.position.addScaledVector(yh,n),this.jointValue[0]!==n?(this.jointValue[0]=n,this.matrixWorldNeedsUpdate=!0,!0):t)}case"floating":return this.jointValue.every((n,s)=>e[s]===n||e[s]===null)?t:(this.jointValue[0]=e[0]!==null?e[0]:this.jointValue[0],this.jointValue[1]=e[1]!==null?e[1]:this.jointValue[1],this.jointValue[2]=e[2]!==null?e[2]:this.jointValue[2],this.jointValue[3]=e[3]!==null?e[3]:this.jointValue[3],this.jointValue[4]=e[4]!==null?e[4]:this.jointValue[4],this.jointValue[5]=e[5]!==null?e[5]:this.jointValue[5],wi.compose(this.origPosition,this.origQuaternion,Ha),Ga.setFromEuler(wy.set(this.jointValue[3],this.jointValue[4],this.jointValue[5],"XYZ")),Wa.set(this.jointValue[0],this.jointValue[1],this.jointValue[2]),Va.compose(Wa,Ga,Ha),wi.premultiply(Va),this.position.setFromMatrixPosition(wi),this.rotation.setFromRotationMatrix(wi),this.matrixWorldNeedsUpdate=!0,!0);case"planar":return this.jointValue.every((n,s)=>e[s]===n||e[s]===null)?t:(this.jointValue[0]=e[0]!==null?e[0]:this.jointValue[0],this.jointValue[1]=e[1]!==null?e[1]:this.jointValue[1],this.jointValue[2]=e[2]!==null?e[2]:this.jointValue[2],wi.compose(this.origPosition,this.origQuaternion,Ha),Ga.setFromAxisAngle(this.axis,this.jointValue[2]),Wa.set(this.jointValue[0],this.jointValue[1],0),Va.compose(Wa,Ga,Ha),wi.premultiply(Va),this.position.setFromMatrixPosition(wi),this.rotation.setFromRotationMatrix(wi),this.matrixWorldNeedsUpdate=!0,!0)}return t}}class Mh extends Xf{constructor(...e){super(...e),this.type="URDFMimicJoint",this.mimicJoint=null,this.offset=0,this.multiplier=1}updateFromMimickedJoint(...e){const t=e.map(n=>n===null?null:n*this.multiplier+this.offset);return super.setJointValue(...t)}copy(e,t){return super.copy(e,t),this.mimicJoint=e.mimicJoint,this.offset=e.offset,this.multiplier=e.multiplier,this}}class Py extends Wf{constructor(...e){super(...e),this.isURDFRobot=!0,this.urdfNode=null,this.urdfRobotNode=null,this.robotName=null,this.links=null,this.joints=null,this.colliders=null,this.visual=null,this.frames=null}copy(e,t){super.copy(e,t),this.urdfRobotNode=e.urdfRobotNode,this.robotName=e.robotName,this.links={},this.joints={},this.colliders={},this.visual={},this.traverse(n=>{n.isURDFJoint&&n.urdfName in e.joints&&(this.joints[n.urdfName]=n),n.isURDFLink&&n.urdfName in e.links&&(this.links[n.urdfName]=n),n.isURDFCollider&&n.urdfName in e.colliders&&(this.colliders[n.urdfName]=n),n.isURDFVisual&&n.urdfName in e.visual&&(this.visual[n.urdfName]=n)});for(const n in this.joints)this.joints[n].mimicJoints=this.joints[n].mimicJoints.map(s=>this.joints[s.name]);return this.frames={...this.colliders,...this.visual,...this.links,...this.joints},this}getFrame(e){return this.frames[e]}setJointValue(e,...t){const n=this.joints[e];return n?n.setJointValue(...t):!1}setJointValues(e){let t=!1;for(const n in e){const s=e[n];Array.isArray(s)?t=this.setJointValue(n,...s)||t:t=this.setJointValue(n,s)||t}return t}}const Pl=new Ot,Sh=new Mn;function Ri(i){return i?i.trim().split(/\s+/g).map(e=>parseFloat(e)):[0,0,0]}function Eh(i,e,t=!1){t||i.rotation.set(0,0,0),Sh.set(e[0],e[1],e[2],"ZYX"),Pl.setFromEuler(Sh),Pl.multiply(i.quaternion),i.quaternion.copy(Pl)}class Ly{constructor(e){this.manager=e||Pf,this.loadMeshCb=this.defaultMeshLoader.bind(this),this.parseVisual=!0,this.parseCollision=!1,this.packages="",this.workingPath="",this.fetchOptions={}}loadAsync(e){return new Promise((t,n)=>{this.load(e,t,null,n)})}load(e,t,n,s){const r=this.manager,a=Df.extractUrlBase(e),o=this.manager.resolveURL(e);r.itemStart(o),fetch(o,this.fetchOptions).then(l=>{if(l.ok)return n&&n(null),l.text();throw new Error(`URDFLoader: Failed to load url '${o}' with error code ${l.status} : ${l.statusText}.`)}).then(l=>{const c=this.parse(l,this.workingPath||a);t(c),r.itemEnd(o)}).catch(l=>{s?s(l):console.error("URDFLoader: Error loading file.",l),r.itemError(o),r.itemEnd(o)})}parse(e,t=this.workingPath){const n=this.packages,s=this.loadMeshCb,r=this.parseVisual,a=this.parseCollision,o=this.manager,l={},c={},u={};function h(E){if(!/^package:\/\//.test(E))return t?t+E:E;const[A,b]=E.replace(/^package:\/\//,"").split(/\/(.+)/);if(typeof n=="string")return n.endsWith(A)?n+"/"+b:n+"/"+A+"/"+b;if(typeof n=="function")return n(A)+"/"+b;if(typeof n=="object")return A in n?n[A]+"/"+b:(console.error(`URDFLoader : ${A} not found in provided package list.`),null)}function d(E){let A;E instanceof Document?A=[...E.children]:E instanceof Element?A=[E]:A=[...new DOMParser().parseFromString(E,"text/xml").children];const b=A.filter(T=>T.nodeName==="robot").pop();return f(b)}function f(E){const A=[...E.children],b=A.filter(R=>R.nodeName.toLowerCase()==="link"),T=A.filter(R=>R.nodeName.toLowerCase()==="joint"),y=A.filter(R=>R.nodeName.toLowerCase()==="material"),w=new Py;w.robotName=E.getAttribute("name"),w.urdfRobotNode=E,y.forEach(R=>{const L=R.getAttribute("name");u[L]=m(R)});const _={},M={};b.forEach(R=>{const L=R.getAttribute("name"),z=E.querySelector(`child[link="${L}"]`)===null;l[L]=x(R,_,M,z?w:null)}),T.forEach(R=>{const L=R.getAttribute("name");c[L]=g(R)}),w.joints=c,w.links=l,w.colliders=M,w.visual=_;const P=Object.values(c);return P.forEach(R=>{R instanceof Mh&&c[R.mimicJoint].mimicJoints.push(R)}),P.forEach(R=>{const L=new Set,z=X=>{if(L.has(X))throw new Error("URDFLoader: Detected an infinite loop of mimic joints.");L.add(X),X.mimicJoints.forEach(O=>{z(O)})};z(R)}),w.frames={...M,..._,...l,...c},w}function g(E){const A=[...E.children],b=E.getAttribute("type");let T;const y=A.find(L=>L.nodeName.toLowerCase()==="mimic");y?(T=new Mh,T.mimicJoint=y.getAttribute("joint"),T.multiplier=parseFloat(y.getAttribute("multiplier")||1),T.offset=parseFloat(y.getAttribute("offset")||0)):T=new Xf,T.urdfNode=E,T.name=E.getAttribute("name"),T.urdfName=T.name,T.jointType=b;let w=null,_=null,M=[0,0,0],P=[0,0,0];A.forEach(L=>{const z=L.nodeName.toLowerCase();z==="origin"?(M=Ri(L.getAttribute("xyz")),P=Ri(L.getAttribute("rpy"))):z==="child"?_=l[L.getAttribute("link")]:z==="parent"?w=l[L.getAttribute("link")]:z==="limit"&&(T.limit.lower=parseFloat(L.getAttribute("lower")||T.limit.lower),T.limit.upper=parseFloat(L.getAttribute("upper")||T.limit.upper),T.limit.effort=parseFloat(L.getAttribute("effort")||T.limit.effort),T.limit.velocity=parseFloat(L.getAttribute("velocity")||T.limit.velocity))}),w.add(T),T.add(_),Eh(T,P),T.position.set(M[0],M[1],M[2]);const R=A.filter(L=>L.nodeName.toLowerCase()==="axis")[0];if(R){const L=R.getAttribute("xyz").split(/\s+/g).map(z=>parseFloat(z));T.axis=new I(L[0],L[1],L[2]),T.axis.normalize()}return T}function x(E,A,b,T=null){T===null&&(T=new Wf);const y=[...E.children];T.name=E.getAttribute("name"),T.urdfName=T.name,T.urdfNode=E;const w=y.find(_=>_.nodeName.toLowerCase()==="inertial");return w&&[...w.children].forEach(_=>{const M=_.nodeName.toLowerCase();M==="origin"?(T.inertial.origin.xyz=Ri(_.getAttribute("xyz")),T.inertial.origin.rpy=Ri(_.getAttribute("rpy"))):M==="mass"?T.inertial.mass=parseFloat(_.getAttribute("value"))||0:M==="inertia"&&(T.inertial.inertia.ixx=parseFloat(_.getAttribute("ixx"))||0,T.inertial.inertia.ixy=parseFloat(_.getAttribute("ixy"))||0,T.inertial.inertia.ixz=parseFloat(_.getAttribute("ixz"))||0,T.inertial.inertia.iyy=parseFloat(_.getAttribute("iyy"))||0,T.inertial.inertia.iyz=parseFloat(_.getAttribute("iyz"))||0,T.inertial.inertia.izz=parseFloat(_.getAttribute("izz"))||0)}),r&&y.filter(M=>M.nodeName.toLowerCase()==="visual").forEach(M=>{const P=p(M,u);if(T.add(P),M.hasAttribute("name")){const R=M.getAttribute("name");P.name=R,P.urdfName=R,A[R]=P}}),a&&y.filter(M=>M.nodeName.toLowerCase()==="collision").forEach(M=>{const P=p(M);if(T.add(P),M.hasAttribute("name")){const R=M.getAttribute("name");P.name=R,P.urdfName=R,b[R]=P}}),T}function m(E){const A=[...E.children],b=new wr;return b.name=E.getAttribute("name")||"",A.forEach(T=>{const y=T.nodeName.toLowerCase();if(y==="color"){const w=T.getAttribute("rgba").split(/\s/g).map(_=>parseFloat(_));b.color.setRGB(w[0],w[1],w[2]),b.opacity=w[3],b.transparent=w[3]<1,b.depthWrite=!b.transparent}else if(y==="texture"){const w=T.getAttribute("filename");if(w){const _=new Lf(o),M=h(w);b.map=_.load(M),b.map.colorSpace=dt}}}),b}function p(E,A={}){const b=E.nodeName.toLowerCase()==="collision",T=[...E.children];let y=null;const w=T.filter(M=>M.nodeName.toLowerCase()==="material")[0];if(w){const M=w.getAttribute("name");M&&M in A?y=A[M]:y=m(w)}else y=new wr;const _=b?new Ry:new Cy;return _.urdfNode=E,T.forEach(M=>{const P=M.nodeName.toLowerCase();if(P==="geometry"){const R=M.children[0].nodeName.toLowerCase();if(R==="mesh"){const L=M.children[0].getAttribute("filename"),z=h(L);if(z!==null){const X=M.children[0].getAttribute("scale");if(X){const O=Ri(X);_.scale.set(O[0],O[1],O[2])}s(z,o,y,(O,N)=>{N?console.error("URDFLoader: Error loading mesh.",N):O&&(O.position.set(0,0,0),O.quaternion.identity(),_.add(O))})}}else if(R==="box"){const L=new gt;L.geometry=new Ts(1,1,1),L.material=y;const z=Ri(M.children[0].getAttribute("size"));L.scale.set(z[0],z[1],z[2]),_.add(L)}else if(R==="sphere"){const L=new gt;L.geometry=new rd(1,30,30),L.material=y;const z=parseFloat(M.children[0].getAttribute("radius"))||0;L.scale.set(z,z,z),_.add(L)}else if(R==="cylinder"){const L=new gt;L.geometry=new sd(1,1,1,30),L.material=y;const z=parseFloat(M.children[0].getAttribute("radius"))||0,X=parseFloat(M.children[0].getAttribute("length"))||0;L.scale.set(z,X,z),L.rotation.set(Math.PI/2,0,0),_.add(L)}}else if(P==="origin"){const R=Ri(M.getAttribute("xyz")),L=Ri(M.getAttribute("rpy"));_.position.set(R[0],R[1],R[2]),_.rotation.set(0,0,0),Eh(_,L)}}),_}return d(e)}defaultMeshLoader(e,t,n,s){/\.stl$/i.test(e)?new My(t).load(e,a=>{const o=new gt(a,n||new wr);s(o)},null,a=>s(null,a)):/\.dae$/i.test(e)?new Ay(t).load(e,a=>s(a.scene),null,a=>s(null,a)):console.warn(`URDFLoader: Could not load model at ${e}.
No loader available`)}}const qf=["#e5484d","#30a46c","#3e63dd"],yr=1e4,Ll=600;function Th(i){return Array.isArray(i)&&i.length===3&&i.every(Number.isFinite)?i:null}function Ny(i){const t=10**Math.floor(Math.log10(i));for(const n of[1,2,2.5,5,10])if(i<=n*t+1e-12)return n*t;return 10*t}function Iy(i){return i===0?"0":String(Number(i.toPrecision(3)))}class Dy{constructor(e,t){this.canvas=e,this.minScale=t,this.samples=[],this.shrinkSince=0,this.context=e.getContext("2d"),this.scale=t}push(e,t,n){var a;const s={t:e,measured:Th(t),command:Th(n)};this.samples.push(s),this.canvas.dataset.lastCommand=JSON.stringify(((a=s.command)==null?void 0:a.map(o=>Number(o.toFixed(4))))??null);const r=e-yr-Ll;for(;this.samples.length&&this.samples[0].t<r;)this.samples.shift()}draw(e){const t=this.context,{clientWidth:n,clientHeight:s}=this.canvas;if(!t||!n||!s)return;const r=Math.min(window.devicePixelRatio||1,2);(this.canvas.width!==Math.round(n*r)||this.canvas.height!==Math.round(s*r))&&(this.canvas.width=Math.round(n*r),this.canvas.height=Math.round(s*r)),t.setTransform(r,0,0,r,0,0),t.clearRect(0,0,n,s);const a=e-yr,o=this.samples.filter(y=>y.t>=a-Ll);let l=0;for(const y of o)for(const w of[y.measured,y.command])if(w)for(const _ of w)l=Math.max(l,Math.abs(_));const c=Ny(Math.max(l*1.1,this.minScale));c>this.scale?(this.scale=c,this.shrinkSince=0):c<this.scale?(this.shrinkSince||(this.shrinkSince=e),e-this.shrinkSince>1e3&&(this.scale=c,this.shrinkSince=0)):this.shrinkSince=0,this.canvas.dataset.yMax=String(this.scale),this.canvas.dataset.samples=String(o.length);const u=38,h=8,d=8,f=18,g=n-u-h,x=s-d-f,m=y=>u+(y-a)/yr*g,p=y=>d+x/2-y/this.scale*(x/2),E=getComputedStyle(this.canvas),A=E.getPropertyValue("--trace-grid").trim()||"#e3e9f0",b=E.getPropertyValue("--trace-axis").trim()||"#9fb0c4",T=E.getPropertyValue("--trace-label").trim()||"#7c8a9c";t.font="9px Inter, ui-sans-serif, system-ui, sans-serif",t.lineWidth=1,t.textAlign="right",t.textBaseline="middle";for(const y of[1,.5,0,-.5,-1]){const w=this.scale*y,_=Math.round(d+x/2-y*(x/2))+.5;t.strokeStyle=y===0?b:A,t.beginPath(),t.moveTo(u,_),t.lineTo(u+g,_),t.stroke(),t.fillStyle=T,t.fillText(Iy(w),u-5,_)}t.textAlign="center",t.textBaseline="top";for(let y=-10;y<=0;y+=2){const w=Math.round(u+(y*1e3+yr)/yr*g)+.5;t.strokeStyle=A,t.beginPath(),t.moveTo(w,d),t.lineTo(w,d+x),t.stroke(),t.fillStyle=T,t.fillText(y===0?"0 s":`${y}`,w,d+x+4)}t.save(),t.beginPath(),t.rect(u,d,g,x),t.clip();for(const y of["command","measured"]){t.setLineDash(y==="command"?[5,4]:[]),t.lineWidth=y==="command"?1.4:1.8,t.globalAlpha=y==="command"?.85:1;for(let w=0;w<3;w+=1){t.strokeStyle=qf[w],t.beginPath();let _;for(const M of o){const P=M[y];if(!P){_=void 0;continue}const R=m(M.t),L=p(P[w]);_&&_[y]&&M.t-_.t<=Ll?t.lineTo(R,L):t.moveTo(R,L),_=M}t.stroke()}}t.restore(),t.setLineDash([]),t.globalAlpha=1}}function Uy(i){var n;const e=new Map;let t;for(const s of i){const r={...s,children:[]};e.set(s.path,r);const a=s.path.lastIndexOf("/");a<0?t??(t=r):(n=e.get(s.path.slice(0,a)))==null||n.children.push(r)}return t}function Fy(i){const e=[i];for(;e.length;){const t=e.pop();if(t.kind==="Control"&&/Fallback$/.test(t.registration_name)&&t.children.length>1&&t.children.every(n=>{var s;return((s=n.children[0])==null?void 0:s.registration_name)==="InputModeGuard"}))return t;e.push(...t.children)}}function Oy(i,e){return i.children.find(t=>e&&t.name===`${e}_branch`)??i.children.find(t=>{var n;return((n=t.children[0])==null?void 0:n.status)==="SUCCESS"&&t.status!=="IDLE"})??i.children.find(t=>t.status==="RUNNING")}function ky(i,e){const t=[];let n=i;for(;n&&n.path!==e;)t.push(n),n=n.children.find(s=>e===s.path||e.startsWith(`${s.path}/`));return t}const By={Control:"◆",Decorator:"◇",Action:"▶",Condition:"?",SubTree:"▣"};function us(i){return i.replace(/[&<>"']/g,e=>`&#${e.charCodeAt(0)};`)}function $f(i){return`<span class="bt-status bt-${i.toLowerCase()}">${us(i)}</span>`}function Yf(i){const e=i.name&&i.name!==i.registration_name;return`<span class="bt-name">${us(e?i.name:i.registration_name)}</span>${e?`<span class="bt-type">${us(i.registration_name)}</span>`:""}`}function Uc(i,e,t=new Set){const n=i.children.length>0,s=t.has(i.path),r=n&&(e.get(i.path)??(i.status==="IDLE"||s));return`<li class="bt-node bt-kind-${i.kind.toLowerCase()}${s?" bt-muted":""}" data-path="${us(i.path)}" data-status="${i.status}">
    <div class="bt-row">${n?`<button type="button" class="bt-caret" data-bt-toggle="${us(i.path)}" aria-expanded="${!r}" aria-label="${r?"展开":"折叠"}">${r?"▸":"▾"}</button>`:'<span class="bt-caret-spacer"></span>'}<span class="bt-icon" title="${us(i.kind)}">${By[i.kind]??"•"}</span>${Yf(i)}${$f(i.status)}</div>
    ${i.failure_reason?`<div class="bt-reason">${us(i.failure_reason)}</div>`:""}
    ${n&&!r?`<ul class="bt-children">${i.children.map(a=>Uc(a,e,t)).join("")}</ul>`:""}
  </li>`}function zy(i){return i.map(e=>`<span class="bt-crumb">${Yf(e)}${$f(e.status)}</span>`).join('<span class="bt-crumb-sep">›</span>')}const Vy=document.querySelector("#app");Vy.innerHTML=`
  <header class="topbar">
    <div class="brand"><span class="brand-mark">RM</span><div><strong>RealMan Web Control</strong><small>ROS 2 action console</small></div></div>
    <label class="arm-picker">ARM <select id="arm-select"><option value="l">LEFT / 123</option><option value="m">MIDDLE / 125</option><option value="r">RIGHT / 124</option></select></label>
    <span id="connection" class="status-pill offline">OFFLINE</span>
    <span id="mode" class="status-pill ready">CONTROL READY</span>
    <span id="auth-button" class="status-pill ready">CONTROL OPEN</span>
    <a href="/calibration.html" class="button ghost">相机标定</a>
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
      <section id="velocity-telemetry-panel" class="panel panel-section"><div class="panel-heading compact"><div><span class="eyebrow">VELOCITY TELEMETRY</span><h2>命令与实际末端速度</h2></div><span class="mini-state">L + R</span></div><div class="telemetry-legend" id="velocity-telemetry-legend">${["X","Y","Z"].map((i,e)=>`<span class="legend-axis"><i style="background: ${qf[e]}"></i>${i}</span>`).join("")}<span class="legend-line solid"><i></i>实际</span><span class="legend-line dashed"><i></i>命令（限速后）</span><span class="legend-hint">最近 10 s · 纵轴按数据自动缩放</span></div><div id="velocity-telemetry-grid" class="velocity-telemetry-grid"></div></section>
    </div>
    <aside class="controls">
      <section id="input-mode-card" class="panel panel-section input-mode-card" hidden>
        <div class="panel-heading compact"><div><span class="eyebrow">GLOBAL INPUT</span><h2>输入模式</h2></div><span id="input-mode-active" class="mini-state">WAIT</span></div>
        <div class="input-mode-body"><label>当前选择<select id="input-mode-select" aria-label="输入模式"></select></label><div id="input-mode-detail" class="input-mode-detail" aria-live="polite">等待输入模式状态</div></div>
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
`;const J=i=>document.querySelector(i),Gy={l:2988957,m:13924166,r:8688794},Gi=J("#arm-select"),Ah=J("#connection"),wh=J("#mode"),Kf=J("#stop-button"),Zf=J("#cancel-motion"),Jf=J("#recover-motion"),dd=J("#execute-motion"),jf=J("#start-velocity"),Qf=J("#cancel-velocity"),Xa=J("#action-state"),Hy=J("#velocity-state"),Rh=J("#coordinate-state"),Ch=J("#coordinate-summary"),ii=J("#feedback"),Pi=J("#result"),Nl=J("#progress"),ls=J("#viewer-state"),hs=J("#canvas"),ln=J("#viewer"),Il=J("#fleet-strip"),go=J("#selected-arm-label"),Wy=J("#input-mode-card"),Fi=J("#input-mode-select"),Ph=J("#input-mode-active"),Xy=J("#input-mode-detail"),Lh=J("#keyboard-control-card"),Nh=J("#keyboard-control-state"),qy=J("#keyboard-frame-legend"),Fc=J("#control-tab-keyboard"),ep="realman-web-control.tab";let $r="motion";try{const i=window.localStorage.getItem(ep);(i==="motion"||i==="velocity"||i==="gripper"||i==="keyboard")&&($r=i)}catch{}function tp(i,e=!0){if($r=i,e)try{window.localStorage.setItem(ep,i)}catch{}ud()}function ud(){const i=document.querySelector(`[data-control-tab="${$r}"]`),e=i!=null&&i.hidden?"motion":$r;document.querySelectorAll("[data-control-tab]").forEach(t=>{const n=t.dataset.controlTab===e;t.classList.toggle("selected",n),t.setAttribute("aria-selected",String(n)),t.tabIndex=n?0:-1}),document.querySelectorAll("[data-control-panel]").forEach(t=>{t.hidden=t.dataset.controlPanel!==e})}J("#control-tabs").addEventListener("click",i=>{const e=i.target.closest("[data-control-tab]");if(!e||e.hidden)return;const t=e.dataset.controlTab==="motion"&&$r!=="motion";tp(e.dataset.controlTab),t&&Nd()});ud();const Dl=J("#velocity-telemetry-grid"),np=J("#motion-mode"),$y=J("#joint-target"),Yy=J("#pose-target"),Cr=J("#pose-reference-frame"),no=J("#pose-sliders"),Ky=J("#pose-kinematics-actions"),ip=J("#fill-current-pose"),hd=J("#solve-ik"),fd=J("#kinematics-status"),sp=J("#reset-preview"),_o=J("#motion-reference"),vo=J("#motion-velocity"),xo=J("#motion-timeout"),rp=J("#copy-current-joints"),bo=J("#joint-copy-status"),zo=J("#record-name"),ap=J("#save-record"),xn=J("#record-select"),op=J("#apply-record"),pd=J("#delete-record"),lp=J("#record-status"),Zy=["pose-x","pose-y","pose-z","pose-qw","pose-qx","pose-qy","pose-qz"],md={0:"MOVEJ",1:"MOVEL",2:"MOVEP"},Jy={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};let ke,ne="l",mt=0,kt=[],Vo=[],Ft;const As={},Yr={},Li={};let hn="",ia=!1,io=!1,zt,Ze,Ys="",Cn="",oi,Hi="",wt="",wn=0,Gn="",li=0;const Zn={l:new Set,r:new Set},jy={l:0,r:0};let Pr=0,ci=!1,Ih,qa=0;const ws={},gd={},ys={},Oi={},Ul={},qi={},Kr={},$i={},ps={},Oc={},Zr={},_d={},cp={},ki={},ms={},yo={},Bi={},vd={},gs={},Lr={},Ii={},Ln={},Dh={};let kn,gn,tn,si,Fl=null,Uh=0;function Mo(){if(!ke)throw new Error("manifest not loaded");return ke.robots.find(i=>i.id===ne)}function Go(i){if(!ke)throw new Error("manifest not loaded");return ke.robots.find(e=>e.id===i)}function Sn(i){return`${i}-${Date.now()}-${Math.random().toString(16).slice(2,8)}`}function Dt(){return!io&&(Ft==null?void 0:Ft.readyState)===WebSocket.OPEN}function $a(i){var e;return((e=zt==null?void 0:zt.find(t=>t.id===i))==null?void 0:e.label)??i}function xd(){return!!(zt!=null&&zt.some(i=>i.id==="keyboard"&&i.selectable))}function bd(){return ci&&xd()&&(Ze==null?void 0:Ze.phase)==="ACTIVE"&&Ze.active_mode==="keyboard"}function dp(){return xd()&&(Ze==null?void 0:Ze.phase)==="ACTIVE"&&Ze.active_mode==="keyboard"}function Jr(i){var n,s,r;const e=(n=ke==null?void 0:ke.keyboard_control)==null?void 0:n.arms[i],t=ws[i];return!!(e&&(t==null?void 0:t.motion_allowed)===!0&&t.work_matched===!0&&t.current_work===e.work_reference_name&&t.expected_work===e.work_reference_name&&((s=t.work)==null?void 0:s.name)===e.work_reference_name&&((r=t.work)==null?void 0:r.frame_id)===e.work_frame_id)}function So(i){const e=As[i==="l"?"gripper_left":"gripper_right"];return(e==null?void 0:e.connected)===!0&&e.alarm===0}function up(i){var t,n;const e=((n=(t=ke==null?void 0:ke.keyboard_control)==null?void 0:t.arms[i])==null?void 0:n.bindings)??{};return new Set(Object.values(e).flatMap(s=>[s.positive,s.negative]))}function hp(i){var e,t;return new Set(Object.values(((t=(e=ke==null?void 0:ke.keyboard_control)==null?void 0:e.grippers)==null?void 0:t[i])??{}))}function fp(i,e){return bd()&&Dt()&&!document.hidden&&(hp(i).has(e)?So(i):Jr(i))}function pp(i){for(const e of["l","r"])if(up(e).has(i)||hp(e).has(i))return e}function mp(i){Yt({type:"keyboard_state",arm:i,keys:[...Zn[i]].sort(),sequence:++jy[i]})}function jr(){for(const i of["l","r"])mp(i)}function Qy(){Pr&&window.clearInterval(Pr),Pr=0}function Wi(){const i=ci&&(Ft==null?void 0:Ft.readyState)===WebSocket.OPEN;Zn.l.clear(),Zn.r.clear(),Qy(),i&&jr(),sa()}function Qr(){if(!bd()||!Dt()){Wi();return}for(const i of["l","r"]){let e=!1;for(const t of Zn[i])fp(i,t)||(Zn[i].delete(t),e=!0);e&&mp(i)}Pr||(jr(),Pr=window.setInterval(jr,ke.keyboard_control.heartbeat_period_ms)),sa()}function Fh(i){var l,c,u;const e=J(i==="l"?"#keyboard-left":"#keyboard-right"),t=(l=ke==null?void 0:ke.keyboard_control)==null?void 0:l.arms[i];if(!t){e.replaceChildren();return}const n={vx:"X",vy:"Y",vz:"Z",wx:"RX",wy:"RY",wz:"RZ"},s=h=>qt(h.replace(/^(Key|Digit)/,"")),r=(u=(c=ke==null?void 0:ke.keyboard_control)==null?void 0:c.grippers)==null?void 0:u[i],a=As[i==="l"?"gripper_left":"gripper_right"],o=(a==null?void 0:a.connected)!==!0?"OFFLINE":a.alarm!==0?"ALARM":"READY";e.innerHTML=`<div class="keyboard-arm-heading"><strong>${i==="l"?"LEFT / L":"RIGHT / R"}</strong><span>${qt(t.work_frame_id)}</span></div><div class="keyboard-bindings ${Jr(i)?"":"unavailable"}">${Object.entries(t.bindings).map(([h,d])=>`
    <div class="keyboard-binding"><span>${n[h]??h}</span><kbd data-code="${qt(d.positive)}">${s(d.positive)}</kbd><em>+</em><kbd data-code="${qt(d.negative)}">${s(d.negative)}</kbd><em>−</em></div>`).join("")}</div>
    ${r?`<div class="keyboard-gripper ${So(i)?"":"unavailable"}"><div class="keyboard-arm-heading"><strong>夹爪 / 单次目标</strong><span>${o}</span></div><div class="keyboard-binding gripper-binding"><kbd data-code="${qt(r.open)}">${s(r.open)}</kbd><span>全开</span><kbd data-code="${qt(r.close)}">${s(r.close)}</kbd><span>全闭</span></div></div>`:""}`,e.querySelectorAll("kbd[data-code]").forEach(h=>h.classList.toggle("pressed",Zn[i].has(h.dataset.code??"")))}function sa(){const i=xd()&&!!(ke!=null&&ke.keyboard_control);if(Fc.hidden!==!i&&(Fc.hidden=!i,ud()),!i)return;Fh("l"),Fh("r");const e=["l","r"].some(r=>[...Zn[r]].some(a=>up(r).has(a))),t=Jr("l")||Jr("r"),n=So("l")||So("r"),s=dp()?ci?t?e?"MOVING":"READY":n?"GRIPPER ONLY":"WORK UNAVAILABLE":"REMOTE":"RELEASED";Nh.textContent=s,Nh.className=`mini-state keyboard-${s.toLowerCase().replaceAll(" ","-")}`}function eM(i){var s,r,a;const e=(s=ws[i])==null?void 0:s.work,t=(r=e==null?void 0:e.xyz_m)==null?void 0:r.map(Number),n=(a=e==null?void 0:e.quaternion_wxyz)==null?void 0:a.map(Number);if(!(!Jr(i)||(t==null?void 0:t.length)!==3||(n==null?void 0:n.length)!==4||![...t,...n].every(Number.isFinite)||Math.hypot(...n)<1e-9))return{position:t,quaternion:n}}function Eo(){const i=[];for(const e of["l","r"]){const t=Ln[e];let n=Dh[e];t!=null&&t.live&&(n==null?void 0:n.parent)!==t.live&&(n==null||n.removeFromParent(),n=new d_(.18),n.name=`${e}-keyboard-work-frame`,n.renderOrder=20,n.traverse(a=>{a.material&&(a.material.depthTest=!1,a.material.transparent=!0)}),t.live.add(n),Dh[e]=n);const s=eM(e),r=!!(n&&dp()&&s);n&&(n.visible=r,s&&(n.position.fromArray(s.position),n.quaternion.set(s.quaternion[1],s.quaternion[2],s.quaternion[3],s.quaternion[0]).normalize(),n.updateMatrixWorld(!0))),r&&i.push(e)}ln.dataset.keyboardWorkFrames=i.join(","),qy.hidden=i.length===0}function tM(){!bd()||(Ze==null?void 0:Ze.epoch)===Ih||Fc.hidden||(Ih=Ze.epoch,tp("keyboard",!1),Lh.classList.add("keyboard-guide-active"),qa&&window.clearTimeout(qa),qa=window.setTimeout(()=>{Lh.classList.remove("keyboard-guide-active"),qa=0},1800))}function gp(){Fi.disabled=!Dt()||!!Cn||(Ze==null?void 0:Ze.phase)==="SWITCHING"||!(zt!=null&&zt.some(i=>i.id!=="web"&&i.selectable))}function rs(){if(Wy.hidden=!zt,!zt){Qr(),Eo();return}const e=(Ze==null?void 0:Ze.phase)==="ACTIVE"&&Ze.active_mode==="keyboard"&&!ci&&!Hi?"":Hi||(Ze==null?void 0:Ze.selected_mode);Fi.replaceChildren(...zt.filter(s=>s.id!=="web").map(s=>{const r=document.createElement("option");return r.value=s.id,r.textContent=s.label,r.disabled=!s.selectable,r})),e&&Array.from(Fi.options).some(s=>s.value===e)?Fi.value=e:Fi.selectedIndex=-1;const t=Ze;Ph.textContent=t?`${$a(t.active_mode)} / ${t.phase}`:"WAIT",Ph.className=`mini-state ${(t==null?void 0:t.phase.toLowerCase())??""}`;const n=t?t.phase==="ACTIVE"?`行为树已切换到 ${$a(t.active_mode)}（epoch ${t.epoch}）`:t.phase==="SWITCHING"?`正在切换到 ${$a(t.requested_mode)}…`:t.phase==="FAILED"?`切换到 ${$a(t.requested_mode)} 失败`:t.phase:"等待输入模式状态";Xy.textContent=(t==null?void 0:t.detail)||Ys||n,gp(),Qr(),tM(),Eo()}function Oh(){!Cn||oi===void 0||!Ze||Ze.request_id!==oi||!["ACTIVE","FAILED"].includes(Ze.phase)||(Fi.blur(),Cn="",oi=void 0,Hi="")}function Xi(i,e=2){return Number.isFinite(i)?i.toFixed(e):""}function Wn(i,e=2){const t=Number(i);return Number.isFinite(t)?t.toFixed(e):String(i??"")}function nM(i){return`[${i.map(e=>(e*180/Math.PI).toFixed(3)).join(", ")}]`}async function iM(i){var n;if((n=navigator.clipboard)!=null&&n.writeText){await navigator.clipboard.writeText(i);return}const e=document.createElement("textarea");e.value=i,e.setAttribute("readonly",""),e.style.position="fixed",e.style.opacity="0",document.body.append(e),e.select();const t=document.execCommand("copy");if(e.remove(),!t)throw new Error("clipboard copy failed")}function bn(i){return i?`${i.type===1?"WORK":i.type===2?"TOOL":i.type===3?"TF":"BASE"} / ${i.name}`:"BASE / base"}function qt(i){return i.replace(/[&<>"']/g,e=>Jy[e]??e)}function Ho(){return ws[ne]}function To(){return Ln[ne]}function ra(i){const e=Go(i);return ys[i]??e.joints.map(()=>ke.default_joint_position_rad)}function yd(i){return qi[i]??ra(i)}function _p(i=mt){return i===1?"位姿已修改：影子等待“计算逆解”成功后更新":i===2?"MOVEP 位姿目标已修改：MOVEP 不提供逆解/影子预览，影子不会跟随滑轨；可直接发送 MOVEP":"位姿已修改"}function sM(){var i;Vo=[...ra(ne)],kt=[...yd(ne)],Wo(kt,!0),Tp(),(i=To())!=null&&i.shadow&&Ss(To().shadow,kt),go.textContent=ne.toUpperCase(),go.className="mini-state active-arm",Md(),fd.textContent=_d[ne]??"MOVEL 逆解仅更新影子预览",Rd(),Ks(),bo.textContent=Oi[ne]===void 0?"等待有效 joint_states":"可复制当前关节角",Ad(),je()}function Md(){var e,t,n,s,r;const i=Ho();if(_o.textContent=bn(i==null?void 0:i.preferred_reference),Rh.textContent=i?i.motion_allowed?"READY":"BLOCKED":"WAIT",Rh.className=i?`mini-state ${i.motion_allowed?"accepted":"stopping"}`:"mini-state",!i){Ch.innerHTML='<div class="coordinate-empty">等待坐标状态</div>';return}Ch.innerHTML=`
    <div class="coordinate-row"><span>MOVE</span><strong>${bn(i.preferred_reference)}</strong></div>
    <div class="coordinate-row"><span>TOOL</span><strong>${bn(i.tool)}</strong></div>
    <div class="coordinate-meta">${((e=i.tool)==null?void 0:e.controller_name)??i.current_tool} ${((t=i.tool)==null?void 0:t.payload_kg)!=null?` / ${Xi(i.tool.payload_kg)} kg`:""}</div>
    <div class="coordinate-meta">${(n=i.tool)!=null&&n.xyz_m?`xyz ${i.tool.xyz_m.map(a=>Xi(a)).join(", ")}`:""}</div>
    <div class="coordinate-row"><span>WORK</span><strong>${bn(i.work)}</strong></div>
    <div class="coordinate-meta">${((s=i.work)==null?void 0:s.controller_name)??i.current_work}</div>
    <div class="coordinate-meta">${(r=i.work)!=null&&r.xyz_m?`xyz ${i.work.xyz_m.map(a=>Xi(a)).join(", ")}`:""}</div>
  `}function kh(i){return`${i.reference_type===1?"WORK":i.reference_type===2?"TOOL":"BASE"} / ${i.reference_name||"unknown"}`}function Bh(i,[e,t,n,s]){const[r,a,o]=i,l=2*(n*o-s*a),c=2*(s*r-t*o),u=2*(t*a-n*r);return[r+e*l+(n*u-s*c),a+e*c+(s*l-t*u),o+e*u+(t*c-n*l)]}function vp(i,e){var l,c;const t=e.limited_linear_velocity_mps,n=e.limited_angular_velocity_radps;if(e.reference_type===0)return{linear:t,angular:n};if(e.reference_type===2)return{reason:"TOOL 坐标系命令随末端旋转，未叠加命令"};const s=(l=ws[i])==null?void 0:l.work,r=(c=s==null?void 0:s.quaternion_wxyz)==null?void 0:c.map(Number);if(!s||s.name!==e.reference_name||(r==null?void 0:r.length)!==4||!r.every(Number.isFinite)||Math.hypot(...r)<1e-9)return{reason:`缺少 WORK / ${e.reference_name||"unknown"} 的姿态，未叠加命令`};const a=Math.hypot(...r),o=r.map(u=>u/a);return{linear:Bh(t,o),angular:Bh(n,o)}}const Ao={};function xp(){if(Dl.childElementCount)return;Dl.innerHTML=["l","r"].map(t=>`<article class="velocity-telemetry-arm" id="velocity-telemetry-${t}" data-arm="${t}">
      <div class="velocity-telemetry-heading"><strong>${t==="l"?"LEFT / L":"RIGHT / R"}</strong><span class="telemetry-pills"><span class="telemetry-status" data-field="session">WAIT</span><span class="telemetry-status" data-field="measured-status">WAIT</span></span></div>
      <div class="telemetry-frames"><span>实测 <strong data-field="measured-frame">${t}/base_link</strong></span><span>命令 <strong data-field="command-frame">--</strong></span></div>
      <div class="telemetry-note" data-field="overlay-note">等待 /${t}/cartesian_velocity/state</div>
      ${["linear","angular"].map(n=>`<figure class="velocity-trace" data-trace="${n}"><figcaption>${n==="linear"?"线速度":"角速度"}<span>${n==="linear"?"m/s":"rad/s"}</span></figcaption><canvas data-field="${n}-trace" aria-label="${t.toUpperCase()} ${n==="linear"?"线速度":"角速度"}：最近 10 秒命令（虚线）与实际（实线）"></canvas></figure>`).join("")}
    </article>`).join("");for(const t of["l","r"])for(const n of["linear","angular"]){const s=Dl.querySelector(`#velocity-telemetry-${t} [data-field="${n}-trace"]`);Ao[`${t}-${n}`]=new Dy(s,n==="linear"?.01:.02)}let i=0;const e=t=>{if(requestAnimationFrame(e),!(document.hidden||t-i<33)){i=t;for(const n of Object.values(Ao))n==null||n.draw(t)}};requestAnimationFrame(e)}function rM(i,e){var r,a;xp();const t=performance.now(),n=vp(i,e),s="linear"in n;(r=Ao[`${i}-linear`])==null||r.push(t,e.measured_valid?e.measured_linear_velocity_mps:null,s?n.linear:null),(a=Ao[`${i}-angular`])==null||a.push(t,e.measured_valid?e.measured_angular_velocity_radps:null,s?n.angular:null)}function bp(){xp();for(const i of["l","r"]){const e=cp[i];if(!e)continue;const t=J(`#velocity-telemetry-${i}`),n=l=>t.querySelector(`[data-field="${l}"]`),s=n("session");s.textContent=e.session_active?"ACTIVE":"IDLE",s.className=`telemetry-status ${e.session_active?"active":""}`;const r=n("measured-status");r.textContent=e.measured_valid?"VALID":"STALE / NO DATA",r.className=`telemetry-status ${e.measured_valid?"valid":"stale"}`,n("measured-frame").textContent=e.measured_frame_id||`${i}/base_link`,n("command-frame").textContent=e.command_frame_id||kh(e);const a=vp(i,e),o=n("overlay-note");o.textContent="reason"in a?a.reason:e.reference_type===0?"命令与实测同为 base 坐标系":`命令已从 ${kh(e)} 旋转到实测坐标系`,o.classList.toggle("warn","reason"in a)}}function Ks(){var e;if(!ke)return;const i=new Set(ke.robots.map(t=>t.id));for(const t of ke.robots){const n=t.id,s=n===ne,r=ws[n],a=gd[n],o=a===void 0?"WAIT":a?"ONLINE":"OFFLINE",l=r?r.motion_allowed?"READY":"BLOCKED":"WAIT",c=((e=ys[n])==null?void 0:e.length)||0;let u=Il.querySelector(`button[data-arm="${n}"]`);u||(u=document.createElement("button"),u.type="button",u.className="fleet-chip",u.dataset.arm=n,u.innerHTML=`
        <span class="fleet-chip-arm">${n.toUpperCase()}</span>
        <span class="fleet-chip-state"></span>
        <span class="fleet-chip-motion"></span>
        <span class="fleet-chip-meta"></span>
      `,u.addEventListener("click",h=>{const d=h.currentTarget;Gi.value=d.dataset.arm,Gi.dispatchEvent(new Event("change"))}),Il.append(u)),u.classList.toggle("selected",s),u.querySelector(".fleet-chip-state").textContent=o,u.querySelector(".fleet-chip-motion").textContent=l,u.querySelector(".fleet-chip-meta").textContent=c?`${c} joints`:t.model}Il.querySelectorAll("button[data-arm]").forEach(t=>{i.has(t.dataset.arm)||t.remove()})}function yp(){const i=Ho();return i!=null&&i.preferred_reference?i.preferred_reference:{type:0,name:"base",frame_id:`${ne}/base_link`}}function hi(i=ne){if(ps[i])return ps[i];const e=ws[i];return e!=null&&e.preferred_reference?e.preferred_reference:{type:0,name:"base",frame_id:`${i}/base_link`}}function aM(i){const e=Go(i).frames;return Object.values(e).map(t=>({type:t.type,name:t.name,frame_id:t.frame_id}))}function Mp(i){const e=aM(i),t=new Set(e.map(s=>s.frame_id)),n=(Oc[i]??[]).filter(s=>!t.has(s.frame_id));return[...e,...n]}function Sd(){const i=Mp(ne),e=hi(ne);Cr.innerHTML=i.map(n=>`<option value="${qt(n.frame_id??n.name)}">${qt(bn(n))}</option>`).join("");const t=e.frame_id??e.name;i.some(n=>(n.frame_id??n.name)===t)?Cr.value=t:i[0]&&(Cr.value=i[0].frame_id??i[0].name,ps[ne]=i[0])}function oM(){var n;const i=((n=$i[ne])==null?void 0:n.slice(0,3).map(Number))??[];if(i.length!==3||!i.every(Number.isFinite)){no.innerHTML="";return}const e=Zr[ne]??i;Zr[ne]=[...e];const t=["X","Y","Z"];no.innerHTML=t.map((s,r)=>{const a=e[r],o=a-.2,l=a+.2;return`<label>${s}<input data-pose-slider-index="${r}" type="range" min="${o.toFixed(2)}" max="${l.toFixed(2)}" step="0.001" value="${Xi(i[r])}" /></label>`}).join(""),no.querySelectorAll("input[data-pose-slider-index]").forEach(s=>{s.addEventListener("input",()=>{const r=Number(s.dataset.poseSliderIndex),a=Ms()[r];a.value=s.value,$i[ne]=Ms().map(o=>o.value),ms[ne]=!1,Vn(ne,_p()),fi(ne),je()})})}function lM(){no.querySelectorAll("input[data-pose-slider-index]").forEach(i=>{const e=Number(Ms()[Number(i.dataset.poseSliderIndex)].value);Number.isFinite(e)&&(i.value=String(e))})}function Ms(){return Zy.map(i=>J(`#${i}`))}function so(){const i=$i[ne]??["","","","1","0","0","0"];Ms().forEach((e,t)=>{const n=i[t]??"";e.value=n===""?"":Wn(n)}),Sd(),oM()}function wo(){const i=Ms().map(n=>n.value.trim());if(i.some(n=>n===""))return null;const e=i.map(Number);if(!e.every(Number.isFinite))return null;const t=e.slice(3);return Math.hypot(...t)<1e-9?null:{position:e.slice(0,3),quaternion:t}}function Sp(){const i=Number(vo.value),e=Number(xo.value);return!Number.isInteger(i)||i<1||i>100||!Number.isFinite(e)||e<=0?null:{velocity:i,timeout:e}}function Ep(i){const e=mt;mt=i,np.querySelectorAll("button[data-motion-command]").forEach(t=>{const n=Number(t.dataset.motionCommand)===i;t.classList.toggle("selected",n),t.setAttribute("aria-pressed",String(n))}),$y.hidden=i!==0,Yy.hidden=i===0,sp.hidden=i!==0,Ky.hidden=i===0,hd.hidden=i!==1,pd.hidden=i!==0,dd.textContent=`发送 ${md[i]}`,fi(ne),i!==0&&(e===0||e!==i)&&Ed(ne),je()}function Tp(){var e;so(),Nr();const i=yo[ne];i&&(vo.value=Wn(i.velocity),xo.value=Wn(i.timeout)),_o.textContent=bn((e=Ho())==null?void 0:e.preferred_reference),mt!==0&&(Sd(),_o.textContent=bn(hi())),fd.textContent=_d[ne]??"MOVEL 逆解仅更新影子预览",Ep(mt)}function Ed(i,e=!1){if(!Dt()||!e&&ki[i])return;const t=Sn("current-pose"),n=hi(i);ki[i]=t,Vn(i,`读取 ${bn(n)} 当前位姿…`),Yt({type:"get_current_pose",request_id:t,arm:i,reference:{reference_type:n.type,reference_name:n.name}}),je()}function Yt(i){(Ft==null?void 0:Ft.readyState)===WebSocket.OPEN&&Ft.send(JSON.stringify(i))}document.querySelectorAll('input[type="number"]').forEach(i=>{i.addEventListener("blur",()=>{i.value.trim()!==""&&(i.value=Wn(i.value))})});function Nr(){const i=Bi[ne]??[],e=xn.value;xn.innerHTML=i.length?i.map(t=>`<option value="${qt(t.id)}">${qt(t.label)}</option>`).join(""):'<option value="">无记录</option>',i.some(t=>t.id===e)&&(xn.value=e),lp.textContent=vd[ne]??(i.length?`${i.length} 条记录`:"无记录")}function Vn(i,e){_d[i]=e,i===ne&&(fd.textContent=e)}function ri(i,e){vd[i]=e,i===ne&&(lp.textContent=e)}function Td(i,e,t){const n=Lr[i];n&&window.clearTimeout(n),gs[i]=e,ri(i,t),Lr[i]=window.setTimeout(()=>{gs[i]===e&&(delete gs[i],delete Lr[i],ri(i,"记录请求超时：请确认网页连接后重试"),je())},8e3)}function Ya(i,e){if(gs[i]!==e)return!1;delete gs[i];const t=Lr[i];return t&&window.clearTimeout(t),delete Lr[i],!0}function kc(i){Ah.textContent=i?"ROS ONLINE":"OFFLINE",Ah.classList.toggle("offline",!i)}function Ad(){const i=!!gd[ne];kc(i)}function Ap(){const i=J("#joint-controls");i.innerHTML=Mo().joints.map((e,t)=>`
    <label class="joint-row"><span>J${t+1}<output id="joint-value-${t}">${Xi(kt[t]*180/Math.PI)}°</output></span>
    <input data-joint-index="${t}" type="range" min="${e.lower_deg}" max="${e.upper_deg}" step="0.1" value="${kt[t]*180/Math.PI}" /></label>
  `).join(""),i.querySelectorAll("input[data-joint-index]").forEach(e=>e.addEventListener("input",()=>{var n,s;const t=Number(e.dataset.jointIndex);kt[t]=Number(e.value)*Math.PI/180,qi[ne]=[...kt],Kr[ne]=!0,J(`#joint-value-${t}`).textContent=`${Xi(Number(e.value))}°`,(s=(n=To())==null?void 0:n.shadow)==null||s.setJointValues(Object.fromEntries(kt.map((r,a)=>[`joint_${a+1}`,r])))}))}function Wo(i,e=!1){i.forEach((t,n)=>{const s=J(`input[data-joint-index="${n}"]`),r=J(`#joint-value-${n}`);if(!s||!r)return;const a=t*180/Math.PI;e&&(kt[n]=t,s.value=String(a)),r.textContent=`${Xi(a)}°`})}function Ss(i,e){i==null||i.setJointValues(Object.fromEntries(e.map((t,n)=>[`joint_${n+1}`,t]))),i==null||i.updateMatrixWorld(!0)}function zh(i,e,t){var a;const n=ke==null?void 0:ke.robots.find(o=>o.id===i);if(!(e.length===6&&(n==null?void 0:n.joints.every((o,l)=>Number.isFinite(Number(e[l]))&&Number(e[l])>=o.lower_deg&&Number(e[l])<=o.upper_deg))))return ri(i,"记录关节角超出限制"),!1;const r=e.map(o=>Number(o)*Math.PI/180);return qi[i]=[...r],Kr[i]=!0,ms[i]=!0,i===ne&&(kt=[...r],Wo(r,!0)),Ss((a=Ln[i])==null?void 0:a.shadow,r),ri(i,t),i===ne&&(fi(i),wd(!0)),!0}function Vh(i,e,t){i==null||i.traverse(n=>{n instanceof gt&&(n.material=e?new Gr({color:14715474,transparent:!0,opacity:t===ne?.28:0,depthWrite:!1,depthTest:!1,side:Rn}):new Uo({color:Gy[t],metalness:.25,roughness:.56,depthWrite:!0,depthTest:!0}),n.castShadow=!e,n.receiveShadow=!e,n.renderOrder=e?10:0,n.frustumCulled=!e)})}function cM(i){i==null||i.traverse(e=>{e instanceof gt&&(e.material=new Uo({color:2831416,metalness:.35,roughness:.5}),e.castShadow=!0,e.receiveShadow=!0)})}function fi(i){var n,s;const e=Fl?(n=Ln[Fl])==null?void 0:n.shadow:null;e==null||e.traverse(r=>{r instanceof gt&&"opacity"in r.material&&(r.material.opacity=0)});const t=(s=Ln[i])==null?void 0:s.shadow;t==null||t.traverse(r=>{if(r instanceof gt&&"opacity"in r.material){const a=mt===0||mt===1&&ms[i]?.28:0;r.material.opacity=a}}),Fl=i}function wd(i=!1){if(!ke||!tn||!si||!gn)return;const e=new Es;if(ke.robots.forEach(({id:r})=>{const a=Ln[r];a&&(e.expandByObject(a.live),i&&r===ne&&e.expandByObject(a.shadow))}),e.isEmpty())return;const t=e.getSize(new I),n=Math.max(t.x,t.y,t.z,.5),s=e.min.z+t.z*.36;si.target.set(0,0,s),tn.position.set(n*1.18,-n*1.65,s+n*.82),tn.lookAt(si.target),si.update()}function ro(i){let e=0;return i==null||i.traverse(t=>{t instanceof gt&&(e+=1)}),e}async function Gh(i,e=7){for(let t=0;t<160;t+=1){if(i.every(n=>ro(n)>=e))return;await new Promise(n=>window.setTimeout(n,50))}throw new Error("URDF mesh loading timed out")}async function dM(){var t;const i=++Uh;ls.textContent="加载 URDF…",ls.removeAttribute("hidden");const e=new Ly;e.packages={rm65_description:`${location.origin}/models`};for(const n of Object.keys(Li))delete Li[n];try{const n=await Promise.all(ke.robots.map(async u=>{var x;const h=await e.loadAsync(`${location.origin}${u.urdf_url}`),d=await e.loadAsync(`${location.origin}${u.urdf_url}`),f=(x=ke.end_effectors)==null?void 0:x[u.id],g=f?await e.loadAsync(`${location.origin}${f.urdf_url}`):null;return{config:u,live:h,shadow:d,mount:f,gripper:g}}));if(i!==Uh)return;if(!gn)throw new Error("WebGL scene was not initialized");gn.clear(),gn.add(new Qg(16777215,13884389,2.4));const s=new If(16777215,4);s.position.set(2,-3,4),s.castShadow=!0,gn.add(s);const r=new c_(3.5,22,11780561,14542060);r.rotation.x=Math.PI/2,gn.add(r);const a=[],o=(t=ke.robots.find(u=>u.id==="m"))==null?void 0:t.transform;if(!o)throw new Error("middle-arm transform is missing from the layout manifest");const l=ke.pedestal;if(l){const u=new gt(new Ts(l.size_xy[0],l.size_xy[1],l.top_z-l.bottom_z),new Uo({color:l.color,metalness:.1,roughness:.8}));u.name="pedestal",u.position.set(l.center_xy[0]-o.x,l.center_xy[1]-o.y,(l.top_z+l.bottom_z)/2-o.z),u.castShadow=!0,u.receiveShadow=!0,gn.add(u),r.position.z=l.bottom_z-o.z-.002,ln.dataset.pedestal="1"}else delete ln.dataset.pedestal;n.forEach(({config:u,live:h,shadow:d,mount:f,gripper:g})=>{var m;h.position.set(u.transform.x-o.x,u.transform.y-o.y,u.transform.z-o.z),h.rotation.set(u.transform.roll,u.transform.pitch,u.transform.yaw,"ZYX"),d.position.set(u.transform.x-o.x,u.transform.y-o.y,u.transform.z-o.z),d.rotation.set(u.transform.roll,u.transform.pitch,u.transform.yaw,"ZYX");const x=f&&g?(m=h.links)==null?void 0:m[f.parent_link]:null;f&&g&&x&&(g.position.set(...f.xyz),g.rotation.set(f.rpy[0],f.rpy[1],f.rpy[2],"ZYX"),x.add(g),Li[u.id]=g,g.setJointValue(f.driving_joint,f.open_rad)),gn.add(h),gn.add(d),Ln[u.id]={live:h,shadow:d},a.push(h,d)}),await Gh(a),await Gh(Object.values(Li),9),n.forEach(({config:u,live:h,shadow:d})=>{Vh(h,!1,u.id),cM(Li[u.id]),Vh(d,!0,u.id),Ss(h,ra(u.id)),Ss(d,yd(u.id)),h.updateMatrixWorld(!0)}),Eo();const c=Go(ne);fi(ne),wd(!1),ln.dataset.liveMeshes=String(n.reduce((u,{live:h})=>u+ro(h),0)),ln.dataset.shadowMeshes=String(n.reduce((u,{shadow:h})=>u+ro(h),0)),ln.dataset.gripperMeshes=String(Object.values(Li).reduce((u,h)=>u+ro(h),0)),Cd(),ln.dataset.visualizationReferenceArm="m",ls.setAttribute("hidden",""),J("#model-label").textContent=`${c.model} / ${ne.toUpperCase()} + 3 arms`}catch(n){ls.textContent=`URDF 加载失败: ${String(n)}`,ls.removeAttribute("hidden")}}function uM(){kn=new oy({canvas:hs,antialias:!0,alpha:!0,preserveDrawingBuffer:!0}),ln.dataset.renderer="webgl",kn.setPixelRatio(Math.min(window.devicePixelRatio,2)),kn.outputColorSpace=dt,kn.setClearColor(16185595,1),kn.shadowMap.enabled=!0,gn=new _f,tn=new Xt(35,1,.01,100),tn.up.set(0,0,1),tn.position.set(1.2,-1.8,1.25),si=new cy(tn,hs),si.enableDamping=!0,si.target.set(0,0,.55);const i=()=>{const t=ln.getBoundingClientRect();!t.width||!t.height||!kn||!tn||(kn.setSize(t.width,t.height,!1),tn.aspect=t.width/t.height,tn.updateProjectionMatrix())};new ResizeObserver(i).observe(ln),i(),hM();const e=()=>{requestAnimationFrame(e),!(!kn||!gn||!tn||!si)&&(si.update(),kn.render(gn,tn))};e()}const ss=J("#viewer-hover"),Hh=new l_;let Wh;function Xh(i){var e;if(i!==Wh){for(const[t,n]of Object.entries(Ln))(e=n.live)==null||e.traverse(s=>{s instanceof gt&&s.material instanceof Uo&&(s.material.emissive.set(t===i?4088797:0),s.material.emissiveIntensity=t===i?.28:0)});Wh=i,ln.classList.toggle("hovering-arm",!!i)}}function qh(i){if(!tn)return;const e=hs.getBoundingClientRect();Hh.setFromCamera(new Ne((i.clientX-e.left)/e.width*2-1,-((i.clientY-e.top)/e.height)*2+1),tn);let t;for(const[n,s]of Object.entries(Ln)){if(!s.live)continue;const r=Hh.intersectObject(s.live,!0)[0];if(!r||t&&t.distance<=r.distance)continue;let a=r.object,o=!1;for(;a&&!a.isURDFLink;)a=a.parent;for(let l=a;l;l=l.parent)o||(o=l===Li[n]);t={arm:n,link:o?"夹爪":(a==null?void 0:a.name)??"",distance:r.distance}}return t&&{arm:t.arm,link:t.link}}function hM(){let i=0,e;hs.addEventListener("pointermove",t=>{if(t.buttons){ss.hidden=!0;return}i||(i=requestAnimationFrame(()=>{var a;i=0;const n=qh(t);if(Xh(n==null?void 0:n.arm),ss.hidden=!n,!n)return;const s=((a=Gi.querySelector(`option[value="${n.arm}"]`))==null?void 0:a.textContent)??n.arm.toUpperCase();ss.innerHTML=`${qt(s)}<span>${qt(n.link)}${n.arm===ne?"":" · 点击选中"}</span>`;const r=ln.getBoundingClientRect();ss.style.left=`${t.clientX-r.left}px`,ss.style.top=`${t.clientY-r.top}px`}))}),hs.addEventListener("pointerleave",()=>{Xh(void 0),ss.hidden=!0}),hs.addEventListener("pointerdown",t=>{e={x:t.clientX,y:t.clientY}}),hs.addEventListener("pointerup",t=>{const n=e&&Math.hypot(t.clientX-e.x,t.clientY-e.y)<4;if(e=void 0,!n)return;const s=qh(t);!s||s.arm===ne||(Gi.value=s.arm,Gi.dispatchEvent(new Event("change")),ss.hidden=!0)})}function Rd(){const i=Mo().motion;J("#velocity-frame").innerHTML=Object.entries(Mo().frames).map(([n,s])=>`<option value="${n}">${n.toUpperCase()} / ${s.name}</option>`).join(""),J("#velocity-period").setAttribute("value",Wn(i.velocity_control_period_ms)),J("#velocity-watchdog").setAttribute("value",Wn(i.velocity_watchdog_ms)),J("#linear-accel").setAttribute("value",Wn(i.max_linear_accel_mps2)),J("#angular-accel").setAttribute("value",Wn(i.max_angular_accel_radps2));const e=["vx","vy","vz","wx","wy","wz"];J("#velocity-inputs").innerHTML=e.map((n,s)=>`<label>${n}<input id="velocity-${s}" type="number" step="0.01" value="0.00" /></label>`).join("");const t=Ho();if(t!=null&&t.preferred_reference){const n=t.preferred_reference.type===1?"work":t.preferred_reference.type===2?"tool":"base";J("#velocity-frame").value=n}}function Rs(i,e={}){!hn||!Dt()||Yt({type:"gripper_command",request_id:Sn("gripper"),name:hn,command:i,...e})}function wp(i){var s,r,a;const e=Number((s=As[i])==null?void 0:s.position),t=Number((r=Yr[i])==null?void 0:r.open_position),n=Number((a=Yr[i])==null?void 0:a.close_position);return!Number.isFinite(e)||!Number.isFinite(t)||!Number.isFinite(n)||t===n?null:Math.min(Math.max((e-n)/(t-n),0),1)}function Cd(){var i;for(const e of["l","m","r"]){const t=Li[e],n=(i=ke==null?void 0:ke.end_effectors)==null?void 0:i[e];if(!t||!n)continue;const s=wp(n.gripper_name);s!==null&&(t.setJointValue(n.driving_joint,n.closed_rad+(n.open_rad-n.closed_rad)*s),ln.dataset[`gripper${e.toUpperCase()}`]=s.toFixed(2))}}function Pd(){const i=As[hn];if(!i)return;J("#gripper-state").textContent=i.connected?"ONLINE":"OFFLINE",oa();const e=wp(hn),t=e===null?"":`开合 ${Math.round(e*100)}% / `;J("#gripper-feedback").textContent=`${t}位置 ${i.position??0} / 速度 ${i.speed??0} / 电流 ${i.current??0} / 力矩 ${i.torque_reached?"到达":"未到达"} / 报警 0x${Number(i.alarm??0).toString(16)}`}function aa(i){J("#gripper-limits-status").textContent=i}function Ld(){return{open:J("#gripper-open-position"),close:J("#gripper-close-position"),raw:J("#gripper-raw-position"),rawValue:J("#gripper-raw-value"),apply:J("#gripper-limits-apply"),teachOpen:J("#gripper-teach-open"),teachClose:J("#gripper-teach-close")}}function oa(){const i=Yr[hn],e=As[hn],t=Ld(),n=Dt()&&!!i,s=n&&(e==null?void 0:e.connected)===!0&&Number(e.speed)===0;if(i){const r=Number(i.min_position??0),a=Number(i.max_position??0);t.raw.min=String(r),t.raw.max=String(a),J("#gripper-limits-range").textContent=`允许范围 ${r}..${a}（min/max 只能在 gripper.yaml 中修改）`;const o=document.activeElement===t.open||document.activeElement===t.close;!ia&&!o&&(t.open.value=String(i.open_position),t.close.value=String(i.close_position))}e&&document.activeElement!==t.raw&&(t.raw.value=String(Math.round(Number(e.position)||0)),t.rawValue.textContent=t.raw.value);for(const r of[t.open,t.close,t.raw,t.apply])r.disabled=!n;t.teachOpen.disabled=!s,t.teachClose.disabled=!s}function Rp(i){var t;const e=Number((t=As[hn])==null?void 0:t.position);Number.isFinite(e)&&(Ld()[i].value=String(Math.round(e)),ia=!0,aa(""))}function fM(){const i=Yr[hn];if(!i||!Dt())return;const{open:e,close:t}=Ld(),n=Number(e.value),s=Number(t.value);if(e.value===""||t.value===""||!Number.isInteger(n)||!Number.isInteger(s)){aa("开位和闭位必须是整数");return}window.confirm(`确认修改 ${hn} 的行程？
开位 ${i.open_position} → ${n}
闭位 ${i.close_position} → ${s}`)&&Rs("set_limits",{open_position:n,close_position:s})}function pM(i){const e=J("#gripper-select");e.innerHTML=i.map(t=>`<option value="${String(t.name)}">${String(t.name)}</option>`).join("");for(const t of i)Yr[String(t.name)]=t;Cd(),!hn&&i.length&&(hn=String(i[0].name)),e.value=hn,Pd(),oa()}function mM(i){var e,t,n,s,r,a,o,l,c,u,h;if(i.type==="hello")io=!!i.read_only,wh.textContent=io?"READ ONLY":"CONTROL READY",wh.classList.toggle("ready",!io),i.layout?Pp(i.layout):je();else if(i.type==="input_mode_list")i.available?zt=Array.isArray(i.modes)?i.modes.reduce((d,f)=>(typeof(f==null?void 0:f.id)=="string"&&typeof(f==null?void 0:f.label)=="string"&&typeof(f==null?void 0:f.selectable)=="boolean"&&d.push({id:f.id,label:f.label,selectable:f.selectable}),d),[]):[]:(zt=void 0,Ze=void 0,Ys="",Cn="",oi=void 0,Hi=""),rs();else if(i.type==="keyboard_lease")ci=!!i.active,ci||Wi(),rs();else if(i.type==="input_mode_result"){const d={request_id:String(i.request_id??""),executor_request_id:Number(i.executor_request_id),accepted:!!i.accepted,message:String(i.message??"")};d.request_id===Cn&&(Ys=d.message,d.accepted&&Number.isFinite(d.executor_request_id)?(oi=d.executor_request_id,Oh()):(Cn="",oi=void 0,Hi=""),rs())}else if(i.type==="input_mode_state"){const d=String(i.phase??""),f=String(i.active_mode??""),g=Ze!==void 0&&Ze.epoch!==Number(i.epoch)||d!=="ACTIVE"||f!=="keyboard";g&&Wi(),Ze={requested_mode:String(i.requested_mode??""),selected_mode:String(i.selected_mode??""),active_mode:String(i.active_mode??""),phase:String(i.phase??""),request_id:Number(i.request_id),epoch:Number(i.epoch),detail:String(i.detail??"")},g&&(ci=!1),Oh(),rs()}else if(i.type==="gripper_list")pM(Array.isArray(i.grippers)?i.grippers:[]);else if(i.type==="gripper_state")As[String(i.name)]=i,Pd(),Cd(),Qr();else if(i.type==="gripper_result"){if(i.command==="set_limits"||i.command==="move_raw"){if(i.message){const d=i.success===!1?"失败：":i.command==="set_limits"&&i.success===!0?"已应用：":"";aa(`${d}${String(i.message)}`)}}else i.message&&(J("#gripper-feedback").textContent=String(i.message));i.command==="set_limits"&&i.state==="completed"&&i.success===!0&&(ia=!1,oa())}else if(i.type==="coordinate_state")ws[i.arm]=i,Qr(),Eo(),Ks(),i.arm===ne&&(Md(),ke&&Rd());else if(i.type==="cartesian_velocity_state"){const d=i.arm;if(!["l","m","r"].includes(d))return;const f=i.state;if(!f)return;cp[d]=f,d!=="m"&&rM(d,f),bp()}else if(i.type==="tf_frames"){const d=i.arm;if(Oc[d]=Array.isArray(i.frames)?i.frames:[],d===ne&&ke){const f=hi(d);f.type===3&&!((e=Oc[d])!=null&&e.some(g=>g.frame_id===f.frame_id))&&delete ps[d],Sd(),so(),je()}}else if(i.type==="connection")gd[i.arm]=!!i.connected,Ks(),i.arm===ne&&Ad();else if(i.type==="joint_state"){const d=i.arm,f=Array.isArray(i.positions_rad)?i.positions_rad.map(Number):[],g=Number(i.stamp_ns);if(!["l","m","r"].includes(d)||f.length!==6||!f.every(Number.isFinite)||!Number.isFinite(g)||g<=0||Oi[d]!==void 0&&g<=Oi[d])return;const x=f.every(p=>p===0);if(x&&Ul[d])return;const m=Oi[d]===void 0||!x&&!Ul[d];Oi[d]=g,x||(Ul[d]=!0),ys[d]=f,Kr[d]||(qi[d]=[...f]),Ss((t=Ln[d])==null?void 0:t.live,f),d===ne&&(Vo=f,J("#joint-stamp").textContent=`joint_states / ${g}`,bo.textContent="可复制当前关节角",m&&Nd()),Ks()}else if(i.type==="joint_records")Bi[i.arm]=Array.isArray(i.records)?i.records:[],vd[i.arm]||ri(i.arm,`${((n=Bi[i.arm])==null?void 0:n.length)??0} 条记录`),i.arm===ne&&Nr(),je();else if(i.type==="joint_record_saved"){const d=i.arm;if(!Ya(d,i.request_id))return;ri(d,`已记录 ${((s=i.record)==null?void 0:s.label)??""}`),zo.value="",d===ne&&Nr(),je()}else if(i.type==="joint_record_deleted"){const d=i.arm;if(!Ya(d,i.request_id))return;const f=String(((r=i.record)==null?void 0:r.id)??"");Bi[d]=(Bi[d]??[]).filter(g=>g.id!==f),ri(d,`已删除 ${((a=i.record)==null?void 0:a.label)??"记录"}`),d===ne&&Nr(),je()}else if(i.type==="joint_record_applied"){const d=i.arm;if(!Ya(d,i.request_id))return;const f=Array.isArray(i.joint_degrees)?i.joint_degrees:[],g=Number(i.command);if(g===0)zh(d,f,`已填入 ${((o=i.record)==null?void 0:o.label)??"记录"} / MOVEJ`);else{const x=Array.isArray(i.pose_position_m)?i.pose_position_m:[],m=Array.isArray(i.pose_quaternion_wxyz)?i.pose_quaternion_wxyz:[];if(i.success&&x.length===3&&m.length===4&&zh(d,f,`已填入 ${((l=i.record)==null?void 0:l.label)??"记录"} / ${md[g]}`)){$i[d]=[...x,...m].map(E=>String(E));const p=i.reference;(p==null?void 0:p.type)===3&&(ps[d]=p),Zr[d]=[...x],Vn(d,`记录正解已填入 / ${bn(p??hi(d))}`),d===ne&&so()}else ri(d,`记录正解失败 / ${i.message||"forward kinematics failed"}`)}je()}else if(i.type==="kinematics_result"){const d=i.arm;if(ki[d]!==i.request_id)return;if(delete ki[d],i.operation==="get_current_pose"){const f=Array.isArray(i.pose_position_m)?i.pose_position_m:[],g=Array.isArray(i.pose_quaternion_wxyz)?i.pose_quaternion_wxyz:[];if(i.success&&f.length===3&&g.length===4){$i[d]=[...f,...g].map(m=>String(m));const x=i.reference;(x==null?void 0:x.type)===3&&(ps[d]=x),Zr[d]=[...f],ms[d]=!1,Vn(d,`当前位置已填入 / ${bn(x??hi(d))}`),d===ne&&so(),d===ne&&fi(d)}else Vn(d,`当前位置读取失败 / ${i.message||"unknown error"}`)}else if(i.operation==="solve_ik"){const f=Array.isArray(i.joint_degrees)?i.joint_degrees:[],g=ke==null?void 0:ke.robots.find(m=>m.id===d);if(!!i.success&&f.length===6&&(g==null?void 0:g.joints.every((m,p)=>Number.isFinite(Number(f[p]))&&Number(f[p])>=m.lower_deg&&Number(f[p])<=m.upper_deg))){const m=f.map(p=>Number(p)*Math.PI/180);qi[d]=[...m],Kr[d]=!0,ms[d]=!0,d===ne&&(kt=[...m],Wo(m,!0)),Ss((c=Ln[d])==null?void 0:c.shadow,m),Vn(d,`逆解成功 / 影子已更新 / ${f.map(p=>Number(p).toFixed(2)).join(", ")}°`),d===ne&&(fi(d),wd(!0))}else ms[d]=!1,Vn(d,`逆解失败 / ${i.message||"target is unreachable"}`),d===ne&&fi(d)}je()}else if(i.type==="action_state"){if(i.arm!==ne){Ks();return}if(i.action==="execute_motion"&&wt&&i.request_id&&i.request_id!==wt)return;Xa.textContent=String(i.state).toUpperCase(),Xa.className=`mini-state ${i.state}`,i.action==="cartesian_velocity"&&(Hy.textContent=String(i.state).toUpperCase()),["rejected","error","stopped"].includes(i.state)&&(i.action==="execute_motion"&&(window.clearTimeout(wn),wn=0,ii.textContent=`${i.action} / ${i.message||`action ${i.state}`}`,Nl.style.width="0%",wt=""),i.action==="cartesian_velocity"&&(Gn="",window.clearInterval(li),li=0),je())}else if(i.type==="action_feedback"){if(i.arm!==ne)return;if(i.action==="execute_motion"){if(wt&&i.request_id&&i.request_id!==wt)return;window.clearTimeout(wn),wn=0}const d=i.feedback||{};ii.textContent=`${i.action} / ${d.detail||"executing"} / progress ${d.progress??"-"}`,Array.isArray(d.commanded_linear_velocity_mps)&&(ii.textContent=`velocity / ${d.commanded_linear_velocity_mps.map(f=>Xi(f)).join(", ")}`),Nl.style.width=`${Math.max(0,Math.min(100,Number(d.progress||0)*100))}%`}else if(i.type==="action_result"){if(i.arm!==ne)return;if(i.action==="execute_motion"){if(wt&&i.request_id&&i.request_id!==wt)return;window.clearTimeout(wn),wn=0,(ii.textContent.includes("等待 feedback")||ii.textContent.includes("尚未收到"))&&(ii.textContent=`${i.action} / ${((u=i.result)==null?void 0:u.message)||"已收到运行结果"}`)}Pi.textContent=JSON.stringify(i.result,null,2),Xa.textContent="RESULT",wt=i.action==="execute_motion"?"":wt,Gn=i.action==="cartesian_velocity"?"":Gn,je()}else if(i.type==="software_stop_result")Pi.textContent=`软件停止: ${i.success?"成功":"失败"} / ${i.message}`;else if(i.type==="motion_recovery_state"){const d=i.arm;if(Ii[d]!==i.request_id)return;Pi.textContent=`${d.toUpperCase()} 恢复请求中 / ${i.state}`,je()}else if(i.type==="motion_recovery_result"){const d=i.arm;if(Ii[d]!==i.request_id)return;delete Ii[d];const f=i.success?i.recovered?"已恢复":"无需恢复":"恢复失败";Pi.textContent=`${d.toUpperCase()} ${f} / ${i.message||"unknown error"}`,d===ne&&(Xa.textContent=f.toUpperCase()),je()}else if(i.type==="bt_runtime")At=((h=i.runtime)==null?void 0:h.available)===!0?i.runtime:{available:!1},la();else if(i.type==="behavior_tree_stop_result"){if(i.request_id!==yn)return;Co(i.success?`已请求终止（${i.message}），等待行为树取消动作并退出…`:`终止失败：${i.message}`,!i.success),i.success||(yn=""),_s()}else if(i.type==="error"&&i.request_id&&i.request_id===yn)yn="",Co(`终止失败：${i.message}`,!0),_s();else if(i.type==="error"){if(i.code==="keyboard_lease"||i.code==="keyboard_inactive"){ci=!1,Wi(),Ys=`${i.code}: ${i.message}`,rs();return}Pi.textContent=`${i.code}: ${i.message}`,i.request_id===Cn&&(Ys=`${i.code}: ${i.message}`,Cn="",oi=void 0,Hi="",rs()),wt&&i.request_id===wt&&(window.clearTimeout(wn),wn=0,ii.textContent=`execute_motion / ${i.code}: ${i.message}`,Nl.style.width="0%",wt=""),i.request_id===Gn&&(Gn="",window.clearInterval(li),li=0);for(const d of["l","m","r"])i.request_id===ki[d]&&(delete ki[d],Vn(d,`${i.code}: ${i.message}`)),i.request_id===gs[d]&&(Ya(d,i.request_id),ri(d,`${i.code}: ${i.message}`)),i.request_id===Ii[d]&&(delete Ii[d],Pi.textContent=`${d.toUpperCase()} 恢复失败 / ${i.code}: ${i.message}`);je()}}function Cp(){ci=!1,Wi(),Ft==null||Ft.close();const i=location.protocol==="https:"?"wss":"ws";Ft=new WebSocket(`${i}://${location.host}/ws`),Ft.addEventListener("open",()=>{kc(!0),je()}),Ft.addEventListener("close",()=>{Wi(),kc(!1),Cn="",oi=void 0,Hi="",At={available:!1},la(),je(),window.setTimeout(Cp,2e3)}),Ft.addEventListener("message",e=>{try{mM(JSON.parse(e.data))}catch{Pi.textContent="收到无法解析的服务器消息"}})}function je(){var s;const i=Dt(),e=!!Sp()&&(mt===0||!!wo());dd.disabled=!i||!!wt||!e,jf.disabled=!i||!!Gn,Qf.disabled=!i||!Gn,Zf.disabled=!i||!wt,Jf.disabled=!i||!!Ii[ne],Kf.disabled=!i;const t=!!ki[ne];ip.disabled=!i||mt===0,hd.disabled=!i||mt!==1||t||!wo();const n=!!gs[ne];rp.disabled=!i||Oi[ne]===void 0,ap.disabled=!i||n||zo.value.trim()===""||(((s=ys[ne])==null?void 0:s.length)??0)!==6,op.disabled=!i||n||!xn.value,pd.disabled=!i||mt!==0||n||!xn.value,gp(),oa()}function Pp(i){ke=i,sa(),ne=Gi.value,i.robots.forEach(e=>{const t=e.joints.map(()=>i.default_joint_position_rad);ys[e.id]=ys[e.id]??[...t],qi[e.id]=qi[e.id]??[...t],$i[e.id]=$i[e.id]??["","","","1","0","0","0"],Bi[e.id]=Bi[e.id]??[],yo[e.id]=yo[e.id]??{velocity:Wn(30),timeout:Wn(e.motion.default_timeout_sec)}}),Vo=[...ra(ne)],kt=[...yd(ne)],J("#root-frame").textContent=`TF / ${i.root_frame}`,go.textContent=ne.toUpperCase(),go.className="mini-state active-arm",Ap(),Nr(),Tp(),Rd(),Md(),bp(),Ks(),Ad(),kn||uM(),dM(),je()}window.addEventListener("keydown",i=>{const e=i.target;if(i.repeat||i.ctrlKey||i.altKey||i.metaKey||i.shiftKey||i.isComposing||e!=null&&e.closest("input, textarea, select")||e!=null&&e.isContentEditable)return;const t=pp(i.code);!t||!fp(t,i.code)||(i.preventDefault(),Zn[t].has(i.code)||(Zn[t].add(i.code),Qr(),jr(),sa()))});window.addEventListener("keyup",i=>{const e=pp(i.code);!e||!Zn[e].delete(i.code)||(i.preventDefault(),jr(),sa())});window.addEventListener("blur",Wi);document.addEventListener("visibilitychange",()=>{document.hidden&&Wi()});function Nd(){var i;Oi[ne]!==void 0&&(kt=[...Vo],qi[ne]=[...kt],Kr[ne]=!0,Wo(kt,!0),Ss((i=To())==null?void 0:i.shadow,kt))}sp.addEventListener("click",Nd);Gi.addEventListener("change",()=>{ne=Gi.value,wt="",Gn="",window.clearInterval(li),li=0,Ap(),fi(ne),sM();const i=Go(ne);J("#model-label").textContent=`${i.model} / ${ne.toUpperCase()} + 3 arms`});Fi.addEventListener("change",()=>{const i=zt==null?void 0:zt.find(e=>e.id===Fi.value);!i||!i.selectable||i.id==="web"||!Dt()||(Cn=Sn("input-mode"),oi=void 0,Hi=i.id,Ys=`请求切换到 ${i.label}…`,rs(),Yt({type:"select_input_mode",request_id:Cn,mode_id:i.id}))});np.querySelectorAll("button[data-motion-command]").forEach(i=>{i.addEventListener("click",()=>{const e=Number(i.dataset.motionCommand);(e===0||e===1||e===2)&&Ep(e)})});Ms().forEach(i=>{i.addEventListener("input",()=>{$i[ne]=Ms().map(e=>e.value),lM(),ms[ne]=!1,Vn(ne,_p()),fi(ne),je()})});[vo,xo].forEach(i=>{i.addEventListener("input",()=>{yo[ne]={velocity:vo.value,timeout:xo.value},je()})});zo.addEventListener("input",je);xn.addEventListener("change",je);rp.addEventListener("click",async()=>{const i=ys[ne];if(!(!i||i.length!==6||Oi[ne]===void 0))try{await iM(nM(i)),bo.textContent="已复制当前关节角"}catch{bo.textContent="复制失败，请检查浏览器剪贴板权限"}});ap.addEventListener("click",()=>{if(!Dt())return;const i=zo.value.trim();if(!i)return;const e=Sn("save-record");Td(ne,e,"保存当前关节角…"),Yt({type:"save_joint_record",request_id:e,arm:ne,label:i}),je()});op.addEventListener("click",()=>{if(!Dt()||!xn.value)return;const i=Sn("apply-record"),e=mt===0?yp():hi();Td(ne,i,"读取记录…"),Yt({type:"apply_joint_record",request_id:i,arm:ne,record_id:xn.value,command:mt,reference:{reference_type:e.type,reference_name:e.name}}),je()});pd.addEventListener("click",()=>{var t;if(!Dt()||mt!==0||!xn.value)return;const i=(t=Bi[ne])==null?void 0:t.find(n=>n.id===xn.value);if(!window.confirm(`删除关节记录“${(i==null?void 0:i.label)??xn.value}”？此操作不可撤销。`))return;const e=Sn("delete-record");Td(ne,e,"删除关节记录…"),Yt({type:"delete_joint_record",request_id:e,arm:ne,record_id:xn.value}),je()});dd.addEventListener("click",()=>{const i=Sp(),e=mt===0?null:wo();if(!Dt()||!i||mt!==0&&!e)return;const t=md[mt];wt=Sn(t.toLowerCase());const n=mt===0?yp():hi();Yt({type:"execute_motion",request_id:wt,arm:ne,goal:{command:mt,reference_type:n.type,reference_name:n.name,joint_degrees:mt===0?kt.map(a=>a*180/Math.PI):[0,0,0,0,0,0],pose_position_m:(e==null?void 0:e.position)??[0,0,0],pose_quaternion_wxyz:(e==null?void 0:e.quaternion)??[1,0,0,0],velocity_percent:i.velocity,blend_radius_percent:0,timeout_sec:i.timeout}}),ii.textContent=`${t} / ${bn(n)} / 等待 feedback…`,window.clearTimeout(wn);const s=wt,r=ne;wn=window.setTimeout(()=>{wn=0,!(wt!==s||ne!==r)&&(ii.textContent=`${t} / 尚未收到 Action feedback；运行状态未知，请勿重复发送。检查 /${r}/execute_motion 和驱动日志，必要时使用软件停止。`)},8e3),je()});ip.addEventListener("click",()=>{mt!==0&&Ed(ne,!0)});hd.addEventListener("click",()=>{const i=wo(),e=hi(),t=ra(ne);if(!Dt()||mt!==1||!i||t.length!==6)return;const n=Sn("solve-ik");ki[ne]=n,Vn(ne,"计算逆解…"),Yt({type:"solve_ik",request_id:n,arm:ne,goal:{reference_type:e.type,reference_name:e.name,seed_joint_degrees:t.map(s=>s*180/Math.PI),pose_position_m:i.position,pose_quaternion_wxyz:i.quaternion}}),je()});jf.addEventListener("click",()=>{if(!Dt())return;const i=Mo().frames[J("#velocity-frame").value];Gn=Sn("velocity"),Yt({type:"start_cartesian_velocity",request_id:Gn,arm:ne,goal:{reference_type:i.type,reference_name:i.name,control_period_ms:Number(J("#velocity-period").value),watchdog_ms:Number(J("#velocity-watchdog").value),max_linear_accel_mps2:Number(J("#linear-accel").value),max_angular_accel_radps2:Number(J("#angular-accel").value),follow:!1,trajectory_mode:0,radio:0}}),je(),li=window.setInterval(()=>{const e=Array.from({length:6},(t,n)=>Number(J(`#velocity-${n}`).value));Yt({type:"velocity_command",arm:ne,linear:e.slice(0,3),angular:e.slice(3)})},20)});Cr.addEventListener("change",()=>{const i=Mp(ne).find(e=>(e.frame_id??e.name)===Cr.value);i&&(ps[ne]=i,_o.textContent=bn(i),Zr[ne]=void 0,Ed(ne,!0))});Qf.addEventListener("click",()=>{Yt({type:"cancel_action",arm:ne,action:"cartesian_velocity"}),window.clearInterval(li),li=0});Zf.addEventListener("click",()=>{Yt({type:"cancel_action",arm:ne,action:"execute_motion"})});Kf.addEventListener("click",()=>{Yt({type:"software_stop",request_id:Sn("stop"),arm:ne})});Jf.addEventListener("click",()=>{if(!Dt()||Ii[ne])return;const i=Sn("recover");Ii[ne]=i,Pi.textContent=`${ne.toUpperCase()} 恢复请求中…`,Yt({type:"recover_motion",request_id:i,arm:ne}),je()});fetch("/api/layout").then(i=>i.json()).then(Pp).catch(i=>{const e=String(i);ls.textContent=e.includes("WebGL")?`WebGL 渲染失败: ${e}`:`布局加载失败: ${e}`,ls.removeAttribute("hidden")});J("#gripper-select").addEventListener("change",i=>{hn=i.target.value,ia=!1,aa(""),Pd(),oa()});J("#gripper-open").addEventListener("click",()=>Rs("open"));J("#gripper-close").addEventListener("click",()=>Rs("close"));J("#gripper-enable").addEventListener("click",()=>Rs("enable"));J("#gripper-reset").addEventListener("click",()=>Rs("reset"));J("#gripper-percentage").addEventListener("change",i=>Rs("percentage",{percentage:Number(i.target.value)}));for(const i of["#gripper-open-position","#gripper-close-position"])J(i).addEventListener("input",()=>{ia=!0,aa("")});J("#gripper-teach-open").addEventListener("click",()=>Rp("open"));J("#gripper-teach-close").addEventListener("click",()=>Rp("close"));J("#gripper-limits-apply").addEventListener("click",fM);const Ro=J("#gripper-raw-position");Ro.addEventListener("input",()=>{J("#gripper-raw-value").textContent=Ro.value});Ro.addEventListener("change",()=>Rs("move_raw",{position:Number(Ro.value)}));Cp();const Ol=J("#bt-panel"),$h=J("#bt-dot"),ao=J("#bt-collapse"),gM=J("#bt-body"),Lp="realman-web-control.bt-collapsed";let zi=!1;try{zi=window.localStorage.getItem(Lp)==="true"}catch{}function Np(){gM.hidden=zi,ao.textContent=zi?"▸":"▾",ao.title=zi?"展开":"收起",ao.setAttribute("aria-expanded",String(!zi))}ao.addEventListener("click",()=>{zi=!zi;try{window.localStorage.setItem(Lp,String(zi))}catch{}Np()});Np();const Ka=J("#bt-root-status"),_M=J("#bt-tree-id"),Bc=J("#bt-scope-toggle"),Yh=J("#bt-breadcrumb"),Kh=J("#bt-failure"),zc=J("#bt-tree"),Vc=new Map;let At={available:!1},Ir=!1,kl="",Zh=!1;function la(){if(Ol.hidden=!At.available&&!Xn.available,At.available&&!Zh&&(Ol.classList.add("bt-attention"),window.setTimeout(()=>Ol.classList.remove("bt-attention"),4e3)),Zh=At.available,yM.hidden=!At.available,Dr.hidden=!At.available,Vi(),!At.available){Ka.textContent="未运行",Ka.className="bt-status bt-idle",$h.className="tab-dot",kl="",yn&&Co("",!1),yn="",Ur=0,_s();return}_s();const i=Uy(At.nodes);if(Ka.textContent=At.root_status,Ka.className=`bt-status bt-${At.root_status.toLowerCase()}`,$h.className=`tab-dot bt-dot-${At.root_status.toLowerCase()}`,Kh.hidden=!At.failure_reason,Kh.textContent=At.failure_reason,!i)return;const e=Fy(i),t=e&&Oy(e,Ze==null?void 0:Ze.active_mode),n=e&&!Ir?t:void 0;Bc.hidden=!e,Bc.textContent=Ir?"只看当前分支":"显示整棵树",_M.textContent=e?`${At.tree_id||"tree"} · 输入路由 ${t?t.name:"（无活动分支）"}`:`${At.tree_id||"tree"} · 整棵树`,Yh.hidden=!n;const s=n?Uc(n,Vc):e&&!Ir?'<li class="bt-empty">没有处于活动状态的输入分支</li>':Uc(i,Vc,new Set(e==null?void 0:e.children.filter(a=>a!==t).map(a=>a.path))),r=n?zy(ky(i,n.path)):"";s+r!==kl&&(kl=s+r,Yh.innerHTML=r,zc.innerHTML=s,zc.dataset.scope=n?n.name:"tree")}zc.addEventListener("click",i=>{const e=i.target.closest("[data-bt-toggle]");e&&(Vc.set(e.dataset.btToggle,e.getAttribute("aria-expanded")==="true"),la())});const Dr=J("#bt-stop"),Bl=J("#bt-stop-status");let yn="",Ur=0;function Co(i,e){Bl.hidden=!i,Bl.textContent=i,Bl.classList.toggle("error",e)}function _s(){const i=Ur>Date.now();Dr.disabled=!Dt()||!!yn,Dr.textContent=yn?"正在终止…":i?"确认终止？":"终止行为树",Dr.classList.toggle("armed",i&&!yn)}Dr.addEventListener("click",()=>{if(!(!Dt()||yn)){if(Ur<=Date.now()){Ur=Date.now()+4e3,_s(),window.setTimeout(_s,4100);return}Ur=0,yn=Sn("bt-stop"),Yt({type:"stop_behavior_tree",request_id:yn}),Co("已发送终止请求…",!1),_s()}});Bc.addEventListener("click",()=>{Ir=!Ir,la()});const vM=J("#bt-launcher"),Gc=J("#bt-picker-button"),xM=J("#bt-picker-label"),bM=J("#bt-picker-meta"),Yi=J("#bt-picker-list"),Po=J("#bt-real-motion"),Zs=J("#bt-start"),zl=J("#bt-start-status"),Jh=J("#bt-start-log"),yM=J("#bt-running"),Ip="realman-web-control.bt-tree";let Xn={available:!1},pi="";try{pi=window.localStorage.getItem(Ip)??""}catch{}let nr=0,jt;function Dp(i){return i.valid?[i.launch||"launch?",i.arms.length?i.arms.join(","):""].filter(Boolean).join(" · "):"XML 无法解析"}function fs(i,e=!1,t=[]){zl.hidden=!i,zl.textContent=i,zl.classList.toggle("error",e),Jh.hidden=!t.length,Jh.textContent=t.join(`
`)}function Id(){const i=Xn.trees??[],e=s=>`<div class="bt-option${s.name===pi?" selected":""}${s.valid?"":" invalid"}" role="option" aria-selected="${s.name===pi}" data-tree="${qt(s.name)}">
      <button type="button" class="bt-star${s.favorite?" on":""}" data-favorite-toggle="${qt(s.name)}" aria-pressed="${s.favorite}" title="${s.favorite?"取消收藏":"收藏置顶"}">${s.favorite?"★":"☆"}</button>
      <span class="bt-option-name">${qt(s.name.replace(/\.xml$/,""))}</span><span class="bt-option-meta">${qt(Dp(s))}</span></div>`,t=i.filter(s=>s.favorite),n=i.filter(s=>!s.favorite);Yi.innerHTML=(t.length?`<div class="bt-option-group">收藏</div>${t.map(e).join("")}`:"")+`<div class="bt-option-group">${t.length?"其它":"全部"}</div>${n.map(e).join("")||'<div class="bt-option-empty">没有行为树文件</div>'}`}function Vi(){var r;vM.hidden=At.available||!Xn.available;const i=Xn.trees??[];i.some(a=>a.name===pi)||(pi=((r=i.find(a=>a.valid))==null?void 0:r.name)??"");const e=i.find(a=>a.name===pi);xM.textContent=e?`${e.favorite?"★ ":""}${e.name.replace(/\.xml$/,"")}`:"选择行为树",bM.textContent=e?Dp(e):"",Yi.hidden||Id();const t=Xn.launcher??{},n=!!t.running||!!jt,s=nr>Date.now();Zs.disabled=!Xn.available||!(e!=null&&e.valid)||n,Zs.classList.toggle("armed",s&&!n),Zs.classList.toggle("danger",s&&Po.checked),Zs.textContent=jt?"正在启动…":s?Po.checked?"确认启动（真实运动）？":"确认启动（dry-run）？":"启动",At.available&&jt?(jt=void 0,fs("")):jt?t.tree===jt.tree&&t.started_at_ms===jt.startedAt&&typeof t.exit_code=="number"?(fs(`启动失败：bt-start 退出码 ${t.exit_code}（日志 ${t.log??""}）`,!0,t.log_tail??[]),jt=void 0):Date.now()-jt.since>6e4&&(fs(`${jt.tree} 60 s 内仍未运行，请查看日志 ${t.log??""}`,!0),jt=void 0):!At.available&&t.running&&!t.launched_here&&fs("已有行为树进程在运行（例如终端里的 ./rm65 bt），等待其监视器…")}function Dd(){Yi.hidden=!0,Gc.setAttribute("aria-expanded","false")}Gc.addEventListener("click",()=>{const i=Yi.hidden;Yi.hidden=!i,Gc.setAttribute("aria-expanded",String(i)),i&&Id()});document.addEventListener("click",i=>{!Yi.hidden&&!i.target.closest(".bt-picker")&&Dd()});document.addEventListener("keydown",i=>{i.key==="Escape"&&!Yi.hidden&&Dd()});Yi.addEventListener("click",async i=>{const e=i.target,t=e.closest("[data-favorite-toggle]");if(t){const s=t.dataset.favoriteToggle,r=await fetch("/api/bt/favorites",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:s,favorite:t.getAttribute("aria-pressed")!=="true"})}).catch(()=>{}),a=r&&await r.json().catch(()=>{});a!=null&&a.ok?Xn={...Xn,trees:a.trees}:fs(`收藏失败：${(a==null?void 0:a.error)??"网络错误"}`,!0),Vi(),Id();return}const n=e.closest("[data-tree]");if(!(!n||n.classList.contains("invalid"))){pi=n.dataset.tree;try{window.localStorage.setItem(Ip,pi)}catch{}nr=0,Dd(),Vi()}});Po.addEventListener("change",()=>{nr=0,Vi()});Zs.addEventListener("click",async()=>{if(Zs.disabled)return;if(nr<=Date.now()){nr=Date.now()+4e3,Vi(),window.setTimeout(Vi,4100);return}nr=0;const i=pi,e=!Po.checked;jt={tree:i,dryRun:e,since:Date.now()},fs(`正在启动 ${i}（${e?"dry-run":"真实运动"}），等待机械臂 Action 就绪…`),Vi();const t=await fetch("/api/bt/start",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({tree:i,dry_run:e})}).catch(()=>{}),n=t&&await t.json().catch(()=>{});!(t!=null&&t.ok)||!(n!=null&&n.ok)?(jt=void 0,fs(`启动失败：${(n==null?void 0:n.error)??"网络错误"}`,!0)):jt&&(jt.startedAt=n.started_at_ms),Vi(),Ud()});let Vl=!1;async function Ud(){if(!(Vl||document.hidden)){Vl=!0;try{const i=await fetch("/api/bt/trees",{cache:"no-store"});Xn=i.ok?await i.json():{available:!1}}catch{Xn={available:!1}}finally{Vl=!1}la()}}window.setInterval(Ud,2e3);Ud();
