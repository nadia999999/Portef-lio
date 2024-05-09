//const vec4 lightPosition = vec4(2, 2, 1.3, 1.0);
//const vec4 lightPosition = vec4(-5, -5, -5, 1.0);
uniform vec4 lightPosition;

attribute vec4 vPosition;
attribute vec3 vNormal;

uniform mat4 mModelView; 
uniform mat4 mNormals;
uniform mat4 mView;
uniform mat4 mViewNormals;
uniform mat4 mProjection; 

varying vec3 fNormal;
varying vec3 fLight;
varying vec3 fViewer;

//uniform vec3 xyz;

varying vec3 vLight;
varying vec3 posC;

void main() {
   posC = (mModelView * vPosition).xyz;
   fNormal = (mNormals * vec4(vNormal, 0.0)).xyz;
   
   if(lightPosition.w == 0.0) 
      fLight = normalize((mViewNormals * lightPosition).xyz);                        
   else 
      fLight = normalize((mView*lightPosition).xyz - posC); 
   fViewer = vec3(0,0,1); 

   gl_Position = mProjection * mModelView * vPosition;
   //fNormal = vNormal;
}
