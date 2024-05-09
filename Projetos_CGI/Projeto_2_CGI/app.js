import { buildProgramFromSources, loadShadersFromURLS, setupWebGL } from "../../libs/utils.js";
import { ortho, lookAt, flatten } from "../../libs/MV.js";
import {modelView, loadMatrix, multRotationX, multRotationY, multRotationZ, multScale, multTranslation, popMatrix, pushMatrix} from "../../libs/stack.js";

import * as CUBE from '../../libs/objects/cube.js';
import * as CYLINDER from '../../libs/objects/cylinder.js'
import * as SPHERE from '../../libs/objects/sphere.js'

function setup(shaders)
{
    let canvas = document.getElementById("gl-canvas");
    let aspect = canvas.width / canvas.height;

    /** @type WebGL2RenderingContext */
    let gl = setupWebGL(canvas);

    // Drawing mode (gl.LINES or gl.TRIANGLES)
    let mode = gl.TRIANGLES;

    let program = buildProgramFromSources(gl, shaders["shader.vert"], shaders["shader.frag"]);

    let mProjection = ortho(-1*aspect,aspect, -1, 1,0.01,3);
    let mView = lookAt([1, 1, 1], [0, 0.7, 0], [0, 1, 0]);

    let zoom = 1.0;

    const box = {
        altitude: 0,
        slope: 0
    }

    /** Model parameters */
    let rg = 0;
    let altitude = 0;
    let slope = 0;
    let propeller_rotation = 0;
    let tail_propeller_rotation = 0;
    let speed = 0;
    let lastdate = 0;
    let aux = 0;
    let timeout = 0;
    let delta_time = 0;
    let accelerating = false;
    let box_dropped = false;
    let box_altitude = 0;

    let boxes = [];

    resize_canvas();
    window.addEventListener("resize", resize_canvas);

    document.onkeyup = function(event) {
        console.log(event.key);
        switch(event.key) {
            case 'ArrowLeft':
                // Front view
                accelerating = false;
                break;
        }
    }

    document.onkeydown = function(event) {
        console.log(event.key);
        switch(event.key) {
            case '1':
                // Front view
                mView = lookAt([0,0.6,1], [0,0.6,0], [0,1,0]);
                break;
            case '2':
                // Top view
                mView = lookAt([0,1.6,0],  [0,0.6,0], [0,0,-1]);
                break;
            case '3':
                // Right view
                mView = lookAt([1, 0.6, 0.], [0, 0.6, 0], [0, 1, 0]);
                break;
            case '4':
                //mView = lookAt([2, 1.2, 1], [0, 0.6, 0], [0, 1, 0]);
                mView = lookAt([1, 1, 1], [0, 0.7, 0], [0, 1, 0]);
                break;
            case '5':
                mView = lookAt([Math.sin(speed), 0.099 + altitude, 0], [0, 0, 0], [0, 1, 0]);
                break;
            case 'w':
                mode = gl.LINES; 
                break;
            case 's':
                mode = gl.TRIANGLES;
                break;
            case 'q':
                rg += 1;
                break;
            case 'e':
                rg -= 1;
                break;
            case '+':
                zoom /= 1.1;
                break;
            case '-':
                zoom *= 1.1;
                break;
            case 'ArrowUp':
                altitude += 0.01;
                break;
            case 'ArrowDown':
                if (altitude > 0) {
                    if (altitude > 0.05)
                        altitude -= 0.01;
                    else if (!accelerating && slope == 0)
                        altitude -= 0.01;
                }
                else // sometimes floats misbehave
                    altitude = 0;
                break;
            case 'ArrowLeft':
                accelerating = true;
                if ((slope < 30) && (altitude >= 0)) {
                    slope++;
                    if (altitude < 0.05) // gain security altitude first
                        altitude+=0.01;
                }
                break;
            case ' ':
                console.log("Alt: " + altitude);
                console.log("Slope: " + slope);
                let theta = speed * Math.PI/180;
                let newbox = {
                    x: 0.75*Math.cos(theta),
                    y: 0.75*Math.sin(theta),
                    altitude: altitude,
                    born: Date.now(),
                    slope: slope
                }
                console.log("(x, y) = (" + newbox.x + ", " + newbox.y + ")");
                boxes.push(newbox);
                break;
        }
    }

    gl.clearColor(0.302,0.424,1.,1.);
    gl.enable(gl.DEPTH_TEST);   // Enables Z-buffer depth test
    const uColor = gl.getUniformLocation(program, "uColor");

    CUBE.init(gl);
    CYLINDER.init(gl);
    SPHERE.init(gl);

    window.requestAnimationFrame(render);

    function resize_canvas(event)
    {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        aspect = canvas.width / canvas.height;

        gl.viewport(0,0,canvas.width, canvas.height);
        mProjection = ortho(-aspect*zoom,aspect*zoom, -zoom, zoom,0.01,3);
    }

    function uploadProjection()
    {
        uploadMatrix("mProjection", mProjection);
    }

    function uploadModelView()
    {
        uploadMatrix("mModelView", modelView());
    }

    function uploadMatrix(name, m) {
        gl.uniformMatrix4fv(gl.getUniformLocation(program, name), false, flatten(m));
    }

    function Chopter() 
    {
        pushMatrix();
            multRotationX(slope);
            pushMatrix();
                Cabin();
            popMatrix();
            pushMatrix();
                multTranslation([0, 0.01, -0.15]);
                Tail();
            popMatrix();
            pushMatrix();
                multTranslation([0, 0.06, 0]);
                Rotor();
            popMatrix();        
            pushMatrix();
                multTranslation([0.005, 0.01, -0.265]);
                TailRotor();
            popMatrix();
            pushMatrix();
                multTranslation([0, -0.05, 0]);
                Skates();
            popMatrix();
        popMatrix();
    }

    function Cabin()
    {
        multScale([0.1, 0.1, 0.2]);
        uploadModelView();
        gl.uniform4f(uColor, 1.0, 0.0, 0.0, 1.0); // Red
        SPHERE.draw(gl, program, mode);
    }

    function Tail()
    {
        multScale([0.01, 0.01, 0.25]);
        uploadModelView();
        SPHERE.draw(gl, program, mode);
    }

    function Rotor()
    {
        if(altitude > 0.0 || slope > 0)
            propeller_rotation = (propeller_rotation + 30 + slope);
        
        multRotationY(-propeller_rotation);
        pushMatrix();
            multScale([0.01, 0.02, 0.01]);
            uploadModelView();
            gl.uniform4f(uColor, 1.0, 1.0, 0.0, 1.0); // Yellow
            CYLINDER.draw(gl, program, mode);
        popMatrix();
        pushMatrix();
            multTranslation([0, -0.07, 0]);
            Propeller();
        popMatrix();
    }

    function Propeller()
    {
        gl.uniform4f(uColor, 0.0, 0.0, 1.0, 1.0); // Blue
        pushMatrix();
            PropellerA();
        popMatrix();
        pushMatrix();
            PropellerB();
        popMatrix();
    }

    function PropellerA()
    {
        multTranslation([0, 0.07, 0.10]);
        multScale([0.01, 0.01, 0.2]);
        uploadModelView();
        SPHERE.draw(gl, program, mode);
    }

    function PropellerB()
    {
        multTranslation([0, 0.07, -0.10]);
        multScale([0.01, 0.01, 0.2]);
        uploadModelView();
        SPHERE.draw(gl, program, mode);
    }

    function TailRotor()
    {
        if(altitude > 0.0)
            tail_propeller_rotation = tail_propeller_rotation + 30 + slope;
    
        multRotationX(tail_propeller_rotation);
        pushMatrix();
            multRotationZ(-90);
            multScale([0.01, 0.01, 0.01]);
            uploadModelView();
            gl.uniform4f(uColor, 1.0, 1.0, 0.0, 1.0); // Yellow
            CYLINDER.draw(gl, program, mode);
        popMatrix();
        pushMatrix();
            TailPropeller();
        popMatrix();
    }

    function TailPropeller()
    {
        gl.uniform4f(uColor, 0.0, 0.0, 1.0, 1.0); // Blue
        pushMatrix();
            TailPropA();
        popMatrix();
        pushMatrix();
            TailPropB();
        popMatrix();
    }

    function TailPropA()
    {
        multTranslation([0, 0, -0.02]);
        multScale([0.005, 0.005, 0.04]);
        uploadModelView();
        SPHERE.draw(gl, program, mode);
    }

    function TailPropB()
    {
        multTranslation([0, 0, 0.02]);
        multScale([0.005, 0.005, 0.04]);
        uploadModelView();
        SPHERE.draw(gl, program, mode);
    }

    function Skates()
    {
        pushMatrix();
            Skate();
        popMatrix();
        pushMatrix();
            multRotationY(180);
            Skate();
        popMatrix();
    }

    function Skate()
    {
        multTranslation([0, -0.01, 0]);

        // front bar
        pushMatrix();
            multTranslation([-0.03, 0, 0.04]);
            multRotationZ(-20);
            multRotationX(-20);
            multScale([0.01, 0.04, 0.01]);
            uploadModelView();
            gl.uniform4f(uColor, 0.573, 0.573, 0.573, 1.0); // Gray
            CUBE.draw(gl, program, mode);
        popMatrix();

        // rear bar
        pushMatrix();
            multTranslation([-0.03, 0, -0.04]);
            multRotationZ(-20);
            multRotationX(20);
            multScale([0.01, 0.04, 0.01]);
            uploadModelView();
            gl.uniform4f(uColor, 0.573, 0.573, 0.573, 1.0); // Gray
            CUBE.draw(gl, program, mode);
        popMatrix();

        // bottom
        pushMatrix();
            multTranslation([-0.037, -0.02, 0]);
            multRotationX(90);
            multScale([0.015, 0.2, 0.015]);
            uploadModelView();
            gl.uniform4f(uColor, 1.0, 1.0, 0.0, 1.0); // Yellow
            CYLINDER.draw(gl, program, mode);
        popMatrix();
    }

    function Box() {
        pushMatrix();;
            multScale([0.03, 0.03, 0.03]);
            uploadModelView();
            gl.uniform4f(uColor, 0.741, 0.592, 0.439, 1);
            CUBE.draw(gl, program, mode);
        popMatrix();
    }

    function City()
    {
        multRotationY(rg);

        pushMatrix();
            Floor();
        popMatrix();
        pushMatrix();
            multTranslation([0.75, 0.01, 0]);
            Pista();
        popMatrix();
        pushMatrix();
        multTranslation([-0.95, 0, -1.1]);
            Floresta();
        popMatrix();
        pushMatrix();
            multRotationY(-90);
            multTranslation([-0.95, 0, -0.05]);
            Floresta();
        popMatrix();
        pushMatrix();
            Predios();
        popMatrix();
        pushMatrix();
            Ruas();
        popMatrix();
        pushMatrix();
            altitude = parseFloat(altitude.toFixed(2));
            aux = lastdate;
            lastdate = Date.now();
            delta_time = lastdate - aux;
            timeout = timeout + delta_time;
            if (slope > 0){
                if (timeout > 100 && !accelerating) {
                    slope--;
                    timeout = 0;
                } else {
                    speed = (speed + (slope * 0.05)) % 360;
                }
            }
            multRotationY(-speed);
            multTranslation([0.75, 0.092 + altitude, 0]);
            Chopter();
            multRotationX(slope);
            multTranslation([0, -0.065, 0]);
            Box();
        popMatrix();
        pushMatrix();
                DropedBoxes();
        popMatrix();
    }

    function Floor()
    {
        pushMatrix();
            multTranslation([0, 0, 0]);
            multScale([2, 0.01, 2]);

            uploadModelView();
            gl.uniform4f(uColor, 0.0, 0.6, 0.2, 0.8);
            CUBE.draw(gl, program, mode);
        popMatrix();
    }


    function Arvores() {
        pushMatrix();
            ArvoreNova();
        popMatrix();
        pushMatrix();
            multTranslation([0, 0.03, 0.1]);
            ArvoreVelha();
        popMatrix();
    }

    function ArvoreNova(){
        // tronco
        pushMatrix();
            multTranslation([0, 0.03, 0]);
            multScale([0.05, 0.05, 0.05]);
            uploadModelView();
            gl.uniform4f(uColor, 0.5, 0.4, 0.0, 0.8);
            CYLINDER.draw(gl, program, mode);
        popMatrix();
        // copa
        pushMatrix();
            multTranslation([0, 0.1, 0]);
            multScale([0.1, 0.1, 0.1]);
            uploadModelView();
            gl.uniform4f(uColor, 0.0, 0.4, 0.0, 0.8);
            SPHERE.draw(gl, program, mode);
        popMatrix();
    }

    function ArvoreVelha(){
        // tronco
        pushMatrix();
            multTranslation([0, 0.02, 0]);
            multScale([0.05, 0.09, 0.05]);
            uploadModelView();
            gl.uniform4f(uColor, 0.3, 0.3, 0.0, 0.8);
            CYLINDER.draw(gl, program, mode);
        popMatrix();
        // copa
        pushMatrix();
            multTranslation([0, 0.1, 0]);
            multScale([0.1, 0.1, 0.1]);
            uploadModelView();
            gl.uniform4f(uColor, 0.0, 0.4, 0.0, 0.8);
            SPHERE.draw(gl, program, mode);
        popMatrix();
    }

    function Predios(){
        pushMatrix();
            multTranslation([0.7, 0, -0.9]);
            multRotationY(-90);
            Predio1();
            multTranslation([-0.05, 0, -0.25]);
            Arvores();
        popMatrix();
        pushMatrix();
            Predio2();
        popMatrix();
        pushMatrix();
            Predio3();
        popMatrix();
    }

    function Predio1(){
        // edifício
        pushMatrix();
            multTranslation([0, 0.135, 0]);
            multScale([0.2, 0.26, 0.2]);
            uploadModelView();
            gl.uniform4f(uColor, 0.9804, 0.498, 0.4471, 0.93);
            CUBE.draw(gl, program, mode);
        popMatrix();
        
        pushMatrix();
            multTranslation([0.101, 0.19, 0]);
            JanelaPredio1();
        popMatrix();

        //porta
        pushMatrix();
            multTranslation([0.101, 0.055, 0]);
            multScale([0, 0.1, 0.04]);
            uploadModelView();
            gl.uniform4f(uColor, 0.173, 0.102, 0.043, 0.6);
            CUBE.draw(gl, program, mode);
        popMatrix();
    }

    function JanelaPredio1(){
        // aro
        pushMatrix();
            let largura = 0.15;
            multScale([0.0, 0.1, largura]);
            uploadModelView();
            gl.uniform4f(uColor, 0.5784, 0.8471, 0.982, 0.43);
            CUBE.draw(gl, program, mode);
        popMatrix();
        //portadas da janela
        Portadas(3, largura);
    }

    function Portadas(n, largura){
        let espacamento = largura / n;
        for(let i=0; i<n-1; i++) {
            let signal = -1;
            for (let j=0; j<2; j++, signal = -signal) {
            pushMatrix();
                multTranslation([0, 0, i * espacamento * signal]);
                multScale([0.0, 0.1, 0.01]);
                uploadModelView();
                gl.uniform4f(uColor, 0.3, 0.3, 0.3, 0.73);
                CUBE.draw(gl, program, mode);
            popMatrix();
            }
        }
    }

    function Predio2(){
        multScale([1, 0.2, 1]);
        pushMatrix();
            multTranslation([-0.9, 1.66, 0.9]);
            pushMatrix();
                multScale([0.2, 3.3, 0.2]);
                uploadModelView();
                gl.uniform4f(uColor, 0.5, 0.5, 0.7, 0.93);
                CUBE.draw(gl, program, mode);
            popMatrix();
       
            pushMatrix();
                JanelasPredio2Totais();
            popMatrix();

            pushMatrix();
                multRotationY(90);
                JanelasPredio2Totais();
            popMatrix();

        //porta
            pushMatrix();
                multTranslation([0.10, -1.4, 0]);
                multScale([0, 0.5, 0.04]);
                uploadModelView();
                gl.uniform4f(uColor, 0.173, 0.102, 0.043, 0.6);
                CUBE.draw(gl, program, mode);
            popMatrix();
        popMatrix();
    }

    function Predio3(){
        multTranslation([0, 0.333, 0]);
        multScale([1, 0.20, 1]);
        pushMatrix();
        multScale([0.2, 3.3, 0.2]);
        uploadModelView();
        gl.uniform4f(uColor, 0.238, 0.173, 0.45, 0.93);
        CUBE.draw(gl, program, mode);
        popMatrix();
       
        pushMatrix();
            JanelasPredio2Totais();
        popMatrix();

        pushMatrix();
        multRotationY(-90);
        JanelasPredio2Totais();
        popMatrix();

        pushMatrix();
        multRotationY(90);
        JanelasPredio2Totais();
        popMatrix();

        pushMatrix();
        multRotationY(180);
        JanelasPredio2Totais();
        popMatrix();

        //porta
        pushMatrix();
        multRotationY(-90);
        multTranslation([0.10, -1.39, 0]);
        multScale([0, 0.5, 0.04]);
        uploadModelView();
        gl.uniform4f(uColor, 0.173, 0.102, 0.043, 0.6);
        CUBE.draw(gl, program, mode);
        popMatrix();

        //copa
        pushMatrix();
        multTranslation([0, 2.15, 0]);
        multScale([0.15, 1, 0.15]);
        uploadModelView();
        gl.uniform4f(uColor, 0.238, 0.173, 0.45, 0.93);
        CUBE.draw(gl, program, mode);
        popMatrix();

        pushMatrix();
        JanelasPredio3CopaTotal();
        popMatrix();

        pushMatrix();
        multRotationY(180);
        JanelasPredio3CopaTotal();
        popMatrix();

        pushMatrix();
        multTranslation([0, 2.8, 0]);
        multScale([0.07, 0.3, 0.07]);
        uploadModelView();
        gl.uniform4f(uColor, 0.2, 0.2, 0.2, 0.93);
        CUBE.draw(gl, program, mode);
        popMatrix();

        pushMatrix();
        multTranslation([0, 3.15, 0]);
        multScale([0.01, 0.4, 0.01]);
        uploadModelView();
        gl.uniform4f(uColor, 0.3, 0.3, 0.3, 0.93);
        CUBE.draw(gl, program, mode);
        popMatrix();


    }

    function JanelasPredio2(){
        pushMatrix();
        multTranslation([0.101, -0.2, 0.05]);
        multScale([0.0, 0.3, 0.05]);
        uploadModelView();
        gl.uniform4f(uColor, 0.5784, 0.8471, 0.982, 0.43);
        CUBE.draw(gl, program, mode);
        popMatrix();
        pushMatrix();
        multTranslation([0.101, -0.2, -0.05]);
        multScale([0.0, 0.3, 0.05]);
        uploadModelView();
        gl.uniform4f(uColor, 0.5784, 0.8471, 0.982, 0.43);
        CUBE.draw(gl, program, mode);
        popMatrix();
    }

    function JanelasPredio3Copa(){
        pushMatrix();
        multTranslation([0.08, -0.2, 0.03]);
        multScale([0.0, 0.2, 0.04]);
        uploadModelView();
        gl.uniform4f(uColor, 0.5784, 0.8471, 0.982, 0.43);
        CUBE.draw(gl, program, mode);
        popMatrix();
        pushMatrix();
        multTranslation([0.08, -0.2, -0.03]);
        multScale([0.0, 0.2, 0.04]);
        uploadModelView();
        gl.uniform4f(uColor, 0.5784, 0.8471, 0.982, 0.43);
        CUBE.draw(gl, program, mode);
        popMatrix();
    }

    function JanelasPredio3CopaTotal(){
        pushMatrix();
        multTranslation([0, 2.15, 0]);
        JanelasPredio3Copa();
        popMatrix();

        pushMatrix();
        multTranslation([0, 2.55, 0]);
        JanelasPredio3Copa();
        popMatrix();

        pushMatrix();
        multRotationY(-90);
        multTranslation([0, 2.15, 0]);
        JanelasPredio3Copa();
        popMatrix();

        pushMatrix();
        multRotationY(-90);
        multTranslation([0, 2.55, 0]);
        JanelasPredio3Copa();
        popMatrix();

    }

    function JanelasPredio2Totais(){
        //janelas 1 andar
        pushMatrix();
        JanelasPredio2();
        popMatrix();

        //janelas rc andar
        pushMatrix();
        multTranslation([0.0, -0.5, 0.0]);
        JanelasPredio2();
        popMatrix();

        //janelas 2 andar
        pushMatrix();
        multTranslation([0.0, 0.5, 0.0]);
        JanelasPredio2();
        popMatrix();

        //janelas 3 andar
        pushMatrix();
        multTranslation([0.0, 1.0, 0.0]);
        JanelasPredio2();
        popMatrix();

        //janelas 3 andar
        pushMatrix();
        multTranslation([0.0, 1.5, 0.0]);
        JanelasPredio2();
        popMatrix();
    }

    function Pista(){
        //multTranslation([0, 0, 0]);
        pushMatrix();
        multScale([0.5, 0, 0.5]);
        uploadModelView();
        gl.uniform4f(uColor, 0.43, 0.43, 0.43, 0.53);
        CUBE.draw(gl, program, mode);
        popMatrix();
        pushMatrix();
        multTranslation([-0.1, 0.00001, 0]);
        multScale([0.1, 0.0, 0.3]);
        uploadModelView();
        gl.uniform4f(uColor, 0.4, 0.0, 0.0, 0.53);
        CUBE.draw(gl, program, mode);
        popMatrix();
        pushMatrix();
        multTranslation([0.1, 0.00001, 0]);
        multScale([0.1, 0.0, 0.3]);
        uploadModelView();
        gl.uniform4f(uColor, 0.4, 0.0, 0.0, 0.53);
        CUBE.draw(gl, program, mode);
        popMatrix();
        pushMatrix();
        multTranslation([0, 0.00001, 0]);
        multScale([0.1, 0.0, 0.05]);
        uploadModelView();
        gl.uniform4f(uColor, 0.4, 0.0, 0.0, 0.53);
        CUBE.draw(gl, program, mode);
        popMatrix();
    }
   
    function Ruas(){
        pushMatrix();
            multRotationZ(90);
            multTranslation([0.01, -0.1, 0.9]);
            multScale([0, 1.8, 0.1]);
            uploadModelView();
            gl.uniform4f(uColor, 0.145, 0.145, 0.145, 1);
            CUBE.draw(gl, program, mode);
        popMatrix();
        pushMatrix();
            multTranslation([0.9, 0.01, 0.9]);
            Riscas(17);
        popMatrix();
        pushMatrix();
            multRotationZ(90);
            multTranslation([0.01, 0, 0.52]);
            multScale([0, 0.1, 0.85]);
            uploadModelView();
            gl.uniform4f(uColor, 0.145, 0.145, 0.145, 1);
            CUBE.draw(gl, program, mode);
        popMatrix();
        pushMatrix();
            multRotationY(90);
            multTranslation([-0.2, 0.01, 0]);
            Riscas(8);
        popMatrix();
        pushMatrix();
            multRotationZ(90);
            multTranslation([0.01, -0.95, 0.6]);
            multScale([0, 0.1, 0.7]);
            uploadModelView();
            gl.uniform4f(uColor, 0.145, 0.145, 0.145, 1);
            CUBE.draw(gl, program, mode);
        popMatrix();
        pushMatrix();
            multRotationY(90);
            multTranslation([-0.35, 0.01, 0.95]);
            Riscas(6);
        popMatrix();
        pushMatrix();
            multRotationZ(90);
            multTranslation([0.01, -0.7, -0.525]);
            multScale([0, 0.1, 0.55]);
            uploadModelView();
            gl.uniform4f(uColor, 0.145, 0.145, 0.145, 1);
            CUBE.draw(gl, program, mode);
        popMatrix();
        pushMatrix();
            multRotationY(90);
            multTranslation([0.73, 0.01, 0.7]);
            Riscas(5);
        popMatrix();
    }

    function Riscas(n){
        multRotationZ(90);
        for (let i=0; i<n; i++) {
            pushMatrix();
            multScale([0, 0.05, 0.01]);
            multTranslation([0.01, 2 * i, 0]);
            uploadModelView();
            gl.uniform4f(uColor, 0.408, 0.408, 0.408, 1);
            CUBE.draw(gl, program, mode);
            popMatrix();
        }
    }

    function Floresta()
    {
        for (let i=0; i<4; i++) {
            multTranslation([0, 0.0, 0.2]);
            pushMatrix();
                Arvores();
            popMatrix();
        }
    }

    function DropedBoxes() {
        for(let i=0; i<boxes.length; i++) {
            if (Date.now() - boxes[i].born < 5000) {
                if (boxes[i].altitude > 0)
                boxes[i].altitude = boxes[i].altitude - 0.01;
                pushMatrix();
                    multTranslation([boxes[i].x, boxes[i].altitude + 0.015, boxes[i].y]);
                    multScale([0.03, 0.03, 0.03]);
                    uploadModelView();
                    gl.uniform4f(uColor, 0.741, 0.592, 0.439, 1);
                    CUBE.draw(gl, program, mode);
                popMatrix();
            }
        }
    }

    function render()
    {
        window.requestAnimationFrame(render);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        gl.useProgram(program);
        
        // Send the mProjection matrix to the GLSL program
        mProjection = ortho(-aspect*zoom,aspect*zoom, -zoom, zoom,0.01,3);
        uploadProjection(mProjection);

        // Load the ModelView matrix with the Worl to Camera (View) matrix
        loadMatrix(mView);

        City();
    }
}


const urls = ["shader.vert", "shader.frag"];
loadShadersFromURLS(urls).then(shaders => setup(shaders))