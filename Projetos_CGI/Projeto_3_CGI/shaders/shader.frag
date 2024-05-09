precision highp float;

varying vec3 fNormal;
varying vec3 fLight;
varying vec3 fViewer;
varying vec3 posC;

const int MAX_LIGHTS = 8;

struct LightInfo {
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;

    vec4 position;
    
    bool active;
    bool spotlight;
    bool directional;
};

struct MaterialInfo {
    vec3 Ka;
    vec3 Kd;
    vec3 Ks;
    float shininess; 
};

uniform vec3 ambient;
uniform vec3 diffuse;
uniform vec3 specular;
uniform vec4 position;

uniform int uNLights; // Effective number of lights used

uniform mat4 mView;
uniform mat4 mViewNormals;

uniform LightInfo uLight[MAX_LIGHTS]; // The array of lights present in the scene
uniform MaterialInfo uMaterial;  // The material of the object being drawn

void main() {

    for(int i = 0; i < MAX_LIGHTS; i++) {
	    if(i == uNLights) break;

	    if(uLight[i].active) {

	        vec3 L;

	        if(uLight[i].directional) {
    		    L = normalize((mViewNormals * vec4(uLight[i].position)).xyz);
	        } else {
    		    L = normalize((mView * vec4(uLight[i].position)).xyz - posC);
	        }

	        vec3 V = normalize(-posC);
	        vec3 N = normalize(fNormal);
	        vec3 R = reflect(-L, N);

	        float diffuseFactor = max(dot(N, L), 0.0);
	        float specularFactor = pow(max(dot(R, V), 0.0), uMaterial.shininess);

	        vec3 ambientColor = uLight[i].ambient * uMaterial.Ka;

	        vec3 diffuseColor = uLight[i].diffuse * uMaterial.Kd;
	        vec3 diffuseFinal = diffuseFactor * diffuseColor;

	        vec3 specularColor = uLight[i].specular * uMaterial.Ks;
	        vec3 specularFinal = specularFactor * specularColor;

            if( dot(L,N) < 0.0 ) {
                specularFinal = vec3(0.0, 0.0, 0.0);
            }
            gl_FragColor += vec4(ambientColor + diffuseFinal + specularFinal, 1.0);
        }
    }
}
