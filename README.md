## Description of tika-work tool

tika-work is designed as a lightweight, modular open-source software that can support data annotations in computer vision and NLP domains. It is released as a web-app as well as for multiple plaforms like Mac OS and Microsoft Windows. tika-work is built as a pure javascript application, more specifically reactjs. This allows it to be truly portable by being entirely based in the web browser. 

Demo link https://demo.tika-work.com

This open-source version supports the following annotation tasks:

1) Image Classification
2) Image Bounding Box
3) Image Landmark
4) Text Classification
5) Text Sentiment Analysis
6) Audio Classification
7) Audio Segmentation
8) Video Classification

This is the app architecture for tika-work

![twf](https://github.com/annosmart/tika-work/assets/111358517/a99b1840-a0c6-4893-91d3-c77b007ac413)

## Source code structure

The directory structure of the repository is:

* deployment - docker source file
* doc - tool description, tutorials for creating new modules for tika-work tool
* tool - source code

## Building instructions for Docker, Windows, Mac platforms

### Docker

#### Install docker
The steps below are for Ubuntu
```
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo apt-key fingerprint 0EBFCD88
sudo add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io
```

#### Build docker image
```
run from root folder
```
```
sudo docker build -f ./deployment/docker/Dockerfile -t tika-work .
```

#### Run docker image
```
sudo docker run -d -p 3001:3000 tika-work
```

### Windows 
```
npm i electron-is-dev
npm i --force -D concurrently electron electron-builder wait-on cross-env
```
**if you get any error for above command, then delete .bin folder in node_modules folder and rerun the above command
```
npm run electron-pack --force
```

### Mac
```
npm i electron-is-dev
npm i -D concurrently electron electron-builder wait-on cross-env
npm run electron-pack
```
