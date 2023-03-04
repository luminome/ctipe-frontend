const config = {
    stats: true,
    test: true,
    view: {
        colors:{
            window_background: 0x222222,
        },
        dom_labels:{
            color: '#444444',
            background_color: '#222222',
            font_size: 8,
        },
        features: {
            grid_marks:{
                on: true,
                target: 'model',
                distance: 40.0,
                width: 20,
                pitch: 2.0,
                shape_length: 5.0,
                shape_scale: 0.01,
                color: 0x444444,
                base_color: 0x222222
            },
            world_position_lines:{
                on: true,
                target: 'scene',
                color: 0x333333,
                opacity: 0.9,
                distance: 40.0,
            },
            helper_grid:{
                on: true,
                target: 'model',
                color: 0x333333,
                width: 20
            },
            helper_axes:{
                on: false,
                width: 20
            },
            position_marker:{
                on: true,
            }
        }
    },
    model_w: 20.0,
    model_h: 20.0,
    default_camera_z: 20.0,
    default_camera_pos: [0,10,0],
    event_callback: null,
    animation_callback: null,
    animator:{
        value_lerp: 0.25,
        rate: 100.0, //ms
        animating: true
    },
    manifest_path: 'https://ctipe-production.up.railway.app/m?manifest',
    assets_path: 'https://ctipe-production.up.railway.app/',
    debug_trace_state: false,
    debug: {},
}

export default config