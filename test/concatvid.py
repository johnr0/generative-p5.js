import imageio
from PIL import Image

reader0 = imageio.get_reader('./test_results/04232023_3d_t2v_zero_nomotion_colab/video.mp4')
reader1 = imageio.get_reader('./test_results/04232023_3d_t2v_zero_motion_colab/video10_linear.mp4')
reader2 = imageio.get_reader('./test_results/04232023_3d_t2v_zero_motion_colab/video20_linear.mp4')
reader3 = imageio.get_reader('./test_results/04232023_3d_t2v_zero_motion_colab/video30_linear.mp4')
reader4 = imageio.get_reader('./test_results/04232023_3d_t2v_zero_motion_colab/video_slowmotion_sin.mp4')
reader5 = imageio.get_reader('./test_results/04232023_3d_t2v_zero_motion_colab/video90_linear.mp4')

frames = []

for reader in [reader0, reader1, reader2, reader3, reader4, reader5]:
    cur_frames = [Image.fromarray(reader.get_data(i)) for i in range(reader.count_frames())]
    frames = frames+cur_frames
imageio.mimsave("vd.mp4", frames, fps=30)