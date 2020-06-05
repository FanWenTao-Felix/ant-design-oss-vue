import { getFileAccessHttpUrl } from '@/api/manage';
const getFileName=(path)=>{
  if(path.lastIndexOf("\\")>=0){
    let reg=new RegExp("\\\\","g");
    path = path.replace(reg,"/");
  }
  return path.substring(path.lastIndexOf("/")+1);
}

const isImage=(p)=>{
  if(!p){
    return false
  }
  let path = p.toLowerCase();
  return path.endsWith("jpg")||path.endsWith("jpeg")||path.endsWith("gif")||path.endsWith("png")||path.endsWith("bmp")
}


const uidGenerator=()=>{
  return '-'+parseInt(Math.random()*10000+1,10);
}

const getFilePaths=(uploadFiles)=>{
  let arr = [];
  if(!uploadFiles){
    return ""
  }
  for(var a=0;a<uploadFiles.length;a++){
    arr.push(uploadFiles[a].response.message)
  }
  if(arr && arr.length>0){
    return arr.join(",")
  }
  return ""
}

const getUploadFileList=(paths)=>{
  if(!paths){
    return [];
  }
  let fileList = [];
  let arr = paths.split(",")
  for(var a=0;a<arr.length;a++){
    if(!arr[a]){
      continue
    }else{
      let url = getFileAccessHttpUrl(arr[a])
      fileList.push({
        uid:uidGenerator(),
        name:getFileName(arr[a]),
        status: 'done',
        url: url,
        response:{
          status:"history",
          message:arr[a]
        }
      })
    }
  }
  return fileList;
}
export {getFilePaths,getUploadFileList}