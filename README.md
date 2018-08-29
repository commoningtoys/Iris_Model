# Iris_Model (beta)

### Description

🔜

## Usage

1. Clone the model using the download button up there ↗️

   1. copy the path to your clipboard

   2. open terminal on your computer 💻 (you can find the terminal in utilities folder 📁 of your mac)

   3. if you have `git` already installed than skip to point __iv__, else download git [here](https://git-scm.com/download/mac)

   4. in the terminal type

      ```bash
      $ cd pathTo/theDirectory
      # first we choose in which directory we want to save our model
      # it also possible to just type "cd" and drag and drop the folder
      # where you want the model to be saved onto the terminal
      
      $ git clone https://github.com/commoningtoys/Iris_Model.git
      # the url may change in the future therefore copy it
      # from the "clone or download" window on the github page
      ```

2. after that you need to download all the branches 🎋

   ```bash
   $ git pull origin --all
   # this will download all the branches on your machine
   ```

3. open the model with your favorite code editor

4. depending on the editor (VS Code and Atom have built in server) you may need to install [MAMP](https://www.mamp.info/en/downloads/#mac)

   1. if using MAMP make sure that the root folder is linked to the folder were your model is. To do this go to MAMP ➡️ preferences ➡️ web server and drag and drop the folder where the model is to the __document root__

5. open the browser  and if using MAMP go to `localhost:8888`, if using VS Code or Atom run the built in server. 

6. Now the model should be running  on your browser BRAVO! 👍👏 

7. to switch between the various settings of the model you will need to switch between different branches 🎋. In the terminal use the followings commands

   ```bash
   $ git checkout branch-name
   # available branches:
   # minimum-wage      | this branch sets a minimum wage the agents
   # all-capitalist    | a model with only capitalist agents
   # all-perfectionist | a model with only perfectionist agents
   # all-curious       | a model with only curious agents
   # all-geniesser     | a model with only geniesser agents
   
   # to see which branches are on your machine
   $ git branch
         all-capitalist
         all-curious
         all-geniesser
         all-perfectionist
       * master # the * tells you on which branch you are currently on
         minimum-wage
         old-model
   ```

8. refresh your browser to see the new model running
