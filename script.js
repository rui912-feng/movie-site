(function(){
  "use strict";
  var U_KEY="movie_site_user_v1";
  var R_KEY="movie_site_ratings_v1";
  var C_KEY="movie_site_comments_v1";

  function $(id){return document.getElementById(id);}
  function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
  function read(k){try{return JSON.parse(localStorage.getItem(k));}catch(e){return null;}}
  function write(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true;}catch(e){return false;}}
  var toastTimer;
  function toast(msg){var t=$("toast");t.textContent=msg;t.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(function(){t.classList.remove("show");},2200);}
  function avatarColor(name,provider){
    var palette=provider==="wx"?["#09bb07","#1fa04a","#12a594"]:["#2891ff","#5b6cff","#1296db"];
    var sum=0;for(var i=0;i<name.length;i++)sum+=name.charCodeAt(i);
    return palette[sum%palette.length];
  }
  function fmtTime(ts){
    var d=new Date(ts),p=function(n){return String(n).padStart(2,"0");};
    return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate())+" "+p(d.getHours())+":"+p(d.getMinutes());
  }

  /* ---------- data ---------- */
  var MOVIES=[
    {id:"m1",title:"肖申克的救赎",en:"The Shawshank Redemption",year:1994,duration:"142分钟",
      director:"弗兰克·德拉邦特",cast:"蒂姆·罗宾斯 / 摩根·弗里曼",region:"美国",
      genre:["剧情","犯罪"],c1:"#3a2a1c",c2:"#7a5230",
      synopsis:"银行家安迪因被冤枉杀害妻子而被判终身监禁，进入肖申克监狱。在高墙与体制化的绝望之中，他以智慧、耐心和对自由不灭的信念，完成了一场关于希望与救赎的漫长突围。"},
    {id:"m2",title:"霸王别姬",en:"Farewell My Concubine",year:1993,duration:"171分钟",
      director:"陈凯歌",cast:"张国荣 / 张丰毅 / 巩俐",region:"中国",
      genre:["剧情","爱情"],c1:"#4a1220",c2:"#9c2b46",
      synopsis:"程蝶衣与段小楼自幼在戏班学戏，一出《霸王别姬》唱尽半世纪风云。时代洪流中，戏与人生、痴恋与背叛彼此缠绕，成就了华语影史难以逾越的经典。"},
    {id:"m3",title:"星际穿越",en:"Interstellar",year:2014,duration:"169分钟",
      director:"克里斯托弗·诺兰",cast:"马修·麦康纳 / 安妮·海瑟薇",region:"美国 / 英国",
      genre:["科幻","冒险"],c1:"#0e1c30",c2:"#27506e",
      synopsis:"地球环境恶化、粮食枯竭，前宇航员库珀受命穿越虫洞，为人类寻找新的家园。在相对论效应造成的时间错位中，他与女儿之间的爱成为跨越星际尺度的引力。"},
    {id:"m4",title:"千与千寻",en:"Spirited Away",year:2001,duration:"125分钟",
      director:"宫崎骏",cast:"柊瑠美 / 入野自由（配音）",region:"日本",
      genre:["动画","奇幻"],c1:"#12333f",c2:"#2f7d8a",
      synopsis:"少女千寻随父母误入神灵世界，父母因贪吃变成猪。为了救回家人，她在汤婆婆的油屋中工作，在白龙与无脸男的陪伴下，于奇幻旅程中学会勇敢、善良与成长。"},
    {id:"m5",title:"盗梦空间",en:"Inception",year:2010,duration:"148分钟",
      director:"克里斯托弗·诺兰",cast:"莱昂纳多·迪卡普里奥 / 约瑟夫·高登-莱维特",region:"美国",
      genre:["科幻","悬疑"],c1:"#1a1730",c2:"#4a3f78",
      synopsis:"造梦师柯布带领团队进入层层嵌套的梦境，执行一次反向的“植入意念”任务。现实与梦境的边界在旋转的陀螺前变得模糊，他能否完成任务并回到孩子身边？"},
    {id:"m6",title:"海上钢琴师",en:"The Legend of 1900",year:1998,duration:"165分钟",
      director:"朱塞佩·托纳多雷",cast:"蒂姆·罗斯 / 普路特·泰勒·文斯",region:"意大利",
      genre:["剧情","音乐"],c1:"#102336",c2:"#2f5d80",
      synopsis:"1900 年，一个弃婴被遗弃在往返欧美的豪华邮轮上，得名“1900”。他终生未曾下船，却以钢琴天赋征服所有旅客。当爱情与陆地向他招手，他做出了自己的选择。"},
    {id:"m7",title:"疯狂动物城",en:"Zootopia",year:2016,duration:"108分钟",
      director:"拜伦·霍华德 / 瑞奇·摩尔",cast:"金妮弗·古德温 / 杰森·贝特曼（配音）",region:"美国",
      genre:["动画","喜剧"],c1:"#3a2e12",c2:"#b07f24",
      synopsis:"小兔子朱迪立志成为动物城第一位兔子警官，却被安排贴罚单。她与精明的狐狸尼克意外联手追查一桩哺乳动物失踪案，在欢笑中揭开偏见与梦想的故事。"},
    {id:"m8",title:"流浪地球",en:"The Wandering Earth",year:2019,duration:"125分钟",
      director:"郭帆",cast:"屈楚萧 / 吴京 / 李光洁",region:"中国",
      genre:["科幻","灾难"],c1:"#241009",c2:"#b5531f",
      synopsis:"太阳急速膨胀，人类在地球表面建造万座行星发动机，带着家园逃离太阳系。当地球逼近木星、发动机停摆，一群普通人挺身而出，在冰封与烈焰中为文明争取生机。"}
  ];
  var GENRE_ORDER=["全部","剧情","科幻","动画","犯罪","爱情","奇幻","悬疑","冒险","音乐","喜剧","灾难"];

  /* ---------- state ---------- */
  var state={user:read(U_KEY),ratings:read(R_KEY)||{},comments:read(C_KEY)||[],genre:"全部",openMovie:null,pending:0};

  function persistAll(){write(R_KEY,state.ratings);write(C_KEY,state.comments);}
  function movieStats(id){
    var rs=Object.keys(state.ratings).map(function(k){return state.ratings[k];})
      .filter(function(r){return r.movieId===id;});
    var cs=state.comments.filter(function(c){return c.movieId===id;});
    var n=rs.length,sum=rs.reduce(function(a,r){return a+r.value;},0);
    return {count:n,avg:n?sum/n:0,comments:cs.length};
  }
  function myRating(id){
    if(!state.user)return 0;
    var r=state.ratings[state.user.uid+"@"+id];
    return r?r.value:0;
  }
  function stars(v){
    var full=Math.round(v),s="";
    for(var i=1;i<=5;i++)s+=i<=full?"★":"☆";
    return s;
  }
  function starSvg(filled){
    return '<svg viewBox="0 0 24 24" fill="'+(filled?"currentColor":"none")+'" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z"/></svg>';
  }

  /* ---------- header user ---------- */
  function renderUser(){
    var openBtn=$("open-login");
    if(state.user){
      var u=state.user;
      openBtn.outerHTML='<button class="user-chip" id="open-login" title="账号信息 / 退出登录">'
        +'<span class="av" style="background:'+avatarColor(u.name,u.provider)+'">'+esc(u.name.slice(0,1))+"</span>"
        +'<span class="un">'+esc(u.name)+"</span></button>";
    }else{
      openBtn.outerHTML='<button class="btn-login" id="open-login"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="M10 17l5-5-5-5M15 12H3"/></svg>登录 / 注册</button>';
    }
    bindLoginButton();
  }
  function bindLoginButton(){
    $("open-login").addEventListener("click",function(){
      if(state.user){
        if(window.confirm("当前账号："+state.user.name+"\n\n是否退出登录？（你的评分与留言会保留）")){
          state.user=null;try{localStorage.removeItem(U_KEY);}catch(e){}
          renderUser();
          if(state.openMovie)renderDetail(state.openMovie);
          toast("已退出登录");
        }
      }else{
        $("nick-input").value="";
        $("login-dialog").showModal();
      }
    });
  }

  /* ---------- categories ---------- */
  function renderCats(){
    var used={};MOVIES.forEach(function(m){m.genre.forEach(function(g){used[g]=true;});});
    var list=GENRE_ORDER.filter(function(g){return g==="全部"||used[g];});
    $("cats").innerHTML=list.map(function(g){
      return '<button type="button" data-g="'+esc(g)+'" aria-pressed="'+(g===state.genre)+'">'+esc(g)+"</button>";
    }).join("");
  }

  /* ---------- grid ---------- */
  function renderGrid(){
    var list=state.genre==="全部"?MOVIES:MOVIES.filter(function(m){return m.genre.indexOf(state.genre)>-1;});
    var grid=$("grid");
    if(!list.length){grid.innerHTML='<div class="empty">该分类下暂无影片</div>';return;}
    grid.innerHTML=list.map(function(m){
      var st=movieStats(m.id);
      var ratingHtml=st.count
        ? '<span class="p-rating"><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z"/></svg>'+st.avg.toFixed(1)+"</span>"
        : '<span class="p-rating">暂无评分</span>';
      return '<article class="card" data-id="'+m.id+'" tabindex="0" role="button" aria-label="查看'+esc(m.title)+'详情">'
        +'<div class="poster" style="background:linear-gradient(160deg,'+m.c1+','+m.c2+')">'
          +ratingHtml
          +'<div class="p-title">'+esc(m.title)+"</div>"
          +'<div class="p-en">'+esc(m.en)+"</div>"
        +"</div>"
        +'<div class="c-body">'
          +'<div class="c-meta"><span>'+m.year+"</span><span>·</span><span>"+esc(m.duration)+"</span></div>"
          +'<div class="c-genre">'+m.genre.map(function(g){return '<span class="g-tag">'+esc(g)+"</span>";}).join("")+"</div>"
          +'<div class="c-stars"><span class="stars-mini">'+stars(st.avg)+"</span><span>"+(st.count?st.avg.toFixed(1)+" · "+st.count+"人":"等待你的评分")+"</span></div>"
        +"</div>"
      +"</article>";
    }).join("");
  }

  /* ---------- detail dialog ---------- */
  function starButtons(name,current,interactive){
    var h="";
    for(var i=1;i<=5;i++){
      h+='<button type="button" class="star '+(i<=current?"on":"")+'" data-'+name+'="'+i+'" '+(interactive?"":"disabled")+' aria-label="'+i+'星">'+starSvg(i<=current)+"</button>";
    }
    return h;
  }

  function renderDetail(id){
    var m=MOVIES.find(function(x){return x.id===id;});
    if(!m)return;
    state.openMovie=id;
    var st=movieStats(id);
    var mine=myRating(id);
    var root=$("detail-root");

    var ratingBlock;
    if(state.user){
      ratingBlock=
        '<div class="bigstars" id="rate-row">'+starButtons("rate",mine,true)+"</div>"
        +'<div class="hint">'+(mine?"你给了 "+mine+" 星，点击可修改":"点击星星为这部电影打分")+"</div>";
    }else{
      ratingBlock='<div class="bigstars">'+starButtons("rate",0,false)+"</div>"
        +'<div class="hint">登录后即可评分</div>';
    }

    root.innerHTML=
      '<div class="detail-hero" style="background:linear-gradient(160deg,'+m.c1+','+m.c2+')">'
        +'<div class="d-poster" style="background:rgba(0,0,0,.28)">'+esc(m.title)+"</div>"
        +'<div class="d-head"><h2>'+esc(m.title)+"</h2>"
          +'<div class="d-en">'+esc(m.en)+"</div>"
          +'<div class="d-tags"><span>'+m.year+"</span><span>"+esc(m.region)+"</span><span>"+esc(m.duration)+"</span>"+m.genre.map(function(g){return "<span>"+esc(g)+"</span>";}).join("")+"</div>"
        +"</div>"
      +"</div>"
      +'<div class="detail-body">'
        +'<div class="d-score">'
          +'<div class="big">'+(st.count?st.avg.toFixed(1):"–")+'<br><small>'+st.count+" 人评分</small></div>"
          +'<div class="s-mid"><div class="lab">观众评分</div>'+ratingBlock+"</div>"
        +"</div>"
        +'<h3 class="section-t">剧情简介</h3>'
        +'<p class="synopsis">'+esc(m.synopsis)+"</p>"
        +'<h3 class="section-t">影片信息</h3>'
        +'<div class="info-grid">'
          +'<div><div class="k">导演</div><div class="v">'+esc(m.director)+"</div></div>"
          +'<div><div class="k">主演</div><div class="v">'+esc(m.cast)+"</div></div>"
          +'<div><div class="k">上映年份</div><div class="v">'+m.year+"</div></div>"
          +'<div><div class="k">片长</div><div class="v">'+esc(m.duration)+"</div></div>"
        +"</div>"
        +'<h3 class="section-t">留言 · <span style="color:var(--ink-3);font-weight:600;font-size:13px">'+st.comments+" 条</span></h3>"
        +commentArea(m)
        +'<ul class="comments" id="comment-list">'+commentList(id)+"</ul>"
      +"</div>";

    // rating interaction
    if(state.user){
      Array.prototype.forEach.call(document.querySelectorAll("#rate-row .star"),function(btn){
        btn.addEventListener("click",function(){
          var val=parseInt(this.dataset.rate,10);
          state.ratings[state.user.uid+"@"+id]={movieId:id,value:val,uid:state.user.uid,at:Date.now()};
          write(R_KEY,state.ratings);
          toast("已评分 "+val+" 星");
          renderGrid();renderDetail(id);
        });
      });
    }

    // comment form
    var form=$("comment-form");
    if(form){
      var chosen=0;
      Array.prototype.forEach.call(form.querySelectorAll(".star"),function(btn){
        btn.addEventListener("click",function(){
          chosen=parseInt(this.dataset.cr,10);
          Array.prototype.forEach.call(form.querySelectorAll(".star"),function(s,i){
            s.classList.toggle("on",i<chosen);
          });
        });
      });
      form.addEventListener("submit",function(e){
        e.preventDefault();
        var ta=$("comment-text"),err=$("cf-error");
        var text=ta.value.trim();
        if(!text){err.textContent="留言内容不能为空";err.classList.add("show");ta.classList.add("invalid");ta.focus();return;}
        if(text.length>300){err.textContent="留言最多 300 字（当前 "+text.length+" 字）";err.classList.add("show");ta.classList.add("invalid");ta.focus();return;}
        if(!chosen){err.textContent="请先点击星星选择评分再发表";err.classList.add("show");return;}
        err.classList.remove("show");ta.classList.remove("invalid");
        state.comments.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),movieId:id,uid:state.user.uid,name:state.user.name,provider:state.user.provider,text:text,value:chosen,at:Date.now()});
        state.ratings[state.user.uid+"@"+id]={movieId:id,value:chosen,uid:state.user.uid,at:Date.now()};
        persistAll();
        toast("留言已发表");
        renderGrid();renderDetail(id);
      });
      $("comment-text").addEventListener("input",function(){this.classList.remove("invalid");$("cf-error").classList.remove("show");});
    }
    var needBtn=$("need-login-btn");
    if(needBtn)needBtn.addEventListener("click",function(){$("movie-dialog").close();$("login-dialog").showModal();});

    Array.prototype.forEach.call(document.querySelectorAll(".cm-del"),function(b){
      b.addEventListener("click",function(){
        var cid=this.dataset.cid;
        if(window.confirm("确定删除这条留言吗？")){
          state.comments=state.comments.filter(function(c){return c.id!==cid;});
          write(C_KEY,state.comments);
          renderGrid();renderDetail(id);
        }
      });
    });
  }

  function commentArea(m){
    if(!state.user){
      return '<div class="need-login">登录后即可为《'+esc(m.title)+'》打分并留言 · <button type="button" id="need-login-btn">立即登录</button></div>';
    }
    var u=state.user;
    return '<form class="comment-form" id="comment-form">'
      +'<div class="cf-row">'
        +'<span class="av" style="background:'+avatarColor(u.name,u.provider)+'">'+esc(u.name.slice(0,1))+"</span>"
        +'<div style="flex:1;min-width:0">'
          +'<textarea id="comment-text" maxlength="300" placeholder="说点什么…（1–300 字）"></textarea>'
          +'<div class="cf-foot">'
            +'<div class="rate">我的评分：<span id="cf-stars">'+starButtons("cr",0,true)+"</span></div>"
            +'<button type="submit" class="btn-send">发表留言</button>'
          +"</div>"
          +'<div class="cf-error" id="cf-error"></div>'
        +"</div>"
      +"</div>"
    +"</form>";
  }

  function commentList(id){
    var list=state.comments.filter(function(c){return c.movieId===id;}).sort(function(a,b){return b.at-a.at;});
    if(!list.length)return '<div class="no-comment">还没有留言，来抢沙发吧</div>';
    return list.map(function(c){
      var canDel=state.user&&c.uid===state.user.uid;
      return '<li class="comment">'
        +'<span class="av" style="background:'+avatarColor(c.name,c.provider)+'">'+esc(c.name.slice(0,1))+"</span>"
        +'<div class="cm-body">'
          +'<div class="cm-top"><span class="cm-name">'+esc(c.name)+"</span>"
            +'<span class="cm-badge '+c.provider+'">'+(c.provider==="qq"?"QQ":"微信")+"</span>"
            +'<span class="cm-stars">'+stars(c.value)+"</span>"
            +'<span class="cm-time">'+fmtTime(c.at)+(canDel?'<button type="button" class="cm-del" data-cid="'+c.id+'">删除</button>':"")+"</span>"
          +"</div>"
          +'<div class="cm-text">'+esc(c.text)+"</div>"
        +"</div>"
      +"</li>";
    }).join("");
  }

  /* ---------- login ---------- */
  function doLogin(provider){
    var raw=$("nick-input").value.trim();
    var name;
    if(raw){
      if(raw.length>16){toast("昵称最多 16 个字");return;}
      name=raw;
    }else{
      name=provider==="qq"?"QQ影迷"+Math.floor(100+Math.random()*900):"微信观众"+Math.floor(100+Math.random()*900);
    }
    state.user={uid:provider+"_"+Date.now().toString(36)+Math.random().toString(36).slice(2,7),name:name,provider:provider,loginAt:Date.now()};
    write(U_KEY,state.user);
    renderUser();
    $("login-dialog").close();
    toast("登录成功，欢迎你，"+name);
    if(state.openMovie)renderDetail(state.openMovie);
  }

  /* ---------- events ---------- */
  function init(){
    renderUser();
    renderCats();
    renderGrid();

    $("cats").addEventListener("click",function(e){
      var b=e.target.closest("button");if(!b)return;
      state.genre=b.dataset.g;
      Array.prototype.forEach.call(this.querySelectorAll("button"),function(x){x.setAttribute("aria-pressed",x===b?"true":"false");});
      renderGrid();
    });
    $("grid").addEventListener("click",function(e){
      var card=e.target.closest(".card");if(!card)return;
      renderDetail(card.dataset.id);
      $("movie-dialog").showModal();
    });
    $("grid").addEventListener("keydown",function(e){
      if(e.key!=="Enter"&&e.key!==" ")return;
      var card=e.target.closest(".card");if(!card)return;
      e.preventDefault();renderDetail(card.dataset.id);$("movie-dialog").showModal();
    });
    $("movie-close").addEventListener("click",function(){$("movie-dialog").close();});
    $("login-close").addEventListener("click",function(){$("login-dialog").close();});
    document.querySelectorAll(".sns-btn").forEach(function(b){
      b.addEventListener("click",function(){doLogin(b.dataset.provider);});
    });
    $("go-top").addEventListener("click",function(){window.scrollTo({top:0,behavior:"smooth"});});
  }

  try{init();}catch(err){/* static content remains visible */}
})();
