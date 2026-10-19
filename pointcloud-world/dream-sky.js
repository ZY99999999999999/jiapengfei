export const dreamSkyFragment=`
 varying vec3 vSky;uniform float uTime,uColorMix;
 float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
 float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1)),f.x),f.y),f.z);}
 float fbm(vec3 p){float n=0.,a=.55;for(int i=0;i<4;i++){n+=noise(p)*a;p=p*2.03+vec3(13.1,7.7,3.5);a*=.5;}return n;}
 void main(){
 vec3 d=normalize(vSky);float horizon=exp(-abs(d.y)*6.);
 vec3 base=mix(vec3(.003,.006,.018),vec3(.022,.038,.062),horizon);
 float latitude=dot(d,normalize(vec3(.48,.84,.26)));
 float broad=exp(-pow(latitude/.085,2.));float spine=exp(-pow(latitude/.032,2.));
 float clouds=fbm(d*21.);float dust=fbm(d*46.+8.);
 float rift=smoothstep(.40,.66,dust)*exp(-pow((latitude+.015)/.047,2.));
 float density=broad*(.18+clouds*.7)+spine*pow(clouds,2.)*.8;
 density*=1.-rift*.87;
 vec3 galaxy=mix(vec3(.11,.17,.25),vec3(.30,.30,.35),smoothstep(-.6,.7,d.x));
 vec3 col=base+galaxy*density*.25;
 vec2 uv=vec2(atan(d.z,d.x)/6.2831853+.5,asin(d.y)/3.14159265+.5);
 vec2 grid=uv*vec2(210.,110.);vec2 cell=floor(grid);vec2 f=fract(grid)-.5;
 float h=hash(vec3(cell,3.));float stars=step(.988,h);
 float tiny=exp(-dot(f,f)*42.)*stars;
 float bright=step(.998,h)*exp(-dot(f,f)*24.);
 float twinkle=.91+.09*sin(uTime*.45+h*150.);
 col+=mix(vec3(.48,.66,1.),vec3(1.,.83,.61),hash(vec3(cell,8.)))*(tiny*1.6+bright*1.2)*twinkle;
 vec2 microGrid=uv*vec2(850.,430.);vec2 mf=fract(microGrid)-.5;
 float micro=step(.975,hash(vec3(floor(microGrid),13.)))*exp(-dot(mf,mf)*70.);
 col+=vec3(.37,.44,.55)*micro*(.18+broad*.32);
 col*=smoothstep(-.18,.04,d.y);col=mix(vec3(.006,.009,.014),col,uColorMix);
 gl_FragColor=vec4(col,1.);
 #include <colorspace_fragment>
}`;
