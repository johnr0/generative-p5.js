from moviepy.editor import ImageSequenceClip
import os

# Set the directory where the image files are stored
image_dir = "./test_results/basegrow"

# Load the image files into a list
files = os.listdir(image_dir)
files.sort(key=lambda x: os.path.getmtime(os.path.join(image_dir, x)))

images = [f"{image_dir}/{img}" for img in files if img.endswith(".png")]
# print(images)
# Create a video clip from the images
clip = ImageSequenceClip(images, fps=30)

# Set the filename and format of the output video
output_file = "/path/to/output.mp4"

# Write the video file
output_file = image_dir+"/output.mp4"
clip.write_videofile(output_file, fps=30)