(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const s of n)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&i(a)}).observe(document,{childList:!0,subtree:!0});function t(n){const s={};return n.integrity&&(s.integrity=n.integrity),n.referrerPolicy&&(s.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?s.credentials="include":n.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(n){if(n.ep)return;n.ep=!0;const s=t(n);fetch(n.href,s)}})();/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Uo="185",Hn={ROTATE:0,DOLLY:1,PAN:2},Bn={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},au=0,xl=1,ou=2,vr=1,lu=2,ps=3,Fi=0,qt=1,yi=2,Ii=0,Gn=1,vl=2,yl=3,bl=4,cu=5,dn=100,hu=101,uu=102,du=103,fu=104,pu=200,mu=201,gu=202,_u=203,Ha=204,Ga=205,xu=206,vu=207,yu=208,bu=209,Mu=210,Su=211,Eu=212,Tu=213,wu=214,Va=0,Wa=1,Xa=2,Yn=3,qa=4,Ya=5,Ka=6,Za=7,Gr=0,Au=1,Ru=2,Mi=0,Qc=1,eh=2,th=3,ih=4,nh=5,sh=6,rh=7,Ml="attached",Cu="detached",ah=300,gn=301,Kn=302,Qr=303,ea=304,Vr=306,pn=1e3,Qt=1001,$a=1002,Nt=1003,Pu=1004,Fs=1005,St=1006,ta=1007,Di=1008,jt=1009,oh=1010,lh=1011,Ss=1012,Fo=1013,Ei=1014,ci=1015,Oi=1016,Oo=1017,ko=1018,Es=1020,ch=35902,hh=35899,uh=1021,dh=1022,ri=1023,ki=1026,mn=1027,fh=1028,Bo=1029,_n=1030,zo=1031,Ho=1033,yr=33776,br=33777,Mr=33778,Sr=33779,Ja=35840,ja=35841,Qa=35842,eo=35843,to=36196,io=37492,no=37496,so=37488,ro=37489,Tr=37490,ao=37491,oo=37808,lo=37809,co=37810,ho=37811,uo=37812,fo=37813,po=37814,mo=37815,go=37816,_o=37817,xo=37818,vo=37819,yo=37820,bo=37821,Mo=36492,So=36494,Eo=36495,To=36283,wo=36284,wr=36285,Ao=36286,Ts=2300,Ro=2301,ia=2302,Co=2303,Sl=2400,El=2401,Tl=2402,Lu=2500,Nu=3200,Ar=0,Du=1,Ji="",lt="srgb",Rr="srgb-linear",Cr="linear",je="srgb",Mn=7680,wl=519,Iu=512,Uu=513,Fu=514,Go=515,Ou=516,ku=517,Vo=518,Bu=519,Al=35044,Rl="300 es",bi=2e3,ws=2001;function zu(r){for(let e=r.length-1;e>=0;--e)if(r[e]>=65535)return!0;return!1}function Hu(r){return ArrayBuffer.isView(r)&&!(r instanceof DataView)}function As(r){return document.createElementNS("http://www.w3.org/1999/xhtml",r)}function Gu(){const r=As("canvas");return r.style.display="block",r}const Cl={};function Pl(...r){const e="THREE."+r.shift();console.log(e,...r)}function ph(r){const e=r[0];if(typeof e=="string"&&e.startsWith("TSL:")){const t=r[1];t&&t.isStackTrace?r[0]+=" "+t.getLocation():r[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return r}function Le(...r){r=ph(r);const e="THREE."+r.shift();{const t=r[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...r)}}function We(...r){r=ph(r);const e="THREE."+r.shift();{const t=r[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...r)}}function Vn(...r){const e=r.join(" ");e in Cl||(Cl[e]=!0,Le(...r))}function Vu(r,e,t){return new Promise(function(i,n){function s(){switch(r.clientWaitSync(e,r.SYNC_FLUSH_COMMANDS_BIT,0)){case r.WAIT_FAILED:n();break;case r.TIMEOUT_EXPIRED:setTimeout(s,t);break;default:i()}}setTimeout(s,t)})}const Wu={[Va]:Wa,[Xa]:Ka,[qa]:Za,[Yn]:Ya,[Wa]:Va,[Ka]:Xa,[Za]:qa,[Ya]:Yn};class tn{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){const i=this._listeners;return i===void 0?!1:i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){const i=this._listeners;if(i===void 0)return;const n=i[e];if(n!==void 0){const s=n.indexOf(t);s!==-1&&n.splice(s,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const i=t[e.type];if(i!==void 0){e.target=this;const n=i.slice(0);for(let s=0,a=n.length;s<a;s++)n[s].call(this,e);e.target=null}}}const It=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let Ll=1234567;const vs=Math.PI/180,Zn=180/Math.PI;function nn(){const r=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(It[r&255]+It[r>>8&255]+It[r>>16&255]+It[r>>24&255]+"-"+It[e&255]+It[e>>8&255]+"-"+It[e>>16&15|64]+It[e>>24&255]+"-"+It[t&63|128]+It[t>>8&255]+"-"+It[t>>16&255]+It[t>>24&255]+It[i&255]+It[i>>8&255]+It[i>>16&255]+It[i>>24&255]).toLowerCase()}function qe(r,e,t){return Math.max(e,Math.min(t,r))}function Wo(r,e){return(r%e+e)%e}function Xu(r,e,t,i,n){return i+(r-e)*(n-i)/(t-e)}function qu(r,e,t){return r!==e?(t-r)/(e-r):0}function ys(r,e,t){return(1-t)*r+t*e}function Yu(r,e,t,i){return ys(r,e,1-Math.exp(-t*i))}function Ku(r,e=1){return e-Math.abs(Wo(r,e*2)-e)}function Zu(r,e,t){return r<=e?0:r>=t?1:(r=(r-e)/(t-e),r*r*(3-2*r))}function $u(r,e,t){return r<=e?0:r>=t?1:(r=(r-e)/(t-e),r*r*r*(r*(r*6-15)+10))}function Ju(r,e){return r+Math.floor(Math.random()*(e-r+1))}function ju(r,e){return r+Math.random()*(e-r)}function Qu(r){return r*(.5-Math.random())}function ed(r){r!==void 0&&(Ll=r);let e=Ll+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function td(r){return r*vs}function id(r){return r*Zn}function nd(r){return(r&r-1)===0&&r!==0}function sd(r){return Math.pow(2,Math.ceil(Math.log(r)/Math.LN2))}function rd(r){return Math.pow(2,Math.floor(Math.log(r)/Math.LN2))}function ad(r,e,t,i,n){const s=Math.cos,a=Math.sin,o=s(t/2),c=a(t/2),l=s((e+i)/2),h=a((e+i)/2),d=s((e-i)/2),u=a((e-i)/2),f=s((i-e)/2),g=a((i-e)/2);switch(n){case"XYX":r.set(o*h,c*d,c*u,o*l);break;case"YZY":r.set(c*u,o*h,c*d,o*l);break;case"ZXZ":r.set(c*d,c*u,o*h,o*l);break;case"XZX":r.set(o*h,c*g,c*f,o*l);break;case"YXY":r.set(c*f,o*h,c*g,o*l);break;case"ZYZ":r.set(c*g,c*f,o*h,o*l);break;default:Le("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+n)}}function kn(r,e){switch(e.constructor){case Float32Array:return r;case Uint32Array:return r/4294967295;case Uint16Array:return r/65535;case Uint8Array:return r/255;case Int32Array:return Math.max(r/2147483647,-1);case Int16Array:return Math.max(r/32767,-1);case Int8Array:return Math.max(r/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function zt(r,e){switch(e.constructor){case Float32Array:return r;case Uint32Array:return Math.round(r*4294967295);case Uint16Array:return Math.round(r*65535);case Uint8Array:return Math.round(r*255);case Int32Array:return Math.round(r*2147483647);case Int16Array:return Math.round(r*32767);case Int8Array:return Math.round(r*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}const xi={DEG2RAD:vs,RAD2DEG:Zn,generateUUID:nn,clamp:qe,euclideanModulo:Wo,mapLinear:Xu,inverseLerp:qu,lerp:ys,damp:Yu,pingpong:Ku,smoothstep:Zu,smootherstep:$u,randInt:Ju,randFloat:ju,randFloatSpread:Qu,seededRandom:ed,degToRad:td,radToDeg:id,isPowerOfTwo:nd,ceilPowerOfTwo:sd,floorPowerOfTwo:rd,setQuaternionFromProperEuler:ad,normalize:zt,denormalize:kn},sl=class sl{constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,i=this.y,n=e.elements;return this.x=n[0]*t+n[3]*i+n[6],this.y=n[1]*t+n[4]*i+n[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=qe(this.x,e.x,t.x),this.y=qe(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=qe(this.x,e,t),this.y=qe(this.y,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(qe(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(qe(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const i=Math.cos(t),n=Math.sin(t),s=this.x-e.x,a=this.y-e.y;return this.x=s*i-a*n+e.x,this.y=s*n+a*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};sl.prototype.isVector2=!0;let De=sl;class Pt{constructor(e=0,t=0,i=0,n=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=n}static slerpFlat(e,t,i,n,s,a,o){let c=i[n+0],l=i[n+1],h=i[n+2],d=i[n+3],u=s[a+0],f=s[a+1],g=s[a+2],v=s[a+3];if(d!==v||c!==u||l!==f||h!==g){let m=c*u+l*f+h*g+d*v;m<0&&(u=-u,f=-f,g=-g,v=-v,m=-m);let p=1-o;if(m<.9995){const M=Math.acos(m),T=Math.sin(M);p=Math.sin(p*M)/T,o=Math.sin(o*M)/T,c=c*p+u*o,l=l*p+f*o,h=h*p+g*o,d=d*p+v*o}else{c=c*p+u*o,l=l*p+f*o,h=h*p+g*o,d=d*p+v*o;const M=1/Math.sqrt(c*c+l*l+h*h+d*d);c*=M,l*=M,h*=M,d*=M}}e[t]=c,e[t+1]=l,e[t+2]=h,e[t+3]=d}static multiplyQuaternionsFlat(e,t,i,n,s,a){const o=i[n],c=i[n+1],l=i[n+2],h=i[n+3],d=s[a],u=s[a+1],f=s[a+2],g=s[a+3];return e[t]=o*g+h*d+c*f-l*u,e[t+1]=c*g+h*u+l*d-o*f,e[t+2]=l*g+h*f+o*u-c*d,e[t+3]=h*g-o*d-c*u-l*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,n){return this._x=e,this._y=t,this._z=i,this._w=n,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const i=e._x,n=e._y,s=e._z,a=e._order,o=Math.cos,c=Math.sin,l=o(i/2),h=o(n/2),d=o(s/2),u=c(i/2),f=c(n/2),g=c(s/2);switch(a){case"XYZ":this._x=u*h*d+l*f*g,this._y=l*f*d-u*h*g,this._z=l*h*g+u*f*d,this._w=l*h*d-u*f*g;break;case"YXZ":this._x=u*h*d+l*f*g,this._y=l*f*d-u*h*g,this._z=l*h*g-u*f*d,this._w=l*h*d+u*f*g;break;case"ZXY":this._x=u*h*d-l*f*g,this._y=l*f*d+u*h*g,this._z=l*h*g+u*f*d,this._w=l*h*d-u*f*g;break;case"ZYX":this._x=u*h*d-l*f*g,this._y=l*f*d+u*h*g,this._z=l*h*g-u*f*d,this._w=l*h*d+u*f*g;break;case"YZX":this._x=u*h*d+l*f*g,this._y=l*f*d+u*h*g,this._z=l*h*g-u*f*d,this._w=l*h*d-u*f*g;break;case"XZY":this._x=u*h*d-l*f*g,this._y=l*f*d-u*h*g,this._z=l*h*g+u*f*d,this._w=l*h*d+u*f*g;break;default:Le("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const i=t/2,n=Math.sin(i);return this._x=e.x*n,this._y=e.y*n,this._z=e.z*n,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,i=t[0],n=t[4],s=t[8],a=t[1],o=t[5],c=t[9],l=t[2],h=t[6],d=t[10],u=i+o+d;if(u>0){const f=.5/Math.sqrt(u+1);this._w=.25/f,this._x=(h-c)*f,this._y=(s-l)*f,this._z=(a-n)*f}else if(i>o&&i>d){const f=2*Math.sqrt(1+i-o-d);this._w=(h-c)/f,this._x=.25*f,this._y=(n+a)/f,this._z=(s+l)/f}else if(o>d){const f=2*Math.sqrt(1+o-i-d);this._w=(s-l)/f,this._x=(n+a)/f,this._y=.25*f,this._z=(c+h)/f}else{const f=2*Math.sqrt(1+d-i-o);this._w=(a-n)/f,this._x=(s+l)/f,this._y=(c+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<1e-8?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(qe(this.dot(e),-1,1)))}rotateTowards(e,t){const i=this.angleTo(e);if(i===0)return this;const n=Math.min(1,t/i);return this.slerp(e,n),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const i=e._x,n=e._y,s=e._z,a=e._w,o=t._x,c=t._y,l=t._z,h=t._w;return this._x=i*h+a*o+n*l-s*c,this._y=n*h+a*c+s*o-i*l,this._z=s*h+a*l+i*c-n*o,this._w=a*h-i*o-n*c-s*l,this._onChangeCallback(),this}slerp(e,t){let i=e._x,n=e._y,s=e._z,a=e._w,o=this.dot(e);o<0&&(i=-i,n=-n,s=-s,a=-a,o=-o);let c=1-t;if(o<.9995){const l=Math.acos(o),h=Math.sin(l);c=Math.sin(c*l)/h,t=Math.sin(t*l)/h,this._x=this._x*c+i*t,this._y=this._y*c+n*t,this._z=this._z*c+s*t,this._w=this._w*c+a*t,this._onChangeCallback()}else this._x=this._x*c+i*t,this._y=this._y*c+n*t,this._z=this._z*c+s*t,this._w=this._w*c+a*t,this.normalize();return this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),n=Math.sqrt(1-i),s=Math.sqrt(i);return this.set(n*Math.sin(e),n*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}const rl=class rl{constructor(e=0,t=0,i=0){this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Nl.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Nl.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,i=this.y,n=this.z,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6]*n,this.y=s[1]*t+s[4]*i+s[7]*n,this.z=s[2]*t+s[5]*i+s[8]*n,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,i=this.y,n=this.z,s=e.elements,a=1/(s[3]*t+s[7]*i+s[11]*n+s[15]);return this.x=(s[0]*t+s[4]*i+s[8]*n+s[12])*a,this.y=(s[1]*t+s[5]*i+s[9]*n+s[13])*a,this.z=(s[2]*t+s[6]*i+s[10]*n+s[14])*a,this}applyQuaternion(e){const t=this.x,i=this.y,n=this.z,s=e.x,a=e.y,o=e.z,c=e.w,l=2*(a*n-o*i),h=2*(o*t-s*n),d=2*(s*i-a*t);return this.x=t+c*l+a*d-o*h,this.y=i+c*h+o*l-s*d,this.z=n+c*d+s*h-a*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,i=this.y,n=this.z,s=e.elements;return this.x=s[0]*t+s[4]*i+s[8]*n,this.y=s[1]*t+s[5]*i+s[9]*n,this.z=s[2]*t+s[6]*i+s[10]*n,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=qe(this.x,e.x,t.x),this.y=qe(this.y,e.y,t.y),this.z=qe(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=qe(this.x,e,t),this.y=qe(this.y,e,t),this.z=qe(this.z,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(qe(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const i=e.x,n=e.y,s=e.z,a=t.x,o=t.y,c=t.z;return this.x=n*c-s*o,this.y=s*a-i*c,this.z=i*o-n*a,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return na.copy(this).projectOnVector(e),this.sub(na)}reflect(e){return this.sub(na.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(qe(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y,n=this.z-e.z;return t*t+i*i+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){const n=Math.sin(t)*e;return this.x=n*Math.sin(i),this.y=Math.cos(t)*e,this.z=n*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),n=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=n,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};rl.prototype.isVector3=!0;let D=rl;const na=new D,Nl=new Pt,al=class al{constructor(e,t,i,n,s,a,o,c,l){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,n,s,a,o,c,l)}set(e,t,i,n,s,a,o,c,l){const h=this.elements;return h[0]=e,h[1]=n,h[2]=o,h[3]=t,h[4]=s,h[5]=c,h[6]=i,h[7]=a,h[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,n=t.elements,s=this.elements,a=i[0],o=i[3],c=i[6],l=i[1],h=i[4],d=i[7],u=i[2],f=i[5],g=i[8],v=n[0],m=n[3],p=n[6],M=n[1],T=n[4],y=n[7],E=n[2],w=n[5],A=n[8];return s[0]=a*v+o*M+c*E,s[3]=a*m+o*T+c*w,s[6]=a*p+o*y+c*A,s[1]=l*v+h*M+d*E,s[4]=l*m+h*T+d*w,s[7]=l*p+h*y+d*A,s[2]=u*v+f*M+g*E,s[5]=u*m+f*T+g*w,s[8]=u*p+f*y+g*A,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[1],n=e[2],s=e[3],a=e[4],o=e[5],c=e[6],l=e[7],h=e[8];return t*a*h-t*o*l-i*s*h+i*o*c+n*s*l-n*a*c}invert(){const e=this.elements,t=e[0],i=e[1],n=e[2],s=e[3],a=e[4],o=e[5],c=e[6],l=e[7],h=e[8],d=h*a-o*l,u=o*c-h*s,f=l*s-a*c,g=t*d+i*u+n*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const v=1/g;return e[0]=d*v,e[1]=(n*l-h*i)*v,e[2]=(o*i-n*a)*v,e[3]=u*v,e[4]=(h*t-n*c)*v,e[5]=(n*s-o*t)*v,e[6]=f*v,e[7]=(i*c-l*t)*v,e[8]=(a*t-i*s)*v,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,n,s,a,o){const c=Math.cos(s),l=Math.sin(s);return this.set(i*c,i*l,-i*(c*a+l*o)+a+e,-n*l,n*c,-n*(-l*a+c*o)+o+t,0,0,1),this}scale(e,t){return Vn("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(sa.makeScale(e,t)),this}rotate(e){return Vn("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(sa.makeRotation(-e)),this}translate(e,t){return Vn("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(sa.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,i=e.elements;for(let n=0;n<9;n++)if(t[n]!==i[n])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}};al.prototype.isMatrix3=!0;let ke=al;const sa=new ke,Dl=new ke().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Il=new ke().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function od(){const r={enabled:!0,workingColorSpace:Rr,spaces:{},convert:function(n,s,a){return this.enabled===!1||s===a||!s||!a||(this.spaces[s].transfer===je&&(n.r=Ui(n.r),n.g=Ui(n.g),n.b=Ui(n.b)),this.spaces[s].primaries!==this.spaces[a].primaries&&(n.applyMatrix3(this.spaces[s].toXYZ),n.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===je&&(n.r=Wn(n.r),n.g=Wn(n.g),n.b=Wn(n.b))),n},workingToColorSpace:function(n,s){return this.convert(n,this.workingColorSpace,s)},colorSpaceToWorking:function(n,s){return this.convert(n,s,this.workingColorSpace)},getPrimaries:function(n){return this.spaces[n].primaries},getTransfer:function(n){return n===Ji?Cr:this.spaces[n].transfer},getToneMappingMode:function(n){return this.spaces[n].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(n,s=this.workingColorSpace){return n.fromArray(this.spaces[s].luminanceCoefficients)},define:function(n){Object.assign(this.spaces,n)},_getMatrix:function(n,s,a){return n.copy(this.spaces[s].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(n){return this.spaces[n].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(n=this.workingColorSpace){return this.spaces[n].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(n,s){return Vn("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),r.workingToColorSpace(n,s)},toWorkingColorSpace:function(n,s){return Vn("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),r.colorSpaceToWorking(n,s)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],i=[.3127,.329];return r.define({[Rr]:{primaries:e,whitePoint:i,transfer:Cr,toXYZ:Dl,fromXYZ:Il,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:lt},outputColorSpaceConfig:{drawingBufferColorSpace:lt}},[lt]:{primaries:e,whitePoint:i,transfer:je,toXYZ:Dl,fromXYZ:Il,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:lt}}}),r}const Xe=od();function Ui(r){return r<.04045?r*.0773993808:Math.pow(r*.9478672986+.0521327014,2.4)}function Wn(r){return r<.0031308?r*12.92:1.055*Math.pow(r,.41666)-.055}let Sn;class ld{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let i;if(e instanceof HTMLCanvasElement)i=e;else{Sn===void 0&&(Sn=As("canvas")),Sn.width=e.width,Sn.height=e.height;const n=Sn.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),i=Sn}return i.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=As("canvas");t.width=e.width,t.height=e.height;const i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);const n=i.getImageData(0,0,e.width,e.height),s=n.data;for(let a=0;a<s.length;a++)s[a]=Ui(s[a]/255)*255;return i.putImageData(n,0,0),t}else if(e.data){const t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(Ui(t[i]/255)*255):t[i]=Ui(t[i]);return{data:t,width:e.width,height:e.height}}else return Le("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let cd=0;class Xo{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:cd++}),this.uuid=nn(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const i={uuid:this.uuid,url:""},n=this.data;if(n!==null){let s;if(Array.isArray(n)){s=[];for(let a=0,o=n.length;a<o;a++)n[a].isDataTexture?s.push(ra(n[a].image)):s.push(ra(n[a]))}else s=ra(n);i.url=s}return t||(e.images[this.uuid]=i),i}}function ra(r){return typeof HTMLImageElement<"u"&&r instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&r instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&r instanceof ImageBitmap?ld.getDataURL(r):r.data?{data:Array.from(r.data),width:r.width,height:r.height,type:r.data.constructor.name}:(Le("Texture: Unable to serialize Texture."),{})}let hd=0;const aa=new D;class Ot extends tn{constructor(e=Ot.DEFAULT_IMAGE,t=Ot.DEFAULT_MAPPING,i=Qt,n=Qt,s=St,a=Di,o=ri,c=jt,l=Ot.DEFAULT_ANISOTROPY,h=Ji){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:hd++}),this.uuid=nn(),this.name="",this.source=new Xo(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=n,this.magFilter=s,this.minFilter=a,this.anisotropy=l,this.format=o,this.internalFormat=null,this.type=c,this.offset=new De(0,0),this.repeat=new De(1,1),this.center=new De(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ke,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(aa).x}get height(){return this.source.getSize(aa).y}get depth(){return this.source.getSize(aa).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const i=e[t];if(i===void 0){Le(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const n=this[t];if(n===void 0){Le(`Texture.setValues(): property '${t}' does not exist.`);continue}n&&i&&n.isVector2&&i.isVector2||n&&i&&n.isVector3&&i.isVector3||n&&i&&n.isMatrix3&&i.isMatrix3?n.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==ah)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case pn:e.x=e.x-Math.floor(e.x);break;case Qt:e.x=e.x<0?0:1;break;case $a:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case pn:e.y=e.y-Math.floor(e.y);break;case Qt:e.y=e.y<0?0:1;break;case $a:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Ot.DEFAULT_IMAGE=null;Ot.DEFAULT_MAPPING=ah;Ot.DEFAULT_ANISOTROPY=1;const ol=class ol{constructor(e=0,t=0,i=0,n=1){this.x=e,this.y=t,this.z=i,this.w=n}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,n){return this.x=e,this.y=t,this.z=i,this.w=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,i=this.y,n=this.z,s=this.w,a=e.elements;return this.x=a[0]*t+a[4]*i+a[8]*n+a[12]*s,this.y=a[1]*t+a[5]*i+a[9]*n+a[13]*s,this.z=a[2]*t+a[6]*i+a[10]*n+a[14]*s,this.w=a[3]*t+a[7]*i+a[11]*n+a[15]*s,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,n,s;const c=e.elements,l=c[0],h=c[4],d=c[8],u=c[1],f=c[5],g=c[9],v=c[2],m=c[6],p=c[10];if(Math.abs(h-u)<.01&&Math.abs(d-v)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+u)<.1&&Math.abs(d+v)<.1&&Math.abs(g+m)<.1&&Math.abs(l+f+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const T=(l+1)/2,y=(f+1)/2,E=(p+1)/2,w=(h+u)/4,A=(d+v)/4,_=(g+m)/4;return T>y&&T>E?T<.01?(i=0,n=.707106781,s=.707106781):(i=Math.sqrt(T),n=w/i,s=A/i):y>E?y<.01?(i=.707106781,n=0,s=.707106781):(n=Math.sqrt(y),i=w/n,s=_/n):E<.01?(i=.707106781,n=.707106781,s=0):(s=Math.sqrt(E),i=A/s,n=_/s),this.set(i,n,s,t),this}let M=Math.sqrt((m-g)*(m-g)+(d-v)*(d-v)+(u-h)*(u-h));return Math.abs(M)<.001&&(M=1),this.x=(m-g)/M,this.y=(d-v)/M,this.z=(u-h)/M,this.w=Math.acos((l+f+p-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=qe(this.x,e.x,t.x),this.y=qe(this.y,e.y,t.y),this.z=qe(this.z,e.z,t.z),this.w=qe(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=qe(this.x,e,t),this.y=qe(this.y,e,t),this.z=qe(this.z,e,t),this.w=qe(this.w,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(qe(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};ol.prototype.isVector4=!0;let it=ol;class ud extends tn{constructor(e=1,t=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:St,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=i.depth,this.scissor=new it(0,0,e,t),this.scissorTest=!1,this.viewport=new it(0,0,e,t),this.textures=[];const n={width:e,height:t,depth:i.depth},s=new Ot(n),a=i.count;for(let o=0;o<a;o++)this.textures[o]=s.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(e={}){const t={minFilter:St,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let n=0,s=this.textures.length;n<s;n++)this.textures[n].image.width=e,this.textures[n].image.height=t,this.textures[n].image.depth=i,this.textures[n].isData3DTexture!==!0&&(this.textures[n].isArrayTexture=this.textures[n].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,i=e.textures.length;t<i;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const n=Object.assign({},e.textures[t].image);this.textures[t].source=new Xo(n)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Si extends ud{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}}class mh extends Ot{constructor(e=null,t=1,i=1,n=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:n},this.magFilter=Nt,this.minFilter=Nt,this.wrapR=Qt,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class dd extends Ot{constructor(e=null,t=1,i=1,n=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:n},this.magFilter=Nt,this.minFilter=Nt,this.wrapR=Qt,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const Hr=class Hr{constructor(e,t,i,n,s,a,o,c,l,h,d,u,f,g,v,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,n,s,a,o,c,l,h,d,u,f,g,v,m)}set(e,t,i,n,s,a,o,c,l,h,d,u,f,g,v,m){const p=this.elements;return p[0]=e,p[4]=t,p[8]=i,p[12]=n,p[1]=s,p[5]=a,p[9]=o,p[13]=c,p[2]=l,p[6]=h,p[10]=d,p[14]=u,p[3]=f,p[7]=g,p[11]=v,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Hr().fromArray(this.elements)}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){const t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),i.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();const t=this.elements,i=e.elements,n=1/En.setFromMatrixColumn(e,0).length(),s=1/En.setFromMatrixColumn(e,1).length(),a=1/En.setFromMatrixColumn(e,2).length();return t[0]=i[0]*n,t[1]=i[1]*n,t[2]=i[2]*n,t[3]=0,t[4]=i[4]*s,t[5]=i[5]*s,t[6]=i[6]*s,t[7]=0,t[8]=i[8]*a,t[9]=i[9]*a,t[10]=i[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,i=e.x,n=e.y,s=e.z,a=Math.cos(i),o=Math.sin(i),c=Math.cos(n),l=Math.sin(n),h=Math.cos(s),d=Math.sin(s);if(e.order==="XYZ"){const u=a*h,f=a*d,g=o*h,v=o*d;t[0]=c*h,t[4]=-c*d,t[8]=l,t[1]=f+g*l,t[5]=u-v*l,t[9]=-o*c,t[2]=v-u*l,t[6]=g+f*l,t[10]=a*c}else if(e.order==="YXZ"){const u=c*h,f=c*d,g=l*h,v=l*d;t[0]=u+v*o,t[4]=g*o-f,t[8]=a*l,t[1]=a*d,t[5]=a*h,t[9]=-o,t[2]=f*o-g,t[6]=v+u*o,t[10]=a*c}else if(e.order==="ZXY"){const u=c*h,f=c*d,g=l*h,v=l*d;t[0]=u-v*o,t[4]=-a*d,t[8]=g+f*o,t[1]=f+g*o,t[5]=a*h,t[9]=v-u*o,t[2]=-a*l,t[6]=o,t[10]=a*c}else if(e.order==="ZYX"){const u=a*h,f=a*d,g=o*h,v=o*d;t[0]=c*h,t[4]=g*l-f,t[8]=u*l+v,t[1]=c*d,t[5]=v*l+u,t[9]=f*l-g,t[2]=-l,t[6]=o*c,t[10]=a*c}else if(e.order==="YZX"){const u=a*c,f=a*l,g=o*c,v=o*l;t[0]=c*h,t[4]=v-u*d,t[8]=g*d+f,t[1]=d,t[5]=a*h,t[9]=-o*h,t[2]=-l*h,t[6]=f*d+g,t[10]=u-v*d}else if(e.order==="XZY"){const u=a*c,f=a*l,g=o*c,v=o*l;t[0]=c*h,t[4]=-d,t[8]=l*h,t[1]=u*d+v,t[5]=a*h,t[9]=f*d-g,t[2]=g*d-f,t[6]=o*h,t[10]=v*d+u}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(fd,e,pd)}lookAt(e,t,i){const n=this.elements;return Kt.subVectors(e,t),Kt.lengthSq()===0&&(Kt.z=1),Kt.normalize(),Gi.crossVectors(i,Kt),Gi.lengthSq()===0&&(Math.abs(i.z)===1?Kt.x+=1e-4:Kt.z+=1e-4,Kt.normalize(),Gi.crossVectors(i,Kt)),Gi.normalize(),Os.crossVectors(Kt,Gi),n[0]=Gi.x,n[4]=Os.x,n[8]=Kt.x,n[1]=Gi.y,n[5]=Os.y,n[9]=Kt.y,n[2]=Gi.z,n[6]=Os.z,n[10]=Kt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,n=t.elements,s=this.elements,a=i[0],o=i[4],c=i[8],l=i[12],h=i[1],d=i[5],u=i[9],f=i[13],g=i[2],v=i[6],m=i[10],p=i[14],M=i[3],T=i[7],y=i[11],E=i[15],w=n[0],A=n[4],_=n[8],S=n[12],P=n[1],R=n[5],L=n[9],H=n[13],K=n[2],F=n[6],N=n[10],B=n[14],Y=n[3],j=n[7],se=n[11],ne=n[15];return s[0]=a*w+o*P+c*K+l*Y,s[4]=a*A+o*R+c*F+l*j,s[8]=a*_+o*L+c*N+l*se,s[12]=a*S+o*H+c*B+l*ne,s[1]=h*w+d*P+u*K+f*Y,s[5]=h*A+d*R+u*F+f*j,s[9]=h*_+d*L+u*N+f*se,s[13]=h*S+d*H+u*B+f*ne,s[2]=g*w+v*P+m*K+p*Y,s[6]=g*A+v*R+m*F+p*j,s[10]=g*_+v*L+m*N+p*se,s[14]=g*S+v*H+m*B+p*ne,s[3]=M*w+T*P+y*K+E*Y,s[7]=M*A+T*R+y*F+E*j,s[11]=M*_+T*L+y*N+E*se,s[15]=M*S+T*H+y*B+E*ne,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[4],n=e[8],s=e[12],a=e[1],o=e[5],c=e[9],l=e[13],h=e[2],d=e[6],u=e[10],f=e[14],g=e[3],v=e[7],m=e[11],p=e[15],M=c*f-l*u,T=o*f-l*d,y=o*u-c*d,E=a*f-l*h,w=a*u-c*h,A=a*d-o*h;return t*(v*M-m*T+p*y)-i*(g*M-m*E+p*w)+n*(g*T-v*E+p*A)-s*(g*y-v*w+m*A)}determinantAffine(){const e=this.elements,t=e[0],i=e[4],n=e[8],s=e[1],a=e[5],o=e[9],c=e[2],l=e[6],h=e[10];return t*(a*h-o*l)-i*(s*h-o*c)+n*(s*l-a*c)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){const n=this.elements;return e.isVector3?(n[12]=e.x,n[13]=e.y,n[14]=e.z):(n[12]=e,n[13]=t,n[14]=i),this}invert(){const e=this.elements,t=e[0],i=e[1],n=e[2],s=e[3],a=e[4],o=e[5],c=e[6],l=e[7],h=e[8],d=e[9],u=e[10],f=e[11],g=e[12],v=e[13],m=e[14],p=e[15],M=t*o-i*a,T=t*c-n*a,y=t*l-s*a,E=i*c-n*o,w=i*l-s*o,A=n*l-s*c,_=h*v-d*g,S=h*m-u*g,P=h*p-f*g,R=d*m-u*v,L=d*p-f*v,H=u*p-f*m,K=M*H-T*L+y*R+E*P-w*S+A*_;if(K===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const F=1/K;return e[0]=(o*H-c*L+l*R)*F,e[1]=(n*L-i*H-s*R)*F,e[2]=(v*A-m*w+p*E)*F,e[3]=(u*w-d*A-f*E)*F,e[4]=(c*P-a*H-l*S)*F,e[5]=(t*H-n*P+s*S)*F,e[6]=(m*y-g*A-p*T)*F,e[7]=(h*A-u*y+f*T)*F,e[8]=(a*L-o*P+l*_)*F,e[9]=(i*P-t*L-s*_)*F,e[10]=(g*w-v*y+p*M)*F,e[11]=(d*y-h*w-f*M)*F,e[12]=(o*S-a*R-c*_)*F,e[13]=(t*R-i*S+n*_)*F,e[14]=(v*T-g*E-m*M)*F,e[15]=(h*E-d*T+u*M)*F,this}scale(e){const t=this.elements,i=e.x,n=e.y,s=e.z;return t[0]*=i,t[4]*=n,t[8]*=s,t[1]*=i,t[5]*=n,t[9]*=s,t[2]*=i,t[6]*=n,t[10]*=s,t[3]*=i,t[7]*=n,t[11]*=s,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],n=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,n))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const i=Math.cos(t),n=Math.sin(t),s=1-i,a=e.x,o=e.y,c=e.z,l=s*a,h=s*o;return this.set(l*a+i,l*o-n*c,l*c+n*o,0,l*o+n*c,h*o+i,h*c-n*a,0,l*c-n*o,h*c+n*a,s*c*c+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,n,s,a){return this.set(1,i,s,0,e,1,a,0,t,n,1,0,0,0,0,1),this}compose(e,t,i){const n=this.elements,s=t._x,a=t._y,o=t._z,c=t._w,l=s+s,h=a+a,d=o+o,u=s*l,f=s*h,g=s*d,v=a*h,m=a*d,p=o*d,M=c*l,T=c*h,y=c*d,E=i.x,w=i.y,A=i.z;return n[0]=(1-(v+p))*E,n[1]=(f+y)*E,n[2]=(g-T)*E,n[3]=0,n[4]=(f-y)*w,n[5]=(1-(u+p))*w,n[6]=(m+M)*w,n[7]=0,n[8]=(g+T)*A,n[9]=(m-M)*A,n[10]=(1-(u+v))*A,n[11]=0,n[12]=e.x,n[13]=e.y,n[14]=e.z,n[15]=1,this}decompose(e,t,i){const n=this.elements;e.x=n[12],e.y=n[13],e.z=n[14];const s=this.determinantAffine();if(s===0)return i.set(1,1,1),t.identity(),this;let a=En.set(n[0],n[1],n[2]).length();const o=En.set(n[4],n[5],n[6]).length(),c=En.set(n[8],n[9],n[10]).length();s<0&&(a=-a),ai.copy(this);const l=1/a,h=1/o,d=1/c;return ai.elements[0]*=l,ai.elements[1]*=l,ai.elements[2]*=l,ai.elements[4]*=h,ai.elements[5]*=h,ai.elements[6]*=h,ai.elements[8]*=d,ai.elements[9]*=d,ai.elements[10]*=d,t.setFromRotationMatrix(ai),i.x=a,i.y=o,i.z=c,this}makePerspective(e,t,i,n,s,a,o=bi,c=!1){const l=this.elements,h=2*s/(t-e),d=2*s/(i-n),u=(t+e)/(t-e),f=(i+n)/(i-n);let g,v;if(c)g=s/(a-s),v=a*s/(a-s);else if(o===bi)g=-(a+s)/(a-s),v=-2*a*s/(a-s);else if(o===ws)g=-a/(a-s),v=-a*s/(a-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=h,l[4]=0,l[8]=u,l[12]=0,l[1]=0,l[5]=d,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=g,l[14]=v,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,i,n,s,a,o=bi,c=!1){const l=this.elements,h=2/(t-e),d=2/(i-n),u=-(t+e)/(t-e),f=-(i+n)/(i-n);let g,v;if(c)g=1/(a-s),v=a/(a-s);else if(o===bi)g=-2/(a-s),v=-(a+s)/(a-s);else if(o===ws)g=-1/(a-s),v=-s/(a-s);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=h,l[4]=0,l[8]=0,l[12]=u,l[1]=0,l[5]=d,l[9]=0,l[13]=f,l[2]=0,l[6]=0,l[10]=g,l[14]=v,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const t=this.elements,i=e.elements;for(let n=0;n<16;n++)if(t[n]!==i[n])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}};Hr.prototype.isMatrix4=!0;let Oe=Hr;const En=new D,ai=new Oe,fd=new D(0,0,0),pd=new D(1,1,1),Gi=new D,Os=new D,Kt=new D,Ul=new Oe,Fl=new Pt;class ui{constructor(e=0,t=0,i=0,n=ui.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=n}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,n=this._order){return this._x=e,this._y=t,this._z=i,this._order=n,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){const n=e.elements,s=n[0],a=n[4],o=n[8],c=n[1],l=n[5],h=n[9],d=n[2],u=n[6],f=n[10];switch(t){case"XYZ":this._y=Math.asin(qe(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-a,s)):(this._x=Math.atan2(u,l),this._z=0);break;case"YXZ":this._x=Math.asin(-qe(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-d,s),this._z=0);break;case"ZXY":this._x=Math.asin(qe(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-d,f),this._z=Math.atan2(-a,l)):(this._y=0,this._z=Math.atan2(c,s));break;case"ZYX":this._y=Math.asin(-qe(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(u,f),this._z=Math.atan2(c,s)):(this._x=0,this._z=Math.atan2(-a,l));break;case"YZX":this._z=Math.asin(qe(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-h,l),this._y=Math.atan2(-d,s)):(this._x=0,this._y=Math.atan2(o,f));break;case"XZY":this._z=Math.asin(-qe(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(u,l),this._y=Math.atan2(o,s)):(this._x=Math.atan2(-h,f),this._y=0);break;default:Le("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return Ul.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Ul,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Fl.setFromEuler(this),this.setFromQuaternion(Fl,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}ui.DEFAULT_ORDER="XYZ";class gh{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let md=0;const Ol=new D,Tn=new Pt,wi=new Oe,ks=new D,rs=new D,gd=new D,_d=new Pt,kl=new D(1,0,0),Bl=new D(0,1,0),zl=new D(0,0,1),Hl={type:"added"},xd={type:"removed"},wn={type:"childadded",child:null},oa={type:"childremoved",child:null};class ft extends tn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:md++}),this.uuid=nn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=ft.DEFAULT_UP.clone();const e=new D,t=new ui,i=new Pt,n=new D(1,1,1);function s(){i.setFromEuler(t,!1)}function a(){t.setFromQuaternion(i,void 0,!1)}t._onChange(s),i._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:n},modelViewMatrix:{value:new Oe},normalMatrix:{value:new ke}}),this.matrix=new Oe,this.matrixWorld=new Oe,this.matrixAutoUpdate=ft.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=ft.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new gh,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Tn.setFromAxisAngle(e,t),this.quaternion.multiply(Tn),this}rotateOnWorldAxis(e,t){return Tn.setFromAxisAngle(e,t),this.quaternion.premultiply(Tn),this}rotateX(e){return this.rotateOnAxis(kl,e)}rotateY(e){return this.rotateOnAxis(Bl,e)}rotateZ(e){return this.rotateOnAxis(zl,e)}translateOnAxis(e,t){return Ol.copy(e).applyQuaternion(this.quaternion),this.position.add(Ol.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(kl,e)}translateY(e){return this.translateOnAxis(Bl,e)}translateZ(e){return this.translateOnAxis(zl,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(wi.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?ks.copy(e):ks.set(e,t,i);const n=this.parent;this.updateWorldMatrix(!0,!1),rs.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?wi.lookAt(rs,ks,this.up):wi.lookAt(ks,rs,this.up),this.quaternion.setFromRotationMatrix(wi),n&&(wi.extractRotation(n.matrixWorld),Tn.setFromRotationMatrix(wi),this.quaternion.premultiply(Tn.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(We("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Hl),wn.child=e,this.dispatchEvent(wn),wn.child=null):We("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(xd),oa.child=e,this.dispatchEvent(oa),oa.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),wi.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),wi.multiply(e.parent.matrixWorld)),e.applyMatrix4(wi),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Hl),wn.child=e,this.dispatchEvent(wn),wn.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,n=this.children.length;i<n;i++){const a=this.children[i].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);const n=this.children;for(let s=0,a=n.length;s<a;s++)n[s].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(rs,e,gd),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(rs,_d,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let i=0,n=t.length;i<n;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let i=0,n=t.length;i<n;i++)t[i].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);const e=this.pivot;if(e!==null){const t=e.x,i=e.y,n=e.z,s=this.matrix.elements;s[12]+=t-s[0]*t-s[4]*i-s[8]*n,s[13]+=i-s[1]*t-s[5]*i-s[9]*n,s[14]+=n-s[2]*t-s[6]*i-s[10]*n}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let i=0,n=t.length;i<n;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t,i=!1){const n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||i)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,i=!0),t===!0){const s=this.children;for(let a=0,o=s.length;a<o;a++)s[a].updateWorldMatrix(!1,!0,i)}}toJSON(e){const t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const n={};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.castShadow===!0&&(n.castShadow=!0),this.receiveShadow===!0&&(n.receiveShadow=!0),this.visible===!1&&(n.visible=!1),this.frustumCulled===!1&&(n.frustumCulled=!1),this.renderOrder!==0&&(n.renderOrder=this.renderOrder),this.static!==!1&&(n.static=this.static),Object.keys(this.userData).length>0&&(n.userData=this.userData),n.layers=this.layers.mask,n.matrix=this.matrix.toArray(),n.up=this.up.toArray(),this.pivot!==null&&(n.pivot=this.pivot.toArray()),this.matrixAutoUpdate===!1&&(n.matrixAutoUpdate=!1),this.morphTargetDictionary!==void 0&&(n.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(n.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(n.type="InstancedMesh",n.count=this.count,n.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(n.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(n.type="BatchedMesh",n.perObjectFrustumCulled=this.perObjectFrustumCulled,n.sortObjects=this.sortObjects,n.drawRanges=this._drawRanges,n.reservedRanges=this._reservedRanges,n.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),n.instanceInfo=this._instanceInfo.map(o=>({...o})),n.availableInstanceIds=this._availableInstanceIds.slice(),n.availableGeometryIds=this._availableGeometryIds.slice(),n.nextIndexStart=this._nextIndexStart,n.nextVertexStart=this._nextVertexStart,n.geometryCount=this._geometryCount,n.maxInstanceCount=this._maxInstanceCount,n.maxVertexCount=this._maxVertexCount,n.maxIndexCount=this._maxIndexCount,n.geometryInitialized=this._geometryInitialized,n.matricesTexture=this._matricesTexture.toJSON(e),n.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(n.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(n.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(n.boundingBox=this.boundingBox.toJSON()));function s(o,c){return o[c.uuid]===void 0&&(o[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?n.background=this.background.toJSON():this.background.isTexture&&(n.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(n.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){n.geometry=s(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const c=o.shapes;if(Array.isArray(c))for(let l=0,h=c.length;l<h;l++){const d=c[l];s(e.shapes,d)}else s(e.shapes,c)}}if(this.isSkinnedMesh&&(n.bindMode=this.bindMode,n.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),n.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let c=0,l=this.material.length;c<l;c++)o.push(s(e.materials,this.material[c]));n.material=o}else n.material=s(e.materials,this.material);if(this.children.length>0){n.children=[];for(let o=0;o<this.children.length;o++)n.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){n.animations=[];for(let o=0;o<this.animations.length;o++){const c=this.animations[o];n.animations.push(s(e.animations,c))}}if(t){const o=a(e.geometries),c=a(e.materials),l=a(e.textures),h=a(e.images),d=a(e.shapes),u=a(e.skeletons),f=a(e.animations),g=a(e.nodes);o.length>0&&(i.geometries=o),c.length>0&&(i.materials=c),l.length>0&&(i.textures=l),h.length>0&&(i.images=h),d.length>0&&(i.shapes=d),u.length>0&&(i.skeletons=u),f.length>0&&(i.animations=f),g.length>0&&(i.nodes=g)}return i.object=n,i;function a(o){const c=[];for(const l in o){const h=o[l];delete h.metadata,c.push(h)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){const n=e.children[i];this.add(n.clone())}return this}}ft.DEFAULT_UP=new D(0,1,0);ft.DEFAULT_MATRIX_AUTO_UPDATE=!0;ft.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class ji extends ft{constructor(){super(),this.isGroup=!0,this.type="Group"}}const vd={type:"move"};class la{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new ji,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new ji,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new D,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new D),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new ji,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new D,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new D,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let n=null,s=null,a=null;const o=this._targetRay,c=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){a=!0;for(const v of e.hand.values()){const m=t.getJointPose(v,i),p=this._getHandJoint(l,v);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}const h=l.joints["index-finger-tip"],d=l.joints["thumb-tip"],u=h.position.distanceTo(d.position),f=.02,g=.005;l.inputState.pinching&&u>f+g?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&u<=f-g&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,i),s!==null&&(c.matrix.fromArray(s.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,s.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(s.linearVelocity)):c.hasLinearVelocity=!1,s.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(s.angularVelocity)):c.hasAngularVelocity=!1,c.eventsEnabled&&c.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(n=t.getPose(e.targetRaySpace,i),n===null&&s!==null&&(n=s),n!==null&&(o.matrix.fromArray(n.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,n.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(n.linearVelocity)):o.hasLinearVelocity=!1,n.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(n.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(vd)))}return o!==null&&(o.visible=n!==null),c!==null&&(c.visible=s!==null),l!==null&&(l.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const i=new ji;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}}const _h={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Vi={h:0,s:0,l:0},Bs={h:0,s:0,l:0};function ca(r,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?r+(e-r)*6*t:t<1/2?e:t<2/3?r+(e-r)*6*(2/3-t):r}class Be{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){const n=e;n&&n.isColor?this.copy(n):typeof n=="number"?this.setHex(n):typeof n=="string"&&this.setStyle(n)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=lt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Xe.colorSpaceToWorking(this,t),this}setRGB(e,t,i,n=Xe.workingColorSpace){return this.r=e,this.g=t,this.b=i,Xe.colorSpaceToWorking(this,n),this}setHSL(e,t,i,n=Xe.workingColorSpace){if(e=Wo(e,1),t=qe(t,0,1),i=qe(i,0,1),t===0)this.r=this.g=this.b=i;else{const s=i<=.5?i*(1+t):i+t-i*t,a=2*i-s;this.r=ca(a,s,e+1/3),this.g=ca(a,s,e),this.b=ca(a,s,e-1/3)}return Xe.colorSpaceToWorking(this,n),this}setStyle(e,t=lt){function i(s){s!==void 0&&parseFloat(s)<1&&Le("Color: Alpha component of "+e+" will be ignored.")}let n;if(n=/^(\w+)\(([^\)]*)\)/.exec(e)){let s;const a=n[1],o=n[2];switch(a){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:Le("Color: Unknown color model "+e)}}else if(n=/^\#([A-Fa-f\d]+)$/.exec(e)){const s=n[1],a=s.length;if(a===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(s,16),t);Le("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=lt){const i=_h[e.toLowerCase()];return i!==void 0?this.setHex(i,t):Le("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Ui(e.r),this.g=Ui(e.g),this.b=Ui(e.b),this}copyLinearToSRGB(e){return this.r=Wn(e.r),this.g=Wn(e.g),this.b=Wn(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=lt){return Xe.workingToColorSpace(Ut.copy(this),e),Math.round(qe(Ut.r*255,0,255))*65536+Math.round(qe(Ut.g*255,0,255))*256+Math.round(qe(Ut.b*255,0,255))}getHexString(e=lt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Xe.workingColorSpace){Xe.workingToColorSpace(Ut.copy(this),t);const i=Ut.r,n=Ut.g,s=Ut.b,a=Math.max(i,n,s),o=Math.min(i,n,s);let c,l;const h=(o+a)/2;if(o===a)c=0,l=0;else{const d=a-o;switch(l=h<=.5?d/(a+o):d/(2-a-o),a){case i:c=(n-s)/d+(n<s?6:0);break;case n:c=(s-i)/d+2;break;case s:c=(i-n)/d+4;break}c/=6}return e.h=c,e.s=l,e.l=h,e}getRGB(e,t=Xe.workingColorSpace){return Xe.workingToColorSpace(Ut.copy(this),t),e.r=Ut.r,e.g=Ut.g,e.b=Ut.b,e}getStyle(e=lt){Xe.workingToColorSpace(Ut.copy(this),e);const t=Ut.r,i=Ut.g,n=Ut.b;return e!==lt?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${n.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(n*255)})`}offsetHSL(e,t,i){return this.getHSL(Vi),this.setHSL(Vi.h+e,Vi.s+t,Vi.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(Vi),e.getHSL(Bs);const i=ys(Vi.h,Bs.h,t),n=ys(Vi.s,Bs.s,t),s=ys(Vi.l,Bs.l,t);return this.setHSL(i,n,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,i=this.g,n=this.b,s=e.elements;return this.r=s[0]*t+s[3]*i+s[6]*n,this.g=s[1]*t+s[4]*i+s[7]*n,this.b=s[2]*t+s[5]*i+s[8]*n,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Ut=new Be;Be.NAMES=_h;class xh extends ft{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new ui,this.environmentIntensity=1,this.environmentRotation=new ui,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}const oi=new D,Ai=new D,ha=new D,Ri=new D,An=new D,Rn=new D,Gl=new D,ua=new D,da=new D,fa=new D,pa=new it,ma=new it,ga=new it;class si{constructor(e=new D,t=new D,i=new D){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,n){n.subVectors(i,t),oi.subVectors(e,t),n.cross(oi);const s=n.lengthSq();return s>0?n.multiplyScalar(1/Math.sqrt(s)):n.set(0,0,0)}static getBarycoord(e,t,i,n,s){oi.subVectors(n,t),Ai.subVectors(i,t),ha.subVectors(e,t);const a=oi.dot(oi),o=oi.dot(Ai),c=oi.dot(ha),l=Ai.dot(Ai),h=Ai.dot(ha),d=a*l-o*o;if(d===0)return s.set(0,0,0),null;const u=1/d,f=(l*c-o*h)*u,g=(a*h-o*c)*u;return s.set(1-f-g,g,f)}static containsPoint(e,t,i,n){return this.getBarycoord(e,t,i,n,Ri)===null?!1:Ri.x>=0&&Ri.y>=0&&Ri.x+Ri.y<=1}static getInterpolation(e,t,i,n,s,a,o,c){return this.getBarycoord(e,t,i,n,Ri)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(s,Ri.x),c.addScaledVector(a,Ri.y),c.addScaledVector(o,Ri.z),c)}static getInterpolatedAttribute(e,t,i,n,s,a){return pa.setScalar(0),ma.setScalar(0),ga.setScalar(0),pa.fromBufferAttribute(e,t),ma.fromBufferAttribute(e,i),ga.fromBufferAttribute(e,n),a.setScalar(0),a.addScaledVector(pa,s.x),a.addScaledVector(ma,s.y),a.addScaledVector(ga,s.z),a}static isFrontFacing(e,t,i,n){return oi.subVectors(i,t),Ai.subVectors(e,t),oi.cross(Ai).dot(n)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,n){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[n]),this}setFromAttributeAndIndices(e,t,i,n){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,n),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return oi.subVectors(this.c,this.b),Ai.subVectors(this.a,this.b),oi.cross(Ai).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return si.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return si.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,n,s){return si.getInterpolation(e,this.a,this.b,this.c,t,i,n,s)}containsPoint(e){return si.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return si.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const i=this.a,n=this.b,s=this.c;let a,o;An.subVectors(n,i),Rn.subVectors(s,i),ua.subVectors(e,i);const c=An.dot(ua),l=Rn.dot(ua);if(c<=0&&l<=0)return t.copy(i);da.subVectors(e,n);const h=An.dot(da),d=Rn.dot(da);if(h>=0&&d<=h)return t.copy(n);const u=c*d-h*l;if(u<=0&&c>=0&&h<=0)return a=c/(c-h),t.copy(i).addScaledVector(An,a);fa.subVectors(e,s);const f=An.dot(fa),g=Rn.dot(fa);if(g>=0&&f<=g)return t.copy(s);const v=f*l-c*g;if(v<=0&&l>=0&&g<=0)return o=l/(l-g),t.copy(i).addScaledVector(Rn,o);const m=h*g-f*d;if(m<=0&&d-h>=0&&f-g>=0)return Gl.subVectors(s,n),o=(d-h)/(d-h+(f-g)),t.copy(n).addScaledVector(Gl,o);const p=1/(m+v+u);return a=v*p,o=u*p,t.copy(i).addScaledVector(An,a).addScaledVector(Rn,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}class Qn{constructor(e=new D(1/0,1/0,1/0),t=new D(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(li.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(li.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const i=li.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const i=e.geometry;if(i!==void 0){const s=i.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=s.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,li):li.fromBufferAttribute(s,a),li.applyMatrix4(e.matrixWorld),this.expandByPoint(li);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),zs.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),zs.copy(i.boundingBox)),zs.applyMatrix4(e.matrixWorld),this.union(zs)}const n=e.children;for(let s=0,a=n.length;s<a;s++)this.expandByObject(n[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,li),li.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(as),Hs.subVectors(this.max,as),Cn.subVectors(e.a,as),Pn.subVectors(e.b,as),Ln.subVectors(e.c,as),Wi.subVectors(Pn,Cn),Xi.subVectors(Ln,Pn),an.subVectors(Cn,Ln);let t=[0,-Wi.z,Wi.y,0,-Xi.z,Xi.y,0,-an.z,an.y,Wi.z,0,-Wi.x,Xi.z,0,-Xi.x,an.z,0,-an.x,-Wi.y,Wi.x,0,-Xi.y,Xi.x,0,-an.y,an.x,0];return!_a(t,Cn,Pn,Ln,Hs)||(t=[1,0,0,0,1,0,0,0,1],!_a(t,Cn,Pn,Ln,Hs))?!1:(Gs.crossVectors(Wi,Xi),t=[Gs.x,Gs.y,Gs.z],_a(t,Cn,Pn,Ln,Hs))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,li).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(li).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Ci[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Ci[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Ci[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Ci[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Ci[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Ci[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Ci[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Ci[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Ci),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const Ci=[new D,new D,new D,new D,new D,new D,new D,new D],li=new D,zs=new Qn,Cn=new D,Pn=new D,Ln=new D,Wi=new D,Xi=new D,an=new D,as=new D,Hs=new D,Gs=new D,on=new D;function _a(r,e,t,i,n){for(let s=0,a=r.length-3;s<=a;s+=3){on.fromArray(r,s);const o=n.x*Math.abs(on.x)+n.y*Math.abs(on.y)+n.z*Math.abs(on.z),c=e.dot(on),l=t.dot(on),h=i.dot(on);if(Math.max(-Math.max(c,l,h),Math.min(c,l,h))>o)return!1}return!0}const yt=new D,Vs=new De;let yd=0;class ei extends tn{constructor(e,t,i=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:yd++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=Al,this.updateRanges=[],this.gpuType=ci,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let n=0,s=this.itemSize;n<s;n++)this.array[e+n]=t.array[i+n];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)Vs.fromBufferAttribute(this,t),Vs.applyMatrix3(e),this.setXY(t,Vs.x,Vs.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)yt.fromBufferAttribute(this,t),yt.applyMatrix3(e),this.setXYZ(t,yt.x,yt.y,yt.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)yt.fromBufferAttribute(this,t),yt.applyMatrix4(e),this.setXYZ(t,yt.x,yt.y,yt.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)yt.fromBufferAttribute(this,t),yt.applyNormalMatrix(e),this.setXYZ(t,yt.x,yt.y,yt.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)yt.fromBufferAttribute(this,t),yt.transformDirection(e),this.setXYZ(t,yt.x,yt.y,yt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=kn(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=zt(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=kn(t,this.array)),t}setX(e,t){return this.normalized&&(t=zt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=kn(t,this.array)),t}setY(e,t){return this.normalized&&(t=zt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=kn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=zt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=kn(t,this.array)),t}setW(e,t){return this.normalized&&(t=zt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=zt(t,this.array),i=zt(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,n){return e*=this.itemSize,this.normalized&&(t=zt(t,this.array),i=zt(i,this.array),n=zt(n,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=n,this}setXYZW(e,t,i,n,s){return e*=this.itemSize,this.normalized&&(t=zt(t,this.array),i=zt(i,this.array),n=zt(n,this.array),s=zt(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=n,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Al&&(e.usage=this.usage),e}dispose(){this.dispatchEvent({type:"dispose"})}}class vh extends ei{constructor(e,t,i){super(new Uint16Array(e),t,i)}}class yh extends ei{constructor(e,t,i){super(new Uint32Array(e),t,i)}}class tt extends ei{constructor(e,t,i){super(new Float32Array(e),t,i)}}const bd=new Qn,os=new D,xa=new D;class es{constructor(e=new D,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const i=this.center;t!==void 0?i.copy(t):bd.setFromPoints(e).getCenter(i);let n=0;for(let s=0,a=e.length;s<a;s++)n=Math.max(n,i.distanceToSquared(e[s]));return this.radius=Math.sqrt(n),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;os.subVectors(e,this.center);const t=os.lengthSq();if(t>this.radius*this.radius){const i=Math.sqrt(t),n=(i-this.radius)*.5;this.center.addScaledVector(os,n/i),this.radius+=n}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(xa.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(os.copy(e.center).add(xa)),this.expandByPoint(os.copy(e.center).sub(xa))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}let Md=0;const ii=new Oe,va=new ft,Nn=new D,Zt=new Qn,ls=new Qn,Rt=new D;class kt extends tn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Md++}),this.uuid=nn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(zu(e)?yh:vh)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const s=new ke().getNormalMatrix(e);i.applyNormalMatrix(s),i.needsUpdate=!0}const n=this.attributes.tangent;return n!==void 0&&(n.transformDirection(e),n.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return ii.makeRotationFromQuaternion(e),this.applyMatrix4(ii),this}rotateX(e){return ii.makeRotationX(e),this.applyMatrix4(ii),this}rotateY(e){return ii.makeRotationY(e),this.applyMatrix4(ii),this}rotateZ(e){return ii.makeRotationZ(e),this.applyMatrix4(ii),this}translate(e,t,i){return ii.makeTranslation(e,t,i),this.applyMatrix4(ii),this}scale(e,t,i){return ii.makeScale(e,t,i),this.applyMatrix4(ii),this}lookAt(e){return va.lookAt(e),va.updateMatrix(),this.applyMatrix4(va.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Nn).negate(),this.translate(Nn.x,Nn.y,Nn.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const i=[];for(let n=0,s=e.length;n<s;n++){const a=e[n];i.push(a.x,a.y,a.z||0)}this.setAttribute("position",new tt(i,3))}else{const i=Math.min(e.length,t.count);for(let n=0;n<i;n++){const s=e[n];t.setXYZ(n,s.x,s.y,s.z||0)}e.length>t.count&&Le("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Qn);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){We("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new D(-1/0,-1/0,-1/0),new D(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,n=t.length;i<n;i++){const s=t[i];Zt.setFromBufferAttribute(s),this.morphTargetsRelative?(Rt.addVectors(this.boundingBox.min,Zt.min),this.boundingBox.expandByPoint(Rt),Rt.addVectors(this.boundingBox.max,Zt.max),this.boundingBox.expandByPoint(Rt)):(this.boundingBox.expandByPoint(Zt.min),this.boundingBox.expandByPoint(Zt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&We('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new es);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){We("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new D,1/0);return}if(e){const i=this.boundingSphere.center;if(Zt.setFromBufferAttribute(e),t)for(let s=0,a=t.length;s<a;s++){const o=t[s];ls.setFromBufferAttribute(o),this.morphTargetsRelative?(Rt.addVectors(Zt.min,ls.min),Zt.expandByPoint(Rt),Rt.addVectors(Zt.max,ls.max),Zt.expandByPoint(Rt)):(Zt.expandByPoint(ls.min),Zt.expandByPoint(ls.max))}Zt.getCenter(i);let n=0;for(let s=0,a=e.count;s<a;s++)Rt.fromBufferAttribute(e,s),n=Math.max(n,i.distanceToSquared(Rt));if(t)for(let s=0,a=t.length;s<a;s++){const o=t[s],c=this.morphTargetsRelative;for(let l=0,h=o.count;l<h;l++)Rt.fromBufferAttribute(o,l),c&&(Nn.fromBufferAttribute(e,l),Rt.add(Nn)),n=Math.max(n,i.distanceToSquared(Rt))}this.boundingSphere.radius=Math.sqrt(n),isNaN(this.boundingSphere.radius)&&We('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){We("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=t.position,n=t.normal,s=t.uv;let a=this.getAttribute("tangent");(a===void 0||a.count!==i.count)&&(a=new ei(new Float32Array(4*i.count),4),this.setAttribute("tangent",a));const o=[],c=[];for(let _=0;_<i.count;_++)o[_]=new D,c[_]=new D;const l=new D,h=new D,d=new D,u=new De,f=new De,g=new De,v=new D,m=new D;function p(_,S,P){l.fromBufferAttribute(i,_),h.fromBufferAttribute(i,S),d.fromBufferAttribute(i,P),u.fromBufferAttribute(s,_),f.fromBufferAttribute(s,S),g.fromBufferAttribute(s,P),h.sub(l),d.sub(l),f.sub(u),g.sub(u);const R=1/(f.x*g.y-g.x*f.y);isFinite(R)&&(v.copy(h).multiplyScalar(g.y).addScaledVector(d,-f.y).multiplyScalar(R),m.copy(d).multiplyScalar(f.x).addScaledVector(h,-g.x).multiplyScalar(R),o[_].add(v),o[S].add(v),o[P].add(v),c[_].add(m),c[S].add(m),c[P].add(m))}let M=this.groups;M.length===0&&(M=[{start:0,count:e.count}]);for(let _=0,S=M.length;_<S;++_){const P=M[_],R=P.start,L=P.count;for(let H=R,K=R+L;H<K;H+=3)p(e.getX(H+0),e.getX(H+1),e.getX(H+2))}const T=new D,y=new D,E=new D,w=new D;function A(_){E.fromBufferAttribute(n,_),w.copy(E);const S=o[_];T.copy(S),T.sub(E.multiplyScalar(E.dot(S))).normalize(),y.crossVectors(w,S);const R=y.dot(c[_])<0?-1:1;a.setXYZW(_,T.x,T.y,T.z,R)}for(let _=0,S=M.length;_<S;++_){const P=M[_],R=P.start,L=P.count;for(let H=R,K=R+L;H<K;H+=3)A(e.getX(H+0)),A(e.getX(H+1)),A(e.getX(H+2))}this._transformed=!0}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==t.count)i=new ei(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let u=0,f=i.count;u<f;u++)i.setXYZ(u,0,0,0);const n=new D,s=new D,a=new D,o=new D,c=new D,l=new D,h=new D,d=new D;if(e)for(let u=0,f=e.count;u<f;u+=3){const g=e.getX(u+0),v=e.getX(u+1),m=e.getX(u+2);n.fromBufferAttribute(t,g),s.fromBufferAttribute(t,v),a.fromBufferAttribute(t,m),h.subVectors(a,s),d.subVectors(n,s),h.cross(d),o.fromBufferAttribute(i,g),c.fromBufferAttribute(i,v),l.fromBufferAttribute(i,m),o.add(h),c.add(h),l.add(h),i.setXYZ(g,o.x,o.y,o.z),i.setXYZ(v,c.x,c.y,c.z),i.setXYZ(m,l.x,l.y,l.z)}else for(let u=0,f=t.count;u<f;u+=3)n.fromBufferAttribute(t,u+0),s.fromBufferAttribute(t,u+1),a.fromBufferAttribute(t,u+2),h.subVectors(a,s),d.subVectors(n,s),h.cross(d),i.setXYZ(u+0,h.x,h.y,h.z),i.setXYZ(u+1,h.x,h.y,h.z),i.setXYZ(u+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)Rt.fromBufferAttribute(e,t),Rt.normalize(),e.setXYZ(t,Rt.x,Rt.y,Rt.z)}toNonIndexed(){function e(o,c){const l=o.array,h=o.itemSize,d=o.normalized,u=new l.constructor(c.length*h);let f=0,g=0;for(let v=0,m=c.length;v<m;v++){o.isInterleavedBufferAttribute?f=c[v]*o.data.stride+o.offset:f=c[v]*h;for(let p=0;p<h;p++)u[g++]=l[f++]}return new ei(u,h,d)}if(this.index===null)return Le("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new kt,i=this.index.array,n=this.attributes;for(const o in n){const c=n[o],l=e(c,i);t.setAttribute(o,l)}const s=this.morphAttributes;for(const o in s){const c=[],l=s[o];for(let h=0,d=l.length;h<d;h++){const u=l[h],f=e(u,i);c.push(f)}t.morphAttributes[o]=c}t.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,c=a.length;o<c;o++){const l=a[o];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){const c=this.parameters;for(const l in c)c[l]!==void 0&&(e[l]=c[l]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const i=this.attributes;for(const c in i){const l=i[c];e.data.attributes[c]=l.toJSON(e.data)}const n={};let s=!1;for(const c in this.morphAttributes){const l=this.morphAttributes[c],h=[];for(let d=0,u=l.length;d<u;d++){const f=l[d];h.push(f.toJSON(e.data))}h.length>0&&(n[c]=h,s=!0)}s&&(e.data.morphAttributes=n,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const i=e.index;i!==null&&this.setIndex(i.clone());const n=e.attributes;for(const l in n){const h=n[l];this.setAttribute(l,h.clone(t))}const s=e.morphAttributes;for(const l in s){const h=[],d=s[l];for(let u=0,f=d.length;u<f;u++)h.push(d[u].clone(t));this.morphAttributes[l]=h}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let l=0,h=a.length;l<h;l++){const d=a[l];this.addGroup(d.start,d.count,d.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}}let Sd=0;class vn extends tn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Sd++}),this.uuid=nn(),this.name="",this.type="Material",this.blending=Gn,this.side=Fi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Ha,this.blendDst=Ga,this.blendEquation=dn,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Be(0,0,0),this.blendAlpha=0,this.depthFunc=Yn,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=wl,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Mn,this.stencilZFail=Mn,this.stencilZPass=Mn,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const i=e[t];if(i===void 0){Le(`Material: parameter '${t}' has value of undefined.`);continue}const n=this[t];if(n===void 0){Le(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}n&&n.isColor?n.set(i):n&&n.isVector2&&i&&i.isVector2||n&&n.isEuler&&i&&i.isEuler||n&&n.isVector3&&i&&i.isVector3?n.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==Gn&&(i.blending=this.blending),this.side!==Fi&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==Ha&&(i.blendSrc=this.blendSrc),this.blendDst!==Ga&&(i.blendDst=this.blendDst),this.blendEquation!==dn&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==Yn&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==wl&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Mn&&(i.stencilFail=this.stencilFail),this.stencilZFail!==Mn&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==Mn&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.allowOverride===!1&&(i.allowOverride=!1),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function n(s){const a=[];for(const o in s){const c=s[o];delete c.metadata,a.push(c)}return a}if(t){const s=n(e.textures),a=n(e.images);s.length>0&&(i.textures=s),a.length>0&&(i.images=a)}return i}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Be().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let i=e.normalScale;Array.isArray(i)===!1&&(i=[i,i]),this.normalScale=new De().fromArray(i)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new De().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let i=null;if(t!==null){const n=t.length;i=new Array(n);for(let s=0;s!==n;++s)i[s]=t[s].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}const Pi=new D,ya=new D,Ws=new D,qi=new D,ba=new D,Xs=new D,Ma=new D;class Wr{constructor(e=new D,t=new D(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Pi)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=Pi.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Pi.copy(this.origin).addScaledVector(this.direction,t),Pi.distanceToSquared(e))}distanceSqToSegment(e,t,i,n){ya.copy(e).add(t).multiplyScalar(.5),Ws.copy(t).sub(e).normalize(),qi.copy(this.origin).sub(ya);const s=e.distanceTo(t)*.5,a=-this.direction.dot(Ws),o=qi.dot(this.direction),c=-qi.dot(Ws),l=qi.lengthSq(),h=Math.abs(1-a*a);let d,u,f,g;if(h>0)if(d=a*c-o,u=a*o-c,g=s*h,d>=0)if(u>=-g)if(u<=g){const v=1/h;d*=v,u*=v,f=d*(d+a*u+2*o)+u*(a*d+u+2*c)+l}else u=s,d=Math.max(0,-(a*u+o)),f=-d*d+u*(u+2*c)+l;else u=-s,d=Math.max(0,-(a*u+o)),f=-d*d+u*(u+2*c)+l;else u<=-g?(d=Math.max(0,-(-a*s+o)),u=d>0?-s:Math.min(Math.max(-s,-c),s),f=-d*d+u*(u+2*c)+l):u<=g?(d=0,u=Math.min(Math.max(-s,-c),s),f=u*(u+2*c)+l):(d=Math.max(0,-(a*s+o)),u=d>0?s:Math.min(Math.max(-s,-c),s),f=-d*d+u*(u+2*c)+l);else u=a>0?-s:s,d=Math.max(0,-(a*u+o)),f=-d*d+u*(u+2*c)+l;return i&&i.copy(this.origin).addScaledVector(this.direction,d),n&&n.copy(ya).addScaledVector(Ws,u),f}intersectSphere(e,t){Pi.subVectors(e.center,this.origin);const i=Pi.dot(this.direction),n=Pi.dot(Pi)-i*i,s=e.radius*e.radius;if(n>s)return null;const a=Math.sqrt(s-n),o=i-a,c=i+a;return c<0?null:o<0?this.at(c,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){const i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,n,s,a,o,c;const l=1/this.direction.x,h=1/this.direction.y,d=1/this.direction.z,u=this.origin;return l>=0?(i=(e.min.x-u.x)*l,n=(e.max.x-u.x)*l):(i=(e.max.x-u.x)*l,n=(e.min.x-u.x)*l),h>=0?(s=(e.min.y-u.y)*h,a=(e.max.y-u.y)*h):(s=(e.max.y-u.y)*h,a=(e.min.y-u.y)*h),i>a||s>n||((s>i||isNaN(i))&&(i=s),(a<n||isNaN(n))&&(n=a),d>=0?(o=(e.min.z-u.z)*d,c=(e.max.z-u.z)*d):(o=(e.max.z-u.z)*d,c=(e.min.z-u.z)*d),i>c||o>n)||((o>i||i!==i)&&(i=o),(c<n||n!==n)&&(n=c),n<0)?null:this.at(i>=0?i:n,t)}intersectsBox(e){return this.intersectBox(e,Pi)!==null}intersectTriangle(e,t,i,n,s){ba.subVectors(t,e),Xs.subVectors(i,e),Ma.crossVectors(ba,Xs);let a=this.direction.dot(Ma),o;if(a>0){if(n)return null;o=1}else if(a<0)o=-1,a=-a;else return null;qi.subVectors(this.origin,e);const c=o*this.direction.dot(Xs.crossVectors(qi,Xs));if(c<0)return null;const l=o*this.direction.dot(ba.cross(qi));if(l<0||c+l>a)return null;const h=-o*qi.dot(Ma);return h<0?null:this.at(h/a,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Pr extends vn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Be(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ui,this.combine=Gr,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const Vl=new Oe,ln=new Wr,qs=new es,Wl=new D,Ys=new D,Ks=new D,Zs=new D,Sa=new D,$s=new D,Xl=new D,Js=new D;class Vt extends ft{constructor(e=new kt,t=new Pr){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const n=t[i[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=n.length;s<a;s++){const o=n[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}getVertexPosition(e,t){const i=this.geometry,n=i.attributes.position,s=i.morphAttributes.position,a=i.morphTargetsRelative;t.fromBufferAttribute(n,e);const o=this.morphTargetInfluences;if(s&&o){$s.set(0,0,0);for(let c=0,l=s.length;c<l;c++){const h=o[c],d=s[c];h!==0&&(Sa.fromBufferAttribute(d,e),a?$s.addScaledVector(Sa,h):$s.addScaledVector(Sa.sub(t),h))}t.add($s)}return t}raycast(e,t){const i=this.geometry,n=this.material,s=this.matrixWorld;n!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),qs.copy(i.boundingSphere),qs.applyMatrix4(s),ln.copy(e.ray).recast(e.near),!(qs.containsPoint(ln.origin)===!1&&(ln.intersectSphere(qs,Wl)===null||ln.origin.distanceToSquared(Wl)>(e.far-e.near)**2))&&(Vl.copy(s).invert(),ln.copy(e.ray).applyMatrix4(Vl),!(i.boundingBox!==null&&ln.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,ln)))}_computeIntersections(e,t,i){let n;const s=this.geometry,a=this.material,o=s.index,c=s.attributes.position,l=s.attributes.uv,h=s.attributes.uv1,d=s.attributes.normal,u=s.groups,f=s.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,v=u.length;g<v;g++){const m=u[g],p=a[m.materialIndex],M=Math.max(m.start,f.start),T=Math.min(o.count,Math.min(m.start+m.count,f.start+f.count));for(let y=M,E=T;y<E;y+=3){const w=o.getX(y),A=o.getX(y+1),_=o.getX(y+2);n=js(this,p,e,i,l,h,d,w,A,_),n&&(n.faceIndex=Math.floor(y/3),n.face.materialIndex=m.materialIndex,t.push(n))}}else{const g=Math.max(0,f.start),v=Math.min(o.count,f.start+f.count);for(let m=g,p=v;m<p;m+=3){const M=o.getX(m),T=o.getX(m+1),y=o.getX(m+2);n=js(this,a,e,i,l,h,d,M,T,y),n&&(n.faceIndex=Math.floor(m/3),t.push(n))}}else if(c!==void 0)if(Array.isArray(a))for(let g=0,v=u.length;g<v;g++){const m=u[g],p=a[m.materialIndex],M=Math.max(m.start,f.start),T=Math.min(c.count,Math.min(m.start+m.count,f.start+f.count));for(let y=M,E=T;y<E;y+=3){const w=y,A=y+1,_=y+2;n=js(this,p,e,i,l,h,d,w,A,_),n&&(n.faceIndex=Math.floor(y/3),n.face.materialIndex=m.materialIndex,t.push(n))}}else{const g=Math.max(0,f.start),v=Math.min(c.count,f.start+f.count);for(let m=g,p=v;m<p;m+=3){const M=m,T=m+1,y=m+2;n=js(this,a,e,i,l,h,d,M,T,y),n&&(n.faceIndex=Math.floor(m/3),t.push(n))}}}}function Ed(r,e,t,i,n,s,a,o){let c;if(e.side===qt?c=i.intersectTriangle(a,s,n,!0,o):c=i.intersectTriangle(n,s,a,e.side===Fi,o),c===null)return null;Js.copy(o),Js.applyMatrix4(r.matrixWorld);const l=t.ray.origin.distanceTo(Js);return l<t.near||l>t.far?null:{distance:l,point:Js.clone(),object:r}}function js(r,e,t,i,n,s,a,o,c,l){r.getVertexPosition(o,Ys),r.getVertexPosition(c,Ks),r.getVertexPosition(l,Zs);const h=Ed(r,e,t,i,Ys,Ks,Zs,Xl);if(h){const d=new D;si.getBarycoord(Xl,Ys,Ks,Zs,d),n&&(h.uv=si.getInterpolatedAttribute(n,o,c,l,d,new De)),s&&(h.uv1=si.getInterpolatedAttribute(s,o,c,l,d,new De)),a&&(h.normal=si.getInterpolatedAttribute(a,o,c,l,d,new D),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));const u={a:o,b:c,c:l,normal:new D,materialIndex:0};si.getNormal(Ys,Ks,Zs,u.normal),h.face=u,h.barycoord=d}return h}const cs=new it,ql=new it,Yl=new it,Td=new it,Kl=new Oe,Qs=new D,Ea=new es,Zl=new Oe,Ta=new Wr;class wd extends Vt{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=Ml,this.bindMatrix=new Oe,this.bindMatrixInverse=new Oe,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){const e=this.geometry;this.boundingBox===null&&(this.boundingBox=new Qn),this.boundingBox.makeEmpty();const t=e.getAttribute("position");for(let i=0;i<t.count;i++)this.getVertexPosition(i,Qs),this.boundingBox.expandByPoint(Qs)}computeBoundingSphere(){const e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new es),this.boundingSphere.makeEmpty();const t=e.getAttribute("position");for(let i=0;i<t.count;i++)this.getVertexPosition(i,Qs),this.boundingSphere.expandByPoint(Qs)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){const i=this.material,n=this.matrixWorld;i!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Ea.copy(this.boundingSphere),Ea.applyMatrix4(n),e.ray.intersectsSphere(Ea)!==!1&&(Zl.copy(n).invert(),Ta.copy(e.ray).applyMatrix4(Zl),!(this.boundingBox!==null&&Ta.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,Ta)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){const e=new it,t=this.geometry.attributes.skinWeight;for(let i=0,n=t.count;i<n;i++){e.fromBufferAttribute(t,i);const s=1/e.manhattanLength();s!==1/0?e.multiplyScalar(s):e.set(1,0,0,0),t.setXYZW(i,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===Ml?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===Cu?this.bindMatrixInverse.copy(this.bindMatrix).invert():Le("SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){const i=this.skeleton,n=this.geometry;ql.fromBufferAttribute(n.attributes.skinIndex,e),Yl.fromBufferAttribute(n.attributes.skinWeight,e),t.isVector4?(cs.copy(t),t.set(0,0,0,0)):(cs.set(...t,1),t.set(0,0,0)),cs.applyMatrix4(this.bindMatrix);for(let s=0;s<4;s++){const a=Yl.getComponent(s);if(a!==0){const o=ql.getComponent(s);Kl.multiplyMatrices(i.bones[o].matrixWorld,i.boneInverses[o]),t.addScaledVector(Td.copy(cs).applyMatrix4(Kl),a)}}return t.isVector4&&(t.w=cs.w),t.applyMatrix4(this.bindMatrixInverse)}}class bh extends ft{constructor(){super(),this.isBone=!0,this.type="Bone"}}class Lr extends Ot{constructor(e=null,t=1,i=1,n,s,a,o,c,l=Nt,h=Nt,d,u){super(null,a,o,c,l,h,n,s,d,u),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const $l=new Oe,Ad=new Oe;class qo{constructor(e=[],t=[]){this.uuid=nn(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){const e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){Le("Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let i=0,n=this.bones.length;i<n;i++)this.boneInverses.push(new Oe)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){const i=new Oe;this.bones[e]&&i.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(i)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){const i=this.bones[e];i&&i.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){const i=this.bones[e];i&&(i.parent&&i.parent.isBone?(i.matrix.copy(i.parent.matrixWorld).invert(),i.matrix.multiply(i.matrixWorld)):i.matrix.copy(i.matrixWorld),i.matrix.decompose(i.position,i.quaternion,i.scale))}}update(){const e=this.bones,t=this.boneInverses,i=this.boneMatrices,n=this.boneTexture;for(let s=0,a=e.length;s<a;s++){const o=e[s]?e[s].matrixWorld:Ad;$l.multiplyMatrices(o,t[s]),$l.toArray(i,s*16)}n!==null&&(n.needsUpdate=!0)}clone(){return new qo(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);const t=new Float32Array(e*e*4);t.set(this.boneMatrices);const i=new Lr(t,e,e,ri,ci);return i.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=i,this}getBoneByName(e){for(let t=0,i=this.bones.length;t<i;t++){const n=this.bones[t];if(n.name===e)return n}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let i=0,n=e.bones.length;i<n;i++){const s=e.bones[i];let a=t[s];a===void 0&&(Le("Skeleton: No bone found with UUID:",s),a=new bh),this.bones.push(a),this.boneInverses.push(new Oe().fromArray(e.boneInverses[i]))}return this.init(),this}toJSON(){const e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;const t=this.bones,i=this.boneInverses;for(let n=0,s=t.length;n<s;n++){const a=t[n];e.bones.push(a.uuid);const o=i[n];e.boneInverses.push(o.toArray())}return e}}const wa=new D,Rd=new D,Cd=new ke;class $i{constructor(e=new D(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,n){return this.normal.set(e,t,i),this.constant=n,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){const n=wa.subVectors(i,t).cross(Rd.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(n,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,i=!0){const n=e.delta(wa),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const a=-(e.start.dot(this.normal)+this.constant)/s;return i===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(n,a)}intersectsLine(e){const t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const i=t||Cd.getNormalMatrix(e),n=this.coplanarPoint(wa).applyMatrix4(e),s=this.normal.applyMatrix3(i).normalize();return this.constant=-n.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const cn=new es,Pd=new De(.5,.5),er=new D;class Yo{constructor(e=new $i,t=new $i,i=new $i,n=new $i,s=new $i,a=new $i){this.planes=[e,t,i,n,s,a]}set(e,t,i,n,s,a){const o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(i),o[3].copy(n),o[4].copy(s),o[5].copy(a),this}copy(e){const t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=bi,i=!1){const n=this.planes,s=e.elements,a=s[0],o=s[1],c=s[2],l=s[3],h=s[4],d=s[5],u=s[6],f=s[7],g=s[8],v=s[9],m=s[10],p=s[11],M=s[12],T=s[13],y=s[14],E=s[15];if(n[0].setComponents(l-a,f-h,p-g,E-M).normalize(),n[1].setComponents(l+a,f+h,p+g,E+M).normalize(),n[2].setComponents(l+o,f+d,p+v,E+T).normalize(),n[3].setComponents(l-o,f-d,p-v,E-T).normalize(),i)n[4].setComponents(c,u,m,y).normalize(),n[5].setComponents(l-c,f-u,p-m,E-y).normalize();else if(n[4].setComponents(l-c,f-u,p-m,E-y).normalize(),t===bi)n[5].setComponents(l+c,f+u,p+m,E+y).normalize();else if(t===ws)n[5].setComponents(c,u,m,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),cn.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),cn.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(cn)}intersectsSprite(e){cn.center.set(0,0,0);const t=Pd.distanceTo(e.center);return cn.radius=.7071067811865476+t,cn.applyMatrix4(e.matrixWorld),this.intersectsSphere(cn)}intersectsSphere(e){const t=this.planes,i=e.center,n=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(i)<n)return!1;return!0}intersectsBox(e){const t=this.planes;for(let i=0;i<6;i++){const n=t[i];if(er.x=n.normal.x>0?e.max.x:e.min.x,er.y=n.normal.y>0?e.max.y:e.min.y,er.z=n.normal.z>0?e.max.z:e.min.z,n.distanceToPoint(er)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class Nr extends vn{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Be(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const Dr=new D,Ir=new D,Jl=new Oe,hs=new Wr,tr=new es,Aa=new D,jl=new D;class Mh extends ft{constructor(e=new kt,t=new Nr){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[0];for(let n=1,s=t.count;n<s;n++)Dr.fromBufferAttribute(t,n-1),Ir.fromBufferAttribute(t,n),i[n]=i[n-1],i[n]+=Dr.distanceTo(Ir);e.setAttribute("lineDistance",new tt(i,1))}else Le("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const i=this.geometry,n=this.matrixWorld,s=e.params.Line.threshold,a=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),tr.copy(i.boundingSphere),tr.applyMatrix4(n),tr.radius+=s,e.ray.intersectsSphere(tr)===!1)return;Jl.copy(n).invert(),hs.copy(e.ray).applyMatrix4(Jl);const o=s/((this.scale.x+this.scale.y+this.scale.z)/3),c=o*o,l=this.isLineSegments?2:1,h=i.index,u=i.attributes.position;if(h!==null){const f=Math.max(0,a.start),g=Math.min(h.count,a.start+a.count);for(let v=f,m=g-1;v<m;v+=l){const p=h.getX(v),M=h.getX(v+1),T=ir(this,e,hs,c,p,M,v);T&&t.push(T)}if(this.isLineLoop){const v=h.getX(g-1),m=h.getX(f),p=ir(this,e,hs,c,v,m,g-1);p&&t.push(p)}}else{const f=Math.max(0,a.start),g=Math.min(u.count,a.start+a.count);for(let v=f,m=g-1;v<m;v+=l){const p=ir(this,e,hs,c,v,v+1,v);p&&t.push(p)}if(this.isLineLoop){const v=ir(this,e,hs,c,g-1,f,g-1);v&&t.push(v)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const n=t[i[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=n.length;s<a;s++){const o=n[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}}function ir(r,e,t,i,n,s,a){const o=r.geometry.attributes.position;if(Dr.fromBufferAttribute(o,n),Ir.fromBufferAttribute(o,s),t.distanceSqToSegment(Dr,Ir,Aa,jl)>i)return;Aa.applyMatrix4(r.matrixWorld);const l=e.ray.origin.distanceTo(Aa);if(!(l<e.near||l>e.far))return{distance:l,point:jl.clone().applyMatrix4(r.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:r}}const Ql=new D,ec=new D;class Sh extends Mh{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[];for(let n=0,s=t.count;n<s;n+=2)Ql.fromBufferAttribute(t,n),ec.fromBufferAttribute(t,n+1),i[n]=n===0?0:i[n-1],i[n+1]=i[n]+Ql.distanceTo(ec);e.setAttribute("lineDistance",new tt(i,1))}else Le("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class Eh extends Ot{constructor(e=[],t=gn,i,n,s,a,o,c,l,h){super(e,t,i,n,s,a,o,c,l,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class $n extends Ot{constructor(e,t,i=Ei,n,s,a,o=Nt,c=Nt,l,h=ki,d=1){if(h!==ki&&h!==mn)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const u={width:e,height:t,depth:d};super(u,n,s,a,o,c,h,i,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Xo(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class Ld extends $n{constructor(e,t=Ei,i=gn,n,s,a=Nt,o=Nt,c,l=ki){const h={width:e,height:e,depth:1},d=[h,h,h,h,h,h];super(e,e,t,i,n,s,a,o,c,l),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}}class Th extends Ot{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class ts extends kt{constructor(e=1,t=1,i=1,n=1,s=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:n,heightSegments:s,depthSegments:a};const o=this;n=Math.floor(n),s=Math.floor(s),a=Math.floor(a);const c=[],l=[],h=[],d=[];let u=0,f=0;g("z","y","x",-1,-1,i,t,e,a,s,0),g("z","y","x",1,-1,i,t,-e,a,s,1),g("x","z","y",1,1,e,i,t,n,a,2),g("x","z","y",1,-1,e,i,-t,n,a,3),g("x","y","z",1,-1,e,t,i,n,s,4),g("x","y","z",-1,-1,e,t,-i,n,s,5),this.setIndex(c),this.setAttribute("position",new tt(l,3)),this.setAttribute("normal",new tt(h,3)),this.setAttribute("uv",new tt(d,2));function g(v,m,p,M,T,y,E,w,A,_,S){const P=y/A,R=E/_,L=y/2,H=E/2,K=w/2,F=A+1,N=_+1;let B=0,Y=0;const j=new D;for(let se=0;se<N;se++){const ne=se*R-H;for(let re=0;re<F;re++){const xe=re*P-L;j[v]=xe*M,j[m]=ne*T,j[p]=K,l.push(j.x,j.y,j.z),j[v]=0,j[m]=0,j[p]=w>0?1:-1,h.push(j.x,j.y,j.z),d.push(re/A),d.push(1-se/_),B+=1}}for(let se=0;se<_;se++)for(let ne=0;ne<A;ne++){const re=u+ne+F*se,xe=u+ne+F*(se+1),ve=u+(ne+1)+F*(se+1),oe=u+(ne+1)+F*se;c.push(re,xe,oe),c.push(xe,ve,oe),Y+=6}o.addGroup(f,Y,S),f+=Y,u+=B}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ts(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}class Ko extends kt{constructor(e=1,t=1,i=1,n=32,s=1,a=!1,o=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:n,heightSegments:s,openEnded:a,thetaStart:o,thetaLength:c};const l=this;n=Math.floor(n),s=Math.floor(s);const h=[],d=[],u=[],f=[];let g=0;const v=[],m=i/2;let p=0;M(),a===!1&&(e>0&&T(!0),t>0&&T(!1)),this.setIndex(h),this.setAttribute("position",new tt(d,3)),this.setAttribute("normal",new tt(u,3)),this.setAttribute("uv",new tt(f,2));function M(){const y=new D,E=new D;let w=0;const A=(t-e)/i;for(let _=0;_<=s;_++){const S=[],P=_/s,R=P*(t-e)+e;for(let L=0;L<=n;L++){const H=L/n,K=H*c+o,F=Math.sin(K),N=Math.cos(K);E.x=R*F,E.y=-P*i+m,E.z=R*N,d.push(E.x,E.y,E.z),y.set(F,A,N).normalize(),u.push(y.x,y.y,y.z),f.push(H,1-P),S.push(g++)}v.push(S)}for(let _=0;_<n;_++)for(let S=0;S<s;S++){const P=v[S][_],R=v[S+1][_],L=v[S+1][_+1],H=v[S][_+1];(e>0||S!==0)&&(h.push(P,R,H),w+=3),(t>0||S!==s-1)&&(h.push(R,L,H),w+=3)}l.addGroup(p,w,0),p+=w}function T(y){const E=g,w=new De,A=new D;let _=0;const S=y===!0?e:t,P=y===!0?1:-1;for(let L=1;L<=n;L++)d.push(0,m*P,0),u.push(0,P,0),f.push(.5,.5),g++;const R=g;for(let L=0;L<=n;L++){const K=L/n*c+o,F=Math.cos(K),N=Math.sin(K);A.x=S*N,A.y=m*P,A.z=S*F,d.push(A.x,A.y,A.z),u.push(0,P,0),w.x=F*.5+.5,w.y=N*.5*P+.5,f.push(w.x,w.y),g++}for(let L=0;L<n;L++){const H=E+L,K=R+L;y===!0?h.push(K,K+1,H):h.push(K+1,K,H),_+=3}l.addGroup(p,_,y===!0?1:2),p+=_}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ko(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}function Nd(r,e,t=2){const i=e&&e.length,n=i?e[0]*t:r.length;let s=wh(r,0,n,t,!0);const a=[];if(!s||s.next===s.prev)return a;let o,c,l;if(i&&(s=Od(r,e,s,t)),r.length>80*t){o=r[0],c=r[1];let h=o,d=c;for(let u=t;u<n;u+=t){const f=r[u],g=r[u+1];f<o&&(o=f),g<c&&(c=g),f>h&&(h=f),g>d&&(d=g)}l=Math.max(h-o,d-c),l=l!==0?32767/l:0}return Rs(s,a,t,o,c,l,0),a}function wh(r,e,t,i,n){let s;if(n===Kd(r,e,t,i)>0)for(let a=e;a<t;a+=i)s=tc(a/i|0,r[a],r[a+1],s);else for(let a=t-i;a>=e;a-=i)s=tc(a/i|0,r[a],r[a+1],s);return s&&Jn(s,s.next)&&(Ps(s),s=s.next),s}function xn(r,e){if(!r)return r;e||(e=r);let t=r,i;do if(i=!1,!t.steiner&&(Jn(t,t.next)||ct(t.prev,t,t.next)===0)){if(Ps(t),t=e=t.prev,t===t.next)break;i=!0}else t=t.next;while(i||t!==e);return e}function Rs(r,e,t,i,n,s,a){if(!r)return;!a&&s&&Gd(r,i,n,s);let o=r;for(;r.prev!==r.next;){const c=r.prev,l=r.next;if(s?Id(r,i,n,s):Dd(r)){e.push(c.i,r.i,l.i),Ps(r),r=l.next,o=l.next;continue}if(r=l,r===o){a?a===1?(r=Ud(xn(r),e),Rs(r,e,t,i,n,s,2)):a===2&&Fd(r,e,t,i,n,s):Rs(xn(r),e,t,i,n,s,1);break}}}function Dd(r){const e=r.prev,t=r,i=r.next;if(ct(e,t,i)>=0)return!1;const n=e.x,s=t.x,a=i.x,o=e.y,c=t.y,l=i.y,h=Math.min(n,s,a),d=Math.min(o,c,l),u=Math.max(n,s,a),f=Math.max(o,c,l);let g=i.next;for(;g!==e;){if(g.x>=h&&g.x<=u&&g.y>=d&&g.y<=f&&ms(n,o,s,c,a,l,g.x,g.y)&&ct(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function Id(r,e,t,i){const n=r.prev,s=r,a=r.next;if(ct(n,s,a)>=0)return!1;const o=n.x,c=s.x,l=a.x,h=n.y,d=s.y,u=a.y,f=Math.min(o,c,l),g=Math.min(h,d,u),v=Math.max(o,c,l),m=Math.max(h,d,u),p=Po(f,g,e,t,i),M=Po(v,m,e,t,i);let T=r.prevZ,y=r.nextZ;for(;T&&T.z>=p&&y&&y.z<=M;){if(T.x>=f&&T.x<=v&&T.y>=g&&T.y<=m&&T!==n&&T!==a&&ms(o,h,c,d,l,u,T.x,T.y)&&ct(T.prev,T,T.next)>=0||(T=T.prevZ,y.x>=f&&y.x<=v&&y.y>=g&&y.y<=m&&y!==n&&y!==a&&ms(o,h,c,d,l,u,y.x,y.y)&&ct(y.prev,y,y.next)>=0))return!1;y=y.nextZ}for(;T&&T.z>=p;){if(T.x>=f&&T.x<=v&&T.y>=g&&T.y<=m&&T!==n&&T!==a&&ms(o,h,c,d,l,u,T.x,T.y)&&ct(T.prev,T,T.next)>=0)return!1;T=T.prevZ}for(;y&&y.z<=M;){if(y.x>=f&&y.x<=v&&y.y>=g&&y.y<=m&&y!==n&&y!==a&&ms(o,h,c,d,l,u,y.x,y.y)&&ct(y.prev,y,y.next)>=0)return!1;y=y.nextZ}return!0}function Ud(r,e){let t=r;do{const i=t.prev,n=t.next.next;!Jn(i,n)&&Rh(i,t,t.next,n)&&Cs(i,n)&&Cs(n,i)&&(e.push(i.i,t.i,n.i),Ps(t),Ps(t.next),t=r=n),t=t.next}while(t!==r);return xn(t)}function Fd(r,e,t,i,n,s){let a=r;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&Xd(a,o)){let c=Ch(a,o);a=xn(a,a.next),c=xn(c,c.next),Rs(a,e,t,i,n,s,0),Rs(c,e,t,i,n,s,0);return}o=o.next}a=a.next}while(a!==r)}function Od(r,e,t,i){const n=[];for(let s=0,a=e.length;s<a;s++){const o=e[s]*i,c=s<a-1?e[s+1]*i:r.length,l=wh(r,o,c,i,!1);l===l.next&&(l.steiner=!0),n.push(Wd(l))}n.sort(kd);for(let s=0;s<n.length;s++)t=Bd(n[s],t);return t}function kd(r,e){let t=r.x-e.x;if(t===0&&(t=r.y-e.y,t===0)){const i=(r.next.y-r.y)/(r.next.x-r.x),n=(e.next.y-e.y)/(e.next.x-e.x);t=i-n}return t}function Bd(r,e){const t=zd(r,e);if(!t)return e;const i=Ch(t,r);return xn(i,i.next),xn(t,t.next)}function zd(r,e){let t=e;const i=r.x,n=r.y;let s=-1/0,a;if(Jn(r,t))return t;do{if(Jn(r,t.next))return t.next;if(n<=t.y&&n>=t.next.y&&t.next.y!==t.y){const d=t.x+(n-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(d<=i&&d>s&&(s=d,a=t.x<t.next.x?t:t.next,d===i))return a}t=t.next}while(t!==e);if(!a)return null;const o=a,c=a.x,l=a.y;let h=1/0;t=a;do{if(i>=t.x&&t.x>=c&&i!==t.x&&Ah(n<l?i:s,n,c,l,n<l?s:i,n,t.x,t.y)){const d=Math.abs(n-t.y)/(i-t.x);Cs(t,r)&&(d<h||d===h&&(t.x>a.x||t.x===a.x&&Hd(a,t)))&&(a=t,h=d)}t=t.next}while(t!==o);return a}function Hd(r,e){return ct(r.prev,r,e.prev)<0&&ct(e.next,r,r.next)<0}function Gd(r,e,t,i){let n=r;do n.z===0&&(n.z=Po(n.x,n.y,e,t,i)),n.prevZ=n.prev,n.nextZ=n.next,n=n.next;while(n!==r);n.prevZ.nextZ=null,n.prevZ=null,Vd(n)}function Vd(r){let e,t=1;do{let i=r,n;r=null;let s=null;for(e=0;i;){e++;let a=i,o=0;for(let l=0;l<t&&(o++,a=a.nextZ,!!a);l++);let c=t;for(;o>0||c>0&&a;)o!==0&&(c===0||!a||i.z<=a.z)?(n=i,i=i.nextZ,o--):(n=a,a=a.nextZ,c--),s?s.nextZ=n:r=n,n.prevZ=s,s=n;i=a}s.nextZ=null,t*=2}while(e>1);return r}function Po(r,e,t,i,n){return r=(r-t)*n|0,e=(e-i)*n|0,r=(r|r<<8)&16711935,r=(r|r<<4)&252645135,r=(r|r<<2)&858993459,r=(r|r<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,r|e<<1}function Wd(r){let e=r,t=r;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==r);return t}function Ah(r,e,t,i,n,s,a,o){return(n-a)*(e-o)>=(r-a)*(s-o)&&(r-a)*(i-o)>=(t-a)*(e-o)&&(t-a)*(s-o)>=(n-a)*(i-o)}function ms(r,e,t,i,n,s,a,o){return!(r===a&&e===o)&&Ah(r,e,t,i,n,s,a,o)}function Xd(r,e){return r.next.i!==e.i&&r.prev.i!==e.i&&!qd(r,e)&&(Cs(r,e)&&Cs(e,r)&&Yd(r,e)&&(ct(r.prev,r,e.prev)||ct(r,e.prev,e))||Jn(r,e)&&ct(r.prev,r,r.next)>0&&ct(e.prev,e,e.next)>0)}function ct(r,e,t){return(e.y-r.y)*(t.x-e.x)-(e.x-r.x)*(t.y-e.y)}function Jn(r,e){return r.x===e.x&&r.y===e.y}function Rh(r,e,t,i){const n=sr(ct(r,e,t)),s=sr(ct(r,e,i)),a=sr(ct(t,i,r)),o=sr(ct(t,i,e));return!!(n!==s&&a!==o||n===0&&nr(r,t,e)||s===0&&nr(r,i,e)||a===0&&nr(t,r,i)||o===0&&nr(t,e,i))}function nr(r,e,t){return e.x<=Math.max(r.x,t.x)&&e.x>=Math.min(r.x,t.x)&&e.y<=Math.max(r.y,t.y)&&e.y>=Math.min(r.y,t.y)}function sr(r){return r>0?1:r<0?-1:0}function qd(r,e){let t=r;do{if(t.i!==r.i&&t.next.i!==r.i&&t.i!==e.i&&t.next.i!==e.i&&Rh(t,t.next,r,e))return!0;t=t.next}while(t!==r);return!1}function Cs(r,e){return ct(r.prev,r,r.next)<0?ct(r,e,r.next)>=0&&ct(r,r.prev,e)>=0:ct(r,e,r.prev)<0||ct(r,r.next,e)<0}function Yd(r,e){let t=r,i=!1;const n=(r.x+e.x)/2,s=(r.y+e.y)/2;do t.y>s!=t.next.y>s&&t.next.y!==t.y&&n<(t.next.x-t.x)*(s-t.y)/(t.next.y-t.y)+t.x&&(i=!i),t=t.next;while(t!==r);return i}function Ch(r,e){const t=Lo(r.i,r.x,r.y),i=Lo(e.i,e.x,e.y),n=r.next,s=e.prev;return r.next=e,e.prev=r,t.next=n,n.prev=t,i.next=t,t.prev=i,s.next=i,i.prev=s,i}function tc(r,e,t,i){const n=Lo(r,e,t);return i?(n.next=i.next,n.prev=i,i.next.prev=n,i.next=n):(n.prev=n,n.next=n),n}function Ps(r){r.next.prev=r.prev,r.prev.next=r.next,r.prevZ&&(r.prevZ.nextZ=r.nextZ),r.nextZ&&(r.nextZ.prevZ=r.prevZ)}function Lo(r,e,t){return{i:r,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function Kd(r,e,t,i){let n=0;for(let s=e,a=t-i;s<t;s+=i)n+=(r[a]-r[s])*(r[s+1]+r[a+1]),a=s;return n}class Zd{static triangulate(e,t,i=2){return Nd(e,t,i)}}class Ur{static area(e){const t=e.length;let i=0;for(let n=t-1,s=0;s<t;n=s++)i+=e[n].x*e[s].y-e[s].x*e[n].y;return i*.5}static isClockWise(e){return Ur.area(e)<0}static triangulateShape(e,t){const i=[],n=[],s=[];ic(e),nc(i,e);let a=e.length;t.forEach(ic);for(let c=0;c<t.length;c++)n.push(a),a+=t[c].length,nc(i,t[c]);const o=Zd.triangulate(i,n);for(let c=0;c<o.length;c+=3)s.push(o.slice(c,c+3));return s}}function ic(r){const e=r.length;e>2&&r[e-1].equals(r[0])&&r.pop()}function nc(r,e){for(let t=0;t<e.length;t++)r.push(e[t].x),r.push(e[t].y)}class Xr extends kt{constructor(e=1,t=1,i=1,n=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:n};const s=e/2,a=t/2,o=Math.floor(i),c=Math.floor(n),l=o+1,h=c+1,d=e/o,u=t/c,f=[],g=[],v=[],m=[];for(let p=0;p<h;p++){const M=p*u-a;for(let T=0;T<l;T++){const y=T*d-s;g.push(y,-M,0),v.push(0,0,1),m.push(T/o),m.push(1-p/c)}}for(let p=0;p<c;p++)for(let M=0;M<o;M++){const T=M+l*p,y=M+l*(p+1),E=M+1+l*(p+1),w=M+1+l*p;f.push(T,y,w),f.push(y,E,w)}this.setIndex(f),this.setAttribute("position",new tt(g,3)),this.setAttribute("normal",new tt(v,3)),this.setAttribute("uv",new tt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Xr(e.width,e.height,e.widthSegments,e.heightSegments)}}class Zo extends kt{constructor(e=1,t=32,i=16,n=0,s=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:n,phiLength:s,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));const c=Math.min(a+o,Math.PI);let l=0;const h=[],d=new D,u=new D,f=[],g=[],v=[],m=[];for(let p=0;p<=i;p++){const M=[],T=p/i,y=a+T*o,E=e*Math.cos(y),w=Math.sqrt(e*e-E*E);let A=0;p===0&&a===0?A=.5/t:p===i&&c===Math.PI&&(A=-.5/t);for(let _=0;_<=t;_++){const S=_/t,P=n+S*s;d.x=-w*Math.cos(P),d.y=E,d.z=w*Math.sin(P),g.push(d.x,d.y,d.z),u.copy(d).normalize(),v.push(u.x,u.y,u.z),m.push(S+A,1-T),M.push(l++)}h.push(M)}for(let p=0;p<i;p++)for(let M=0;M<t;M++){const T=h[p][M+1],y=h[p][M],E=h[p+1][M],w=h[p+1][M+1];(p!==0||a>0)&&f.push(T,y,w),(p!==i-1||c<Math.PI)&&f.push(y,E,w)}this.setIndex(f),this.setAttribute("position",new tt(g,3)),this.setAttribute("normal",new tt(v,3)),this.setAttribute("uv",new tt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Zo(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}function jn(r){const e={};for(const t in r){e[t]={};for(const i in r[t]){const n=r[t][i];if(sc(n))n.isRenderTargetTexture?(Le("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=n.clone();else if(Array.isArray(n))if(sc(n[0])){const s=[];for(let a=0,o=n.length;a<o;a++)s[a]=n[a].clone();e[t][i]=s}else e[t][i]=n.slice();else e[t][i]=n}}return e}function Ht(r){const e={};for(let t=0;t<r.length;t++){const i=jn(r[t]);for(const n in i)e[n]=i[n]}return e}function sc(r){return r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)}function $d(r){const e=[];for(let t=0;t<r.length;t++)e.push(r[t].clone());return e}function Ph(r){const e=r.getRenderTarget();return e===null?r.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Xe.workingColorSpace}const Jd={clone:jn,merge:Ht};var jd=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Qd=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Ti extends vn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=jd,this.fragmentShader=Qd,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=jn(e.uniforms),this.uniformsGroups=$d(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const n in this.uniforms){const a=this.uniforms[n].value;a&&a.isTexture?t.uniforms[n]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[n]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[n]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[n]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[n]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[n]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[n]={type:"m4",value:a.toArray()}:t.uniforms[n]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const i={};for(const n in this.extensions)this.extensions[n]===!0&&(i[n]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(const i in e.uniforms){const n=e.uniforms[i];switch(this.uniforms[i]={},n.type){case"t":this.uniforms[i].value=t[n.value]||null;break;case"c":this.uniforms[i].value=new Be().setHex(n.value);break;case"v2":this.uniforms[i].value=new De().fromArray(n.value);break;case"v3":this.uniforms[i].value=new D().fromArray(n.value);break;case"v4":this.uniforms[i].value=new it().fromArray(n.value);break;case"m3":this.uniforms[i].value=new ke().fromArray(n.value);break;case"m4":this.uniforms[i].value=new Oe().fromArray(n.value);break;default:this.uniforms[i].value=n.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(const i in e.extensions)this.extensions[i]=e.extensions[i];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}}class ef extends Ti{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class bs extends vn{constructor(e){super(),this.isMeshPhongMaterial=!0,this.type="MeshPhongMaterial",this.color=new Be(16777215),this.specular=new Be(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Be(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Ar,this.normalScale=new De(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ui,this.combine=Gr,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.specular.copy(e.specular),this.shininess=e.shininess,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class tf extends vn{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Be(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Be(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Ar,this.normalScale=new De(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ui,this.combine=Gr,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class nf extends vn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Nu,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class sf extends vn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}function rr(r,e){return!r||r.constructor===e?r:typeof e.BYTES_PER_ELEMENT=="number"?new e(r):Array.prototype.slice.call(r)}function rf(r){function e(n,s){return r[n]-r[s]}const t=r.length,i=new Array(t);for(let n=0;n!==t;++n)i[n]=n;return i.sort(e),i}function rc(r,e,t){const i=r.length,n=new r.constructor(i);for(let s=0,a=0;a!==i;++s){const o=t[s]*e;for(let c=0;c!==e;++c)n[a++]=r[o+c]}return n}function af(r,e,t,i){let n=1,s=r[0];for(;s!==void 0&&s[i]===void 0;)s=r[n++];if(s===void 0)return;let a=s[i];if(a!==void 0)if(Array.isArray(a))do a=s[i],a!==void 0&&(e.push(s.time),t.push(...a)),s=r[n++];while(s!==void 0);else if(a.toArray!==void 0)do a=s[i],a!==void 0&&(e.push(s.time),a.toArray(t,t.length)),s=r[n++];while(s!==void 0);else do a=s[i],a!==void 0&&(e.push(s.time),t.push(a)),s=r[n++];while(s!==void 0)}class Ns{constructor(e,t,i,n){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=n!==void 0?n:new t.constructor(i),this.sampleValues=t,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(e){const t=this.parameterPositions;let i=this._cachedIndex,n=t[i],s=t[i-1];i:{e:{let a;t:{n:if(!(e<n)){for(let o=i+2;;){if(n===void 0){if(e<s)break n;return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===o)break;if(s=n,n=t[++i],e<n)break e}a=t.length;break t}if(!(e>=s)){const o=t[1];e<o&&(i=2,s=o);for(let c=i-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===c)break;if(n=s,s=t[--i-1],e>=s)break e}a=i,i=0;break t}break i}for(;i<a;){const o=i+a>>>1;e<t[o]?a=o:i=o+1}if(n=t[i],s=t[i-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===void 0)return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,s,n)}return this.interpolate_(i,s,e,n)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){const t=this.resultBuffer,i=this.sampleValues,n=this.valueSize,s=e*n;for(let a=0;a!==n;++a)t[a]=i[s+a];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}}class of extends Ns{constructor(e,t,i,n){super(e,t,i,n),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Sl,endingEnd:Sl}}intervalChanged_(e,t,i){const n=this.parameterPositions;let s=e-2,a=e+1,o=n[s],c=n[a];if(o===void 0)switch(this.getSettings_().endingStart){case El:s=e,o=2*t-i;break;case Tl:s=n.length-2,o=t+n[s]-n[s+1];break;default:s=e,o=i}if(c===void 0)switch(this.getSettings_().endingEnd){case El:a=e,c=2*i-t;break;case Tl:a=1,c=i+n[1]-n[0];break;default:a=e-1,c=t}const l=(i-t)*.5,h=this.valueSize;this._weightPrev=l/(t-o),this._weightNext=l/(c-i),this._offsetPrev=s*h,this._offsetNext=a*h}interpolate_(e,t,i,n){const s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,h=this._offsetPrev,d=this._offsetNext,u=this._weightPrev,f=this._weightNext,g=(i-t)/(n-t),v=g*g,m=v*g,p=-u*m+2*u*v-u*g,M=(1+u)*m+(-1.5-2*u)*v+(-.5+u)*g+1,T=(-1-f)*m+(1.5+f)*v+.5*g,y=f*m-f*v;for(let E=0;E!==o;++E)s[E]=p*a[h+E]+M*a[l+E]+T*a[c+E]+y*a[d+E];return s}}class lf extends Ns{constructor(e,t,i,n){super(e,t,i,n)}interpolate_(e,t,i,n){const s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,h=(i-t)/(n-t),d=1-h;for(let u=0;u!==o;++u)s[u]=a[l+u]*d+a[c+u]*h;return s}}class cf extends Ns{constructor(e,t,i,n){super(e,t,i,n)}interpolate_(e){return this.copySampleValue_(e-1)}}class hf extends Ns{interpolate_(e,t,i,n){const s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,h=this.inTangents,d=this.outTangents;if(!h||!d){const g=(i-t)/(n-t),v=1-g;for(let m=0;m!==o;++m)s[m]=a[l+m]*v+a[c+m]*g;return s}const u=o*2,f=e-1;for(let g=0;g!==o;++g){const v=a[l+g],m=a[c+g],p=f*u+g*2,M=d[p],T=d[p+1],y=e*u+g*2,E=h[y],w=h[y+1];let A=(i-t)/(n-t),_,S,P,R,L;for(let H=0;H<8;H++){_=A*A,S=_*A,P=1-A,R=P*P,L=R*P;const F=L*t+3*R*A*M+3*P*_*E+S*n-i;if(Math.abs(F)<1e-10)break;const N=3*R*(M-t)+6*P*A*(E-M)+3*_*(n-E);if(Math.abs(N)<1e-10)break;A=A-F/N,A=Math.max(0,Math.min(1,A))}s[g]=L*v+3*R*A*T+3*P*_*w+S*m}return s}}class di{constructor(e,t,i,n){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=rr(t,this.TimeBufferType),this.values=rr(i,this.ValueBufferType),this.setInterpolation(n||this.DefaultInterpolation)}static toJSON(e){const t=e.constructor;let i;if(t.toJSON!==this.toJSON)i=t.toJSON(e);else{i={name:e.name,times:rr(e.times,Array),values:rr(e.values,Array)};const n=e.getInterpolation();n!==e.DefaultInterpolation&&(i.interpolation=n)}return i.type=e.ValueTypeName,i}InterpolantFactoryMethodDiscrete(e){return new cf(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new lf(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new of(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){const t=new hf(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case Ts:t=this.InterpolantFactoryMethodDiscrete;break;case Ro:t=this.InterpolantFactoryMethodLinear;break;case ia:t=this.InterpolantFactoryMethodSmooth;break;case Co:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){const i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return Le("KeyframeTrack:",i),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Ts;case this.InterpolantFactoryMethodLinear:return Ro;case this.InterpolantFactoryMethodSmooth:return ia;case this.InterpolantFactoryMethodBezier:return Co}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){const t=this.times;for(let i=0,n=t.length;i!==n;++i)t[i]+=e}return this}scale(e){if(e!==1){const t=this.times;for(let i=0,n=t.length;i!==n;++i)t[i]*=e}return this}trim(e,t){const i=this.times,n=i.length;let s=0,a=n-1;for(;s!==n&&i[s]<e;)++s;for(;a!==-1&&i[a]>t;)--a;if(++a,s!==0||a!==n){s>=a&&(a=Math.max(a,1),s=a-1);const o=this.getValueSize();this.times=i.slice(s,a),this.values=this.values.slice(s*o,a*o)}return this}validate(){let e=!0;const t=this.getValueSize();t-Math.floor(t)!==0&&(We("KeyframeTrack: Invalid value size in track.",this),e=!1);const i=this.times,n=this.values,s=i.length;s===0&&(We("KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==s;o++){const c=i[o];if(typeof c=="number"&&isNaN(c)){We("KeyframeTrack: Time is not a valid number.",this,o,c),e=!1;break}if(a!==null&&a>c){We("KeyframeTrack: Out of order keys.",this,o,c,a),e=!1;break}a=c}if(n!==void 0&&Hu(n))for(let o=0,c=n.length;o!==c;++o){const l=n[o];if(isNaN(l)){We("KeyframeTrack: Value is not a valid number.",this,o,l),e=!1;break}}return e}optimize(){const e=this.times.slice(),t=this.values.slice(),i=this.getValueSize(),n=this.getInterpolation()===ia,s=e.length-1;let a=1;for(let o=1;o<s;++o){let c=!1;const l=e[o],h=e[o+1];if(l!==h&&(o!==1||l!==e[0]))if(n)c=!0;else{const d=o*i,u=d-i,f=d+i;for(let g=0;g!==i;++g){const v=t[d+g];if(v!==t[u+g]||v!==t[f+g]){c=!0;break}}}if(c){if(o!==a){e[a]=e[o];const d=o*i,u=a*i;for(let f=0;f!==i;++f)t[u+f]=t[d+f]}++a}}if(s>0){e[a]=e[s];for(let o=s*i,c=a*i,l=0;l!==i;++l)t[c+l]=t[o+l];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*i)):(this.times=e,this.values=t),this}clone(){const e=this.times.slice(),t=this.values.slice(),i=this.constructor,n=new i(this.name,e,t);return n.createInterpolant=this.createInterpolant,n}}di.prototype.ValueTypeName="";di.prototype.TimeBufferType=Float32Array;di.prototype.ValueBufferType=Float32Array;di.prototype.DefaultInterpolation=Ro;class is extends di{constructor(e,t,i){super(e,t,i)}}is.prototype.ValueTypeName="bool";is.prototype.ValueBufferType=Array;is.prototype.DefaultInterpolation=Ts;is.prototype.InterpolantFactoryMethodLinear=void 0;is.prototype.InterpolantFactoryMethodSmooth=void 0;class Lh extends di{constructor(e,t,i,n){super(e,t,i,n)}}Lh.prototype.ValueTypeName="color";class $o extends di{constructor(e,t,i,n){super(e,t,i,n)}}$o.prototype.ValueTypeName="number";class uf extends Ns{constructor(e,t,i,n){super(e,t,i,n)}interpolate_(e,t,i,n){const s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=(i-t)/(n-t);let l=e*o;for(let h=l+o;l!==h;l+=4)Pt.slerpFlat(s,0,a,l-o,a,l,c);return s}}class Xn extends di{constructor(e,t,i,n){super(e,t,i,n)}InterpolantFactoryMethodLinear(e){return new uf(this.times,this.values,this.getValueSize(),e)}}Xn.prototype.ValueTypeName="quaternion";Xn.prototype.InterpolantFactoryMethodSmooth=void 0;class ns extends di{constructor(e,t,i){super(e,t,i)}}ns.prototype.ValueTypeName="string";ns.prototype.ValueBufferType=Array;ns.prototype.DefaultInterpolation=Ts;ns.prototype.InterpolantFactoryMethodLinear=void 0;ns.prototype.InterpolantFactoryMethodSmooth=void 0;class ni extends di{constructor(e,t,i,n){super(e,t,i,n)}}ni.prototype.ValueTypeName="vector";class ac{constructor(e="",t=-1,i=[],n=Lu){this.name=e,this.tracks=i,this.duration=t,this.blendMode=n,this.uuid=nn(),this.userData={},this.duration<0&&this.resetDuration()}static parse(e){const t=[],i=e.tracks,n=1/(e.fps||1);for(let a=0,o=i.length;a!==o;++a)t.push(ff(i[a]).scale(n));const s=new this(e.name,e.duration,t,e.blendMode);return s.uuid=e.uuid,s.userData=JSON.parse(e.userData||"{}"),s}static toJSON(e){const t=[],i=e.tracks,n={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let s=0,a=i.length;s!==a;++s)t.push(di.toJSON(i[s]));return n}static CreateFromMorphTargetSequence(e,t,i,n){const s=t.length,a=[];for(let o=0;o<s;o++){let c=[],l=[];c.push((o+s-1)%s,o,(o+1)%s),l.push(0,1,0);const h=rf(c);c=rc(c,1,h),l=rc(l,1,h),!n&&c[0]===0&&(c.push(s),l.push(l[0])),a.push(new $o(".morphTargetInfluences["+t[o].name+"]",c,l).scale(1/i))}return new this(e,-1,a)}static findByName(e,t){let i=e;if(!Array.isArray(e)){const n=e;i=n.geometry&&n.geometry.animations||n.animations}for(let n=0;n<i.length;n++)if(i[n].name===t)return i[n];return null}static CreateClipsFromMorphTargetSequences(e,t,i){const n={},s=/^([\w-]*?)([\d]+)$/;for(let o=0,c=e.length;o<c;o++){const l=e[o],h=l.name.match(s);if(h&&h.length>1){const d=h[1];let u=n[d];u||(n[d]=u=[]),u.push(l)}}const a=[];for(const o in n)a.push(this.CreateFromMorphTargetSequence(o,n[o],t,i));return a}resetDuration(){const e=this.tracks;let t=0;for(let i=0,n=e.length;i!==n;++i){const s=this.tracks[i];t=Math.max(t,s.times[s.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){const e=[];for(let i=0;i<this.tracks.length;i++)e.push(this.tracks[i].clone());const t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}}function df(r){switch(r.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return $o;case"vector":case"vector2":case"vector3":case"vector4":return ni;case"color":return Lh;case"quaternion":return Xn;case"bool":case"boolean":return is;case"string":return ns}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+r)}function ff(r){if(r.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");const e=df(r.type);if(r.times===void 0){const t=[],i=[];af(r.keys,t,i,"value"),r.times=t,r.values=i}return e.parse!==void 0?e.parse(r):new e(r.name,r.times,r.values,r.interpolation)}const Ms={enabled:!1,files:{},add:function(r,e){this.enabled!==!1&&(oc(r)||(this.files[r]=e))},get:function(r){if(this.enabled!==!1&&!oc(r))return this.files[r]},remove:function(r){delete this.files[r]},clear:function(){this.files={}}};function oc(r){try{const e=r.slice(r.indexOf(":")+1);return new URL(e).protocol==="blob:"}catch{return!1}}class pf{constructor(e,t,i){const n=this;let s=!1,a=0,o=0,c;const l=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=i,this._abortController=null,this.itemStart=function(h){o++,s===!1&&n.onStart!==void 0&&n.onStart(h,a,o),s=!0},this.itemEnd=function(h){a++,n.onProgress!==void 0&&n.onProgress(h,a,o),a===o&&(s=!1,n.onLoad!==void 0&&n.onLoad())},this.itemError=function(h){n.onError!==void 0&&n.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),c?c(h):h},this.setURLModifier=function(h){return c=h,this},this.addHandler=function(h,d){return l.push(h,d),this},this.removeHandler=function(h){const d=l.indexOf(h);return d!==-1&&l.splice(d,2),this},this.getHandler=function(h){for(let d=0,u=l.length;d<u;d+=2){const f=l[d],g=l[d+1];if(f.global&&(f.lastIndex=0),f.test(h))return g}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}}const Nh=new pf;class sn{constructor(e){this.manager=e!==void 0?e:Nh,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){const i=this;return new Promise(function(n,s){i.load(e,n,t,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}}sn.DEFAULT_MATERIAL_NAME="__DEFAULT";const Li={};class mf extends Error{constructor(e,t){super(e),this.response=t}}class Jo extends sn{constructor(e){super(e),this.mimeType="",this.responseType="",this._abortController=new AbortController}load(e,t,i,n){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=Ms.get(`file:${e}`);if(s!==void 0){this.manager.itemStart(e),setTimeout(()=>{t&&t(s),this.manager.itemEnd(e)},0);return}if(Li[e]!==void 0){Li[e].push({onLoad:t,onProgress:i,onError:n});return}Li[e]=[],Li[e].push({onLoad:t,onProgress:i,onError:n});const a=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",signal:typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),o=this.mimeType,c=this.responseType;fetch(a).then(l=>{if(l.status===200||l.status===0){if(l.status===0&&Le("FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||l.body===void 0||l.body.getReader===void 0)return l;const h=Li[e],d=l.body.getReader(),u=l.headers.get("X-File-Size")||l.headers.get("Content-Length"),f=u?parseInt(u):0,g=f!==0;let v=0;const m=new ReadableStream({start(p){M();function M(){d.read().then(({done:T,value:y})=>{if(T)p.close();else{v+=y.byteLength;const E=new ProgressEvent("progress",{lengthComputable:g,loaded:v,total:f});for(let w=0,A=h.length;w<A;w++){const _=h[w];_.onProgress&&_.onProgress(E)}p.enqueue(y),M()}},T=>{p.error(T)})}}});return new Response(m)}else throw new mf(`fetch for "${l.url}" responded with ${l.status}: ${l.statusText}`,l)}).then(l=>{switch(c){case"arraybuffer":return l.arrayBuffer();case"blob":return l.blob();case"document":return l.text().then(h=>new DOMParser().parseFromString(h,o));case"json":return l.json();default:if(o==="")return l.text();{const d=/charset="?([^;"\s]*)"?/i.exec(o),u=d&&d[1]?d[1].toLowerCase():void 0,f=new TextDecoder(u);return l.arrayBuffer().then(g=>f.decode(g))}}}).then(l=>{Ms.add(`file:${e}`,l);const h=Li[e];delete Li[e];for(let d=0,u=h.length;d<u;d++){const f=h[d];f.onLoad&&f.onLoad(l)}}).catch(l=>{const h=Li[e];if(h===void 0)throw this.manager.itemError(e),l;delete Li[e];for(let d=0,u=h.length;d<u;d++){const f=h[d];f.onError&&f.onError(l)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}const Dn=new WeakMap;class gf extends sn{constructor(e){super(e)}load(e,t,i,n){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=this,a=Ms.get(`image:${e}`);if(a!==void 0){if(a.complete===!0)s.manager.itemStart(e),setTimeout(function(){t&&t(a),s.manager.itemEnd(e)},0);else{let d=Dn.get(a);d===void 0&&(d=[],Dn.set(a,d)),d.push({onLoad:t,onError:n})}return a}const o=As("img");function c(){h(),t&&t(this);const d=Dn.get(this)||[];for(let u=0;u<d.length;u++){const f=d[u];f.onLoad&&f.onLoad(this)}Dn.delete(this),s.manager.itemEnd(e)}function l(d){h(),n&&n(d),Ms.remove(`image:${e}`);const u=Dn.get(this)||[];for(let f=0;f<u.length;f++){const g=u[f];g.onError&&g.onError(d)}Dn.delete(this),s.manager.itemError(e),s.manager.itemEnd(e)}function h(){o.removeEventListener("load",c,!1),o.removeEventListener("error",l,!1)}return o.addEventListener("load",c,!1),o.addEventListener("error",l,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),Ms.add(`image:${e}`,o),s.manager.itemStart(e),o.src=e,o}}class _f extends sn{constructor(e){super(e)}load(e,t,i,n){const s=this,a=new Lr,o=new Jo(this.manager);return o.setResponseType("arraybuffer"),o.setRequestHeader(this.requestHeader),o.setPath(this.path),o.setWithCredentials(s.withCredentials),o.load(e,function(c){let l;try{l=s.parse(c)}catch(h){n!==void 0?n(h):We(h);return}s._applyTexData(a,l),t&&t(a,l)},i,n),a}createDataTexture(e){const t=new Lr;return this._applyTexData(t,this.parse(e)),t}_applyTexData(e,t){t.image!==void 0?e.image=t.image:t.data!==void 0&&(e.image.width=t.width,e.image.height=t.height,e.image.data=t.data),e.wrapS=t.wrapS!==void 0?t.wrapS:Qt,e.wrapT=t.wrapT!==void 0?t.wrapT:Qt,e.magFilter=t.magFilter!==void 0?t.magFilter:St,e.minFilter=t.minFilter!==void 0?t.minFilter:St,e.anisotropy=t.anisotropy!==void 0?t.anisotropy:1,t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.mipmaps!==void 0&&(e.mipmaps=t.mipmaps,e.minFilter=Di),t.mipmapCount===1&&(e.minFilter=St),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),e.needsUpdate=!0}}class Dh extends sn{constructor(e){super(e)}load(e,t,i,n){const s=new Ot,a=new gf(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(o){s.image=o,s.needsUpdate=!0,t!==void 0&&t(s)},i,n),s}}class Ds extends ft{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Be(e),this.intensity=t}dispose(){this.dispatchEvent({type:"dispose"})}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}}class xf extends Ds{constructor(e,t,i){super(e,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(ft.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Be(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){const t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}}const Ra=new Oe,lc=new D,cc=new D;class jo{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new De(512,512),this.mapType=jt,this.map=null,this.mapPass=null,this.matrix=new Oe,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Yo,this._frameExtents=new De(1,1),this._viewportCount=1,this._viewports=[new it(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,i=this.matrix;lc.setFromMatrixPosition(e.matrixWorld),t.position.copy(lc),cc.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(cc),t.updateMatrixWorld(),Ra.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Ra,t.coordinateSystem,t.reversedDepth),t.coordinateSystem===ws||t.reversedDepth?i.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(Ra)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}const ar=new D,or=new Pt,gi=new D;class Ih extends ft{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Oe,this.projectionMatrix=new Oe,this.projectionMatrixInverse=new Oe,this.coordinateSystem=bi,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(ar,or,gi),gi.x===1&&gi.y===1&&gi.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(ar,or,gi.set(1,1,1)).invert()}updateWorldMatrix(e,t,i=!1){super.updateWorldMatrix(e,t,i),this.matrixWorld.decompose(ar,or,gi),gi.x===1&&gi.y===1&&gi.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(ar,or,gi.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}const Yi=new D,hc=new De,uc=new De;class Ft extends Ih{constructor(e=50,t=1,i=.1,n=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=n,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=Zn*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(vs*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Zn*2*Math.atan(Math.tan(vs*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){Yi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Yi.x,Yi.y).multiplyScalar(-e/Yi.z),Yi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Yi.x,Yi.y).multiplyScalar(-e/Yi.z)}getViewSize(e,t){return this.getViewBounds(e,hc,uc),t.subVectors(uc,hc)}setViewOffset(e,t,i,n,s,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=n,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(vs*.5*this.fov)/this.zoom,i=2*t,n=this.aspect*i,s=-.5*n;const a=this.view;if(this.view!==null&&this.view.enabled){const c=a.fullWidth,l=a.fullHeight;s+=a.offsetX*n/c,t-=a.offsetY*i/l,n*=a.width/c,i*=a.height/l}const o=this.filmOffset;o!==0&&(s+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+n,t,t-i,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}class vf extends jo{constructor(){super(new Ft(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){const t=this.camera,i=Zn*2*e.angle*this.focus,n=this.mapSize.width/this.mapSize.height*this.aspect,s=e.distance||t.far;(i!==t.fov||n!==t.aspect||s!==t.far)&&(t.fov=i,t.aspect=n,t.far=s,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}}class yf extends Ds{constructor(e,t,i=0,n=Math.PI/3,s=0,a=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(ft.DEFAULT_UP),this.updateMatrix(),this.target=new ft,this.distance=i,this.angle=n,this.penumbra=s,this.decay=a,this.map=null,this.shadow=new vf}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.map=e.map,this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.distance=this.distance,t.object.angle=this.angle,t.object.decay=this.decay,t.object.penumbra=this.penumbra,t.object.target=this.target.uuid,this.map&&this.map.isTexture&&(t.object.map=this.map.toJSON(e).uuid),t.object.shadow=this.shadow.toJSON(),t}}class bf extends jo{constructor(){super(new Ft(90,1,.5,500)),this.isPointLightShadow=!0}}class Mf extends Ds{constructor(e,t,i=0,n=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=n,this.shadow=new bf}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}}class qr extends Ih{constructor(e=-1,t=1,i=1,n=-1,s=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=n,this.near=s,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,n,s,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=n,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,n=(this.top+this.bottom)/2;let s=i-e,a=i+e,o=n+t,c=n-t;if(this.view!==null&&this.view.enabled){const l=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=l*this.view.offsetX,a=s+l*this.view.width,o-=h*this.view.offsetY,c=o-h*this.view.height}this.projectionMatrix.makeOrthographic(s,a,o,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class Sf extends jo{constructor(){super(new qr(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class Uh extends Ds{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(ft.DEFAULT_UP),this.updateMatrix(),this.target=new ft,this.shadow=new Sf}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}}class Ef extends Ds{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}}class Fh{static extractUrlBase(e){const t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}}const In=-90,Un=1;class Tf extends ft{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const n=new Ft(In,Un,e,t);n.layers=this.layers,this.add(n);const s=new Ft(In,Un,e,t);s.layers=this.layers,this.add(s);const a=new Ft(In,Un,e,t);a.layers=this.layers,this.add(a);const o=new Ft(In,Un,e,t);o.layers=this.layers,this.add(o);const c=new Ft(In,Un,e,t);c.layers=this.layers,this.add(c);const l=new Ft(In,Un,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[i,n,s,a,o,c]=t;for(const l of t)this.remove(l);if(e===bi)i.up.set(0,1,0),i.lookAt(1,0,0),n.up.set(0,1,0),n.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===ws)i.up.set(0,-1,0),i.lookAt(-1,0,0),n.up.set(0,-1,0),n.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:n}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[s,a,o,c,l,h]=this.children,d=e.getRenderTarget(),u=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const v=i.texture.generateMipmaps;i.texture.generateMipmaps=!1;let m=!1;e.isWebGLRenderer===!0?m=e.state.buffers.depth.getReversed():m=e.reversedDepthBuffer,e.setRenderTarget(i,0,n),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(i,1,n),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(i,2,n),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(i,3,n),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),e.setRenderTarget(i,4,n),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),i.texture.generateMipmaps=v,e.setRenderTarget(i,5,n),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,h),e.setRenderTarget(d,u,f),e.xr.enabled=g,i.texture.needsPMREMUpdate=!0}}class wf extends Ft{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}class dc{constructor(e=1,t=0,i=0){this.radius=e,this.phi=t,this.theta=i}set(e,t,i){return this.radius=e,this.phi=t,this.theta=i,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=qe(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,i){return this.radius=Math.sqrt(e*e+t*t+i*i),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,i),this.phi=Math.acos(qe(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}}const ll=class ll{constructor(e,t,i,n){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,i,n)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let i=0;i<4;i++)this.elements[i]=e[i+t];return this}set(e,t,i,n){const s=this.elements;return s[0]=e,s[2]=t,s[1]=i,s[3]=n,this}};ll.prototype.isMatrix2=!0;let fc=ll;class Af extends Sh{constructor(e=10,t=10,i=4473924,n=8947848){i=new Be(i),n=new Be(n);const s=t/2,a=e/t,o=e/2,c=[],l=[];for(let u=0,f=0,g=-o;u<=t;u++,g+=a){c.push(-o,0,g,o,0,g),c.push(g,0,-o,g,0,o);const v=u===s?i:n;v.toArray(l,f),f+=3,v.toArray(l,f),f+=3,v.toArray(l,f),f+=3,v.toArray(l,f),f+=3}const h=new kt;h.setAttribute("position",new tt(c,3)),h.setAttribute("color",new tt(l,3));const d=new Nr({vertexColors:!0,toneMapped:!1});super(h,d),this.type="GridHelper"}dispose(){this.geometry.dispose(),this.material.dispose()}}class Rf extends tn{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(e){if(e===void 0){Le("Controls: connect() now requires an element.");return}this.domElement!==null&&this.disconnect(),this.domElement=e}disconnect(){}dispose(){}update(){}}function pc(r,e,t,i){const n=Cf(i);switch(t){case uh:return r*e;case fh:return r*e/n.components*n.byteLength;case Bo:return r*e/n.components*n.byteLength;case _n:return r*e*2/n.components*n.byteLength;case zo:return r*e*2/n.components*n.byteLength;case dh:return r*e*3/n.components*n.byteLength;case ri:return r*e*4/n.components*n.byteLength;case Ho:return r*e*4/n.components*n.byteLength;case yr:case br:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*8;case Mr:case Sr:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case ja:case eo:return Math.max(r,16)*Math.max(e,8)/4;case Ja:case Qa:return Math.max(r,8)*Math.max(e,8)/2;case to:case io:case so:case ro:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*8;case no:case Tr:case ao:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case oo:return Math.floor((r+3)/4)*Math.floor((e+3)/4)*16;case lo:return Math.floor((r+4)/5)*Math.floor((e+3)/4)*16;case co:return Math.floor((r+4)/5)*Math.floor((e+4)/5)*16;case ho:return Math.floor((r+5)/6)*Math.floor((e+4)/5)*16;case uo:return Math.floor((r+5)/6)*Math.floor((e+5)/6)*16;case fo:return Math.floor((r+7)/8)*Math.floor((e+4)/5)*16;case po:return Math.floor((r+7)/8)*Math.floor((e+5)/6)*16;case mo:return Math.floor((r+7)/8)*Math.floor((e+7)/8)*16;case go:return Math.floor((r+9)/10)*Math.floor((e+4)/5)*16;case _o:return Math.floor((r+9)/10)*Math.floor((e+5)/6)*16;case xo:return Math.floor((r+9)/10)*Math.floor((e+7)/8)*16;case vo:return Math.floor((r+9)/10)*Math.floor((e+9)/10)*16;case yo:return Math.floor((r+11)/12)*Math.floor((e+9)/10)*16;case bo:return Math.floor((r+11)/12)*Math.floor((e+11)/12)*16;case Mo:case So:case Eo:return Math.ceil(r/4)*Math.ceil(e/4)*16;case To:case wo:return Math.ceil(r/4)*Math.ceil(e/4)*8;case wr:case Ao:return Math.ceil(r/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Cf(r){switch(r){case jt:case oh:return{byteLength:1,components:1};case Ss:case lh:case Oi:return{byteLength:2,components:1};case Oo:case ko:return{byteLength:2,components:4};case Ei:case Fo:case ci:return{byteLength:4,components:1};case ch:case hh:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${r}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Uo}}));typeof window<"u"&&(window.__THREE__?Le("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Uo);/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function Oh(){let r=null,e=!1,t=null,i=null;function n(s,a){t(s,a),i=r.requestAnimationFrame(n)}return{start:function(){e!==!0&&t!==null&&r!==null&&(i=r.requestAnimationFrame(n),e=!0)},stop:function(){r!==null&&r.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){r=s}}}function Pf(r){const e=new WeakMap;function t(o,c){const l=o.array,h=o.usage,d=l.byteLength,u=r.createBuffer();r.bindBuffer(c,u),r.bufferData(c,l,h),o.onUploadCallback();let f;if(l instanceof Float32Array)f=r.FLOAT;else if(typeof Float16Array<"u"&&l instanceof Float16Array)f=r.HALF_FLOAT;else if(l instanceof Uint16Array)o.isFloat16BufferAttribute?f=r.HALF_FLOAT:f=r.UNSIGNED_SHORT;else if(l instanceof Int16Array)f=r.SHORT;else if(l instanceof Uint32Array)f=r.UNSIGNED_INT;else if(l instanceof Int32Array)f=r.INT;else if(l instanceof Int8Array)f=r.BYTE;else if(l instanceof Uint8Array)f=r.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)f=r.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:u,type:f,bytesPerElement:l.BYTES_PER_ELEMENT,version:o.version,size:d}}function i(o,c,l){const h=c.array,d=c.updateRanges;if(r.bindBuffer(l,o),d.length===0)r.bufferSubData(l,0,h);else{d.sort((f,g)=>f.start-g.start);let u=0;for(let f=1;f<d.length;f++){const g=d[u],v=d[f];v.start<=g.start+g.count+1?g.count=Math.max(g.count,v.start+v.count-g.start):(++u,d[u]=v)}d.length=u+1;for(let f=0,g=d.length;f<g;f++){const v=d[f];r.bufferSubData(l,v.start*h.BYTES_PER_ELEMENT,h,v.start,v.count)}c.clearUpdateRanges()}c.onUploadCallback()}function n(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function s(o){o.isInterleavedBufferAttribute&&(o=o.data);const c=e.get(o);c&&(r.deleteBuffer(c.buffer),e.delete(o))}function a(o,c){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const h=e.get(o);(!h||h.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const l=e.get(o);if(l===void 0)e.set(o,t(o,c));else if(l.version<o.version){if(l.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(l.buffer,o,c),l.version=o.version}}return{get:n,remove:s,update:a}}var Lf=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Nf=`#ifdef USE_ALPHAHASH
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
#endif`,Df=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,If=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Uf=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Ff=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Of=`#ifdef USE_AOMAP
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
#endif`,kf=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Bf=`#ifdef USE_BATCHING
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
#endif`,zf=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Hf=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Gf=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Vf=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,Wf=`#ifdef USE_IRIDESCENCE
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
#endif`,Xf=`#ifdef USE_BUMPMAP
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
#endif`,qf=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,Yf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Kf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Zf=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,$f=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,Jf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,jf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Qf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,ep=`#define PI 3.141592653589793
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
} // validated`,tp=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,ip=`vec3 transformedNormal = objectNormal;
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
#endif`,np=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,sp=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,rp=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,ap=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,op="gl_FragColor = linearToOutputTexel( gl_FragColor );",lp=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,cp=`#ifdef USE_ENVMAP
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
#endif`,hp=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,up=`#ifdef USE_ENVMAP
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
#endif`,dp=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,fp=`#ifdef USE_ENVMAP
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
#endif`,pp=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,mp=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,gp=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,_p=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,xp=`#ifdef USE_GRADIENTMAP
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
}`,vp=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,yp=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,bp=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Mp=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,Sp=`#ifdef USE_ENVMAP
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
#endif`,Ep=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Tp=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,wp=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Ap=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Rp=`PhysicalMaterial material;
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
#endif`,Cp=`uniform sampler2D dfgLUT;
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
}`,Pp=`
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
#endif`,Lp=`#if defined( RE_IndirectDiffuse )
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
#endif`,Np=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Dp=`#ifdef USE_LIGHT_PROBES_GRID
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
#endif`,Ip=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Up=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Fp=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Op=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,kp=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Bp=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,zp=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Hp=`#if defined( USE_POINTS_UV )
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
#endif`,Gp=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Vp=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Wp=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Xp=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,qp=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Yp=`#ifdef USE_MORPHTARGETS
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
#endif`,Kp=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Zp=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,$p=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,Jp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,jp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Qp=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,em=`#ifdef USE_NORMALMAP
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
#endif`,tm=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,im=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,nm=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,sm=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,rm=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,am=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,om=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,lm=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,cm=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,hm=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,um=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,dm=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,fm=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,pm=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,mm=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,gm=`float getShadowMask() {
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
}`,_m=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,xm=`#ifdef USE_SKINNING
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
#endif`,vm=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,ym=`#ifdef USE_SKINNING
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
#endif`,bm=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Mm=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Sm=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Em=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,Tm=`#ifdef USE_TRANSMISSION
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
#endif`,wm=`#ifdef USE_TRANSMISSION
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
#endif`,Am=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Rm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Cm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Pm=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Lm=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Nm=`uniform sampler2D t2D;
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
}`,Dm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Im=`#ifdef ENVMAP_TYPE_CUBE
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
}`,Um=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Fm=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Om=`#include <common>
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
}`,km=`#if DEPTH_PACKING == 3200
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
}`,Bm=`#define DISTANCE
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
}`,zm=`#define DISTANCE
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
}`,Hm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Gm=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Vm=`uniform float scale;
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
}`,Wm=`uniform vec3 diffuse;
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
}`,Xm=`#include <common>
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
}`,qm=`uniform vec3 diffuse;
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
}`,Ym=`#define LAMBERT
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
}`,Km=`#define LAMBERT
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
}`,Zm=`#define MATCAP
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
}`,$m=`#define MATCAP
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
}`,Jm=`#define NORMAL
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
}`,jm=`#define NORMAL
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
}`,Qm=`#define PHONG
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
}`,eg=`#define PHONG
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
}`,tg=`#define STANDARD
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
}`,ig=`#define STANDARD
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
}`,ng=`#define TOON
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
}`,sg=`#define TOON
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
}`,rg=`uniform float size;
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
}`,ag=`uniform vec3 diffuse;
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
}`,og=`#include <common>
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
}`,lg=`uniform vec3 color;
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
}`,cg=`uniform float rotation;
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
}`,hg=`uniform vec3 diffuse;
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
}`,Ge={alphahash_fragment:Lf,alphahash_pars_fragment:Nf,alphamap_fragment:Df,alphamap_pars_fragment:If,alphatest_fragment:Uf,alphatest_pars_fragment:Ff,aomap_fragment:Of,aomap_pars_fragment:kf,batching_pars_vertex:Bf,batching_vertex:zf,begin_vertex:Hf,beginnormal_vertex:Gf,bsdfs:Vf,iridescence_fragment:Wf,bumpmap_pars_fragment:Xf,clipping_planes_fragment:qf,clipping_planes_pars_fragment:Yf,clipping_planes_pars_vertex:Kf,clipping_planes_vertex:Zf,color_fragment:$f,color_pars_fragment:Jf,color_pars_vertex:jf,color_vertex:Qf,common:ep,cube_uv_reflection_fragment:tp,defaultnormal_vertex:ip,displacementmap_pars_vertex:np,displacementmap_vertex:sp,emissivemap_fragment:rp,emissivemap_pars_fragment:ap,colorspace_fragment:op,colorspace_pars_fragment:lp,envmap_fragment:cp,envmap_common_pars_fragment:hp,envmap_pars_fragment:up,envmap_pars_vertex:dp,envmap_physical_pars_fragment:Sp,envmap_vertex:fp,fog_vertex:pp,fog_pars_vertex:mp,fog_fragment:gp,fog_pars_fragment:_p,gradientmap_pars_fragment:xp,lightmap_pars_fragment:vp,lights_lambert_fragment:yp,lights_lambert_pars_fragment:bp,lights_pars_begin:Mp,lights_toon_fragment:Ep,lights_toon_pars_fragment:Tp,lights_phong_fragment:wp,lights_phong_pars_fragment:Ap,lights_physical_fragment:Rp,lights_physical_pars_fragment:Cp,lights_fragment_begin:Pp,lights_fragment_maps:Lp,lights_fragment_end:Np,lightprobes_pars_fragment:Dp,logdepthbuf_fragment:Ip,logdepthbuf_pars_fragment:Up,logdepthbuf_pars_vertex:Fp,logdepthbuf_vertex:Op,map_fragment:kp,map_pars_fragment:Bp,map_particle_fragment:zp,map_particle_pars_fragment:Hp,metalnessmap_fragment:Gp,metalnessmap_pars_fragment:Vp,morphinstance_vertex:Wp,morphcolor_vertex:Xp,morphnormal_vertex:qp,morphtarget_pars_vertex:Yp,morphtarget_vertex:Kp,normal_fragment_begin:Zp,normal_fragment_maps:$p,normal_pars_fragment:Jp,normal_pars_vertex:jp,normal_vertex:Qp,normalmap_pars_fragment:em,clearcoat_normal_fragment_begin:tm,clearcoat_normal_fragment_maps:im,clearcoat_pars_fragment:nm,iridescence_pars_fragment:sm,opaque_fragment:rm,packing:am,premultiplied_alpha_fragment:om,project_vertex:lm,dithering_fragment:cm,dithering_pars_fragment:hm,roughnessmap_fragment:um,roughnessmap_pars_fragment:dm,shadowmap_pars_fragment:fm,shadowmap_pars_vertex:pm,shadowmap_vertex:mm,shadowmask_pars_fragment:gm,skinbase_vertex:_m,skinning_pars_vertex:xm,skinning_vertex:vm,skinnormal_vertex:ym,specularmap_fragment:bm,specularmap_pars_fragment:Mm,tonemapping_fragment:Sm,tonemapping_pars_fragment:Em,transmission_fragment:Tm,transmission_pars_fragment:wm,uv_pars_fragment:Am,uv_pars_vertex:Rm,uv_vertex:Cm,worldpos_vertex:Pm,background_vert:Lm,background_frag:Nm,backgroundCube_vert:Dm,backgroundCube_frag:Im,cube_vert:Um,cube_frag:Fm,depth_vert:Om,depth_frag:km,distance_vert:Bm,distance_frag:zm,equirect_vert:Hm,equirect_frag:Gm,linedashed_vert:Vm,linedashed_frag:Wm,meshbasic_vert:Xm,meshbasic_frag:qm,meshlambert_vert:Ym,meshlambert_frag:Km,meshmatcap_vert:Zm,meshmatcap_frag:$m,meshnormal_vert:Jm,meshnormal_frag:jm,meshphong_vert:Qm,meshphong_frag:eg,meshphysical_vert:tg,meshphysical_frag:ig,meshtoon_vert:ng,meshtoon_frag:sg,points_vert:rg,points_frag:ag,shadow_vert:og,shadow_frag:lg,sprite_vert:cg,sprite_frag:hg},pe={common:{diffuse:{value:new Be(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ke},alphaMap:{value:null},alphaMapTransform:{value:new ke},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ke}},envmap:{envMap:{value:null},envMapRotation:{value:new ke},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ke}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ke}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ke},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ke},normalScale:{value:new De(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ke},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ke}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ke}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ke}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Be(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new D},probesMax:{value:new D},probesResolution:{value:new D}},points:{diffuse:{value:new Be(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ke},alphaTest:{value:0},uvTransform:{value:new ke}},sprite:{diffuse:{value:new Be(16777215)},opacity:{value:1},center:{value:new De(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ke},alphaMap:{value:null},alphaMapTransform:{value:new ke},alphaTest:{value:0}}},vi={basic:{uniforms:Ht([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.fog]),vertexShader:Ge.meshbasic_vert,fragmentShader:Ge.meshbasic_frag},lambert:{uniforms:Ht([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,pe.lights,{emissive:{value:new Be(0)},envMapIntensity:{value:1}}]),vertexShader:Ge.meshlambert_vert,fragmentShader:Ge.meshlambert_frag},phong:{uniforms:Ht([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,pe.lights,{emissive:{value:new Be(0)},specular:{value:new Be(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Ge.meshphong_vert,fragmentShader:Ge.meshphong_frag},standard:{uniforms:Ht([pe.common,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.roughnessmap,pe.metalnessmap,pe.fog,pe.lights,{emissive:{value:new Be(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ge.meshphysical_vert,fragmentShader:Ge.meshphysical_frag},toon:{uniforms:Ht([pe.common,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.gradientmap,pe.fog,pe.lights,{emissive:{value:new Be(0)}}]),vertexShader:Ge.meshtoon_vert,fragmentShader:Ge.meshtoon_frag},matcap:{uniforms:Ht([pe.common,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,{matcap:{value:null}}]),vertexShader:Ge.meshmatcap_vert,fragmentShader:Ge.meshmatcap_frag},points:{uniforms:Ht([pe.points,pe.fog]),vertexShader:Ge.points_vert,fragmentShader:Ge.points_frag},dashed:{uniforms:Ht([pe.common,pe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ge.linedashed_vert,fragmentShader:Ge.linedashed_frag},depth:{uniforms:Ht([pe.common,pe.displacementmap]),vertexShader:Ge.depth_vert,fragmentShader:Ge.depth_frag},normal:{uniforms:Ht([pe.common,pe.bumpmap,pe.normalmap,pe.displacementmap,{opacity:{value:1}}]),vertexShader:Ge.meshnormal_vert,fragmentShader:Ge.meshnormal_frag},sprite:{uniforms:Ht([pe.sprite,pe.fog]),vertexShader:Ge.sprite_vert,fragmentShader:Ge.sprite_frag},background:{uniforms:{uvTransform:{value:new ke},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ge.background_vert,fragmentShader:Ge.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ke}},vertexShader:Ge.backgroundCube_vert,fragmentShader:Ge.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ge.cube_vert,fragmentShader:Ge.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ge.equirect_vert,fragmentShader:Ge.equirect_frag},distance:{uniforms:Ht([pe.common,pe.displacementmap,{referencePosition:{value:new D},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ge.distance_vert,fragmentShader:Ge.distance_frag},shadow:{uniforms:Ht([pe.lights,pe.fog,{color:{value:new Be(0)},opacity:{value:1}}]),vertexShader:Ge.shadow_vert,fragmentShader:Ge.shadow_frag}};vi.physical={uniforms:Ht([vi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ke},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ke},clearcoatNormalScale:{value:new De(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ke},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ke},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ke},sheen:{value:0},sheenColor:{value:new Be(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ke},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ke},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ke},transmissionSamplerSize:{value:new De},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ke},attenuationDistance:{value:0},attenuationColor:{value:new Be(0)},specularColor:{value:new Be(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ke},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ke},anisotropyVector:{value:new De},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ke}}]),vertexShader:Ge.meshphysical_vert,fragmentShader:Ge.meshphysical_frag};const lr={r:0,b:0,g:0},ug=new Oe,kh=new ke;kh.set(-1,0,0,0,1,0,0,0,1);function dg(r,e,t,i,n,s){const a=new Be(0);let o=n===!0?0:1,c,l,h=null,d=0,u=null;function f(M){let T=M.isScene===!0?M.background:null;if(T&&T.isTexture){const y=M.backgroundBlurriness>0;T=e.get(T,y)}return T}function g(M){let T=!1;const y=f(M);y===null?m(a,o):y&&y.isColor&&(m(y,1),T=!0);const E=r.xr.getEnvironmentBlendMode();E==="additive"?t.buffers.color.setClear(0,0,0,1,s):E==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,s),(r.autoClear||T)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),r.clear(r.autoClearColor,r.autoClearDepth,r.autoClearStencil))}function v(M,T){const y=f(T);y&&(y.isCubeTexture||y.mapping===Vr)?(l===void 0&&(l=new Vt(new ts(1,1,1),new Ti({name:"BackgroundCubeMaterial",uniforms:jn(vi.backgroundCube.uniforms),vertexShader:vi.backgroundCube.vertexShader,fragmentShader:vi.backgroundCube.fragmentShader,side:qt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),l.geometry.deleteAttribute("uv"),l.onBeforeRender=function(E,w,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(l)),l.material.uniforms.envMap.value=y,l.material.uniforms.backgroundBlurriness.value=T.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=T.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(ug.makeRotationFromEuler(T.backgroundRotation)).transpose(),y.isCubeTexture&&y.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(kh),l.material.toneMapped=Xe.getTransfer(y.colorSpace)!==je,(h!==y||d!==y.version||u!==r.toneMapping)&&(l.material.needsUpdate=!0,h=y,d=y.version,u=r.toneMapping),l.layers.enableAll(),M.unshift(l,l.geometry,l.material,0,0,null)):y&&y.isTexture&&(c===void 0&&(c=new Vt(new Xr(2,2),new Ti({name:"BackgroundMaterial",uniforms:jn(vi.background.uniforms),vertexShader:vi.background.vertexShader,fragmentShader:vi.background.fragmentShader,side:Fi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(c)),c.material.uniforms.t2D.value=y,c.material.uniforms.backgroundIntensity.value=T.backgroundIntensity,c.material.toneMapped=Xe.getTransfer(y.colorSpace)!==je,y.matrixAutoUpdate===!0&&y.updateMatrix(),c.material.uniforms.uvTransform.value.copy(y.matrix),(h!==y||d!==y.version||u!==r.toneMapping)&&(c.material.needsUpdate=!0,h=y,d=y.version,u=r.toneMapping),c.layers.enableAll(),M.unshift(c,c.geometry,c.material,0,0,null))}function m(M,T){M.getRGB(lr,Ph(r)),t.buffers.color.setClear(lr.r,lr.g,lr.b,T,s)}function p(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return a},setClearColor:function(M,T=1){a.set(M),o=T,m(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(M){o=M,m(a,o)},render:g,addToRenderList:v,dispose:p}}function fg(r,e){const t=r.getParameter(r.MAX_VERTEX_ATTRIBS),i={},n=u(null);let s=n,a=!1;function o(R,L,H,K,F){let N=!1;const B=d(R,K,H,L);s!==B&&(s=B,l(s.object)),N=f(R,K,H,F),N&&g(R,K,H,F),F!==null&&e.update(F,r.ELEMENT_ARRAY_BUFFER),(N||a)&&(a=!1,y(R,L,H,K),F!==null&&r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,e.get(F).buffer))}function c(){return r.createVertexArray()}function l(R){return r.bindVertexArray(R)}function h(R){return r.deleteVertexArray(R)}function d(R,L,H,K){const F=K.wireframe===!0;let N=i[L.id];N===void 0&&(N={},i[L.id]=N);const B=R.isInstancedMesh===!0?R.id:0;let Y=N[B];Y===void 0&&(Y={},N[B]=Y);let j=Y[H.id];j===void 0&&(j={},Y[H.id]=j);let se=j[F];return se===void 0&&(se=u(c()),j[F]=se),se}function u(R){const L=[],H=[],K=[];for(let F=0;F<t;F++)L[F]=0,H[F]=0,K[F]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:L,enabledAttributes:H,attributeDivisors:K,object:R,attributes:{},index:null}}function f(R,L,H,K){const F=s.attributes,N=L.attributes;let B=0;const Y=H.getAttributes();for(const j in Y)if(Y[j].location>=0){const ne=F[j];let re=N[j];if(re===void 0&&(j==="instanceMatrix"&&R.instanceMatrix&&(re=R.instanceMatrix),j==="instanceColor"&&R.instanceColor&&(re=R.instanceColor)),ne===void 0||ne.attribute!==re||re&&ne.data!==re.data)return!0;B++}return s.attributesNum!==B||s.index!==K}function g(R,L,H,K){const F={},N=L.attributes;let B=0;const Y=H.getAttributes();for(const j in Y)if(Y[j].location>=0){let ne=N[j];ne===void 0&&(j==="instanceMatrix"&&R.instanceMatrix&&(ne=R.instanceMatrix),j==="instanceColor"&&R.instanceColor&&(ne=R.instanceColor));const re={};re.attribute=ne,ne&&ne.data&&(re.data=ne.data),F[j]=re,B++}s.attributes=F,s.attributesNum=B,s.index=K}function v(){const R=s.newAttributes;for(let L=0,H=R.length;L<H;L++)R[L]=0}function m(R){p(R,0)}function p(R,L){const H=s.newAttributes,K=s.enabledAttributes,F=s.attributeDivisors;H[R]=1,K[R]===0&&(r.enableVertexAttribArray(R),K[R]=1),F[R]!==L&&(r.vertexAttribDivisor(R,L),F[R]=L)}function M(){const R=s.newAttributes,L=s.enabledAttributes;for(let H=0,K=L.length;H<K;H++)L[H]!==R[H]&&(r.disableVertexAttribArray(H),L[H]=0)}function T(R,L,H,K,F,N,B){B===!0?r.vertexAttribIPointer(R,L,H,F,N):r.vertexAttribPointer(R,L,H,K,F,N)}function y(R,L,H,K){v();const F=K.attributes,N=H.getAttributes(),B=L.defaultAttributeValues;for(const Y in N){const j=N[Y];if(j.location>=0){let se=F[Y];if(se===void 0&&(Y==="instanceMatrix"&&R.instanceMatrix&&(se=R.instanceMatrix),Y==="instanceColor"&&R.instanceColor&&(se=R.instanceColor)),se!==void 0){const ne=se.normalized,re=se.itemSize,xe=e.get(se);if(xe===void 0)continue;const ve=xe.buffer,oe=xe.type,k=xe.bytesPerElement,J=oe===r.INT||oe===r.UNSIGNED_INT||se.gpuType===Fo;if(se.isInterleavedBufferAttribute){const te=se.data,we=te.stride,Fe=se.offset;if(te.isInstancedInterleavedBuffer){for(let Ie=0;Ie<j.locationSize;Ie++)p(j.location+Ie,te.meshPerAttribute);R.isInstancedMesh!==!0&&K._maxInstanceCount===void 0&&(K._maxInstanceCount=te.meshPerAttribute*te.count)}else for(let Ie=0;Ie<j.locationSize;Ie++)m(j.location+Ie);r.bindBuffer(r.ARRAY_BUFFER,ve);for(let Ie=0;Ie<j.locationSize;Ie++)T(j.location+Ie,re/j.locationSize,oe,ne,we*k,(Fe+re/j.locationSize*Ie)*k,J)}else{if(se.isInstancedBufferAttribute){for(let te=0;te<j.locationSize;te++)p(j.location+te,se.meshPerAttribute);R.isInstancedMesh!==!0&&K._maxInstanceCount===void 0&&(K._maxInstanceCount=se.meshPerAttribute*se.count)}else for(let te=0;te<j.locationSize;te++)m(j.location+te);r.bindBuffer(r.ARRAY_BUFFER,ve);for(let te=0;te<j.locationSize;te++)T(j.location+te,re/j.locationSize,oe,ne,re*k,re/j.locationSize*te*k,J)}}else if(B!==void 0){const ne=B[Y];if(ne!==void 0)switch(ne.length){case 2:r.vertexAttrib2fv(j.location,ne);break;case 3:r.vertexAttrib3fv(j.location,ne);break;case 4:r.vertexAttrib4fv(j.location,ne);break;default:r.vertexAttrib1fv(j.location,ne)}}}}M()}function E(){S();for(const R in i){const L=i[R];for(const H in L){const K=L[H];for(const F in K){const N=K[F];for(const B in N)h(N[B].object),delete N[B];delete K[F]}}delete i[R]}}function w(R){if(i[R.id]===void 0)return;const L=i[R.id];for(const H in L){const K=L[H];for(const F in K){const N=K[F];for(const B in N)h(N[B].object),delete N[B];delete K[F]}}delete i[R.id]}function A(R){for(const L in i){const H=i[L];for(const K in H){const F=H[K];if(F[R.id]===void 0)continue;const N=F[R.id];for(const B in N)h(N[B].object),delete N[B];delete F[R.id]}}}function _(R){for(const L in i){const H=i[L],K=R.isInstancedMesh===!0?R.id:0,F=H[K];if(F!==void 0){for(const N in F){const B=F[N];for(const Y in B)h(B[Y].object),delete B[Y];delete F[N]}delete H[K],Object.keys(H).length===0&&delete i[L]}}}function S(){P(),a=!0,s!==n&&(s=n,l(s.object))}function P(){n.geometry=null,n.program=null,n.wireframe=!1}return{setup:o,reset:S,resetDefaultState:P,dispose:E,releaseStatesOfGeometry:w,releaseStatesOfObject:_,releaseStatesOfProgram:A,initAttributes:v,enableAttribute:m,disableUnusedAttributes:M}}function pg(r,e,t){let i;function n(c){i=c}function s(c,l){r.drawArrays(i,c,l),t.update(l,i,1)}function a(c,l,h){h!==0&&(r.drawArraysInstanced(i,c,l,h),t.update(l,i,h))}function o(c,l,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,l,0,h);let u=0;for(let f=0;f<h;f++)u+=l[f];t.update(u,i,1)}this.setMode=n,this.render=s,this.renderInstances=a,this.renderMultiDraw=o}function mg(r,e,t,i){let n;function s(){if(n!==void 0)return n;if(e.has("EXT_texture_filter_anisotropic")===!0){const A=e.get("EXT_texture_filter_anisotropic");n=r.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else n=0;return n}function a(A){return!(A!==ri&&i.convert(A)!==r.getParameter(r.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(A){const _=A===Oi&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(A!==jt&&i.convert(A)!==r.getParameter(r.IMPLEMENTATION_COLOR_READ_TYPE)&&A!==ci&&!_)}function c(A){if(A==="highp"){if(r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.HIGH_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.MEDIUM_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=t.precision!==void 0?t.precision:"highp";const h=c(l);h!==l&&(Le("WebGLRenderer:",l,"not supported, using",h,"instead."),l=h);const d=t.logarithmicDepthBuffer===!0,u=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&u===!1&&Le("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");const f=r.getParameter(r.MAX_TEXTURE_IMAGE_UNITS),g=r.getParameter(r.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=r.getParameter(r.MAX_TEXTURE_SIZE),m=r.getParameter(r.MAX_CUBE_MAP_TEXTURE_SIZE),p=r.getParameter(r.MAX_VERTEX_ATTRIBS),M=r.getParameter(r.MAX_VERTEX_UNIFORM_VECTORS),T=r.getParameter(r.MAX_VARYING_VECTORS),y=r.getParameter(r.MAX_FRAGMENT_UNIFORM_VECTORS),E=r.getParameter(r.MAX_SAMPLES),w=r.getParameter(r.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:c,textureFormatReadable:a,textureTypeReadable:o,precision:l,logarithmicDepthBuffer:d,reversedDepthBuffer:u,maxTextures:f,maxVertexTextures:g,maxTextureSize:v,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:M,maxVaryings:T,maxFragmentUniforms:y,maxSamples:E,samples:w}}function gg(r){const e=this;let t=null,i=0,n=!1,s=!1;const a=new $i,o=new ke,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(d,u){const f=d.length!==0||u||i!==0||n;return n=u,i=d.length,f},this.beginShadows=function(){s=!0,h(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(d,u){t=h(d,u,0)},this.setState=function(d,u,f){const g=d.clippingPlanes,v=d.clipIntersection,m=d.clipShadows,p=r.get(d);if(!n||g===null||g.length===0||s&&!m)s?h(null):l();else{const M=s?0:i,T=M*4;let y=p.clippingState||null;c.value=y,y=h(g,u,T,f);for(let E=0;E!==T;++E)y[E]=t[E];p.clippingState=y,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=M}};function l(){c.value!==t&&(c.value=t,c.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function h(d,u,f,g){const v=d!==null?d.length:0;let m=null;if(v!==0){if(m=c.value,g!==!0||m===null){const p=f+v*4,M=u.matrixWorldInverse;o.getNormalMatrix(M),(m===null||m.length<p)&&(m=new Float32Array(p));for(let T=0,y=f;T!==v;++T,y+=4)a.copy(d[T]).applyMatrix4(M,o),a.normal.toArray(m,y),m[y+3]=a.constant}c.value=m,c.needsUpdate=!0}return e.numPlanes=v,e.numIntersection=0,m}}const Qi=4,mc=[.125,.215,.35,.446,.526,.582],fn=20,_g=256,us=new qr,gc=new Be;let Ca=null,Pa=0,La=0,Na=!1;const xg=new D;class _c{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,i=.1,n=100,s={}){const{size:a=256,position:o=xg}=s;Ca=this._renderer.getRenderTarget(),Pa=this._renderer.getActiveCubeFace(),La=this._renderer.getActiveMipmapLevel(),Na=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);const c=this._allocateTargets();return c.depthBuffer=!0,this._sceneToCubeUV(e,i,n,c,o),t>0&&this._blur(c,0,0,t),this._applyPMREM(c),this._cleanup(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=yc(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=vc(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(Ca,Pa,La),this._renderer.xr.enabled=Na,e.scissorTest=!1,Fn(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===gn||e.mapping===Kn?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Ca=this._renderer.getRenderTarget(),Pa=this._renderer.getActiveCubeFace(),La=this._renderer.getActiveMipmapLevel(),Na=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:St,minFilter:St,generateMipmaps:!1,type:Oi,format:ri,colorSpace:Rr,depthBuffer:!1},n=xc(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=xc(e,t,i);const{_lodMax:s}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=vg(s)),this._blurMaterial=bg(s,e,t),this._ggxMaterial=yg(s,e,t)}return n}_compileMaterial(e){const t=new Vt(new kt,e);this._renderer.compile(t,us)}_sceneToCubeUV(e,t,i,n,s){const c=new Ft(90,1,t,i),l=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],d=this._renderer,u=d.autoClear,f=d.toneMapping;d.getClearColor(gc),d.toneMapping=Mi,d.autoClear=!1,d.state.buffers.depth.getReversed()&&(d.setRenderTarget(n),d.clearDepth(),d.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new Vt(new ts,new Pr({name:"PMREM.Background",side:qt,depthWrite:!1,depthTest:!1})));const v=this._backgroundBox,m=v.material;let p=!1;const M=e.background;M?M.isColor&&(m.color.copy(M),e.background=null,p=!0):(m.color.copy(gc),p=!0);for(let T=0;T<6;T++){const y=T%3;y===0?(c.up.set(0,l[T],0),c.position.set(s.x,s.y,s.z),c.lookAt(s.x+h[T],s.y,s.z)):y===1?(c.up.set(0,0,l[T]),c.position.set(s.x,s.y,s.z),c.lookAt(s.x,s.y+h[T],s.z)):(c.up.set(0,l[T],0),c.position.set(s.x,s.y,s.z),c.lookAt(s.x,s.y,s.z+h[T]));const E=this._cubeSize;Fn(n,y*E,T>2?E:0,E,E),d.setRenderTarget(n),p&&d.render(v,c),d.render(e,c)}d.toneMapping=f,d.autoClear=u,e.background=M}_textureToCubeUV(e,t){const i=this._renderer,n=e.mapping===gn||e.mapping===Kn;n?(this._cubemapMaterial===null&&(this._cubemapMaterial=yc()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=vc());const s=n?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=s;const o=s.uniforms;o.envMap.value=e;const c=this._cubeSize;Fn(t,0,0,3*c,2*c),i.setRenderTarget(t),i.render(a,us)}_applyPMREM(e){const t=this._renderer,i=t.autoClear;t.autoClear=!1;const n=this._lodMeshes.length;for(let s=1;s<n;s++)this._applyGGXFilter(e,s-1,s);t.autoClear=i}_applyGGXFilter(e,t,i){const n=this._renderer,s=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[i];o.material=a;const c=a.uniforms,l=i/(this._lodMeshes.length-1),h=t/(this._lodMeshes.length-1),d=Math.sqrt(l*l-h*h),u=0+l*1.25,f=d*u,{_lodMax:g}=this,v=this._sizeLods[i],m=3*v*(i>g-Qi?i-g+Qi:0),p=4*(this._cubeSize-v);c.envMap.value=e.texture,c.roughness.value=f,c.mipInt.value=g-t,Fn(s,m,p,3*v,2*v),n.setRenderTarget(s),n.render(o,us),c.envMap.value=s.texture,c.roughness.value=0,c.mipInt.value=g-i,Fn(e,m,p,3*v,2*v),n.setRenderTarget(e),n.render(o,us)}_blur(e,t,i,n,s){const a=this._pingPongRenderTarget;this._halfBlur(e,a,t,i,n,"latitudinal",s),this._halfBlur(a,e,i,i,n,"longitudinal",s)}_halfBlur(e,t,i,n,s,a,o){const c=this._renderer,l=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&We("blur direction must be either latitudinal or longitudinal!");const h=3,d=this._lodMeshes[n];d.material=l;const u=l.uniforms,f=this._sizeLods[i]-1,g=isFinite(s)?Math.PI/(2*f):2*Math.PI/(2*fn-1),v=s/g,m=isFinite(s)?1+Math.floor(h*v):fn;m>fn&&Le(`sigmaRadians, ${s}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${fn}`);const p=[];let M=0;for(let A=0;A<fn;++A){const _=A/v,S=Math.exp(-_*_/2);p.push(S),A===0?M+=S:A<m&&(M+=2*S)}for(let A=0;A<p.length;A++)p[A]=p[A]/M;u.envMap.value=e.texture,u.samples.value=m,u.weights.value=p,u.latitudinal.value=a==="latitudinal",o&&(u.poleAxis.value=o);const{_lodMax:T}=this;u.dTheta.value=g,u.mipInt.value=T-i;const y=this._sizeLods[n],E=3*y*(n>T-Qi?n-T+Qi:0),w=4*(this._cubeSize-y);Fn(t,E,w,3*y,2*y),c.setRenderTarget(t),c.render(d,us)}}function vg(r){const e=[],t=[],i=[];let n=r;const s=r-Qi+1+mc.length;for(let a=0;a<s;a++){const o=Math.pow(2,n);e.push(o);let c=1/o;a>r-Qi?c=mc[a-r+Qi-1]:a===0&&(c=0),t.push(c);const l=1/(o-2),h=-l,d=1+l,u=[h,h,d,h,d,d,h,h,d,d,h,d],f=6,g=6,v=3,m=2,p=1,M=new Float32Array(v*g*f),T=new Float32Array(m*g*f),y=new Float32Array(p*g*f);for(let w=0;w<f;w++){const A=w%3*2/3-1,_=w>2?0:-1,S=[A,_,0,A+2/3,_,0,A+2/3,_+1,0,A,_,0,A+2/3,_+1,0,A,_+1,0];M.set(S,v*g*w),T.set(u,m*g*w);const P=[w,w,w,w,w,w];y.set(P,p*g*w)}const E=new kt;E.setAttribute("position",new ei(M,v)),E.setAttribute("uv",new ei(T,m)),E.setAttribute("faceIndex",new ei(y,p)),i.push(new Vt(E,null)),n>Qi&&n--}return{lodMeshes:i,sizeLods:e,sigmas:t}}function xc(r,e,t){const i=new Si(r,e,t);return i.texture.mapping=Vr,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Fn(r,e,t,i,n){r.viewport.set(e,t,i,n),r.scissor.set(e,t,i,n)}function yg(r,e,t){return new Ti({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:_g,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${r}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Yr(),fragmentShader:`

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
		`,blending:Ii,depthTest:!1,depthWrite:!1})}function bg(r,e,t){const i=new Float32Array(fn),n=new D(0,1,0);return new Ti({name:"SphericalGaussianBlur",defines:{n:fn,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${r}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:n}},vertexShader:Yr(),fragmentShader:`

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
		`,blending:Ii,depthTest:!1,depthWrite:!1})}function vc(){return new Ti({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Yr(),fragmentShader:`

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
		`,blending:Ii,depthTest:!1,depthWrite:!1})}function yc(){return new Ti({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Yr(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Ii,depthTest:!1,depthWrite:!1})}function Yr(){return`

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
	`}class Bh extends Si{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const i={width:e,height:e,depth:1},n=[i,i,i,i,i,i];this.texture=new Eh(n),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},n=new ts(5,5,5),s=new Ti({name:"CubemapFromEquirect",uniforms:jn(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:qt,blending:Ii});s.uniforms.tEquirect.value=t;const a=new Vt(n,s),o=t.minFilter;return t.minFilter===Di&&(t.minFilter=St),new Tf(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,i=!0,n=!0){const s=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,i,n);e.setRenderTarget(s)}}function Mg(r){let e=new WeakMap,t=new WeakMap,i=null;function n(u,f=!1){return u==null?null:f?a(u):s(u)}function s(u){if(u&&u.isTexture){const f=u.mapping;if(f===Qr||f===ea)if(e.has(u)){const g=e.get(u).texture;return o(g,u.mapping)}else{const g=u.image;if(g&&g.height>0){const v=new Bh(g.height);return v.fromEquirectangularTexture(r,u),e.set(u,v),u.addEventListener("dispose",l),o(v.texture,u.mapping)}else return null}}return u}function a(u){if(u&&u.isTexture){const f=u.mapping,g=f===Qr||f===ea,v=f===gn||f===Kn;if(g||v){let m=t.get(u);const p=m!==void 0?m.texture.pmremVersion:0;if(u.isRenderTargetTexture&&u.pmremVersion!==p)return i===null&&(i=new _c(r)),m=g?i.fromEquirectangular(u,m):i.fromCubemap(u,m),m.texture.pmremVersion=u.pmremVersion,t.set(u,m),m.texture;if(m!==void 0)return m.texture;{const M=u.image;return g&&M&&M.height>0||v&&M&&c(M)?(i===null&&(i=new _c(r)),m=g?i.fromEquirectangular(u):i.fromCubemap(u),m.texture.pmremVersion=u.pmremVersion,t.set(u,m),u.addEventListener("dispose",h),m.texture):null}}}return u}function o(u,f){return f===Qr?u.mapping=gn:f===ea&&(u.mapping=Kn),u}function c(u){let f=0;const g=6;for(let v=0;v<g;v++)u[v]!==void 0&&f++;return f===g}function l(u){const f=u.target;f.removeEventListener("dispose",l);const g=e.get(f);g!==void 0&&(e.delete(f),g.dispose())}function h(u){const f=u.target;f.removeEventListener("dispose",h);const g=t.get(f);g!==void 0&&(t.delete(f),g.dispose())}function d(){e=new WeakMap,t=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:n,dispose:d}}function Sg(r){const e={};function t(i){if(e[i]!==void 0)return e[i];const n=r.getExtension(i);return e[i]=n,n}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){const n=t(i);return n===null&&Vn("WebGLRenderer: "+i+" extension not supported."),n}}}function Eg(r,e,t,i){const n={},s=new WeakMap;function a(d){const u=d.target;u.index!==null&&e.remove(u.index);for(const g in u.attributes)e.remove(u.attributes[g]);u.removeEventListener("dispose",a),delete n[u.id];const f=s.get(u);f&&(e.remove(f),s.delete(u)),i.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,t.memory.geometries--}function o(d,u){return n[u.id]===!0||(u.addEventListener("dispose",a),n[u.id]=!0,t.memory.geometries++),u}function c(d){const u=d.attributes;for(const f in u)e.update(u[f],r.ARRAY_BUFFER)}function l(d){const u=[],f=d.index,g=d.attributes.position;let v=0;if(g===void 0)return;if(f!==null){const M=f.array;v=f.version;for(let T=0,y=M.length;T<y;T+=3){const E=M[T+0],w=M[T+1],A=M[T+2];u.push(E,w,w,A,A,E)}}else{const M=g.array;v=g.version;for(let T=0,y=M.length/3-1;T<y;T+=3){const E=T+0,w=T+1,A=T+2;u.push(E,w,w,A,A,E)}}const m=new(g.count>=65535?yh:vh)(u,1);m.version=v;const p=s.get(d);p&&e.remove(p),s.set(d,m)}function h(d){const u=s.get(d);if(u){const f=d.index;f!==null&&u.version<f.version&&l(d)}else l(d);return s.get(d)}return{get:o,update:c,getWireframeAttribute:h}}function Tg(r,e,t){let i;function n(d){i=d}let s,a;function o(d){s=d.type,a=d.bytesPerElement}function c(d,u){r.drawElements(i,u,s,d*a),t.update(u,i,1)}function l(d,u,f){f!==0&&(r.drawElementsInstanced(i,u,s,d*a,f),t.update(u,i,f))}function h(d,u,f){if(f===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,u,0,s,d,0,f);let v=0;for(let m=0;m<f;m++)v+=u[m];t.update(v,i,1)}this.setMode=n,this.setIndex=o,this.render=c,this.renderInstances=l,this.renderMultiDraw=h}function wg(r){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(s,a,o){switch(t.calls++,a){case r.TRIANGLES:t.triangles+=o*(s/3);break;case r.LINES:t.lines+=o*(s/2);break;case r.LINE_STRIP:t.lines+=o*(s-1);break;case r.LINE_LOOP:t.lines+=o*s;break;case r.POINTS:t.points+=o*s;break;default:We("WebGLInfo: Unknown draw mode:",a);break}}function n(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:n,update:i}}function Ag(r,e,t){const i=new WeakMap,n=new it;function s(a,o,c){const l=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,d=h!==void 0?h.length:0;let u=i.get(o);if(u===void 0||u.count!==d){let P=function(){_.dispose(),i.delete(o),o.removeEventListener("dispose",P)};var f=P;u!==void 0&&u.texture.dispose();const g=o.morphAttributes.position!==void 0,v=o.morphAttributes.normal!==void 0,m=o.morphAttributes.color!==void 0,p=o.morphAttributes.position||[],M=o.morphAttributes.normal||[],T=o.morphAttributes.color||[];let y=0;g===!0&&(y=1),v===!0&&(y=2),m===!0&&(y=3);let E=o.attributes.position.count*y,w=1;E>e.maxTextureSize&&(w=Math.ceil(E/e.maxTextureSize),E=e.maxTextureSize);const A=new Float32Array(E*w*4*d),_=new mh(A,E,w,d);_.type=ci,_.needsUpdate=!0;const S=y*4;for(let R=0;R<d;R++){const L=p[R],H=M[R],K=T[R],F=E*w*4*R;for(let N=0;N<L.count;N++){const B=N*S;g===!0&&(n.fromBufferAttribute(L,N),A[F+B+0]=n.x,A[F+B+1]=n.y,A[F+B+2]=n.z,A[F+B+3]=0),v===!0&&(n.fromBufferAttribute(H,N),A[F+B+4]=n.x,A[F+B+5]=n.y,A[F+B+6]=n.z,A[F+B+7]=0),m===!0&&(n.fromBufferAttribute(K,N),A[F+B+8]=n.x,A[F+B+9]=n.y,A[F+B+10]=n.z,A[F+B+11]=K.itemSize===4?n.w:1)}}u={count:d,texture:_,size:new De(E,w)},i.set(o,u),o.addEventListener("dispose",P)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)c.getUniforms().setValue(r,"morphTexture",a.morphTexture,t);else{let g=0;for(let m=0;m<l.length;m++)g+=l[m];const v=o.morphTargetsRelative?1:1-g;c.getUniforms().setValue(r,"morphTargetBaseInfluence",v),c.getUniforms().setValue(r,"morphTargetInfluences",l)}c.getUniforms().setValue(r,"morphTargetsTexture",u.texture,t),c.getUniforms().setValue(r,"morphTargetsTextureSize",u.size)}return{update:s}}function Rg(r,e,t,i,n){let s=new WeakMap;function a(l){const h=n.render.frame,d=l.geometry,u=e.get(l,d);if(s.get(u)!==h&&(e.update(u),s.set(u,h)),l.isInstancedMesh&&(l.hasEventListener("dispose",c)===!1&&l.addEventListener("dispose",c),s.get(l)!==h&&(t.update(l.instanceMatrix,r.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,r.ARRAY_BUFFER),s.set(l,h))),l.isSkinnedMesh){const f=l.skeleton;s.get(f)!==h&&(f.update(),s.set(f,h))}return u}function o(){s=new WeakMap}function c(l){const h=l.target;h.removeEventListener("dispose",c),i.releaseStatesOfObject(h),t.remove(h.instanceMatrix),h.instanceColor!==null&&t.remove(h.instanceColor)}return{update:a,dispose:o}}const Cg={[Qc]:"LINEAR_TONE_MAPPING",[eh]:"REINHARD_TONE_MAPPING",[th]:"CINEON_TONE_MAPPING",[ih]:"ACES_FILMIC_TONE_MAPPING",[sh]:"AGX_TONE_MAPPING",[rh]:"NEUTRAL_TONE_MAPPING",[nh]:"CUSTOM_TONE_MAPPING"};function Pg(r,e,t,i,n,s){const a=new Si(e,t,{type:r,depthBuffer:n,stencilBuffer:s,samples:i?4:0,depthTexture:n?new $n(e,t):void 0}),o=new Si(e,t,{type:Oi,depthBuffer:!1,stencilBuffer:!1}),c=new kt;c.setAttribute("position",new tt([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new tt([0,2,0,0,2,0],2));const l=new ef({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),h=new Vt(c,l),d=new qr(-1,1,1,-1,0,1);let u=null,f=null,g=!1,v,m=null,p=[],M=!1;this.setSize=function(T,y){a.setSize(T,y),o.setSize(T,y);for(let E=0;E<p.length;E++){const w=p[E];w.setSize&&w.setSize(T,y)}},this.setEffects=function(T){p=T,M=p.length>0&&p[0].isRenderPass===!0;const y=a.width,E=a.height;for(let w=0;w<p.length;w++){const A=p[w];A.setSize&&A.setSize(y,E)}},this.begin=function(T,y){if(g||T.toneMapping===Mi&&p.length===0)return!1;if(m=y,y!==null){const E=y.width,w=y.height;(a.width!==E||a.height!==w)&&this.setSize(E,w)}return M===!1&&T.setRenderTarget(a),v=T.toneMapping,T.toneMapping=Mi,!0},this.hasRenderPass=function(){return M},this.end=function(T,y){T.toneMapping=v,g=!0;let E=a,w=o;for(let A=0;A<p.length;A++){const _=p[A];if(_.enabled!==!1&&(_.render(T,w,E,y),_.needsSwap!==!1)){const S=E;E=w,w=S}}if(u!==T.outputColorSpace||f!==T.toneMapping){u=T.outputColorSpace,f=T.toneMapping,l.defines={},Xe.getTransfer(u)===je&&(l.defines.SRGB_TRANSFER="");const A=Cg[f];A&&(l.defines[A]=""),l.needsUpdate=!0}l.uniforms.tDiffuse.value=E.texture,T.setRenderTarget(m),T.render(h,d),m=null,g=!1},this.isCompositing=function(){return g},this.dispose=function(){a.depthTexture&&a.depthTexture.dispose(),a.dispose(),o.dispose(),c.dispose(),l.dispose()}}const zh=new Ot,No=new $n(1,1),Hh=new mh,Gh=new dd,Vh=new Eh,bc=[],Mc=[],Sc=new Float32Array(16),Ec=new Float32Array(9),Tc=new Float32Array(4);function ss(r,e,t){const i=r[0];if(i<=0||i>0)return r;const n=e*t;let s=bc[n];if(s===void 0&&(s=new Float32Array(n),bc[n]=s),e!==0){i.toArray(s,0);for(let a=1,o=0;a!==e;++a)o+=t,r[a].toArray(s,o)}return s}function Tt(r,e){if(r.length!==e.length)return!1;for(let t=0,i=r.length;t<i;t++)if(r[t]!==e[t])return!1;return!0}function wt(r,e){for(let t=0,i=e.length;t<i;t++)r[t]=e[t]}function Kr(r,e){let t=Mc[e];t===void 0&&(t=new Int32Array(e),Mc[e]=t);for(let i=0;i!==e;++i)t[i]=r.allocateTextureUnit();return t}function Lg(r,e){const t=this.cache;t[0]!==e&&(r.uniform1f(this.addr,e),t[0]=e)}function Ng(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(r.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Tt(t,e))return;r.uniform2fv(this.addr,e),wt(t,e)}}function Dg(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(r.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(r.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Tt(t,e))return;r.uniform3fv(this.addr,e),wt(t,e)}}function Ig(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(r.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Tt(t,e))return;r.uniform4fv(this.addr,e),wt(t,e)}}function Ug(r,e){const t=this.cache,i=e.elements;if(i===void 0){if(Tt(t,e))return;r.uniformMatrix2fv(this.addr,!1,e),wt(t,e)}else{if(Tt(t,i))return;Tc.set(i),r.uniformMatrix2fv(this.addr,!1,Tc),wt(t,i)}}function Fg(r,e){const t=this.cache,i=e.elements;if(i===void 0){if(Tt(t,e))return;r.uniformMatrix3fv(this.addr,!1,e),wt(t,e)}else{if(Tt(t,i))return;Ec.set(i),r.uniformMatrix3fv(this.addr,!1,Ec),wt(t,i)}}function Og(r,e){const t=this.cache,i=e.elements;if(i===void 0){if(Tt(t,e))return;r.uniformMatrix4fv(this.addr,!1,e),wt(t,e)}else{if(Tt(t,i))return;Sc.set(i),r.uniformMatrix4fv(this.addr,!1,Sc),wt(t,i)}}function kg(r,e){const t=this.cache;t[0]!==e&&(r.uniform1i(this.addr,e),t[0]=e)}function Bg(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(r.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Tt(t,e))return;r.uniform2iv(this.addr,e),wt(t,e)}}function zg(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(r.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Tt(t,e))return;r.uniform3iv(this.addr,e),wt(t,e)}}function Hg(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(r.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Tt(t,e))return;r.uniform4iv(this.addr,e),wt(t,e)}}function Gg(r,e){const t=this.cache;t[0]!==e&&(r.uniform1ui(this.addr,e),t[0]=e)}function Vg(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(r.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Tt(t,e))return;r.uniform2uiv(this.addr,e),wt(t,e)}}function Wg(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(r.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Tt(t,e))return;r.uniform3uiv(this.addr,e),wt(t,e)}}function Xg(r,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(r.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Tt(t,e))return;r.uniform4uiv(this.addr,e),wt(t,e)}}function qg(r,e,t){const i=this.cache,n=t.allocateTextureUnit();i[0]!==n&&(r.uniform1i(this.addr,n),i[0]=n);let s;this.type===r.SAMPLER_2D_SHADOW?(No.compareFunction=t.isReversedDepthBuffer()?Vo:Go,s=No):s=zh,t.setTexture2D(e||s,n)}function Yg(r,e,t){const i=this.cache,n=t.allocateTextureUnit();i[0]!==n&&(r.uniform1i(this.addr,n),i[0]=n),t.setTexture3D(e||Gh,n)}function Kg(r,e,t){const i=this.cache,n=t.allocateTextureUnit();i[0]!==n&&(r.uniform1i(this.addr,n),i[0]=n),t.setTextureCube(e||Vh,n)}function Zg(r,e,t){const i=this.cache,n=t.allocateTextureUnit();i[0]!==n&&(r.uniform1i(this.addr,n),i[0]=n),t.setTexture2DArray(e||Hh,n)}function $g(r){switch(r){case 5126:return Lg;case 35664:return Ng;case 35665:return Dg;case 35666:return Ig;case 35674:return Ug;case 35675:return Fg;case 35676:return Og;case 5124:case 35670:return kg;case 35667:case 35671:return Bg;case 35668:case 35672:return zg;case 35669:case 35673:return Hg;case 5125:return Gg;case 36294:return Vg;case 36295:return Wg;case 36296:return Xg;case 35678:case 36198:case 36298:case 36306:case 35682:return qg;case 35679:case 36299:case 36307:return Yg;case 35680:case 36300:case 36308:case 36293:return Kg;case 36289:case 36303:case 36311:case 36292:return Zg}}function Jg(r,e){r.uniform1fv(this.addr,e)}function jg(r,e){const t=ss(e,this.size,2);r.uniform2fv(this.addr,t)}function Qg(r,e){const t=ss(e,this.size,3);r.uniform3fv(this.addr,t)}function e_(r,e){const t=ss(e,this.size,4);r.uniform4fv(this.addr,t)}function t_(r,e){const t=ss(e,this.size,4);r.uniformMatrix2fv(this.addr,!1,t)}function i_(r,e){const t=ss(e,this.size,9);r.uniformMatrix3fv(this.addr,!1,t)}function n_(r,e){const t=ss(e,this.size,16);r.uniformMatrix4fv(this.addr,!1,t)}function s_(r,e){r.uniform1iv(this.addr,e)}function r_(r,e){r.uniform2iv(this.addr,e)}function a_(r,e){r.uniform3iv(this.addr,e)}function o_(r,e){r.uniform4iv(this.addr,e)}function l_(r,e){r.uniform1uiv(this.addr,e)}function c_(r,e){r.uniform2uiv(this.addr,e)}function h_(r,e){r.uniform3uiv(this.addr,e)}function u_(r,e){r.uniform4uiv(this.addr,e)}function d_(r,e,t){const i=this.cache,n=e.length,s=Kr(t,n);Tt(i,s)||(r.uniform1iv(this.addr,s),wt(i,s));let a;this.type===r.SAMPLER_2D_SHADOW?a=No:a=zh;for(let o=0;o!==n;++o)t.setTexture2D(e[o]||a,s[o])}function f_(r,e,t){const i=this.cache,n=e.length,s=Kr(t,n);Tt(i,s)||(r.uniform1iv(this.addr,s),wt(i,s));for(let a=0;a!==n;++a)t.setTexture3D(e[a]||Gh,s[a])}function p_(r,e,t){const i=this.cache,n=e.length,s=Kr(t,n);Tt(i,s)||(r.uniform1iv(this.addr,s),wt(i,s));for(let a=0;a!==n;++a)t.setTextureCube(e[a]||Vh,s[a])}function m_(r,e,t){const i=this.cache,n=e.length,s=Kr(t,n);Tt(i,s)||(r.uniform1iv(this.addr,s),wt(i,s));for(let a=0;a!==n;++a)t.setTexture2DArray(e[a]||Hh,s[a])}function g_(r){switch(r){case 5126:return Jg;case 35664:return jg;case 35665:return Qg;case 35666:return e_;case 35674:return t_;case 35675:return i_;case 35676:return n_;case 5124:case 35670:return s_;case 35667:case 35671:return r_;case 35668:case 35672:return a_;case 35669:case 35673:return o_;case 5125:return l_;case 36294:return c_;case 36295:return h_;case 36296:return u_;case 35678:case 36198:case 36298:case 36306:case 35682:return d_;case 35679:case 36299:case 36307:return f_;case 35680:case 36300:case 36308:case 36293:return p_;case 36289:case 36303:case 36311:case 36292:return m_}}class __{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=$g(t.type)}}class x_{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=g_(t.type)}}class v_{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){const n=this.seq;for(let s=0,a=n.length;s!==a;++s){const o=n[s];o.setValue(e,t[o.id],i)}}}const Da=/(\w+)(\])?(\[|\.)?/g;function wc(r,e){r.seq.push(e),r.map[e.id]=e}function y_(r,e,t){const i=r.name,n=i.length;for(Da.lastIndex=0;;){const s=Da.exec(i),a=Da.lastIndex;let o=s[1];const c=s[2]==="]",l=s[3];if(c&&(o=o|0),l===void 0||l==="["&&a+2===n){wc(t,l===void 0?new __(o,r,e):new x_(o,r,e));break}else{let d=t.map[o];d===void 0&&(d=new v_(o),wc(t,d)),t=d}}}class Er{constructor(e,t){this.seq=[],this.map={};const i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<i;++a){const o=e.getActiveUniform(t,a),c=e.getUniformLocation(t,o.name);y_(o,c,this)}const n=[],s=[];for(const a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?n.push(a):s.push(a);n.length>0&&(this.seq=n.concat(s))}setValue(e,t,i,n){const s=this.map[t];s!==void 0&&s.setValue(e,i,n)}setOptional(e,t,i){const n=t[i];n!==void 0&&this.setValue(e,i,n)}static upload(e,t,i,n){for(let s=0,a=t.length;s!==a;++s){const o=t[s],c=i[o.id];c.needsUpdate!==!1&&o.setValue(e,c.value,n)}}static seqWithValue(e,t){const i=[];for(let n=0,s=e.length;n!==s;++n){const a=e[n];a.id in t&&i.push(a)}return i}}function Ac(r,e,t){const i=r.createShader(e);return r.shaderSource(i,t),r.compileShader(i),i}const b_=37297;let M_=0;function S_(r,e){const t=r.split(`
`),i=[],n=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let a=n;a<s;a++){const o=a+1;i.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return i.join(`
`)}const Rc=new ke;function E_(r){Xe._getMatrix(Rc,Xe.workingColorSpace,r);const e=`mat3( ${Rc.elements.map(t=>t.toFixed(4))} )`;switch(Xe.getTransfer(r)){case Cr:return[e,"LinearTransferOETF"];case je:return[e,"sRGBTransferOETF"];default:return Le("WebGLProgram: Unsupported color space: ",r),[e,"LinearTransferOETF"]}}function Cc(r,e,t){const i=r.getShaderParameter(e,r.COMPILE_STATUS),s=(r.getShaderInfoLog(e)||"").trim();if(i&&s==="")return"";const a=/ERROR: 0:(\d+)/.exec(s);if(a){const o=parseInt(a[1]);return t.toUpperCase()+`

`+s+`

`+S_(r.getShaderSource(e),o)}else return s}function T_(r,e){const t=E_(e);return[`vec4 ${r}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}const w_={[Qc]:"Linear",[eh]:"Reinhard",[th]:"Cineon",[ih]:"ACESFilmic",[sh]:"AgX",[rh]:"Neutral",[nh]:"Custom"};function A_(r,e){const t=w_[e];return t===void 0?(Le("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+r+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+r+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const cr=new D;function R_(){Xe.getLuminanceCoefficients(cr);const r=cr.x.toFixed(4),e=cr.y.toFixed(4),t=cr.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${r}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function C_(r){return[r.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",r.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(gs).join(`
`)}function P_(r){const e=[];for(const t in r){const i=r[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function L_(r,e){const t={},i=r.getProgramParameter(e,r.ACTIVE_ATTRIBUTES);for(let n=0;n<i;n++){const s=r.getActiveAttrib(e,n),a=s.name;let o=1;s.type===r.FLOAT_MAT2&&(o=2),s.type===r.FLOAT_MAT3&&(o=3),s.type===r.FLOAT_MAT4&&(o=4),t[a]={type:s.type,location:r.getAttribLocation(e,a),locationSize:o}}return t}function gs(r){return r!==""}function Pc(r,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return r.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Lc(r,e){return r.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const N_=/^[ \t]*#include +<([\w\d./]+)>/gm;function Do(r){return r.replace(N_,I_)}const D_=new Map;function I_(r,e){let t=Ge[e];if(t===void 0){const i=D_.get(e);if(i!==void 0)t=Ge[i],Le('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return Do(t)}const U_=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Nc(r){return r.replace(U_,F_)}function F_(r,e,t,i){let n="";for(let s=parseInt(e);s<parseInt(t);s++)n+=i.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return n}function Dc(r){let e=`precision ${r.precision} float;
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
#define LOW_PRECISION`),e}const O_={[vr]:"SHADOWMAP_TYPE_PCF",[ps]:"SHADOWMAP_TYPE_VSM"};function k_(r){return O_[r.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const B_={[gn]:"ENVMAP_TYPE_CUBE",[Kn]:"ENVMAP_TYPE_CUBE",[Vr]:"ENVMAP_TYPE_CUBE_UV"};function z_(r){return r.envMap===!1?"ENVMAP_TYPE_CUBE":B_[r.envMapMode]||"ENVMAP_TYPE_CUBE"}const H_={[Kn]:"ENVMAP_MODE_REFRACTION"};function G_(r){return r.envMap===!1?"ENVMAP_MODE_REFLECTION":H_[r.envMapMode]||"ENVMAP_MODE_REFLECTION"}const V_={[Gr]:"ENVMAP_BLENDING_MULTIPLY",[Au]:"ENVMAP_BLENDING_MIX",[Ru]:"ENVMAP_BLENDING_ADD"};function W_(r){return r.envMap===!1?"ENVMAP_BLENDING_NONE":V_[r.combine]||"ENVMAP_BLENDING_NONE"}function X_(r){const e=r.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),7*16)),texelHeight:i,maxMip:t}}function q_(r,e,t,i){const n=r.getContext(),s=t.defines;let a=t.vertexShader,o=t.fragmentShader;const c=k_(t),l=z_(t),h=G_(t),d=W_(t),u=X_(t),f=C_(t),g=P_(s),v=n.createProgram();let m,p,M=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(gs).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(gs).join(`
`),p.length>0&&(p+=`
`)):(m=[Dc(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(gs).join(`
`),p=[Dc(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+l:"",t.envMap?"#define "+h:"",t.envMap?"#define "+d:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Mi?"#define TONE_MAPPING":"",t.toneMapping!==Mi?Ge.tonemapping_pars_fragment:"",t.toneMapping!==Mi?A_("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Ge.colorspace_pars_fragment,T_("linearToOutputTexel",t.outputColorSpace),R_(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(gs).join(`
`)),a=Do(a),a=Pc(a,t),a=Lc(a,t),o=Do(o),o=Pc(o,t),o=Lc(o,t),a=Nc(a),o=Nc(o),t.isRawShaderMaterial!==!0&&(M=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",t.glslVersion===Rl?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Rl?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);const T=M+m+a,y=M+p+o,E=Ac(n,n.VERTEX_SHADER,T),w=Ac(n,n.FRAGMENT_SHADER,y);n.attachShader(v,E),n.attachShader(v,w),t.index0AttributeName!==void 0?n.bindAttribLocation(v,0,t.index0AttributeName):t.hasPositionAttribute===!0&&n.bindAttribLocation(v,0,"position"),n.linkProgram(v);function A(R){if(r.debug.checkShaderErrors){const L=n.getProgramInfoLog(v)||"",H=n.getShaderInfoLog(E)||"",K=n.getShaderInfoLog(w)||"",F=L.trim(),N=H.trim(),B=K.trim();let Y=!0,j=!0;if(n.getProgramParameter(v,n.LINK_STATUS)===!1)if(Y=!1,typeof r.debug.onShaderError=="function")r.debug.onShaderError(n,v,E,w);else{const se=Cc(n,E,"vertex"),ne=Cc(n,w,"fragment");We("WebGLProgram: Shader Error "+n.getError()+" - VALIDATE_STATUS "+n.getProgramParameter(v,n.VALIDATE_STATUS)+`

Material Name: `+R.name+`
Material Type: `+R.type+`

Program Info Log: `+F+`
`+se+`
`+ne)}else F!==""?Le("WebGLProgram: Program Info Log:",F):(N===""||B==="")&&(j=!1);j&&(R.diagnostics={runnable:Y,programLog:F,vertexShader:{log:N,prefix:m},fragmentShader:{log:B,prefix:p}})}n.deleteShader(E),n.deleteShader(w),_=new Er(n,v),S=L_(n,v)}let _;this.getUniforms=function(){return _===void 0&&A(this),_};let S;this.getAttributes=function(){return S===void 0&&A(this),S};let P=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return P===!1&&(P=n.getProgramParameter(v,b_)),P},this.destroy=function(){i.releaseStatesOfProgram(this),n.deleteProgram(v),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=M_++,this.cacheKey=e,this.usedTimes=1,this.program=v,this.vertexShader=E,this.fragmentShader=w,this}let Y_=0;class K_{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,i){const n=this._getShaderCacheForMaterial(e);return n.has(t)===!1&&(n.add(t),t.usedTimes++),n.has(i)===!1&&(n.add(i),i.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){const t=this.shaderCache;let i=t.get(e);return i===void 0&&(i=new Z_(e),t.set(e,i)),i}}class Z_{constructor(e){this.id=Y_++,this.code=e,this.usedTimes=0}}function $_(r){return r===_n||r===Tr||r===wr}function J_(r,e,t,i,n,s){const a=new gh,o=new K_,c=new Set,l=[],h=new Map,d=i.logarithmicDepthBuffer;let u=i.precision;const f={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(_){return c.add(_),_===0?"uv":`uv${_}`}function v(_,S,P,R,L,H){const K=R.fog,F=L.geometry,N=_.isMeshStandardMaterial||_.isMeshLambertMaterial||_.isMeshPhongMaterial?R.environment:null,B=_.isMeshStandardMaterial||_.isMeshLambertMaterial&&!_.envMap||_.isMeshPhongMaterial&&!_.envMap,Y=e.get(_.envMap||N,B),j=Y&&Y.mapping===Vr?Y.image.height:null,se=f[_.type];_.precision!==null&&(u=i.getMaxPrecision(_.precision),u!==_.precision&&Le("WebGLProgram.getParameters:",_.precision,"not supported, using",u,"instead."));const ne=F.morphAttributes.position||F.morphAttributes.normal||F.morphAttributes.color,re=ne!==void 0?ne.length:0;let xe=0;F.morphAttributes.position!==void 0&&(xe=1),F.morphAttributes.normal!==void 0&&(xe=2),F.morphAttributes.color!==void 0&&(xe=3);let ve,oe,k,J;if(se){const Me=vi[se];ve=Me.vertexShader,oe=Me.fragmentShader}else{ve=_.vertexShader,oe=_.fragmentShader;const Me=o.getVertexShaderStage(_),ut=o.getFragmentShaderStage(_);o.update(_,Me,ut),k=Me.id,J=ut.id}const te=r.getRenderTarget(),we=r.state.buffers.depth.getReversed(),Fe=L.isInstancedMesh===!0,Ie=L.isBatchedMesh===!0,pt=!!_.map,Ye=!!_.matcap,nt=!!Y,$e=!!_.aoMap,Ke=!!_.lightMap,xt=!!_.bumpMap&&_.wireframe===!1,bt=!!_.normalMap,At=!!_.displacementMap,Lt=!!_.emissiveMap,ht=!!_.metalnessMap,vt=!!_.roughnessMap,U=_.anisotropy>0,Wt=_.clearcoat>0,Je=_.dispersion>0,C=_.iridescence>0,x=_.sheen>0,z=_.transmission>0,W=U&&!!_.anisotropyMap,Z=Wt&&!!_.clearcoatMap,ae=Wt&&!!_.clearcoatNormalMap,ce=Wt&&!!_.clearcoatRoughnessMap,$=C&&!!_.iridescenceMap,ee=C&&!!_.iridescenceThicknessMap,he=x&&!!_.sheenColorMap,Ae=x&&!!_.sheenRoughnessMap,fe=!!_.specularMap,ue=!!_.specularColorMap,Ne=!!_.specularIntensityMap,Ue=z&&!!_.transmissionMap,ze=z&&!!_.thicknessMap,I=!!_.gradientMap,le=!!_.alphaMap,Q=_.alphaTest>0,de=!!_.alphaHash,_e=!!_.extensions;let ie=Mi;_.toneMapped&&(te===null||te.isXRRenderTarget===!0)&&(ie=r.toneMapping);const Te={shaderID:se,shaderType:_.type,shaderName:_.name,vertexShader:ve,fragmentShader:oe,defines:_.defines,customVertexShaderID:k,customFragmentShaderID:J,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:u,batching:Ie,batchingColor:Ie&&L._colorsTexture!==null,instancing:Fe,instancingColor:Fe&&L.instanceColor!==null,instancingMorph:Fe&&L.morphTexture!==null,outputColorSpace:te===null?r.outputColorSpace:te.isXRRenderTarget===!0?te.texture.colorSpace:Xe.workingColorSpace,alphaToCoverage:!!_.alphaToCoverage,map:pt,matcap:Ye,envMap:nt,envMapMode:nt&&Y.mapping,envMapCubeUVHeight:j,aoMap:$e,lightMap:Ke,bumpMap:xt,normalMap:bt,displacementMap:At,emissiveMap:Lt,normalMapObjectSpace:bt&&_.normalMapType===Du,normalMapTangentSpace:bt&&_.normalMapType===Ar,packedNormalMap:bt&&_.normalMapType===Ar&&$_(_.normalMap.format),metalnessMap:ht,roughnessMap:vt,anisotropy:U,anisotropyMap:W,clearcoat:Wt,clearcoatMap:Z,clearcoatNormalMap:ae,clearcoatRoughnessMap:ce,dispersion:Je,iridescence:C,iridescenceMap:$,iridescenceThicknessMap:ee,sheen:x,sheenColorMap:he,sheenRoughnessMap:Ae,specularMap:fe,specularColorMap:ue,specularIntensityMap:Ne,transmission:z,transmissionMap:Ue,thicknessMap:ze,gradientMap:I,opaque:_.transparent===!1&&_.blending===Gn&&_.alphaToCoverage===!1,alphaMap:le,alphaTest:Q,alphaHash:de,combine:_.combine,mapUv:pt&&g(_.map.channel),aoMapUv:$e&&g(_.aoMap.channel),lightMapUv:Ke&&g(_.lightMap.channel),bumpMapUv:xt&&g(_.bumpMap.channel),normalMapUv:bt&&g(_.normalMap.channel),displacementMapUv:At&&g(_.displacementMap.channel),emissiveMapUv:Lt&&g(_.emissiveMap.channel),metalnessMapUv:ht&&g(_.metalnessMap.channel),roughnessMapUv:vt&&g(_.roughnessMap.channel),anisotropyMapUv:W&&g(_.anisotropyMap.channel),clearcoatMapUv:Z&&g(_.clearcoatMap.channel),clearcoatNormalMapUv:ae&&g(_.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ce&&g(_.clearcoatRoughnessMap.channel),iridescenceMapUv:$&&g(_.iridescenceMap.channel),iridescenceThicknessMapUv:ee&&g(_.iridescenceThicknessMap.channel),sheenColorMapUv:he&&g(_.sheenColorMap.channel),sheenRoughnessMapUv:Ae&&g(_.sheenRoughnessMap.channel),specularMapUv:fe&&g(_.specularMap.channel),specularColorMapUv:ue&&g(_.specularColorMap.channel),specularIntensityMapUv:Ne&&g(_.specularIntensityMap.channel),transmissionMapUv:Ue&&g(_.transmissionMap.channel),thicknessMapUv:ze&&g(_.thicknessMap.channel),alphaMapUv:le&&g(_.alphaMap.channel),vertexTangents:!!F.attributes.tangent&&(bt||U),vertexNormals:!!F.attributes.normal,vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!F.attributes.color&&F.attributes.color.itemSize===4,pointsUvs:L.isPoints===!0&&!!F.attributes.uv&&(pt||le),fog:!!K,useFog:_.fog===!0,fogExp2:!!K&&K.isFogExp2,flatShading:_.wireframe===!1&&(_.flatShading===!0||F.attributes.normal===void 0&&bt===!1&&(_.isMeshLambertMaterial||_.isMeshPhongMaterial||_.isMeshStandardMaterial||_.isMeshPhysicalMaterial)),sizeAttenuation:_.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:we,skinning:L.isSkinnedMesh===!0,hasPositionAttribute:F.attributes.position!==void 0,morphTargets:F.morphAttributes.position!==void 0,morphNormals:F.morphAttributes.normal!==void 0,morphColors:F.morphAttributes.color!==void 0,morphTargetsCount:re,morphTextureStride:xe,numDirLights:S.directional.length,numPointLights:S.point.length,numSpotLights:S.spot.length,numSpotLightMaps:S.spotLightMap.length,numRectAreaLights:S.rectArea.length,numHemiLights:S.hemi.length,numDirLightShadows:S.directionalShadowMap.length,numPointLightShadows:S.pointShadowMap.length,numSpotLightShadows:S.spotShadowMap.length,numSpotLightShadowsWithMaps:S.numSpotLightShadowsWithMaps,numLightProbes:S.numLightProbes,numLightProbeGrids:H.length,numClippingPlanes:s.numPlanes,numClipIntersection:s.numIntersection,dithering:_.dithering,shadowMapEnabled:r.shadowMap.enabled&&P.length>0,shadowMapType:r.shadowMap.type,toneMapping:ie,decodeVideoTexture:pt&&_.map.isVideoTexture===!0&&Xe.getTransfer(_.map.colorSpace)===je,decodeVideoTextureEmissive:Lt&&_.emissiveMap.isVideoTexture===!0&&Xe.getTransfer(_.emissiveMap.colorSpace)===je,premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===yi,flipSided:_.side===qt,useDepthPacking:_.depthPacking>=0,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionClipCullDistance:_e&&_.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(_e&&_.extensions.multiDraw===!0||Ie)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:_.customProgramCacheKey()};return Te.vertexUv1s=c.has(1),Te.vertexUv2s=c.has(2),Te.vertexUv3s=c.has(3),c.clear(),Te}function m(_){const S=[];if(_.shaderID?S.push(_.shaderID):(S.push(_.customVertexShaderID),S.push(_.customFragmentShaderID)),_.defines!==void 0)for(const P in _.defines)S.push(P),S.push(_.defines[P]);return _.isRawShaderMaterial===!1&&(p(S,_),M(S,_),S.push(r.outputColorSpace)),S.push(_.customProgramCacheKey),S.join()}function p(_,S){_.push(S.precision),_.push(S.outputColorSpace),_.push(S.envMapMode),_.push(S.envMapCubeUVHeight),_.push(S.mapUv),_.push(S.alphaMapUv),_.push(S.lightMapUv),_.push(S.aoMapUv),_.push(S.bumpMapUv),_.push(S.normalMapUv),_.push(S.displacementMapUv),_.push(S.emissiveMapUv),_.push(S.metalnessMapUv),_.push(S.roughnessMapUv),_.push(S.anisotropyMapUv),_.push(S.clearcoatMapUv),_.push(S.clearcoatNormalMapUv),_.push(S.clearcoatRoughnessMapUv),_.push(S.iridescenceMapUv),_.push(S.iridescenceThicknessMapUv),_.push(S.sheenColorMapUv),_.push(S.sheenRoughnessMapUv),_.push(S.specularMapUv),_.push(S.specularColorMapUv),_.push(S.specularIntensityMapUv),_.push(S.transmissionMapUv),_.push(S.thicknessMapUv),_.push(S.combine),_.push(S.fogExp2),_.push(S.sizeAttenuation),_.push(S.morphTargetsCount),_.push(S.morphAttributeCount),_.push(S.numDirLights),_.push(S.numPointLights),_.push(S.numSpotLights),_.push(S.numSpotLightMaps),_.push(S.numHemiLights),_.push(S.numRectAreaLights),_.push(S.numDirLightShadows),_.push(S.numPointLightShadows),_.push(S.numSpotLightShadows),_.push(S.numSpotLightShadowsWithMaps),_.push(S.numLightProbes),_.push(S.shadowMapType),_.push(S.toneMapping),_.push(S.numClippingPlanes),_.push(S.numClipIntersection),_.push(S.depthPacking)}function M(_,S){a.disableAll(),S.instancing&&a.enable(0),S.instancingColor&&a.enable(1),S.instancingMorph&&a.enable(2),S.matcap&&a.enable(3),S.envMap&&a.enable(4),S.normalMapObjectSpace&&a.enable(5),S.normalMapTangentSpace&&a.enable(6),S.clearcoat&&a.enable(7),S.iridescence&&a.enable(8),S.alphaTest&&a.enable(9),S.vertexColors&&a.enable(10),S.vertexAlphas&&a.enable(11),S.vertexUv1s&&a.enable(12),S.vertexUv2s&&a.enable(13),S.vertexUv3s&&a.enable(14),S.vertexTangents&&a.enable(15),S.anisotropy&&a.enable(16),S.alphaHash&&a.enable(17),S.batching&&a.enable(18),S.dispersion&&a.enable(19),S.batchingColor&&a.enable(20),S.gradientMap&&a.enable(21),S.packedNormalMap&&a.enable(22),S.vertexNormals&&a.enable(23),_.push(a.mask),a.disableAll(),S.fog&&a.enable(0),S.useFog&&a.enable(1),S.flatShading&&a.enable(2),S.logarithmicDepthBuffer&&a.enable(3),S.reversedDepthBuffer&&a.enable(4),S.skinning&&a.enable(5),S.morphTargets&&a.enable(6),S.morphNormals&&a.enable(7),S.morphColors&&a.enable(8),S.premultipliedAlpha&&a.enable(9),S.shadowMapEnabled&&a.enable(10),S.doubleSided&&a.enable(11),S.flipSided&&a.enable(12),S.useDepthPacking&&a.enable(13),S.dithering&&a.enable(14),S.transmission&&a.enable(15),S.sheen&&a.enable(16),S.opaque&&a.enable(17),S.pointsUvs&&a.enable(18),S.decodeVideoTexture&&a.enable(19),S.decodeVideoTextureEmissive&&a.enable(20),S.alphaToCoverage&&a.enable(21),S.numLightProbeGrids>0&&a.enable(22),S.hasPositionAttribute&&a.enable(23),_.push(a.mask)}function T(_){const S=f[_.type];let P;if(S){const R=vi[S];P=Jd.clone(R.uniforms)}else P=_.uniforms;return P}function y(_,S){let P=h.get(S);return P!==void 0?++P.usedTimes:(P=new q_(r,S,_,n),l.push(P),h.set(S,P)),P}function E(_){if(--_.usedTimes===0){const S=l.indexOf(_);l[S]=l[l.length-1],l.pop(),h.delete(_.cacheKey),_.destroy()}}function w(_){o.remove(_)}function A(){o.dispose()}return{getParameters:v,getProgramCacheKey:m,getUniforms:T,acquireProgram:y,releaseProgram:E,releaseShaderCache:w,programs:l,dispose:A}}function j_(){let r=new WeakMap;function e(a){return r.has(a)}function t(a){let o=r.get(a);return o===void 0&&(o={},r.set(a,o)),o}function i(a){r.delete(a)}function n(a,o,c){r.get(a)[o]=c}function s(){r=new WeakMap}return{has:e,get:t,remove:i,update:n,dispose:s}}function Q_(r,e){return r.groupOrder!==e.groupOrder?r.groupOrder-e.groupOrder:r.renderOrder!==e.renderOrder?r.renderOrder-e.renderOrder:r.material.id!==e.material.id?r.material.id-e.material.id:r.materialVariant!==e.materialVariant?r.materialVariant-e.materialVariant:r.z!==e.z?r.z-e.z:r.id-e.id}function Ic(r,e){return r.groupOrder!==e.groupOrder?r.groupOrder-e.groupOrder:r.renderOrder!==e.renderOrder?r.renderOrder-e.renderOrder:r.z!==e.z?e.z-r.z:r.id-e.id}function Uc(){const r=[];let e=0;const t=[],i=[],n=[];function s(){e=0,t.length=0,i.length=0,n.length=0}function a(u){let f=0;return u.isInstancedMesh&&(f+=2),u.isSkinnedMesh&&(f+=1),f}function o(u,f,g,v,m,p){let M=r[e];return M===void 0?(M={id:u.id,object:u,geometry:f,material:g,materialVariant:a(u),groupOrder:v,renderOrder:u.renderOrder,z:m,group:p},r[e]=M):(M.id=u.id,M.object=u,M.geometry=f,M.material=g,M.materialVariant=a(u),M.groupOrder=v,M.renderOrder=u.renderOrder,M.z=m,M.group=p),e++,M}function c(u,f,g,v,m,p){const M=o(u,f,g,v,m,p);g.transmission>0?i.push(M):g.transparent===!0?n.push(M):t.push(M)}function l(u,f,g,v,m,p){const M=o(u,f,g,v,m,p);g.transmission>0?i.unshift(M):g.transparent===!0?n.unshift(M):t.unshift(M)}function h(u,f,g){t.length>1&&t.sort(u||Q_),i.length>1&&i.sort(f||Ic),n.length>1&&n.sort(f||Ic),g&&(t.reverse(),i.reverse(),n.reverse())}function d(){for(let u=e,f=r.length;u<f;u++){const g=r[u];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:t,transmissive:i,transparent:n,init:s,push:c,unshift:l,finish:d,sort:h}}function e0(){let r=new WeakMap;function e(i,n){const s=r.get(i);let a;return s===void 0?(a=new Uc,r.set(i,[a])):n>=s.length?(a=new Uc,s.push(a)):a=s[n],a}function t(){r=new WeakMap}return{get:e,dispose:t}}function t0(){const r={};return{get:function(e){if(r[e.id]!==void 0)return r[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new D,color:new Be};break;case"SpotLight":t={position:new D,direction:new D,color:new Be,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new D,color:new Be,distance:0,decay:0};break;case"HemisphereLight":t={direction:new D,skyColor:new Be,groundColor:new Be};break;case"RectAreaLight":t={color:new Be,position:new D,halfWidth:new D,halfHeight:new D};break}return r[e.id]=t,t}}}function i0(){const r={};return{get:function(e){if(r[e.id]!==void 0)return r[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new De};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new De};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new De,shadowCameraNear:1,shadowCameraFar:1e3};break}return r[e.id]=t,t}}}let n0=0;function s0(r,e){return(e.castShadow?2:0)-(r.castShadow?2:0)+(e.map?1:0)-(r.map?1:0)}function r0(r){const e=new t0,t=i0(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)i.probe.push(new D);const n=new D,s=new Oe,a=new Oe;function o(l){let h=0,d=0,u=0;for(let S=0;S<9;S++)i.probe[S].set(0,0,0);let f=0,g=0,v=0,m=0,p=0,M=0,T=0,y=0,E=0,w=0,A=0;l.sort(s0);for(let S=0,P=l.length;S<P;S++){const R=l[S],L=R.color,H=R.intensity,K=R.distance;let F=null;if(R.shadow&&R.shadow.map&&(R.shadow.map.texture.format===_n?F=R.shadow.map.texture:F=R.shadow.map.depthTexture||R.shadow.map.texture),R.isAmbientLight)h+=L.r*H,d+=L.g*H,u+=L.b*H;else if(R.isLightProbe){for(let N=0;N<9;N++)i.probe[N].addScaledVector(R.sh.coefficients[N],H);A++}else if(R.isDirectionalLight){const N=e.get(R);if(N.color.copy(R.color).multiplyScalar(R.intensity),R.castShadow){const B=R.shadow,Y=t.get(R);Y.shadowIntensity=B.intensity,Y.shadowBias=B.bias,Y.shadowNormalBias=B.normalBias,Y.shadowRadius=B.radius,Y.shadowMapSize=B.mapSize,i.directionalShadow[f]=Y,i.directionalShadowMap[f]=F,i.directionalShadowMatrix[f]=R.shadow.matrix,M++}i.directional[f]=N,f++}else if(R.isSpotLight){const N=e.get(R);N.position.setFromMatrixPosition(R.matrixWorld),N.color.copy(L).multiplyScalar(H),N.distance=K,N.coneCos=Math.cos(R.angle),N.penumbraCos=Math.cos(R.angle*(1-R.penumbra)),N.decay=R.decay,i.spot[v]=N;const B=R.shadow;if(R.map&&(i.spotLightMap[E]=R.map,E++,B.updateMatrices(R),R.castShadow&&w++),i.spotLightMatrix[v]=B.matrix,R.castShadow){const Y=t.get(R);Y.shadowIntensity=B.intensity,Y.shadowBias=B.bias,Y.shadowNormalBias=B.normalBias,Y.shadowRadius=B.radius,Y.shadowMapSize=B.mapSize,i.spotShadow[v]=Y,i.spotShadowMap[v]=F,y++}v++}else if(R.isRectAreaLight){const N=e.get(R);N.color.copy(L).multiplyScalar(H),N.halfWidth.set(R.width*.5,0,0),N.halfHeight.set(0,R.height*.5,0),i.rectArea[m]=N,m++}else if(R.isPointLight){const N=e.get(R);if(N.color.copy(R.color).multiplyScalar(R.intensity),N.distance=R.distance,N.decay=R.decay,R.castShadow){const B=R.shadow,Y=t.get(R);Y.shadowIntensity=B.intensity,Y.shadowBias=B.bias,Y.shadowNormalBias=B.normalBias,Y.shadowRadius=B.radius,Y.shadowMapSize=B.mapSize,Y.shadowCameraNear=B.camera.near,Y.shadowCameraFar=B.camera.far,i.pointShadow[g]=Y,i.pointShadowMap[g]=F,i.pointShadowMatrix[g]=R.shadow.matrix,T++}i.point[g]=N,g++}else if(R.isHemisphereLight){const N=e.get(R);N.skyColor.copy(R.color).multiplyScalar(H),N.groundColor.copy(R.groundColor).multiplyScalar(H),i.hemi[p]=N,p++}}m>0&&(r.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=pe.LTC_FLOAT_1,i.rectAreaLTC2=pe.LTC_FLOAT_2):(i.rectAreaLTC1=pe.LTC_HALF_1,i.rectAreaLTC2=pe.LTC_HALF_2)),i.ambient[0]=h,i.ambient[1]=d,i.ambient[2]=u;const _=i.hash;(_.directionalLength!==f||_.pointLength!==g||_.spotLength!==v||_.rectAreaLength!==m||_.hemiLength!==p||_.numDirectionalShadows!==M||_.numPointShadows!==T||_.numSpotShadows!==y||_.numSpotMaps!==E||_.numLightProbes!==A)&&(i.directional.length=f,i.spot.length=v,i.rectArea.length=m,i.point.length=g,i.hemi.length=p,i.directionalShadow.length=M,i.directionalShadowMap.length=M,i.pointShadow.length=T,i.pointShadowMap.length=T,i.spotShadow.length=y,i.spotShadowMap.length=y,i.directionalShadowMatrix.length=M,i.pointShadowMatrix.length=T,i.spotLightMatrix.length=y+E-w,i.spotLightMap.length=E,i.numSpotLightShadowsWithMaps=w,i.numLightProbes=A,_.directionalLength=f,_.pointLength=g,_.spotLength=v,_.rectAreaLength=m,_.hemiLength=p,_.numDirectionalShadows=M,_.numPointShadows=T,_.numSpotShadows=y,_.numSpotMaps=E,_.numLightProbes=A,i.version=n0++)}function c(l,h){let d=0,u=0,f=0,g=0,v=0;const m=h.matrixWorldInverse;for(let p=0,M=l.length;p<M;p++){const T=l[p];if(T.isDirectionalLight){const y=i.directional[d];y.direction.setFromMatrixPosition(T.matrixWorld),n.setFromMatrixPosition(T.target.matrixWorld),y.direction.sub(n),y.direction.transformDirection(m),d++}else if(T.isSpotLight){const y=i.spot[f];y.position.setFromMatrixPosition(T.matrixWorld),y.position.applyMatrix4(m),y.direction.setFromMatrixPosition(T.matrixWorld),n.setFromMatrixPosition(T.target.matrixWorld),y.direction.sub(n),y.direction.transformDirection(m),f++}else if(T.isRectAreaLight){const y=i.rectArea[g];y.position.setFromMatrixPosition(T.matrixWorld),y.position.applyMatrix4(m),a.identity(),s.copy(T.matrixWorld),s.premultiply(m),a.extractRotation(s),y.halfWidth.set(T.width*.5,0,0),y.halfHeight.set(0,T.height*.5,0),y.halfWidth.applyMatrix4(a),y.halfHeight.applyMatrix4(a),g++}else if(T.isPointLight){const y=i.point[u];y.position.setFromMatrixPosition(T.matrixWorld),y.position.applyMatrix4(m),u++}else if(T.isHemisphereLight){const y=i.hemi[v];y.direction.setFromMatrixPosition(T.matrixWorld),y.direction.transformDirection(m),v++}}}return{setup:o,setupView:c,state:i}}function Fc(r){const e=new r0(r),t=[],i=[],n=[];function s(u){d.camera=u,t.length=0,i.length=0,n.length=0}function a(u){t.push(u)}function o(u){i.push(u)}function c(u){n.push(u)}function l(){e.setup(t)}function h(u){e.setupView(t,u)}const d={lightsArray:t,shadowsArray:i,lightProbeGridArray:n,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:s,state:d,setupLights:l,setupLightsView:h,pushLight:a,pushShadow:o,pushLightProbeGrid:c}}function a0(r){let e=new WeakMap;function t(n,s=0){const a=e.get(n);let o;return a===void 0?(o=new Fc(r),e.set(n,[o])):s>=a.length?(o=new Fc(r),a.push(o)):o=a[s],o}function i(){e=new WeakMap}return{get:t,dispose:i}}const o0=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,l0=`uniform sampler2D shadow_pass;
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
}`,c0=[new D(1,0,0),new D(-1,0,0),new D(0,1,0),new D(0,-1,0),new D(0,0,1),new D(0,0,-1)],h0=[new D(0,-1,0),new D(0,-1,0),new D(0,0,1),new D(0,0,-1),new D(0,-1,0),new D(0,-1,0)],Oc=new Oe,ds=new D,Ia=new D;function u0(r,e,t){let i=new Yo;const n=new De,s=new De,a=new it,o=new nf,c=new sf,l={},h=t.maxTextureSize,d={[Fi]:qt,[qt]:Fi,[yi]:yi},u=new Ti({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new De},radius:{value:4}},vertexShader:o0,fragmentShader:l0}),f=u.clone();f.defines.HORIZONTAL_PASS=1;const g=new kt;g.setAttribute("position",new ei(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const v=new Vt(g,u),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=vr;let p=this.type;this.render=function(w,A,_){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||w.length===0)return;this.type===lu&&(Le("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),this.type=vr);const S=r.getRenderTarget(),P=r.getActiveCubeFace(),R=r.getActiveMipmapLevel(),L=r.state;L.setBlending(Ii),L.buffers.depth.getReversed()===!0?L.buffers.color.setClear(0,0,0,0):L.buffers.color.setClear(1,1,1,1),L.buffers.depth.setTest(!0),L.setScissorTest(!1);const H=p!==this.type;H&&A.traverse(function(K){K.material&&(Array.isArray(K.material)?K.material.forEach(F=>F.needsUpdate=!0):K.material.needsUpdate=!0)});for(let K=0,F=w.length;K<F;K++){const N=w[K],B=N.shadow;if(B===void 0){Le("WebGLShadowMap:",N,"has no shadow.");continue}if(B.autoUpdate===!1&&B.needsUpdate===!1)continue;n.copy(B.mapSize);const Y=B.getFrameExtents();n.multiply(Y),s.copy(B.mapSize),(n.x>h||n.y>h)&&(n.x>h&&(s.x=Math.floor(h/Y.x),n.x=s.x*Y.x,B.mapSize.x=s.x),n.y>h&&(s.y=Math.floor(h/Y.y),n.y=s.y*Y.y,B.mapSize.y=s.y));const j=r.state.buffers.depth.getReversed();if(B.camera._reversedDepth=j,B.map===null||H===!0){if(B.map!==null&&(B.map.depthTexture!==null&&(B.map.depthTexture.dispose(),B.map.depthTexture=null),B.map.dispose()),this.type===ps){if(N.isPointLight){Le("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}B.map=new Si(n.x,n.y,{format:_n,type:Oi,minFilter:St,magFilter:St,generateMipmaps:!1}),B.map.texture.name=N.name+".shadowMap",B.map.depthTexture=new $n(n.x,n.y,ci),B.map.depthTexture.name=N.name+".shadowMapDepth",B.map.depthTexture.format=ki,B.map.depthTexture.compareFunction=null,B.map.depthTexture.minFilter=Nt,B.map.depthTexture.magFilter=Nt}else N.isPointLight?(B.map=new Bh(n.x),B.map.depthTexture=new Ld(n.x,Ei)):(B.map=new Si(n.x,n.y),B.map.depthTexture=new $n(n.x,n.y,Ei)),B.map.depthTexture.name=N.name+".shadowMap",B.map.depthTexture.format=ki,this.type===vr?(B.map.depthTexture.compareFunction=j?Vo:Go,B.map.depthTexture.minFilter=St,B.map.depthTexture.magFilter=St):(B.map.depthTexture.compareFunction=null,B.map.depthTexture.minFilter=Nt,B.map.depthTexture.magFilter=Nt);B.camera.updateProjectionMatrix()}const se=B.map.isWebGLCubeRenderTarget?6:1;for(let ne=0;ne<se;ne++){if(B.map.isWebGLCubeRenderTarget)r.setRenderTarget(B.map,ne),r.clear();else{ne===0&&(r.setRenderTarget(B.map),r.clear());const re=B.getViewport(ne);a.set(s.x*re.x,s.y*re.y,s.x*re.z,s.y*re.w),L.viewport(a)}if(N.isPointLight){const re=B.camera,xe=B.matrix,ve=N.distance||re.far;ve!==re.far&&(re.far=ve,re.updateProjectionMatrix()),ds.setFromMatrixPosition(N.matrixWorld),re.position.copy(ds),Ia.copy(re.position),Ia.add(c0[ne]),re.up.copy(h0[ne]),re.lookAt(Ia),re.updateMatrixWorld(),xe.makeTranslation(-ds.x,-ds.y,-ds.z),Oc.multiplyMatrices(re.projectionMatrix,re.matrixWorldInverse),B._frustum.setFromProjectionMatrix(Oc,re.coordinateSystem,re.reversedDepth)}else B.updateMatrices(N);i=B.getFrustum(),y(A,_,B.camera,N,this.type)}B.isPointLightShadow!==!0&&this.type===ps&&M(B,_),B.needsUpdate=!1}p=this.type,m.needsUpdate=!1,r.setRenderTarget(S,P,R)};function M(w,A){const _=e.update(v);u.defines.VSM_SAMPLES!==w.blurSamples&&(u.defines.VSM_SAMPLES=w.blurSamples,f.defines.VSM_SAMPLES=w.blurSamples,u.needsUpdate=!0,f.needsUpdate=!0),w.mapPass===null&&(w.mapPass=new Si(n.x,n.y,{format:_n,type:Oi})),u.uniforms.shadow_pass.value=w.map.depthTexture,u.uniforms.resolution.value=w.mapSize,u.uniforms.radius.value=w.radius,r.setRenderTarget(w.mapPass),r.clear(),r.renderBufferDirect(A,null,_,u,v,null),f.uniforms.shadow_pass.value=w.mapPass.texture,f.uniforms.resolution.value=w.mapSize,f.uniforms.radius.value=w.radius,r.setRenderTarget(w.map),r.clear(),r.renderBufferDirect(A,null,_,f,v,null)}function T(w,A,_,S){let P=null;const R=_.isPointLight===!0?w.customDistanceMaterial:w.customDepthMaterial;if(R!==void 0)P=R;else if(P=_.isPointLight===!0?c:o,r.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0||A.alphaToCoverage===!0){const L=P.uuid,H=A.uuid;let K=l[L];K===void 0&&(K={},l[L]=K);let F=K[H];F===void 0&&(F=P.clone(),K[H]=F,A.addEventListener("dispose",E)),P=F}if(P.visible=A.visible,P.wireframe=A.wireframe,S===ps?P.side=A.shadowSide!==null?A.shadowSide:A.side:P.side=A.shadowSide!==null?A.shadowSide:d[A.side],P.alphaMap=A.alphaMap,P.alphaTest=A.alphaToCoverage===!0?.5:A.alphaTest,P.map=A.map,P.clipShadows=A.clipShadows,P.clippingPlanes=A.clippingPlanes,P.clipIntersection=A.clipIntersection,P.displacementMap=A.displacementMap,P.displacementScale=A.displacementScale,P.displacementBias=A.displacementBias,P.wireframeLinewidth=A.wireframeLinewidth,P.linewidth=A.linewidth,_.isPointLight===!0&&P.isMeshDistanceMaterial===!0){const L=r.properties.get(P);L.light=_}return P}function y(w,A,_,S,P){if(w.visible===!1)return;if(w.layers.test(A.layers)&&(w.isMesh||w.isLine||w.isPoints)&&(w.castShadow||w.receiveShadow&&P===ps)&&(!w.frustumCulled||i.intersectsObject(w))){w.modelViewMatrix.multiplyMatrices(_.matrixWorldInverse,w.matrixWorld);const H=e.update(w),K=w.material;if(Array.isArray(K)){const F=H.groups;for(let N=0,B=F.length;N<B;N++){const Y=F[N],j=K[Y.materialIndex];if(j&&j.visible){const se=T(w,j,S,P);w.onBeforeShadow(r,w,A,_,H,se,Y),r.renderBufferDirect(_,null,H,se,w,Y),w.onAfterShadow(r,w,A,_,H,se,Y)}}}else if(K.visible){const F=T(w,K,S,P);w.onBeforeShadow(r,w,A,_,H,F,null),r.renderBufferDirect(_,null,H,F,w,null),w.onAfterShadow(r,w,A,_,H,F,null)}}const L=w.children;for(let H=0,K=L.length;H<K;H++)y(L[H],A,_,S,P)}function E(w){w.target.removeEventListener("dispose",E);for(const _ in l){const S=l[_],P=w.target.uuid;P in S&&(S[P].dispose(),delete S[P])}}}function d0(r,e){function t(){let I=!1;const le=new it;let Q=null;const de=new it(0,0,0,0);return{setMask:function(_e){Q!==_e&&!I&&(r.colorMask(_e,_e,_e,_e),Q=_e)},setLocked:function(_e){I=_e},setClear:function(_e,ie,Te,Me,ut){ut===!0&&(_e*=Me,ie*=Me,Te*=Me),le.set(_e,ie,Te,Me),de.equals(le)===!1&&(r.clearColor(_e,ie,Te,Me),de.copy(le))},reset:function(){I=!1,Q=null,de.set(-1,0,0,0)}}}function i(){let I=!1,le=!1,Q=null,de=null,_e=null;return{setReversed:function(ie){if(le!==ie){const Te=e.get("EXT_clip_control");ie?Te.clipControlEXT(Te.LOWER_LEFT_EXT,Te.ZERO_TO_ONE_EXT):Te.clipControlEXT(Te.LOWER_LEFT_EXT,Te.NEGATIVE_ONE_TO_ONE_EXT),le=ie;const Me=_e;_e=null,this.setClear(Me)}},getReversed:function(){return le},setTest:function(ie){ie?te(r.DEPTH_TEST):we(r.DEPTH_TEST)},setMask:function(ie){Q!==ie&&!I&&(r.depthMask(ie),Q=ie)},setFunc:function(ie){if(le&&(ie=Wu[ie]),de!==ie){switch(ie){case Va:r.depthFunc(r.NEVER);break;case Wa:r.depthFunc(r.ALWAYS);break;case Xa:r.depthFunc(r.LESS);break;case Yn:r.depthFunc(r.LEQUAL);break;case qa:r.depthFunc(r.EQUAL);break;case Ya:r.depthFunc(r.GEQUAL);break;case Ka:r.depthFunc(r.GREATER);break;case Za:r.depthFunc(r.NOTEQUAL);break;default:r.depthFunc(r.LEQUAL)}de=ie}},setLocked:function(ie){I=ie},setClear:function(ie){_e!==ie&&(_e=ie,le&&(ie=1-ie),r.clearDepth(ie))},reset:function(){I=!1,Q=null,de=null,_e=null,le=!1}}}function n(){let I=!1,le=null,Q=null,de=null,_e=null,ie=null,Te=null,Me=null,ut=null;return{setTest:function(at){I||(at?te(r.STENCIL_TEST):we(r.STENCIL_TEST))},setMask:function(at){le!==at&&!I&&(r.stencilMask(at),le=at)},setFunc:function(at,fi,pi){(Q!==at||de!==fi||_e!==pi)&&(r.stencilFunc(at,fi,pi),Q=at,de=fi,_e=pi)},setOp:function(at,fi,pi){(ie!==at||Te!==fi||Me!==pi)&&(r.stencilOp(at,fi,pi),ie=at,Te=fi,Me=pi)},setLocked:function(at){I=at},setClear:function(at){ut!==at&&(r.clearStencil(at),ut=at)},reset:function(){I=!1,le=null,Q=null,de=null,_e=null,ie=null,Te=null,Me=null,ut=null}}}const s=new t,a=new i,o=new n,c=new WeakMap,l=new WeakMap;let h={},d={},u={},f=new WeakMap,g=[],v=null,m=!1,p=null,M=null,T=null,y=null,E=null,w=null,A=null,_=new Be(0,0,0),S=0,P=!1,R=null,L=null,H=null,K=null,F=null;const N=r.getParameter(r.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let B=!1,Y=0;const j=r.getParameter(r.VERSION);j.indexOf("WebGL")!==-1?(Y=parseFloat(/^WebGL (\d)/.exec(j)[1]),B=Y>=1):j.indexOf("OpenGL ES")!==-1&&(Y=parseFloat(/^OpenGL ES (\d)/.exec(j)[1]),B=Y>=2);let se=null,ne={};const re=r.getParameter(r.SCISSOR_BOX),xe=r.getParameter(r.VIEWPORT),ve=new it().fromArray(re),oe=new it().fromArray(xe);function k(I,le,Q,de){const _e=new Uint8Array(4),ie=r.createTexture();r.bindTexture(I,ie),r.texParameteri(I,r.TEXTURE_MIN_FILTER,r.NEAREST),r.texParameteri(I,r.TEXTURE_MAG_FILTER,r.NEAREST);for(let Te=0;Te<Q;Te++)I===r.TEXTURE_3D||I===r.TEXTURE_2D_ARRAY?r.texImage3D(le,0,r.RGBA,1,1,de,0,r.RGBA,r.UNSIGNED_BYTE,_e):r.texImage2D(le+Te,0,r.RGBA,1,1,0,r.RGBA,r.UNSIGNED_BYTE,_e);return ie}const J={};J[r.TEXTURE_2D]=k(r.TEXTURE_2D,r.TEXTURE_2D,1),J[r.TEXTURE_CUBE_MAP]=k(r.TEXTURE_CUBE_MAP,r.TEXTURE_CUBE_MAP_POSITIVE_X,6),J[r.TEXTURE_2D_ARRAY]=k(r.TEXTURE_2D_ARRAY,r.TEXTURE_2D_ARRAY,1,1),J[r.TEXTURE_3D]=k(r.TEXTURE_3D,r.TEXTURE_3D,1,1),s.setClear(0,0,0,1),a.setClear(1),o.setClear(0),te(r.DEPTH_TEST),a.setFunc(Yn),xt(!1),bt(xl),te(r.CULL_FACE),$e(Ii);function te(I){h[I]!==!0&&(r.enable(I),h[I]=!0)}function we(I){h[I]!==!1&&(r.disable(I),h[I]=!1)}function Fe(I,le){return u[I]!==le?(r.bindFramebuffer(I,le),u[I]=le,I===r.DRAW_FRAMEBUFFER&&(u[r.FRAMEBUFFER]=le),I===r.FRAMEBUFFER&&(u[r.DRAW_FRAMEBUFFER]=le),!0):!1}function Ie(I,le){let Q=g,de=!1;if(I){Q=f.get(le),Q===void 0&&(Q=[],f.set(le,Q));const _e=I.textures;if(Q.length!==_e.length||Q[0]!==r.COLOR_ATTACHMENT0){for(let ie=0,Te=_e.length;ie<Te;ie++)Q[ie]=r.COLOR_ATTACHMENT0+ie;Q.length=_e.length,de=!0}}else Q[0]!==r.BACK&&(Q[0]=r.BACK,de=!0);de&&r.drawBuffers(Q)}function pt(I){return v!==I?(r.useProgram(I),v=I,!0):!1}const Ye={[dn]:r.FUNC_ADD,[hu]:r.FUNC_SUBTRACT,[uu]:r.FUNC_REVERSE_SUBTRACT};Ye[du]=r.MIN,Ye[fu]=r.MAX;const nt={[pu]:r.ZERO,[mu]:r.ONE,[gu]:r.SRC_COLOR,[Ha]:r.SRC_ALPHA,[Mu]:r.SRC_ALPHA_SATURATE,[yu]:r.DST_COLOR,[xu]:r.DST_ALPHA,[_u]:r.ONE_MINUS_SRC_COLOR,[Ga]:r.ONE_MINUS_SRC_ALPHA,[bu]:r.ONE_MINUS_DST_COLOR,[vu]:r.ONE_MINUS_DST_ALPHA,[Su]:r.CONSTANT_COLOR,[Eu]:r.ONE_MINUS_CONSTANT_COLOR,[Tu]:r.CONSTANT_ALPHA,[wu]:r.ONE_MINUS_CONSTANT_ALPHA};function $e(I,le,Q,de,_e,ie,Te,Me,ut,at){if(I===Ii){m===!0&&(we(r.BLEND),m=!1);return}if(m===!1&&(te(r.BLEND),m=!0),I!==cu){if(I!==p||at!==P){if((M!==dn||E!==dn)&&(r.blendEquation(r.FUNC_ADD),M=dn,E=dn),at)switch(I){case Gn:r.blendFuncSeparate(r.ONE,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case vl:r.blendFunc(r.ONE,r.ONE);break;case yl:r.blendFuncSeparate(r.ZERO,r.ONE_MINUS_SRC_COLOR,r.ZERO,r.ONE);break;case bl:r.blendFuncSeparate(r.DST_COLOR,r.ONE_MINUS_SRC_ALPHA,r.ZERO,r.ONE);break;default:We("WebGLState: Invalid blending: ",I);break}else switch(I){case Gn:r.blendFuncSeparate(r.SRC_ALPHA,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case vl:r.blendFuncSeparate(r.SRC_ALPHA,r.ONE,r.ONE,r.ONE);break;case yl:We("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case bl:We("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:We("WebGLState: Invalid blending: ",I);break}T=null,y=null,w=null,A=null,_.set(0,0,0),S=0,p=I,P=at}return}_e=_e||le,ie=ie||Q,Te=Te||de,(le!==M||_e!==E)&&(r.blendEquationSeparate(Ye[le],Ye[_e]),M=le,E=_e),(Q!==T||de!==y||ie!==w||Te!==A)&&(r.blendFuncSeparate(nt[Q],nt[de],nt[ie],nt[Te]),T=Q,y=de,w=ie,A=Te),(Me.equals(_)===!1||ut!==S)&&(r.blendColor(Me.r,Me.g,Me.b,ut),_.copy(Me),S=ut),p=I,P=!1}function Ke(I,le){I.side===yi?we(r.CULL_FACE):te(r.CULL_FACE);let Q=I.side===qt;le&&(Q=!Q),xt(Q),I.blending===Gn&&I.transparent===!1?$e(Ii):$e(I.blending,I.blendEquation,I.blendSrc,I.blendDst,I.blendEquationAlpha,I.blendSrcAlpha,I.blendDstAlpha,I.blendColor,I.blendAlpha,I.premultipliedAlpha),a.setFunc(I.depthFunc),a.setTest(I.depthTest),a.setMask(I.depthWrite),s.setMask(I.colorWrite);const de=I.stencilWrite;o.setTest(de),de&&(o.setMask(I.stencilWriteMask),o.setFunc(I.stencilFunc,I.stencilRef,I.stencilFuncMask),o.setOp(I.stencilFail,I.stencilZFail,I.stencilZPass)),Lt(I.polygonOffset,I.polygonOffsetFactor,I.polygonOffsetUnits),I.alphaToCoverage===!0?te(r.SAMPLE_ALPHA_TO_COVERAGE):we(r.SAMPLE_ALPHA_TO_COVERAGE)}function xt(I){R!==I&&(I?r.frontFace(r.CW):r.frontFace(r.CCW),R=I)}function bt(I){I!==au?(te(r.CULL_FACE),I!==L&&(I===xl?r.cullFace(r.BACK):I===ou?r.cullFace(r.FRONT):r.cullFace(r.FRONT_AND_BACK))):we(r.CULL_FACE),L=I}function At(I){I!==H&&(B&&r.lineWidth(I),H=I)}function Lt(I,le,Q){I?(te(r.POLYGON_OFFSET_FILL),(K!==le||F!==Q)&&(K=le,F=Q,a.getReversed()&&(le=-le),r.polygonOffset(le,Q))):we(r.POLYGON_OFFSET_FILL)}function ht(I){I?te(r.SCISSOR_TEST):we(r.SCISSOR_TEST)}function vt(I){I===void 0&&(I=r.TEXTURE0+N-1),se!==I&&(r.activeTexture(I),se=I)}function U(I,le,Q){Q===void 0&&(se===null?Q=r.TEXTURE0+N-1:Q=se);let de=ne[Q];de===void 0&&(de={type:void 0,texture:void 0},ne[Q]=de),(de.type!==I||de.texture!==le)&&(se!==Q&&(r.activeTexture(Q),se=Q),r.bindTexture(I,le||J[I]),de.type=I,de.texture=le)}function Wt(){const I=ne[se];I!==void 0&&I.type!==void 0&&(r.bindTexture(I.type,null),I.type=void 0,I.texture=void 0)}function Je(){try{r.compressedTexImage2D(...arguments)}catch(I){We("WebGLState:",I)}}function C(){try{r.compressedTexImage3D(...arguments)}catch(I){We("WebGLState:",I)}}function x(){try{r.texSubImage2D(...arguments)}catch(I){We("WebGLState:",I)}}function z(){try{r.texSubImage3D(...arguments)}catch(I){We("WebGLState:",I)}}function W(){try{r.compressedTexSubImage2D(...arguments)}catch(I){We("WebGLState:",I)}}function Z(){try{r.compressedTexSubImage3D(...arguments)}catch(I){We("WebGLState:",I)}}function ae(){try{r.texStorage2D(...arguments)}catch(I){We("WebGLState:",I)}}function ce(){try{r.texStorage3D(...arguments)}catch(I){We("WebGLState:",I)}}function $(){try{r.texImage2D(...arguments)}catch(I){We("WebGLState:",I)}}function ee(){try{r.texImage3D(...arguments)}catch(I){We("WebGLState:",I)}}function he(I){return d[I]!==void 0?d[I]:r.getParameter(I)}function Ae(I,le){d[I]!==le&&(r.pixelStorei(I,le),d[I]=le)}function fe(I){ve.equals(I)===!1&&(r.scissor(I.x,I.y,I.z,I.w),ve.copy(I))}function ue(I){oe.equals(I)===!1&&(r.viewport(I.x,I.y,I.z,I.w),oe.copy(I))}function Ne(I,le){let Q=l.get(le);Q===void 0&&(Q=new WeakMap,l.set(le,Q));let de=Q.get(I);de===void 0&&(de=r.getUniformBlockIndex(le,I.name),Q.set(I,de))}function Ue(I,le){const de=l.get(le).get(I);c.get(le)!==de&&(r.uniformBlockBinding(le,de,I.__bindingPointIndex),c.set(le,de))}function ze(){r.disable(r.BLEND),r.disable(r.CULL_FACE),r.disable(r.DEPTH_TEST),r.disable(r.POLYGON_OFFSET_FILL),r.disable(r.SCISSOR_TEST),r.disable(r.STENCIL_TEST),r.disable(r.SAMPLE_ALPHA_TO_COVERAGE),r.blendEquation(r.FUNC_ADD),r.blendFunc(r.ONE,r.ZERO),r.blendFuncSeparate(r.ONE,r.ZERO,r.ONE,r.ZERO),r.blendColor(0,0,0,0),r.colorMask(!0,!0,!0,!0),r.clearColor(0,0,0,0),r.depthMask(!0),r.depthFunc(r.LESS),a.setReversed(!1),r.clearDepth(1),r.stencilMask(4294967295),r.stencilFunc(r.ALWAYS,0,4294967295),r.stencilOp(r.KEEP,r.KEEP,r.KEEP),r.clearStencil(0),r.cullFace(r.BACK),r.frontFace(r.CCW),r.polygonOffset(0,0),r.activeTexture(r.TEXTURE0),r.bindFramebuffer(r.FRAMEBUFFER,null),r.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),r.bindFramebuffer(r.READ_FRAMEBUFFER,null),r.useProgram(null),r.lineWidth(1),r.scissor(0,0,r.canvas.width,r.canvas.height),r.viewport(0,0,r.canvas.width,r.canvas.height),r.pixelStorei(r.PACK_ALIGNMENT,4),r.pixelStorei(r.UNPACK_ALIGNMENT,4),r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,!1),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,r.BROWSER_DEFAULT_WEBGL),r.pixelStorei(r.PACK_ROW_LENGTH,0),r.pixelStorei(r.PACK_SKIP_PIXELS,0),r.pixelStorei(r.PACK_SKIP_ROWS,0),r.pixelStorei(r.UNPACK_ROW_LENGTH,0),r.pixelStorei(r.UNPACK_IMAGE_HEIGHT,0),r.pixelStorei(r.UNPACK_SKIP_PIXELS,0),r.pixelStorei(r.UNPACK_SKIP_ROWS,0),r.pixelStorei(r.UNPACK_SKIP_IMAGES,0),h={},d={},se=null,ne={},u={},f=new WeakMap,g=[],v=null,m=!1,p=null,M=null,T=null,y=null,E=null,w=null,A=null,_=new Be(0,0,0),S=0,P=!1,R=null,L=null,H=null,K=null,F=null,ve.set(0,0,r.canvas.width,r.canvas.height),oe.set(0,0,r.canvas.width,r.canvas.height),s.reset(),a.reset(),o.reset()}return{buffers:{color:s,depth:a,stencil:o},enable:te,disable:we,bindFramebuffer:Fe,drawBuffers:Ie,useProgram:pt,setBlending:$e,setMaterial:Ke,setFlipSided:xt,setCullFace:bt,setLineWidth:At,setPolygonOffset:Lt,setScissorTest:ht,activeTexture:vt,bindTexture:U,unbindTexture:Wt,compressedTexImage2D:Je,compressedTexImage3D:C,texImage2D:$,texImage3D:ee,pixelStorei:Ae,getParameter:he,updateUBOMapping:Ne,uniformBlockBinding:Ue,texStorage2D:ae,texStorage3D:ce,texSubImage2D:x,texSubImage3D:z,compressedTexSubImage2D:W,compressedTexSubImage3D:Z,scissor:fe,viewport:ue,reset:ze}}function f0(r,e,t,i,n,s,a){const o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new De,h=new WeakMap,d=new Set;let u;const f=new WeakMap;let g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function v(C,x){return g?new OffscreenCanvas(C,x):As("canvas")}function m(C,x,z){let W=1;const Z=Je(C);if((Z.width>z||Z.height>z)&&(W=z/Math.max(Z.width,Z.height)),W<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){const ae=Math.floor(W*Z.width),ce=Math.floor(W*Z.height);u===void 0&&(u=v(ae,ce));const $=x?v(ae,ce):u;return $.width=ae,$.height=ce,$.getContext("2d").drawImage(C,0,0,ae,ce),Le("WebGLRenderer: Texture has been resized from ("+Z.width+"x"+Z.height+") to ("+ae+"x"+ce+")."),$}else return"data"in C&&Le("WebGLRenderer: Image in DataTexture is too big ("+Z.width+"x"+Z.height+")."),C;return C}function p(C){return C.generateMipmaps}function M(C){r.generateMipmap(C)}function T(C){return C.isWebGLCubeRenderTarget?r.TEXTURE_CUBE_MAP:C.isWebGL3DRenderTarget?r.TEXTURE_3D:C.isWebGLArrayRenderTarget||C.isCompressedArrayTexture?r.TEXTURE_2D_ARRAY:r.TEXTURE_2D}function y(C,x,z,W,Z,ae=!1){if(C!==null){if(r[C]!==void 0)return r[C];Le("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let ce;W&&(ce=e.get("EXT_texture_norm16"),ce||Le("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let $=x;if(x===r.RED&&(z===r.FLOAT&&($=r.R32F),z===r.HALF_FLOAT&&($=r.R16F),z===r.UNSIGNED_BYTE&&($=r.R8),z===r.UNSIGNED_SHORT&&ce&&($=ce.R16_EXT),z===r.SHORT&&ce&&($=ce.R16_SNORM_EXT)),x===r.RED_INTEGER&&(z===r.UNSIGNED_BYTE&&($=r.R8UI),z===r.UNSIGNED_SHORT&&($=r.R16UI),z===r.UNSIGNED_INT&&($=r.R32UI),z===r.BYTE&&($=r.R8I),z===r.SHORT&&($=r.R16I),z===r.INT&&($=r.R32I)),x===r.RG&&(z===r.FLOAT&&($=r.RG32F),z===r.HALF_FLOAT&&($=r.RG16F),z===r.UNSIGNED_BYTE&&($=r.RG8),z===r.UNSIGNED_SHORT&&ce&&($=ce.RG16_EXT),z===r.SHORT&&ce&&($=ce.RG16_SNORM_EXT)),x===r.RG_INTEGER&&(z===r.UNSIGNED_BYTE&&($=r.RG8UI),z===r.UNSIGNED_SHORT&&($=r.RG16UI),z===r.UNSIGNED_INT&&($=r.RG32UI),z===r.BYTE&&($=r.RG8I),z===r.SHORT&&($=r.RG16I),z===r.INT&&($=r.RG32I)),x===r.RGB_INTEGER&&(z===r.UNSIGNED_BYTE&&($=r.RGB8UI),z===r.UNSIGNED_SHORT&&($=r.RGB16UI),z===r.UNSIGNED_INT&&($=r.RGB32UI),z===r.BYTE&&($=r.RGB8I),z===r.SHORT&&($=r.RGB16I),z===r.INT&&($=r.RGB32I)),x===r.RGBA_INTEGER&&(z===r.UNSIGNED_BYTE&&($=r.RGBA8UI),z===r.UNSIGNED_SHORT&&($=r.RGBA16UI),z===r.UNSIGNED_INT&&($=r.RGBA32UI),z===r.BYTE&&($=r.RGBA8I),z===r.SHORT&&($=r.RGBA16I),z===r.INT&&($=r.RGBA32I)),x===r.RGB&&(z===r.UNSIGNED_SHORT&&ce&&($=ce.RGB16_EXT),z===r.SHORT&&ce&&($=ce.RGB16_SNORM_EXT),z===r.UNSIGNED_INT_5_9_9_9_REV&&($=r.RGB9_E5),z===r.UNSIGNED_INT_10F_11F_11F_REV&&($=r.R11F_G11F_B10F)),x===r.RGBA){const ee=ae?Cr:Xe.getTransfer(Z);z===r.FLOAT&&($=r.RGBA32F),z===r.HALF_FLOAT&&($=r.RGBA16F),z===r.UNSIGNED_BYTE&&($=ee===je?r.SRGB8_ALPHA8:r.RGBA8),z===r.UNSIGNED_SHORT&&ce&&($=ce.RGBA16_EXT),z===r.SHORT&&ce&&($=ce.RGBA16_SNORM_EXT),z===r.UNSIGNED_SHORT_4_4_4_4&&($=r.RGBA4),z===r.UNSIGNED_SHORT_5_5_5_1&&($=r.RGB5_A1)}return($===r.R16F||$===r.R32F||$===r.RG16F||$===r.RG32F||$===r.RGBA16F||$===r.RGBA32F)&&e.get("EXT_color_buffer_float"),$}function E(C,x){let z;return C?x===null||x===Ei||x===Es?z=r.DEPTH24_STENCIL8:x===ci?z=r.DEPTH32F_STENCIL8:x===Ss&&(z=r.DEPTH24_STENCIL8,Le("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):x===null||x===Ei||x===Es?z=r.DEPTH_COMPONENT24:x===ci?z=r.DEPTH_COMPONENT32F:x===Ss&&(z=r.DEPTH_COMPONENT16),z}function w(C,x){return p(C)===!0||C.isFramebufferTexture&&C.minFilter!==Nt&&C.minFilter!==St?Math.log2(Math.max(x.width,x.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?x.mipmaps.length:1}function A(C){const x=C.target;x.removeEventListener("dispose",A),S(x),x.isVideoTexture&&h.delete(x),x.isHTMLTexture&&d.delete(x)}function _(C){const x=C.target;x.removeEventListener("dispose",_),R(x)}function S(C){const x=i.get(C);if(x.__webglInit===void 0)return;const z=C.source,W=f.get(z);if(W){const Z=W[x.__cacheKey];Z.usedTimes--,Z.usedTimes===0&&P(C),Object.keys(W).length===0&&f.delete(z)}i.remove(C)}function P(C){const x=i.get(C);r.deleteTexture(x.__webglTexture);const z=C.source,W=f.get(z);delete W[x.__cacheKey],a.memory.textures--}function R(C){const x=i.get(C);if(C.depthTexture&&(C.depthTexture.dispose(),i.remove(C.depthTexture)),C.isWebGLCubeRenderTarget)for(let W=0;W<6;W++){if(Array.isArray(x.__webglFramebuffer[W]))for(let Z=0;Z<x.__webglFramebuffer[W].length;Z++)r.deleteFramebuffer(x.__webglFramebuffer[W][Z]);else r.deleteFramebuffer(x.__webglFramebuffer[W]);x.__webglDepthbuffer&&r.deleteRenderbuffer(x.__webglDepthbuffer[W])}else{if(Array.isArray(x.__webglFramebuffer))for(let W=0;W<x.__webglFramebuffer.length;W++)r.deleteFramebuffer(x.__webglFramebuffer[W]);else r.deleteFramebuffer(x.__webglFramebuffer);if(x.__webglDepthbuffer&&r.deleteRenderbuffer(x.__webglDepthbuffer),x.__webglMultisampledFramebuffer&&r.deleteFramebuffer(x.__webglMultisampledFramebuffer),x.__webglColorRenderbuffer)for(let W=0;W<x.__webglColorRenderbuffer.length;W++)x.__webglColorRenderbuffer[W]&&r.deleteRenderbuffer(x.__webglColorRenderbuffer[W]);x.__webglDepthRenderbuffer&&r.deleteRenderbuffer(x.__webglDepthRenderbuffer)}const z=C.textures;for(let W=0,Z=z.length;W<Z;W++){const ae=i.get(z[W]);ae.__webglTexture&&(r.deleteTexture(ae.__webglTexture),a.memory.textures--),i.remove(z[W])}i.remove(C)}let L=0;function H(){L=0}function K(){return L}function F(C){L=C}function N(){const C=L;return C>=n.maxTextures&&Le("WebGLTextures: Trying to use "+C+" texture units while this GPU supports only "+n.maxTextures),L+=1,C}function B(C){const x=[];return x.push(C.wrapS),x.push(C.wrapT),x.push(C.wrapR||0),x.push(C.magFilter),x.push(C.minFilter),x.push(C.anisotropy),x.push(C.internalFormat),x.push(C.format),x.push(C.type),x.push(C.generateMipmaps),x.push(C.premultiplyAlpha),x.push(C.flipY),x.push(C.unpackAlignment),x.push(C.colorSpace),x.join()}function Y(C,x){const z=i.get(C);if(C.isVideoTexture&&U(C),C.isRenderTargetTexture===!1&&C.isExternalTexture!==!0&&C.version>0&&z.__version!==C.version){const W=C.image;if(W===null)Le("WebGLRenderer: Texture marked for update but no image data found.");else if(W.complete===!1)Le("WebGLRenderer: Texture marked for update but image is incomplete");else{we(z,C,x);return}}else C.isExternalTexture&&(z.__webglTexture=C.sourceTexture?C.sourceTexture:null);t.bindTexture(r.TEXTURE_2D,z.__webglTexture,r.TEXTURE0+x)}function j(C,x){const z=i.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&z.__version!==C.version){we(z,C,x);return}else C.isExternalTexture&&(z.__webglTexture=C.sourceTexture?C.sourceTexture:null);t.bindTexture(r.TEXTURE_2D_ARRAY,z.__webglTexture,r.TEXTURE0+x)}function se(C,x){const z=i.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&z.__version!==C.version){we(z,C,x);return}t.bindTexture(r.TEXTURE_3D,z.__webglTexture,r.TEXTURE0+x)}function ne(C,x){const z=i.get(C);if(C.isCubeDepthTexture!==!0&&C.version>0&&z.__version!==C.version){Fe(z,C,x);return}t.bindTexture(r.TEXTURE_CUBE_MAP,z.__webglTexture,r.TEXTURE0+x)}const re={[pn]:r.REPEAT,[Qt]:r.CLAMP_TO_EDGE,[$a]:r.MIRRORED_REPEAT},xe={[Nt]:r.NEAREST,[Pu]:r.NEAREST_MIPMAP_NEAREST,[Fs]:r.NEAREST_MIPMAP_LINEAR,[St]:r.LINEAR,[ta]:r.LINEAR_MIPMAP_NEAREST,[Di]:r.LINEAR_MIPMAP_LINEAR},ve={[Iu]:r.NEVER,[Bu]:r.ALWAYS,[Uu]:r.LESS,[Go]:r.LEQUAL,[Fu]:r.EQUAL,[Vo]:r.GEQUAL,[Ou]:r.GREATER,[ku]:r.NOTEQUAL};function oe(C,x){if(x.type===ci&&e.has("OES_texture_float_linear")===!1&&(x.magFilter===St||x.magFilter===ta||x.magFilter===Fs||x.magFilter===Di||x.minFilter===St||x.minFilter===ta||x.minFilter===Fs||x.minFilter===Di)&&Le("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),r.texParameteri(C,r.TEXTURE_WRAP_S,re[x.wrapS]),r.texParameteri(C,r.TEXTURE_WRAP_T,re[x.wrapT]),(C===r.TEXTURE_3D||C===r.TEXTURE_2D_ARRAY)&&r.texParameteri(C,r.TEXTURE_WRAP_R,re[x.wrapR]),r.texParameteri(C,r.TEXTURE_MAG_FILTER,xe[x.magFilter]),r.texParameteri(C,r.TEXTURE_MIN_FILTER,xe[x.minFilter]),x.compareFunction&&(r.texParameteri(C,r.TEXTURE_COMPARE_MODE,r.COMPARE_REF_TO_TEXTURE),r.texParameteri(C,r.TEXTURE_COMPARE_FUNC,ve[x.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(x.magFilter===Nt||x.minFilter!==Fs&&x.minFilter!==Di||x.type===ci&&e.has("OES_texture_float_linear")===!1)return;if(x.anisotropy>1||i.get(x).__currentAnisotropy){const z=e.get("EXT_texture_filter_anisotropic");r.texParameterf(C,z.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(x.anisotropy,n.getMaxAnisotropy())),i.get(x).__currentAnisotropy=x.anisotropy}}}function k(C,x){let z=!1;C.__webglInit===void 0&&(C.__webglInit=!0,x.addEventListener("dispose",A));const W=x.source;let Z=f.get(W);Z===void 0&&(Z={},f.set(W,Z));const ae=B(x);if(ae!==C.__cacheKey){Z[ae]===void 0&&(Z[ae]={texture:r.createTexture(),usedTimes:0},a.memory.textures++,z=!0),Z[ae].usedTimes++;const ce=Z[C.__cacheKey];ce!==void 0&&(Z[C.__cacheKey].usedTimes--,ce.usedTimes===0&&P(x)),C.__cacheKey=ae,C.__webglTexture=Z[ae].texture}return z}function J(C,x,z){return Math.floor(Math.floor(C/z)/x)}function te(C,x,z,W){const ae=C.updateRanges;if(ae.length===0)t.texSubImage2D(r.TEXTURE_2D,0,0,0,x.width,x.height,z,W,x.data);else{ae.sort((Ae,fe)=>Ae.start-fe.start);let ce=0;for(let Ae=1;Ae<ae.length;Ae++){const fe=ae[ce],ue=ae[Ae],Ne=fe.start+fe.count,Ue=J(ue.start,x.width,4),ze=J(fe.start,x.width,4);ue.start<=Ne+1&&Ue===ze&&J(ue.start+ue.count-1,x.width,4)===Ue?fe.count=Math.max(fe.count,ue.start+ue.count-fe.start):(++ce,ae[ce]=ue)}ae.length=ce+1;const $=t.getParameter(r.UNPACK_ROW_LENGTH),ee=t.getParameter(r.UNPACK_SKIP_PIXELS),he=t.getParameter(r.UNPACK_SKIP_ROWS);t.pixelStorei(r.UNPACK_ROW_LENGTH,x.width);for(let Ae=0,fe=ae.length;Ae<fe;Ae++){const ue=ae[Ae],Ne=Math.floor(ue.start/4),Ue=Math.ceil(ue.count/4),ze=Ne%x.width,I=Math.floor(Ne/x.width),le=Ue,Q=1;t.pixelStorei(r.UNPACK_SKIP_PIXELS,ze),t.pixelStorei(r.UNPACK_SKIP_ROWS,I),t.texSubImage2D(r.TEXTURE_2D,0,ze,I,le,Q,z,W,x.data)}C.clearUpdateRanges(),t.pixelStorei(r.UNPACK_ROW_LENGTH,$),t.pixelStorei(r.UNPACK_SKIP_PIXELS,ee),t.pixelStorei(r.UNPACK_SKIP_ROWS,he)}}function we(C,x,z){let W=r.TEXTURE_2D;(x.isDataArrayTexture||x.isCompressedArrayTexture)&&(W=r.TEXTURE_2D_ARRAY),x.isData3DTexture&&(W=r.TEXTURE_3D);const Z=k(C,x),ae=x.source;t.bindTexture(W,C.__webglTexture,r.TEXTURE0+z);const ce=i.get(ae);if(ae.version!==ce.__version||Z===!0){if(t.activeTexture(r.TEXTURE0+z),(typeof ImageBitmap<"u"&&x.image instanceof ImageBitmap)===!1){const Q=Xe.getPrimaries(Xe.workingColorSpace),de=x.colorSpace===Ji?null:Xe.getPrimaries(x.colorSpace),_e=x.colorSpace===Ji||Q===de?r.NONE:r.BROWSER_DEFAULT_WEBGL;t.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,x.flipY),t.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),t.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,_e)}t.pixelStorei(r.UNPACK_ALIGNMENT,x.unpackAlignment);let ee=m(x.image,!1,n.maxTextureSize);ee=Wt(x,ee);const he=s.convert(x.format,x.colorSpace),Ae=s.convert(x.type);let fe=y(x.internalFormat,he,Ae,x.normalized,x.colorSpace,x.isVideoTexture);oe(W,x);let ue;const Ne=x.mipmaps,Ue=x.isVideoTexture!==!0,ze=ce.__version===void 0||Z===!0,I=ae.dataReady,le=w(x,ee);if(x.isDepthTexture)fe=E(x.format===mn,x.type),ze&&(Ue?t.texStorage2D(r.TEXTURE_2D,1,fe,ee.width,ee.height):t.texImage2D(r.TEXTURE_2D,0,fe,ee.width,ee.height,0,he,Ae,null));else if(x.isDataTexture)if(Ne.length>0){Ue&&ze&&t.texStorage2D(r.TEXTURE_2D,le,fe,Ne[0].width,Ne[0].height);for(let Q=0,de=Ne.length;Q<de;Q++)ue=Ne[Q],Ue?I&&t.texSubImage2D(r.TEXTURE_2D,Q,0,0,ue.width,ue.height,he,Ae,ue.data):t.texImage2D(r.TEXTURE_2D,Q,fe,ue.width,ue.height,0,he,Ae,ue.data);x.generateMipmaps=!1}else Ue?(ze&&t.texStorage2D(r.TEXTURE_2D,le,fe,ee.width,ee.height),I&&te(x,ee,he,Ae)):t.texImage2D(r.TEXTURE_2D,0,fe,ee.width,ee.height,0,he,Ae,ee.data);else if(x.isCompressedTexture)if(x.isCompressedArrayTexture){Ue&&ze&&t.texStorage3D(r.TEXTURE_2D_ARRAY,le,fe,Ne[0].width,Ne[0].height,ee.depth);for(let Q=0,de=Ne.length;Q<de;Q++)if(ue=Ne[Q],x.format!==ri)if(he!==null)if(Ue){if(I)if(x.layerUpdates.size>0){const _e=pc(ue.width,ue.height,x.format,x.type);for(const ie of x.layerUpdates){const Te=ue.data.subarray(ie*_e/ue.data.BYTES_PER_ELEMENT,(ie+1)*_e/ue.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,Q,0,0,ie,ue.width,ue.height,1,he,Te)}x.clearLayerUpdates()}else t.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,Q,0,0,0,ue.width,ue.height,ee.depth,he,ue.data)}else t.compressedTexImage3D(r.TEXTURE_2D_ARRAY,Q,fe,ue.width,ue.height,ee.depth,0,ue.data,0,0);else Le("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ue?I&&t.texSubImage3D(r.TEXTURE_2D_ARRAY,Q,0,0,0,ue.width,ue.height,ee.depth,he,Ae,ue.data):t.texImage3D(r.TEXTURE_2D_ARRAY,Q,fe,ue.width,ue.height,ee.depth,0,he,Ae,ue.data)}else{Ue&&ze&&t.texStorage2D(r.TEXTURE_2D,le,fe,Ne[0].width,Ne[0].height);for(let Q=0,de=Ne.length;Q<de;Q++)ue=Ne[Q],x.format!==ri?he!==null?Ue?I&&t.compressedTexSubImage2D(r.TEXTURE_2D,Q,0,0,ue.width,ue.height,he,ue.data):t.compressedTexImage2D(r.TEXTURE_2D,Q,fe,ue.width,ue.height,0,ue.data):Le("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ue?I&&t.texSubImage2D(r.TEXTURE_2D,Q,0,0,ue.width,ue.height,he,Ae,ue.data):t.texImage2D(r.TEXTURE_2D,Q,fe,ue.width,ue.height,0,he,Ae,ue.data)}else if(x.isDataArrayTexture)if(Ue){if(ze&&t.texStorage3D(r.TEXTURE_2D_ARRAY,le,fe,ee.width,ee.height,ee.depth),I)if(x.layerUpdates.size>0){const Q=pc(ee.width,ee.height,x.format,x.type);for(const de of x.layerUpdates){const _e=ee.data.subarray(de*Q/ee.data.BYTES_PER_ELEMENT,(de+1)*Q/ee.data.BYTES_PER_ELEMENT);t.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,de,ee.width,ee.height,1,he,Ae,_e)}x.clearLayerUpdates()}else t.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,0,ee.width,ee.height,ee.depth,he,Ae,ee.data)}else t.texImage3D(r.TEXTURE_2D_ARRAY,0,fe,ee.width,ee.height,ee.depth,0,he,Ae,ee.data);else if(x.isData3DTexture)Ue?(ze&&t.texStorage3D(r.TEXTURE_3D,le,fe,ee.width,ee.height,ee.depth),I&&t.texSubImage3D(r.TEXTURE_3D,0,0,0,0,ee.width,ee.height,ee.depth,he,Ae,ee.data)):t.texImage3D(r.TEXTURE_3D,0,fe,ee.width,ee.height,ee.depth,0,he,Ae,ee.data);else if(x.isFramebufferTexture){if(ze)if(Ue)t.texStorage2D(r.TEXTURE_2D,le,fe,ee.width,ee.height);else{let Q=ee.width,de=ee.height;for(let _e=0;_e<le;_e++)t.texImage2D(r.TEXTURE_2D,_e,fe,Q,de,0,he,Ae,null),Q>>=1,de>>=1}}else if(x.isHTMLTexture){if("texElementImage2D"in r){const Q=r.canvas;if(Q.hasAttribute("layoutsubtree")||Q.setAttribute("layoutsubtree","true"),ee.parentNode!==Q){Q.appendChild(ee),d.add(x),Q.onpaint=de=>{const _e=de.changedElements;for(const ie of d)_e.includes(ie.image)&&(ie.needsUpdate=!0)},Q.requestPaint();return}if(r.texElementImage2D.length===3)r.texElementImage2D(r.TEXTURE_2D,r.RGBA8,ee);else{const _e=r.RGBA,ie=r.RGBA,Te=r.UNSIGNED_BYTE;r.texElementImage2D(r.TEXTURE_2D,0,_e,ie,Te,ee)}r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MIN_FILTER,r.LINEAR),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_S,r.CLAMP_TO_EDGE),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_T,r.CLAMP_TO_EDGE)}}else if(Ne.length>0){if(Ue&&ze){const Q=Je(Ne[0]);t.texStorage2D(r.TEXTURE_2D,le,fe,Q.width,Q.height)}for(let Q=0,de=Ne.length;Q<de;Q++)ue=Ne[Q],Ue?I&&t.texSubImage2D(r.TEXTURE_2D,Q,0,0,he,Ae,ue):t.texImage2D(r.TEXTURE_2D,Q,fe,he,Ae,ue);x.generateMipmaps=!1}else if(Ue){if(ze){const Q=Je(ee);t.texStorage2D(r.TEXTURE_2D,le,fe,Q.width,Q.height)}I&&t.texSubImage2D(r.TEXTURE_2D,0,0,0,he,Ae,ee)}else t.texImage2D(r.TEXTURE_2D,0,fe,he,Ae,ee);p(x)&&M(W),ce.__version=ae.version,x.onUpdate&&x.onUpdate(x)}C.__version=x.version}function Fe(C,x,z){if(x.image.length!==6)return;const W=k(C,x),Z=x.source;t.bindTexture(r.TEXTURE_CUBE_MAP,C.__webglTexture,r.TEXTURE0+z);const ae=i.get(Z);if(Z.version!==ae.__version||W===!0){t.activeTexture(r.TEXTURE0+z);const ce=Xe.getPrimaries(Xe.workingColorSpace),$=x.colorSpace===Ji?null:Xe.getPrimaries(x.colorSpace),ee=x.colorSpace===Ji||ce===$?r.NONE:r.BROWSER_DEFAULT_WEBGL;t.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,x.flipY),t.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),t.pixelStorei(r.UNPACK_ALIGNMENT,x.unpackAlignment),t.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,ee);const he=x.isCompressedTexture||x.image[0].isCompressedTexture,Ae=x.image[0]&&x.image[0].isDataTexture,fe=[];for(let ie=0;ie<6;ie++)!he&&!Ae?fe[ie]=m(x.image[ie],!0,n.maxCubemapSize):fe[ie]=Ae?x.image[ie].image:x.image[ie],fe[ie]=Wt(x,fe[ie]);const ue=fe[0],Ne=s.convert(x.format,x.colorSpace),Ue=s.convert(x.type),ze=y(x.internalFormat,Ne,Ue,x.normalized,x.colorSpace),I=x.isVideoTexture!==!0,le=ae.__version===void 0||W===!0,Q=Z.dataReady;let de=w(x,ue);oe(r.TEXTURE_CUBE_MAP,x);let _e;if(he){I&&le&&t.texStorage2D(r.TEXTURE_CUBE_MAP,de,ze,ue.width,ue.height);for(let ie=0;ie<6;ie++){_e=fe[ie].mipmaps;for(let Te=0;Te<_e.length;Te++){const Me=_e[Te];x.format!==ri?Ne!==null?I?Q&&t.compressedTexSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Te,0,0,Me.width,Me.height,Ne,Me.data):t.compressedTexImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Te,ze,Me.width,Me.height,0,Me.data):Le("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):I?Q&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Te,0,0,Me.width,Me.height,Ne,Ue,Me.data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Te,ze,Me.width,Me.height,0,Ne,Ue,Me.data)}}}else{if(_e=x.mipmaps,I&&le){_e.length>0&&de++;const ie=Je(fe[0]);t.texStorage2D(r.TEXTURE_CUBE_MAP,de,ze,ie.width,ie.height)}for(let ie=0;ie<6;ie++)if(Ae){I?Q&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,0,0,fe[ie].width,fe[ie].height,Ne,Ue,fe[ie].data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,ze,fe[ie].width,fe[ie].height,0,Ne,Ue,fe[ie].data);for(let Te=0;Te<_e.length;Te++){const ut=_e[Te].image[ie].image;I?Q&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Te+1,0,0,ut.width,ut.height,Ne,Ue,ut.data):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Te+1,ze,ut.width,ut.height,0,Ne,Ue,ut.data)}}else{I?Q&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,0,0,Ne,Ue,fe[ie]):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,ze,Ne,Ue,fe[ie]);for(let Te=0;Te<_e.length;Te++){const Me=_e[Te];I?Q&&t.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Te+1,0,0,Ne,Ue,Me.image[ie]):t.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Te+1,ze,Ne,Ue,Me.image[ie])}}}p(x)&&M(r.TEXTURE_CUBE_MAP),ae.__version=Z.version,x.onUpdate&&x.onUpdate(x)}C.__version=x.version}function Ie(C,x,z,W,Z,ae){const ce=s.convert(z.format,z.colorSpace),$=s.convert(z.type),ee=y(z.internalFormat,ce,$,z.normalized,z.colorSpace),he=i.get(x),Ae=i.get(z);if(Ae.__renderTarget=x,!he.__hasExternalTextures){const fe=Math.max(1,x.width>>ae),ue=Math.max(1,x.height>>ae);Z===r.TEXTURE_3D||Z===r.TEXTURE_2D_ARRAY?t.texImage3D(Z,ae,ee,fe,ue,x.depth,0,ce,$,null):t.texImage2D(Z,ae,ee,fe,ue,0,ce,$,null)}t.bindFramebuffer(r.FRAMEBUFFER,C),vt(x)?o.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,W,Z,Ae.__webglTexture,0,ht(x)):(Z===r.TEXTURE_2D||Z>=r.TEXTURE_CUBE_MAP_POSITIVE_X&&Z<=r.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&r.framebufferTexture2D(r.FRAMEBUFFER,W,Z,Ae.__webglTexture,ae),t.bindFramebuffer(r.FRAMEBUFFER,null)}function pt(C,x,z){if(r.bindRenderbuffer(r.RENDERBUFFER,C),x.depthBuffer){const W=x.depthTexture,Z=W&&W.isDepthTexture?W.type:null,ae=E(x.stencilBuffer,Z),ce=x.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT;vt(x)?o.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,ht(x),ae,x.width,x.height):z?r.renderbufferStorageMultisample(r.RENDERBUFFER,ht(x),ae,x.width,x.height):r.renderbufferStorage(r.RENDERBUFFER,ae,x.width,x.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,ce,r.RENDERBUFFER,C)}else{const W=x.textures;for(let Z=0;Z<W.length;Z++){const ae=W[Z],ce=s.convert(ae.format,ae.colorSpace),$=s.convert(ae.type),ee=y(ae.internalFormat,ce,$,ae.normalized,ae.colorSpace);vt(x)?o.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,ht(x),ee,x.width,x.height):z?r.renderbufferStorageMultisample(r.RENDERBUFFER,ht(x),ee,x.width,x.height):r.renderbufferStorage(r.RENDERBUFFER,ee,x.width,x.height)}}r.bindRenderbuffer(r.RENDERBUFFER,null)}function Ye(C,x,z){const W=x.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(r.FRAMEBUFFER,C),!(x.depthTexture&&x.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");const Z=i.get(x.depthTexture);if(Z.__renderTarget=x,(!Z.__webglTexture||x.depthTexture.image.width!==x.width||x.depthTexture.image.height!==x.height)&&(x.depthTexture.image.width=x.width,x.depthTexture.image.height=x.height,x.depthTexture.needsUpdate=!0),W){if(Z.__webglInit===void 0&&(Z.__webglInit=!0,x.depthTexture.addEventListener("dispose",A)),Z.__webglTexture===void 0){Z.__webglTexture=r.createTexture(),t.bindTexture(r.TEXTURE_CUBE_MAP,Z.__webglTexture),oe(r.TEXTURE_CUBE_MAP,x.depthTexture);const he=s.convert(x.depthTexture.format),Ae=s.convert(x.depthTexture.type);let fe;x.depthTexture.format===ki?fe=r.DEPTH_COMPONENT24:x.depthTexture.format===mn&&(fe=r.DEPTH24_STENCIL8);for(let ue=0;ue<6;ue++)r.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ue,0,fe,x.width,x.height,0,he,Ae,null)}}else Y(x.depthTexture,0);const ae=Z.__webglTexture,ce=ht(x),$=W?r.TEXTURE_CUBE_MAP_POSITIVE_X+z:r.TEXTURE_2D,ee=x.depthTexture.format===mn?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT;if(x.depthTexture.format===ki)vt(x)?o.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,ee,$,ae,0,ce):r.framebufferTexture2D(r.FRAMEBUFFER,ee,$,ae,0);else if(x.depthTexture.format===mn)vt(x)?o.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,ee,$,ae,0,ce):r.framebufferTexture2D(r.FRAMEBUFFER,ee,$,ae,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function nt(C){const x=i.get(C),z=C.isWebGLCubeRenderTarget===!0;if(x.__boundDepthTexture!==C.depthTexture){const W=C.depthTexture;if(x.__depthDisposeCallback&&x.__depthDisposeCallback(),W){const Z=()=>{delete x.__boundDepthTexture,delete x.__depthDisposeCallback,W.removeEventListener("dispose",Z)};W.addEventListener("dispose",Z),x.__depthDisposeCallback=Z}x.__boundDepthTexture=W}if(C.depthTexture&&!x.__autoAllocateDepthBuffer)if(z)for(let W=0;W<6;W++)Ye(x.__webglFramebuffer[W],C,W);else{const W=C.texture.mipmaps;W&&W.length>0?Ye(x.__webglFramebuffer[0],C,0):Ye(x.__webglFramebuffer,C,0)}else if(z){x.__webglDepthbuffer=[];for(let W=0;W<6;W++)if(t.bindFramebuffer(r.FRAMEBUFFER,x.__webglFramebuffer[W]),x.__webglDepthbuffer[W]===void 0)x.__webglDepthbuffer[W]=r.createRenderbuffer(),pt(x.__webglDepthbuffer[W],C,!1);else{const Z=C.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,ae=x.__webglDepthbuffer[W];r.bindRenderbuffer(r.RENDERBUFFER,ae),r.framebufferRenderbuffer(r.FRAMEBUFFER,Z,r.RENDERBUFFER,ae)}}else{const W=C.texture.mipmaps;if(W&&W.length>0?t.bindFramebuffer(r.FRAMEBUFFER,x.__webglFramebuffer[0]):t.bindFramebuffer(r.FRAMEBUFFER,x.__webglFramebuffer),x.__webglDepthbuffer===void 0)x.__webglDepthbuffer=r.createRenderbuffer(),pt(x.__webglDepthbuffer,C,!1);else{const Z=C.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,ae=x.__webglDepthbuffer;r.bindRenderbuffer(r.RENDERBUFFER,ae),r.framebufferRenderbuffer(r.FRAMEBUFFER,Z,r.RENDERBUFFER,ae)}}t.bindFramebuffer(r.FRAMEBUFFER,null)}function $e(C,x,z){const W=i.get(C);x!==void 0&&Ie(W.__webglFramebuffer,C,C.texture,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,0),z!==void 0&&nt(C)}function Ke(C){const x=C.texture,z=i.get(C),W=i.get(x);C.addEventListener("dispose",_);const Z=C.textures,ae=C.isWebGLCubeRenderTarget===!0,ce=Z.length>1;if(ce||(W.__webglTexture===void 0&&(W.__webglTexture=r.createTexture()),W.__version=x.version,a.memory.textures++),ae){z.__webglFramebuffer=[];for(let $=0;$<6;$++)if(x.mipmaps&&x.mipmaps.length>0){z.__webglFramebuffer[$]=[];for(let ee=0;ee<x.mipmaps.length;ee++)z.__webglFramebuffer[$][ee]=r.createFramebuffer()}else z.__webglFramebuffer[$]=r.createFramebuffer()}else{if(x.mipmaps&&x.mipmaps.length>0){z.__webglFramebuffer=[];for(let $=0;$<x.mipmaps.length;$++)z.__webglFramebuffer[$]=r.createFramebuffer()}else z.__webglFramebuffer=r.createFramebuffer();if(ce)for(let $=0,ee=Z.length;$<ee;$++){const he=i.get(Z[$]);he.__webglTexture===void 0&&(he.__webglTexture=r.createTexture(),a.memory.textures++)}if(C.samples>0&&vt(C)===!1){z.__webglMultisampledFramebuffer=r.createFramebuffer(),z.__webglColorRenderbuffer=[],t.bindFramebuffer(r.FRAMEBUFFER,z.__webglMultisampledFramebuffer);for(let $=0;$<Z.length;$++){const ee=Z[$];z.__webglColorRenderbuffer[$]=r.createRenderbuffer(),r.bindRenderbuffer(r.RENDERBUFFER,z.__webglColorRenderbuffer[$]);const he=s.convert(ee.format,ee.colorSpace),Ae=s.convert(ee.type),fe=y(ee.internalFormat,he,Ae,ee.normalized,ee.colorSpace,C.isXRRenderTarget===!0),ue=ht(C);r.renderbufferStorageMultisample(r.RENDERBUFFER,ue,fe,C.width,C.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+$,r.RENDERBUFFER,z.__webglColorRenderbuffer[$])}r.bindRenderbuffer(r.RENDERBUFFER,null),C.depthBuffer&&(z.__webglDepthRenderbuffer=r.createRenderbuffer(),pt(z.__webglDepthRenderbuffer,C,!0)),t.bindFramebuffer(r.FRAMEBUFFER,null)}}if(ae){t.bindTexture(r.TEXTURE_CUBE_MAP,W.__webglTexture),oe(r.TEXTURE_CUBE_MAP,x);for(let $=0;$<6;$++)if(x.mipmaps&&x.mipmaps.length>0)for(let ee=0;ee<x.mipmaps.length;ee++)Ie(z.__webglFramebuffer[$][ee],C,x,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+$,ee);else Ie(z.__webglFramebuffer[$],C,x,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+$,0);p(x)&&M(r.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(ce){for(let $=0,ee=Z.length;$<ee;$++){const he=Z[$],Ae=i.get(he);let fe=r.TEXTURE_2D;(C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(fe=C.isWebGL3DRenderTarget?r.TEXTURE_3D:r.TEXTURE_2D_ARRAY),t.bindTexture(fe,Ae.__webglTexture),oe(fe,he),Ie(z.__webglFramebuffer,C,he,r.COLOR_ATTACHMENT0+$,fe,0),p(he)&&M(fe)}t.unbindTexture()}else{let $=r.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&($=C.isWebGL3DRenderTarget?r.TEXTURE_3D:r.TEXTURE_2D_ARRAY),t.bindTexture($,W.__webglTexture),oe($,x),x.mipmaps&&x.mipmaps.length>0)for(let ee=0;ee<x.mipmaps.length;ee++)Ie(z.__webglFramebuffer[ee],C,x,r.COLOR_ATTACHMENT0,$,ee);else Ie(z.__webglFramebuffer,C,x,r.COLOR_ATTACHMENT0,$,0);p(x)&&M($),t.unbindTexture()}C.depthBuffer&&nt(C)}function xt(C){const x=C.textures;for(let z=0,W=x.length;z<W;z++){const Z=x[z];if(p(Z)){const ae=T(C),ce=i.get(Z).__webglTexture;t.bindTexture(ae,ce),M(ae),t.unbindTexture()}}}const bt=[],At=[];function Lt(C){if(C.samples>0){if(vt(C)===!1){const x=C.textures,z=C.width,W=C.height;let Z=r.COLOR_BUFFER_BIT;const ae=C.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,ce=i.get(C),$=x.length>1;if($)for(let he=0;he<x.length;he++)t.bindFramebuffer(r.FRAMEBUFFER,ce.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+he,r.RENDERBUFFER,null),t.bindFramebuffer(r.FRAMEBUFFER,ce.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+he,r.TEXTURE_2D,null,0);t.bindFramebuffer(r.READ_FRAMEBUFFER,ce.__webglMultisampledFramebuffer);const ee=C.texture.mipmaps;ee&&ee.length>0?t.bindFramebuffer(r.DRAW_FRAMEBUFFER,ce.__webglFramebuffer[0]):t.bindFramebuffer(r.DRAW_FRAMEBUFFER,ce.__webglFramebuffer);for(let he=0;he<x.length;he++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(Z|=r.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(Z|=r.STENCIL_BUFFER_BIT)),$){r.framebufferRenderbuffer(r.READ_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.RENDERBUFFER,ce.__webglColorRenderbuffer[he]);const Ae=i.get(x[he]).__webglTexture;r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,Ae,0)}r.blitFramebuffer(0,0,z,W,0,0,z,W,Z,r.NEAREST),c===!0&&(bt.length=0,At.length=0,bt.push(r.COLOR_ATTACHMENT0+he),C.depthBuffer&&C.resolveDepthBuffer===!1&&(bt.push(ae),At.push(ae),r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,At)),r.invalidateFramebuffer(r.READ_FRAMEBUFFER,bt))}if(t.bindFramebuffer(r.READ_FRAMEBUFFER,null),t.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),$)for(let he=0;he<x.length;he++){t.bindFramebuffer(r.FRAMEBUFFER,ce.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+he,r.RENDERBUFFER,ce.__webglColorRenderbuffer[he]);const Ae=i.get(x[he]).__webglTexture;t.bindFramebuffer(r.FRAMEBUFFER,ce.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+he,r.TEXTURE_2D,Ae,0)}t.bindFramebuffer(r.DRAW_FRAMEBUFFER,ce.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.resolveDepthBuffer===!1&&c){const x=C.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT;r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,[x])}}}function ht(C){return Math.min(n.maxSamples,C.samples)}function vt(C){const x=i.get(C);return C.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&x.__useRenderToTexture!==!1}function U(C){const x=a.render.frame;h.get(C)!==x&&(h.set(C,x),C.update())}function Wt(C,x){const z=C.colorSpace,W=C.format,Z=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||z!==Rr&&z!==Ji&&(Xe.getTransfer(z)===je?(W!==ri||Z!==jt)&&Le("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):We("WebGLTextures: Unsupported texture color space:",z)),x}function Je(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(l.width=C.naturalWidth||C.width,l.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(l.width=C.displayWidth,l.height=C.displayHeight):(l.width=C.width,l.height=C.height),l}this.allocateTextureUnit=N,this.resetTextureUnits=H,this.getTextureUnits=K,this.setTextureUnits=F,this.setTexture2D=Y,this.setTexture2DArray=j,this.setTexture3D=se,this.setTextureCube=ne,this.rebindTextures=$e,this.setupRenderTarget=Ke,this.updateRenderTargetMipmap=xt,this.updateMultisampleRenderTarget=Lt,this.setupDepthRenderbuffer=nt,this.setupFrameBufferTexture=Ie,this.useMultisampledRTT=vt,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function p0(r,e){function t(i,n=Ji){let s;const a=Xe.getTransfer(n);if(i===jt)return r.UNSIGNED_BYTE;if(i===Oo)return r.UNSIGNED_SHORT_4_4_4_4;if(i===ko)return r.UNSIGNED_SHORT_5_5_5_1;if(i===ch)return r.UNSIGNED_INT_5_9_9_9_REV;if(i===hh)return r.UNSIGNED_INT_10F_11F_11F_REV;if(i===oh)return r.BYTE;if(i===lh)return r.SHORT;if(i===Ss)return r.UNSIGNED_SHORT;if(i===Fo)return r.INT;if(i===Ei)return r.UNSIGNED_INT;if(i===ci)return r.FLOAT;if(i===Oi)return r.HALF_FLOAT;if(i===uh)return r.ALPHA;if(i===dh)return r.RGB;if(i===ri)return r.RGBA;if(i===ki)return r.DEPTH_COMPONENT;if(i===mn)return r.DEPTH_STENCIL;if(i===fh)return r.RED;if(i===Bo)return r.RED_INTEGER;if(i===_n)return r.RG;if(i===zo)return r.RG_INTEGER;if(i===Ho)return r.RGBA_INTEGER;if(i===yr||i===br||i===Mr||i===Sr)if(a===je)if(s=e.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(i===yr)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===br)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Mr)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Sr)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=e.get("WEBGL_compressed_texture_s3tc"),s!==null){if(i===yr)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===br)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Mr)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Sr)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Ja||i===ja||i===Qa||i===eo)if(s=e.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(i===Ja)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===ja)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Qa)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===eo)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===to||i===io||i===no||i===so||i===ro||i===Tr||i===ao)if(s=e.get("WEBGL_compressed_texture_etc"),s!==null){if(i===to||i===io)return a===je?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(i===no)return a===je?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC;if(i===so)return s.COMPRESSED_R11_EAC;if(i===ro)return s.COMPRESSED_SIGNED_R11_EAC;if(i===Tr)return s.COMPRESSED_RG11_EAC;if(i===ao)return s.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===oo||i===lo||i===co||i===ho||i===uo||i===fo||i===po||i===mo||i===go||i===_o||i===xo||i===vo||i===yo||i===bo)if(s=e.get("WEBGL_compressed_texture_astc"),s!==null){if(i===oo)return a===je?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===lo)return a===je?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===co)return a===je?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===ho)return a===je?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===uo)return a===je?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===fo)return a===je?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===po)return a===je?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===mo)return a===je?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===go)return a===je?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===_o)return a===je?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===xo)return a===je?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===vo)return a===je?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===yo)return a===je?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===bo)return a===je?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Mo||i===So||i===Eo)if(s=e.get("EXT_texture_compression_bptc"),s!==null){if(i===Mo)return a===je?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===So)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===Eo)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===To||i===wo||i===wr||i===Ao)if(s=e.get("EXT_texture_compression_rgtc"),s!==null){if(i===To)return s.COMPRESSED_RED_RGTC1_EXT;if(i===wo)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===wr)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===Ao)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===Es?r.UNSIGNED_INT_24_8:r[i]!==void 0?r[i]:null}return{convert:t}}const m0=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,g0=`
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

}`;class _0{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const i=new Th(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,i=new Ti({vertexShader:m0,fragmentShader:g0,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Vt(new Xr(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class x0 extends tn{constructor(e,t){super();const i=this;let n=null,s=1,a=null,o="local-floor",c=1,l=null,h=null,d=null,u=null,f=null,g=null;const v=typeof XRWebGLBinding<"u",m=new _0,p={},M=t.getContextAttributes();let T=null,y=null;const E=[],w=[],A=new De;let _=null;const S=new Ft;S.viewport=new it;const P=new Ft;P.viewport=new it;const R=[S,P],L=new wf;let H=null,K=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(k){let J=E[k];return J===void 0&&(J=new la,E[k]=J),J.getTargetRaySpace()},this.getControllerGrip=function(k){let J=E[k];return J===void 0&&(J=new la,E[k]=J),J.getGripSpace()},this.getHand=function(k){let J=E[k];return J===void 0&&(J=new la,E[k]=J),J.getHandSpace()};function F(k){const J=w.indexOf(k.inputSource);if(J===-1)return;const te=E[J];te!==void 0&&(te.update(k.inputSource,k.frame,l||a),te.dispatchEvent({type:k.type,data:k.inputSource}))}function N(){n.removeEventListener("select",F),n.removeEventListener("selectstart",F),n.removeEventListener("selectend",F),n.removeEventListener("squeeze",F),n.removeEventListener("squeezestart",F),n.removeEventListener("squeezeend",F),n.removeEventListener("end",N),n.removeEventListener("inputsourceschange",B);for(let k=0;k<E.length;k++){const J=w[k];J!==null&&(w[k]=null,E[k].disconnect(J))}H=null,K=null,m.reset();for(const k in p)delete p[k];e.setRenderTarget(T),f=null,u=null,d=null,n=null,y=null,oe.stop(),i.isPresenting=!1,e.setPixelRatio(_),e.setSize(A.width,A.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(k){s=k,i.isPresenting===!0&&Le("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(k){o=k,i.isPresenting===!0&&Le("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||a},this.setReferenceSpace=function(k){l=k},this.getBaseLayer=function(){return u!==null?u:f},this.getBinding=function(){return d===null&&v&&(d=new XRWebGLBinding(n,t)),d},this.getFrame=function(){return g},this.getSession=function(){return n},this.setSession=async function(k){if(n=k,n!==null){if(T=e.getRenderTarget(),n.addEventListener("select",F),n.addEventListener("selectstart",F),n.addEventListener("selectend",F),n.addEventListener("squeeze",F),n.addEventListener("squeezestart",F),n.addEventListener("squeezeend",F),n.addEventListener("end",N),n.addEventListener("inputsourceschange",B),M.xrCompatible!==!0&&await t.makeXRCompatible(),_=e.getPixelRatio(),e.getSize(A),v&&"createProjectionLayer"in XRWebGLBinding.prototype){let te=null,we=null,Fe=null;M.depth&&(Fe=M.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,te=M.stencil?mn:ki,we=M.stencil?Es:Ei);const Ie={colorFormat:t.RGBA8,depthFormat:Fe,scaleFactor:s};d=this.getBinding(),u=d.createProjectionLayer(Ie),n.updateRenderState({layers:[u]}),e.setPixelRatio(1),e.setSize(u.textureWidth,u.textureHeight,!1),y=new Si(u.textureWidth,u.textureHeight,{format:ri,type:jt,depthTexture:new $n(u.textureWidth,u.textureHeight,we,void 0,void 0,void 0,void 0,void 0,void 0,te),stencilBuffer:M.stencil,colorSpace:e.outputColorSpace,samples:M.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1})}else{const te={antialias:M.antialias,alpha:!0,depth:M.depth,stencil:M.stencil,framebufferScaleFactor:s};f=new XRWebGLLayer(n,t,te),n.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),y=new Si(f.framebufferWidth,f.framebufferHeight,{format:ri,type:jt,colorSpace:e.outputColorSpace,stencilBuffer:M.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(c),l=null,a=await n.requestReferenceSpace(o),oe.setContext(n),oe.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(n!==null)return n.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function B(k){for(let J=0;J<k.removed.length;J++){const te=k.removed[J],we=w.indexOf(te);we>=0&&(w[we]=null,E[we].disconnect(te))}for(let J=0;J<k.added.length;J++){const te=k.added[J];let we=w.indexOf(te);if(we===-1){for(let Ie=0;Ie<E.length;Ie++)if(Ie>=w.length){w.push(te),we=Ie;break}else if(w[Ie]===null){w[Ie]=te,we=Ie;break}if(we===-1)break}const Fe=E[we];Fe&&Fe.connect(te)}}const Y=new D,j=new D;function se(k,J,te){Y.setFromMatrixPosition(J.matrixWorld),j.setFromMatrixPosition(te.matrixWorld);const we=Y.distanceTo(j),Fe=J.projectionMatrix.elements,Ie=te.projectionMatrix.elements,pt=Fe[14]/(Fe[10]-1),Ye=Fe[14]/(Fe[10]+1),nt=(Fe[9]+1)/Fe[5],$e=(Fe[9]-1)/Fe[5],Ke=(Fe[8]-1)/Fe[0],xt=(Ie[8]+1)/Ie[0],bt=pt*Ke,At=pt*xt,Lt=we/(-Ke+xt),ht=Lt*-Ke;if(J.matrixWorld.decompose(k.position,k.quaternion,k.scale),k.translateX(ht),k.translateZ(Lt),k.matrixWorld.compose(k.position,k.quaternion,k.scale),k.matrixWorldInverse.copy(k.matrixWorld).invert(),Fe[10]===-1)k.projectionMatrix.copy(J.projectionMatrix),k.projectionMatrixInverse.copy(J.projectionMatrixInverse);else{const vt=pt+Lt,U=Ye+Lt,Wt=bt-ht,Je=At+(we-ht),C=nt*Ye/U*vt,x=$e*Ye/U*vt;k.projectionMatrix.makePerspective(Wt,Je,C,x,vt,U),k.projectionMatrixInverse.copy(k.projectionMatrix).invert()}}function ne(k,J){J===null?k.matrixWorld.copy(k.matrix):k.matrixWorld.multiplyMatrices(J.matrixWorld,k.matrix),k.matrixWorldInverse.copy(k.matrixWorld).invert()}this.updateCamera=function(k){if(n===null)return;let J=k.near,te=k.far;m.texture!==null&&(m.depthNear>0&&(J=m.depthNear),m.depthFar>0&&(te=m.depthFar)),L.near=P.near=S.near=J,L.far=P.far=S.far=te,(H!==L.near||K!==L.far)&&(n.updateRenderState({depthNear:L.near,depthFar:L.far}),H=L.near,K=L.far),L.layers.mask=k.layers.mask|6,S.layers.mask=L.layers.mask&-5,P.layers.mask=L.layers.mask&-3;const we=k.parent,Fe=L.cameras;ne(L,we);for(let Ie=0;Ie<Fe.length;Ie++)ne(Fe[Ie],we);Fe.length===2?se(L,S,P):L.projectionMatrix.copy(S.projectionMatrix),re(k,L,we)};function re(k,J,te){te===null?k.matrix.copy(J.matrixWorld):(k.matrix.copy(te.matrixWorld),k.matrix.invert(),k.matrix.multiply(J.matrixWorld)),k.matrix.decompose(k.position,k.quaternion,k.scale),k.updateMatrixWorld(!0),k.projectionMatrix.copy(J.projectionMatrix),k.projectionMatrixInverse.copy(J.projectionMatrixInverse),k.isPerspectiveCamera&&(k.fov=Zn*2*Math.atan(1/k.projectionMatrix.elements[5]),k.zoom=1)}this.getCamera=function(){return L},this.getFoveation=function(){if(!(u===null&&f===null))return c},this.setFoveation=function(k){c=k,u!==null&&(u.fixedFoveation=k),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=k)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(L)},this.getCameraTexture=function(k){return p[k]};let xe=null;function ve(k,J){if(h=J.getViewerPose(l||a),g=J,h!==null){const te=h.views;f!==null&&(e.setRenderTargetFramebuffer(y,f.framebuffer),e.setRenderTarget(y));let we=!1;te.length!==L.cameras.length&&(L.cameras.length=0,we=!0);for(let Ye=0;Ye<te.length;Ye++){const nt=te[Ye];let $e=null;if(f!==null)$e=f.getViewport(nt);else{const xt=d.getViewSubImage(u,nt);$e=xt.viewport,Ye===0&&(e.setRenderTargetTextures(y,xt.colorTexture,xt.depthStencilTexture),e.setRenderTarget(y))}let Ke=R[Ye];Ke===void 0&&(Ke=new Ft,Ke.layers.enable(Ye),Ke.viewport=new it,R[Ye]=Ke),Ke.matrix.fromArray(nt.transform.matrix),Ke.matrix.decompose(Ke.position,Ke.quaternion,Ke.scale),Ke.projectionMatrix.fromArray(nt.projectionMatrix),Ke.projectionMatrixInverse.copy(Ke.projectionMatrix).invert(),Ke.viewport.set($e.x,$e.y,$e.width,$e.height),Ye===0&&(L.matrix.copy(Ke.matrix),L.matrix.decompose(L.position,L.quaternion,L.scale)),we===!0&&L.cameras.push(Ke)}const Fe=n.enabledFeatures;if(Fe&&Fe.includes("depth-sensing")&&n.depthUsage=="gpu-optimized"&&v){d=i.getBinding();const Ye=d.getDepthInformation(te[0]);Ye&&Ye.isValid&&Ye.texture&&m.init(Ye,n.renderState)}if(Fe&&Fe.includes("camera-access")&&v){e.state.unbindTexture(),d=i.getBinding();for(let Ye=0;Ye<te.length;Ye++){const nt=te[Ye].camera;if(nt){let $e=p[nt];$e||($e=new Th,p[nt]=$e);const Ke=d.getCameraImage(nt);$e.sourceTexture=Ke}}}}for(let te=0;te<E.length;te++){const we=w[te],Fe=E[te];we!==null&&Fe!==void 0&&Fe.update(we,J,l||a)}xe&&xe(k,J),J.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:J}),g=null}const oe=new Oh;oe.setAnimationLoop(ve),this.setAnimationLoop=function(k){xe=k},this.dispose=function(){}}}const v0=new Oe,Wh=new ke;Wh.set(-1,0,0,0,1,0,0,0,1);function y0(r,e){function t(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function i(m,p){p.color.getRGB(m.fogColor.value,Ph(r)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function n(m,p,M,T,y){p.isNodeMaterial?p.uniformsNeedUpdate=!1:p.isMeshBasicMaterial?s(m,p):p.isMeshLambertMaterial?(s(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshToonMaterial?(s(m,p),d(m,p)):p.isMeshPhongMaterial?(s(m,p),h(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshStandardMaterial?(s(m,p),u(m,p),p.isMeshPhysicalMaterial&&f(m,p,y)):p.isMeshMatcapMaterial?(s(m,p),g(m,p)):p.isMeshDepthMaterial?s(m,p):p.isMeshDistanceMaterial?(s(m,p),v(m,p)):p.isMeshNormalMaterial?s(m,p):p.isLineBasicMaterial?(a(m,p),p.isLineDashedMaterial&&o(m,p)):p.isPointsMaterial?c(m,p,M,T):p.isSpriteMaterial?l(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function s(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,t(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===qt&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,t(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===qt&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,t(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,t(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);const M=e.get(p),T=M.envMap,y=M.envMapRotation;T&&(m.envMap.value=T,m.envMapRotation.value.setFromMatrix4(v0.makeRotationFromEuler(y)).transpose(),T.isCubeTexture&&T.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(Wh),m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,m.aoMapTransform))}function a(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform))}function o(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function c(m,p,M,T){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*M,m.scale.value=T*.5,p.map&&(m.map.value=p.map,t(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function l(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function h(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function d(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function u(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function f(m,p,M){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===qt&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=M.texture,m.transmissionSamplerSize.value.set(M.width,M.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function v(m,p){const M=e.get(p).light;m.referencePosition.value.setFromMatrixPosition(M.matrixWorld),m.nearDistance.value=M.shadow.camera.near,m.farDistance.value=M.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:n}}function b0(r,e,t,i){let n={},s={},a=[];const o=r.getParameter(r.MAX_UNIFORM_BUFFER_BINDINGS);function c(y,E){const w=E.program;i.uniformBlockBinding(y,w)}function l(y,E){let w=n[y.id];w===void 0&&(m(y),w=h(y),n[y.id]=w,y.addEventListener("dispose",M));const A=E.program;i.updateUBOMapping(y,A);const _=e.render.frame;s[y.id]!==_&&(u(y),s[y.id]=_)}function h(y){const E=d();y.__bindingPointIndex=E;const w=r.createBuffer(),A=y.__size,_=y.usage;return r.bindBuffer(r.UNIFORM_BUFFER,w),r.bufferData(r.UNIFORM_BUFFER,A,_),r.bindBuffer(r.UNIFORM_BUFFER,null),r.bindBufferBase(r.UNIFORM_BUFFER,E,w),w}function d(){for(let y=0;y<o;y++)if(a.indexOf(y)===-1)return a.push(y),y;return We("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(y){const E=n[y.id],w=y.uniforms,A=y.__cache;r.bindBuffer(r.UNIFORM_BUFFER,E);for(let _=0,S=w.length;_<S;_++){const P=w[_];if(Array.isArray(P))for(let R=0,L=P.length;R<L;R++)f(P[R],_,R,A);else f(P,_,0,A)}r.bindBuffer(r.UNIFORM_BUFFER,null)}function f(y,E,w,A){if(v(y,E,w,A)===!0){const _=y.__offset,S=y.value;if(Array.isArray(S)){let P=0;for(let R=0;R<S.length;R++){const L=S[R],H=p(L);g(L,y.__data,P),typeof L!="number"&&typeof L!="boolean"&&!L.isMatrix3&&!ArrayBuffer.isView(L)&&(P+=H.storage/Float32Array.BYTES_PER_ELEMENT)}}else g(S,y.__data,0);r.bufferSubData(r.UNIFORM_BUFFER,_,y.__data)}}function g(y,E,w){typeof y=="number"||typeof y=="boolean"?E[0]=y:y.isMatrix3?(E[0]=y.elements[0],E[1]=y.elements[1],E[2]=y.elements[2],E[3]=0,E[4]=y.elements[3],E[5]=y.elements[4],E[6]=y.elements[5],E[7]=0,E[8]=y.elements[6],E[9]=y.elements[7],E[10]=y.elements[8],E[11]=0):ArrayBuffer.isView(y)?E.set(new y.constructor(y.buffer,y.byteOffset,E.length)):y.toArray(E,w)}function v(y,E,w,A){const _=y.value,S=E+"_"+w;if(A[S]===void 0)return typeof _=="number"||typeof _=="boolean"?A[S]=_:ArrayBuffer.isView(_)?A[S]=_.slice():A[S]=_.clone(),!0;{const P=A[S];if(typeof _=="number"||typeof _=="boolean"){if(P!==_)return A[S]=_,!0}else{if(ArrayBuffer.isView(_))return!0;if(P.equals(_)===!1)return P.copy(_),!0}}return!1}function m(y){const E=y.uniforms;let w=0;const A=16;for(let S=0,P=E.length;S<P;S++){const R=Array.isArray(E[S])?E[S]:[E[S]];for(let L=0,H=R.length;L<H;L++){const K=R[L],F=Array.isArray(K.value)?K.value:[K.value];for(let N=0,B=F.length;N<B;N++){const Y=F[N],j=p(Y),se=w%A,ne=se%j.boundary,re=se+ne;w+=ne,re!==0&&A-re<j.storage&&(w+=A-re),K.__data=new Float32Array(j.storage/Float32Array.BYTES_PER_ELEMENT),K.__offset=w,w+=j.storage}}}const _=w%A;return _>0&&(w+=A-_),y.__size=w,y.__cache={},this}function p(y){const E={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(E.boundary=4,E.storage=4):y.isVector2?(E.boundary=8,E.storage=8):y.isVector3||y.isColor?(E.boundary=16,E.storage=12):y.isVector4?(E.boundary=16,E.storage=16):y.isMatrix3?(E.boundary=48,E.storage=48):y.isMatrix4?(E.boundary=64,E.storage=64):y.isTexture?Le("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(y)?(E.boundary=16,E.storage=y.byteLength):Le("WebGLRenderer: Unsupported uniform value type.",y),E}function M(y){const E=y.target;E.removeEventListener("dispose",M);const w=a.indexOf(E.__bindingPointIndex);a.splice(w,1),r.deleteBuffer(n[E.id]),delete n[E.id],delete s[E.id]}function T(){for(const y in n)r.deleteBuffer(n[y]);a=[],n={},s={}}return{bind:c,update:l,dispose:T}}const M0=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let _i=null;function S0(){return _i===null&&(_i=new Lr(M0,16,16,_n,Oi),_i.name="DFG_LUT",_i.minFilter=St,_i.magFilter=St,_i.wrapS=Qt,_i.wrapT=Qt,_i.generateMipmaps=!1,_i.needsUpdate=!0),_i}class E0{constructor(e={}){const{canvas:t=Gu(),context:i=null,depth:n=!0,stencil:s=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:u=!1,outputBufferType:f=jt}=e;this.isWebGLRenderer=!0;let g;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=i.getContextAttributes().alpha}else g=a;const v=f,m=new Set([Ho,zo,Bo]),p=new Set([jt,Ei,Ss,Es,Oo,ko]),M=new Uint32Array(4),T=new Int32Array(4),y=new D;let E=null,w=null;const A=[],_=[];let S=null;this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Mi,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const P=this;let R=!1,L=null,H=null,K=null,F=null;this._outputColorSpace=lt;let N=0,B=0,Y=null,j=-1,se=null;const ne=new it,re=new it;let xe=null;const ve=new Be(0);let oe=0,k=t.width,J=t.height,te=1,we=null,Fe=null;const Ie=new it(0,0,k,J),pt=new it(0,0,k,J);let Ye=!1;const nt=new Yo;let $e=!1,Ke=!1;const xt=new Oe,bt=new D,At=new it,Lt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let ht=!1;function vt(){return Y===null?te:1}let U=i;function Wt(b,O){return t.getContext(b,O)}try{const b={alpha:!0,depth:n,stencil:s,antialias:o,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:h,failIfMajorPerformanceCaveat:d};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${Uo}`),t.addEventListener("webglcontextlost",ut,!1),t.addEventListener("webglcontextrestored",at,!1),t.addEventListener("webglcontextcreationerror",fi,!1),U===null){const O="webgl2";if(U=Wt(O,b),U===null)throw Wt(O)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}}catch(b){throw We("WebGLRenderer: "+b.message),b}let Je,C,x,z,W,Z,ae,ce,$,ee,he,Ae,fe,ue,Ne,Ue,ze,I,le,Q,de,_e,ie;function Te(){Je=new Sg(U),Je.init(),de=new p0(U,Je),C=new mg(U,Je,e,de),x=new d0(U,Je),C.reversedDepthBuffer&&u&&x.buffers.depth.setReversed(!0),H=U.createFramebuffer(),K=U.createFramebuffer(),F=U.createFramebuffer(),z=new wg(U),W=new j_,Z=new f0(U,Je,x,W,C,de,z),ae=new Mg(P),ce=new Pf(U),_e=new fg(U,ce),$=new Eg(U,ce,z,_e),ee=new Rg(U,$,ce,_e,z),I=new Ag(U,C,Z),Ne=new gg(W),he=new J_(P,ae,Je,C,_e,Ne),Ae=new y0(P,W),fe=new e0,ue=new a0(Je),ze=new dg(P,ae,x,ee,g,c),Ue=new u0(P,ee,C),ie=new b0(U,z,C,x),le=new pg(U,Je,z),Q=new Tg(U,Je,z),z.programs=he.programs,P.capabilities=C,P.extensions=Je,P.properties=W,P.renderLists=fe,P.shadowMap=Ue,P.state=x,P.info=z}Te(),v!==jt&&(S=new Pg(v,t.width,t.height,o,n,s));const Me=new x0(P,U);this.xr=Me,this.getContext=function(){return U},this.getContextAttributes=function(){return U.getContextAttributes()},this.forceContextLoss=function(){const b=Je.get("WEBGL_lose_context");b&&b.loseContext()},this.forceContextRestore=function(){const b=Je.get("WEBGL_lose_context");b&&b.restoreContext()},this.getPixelRatio=function(){return te},this.setPixelRatio=function(b){b!==void 0&&(te=b,this.setSize(k,J,!1))},this.getSize=function(b){return b.set(k,J)},this.setSize=function(b,O,q=!0){if(Me.isPresenting){Le("WebGLRenderer: Can't change size while VR device is presenting.");return}k=b,J=O,t.width=Math.floor(b*te),t.height=Math.floor(O*te),q===!0&&(t.style.width=b+"px",t.style.height=O+"px"),S!==null&&S.setSize(t.width,t.height),this.setViewport(0,0,b,O)},this.getDrawingBufferSize=function(b){return b.set(k*te,J*te).floor()},this.setDrawingBufferSize=function(b,O,q){k=b,J=O,te=q,t.width=Math.floor(b*q),t.height=Math.floor(O*q),this.setViewport(0,0,b,O)},this.setEffects=function(b){if(v===jt){We("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(b){for(let O=0;O<b.length;O++)if(b[O].isOutputPass===!0){Le("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}S.setEffects(b||[])},this.getCurrentViewport=function(b){return b.copy(ne)},this.getViewport=function(b){return b.copy(Ie)},this.setViewport=function(b,O,q,G){b.isVector4?Ie.set(b.x,b.y,b.z,b.w):Ie.set(b,O,q,G),x.viewport(ne.copy(Ie).multiplyScalar(te).round())},this.getScissor=function(b){return b.copy(pt)},this.setScissor=function(b,O,q,G){b.isVector4?pt.set(b.x,b.y,b.z,b.w):pt.set(b,O,q,G),x.scissor(re.copy(pt).multiplyScalar(te).round())},this.getScissorTest=function(){return Ye},this.setScissorTest=function(b){x.setScissorTest(Ye=b)},this.setOpaqueSort=function(b){we=b},this.setTransparentSort=function(b){Fe=b},this.getClearColor=function(b){return b.copy(ze.getClearColor())},this.setClearColor=function(){ze.setClearColor(...arguments)},this.getClearAlpha=function(){return ze.getClearAlpha()},this.setClearAlpha=function(){ze.setClearAlpha(...arguments)},this.clear=function(b=!0,O=!0,q=!0){let G=0;if(b){let V=!1;if(Y!==null){const ge=Y.texture.format;V=m.has(ge)}if(V){const ge=Y.texture.type,be=p.has(ge),me=ze.getClearColor(),Se=ze.getClearAlpha(),Re=me.r,He=me.g,Ve=me.b;be?(M[0]=Re,M[1]=He,M[2]=Ve,M[3]=Se,U.clearBufferuiv(U.COLOR,0,M)):(T[0]=Re,T[1]=He,T[2]=Ve,T[3]=Se,U.clearBufferiv(U.COLOR,0,T))}else G|=U.COLOR_BUFFER_BIT}O&&(G|=U.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),q&&(G|=U.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),G!==0&&U.clear(G)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(b){b.setRenderer(this),L=b},this.dispose=function(){t.removeEventListener("webglcontextlost",ut,!1),t.removeEventListener("webglcontextrestored",at,!1),t.removeEventListener("webglcontextcreationerror",fi,!1),ze.dispose(),fe.dispose(),ue.dispose(),W.dispose(),ae.dispose(),ee.dispose(),_e.dispose(),ie.dispose(),he.dispose(),Me.dispose(),Me.removeEventListener("sessionstart",hl),Me.removeEventListener("sessionend",ul),rn.stop()};function ut(b){b.preventDefault(),Pl("WebGLRenderer: Context Lost."),R=!0}function at(){Pl("WebGLRenderer: Context Restored."),R=!1;const b=z.autoReset,O=Ue.enabled,q=Ue.autoUpdate,G=Ue.needsUpdate,V=Ue.type;Te(),z.autoReset=b,Ue.enabled=O,Ue.autoUpdate=q,Ue.needsUpdate=G,Ue.type=V}function fi(b){We("WebGLRenderer: A WebGL context could not be created. Reason: ",b.statusMessage)}function pi(b){const O=b.target;O.removeEventListener("dispose",pi),Qh(O)}function Qh(b){eu(b),W.remove(b)}function eu(b){const O=W.get(b).programs;O!==void 0&&(O.forEach(function(q){he.releaseProgram(q)}),b.isShaderMaterial&&he.releaseShaderCache(b))}this.renderBufferDirect=function(b,O,q,G,V,ge){O===null&&(O=Lt);const be=V.isMesh&&V.matrixWorld.determinantAffine()<0,me=nu(b,O,q,G,V);x.setMaterial(G,be);let Se=q.index,Re=1;if(G.wireframe===!0){if(Se=$.getWireframeAttribute(q),Se===void 0)return;Re=2}const He=q.drawRange,Ve=q.attributes.position;let Pe=He.start*Re,Qe=(He.start+He.count)*Re;ge!==null&&(Pe=Math.max(Pe,ge.start*Re),Qe=Math.min(Qe,(ge.start+ge.count)*Re)),Se!==null?(Pe=Math.max(Pe,0),Qe=Math.min(Qe,Se.count)):Ve!=null&&(Pe=Math.max(Pe,0),Qe=Math.min(Qe,Ve.count));const mt=Qe-Pe;if(mt<0||mt===1/0)return;_e.setup(V,G,me,q,Se);let dt,st=le;if(Se!==null&&(dt=ce.get(Se),st=Q,st.setIndex(dt)),V.isMesh)G.wireframe===!0?(x.setLineWidth(G.wireframeLinewidth*vt()),st.setMode(U.LINES)):st.setMode(U.TRIANGLES);else if(V.isLine){let Dt=G.linewidth;Dt===void 0&&(Dt=1),x.setLineWidth(Dt*vt()),V.isLineSegments?st.setMode(U.LINES):V.isLineLoop?st.setMode(U.LINE_LOOP):st.setMode(U.LINE_STRIP)}else V.isPoints?st.setMode(U.POINTS):V.isSprite&&st.setMode(U.TRIANGLES);if(V.isBatchedMesh)if(Je.get("WEBGL_multi_draw"))st.renderMultiDraw(V._multiDrawStarts,V._multiDrawCounts,V._multiDrawCount);else{const Dt=V._multiDrawStarts,ye=V._multiDrawCounts,Yt=V._multiDrawCount,Ze=Se?ce.get(Se).bytesPerElement:1,ti=W.get(G).currentProgram.getUniforms();for(let mi=0;mi<Yt;mi++)ti.setValue(U,"_gl_DrawID",mi),st.render(Dt[mi]/Ze,ye[mi])}else if(V.isInstancedMesh)st.renderInstances(Pe,mt,V.count);else if(q.isInstancedBufferGeometry){const Dt=q._maxInstanceCount!==void 0?q._maxInstanceCount:1/0,ye=Math.min(q.instanceCount,Dt);st.renderInstances(Pe,mt,ye)}else st.render(Pe,mt)};function cl(b,O,q){b.transparent===!0&&b.side===yi&&b.forceSinglePass===!1?(b.side=qt,b.needsUpdate=!0,Us(b,O,q),b.side=Fi,b.needsUpdate=!0,Us(b,O,q),b.side=yi):Us(b,O,q)}this.compile=function(b,O,q=null){q===null&&(q=b),w=ue.get(q),w.init(O),_.push(w),q.traverseVisible(function(V){V.isLight&&V.layers.test(O.layers)&&(w.pushLight(V),V.castShadow&&w.pushShadow(V))}),b!==q&&b.traverseVisible(function(V){V.isLight&&V.layers.test(O.layers)&&(w.pushLight(V),V.castShadow&&w.pushShadow(V))}),w.setupLights();const G=new Set;return b.traverse(function(V){if(!(V.isMesh||V.isPoints||V.isLine||V.isSprite))return;const ge=V.material;if(ge)if(Array.isArray(ge))for(let be=0;be<ge.length;be++){const me=ge[be];cl(me,q,V),G.add(me)}else cl(ge,q,V),G.add(ge)}),w=_.pop(),G},this.compileAsync=function(b,O,q=null){const G=this.compile(b,O,q);return new Promise(V=>{function ge(){if(G.forEach(function(be){W.get(be).currentProgram.isReady()&&G.delete(be)}),G.size===0){V(b);return}setTimeout(ge,10)}Je.get("KHR_parallel_shader_compile")!==null?ge():setTimeout(ge,10)})};let Jr=null;function tu(b){Jr&&Jr(b)}function hl(){rn.stop()}function ul(){rn.start()}const rn=new Oh;rn.setAnimationLoop(tu),typeof self<"u"&&rn.setContext(self),this.setAnimationLoop=function(b){Jr=b,Me.setAnimationLoop(b),b===null?rn.stop():rn.start()},Me.addEventListener("sessionstart",hl),Me.addEventListener("sessionend",ul),this.render=function(b,O){if(O!==void 0&&O.isCamera!==!0){We("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(R===!0)return;L!==null&&L.renderStart(b,O);const q=Me.enabled===!0&&Me.isPresenting===!0,G=S!==null&&(Y===null||q)&&S.begin(P,Y);if(b.matrixWorldAutoUpdate===!0&&b.updateMatrixWorld(),O.parent===null&&O.matrixWorldAutoUpdate===!0&&O.updateMatrixWorld(),Me.enabled===!0&&Me.isPresenting===!0&&(S===null||S.isCompositing()===!1)&&(Me.cameraAutoUpdate===!0&&Me.updateCamera(O),O=Me.getCamera()),b.isScene===!0&&b.onBeforeRender(P,b,O,Y),w=ue.get(b,_.length),w.init(O),w.state.textureUnits=Z.getTextureUnits(),_.push(w),xt.multiplyMatrices(O.projectionMatrix,O.matrixWorldInverse),nt.setFromProjectionMatrix(xt,bi,O.reversedDepth),Ke=this.localClippingEnabled,$e=Ne.init(this.clippingPlanes,Ke),E=fe.get(b,A.length),E.init(),A.push(E),Me.enabled===!0&&Me.isPresenting===!0){const be=P.xr.getDepthSensingMesh();be!==null&&jr(be,O,-1/0,P.sortObjects)}jr(b,O,0,P.sortObjects),E.finish(),P.sortObjects===!0&&E.sort(we,Fe,O.reversedDepth),ht=Me.enabled===!1||Me.isPresenting===!1||Me.hasDepthSensing()===!1,ht&&ze.addToRenderList(E,b),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),$e===!0&&Ne.beginShadows();const V=w.state.shadowsArray;if(Ue.render(V,b,O),$e===!0&&Ne.endShadows(),(G&&S.hasRenderPass())===!1){const be=E.opaque,me=E.transmissive;if(w.setupLights(),O.isArrayCamera){const Se=O.cameras;if(me.length>0)for(let Re=0,He=Se.length;Re<He;Re++){const Ve=Se[Re];fl(be,me,b,Ve)}ht&&ze.render(b);for(let Re=0,He=Se.length;Re<He;Re++){const Ve=Se[Re];dl(E,b,Ve,Ve.viewport)}}else me.length>0&&fl(be,me,b,O),ht&&ze.render(b),dl(E,b,O)}Y!==null&&B===0&&(Z.updateMultisampleRenderTarget(Y),Z.updateRenderTargetMipmap(Y)),G&&S.end(P),b.isScene===!0&&b.onAfterRender(P,b,O),_e.resetDefaultState(),j=-1,se=null,_.pop(),_.length>0?(w=_[_.length-1],Z.setTextureUnits(w.state.textureUnits),$e===!0&&Ne.setGlobalState(P.clippingPlanes,w.state.camera)):w=null,A.pop(),A.length>0?E=A[A.length-1]:E=null,L!==null&&L.renderEnd()};function jr(b,O,q,G){if(b.visible===!1)return;if(b.layers.test(O.layers)){if(b.isGroup)q=b.renderOrder;else if(b.isLOD)b.autoUpdate===!0&&b.update(O);else if(b.isLightProbeGrid)w.pushLightProbeGrid(b);else if(b.isLight)w.pushLight(b),b.castShadow&&w.pushShadow(b);else if(b.isSprite){if(!b.frustumCulled||nt.intersectsSprite(b)){G&&At.setFromMatrixPosition(b.matrixWorld).applyMatrix4(xt);const be=ee.update(b),me=b.material;me.visible&&E.push(b,be,me,q,At.z,null)}}else if((b.isMesh||b.isLine||b.isPoints)&&(!b.frustumCulled||nt.intersectsObject(b))){const be=ee.update(b),me=b.material;if(G&&(b.boundingSphere!==void 0?(b.boundingSphere===null&&b.computeBoundingSphere(),At.copy(b.boundingSphere.center)):(be.boundingSphere===null&&be.computeBoundingSphere(),At.copy(be.boundingSphere.center)),At.applyMatrix4(b.matrixWorld).applyMatrix4(xt)),Array.isArray(me)){const Se=be.groups;for(let Re=0,He=Se.length;Re<He;Re++){const Ve=Se[Re],Pe=me[Ve.materialIndex];Pe&&Pe.visible&&E.push(b,be,Pe,q,At.z,Ve)}}else me.visible&&E.push(b,be,me,q,At.z,null)}}const ge=b.children;for(let be=0,me=ge.length;be<me;be++)jr(ge[be],O,q,G)}function dl(b,O,q,G){const{opaque:V,transmissive:ge,transparent:be}=b;w.setupLightsView(q),$e===!0&&Ne.setGlobalState(P.clippingPlanes,q),G&&x.viewport(ne.copy(G)),V.length>0&&Is(V,O,q),ge.length>0&&Is(ge,O,q),be.length>0&&Is(be,O,q),x.buffers.depth.setTest(!0),x.buffers.depth.setMask(!0),x.buffers.color.setMask(!0),x.setPolygonOffset(!1)}function fl(b,O,q,G){if((q.isScene===!0?q.overrideMaterial:null)!==null)return;if(w.state.transmissionRenderTarget[G.id]===void 0){const Pe=Je.has("EXT_color_buffer_half_float")||Je.has("EXT_color_buffer_float");w.state.transmissionRenderTarget[G.id]=new Si(1,1,{generateMipmaps:!0,type:Pe?Oi:jt,minFilter:Di,samples:Math.max(4,C.samples),stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Xe.workingColorSpace})}const ge=w.state.transmissionRenderTarget[G.id],be=G.viewport||ne;ge.setSize(be.z*P.transmissionResolutionScale,be.w*P.transmissionResolutionScale);const me=P.getRenderTarget(),Se=P.getActiveCubeFace(),Re=P.getActiveMipmapLevel();P.setRenderTarget(ge),P.getClearColor(ve),oe=P.getClearAlpha(),oe<1&&P.setClearColor(16777215,.5),P.clear(),ht&&ze.render(q);const He=P.toneMapping;P.toneMapping=Mi;const Ve=G.viewport;if(G.viewport!==void 0&&(G.viewport=void 0),w.setupLightsView(G),$e===!0&&Ne.setGlobalState(P.clippingPlanes,G),Is(b,q,G),Z.updateMultisampleRenderTarget(ge),Z.updateRenderTargetMipmap(ge),Je.has("WEBGL_multisampled_render_to_texture")===!1){let Pe=!1;for(let Qe=0,mt=O.length;Qe<mt;Qe++){const dt=O[Qe],{object:st,geometry:Dt,material:ye,group:Yt}=dt;if(ye.side===yi&&st.layers.test(G.layers)){const Ze=ye.side;ye.side=qt,ye.needsUpdate=!0,pl(st,q,G,Dt,ye,Yt),ye.side=Ze,ye.needsUpdate=!0,Pe=!0}}Pe===!0&&(Z.updateMultisampleRenderTarget(ge),Z.updateRenderTargetMipmap(ge))}P.setRenderTarget(me,Se,Re),P.setClearColor(ve,oe),Ve!==void 0&&(G.viewport=Ve),P.toneMapping=He}function Is(b,O,q){const G=O.isScene===!0?O.overrideMaterial:null;for(let V=0,ge=b.length;V<ge;V++){const be=b[V],{object:me,geometry:Se,group:Re}=be;let He=be.material;He.allowOverride===!0&&G!==null&&(He=G),me.layers.test(q.layers)&&pl(me,O,q,Se,He,Re)}}function pl(b,O,q,G,V,ge){b.onBeforeRender(P,O,q,G,V,ge),b.modelViewMatrix.multiplyMatrices(q.matrixWorldInverse,b.matrixWorld),b.normalMatrix.getNormalMatrix(b.modelViewMatrix),V.onBeforeRender(P,O,q,G,b,ge),V.transparent===!0&&V.side===yi&&V.forceSinglePass===!1?(V.side=qt,V.needsUpdate=!0,P.renderBufferDirect(q,O,G,V,b,ge),V.side=Fi,V.needsUpdate=!0,P.renderBufferDirect(q,O,G,V,b,ge),V.side=yi):P.renderBufferDirect(q,O,G,V,b,ge),b.onAfterRender(P,O,q,G,V,ge)}function Us(b,O,q){O.isScene!==!0&&(O=Lt);const G=W.get(b),V=w.state.lights,ge=w.state.shadowsArray,be=V.state.version,me=he.getParameters(b,V.state,ge,O,q,w.state.lightProbeGridArray),Se=he.getProgramCacheKey(me);let Re=G.programs;G.environment=b.isMeshStandardMaterial||b.isMeshLambertMaterial||b.isMeshPhongMaterial?O.environment:null,G.fog=O.fog;const He=b.isMeshStandardMaterial||b.isMeshLambertMaterial&&!b.envMap||b.isMeshPhongMaterial&&!b.envMap;G.envMap=ae.get(b.envMap||G.environment,He),G.envMapRotation=G.environment!==null&&b.envMap===null?O.environmentRotation:b.envMapRotation,Re===void 0&&(b.addEventListener("dispose",pi),Re=new Map,G.programs=Re);let Ve=Re.get(Se);if(Ve!==void 0){if(G.currentProgram===Ve&&G.lightsStateVersion===be)return gl(b,me),Ve}else me.uniforms=he.getUniforms(b),L!==null&&b.isNodeMaterial&&L.build(b,q,me),b.onBeforeCompile(me,P),Ve=he.acquireProgram(me,Se),Re.set(Se,Ve),G.uniforms=me.uniforms;const Pe=G.uniforms;return(!b.isShaderMaterial&&!b.isRawShaderMaterial||b.clipping===!0)&&(Pe.clippingPlanes=Ne.uniform),gl(b,me),G.needsLights=ru(b),G.lightsStateVersion=be,G.needsLights&&(Pe.ambientLightColor.value=V.state.ambient,Pe.lightProbe.value=V.state.probe,Pe.directionalLights.value=V.state.directional,Pe.directionalLightShadows.value=V.state.directionalShadow,Pe.spotLights.value=V.state.spot,Pe.spotLightShadows.value=V.state.spotShadow,Pe.rectAreaLights.value=V.state.rectArea,Pe.ltc_1.value=V.state.rectAreaLTC1,Pe.ltc_2.value=V.state.rectAreaLTC2,Pe.pointLights.value=V.state.point,Pe.pointLightShadows.value=V.state.pointShadow,Pe.hemisphereLights.value=V.state.hemi,Pe.directionalShadowMatrix.value=V.state.directionalShadowMatrix,Pe.spotLightMatrix.value=V.state.spotLightMatrix,Pe.spotLightMap.value=V.state.spotLightMap,Pe.pointShadowMatrix.value=V.state.pointShadowMatrix),G.lightProbeGrid=w.state.lightProbeGridArray.length>0,G.currentProgram=Ve,G.uniformsList=null,Ve}function ml(b){if(b.uniformsList===null){const O=b.currentProgram.getUniforms();b.uniformsList=Er.seqWithValue(O.seq,b.uniforms)}return b.uniformsList}function gl(b,O){const q=W.get(b);q.outputColorSpace=O.outputColorSpace,q.batching=O.batching,q.batchingColor=O.batchingColor,q.instancing=O.instancing,q.instancingColor=O.instancingColor,q.instancingMorph=O.instancingMorph,q.skinning=O.skinning,q.morphTargets=O.morphTargets,q.morphNormals=O.morphNormals,q.morphColors=O.morphColors,q.morphTargetsCount=O.morphTargetsCount,q.numClippingPlanes=O.numClippingPlanes,q.numIntersection=O.numClipIntersection,q.vertexAlphas=O.vertexAlphas,q.vertexTangents=O.vertexTangents,q.toneMapping=O.toneMapping}function iu(b,O){if(b.length===0)return null;if(b.length===1)return b[0].texture!==null?b[0]:null;y.setFromMatrixPosition(O.matrixWorld);for(let q=0,G=b.length;q<G;q++){const V=b[q];if(V.texture!==null&&V.boundingBox.containsPoint(y))return V}return null}function nu(b,O,q,G,V){O.isScene!==!0&&(O=Lt),Z.resetTextureUnits();const ge=O.fog,be=G.isMeshStandardMaterial||G.isMeshLambertMaterial||G.isMeshPhongMaterial?O.environment:null,me=Y===null?P.outputColorSpace:Y.isXRRenderTarget===!0?Y.texture.colorSpace:Xe.workingColorSpace,Se=G.isMeshStandardMaterial||G.isMeshLambertMaterial&&!G.envMap||G.isMeshPhongMaterial&&!G.envMap,Re=ae.get(G.envMap||be,Se),He=G.vertexColors===!0&&!!q.attributes.color&&q.attributes.color.itemSize===4,Ve=!!q.attributes.tangent&&(!!G.normalMap||G.anisotropy>0),Pe=!!q.morphAttributes.position,Qe=!!q.morphAttributes.normal,mt=!!q.morphAttributes.color;let dt=Mi;G.toneMapped&&(Y===null||Y.isXRRenderTarget===!0)&&(dt=P.toneMapping);const st=q.morphAttributes.position||q.morphAttributes.normal||q.morphAttributes.color,Dt=st!==void 0?st.length:0,ye=W.get(G),Yt=w.state.lights;if($e===!0&&(Ke===!0||b!==se)){const ot=b===se&&G.id===j;Ne.setState(G,b,ot)}let Ze=!1;G.version===ye.__version?(ye.needsLights&&ye.lightsStateVersion!==Yt.state.version||ye.outputColorSpace!==me||V.isBatchedMesh&&ye.batching===!1||!V.isBatchedMesh&&ye.batching===!0||V.isBatchedMesh&&ye.batchingColor===!0&&V.colorTexture===null||V.isBatchedMesh&&ye.batchingColor===!1&&V.colorTexture!==null||V.isInstancedMesh&&ye.instancing===!1||!V.isInstancedMesh&&ye.instancing===!0||V.isSkinnedMesh&&ye.skinning===!1||!V.isSkinnedMesh&&ye.skinning===!0||V.isInstancedMesh&&ye.instancingColor===!0&&V.instanceColor===null||V.isInstancedMesh&&ye.instancingColor===!1&&V.instanceColor!==null||V.isInstancedMesh&&ye.instancingMorph===!0&&V.morphTexture===null||V.isInstancedMesh&&ye.instancingMorph===!1&&V.morphTexture!==null||ye.envMap!==Re||G.fog===!0&&ye.fog!==ge||ye.numClippingPlanes!==void 0&&(ye.numClippingPlanes!==Ne.numPlanes||ye.numIntersection!==Ne.numIntersection)||ye.vertexAlphas!==He||ye.vertexTangents!==Ve||ye.morphTargets!==Pe||ye.morphNormals!==Qe||ye.morphColors!==mt||ye.toneMapping!==dt||ye.morphTargetsCount!==Dt||!!ye.lightProbeGrid!=w.state.lightProbeGridArray.length>0)&&(Ze=!0):(Ze=!0,ye.__version=G.version);let ti=ye.currentProgram;Ze===!0&&(ti=Us(G,O,V),L&&G.isNodeMaterial&&L.onUpdateProgram(G,ti,ye));let mi=!1,Bi=!1,yn=!1;const rt=ti.getUniforms(),gt=ye.uniforms;if(x.useProgram(ti.program)&&(mi=!0,Bi=!0,yn=!0),G.id!==j&&(j=G.id,Bi=!0),ye.needsLights){const ot=iu(w.state.lightProbeGridArray,V);ye.lightProbeGrid!==ot&&(ye.lightProbeGrid=ot,Bi=!0)}if(mi||se!==b){x.buffers.depth.getReversed()&&b.reversedDepth!==!0&&(b._reversedDepth=!0,b.updateProjectionMatrix()),rt.setValue(U,"projectionMatrix",b.projectionMatrix),rt.setValue(U,"viewMatrix",b.matrixWorldInverse);const Hi=rt.map.cameraPosition;Hi!==void 0&&Hi.setValue(U,bt.setFromMatrixPosition(b.matrixWorld)),C.logarithmicDepthBuffer&&rt.setValue(U,"logDepthBufFC",2/(Math.log(b.far+1)/Math.LN2)),(G.isMeshPhongMaterial||G.isMeshToonMaterial||G.isMeshLambertMaterial||G.isMeshBasicMaterial||G.isMeshStandardMaterial||G.isShaderMaterial)&&rt.setValue(U,"isOrthographic",b.isOrthographicCamera===!0),se!==b&&(se=b,Bi=!0,yn=!0)}if(ye.needsLights&&(Yt.state.directionalShadowMap.length>0&&rt.setValue(U,"directionalShadowMap",Yt.state.directionalShadowMap,Z),Yt.state.spotShadowMap.length>0&&rt.setValue(U,"spotShadowMap",Yt.state.spotShadowMap,Z),Yt.state.pointShadowMap.length>0&&rt.setValue(U,"pointShadowMap",Yt.state.pointShadowMap,Z)),V.isSkinnedMesh){rt.setOptional(U,V,"bindMatrix"),rt.setOptional(U,V,"bindMatrixInverse");const ot=V.skeleton;ot&&(ot.boneTexture===null&&ot.computeBoneTexture(),rt.setValue(U,"boneTexture",ot.boneTexture,Z))}V.isBatchedMesh&&(rt.setOptional(U,V,"batchingTexture"),rt.setValue(U,"batchingTexture",V._matricesTexture,Z),rt.setOptional(U,V,"batchingIdTexture"),rt.setValue(U,"batchingIdTexture",V._indirectTexture,Z),rt.setOptional(U,V,"batchingColorTexture"),V._colorsTexture!==null&&rt.setValue(U,"batchingColorTexture",V._colorsTexture,Z));const zi=q.morphAttributes;if((zi.position!==void 0||zi.normal!==void 0||zi.color!==void 0)&&I.update(V,q,ti),(Bi||ye.receiveShadow!==V.receiveShadow)&&(ye.receiveShadow=V.receiveShadow,rt.setValue(U,"receiveShadow",V.receiveShadow)),(G.isMeshStandardMaterial||G.isMeshLambertMaterial||G.isMeshPhongMaterial)&&G.envMap===null&&O.environment!==null&&(gt.envMapIntensity.value=O.environmentIntensity),gt.dfgLUT!==void 0&&(gt.dfgLUT.value=S0()),Bi){if(rt.setValue(U,"toneMappingExposure",P.toneMappingExposure),ye.needsLights&&su(gt,yn),ge&&G.fog===!0&&Ae.refreshFogUniforms(gt,ge),Ae.refreshMaterialUniforms(gt,G,te,J,w.state.transmissionRenderTarget[b.id]),ye.needsLights&&ye.lightProbeGrid){const ot=ye.lightProbeGrid;gt.probesSH.value=ot.texture,gt.probesMin.value.copy(ot.boundingBox.min),gt.probesMax.value.copy(ot.boundingBox.max),gt.probesResolution.value.copy(ot.resolution)}Er.upload(U,ml(ye),gt,Z)}if(G.isShaderMaterial&&G.uniformsNeedUpdate===!0&&(Er.upload(U,ml(ye),gt,Z),G.uniformsNeedUpdate=!1),G.isSpriteMaterial&&rt.setValue(U,"center",V.center),rt.setValue(U,"modelViewMatrix",V.modelViewMatrix),rt.setValue(U,"normalMatrix",V.normalMatrix),rt.setValue(U,"modelMatrix",V.matrixWorld),G.uniformsGroups!==void 0){const ot=G.uniformsGroups;for(let Hi=0,bn=ot.length;Hi<bn;Hi++){const _l=ot[Hi];ie.update(_l,ti),ie.bind(_l,ti)}}return ti}function su(b,O){b.ambientLightColor.needsUpdate=O,b.lightProbe.needsUpdate=O,b.directionalLights.needsUpdate=O,b.directionalLightShadows.needsUpdate=O,b.pointLights.needsUpdate=O,b.pointLightShadows.needsUpdate=O,b.spotLights.needsUpdate=O,b.spotLightShadows.needsUpdate=O,b.rectAreaLights.needsUpdate=O,b.hemisphereLights.needsUpdate=O}function ru(b){return b.isMeshLambertMaterial||b.isMeshToonMaterial||b.isMeshPhongMaterial||b.isMeshStandardMaterial||b.isShadowMaterial||b.isShaderMaterial&&b.lights===!0}this.getActiveCubeFace=function(){return N},this.getActiveMipmapLevel=function(){return B},this.getRenderTarget=function(){return Y},this.setRenderTargetTextures=function(b,O,q){const G=W.get(b);G.__autoAllocateDepthBuffer=b.resolveDepthBuffer===!1,G.__autoAllocateDepthBuffer===!1&&(G.__useRenderToTexture=!1),W.get(b.texture).__webglTexture=O,W.get(b.depthTexture).__webglTexture=G.__autoAllocateDepthBuffer?void 0:q,G.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(b,O){const q=W.get(b);q.__webglFramebuffer=O,q.__useDefaultFramebuffer=O===void 0},this.setRenderTarget=function(b,O=0,q=0){Y=b,N=O,B=q;let G=null,V=!1,ge=!1;if(b){const me=W.get(b);if(me.__useDefaultFramebuffer!==void 0){x.bindFramebuffer(U.FRAMEBUFFER,me.__webglFramebuffer),ne.copy(b.viewport),re.copy(b.scissor),xe=b.scissorTest,x.viewport(ne),x.scissor(re),x.setScissorTest(xe),j=-1;return}else if(me.__webglFramebuffer===void 0)Z.setupRenderTarget(b);else if(me.__hasExternalTextures)Z.rebindTextures(b,W.get(b.texture).__webglTexture,W.get(b.depthTexture).__webglTexture);else if(b.depthBuffer){const He=b.depthTexture;if(me.__boundDepthTexture!==He){if(He!==null&&W.has(He)&&(b.width!==He.image.width||b.height!==He.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");Z.setupDepthRenderbuffer(b)}}const Se=b.texture;(Se.isData3DTexture||Se.isDataArrayTexture||Se.isCompressedArrayTexture)&&(ge=!0);const Re=W.get(b).__webglFramebuffer;b.isWebGLCubeRenderTarget?(Array.isArray(Re[O])?G=Re[O][q]:G=Re[O],V=!0):b.samples>0&&Z.useMultisampledRTT(b)===!1?G=W.get(b).__webglMultisampledFramebuffer:Array.isArray(Re)?G=Re[q]:G=Re,ne.copy(b.viewport),re.copy(b.scissor),xe=b.scissorTest}else ne.copy(Ie).multiplyScalar(te).floor(),re.copy(pt).multiplyScalar(te).floor(),xe=Ye;if(q!==0&&(G=H),x.bindFramebuffer(U.FRAMEBUFFER,G)&&x.drawBuffers(b,G),x.viewport(ne),x.scissor(re),x.setScissorTest(xe),V){const me=W.get(b.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_CUBE_MAP_POSITIVE_X+O,me.__webglTexture,q)}else if(ge){const me=O;for(let Se=0;Se<b.textures.length;Se++){const Re=W.get(b.textures[Se]);U.framebufferTextureLayer(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0+Se,Re.__webglTexture,q,me)}}else if(b!==null&&q!==0){const me=W.get(b.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,me.__webglTexture,q)}j=-1},this.readRenderTargetPixels=function(b,O,q,G,V,ge,be,me=0){if(!(b&&b.isWebGLRenderTarget)){We("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Se=W.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&be!==void 0&&(Se=Se[be]),Se){x.bindFramebuffer(U.FRAMEBUFFER,Se);try{const Re=b.textures[me],He=Re.format,Ve=Re.type;if(b.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+me),!C.textureFormatReadable(He)){We("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!C.textureTypeReadable(Ve)){We("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}O>=0&&O<=b.width-G&&q>=0&&q<=b.height-V&&U.readPixels(O,q,G,V,de.convert(He),de.convert(Ve),ge)}finally{const Re=Y!==null?W.get(Y).__webglFramebuffer:null;x.bindFramebuffer(U.FRAMEBUFFER,Re)}}},this.readRenderTargetPixelsAsync=async function(b,O,q,G,V,ge,be,me=0){if(!(b&&b.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Se=W.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&be!==void 0&&(Se=Se[be]),Se)if(O>=0&&O<=b.width-G&&q>=0&&q<=b.height-V){x.bindFramebuffer(U.FRAMEBUFFER,Se);const Re=b.textures[me],He=Re.format,Ve=Re.type;if(b.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+me),!C.textureFormatReadable(He))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!C.textureTypeReadable(Ve))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const Pe=U.createBuffer();U.bindBuffer(U.PIXEL_PACK_BUFFER,Pe),U.bufferData(U.PIXEL_PACK_BUFFER,ge.byteLength,U.STREAM_READ),U.readPixels(O,q,G,V,de.convert(He),de.convert(Ve),0);const Qe=Y!==null?W.get(Y).__webglFramebuffer:null;x.bindFramebuffer(U.FRAMEBUFFER,Qe);const mt=U.fenceSync(U.SYNC_GPU_COMMANDS_COMPLETE,0);return U.flush(),await Vu(U,mt,4),U.bindBuffer(U.PIXEL_PACK_BUFFER,Pe),U.getBufferSubData(U.PIXEL_PACK_BUFFER,0,ge),U.deleteBuffer(Pe),U.deleteSync(mt),ge}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(b,O=null,q=0){const G=Math.pow(2,-q),V=Math.floor(b.image.width*G),ge=Math.floor(b.image.height*G),be=O!==null?O.x:0,me=O!==null?O.y:0;Z.setTexture2D(b,0),U.copyTexSubImage2D(U.TEXTURE_2D,q,0,0,be,me,V,ge),x.unbindTexture()},this.copyTextureToTexture=function(b,O,q=null,G=null,V=0,ge=0){let be,me,Se,Re,He,Ve,Pe,Qe,mt;const dt=b.isCompressedTexture?b.mipmaps[ge]:b.image;if(q!==null)be=q.max.x-q.min.x,me=q.max.y-q.min.y,Se=q.isBox3?q.max.z-q.min.z:1,Re=q.min.x,He=q.min.y,Ve=q.isBox3?q.min.z:0;else{const gt=Math.pow(2,-V);be=Math.floor(dt.width*gt),me=Math.floor(dt.height*gt),b.isDataArrayTexture?Se=dt.depth:b.isData3DTexture?Se=Math.floor(dt.depth*gt):Se=1,Re=0,He=0,Ve=0}G!==null?(Pe=G.x,Qe=G.y,mt=G.z):(Pe=0,Qe=0,mt=0);const st=de.convert(O.format),Dt=de.convert(O.type);let ye;O.isData3DTexture?(Z.setTexture3D(O,0),ye=U.TEXTURE_3D):O.isDataArrayTexture||O.isCompressedArrayTexture?(Z.setTexture2DArray(O,0),ye=U.TEXTURE_2D_ARRAY):(Z.setTexture2D(O,0),ye=U.TEXTURE_2D),x.activeTexture(U.TEXTURE0),x.pixelStorei(U.UNPACK_FLIP_Y_WEBGL,O.flipY),x.pixelStorei(U.UNPACK_PREMULTIPLY_ALPHA_WEBGL,O.premultiplyAlpha),x.pixelStorei(U.UNPACK_ALIGNMENT,O.unpackAlignment);const Yt=x.getParameter(U.UNPACK_ROW_LENGTH),Ze=x.getParameter(U.UNPACK_IMAGE_HEIGHT),ti=x.getParameter(U.UNPACK_SKIP_PIXELS),mi=x.getParameter(U.UNPACK_SKIP_ROWS),Bi=x.getParameter(U.UNPACK_SKIP_IMAGES);x.pixelStorei(U.UNPACK_ROW_LENGTH,dt.width),x.pixelStorei(U.UNPACK_IMAGE_HEIGHT,dt.height),x.pixelStorei(U.UNPACK_SKIP_PIXELS,Re),x.pixelStorei(U.UNPACK_SKIP_ROWS,He),x.pixelStorei(U.UNPACK_SKIP_IMAGES,Ve);const yn=b.isDataArrayTexture||b.isData3DTexture,rt=O.isDataArrayTexture||O.isData3DTexture;if(b.isDepthTexture){const gt=W.get(b),zi=W.get(O),ot=W.get(gt.__renderTarget),Hi=W.get(zi.__renderTarget);x.bindFramebuffer(U.READ_FRAMEBUFFER,ot.__webglFramebuffer),x.bindFramebuffer(U.DRAW_FRAMEBUFFER,Hi.__webglFramebuffer);for(let bn=0;bn<Se;bn++)yn&&(U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,W.get(b).__webglTexture,V,Ve+bn),U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,W.get(O).__webglTexture,ge,mt+bn)),U.blitFramebuffer(Re,He,be,me,Pe,Qe,be,me,U.DEPTH_BUFFER_BIT,U.NEAREST);x.bindFramebuffer(U.READ_FRAMEBUFFER,null),x.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else if(V!==0||b.isRenderTargetTexture||W.has(b)){const gt=W.get(b),zi=W.get(O);x.bindFramebuffer(U.READ_FRAMEBUFFER,K),x.bindFramebuffer(U.DRAW_FRAMEBUFFER,F);for(let ot=0;ot<Se;ot++)yn?U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,gt.__webglTexture,V,Ve+ot):U.framebufferTexture2D(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,gt.__webglTexture,V),rt?U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,zi.__webglTexture,ge,mt+ot):U.framebufferTexture2D(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,zi.__webglTexture,ge),V!==0?U.blitFramebuffer(Re,He,be,me,Pe,Qe,be,me,U.COLOR_BUFFER_BIT,U.NEAREST):rt?U.copyTexSubImage3D(ye,ge,Pe,Qe,mt+ot,Re,He,be,me):U.copyTexSubImage2D(ye,ge,Pe,Qe,Re,He,be,me);x.bindFramebuffer(U.READ_FRAMEBUFFER,null),x.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else rt?b.isDataTexture||b.isData3DTexture?U.texSubImage3D(ye,ge,Pe,Qe,mt,be,me,Se,st,Dt,dt.data):O.isCompressedArrayTexture?U.compressedTexSubImage3D(ye,ge,Pe,Qe,mt,be,me,Se,st,dt.data):U.texSubImage3D(ye,ge,Pe,Qe,mt,be,me,Se,st,Dt,dt):b.isDataTexture?U.texSubImage2D(U.TEXTURE_2D,ge,Pe,Qe,be,me,st,Dt,dt.data):b.isCompressedTexture?U.compressedTexSubImage2D(U.TEXTURE_2D,ge,Pe,Qe,dt.width,dt.height,st,dt.data):U.texSubImage2D(U.TEXTURE_2D,ge,Pe,Qe,be,me,st,Dt,dt);x.pixelStorei(U.UNPACK_ROW_LENGTH,Yt),x.pixelStorei(U.UNPACK_IMAGE_HEIGHT,Ze),x.pixelStorei(U.UNPACK_SKIP_PIXELS,ti),x.pixelStorei(U.UNPACK_SKIP_ROWS,mi),x.pixelStorei(U.UNPACK_SKIP_IMAGES,Bi),ge===0&&O.generateMipmaps&&U.generateMipmap(ye),x.unbindTexture()},this.initRenderTarget=function(b){W.get(b).__webglFramebuffer===void 0&&Z.setupRenderTarget(b)},this.initTexture=function(b){b.isCubeTexture?Z.setTextureCube(b,0):b.isData3DTexture?Z.setTexture3D(b,0):b.isDataArrayTexture||b.isCompressedArrayTexture?Z.setTexture2DArray(b,0):Z.setTexture2D(b,0),x.unbindTexture()},this.resetState=function(){N=0,B=0,Y=null,x.reset(),_e.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return bi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=Xe._getDrawingBufferColorSpace(e),t.unpackColorSpace=Xe._getUnpackColorSpace()}}const kc={type:"change"},Qo={type:"start"},Xh={type:"end"},hr=new Wr,Bc=new $i,T0=Math.cos(70*xi.DEG2RAD),Mt=new D,Xt=2*Math.PI,et={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},Ua=1e-6;class w0 extends Rf{constructor(e,t=null){super(e,t),this.state=et.NONE,this.target=new D,this.cursor=new D,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:Hn.ROTATE,MIDDLE:Hn.DOLLY,RIGHT:Hn.PAN},this.touches={ONE:Bn.ROTATE,TWO:Bn.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle="auto",this._domElementKeyEvents=null,this._lastPosition=new D,this._lastQuaternion=new Pt,this._lastTargetPosition=new D,this._quat=new Pt().setFromUnitVectors(e.up,new D(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new dc,this._sphericalDelta=new dc,this._scale=1,this._panOffset=new D,this._rotateStart=new De,this._rotateEnd=new De,this._rotateDelta=new De,this._panStart=new De,this._panEnd=new De,this._panDelta=new De,this._dollyStart=new De,this._dollyEnd=new De,this._dollyDelta=new De,this._dollyDirection=new D,this._mouse=new De,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=R0.bind(this),this._onPointerDown=A0.bind(this),this._onPointerUp=C0.bind(this),this._onContextMenu=F0.bind(this),this._onMouseWheel=N0.bind(this),this._onKeyDown=D0.bind(this),this._onTouchStart=I0.bind(this),this._onTouchMove=U0.bind(this),this._onMouseDown=P0.bind(this),this._onMouseMove=L0.bind(this),this._interceptControlDown=O0.bind(this),this._interceptControlUp=k0.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(e){this._cursorStyle=e,e==="grab"?this.domElement.style.cursor="grab":this.domElement.style.cursor="auto"}get cursorStyle(){return this._cursorStyle}connect(e){super.connect(e),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction=""}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(kc),this.update(),this.state=et.NONE}pan(e,t){this._pan(e,t),this.update()}dollyIn(e){this._dollyIn(e),this.update()}dollyOut(e){this._dollyOut(e),this.update()}rotateLeft(e){this._rotateLeft(e),this.update()}rotateUp(e){this._rotateUp(e),this.update()}update(e=null){const t=this.object.position;Mt.copy(t).sub(this.target),Mt.applyQuaternion(this._quat),this._spherical.setFromVector3(Mt),this.autoRotate&&this.state===et.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let i=this.minAzimuthAngle,n=this.maxAzimuthAngle;isFinite(i)&&isFinite(n)&&(i<-Math.PI?i+=Xt:i>Math.PI&&(i-=Xt),n<-Math.PI?n+=Xt:n>Math.PI&&(n-=Xt),i<=n?this._spherical.theta=Math.max(i,Math.min(n,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(i+n)/2?Math.max(i,this._spherical.theta):Math.min(n,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let s=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{const a=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),s=a!=this._spherical.radius}if(Mt.setFromSpherical(this._spherical),Mt.applyQuaternion(this._quatInverse),t.copy(this.target).add(Mt),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let a=null;if(this.object.isPerspectiveCamera){const o=Mt.length();a=this._clampDistance(o*this._scale);const c=o-a;this.object.position.addScaledVector(this._dollyDirection,c),this.object.updateMatrixWorld(),s=!!c}else if(this.object.isOrthographicCamera){const o=new D(this._mouse.x,this._mouse.y,0);o.unproject(this.object);const c=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),s=c!==this.object.zoom;const l=new D(this._mouse.x,this._mouse.y,0);l.unproject(this.object),this.object.position.sub(l).add(o),this.object.updateMatrixWorld(),a=Mt.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;a!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(a).add(this.object.position):(hr.origin.copy(this.object.position),hr.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(hr.direction))<T0?this.object.lookAt(this.target):(Bc.setFromNormalAndCoplanarPoint(this.object.up,this.target),hr.intersectPlane(Bc,this.target))))}else if(this.object.isOrthographicCamera){const a=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),a!==this.object.zoom&&(this.object.updateProjectionMatrix(),s=!0)}return this._scale=1,this._performCursorZoom=!1,s||this._lastPosition.distanceToSquared(this.object.position)>Ua||8*(1-this._lastQuaternion.dot(this.object.quaternion))>Ua||this._lastTargetPosition.distanceToSquared(this.target)>Ua?(this.dispatchEvent(kc),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?Xt/60*this.autoRotateSpeed*e:Xt/60/60*this.autoRotateSpeed}_getZoomScale(e){const t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){Mt.setFromMatrixColumn(t,0),Mt.multiplyScalar(-e),this._panOffset.add(Mt)}_panUp(e,t){this.screenSpacePanning===!0?Mt.setFromMatrixColumn(t,1):(Mt.setFromMatrixColumn(t,0),Mt.crossVectors(this.object.up,Mt)),Mt.multiplyScalar(e),this._panOffset.add(Mt)}_pan(e,t){const i=this.domElement;if(this.object.isPerspectiveCamera){const n=this.object.position;Mt.copy(n).sub(this.target);let s=Mt.length();s*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*s/i.clientHeight,this.object.matrix),this._panUp(2*t*s/i.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/i.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/i.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;const i=this.domElement.getBoundingClientRect(),n=e-i.left,s=t-i.top,a=i.width,o=i.height;this._mouse.x=n/a*2-1,this._mouse.y=-(s/o)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const t=this.domElement;this._rotateLeft(Xt*this._rotateDelta.x/t.clientHeight),this._rotateUp(Xt*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(Xt*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-Xt*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(Xt*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-Xt*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),n=.5*(e.pageY+t.y);this._rotateStart.set(i,n)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),n=.5*(e.pageY+t.y);this._panStart.set(i,n)}}_handleTouchStartDolly(e){const t=this._getSecondPointerPosition(e),i=e.pageX-t.x,n=e.pageY-t.y,s=Math.sqrt(i*i+n*n);this._dollyStart.set(0,s)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{const i=this._getSecondPointerPosition(e),n=.5*(e.pageX+i.x),s=.5*(e.pageY+i.y);this._rotateEnd.set(n,s)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const t=this.domElement;this._rotateLeft(Xt*this._rotateDelta.x/t.clientHeight),this._rotateUp(Xt*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),n=.5*(e.pageY+t.y);this._panEnd.set(i,n)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){const t=this._getSecondPointerPosition(e),i=e.pageX-t.x,n=e.pageY-t.y,s=Math.sqrt(i*i+n*n);this._dollyEnd.set(0,s),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);const a=(e.pageX+t.x)*.5,o=(e.pageY+t.y)*.5;this._updateZoomParameters(a,o)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new De,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){const t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){const t=e.deltaMode,i={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:i.deltaY*=16;break;case 2:i.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(i.deltaY*=10),i}}function A0(r){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(r.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(r)&&(this._addPointer(r),r.pointerType==="touch"?this._onTouchStart(r):this._onMouseDown(r),this._cursorStyle==="grab"&&(this.domElement.style.cursor="grabbing")))}function R0(r){this.enabled!==!1&&(r.pointerType==="touch"?this._onTouchMove(r):this._onMouseMove(r))}function C0(r){switch(this._removePointer(r),this._pointers.length){case 0:this.domElement.releasePointerCapture(r.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(Xh),this.state=et.NONE,this._cursorStyle==="grab"&&(this.domElement.style.cursor="grab");break;case 1:const e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function P0(r){let e;switch(r.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case Hn.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(r),this.state=et.DOLLY;break;case Hn.ROTATE:if(r.ctrlKey||r.metaKey||r.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(r),this.state=et.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(r),this.state=et.ROTATE}break;case Hn.PAN:if(r.ctrlKey||r.metaKey||r.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(r),this.state=et.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(r),this.state=et.PAN}break;default:this.state=et.NONE}this.state!==et.NONE&&this.dispatchEvent(Qo)}function L0(r){switch(this.state){case et.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(r);break;case et.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(r);break;case et.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(r);break}}function N0(r){this.enabled===!1||this.enableZoom===!1||this.state!==et.NONE||(r.preventDefault(),this.dispatchEvent(Qo),this._handleMouseWheel(this._customWheelEvent(r)),this.dispatchEvent(Xh))}function D0(r){this.enabled!==!1&&this._handleKeyDown(r)}function I0(r){switch(this._trackPointer(r),this._pointers.length){case 1:switch(this.touches.ONE){case Bn.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(r),this.state=et.TOUCH_ROTATE;break;case Bn.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(r),this.state=et.TOUCH_PAN;break;default:this.state=et.NONE}break;case 2:switch(this.touches.TWO){case Bn.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(r),this.state=et.TOUCH_DOLLY_PAN;break;case Bn.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(r),this.state=et.TOUCH_DOLLY_ROTATE;break;default:this.state=et.NONE}break;default:this.state=et.NONE}this.state!==et.NONE&&this.dispatchEvent(Qo)}function U0(r){switch(this._trackPointer(r),this.state){case et.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(r),this.update();break;case et.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(r),this.update();break;case et.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(r),this.update();break;case et.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(r),this.update();break;default:this.state=et.NONE}}function F0(r){this.enabled!==!1&&r.preventDefault()}function O0(r){r.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function k0(r){r.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}class B0 extends sn{constructor(e){super(e)}load(e,t,i,n){const s=this,a=new Jo(this.manager);a.setPath(this.path),a.setResponseType("arraybuffer"),a.setRequestHeader(this.requestHeader),a.setWithCredentials(this.withCredentials),a.load(e,function(o){try{t(s.parse(o))}catch(c){n?n(c):console.error(c),s.manager.itemError(e)}},i,n)}parse(e){function t(l){const h=new DataView(l),d=32/8*3+32/8*3*3+16/8,u=h.getUint32(80,!0);if(80+32/8+u*d===h.byteLength)return!0;const g=[115,111,108,105,100];for(let v=0;v<5;v++)if(i(g,h,v))return!1;return!0}function i(l,h,d){for(let u=0,f=l.length;u<f;u++)if(l[u]!==h.getUint8(d+u))return!1;return!0}function n(l){const h=new DataView(l),d=h.getUint32(80,!0);let u,f,g,v=!1,m,p,M,T,y;for(let R=0;R<70;R++)h.getUint32(R,!1)==1129270351&&h.getUint8(R+4)==82&&h.getUint8(R+5)==61&&(v=!0,m=new Float32Array(d*3*3),p=h.getUint8(R+6)/255,M=h.getUint8(R+7)/255,T=h.getUint8(R+8)/255,y=h.getUint8(R+9)/255);const E=84,w=12*4+2,A=new kt,_=new Float32Array(d*3*3),S=new Float32Array(d*3*3),P=new Be;for(let R=0;R<d;R++){const L=E+R*w,H=h.getFloat32(L,!0),K=h.getFloat32(L+4,!0),F=h.getFloat32(L+8,!0);if(v){const N=h.getUint16(L+48,!0);N&32768?(u=p,f=M,g=T):(u=(N&31)/31,f=(N>>5&31)/31,g=(N>>10&31)/31)}for(let N=1;N<=3;N++){const B=L+N*12,Y=R*3*3+(N-1)*3;_[Y]=h.getFloat32(B,!0),_[Y+1]=h.getFloat32(B+4,!0),_[Y+2]=h.getFloat32(B+8,!0),S[Y]=H,S[Y+1]=K,S[Y+2]=F,v&&(P.setRGB(u,f,g,lt),m[Y]=P.r,m[Y+1]=P.g,m[Y+2]=P.b)}}return A.setAttribute("position",new ei(_,3)),A.setAttribute("normal",new ei(S,3)),v&&(A.setAttribute("color",new ei(m,3)),A.hasColors=!0,A.alpha=y),A}function s(l){const h=new kt,d=/solid([\s\S]*?)endsolid/g,u=/facet([\s\S]*?)endfacet/g,f=/solid\s(.+)/;let g=0;const v=/[\s]+([+-]?(?:\d*)(?:\.\d*)?(?:[eE][+-]?\d+)?)/.source,m=new RegExp("vertex"+v+v+v,"g"),p=new RegExp("normal"+v+v+v,"g"),M=[],T=[],y=[],E=new D;let w,A=0,_=0,S=0;for(;(w=d.exec(l))!==null;){_=S;const P=w[0],R=(w=f.exec(P))!==null?w[1]:"";for(y.push(R);(w=u.exec(P))!==null;){let K=0,F=0;const N=w[0];for(;(w=p.exec(N))!==null;)E.x=parseFloat(w[1]),E.y=parseFloat(w[2]),E.z=parseFloat(w[3]),F++;for(;(w=m.exec(N))!==null;)M.push(parseFloat(w[1]),parseFloat(w[2]),parseFloat(w[3])),T.push(E.x,E.y,E.z),K++,S++;F!==1&&console.error("THREE.STLLoader: Something isn't right with the normal of face number "+g),K!==3&&console.error("THREE.STLLoader: Something isn't right with the vertices of face number "+g),g++}const L=_,H=S-_;h.userData.groupNames=y,h.addGroup(L,H,A),A++}return h.setAttribute("position",new tt(M,3)),h.setAttribute("normal",new tt(T,3)),h}function a(l){return typeof l!="string"?new TextDecoder().decode(l):l}function o(l){if(typeof l=="string"){const h=new Uint8Array(l.length);for(let d=0;d<l.length;d++)h[d]=l.charCodeAt(d)&255;return h.buffer||h}else return l}const c=o(e);return t(c)?n(c):s(a(e))}}class zc extends _f{constructor(e){super(e)}parse(e){function t(N){switch(N.image_type){case u:case v:if(N.colormap_length>256||N.colormap_size!==24||N.colormap_type!==1)throw new Error("THREE.TGALoader: Invalid type colormap data for indexed type.");break;case f:case g:case m:case p:if(N.colormap_type)throw new Error("THREE.TGALoader: Invalid type colormap data for colormap type.");break;case d:throw new Error("THREE.TGALoader: No data.");default:throw new Error("THREE.TGALoader: Invalid type "+N.image_type)}if(N.width<=0||N.height<=0)throw new Error("THREE.TGALoader: Invalid image size.");if(N.pixel_size!==8&&N.pixel_size!==16&&N.pixel_size!==24&&N.pixel_size!==32)throw new Error("THREE.TGALoader: Invalid pixel size "+N.pixel_size)}function i(N,B,Y,j,se){let ne,re;const xe=Y.pixel_size>>3,ve=Y.width*Y.height*xe;if(B&&(re=se.subarray(j,j+=Y.colormap_length*(Y.colormap_size>>3))),N){ne=new Uint8Array(ve);let oe,k,J,te=0;const we=new Uint8Array(xe);for(;te<ve;)if(oe=se[j++],k=(oe&127)+1,oe&128){for(J=0;J<xe;++J)we[J]=se[j++];for(J=0;J<k;++J)ne.set(we,te+J*xe);te+=xe*k}else{for(k*=xe,J=0;J<k;++J)ne[te+J]=se[j++];te+=k}}else ne=se.subarray(j,j+=B?Y.width*Y.height:ve);return{pixel_data:ne,palettes:re}}function n(N,B,Y,j,se,ne,re,xe,ve){const oe=ve;let k,J=0,te,we;const Fe=P.width;for(we=B;we!==j;we+=Y)for(te=se;te!==re;te+=ne,J++)k=xe[J],N[(te+Fe*we)*4+3]=255,N[(te+Fe*we)*4+2]=oe[k*3+0],N[(te+Fe*we)*4+1]=oe[k*3+1],N[(te+Fe*we)*4+0]=oe[k*3+2];return N}function s(N,B,Y,j,se,ne,re,xe){let ve,oe=0,k,J;const te=P.width;for(J=B;J!==j;J+=Y)for(k=se;k!==re;k+=ne,oe+=2)ve=xe[oe+0]+(xe[oe+1]<<8),N[(k+te*J)*4+0]=(ve&31744)>>7,N[(k+te*J)*4+1]=(ve&992)>>2,N[(k+te*J)*4+2]=(ve&31)<<3,N[(k+te*J)*4+3]=ve&32768?0:255;return N}function a(N,B,Y,j,se,ne,re,xe){let ve=0,oe,k;const J=P.width;for(k=B;k!==j;k+=Y)for(oe=se;oe!==re;oe+=ne,ve+=3)N[(oe+J*k)*4+3]=255,N[(oe+J*k)*4+2]=xe[ve+0],N[(oe+J*k)*4+1]=xe[ve+1],N[(oe+J*k)*4+0]=xe[ve+2];return N}function o(N,B,Y,j,se,ne,re,xe){let ve=0,oe,k;const J=P.width;for(k=B;k!==j;k+=Y)for(oe=se;oe!==re;oe+=ne,ve+=4)N[(oe+J*k)*4+2]=xe[ve+0],N[(oe+J*k)*4+1]=xe[ve+1],N[(oe+J*k)*4+0]=xe[ve+2],N[(oe+J*k)*4+3]=xe[ve+3];return N}function c(N,B,Y,j,se,ne,re,xe){let ve,oe=0,k,J;const te=P.width;for(J=B;J!==j;J+=Y)for(k=se;k!==re;k+=ne,oe++)ve=xe[oe],N[(k+te*J)*4+0]=ve,N[(k+te*J)*4+1]=ve,N[(k+te*J)*4+2]=ve,N[(k+te*J)*4+3]=255;return N}function l(N,B,Y,j,se,ne,re,xe){let ve=0,oe,k;const J=P.width;for(k=B;k!==j;k+=Y)for(oe=se;oe!==re;oe+=ne,ve+=2)N[(oe+J*k)*4+0]=xe[ve+0],N[(oe+J*k)*4+1]=xe[ve+0],N[(oe+J*k)*4+2]=xe[ve+0],N[(oe+J*k)*4+3]=xe[ve+1];return N}function h(N,B,Y,j,se){let ne,re,xe,ve,oe,k;switch((P.flags&M)>>T){default:case w:ne=0,xe=1,oe=B,re=0,ve=1,k=Y;break;case y:ne=0,xe=1,oe=B,re=Y-1,ve=-1,k=-1;break;case A:ne=B-1,xe=-1,oe=-1,re=0,ve=1,k=Y;break;case E:ne=B-1,xe=-1,oe=-1,re=Y-1,ve=-1,k=-1;break}if(H)switch(P.pixel_size){case 8:c(N,re,ve,k,ne,xe,oe,j);break;case 16:l(N,re,ve,k,ne,xe,oe,j);break;default:throw new Error("THREE.TGALoader: Format not supported.")}else switch(P.pixel_size){case 8:n(N,re,ve,k,ne,xe,oe,j,se);break;case 16:s(N,re,ve,k,ne,xe,oe,j);break;case 24:a(N,re,ve,k,ne,xe,oe,j);break;case 32:o(N,re,ve,k,ne,xe,oe,j);break;default:throw new Error("THREE.TGALoader: Format not supported.")}return N}const d=0,u=1,f=2,g=3,v=9,m=10,p=11,M=48,T=4,y=0,E=1,w=2,A=3;if(e.length<19)throw new Error("THREE.TGALoader: Not enough data to contain header.");let _=0;const S=new Uint8Array(e),P={id_length:S[_++],colormap_type:S[_++],image_type:S[_++],colormap_index:S[_++]|S[_++]<<8,colormap_length:S[_++]|S[_++]<<8,colormap_size:S[_++],origin:[S[_++]|S[_++]<<8,S[_++]|S[_++]<<8],width:S[_++]|S[_++]<<8,height:S[_++]|S[_++]<<8,pixel_size:S[_++],flags:S[_++]};if(t(P),P.id_length+_>e.length)throw new Error("THREE.TGALoader: No data.");_+=P.id_length;let R=!1,L=!1,H=!1;switch(P.image_type){case v:R=!0,L=!0;break;case u:L=!0;break;case m:R=!0;break;case f:break;case p:R=!0,H=!0;break;case g:H=!0;break}const K=new Uint8Array(P.width*P.height*4),F=i(R,L,P,_,S);return h(K,P.width,P.height,F.pixel_data,F.palettes),{data:K,width:P.width,height:P.height,flipY:!0,generateMipmaps:!0,minFilter:Di}}}function Jt(r,e){const t=[],i=r.childNodes;for(let n=0,s=i.length;n<s;n++){const a=i[n];a.nodeName===e&&t.push(a)}return t}function z0(r){return r.length===0?[]:r.trim().split(/\s+/)}function Gt(r){return r.length===0?[]:r.trim().split(/\s+/).map(parseFloat)}function ur(r){return r.length===0?[]:r.trim().split(/\s+/).map(e=>parseInt(e))}function Ct(r){return r.substring(1)}class H0{constructor(){this.count=0}generateId(){return"three_default_"+this.count++}parse(e){if(e.length===0)return null;const t=new DOMParser().parseFromString(e,"application/xml"),i=Jt(t,"COLLADA")[0],n=t.getElementsByTagName("parsererror")[0];if(n!==void 0){const c=Jt(n,"div")[0];let l;return c?l=c.textContent:l=this.parserErrorToText(n),console.error(`THREE.ColladaLoader: Failed to parse collada file.
`,l),null}const s=i.getAttribute("version");console.debug("THREE.ColladaLoader: File version",s);const a=this.parseAsset(Jt(i,"asset")[0]),o={animations:{},clips:{},controllers:{},images:{},effects:{},materials:{},cameras:{},lights:{},geometries:{},nodes:{},visualScenes:{},kinematicsModels:{},physicsModels:{},kinematicsScenes:{},joints:{}};return this.library=o,this.collada=i,this.parseLibrary(i,"library_animations","animation",this.parseAnimation.bind(this)),this.parseLibrary(i,"library_animation_clips","animation_clip",this.parseAnimationClip.bind(this)),this.parseLibrary(i,"library_controllers","controller",this.parseController.bind(this)),this.parseLibrary(i,"library_images","image",this.parseImage.bind(this)),this.parseLibrary(i,"library_effects","effect",this.parseEffect.bind(this)),this.parseLibrary(i,"library_materials","material",this.parseMaterial.bind(this)),this.parseLibrary(i,"library_cameras","camera",this.parseCamera.bind(this)),this.parseLibrary(i,"library_lights","light",this.parseLight.bind(this)),this.parseLibrary(i,"library_geometries","geometry",this.parseGeometry.bind(this)),this.parseLibrary(i,"library_nodes","node",this.parseNode.bind(this)),this.parseLibrary(i,"library_visual_scenes","visual_scene",this.parseVisualScene.bind(this)),this.parseLibrary(i,"library_joints","joint",this.parseLibraryJoint.bind(this)),this.parseLibrary(i,"library_kinematics_models","kinematics_model",this.parseKinematicsModel.bind(this)),this.parseLibrary(i,"library_physics_models","physics_model",this.parsePhysicsModel.bind(this)),this.parseLibrary(i,"scene","instance_kinematics_scene",this.parseKinematicsScene.bind(this)),{library:o,asset:a,collada:i}}parserErrorToText(e){const t=[],i=[e];for(;i.length;){const n=i.shift();n.nodeType===Node.TEXT_NODE?t.push(n.textContent):(t.push(`
`),i.push(...n.childNodes))}return t.join("").trim()}parseAsset(e){return{unit:this.parseAssetUnit(Jt(e,"unit")[0]),upAxis:this.parseAssetUpAxis(Jt(e,"up_axis")[0])}}parseAssetUnit(e){return e!==void 0&&e.hasAttribute("meter")===!0?parseFloat(e.getAttribute("meter")):1}parseAssetUpAxis(e){return e!==void 0?e.textContent:"Y_UP"}parseLibrary(e,t,i,n){const s=Jt(e,t)[0];if(s!==void 0){const a=Jt(s,i);for(let o=0;o<a.length;o++)n(a[o])}}parseAnimation(e){const t={sources:{},samplers:{},channels:{}};let i=!1;for(let n=0,s=e.childNodes.length;n<s;n++){const a=e.childNodes[n];if(a.nodeType!==1)continue;let o;switch(a.nodeName){case"source":o=a.getAttribute("id"),t.sources[o]=this.parseSource(a);break;case"sampler":o=a.getAttribute("id"),t.samplers[o]=this.parseAnimationSampler(a);break;case"channel":o=a.getAttribute("target"),t.channels[o]=this.parseAnimationChannel(a);break;case"animation":this.parseAnimation(a),i=!0;break}}i===!1&&(this.library.animations[e.getAttribute("id")||xi.generateUUID()]=t)}parseAnimationSampler(e){const t={inputs:{}};for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"input":const a=Ct(s.getAttribute("source")),o=s.getAttribute("semantic");t.inputs[o]=a;break}}return t}parseAnimationChannel(e){const t={};let n=e.getAttribute("target").split("/");const s=n.shift();let a=n.shift();const o=a.indexOf("(")!==-1,c=a.indexOf(".")!==-1;if(c)n=a.split("."),a=n.shift(),t.member=n.shift();else if(o){const l=a.split("(");a=l.shift();for(let h=0;h<l.length;h++)l[h]=parseInt(l[h].replace(/\)/,""));t.indices=l}return t.id=s,t.sid=a,t.arraySyntax=o,t.memberSyntax=c,t.sampler=Ct(e.getAttribute("source")),t}parseAnimationClip(e){const t={name:e.getAttribute("id")||"default",start:parseFloat(e.getAttribute("start")||0),end:parseFloat(e.getAttribute("end")||0),animations:[]};for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"instance_animation":t.animations.push(Ct(s.getAttribute("url")));break}}this.library.clips[e.getAttribute("id")]=t}parseController(e){const t={};for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"skin":t.id=Ct(s.getAttribute("source")),t.skin=this.parseSkin(s);break;case"morph":t.id=Ct(s.getAttribute("source")),console.warn("THREE.ColladaLoader: Morph target animation not supported yet.");break}}this.library.controllers[e.getAttribute("id")]=t}parseSkin(e){const t={sources:{}};for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"bind_shape_matrix":t.bindShapeMatrix=Gt(s.textContent);break;case"source":const a=s.getAttribute("id");t.sources[a]=this.parseSource(s);break;case"joints":t.joints=this.parseJoints(s);break;case"vertex_weights":t.vertexWeights=this.parseVertexWeights(s);break}}return t}parseJoints(e){const t={inputs:{}};for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"input":const a=s.getAttribute("semantic"),o=Ct(s.getAttribute("source"));t.inputs[a]=o;break}}return t}parseVertexWeights(e){const t={inputs:{}};for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"input":const a=s.getAttribute("semantic"),o=Ct(s.getAttribute("source")),c=parseInt(s.getAttribute("offset"));t.inputs[a]={id:o,offset:c};break;case"vcount":t.vcount=ur(s.textContent);break;case"v":t.v=ur(s.textContent);break}}return t}parseImage(e){const t={init_from:Jt(e,"init_from")[0].textContent};this.library.images[e.getAttribute("id")]=t}parseEffect(e){const t={};for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"profile_COMMON":t.profile=this.parseEffectProfileCOMMON(s);break}}this.library.effects[e.getAttribute("id")]=t}parseEffectProfileCOMMON(e){const t={surfaces:{},samplers:{}};for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"newparam":this.parseEffectNewparam(s,t);break;case"technique":t.technique=this.parseEffectTechnique(s);break;case"extra":t.extra=this.parseEffectExtra(s);break}}return t}parseEffectNewparam(e,t){const i=e.getAttribute("sid");for(let n=0,s=e.childNodes.length;n<s;n++){const a=e.childNodes[n];if(a.nodeType===1)switch(a.nodeName){case"surface":t.surfaces[i]=this.parseEffectSurface(a);break;case"sampler2D":t.samplers[i]=this.parseEffectSampler(a);break}}}parseEffectSurface(e){const t={};for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"init_from":t.init_from=s.textContent;break}}return t}parseEffectSampler(e){const t={};for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"source":t.source=s.textContent;break}}return t}parseEffectTechnique(e){const t={};for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"constant":case"lambert":case"blinn":case"phong":t.type=s.nodeName,t.parameters=this.parseEffectParameters(s);break;case"extra":t.extra=this.parseEffectExtra(s);break}}return t}parseEffectParameters(e){const t={};for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"emission":case"diffuse":case"specular":case"bump":case"ambient":case"shininess":case"transparency":t[s.nodeName]=this.parseEffectParameter(s);break;case"transparent":t[s.nodeName]={opaque:s.hasAttribute("opaque")?s.getAttribute("opaque"):"A_ONE",data:this.parseEffectParameter(s)};break}}return t}parseEffectParameter(e){const t={};for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"color":t[s.nodeName]=Gt(s.textContent);break;case"float":t[s.nodeName]=parseFloat(s.textContent);break;case"texture":t[s.nodeName]={id:s.getAttribute("texture"),extra:this.parseEffectParameterTexture(s)};break}}return t}parseEffectParameterTexture(e){const t={technique:{}};for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"extra":this.parseEffectParameterTextureExtra(s,t);break}}return t}parseEffectParameterTextureExtra(e,t){for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"technique":this.parseEffectParameterTextureExtraTechnique(s,t);break}}}parseEffectParameterTextureExtraTechnique(e,t){for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"repeatU":case"repeatV":case"offsetU":case"offsetV":t.technique[s.nodeName]=parseFloat(s.textContent);break;case"wrapU":case"wrapV":s.textContent.toUpperCase()==="TRUE"?t.technique[s.nodeName]=1:s.textContent.toUpperCase()==="FALSE"?t.technique[s.nodeName]=0:t.technique[s.nodeName]=parseInt(s.textContent);break;case"bump":t[s.nodeName]=this.parseEffectExtraTechniqueBump(s);break}}}parseEffectExtra(e){const t={};for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"technique":t.technique=this.parseEffectExtraTechnique(s);break}}return t}parseEffectExtraTechnique(e){const t={};for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"double_sided":t[s.nodeName]=parseInt(s.textContent);break;case"bump":t[s.nodeName]=this.parseEffectExtraTechniqueBump(s);break}}return t}parseEffectExtraTechniqueBump(e){const t={};for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"texture":t[s.nodeName]={id:s.getAttribute("texture"),texcoord:s.getAttribute("texcoord"),extra:this.parseEffectParameterTexture(s)};break}}return t}parseMaterial(e){const t={name:e.getAttribute("name")};for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"instance_effect":t.url=Ct(s.getAttribute("url"));break}}this.library.materials[e.getAttribute("id")]=t}parseCamera(e){const t={name:e.getAttribute("name")};for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"optics":t.optics=this.parseCameraOptics(s);break}}this.library.cameras[e.getAttribute("id")]=t}parseCameraOptics(e){for(let t=0;t<e.childNodes.length;t++){const i=e.childNodes[t];switch(i.nodeName){case"technique_common":return this.parseCameraTechnique(i)}}return{}}parseCameraTechnique(e){const t={};for(let i=0;i<e.childNodes.length;i++){const n=e.childNodes[i];switch(n.nodeName){case"perspective":case"orthographic":t.technique=n.nodeName,t.parameters=this.parseCameraParameters(n);break}}return t}parseCameraParameters(e){const t={};for(let i=0;i<e.childNodes.length;i++){const n=e.childNodes[i];switch(n.nodeName){case"xfov":case"yfov":case"xmag":case"ymag":case"znear":case"zfar":case"aspect_ratio":t[n.nodeName]=parseFloat(n.textContent);break}}return t}parseLight(e){let t={};for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"technique_common":t=this.parseLightTechnique(s);break}}this.library.lights[e.getAttribute("id")]=t}parseLightTechnique(e){const t={};for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"directional":case"point":case"spot":case"ambient":t.technique=s.nodeName,t.parameters=this.parseLightParameters(s);break}}return t}parseLightParameters(e){const t={};for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"color":const a=Gt(s.textContent);t.color=new Be().fromArray(a),Xe.colorSpaceToWorking(t.color,lt);break;case"falloff_angle":t.falloffAngle=parseFloat(s.textContent);break;case"quadratic_attenuation":const o=parseFloat(s.textContent);t.distance=o?Math.sqrt(1/o):0;break}}return t}parseGeometry(e){const t={name:e.getAttribute("name"),sources:{},vertices:{},primitives:[]},i=Jt(e,"mesh")[0];if(i!==void 0){for(let n=0;n<i.childNodes.length;n++){const s=i.childNodes[n];if(s.nodeType!==1)continue;const a=s.getAttribute("id");switch(s.nodeName){case"source":t.sources[a]=this.parseSource(s);break;case"vertices":t.vertices=this.parseGeometryVertices(s);break;case"polygons":case"lines":case"linestrips":case"polylist":case"triangles":t.primitives.push(this.parseGeometryPrimitive(s));break}}this.library.geometries[e.getAttribute("id")]=t}}parseSource(e){const t={array:[],stride:3};for(let i=0;i<e.childNodes.length;i++){const n=e.childNodes[i];if(n.nodeType===1)switch(n.nodeName){case"float_array":t.array=Gt(n.textContent);break;case"Name_array":t.array=z0(n.textContent);break;case"technique_common":const s=Jt(n,"accessor")[0];s!==void 0&&(t.stride=parseInt(s.getAttribute("stride")));break}}return t}parseGeometryVertices(e){const t={};for(let i=0;i<e.childNodes.length;i++){const n=e.childNodes[i];n.nodeType===1&&(t[n.getAttribute("semantic")]=Ct(n.getAttribute("source")))}return t}parseGeometryPrimitive(e){const t={type:e.nodeName,material:e.getAttribute("material"),count:parseInt(e.getAttribute("count")),inputs:{},stride:0,hasUV:!1};for(let i=0,n=e.childNodes.length;i<n;i++){const s=e.childNodes[i];if(s.nodeType===1)switch(s.nodeName){case"input":const a=Ct(s.getAttribute("source")),o=s.getAttribute("semantic"),c=parseInt(s.getAttribute("offset")),l=parseInt(s.getAttribute("set")),h=l>0?o+l:o;t.inputs[h]={id:a,offset:c},t.stride=Math.max(t.stride,c+1),o==="TEXCOORD"&&(t.hasUV=!0);break;case"vcount":t.vcount=ur(s.textContent);break;case"p":t.p=ur(s.textContent);break}}return t.type==="polygons"&&(t.vcount=[t.p.length/t.stride]),t}parseLibraryJoint(e){this.library.joints[e.getAttribute("id")]=this.parseKinematicsJoint(e)}parseKinematicsModel(e){const t={name:e.getAttribute("name")||"",joints:{},links:[]};for(let i=0;i<e.childNodes.length;i++){const n=e.childNodes[i];if(n.nodeType===1)switch(n.nodeName){case"technique_common":this.parseKinematicsTechniqueCommon(n,t);break}}this.library.kinematicsModels[e.getAttribute("id")]=t}parseKinematicsTechniqueCommon(e,t){for(let i=0;i<e.childNodes.length;i++){const n=e.childNodes[i];if(n.nodeType===1)switch(n.nodeName){case"joint":t.joints[n.getAttribute("sid")]=this.parseKinematicsJoint(n);break;case"instance_joint":t.joints[n.getAttribute("sid")]=this.library.joints[Ct(n.getAttribute("url"))];break;case"link":t.links.push(this.parseKinematicsLink(n));break}}}parseKinematicsJoint(e){let t;for(let i=0;i<e.childNodes.length;i++){const n=e.childNodes[i];if(n.nodeType===1)switch(n.nodeName){case"prismatic":case"revolute":t=this.parseKinematicsJointParameter(n);break}}return t}parseKinematicsJointParameter(e){const t={sid:e.getAttribute("sid"),name:e.getAttribute("name")||"",axis:new D,limits:{min:0,max:0},type:e.nodeName,static:!1,zeroPosition:0,middlePosition:0};for(let i=0;i<e.childNodes.length;i++){const n=e.childNodes[i];if(n.nodeType===1)switch(n.nodeName){case"axis":const s=Gt(n.textContent);t.axis.fromArray(s);break;case"limits":const a=n.getElementsByTagName("max")[0],o=n.getElementsByTagName("min")[0];t.limits.max=parseFloat(a.textContent),t.limits.min=parseFloat(o.textContent);break}}return t.limits.min>=t.limits.max&&(t.static=!0),t.middlePosition=(t.limits.min+t.limits.max)/2,t}parseKinematicsLink(e){const t={sid:e.getAttribute("sid"),name:e.getAttribute("name")||"",attachments:[],transforms:[]};for(let i=0;i<e.childNodes.length;i++){const n=e.childNodes[i];if(n.nodeType===1)switch(n.nodeName){case"attachment_full":t.attachments.push(this.parseKinematicsAttachment(n));break;case"matrix":case"translate":case"rotate":t.transforms.push(this.parseKinematicsTransform(n));break}}return t}parseKinematicsAttachment(e){const t={joint:e.getAttribute("joint").split("/").pop(),transforms:[],links:[]};for(let i=0;i<e.childNodes.length;i++){const n=e.childNodes[i];if(n.nodeType===1)switch(n.nodeName){case"link":t.links.push(this.parseKinematicsLink(n));break;case"matrix":case"translate":case"rotate":t.transforms.push(this.parseKinematicsTransform(n));break}}return t}parseKinematicsTransform(e){const t={type:e.nodeName},i=Gt(e.textContent);switch(t.type){case"matrix":t.obj=new Oe,t.obj.fromArray(i).transpose();break;case"translate":t.obj=new D,t.obj.fromArray(i);break;case"rotate":t.obj=new D,t.obj.fromArray(i),t.angle=xi.degToRad(i[3]);break}return t}parsePhysicsModel(e){const t={name:e.getAttribute("name")||"",rigidBodies:{}};for(let i=0;i<e.childNodes.length;i++){const n=e.childNodes[i];if(n.nodeType===1)switch(n.nodeName){case"rigid_body":t.rigidBodies[n.getAttribute("name")]={},this.parsePhysicsRigidBody(n,t.rigidBodies[n.getAttribute("name")]);break}}this.library.physicsModels[e.getAttribute("id")]=t}parsePhysicsRigidBody(e,t){for(let i=0;i<e.childNodes.length;i++){const n=e.childNodes[i];if(n.nodeType===1)switch(n.nodeName){case"technique_common":this.parsePhysicsTechniqueCommon(n,t);break}}}parsePhysicsTechniqueCommon(e,t){for(let i=0;i<e.childNodes.length;i++){const n=e.childNodes[i];if(n.nodeType===1)switch(n.nodeName){case"inertia":t.inertia=Gt(n.textContent);break;case"mass":t.mass=Gt(n.textContent)[0];break}}}parseKinematicsScene(e){const t={bindJointAxis:[]};for(let i=0;i<e.childNodes.length;i++){const n=e.childNodes[i];if(n.nodeType===1)switch(n.nodeName){case"bind_joint_axis":t.bindJointAxis.push(this.parseKinematicsBindJointAxis(n));break}}this.library.kinematicsScenes[Ct(e.getAttribute("url"))]=t}parseKinematicsBindJointAxis(e){const t={target:e.getAttribute("target").split("/").pop()};for(let i=0;i<e.childNodes.length;i++){const n=e.childNodes[i];if(n.nodeType===1)switch(n.nodeName){case"axis":const s=n.getElementsByTagName("param")[0];t.axis=s.textContent;const a=t.axis.split("inst_").pop().split("axis")[0];t.jointIndex=a.substring(0,a.length-1);break}}return t}prepareNodes(e){const t=e.getElementsByTagName("node");for(let i=0;i<t.length;i++){const n=t[i];n.hasAttribute("id")===!1&&n.setAttribute("id",this.generateId())}}parseNode(e){const t=new Oe,i=new D,n={name:e.getAttribute("name")||"",type:e.getAttribute("type"),id:e.getAttribute("id"),sid:e.getAttribute("sid"),matrix:new Oe,nodes:[],instanceCameras:[],instanceControllers:[],instanceLights:[],instanceGeometries:[],instanceNodes:[],transforms:{},transformData:{},transformOrder:[]};for(let s=0;s<e.childNodes.length;s++){const a=e.childNodes[s];if(a.nodeType!==1)continue;let o;switch(a.nodeName){case"node":n.nodes.push(a.getAttribute("id")),this.parseNode(a);break;case"instance_camera":n.instanceCameras.push(Ct(a.getAttribute("url")));break;case"instance_controller":n.instanceControllers.push(this.parseNodeInstance(a));break;case"instance_light":n.instanceLights.push(Ct(a.getAttribute("url")));break;case"instance_geometry":n.instanceGeometries.push(this.parseNodeInstance(a));break;case"instance_node":n.instanceNodes.push(Ct(a.getAttribute("url")));break;case"matrix":o=Gt(a.textContent),n.matrix.multiply(t.fromArray(o).transpose());{const c=a.getAttribute("sid");n.transforms[c]=a.nodeName,n.transformData[c]={type:"matrix",array:o},n.transformOrder.push(c)}break;case"translate":o=Gt(a.textContent),i.fromArray(o),n.matrix.multiply(t.makeTranslation(i.x,i.y,i.z));{const c=a.getAttribute("sid");n.transforms[c]=a.nodeName,n.transformData[c]={type:"translate",x:o[0],y:o[1],z:o[2]},n.transformOrder.push(c)}break;case"rotate":o=Gt(a.textContent);{const c=xi.degToRad(o[3]);n.matrix.multiply(t.makeRotationAxis(i.fromArray(o),c));const l=a.getAttribute("sid");n.transforms[l]=a.nodeName,n.transformData[l]={type:"rotate",axis:[o[0],o[1],o[2]],angle:o[3]},n.transformOrder.push(l)}break;case"scale":o=Gt(a.textContent),n.matrix.scale(i.fromArray(o));{const c=a.getAttribute("sid");n.transforms[c]=a.nodeName,n.transformData[c]={type:"scale",x:o[0],y:o[1],z:o[2]},n.transformOrder.push(c)}break}}return this.hasNode(n.id)?console.warn("THREE.ColladaLoader: There is already a node with ID %s. Exclude current node from further processing.",n.id):this.library.nodes[n.id]=n,n}parseNodeInstance(e){const t={id:Ct(e.getAttribute("url")),materials:{},skeletons:[]};for(let i=0;i<e.childNodes.length;i++){const n=e.childNodes[i];switch(n.nodeName){case"bind_material":const s=n.getElementsByTagName("instance_material");for(let a=0;a<s.length;a++){const o=s[a],c=o.getAttribute("symbol"),l=o.getAttribute("target");t.materials[c]=Ct(l)}break;case"skeleton":t.skeletons.push(Ct(n.textContent));break}}return t}parseVisualScene(e){const t={name:e.getAttribute("name"),children:[]};this.prepareNodes(e);const i=Jt(e,"node");for(let n=0;n<i.length;n++)t.children.push(this.parseNode(i[n]));this.library.visualScenes[e.getAttribute("id")]=t}hasNode(e){return this.library.nodes[e]!==void 0}}class G0{constructor(e,t,i,n){this.library=e,this.collada=t,this.textureLoader=i,this.tgaLoader=n,this.tempColor=new Be,this.animations=[],this.kinematics={},this.position=new D,this.scale=new D,this.quaternion=new Pt,this.matrix=new Oe,this.deferredPivotAnimations={},this.transformNodes={}}compose(){const e=this.library;this.buildLibrary(e.animations,this.buildAnimation.bind(this)),this.buildLibrary(e.clips,this.buildAnimationClip.bind(this)),this.buildLibrary(e.controllers,this.buildController.bind(this)),this.buildLibrary(e.images,this.buildImage.bind(this)),this.buildLibrary(e.effects,this.buildEffect.bind(this)),this.buildLibrary(e.materials,this.buildMaterial.bind(this)),this.buildLibrary(e.cameras,this.buildCamera.bind(this)),this.buildLibrary(e.lights,this.buildLight.bind(this)),this.buildLibrary(e.geometries,this.buildGeometry.bind(this)),this.buildLibrary(e.visualScenes,this.buildVisualScene.bind(this)),this.setupAnimations(),this.setupKinematics();const t=this.parseScene(Jt(this.collada,"scene")[0]);return t.animations=this.animations,{scene:t,animations:this.animations,kinematics:this.kinematics}}buildLibrary(e,t){for(const i in e){const n=e[i];n.build=t(e[i])}}getBuild(e,t){return e.build!==void 0||(e.build=t(e)),e.build}isEmpty(e){return Object.keys(e).length===0}buildAnimation(e){const t=[],i=e.channels,n=e.samplers,s=e.sources,a=this.aggregateAnimationChannels(i,n,s);for(const o in a){const c=this.library.nodes[o];if(!c)continue;const l=a[o];if(this.hasPivotTransforms(c))this.collectDeferredPivotAnimation(o,l);else{const h=this.getNode(o);let d=!1;for(const u in l){const f=c.transforms[u],g=c.transformData[u],v=l[u];switch(f){case"matrix":this.buildMatrixTracks(h,v,c,t);break;case"translate":this.buildTranslateTrack(h,v,g,t);break;case"rotate":d||(this.buildRotateTrack(h,u,v,g,c,t),d=!0);break;case"scale":this.buildScaleTrack(h,v,g,t);break}}}}return t}collectDeferredPivotAnimation(e,t){this.deferredPivotAnimations[e]||(this.deferredPivotAnimations[e]={});const i=this.deferredPivotAnimations[e];for(const n in t){i[n]||(i[n]={});for(const s in t[n])i[n][s]=t[n][s]}}hasPivotTransforms(e){const t=["rotatePivot","rotatePivotInverse","rotatePivotTranslation","scalePivot","scalePivotInverse","scalePivotTranslation"];for(const i of t)if(e.transforms[i]!==void 0)return!0;return!1}getAnimation(e){return this.getBuild(this.library.animations[e],this.buildAnimation.bind(this))}aggregateAnimationChannels(e,t,i){const n={};for(const s in e){if(!e.hasOwnProperty(s))continue;const a=e[s],o=t[a.sampler],c=o.inputs.INPUT,l=o.inputs.OUTPUT,h=i[c],d=i[l],u=o.inputs.INTERPOLATION,f=o.inputs.IN_TANGENT,g=o.inputs.OUT_TANGENT,v=u?i[u]:null,m=f?i[f]:null,p=g?i[g]:null,M=a.id,T=a.sid,y=a.member||"default";n[M]||(n[M]={}),n[M][T]||(n[M][T]={}),n[M][T][y]={times:h.array,values:d.array,stride:d.stride,arraySyntax:a.arraySyntax,indices:a.indices,interpolation:v?v.array:null,inTangent:m?m.array:null,outTangent:p?p.array:null,inTangentStride:m?m.stride:0,outTangentStride:p?p.stride:0}}return n}buildMatrixTracks(e,t,i,n){const s=i.matrix.clone().transpose(),a={};for(const l in t){const h=t[l],d=h.times,u=h.values,f=h.stride;for(let g=0,v=d.length;g<v;g++){const m=d[g],p=g*f;if(a[m]===void 0&&(a[m]={}),h.arraySyntax===!0){const M=u[p],T=h.indices[0]+4*h.indices[1];a[m][T]=M}else for(let M=0;M<f;M++)a[m][M]=u[p+M]}}const o=this.prepareAnimationData(a,s),c={name:e.uuid,keyframes:o};this.createKeyframeTracks(c,n)}buildTranslateTrack(e,t,i,n){if(t.default&&t.default.stride===3){const l=t.default,h=Array.from(l.times),d=Array.from(l.values),u=new ni(e.uuid+".position",h,d),f=this.getInterpolationInfo(t);this.applyInterpolation(u,f,t),n.push(u);return}const s=this.getTimesForAllAxes(t);if(s.length===0)return;const a=[],o=this.getInterpolationInfo(t);for(let l=0;l<s.length;l++){const h=s[l],d=this.getValueAtTime(t.X,h,i.x),u=this.getValueAtTime(t.Y,h,i.y),f=this.getValueAtTime(t.Z,h,i.z);a.push(d,u,f)}const c=new ni(e.uuid+".position",s,a);this.applyInterpolation(c,o),n.push(c)}buildRotateTrack(e,t,i,n,s,a){const o=i.ANGLE||i.default;if(!o)return;const c=Array.from(o.times);if(c.length===0)return;const l=[];for(const m of s.transformOrder)if(s.transforms[m]==="rotate"){const M=s.transformData[m];l.push({sid:m,axis:new D(M.axis[0],M.axis[1],M.axis[2]),defaultAngle:M.angle})}const h=new Pt,d=new Pt,u=new Pt,f=[],g=this.getInterpolationInfo(i);for(let m=0;m<c.length;m++){const p=c[m];h.identity();for(const M of l){let T;M.sid===t?T=this.getValueAtTime(o,p,M.defaultAngle):T=M.defaultAngle;const y=xi.degToRad(T);u.setFromAxisAngle(M.axis,y),h.multiply(u)}m>0&&d.dot(h)<0&&(h.x=-h.x,h.y=-h.y,h.z=-h.z,h.w=-h.w),d.copy(h),f.push(h.x,h.y,h.z,h.w)}const v=new Xn(e.uuid+".quaternion",c,f);this.applyInterpolation(v,g),a.push(v)}buildScaleTrack(e,t,i,n){if(t.default&&t.default.stride===3){const l=t.default,h=Array.from(l.times),d=Array.from(l.values),u=new ni(e.uuid+".scale",h,d),f=this.getInterpolationInfo(t);this.applyInterpolation(u,f,t),n.push(u);return}const s=this.getTimesForAllAxes(t);if(s.length===0)return;const a=[],o=this.getInterpolationInfo(t);for(let l=0;l<s.length;l++){const h=s[l],d=this.getValueAtTime(t.X,h,i.x),u=this.getValueAtTime(t.Y,h,i.y),f=this.getValueAtTime(t.Z,h,i.z);a.push(d,u,f)}const c=new ni(e.uuid+".scale",s,a);this.applyInterpolation(c,o),n.push(c)}getTimesForAllAxes(e){let t=[];return e.X&&(t=t.concat(Array.from(e.X.times))),e.Y&&(t=t.concat(Array.from(e.Y.times))),e.Z&&(t=t.concat(Array.from(e.Z.times))),e.ANGLE&&(t=t.concat(Array.from(e.ANGLE.times))),e.default&&(t=t.concat(Array.from(e.default.times))),t=[...new Set(t)].sort((i,n)=>i-n),t}getValueAtTime(e,t,i){if(!e)return i;const n=e.times,s=e.values,a=e.interpolation;for(let o=0;o<n.length;o++){if(n[o]===t)return s[o];if(n[o]>t){if(o===0)return s[0];const c=o-1,l=o,h=n[c],d=n[l],u=s[c],f=s[l],g=a?a[c]:"LINEAR";if(g==="STEP")return u;if(g==="BEZIER"&&e.inTangent&&e.outTangent)return this.evaluateBezierComponent(e,c,l,h,d,t);{const v=(t-h)/(d-h);return u+v*(f-u)}}}return s[s.length-1]}evaluateBezierComponent(e,t,i,n,s,a){const o=e.values,c=e.inTangent,l=e.outTangent,h=e.inTangentStride||1,d=o[t],u=o[i];let f,g,v,m;h===2?(f=l[t*2],g=l[t*2+1],v=c[i*2],m=c[i*2+1]):(f=n+(s-n)/3,g=l[t],v=s-(s-n)/3,m=c[i]);let p=(a-n)/(s-n);for(let A=0;A<8;A++){const _=p*p,S=_*p,P=1-p,R=P*P,H=R*P*n+3*R*p*f+3*P*_*v+S*s,K=3*R*(f-n)+6*P*p*(v-f)+3*_*(s-v);if(Math.abs(K)<1e-10)break;const F=H-a;if(Math.abs(F)<1e-10)break;p=p-F/K,p=Math.max(0,Math.min(1,p))}const M=p*p,T=M*p,y=1-p,E=y*y;return E*y*d+3*E*p*g+3*y*M*m+T*u}getInterpolationInfo(e){const t=["X","Y","Z","ANGLE","default"];let i=null,n=!0;for(const s of t){const a=e[s];if(!a||!a.interpolation)continue;const o=a.interpolation;for(let c=0;c<o.length;c++){const l=o[c];i===null?i=l:l!==i&&(n=!1)}}return{type:i||"LINEAR",uniform:n}}applyInterpolation(e,t,i=null){if(t.type==="STEP"&&t.uniform)e.setInterpolation(Ts);else if(t.type==="BEZIER"&&t.uniform&&i){const n=i.default;n&&n.inTangent&&n.outTangent&&(e.setInterpolation(Co),e.settings={inTangents:new Float32Array(n.inTangent),outTangents:new Float32Array(n.outTangent)})}}prepareAnimationData(e,t){const i=[];for(const n in e)i.push({time:parseFloat(n),value:e[n]});i.sort((n,s)=>n.time-s.time);for(let n=0;n<16;n++)this.transformAnimationData(i,n,t.elements[n]);return i}createKeyframeTracks(e,t){const i=e.keyframes,n=e.name,s=[],a=[],o=[],c=[],l=this.position,h=this.quaternion,d=this.scale,u=this.matrix;for(let f=0,g=i.length;f<g;f++){const v=i[f],m=v.time,p=v.value;u.fromArray(p).transpose(),u.decompose(l,h,d),s.push(m),a.push(l.x,l.y,l.z),o.push(h.x,h.y,h.z,h.w),c.push(d.x,d.y,d.z)}return a.length>0&&t.push(new ni(n+".position",s,a)),o.length>0&&t.push(new Xn(n+".quaternion",s,o)),c.length>0&&t.push(new ni(n+".scale",s,c)),t}transformAnimationData(e,t,i){let n,s=!0,a,o;for(a=0,o=e.length;a<o;a++)n=e[a],n.value[t]===void 0?n.value[t]=null:s=!1;if(s===!0)for(a=0,o=e.length;a<o;a++)n=e[a],n.value[t]=i;else this.createMissingKeyframes(e,t)}createMissingKeyframes(e,t){let i,n;for(let s=0,a=e.length;s<a;s++){const o=e[s];if(o.value[t]===null){if(i=this.getPrev(e,s,t),n=this.getNext(e,s,t),i===null){o.value[t]=n.value[t];continue}if(n===null){o.value[t]=i.value[t];continue}this.interpolate(o,i,n,t)}}}getPrev(e,t,i){for(;t>=0;){const n=e[t];if(n.value[i]!==null)return n;t--}return null}getNext(e,t,i){for(;t<e.length;){const n=e[t];if(n.value[i]!==null)return n;t++}return null}interpolate(e,t,i,n){if(i.time-t.time===0){e.value[n]=t.value[n];return}e.value[n]=(e.time-t.time)*(i.value[n]-t.value[n])/(i.time-t.time)+t.value[n]}buildAnimationClip(e){const t=[],i=e.name,n=e.end-e.start||-1,s=e.animations;for(let a=0,o=s.length;a<o;a++){const c=this.getAnimation(s[a]);for(let l=0,h=c.length;l<h;l++)t.push(c[l])}return new ac(i,n,t)}getAnimationClip(e){return this.getBuild(this.library.clips[e],this.buildAnimationClip.bind(this))}buildController(e){const t={id:e.id},i=this.library.geometries[t.id];return e.skin!==void 0&&(t.skin=this.buildSkin(e.skin),i.sources.skinIndices=t.skin.indices,i.sources.skinWeights=t.skin.weights),t}buildSkin(e){const i={joints:[],indices:{array:[],stride:4},weights:{array:[],stride:4}},n=e.sources,s=e.vertexWeights,a=s.vcount,o=s.v,c=s.inputs.JOINT.offset,l=s.inputs.WEIGHT.offset,h=e.sources[e.joints.inputs.JOINT],d=e.sources[e.joints.inputs.INV_BIND_MATRIX],u=n[s.inputs.WEIGHT.id].array;let f=0,g,v,m;for(g=0,m=a.length;g<m;g++){const M=a[g],T=[];for(v=0;v<M;v++){const y=o[f+c],E=o[f+l],w=u[E];T.push({index:y,weight:w}),f+=2}for(T.sort(p),v=0;v<4;v++){const y=T[v];y!==void 0?(i.indices.array.push(y.index),i.weights.array.push(y.weight)):(i.indices.array.push(0),i.weights.array.push(0))}}for(e.bindShapeMatrix?i.bindMatrix=new Oe().fromArray(e.bindShapeMatrix).transpose():i.bindMatrix=new Oe().identity(),g=0,m=h.array.length;g<m;g++){const M=h.array[g],T=new Oe().fromArray(d.array,g*d.stride).transpose();i.joints.push({name:M,boneInverse:T})}return i;function p(M,T){return T.weight-M.weight}}getController(e){return this.getBuild(this.library.controllers[e],this.buildController.bind(this))}buildImage(e){return e.build!==void 0?e.build:e.init_from}getImage(e){const t=this.library.images[e];return t!==void 0?this.getBuild(t,this.buildImage.bind(this)):(console.warn("THREE.ColladaLoader: Couldn't find image with ID:",e),null)}buildEffect(e){return e}getEffect(e){return this.getBuild(this.library.effects[e],this.buildEffect.bind(this))}getTextureLoader(e){let t,i=e.slice((e.lastIndexOf(".")-1>>>0)+2);switch(i=i.toLowerCase(),i){case"tga":t=this.tgaLoader;break;default:t=this.textureLoader}return t}buildMaterial(e){const t=this.getEffect(e.url),i=t.profile.technique;let n;switch(i.type){case"phong":case"blinn":n=new bs;break;case"lambert":n=new tf;break;default:n=new Pr;break}n.name=e.name||"";const s=this;function a(h,d=null){const u=t.profile.samplers[h.id];let f=null;if(u!==void 0){const g=t.profile.surfaces[u.source];f=s.getImage(g.init_from)}else console.warn("THREE.ColladaLoader: Undefined sampler. Access image directly (see #12530)."),f=s.getImage(h.id);if(f!==null){const g=s.getTextureLoader(f);if(g!==void 0){const v=g.load(f),m=h.extra;if(m!==void 0&&m.technique!==void 0&&s.isEmpty(m.technique)===!1){const p=m.technique;v.wrapS=p.wrapU?pn:Qt,v.wrapT=p.wrapV?pn:Qt,v.offset.set(p.offsetU||0,p.offsetV||0),v.repeat.set(p.repeatU||1,p.repeatV||1)}else v.wrapS=pn,v.wrapT=pn;return d!==null&&(v.colorSpace=d),v}else return console.warn("THREE.ColladaLoader: Loader for texture %s not found.",f),null}else return console.warn("THREE.ColladaLoader: Couldn't create texture with ID:",h.id),null}const o=i.parameters;for(const h in o){const d=o[h];switch(h){case"diffuse":d.color&&n.color.fromArray(d.color),d.texture&&(n.map=a(d.texture,lt));break;case"specular":d.color&&n.specular&&n.specular.fromArray(d.color),d.texture&&(n.specularMap=a(d.texture));break;case"bump":d.texture&&(n.normalMap=a(d.texture));break;case"ambient":d.texture&&(n.lightMap=a(d.texture,lt));break;case"shininess":d.float&&n.shininess&&(n.shininess=d.float);break;case"emission":d.color&&n.emissive&&n.emissive.fromArray(d.color),d.texture&&(n.emissiveMap=a(d.texture,lt));break}}Xe.colorSpaceToWorking(n.color,lt),n.specular&&Xe.colorSpaceToWorking(n.specular,lt),n.emissive&&Xe.colorSpaceToWorking(n.emissive,lt);let c=o.transparent,l=o.transparency;if(l===void 0&&c&&(l={float:1}),c===void 0&&l&&(c={opaque:"A_ONE",data:{color:[1,1,1,1]}}),c&&l)if(c.data.texture)n.transparent=!0;else{const h=c.data.color;switch(c.opaque){case"A_ONE":n.opacity=h[3]*l.float;break;case"RGB_ZERO":n.opacity=1-h[0]*l.float;break;case"A_ZERO":n.opacity=1-h[3]*l.float;break;case"RGB_ONE":n.opacity=h[0]*l.float;break;default:console.warn('THREE.ColladaLoader: Invalid opaque type "%s" of transparent tag.',c.opaque)}n.opacity<1&&(n.transparent=!0)}if(i.extra!==void 0&&i.extra.technique!==void 0){const h=i.extra.technique;for(const d in h){const u=h[d];switch(d){case"double_sided":n.side=u===1?yi:Fi;break;case"bump":n.normalMap=a(u.texture),n.normalScale=new De(1,1);break}}}return n}getMaterial(e){return this.getBuild(this.library.materials[e],this.buildMaterial.bind(this))}buildCamera(e){let t;switch(e.optics.technique){case"perspective":t=new Ft(e.optics.parameters.yfov,e.optics.parameters.aspect_ratio,e.optics.parameters.znear,e.optics.parameters.zfar);break;case"orthographic":let i=e.optics.parameters.ymag,n=e.optics.parameters.xmag;const s=e.optics.parameters.aspect_ratio;n=n===void 0?i*s:n,i=i===void 0?n/s:i,n*=.5,i*=.5,t=new qr(-n,n,i,-i,e.optics.parameters.znear,e.optics.parameters.zfar);break;default:t=new Ft;break}return t.name=e.name||"",t}getCamera(e){const t=this.library.cameras[e];return t!==void 0?this.getBuild(t,this.buildCamera.bind(this)):(console.warn("THREE.ColladaLoader: Couldn't find camera with ID:",e),null)}buildLight(e){let t;switch(e.technique){case"directional":t=new Uh;break;case"point":t=new Mf;break;case"spot":t=new yf;break;case"ambient":t=new Ef;break}return e.parameters.color&&t.color.copy(e.parameters.color),e.parameters.distance&&(t.distance=e.parameters.distance),e.parameters.falloffAngle&&(t.angle=xi.degToRad(e.parameters.falloffAngle)),t}getLight(e){const t=this.library.lights[e];return t!==void 0?this.getBuild(t,this.buildLight.bind(this)):(console.warn("THREE.ColladaLoader: Couldn't find light with ID:",e),null)}groupPrimitives(e){const t={};for(let i=0;i<e.length;i++){const n=e[i];t[n.type]===void 0&&(t[n.type]=[]),t[n.type].push(n)}return t}checkUVCoordinates(e){let t=0;for(let i=0,n=e.length;i<n;i++)e[i].hasUV===!0&&t++;t>0&&t<e.length&&(e.uvsNeedsFix=!0)}buildGeometry(e){const t={},i=e.sources,n=e.vertices,s=e.primitives;if(s.length===0)return{};const a=this.groupPrimitives(s);for(const o in a){const c=a[o];this.checkUVCoordinates(c),t[o]=this.buildGeometryType(c,i,n)}return t}buildGeometryType(e,t,i){const n={},s={array:[],stride:0},a={array:[],stride:0},o={array:[],stride:0},c={array:[],stride:0},l={array:[],stride:0},h={array:[],stride:4},d={array:[],stride:4},u=new kt,f=[];let g=0;for(let v=0;v<e.length;v++){const m=e[v],p=m.inputs;let M=0;switch(m.type){case"lines":case"linestrips":M=m.count*2;break;case"triangles":M=m.count*3;break;case"polygons":case"polylist":for(let T=0;T<m.count;T++){const y=m.vcount[T];switch(y){case 3:M+=3;break;case 4:M+=6;break;default:M+=(y-2)*3;break}}break;default:console.warn("THREE.ColladaLoader: Unknown primitive type:",m.type)}u.addGroup(g,M,v),g+=M,m.material&&f.push(m.material);for(const T in p){const y=p[T];switch(T){case"VERTEX":for(const E in i){const w=i[E];switch(E){case"POSITION":const A=s.array.length;if(this.buildGeometryData(m,t[w],y.offset,s.array),s.stride=t[w].stride,t.skinWeights&&t.skinIndices&&(this.buildGeometryData(m,t.skinIndices,y.offset,h.array),this.buildGeometryData(m,t.skinWeights,y.offset,d.array)),m.hasUV===!1&&e.uvsNeedsFix===!0){const _=(s.array.length-A)/s.stride;for(let S=0;S<_;S++)o.array.push(0,0)}break;case"NORMAL":this.buildGeometryData(m,t[w],y.offset,a.array),a.stride=t[w].stride;break;case"COLOR":this.buildGeometryData(m,t[w],y.offset,l.array),l.stride=t[w].stride;break;case"TEXCOORD":this.buildGeometryData(m,t[w],y.offset,o.array),o.stride=t[w].stride;break;case"TEXCOORD1":this.buildGeometryData(m,t[w],y.offset,c.array),o.stride=t[w].stride;break;default:console.warn('THREE.ColladaLoader: Semantic "%s" not handled in geometry build process.',E)}}break;case"NORMAL":this.buildGeometryData(m,t[y.id],y.offset,a.array),a.stride=t[y.id].stride;break;case"COLOR":this.buildGeometryData(m,t[y.id],y.offset,l.array,!0),l.stride=t[y.id].stride;break;case"TEXCOORD":this.buildGeometryData(m,t[y.id],y.offset,o.array),o.stride=t[y.id].stride;break;case"TEXCOORD1":this.buildGeometryData(m,t[y.id],y.offset,c.array),c.stride=t[y.id].stride;break}}}return s.array.length>0&&u.setAttribute("position",new tt(s.array,s.stride)),a.array.length>0&&u.setAttribute("normal",new tt(a.array,a.stride)),l.array.length>0&&u.setAttribute("color",new tt(l.array,l.stride)),o.array.length>0&&u.setAttribute("uv",new tt(o.array,o.stride)),c.array.length>0&&u.setAttribute("uv1",new tt(c.array,c.stride)),h.array.length>0&&u.setAttribute("skinIndex",new tt(h.array,h.stride)),d.array.length>0&&u.setAttribute("skinWeight",new tt(d.array,d.stride)),n.data=u,n.type=e[0].type,n.materialKeys=f,n}buildGeometryData(e,t,i,n,s=!1){const a=e.p,o=e.stride,c=e.vcount,l=this.tempColor;function h(f){let g=a[f+i]*u;const v=g+u;for(;g<v;g++)n.push(d[g]);if(s){const m=n.length-u-1;l.setRGB(n[m+0],n[m+1],n[m+2],lt),n[m+0]=l.r,n[m+1]=l.g,n[m+2]=l.b}}const d=t.array,u=t.stride;if(e.vcount!==void 0){let f=0;for(let g=0,v=c.length;g<v;g++){const m=c[g];if(m===4){const p=f+o*0,M=f+o*1,T=f+o*2,y=f+o*3;h(p),h(M),h(y),h(M),h(T),h(y)}else if(m===3){const p=f+o*0,M=f+o*1,T=f+o*2;h(p),h(M),h(T)}else if(m>4){const p=[];for(let A=0;A<m;A++){const _=f+o*A,S=a[_]*u,P=d[S],R=d[S+1],L=d[S+2];p.push(new D(P,R,L))}const M=new D,T=new si;T.a=p[0],T.b=p[1],T.c=p[2],T.getNormal(M);const y=[];if(Math.abs(M.x)>Math.abs(M.y)&&Math.abs(M.x)>Math.abs(M.z))for(let A=0;A<m;A++)y.push(new De(p[A].y,p[A].z));else if(Math.abs(M.y)>Math.abs(M.z))for(let A=0;A<m;A++)y.push(new De(p[A].x,p[A].z));else for(let A=0;A<m;A++)y.push(new De(p[A].x,p[A].y));const E=Ur.isClockWise(y);E===!0&&y.reverse();const w=Ur.triangulateShape(y,[]);for(let A=0;A<w.length;A++){const _=w[A];let S,P,R;E===!1?(S=_[0],P=_[1],R=_[2]):(S=m-1-_[0],P=m-1-_[2],R=m-1-_[1]);const L=f+o*S,H=f+o*P,K=f+o*R;h(L),h(H),h(K)}}f+=o*m}}else for(let f=0,g=a.length;f<g;f+=o)h(f)}getGeometry(e){return this.getBuild(this.library.geometries[e],this.buildGeometry.bind(this))}buildKinematicsModel(e){return e.build!==void 0?e.build:e}getKinematicsModel(e){return this.getBuild(this.library.kinematicsModels[e],this.buildKinematicsModel.bind(this))}buildKinematicsScene(e){return e.build!==void 0?e.build:e}getKinematicsScene(e){return this.getBuild(this.library.kinematicsScenes[e],this.buildKinematicsScene.bind(this))}setupKinematics(){const e=Object.keys(this.library.kinematicsModels)[0],t=Object.keys(this.library.kinematicsScenes)[0],i=Object.keys(this.library.visualScenes)[0];if(e===void 0||t===void 0)return;const n=this.getKinematicsModel(e),s=this.getKinematicsScene(t),a=this.getVisualScene(i),o=s.bindJointAxis,c={},l=this.collada,h=this;for(let g=0,v=o.length;g<v;g++){const m=o[g],p=l.querySelector('[sid="'+m.target+'"]');if(p){const M=p.parentElement;d(m.jointIndex,M)}}function d(g,v){const m=v.getAttribute("name"),p=n.joints[g],M=h.buildTransformList(v);a.traverse(function(T){T.name===m&&(c[g]={object:T,transforms:M,joint:p,position:p.zeroPosition})})}const u=new Oe,f=this.matrix;this.kinematics={joints:n&&n.joints,getJointValue:function(g){const v=c[g];if(v)return v.position;console.warn("THREE.ColladaLoader: Joint "+g+" doesn't exist.")},setJointValue:function(g,v){const m=c[g];if(m){const p=m.joint;if(v>p.limits.max||v<p.limits.min)console.warn("THREE.ColladaLoader: Joint "+g+" value "+v+" outside of limits (min: "+p.limits.min+", max: "+p.limits.max+").");else if(p.static)console.warn("THREE.ColladaLoader: Joint "+g+" is static.");else{const M=m.object,T=p.axis,y=m.transforms;f.identity();for(let E=0;E<y.length;E++){const w=y[E];if(w.sid&&w.sid.indexOf(g)!==-1)switch(p.type){case"revolute":f.multiply(u.makeRotationAxis(T,xi.degToRad(v)));break;case"prismatic":f.multiply(u.makeTranslation(T.x*v,T.y*v,T.z*v));break;default:console.warn("THREE.ColladaLoader: Unknown joint type: "+p.type);break}else switch(w.type){case"matrix":f.multiply(w.obj);break;case"translate":f.multiply(u.makeTranslation(w.obj.x,w.obj.y,w.obj.z));break;case"scale":f.scale(w.obj);break;case"rotate":f.multiply(u.makeRotationAxis(w.obj,w.angle));break}}M.matrix.copy(f),M.matrix.decompose(M.position,M.quaternion,M.scale),c[g].position=v}}else console.warn("THREE.ColladaLoader: Joint "+g+" does not exist.")}}}buildTransformList(e){const t=[],i=this.collada.querySelector('[id="'+e.id+'"]');for(let n=0;n<i.childNodes.length;n++){const s=i.childNodes[n];if(s.nodeType!==1)continue;let a,o;switch(s.nodeName){case"matrix":a=Gt(s.textContent);const c=new Oe().fromArray(a).transpose();t.push({sid:s.getAttribute("sid"),type:s.nodeName,obj:c});break;case"translate":case"scale":a=Gt(s.textContent),o=new D().fromArray(a),t.push({sid:s.getAttribute("sid"),type:s.nodeName,obj:o});break;case"rotate":a=Gt(s.textContent),o=new D().fromArray(a);const l=xi.degToRad(a[3]);t.push({sid:s.getAttribute("sid"),type:s.nodeName,obj:o,angle:l});break}}return t}buildSkeleton(e,t){const i=[],n=[];let s,a,o;for(s=0;s<e.length;s++){const h=e[s];let d;if(this.hasNode(h))d=this.getNode(h),this.buildBoneHierarchy(d,t,i);else if(this.hasVisualScene(h)){const f=this.library.visualScenes[h].children;for(let g=0;g<f.length;g++){const v=f[g];if(v.type==="JOINT"){const m=this.getNode(v.id);this.buildBoneHierarchy(m,t,i)}}}else console.error("THREE.ColladaLoader: Unable to find root bone of skeleton with ID:",h)}for(s=0;s<t.length;s++)for(a=0;a<i.length;a++)if(o=i[a],o.bone.name===t[s].name){n[s]=o,o.processed=!0;break}for(s=0;s<i.length;s++)o=i[s],o.processed===!1&&(n.push(o),o.processed=!0);const c=[],l=[];for(s=0;s<n.length;s++)o=n[s],c.push(o.bone),l.push(o.boneInverse);return new qo(c,l)}buildBoneHierarchy(e,t,i){e.traverse(function(n){if(n.isBone===!0){let s;for(let a=0;a<t.length;a++){const o=t[a];if(o.name===n.name){s=o.boneInverse;break}}s===void 0&&(s=new Oe),i.push({bone:n,boneInverse:s,processed:!1})}})}buildNode(e){const t=[],i=e.matrix,n=e.nodes,s=e.type,a=e.instanceCameras,o=e.instanceControllers,c=e.instanceLights,l=e.instanceGeometries,h=e.instanceNodes;for(let u=0,f=n.length;u<f;u++)t.push(this.getNode(n[u]));for(let u=0,f=a.length;u<f;u++){const g=this.getCamera(a[u]);g!==null&&t.push(g.clone())}for(let u=0,f=o.length;u<f;u++){const g=o[u],v=this.getController(g.id),m=this.getGeometry(v.id),p=this.buildObjects(m,g.materials),M=g.skeletons,T=v.skin.joints,y=this.buildSkeleton(M,T);for(let E=0,w=p.length;E<w;E++){const A=p[E];A.isSkinnedMesh&&(A.bind(y,v.skin.bindMatrix),A.normalizeSkinWeights()),t.push(A)}}for(let u=0,f=c.length;u<f;u++){const g=this.getLight(c[u]);g!==null&&t.push(g.clone())}for(let u=0,f=l.length;u<f;u++){const g=l[u],v=this.getGeometry(g.id),m=this.buildObjects(v,g.materials);for(let p=0,M=m.length;p<M;p++)t.push(m[p])}for(let u=0,f=h.length;u<f;u++)t.push(this.getNode(h[u]).clone());let d;if(n.length===0&&t.length===1)d=t[0];else{d=s==="JOINT"?new bh:new ji;for(let u=0;u<t.length;u++)d.add(t[u])}return d.name=s==="JOINT"?e.sid:e.name,s!=="JOINT"&&this.hasPivotTransforms(e)?this.wrapWithTransformHierarchy(d,e):(d.matrix.copy(i),d.matrix.decompose(d.position,d.quaternion,d.scale),d)}wrapWithTransformHierarchy(e,t){const i=t.id;this.transformNodes[i]={};const n=t.transformOrder,s=t.transformData,a=new ji;a.name=t.name;let o=a;for(let c=0;c<n.length;c++){const l=n[c],h=s[l],d=new ji;switch(d.name=t.name+"_"+l,h.type){case"translate":d.position.set(h.x,h.y,h.z);break;case"rotate":{const u=new D(h.axis[0],h.axis[1],h.axis[2]),f=xi.degToRad(h.angle);d.quaternion.setFromAxisAngle(u,f),d.userData.rotationAxis=u;break}case"scale":d.scale.set(h.x,h.y,h.z);break;case"matrix":{new Oe().fromArray(h.array).transpose().decompose(d.position,d.quaternion,d.scale);break}}this.transformNodes[i][l]=d,o.add(d),o=d}return o.add(e),a}resolveMaterialBinding(e,t){const i=[];for(let n=0,s=e.length;n<s;n++){const a=t[e[n]];a===void 0?(console.warn("THREE.ColladaLoader: Material with key %s not found. Apply fallback material.",e[n]),i.push(this.fallbackMaterial)):i.push(this.getMaterial(a))}return i}get fallbackMaterial(){return this._fallbackMaterial===void 0&&(this._fallbackMaterial=new Pr({name:sn.DEFAULT_MATERIAL_NAME,color:16711935})),this._fallbackMaterial}buildObjects(e,t){const i=[];for(const n in e){const s=e[n],a=this.resolveMaterialBinding(s.materialKeys,t);if(a.length===0&&(n==="lines"||n==="linestrips"?a.push(new Nr):a.push(new bs)),n==="lines"||n==="linestrips")for(let h=0,d=a.length;h<d;h++){const u=a[h];if(u.isMeshPhongMaterial===!0||u.isMeshLambertMaterial===!0){const f=new Nr;f.color.copy(u.color),f.opacity=u.opacity,f.transparent=u.transparent,a[h]=f}}const o=s.data.attributes.skinIndex!==void 0,c=a.length===1?a[0]:a;let l;switch(n){case"lines":l=new Sh(s.data,c);break;case"linestrips":l=new Mh(s.data,c);break;case"triangles":case"polygons":case"polylist":o?l=new wd(s.data,c):l=new Vt(s.data,c);break}i.push(l)}return i}hasNode(e){return this.library.nodes[e]!==void 0}getNode(e){return this.getBuild(this.library.nodes[e],this.buildNode.bind(this))}buildVisualScene(e){const t=new ji;t.name=e.name;const i=e.children;for(let n=0;n<i.length;n++){const s=i[n];t.add(this.getNode(s.id))}return t}hasVisualScene(e){return this.library.visualScenes[e]!==void 0}getVisualScene(e){return this.getBuild(this.library.visualScenes[e],this.buildVisualScene.bind(this))}parseScene(e){const t=Jt(e,"instance_visual_scene")[0];return this.getVisualScene(this.parseId(t.getAttribute("url")))}parseId(e){return e.substring(1)}setupAnimations(){const e=this.library.clips;if(this.isEmpty(e)===!0){if(this.isEmpty(this.library.animations)===!1){const t=[];for(const i in this.library.animations){const n=this.getAnimation(i);for(let s=0,a=n.length;s<a;s++)t.push(n[s])}this.buildDeferredPivotAnimationTracks(t),this.animations.push(new ac("default",-1,t))}}else for(const t in e)this.animations.push(this.getAnimationClip(t))}buildDeferredPivotAnimationTracks(e){for(const t in this.deferredPivotAnimations){const i=this.library.nodes[t];if(!i)continue;const n=this.deferredPivotAnimations[t];this.buildTransformHierarchyTracks(t,n,i,e)}}buildTransformHierarchyTracks(e,t,i,n){const s=this.transformNodes[e];if(!s){console.warn("THREE.ColladaLoader: Transform hierarchy not found for node:",e);return}for(const a in t){const o=s[a];if(!o)continue;const c=i.transforms[a],l=i.transformData[a],h=t[a];switch(c){case"translate":this.buildHierarchyTranslateTrack(o,h,l,n);break;case"rotate":this.buildHierarchyRotateTrack(o,h,l,n);break;case"scale":this.buildHierarchyScaleTrack(o,h,l,n);break}}}buildHierarchyTranslateTrack(e,t,i,n){if(t.default&&t.default.stride===3){const l=t.default,h=new ni(e.uuid+".position",Array.from(l.times),Array.from(l.values)),d=this.getInterpolationInfo(t);this.applyInterpolation(h,d,t),n.push(h);return}const s=this.getTimesForAllAxes(t);if(s.length===0)return;const a=[],o=this.getInterpolationInfo(t);for(let l=0;l<s.length;l++){const h=s[l],d=this.getValueAtTime(t.X,h,i.x),u=this.getValueAtTime(t.Y,h,i.y),f=this.getValueAtTime(t.Z,h,i.z);a.push(d,u,f)}const c=new ni(e.uuid+".position",s,a);this.applyInterpolation(c,o),n.push(c)}buildHierarchyRotateTrack(e,t,i,n){const s=t.ANGLE||t.default;if(!s)return;const a=Array.from(s.times);if(a.length===0)return;const o=e.userData.rotationAxis||new D(i.axis[0],i.axis[1],i.axis[2]),c=new Pt,l=new Pt,h=[],d=this.getInterpolationInfo(t);for(let f=0;f<a.length;f++){const g=a[f],v=this.getValueAtTime(s,g,i.angle),m=xi.degToRad(v);c.setFromAxisAngle(o,m),f>0&&l.dot(c)<0&&(c.x=-c.x,c.y=-c.y,c.z=-c.z,c.w=-c.w),l.copy(c),h.push(c.x,c.y,c.z,c.w)}const u=new Xn(e.uuid+".quaternion",a,h);this.applyInterpolation(u,d),n.push(u)}buildHierarchyScaleTrack(e,t,i,n){if(t.default&&t.default.stride===3){const l=t.default,h=new ni(e.uuid+".scale",Array.from(l.times),Array.from(l.values)),d=this.getInterpolationInfo(t);this.applyInterpolation(h,d,t),n.push(h);return}const s=this.getTimesForAllAxes(t);if(s.length===0)return;const a=[],o=this.getInterpolationInfo(t);for(let l=0;l<s.length;l++){const h=s[l],d=this.getValueAtTime(t.X,h,i.x),u=this.getValueAtTime(t.Y,h,i.y),f=this.getValueAtTime(t.Z,h,i.z);a.push(d,u,f)}const c=new ni(e.uuid+".scale",s,a);this.applyInterpolation(c,o),n.push(c)}}class V0 extends sn{load(e,t,i,n){const s=this,a=s.path===""?Fh.extractUrlBase(e):s.path,o=new Jo(s.manager);o.setPath(s.path),o.setRequestHeader(s.requestHeader),o.setWithCredentials(s.withCredentials),o.load(e,function(c){try{t(s.parse(c,a))}catch(l){n?n(l):console.error(l),s.manager.itemError(e)}},i,n)}parse(e,t){if(e.length===0)return{scene:new xh};const n=new H0().parse(e);if(n===null)return null;const{library:s,asset:a,collada:o}=n,c=new Dh(this.manager);c.setPath(this.resourcePath||t).setCrossOrigin(this.crossOrigin);let l;zc&&(l=new zc(this.manager),l.setPath(this.resourcePath||t));const h=new G0(s,o,c,l),{scene:d,animations:u,kinematics:f}=h.compose();return d.animations=u,a.upAxis==="Z_UP"&&(console.warn("THREE.ColladaLoader: You are loading an asset with a Z-UP coordinate system. The loader just rotates the asset to transform it into Y-UP. The vertex data are not converted, see #24289."),d.rotation.set(-Math.PI/2,0,0)),d.scale.multiplyScalar(a.unit),{get animations(){return console.warn("THREE.ColladaLoader: Please access animations over scene.animations now."),u},kinematics:f,library:s,scene:d}}}const Hc=new D,W0=new ui,dr=new Oe,Ki=new Oe,fr=new Pt,pr=new D(1,1,1),mr=new D;class Zr extends ft{constructor(...e){super(...e),this.urdfNode=null,this.urdfName=""}copy(e,t){return super.copy(e,t),this.urdfNode=e.urdfNode,this.urdfName=e.urdfName,this}}class X0 extends Zr{constructor(...e){super(...e),this.isURDFCollider=!0,this.type="URDFCollider"}}class q0 extends Zr{constructor(...e){super(...e),this.isURDFVisual=!0,this.type="URDFVisual"}}class qh extends Zr{constructor(...e){super(...e),this.isURDFLink=!0,this.type="URDFLink",this.name="",this.inertial={mass:0,origin:{xyz:[0,0,0],rpy:[0,0,0]},inertia:{ixx:0,ixy:0,ixz:0,iyy:0,iyz:0,izz:0}}}copy(e,t){return super.copy(e,t),this.inertial={mass:e.inertial.mass,origin:{xyz:[...e.inertial.origin.xyz],rpy:[...e.inertial.origin.rpy]},inertia:{...e.inertial.inertia}},this}}class Yh extends Zr{get jointType(){return this._jointType}set jointType(e){if(this.jointType!==e)switch(this._jointType=e,this.matrixWorldNeedsUpdate=!0,e){case"fixed":this.jointValue=[];break;case"continuous":case"revolute":case"prismatic":this.jointValue=new Array(1).fill(0);break;case"planar":this.jointValue=new Array(3).fill(0),this.axis=new D(0,0,1);break;case"floating":this.jointValue=new Array(6).fill(0);break}}get angle(){return this.jointValue[0]}constructor(...e){super(...e),this.isURDFJoint=!0,this.type="URDFJoint",this.name="",this.jointValue=null,this.jointType="fixed",this.axis=new D(1,0,0),this.limit={lower:0,upper:0,effort:0,velocity:0},this.ignoreLimits=!1,this.origPosition=null,this.origQuaternion=null,this.mimicJoints=[]}copy(e,t){return super.copy(e,t),this.jointType=e.jointType,this.axis=e.axis.clone(),this.limit.lower=e.limit.lower,this.limit.upper=e.limit.upper,this.limit.effort=e.limit.effort,this.limit.velocity=e.limit.velocity,this.ignoreLimits=!1,this.jointValue=[...e.jointValue],this.origPosition=e.origPosition?e.origPosition.clone():null,this.origQuaternion=e.origQuaternion?e.origQuaternion.clone():null,this.mimicJoints=[...e.mimicJoints],this}setJointValue(...e){e=e.map(i=>i===null?null:parseFloat(i)),(!this.origPosition||!this.origQuaternion)&&(this.origPosition=this.position.clone(),this.origQuaternion=this.quaternion.clone());let t=!1;switch(this.mimicJoints.forEach(i=>{t=i.updateFromMimickedJoint(...e)||t}),this.jointType){case"fixed":return t;case"continuous":case"revolute":{let i=e[0];return i==null||i===this.jointValue[0]?t:(!this.ignoreLimits&&this.jointType==="revolute"&&(i=Math.min(this.limit.upper,i),i=Math.max(this.limit.lower,i)),this.quaternion.setFromAxisAngle(this.axis,i).premultiply(this.origQuaternion),this.jointValue[0]!==i?(this.jointValue[0]=i,this.matrixWorldNeedsUpdate=!0,!0):t)}case"prismatic":{let i=e[0];return i==null||i===this.jointValue[0]?t:(this.ignoreLimits||(i=Math.min(this.limit.upper,i),i=Math.max(this.limit.lower,i)),this.position.copy(this.origPosition),Hc.copy(this.axis).applyEuler(this.rotation),this.position.addScaledVector(Hc,i),this.jointValue[0]!==i?(this.jointValue[0]=i,this.matrixWorldNeedsUpdate=!0,!0):t)}case"floating":return this.jointValue.every((i,n)=>e[n]===i||e[n]===null)?t:(this.jointValue[0]=e[0]!==null?e[0]:this.jointValue[0],this.jointValue[1]=e[1]!==null?e[1]:this.jointValue[1],this.jointValue[2]=e[2]!==null?e[2]:this.jointValue[2],this.jointValue[3]=e[3]!==null?e[3]:this.jointValue[3],this.jointValue[4]=e[4]!==null?e[4]:this.jointValue[4],this.jointValue[5]=e[5]!==null?e[5]:this.jointValue[5],Ki.compose(this.origPosition,this.origQuaternion,pr),fr.setFromEuler(W0.set(this.jointValue[3],this.jointValue[4],this.jointValue[5],"XYZ")),mr.set(this.jointValue[0],this.jointValue[1],this.jointValue[2]),dr.compose(mr,fr,pr),Ki.premultiply(dr),this.position.setFromMatrixPosition(Ki),this.rotation.setFromRotationMatrix(Ki),this.matrixWorldNeedsUpdate=!0,!0);case"planar":return this.jointValue.every((i,n)=>e[n]===i||e[n]===null)?t:(this.jointValue[0]=e[0]!==null?e[0]:this.jointValue[0],this.jointValue[1]=e[1]!==null?e[1]:this.jointValue[1],this.jointValue[2]=e[2]!==null?e[2]:this.jointValue[2],Ki.compose(this.origPosition,this.origQuaternion,pr),fr.setFromAxisAngle(this.axis,this.jointValue[2]),mr.set(this.jointValue[0],this.jointValue[1],0),dr.compose(mr,fr,pr),Ki.premultiply(dr),this.position.setFromMatrixPosition(Ki),this.rotation.setFromRotationMatrix(Ki),this.matrixWorldNeedsUpdate=!0,!0)}return t}}class Gc extends Yh{constructor(...e){super(...e),this.type="URDFMimicJoint",this.mimicJoint=null,this.offset=0,this.multiplier=1}updateFromMimickedJoint(...e){const t=e.map(i=>i===null?null:i*this.multiplier+this.offset);return super.setJointValue(...t)}copy(e,t){return super.copy(e,t),this.mimicJoint=e.mimicJoint,this.offset=e.offset,this.multiplier=e.multiplier,this}}class Y0 extends qh{constructor(...e){super(...e),this.isURDFRobot=!0,this.urdfNode=null,this.urdfRobotNode=null,this.robotName=null,this.links=null,this.joints=null,this.colliders=null,this.visual=null,this.frames=null}copy(e,t){super.copy(e,t),this.urdfRobotNode=e.urdfRobotNode,this.robotName=e.robotName,this.links={},this.joints={},this.colliders={},this.visual={},this.traverse(i=>{i.isURDFJoint&&i.urdfName in e.joints&&(this.joints[i.urdfName]=i),i.isURDFLink&&i.urdfName in e.links&&(this.links[i.urdfName]=i),i.isURDFCollider&&i.urdfName in e.colliders&&(this.colliders[i.urdfName]=i),i.isURDFVisual&&i.urdfName in e.visual&&(this.visual[i.urdfName]=i)});for(const i in this.joints)this.joints[i].mimicJoints=this.joints[i].mimicJoints.map(n=>this.joints[n.name]);return this.frames={...this.colliders,...this.visual,...this.links,...this.joints},this}getFrame(e){return this.frames[e]}setJointValue(e,...t){const i=this.joints[e];return i?i.setJointValue(...t):!1}setJointValues(e){let t=!1;for(const i in e){const n=e[i];Array.isArray(n)?t=this.setJointValue(i,...n)||t:t=this.setJointValue(i,n)||t}return t}}const Fa=new Pt,Vc=new ui;function Zi(r){return r?r.trim().split(/\s+/g).map(e=>parseFloat(e)):[0,0,0]}function Wc(r,e,t=!1){t||r.rotation.set(0,0,0),Vc.set(e[0],e[1],e[2],"ZYX"),Fa.setFromEuler(Vc),Fa.multiply(r.quaternion),r.quaternion.copy(Fa)}class K0{constructor(e){this.manager=e||Nh,this.loadMeshCb=this.defaultMeshLoader.bind(this),this.parseVisual=!0,this.parseCollision=!1,this.packages="",this.workingPath="",this.fetchOptions={}}loadAsync(e){return new Promise((t,i)=>{this.load(e,t,null,i)})}load(e,t,i,n){const s=this.manager,a=Fh.extractUrlBase(e),o=this.manager.resolveURL(e);s.itemStart(o),fetch(o,this.fetchOptions).then(c=>{if(c.ok)return i&&i(null),c.text();throw new Error(`URDFLoader: Failed to load url '${o}' with error code ${c.status} : ${c.statusText}.`)}).then(c=>{const l=this.parse(c,this.workingPath||a);t(l),s.itemEnd(o)}).catch(c=>{n?n(c):console.error("URDFLoader: Error loading file.",c),s.itemError(o),s.itemEnd(o)})}parse(e,t=this.workingPath){const i=this.packages,n=this.loadMeshCb,s=this.parseVisual,a=this.parseCollision,o=this.manager,c={},l={},h={};function d(M){if(!/^package:\/\//.test(M))return t?t+M:M;const[T,y]=M.replace(/^package:\/\//,"").split(/\/(.+)/);if(typeof i=="string")return i.endsWith(T)?i+"/"+y:i+"/"+T+"/"+y;if(typeof i=="function")return i(T)+"/"+y;if(typeof i=="object")return T in i?i[T]+"/"+y:(console.error(`URDFLoader : ${T} not found in provided package list.`),null)}function u(M){let T;M instanceof Document?T=[...M.children]:M instanceof Element?T=[M]:T=[...new DOMParser().parseFromString(M,"text/xml").children];const y=T.filter(E=>E.nodeName==="robot").pop();return f(y)}function f(M){const T=[...M.children],y=T.filter(R=>R.nodeName.toLowerCase()==="link"),E=T.filter(R=>R.nodeName.toLowerCase()==="joint"),w=T.filter(R=>R.nodeName.toLowerCase()==="material"),A=new Y0;A.robotName=M.getAttribute("name"),A.urdfRobotNode=M,w.forEach(R=>{const L=R.getAttribute("name");h[L]=m(R)});const _={},S={};y.forEach(R=>{const L=R.getAttribute("name"),H=M.querySelector(`child[link="${L}"]`)===null;c[L]=v(R,_,S,H?A:null)}),E.forEach(R=>{const L=R.getAttribute("name");l[L]=g(R)}),A.joints=l,A.links=c,A.colliders=S,A.visual=_;const P=Object.values(l);return P.forEach(R=>{R instanceof Gc&&l[R.mimicJoint].mimicJoints.push(R)}),P.forEach(R=>{const L=new Set,H=K=>{if(L.has(K))throw new Error("URDFLoader: Detected an infinite loop of mimic joints.");L.add(K),K.mimicJoints.forEach(F=>{H(F)})};H(R)}),A.frames={...S,..._,...c,...l},A}function g(M){const T=[...M.children],y=M.getAttribute("type");let E;const w=T.find(L=>L.nodeName.toLowerCase()==="mimic");w?(E=new Gc,E.mimicJoint=w.getAttribute("joint"),E.multiplier=parseFloat(w.getAttribute("multiplier")||1),E.offset=parseFloat(w.getAttribute("offset")||0)):E=new Yh,E.urdfNode=M,E.name=M.getAttribute("name"),E.urdfName=E.name,E.jointType=y;let A=null,_=null,S=[0,0,0],P=[0,0,0];T.forEach(L=>{const H=L.nodeName.toLowerCase();H==="origin"?(S=Zi(L.getAttribute("xyz")),P=Zi(L.getAttribute("rpy"))):H==="child"?_=c[L.getAttribute("link")]:H==="parent"?A=c[L.getAttribute("link")]:H==="limit"&&(E.limit.lower=parseFloat(L.getAttribute("lower")||E.limit.lower),E.limit.upper=parseFloat(L.getAttribute("upper")||E.limit.upper),E.limit.effort=parseFloat(L.getAttribute("effort")||E.limit.effort),E.limit.velocity=parseFloat(L.getAttribute("velocity")||E.limit.velocity))}),A.add(E),E.add(_),Wc(E,P),E.position.set(S[0],S[1],S[2]);const R=T.filter(L=>L.nodeName.toLowerCase()==="axis")[0];if(R){const L=R.getAttribute("xyz").split(/\s+/g).map(H=>parseFloat(H));E.axis=new D(L[0],L[1],L[2]),E.axis.normalize()}return E}function v(M,T,y,E=null){E===null&&(E=new qh);const w=[...M.children];E.name=M.getAttribute("name"),E.urdfName=E.name,E.urdfNode=M;const A=w.find(_=>_.nodeName.toLowerCase()==="inertial");return A&&[...A.children].forEach(_=>{const S=_.nodeName.toLowerCase();S==="origin"?(E.inertial.origin.xyz=Zi(_.getAttribute("xyz")),E.inertial.origin.rpy=Zi(_.getAttribute("rpy"))):S==="mass"?E.inertial.mass=parseFloat(_.getAttribute("value"))||0:S==="inertia"&&(E.inertial.inertia.ixx=parseFloat(_.getAttribute("ixx"))||0,E.inertial.inertia.ixy=parseFloat(_.getAttribute("ixy"))||0,E.inertial.inertia.ixz=parseFloat(_.getAttribute("ixz"))||0,E.inertial.inertia.iyy=parseFloat(_.getAttribute("iyy"))||0,E.inertial.inertia.iyz=parseFloat(_.getAttribute("iyz"))||0,E.inertial.inertia.izz=parseFloat(_.getAttribute("izz"))||0)}),s&&w.filter(S=>S.nodeName.toLowerCase()==="visual").forEach(S=>{const P=p(S,h);if(E.add(P),S.hasAttribute("name")){const R=S.getAttribute("name");P.name=R,P.urdfName=R,T[R]=P}}),a&&w.filter(S=>S.nodeName.toLowerCase()==="collision").forEach(S=>{const P=p(S);if(E.add(P),S.hasAttribute("name")){const R=S.getAttribute("name");P.name=R,P.urdfName=R,y[R]=P}}),E}function m(M){const T=[...M.children],y=new bs;return y.name=M.getAttribute("name")||"",T.forEach(E=>{const w=E.nodeName.toLowerCase();if(w==="color"){const A=E.getAttribute("rgba").split(/\s/g).map(_=>parseFloat(_));y.color.setRGB(A[0],A[1],A[2]),y.opacity=A[3],y.transparent=A[3]<1,y.depthWrite=!y.transparent}else if(w==="texture"){const A=E.getAttribute("filename");if(A){const _=new Dh(o),S=d(A);y.map=_.load(S),y.map.colorSpace=lt}}}),y}function p(M,T={}){const y=M.nodeName.toLowerCase()==="collision",E=[...M.children];let w=null;const A=E.filter(S=>S.nodeName.toLowerCase()==="material")[0];if(A){const S=A.getAttribute("name");S&&S in T?w=T[S]:w=m(A)}else w=new bs;const _=y?new X0:new q0;return _.urdfNode=M,E.forEach(S=>{const P=S.nodeName.toLowerCase();if(P==="geometry"){const R=S.children[0].nodeName.toLowerCase();if(R==="mesh"){const L=S.children[0].getAttribute("filename"),H=d(L);if(H!==null){const K=S.children[0].getAttribute("scale");if(K){const F=Zi(K);_.scale.set(F[0],F[1],F[2])}n(H,o,w,(F,N)=>{N?console.error("URDFLoader: Error loading mesh.",N):F&&(F.position.set(0,0,0),F.quaternion.identity(),_.add(F))})}}else if(R==="box"){const L=new Vt;L.geometry=new ts(1,1,1),L.material=w;const H=Zi(S.children[0].getAttribute("size"));L.scale.set(H[0],H[1],H[2]),_.add(L)}else if(R==="sphere"){const L=new Vt;L.geometry=new Zo(1,30,30),L.material=w;const H=parseFloat(S.children[0].getAttribute("radius"))||0;L.scale.set(H,H,H),_.add(L)}else if(R==="cylinder"){const L=new Vt;L.geometry=new Ko(1,1,1,30),L.material=w;const H=parseFloat(S.children[0].getAttribute("radius"))||0,K=parseFloat(S.children[0].getAttribute("length"))||0;L.scale.set(H,K,H),L.rotation.set(Math.PI/2,0,0),_.add(L)}}else if(P==="origin"){const R=Zi(S.getAttribute("xyz")),L=Zi(S.getAttribute("rpy"));_.position.set(R[0],R[1],R[2]),_.rotation.set(0,0,0),Wc(_,L)}}),_}return u(e)}defaultMeshLoader(e,t,i,n){/\.stl$/i.test(e)?new B0(t).load(e,a=>{const o=new Vt(a,i||new bs);n(o)},null,a=>n(null,a)):/\.dae$/i.test(e)?new V0(t).load(e,a=>n(a.scene),null,a=>n(null,a)):console.warn(`URDFLoader: Could not load model at ${e}.
No loader available`)}}class X{static getElements(e,t=document){if(typeof e=="string"){const i="getElementById"in t?t:void 0;if(i&&!isNaN(+e[0])){const s=i.getElementById(e);return s?[s]:[]}let n=t.querySelectorAll(e);if(!n.length&&e[0]!=="."&&e[0]!=="#"&&(n=t.querySelectorAll("."+e),n.length||(n=t.querySelectorAll("#"+e)),!n.length)){const s=t.querySelector(`[gs-id="${e}"]`);return s?[s]:[]}return Array.from(n)}return[e]}static getElement(e,t=document){if(typeof e=="string"){const i="getElementById"in t?t:void 0;if(!e.length)return null;if(i&&e[0]==="#")return i.getElementById(e.substring(1));if(e[0]==="#"||e[0]==="."||e[0]==="[")return t.querySelector(e);if(i&&!isNaN(+e[0]))return i.getElementById(e);let n=t.querySelector(e);return i&&!n&&(n=i.getElementById(e)),n||(n=t.querySelector("."+e)),n}return e}static lazyLoad(e){var t,i;return!!(e.lazyLoad||(i=(t=e.grid)==null?void 0:t.opts)!=null&&i.lazyLoad&&e.lazyLoad!==!1)}static createDiv(e,t){const i=document.createElement("div");return e.forEach(n=>{n&&i.classList.add(n)}),t==null||t.appendChild(i),i}static shouldSizeToContent(e,t=!1){return!!(e!=null&&e.grid&&(t?e.sizeToContent===!0||e.grid.opts.sizeToContent===!0&&e.sizeToContent===void 0:e.sizeToContent||e.grid.opts.sizeToContent&&e.sizeToContent!==!1))}static isIntercepted(e,t){return!(e.y>=t.y+t.h||e.y+e.h<=t.y||e.x+e.w<=t.x||e.x>=t.x+t.w)}static isTouching(e,t){return X.isIntercepted(e,{x:t.x-.5,y:t.y-.5,w:t.w+1,h:t.h+1})}static areaIntercept(e,t){const i=e.x>t.x?e.x:t.x,n=e.x+e.w<t.x+t.w?e.x+e.w:t.x+t.w;if(n<=i)return 0;const s=e.y>t.y?e.y:t.y,a=e.y+e.h<t.y+t.h?e.y+e.h:t.y+t.h;return a<=s?0:(n-i)*(a-s)}static area(e){return e.w*e.h}static sort(e,t=1){const i=Number.MAX_SAFE_INTEGER;return e.sort((n,s)=>{const a=t*((n.y??i)-(s.y??i));return a===0?t*((n.x??i)-(s.x??i)):a})}static find(e,t){return t?e.find(i=>i.id===t):void 0}static findInGrid(e,t,i){const n=e.engine.nodes.find(s=>String(s.id)===t);if(n||!i)return n;for(const s of e.engine.nodes)if(s.subGrid){const a=X.findInGrid(s.subGrid,t);if(a)return a}}static toBool(e){return typeof e=="boolean"?e:typeof e=="string"?(e=e.toLowerCase(),!(e===""||e==="no"||e==="false"||e==="0")):!!e}static toNumber(e){return e===null||e.length===0?void 0:Number(e)}static parseHeight(e){let t,i="px";if(typeof e=="string")if(e==="auto"||e==="")t=0;else{const n=e.match(/^(-[0-9]+\.[0-9]+|[0-9]*\.[0-9]+|-[0-9]+|[0-9]+)(px|em|rem|vh|vw|%|cm|mm)?$/);if(!n)throw new Error(`Invalid height val = ${e}`);i=n[2]||"px",t=parseFloat(n[1])}else t=e;return{h:t,unit:i}}static defaults(e,...t){return t.forEach(i=>{for(const n in i){if(!Object.prototype.hasOwnProperty.call(i,n))return;e[n]===null||e[n]===void 0?e[n]=i[n]:typeof i[n]=="object"&&typeof e[n]=="object"&&X.defaults(e[n],i[n])}}),e}static same(e,t){if(typeof e!="object")return e==t;if(typeof e!=typeof t)return!1;const i=e,n=t;if(Object.keys(i).length!==Object.keys(n).length)return!1;for(const s in i)if(i[s]!==n[s])return!1;return!0}static copyPos(e,t,i=!1){return t.x!==void 0&&(e.x=t.x),t.y!==void 0&&(e.y=t.y),t.w!==void 0&&(e.w=t.w),t.h!==void 0&&(e.h=t.h),i&&(t.minW&&(e.minW=t.minW),t.minH&&(e.minH=t.minH),t.maxW&&(e.maxW=t.maxW),t.maxH&&(e.maxH=t.maxH)),e}static samePos(e,t){return e&&t&&e.x===t.x&&e.y===t.y&&(e.w||1)===(t.w||1)&&(e.h||1)===(t.h||1)}static sanitizeMinMax(e){e.minW||delete e.minW,e.minH||delete e.minH,e.maxW||delete e.maxW,e.maxH||delete e.maxH}static removeInternalAndSame(e,t){if(typeof e!="object"||typeof t!="object"||!e||!t||Array.isArray(e)||Array.isArray(t))return;const i=e,n=t;for(const s in i){const a=i[s],o=n[s];s[0]==="_"||a===o?delete i[s]:a&&typeof a=="object"&&o!==void 0&&(X.removeInternalAndSame(a,o),Object.keys(a).length||delete i[s])}}static removeInternalForSave(e,t=!0){const i=e;for(const n in i)(n[0]==="_"||i[n]===null||i[n]===void 0)&&delete i[n];delete e.grid,t&&delete e.el,e.autoPosition||delete e.autoPosition,e.noResize||delete e.noResize,e.noMove||delete e.noMove,e.locked||delete e.locked,(e.w===1||e.w===e.minW)&&delete e.w,(e.h===1||e.h===e.minH)&&delete e.h}static throttle(e,t){let i=!1;return(...n)=>{i||(i=!0,setTimeout(()=>{e(...n),i=!1},t))}}static removePositioningStyles(e){const t=e.style;t.position&&t.removeProperty("position"),t.left&&t.removeProperty("left"),t.top&&t.removeProperty("top"),t.width&&t.removeProperty("width"),t.height&&t.removeProperty("height")}static getScrollElement(e){if(!e)return document.scrollingElement||document.documentElement;const t=getComputedStyle(e).overflowY;return(t==="auto"||t==="scroll")&&e.scrollHeight>e.clientHeight?e:X.getScrollElement(e.parentElement??void 0)}static updateScrollResize(e,t,i){const n=X.getScrollElement(t),s=n.clientHeight,a=n===X.getScrollElement()?0:n.getBoundingClientRect().top,o=e.clientY-a,c=o<i,l=o>s-i;c?n.scrollBy({behavior:"smooth",top:o-i}):l&&n.scrollBy({behavior:"smooth",top:i-(s-o)})}static pauseIframePointerEvents(e){document.querySelectorAll("iframe").forEach(t=>{t.style.pointerEvents=e?"none":""})}static clone(e){return e==null||typeof e!="object"?e:e instanceof Array?[...e]:{...e}}static cloneDeep(e){const t=["parentGrid","el","grid","subGrid","engine"],i=X.clone(e);for(const n in i)Object.prototype.hasOwnProperty.call(i,n)&&typeof i[n]=="object"&&n.substring(0,2)!=="__"&&!t.find(s=>s===n)&&(i[n]=X.cloneDeep(e[n]));return i}static cloneNode(e){const t=e.cloneNode(!0);return t.removeAttribute("id"),t}static appendTo(e,t){let i;typeof t=="string"?i=X.getElement(t):i=t,i&&i.appendChild(e)}static addElStyles(e,t){if(t instanceof Object){const i=e.style;for(const n in t)Object.prototype.hasOwnProperty.call(t,n)&&(Array.isArray(t[n])?t[n].forEach(s=>{i[n]=s}):i[n]=t[n])}}static initEvent(e,t){const i={type:t.type},n={button:0,which:0,buttons:1,bubbles:!0,cancelable:!0,target:t.target?t.target:e.target},s=e;return["altKey","ctrlKey","metaKey","shiftKey"].forEach(a=>i[a]=s[a]),["pageX","pageY","clientX","clientY","screenX","screenY"].forEach(a=>i[a]=s[a]),{...i,...n}}static simulateMouseEvent(e,t,i){const n=e,s=new MouseEvent(t,{bubbles:!0,composed:!0,cancelable:!0,view:window,detail:1,screenX:e.screenX,screenY:e.screenY,clientX:e.clientX,clientY:e.clientY,ctrlKey:n.ctrlKey??!1,altKey:n.altKey??!1,shiftKey:n.shiftKey??!1,metaKey:n.metaKey??!1,button:0,relatedTarget:e.target});(i||e.target).dispatchEvent(s)}static getValuesFromTransformedElement(e){const t=document.createElement("div");X.addElStyles(t,{opacity:"0",position:"fixed",top:"0px",left:"0px",width:"1px",height:"1px",zIndex:"-999999"}),e.appendChild(t);const i=t.getBoundingClientRect();return e.removeChild(t),t.remove(),{xScale:1/i.width,yScale:1/i.height,xOffset:i.left,yOffset:i.top}}static swap(e,t,i){if(!e)return;const n=e,s=n[t];n[t]=n[i],n[i]=s}static canBeRotated(e){var t;return!(!e||e.w===e.h||e.locked||e.noResize||(t=e.grid)!=null&&t.opts.disableResize||e.minW&&e.minW===e.maxW||e.minH&&e.minH===e.maxH)}}class Ni{constructor(e={}){this.addedNodes=[],this.removedNodes=[],this.defaultColumn=12,this.column=e.column||this.defaultColumn,this.column>this.defaultColumn&&(this.defaultColumn=this.column),this.maxRow=e.maxRow??0,this._float=e.float??!1,this.nodes=e.nodes||[],this.onChange=e.onChange??(()=>{})}batchUpdate(e=!0,t=!0){return!!this.batchMode===e?this:(this.batchMode=e,e?(this._prevFloat=this._float,this._float=!0,this.cleanNodes(),this.nodes.some(i=>i._updating)||this.saveInitial()):(this._float=this._prevFloat??!1,delete this._prevFloat,t&&this._packNodes(),this._notify()),this)}_useEntireRowArea(e,t){return(!this.float||this.batchMode&&!this._prevFloat)&&!this._hasLocked&&(!e._moving||e._skipDown||t.y<=e.y)}_fixCollisions(e,t=e,i,n={}){if(this.sortNodes(-1),i=i||this.collide(e,t),!i)return!1;if(e._moving&&!e._isExternal&&!n.nested&&!this.float&&this.swap(e,i))return!0;let s=t;!this._loading&&this._useEntireRowArea(e,t)&&(s={x:0,w:this.column,y:t.y,h:t.h},i=this.collide(e,s,n.skip));let a=!1;const o={nested:!0,pack:!1};let c=0;for(;i=i||this.collide(e,s,n.skip);){if(c++>this.nodes.length*2)throw new Error("Infinite collide check");let l;if(i.locked||this._loading||e._moving&&!e._skipDown&&t.y>e.y&&!this.float&&(!this.collide(i,{...i,y:e.y},e)||!this.collide(i,{...i,y:t.y-i.h},e))){e._skipDown=e._skipDown||t.y>e.y;const h={...t,y:i.y+i.h,...o};l=this._loading&&X.samePos(e,h)?!0:this.moveNode(e,h),(i.locked||this._loading)&&l?X.copyPos(t,e):!i.locked&&l&&n.pack&&(this._packNodes(),t.y=i.y+i.h,X.copyPos(e,t)),a=a||l}else l=this.moveNode(i,{...i,y:t.y+t.h,skip:e,...o});if(!l)return a;i=void 0}return a}collide(e,t=e,i){const n=e._id,s=i==null?void 0:i._id;return this.nodes.find(a=>a._id!==n&&a._id!==s&&X.isIntercepted(a,t))}collideAll(e,t=e,i){const n=e._id,s=i==null?void 0:i._id;return this.nodes.filter(a=>a._id!==n&&a._id!==s&&X.isIntercepted(a,t))}directionCollideCoverage(e,t,i){if(!t.rect||!e._rect)return;const n=e._rect,s={...t.rect};s.y>n.y?(s.h=s.h+s.y-n.y,s.y=n.y):s.h=s.h+n.y-s.y,s.x>n.x?(s.w=s.w+s.x-n.x,s.x=n.x):s.w=s.w+n.x-s.x;let a,o=.5;for(const c of i){if(c.locked||!c._rect)continue;const l=c._rect;let h=Number.MAX_VALUE,d=Number.MAX_VALUE;n.y<l.y?h=(s.y+s.h-l.y)/l.h:n.y+n.h>l.y+l.h&&(h=(l.y+l.h-s.y)/l.h),n.x<l.x?d=(s.x+s.w-l.x)/l.w:n.x+n.w>l.x+l.w&&(d=(l.x+l.w-s.x)/l.w);const u=Math.min(d,h);u>o&&(o=u,a=c)}return t.collide=a,a}cacheRects(e,t,i,n,s,a){return this.nodes.forEach(o=>o._rect={y:o.y*t+i,x:o.x*e+a,w:o.w*e-a-n,h:o.h*t-i-s}),this}swap(e,t){if(!t||t.locked||!e||e.locked)return!1;function i(){const s=t.x,a=t.y;return t.x=e.x,t.y=e.y,e.h!=t.h?(e.x=s,e.y=t.y+t.h):e.w!=t.w?(e.x=t.x+t.w,e.y=a):(e.x=s,e.y=a),e._dirty=t._dirty=!0,!0}let n;if(e.w===t.w&&e.h===t.h&&(e.x===t.x||e.y===t.y)&&(n=X.isTouching(e,t)))return i();if(n!==!1){if(e.w===t.w&&e.x===t.x&&(n||(n=X.isTouching(e,t)))){if(t.y<e.y){const s=e;e=t,t=s}return i()}if(n!==!1){if(e.h===t.h&&e.y===t.y&&(n||(n=X.isTouching(e,t)))){if(t.x<e.x){const s=e;e=t,t=s}return i()}return!1}}}isAreaEmpty(e,t,i,n){const s={x:e||0,y:t||0,w:i||1,h:n||1};return!this.collide(s)}compact(e="compact",t=!0){if(this.nodes.length===0)return this;t&&this.sortNodes();const i=this.batchMode;i||this.batchUpdate();const n=this._inColumnResize;n||(this._inColumnResize=!0);const s=this.nodes;return this.nodes=[],s.forEach((a,o,c)=>{let l;a.locked||(a.autoPosition=!0,e==="list"&&o&&(l=c[o-1])),this.addNode(a,!1,l)}),n||delete this._inColumnResize,i||this.batchUpdate(!1),this}set float(e){this._float!==e&&(this._float=e||!1,e||this._packNodes()._notify())}get float(){return this._float||!1}sortNodes(e=1){return this.nodes=X.sort(this.nodes,e),this}_packNodes(){return this.batchMode?this:(this.sortNodes(),this.float?this.nodes.forEach(e=>{if(e._updating||e._orig===void 0||e.y===e._orig.y)return;let t=e.y;for(;t>e._orig.y;)--t,this.collide(e,{x:e.x,y:t,w:e.w,h:e.h})||(e._dirty=!0,e.y=t)}):this.nodes.forEach((e,t)=>{if(!e.locked)for(;e.y>0;){const i=t===0?0:e.y-1;if(!(t===0||!this.collide(e,{x:e.x,y:i,w:e.w,h:e.h})))break;e._dirty=e.y!==i,e.y=i}}),this)}prepareNode(e,t){e._id=e._id??Ni._idSeq++;const i=e.id;if(i){let s=1;for(;this.nodes.find(a=>a.id===e.id&&a!==e);)e.id=i+"_"+s++}(e.x===void 0||e.y===void 0||e.x===null||e.y===null)&&(e.autoPosition=!0);const n={x:0,y:0,w:1,h:1};return X.defaults(e,n),e.autoPosition||delete e.autoPosition,e.noResize||delete e.noResize,e.noMove||delete e.noMove,X.sanitizeMinMax(e),typeof e.x=="string"&&(e.x=Number(e.x)),typeof e.y=="string"&&(e.y=Number(e.y)),typeof e.w=="string"&&(e.w=Number(e.w)),typeof e.h=="string"&&(e.h=Number(e.h)),isNaN(e.x)&&(e.x=n.x,e.autoPosition=!0),isNaN(e.y)&&(e.y=n.y,e.autoPosition=!0),isNaN(e.w)&&(e.w=n.w),isNaN(e.h)&&(e.h=n.h),this.nodeBoundFix(e,t),e}nodeBoundFix(e,t){const i=e._orig||X.copyPos({},e);if(e.maxW&&(e.w=Math.min(e.w||1,e.maxW)),e.maxH&&(e.h=Math.min(e.h||1,e.maxH)),e.minW&&(e.w=Math.max(e.w||1,e.minW)),e.minH&&(e.h=Math.max(e.h||1,e.minH)),(e.x||0)+(e.w||1)>this.column&&this.column<this.defaultColumn&&!this._inColumnResize&&!this.skipCacheUpdate&&e._id!=null&&this.findCacheLayout(e,this.defaultColumn)===-1){const s={...e};s.autoPosition||s.x===void 0?(delete s.x,delete s.y):s.x=Math.min(this.defaultColumn-1,s.x),s.w=Math.min(this.defaultColumn,s.w||1),this.cacheOneLayout(s,this.defaultColumn)}return e.w>this.column?e.w=this.column:e.w<1&&(e.w=1),this.maxRow&&e.h>this.maxRow?e.h=this.maxRow:e.h<1&&(e.h=1),e.x<0&&(e.x=0),e.y<0&&(e.y=0),e.x+e.w>this.column&&(t?e.w=this.column-e.x:e.x=this.column-e.w),this.maxRow&&e.y+e.h>this.maxRow&&(t?e.h=this.maxRow-e.y:e.y=this.maxRow-e.h),X.samePos(e,i)||(e._dirty=!0),this}getDirtyNodes(e){return e?this.nodes.filter(t=>t._dirty&&t._orig&&!X.samePos(t,t._orig)):this.nodes.filter(t=>t._dirty)}_notify(e){if(this.batchMode||!this.onChange)return this;const t=(e||[]).concat(this.getDirtyNodes());return this.onChange(t),this}cleanNodes(){return this.batchMode?this:(this.nodes.forEach(e=>{delete e._dirty,delete e._lastTried}),this)}saveInitial(){return this.nodes.forEach(e=>{e._orig=X.copyPos({},e),delete e._dirty}),this._hasLocked=this.nodes.some(e=>e.locked),this}restoreInitial(){return this.nodes.forEach(e=>{!e._orig||X.samePos(e,e._orig)||(X.copyPos(e,e._orig),e._dirty=!0)}),this._notify(),this}findEmptyPosition(e,t=this.nodes,i=this.column,n){const s=n?n.y*i+(n.x+n.w):0;let a=!1;for(let o=s;!a;++o){const c=o%i,l=Math.floor(o/i);if(c+e.w>i)continue;const h={x:c,y:l,w:e.w,h:e.h};t.find(d=>X.isIntercepted(h,d))||((e.x!==c||e.y!==l)&&(e._dirty=!0),e.x=c,e.y=l,delete e.autoPosition,a=!0)}return a}addNode(e,t=!1,i){const n=this.nodes.find(a=>a._id===e._id);if(n)return n;this._inColumnResize?this.nodeBoundFix(e):this.prepareNode(e),delete e._temporaryRemoved,delete e._removeDOM;let s=!1;return e.autoPosition&&this.findEmptyPosition(e,this.nodes,this.column,i)&&(delete e.autoPosition,s=!0),this.nodes.push(e),t&&this.addedNodes.push(e),s||this._fixCollisions(e),this.batchMode||this._packNodes()._notify(),e}removeNode(e,t=!0,i=!1){return this.nodes.find(n=>n._id===e._id)?(i&&this.removedNodes.push(e),t&&(e._removeDOM=!0),this.nodes=this.nodes.filter(n=>n._id!==e._id),e._isAboutToRemove||this._packNodes(),this._notify([e]),this):this}removeAll(e=!0,t=!0){if(delete this._layouts,!this.nodes.length)return this;e&&this.nodes.forEach(n=>n._removeDOM=!0);const i=this.nodes;return this.removedNodes=t?i:[],this.nodes=[],this._notify(i)}moveNodeCheck(e,t){var a;if(!this.changedPosConstrain(e,t))return!1;if(t.pack=!0,!this.maxRow)return this.moveNode(e,t);let i;const n=new Ni({column:this.column,float:this.float,nodes:this.nodes.map(o=>o._id===e._id?(i={...o},i):{...o})});if(!i)return!1;const s=n.moveNode(i,t)&&n.getRow()<=Math.max(this.getRow(),this.maxRow);if(!s&&!t.resizing&&t.collide&&!e._isExternal){const o=(a=t.collide.el)==null?void 0:a.gridstackNode;if(o&&this.swap(e,o))return this._notify(),!0}return s?(n.nodes.filter(o=>o._dirty).forEach(o=>{const c=this.nodes.find(l=>l._id===o._id);c&&(X.copyPos(c,o),c._dirty=!0)}),this._notify(),!0):!1}willItFit(e){if(delete e._willFitPos,!this.maxRow)return!0;const t=new Ni({column:this.column,float:this.float,nodes:this.nodes.map(n=>({...n}))}),i={...e};return this.cleanupNode(i),delete i.el,delete i._id,delete i.content,delete i.grid,t.addNode(i),t.getRow()<=this.maxRow?(e._willFitPos=X.copyPos({},i),!0):!1}changedPosConstrain(e,t){return t.w=t.w||e.w,t.h=t.h||e.h,e.x!==t.x||e.y!==t.y?!0:(e.maxW&&(t.w=Math.min(t.w,e.maxW)),e.maxH&&(t.h=Math.min(t.h,e.maxH)),e.minW&&(t.w=Math.max(t.w,e.minW)),e.minH&&(t.h=Math.max(t.h,e.minH)),e.w!==t.w||e.h!==t.h)}moveNode(e,t){var l,h;if(!e||!t)return!1;let i=!1;t.pack===void 0&&!this.batchMode&&(i=t.pack=!0),typeof t.x!="number"&&(t.x=e.x),typeof t.y!="number"&&(t.y=e.y),typeof t.w!="number"&&(t.w=e.w),typeof t.h!="number"&&(t.h=e.h);const n=e.w!==t.w||e.h!==t.h,s=X.copyPos({},e,!0);if(X.copyPos(s,t),this.nodeBoundFix(s,n),X.copyPos(t,s),!t.forceCollide&&X.samePos(e,t))return!1;const a=X.copyPos({},e),o=this.collideAll(e,s,t.skip);let c=!0;if(o.length){const d=e._moving&&!t.nested;let u=d?this.directionCollideCoverage(e,t,o):o[0];if(d&&u&&((h=(l=e.grid)==null?void 0:l.opts)!=null&&h.subGridDynamic)&&!e.grid._isTemp){const f=X.areaIntercept(t.rect,u._rect),g=X.area(t.rect),v=X.area(u._rect);f/(g<v?g:v)>.8&&(u.grid.makeSubGrid(u.el,void 0,e),u=void 0)}u?c=!this._fixCollisions(e,s,u,t):(c=!1,i&&delete t.pack)}return c&&!X.samePos(e,s)&&(e._dirty=!0,X.copyPos(e,s)),t.pack&&this._packNodes()._notify(),!X.samePos(e,a)}getRow(){return this.nodes.reduce((e,t)=>Math.max(e,t.y+t.h),0)}beginUpdate(e){return e._updating||(e._updating=!0,delete e._skipDown,this.batchMode||this.saveInitial()),this}endUpdate(){const e=this.nodes.find(t=>t._updating);return e&&(delete e._updating,delete e._skipDown),this}save(e=!0,t,i){var o;const n=((o=this._layouts)==null?void 0:o.length)||0;let s;n&&(i?i!==this.column&&(s=this._layouts[i]):this.column!==n-1&&(s=this._layouts[n-1]));const a=[];return this.sortNodes(),this.nodes.forEach(c=>{const l=s==null?void 0:s.find(d=>d._id===c._id),h={...c,...l||{}};X.removeInternalForSave(h,!e),t&&t(c,h),a.push(h)}),a}layoutsNodesChange(e){return!this._layouts||this._inColumnResize?this:(this._layouts.forEach((t,i)=>{if(!(!t||i===this.column))if(i<this.column)this._layouts[i]=void 0;else{const n=i/this.column;e.forEach(s=>{if(!s._orig)return;const a=t.find(o=>o._id===s._id);a&&(a.y>=0&&s.y!==s._orig.y&&(a.y=a.y+(s.y-s._orig.y),a.y<0&&(a.y=0)),s.x!==s._orig.x&&(a.x=Math.round(s.x*n),a.x<0&&(a.x=0)),s.w!==s._orig.w&&(a.w=Math.round(s.w*n),a.w<1&&(a.w=1)))})}}),this)}columnChanged(e,t,i="moveScale"){var o;if(!this.nodes.length||!t||e===t)return this;const n=i==="compact"||i==="list";n&&this.sortNodes(1),t<e&&this.cacheLayout(this.nodes,e),this.batchUpdate();let s=[],a=n?this.nodes:X.sort(this.nodes,-1);if(t>e&&this._layouts){const c=this._layouts[t]||[],l=this._layouts.length-1;!c.length&&e!==l&&((o=this._layouts[l])!=null&&o.length)&&(e=l,this._layouts[l].forEach(h=>{const d=a.find(u=>u._id===h._id);d&&(!n&&!h.autoPosition&&(d.x=h.x??d.x,d.y=h.y??d.y),d.w=h.w??d.w,(h.x==null||h.y===void 0)&&(d.autoPosition=!0))})),c.forEach(h=>{const d=a.findIndex(u=>u._id===h._id);if(d!==-1){const u=a[d];if(n){u.w=h.w;return}(h.autoPosition||isNaN(h.x)||isNaN(h.y))&&this.findEmptyPosition(h,s),h.autoPosition||(u.x=h.x??u.x,u.y=h.y??u.y,u.w=h.w??u.w,s.push(u)),a.splice(d,1)}})}if(n)this.compact(i,!1);else{if(a.length)if(typeof i=="function")i(t,e,s,a);else{const c=n||i==="none"?1:t/e,l=i==="move"||i==="moveScale",h=i==="scale"||i==="moveScale";a.forEach(d=>{d.x=t===1?0:l?Math.round(d.x*c):Math.min(d.x,t-1),d.w=t===1||e===1?1:h?Math.round(d.w*c)||1:Math.min(d.w,t),s.push(d)}),a=[]}s=X.sort(s,-1),this._inColumnResize=!0,this.nodes=[],s.forEach(c=>{this.addNode(c,!1),delete c._orig})}return this.nodes.forEach(c=>delete c._orig),this.batchUpdate(!1,!n),delete this._inColumnResize,this}cacheLayout(e,t,i=!1){const n=[];return e.forEach((s,a)=>{if(s._id===void 0){const o=s.id?this.nodes.find(c=>c.id===s.id):void 0;s._id=(o==null?void 0:o._id)??Ni._idSeq++}n[a]={x:s.x,y:s.y,w:s.w,_id:s._id}}),this._layouts=i?[]:this._layouts||[],this._layouts[t]=n,this}cacheOneLayout(e,t){e._id=e._id??Ni._idSeq++;const i={x:e.x,y:e.y,w:e.w,_id:e._id};(e.autoPosition||e.x===void 0)&&(delete i.x,delete i.y,e.autoPosition&&(i.autoPosition=!0)),this._layouts=this._layouts||[],this._layouts[t]=this._layouts[t]||[];const n=this.findCacheLayout(e,t);return n===-1?this._layouts[t].push(i):this._layouts[t][n]=i,this}findCacheLayout(e,t){var i,n;return((n=(i=this._layouts)==null?void 0:i[t])==null?void 0:n.findIndex(s=>s._id===e._id))??-1}removeNodeFromLayoutCache(e){if(this._layouts)for(let t=0;t<this._layouts.length;t++){const i=this.findCacheLayout(e,t);i!==-1&&this._layouts[t].splice(i,1)}}cleanupNode(e){const t=e;for(const i in t)i[0]==="_"&&i!=="_id"&&delete t[i];return this}}Ni._idSeq=0;const $t={alwaysShowResizeHandle:"mobile",animate:!0,auto:!0,cellHeight:"auto",cellHeightThrottle:100,cellHeightUnit:"px",column:12,draggable:{handle:".grid-stack-item-content",appendTo:"body",scroll:!0},handle:".grid-stack-item-content",itemClass:"grid-stack-item",margin:10,marginUnit:"px",maxRow:0,minRow:0,placeholderClass:"grid-stack-placeholder",placeholderText:"",removableOptions:{accept:"grid-stack-item",decline:"grid-stack-non-removable"},resizable:{handles:"se"},rtl:"auto"};class Ee{}const hi=typeof window<"u"&&typeof document<"u"&&("ontouchstart"in document||"ontouchstart"in window||window.DocumentTouch&&document instanceof window.DocumentTouch||navigator.maxTouchPoints>0&&window.matchMedia("(any-pointer: coarse)").matches||navigator.msMaxTouchPoints>0),Z0=300,$0=10;class _t{}function Fr(r){r.preventDefault()}function J0(){document.addEventListener("contextmenu",Fr,!0),document.addEventListener("selectstart",Fr,!0)}function Kh(){document.removeEventListener("contextmenu",Fr,!0),document.removeEventListener("selectstart",Fr,!0)}function Xc(r,e,t){r.removeEventListener("touchmove",e),r.removeEventListener("touchend",t),r.removeEventListener("touchcancel",t),el()}function el(){_t.touchDelayTimer&&(window.clearTimeout(_t.touchDelayTimer),delete _t.touchDelayTimer),Kh()}function Or(r,e){r.touches.length>1||(r.cancelable&&r.preventDefault(),X.simulateMouseEvent(r.changedTouches[0],e))}function Zh(r,e){r.cancelable&&r.preventDefault(),X.simulateMouseEvent(r,e)}function kr(r){if(_t.touchHandled)return;const e=r.currentTarget,t=r.touches[0].clientX,i=r.touches[0].clientY,n=()=>Xc(e,s,n),s=a=>{const o=a.touches[0];Math.abs(o.clientX-t)+Math.abs(o.clientY-i)>$0&&n()};e.addEventListener("touchmove",s,{passive:!0}),e.addEventListener("touchend",n,{passive:!0}),e.addEventListener("touchcancel",n,{passive:!0}),_t.touchDelayTimer=window.setTimeout(()=>{Xc(e,s,n),_t.touchHandled=!0,_t.wasDelayed=!0,J0(),Or(r,"mousedown"),delete _t.wasDelayed},Z0)}function Br(r){_t.touchHandled&&Or(r,"mousemove")}function en(r){if(!_t.touchHandled)return;Kh(),_t.pointerLeaveTimeout&&(window.clearTimeout(_t.pointerLeaveTimeout),delete _t.pointerLeaveTimeout);const e=!!Ee.dragElement;Or(r,"mouseup"),!e&&r.type!=="touchcancel"&&Or(r,"click"),_t.touchHandled=!1}function zr(r){r.pointerType!=="mouse"&&r.target.releasePointerCapture(r.pointerId)}function qc(r){Ee.dragElement&&r.pointerType!=="mouse"&&Zh(r,"mouseenter")}function Yc(r){Ee.dragElement&&r.pointerType!=="mouse"&&(_t.pointerLeaveTimeout=window.setTimeout(()=>{delete _t.pointerLeaveTimeout,Zh(r,"mouseleave")},10))}class $r{constructor(e,t,i){this.host=e,this.dir=t,this.option=i,this._mouseDown=this._mouseDown.bind(this),this._mouseMove=this._mouseMove.bind(this),this._mouseUp=this._mouseUp.bind(this),this._keyEvent=this._keyEvent.bind(this),this._init()}_init(){if(this.option.element)try{this.el=this.option.element instanceof HTMLElement?this.option.element:this.host.querySelector(this.option.element)}catch(e){this.option.element=void 0,console.error("Query for resizeable handle failed, falling back",e)}return this.el||(this.el=document.createElement("div"),this.host.appendChild(this.el)),this.el.classList.add("ui-resizable-handle"),this.el.classList.add(`${$r.prefix}${this.dir}`),this.el.addEventListener("mousedown",this._mouseDown),hi&&(this.el.addEventListener("touchstart",kr),this.el.addEventListener("pointerdown",zr)),this}destroy(){return this.mouseDownEvent&&this._mouseUp(this.mouseDownEvent),el(),this.el.removeEventListener("mousedown",this._mouseDown),hi&&(this.el.removeEventListener("touchstart",kr),this.el.removeEventListener("pointerdown",zr)),this.option.element||this.host.removeChild(this.el),this}_mouseDown(e){this.mouseDownEvent=e,document.addEventListener("mousemove",this._mouseMove,{capture:!0,passive:!0}),document.addEventListener("mouseup",this._mouseUp,!0),hi&&(this.el.addEventListener("touchmove",Br),this.el.addEventListener("touchend",en),this.el.addEventListener("touchcancel",en)),_t.wasDelayed&&this.el.classList.add("ui-resizable-armed"),e.stopPropagation(),e.preventDefault()}_mouseMove(e){const t=this.mouseDownEvent;this.moving?this._triggerEvent("move",e):Math.abs(e.x-t.x)+Math.abs(e.y-t.y)>2&&(this.moving=!0,this.el.classList.remove("ui-resizable-armed"),this._triggerEvent("start",this.mouseDownEvent),this._triggerEvent("move",e),document.addEventListener("keydown",this._keyEvent)),e.stopPropagation()}_mouseUp(e){this.moving&&(this._triggerEvent("stop",e),document.removeEventListener("keydown",this._keyEvent)),this.el.classList.remove("ui-resizable-armed"),document.removeEventListener("mousemove",this._mouseMove,!0),document.removeEventListener("mouseup",this._mouseUp,!0),hi&&(this.el.removeEventListener("touchmove",Br),this.el.removeEventListener("touchend",en),this.el.removeEventListener("touchcancel",en)),delete this.moving,delete this.mouseDownEvent,e.stopPropagation(),e.preventDefault()}_keyEvent(e){var t,i;e.key==="Escape"&&((i=(t=this.host.gridstackNode)==null?void 0:t.grid)==null||i.engine.restoreInitial(),this._mouseUp(this.mouseDownEvent))}_triggerEvent(e,t){const i=this.option;return i[e]&&i[e](t),this}}$r.prefix="ui-resizable-";class tl{constructor(){this._eventRegister={}}get disabled(){return this._disabled}on(e,t){this._eventRegister[e]=t}off(e){delete this._eventRegister[e]}enable(){this._disabled=!1}disable(){this._disabled=!0}destroy(){this._eventRegister={}}triggerEvent(e,t){if(!this.disabled&&this._eventRegister[e])return this._eventRegister[e](t)}}class Ls extends tl{constructor(e,t={}){super(),this.el=e,this.option=t,this.rectScale={x:1,y:1},this._ui=()=>{const n=this.el.parentElement.getBoundingClientRect(),s={width:this.originalRect.width,height:this.originalRect.height+this.scrolled,left:this.originalRect.left,right:this.originalRect.right,top:this.originalRect.top-this.scrolled},a=this.temporalRect||s;return{position:{left:this.option.rtl?(n.right-a.right)*this.rectScale.x:(a.left-n.left)*this.rectScale.x,top:(a.top-n.top)*this.rectScale.y},size:{width:a.width*this.rectScale.x,height:a.height*this.rectScale.y}}},this._mouseOver=this._mouseOver.bind(this),this._mouseOut=this._mouseOut.bind(this),this.enable(),this._setupAutoHide(!!this.option.autoHide),this._setupHandlers()}on(e,t){super.on(e,t)}off(e){super.off(e)}enable(){super.enable(),this.el.classList.remove("ui-resizable-disabled"),this._setupAutoHide(!!this.option.autoHide)}disable(){super.disable(),this.el.classList.add("ui-resizable-disabled"),this._setupAutoHide(!1)}destroy(){this._removeHandlers(),this._setupAutoHide(!1),delete this.el,super.destroy()}updateOption(e){const t=e.handles&&e.handles!==this.option.handles,i=e.autoHide&&e.autoHide!==this.option.autoHide;return Object.assign(this.option,e),t&&(this._removeHandlers(),this._setupHandlers()),i&&this._setupAutoHide(!!this.option.autoHide),this}_setupAutoHide(e){return e?(this.el.classList.add("ui-resizable-autohide"),this.el.addEventListener("mouseover",this._mouseOver),this.el.addEventListener("mouseout",this._mouseOut)):(this.el.classList.remove("ui-resizable-autohide"),this.el.removeEventListener("mouseover",this._mouseOver),this.el.removeEventListener("mouseout",this._mouseOut),Ee.overResizeElement===this&&delete Ee.overResizeElement),this}_mouseOver(e){Ee.overResizeElement||Ee.dragElement||(Ee.overResizeElement=this,this.el.classList.remove("ui-resizable-autohide"))}_mouseOut(e){Ee.overResizeElement===this&&(delete Ee.overResizeElement,this.el.classList.add("ui-resizable-autohide"))}_setupHandlers(){return this.handlers=(this.option.handles??"se").split(",").map(e=>e.trim()).map(e=>new $r(this.el,e,{element:this.option.element,start:t=>this._resizeStart(t),stop:t=>this._resizeStop(t),move:t=>this._resizing(t,e)})),this}_resizeStart(e){this.sizeToContent=X.shouldSizeToContent(this.el.gridstackNode,!0),this.originalRect=this.el.getBoundingClientRect(),this.scrollEl=X.getScrollElement(this.el),this.scrollY=this.scrollEl.scrollTop,this.scrolled=0,this.startEvent=e,X.pauseIframePointerEvents(!0),this._setupHelper(),this._applyChange();const t=X.initEvent(e,{type:"resizestart",target:this.el});return this.option.start&&this.option.start(t,this._ui()),this.el.classList.add("ui-resizable-resizing"),this.triggerEvent("resizestart",t),this}_resizing(e,t){this.scrolled=this.scrollEl.scrollTop-this.scrollY,this.temporalRect=this._getChange(e,t),this._applyChange();const i=X.initEvent(e,{type:"resize",target:this.el});return i.resizeDir=t,i.hasMovedX=this.option.rtl?t.includes("e"):t.includes("w"),i.hasMovedY=t.includes("n"),this.option.resize&&this.option.resize(i,this._ui()),this.triggerEvent("resize",i),this}_resizeStop(e){const t=X.initEvent(e,{type:"resizestop",target:this.el});return X.pauseIframePointerEvents(!1),this._cleanHelper(),this.option.stop&&this.option.stop(t),this.el.classList.remove("ui-resizable-resizing"),this.triggerEvent("resizestop",t),delete this.startEvent,delete this.originalRect,delete this.temporalRect,delete this.scrollY,delete this.scrolled,this}_setupHelper(){this.elOriginStyleVal=Ls._originStyleProp.map(i=>this.el.style[i]);const e=this.el.parentElement;this.parentOriginStylePosition=e.style.position;const t=X.getValuesFromTransformedElement(e);return this.rectScale={x:t.xScale,y:t.yScale},getComputedStyle(e).position.match(/static/)&&(e.style.position="relative"),this.el.style.position="absolute",this.el.style.opacity="0.8",this}_cleanHelper(){return Ls._originStyleProp.forEach((e,t)=>{this.el.style[e]=this.elOriginStyleVal[t]||null}),this.el.parentElement.style.position=this.parentOriginStylePosition||null,this}_getChange(e,t){const i=this.startEvent,n={width:this.originalRect.width,height:this.originalRect.height+this.scrolled,left:this.originalRect.left,right:this.originalRect.right,top:this.originalRect.top-this.scrolled},s=e.clientX-i.clientX,a=this.sizeToContent?0:e.clientY-i.clientY;let o=!1,c=!1;const l=this.option.rtl;!l&&t.indexOf("e")>-1?n.width+=s:l&&t.indexOf("w")>-1?n.width-=s:!l&&t.indexOf("w")>-1?(n.width-=s,n.left+=s,o=!0):l&&t.indexOf("e")>-1&&(n.width+=s,n.right+=s,o=!0),t.indexOf("s")>-1?n.height+=a:t.indexOf("n")>-1&&(n.height-=a,n.top+=a,c=!0);const h=this._constrainSize(n.width,n.height,o,c);return Math.round(n.width)!==Math.round(h.width)&&(!l&&t.indexOf("w")>-1?n.left+=n.width-h.width:l&&t.indexOf("e")>-1&&(n.right-=n.width-h.width),n.width=h.width),Math.round(n.height)!==Math.round(h.height)&&(t.indexOf("n")>-1&&(n.top+=n.height-h.height),n.height=h.height),n}_constrainSize(e,t,i,n){const s=this.option,a=(i?s.maxWidthMoveLeft:s.maxWidth)||Number.MAX_SAFE_INTEGER,o=(s.minWidth??0)/this.rectScale.x||e,c=(n?s.maxHeightMoveUp:s.maxHeight)||Number.MAX_SAFE_INTEGER,l=(s.minHeight??0)/this.rectScale.y||t,h=Math.min(a,Math.max(o,e)),d=Math.min(c,Math.max(l,t));return{width:h,height:d}}_applyChange(){let e={left:0,right:0,top:0,width:0,height:0};if(this.el.style.position==="absolute"){const i=this.el.parentElement,{left:n,right:s,top:a}=i.getBoundingClientRect();e={left:n,right:s,top:a,width:0,height:0}}if(!this.temporalRect)return this;const t=e;return Object.entries(this.temporalRect).forEach(([i,n])=>{if(this.option.rtl?i==="left":i==="right")return;const s=i==="width"||i==="left"||i==="right"?this.rectScale.x:i==="height"||i==="top"?this.rectScale.y:1;let a;i==="right"?a=(e.right-n)*this.rectScale.x+"px":a=(n-t[i])*s+"px",this.el.style[i]=a}),this}_removeHandlers(){return this.handlers.forEach(e=>e.destroy()),delete this.handlers,this}}Ls._originStyleProp=["width","height","position","left","right","top","opacity","zIndex"];const j0='input,textarea,button,select,option,[contenteditable="true"],.ui-resizable-handle';class qn extends tl{constructor(e,t={}){var s;super(),this.el=e,this.option=t,this.dragTransform={xScale:1,yScale:1,xOffset:0,yOffset:0},this._autoScrollTick=()=>{const a=this.helper,o=this._autoScrollContainer;if(!a||!o){this._stopScrolling();return}const c=this._getClipping(a,o);if(c===0){this._stopScrolling();return}if(!this._autoScrollMaxSpeed){const f=window.innerHeight||document.documentElement.clientHeight;this._autoScrollMaxSpeed=Math.max(f/150,4)}const l=Math.abs(c),h=Math.min(l*.5,this._autoScrollMaxSpeed),d=c>0?h:-h,u=o.scrollTop;if(o.scrollTop+=d,o.scrollTop===u){this._stopScrolling();return}this.dragging&&this.lastDrag&&(this._dragFollow(this.lastDrag),this._callDrag(this.lastDrag)),this._autoScrollAnimId=requestAnimationFrame(this._autoScrollTick)};const i=(s=t==null?void 0:t.handle)==null?void 0:s.substring(1),n=e.gridstackNode;this.dragEls=!i||e.classList.contains(i)?[e]:n!=null&&n.subGrid?[e.querySelector(t.handle)||e]:this.getAllHandles(),this.dragEls.length===0&&(this.dragEls=[e]),this._mouseDown=this._mouseDown.bind(this),this._mouseMove=this._mouseMove.bind(this),this._mouseUp=this._mouseUp.bind(this),this._keyEvent=this._keyEvent.bind(this),this.enable()}getAllHandles(){return Array.from(this.el.querySelectorAll(this.option.handle)).filter(e=>{if(!(e instanceof HTMLElement))return!1;const t=e.closest(".grid-stack-item");return t===this.el||!t})}on(e,t){super.on(e,t)}off(e){super.off(e)}enable(){this.disabled!==!1&&(super.enable(),this.dragEls.forEach(e=>{e.addEventListener("mousedown",this._mouseDown),hi&&(e.addEventListener("touchstart",kr),e.addEventListener("pointerdown",zr))}),this.el.classList.remove("ui-draggable-disabled"))}disable(e=!1){this.disabled!==!0&&(super.disable(),el(),this.dragEls.forEach(t=>{t.removeEventListener("mousedown",this._mouseDown),hi&&(t.removeEventListener("touchstart",kr),t.removeEventListener("pointerdown",zr))}),e||this.el.classList.add("ui-draggable-disabled"))}destroy(){this.dragTimeout&&window.clearTimeout(this.dragTimeout),delete this.dragTimeout,this.mouseDownEvent&&this._mouseUp(this.mouseDownEvent),this.disable(!0),delete this.el,delete this.option,super.destroy()}updateOption(e){return Object.assign(this.option,e),this}refreshHandles(){var n,s;const e=this.disabled;e||this.disable(!0);const t=(s=(n=this.option)==null?void 0:n.handle)==null?void 0:s.substring(1),i=this.el.gridstackNode;this.dragEls=!t||this.el.classList.contains(t)?[this.el]:i!=null&&i.subGrid?[this.el.querySelector(this.option.handle)||this.el]:this.getAllHandles(),this.dragEls.length===0&&(this.dragEls=[this.el]),e||this.enable()}_mouseDown(e){return e.isTrusted&&(_t.touchHandled&&(_t.touchHandled=!1),Ee.mouseHandled&&e.timeStamp!==Ee.mouseHandledTimeStamp&&delete Ee.mouseHandled),Ee.mouseHandled||e.button!==0||!this.dragEls.find(t=>t===e.target)&&e.target.closest(j0)||this.option.cancel&&e.target.closest(this.option.cancel)||(this.mouseDownEvent=e,delete this.dragging,delete Ee.dragElement,delete Ee.dropElement,delete this._autoScrollMaxSpeed,delete this._autoScrollContainer,document.addEventListener("mousemove",this._mouseMove,{capture:!0,passive:!0}),document.addEventListener("mouseup",this._mouseUp,!0),hi&&e.currentTarget&&(e.currentTarget.addEventListener("touchmove",Br),e.currentTarget.addEventListener("touchend",en),e.currentTarget.addEventListener("touchcancel",en)),_t.wasDelayed&&this.el.classList.add("ui-draggable-armed"),e.preventDefault(),document.activeElement&&document.activeElement.blur(),Ee.mouseHandled=!0,Ee.mouseHandledTimeStamp=e.timeStamp),!0}_callDrag(e){if(!this.dragging)return;const t=X.initEvent(e,{target:this.el,type:"drag"});this.option.drag&&this.option.drag(t,this.ui()),this.triggerEvent("drag",t)}_mouseMove(e){var i,n;const t=this.mouseDownEvent;if(this.lastDrag=e,this.dragging)if(this._dragFollow(e),Ee.pauseDrag){const s=Number.isInteger(Ee.pauseDrag)?Ee.pauseDrag:100;this.dragTimeout&&window.clearTimeout(this.dragTimeout),this.dragTimeout=window.setTimeout(()=>this._callDrag(e),s)}else this._callDrag(e);else if(Math.abs(e.x-t.x)+Math.abs(e.y-t.y)>3){this.dragging=!0,X.pauseIframePointerEvents(!0),this.el.classList.remove("ui-draggable-armed"),Ee.dragElement=this;const s=(i=this.el.gridstackNode)==null?void 0:i.grid;s?Ee.dropElement=(n=s.el.ddElement)==null?void 0:n.ddDroppable:delete Ee.dropElement,this.helper=this._createHelper(),this._setupHelperContainmentStyle(),this.dragTransform=X.getValuesFromTransformedElement(this.helperContainment),this.dragOffset=this._getDragOffset(e,this.el,this.helperContainment),this._setupHelperStyle(e);const a=X.initEvent(e,{target:this.el,type:"dragstart"});this.option.start&&this.option.start(a,this.ui()),this.triggerEvent("dragstart",a),document.addEventListener("keydown",this._keyEvent)}return!0}_mouseUp(e){var t,i;if(this._stopScrolling(),this.el.classList.remove("ui-draggable-armed"),document.removeEventListener("mousemove",this._mouseMove,!0),document.removeEventListener("mouseup",this._mouseUp,!0),hi&&e.currentTarget&&(e.currentTarget.removeEventListener("touchmove",Br,!0),e.currentTarget.removeEventListener("touchend",en,!0),e.currentTarget.removeEventListener("touchcancel",en,!0)),this.dragging){delete this.dragging,X.pauseIframePointerEvents(!1),(t=this.el.gridstackNode)==null||delete t._origRotate,document.removeEventListener("keydown",this._keyEvent),((i=Ee.dropElement)==null?void 0:i.el)===this.el.parentElement&&delete Ee.dropElement,this.helperContainment.style.position=this.parentOriginStylePosition||null,this.helper&&this.helper!==this.el&&this.helper.remove(),this._removeHelperStyle();const n=X.initEvent(e,{target:this.el,type:"dragstop"});this.option.stop&&this.option.stop(n),this.triggerEvent("dragstop",n),Ee.dropElement&&Ee.dropElement.drop(e)}delete this.helper,delete this.mouseDownEvent,delete Ee.dragElement,delete Ee.dropElement,delete Ee.mouseHandled,delete Ee.mouseHandledTimeStamp,e.preventDefault()}_keyEvent(e){var n,s;const t=this.el.gridstackNode,i=(t==null?void 0:t.grid)||((s=(n=Ee.dropElement)==null?void 0:n.el)==null?void 0:s.gridstack);if(e.key==="Escape")t&&t._origRotate&&(t._orig=t._origRotate,delete t._origRotate),i==null||i.cancelDrag(),this._mouseUp(this.mouseDownEvent);else if(t&&i&&(e.key==="r"||e.key==="R")){if(!X.canBeRotated(t))return;t._origRotate=t._origRotate||{...t._orig},delete t._moving,i.setAnimation(!1).rotate(t.el,{top:-this.dragOffset.offsetTop,left:-this.dragOffset.offsetX}).setAnimation(),t._moving=!0,this.dragOffset=this._getDragOffset(this.lastDrag,t.el,this.helperContainment),this.helper.style.width=this.dragOffset.width+"px",this.helper.style.height=this.dragOffset.height+"px",X.swap(t._orig,"w","h"),delete t._rect,this._mouseMove(this.lastDrag)}}_createHelper(){let e=this.el;return typeof this.option.helper=="function"?e=this.option.helper(this.el):this.option.helper==="clone"&&(e=X.cloneNode(this.el)),e.parentElement||X.appendTo(e,this.option.appendTo==="parent"?this.el.parentElement:this.option.appendTo??"body"),this.dragElementOriginStyle=qn.originStyleProp.map(t=>this.el.style[t]),e}_setupHelperStyle(e){var i,n;this.helper.classList.add("ui-draggable-dragging"),(n=(i=this.el.gridstackNode)==null?void 0:i.grid)==null||n.el.classList.add("grid-stack-dragging");const t=this.helper.style;return t.pointerEvents="none",t.width=this.dragOffset.width+"px",t.height=this.dragOffset.height+"px",t.willChange="left, right, top",t.position="fixed",this._dragFollow(e),t.transition="none",setTimeout(()=>{this.helper&&(t.transition=null)},0),this}_removeHelperStyle(){var t,i,n;this.helper.classList.remove("ui-draggable-dragging"),(i=(t=this.el._gridstackNodeOrig||this.el.gridstackNode)==null?void 0:t.grid)==null||i.el.classList.remove("grid-stack-dragging");const e=(n=this.helper)==null?void 0:n.gridstackNode;if(!(e!=null&&e._isAboutToRemove)&&this.dragElementOriginStyle){const s=this.helper,a=this.dragElementOriginStyle,o=qn.originStyleProp.indexOf("transition"),c=a[o]||null;s.style.transition=a[o]="none";const l=s.style;qn.originStyleProp.forEach((h,d)=>l[h]=a[d]||null),setTimeout(()=>s.style.transition=c||"",50)}return delete this.dragElementOriginStyle,this}_dragFollow(e){const t=this.helper.style,i=this.dragOffset;this.option.rtl?(t.right=(window.innerWidth-e.clientX+i.offsetX)*this.dragTransform.xScale+"px",t.left&&(t.left="")):(t.left=(e.clientX+i.offsetX)*this.dragTransform.xScale+"px",t.right&&(t.right="")),t.top=(e.clientY+i.offsetTop)*this.dragTransform.yScale+"px"}_setupHelperContainmentStyle(){return this.helperContainment=this.helper.parentElement,this.helper.style.position!=="fixed"&&(this.parentOriginStylePosition=this.helperContainment.style.position,getComputedStyle(this.helperContainment).position.match(/static/)&&(this.helperContainment.style.position="relative")),this}_getDragOffset(e,t,i){let n=0,s=0;i&&(n=this.dragTransform.xOffset,s=this.dragTransform.yOffset);const a=t.getBoundingClientRect();let o=this.option.rtl?a.right:a.left,c=this.option.rtl?e.clientX-a.right+n:-e.clientX+a.left-n;return{x:o,top:a.top,offsetX:c,offsetTop:-e.clientY+a.top-s,width:a.width*this.dragTransform.xScale,height:a.height*this.dragTransform.yScale}}updateScrollPosition(e){this._autoScrollContainer=X.getScrollElement(e),this._getClipping(this.helper,this._autoScrollContainer)===0?this._stopScrolling():this._autoScrollAnimId||(this._autoScrollAnimId=requestAnimationFrame(this._autoScrollTick))}_getClipping(e,t){const i=e.getBoundingClientRect(),n=t.getBoundingClientRect(),s=window.innerHeight||document.documentElement.clientHeight;if(i.bottom<n.top||i.top>n.bottom)return 0;const a=i.bottom-Math.min(n.bottom,s),o=i.top-Math.max(n.top,0);return o<0?o:a>0?a:0}_stopScrolling(){this._autoScrollAnimId&&(cancelAnimationFrame(this._autoScrollAnimId),delete this._autoScrollAnimId)}ui(){const t=this.el.parentElement.getBoundingClientRect(),i=this.helper.getBoundingClientRect(),n=this.option.rtl?(t.right-i.right)*this.dragTransform.xScale:(i.left-t.left)*this.dragTransform.xScale;return{position:{top:(i.top-t.top)*this.dragTransform.yScale,left:n}}}}qn.originStyleProp=["width","height","transform","transform-origin","transition","pointerEvents","position","left","right","top","minWidth","willChange"];class Q0 extends tl{constructor(e,t={}){super(),this.el=e,this.option=t,this._mouseEnter=this._mouseEnter.bind(this),this._mouseLeave=this._mouseLeave.bind(this),this.eventEl=this.el.closest(".grid-stack-item")||this.el,this.enable(),this._setupAccept()}on(e,t){super.on(e,t)}off(e){super.off(e)}enable(){this.disabled!==!1&&(super.enable(),this.el.classList.add("ui-droppable"),this.el.classList.remove("ui-droppable-disabled"),this.eventEl.addEventListener("mouseenter",this._mouseEnter),this.eventEl.addEventListener("mouseleave",this._mouseLeave),hi&&(this.eventEl.addEventListener("pointerenter",qc),this.eventEl.addEventListener("pointerleave",Yc)))}disable(e=!1){this.disabled!==!0&&(super.disable(),this.el.classList.remove("ui-droppable"),e||this.el.classList.add("ui-droppable-disabled"),this.eventEl.removeEventListener("mouseenter",this._mouseEnter),this.eventEl.removeEventListener("mouseleave",this._mouseLeave),hi&&(this.eventEl.removeEventListener("pointerenter",qc),this.eventEl.removeEventListener("pointerleave",Yc)))}destroy(){this.disable(!0),this.el.classList.remove("ui-droppable"),this.el.classList.remove("ui-droppable-disabled"),super.destroy()}updateOption(e){return Object.assign(this.option,e),this._setupAccept(),this}_mouseEnter(e){if(!Ee.dragElement||_t.touchHandled&&e.isTrusted||!this._canDrop(Ee.dragElement.el))return;e.preventDefault(),e.stopPropagation(),Ee.dragElement._stopScrolling(),Ee.dropElement&&Ee.dropElement!==this&&Ee.dropElement._mouseLeave(e,!0),Ee.dropElement=this;const t=X.initEvent(e,{target:this.el,type:"dropover"});this.option.over&&this.option.over(t,this._ui(Ee.dragElement)),this.triggerEvent("dropover",t),this.el.classList.add("ui-droppable-over")}_mouseLeave(e,t=!1){var n;if(!Ee.dragElement||Ee.dropElement!==this)return;e.preventDefault(),e.stopPropagation(),t&&Ee.dragElement._stopScrolling();const i=X.initEvent(e,{target:this.el,type:"dropout"});if(this.option.out&&this.option.out(i,this._ui(Ee.dragElement)),this.triggerEvent("dropout",i),Ee.dropElement===this&&(delete Ee.dropElement,!t)){let s,a=this.el.parentElement;for(;!s&&a;)s=(n=a.ddElement)==null?void 0:n.ddDroppable,a=a.parentElement;s&&s._mouseEnter(e)}}drop(e){e.preventDefault();const t=X.initEvent(e,{target:this.el,type:"drop"});this.option.drop&&this.option.drop(t,this._ui(Ee.dragElement)),this.triggerEvent("drop",t)}_canDrop(e){return e&&(!this.accept||this.accept(e))}_setupAccept(){return this.option.accept?(typeof this.option.accept=="string"?this.accept=e=>e.classList.contains(this.option.accept)||e.matches(this.option.accept):this.accept=this.option.accept,this):this}_ui(e){return{draggable:e.el,...e.ui()}}}class il{static init(e){return e.ddElement||(e.ddElement=new il(e)),e.ddElement}constructor(e){this.el=e}on(e,t){return this.ddDraggable&&["drag","dragstart","dragstop"].indexOf(e)>-1?this.ddDraggable.on(e,t):this.ddDroppable&&["drop","dropover","dropout"].indexOf(e)>-1?this.ddDroppable.on(e,t):this.ddResizable&&["resizestart","resize","resizestop"].indexOf(e)>-1&&this.ddResizable.on(e,t),this}off(e){return this.ddDraggable&&["drag","dragstart","dragstop"].indexOf(e)>-1?this.ddDraggable.off(e):this.ddDroppable&&["drop","dropover","dropout"].indexOf(e)>-1?this.ddDroppable.off(e):this.ddResizable&&["resizestart","resize","resizestop"].indexOf(e)>-1&&this.ddResizable.off(e),this}setupDraggable(e){return this.ddDraggable?this.ddDraggable.updateOption(e):this.ddDraggable=new qn(this.el,e),this}cleanDraggable(){return this.ddDraggable&&(this.ddDraggable.destroy(),delete this.ddDraggable),this}setupResizable(e){return this.ddResizable?this.ddResizable.updateOption(e):this.ddResizable=new Ls(this.el,e),this}cleanResizable(){return this.ddResizable&&(this.ddResizable.destroy(),delete this.ddResizable),this}setupDroppable(e){return this.ddDroppable?this.ddDroppable.updateOption(e):this.ddDroppable=new Q0(this.el,e),this}cleanDroppable(){return this.ddDroppable&&(this.ddDroppable.destroy(),delete this.ddDroppable),this}}class ex{resizable(e,t,i,n){return this._getDDElements(e,typeof t=="string"?t:void 0).forEach(s=>{if(t==="disable"||t==="enable")s.ddResizable&&s.ddResizable[t]();else if(t==="destroy")s.ddResizable&&s.cleanResizable();else if(t==="option")s.setupResizable({[i]:n});else{const o=s.el.gridstackNode.grid;let c=s.el.getAttribute("gs-resize-handles")||o.opts.resizable.handles||"e,s,se";c==="all"&&(c="n,e,s,w,se,sw,ne,nw");const l=!o.opts.alwaysShowResizeHandle,h=t;s.setupResizable({...o.opts.resizable,handles:c,autoHide:l,start:h.start,stop:h.stop,resize:h.resize,rtl:h.rtl})}}),this}draggable(e,t,i,n){return this._getDDElements(e,typeof t=="string"?t:void 0).forEach(s=>{if(t==="disable"||t==="enable")s.ddDraggable&&s.ddDraggable[t]();else if(t==="destroy")s.ddDraggable&&s.cleanDraggable();else if(t==="option")s.setupDraggable({[i]:n});else{const a=s.el.gridstackNode.grid,o=t;s.setupDraggable({...a.opts.draggable,start:o.start,stop:o.stop,drag:o.drag,rtl:o.rtl})}}),this}dragIn(e,t){return this._getDDElements(e).forEach(i=>i.setupDraggable(t)),this}droppable(e,t,i,n){if(typeof t!="string"){const a=t;typeof a.accept=="function"&&!a._accept&&(a._accept=a.accept,a.accept=o=>a._accept(o))}const s=typeof t=="string"?t:void 0;return this._getDDElements(e,s).forEach(a=>{t==="disable"||t==="enable"?a.ddDroppable&&a.ddDroppable[t]():t==="destroy"?a.ddDroppable&&a.cleanDroppable():t==="option"?a.setupDroppable({[i]:n}):a.setupDroppable(t)}),this}isDroppable(e){var t;return!!((t=e==null?void 0:e.ddElement)!=null&&t.ddDroppable&&!e.ddElement.ddDroppable.disabled)}isDraggable(e){var t;return!!((t=e==null?void 0:e.ddElement)!=null&&t.ddDraggable&&!e.ddElement.ddDraggable.disabled)}isResizable(e){var t;return!!((t=e==null?void 0:e.ddElement)!=null&&t.ddResizable&&!e.ddElement.ddResizable.disabled)}on(e,t,i){return this._getDDElements(e).forEach(n=>n.on(t,s=>{i(s,Ee.dragElement?Ee.dragElement.el:s.target,Ee.dragElement?Ee.dragElement.helper:void 0)})),this}off(e,t){return this._getDDElements(e).forEach(i=>i.off(t)),this}_getDDElements(e,t){const i=e.gridstack||t!=="destroy"&&t!=="disable",n=X.getElements(e);return n.length?n.map(a=>a.ddElement||(i?il.init(a):null)).filter(a=>!!a):[]}}/*!
 * GridStack 13.3.0
 * https://gridstackjs.com/
 *
 * Copyright (c) 2021-2025  Alain Dumesny
 * see root license https://github.com/gridstack/gridstack.js/tree/master/LICENSE
 */const Bt=new ex;class Ce{static init(e={},t=".grid-stack"){if(typeof document>"u")return null;const i=Ce.getGridElement(t);return i?(i.gridstack||(i.gridstack=new Ce(i,X.cloneDeep(e))),i.gridstack):(console.error(typeof t=="string"?'GridStack.initAll() no grid was found with selector "'+t+`" - element missing or wrong selector ?
Note: ".grid-stack" is required for proper CSS styling and drag/drop, and is the default selector.`:"GridStack.init() no grid element was passed."),null)}static initAll(e={},t=".grid-stack"){const i=[];return typeof document>"u"||(Ce.getGridElements(t).forEach(n=>{n.gridstack||(n.gridstack=new Ce(n,X.cloneDeep(e))),i.push(n.gridstack)}),i.length===0&&console.error('GridStack.initAll() no grid was found with selector "'+t+`" - element missing or wrong selector ?
Note: ".grid-stack" is required for proper CSS styling and drag/drop, and is the default selector.`)),i}static addGrid(e,t={}){if(!e)return null;let i=e;if(i.gridstack){const a=i.gridstack;return t&&(a.opts={...a.opts,...t}),t.children!==void 0&&a.load(t.children),a}return(!e.classList.contains("grid-stack")||Ce.addRemoveCB)&&(Ce.addRemoveCB?i=Ce.addRemoveCB(e,t,!0,!0):i=X.createDiv(["grid-stack",t.class],e)),Ce.init(t,i)}static registerEngine(e){Ce.engineClass=e}get placeholder(){if(!this._placeholder){this._placeholder=X.createDiv([this.opts.placeholderClass,$t.itemClass,this.opts.itemClass]);const e=X.createDiv(["placeholder-content"],this._placeholder);this.opts.placeholderText&&(e.textContent=this.opts.placeholderText)}return this._placeholder}constructor(e,t={}){var l;this.el=e,this.opts=t,this.animationDelay=310,this._gsEventHandler={},this._extraDragRow=0,this.dragTransform={xScale:1,yScale:1,xOffset:0,yOffset:0},e.gridstack=this,this.opts=t=t||{},e.classList.contains("grid-stack")||this.el.classList.add("grid-stack"),t.row&&(t.minRow=t.maxRow=t.row,delete t.row);const i=X.toNumber(e.getAttribute("gs-row"));t.column==="auto"&&delete t.column,t.alwaysShowResizeHandle!==void 0&&(t._alwaysShowResizeHandle=t.alwaysShowResizeHandle);const n=t.columnOpts;if(n){const h=n.breakpoints;!n.columnWidth&&!(h!=null&&h.length)?delete t.columnOpts:h&&h.length>1?(h.sort((d,u)=>(u.w||0)-(d.w||0)),delete n.columnWidth):n.columnMax=n.columnMax||12}const s={...X.cloneDeep($t),column:X.toNumber(e.getAttribute("gs-column"))||$t.column,minRow:i||X.toNumber(e.getAttribute("gs-min-row"))||$t.minRow,maxRow:i||X.toNumber(e.getAttribute("gs-max-row"))||$t.maxRow,staticGrid:X.toBool(e.getAttribute("gs-static"))||$t.staticGrid,sizeToContent:X.toBool(e.getAttribute("gs-size-to-content"))||void 0,draggable:{handle:(t.handleClass?"."+t.handleClass:t.handle?t.handle:"")||$t.draggable.handle},removableOptions:{accept:t.itemClass||$t.removableOptions.accept,decline:$t.removableOptions.decline}};e.getAttribute("gs-animate")&&(s.animate=X.toBool(e.getAttribute("gs-animate"))),t=X.defaults(t,s),this._initMargin(),this.checkDynamicColumn(),this._updateColumnVar(t),t.rtl==="auto"&&(t.rtl=e.style.direction==="rtl"),t.rtl&&this.el.classList.add("grid-stack-rtl");const a=this.el.closest("."+$t.itemClass),o=a==null?void 0:a.gridstackNode;if(o&&(o.subGrid=this,this.parentGridNode=o,this.el.classList.add("grid-stack-nested"),o.el.classList.add("grid-stack-sub-grid")),this._isAutoCellHeight=t.cellHeight==="auto",this._isAutoCellHeight||t.cellHeight==="initial")this.cellHeight(void 0);else{typeof t.cellHeight=="number"&&t.cellHeightUnit&&t.cellHeightUnit!==$t.cellHeightUnit&&(t.cellHeight=t.cellHeight+t.cellHeightUnit,delete t.cellHeightUnit);const h=t.cellHeight;delete t.cellHeight,this.cellHeight(h)}t.alwaysShowResizeHandle==="mobile"&&(t.alwaysShowResizeHandle=hi),this._setStaticClass();const c=t.engineClass||Ce.engineClass||Ni;if(this.engine=new c({column:this.getColumn(),float:t.float,maxRow:t.maxRow,onChange:h=>{h.forEach(d=>{const u=d.el;u&&(d._removeDOM?(u&&u.remove(),delete d._removeDOM):this._writePosAttr(u,d))}),this._updateContainerHeight()}}),t.auto&&(this.batchUpdate(),this.engine._loading=!0,this.getGridItems().forEach(h=>this._prepareElement(h)),delete this.engine._loading,this.batchUpdate(!1)),t.children){const h=t.children;delete t.children,h.length&&this.load(h)}this.setAnimation(),t.subGridDynamic&&!Ee.pauseDrag&&(Ee.pauseDrag=!0),((l=t.draggable)==null?void 0:l.pause)!==void 0&&(Ee.pauseDrag=t.draggable.pause),this._setupRemoveDrop(),this._setupAcceptWidget(),this._updateResizeEvent()}_updateColumnVar(e=this.opts){this.el.classList.add("gs-"+e.column),typeof e.column=="number"&&(this.el.style.setProperty("--gs-column-width",`${100/e.column}%`),this.el.style.setProperty("--gs-columns",String(e.column)))}addWidget(e){if(!e)return;if(typeof e=="string"){console.error("V11: GridStack.addWidget() does not support string anymore. see #2736");return}if(e.ELEMENT_NODE)return console.error("V11: GridStack.addWidget() does not support HTMLElement anymore. use makeWidget()"),this.makeWidget(e);let t,i=e;if(i.grid=this,i.el?t=i.el:Ce.addRemoveCB?t=Ce.addRemoveCB(this.el,e,!0,!1):t=this.createWidgetDivs(i),!t)return;if(i=t.gridstackNode,i&&t.parentElement===this.el&&this.engine.nodes.find(s=>s._id===i._id))return t;const n=this._readAttr(t);return X.defaults(e,n),this.engine.prepareNode(e),this.el.appendChild(t),this.makeWidget(t,e),t}createWidgetDivs(e){const t=X.createDiv(["grid-stack-item",this.opts.itemClass]),i=X.createDiv(["grid-stack-item-content"],t);return X.lazyLoad(e)?e.visibleObservable||(e.visibleObservable=new IntersectionObserver(([n])=>{var s,a;n.isIntersecting&&((s=e.visibleObservable)==null||s.disconnect(),delete e.visibleObservable,Ce.renderCB(i,e),(a=e.grid)==null||a.prepareDragDrop(e.el))}),window.setTimeout(()=>{var n;return(n=e.visibleObservable)==null?void 0:n.observe(t)})):Ce.renderCB(i,e),t}makeSubGrid(e,t,i,n=!0){var f,g,v;let s=e.gridstackNode;if(s||(s=this.makeWidget(e).gridstackNode),(f=s.subGrid)!=null&&f.el)return s.subGrid;let a,o=this;for(;o&&!a;)a=(g=o.opts)==null?void 0:g.subGridOpts,o=(v=o.parentGridNode)==null?void 0:v.grid;t=X.cloneDeep({...this.opts,id:void 0,children:void 0,column:"auto",columnOpts:void 0,layout:"list",subGridOpts:void 0,...a||{},...t||s.subGridOpts||{}}),s.subGridOpts=t;let c=!1;t.column==="auto"&&(c=!0,t.column=Math.max(s.w||1,(i==null?void 0:i.w)||1),delete t.columnOpts);let l=s.el.querySelector(".grid-stack-item-content"),h,d;if(n&&(this._removeDD(s.el),d={...s,x:0,y:0},X.removeInternalForSave(d),delete d.subGridOpts,s.content&&(d.content=s.content,delete s.content),Ce.addRemoveCB?h=Ce.addRemoveCB(this.el,d,!0,!1)||void 0:(h=X.createDiv(["grid-stack-item"]),h.appendChild(l),l=X.createDiv(["grid-stack-item-content"],s.el)),this.prepareDragDrop(s.el)),i){const m=c?t.column:s.w,p=s.h+i.h,M=s.el.style;M.transition="none",this.update(s.el,{w:m,h:p}),setTimeout(()=>M.transition="")}const u=s.subGrid=Ce.addGrid(l,t)||void 0;return i!=null&&i._moving&&(u._isTemp=!0),c&&(u._autoColumn=!0),n&&u.makeWidget(h,d),i&&(i._moving?window.setTimeout(()=>X.simulateMouseEvent(i._event,"mouseenter",u.el),0):u.makeWidget(s.el,s)),this.resizeToContentCheck(!1,s),u}removeAsSubGrid(e){var i,n;const t=(i=this.parentGridNode)==null?void 0:i.grid;if(t&&(t.batchUpdate(),t.removeWidget(this.parentGridNode.el,!0,!0),this.engine.nodes.forEach(s=>{s.x=(s.x??0)+(this.parentGridNode.x??0),s.y=(s.y??0)+(this.parentGridNode.y??0),this._removeDD(s.el),s.el.remove(),delete s.el.gridstackNode,t.makeWidget(s.el,s)}),t.batchUpdate(!1),this.parentGridNode&&delete this.parentGridNode.subGrid,delete this.parentGridNode,e)){const s=(n=e.el)==null?void 0:n.gridstackNode;s&&s!==e&&(s._temporaryRemoved=!0),window.setTimeout(()=>{var o;const a=((o=Ee.dragElement)==null?void 0:o.lastDrag)||e._event;a&&X.simulateMouseEvent(a,"mouseenter",t.el)},0)}}save(e=!0,t=!1,i=Ce.saveCB,n){const s=this.engine.save(e,i,n);if(s.forEach(a=>{var o;if(e&&a.el&&!a.subGrid&&!i){const c=a.el.querySelector(".grid-stack-item-content");a.content=c==null?void 0:c.innerHTML,a.content||delete a.content}else if(!e&&!i&&delete a.content,(o=a.subGrid)!=null&&o.el){const c=a.w||a.subGrid.getColumn(),l=a.subGrid.save(e,t,i,c);a.subGridOpts=t?l:{children:l},delete a.subGrid}delete a.el}),t){const a=X.cloneDeep(this.opts);a.marginBottom===a.marginTop&&a.marginRight===a.marginLeft&&a.marginTop===a.marginRight&&(a.margin=a.marginTop,delete a.marginTop,delete a.marginRight,delete a.marginBottom,delete a.marginLeft),a.rtl===(this.el.style.direction==="rtl")&&(a.rtl="auto"),this._isAutoCellHeight&&(a.cellHeight="auto"),this._autoColumn&&(a.column="auto");const o=a._alwaysShowResizeHandle;return delete a._alwaysShowResizeHandle,o!==void 0?a.alwaysShowResizeHandle=o:delete a.alwaysShowResizeHandle,X.removeInternalAndSame(a,$t),a.children=s,a}return s}load(e,t=Ce.addRemoveCB||!0){e.forEach(h=>{h.w=h.w||h.minW||1,h.h=h.h||h.minH||1}),e=X.sort(e),this.engine.skipCacheUpdate=this._ignoreLayoutsNodeChange=!0;let i=0;e.forEach(h=>{i=Math.max(i,(h.x||0)+h.w)}),i>this.engine.defaultColumn&&(this.engine.defaultColumn=i);const n=this.getColumn();i>n&&(this.engine.nodes.length===0&&this.responseLayout?(this.engine.nodes=e,this.engine.columnChanged(i,n,this.responseLayout),e=this.engine.nodes,this.engine.nodes=[],delete this.responseLayout):this.engine.cacheLayout(e,i,!0));const s=Ce.addRemoveCB;typeof t=="function"&&(Ce.addRemoveCB=t);const a=[];this.batchUpdate();const o=!this.engine.nodes.length,c=o&&this.opts.animate;c&&this.setAnimation(!1),!o&&t&&[...this.engine.nodes].forEach(d=>{if(!d.id)return;X.find(e,d.id)||(Ce.addRemoveCB&&Ce.addRemoveCB(this.el,d,!1,!1),a.push(d),this.removeWidget(d.el,!0,!1))}),this.engine._loading=!0;const l=[];return this.engine.nodes=this.engine.nodes.filter(h=>h.id&&X.find(e,h.id)?(l.push(h),!1):!0),e.forEach(h=>{var u;const d=h.id?X.find(l,h.id):void 0;if(d){if(X.shouldSizeToContent(d)&&(h.h=d.h),this.engine.nodeBoundFix(h),(h.autoPosition||h.x===void 0||h.y===void 0)&&(h.w=h.w||d.w,h.h=h.h||d.h,this.engine.findEmptyPosition(h)),this.engine.nodes.push(d),X.samePos(d,h)&&this.engine.nodes.length>1&&(this.moveNode(d,{...h,forceCollide:!0}),X.copyPos(h,d)),this.update(d.el,h),(u=h.subGridOpts)!=null&&u.children){const f=d.el.querySelector(".grid-stack");f&&f.gridstack&&f.gridstack.load(h.subGridOpts.children)}}else t&&this.addWidget(h)}),delete this.engine._loading,this.engine.removedNodes=a,this.batchUpdate(!1),delete this._ignoreLayoutsNodeChange,delete this.engine.skipCacheUpdate,s?Ce.addRemoveCB=s:delete Ce.addRemoveCB,c&&this.setAnimation(!0,!0),this}batchUpdate(e=!0){return this.engine.batchUpdate(e),e||(this._updateContainerHeight(),this._triggerRemoveEvent(),this._triggerAddEvent(),this._triggerChangeEvent()),this}getCellHeight(e=!1){if(this.opts.cellHeight&&this.opts.cellHeight!=="auto"&&(!e||!this.opts.cellHeightUnit||this.opts.cellHeightUnit==="px"))return this.opts.cellHeight;if(this.opts.cellHeightUnit==="rem")return this.opts.cellHeight*parseFloat(getComputedStyle(document.documentElement).fontSize);if(this.opts.cellHeightUnit==="em")return this.opts.cellHeight*parseFloat(getComputedStyle(this.el).fontSize);if(this.opts.cellHeightUnit==="cm")return this.opts.cellHeight*(96/2.54);if(this.opts.cellHeightUnit==="mm")return this.opts.cellHeight*(96/2.54)/10;const t=this.el.querySelector("."+this.opts.itemClass);if(t){const n=X.toNumber(t.getAttribute("gs-h"))||1;return Math.round(t.offsetHeight/n)}const i=parseInt(this.el.getAttribute("gs-current-row")||"0");return i?Math.round(this.el.getBoundingClientRect().height/i):this.opts.cellHeight}cellHeight(e){if(e!==void 0&&this._isAutoCellHeight!==(e==="auto")&&(this._isAutoCellHeight=e==="auto",this._updateResizeEvent()),(e==="initial"||e==="auto")&&(e=void 0),e===void 0){const i=-this.opts.marginRight-this.opts.marginLeft+this.opts.marginTop+this.opts.marginBottom;e=this.cellWidth()+i}const t=X.parseHeight(e);return this.opts.cellHeightUnit===t.unit&&this.opts.cellHeight===t.h?this:(this.opts.cellHeightUnit=t.unit,this.opts.cellHeight=t.h,this.el.style.setProperty("--gs-cell-height",`${this.opts.cellHeight}${this.opts.cellHeightUnit}`),this._updateContainerHeight(),this.resizeToContentCheck(),this)}cellWidth(){return this._widthOrContainer()/this.getColumn()}_widthOrContainer(e=!1){var t;return e&&((t=this.opts.columnOpts)!=null&&t.breakpointForWindow)?window.innerWidth:this.el.clientWidth||this.el.parentElement.clientWidth||window.innerWidth}checkDynamicColumn(){var s,a;const e=this.opts.columnOpts;if(!e||!e.columnWidth&&!((s=e.breakpoints)!=null&&s.length))return!1;const t=this.getColumn();let i=t;const n=this._widthOrContainer(!0);if(e.columnWidth)i=Math.min(Math.round(n/e.columnWidth)||1,e.columnMax);else{i=e.columnMax;let o=0;for(;o<e.breakpoints.length&&n<=e.breakpoints[o].w;)i=e.breakpoints[o++].c||t}if(i!==t){const o=(a=e.breakpoints)==null?void 0:a.find(c=>c.c===i);return this.column(i,(o==null?void 0:o.layout)||e.layout),!0}return!1}compact(e="compact",t=!0){return this.engine.compact(e,t),this._triggerChangeEvent(),this}column(e,t="moveScale"){if(!e||e<1||this.opts.column===e)return this;const i=this.getColumn();return this.opts.column=e,this.engine?(this.engine.column=e,this.el.classList.remove("gs-"+i),this._updateColumnVar(),this.engine.columnChanged(i,e,t),this._isAutoCellHeight&&this.cellHeight(),this.resizeToContentCheck(!0),this._ignoreLayoutsNodeChange=!0,this._triggerChangeEvent(),delete this._ignoreLayoutsNodeChange,this):(this.responseLayout=t,this)}getColumn(){return this.opts.column}getGridItems(){return Array.from(this.el.children).filter(e=>e.matches("."+this.opts.itemClass)&&!e.matches("."+this.opts.placeholderClass))}isIgnoreChangeCB(){return!!this._ignoreLayoutsNodeChange}destroy(e=!0){var t;return this.el?(this.offAll(),this._updateResizeEvent(!0),this.setStatic(!0,!1),this.setAnimation(!1),e?this.el.parentNode.removeChild(this.el):(this.removeAll(e),this.el.removeAttribute("gs-current-row")),this.parentGridNode&&delete this.parentGridNode.subGrid,delete this.parentGridNode,delete this.opts,(t=this._placeholder)==null||delete t.gridstackNode,delete this._placeholder,delete this.engine,delete this.el.gridstack,delete this.el,this):this}float(e){return this.opts.float!==e&&(this.opts.float=this.engine.float=e,this._triggerChangeEvent()),this}getFloat(){return this.engine.float}getCellFromPixel(e,t=!1){const i=this.el.getBoundingClientRect();let n;t?n={top:i.top+document.documentElement.scrollTop,left:i.left}:n={top:this.el.offsetTop,left:this.el.offsetLeft};const s=e.left-n.left,a=e.top-n.top,o=i.width/this.getColumn(),c=i.height/parseInt(this.el.getAttribute("gs-current-row")||"0");return{x:Math.floor(s/o),y:Math.floor(a/c)}}getRow(){return Math.max(this.engine.getRow(),this.opts.minRow||0)}isAreaEmpty(e,t,i,n){return this.engine.isAreaEmpty(e,t,i,n)}makeWidget(e,t){const i=Ce.getElement(e);if(!i||i.gridstackNode)return i;i.parentElement||this.el.appendChild(i),this._prepareElement(i,!0,t);const n=i.gridstackNode;this._updateContainerHeight(),n.subGridOpts&&this.makeSubGrid(i,n.subGridOpts,void 0,!1);let s=!1;return this.opts.column===1&&!this._ignoreLayoutsNodeChange&&(s=this._ignoreLayoutsNodeChange=!0),this._triggerAddEvent(),this._triggerChangeEvent(),s&&delete this._ignoreLayoutsNodeChange,i}on(e,t){return e.indexOf(" ")!==-1?(e.split(" ").forEach(n=>this.on(n,t)),this):(e==="change"||e==="added"||e==="removed"||e==="enable"||e==="disable"?(e==="enable"||e==="disable"?this._gsEventHandler[e]=n=>t(n):this._gsEventHandler[e]=n=>{n.detail&&t(n,n.detail)},this.el.addEventListener(e,this._gsEventHandler[e])):e==="drag"||e==="dragstart"||e==="dragstop"||e==="resizestart"||e==="resize"||e==="resizestop"||e==="dropped"||e==="resizecontent"?this._gsEventHandler[e]=t:console.error("GridStack.on("+e+") event not supported"),this)}off(e){return e.indexOf(" ")!==-1?(e.split(" ").forEach(i=>this.off(i)),this):((e==="change"||e==="added"||e==="removed"||e==="enable"||e==="disable")&&this._gsEventHandler[e]&&this.el.removeEventListener(e,this._gsEventHandler[e]),delete this._gsEventHandler[e],this)}offAll(){return Object.keys(this._gsEventHandler).forEach(e=>this.off(e)),this}removeWidget(e,t=!0,i=!0){return e?(Ce.getElements(e).forEach(n=>{if(n.parentElement&&n.parentElement!==this.el)return;let s=n.gridstackNode;s||(s=this.engine.nodes.find(a=>n===a.el)),s&&(t&&Ce.addRemoveCB&&Ce.addRemoveCB(this.el,s,!1,!1),delete n.gridstackNode,this._removeDD(n),this.engine.removeNode(s,t,i),t&&n.parentElement&&n.remove())}),i&&(this._triggerRemoveEvent(),this._triggerChangeEvent()),this):(console.error("Error: GridStack.removeWidget(undefined) called"),this)}removeAll(e=!0,t=!0){return this.engine.nodes.forEach(i=>{e&&Ce.addRemoveCB&&Ce.addRemoveCB(this.el,i,!1,!1),delete i.el.gridstackNode,this.opts.staticGrid||this._removeDD(i.el)}),this.engine.removeAll(e,t),t&&this._triggerRemoveEvent(),this}setAnimation(e=this.opts.animate,t){return t?setTimeout(()=>{this.opts&&this.setAnimation(e)}):e?this.el.classList.add("grid-stack-animate"):this.el.classList.remove("grid-stack-animate"),this.opts.animate=e,this}hasAnimationCSS(){return this.el.classList.contains("grid-stack-animate")}setStatic(e,t=!0,i=!0){return!!this.opts.staticGrid===e?this:(e?this.opts.staticGrid=!0:delete this.opts.staticGrid,this._setupRemoveDrop(),this._setupAcceptWidget(),this.engine.nodes.forEach(n=>{this.prepareDragDrop(n.el),n.subGrid&&i&&n.subGrid.setStatic(e,t,i)}),t&&this._setStaticClass(),this)}updateOptions(e){var i;const t=this.opts;if(e===t)return this;if(e.acceptWidgets!==void 0&&(t.acceptWidgets=e.acceptWidgets,this._setupAcceptWidget()),e.animate!==void 0&&this.setAnimation(e.animate),e.cellHeight&&this.cellHeight(e.cellHeight),e.class!==void 0&&e.class!==t.class&&(t.class&&this.el.classList.remove(t.class),e.class&&this.el.classList.add(e.class)),e.columnOpts){const n=!!this.opts.columnOpts;this.opts.columnOpts=e.columnOpts,n!==!!this.opts.columnOpts&&this._updateResizeEvent(),this.checkDynamicColumn()}else e.columnOpts===null&&this.opts.columnOpts?(delete this.opts.columnOpts,this._updateResizeEvent()):typeof e.column=="number"&&this.column(e.column);return e.margin!==void 0&&this.margin(e.margin),e.staticGrid!==void 0&&this.setStatic(e.staticGrid),e.disableDrag!==void 0&&!e.staticGrid&&this.enableMove(!e.disableDrag),e.disableResize!==void 0&&!e.staticGrid&&this.enableResize(!e.disableResize),e.float!==void 0&&this.float(e.float),e.row!==void 0?(t.minRow=t.maxRow=this.engine.maxRow=t.row=e.row,this._updateContainerHeight(),this.engine.getRow()>e.row&&this.compact()):(e.minRow!==void 0&&(t.minRow=e.minRow,this._updateContainerHeight()),e.maxRow!==void 0&&(t.maxRow=this.engine.maxRow=e.maxRow,this.engine.getRow()>e.maxRow&&this.compact())),e.lazyLoad!==void 0&&(t.lazyLoad=e.lazyLoad),(i=e.children)!=null&&i.length&&this.load(e.children),this}update(e,t){return Ce.getElements(e).forEach(i=>{var u;const n=i==null?void 0:i.gridstackNode;if(!n)return;const s={...X.copyPos({},n),...X.cloneDeep(t)};this.engine.nodeBoundFix(s),delete s.autoPosition;const a=["x","y","w","h"];let o;const c=s,l=n;if(a.some(f=>c[f]!==void 0&&c[f]!==l[f])){o={};const f=o;a.forEach(g=>{f[g]=c[g]!==void 0?c[g]:l[g],delete c[g]})}if(!o&&(s.minW||s.minH||s.maxW||s.maxH)&&(o={}),s.content!==void 0){const f=i.querySelector(".grid-stack-item-content");f&&f.textContent!==s.content&&(n.content=s.content,Ce.renderCB(f,s),(u=n.subGrid)!=null&&u.el&&(f.appendChild(n.subGrid.el),n.subGrid._updateContainerHeight())),delete s.content}let h=!1,d=!1;for(const f in c)f[0]!=="_"&&l[f]!==c[f]&&(l[f]=c[f],h=!0,d=d||!this.opts.staticGrid&&(f==="noResize"||f==="noMove"||f==="locked"));if(X.sanitizeMinMax(n),o){const f=o.w!==void 0&&o.w!==n.w;this.moveNode(n,o),f&&n.subGrid?n.subGrid.onResize(this.hasAnimationCSS()?n.w:void 0):this.resizeToContentCheck(f,n),delete n._orig}(o||h)&&this._writeAttr(i,n),d&&this.prepareDragDrop(n.el),Ce.updateCB&&Ce.updateCB(n)}),this}moveNode(e,t){const i=e._updating;i||this.engine.cleanNodes().beginUpdate(e),this.engine.moveNode(e,t),this._updateContainerHeight(),i||(this._triggerChangeEvent(),this.engine.endUpdate())}resizeToContent(e){var u,f;if(!e||(e.classList.remove("size-to-content-max"),!e.clientHeight))return;const t=e.gridstackNode;if(!t)return;const i=t.grid;if(!i||e.parentElement!==i.el)return;const n=i.getCellHeight(!0);if(!n)return;let s=t.h?t.h*n:e.clientHeight,a=null;if(t.resizeToContentParent&&(a=e.querySelector(t.resizeToContentParent)),a||(a=e.querySelector(Ce.resizeToContentParent)),!a)return;const o=e.clientHeight-a.clientHeight,c=t.h?t.h*n-o:a.clientHeight;let l;if(t.subGrid){l=t.subGrid.getRow()*t.subGrid.getCellHeight(!0);const g=t.subGrid.el.getBoundingClientRect(),v=e.getBoundingClientRect();l+=g.top-v.top}else{if((f=(u=t.subGridOpts)==null?void 0:u.children)!=null&&f.length)return;{const g=a.firstElementChild;if(!g){console.error(`Error: GridStack.resizeToContent() widget id:${t.id} '${Ce.resizeToContentParent}'.firstElementChild is null, make sure to have a div like container. Skipping sizing.`);return}l=g.getBoundingClientRect().height||c}}if(c===l)return;s+=l-c;let h=Math.ceil(s/n);const d=Number.isInteger(t.sizeToContent)?t.sizeToContent:0;d&&h>d&&(h=d,e.classList.add("size-to-content-max")),t.minH&&h<t.minH?h=t.minH:t.maxH&&h>t.maxH&&(h=t.maxH),h!==t.h&&(i._ignoreLayoutsNodeChange=!0,i.moveNode(t,{h}),delete i._ignoreLayoutsNodeChange)}resizeToContentCBCheck(e){Ce.resizeToContentCB?Ce.resizeToContentCB(e):this.resizeToContent(e)}rotate(e,t){return Ce.getElements(e).forEach(i=>{const n=i.gridstackNode;if(!n||!X.canBeRotated(n))return;const s={w:n.h,h:n.w,minH:n.minW,minW:n.minH,maxH:n.maxW,maxW:n.maxH};if(t){const c=t.left>0?Math.floor(t.left/this.cellWidth()):0,l=t.top>0?Math.floor(t.top/this.opts.cellHeight):0;s.x=n.x+c-(n.h-(l+1)),s.y=n.y+l-c}const a=s;Object.keys(a).forEach(c=>{a[c]===void 0&&delete a[c]});const o=n._orig;this.update(i,s),n._orig=o}),this}margin(e){if(!(typeof e=="string"&&e.split(" ").length>1)){const i=X.parseHeight(e);if(this.opts.marginUnit===i.unit&&this.opts.margin===i.h)return this}return this.opts.margin=e,this.opts.marginTop=this.opts.marginBottom=this.opts.marginLeft=this.opts.marginRight=void 0,this._initMargin(),this}getMargin(){return this.opts.margin}willItFit(e){return this.engine.willItFit(e)}_triggerChangeEvent(){if(this.engine.batchMode)return this;const e=this.engine.getDirtyNodes(!0);return e&&e.length&&(this._ignoreLayoutsNodeChange||this.engine.layoutsNodesChange(e),this._triggerEvent("change",e)),this.engine.saveInitial(),this._sortDom(),this}_sortDom(){var i;let e=this.engine.nodes;if(e.forEach(n=>{n.subGrid&&n.subGrid._sortDom()}),e.length<2)return this;this.engine.sortNodes(),e=this.engine.nodes;const t=this.el.children;if(e.some((n,s)=>n.el!==t[s])){const n=(i=this.el.moveBefore)==null?void 0:i.bind(this.el);e.forEach(s=>{s.el&&s.el.parentElement===this.el&&(n?n(s.el,null):this.el.appendChild(s.el))})}return this}_triggerAddEvent(){var e;if(this.engine.batchMode)return this;if((e=this.engine.addedNodes)!=null&&e.length){this._ignoreLayoutsNodeChange||this.engine.layoutsNodesChange(this.engine.addedNodes),this.engine.addedNodes.forEach(i=>{delete i._dirty});const t=[...this.engine.addedNodes];this.engine.addedNodes=[],this._triggerEvent("added",t)}return this}_triggerRemoveEvent(){var e;if(this.engine.batchMode)return this;if((e=this.engine.removedNodes)!=null&&e.length){const t=[...this.engine.removedNodes];this.engine.removedNodes=[],this._triggerEvent("removed",t)}return this}_triggerEvent(e,t){const i=t?new CustomEvent(e,{bubbles:!1,detail:t}):new Event(e);let n=this;for(;n.parentGridNode;)n=n.parentGridNode.grid;return n.el.dispatchEvent(i),this}_updateContainerHeight(){if(!this.engine||this.engine.batchMode)return this;const e=this.parentGridNode;let t=this.getRow()+this._extraDragRow;const i=this.opts.cellHeight,n=this.opts.cellHeightUnit;if(!i)return this;if(!e&&!this.opts.minRow){const s=X.parseHeight(getComputedStyle(this.el).minHeight);if(s.h>0&&s.unit===n){const a=Math.floor(s.h/i);t<a&&(t=a)}}return this.el.setAttribute("gs-current-row",String(t)),this.el.style.removeProperty("min-height"),this.el.style.removeProperty("height"),t&&(this.el.style[e?"minHeight":"height"]=t*i+n),e&&X.shouldSizeToContent(e)&&e.grid.resizeToContentCBCheck(e.el),this}_prepareElement(e,t=!1,i){i=i||this._readAttr(e),e.gridstackNode=i,i.el=e,i.grid=this,i=this.engine.addNode(i,t),this._writeAttr(e,i),e.classList.add($t.itemClass,this.opts.itemClass);const n=X.shouldSizeToContent(i);return n?e.classList.add("size-to-content"):e.classList.remove("size-to-content"),n&&this.resizeToContentCheck(!1,i),(!X.lazyLoad(i)||!i.visibleObservable)&&this.prepareDragDrop(i.el),this}_writePosAttr(e,t){if(!t._moving&&!t._resizing||this._placeholder===e){const i=this.opts.rtl?"right":"left",n=e.style;n.top=t.y?t.y===1?"var(--gs-cell-height)":`calc(${t.y} * var(--gs-cell-height))`:null,n[i]=t.x?t.x===1?"var(--gs-column-width)":`calc(${t.x} * var(--gs-column-width))`:null,n.width=t.w>1?`calc(${t.w} * var(--gs-column-width))`:null,n.height=t.h>1?`calc(${t.h} * var(--gs-cell-height))`:null}return e.style.setProperty("--gs-x",String(t.x||0)),e.style.setProperty("--gs-y",String(t.y||0)),e.style.setProperty("--gs-w",String(t.w||1)),e.style.setProperty("--gs-h",String(t.h||1)),e.setAttribute("gs-x",String(t.x??0)),e.setAttribute("gs-y",String(t.y??0)),t.w>1?e.setAttribute("gs-w",String(t.w)):e.removeAttribute("gs-w"),t.h>1?e.setAttribute("gs-h",String(t.h)):e.removeAttribute("gs-h"),this}_writeAttr(e,t){if(!t)return this;this._writePosAttr(e,t);const i={noResize:"gs-no-resize",noMove:"gs-no-move",locked:"gs-locked",id:"gs-id",sizeToContent:"gs-size-to-content"},n=t,s=i;for(const o in s)n[o]!==void 0&&n[o]!==null&&n[o]!==!1?e.setAttribute(s[o],String(n[o])):e.removeAttribute(s[o]);const a=t.print;return a?(a.pageBreak?e.setAttribute("gs-page-break",String(a.pageBreak)):e.removeAttribute("gs-page-break"),a.hide?e.classList.add("gs-print-hide"):e.classList.remove("gs-print-hide"),a.orientation?e.setAttribute("gs-print-orientation",String(a.orientation)):e.removeAttribute("gs-print-orientation"),a.breakInside?e.setAttribute("gs-break-inside",String(a.breakInside)):e.removeAttribute("gs-break-inside")):(e.removeAttribute("gs-page-break"),e.classList.remove("gs-print-hide"),e.removeAttribute("gs-print-orientation"),e.removeAttribute("gs-break-inside")),this}_readAttr(e,t=!0){const i={};i.x=X.toNumber(e.getAttribute("gs-x")),i.y=X.toNumber(e.getAttribute("gs-y")),i.w=X.toNumber(e.getAttribute("gs-w")),i.h=X.toNumber(e.getAttribute("gs-h")),i.autoPosition=X.toBool(e.getAttribute("gs-auto-position")),i.noResize=X.toBool(e.getAttribute("gs-no-resize")),i.noMove=X.toBool(e.getAttribute("gs-no-move")),i.locked=X.toBool(e.getAttribute("gs-locked"));let n=e.getAttribute("gs-page-break"),s=e.classList.contains("gs-print-hide"),a=e.getAttribute("gs-print-orientation"),o=e.getAttribute("gs-break-inside");(n||s||a||o)&&(i.print={},n&&(i.print.pageBreak=X.toBool(n)),s&&(i.print.hide=!0),a&&(i.print.orientation=a),o&&(i.print.breakInside=X.toBool(o)));const c=e.getAttribute("gs-size-to-content");c&&(c==="true"||c==="false"?i.sizeToContent=X.toBool(c):i.sizeToContent=parseInt(c,10)),i.id=e.getAttribute("gs-id")??void 0,i.maxW=X.toNumber(e.getAttribute("gs-max-w")),i.minW=X.toNumber(e.getAttribute("gs-min-w")),i.maxH=X.toNumber(e.getAttribute("gs-max-h")),i.minH=X.toNumber(e.getAttribute("gs-min-h")),t&&(i.w===1&&e.removeAttribute("gs-w"),i.h===1&&e.removeAttribute("gs-h"),i.maxW&&e.removeAttribute("gs-max-w"),i.minW&&e.removeAttribute("gs-min-w"),i.maxH&&e.removeAttribute("gs-max-h"),i.minH&&e.removeAttribute("gs-min-h"));const l=i;for(const h in l)i.hasOwnProperty(h)&&!l[h]&&l[h]!==0&&h!=="sizeToContent"&&delete l[h];return i}_setStaticClass(){const e=["grid-stack-static"];return this.opts.staticGrid?(this.el.classList.add(...e),this.el.setAttribute("gs-static","true")):(this.el.classList.remove(...e),this.el.removeAttribute("gs-static")),this}onResize(e=(t=>(t=this.el)==null?void 0:t.clientWidth)()){if(!e)return this;if(this.prevWidth===e)return this;this.prevWidth=e,this.batchUpdate();let i=!1;return this._autoColumn&&this.parentGridNode?this.opts.column!==this.parentGridNode.w&&(this.column(this.parentGridNode.w,this.opts.layout||"list"),i=!0):i=this.checkDynamicColumn(),this._isAutoCellHeight&&this.cellHeight(),this.engine.nodes.forEach(n=>{n.subGrid&&n.subGrid.onResize()}),this._skipInitialResize||this.resizeToContentCheck(i),delete this._skipInitialResize,this.batchUpdate(!1),this}resizeToContentCheck(e=!1,t){if(!this.engine)return;if(e&&this.hasAnimationCSS()){setTimeout(()=>this.resizeToContentCheck(!1,t),this.animationDelay);return}if(t)X.shouldSizeToContent(t)&&this.resizeToContentCBCheck(t.el);else if(this.engine.nodes.some(n=>X.shouldSizeToContent(n))){const n=[...this.engine.nodes];this.batchUpdate(),n.forEach(s=>{X.shouldSizeToContent(s)&&this.resizeToContentCBCheck(s.el)}),this._ignoreLayoutsNodeChange=!0,this.batchUpdate(!1),this._ignoreLayoutsNodeChange=!1}const i=this._gsEventHandler.resizecontent;i&&i(new Event("resizecontent"),t?[t]:this.engine.nodes)}_updateResizeEvent(e=!1){const t=!this.parentGridNode&&(this._isAutoCellHeight||this.opts.sizeToContent||this.opts.columnOpts||this.engine.nodes.find(i=>i.sizeToContent));return!e&&t&&!this.resizeObserver?(this._sizeThrottle=X.throttle(()=>this.onResize(),this.opts.cellHeightThrottle),this.resizeObserver=new ResizeObserver(()=>this._sizeThrottle()),this.resizeObserver.observe(this.el),this._skipInitialResize=!0):(e||!t)&&this.resizeObserver&&(this.resizeObserver.disconnect(),delete this.resizeObserver,delete this._sizeThrottle),this}static getElement(e=".grid-stack-item"){return X.getElement(e)}static getElements(e=".grid-stack-item"){return X.getElements(e)}static getGridElement(e){return Ce.getElement(e)}static getGridElements(e){return X.getElements(e)}_initMargin(){let e={h:0,unit:"px"},t=0,i=[];typeof this.opts.margin=="string"&&(i=this.opts.margin.split(" ")),i.length===2?(this.opts.marginTop=this.opts.marginBottom=i[0],this.opts.marginLeft=this.opts.marginRight=i[1]):i.length===4?(this.opts.marginTop=i[0],this.opts.marginRight=i[1],this.opts.marginBottom=i[2],this.opts.marginLeft=i[3]):(e=X.parseHeight(this.opts.margin),this.opts.marginUnit=e.unit,t=this.opts.margin=e.h);const n=["marginTop","marginRight","marginBottom","marginLeft"],s=this.opts;n.forEach(o=>{s[o]===void 0?s[o]=t:(e=X.parseHeight(s[o]),s[o]=e.h,delete this.opts.margin)}),this.opts.marginUnit=e.unit,this.opts.marginTop===this.opts.marginBottom&&this.opts.marginLeft===this.opts.marginRight&&this.opts.marginTop===this.opts.marginRight&&(this.opts.margin=this.opts.marginTop);const a=this.el.style;return a.setProperty("--gs-item-margin-top",`${this.opts.marginTop}${this.opts.marginUnit}`),a.setProperty("--gs-item-margin-bottom",`${this.opts.marginBottom}${this.opts.marginUnit}`),a.setProperty("--gs-item-margin-right",`${this.opts.marginRight}${this.opts.marginUnit}`),a.setProperty("--gs-item-margin-left",`${this.opts.marginLeft}${this.opts.marginUnit}`),this}static getDD(){return Bt}static setupDragIn(e,t,i,n=document){(t==null?void 0:t.pause)!==void 0&&(Ee.pauseDrag=t.pause),t={appendTo:"body",helper:"clone",...t||{}},(typeof e=="string"?X.getElements(e,n):e).forEach((a,o)=>{Bt.isDraggable(a)||Bt.dragIn(a,t),i!=null&&i[o]&&(a.gridstackNode=i[o])})}movable(e,t){return this.opts.staticGrid?this:(Ce.getElements(e).forEach(i=>{const n=i.gridstackNode;n&&(t?delete n.noMove:n.noMove=!0,this.prepareDragDrop(n.el))}),this)}resizable(e,t){return this.opts.staticGrid?this:(Ce.getElements(e).forEach(i=>{const n=i.gridstackNode;n&&(t?delete n.noResize:n.noResize=!0,this.prepareDragDrop(n.el))}),this)}disable(e=!0){return this.opts.staticGrid?this:(this.enableMove(!1,e),this.enableResize(!1,e),this._triggerEvent("disable"),this)}enable(e=!0){return this.opts.staticGrid?this:(this.enableMove(!0,e),this.enableResize(!0,e),this._triggerEvent("enable"),this)}enableMove(e,t=!0){return this.opts.staticGrid?this:(e?delete this.opts.disableDrag:this.opts.disableDrag=!0,this.engine.nodes.forEach(i=>{this.prepareDragDrop(i.el),i.subGrid&&t&&i.subGrid.enableMove(e,t)}),this)}enableResize(e,t=!0){return this.opts.staticGrid?this:(e?delete this.opts.disableResize:this.opts.disableResize=!0,this.engine.nodes.forEach(i=>{this.prepareDragDrop(i.el),i.subGrid&&t&&i.subGrid.enableResize(e,t)}),this)}cancelDrag(){var i,n,s;const e=(i=Ee.dragElement)==null?void 0:i.el;if(e!=null&&e._gridstackNodeOrig){const a=e._gridstackNodeOrig,o=a.grid,c=(n=this._placeholder)==null?void 0:n.gridstackNode;c&&(c._isAboutToRemove=!0,this.engine.removeNode(c)),this.engine.restoreInitial(),e.gridstackNode=a,delete e._gridstackNodeOrig,delete Ee.dropElement,o&&(o.engine.addNode(a,!1),o.engine.restoreInitial());return}const t=(s=this._placeholder)==null?void 0:s.gridstackNode;t&&(t._isExternal?(t._isAboutToRemove=!0,this.engine.removeNode(t)):t._isAboutToRemove&&Ce._itemRemoving(t.el,!1),this.engine.restoreInitial())}_removeDD(e){return Bt.draggable(e,"destroy").resizable(e,"destroy"),e.gridstackNode&&delete e.gridstackNode._initDD,delete e.ddElement,this}_setupAcceptWidget(){if(this.opts.staticGrid||!this.opts.acceptWidgets&&!this.opts.removable)return Bt.droppable(this.el,"destroy"),this;let e,t;const i=(n,s,a)=>{var u;a=a||s;const o=a.gridstackNode;if(!o)return;if(!((u=o.grid)!=null&&u.el)){a.style.transform=`scale(${1/this.dragTransform.xScale},${1/this.dragTransform.yScale})`;const f=a.getBoundingClientRect();a.style.left=f.x+(this.dragTransform.xScale-1)*(n.clientX-f.x)/this.dragTransform.xScale+"px",a.style.top=f.y+(this.dragTransform.yScale-1)*(n.clientY-f.y)/this.dragTransform.yScale+"px",a.style.transformOrigin="0px 0px"}let{top:c,left:l}=a.getBoundingClientRect();const h=this.el.getBoundingClientRect();l-=h.left,c-=h.top;const d={position:{top:c*this.dragTransform.xScale,left:l*this.dragTransform.yScale}};if(o._temporaryRemoved){if(o.x=Math.max(0,Math.round(l/t)),o.y=Math.max(0,Math.round(c/e)),delete o.autoPosition,this.engine.nodeBoundFix(o),!this.engine.willItFit(o)){if(o.autoPosition=!0,!this.engine.willItFit(o)){Bt.off(s,"drag");return}o._willFitPos&&(X.copyPos(o,o._willFitPos),delete o._willFitPos)}this._onStartMoving(a,n,d,o,t,e)}else this._dragOrResize(a,n,d,o,t,e)};return Bt.droppable(this.el,{accept:n=>{const s=n.gridstackNode||this._readAttr(n,!1);if((s==null?void 0:s.grid)===this)return!0;if(!this.opts.acceptWidgets)return!1;let a=!0;if(typeof this.opts.acceptWidgets=="function")a=this.opts.acceptWidgets(n);else{const o=this.opts.acceptWidgets===!0?".grid-stack-item":this.opts.acceptWidgets;a=n.matches(o)}if(a&&s&&this.opts.maxRow){const o={w:s.w,h:s.h,minW:s.minW,minH:s.minH};a=this.engine.willItFit(o)}return a}}).on(this.el,"dropover",(n,s,a)=>{let o=(a==null?void 0:a.gridstackNode)||s.gridstackNode;if((o==null?void 0:o.grid)===this&&!o._temporaryRemoved)return!1;if(o!=null&&o._sidebarOrig&&(o.w=o._sidebarOrig.w,o.h=o._sidebarOrig.h),o!=null&&o.grid&&o.grid!==this&&!o._temporaryRemoved&&o.grid._leave(s,a),a=a||s,t=this.cellWidth(),e=this.getCellHeight(!0),!o){const h=a.getAttribute("data-gs-widget")||a.getAttribute("gridstacknode");if(h){try{o=JSON.parse(h)}catch{console.error("Gridstack dropover: Bad JSON format: ",h)}a.removeAttribute("data-gs-widget"),a.removeAttribute("gridstacknode")}o||(o=this._readAttr(a)),o._sidebarOrig={w:o.w,h:o.h}}o.grid||(o.el||(o={...o}),o._isExternal=!0,a.gridstackNode=o);const c=o.w||Math.round(a.offsetWidth/t)||1,l=o.h||Math.round(a.offsetHeight/e)||1;return o.grid&&o.grid!==this?(s._gridstackNodeOrig||(s._gridstackNodeOrig=o),s.gridstackNode=o={...o,w:c,h:l,grid:this},delete o.x,delete o.y,this.engine.cleanupNode(o).nodeBoundFix(o),o._initDD=o._isExternal=o._temporaryRemoved=!0):(o.w=c,o.h=l,o._temporaryRemoved=!0),Ce._itemRemoving(o.el,!1),Bt.on(s,"drag",i),i(n,s,a),!1}).on(this.el,"dropout",(n,s,a)=>{const o=(a==null?void 0:a.gridstackNode)||s.gridstackNode;return o&&(!o.grid||o.grid===this)&&(this._leave(s,a),this._isTemp&&this.removeAsSubGrid(o)),!1}).on(this.el,"drop",(n,s,a)=>{var u,f,g;const o=(a==null?void 0:a.gridstackNode)||s.gridstackNode;if((o==null?void 0:o.grid)===this&&!o._isExternal)return!1;const c=!!this.placeholder.parentElement,l=s!==a;this.placeholder.remove(),delete this.placeholder.gridstackNode,c&&this.opts.animate&&(this.setAnimation(!1),this.setAnimation(!0,!0));const h=s._gridstackNodeOrig;if(delete s._gridstackNodeOrig,c&&(h!=null&&h.grid)&&h.grid!==this){const v=h.grid;v.engine.removeNodeFromLayoutCache(h),v.engine.removedNodes.push(h),v._triggerRemoveEvent()._triggerChangeEvent(),v.parentGridNode&&!v.engine.nodes.length&&v.opts.subGridDynamic&&v.removeAsSubGrid()}if(!o||(c&&(this.engine.cleanupNode(o),o.grid=this),(u=o.grid)==null||delete u._isTemp,Bt.off(s,"drag"),a&&a!==s?(a.remove(),s=a):s.remove(),this._removeDD(s),!c))return!1;const d=(g=(f=o.subGrid)==null?void 0:f.el)==null?void 0:g.gridstack;return X.copyPos(o,this._readAttr(this.placeholder)),X.removePositioningStyles(s),l&&(o.content||o.subGridOpts||Ce.addRemoveCB)?(delete o.el,s=this.addWidget(o)||s):(this._prepareElement(s,!0,o),this.el.appendChild(s),this.resizeToContentCheck(!1,o),d&&(d.parentGridNode=o),this._updateContainerHeight()),this.engine.addedNodes.push(o),this._triggerAddEvent(),this._triggerChangeEvent(),this.engine.endUpdate(),this._gsEventHandler.dropped&&this._gsEventHandler.dropped({...n,type:"dropped"},h&&h.grid?h:void 0,o),!1}),this}static _itemRemoving(e,t){if(!e)return;const i=e?e.gridstackNode:void 0;!(i!=null&&i.grid)||e.classList.contains(i.grid.opts.removableOptions.decline)||(t?i._isAboutToRemove=!0:delete i._isAboutToRemove,t?e.classList.add("grid-stack-item-removing"):e.classList.remove("grid-stack-item-removing"))}_setupRemoveDrop(){if(typeof this.opts.removable!="string")return this;const e=document.querySelector(this.opts.removable);return e?(!this.opts.staticGrid&&!Bt.isDroppable(e)&&Bt.droppable(e,this.opts.removableOptions).on(e,"dropover",(t,i)=>Ce._itemRemoving(i,!0)).on(e,"dropout",(t,i)=>Ce._itemRemoving(i,!1)),this):this}refreshDragHandles(e){return Ce.getElements(e).forEach(t=>{var i,n;(n=(i=t.ddElement)==null?void 0:i.ddDraggable)==null||n.refreshHandles()}),this}prepareDragDrop(e,t=!1){const i=e==null?void 0:e.gridstackNode;if(!i)return this;const n=i.noMove||this.opts.disableDrag,s=i.noResize||this.opts.disableResize,a=this.opts.staticGrid||n&&s;if((t||a)&&(i._initDD&&(this._removeDD(e),delete i._initDD),a))return e.classList.add("ui-draggable-disabled","ui-resizable-disabled"),this;if(!i._initDD){let o,c;const l=(u,f)=>{this.triggerEvent(u,u.target),o=this.cellWidth(),c=this.getCellHeight(!0),this._onStartMoving(e,u,f,i,o,c)},h=(u,f)=>{this._dragOrResize(e,u,f,i,o,c)},d=u=>{this.placeholder.remove(),delete this.placeholder.gridstackNode,delete i._moving,delete i._resizing,delete i._event,delete i._lastTried;const f=i.w!==i._orig.w,g=u.target;if(!(!g.gridstackNode||g.gridstackNode.grid!==this)){if(i.el=g,i._isAboutToRemove){const v=e.gridstackNode.grid;v._gsEventHandler[u.type]&&v._gsEventHandler[u.type](u,g),v.engine.nodes.push(i),v.removeWidget(e,!0,!0)}else X.removePositioningStyles(g),i._temporaryRemoved?(this._writePosAttr(g,i),this.engine.addNode(i)):this._writePosAttr(g,i),this.triggerEvent(u,g);this._extraDragRow=0,this._updateContainerHeight(),this._triggerChangeEvent(),this.engine.endUpdate(),u.type==="resizestop"&&(Number.isInteger(i.sizeToContent)&&(i.sizeToContent=i.h),this.resizeToContentCheck(f,i))}};Bt.draggable(e,{start:l,stop:d,drag:h,rtl:this.opts.rtl==="auto"?void 0:this.opts.rtl}).resizable(e,{start:l,stop:d,resize:h,rtl:this.opts.rtl==="auto"?void 0:this.opts.rtl}),i._initDD=!0}return Bt.draggable(e,n?"disable":"enable").resizable(e,s?"disable":"enable"),this}_onStartMoving(e,t,i,n,s,a){var o;if(this.engine.cleanNodes().beginUpdate(n),this._writePosAttr(this.placeholder,n),this.el.appendChild(this.placeholder),this.placeholder.gridstackNode=n,(o=n.grid)!=null&&o.el)this.dragTransform=X.getValuesFromTransformedElement(e);else if(this.placeholder&&this.placeholder.closest(".grid-stack")){const c=this.placeholder.closest(".grid-stack");this.dragTransform=X.getValuesFromTransformedElement(c)}else this.dragTransform={xScale:1,xOffset:0,yScale:1,yOffset:0};if(n.el=this.placeholder,n._lastUiPosition=i.position,n._prevYPix=i.position.top,n._moving=t.type==="dragstart",n._resizing=t.type==="resizestart",delete n._lastTried,t.type==="dropover"&&n._temporaryRemoved&&(this.engine.addNode(n),n._moving=!0),this.engine.cacheRects(s,a,this.opts.marginTop,this.opts.marginRight,this.opts.marginBottom,this.opts.marginLeft),t.type==="resizestart"){const c=this.getColumn()-n.x,l=(this.opts.maxRow||Number.MAX_SAFE_INTEGER)-n.y;Bt.resizable(e,"option","minWidth",s*Math.min(n.minW||1,c)).resizable(e,"option","minHeight",a*Math.min(n.minH||1,l)).resizable(e,"option","maxWidth",s*Math.min(n.maxW||Number.MAX_SAFE_INTEGER,c)).resizable(e,"option","maxWidthMoveLeft",s*Math.min(n.maxW||Number.MAX_SAFE_INTEGER,n.x+n.w)).resizable(e,"option","maxHeight",a*Math.min(n.maxH||Number.MAX_SAFE_INTEGER,l)).resizable(e,"option","maxHeightMoveUp",a*Math.min(n.maxH||Number.MAX_SAFE_INTEGER,n.y+n.h))}}_dragOrResize(e,t,i,n,s,a){var m;const o={...n._orig};let c=!1,l=this.opts.marginLeft,h=this.opts.marginRight,d=this.opts.marginTop,u=this.opts.marginBottom;const f=Math.round(a*.1),g=Math.round(s*.1);if(l=Math.min(l,g),h=Math.min(h,g),d=Math.min(d,f),u=Math.min(u,f),t.type==="drag"){if(n._temporaryRemoved)return;n._prevYPix=i.position.top,this.opts.draggable.scroll!==!1&&((m=Ee.dragElement)==null||m.updateScrollPosition(this.el));const p=i.position.left+(i.position.left>n._lastUiPosition.left?-h:l),M=i.position.top+(i.position.top>n._lastUiPosition.top?-u:d);o.x=Math.round(p/s),o.y=Math.round(M/a);const T=this._extraDragRow;if(this.engine.collide(n,o)){const y=this.getRow();let E=Math.max(0,o.y+n.h-y);this.opts.maxRow&&y+E>this.opts.maxRow&&(E=Math.max(0,this.opts.maxRow-y)),this._extraDragRow=E}else this._extraDragRow=0;if(this._extraDragRow!==T&&this._updateContainerHeight(),n.x===o.x&&n.y===o.y)return}else if(t.type==="resize"){if((o.x??0)<0||(X.updateScrollResize(t,e,a),o.w=Math.round((i.size.width-l)/s),o.h=Math.round((i.size.height-d)/a),n.w===o.w&&n.h===o.h)||n._lastTried&&n._lastTried.w===o.w&&n._lastTried.h===o.h)return;if(t.hasMovedX){const p=n.x-(o.w-n.w);o.x=p<0?0:p}if(t.hasMovedY){const p=n.y-(o.h-n.h);o.y=p<0?0:p}c=!0}n._event=t,n._lastTried=o;const v={x:i.position.left+l,y:i.position.top+d,w:(i.size?i.size.width:n.w*s)-l-h,h:(i.size?i.size.height:n.h*a)-d-u};if(this.engine.moveNodeCheck(n,{...o,cellWidth:s,cellHeight:a,rect:v,resizing:c})){n._lastUiPosition=i.position,this.engine.cacheRects(s,a,d,h,u,l),delete n._skipDown,c&&n.subGrid&&n.subGrid.onResize(),this._extraDragRow=0,this._updateContainerHeight();const p=t.target;n._sidebarOrig||this._writePosAttr(p,n),this.triggerEvent(t,p)}}triggerEvent(e,t){let i=this;for(;i.parentGridNode;)i=i.parentGridNode.grid;i._gsEventHandler[e.type]&&i._gsEventHandler[e.type](e,t)}_leave(e,t){t=t||e;const i=t.gridstackNode;if(!i||(t.style.transform=t.style.transformOrigin="",Bt.off(e,"drag"),i._temporaryRemoved))return;i._temporaryRemoved=!0,this.engine.removeNode(i),i.el=i._isExternal&&t?t:e;const n=i._sidebarOrig;i._isExternal&&this.engine.cleanupNode(i),i._sidebarOrig=n,this.opts.removable===!0&&Ce._itemRemoving(e,!0),e._gridstackNodeOrig?(e.gridstackNode=e._gridstackNodeOrig,delete e._gridstackNodeOrig):i._isExternal&&this.engine.restoreInitial()}}Ce.renderCB=(r,e)=>{r&&(e!=null&&e.content)&&(r.textContent=e.content)};Ce.resizeToContentParent=".grid-stack-item-content";Ce.Utils=X;Ce.Engine=Ni;Ce.GDRev="13.3.0";const Et=r=>document.querySelector(r),tx=Et("#recording"),gr=Et("#connection"),ix=Et("#arms"),_r=Et("#previews"),Oa=Et("#toast"),_s=Et("#viewer-state"),nx=Et("#joint-stamp"),Kc=Et("#canvas");let xs=null,fs=null,Zc,hn,zn,un,xr;const nl={},$c={},sx=Et("#grippers"),ka=Et("#export-panel"),On=Et("#export-state"),Ba=Et("#export-progress"),za=Et("#export-dir");function rx(r,e=!1){Oa.textContent=r,Oa.className=`toast show${e?" error":""}`,clearTimeout(Zc),Zc=window.setTimeout(()=>Oa.className="toast",4200)}function $h(r,e){const t=nl[r];t==null||t.setJointValues(Object.fromEntries(e.map((i,n)=>[`joint_${n+1}`,i]))),t==null||t.updateMatrixWorld(!0)}function ax(r){const e=nl[r];if(!e)return null;try{const t=e.links??{},i=t.base_link,n=t.link_6;if(!i||!n)return null;const s=i.matrixWorld.clone().invert().multiply(n.matrixWorld),a=new D().setFromMatrixPosition(s),o=new Pt().setFromRotationMatrix(s);return{pos:[a.x,a.y,a.z],quat:[o.w,o.x,o.y,o.z]}}catch{return null}}function ox(){hn=new E0({canvas:Kc,antialias:!0,alpha:!0,preserveDrawingBuffer:!0}),hn.setPixelRatio(Math.min(window.devicePixelRatio,2)),hn.outputColorSpace=lt,hn.setClearColor(594196,1),hn.shadowMap.enabled=!0,zn=new xh,un=new Ft(35,1,.01,100),un.up.set(0,0,1),un.position.set(1.2,-1.8,1.25),xr=new w0(un,Kc),xr.enableDamping=!0,xr.target.set(0,0,.55);const r=document.querySelector("#viewer"),e=()=>{const i=r.getBoundingClientRect();!i.width||!i.height||(hn.setSize(i.width,i.height,!1),un.aspect=i.width/i.height,un.updateProjectionMatrix())};new ResizeObserver(e).observe(r),e();const t=()=>{requestAnimationFrame(t),xr.update(),hn.render(zn,un)};t()}async function lx(){var e;if(!xs)return;_s.textContent="加载 URDF…",_s.removeAttribute("hidden");const r=new K0;r.packages={rm65_description:`${location.origin}/models`};try{zn.add(new xf(15200493,2503736,2.5));const t=new Uh(16777215,4);t.position.set(2,-3,4),t.castShadow=!0,zn.add(t);const i=new Af(3.5,22,5664888,2505536);i.rotation.x=Math.PI/2,zn.add(i);const n=(e=xs.robots.find(s=>s.id==="m"))==null?void 0:e.transform;if(!n)throw new Error("middle-arm transform is missing from the layout manifest");for(const s of xs.robots){const a=await r.loadAsync(`${location.origin}${s.urdf_url}`);a.position.set(s.transform.x-n.x,s.transform.y-n.y,s.transform.z-n.z),a.rotation.set(s.transform.roll,s.transform.pitch,s.transform.yaw,"ZYX"),zn.add(a),nl[s.id]=a,$h(s.id,Array(6).fill(xs.default_joint_position_rad))}_s.setAttribute("hidden","")}catch(t){_s.textContent=`URDF 加载失败: ${String(t)}`}}function cx(r){const e=Object.keys(r),t=e.filter(i=>{var n;return(n=r[i])==null?void 0:n.connected}).length;Et("#arm-count").textContent=`${t} / ${e.length||3} online`,e.length&&(ix.innerHTML=e.map(i=>{const n=r[i]??{},s=n.positions_rad??[],a=ax(i),o=a?`<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--line);font:11px ui-monospace,Menlo,monospace;color:var(--muted)">位置 <b style="color:var(--text)">${a.pos.map(c=>c.toFixed(3)).join(" ")}</b><br>姿态 <b style="color:var(--text)">${a.quat.map(c=>c.toFixed(3)).join(" ")}</b></div>`:"";return`<article class="arm-card ${n.connected?"connected":""}"><h4>${i.toUpperCase()} <span>${n.connected?"CONNECTED":"OFFLINE"}</span></h4><div class="joint-list">${s.length?s.map((c,l)=>`<span>J${l+1} <b>${(c*180/Math.PI).toFixed(1)}°</b></span>`).join(""):"<span>暂无关节数据</span>"}</div>${o}</article>`}).join(""))}const Jc={};function hx(r){var t;const e=Object.keys(r);Et("#camera-count").textContent=e.length?`${e.length} 路 · 低清预览`:"等待视频流",e.length&&((t=_r.querySelector(".empty"))==null||t.remove(),e.forEach(i=>{let n=_r.querySelector(`[data-camera="${CSS.escape(i)}"]`);n||(n=document.createElement("div"),n.className="camera-card",n.setAttribute("data-camera",i),n.innerHTML=`<img class="preview-img" alt="${i}" style="display:none"><div class="no-feed">等待视频帧…</div><span class="camera-label">${i}</span><span class="camera-health">NO SIGNAL</span>`,_r.append(n)),n.style.display="block";const s=n.querySelector(".camera-health"),a=r[i]?(Date.now()*1e6-r[i])/1e9:1/0;if(s&&(s.textContent=a<3?`LIVE · ${a.toFixed(1)}s`:"NO SIGNAL"),!r[i])return;const o=Date.now(),c=Jc[i]||0;if(o-c<3e3)return;Jc[i]=o;const l=n.querySelector(".preview-img");l&&(l.style.display="block",l.onload=()=>{var h;(h=n.querySelector(".no-feed"))==null||h.remove()},l.src=`/preview/${encodeURIComponent(i)}.jpg?ts=${o}`)}),[..._r.children].forEach(i=>{const n=i.dataset.camera;n&&!e.includes(n)&&(i.style.display="none")}))}function ux(r){const e=r.recording??{};tx.textContent=e.detail||"等待设备数据",Et("#elapsed").textContent=`${(e.elapsed_sec||0).toFixed(1)}s`,Et("#remaining").textContent=e.remaining_sec>0?`${e.remaining_sec.toFixed(1)}s`:"—",Et("#dropped").textContent=e.dropped_samples||0,Et("#status-pulse").style.background=e.state===2?"var(--green)":e.state===7?"var(--red)":"var(--amber)";const t=Number(e.export_progress??0),i=String(e.export_dir??""),n=String(e.export_error??"");n?(ka.style.display="",On.textContent="转换失败",On.style.color="var(--red)",Ba.style.width="100%",za.textContent=`错误: ${n}`):t>0&&t<1?(ka.style.display="",On.textContent=`转换中 ${Math.round(t*100)}%`,On.style.color="",Ba.style.width=`${Math.round(t*100)}%`,za.textContent=""):t>=1&&i&&(ka.style.display="",On.textContent="转换完成",On.style.color="",Ba.style.width="100%",za.textContent=`数据目录: ${i}`);const s=r.arms??{};for(const[o,c]of Object.entries(s)){const l=c.positions_rad;l!=null&&l.length&&($h(o,l),$c[o]=new Date().toISOString())}const a=Object.values($c);nx.textContent=a.length?`joint_states · ${a[a.length-1]}`:"等待 joint_states",cx(s),mx(r.grippers??{}),hx(r.preview_cameras??{})}const dx={right:{open:4e3,close:12e3},left:{open:400,close:949},mid:{open:0,close:9e3}};function fx(r,e){const t=dx[r.replace("gripper_","")];if(!t)return 0;const i=t.close-t.open;if(i<=0)return 0;const n=Math.min(1,Math.max(0,(t.close-e)/i));return Math.round(n*100)}function px(r,e){const t=r.replace("gripper_",""),i=fx(r,e);return`<article class="gripper-card"><h4>${t}</h4><div style="margin-bottom:8px;font:11px ui-monospace,Menlo,monospace;color:#8793a8">开合度 ${i}%</div><div style="height:8px;background:#0b0f17;border:1px solid #202c40;border-radius:4px;overflow:hidden"><div style="height:100%;width:${i}%;background:linear-gradient(90deg,#55a6ff,#67d391);transition:width .2s"></div></div></article>`}function mx(r){const e=Object.entries(r);if(!e.length)return;const t=e.filter(([i])=>i.endsWith("/position"));t.length&&(sx.innerHTML=t.map(([i,n])=>px(i.split("/").filter(Boolean)[0]??"gripper",Number(n.position??0))).join(""))}function Jh(){fs=new WebSocket(`${location.protocol==="https:"?"wss":"ws"}://${location.host}/ws`),fs.onopen=()=>{gr.className="connection online",gr.querySelector("span").textContent="WebSocket 已连接 · 只读机器人"},fs.onclose=()=>{gr.className="connection",gr.querySelector("span").textContent="已断开 · 2 秒后重连",setTimeout(Jh,2e3)},fs.onerror=()=>rx("无法连接录制服务",!0),fs.onmessage=r=>{const e=JSON.parse(r.data);e.type==="recording_snapshot"&&ux(e)}}ox();fetch("/api/layout").then(r=>r.json()).then(r=>(xs=r,lx())).catch(r=>{_s.textContent=`布局加载失败: ${String(r)}`});Jh();const Io=Ce.init({column:12,cellHeight:60,margin:12,float:!1,animate:!0,draggable:{handle:".panel-head"}},".layout.grid-stack"),jh="recording-layout-v3",jc=localStorage.getItem(jh);if(jc)try{Io.load(JSON.parse(jc))}catch{}Io.on("change",()=>{localStorage.setItem(jh,JSON.stringify(Io.save(!1)))});
