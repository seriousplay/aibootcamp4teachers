/* ===== 主应用：数据 + 状态 + 渲染 + 交互 ===== */

// ===== 白标配置（更换学校时只需改这一处） =====
const SCHOOL_NAME = '开封求实外国语学校';

// 启动时把学校名同步到页头和页脚
function applySchoolBrand() {
  document.querySelectorAll('#schoolBrand, #footerSchool').forEach(el => { el.textContent = SCHOOL_NAME; });
}
document.addEventListener('DOMContentLoaded', applySchoolBrand);

// ===== 教师需求图谱（基于需求评估文档的 A/B/C 成熟度分级） =====
const demandAtlas = {
  A: {
    name: '今天就能做', icon: '🟢', color: 'badge-green',
    desc: '成熟度高，本次培训现场就能动手做出成品，下周课堂可用',
    items: [
      { need: '写对提示词，AI出贴合本班的新课标教案', subject: '全学科', tech: '提示词六要素', task: 'A' },
      { need: '快速生成分层任务单（学困/中等/优生）', subject: '全学科', tech: '同一知识点三层生成', task: 'A' },
      { need: 'PBL项目式学习方案设计', subject: '语文/英语/综合', tech: 'PBL模板：驱动问题+任务链+评价', task: 'C' },
      { need: '课堂导入、情境创设', subject: '全学科', tech: '多模态生成', task: 'D' },
      { need: '家校沟通文案、家长信生成', subject: '班主任', tech: '事实型+鼓励型文案', task: 'E' },
      { need: '阶段性学情总结报告', subject: '班主任/教研', tech: '结构化总结生成', task: 'E' },
      { need: '阅读/作文初评（诊断性反馈）', subject: '语文/英语', tech: '按量规给亮点+问题+建议', task: null },
      { need: '题目生成、错题整理', subject: '数学/理科', tech: '错因诊断+变式题', task: 'B' },
      { need: '教学PPT一键生成', subject: '全学科', tech: '技能：教案→PPT成品', task: 'D' },
    ],
  },
  B: {
    name: '适合试点', icon: '🟡', color: 'badge-orange',
    desc: '需要一定数据或平台支撑，适合教研组/年级做4-8周试点后再推广',
    items: [
      { need: '精准定位知识漏洞，推送分层练习', subject: '数学/理科', tech: '需题目标签+错题数据', task: 'B' },
      { need: '随堂测后自动出薄弱点讲解+例题', subject: '全学科', tech: '需答题统计+知识点标签', task: 'B' },
      { need: '个性化布置作业、自动归集错题', subject: '全学科', tech: '需题库标签+学生画像', task: null },
      { need: '复测组卷、往届易错点预判', subject: '数学/理科', tech: '需校本历史错题库', task: null },
      { need: '英语口语陪练、纠音', subject: '英语', tech: 'ASR+发音评测，需隐私管控', task: null },
      { need: '常态化口语训练+薄弱点定位', subject: '英语', tech: '需口语题库+评分校准', task: null },
      { need: 'AI辅助过程性评价（音舞美）', subject: '音舞美', tech: '示范前/练习后/讲评时介入', task: null },
      { need: '体育趣味运动打卡', subject: '体育', tech: '动作识别+班级榜单', task: null },
      { need: '古诗文沉浸式学习', subject: '语文', tech: '需古诗文资料包', task: null },
      { need: '阅读长难句拆解、语法讲解', subject: '英语', tech: '文本分级+结构图生成', task: null },
      { need: 'AI课堂问题串优化', subject: '数学/理科', tech: '依据前测生成递进问题', task: null },
      { need: '本土素材情境教学', subject: '英语/语文', tech: '需地方素材库', task: null },
    ],
  },
  C: {
    name: '长期探索', icon: '🔵', color: 'badge-blue',
    desc: '创新方向，需学校数字化建设、数据治理和长期投入，是未来1学期以上的演进',
    items: [
      { need: 'AI全流程个性化教学', subject: '全学科', tech: '需学生画像+掌握度模型', task: null },
      { need: '智慧运动场地、体测数据化', subject: '体育', tech: '需硬件+数据治理', task: null },
      { need: 'AI驱动的项目化学习社区', subject: '跨学科', tech: '需平台+协作机制', task: null },
      { need: '学生数字学习画像', subject: '全学科', tech: '需长期数据沉淀', task: null },
      { need: '跨学科真实问题学习', subject: '跨学科', tech: '需课程重构+教师协同', task: null },
      { need: '教研智能体（校本知识库）', subject: '教研组', tech: '需持续沉淀好课/错题/量规', task: null },
    ],
  },
};

// ===== 实操关小测题库（每关3题，结合知识点和活动目标） =====
const stepQuizzes = {
  1: [ // 提示词入门：八要素公式、对比、拔高
    { q: '提示词八要素公式中，下列哪一项【不属于】八要素？', opts: ['角色', '目标', '学情', 'AI的名字'], answer: 3 },
    { q: '"帮我写个教案"和"你是小学语文教研员，基于四年级某课文，输出目标和分层任务"相比，后者好在哪？', opts: ['字更多', '说清了角色、对象、目标和格式，AI能精确执行', '用了敬语', '更长所以更贵'], answer: 1 },
    { q: '你让AI生成的教案"总是太笼统、不贴合本班"，最可能的原因和对策是？', opts: ['AI太笨，没救了', '提示词里没讲清本班学情和具体要求——补上学情、重难点、评价标准，让它"接地气"', '换一个更贵的AI', '多生成几次碰运气'], answer: 1 },
  ],
  2: [ // 首次上手：认识智能体能做什么、基础操作、求助意识
    { q: '像 WorkBuddy 这样的智能体，除了帮你做教学设计，还能做哪些事？', opts: ['只能聊天，什么都做不了', '能写代码、做数据分析、当办公助理、生成各类文件，像一个全能数字员工', '只能回答知识性问题', '只能用于这次培训，培训完就废了'], answer: 1 },
    { q: '在 WorkBuddy 里，你想让它"帮你把这段教案排成表格"，最自然的说法是？', opts: ['请帮我把上面这段教案内容整理成一个表格', '表格', '你自己看着办', '关闭对话'], answer: 0 },
    { q: '关于"智能体"和"大模型"的关系，哪种理解最准确？', opts: ['它们是完全一样的东西', '大模型是"脑"（负责思考和生成），智能体是"手"（调用脑和各种工具去完成任务）', '智能体比大模型笨', '大模型只能用在智能体里，不能单独用'], answer: 1 },
  ],
  3: [ // 认识能力：通用智能体工作台、技能触发语、教师把关
    { q: '腾讯官方对 WorkBuddy 的定位，更接近下面哪一种？', opts: ['只会聊天的问答工具', '只给老师生成教学PPT的工具', '全场景桌面AI智能体/办公工作台，能理解任务、拆解步骤并交付结果', '只能搜索网页的浏览器插件'], answer: 2 },
    { q: '把教案做成PPT文件时，下列哪种说法最容易触发技能？', opts: ['"帮我看看教案"', '"请把它做成PPT"', '"这个教案不错"', '"教案"'], answer: 1 },
    { q: '老师使用 WorkBuddy 最重要的边界是什么？', opts: ['AI生成后可以直接发给学生，不用检查', '它能帮忙执行资料处理、分析和成品生成，但教师仍要判断内容是否准确、适合本班', '只要用了AI就不用考虑隐私', 'AI做得越多，教师越不需要参与'], answer: 1 },
  ],
  4: [ // 观看演示：完整流程、产出、核心理念
    { q: '讲师演示的完整流程，最终产出的核心是什么？', opts: ['一段聊天文字', '一份可下载的教学成品文件', '一份考试题', '一段视频'], answer: 1 },
    { q: '演示中"一个单元变成一套教学材料包"的关键动作是？', opts: ['只和AI聊天', '先对话生成内容，再用技能生成可下载成品', '只上传文件不说话', '只下载不检查'], answer: 1 },
    { q: '看演示时，最该关注的不是什么？', opts: ['每一步操作和产出', 'AI如何从对话到成品的完整闭环', '讲师的PPT动画好不好看', '成品文件长什么样'], answer: 2 },
  ],
  5: [ // 生成第一版：模板使用、方括号、拔高
    { q: '使用提示词模板时，方括号 [ ] 里的内容应该怎么处理？', opts: ['原样发送给AI', '删除掉', '替换成你自己的真实信息', '复制多份'], answer: 2 },
    { q: '模板里有很多方括号要填，如果时间紧只能认真填一个，填哪个对结果影响最大？', opts: ['[课时长度]（填多少分钟）', '[本班学情]（学生的基础、薄弱点、已有知识）——它决定AI生成的内容是否真的适合你的学生', '[教材版本]（哪个出版社）', '[课堂条件]（有无多媒体设备）'], answer: 1 },
    { q: 'AI生成的第一版教案，你最该带着"批判眼光"检查的是？', opts: ['字数够不够多', '学习目标是否真对接新课标核心素养、分层是否真匹配本班学情——这些AI最容易"想当然"', '排版好不好看', '有没有用网络流行语'], answer: 1 },
  ],
  6: [ // 优化迭代：三种方式、明确反馈、拔高
    { q: '优化第一版时，下列哪种做法最有效？', opts: ['删掉重来', '明确告诉AI哪里不满意、要怎么改', '换一个AI工具', '只夸奖不提意见'], answer: 1 },
    { q: '想用上传的教材改进教案，最合适的指令是？', opts: ['请基于我上传的教材内容，改进上面的教案', '随便改改', '把教案删了', '教案不用改'], answer: 0 },
    { q: 'AI反复改了3版你还是不满意，这时最高效的策略是？', opts: ['一直让它改，改到天荒地老', '停下来，反思是不是自己的"要求/标准"没说清——把评判标准量化告诉AI，往往一次就改对', '怪AI太笨', '放弃AI改回手写'], answer: 1 },
  ],
  7: [ // 设计专属技能：把经验沉淀成可复用技能
    { q: '一个可复用教学 Skill 至少应该包含哪些部分？', opts: ['只有一句“帮我写教案”', '触发方式、输入模板、执行规则、输出模板和质量检查', '越长越好，不需要结构', '只要能生成PPT就够了'], answer: 1 },
    { q: '设计“新课标教案+分层任务单”Skill 时，缺少哪几项信息应该先追问？', opts: ['课题、年级学科、学情、课时', '教师姓名和办公室', 'PPT颜色和字体', '今天星期几'], answer: 0 },
    { q: '第一次测试 Skill 的结果不理想，最应该怎么做？', opts: ['只改这一份教案，不管Skill', '继续优化Skill说明书，让它以后稳定按新标准工作', '放弃Skill', '让AI随便发挥'], answer: 1 },
  ],
  8: [ // 打造教研智能体：vibe coding、校本知识库、进阶认知
    { q: '"vibe coding"是什么意思？', opts: ['一种编程语言', '用自然语言（说话的方式）指挥AI写代码、搭工具，不用自己懂编程语法', '一种打字速度测试', '只能程序员用的功能'], answer: 1 },
    { q: '"教研智能体"和"校本知识库"组合起来，能为教研组带来什么？', opts: ['没什么特别的价值', '让组里的好课、错题、量规、学情沉淀成AI能调用的知识，新人问一句就能得到团队经验的积累，越用越聪明', '只是把文件存到网盘', '只能一个人用，不能共享'], answer: 1 },
    { q: '用vibe coding打造教研智能体时，最关键的"喂养"是什么？', opts: ['喂给它很多无关的网页', '把教研组的高质量资产（优质教案、易错题、评价量规、学情数据）整理好上传，智能体的水平取决于你喂的内容质量', '喂得越多越好，不用分类', '什么都不用喂，它自己会变聪明'], answer: 1 },
  ],
};

// ===== 关卡元信息（13关：5知识关K + 8实操关P） =====
const levelMeta = {
  K1: { title: '什么是提示词', type: 'knowledge', phase: '认知关', subtitle: '理解"下教学任务"和"聊天"的本质区别' },
  K2: { title: '什么是智能体Agent', type: 'knowledge', phase: '认知关', subtitle: '理解为什么WorkBuddy不只是聊天机器人' },
  K3: { title: '什么是Skills技能', type: 'knowledge', phase: '认知关', subtitle: '理解AI如何一句话生成成品文件' },
  K4: { title: '什么是知识库RAG', type: 'knowledge', phase: '认知关', subtitle: '理解为什么上传教材后AI回答更准' },
  K5: { title: '什么是龙虾OpenClaw助手', type: 'knowledge', phase: '认知关', subtitle: '理解你的数字分身：有灵魂、有记忆、持续进化' },
  P1: { title: '提示词入门', type: 'practice', time: '8-18分钟', phase: '上半场', sourceId: 'act1' },
  P2: { title: '首次上手', type: 'practice', time: '18-28分钟', phase: '上半场', sourceId: 'act2' },
  P3: { title: '认识WorkBuddy这个通用智能体工作台', type: 'practice', time: '28-40分钟', phase: '上半场', sourceId: 'act3' },
  P4: { title: '观看完整演示', type: 'practice', time: '40-52分钟', phase: '上半场', sourceId: 'act4' },
  P5: { title: '生成你的第一版', type: 'practice', time: '0-10分钟', phase: '下半场', sourceId: 'act5' },
  P6: { title: '优化你的第一版', type: 'practice', time: '10-25分钟', phase: '下半场', sourceId: 'act6' },
  P7: { title: '设计你的专属技能', type: 'practice', time: '25-40分钟', phase: '下半场', sourceId: 'act7' },
  P8: { title: '打造教研智能体：用vibe coding建校本知识库', type: 'practice', time: '40-53分钟', phase: '下半场', sourceId: 'act8' },
};

// ===== 知识关内容（科普层） =====
const knowledgeContent = {
  K1: {
    intro: '提示词（Prompt）不是"和AI聊天"，而是<strong>给AI下一份清晰的教学任务书</strong>。就像你给实习生布置工作——说清"做什么、给谁用、要什么标准"，他才能交出你想要的东西。',
    compare: [
      { bad: '帮我写个教案', good: '你是一名小学语文教研员，请基于四年级《爬山虎的脚》，结合本班识字基础偏弱、40分钟课时，输出学习目标、问题链、分层任务和评价量规' },
    ],
    metaphor: '打个比方：AI 就像一个能力很强、但完全不了解你班级的"新来的实习生"。你对他说"写个教案"，他会按自己的理解随便写一份（大概率不适用）；但如果你交待清楚"教几年级、什么课文、学生什么水平、重点是什么、要什么格式"，他就能交出你真正能用的东西。<strong>提示词，就是这份"任务交待书"</strong>。',
    keypoint: '提示词的本质 = 把你脑子里的教学经验，翻译成AI能精确执行的任务指令。',
  },
  K2: {
    intro: '智能体（Agent）比聊天机器人更进一步——它能<strong>记住上下文、串联多个步骤、主动调用工具</strong>。普通AI你问一句答一句；Agent你交一个目标，它自己拆解、执行、产出。',
    compare: [
      { bad: '聊天机器人：你问"教案怎么写"，它给你一段文字建议', good: '智能体Agent：你说"帮我做这节课的教案+分层任务+PPT"，它自动分步完成并交付文件' },
    ],
    metaphor: '打个比方：普通聊天 AI 像窗口的"咨询客服"——你问一句他答一句，但他不会替你把事办了。而 Agent 像一位<strong>"全能助理"</strong>——你说"帮我准备下周的公开课"，他会自己拆成几步：先写教案、再做分层任务、最后生成 PPT，一步一步把成品交到你手上。<strong>你只需交目标，过程它自己跑</strong>。',
    keypoint: 'WorkBuddy是Agent——你不用学操作界面，用自然语言交任务，它自动用对话、知识库、技能完成全流程。记住：大模型是"脑"（负责思考生成），智能体是"手"（调用脑和各种工具去办事），同一个智能体可以接不同的"脑"。',
  },
  K3: {
    intro: 'Skills（技能）是AI的<strong>"专业能力包"</strong>——每个 Skill 把"做事的指令 + 模板 + 工具"打包在一起，AI 需要时<strong>自动调用</strong>。这就像给一个聪明但只会聊天的助手，<strong>装上一个个专业"插件"</strong>：装了 PPT 技能，它就会做课件；装了表格技能，它就会出 Excel。',
    metaphor: '打个比方：AI 本身像一个"什么都会一点、但样样不精通"的大学生。Skills 就是给他颁发的"教师资格证""PPT 工程师证""数据分析证"——<strong>每装一个 Skill，他就多一项拿得出手的专业本领</strong>，而且这些本领是别人（或你）创建一次、永久复用的，不用每次对话都重新教。',
    compare: [
      { bad: '没技能的AI：你说"做个教案PPT"，它只能给你一段文字描述，你得自己动手排版做幻灯片', good: '有技能的AI：你说"把这份教案做成PPT"，它自动调用 PPT 技能，生成一份15页的 .pptx 文件让你下载' },
    ],
    keypoint: 'Skills = 可复用的专业能力包。本次培训用的 PPT/Excel/Word/PDF 生成，就是 WorkBuddy 内置的几个技能。技能让 AI 从"只会说"变成"会做事"。',
  },
  K4: {
    intro: '知识库（RAG）让AI<strong>基于你的教材、课标、校本题来回答，而不是凭空编造</strong>。就像让AI先"读完"你的资料，再基于资料回答——准确率大幅提升。',
    compare: [
      { bad: '直接问AI：《爬山虎的脚》这一课的重点是什么？（AI凭训练记忆回答，可能不准）', good: '上传教材PDF后问：基于这份教材，本课重点是什么？（AI基于你上传的真实教材回答）' },
    ],
    metaphor: '打个比方：不建知识库直接问 AI，就像让学生"<strong>闭卷考试</strong>"——他只能凭脑子里的记忆答，难免记错或编造（AI 的"幻觉"就是这么来的）。而上传教材建好知识库后，相当于"<strong>开卷考试</strong>"——AI 可以翻着你给的书来回答，<strong>有据可查、不再瞎编</strong>。',
    keypoint: 'RAG = 让AI"先读你的书，再回答你的问题"。上传教材后，AI的输出会贴合你的真实教学内容。',
  },
  K5: {
    intro: '龙虾（OpenClaw）助手是<strong>生活在本地或云端的智能助手</strong>——它有自己的灵魂和记忆，能持续学习你的习惯和偏好，像一个<strong>越用越懂你的数字分身</strong>。',
    compare: [
      { bad: '普通AI工具：每次对话都是"初次见面"，不记得你是谁、教什么学科', good: '龙虾助手：记住你是三年级数学老师、你的班级学情、你偏好的教案风格，持续进化为你量身定制' },
    ],
    metaphor: '打个比方：普通 AI 工具像"每次都换人的代课老师"——每次来都不认识你、不了解你的班，所有情况要从头讲。而龙虾助手像一位<strong>"长期和你搭档的助教"</strong>——他记得你的每个学生、熟悉你的教学风格、知道你上次备课改到哪了，<strong>越合作越默契，不用你每次重复交待</strong>。',
    keypoint: '龙虾助手 = 有记忆、有灵魂、持续进化的数字分身。它是AI从"工具"走向"伙伴"的下一步。',
  },
};

// ===== 知识关小测题库（每关3题，全部答对才算过关） =====
const knowledgeQuizzes = {
  K1: [
    { q: '提示词和"跟AI聊天"最本质的区别是什么？', opts: ['提示词字数更多', '提示词是给AI下明确任务，不是闲聊', '提示词只能用英文', '提示词必须复制粘贴'], answer: 1 },
    { q: '下面哪句是"好的提示词"？（即给AI下了清晰任务）', opts: ['帮我写个教案', '随便写点教学相关的内容', '你是小学语文教研员，基于四年级《爬山虎的脚》，结合本班识字偏弱，输出学习目标和分层任务', '写点东西给我'], answer: 2 },
    { q: '同一份提示词，给两个不同的AI（如一个擅长文学、一个擅长数学），结果可能差别很大。这说明什么？', opts: ['说明提示词没用，结果全看运气', '说明提示词要结合AI的能力特点来写，针对不同任务选对工具也很重要', '说明AI都是骗人的', '说明提示词越长越好'], answer: 1 },
  ],
  K2: [
    { q: '智能体Agent和普通聊天机器人的关键区别是？', opts: ['Agent界面更好看', 'Agent能记住上下文、串联步骤、调用工具完成任务', 'Agent回答更快', 'Agent只能回答问题'], answer: 1 },
    { q: '你交给Agent一个目标"帮我准备下周公开课"，它最可能怎么做？', opts: ['只回你一句"好的"然后结束', '只给你一段文字建议就完了', '自己拆成写教案、做分层任务、生成PPT等步骤，逐步交付', '让你自己去别的软件做'], answer: 2 },
    { q: '如果一个老师只会用聊天机器人，另一个老师会用智能体Agent，半年后最可能出现的差距是？', opts: ['没有差距', '会用Agent的老师能沉淀出"一次说清、自动产出"的工作流，效率成倍提升；只会聊天的还在逐句问答', '会聊天的老师更强', '差距只在打字速度'], answer: 1 },
  ],
  K3: [
    { q: '根据Claude官方定义，Skills技能本质上是什么？', opts: ['让AI回答更礼貌的功能', '可复用的专业能力包（指令+模板+工具），AI自动调用', '让AI聊天不卡顿的加速器', '一种聊天表情包'], answer: 1 },
    { q: '没装Skills的AI和装了PPT技能的AI，区别在于？', opts: ['没区别，都能做PPT', '没技能的只会输出文字描述，有技能的能生成可下载的.pptx文件', '有技能的更贵', '有技能的回答更慢'], answer: 1 },
    { q: '除了平台内置的技能，未来教师最有可能怎样用好Skills？', opts: ['只能等官方更新，自己没法做', '把自己反复用的"教案审核标准""分层出题套路"沉淀成自定义技能，让AI每次自动按自己的标准做事', '技能越少越好', '技能只能给程序员用'], answer: 1 },
  ],
  K4: [
    { q: '上传教材后再问AI，为什么回答更准确？', opts: ['上传后AI变聪明了', 'AI基于你上传的真实教材回答，不凭空编造', '上传后AI免费了', '上传后不需要写提示词'], answer: 1 },
    { q: '不建知识库直接问AI课文重点，相当于让学生做什么？', opts: ['开卷考试（可翻书）', '闭卷考试（只能凭记忆，可能记错或编造）', '口语考试', '体育考试'], answer: 1 },
    { q: '学校想建一个"本校易错题知识库"让AI基于它出题，最关键的前置工作是？', opts: ['直接把题目一股脑丢给AI就行', '先给每道题打好"知识点、年级、错因"等标签，AI才能精准调用', '题越多越好，不用分类', '只能上传图片不能上传文字'], answer: 1 },
  ],
  K5: [
    { q: '龙虾OpenClaw助手区别于普通AI工具的核心特征是？', opts: ['可以离线使用', '有灵魂和记忆，能持续进化为你的数字分身', '界面是红色的', '只能用于教学'], answer: 1 },
    { q: '普通AI工具和龙虾助手，哪个更接近"长期搭档的助教"？', opts: ['普通AI工具（每次都是初次见面）', '龙虾助手（记得你的学生、学情、偏好，越用越默契）', '两者完全一样', '都不像助教'], answer: 1 },
    { q: '龙虾助手"越用越懂你"，但也带来一个需要警惕的问题，是？', opts: ['它用久了会变笨', '它记住了你的偏好和数据，需要注意隐私保护和数据归属——数字分身越像你，越要想清楚哪些信息该让它记住', '它一定会泄露你的密码', '它用久了要收费'], answer: 1 },
  ],
};



// ===== 学习内容数据（从原student.html迁移） =====
const taskData = {
  A: { name:"教案+分层任务单", desc:"生成一份完整教案和三层分层任务单", deliverable:"一份完整教案文档 + 一张三层任务单", color:"badge-blue", prompts:[
    { label:"教案生成", code:`你是一名有经验的中小学教师和教研员。请基于以下信息设计一课时教案：\n\n- 年级与学科：[填写]\n- 教材版本与课题：[填写]\n- 课标目标/核心素养：[填写]\n- 本班学情：[填写]\n- 已有知识基础：[填写]\n- 常见错误或难点：[填写]\n- 课时长度：[填写]\n- 课堂条件：[填写]\n\n请输出：学习目标、重点难点、导入、问题串、学生活动、分层任务（基础/发展/挑战）、板书设计、随堂评价、课后作业。\n要求：贴合学生年龄，不空泛，每个环节写明教师做什么、学生做什么、如何评价。` },
    { label:"分层任务单", code:`请围绕"[知识点/课文/单元主题]"设计三层学习任务：\n\n基础层：帮助学困生掌握必要知识\n发展层：帮助大多数学生完成迁移应用\n挑战层：帮助学有余力学生进行综合表达或探究\n\n每层包含：目标、材料、任务、提示、评价标准和预计用时。\n要求：不要降低基础层的尊严感，语言要鼓励。` },
    { label:"成品化：教案→Word", code:`请把以上教案整理成一份格式规范的Word文档，含标题、学习目标、教学流程、分层任务、评价量规等部分` }
  ]},
  B: { name:"错题诊断+分层练习", desc:"基于错题统计生成错因分析和分层补救练习", deliverable:"一张错题分析表 + 一套分层补救练习", color:"badge-green", prompts:[
    { label:"错题诊断", code:`你是一名数学学情分析助手。以下是学生的一次练习答题情况：\n\n- 知识点：[填写，如"异分母分数加减法"]\n- 题目数量：5道\n- 错误统计：[填写，如"第3题错误率70%，主要错误是直接分子加分母；第5题错误率45%，主要错误是通分错误"]\n\n请输出：\n1. 共性错误排序\n2. 每个错误的错因假设\n3. 3分钟讲解稿（可直接对全班讲）\n4. 2道例题（含详细解答）\n5. 3道变式题（由易到难）\n6. 学困/中等/优生的不同补救建议\n\n要求：不确定的地方标明"不确定"，不要臆断。优先给出教师可执行的建议。` },
    { label:"分层练习生成", code:`请围绕"[知识点]"设计三层练习题：\n\n基础层（学困生）：5道基础题，覆盖核心知识点\n发展层（中等生）：4道应用题，需要迁移理解\n挑战层（优生）：3道综合题，需要多步推理或创新解法\n\n每道题附答案和解析。` },
    { label:"成品化：错题→Excel", code:`请把错题分析结果做成一份Excel表格，包含题号、知识点、错误率、错因、补救建议、变式题等列` }
  ]},
  C: { name:"PBL项目设计", desc:"设计一套完整的项目式学习方案", deliverable:"一份可分享的PBL项目方案", color:"badge-purple", prompts:[
    { label:"PBL方案设计", code:`你是一名项目式学习设计专家。请基于以下主题，为[年级]课堂设计一套PBL方案：\n\n- 主题：[填写]\n- 学科：[填写]\n- 课时：[填写，如4-6课时]\n\n请输出：\n1. 驱动问题\n2. 项目目标\n3. 任务链（分课时）\n4. 学生分工\n5. 资料支持（AI可帮助检索的方向）\n6. 分层支架\n7. 成果物\n8. 评价量规\n\n要求：任务要真实，过程要可操作，适合在一线课堂落地。` },
    { label:"成品化：PBL→PDF", code:`请把PBL方案整理成一份完整的PDF文档，含项目概览、驱动问题、任务链、评价量规、附录` }
  ]},
  D: { name:"教学PPT生成", desc:"基于教案内容生成可用的教学PPT", deliverable:"一份可编辑、可上课使用的PPT", color:"badge-orange", prompts:[
    { label:"教案生成", code:`你是一名有经验的中小学教师和教研员。请基于以下信息设计一课时教案：\n\n- 年级与学科：[填写]\n- 教材版本与课题：[填写]\n- 课标目标/核心素养：[填写]\n- 本班学情：[填写]\n- 课时长度：[填写]\n\n请输出：学习目标、重点难点、导入、问题串、学生活动、分层任务、板书设计、随堂评价、课后作业。` },
    { label:"成品化：教案→PPT", code:`请基于以上教案内容，做成一份15页的教学PPT，要有标题页、目标页、每个环节一页、总结页` },
    { label:"PPT修改指令", code:`请修改PPT：\n1. 每页文字太多，请精简到每页不超过50字\n2. 增加一页板书设计\n3. 最后一页增加课后作业\n4. 标题页加上我的名字：[你的名字]` }
  ]},
  E: { name:"家校沟通+学情总结", desc:"生成家长信和学情分析报告", deliverable:"一封家长沟通文案 + 一份学情报告", color:"badge-pink", prompts:[
    { label:"家长信生成", code:`你是一名有温度的班主任。请根据以下信息写一段[家长信/微信群消息]：\n\n- 事件/背景：[填写]\n- 学生表现：[填写，如"小明本周在项目中从不敢发言到主动汇报"]\n- 教师观察：[填写]\n\n要求：事实型、鼓励型、有下一步行动建议。\n- 家长信不超过300字\n- 微群消息不超过100字\n- 不给学生贴负面标签` },
    { label:"学情总结", code:`你是一名学情分析助手。请根据以下信息生成一份学情报告：\n\n- 班级：[填写]\n- 时间范围：[填写，如"本学期前8周"]\n- 整体表现：[填写，如"班级整体数学成绩稳步提升，但应用题失分严重"]\n- 重点关注学生：[填写，如"小明基础薄弱但进步明显，小红粗心问题持续"]\n\n请输出：班级整体情况、薄弱点排名、分层建议、下一步行动计划。` },
    { label:"成品化：家长信→Word", code:`请把家长信整理成一份Word文档，格式适合打印或微信群发送` },
    { label:"成品化：学情→PDF", code:`请把学情分析整理成一份PDF报告，含班级整体情况、薄弱点排名、分层建议` }
  ]}
};

const allTemplates = [
  { id:1, name:"新课标教案生成", icon:"📝", scene:"备课", code:`你是一名有经验的中小学教师和教研员。请基于以下信息设计一课时教案：\n\n- 年级与学科：[填写]\n- 教材版本与课题：[填写]\n- 课标目标/核心素养：[填写]\n- 本班学情：[填写]\n- 已有知识基础：[填写]\n- 常见错误或难点：[填写]\n- 课时长度：[填写]\n- 课堂条件：[填写]\n\n请输出：学习目标、重点难点、导入、问题串、学生活动、分层任务（基础/发展/挑战）、板书设计、随堂评价、课后作业。\n要求：贴合学生年龄，不空泛，每个环节写明教师做什么、学生做什么、如何评价。` },
  { id:2, name:"分层任务单生成", icon:"📚", scene:"分层教学", code:`请围绕"[知识点/课文/单元主题]"设计三层学习任务：\n\n基础层：帮助学困生掌握必要知识\n发展层：帮助大多数学生完成迁移应用\n挑战层：帮助学有余力学生进行综合表达或探究\n\n每层包含：目标、材料、任务、提示、评价标准和预计用时。\n要求：不要降低基础层的尊严感，语言要鼓励。` },
  { id:3, name:"错因诊断与补救", icon:"🔍", scene:"错题分析", code:`以下是学生在一次练习中的错误统计和典型答案：\n\n[粘贴错题统计和典型答案]\n\n请帮我判断可能的知识漏洞和思维误区，并输出：\n1. 班级共性薄弱点排序\n2. 每个薄弱点的错因假设\n3. 3分钟讲解稿\n4. 2道例题和3道变式题\n5. 学困/中等/优生的不同补救建议\n\n注意：如果数据不足，请标出"不确定"，不要臆断。` },
  { id:4, name:"PBL项目设计", icon:"🎯", scene:"项目式学习", code:`你是一名项目式学习设计专家。请基于以下主题，为[年级]课堂设计一套PBL方案：\n\n- 主题：[填写]\n- 学科：[填写]\n- 课时：[填写，如4-6课时]\n\n请输出：\n1. 驱动问题\n2. 项目目标\n3. 任务链（分课时）\n4. 学生分工\n5. 资料支持\n6. 分层支架\n7. 成果物\n8. 评价量规\n\n要求：任务要真实，过程要可操作，适合在一线课堂落地。` },
  { id:5, name:"家校沟通文案", icon:"💬", scene:"家校沟通", code:`你是一名有温度的班主任。请根据以下信息写一段[家长信/微信群消息]：\n\n- 事件/背景：[填写]\n- 学生表现：[填写，如"小明本周在项目中从不敢发言到主动汇报"]\n- 教师观察：[填写]\n\n要求：事实型、鼓励型、有下一步行动建议。\n- 家长信不超过300字\n- 微群消息不超过100字\n- 不给学生贴负面标签` },
  { id:6, name:"可开发Skills清单", icon:"⚡", scene:"技能沉淀", isSkill:true },
  { id:7, name:"学生AI使用公约", icon:"🤝", scene:"学生AI素养", code:`请帮我生成一份适合[年级]学生的AI使用公约，要求：\n\n1. 向AI提问前，先写出自己的想法\n2. 让AI给提示，不让AI直接给最终答案\n3. 让AI解释为什么，而不是只要结果\n4. 把AI回答和课本、老师讲解、同伴讨论进行对照\n5. 提交作业时标明哪些地方使用过AI帮助\n\n请用学生能理解的语言，设计成一页可打印的公约卡片。` }
];

const skillDetails = [
  { icon:"📝", name:"新课标教案+分层任务单", priority:"A", scenes:"备课、分层教学、公开课准备", input:"年级、课题、课标目标、班情、教材页", output:"教案、问题串、三层任务单、评价量规" },
  { icon:"🔍", name:"错题诊断+补救练习", priority:"A", scenes:"知识漏洞定位、薄弱点讲解、变式训练", input:"错题统计、典型答案、知识点标签", output:"错因排序、讲解稿、例题、分层练习" },
  { icon:"🎯", name:"PBL项目设计器", priority:"A/B", scenes:"传统文化、地方素材、跨学科项目学习", input:"主题、学科、课时、地方资源、成果要求", output:"驱动问题、任务链、资料包、分工、评价量规" },
  { icon:"💬", name:"家校沟通+学情总结", priority:"A", scenes:"家长信、阶段性学情报告、班主任沟通", input:"学生表现、数据、教师观察、沟通对象", output:"事实型家长信、鼓励建议、班级学情报告" },
  { icon:"💡", name:"课堂问题串+互动题", priority:"B", scenes:"课堂导入、追问、随堂测和节奏调整", input:"教学目标、前测结果、重难点、课堂条件", output:"递进问题串、互动题、追问、板书节奏" }
];

// ===== 全局状态 =====
let currentUser = null;
let currentProgress = { steps: [], task: null, points: 0, badges: [], quiz: {} };
let currentLevel = 'K1';  // 当前聚焦的关卡（单步聚焦视图）

// ===== APP 主模块 =====
const APP = (function() {

  async function init() {
    // 1. 探测后端
    await API.detectBackend();

    // 2. 启动滚动高亮监听
    initScrollListener();

    // 3. 检查登录状态
    if (API.isLoggedIn()) {
      currentUser = API.getCurrentUser();
      try {
        currentProgress = await API.getProgress();
      } catch(e) {
        // 如果获取失败，可能是token过期，退出重新登录
        API.logout();
        AUTH.renderAuthPage();
        return;
      }
      showMainApp();
    } else {
      AUTH.renderAuthPage();
    }
  }

  function onLoginSuccess(user) {
    currentUser = user;
    API.getProgress().then(prog => {
      currentProgress = prog;
      showMainApp();
    }).catch(() => {
      showMainApp();
    });
  }

  function showMainApp() {
    // 渲染header用户信息
    updateUserChip();
    updateModeIndicator();
    updateProgressDisplay();
    updateTaskBadge();

    // 恢复已完成步骤的侧边栏完成态
    (currentProgress.steps || []).forEach(step => {
      const navItem = document.querySelector(`.nav-item[data-step="${step}"]`);
      if (navItem) navItem.classList.add('completed');
    });

    // 恢复任务选择状态
    if (currentProgress.task) {
      const cards = document.querySelectorAll('.task-select-card');
      cards.forEach(c => {
        if (c.getAttribute('onclick') && c.getAttribute('onclick').includes(`'${currentProgress.task}'`)) {
          c.classList.add('selected');
        }
      });
      renderTaskPrompts(currentProgress.task);
      showTaskBanner(currentProgress.task);
    }

    // 渲染模板和技能
    renderAllTemplates();
    renderDemandAtlas();
    renderSkillDetails();
    renderBadgesWall();
    renderLeaderboard();
    renderLearningHub();
    renderResourceLibrary();

    // 为8个步骤渲染拓展资源
    for (let i = 1; i <= 8; i++) {
      renderStepResources('act' + i, i);
    }

    // ===== 单步聚焦视图：初始化活动包模式 =====
    initActivityMode();
  }

  // ===== 单步聚焦视图：初始化 =====
  function initActivityMode() {
    // 规范化已通关关卡（兼容老数据）
    const mastered = GAMIFY._normalizeLevels(currentProgress.steps || []);
    currentProgress.steps = mastered;
    // 默认聚焦第一个未掌握的关卡（老用户从断点续学）
    let first = GAMIFY.ALL_LEVELS[0];
    for (const lv of GAMIFY.ALL_LEVELS) { if (!mastered.includes(lv)) { first = lv; break; } }

    // 隐藏原有8个 act section（作为实操关内容源保留）
    for (let i = 1; i <= 8; i++) {
      const sec = document.getElementById('act' + i);
      if (sec) sec.style.display = 'none';
    }
    // 隐藏上下半场分隔线与下半场开始横幅
    document.querySelectorAll('.phase-divider').forEach(el => el.style.display = 'none');
    const secondHalfBanner = document.getElementById('secondHalfBanner');
    if (secondHalfBanner) secondHalfBanner.style.display = 'none';

    renderStepMap();
    currentLevel = first;
    renderActivity(currentLevel);
  }

  // ===== 渲染顶部进度地图（13关：5知识关 + 8实操关） =====
  function renderStepMap() {
    const map = document.getElementById('stepMap');
    if (!map) return;
    const mastered = GAMIFY._normalizeLevels(currentProgress.steps || []);
    let html = '';
    // 知识关 K1-K5
    html += '<div class="map-group"><span class="map-group-label">认知</span>';
    for (const lv of GAMIFY.KNOWLEDGE_LEVELS) {
      const isDone = mastered.includes(lv);
      const isCurrent = lv === currentLevel;
      const cls = isDone ? 'done' : (isCurrent ? 'current' : 'todo');
      const mark = isDone ? '✓' : lv.replace('K', '');
      html += `<div class="map-node map-k ${cls}" onclick="APP.goToLevel('${lv}')" title="${lv}：${levelMeta[lv].title}">${mark}</div>`;
    }
    html += '</div><span class="map-sep">→</span><div class="map-group"><span class="map-group-label">实操</span>';
    // 实操关 P1-P8
    for (const lv of GAMIFY.PRACTICE_LEVELS) {
      const isDone = mastered.includes(lv);
      const isCurrent = lv === currentLevel;
      const cls = isDone ? 'done' : (isCurrent ? 'current' : 'todo');
      const mark = isDone ? '✓' : lv.replace('P', '');
      html += `<div class="map-node map-p ${cls}" onclick="APP.goToLevel('${lv}')" title="${lv}：${levelMeta[lv].title}">${mark}</div>`;
    }
    html += '</div>';
    map.innerHTML = html;
    const counter = document.getElementById('mapCounter');
    if (counter) counter.textContent = `已掌握 ${mastered.length}/${GAMIFY.ALL_LEVELS.length}`;
    // 同步更新侧边栏关卡项的完成状态
    updateSidebarProgress(mastered);
  }

  // ===== 更新侧边栏关卡进度状态 =====
  function updateSidebarProgress(mastered) {
    document.querySelectorAll('.nav-item[data-level]').forEach(item => {
      const lv = item.getAttribute('data-level');
      const check = item.querySelector('.nav-check');
      if (!check) return;
      if (mastered.includes(lv)) {
        item.classList.add('completed');
      } else {
        item.classList.remove('completed');
      }
      // 当前关高亮
      if (lv === currentLevel) item.classList.add('active');
      else item.classList.remove('active');
    });
  }

  // ===== 渲染单个关卡活动包 =====
  function renderActivity(levelId) {
    currentLevel = levelId;
    quizPicks = {};  // 切换关卡时重置答题记录
    const view = document.getElementById('activityView');
    if (!view) return;
    const meta = levelMeta[levelId];
    if (!meta) return;
    const mastered = GAMIFY._normalizeLevels(currentProgress.steps || []).includes(levelId);
    const idx = GAMIFY.ALL_LEVELS.indexOf(levelId);
    const prevId = idx > 0 ? GAMIFY.ALL_LEVELS[idx - 1] : null;
    const nextId = idx < GAMIFY.ALL_LEVELS.length - 1 ? GAMIFY.ALL_LEVELS[idx + 1] : null;

    let bodyHTML = '';
    let quizData = null;
    if (meta.type === 'knowledge') {
      // 知识关：科普内容
      const kc = knowledgeContent[levelId];
      bodyHTML = `
        <div class="knowledge-intro">${kc.intro}</div>
        ${kc.metaphor ? `<div class="knowledge-metaphor"><span class="metaphor-icon">💡</span><div><div class="metaphor-label">打个比方</div>${kc.metaphor}</div></div>` : ''}
        <h4 style="font-weight:700;margin:20px 0 10px;">看个对比就懂了</h4>
        ${kc.compare.map(c => `
          <div class="compare-grid">
            <div class="compare-card compare-bad"><div class="compare-label">✗ 普通方式</div><div class="compare-text">${c.bad}</div></div>
            <div class="compare-card compare-good"><div class="compare-label">✓ 正确方式</div><div class="compare-text">${c.good}</div></div>
          </div>`).join('')}
        <div class="tip-box"><strong>一句话记住：</strong>${kc.keypoint}</div>
      `;
      quizData = knowledgeQuizzes[levelId];
    } else {
      // 实操关：从源 section 取内容
      const source = document.getElementById(meta.sourceId);
      if (source) {
        const tmp = document.createElement('div');
        tmp.innerHTML = source.innerHTML;
        tmp.querySelectorAll('.complete-btn').forEach(b => b.remove());
        bodyHTML = tmp.innerHTML;
      }
      quizData = stepQuizzes[meta.sourceId.replace('act', '')];
    }

    const badgeColor = meta.type === 'knowledge' ? 'purple' : (meta.phase === '上半场' ? 'blue' : 'green');
    const timeLabel = meta.time ? ` · ${meta.time}` : '';
    view.innerHTML = `
      <div class="activity">
        <div class="activity-header">
          <div class="activity-meta">
            <span class="section-badge badge-${badgeColor}">${levelId} · ${meta.type === 'knowledge' ? '认知关' : meta.phase}${timeLabel}</span>
            ${meta.subtitle ? `<span class="activity-phase">${meta.subtitle}</span>` : ''}
            ${mastered ? '<span class="activity-mastered">✓ 已掌握</span>' : ''}
          </div>
          <h2 class="activity-title">${meta.title}</h2>
        </div>
        <div class="activity-body">${bodyHTML}</div>
        <div class="activity-quiz" id="quizBlock"></div>
        <div class="activity-nav">
          <button class="nav-btn nav-prev" ${prevId ? `onclick="APP.goToLevel('${prevId}')"` : 'disabled'}>← 上一关</button>
          <div class="nav-nav-middle">
            ${mastered
              ? (nextId
                  ? `<button class="complete-btn done" onclick="APP.goToLevel('${nextId}')">已掌握，进入下一关 →</button>`
                  : `<button class="complete-btn done" onclick="APP.checkAllClear()">查看培训成果 →</button>`)
              : `<button class="complete-btn" onclick="APP.quickComplete('${levelId}')">直接标记完成（跳过小测）</button>`
            }
          </div>
          <button class="nav-btn nav-next" ${nextId ? `onclick="APP.goToLevel('${nextId}')"` : 'disabled'}>下一关 →</button>
        </div>
      </div>
    `;
    renderQuiz(levelId, quizData);
    view.style.display = 'block';
    renderStepMap();
    updateProgressDisplay();
    view.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ===== 渲染随堂小测（每关3题） =====
  function renderQuiz(levelId, quizList) {
    const block = document.getElementById('quizBlock');
    if (!block) return;
    if (!quizList || quizList.length === 0) { block.innerHTML = ''; return; }
    const mastered = GAMIFY._normalizeLevels(currentProgress.steps || []).includes(levelId);
    const questionsHTML = quizList.map((quiz, qi) => `
      <div class="quiz-question-block" data-qidx="${qi}">
        <div class="quiz-q-title">第 ${qi+1} 题 <span class="quiz-q-total">/ ${quizList.length}</span></div>
        <div class="quiz-question">${quiz.q}</div>
        <div class="quiz-options">
          ${quiz.opts.map((o, i) => `<label class="quiz-opt" data-q="${qi}" data-idx="${i}">
            <input type="radio" name="quiz${levelId}_q${qi}" value="${i}" onchange="APP.onQuizPick(${qi}, ${i})">
            <span>${String.fromCharCode(65+i)}. ${o}</span>
          </label>`).join('')}
        </div>
      </div>
    `).join('');
    block.innerHTML = `
      <div class="quiz-box">
        <div class="quiz-title">📝 过关小测 · 共${quizList.length}题（全答对才算过关）</div>
        ${questionsHTML}
        <button class="quiz-submit" id="quizSubmit" onclick="APP.submitQuizHandler('${levelId}')" disabled>提交（需全部答对）</button>
        ${mastered ? '<div class="quiz-passed">✓ 本关已通过小测</div>' : ''}
      </div>
    `;
  }

  // 记录每题选择；全部选完后启用提交按钮
  let quizPicks = {};  // {qIdx: pickedIdx}
  function onQuizPick(qIdx, idx) {
    quizPicks[qIdx] = idx;
    // 高亮当前题的选择
    document.querySelectorAll(`.quiz-opt[data-q="${qIdx}"]`).forEach((el, i) => {
      el.classList.toggle('picked', i === idx);
    });
    // 全部题都选了才启用提交
    const meta = levelMeta[currentLevel];
    const quizList = meta.type === 'knowledge' ? knowledgeQuizzes[currentLevel] : stepQuizzes[meta.sourceId.replace('act','')];
    const allAnswered = quizList && Object.keys(quizPicks).length >= quizList.length;
    const btn = document.getElementById('quizSubmit');
    if (btn) btn.disabled = !allAnswered;
  }

  // ===== 提交小测（3题全对才算过关） =====
  async function submitQuizHandler(levelId) {
    const meta = levelMeta[levelId];
    const quizList = meta.type === 'knowledge' ? knowledgeQuizzes[levelId] : stepQuizzes[meta.sourceId.replace('act','')];
    if (!quizList) return;
    // 逐题判定
    let allCorrect = true;
    let correctCount = 0;
    quizList.forEach((quiz, qi) => {
      const pickedIdx = quizPicks[qi];
      const correctIdx = quiz.answer;
      const opts = document.querySelectorAll(`.quiz-opt[data-q="${qi}"]`);
      opts.forEach((el, i) => {
        el.classList.remove('correct', 'wrong');
        if (i === correctIdx) el.classList.add('correct');
        else if (i === pickedIdx) el.classList.add('wrong');
      });
      if (pickedIdx === correctIdx) correctCount++;
      else allCorrect = false;
    });
    if (!allCorrect) {
      const btn = document.getElementById('quizSubmit');
      if (btn) { btn.textContent = `答对 ${correctCount}/${quizList.length}，再想想（可重新选择）`; btn.disabled = true; }
      setTimeout(() => { const b=document.getElementById('quizSubmit'); if(b){ b.disabled=false; b.textContent='重新提交'; } }, 1500);
      showToast(`答对 ${correctCount}/${quizList.length} 题，全对才算过关，再试一次`, false);
      return;
    }
    // 全对 → 上报
    const btn = document.getElementById('quizSubmit');
    if (btn) { btn.disabled = true; btn.textContent = '提交中...'; }
    try {
      const answers = Object.keys(quizPicks).sort((a,b)=>a-b).map(qi => String.fromCharCode(65 + quizPicks[qi]));
      const result = await API.submitQuiz(levelId, answers);
      if (result.mastered) {
        if (!(currentProgress.steps || []).includes(levelId)) currentProgress.steps.push(levelId);
        currentProgress.points = result.points;
        if (currentUser) currentUser.points = result.points;
        updateUserChip();
        renderBadgesWall();
        renderStepMap();
        showToast(`✓ ${levelId} 已掌握！${quizList.length}题全对，+${GAMIFY.POINT_RULES.LEVEL_COMPLETE}分`, true);
        if (result.newBadges && result.newBadges.length > 0) {
          result.newBadges.forEach(bid => {
            const badge = GAMIFY.BADGE_DEFS.find(b => b.id === bid);
            if (badge) setTimeout(() => showToast(`🏅 获得徽章：${badge.name}！`, true), 600);
          });
        }
        if (result.leveledUp && result.newLevel) showLevelUpModal(result.newLevel);
        checkBonusToast(levelId, result.bonusHit);
        quizPicks = {};  // 重置
        setTimeout(() => goToNextLevel(), 1200);
      } else {
        showToast('本关已掌握', true);
        setTimeout(() => goToNextLevel(), 600);
      }
    } catch(e) {
      const btn = document.getElementById('quizSubmit');
      if (btn) { btn.disabled = false; btn.textContent = '重新提交'; }
      showToast(e.message || '提交失败', false);
    }
  }

  // ===== 快速完成（跳过小测） =====
  async function quickComplete(levelId) {
    const mastered = GAMIFY._normalizeLevels(currentProgress.steps || []);
    if (mastered.includes(levelId)) { goToNextLevel(); return; }
    try {
      const result = await API.setStep(levelId, true);
      if (!(currentProgress.steps || []).includes(levelId)) currentProgress.steps.push(levelId);
      currentProgress.points = result.points;
      if (currentUser) currentUser.points = result.points;
      updateUserChip(); renderBadgesWall(); renderStepMap();
      showToast(`✓ ${levelId} 已完成！+${GAMIFY.POINT_RULES.LEVEL_COMPLETE}分`, true);
      if (result.newBadges && result.newBadges.length > 0) {
        result.newBadges.forEach(bid => {
          const badge = GAMIFY.BADGE_DEFS.find(b => b.id === bid);
          if (badge) setTimeout(() => showToast(`🏅 获得徽章：${badge.name}！`, true), 600);
        });
      }
      if (result.leveledUp && result.newLevel) showLevelUpModal(result.newLevel);
      checkBonusToast(levelId, result.bonusHit);
      setTimeout(() => goToNextLevel(), 800);
    } catch(e) { showToast(e.message || '操作失败', false); }
  }

  // ===== 进入下一关 =====
  function goToNextLevel() {
    const idx = GAMIFY.ALL_LEVELS.indexOf(currentLevel);
    if (idx < GAMIFY.ALL_LEVELS.length - 1) renderActivity(GAMIFY.ALL_LEVELS[idx + 1]);
    else checkAllClear();
  }

  // ===== bonus 提示 =====
  function checkBonusToast(levelId, bonusHit) {
    const levels = GAMIFY._normalizeLevels(currentProgress.steps || []);
    if (levels.length === GAMIFY.ALL_LEVELS.length) {
      setTimeout(() => showToast(`🎉 13关全部完成！+${GAMIFY.POINT_RULES.ALL_CLEAR_BONUS}分通关奖励！`, true), 1000); return;
    }
    if (bonusHit === 'knowledge') setTimeout(() => showToast(`⚡ 5个知识关全通！+${GAMIFY.POINT_RULES.KNOWLEDGE_BONUS}分认知奖励！`, true), 800);
    else if (bonusHit === 'practice') setTimeout(() => showToast(`🏁 8个实操关全通！+${GAMIFY.POINT_RULES.PRACTICE_BONUS}分实战奖励！`, true), 800);
  }

  // ===== 跳转关卡 =====
  function goToLevel(levelId) {
    if (GAMIFY.ALL_LEVELS.indexOf(levelId) < 0) return;
    renderActivity(levelId);
  }
  // 兼容老调用
  function goToStep(n) { goToLevel('P' + n); }

  // ===== 通关结算检查 =====
  function checkAllClear() {
    const mastered = GAMIFY._normalizeLevels(currentProgress.steps || []);
    if (mastered.length >= GAMIFY.ALL_LEVELS.length) renderCompletionScreen();
    else renderActivity(currentLevel);
  }

  // ===== 渲染通关结算页 =====
  function renderCompletionScreen() {
    const view = document.getElementById('activityView');
    if (!view) return;
    const level = GAMIFY.getLevel(currentProgress.points || 0);
    const badges = currentProgress.badges || [];
    view.innerHTML = `
      <div class="completion-screen">
        <div class="completion-trophy">🏆</div>
        <h2 class="completion-title">恭喜！培训通关！</h2>
        <p class="completion-subtitle">你已掌握全部 13 个学习关卡——从写好一个提示词，到打造一个教研智能体，完成 AI 赋能教学的完整跃迁</p>
        <div class="completion-stats">
          <div class="stat-item"><div class="stat-num">${currentProgress.points || 0}</div><div class="stat-label">总积分</div></div>
          <div class="stat-item"><div class="stat-num">Lv.${level.lv}</div><div class="stat-label">${level.name}</div></div>
          <div class="stat-item"><div class="stat-num">${badges.length}/6</div><div class="stat-label">徽章</div></div>
          <div class="stat-item"><div class="stat-num">13/13</div><div class="stat-label">已掌握</div></div>
        </div>
        <div class="completion-actions">
          <button class="complete-btn done" onclick="goSection('showcase')">查看展示与收获</button>
          <button class="complete-btn" onclick="goSection('leaderboard')">查看排行榜</button>
          <button class="complete-btn" onclick="APP.goToLevel('K1')">回顾第1关</button>
        </div>
      </div>
    `;
    view.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }


  function updateUserChip() {
    const chip = document.getElementById('userChip');
    if (!chip || !currentUser) return;
    const level = GAMIFY.getLevel(currentProgress.points || 0);
    const initial = currentUser.name ? currentUser.name[0] : '?';
    chip.innerHTML = `
      <div class="user-avatar lvl-${level.lv}">${initial}</div>
      <div>
        <div class="user-name">${currentUser.name}</div>
        <div style="display:flex;gap:6px;align-items:center;">
          <span class="user-level lvl-${level.lv}">Lv.${level.lv} ${level.name}</span>
          <span class="user-points">${currentProgress.points || 0}分</span>
        </div>
      </div>
      <button class="logout-btn" onclick="AUTH.doLogout()" title="退出登录">⏻</button>
    `;
  }

  function updateModeIndicator() {
    const el = document.getElementById('modeIndicator');
    if (!el) return;
    const online = API.mode === 'online';
    el.className = 'mode-indicator ' + (online ? 'mode-online' : 'mode-offline');
    el.innerHTML = `<span class="mode-dot"></span><span>${online ? '云端已连接' : '本地模式'}</span>`;
  }

  function updateProgressDisplay() {
    const done = (currentProgress.steps || []).length;
    const total = GAMIFY.ALL_LEVELS.length;
    const fill = document.getElementById('progressFill');
    const text = document.getElementById('progressText');
    if (fill) fill.style.width = (done / total * 100) + '%';
    if (text) {
      const level = GAMIFY.getLevel(currentProgress.points || 0);
      text.textContent = `Lv.${level.lv} · ${currentProgress.points || 0}分 · ${done}/${total}关完成`;
    }
    // 单步聚焦模式：同步更新地图计数（含等级/积分信息）
    const counter = document.getElementById('mapCounter');
    if (counter) {
      const level = GAMIFY.getLevel(currentProgress.points || 0);
      counter.textContent = `已掌握 ${done}/${total} · Lv.${level.lv} · ${currentProgress.points || 0}分`;
    }
  }

  function updateTaskBadge() {
    const el = document.getElementById('taskBadge');
    if (!el) return;
    if (currentProgress.task) {
      const data = taskData[currentProgress.task];
      el.textContent = '任务' + currentProgress.task + '：' + data.name;
      el.style.background = 'var(--primary-light)';
      el.style.color = 'var(--primary-dark)';
      el.style.fontWeight = '600';
    } else {
      el.textContent = '未选择任务';
      el.style.background = 'var(--gray-100)';
      el.style.color = 'var(--gray-400)';
      el.style.fontWeight = '400';
    }
  }

  // ===== 步骤完成（兼容旧 act section 内嵌按钮，转调 quickComplete） =====
  async function toggleComplete(stepNum) {
    const levelId = 'P' + stepNum;
    await quickComplete(levelId);
  }

  // ===== 任务选择 =====
  async function selectTask(type, cardEl) {
    try {
      const result = await API.setTask(type);
      currentProgress.task = type;
      currentProgress.points = result.points;
      if (currentUser) currentUser.points = result.points;

      // 更新UI
      document.querySelectorAll('.task-select-card').forEach(c => c.classList.remove('selected'));
      if (cardEl) cardEl.classList.add('selected');

      const tip = document.getElementById('selectTip');
      if (tip) {
        tip.style.display = 'block';
        const nameEl = document.getElementById('selectedTaskName');
        if (nameEl) nameEl.textContent = taskData[type].name;
      }

      updateTaskBadge();
      showTaskBanner(type);
      renderTaskPrompts(type);
      updateProgressDisplay();
      updateUserChip();

      // 更新徽章
      if (result.newBadges && result.newBadges.length > 0) {
        if (!currentProgress.badges) currentProgress.badges = [];
        result.newBadges.forEach(bid => { if (!currentProgress.badges.includes(bid)) currentProgress.badges.push(bid); });
      }
      renderBadgesWall();

      showToast(`已选择任务${type}：${taskData[type].name} +${GAMIFY.POINT_RULES.TASK_SELECT}分`, true);

      if (result.newBadges && result.newBadges.length > 0) {
        result.newBadges.forEach(bid => {
          const badge = GAMIFY.BADGE_DEFS.find(b => b.id === bid);
          if (badge) setTimeout(() => showToast(`🏅 获得徽章：${badge.name}！`, true), 500);
        });
      }
      if (result.leveledUp && result.newLevel) {
        showLevelUpModal(result.newLevel);
      }
    } catch(e) {
      showToast(e.message || '选择任务失败', false);
    }
  }

  function showTaskBanner(type) {
    const banner = document.getElementById('myTaskBanner');
    if (!banner) return;
    banner.classList.add('show');
    const data = taskData[type];
    document.getElementById('bannerTitle').textContent = '我的任务：' + data.name;
    document.getElementById('bannerDesc').textContent = `目标产出：${data.deliverable || data.desc}`;
  }

  function renderTaskPrompts(type) {
    const data = taskData[type];
    const container = document.getElementById('taskContent');
    const noTask = document.getElementById('noTaskSelected');
    if (!container) return;
    if (noTask) noTask.style.display = 'none';
    container.style.display = 'block';
    container.innerHTML = `
      <div class="card card-purple">
        <div class="card-header"><div class="card-title"><span class="section-badge ${data.color}">任务${type}</span> ${data.name}</div></div>
        <p style="font-size:14px;color:var(--gray-600);margin-bottom:12px;">${data.desc}</p>
        <div class="task-outcome">
          <strong>完成标准</strong>
          <span>${data.deliverable || data.desc}；内容已结合你的真实课题，并经过至少一次修改。</span>
        </div>
        <div class="info-box"><strong>使用方法：</strong>按顺序复制下面的提示词到WorkBuddy，先替换方括号内容，再发送。每次拿到结果后先检查，再进入下一条。</div>
        ${data.prompts.map((p, i) => `
          <div style="margin-top:16px;">
            <h4 style="font-weight:700;font-size:15px;margin-bottom:8px;">${i+1}. ${p.label}</h4>
            <div class="prompt-block">
              <div class="prompt-header"><span class="prompt-label">${p.label} · 点击复制</span><button class="copy-btn" onclick="APP.copyPrompt(this)">复制</button></div>
              <div class="prompt-code">${escapeHtml(p.code)}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderAllTemplates() {
    const container = document.getElementById('allTemplatesContainer');
    if (!container) return;
    container.innerHTML = allTemplates.map(t => {
      if (t.isSkill) {
        return `<div class="card card-accent"><div class="card-header"><div class="card-title"><span style="font-size:24px;">${t.icon}</span> 模板${t.id}：${t.name}</div><span class="section-badge badge-orange">${t.scene}</span></div><p style="font-size:14px;color:var(--gray-600);margin-bottom:12px;">从高频教学需求中挑选适合沉淀的Skill。</p><p style="font-size:14px;color:var(--primary-dark);font-weight:600;">请查看「技能使用指南」和第七步案例，学习如何把需求设计成可复用工作流。</p><button class="copy-btn" style="margin-top:12px;" onclick="goSection('skillguide')">前往技能指南</button></div>`;
      }
      return `<div class="card"><div class="card-header"><div class="card-title"><span style="font-size:24px;">${t.icon}</span> 模板${t.id}：${t.name}</div><span class="section-badge badge-blue">${t.scene}</span></div><div class="prompt-block"><div class="prompt-header"><span class="prompt-label">提示词 · 点击复制</span><button class="copy-btn" onclick="APP.copyPrompt(this)">复制</button></div><div class="prompt-code">${escapeHtml(t.code)}</div></div></div>`;
    }).join('');
  }

  function renderSkillDetails() {
    const container = document.getElementById('skillDetailsContainer');
    if (!container) return;
    container.innerHTML = skillDetails.map(s => `<div class="card"><div class="card-header"><div class="card-title"><span style="font-size:24px;">${s.icon}</span> ${s.name}</div><span class="section-badge badge-blue">优先级 ${s.priority}</span></div><p style="font-size:14px;color:var(--gray-500);margin-bottom:12px;">适用场景：${s.scenes}</p><div class="table-wrap"><table><tbody><tr><td><strong>老师需要提供</strong></td><td>${s.input}</td></tr><tr><td><strong>建议输出</strong></td><td>${s.output}</td></tr></tbody></table></div></div>`).join('');
  }

  // ===== 教师需求图谱 =====
  function renderDemandAtlas() {
    const container = document.getElementById('demandAtlasContainer');
    if (!container) return;
    const order = ['A', 'B', 'C'];
    container.innerHTML = order.map(key => {
      const tier = demandAtlas[key];
      const items = tier.items.map(it => {
        // 若该需求有对应任务，显示"进入任务"链接
        const taskLink = it.task
          ? `<button class="copy-btn" style="margin-left:8px;font-size:12px;padding:4px 12px;" onclick="APP.selectTask('${it.task}');goSection('mytask')">做任务${it.task} →</button>`
          : '';
        return `<div class="demand-item">
          <div class="demand-need">${it.need}</div>
          <div class="demand-meta">
            <span class="section-badge badge-purple" style="font-size:11px;">${it.subject}</span>
            <span style="font-size:12px;color:var(--ink-faint);">${it.tech}</span>
          </div>
          ${taskLink}
        </div>`;
      }).join('');
      return `<div class="demand-tier ${key.toLowerCase()}">
        <div class="demand-tier-header">
          <span class="demand-tier-icon">${tier.icon}</span>
          <div>
            <div class="demand-tier-name">${tier.name} <span class="demand-tier-count">${tier.items.length}项</span></div>
            <div class="demand-tier-desc">${tier.desc}</div>
          </div>
        </div>
        <div class="demand-items">${items}</div>
      </div>`;
    }).join('');
  }

  // ===== 徽章墙 =====
  function renderBadgesWall() {
    const container = document.getElementById('badgesWall');
    if (!container) return;
    const earned = currentProgress.badges || [];
    container.innerHTML = GAMIFY.BADGE_DEFS.map(b => {
      const has = earned.includes(b.id);
      return `<div class="badge-item ${has ? 'earned' : 'locked'}">
        <div class="badge-icon">${b.icon}</div>
        <div class="badge-name">${b.name}</div>
        <div class="badge-desc">${b.desc}</div>
        <div class="badge-status ${has ? 'earned' : 'locked'}">${has ? '已获得' : '未解锁'}</div>
      </div>`;
    }).join('');
  }

  // ===== 排行榜 =====
  async function renderLeaderboard() {
    const container = document.getElementById('leaderboardContainer');
    if (!container) return;
    try {
      const list = await API.getLeaderboard();
      if (!list || list.length === 0) {
        container.innerHTML = `<div class="leaderboard-empty">
          <p style="font-size:32px;">📊</p>
          <p>${API.mode === 'online' ? '暂无排行数据' : '排行榜需要连接后端服务器'}</p>
          <p style="font-size:13px;">${API.mode === 'online' ? '等待更多学员加入后显示排名' : '启动后端服务后可查看全校/全组排行'}</p>
        </div>`;
        return;
      }
      const rankClass = ['gold', 'silver', 'bronze'];
      container.innerHTML = `<div class="leaderboard-list">` + list.map((item, i) => {
        const level = GAMIFY.getLevel(item.points || 0);
        const isMe = currentUser && item.userId == currentUser.id;
        const initial = (item.name || '?')[0];
        const stepCount = Array.isArray(item.steps) ? item.steps.length : (item.steps || 0);
        return `<div class="leaderboard-row ${isMe ? 'me' : ''}">
          <div class="lb-rank ${i < 3 ? rankClass[i] : ''}">${i + 1}</div>
          <div class="lb-user">
            <div class="lb-avatar lvl-${level.lv}">${initial}</div>
            <div>
              <div class="lb-name">${item.name}${isMe ? ' (我)' : ''}</div>
              <div class="lb-steps">${stepCount}/13关</div>
            </div>
          </div>
          <span class="lb-level lvl-${level.lv}">Lv.${level.lv}</span>
          <div class="lb-points">${item.points || 0}分</div>
        </div>`;
      }).join('') + `</div>`;
    } catch(e) {
      container.innerHTML = `<div class="leaderboard-empty"><p>排行榜加载失败</p></div>`;
    }
  }

  // ===== 升级弹窗 =====
  function showLevelUpModal(newLevel) {
    const overlay = document.createElement('div');
    overlay.className = 'levelup-overlay';
    overlay.innerHTML = `
      <div class="levelup-card">
        <div class="levelup-icon">🎉</div>
        <div class="levelup-title">恭喜升级！</div>
        <div class="levelup-subtitle">你的等级已提升</div>
        <div class="levelup-badge lvl-${newLevel.lv}">Lv.${newLevel.lv} ${newLevel.name}</div>
      </div>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('show'), 50);
    setTimeout(() => {
      overlay.classList.remove('show');
      setTimeout(() => overlay.remove(), 300);
    }, 2500);
  }

  // ===== 工具函数 =====
  function escapeHtml(text) { const d = document.createElement('div'); d.textContent = text; return d.innerHTML; }

  // ===== 移动端导航抽屉 =====
  function openSidebar() {
    const s = document.getElementById('sidebar'); if (!s) return;
    const o = document.getElementById('sidebarOverlay');
    s.classList.add('open'); if (o) o.classList.add('show');
  }
  function closeSidebar() {
    const s = document.getElementById('sidebar'); if (!s) return;
    const o = document.getElementById('sidebarOverlay');
    s.classList.remove('open'); if (o) o.classList.remove('show');
  }
  function toggleSidebar() {
    const s = document.getElementById('sidebar');
    if (s && s.classList.contains('open')) closeSidebar(); else openSidebar();
  }

  function scrollTo(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const nav = document.querySelector(`.nav-item[data-target="${id}"]`);
    if (nav) nav.classList.add('active');
    // 移动端跳转后自动收起抽屉
    if (window.innerWidth <= 768) closeSidebar();
  }
  function copyPrompt(btn) {
    const codeEl = btn.closest('.prompt-block').querySelector('.prompt-code');
    const text = codeEl.textContent;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => onCopyDone(btn)).catch(() => fallbackCopy(text, btn));
    } else { fallbackCopy(text, btn); }
  }
  // 复制成功后：计数 + 检查"探索者"徽章
  function onCopyDone(btn) {
    showCopySuccess(btn);
    checkExplorerBadge();
  }
  // 复制满3次 → 解锁 explorer
  async function checkExplorerBadge() {
    if ((currentProgress.badges || []).includes('explorer')) return;
    let cnt = 0;
    try { cnt = parseInt(localStorage.getItem('ml_copy_count') || '0', 10) + 1; } catch(e) { cnt = 1; }
    try { localStorage.setItem('ml_copy_count', String(cnt)); } catch(e) {}
    if (cnt < 3) return;
    try {
      const result = await API.awardExplorer();
      if (result && result.awarded) {
        if (!currentProgress.badges) currentProgress.badges = [];
        if (!currentProgress.badges.includes('explorer')) currentProgress.badges.push('explorer');
        if (result.points != null) currentProgress.points = result.points;
        renderBadgesWall(); updateUserChip(); updateProgressDisplay();
        if (result.leveledUp && result.newLevel) showLevelUpModal(result.newLevel);
        setTimeout(() => showToast('🏅 获得徽章：探索者！（累计复制3次提示词）', true), 600);
      }
    } catch(e) { /* 离线已本地计算，忽略 */ }
  }
  function fallbackCopy(text, btn) {
    const ta = document.createElement('textarea'); ta.value = text; ta.style.position='fixed'; ta.style.opacity='0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); showCopySuccess(btn); } catch(e) { showToast('复制失败，请手动选择', false); }
    document.body.removeChild(ta);
  }
  function showCopySuccess(btn) {
    const orig = btn.textContent; btn.textContent = '✓ 已复制'; btn.classList.add('copied');
    showToast('已复制到剪贴板，粘贴到WorkBuddy对话框即可使用', true);
    setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 2000);
  }
  function showToast(msg, success) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.className = 'toast show' + (success ? ' success' : '');
    setTimeout(() => { t.className = 'toast' + (success ? ' success' : ''); }, 3000);
  }

  // ===== 滚动监听 =====
  function initScrollListener() {
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const sections = document.querySelectorAll('.section');
        let current = '';
        sections.forEach(s => { const r = s.getBoundingClientRect(); if (r.top < 120 && r.bottom > 120 && s.id) current = s.id; });
        if (current) {
          document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
          const nav = document.querySelector(`.nav-item[data-target="${current}"]`);
          if (nav) nav.classList.add('active');
        }
      }, 100);
    });
  }

  // ===== 拓展学习资源数据 =====
  const learningResources = {
    knowledge: {
      name: '知识库工具', icon: '📚', desc: '把课标、教材、校本资料上传给AI，让它基于你的资料回答，不凭空编造',
      items: [
        { name: 'NotebookLM', icon: '📓', tag: 'Google', desc: 'Google推出的AI笔记本工具，上传PDF/文档/视频后可基于资料对话、生成学习指南和思维导图', url: 'https://notebooklm.google.com/' },
        { name: 'IMA Copilot', icon: '💡', tag: '腾讯', desc: '腾讯智能学习助手，基于个人知识库回答问题，支持多格式文档上传和智能问答', url: 'https://ima.qq.com/' },
        { name: 'Obsidian', icon: '🗂️', tag: '本地', desc: '强大的本地知识管理工具，支持双向链接和图谱视图，搭配AI插件可实现智能笔记', url: 'https://obsidian.md/' },
        { name: '飞书文档', icon: '📄', tag: '字节', desc: '协作文档工具，内置AI助手，支持文档智能摘要、翻译和内容生成', url: 'https://www.feishu.cn/product/docs' },
      ]
    },
    agent: {
      name: 'Agent工具', icon: '🤖', desc: 'AI智能体平台，可创建专门服务教学任务的AI助手，串联工作流',
      items: [
        { name: '扣子 Coze', icon: '🧩', tag: '字节', desc: '字节推出的AI Bot开发平台，可创建Bot、知识库、工作流和应用页面，适合搭建教学工具', url: 'https://www.coze.cn/' },
        { name: 'WorkBuddy', icon: '⚡', tag: '本平台', desc: '腾讯云推出的全场景桌面AI智能体，可处理资料、拆解任务、调用技能并交付可检查的工作成果', url: 'https://workbuddy.com' },
        { name: 'Qoder', icon: '🔧', tag: '阿里', desc: '阿里推出的AI编程助手，支持代码生成、调试和重构，适合信息技术教师使用', url: 'https://qoder.com/' },
        { name: 'Trae', icon: '🎯', tag: '字节', desc: '字节推出的AI IDE，集成多种AI能力，支持智能编程和项目协作', url: 'https://www.trae.ai/' },
        { name: 'Claude', icon: '🎭', tag: 'Anthropic', desc: 'Anthropic的AI助手，擅长长文本分析和写作，适合教案撰写、作文诊断和学情分析', url: 'https://claude.ai/' },
        { name: 'ChatGPT', icon: '💬', tag: 'OpenAI', desc: 'OpenAI的AI助手，支持数据分析、网页浏览、文件处理和文档总结，教育场景丰富', url: 'https://chatgpt.com/' },
      ]
    },
    skills: {
      name: '技能市场', icon: '🛠️', desc: 'AI技能和插件市场，扩展AI能力，把高频教学需求沉淀成可复用工作流',
      items: [
        { name: '扣子插件商店', icon: '🏪', tag: '扣子', desc: '扣子平台的插件市场，提供搜索、图片生成、代码运行等丰富插件，可接入Bot使用', url: 'https://www.coze.cn/store/plugin' },
        { name: 'WorkBuddy技能', icon: '⚙️', tag: '本平台', desc: 'WorkBuddy支持通过Skills沉淀重复任务，适合把备课、错题诊断、学情总结等流程标准化', url: 'https://workbuddy.com' },
        { name: '飞书多维表格', icon: '📊', tag: '字节', desc: '低代码数据协作工具，配合AI可实现成绩管理、错题分析、学情追踪的自动化', url: 'https://www.feishu.cn/product/base' },
        { name: 'Kimi+助手', icon: '🌙', tag: '月之暗面', desc: 'Kimi推出的AI助手集合，提供PPT生成、搜索增强、学术检索等专用智能体', url: 'https://kimi.moonshot.cn/' },
      ]
    },
    prompts: {
      name: '提示词框架', icon: '📝', desc: '系统化的提示词编写方法论，让AI输出更精准、更可控',
      items: [
        { name: 'CRISPE框架', icon: '🎯', tag: '方法论', desc: 'Capacity(能力)+Role(角色)+Insight(洞察)+Statement(指令)+Personality(个性)+Experiment(实验)，六维度构建高质量提示词', url: 'https://praxislibrary.com/learn/crispe.html' },
        { name: 'RTF框架', icon: '⚙️', tag: '方法论', desc: 'Role(角色)+Task(任务)+Format(格式)，最简洁实用的提示词三要素框架，适合入门', url: 'https://promptengineering.org/' },
        { name: '思维链CoT', icon: '🔗', tag: '推理', desc: 'Chain-of-Thought，让AI"逐步思考"，在数学解题、错因分析等场景显著提升准确率', url: 'https://arxiv.org/abs/2201.11903' },
        { name: '少样本提示', icon: '📋', tag: '技巧', desc: 'Few-Shot Prompting，在提示词中给出2-3个示例，让AI模仿格式和风格输出', url: 'https://www.promptingguide.ai/techniques/fewshot' },
        { name: '提示词工程指南', icon: '📖', tag: '综合', desc: '系统学习提示词工程的在线指南，覆盖基础到高级技巧，含大量教育场景示例', url: 'https://www.promptingguide.ai/zh' },
      ]
    }
  };

  // 8个步骤的拓展资源映射
  const stepResources = {
    1: [ // 提示词入门
      { name: '提示词工程指南', icon: '📖', tag: '综合', desc: '系统学习提示词编写的在线指南，从基础到高级技巧，含教育场景示例', url: 'https://www.promptingguide.ai/zh' },
      { name: 'CRISPE框架', icon: '🎯', tag: '方法论', desc: '六维度构建高质量提示词：能力+角色+洞察+指令+个性+实验', url: 'https://praxislibrary.com/learn/crispe.html' },
    ],
    2: [ // 首次上手
      { name: 'WorkBuddy入门', icon: '⚡', tag: '本平台', desc: '了解WorkBuddy这类智能体能做什么：从教学设计到写代码、做表格、当办公助理', url: 'https://workbuddy.com' },
      { name: 'NotebookLM', icon: '📓', tag: 'Google', desc: '体验Google的AI笔记本工具，上传教材后基于资料对话', url: 'https://notebooklm.google.com/' },
    ],
    3: [ // 认识能力
      { name: '扣子 Coze', icon: '🧩', tag: 'Agent', desc: '了解Bot、知识库、工作流、页面四层能力，对比WorkBuddy的对话即任务模式', url: 'https://www.coze.cn/' },
      { name: 'IMA Copilot', icon: '💡', tag: '知识库', desc: '腾讯智能学习助手，体验个人知识库+AI问答的教学应用', url: 'https://ima.qq.com/' },
      { name: 'Claude', icon: '🎭', tag: 'AI助手', desc: '体验Anthropic的AI助手，擅长长文本分析和教案撰写', url: 'https://claude.ai/' },
    ],
    4: [ // 观看演示
      { name: 'ChatGPT Edu', icon: '🎓', tag: 'OpenAI', desc: '了解ChatGPT教育版功能：数据分析、课程定制、文档总结', url: 'https://chatgpt.com/business/education/' },
      { name: 'Kimi+助手', icon: '🌙', tag: '智能体', desc: '体验Kimi的PPT生成、搜索增强等专用智能体', url: 'https://kimi.moonshot.cn/' },
    ],
    5: [ // 生成第一版
      { name: '提示词模板库', icon: '📋', tag: '本站', desc: '本平台的7个提示词模板，点击复制即可使用', url: '#alltemplates' },
      { name: 'RTF框架', icon: '⚙️', tag: '方法论', desc: 'Role+Task+Format三要素框架，快速写出结构化提示词', url: 'https://promptengineering.org/' },
    ],
    6: [ // 优化迭代
      { name: '少样本提示', icon: '📋', tag: '技巧', desc: '在提示词中给出2-3个示例让AI模仿格式，提升输出质量', url: 'https://www.promptingguide.ai/techniques/fewshot' },
      { name: '思维链CoT', icon: '🔗', tag: '推理', desc: '让AI逐步思考，在错因分析和教学设计中显著提升准确率', url: 'https://arxiv.org/abs/2201.11903' },
    ],
    7: [ // 审核初稿
      { name: 'UNESCO AI教师指南', icon: '🌍', tag: '伦理', desc: '联合国教科文组织《教育中生成式AI指南》，强调以人为本和教师审核', url: 'https://www.unesco.org/en/articles/guidance-generative-ai-education-and-research' },
      { name: 'UNESCO教师AI能力框架', icon: '📐', tag: '能力', desc: '教师在人本理念、伦理、AI基础与应用等五个维度的能力发展指南', url: 'https://www.unesco.org/en/articles/ai-competency-framework-teachers' },
    ],
    8: [ // 生成成品
      { name: '扣子插件商店', icon: '🏪', tag: '技能', desc: '探索扣子平台的插件市场，扩展Bot的成品生成能力', url: 'https://www.coze.cn/store/plugin' },
      { name: '飞书多维表格', icon: '📊', tag: '数据', desc: '用低代码表格+AI实现成绩管理、错题分析的自动化', url: 'https://www.feishu.cn/product/base' },
      { name: 'Obsidian', icon: '🗂️', tag: '知识', desc: '用本地知识管理工具沉淀教研成果，搭配AI插件智能检索', url: 'https://obsidian.md/' },
    ],
  };

  // ===== 渲染拓展资源卡片 =====
  function renderResourceCard(item) {
    const tagColor = { 'Google':'badge-blue','腾讯':'badge-teal','字节':'badge-purple','本平台':'badge-orange','Anthropic':'badge-pink','OpenAI':'badge-green','阿里':'badge-orange','本地':'badge-gray','扣子':'badge-purple','方法论':'badge-blue','推理':'badge-teal','技巧':'badge-green','综合':'badge-blue','智能体':'badge-purple','Agent':'badge-purple','知识库':'badge-teal','AI助手':'badge-pink','伦理':'badge-orange','能力':'badge-blue','技能':'badge-orange','数据':'badge-teal','知识':'badge-purple','月之暗面':'badge-blue' };
    const tc = tagColor[item.tag] || 'badge-blue';
    const isInternal = item.url && item.url.startsWith('#');
    const linkAttr = isInternal ? `onclick="goSection('${item.url.slice(1)}')"` : `href="${item.url}" target="_blank" rel="noopener"`;
    const linkTag = isInternal ? 'a' : 'a';
    return `<div class="resource-card">
      <div class="resource-card-top">
        <span class="resource-icon">${item.icon}</span>
        <span class="resource-name">${item.name}</span>
        <span class="section-badge ${tc}" style="margin-left:auto;">${item.tag}</span>
      </div>
      <div class="resource-desc">${item.desc}</div>
      <${linkTag} class="resource-link" ${linkAttr}>${isInternal ? '前往查看' : '访问官网'} →</${linkTag}>
    </div>`;
  }

  // ===== 为各步骤渲染拓展资源 =====
  function renderStepResources(sectionId, stepNum) {
    const container = document.getElementById('resources_' + sectionId);
    if (!container) return;
    const resources = stepResources[stepNum] || [];
    if (resources.length === 0) return;
    container.innerHTML = `
      <div class="step-resources">
        <div class="resource-section-title">🌱 拓展学习 · 深入了解本步骤相关工具和资源</div>
        <div class="resource-grid">
          ${resources.map(r => renderResourceCard(r)).join('')}
        </div>
      </div>`;
  }

  // ===== 渲染拓展学习中心 =====
  function renderLearningHub() {
    const container = document.getElementById('learnhubContainer');
    if (!container) return;
    const cats = ['knowledge', 'agent', 'skills', 'prompts'];
    container.innerHTML = cats.map(key => {
      const cat = learningResources[key];
      return `<div class="category-card" onclick="goSection('toolhub_${key}')">
        <div class="category-icon">${cat.icon}</div>
        <div class="category-name">${cat.name}</div>
        <div class="category-count">${cat.items.length} 个资源</div>
        <div class="category-desc">${cat.desc}</div>
      </div>`;
    }).join('');
  }

  // ===== 渲染工具资源库详细页 =====
  function renderResourceLibrary() {
    const container = document.getElementById('toolhubContainer');
    if (!container) return;
    const cats = ['knowledge', 'agent', 'skills', 'prompts'];
    container.innerHTML = cats.map(key => {
      const cat = learningResources[key];
      return `<div class="card" id="toolhub_${key}">
        <div class="card-header">
          <div class="card-title"><span style="font-size:24px;">${cat.icon}</span> ${cat.name}</div>
          <span class="section-badge badge-blue">${cat.items.length} 个资源</span>
        </div>
        <p style="font-size:14px;color:var(--gray-600);margin-bottom:16px;">${cat.desc}</p>
        <div class="resource-grid">
          ${cat.items.map(item => renderResourceCard(item)).join('')}
        </div>
      </div>`;
    }).join('');
  }

  return { init, onLoginSuccess, toggleComplete, selectTask, copyPrompt, scrollTo, showToast, renderLeaderboard, renderLearningHub, renderResourceLibrary, openSidebar, closeSidebar, toggleSidebar, checkExplorerBadge, renderActivity, renderStepMap, goToLevel, goToStep, onQuizPick, submitQuizHandler, quickComplete, checkAllClear, renderDemandAtlas };
})();

// 全局暴露（供HTML onclick调用）
// 注意：必须用 window.scrollTo 显式赋值覆盖浏览器原生方法，
// 用 function 声明无法可靠覆盖原生 window.scrollTo，会导致内联 onclick 失效
window.scrollTo = function(id) {
  // act1~act8 在单步聚焦模式下已隐藏，改走活动包跳转
  const m = /^act([1-8])$/.exec(id);
  if (m && typeof APP !== 'undefined' && APP.goToStep) { APP.goToStep(parseInt(m[1], 10)); return; }
  if (typeof APP !== 'undefined' && APP.scrollTo) APP.scrollTo(id);
};
// 独立别名（绝不与原生方法冲突，作为内联 onclick 的主入口）
window.goSection = window.scrollTo;
