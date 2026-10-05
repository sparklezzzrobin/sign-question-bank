# 专题三 ｜ 傅里叶变换、SSB 调制与抽样系统

> **模块定位**（源自指导文件）：分值高达 30~45 分，武大必考压轴核心！极重图形演变、移相法单边带调制与抽样恢复定理。
>
> **刷法**：性质运算题牢记"先移位后尺度、先微分后积分"的操作顺序与对偶表；SSB 题把上 / 下支路频谱分开画再叠加；抽样题按"带宽 → $\omega_s \ge 2\omega_m$ → 恢复滤波器"三步走。

**收录情况**：2013~2026 全部傅氏 / 调制 / 抽样题（六个专题中题量最大）。早年卷题干转录自《936 真题题库》存档（`pdf/信号与系统题库（含部分答案）.html`），2020 / 2018 两卷附带题库原有解答。部分早年题的波形图未随存档保留，卡片中已注明。

---

## 考频总览

| 年份 | 题号 | 考点 | 状态 |
| :---: | :---: | :--- | :---: |
| 2026 | 四 / 五 / 六 / 七 | 稳态频响 / 性质 / 抽样 / 混频 | ✅ 含解析 |
| 2025 | 七 / 八 / 九 | 性质定理 / 冲激抽样 / SSB | ✅ |
| 2024 | 六 / 七 | 性质综合 / 脉冲抽样 | ✅ |
| 2023 | 六 / 七 / 八 | 性质 / 抽样恢复 / 微分滤波器 | ✅ |
| 2022 | 六 / 七 / 八 | 奈奎斯特 / 低通滤波 / 带通 h(t) | ✅ 含解析 |
| 2021 | 五 / 六 | 理想滤波器响应 / 周期信号与 FT | ✅ 题干补全 |
| 2020 | 二 / 七 / 八 / 十五 | FT性质 / 采样率 / 性质速算 / 调制解调 | ✅ 含解析 |
| 2018 | 七 / 八 | 能谱与截止频率 / 孔径效应 | △ 题干完整 |
| 2017 | 三 / 四 / 五 | 性质与帕塞瓦尔 / 采样定理 / 周期频响 | △ |
| 2016 | 四 / 五 | FS 与 FT 关系 / 采样与恢复 | △ |
| 2015 | 四 / 五 | 频谱求输出 / 滤波器与抽样 | △ |
| 2014 | 三 / 五 / 六 | 三角脉冲调制 / 多路复用 / 调幅恢复 | △ |
| 2013 | 三 / 四 / 九 | 带通信号频谱 / 奇偶虚实 / 抽样滤波 | △ |

---

## 3.1 傅里叶变换性质综合运算

### 3.1.1 对偶性与对称性反推时域波形

#### 2023 · 第 6 题（12 分）｜ 傅里叶变换性质综合运算

> **出处** [2023 年卷](../按年份编排/2023年武汉大学936信号与系统真题及解析.md)

**题干**

已知 $x(t) \leftrightarrow X(j\omega)$，利用性质求下列信号的傅里叶变换：

(1) $x_1(t) = x(3-t) + x(-2-t)$；
(2) $x_2(t) = x(2t-7)$；
(3) $x_3(t) = \dfrac{\mathrm{d}^2}{\mathrm{d}t^2} x(2t-3)$。

<details>
<summary><b>展开解析</b>（先自己完整做一遍再看）</summary>

(1) 时移与反折性质：$X_1(j\omega) = X(-j\omega)(e^{-j3\omega} + e^{j2\omega})$；

(2) 尺度与时移：$X_2(j\omega) = \dfrac{1}{2} X\left(\dfrac{j\omega}{2}\right) e^{-j\frac{7}{2}\omega}$；

(3) 结合频域二次微分因子 $(j\omega)^2$ 与尺度变换展开。

</details>

---

#### 2025 · 第 7 题（15 分）｜ 傅里叶变换性质定理（三小题）

> **细分** 3.1.1 ＋ 3.1.2（第 2 问参见 3.1.2） ・ **原图** `images/2025_q7_xt.png`（原始材料中该切片缺失，请对照 PDF） ・ **出处** [2025 年卷](../按年份编排/2025年武汉大学936信号与系统真题及解析.md)

**题干**

利用傅里叶变换性质计算：

1. 已知一个时间信号 $x(t)$ 如下图所示，求该时间信号的傅里叶变换 $X(j\omega)$；（5分）
2. 已知一个信号的傅里叶变换为 $X(j\omega) = \dfrac{j\omega}{(1+j\omega)^2}$，求其时域表达式 $x(t)$；（5分）
3. 已知一个信号傅氏变换为 $X(j\omega) = \dfrac{4\sin(2\omega - 4)}{2\omega - 4} + \dfrac{4\sin(2\omega + 4)}{2\omega + 4}$，求其时域表达式 $x(t)$。（5分）

<details>
<summary><b>展开解析</b>（先自己完整做一遍再看）</summary>

1. 对称三角波直接查基本对：$\Lambda(t) \leftrightarrow \text{Sa}^2(\omega/2)$。
2. 频域微分性质：$t e^{-t}u(t) \leftrightarrow \dfrac{1}{(1+j\omega)^2}$，乘以 $j\omega$ 对应时域一阶导数：$x(t) = \dfrac{\mathrm{d}}{\mathrm{d}t}[t e^{-t}u(t)] = (1-t)e^{-t}u(t)$。
3. 频移定理与门函数对偶：$4\,\text{Sa}(2\omega)$ 对应宽度为 4 的门函数 $g_4(t)$，左右搬移 $\omega_0 = 2$ 对应时域调制项 $2\cos(2t)$，得 $x(t) = 2[u(t+2)-u(t-2)]\cos(2t)$。

</details>

---

#### 2022 · 第 8 题（20 分）｜ 连续理想带通滤波器冲激响应

> **出处** [2022 年卷](../按年份编排/2022年武汉大学936信号与系统真题及解析.md)

**题干**

已知一个连续时间理想低通滤波器的频域函数为

$$H(j\omega)=\begin{cases}1, & |\omega|\le\omega_c\\ 0, & \text{其他}\end{cases}$$

（答案卷题面印作"理想带通滤波器"且条件排印为"$\omega_c\le\omega_c$"，按其解法应为 $|\omega|\le\omega_c$；年份卷旧抄录的"$-g(t)$"系笔误，正确条件如下。）如果该滤波器的冲激响应是 $h(t)$，求函数 $g(t)$，使得 $h(t)=\dfrac{\sin(\omega_c t)}{\pi t}\,g(t)$。

<details>
<summary><b>展开解析</b>（答案卷原解答）</summary>

根据常用变换对 $E\tau\,\text{sa}\left(\dfrac{\tau t}{2}\right)\leftrightarrow 2\pi E\,G_\tau(\omega)$，得

$$\frac{\sin(\omega_c t)}{\pi t}=\frac{\omega_c}{\pi}\,\text{sa}(\omega_c t)\ \leftrightarrow\ G_{2\omega_c}(\omega)$$

根据频域卷积定义（时域相乘 ↔ 频域卷积），有

$$H(j\omega)=\frac{1}{2\pi}\,G_{2\omega_c}(\omega)*G(\omega)=G_{2\omega_c}(\omega)$$

则有 $G(\omega)=2\pi\delta(\omega)$，时域形式为

$$\boxed{g(t)=1}$$

</details>

---

#### 2020 · 第 8 题 ｜ 傅氏变换性质速算（三角波四连问）

> **题源** 936 题库存档（附原博主解答） ・ **原图** [题库图8](https://pic2.zhimg.com/80/v2-3ad7fa8c72c3bccb075bcaf8ee94d562_1440w.png) ・ **出处** [2020 年卷](../按年份编排/2020年武汉大学936信号与系统真题及解析.md)

**题干**

信号 $f(t)$ 的图形如下（三角形脉冲的平移，见原图），已知其傅氏变换为 $F[f(t)]=F(\omega)=|F(\omega)|e^{j\varphi(\omega)}$。不做积分运算的情况下，利用傅氏变换性质求：

(1) $\varphi(\omega)$；
(2) $F(0)$；
(3) $\displaystyle\int_{-\infty}^{\infty}F(\omega)\,\mathrm{d}\omega$；
(4) $F^{-1}[\mathrm{Re}\,F(\omega)]$ 的图形。

<details>
<summary><b>展开解析</b>（题库原解答）</summary>

(1) 原信号可看作关于 y 轴对称的三角形脉冲的平移（延时 $t_0$）。原信号为实偶函数，相频特性为 0，延时后发生相移 $e^{-j\omega t_0}$，故 $\varphi(\omega)=-\omega t_0$（题库按其图中延时记为 $\varphi(\omega)=-\omega$）。

(2) $F(0)=\displaystyle\int_{-\infty}^{\infty}f(t)\,\mathrm{d}t=4$（波形面积，见原图）。

(3) 由对偶：$f(0)=\dfrac{1}{2\pi}\displaystyle\int_{-\infty}^{\infty}F(\omega)\mathrm{d}\omega$，故 $\displaystyle\int_{-\infty}^{\infty}F(\omega)\mathrm{d}\omega=2\pi f(0)=2\pi$。

(4) 实部频谱对应偶分量：$f_e(t)\leftrightarrow \mathrm{Re}\,F(\omega)$，$f_o(t)\leftrightarrow j\,\mathrm{Im}\,F(\omega)$，其中 $f_e(t)=\dfrac{f(t)+f(-t)}{2}$。故 $F^{-1}[\mathrm{Re}\,F(\omega)]$ 是原三角波与其镜像的叠加（双倍宽度的偶对称梯形 / 三角形）。

</details>

---

#### 2017 · 第 3 题 ｜ 波形变换与帕塞瓦尔积分

> **题源** 936 题库存档 ・ **原图** 未随存档保留 ・ **出处** [2017 年卷](../按年份编排/2017年武汉大学936信号与系统真题及解析.md)

**题干**

已知 $g(t)$ 如下图所示：

(1) 画出 $f(t)=g(1-2t)$ 的波形；
(2) 求积分 $\displaystyle\int_{-\infty}^{\infty}|F(\omega)|^2\,\mathrm{d}\omega$ 的值。

> △ 题库未附解析。（提示：第 (2) 问用帕塞瓦尔 $\int|F|^2\mathrm{d}\omega=2\pi\int g^2(t)\mathrm{d}t$。）

---

#### 2013 · 第 4 题 ｜ 傅氏变换奇偶实虚对称性

> **题源** 936 题库存档 ・ **原图** 未随存档保留 ・ **出处** [2013~2016 年卷](../按年份编排/2013~2016年武汉大学936信号与系统历史真题及解析.md)

**题干**

根据下图所示信号 $f(t)$ 的傅立叶变换 $F(j\omega)=R(\omega)+jX(\omega)$，求下图所示信号 $y(t)$ 的傅立叶变换。

> △ 题库未附解析，波形图未随存档保留。（提示：本质是 $f(t)$ 的翻转 / 平移组合用 $R(\omega)$、$X(\omega)$ 表示。）

---

#### 2014 · 第 3 题 ｜ 三角脉冲的调制频谱

> **题源** 936 题库存档 ・ **原图** 未随存档保留 ・ **出处** [2013~2016 年卷](../按年份编排/2013~2016年武汉大学936信号与系统历史真题及解析.md)

**题干**

已知三角脉冲信号 $f_1(t)$ 波形如下图所示，试求 $f_2(t)=f_1\left(t-\dfrac{\tau}{2}\right)\cos(\omega_0 t)$ 的傅立叶变换。

> △ 题库未附解析。

---

### 3.1.2 频域微分与时域积分性质速算

#### 2024 · 第 6 题（15 分）｜ 傅里叶变换性质综合运用

> **原图** `images/2024_q6_spectrum.png`（对照 PDF） ・ **出处** [2024 年卷](../按年份编排/2024年武汉大学936信号与系统真题及解析.md)

**题干**

利用性质求解：

(1) $f(t) = t e^{-3|t-1|}$；
(2) $f(t) = \displaystyle\int_{-\infty}^t \frac{\sin(2\pi\tau)}{\pi\tau}\mathrm{d}\tau$；
(3) 已知频谱 $X(j\omega)$ 如图，求 $x(t)$。

<details>
<summary><b>展开解析</b>（先自己完整做一遍再看）</summary>

(1) $e^{-3|t|} \leftrightarrow \dfrac{6}{9+\omega^2}$，先时移后乘 $t$（对应频域微分乘 $j$）；

(2) 利用时域积分性质：$\dfrac{X_1(j\omega)}{j\omega} + \pi X_1(0)\delta(\omega)$；

(3) 频域折线求导化为两段矩形门函数，对偶求解时域反变换。

</details>

---

#### 2020 · 第 2 题 ｜ 傅氏变换性质（积分＋尺度＋时移链）

> **题源** 936 题库存档（附原博主解答） ・ **出处** [2020 年卷](../按年份编排/2020年武汉大学936信号与系统真题及解析.md)

**题干**

已知 $f_1(t)\leftrightarrow F_1(\omega)$，求 $\displaystyle\int_{-\infty}^{t}f_1[2(\tau-1)]\,\mathrm{d}\tau$ 的傅氏变换。

<details>
<summary><b>展开解析</b>（题库原解答）</summary>

三个性质链条（建议背熟）：
$$f_1(t-t_0)\leftrightarrow e^{-j\omega t_0}F_1(\omega),\qquad f_1(at)\leftrightarrow \frac{1}{|a|}F_1\left(\frac{\omega}{a}\right),\qquad \int_{-\infty}^{t}f_1(\tau)\mathrm{d}\tau\leftrightarrow \frac{F_1(\omega)}{j\omega}+\pi F_1(0)\delta(\omega)$$

本题先尺度时移 $f_1[2(\tau-1)] \leftrightarrow \dfrac{1}{2}e^{-j\omega}F_1\left(\dfrac{\omega}{2}\right)$，再套积分性质：

$$\int_{-\infty}^{t}f_1[2(\tau-1)]\mathrm{d}\tau \leftrightarrow \frac{1}{2}\left[\frac{1}{j\omega}e^{-j\omega}F_1\left(\frac{\omega}{2}\right)+\pi F_1(0)\delta(\omega)\right]$$

</details>

---

#### 2026 · 第 5 题 ｜ 傅里叶变换性质综合运算

> **出处** [2026 年真题](../按年份编排/2026年武汉大学807信号与系统真题及解析.md)

**题干**

(1) $x(t) = e^{-|t|}u(t-5)$；
(2) $x(t) = \dfrac{\sin(\pi t)}{\pi t} * \dfrac{\mathrm{d}}{\mathrm{d}t}\left[\dfrac{\sin(3t)}{\pi t}\right]$；
(3) $X(\omega)=|X(\omega)|e^{j\varphi(\omega)}$：幅度谱为 $\omega=\pm3$ 处高度 1 的两条谱线，相位谱 $\varphi(\omega)=\dfrac{\pi}{2}\ (\omega<0)$、$-\dfrac{\pi}{2}\ (\omega>0)$。求 $x(t)$。

<details>
<summary><b>展开解析</b>（答案卷原解答）</summary>

(1) 提取时移：$x(t)=e^{-t}u(t-5)=e^{-5}\,e^{-(t-5)}u(t-5)=e^{-5}\,e^{-t}u(t)*\delta(t-5)$，做傅里叶变换得

$$X(\omega)=e^{-5}\cdot\frac{1}{1+j\omega}\cdot e^{-j5\omega}$$

(2) 由常见变换对：$x_1(t)=\dfrac{\sin\pi t}{\pi t}\leftrightarrow X_1(\omega)=G_{2\pi}(\omega)$，$x_2(t)=\dfrac{\sin 3t}{\pi t}\leftrightarrow X_2(\omega)=G_6(\omega)$；微分性质 $x_3(t)=\dfrac{\mathrm{d}}{\mathrm{d}t}x_2(t)\leftrightarrow X_3(\omega)=j\omega G_6(\omega)$（$-3\sim3$ 的斜坡，两端 $\mp3j$）；卷积定理 $X(\omega)=\dfrac{1}{2\pi}X_1(\omega)*X_3(\omega)$。

考虑卷积得微积分性质：微分等价于和 $\delta'(t)$ 卷积、积分等价于和 $u(t)$ 卷积——把 $X_3$ 在 $X_1$ 的窗内积分：$\displaystyle\int_{-3}^{\omega}j\omega\,\mathrm{d}\omega=\frac{j}{2}(\omega^2-9)$。故 $X(\omega)$ 为两段抛物线瓣（边缘峰值 $\pm\dfrac{9}{4\pi}j$，图见答案卷 p9）。

【注】在 (2) 问中，卷积的计算有很多种，比如 S 域或者卷积的定义，但考虑微积分性质做是非常快的。

(3) 由频率特性曲线有：

$$X(\omega)=\delta(\omega+3)e^{j\frac{\pi}{2}}+\delta(\omega-3)e^{-j\frac{\pi}{2}}=j[\delta(\omega+3)-\delta(\omega-3)]=\frac{1}{\pi}\cdot j\pi[\delta(\omega+3)-\delta(\omega-3)]$$

对 $X(\omega)$ 做傅里叶反变换有：$x(t)=\dfrac{1}{\pi}\sin 3t$。

</details>

---

## 3.2 单边带调制 (SSB) 与希尔伯特变换（武大必考王牌）

> **套路**（源自指导文件 3.2.2）：掌握上支路 $\cos(\omega_0 t)$ 频谱搬移与下支路 $\sin(\omega_0 t)$ 伴随 $\pm 90^\circ$ 移相的相消相加机制——上边带反相抵消、下边带同相叠加。

### 2025 · 第 9 题（12 分）｜ 单边带 (SSB) 调制与希尔伯特变换

> **原图** `images/2025_q9_ssb.png`（原始材料中该切片缺失，请对照 PDF） ・ **出处** [2025 年卷](../按年份编排/2025年武汉大学936信号与系统真题及解析.md)

**题干**

试着证明下图所示之系统可以产生单边带信号。图中，信号 $g(t)$ 之频谱 $G(\omega)$ 受限于 $-\omega_m \sim +\omega_m$ 之间，$\omega_0 > \omega_m$，$H(j\omega) = -j\,\text{sgn}(\omega)$。设 $v(t)$ 的频谱为 $V(\omega)$：

1. 写出 $V(\omega)$ 的表达式，并画出图形，说明下边带调制的作用；
2. 如果 $g(t)$ 的频谱如下所示，说明此时是否能进行下边带调制。

<details>
<summary><b>展开解析</b>（先自己完整做一遍再看）</summary>

1. 上支路余弦调制产生双边带频谱 $\dfrac{1}{2}[G(\omega-\omega_0) + G(\omega+\omega_0)]$；下支路通过希尔伯特正交移相产生正负频率正交分量，与正弦相乘后，上边带相互反相抵消，下边带同相叠加，完美保留下边带频谱，带宽减半。
2. 只要基带信号无直流分量且 $\omega_0 > \omega_m$，下边带调制均可成立。

</details>

---

### 2020 · 第 15 题 ｜ 调制解调题（移相网络产生单边带）

> **题源** 936 题库存档（附原博主解答） ・ **原图** [题库图12](https://pic1.zhimg.com/80/v2-e82d95a9752446fa48208a16f76ad398_1440w.png)、[题库图13](https://img-blog.csdnimg.cn/20210508124304307.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80NTgyNzcwMw==,size_16,color_FFFFFF,t_70) ・ **出处** [2020 年卷](../按年份编排/2020年武汉大学936信号与系统真题及解析.md)

**题干**

考虑下图所示调制系统，其中：

$$H(j\omega)=\begin{cases}-j, & \omega>0\\ j, & \omega<0\end{cases}$$

输入的频谱如下右图所示，$\omega_m\ll\omega_c$。

(1) 画出信号 $y_1(t)$、$y_2(t)$、$y(t)$ 的频谱；
(2) 如何从 $y(t)$ 中恢复输入信号 $x(t)$？

<details>
<summary><b>展开解析</b>（题库原解答）</summary>

(1) 先认清 $H(j\omega)$：$|H(j\omega)|=1$，$\varphi(\omega)=-\dfrac{\pi}{2}\,(\omega>0)$，$+\dfrac{\pi}{2}\,(\omega<0)$——即移相网络（希尔伯特变换器）。

时域乘 $\cos\omega_c t$ 频谱搬移；乘 $\sin\omega_c t$ 频谱搬移并带相移：
$$y_1(t)=x(t)\cos\omega_c t \leftrightarrow \frac{1}{2}\left[X(\omega-\omega_c)+X(\omega+\omega_c)\right]$$
$$x(t)\sin\omega_c t \leftrightarrow \frac{1}{2j}\left[X(\omega-\omega_c)-X(\omega+\omega_c)\right]$$

下支路 $y_2(t)=[x(t)*h(t)]\sin\omega_c t$：正频率部分乘 $-j$、负频率部分乘 $+j$ 后再搬移。合成时上边带整体翻转相消、下边带不变相加，即得到**下边带频谱**；$y(t)=y_1(t)+y_2(t)$（频谱图见题库图13）。

(2) 单边带信号的恢复：再乘以 $\cos\omega_c t$，单边带频谱各自左右平移 $\omega_c$，在 $\omega=0$ 附近合成原信号频谱，然后用截止频率为 $\omega_m$ 的低通滤波器滤除高频分量即可恢复 $x(t)$。

</details>

---

### 2014 · 第 5 题 ｜ 多路复用 (FDM) 系统证明

> **题源** 936 题库存档 ・ **出处** [2013~2016 年卷](../按年份编排/2013~2016年武汉大学936信号与系统历史真题及解析.md)

**题干**

一种多路复用系统如图所示，解复用系统如图所示。假定 $x_1(t)$ 和 $x_2(t)$ 都是带限的，其最高频率为 $\omega_m$，即当 $|\omega|>\omega_m$ 时 $X_1(\omega)=X_2(\omega)=0$；假定载波频率 $\omega_c>\omega_m$。

试证明：$y_1(t)=x_1(t)$，$y_2(t)=x_2(t)$。

> △ 题库未附解析。（提示：正交载波 $\cos\omega_c t$ / $\sin\omega_c t$ 的同步解调 + 理想低通。）

---

### 2014 · 第 6 题 ｜ 调幅调制与恢复（冲激串 + 理想低通）

> **题源** 936 题库存档 ・ **出处** [2013~2016 年卷](../按年份编排/2013~2016年武汉大学936信号与系统历史真题及解析.md)

**题干**

如下图所示的调幅调制系统：输入信号 $e(t)$ 为带限实信号，频谱为 $E(j\omega)$，带宽为 $2\pi f_m$；$s(t)$ 为周期冲激序列（如下图所示）；$H(j\omega)$ 为理想低通滤波器，带宽为 $6\pi f_m$（如下图所示）。

求系统的输出 $r(t)$。

> △ 题库未附解析，系统图未随存档保留。

---

### 2022 · 第 7 题（15 分）｜ 连续正弦信号相乘与理想低通滤波

> **出处** [2022 年卷](../按年份编排/2022年武汉大学936信号与系统真题及解析.md)

**题干**

$x(t) = \sin(200\pi t) + 2\sin(400\pi t)$，$g(t) = x(t)\sin(400\pi t)$。若 $g(t)\sin(400\pi t)$ 通过截止频率为 $399\pi$、通带增益为 2 的理想低通滤波器，求输出信号 $y(t)$。

<details>
<summary><b>展开解析</b>（先自己完整做一遍再看）</summary>

**法一（降幂公式）**：$g(t)\sin(400\pi t)=x(t)\sin^2(400\pi t)=x(t)\cdot\dfrac{1-\cos(800\pi t)}{2}$。易知 $x(t)$ 中的信号仅有 $\sin(200\pi t)$ 相关分量能通过截止频率 $399\pi$ 的滤波器；根据调制定理，$x(t)\cos(800\pi t)$ 产生的频率成分均不能通过该滤波器。则滤波器输出为 $y(t)=\sin(200\pi t)$。

**法二（积化和差）**：$\sin(200\pi t)\cos(800\pi t)=\dfrac{1}{2}[\sin(1000\pi t)-\sin(600\pi t)]$，$\sin(400\pi t)\cos(800\pi t)=\dfrac{1}{2}[\sin(1200\pi t)-\sin(400\pi t)]$——$x(t)\cos(800\pi t)$ 所产生的频率（$600\pi$、$1000\pi$、$1200\pi$、$400\pi$）均高于截止频率 $399\pi$，不能通过。通带增益 2 刚好抵消降幂产生的 0.5 系数，故 $y(t)=\sin(200\pi t)$。

**注**：该类型题目建议使用时域方法做！

</details>

---

### 2026 · 第 7 题 ｜ 调制混频系统频谱图与混叠判据

> **出处** [2026 年真题](../按年份编排/2026年武汉大学807信号与系统真题及解析.md)

**题干**

系统框图和初始信号频谱如图所示：$x_1(t)$（三角形频谱，$|\omega|<5\times10^3$，峰值 $A$）直接进入加法器；$x_2(t)$（同频带、抛物线形频谱，峰值 $A$）先与 $2\cos(2\times10^4 t)$ 相乘得 $x(t)$，再与 $x_1(t)$ 相加得 $y(t)$；$y(t)$ 再与 $2\cos(5\times10^4 t)$ 相乘得 $z(t)$。

(1) 画出 $x(t)$，$y(t)$，$z(t)$ 的频谱；
(2) $z(t)$ 是否混叠。

<details>
<summary><b>展开解析</b>（答案卷原解答）</summary>

(1) $X(\omega)$ 和 $Y(\omega)$ 的频谱（图见答案卷 p12）：

* $X(\omega)$：$x_2$ 的频谱搬移到 $\pm2\times10^4$ 处的两个波瓣；
* $Y(\omega)=X_1(\omega)+X(\omega)$：基带 $\pm5\times10^3$ 的三角形（来自 $x_1$）叠加 $\pm2\times10^4$ 处两个波瓣；
* $Z(\omega)$：$Y$ 与 $2\cos(5\times10^4 t)$ 相乘即搬移 $\pm5\times10^4$——基带瓣搬到 $\pm5\times10^4$，$\pm2\times10^4$ 波瓣搬到 $\pm3\times10^4$ 与 $\pm7\times10^4$，共六组波瓣（$3$、$5$、$7\times10^4$ 及其镜像）。

(2) 由 (1) 可知，各波瓣互不重叠，**不会发生混叠**。

</details>

---

## 3.3 抽样定理与无失真恢复系统

### 3.3.1 冲激抽样定理与最大抽样间隔

> **套路**：无混叠条件 $\omega_s \ge 2\omega_m$；最大间隔 $T_{\max} = \dfrac{2\pi}{\omega_s} = \dfrac{\pi}{\omega_m}$（注意角频率与频率两种口径）。

#### 2025 · 第 8 题（12 分）｜ 傅里叶变换应用于通信抽样系统

> **原图** `images/2025_q8_sampling.png`（原始材料中该切片缺失，请对照 PDF） ・ **出处** [2025 年卷](../按年份编排/2025年武汉大学936信号与系统真题及解析.md)

**题干**

某系统如下所示，若 $x(t)$ 的频谱具有低通特性，其频谱图如下所示，$p(t) = \sum_{n=-\infty}^{+\infty} \delta(t - nT)$，$H(j\omega)$ 截止角频率为 $8\pi$：

1. 求最大抽样间隔 $T_{\max}$，使 $X_p(j\omega)$ 不会发生混频；（4分）
2. 当抽样周期满足 $T = 1/10$ 时，写出 $X_p(j\omega), Y(j\omega)$ 的表达式；（4分）
3. 若输入信号改为 $x(t) = 2\sin(10\pi t)$，求最大抽样周期 $T_{\max}$，使得 $X_p(j\omega)$ 不会发生混频，并求出 $T_{\max}$ 下的输出 $y(t)$。（4分）

<details>
<summary><b>展开解析</b>（先自己完整做一遍再看）</summary>

1. 原信号带宽 $\omega_m = 8\pi$，无混叠条件 $\omega_s \ge 2\omega_m = 16\pi$，故 $T_{\max} = \dfrac{2\pi}{16\pi} = \dfrac{1}{8}\,\text{s}$。
2. $T = 0.1\,\text{s}$ 时 $\omega_s = 20\pi > 16\pi$ 不发生混频，抽样频谱为周期延拓，经低通滤波器后只留 $n=0$ 基带，增益恢复为原频谱的 10 倍。
3. 单一频率正弦波最高频率为 $10\pi$，由抽样定理求 $T_{\max} = \dfrac{1}{10}\,\text{s}$。

</details>

---

#### 2022 · 第 6 题（15 分）｜ 周期信号低通滤波与奈奎斯特抽样

> **原图** `images/2022_q6_sampling.png`（对照 PDF） ・ **出处** [2022 年卷](../按年份编排/2022年武汉大学936信号与系统真题及解析.md)

**题干**

某系统如下图（a）所示（$x(t)$ 先经 $H(\omega)$ 低通滤波得 $y(t)$，再以 $t=nT_s$ 抽样得 $y(nT_s)$），低通滤波器频谱函数 $H(\omega)$ 如下图（b）所示，$H(\omega)$ 的相频特性为零；输入周期信号 $x(t)$ 如下图（c）所示，其周期 $T=10\,\mu s$，脉冲宽度为 $\tau=1\,\mu s$：

(1) 求周期信号 $x(t)$ 的傅里叶变换 $X(\omega)$；（5分）
(2) 当 $H(\omega)$ 的截止频率为 $\omega_c = \dfrac{\pi}{2}\times 10^6\,\text{rad/s}$ 时，求 $y(t)$ 的奈奎斯特抽样频率 $f_s$；（5分）
(3) 当抽样频率是 $4f_s$ 时，求输出序列 $y(n)$ 的表达式。（5分）

<details>
<summary><b>展开解析</b>（答案卷原解答）</summary>

(1) 周期函数的傅氏变换公式 $X(\omega)=2\pi\sum\limits_{n=-\infty}^{\infty}F_n\delta(\omega-n\omega_1)$，$\omega_1=\dfrac{2\pi}{T}$。计算双边指数傅氏级数系数：

$$F_n=\frac{\tau}{T}\,\text{sa}\left(\frac{n\pi\tau}{T}\right)e^{-j\frac{n\pi\tau}{T}}\ \xrightarrow{\ T=10\mu s,\ \tau=1\mu s\ }\ \frac{1}{10}\,\text{sa}\left(\frac{n\pi}{10}\right)e^{-j\frac{n\pi}{10}}$$

$$X(\omega)=\frac{\pi}{5}\sum_{n=-\infty}^{\infty}\text{sa}\left(\frac{n\pi}{10}\right)e^{-j\frac{n\pi}{10}}\,\delta(\omega-n\omega_1),\qquad \omega_1=\frac{2\pi}{T}=2\pi\times10^5\,\text{rad/s}$$

(2) 截止频率 $\omega_c=5\pi\times10^5\,\text{rad/s}$，允许直流与 1、2 次谐波通过，3 次及以上谐波均被滤除。滤波后 $y(t)$ 的最高频率为 2 次谐波频率 $\omega_m=2\omega_1=4\pi\times10^5\,\text{rad/s}$：

$$f_s=\frac{2\omega_m}{2\pi}=4\times10^5\,\text{Hz}$$

(3) 滤波之后 $y(t)=F_0+F_1e^{j\omega_1 t}+F_{-1}e^{-j\omega_1 t}+F_2e^{j2\omega_1 t}+F_{-2}e^{-j2\omega_1 t}$，其中 $F_0=\dfrac{1}{10}$，$F_1=\dfrac{1}{10}\text{sa}\left(\dfrac{\pi}{10}\right)e^{-j\frac{\pi}{10}}$，$F_2=\dfrac{1}{10}\text{sa}\left(\dfrac{\pi}{5}\right)e^{-j\frac{\pi}{5}}$，整理：

$$y(t)=\frac{1}{10}+\frac{1}{5}\,\text{sa}\left(\frac{\pi}{10}\right)\cos\left(\omega_1 t-\frac{\pi}{10}\right)+\frac{1}{5}\,\text{sa}\left(\frac{\pi}{5}\right)\cos\left(2\omega_1 t-\frac{\pi}{5}\right)$$

抽样之后 $y(n)=y(nT_s)=y(t)\big|_{t=nT_s}$，由 $f_s=\dfrac{4\omega_1}{2\pi} \Rightarrow T_s=\dfrac{1}{4f_s}=\dfrac{\pi}{8\omega_1}$：

$$y(n)=\frac{1}{10}+\frac{1}{5}\,\text{sa}\left(\frac{\pi}{10}\right)\cos\left(\frac{n\pi}{8}-\frac{\pi}{10}\right)+\frac{1}{5}\,\text{sa}\left(\frac{\pi}{5}\right)\cos\left(\frac{n\pi}{4}-\frac{\pi}{5}\right)$$

</details>

---

#### 2026 · 第 6 题 ｜ 频谱搬移抽样与无混叠恢复系统设计

> **出处** [2026 年真题](../按年份编排/2026年武汉大学807信号与系统真题及解析.md)

**题干**

系统框图如下图所示：$x(t)$ 与 $e^{j\omega_0 t}$ 相乘得 $x_1(t)$，经 $H(j\omega)$ 得 $x_2(t)$，再与 $p(t)=\displaystyle\sum_{n=-\infty}^{\infty}\delta(t-nT)$ 相乘得 $x_p(t)$。已知 $\omega_0=100\pi$，$H(j\omega)=\begin{cases}1, & |\omega|<2\pi\\ 0, & \text{else}\end{cases}$，$x(t)$ 的频谱为 $\pm(98\pi\sim102\pi)$ 处的两个三角形（峰值 1）：

(1) $x_p(t)$ 能恢复出 $x(t)$，$T_{\max}$ 为？
(2) $T=\dfrac{1}{2}T_{\max}$ 时，画出 $x_p(\omega)$ 频谱；
(3) 从 $\dfrac{1}{2}T_{\max}$ 的 $x_p(t)$ 恢复出 $x(t)$，设计系统？

<details>
<summary><b>展开解析</b>（答案卷原解答）</summary>

(1) 根据框图 $x_1(t)=x(t)\cdot e^{j\omega_0 t}$，由卷积定理 $X_1(\omega)=\dfrac{1}{2\pi}X(\omega)*2\pi\delta(\omega-\omega_0)=X(\omega-\omega_0)$：负频带搬至 $-2\pi\sim2\pi$，正频带搬至 $198\pi\sim202\pi$。$x_1$ 经 $H$ 后只剩基带三角形 $x_2(\omega)$（$-2\pi\sim2\pi$）。又 $x_p(t)=x_2(t)\sum\limits_{n=-\infty}^{\infty}\delta(t-nT)$，做傅里叶变换：

$$x_p(\omega)=\frac{1}{T}\sum_{n=-\infty}^{\infty}X\left(\omega-\frac{2\pi n}{T}\right)$$

能恢复应满足无混叠条件：$-2\pi+\dfrac{2\pi}{T}>2\pi \Rightarrow T<\dfrac{1}{2}$，故

$$T_{\max}=\frac{1}{2}$$

(2) 当 $T=\dfrac{1}{2}T_{\max}=\dfrac{1}{4}\,s$ 时，$x_p(\omega)=4\sum\limits_{n=-\infty}^{\infty}X(\omega-8\pi n)$：高度 4、以 $8\pi$ 为间隔周期重复的三角形频谱（图见答案卷 p11）。

(3) 系统框图：$x_2(t)$ 先经 $H_1(\omega)=\begin{cases}\dfrac{1}{2}, & |\omega|<2\pi\\ 0, & \text{else}\end{cases}$（取基带并补偿抽样增益），再与 $\cos 200\pi t$ 相乘搬移回 $\pm100\pi$，输出 $y(t)$（框图见答案卷 p11）。

</details>

---

#### 2023 · 第 7 题（12 分）｜ 冲激抽样定理与时域恢复系统

> **原图** `images/2023_q7_sampling.png`（对照 PDF） ・ **出处** [2023 年卷](../按年份编排/2023年武汉大学936信号与系统真题及解析.md)

**题干**

输入信号带限于 $\pm f_m$，以冲激序列抽样得到 $x_s(t)$，通过"延迟相减＋积分器"系统得到 $x_{s1}(t)$，求时域表达式、傅氏变换及恢复滤波系统传输函数。

<details>
<summary><b>展开解析</b>（答案卷原解答）</summary>

(1) 根据框图可得积分器的输出为：$x_{s1}(t)=\left[x_s(t)-x_s(t-T)\right]*u(t)$，其中

$$x_s(t)=x(t)\sum_{n=-\infty}^{\infty}\delta(t-nT)=\sum_{n=-\infty}^{\infty}x(nT)\delta(t-nT)$$

(2) 可得 $X_s(j\omega)=\dfrac{1}{T}\displaystyle\sum_{n=-\infty}^{\infty}X\left(\omega-\dfrac{2\pi}{T}n\right)$。

由于 $x_{s1}(t)=\left[x_s(t)-x_s(t-T)\right]*u(t)=x_s(t)*\left[u(t)-u(t-T)\right]$，则

$$X_{s1}(j\omega)=X_s(j\omega)\cdot T\,\text{Sa}\left(\frac{\omega T}{2}\right)e^{-j\frac{\omega T}{2}}=\text{Sa}\left(\frac{\omega T}{2}\right)e^{-j\frac{\omega T}{2}}\sum_{n=-\infty}^{\infty}X\left(\omega-\frac{2\pi}{T}n\right)$$

(3) 若要还原原信号 $x(t)$，则有 $X_{s1}(j\omega)H(j\omega)=X(j\omega)$，可得

$$H(j\omega)=\begin{cases}\dfrac{1}{\text{Sa}\left(\dfrac{\omega T}{2}\right)e^{-j\frac{\omega T}{2}}}, & -\omega_c<\omega<\omega_c\\[3mm] 0, & \text{其他}\end{cases}$$

而 $\dfrac{2\pi}{T}<\omega_c<\dfrac{6\pi}{T}$。

</details>

---

#### 2020 · 第 7 题 ｜ 采样定理题（组合信号的奈奎斯特频率）

> **题源** 936 题库存档 ・ **出处** [2020 年卷](../按年份编排/2020年武汉大学936信号与系统真题及解析.md)

**题干**

若 $x(t)$ 的奈奎斯特频率为 $\omega_s$，求下列信号的奈奎斯特采样频率：

(1) $x(t)-x(t-1)$；
(2) $x(t)^2$；
(3) $x(t)\cos(\omega_s t)$。

<details>
<summary><b>展开解析</b>（题库要点）</summary>

信号和自身的延时作差，频谱形状不变（只是乘 $1-e^{-j\omega}$），带宽不变，采样频率不变：$\omega_s$。

(2) 平方对应频谱卷积，带宽加倍：$2\omega_s$。

(3) 乘载波 $\cos\omega_s t$ 是频谱搬移，带宽不变但最高频率抬高到 $\omega_s+\omega_m$……注意此处载波频率恰取 $\omega_s$，搬移后频谱关于 $\pm\omega_s$ 对称拼接，其奈奎斯特频率仍可取 $\omega_s$（按最高频率减半口径讨论，作图判断不混叠条件）。

</details>

---

#### 2017 · 第 4 题 ｜ 采样定理（尺度变换 + 冲激串抽样）

> **题源** 936 题库存档 ・ **原图** 未随存档保留 ・ **出处** [2017 年卷](../按年份编排/2017年武汉大学936信号与系统真题及解析.md)

**题干**

设 $f(t)$ 为带限信号，最高频率为 $\omega_m=8\,\text{rad/s}$，其频谱如下图所示：

(1) 求信号 $f(3t)$ 的带宽和奈奎斯特抽样间隔 $T_N$；
(2) 用抽样序列 $\delta_{T}(t)=\displaystyle\sum_{n=-\infty}^{\infin}\delta(t-nT_N)$ 对信号 $f(t)$ 进行抽样，得抽样信号 $f_s(t)$，求 $f_s(t)$ 的频谱，并画出频谱图。

> △ 题库未附解析。

---

#### 2013 · 第 9 题 ｜ 抽样滤波题（两个截止频率对照）

> **题源** 936 题库存档 ・ **出处** [2013~2016 年卷](../按年份编排/2013~2016年武汉大学936信号与系统历史真题及解析.md)

**题干**

如下图所示抽样系统，输出 $x(t)=A+B\cos(300\pi t)$，抽样脉冲 $p(t)=\displaystyle\sum_{n=-\infty}^{\infin}\delta(t-n\Delta)$，其中 $\Delta=5\,\text{ms}$；理想低通滤波器的系统函数为

$$H(j\omega)=\begin{cases}1, & |\omega|<\omega_0\\ 0, & |\omega|>\omega_0\end{cases}$$

输出信号为 $y(t)$。

(1) 画出信号 $f(t)=p(t)x(t)$ 的频谱；
(2) $\omega_0=200\pi$ 时，给出输出信号 $y(t)$ 的表达式；
(3) $\omega_0=450\pi$ 时，给出输出信号 $y(t)$ 的表达式。

> △ 题库未附解析。

---

### 3.3.2 脉冲抽样（非理想抽样）与孔径效应

#### 2024 · 第 7 题（15 分）｜ 脉冲抽样系统流图与最大采样间隔

> **原图** `images/2024_q7_sampling_pt.png`、`images/2024_q7_spectrum_x.png`（对照 PDF） ・ **出处** [2024 年卷](../按年份编排/2024年武汉大学936信号与系统真题及解析.md)

**题干**

脉冲序列抽样系统流图如下，输入为带限信号 $X(j\omega)$：

(1) 写出 $p(t)$ 时域表达式；
(2) 求 $P(j\omega)$；
(3) 求不发生频谱混叠的最大采样周期 $T_{\max}$。

<details>
<summary><b>展开解析</b>（先自己完整做一遍再看）</summary>

(1) $p(t) = \sum_{n=-\infty}^{+\infty} [u(t-nT)-u(t-nT-\tau)]$；

(2) 展开为傅里叶级数后做傅氏变换：$P(j\omega) = 2\pi\sum F_n\delta(\omega-n\omega_s)$；

(3) 频谱无混叠要求 $\omega_s \ge 2\omega_m \implies T_{\max} = \dfrac{\pi}{\omega_m}$。

</details>

---

#### 2018 · 第 8 题 ｜ 滤波器频谱题（零阶保持型孔径效应）

> **题源** 936 题库存档 ・ **原图** [题库图19](https://pic1.zhimg.com/80/v2-ee88138212647e3d225ccff3f3c03d22_1440w.png)、[题库图20](https://pic2.zhimg.com/80/v2-74b7574549d5495da3cdd3bf12cb203d_1440w.png) ・ **出处** [2018 年卷](../按年份编排/2018年武汉大学936信号与系统真题及解析.md)

**题干**

某系统框图如下图所示，假设连续时间信号 $x(t)$ 是最高角频率为 $\omega_m$ 的低频信号，其频谱 $X(\omega)$ 如下图所示，子系统 $h_0(t)$ 的单位冲激响应为：$h_0(t)=u(t)-u(t-T_s)$。

(1) 求信号 $x_s(t)$ 的频谱，粗略画出频谱图；
(2) 求信号 $x_0(t)$ 的频谱，粗略画出频谱图；
(3) 若 $T_s\le \dfrac{\pi}{\omega_m}$，应设计一个具有怎样特性的滤波器才能由信号 $x_0(t)$ 无失真地恢复信号 $x(t)$？写出滤波器的频率响应特性。

> △ 题库未附解析。（提示：$x_0$ 的频谱比冲激抽样多乘一个 $\text{Sa}$ 包络 $T_s\text{Sa}(\omega T_s/2)e^{-j\omega T_s/2}$，恢复滤波器要在通带内把它"倒"回来。）

---

#### 2016 · 第 5 题 ｜ 采样与恢复（延迟脉冲序列）

> **题源** 936 题库存档 ・ **原图** 未随存档保留 ・ **出处** [2013~2016 年卷](../按年份编排/2013~2016年武汉大学936信号与系统历史真题及解析.md)

**题干**

一个信号 $x(t)$ 送入下图所示的系统进行采样，采样时间序列如下图所示，$x(t)$ 的傅立叶变换如下图所示，系统函数 $H(j\omega)$ 如下图。

(1) 当 $\Delta$ 较小时，画出 $x_p(t)$、$y(t)$ 的频谱；
(2) 设计一个新系统，能从 $x_p(t)$ 恢复出 $x(t)$。

> △ 题库未附解析，图示未随存档保留（延迟量 Δ 的具体条件在存档中缺损，对照原卷）。延迟脉冲抽样会在频域引入 $e^{-j\omega\Delta}$ 相位因子，恢复系统需做相位补偿。

---

### 3.3.3 抽样后滤波器恢复设计

#### 2018 · 第 7 题 ｜ 能谱题（能量谱 + 50% 能量截止频率）

> **题源** 936 题库存档 ・ **原图** [题库图18](https://pic2.zhimg.com/80/v2-e5dff5fbb2021df9a4e2d8aac290d68d_1440w.png) ・ **出处** [2018 年卷](../按年份编排/2018年武汉大学936信号与系统真题及解析.md)

**题干**

某系统如下图所示，输入信号 $x(t)=e^{-a(t-t_0)}u(t-t_0)$，且 $a>0$，输出信号为 $y(t)$；理想滤波器：

$$H(j\omega)=\begin{cases}e^{-j\omega t_0}, & |\omega|<\omega_c\\ 0, & |\omega|>\omega_c\end{cases}$$

(1) 求输入信号 $x(t)$ 的能谱函数；
(2) 若使 $y(t)$ 的能量为 $x(t)$ 能量的 50%，求理想低通滤波器的截止频率 $\omega_c$。

> △ 题库未附解析。（提示：$|X(\omega)|^2=\dfrac{1}{a^2+\omega^2}$，总能量 $E=\dfrac{\pi}{2a}$，令 $\dfrac{2}{\pi}\arctan\dfrac{\omega_c}{a}=\dfrac12$。）

---

## 3.4 周期信号傅里叶级数与稳态频响

### 2023 · 第 8 题（12 分）｜ 微分滤波器与周期脉冲稳态响应

> **原图** `images/2023_q8_pulse.png`（对照 PDF） ・ **出处** [2023 年卷](../按年份编排/2023年武汉大学936信号与系统真题及解析.md)

**题干**

滤波器频响 $H(j\omega) = j\dfrac{\omega}{2\pi},\ -6\pi \le \omega \le 6\pi$。求输入 $\cos(4\pi t+\theta)$、$\cos(8\pi t+\theta)$ 及周期脉冲波 $e(t)$ 时的输出。

<details>
<summary><b>展开解析</b>（先自己完整做一遍再看）</summary>

(1) $H(j\omega)\big|_{\omega=4\pi}=2j=2e^{j\frac{\pi}{2}}$，可得输出 $r(t)=2\cos\left(4\pi t+\theta+\dfrac{\pi}{2}\right)$。

(2) $H(j\omega)\big|_{\omega=8\pi}=0$，可得输出 $r(t)=0$。

(3) 先求 $F_n$：$F_n=\dfrac{1}{T}E_0(j\omega)\big|_{\omega=n\omega_0}=\dfrac{1}{2}\,\text{Sa}\left(\dfrac{n\pi}{2}\right)$，所以将 $e(t)$ 展开后得 $e(t)=\displaystyle\sum_{n=-\infty}^{\infty}\frac{1}{2}\,\text{Sa}\left(\frac{n\pi}{2}\right)e^{jn4\pi t}$。

由特征函数法：$r(t)=\displaystyle\sum_{n=-\infty}^{\infty}\frac{1}{2}\,\text{Sa}\left(\frac{n\pi}{2}\right)H(j4n\pi)e^{jn4\pi t}$；而当 $|n|>1$ 时系统增益为 0，只需求 $n=0,\pm1$：$H(j0)=0$，$H(j4\pi)=2e^{j\frac{\pi}{2}}$，$H(-j4\pi)=2e^{-j\frac{\pi}{2}}$。

输出为 $r(t)=\dfrac{2}{\pi}e^{j\frac{\pi}{2}}e^{j4\pi t}+\dfrac{2}{\pi}e^{-j\frac{\pi}{2}}e^{-j4\pi t}$。

</details>

---

### 2026 · 第 4 题 ｜ 周期信号通过理想低通滤波器与特征函数法

> **出处** [2026 年真题](../按年份编排/2026年武汉大学807信号与系统真题及解析.md)

**题干**

输入周期信号 $x(t)$ 通过截止频率为 $3.5\,\text{rad/s}$ 的理想低通滤波器，求稳态输出 $y(t)$。

<details>
<summary><b>展开解析</b>（先自己完整做一遍再看）</summary>

考察周期信号通过低通滤波器＋特征函数法。取 $x(t)$ 的一个周期记作 $x_0(t)$（$0\sim1$ 高 1，$1\sim2$ 高 $-1$，$2\sim3$ 为 0）：

$$x_0(t)=g_1\left(t-\frac{1}{2}\right)-g_1\left(t-\frac{3}{2}\right),\qquad x_0(\omega)=\text{Sa}\left(\frac{\omega}{2}\right)\left(e^{-j\frac{1}{2}\omega}-e^{-j\frac{3}{2}\omega}\right)$$

因此 $x(t)$ 的傅里叶级数系数 $F_n=\dfrac{1}{T}X_0(\omega)\big|_{\omega=n\omega_1}$，其中 $\omega_1=\dfrac{2\pi}{3}, T=3$：

$$F_n=\frac{1}{3}\,\text{Sa}\left(\frac{n\pi}{3}\right)\left(e^{-j\frac{\pi}{3}n}-e^{-jn\pi}\right)$$

由特征函数法 $y(t)=\displaystyle\sum_{n=-\infty}^{\infty}F_n H(n\omega_1)e^{jn\omega_1 t}$；$|n|>1$ 时 $3|n|\omega_1/2>3.5$ 增益为 0，只需 $n=0,\pm1$：

$$y(t)=F_0H(0)+F_1H\left(\frac{2\pi}{3}\right)e^{j\frac{2\pi}{3}t}+F_{-1}H\left(-\frac{2\pi}{3}\right)e^{-j\frac{2\pi}{3}t}=\frac{\sqrt{3}}{2\pi}\left(e^{-j\frac{\pi}{3}}+1\right)e^{j\frac{2\pi}{3}t}+\frac{\sqrt{3}}{2\pi}\left(e^{j\frac{\pi}{3}}+1\right)e^{-j\frac{2\pi}{3}t}$$

$$\boxed{y(t)=\frac{3}{\pi}\cos\left(\frac{2\pi}{3}t-\frac{\pi}{6}\right)}$$

【注】若激励 $f(t)=\sum F_n e^{jn\omega_1 t}$ 表示成指数形式的傅里叶级数，通过滤波器时引起的响应 $y(t)=\sum F_n H(n\omega_1)e^{jn\omega_1 t}$。

</details>

---

### 2017 · 第 5 题 ｜ 周期信号傅氏变换与系统频响

> **题源** 936 题库存档 ・ **原图** 未随存档保留 ・ **出处** [2017 年卷](../按年份编排/2017年武汉大学936信号与系统真题及解析.md)

**题干**

某系统如下图所示，其中 $x(t)=\dfrac{\sin 2t}{t}\cos 2000\pi t$（存档中 $x(t)=$ 缺失，按题意复原），周期信号 $s(t)$ 的波形如下图所示，且 $T=1\times 10^{-3}$ 秒；子系统函数：

$$H(j\omega)=\begin{cases}e^{-j\omega t_0}, & |\omega|\le 1\\ 0, & |\omega|>1\end{cases}$$

(1) 求 $x(t)$ 的频谱；
(2) 求 $s(t)$ 的频谱；
(3) 求系统的响应 $y(t)$。

> △ 题库未附解析。

---

### 2015 · 第 5 题 ｜ 滤波器（周期矩形脉冲 + 奈奎斯特 + 过采样）

> **题源** 936 题库存档 ・ **原图** 未随存档保留 ・ **出处** [2013~2016 年卷](../按年份编排/2013~2016年武汉大学936信号与系统历史真题及解析.md)

**题干**

某系统如下图所示，某低通滤波器频谱 $H(\omega)$ 如下图所示，$H(\omega)$ 的相频特性为 0，输入周期信号 $x(t)$ 如下图所示，其周期为 $T=10\,\mu s$，脉冲宽度 $\tau=1\,\mu s$。

(1) 求周期信号 $x(t)$ 的傅立叶变换 $X(\omega)$；
(2) 当 $H(\omega)$ 的截止频率为 $\omega_c=\dfrac{\pi}{2}\times 10^6\,\text{rad/s}$ 时，求 $y(t)$ 的奈奎斯特抽样频率 $f_s$；
(3) 当抽样频率是 $4f_s$ 时，求输出信号序列 $y(n)$ 的表达式。

> △ 题库未附解析。

---

### 2015 · 第 4 题 ｜ 根据频谱求输出

> **题源** 936 题库存档 ・ **原图** 未随存档保留 ・ **出处** [2013~2016 年卷](../按年份编排/2013~2016年武汉大学936信号与系统历史真题及解析.md)

**题干**

某信号 $x(t)$ 如下图所示，某 LTI 系统的频谱特性如下图所示，其中频谱特性函数

$$H(j\omega)=\begin{cases}1, & |\omega|<4\pi\\ 0, & |\omega|\ge 4\pi\end{cases}$$

当信号 $x(t)$ 输入到该 LTI 系统时，求输出信号 $y(t)$。

> △ 题库未附解析。

---

### 2021 · 第 5 题 ｜ 理想滤波器响应（去除正弦分量）

> **题源** 936 题库存档 ・ **出处** [2021 年卷](../按年份编排/2021年武汉大学936信号与系统真题及解析.md)

**题干**

已知：$h(t)=\delta(t)-\dfrac{\sin 2\pi t}{\pi t}$（存档分母排版缺损，按惯例复原为 $\pi t$）

(1) 求 $H(j\omega)$；
(2) 若 $x(t)=3+4\sin \pi t+5\cos 3\pi t$，求 $y(t)$。

> △ 题库未附解析。

---

### 2021 · 第 6 题 ｜ 周期信号与傅氏变换（频谱抽样定理）

> **题源** 936 题库存档（补全原卷缺失的公式） ・ **原图** [题库图3](https://pica.zhimg.com/80/v2-92f52bc0f71c2f57be897f737e13450a_1440w.png) ・ **出处** [2021 年卷](../按年份编排/2021年武汉大学936信号与系统真题及解析.md)

**题干**

已知 $f(t)$ 的傅立叶变换为 $F(\omega)$，有一周期信号 $p(t)=\displaystyle\sum_{n=-\infty}^{\infty}a_n e^{jn\omega_0 t}$。

(1) 若 $f_p(t)=p(t)\cdot f(t)$，求其傅立叶变换 $F_p(\omega)$；
(2) 若 $p(t)=\cos\dfrac{t}{2}$，且 $F(\omega)$ 如图所示，求 $F_p(\omega)$ 并画出其图形。

> △ 题库未附解析。

---

#### 🔗 参见（已收录在别的专题）

* **2024 · 第 5 题**（余弦信号周期 / 傅氏变换 / 频带判定）：见 [专题一 · 1.3](专题一_信号基础运算与LTI性质.md)。
* **2021 · 第 1 题**（周期 / 奈奎斯特采样率 / 傅氏变换填空）：见 [专题一 · 1.4](专题一_信号基础运算与LTI性质.md)。
