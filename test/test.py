from flask import Flask, render_template

app = Flask(__name__, static_url_path='', static_folder='../lib', template_folder='./')

@app.route('/')
def index():
    return render_template('test_gen.html')

if __name__ == '__main__':
    app.run()