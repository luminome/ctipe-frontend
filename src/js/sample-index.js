import * as THREE from './three-sac/node_modules/three';
import * as scene from './three-sac/ui-three-base';
import elements from './three-sac/ui-three-elements';
import * as util from './three-sac/ui-util';
import config from './config';



const dom_target = document.getElementById('module-window');

config.model = new THREE.Object3D();
config.model.objects = {};

const zoom_detail_label = elements.dom_label().init(dom_target, config.view.dom_labels);
zoom_detail_label.set_position(window.innerWidth/2, 20);

const user_pos = elements.dashed_halo(1.0);
config.model.add(user_pos);


// config.view.width =  window.innerWidth;
// config.view.height =  window.innerHeight;



/**
* @param {String} type The type of event issuer
* @param {Object} packet The event information
*/
const base_callback = (type, packet) => {
    //console.log(type, packet);
    let text = `ELEV ${(135.0-util.rad_to_deg(scene.environment.controls.cam.constrain_angle)).toFixed(2)}º`;
    text += ` Z ${scene.environment.controls.cam.camera_scale.toFixed(2)}`;
    text += ` D ${scene.environment.controls.cam.distance.toFixed(2)}`;
    zoom_detail_label.set_text(text);

    if (config.view.features.grid_marks.on) {
        const pc = scene.environment.controls.v.user.mouse.actual;
        const p = config.view.features.grid_marks.pitch;
        const x = Math.round(pc.x / p) * p;
        const y = Math.round(pc.z / p) * p;
        config.model.objects.grid_marks.position.set(-x, 0.0, -y);
    }

    const pc = scene.environment.controls.v.user.mouse.plane_pos;
    user_pos.position.set(pc.x-config.model.position.x, 0.0, pc.z-config.model.position.z);

    return true;
}

config.event_callback = base_callback;

scene.environment.init(dom_target, config);

Object.entries(config.view.features).map(feat =>{
    const k = feat[0];
    if(config.view.features[k].on){
        config.model.objects[k] = elements[k](config.view.features[k]);
        config.model.objects[k].name = k;
        const target = config.view.features[k].target === 'model' ? config.model : scene.environment.layers[0].scene;
        // console.log(target);

        target.add(config.model.objects[k]);
    }
});

