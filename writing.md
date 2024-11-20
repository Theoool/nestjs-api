---
# 在这个第一部分中，不要翻译冒号前的词语。例如，不要翻译"title:"。但是，要翻译"title:"后面的文本。

title: "为网络无障碍编写 - 入门提示"
title_html: "为网络无障碍编写"
nav_title: 写作技巧
lang: zh  # 将"en"更改为所翻译的语言简码
last_updated: 2024-07-16   # 将此翻译的日期更改为YYYY-MM-DD（月份在中间）

resource:
  ref: /tips/  # 不要更改此处

navigation:
  previous: /tips/  # 不要更改此处
  next: /tips/designing/  # 不要更改此处

# translators: # 从这一行开始和以下的行中删除："# "（井号和空格）
# - name: "Jan Doe"   # 将Jan Doe替换为译者姓名
# - name: "Jan Doe"   # 将Jan Doe替换为姓名，如果没有多个译者，可以删除这一行
# contributors:
# - name: "Jan Doe"   # 将Jan Doe替换为贡献者姓名，如果没有贡献者，可以删除这一行
# - name: "Jan Doe"   # 将Jan Doe替换为姓名，如果没有多个贡献者，可以删除这一行

github:
  label: wai-tips

permalink: /tips/writing/   # 在末尾添加语言简码，末尾不要加斜杠。例如，/path/to/file/fr
ref: /tips/writing/   # 不要更改此处

ext_css: tips.css
title_icon: /content-images/tips/icons.svg#writing

acknowledgements: /tips/acknowledgements/

# 在下面的页脚中：
# 不要更改日期
# 翻译其他词语，包括"Date:"和"Editors:"。将工作组名称翻译为中文，但保留工作组缩写为英文。
footer: >
  <p><strong>日期：</strong>2024年7月16日更新。2022年8月5日更新。首次发布于2015年9月。</p>
  <p><strong>编辑：</strong><a href="https://www.w3.org/People/kevin">凯文·怀特</a>，<a href="https://www.w3.org/People/shadi">沙迪·阿布-扎赫拉</a>，<a href="https://www.w3.org/People/Shawn">肖恩·劳顿·亨利</a>。致谢。</p>
  <p>由<a href="https://www.w3.org/WAI/EO/">教育和推广工作组（EOWG）</a>开发。与欧洲委员会<abbr title="信息社会技术">IST</abbr>计划共同资助的<a href="https://www.w3.org/WAI/DEV/">WAI-DEV项目</a>开发。</p>
---

{::nomarkdown}
{% include box.html type="start" h="2" title="摘要" class="full" %}
{:/}

这个页面介绍了一些基本的考虑，以帮助您开始编写更适合残障人士访问的网络内容。这些提示是良好的实践，可以帮助您满足网络内容无障碍指南（WCAG）的要求。点击链接，了解相关的WCAG要求，"理解"文档中的详细背景，教程的指导，用户故事和更多。

{::nomarkdown}
{% include box.html type="end" %}
{:/}

{::options toc_levels="2" /}

{::nomarkdown}
{% include_cached toc.html type="start" title="页面目录" class="full" %}
{:/}

-   TOC是自动生成的。
{:toc}

{::nomarkdown}
{% include_cached toc.html type="end" %}
{:/}

## 提供信息丰富、独特的页面标题

对于每个网页，提供一个简短的标题，描述页面内容并将其与其他页面区分开。页面标题通常与页面的主标题相同。将最独特和最相关的信息放在最前面；例如，将页面名称放在组织名称之前。对于多步骤过程的页面，将当前步骤包含在页面标题中。

{::nomarkdown}
{% include box.html type="start" title="示例：页面标题" class="example" %}
{:/}

<div class="page-title">
  <figure>
    <figcaption>{% include icon.html name="check-circle" label="OK" %} 主页标题</figcaption>
    <div>
      <svg version="1.1" width="462" height="27">
        <g transform="scale(1.2)">
          <path class="banner" d="M 0 9.75 L 0 14.8125 L 0 21.625 L 384.5 21.625 L 384.5 14.8125 L 384.5 9.75 L 384.5 3.25 C 384.5 1.59314575 383.15685 .25 381.5 .25 L 3 .25 C 1.34314575 .25 0 1.59314575 0 3.25 Z" fill="#f5f5f5"/>
          <text transform="translate(10 15)">Space Teddy Inc.</text>
          <g transform="translate(333 4)">
            <rect x="0" y="9.5" width="10" height="1.5"/>
            <path d="M 24 10 L 17 10 L 17 4 L 24 4 Z M 16 11 L 25 11 L 25 3 L 16 3 Z"/>
            <path d="M 41 3 L 40 2 L 36 6 L 32 2 L 31 3 L 35 7 L 31 11 L 32 12 L 36 8 L 40 12 L 41 11 L 37 7 Z"/>
          </g>
        </g>
      </svg>
    </div>
  </figure>
  <figure>
    <figcaption>{% include icon.html name="check-circle" label="OK" %} 页面名称后跟组织名称</figcaption>
    <div>
      <svg version="1.1" width="462" height="27">
        <g transform="scale(1.2)">
          <path class="banner" d="M 0 9.75 L 0 14.8125 L 0 21.625 L 384.5 21.625 L 384.5 14.8125 L 384.5 9.75 L 384.5 3.25 C 384.5 1.59314575 383.15685 .25 381.5 .25 L 3 .25 C 1.34314575 .25 0 1.59314575 0 3.25 Z" fill="#f5f5f5"/>
          <text transform="translate(10 15)">Latest News &bull; Space Teddy Inc.</text>
          <g transform="translate(333 4)">
            <rect x="0" y="9.5" width="10" height="1.5"/>
            <path d="M 24 10 L 17 10 L 17 4 L 24 4 Z M 16 11 L 25 11 L 25 3 L 16 3 Z"/>
            <path d="M 41 3 L 40 2 L 36 6 L 32 2 L 31 3 L 35 7 L 31 11 L 32 12 L 36 8 L 40 12 L 41 11 L 37 7 Z"/>
          </g>
        </g>
      </svg>
    </div>
  </figure>
  <figure>
    <figcaption>{% include icon.html name="check-circle" label="OK" %} 页面名称包括流程中的步骤</figcaption>
    <div>
      <svg version="1.1" width="462" height="27">
        <g transform="scale(1.2)">
          <path class="banner" d="M 0 9.75 L 0 14.8125 L 0 21.625 L 384.5 21.625 L 384.5 14.8125 L 384.5 9.75 L 384.5 3.25 C 384.5 1.59314575 383.15685 .25 381.5 .25 L 3 .25 C 1.34314575 .25 0 1.59314575 0 3.25 Z" fill="#f5f5f5"/>
          <text transform="translate(10 15)">Buy Your Bear (Step 1 of 3) &bull; Space Teddy Inc.</text>
          <g transform="translate(333 4)">
            <rect x="0" y="9.5" width="10" height="1.5"/>
            <path d="M 24 10 L 17 10 L 17 4 L 24 4 Z M 16 11 L 25 11 L 25 3 L 16 3 Z"/>
            <path d="M 41 3 L 40 2 L 36 6 L 32 2 L 31 3 L 35 7 L 31 11 L 32 12 L 36 8 L 40 12 L 41 11 L 37 7 Z"/>
          </g>
        </g>
      </svg>
    </div>
  </figure>
</div>

{::nomarkdown}
{% include box.html type="end" %}
{:/}

{::nomarkdown}
{% include box.html type="start" title="更多信息" class="simple" %}
{:/}

* **WCAG**
  * [页面标题 2.4.2](/WAI/WCAG21/quickref/#page-titled) ([理解 2.4.2](/WAI/WCAG21/Understanding/page-titled))

{::nomarkdown}
{% include box.html type="end" %}
{:/}

## 使用标题传达含义和结构

使用简短的标题来组织相关的段落，并清楚地描述各个部分。良好的标题提供了内容的大纲。

{::nomarkdown}
{% include box.html type="start" title="示例：使用标题组织内容" class="example" %}
{:/}

<div class="heading-structure two-column">
  <figure>
    <figcaption>{% include icon.html name="ex-circle" label="Wrong" %} 缺少标题</figcaption>
    <div>
      {% include image.html src="tips/headings-poor.png" alt="Illustration of no headings, see below for detailed example" %}
    </div>
{% include excol.html type="start" id="no-headings" %}
查看内联示例
{% include excol.html type="middle" %}
<h2 id="no-headings-modal-title"><span class="visuallyhidden">示例： </span>标题和副标题</h2>

<p>HTML元素提供文档的结构层次信息。正确使用这些元素将有助于传达辅助技术的附加含义。在许多情况下，这样做也会使您的文档更容易编辑。</p>

<p>对于超过三到四段的文档，标题和副标题对于可用性和无障碍性很重要。它们帮助读者确定文档的总体大纲，并导航到感兴趣的特定信息。</p>

<p>标题分为六个级别。最高级别是“级别1”，通常对应于页面的标题或主要文档部分。</p>

<p>视觉读者通过扫描页面，寻找更大或不同样式的文本来识别标题。辅助技术用户无法看到这些视觉变化，因此更改样式不是足够的线索。</p>

<p>相反，标题必须语义化“标记”，以便辅助技术可以识别标题。然后，标题也可以用于导航。</p>

<p>这使得添加标题成为屏幕阅读器用户最重要的工具之一，因此他们可以了解页面上的内容。请注意，标记通常会触发视觉上的格式更改，这可以在许多文档中进行调整。</p>

<cite>改编自<a href="https://accessibility.psu.edu/headings/">宾夕法尼亚州立大学的标题和副标题</a></cite>
{% include excol.html type="end" %}
  </figure>
  <figure>
    <figcaption>{% include icon.html name="check-circle" label="OK" %} 使用标题和副标题</figcaption>
    <div>
      {% include image.html src="tips/headings-good.png" alt="Illustration of good heading structure, see below for detailed example"%}
    </div>
{% include excol.html type="start" id="headings-good" %}
查看内联示例
{% include excol.html type="middle" %}
<h2 id="headings-modal-title"><span class="visuallyhidden">示例： </span>标题和副标题</h2>

<p><abbr>HTML</abbr>元素提供文档的结构层次信息。正确使用这些元素将有助于传达辅助技术的附加含义。在许多情况下，这样做也会使您的文档更容易编辑。</p>

<h3><span class="visuallyhidden">示例： </span>标题的目的</h3>

<p>对于超过三到四段的文档，标题和副标题对于可用性和无障碍性很重要。它们帮助读者确定文档的总体大纲，并导航到感兴趣的特定信息。</p>

<h4><span class="visuallyhidden">示例： </span>标题的级别</h4>

<p>标题分为六个级别。最高级别是“级别1”，通常对应于页面的标题或主要文档部分。</p>

<h3><span class="visuallyhidden">示例： </span>含义与格式</h3>

<p>视觉读者通过扫描页面，寻找更大或不同样式的文本来识别标题。辅助技术用户无法看到这些视觉变化，因此更改样式不是足够的线索。</p>

<p>相反，标题必须语义化“标记”，以便辅助技术可以识别标题。然后，标题也可以用于导航。</p>

<p>这使得添加标题成为屏幕阅读器用户最重要的工具之一，因此他们可以了解页面上的内容。请注意，标记通常会触发视觉上的格式更改，这可以在许多文档中进行调整。</p>

<cite>改编自<a href="https://accessibility.psu.edu/headings/">宾夕法尼亚州立大学的标题和副标题</a></cite>
{% include excol.html type="end" %}
  </figure>
</div>

{::nomarkdown}
{% include box.html type="end" %}
{:/}

{::nomarkdown}
{% include box.html type="start" title="更多信息" class="simple" %}
{:/}

* **WCAG**
  * [标题和标签 2.4.6](/WAI/WCAG21/quickref/#headings-and-labels) ([理解 2.4.6](/WAI/WCAG21/Understanding/headings-and-labels))
  * [部分标题 2.4.10](/WAI/WCAG21/quickref/#section-headings) ([理解 2.4.10](/WAI/WCAG21/Understanding/section-headings))
  * [Headings and Labels 2.4.6](/WAI/WCAG21/quickref/#headings-and-labels) ([Understanding 2.4.6](/WAI/WCAG21/Understanding/headings-and-labels))
  * [Section Headings 2.4.10](/WAI/WCAG21/quickref/#section-headings) ([Understanding 2.4.10](/WAI/WCAG21/Understanding/section-headings))
  * [Info and Relationships 1.3.1](/WAI/WCAG21/quickref/#info-and-relationships) ([Understanding 1.3.1](/WAI/WCAG21/Understanding/info-and-relationships))
* **User Stories**
  * [[Ade, reporter with limited use of his arms]](/people-use-web/user-stories/story-one/)
  * [[Ian, data entry clerk with autism]](/people-use-web/user-stories/story-two/)
  * [[Lakshmi, senior accountant who is blind]](/people-use-web/user-stories/story-three/)
  * [[Stefan, student with attention deficit hyperactivity disorder and dyslexia]](/people-use-web/user-stories/story-eight/)

{::nomarkdown}
{% include_cached box.html type="end" %}
{:/}

## Make link text meaningful

Write link text so that it describes the content of the link target. Avoid using ambiguous link text, such as 'click here' or 'read more'. Indicate relevant information about the link target, such as document type and size, for example, 'Proposal Documents (RTF, 20MB)'.

{::nomarkdown}
{% include_cached box.html type="start" title="Example: Using link text to describe target page" class="example" %}
{:/}

<div class="meaningful-links two-column">
  <figure>
    <figcaption>{% include_cached icon.html name="ex-circle" label="Wrong" %} No information</figcaption>
    <div>
      <p class="fail">For more information on device independence, <a href="javascript:return false">click here</a>.</p>
    </div>
  </figure>
  <figure>
    <figcaption>{% include_cached icon.html name="check-circle" label="OK" %} Meaningful information</figcaption>
    <div>
      <p class="pass">Read more <a href="javascript: return false">about device independence</a>.</p>
    </div>
  </figure>
</div>

{::nomarkdown}
{% include_cached box.html type="end" %}
{:/}

{::nomarkdown}
{% include_cached box.html type="start" title="More Information" class="simple" %}
{:/}

* **WCAG**
  * [Link Purpose (In Context) 2.4.4](/WAI/WCAG21/quickref/#link-purpose-in-context) ([Understanding 2.4.4](/WAI/WCAG21/Understanding/link-purpose-in-context))
  * [Link Purpose (Link Only) 2.4.9](/WAI/WCAG21/quickref/#link-purpose-link-only) ([Understanding 2.4.9](/WAI/WCAG21/Understanding/link-purpose-link-only))
* **User Stories**
  * [[Ade, reporter with limited use of his arms]](/people-use-web/user-stories/story-one/)
  * [[Ian, data entry clerk with autism]](/people-use-web/user-stories/story-two/)
  * [[Lakshmi, senior accountant who is blind]](/people-use-web/user-stories/story-three/)
  * [[Stefan, student with attention deficit hyperactivity disorder and dyslexia]](/people-use-web/user-stories/story-eight/)
  * [[Elias, retiree with low vision, hand tremor, and mild short-term memory loss]](/people-use-web/user-stories/story-nine/)

{::nomarkdown}
{% include_cached box.html type="end" %}
{:/}

## Write meaningful text alternatives for images

For every image, write alternative text that provides the information or function of the image. For purely decorative images, there is no need to write alternative text.

{::nomarkdown}
{% include_cached box.html type="start" title="Example: Using alternative text to communicate important information" class="example" %}
{:/}

<div class="text-alt two-column">
  <figure>
    <figcaption>{% include_cached icon.html name="ex-circle" label="Wrong" %} Uninformative</figcaption>
    <div>
      {% include_cached image.html src="tips/phone_charging.png" alt="Charging phone"  float="left" %}
      <div>
        <p> Charging the phone: Connect the phone to a power outlet using the cable and power adaptor provided.</p>
        <p><strong>Alternative text for image</strong>: "Charging phone"</p>
      </div>
    </div>
  </figure>
  <figure>
    <figcaption>{% include_cached icon.html name="check-circle" label="OK" %} Informative</figcaption>
    <div>
      {% include_cached image.html src="tips/phone_charging.png" alt="Plug cable into the bottom edge of the phone." float="left" %}
      <div>
        <p>Charging the phone: Connect the phone to a power outlet using the cable and power adaptor provided.</p>
        <p><strong>Alternative text for image</strong>: "Plug cable into the bottom edge of the phone."</p>
      </div>
    </div>
  </figure>
</div>
<p class="note">Alternative text is usually not visible; it is included in this example just so you can see what it is.</p>

{::nomarkdown}
{% include_cached box.html type="end" %}
{:/}

{::nomarkdown}
{% include_cached box.html type="start" title="More Information" class="simple" %}
{:/}

* **WCAG**
  * [Non-text Content 1.1.1](/WAI/WCAG21/quickref/#non-text-content) ([Understanding 1.1.1](/WAI/WCAG21/Understanding/non-text-content))
* **Tutorial**
  * [Images](/tutorials/images/)
* **User Story**
  * [[Lakshmi, senior accountant who is blind]](/people-use-web/user-stories/story-three/)

{::nomarkdown}
{% include_cached box.html type="end" %}
{:/}

## Create transcripts and captions for multimedia

For audio-only content, such as a podcast, provide a transcript. For audio and visual content, such as training videos, also provide captions. Include in the transcripts and captions the spoken information and sounds that are important for understanding the content, for example, 'door creaks'. For video transcripts, also include a description of the important visual content, for example 'Athan leaves the room'.

{::nomarkdown}
{% include_cached box.html type="start" title="More Information" class="simple" %}
{:/}

* **[[Making Audio and Video Media Accessible]](/media/av/)**

* **WCAG**
  * [Captions (Prerecorded) 1.2.2](/WAI/WCAG21/quickref/#captions-prerecorded) ([Understanding 1.2.2](/WAI/WCAG21/Understanding/captions-prerecorded))
  * [Audio Description or Media Alternative (Prerecorded) 1.2.3](/WAI/WCAG21/quickref/#audio-description-or-media-alternative-prerecorded) ([Understanding 1.2.3](/WAI/WCAG21/Understanding/audio-description-or-media-alternative-prerecorded))
* **User Stories**
  * [[Dhruv, older adult student who is deaf]](/people-use-web/user-stories/story-six/)
  * [[Marta, marketing assistant who is deaf and blind]](/people-use-web/user-stories/story-seven/)

{::nomarkdown}
{% include_cached box.html type="end" %}
{:/}

## Provide clear instructions

Ensure that instructions, guidance, and error messages are clear, easy to understand, and avoid unnecessarily technical language. Describe input requirements, such as date formats.

{::nomarkdown}
{% include_cached box.html type="start" title="Example: Instructions communicate what information the user should provide" class="example" %}
{:/}

<div class="errors">
  <figure>
    <div>
      <form action="#" method="post">
        <p id="password-desc">Password should be at least six characters with at least one number (0-9).</p>
        <div class="row">
          <label for="password">Password</label>
          <input aria-describedby="password-desc" type="password" id="password" name="password" value="">
        </div>
      </form>
    </div>
  </figure>
</div>

{::nomarkdown}
{% include box.html type="end" %}
{:/}

{::nomarkdown}
{% include box.html type="start" title="Example: Error indicates what the problem is and, possibly, how to fix it" class="example" %}
{:/}

<div class="errors">
  <figure>
    <div>
      <ol class="fa-ul error-list">
        <li id="error_email">{% include_cached icon.html name="warning" label="Error" %} <a href="javascript:return false">The username 'superbear' is already in use.</a></li>
        <li id="error_password">{% include_cached icon.html name="warning" label="Error" %} <a href="javascript:return false">The password needs to include at least one number.</a></li>
      </ol>
    </div>
  </figure>
</div>

{::nomarkdown}
{% include_cached box.html type="end" %}
{:/}

{::nomarkdown}
{% include_cached box.html type="start" title="More Information" class="simple" %}
{:/}

* **WCAG**
  * [Labels or Instructions 3.3.2](/WAI/WCAG21/quickref/#labels-or-instructions) ([Understanding 3.3.2](/WAI/WCAG21/Understanding/labels-or-instructions))
* **User Stories**
  * [[Ian, data entry clerk with autism]](/people-use-web/user-stories/story-two/)
  * [[Stefan, student with attention deficit hyperactivity disorder and dyslexia]](/people-use-web/user-stories/story-eight/)
  * [[Elias, retiree with low vision, hand tremor, and mild short-term memory loss]](/people-use-web/user-stories/story-nine/)

{::nomarkdown}
{% include_cached box.html type="end" %}
{:/}

## Keep content clear and concise

Use simple language and formatting, as appropriate for the context.

* Write in short, clear sentences and paragraphs.
* Avoid using unnecessarily complex words and phrases.
* Expand acronyms on first use. For example, Web Content Accessibility Guidelines (WCAG).
* Consider providing a glossary for terms readers may not know.
* Use list formatting as appropriate.
* Consider using images, illustrations, video, audio, and symbols to help clarify meaning.

{::nomarkdown}
{% include_cached box.html type="start" title="Example: Making content readable and understandable" class="example" %}
{:/}

<div class="two-column">
  <figure class="from-col1 to-col2">
    <figcaption>{% include_cached icon.html name="ex-circle" label="Wrong" %} Unnecessarily complex</figcaption>
    <div>
      <p class="fail">CPP: In the event of a vehicular collision, a company assigned representative will seek to ascertain the extent and cause of damages to property belonging to all parties involved. Once our representative obtains information that allows us to understand the causality, we may or may not assign appropriate monetary compensation. The resulting decision may occasion one of the following options: the claim is not approved and is assigned a rejected status, the status of the claim is ambiguous and will require additional information before further processing can occur, the claim is partially approved and reduced payment is assigned and issued, or claim is fully approved and total claim payment is assigned and issued.</p>
    </div>
  </figure>
  <figure class="from-col3 to-col4">
    <figcaption>{% include_cached icon.html name="check-circle" label="OK" %} Easier to understand</figcaption>
    <div>
      <p class="pass">Claims Processing Procedure (CPP): If you have a car accident, our agent will investigate. Findings will determine any claim payment. This could result in:</p>
      <ul>
        <li>Approved claim - full payment</li>
        <li>Partially approved claim - reduced payment</li>
        <li>Undetermined claim - more information needed</li>
        <li>Rejected claim - no payment</li>
      </ul>
      <p>{% include_cached image.html src="tips/clear_text_diagram.png" alt="" style="max-width:100%" %}</p>
    </div>
  </figure>
</div>

{::nomarkdown}
{% include_cached box.html type="end" %}
{:/}

{::nomarkdown}
{% include_cached box.html type="start" title="More Information" class="simple" %}
{:/}

* **WCAG**
  * [Reading Level 3.1.5](/WAI/WCAG21/quickref/#reading-level) ([Understanding 3.1.5](/WAI/WCAG21/Understanding/reading-level))
  * [Unusual Words 3.1.3](/WAI/WCAG21/quickref/#unusual-words) ([Understanding 3.1.3](/WAI/WCAG21/Understanding/unusual-words))
  * [Abbreviations 3.1.4](/WAI/WCAG21/quickref/#abbreviations) ([Understanding 3.1.4](/WAI/WCAG21/Understanding/abbreviations))
* **User Stories**
  * [[Ian, data entry clerk with autism]](/people-use-web/user-stories/story-two/)
  * [[Sophie, basketball fan with Down syndrome]](/people-use-web/user-stories/story-five/)
  * [[Stefan, student with attention deficit hyperactivity disorder and dyslexia]](/people-use-web/user-stories/story-eight/)

{::nomarkdown}
{% include_cached box.html type="end" %}
{:/}

{::nomarkdown}
{% include box.html type="start" title="Learn More About Accessibility" class="large" icon="readmore" %}
{:/}

These tips are a few of the things you need to consider for web accessibility. Additional guidance on writing that meets the accessibility needs of people with cognitive and learning disabilities is in **[Use Clear and Understandable Content](https://www.w3.org/WAI/WCAG2/supplemental/objectives/o3-clear-content/)**.

The following resources help you learn why accessibility is important, and about guidelines for making the web more accessible to people with disabilities.

* [Accessibility Introduction](/fundamentals/accessibility-intro/) — Introduces accessibility and provides links to many helpful resources
* [Accessibility Principles](/fundamentals/accessibility-principles/) — An introduction to the <abbr>WCAG</abbr> requirements
* [How people with disabilities use the web](/people-use-web/) — Real-life examples showing the importance of accessibility for people with disabilities
* [How to Meet WCAG (Quick Reference)](/WAI/WCAG21/quickref/) — customizable reference of all WCAG requirements and techniques

{::nomarkdown}
{% include box.html type="end" %}
{:/}
