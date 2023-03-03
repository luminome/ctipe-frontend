import * as ALL from './ui-three-base';





return false;





/**/

import * as THREE from 'three/build/three.module.js';
import {mergeVertices} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {events as EVT} from "./ui-events";
import {controls as CTL} from "./ui-controls";
import {environment as RUN} from "./ui-scene";



import {loader} from './loader.js';
import {Conrec} from './vendor/conrec.js';

// import {wedge as Model} from "../../../wedge/src/three-js-base/wedge.three-js-base";
// import * as util from '../../../wedge/src/three-js-base/util.three-js-base';
// import config from '../../../wedge/src/three-js-base/config.json';

const util_color = new THREE.Color();

import package_detail from '../../package.json';

let scene, model, renderer, root_plane, r_root_plane, view_axes, render_l_date, trace_root_plane, trace_date_plane;
let debug_trace, date_trace, load_trace;

const ray_caster = new THREE.Raycaster();
ray_caster.params = {
    Line: {threshold: 1},
    Points: {threshold: 3.0},
}


const obs = document.getElementById('obs');
obs.style.display = 'none';

const get_t_from_dateStamp = (t) => {
    const d_arr = t.split('-');
    const d = {
        month: d_arr[0]-1,
        day: d_arr[1],
        year: d_arr[2],
        hour: d_arr[3],
        minute: d_arr[4]
    }
    const dd = new Date(Date.UTC(d.year, d.month, d.day, d.hour, d.minute));//, 0.0, 0.0);

    const d2 = new Date( dd.getUTCFullYear(), dd.getUTCMonth(), dd.getUTCDate(), dd.getUTCHours(), dd.getUTCMinutes(), dd.getUTCSeconds() );
    ///console.log(t, dd.getTime());
    const dct = d2.getTime();//.valueOf(); //Date.parse(dd.toUTCString());//new Date(d.year, d.month, d.day, d.hour, d.minute);
    //const dct = dd.toUTCString();///new Date(Date.parse(dcft));//

    //;//dd.UTC();//new Date(d.year, d.month, d.day, d.hour, d.minute).getUTCDate();// new Date(d.year, d.month, d.day, dd.getUTCHours(), d.minute);

    const spe = d_arr[2]+((d_arr[0]).padStart(2, '0'))+(d_arr[1].padStart(2, '0'))+(d_arr[3].padStart(2, '0'))+(d_arr[4].padStart(2, '0'));
    //    console.log(spe);



    //
    // const options = {
    //     weekday:"long",
    //     day:"2-digit",
    //     year:"numeric",
    //     month:"long",
    //     hour:"2-digit",
    //     minute:"2-digit",
    //     timeZoneName:"long",
    //     hour12:false
    // }

    const d_options = {
        weekday:"long",
        day:"2-digit",
        year:"numeric",
        month:"long",
    };
    const t_options = {
        hour:"2-digit",
        minute:"2-digit",
        hour12:false
    };
    const z_options = {
        timeZoneName:"long",
    };

    return {
        d:dd.toLocaleDateString('en-us', d_options),
        t:dd.toLocaleTimeString('en-us', t_options),
        z:dd.toLocaleDateString('en-us', z_options),
        dd:dd,
        df:spe,
    } // "Jul 2021 Friday"

}

const vc = {
    a: new THREE.Vector3(0, 0, 0),
    b: new THREE.Vector3(0, 0, 0),
    c: new THREE.Vector3(0, 0, 0),
    d: new THREE.Vector3(0, 0, 0),
    e: new THREE.Vector3(0, 0, 0)
}

const keys = {
    active: [],
    previous: []
}

const touch = {
    x: null,
    y: null,
    last: {
        x: 0,
        y: 0
    },
    delta: {
        x: 0,
        y: 0
    },
    origin: {
        x: 0,
        y: 0
    },
    origin_last: {
        x: 0,
        y: 0
    },
    origin_delta: {
        x: 0,
        y: 0
    }
}

const vars = {
    manifest_path: 'https://ctipe-production.up.railway.app/m?manifest',
    assets_path: 'https://ctipe-production.up.railway.app/',
    debug_trace: false,
    animator:{
        value_lerp: 0.25,
        rate: 100.0, //ms
        animating: true
    },
    debug:{
        debug:'info',
    },
    user:{
        mouse:{
            state: null,
            raw: new THREE.Vector3(0, 0, 0),
            plane_pos: new THREE.Vector3(0, 0, 0),
            last_down: new THREE.Vector3(0, 0, 0),
            new_down: new THREE.Vector3(0, 0, 0),
            origin_pos: new THREE.Vector3(0, 0, 0)
        },
        position:{
            dvl: new THREE.Vector3(0, 0, 0),
            actual: new THREE.Vector3(0, 0, 0),
        },
        state: false,
    },
    model:{
      position: new THREE.Vector3(0, 0, 0)
    },
    fps:{fps:null},
    render_frame: 0,
    evt:{
        action: null,
    },
    evt_cb:{},
    evt_reactivity: 200.0,
    evt_input: {
        keys: function(raw_keys_arr){
            keys.active = [...raw_keys_arr];//raw_keys_arr;
            //keys.previous = [];
            if (raw_keys_arr.includes('Tab')) {
                if (!keys.previous.includes('Tab')) {
                    vars.debug_trace = !vars.debug_trace;
                    debug_trace.plane_object.visible = vars.debug_trace;
                    //obs.innerHTML = vars.user.state;
                }
            }
            if (raw_keys_arr.includes('Space')) {
                if (!keys.previous.includes('Space')) {
                    vars.animator.animating = !vars.animator.animating;
                    //animator.animate();
                    // ///debug_trace.plane_object.visible = vars.debug_trace;
                    // //obs.innerHTML = vars.user.state;
                }
            }
            if (raw_keys_arr.includes('ArrowLeft')) {
                vars.animator.animating = false;
                animator.get_frame(-1);
            }
            if (raw_keys_arr.includes('ArrowRight')) {
                vars.animator.animating = false;
                animator.get_frame(1);
            }
            keys.previous = [...keys.active];
        },
        screen: function(type, evt_object){
            let action, roto_x, roto_y, pos_x, pos_y, delta_x, delta_y, scale_z;
            delta_x = null;
            delta_y = null;

            if (type === 'init') {
                pos_x = vars.view.width / 2;
                pos_y = vars.view.height / 2;
            }

            if (type === 'touch') {
                action = evt_object.action;
                const primary = evt_object.touches[0];
                if (evt_object.touches.length > 1) {
                    const secondary = evt_object.touches[1];
                    const x_o = primary.x - secondary.x;
                    const y_o = primary.y - secondary.y;
                    touch.last.x = touch.x;
                    touch.last.y = touch.y;
                    touch.x = primary.x - (x_o / 2);
                    touch.y = primary.y - (y_o / 2);
                    touch.delta.x = touch.last.x === null ? 0 : touch.x - touch.last.x;
                    touch.delta.y = touch.last.y === null ? 0 : touch.y - touch.last.y;

                    if (evt_object.action === 'secondary-down') {
                        touch.origin.x = touch.x;
                        touch.origin.y = touch.y;
                    }

                    touch.origin_delta.x = touch.origin_last.x - (touch.origin.x - touch.x);
                    touch.origin_delta.y = touch.origin_last.y - (touch.origin.y - touch.y);
                    touch.origin_last.x = touch.origin.x - touch.x;
                    touch.origin_last.y = touch.origin.y - touch.y;

                    roto_x = evt_object.angle_delta;
                    roto_y = touch.origin_delta.y / 100.0;
                    pos_x = touch.x;
                    pos_y = touch.y;
                    delta_x = touch.delta.x;
                    delta_y = touch.delta.y;
                    scale_z = 1.0 + evt_object.dist_delta;

                } else if (evt_object.touches.length === 1) {
                    pos_x = primary.x;
                    pos_y = primary.y;
                    delta_x = primary.x_d;
                    delta_y = primary.y_d;
                    touch.x = null;
                    touch.y = null;
                } else {
                    pos_x = evt_object.x;
                    pos_y = evt_object.y;
                }

            } else if (type !== 'init') {
                pos_x = evt_object.actual.x;
                pos_y = evt_object.actual.y;
                action = type;

                if (evt_object.down === true) {
                    if (evt_object.button === 2 || keys.active.includes('ShiftLeft') || keys.active.includes('ShiftRight')) {
                        roto_x = evt_object.delta.x / vars.evt_reactivity;
                        roto_y = evt_object.delta.y / vars.evt_reactivity;
                    } else {
                        delta_x = evt_object.delta.x;
                        delta_y = evt_object.delta.y;
                    }
                }
                if (action === 'scroll') {
                    scale_z = 1 + (evt_object.wheel_delta.y / vars.evt_reactivity);
                }
            }

            vars.user.mouse.state = action;
            vars.user.mouse.raw.x = (pos_x / vars.view.width) * 2 - 1;
            vars.user.mouse.raw.y = -(pos_y / vars.view.height) * 2 + 1;
            vars.user.mouse.raw.z = 0.0;
            cam.scale = 1 - (cam.distance / cam.default_reset_z);

            if (action === 'down' || action === 'secondary-down' || action === 'secondary-up') {
                vars.user.mouse.last_down.copy(vars.user.mouse.plane_pos);
                vars.user.mouse.origin_pos.copy(model.position);
            }

            if (roto_x || roto_y) {
                cam.cube.rotateOnWorldAxis(y_up, roto_x);
                cam.cube.rotateX(roto_y);
                cam.cube.updateMatrixWorld();
            }

            if (delta_x !== null || delta_y !== null) {
                vars.user.mouse.new_down.copy(vars.user.mouse.plane_pos);
                vars.user.position.dvl.copy(vars.user.mouse.new_down.sub(vars.user.mouse.last_down));
                model.position.copy(vars.user.position.dvl.add(vars.user.mouse.origin_pos));
            }

            if (scale_z) {
                if (cam.base_pos.z < cam.min_zoom) {
                    cam.base_pos.z = cam.min_zoom;
                } else {
                    cam.base_pos.multiplyScalar(scale_z);
                    vc.a.copy(vars.user.mouse.plane_pos).multiplyScalar(1 - scale_z);
                    model.position.sub(vc.a);
                }
            }

            cam.run();
            vars.evt.action = action;
        }
    },
    event_not_idle: function() {
        ray_caster.setFromCamera(vars.user.mouse.raw, cam.camera);
        ray_caster.ray.intersectPlane(root_plane, vars.user.mouse.plane_pos);

        ray_caster.setFromCamera(vars.user.mouse.raw, cam.camera);
        const intersects = ray_caster.intersectObjects(scene.children, true);
        let analog = 'none';
        if(intersects.length > 0) {
            let found = null;
            for(let i=0; i<intersects.length; i++){
                if (intersects[i].object.name === 'prog_bar') {
                    found = [i, intersects[i]];
                    break;
                }
            }
            if(found!==null) {

                analog = `prog_bar intersection(${found[0]}) index:${found[1].instanceId}`;
                //console.log(found);
                if(vars.evt.action === 'click'){
                    vars.debug.selecta = found[1].instanceId;
                    animator.get_frame(vars.debug.selecta, true);
                    vars.evt.action = null;
                }
            }
        }
        vars.debug.analog = analog;
    },
    view:{
        scene_width: 20,
        colors:{
            window_background: 0x333333,
            helpers: 0x666666,
        }
    },
    view_axes: false,
    view_grid: false,
    view_plane: false,
    view_labels: true,
}

const utilityColor = new THREE.Color();

const instance_dummy = new THREE.Object3D();

const y_up = new THREE.Vector3(0, 1, 0);
const x_right = new THREE.Vector3(1, 0, 0);
const z_in = new THREE.Vector3(0, 0, 1);

const directions = {
    up: y_up,
    in: z_in
}

const cam = {
    camera: null,
    default_z: 10,
    default_reset_z: 10,
    base_pos: new THREE.Vector3(0, 7.5, 15),
    pos: new THREE.Vector3(0, 0, 0),
    projected: new THREE.Vector3(0, 0, 0),
    event_origin: new THREE.Vector3(0, 0, 0),
    distance: 1.0,
    min_zoom: 0.25,
    scale: 1.0,
    cube: null,
    frustum: new THREE.Frustum(),
    frustum_mat: new THREE.Matrix4(),
    direction: new THREE.Vector3(0, 0, 0),
    right: new THREE.Vector3(0, 0, 0),
    dot_x: new THREE.Vector3(0, 0, 0),
    dot_y: new THREE.Vector3(0, 0, 0),
    dot_z: new THREE.Vector3(0, 0, 0),
    util_v: new THREE.Vector3(0, 0, 0),
    run() {
        cam.util_v.copy(cam.base_pos).applyQuaternion(cam.cube.quaternion);
        cam.pos.copy(cam.util_v);
        cam.util_v.copy(y_up).applyQuaternion(cam.cube.quaternion);
        cam.camera.up.copy(cam.util_v);
        cam.camera.position.copy(cam.pos);

        cam.util_v.set(0,0,0);
        cam.camera.lookAt(cam.util_v);

        cam.frustum.setFromProjectionMatrix(cam.frustum_mat.multiplyMatrices(cam.camera.projectionMatrix, cam.camera.matrixWorldInverse));
        cam.camera.getWorldDirection(cam.util_v);
        cam.direction.copy(cam.util_v);
        cam.right.crossVectors(cam.util_v, cam.camera.up);
        cam.dot_y = cam.camera.up.dot(root_plane.normal);
        cam.dot_x = cam.right.dot(x_right);
        cam.dot_z = z_in.dot(cam.util_v);

        cam.distance = cam.camera.position.length();
        cam.camera.updateProjectionMatrix();

        if(labels.init){
            labels.all.map(c=>{
                if(c.look){
                    c.mesh.quaternion.copy(cam.cube.quaternion);
                }
            });
        }
    }
}

const cube_box = new THREE.BoxGeometry(2, 2, 2);
cam.cube = new THREE.Mesh(cube_box, new THREE.MeshStandardMaterial({color: 0xffffff}));
cam.cube.updateMatrix();
cam.cube.userData.originalMatrix = cam.cube.matrix.clone();

const visibleAtZDepth = (depth, camera) => {
    // compensate for cameras not positioned at z=0
    const cameraOffset = camera.position.z;
    if (depth < cameraOffset) depth -= cameraOffset;
    else depth += cameraOffset;

    // vertical fov in radians
    const vFOV = camera.fov * Math.PI / 180;

    // Math.abs to ensure the result is always positive
    const vis_ht = 2 * Math.tan(vFOV / 2) * Math.abs(depth);
    return {'h': vis_ht, 'w': vis_ht * camera.aspect};
};

const array_at_index = (obj, index) => {
    return [
        obj[index*3],
        obj[index*3+1],
        obj[index*3+2]
    ]
}

const set_array_at_index = (obj, index, array) => {
    obj[index*3] = array[0];
    obj[index*3+1] = array[1];
    obj[index*3+2] = array[2];
}

const labels = {
    init: false,
    all: [],
    axes:{
        x:[],
        y:[],
        z:[]
    },
    bounds:{
        x:[-360,0],
        z:[-90,90],
        y:[0,100]
    },
    object: new THREE.Group(),
    label(text, tick=null){
        function update(){
            const g = L.canvas.getContext('2d');
            L.canvas.width = 256;
            L.canvas.height = 256;
            g.fillStyle = '#000000';
            g.fillRect(0, 0, L.canvas.width, L.canvas.height);
            g.font = `${L.line_height}px Helvetica`;
            g.fillStyle = 'white';

            const wid = g.measureText(L.text).width;
            const asc = g.measureText(L.text).actualBoundingBoxAscent;
            const hgt = asc+g.measureText(L.text).actualBoundingBoxDescent;

            g.fillText(L.text, L.canvas.width/2 - wid/2, L.canvas.height/2 + hgt/2);

            if(L.texture) L.texture.needsUpdate = true;

            //#// nice canvas-based ticks here
            /*
            if(L.tick !== null) {
                const t_x = [0.0, 0.0];
                const t_y = [0.0, 0.0];
                const px = L.canvas.width / 2;
                const py = L.canvas.height / 2;

                switch (L.tick) {
                    case 'L':
                        t_x[0] = 0.0;
                        t_y[0] = py;
                        t_x[1] = (px - wid/2) - (L.line_height / 6.0);
                        t_y[1] = py;
                        break;
                    case 'R':
                        t_x[0] = (px + wid/2) + (L.line_height / 6.0);
                        t_y[0] = py;
                        t_x[1] = L.canvas.width;
                        t_y[1] = py;
                        break;
                    case 'T':
                        t_x[0] = px;
                        t_y[0] = (py - asc) - (L.line_height / 6.0);
                        t_x[1] = px;
                        t_y[1] = 0.0;
                        break;
                    case 'B':
                        t_x[0] = px;
                        t_y[0] = (py + hgt / 2) + (L.line_height / 6.0);
                        t_x[1] = px;
                        t_y[1] = L.canvas.height;
                        break;
                }


                g.strokeStyle = 'white';
                g.lineWidth = 2.5;
                // draw a red line
                g.beginPath();
                g.moveTo(t_x[0], t_y[0]);
                g.lineTo(t_x[1], t_y[1]);
                g.stroke();
            }
            */
        }
        function init(){

            L.update();
            L.object = new THREE.Group();
            //#//Vector line based ticks handler;
            if(L.tick !== null) {
                let k_flo;

                switch (L.tick) {
                    case 'L':
                        k_flo = [-2.0,0,0,-1,0,0];
                        break;
                    case 'R':
                        k_flo = [1.0,0,0,2.0,0,0];
                        break;
                    case 'T':
                        k_flo = [0,1.0,0,0,2.0,0];
                        break;
                    case 'B':
                        k_flo = [0,-1.0,0,0,-2.0,0];
                        break;
                    case 'I':
                        k_flo = [0,0.0,-1.0,0,0,-2.0];
                        break;
                    case 'O':
                        k_flo = [0,0.0,1.0,0,0,2.0];
                        break;
                }

                const line_pos = Float32Array.from(k_flo, z => z*0.5);
                const t_geometry = new THREE.BufferGeometry();
                t_geometry.setAttribute('position', new THREE.BufferAttribute(line_pos, 3));
                const t_material = new THREE.LineBasicMaterial({
                    color: 0x666666
                });

                L.line = new THREE.Line(t_geometry, t_material);
                L.object.add(L.line);
            }

            L.texture = new THREE.Texture(L.canvas);
            L.texture.needsUpdate = true;

            const l_geometry = new THREE.PlaneGeometry(2,2);
            const l_material = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                blending: THREE.AdditiveBlending,
                map: L.texture,
                depthTest: true,
                depthWrite: false,
                opacity:1.0
            });

            L.mesh = new THREE.Mesh(l_geometry, l_material);
            L.object.add(L.mesh);

        }
        const L = {
            object:null,
            mesh:null,
            text:text,
            tick: tick,
            texture: null,
            canvas: document.createElement('canvas'),
            line_height: 48,
            init,
            update
        }
        return L
    },
    render(axis, interval, origin, tick, is_range, do_look=true, faces=null){
        if(is_range === true) {
            for (let n = labels.bounds[axis][0]; n <= labels.bounds[axis][1]; n += interval) {
                const label = labels.label(n, tick);
                label.init();
                const interval_n = Math.abs(labels.bounds[axis][0]) + n;
                const interval_scale = labels.bounds[axis][0] === 0 ? labels.bounds[axis][1] / df.model.bounds[axis] : Math.abs(labels.bounds[axis][0]) / df.model.bounds[axis];
                label.look = do_look;
                label.object.position.copy(origin);
                label.object.position[axis] = interval_n / interval_scale;
                labels.object.add(label.object);
                labels.all.push(label);
            }
        }else{
            const label = labels.label(is_range, tick);
            label.init();
            label.look = do_look;
            if(faces!==null){
                vc.e.copy(directions[faces]);
                label.mesh.lookAt(vc.e);
            }
            label.object.position.copy(origin);
            labels.object.add(label.object);
            labels.all.push(label);
            return label;
        }
    },
    make_label_object(text){

        labels.bounds.y[1] = df.model.data_max;

        vc.a.set(0.0,0.0,(df.model.bounds.z*2.0)+1.0);
        labels.render('x', 30.0, vc.a, 'I', true);

        vc.a.set(-1.0,0.0,0.0);
        labels.render('z', 15.0, vc.a, 'R', true);

        vc.a.set(df.model.bounds.x+1.0,0.0,(df.model.bounds.z*2.0));
        labels.render('y', 20.0, vc.a, 'L', true);

        vc.a.set(df.model.bounds.x,df.model.bounds.y+1.0,0.0);
        labels.render(null, null, vc.a, 'B', 'GMT');

        vc.a.set(0.0,df.model.bounds.y+1.0,0.0);
        labels.render(null, null, vc.a, 'B', 'GMT+24');

        vc.a.set(df.model.bounds.x+1.0, 0.0, df.model.bounds.z);
        labels.render(null, null, vc.a, 'L', 'EQUATOR', false, 'up');

        vc.a.set((df.model.bounds.x/2.0),df.model.bounds.y+1.0,0.0);
        labels.render(null, null, vc.a, 'B', 'NORTH', false);

        vc.a.set((df.model.bounds.x/2.0),0.0,(df.model.bounds.z*2.0)+2.0);
        labels.render(null, null, vc.a, null, 'ºEAST', false, 'up');

        vc.a.set(df.model.bounds.x+2.0,df.model.bounds.y/2.0,(df.model.bounds.z*2.0));
        labels.render(null, null, vc.a, null, 'CTIPe', false);

        df.model.world_bounds.add(labels.object);

        labels.init = true;
    },
}

const static_material = new THREE.MeshLambertMaterial({
    color: 0xFFFFFF,
    // flatShading: true,
    // metalness:0.5,
    // roughness:0.5,
    emissive: 0x333333
});

const color_bar = {
    subdivisions: 20,
    object: new THREE.Group(),
    chips: [],
    marker: null,
    init(){
        const s = df.model.height/color_bar.subdivisions;

        for(let i = 0; i <= color_bar.subdivisions; i++){
            const chip_geometry = new THREE.BoxGeometry(s,s,s);
            const chip = new THREE.Mesh(chip_geometry, static_material.clone());
            const n_color = color_gradient.get((i*s)/df.model.height);
            utilityColor.fromArray(n_color);
            chip.material.color.setHex('0x'+utilityColor.getHexString());
            chip.material.color.needsUpdate = true;
            chip.position.setY(i*s);
            color_bar.object.add(chip);
        }

        color_bar.object.position.set(10+(s/2),0,5+(s/-2));
        model.add(color_bar.object);

        const chip_geometry = new THREE.BoxGeometry(s*2,s/2,s*2);
        color_bar.marker = new THREE.Mesh(chip_geometry, static_material.clone());
        color_bar.marker.material.color.setHex('0xFF0000');
        color_bar.object.add(color_bar.marker);
    }
}

const prog_bar = {
    subdivisions: null,
    object: new THREE.Group(),
    marker_object: new THREE.Group(),
    chips: [],
    marker: null,
    running_max_values: [],
    running_max: 1.0,
    min_label: null,
    max_label: null,
    label_offset: [0.0,0.0,14.0],
    instance: null,
    element:{
        base_ht: 1.0
    },
    vertices:{
        position: null,
        scale: null,
        color: null,
        matrix: new THREE.Matrix4(),
        dummy: new THREE.Object3D()
    },
    viewed: 0,
    init(){
        //console.log(prog_bar.subdivisions, 'prog_bar.subdivisions');

        vc.a.fromArray(prog_bar.label_offset);
        prog_bar.min_label = labels.render(null, null, vc.a, 'I', 'min', false, 'up');
        prog_bar.max_label = labels.render(null, null, vc.a, 'I', 'max', false, 'up');

        prog_bar.vertices.position = new Float32Array(prog_bar.subdivisions*3);
        prog_bar.vertices.position.fill(0.0);
        prog_bar.vertices.scale = new Float32Array(prog_bar.subdivisions);
        prog_bar.vertices.scale.fill(1.0);
        prog_bar.vertices.color = new Float32Array(prog_bar.subdivisions*3);
        prog_bar.vertices.color.fill(0.125);

        const s = 20.0/(prog_bar.subdivisions-1);
        const chip_geometry = new THREE.BoxGeometry(s*0.9,0.5,0.5);
        chip_geometry.translate(0.0,0.25,0.0);

        prog_bar.instance = new THREE.InstancedMesh(chip_geometry, static_material, prog_bar.subdivisions);
        prog_bar.instance.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        prog_bar.instance.instanceColor = new THREE.InstancedBufferAttribute(prog_bar.vertices.color, 3, false, 1);
        prog_bar.instance.instanceColor.setUsage(THREE.DynamicDrawUsage);


        for(let i = 0; i < prog_bar.subdivisions; i++){
            prog_bar.vertices.position[i*3] = i*s;
            prog_bar.vertices.dummy.position.fromArray(array_at_index(prog_bar.vertices.position,i));
            prog_bar.vertices.dummy.scale.setScalar(prog_bar.vertices.scale[i]);
            prog_bar.vertices.dummy.updateMatrix();
            prog_bar.instance.setMatrixAt(i, prog_bar.vertices.dummy.matrix);
        }

        prog_bar.instance.instanceMatrix.needsUpdate = true;
        prog_bar.instance.instanceColor.needsUpdate = true;
        prog_bar.instance.position.set(-10,0,8);
        prog_bar.instance.name = 'prog_bar';

        model.add(prog_bar.instance);

        const marker_geometry = new THREE.BoxGeometry(s*0.75,0.5,0.7);
        marker_geometry.translate(0.0,0.25,0.0);
        prog_bar.marker = new THREE.Mesh(marker_geometry, static_material.clone());
        prog_bar.marker.material.color.setHex('0xFF0000');
        prog_bar.marker.name = 'marker';
        prog_bar.marker_object.add(prog_bar.marker);
        prog_bar.marker_object.position.set(-10,0,8);

        model.add(prog_bar.marker_object);
    },
    update(){
        //if(!load_queue.is_complete){
        if(prog_bar.viewed < prog_bar.subdivisions){
            const cmax = Math.max(...df.model.running_maximums.slice(0,prog_bar.viewed));
            const cmin = Math.min(...df.model.running_maximums.slice(0,prog_bar.viewed));

            for(let i = 0; i < prog_bar.subdivisions; i++){
                if(i <= load_queue.index && i > prog_bar.viewed){
                    set_array_at_index(prog_bar.vertices.color, i, [0.25,0.25,0.25]);
                }else if(i <= df.model.data_index){
                    prog_bar.viewed = Math.max(prog_bar.viewed, df.model.data_index);
                    const mx = df.model.running_maximums[i];
                    const cx = mx / df.model.data_max;

                    set_array_at_index(prog_bar.vertices.color, i, color_gradient.get(cx));
                    const norm = (mx - cmin) / (cmax - cmin);
                    prog_bar.vertices.scale[i] = norm;

                    if(!isNaN(norm)){
                        prog_bar.vertices.matrix.identity();
                        const pos = array_at_index(prog_bar.vertices.position, i);
                        prog_bar.vertices.matrix.makeTranslation(...pos);
                        vc.c.set(1.0, prog_bar.element.base_ht+norm, 1.0);
                        prog_bar.vertices.matrix.scale(vc.c);
                        prog_bar.instance.setMatrixAt(i, prog_bar.vertices.matrix);

                        if (Math.round(mx * 100.0) === Math.round(cmin * 100.0)) {
                            vc.d.set(...pos);
                            vc.a.fromArray(prog_bar.label_offset).add(vc.d);
                            prog_bar.min_label.text = 'MIN ' + mx.toFixed(1);
                            prog_bar.min_label.line_height = 24;
                            prog_bar.min_label.update();
                            prog_bar.min_label.object.position.lerp(vc.a, 1.0);
                        }

                        if (Math.round(mx * 100.0) === Math.round(cmax * 100.0)) {
                            vc.d.set(...pos);
                            vc.a.fromArray(prog_bar.label_offset).add(vc.d);
                            prog_bar.max_label.text = 'MAX ' + mx.toFixed(1);
                            prog_bar.max_label.line_height = 24;
                            prog_bar.max_label.update();
                            prog_bar.max_label.object.position.lerp(vc.a, 1.0);
                        }
                    }
                }
            }
            prog_bar.instance.instanceMatrix.needsUpdate = true;
            prog_bar.instance.instanceColor.needsUpdate = true;
        }

    },
    update_index(){
        //return;
        const t = (df.model.data_index/(load_queue.manifest_data.length-1)) * 20.0;
        const m_scale = prog_bar.vertices.scale[df.model.data_index];
        vc.c.set(1.0, prog_bar.element.base_ht+(m_scale)+0.4, 1.0);
        prog_bar.marker.scale.copy(vc.c);
        prog_bar.marker.position.set(t, -0.1, 0.0);
    }
}

const average = array => array.reduce((a, b) => a + b) / array.length;

const point_in_poly = (point, pX, pY) => {
    //#//poly is special
    let x = point.x;
    let y = point.y;
    let j = pX.length - 1;
    let odd = false;

    for (let i = 0; i < pX.length; i++) {
        if ((pY[i] < y && pY[j] >= y || pY[j] < y && pY[i] >= y) && (pX[i] <= x || pX[j] <= x)) {
            odd ^= (pX[i] + (y - pY[i]) * (pX[j] - pX[i]) / (pY[j] - pY[i])) < x;
        }
        j = i;
    }
    return odd;
}

const gauss = {
    makeGaussKernel(sigma){
        const GAUSS_KERN = 6.0;
        const dim = ~~(Math.max(3.0, GAUSS_KERN * sigma));
        const sqrtSigmaPi2 = Math.sqrt(Math.PI * 2.0) * sigma;
        const s2 = 2.0 * sigma * sigma;
        let sum = 0.0;

        const kernel = new Float32Array(dim - !(dim & 1)); // Make it odd number
        const half = ~~(kernel.length / 2);
        for (let j = 0, i = -half; j < kernel.length; i++, j++) {
            kernel[j] = Math.exp(-(i * i) / (s2)) / sqrtSigmaPi2;
            sum += kernel[j];
        }
        // Normalize the gaussian kernel to prevent image darkening/brightening
        for (let i = 0; i < dim; i++) {
            kernel[i] /= sum;
        }
        return kernel;
    },
    gauss_internal(data_object, kernel, ch, gray) {
        const data = data_object.data;
        const w = data_object.w;
        const h = data_object.h;
        const buff = new Uint8Array(w * h);
        const mk = Math.floor(kernel.length / 2);
        const kl = kernel.length;

        // First step process columns
        for (let j = 0, hw = 0; j < h; j++, hw += w) {
            for (let i = 0; i < w; i++) {
                let sum = 0;
                for (let k = 0; k < kl; k++) {
                    let col = i + (k - mk);
                    col = (col < 0) ? 0 : ((col >= w) ? w - 1 : col);
                    sum += data[(hw + col)] * kernel[k];
                }
                buff[hw + i] = sum;
            }
        }
        // Second step process rows
        for (let j = 0, offset = 0; j < h; j++, offset += w) {
            for (let i = 0; i < w; i++) {
                let sum = 0;
                for (let k = 0; k < kl; k++) {
                    let row = j + (k - mk);
                    row = (row < 0) ? 0 : ((row >= h) ? h - 1 : row);
                    sum += buff[(row * w + i)] * kernel[k];
                }
                data[(j * w + i)] = sum;
            }
        }
    },
    filter(grid, sigma){
        let raw = new Float32Array(grid.length*grid[0].length);

        for (let i=0;i<grid.length;i++){
            for (let j=0;j<grid[i].length;j++) {
                raw[i*grid[0].length+j] = grid[i][j];
            }
        }

        const data_object = {
            data: raw,
            w:grid[0].length,
            h:grid.length
        }

        const kernel = gauss.makeGaussKernel(sigma);
        gauss.gauss_internal(data_object, kernel, 0, false);
        return data_object;
    }
}

const color_gradient = {
    c_arr:[[0,0,1],[0.5,0,0],[1,1,0],[0,1,1],[1,1,1]],
    get(pos_n){
        const pos = Math.min(1.0, pos_n);
        const L = color_gradient.c_arr.length-1;
        const i = Math.floor(pos*(L));
        const b = 1.0-((pos*(L))-i);
        const a = ((pos*(L))-i);
        const c = [0,0,0];
        for(let r = 0; r < 3; r++){
            c[r] = i === L ? color_gradient.c_arr[L][r] : (color_gradient.c_arr[i][r]*b + (color_gradient.c_arr[i+1][r]*a));
        }
        return c;
    }
}

const plane_text = (line_height, style, resolution, names='show-names') => {

    function get_text(){
        const lines = [];
        P.watch.map(o =>{
            if(o.hasOwnProperty('formatted')){
                o.lines.map(l =>{
                    lines.push(l);
                });
            } else {
                Object.entries(o).map(v => {
                    let str = P.names === 'show-names' ? `${v[0]}:` : '';
                    if (typeof (v[1]) === 'number') {
                        str += `${v[1] === null ? 'null' : v[1].toFixed(2)}`;
                    } else {
                        str += `${v[1]}`;
                    }
                    lines.push({text: str});
                });
            }
            lines.push({text:'break'});
        })
        return lines;
    }

    function init(){
        const g = P.canvas.getContext('2d');
        P.canvas.width = resolution;
        P.canvas.height = resolution;
        g.fillStyle = '#000000';
        g.fillRect(0, 0, P.canvas.width, P.canvas.height);
        P.texture = new THREE.Texture(P.canvas);

        const s_geometry = new THREE.PlaneGeometry(vars.view.scene_width, vars.view.scene_width);
        const s_material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            map: P.texture,
            blending: THREE.AdditiveBlending,
            depthTest: true,
            depthWrite: false
        });

        P.plane_object = new THREE.Mesh(s_geometry, s_material);

    }

    function trace(){
        const lines = P.get_text();
        const ref = lines.map(l=>l.text).join('-');
        if(ref === P.memory) return;

        //make bitmap
        const g = P.canvas.getContext('2d');

        g.fillStyle = '#000000';
        g.fillRect(0, 0, P.canvas.width, P.canvas.height);
        g.fillStyle = 'white';
        let y_pos = 0;


        lines.map((L,n) => {
            const l_height = L.size ? L.size : P.line_height;
            g.font = `${l_height}px Helvetica`;
            g.textAlign = L.align ? L.align : 'left';
            const asc = g.measureText(L.text).fontBoundingBoxAscent;
            const hgt = g.measureText(L.text).fontBoundingBoxDescent;

            y_pos += asc+hgt;//l_height;
            const l_start = P.style === 'bottom-up' ? P.canvas.height-(lines.length*l_height) : 0.0;
            g.fillStyle = L.color ? L.color : 'white';
            if(L.text === 'break'){
                if(n !== lines.length-1){
                    g.fillRect(0, l_start+(y_pos), P.canvas.width, 2.0);
                }
            }else{
                g.fillText(L.text, g.textAlign === 'left' ? 0.0 : P.canvas.width , l_start+(y_pos-hgt));
            }
        });

        P.texture.needsUpdate = true;
        P.memory = ref;
    }

    const P = {
        plane_object: null,
        memory: null,
        watch: null,
        texture: null,
        canvas: document.createElement('canvas'),
        line_height: line_height,
        style: style,
        names:names,
        get_text,
        init,
        trace
    }

    return P;
}

const df = {
    async contours(index=0){
        // https://gist.github.com/sorcereral/4959573#file-thumbnail-png
        df.max = 100.0;//Math.max(...df.data[index].raw.data);
        df.avg = average(df.data[index].raw.data);
        console.log(df.data[index],"df.max",df.max,"df.avg",df.avg);

        const grid = new Array(df.shape[1]);
        for (let i=0;i<grid.length;i++){
            grid[i] = new Array(df.shape[0]);
            for (let j=0;j<grid[i].length;j++) {


                if(df.data_last.length){
                     grid[i][j] = (df.data[0].raw.data[j*df.shape[1]+i] + df.data_last[0].raw.data[j*df.shape[1]+i])/2.0;
                }else{
                    grid[i][j] = df.data[0].raw.data[j*df.shape[1]+i];
                }
            }
        }

        df.data_last = df.data;


        const grid_cliff = new Array(grid[0].length);
        grid_cliff.fill(df.cliff);
        grid.push(grid_cliff);
        grid.unshift(grid_cliff);
        grid.forEach(function(nd) {
          nd.push(df.cliff);
          nd.unshift(df.cliff);
        });

        const lonpx = [];//(grid[0].length-1);
        const latpy = [];//(grid.length-1);

        for (let i = 0; i < grid[0].length; i++)
            latpy[i] = (i-1);

        for (let i = grid.length-1; i>=0; i--)
            lonpx[i] = (i-1);


        const zs = new Array(df.contour_levels);
        for (let i=0;i<df.contour_levels;i++) zs[i] = (Math.round(df.max/df.contour_levels)*i);
        //for (let i=0;i<df.contour_levels;i++) zs[i] = (Math.round(df.max/df.contour_levels)*i);

        // const average_k = Math.round(df.avg/df.contour_levels);
        // console.log("average k",average_k);

        df.slice_width = Math.round(df.max/df.contour_levels)*df.y_scale;

        const c = new Conrec(null);
        c.contour(grid, 0, lonpx.length-1, 0, latpy.length-1, lonpx, latpy, zs.length, zs);

        const material = new THREE.LineBasicMaterial({
            color: 0x000000
        });

        const c_grp = c.contourList();
        df.trace.contours = c_grp.length;
        const contour_levels = new Array(df.contour_levels);
        for (let i=0;i<df.contour_levels;i++) contour_levels[i] = [];

        c_grp.map(g =>{
            contour_levels[parseInt(g.k)].push(g);
        });

        const data_group = new THREE.Group();
        data_group.userData.id = df.data[index].id;

        //#// sort by lengths
        contour_levels.map((lv,L)=>{
            // const patho = new THREE.ShapePath();
            // const paths = [];
            const stack = [];
            const path_data = [];

            lv.sort((a, b) => a.length < b.length ? 1 : -1);

            lv.map((g, L2) => {
                const vertices_vc = [];
                // const vertices = new Float32Array(g.length*3);
                g.map((g_e,i) =>{
                    if(typeof(g_e) === 'object'){
                        // vertices[i*3] = g_e.x+1.0;
                        // vertices[i*3+1] = g.level*df.y_scale;
                        // vertices[i*3+2] = df.shape[0]-g_e.y;
                        vertices_vc.push(new THREE.Vector2(g_e.x+1.0, df.shape[0]-g_e.y));
                    }
                })
                if(L!==null) {
                    const shape = new THREE.Shape(vertices_vc);
                    shape.autoClose = true;
                    const numpoints = Math.floor(shape.getLength()*2.0);
                    const new_points = shape.getSpacedPoints(numpoints);
                    const new_vertices_vc = [];

                    if(new_points.length > 4) {
                        const kvtx = new Float32Array(new_points.length * 3);
                        const new_x = [];
                        const new_y = [];
                        let k = 0;
                        new_points.map((p, i) => {
                            //if(p.x > 0 && p.y > 0) {
                                kvtx[k * 3] = p.x;// + 1.0;
                                kvtx[k * 3 + 1] = (L * df.slice_width)+0.01;//g.level * df.y_scale;(df.slice_width*L)
                                kvtx[k * 3 + 2] = df.shape[0] - p.y;
                                new_x.push(p.x);
                                new_y.push(p.y);
                                new_vertices_vc.push(new THREE.Vector2(p.x, df.shape[0] - p.y));
                                k++
                            //}
                        })

                        const m_path = new THREE.Path(new_vertices_vc);
                        m_path.autoClose = true;

                        const snumpoints = Math.floor(m_path.getLength()*2.0);
                        const snew_points = m_path.getSpacedPoints(snumpoints);
                        const shape = new THREE.Shape(snew_points);

                        const m_geometry = new THREE.ShapeGeometry(shape);
                        m_geometry.computeBoundingSphere();

                        const centroid = m_geometry.boundingSphere.center;
                        centroid.y = df.shape[0] - centroid.y;
                        console.log(centroid);
                        // let box = new THREE.Box3().setFromObject(m_geometry);
                        // let sphere = box.getBoundingSphere();
                        // let centerPoint = sphere.center;

                        stack.push({id:stack.length, ref:[centroid, new_x, new_y], holes:[], path:m_path});

                        const geometry = new THREE.BufferGeometry();
                        geometry.setAttribute('position', new THREE.BufferAttribute(kvtx, 3));
                        const line = new THREE.Line(geometry, material);
                        data_group.add(line);
                    }
                }



                //console.log(stack);
            });

            if(stack.length){
                for(let i=1;i<stack.length;i++){
                    for(let j = i-1; j >= 0; j--){


                        const test = point_in_poly(stack[i].ref[0], stack[j].ref[1], stack[j].ref[2]);
                        if(test){
                            stack[j].holes.push(stack[i].path);
                            stack.splice(i,1);
                            i--;
                            break;
                        }
                    }
                }


                for(let s=0;s<stack.length;s++){
                    const numpoints = Math.floor(stack[s].path.getLength()*2.0);
                    const new_points = stack[s].path.getSpacedPoints(numpoints);
                    const shape = new THREE.Shape(new_points);

                    if(stack[s].holes.length){
                        stack[s].holes.map(h => {
                            shape.holes.push(h);
                        });
                    }

                    //console.log(L, shape);

                    const extrudeSettings = {
                        steps: 1,
                        depth: df.slice_width, //Math.round(df.max/(df.contour_levels))*df.y_scale,
                        bevelEnabled: false,
                    };

                    let geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );

                    // const geometry = new THREE.ShapeGeometry(shape);
                    geometry.rotateX(Math.PI/2);
                    geometry.translate(0.0, (df.slice_width*L)+0.001, 0.0);
                    geometry = mergeVertices(geometry);

                    const color_step = 0.1/(df.contour_levels-1);
                    util_color.setHSL(0.1-(L*color_step),1.0,0.5-(L*color_step));

                    const material = new THREE.MeshStandardMaterial( {
                        color: util_color,
                    });
                    const mesh = new THREE.Mesh( geometry, material ) ;
                    data_group.add( mesh );

                }

                // console.log(L, stack);
                // console.log(L, path_data);

            }
            //
            // patho.subPaths = paths;
            // //patho.autoClose = true;
            //
            // const shapes = patho.toShapes();
            //
            // shapes.sort((a, b) => a.curves.length < b.curves.length ? 1 : -1);
            // console.log(l, shapes);
            //
            // if(l!==null){
            //     shapes.map(s => {
            //         s.autoClose = true;
            //         const geometry = new THREE.ShapeGeometry( s );
            //         geometry.rotateX(Math.PI/2);
            //         geometry.translate(0.0, (Math.round(df.max/(df.contour_levels))*l)*df.y_scale, 0.0);
            //
            //         const material = new THREE.MeshStandardMaterial( {
            //             color: 0x00ff00,
            //             side:THREE.DoubleSide,
            //             transparent: true,
            //             opacity:0.25
            //         });
            //         const mesh = new THREE.Mesh( geometry, material ) ;
            //         df.sectors.object.add( mesh );
            //     })
            //
            // }
            //console.log(l, patho, shapes);
        });

        df.model.data.children.map(c => c.visible = false);
        df.model.data.add( data_group );

        //df.trace.electrogrunge = df.model.data.children.map(c => c.userData.id);

        return true;
    },
    init_map(){
        df.box_helper = new THREE.Box3Helper(df.box, 0x666666);
        df.bounds_box_helper = new THREE.Box3Helper(df.bounds_box, 0x666600);
        df.model.object.add(df.box_helper);
        df.model.object.add(df.model.data);
        model.add(df.model.object);
        model.add(df.model.world_bounds);
        df.update_map(df.shape[1], df.shape[0]);
        color_bar.init();
        prog_bar.init();

    },
    update_map(w,h){
        vc.a.set(0,0,0);
        vc.b.set(w, df.model.height, h);
        df.box.set(vc.a, vc.b);
        //df.bounds_box.set(vc.a, vc.b);
        df.trace.width = w;
        df.trace.height = h;
        const x_scale = vars.view.scene_width/w;
        const z_scale = (vars.view.scene_width/h)/2.0;

        df.model.object.scale.set(x_scale,1.0,z_scale);
        df.model.object.position.set(vars.view.scene_width/-2, 0.0, vars.view.scene_width/-4);

        df.model.world_bounds.position.copy(df.model.object.position);

        vc.b.set(vars.view.scene_width, df.model.height, vars.view.scene_width/2.0);
        df.bounds_box.set(vc.a, vc.b);

        df.trace.xsca = x_scale;
        df.trace.zsca = z_scale;
        df.model.bounds = {
            x: vars.view.scene_width,
            y: df.model.height,
            z: vars.view.scene_width/4.0
        }
    },
    update_frame(){
        //if(df.model.data_set.length === 0) return;

        const n = df.model.running_maximums[df.model.data_index];

        color_bar.marker.position.set(0.0, n*(df.model.height/df.model.data_max), 0.0);

        if(prog_bar.running_max_values.length === 0) prog_bar.running_max_values.push(n);

        prog_bar.update();

        prog_bar.update_index();


        if(df.model.data_set_meta.length>0){
            const date_fmt = get_t_from_dateStamp(df.model.data_set_meta[df.model.data_index].id);
            df.date_trace.lines = [
                {text:date_fmt.d, color:'#666666', size:24, align:'right'},
                {text:date_fmt.t, color:'#666666', size:72, align:'right'},
                {text:date_fmt.z, color:'#666666', size:12, align:'right'},
            ]
        }

        if(load_queue.is_complete){
            load_queue.info.progress = `${df.model.data_index+1}/${load_queue.manifest_data.length}`;
        }

        load_queue.load_trace.lines = [
            {text: load_queue.info.status, color: '#666666', size: 24, align: 'left'},
            {text: load_queue.info.progress, color: '#666666', size: 48, align: 'left'},
            {text: load_queue.is_complete ? '' : load_queue.info.url, color: '#666666', size: 12, align: 'left'}
        ]


    },
    update_vertices(){
        if(!df.model.data_set.length) return;
        // df.pos = df.model.data_set[df.model.data_index];
        // if(!df.pos) return;

        for (let n = 0; n < df.cells; n++) {
            //
            // df.vertices.matrix.identity();
            // const pos = array_at_index(df.pos, n);
            // const x = pos[0] = df.plane_offset;
            // const dy = pos[2] / df.model.data_max;
            // const z = pos[1] - df.plane_offset;
            //
            // prog_bar.vertices.matrix.makeTranslation(x,0.0,z);
            // vc.c.set(1.0, prog_bar.element.base_ht+norm, 1.0);
            // prog_bar.vertices.matrix.scale(vc.c);
            // prog_bar.instance.setMatrixAt(i, prog_bar.vertices.matrix);

            df.vertices.instance.getMatrixAt(n, df.vertices.matrix);
            vc.a.setFromMatrixPosition(df.vertices.matrix);
            vc.c.setFromMatrixScale(df.vertices.matrix);

            const x = df.pos[n * 3] + df.plane_offset;
            const dy = df.pos[n * 3 + 2] / df.model.data_max;
            const z = df.pos[n * 3 + 1] - df.plane_offset;

            vc.b.set(x,0.0,z);
            vc.a.lerp(vc.b, df.animation_lerp_amt);

            vc.b.set(1.0,dy,1.0);
            vc.c.lerp(vc.b, df.animation_lerp_amt);

            instance_dummy.position.copy(vc.a);
            instance_dummy.scale.copy(vc.c);
            instance_dummy.updateMatrix();
            df.vertices.instance.setMatrixAt(n, instance_dummy.matrix);
            //
            // df.vertices.instance.getMatrixAt(n, df.vertices.matrix);
            // vc.a.setFromMatrixScale(df.vertices.matrix);
            // vc.c.setFromMatrixPosition(df.vertices.matrix);
            // //
            // // const x = df.pos[n * 3] + df.plane_offset;
            // // const y = df.pos[n * 3 + 2] * (df.model.height/df.model.data_max);
            // // const z = df.pos[n * 3 + 1] - df.plane_offset;
            // //
            // // vc.b.set(x,y,z);
            // // vc.a.lerp(vc.b, 0.01);
            // //
            //
            // //
            // const y = df.pos[n * 3 + 2] * (df.model.height/df.model.data_max);
            //
            // vc.b.set(1.0,0.5,1.0);
            // vc.a.lerp(vc.b, 0.1);
            //
            //
            // // vc.a.set(1.0,y,1.0);
            // // vc.c.set(1.0,1.0,1.0);
            // df.vertices.matrix.makeScale(vc.a.x, vc.a.y, vc.a.z);
            // df.vertices.instance.setMatrixAt(n, df.vertices.matrix);
            //
            // df.vertices.instance.getMatrixAt(n, df.vertices.matrix);
            // df.vertices.matrix.makeTranslation(vc.c.x, vc.c.y, vc.c.z);
            // df.vertices.instance.setMatrixAt(n, df.vertices.matrix);



            const z_col = vc.c.y < 1 ? vc.c.y : 1.0;
            const rmc = color_gradient.get(z_col);
            df.vertices.color[n * 3] = rmc[0];
            df.vertices.color[n * 3+1] = rmc[1];
            df.vertices.color[n * 3+2] = rmc[2];
        }

        df.vertices.instance.instanceMatrix.needsUpdate = true;
        df.vertices.instance.instanceColor.needsUpdate = true;

    },
    make_vertices(){
        const lon_size = Math.pow(2, df.up_res_iterations) * df.shape[1];
        df.cells = lon_size*df.shape[0];
        df.pos = new Float32Array(df.cells*3);
        df.pos.fill(0.0);

        for(let i = 0; i<lon_size; i++){
            for(let j = 0; j<df.shape[0]; j++){
                const q = i*df.shape[0]+j;
                df.pos[q*3] = i;
                df.pos[q*3+1] = df.shape[0]-j;
                df.pos[q*3+2] = 0.0;
            }
        }


        /*
        const material = new THREE.RawShaderMaterial({
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthTest: true,
            depthWrite: true,
            vertexShader: `
                //attribute vec4 instanceColor;
                varying vec4 vInstanceColor;
                void main(){
                  vInstanceColor = vec4(1.0, 1.0, 1.0, 1.0);
                }
            `,
            fragmentShader: `
                //precision highp float;
                varying vec4 vInstanceColor;
                void main(){
                  gl_FragColor = vInstanceColor;
                }
            `
        });
        */

        df.vertices.color = new Float32Array(df.cells*3);
        df.vertices.color.fill(1.0);

        const p_geometry = new THREE.BoxGeometry(1, df.model.height, 1);
        p_geometry.translate(0.0, df.model.height*0.5, 0.0);

        const instance = new THREE.InstancedMesh(p_geometry, static_material, df.cells);
        instance.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        instance.instanceColor = new THREE.InstancedBufferAttribute(df.vertices.color, 3, false, 1);
        instance.instanceColor.setUsage(THREE.DynamicDrawUsage);

        df.vertices.instance = instance;
        df.vertices.object.add(instance);
        df.model.object.add(df.vertices.object);

        for (let n = 0; n < df.cells; n++) {
            const x = df.pos[n * 3] + df.plane_offset;
            const y = df.pos[n * 3 + 2] * (df.model.height / df.model.data_max);
            const z = df.pos[n * 3 + 1] - df.plane_offset;
            vc.a.set(x, y, z);
            df.vertices.matrix.makeTranslation(vc.a.x, vc.a.y, vc.a.z);
            // df.vertices.matrix.makeScale(1.0,0.0,1.0);
            df.vertices.instance.setMatrixAt(n, df.vertices.matrix);
        }
        df.update_map(lon_size, df.shape[0]);
    },
    read_vertices(DATA =null){
        const grid = new Array(df.shape[1]);
        df.cells = grid.length*df.shape[0];
        df.d_pos = new Float32Array(df.cells*3);
        df.d_pos.fill(0.0);

        function set_pos(i,j,index,grid){
            df.d_pos[index*3] = i;
            df.d_pos[index*3+1] = grid[0].length-j;
            df.d_pos[index*3+2] = grid[i][j];
        }

        function init_grid(){
            let index = 0;
            for (let i=0;i<df.shape[1];i++){
                grid[i] = new Array(df.shape[0]);
                for (let j=0;j<df.shape[0];j++) {
                    grid[i][j] = DATA.raw.data[j*df.shape[1]+i];
                    set_pos(i,j,index,grid);
                    index++;
                }
            }
        }

        function double_res(grid){
            const grid_temp = [];
            for (let i=0;i<grid.length;i++){
                grid_temp.push(grid[i]);
                const nulls = new Array(grid[0].length);
                nulls.fill(null);
                grid_temp.push(nulls);
            }
            grid_temp.push(grid_temp[0]);

            df.cells = grid_temp.length*grid_temp[0].length;
            df.d_pos = new Float32Array(df.cells*3);

            let index = 0;
            for (let i=0;i<grid_temp.length;i++){
                for (let j=0;j < grid_temp[i].length; j++) {
                    const v = grid_temp[i][j];
                    if(v === null){
                        grid_temp[i][j] = Math.round(((grid_temp[i-1][j]+grid_temp[i+1][j])/2.0)*10000)/10000;
                    }
                    set_pos(i,j,index,grid_temp);
                    index++;
                }
            }

            grid_temp.pop();
            return grid_temp;
        }

        init_grid();
        let d_grid = grid;
        for(let n=0; n < (df.up_res_iterations); n++){
            d_grid = double_res(d_grid);
        }

        if(df.filter.active){
            const filter_obj = gauss.filter(d_grid, df.filter.sigma);
            for (let i=0;i<df.cells;i++) df.d_pos[i*3+2] = filter_obj.data[i];
        }

        df.update_map(d_grid.length, d_grid[0].length);

        df.model.data_set.push(df.d_pos);

        const data_max = Math.max(...DATA.raw.data);

        //console.log(DATA.id, data_max);

        DATA.max_value = data_max;

        df.model.data_set_meta.push(DATA);

        df.model.running_maximums.push(data_max);

    },
    model:{
        world_bounds: new THREE.Group(),
        object: new THREE.Group(),
        data: new THREE.Group(),
        height: 5,
        data_max: 125,
        data_set:[], /// all df.pos elements
        data_set_meta: [],
        running_maximums: [],
        data_index: 0
    },
    animation_lerp_amt: vars.animator.value_lerp,
    filter:{
        active: true,
        sigma: 1.5
    },
    up_res_iterations: 3,
    box: new THREE.Box3(),
    bounds_box: new THREE.Box3(),
    trace:{},
    date_trace:{
        formatted:true,
        lines: []
    },
    data: [],
    data_last: [],
    data_set: [],
    data_grid: [],
    shape: [91,20],
    cliff: -20.0,
    max: null,
    plane_offset: 0.5,
    y_scale: 0.05,
    slice_width: 1.0,
    contour_levels: 24,
    vertices: {
        object: new THREE.Group(),
        matrix: new THREE.Matrix4(),
        positions: null,
        colors: null
    },
}

const animator = {
    frame:0,
    frame_max:0,
    get_frame(pos, manual=false){


        if(manual === true){
            vars.animator.animating = false;
            if(pos > animator.frame_max-1){
                animator.frame = animator.frame_max-1;
            }else{
                animator.frame = pos;
            }
            //onsole.log(df.model.data_set_meta[df.model.data_index]);
        }else{
            animator.frame = animator.frame + pos;
        }

        if(animator.frame > animator.frame_max-1) animator.frame = 0;
        if(animator.frame < 0) animator.frame = animator.frame_max-1;

        df.model.data_index = animator.frame;
        df.pos = df.model.data_set[df.model.data_index];
    },
    animate(){
        animator.frame_max = df.model.data_set.length;
        if(vars.animator.animating) {
            if(load_queue.is_complete){
                animator.get_frame(1);
            }else{
                if(animator.frame < animator.frame_max-1){
                    animator.get_frame(1);
                }
            }
        }

        df.update_frame();
        setTimeout(animator.animate, vars.animator.rate);
    }
}


function g_dd(t){
    const dt = get_t_from_dateStamp(t);

    //console.log(t, dt.dd, ts);
    return dt;
}


const load_queue = {
    mode:'ANIMATE',///'ANIMATE', //'STATIC',
    is_complete: false,
    index: 0,
    manifest_data: null,
    queue_length: 0,
    prg: 0,
    trace:{
        status:null,
        item: null,
        frame:null
    },
    load_trace:{
        formatted:true,
        lines: []
    },
    info:{
        status:null,
        progress:'what?',
        url:null
    },

    async crawl(meta_data){
        //console.log(meta_data);
        df.read_vertices(meta_data);
        return true;
    },

    status(count, obj){
        load_queue.prg += count;
        load_queue.trace[obj.cat] = `${load_queue.queue_legnth-load_queue.prg}/${load_queue.queue_legnth}`;
        load_queue.trace.item = obj.url;
        if(load_queue.prg === 0){
            load_queue.trace[obj.cat] += (' loaded');
        }
    },

    complete(res, obj_item, index=null){
        if(obj_item === 'manifest'){
            load_queue.info.status = 'loaded manifest';
            const r = res[0].raw.data;
            load_queue.manifest_data = r.map(obj_str => {
                const id = obj_str.split('.')[0];
                return {url:vars.assets_path+obj_str, type:'json', cat:'assets', id:id}
            })


            //load_queue.manifest_data.sort((a, b) => (g_dd(a.id).dd.valueOf()) > (g_dd(b.id).dd.valueOf()) ? 1 : -1);

            // load_queue.manifest_data.splice(80, load_queue.manifest_data.length);
            //
            load_queue.manifest_data.reverse();

            prog_bar.subdivisions = load_queue.manifest_data.length;
            //load_queue.trace.result = load_queue.manifest_data.length+' items in queue';
            //load_queue.manifest_data.reverse();

            df.init_map();
            df.make_vertices();
            labels.make_label_object(null);
            load_queue.asset(0); //#// loads asset zero (0)
            //load_queue.index++;
        }

        if(obj_item === 'asset'){
            // console.log('asset', index);
            // //df.data_set.push(...res);
            // //df.data = [...res];
            // //console.log(res[0]);
            // load_queue.trace.index = load_queue.index;
            // console.log(res[0].id, g_dd(res[0].id).dd.toUTCString(), '->', g_dd(res[0].id).df.toString());

            if(load_queue.mode === 'ANIMATE') {

                load_queue.crawl(res[0]).then(c_res => {
                    load_queue.index = index;
                    load_queue.info.progress = `${load_queue.index+1}/${load_queue.manifest_data.length}`;

                    if(index === 0 && vars.animator.animating) animator.animate();

                    if (index < load_queue.manifest_data.length-1) {
                        load_queue.asset(index+1);
                    } else {
                        load_queue.info.status = `Completed ${load_queue.manifest_data.length} data assets.`;
                        load_queue.is_complete = true;
                        //df.update_frame();
                    }
                });
            }
        }

        if(obj_item === 'assets'){
            //unused
        }
    },

    manifest(){
        const queue = [{url:vars.manifest_path, type:'json', cat:'manifest'}];
        load_queue.queue_legnth = queue.length;
        load_queue.info.status = 'loading manifest';
        loader(queue, load_queue.status).then(r => load_queue.complete(r,'manifest'));
    },

    asset(index){
        const queue = [load_queue.manifest_data[index]];
        load_queue.queue_legnth = queue.length;
        load_queue.info.status = 'loading asset';
        load_queue.info.url = queue[0].url;
        loader(queue, load_queue.status).then(r => load_queue.complete(r,'asset',index));
    },

    assets(){
        const queue = load_queue.manifest_data;
        load_queue.queue_legnth = queue.length;
        load_queue.info.status = 'loading assets';
        loader(queue, load_queue.status).then(r => load_queue.complete(r,'assets'));
    }


}



function post_init(){
    model = new THREE.Group();

    if(vars.view_axes){
        view_axes = new THREE.AxesHelper(vars.view.scene_width / 2);
        view_axes.material.blending = THREE.AdditiveBlending;
        view_axes.material.transparent = true;
        scene.add(view_axes);
    }

    if(vars.view_grid) {
        utilityColor.set(vars.view.colors.helpers);
        const r = vars.view.scene_width;
        const col_xy = utilityColor;
        const col_gd = utilityColor.clone().offsetHSL(0.0, 0.5, 0.5);

        const view_grid = new THREE.GridHelper(r, r, col_xy, col_gd);
        view_grid.material.blending = THREE.AdditiveBlending;
        view_grid.material.transparent = true;
        view_grid.renderOrder = 1;
        model.add(view_grid);
    }

    if(vars.view_plane) {
        const text = __filename + ' ' + package_detail.name;
        const bitmap = document.createElement('canvas');
        const g = bitmap.getContext('2d');
        bitmap.width = 2056;
        bitmap.height = 2056;
        g.font = '64px Arial';
        g.fillStyle = '#000000';
        g.fillRect(0, 0, bitmap.width, bitmap.height);
        g.fillStyle = 'white';
        g.fillText(text, 8, 64);

        // canvas contents will be used for a texture
        const texture = new THREE.Texture(bitmap)
        texture.needsUpdate = true;

        const geometry = new THREE.PlaneGeometry(vars.view.scene_width, vars.view.scene_width);
        const material = new THREE.MeshLambertMaterial({
            color: 0xffffff,
            transparent: true,
            blending: THREE.AdditiveBlending,
            opacity: 0.25,
            side: THREE.DoubleSide,
            map: texture,
            depthTest: true,
            depthWrite: true
        });

        r_root_plane = new THREE.Mesh(geometry, material);
        r_root_plane.rotateX(Math.PI / -2);
        r_root_plane.receiveShadow = true;

        model.add(r_root_plane);
    }

    debug_trace = plane_text(16, 'bottom-up', 2048, 'show-names');
    debug_trace.init();
    debug_trace.watch = [vars.debug, vars.fps, vars.evt, vars.user.mouse.plane_pos, model.position, load_queue.trace, df.trace];
    debug_trace.plane_object.position.set(0,vars.view.scene_width/2,5.001);


    date_trace = plane_text(24, 'top-down', 1024, 'no-names');
    date_trace.init();
    date_trace.watch = [df.date_trace];
    date_trace.plane_object.position.set(0,0,20);
    date_trace.plane_object.rotateX(Math.PI/-2);


    load_trace = plane_text(12, 'top-down', 1024, 'show-names');
    load_trace.init();
    load_trace.watch = [load_queue.load_trace];
    load_trace.plane_object.position.set(0,0,20);
    load_trace.plane_object.rotateX(Math.PI/-2);

    model.add(debug_trace.plane_object);
    model.add(date_trace.plane_object);
    model.add(load_trace.plane_object);

    const default_z = 20.0;
    const visible_dimensions = visibleAtZDepth(-default_z, cam.camera);
    cam.base_pos.z = ((default_z / visible_dimensions.w) * vars.view.scene_width) + 12.0;
    console.log(visible_dimensions);
    scene.add(model);
}

function init(){
    vars.view.width = window.innerWidth;
    vars.view.height = window.innerHeight;

    cam.camera = new THREE.PerspectiveCamera(60, vars.view.width / vars.view.height, 0.1, 300);
    scene = new THREE.Scene();
    scene.background = new THREE.Color(vars.view.colors.window_background);

    renderer = new THREE.WebGLRenderer({
        powerPreference: "high-performance",
        antialias: true
    });

    renderer.setPixelRatio(1);
    renderer.setSize(vars.view.width, vars.view.height);
    renderer.setClearColor(0x000000);

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    vars.evt = {};
    vars.evt.action = null;

    // dragControls(renderer.domElement, vars.evt_input.screen, vars.evt_cb);
    // keyControls(window, vars.evt_input.key, vars.evt_cb);

    // dragControls(renderer.domElement, vars.evt_cb, vars.evt_input);
    // keyControls(window, vars.evt_cb, vars.evt_input);

    const light = new THREE.PointLight(0xffffff, 1);
    light.position.set(0, vars.view.scene_width * 2, 0);
    scene.add(light);

    const ambient_light = new THREE.AmbientLight( 0x999999 ); // soft white light
    scene.add( ambient_light );


    const target = document.getElementById('module-window');
    target.appendChild(renderer.domElement);

    root_plane = new THREE.Plane(y_up);

    post_init();

    cam.run();


}

function render(a) {
    const k_delta = () => {
        const d = new Date();
        const l_delta = d - render_l_date;
        render_l_date = d;
        return Math.floor(1000 / l_delta);
    }
    const get_k = k_delta();
    if (vars.render_frame % 10 === 0) vars.fps.fps = get_k;
    vars.event_not_idle();

    if(df.vertices.instance) df.update_vertices();

    date_trace.trace(a+' ok');
    load_trace.trace(a+' ok');
    if(vars.debug_trace){
        debug_trace.trace(a+' ok');
    }
    renderer.render(scene, cam.camera);
}

function animate(f) {
    vars.render_frame = window.requestAnimationFrame(animate);
    render(f);
}

// init();
// animate(null);




load_queue.manifest();