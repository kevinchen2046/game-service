var path=require('path');
var fs=require('fs');

var filePath=path.resolve(path.resolve(__dirname,"proto/"),"bag.ts");
var decls=fs.readFileSync(filePath).toString();

function parse(content){
    var clazznames=content.match(/(?<=class)([\S\s]*?)(?={)/g);
    var clazzcontents=content.match(/(?<={)([\S\s]*?)(?=})/g);
    if(clazznames.length!=clazzcontents.length){
        console.error('解析错误...');
        return;
    }
    var results={};
    for(var i=0;i<clazznames.length;i++){
        var properties=results[clazznames[i].replace(/ /g,'')]=[];
        var lines=clazzcontents[i].split('\r\n');
        var notes;
        for(var line of lines){
            var linecontent=line.replace(/ /g,'');
            if(!linecontent) continue;
            var isnote=!!linecontent.match(/^[\/{1}*{2},\/{1}\/{2},*{1}]/);
            if(isnote){
                if(!notes) notes=[];
                notes.push(linecontent);
            }else{
                var p=linecontent.split(':');
                if(p.length!=2){
                    console.error('解析错误:',clazznames[i]);
                    continue;
                }
                properties.push({
                    filed:p[0].replace(/ /g,''),
                    type:p[1].replace(/ /g,''),
                    note:notes?notes.join('').replace(/\//g,'').replace(/\*/g,''):''
                })
                notes=null;
            }
        }
    }
    return results;
}


console.log(parse(decls));
