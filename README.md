# TurkerGaze
TurkerGaze: Crowdsourcing Saliency with Webcam based Eye Tracking

### Instructions
```bash
> ./scripts/install.sh
> npm install
> npm start

```

Created by Pingmei Xu, Jianxiong Xiao at Princeton Vision Group.

### Introduction
TurkerGaze is a webcam-based eye tracking game for collecting large-scale eye tracking data via crowdourcing. It is implemented in javascript and the details were described in an [arXiv tech report](http://arxiv.org/abs/1504.06755).

![system overview](http://isun.cs.princeton.edu/TurkerGaze/demo/system_overview.png)

### Citing
If you find TurkerGaze useful in your research, please consider citing:

    @article{xu15arXiv,
        Author = {Pingmei Xu, Krista A Ehinger, Yinda Zhang, Adam Finkelstein, Sanjeev R. Kulkarni, Jianxiong Xiao},
        Title = {Rich feature hierarchies for accurate object detection and semantic segmentation},
        Booktitle = {arXiv:1504.06755},
        Year = {2015}
    }

### Usage

0. See a demo
	0. Setup a local web server, download the folder, open 'pugazetrackr.html' to run the eye tracking task. Save the result data to a local file and visualize the result by 'visualizer.html'.
	0. You can also try it here:
	[eye tracking task](http://isun.cs.princeton.edu/TurkerGaze/pugazetrackr.html)
	[visualization](http://isun.cs.princeton.edu/TurkerGaze/visualizer.html)


0. User your own images
	0. Create a .json object with two fields: 'gaze' and 'memory' like './demo/imglist.json'. 'gaze' contains the images that you want to present for free-viewing, and 'memory' contains images for the memory test.
	0. Pass the path of this .json file by url parameter 'imglist'. For example, http://isun.cs.princeton.edu/TurkerGaze/pugazetrackr.html?imglist=your_imglist_url
	0. Run the task!


### License
TurkerGaze is released under the MIT License (refer to the LICENSE file for details).


