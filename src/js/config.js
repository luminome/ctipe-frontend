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
            font_size: 9,
        },
        features: {
            grid_marks:{
                on: true,
                target: 'model',
                distance: 40.0,
                width: 25,
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
                width: 25
            },
            helper_axes:{
                on: true,
                width: 25
            },
            position_marker:{
                on: true,
            }
        }
    },
    model_w: 40.0,
    model_h: 40.0,
    default_camera_z: 20.0,
    event_callback: null
}

export default config