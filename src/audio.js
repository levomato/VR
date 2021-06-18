import * as  THREE from 'three'

/*

from 
https://threejs.org/docs/#api/en/audio/PositionalAudio

*/

export function add_audio(camera, parent, url) {
    const listener = new THREE.AudioListener();
    camera.add(listener);


    // create the PositionalAudio object (passing in the listener)
    const sound = new THREE.PositionalAudio(listener);

    // load a sound and set it as the PositionalAudio object's buffer
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load(url, function (buffer) {
        sound.setBuffer(buffer);
        sound.setRefDistance(20);
        sound.play();
    });

    sound.matrixAutoUpdate = false;

    // finally add the sound to the mesh
    parent.add(sound);
    return sound;
}

export function add_background(camera, url) {
    // create an AudioListener and add it to the camera
    const listener = new THREE.AudioListener();
    camera.add(listener);

    // create a global audio source
    const sound = new THREE.Audio(listener);

    // load a sound and set it as the Audio object's buffer
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('sounds/levomato.mp3', function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(true);
        sound.setVolume(0.5);
        sound.play();
    });
}

