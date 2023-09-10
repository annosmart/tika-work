## Description of tika-work tool

tika-work is designed as a lightweight, modular open-source software that can support data annotations in computer vision and NLP domains. It is released as a web-app as well as for multiple plaforms like Mac OS and Microsoft Windows. tika-work is built as a pure javascript application, more specifically reactjs. This allows it to be truly portable by being entirely based in the web browser. 

This open-source version supports the following annotation tasks:

1) Image Classification
2) Image Bounding Box
3) Image Landmark
4) Text Classification
5) Text Sentiment Analysis
6) Audio Classification
7) Audio Segmentation
8) Video Classification


## Building instructions for Docker, Windows, Mac platforms

### Docker

## Install docker
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

## Build docker image
```
run from root folder
```
```
sudo docker build -f ./deployment/docker/Dockerfile -t tika-work .
```

## Run docker image
```
sudo docker run -d -p 3001:3000 tika-work
```

### Windows 
a) npm i electron-is-dev
b) npm i --force -D concurrently electron electron-builder wait-on cross-env
**if you get any error for above command, then delete .bin folder in node_modules folder and rerun the above command
c) npm run electron-pack --force

### Mac
a) npm i electron-is-dev
b) npm i -D concurrently electron electron-builder wait-on cross-env
c) npm run electron-pack
