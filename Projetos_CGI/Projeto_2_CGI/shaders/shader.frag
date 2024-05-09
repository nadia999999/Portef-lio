precision highp float;

varying vec3 fNormal;
uniform vec4 uColor;

void main() {
    //gl_FragColor = vec4(fNormal, 1.0);
    gl_FragColor = vec4(uColor);
}