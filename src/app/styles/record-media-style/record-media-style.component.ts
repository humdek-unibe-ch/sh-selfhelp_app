import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Style } from 'src/app/selfhelpInterfaces';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { MediaCapture, MediaFile, CaptureError } from '@ionic-native/media-capture/ngx';
import { Storage } from '@ionic/storage';
import { File, FileEntry } from '@ionic-native/File/ngx';
import { Media, MediaObject } from '@ionic-native/media/ngx';
import { StreamingMedia } from '@ionic-native/streaming-media/ngx';
import { Platform } from '@ionic/angular';

const MEDIA_FOLDER_NAME = 'my_media';

@Component({
    selector: 'app-record-media-style',
    templateUrl: './record-media-style.component.html',
    styleUrls: ['./record-media-style.component.scss'],
})
export class RecordMediaStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() override style!: Style;
    @ViewChild('myvideo') myVideo: any;
    files = [];

    constructor(public plt: Platform, private storage: Storage, private mediaCapture: MediaCapture, private file: File, private media: Media, private streamingMedia: StreamingMedia) {
        super();
    }

    override ngOnInit() {
        this.plt.ready().then(() => {
            let path = this.file.dataDirectory;
            this.file.checkDir(path, MEDIA_FOLDER_NAME).then(
                (res) => {
                    this.loadFiles();
                },
                err => {
                    this.file.createDir(path, MEDIA_FOLDER_NAME, false);
                }
            );
        });
    }

    captureAudio() {
        // this.mediaCapture.captureAudio().then(res => {
        //     this.storeMediaFiles(res);
        // }, (err: CaptureError) => console.error(err));
        // this.mediaCapture.captureAudio().then(
        //     (data: MediaFile[]) => {
        //         if (data.length > 0) {
        //             this.copyFileToLocalDir(data[0].fullPath);
        //         }
        //     },
        //     (err: CaptureError) => console.error(err)
        // );
        // this.file.createFile(this.file.tempDirectory, 'my_file.m4a', true).then(() => {
        //     let file = this.media.create(this.file.tempDirectory.replace(/^file:\/\//, '') + 'my_file.m4a');
        //     file.startRecord();
        //     window.setTimeout(() => file.stopRecord(), 3000);
        // });
        this.file.createFile(this.file.externalRootDirectory, 'my_file.m4a', true).then(() => {
            console.log(this.file.externalRootDirectory);
            let file = this.media.create(this.file.externalRootDirectory.replace(/^file:\/\//, '') + 'my_file.m4a');
            console.log('file');
            file.startRecord();
            window.setTimeout(() => {
                console.log('stop');
                file.stopRecord();
            }, 10000);
        });
    }

    captureVideo() {
        this.mediaCapture.captureVideo().then(
            (data: MediaFile[]) => {
                if (data.length > 0) {
                    this.copyFileToLocalDir(data[0].fullPath);
                }
            },
            (err: CaptureError) => console.error(err)
        );
    }

    play(myFile) {
        // if (myFile.name.indexOf('.wav') > -1) {
        //     const audioFile: MediaObject = this.media.create(myFile.localURL);
        //     audioFile.play();
        // } else {
        //     let path = this.file.dataDirectory + myFile.name;
        //     let url = path.replace(/^file:\/\//, '');
        //     let video = this.myVideo.nativeElement;
        //     video.src = url;
        //     video.play();
        // }
    }

    copyFileToLocalDir(fullPath) {
        let myPath = fullPath;
        // Make sure we copy from the right location
        if (fullPath.indexOf('file://') < 0) {
            myPath = 'file://' + fullPath;
        }

        const ext = myPath.split('.').pop();
        const d = Date.now();
        const newName = `${d}.${ext}`;

        const name = myPath.substr(myPath.lastIndexOf('/') + 1);
        const copyFrom = myPath.substr(0, myPath.lastIndexOf('/') + 1);
        const copyTo = this.file.dataDirectory + MEDIA_FOLDER_NAME;
        console.log(fullPath);
        console.log(copyFrom);
        console.log(copyTo);

        this.file.checkFile(copyFrom, name).then(
            (res) => {
                console.log('copy', name);
            },
            err => {
                console.log('err');
            }
        );

        this.file.copyFile(copyFrom, name, copyTo, name).then(
            success => {
                this.loadFiles();
            },
            error => {
                console.log('error: ', error);
            }
        );
    }

    loadFiles() {
        this.file.listDir(this.file.dataDirectory, MEDIA_FOLDER_NAME).then(
            res => {
                this.files = res;
                console.log(this.files);
            },
            err => console.log('error loading files: ', err)
        );
    }

    openFile(f: FileEntry) {
        if (f.name.indexOf('.m4a') > -1) {
            // We need to remove file:/// from the path for the audio plugin to work
            // const path = f.nativeURL.replace(/^file:\/\//, '');
            const audioFile: MediaObject = this.media.create(f.nativeURL);
            console.log(f.fullPath, audioFile);
            audioFile.play();
            console.log(this.file.dataDirectory + MEDIA_FOLDER_NAME, this.file.externalRootDirectory + 'Download');
            this.file.copyFile(this.file.dataDirectory + MEDIA_FOLDER_NAME, 'Recording_1.m4a', this.file.externalRootDirectory + 'Download', 'Recording_1.m4a');
        } else if (f.name.indexOf('.MOV') > -1 || f.name.indexOf('.mp4') > -1) {
            // E.g: Use the Streaming Media plugin to play a video
            this.streamingMedia.playVideo(f.nativeURL);
        }
    }

    deleteFile(f: FileEntry) {
        const path = f.nativeURL.substr(0, f.nativeURL.lastIndexOf('/') + 1);
        this.file.removeFile(path, f.name).then(() => {
            this.loadFiles();
        }, err => console.log('error remove: ', err));
    }

}
