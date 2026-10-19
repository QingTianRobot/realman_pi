import"./modulepreload-polyfill-B5Qt9EMX.js";/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Rc="185",Gs={ROTATE:0,DOLLY:1,PAN:2},ks={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},pp=0,Lu=1,mp=2,Wa=1,gp=2,vr=3,mi=0,en=1,Sn=2,ui=0,Hs=1,Nu=2,Iu=3,Du=4,_p=5,Qi=100,vp=101,xp=102,yp=103,bp=104,Mp=200,Sp=201,Ep=202,Tp=203,Il=204,Dl=205,Ap=206,wp=207,Rp=208,Cp=209,Pp=210,Lp=211,Np=212,Ip=213,Dp=214,Ul=0,Fl=1,Ol=2,Ks=3,Bl=4,kl=5,zl=6,Vl=7,Ao=0,Up=1,Fp=2,Xn=0,Ah=1,wh=2,Rh=3,Ch=4,Ph=5,Lh=6,Nh=7,Uu="attached",Op="detached",Ih=300,os=301,Zs=302,Go=303,Ho=304,wo=306,ns=1e3,ln=1001,Gl=1002,zt=1003,Bp=1004,ta=1005,Ct=1006,Wo=1007,ri=1008,on=1009,Dh=1010,Uh=1011,Rr=1012,Cc=1013,$n=1014,An=1015,gi=1016,Pc=1017,Lc=1018,Cr=1020,Fh=35902,Oh=35899,Bh=1021,kh=1022,pn=1023,_i=1026,is=1027,zh=1028,Nc=1029,ls=1030,Ic=1031,Dc=1033,Xa=33776,qa=33777,$a=33778,Ya=33779,Hl=35840,Wl=35841,Xl=35842,ql=35843,$l=36196,Yl=37492,Kl=37496,Zl=37488,Jl=37489,eo=37490,jl=37491,Ql=37808,ec=37809,tc=37810,nc=37811,ic=37812,sc=37813,rc=37814,ac=37815,oc=37816,lc=37817,cc=37818,uc=37819,dc=37820,hc=37821,fc=36492,pc=36494,mc=36495,gc=36283,_c=36284,to=36285,vc=36286,Pr=2300,xc=2301,Xo=2302,yc=2303,Fu=2400,Ou=2401,Bu=2402,kp=2500,zp=3200,Lr=0,Vp=1,Di="",dt="srgb",no="srgb-linear",io="linear",tt="srgb",ys=7680,ku=519,Gp=512,Hp=513,Wp=514,Uc=515,Xp=516,qp=517,Fc=518,$p=519,bc=35044,zu="300 es",Hn=2e3,Nr=2001;function Yp(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function Kp(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function Ir(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Zp(){const i=Ir("canvas");return i.style.display="block",i}const Vu={};function so(...i){const e="THREE."+i.shift();console.log(e,...i)}function Vh(i){const e=i[0];if(typeof e=="string"&&e.startsWith("TSL:")){const t=i[1];t&&t.isStackTrace?i[0]+=" "+t.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function Pe(...i){i=Vh(i);const e="THREE."+i.shift();{const t=i[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...i)}}function He(...i){i=Vh(i);const e="THREE."+i.shift();{const t=i[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...i)}}function Ws(...i){const e=i.join(" ");e in Vu||(Vu[e]=!0,Pe(...i))}function Jp(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}const jp={[Ul]:Fl,[Ol]:zl,[Bl]:Vl,[Ks]:kl,[Fl]:Ul,[zl]:Ol,[Vl]:Bl,[kl]:Ks};class Wi{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){const n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){const n=this._listeners;if(n===void 0)return;const s=n[e];if(s!==void 0){const r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const n=t[e.type];if(n!==void 0){e.target=this;const s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}}const Wt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let Gu=1234567;const Xs=Math.PI/180,Js=180/Math.PI;function Rn(){const i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Wt[i&255]+Wt[i>>8&255]+Wt[i>>16&255]+Wt[i>>24&255]+"-"+Wt[e&255]+Wt[e>>8&255]+"-"+Wt[e>>16&15|64]+Wt[e>>24&255]+"-"+Wt[t&63|128]+Wt[t>>8&255]+"-"+Wt[t>>16&255]+Wt[t>>24&255]+Wt[n&255]+Wt[n>>8&255]+Wt[n>>16&255]+Wt[n>>24&255]).toLowerCase()}function We(i,e,t){return Math.max(e,Math.min(t,i))}function Oc(i,e){return(i%e+e)%e}function Qp(i,e,t,n,s){return n+(i-e)*(s-n)/(t-e)}function em(i,e,t){return i!==e?(t-i)/(e-i):0}function br(i,e,t){return(1-t)*i+t*e}function tm(i,e,t,n){return br(i,e,1-Math.exp(-t*n))}function nm(i,e=1){return e-Math.abs(Oc(i,e*2)-e)}function im(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function sm(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function rm(i,e){return i+Math.floor(Math.random()*(e-i+1))}function am(i,e){return i+Math.random()*(e-i)}function om(i){return i*(.5-Math.random())}function lm(i){i!==void 0&&(Gu=i);let e=Gu+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function cm(i){return i*Xs}function um(i){return i*Js}function dm(i){return(i&i-1)===0&&i!==0}function hm(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function fm(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function pm(i,e,t,n,s){const r=Math.cos,a=Math.sin,o=r(t/2),c=a(t/2),l=r((e+n)/2),h=a((e+n)/2),u=r((e-n)/2),d=a((e-n)/2),f=r((n-e)/2),g=a((n-e)/2);switch(s){case"XYX":i.set(o*h,c*u,c*d,o*l);break;case"YZY":i.set(c*d,o*h,c*u,o*l);break;case"ZXZ":i.set(c*u,c*d,o*h,o*l);break;case"XZX":i.set(o*h,c*g,c*f,o*l);break;case"YXY":i.set(c*f,o*h,c*g,o*l);break;case"ZYZ":i.set(c*g,c*f,o*h,o*l);break;default:Pe("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function En(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function nt(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}const Bn={DEG2RAD:Xs,RAD2DEG:Js,generateUUID:Rn,clamp:We,euclideanModulo:Oc,mapLinear:Qp,inverseLerp:em,lerp:br,damp:tm,pingpong:nm,smoothstep:im,smootherstep:sm,randInt:rm,randFloat:am,randFloatSpread:om,seededRandom:lm,degToRad:cm,radToDeg:um,isPowerOfTwo:dm,ceilPowerOfTwo:hm,floorPowerOfTwo:fm,setQuaternionFromProperEuler:pm,normalize:nt,denormalize:En},_u=class _u{constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=We(this.x,e.x,t.x),this.y=We(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=We(this.x,e,t),this.y=We(this.y,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(We(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(We(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*n-a*s+e.x,this.y=r*s+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};_u.prototype.isVector2=!0;let Se=_u;class Ot{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,a,o){let c=n[s+0],l=n[s+1],h=n[s+2],u=n[s+3],d=r[a+0],f=r[a+1],g=r[a+2],v=r[a+3];if(u!==v||c!==d||l!==f||h!==g){let m=c*d+l*f+h*g+u*v;m<0&&(d=-d,f=-f,g=-g,v=-v,m=-m);let p=1-o;if(m<.9995){const S=Math.acos(m),A=Math.sin(S);p=Math.sin(p*S)/A,o=Math.sin(o*S)/A,c=c*p+d*o,l=l*p+f*o,h=h*p+g*o,u=u*p+v*o}else{c=c*p+d*o,l=l*p+f*o,h=h*p+g*o,u=u*p+v*o;const S=1/Math.sqrt(c*c+l*l+h*h+u*u);c*=S,l*=S,h*=S,u*=S}}e[t]=c,e[t+1]=l,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,s,r,a){const o=n[s],c=n[s+1],l=n[s+2],h=n[s+3],u=r[a],d=r[a+1],f=r[a+2],g=r[a+3];return e[t]=o*g+h*u+c*f-l*d,e[t+1]=c*g+h*d+l*u-o*f,e[t+2]=l*g+h*f+o*d-c*u,e[t+3]=h*g-o*u-c*d-l*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,c=Math.sin,l=o(n/2),h=o(s/2),u=o(r/2),d=c(n/2),f=c(s/2),g=c(r/2);switch(a){case"XYZ":this._x=d*h*u+l*f*g,this._y=l*f*u-d*h*g,this._z=l*h*g+d*f*u,this._w=l*h*u-d*f*g;break;case"YXZ":this._x=d*h*u+l*f*g,this._y=l*f*u-d*h*g,this._z=l*h*g-d*f*u,this._w=l*h*u+d*f*g;break;case"ZXY":this._x=d*h*u-l*f*g,this._y=l*f*u+d*h*g,this._z=l*h*g+d*f*u,this._w=l*h*u-d*f*g;break;case"ZYX":this._x=d*h*u-l*f*g,this._y=l*f*u+d*h*g,this._z=l*h*g-d*f*u,this._w=l*h*u+d*f*g;break;case"YZX":this._x=d*h*u+l*f*g,this._y=l*f*u+d*h*g,this._z=l*h*g-d*f*u,this._w=l*h*u-d*f*g;break;case"XZY":this._x=d*h*u-l*f*g,this._y=l*f*u-d*h*g,this._z=l*h*g+d*f*u,this._w=l*h*u+d*f*g;break;default:Pe("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],s=t[4],r=t[8],a=t[1],o=t[5],c=t[9],l=t[2],h=t[6],u=t[10],d=n+o+u;if(d>0){const f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(h-c)*f,this._y=(r-l)*f,this._z=(a-s)*f}else if(n>o&&n>u){const f=2*Math.sqrt(1+n-o-u);this._w=(h-c)/f,this._x=.25*f,this._y=(s+a)/f,this._z=(r+l)/f}else if(o>u){const f=2*Math.sqrt(1+o-n-u);this._w=(r-l)/f,this._x=(s+a)/f,this._y=.25*f,this._z=(c+h)/f}else{const f=2*Math.sqrt(1+u-n-o);this._w=(a-s)/f,this._x=(r+l)/f,this._y=(c+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(We(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,s=e._y,r=e._z,a=e._w,o=t._x,c=t._y,l=t._z,h=t._w;return this._x=n*h+a*o+s*l-r*c,this._y=s*h+a*c+r*o-n*l,this._z=r*h+a*l+n*c-s*o,this._w=a*h-n*o-s*c-r*l,this._onChangeCallback(),this}slerp(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,s=-s,r=-r,a=-a,o=-o);let c=1-t;if(o<.9995){const l=Math.acos(o),h=Math.sin(l);c=Math.sin(c*l)/h,t=Math.sin(t*l)/h,this._x=this._x*c+n*t,this._y=this._y*c+s*t,this._z=this._z*c+r*t,this._w=this._w*c+a*t,this._onChangeCallback()}else this._x=this._x*c+n*t,this._y=this._y*c+s*t,this._z=this._z*c+r*t,this._w=this._w*c+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}const vu=class vu{constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Hu.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Hu.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(e){const t=this.x,n=this.y,s=this.z,r=e.x,a=e.y,o=e.z,c=e.w,l=2*(a*s-o*n),h=2*(o*t-r*s),u=2*(r*n-a*t);return this.x=t+c*l+a*u-o*h,this.y=n+c*h+o*l-r*u,this.z=s+c*u+r*h-a*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=We(this.x,e.x,t.x),this.y=We(this.y,e.y,t.y),this.z=We(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=We(this.x,e,t),this.y=We(this.y,e,t),this.z=We(this.z,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(We(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,s=e.y,r=e.z,a=t.x,o=t.y,c=t.z;return this.x=s*c-r*o,this.y=r*a-n*c,this.z=n*o-s*a,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return qo.copy(this).projectOnVector(e),this.sub(qo)}reflect(e){return this.sub(qo.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(We(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};vu.prototype.isVector3=!0;let N=vu;const qo=new N,Hu=new Ot,xu=class xu{constructor(e,t,n,s,r,a,o,c,l){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,c,l)}set(e,t,n,s,r,a,o,c,l){const h=this.elements;return h[0]=e,h[1]=s,h[2]=o,h[3]=t,h[4]=r,h[5]=c,h[6]=n,h[7]=a,h[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[3],c=n[6],l=n[1],h=n[4],u=n[7],d=n[2],f=n[5],g=n[8],v=s[0],m=s[3],p=s[6],S=s[1],A=s[4],y=s[7],T=s[2],E=s[5],w=s[8];return r[0]=a*v+o*S+c*T,r[3]=a*m+o*A+c*E,r[6]=a*p+o*y+c*w,r[1]=l*v+h*S+u*T,r[4]=l*m+h*A+u*E,r[7]=l*p+h*y+u*w,r[2]=d*v+f*S+g*T,r[5]=d*m+f*A+g*E,r[8]=d*p+f*y+g*w,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],c=e[6],l=e[7],h=e[8];return t*a*h-t*o*l-n*r*h+n*o*c+s*r*l-s*a*c}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],c=e[6],l=e[7],h=e[8],u=h*a-o*l,d=o*c-h*r,f=l*r-a*c,g=t*u+n*d+s*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const v=1/g;return e[0]=u*v,e[1]=(s*l-h*n)*v,e[2]=(o*n-s*a)*v,e[3]=d*v,e[4]=(h*t-s*c)*v,e[5]=(s*r-o*t)*v,e[6]=f*v,e[7]=(n*c-l*t)*v,e[8]=(a*t-n*r)*v,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,a,o){const c=Math.cos(r),l=Math.sin(r);return this.set(n*c,n*l,-n*(c*a+l*o)+a+e,-s*l,s*c,-s*(-l*a+c*o)+o+t,0,0,1),this}scale(e,t){return Ws("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply($o.makeScale(e,t)),this}rotate(e){return Ws("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply($o.makeRotation(-e)),this}translate(e,t){return Ws("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply($o.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}};xu.prototype.isMatrix3=!0;let ke=xu;const $o=new ke,Wu=new ke().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Xu=new ke().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function mm(){const i={enabled:!0,workingColorSpace:no,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===tt&&(s.r=di(s.r),s.g=di(s.g),s.b=di(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===tt&&(s.r=qs(s.r),s.g=qs(s.g),s.b=qs(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Di?io:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return Ws("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return Ws("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[no]:{primaries:e,whitePoint:n,transfer:io,toXYZ:Wu,fromXYZ:Xu,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:dt},outputColorSpaceConfig:{drawingBufferColorSpace:dt}},[dt]:{primaries:e,whitePoint:n,transfer:tt,toXYZ:Wu,fromXYZ:Xu,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:dt}}}),i}const qe=mm();function di(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function qs(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}let bs;class gm{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{bs===void 0&&(bs=Ir("canvas")),bs.width=e.width,bs.height=e.height;const s=bs.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=bs}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Ir("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=di(r[a]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(di(t[n]/255)*255):t[n]=di(t[n]);return{data:t,width:e.width,height:e.height}}else return Pe("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let _m=0;class Bc{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:_m++}),this.uuid=Rn(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(Yo(s[a].image)):r.push(Yo(s[a]))}else r=Yo(s);n.url=r}return t||(e.images[this.uuid]=n),n}}function Yo(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?gm.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(Pe("Texture: Unable to serialize Texture."),{})}let vm=0;const Ko=new N;class Vt extends Wi{constructor(e=Vt.DEFAULT_IMAGE,t=Vt.DEFAULT_MAPPING,n=ln,s=ln,r=Ct,a=ri,o=pn,c=on,l=Vt.DEFAULT_ANISOTROPY,h=Di){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:vm++}),this.uuid=Rn(),this.name="",this.source=new Bc(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=l,this.format=o,this.internalFormat=null,this.type=c,this.offset=new Se(0,0),this.repeat=new Se(1,1),this.center=new Se(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ke,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Ko).x}get height(){return this.source.getSize(Ko).y}get depth(){return this.source.getSize(Ko).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const n=e[t];if(n===void 0){Pe(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){Pe(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Ih)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case ns:e.x=e.x-Math.floor(e.x);break;case ln:e.x=e.x<0?0:1;break;case Gl:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case ns:e.y=e.y-Math.floor(e.y);break;case ln:e.y=e.y<0?0:1;break;case Gl:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Vt.DEFAULT_IMAGE=null;Vt.DEFAULT_MAPPING=Ih;Vt.DEFAULT_ANISOTROPY=1;const yu=class yu{constructor(e=0,t=0,n=0,s=1){this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*n+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r;const c=e.elements,l=c[0],h=c[4],u=c[8],d=c[1],f=c[5],g=c[9],v=c[2],m=c[6],p=c[10];if(Math.abs(h-d)<.01&&Math.abs(u-v)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+v)<.1&&Math.abs(g+m)<.1&&Math.abs(l+f+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const A=(l+1)/2,y=(f+1)/2,T=(p+1)/2,E=(h+d)/4,w=(u+v)/4,_=(g+m)/4;return A>y&&A>T?A<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(A),s=E/n,r=w/n):y>T?y<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(y),n=E/s,r=_/s):T<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(T),n=w/r,s=_/r),this.set(n,s,r,t),this}let S=Math.sqrt((m-g)*(m-g)+(u-v)*(u-v)+(d-h)*(d-h));return Math.abs(S)<.001&&(S=1),this.x=(m-g)/S,this.y=(u-v)/S,this.z=(d-h)/S,this.w=Math.acos((l+f+p-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=We(this.x,e.x,t.x),this.y=We(this.y,e.y,t.y),this.z=We(this.z,e.z,t.z),this.w=We(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=We(this.x,e,t),this.y=We(this.y,e,t),this.z=We(this.z,e,t),this.w=We(this.w,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(We(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};yu.prototype.isVector4=!0;let rt=yu;class xm extends Wi{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Ct,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new rt(0,0,e,t),this.scissorTest=!1,this.viewport=new rt(0,0,e,t),this.textures=[];const s={width:e,height:t,depth:n.depth},r=new Vt(s),a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){const t={minFilter:Ct,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const s=Object.assign({},e.textures[t].image);this.textures[t].source=new Bc(s)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}}class qn extends xm{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class Gh extends Vt{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=zt,this.minFilter=zt,this.wrapR=ln,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class ym extends Vt{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=zt,this.minFilter=zt,this.wrapR=ln,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const To=class To{constructor(e,t,n,s,r,a,o,c,l,h,u,d,f,g,v,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,c,l,h,u,d,f,g,v,m)}set(e,t,n,s,r,a,o,c,l,h,u,d,f,g,v,m){const p=this.elements;return p[0]=e,p[4]=t,p[8]=n,p[12]=s,p[1]=r,p[5]=a,p[9]=o,p[13]=c,p[2]=l,p[6]=h,p[10]=u,p[14]=d,p[3]=f,p[7]=g,p[11]=v,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new To().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();const t=this.elements,n=e.elements,s=1/Ms.setFromMatrixColumn(e,0).length(),r=1/Ms.setFromMatrixColumn(e,1).length(),a=1/Ms.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,s=e.y,r=e.z,a=Math.cos(n),o=Math.sin(n),c=Math.cos(s),l=Math.sin(s),h=Math.cos(r),u=Math.sin(r);if(e.order==="XYZ"){const d=a*h,f=a*u,g=o*h,v=o*u;t[0]=c*h,t[4]=-c*u,t[8]=l,t[1]=f+g*l,t[5]=d-v*l,t[9]=-o*c,t[2]=v-d*l,t[6]=g+f*l,t[10]=a*c}else if(e.order==="YXZ"){const d=c*h,f=c*u,g=l*h,v=l*u;t[0]=d+v*o,t[4]=g*o-f,t[8]=a*l,t[1]=a*u,t[5]=a*h,t[9]=-o,t[2]=f*o-g,t[6]=v+d*o,t[10]=a*c}else if(e.order==="ZXY"){const d=c*h,f=c*u,g=l*h,v=l*u;t[0]=d-v*o,t[4]=-a*u,t[8]=g+f*o,t[1]=f+g*o,t[5]=a*h,t[9]=v-d*o,t[2]=-a*l,t[6]=o,t[10]=a*c}else if(e.order==="ZYX"){const d=a*h,f=a*u,g=o*h,v=o*u;t[0]=c*h,t[4]=g*l-f,t[8]=d*l+v,t[1]=c*u,t[5]=v*l+d,t[9]=f*l-g,t[2]=-l,t[6]=o*c,t[10]=a*c}else if(e.order==="YZX"){const d=a*c,f=a*l,g=o*c,v=o*l;t[0]=c*h,t[4]=v-d*u,t[8]=g*u+f,t[1]=u,t[5]=a*h,t[9]=-o*h,t[2]=-l*h,t[6]=f*u+g,t[10]=d-v*u}else if(e.order==="XZY"){const d=a*c,f=a*l,g=o*c,v=o*l;t[0]=c*h,t[4]=-u,t[8]=l*h,t[1]=d*u+v,t[5]=a*h,t[9]=f*u-g,t[2]=g*u-f,t[6]=o*h,t[10]=v*u+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(bm,e,Mm)}lookAt(e,t,n){const s=this.elements;return sn.subVectors(e,t),sn.lengthSq()===0&&(sn.z=1),sn.normalize(),Si.crossVectors(n,sn),Si.lengthSq()===0&&(Math.abs(n.z)===1?sn.x+=1e-4:sn.z+=1e-4,sn.normalize(),Si.crossVectors(n,sn)),Si.normalize(),na.crossVectors(sn,Si),s[0]=Si.x,s[4]=na.x,s[8]=sn.x,s[1]=Si.y,s[5]=na.y,s[9]=sn.y,s[2]=Si.z,s[6]=na.z,s[10]=sn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[4],c=n[8],l=n[12],h=n[1],u=n[5],d=n[9],f=n[13],g=n[2],v=n[6],m=n[10],p=n[14],S=n[3],A=n[7],y=n[11],T=n[15],E=s[0],w=s[4],_=s[8],b=s[12],P=s[1],R=s[5],L=s[9],z=s[13],X=s[2],O=s[6],I=s[10],V=s[14],$=s[3],J=s[7],re=s[11],se=s[15];return r[0]=a*E+o*P+c*X+l*$,r[4]=a*w+o*R+c*O+l*J,r[8]=a*_+o*L+c*I+l*re,r[12]=a*b+o*z+c*V+l*se,r[1]=h*E+u*P+d*X+f*$,r[5]=h*w+u*R+d*O+f*J,r[9]=h*_+u*L+d*I+f*re,r[13]=h*b+u*z+d*V+f*se,r[2]=g*E+v*P+m*X+p*$,r[6]=g*w+v*R+m*O+p*J,r[10]=g*_+v*L+m*I+p*re,r[14]=g*b+v*z+m*V+p*se,r[3]=S*E+A*P+y*X+T*$,r[7]=S*w+A*R+y*O+T*J,r[11]=S*_+A*L+y*I+T*re,r[15]=S*b+A*z+y*V+T*se,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],a=e[1],o=e[5],c=e[9],l=e[13],h=e[2],u=e[6],d=e[10],f=e[14],g=e[3],v=e[7],m=e[11],p=e[15],S=c*f-l*d,A=o*f-l*u,y=o*d-c*u,T=a*f-l*h,E=a*d-c*h,w=a*u-o*h;return t*(v*S-m*A+p*y)-n*(g*S-m*T+p*E)+s*(g*A-v*T+p*w)-r*(g*y-v*E+m*w)}determinantAffine(){const e=this.elements,t=e[0],n=e[4],s=e[8],r=e[1],a=e[5],o=e[9],c=e[2],l=e[6],h=e[10];return t*(a*h-o*l)-n*(r*h-o*c)+s*(r*l-a*c)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],c=e[6],l=e[7],h=e[8],u=e[9],d=e[10],f=e[11],g=e[12],v=e[13],m=e[14],p=e[15],S=t*o-n*a,A=t*c-s*a,y=t*l-r*a,T=n*c-s*o,E=n*l-r*o,w=s*l-r*c,_=h*v-u*g,b=h*m-d*g,P=h*p-f*g,R=u*m-d*v,L=u*p-f*v,z=d*p-f*m,X=S*z-A*L+y*R+T*P-E*b+w*_;if(X===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const O=1/X;return e[0]=(o*z-c*L+l*R)*O,e[1]=(s*L-n*z-r*R)*O,e[2]=(v*w-m*E+p*T)*O,e[3]=(d*E-u*w-f*T)*O,e[4]=(c*P-a*z-l*b)*O,e[5]=(t*z-s*P+r*b)*O,e[6]=(m*y-g*w-p*A)*O,e[7]=(h*w-d*y+f*A)*O,e[8]=(a*L-o*P+l*_)*O,e[9]=(n*P-t*L-r*_)*O,e[10]=(g*E-v*y+p*S)*O,e[11]=(u*y-h*E-f*S)*O,e[12]=(o*b-a*R-c*_)*O,e[13]=(t*R-n*b+s*_)*O,e[14]=(v*A-g*T-m*S)*O,e[15]=(h*T-u*A+d*S)*O,this}scale(e){const t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),s=Math.sin(t),r=1-n,a=e.x,o=e.y,c=e.z,l=r*a,h=r*o;return this.set(l*a+n,l*o-s*c,l*c+s*o,0,l*o+s*c,h*o+n,h*c-s*a,0,l*c-s*o,h*c+s*a,r*c*c+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,a){return this.set(1,n,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){const s=this.elements,r=t._x,a=t._y,o=t._z,c=t._w,l=r+r,h=a+a,u=o+o,d=r*l,f=r*h,g=r*u,v=a*h,m=a*u,p=o*u,S=c*l,A=c*h,y=c*u,T=n.x,E=n.y,w=n.z;return s[0]=(1-(v+p))*T,s[1]=(f+y)*T,s[2]=(g-A)*T,s[3]=0,s[4]=(f-y)*E,s[5]=(1-(d+p))*E,s[6]=(m+S)*E,s[7]=0,s[8]=(g+A)*w,s[9]=(m-S)*w,s[10]=(1-(d+v))*w,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){const s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];const r=this.determinantAffine();if(r===0)return n.set(1,1,1),t.identity(),this;let a=Ms.set(s[0],s[1],s[2]).length();const o=Ms.set(s[4],s[5],s[6]).length(),c=Ms.set(s[8],s[9],s[10]).length();r<0&&(a=-a),vn.copy(this);const l=1/a,h=1/o,u=1/c;return vn.elements[0]*=l,vn.elements[1]*=l,vn.elements[2]*=l,vn.elements[4]*=h,vn.elements[5]*=h,vn.elements[6]*=h,vn.elements[8]*=u,vn.elements[9]*=u,vn.elements[10]*=u,t.setFromRotationMatrix(vn),n.x=a,n.y=o,n.z=c,this}makePerspective(e,t,n,s,r,a,o=Hn,c=!1){const l=this.elements,h=2*r/(t-e),u=2*r/(n-s),d=(t+e)/(t-e),f=(n+s)/(n-s);let g,v;if(c)g=r/(a-r),v=a*r/(a-r);else if(o===Hn)g=-(a+r)/(a-r),v=-2*a*r/(a-r);else if(o===Nr)g=-a/(a-r),v=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=h,l[4]=0,l[8]=d,l[12]=0,l[1]=0,l[5]=u,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=g,l[14]=v,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,s,r,a,o=Hn,c=!1){const l=this.elements,h=2/(t-e),u=2/(n-s),d=-(t+e)/(t-e),f=-(n+s)/(n-s);let g,v;if(c)g=1/(a-r),v=a/(a-r);else if(o===Hn)g=-2/(a-r),v=-(a+r)/(a-r);else if(o===Nr)g=-1/(a-r),v=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=h,l[4]=0,l[8]=0,l[12]=d,l[1]=0,l[5]=u,l[9]=0,l[13]=f,l[2]=0,l[6]=0,l[10]=g,l[14]=v,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}};To.prototype.isMatrix4=!0;let Oe=To;const Ms=new N,vn=new Oe,bm=new N(0,0,0),Mm=new N(1,1,1),Si=new N,na=new N,sn=new N,qu=new Oe,$u=new Ot;class _n{constructor(e=0,t=0,n=0,s=_n.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const s=e.elements,r=s[0],a=s[4],o=s[8],c=s[1],l=s[5],h=s[9],u=s[2],d=s[6],f=s[10];switch(t){case"XYZ":this._y=Math.asin(We(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(d,l),this._z=0);break;case"YXZ":this._x=Math.asin(-We(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(We(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,l)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-We(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-a,l));break;case"YZX":this._z=Math.asin(We(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-h,l),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(o,f));break;case"XZY":this._z=Math.asin(-We(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,l),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,f),this._y=0);break;default:Pe("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return qu.makeRotationFromQuaternion(e),this.setFromRotationMatrix(qu,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return $u.setFromEuler(this),this.setFromQuaternion($u,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}_n.DEFAULT_ORDER="XYZ";class Hh{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let Sm=0;const Yu=new N,Ss=new Ot,Zn=new Oe,ia=new N,ar=new N,Em=new N,Tm=new Ot,Ku=new N(1,0,0),Zu=new N(0,1,0),Ju=new N(0,0,1),ju={type:"added"},Am={type:"removed"},Es={type:"childadded",child:null},Zo={type:"childremoved",child:null};class pt extends Wi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Sm++}),this.uuid=Rn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=pt.DEFAULT_UP.clone();const e=new N,t=new _n,n=new Ot,s=new N(1,1,1);function r(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Oe},normalMatrix:{value:new ke}}),this.matrix=new Oe,this.matrixWorld=new Oe,this.matrixAutoUpdate=pt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=pt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Hh,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Ss.setFromAxisAngle(e,t),this.quaternion.multiply(Ss),this}rotateOnWorldAxis(e,t){return Ss.setFromAxisAngle(e,t),this.quaternion.premultiply(Ss),this}rotateX(e){return this.rotateOnAxis(Ku,e)}rotateY(e){return this.rotateOnAxis(Zu,e)}rotateZ(e){return this.rotateOnAxis(Ju,e)}translateOnAxis(e,t){return Yu.copy(e).applyQuaternion(this.quaternion),this.position.add(Yu.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Ku,e)}translateY(e){return this.translateOnAxis(Zu,e)}translateZ(e){return this.translateOnAxis(Ju,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Zn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?ia.copy(e):ia.set(e,t,n);const s=this.parent;this.updateWorldMatrix(!0,!1),ar.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Zn.lookAt(ar,ia,this.up):Zn.lookAt(ia,ar,this.up),this.quaternion.setFromRotationMatrix(Zn),s&&(Zn.extractRotation(s.matrixWorld),Ss.setFromRotationMatrix(Zn),this.quaternion.premultiply(Ss.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(He("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(ju),Es.child=e,this.dispatchEvent(Es),Es.child=null):He("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Am),Zo.child=e,this.dispatchEvent(Zo),Zo.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Zn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Zn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Zn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(ju),Es.child=e,this.dispatchEvent(Es),Es.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){const a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ar,e,Em),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ar,Tm,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);const e=this.pivot;if(e!==null){const t=e.x,n=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*n-r[8]*s,r[13]+=n-r[1]*t-r[5]*n-r[9]*s,r[14]+=s-r[2]*t-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){const s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){const r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,n)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),this.static!==!1&&(s.static=this.static),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,c){return o[c.uuid]===void 0&&(o[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const c=o.shapes;if(Array.isArray(c))for(let l=0,h=c.length;l<h;l++){const u=c[l];r(e.shapes,u)}else r(e.shapes,c)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let c=0,l=this.material.length;c<l;c++)o.push(r(e.materials,this.material[c]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){const c=this.animations[o];s.animations.push(r(e.animations,c))}}if(t){const o=a(e.geometries),c=a(e.materials),l=a(e.textures),h=a(e.images),u=a(e.shapes),d=a(e.skeletons),f=a(e.animations),g=a(e.nodes);o.length>0&&(n.geometries=o),c.length>0&&(n.materials=c),l.length>0&&(n.textures=l),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),d.length>0&&(n.skeletons=d),f.length>0&&(n.animations=f),g.length>0&&(n.nodes=g)}return n.object=s,n;function a(o){const c=[];for(const l in o){const h=o[l];delete h.metadata,c.push(h)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const s=e.children[n];this.add(s.clone())}return this}}pt.DEFAULT_UP=new N(0,1,0);pt.DEFAULT_MATRIX_AUTO_UPDATE=!0;pt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class wn extends pt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const wm={type:"move"};class Jo{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new wn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new wn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new N,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new N),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new wn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new N,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new N,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,a=null;const o=this._targetRay,c=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){a=!0;for(const v of e.hand.values()){const m=t.getJointPose(v,n),p=this._getHandJoint(l,v);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}const h=l.joints["index-finger-tip"],u=l.joints["thumb-tip"],d=h.position.distanceTo(u.position),f=.02,g=.005;l.inputState.pinching&&d>f+g?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&d<=f-g&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1,c.eventsEnabled&&c.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(wm)))}return o!==null&&(o.visible=s!==null),c!==null&&(c.visible=r!==null),l!==null&&(l.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new wn;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}const Wh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ei={h:0,s:0,l:0},sa={h:0,s:0,l:0};function jo(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}class Ue{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=dt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,qe.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=qe.workingColorSpace){return this.r=e,this.g=t,this.b=n,qe.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=qe.workingColorSpace){if(e=Oc(e,1),t=We(t,0,1),n=We(n,0,1),t===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+t):n+t-n*t,a=2*n-r;this.r=jo(a,r,e+1/3),this.g=jo(a,r,e),this.b=jo(a,r,e-1/3)}return qe.colorSpaceToWorking(this,s),this}setStyle(e,t=dt){function n(r){r!==void 0&&parseFloat(r)<1&&Pe("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:Pe("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);Pe("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=dt){const n=Wh[e.toLowerCase()];return n!==void 0?this.setHex(n,t):Pe("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=di(e.r),this.g=di(e.g),this.b=di(e.b),this}copyLinearToSRGB(e){return this.r=qs(e.r),this.g=qs(e.g),this.b=qs(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=dt){return qe.workingToColorSpace(Xt.copy(this),e),Math.round(We(Xt.r*255,0,255))*65536+Math.round(We(Xt.g*255,0,255))*256+Math.round(We(Xt.b*255,0,255))}getHexString(e=dt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=qe.workingColorSpace){qe.workingToColorSpace(Xt.copy(this),t);const n=Xt.r,s=Xt.g,r=Xt.b,a=Math.max(n,s,r),o=Math.min(n,s,r);let c,l;const h=(o+a)/2;if(o===a)c=0,l=0;else{const u=a-o;switch(l=h<=.5?u/(a+o):u/(2-a-o),a){case n:c=(s-r)/u+(s<r?6:0);break;case s:c=(r-n)/u+2;break;case r:c=(n-s)/u+4;break}c/=6}return e.h=c,e.s=l,e.l=h,e}getRGB(e,t=qe.workingColorSpace){return qe.workingToColorSpace(Xt.copy(this),t),e.r=Xt.r,e.g=Xt.g,e.b=Xt.b,e}getStyle(e=dt){qe.workingToColorSpace(Xt.copy(this),e);const t=Xt.r,n=Xt.g,s=Xt.b;return e!==dt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(Ei),this.setHSL(Ei.h+e,Ei.s+t,Ei.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Ei),e.getHSL(sa);const n=br(Ei.h,sa.h,t),s=br(Ei.s,sa.s,t),r=br(Ei.l,sa.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Xt=new Ue;Ue.NAMES=Wh;class kc extends pt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new _n,this.environmentIntensity=1,this.environmentRotation=new _n,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}const xn=new N,Jn=new N,Qo=new N,jn=new N,Ts=new N,As=new N,Qu=new N,el=new N,tl=new N,nl=new N,il=new rt,sl=new rt,rl=new rt;class Qt{constructor(e=new N,t=new N,n=new N){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),xn.subVectors(e,t),s.cross(xn);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){xn.subVectors(s,t),Jn.subVectors(n,t),Qo.subVectors(e,t);const a=xn.dot(xn),o=xn.dot(Jn),c=xn.dot(Qo),l=Jn.dot(Jn),h=Jn.dot(Qo),u=a*l-o*o;if(u===0)return r.set(0,0,0),null;const d=1/u,f=(l*c-o*h)*d,g=(a*h-o*c)*d;return r.set(1-f-g,g,f)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,jn)===null?!1:jn.x>=0&&jn.y>=0&&jn.x+jn.y<=1}static getInterpolation(e,t,n,s,r,a,o,c){return this.getBarycoord(e,t,n,s,jn)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,jn.x),c.addScaledVector(a,jn.y),c.addScaledVector(o,jn.z),c)}static getInterpolatedAttribute(e,t,n,s,r,a){return il.setScalar(0),sl.setScalar(0),rl.setScalar(0),il.fromBufferAttribute(e,t),sl.fromBufferAttribute(e,n),rl.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector(il,r.x),a.addScaledVector(sl,r.y),a.addScaledVector(rl,r.z),a}static isFrontFacing(e,t,n,s){return xn.subVectors(n,t),Jn.subVectors(e,t),xn.cross(Jn).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return xn.subVectors(this.c,this.b),Jn.subVectors(this.a,this.b),xn.cross(Jn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return Qt.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return Qt.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return Qt.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return Qt.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return Qt.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,s=this.b,r=this.c;let a,o;Ts.subVectors(s,n),As.subVectors(r,n),el.subVectors(e,n);const c=Ts.dot(el),l=As.dot(el);if(c<=0&&l<=0)return t.copy(n);tl.subVectors(e,s);const h=Ts.dot(tl),u=As.dot(tl);if(h>=0&&u<=h)return t.copy(s);const d=c*u-h*l;if(d<=0&&c>=0&&h<=0)return a=c/(c-h),t.copy(n).addScaledVector(Ts,a);nl.subVectors(e,r);const f=Ts.dot(nl),g=As.dot(nl);if(g>=0&&f<=g)return t.copy(r);const v=f*l-c*g;if(v<=0&&l>=0&&g<=0)return o=l/(l-g),t.copy(n).addScaledVector(As,o);const m=h*g-f*u;if(m<=0&&u-h>=0&&f-g>=0)return Qu.subVectors(r,s),o=(u-h)/(u-h+(f-g)),t.copy(s).addScaledVector(Qu,o);const p=1/(m+v+d);return a=v*p,o=d*p,t.copy(n).addScaledVector(Ts,a).addScaledVector(As,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}class ps{constructor(e=new N(1/0,1/0,1/0),t=new N(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(yn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(yn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=yn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,yn):yn.fromBufferAttribute(r,a),yn.applyMatrix4(e.matrixWorld),this.expandByPoint(yn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),ra.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),ra.copy(n.boundingBox)),ra.applyMatrix4(e.matrixWorld),this.union(ra)}const s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,yn),yn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(or),aa.subVectors(this.max,or),ws.subVectors(e.a,or),Rs.subVectors(e.b,or),Cs.subVectors(e.c,or),Ti.subVectors(Rs,ws),Ai.subVectors(Cs,Rs),$i.subVectors(ws,Cs);let t=[0,-Ti.z,Ti.y,0,-Ai.z,Ai.y,0,-$i.z,$i.y,Ti.z,0,-Ti.x,Ai.z,0,-Ai.x,$i.z,0,-$i.x,-Ti.y,Ti.x,0,-Ai.y,Ai.x,0,-$i.y,$i.x,0];return!al(t,ws,Rs,Cs,aa)||(t=[1,0,0,0,1,0,0,0,1],!al(t,ws,Rs,Cs,aa))?!1:(oa.crossVectors(Ti,Ai),t=[oa.x,oa.y,oa.z],al(t,ws,Rs,Cs,aa))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,yn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(yn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Qn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Qn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Qn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Qn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Qn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Qn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Qn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Qn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Qn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const Qn=[new N,new N,new N,new N,new N,new N,new N,new N],yn=new N,ra=new ps,ws=new N,Rs=new N,Cs=new N,Ti=new N,Ai=new N,$i=new N,or=new N,aa=new N,oa=new N,Yi=new N;function al(i,e,t,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){Yi.fromArray(i,r);const o=s.x*Math.abs(Yi.x)+s.y*Math.abs(Yi.y)+s.z*Math.abs(Yi.z),c=e.dot(Yi),l=t.dot(Yi),h=n.dot(Yi);if(Math.max(-Math.max(c,l,h),Math.min(c,l,h))>o)return!1}return!0}const Tt=new N,la=new Se;let Rm=0;class tn extends Wi{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Rm++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=bc,this.updateRanges=[],this.gpuType=An,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)la.fromBufferAttribute(this,t),la.applyMatrix3(e),this.setXY(t,la.x,la.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Tt.fromBufferAttribute(this,t),Tt.applyMatrix3(e),this.setXYZ(t,Tt.x,Tt.y,Tt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Tt.fromBufferAttribute(this,t),Tt.applyMatrix4(e),this.setXYZ(t,Tt.x,Tt.y,Tt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Tt.fromBufferAttribute(this,t),Tt.applyNormalMatrix(e),this.setXYZ(t,Tt.x,Tt.y,Tt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Tt.fromBufferAttribute(this,t),Tt.transformDirection(e),this.setXYZ(t,Tt.x,Tt.y,Tt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=En(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=nt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=En(t,this.array)),t}setX(e,t){return this.normalized&&(t=nt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=En(t,this.array)),t}setY(e,t){return this.normalized&&(t=nt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=En(t,this.array)),t}setZ(e,t){return this.normalized&&(t=nt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=En(t,this.array)),t}setW(e,t){return this.normalized&&(t=nt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=nt(t,this.array),n=nt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=nt(t,this.array),n=nt(n,this.array),s=nt(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=nt(t,this.array),n=nt(n,this.array),s=nt(s,this.array),r=nt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==bc&&(e.usage=this.usage),e}dispose(){this.dispatchEvent({type:"dispose"})}}class Xh extends tn{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class qh extends tn{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class Ye extends tn{constructor(e,t,n){super(new Float32Array(e),t,n)}}const Cm=new ps,lr=new N,ol=new N;class tr{constructor(e=new N,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):Cm.setFromPoints(e).getCenter(n);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;lr.subVectors(e,this.center);const t=lr.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(lr,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(ol.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(lr.copy(e.center).add(ol)),this.expandByPoint(lr.copy(e.center).sub(ol))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}let Pm=0;const dn=new Oe,ll=new pt,Ps=new N,rn=new ps,cr=new ps,It=new N;class mt extends Wi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Pm++}),this.uuid=Rn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Yp(e)?qh:Xh)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new ke().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return dn.makeRotationFromQuaternion(e),this.applyMatrix4(dn),this}rotateX(e){return dn.makeRotationX(e),this.applyMatrix4(dn),this}rotateY(e){return dn.makeRotationY(e),this.applyMatrix4(dn),this}rotateZ(e){return dn.makeRotationZ(e),this.applyMatrix4(dn),this}translate(e,t,n){return dn.makeTranslation(e,t,n),this.applyMatrix4(dn),this}scale(e,t,n){return dn.makeScale(e,t,n),this.applyMatrix4(dn),this}lookAt(e){return ll.lookAt(e),ll.updateMatrix(),this.applyMatrix4(ll.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ps).negate(),this.translate(Ps.x,Ps.y,Ps.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const n=[];for(let s=0,r=e.length;s<r;s++){const a=e[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new Ye(n,3))}else{const n=Math.min(e.length,t.count);for(let s=0;s<n;s++){const r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&Pe("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new ps);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){He("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new N(-1/0,-1/0,-1/0),new N(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){const r=t[n];rn.setFromBufferAttribute(r),this.morphTargetsRelative?(It.addVectors(this.boundingBox.min,rn.min),this.boundingBox.expandByPoint(It),It.addVectors(this.boundingBox.max,rn.max),this.boundingBox.expandByPoint(It)):(this.boundingBox.expandByPoint(rn.min),this.boundingBox.expandByPoint(rn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&He('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new tr);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){He("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new N,1/0);return}if(e){const n=this.boundingSphere.center;if(rn.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){const o=t[r];cr.setFromBufferAttribute(o),this.morphTargetsRelative?(It.addVectors(rn.min,cr.min),rn.expandByPoint(It),It.addVectors(rn.max,cr.max),rn.expandByPoint(It)):(rn.expandByPoint(cr.min),rn.expandByPoint(cr.max))}rn.getCenter(n);let s=0;for(let r=0,a=e.count;r<a;r++)It.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(It));if(t)for(let r=0,a=t.length;r<a;r++){const o=t[r],c=this.morphTargetsRelative;for(let l=0,h=o.count;l<h;l++)It.fromBufferAttribute(o,l),c&&(Ps.fromBufferAttribute(e,l),It.add(Ps)),s=Math.max(s,n.distanceToSquared(It))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&He('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){He("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,s=t.normal,r=t.uv;let a=this.getAttribute("tangent");(a===void 0||a.count!==n.count)&&(a=new tn(new Float32Array(4*n.count),4),this.setAttribute("tangent",a));const o=[],c=[];for(let _=0;_<n.count;_++)o[_]=new N,c[_]=new N;const l=new N,h=new N,u=new N,d=new Se,f=new Se,g=new Se,v=new N,m=new N;function p(_,b,P){l.fromBufferAttribute(n,_),h.fromBufferAttribute(n,b),u.fromBufferAttribute(n,P),d.fromBufferAttribute(r,_),f.fromBufferAttribute(r,b),g.fromBufferAttribute(r,P),h.sub(l),u.sub(l),f.sub(d),g.sub(d);const R=1/(f.x*g.y-g.x*f.y);isFinite(R)&&(v.copy(h).multiplyScalar(g.y).addScaledVector(u,-f.y).multiplyScalar(R),m.copy(u).multiplyScalar(f.x).addScaledVector(h,-g.x).multiplyScalar(R),o[_].add(v),o[b].add(v),o[P].add(v),c[_].add(m),c[b].add(m),c[P].add(m))}let S=this.groups;S.length===0&&(S=[{start:0,count:e.count}]);for(let _=0,b=S.length;_<b;++_){const P=S[_],R=P.start,L=P.count;for(let z=R,X=R+L;z<X;z+=3)p(e.getX(z+0),e.getX(z+1),e.getX(z+2))}const A=new N,y=new N,T=new N,E=new N;function w(_){T.fromBufferAttribute(s,_),E.copy(T);const b=o[_];A.copy(b),A.sub(T.multiplyScalar(T.dot(b))).normalize(),y.crossVectors(E,b);const R=y.dot(c[_])<0?-1:1;a.setXYZW(_,A.x,A.y,A.z,R)}for(let _=0,b=S.length;_<b;++_){const P=S[_],R=P.start,L=P.count;for(let z=R,X=R+L;z<X;z+=3)w(e.getX(z+0)),w(e.getX(z+1)),w(e.getX(z+2))}this._transformed=!0}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==t.count)n=new tn(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let d=0,f=n.count;d<f;d++)n.setXYZ(d,0,0,0);const s=new N,r=new N,a=new N,o=new N,c=new N,l=new N,h=new N,u=new N;if(e)for(let d=0,f=e.count;d<f;d+=3){const g=e.getX(d+0),v=e.getX(d+1),m=e.getX(d+2);s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,v),a.fromBufferAttribute(t,m),h.subVectors(a,r),u.subVectors(s,r),h.cross(u),o.fromBufferAttribute(n,g),c.fromBufferAttribute(n,v),l.fromBufferAttribute(n,m),o.add(h),c.add(h),l.add(h),n.setXYZ(g,o.x,o.y,o.z),n.setXYZ(v,c.x,c.y,c.z),n.setXYZ(m,l.x,l.y,l.z)}else for(let d=0,f=t.count;d<f;d+=3)s.fromBufferAttribute(t,d+0),r.fromBufferAttribute(t,d+1),a.fromBufferAttribute(t,d+2),h.subVectors(a,r),u.subVectors(s,r),h.cross(u),n.setXYZ(d+0,h.x,h.y,h.z),n.setXYZ(d+1,h.x,h.y,h.z),n.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)It.fromBufferAttribute(e,t),It.normalize(),e.setXYZ(t,It.x,It.y,It.z)}toNonIndexed(){function e(o,c){const l=o.array,h=o.itemSize,u=o.normalized,d=new l.constructor(c.length*h);let f=0,g=0;for(let v=0,m=c.length;v<m;v++){o.isInterleavedBufferAttribute?f=c[v]*o.data.stride+o.offset:f=c[v]*h;for(let p=0;p<h;p++)d[g++]=l[f++]}return new tn(d,h,u)}if(this.index===null)return Pe("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new mt,n=this.index.array,s=this.attributes;for(const o in s){const c=s[o],l=e(c,n);t.setAttribute(o,l)}const r=this.morphAttributes;for(const o in r){const c=[],l=r[o];for(let h=0,u=l.length;h<u;h++){const d=l[h],f=e(d,n);c.push(f)}t.morphAttributes[o]=c}t.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,c=a.length;o<c;o++){const l=a[o];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){const c=this.parameters;for(const l in c)c[l]!==void 0&&(e[l]=c[l]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const c in n){const l=n[c];e.data.attributes[c]=l.toJSON(e.data)}const s={};let r=!1;for(const c in this.morphAttributes){const l=this.morphAttributes[c],h=[];for(let u=0,d=l.length;u<d;u++){const f=l[u];h.push(f.toJSON(e.data))}h.length>0&&(s[c]=h,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone());const s=e.attributes;for(const l in s){const h=s[l];this.setAttribute(l,h.clone(t))}const r=e.morphAttributes;for(const l in r){const h=[],u=r[l];for(let d=0,f=u.length;d<f;d++)h.push(u[d].clone(t));this.morphAttributes[l]=h}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let l=0,h=a.length;l<h;l++){const u=a[l];this.addGroup(u.start,u.count,u.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Lm{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=bc,this.updateRanges=[],this.version=0,this.uuid=Rn()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let s=0,r=this.stride;s<r;s++)this.array[e+s]=t.array[n+s];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Rn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Rn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const $t=new N;class ro{constructor(e,t,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)$t.fromBufferAttribute(this,t),$t.applyMatrix4(e),this.setXYZ(t,$t.x,$t.y,$t.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)$t.fromBufferAttribute(this,t),$t.applyNormalMatrix(e),this.setXYZ(t,$t.x,$t.y,$t.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)$t.fromBufferAttribute(this,t),$t.transformDirection(e),this.setXYZ(t,$t.x,$t.y,$t.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=En(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=nt(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=nt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=nt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=nt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=nt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=En(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=En(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=En(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=En(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=nt(t,this.array),n=nt(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=nt(t,this.array),n=nt(n,this.array),s=nt(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=nt(t,this.array),n=nt(n,this.array),s=nt(s,this.array),r=nt(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this.data.array[e+3]=r,this}clone(e){if(e===void 0){so("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return new tn(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new ro(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){so("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}let Nm=0;class xi extends Wi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Nm++}),this.uuid=Rn(),this.name="",this.type="Material",this.blending=Hs,this.side=mi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Il,this.blendDst=Dl,this.blendEquation=Qi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ue(0,0,0),this.blendAlpha=0,this.depthFunc=Ks,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=ku,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=ys,this.stencilZFail=ys,this.stencilZPass=ys,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){Pe(`Material: parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){Pe(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Hs&&(n.blending=this.blending),this.side!==mi&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Il&&(n.blendSrc=this.blendSrc),this.blendDst!==Dl&&(n.blendDst=this.blendDst),this.blendEquation!==Qi&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Ks&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==ku&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==ys&&(n.stencilFail=this.stencilFail),this.stencilZFail!==ys&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==ys&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.allowOverride===!1&&(n.allowOverride=!1),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){const a=[];for(const o in r){const c=r[o];delete c.metadata,a.push(c)}return a}if(t){const r=s(e.textures),a=s(e.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Ue().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let n=e.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new Se().fromArray(n)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Se().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class $h extends xi{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new Ue(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}let Ls;const ur=new N,Ns=new N,Is=new N,Ds=new Se,dr=new Se,Yh=new Oe,ca=new N,hr=new N,ua=new N,ed=new Se,cl=new Se,td=new Se;class Im extends pt{constructor(e=new $h){if(super(),this.isSprite=!0,this.type="Sprite",Ls===void 0){Ls=new mt;const t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new Lm(t,5);Ls.setIndex([0,1,2,0,2,3]),Ls.setAttribute("position",new ro(n,3,0,!1)),Ls.setAttribute("uv",new ro(n,2,3,!1))}this.geometry=Ls,this.material=e,this.center=new Se(.5,.5),this.count=1}raycast(e,t){e.camera===null&&He('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Ns.setFromMatrixScale(this.matrixWorld),Yh.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),Is.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Ns.multiplyScalar(-Is.z);const n=this.material.rotation;let s,r;n!==0&&(r=Math.cos(n),s=Math.sin(n));const a=this.center;da(ca.set(-.5,-.5,0),Is,a,Ns,s,r),da(hr.set(.5,-.5,0),Is,a,Ns,s,r),da(ua.set(.5,.5,0),Is,a,Ns,s,r),ed.set(0,0),cl.set(1,0),td.set(1,1);let o=e.ray.intersectTriangle(ca,hr,ua,!1,ur);if(o===null&&(da(hr.set(-.5,.5,0),Is,a,Ns,s,r),cl.set(0,1),o=e.ray.intersectTriangle(ca,ua,hr,!1,ur),o===null))return;const c=e.ray.origin.distanceTo(ur);c<e.near||c>e.far||t.push({distance:c,point:ur.clone(),uv:Qt.getInterpolation(ur,ca,hr,ua,ed,cl,td,new Se),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}}function da(i,e,t,n,s,r){Ds.subVectors(i,t).addScalar(.5).multiply(n),s!==void 0?(dr.x=r*Ds.x-s*Ds.y,dr.y=s*Ds.x+r*Ds.y):dr.copy(Ds),i.copy(e),i.x+=dr.x,i.y+=dr.y,i.applyMatrix4(Yh)}const ei=new N,ul=new N,ha=new N,wi=new N,dl=new N,fa=new N,hl=new N;class Ro{constructor(e=new N,t=new N(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,ei)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=ei.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(ei.copy(this.origin).addScaledVector(this.direction,t),ei.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){ul.copy(e).add(t).multiplyScalar(.5),ha.copy(t).sub(e).normalize(),wi.copy(this.origin).sub(ul);const r=e.distanceTo(t)*.5,a=-this.direction.dot(ha),o=wi.dot(this.direction),c=-wi.dot(ha),l=wi.lengthSq(),h=Math.abs(1-a*a);let u,d,f,g;if(h>0)if(u=a*c-o,d=a*o-c,g=r*h,u>=0)if(d>=-g)if(d<=g){const v=1/h;u*=v,d*=v,f=u*(u+a*d+2*o)+d*(a*u+d+2*c)+l}else d=r,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*c)+l;else d=-r,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*c)+l;else d<=-g?(u=Math.max(0,-(-a*r+o)),d=u>0?-r:Math.min(Math.max(-r,-c),r),f=-u*u+d*(d+2*c)+l):d<=g?(u=0,d=Math.min(Math.max(-r,-c),r),f=d*(d+2*c)+l):(u=Math.max(0,-(a*r+o)),d=u>0?r:Math.min(Math.max(-r,-c),r),f=-u*u+d*(d+2*c)+l);else d=a>0?-r:r,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*c)+l;return n&&n.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(ul).addScaledVector(ha,d),f}intersectSphere(e,t){ei.subVectors(e.center,this.origin);const n=ei.dot(this.direction),s=ei.dot(ei)-n*n,r=e.radius*e.radius;if(s>r)return null;const a=Math.sqrt(r-s),o=n-a,c=n+a;return c<0?null:o<0?this.at(c,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,a,o,c;const l=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return l>=0?(n=(e.min.x-d.x)*l,s=(e.max.x-d.x)*l):(n=(e.max.x-d.x)*l,s=(e.min.x-d.x)*l),h>=0?(r=(e.min.y-d.y)*h,a=(e.max.y-d.y)*h):(r=(e.max.y-d.y)*h,a=(e.min.y-d.y)*h),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),u>=0?(o=(e.min.z-d.z)*u,c=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,c=(e.min.z-d.z)*u),n>c||o>s)||((o>n||n!==n)&&(n=o),(c<s||s!==s)&&(s=c),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,ei)!==null}intersectTriangle(e,t,n,s,r){dl.subVectors(t,e),fa.subVectors(n,e),hl.crossVectors(dl,fa);let a=this.direction.dot(hl),o;if(a>0){if(s)return null;o=1}else if(a<0)o=-1,a=-a;else return null;wi.subVectors(this.origin,e);const c=o*this.direction.dot(fa.crossVectors(wi,fa));if(c<0)return null;const l=o*this.direction.dot(dl.cross(wi));if(l<0||c+l>a)return null;const h=-o*wi.dot(hl);return h<0?null:this.at(h/a,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class cs extends xi{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ue(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new _n,this.combine=Ao,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const nd=new Oe,Ki=new Ro,pa=new tr,id=new N,ma=new N,ga=new N,_a=new N,fl=new N,va=new N,sd=new N,xa=new N;class ft extends pt{constructor(e=new mt,t=new cs){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){const n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(s,e);const o=this.morphTargetInfluences;if(r&&o){va.set(0,0,0);for(let c=0,l=r.length;c<l;c++){const h=o[c],u=r[c];h!==0&&(fl.fromBufferAttribute(u,e),a?va.addScaledVector(fl,h):va.addScaledVector(fl.sub(t),h))}t.add(va)}return t}raycast(e,t){const n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),pa.copy(n.boundingSphere),pa.applyMatrix4(r),Ki.copy(e.ray).recast(e.near),!(pa.containsPoint(Ki.origin)===!1&&(Ki.intersectSphere(pa,id)===null||Ki.origin.distanceToSquared(id)>(e.far-e.near)**2))&&(nd.copy(r).invert(),Ki.copy(e.ray).applyMatrix4(nd),!(n.boundingBox!==null&&Ki.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Ki)))}_computeIntersections(e,t,n){let s;const r=this.geometry,a=this.material,o=r.index,c=r.attributes.position,l=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,d=r.groups,f=r.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,v=d.length;g<v;g++){const m=d[g],p=a[m.materialIndex],S=Math.max(m.start,f.start),A=Math.min(o.count,Math.min(m.start+m.count,f.start+f.count));for(let y=S,T=A;y<T;y+=3){const E=o.getX(y),w=o.getX(y+1),_=o.getX(y+2);s=ya(this,p,e,n,l,h,u,E,w,_),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const g=Math.max(0,f.start),v=Math.min(o.count,f.start+f.count);for(let m=g,p=v;m<p;m+=3){const S=o.getX(m),A=o.getX(m+1),y=o.getX(m+2);s=ya(this,a,e,n,l,h,u,S,A,y),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(c!==void 0)if(Array.isArray(a))for(let g=0,v=d.length;g<v;g++){const m=d[g],p=a[m.materialIndex],S=Math.max(m.start,f.start),A=Math.min(c.count,Math.min(m.start+m.count,f.start+f.count));for(let y=S,T=A;y<T;y+=3){const E=y,w=y+1,_=y+2;s=ya(this,p,e,n,l,h,u,E,w,_),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const g=Math.max(0,f.start),v=Math.min(c.count,f.start+f.count);for(let m=g,p=v;m<p;m+=3){const S=m,A=m+1,y=m+2;s=ya(this,a,e,n,l,h,u,S,A,y),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}}function Dm(i,e,t,n,s,r,a,o){let c;if(e.side===en?c=n.intersectTriangle(a,r,s,!0,o):c=n.intersectTriangle(s,r,a,e.side===mi,o),c===null)return null;xa.copy(o),xa.applyMatrix4(i.matrixWorld);const l=t.ray.origin.distanceTo(xa);return l<t.near||l>t.far?null:{distance:l,point:xa.clone(),object:i}}function ya(i,e,t,n,s,r,a,o,c,l){i.getVertexPosition(o,ma),i.getVertexPosition(c,ga),i.getVertexPosition(l,_a);const h=Dm(i,e,t,n,ma,ga,_a,sd);if(h){const u=new N;Qt.getBarycoord(sd,ma,ga,_a,u),s&&(h.uv=Qt.getInterpolatedAttribute(s,o,c,l,u,new Se)),r&&(h.uv1=Qt.getInterpolatedAttribute(r,o,c,l,u,new Se)),a&&(h.normal=Qt.getInterpolatedAttribute(a,o,c,l,u,new N),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));const d={a:o,b:c,c:l,normal:new N,materialIndex:0};Qt.getNormal(ma,ga,_a,d.normal),h.face=d,h.barycoord=u}return h}const fr=new rt,rd=new rt,ad=new rt,Um=new rt,od=new Oe,ba=new N,pl=new tr,ld=new Oe,ml=new Ro;class Fm extends ft{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=Uu,this.bindMatrix=new Oe,this.bindMatrixInverse=new Oe,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){const e=this.geometry;this.boundingBox===null&&(this.boundingBox=new ps),this.boundingBox.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,ba),this.boundingBox.expandByPoint(ba)}computeBoundingSphere(){const e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new tr),this.boundingSphere.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,ba),this.boundingSphere.expandByPoint(ba)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){const n=this.material,s=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),pl.copy(this.boundingSphere),pl.applyMatrix4(s),e.ray.intersectsSphere(pl)!==!1&&(ld.copy(s).invert(),ml.copy(e.ray).applyMatrix4(ld),!(this.boundingBox!==null&&ml.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,ml)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){const e=new rt,t=this.geometry.attributes.skinWeight;for(let n=0,s=t.count;n<s;n++){e.fromBufferAttribute(t,n);const r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===Uu?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===Op?this.bindMatrixInverse.copy(this.bindMatrix).invert():Pe("SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){const n=this.skeleton,s=this.geometry;rd.fromBufferAttribute(s.attributes.skinIndex,e),ad.fromBufferAttribute(s.attributes.skinWeight,e),t.isVector4?(fr.copy(t),t.set(0,0,0,0)):(fr.set(...t,1),t.set(0,0,0)),fr.applyMatrix4(this.bindMatrix);for(let r=0;r<4;r++){const a=ad.getComponent(r);if(a!==0){const o=rd.getComponent(r);od.multiplyMatrices(n.bones[o].matrixWorld,n.boneInverses[o]),t.addScaledVector(Um.copy(fr).applyMatrix4(od),a)}}return t.isVector4&&(t.w=fr.w),t.applyMatrix4(this.bindMatrixInverse)}}class Kh extends pt{constructor(){super(),this.isBone=!0,this.type="Bone"}}class ao extends Vt{constructor(e=null,t=1,n=1,s,r,a,o,c,l=zt,h=zt,u,d){super(null,a,o,c,l,h,s,r,u,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const cd=new Oe,Om=new Oe;class zc{constructor(e=[],t=[]){this.uuid=Rn(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){const e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){Pe("Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,s=this.bones.length;n<s;n++)this.boneInverses.push(new Oe)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){const n=new Oe;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){const e=this.bones,t=this.boneInverses,n=this.boneMatrices,s=this.boneTexture;for(let r=0,a=e.length;r<a;r++){const o=e[r]?e[r].matrixWorld:Om;cd.multiplyMatrices(o,t[r]),cd.toArray(n,r*16)}s!==null&&(s.needsUpdate=!0)}clone(){return new zc(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);const t=new Float32Array(e*e*4);t.set(this.boneMatrices);const n=new ao(t,e,e,pn,An);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){const s=this.bones[t];if(s.name===e)return s}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,s=e.bones.length;n<s;n++){const r=e.bones[n];let a=t[r];a===void 0&&(Pe("Skeleton: No bone found with UUID:",r),a=new Kh),this.bones.push(a),this.boneInverses.push(new Oe().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){const e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;const t=this.bones,n=this.boneInverses;for(let s=0,r=t.length;s<r;s++){const a=t[s];e.bones.push(a.uuid);const o=n[s];e.boneInverses.push(o.toArray())}return e}}const gl=new N,Bm=new N,km=new ke;class Li{constructor(e=new N(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const s=gl.subVectors(n,t).cross(Bm.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){const s=e.delta(gl),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const a=-(e.start.dot(this.normal)+this.constant)/r;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(s,a)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||km.getNormalMatrix(e),s=this.coplanarPoint(gl).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Zi=new tr,zm=new Se(.5,.5),Ma=new N;class Vc{constructor(e=new Li,t=new Li,n=new Li,s=new Li,r=new Li,a=new Li){this.planes=[e,t,n,s,r,a]}set(e,t,n,s,r,a){const o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Hn,n=!1){const s=this.planes,r=e.elements,a=r[0],o=r[1],c=r[2],l=r[3],h=r[4],u=r[5],d=r[6],f=r[7],g=r[8],v=r[9],m=r[10],p=r[11],S=r[12],A=r[13],y=r[14],T=r[15];if(s[0].setComponents(l-a,f-h,p-g,T-S).normalize(),s[1].setComponents(l+a,f+h,p+g,T+S).normalize(),s[2].setComponents(l+o,f+u,p+v,T+A).normalize(),s[3].setComponents(l-o,f-u,p-v,T-A).normalize(),n)s[4].setComponents(c,d,m,y).normalize(),s[5].setComponents(l-c,f-d,p-m,T-y).normalize();else if(s[4].setComponents(l-c,f-d,p-m,T-y).normalize(),t===Hn)s[5].setComponents(l+c,f+d,p+m,T+y).normalize();else if(t===Nr)s[5].setComponents(c,d,m,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Zi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Zi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Zi)}intersectsSprite(e){Zi.center.set(0,0,0);const t=zm.distanceTo(e.center);return Zi.radius=.7071067811865476+t,Zi.applyMatrix4(e.matrixWorld),this.intersectsSphere(Zi)}intersectsSphere(e){const t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const s=t[n];if(Ma.x=s.normal.x>0?e.max.x:e.min.x,Ma.y=s.normal.y>0?e.max.y:e.min.y,Ma.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Ma)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class hi extends xi{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ue(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const oo=new N,lo=new N,ud=new Oe,pr=new Ro,Sa=new tr,_l=new N,dd=new N;class Dr extends pt{constructor(e=new mt,t=new hi){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[0];for(let s=1,r=t.count;s<r;s++)oo.fromBufferAttribute(t,s-1),lo.fromBufferAttribute(t,s),n[s]=n[s-1],n[s]+=oo.distanceTo(lo);e.setAttribute("lineDistance",new Ye(n,1))}else Pe("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const n=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Sa.copy(n.boundingSphere),Sa.applyMatrix4(s),Sa.radius+=r,e.ray.intersectsSphere(Sa)===!1)return;ud.copy(s).invert(),pr.copy(e.ray).applyMatrix4(ud);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=o*o,l=this.isLineSegments?2:1,h=n.index,d=n.attributes.position;if(h!==null){const f=Math.max(0,a.start),g=Math.min(h.count,a.start+a.count);for(let v=f,m=g-1;v<m;v+=l){const p=h.getX(v),S=h.getX(v+1),A=Ea(this,e,pr,c,p,S,v);A&&t.push(A)}if(this.isLineLoop){const v=h.getX(g-1),m=h.getX(f),p=Ea(this,e,pr,c,v,m,g-1);p&&t.push(p)}}else{const f=Math.max(0,a.start),g=Math.min(d.count,a.start+a.count);for(let v=f,m=g-1;v<m;v+=l){const p=Ea(this,e,pr,c,v,v+1,v);p&&t.push(p)}if(this.isLineLoop){const v=Ea(this,e,pr,c,g-1,f,g-1);v&&t.push(v)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function Ea(i,e,t,n,s,r,a){const o=i.geometry.attributes.position;if(oo.fromBufferAttribute(o,s),lo.fromBufferAttribute(o,r),t.distanceSqToSegment(oo,lo,_l,dd)>n)return;_l.applyMatrix4(i.matrixWorld);const l=e.ray.origin.distanceTo(_l);if(!(l<e.near||l>e.far))return{distance:l,point:dd.clone().applyMatrix4(i.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:i}}const hd=new N,fd=new N;class Co extends Dr{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[];for(let s=0,r=t.count;s<r;s+=2)hd.fromBufferAttribute(t,s),fd.fromBufferAttribute(t,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+hd.distanceTo(fd);e.setAttribute("lineDistance",new Ye(n,1))}else Pe("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class Vm extends Dr{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}}class Zh extends Vt{constructor(e=[],t=os,n,s,r,a,o,c,l,h){super(e,t,n,s,r,a,o,c,l,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Gm extends Vt{constructor(e,t,n,s,r,a,o,c,l){super(e,t,n,s,r,a,o,c,l),this.isCanvasTexture=!0,this.needsUpdate=!0}}class js extends Vt{constructor(e,t,n=$n,s,r,a,o=zt,c=zt,l,h=_i,u=1){if(h!==_i&&h!==is)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const d={width:e,height:t,depth:u};super(d,s,r,a,o,c,h,n,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Bc(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class Hm extends js{constructor(e,t=$n,n=os,s,r,a=zt,o=zt,c,l=_i){const h={width:e,height:e,depth:1},u=[h,h,h,h,h,h];super(e,e,t,n,s,r,a,o,c,l),this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}}class Jh extends Vt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class ms extends mt{constructor(e=1,t=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};const o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);const c=[],l=[],h=[],u=[];let d=0,f=0;g("z","y","x",-1,-1,n,t,e,a,r,0),g("z","y","x",1,-1,n,t,-e,a,r,1),g("x","z","y",1,1,e,n,t,s,a,2),g("x","z","y",1,-1,e,n,-t,s,a,3),g("x","y","z",1,-1,e,t,n,s,r,4),g("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(c),this.setAttribute("position",new Ye(l,3)),this.setAttribute("normal",new Ye(h,3)),this.setAttribute("uv",new Ye(u,2));function g(v,m,p,S,A,y,T,E,w,_,b){const P=y/w,R=T/_,L=y/2,z=T/2,X=E/2,O=w+1,I=_+1;let V=0,$=0;const J=new N;for(let re=0;re<I;re++){const se=re*R-z;for(let ae=0;ae<O;ae++){const xe=ae*P-L;J[v]=xe*S,J[m]=se*A,J[p]=X,l.push(J.x,J.y,J.z),J[v]=0,J[m]=0,J[p]=E>0?1:-1,h.push(J.x,J.y,J.z),u.push(ae/w),u.push(1-re/_),V+=1}}for(let re=0;re<_;re++)for(let se=0;se<w;se++){const ae=d+se+O*re,xe=d+se+O*(re+1),ye=d+(se+1)+O*(re+1),le=d+(se+1)+O*re;c.push(ae,xe,le),c.push(xe,ye,le),$+=6}o.addGroup(f,$,b),f+=$,d+=V}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ms(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}class Gc extends mt{constructor(e=1,t=32,n=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:s},t=Math.max(3,t);const r=[],a=[],o=[],c=[],l=new N,h=new Se;a.push(0,0,0),o.push(0,0,1),c.push(.5,.5);for(let u=0,d=3;u<=t;u++,d+=3){const f=n+u/t*s;l.x=e*Math.cos(f),l.y=e*Math.sin(f),a.push(l.x,l.y,l.z),o.push(0,0,1),h.x=(a[d]/e+1)/2,h.y=(a[d+1]/e+1)/2,c.push(h.x,h.y)}for(let u=1;u<=t;u++)r.push(u,u+1,0);this.setIndex(r),this.setAttribute("position",new Ye(a,3)),this.setAttribute("normal",new Ye(o,3)),this.setAttribute("uv",new Ye(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Gc(e.radius,e.segments,e.thetaStart,e.thetaLength)}}class Xr extends mt{constructor(e=1,t=1,n=1,s=32,r=1,a=!1,o=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:c};const l=this;s=Math.floor(s),r=Math.floor(r);const h=[],u=[],d=[],f=[];let g=0;const v=[],m=n/2;let p=0;S(),a===!1&&(e>0&&A(!0),t>0&&A(!1)),this.setIndex(h),this.setAttribute("position",new Ye(u,3)),this.setAttribute("normal",new Ye(d,3)),this.setAttribute("uv",new Ye(f,2));function S(){const y=new N,T=new N;let E=0;const w=(t-e)/n;for(let _=0;_<=r;_++){const b=[],P=_/r,R=P*(t-e)+e;for(let L=0;L<=s;L++){const z=L/s,X=z*c+o,O=Math.sin(X),I=Math.cos(X);T.x=R*O,T.y=-P*n+m,T.z=R*I,u.push(T.x,T.y,T.z),y.set(O,w,I).normalize(),d.push(y.x,y.y,y.z),f.push(z,1-P),b.push(g++)}v.push(b)}for(let _=0;_<s;_++)for(let b=0;b<r;b++){const P=v[b][_],R=v[b+1][_],L=v[b+1][_+1],z=v[b][_+1];(e>0||b!==0)&&(h.push(P,R,z),E+=3),(t>0||b!==r-1)&&(h.push(R,L,z),E+=3)}l.addGroup(p,E,0),p+=E}function A(y){const T=g,E=new Se,w=new N;let _=0;const b=y===!0?e:t,P=y===!0?1:-1;for(let L=1;L<=s;L++)u.push(0,m*P,0),d.push(0,P,0),f.push(.5,.5),g++;const R=g;for(let L=0;L<=s;L++){const X=L/s*c+o,O=Math.cos(X),I=Math.sin(X);w.x=b*I,w.y=m*P,w.z=b*O,u.push(w.x,w.y,w.z),d.push(0,P,0),E.x=O*.5+.5,E.y=I*.5*P+.5,f.push(E.x,E.y),g++}for(let L=0;L<s;L++){const z=T+L,X=R+L;y===!0?h.push(X,X+1,z):h.push(X+1,X,z),_+=3}l.addGroup(p,_,y===!0?1:2),p+=_}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Xr(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Hc extends Xr{constructor(e=1,t=1,n=32,s=1,r=!1,a=0,o=Math.PI*2){super(0,e,t,n,s,r,a,o),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(e){return new Hc(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}const Ta=new N,Aa=new N,vl=new N,wa=new Qt;class Wm extends mt{constructor(e=null,t=1){if(super(),this.type="EdgesGeometry",this.parameters={geometry:e,thresholdAngle:t},e!==null){const s=Math.pow(10,4),r=Math.cos(Xs*t),a=e.getIndex(),o=e.getAttribute("position"),c=a?a.count:o.count,l=[0,0,0],h=["a","b","c"],u=new Array(3),d={},f=[];for(let g=0;g<c;g+=3){a?(l[0]=a.getX(g),l[1]=a.getX(g+1),l[2]=a.getX(g+2)):(l[0]=g,l[1]=g+1,l[2]=g+2);const{a:v,b:m,c:p}=wa;if(v.fromBufferAttribute(o,l[0]),m.fromBufferAttribute(o,l[1]),p.fromBufferAttribute(o,l[2]),wa.getNormal(vl),u[0]=`${Math.round(v.x*s)},${Math.round(v.y*s)},${Math.round(v.z*s)}`,u[1]=`${Math.round(m.x*s)},${Math.round(m.y*s)},${Math.round(m.z*s)}`,u[2]=`${Math.round(p.x*s)},${Math.round(p.y*s)},${Math.round(p.z*s)}`,!(u[0]===u[1]||u[1]===u[2]||u[2]===u[0]))for(let S=0;S<3;S++){const A=(S+1)%3,y=u[S],T=u[A],E=wa[h[S]],w=wa[h[A]],_=`${y}_${T}`,b=`${T}_${y}`;b in d&&d[b]?(vl.dot(d[b].normal)<=r&&(f.push(E.x,E.y,E.z),f.push(w.x,w.y,w.z)),d[b]=null):_ in d||(d[_]={index0:l[S],index1:l[A],normal:vl.clone()})}}for(const g in d)if(d[g]){const{index0:v,index1:m}=d[g];Ta.fromBufferAttribute(o,v),Aa.fromBufferAttribute(o,m),f.push(Ta.x,Ta.y,Ta.z),f.push(Aa.x,Aa.y,Aa.z)}this.setAttribute("position",new Ye(f,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}}class Xm{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){Pe("Curve: .getPoint() not implemented.")}getPointAt(e,t){const n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){const e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const t=[];let n,s=this.getPoint(0),r=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),r+=n.distanceTo(s),t.push(r),s=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){const n=this.getLengths();let s=0;const r=n.length;let a;t?a=t:a=e*n[r-1];let o=0,c=r-1,l;for(;o<=c;)if(s=Math.floor(o+(c-o)/2),l=n[s]-a,l<0)o=s+1;else if(l>0)c=s-1;else{c=s;break}if(s=c,n[s]===a)return s/(r-1);const h=n[s],d=n[s+1]-h,f=(a-h)/d;return(s+f)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);const a=this.getPoint(s),o=this.getPoint(r),c=t||(a.isVector2?new Se:new N);return c.copy(o).sub(a).normalize(),c}getTangentAt(e,t){const n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){const n=new N,s=[],r=[],a=[],o=new N,c=new Oe;for(let f=0;f<=e;f++){const g=f/e;s[f]=this.getTangentAt(g,new N)}r[0]=new N,a[0]=new N;let l=Number.MAX_VALUE;const h=Math.abs(s[0].x),u=Math.abs(s[0].y),d=Math.abs(s[0].z);h<=l&&(l=h,n.set(1,0,0)),u<=l&&(l=u,n.set(0,1,0)),d<=l&&n.set(0,0,1),o.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],o),a[0].crossVectors(s[0],r[0]);for(let f=1;f<=e;f++){if(r[f]=r[f-1].clone(),a[f]=a[f-1].clone(),o.crossVectors(s[f-1],s[f]),o.length()>Number.EPSILON){o.normalize();const g=Math.acos(We(s[f-1].dot(s[f]),-1,1));r[f].applyMatrix4(c.makeRotationAxis(o,g))}a[f].crossVectors(s[f],r[f])}if(t===!0){let f=Math.acos(We(r[0].dot(r[e]),-1,1));f/=e,s[0].dot(o.crossVectors(r[0],r[e]))>0&&(f=-f);for(let g=1;g<=e;g++)r[g].applyMatrix4(c.makeRotationAxis(s[g],f*g)),a[g].crossVectors(s[g],r[g])}return{tangents:s,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){const e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}}class qm extends Xm{constructor(e=0,t=0,n=1,s=1,r=0,a=Math.PI*2,o=!1,c=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=c}getPoint(e,t=new Se){const n=t,s=Math.PI*2;let r=this.aEndAngle-this.aStartAngle;const a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(a?r=0:r=s),this.aClockwise===!0&&!a&&(r===s?r=-s:r=r-s);const o=this.aStartAngle+e*r;let c=this.aX+this.xRadius*Math.cos(o),l=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){const h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),d=c-this.aX,f=l-this.aY;c=d*h-f*u+this.aX,l=d*u+f*h+this.aY}return n.set(c,l)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){const e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}}function $m(i,e,t=2){const n=e&&e.length,s=n?e[0]*t:i.length;let r=jh(i,0,s,t,!0);const a=[];if(!r||r.next===r.prev)return a;let o,c,l;if(n&&(r=jm(i,e,r,t)),i.length>80*t){o=i[0],c=i[1];let h=o,u=c;for(let d=t;d<s;d+=t){const f=i[d],g=i[d+1];f<o&&(o=f),g<c&&(c=g),f>h&&(h=f),g>u&&(u=g)}l=Math.max(h-o,u-c),l=l!==0?32767/l:0}return Ur(r,a,t,o,c,l,0),a}function jh(i,e,t,n,s){let r;if(s===cg(i,e,t,n)>0)for(let a=e;a<t;a+=n)r=pd(a/n|0,i[a],i[a+1],r);else for(let a=t-n;a>=e;a-=n)r=pd(a/n|0,i[a],i[a+1],r);return r&&Qs(r,r.next)&&(Or(r),r=r.next),r}function us(i,e){if(!i)return i;e||(e=i);let t=i,n;do if(n=!1,!t.steiner&&(Qs(t,t.next)||ht(t.prev,t,t.next)===0)){if(Or(t),t=e=t.prev,t===t.next)break;n=!0}else t=t.next;while(n||t!==e);return e}function Ur(i,e,t,n,s,r,a){if(!i)return;!a&&r&&ig(i,n,s,r);let o=i;for(;i.prev!==i.next;){const c=i.prev,l=i.next;if(r?Km(i,n,s,r):Ym(i)){e.push(c.i,i.i,l.i),Or(i),i=l.next,o=l.next;continue}if(i=l,i===o){a?a===1?(i=Zm(us(i),e),Ur(i,e,t,n,s,r,2)):a===2&&Jm(i,e,t,n,s,r):Ur(us(i),e,t,n,s,r,1);break}}}function Ym(i){const e=i.prev,t=i,n=i.next;if(ht(e,t,n)>=0)return!1;const s=e.x,r=t.x,a=n.x,o=e.y,c=t.y,l=n.y,h=Math.min(s,r,a),u=Math.min(o,c,l),d=Math.max(s,r,a),f=Math.max(o,c,l);let g=n.next;for(;g!==e;){if(g.x>=h&&g.x<=d&&g.y>=u&&g.y<=f&&xr(s,o,r,c,a,l,g.x,g.y)&&ht(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function Km(i,e,t,n){const s=i.prev,r=i,a=i.next;if(ht(s,r,a)>=0)return!1;const o=s.x,c=r.x,l=a.x,h=s.y,u=r.y,d=a.y,f=Math.min(o,c,l),g=Math.min(h,u,d),v=Math.max(o,c,l),m=Math.max(h,u,d),p=Mc(f,g,e,t,n),S=Mc(v,m,e,t,n);let A=i.prevZ,y=i.nextZ;for(;A&&A.z>=p&&y&&y.z<=S;){if(A.x>=f&&A.x<=v&&A.y>=g&&A.y<=m&&A!==s&&A!==a&&xr(o,h,c,u,l,d,A.x,A.y)&&ht(A.prev,A,A.next)>=0||(A=A.prevZ,y.x>=f&&y.x<=v&&y.y>=g&&y.y<=m&&y!==s&&y!==a&&xr(o,h,c,u,l,d,y.x,y.y)&&ht(y.prev,y,y.next)>=0))return!1;y=y.nextZ}for(;A&&A.z>=p;){if(A.x>=f&&A.x<=v&&A.y>=g&&A.y<=m&&A!==s&&A!==a&&xr(o,h,c,u,l,d,A.x,A.y)&&ht(A.prev,A,A.next)>=0)return!1;A=A.prevZ}for(;y&&y.z<=S;){if(y.x>=f&&y.x<=v&&y.y>=g&&y.y<=m&&y!==s&&y!==a&&xr(o,h,c,u,l,d,y.x,y.y)&&ht(y.prev,y,y.next)>=0)return!1;y=y.nextZ}return!0}function Zm(i,e){let t=i;do{const n=t.prev,s=t.next.next;!Qs(n,s)&&ef(n,t,t.next,s)&&Fr(n,s)&&Fr(s,n)&&(e.push(n.i,t.i,s.i),Or(t),Or(t.next),t=i=s),t=t.next}while(t!==i);return us(t)}function Jm(i,e,t,n,s,r){let a=i;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&ag(a,o)){let c=tf(a,o);a=us(a,a.next),c=us(c,c.next),Ur(a,e,t,n,s,r,0),Ur(c,e,t,n,s,r,0);return}o=o.next}a=a.next}while(a!==i)}function jm(i,e,t,n){const s=[];for(let r=0,a=e.length;r<a;r++){const o=e[r]*n,c=r<a-1?e[r+1]*n:i.length,l=jh(i,o,c,n,!1);l===l.next&&(l.steiner=!0),s.push(rg(l))}s.sort(Qm);for(let r=0;r<s.length;r++)t=eg(s[r],t);return t}function Qm(i,e){let t=i.x-e.x;if(t===0&&(t=i.y-e.y,t===0)){const n=(i.next.y-i.y)/(i.next.x-i.x),s=(e.next.y-e.y)/(e.next.x-e.x);t=n-s}return t}function eg(i,e){const t=tg(i,e);if(!t)return e;const n=tf(t,i);return us(n,n.next),us(t,t.next)}function tg(i,e){let t=e;const n=i.x,s=i.y;let r=-1/0,a;if(Qs(i,t))return t;do{if(Qs(i,t.next))return t.next;if(s<=t.y&&s>=t.next.y&&t.next.y!==t.y){const u=t.x+(s-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(u<=n&&u>r&&(r=u,a=t.x<t.next.x?t:t.next,u===n))return a}t=t.next}while(t!==e);if(!a)return null;const o=a,c=a.x,l=a.y;let h=1/0;t=a;do{if(n>=t.x&&t.x>=c&&n!==t.x&&Qh(s<l?n:r,s,c,l,s<l?r:n,s,t.x,t.y)){const u=Math.abs(s-t.y)/(n-t.x);Fr(t,i)&&(u<h||u===h&&(t.x>a.x||t.x===a.x&&ng(a,t)))&&(a=t,h=u)}t=t.next}while(t!==o);return a}function ng(i,e){return ht(i.prev,i,e.prev)<0&&ht(e.next,i,i.next)<0}function ig(i,e,t,n){let s=i;do s.z===0&&(s.z=Mc(s.x,s.y,e,t,n)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==i);s.prevZ.nextZ=null,s.prevZ=null,sg(s)}function sg(i){let e,t=1;do{let n=i,s;i=null;let r=null;for(e=0;n;){e++;let a=n,o=0;for(let l=0;l<t&&(o++,a=a.nextZ,!!a);l++);let c=t;for(;o>0||c>0&&a;)o!==0&&(c===0||!a||n.z<=a.z)?(s=n,n=n.nextZ,o--):(s=a,a=a.nextZ,c--),r?r.nextZ=s:i=s,s.prevZ=r,r=s;n=a}r.nextZ=null,t*=2}while(e>1);return i}function Mc(i,e,t,n,s){return i=(i-t)*s|0,e=(e-n)*s|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,i|e<<1}function rg(i){let e=i,t=i;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==i);return t}function Qh(i,e,t,n,s,r,a,o){return(s-a)*(e-o)>=(i-a)*(r-o)&&(i-a)*(n-o)>=(t-a)*(e-o)&&(t-a)*(r-o)>=(s-a)*(n-o)}function xr(i,e,t,n,s,r,a,o){return!(i===a&&e===o)&&Qh(i,e,t,n,s,r,a,o)}function ag(i,e){return i.next.i!==e.i&&i.prev.i!==e.i&&!og(i,e)&&(Fr(i,e)&&Fr(e,i)&&lg(i,e)&&(ht(i.prev,i,e.prev)||ht(i,e.prev,e))||Qs(i,e)&&ht(i.prev,i,i.next)>0&&ht(e.prev,e,e.next)>0)}function ht(i,e,t){return(e.y-i.y)*(t.x-e.x)-(e.x-i.x)*(t.y-e.y)}function Qs(i,e){return i.x===e.x&&i.y===e.y}function ef(i,e,t,n){const s=Ca(ht(i,e,t)),r=Ca(ht(i,e,n)),a=Ca(ht(t,n,i)),o=Ca(ht(t,n,e));return!!(s!==r&&a!==o||s===0&&Ra(i,t,e)||r===0&&Ra(i,n,e)||a===0&&Ra(t,i,n)||o===0&&Ra(t,e,n))}function Ra(i,e,t){return e.x<=Math.max(i.x,t.x)&&e.x>=Math.min(i.x,t.x)&&e.y<=Math.max(i.y,t.y)&&e.y>=Math.min(i.y,t.y)}function Ca(i){return i>0?1:i<0?-1:0}function og(i,e){let t=i;do{if(t.i!==i.i&&t.next.i!==i.i&&t.i!==e.i&&t.next.i!==e.i&&ef(t,t.next,i,e))return!0;t=t.next}while(t!==i);return!1}function Fr(i,e){return ht(i.prev,i,i.next)<0?ht(i,e,i.next)>=0&&ht(i,i.prev,e)>=0:ht(i,e,i.prev)<0||ht(i,i.next,e)<0}function lg(i,e){let t=i,n=!1;const s=(i.x+e.x)/2,r=(i.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&s<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(n=!n),t=t.next;while(t!==i);return n}function tf(i,e){const t=Sc(i.i,i.x,i.y),n=Sc(e.i,e.x,e.y),s=i.next,r=e.prev;return i.next=e,e.prev=i,t.next=s,s.prev=t,n.next=t,t.prev=n,r.next=n,n.prev=r,n}function pd(i,e,t,n){const s=Sc(i,e,t);return n?(s.next=n.next,s.prev=n,n.next.prev=s,n.next=s):(s.prev=s,s.next=s),s}function Or(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function Sc(i,e,t){return{i,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function cg(i,e,t,n){let s=0;for(let r=e,a=t-n;r<t;r+=n)s+=(i[a]-i[r])*(i[r+1]+i[a+1]),a=r;return s}class ug{static triangulate(e,t,n=2){return $m(e,t,n)}}class co{static area(e){const t=e.length;let n=0;for(let s=t-1,r=0;r<t;s=r++)n+=e[s].x*e[r].y-e[r].x*e[s].y;return n*.5}static isClockWise(e){return co.area(e)<0}static triangulateShape(e,t){const n=[],s=[],r=[];md(e),gd(n,e);let a=e.length;t.forEach(md);for(let c=0;c<t.length;c++)s.push(a),a+=t[c].length,gd(n,t[c]);const o=ug.triangulate(n,s);for(let c=0;c<o.length;c+=3)r.push(o.slice(c,c+3));return r}}function md(i){const e=i.length;e>2&&i[e-1].equals(i[0])&&i.pop()}function gd(i,e){for(let t=0;t<e.length;t++)i.push(e[t].x),i.push(e[t].y)}class Po extends mt{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};const r=e/2,a=t/2,o=Math.floor(n),c=Math.floor(s),l=o+1,h=c+1,u=e/o,d=t/c,f=[],g=[],v=[],m=[];for(let p=0;p<h;p++){const S=p*d-a;for(let A=0;A<l;A++){const y=A*u-r;g.push(y,-S,0),v.push(0,0,1),m.push(A/o),m.push(1-p/c)}}for(let p=0;p<c;p++)for(let S=0;S<o;S++){const A=S+l*p,y=S+l*(p+1),T=S+1+l*(p+1),E=S+1+l*p;f.push(A,y,E),f.push(y,T,E)}this.setIndex(f),this.setAttribute("position",new Ye(g,3)),this.setAttribute("normal",new Ye(v,3)),this.setAttribute("uv",new Ye(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Po(e.width,e.height,e.widthSegments,e.heightSegments)}}class Wc extends mt{constructor(e=1,t=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));const c=Math.min(a+o,Math.PI);let l=0;const h=[],u=new N,d=new N,f=[],g=[],v=[],m=[];for(let p=0;p<=n;p++){const S=[],A=p/n,y=a+A*o,T=e*Math.cos(y),E=Math.sqrt(e*e-T*T);let w=0;p===0&&a===0?w=.5/t:p===n&&c===Math.PI&&(w=-.5/t);for(let _=0;_<=t;_++){const b=_/t,P=s+b*r;u.x=-E*Math.cos(P),u.y=T,u.z=E*Math.sin(P),g.push(u.x,u.y,u.z),d.copy(u).normalize(),v.push(d.x,d.y,d.z),m.push(b+w,1-A),S.push(l++)}h.push(S)}for(let p=0;p<n;p++)for(let S=0;S<t;S++){const A=h[p][S+1],y=h[p][S],T=h[p+1][S],E=h[p+1][S+1];(p!==0||a>0)&&f.push(A,y,E),(p!==n-1||c<Math.PI)&&f.push(y,T,E)}this.setIndex(f),this.setAttribute("position",new Ye(g,3)),this.setAttribute("normal",new Ye(v,3)),this.setAttribute("uv",new Ye(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Wc(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}function er(i){const e={};for(const t in i){e[t]={};for(const n in i[t]){const s=i[t][n];if(_d(s))s.isRenderTargetTexture?(Pe("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone();else if(Array.isArray(s))if(_d(s[0])){const r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();e[t][n]=r}else e[t][n]=s.slice();else e[t][n]=s}}return e}function Yt(i){const e={};for(let t=0;t<i.length;t++){const n=er(i[t]);for(const s in n)e[s]=n[s]}return e}function _d(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function dg(i){const e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function nf(i){const e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:qe.workingColorSpace}const hg={clone:er,merge:Yt};var fg=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,pg=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Yn extends xi{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=fg,this.fragmentShader=pg,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=er(e.uniforms),this.uniformsGroups=dg(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const s in this.uniforms){const a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(const n in e.uniforms){const s=e.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=t[s.value]||null;break;case"c":this.uniforms[n].value=new Ue().setHex(s.value);break;case"v2":this.uniforms[n].value=new Se().fromArray(s.value);break;case"v3":this.uniforms[n].value=new N().fromArray(s.value);break;case"v4":this.uniforms[n].value=new rt().fromArray(s.value);break;case"m3":this.uniforms[n].value=new ke().fromArray(s.value);break;case"m4":this.uniforms[n].value=new Oe().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(const n in e.extensions)this.extensions[n]=e.extensions[n];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}}class mg extends Yn{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class sf extends xi{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ue(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ue(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Lr,this.normalScale=new Se(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new _n,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Mr extends xi{constructor(e){super(),this.isMeshPhongMaterial=!0,this.type="MeshPhongMaterial",this.color=new Ue(16777215),this.specular=new Ue(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ue(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Lr,this.normalScale=new Se(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new _n,this.combine=Ao,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.specular.copy(e.specular),this.shininess=e.shininess,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class gg extends xi{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Ue(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ue(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Lr,this.normalScale=new Se(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new _n,this.combine=Ao,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class _g extends xi{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=zp,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class vg extends xi{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}class xg extends hi{constructor(e){super(),this.isLineDashedMaterial=!0,this.type="LineDashedMaterial",this.scale=1,this.dashSize=3,this.gapSize=1,this.setValues(e)}copy(e){return super.copy(e),this.scale=e.scale,this.dashSize=e.dashSize,this.gapSize=e.gapSize,this}}function Pa(i,e){return!i||i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function yg(i){function e(s,r){return i[s]-i[r]}const t=i.length,n=new Array(t);for(let s=0;s!==t;++s)n[s]=s;return n.sort(e),n}function vd(i,e,t){const n=i.length,s=new i.constructor(n);for(let r=0,a=0;a!==n;++r){const o=t[r]*e;for(let c=0;c!==e;++c)s[a++]=i[o+c]}return s}function bg(i,e,t,n){let s=1,r=i[0];for(;r!==void 0&&r[n]===void 0;)r=i[s++];if(r===void 0)return;let a=r[n];if(a!==void 0)if(Array.isArray(a))do a=r[n],a!==void 0&&(e.push(r.time),t.push(...a)),r=i[s++];while(r!==void 0);else if(a.toArray!==void 0)do a=r[n],a!==void 0&&(e.push(r.time),a.toArray(t,t.length)),r=i[s++];while(r!==void 0);else do a=r[n],a!==void 0&&(e.push(r.time),t.push(a)),r=i[s++];while(r!==void 0)}class qr{constructor(e,t,n,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){const t=this.parameterPositions;let n=this._cachedIndex,s=t[n],r=t[n-1];n:{e:{let a;t:{i:if(!(e<s)){for(let o=n+2;;){if(s===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=s,s=t[++n],e<s)break e}a=t.length;break t}if(!(e>=r)){const o=t[1];e<o&&(n=2,r=o);for(let c=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===c)break;if(s=r,r=t[--n-1],e>=r)break e}a=n,n=0;break t}break n}for(;n<a;){const o=n+a>>>1;e<t[o]?a=o:n=o+1}if(s=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s;for(let a=0;a!==s;++a)t[a]=n[r+a];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}}class Mg extends qr{constructor(e,t,n,s){super(e,t,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Fu,endingEnd:Fu}}intervalChanged_(e,t,n){const s=this.parameterPositions;let r=e-2,a=e+1,o=s[r],c=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case Ou:r=e,o=2*t-n;break;case Bu:r=s.length-2,o=t+s[r]-s[r+1];break;default:r=e,o=n}if(c===void 0)switch(this.getSettings_().endingEnd){case Ou:a=e,c=2*n-t;break;case Bu:a=1,c=n+s[1]-s[0];break;default:a=e-1,c=t}const l=(n-t)*.5,h=this.valueSize;this._weightPrev=l/(t-o),this._weightNext=l/(c-n),this._offsetPrev=r*h,this._offsetNext=a*h}interpolate_(e,t,n,s){const r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,h=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,g=(n-t)/(s-t),v=g*g,m=v*g,p=-d*m+2*d*v-d*g,S=(1+d)*m+(-1.5-2*d)*v+(-.5+d)*g+1,A=(-1-f)*m+(1.5+f)*v+.5*g,y=f*m-f*v;for(let T=0;T!==o;++T)r[T]=p*a[h+T]+S*a[l+T]+A*a[c+T]+y*a[u+T];return r}}class Sg extends qr{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){const r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,h=(n-t)/(s-t),u=1-h;for(let d=0;d!==o;++d)r[d]=a[l+d]*u+a[c+d]*h;return r}}class Eg extends qr{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e){return this.copySampleValue_(e-1)}}class Tg extends qr{interpolate_(e,t,n,s){const r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,h=this.inTangents,u=this.outTangents;if(!h||!u){const g=(n-t)/(s-t),v=1-g;for(let m=0;m!==o;++m)r[m]=a[l+m]*v+a[c+m]*g;return r}const d=o*2,f=e-1;for(let g=0;g!==o;++g){const v=a[l+g],m=a[c+g],p=f*d+g*2,S=u[p],A=u[p+1],y=e*d+g*2,T=h[y],E=h[y+1];let w=(n-t)/(s-t),_,b,P,R,L;for(let z=0;z<8;z++){_=w*w,b=_*w,P=1-w,R=P*P,L=R*P;const O=L*t+3*R*w*S+3*P*_*T+b*s-n;if(Math.abs(O)<1e-10)break;const I=3*R*(S-t)+6*P*w*(T-S)+3*_*(s-T);if(Math.abs(I)<1e-10)break;w=w-O/I,w=Math.max(0,Math.min(1,w))}r[g]=L*v+3*R*w*A+3*P*_*E+b*m}return r}}class Pn{constructor(e,t,n,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Pa(t,this.TimeBufferType),this.values=Pa(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){const t=e.constructor;let n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Pa(e.times,Array),values:Pa(e.values,Array)};const s=e.getInterpolation();s!==e.DefaultInterpolation&&(n.interpolation=s)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Eg(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Sg(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Mg(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){const t=new Tg(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case Pr:t=this.InterpolantFactoryMethodDiscrete;break;case xc:t=this.InterpolantFactoryMethodLinear;break;case Xo:t=this.InterpolantFactoryMethodSmooth;break;case yc:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){const n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return Pe("KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Pr;case this.InterpolantFactoryMethodLinear:return xc;case this.InterpolantFactoryMethodSmooth:return Xo;case this.InterpolantFactoryMethodBezier:return yc}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){const t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]+=e}return this}scale(e){if(e!==1){const t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]*=e}return this}trim(e,t){const n=this.times,s=n.length;let r=0,a=s-1;for(;r!==s&&n[r]<e;)++r;for(;a!==-1&&n[a]>t;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);const o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let e=!0;const t=this.getValueSize();t-Math.floor(t)!==0&&(He("KeyframeTrack: Invalid value size in track.",this),e=!1);const n=this.times,s=this.values,r=n.length;r===0&&(He("KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==r;o++){const c=n[o];if(typeof c=="number"&&isNaN(c)){He("KeyframeTrack: Time is not a valid number.",this,o,c),e=!1;break}if(a!==null&&a>c){He("KeyframeTrack: Out of order keys.",this,o,c,a),e=!1;break}a=c}if(s!==void 0&&Kp(s))for(let o=0,c=s.length;o!==c;++o){const l=s[o];if(isNaN(l)){He("KeyframeTrack: Value is not a valid number.",this,o,l),e=!1;break}}return e}optimize(){const e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===Xo,r=e.length-1;let a=1;for(let o=1;o<r;++o){let c=!1;const l=e[o],h=e[o+1];if(l!==h&&(o!==1||l!==e[0]))if(s)c=!0;else{const u=o*n,d=u-n,f=u+n;for(let g=0;g!==n;++g){const v=t[u+g];if(v!==t[d+g]||v!==t[f+g]){c=!0;break}}}if(c){if(o!==a){e[a]=e[o];const u=o*n,d=a*n;for(let f=0;f!==n;++f)t[d+f]=t[u+f]}++a}}if(r>0){e[a]=e[r];for(let o=r*n,c=a*n,l=0;l!==n;++l)t[c+l]=t[o+l];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*n)):(this.times=e,this.values=t),this}clone(){const e=this.times.slice(),t=this.values.slice(),n=this.constructor,s=new n(this.name,e,t);return s.createInterpolant=this.createInterpolant,s}}Pn.prototype.ValueTypeName="";Pn.prototype.TimeBufferType=Float32Array;Pn.prototype.ValueBufferType=Float32Array;Pn.prototype.DefaultInterpolation=xc;class nr extends Pn{constructor(e,t,n){super(e,t,n)}}nr.prototype.ValueTypeName="bool";nr.prototype.ValueBufferType=Array;nr.prototype.DefaultInterpolation=Pr;nr.prototype.InterpolantFactoryMethodLinear=void 0;nr.prototype.InterpolantFactoryMethodSmooth=void 0;class rf extends Pn{constructor(e,t,n,s){super(e,t,n,s)}}rf.prototype.ValueTypeName="color";class Xc extends Pn{constructor(e,t,n,s){super(e,t,n,s)}}Xc.prototype.ValueTypeName="number";class Ag extends qr{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){const r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=(n-t)/(s-t);let l=e*o;for(let h=l+o;l!==h;l+=4)Ot.slerpFlat(r,0,a,l-o,a,l,c);return r}}class $s extends Pn{constructor(e,t,n,s){super(e,t,n,s)}InterpolantFactoryMethodLinear(e){return new Ag(this.times,this.values,this.getValueSize(),e)}}$s.prototype.ValueTypeName="quaternion";$s.prototype.InterpolantFactoryMethodSmooth=void 0;class ir extends Pn{constructor(e,t,n){super(e,t,n)}}ir.prototype.ValueTypeName="string";ir.prototype.ValueBufferType=Array;ir.prototype.DefaultInterpolation=Pr;ir.prototype.InterpolantFactoryMethodLinear=void 0;ir.prototype.InterpolantFactoryMethodSmooth=void 0;class hn extends Pn{constructor(e,t,n,s){super(e,t,n,s)}}hn.prototype.ValueTypeName="vector";class xd{constructor(e="",t=-1,n=[],s=kp){this.name=e,this.tracks=n,this.duration=t,this.blendMode=s,this.uuid=Rn(),this.userData={},this.duration<0&&this.resetDuration()}static parse(e){const t=[],n=e.tracks,s=1/(e.fps||1);for(let a=0,o=n.length;a!==o;++a)t.push(Rg(n[a]).scale(s));const r=new this(e.name,e.duration,t,e.blendMode);return r.uuid=e.uuid,r.userData=JSON.parse(e.userData||"{}"),r}static toJSON(e){const t=[],n=e.tracks,s={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let r=0,a=n.length;r!==a;++r)t.push(Pn.toJSON(n[r]));return s}static CreateFromMorphTargetSequence(e,t,n,s){const r=t.length,a=[];for(let o=0;o<r;o++){let c=[],l=[];c.push((o+r-1)%r,o,(o+1)%r),l.push(0,1,0);const h=yg(c);c=vd(c,1,h),l=vd(l,1,h),!s&&c[0]===0&&(c.push(r),l.push(l[0])),a.push(new Xc(".morphTargetInfluences["+t[o].name+"]",c,l).scale(1/n))}return new this(e,-1,a)}static findByName(e,t){let n=e;if(!Array.isArray(e)){const s=e;n=s.geometry&&s.geometry.animations||s.animations}for(let s=0;s<n.length;s++)if(n[s].name===t)return n[s];return null}static CreateClipsFromMorphTargetSequences(e,t,n){const s={},r=/^([\w-]*?)([\d]+)$/;for(let o=0,c=e.length;o<c;o++){const l=e[o],h=l.name.match(r);if(h&&h.length>1){const u=h[1];let d=s[u];d||(s[u]=d=[]),d.push(l)}}const a=[];for(const o in s)a.push(this.CreateFromMorphTargetSequence(o,s[o],t,n));return a}resetDuration(){const e=this.tracks;let t=0;for(let n=0,s=e.length;n!==s;++n){const r=this.tracks[n];t=Math.max(t,r.times[r.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){const e=[];for(let n=0;n<this.tracks.length;n++)e.push(this.tracks[n].clone());const t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}}function wg(i){switch(i.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return Xc;case"vector":case"vector2":case"vector3":case"vector4":return hn;case"color":return rf;case"quaternion":return $s;case"bool":case"boolean":return nr;case"string":return ir}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+i)}function Rg(i){if(i.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");const e=wg(i.type);if(i.times===void 0){const t=[],n=[];bg(i.keys,t,n,"value"),i.times=t,i.values=n}return e.parse!==void 0?e.parse(i):new e(i.name,i.times,i.values,i.interpolation)}const Sr={enabled:!1,files:{},add:function(i,e){this.enabled!==!1&&(yd(i)||(this.files[i]=e))},get:function(i){if(this.enabled!==!1&&!yd(i))return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}};function yd(i){try{const e=i.slice(i.indexOf(":")+1);return new URL(e).protocol==="blob:"}catch{return!1}}class Cg{constructor(e,t,n){const s=this;let r=!1,a=0,o=0,c;const l=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(h){o++,r===!1&&s.onStart!==void 0&&s.onStart(h,a,o),r=!0},this.itemEnd=function(h){a++,s.onProgress!==void 0&&s.onProgress(h,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),c?c(h):h},this.setURLModifier=function(h){return c=h,this},this.addHandler=function(h,u){return l.push(h,u),this},this.removeHandler=function(h){const u=l.indexOf(h);return u!==-1&&l.splice(u,2),this},this.getHandler=function(h){for(let u=0,d=l.length;u<d;u+=2){const f=l[u],g=l[u+1];if(f.global&&(f.lastIndex=0),f.test(h))return g}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}}const af=new Cg;class Xi{constructor(e){this.manager=e!==void 0?e:af,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){const n=this;return new Promise(function(s,r){n.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}}Xi.DEFAULT_MATERIAL_NAME="__DEFAULT";const ti={};class Pg extends Error{constructor(e,t){super(e),this.response=t}}class qc extends Xi{constructor(e){super(e),this.mimeType="",this.responseType="",this._abortController=new AbortController}load(e,t,n,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=Sr.get(`file:${e}`);if(r!==void 0){this.manager.itemStart(e),setTimeout(()=>{t&&t(r),this.manager.itemEnd(e)},0);return}if(ti[e]!==void 0){ti[e].push({onLoad:t,onProgress:n,onError:s});return}ti[e]=[],ti[e].push({onLoad:t,onProgress:n,onError:s});const a=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",signal:typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),o=this.mimeType,c=this.responseType;fetch(a).then(l=>{if(l.status===200||l.status===0){if(l.status===0&&Pe("FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||l.body===void 0||l.body.getReader===void 0)return l;const h=ti[e],u=l.body.getReader(),d=l.headers.get("X-File-Size")||l.headers.get("Content-Length"),f=d?parseInt(d):0,g=f!==0;let v=0;const m=new ReadableStream({start(p){S();function S(){u.read().then(({done:A,value:y})=>{if(A)p.close();else{v+=y.byteLength;const T=new ProgressEvent("progress",{lengthComputable:g,loaded:v,total:f});for(let E=0,w=h.length;E<w;E++){const _=h[E];_.onProgress&&_.onProgress(T)}p.enqueue(y),S()}},A=>{p.error(A)})}}});return new Response(m)}else throw new Pg(`fetch for "${l.url}" responded with ${l.status}: ${l.statusText}`,l)}).then(l=>{switch(c){case"arraybuffer":return l.arrayBuffer();case"blob":return l.blob();case"document":return l.text().then(h=>new DOMParser().parseFromString(h,o));case"json":return l.json();default:if(o==="")return l.text();{const u=/charset="?([^;"\s]*)"?/i.exec(o),d=u&&u[1]?u[1].toLowerCase():void 0,f=new TextDecoder(d);return l.arrayBuffer().then(g=>f.decode(g))}}}).then(l=>{Sr.add(`file:${e}`,l);const h=ti[e];delete ti[e];for(let u=0,d=h.length;u<d;u++){const f=h[u];f.onLoad&&f.onLoad(l)}}).catch(l=>{const h=ti[e];if(h===void 0)throw this.manager.itemError(e),l;delete ti[e];for(let u=0,d=h.length;u<d;u++){const f=h[u];f.onError&&f.onError(l)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}const Us=new WeakMap;class Lg extends Xi{constructor(e){super(e)}load(e,t,n,s){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,a=Sr.get(`image:${e}`);if(a!==void 0){if(a.complete===!0)r.manager.itemStart(e),setTimeout(function(){t&&t(a),r.manager.itemEnd(e)},0);else{let u=Us.get(a);u===void 0&&(u=[],Us.set(a,u)),u.push({onLoad:t,onError:s})}return a}const o=Ir("img");function c(){h(),t&&t(this);const u=Us.get(this)||[];for(let d=0;d<u.length;d++){const f=u[d];f.onLoad&&f.onLoad(this)}Us.delete(this),r.manager.itemEnd(e)}function l(u){h(),s&&s(u),Sr.remove(`image:${e}`);const d=Us.get(this)||[];for(let f=0;f<d.length;f++){const g=d[f];g.onError&&g.onError(u)}Us.delete(this),r.manager.itemError(e),r.manager.itemEnd(e)}function h(){o.removeEventListener("load",c,!1),o.removeEventListener("error",l,!1)}return o.addEventListener("load",c,!1),o.addEventListener("error",l,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),Sr.add(`image:${e}`,o),r.manager.itemStart(e),o.src=e,o}}class Ng extends Xi{constructor(e){super(e)}load(e,t,n,s){const r=this,a=new ao,o=new qc(this.manager);return o.setResponseType("arraybuffer"),o.setRequestHeader(this.requestHeader),o.setPath(this.path),o.setWithCredentials(r.withCredentials),o.load(e,function(c){let l;try{l=r.parse(c)}catch(h){s!==void 0?s(h):He(h);return}r._applyTexData(a,l),t&&t(a,l)},n,s),a}createDataTexture(e){const t=new ao;return this._applyTexData(t,this.parse(e)),t}_applyTexData(e,t){t.image!==void 0?e.image=t.image:t.data!==void 0&&(e.image.width=t.width,e.image.height=t.height,e.image.data=t.data),e.wrapS=t.wrapS!==void 0?t.wrapS:ln,e.wrapT=t.wrapT!==void 0?t.wrapT:ln,e.magFilter=t.magFilter!==void 0?t.magFilter:Ct,e.minFilter=t.minFilter!==void 0?t.minFilter:Ct,e.anisotropy=t.anisotropy!==void 0?t.anisotropy:1,t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.mipmaps!==void 0&&(e.mipmaps=t.mipmaps,e.minFilter=ri),t.mipmapCount===1&&(e.minFilter=Ct),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),e.needsUpdate=!0}}class of extends Xi{constructor(e){super(e)}load(e,t,n,s){const r=new Vt,a=new Lg(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(o){r.image=o,r.needsUpdate=!0,t!==void 0&&t(r)},n,s),r}}class $r extends pt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ue(e),this.intensity=t}dispose(){this.dispatchEvent({type:"dispose"})}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}}class Ig extends $r{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(pt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ue(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){const t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}}const xl=new Oe,bd=new N,Md=new N;class $c{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Se(512,512),this.mapType=on,this.map=null,this.mapPass=null,this.matrix=new Oe,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Vc,this._frameExtents=new Se(1,1),this._viewportCount=1,this._viewports=[new rt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,n=this.matrix;bd.setFromMatrixPosition(e.matrixWorld),t.position.copy(bd),Md.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Md),t.updateMatrixWorld(),xl.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(xl,t.coordinateSystem,t.reversedDepth),t.coordinateSystem===Nr||t.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(xl)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}const La=new N,Na=new Ot,Un=new N;class lf extends pt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Oe,this.projectionMatrix=new Oe,this.projectionMatrixInverse=new Oe,this.coordinateSystem=Hn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(La,Na,Un),Un.x===1&&Un.y===1&&Un.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(La,Na,Un.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(La,Na,Un),Un.x===1&&Un.y===1&&Un.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(La,Na,Un.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}const Ri=new N,Sd=new Se,Ed=new Se;class Bt extends lf{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=Js*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Xs*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Js*2*Math.atan(Math.tan(Xs*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Ri.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Ri.x,Ri.y).multiplyScalar(-e/Ri.z),Ri.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Ri.x,Ri.y).multiplyScalar(-e/Ri.z)}getViewSize(e,t){return this.getViewBounds(e,Sd,Ed),t.subVectors(Ed,Sd)}setViewOffset(e,t,n,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(Xs*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s;const a=this.view;if(this.view!==null&&this.view.enabled){const c=a.fullWidth,l=a.fullHeight;r+=a.offsetX*s/c,t-=a.offsetY*n/l,s*=a.width/c,n*=a.height/l}const o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}class Dg extends $c{constructor(){super(new Bt(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){const t=this.camera,n=Js*2*e.angle*this.focus,s=this.mapSize.width/this.mapSize.height*this.aspect,r=e.distance||t.far;(n!==t.fov||s!==t.aspect||r!==t.far)&&(t.fov=n,t.aspect=s,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}}class Ug extends $r{constructor(e,t,n=0,s=Math.PI/3,r=0,a=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(pt.DEFAULT_UP),this.updateMatrix(),this.target=new pt,this.distance=n,this.angle=s,this.penumbra=r,this.decay=a,this.map=null,this.shadow=new Dg}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.map=e.map,this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.distance=this.distance,t.object.angle=this.angle,t.object.decay=this.decay,t.object.penumbra=this.penumbra,t.object.target=this.target.uuid,this.map&&this.map.isTexture&&(t.object.map=this.map.toJSON(e).uuid),t.object.shadow=this.shadow.toJSON(),t}}class Fg extends $c{constructor(){super(new Bt(90,1,.5,500)),this.isPointLightShadow=!0}}class Og extends $r{constructor(e,t,n=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new Fg}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}}class Lo extends lf{constructor(e=-1,t=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=n-e,a=n+e,o=s+t,c=s-t;if(this.view!==null&&this.view.enabled){const l=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=l*this.view.offsetX,a=r+l*this.view.width,o-=h*this.view.offsetY,c=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class Bg extends $c{constructor(){super(new Lo(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class cf extends $r{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(pt.DEFAULT_UP),this.updateMatrix(),this.target=new pt,this.shadow=new Bg}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}}class kg extends $r{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}}class uf{static extractUrlBase(e){const t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}}const Fs=-90,Os=1;class zg extends pt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new Bt(Fs,Os,e,t);s.layers=this.layers,this.add(s);const r=new Bt(Fs,Os,e,t);r.layers=this.layers,this.add(r);const a=new Bt(Fs,Os,e,t);a.layers=this.layers,this.add(a);const o=new Bt(Fs,Os,e,t);o.layers=this.layers,this.add(o);const c=new Bt(Fs,Os,e,t);c.layers=this.layers,this.add(c);const l=new Bt(Fs,Os,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,s,r,a,o,c]=t;for(const l of t)this.remove(l);if(e===Hn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===Nr)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,a,o,c,l,h]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const v=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let m=!1;e.isWebGLRenderer===!0?m=e.state.buffers.depth.getReversed():m=e.reversedDepthBuffer,e.setRenderTarget(n,0,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(n,1,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),e.setRenderTarget(n,4,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),n.texture.generateMipmaps=v,e.setRenderTarget(n,5,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,h),e.setRenderTarget(u,d,f),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class Vg extends Bt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}class Td{constructor(e=1,t=0,n=0){this.radius=e,this.phi=t,this.theta=n}set(e,t,n){return this.radius=e,this.phi=t,this.theta=n,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=We(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,n){return this.radius=Math.sqrt(e*e+t*t+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,n),this.phi=Math.acos(We(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}}const bu=class bu{constructor(e,t,n,s){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,s){const r=this.elements;return r[0]=e,r[2]=t,r[1]=n,r[3]=s,this}};bu.prototype.isMatrix2=!0;let Ad=bu;class df extends Co{constructor(e=10,t=10,n=4473924,s=8947848){n=new Ue(n),s=new Ue(s);const r=t/2,a=e/t,o=e/2,c=[],l=[];for(let d=0,f=0,g=-o;d<=t;d++,g+=a){c.push(-o,0,g,o,0,g),c.push(g,0,-o,g,0,o);const v=d===r?n:s;v.toArray(l,f),f+=3,v.toArray(l,f),f+=3,v.toArray(l,f),f+=3,v.toArray(l,f),f+=3}const h=new mt;h.setAttribute("position",new Ye(c,3)),h.setAttribute("color",new Ye(l,3));const u=new hi({vertexColors:!0,toneMapped:!1});super(h,u),this.type="GridHelper"}dispose(){this.geometry.dispose(),this.material.dispose()}}class Gg extends Co{constructor(e=1){const t=[0,0,0,e,0,0,0,0,0,0,e,0,0,0,0,0,0,e],n=[1,0,0,1,.6,0,0,1,0,.6,1,0,0,0,1,0,.6,1],s=new mt;s.setAttribute("position",new Ye(t,3)),s.setAttribute("color",new Ye(n,3));const r=new hi({vertexColors:!0,toneMapped:!1});super(s,r),this.type="AxesHelper"}setColors(e,t,n){const s=new Ue,r=this.geometry.attributes.color.array;return s.set(e),s.toArray(r,0),s.toArray(r,3),s.set(t),s.toArray(r,6),s.toArray(r,9),s.set(n),s.toArray(r,12),s.toArray(r,15),this.geometry.attributes.color.needsUpdate=!0,this}dispose(){this.geometry.dispose(),this.material.dispose()}}class Hg extends Wi{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(e){if(e===void 0){Pe("Controls: connect() now requires an element.");return}this.domElement!==null&&this.disconnect(),this.domElement=e}disconnect(){}dispose(){}update(){}}function wd(i,e,t,n){const s=Wg(n);switch(t){case Bh:return i*e;case zh:return i*e/s.components*s.byteLength;case Nc:return i*e/s.components*s.byteLength;case ls:return i*e*2/s.components*s.byteLength;case Ic:return i*e*2/s.components*s.byteLength;case kh:return i*e*3/s.components*s.byteLength;case pn:return i*e*4/s.components*s.byteLength;case Dc:return i*e*4/s.components*s.byteLength;case Xa:case qa:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case $a:case Ya:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Wl:case ql:return Math.max(i,16)*Math.max(e,8)/4;case Hl:case Xl:return Math.max(i,8)*Math.max(e,8)/2;case $l:case Yl:case Zl:case Jl:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Kl:case eo:case jl:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Ql:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case ec:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case tc:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case nc:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case ic:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case sc:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case rc:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case ac:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case oc:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case lc:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case cc:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case uc:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case dc:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case hc:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case fc:case pc:case mc:return Math.ceil(i/4)*Math.ceil(e/4)*16;case gc:case _c:return Math.ceil(i/4)*Math.ceil(e/4)*8;case to:case vc:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Wg(i){switch(i){case on:case Dh:return{byteLength:1,components:1};case Rr:case Uh:case gi:return{byteLength:2,components:1};case Pc:case Lc:return{byteLength:2,components:4};case $n:case Cc:case An:return{byteLength:4,components:1};case Fh:case Oh:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Rc}}));typeof window<"u"&&(window.__THREE__?Pe("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Rc);/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function hf(){let i=null,e=!1,t=null,n=null;function s(r,a){t(r,a),n=i.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&i!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function Xg(i){const e=new WeakMap;function t(o,c){const l=o.array,h=o.usage,u=l.byteLength,d=i.createBuffer();i.bindBuffer(c,d),i.bufferData(c,l,h),o.onUploadCallback();let f;if(l instanceof Float32Array)f=i.FLOAT;else if(typeof Float16Array<"u"&&l instanceof Float16Array)f=i.HALF_FLOAT;else if(l instanceof Uint16Array)o.isFloat16BufferAttribute?f=i.HALF_FLOAT:f=i.UNSIGNED_SHORT;else if(l instanceof Int16Array)f=i.SHORT;else if(l instanceof Uint32Array)f=i.UNSIGNED_INT;else if(l instanceof Int32Array)f=i.INT;else if(l instanceof Int8Array)f=i.BYTE;else if(l instanceof Uint8Array)f=i.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)f=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:d,type:f,bytesPerElement:l.BYTES_PER_ELEMENT,version:o.version,size:u}}function n(o,c,l){const h=c.array,u=c.updateRanges;if(i.bindBuffer(l,o),u.length===0)i.bufferSubData(l,0,h);else{u.sort((f,g)=>f.start-g.start);let d=0;for(let f=1;f<u.length;f++){const g=u[d],v=u[f];v.start<=g.start+g.count+1?g.count=Math.max(g.count,v.start+v.count-g.start):(++d,u[d]=v)}u.length=d+1;for(let f=0,g=u.length;f<g;f++){const v=u[f];i.bufferSubData(l,v.start*h.BYTES_PER_ELEMENT,h,v.start,v.count)}c.clearUpdateRanges()}c.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);const c=e.get(o);c&&(i.deleteBuffer(c.buffer),e.delete(o))}function a(o,c){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const h=e.get(o);(!h||h.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const l=e.get(o);if(l===void 0)e.set(o,t(o,c));else if(l.version<o.version){if(l.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(l.buffer,o,c),l.version=o.version}}return{get:s,remove:r,update:a}}var qg=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,$g=`#ifdef USE_ALPHAHASH
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
#endif`,Yg=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Kg=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Zg=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Jg=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,jg=`#ifdef USE_AOMAP
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
#endif`,Qg=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,e_=`#ifdef USE_BATCHING
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
#endif`,t_=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,n_=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,i_=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,s_=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,r_=`#ifdef USE_IRIDESCENCE
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
#endif`,a_=`#ifdef USE_BUMPMAP
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
#endif`,o_=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,l_=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,c_=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,u_=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,d_=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,h_=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,f_=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,p_=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,m_=`#define PI 3.141592653589793
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
} // validated`,g_=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,__=`vec3 transformedNormal = objectNormal;
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
#endif`,v_=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,x_=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,y_=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,b_=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,M_="gl_FragColor = linearToOutputTexel( gl_FragColor );",S_=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,E_=`#ifdef USE_ENVMAP
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
#endif`,T_=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,A_=`#ifdef USE_ENVMAP
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
#endif`,w_=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,R_=`#ifdef USE_ENVMAP
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
#endif`,C_=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,P_=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,L_=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,N_=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,I_=`#ifdef USE_GRADIENTMAP
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
}`,D_=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,U_=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,F_=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,O_=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,B_=`#ifdef USE_ENVMAP
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
#endif`,k_=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,z_=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,V_=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,G_=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,H_=`PhysicalMaterial material;
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
#endif`,W_=`uniform sampler2D dfgLUT;
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
}`,X_=`
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
#endif`,q_=`#if defined( RE_IndirectDiffuse )
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
#endif`,$_=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Y_=`#ifdef USE_LIGHT_PROBES_GRID
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
#endif`,K_=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Z_=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,J_=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,j_=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Q_=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,e0=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,t0=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,n0=`#if defined( USE_POINTS_UV )
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
#endif`,i0=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,s0=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,r0=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,a0=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,o0=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,l0=`#ifdef USE_MORPHTARGETS
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
#endif`,c0=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,u0=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,d0=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,h0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,f0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,p0=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,m0=`#ifdef USE_NORMALMAP
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
#endif`,g0=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,_0=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,v0=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,x0=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,y0=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,b0=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,M0=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,S0=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,E0=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,T0=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,A0=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,w0=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,R0=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,C0=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,P0=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,L0=`float getShadowMask() {
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
}`,N0=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,I0=`#ifdef USE_SKINNING
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
#endif`,D0=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,U0=`#ifdef USE_SKINNING
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
#endif`,F0=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,O0=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,B0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,k0=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,z0=`#ifdef USE_TRANSMISSION
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
#endif`,V0=`#ifdef USE_TRANSMISSION
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
#endif`,G0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,H0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,W0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,X0=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const q0=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,$0=`uniform sampler2D t2D;
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
}`,Y0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,K0=`#ifdef ENVMAP_TYPE_CUBE
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
}`,Z0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,J0=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,j0=`#include <common>
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
}`,Q0=`#if DEPTH_PACKING == 3200
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
}`,ev=`#define DISTANCE
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
}`,tv=`#define DISTANCE
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
}`,nv=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,iv=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,sv=`uniform float scale;
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
}`,rv=`uniform vec3 diffuse;
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
}`,av=`#include <common>
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
}`,ov=`uniform vec3 diffuse;
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
}`,lv=`#define LAMBERT
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
}`,cv=`#define LAMBERT
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
}`,uv=`#define MATCAP
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
}`,dv=`#define MATCAP
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
}`,hv=`#define NORMAL
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
}`,fv=`#define NORMAL
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
}`,pv=`#define PHONG
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
}`,mv=`#define PHONG
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
}`,gv=`#define STANDARD
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
}`,_v=`#define STANDARD
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
}`,vv=`#define TOON
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
}`,xv=`#define TOON
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
}`,yv=`uniform float size;
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
}`,bv=`uniform vec3 diffuse;
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
}`,Mv=`#include <common>
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
}`,Sv=`uniform vec3 color;
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
}`,Ev=`uniform float rotation;
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
}`,Tv=`uniform vec3 diffuse;
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
}`,Ge={alphahash_fragment:qg,alphahash_pars_fragment:$g,alphamap_fragment:Yg,alphamap_pars_fragment:Kg,alphatest_fragment:Zg,alphatest_pars_fragment:Jg,aomap_fragment:jg,aomap_pars_fragment:Qg,batching_pars_vertex:e_,batching_vertex:t_,begin_vertex:n_,beginnormal_vertex:i_,bsdfs:s_,iridescence_fragment:r_,bumpmap_pars_fragment:a_,clipping_planes_fragment:o_,clipping_planes_pars_fragment:l_,clipping_planes_pars_vertex:c_,clipping_planes_vertex:u_,color_fragment:d_,color_pars_fragment:h_,color_pars_vertex:f_,color_vertex:p_,common:m_,cube_uv_reflection_fragment:g_,defaultnormal_vertex:__,displacementmap_pars_vertex:v_,displacementmap_vertex:x_,emissivemap_fragment:y_,emissivemap_pars_fragment:b_,colorspace_fragment:M_,colorspace_pars_fragment:S_,envmap_fragment:E_,envmap_common_pars_fragment:T_,envmap_pars_fragment:A_,envmap_pars_vertex:w_,envmap_physical_pars_fragment:B_,envmap_vertex:R_,fog_vertex:C_,fog_pars_vertex:P_,fog_fragment:L_,fog_pars_fragment:N_,gradientmap_pars_fragment:I_,lightmap_pars_fragment:D_,lights_lambert_fragment:U_,lights_lambert_pars_fragment:F_,lights_pars_begin:O_,lights_toon_fragment:k_,lights_toon_pars_fragment:z_,lights_phong_fragment:V_,lights_phong_pars_fragment:G_,lights_physical_fragment:H_,lights_physical_pars_fragment:W_,lights_fragment_begin:X_,lights_fragment_maps:q_,lights_fragment_end:$_,lightprobes_pars_fragment:Y_,logdepthbuf_fragment:K_,logdepthbuf_pars_fragment:Z_,logdepthbuf_pars_vertex:J_,logdepthbuf_vertex:j_,map_fragment:Q_,map_pars_fragment:e0,map_particle_fragment:t0,map_particle_pars_fragment:n0,metalnessmap_fragment:i0,metalnessmap_pars_fragment:s0,morphinstance_vertex:r0,morphcolor_vertex:a0,morphnormal_vertex:o0,morphtarget_pars_vertex:l0,morphtarget_vertex:c0,normal_fragment_begin:u0,normal_fragment_maps:d0,normal_pars_fragment:h0,normal_pars_vertex:f0,normal_vertex:p0,normalmap_pars_fragment:m0,clearcoat_normal_fragment_begin:g0,clearcoat_normal_fragment_maps:_0,clearcoat_pars_fragment:v0,iridescence_pars_fragment:x0,opaque_fragment:y0,packing:b0,premultiplied_alpha_fragment:M0,project_vertex:S0,dithering_fragment:E0,dithering_pars_fragment:T0,roughnessmap_fragment:A0,roughnessmap_pars_fragment:w0,shadowmap_pars_fragment:R0,shadowmap_pars_vertex:C0,shadowmap_vertex:P0,shadowmask_pars_fragment:L0,skinbase_vertex:N0,skinning_pars_vertex:I0,skinning_vertex:D0,skinnormal_vertex:U0,specularmap_fragment:F0,specularmap_pars_fragment:O0,tonemapping_fragment:B0,tonemapping_pars_fragment:k0,transmission_fragment:z0,transmission_pars_fragment:V0,uv_pars_fragment:G0,uv_pars_vertex:H0,uv_vertex:W0,worldpos_vertex:X0,background_vert:q0,background_frag:$0,backgroundCube_vert:Y0,backgroundCube_frag:K0,cube_vert:Z0,cube_frag:J0,depth_vert:j0,depth_frag:Q0,distance_vert:ev,distance_frag:tv,equirect_vert:nv,equirect_frag:iv,linedashed_vert:sv,linedashed_frag:rv,meshbasic_vert:av,meshbasic_frag:ov,meshlambert_vert:lv,meshlambert_frag:cv,meshmatcap_vert:uv,meshmatcap_frag:dv,meshnormal_vert:hv,meshnormal_frag:fv,meshphong_vert:pv,meshphong_frag:mv,meshphysical_vert:gv,meshphysical_frag:_v,meshtoon_vert:vv,meshtoon_frag:xv,points_vert:yv,points_frag:bv,shadow_vert:Mv,shadow_frag:Sv,sprite_vert:Ev,sprite_frag:Tv},me={common:{diffuse:{value:new Ue(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ke},alphaMap:{value:null},alphaMapTransform:{value:new ke},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ke}},envmap:{envMap:{value:null},envMapRotation:{value:new ke},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ke}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ke}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ke},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ke},normalScale:{value:new Se(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ke},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ke}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ke}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ke}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ue(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new N},probesMax:{value:new N},probesResolution:{value:new N}},points:{diffuse:{value:new Ue(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ke},alphaTest:{value:0},uvTransform:{value:new ke}},sprite:{diffuse:{value:new Ue(16777215)},opacity:{value:1},center:{value:new Se(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ke},alphaMap:{value:null},alphaMapTransform:{value:new ke},alphaTest:{value:0}}},kn={basic:{uniforms:Yt([me.common,me.specularmap,me.envmap,me.aomap,me.lightmap,me.fog]),vertexShader:Ge.meshbasic_vert,fragmentShader:Ge.meshbasic_frag},lambert:{uniforms:Yt([me.common,me.specularmap,me.envmap,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.fog,me.lights,{emissive:{value:new Ue(0)},envMapIntensity:{value:1}}]),vertexShader:Ge.meshlambert_vert,fragmentShader:Ge.meshlambert_frag},phong:{uniforms:Yt([me.common,me.specularmap,me.envmap,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.fog,me.lights,{emissive:{value:new Ue(0)},specular:{value:new Ue(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Ge.meshphong_vert,fragmentShader:Ge.meshphong_frag},standard:{uniforms:Yt([me.common,me.envmap,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.roughnessmap,me.metalnessmap,me.fog,me.lights,{emissive:{value:new Ue(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ge.meshphysical_vert,fragmentShader:Ge.meshphysical_frag},toon:{uniforms:Yt([me.common,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.gradientmap,me.fog,me.lights,{emissive:{value:new Ue(0)}}]),vertexShader:Ge.meshtoon_vert,fragmentShader:Ge.meshtoon_frag},matcap:{uniforms:Yt([me.common,me.bumpmap,me.normalmap,me.displacementmap,me.fog,{matcap:{value:null}}]),vertexShader:Ge.meshmatcap_vert,fragmentShader:Ge.meshmatcap_frag},points:{uniforms:Yt([me.points,me.fog]),vertexShader:Ge.points_vert,fragmentShader:Ge.points_frag},dashed:{uniforms:Yt([me.common,me.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ge.linedashed_vert,fragmentShader:Ge.linedashed_frag},depth:{uniforms:Yt([me.common,me.displacementmap]),vertexShader:Ge.depth_vert,fragmentShader:Ge.depth_frag},normal:{uniforms:Yt([me.common,me.bumpmap,me.normalmap,me.displacementmap,{opacity:{value:1}}]),vertexShader:Ge.meshnormal_vert,fragmentShader:Ge.meshnormal_frag},sprite:{uniforms:Yt([me.sprite,me.fog]),vertexShader:Ge.sprite_vert,fragmentShader:Ge.sprite_frag},background:{uniforms:{uvTransform:{value:new ke},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ge.background_vert,fragmentShader:Ge.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ke}},vertexShader:Ge.backgroundCube_vert,fragmentShader:Ge.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ge.cube_vert,fragmentShader:Ge.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ge.equirect_vert,fragmentShader:Ge.equirect_frag},distance:{uniforms:Yt([me.common,me.displacementmap,{referencePosition:{value:new N},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ge.distance_vert,fragmentShader:Ge.distance_frag},shadow:{uniforms:Yt([me.lights,me.fog,{color:{value:new Ue(0)},opacity:{value:1}}]),vertexShader:Ge.shadow_vert,fragmentShader:Ge.shadow_frag}};kn.physical={uniforms:Yt([kn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ke},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ke},clearcoatNormalScale:{value:new Se(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ke},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ke},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ke},sheen:{value:0},sheenColor:{value:new Ue(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ke},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ke},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ke},transmissionSamplerSize:{value:new Se},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ke},attenuationDistance:{value:0},attenuationColor:{value:new Ue(0)},specularColor:{value:new Ue(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ke},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ke},anisotropyVector:{value:new Se},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ke}}]),vertexShader:Ge.meshphysical_vert,fragmentShader:Ge.meshphysical_frag};const Ia={r:0,b:0,g:0},Av=new Oe,ff=new ke;ff.set(-1,0,0,0,1,0,0,0,1);function wv(i,e,t,n,s,r){const a=new Ue(0);let o=s===!0?0:1,c,l,h=null,u=0,d=null;function f(S){let A=S.isScene===!0?S.background:null;if(A&&A.isTexture){const y=S.backgroundBlurriness>0;A=e.get(A,y)}return A}function g(S){let A=!1;const y=f(S);y===null?m(a,o):y&&y.isColor&&(m(y,1),A=!0);const T=i.xr.getEnvironmentBlendMode();T==="additive"?t.buffers.color.setClear(0,0,0,1,r):T==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(i.autoClear||A)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function v(S,A){const y=f(A);y&&(y.isCubeTexture||y.mapping===wo)?(l===void 0&&(l=new ft(new ms(1,1,1),new Yn({name:"BackgroundCubeMaterial",uniforms:er(kn.backgroundCube.uniforms),vertexShader:kn.backgroundCube.vertexShader,fragmentShader:kn.backgroundCube.fragmentShader,side:en,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),l.geometry.deleteAttribute("uv"),l.onBeforeRender=function(T,E,w){this.matrixWorld.copyPosition(w.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(l)),l.material.uniforms.envMap.value=y,l.material.uniforms.backgroundBlurriness.value=A.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(Av.makeRotationFromEuler(A.backgroundRotation)).transpose(),y.isCubeTexture&&y.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(ff),l.material.toneMapped=qe.getTransfer(y.colorSpace)!==tt,(h!==y||u!==y.version||d!==i.toneMapping)&&(l.material.needsUpdate=!0,h=y,u=y.version,d=i.toneMapping),l.layers.enableAll(),S.unshift(l,l.geometry,l.material,0,0,null)):y&&y.isTexture&&(c===void 0&&(c=new ft(new Po(2,2),new Yn({name:"BackgroundMaterial",uniforms:er(kn.background.uniforms),vertexShader:kn.background.vertexShader,fragmentShader:kn.background.fragmentShader,side:mi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(c)),c.material.uniforms.t2D.value=y,c.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,c.material.toneMapped=qe.getTransfer(y.colorSpace)!==tt,y.matrixAutoUpdate===!0&&y.updateMatrix(),c.material.uniforms.uvTransform.value.copy(y.matrix),(h!==y||u!==y.version||d!==i.toneMapping)&&(c.material.needsUpdate=!0,h=y,u=y.version,d=i.toneMapping),c.layers.enableAll(),S.unshift(c,c.geometry,c.material,0,0,null))}function m(S,A){S.getRGB(Ia,nf(i)),t.buffers.color.setClear(Ia.r,Ia.g,Ia.b,A,r)}function p(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return a},setClearColor:function(S,A=1){a.set(S),o=A,m(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(S){o=S,m(a,o)},render:g,addToRenderList:v,dispose:p}}function Rv(i,e){const t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=d(null);let r=s,a=!1;function o(R,L,z,X,O){let I=!1;const V=u(R,X,z,L);r!==V&&(r=V,l(r.object)),I=f(R,X,z,O),I&&g(R,X,z,O),O!==null&&e.update(O,i.ELEMENT_ARRAY_BUFFER),(I||a)&&(a=!1,y(R,L,z,X),O!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(O).buffer))}function c(){return i.createVertexArray()}function l(R){return i.bindVertexArray(R)}function h(R){return i.deleteVertexArray(R)}function u(R,L,z,X){const O=X.wireframe===!0;let I=n[L.id];I===void 0&&(I={},n[L.id]=I);const V=R.isInstancedMesh===!0?R.id:0;let $=I[V];$===void 0&&($={},I[V]=$);let J=$[z.id];J===void 0&&(J={},$[z.id]=J);let re=J[O];return re===void 0&&(re=d(c()),J[O]=re),re}function d(R){const L=[],z=[],X=[];for(let O=0;O<t;O++)L[O]=0,z[O]=0,X[O]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:L,enabledAttributes:z,attributeDivisors:X,object:R,attributes:{},index:null}}function f(R,L,z,X){const O=r.attributes,I=L.attributes;let V=0;const $=z.getAttributes();for(const J in $)if($[J].location>=0){const se=O[J];let ae=I[J];if(ae===void 0&&(J==="instanceMatrix"&&R.instanceMatrix&&(ae=R.instanceMatrix),J==="instanceColor"&&R.instanceColor&&(ae=R.instanceColor)),se===void 0||se.attribute!==ae||ae&&se.data!==ae.data)return!0;V++}return r.attributesNum!==V||r.index!==X}function g(R,L,z,X){const O={},I=L.attributes;let V=0;const $=z.getAttributes();for(const J in $)if($[J].location>=0){let se=I[J];se===void 0&&(J==="instanceMatrix"&&R.instanceMatrix&&(se=R.instanceMatrix),J==="instanceColor"&&R.instanceColor&&(se=R.instanceColor));const ae={};ae.attribute=se,se&&se.data&&(ae.data=se.data),O[J]=ae,V++}r.attributes=O,r.attributesNum=V,r.index=X}function v(){const R=r.newAttributes;for(let L=0,z=R.length;L<z;L++)R[L]=0}function m(R){p(R,0)}function p(R,L){const z=r.newAttributes,X=r.enabledAttributes,O=r.attributeDivisors;z[R]=1,X[R]===0&&(i.enableVertexAttribArray(R),X[R]=1),O[R]!==L&&(i.vertexAttribDivisor(R,L),O[R]=L)}function S(){const R=r.newAttributes,L=r.enabledAttributes;for(let z=0,X=L.length;z<X;z++)L[z]!==R[z]&&(i.disableVertexAttribArray(z),L[z]=0)}function A(R,L,z,X,O,I,V){V===!0?i.vertexAttribIPointer(R,L,z,O,I):i.vertexAttribPointer(R,L,z,X,O,I)}function y(R,L,z,X){v();const O=X.attributes,I=z.getAttributes(),V=L.defaultAttributeValues;for(const $ in I){const J=I[$];if(J.location>=0){let re=O[$];if(re===void 0&&($==="instanceMatrix"&&R.instanceMatrix&&(re=R.instanceMatrix),$==="instanceColor"&&R.instanceColor&&(re=R.instanceColor)),re!==void 0){const se=re.normalized,ae=re.itemSize,xe=e.get(re);if(xe===void 0)continue;const ye=xe.buffer,le=xe.type,B=xe.bytesPerElement,Z=le===i.INT||le===i.UNSIGNED_INT||re.gpuType===Cc;if(re.isInterleavedBufferAttribute){const ee=re.data,we=ee.stride,Fe=re.offset;if(ee.isInstancedInterleavedBuffer){for(let Ie=0;Ie<J.locationSize;Ie++)p(J.location+Ie,ee.meshPerAttribute);R.isInstancedMesh!==!0&&X._maxInstanceCount===void 0&&(X._maxInstanceCount=ee.meshPerAttribute*ee.count)}else for(let Ie=0;Ie<J.locationSize;Ie++)m(J.location+Ie);i.bindBuffer(i.ARRAY_BUFFER,ye);for(let Ie=0;Ie<J.locationSize;Ie++)A(J.location+Ie,ae/J.locationSize,le,se,we*B,(Fe+ae/J.locationSize*Ie)*B,Z)}else{if(re.isInstancedBufferAttribute){for(let ee=0;ee<J.locationSize;ee++)p(J.location+ee,re.meshPerAttribute);R.isInstancedMesh!==!0&&X._maxInstanceCount===void 0&&(X._maxInstanceCount=re.meshPerAttribute*re.count)}else for(let ee=0;ee<J.locationSize;ee++)m(J.location+ee);i.bindBuffer(i.ARRAY_BUFFER,ye);for(let ee=0;ee<J.locationSize;ee++)A(J.location+ee,ae/J.locationSize,le,se,ae*B,ae/J.locationSize*ee*B,Z)}}else if(V!==void 0){const se=V[$];if(se!==void 0)switch(se.length){case 2:i.vertexAttrib2fv(J.location,se);break;case 3:i.vertexAttrib3fv(J.location,se);break;case 4:i.vertexAttrib4fv(J.location,se);break;default:i.vertexAttrib1fv(J.location,se)}}}}S()}function T(){b();for(const R in n){const L=n[R];for(const z in L){const X=L[z];for(const O in X){const I=X[O];for(const V in I)h(I[V].object),delete I[V];delete X[O]}}delete n[R]}}function E(R){if(n[R.id]===void 0)return;const L=n[R.id];for(const z in L){const X=L[z];for(const O in X){const I=X[O];for(const V in I)h(I[V].object),delete I[V];delete X[O]}}delete n[R.id]}function w(R){for(const L in n){const z=n[L];for(const X in z){const O=z[X];if(O[R.id]===void 0)continue;const I=O[R.id];for(const V in I)h(I[V].object),delete I[V];delete O[R.id]}}}function _(R){for(const L in n){const z=n[L],X=R.isInstancedMesh===!0?R.id:0,O=z[X];if(O!==void 0){for(const I in O){const V=O[I];for(const $ in V)h(V[$].object),delete V[$];delete O[I]}delete z[X],Object.keys(z).length===0&&delete n[L]}}}function b(){P(),a=!0,r!==s&&(r=s,l(r.object))}function P(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:b,resetDefaultState:P,dispose:T,releaseStatesOfGeometry:E,releaseStatesOfObject:_,releaseStatesOfProgram:w,initAttributes:v,enableAttribute:m,disableUnusedAttributes:S}}function Cv(i,e,t){let n;function s(c){n=c}function r(c,l){i.drawArrays(n,c,l),t.update(l,n,1)}function a(c,l,h){h!==0&&(i.drawArraysInstanced(n,c,l,h),t.update(l,n,h))}function o(c,l,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,l,0,h);let d=0;for(let f=0;f<h;f++)d+=l[f];t.update(d,n,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function Pv(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){const w=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(w.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(w){return!(w!==pn&&n.convert(w)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(w){const _=w===gi&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(w!==on&&n.convert(w)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&w!==An&&!_)}function c(w){if(w==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";w="mediump"}return w==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=t.precision!==void 0?t.precision:"highp";const h=c(l);h!==l&&(Pe("WebGLRenderer:",l,"not supported, using",h,"instead."),l=h);const u=t.logarithmicDepthBuffer===!0,d=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&d===!1&&Pe("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");const f=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),p=i.getParameter(i.MAX_VERTEX_ATTRIBS),S=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),A=i.getParameter(i.MAX_VARYING_VECTORS),y=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),T=i.getParameter(i.MAX_SAMPLES),E=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:c,textureFormatReadable:a,textureTypeReadable:o,precision:l,logarithmicDepthBuffer:u,reversedDepthBuffer:d,maxTextures:f,maxVertexTextures:g,maxTextureSize:v,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:S,maxVaryings:A,maxFragmentUniforms:y,maxSamples:T,samples:E}}function Lv(i){const e=this;let t=null,n=0,s=!1,r=!1;const a=new Li,o=new ke,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){const f=u.length!==0||d||n!==0||s;return s=d,n=u.length,f},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,d){t=h(u,d,0)},this.setState=function(u,d,f){const g=u.clippingPlanes,v=u.clipIntersection,m=u.clipShadows,p=i.get(u);if(!s||g===null||g.length===0||r&&!m)r?h(null):l();else{const S=r?0:n,A=S*4;let y=p.clippingState||null;c.value=y,y=h(g,d,A,f);for(let T=0;T!==A;++T)y[T]=t[T];p.clippingState=y,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=S}};function l(){c.value!==t&&(c.value=t,c.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(u,d,f,g){const v=u!==null?u.length:0;let m=null;if(v!==0){if(m=c.value,g!==!0||m===null){const p=f+v*4,S=d.matrixWorldInverse;o.getNormalMatrix(S),(m===null||m.length<p)&&(m=new Float32Array(p));for(let A=0,y=f;A!==v;++A,y+=4)a.copy(u[A]).applyMatrix4(S,o),a.normal.toArray(m,y),m[y+3]=a.constant}c.value=m,c.needsUpdate=!0}return e.numPlanes=v,e.numIntersection=0,m}}const Fi=4,Rd=[.125,.215,.35,.446,.526,.582],es=20,Nv=256,mr=new Lo,Cd=new Ue;let yl=null,bl=0,Ml=0,Sl=!1;const Iv=new N;class Pd{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,s=100,r={}){const{size:a=256,position:o=Iv}=r;yl=this._renderer.getRenderTarget(),bl=this._renderer.getActiveCubeFace(),Ml=this._renderer.getActiveMipmapLevel(),Sl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);const c=this._allocateTargets();return c.depthBuffer=!0,this._sceneToCubeUV(e,n,s,c,o),t>0&&this._blur(c,0,0,t),this._applyPMREM(c),this._cleanup(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Id(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Nd(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(yl,bl,Ml),this._renderer.xr.enabled=Sl,e.scissorTest=!1,Bs(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===os||e.mapping===Zs?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),yl=this._renderer.getRenderTarget(),bl=this._renderer.getActiveCubeFace(),Ml=this._renderer.getActiveMipmapLevel(),Sl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Ct,minFilter:Ct,generateMipmaps:!1,type:gi,format:pn,colorSpace:no,depthBuffer:!1},s=Ld(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Ld(e,t,n);const{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=Dv(r)),this._blurMaterial=Fv(r,e,t),this._ggxMaterial=Uv(r,e,t)}return s}_compileMaterial(e){const t=new ft(new mt,e);this._renderer.compile(t,mr)}_sceneToCubeUV(e,t,n,s,r){const c=new Bt(90,1,t,n),l=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],u=this._renderer,d=u.autoClear,f=u.toneMapping;u.getClearColor(Cd),u.toneMapping=Xn,u.autoClear=!1,u.state.buffers.depth.getReversed()&&(u.setRenderTarget(s),u.clearDepth(),u.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new ft(new ms,new cs({name:"PMREM.Background",side:en,depthWrite:!1,depthTest:!1})));const v=this._backgroundBox,m=v.material;let p=!1;const S=e.background;S?S.isColor&&(m.color.copy(S),e.background=null,p=!0):(m.color.copy(Cd),p=!0);for(let A=0;A<6;A++){const y=A%3;y===0?(c.up.set(0,l[A],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x+h[A],r.y,r.z)):y===1?(c.up.set(0,0,l[A]),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y+h[A],r.z)):(c.up.set(0,l[A],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y,r.z+h[A]));const T=this._cubeSize;Bs(s,y*T,A>2?T:0,T,T),u.setRenderTarget(s),p&&u.render(v,c),u.render(e,c)}u.toneMapping=f,u.autoClear=d,e.background=S}_textureToCubeUV(e,t){const n=this._renderer,s=e.mapping===os||e.mapping===Zs;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Id()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Nd());const r=s?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;const o=r.uniforms;o.envMap.value=e;const c=this._cubeSize;Bs(t,0,0,3*c,2*c),n.setRenderTarget(t),n.render(a,mr)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;const s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=n}_applyGGXFilter(e,t,n){const s=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;const c=a.uniforms,l=n/(this._lodMeshes.length-1),h=t/(this._lodMeshes.length-1),u=Math.sqrt(l*l-h*h),d=0+l*1.25,f=u*d,{_lodMax:g}=this,v=this._sizeLods[n],m=3*v*(n>g-Fi?n-g+Fi:0),p=4*(this._cubeSize-v);c.envMap.value=e.texture,c.roughness.value=f,c.mipInt.value=g-t,Bs(r,m,p,3*v,2*v),s.setRenderTarget(r),s.render(o,mr),c.envMap.value=r.texture,c.roughness.value=0,c.mipInt.value=g-n,Bs(e,m,p,3*v,2*v),s.setRenderTarget(e),s.render(o,mr)}_blur(e,t,n,s,r){const a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,s,"latitudinal",r),this._halfBlur(a,e,n,n,s,"longitudinal",r)}_halfBlur(e,t,n,s,r,a,o){const c=this._renderer,l=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&He("blur direction must be either latitudinal or longitudinal!");const h=3,u=this._lodMeshes[s];u.material=l;const d=l.uniforms,f=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*f):2*Math.PI/(2*es-1),v=r/g,m=isFinite(r)?1+Math.floor(h*v):es;m>es&&Pe(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${es}`);const p=[];let S=0;for(let w=0;w<es;++w){const _=w/v,b=Math.exp(-_*_/2);p.push(b),w===0?S+=b:w<m&&(S+=2*b)}for(let w=0;w<p.length;w++)p[w]=p[w]/S;d.envMap.value=e.texture,d.samples.value=m,d.weights.value=p,d.latitudinal.value=a==="latitudinal",o&&(d.poleAxis.value=o);const{_lodMax:A}=this;d.dTheta.value=g,d.mipInt.value=A-n;const y=this._sizeLods[s],T=3*y*(s>A-Fi?s-A+Fi:0),E=4*(this._cubeSize-y);Bs(t,T,E,3*y,2*y),c.setRenderTarget(t),c.render(u,mr)}}function Dv(i){const e=[],t=[],n=[];let s=i;const r=i-Fi+1+Rd.length;for(let a=0;a<r;a++){const o=Math.pow(2,s);e.push(o);let c=1/o;a>i-Fi?c=Rd[a-i+Fi-1]:a===0&&(c=0),t.push(c);const l=1/(o-2),h=-l,u=1+l,d=[h,h,u,h,u,u,h,h,u,u,h,u],f=6,g=6,v=3,m=2,p=1,S=new Float32Array(v*g*f),A=new Float32Array(m*g*f),y=new Float32Array(p*g*f);for(let E=0;E<f;E++){const w=E%3*2/3-1,_=E>2?0:-1,b=[w,_,0,w+2/3,_,0,w+2/3,_+1,0,w,_,0,w+2/3,_+1,0,w,_+1,0];S.set(b,v*g*E),A.set(d,m*g*E);const P=[E,E,E,E,E,E];y.set(P,p*g*E)}const T=new mt;T.setAttribute("position",new tn(S,v)),T.setAttribute("uv",new tn(A,m)),T.setAttribute("faceIndex",new tn(y,p)),n.push(new ft(T,null)),s>Fi&&s--}return{lodMeshes:n,sizeLods:e,sigmas:t}}function Ld(i,e,t){const n=new qn(i,e,t);return n.texture.mapping=wo,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Bs(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function Uv(i,e,t){return new Yn({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:Nv,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:No(),fragmentShader:`

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
		`,blending:ui,depthTest:!1,depthWrite:!1})}function Fv(i,e,t){const n=new Float32Array(es),s=new N(0,1,0);return new Yn({name:"SphericalGaussianBlur",defines:{n:es,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:No(),fragmentShader:`

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
		`,blending:ui,depthTest:!1,depthWrite:!1})}function Nd(){return new Yn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:No(),fragmentShader:`

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
		`,blending:ui,depthTest:!1,depthWrite:!1})}function Id(){return new Yn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:No(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:ui,depthTest:!1,depthWrite:!1})}function No(){return`

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
	`}class pf extends qn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new Zh(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new ms(5,5,5),r=new Yn({name:"CubemapFromEquirect",uniforms:er(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:en,blending:ui});r.uniforms.tEquirect.value=t;const a=new ft(s,r),o=t.minFilter;return t.minFilter===ri&&(t.minFilter=Ct),new zg(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){const r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,s);e.setRenderTarget(r)}}function Ov(i){let e=new WeakMap,t=new WeakMap,n=null;function s(d,f=!1){return d==null?null:f?a(d):r(d)}function r(d){if(d&&d.isTexture){const f=d.mapping;if(f===Go||f===Ho)if(e.has(d)){const g=e.get(d).texture;return o(g,d.mapping)}else{const g=d.image;if(g&&g.height>0){const v=new pf(g.height);return v.fromEquirectangularTexture(i,d),e.set(d,v),d.addEventListener("dispose",l),o(v.texture,d.mapping)}else return null}}return d}function a(d){if(d&&d.isTexture){const f=d.mapping,g=f===Go||f===Ho,v=f===os||f===Zs;if(g||v){let m=t.get(d);const p=m!==void 0?m.texture.pmremVersion:0;if(d.isRenderTargetTexture&&d.pmremVersion!==p)return n===null&&(n=new Pd(i)),m=g?n.fromEquirectangular(d,m):n.fromCubemap(d,m),m.texture.pmremVersion=d.pmremVersion,t.set(d,m),m.texture;if(m!==void 0)return m.texture;{const S=d.image;return g&&S&&S.height>0||v&&S&&c(S)?(n===null&&(n=new Pd(i)),m=g?n.fromEquirectangular(d):n.fromCubemap(d),m.texture.pmremVersion=d.pmremVersion,t.set(d,m),d.addEventListener("dispose",h),m.texture):null}}}return d}function o(d,f){return f===Go?d.mapping=os:f===Ho&&(d.mapping=Zs),d}function c(d){let f=0;const g=6;for(let v=0;v<g;v++)d[v]!==void 0&&f++;return f===g}function l(d){const f=d.target;f.removeEventListener("dispose",l);const g=e.get(f);g!==void 0&&(e.delete(f),g.dispose())}function h(d){const f=d.target;f.removeEventListener("dispose",h);const g=t.get(f);g!==void 0&&(t.delete(f),g.dispose())}function u(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:u}}function Bv(i){const e={};function t(n){if(e[n]!==void 0)return e[n];const s=i.getExtension(n);return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const s=t(n);return s===null&&Ws("WebGLRenderer: "+n+" extension not supported."),s}}}function kv(i,e,t,n){const s={},r=new WeakMap;function a(u){const d=u.target;d.index!==null&&e.remove(d.index);for(const g in d.attributes)e.remove(d.attributes[g]);d.removeEventListener("dispose",a),delete s[d.id];const f=r.get(d);f&&(e.remove(f),r.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function o(u,d){return s[d.id]===!0||(d.addEventListener("dispose",a),s[d.id]=!0,t.memory.geometries++),d}function c(u){const d=u.attributes;for(const f in d)e.update(d[f],i.ARRAY_BUFFER)}function l(u){const d=[],f=u.index,g=u.attributes.position;let v=0;if(g===void 0)return;if(f!==null){const S=f.array;v=f.version;for(let A=0,y=S.length;A<y;A+=3){const T=S[A+0],E=S[A+1],w=S[A+2];d.push(T,E,E,w,w,T)}}else{const S=g.array;v=g.version;for(let A=0,y=S.length/3-1;A<y;A+=3){const T=A+0,E=A+1,w=A+2;d.push(T,E,E,w,w,T)}}const m=new(g.count>=65535?qh:Xh)(d,1);m.version=v;const p=r.get(u);p&&e.remove(p),r.set(u,m)}function h(u){const d=r.get(u);if(d){const f=u.index;f!==null&&d.version<f.version&&l(u)}else l(u);return r.get(u)}return{get:o,update:c,getWireframeAttribute:h}}function zv(i,e,t){let n;function s(u){n=u}let r,a;function o(u){r=u.type,a=u.bytesPerElement}function c(u,d){i.drawElements(n,d,r,u*a),t.update(d,n,1)}function l(u,d,f){f!==0&&(i.drawElementsInstanced(n,d,r,u*a,f),t.update(d,n,f))}function h(u,d,f){if(f===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,d,0,r,u,0,f);let v=0;for(let m=0;m<f;m++)v+=d[m];t.update(v,n,1)}this.setMode=s,this.setIndex=o,this.render=c,this.renderInstances=l,this.renderMultiDraw=h}function Vv(i){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(t.calls++,a){case i.TRIANGLES:t.triangles+=o*(r/3);break;case i.LINES:t.lines+=o*(r/2);break;case i.LINE_STRIP:t.lines+=o*(r-1);break;case i.LINE_LOOP:t.lines+=o*r;break;case i.POINTS:t.points+=o*r;break;default:He("WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function Gv(i,e,t){const n=new WeakMap,s=new rt;function r(a,o,c){const l=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=h!==void 0?h.length:0;let d=n.get(o);if(d===void 0||d.count!==u){let b=function(){w.dispose(),n.delete(o),o.removeEventListener("dispose",b)};d!==void 0&&d.texture.dispose();const f=o.morphAttributes.position!==void 0,g=o.morphAttributes.normal!==void 0,v=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],p=o.morphAttributes.normal||[],S=o.morphAttributes.color||[];let A=0;f===!0&&(A=1),g===!0&&(A=2),v===!0&&(A=3);let y=o.attributes.position.count*A,T=1;y>e.maxTextureSize&&(T=Math.ceil(y/e.maxTextureSize),y=e.maxTextureSize);const E=new Float32Array(y*T*4*u),w=new Gh(E,y,T,u);w.type=An,w.needsUpdate=!0;const _=A*4;for(let P=0;P<u;P++){const R=m[P],L=p[P],z=S[P],X=y*T*4*P;for(let O=0;O<R.count;O++){const I=O*_;f===!0&&(s.fromBufferAttribute(R,O),E[X+I+0]=s.x,E[X+I+1]=s.y,E[X+I+2]=s.z,E[X+I+3]=0),g===!0&&(s.fromBufferAttribute(L,O),E[X+I+4]=s.x,E[X+I+5]=s.y,E[X+I+6]=s.z,E[X+I+7]=0),v===!0&&(s.fromBufferAttribute(z,O),E[X+I+8]=s.x,E[X+I+9]=s.y,E[X+I+10]=s.z,E[X+I+11]=z.itemSize===4?s.w:1)}}d={count:u,texture:w,size:new Se(y,T)},n.set(o,d),o.addEventListener("dispose",b)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)c.getUniforms().setValue(i,"morphTexture",a.morphTexture,t);else{let f=0;for(let v=0;v<l.length;v++)f+=l[v];const g=o.morphTargetsRelative?1:1-f;c.getUniforms().setValue(i,"morphTargetBaseInfluence",g),c.getUniforms().setValue(i,"morphTargetInfluences",l)}c.getUniforms().setValue(i,"morphTargetsTexture",d.texture,t),c.getUniforms().setValue(i,"morphTargetsTextureSize",d.size)}return{update:r}}function Hv(i,e,t,n,s){let r=new WeakMap;function a(l){const h=s.render.frame,u=l.geometry,d=e.get(l,u);if(r.get(d)!==h&&(e.update(d),r.set(d,h)),l.isInstancedMesh&&(l.hasEventListener("dispose",c)===!1&&l.addEventListener("dispose",c),r.get(l)!==h&&(t.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,i.ARRAY_BUFFER),r.set(l,h))),l.isSkinnedMesh){const f=l.skeleton;r.get(f)!==h&&(f.update(),r.set(f,h))}return d}function o(){r=new WeakMap}function c(l){const h=l.target;h.removeEventListener("dispose",c),n.releaseStatesOfObject(h),t.remove(h.instanceMatrix),h.instanceColor!==null&&t.remove(h.instanceColor)}return{update:a,dispose:o}}const Wv={[Ah]:"LINEAR_TONE_MAPPING",[wh]:"REINHARD_TONE_MAPPING",[Rh]:"CINEON_TONE_MAPPING",[Ch]:"ACES_FILMIC_TONE_MAPPING",[Lh]:"AGX_TONE_MAPPING",[Nh]:"NEUTRAL_TONE_MAPPING",[Ph]:"CUSTOM_TONE_MAPPING"};function Xv(i,e,t,n,s,r){const a=new qn(e,t,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,depthTexture:s?new js(e,t):void 0}),o=new qn(e,t,{type:gi,depthBuffer:!1,stencilBuffer:!1}),c=new mt;c.setAttribute("position",new Ye([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new Ye([0,2,0,0,2,0],2));const l=new mg({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),h=new ft(c,l),u=new Lo(-1,1,1,-1,0,1);let d=null,f=null,g=!1,v,m=null,p=[],S=!1;this.setSize=function(A,y){a.setSize(A,y),o.setSize(A,y);for(let T=0;T<p.length;T++){const E=p[T];E.setSize&&E.setSize(A,y)}},this.setEffects=function(A){p=A,S=p.length>0&&p[0].isRenderPass===!0;const y=a.width,T=a.height;for(let E=0;E<p.length;E++){const w=p[E];w.setSize&&w.setSize(y,T)}},this.begin=function(A,y){if(g||A.toneMapping===Xn&&p.length===0)return!1;if(m=y,y!==null){const T=y.width,E=y.height;(a.width!==T||a.height!==E)&&this.setSize(T,E)}return S===!1&&A.setRenderTarget(a),v=A.toneMapping,A.toneMapping=Xn,!0},this.hasRenderPass=function(){return S},this.end=function(A,y){A.toneMapping=v,g=!0;let T=a,E=o;for(let w=0;w<p.length;w++){const _=p[w];if(_.enabled!==!1&&(_.render(A,E,T,y),_.needsSwap!==!1)){const b=T;T=E,E=b}}if(d!==A.outputColorSpace||f!==A.toneMapping){d=A.outputColorSpace,f=A.toneMapping,l.defines={},qe.getTransfer(d)===tt&&(l.defines.SRGB_TRANSFER="");const w=Wv[f];w&&(l.defines[w]=""),l.needsUpdate=!0}l.uniforms.tDiffuse.value=T.texture,A.setRenderTarget(m),A.render(h,u),m=null,g=!1},this.isCompositing=function(){return g},this.dispose=function(){a.depthTexture&&a.depthTexture.dispose(),a.dispose(),o.dispose(),c.dispose(),l.dispose()}}const mf=new Vt,Ec=new js(1,1),gf=new Gh,_f=new ym,vf=new Zh,Dd=[],Ud=[],Fd=new Float32Array(16),Od=new Float32Array(9),Bd=new Float32Array(4);function sr(i,e,t){const n=i[0];if(n<=0||n>0)return i;const s=e*t;let r=Dd[s];if(r===void 0&&(r=new Float32Array(s),Dd[s]=r),e!==0){n.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,i[a].toArray(r,o)}return r}function Pt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function Lt(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function Io(i,e){let t=Ud[e];t===void 0&&(t=new Int32Array(e),Ud[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function qv(i,e){const t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function $v(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Pt(t,e))return;i.uniform2fv(this.addr,e),Lt(t,e)}}function Yv(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Pt(t,e))return;i.uniform3fv(this.addr,e),Lt(t,e)}}function Kv(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Pt(t,e))return;i.uniform4fv(this.addr,e),Lt(t,e)}}function Zv(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Pt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),Lt(t,e)}else{if(Pt(t,n))return;Bd.set(n),i.uniformMatrix2fv(this.addr,!1,Bd),Lt(t,n)}}function Jv(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Pt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),Lt(t,e)}else{if(Pt(t,n))return;Od.set(n),i.uniformMatrix3fv(this.addr,!1,Od),Lt(t,n)}}function jv(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Pt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),Lt(t,e)}else{if(Pt(t,n))return;Fd.set(n),i.uniformMatrix4fv(this.addr,!1,Fd),Lt(t,n)}}function Qv(i,e){const t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function ex(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Pt(t,e))return;i.uniform2iv(this.addr,e),Lt(t,e)}}function tx(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Pt(t,e))return;i.uniform3iv(this.addr,e),Lt(t,e)}}function nx(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Pt(t,e))return;i.uniform4iv(this.addr,e),Lt(t,e)}}function ix(i,e){const t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function sx(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Pt(t,e))return;i.uniform2uiv(this.addr,e),Lt(t,e)}}function rx(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Pt(t,e))return;i.uniform3uiv(this.addr,e),Lt(t,e)}}function ax(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Pt(t,e))return;i.uniform4uiv(this.addr,e),Lt(t,e)}}function ox(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(Ec.compareFunction=t.isReversedDepthBuffer()?Fc:Uc,r=Ec):r=mf,t.setTexture2D(e||r,s)}function lx(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||_f,s)}function cx(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||vf,s)}function ux(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||gf,s)}function dx(i){switch(i){case 5126:return qv;case 35664:return $v;case 35665:return Yv;case 35666:return Kv;case 35674:return Zv;case 35675:return Jv;case 35676:return jv;case 5124:case 35670:return Qv;case 35667:case 35671:return ex;case 35668:case 35672:return tx;case 35669:case 35673:return nx;case 5125:return ix;case 36294:return sx;case 36295:return rx;case 36296:return ax;case 35678:case 36198:case 36298:case 36306:case 35682:return ox;case 35679:case 36299:case 36307:return lx;case 35680:case 36300:case 36308:case 36293:return cx;case 36289:case 36303:case 36311:case 36292:return ux}}function hx(i,e){i.uniform1fv(this.addr,e)}function fx(i,e){const t=sr(e,this.size,2);i.uniform2fv(this.addr,t)}function px(i,e){const t=sr(e,this.size,3);i.uniform3fv(this.addr,t)}function mx(i,e){const t=sr(e,this.size,4);i.uniform4fv(this.addr,t)}function gx(i,e){const t=sr(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function _x(i,e){const t=sr(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function vx(i,e){const t=sr(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function xx(i,e){i.uniform1iv(this.addr,e)}function yx(i,e){i.uniform2iv(this.addr,e)}function bx(i,e){i.uniform3iv(this.addr,e)}function Mx(i,e){i.uniform4iv(this.addr,e)}function Sx(i,e){i.uniform1uiv(this.addr,e)}function Ex(i,e){i.uniform2uiv(this.addr,e)}function Tx(i,e){i.uniform3uiv(this.addr,e)}function Ax(i,e){i.uniform4uiv(this.addr,e)}function wx(i,e,t){const n=this.cache,s=e.length,r=Io(t,s);Pt(n,r)||(i.uniform1iv(this.addr,r),Lt(n,r));let a;this.type===i.SAMPLER_2D_SHADOW?a=Ec:a=mf;for(let o=0;o!==s;++o)t.setTexture2D(e[o]||a,r[o])}function Rx(i,e,t){const n=this.cache,s=e.length,r=Io(t,s);Pt(n,r)||(i.uniform1iv(this.addr,r),Lt(n,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||_f,r[a])}function Cx(i,e,t){const n=this.cache,s=e.length,r=Io(t,s);Pt(n,r)||(i.uniform1iv(this.addr,r),Lt(n,r));for(let a=0;a!==s;++a)t.setTextureCube(e[a]||vf,r[a])}function Px(i,e,t){const n=this.cache,s=e.length,r=Io(t,s);Pt(n,r)||(i.uniform1iv(this.addr,r),Lt(n,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||gf,r[a])}function Lx(i){switch(i){case 5126:return hx;case 35664:return fx;case 35665:return px;case 35666:return mx;case 35674:return gx;case 35675:return _x;case 35676:return vx;case 5124:case 35670:return xx;case 35667:case 35671:return yx;case 35668:case 35672:return bx;case 35669:case 35673:return Mx;case 5125:return Sx;case 36294:return Ex;case 36295:return Tx;case 36296:return Ax;case 35678:case 36198:case 36298:case 36306:case 35682:return wx;case 35679:case 36299:case 36307:return Rx;case 35680:case 36300:case 36308:case 36293:return Cx;case 36289:case 36303:case 36311:case 36292:return Px}}class Nx{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=dx(t.type)}}class Ix{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Lx(t.type)}}class Dx{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const s=this.seq;for(let r=0,a=s.length;r!==a;++r){const o=s[r];o.setValue(e,t[o.id],n)}}}const El=/(\w+)(\])?(\[|\.)?/g;function kd(i,e){i.seq.push(e),i.map[e.id]=e}function Ux(i,e,t){const n=i.name,s=n.length;for(El.lastIndex=0;;){const r=El.exec(n),a=El.lastIndex;let o=r[1];const c=r[2]==="]",l=r[3];if(c&&(o=o|0),l===void 0||l==="["&&a+2===s){kd(t,l===void 0?new Nx(o,i,e):new Ix(o,i,e));break}else{let u=t.map[o];u===void 0&&(u=new Dx(o),kd(t,u)),t=u}}}class Ka{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<n;++a){const o=e.getActiveUniform(t,a),c=e.getUniformLocation(t,o.name);Ux(o,c,this)}const s=[],r=[];for(const a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,n,s){const r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){const s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,a=t.length;r!==a;++r){const o=t[r],c=n[o.id];c.needsUpdate!==!1&&o.setValue(e,c.value,s)}}static seqWithValue(e,t){const n=[];for(let s=0,r=e.length;s!==r;++s){const a=e[s];a.id in t&&n.push(a)}return n}}function zd(i,e,t){const n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}const Fx=37297;let Ox=0;function Bx(i,e){const t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){const o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}const Vd=new ke;function kx(i){qe._getMatrix(Vd,qe.workingColorSpace,i);const e=`mat3( ${Vd.elements.map(t=>t.toFixed(4))} )`;switch(qe.getTransfer(i)){case io:return[e,"LinearTransferOETF"];case tt:return[e,"sRGBTransferOETF"];default:return Pe("WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function Gd(i,e,t){const n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";const a=/ERROR: 0:(\d+)/.exec(r);if(a){const o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+Bx(i.getShaderSource(e),o)}else return r}function zx(i,e){const t=kx(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}const Vx={[Ah]:"Linear",[wh]:"Reinhard",[Rh]:"Cineon",[Ch]:"ACESFilmic",[Lh]:"AgX",[Nh]:"Neutral",[Ph]:"Custom"};function Gx(i,e){const t=Vx[e];return t===void 0?(Pe("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const Da=new N;function Hx(){qe.getLuminanceCoefficients(Da);const i=Da.x.toFixed(4),e=Da.y.toFixed(4),t=Da.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Wx(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(yr).join(`
`)}function Xx(i){const e=[];for(const t in i){const n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function qx(i,e){const t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){const r=i.getActiveAttrib(e,s),a=r.name;let o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:i.getAttribLocation(e,a),locationSize:o}}return t}function yr(i){return i!==""}function Hd(i,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Wd(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const $x=/^[ \t]*#include +<([\w\d./]+)>/gm;function Tc(i){return i.replace($x,Kx)}const Yx=new Map;function Kx(i,e){let t=Ge[e];if(t===void 0){const n=Yx.get(e);if(n!==void 0)t=Ge[n],Pe('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return Tc(t)}const Zx=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Xd(i){return i.replace(Zx,Jx)}function Jx(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function qd(i){let e=`precision ${i.precision} float;
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
#define LOW_PRECISION`),e}const jx={[Wa]:"SHADOWMAP_TYPE_PCF",[vr]:"SHADOWMAP_TYPE_VSM"};function Qx(i){return jx[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const ey={[os]:"ENVMAP_TYPE_CUBE",[Zs]:"ENVMAP_TYPE_CUBE",[wo]:"ENVMAP_TYPE_CUBE_UV"};function ty(i){return i.envMap===!1?"ENVMAP_TYPE_CUBE":ey[i.envMapMode]||"ENVMAP_TYPE_CUBE"}const ny={[Zs]:"ENVMAP_MODE_REFRACTION"};function iy(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":ny[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}const sy={[Ao]:"ENVMAP_BLENDING_MULTIPLY",[Up]:"ENVMAP_BLENDING_MIX",[Fp]:"ENVMAP_BLENDING_ADD"};function ry(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":sy[i.combine]||"ENVMAP_BLENDING_NONE"}function ay(i){const e=i.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),7*16)),texelHeight:n,maxMip:t}}function oy(i,e,t,n){const s=i.getContext(),r=t.defines;let a=t.vertexShader,o=t.fragmentShader;const c=Qx(t),l=ty(t),h=iy(t),u=ry(t),d=ay(t),f=Wx(t),g=Xx(r),v=s.createProgram();let m,p,S=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(yr).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(yr).join(`
`),p.length>0&&(p+=`
`)):(m=[qd(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(yr).join(`
`),p=[qd(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+l:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Xn?"#define TONE_MAPPING":"",t.toneMapping!==Xn?Ge.tonemapping_pars_fragment:"",t.toneMapping!==Xn?Gx("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Ge.colorspace_pars_fragment,zx("linearToOutputTexel",t.outputColorSpace),Hx(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(yr).join(`
`)),a=Tc(a),a=Hd(a,t),a=Wd(a,t),o=Tc(o),o=Hd(o,t),o=Wd(o,t),a=Xd(a),o=Xd(o),t.isRawShaderMaterial!==!0&&(S=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",t.glslVersion===zu?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===zu?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);const A=S+m+a,y=S+p+o,T=zd(s,s.VERTEX_SHADER,A),E=zd(s,s.FRAGMENT_SHADER,y);s.attachShader(v,T),s.attachShader(v,E),t.index0AttributeName!==void 0?s.bindAttribLocation(v,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(v,0,"position"),s.linkProgram(v);function w(R){if(i.debug.checkShaderErrors){const L=s.getProgramInfoLog(v)||"",z=s.getShaderInfoLog(T)||"",X=s.getShaderInfoLog(E)||"",O=L.trim(),I=z.trim(),V=X.trim();let $=!0,J=!0;if(s.getProgramParameter(v,s.LINK_STATUS)===!1)if($=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,v,T,E);else{const re=Gd(s,T,"vertex"),se=Gd(s,E,"fragment");He("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(v,s.VALIDATE_STATUS)+`

Material Name: `+R.name+`
Material Type: `+R.type+`

Program Info Log: `+O+`
`+re+`
`+se)}else O!==""?Pe("WebGLProgram: Program Info Log:",O):(I===""||V==="")&&(J=!1);J&&(R.diagnostics={runnable:$,programLog:O,vertexShader:{log:I,prefix:m},fragmentShader:{log:V,prefix:p}})}s.deleteShader(T),s.deleteShader(E),_=new Ka(s,v),b=qx(s,v)}let _;this.getUniforms=function(){return _===void 0&&w(this),_};let b;this.getAttributes=function(){return b===void 0&&w(this),b};let P=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return P===!1&&(P=s.getProgramParameter(v,Fx)),P},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(v),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Ox++,this.cacheKey=e,this.usedTimes=1,this.program=v,this.vertexShader=T,this.fragmentShader=E,this}let ly=0;class cy{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){const s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new uy(e),t.set(e,n)),n}}class uy{constructor(e){this.id=ly++,this.code=e,this.usedTimes=0}}function dy(i){return i===ls||i===eo||i===to}function hy(i,e,t,n,s,r){const a=new Hh,o=new cy,c=new Set,l=[],h=new Map,u=n.logarithmicDepthBuffer;let d=n.precision;const f={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(_){return c.add(_),_===0?"uv":`uv${_}`}function v(_,b,P,R,L,z){const X=R.fog,O=L.geometry,I=_.isMeshStandardMaterial||_.isMeshLambertMaterial||_.isMeshPhongMaterial?R.environment:null,V=_.isMeshStandardMaterial||_.isMeshLambertMaterial&&!_.envMap||_.isMeshPhongMaterial&&!_.envMap,$=e.get(_.envMap||I,V),J=$&&$.mapping===wo?$.image.height:null,re=f[_.type];_.precision!==null&&(d=n.getMaxPrecision(_.precision),d!==_.precision&&Pe("WebGLProgram.getParameters:",_.precision,"not supported, using",d,"instead."));const se=O.morphAttributes.position||O.morphAttributes.normal||O.morphAttributes.color,ae=se!==void 0?se.length:0;let xe=0;O.morphAttributes.position!==void 0&&(xe=1),O.morphAttributes.normal!==void 0&&(xe=2),O.morphAttributes.color!==void 0&&(xe=3);let ye,le,B,Z;if(re){const Ee=kn[re];ye=Ee.vertexShader,le=Ee.fragmentShader}else{ye=_.vertexShader,le=_.fragmentShader;const Ee=o.getVertexShaderStage(_),_t=o.getFragmentShaderStage(_);o.update(_,Ee,_t),B=Ee.id,Z=_t.id}const ee=i.getRenderTarget(),we=i.state.buffers.depth.getReversed(),Fe=L.isInstancedMesh===!0,Ie=L.isBatchedMesh===!0,yt=!!_.map,$e=!!_.matcap,at=!!$,Je=!!_.aoMap,Ke=!!_.lightMap,St=!!_.bumpMap&&_.wireframe===!1,At=!!_.normalMap,Nt=!!_.displacementMap,Ut=!!_.emissiveMap,gt=!!_.metalnessMap,Et=!!_.roughnessMap,U=_.anisotropy>0,Jt=_.clearcoat>0,et=_.dispersion>0,C=_.iridescence>0,x=_.sheen>0,k=_.transmission>0,W=U&&!!_.anisotropyMap,Y=Jt&&!!_.clearcoatMap,oe=Jt&&!!_.clearcoatNormalMap,ue=Jt&&!!_.clearcoatRoughnessMap,K=C&&!!_.iridescenceMap,Q=C&&!!_.iridescenceThicknessMap,de=x&&!!_.sheenColorMap,Re=x&&!!_.sheenRoughnessMap,pe=!!_.specularMap,he=!!_.specularColorMap,Ne=!!_.specularIntensityMap,De=k&&!!_.transmissionMap,ze=k&&!!_.thicknessMap,D=!!_.gradientMap,ce=!!_.alphaMap,j=_.alphaTest>0,fe=!!_.alphaHash,ve=!!_.extensions;let ne=Xn;_.toneMapped&&(ee===null||ee.isXRRenderTarget===!0)&&(ne=i.toneMapping);const Ae={shaderID:re,shaderType:_.type,shaderName:_.name,vertexShader:ye,fragmentShader:le,defines:_.defines,customVertexShaderID:B,customFragmentShaderID:Z,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:d,batching:Ie,batchingColor:Ie&&L._colorsTexture!==null,instancing:Fe,instancingColor:Fe&&L.instanceColor!==null,instancingMorph:Fe&&L.morphTexture!==null,outputColorSpace:ee===null?i.outputColorSpace:ee.isXRRenderTarget===!0?ee.texture.colorSpace:qe.workingColorSpace,alphaToCoverage:!!_.alphaToCoverage,map:yt,matcap:$e,envMap:at,envMapMode:at&&$.mapping,envMapCubeUVHeight:J,aoMap:Je,lightMap:Ke,bumpMap:St,normalMap:At,displacementMap:Nt,emissiveMap:Ut,normalMapObjectSpace:At&&_.normalMapType===Vp,normalMapTangentSpace:At&&_.normalMapType===Lr,packedNormalMap:At&&_.normalMapType===Lr&&dy(_.normalMap.format),metalnessMap:gt,roughnessMap:Et,anisotropy:U,anisotropyMap:W,clearcoat:Jt,clearcoatMap:Y,clearcoatNormalMap:oe,clearcoatRoughnessMap:ue,dispersion:et,iridescence:C,iridescenceMap:K,iridescenceThicknessMap:Q,sheen:x,sheenColorMap:de,sheenRoughnessMap:Re,specularMap:pe,specularColorMap:he,specularIntensityMap:Ne,transmission:k,transmissionMap:De,thicknessMap:ze,gradientMap:D,opaque:_.transparent===!1&&_.blending===Hs&&_.alphaToCoverage===!1,alphaMap:ce,alphaTest:j,alphaHash:fe,combine:_.combine,mapUv:yt&&g(_.map.channel),aoMapUv:Je&&g(_.aoMap.channel),lightMapUv:Ke&&g(_.lightMap.channel),bumpMapUv:St&&g(_.bumpMap.channel),normalMapUv:At&&g(_.normalMap.channel),displacementMapUv:Nt&&g(_.displacementMap.channel),emissiveMapUv:Ut&&g(_.emissiveMap.channel),metalnessMapUv:gt&&g(_.metalnessMap.channel),roughnessMapUv:Et&&g(_.roughnessMap.channel),anisotropyMapUv:W&&g(_.anisotropyMap.channel),clearcoatMapUv:Y&&g(_.clearcoatMap.channel),clearcoatNormalMapUv:oe&&g(_.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ue&&g(_.clearcoatRoughnessMap.channel),iridescenceMapUv:K&&g(_.iridescenceMap.channel),iridescenceThicknessMapUv:Q&&g(_.iridescenceThicknessMap.channel),sheenColorMapUv:de&&g(_.sheenColorMap.channel),sheenRoughnessMapUv:Re&&g(_.sheenRoughnessMap.channel),specularMapUv:pe&&g(_.specularMap.channel),specularColorMapUv:he&&g(_.specularColorMap.channel),specularIntensityMapUv:Ne&&g(_.specularIntensityMap.channel),transmissionMapUv:De&&g(_.transmissionMap.channel),thicknessMapUv:ze&&g(_.thicknessMap.channel),alphaMapUv:ce&&g(_.alphaMap.channel),vertexTangents:!!O.attributes.tangent&&(At||U),vertexNormals:!!O.attributes.normal,vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!O.attributes.color&&O.attributes.color.itemSize===4,pointsUvs:L.isPoints===!0&&!!O.attributes.uv&&(yt||ce),fog:!!X,useFog:_.fog===!0,fogExp2:!!X&&X.isFogExp2,flatShading:_.wireframe===!1&&(_.flatShading===!0||O.attributes.normal===void 0&&At===!1&&(_.isMeshLambertMaterial||_.isMeshPhongMaterial||_.isMeshStandardMaterial||_.isMeshPhysicalMaterial)),sizeAttenuation:_.sizeAttenuation===!0,logarithmicDepthBuffer:u,reversedDepthBuffer:we,skinning:L.isSkinnedMesh===!0,hasPositionAttribute:O.attributes.position!==void 0,morphTargets:O.morphAttributes.position!==void 0,morphNormals:O.morphAttributes.normal!==void 0,morphColors:O.morphAttributes.color!==void 0,morphTargetsCount:ae,morphTextureStride:xe,numDirLights:b.directional.length,numPointLights:b.point.length,numSpotLights:b.spot.length,numSpotLightMaps:b.spotLightMap.length,numRectAreaLights:b.rectArea.length,numHemiLights:b.hemi.length,numDirLightShadows:b.directionalShadowMap.length,numPointLightShadows:b.pointShadowMap.length,numSpotLightShadows:b.spotShadowMap.length,numSpotLightShadowsWithMaps:b.numSpotLightShadowsWithMaps,numLightProbes:b.numLightProbes,numLightProbeGrids:z.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:_.dithering,shadowMapEnabled:i.shadowMap.enabled&&P.length>0,shadowMapType:i.shadowMap.type,toneMapping:ne,decodeVideoTexture:yt&&_.map.isVideoTexture===!0&&qe.getTransfer(_.map.colorSpace)===tt,decodeVideoTextureEmissive:Ut&&_.emissiveMap.isVideoTexture===!0&&qe.getTransfer(_.emissiveMap.colorSpace)===tt,premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===Sn,flipSided:_.side===en,useDepthPacking:_.depthPacking>=0,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionClipCullDistance:ve&&_.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ve&&_.extensions.multiDraw===!0||Ie)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:_.customProgramCacheKey()};return Ae.vertexUv1s=c.has(1),Ae.vertexUv2s=c.has(2),Ae.vertexUv3s=c.has(3),c.clear(),Ae}function m(_){const b=[];if(_.shaderID?b.push(_.shaderID):(b.push(_.customVertexShaderID),b.push(_.customFragmentShaderID)),_.defines!==void 0)for(const P in _.defines)b.push(P),b.push(_.defines[P]);return _.isRawShaderMaterial===!1&&(p(b,_),S(b,_),b.push(i.outputColorSpace)),b.push(_.customProgramCacheKey),b.join()}function p(_,b){_.push(b.precision),_.push(b.outputColorSpace),_.push(b.envMapMode),_.push(b.envMapCubeUVHeight),_.push(b.mapUv),_.push(b.alphaMapUv),_.push(b.lightMapUv),_.push(b.aoMapUv),_.push(b.bumpMapUv),_.push(b.normalMapUv),_.push(b.displacementMapUv),_.push(b.emissiveMapUv),_.push(b.metalnessMapUv),_.push(b.roughnessMapUv),_.push(b.anisotropyMapUv),_.push(b.clearcoatMapUv),_.push(b.clearcoatNormalMapUv),_.push(b.clearcoatRoughnessMapUv),_.push(b.iridescenceMapUv),_.push(b.iridescenceThicknessMapUv),_.push(b.sheenColorMapUv),_.push(b.sheenRoughnessMapUv),_.push(b.specularMapUv),_.push(b.specularColorMapUv),_.push(b.specularIntensityMapUv),_.push(b.transmissionMapUv),_.push(b.thicknessMapUv),_.push(b.combine),_.push(b.fogExp2),_.push(b.sizeAttenuation),_.push(b.morphTargetsCount),_.push(b.morphAttributeCount),_.push(b.numDirLights),_.push(b.numPointLights),_.push(b.numSpotLights),_.push(b.numSpotLightMaps),_.push(b.numHemiLights),_.push(b.numRectAreaLights),_.push(b.numDirLightShadows),_.push(b.numPointLightShadows),_.push(b.numSpotLightShadows),_.push(b.numSpotLightShadowsWithMaps),_.push(b.numLightProbes),_.push(b.shadowMapType),_.push(b.toneMapping),_.push(b.numClippingPlanes),_.push(b.numClipIntersection),_.push(b.depthPacking)}function S(_,b){a.disableAll(),b.instancing&&a.enable(0),b.instancingColor&&a.enable(1),b.instancingMorph&&a.enable(2),b.matcap&&a.enable(3),b.envMap&&a.enable(4),b.normalMapObjectSpace&&a.enable(5),b.normalMapTangentSpace&&a.enable(6),b.clearcoat&&a.enable(7),b.iridescence&&a.enable(8),b.alphaTest&&a.enable(9),b.vertexColors&&a.enable(10),b.vertexAlphas&&a.enable(11),b.vertexUv1s&&a.enable(12),b.vertexUv2s&&a.enable(13),b.vertexUv3s&&a.enable(14),b.vertexTangents&&a.enable(15),b.anisotropy&&a.enable(16),b.alphaHash&&a.enable(17),b.batching&&a.enable(18),b.dispersion&&a.enable(19),b.batchingColor&&a.enable(20),b.gradientMap&&a.enable(21),b.packedNormalMap&&a.enable(22),b.vertexNormals&&a.enable(23),_.push(a.mask),a.disableAll(),b.fog&&a.enable(0),b.useFog&&a.enable(1),b.flatShading&&a.enable(2),b.logarithmicDepthBuffer&&a.enable(3),b.reversedDepthBuffer&&a.enable(4),b.skinning&&a.enable(5),b.morphTargets&&a.enable(6),b.morphNormals&&a.enable(7),b.morphColors&&a.enable(8),b.premultipliedAlpha&&a.enable(9),b.shadowMapEnabled&&a.enable(10),b.doubleSided&&a.enable(11),b.flipSided&&a.enable(12),b.useDepthPacking&&a.enable(13),b.dithering&&a.enable(14),b.transmission&&a.enable(15),b.sheen&&a.enable(16),b.opaque&&a.enable(17),b.pointsUvs&&a.enable(18),b.decodeVideoTexture&&a.enable(19),b.decodeVideoTextureEmissive&&a.enable(20),b.alphaToCoverage&&a.enable(21),b.numLightProbeGrids>0&&a.enable(22),b.hasPositionAttribute&&a.enable(23),_.push(a.mask)}function A(_){const b=f[_.type];let P;if(b){const R=kn[b];P=hg.clone(R.uniforms)}else P=_.uniforms;return P}function y(_,b){let P=h.get(b);return P!==void 0?++P.usedTimes:(P=new oy(i,b,_,s),l.push(P),h.set(b,P)),P}function T(_){if(--_.usedTimes===0){const b=l.indexOf(_);l[b]=l[l.length-1],l.pop(),h.delete(_.cacheKey),_.destroy()}}function E(_){o.remove(_)}function w(){o.dispose()}return{getParameters:v,getProgramCacheKey:m,getUniforms:A,acquireProgram:y,releaseProgram:T,releaseShaderCache:E,programs:l,dispose:w}}function fy(){let i=new WeakMap;function e(a){return i.has(a)}function t(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,c){i.get(a)[o]=c}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function py(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.materialVariant!==e.materialVariant?i.materialVariant-e.materialVariant:i.z!==e.z?i.z-e.z:i.id-e.id}function $d(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function Yd(){const i=[];let e=0;const t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function a(d){let f=0;return d.isInstancedMesh&&(f+=2),d.isSkinnedMesh&&(f+=1),f}function o(d,f,g,v,m,p){let S=i[e];return S===void 0?(S={id:d.id,object:d,geometry:f,material:g,materialVariant:a(d),groupOrder:v,renderOrder:d.renderOrder,z:m,group:p},i[e]=S):(S.id=d.id,S.object=d,S.geometry=f,S.material=g,S.materialVariant=a(d),S.groupOrder=v,S.renderOrder=d.renderOrder,S.z=m,S.group=p),e++,S}function c(d,f,g,v,m,p){const S=o(d,f,g,v,m,p);g.transmission>0?n.push(S):g.transparent===!0?s.push(S):t.push(S)}function l(d,f,g,v,m,p){const S=o(d,f,g,v,m,p);g.transmission>0?n.unshift(S):g.transparent===!0?s.unshift(S):t.unshift(S)}function h(d,f,g){t.length>1&&t.sort(d||py),n.length>1&&n.sort(f||$d),s.length>1&&s.sort(f||$d),g&&(t.reverse(),n.reverse(),s.reverse())}function u(){for(let d=e,f=i.length;d<f;d++){const g=i[d];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:c,unshift:l,finish:u,sort:h}}function my(){let i=new WeakMap;function e(n,s){const r=i.get(n);let a;return r===void 0?(a=new Yd,i.set(n,[a])):s>=r.length?(a=new Yd,r.push(a)):a=r[s],a}function t(){i=new WeakMap}return{get:e,dispose:t}}function gy(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new N,color:new Ue};break;case"SpotLight":t={position:new N,direction:new N,color:new Ue,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new N,color:new Ue,distance:0,decay:0};break;case"HemisphereLight":t={direction:new N,skyColor:new Ue,groundColor:new Ue};break;case"RectAreaLight":t={color:new Ue,position:new N,halfWidth:new N,halfHeight:new N};break}return i[e.id]=t,t}}}function _y(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Se};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Se};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Se,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}let vy=0;function xy(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function yy(i){const e=new gy,t=_y(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)n.probe.push(new N);const s=new N,r=new Oe,a=new Oe;function o(l){let h=0,u=0,d=0;for(let b=0;b<9;b++)n.probe[b].set(0,0,0);let f=0,g=0,v=0,m=0,p=0,S=0,A=0,y=0,T=0,E=0,w=0;l.sort(xy);for(let b=0,P=l.length;b<P;b++){const R=l[b],L=R.color,z=R.intensity,X=R.distance;let O=null;if(R.shadow&&R.shadow.map&&(R.shadow.map.texture.format===ls?O=R.shadow.map.texture:O=R.shadow.map.depthTexture||R.shadow.map.texture),R.isAmbientLight)h+=L.r*z,u+=L.g*z,d+=L.b*z;else if(R.isLightProbe){for(let I=0;I<9;I++)n.probe[I].addScaledVector(R.sh.coefficients[I],z);w++}else if(R.isDirectionalLight){const I=e.get(R);if(I.color.copy(R.color).multiplyScalar(R.intensity),R.castShadow){const V=R.shadow,$=t.get(R);$.shadowIntensity=V.intensity,$.shadowBias=V.bias,$.shadowNormalBias=V.normalBias,$.shadowRadius=V.radius,$.shadowMapSize=V.mapSize,n.directionalShadow[f]=$,n.directionalShadowMap[f]=O,n.directionalShadowMatrix[f]=R.shadow.matrix,S++}n.directional[f]=I,f++}else if(R.isSpotLight){const I=e.get(R);I.position.setFromMatrixPosition(R.matrixWorld),I.color.copy(L).multiplyScalar(z),I.distance=X,I.coneCos=Math.cos(R.angle),I.penumbraCos=Math.cos(R.angle*(1-R.penumbra)),I.decay=R.decay,n.spot[v]=I;const V=R.shadow;if(R.map&&(n.spotLightMap[T]=R.map,T++,V.updateMatrices(R),R.castShadow&&E++),n.spotLightMatrix[v]=V.matrix,R.castShadow){const $=t.get(R);$.shadowIntensity=V.intensity,$.shadowBias=V.bias,$.shadowNormalBias=V.normalBias,$.shadowRadius=V.radius,$.shadowMapSize=V.mapSize,n.spotShadow[v]=$,n.spotShadowMap[v]=O,y++}v++}else if(R.isRectAreaLight){const I=e.get(R);I.color.copy(L).multiplyScalar(z),I.halfWidth.set(R.width*.5,0,0),I.halfHeight.set(0,R.height*.5,0),n.rectArea[m]=I,m++}else if(R.isPointLight){const I=e.get(R);if(I.color.copy(R.color).multiplyScalar(R.intensity),I.distance=R.distance,I.decay=R.decay,R.castShadow){const V=R.shadow,$=t.get(R);$.shadowIntensity=V.intensity,$.shadowBias=V.bias,$.shadowNormalBias=V.normalBias,$.shadowRadius=V.radius,$.shadowMapSize=V.mapSize,$.shadowCameraNear=V.camera.near,$.shadowCameraFar=V.camera.far,n.pointShadow[g]=$,n.pointShadowMap[g]=O,n.pointShadowMatrix[g]=R.shadow.matrix,A++}n.point[g]=I,g++}else if(R.isHemisphereLight){const I=e.get(R);I.skyColor.copy(R.color).multiplyScalar(z),I.groundColor.copy(R.groundColor).multiplyScalar(z),n.hemi[p]=I,p++}}m>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=me.LTC_FLOAT_1,n.rectAreaLTC2=me.LTC_FLOAT_2):(n.rectAreaLTC1=me.LTC_HALF_1,n.rectAreaLTC2=me.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=d;const _=n.hash;(_.directionalLength!==f||_.pointLength!==g||_.spotLength!==v||_.rectAreaLength!==m||_.hemiLength!==p||_.numDirectionalShadows!==S||_.numPointShadows!==A||_.numSpotShadows!==y||_.numSpotMaps!==T||_.numLightProbes!==w)&&(n.directional.length=f,n.spot.length=v,n.rectArea.length=m,n.point.length=g,n.hemi.length=p,n.directionalShadow.length=S,n.directionalShadowMap.length=S,n.pointShadow.length=A,n.pointShadowMap.length=A,n.spotShadow.length=y,n.spotShadowMap.length=y,n.directionalShadowMatrix.length=S,n.pointShadowMatrix.length=A,n.spotLightMatrix.length=y+T-E,n.spotLightMap.length=T,n.numSpotLightShadowsWithMaps=E,n.numLightProbes=w,_.directionalLength=f,_.pointLength=g,_.spotLength=v,_.rectAreaLength=m,_.hemiLength=p,_.numDirectionalShadows=S,_.numPointShadows=A,_.numSpotShadows=y,_.numSpotMaps=T,_.numLightProbes=w,n.version=vy++)}function c(l,h){let u=0,d=0,f=0,g=0,v=0;const m=h.matrixWorldInverse;for(let p=0,S=l.length;p<S;p++){const A=l[p];if(A.isDirectionalLight){const y=n.directional[u];y.direction.setFromMatrixPosition(A.matrixWorld),s.setFromMatrixPosition(A.target.matrixWorld),y.direction.sub(s),y.direction.transformDirection(m),u++}else if(A.isSpotLight){const y=n.spot[f];y.position.setFromMatrixPosition(A.matrixWorld),y.position.applyMatrix4(m),y.direction.setFromMatrixPosition(A.matrixWorld),s.setFromMatrixPosition(A.target.matrixWorld),y.direction.sub(s),y.direction.transformDirection(m),f++}else if(A.isRectAreaLight){const y=n.rectArea[g];y.position.setFromMatrixPosition(A.matrixWorld),y.position.applyMatrix4(m),a.identity(),r.copy(A.matrixWorld),r.premultiply(m),a.extractRotation(r),y.halfWidth.set(A.width*.5,0,0),y.halfHeight.set(0,A.height*.5,0),y.halfWidth.applyMatrix4(a),y.halfHeight.applyMatrix4(a),g++}else if(A.isPointLight){const y=n.point[d];y.position.setFromMatrixPosition(A.matrixWorld),y.position.applyMatrix4(m),d++}else if(A.isHemisphereLight){const y=n.hemi[v];y.direction.setFromMatrixPosition(A.matrixWorld),y.direction.transformDirection(m),v++}}}return{setup:o,setupView:c,state:n}}function Kd(i){const e=new yy(i),t=[],n=[],s=[];function r(d){u.camera=d,t.length=0,n.length=0,s.length=0}function a(d){t.push(d)}function o(d){n.push(d)}function c(d){s.push(d)}function l(){e.setup(t)}function h(d){e.setupView(t,d)}const u={lightsArray:t,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:u,setupLights:l,setupLightsView:h,pushLight:a,pushShadow:o,pushLightProbeGrid:c}}function by(i){let e=new WeakMap;function t(s,r=0){const a=e.get(s);let o;return a===void 0?(o=new Kd(i),e.set(s,[o])):r>=a.length?(o=new Kd(i),a.push(o)):o=a[r],o}function n(){e=new WeakMap}return{get:t,dispose:n}}const My=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Sy=`uniform sampler2D shadow_pass;
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
}`,Ey=[new N(1,0,0),new N(-1,0,0),new N(0,1,0),new N(0,-1,0),new N(0,0,1),new N(0,0,-1)],Ty=[new N(0,-1,0),new N(0,-1,0),new N(0,0,1),new N(0,0,-1),new N(0,-1,0),new N(0,-1,0)],Zd=new Oe,gr=new N,Tl=new N;function Ay(i,e,t){let n=new Vc;const s=new Se,r=new Se,a=new rt,o=new _g,c=new vg,l={},h=t.maxTextureSize,u={[mi]:en,[en]:mi,[Sn]:Sn},d=new Yn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Se},radius:{value:4}},vertexShader:My,fragmentShader:Sy}),f=d.clone();f.defines.HORIZONTAL_PASS=1;const g=new mt;g.setAttribute("position",new tn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const v=new ft(g,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Wa;let p=this.type;this.render=function(E,w,_){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||E.length===0)return;this.type===gp&&(Pe("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),this.type=Wa);const b=i.getRenderTarget(),P=i.getActiveCubeFace(),R=i.getActiveMipmapLevel(),L=i.state;L.setBlending(ui),L.buffers.depth.getReversed()===!0?L.buffers.color.setClear(0,0,0,0):L.buffers.color.setClear(1,1,1,1),L.buffers.depth.setTest(!0),L.setScissorTest(!1);const z=p!==this.type;z&&w.traverse(function(X){X.material&&(Array.isArray(X.material)?X.material.forEach(O=>O.needsUpdate=!0):X.material.needsUpdate=!0)});for(let X=0,O=E.length;X<O;X++){const I=E[X],V=I.shadow;if(V===void 0){Pe("WebGLShadowMap:",I,"has no shadow.");continue}if(V.autoUpdate===!1&&V.needsUpdate===!1)continue;s.copy(V.mapSize);const $=V.getFrameExtents();s.multiply($),r.copy(V.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/$.x),s.x=r.x*$.x,V.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/$.y),s.y=r.y*$.y,V.mapSize.y=r.y));const J=i.state.buffers.depth.getReversed();if(V.camera._reversedDepth=J,V.map===null||z===!0){if(V.map!==null&&(V.map.depthTexture!==null&&(V.map.depthTexture.dispose(),V.map.depthTexture=null),V.map.dispose()),this.type===vr){if(I.isPointLight){Pe("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}V.map=new qn(s.x,s.y,{format:ls,type:gi,minFilter:Ct,magFilter:Ct,generateMipmaps:!1}),V.map.texture.name=I.name+".shadowMap",V.map.depthTexture=new js(s.x,s.y,An),V.map.depthTexture.name=I.name+".shadowMapDepth",V.map.depthTexture.format=_i,V.map.depthTexture.compareFunction=null,V.map.depthTexture.minFilter=zt,V.map.depthTexture.magFilter=zt}else I.isPointLight?(V.map=new pf(s.x),V.map.depthTexture=new Hm(s.x,$n)):(V.map=new qn(s.x,s.y),V.map.depthTexture=new js(s.x,s.y,$n)),V.map.depthTexture.name=I.name+".shadowMap",V.map.depthTexture.format=_i,this.type===Wa?(V.map.depthTexture.compareFunction=J?Fc:Uc,V.map.depthTexture.minFilter=Ct,V.map.depthTexture.magFilter=Ct):(V.map.depthTexture.compareFunction=null,V.map.depthTexture.minFilter=zt,V.map.depthTexture.magFilter=zt);V.camera.updateProjectionMatrix()}const re=V.map.isWebGLCubeRenderTarget?6:1;for(let se=0;se<re;se++){if(V.map.isWebGLCubeRenderTarget)i.setRenderTarget(V.map,se),i.clear();else{se===0&&(i.setRenderTarget(V.map),i.clear());const ae=V.getViewport(se);a.set(r.x*ae.x,r.y*ae.y,r.x*ae.z,r.y*ae.w),L.viewport(a)}if(I.isPointLight){const ae=V.camera,xe=V.matrix,ye=I.distance||ae.far;ye!==ae.far&&(ae.far=ye,ae.updateProjectionMatrix()),gr.setFromMatrixPosition(I.matrixWorld),ae.position.copy(gr),Tl.copy(ae.position),Tl.add(Ey[se]),ae.up.copy(Ty[se]),ae.lookAt(Tl),ae.updateMatrixWorld(),xe.makeTranslation(-gr.x,-gr.y,-gr.z),Zd.multiplyMatrices(ae.projectionMatrix,ae.matrixWorldInverse),V._frustum.setFromProjectionMatrix(Zd,ae.coordinateSystem,ae.reversedDepth)}else V.updateMatrices(I);n=V.getFrustum(),y(w,_,V.camera,I,this.type)}V.isPointLightShadow!==!0&&this.type===vr&&S(V,_),V.needsUpdate=!1}p=this.type,m.needsUpdate=!1,i.setRenderTarget(b,P,R)};function S(E,w){const _=e.update(v);d.defines.VSM_SAMPLES!==E.blurSamples&&(d.defines.VSM_SAMPLES=E.blurSamples,f.defines.VSM_SAMPLES=E.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),E.mapPass===null&&(E.mapPass=new qn(s.x,s.y,{format:ls,type:gi})),d.uniforms.shadow_pass.value=E.map.depthTexture,d.uniforms.resolution.value=E.mapSize,d.uniforms.radius.value=E.radius,i.setRenderTarget(E.mapPass),i.clear(),i.renderBufferDirect(w,null,_,d,v,null),f.uniforms.shadow_pass.value=E.mapPass.texture,f.uniforms.resolution.value=E.mapSize,f.uniforms.radius.value=E.radius,i.setRenderTarget(E.map),i.clear(),i.renderBufferDirect(w,null,_,f,v,null)}function A(E,w,_,b){let P=null;const R=_.isPointLight===!0?E.customDistanceMaterial:E.customDepthMaterial;if(R!==void 0)P=R;else if(P=_.isPointLight===!0?c:o,i.localClippingEnabled&&w.clipShadows===!0&&Array.isArray(w.clippingPlanes)&&w.clippingPlanes.length!==0||w.displacementMap&&w.displacementScale!==0||w.alphaMap&&w.alphaTest>0||w.map&&w.alphaTest>0||w.alphaToCoverage===!0){const L=P.uuid,z=w.uuid;let X=l[L];X===void 0&&(X={},l[L]=X);let O=X[z];O===void 0&&(O=P.clone(),X[z]=O,w.addEventListener("dispose",T)),P=O}if(P.visible=w.visible,P.wireframe=w.wireframe,b===vr?P.side=w.shadowSide!==null?w.shadowSide:w.side:P.side=w.shadowSide!==null?w.shadowSide:u[w.side],P.alphaMap=w.alphaMap,P.alphaTest=w.alphaToCoverage===!0?.5:w.alphaTest,P.map=w.map,P.clipShadows=w.clipShadows,P.clippingPlanes=w.clippingPlanes,P.clipIntersection=w.clipIntersection,P.displacementMap=w.displacementMap,P.displacementScale=w.displacementScale,P.displacementBias=w.displacementBias,P.wireframeLinewidth=w.wireframeLinewidth,P.linewidth=w.linewidth,_.isPointLight===!0&&P.isMeshDistanceMaterial===!0){const L=i.properties.get(P);L.light=_}return P}function y(E,w,_,b,P){if(E.visible===!1)return;if(E.layers.test(w.layers)&&(E.isMesh||E.isLine||E.isPoints)&&(E.castShadow||E.receiveShadow&&P===vr)&&(!E.frustumCulled||n.intersectsObject(E))){E.modelViewMatrix.multiplyMatrices(_.matrixWorldInverse,E.matrixWorld);const z=e.update(E),X=E.material;if(Array.isArray(X)){const O=z.groups;for(let I=0,V=O.length;I<V;I++){const $=O[I],J=X[$.materialIndex];if(J&&J.visible){const re=A(E,J,b,P);E.onBeforeShadow(i,E,w,_,z,re,$),i.renderBufferDirect(_,null,z,re,E,$),E.onAfterShadow(i,E,w,_,z,re,$)}}}else if(X.visible){const O=A(E,X,b,P);E.onBeforeShadow(i,E,w,_,z,O,null),i.renderBufferDirect(_,null,z,O,E,null),E.onAfterShadow(i,E,w,_,z,O,null)}}const L=E.children;for(let z=0,X=L.length;z<X;z++)y(L[z],w,_,b,P)}function T(E){E.target.removeEventListener("dispose",T);for(const _ in l){const b=l[_],P=E.target.uuid;P in b&&(b[P].dispose(),delete b[P])}}}function wy(i,e){function t(){let D=!1;const ce=new rt;let j=null;const fe=new rt(0,0,0,0);return{setMask:function(ve){j!==ve&&!D&&(i.colorMask(ve,ve,ve,ve),j=ve)},setLocked:function(ve){D=ve},setClear:function(ve,ne,Ae,Ee,_t){_t===!0&&(ve*=Ee,ne*=Ee,Ae*=Ee),ce.set(ve,ne,Ae,Ee),fe.equals(ce)===!1&&(i.clearColor(ve,ne,Ae,Ee),fe.copy(ce))},reset:function(){D=!1,j=null,fe.set(-1,0,0,0)}}}function n(){let D=!1,ce=!1,j=null,fe=null,ve=null;return{setReversed:function(ne){if(ce!==ne){const Ae=e.get("EXT_clip_control");ne?Ae.clipControlEXT(Ae.LOWER_LEFT_EXT,Ae.ZERO_TO_ONE_EXT):Ae.clipControlEXT(Ae.LOWER_LEFT_EXT,Ae.NEGATIVE_ONE_TO_ONE_EXT),ce=ne;const Ee=ve;ve=null,this.setClear(Ee)}},getReversed:function(){return ce},setTest:function(ne){ne?ee(i.DEPTH_TEST):we(i.DEPTH_TEST)},setMask:function(ne){j!==ne&&!D&&(i.depthMask(ne),j=ne)},setFunc:function(ne){if(ce&&(ne=jp[ne]),fe!==ne){switch(ne){case Ul:i.depthFunc(i.NEVER);break;case Fl:i.depthFunc(i.ALWAYS);break;case Ol:i.depthFunc(i.LESS);break;case Ks:i.depthFunc(i.LEQUAL);break;case Bl:i.depthFunc(i.EQUAL);break;case kl:i.depthFunc(i.GEQUAL);break;case zl:i.depthFunc(i.GREATER);break;case Vl:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}fe=ne}},setLocked:function(ne){D=ne},setClear:function(ne){ve!==ne&&(ve=ne,ce&&(ne=1-ne),i.clearDepth(ne))},reset:function(){D=!1,j=null,fe=null,ve=null,ce=!1}}}function s(){let D=!1,ce=null,j=null,fe=null,ve=null,ne=null,Ae=null,Ee=null,_t=null;return{setTest:function(ct){D||(ct?ee(i.STENCIL_TEST):we(i.STENCIL_TEST))},setMask:function(ct){ce!==ct&&!D&&(i.stencilMask(ct),ce=ct)},setFunc:function(ct,Nn,In){(j!==ct||fe!==Nn||ve!==In)&&(i.stencilFunc(ct,Nn,In),j=ct,fe=Nn,ve=In)},setOp:function(ct,Nn,In){(ne!==ct||Ae!==Nn||Ee!==In)&&(i.stencilOp(ct,Nn,In),ne=ct,Ae=Nn,Ee=In)},setLocked:function(ct){D=ct},setClear:function(ct){_t!==ct&&(i.clearStencil(ct),_t=ct)},reset:function(){D=!1,ce=null,j=null,fe=null,ve=null,ne=null,Ae=null,Ee=null,_t=null}}}const r=new t,a=new n,o=new s,c=new WeakMap,l=new WeakMap;let h={},u={},d={},f=new WeakMap,g=[],v=null,m=!1,p=null,S=null,A=null,y=null,T=null,E=null,w=null,_=new Ue(0,0,0),b=0,P=!1,R=null,L=null,z=null,X=null,O=null;const I=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let V=!1,$=0;const J=i.getParameter(i.VERSION);J.indexOf("WebGL")!==-1?($=parseFloat(/^WebGL (\d)/.exec(J)[1]),V=$>=1):J.indexOf("OpenGL ES")!==-1&&($=parseFloat(/^OpenGL ES (\d)/.exec(J)[1]),V=$>=2);let re=null,se={};const ae=i.getParameter(i.SCISSOR_BOX),xe=i.getParameter(i.VIEWPORT),ye=new rt().fromArray(ae),le=new rt().fromArray(xe);function B(D,ce,j,fe){const ve=new Uint8Array(4),ne=i.createTexture();i.bindTexture(D,ne),i.texParameteri(D,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(D,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Ae=0;Ae<j;Ae++)D===i.TEXTURE_3D||D===i.TEXTURE_2D_ARRAY?i.texImage3D(ce,0,i.RGBA,1,1,fe,0,i.RGBA,i.UNSIGNED_BYTE,ve):i.texImage2D(ce+Ae,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,ve);return ne}const Z={};Z[i.TEXTURE_2D]=B(i.TEXTURE_2D,i.TEXTURE_2D,1),Z[i.TEXTURE_CUBE_MAP]=B(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),Z[i.TEXTURE_2D_ARRAY]=B(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),Z[i.TEXTURE_3D]=B(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),ee(i.DEPTH_TEST),a.setFunc(Ks),St(!1),At(Lu),ee(i.CULL_FACE),Je(ui);function ee(D){h[D]!==!0&&(i.enable(D),h[D]=!0)}function we(D){h[D]!==!1&&(i.disable(D),h[D]=!1)}function Fe(D,ce){return d[D]!==ce?(i.bindFramebuffer(D,ce),d[D]=ce,D===i.DRAW_FRAMEBUFFER&&(d[i.FRAMEBUFFER]=ce),D===i.FRAMEBUFFER&&(d[i.DRAW_FRAMEBUFFER]=ce),!0):!1}function Ie(D,ce){let j=g,fe=!1;if(D){j=f.get(ce),j===void 0&&(j=[],f.set(ce,j));const ve=D.textures;if(j.length!==ve.length||j[0]!==i.COLOR_ATTACHMENT0){for(let ne=0,Ae=ve.length;ne<Ae;ne++)j[ne]=i.COLOR_ATTACHMENT0+ne;j.length=ve.length,fe=!0}}else j[0]!==i.BACK&&(j[0]=i.BACK,fe=!0);fe&&i.drawBuffers(j)}function yt(D){return v!==D?(i.useProgram(D),v=D,!0):!1}const $e={[Qi]:i.FUNC_ADD,[vp]:i.FUNC_SUBTRACT,[xp]:i.FUNC_REVERSE_SUBTRACT};$e[yp]=i.MIN,$e[bp]=i.MAX;const at={[Mp]:i.ZERO,[Sp]:i.ONE,[Ep]:i.SRC_COLOR,[Il]:i.SRC_ALPHA,[Pp]:i.SRC_ALPHA_SATURATE,[Rp]:i.DST_COLOR,[Ap]:i.DST_ALPHA,[Tp]:i.ONE_MINUS_SRC_COLOR,[Dl]:i.ONE_MINUS_SRC_ALPHA,[Cp]:i.ONE_MINUS_DST_COLOR,[wp]:i.ONE_MINUS_DST_ALPHA,[Lp]:i.CONSTANT_COLOR,[Np]:i.ONE_MINUS_CONSTANT_COLOR,[Ip]:i.CONSTANT_ALPHA,[Dp]:i.ONE_MINUS_CONSTANT_ALPHA};function Je(D,ce,j,fe,ve,ne,Ae,Ee,_t,ct){if(D===ui){m===!0&&(we(i.BLEND),m=!1);return}if(m===!1&&(ee(i.BLEND),m=!0),D!==_p){if(D!==p||ct!==P){if((S!==Qi||T!==Qi)&&(i.blendEquation(i.FUNC_ADD),S=Qi,T=Qi),ct)switch(D){case Hs:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Nu:i.blendFunc(i.ONE,i.ONE);break;case Iu:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Du:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:He("WebGLState: Invalid blending: ",D);break}else switch(D){case Hs:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Nu:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case Iu:He("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Du:He("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:He("WebGLState: Invalid blending: ",D);break}A=null,y=null,E=null,w=null,_.set(0,0,0),b=0,p=D,P=ct}return}ve=ve||ce,ne=ne||j,Ae=Ae||fe,(ce!==S||ve!==T)&&(i.blendEquationSeparate($e[ce],$e[ve]),S=ce,T=ve),(j!==A||fe!==y||ne!==E||Ae!==w)&&(i.blendFuncSeparate(at[j],at[fe],at[ne],at[Ae]),A=j,y=fe,E=ne,w=Ae),(Ee.equals(_)===!1||_t!==b)&&(i.blendColor(Ee.r,Ee.g,Ee.b,_t),_.copy(Ee),b=_t),p=D,P=!1}function Ke(D,ce){D.side===Sn?we(i.CULL_FACE):ee(i.CULL_FACE);let j=D.side===en;ce&&(j=!j),St(j),D.blending===Hs&&D.transparent===!1?Je(ui):Je(D.blending,D.blendEquation,D.blendSrc,D.blendDst,D.blendEquationAlpha,D.blendSrcAlpha,D.blendDstAlpha,D.blendColor,D.blendAlpha,D.premultipliedAlpha),a.setFunc(D.depthFunc),a.setTest(D.depthTest),a.setMask(D.depthWrite),r.setMask(D.colorWrite);const fe=D.stencilWrite;o.setTest(fe),fe&&(o.setMask(D.stencilWriteMask),o.setFunc(D.stencilFunc,D.stencilRef,D.stencilFuncMask),o.setOp(D.stencilFail,D.stencilZFail,D.stencilZPass)),Ut(D.polygonOffset,D.polygonOffsetFactor,D.polygonOffsetUnits),D.alphaToCoverage===!0?ee(i.SAMPLE_ALPHA_TO_COVERAGE):we(i.SAMPLE_ALPHA_TO_COVERAGE)}function St(D){R!==D&&(D?i.frontFace(i.CW):i.frontFace(i.CCW),R=D)}function At(D){D!==pp?(ee(i.CULL_FACE),D!==L&&(D===Lu?i.cullFace(i.BACK):D===mp?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):we(i.CULL_FACE),L=D}function Nt(D){D!==z&&(V&&i.lineWidth(D),z=D)}function Ut(D,ce,j){D?(ee(i.POLYGON_OFFSET_FILL),(X!==ce||O!==j)&&(X=ce,O=j,a.getReversed()&&(ce=-ce),i.polygonOffset(ce,j))):we(i.POLYGON_OFFSET_FILL)}function gt(D){D?ee(i.SCISSOR_TEST):we(i.SCISSOR_TEST)}function Et(D){D===void 0&&(D=i.TEXTURE0+I-1),re!==D&&(i.activeTexture(D),re=D)}function U(D,ce,j){j===void 0&&(re===null?j=i.TEXTURE0+I-1:j=re);let fe=se[j];fe===void 0&&(fe={type:void 0,texture:void 0},se[j]=fe),(fe.type!==D||fe.texture!==ce)&&(re!==j&&(i.activeTexture(j),re=j),i.bindTexture(D,ce||Z[D]),fe.type=D,fe.texture=ce)}function Jt(){const D=se[re];D!==void 0&&D.type!==void 0&&(i.bindTexture(D.type,null),D.type=void 0,D.texture=void 0)}function et(){try{i.compressedTexImage2D(...arguments)}catch(D){He("WebGLState:",D)}}function C(){try{i.compressedTexImage3D(...arguments)}catch(D){He("WebGLState:",D)}}function x(){try{i.texSubImage2D(...arguments)}catch(D){He("WebGLState:",D)}}function k(){try{i.texSubImage3D(...arguments)}catch(D){He("WebGLState:",D)}}function W(){try{i.compressedTexSubImage2D(...arguments)}catch(D){He("WebGLState:",D)}}function Y(){try{i.compressedTexSubImage3D(...arguments)}catch(D){He("WebGLState:",D)}}function oe(){try{i.texStorage2D(...arguments)}catch(D){He("WebGLState:",D)}}function ue(){try{i.texStorage3D(...arguments)}catch(D){He("WebGLState:",D)}}function K(){try{i.texImage2D(...arguments)}catch(D){He("WebGLState:",D)}}function Q(){try{i.texImage3D(...arguments)}catch(D){He("WebGLState:",D)}}function de(D){return u[D]!==void 0?u[D]:i.getParameter(D)}function Re(D,ce){u[D]!==ce&&(i.pixelStorei(D,ce),u[D]=ce)}function pe(D){ye.equals(D)===!1&&(i.scissor(D.x,D.y,D.z,D.w),ye.copy(D))}function he(D){le.equals(D)===!1&&(i.viewport(D.x,D.y,D.z,D.w),le.copy(D))}function Ne(D,ce){let j=l.get(ce);j===void 0&&(j=new WeakMap,l.set(ce,j));let fe=j.get(D);fe===void 0&&(fe=i.getUniformBlockIndex(ce,D.name),j.set(D,fe))}function De(D,ce){const fe=l.get(ce).get(D);c.get(ce)!==fe&&(i.uniformBlockBinding(ce,fe,D.__bindingPointIndex),c.set(ce,fe))}function ze(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),h={},u={},re=null,se={},d={},f=new WeakMap,g=[],v=null,m=!1,p=null,S=null,A=null,y=null,T=null,E=null,w=null,_=new Ue(0,0,0),b=0,P=!1,R=null,L=null,z=null,X=null,O=null,ye.set(0,0,i.canvas.width,i.canvas.height),le.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:ee,disable:we,bindFramebuffer:Fe,drawBuffers:Ie,useProgram:yt,setBlending:Je,setMaterial:Ke,setFlipSided:St,setCullFace:At,setLineWidth:Nt,setPolygonOffset:Ut,setScissorTest:gt,activeTexture:Et,bindTexture:U,unbindTexture:Jt,compressedTexImage2D:et,compressedTexImage3D:C,texImage2D:K,texImage3D:Q,pixelStorei:Re,getParameter:de,updateUBOMapping:Ne,uniformBlockBinding:De,texStorage2D:oe,texStorage3D:ue,texSubImage2D:x,texSubImage3D:k,compressedTexSubImage2D:W,compressedTexSubImage3D:Y,scissor:pe,viewport:he,reset:ze}}function Ry(i,e,t,n,s,r,a){const o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new Se,h=new WeakMap,u=new Set;let d;const f=new WeakMap;let g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function v(C,x){return g?new OffscreenCanvas(C,x):Ir("canvas")}function m(C,x,k){let W=1;const Y=et(C);if((Y.width>k||Y.height>k)&&(W=k/Math.max(Y.width,Y.height)),W<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){const oe=Math.floor(W*Y.width),ue=Math.floor(W*Y.height);d===void 0&&(d=v(oe,ue));const K=x?v(oe,ue):d;return K.width=oe,K.height=ue,K.getContext("2d").drawImage(C,0,0,oe,ue),Pe("WebGLRenderer: Texture has been resized from ("+Y.width+"x"+Y.height+") to ("+oe+"x"+ue+")."),K}else return"data"in C&&Pe("WebGLRenderer: Image in DataTexture is too big ("+Y.width+"x"+Y.height+")."),C;return C}function p(C){return C.generateMipmaps}function S(C){i.generateMipmap(C)}function A(C){return C.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:C.isWebGL3DRenderTarget?i.TEXTURE_3D:C.isWebGLArrayRenderTarget||C.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function y(C,x,k,W,Y,oe=!1){if(C!==null){if(i[C]!==void 0)return i[C];Pe("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let ue;W&&(ue=e.get("EXT_texture_norm16"),ue||Pe("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let K=x;if(x===i.RED&&(k===i.FLOAT&&(K=i.R32F),k===i.HALF_FLOAT&&(K=i.R16F),k===i.UNSIGNED_BYTE&&(K=i.R8),k===i.UNSIGNED_SHORT&&ue&&(K=ue.R16_EXT),k===i.SHORT&&ue&&(K=ue.R16_SNORM_EXT)),x===i.RED_INTEGER&&(k===i.UNSIGNED_BYTE&&(K=i.R8UI),k===i.UNSIGNED_SHORT&&(K=i.R16UI),k===i.UNSIGNED_INT&&(K=i.R32UI),k===i.BYTE&&(K=i.R8I),k===i.SHORT&&(K=i.R16I),k===i.INT&&(K=i.R32I)),x===i.RG&&(k===i.FLOAT&&(K=i.RG32F),k===i.HALF_FLOAT&&(K=i.RG16F),k===i.UNSIGNED_BYTE&&(K=i.RG8),k===i.UNSIGNED_SHORT&&ue&&(K=ue.RG16_EXT),k===i.SHORT&&ue&&(K=ue.RG16_SNORM_EXT)),x===i.RG_INTEGER&&(k===i.UNSIGNED_BYTE&&(K=i.RG8UI),k===i.UNSIGNED_SHORT&&(K=i.RG16UI),k===i.UNSIGNED_INT&&(K=i.RG32UI),k===i.BYTE&&(K=i.RG8I),k===i.SHORT&&(K=i.RG16I),k===i.INT&&(K=i.RG32I)),x===i.RGB_INTEGER&&(k===i.UNSIGNED_BYTE&&(K=i.RGB8UI),k===i.UNSIGNED_SHORT&&(K=i.RGB16UI),k===i.UNSIGNED_INT&&(K=i.RGB32UI),k===i.BYTE&&(K=i.RGB8I),k===i.SHORT&&(K=i.RGB16I),k===i.INT&&(K=i.RGB32I)),x===i.RGBA_INTEGER&&(k===i.UNSIGNED_BYTE&&(K=i.RGBA8UI),k===i.UNSIGNED_SHORT&&(K=i.RGBA16UI),k===i.UNSIGNED_INT&&(K=i.RGBA32UI),k===i.BYTE&&(K=i.RGBA8I),k===i.SHORT&&(K=i.RGBA16I),k===i.INT&&(K=i.RGBA32I)),x===i.RGB&&(k===i.UNSIGNED_SHORT&&ue&&(K=ue.RGB16_EXT),k===i.SHORT&&ue&&(K=ue.RGB16_SNORM_EXT),k===i.UNSIGNED_INT_5_9_9_9_REV&&(K=i.RGB9_E5),k===i.UNSIGNED_INT_10F_11F_11F_REV&&(K=i.R11F_G11F_B10F)),x===i.RGBA){const Q=oe?io:qe.getTransfer(Y);k===i.FLOAT&&(K=i.RGBA32F),k===i.HALF_FLOAT&&(K=i.RGBA16F),k===i.UNSIGNED_BYTE&&(K=Q===tt?i.SRGB8_ALPHA8:i.RGBA8),k===i.UNSIGNED_SHORT&&ue&&(K=ue.RGBA16_EXT),k===i.SHORT&&ue&&(K=ue.RGBA16_SNORM_EXT),k===i.UNSIGNED_SHORT_4_4_4_4&&(K=i.RGBA4),k===i.UNSIGNED_SHORT_5_5_5_1&&(K=i.RGB5_A1)}return(K===i.R16F||K===i.R32F||K===i.RG16F||K===i.RG32F||K===i.RGBA16F||K===i.RGBA32F)&&e.get("EXT_color_buffer_float"),K}function T(C,x){let k;return C?x===null||x===$n||x===Cr?k=i.DEPTH24_STENCIL8:x===An?k=i.DEPTH32F_STENCIL8:x===Rr&&(k=i.DEPTH24_STENCIL8,Pe("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):x===null||x===$n||x===Cr?k=i.DEPTH_COMPONENT24:x===An?k=i.DEPTH_COMPONENT32F:x===Rr&&(k=i.DEPTH_COMPONENT16),k}function E(C,x){return p(C)===!0||C.isFramebufferTexture&&C.minFilter!==zt&&C.minFilter!==Ct?Math.log2(Math.max(x.width,x.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?x.mipmaps.length:1}function w(C){const x=C.target;x.removeEventListener("dispose",w),b(x),x.isVideoTexture&&h.delete(x),x.isHTMLTexture&&u.delete(x)}function _(C){const x=C.target;x.removeEventListener("dispose",_),R(x)}function b(C){const x=n.get(C);if(x.__webglInit===void 0)return;const k=C.source,W=f.get(k);if(W){const Y=W[x.__cacheKey];Y.usedTimes--,Y.usedTimes===0&&P(C),Object.keys(W).length===0&&f.delete(k)}n.remove(C)}function P(C){const x=n.get(C);i.deleteTexture(x.__webglTexture);const k=C.source,W=f.get(k);delete W[x.__cacheKey],a.memory.textures--}function R(C){const x=n.get(C);if(C.depthTexture&&(C.depthTexture.dispose(),n.remove(C.depthTexture)),C.isWebGLCubeRenderTarget)for(let W=0;W<6;W++){if(Array.isArray(x.__webglFramebuffer[W]))for(let Y=0;Y<x.__webglFramebuffer[W].length;Y++)i.deleteFramebuffer(x.__webglFramebuffer[W][Y]);else i.deleteFramebuffer(x.__webglFramebuffer[W]);x.__webglDepthbuffer&&i.deleteRenderbuffer(x.__webglDepthbuffer[W])}else{if(Array.isArray(x.__webglFramebuffer))for(let W=0;W<x.__webglFramebuffer.length;W++)i.deleteFramebuffer(x.__webglFramebuffer[W]);else i.deleteFramebuffer(x.__webglFramebuffer);if(x.__webglDepthbuffer&&i.deleteRenderbuffer(x.__webglDepthbuffer),x.__webglMultisampledFramebuffer&&i.deleteFramebuffer(x.__webglMultisampledFramebuffer),x.__webglColorRenderbuffer)for(let W=0;W<x.__webglColorRenderbuffer.length;W++)x.__webglColorRenderbuffer[W]&&i.deleteRenderbuffer(x.__webglColorRenderbuffer[W]);x.__webglDepthRenderbuffer&&i.deleteRenderbuffer(x.__webglDepthRenderbuffer)}const k=C.textures;for(let W=0,Y=k.length;W<Y;W++){const oe=n.get(k[W]);oe.__webglTexture&&(i.deleteTexture(oe.__webglTexture),a.memory.textures--),n.remove(k[W])}n.remove(C)}let L=0;function z(){L=0}function X(){return L}function O(C){L=C}function I(){const C=L;return C>=s.maxTextures&&Pe("WebGLTextures: Trying to use "+C+" texture units while this GPU supports only "+s.maxTextures),L+=1,C}function V(C){const x=[];return x.push(C.wrapS),x.push(C.wrapT),x.push(C.wrapR||0),x.push(C.magFilter),x.push(C.minFilter),x.push(C.anisotropy),x.push(C.internalFormat),x.push(C.format),x.push(C.type),x.push(C.generateMipmaps),x.push(C.premultiplyAlpha),x.push(C.flipY),x.push(C.unpackAlignment),x.push(C.colorSpace),x.join()}function $(C,x){const k=n.get(C);if(C.isVideoTexture&&U(C),C.isRenderTargetTexture===!1&&C.isExternalTexture!==!0&&C.version>0&&k.__version!==C.version){const W=C.image;if(W===null)Pe("WebGLRenderer: Texture marked for update but no image data found.");else if(W.complete===!1)Pe("WebGLRenderer: Texture marked for update but image is incomplete");else{we(k,C,x);return}}else C.isExternalTexture&&(k.__webglTexture=C.sourceTexture?C.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,k.__webglTexture,i.TEXTURE0+x)}function J(C,x){const k=n.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&k.__version!==C.version){we(k,C,x);return}else C.isExternalTexture&&(k.__webglTexture=C.sourceTexture?C.sourceTexture:null);t.bindTexture(i.TEXTURE_2D_ARRAY,k.__webglTexture,i.TEXTURE0+x)}function re(C,x){const k=n.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&k.__version!==C.version){we(k,C,x);return}t.bindTexture(i.TEXTURE_3D,k.__webglTexture,i.TEXTURE0+x)}function se(C,x){const k=n.get(C);if(C.isCubeDepthTexture!==!0&&C.version>0&&k.__version!==C.version){Fe(k,C,x);return}t.bindTexture(i.TEXTURE_CUBE_MAP,k.__webglTexture,i.TEXTURE0+x)}const ae={[ns]:i.REPEAT,[ln]:i.CLAMP_TO_EDGE,[Gl]:i.MIRRORED_REPEAT},xe={[zt]:i.NEAREST,[Bp]:i.NEAREST_MIPMAP_NEAREST,[ta]:i.NEAREST_MIPMAP_LINEAR,[Ct]:i.LINEAR,[Wo]:i.LINEAR_MIPMAP_NEAREST,[ri]:i.LINEAR_MIPMAP_LINEAR},ye={[Gp]:i.NEVER,[$p]:i.ALWAYS,[Hp]:i.LESS,[Uc]:i.LEQUAL,[Wp]:i.EQUAL,[Fc]:i.GEQUAL,[Xp]:i.GREATER,[qp]:i.NOTEQUAL};function le(C,x){if(x.type===An&&e.has("OES_texture_float_linear")===!1&&(x.magFilter===Ct||x.magFilter===Wo||x.magFilter===ta||x.magFilter===ri||x.minFilter===Ct||x.minFilter===Wo||x.minFilter===ta||x.minFilter===ri)&&Pe("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(C,i.TEXTURE_WRAP_S,ae[x.wrapS]),i.texParameteri(C,i.TEXTURE_WRAP_T,ae[x.wrapT]),(C===i.TEXTURE_3D||C===i.TEXTURE_2D_ARRAY)&&i.texParameteri(C,i.TEXTURE_WRAP_R,ae[x.wrapR]),i.texParameteri(C,i.TEXTURE_MAG_FILTER,xe[x.magFilter]),i.texParameteri(C,i.TEXTURE_MIN_FILTER,xe[x.minFilter]),x.compareFunction&&(i.texParameteri(C,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(C,i.TEXTURE_COMPARE_FUNC,ye[x.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(x.magFilter===zt||x.minFilter!==ta&&x.minFilter!==ri||x.type===An&&e.has("OES_texture_float_linear")===!1)return;if(x.anisotropy>1||n.get(x).__currentAnisotropy){const k=e.get("EXT_texture_filter_anisotropic");i.texParameterf(C,k.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(x.anisotropy,s.getMaxAnisotropy())),n.get(x).__currentAnisotropy=x.anisotropy}}}function B(C,x){let k=!1;C.__webglInit===void 0&&(C.__webglInit=!0,x.addEventListener("dispose",w));const W=x.source;let Y=f.get(W);Y===void 0&&(Y={},f.set(W,Y));const oe=V(x);if(oe!==C.__cacheKey){Y[oe]===void 0&&(Y[oe]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,k=!0),Y[oe].usedTimes++;const ue=Y[C.__cacheKey];ue!==void 0&&(Y[C.__cacheKey].usedTimes--,ue.usedTimes===0&&P(x)),C.__cacheKey=oe,C.__webglTexture=Y[oe].texture}return k}function Z(C,x,k){return Math.floor(Math.floor(C/k)/x)}function ee(C,x,k,W){const oe=C.updateRanges;if(oe.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,x.width,x.height,k,W,x.data);else{oe.sort((Re,pe)=>Re.start-pe.start);let ue=0;for(let Re=1;Re<oe.length;Re++){const pe=oe[ue],he=oe[Re],Ne=pe.start+pe.count,De=Z(he.start,x.width,4),ze=Z(pe.start,x.width,4);he.start<=Ne+1&&De===ze&&Z(he.start+he.count-1,x.width,4)===De?pe.count=Math.max(pe.count,he.start+he.count-pe.start):(++ue,oe[ue]=he)}oe.length=ue+1;const K=t.getParameter(i.UNPACK_ROW_LENGTH),Q=t.getParameter(i.UNPACK_SKIP_PIXELS),de=t.getParameter(i.UNPACK_SKIP_ROWS);t.pixelStorei(i.UNPACK_ROW_LENGTH,x.width);for(let Re=0,pe=oe.length;Re<pe;Re++){const he=oe[Re],Ne=Math.floor(he.start/4),De=Math.ceil(he.count/4),ze=Ne%x.width,D=Math.floor(Ne/x.width),ce=De,j=1;t.pixelStorei(i.UNPACK_SKIP_PIXELS,ze),t.pixelStorei(i.UNPACK_SKIP_ROWS,D),t.texSubImage2D(i.TEXTURE_2D,0,ze,D,ce,j,k,W,x.data)}C.clearUpdateRanges(),t.pixelStorei(i.UNPACK_ROW_LENGTH,K),t.pixelStorei(i.UNPACK_SKIP_PIXELS,Q),t.pixelStorei(i.UNPACK_SKIP_ROWS,de)}}function we(C,x,k){let W=i.TEXTURE_2D;(x.isDataArrayTexture||x.isCompressedArrayTexture)&&(W=i.TEXTURE_2D_ARRAY),x.isData3DTexture&&(W=i.TEXTURE_3D);const Y=B(C,x),oe=x.source;t.bindTexture(W,C.__webglTexture,i.TEXTURE0+k);const ue=n.get(oe);if(oe.version!==ue.__version||Y===!0){if(t.activeTexture(i.TEXTURE0+k),(typeof ImageBitmap<"u"&&x.image instanceof ImageBitmap)===!1){const j=qe.getPrimaries(qe.workingColorSpace),fe=x.colorSpace===Di?null:qe.getPrimaries(x.colorSpace),ve=x.colorSpace===Di||j===fe?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,x.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ve)}t.pixelStorei(i.UNPACK_ALIGNMENT,x.unpackAlignment);let Q=m(x.image,!1,s.maxTextureSize);Q=Jt(x,Q);const de=r.convert(x.format,x.colorSpace),Re=r.convert(x.type);let pe=y(x.internalFormat,de,Re,x.normalized,x.colorSpace,x.isVideoTexture);le(W,x);let he;const Ne=x.mipmaps,De=x.isVideoTexture!==!0,ze=ue.__version===void 0||Y===!0,D=oe.dataReady,ce=E(x,Q);if(x.isDepthTexture)pe=T(x.format===is,x.type),ze&&(De?t.texStorage2D(i.TEXTURE_2D,1,pe,Q.width,Q.height):t.texImage2D(i.TEXTURE_2D,0,pe,Q.width,Q.height,0,de,Re,null));else if(x.isDataTexture)if(Ne.length>0){De&&ze&&t.texStorage2D(i.TEXTURE_2D,ce,pe,Ne[0].width,Ne[0].height);for(let j=0,fe=Ne.length;j<fe;j++)he=Ne[j],De?D&&t.texSubImage2D(i.TEXTURE_2D,j,0,0,he.width,he.height,de,Re,he.data):t.texImage2D(i.TEXTURE_2D,j,pe,he.width,he.height,0,de,Re,he.data);x.generateMipmaps=!1}else De?(ze&&t.texStorage2D(i.TEXTURE_2D,ce,pe,Q.width,Q.height),D&&ee(x,Q,de,Re)):t.texImage2D(i.TEXTURE_2D,0,pe,Q.width,Q.height,0,de,Re,Q.data);else if(x.isCompressedTexture)if(x.isCompressedArrayTexture){De&&ze&&t.texStorage3D(i.TEXTURE_2D_ARRAY,ce,pe,Ne[0].width,Ne[0].height,Q.depth);for(let j=0,fe=Ne.length;j<fe;j++)if(he=Ne[j],x.format!==pn)if(de!==null)if(De){if(D)if(x.layerUpdates.size>0){const ve=wd(he.width,he.height,x.format,x.type);for(const ne of x.layerUpdates){const Ae=he.data.subarray(ne*ve/he.data.BYTES_PER_ELEMENT,(ne+1)*ve/he.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,j,0,0,ne,he.width,he.height,1,de,Ae)}x.clearLayerUpdates()}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,j,0,0,0,he.width,he.height,Q.depth,de,he.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,j,pe,he.width,he.height,Q.depth,0,he.data,0,0);else Pe("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else De?D&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,j,0,0,0,he.width,he.height,Q.depth,de,Re,he.data):t.texImage3D(i.TEXTURE_2D_ARRAY,j,pe,he.width,he.height,Q.depth,0,de,Re,he.data)}else{De&&ze&&t.texStorage2D(i.TEXTURE_2D,ce,pe,Ne[0].width,Ne[0].height);for(let j=0,fe=Ne.length;j<fe;j++)he=Ne[j],x.format!==pn?de!==null?De?D&&t.compressedTexSubImage2D(i.TEXTURE_2D,j,0,0,he.width,he.height,de,he.data):t.compressedTexImage2D(i.TEXTURE_2D,j,pe,he.width,he.height,0,he.data):Pe("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):De?D&&t.texSubImage2D(i.TEXTURE_2D,j,0,0,he.width,he.height,de,Re,he.data):t.texImage2D(i.TEXTURE_2D,j,pe,he.width,he.height,0,de,Re,he.data)}else if(x.isDataArrayTexture)if(De){if(ze&&t.texStorage3D(i.TEXTURE_2D_ARRAY,ce,pe,Q.width,Q.height,Q.depth),D)if(x.layerUpdates.size>0){const j=wd(Q.width,Q.height,x.format,x.type);for(const fe of x.layerUpdates){const ve=Q.data.subarray(fe*j/Q.data.BYTES_PER_ELEMENT,(fe+1)*j/Q.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,fe,Q.width,Q.height,1,de,Re,ve)}x.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,Q.width,Q.height,Q.depth,de,Re,Q.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,pe,Q.width,Q.height,Q.depth,0,de,Re,Q.data);else if(x.isData3DTexture)De?(ze&&t.texStorage3D(i.TEXTURE_3D,ce,pe,Q.width,Q.height,Q.depth),D&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,Q.width,Q.height,Q.depth,de,Re,Q.data)):t.texImage3D(i.TEXTURE_3D,0,pe,Q.width,Q.height,Q.depth,0,de,Re,Q.data);else if(x.isFramebufferTexture){if(ze)if(De)t.texStorage2D(i.TEXTURE_2D,ce,pe,Q.width,Q.height);else{let j=Q.width,fe=Q.height;for(let ve=0;ve<ce;ve++)t.texImage2D(i.TEXTURE_2D,ve,pe,j,fe,0,de,Re,null),j>>=1,fe>>=1}}else if(x.isHTMLTexture){if("texElementImage2D"in i){const j=i.canvas;if(j.hasAttribute("layoutsubtree")||j.setAttribute("layoutsubtree","true"),Q.parentNode!==j){j.appendChild(Q),u.add(x),j.onpaint=fe=>{const ve=fe.changedElements;for(const ne of u)ve.includes(ne.image)&&(ne.needsUpdate=!0)},j.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,Q);else{const ve=i.RGBA,ne=i.RGBA,Ae=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,ve,ne,Ae,Q)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(Ne.length>0){if(De&&ze){const j=et(Ne[0]);t.texStorage2D(i.TEXTURE_2D,ce,pe,j.width,j.height)}for(let j=0,fe=Ne.length;j<fe;j++)he=Ne[j],De?D&&t.texSubImage2D(i.TEXTURE_2D,j,0,0,de,Re,he):t.texImage2D(i.TEXTURE_2D,j,pe,de,Re,he);x.generateMipmaps=!1}else if(De){if(ze){const j=et(Q);t.texStorage2D(i.TEXTURE_2D,ce,pe,j.width,j.height)}D&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,de,Re,Q)}else t.texImage2D(i.TEXTURE_2D,0,pe,de,Re,Q);p(x)&&S(W),ue.__version=oe.version,x.onUpdate&&x.onUpdate(x)}C.__version=x.version}function Fe(C,x,k){if(x.image.length!==6)return;const W=B(C,x),Y=x.source;t.bindTexture(i.TEXTURE_CUBE_MAP,C.__webglTexture,i.TEXTURE0+k);const oe=n.get(Y);if(Y.version!==oe.__version||W===!0){t.activeTexture(i.TEXTURE0+k);const ue=qe.getPrimaries(qe.workingColorSpace),K=x.colorSpace===Di?null:qe.getPrimaries(x.colorSpace),Q=x.colorSpace===Di||ue===K?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,x.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),t.pixelStorei(i.UNPACK_ALIGNMENT,x.unpackAlignment),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Q);const de=x.isCompressedTexture||x.image[0].isCompressedTexture,Re=x.image[0]&&x.image[0].isDataTexture,pe=[];for(let ne=0;ne<6;ne++)!de&&!Re?pe[ne]=m(x.image[ne],!0,s.maxCubemapSize):pe[ne]=Re?x.image[ne].image:x.image[ne],pe[ne]=Jt(x,pe[ne]);const he=pe[0],Ne=r.convert(x.format,x.colorSpace),De=r.convert(x.type),ze=y(x.internalFormat,Ne,De,x.normalized,x.colorSpace),D=x.isVideoTexture!==!0,ce=oe.__version===void 0||W===!0,j=Y.dataReady;let fe=E(x,he);le(i.TEXTURE_CUBE_MAP,x);let ve;if(de){D&&ce&&t.texStorage2D(i.TEXTURE_CUBE_MAP,fe,ze,he.width,he.height);for(let ne=0;ne<6;ne++){ve=pe[ne].mipmaps;for(let Ae=0;Ae<ve.length;Ae++){const Ee=ve[Ae];x.format!==pn?Ne!==null?D?j&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Ae,0,0,Ee.width,Ee.height,Ne,Ee.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Ae,ze,Ee.width,Ee.height,0,Ee.data):Pe("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):D?j&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Ae,0,0,Ee.width,Ee.height,Ne,De,Ee.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Ae,ze,Ee.width,Ee.height,0,Ne,De,Ee.data)}}}else{if(ve=x.mipmaps,D&&ce){ve.length>0&&fe++;const ne=et(pe[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,fe,ze,ne.width,ne.height)}for(let ne=0;ne<6;ne++)if(Re){D?j&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,0,0,pe[ne].width,pe[ne].height,Ne,De,pe[ne].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,ze,pe[ne].width,pe[ne].height,0,Ne,De,pe[ne].data);for(let Ae=0;Ae<ve.length;Ae++){const _t=ve[Ae].image[ne].image;D?j&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Ae+1,0,0,_t.width,_t.height,Ne,De,_t.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Ae+1,ze,_t.width,_t.height,0,Ne,De,_t.data)}}else{D?j&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,0,0,Ne,De,pe[ne]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,ze,Ne,De,pe[ne]);for(let Ae=0;Ae<ve.length;Ae++){const Ee=ve[Ae];D?j&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Ae+1,0,0,Ne,De,Ee.image[ne]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Ae+1,ze,Ne,De,Ee.image[ne])}}}p(x)&&S(i.TEXTURE_CUBE_MAP),oe.__version=Y.version,x.onUpdate&&x.onUpdate(x)}C.__version=x.version}function Ie(C,x,k,W,Y,oe){const ue=r.convert(k.format,k.colorSpace),K=r.convert(k.type),Q=y(k.internalFormat,ue,K,k.normalized,k.colorSpace),de=n.get(x),Re=n.get(k);if(Re.__renderTarget=x,!de.__hasExternalTextures){const pe=Math.max(1,x.width>>oe),he=Math.max(1,x.height>>oe);Y===i.TEXTURE_3D||Y===i.TEXTURE_2D_ARRAY?t.texImage3D(Y,oe,Q,pe,he,x.depth,0,ue,K,null):t.texImage2D(Y,oe,Q,pe,he,0,ue,K,null)}t.bindFramebuffer(i.FRAMEBUFFER,C),Et(x)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,W,Y,Re.__webglTexture,0,gt(x)):(Y===i.TEXTURE_2D||Y>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&Y<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,W,Y,Re.__webglTexture,oe),t.bindFramebuffer(i.FRAMEBUFFER,null)}function yt(C,x,k){if(i.bindRenderbuffer(i.RENDERBUFFER,C),x.depthBuffer){const W=x.depthTexture,Y=W&&W.isDepthTexture?W.type:null,oe=T(x.stencilBuffer,Y),ue=x.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;Et(x)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,gt(x),oe,x.width,x.height):k?i.renderbufferStorageMultisample(i.RENDERBUFFER,gt(x),oe,x.width,x.height):i.renderbufferStorage(i.RENDERBUFFER,oe,x.width,x.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,ue,i.RENDERBUFFER,C)}else{const W=x.textures;for(let Y=0;Y<W.length;Y++){const oe=W[Y],ue=r.convert(oe.format,oe.colorSpace),K=r.convert(oe.type),Q=y(oe.internalFormat,ue,K,oe.normalized,oe.colorSpace);Et(x)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,gt(x),Q,x.width,x.height):k?i.renderbufferStorageMultisample(i.RENDERBUFFER,gt(x),Q,x.width,x.height):i.renderbufferStorage(i.RENDERBUFFER,Q,x.width,x.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function $e(C,x,k){const W=x.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(i.FRAMEBUFFER,C),!(x.depthTexture&&x.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");const Y=n.get(x.depthTexture);if(Y.__renderTarget=x,(!Y.__webglTexture||x.depthTexture.image.width!==x.width||x.depthTexture.image.height!==x.height)&&(x.depthTexture.image.width=x.width,x.depthTexture.image.height=x.height,x.depthTexture.needsUpdate=!0),W){if(Y.__webglInit===void 0&&(Y.__webglInit=!0,x.depthTexture.addEventListener("dispose",w)),Y.__webglTexture===void 0){Y.__webglTexture=i.createTexture(),t.bindTexture(i.TEXTURE_CUBE_MAP,Y.__webglTexture),le(i.TEXTURE_CUBE_MAP,x.depthTexture);const de=r.convert(x.depthTexture.format),Re=r.convert(x.depthTexture.type);let pe;x.depthTexture.format===_i?pe=i.DEPTH_COMPONENT24:x.depthTexture.format===is&&(pe=i.DEPTH24_STENCIL8);for(let he=0;he<6;he++)i.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+he,0,pe,x.width,x.height,0,de,Re,null)}}else $(x.depthTexture,0);const oe=Y.__webglTexture,ue=gt(x),K=W?i.TEXTURE_CUBE_MAP_POSITIVE_X+k:i.TEXTURE_2D,Q=x.depthTexture.format===is?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(x.depthTexture.format===_i)Et(x)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,Q,K,oe,0,ue):i.framebufferTexture2D(i.FRAMEBUFFER,Q,K,oe,0);else if(x.depthTexture.format===is)Et(x)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,Q,K,oe,0,ue):i.framebufferTexture2D(i.FRAMEBUFFER,Q,K,oe,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function at(C){const x=n.get(C),k=C.isWebGLCubeRenderTarget===!0;if(x.__boundDepthTexture!==C.depthTexture){const W=C.depthTexture;if(x.__depthDisposeCallback&&x.__depthDisposeCallback(),W){const Y=()=>{delete x.__boundDepthTexture,delete x.__depthDisposeCallback,W.removeEventListener("dispose",Y)};W.addEventListener("dispose",Y),x.__depthDisposeCallback=Y}x.__boundDepthTexture=W}if(C.depthTexture&&!x.__autoAllocateDepthBuffer)if(k)for(let W=0;W<6;W++)$e(x.__webglFramebuffer[W],C,W);else{const W=C.texture.mipmaps;W&&W.length>0?$e(x.__webglFramebuffer[0],C,0):$e(x.__webglFramebuffer,C,0)}else if(k){x.__webglDepthbuffer=[];for(let W=0;W<6;W++)if(t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer[W]),x.__webglDepthbuffer[W]===void 0)x.__webglDepthbuffer[W]=i.createRenderbuffer(),yt(x.__webglDepthbuffer[W],C,!1);else{const Y=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,oe=x.__webglDepthbuffer[W];i.bindRenderbuffer(i.RENDERBUFFER,oe),i.framebufferRenderbuffer(i.FRAMEBUFFER,Y,i.RENDERBUFFER,oe)}}else{const W=C.texture.mipmaps;if(W&&W.length>0?t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer),x.__webglDepthbuffer===void 0)x.__webglDepthbuffer=i.createRenderbuffer(),yt(x.__webglDepthbuffer,C,!1);else{const Y=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,oe=x.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,oe),i.framebufferRenderbuffer(i.FRAMEBUFFER,Y,i.RENDERBUFFER,oe)}}t.bindFramebuffer(i.FRAMEBUFFER,null)}function Je(C,x,k){const W=n.get(C);x!==void 0&&Ie(W.__webglFramebuffer,C,C.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),k!==void 0&&at(C)}function Ke(C){const x=C.texture,k=n.get(C),W=n.get(x);C.addEventListener("dispose",_);const Y=C.textures,oe=C.isWebGLCubeRenderTarget===!0,ue=Y.length>1;if(ue||(W.__webglTexture===void 0&&(W.__webglTexture=i.createTexture()),W.__version=x.version,a.memory.textures++),oe){k.__webglFramebuffer=[];for(let K=0;K<6;K++)if(x.mipmaps&&x.mipmaps.length>0){k.__webglFramebuffer[K]=[];for(let Q=0;Q<x.mipmaps.length;Q++)k.__webglFramebuffer[K][Q]=i.createFramebuffer()}else k.__webglFramebuffer[K]=i.createFramebuffer()}else{if(x.mipmaps&&x.mipmaps.length>0){k.__webglFramebuffer=[];for(let K=0;K<x.mipmaps.length;K++)k.__webglFramebuffer[K]=i.createFramebuffer()}else k.__webglFramebuffer=i.createFramebuffer();if(ue)for(let K=0,Q=Y.length;K<Q;K++){const de=n.get(Y[K]);de.__webglTexture===void 0&&(de.__webglTexture=i.createTexture(),a.memory.textures++)}if(C.samples>0&&Et(C)===!1){k.__webglMultisampledFramebuffer=i.createFramebuffer(),k.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,k.__webglMultisampledFramebuffer);for(let K=0;K<Y.length;K++){const Q=Y[K];k.__webglColorRenderbuffer[K]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,k.__webglColorRenderbuffer[K]);const de=r.convert(Q.format,Q.colorSpace),Re=r.convert(Q.type),pe=y(Q.internalFormat,de,Re,Q.normalized,Q.colorSpace,C.isXRRenderTarget===!0),he=gt(C);i.renderbufferStorageMultisample(i.RENDERBUFFER,he,pe,C.width,C.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+K,i.RENDERBUFFER,k.__webglColorRenderbuffer[K])}i.bindRenderbuffer(i.RENDERBUFFER,null),C.depthBuffer&&(k.__webglDepthRenderbuffer=i.createRenderbuffer(),yt(k.__webglDepthRenderbuffer,C,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(oe){t.bindTexture(i.TEXTURE_CUBE_MAP,W.__webglTexture),le(i.TEXTURE_CUBE_MAP,x);for(let K=0;K<6;K++)if(x.mipmaps&&x.mipmaps.length>0)for(let Q=0;Q<x.mipmaps.length;Q++)Ie(k.__webglFramebuffer[K][Q],C,x,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+K,Q);else Ie(k.__webglFramebuffer[K],C,x,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+K,0);p(x)&&S(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(ue){for(let K=0,Q=Y.length;K<Q;K++){const de=Y[K],Re=n.get(de);let pe=i.TEXTURE_2D;(C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(pe=C.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(pe,Re.__webglTexture),le(pe,de),Ie(k.__webglFramebuffer,C,de,i.COLOR_ATTACHMENT0+K,pe,0),p(de)&&S(pe)}t.unbindTexture()}else{let K=i.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(K=C.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(K,W.__webglTexture),le(K,x),x.mipmaps&&x.mipmaps.length>0)for(let Q=0;Q<x.mipmaps.length;Q++)Ie(k.__webglFramebuffer[Q],C,x,i.COLOR_ATTACHMENT0,K,Q);else Ie(k.__webglFramebuffer,C,x,i.COLOR_ATTACHMENT0,K,0);p(x)&&S(K),t.unbindTexture()}C.depthBuffer&&at(C)}function St(C){const x=C.textures;for(let k=0,W=x.length;k<W;k++){const Y=x[k];if(p(Y)){const oe=A(C),ue=n.get(Y).__webglTexture;t.bindTexture(oe,ue),S(oe),t.unbindTexture()}}}const At=[],Nt=[];function Ut(C){if(C.samples>0){if(Et(C)===!1){const x=C.textures,k=C.width,W=C.height;let Y=i.COLOR_BUFFER_BIT;const oe=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ue=n.get(C),K=x.length>1;if(K)for(let de=0;de<x.length;de++)t.bindFramebuffer(i.FRAMEBUFFER,ue.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+de,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,ue.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+de,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,ue.__webglMultisampledFramebuffer);const Q=C.texture.mipmaps;Q&&Q.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ue.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ue.__webglFramebuffer);for(let de=0;de<x.length;de++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(Y|=i.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(Y|=i.STENCIL_BUFFER_BIT)),K){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,ue.__webglColorRenderbuffer[de]);const Re=n.get(x[de]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Re,0)}i.blitFramebuffer(0,0,k,W,0,0,k,W,Y,i.NEAREST),c===!0&&(At.length=0,Nt.length=0,At.push(i.COLOR_ATTACHMENT0+de),C.depthBuffer&&C.resolveDepthBuffer===!1&&(At.push(oe),Nt.push(oe),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,Nt)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,At))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),K)for(let de=0;de<x.length;de++){t.bindFramebuffer(i.FRAMEBUFFER,ue.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+de,i.RENDERBUFFER,ue.__webglColorRenderbuffer[de]);const Re=n.get(x[de]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,ue.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+de,i.TEXTURE_2D,Re,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ue.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.resolveDepthBuffer===!1&&c){const x=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[x])}}}function gt(C){return Math.min(s.maxSamples,C.samples)}function Et(C){const x=n.get(C);return C.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&x.__useRenderToTexture!==!1}function U(C){const x=a.render.frame;h.get(C)!==x&&(h.set(C,x),C.update())}function Jt(C,x){const k=C.colorSpace,W=C.format,Y=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||k!==no&&k!==Di&&(qe.getTransfer(k)===tt?(W!==pn||Y!==on)&&Pe("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):He("WebGLTextures: Unsupported texture color space:",k)),x}function et(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(l.width=C.naturalWidth||C.width,l.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(l.width=C.displayWidth,l.height=C.displayHeight):(l.width=C.width,l.height=C.height),l}this.allocateTextureUnit=I,this.resetTextureUnits=z,this.getTextureUnits=X,this.setTextureUnits=O,this.setTexture2D=$,this.setTexture2DArray=J,this.setTexture3D=re,this.setTextureCube=se,this.rebindTextures=Je,this.setupRenderTarget=Ke,this.updateRenderTargetMipmap=St,this.updateMultisampleRenderTarget=Ut,this.setupDepthRenderbuffer=at,this.setupFrameBufferTexture=Ie,this.useMultisampledRTT=Et,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function Cy(i,e){function t(n,s=Di){let r;const a=qe.getTransfer(s);if(n===on)return i.UNSIGNED_BYTE;if(n===Pc)return i.UNSIGNED_SHORT_4_4_4_4;if(n===Lc)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Fh)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Oh)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===Dh)return i.BYTE;if(n===Uh)return i.SHORT;if(n===Rr)return i.UNSIGNED_SHORT;if(n===Cc)return i.INT;if(n===$n)return i.UNSIGNED_INT;if(n===An)return i.FLOAT;if(n===gi)return i.HALF_FLOAT;if(n===Bh)return i.ALPHA;if(n===kh)return i.RGB;if(n===pn)return i.RGBA;if(n===_i)return i.DEPTH_COMPONENT;if(n===is)return i.DEPTH_STENCIL;if(n===zh)return i.RED;if(n===Nc)return i.RED_INTEGER;if(n===ls)return i.RG;if(n===Ic)return i.RG_INTEGER;if(n===Dc)return i.RGBA_INTEGER;if(n===Xa||n===qa||n===$a||n===Ya)if(a===tt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Xa)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===qa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===$a)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Ya)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Xa)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===qa)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===$a)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Ya)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Hl||n===Wl||n===Xl||n===ql)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Hl)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Wl)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Xl)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===ql)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===$l||n===Yl||n===Kl||n===Zl||n===Jl||n===eo||n===jl)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===$l||n===Yl)return a===tt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Kl)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===Zl)return r.COMPRESSED_R11_EAC;if(n===Jl)return r.COMPRESSED_SIGNED_R11_EAC;if(n===eo)return r.COMPRESSED_RG11_EAC;if(n===jl)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===Ql||n===ec||n===tc||n===nc||n===ic||n===sc||n===rc||n===ac||n===oc||n===lc||n===cc||n===uc||n===dc||n===hc)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Ql)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===ec)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===tc)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===nc)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===ic)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===sc)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===rc)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===ac)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===oc)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===lc)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===cc)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===uc)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===dc)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===hc)return a===tt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===fc||n===pc||n===mc)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===fc)return a===tt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===pc)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===mc)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===gc||n===_c||n===to||n===vc)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===gc)return r.COMPRESSED_RED_RGTC1_EXT;if(n===_c)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===to)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===vc)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Cr?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}const Py=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Ly=`
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

}`;class Ny{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const n=new Jh(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new Yn({vertexShader:Py,fragmentShader:Ly,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new ft(new Po(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class Iy extends Wi{constructor(e,t){super();const n=this;let s=null,r=1,a=null,o="local-floor",c=1,l=null,h=null,u=null,d=null,f=null,g=null;const v=typeof XRWebGLBinding<"u",m=new Ny,p={},S=t.getContextAttributes();let A=null,y=null;const T=[],E=[],w=new Se;let _=null;const b=new Bt;b.viewport=new rt;const P=new Bt;P.viewport=new rt;const R=[b,P],L=new Vg;let z=null,X=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(B){let Z=T[B];return Z===void 0&&(Z=new Jo,T[B]=Z),Z.getTargetRaySpace()},this.getControllerGrip=function(B){let Z=T[B];return Z===void 0&&(Z=new Jo,T[B]=Z),Z.getGripSpace()},this.getHand=function(B){let Z=T[B];return Z===void 0&&(Z=new Jo,T[B]=Z),Z.getHandSpace()};function O(B){const Z=E.indexOf(B.inputSource);if(Z===-1)return;const ee=T[Z];ee!==void 0&&(ee.update(B.inputSource,B.frame,l||a),ee.dispatchEvent({type:B.type,data:B.inputSource}))}function I(){s.removeEventListener("select",O),s.removeEventListener("selectstart",O),s.removeEventListener("selectend",O),s.removeEventListener("squeeze",O),s.removeEventListener("squeezestart",O),s.removeEventListener("squeezeend",O),s.removeEventListener("end",I),s.removeEventListener("inputsourceschange",V);for(let B=0;B<T.length;B++){const Z=E[B];Z!==null&&(E[B]=null,T[B].disconnect(Z))}z=null,X=null,m.reset();for(const B in p)delete p[B];e.setRenderTarget(A),f=null,d=null,u=null,s=null,y=null,le.stop(),n.isPresenting=!1,e.setPixelRatio(_),e.setSize(w.width,w.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(B){r=B,n.isPresenting===!0&&Pe("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(B){o=B,n.isPresenting===!0&&Pe("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||a},this.setReferenceSpace=function(B){l=B},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return u===null&&v&&(u=new XRWebGLBinding(s,t)),u},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(B){if(s=B,s!==null){if(A=e.getRenderTarget(),s.addEventListener("select",O),s.addEventListener("selectstart",O),s.addEventListener("selectend",O),s.addEventListener("squeeze",O),s.addEventListener("squeezestart",O),s.addEventListener("squeezeend",O),s.addEventListener("end",I),s.addEventListener("inputsourceschange",V),S.xrCompatible!==!0&&await t.makeXRCompatible(),_=e.getPixelRatio(),e.getSize(w),v&&"createProjectionLayer"in XRWebGLBinding.prototype){let ee=null,we=null,Fe=null;S.depth&&(Fe=S.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ee=S.stencil?is:_i,we=S.stencil?Cr:$n);const Ie={colorFormat:t.RGBA8,depthFormat:Fe,scaleFactor:r};u=this.getBinding(),d=u.createProjectionLayer(Ie),s.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),y=new qn(d.textureWidth,d.textureHeight,{format:pn,type:on,depthTexture:new js(d.textureWidth,d.textureHeight,we,void 0,void 0,void 0,void 0,void 0,void 0,ee),stencilBuffer:S.stencil,colorSpace:e.outputColorSpace,samples:S.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}else{const ee={antialias:S.antialias,alpha:!0,depth:S.depth,stencil:S.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,t,ee),s.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),y=new qn(f.framebufferWidth,f.framebufferHeight,{format:pn,type:on,colorSpace:e.outputColorSpace,stencilBuffer:S.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(c),l=null,a=await s.requestReferenceSpace(o),le.setContext(s),le.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function V(B){for(let Z=0;Z<B.removed.length;Z++){const ee=B.removed[Z],we=E.indexOf(ee);we>=0&&(E[we]=null,T[we].disconnect(ee))}for(let Z=0;Z<B.added.length;Z++){const ee=B.added[Z];let we=E.indexOf(ee);if(we===-1){for(let Ie=0;Ie<T.length;Ie++)if(Ie>=E.length){E.push(ee),we=Ie;break}else if(E[Ie]===null){E[Ie]=ee,we=Ie;break}if(we===-1)break}const Fe=T[we];Fe&&Fe.connect(ee)}}const $=new N,J=new N;function re(B,Z,ee){$.setFromMatrixPosition(Z.matrixWorld),J.setFromMatrixPosition(ee.matrixWorld);const we=$.distanceTo(J),Fe=Z.projectionMatrix.elements,Ie=ee.projectionMatrix.elements,yt=Fe[14]/(Fe[10]-1),$e=Fe[14]/(Fe[10]+1),at=(Fe[9]+1)/Fe[5],Je=(Fe[9]-1)/Fe[5],Ke=(Fe[8]-1)/Fe[0],St=(Ie[8]+1)/Ie[0],At=yt*Ke,Nt=yt*St,Ut=we/(-Ke+St),gt=Ut*-Ke;if(Z.matrixWorld.decompose(B.position,B.quaternion,B.scale),B.translateX(gt),B.translateZ(Ut),B.matrixWorld.compose(B.position,B.quaternion,B.scale),B.matrixWorldInverse.copy(B.matrixWorld).invert(),Fe[10]===-1)B.projectionMatrix.copy(Z.projectionMatrix),B.projectionMatrixInverse.copy(Z.projectionMatrixInverse);else{const Et=yt+Ut,U=$e+Ut,Jt=At-gt,et=Nt+(we-gt),C=at*$e/U*Et,x=Je*$e/U*Et;B.projectionMatrix.makePerspective(Jt,et,C,x,Et,U),B.projectionMatrixInverse.copy(B.projectionMatrix).invert()}}function se(B,Z){Z===null?B.matrixWorld.copy(B.matrix):B.matrixWorld.multiplyMatrices(Z.matrixWorld,B.matrix),B.matrixWorldInverse.copy(B.matrixWorld).invert()}this.updateCamera=function(B){if(s===null)return;let Z=B.near,ee=B.far;m.texture!==null&&(m.depthNear>0&&(Z=m.depthNear),m.depthFar>0&&(ee=m.depthFar)),L.near=P.near=b.near=Z,L.far=P.far=b.far=ee,(z!==L.near||X!==L.far)&&(s.updateRenderState({depthNear:L.near,depthFar:L.far}),z=L.near,X=L.far),L.layers.mask=B.layers.mask|6,b.layers.mask=L.layers.mask&-5,P.layers.mask=L.layers.mask&-3;const we=B.parent,Fe=L.cameras;se(L,we);for(let Ie=0;Ie<Fe.length;Ie++)se(Fe[Ie],we);Fe.length===2?re(L,b,P):L.projectionMatrix.copy(b.projectionMatrix),ae(B,L,we)};function ae(B,Z,ee){ee===null?B.matrix.copy(Z.matrixWorld):(B.matrix.copy(ee.matrixWorld),B.matrix.invert(),B.matrix.multiply(Z.matrixWorld)),B.matrix.decompose(B.position,B.quaternion,B.scale),B.updateMatrixWorld(!0),B.projectionMatrix.copy(Z.projectionMatrix),B.projectionMatrixInverse.copy(Z.projectionMatrixInverse),B.isPerspectiveCamera&&(B.fov=Js*2*Math.atan(1/B.projectionMatrix.elements[5]),B.zoom=1)}this.getCamera=function(){return L},this.getFoveation=function(){if(!(d===null&&f===null))return c},this.setFoveation=function(B){c=B,d!==null&&(d.fixedFoveation=B),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=B)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(L)},this.getCameraTexture=function(B){return p[B]};let xe=null;function ye(B,Z){if(h=Z.getViewerPose(l||a),g=Z,h!==null){const ee=h.views;f!==null&&(e.setRenderTargetFramebuffer(y,f.framebuffer),e.setRenderTarget(y));let we=!1;ee.length!==L.cameras.length&&(L.cameras.length=0,we=!0);for(let $e=0;$e<ee.length;$e++){const at=ee[$e];let Je=null;if(f!==null)Je=f.getViewport(at);else{const St=u.getViewSubImage(d,at);Je=St.viewport,$e===0&&(e.setRenderTargetTextures(y,St.colorTexture,St.depthStencilTexture),e.setRenderTarget(y))}let Ke=R[$e];Ke===void 0&&(Ke=new Bt,Ke.layers.enable($e),Ke.viewport=new rt,R[$e]=Ke),Ke.matrix.fromArray(at.transform.matrix),Ke.matrix.decompose(Ke.position,Ke.quaternion,Ke.scale),Ke.projectionMatrix.fromArray(at.projectionMatrix),Ke.projectionMatrixInverse.copy(Ke.projectionMatrix).invert(),Ke.viewport.set(Je.x,Je.y,Je.width,Je.height),$e===0&&(L.matrix.copy(Ke.matrix),L.matrix.decompose(L.position,L.quaternion,L.scale)),we===!0&&L.cameras.push(Ke)}const Fe=s.enabledFeatures;if(Fe&&Fe.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&v){u=n.getBinding();const $e=u.getDepthInformation(ee[0]);$e&&$e.isValid&&$e.texture&&m.init($e,s.renderState)}if(Fe&&Fe.includes("camera-access")&&v){e.state.unbindTexture(),u=n.getBinding();for(let $e=0;$e<ee.length;$e++){const at=ee[$e].camera;if(at){let Je=p[at];Je||(Je=new Jh,p[at]=Je);const Ke=u.getCameraImage(at);Je.sourceTexture=Ke}}}}for(let ee=0;ee<T.length;ee++){const we=E[ee],Fe=T[ee];we!==null&&Fe!==void 0&&Fe.update(we,Z,l||a)}xe&&xe(B,Z),Z.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:Z}),g=null}const le=new hf;le.setAnimationLoop(ye),this.setAnimationLoop=function(B){xe=B},this.dispose=function(){}}}const Dy=new Oe,xf=new ke;xf.set(-1,0,0,0,1,0,0,0,1);function Uy(i,e){function t(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,nf(i)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function s(m,p,S,A,y){p.isNodeMaterial?p.uniformsNeedUpdate=!1:p.isMeshBasicMaterial?r(m,p):p.isMeshLambertMaterial?(r(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshToonMaterial?(r(m,p),u(m,p)):p.isMeshPhongMaterial?(r(m,p),h(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshStandardMaterial?(r(m,p),d(m,p),p.isMeshPhysicalMaterial&&f(m,p,y)):p.isMeshMatcapMaterial?(r(m,p),g(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),v(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(a(m,p),p.isLineDashedMaterial&&o(m,p)):p.isPointsMaterial?c(m,p,S,A):p.isSpriteMaterial?l(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,t(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===en&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,t(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===en&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,t(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,t(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);const S=e.get(p),A=S.envMap,y=S.envMapRotation;A&&(m.envMap.value=A,m.envMapRotation.value.setFromMatrix4(Dy.makeRotationFromEuler(y)).transpose(),A.isCubeTexture&&A.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(xf),m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,m.aoMapTransform))}function a(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform))}function o(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function c(m,p,S,A){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*S,m.scale.value=A*.5,p.map&&(m.map.value=p.map,t(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function l(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function h(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function u(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function d(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function f(m,p,S){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===en&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=S.texture,m.transmissionSamplerSize.value.set(S.width,S.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function v(m,p){const S=e.get(p).light;m.referencePosition.value.setFromMatrixPosition(S.matrixWorld),m.nearDistance.value=S.shadow.camera.near,m.farDistance.value=S.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function Fy(i,e,t,n){let s={},r={},a=[];const o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function c(y,T){const E=T.program;n.uniformBlockBinding(y,E)}function l(y,T){let E=s[y.id];E===void 0&&(m(y),E=h(y),s[y.id]=E,y.addEventListener("dispose",S));const w=T.program;n.updateUBOMapping(y,w);const _=e.render.frame;r[y.id]!==_&&(d(y),r[y.id]=_)}function h(y){const T=u();y.__bindingPointIndex=T;const E=i.createBuffer(),w=y.__size,_=y.usage;return i.bindBuffer(i.UNIFORM_BUFFER,E),i.bufferData(i.UNIFORM_BUFFER,w,_),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,T,E),E}function u(){for(let y=0;y<o;y++)if(a.indexOf(y)===-1)return a.push(y),y;return He("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(y){const T=s[y.id],E=y.uniforms,w=y.__cache;i.bindBuffer(i.UNIFORM_BUFFER,T);for(let _=0,b=E.length;_<b;_++){const P=E[_];if(Array.isArray(P))for(let R=0,L=P.length;R<L;R++)f(P[R],_,R,w);else f(P,_,0,w)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function f(y,T,E,w){if(v(y,T,E,w)===!0){const _=y.__offset,b=y.value;if(Array.isArray(b)){let P=0;for(let R=0;R<b.length;R++){const L=b[R],z=p(L);g(L,y.__data,P),typeof L!="number"&&typeof L!="boolean"&&!L.isMatrix3&&!ArrayBuffer.isView(L)&&(P+=z.storage/Float32Array.BYTES_PER_ELEMENT)}}else g(b,y.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,_,y.__data)}}function g(y,T,E){typeof y=="number"||typeof y=="boolean"?T[0]=y:y.isMatrix3?(T[0]=y.elements[0],T[1]=y.elements[1],T[2]=y.elements[2],T[3]=0,T[4]=y.elements[3],T[5]=y.elements[4],T[6]=y.elements[5],T[7]=0,T[8]=y.elements[6],T[9]=y.elements[7],T[10]=y.elements[8],T[11]=0):ArrayBuffer.isView(y)?T.set(new y.constructor(y.buffer,y.byteOffset,T.length)):y.toArray(T,E)}function v(y,T,E,w){const _=y.value,b=T+"_"+E;if(w[b]===void 0)return typeof _=="number"||typeof _=="boolean"?w[b]=_:ArrayBuffer.isView(_)?w[b]=_.slice():w[b]=_.clone(),!0;{const P=w[b];if(typeof _=="number"||typeof _=="boolean"){if(P!==_)return w[b]=_,!0}else{if(ArrayBuffer.isView(_))return!0;if(P.equals(_)===!1)return P.copy(_),!0}}return!1}function m(y){const T=y.uniforms;let E=0;const w=16;for(let b=0,P=T.length;b<P;b++){const R=Array.isArray(T[b])?T[b]:[T[b]];for(let L=0,z=R.length;L<z;L++){const X=R[L],O=Array.isArray(X.value)?X.value:[X.value];for(let I=0,V=O.length;I<V;I++){const $=O[I],J=p($),re=E%w,se=re%J.boundary,ae=re+se;E+=se,ae!==0&&w-ae<J.storage&&(E+=w-ae),X.__data=new Float32Array(J.storage/Float32Array.BYTES_PER_ELEMENT),X.__offset=E,E+=J.storage}}}const _=E%w;return _>0&&(E+=w-_),y.__size=E,y.__cache={},this}function p(y){const T={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(T.boundary=4,T.storage=4):y.isVector2?(T.boundary=8,T.storage=8):y.isVector3||y.isColor?(T.boundary=16,T.storage=12):y.isVector4?(T.boundary=16,T.storage=16):y.isMatrix3?(T.boundary=48,T.storage=48):y.isMatrix4?(T.boundary=64,T.storage=64):y.isTexture?Pe("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(y)?(T.boundary=16,T.storage=y.byteLength):Pe("WebGLRenderer: Unsupported uniform value type.",y),T}function S(y){const T=y.target;T.removeEventListener("dispose",S);const E=a.indexOf(T.__bindingPointIndex);a.splice(E,1),i.deleteBuffer(s[T.id]),delete s[T.id],delete r[T.id]}function A(){for(const y in s)i.deleteBuffer(s[y]);a=[],s={},r={}}return{bind:c,update:l,dispose:A}}const Oy=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let Fn=null;function By(){return Fn===null&&(Fn=new ao(Oy,16,16,ls,gi),Fn.name="DFG_LUT",Fn.minFilter=Ct,Fn.magFilter=Ct,Fn.wrapS=ln,Fn.wrapT=ln,Fn.generateMipmaps=!1,Fn.needsUpdate=!0),Fn}class yf{constructor(e={}){const{canvas:t=Zp(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1,outputBufferType:f=on}=e;this.isWebGLRenderer=!0;let g;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=n.getContextAttributes().alpha}else g=a;const v=f,m=new Set([Dc,Ic,Nc]),p=new Set([on,$n,Rr,Cr,Pc,Lc]),S=new Uint32Array(4),A=new Int32Array(4),y=new N;let T=null,E=null;const w=[],_=[];let b=null;this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Xn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const P=this;let R=!1,L=null,z=null,X=null,O=null;this._outputColorSpace=dt;let I=0,V=0,$=null,J=-1,re=null;const se=new rt,ae=new rt;let xe=null;const ye=new Ue(0);let le=0,B=t.width,Z=t.height,ee=1,we=null,Fe=null;const Ie=new rt(0,0,B,Z),yt=new rt(0,0,B,Z);let $e=!1;const at=new Vc;let Je=!1,Ke=!1;const St=new Oe,At=new N,Nt=new rt,Ut={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let gt=!1;function Et(){return $===null?ee:1}let U=n;function Jt(M,F){return t.getContext(M,F)}try{const M={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${Rc}`),t.addEventListener("webglcontextlost",_t,!1),t.addEventListener("webglcontextrestored",ct,!1),t.addEventListener("webglcontextcreationerror",Nn,!1),U===null){const F="webgl2";if(U=Jt(F,M),U===null)throw Jt(F)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}}catch(M){throw He("WebGLRenderer: "+M.message),M}let et,C,x,k,W,Y,oe,ue,K,Q,de,Re,pe,he,Ne,De,ze,D,ce,j,fe,ve,ne;function Ae(){et=new Bv(U),et.init(),fe=new Cy(U,et),C=new Pv(U,et,e,fe),x=new wy(U,et),C.reversedDepthBuffer&&d&&x.buffers.depth.setReversed(!0),z=U.createFramebuffer(),X=U.createFramebuffer(),O=U.createFramebuffer(),k=new Vv(U),W=new fy,Y=new Ry(U,et,x,W,C,fe,k),oe=new Ov(P),ue=new Xg(U),ve=new Rv(U,ue),K=new kv(U,ue,k,ve),Q=new Hv(U,K,ue,ve,k),D=new Gv(U,C,Y),Ne=new Lv(W),de=new hy(P,oe,et,C,ve,Ne),Re=new Uy(P,W),pe=new my,he=new by(et),ze=new wv(P,oe,x,Q,g,c),De=new Ay(P,Q,C),ne=new Fy(U,k,C,x),ce=new Cv(U,et,k),j=new zv(U,et,k),k.programs=de.programs,P.capabilities=C,P.extensions=et,P.properties=W,P.renderLists=pe,P.shadowMap=De,P.state=x,P.info=k}Ae(),v!==on&&(b=new Xv(v,t.width,t.height,o,s,r));const Ee=new Iy(P,U);this.xr=Ee,this.getContext=function(){return U},this.getContextAttributes=function(){return U.getContextAttributes()},this.forceContextLoss=function(){const M=et.get("WEBGL_lose_context");M&&M.loseContext()},this.forceContextRestore=function(){const M=et.get("WEBGL_lose_context");M&&M.restoreContext()},this.getPixelRatio=function(){return ee},this.setPixelRatio=function(M){M!==void 0&&(ee=M,this.setSize(B,Z,!1))},this.getSize=function(M){return M.set(B,Z)},this.setSize=function(M,F,q=!0){if(Ee.isPresenting){Pe("WebGLRenderer: Can't change size while VR device is presenting.");return}B=M,Z=F,t.width=Math.floor(M*ee),t.height=Math.floor(F*ee),q===!0&&(t.style.width=M+"px",t.style.height=F+"px"),b!==null&&b.setSize(t.width,t.height),this.setViewport(0,0,M,F)},this.getDrawingBufferSize=function(M){return M.set(B*ee,Z*ee).floor()},this.setDrawingBufferSize=function(M,F,q){B=M,Z=F,ee=q,t.width=Math.floor(M*q),t.height=Math.floor(F*q),this.setViewport(0,0,M,F)},this.setEffects=function(M){if(v===on){He("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(M){for(let F=0;F<M.length;F++)if(M[F].isOutputPass===!0){Pe("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}b.setEffects(M||[])},this.getCurrentViewport=function(M){return M.copy(se)},this.getViewport=function(M){return M.copy(Ie)},this.setViewport=function(M,F,q,G){M.isVector4?Ie.set(M.x,M.y,M.z,M.w):Ie.set(M,F,q,G),x.viewport(se.copy(Ie).multiplyScalar(ee).round())},this.getScissor=function(M){return M.copy(yt)},this.setScissor=function(M,F,q,G){M.isVector4?yt.set(M.x,M.y,M.z,M.w):yt.set(M,F,q,G),x.scissor(ae.copy(yt).multiplyScalar(ee).round())},this.getScissorTest=function(){return $e},this.setScissorTest=function(M){x.setScissorTest($e=M)},this.setOpaqueSort=function(M){we=M},this.setTransparentSort=function(M){Fe=M},this.getClearColor=function(M){return M.copy(ze.getClearColor())},this.setClearColor=function(){ze.setClearColor(...arguments)},this.getClearAlpha=function(){return ze.getClearAlpha()},this.setClearAlpha=function(){ze.setClearAlpha(...arguments)},this.clear=function(M=!0,F=!0,q=!0){let G=0;if(M){let H=!1;if($!==null){const _e=$.texture.format;H=m.has(_e)}if(H){const _e=$.texture.type,Me=p.has(_e),ge=ze.getClearColor(),Te=ze.getClearAlpha(),Ce=ge.r,Ve=ge.g,Xe=ge.b;Me?(S[0]=Ce,S[1]=Ve,S[2]=Xe,S[3]=Te,U.clearBufferuiv(U.COLOR,0,S)):(A[0]=Ce,A[1]=Ve,A[2]=Xe,A[3]=Te,U.clearBufferiv(U.COLOR,0,A))}else G|=U.COLOR_BUFFER_BIT}F&&(G|=U.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),q&&(G|=U.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),G!==0&&U.clear(G)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(M){M.setRenderer(this),L=M},this.dispose=function(){t.removeEventListener("webglcontextlost",_t,!1),t.removeEventListener("webglcontextrestored",ct,!1),t.removeEventListener("webglcontextcreationerror",Nn,!1),ze.dispose(),pe.dispose(),he.dispose(),W.dispose(),oe.dispose(),Q.dispose(),ve.dispose(),ne.dispose(),de.dispose(),Ee.dispose(),Ee.removeEventListener("sessionstart",Su),Ee.removeEventListener("sessionend",Eu),qi.stop()};function _t(M){M.preventDefault(),so("WebGLRenderer: Context Lost."),R=!0}function ct(){so("WebGLRenderer: Context Restored."),R=!1;const M=k.autoReset,F=De.enabled,q=De.autoUpdate,G=De.needsUpdate,H=De.type;Ae(),k.autoReset=M,De.enabled=F,De.autoUpdate=q,De.needsUpdate=G,De.type=H}function Nn(M){He("WebGLRenderer: A WebGL context could not be created. Reason: ",M.statusMessage)}function In(M){const F=M.target;F.removeEventListener("dispose",In),op(F)}function op(M){lp(M),W.remove(M)}function lp(M){const F=W.get(M).programs;F!==void 0&&(F.forEach(function(q){de.releaseProgram(q)}),M.isShaderMaterial&&de.releaseShaderCache(M))}this.renderBufferDirect=function(M,F,q,G,H,_e){F===null&&(F=Ut);const Me=H.isMesh&&H.matrixWorld.determinantAffine()<0,ge=dp(M,F,q,G,H);x.setMaterial(G,Me);let Te=q.index,Ce=1;if(G.wireframe===!0){if(Te=K.getWireframeAttribute(q),Te===void 0)return;Ce=2}const Ve=q.drawRange,Xe=q.attributes.position;let Le=Ve.start*Ce,it=(Ve.start+Ve.count)*Ce;_e!==null&&(Le=Math.max(Le,_e.start*Ce),it=Math.min(it,(_e.start+_e.count)*Ce)),Te!==null?(Le=Math.max(Le,0),it=Math.min(it,Te.count)):Xe!=null&&(Le=Math.max(Le,0),it=Math.min(it,Xe.count));const bt=it-Le;if(bt<0||bt===1/0)return;ve.setup(H,G,ge,q,Te);let vt,ot=ce;if(Te!==null&&(vt=ue.get(Te),ot=j,ot.setIndex(vt)),H.isMesh)G.wireframe===!0?(x.setLineWidth(G.wireframeLinewidth*Et()),ot.setMode(U.LINES)):ot.setMode(U.TRIANGLES);else if(H.isLine){let Ht=G.linewidth;Ht===void 0&&(Ht=1),x.setLineWidth(Ht*Et()),H.isLineSegments?ot.setMode(U.LINES):H.isLineLoop?ot.setMode(U.LINE_LOOP):ot.setMode(U.LINE_STRIP)}else H.isPoints?ot.setMode(U.POINTS):H.isSprite&&ot.setMode(U.TRIANGLES);if(H.isBatchedMesh)if(et.get("WEBGL_multi_draw"))ot.renderMultiDraw(H._multiDrawStarts,H._multiDrawCounts,H._multiDrawCount);else{const Ht=H._multiDrawStarts,be=H._multiDrawCounts,nn=H._multiDrawCount,Ze=Te?ue.get(Te).bytesPerElement:1,un=W.get(G).currentProgram.getUniforms();for(let Dn=0;Dn<nn;Dn++)un.setValue(U,"_gl_DrawID",Dn),ot.render(Ht[Dn]/Ze,be[Dn])}else if(H.isInstancedMesh)ot.renderInstances(Le,bt,H.count);else if(q.isInstancedBufferGeometry){const Ht=q._maxInstanceCount!==void 0?q._maxInstanceCount:1/0,be=Math.min(q.instanceCount,Ht);ot.renderInstances(Le,bt,be)}else ot.render(Le,bt)};function Mu(M,F,q){M.transparent===!0&&M.side===Sn&&M.forceSinglePass===!1?(M.side=en,M.needsUpdate=!0,ea(M,F,q),M.side=mi,M.needsUpdate=!0,ea(M,F,q),M.side=Sn):ea(M,F,q)}this.compile=function(M,F,q=null){q===null&&(q=M),E=he.get(q),E.init(F),_.push(E),q.traverseVisible(function(H){H.isLight&&H.layers.test(F.layers)&&(E.pushLight(H),H.castShadow&&E.pushShadow(H))}),M!==q&&M.traverseVisible(function(H){H.isLight&&H.layers.test(F.layers)&&(E.pushLight(H),H.castShadow&&E.pushShadow(H))}),E.setupLights();const G=new Set;return M.traverse(function(H){if(!(H.isMesh||H.isPoints||H.isLine||H.isSprite))return;const _e=H.material;if(_e)if(Array.isArray(_e))for(let Me=0;Me<_e.length;Me++){const ge=_e[Me];Mu(ge,q,H),G.add(ge)}else Mu(_e,q,H),G.add(_e)}),E=_.pop(),G},this.compileAsync=function(M,F,q=null){const G=this.compile(M,F,q);return new Promise(H=>{function _e(){if(G.forEach(function(Me){W.get(Me).currentProgram.isReady()&&G.delete(Me)}),G.size===0){H(M);return}setTimeout(_e,10)}et.get("KHR_parallel_shader_compile")!==null?_e():setTimeout(_e,10)})};let zo=null;function cp(M){zo&&zo(M)}function Su(){qi.stop()}function Eu(){qi.start()}const qi=new hf;qi.setAnimationLoop(cp),typeof self<"u"&&qi.setContext(self),this.setAnimationLoop=function(M){zo=M,Ee.setAnimationLoop(M),M===null?qi.stop():qi.start()},Ee.addEventListener("sessionstart",Su),Ee.addEventListener("sessionend",Eu),this.render=function(M,F){if(F!==void 0&&F.isCamera!==!0){He("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(R===!0)return;L!==null&&L.renderStart(M,F);const q=Ee.enabled===!0&&Ee.isPresenting===!0,G=b!==null&&($===null||q)&&b.begin(P,$);if(M.matrixWorldAutoUpdate===!0&&M.updateMatrixWorld(),F.parent===null&&F.matrixWorldAutoUpdate===!0&&F.updateMatrixWorld(),Ee.enabled===!0&&Ee.isPresenting===!0&&(b===null||b.isCompositing()===!1)&&(Ee.cameraAutoUpdate===!0&&Ee.updateCamera(F),F=Ee.getCamera()),M.isScene===!0&&M.onBeforeRender(P,M,F,$),E=he.get(M,_.length),E.init(F),E.state.textureUnits=Y.getTextureUnits(),_.push(E),St.multiplyMatrices(F.projectionMatrix,F.matrixWorldInverse),at.setFromProjectionMatrix(St,Hn,F.reversedDepth),Ke=this.localClippingEnabled,Je=Ne.init(this.clippingPlanes,Ke),T=pe.get(M,w.length),T.init(),w.push(T),Ee.enabled===!0&&Ee.isPresenting===!0){const Me=P.xr.getDepthSensingMesh();Me!==null&&Vo(Me,F,-1/0,P.sortObjects)}Vo(M,F,0,P.sortObjects),T.finish(),P.sortObjects===!0&&T.sort(we,Fe,F.reversedDepth),gt=Ee.enabled===!1||Ee.isPresenting===!1||Ee.hasDepthSensing()===!1,gt&&ze.addToRenderList(T,M),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),Je===!0&&Ne.beginShadows();const H=E.state.shadowsArray;if(De.render(H,M,F),Je===!0&&Ne.endShadows(),(G&&b.hasRenderPass())===!1){const Me=T.opaque,ge=T.transmissive;if(E.setupLights(),F.isArrayCamera){const Te=F.cameras;if(ge.length>0)for(let Ce=0,Ve=Te.length;Ce<Ve;Ce++){const Xe=Te[Ce];Au(Me,ge,M,Xe)}gt&&ze.render(M);for(let Ce=0,Ve=Te.length;Ce<Ve;Ce++){const Xe=Te[Ce];Tu(T,M,Xe,Xe.viewport)}}else ge.length>0&&Au(Me,ge,M,F),gt&&ze.render(M),Tu(T,M,F)}$!==null&&V===0&&(Y.updateMultisampleRenderTarget($),Y.updateRenderTargetMipmap($)),G&&b.end(P),M.isScene===!0&&M.onAfterRender(P,M,F),ve.resetDefaultState(),J=-1,re=null,_.pop(),_.length>0?(E=_[_.length-1],Y.setTextureUnits(E.state.textureUnits),Je===!0&&Ne.setGlobalState(P.clippingPlanes,E.state.camera)):E=null,w.pop(),w.length>0?T=w[w.length-1]:T=null,L!==null&&L.renderEnd()};function Vo(M,F,q,G){if(M.visible===!1)return;if(M.layers.test(F.layers)){if(M.isGroup)q=M.renderOrder;else if(M.isLOD)M.autoUpdate===!0&&M.update(F);else if(M.isLightProbeGrid)E.pushLightProbeGrid(M);else if(M.isLight)E.pushLight(M),M.castShadow&&E.pushShadow(M);else if(M.isSprite){if(!M.frustumCulled||at.intersectsSprite(M)){G&&Nt.setFromMatrixPosition(M.matrixWorld).applyMatrix4(St);const Me=Q.update(M),ge=M.material;ge.visible&&T.push(M,Me,ge,q,Nt.z,null)}}else if((M.isMesh||M.isLine||M.isPoints)&&(!M.frustumCulled||at.intersectsObject(M))){const Me=Q.update(M),ge=M.material;if(G&&(M.boundingSphere!==void 0?(M.boundingSphere===null&&M.computeBoundingSphere(),Nt.copy(M.boundingSphere.center)):(Me.boundingSphere===null&&Me.computeBoundingSphere(),Nt.copy(Me.boundingSphere.center)),Nt.applyMatrix4(M.matrixWorld).applyMatrix4(St)),Array.isArray(ge)){const Te=Me.groups;for(let Ce=0,Ve=Te.length;Ce<Ve;Ce++){const Xe=Te[Ce],Le=ge[Xe.materialIndex];Le&&Le.visible&&T.push(M,Me,Le,q,Nt.z,Xe)}}else ge.visible&&T.push(M,Me,ge,q,Nt.z,null)}}const _e=M.children;for(let Me=0,ge=_e.length;Me<ge;Me++)Vo(_e[Me],F,q,G)}function Tu(M,F,q,G){const{opaque:H,transmissive:_e,transparent:Me}=M;E.setupLightsView(q),Je===!0&&Ne.setGlobalState(P.clippingPlanes,q),G&&x.viewport(se.copy(G)),H.length>0&&Qr(H,F,q),_e.length>0&&Qr(_e,F,q),Me.length>0&&Qr(Me,F,q),x.buffers.depth.setTest(!0),x.buffers.depth.setMask(!0),x.buffers.color.setMask(!0),x.setPolygonOffset(!1)}function Au(M,F,q,G){if((q.isScene===!0?q.overrideMaterial:null)!==null)return;if(E.state.transmissionRenderTarget[G.id]===void 0){const Le=et.has("EXT_color_buffer_half_float")||et.has("EXT_color_buffer_float");E.state.transmissionRenderTarget[G.id]=new qn(1,1,{generateMipmaps:!0,type:Le?gi:on,minFilter:ri,samples:Math.max(4,C.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:qe.workingColorSpace})}const _e=E.state.transmissionRenderTarget[G.id],Me=G.viewport||se;_e.setSize(Me.z*P.transmissionResolutionScale,Me.w*P.transmissionResolutionScale);const ge=P.getRenderTarget(),Te=P.getActiveCubeFace(),Ce=P.getActiveMipmapLevel();P.setRenderTarget(_e),P.getClearColor(ye),le=P.getClearAlpha(),le<1&&P.setClearColor(16777215,.5),P.clear(),gt&&ze.render(q);const Ve=P.toneMapping;P.toneMapping=Xn;const Xe=G.viewport;if(G.viewport!==void 0&&(G.viewport=void 0),E.setupLightsView(G),Je===!0&&Ne.setGlobalState(P.clippingPlanes,G),Qr(M,q,G),Y.updateMultisampleRenderTarget(_e),Y.updateRenderTargetMipmap(_e),et.has("WEBGL_multisampled_render_to_texture")===!1){let Le=!1;for(let it=0,bt=F.length;it<bt;it++){const vt=F[it],{object:ot,geometry:Ht,material:be,group:nn}=vt;if(be.side===Sn&&ot.layers.test(G.layers)){const Ze=be.side;be.side=en,be.needsUpdate=!0,wu(ot,q,G,Ht,be,nn),be.side=Ze,be.needsUpdate=!0,Le=!0}}Le===!0&&(Y.updateMultisampleRenderTarget(_e),Y.updateRenderTargetMipmap(_e))}P.setRenderTarget(ge,Te,Ce),P.setClearColor(ye,le),Xe!==void 0&&(G.viewport=Xe),P.toneMapping=Ve}function Qr(M,F,q){const G=F.isScene===!0?F.overrideMaterial:null;for(let H=0,_e=M.length;H<_e;H++){const Me=M[H],{object:ge,geometry:Te,group:Ce}=Me;let Ve=Me.material;Ve.allowOverride===!0&&G!==null&&(Ve=G),ge.layers.test(q.layers)&&wu(ge,F,q,Te,Ve,Ce)}}function wu(M,F,q,G,H,_e){M.onBeforeRender(P,F,q,G,H,_e),M.modelViewMatrix.multiplyMatrices(q.matrixWorldInverse,M.matrixWorld),M.normalMatrix.getNormalMatrix(M.modelViewMatrix),H.onBeforeRender(P,F,q,G,M,_e),H.transparent===!0&&H.side===Sn&&H.forceSinglePass===!1?(H.side=en,H.needsUpdate=!0,P.renderBufferDirect(q,F,G,H,M,_e),H.side=mi,H.needsUpdate=!0,P.renderBufferDirect(q,F,G,H,M,_e),H.side=Sn):P.renderBufferDirect(q,F,G,H,M,_e),M.onAfterRender(P,F,q,G,H,_e)}function ea(M,F,q){F.isScene!==!0&&(F=Ut);const G=W.get(M),H=E.state.lights,_e=E.state.shadowsArray,Me=H.state.version,ge=de.getParameters(M,H.state,_e,F,q,E.state.lightProbeGridArray),Te=de.getProgramCacheKey(ge);let Ce=G.programs;G.environment=M.isMeshStandardMaterial||M.isMeshLambertMaterial||M.isMeshPhongMaterial?F.environment:null,G.fog=F.fog;const Ve=M.isMeshStandardMaterial||M.isMeshLambertMaterial&&!M.envMap||M.isMeshPhongMaterial&&!M.envMap;G.envMap=oe.get(M.envMap||G.environment,Ve),G.envMapRotation=G.environment!==null&&M.envMap===null?F.environmentRotation:M.envMapRotation,Ce===void 0&&(M.addEventListener("dispose",In),Ce=new Map,G.programs=Ce);let Xe=Ce.get(Te);if(Xe!==void 0){if(G.currentProgram===Xe&&G.lightsStateVersion===Me)return Cu(M,ge),Xe}else ge.uniforms=de.getUniforms(M),L!==null&&M.isNodeMaterial&&L.build(M,q,ge),M.onBeforeCompile(ge,P),Xe=de.acquireProgram(ge,Te),Ce.set(Te,Xe),G.uniforms=ge.uniforms;const Le=G.uniforms;return(!M.isShaderMaterial&&!M.isRawShaderMaterial||M.clipping===!0)&&(Le.clippingPlanes=Ne.uniform),Cu(M,ge),G.needsLights=fp(M),G.lightsStateVersion=Me,G.needsLights&&(Le.ambientLightColor.value=H.state.ambient,Le.lightProbe.value=H.state.probe,Le.directionalLights.value=H.state.directional,Le.directionalLightShadows.value=H.state.directionalShadow,Le.spotLights.value=H.state.spot,Le.spotLightShadows.value=H.state.spotShadow,Le.rectAreaLights.value=H.state.rectArea,Le.ltc_1.value=H.state.rectAreaLTC1,Le.ltc_2.value=H.state.rectAreaLTC2,Le.pointLights.value=H.state.point,Le.pointLightShadows.value=H.state.pointShadow,Le.hemisphereLights.value=H.state.hemi,Le.directionalShadowMatrix.value=H.state.directionalShadowMatrix,Le.spotLightMatrix.value=H.state.spotLightMatrix,Le.spotLightMap.value=H.state.spotLightMap,Le.pointShadowMatrix.value=H.state.pointShadowMatrix),G.lightProbeGrid=E.state.lightProbeGridArray.length>0,G.currentProgram=Xe,G.uniformsList=null,Xe}function Ru(M){if(M.uniformsList===null){const F=M.currentProgram.getUniforms();M.uniformsList=Ka.seqWithValue(F.seq,M.uniforms)}return M.uniformsList}function Cu(M,F){const q=W.get(M);q.outputColorSpace=F.outputColorSpace,q.batching=F.batching,q.batchingColor=F.batchingColor,q.instancing=F.instancing,q.instancingColor=F.instancingColor,q.instancingMorph=F.instancingMorph,q.skinning=F.skinning,q.morphTargets=F.morphTargets,q.morphNormals=F.morphNormals,q.morphColors=F.morphColors,q.morphTargetsCount=F.morphTargetsCount,q.numClippingPlanes=F.numClippingPlanes,q.numIntersection=F.numClipIntersection,q.vertexAlphas=F.vertexAlphas,q.vertexTangents=F.vertexTangents,q.toneMapping=F.toneMapping}function up(M,F){if(M.length===0)return null;if(M.length===1)return M[0].texture!==null?M[0]:null;y.setFromMatrixPosition(F.matrixWorld);for(let q=0,G=M.length;q<G;q++){const H=M[q];if(H.texture!==null&&H.boundingBox.containsPoint(y))return H}return null}function dp(M,F,q,G,H){F.isScene!==!0&&(F=Ut),Y.resetTextureUnits();const _e=F.fog,Me=G.isMeshStandardMaterial||G.isMeshLambertMaterial||G.isMeshPhongMaterial?F.environment:null,ge=$===null?P.outputColorSpace:$.isXRRenderTarget===!0?$.texture.colorSpace:qe.workingColorSpace,Te=G.isMeshStandardMaterial||G.isMeshLambertMaterial&&!G.envMap||G.isMeshPhongMaterial&&!G.envMap,Ce=oe.get(G.envMap||Me,Te),Ve=G.vertexColors===!0&&!!q.attributes.color&&q.attributes.color.itemSize===4,Xe=!!q.attributes.tangent&&(!!G.normalMap||G.anisotropy>0),Le=!!q.morphAttributes.position,it=!!q.morphAttributes.normal,bt=!!q.morphAttributes.color;let vt=Xn;G.toneMapped&&($===null||$.isXRRenderTarget===!0)&&(vt=P.toneMapping);const ot=q.morphAttributes.position||q.morphAttributes.normal||q.morphAttributes.color,Ht=ot!==void 0?ot.length:0,be=W.get(G),nn=E.state.lights;if(Je===!0&&(Ke===!0||M!==re)){const ut=M===re&&G.id===J;Ne.setState(G,M,ut)}let Ze=!1;G.version===be.__version?(be.needsLights&&be.lightsStateVersion!==nn.state.version||be.outputColorSpace!==ge||H.isBatchedMesh&&be.batching===!1||!H.isBatchedMesh&&be.batching===!0||H.isBatchedMesh&&be.batchingColor===!0&&H.colorTexture===null||H.isBatchedMesh&&be.batchingColor===!1&&H.colorTexture!==null||H.isInstancedMesh&&be.instancing===!1||!H.isInstancedMesh&&be.instancing===!0||H.isSkinnedMesh&&be.skinning===!1||!H.isSkinnedMesh&&be.skinning===!0||H.isInstancedMesh&&be.instancingColor===!0&&H.instanceColor===null||H.isInstancedMesh&&be.instancingColor===!1&&H.instanceColor!==null||H.isInstancedMesh&&be.instancingMorph===!0&&H.morphTexture===null||H.isInstancedMesh&&be.instancingMorph===!1&&H.morphTexture!==null||be.envMap!==Ce||G.fog===!0&&be.fog!==_e||be.numClippingPlanes!==void 0&&(be.numClippingPlanes!==Ne.numPlanes||be.numIntersection!==Ne.numIntersection)||be.vertexAlphas!==Ve||be.vertexTangents!==Xe||be.morphTargets!==Le||be.morphNormals!==it||be.morphColors!==bt||be.toneMapping!==vt||be.morphTargetsCount!==Ht||!!be.lightProbeGrid!=E.state.lightProbeGridArray.length>0)&&(Ze=!0):(Ze=!0,be.__version=G.version);let un=be.currentProgram;Ze===!0&&(un=ea(G,F,H),L&&G.isNodeMaterial&&L.onUpdateProgram(G,un,be));let Dn=!1,yi=!1,vs=!1;const lt=un.getUniforms(),Mt=be.uniforms;if(x.useProgram(un.program)&&(Dn=!0,yi=!0,vs=!0),G.id!==J&&(J=G.id,yi=!0),be.needsLights){const ut=up(E.state.lightProbeGridArray,H);be.lightProbeGrid!==ut&&(be.lightProbeGrid=ut,yi=!0)}if(Dn||re!==M){x.buffers.depth.getReversed()&&M.reversedDepth!==!0&&(M._reversedDepth=!0,M.updateProjectionMatrix()),lt.setValue(U,"projectionMatrix",M.projectionMatrix),lt.setValue(U,"viewMatrix",M.matrixWorldInverse);const Mi=lt.map.cameraPosition;Mi!==void 0&&Mi.setValue(U,At.setFromMatrixPosition(M.matrixWorld)),C.logarithmicDepthBuffer&&lt.setValue(U,"logDepthBufFC",2/(Math.log(M.far+1)/Math.LN2)),(G.isMeshPhongMaterial||G.isMeshToonMaterial||G.isMeshLambertMaterial||G.isMeshBasicMaterial||G.isMeshStandardMaterial||G.isShaderMaterial)&&lt.setValue(U,"isOrthographic",M.isOrthographicCamera===!0),re!==M&&(re=M,yi=!0,vs=!0)}if(be.needsLights&&(nn.state.directionalShadowMap.length>0&&lt.setValue(U,"directionalShadowMap",nn.state.directionalShadowMap,Y),nn.state.spotShadowMap.length>0&&lt.setValue(U,"spotShadowMap",nn.state.spotShadowMap,Y),nn.state.pointShadowMap.length>0&&lt.setValue(U,"pointShadowMap",nn.state.pointShadowMap,Y)),H.isSkinnedMesh){lt.setOptional(U,H,"bindMatrix"),lt.setOptional(U,H,"bindMatrixInverse");const ut=H.skeleton;ut&&(ut.boneTexture===null&&ut.computeBoneTexture(),lt.setValue(U,"boneTexture",ut.boneTexture,Y))}H.isBatchedMesh&&(lt.setOptional(U,H,"batchingTexture"),lt.setValue(U,"batchingTexture",H._matricesTexture,Y),lt.setOptional(U,H,"batchingIdTexture"),lt.setValue(U,"batchingIdTexture",H._indirectTexture,Y),lt.setOptional(U,H,"batchingColorTexture"),H._colorsTexture!==null&&lt.setValue(U,"batchingColorTexture",H._colorsTexture,Y));const bi=q.morphAttributes;if((bi.position!==void 0||bi.normal!==void 0||bi.color!==void 0)&&D.update(H,q,un),(yi||be.receiveShadow!==H.receiveShadow)&&(be.receiveShadow=H.receiveShadow,lt.setValue(U,"receiveShadow",H.receiveShadow)),(G.isMeshStandardMaterial||G.isMeshLambertMaterial||G.isMeshPhongMaterial)&&G.envMap===null&&F.environment!==null&&(Mt.envMapIntensity.value=F.environmentIntensity),Mt.dfgLUT!==void 0&&(Mt.dfgLUT.value=By()),yi){if(lt.setValue(U,"toneMappingExposure",P.toneMappingExposure),be.needsLights&&hp(Mt,vs),_e&&G.fog===!0&&Re.refreshFogUniforms(Mt,_e),Re.refreshMaterialUniforms(Mt,G,ee,Z,E.state.transmissionRenderTarget[M.id]),be.needsLights&&be.lightProbeGrid){const ut=be.lightProbeGrid;Mt.probesSH.value=ut.texture,Mt.probesMin.value.copy(ut.boundingBox.min),Mt.probesMax.value.copy(ut.boundingBox.max),Mt.probesResolution.value.copy(ut.resolution)}Ka.upload(U,Ru(be),Mt,Y)}if(G.isShaderMaterial&&G.uniformsNeedUpdate===!0&&(Ka.upload(U,Ru(be),Mt,Y),G.uniformsNeedUpdate=!1),G.isSpriteMaterial&&lt.setValue(U,"center",H.center),lt.setValue(U,"modelViewMatrix",H.modelViewMatrix),lt.setValue(U,"normalMatrix",H.normalMatrix),lt.setValue(U,"modelMatrix",H.matrixWorld),G.uniformsGroups!==void 0){const ut=G.uniformsGroups;for(let Mi=0,xs=ut.length;Mi<xs;Mi++){const Pu=ut[Mi];ne.update(Pu,un),ne.bind(Pu,un)}}return un}function hp(M,F){M.ambientLightColor.needsUpdate=F,M.lightProbe.needsUpdate=F,M.directionalLights.needsUpdate=F,M.directionalLightShadows.needsUpdate=F,M.pointLights.needsUpdate=F,M.pointLightShadows.needsUpdate=F,M.spotLights.needsUpdate=F,M.spotLightShadows.needsUpdate=F,M.rectAreaLights.needsUpdate=F,M.hemisphereLights.needsUpdate=F}function fp(M){return M.isMeshLambertMaterial||M.isMeshToonMaterial||M.isMeshPhongMaterial||M.isMeshStandardMaterial||M.isShadowMaterial||M.isShaderMaterial&&M.lights===!0}this.getActiveCubeFace=function(){return I},this.getActiveMipmapLevel=function(){return V},this.getRenderTarget=function(){return $},this.setRenderTargetTextures=function(M,F,q){const G=W.get(M);G.__autoAllocateDepthBuffer=M.resolveDepthBuffer===!1,G.__autoAllocateDepthBuffer===!1&&(G.__useRenderToTexture=!1),W.get(M.texture).__webglTexture=F,W.get(M.depthTexture).__webglTexture=G.__autoAllocateDepthBuffer?void 0:q,G.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(M,F){const q=W.get(M);q.__webglFramebuffer=F,q.__useDefaultFramebuffer=F===void 0},this.setRenderTarget=function(M,F=0,q=0){$=M,I=F,V=q;let G=null,H=!1,_e=!1;if(M){const ge=W.get(M);if(ge.__useDefaultFramebuffer!==void 0){x.bindFramebuffer(U.FRAMEBUFFER,ge.__webglFramebuffer),se.copy(M.viewport),ae.copy(M.scissor),xe=M.scissorTest,x.viewport(se),x.scissor(ae),x.setScissorTest(xe),J=-1;return}else if(ge.__webglFramebuffer===void 0)Y.setupRenderTarget(M);else if(ge.__hasExternalTextures)Y.rebindTextures(M,W.get(M.texture).__webglTexture,W.get(M.depthTexture).__webglTexture);else if(M.depthBuffer){const Ve=M.depthTexture;if(ge.__boundDepthTexture!==Ve){if(Ve!==null&&W.has(Ve)&&(M.width!==Ve.image.width||M.height!==Ve.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");Y.setupDepthRenderbuffer(M)}}const Te=M.texture;(Te.isData3DTexture||Te.isDataArrayTexture||Te.isCompressedArrayTexture)&&(_e=!0);const Ce=W.get(M).__webglFramebuffer;M.isWebGLCubeRenderTarget?(Array.isArray(Ce[F])?G=Ce[F][q]:G=Ce[F],H=!0):M.samples>0&&Y.useMultisampledRTT(M)===!1?G=W.get(M).__webglMultisampledFramebuffer:Array.isArray(Ce)?G=Ce[q]:G=Ce,se.copy(M.viewport),ae.copy(M.scissor),xe=M.scissorTest}else se.copy(Ie).multiplyScalar(ee).floor(),ae.copy(yt).multiplyScalar(ee).floor(),xe=$e;if(q!==0&&(G=z),x.bindFramebuffer(U.FRAMEBUFFER,G)&&x.drawBuffers(M,G),x.viewport(se),x.scissor(ae),x.setScissorTest(xe),H){const ge=W.get(M.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_CUBE_MAP_POSITIVE_X+F,ge.__webglTexture,q)}else if(_e){const ge=F;for(let Te=0;Te<M.textures.length;Te++){const Ce=W.get(M.textures[Te]);U.framebufferTextureLayer(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0+Te,Ce.__webglTexture,q,ge)}}else if(M!==null&&q!==0){const ge=W.get(M.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,ge.__webglTexture,q)}J=-1},this.readRenderTargetPixels=function(M,F,q,G,H,_e,Me,ge=0){if(!(M&&M.isWebGLRenderTarget)){He("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Te=W.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&Me!==void 0&&(Te=Te[Me]),Te){x.bindFramebuffer(U.FRAMEBUFFER,Te);try{const Ce=M.textures[ge],Ve=Ce.format,Xe=Ce.type;if(M.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+ge),!C.textureFormatReadable(Ve)){He("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!C.textureTypeReadable(Xe)){He("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}F>=0&&F<=M.width-G&&q>=0&&q<=M.height-H&&U.readPixels(F,q,G,H,fe.convert(Ve),fe.convert(Xe),_e)}finally{const Ce=$!==null?W.get($).__webglFramebuffer:null;x.bindFramebuffer(U.FRAMEBUFFER,Ce)}}},this.readRenderTargetPixelsAsync=async function(M,F,q,G,H,_e,Me,ge=0){if(!(M&&M.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Te=W.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&Me!==void 0&&(Te=Te[Me]),Te)if(F>=0&&F<=M.width-G&&q>=0&&q<=M.height-H){x.bindFramebuffer(U.FRAMEBUFFER,Te);const Ce=M.textures[ge],Ve=Ce.format,Xe=Ce.type;if(M.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+ge),!C.textureFormatReadable(Ve))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!C.textureTypeReadable(Xe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const Le=U.createBuffer();U.bindBuffer(U.PIXEL_PACK_BUFFER,Le),U.bufferData(U.PIXEL_PACK_BUFFER,_e.byteLength,U.STREAM_READ),U.readPixels(F,q,G,H,fe.convert(Ve),fe.convert(Xe),0);const it=$!==null?W.get($).__webglFramebuffer:null;x.bindFramebuffer(U.FRAMEBUFFER,it);const bt=U.fenceSync(U.SYNC_GPU_COMMANDS_COMPLETE,0);return U.flush(),await Jp(U,bt,4),U.bindBuffer(U.PIXEL_PACK_BUFFER,Le),U.getBufferSubData(U.PIXEL_PACK_BUFFER,0,_e),U.deleteBuffer(Le),U.deleteSync(bt),_e}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(M,F=null,q=0){const G=Math.pow(2,-q),H=Math.floor(M.image.width*G),_e=Math.floor(M.image.height*G),Me=F!==null?F.x:0,ge=F!==null?F.y:0;Y.setTexture2D(M,0),U.copyTexSubImage2D(U.TEXTURE_2D,q,0,0,Me,ge,H,_e),x.unbindTexture()},this.copyTextureToTexture=function(M,F,q=null,G=null,H=0,_e=0){let Me,ge,Te,Ce,Ve,Xe,Le,it,bt;const vt=M.isCompressedTexture?M.mipmaps[_e]:M.image;if(q!==null)Me=q.max.x-q.min.x,ge=q.max.y-q.min.y,Te=q.isBox3?q.max.z-q.min.z:1,Ce=q.min.x,Ve=q.min.y,Xe=q.isBox3?q.min.z:0;else{const Mt=Math.pow(2,-H);Me=Math.floor(vt.width*Mt),ge=Math.floor(vt.height*Mt),M.isDataArrayTexture?Te=vt.depth:M.isData3DTexture?Te=Math.floor(vt.depth*Mt):Te=1,Ce=0,Ve=0,Xe=0}G!==null?(Le=G.x,it=G.y,bt=G.z):(Le=0,it=0,bt=0);const ot=fe.convert(F.format),Ht=fe.convert(F.type);let be;F.isData3DTexture?(Y.setTexture3D(F,0),be=U.TEXTURE_3D):F.isDataArrayTexture||F.isCompressedArrayTexture?(Y.setTexture2DArray(F,0),be=U.TEXTURE_2D_ARRAY):(Y.setTexture2D(F,0),be=U.TEXTURE_2D),x.activeTexture(U.TEXTURE0),x.pixelStorei(U.UNPACK_FLIP_Y_WEBGL,F.flipY),x.pixelStorei(U.UNPACK_PREMULTIPLY_ALPHA_WEBGL,F.premultiplyAlpha),x.pixelStorei(U.UNPACK_ALIGNMENT,F.unpackAlignment);const nn=x.getParameter(U.UNPACK_ROW_LENGTH),Ze=x.getParameter(U.UNPACK_IMAGE_HEIGHT),un=x.getParameter(U.UNPACK_SKIP_PIXELS),Dn=x.getParameter(U.UNPACK_SKIP_ROWS),yi=x.getParameter(U.UNPACK_SKIP_IMAGES);x.pixelStorei(U.UNPACK_ROW_LENGTH,vt.width),x.pixelStorei(U.UNPACK_IMAGE_HEIGHT,vt.height),x.pixelStorei(U.UNPACK_SKIP_PIXELS,Ce),x.pixelStorei(U.UNPACK_SKIP_ROWS,Ve),x.pixelStorei(U.UNPACK_SKIP_IMAGES,Xe);const vs=M.isDataArrayTexture||M.isData3DTexture,lt=F.isDataArrayTexture||F.isData3DTexture;if(M.isDepthTexture){const Mt=W.get(M),bi=W.get(F),ut=W.get(Mt.__renderTarget),Mi=W.get(bi.__renderTarget);x.bindFramebuffer(U.READ_FRAMEBUFFER,ut.__webglFramebuffer),x.bindFramebuffer(U.DRAW_FRAMEBUFFER,Mi.__webglFramebuffer);for(let xs=0;xs<Te;xs++)vs&&(U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,W.get(M).__webglTexture,H,Xe+xs),U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,W.get(F).__webglTexture,_e,bt+xs)),U.blitFramebuffer(Ce,Ve,Me,ge,Le,it,Me,ge,U.DEPTH_BUFFER_BIT,U.NEAREST);x.bindFramebuffer(U.READ_FRAMEBUFFER,null),x.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else if(H!==0||M.isRenderTargetTexture||W.has(M)){const Mt=W.get(M),bi=W.get(F);x.bindFramebuffer(U.READ_FRAMEBUFFER,X),x.bindFramebuffer(U.DRAW_FRAMEBUFFER,O);for(let ut=0;ut<Te;ut++)vs?U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,Mt.__webglTexture,H,Xe+ut):U.framebufferTexture2D(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,Mt.__webglTexture,H),lt?U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,bi.__webglTexture,_e,bt+ut):U.framebufferTexture2D(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,bi.__webglTexture,_e),H!==0?U.blitFramebuffer(Ce,Ve,Me,ge,Le,it,Me,ge,U.COLOR_BUFFER_BIT,U.NEAREST):lt?U.copyTexSubImage3D(be,_e,Le,it,bt+ut,Ce,Ve,Me,ge):U.copyTexSubImage2D(be,_e,Le,it,Ce,Ve,Me,ge);x.bindFramebuffer(U.READ_FRAMEBUFFER,null),x.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else lt?M.isDataTexture||M.isData3DTexture?U.texSubImage3D(be,_e,Le,it,bt,Me,ge,Te,ot,Ht,vt.data):F.isCompressedArrayTexture?U.compressedTexSubImage3D(be,_e,Le,it,bt,Me,ge,Te,ot,vt.data):U.texSubImage3D(be,_e,Le,it,bt,Me,ge,Te,ot,Ht,vt):M.isDataTexture?U.texSubImage2D(U.TEXTURE_2D,_e,Le,it,Me,ge,ot,Ht,vt.data):M.isCompressedTexture?U.compressedTexSubImage2D(U.TEXTURE_2D,_e,Le,it,vt.width,vt.height,ot,vt.data):U.texSubImage2D(U.TEXTURE_2D,_e,Le,it,Me,ge,ot,Ht,vt);x.pixelStorei(U.UNPACK_ROW_LENGTH,nn),x.pixelStorei(U.UNPACK_IMAGE_HEIGHT,Ze),x.pixelStorei(U.UNPACK_SKIP_PIXELS,un),x.pixelStorei(U.UNPACK_SKIP_ROWS,Dn),x.pixelStorei(U.UNPACK_SKIP_IMAGES,yi),_e===0&&F.generateMipmaps&&U.generateMipmap(be),x.unbindTexture()},this.initRenderTarget=function(M){W.get(M).__webglFramebuffer===void 0&&Y.setupRenderTarget(M)},this.initTexture=function(M){M.isCubeTexture?Y.setTextureCube(M,0):M.isData3DTexture?Y.setTexture3D(M,0):M.isDataArrayTexture||M.isCompressedArrayTexture?Y.setTexture2DArray(M,0):Y.setTexture2D(M,0),x.unbindTexture()},this.resetState=function(){I=0,V=0,$=null,x.reset(),ve.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Hn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=qe._getDrawingBufferColorSpace(e),t.unpackColorSpace=qe._getUnpackColorSpace()}}const Jd={type:"change"},Yc={type:"start"},bf={type:"end"},Ua=new Ro,jd=new Li,ky=Math.cos(70*Bn.DEG2RAD),wt=new N,jt=2*Math.PI,st={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},Al=1e-6;class Mf extends Hg{constructor(e,t=null){super(e,t),this.state=st.NONE,this.target=new N,this.cursor=new N,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:Gs.ROTATE,MIDDLE:Gs.DOLLY,RIGHT:Gs.PAN},this.touches={ONE:ks.ROTATE,TWO:ks.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle="auto",this._domElementKeyEvents=null,this._lastPosition=new N,this._lastQuaternion=new Ot,this._lastTargetPosition=new N,this._quat=new Ot().setFromUnitVectors(e.up,new N(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new Td,this._sphericalDelta=new Td,this._scale=1,this._panOffset=new N,this._rotateStart=new Se,this._rotateEnd=new Se,this._rotateDelta=new Se,this._panStart=new Se,this._panEnd=new Se,this._panDelta=new Se,this._dollyStart=new Se,this._dollyEnd=new Se,this._dollyDelta=new Se,this._dollyDirection=new N,this._mouse=new Se,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=Vy.bind(this),this._onPointerDown=zy.bind(this),this._onPointerUp=Gy.bind(this),this._onContextMenu=Ky.bind(this),this._onMouseWheel=Xy.bind(this),this._onKeyDown=qy.bind(this),this._onTouchStart=$y.bind(this),this._onTouchMove=Yy.bind(this),this._onMouseDown=Hy.bind(this),this._onMouseMove=Wy.bind(this),this._interceptControlDown=Zy.bind(this),this._interceptControlUp=Jy.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(e){this._cursorStyle=e,e==="grab"?this.domElement.style.cursor="grab":this.domElement.style.cursor="auto"}get cursorStyle(){return this._cursorStyle}connect(e){super.connect(e),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction=""}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(Jd),this.update(),this.state=st.NONE}pan(e,t){this._pan(e,t),this.update()}dollyIn(e){this._dollyIn(e),this.update()}dollyOut(e){this._dollyOut(e),this.update()}rotateLeft(e){this._rotateLeft(e),this.update()}rotateUp(e){this._rotateUp(e),this.update()}update(e=null){const t=this.object.position;wt.copy(t).sub(this.target),wt.applyQuaternion(this._quat),this._spherical.setFromVector3(wt),this.autoRotate&&this.state===st.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(n)&&isFinite(s)&&(n<-Math.PI?n+=jt:n>Math.PI&&(n-=jt),s<-Math.PI?s+=jt:s>Math.PI&&(s-=jt),n<=s?this._spherical.theta=Math.max(n,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+s)/2?Math.max(n,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{const a=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=a!=this._spherical.radius}if(wt.setFromSpherical(this._spherical),wt.applyQuaternion(this._quatInverse),t.copy(this.target).add(wt),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let a=null;if(this.object.isPerspectiveCamera){const o=wt.length();a=this._clampDistance(o*this._scale);const c=o-a;this.object.position.addScaledVector(this._dollyDirection,c),this.object.updateMatrixWorld(),r=!!c}else if(this.object.isOrthographicCamera){const o=new N(this._mouse.x,this._mouse.y,0);o.unproject(this.object);const c=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=c!==this.object.zoom;const l=new N(this._mouse.x,this._mouse.y,0);l.unproject(this.object),this.object.position.sub(l).add(o),this.object.updateMatrixWorld(),a=wt.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;a!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(a).add(this.object.position):(Ua.origin.copy(this.object.position),Ua.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(Ua.direction))<ky?this.object.lookAt(this.target):(jd.setFromNormalAndCoplanarPoint(this.object.up,this.target),Ua.intersectPlane(jd,this.target))))}else if(this.object.isOrthographicCamera){const a=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),a!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>Al||8*(1-this._lastQuaternion.dot(this.object.quaternion))>Al||this._lastTargetPosition.distanceToSquared(this.target)>Al?(this.dispatchEvent(Jd),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?jt/60*this.autoRotateSpeed*e:jt/60/60*this.autoRotateSpeed}_getZoomScale(e){const t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){wt.setFromMatrixColumn(t,0),wt.multiplyScalar(-e),this._panOffset.add(wt)}_panUp(e,t){this.screenSpacePanning===!0?wt.setFromMatrixColumn(t,1):(wt.setFromMatrixColumn(t,0),wt.crossVectors(this.object.up,wt)),wt.multiplyScalar(e),this._panOffset.add(wt)}_pan(e,t){const n=this.domElement;if(this.object.isPerspectiveCamera){const s=this.object.position;wt.copy(s).sub(this.target);let r=wt.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*r/n.clientHeight,this.object.matrix),this._panUp(2*t*r/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;const n=this.domElement.getBoundingClientRect(),s=e-n.left,r=t-n.top,a=n.width,o=n.height;this._mouse.x=s/a*2-1,this._mouse.y=-(r/o)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const t=this.domElement;this._rotateLeft(jt*this._rotateDelta.x/t.clientHeight),this._rotateUp(jt*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(jt*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-jt*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(jt*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-jt*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._rotateStart.set(n,s)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panStart.set(n,s)}}_handleTouchStartDolly(e){const t=this._getSecondPointerPosition(e),n=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(n*n+s*s);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{const n=this._getSecondPointerPosition(e),s=.5*(e.pageX+n.x),r=.5*(e.pageY+n.y);this._rotateEnd.set(s,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const t=this.domElement;this._rotateLeft(jt*this._rotateDelta.x/t.clientHeight),this._rotateUp(jt*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panEnd.set(n,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){const t=this._getSecondPointerPosition(e),n=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(n*n+s*s);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);const a=(e.pageX+t.x)*.5,o=(e.pageY+t.y)*.5;this._updateZoomParameters(a,o)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new Se,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){const t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){const t=e.deltaMode,n={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}}function zy(i){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(i.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(i)&&(this._addPointer(i),i.pointerType==="touch"?this._onTouchStart(i):this._onMouseDown(i),this._cursorStyle==="grab"&&(this.domElement.style.cursor="grabbing")))}function Vy(i){this.enabled!==!1&&(i.pointerType==="touch"?this._onTouchMove(i):this._onMouseMove(i))}function Gy(i){switch(this._removePointer(i),this._pointers.length){case 0:this.domElement.releasePointerCapture(i.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(bf),this.state=st.NONE,this._cursorStyle==="grab"&&(this.domElement.style.cursor="grab");break;case 1:const e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function Hy(i){let e;switch(i.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case Gs.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(i),this.state=st.DOLLY;break;case Gs.ROTATE:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=st.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=st.ROTATE}break;case Gs.PAN:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=st.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=st.PAN}break;default:this.state=st.NONE}this.state!==st.NONE&&this.dispatchEvent(Yc)}function Wy(i){switch(this.state){case st.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(i);break;case st.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(i);break;case st.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(i);break}}function Xy(i){this.enabled===!1||this.enableZoom===!1||this.state!==st.NONE||(i.preventDefault(),this.dispatchEvent(Yc),this._handleMouseWheel(this._customWheelEvent(i)),this.dispatchEvent(bf))}function qy(i){this.enabled!==!1&&this._handleKeyDown(i)}function $y(i){switch(this._trackPointer(i),this._pointers.length){case 1:switch(this.touches.ONE){case ks.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(i),this.state=st.TOUCH_ROTATE;break;case ks.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(i),this.state=st.TOUCH_PAN;break;default:this.state=st.NONE}break;case 2:switch(this.touches.TWO){case ks.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(i),this.state=st.TOUCH_DOLLY_PAN;break;case ks.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(i),this.state=st.TOUCH_DOLLY_ROTATE;break;default:this.state=st.NONE}break;default:this.state=st.NONE}this.state!==st.NONE&&this.dispatchEvent(Yc)}function Yy(i){switch(this._trackPointer(i),this.state){case st.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(i),this.update();break;case st.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(i),this.update();break;case st.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(i),this.update();break;case st.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(i),this.update();break;default:this.state=st.NONE}}function Ky(i){this.enabled!==!1&&i.preventDefault()}function Zy(i){i.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function Jy(i){i.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}class jy extends Xi{constructor(e){super(e)}load(e,t,n,s){const r=this,a=new qc(this.manager);a.setPath(this.path),a.setResponseType("arraybuffer"),a.setRequestHeader(this.requestHeader),a.setWithCredentials(this.withCredentials),a.load(e,function(o){try{t(r.parse(o))}catch(c){s?s(c):console.error(c),r.manager.itemError(e)}},n,s)}parse(e){function t(l){const h=new DataView(l),u=32/8*3+32/8*3*3+16/8,d=h.getUint32(80,!0);if(80+32/8+d*u===h.byteLength)return!0;const g=[115,111,108,105,100];for(let v=0;v<5;v++)if(n(g,h,v))return!1;return!0}function n(l,h,u){for(let d=0,f=l.length;d<f;d++)if(l[d]!==h.getUint8(u+d))return!1;return!0}function s(l){const h=new DataView(l),u=h.getUint32(80,!0);let d,f,g,v=!1,m,p,S,A,y;for(let R=0;R<70;R++)h.getUint32(R,!1)==1129270351&&h.getUint8(R+4)==82&&h.getUint8(R+5)==61&&(v=!0,m=new Float32Array(u*3*3),p=h.getUint8(R+6)/255,S=h.getUint8(R+7)/255,A=h.getUint8(R+8)/255,y=h.getUint8(R+9)/255);const T=84,E=12*4+2,w=new mt,_=new Float32Array(u*3*3),b=new Float32Array(u*3*3),P=new Ue;for(let R=0;R<u;R++){const L=T+R*E,z=h.getFloat32(L,!0),X=h.getFloat32(L+4,!0),O=h.getFloat32(L+8,!0);if(v){const I=h.getUint16(L+48,!0);I&32768?(d=p,f=S,g=A):(d=(I&31)/31,f=(I>>5&31)/31,g=(I>>10&31)/31)}for(let I=1;I<=3;I++){const V=L+I*12,$=R*3*3+(I-1)*3;_[$]=h.getFloat32(V,!0),_[$+1]=h.getFloat32(V+4,!0),_[$+2]=h.getFloat32(V+8,!0),b[$]=z,b[$+1]=X,b[$+2]=O,v&&(P.setRGB(d,f,g,dt),m[$]=P.r,m[$+1]=P.g,m[$+2]=P.b)}}return w.setAttribute("position",new tn(_,3)),w.setAttribute("normal",new tn(b,3)),v&&(w.setAttribute("color",new tn(m,3)),w.hasColors=!0,w.alpha=y),w}function r(l){const h=new mt,u=/solid([\s\S]*?)endsolid/g,d=/facet([\s\S]*?)endfacet/g,f=/solid\s(.+)/;let g=0;const v=/[\s]+([+-]?(?:\d*)(?:\.\d*)?(?:[eE][+-]?\d+)?)/.source,m=new RegExp("vertex"+v+v+v,"g"),p=new RegExp("normal"+v+v+v,"g"),S=[],A=[],y=[],T=new N;let E,w=0,_=0,b=0;for(;(E=u.exec(l))!==null;){_=b;const P=E[0],R=(E=f.exec(P))!==null?E[1]:"";for(y.push(R);(E=d.exec(P))!==null;){let X=0,O=0;const I=E[0];for(;(E=p.exec(I))!==null;)T.x=parseFloat(E[1]),T.y=parseFloat(E[2]),T.z=parseFloat(E[3]),O++;for(;(E=m.exec(I))!==null;)S.push(parseFloat(E[1]),parseFloat(E[2]),parseFloat(E[3])),A.push(T.x,T.y,T.z),X++,b++;O!==1&&console.error("THREE.STLLoader: Something isn't right with the normal of face number "+g),X!==3&&console.error("THREE.STLLoader: Something isn't right with the vertices of face number "+g),g++}const L=_,z=b-_;h.userData.groupNames=y,h.addGroup(L,z,w),w++}return h.setAttribute("position",new Ye(S,3)),h.setAttribute("normal",new Ye(A,3)),h}function a(l){return typeof l!="string"?new TextDecoder().decode(l):l}function o(l){if(typeof l=="string"){const h=new Uint8Array(l.length);for(let u=0;u<l.length;u++)h[u]=l.charCodeAt(u)&255;return h.buffer||h}else return l}const c=o(e);return t(c)?s(c):r(a(e))}}class Qd extends Ng{constructor(e){super(e)}parse(e){function t(I){switch(I.image_type){case d:case v:if(I.colormap_length>256||I.colormap_size!==24||I.colormap_type!==1)throw new Error("THREE.TGALoader: Invalid type colormap data for indexed type.");break;case f:case g:case m:case p:if(I.colormap_type)throw new Error("THREE.TGALoader: Invalid type colormap data for colormap type.");break;case u:throw new Error("THREE.TGALoader: No data.");default:throw new Error("THREE.TGALoader: Invalid type "+I.image_type)}if(I.width<=0||I.height<=0)throw new Error("THREE.TGALoader: Invalid image size.");if(I.pixel_size!==8&&I.pixel_size!==16&&I.pixel_size!==24&&I.pixel_size!==32)throw new Error("THREE.TGALoader: Invalid pixel size "+I.pixel_size)}function n(I,V,$,J,re){let se,ae;const xe=$.pixel_size>>3,ye=$.width*$.height*xe;if(V&&(ae=re.subarray(J,J+=$.colormap_length*($.colormap_size>>3))),I){se=new Uint8Array(ye);let le,B,Z,ee=0;const we=new Uint8Array(xe);for(;ee<ye;)if(le=re[J++],B=(le&127)+1,le&128){for(Z=0;Z<xe;++Z)we[Z]=re[J++];for(Z=0;Z<B;++Z)se.set(we,ee+Z*xe);ee+=xe*B}else{for(B*=xe,Z=0;Z<B;++Z)se[ee+Z]=re[J++];ee+=B}}else se=re.subarray(J,J+=V?$.width*$.height:ye);return{pixel_data:se,palettes:ae}}function s(I,V,$,J,re,se,ae,xe,ye){const le=ye;let B,Z=0,ee,we;const Fe=P.width;for(we=V;we!==J;we+=$)for(ee=re;ee!==ae;ee+=se,Z++)B=xe[Z],I[(ee+Fe*we)*4+3]=255,I[(ee+Fe*we)*4+2]=le[B*3+0],I[(ee+Fe*we)*4+1]=le[B*3+1],I[(ee+Fe*we)*4+0]=le[B*3+2];return I}function r(I,V,$,J,re,se,ae,xe){let ye,le=0,B,Z;const ee=P.width;for(Z=V;Z!==J;Z+=$)for(B=re;B!==ae;B+=se,le+=2)ye=xe[le+0]+(xe[le+1]<<8),I[(B+ee*Z)*4+0]=(ye&31744)>>7,I[(B+ee*Z)*4+1]=(ye&992)>>2,I[(B+ee*Z)*4+2]=(ye&31)<<3,I[(B+ee*Z)*4+3]=ye&32768?0:255;return I}function a(I,V,$,J,re,se,ae,xe){let ye=0,le,B;const Z=P.width;for(B=V;B!==J;B+=$)for(le=re;le!==ae;le+=se,ye+=3)I[(le+Z*B)*4+3]=255,I[(le+Z*B)*4+2]=xe[ye+0],I[(le+Z*B)*4+1]=xe[ye+1],I[(le+Z*B)*4+0]=xe[ye+2];return I}function o(I,V,$,J,re,se,ae,xe){let ye=0,le,B;const Z=P.width;for(B=V;B!==J;B+=$)for(le=re;le!==ae;le+=se,ye+=4)I[(le+Z*B)*4+2]=xe[ye+0],I[(le+Z*B)*4+1]=xe[ye+1],I[(le+Z*B)*4+0]=xe[ye+2],I[(le+Z*B)*4+3]=xe[ye+3];return I}function c(I,V,$,J,re,se,ae,xe){let ye,le=0,B,Z;const ee=P.width;for(Z=V;Z!==J;Z+=$)for(B=re;B!==ae;B+=se,le++)ye=xe[le],I[(B+ee*Z)*4+0]=ye,I[(B+ee*Z)*4+1]=ye,I[(B+ee*Z)*4+2]=ye,I[(B+ee*Z)*4+3]=255;return I}function l(I,V,$,J,re,se,ae,xe){let ye=0,le,B;const Z=P.width;for(B=V;B!==J;B+=$)for(le=re;le!==ae;le+=se,ye+=2)I[(le+Z*B)*4+0]=xe[ye+0],I[(le+Z*B)*4+1]=xe[ye+0],I[(le+Z*B)*4+2]=xe[ye+0],I[(le+Z*B)*4+3]=xe[ye+1];return I}function h(I,V,$,J,re){let se,ae,xe,ye,le,B;switch((P.flags&S)>>A){default:case E:se=0,xe=1,le=V,ae=0,ye=1,B=$;break;case y:se=0,xe=1,le=V,ae=$-1,ye=-1,B=-1;break;case w:se=V-1,xe=-1,le=-1,ae=0,ye=1,B=$;break;case T:se=V-1,xe=-1,le=-1,ae=$-1,ye=-1,B=-1;break}if(z)switch(P.pixel_size){case 8:c(I,ae,ye,B,se,xe,le,J);break;case 16:l(I,ae,ye,B,se,xe,le,J);break;default:throw new Error("THREE.TGALoader: Format not supported.")}else switch(P.pixel_size){case 8:s(I,ae,ye,B,se,xe,le,J,re);break;case 16:r(I,ae,ye,B,se,xe,le,J);break;case 24:a(I,ae,ye,B,se,xe,le,J);break;case 32:o(I,ae,ye,B,se,xe,le,J);break;default:throw new Error("THREE.TGALoader: Format not supported.")}return I}const u=0,d=1,f=2,g=3,v=9,m=10,p=11,S=48,A=4,y=0,T=1,E=2,w=3;if(e.length<19)throw new Error("THREE.TGALoader: Not enough data to contain header.");let _=0;const b=new Uint8Array(e),P={id_length:b[_++],colormap_type:b[_++],image_type:b[_++],colormap_index:b[_++]|b[_++]<<8,colormap_length:b[_++]|b[_++]<<8,colormap_size:b[_++],origin:[b[_++]|b[_++]<<8,b[_++]|b[_++]<<8],width:b[_++]|b[_++]<<8,height:b[_++]|b[_++]<<8,pixel_size:b[_++],flags:b[_++]};if(t(P),P.id_length+_>e.length)throw new Error("THREE.TGALoader: No data.");_+=P.id_length;let R=!1,L=!1,z=!1;switch(P.image_type){case v:R=!0,L=!0;break;case d:L=!0;break;case m:R=!0;break;case f:break;case p:R=!0,z=!0;break;case g:z=!0;break}const X=new Uint8Array(P.width*P.height*4),O=n(R,L,P,_,b);return h(X,P.width,P.height,O.pixel_data,O.palettes),{data:X,width:P.width,height:P.height,flipY:!0,generateMipmaps:!0,minFilter:ri}}}function an(i,e){const t=[],n=i.childNodes;for(let s=0,r=n.length;s<r;s++){const a=n[s];a.nodeName===e&&t.push(a)}return t}function Qy(i){return i.length===0?[]:i.trim().split(/\s+/)}function Kt(i){return i.length===0?[]:i.trim().split(/\s+/).map(parseFloat)}function Fa(i){return i.length===0?[]:i.trim().split(/\s+/).map(e=>parseInt(e))}function Dt(i){return i.substring(1)}class eb{constructor(){this.count=0}generateId(){return"three_default_"+this.count++}parse(e){if(e.length===0)return null;const t=new DOMParser().parseFromString(e,"application/xml"),n=an(t,"COLLADA")[0],s=t.getElementsByTagName("parsererror")[0];if(s!==void 0){const c=an(s,"div")[0];let l;return c?l=c.textContent:l=this.parserErrorToText(s),console.error(`THREE.ColladaLoader: Failed to parse collada file.
`,l),null}const r=n.getAttribute("version");console.debug("THREE.ColladaLoader: File version",r);const a=this.parseAsset(an(n,"asset")[0]),o={animations:{},clips:{},controllers:{},images:{},effects:{},materials:{},cameras:{},lights:{},geometries:{},nodes:{},visualScenes:{},kinematicsModels:{},physicsModels:{},kinematicsScenes:{},joints:{}};return this.library=o,this.collada=n,this.parseLibrary(n,"library_animations","animation",this.parseAnimation.bind(this)),this.parseLibrary(n,"library_animation_clips","animation_clip",this.parseAnimationClip.bind(this)),this.parseLibrary(n,"library_controllers","controller",this.parseController.bind(this)),this.parseLibrary(n,"library_images","image",this.parseImage.bind(this)),this.parseLibrary(n,"library_effects","effect",this.parseEffect.bind(this)),this.parseLibrary(n,"library_materials","material",this.parseMaterial.bind(this)),this.parseLibrary(n,"library_cameras","camera",this.parseCamera.bind(this)),this.parseLibrary(n,"library_lights","light",this.parseLight.bind(this)),this.parseLibrary(n,"library_geometries","geometry",this.parseGeometry.bind(this)),this.parseLibrary(n,"library_nodes","node",this.parseNode.bind(this)),this.parseLibrary(n,"library_visual_scenes","visual_scene",this.parseVisualScene.bind(this)),this.parseLibrary(n,"library_joints","joint",this.parseLibraryJoint.bind(this)),this.parseLibrary(n,"library_kinematics_models","kinematics_model",this.parseKinematicsModel.bind(this)),this.parseLibrary(n,"library_physics_models","physics_model",this.parsePhysicsModel.bind(this)),this.parseLibrary(n,"scene","instance_kinematics_scene",this.parseKinematicsScene.bind(this)),{library:o,asset:a,collada:n}}parserErrorToText(e){const t=[],n=[e];for(;n.length;){const s=n.shift();s.nodeType===Node.TEXT_NODE?t.push(s.textContent):(t.push(`
`),n.push(...s.childNodes))}return t.join("").trim()}parseAsset(e){return{unit:this.parseAssetUnit(an(e,"unit")[0]),upAxis:this.parseAssetUpAxis(an(e,"up_axis")[0])}}parseAssetUnit(e){return e!==void 0&&e.hasAttribute("meter")===!0?parseFloat(e.getAttribute("meter")):1}parseAssetUpAxis(e){return e!==void 0?e.textContent:"Y_UP"}parseLibrary(e,t,n,s){const r=an(e,t)[0];if(r!==void 0){const a=an(r,n);for(let o=0;o<a.length;o++)s(a[o])}}parseAnimation(e){const t={sources:{},samplers:{},channels:{}};let n=!1;for(let s=0,r=e.childNodes.length;s<r;s++){const a=e.childNodes[s];if(a.nodeType!==1)continue;let o;switch(a.nodeName){case"source":o=a.getAttribute("id"),t.sources[o]=this.parseSource(a);break;case"sampler":o=a.getAttribute("id"),t.samplers[o]=this.parseAnimationSampler(a);break;case"channel":o=a.getAttribute("target"),t.channels[o]=this.parseAnimationChannel(a);break;case"animation":this.parseAnimation(a),n=!0;break}}n===!1&&(this.library.animations[e.getAttribute("id")||Bn.generateUUID()]=t)}parseAnimationSampler(e){const t={inputs:{}};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"input":const a=Dt(r.getAttribute("source")),o=r.getAttribute("semantic");t.inputs[o]=a;break}}return t}parseAnimationChannel(e){const t={};let s=e.getAttribute("target").split("/");const r=s.shift();let a=s.shift();const o=a.indexOf("(")!==-1,c=a.indexOf(".")!==-1;if(c)s=a.split("."),a=s.shift(),t.member=s.shift();else if(o){const l=a.split("(");a=l.shift();for(let h=0;h<l.length;h++)l[h]=parseInt(l[h].replace(/\)/,""));t.indices=l}return t.id=r,t.sid=a,t.arraySyntax=o,t.memberSyntax=c,t.sampler=Dt(e.getAttribute("source")),t}parseAnimationClip(e){const t={name:e.getAttribute("id")||"default",start:parseFloat(e.getAttribute("start")||0),end:parseFloat(e.getAttribute("end")||0),animations:[]};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"instance_animation":t.animations.push(Dt(r.getAttribute("url")));break}}this.library.clips[e.getAttribute("id")]=t}parseController(e){const t={};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"skin":t.id=Dt(r.getAttribute("source")),t.skin=this.parseSkin(r);break;case"morph":t.id=Dt(r.getAttribute("source")),console.warn("THREE.ColladaLoader: Morph target animation not supported yet.");break}}this.library.controllers[e.getAttribute("id")]=t}parseSkin(e){const t={sources:{}};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"bind_shape_matrix":t.bindShapeMatrix=Kt(r.textContent);break;case"source":const a=r.getAttribute("id");t.sources[a]=this.parseSource(r);break;case"joints":t.joints=this.parseJoints(r);break;case"vertex_weights":t.vertexWeights=this.parseVertexWeights(r);break}}return t}parseJoints(e){const t={inputs:{}};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"input":const a=r.getAttribute("semantic"),o=Dt(r.getAttribute("source"));t.inputs[a]=o;break}}return t}parseVertexWeights(e){const t={inputs:{}};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"input":const a=r.getAttribute("semantic"),o=Dt(r.getAttribute("source")),c=parseInt(r.getAttribute("offset"));t.inputs[a]={id:o,offset:c};break;case"vcount":t.vcount=Fa(r.textContent);break;case"v":t.v=Fa(r.textContent);break}}return t}parseImage(e){const t={init_from:an(e,"init_from")[0].textContent};this.library.images[e.getAttribute("id")]=t}parseEffect(e){const t={};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"profile_COMMON":t.profile=this.parseEffectProfileCOMMON(r);break}}this.library.effects[e.getAttribute("id")]=t}parseEffectProfileCOMMON(e){const t={surfaces:{},samplers:{}};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"newparam":this.parseEffectNewparam(r,t);break;case"technique":t.technique=this.parseEffectTechnique(r);break;case"extra":t.extra=this.parseEffectExtra(r);break}}return t}parseEffectNewparam(e,t){const n=e.getAttribute("sid");for(let s=0,r=e.childNodes.length;s<r;s++){const a=e.childNodes[s];if(a.nodeType===1)switch(a.nodeName){case"surface":t.surfaces[n]=this.parseEffectSurface(a);break;case"sampler2D":t.samplers[n]=this.parseEffectSampler(a);break}}}parseEffectSurface(e){const t={};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"init_from":t.init_from=r.textContent;break}}return t}parseEffectSampler(e){const t={};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"source":t.source=r.textContent;break}}return t}parseEffectTechnique(e){const t={};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"constant":case"lambert":case"blinn":case"phong":t.type=r.nodeName,t.parameters=this.parseEffectParameters(r);break;case"extra":t.extra=this.parseEffectExtra(r);break}}return t}parseEffectParameters(e){const t={};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"emission":case"diffuse":case"specular":case"bump":case"ambient":case"shininess":case"transparency":t[r.nodeName]=this.parseEffectParameter(r);break;case"transparent":t[r.nodeName]={opaque:r.hasAttribute("opaque")?r.getAttribute("opaque"):"A_ONE",data:this.parseEffectParameter(r)};break}}return t}parseEffectParameter(e){const t={};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"color":t[r.nodeName]=Kt(r.textContent);break;case"float":t[r.nodeName]=parseFloat(r.textContent);break;case"texture":t[r.nodeName]={id:r.getAttribute("texture"),extra:this.parseEffectParameterTexture(r)};break}}return t}parseEffectParameterTexture(e){const t={technique:{}};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"extra":this.parseEffectParameterTextureExtra(r,t);break}}return t}parseEffectParameterTextureExtra(e,t){for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"technique":this.parseEffectParameterTextureExtraTechnique(r,t);break}}}parseEffectParameterTextureExtraTechnique(e,t){for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"repeatU":case"repeatV":case"offsetU":case"offsetV":t.technique[r.nodeName]=parseFloat(r.textContent);break;case"wrapU":case"wrapV":r.textContent.toUpperCase()==="TRUE"?t.technique[r.nodeName]=1:r.textContent.toUpperCase()==="FALSE"?t.technique[r.nodeName]=0:t.technique[r.nodeName]=parseInt(r.textContent);break;case"bump":t[r.nodeName]=this.parseEffectExtraTechniqueBump(r);break}}}parseEffectExtra(e){const t={};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"technique":t.technique=this.parseEffectExtraTechnique(r);break}}return t}parseEffectExtraTechnique(e){const t={};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"double_sided":t[r.nodeName]=parseInt(r.textContent);break;case"bump":t[r.nodeName]=this.parseEffectExtraTechniqueBump(r);break}}return t}parseEffectExtraTechniqueBump(e){const t={};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"texture":t[r.nodeName]={id:r.getAttribute("texture"),texcoord:r.getAttribute("texcoord"),extra:this.parseEffectParameterTexture(r)};break}}return t}parseMaterial(e){const t={name:e.getAttribute("name")};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"instance_effect":t.url=Dt(r.getAttribute("url"));break}}this.library.materials[e.getAttribute("id")]=t}parseCamera(e){const t={name:e.getAttribute("name")};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"optics":t.optics=this.parseCameraOptics(r);break}}this.library.cameras[e.getAttribute("id")]=t}parseCameraOptics(e){for(let t=0;t<e.childNodes.length;t++){const n=e.childNodes[t];switch(n.nodeName){case"technique_common":return this.parseCameraTechnique(n)}}return{}}parseCameraTechnique(e){const t={};for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];switch(s.nodeName){case"perspective":case"orthographic":t.technique=s.nodeName,t.parameters=this.parseCameraParameters(s);break}}return t}parseCameraParameters(e){const t={};for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];switch(s.nodeName){case"xfov":case"yfov":case"xmag":case"ymag":case"znear":case"zfar":case"aspect_ratio":t[s.nodeName]=parseFloat(s.textContent);break}}return t}parseLight(e){let t={};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"technique_common":t=this.parseLightTechnique(r);break}}this.library.lights[e.getAttribute("id")]=t}parseLightTechnique(e){const t={};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"directional":case"point":case"spot":case"ambient":t.technique=r.nodeName,t.parameters=this.parseLightParameters(r);break}}return t}parseLightParameters(e){const t={};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"color":const a=Kt(r.textContent);t.color=new Ue().fromArray(a),qe.colorSpaceToWorking(t.color,dt);break;case"falloff_angle":t.falloffAngle=parseFloat(r.textContent);break;case"quadratic_attenuation":const o=parseFloat(r.textContent);t.distance=o?Math.sqrt(1/o):0;break}}return t}parseGeometry(e){const t={name:e.getAttribute("name"),sources:{},vertices:{},primitives:[]},n=an(e,"mesh")[0];if(n!==void 0){for(let s=0;s<n.childNodes.length;s++){const r=n.childNodes[s];if(r.nodeType!==1)continue;const a=r.getAttribute("id");switch(r.nodeName){case"source":t.sources[a]=this.parseSource(r);break;case"vertices":t.vertices=this.parseGeometryVertices(r);break;case"polygons":case"lines":case"linestrips":case"polylist":case"triangles":t.primitives.push(this.parseGeometryPrimitive(r));break}}this.library.geometries[e.getAttribute("id")]=t}}parseSource(e){const t={array:[],stride:3};for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];if(s.nodeType===1)switch(s.nodeName){case"float_array":t.array=Kt(s.textContent);break;case"Name_array":t.array=Qy(s.textContent);break;case"technique_common":const r=an(s,"accessor")[0];r!==void 0&&(t.stride=parseInt(r.getAttribute("stride")));break}}return t}parseGeometryVertices(e){const t={};for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];s.nodeType===1&&(t[s.getAttribute("semantic")]=Dt(s.getAttribute("source")))}return t}parseGeometryPrimitive(e){const t={type:e.nodeName,material:e.getAttribute("material"),count:parseInt(e.getAttribute("count")),inputs:{},stride:0,hasUV:!1};for(let n=0,s=e.childNodes.length;n<s;n++){const r=e.childNodes[n];if(r.nodeType===1)switch(r.nodeName){case"input":const a=Dt(r.getAttribute("source")),o=r.getAttribute("semantic"),c=parseInt(r.getAttribute("offset")),l=parseInt(r.getAttribute("set")),h=l>0?o+l:o;t.inputs[h]={id:a,offset:c},t.stride=Math.max(t.stride,c+1),o==="TEXCOORD"&&(t.hasUV=!0);break;case"vcount":t.vcount=Fa(r.textContent);break;case"p":t.p=Fa(r.textContent);break}}return t.type==="polygons"&&(t.vcount=[t.p.length/t.stride]),t}parseLibraryJoint(e){this.library.joints[e.getAttribute("id")]=this.parseKinematicsJoint(e)}parseKinematicsModel(e){const t={name:e.getAttribute("name")||"",joints:{},links:[]};for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];if(s.nodeType===1)switch(s.nodeName){case"technique_common":this.parseKinematicsTechniqueCommon(s,t);break}}this.library.kinematicsModels[e.getAttribute("id")]=t}parseKinematicsTechniqueCommon(e,t){for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];if(s.nodeType===1)switch(s.nodeName){case"joint":t.joints[s.getAttribute("sid")]=this.parseKinematicsJoint(s);break;case"instance_joint":t.joints[s.getAttribute("sid")]=this.library.joints[Dt(s.getAttribute("url"))];break;case"link":t.links.push(this.parseKinematicsLink(s));break}}}parseKinematicsJoint(e){let t;for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];if(s.nodeType===1)switch(s.nodeName){case"prismatic":case"revolute":t=this.parseKinematicsJointParameter(s);break}}return t}parseKinematicsJointParameter(e){const t={sid:e.getAttribute("sid"),name:e.getAttribute("name")||"",axis:new N,limits:{min:0,max:0},type:e.nodeName,static:!1,zeroPosition:0,middlePosition:0};for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];if(s.nodeType===1)switch(s.nodeName){case"axis":const r=Kt(s.textContent);t.axis.fromArray(r);break;case"limits":const a=s.getElementsByTagName("max")[0],o=s.getElementsByTagName("min")[0];t.limits.max=parseFloat(a.textContent),t.limits.min=parseFloat(o.textContent);break}}return t.limits.min>=t.limits.max&&(t.static=!0),t.middlePosition=(t.limits.min+t.limits.max)/2,t}parseKinematicsLink(e){const t={sid:e.getAttribute("sid"),name:e.getAttribute("name")||"",attachments:[],transforms:[]};for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];if(s.nodeType===1)switch(s.nodeName){case"attachment_full":t.attachments.push(this.parseKinematicsAttachment(s));break;case"matrix":case"translate":case"rotate":t.transforms.push(this.parseKinematicsTransform(s));break}}return t}parseKinematicsAttachment(e){const t={joint:e.getAttribute("joint").split("/").pop(),transforms:[],links:[]};for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];if(s.nodeType===1)switch(s.nodeName){case"link":t.links.push(this.parseKinematicsLink(s));break;case"matrix":case"translate":case"rotate":t.transforms.push(this.parseKinematicsTransform(s));break}}return t}parseKinematicsTransform(e){const t={type:e.nodeName},n=Kt(e.textContent);switch(t.type){case"matrix":t.obj=new Oe,t.obj.fromArray(n).transpose();break;case"translate":t.obj=new N,t.obj.fromArray(n);break;case"rotate":t.obj=new N,t.obj.fromArray(n),t.angle=Bn.degToRad(n[3]);break}return t}parsePhysicsModel(e){const t={name:e.getAttribute("name")||"",rigidBodies:{}};for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];if(s.nodeType===1)switch(s.nodeName){case"rigid_body":t.rigidBodies[s.getAttribute("name")]={},this.parsePhysicsRigidBody(s,t.rigidBodies[s.getAttribute("name")]);break}}this.library.physicsModels[e.getAttribute("id")]=t}parsePhysicsRigidBody(e,t){for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];if(s.nodeType===1)switch(s.nodeName){case"technique_common":this.parsePhysicsTechniqueCommon(s,t);break}}}parsePhysicsTechniqueCommon(e,t){for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];if(s.nodeType===1)switch(s.nodeName){case"inertia":t.inertia=Kt(s.textContent);break;case"mass":t.mass=Kt(s.textContent)[0];break}}}parseKinematicsScene(e){const t={bindJointAxis:[]};for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];if(s.nodeType===1)switch(s.nodeName){case"bind_joint_axis":t.bindJointAxis.push(this.parseKinematicsBindJointAxis(s));break}}this.library.kinematicsScenes[Dt(e.getAttribute("url"))]=t}parseKinematicsBindJointAxis(e){const t={target:e.getAttribute("target").split("/").pop()};for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];if(s.nodeType===1)switch(s.nodeName){case"axis":const r=s.getElementsByTagName("param")[0];t.axis=r.textContent;const a=t.axis.split("inst_").pop().split("axis")[0];t.jointIndex=a.substring(0,a.length-1);break}}return t}prepareNodes(e){const t=e.getElementsByTagName("node");for(let n=0;n<t.length;n++){const s=t[n];s.hasAttribute("id")===!1&&s.setAttribute("id",this.generateId())}}parseNode(e){const t=new Oe,n=new N,s={name:e.getAttribute("name")||"",type:e.getAttribute("type"),id:e.getAttribute("id"),sid:e.getAttribute("sid"),matrix:new Oe,nodes:[],instanceCameras:[],instanceControllers:[],instanceLights:[],instanceGeometries:[],instanceNodes:[],transforms:{},transformData:{},transformOrder:[]};for(let r=0;r<e.childNodes.length;r++){const a=e.childNodes[r];if(a.nodeType!==1)continue;let o;switch(a.nodeName){case"node":s.nodes.push(a.getAttribute("id")),this.parseNode(a);break;case"instance_camera":s.instanceCameras.push(Dt(a.getAttribute("url")));break;case"instance_controller":s.instanceControllers.push(this.parseNodeInstance(a));break;case"instance_light":s.instanceLights.push(Dt(a.getAttribute("url")));break;case"instance_geometry":s.instanceGeometries.push(this.parseNodeInstance(a));break;case"instance_node":s.instanceNodes.push(Dt(a.getAttribute("url")));break;case"matrix":o=Kt(a.textContent),s.matrix.multiply(t.fromArray(o).transpose());{const c=a.getAttribute("sid");s.transforms[c]=a.nodeName,s.transformData[c]={type:"matrix",array:o},s.transformOrder.push(c)}break;case"translate":o=Kt(a.textContent),n.fromArray(o),s.matrix.multiply(t.makeTranslation(n.x,n.y,n.z));{const c=a.getAttribute("sid");s.transforms[c]=a.nodeName,s.transformData[c]={type:"translate",x:o[0],y:o[1],z:o[2]},s.transformOrder.push(c)}break;case"rotate":o=Kt(a.textContent);{const c=Bn.degToRad(o[3]);s.matrix.multiply(t.makeRotationAxis(n.fromArray(o),c));const l=a.getAttribute("sid");s.transforms[l]=a.nodeName,s.transformData[l]={type:"rotate",axis:[o[0],o[1],o[2]],angle:o[3]},s.transformOrder.push(l)}break;case"scale":o=Kt(a.textContent),s.matrix.scale(n.fromArray(o));{const c=a.getAttribute("sid");s.transforms[c]=a.nodeName,s.transformData[c]={type:"scale",x:o[0],y:o[1],z:o[2]},s.transformOrder.push(c)}break}}return this.hasNode(s.id)?console.warn("THREE.ColladaLoader: There is already a node with ID %s. Exclude current node from further processing.",s.id):this.library.nodes[s.id]=s,s}parseNodeInstance(e){const t={id:Dt(e.getAttribute("url")),materials:{},skeletons:[]};for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];switch(s.nodeName){case"bind_material":const r=s.getElementsByTagName("instance_material");for(let a=0;a<r.length;a++){const o=r[a],c=o.getAttribute("symbol"),l=o.getAttribute("target");t.materials[c]=Dt(l)}break;case"skeleton":t.skeletons.push(Dt(s.textContent));break}}return t}parseVisualScene(e){const t={name:e.getAttribute("name"),children:[]};this.prepareNodes(e);const n=an(e,"node");for(let s=0;s<n.length;s++)t.children.push(this.parseNode(n[s]));this.library.visualScenes[e.getAttribute("id")]=t}hasNode(e){return this.library.nodes[e]!==void 0}}class tb{constructor(e,t,n,s){this.library=e,this.collada=t,this.textureLoader=n,this.tgaLoader=s,this.tempColor=new Ue,this.animations=[],this.kinematics={},this.position=new N,this.scale=new N,this.quaternion=new Ot,this.matrix=new Oe,this.deferredPivotAnimations={},this.transformNodes={}}compose(){const e=this.library;this.buildLibrary(e.animations,this.buildAnimation.bind(this)),this.buildLibrary(e.clips,this.buildAnimationClip.bind(this)),this.buildLibrary(e.controllers,this.buildController.bind(this)),this.buildLibrary(e.images,this.buildImage.bind(this)),this.buildLibrary(e.effects,this.buildEffect.bind(this)),this.buildLibrary(e.materials,this.buildMaterial.bind(this)),this.buildLibrary(e.cameras,this.buildCamera.bind(this)),this.buildLibrary(e.lights,this.buildLight.bind(this)),this.buildLibrary(e.geometries,this.buildGeometry.bind(this)),this.buildLibrary(e.visualScenes,this.buildVisualScene.bind(this)),this.setupAnimations(),this.setupKinematics();const t=this.parseScene(an(this.collada,"scene")[0]);return t.animations=this.animations,{scene:t,animations:this.animations,kinematics:this.kinematics}}buildLibrary(e,t){for(const n in e){const s=e[n];s.build=t(e[n])}}getBuild(e,t){return e.build!==void 0||(e.build=t(e)),e.build}isEmpty(e){return Object.keys(e).length===0}buildAnimation(e){const t=[],n=e.channels,s=e.samplers,r=e.sources,a=this.aggregateAnimationChannels(n,s,r);for(const o in a){const c=this.library.nodes[o];if(!c)continue;const l=a[o];if(this.hasPivotTransforms(c))this.collectDeferredPivotAnimation(o,l);else{const h=this.getNode(o);let u=!1;for(const d in l){const f=c.transforms[d],g=c.transformData[d],v=l[d];switch(f){case"matrix":this.buildMatrixTracks(h,v,c,t);break;case"translate":this.buildTranslateTrack(h,v,g,t);break;case"rotate":u||(this.buildRotateTrack(h,d,v,g,c,t),u=!0);break;case"scale":this.buildScaleTrack(h,v,g,t);break}}}}return t}collectDeferredPivotAnimation(e,t){this.deferredPivotAnimations[e]||(this.deferredPivotAnimations[e]={});const n=this.deferredPivotAnimations[e];for(const s in t){n[s]||(n[s]={});for(const r in t[s])n[s][r]=t[s][r]}}hasPivotTransforms(e){const t=["rotatePivot","rotatePivotInverse","rotatePivotTranslation","scalePivot","scalePivotInverse","scalePivotTranslation"];for(const n of t)if(e.transforms[n]!==void 0)return!0;return!1}getAnimation(e){return this.getBuild(this.library.animations[e],this.buildAnimation.bind(this))}aggregateAnimationChannels(e,t,n){const s={};for(const r in e){if(!e.hasOwnProperty(r))continue;const a=e[r],o=t[a.sampler],c=o.inputs.INPUT,l=o.inputs.OUTPUT,h=n[c],u=n[l],d=o.inputs.INTERPOLATION,f=o.inputs.IN_TANGENT,g=o.inputs.OUT_TANGENT,v=d?n[d]:null,m=f?n[f]:null,p=g?n[g]:null,S=a.id,A=a.sid,y=a.member||"default";s[S]||(s[S]={}),s[S][A]||(s[S][A]={}),s[S][A][y]={times:h.array,values:u.array,stride:u.stride,arraySyntax:a.arraySyntax,indices:a.indices,interpolation:v?v.array:null,inTangent:m?m.array:null,outTangent:p?p.array:null,inTangentStride:m?m.stride:0,outTangentStride:p?p.stride:0}}return s}buildMatrixTracks(e,t,n,s){const r=n.matrix.clone().transpose(),a={};for(const l in t){const h=t[l],u=h.times,d=h.values,f=h.stride;for(let g=0,v=u.length;g<v;g++){const m=u[g],p=g*f;if(a[m]===void 0&&(a[m]={}),h.arraySyntax===!0){const S=d[p],A=h.indices[0]+4*h.indices[1];a[m][A]=S}else for(let S=0;S<f;S++)a[m][S]=d[p+S]}}const o=this.prepareAnimationData(a,r),c={name:e.uuid,keyframes:o};this.createKeyframeTracks(c,s)}buildTranslateTrack(e,t,n,s){if(t.default&&t.default.stride===3){const l=t.default,h=Array.from(l.times),u=Array.from(l.values),d=new hn(e.uuid+".position",h,u),f=this.getInterpolationInfo(t);this.applyInterpolation(d,f,t),s.push(d);return}const r=this.getTimesForAllAxes(t);if(r.length===0)return;const a=[],o=this.getInterpolationInfo(t);for(let l=0;l<r.length;l++){const h=r[l],u=this.getValueAtTime(t.X,h,n.x),d=this.getValueAtTime(t.Y,h,n.y),f=this.getValueAtTime(t.Z,h,n.z);a.push(u,d,f)}const c=new hn(e.uuid+".position",r,a);this.applyInterpolation(c,o),s.push(c)}buildRotateTrack(e,t,n,s,r,a){const o=n.ANGLE||n.default;if(!o)return;const c=Array.from(o.times);if(c.length===0)return;const l=[];for(const m of r.transformOrder)if(r.transforms[m]==="rotate"){const S=r.transformData[m];l.push({sid:m,axis:new N(S.axis[0],S.axis[1],S.axis[2]),defaultAngle:S.angle})}const h=new Ot,u=new Ot,d=new Ot,f=[],g=this.getInterpolationInfo(n);for(let m=0;m<c.length;m++){const p=c[m];h.identity();for(const S of l){let A;S.sid===t?A=this.getValueAtTime(o,p,S.defaultAngle):A=S.defaultAngle;const y=Bn.degToRad(A);d.setFromAxisAngle(S.axis,y),h.multiply(d)}m>0&&u.dot(h)<0&&(h.x=-h.x,h.y=-h.y,h.z=-h.z,h.w=-h.w),u.copy(h),f.push(h.x,h.y,h.z,h.w)}const v=new $s(e.uuid+".quaternion",c,f);this.applyInterpolation(v,g),a.push(v)}buildScaleTrack(e,t,n,s){if(t.default&&t.default.stride===3){const l=t.default,h=Array.from(l.times),u=Array.from(l.values),d=new hn(e.uuid+".scale",h,u),f=this.getInterpolationInfo(t);this.applyInterpolation(d,f,t),s.push(d);return}const r=this.getTimesForAllAxes(t);if(r.length===0)return;const a=[],o=this.getInterpolationInfo(t);for(let l=0;l<r.length;l++){const h=r[l],u=this.getValueAtTime(t.X,h,n.x),d=this.getValueAtTime(t.Y,h,n.y),f=this.getValueAtTime(t.Z,h,n.z);a.push(u,d,f)}const c=new hn(e.uuid+".scale",r,a);this.applyInterpolation(c,o),s.push(c)}getTimesForAllAxes(e){let t=[];return e.X&&(t=t.concat(Array.from(e.X.times))),e.Y&&(t=t.concat(Array.from(e.Y.times))),e.Z&&(t=t.concat(Array.from(e.Z.times))),e.ANGLE&&(t=t.concat(Array.from(e.ANGLE.times))),e.default&&(t=t.concat(Array.from(e.default.times))),t=[...new Set(t)].sort((n,s)=>n-s),t}getValueAtTime(e,t,n){if(!e)return n;const s=e.times,r=e.values,a=e.interpolation;for(let o=0;o<s.length;o++){if(s[o]===t)return r[o];if(s[o]>t){if(o===0)return r[0];const c=o-1,l=o,h=s[c],u=s[l],d=r[c],f=r[l],g=a?a[c]:"LINEAR";if(g==="STEP")return d;if(g==="BEZIER"&&e.inTangent&&e.outTangent)return this.evaluateBezierComponent(e,c,l,h,u,t);{const v=(t-h)/(u-h);return d+v*(f-d)}}}return r[r.length-1]}evaluateBezierComponent(e,t,n,s,r,a){const o=e.values,c=e.inTangent,l=e.outTangent,h=e.inTangentStride||1,u=o[t],d=o[n];let f,g,v,m;h===2?(f=l[t*2],g=l[t*2+1],v=c[n*2],m=c[n*2+1]):(f=s+(r-s)/3,g=l[t],v=r-(r-s)/3,m=c[n]);let p=(a-s)/(r-s);for(let w=0;w<8;w++){const _=p*p,b=_*p,P=1-p,R=P*P,z=R*P*s+3*R*p*f+3*P*_*v+b*r,X=3*R*(f-s)+6*P*p*(v-f)+3*_*(r-v);if(Math.abs(X)<1e-10)break;const O=z-a;if(Math.abs(O)<1e-10)break;p=p-O/X,p=Math.max(0,Math.min(1,p))}const S=p*p,A=S*p,y=1-p,T=y*y;return T*y*u+3*T*p*g+3*y*S*m+A*d}getInterpolationInfo(e){const t=["X","Y","Z","ANGLE","default"];let n=null,s=!0;for(const r of t){const a=e[r];if(!a||!a.interpolation)continue;const o=a.interpolation;for(let c=0;c<o.length;c++){const l=o[c];n===null?n=l:l!==n&&(s=!1)}}return{type:n||"LINEAR",uniform:s}}applyInterpolation(e,t,n=null){if(t.type==="STEP"&&t.uniform)e.setInterpolation(Pr);else if(t.type==="BEZIER"&&t.uniform&&n){const s=n.default;s&&s.inTangent&&s.outTangent&&(e.setInterpolation(yc),e.settings={inTangents:new Float32Array(s.inTangent),outTangents:new Float32Array(s.outTangent)})}}prepareAnimationData(e,t){const n=[];for(const s in e)n.push({time:parseFloat(s),value:e[s]});n.sort((s,r)=>s.time-r.time);for(let s=0;s<16;s++)this.transformAnimationData(n,s,t.elements[s]);return n}createKeyframeTracks(e,t){const n=e.keyframes,s=e.name,r=[],a=[],o=[],c=[],l=this.position,h=this.quaternion,u=this.scale,d=this.matrix;for(let f=0,g=n.length;f<g;f++){const v=n[f],m=v.time,p=v.value;d.fromArray(p).transpose(),d.decompose(l,h,u),r.push(m),a.push(l.x,l.y,l.z),o.push(h.x,h.y,h.z,h.w),c.push(u.x,u.y,u.z)}return a.length>0&&t.push(new hn(s+".position",r,a)),o.length>0&&t.push(new $s(s+".quaternion",r,o)),c.length>0&&t.push(new hn(s+".scale",r,c)),t}transformAnimationData(e,t,n){let s,r=!0,a,o;for(a=0,o=e.length;a<o;a++)s=e[a],s.value[t]===void 0?s.value[t]=null:r=!1;if(r===!0)for(a=0,o=e.length;a<o;a++)s=e[a],s.value[t]=n;else this.createMissingKeyframes(e,t)}createMissingKeyframes(e,t){let n,s;for(let r=0,a=e.length;r<a;r++){const o=e[r];if(o.value[t]===null){if(n=this.getPrev(e,r,t),s=this.getNext(e,r,t),n===null){o.value[t]=s.value[t];continue}if(s===null){o.value[t]=n.value[t];continue}this.interpolate(o,n,s,t)}}}getPrev(e,t,n){for(;t>=0;){const s=e[t];if(s.value[n]!==null)return s;t--}return null}getNext(e,t,n){for(;t<e.length;){const s=e[t];if(s.value[n]!==null)return s;t++}return null}interpolate(e,t,n,s){if(n.time-t.time===0){e.value[s]=t.value[s];return}e.value[s]=(e.time-t.time)*(n.value[s]-t.value[s])/(n.time-t.time)+t.value[s]}buildAnimationClip(e){const t=[],n=e.name,s=e.end-e.start||-1,r=e.animations;for(let a=0,o=r.length;a<o;a++){const c=this.getAnimation(r[a]);for(let l=0,h=c.length;l<h;l++)t.push(c[l])}return new xd(n,s,t)}getAnimationClip(e){return this.getBuild(this.library.clips[e],this.buildAnimationClip.bind(this))}buildController(e){const t={id:e.id},n=this.library.geometries[t.id];return e.skin!==void 0&&(t.skin=this.buildSkin(e.skin),n.sources.skinIndices=t.skin.indices,n.sources.skinWeights=t.skin.weights),t}buildSkin(e){const n={joints:[],indices:{array:[],stride:4},weights:{array:[],stride:4}},s=e.sources,r=e.vertexWeights,a=r.vcount,o=r.v,c=r.inputs.JOINT.offset,l=r.inputs.WEIGHT.offset,h=e.sources[e.joints.inputs.JOINT],u=e.sources[e.joints.inputs.INV_BIND_MATRIX],d=s[r.inputs.WEIGHT.id].array;let f=0,g,v,m;for(g=0,m=a.length;g<m;g++){const S=a[g],A=[];for(v=0;v<S;v++){const y=o[f+c],T=o[f+l],E=d[T];A.push({index:y,weight:E}),f+=2}for(A.sort(p),v=0;v<4;v++){const y=A[v];y!==void 0?(n.indices.array.push(y.index),n.weights.array.push(y.weight)):(n.indices.array.push(0),n.weights.array.push(0))}}for(e.bindShapeMatrix?n.bindMatrix=new Oe().fromArray(e.bindShapeMatrix).transpose():n.bindMatrix=new Oe().identity(),g=0,m=h.array.length;g<m;g++){const S=h.array[g],A=new Oe().fromArray(u.array,g*u.stride).transpose();n.joints.push({name:S,boneInverse:A})}return n;function p(S,A){return A.weight-S.weight}}getController(e){return this.getBuild(this.library.controllers[e],this.buildController.bind(this))}buildImage(e){return e.build!==void 0?e.build:e.init_from}getImage(e){const t=this.library.images[e];return t!==void 0?this.getBuild(t,this.buildImage.bind(this)):(console.warn("THREE.ColladaLoader: Couldn't find image with ID:",e),null)}buildEffect(e){return e}getEffect(e){return this.getBuild(this.library.effects[e],this.buildEffect.bind(this))}getTextureLoader(e){let t,n=e.slice((e.lastIndexOf(".")-1>>>0)+2);switch(n=n.toLowerCase(),n){case"tga":t=this.tgaLoader;break;default:t=this.textureLoader}return t}buildMaterial(e){const t=this.getEffect(e.url),n=t.profile.technique;let s;switch(n.type){case"phong":case"blinn":s=new Mr;break;case"lambert":s=new gg;break;default:s=new cs;break}s.name=e.name||"";const r=this;function a(h,u=null){const d=t.profile.samplers[h.id];let f=null;if(d!==void 0){const g=t.profile.surfaces[d.source];f=r.getImage(g.init_from)}else console.warn("THREE.ColladaLoader: Undefined sampler. Access image directly (see #12530)."),f=r.getImage(h.id);if(f!==null){const g=r.getTextureLoader(f);if(g!==void 0){const v=g.load(f),m=h.extra;if(m!==void 0&&m.technique!==void 0&&r.isEmpty(m.technique)===!1){const p=m.technique;v.wrapS=p.wrapU?ns:ln,v.wrapT=p.wrapV?ns:ln,v.offset.set(p.offsetU||0,p.offsetV||0),v.repeat.set(p.repeatU||1,p.repeatV||1)}else v.wrapS=ns,v.wrapT=ns;return u!==null&&(v.colorSpace=u),v}else return console.warn("THREE.ColladaLoader: Loader for texture %s not found.",f),null}else return console.warn("THREE.ColladaLoader: Couldn't create texture with ID:",h.id),null}const o=n.parameters;for(const h in o){const u=o[h];switch(h){case"diffuse":u.color&&s.color.fromArray(u.color),u.texture&&(s.map=a(u.texture,dt));break;case"specular":u.color&&s.specular&&s.specular.fromArray(u.color),u.texture&&(s.specularMap=a(u.texture));break;case"bump":u.texture&&(s.normalMap=a(u.texture));break;case"ambient":u.texture&&(s.lightMap=a(u.texture,dt));break;case"shininess":u.float&&s.shininess&&(s.shininess=u.float);break;case"emission":u.color&&s.emissive&&s.emissive.fromArray(u.color),u.texture&&(s.emissiveMap=a(u.texture,dt));break}}qe.colorSpaceToWorking(s.color,dt),s.specular&&qe.colorSpaceToWorking(s.specular,dt),s.emissive&&qe.colorSpaceToWorking(s.emissive,dt);let c=o.transparent,l=o.transparency;if(l===void 0&&c&&(l={float:1}),c===void 0&&l&&(c={opaque:"A_ONE",data:{color:[1,1,1,1]}}),c&&l)if(c.data.texture)s.transparent=!0;else{const h=c.data.color;switch(c.opaque){case"A_ONE":s.opacity=h[3]*l.float;break;case"RGB_ZERO":s.opacity=1-h[0]*l.float;break;case"A_ZERO":s.opacity=1-h[3]*l.float;break;case"RGB_ONE":s.opacity=h[0]*l.float;break;default:console.warn('THREE.ColladaLoader: Invalid opaque type "%s" of transparent tag.',c.opaque)}s.opacity<1&&(s.transparent=!0)}if(n.extra!==void 0&&n.extra.technique!==void 0){const h=n.extra.technique;for(const u in h){const d=h[u];switch(u){case"double_sided":s.side=d===1?Sn:mi;break;case"bump":s.normalMap=a(d.texture),s.normalScale=new Se(1,1);break}}}return s}getMaterial(e){return this.getBuild(this.library.materials[e],this.buildMaterial.bind(this))}buildCamera(e){let t;switch(e.optics.technique){case"perspective":t=new Bt(e.optics.parameters.yfov,e.optics.parameters.aspect_ratio,e.optics.parameters.znear,e.optics.parameters.zfar);break;case"orthographic":let n=e.optics.parameters.ymag,s=e.optics.parameters.xmag;const r=e.optics.parameters.aspect_ratio;s=s===void 0?n*r:s,n=n===void 0?s/r:n,s*=.5,n*=.5,t=new Lo(-s,s,n,-n,e.optics.parameters.znear,e.optics.parameters.zfar);break;default:t=new Bt;break}return t.name=e.name||"",t}getCamera(e){const t=this.library.cameras[e];return t!==void 0?this.getBuild(t,this.buildCamera.bind(this)):(console.warn("THREE.ColladaLoader: Couldn't find camera with ID:",e),null)}buildLight(e){let t;switch(e.technique){case"directional":t=new cf;break;case"point":t=new Og;break;case"spot":t=new Ug;break;case"ambient":t=new kg;break}return e.parameters.color&&t.color.copy(e.parameters.color),e.parameters.distance&&(t.distance=e.parameters.distance),e.parameters.falloffAngle&&(t.angle=Bn.degToRad(e.parameters.falloffAngle)),t}getLight(e){const t=this.library.lights[e];return t!==void 0?this.getBuild(t,this.buildLight.bind(this)):(console.warn("THREE.ColladaLoader: Couldn't find light with ID:",e),null)}groupPrimitives(e){const t={};for(let n=0;n<e.length;n++){const s=e[n];t[s.type]===void 0&&(t[s.type]=[]),t[s.type].push(s)}return t}checkUVCoordinates(e){let t=0;for(let n=0,s=e.length;n<s;n++)e[n].hasUV===!0&&t++;t>0&&t<e.length&&(e.uvsNeedsFix=!0)}buildGeometry(e){const t={},n=e.sources,s=e.vertices,r=e.primitives;if(r.length===0)return{};const a=this.groupPrimitives(r);for(const o in a){const c=a[o];this.checkUVCoordinates(c),t[o]=this.buildGeometryType(c,n,s)}return t}buildGeometryType(e,t,n){const s={},r={array:[],stride:0},a={array:[],stride:0},o={array:[],stride:0},c={array:[],stride:0},l={array:[],stride:0},h={array:[],stride:4},u={array:[],stride:4},d=new mt,f=[];let g=0;for(let v=0;v<e.length;v++){const m=e[v],p=m.inputs;let S=0;switch(m.type){case"lines":case"linestrips":S=m.count*2;break;case"triangles":S=m.count*3;break;case"polygons":case"polylist":for(let A=0;A<m.count;A++){const y=m.vcount[A];switch(y){case 3:S+=3;break;case 4:S+=6;break;default:S+=(y-2)*3;break}}break;default:console.warn("THREE.ColladaLoader: Unknown primitive type:",m.type)}d.addGroup(g,S,v),g+=S,m.material&&f.push(m.material);for(const A in p){const y=p[A];switch(A){case"VERTEX":for(const T in n){const E=n[T];switch(T){case"POSITION":const w=r.array.length;if(this.buildGeometryData(m,t[E],y.offset,r.array),r.stride=t[E].stride,t.skinWeights&&t.skinIndices&&(this.buildGeometryData(m,t.skinIndices,y.offset,h.array),this.buildGeometryData(m,t.skinWeights,y.offset,u.array)),m.hasUV===!1&&e.uvsNeedsFix===!0){const _=(r.array.length-w)/r.stride;for(let b=0;b<_;b++)o.array.push(0,0)}break;case"NORMAL":this.buildGeometryData(m,t[E],y.offset,a.array),a.stride=t[E].stride;break;case"COLOR":this.buildGeometryData(m,t[E],y.offset,l.array),l.stride=t[E].stride;break;case"TEXCOORD":this.buildGeometryData(m,t[E],y.offset,o.array),o.stride=t[E].stride;break;case"TEXCOORD1":this.buildGeometryData(m,t[E],y.offset,c.array),o.stride=t[E].stride;break;default:console.warn('THREE.ColladaLoader: Semantic "%s" not handled in geometry build process.',T)}}break;case"NORMAL":this.buildGeometryData(m,t[y.id],y.offset,a.array),a.stride=t[y.id].stride;break;case"COLOR":this.buildGeometryData(m,t[y.id],y.offset,l.array,!0),l.stride=t[y.id].stride;break;case"TEXCOORD":this.buildGeometryData(m,t[y.id],y.offset,o.array),o.stride=t[y.id].stride;break;case"TEXCOORD1":this.buildGeometryData(m,t[y.id],y.offset,c.array),c.stride=t[y.id].stride;break}}}return r.array.length>0&&d.setAttribute("position",new Ye(r.array,r.stride)),a.array.length>0&&d.setAttribute("normal",new Ye(a.array,a.stride)),l.array.length>0&&d.setAttribute("color",new Ye(l.array,l.stride)),o.array.length>0&&d.setAttribute("uv",new Ye(o.array,o.stride)),c.array.length>0&&d.setAttribute("uv1",new Ye(c.array,c.stride)),h.array.length>0&&d.setAttribute("skinIndex",new Ye(h.array,h.stride)),u.array.length>0&&d.setAttribute("skinWeight",new Ye(u.array,u.stride)),s.data=d,s.type=e[0].type,s.materialKeys=f,s}buildGeometryData(e,t,n,s,r=!1){const a=e.p,o=e.stride,c=e.vcount,l=this.tempColor;function h(f){let g=a[f+n]*d;const v=g+d;for(;g<v;g++)s.push(u[g]);if(r){const m=s.length-d-1;l.setRGB(s[m+0],s[m+1],s[m+2],dt),s[m+0]=l.r,s[m+1]=l.g,s[m+2]=l.b}}const u=t.array,d=t.stride;if(e.vcount!==void 0){let f=0;for(let g=0,v=c.length;g<v;g++){const m=c[g];if(m===4){const p=f+o*0,S=f+o*1,A=f+o*2,y=f+o*3;h(p),h(S),h(y),h(S),h(A),h(y)}else if(m===3){const p=f+o*0,S=f+o*1,A=f+o*2;h(p),h(S),h(A)}else if(m>4){const p=[];for(let w=0;w<m;w++){const _=f+o*w,b=a[_]*d,P=u[b],R=u[b+1],L=u[b+2];p.push(new N(P,R,L))}const S=new N,A=new Qt;A.a=p[0],A.b=p[1],A.c=p[2],A.getNormal(S);const y=[];if(Math.abs(S.x)>Math.abs(S.y)&&Math.abs(S.x)>Math.abs(S.z))for(let w=0;w<m;w++)y.push(new Se(p[w].y,p[w].z));else if(Math.abs(S.y)>Math.abs(S.z))for(let w=0;w<m;w++)y.push(new Se(p[w].x,p[w].z));else for(let w=0;w<m;w++)y.push(new Se(p[w].x,p[w].y));const T=co.isClockWise(y);T===!0&&y.reverse();const E=co.triangulateShape(y,[]);for(let w=0;w<E.length;w++){const _=E[w];let b,P,R;T===!1?(b=_[0],P=_[1],R=_[2]):(b=m-1-_[0],P=m-1-_[2],R=m-1-_[1]);const L=f+o*b,z=f+o*P,X=f+o*R;h(L),h(z),h(X)}}f+=o*m}}else for(let f=0,g=a.length;f<g;f+=o)h(f)}getGeometry(e){return this.getBuild(this.library.geometries[e],this.buildGeometry.bind(this))}buildKinematicsModel(e){return e.build!==void 0?e.build:e}getKinematicsModel(e){return this.getBuild(this.library.kinematicsModels[e],this.buildKinematicsModel.bind(this))}buildKinematicsScene(e){return e.build!==void 0?e.build:e}getKinematicsScene(e){return this.getBuild(this.library.kinematicsScenes[e],this.buildKinematicsScene.bind(this))}setupKinematics(){const e=Object.keys(this.library.kinematicsModels)[0],t=Object.keys(this.library.kinematicsScenes)[0],n=Object.keys(this.library.visualScenes)[0];if(e===void 0||t===void 0)return;const s=this.getKinematicsModel(e),r=this.getKinematicsScene(t),a=this.getVisualScene(n),o=r.bindJointAxis,c={},l=this.collada,h=this;for(let g=0,v=o.length;g<v;g++){const m=o[g],p=l.querySelector('[sid="'+m.target+'"]');if(p){const S=p.parentElement;u(m.jointIndex,S)}}function u(g,v){const m=v.getAttribute("name"),p=s.joints[g],S=h.buildTransformList(v);a.traverse(function(A){A.name===m&&(c[g]={object:A,transforms:S,joint:p,position:p.zeroPosition})})}const d=new Oe,f=this.matrix;this.kinematics={joints:s&&s.joints,getJointValue:function(g){const v=c[g];if(v)return v.position;console.warn("THREE.ColladaLoader: Joint "+g+" doesn't exist.")},setJointValue:function(g,v){const m=c[g];if(m){const p=m.joint;if(v>p.limits.max||v<p.limits.min)console.warn("THREE.ColladaLoader: Joint "+g+" value "+v+" outside of limits (min: "+p.limits.min+", max: "+p.limits.max+").");else if(p.static)console.warn("THREE.ColladaLoader: Joint "+g+" is static.");else{const S=m.object,A=p.axis,y=m.transforms;f.identity();for(let T=0;T<y.length;T++){const E=y[T];if(E.sid&&E.sid.indexOf(g)!==-1)switch(p.type){case"revolute":f.multiply(d.makeRotationAxis(A,Bn.degToRad(v)));break;case"prismatic":f.multiply(d.makeTranslation(A.x*v,A.y*v,A.z*v));break;default:console.warn("THREE.ColladaLoader: Unknown joint type: "+p.type);break}else switch(E.type){case"matrix":f.multiply(E.obj);break;case"translate":f.multiply(d.makeTranslation(E.obj.x,E.obj.y,E.obj.z));break;case"scale":f.scale(E.obj);break;case"rotate":f.multiply(d.makeRotationAxis(E.obj,E.angle));break}}S.matrix.copy(f),S.matrix.decompose(S.position,S.quaternion,S.scale),c[g].position=v}}else console.warn("THREE.ColladaLoader: Joint "+g+" does not exist.")}}}buildTransformList(e){const t=[],n=this.collada.querySelector('[id="'+e.id+'"]');for(let s=0;s<n.childNodes.length;s++){const r=n.childNodes[s];if(r.nodeType!==1)continue;let a,o;switch(r.nodeName){case"matrix":a=Kt(r.textContent);const c=new Oe().fromArray(a).transpose();t.push({sid:r.getAttribute("sid"),type:r.nodeName,obj:c});break;case"translate":case"scale":a=Kt(r.textContent),o=new N().fromArray(a),t.push({sid:r.getAttribute("sid"),type:r.nodeName,obj:o});break;case"rotate":a=Kt(r.textContent),o=new N().fromArray(a);const l=Bn.degToRad(a[3]);t.push({sid:r.getAttribute("sid"),type:r.nodeName,obj:o,angle:l});break}}return t}buildSkeleton(e,t){const n=[],s=[];let r,a,o;for(r=0;r<e.length;r++){const h=e[r];let u;if(this.hasNode(h))u=this.getNode(h),this.buildBoneHierarchy(u,t,n);else if(this.hasVisualScene(h)){const f=this.library.visualScenes[h].children;for(let g=0;g<f.length;g++){const v=f[g];if(v.type==="JOINT"){const m=this.getNode(v.id);this.buildBoneHierarchy(m,t,n)}}}else console.error("THREE.ColladaLoader: Unable to find root bone of skeleton with ID:",h)}for(r=0;r<t.length;r++)for(a=0;a<n.length;a++)if(o=n[a],o.bone.name===t[r].name){s[r]=o,o.processed=!0;break}for(r=0;r<n.length;r++)o=n[r],o.processed===!1&&(s.push(o),o.processed=!0);const c=[],l=[];for(r=0;r<s.length;r++)o=s[r],c.push(o.bone),l.push(o.boneInverse);return new zc(c,l)}buildBoneHierarchy(e,t,n){e.traverse(function(s){if(s.isBone===!0){let r;for(let a=0;a<t.length;a++){const o=t[a];if(o.name===s.name){r=o.boneInverse;break}}r===void 0&&(r=new Oe),n.push({bone:s,boneInverse:r,processed:!1})}})}buildNode(e){const t=[],n=e.matrix,s=e.nodes,r=e.type,a=e.instanceCameras,o=e.instanceControllers,c=e.instanceLights,l=e.instanceGeometries,h=e.instanceNodes;for(let d=0,f=s.length;d<f;d++)t.push(this.getNode(s[d]));for(let d=0,f=a.length;d<f;d++){const g=this.getCamera(a[d]);g!==null&&t.push(g.clone())}for(let d=0,f=o.length;d<f;d++){const g=o[d],v=this.getController(g.id),m=this.getGeometry(v.id),p=this.buildObjects(m,g.materials),S=g.skeletons,A=v.skin.joints,y=this.buildSkeleton(S,A);for(let T=0,E=p.length;T<E;T++){const w=p[T];w.isSkinnedMesh&&(w.bind(y,v.skin.bindMatrix),w.normalizeSkinWeights()),t.push(w)}}for(let d=0,f=c.length;d<f;d++){const g=this.getLight(c[d]);g!==null&&t.push(g.clone())}for(let d=0,f=l.length;d<f;d++){const g=l[d],v=this.getGeometry(g.id),m=this.buildObjects(v,g.materials);for(let p=0,S=m.length;p<S;p++)t.push(m[p])}for(let d=0,f=h.length;d<f;d++)t.push(this.getNode(h[d]).clone());let u;if(s.length===0&&t.length===1)u=t[0];else{u=r==="JOINT"?new Kh:new wn;for(let d=0;d<t.length;d++)u.add(t[d])}return u.name=r==="JOINT"?e.sid:e.name,r!=="JOINT"&&this.hasPivotTransforms(e)?this.wrapWithTransformHierarchy(u,e):(u.matrix.copy(n),u.matrix.decompose(u.position,u.quaternion,u.scale),u)}wrapWithTransformHierarchy(e,t){const n=t.id;this.transformNodes[n]={};const s=t.transformOrder,r=t.transformData,a=new wn;a.name=t.name;let o=a;for(let c=0;c<s.length;c++){const l=s[c],h=r[l],u=new wn;switch(u.name=t.name+"_"+l,h.type){case"translate":u.position.set(h.x,h.y,h.z);break;case"rotate":{const d=new N(h.axis[0],h.axis[1],h.axis[2]),f=Bn.degToRad(h.angle);u.quaternion.setFromAxisAngle(d,f),u.userData.rotationAxis=d;break}case"scale":u.scale.set(h.x,h.y,h.z);break;case"matrix":{new Oe().fromArray(h.array).transpose().decompose(u.position,u.quaternion,u.scale);break}}this.transformNodes[n][l]=u,o.add(u),o=u}return o.add(e),a}resolveMaterialBinding(e,t){const n=[];for(let s=0,r=e.length;s<r;s++){const a=t[e[s]];a===void 0?(console.warn("THREE.ColladaLoader: Material with key %s not found. Apply fallback material.",e[s]),n.push(this.fallbackMaterial)):n.push(this.getMaterial(a))}return n}get fallbackMaterial(){return this._fallbackMaterial===void 0&&(this._fallbackMaterial=new cs({name:Xi.DEFAULT_MATERIAL_NAME,color:16711935})),this._fallbackMaterial}buildObjects(e,t){const n=[];for(const s in e){const r=e[s],a=this.resolveMaterialBinding(r.materialKeys,t);if(a.length===0&&(s==="lines"||s==="linestrips"?a.push(new hi):a.push(new Mr)),s==="lines"||s==="linestrips")for(let h=0,u=a.length;h<u;h++){const d=a[h];if(d.isMeshPhongMaterial===!0||d.isMeshLambertMaterial===!0){const f=new hi;f.color.copy(d.color),f.opacity=d.opacity,f.transparent=d.transparent,a[h]=f}}const o=r.data.attributes.skinIndex!==void 0,c=a.length===1?a[0]:a;let l;switch(s){case"lines":l=new Co(r.data,c);break;case"linestrips":l=new Dr(r.data,c);break;case"triangles":case"polygons":case"polylist":o?l=new Fm(r.data,c):l=new ft(r.data,c);break}n.push(l)}return n}hasNode(e){return this.library.nodes[e]!==void 0}getNode(e){return this.getBuild(this.library.nodes[e],this.buildNode.bind(this))}buildVisualScene(e){const t=new wn;t.name=e.name;const n=e.children;for(let s=0;s<n.length;s++){const r=n[s];t.add(this.getNode(r.id))}return t}hasVisualScene(e){return this.library.visualScenes[e]!==void 0}getVisualScene(e){return this.getBuild(this.library.visualScenes[e],this.buildVisualScene.bind(this))}parseScene(e){const t=an(e,"instance_visual_scene")[0];return this.getVisualScene(this.parseId(t.getAttribute("url")))}parseId(e){return e.substring(1)}setupAnimations(){const e=this.library.clips;if(this.isEmpty(e)===!0){if(this.isEmpty(this.library.animations)===!1){const t=[];for(const n in this.library.animations){const s=this.getAnimation(n);for(let r=0,a=s.length;r<a;r++)t.push(s[r])}this.buildDeferredPivotAnimationTracks(t),this.animations.push(new xd("default",-1,t))}}else for(const t in e)this.animations.push(this.getAnimationClip(t))}buildDeferredPivotAnimationTracks(e){for(const t in this.deferredPivotAnimations){const n=this.library.nodes[t];if(!n)continue;const s=this.deferredPivotAnimations[t];this.buildTransformHierarchyTracks(t,s,n,e)}}buildTransformHierarchyTracks(e,t,n,s){const r=this.transformNodes[e];if(!r){console.warn("THREE.ColladaLoader: Transform hierarchy not found for node:",e);return}for(const a in t){const o=r[a];if(!o)continue;const c=n.transforms[a],l=n.transformData[a],h=t[a];switch(c){case"translate":this.buildHierarchyTranslateTrack(o,h,l,s);break;case"rotate":this.buildHierarchyRotateTrack(o,h,l,s);break;case"scale":this.buildHierarchyScaleTrack(o,h,l,s);break}}}buildHierarchyTranslateTrack(e,t,n,s){if(t.default&&t.default.stride===3){const l=t.default,h=new hn(e.uuid+".position",Array.from(l.times),Array.from(l.values)),u=this.getInterpolationInfo(t);this.applyInterpolation(h,u,t),s.push(h);return}const r=this.getTimesForAllAxes(t);if(r.length===0)return;const a=[],o=this.getInterpolationInfo(t);for(let l=0;l<r.length;l++){const h=r[l],u=this.getValueAtTime(t.X,h,n.x),d=this.getValueAtTime(t.Y,h,n.y),f=this.getValueAtTime(t.Z,h,n.z);a.push(u,d,f)}const c=new hn(e.uuid+".position",r,a);this.applyInterpolation(c,o),s.push(c)}buildHierarchyRotateTrack(e,t,n,s){const r=t.ANGLE||t.default;if(!r)return;const a=Array.from(r.times);if(a.length===0)return;const o=e.userData.rotationAxis||new N(n.axis[0],n.axis[1],n.axis[2]),c=new Ot,l=new Ot,h=[],u=this.getInterpolationInfo(t);for(let f=0;f<a.length;f++){const g=a[f],v=this.getValueAtTime(r,g,n.angle),m=Bn.degToRad(v);c.setFromAxisAngle(o,m),f>0&&l.dot(c)<0&&(c.x=-c.x,c.y=-c.y,c.z=-c.z,c.w=-c.w),l.copy(c),h.push(c.x,c.y,c.z,c.w)}const d=new $s(e.uuid+".quaternion",a,h);this.applyInterpolation(d,u),s.push(d)}buildHierarchyScaleTrack(e,t,n,s){if(t.default&&t.default.stride===3){const l=t.default,h=new hn(e.uuid+".scale",Array.from(l.times),Array.from(l.values)),u=this.getInterpolationInfo(t);this.applyInterpolation(h,u,t),s.push(h);return}const r=this.getTimesForAllAxes(t);if(r.length===0)return;const a=[],o=this.getInterpolationInfo(t);for(let l=0;l<r.length;l++){const h=r[l],u=this.getValueAtTime(t.X,h,n.x),d=this.getValueAtTime(t.Y,h,n.y),f=this.getValueAtTime(t.Z,h,n.z);a.push(u,d,f)}const c=new hn(e.uuid+".scale",r,a);this.applyInterpolation(c,o),s.push(c)}}class nb extends Xi{load(e,t,n,s){const r=this,a=r.path===""?uf.extractUrlBase(e):r.path,o=new qc(r.manager);o.setPath(r.path),o.setRequestHeader(r.requestHeader),o.setWithCredentials(r.withCredentials),o.load(e,function(c){try{t(r.parse(c,a))}catch(l){s?s(l):console.error(l),r.manager.itemError(e)}},n,s)}parse(e,t){if(e.length===0)return{scene:new kc};const s=new eb().parse(e);if(s===null)return null;const{library:r,asset:a,collada:o}=s,c=new of(this.manager);c.setPath(this.resourcePath||t).setCrossOrigin(this.crossOrigin);let l;Qd&&(l=new Qd(this.manager),l.setPath(this.resourcePath||t));const h=new tb(r,o,c,l),{scene:u,animations:d,kinematics:f}=h.compose();return u.animations=d,a.upAxis==="Z_UP"&&(console.warn("THREE.ColladaLoader: You are loading an asset with a Z-UP coordinate system. The loader just rotates the asset to transform it into Y-UP. The vertex data are not converted, see #24289."),u.rotation.set(-Math.PI/2,0,0)),u.scale.multiplyScalar(a.unit),{get animations(){return console.warn("THREE.ColladaLoader: Please access animations over scene.animations now."),d},kinematics:f,library:r,scene:u}}}const eh=new N,ib=new _n,Oa=new Oe,Ci=new Oe,Ba=new Ot,ka=new N(1,1,1),za=new N;class Do extends pt{constructor(...e){super(...e),this.urdfNode=null,this.urdfName=""}copy(e,t){return super.copy(e,t),this.urdfNode=e.urdfNode,this.urdfName=e.urdfName,this}}class sb extends Do{constructor(...e){super(...e),this.isURDFCollider=!0,this.type="URDFCollider"}}class rb extends Do{constructor(...e){super(...e),this.isURDFVisual=!0,this.type="URDFVisual"}}class Sf extends Do{constructor(...e){super(...e),this.isURDFLink=!0,this.type="URDFLink",this.name="",this.inertial={mass:0,origin:{xyz:[0,0,0],rpy:[0,0,0]},inertia:{ixx:0,ixy:0,ixz:0,iyy:0,iyz:0,izz:0}}}copy(e,t){return super.copy(e,t),this.inertial={mass:e.inertial.mass,origin:{xyz:[...e.inertial.origin.xyz],rpy:[...e.inertial.origin.rpy]},inertia:{...e.inertial.inertia}},this}}class Ef extends Do{get jointType(){return this._jointType}set jointType(e){if(this.jointType!==e)switch(this._jointType=e,this.matrixWorldNeedsUpdate=!0,e){case"fixed":this.jointValue=[];break;case"continuous":case"revolute":case"prismatic":this.jointValue=new Array(1).fill(0);break;case"planar":this.jointValue=new Array(3).fill(0),this.axis=new N(0,0,1);break;case"floating":this.jointValue=new Array(6).fill(0);break}}get angle(){return this.jointValue[0]}constructor(...e){super(...e),this.isURDFJoint=!0,this.type="URDFJoint",this.name="",this.jointValue=null,this.jointType="fixed",this.axis=new N(1,0,0),this.limit={lower:0,upper:0,effort:0,velocity:0},this.ignoreLimits=!1,this.origPosition=null,this.origQuaternion=null,this.mimicJoints=[]}copy(e,t){return super.copy(e,t),this.jointType=e.jointType,this.axis=e.axis.clone(),this.limit.lower=e.limit.lower,this.limit.upper=e.limit.upper,this.limit.effort=e.limit.effort,this.limit.velocity=e.limit.velocity,this.ignoreLimits=!1,this.jointValue=[...e.jointValue],this.origPosition=e.origPosition?e.origPosition.clone():null,this.origQuaternion=e.origQuaternion?e.origQuaternion.clone():null,this.mimicJoints=[...e.mimicJoints],this}setJointValue(...e){e=e.map(n=>n===null?null:parseFloat(n)),(!this.origPosition||!this.origQuaternion)&&(this.origPosition=this.position.clone(),this.origQuaternion=this.quaternion.clone());let t=!1;switch(this.mimicJoints.forEach(n=>{t=n.updateFromMimickedJoint(...e)||t}),this.jointType){case"fixed":return t;case"continuous":case"revolute":{let n=e[0];return n==null||n===this.jointValue[0]?t:(!this.ignoreLimits&&this.jointType==="revolute"&&(n=Math.min(this.limit.upper,n),n=Math.max(this.limit.lower,n)),this.quaternion.setFromAxisAngle(this.axis,n).premultiply(this.origQuaternion),this.jointValue[0]!==n?(this.jointValue[0]=n,this.matrixWorldNeedsUpdate=!0,!0):t)}case"prismatic":{let n=e[0];return n==null||n===this.jointValue[0]?t:(this.ignoreLimits||(n=Math.min(this.limit.upper,n),n=Math.max(this.limit.lower,n)),this.position.copy(this.origPosition),eh.copy(this.axis).applyEuler(this.rotation),this.position.addScaledVector(eh,n),this.jointValue[0]!==n?(this.jointValue[0]=n,this.matrixWorldNeedsUpdate=!0,!0):t)}case"floating":return this.jointValue.every((n,s)=>e[s]===n||e[s]===null)?t:(this.jointValue[0]=e[0]!==null?e[0]:this.jointValue[0],this.jointValue[1]=e[1]!==null?e[1]:this.jointValue[1],this.jointValue[2]=e[2]!==null?e[2]:this.jointValue[2],this.jointValue[3]=e[3]!==null?e[3]:this.jointValue[3],this.jointValue[4]=e[4]!==null?e[4]:this.jointValue[4],this.jointValue[5]=e[5]!==null?e[5]:this.jointValue[5],Ci.compose(this.origPosition,this.origQuaternion,ka),Ba.setFromEuler(ib.set(this.jointValue[3],this.jointValue[4],this.jointValue[5],"XYZ")),za.set(this.jointValue[0],this.jointValue[1],this.jointValue[2]),Oa.compose(za,Ba,ka),Ci.premultiply(Oa),this.position.setFromMatrixPosition(Ci),this.rotation.setFromRotationMatrix(Ci),this.matrixWorldNeedsUpdate=!0,!0);case"planar":return this.jointValue.every((n,s)=>e[s]===n||e[s]===null)?t:(this.jointValue[0]=e[0]!==null?e[0]:this.jointValue[0],this.jointValue[1]=e[1]!==null?e[1]:this.jointValue[1],this.jointValue[2]=e[2]!==null?e[2]:this.jointValue[2],Ci.compose(this.origPosition,this.origQuaternion,ka),Ba.setFromAxisAngle(this.axis,this.jointValue[2]),za.set(this.jointValue[0],this.jointValue[1],0),Oa.compose(za,Ba,ka),Ci.premultiply(Oa),this.position.setFromMatrixPosition(Ci),this.rotation.setFromRotationMatrix(Ci),this.matrixWorldNeedsUpdate=!0,!0)}return t}}class th extends Ef{constructor(...e){super(...e),this.type="URDFMimicJoint",this.mimicJoint=null,this.offset=0,this.multiplier=1}updateFromMimickedJoint(...e){const t=e.map(n=>n===null?null:n*this.multiplier+this.offset);return super.setJointValue(...t)}copy(e,t){return super.copy(e,t),this.mimicJoint=e.mimicJoint,this.offset=e.offset,this.multiplier=e.multiplier,this}}class ab extends Sf{constructor(...e){super(...e),this.isURDFRobot=!0,this.urdfNode=null,this.urdfRobotNode=null,this.robotName=null,this.links=null,this.joints=null,this.colliders=null,this.visual=null,this.frames=null}copy(e,t){super.copy(e,t),this.urdfRobotNode=e.urdfRobotNode,this.robotName=e.robotName,this.links={},this.joints={},this.colliders={},this.visual={},this.traverse(n=>{n.isURDFJoint&&n.urdfName in e.joints&&(this.joints[n.urdfName]=n),n.isURDFLink&&n.urdfName in e.links&&(this.links[n.urdfName]=n),n.isURDFCollider&&n.urdfName in e.colliders&&(this.colliders[n.urdfName]=n),n.isURDFVisual&&n.urdfName in e.visual&&(this.visual[n.urdfName]=n)});for(const n in this.joints)this.joints[n].mimicJoints=this.joints[n].mimicJoints.map(s=>this.joints[s.name]);return this.frames={...this.colliders,...this.visual,...this.links,...this.joints},this}getFrame(e){return this.frames[e]}setJointValue(e,...t){const n=this.joints[e];return n?n.setJointValue(...t):!1}setJointValues(e){let t=!1;for(const n in e){const s=e[n];Array.isArray(s)?t=this.setJointValue(n,...s)||t:t=this.setJointValue(n,s)||t}return t}}const wl=new Ot,nh=new _n;function Pi(i){return i?i.trim().split(/\s+/g).map(e=>parseFloat(e)):[0,0,0]}function ih(i,e,t=!1){t||i.rotation.set(0,0,0),nh.set(e[0],e[1],e[2],"ZYX"),wl.setFromEuler(nh),wl.multiply(i.quaternion),i.quaternion.copy(wl)}class ob{constructor(e){this.manager=e||af,this.loadMeshCb=this.defaultMeshLoader.bind(this),this.parseVisual=!0,this.parseCollision=!1,this.packages="",this.workingPath="",this.fetchOptions={}}loadAsync(e){return new Promise((t,n)=>{this.load(e,t,null,n)})}load(e,t,n,s){const r=this.manager,a=uf.extractUrlBase(e),o=this.manager.resolveURL(e);r.itemStart(o),fetch(o,this.fetchOptions).then(c=>{if(c.ok)return n&&n(null),c.text();throw new Error(`URDFLoader: Failed to load url '${o}' with error code ${c.status} : ${c.statusText}.`)}).then(c=>{const l=this.parse(c,this.workingPath||a);t(l),r.itemEnd(o)}).catch(c=>{s?s(c):console.error("URDFLoader: Error loading file.",c),r.itemError(o),r.itemEnd(o)})}parse(e,t=this.workingPath){const n=this.packages,s=this.loadMeshCb,r=this.parseVisual,a=this.parseCollision,o=this.manager,c={},l={},h={};function u(S){if(!/^package:\/\//.test(S))return t?t+S:S;const[A,y]=S.replace(/^package:\/\//,"").split(/\/(.+)/);if(typeof n=="string")return n.endsWith(A)?n+"/"+y:n+"/"+A+"/"+y;if(typeof n=="function")return n(A)+"/"+y;if(typeof n=="object")return A in n?n[A]+"/"+y:(console.error(`URDFLoader : ${A} not found in provided package list.`),null)}function d(S){let A;S instanceof Document?A=[...S.children]:S instanceof Element?A=[S]:A=[...new DOMParser().parseFromString(S,"text/xml").children];const y=A.filter(T=>T.nodeName==="robot").pop();return f(y)}function f(S){const A=[...S.children],y=A.filter(R=>R.nodeName.toLowerCase()==="link"),T=A.filter(R=>R.nodeName.toLowerCase()==="joint"),E=A.filter(R=>R.nodeName.toLowerCase()==="material"),w=new ab;w.robotName=S.getAttribute("name"),w.urdfRobotNode=S,E.forEach(R=>{const L=R.getAttribute("name");h[L]=m(R)});const _={},b={};y.forEach(R=>{const L=R.getAttribute("name"),z=S.querySelector(`child[link="${L}"]`)===null;c[L]=v(R,_,b,z?w:null)}),T.forEach(R=>{const L=R.getAttribute("name");l[L]=g(R)}),w.joints=l,w.links=c,w.colliders=b,w.visual=_;const P=Object.values(l);return P.forEach(R=>{R instanceof th&&l[R.mimicJoint].mimicJoints.push(R)}),P.forEach(R=>{const L=new Set,z=X=>{if(L.has(X))throw new Error("URDFLoader: Detected an infinite loop of mimic joints.");L.add(X),X.mimicJoints.forEach(O=>{z(O)})};z(R)}),w.frames={...b,..._,...c,...l},w}function g(S){const A=[...S.children],y=S.getAttribute("type");let T;const E=A.find(L=>L.nodeName.toLowerCase()==="mimic");E?(T=new th,T.mimicJoint=E.getAttribute("joint"),T.multiplier=parseFloat(E.getAttribute("multiplier")||1),T.offset=parseFloat(E.getAttribute("offset")||0)):T=new Ef,T.urdfNode=S,T.name=S.getAttribute("name"),T.urdfName=T.name,T.jointType=y;let w=null,_=null,b=[0,0,0],P=[0,0,0];A.forEach(L=>{const z=L.nodeName.toLowerCase();z==="origin"?(b=Pi(L.getAttribute("xyz")),P=Pi(L.getAttribute("rpy"))):z==="child"?_=c[L.getAttribute("link")]:z==="parent"?w=c[L.getAttribute("link")]:z==="limit"&&(T.limit.lower=parseFloat(L.getAttribute("lower")||T.limit.lower),T.limit.upper=parseFloat(L.getAttribute("upper")||T.limit.upper),T.limit.effort=parseFloat(L.getAttribute("effort")||T.limit.effort),T.limit.velocity=parseFloat(L.getAttribute("velocity")||T.limit.velocity))}),w.add(T),T.add(_),ih(T,P),T.position.set(b[0],b[1],b[2]);const R=A.filter(L=>L.nodeName.toLowerCase()==="axis")[0];if(R){const L=R.getAttribute("xyz").split(/\s+/g).map(z=>parseFloat(z));T.axis=new N(L[0],L[1],L[2]),T.axis.normalize()}return T}function v(S,A,y,T=null){T===null&&(T=new Sf);const E=[...S.children];T.name=S.getAttribute("name"),T.urdfName=T.name,T.urdfNode=S;const w=E.find(_=>_.nodeName.toLowerCase()==="inertial");return w&&[...w.children].forEach(_=>{const b=_.nodeName.toLowerCase();b==="origin"?(T.inertial.origin.xyz=Pi(_.getAttribute("xyz")),T.inertial.origin.rpy=Pi(_.getAttribute("rpy"))):b==="mass"?T.inertial.mass=parseFloat(_.getAttribute("value"))||0:b==="inertia"&&(T.inertial.inertia.ixx=parseFloat(_.getAttribute("ixx"))||0,T.inertial.inertia.ixy=parseFloat(_.getAttribute("ixy"))||0,T.inertial.inertia.ixz=parseFloat(_.getAttribute("ixz"))||0,T.inertial.inertia.iyy=parseFloat(_.getAttribute("iyy"))||0,T.inertial.inertia.iyz=parseFloat(_.getAttribute("iyz"))||0,T.inertial.inertia.izz=parseFloat(_.getAttribute("izz"))||0)}),r&&E.filter(b=>b.nodeName.toLowerCase()==="visual").forEach(b=>{const P=p(b,h);if(T.add(P),b.hasAttribute("name")){const R=b.getAttribute("name");P.name=R,P.urdfName=R,A[R]=P}}),a&&E.filter(b=>b.nodeName.toLowerCase()==="collision").forEach(b=>{const P=p(b);if(T.add(P),b.hasAttribute("name")){const R=b.getAttribute("name");P.name=R,P.urdfName=R,y[R]=P}}),T}function m(S){const A=[...S.children],y=new Mr;return y.name=S.getAttribute("name")||"",A.forEach(T=>{const E=T.nodeName.toLowerCase();if(E==="color"){const w=T.getAttribute("rgba").split(/\s/g).map(_=>parseFloat(_));y.color.setRGB(w[0],w[1],w[2]),y.opacity=w[3],y.transparent=w[3]<1,y.depthWrite=!y.transparent}else if(E==="texture"){const w=T.getAttribute("filename");if(w){const _=new of(o),b=u(w);y.map=_.load(b),y.map.colorSpace=dt}}}),y}function p(S,A={}){const y=S.nodeName.toLowerCase()==="collision",T=[...S.children];let E=null;const w=T.filter(b=>b.nodeName.toLowerCase()==="material")[0];if(w){const b=w.getAttribute("name");b&&b in A?E=A[b]:E=m(w)}else E=new Mr;const _=y?new sb:new rb;return _.urdfNode=S,T.forEach(b=>{const P=b.nodeName.toLowerCase();if(P==="geometry"){const R=b.children[0].nodeName.toLowerCase();if(R==="mesh"){const L=b.children[0].getAttribute("filename"),z=u(L);if(z!==null){const X=b.children[0].getAttribute("scale");if(X){const O=Pi(X);_.scale.set(O[0],O[1],O[2])}s(z,o,E,(O,I)=>{I?console.error("URDFLoader: Error loading mesh.",I):O&&(O.position.set(0,0,0),O.quaternion.identity(),_.add(O))})}}else if(R==="box"){const L=new ft;L.geometry=new ms(1,1,1),L.material=E;const z=Pi(b.children[0].getAttribute("size"));L.scale.set(z[0],z[1],z[2]),_.add(L)}else if(R==="sphere"){const L=new ft;L.geometry=new Wc(1,30,30),L.material=E;const z=parseFloat(b.children[0].getAttribute("radius"))||0;L.scale.set(z,z,z),_.add(L)}else if(R==="cylinder"){const L=new ft;L.geometry=new Xr(1,1,1,30),L.material=E;const z=parseFloat(b.children[0].getAttribute("radius"))||0,X=parseFloat(b.children[0].getAttribute("length"))||0;L.scale.set(z,X,z),L.rotation.set(Math.PI/2,0,0),_.add(L)}}else if(P==="origin"){const R=Pi(b.getAttribute("xyz")),L=Pi(b.getAttribute("rpy"));_.position.set(R[0],R[1],R[2]),_.rotation.set(0,0,0),ih(_,L)}}),_}return d(e)}defaultMeshLoader(e,t,n,s){/\.stl$/i.test(e)?new jy(t).load(e,a=>{const o=new ft(a,n||new Mr);s(o)},null,a=>s(null,a)):/\.dae$/i.test(e)?new nb(t).load(e,a=>s(a.scene),null,a=>s(null,a)):console.warn(`URDFLoader: Could not load model at ${e}.
No loader available`)}}const Ni=[[0,"#2f7fd0"],[.25,"#2fc3b0"],[.5,"#9bd65a"],[.75,"#f2b84b"],[1,"#e5484d"]],lb="#ff4fd8";function Tf(i){if(!Number.isFinite(i)||i<=0)return Ni[0][1];if(i>1)return lb;for(let e=1;e<Ni.length;e+=1){const[t,n]=Ni[e],[s,r]=Ni[e-1];if(i<=t)return`#${new Ue(r).lerp(new Ue(n),(i-s)/(t-s)).getHexString()}`}return Ni[Ni.length-1][1]}function cb(){return`linear-gradient(90deg, ${Ni.map(([i,e])=>`${e} ${i*100}%`).join(", ")})`}function sh(i){return Array.isArray(i)&&i.length===3&&i.every(Number.isFinite)?i:void 0}function ub(i,e){const t=document.createElement("canvas");t.width=64,t.height=32;const n=t.getContext("2d");n.font="700 22px Inter, ui-sans-serif, system-ui, sans-serif",n.textAlign="center",n.textBaseline="middle",n.fillStyle=e,n.fillText(i,32,16);const s=new Gm(t);s.colorSpace=dt;const r=new Im(new $h({map:s,depthTest:!1,transparent:!0}));return r.scale.set(.32,.16,1),r}function rh(i,e,t=1){const n=new cs({color:i,transparent:t<1,opacity:t}),s=new ft(new Xr(e,e,1,12),n),r=new ft(new Hc(e*2.6,1,16),n),a=new wn;return a.add(s,r),a.visible=!1,{group:a,shaft:s,head:r,material:n}}const db=new N(0,1,0);function ah(i,e,t){if(t<1e-4){i.group.visible=!1;return}const n=Math.min(.22,t*.45),s=t-n;i.group.visible=!0,i.group.quaternion.setFromUnitVectors(db,e),i.shaft.scale.set(1,s,1),i.shaft.position.set(0,s/2,0),i.head.scale.set(1,n,1),i.head.position.set(0,s+n/2,0)}class hb{constructor(e){this.canvas=e,this.scene=new kc,this.camera=new Bt(32,1,.1,20),this.measured=rh(Ni[0][1],.04),this.reference=rh("#d9e7e4",.014,.5),this.pending=0;try{this.renderer=new yf({canvas:e,antialias:!0,alpha:!0})}catch{this.renderer=void 0}this.available=!!this.renderer,this.camera.up.set(0,0,1),this.resetView();const t=new Co(new Wm(new ms(2,2,2)),new hi({color:3494490})),n=new df(2,4,4021862,2242621);n.rotation.x=Math.PI/2;const s=new wn;for(const a of[.5,1]){const o=new qm(0,0,a,a,0,Math.PI*2),c=new Vm(new mt().setFromPoints(o.getPoints(64)),new hi({color:a===1?5930372:4021862}));s.add(c)}const r=new wn;for(const[a,o,c]of[[new N(1,0,0),"#ff5a5a","X"],[new N(0,1,0),"#63dc72","Y"],[new N(0,0,1),"#5594ff","Z"]]){r.add(new Dr(new mt().setFromPoints([a.clone().multiplyScalar(-1),a.clone()]),new hi({color:o})));const l=ub(c,o);l.position.copy(a).multiplyScalar(1.18),r.add(l)}this.dropLine=new Dr(new mt().setFromPoints([new N,new N]),new xg({color:9414313,dashSize:.05,gapSize:.04})),this.dropLine.visible=!1,this.dropDot=new ft(new Gc(.035,20),new cs({color:9414313})),this.dropDot.visible=!1,this.scene.add(t,n,s,r,this.reference.group,this.measured.group,this.dropLine,this.dropDot),this.renderer&&(this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2)),this.renderer.outputColorSpace=dt,this.renderer.setClearColor(726553,1),this.controls=new Mf(this.camera,e),this.controls.enableZoom=!1,this.controls.enablePan=!1,this.controls.target.set(0,0,0),this.controls.addEventListener("change",()=>this.requestRender()),e.addEventListener("dblclick",()=>{var a;this.resetView(),(a=this.controls)==null||a.update(),this.requestRender()}),this.resizeObserver=new ResizeObserver(()=>this.resize()),this.resizeObserver.observe(e),this.resize())}resetView(){this.camera.position.set(2.8,-3.8,2.35),this.camera.lookAt(0,0,0)}resize(){const{clientWidth:e,clientHeight:t}=this.canvas;!this.renderer||!e||!t||(this.renderer.setSize(e,t,!1),this.camera.aspect=e/t,this.camera.updateProjectionMatrix(),this.requestRender())}requestRender(){!this.renderer||this.pending||(this.pending=requestAnimationFrame(()=>{var e;this.pending=0,(e=this.renderer)==null||e.render(this.scene,this.camera)}))}update(e,t,n){const s=Number.isFinite(t)&&t>0,r=sh(e);let a=Number.NaN;if(r&&s){const c=new N(...r);a=c.length()/t;const l=Math.min(a,1),h=c.normalize();ah(this.measured,h,l),this.measured.material.color.set(Tf(a));const u=h.clone().multiplyScalar(l),d=l>=1e-4&&Math.abs(u.z)>.001;this.dropLine.visible=d,this.dropDot.visible=d,d&&(this.dropLine.geometry.setFromPoints([u,new N(u.x,u.y,0)]),this.dropLine.computeLineDistances(),this.dropDot.position.set(u.x,u.y,.001))}else this.measured.group.visible=!1,this.dropLine.visible=!1,this.dropDot.visible=!1;const o=sh(n);if(o&&s){const c=new N(...o);ah(this.reference,c.clone().normalize(),Math.min(c.length()/t,1))}else this.reference.group.visible=!1;return this.requestRender(),a}}const fb=document.querySelector("#app");fb.innerHTML=`
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
            <div id="viewer" class="viewer"><canvas id="canvas" aria-label="RealMan URDF 三维模型"></canvas><div id="viewer-state" class="viewer-state">加载 URDF…</div><div id="keyboard-frame-legend" class="keyboard-frame-legend" hidden><strong>L WORK</strong><strong>R WORK</strong><span class="axis-x">X</span><span class="axis-y">Y</span><span class="axis-z">Z</span></div><div class="legend"><span class="legend-live"></span>实体姿态 <span class="legend-shadow"></span>目标影子</div></div>
            <div class="viewer-footer"><span id="joint-stamp">等待 joint_states</span><span id="root-frame"></span></div>
          </div>
        </div>
      </section>
      <div class="status-row">
        <section id="coordinate-panel" class="panel panel-section"><div class="panel-heading compact"><div><span class="eyebrow">COORDINATES</span><h2>当前坐标</h2></div><div class="coordinate-actions"><button id="copy-current-joints" class="button ghost" type="button" disabled>复制当前角度</button><span id="coordinate-state" class="mini-state">WAIT</span></div></div><div id="coordinate-summary" class="coordinate-summary"></div><div id="joint-copy-status" class="joint-copy-status" aria-live="polite">等待有效 joint_states</div></section>
        <section id="action-monitor-panel" class="panel panel-section"><div class="panel-heading compact"><div><span class="eyebrow">ACTION MONITOR</span><h2>运行反馈</h2></div><span id="action-state" class="mini-state">IDLE</span></div><div class="progress-track"><div id="progress" class="progress-bar"></div></div><div id="feedback" class="feedback">尚未发送 Action</div><pre id="result" class="result" aria-live="polite">等待结果…</pre></section>
      </div>
      <section id="velocity-telemetry-panel" class="panel panel-section"><div class="panel-heading compact"><div><span class="eyebrow">VELOCITY TELEMETRY</span><h2>命令与实际末端速度</h2></div><span class="mini-state">L + R</span></div><p class="telemetry-help">命令值来自当前速度控制 session；实际值由驱动根据状态位姿差分估计。两者坐标系和数据年龄始终单独标注。</p><div id="velocity-telemetry-grid" class="velocity-telemetry-grid"></div></section>
    </div>
    <aside class="controls">
      <section id="input-mode-card" class="panel panel-section input-mode-card" hidden>
        <div class="panel-heading compact"><div><span class="eyebrow">GLOBAL INPUT</span><h2>输入模式</h2></div><span id="input-mode-active" class="mini-state">WAIT</span></div>
        <div class="input-mode-body"><label>当前选择<select id="input-mode-select" aria-label="输入模式"></select></label><div id="input-mode-detail" class="input-mode-detail" aria-live="polite">等待输入模式状态</div></div>
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
`;const ie=i=>document.querySelector(i),pb={l:2988957,m:13924166,r:8688794},Br=ie("#arm-select"),oh=ie("#connection"),lh=ie("#mode"),Af=ie("#stop-button"),wf=ie("#cancel-motion"),Rf=ie("#recover-motion"),Kc=ie("#execute-motion"),Cf=ie("#start-velocity"),Pf=ie("#cancel-velocity"),Va=ie("#action-state"),mb=ie("#velocity-state"),ch=ie("#coordinate-state"),uh=ie("#coordinate-summary"),ni=ie("#feedback"),Ii=ie("#result"),Rl=ie("#progress"),ts=ie("#viewer-state"),dh=ie("#canvas"),ai=ie("#viewer"),Cl=ie("#fleet-strip"),uo=ie("#selected-arm-label"),gb=ie("#input-mode-card"),Oi=ie("#input-mode-select"),hh=ie("#input-mode-active"),_b=ie("#input-mode-detail"),fh=ie("#keyboard-control-card"),ph=ie("#keyboard-control-state"),vb=ie("#keyboard-frame-legend"),ho=ie("#control-tab-keyboard"),Lf="realman-web-control.tab";let fo="motion";try{const i=window.localStorage.getItem(Lf);(i==="motion"||i==="velocity"||i==="gripper"||i==="keyboard")&&(fo=i)}catch{}function Nf(i,e=!0){if(fo=i,e)try{window.localStorage.setItem(Lf,i)}catch{}Zc()}function Zc(){const i=fo==="keyboard"&&ho.hidden?"motion":fo;document.querySelectorAll("[data-control-tab]").forEach(e=>{const t=e.dataset.controlTab===i;e.classList.toggle("selected",t),e.setAttribute("aria-selected",String(t)),e.tabIndex=t?0:-1}),document.querySelectorAll("[data-control-panel]").forEach(e=>{e.hidden=e.dataset.controlPanel!==i})}ie("#control-tabs").addEventListener("click",i=>{const e=i.target.closest("[data-control-tab]");e&&!e.hidden&&Nf(e.dataset.controlTab)});Zc();const Pl=ie("#velocity-telemetry-grid"),If=ie("#motion-mode"),xb=ie("#joint-target"),yb=ie("#pose-target"),Er=ie("#pose-reference-frame"),Za=ie("#pose-sliders"),bb=ie("#pose-kinematics-actions"),Df=ie("#fill-current-pose"),Jc=ie("#solve-ik"),jc=ie("#kinematics-status"),Uf=ie("#reset-preview"),po=ie("#motion-reference"),mo=ie("#motion-velocity"),go=ie("#motion-timeout"),Ff=ie("#copy-current-joints"),_o=ie("#joint-copy-status"),Uo=ie("#record-name"),Of=ie("#save-record"),mn=ie("#record-select"),Bf=ie("#apply-record"),Qc=ie("#delete-record"),kf=ie("#record-status"),Mb=["pose-x","pose-y","pose-z","pose-qw","pose-qx","pose-qy","pose-qz"],eu={0:"MOVEJ",1:"MOVEL",2:"MOVEP"},Sb={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};let Be,te="l",xt=0,kt=[],Fo=[],Ft;const gs={},kr={},Ji={};let cn="",Yr=!1,Ja=!1,Gt,Qe,zs="",Tn="",oi,zi="",Rt="",bn=0,Gn="",li=0;const Kn={l:new Set,r:new Set},Eb={l:0,r:0};let Tr=0,ci=!1,mh,Ga=0;const rr={},tu={},ds={},Ys={},gh={},Gi={},zr={},Hi={},ss={},Ac={},Vr={},nu={},zf={},Bi={},rs={},vo={},ki={},iu={},as={},Ar={},Ui={},vi={},_h={};let On,Mn,fn,ii,Ll=null,vh=0;function xo(){if(!Be)throw new Error("manifest not loaded");return Be.robots.find(i=>i.id===te)}function Oo(i){if(!Be)throw new Error("manifest not loaded");return Be.robots.find(e=>e.id===i)}function Ln(i){return`${i}-${Date.now()}-${Math.random().toString(16).slice(2,8)}`}function qt(){return!Ja&&(Ft==null?void 0:Ft.readyState)===WebSocket.OPEN}function Tb(i){var e;return((e=Gt==null?void 0:Gt.find(t=>t.id===i))==null?void 0:e.label)??i}function su(){return!!(Gt!=null&&Gt.some(i=>i.id==="keyboard"&&i.selectable))}function ru(){return ci&&su()&&(Qe==null?void 0:Qe.phase)==="ACTIVE"&&Qe.active_mode==="keyboard"}function Vf(){return su()&&(Qe==null?void 0:Qe.phase)==="ACTIVE"&&Qe.active_mode==="keyboard"}function Gr(i){var n,s,r;const e=(n=Be==null?void 0:Be.keyboard_control)==null?void 0:n.arms[i],t=rr[i];return!!(e&&(t==null?void 0:t.motion_allowed)===!0&&t.work_matched===!0&&t.current_work===e.work_reference_name&&t.expected_work===e.work_reference_name&&((s=t.work)==null?void 0:s.name)===e.work_reference_name&&((r=t.work)==null?void 0:r.frame_id)===e.work_frame_id)}function yo(i){const e=gs[i==="l"?"gripper_left":"gripper_right"];return(e==null?void 0:e.connected)===!0&&e.alarm===0}function Gf(i){var t,n;const e=((n=(t=Be==null?void 0:Be.keyboard_control)==null?void 0:t.arms[i])==null?void 0:n.bindings)??{};return new Set(Object.values(e).flatMap(s=>[s.positive,s.negative]))}function Hf(i){var e,t;return new Set(Object.values(((t=(e=Be==null?void 0:Be.keyboard_control)==null?void 0:e.grippers)==null?void 0:t[i])??{}))}function Wf(i,e){return ru()&&qt()&&!document.hidden&&(Hf(i).has(e)?yo(i):Gr(i))}function Xf(i){for(const e of["l","r"])if(Gf(e).has(i)||Hf(e).has(i))return e}function qf(i){Zt({type:"keyboard_state",arm:i,keys:[...Kn[i]].sort(),sequence:++Eb[i]})}function Hr(){for(const i of["l","r"])qf(i)}function Ab(){Tr&&window.clearInterval(Tr),Tr=0}function Vi(){const i=ci&&(Ft==null?void 0:Ft.readyState)===WebSocket.OPEN;Kn.l.clear(),Kn.r.clear(),Ab(),i&&Hr(),Kr()}function Wr(){if(!ru()||!qt()){Vi();return}for(const i of["l","r"]){let e=!1;for(const t of Kn[i])Wf(i,t)||(Kn[i].delete(t),e=!0);e&&qf(i)}Tr||(Hr(),Tr=window.setInterval(Hr,Be.keyboard_control.heartbeat_period_ms)),Kr()}function xh(i){var c,l,h;const e=ie(i==="l"?"#keyboard-left":"#keyboard-right"),t=(c=Be==null?void 0:Be.keyboard_control)==null?void 0:c.arms[i];if(!t){e.replaceChildren();return}const n={vx:"X",vy:"Y",vz:"Z",wx:"RX",wy:"RY",wz:"RZ"},s=u=>zn(u.replace(/^(Key|Digit)/,"")),r=(h=(l=Be==null?void 0:Be.keyboard_control)==null?void 0:l.grippers)==null?void 0:h[i],a=gs[i==="l"?"gripper_left":"gripper_right"],o=(a==null?void 0:a.connected)!==!0?"OFFLINE":a.alarm!==0?"ALARM":"READY";e.innerHTML=`<div class="keyboard-arm-heading"><strong>${i==="l"?"LEFT / L":"RIGHT / R"}</strong><span>${zn(t.work_frame_id)}</span></div><div class="keyboard-bindings ${Gr(i)?"":"unavailable"}">${Object.entries(t.bindings).map(([u,d])=>`
    <div class="keyboard-binding"><span>${n[u]??u}</span><kbd data-code="${zn(d.positive)}">${s(d.positive)}</kbd><em>+</em><kbd data-code="${zn(d.negative)}">${s(d.negative)}</kbd><em>−</em></div>`).join("")}</div>
    ${r?`<div class="keyboard-gripper ${yo(i)?"":"unavailable"}"><div class="keyboard-arm-heading"><strong>夹爪 / 单次目标</strong><span>${o}</span></div><div class="keyboard-binding gripper-binding"><kbd data-code="${zn(r.open)}">${s(r.open)}</kbd><span>全开</span><kbd data-code="${zn(r.close)}">${s(r.close)}</kbd><span>全闭</span></div></div>`:""}`,e.querySelectorAll("kbd[data-code]").forEach(u=>u.classList.toggle("pressed",Kn[i].has(u.dataset.code??"")))}function Kr(){const i=su()&&!!(Be!=null&&Be.keyboard_control);if(ho.hidden!==!i&&(ho.hidden=!i,Zc()),!i)return;xh("l"),xh("r");const e=["l","r"].some(r=>[...Kn[r]].some(a=>Gf(r).has(a))),t=Gr("l")||Gr("r"),n=yo("l")||yo("r"),s=Vf()?ci?t?e?"MOVING":"READY":n?"GRIPPER ONLY":"WORK UNAVAILABLE":"REMOTE":"RELEASED";ph.textContent=s,ph.className=`mini-state keyboard-${s.toLowerCase().replaceAll(" ","-")}`}function wb(i){var s,r,a;const e=(s=rr[i])==null?void 0:s.work,t=(r=e==null?void 0:e.xyz_m)==null?void 0:r.map(Number),n=(a=e==null?void 0:e.quaternion_wxyz)==null?void 0:a.map(Number);if(!(!Gr(i)||(t==null?void 0:t.length)!==3||(n==null?void 0:n.length)!==4||![...t,...n].every(Number.isFinite)||Math.hypot(...n)<1e-9))return{position:t,quaternion:n}}function bo(){const i=[];for(const e of["l","r"]){const t=vi[e];let n=_h[e];t!=null&&t.live&&(n==null?void 0:n.parent)!==t.live&&(n==null||n.removeFromParent(),n=new Gg(.18),n.name=`${e}-keyboard-work-frame`,n.renderOrder=20,n.traverse(a=>{a.material&&(a.material.depthTest=!1,a.material.transparent=!0)}),t.live.add(n),_h[e]=n);const s=wb(e),r=!!(n&&Vf()&&s);n&&(n.visible=r,s&&(n.position.fromArray(s.position),n.quaternion.set(s.quaternion[1],s.quaternion[2],s.quaternion[3],s.quaternion[0]).normalize(),n.updateMatrixWorld(!0))),r&&i.push(e)}ai.dataset.keyboardWorkFrames=i.join(","),vb.hidden=i.length===0}function Rb(){!ru()||(Qe==null?void 0:Qe.epoch)===mh||ho.hidden||(mh=Qe.epoch,Nf("keyboard",!1),fh.classList.add("keyboard-guide-active"),Ga&&window.clearTimeout(Ga),Ga=window.setTimeout(()=>{fh.classList.remove("keyboard-guide-active"),Ga=0},1800))}function $f(){Oi.disabled=!qt()||!!Tn||(Qe==null?void 0:Qe.phase)==="SWITCHING"||!(Gt!=null&&Gt.some(i=>i.id!=="web"&&i.selectable))}function ji(){if(gb.hidden=!Gt,!Gt){Wr(),bo();return}const e=(Qe==null?void 0:Qe.phase)==="ACTIVE"&&Qe.active_mode==="keyboard"&&!ci&&!zi?"":zi||(Qe==null?void 0:Qe.selected_mode);Oi.replaceChildren(...Gt.filter(n=>n.id!=="web").map(n=>{const s=document.createElement("option");return s.value=n.id,s.textContent=n.label,s.disabled=!n.selectable,s})),e&&Array.from(Oi.options).some(n=>n.value===e)?Oi.value=e:Oi.selectedIndex=-1;const t=Qe;hh.textContent=t?`${Tb(t.active_mode)} / ${t.phase}`:"WAIT",hh.className=`mini-state ${(t==null?void 0:t.phase.toLowerCase())??""}`,_b.textContent=(t==null?void 0:t.detail)||zs||"等待输入模式状态",$f(),Wr(),Rb(),bo()}function yh(){!Tn||oi===void 0||!Qe||Qe.request_id!==oi||!["ACTIVE","FAILED"].includes(Qe.phase)||(Oi.blur(),Tn="",oi=void 0,zi="")}function Cn(i,e=2){return Number.isFinite(i)?i.toFixed(e):""}function Wn(i,e=2){const t=Number(i);return Number.isFinite(t)?t.toFixed(e):String(i??"")}function Cb(i){return`[${i.map(e=>(e*180/Math.PI).toFixed(3)).join(", ")}]`}async function Pb(i){var n;if((n=navigator.clipboard)!=null&&n.writeText){await navigator.clipboard.writeText(i);return}const e=document.createElement("textarea");e.value=i,e.setAttribute("readonly",""),e.style.position="fixed",e.style.opacity="0",document.body.append(e),e.select();const t=document.execCommand("copy");if(e.remove(),!t)throw new Error("clipboard copy failed")}function gn(i){return i?`${i.type===1?"WORK":i.type===2?"TOOL":i.type===3?"TF":"BASE"} / ${i.name}`:"BASE / base"}function zn(i){return i.replace(/[&<>"']/g,e=>Sb[e]??e)}function Bo(){return rr[te]}function Mo(){return vi[te]}function Zr(i){const e=Oo(i);return ds[i]??e.joints.map(()=>Be.default_joint_position_rad)}function au(i){return Gi[i]??Zr(i)}function Yf(i=xt){return i===1?"位姿已修改：影子等待“计算逆解”成功后更新":i===2?"MOVEP 位姿目标已修改：MOVEP 不提供逆解/影子预览，影子不会跟随滑轨；可直接发送 MOVEP":"位姿已修改"}function Lb(){var i;Fo=[...Zr(te)],kt=[...au(te)],ko(kt,!0),tp(),(i=Mo())!=null&&i.shadow&&fs(Mo().shadow,kt),uo.textContent=te.toUpperCase(),uo.className="mini-state active-arm",ou(),jc.textContent=nu[te]??"MOVEL 逆解仅更新影子预览",fu(),Vs(),_o.textContent=Ys[te]===void 0?"等待有效 joint_states":"可复制当前关节角",du(),je()}function ou(){var e,t,n,s,r;const i=Bo();if(po.textContent=gn(i==null?void 0:i.preferred_reference),ch.textContent=i?i.motion_allowed?"READY":"BLOCKED":"WAIT",ch.className=i?`mini-state ${i.motion_allowed?"accepted":"stopping"}`:"mini-state",!i){uh.innerHTML='<div class="coordinate-empty">等待坐标状态</div>';return}uh.innerHTML=`
    <div class="coordinate-row"><span>MOVE</span><strong>${gn(i.preferred_reference)}</strong></div>
    <div class="coordinate-row"><span>TOOL</span><strong>${gn(i.tool)}</strong></div>
    <div class="coordinate-meta">${((e=i.tool)==null?void 0:e.controller_name)??i.current_tool} ${((t=i.tool)==null?void 0:t.payload_kg)!=null?` / ${Cn(i.tool.payload_kg)} kg`:""}</div>
    <div class="coordinate-meta">${(n=i.tool)!=null&&n.xyz_m?`xyz ${i.tool.xyz_m.map(a=>Cn(a)).join(", ")}`:""}</div>
    <div class="coordinate-row"><span>WORK</span><strong>${gn(i.work)}</strong></div>
    <div class="coordinate-meta">${((s=i.work)==null?void 0:s.controller_name)??i.current_work}</div>
    <div class="coordinate-meta">${(r=i.work)!=null&&r.xyz_m?`xyz ${i.work.xyz_m.map(a=>Cn(a)).join(", ")}`:""}</div>
  `}function _r(i,e=3){return!Array.isArray(i)||i.length!==3||!i.every(Number.isFinite)?"--":`[${i.map(t=>Cn(t,e)).join(", ")}]`}function Nl(i,e=3){return!Array.isArray(i)||i.length!==3||!i.every(Number.isFinite)?"--":Cn(Math.hypot(...i),e)}function bh(i){return`${i.reference_type===1?"WORK":i.reference_type===2?"TOOL":"BASE"} / ${i.reference_name||"unknown"}`}const Nb={linear:"m/s",angular:"rad/s"},Kf={};function Ib(i,e){var n;const t=(n=Be==null?void 0:Be.robots.find(s=>s.id===i))==null?void 0:n.motion;return Number(e==="linear"?t==null?void 0:t.max_linear_speed_mps:t==null?void 0:t.max_angular_speed_radps)}function Mh(i,e){return`<figure class="velocity-plot" data-plot="${e}">
    <figcaption><span>${e==="linear"?"实测线速度":"实测角速度"}</span><em data-field="${e}-percent">--</em></figcaption>
    <div class="velocity-plot-stage"><canvas data-field="${e}-canvas" aria-label="${i.toUpperCase()} ${e==="linear"?"实测线速度":"实测角速度"}三维图，可拖动旋转"></canvas><div class="velocity-plot-overlay" data-field="${e}-overlay">等待 /${i}/cartesian_velocity/state</div></div>
    <div class="velocity-plot-readout"><strong data-field="${e}-vector">--</strong><span data-field="${e}-norm">|--|</span></div>
    <div class="velocity-scale"><div class="velocity-scale-bar" style="background: ${cb()}"></div><div class="velocity-scale-ticks" data-field="${e}-ticks"></div></div>
  </figure>`}function Db(){if(!Pl.childElementCount){Pl.innerHTML=["l","r"].map(i=>`<article class="velocity-telemetry-arm" id="velocity-telemetry-${i}" data-arm="${i}">
      <div class="velocity-telemetry-heading"><strong>${i==="l"?"LEFT / L":"RIGHT / R"}</strong><span class="telemetry-status" data-field="session">WAIT</span></div>
      <div class="telemetry-reference"><span>命令坐标系</span><strong data-field="command-frame">--</strong><span>参考</span><strong data-field="reference">--</strong></div>
      <div class="telemetry-row"><span>命令线速度</span><strong data-field="commanded-linear">--</strong><em data-field="command-age">age -- ms</em></div>
      <div class="telemetry-row"><span>限速后线速度</span><strong data-field="limited-linear">--</strong><em></em></div>
      <div class="telemetry-row"><span>命令角速度</span><strong data-field="commanded-angular">--</strong><em></em></div>
      <div class="telemetry-row"><span>限速后角速度</span><strong data-field="limited-angular">--</strong><em></em></div>
      <div class="telemetry-divider"></div>
      <div class="telemetry-reference"><span>实测坐标系</span><strong data-field="measured-frame">${i}/base_link</strong><span>状态</span><strong class="telemetry-measured" data-field="measured-status">WAIT</strong></div>
      <div class="telemetry-reference"><span>实测数据年龄</span><strong data-field="measured-age">-- ms</strong><span>命令叠加</span><strong data-field="overlay-note">--</strong></div>
      <div class="velocity-plots">${Mh(i,"linear")}${Mh(i,"angular")}</div>
      <p class="velocity-plot-help">粗箭头为实测速度，颜色按 |v| / 固定量程着色；细白箭头为限速后命令（仅在两者坐标系一致时叠加）。拖动旋转，双击复位视角。</p>
    </article>`).join("");for(const i of["l","r"])for(const e of["linear","angular"]){const t=Pl.querySelector(`#velocity-telemetry-${i} [data-field="${e}-canvas"]`);Kf[`${i}-${e}`]=new hb(t)}}}function Zf(){Db();for(const i of["l","r"]){const e=ie(`#velocity-telemetry-${i}`),t=a=>e.querySelector(`[data-field="${a}"]`),n=zf[i];for(const a of["linear","angular"]){const o=Ib(i,a),c=Nb[a];t(`${a}-ticks`).innerHTML=Number.isFinite(o)&&o>0?[0,.5,1].map(m=>`<span>${Cn(o*m,3)}</span>`).join("")+`<span class="unit">${c}</span>`:"<span>量程未配置</span>";const l=n==null?void 0:n[a==="linear"?"measured_linear_velocity_mps":"measured_angular_velocity_radps"],u=!!(n!=null&&n.command_frame_id&&n.command_frame_id===n.measured_frame_id)?n==null?void 0:n[a==="linear"?"limited_linear_velocity_mps":"limited_angular_velocity_radps"]:void 0,d=Kf[`${i}-${a}`],f=(d==null?void 0:d.update(n!=null&&n.measured_valid?l:void 0,o,u))??Number.NaN,g=t(`${a}-overlay`);g.hidden=!!(n!=null&&n.measured_valid&&(d!=null&&d.available)),g.textContent=d!=null&&d.available?n?"无有效实测":`等待 /${i}/cartesian_velocity/state`:"WebGL 不可用",t(`${a}-vector`).textContent=`${_r(l)} ${c}`,t(`${a}-norm`).textContent=`|${Nl(l)}|`;const v=t(`${a}-percent`);v.textContent=Number.isFinite(f)?`${Math.round(f*100)}%${f>1?" 超量程":""}`:"--",v.style.color=Number.isFinite(f)?Tf(f):"",e.querySelector(`[data-plot="${a}"]`).dataset.ratio=Number.isFinite(f)?f.toFixed(3):""}if(!n)continue;const s=t("session");s.textContent=n.session_active?"ACTIVE":"IDLE",s.className=`telemetry-status ${n.session_active?"active":""}`,t("command-frame").textContent=n.command_frame_id||bh(n),t("reference").textContent=bh(n),t("commanded-linear").textContent=`${_r(n.commanded_linear_velocity_mps)} m/s`,t("command-age").textContent=`age ${Number.isFinite(n.command_age_ms)?n.command_age_ms:"--"} ms`,t("limited-linear").innerHTML=`${_r(n.limited_linear_velocity_mps)} m/s <small>|${Nl(n.limited_linear_velocity_mps)}|</small>`,t("commanded-angular").textContent=`${_r(n.commanded_angular_velocity_radps)} rad/s`,t("limited-angular").innerHTML=`${_r(n.limited_angular_velocity_radps)} rad/s <small>|${Nl(n.limited_angular_velocity_radps)}|</small>`,t("measured-frame").textContent=n.measured_frame_id||`${i}/base_link`;const r=t("measured-status");r.textContent=n.measured_valid?"VALID":"STALE / NO DATA",r.className=`telemetry-measured ${n.measured_valid?"valid":"stale"}`,t("measured-age").textContent=`${Number.isFinite(n.measured_age_ms)?n.measured_age_ms:"--"} ms`,t("overlay-note").textContent=n.command_frame_id&&n.command_frame_id===n.measured_frame_id?"已叠加":"坐标系不同，未叠加"}}function Vs(){var e;if(!Be)return;const i=new Set(Be.robots.map(t=>t.id));for(const t of Be.robots){const n=t.id,s=n===te,r=rr[n],a=tu[n],o=a===void 0?"WAIT":a?"ONLINE":"OFFLINE",c=r?r.motion_allowed?"READY":"BLOCKED":"WAIT",l=((e=ds[n])==null?void 0:e.length)||0;let h=Cl.querySelector(`button[data-arm="${n}"]`);h||(h=document.createElement("button"),h.type="button",h.className="fleet-chip",h.dataset.arm=n,h.innerHTML=`
        <span class="fleet-chip-arm">${n.toUpperCase()}</span>
        <span class="fleet-chip-state"></span>
        <span class="fleet-chip-motion"></span>
        <span class="fleet-chip-meta"></span>
      `,h.addEventListener("click",u=>{const d=u.currentTarget;Br.value=d.dataset.arm,Br.dispatchEvent(new Event("change"))}),Cl.append(h)),h.classList.toggle("selected",s),h.querySelector(".fleet-chip-state").textContent=o,h.querySelector(".fleet-chip-motion").textContent=c,h.querySelector(".fleet-chip-meta").textContent=l?`${l} joints`:t.model}Cl.querySelectorAll("button[data-arm]").forEach(t=>{i.has(t.dataset.arm)||t.remove()})}function Jf(){const i=Bo();return i!=null&&i.preferred_reference?i.preferred_reference:{type:0,name:"base",frame_id:`${te}/base_link`}}function fi(i=te){if(ss[i])return ss[i];const e=rr[i];return e!=null&&e.preferred_reference?e.preferred_reference:{type:0,name:"base",frame_id:`${i}/base_link`}}function Ub(i){const e=Oo(i).frames;return Object.values(e).map(t=>({type:t.type,name:t.name,frame_id:t.frame_id}))}function jf(i){const e=Ub(i),t=new Set(e.map(s=>s.frame_id)),n=(Ac[i]??[]).filter(s=>!t.has(s.frame_id));return[...e,...n]}function lu(){const i=jf(te),e=fi(te);Er.innerHTML=i.map(n=>`<option value="${zn(n.frame_id??n.name)}">${zn(gn(n))}</option>`).join("");const t=e.frame_id??e.name;i.some(n=>(n.frame_id??n.name)===t)?Er.value=t:i[0]&&(Er.value=i[0].frame_id??i[0].name,ss[te]=i[0])}function Fb(){var n;const i=((n=Hi[te])==null?void 0:n.slice(0,3).map(Number))??[];if(i.length!==3||!i.every(Number.isFinite)){Za.innerHTML="";return}const e=Vr[te]??i;Vr[te]=[...e];const t=["X","Y","Z"];Za.innerHTML=t.map((s,r)=>{const a=e[r],o=a-.2,c=a+.2;return`<label>${s}<input data-pose-slider-index="${r}" type="range" min="${o.toFixed(2)}" max="${c.toFixed(2)}" step="0.001" value="${Cn(i[r])}" /></label>`}).join(""),Za.querySelectorAll("input[data-pose-slider-index]").forEach(s=>{s.addEventListener("input",()=>{const r=Number(s.dataset.poseSliderIndex),a=hs()[r];a.value=s.value,Hi[te]=hs().map(o=>o.value),rs[te]=!1,Vn(te,Yf()),pi(te),je()})})}function Ob(){Za.querySelectorAll("input[data-pose-slider-index]").forEach(i=>{const e=Number(hs()[Number(i.dataset.poseSliderIndex)].value);Number.isFinite(e)&&(i.value=String(e))})}function hs(){return Mb.map(i=>ie(`#${i}`))}function ja(){const i=Hi[te]??["","","","1","0","0","0"];hs().forEach((e,t)=>{const n=i[t]??"";e.value=n===""?"":Wn(n)}),lu(),Fb()}function So(){const i=hs().map(n=>n.value.trim());if(i.some(n=>n===""))return null;const e=i.map(Number);if(!e.every(Number.isFinite))return null;const t=e.slice(3);return Math.hypot(...t)<1e-9?null:{position:e.slice(0,3),quaternion:t}}function Qf(){const i=Number(mo.value),e=Number(go.value);return!Number.isInteger(i)||i<1||i>100||!Number.isFinite(e)||e<=0?null:{velocity:i,timeout:e}}function ep(i){const e=xt;xt=i,If.querySelectorAll("button[data-motion-command]").forEach(t=>{const n=Number(t.dataset.motionCommand)===i;t.classList.toggle("selected",n),t.setAttribute("aria-pressed",String(n))}),xb.hidden=i!==0,yb.hidden=i===0,Uf.hidden=i!==0,bb.hidden=i===0,Jc.hidden=i!==1,Qc.hidden=i!==0,Kc.textContent=`发送 ${eu[i]}`,pi(te),i!==0&&(e===0||e!==i)&&cu(te),je()}function tp(){var e;ja(),wr();const i=vo[te];i&&(mo.value=Wn(i.velocity),go.value=Wn(i.timeout)),po.textContent=gn((e=Bo())==null?void 0:e.preferred_reference),xt!==0&&(lu(),po.textContent=gn(fi())),jc.textContent=nu[te]??"MOVEL 逆解仅更新影子预览",ep(xt)}function cu(i,e=!1){if(!qt()||!e&&Bi[i])return;const t=Ln("current-pose"),n=fi(i);Bi[i]=t,Vn(i,`读取 ${gn(n)} 当前位姿…`),Zt({type:"get_current_pose",request_id:t,arm:i,reference:{reference_type:n.type,reference_name:n.name}}),je()}function Zt(i){(Ft==null?void 0:Ft.readyState)===WebSocket.OPEN&&Ft.send(JSON.stringify(i))}document.querySelectorAll('input[type="number"]').forEach(i=>{i.addEventListener("blur",()=>{i.value.trim()!==""&&(i.value=Wn(i.value))})});function wr(){const i=ki[te]??[],e=mn.value;mn.innerHTML=i.length?i.map(t=>`<option value="${zn(t.id)}">${zn(t.label)}</option>`).join(""):'<option value="">无记录</option>',i.some(t=>t.id===e)&&(mn.value=e),kf.textContent=iu[te]??(i.length?`${i.length} 条记录`:"无记录")}function Vn(i,e){nu[i]=e,i===te&&(jc.textContent=e)}function si(i,e){iu[i]=e,i===te&&(kf.textContent=e)}function uu(i,e,t){const n=Ar[i];n&&window.clearTimeout(n),as[i]=e,si(i,t),Ar[i]=window.setTimeout(()=>{as[i]===e&&(delete as[i],delete Ar[i],si(i,"记录请求超时：请确认网页连接后重试"),je())},8e3)}function Ha(i,e){if(as[i]!==e)return!1;delete as[i];const t=Ar[i];return t&&window.clearTimeout(t),delete Ar[i],!0}function wc(i){oh.textContent=i?"ROS ONLINE":"OFFLINE",oh.classList.toggle("offline",!i)}function du(){const i=!!tu[te];wc(i)}function np(){const i=ie("#joint-controls");i.innerHTML=xo().joints.map((e,t)=>`
    <label class="joint-row"><span>J${t+1}<output id="joint-value-${t}">${Cn(kt[t]*180/Math.PI)}°</output></span>
    <input data-joint-index="${t}" type="range" min="${e.lower_deg}" max="${e.upper_deg}" step="0.1" value="${kt[t]*180/Math.PI}" /></label>
  `).join(""),i.querySelectorAll("input[data-joint-index]").forEach(e=>e.addEventListener("input",()=>{var n,s;const t=Number(e.dataset.jointIndex);kt[t]=Number(e.value)*Math.PI/180,Gi[te]=[...kt],zr[te]=!0,ie(`#joint-value-${t}`).textContent=`${Cn(Number(e.value))}°`,(s=(n=Mo())==null?void 0:n.shadow)==null||s.setJointValues(Object.fromEntries(kt.map((r,a)=>[`joint_${a+1}`,r])))}))}function ko(i,e=!1){i.forEach((t,n)=>{const s=ie(`input[data-joint-index="${n}"]`),r=ie(`#joint-value-${n}`);if(!s||!r)return;const a=t*180/Math.PI;e&&(kt[n]=t,s.value=String(a)),r.textContent=`${Cn(a)}°`})}function fs(i,e){i==null||i.setJointValues(Object.fromEntries(e.map((t,n)=>[`joint_${n+1}`,t]))),i==null||i.updateMatrixWorld(!0)}function Sh(i,e,t){var a;const n=Be==null?void 0:Be.robots.find(o=>o.id===i);if(!(e.length===6&&(n==null?void 0:n.joints.every((o,c)=>Number.isFinite(Number(e[c]))&&Number(e[c])>=o.lower_deg&&Number(e[c])<=o.upper_deg))))return si(i,"记录关节角超出限制"),!1;const r=e.map(o=>Number(o)*Math.PI/180);return Gi[i]=[...r],zr[i]=!0,rs[i]=!0,i===te&&(kt=[...r],ko(r,!0)),fs((a=vi[i])==null?void 0:a.shadow,r),si(i,t),i===te&&(pi(i),hu(!0)),!0}function Eh(i,e,t){i==null||i.traverse(n=>{n instanceof ft&&(n.material=e?new cs({color:14715474,transparent:!0,opacity:t===te?.28:0,depthWrite:!1,depthTest:!1,side:Sn}):new sf({color:pb[t],metalness:.25,roughness:.56,depthWrite:!0,depthTest:!0}),n.castShadow=!e,n.receiveShadow=!e,n.renderOrder=e?10:0,n.frustumCulled=!e)})}function Bb(i){i==null||i.traverse(e=>{e instanceof ft&&(e.material=new sf({color:2831416,metalness:.35,roughness:.5}),e.castShadow=!0,e.receiveShadow=!0)})}function pi(i){var n,s;const e=Ll?(n=vi[Ll])==null?void 0:n.shadow:null;e==null||e.traverse(r=>{r instanceof ft&&"opacity"in r.material&&(r.material.opacity=0)});const t=(s=vi[i])==null?void 0:s.shadow;t==null||t.traverse(r=>{if(r instanceof ft&&"opacity"in r.material){const a=xt===0||xt===1&&rs[i]?.28:0;r.material.opacity=a}}),Ll=i}function hu(i=!1){if(!Be||!fn||!ii||!Mn)return;const e=new ps;if(Be.robots.forEach(({id:r})=>{const a=vi[r];a&&(e.expandByObject(a.live),i&&r===te&&e.expandByObject(a.shadow))}),e.isEmpty())return;const t=e.getSize(new N),n=Math.max(t.x,t.y,t.z,.5),s=e.min.z+t.z*.36;ii.target.set(0,0,s),fn.position.set(n*1.18,-n*1.65,s+n*.82),fn.lookAt(ii.target),ii.update()}function Qa(i){let e=0;return i==null||i.traverse(t=>{t instanceof ft&&(e+=1)}),e}async function Th(i,e=7){for(let t=0;t<160;t+=1){if(i.every(n=>Qa(n)>=e))return;await new Promise(n=>window.setTimeout(n,50))}throw new Error("URDF mesh loading timed out")}async function kb(){var t;const i=++vh;ts.textContent="加载 URDF…",ts.removeAttribute("hidden");const e=new ob;e.packages={rm65_description:`${location.origin}/models`};for(const n of Object.keys(Ji))delete Ji[n];try{const n=await Promise.all(Be.robots.map(async l=>{var g;const h=await e.loadAsync(`${location.origin}${l.urdf_url}`),u=await e.loadAsync(`${location.origin}${l.urdf_url}`),d=(g=Be.end_effectors)==null?void 0:g[l.id],f=d?await e.loadAsync(`${location.origin}${d.urdf_url}`):null;return{config:l,live:h,shadow:u,mount:d,gripper:f}}));if(i!==vh)return;if(!Mn)throw new Error("WebGL scene was not initialized");Mn.clear(),Mn.add(new Ig(15200493,2503736,2.5));const s=new cf(16777215,4);s.position.set(2,-3,4),s.castShadow=!0,Mn.add(s);const r=new df(3.5,22,5664888,2505536);r.rotation.x=Math.PI/2,Mn.add(r);const a=[],o=(t=Be.robots.find(l=>l.id==="m"))==null?void 0:t.transform;if(!o)throw new Error("middle-arm transform is missing from the layout manifest");n.forEach(({config:l,live:h,shadow:u,mount:d,gripper:f})=>{var v;h.position.set(l.transform.x-o.x,l.transform.y-o.y,l.transform.z-o.z),h.rotation.set(l.transform.roll,l.transform.pitch,l.transform.yaw,"ZYX"),u.position.set(l.transform.x-o.x,l.transform.y-o.y,l.transform.z-o.z),u.rotation.set(l.transform.roll,l.transform.pitch,l.transform.yaw,"ZYX");const g=d&&f?(v=h.links)==null?void 0:v[d.parent_link]:null;d&&f&&g&&(f.position.set(...d.xyz),f.rotation.set(d.rpy[0],d.rpy[1],d.rpy[2],"ZYX"),g.add(f),Ji[l.id]=f,f.setJointValue(d.driving_joint,d.open_rad)),Mn.add(h),Mn.add(u),vi[l.id]={live:h,shadow:u},a.push(h,u)}),await Th(a),await Th(Object.values(Ji),9),n.forEach(({config:l,live:h,shadow:u})=>{Eh(h,!1,l.id),Bb(Ji[l.id]),Eh(u,!0,l.id),fs(h,Zr(l.id)),fs(u,au(l.id)),h.updateMatrixWorld(!0)}),bo();const c=Oo(te);pi(te),hu(!1),ai.dataset.liveMeshes=String(n.reduce((l,{live:h})=>l+Qa(h),0)),ai.dataset.shadowMeshes=String(n.reduce((l,{shadow:h})=>l+Qa(h),0)),ai.dataset.gripperMeshes=String(Object.values(Ji).reduce((l,h)=>l+Qa(h),0)),pu(),ai.dataset.visualizationReferenceArm="m",ts.setAttribute("hidden",""),ie("#model-label").textContent=`${c.model} / ${te.toUpperCase()} + 3 arms`}catch(n){ts.textContent=`URDF 加载失败: ${String(n)}`,ts.removeAttribute("hidden")}}function zb(){On=new yf({canvas:dh,antialias:!0,alpha:!0,preserveDrawingBuffer:!0}),ai.dataset.renderer="webgl",On.setPixelRatio(Math.min(window.devicePixelRatio,2)),On.outputColorSpace=dt,On.setClearColor(594196,1),On.shadowMap.enabled=!0,Mn=new kc,fn=new Bt(35,1,.01,100),fn.up.set(0,0,1),fn.position.set(1.2,-1.8,1.25),ii=new Mf(fn,dh),ii.enableDamping=!0,ii.target.set(0,0,.55);const i=()=>{const t=ai.getBoundingClientRect();!t.width||!t.height||!On||!fn||(On.setSize(t.width,t.height,!1),fn.aspect=t.width/t.height,fn.updateProjectionMatrix())};new ResizeObserver(i).observe(ai),i();const e=()=>{requestAnimationFrame(e),!(!On||!Mn||!fn||!ii)&&(ii.update(),On.render(Mn,fn))};e()}function fu(){const i=xo().motion;ie("#velocity-frame").innerHTML=Object.entries(xo().frames).map(([n,s])=>`<option value="${n}">${n.toUpperCase()} / ${s.name}</option>`).join(""),ie("#velocity-period").setAttribute("value",Wn(i.velocity_control_period_ms)),ie("#velocity-watchdog").setAttribute("value",Wn(i.velocity_watchdog_ms)),ie("#linear-accel").setAttribute("value",Wn(i.max_linear_accel_mps2)),ie("#angular-accel").setAttribute("value",Wn(i.max_angular_accel_radps2));const e=["vx","vy","vz","wx","wy","wz"];ie("#velocity-inputs").innerHTML=e.map((n,s)=>`<label>${n}<input id="velocity-${s}" type="number" step="0.01" value="0.00" /></label>`).join("");const t=Bo();if(t!=null&&t.preferred_reference){const n=t.preferred_reference.type===1?"work":t.preferred_reference.type===2?"tool":"base";ie("#velocity-frame").value=n}}function _s(i,e={}){!cn||!qt()||Zt({type:"gripper_command",request_id:Ln("gripper"),name:cn,command:i,...e})}function ip(i){var s,r,a;const e=Number((s=gs[i])==null?void 0:s.position),t=Number((r=kr[i])==null?void 0:r.open_position),n=Number((a=kr[i])==null?void 0:a.close_position);return!Number.isFinite(e)||!Number.isFinite(t)||!Number.isFinite(n)||t===n?null:Math.min(Math.max((e-n)/(t-n),0),1)}function pu(){var i;for(const e of["l","m","r"]){const t=Ji[e],n=(i=Be==null?void 0:Be.end_effectors)==null?void 0:i[e];if(!t||!n)continue;const s=ip(n.gripper_name);s!==null&&(t.setJointValue(n.driving_joint,n.closed_rad+(n.open_rad-n.closed_rad)*s),ai.dataset[`gripper${e.toUpperCase()}`]=s.toFixed(2))}}function mu(){const i=gs[cn];if(!i)return;ie("#gripper-state").textContent=i.connected?"ONLINE":"OFFLINE",jr();const e=ip(cn),t=e===null?"":`开合 ${Math.round(e*100)}% / `;ie("#gripper-feedback").textContent=`${t}位置 ${i.position??0} / 速度 ${i.speed??0} / 电流 ${i.current??0} / 力矩 ${i.torque_reached?"到达":"未到达"} / 报警 0x${Number(i.alarm??0).toString(16)}`}function Jr(i){ie("#gripper-limits-status").textContent=i}function gu(){return{open:ie("#gripper-open-position"),close:ie("#gripper-close-position"),raw:ie("#gripper-raw-position"),rawValue:ie("#gripper-raw-value"),apply:ie("#gripper-limits-apply"),teachOpen:ie("#gripper-teach-open"),teachClose:ie("#gripper-teach-close")}}function jr(){const i=kr[cn],e=gs[cn],t=gu(),n=qt()&&!!i,s=n&&(e==null?void 0:e.connected)===!0&&Number(e.speed)===0;if(i){const r=Number(i.min_position??0),a=Number(i.max_position??0);t.raw.min=String(r),t.raw.max=String(a),ie("#gripper-limits-range").textContent=`允许范围 ${r}..${a}（min/max 只能在 gripper.yaml 中修改）`;const o=document.activeElement===t.open||document.activeElement===t.close;!Yr&&!o&&(t.open.value=String(i.open_position),t.close.value=String(i.close_position))}e&&document.activeElement!==t.raw&&(t.raw.value=String(Math.round(Number(e.position)||0)),t.rawValue.textContent=t.raw.value);for(const r of[t.open,t.close,t.raw,t.apply])r.disabled=!n;t.teachOpen.disabled=!s,t.teachClose.disabled=!s}function sp(i){var t;const e=Number((t=gs[cn])==null?void 0:t.position);Number.isFinite(e)&&(gu()[i].value=String(Math.round(e)),Yr=!0,Jr(""))}function Vb(){const i=kr[cn];if(!i||!qt())return;const{open:e,close:t}=gu(),n=Number(e.value),s=Number(t.value);if(e.value===""||t.value===""||!Number.isInteger(n)||!Number.isInteger(s)){Jr("开位和闭位必须是整数");return}window.confirm(`确认修改 ${cn} 的行程？
开位 ${i.open_position} → ${n}
闭位 ${i.close_position} → ${s}`)&&_s("set_limits",{open_position:n,close_position:s})}function Gb(i){const e=ie("#gripper-select");e.innerHTML=i.map(t=>`<option value="${String(t.name)}">${String(t.name)}</option>`).join("");for(const t of i)kr[String(t.name)]=t;pu(),!cn&&i.length&&(cn=String(i[0].name)),e.value=cn,mu(),jr()}function Hb(i){var e,t,n,s,r,a,o,c,l,h;if(i.type==="hello")Ja=!!i.read_only,lh.textContent=Ja?"READ ONLY":"CONTROL READY",lh.classList.toggle("ready",!Ja),i.layout?ap(i.layout):je();else if(i.type==="input_mode_list")i.available?Gt=Array.isArray(i.modes)?i.modes.reduce((u,d)=>(typeof(d==null?void 0:d.id)=="string"&&typeof(d==null?void 0:d.label)=="string"&&typeof(d==null?void 0:d.selectable)=="boolean"&&u.push({id:d.id,label:d.label,selectable:d.selectable}),u),[]):[]:(Gt=void 0,Qe=void 0,zs="",Tn="",oi=void 0,zi=""),ji();else if(i.type==="keyboard_lease")ci=!!i.active,ci||Vi(),ji();else if(i.type==="input_mode_result"){const u={request_id:String(i.request_id??""),executor_request_id:Number(i.executor_request_id),accepted:!!i.accepted,message:String(i.message??"")};u.request_id===Tn&&(zs=u.message,u.accepted&&Number.isFinite(u.executor_request_id)?(oi=u.executor_request_id,yh()):(Tn="",oi=void 0,zi=""),ji())}else if(i.type==="input_mode_state"){const u=String(i.phase??""),d=String(i.active_mode??""),f=Qe!==void 0&&Qe.epoch!==Number(i.epoch)||u!=="ACTIVE"||d!=="keyboard";f&&Vi(),Qe={requested_mode:String(i.requested_mode??""),selected_mode:String(i.selected_mode??""),active_mode:String(i.active_mode??""),phase:String(i.phase??""),request_id:Number(i.request_id),epoch:Number(i.epoch),detail:String(i.detail??"")},f&&(ci=!1),yh(),ji()}else if(i.type==="gripper_list")Gb(Array.isArray(i.grippers)?i.grippers:[]);else if(i.type==="gripper_state")gs[String(i.name)]=i,mu(),pu(),Wr();else if(i.type==="gripper_result"){if(i.command==="set_limits"||i.command==="move_raw"){if(i.message){const u=i.success===!1?"失败：":i.command==="set_limits"&&i.success===!0?"已应用：":"";Jr(`${u}${String(i.message)}`)}}else i.message&&(ie("#gripper-feedback").textContent=String(i.message));i.command==="set_limits"&&i.state==="completed"&&i.success===!0&&(Yr=!1,jr())}else if(i.type==="coordinate_state")rr[i.arm]=i,Wr(),bo(),Vs(),i.arm===te&&(ou(),Be&&fu());else if(i.type==="cartesian_velocity_state"){const u=i.arm;if(!["l","m","r"].includes(u))return;const d=i.state;if(!d)return;zf[u]=d,Zf()}else if(i.type==="tf_frames"){const u=i.arm;if(Ac[u]=Array.isArray(i.frames)?i.frames:[],u===te&&Be){const d=fi(u);d.type===3&&!((e=Ac[u])!=null&&e.some(f=>f.frame_id===d.frame_id))&&delete ss[u],lu(),ja(),je()}}else if(i.type==="connection")tu[i.arm]=!!i.connected,Vs(),i.arm===te&&du();else if(i.type==="joint_state"){const u=i.arm,d=Array.isArray(i.positions_rad)?i.positions_rad.map(Number):[],f=Number(i.stamp_ns);if(!["l","m","r"].includes(u)||d.length!==6||!d.every(Number.isFinite)||!Number.isFinite(f)||f<=0||Ys[u]!==void 0&&f<=Ys[u])return;const g=d.every(v=>v===0);if(g&&gh[u])return;Ys[u]=f,g||(gh[u]=!0),ds[u]=d,zr[u]||(Gi[u]=[...d]),fs((t=vi[u])==null?void 0:t.live,d),u===te&&(Fo=d,ie("#joint-stamp").textContent=`joint_states / ${f}`,_o.textContent="可复制当前关节角"),Vs()}else if(i.type==="joint_records")ki[i.arm]=Array.isArray(i.records)?i.records:[],iu[i.arm]||si(i.arm,`${((n=ki[i.arm])==null?void 0:n.length)??0} 条记录`),i.arm===te&&wr(),je();else if(i.type==="joint_record_saved"){const u=i.arm;if(!Ha(u,i.request_id))return;si(u,`已记录 ${((s=i.record)==null?void 0:s.label)??""}`),Uo.value="",u===te&&wr(),je()}else if(i.type==="joint_record_deleted"){const u=i.arm;if(!Ha(u,i.request_id))return;const d=String(((r=i.record)==null?void 0:r.id)??"");ki[u]=(ki[u]??[]).filter(f=>f.id!==d),si(u,`已删除 ${((a=i.record)==null?void 0:a.label)??"记录"}`),u===te&&wr(),je()}else if(i.type==="joint_record_applied"){const u=i.arm;if(!Ha(u,i.request_id))return;const d=Array.isArray(i.joint_degrees)?i.joint_degrees:[],f=Number(i.command);if(f===0)Sh(u,d,`已填入 ${((o=i.record)==null?void 0:o.label)??"记录"} / MOVEJ`);else{const g=Array.isArray(i.pose_position_m)?i.pose_position_m:[],v=Array.isArray(i.pose_quaternion_wxyz)?i.pose_quaternion_wxyz:[];if(i.success&&g.length===3&&v.length===4&&Sh(u,d,`已填入 ${((c=i.record)==null?void 0:c.label)??"记录"} / ${eu[f]}`)){Hi[u]=[...g,...v].map(p=>String(p));const m=i.reference;(m==null?void 0:m.type)===3&&(ss[u]=m),Vr[u]=[...g],Vn(u,`记录正解已填入 / ${gn(m??fi(u))}`),u===te&&ja()}else si(u,`记录正解失败 / ${i.message||"forward kinematics failed"}`)}je()}else if(i.type==="kinematics_result"){const u=i.arm;if(Bi[u]!==i.request_id)return;if(delete Bi[u],i.operation==="get_current_pose"){const d=Array.isArray(i.pose_position_m)?i.pose_position_m:[],f=Array.isArray(i.pose_quaternion_wxyz)?i.pose_quaternion_wxyz:[];if(i.success&&d.length===3&&f.length===4){Hi[u]=[...d,...f].map(v=>String(v));const g=i.reference;(g==null?void 0:g.type)===3&&(ss[u]=g),Vr[u]=[...d],rs[u]=!1,Vn(u,`当前位置已填入 / ${gn(g??fi(u))}`),u===te&&ja(),u===te&&pi(u)}else Vn(u,`当前位置读取失败 / ${i.message||"unknown error"}`)}else if(i.operation==="solve_ik"){const d=Array.isArray(i.joint_degrees)?i.joint_degrees:[],f=Be==null?void 0:Be.robots.find(v=>v.id===u);if(!!i.success&&d.length===6&&(f==null?void 0:f.joints.every((v,m)=>Number.isFinite(Number(d[m]))&&Number(d[m])>=v.lower_deg&&Number(d[m])<=v.upper_deg))){const v=d.map(m=>Number(m)*Math.PI/180);Gi[u]=[...v],zr[u]=!0,rs[u]=!0,u===te&&(kt=[...v],ko(v,!0)),fs((l=vi[u])==null?void 0:l.shadow,v),Vn(u,`逆解成功 / 影子已更新 / ${d.map(m=>Number(m).toFixed(2)).join(", ")}°`),u===te&&(pi(u),hu(!0))}else rs[u]=!1,Vn(u,`逆解失败 / ${i.message||"target is unreachable"}`),u===te&&pi(u)}je()}else if(i.type==="action_state"){if(i.arm!==te){Vs();return}if(i.action==="execute_motion"&&Rt&&i.request_id&&i.request_id!==Rt)return;Va.textContent=String(i.state).toUpperCase(),Va.className=`mini-state ${i.state}`,i.action==="cartesian_velocity"&&(mb.textContent=String(i.state).toUpperCase()),["rejected","error","stopped"].includes(i.state)&&(i.action==="execute_motion"&&(window.clearTimeout(bn),bn=0,ni.textContent=`${i.action} / ${i.message||`action ${i.state}`}`,Rl.style.width="0%",Rt=""),i.action==="cartesian_velocity"&&(Gn="",window.clearInterval(li),li=0),je())}else if(i.type==="action_feedback"){if(i.arm!==te)return;if(i.action==="execute_motion"){if(Rt&&i.request_id&&i.request_id!==Rt)return;window.clearTimeout(bn),bn=0}const u=i.feedback||{};ni.textContent=`${i.action} / ${u.detail||"executing"} / progress ${u.progress??"-"}`,Array.isArray(u.commanded_linear_velocity_mps)&&(ni.textContent=`velocity / ${u.commanded_linear_velocity_mps.map(d=>Cn(d)).join(", ")}`),Rl.style.width=`${Math.max(0,Math.min(100,Number(u.progress||0)*100))}%`}else if(i.type==="action_result"){if(i.arm!==te)return;if(i.action==="execute_motion"){if(Rt&&i.request_id&&i.request_id!==Rt)return;window.clearTimeout(bn),bn=0,(ni.textContent.includes("等待 feedback")||ni.textContent.includes("尚未收到"))&&(ni.textContent=`${i.action} / ${((h=i.result)==null?void 0:h.message)||"已收到运行结果"}`)}Ii.textContent=JSON.stringify(i.result,null,2),Va.textContent="RESULT",Rt=i.action==="execute_motion"?"":Rt,Gn=i.action==="cartesian_velocity"?"":Gn,je()}else if(i.type==="software_stop_result")Ii.textContent=`软件停止: ${i.success?"成功":"失败"} / ${i.message}`;else if(i.type==="motion_recovery_state"){const u=i.arm;if(Ui[u]!==i.request_id)return;Ii.textContent=`${u.toUpperCase()} 恢复请求中 / ${i.state}`,je()}else if(i.type==="motion_recovery_result"){const u=i.arm;if(Ui[u]!==i.request_id)return;delete Ui[u];const d=i.success?i.recovered?"已恢复":"无需恢复":"恢复失败";Ii.textContent=`${u.toUpperCase()} ${d} / ${i.message||"unknown error"}`,u===te&&(Va.textContent=d.toUpperCase()),je()}else if(i.type==="error"){if(i.code==="keyboard_lease"||i.code==="keyboard_inactive"){ci=!1,Vi(),zs=`${i.code}: ${i.message}`,ji();return}Ii.textContent=`${i.code}: ${i.message}`,i.request_id===Tn&&(zs=`${i.code}: ${i.message}`,Tn="",oi=void 0,zi="",ji()),Rt&&i.request_id===Rt&&(window.clearTimeout(bn),bn=0,ni.textContent=`execute_motion / ${i.code}: ${i.message}`,Rl.style.width="0%",Rt=""),i.request_id===Gn&&(Gn="",window.clearInterval(li),li=0);for(const u of["l","m","r"])i.request_id===Bi[u]&&(delete Bi[u],Vn(u,`${i.code}: ${i.message}`)),i.request_id===as[u]&&(Ha(u,i.request_id),si(u,`${i.code}: ${i.message}`)),i.request_id===Ui[u]&&(delete Ui[u],Ii.textContent=`${u.toUpperCase()} 恢复失败 / ${i.code}: ${i.message}`);je()}}function rp(){ci=!1,Vi(),Ft==null||Ft.close();const i=location.protocol==="https:"?"wss":"ws";Ft=new WebSocket(`${i}://${location.host}/ws`),Ft.addEventListener("open",()=>{wc(!0),je()}),Ft.addEventListener("close",()=>{Vi(),wc(!1),Tn="",oi=void 0,zi="",je(),window.setTimeout(rp,2e3)}),Ft.addEventListener("message",e=>{try{Hb(JSON.parse(e.data))}catch{Ii.textContent="收到无法解析的服务器消息"}})}function je(){var s;const i=qt(),e=!!Qf()&&(xt===0||!!So());Kc.disabled=!i||!!Rt||!e,Cf.disabled=!i||!!Gn,Pf.disabled=!i||!Gn,wf.disabled=!i||!Rt,Rf.disabled=!i||!!Ui[te],Af.disabled=!i;const t=!!Bi[te];Df.disabled=!i||xt===0,Jc.disabled=!i||xt!==1||t||!So();const n=!!as[te];Ff.disabled=!i||Ys[te]===void 0,Of.disabled=!i||n||Uo.value.trim()===""||(((s=ds[te])==null?void 0:s.length)??0)!==6,Bf.disabled=!i||n||!mn.value,Qc.disabled=!i||xt!==0||n||!mn.value,$f(),jr()}function ap(i){Be=i,Kr(),te=Br.value,i.robots.forEach(e=>{const t=e.joints.map(()=>i.default_joint_position_rad);ds[e.id]=ds[e.id]??[...t],Gi[e.id]=Gi[e.id]??[...t],Hi[e.id]=Hi[e.id]??["","","","1","0","0","0"],ki[e.id]=ki[e.id]??[],vo[e.id]=vo[e.id]??{velocity:Wn(30),timeout:Wn(e.motion.default_timeout_sec)}}),Fo=[...Zr(te)],kt=[...au(te)],ie("#root-frame").textContent=`TF / ${i.root_frame}`,uo.textContent=te.toUpperCase(),uo.className="mini-state active-arm",np(),wr(),tp(),fu(),ou(),Zf(),Vs(),du(),On||zb(),kb(),je()}window.addEventListener("keydown",i=>{const e=i.target;if(i.repeat||i.ctrlKey||i.altKey||i.metaKey||i.shiftKey||i.isComposing||e!=null&&e.closest("input, textarea, select")||e!=null&&e.isContentEditable)return;const t=Xf(i.code);!t||!Wf(t,i.code)||(i.preventDefault(),Kn[t].has(i.code)||(Kn[t].add(i.code),Wr(),Hr(),Kr()))});window.addEventListener("keyup",i=>{const e=Xf(i.code);!e||!Kn[e].delete(i.code)||(i.preventDefault(),Hr(),Kr())});window.addEventListener("blur",Vi);document.addEventListener("visibilitychange",()=>{document.hidden&&Vi()});Uf.addEventListener("click",()=>{var i;kt=[...Fo],Gi[te]=[...kt],zr[te]=!0,ko(kt,!0),fs((i=Mo())==null?void 0:i.shadow,kt)});Br.addEventListener("change",()=>{te=Br.value,Rt="",Gn="",window.clearInterval(li),li=0,np(),pi(te),Lb();const i=Oo(te);ie("#model-label").textContent=`${i.model} / ${te.toUpperCase()} + 3 arms`});Oi.addEventListener("change",()=>{const i=Gt==null?void 0:Gt.find(e=>e.id===Oi.value);!i||!i.selectable||i.id==="web"||!qt()||(Tn=Ln("input-mode"),oi=void 0,zi=i.id,zs=`请求切换到 ${i.label}…`,ji(),Zt({type:"select_input_mode",request_id:Tn,mode_id:i.id}))});If.querySelectorAll("button[data-motion-command]").forEach(i=>{i.addEventListener("click",()=>{const e=Number(i.dataset.motionCommand);(e===0||e===1||e===2)&&ep(e)})});hs().forEach(i=>{i.addEventListener("input",()=>{Hi[te]=hs().map(e=>e.value),Ob(),rs[te]=!1,Vn(te,Yf()),pi(te),je()})});[mo,go].forEach(i=>{i.addEventListener("input",()=>{vo[te]={velocity:mo.value,timeout:go.value},je()})});Uo.addEventListener("input",je);mn.addEventListener("change",je);Ff.addEventListener("click",async()=>{const i=ds[te];if(!(!i||i.length!==6||Ys[te]===void 0))try{await Pb(Cb(i)),_o.textContent="已复制当前关节角"}catch{_o.textContent="复制失败，请检查浏览器剪贴板权限"}});Of.addEventListener("click",()=>{if(!qt())return;const i=Uo.value.trim();if(!i)return;const e=Ln("save-record");uu(te,e,"保存当前关节角…"),Zt({type:"save_joint_record",request_id:e,arm:te,label:i}),je()});Bf.addEventListener("click",()=>{if(!qt()||!mn.value)return;const i=Ln("apply-record"),e=xt===0?Jf():fi();uu(te,i,"读取记录…"),Zt({type:"apply_joint_record",request_id:i,arm:te,record_id:mn.value,command:xt,reference:{reference_type:e.type,reference_name:e.name}}),je()});Qc.addEventListener("click",()=>{var t;if(!qt()||xt!==0||!mn.value)return;const i=(t=ki[te])==null?void 0:t.find(n=>n.id===mn.value);if(!window.confirm(`删除关节记录“${(i==null?void 0:i.label)??mn.value}”？此操作不可撤销。`))return;const e=Ln("delete-record");uu(te,e,"删除关节记录…"),Zt({type:"delete_joint_record",request_id:e,arm:te,record_id:mn.value}),je()});Kc.addEventListener("click",()=>{const i=Qf(),e=xt===0?null:So();if(!qt()||!i||xt!==0&&!e)return;const t=eu[xt];Rt=Ln(t.toLowerCase());const n=xt===0?Jf():fi();Zt({type:"execute_motion",request_id:Rt,arm:te,goal:{command:xt,reference_type:n.type,reference_name:n.name,joint_degrees:xt===0?kt.map(a=>a*180/Math.PI):[0,0,0,0,0,0],pose_position_m:(e==null?void 0:e.position)??[0,0,0],pose_quaternion_wxyz:(e==null?void 0:e.quaternion)??[1,0,0,0],velocity_percent:i.velocity,blend_radius_percent:0,timeout_sec:i.timeout}}),ni.textContent=`${t} / ${gn(n)} / 等待 feedback…`,window.clearTimeout(bn);const s=Rt,r=te;bn=window.setTimeout(()=>{bn=0,!(Rt!==s||te!==r)&&(ni.textContent=`${t} / 尚未收到 Action feedback；运行状态未知，请勿重复发送。检查 /${r}/execute_motion 和驱动日志，必要时使用软件停止。`)},8e3),je()});Df.addEventListener("click",()=>{xt!==0&&cu(te,!0)});Jc.addEventListener("click",()=>{const i=So(),e=fi(),t=Zr(te);if(!qt()||xt!==1||!i||t.length!==6)return;const n=Ln("solve-ik");Bi[te]=n,Vn(te,"计算逆解…"),Zt({type:"solve_ik",request_id:n,arm:te,goal:{reference_type:e.type,reference_name:e.name,seed_joint_degrees:t.map(s=>s*180/Math.PI),pose_position_m:i.position,pose_quaternion_wxyz:i.quaternion}}),je()});Cf.addEventListener("click",()=>{if(!qt())return;const i=xo().frames[ie("#velocity-frame").value];Gn=Ln("velocity"),Zt({type:"start_cartesian_velocity",request_id:Gn,arm:te,goal:{reference_type:i.type,reference_name:i.name,control_period_ms:Number(ie("#velocity-period").value),watchdog_ms:Number(ie("#velocity-watchdog").value),max_linear_accel_mps2:Number(ie("#linear-accel").value),max_angular_accel_radps2:Number(ie("#angular-accel").value),follow:!1,trajectory_mode:0,radio:0}}),je(),li=window.setInterval(()=>{const e=Array.from({length:6},(t,n)=>Number(ie(`#velocity-${n}`).value));Zt({type:"velocity_command",arm:te,linear:e.slice(0,3),angular:e.slice(3)})},20)});Er.addEventListener("change",()=>{const i=jf(te).find(e=>(e.frame_id??e.name)===Er.value);i&&(ss[te]=i,po.textContent=gn(i),Vr[te]=void 0,cu(te,!0))});Pf.addEventListener("click",()=>{Zt({type:"cancel_action",arm:te,action:"cartesian_velocity"}),window.clearInterval(li),li=0});wf.addEventListener("click",()=>{Zt({type:"cancel_action",arm:te,action:"execute_motion"})});Af.addEventListener("click",()=>{Zt({type:"software_stop",request_id:Ln("stop"),arm:te})});Rf.addEventListener("click",()=>{if(!qt()||Ui[te])return;const i=Ln("recover");Ui[te]=i,Ii.textContent=`${te.toUpperCase()} 恢复请求中…`,Zt({type:"recover_motion",request_id:i,arm:te}),je()});fetch("/api/layout").then(i=>i.json()).then(ap).catch(i=>{const e=String(i);ts.textContent=e.includes("WebGL")?`WebGL 渲染失败: ${e}`:`布局加载失败: ${e}`,ts.removeAttribute("hidden")});ie("#gripper-select").addEventListener("change",i=>{cn=i.target.value,Yr=!1,Jr(""),mu(),jr()});ie("#gripper-open").addEventListener("click",()=>_s("open"));ie("#gripper-close").addEventListener("click",()=>_s("close"));ie("#gripper-enable").addEventListener("click",()=>_s("enable"));ie("#gripper-reset").addEventListener("click",()=>_s("reset"));ie("#gripper-percentage").addEventListener("change",i=>_s("percentage",{percentage:Number(i.target.value)}));for(const i of["#gripper-open-position","#gripper-close-position"])ie(i).addEventListener("input",()=>{Yr=!0,Jr("")});ie("#gripper-teach-open").addEventListener("click",()=>sp("open"));ie("#gripper-teach-close").addEventListener("click",()=>sp("close"));ie("#gripper-limits-apply").addEventListener("click",Vb);const Eo=ie("#gripper-raw-position");Eo.addEventListener("input",()=>{ie("#gripper-raw-value").textContent=Eo.value});Eo.addEventListener("change",()=>_s("move_raw",{position:Number(Eo.value)}));rp();
