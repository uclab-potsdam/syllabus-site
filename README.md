
# Syllabus Site

This is an experiment in documenting design courses and a template for displaying Markdown files as scrollable web pages.


![](img/parallax.gif)
The parallax effect separates items as foreground from sections as background.


Design is all about process, yet we tend to focus on results when documenting design courses. This is an attempt to shift the focus from the latter to the former.


This page tries to answer [Why](#why), [What](#what) & [How](#how). 

---

## Why 

In the realm of design education, there's a common emphasis on the final outcomes—be it presentations or prototypes. This focus, while essential, tends to sideline the  exploratory and dynamic process leading to these results. The journey to the final projects is marked by twists, turns, and tangents. This is where much of the learning and discovery occurs. 


*Syllabus Site* was conceived as a tool to highlight and document these critical but frequently overlooked aspects of design courses. It serves as a dynamic interface chronicling the semester-long voyage of seminar participants through an array of readings, activities, and discussions. This approach not only retains but celebrates the evolving nature of a design course's intellectual journey, ensuring that the wealth of shared inspirations—from historical examples and theoretical frameworks to contemporary projects and research studies—is preserved and made accessible. 


---

## What 

A *Syllabus Site* is a one-page website arranging its elements along sections that can be scrolled vertically.


### Structure

There are two types of elements:

- **Sections** – Larger blocks gather the material for weekly course sessions.
- **Items** – Smaller elements feature images, text, and other content.

Each item is connected with its section by a thin line. The navigation (≡) gives access to all sections.


### Design

The webpage is designed with the aim to open a evocative information space, where the sources that foster creativity, dialogue, and learning can be gathered, recapitulated, and appreciated. The monolithic structure of conventional documents is broken up, by introducing a relational quality to the connections between sections and items.


### Examples

So far the template has been used to document the following courses offered at [FH Potsdam](https://www.fh-potsdam.de/) in the [Interface Design](https://interface.fh-potsdam.de) program:

- **[Decolonizing Data Visualization – Visualizing Postcolonies](https://infovis.fh-potsdam.de/decolonizing/)** (Summer 2022)
- **[Organigrams for/from the future](https://infovis.fh-potsdam.de/organigrams/)** (Summer 2023)


![](img/decolonizing.png)
[Decolonizing Data Visualization – Visualizing Postcolonies](https://infovis.fh-potsdam.de/decolonizing/)  


![](img/organigrams.png)
[Organigrams for/from the future](https://infovis.fh-potsdam.de/organigrams/)  





---

## How

The *Syllabus Site* template can be easily used with minimal technical requirements.


### 🗄️ Files

The template has the following file structure:

      img/
      index.html
      src/
      README.md

The **`README.md`** file contains all the textual content of your page and references the images that you need to add to the **`img/`** directory. 

The **`index.html`** file connects template and your content; here you need to make a few edits to add title, description, and preview of your webpage. 

You do not need to change anything within **`src/`**, which contains the internal files of the template.


### 📖 Syntax

The `README.md` uses the [Markdown](https://en.wikipedia.org/wiki/Markdown) format, a markup language used by many platforms including GitHub.

There are two conventions we introduce to distinguish and connect sections and items:

- Sections are delineated by a horizontal rule `---` 
- Items are separated by two empty consecutive lines

Each section should contain a heading:
`#` for primary, `##` for secondary, and so on.



### 📝 Roll your own

1. Download or clone the [GitHub repository](https://github.com/uclab-potsdam/syllabus-site/)
2. Add your content into `README.md` and `img/`
3. Include title and open graph fields in `index.html` and adjust theme color


### ⚠️ Things to consider

- Make sure to include an expressive preview image `img/cover.png` ideally in the dimensions 1200x630
- Given that your webpage might be accessed from a mobile device, with a slow connection, and/or via a cellular data plan, make sure to optimize image file sizes.


---

[<img src='img/fhp.svg' style='height:2.25em'>](https://www.fh-potsdam.de/) 
[<img src='img/id.svg' style='height:1.75em'>](https://interface.fh-potsdam.de/) 

[Contact](mailto:marian.doerk@fh-potsdam.de,philipp.proff@gmx.de?subject=Syllabus%20Site) · [Imprint](https://www.fh-potsdam.de/impressum) · [Source](https://github.com/uclab-potsdam/syllabus-site/)