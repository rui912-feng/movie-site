// ========== 存储键名 ==========
const U_KEY = "movie_site_user";
const R_KEY = "movie_site_rates";
const C_KEY = "movie_site_comments";

// ========== 影片基础数据 ==========
var MOVIES = [
  {
    title:"肖申克的救赎",
    year:1994,
    director:"弗兰克·德拉邦特",
    cast:"蒂姆·罗宾斯,摩根·弗里曼",
    genre:["剧情"],
    synopsis:"银行家安迪蒙冤入狱，在肖申克监狱中坚守希望，用时间与智慧完成自我救赎。",
    c1:"#1e293b",c2:"#94a3b8"
  },
  {
    title:"霸王别姬",
    year:1993,
    director:"陈凯歌",
    cast:"张国荣,张丰毅,巩俐",
    genre:["剧情","爱情"],
    synopsis:"两个京剧伶人跨越数十年的悲欢，时代洪流之下人戏难分的宿命悲歌。",
    c1:"#7f1d1d",c2:"#fca5a5"
  },
  {
    title:"阿甘正传",
    year:1994,
    director:"罗伯特·泽米吉斯",
    cast:"汤姆·汉克斯",
    genre:["剧情","爱情"],
    synopsis:"智商平凡的阿甘，被动卷入美国半个世纪的重大历史，用纯粹书写传奇人生。",
    c1:"#172554",c2:"#93c5fd"
  }
];

// 筛选标签显示顺序
const GENRE_ORDER = ["全部","剧情","爱情","科幻","喜剧","动作","悬疑","战争"];

// ========== 状态 ==========
let appState = {
  user:null,
  rates:JSON.parse(localStorage.getItem(R_KEY)||"{}"),
  comments:JSON.parse(localStorage.getItem(C_KEY)||"[]"),
  currentFilter:"全部",
  searchText:"",
  theme:localStorage.getItem("theme")||"light"
};

// DOM元素
const el = {
  loginModal:document.getElementById("loginModal"),
  detailModal:document.getElementById("detailModal"),
  detailContent:document.getElementById("detailContent"),
  userPanel:document.getElementById("userPanel"),
  searchInput:document.getElementById("searchInput"),
  genreBar:document.getElementById("genreBar"),
  movieList:document.getElementById("movieList"),
  themeToggle:document.getElementById("themeToggle"),
  btnCloseLogin:document.getElementById("btnCloseLogin"),
  btnCloseDetail:document.getElementById("btnCloseDetail"),
  btnQQLogin:document.getElementById("btnQQLogin"),
  btnWxLogin:document.getElementById("btnWxLogin"),
  btnLocalLogin:document.getElementById("btnLocalLogin"),
  inputUsername:document.getElementById("inputUsername"),
  exportDataBtn:document.getElementById("exportDataBtn"),
  importDataBtn:document.getElementById("importDataBtn"),
  importFile:document.getElementById("importFile")
};

// ========== 主题初始化 ==========
function applyTheme(){
  document.documentElement.setAttribute("data-theme",appState.theme);
  localStorage.setItem("theme",appState.theme);
}
el.themeToggle.onclick = ()=>{
  appState.theme = appState.theme==="light"?"dark":"light";
  applyTheme();
};

// ========== 本地存储读写 ==========
function saveUser(){localStorage.setItem(U_KEY,JSON.stringify(appState.user));}
function loadUser(){
  const raw = localStorage.getItem(U_KEY);
  if(raw) appState.user = JSON.parse(raw);
}
function saveRates(){localStorage.setItem(R_KEY,JSON.stringify(appState.rates));}
function saveComments(){localStorage.setItem(C_KEY,JSON.stringify(appState.comments));}

// ========== 用户面板渲染 ==========
function renderUserPanel(){
  if(!appState.user){
    el.userPanel.innerHTML = `<button class="btn" id="openLoginBtn">登录</button>`;
    document.getElementById("openLoginBtn").onclick = ()=>el.loginModal.style.display="flex";
  }else{
    el.userPanel.innerHTML = `👤 ${appState.user.name} <button class="btn sm-btn" id="logoutBtn">退出</button>`;
    document.getElementById("logoutBtn").onclick = ()=>{
      appState.user = null; saveUser(); renderUserPanel(); renderMovieList();
    };
  }
}

// ========== 登录逻辑（模拟） ==========
el.btnCloseLogin.onclick = ()=>el.loginModal.style.display="none";
el.btnQQLogin.onclick = ()=>{
  appState.user = {name:"QQ模拟用户",type:"qq"}; saveUser();
  el.loginModal.style.display="none"; renderUserPanel(); renderMovieList();
};
el.btnWxLogin.onclick = ()=>{
  appState.user = {name:"微信模拟用户",type:"wx"}; saveUser();
  el.loginModal.style.display="none"; renderUserPanel(); renderMovieList();
};
el.btnLocalLogin.onclick = ()=>{
  const name = el.inputUsername.value.trim();
  if(!name){alert("请输入用户名");return;}
  appState.user = {name,type:"local"}; saveUser();
  el.inputUsername.value="";
  el.loginModal.style.display="none"; renderUserPanel(); renderMovieList();
};

// ========== 生成分类标签栏 ==========
function renderGenreBar(){
  el.genreBar.innerHTML = "";
  GENRE_ORDER.forEach(g=>{
    const span = document.createElement("span");
    span.className = "genre-tag"+(appState.currentFilter===g?" active":"");
    span.innerText = g;
    span.onclick = ()=>{
      appState.currentFilter = g; renderGenreBar(); renderMovieList();
    };
    el.genreBar.appendChild(span);
  });
}

// ========== 过滤影片 ==========
function getFilteredMovies(){
  let arr = MOVIES.slice();
  if(appState.currentFilter!=="全部"){
    arr = arr.filter(m=>m.genre.includes(appState.currentFilter));
  }
  const kw = appState.searchText.toLowerCase();
  if(kw){
    arr = arr.filter(m=>
      m.title.toLowerCase().includes(kw) ||
      m.director.toLowerCase().includes(kw) ||
      m.cast.toLowerCase().includes(kw)
    );
  }
  return arr;
}

// ========== 渲染卡片列表 ==========
function renderMovieList(){
  const list = getFilteredMovies();
  el.movieList.innerHTML = "";
  list.forEach(mov=>{
    const card = document.createElement("div");
    card.className = "movie-card";
    card.innerHTML = `
      <h3>${mov.title}(${mov.year})</h3>
      <div class="meta-row">导演：${mov.director}</div>
      <div class="meta-row">主演：${mov.cast}</div>
      <div class="genre‑labels">${mov.genre.map(x=>`<span>${x}</span>`).join("")}</div>
    `;
    card.onclick = ()=>openDetail(mov);
    el.movieList.appendChild(card);
  });
}

// ========== 影片详情弹窗 ==========
function openDetail(mov){
  const mid = mov.title;
  const myRate = appState.rates[mid]||0;
  const relatedComments = appState.comments.filter(c=>c.movieTitle===mid);

  el.detailContent.innerHTML = `
    <h2>${mov.title} ${mov.year}</h2>
    <p class="meta-row">导演：${mov.director}</p>
    <p class="meta-row">主演：${mov.cast}</p>
    <p><strong>简介：</strong>${mov.synopsis}</p>
    <div style="margin:10px 0;">
      <label>我的评分(0‑10)：</label>
      <input type="number" min="0" max="10" value="${myRate}" id="rateInput"/>
      <button class="btn" id="saveRateBtn">保存评分</button>
    </div>
    <div>
      <textarea id="commentInput" placeholder="写下你的评论..."></textarea>
      <button class="btn" id="submitCommentBtn">提交评论</button>
    </div>
    <div class="comment‑list">
      <h4>评论区</h4>
      ${relatedComments.length===0?"暂无评论":relatedComments.map(c=>`
        <div class="comment-item">
          <b>${c.author}</b>：${c.content}
          ${(appState.user && appState.user.name===c.author)?`<span class="del‑comment" data‑idx="${c.id}">删除</span>`:""}
        </div>`).join("")}
    </div>
  `;
  el.detailModal.style.display="flex";

  // 保存评分
  document.getElementById("saveRateBtn").onclick = ()=>{
    if(!appState.user){alert("请先登录");return;}
    const v = Number(document.getElementById("rateInput").value);
    appState.rates[mid] = v; saveRates(); alert("评分已保存");
  };

  // 提交评论
  document.getElementById("submitCommentBtn").onclick = ()=>{
    if(!appState.user){alert("请先登录");return;}
    const txt = document.getElementById("commentInput").value.trim();
    if(!txt) return;
    appState.comments.push({
      id:Date.now(),
      movieTitle:mid,
      author:appState.user.name,
      content:txt
    });
    saveComments(); openDetail(mov);
  };

  // 删除本人评论
  document.querySelectorAll(".del‑comment").forEach(delBtn=>{
    delBtn.onclick = ()=>{
      const idx = Number(delBtn.dataset.idx);
      appState.comments = appState.comments.filter(x=>x.id!==idx);
      saveComments(); openDetail(mov);
    };
  });
}
el.btnCloseDetail.onclick = ()=>el.detailModal.style.display="none";

// ========== 搜索监听 ==========
el.searchInput.oninput = e=>{
  appState.searchText = e.target.value;
  renderMovieList();
};

// ========== 数据导出/导入备份 ==========
el.exportDataBtn.onclick = ()=>{
  const payload = {user:appState.user,rates:appState.rates,comments:appState.comments};
  const blob = new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "movie‑site‑backup.json";
  a.click();
};
el.importDataBtn.onclick = ()=>el.importFile.click();
el.importFile.onchange = function(evt){
  const file = evt.target.files[0];
  if(!file)return;
  const reader = new FileReader();
  reader.onload = e=>{
    try{
      const obj = JSON.parse(e.target.result);
      if(obj.user) {appState.user = obj.user; saveUser(); renderUserPanel();}
      if(obj.rates) {appState.rates = obj.rates; saveRates();}
      if(obj.comments) {appState.comments = obj.comments; saveComments();}
      renderMovieList();
      alert("导入备份成功");
    }catch(err){alert("备份文件解析失败");}
  };
  reader.readAsText(file);
};

// ========== 页面初始化入口 ==========
function bootstrap(){
  loadUser();
  applyTheme();
  renderUserPanel();
  renderGenreBar();
  renderMovieList();
}
bootstrap();
