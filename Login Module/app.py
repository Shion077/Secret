from flask import Flask, render_template, request, redirect, url_for, session, send_from_directory, jsonify
import os ,json

app = Flask(__name__, template_folder='html', static_folder='css')
app.secret_key = 'your_secret_key'

def load_users():
    if not os.path.exists("users.json"):
        with open("users.json", "w") as f:
            json.dump([], f)
    with open("users.json", "r") as f:
        return json.load(f)

def save_users(users):
    with open("users.json", "w") as f:
        json.dump(users, f, indent=4)

@app.route('/css/<path:filename>')
def custom_css(filename):
    return send_from_directory('css', filename)

@app.route('/js/<path:filename>')
def custom_js(filename):
    return send_from_directory('js', filename)

@app.route('/img/<path:filename>')
def custom_img(filename):
    return send_from_directory('img', filename)

@app.route('/', methods=['GET'])
@app.route('/login', methods=['GET'])
def login_page():
    return render_template("Login.html")

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        identifier = request.form['identifier']
        password = request.form['password']

        with open("users.json", "r") as f:
            users = json.load(f)

        for user in users:
            if user["email"].lower() == identifier.lower() or user["phone"] == identifier:
                if user["password"] == password:
                    session['user'] = user
                   
                    if user["role"].lower() in ["admin", "headadmin"]:
                        return redirect("/admin_dashboard")
                    else:
                        return redirect("/patient_site")
                else:
                    return render_template("Login.html", password_error="Incorrect password.", email_error="")
        
        return render_template("Login.html", email_error="Email or phone not found.", password_error="")

    
    return render_template("Login.html", password_error="", email_error="")


@app.route('/admin_dashboard')
def admin_dashboard():
    if 'user' not in session:
        return redirect(url_for('login'))
    if session['user']['role'] not in ['Admin', 'HeadAdmin']:
        return "Access Denied", 403
    return render_template('Welcomeadmin.html', user=session['user'])

@app.route('/patient_site')
def patient_site():
    if 'user' not in session:
        return redirect(url_for('login'))
    if session['user']['role'] != 'Patient':
        return "Access Denied", 403
    return render_template('Welcome.html', user=session['user'])

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'GET':
        return render_template('Register.html')

    data = request.get_json()
    users = load_users()

    firstname = data.get('firstname', '').strip()
    lastname = data.get('lastname', '').strip()
    email = data.get('email', '').lower().strip()
    phone = data.get('phone', '').strip()
    country = data.get('country', '').strip()
    password = data.get('password', '')
    repeat_password = data.get('repeatPassword', '')
    role = 'patient'

    if not all([firstname, lastname, email, phone, country, password, repeat_password]):
        return jsonify(success=False, error="All fields are required.")

    if not firstname.isalpha() or not lastname.isalpha():
        return jsonify(success=False, error="Firstname and Lastname must contain only letters.")

    if '@gmail.com' not in email or not email.endswith('@gmail.com'):
        return jsonify(success=False, error="Email must be a Gmail address.")

    if not phone.isdigit() or len(phone) != 11:
        return jsonify(success=False, error="Phone number must be 11 digits.")

    if len(password) < 8 or len(password) > 15:
        return jsonify(success=False, error="Password must be 8–15 characters.")

    if not any(c in "!@#$%^&*()-_=+[{]};:'\",<.>/?\\|" for c in password):
        return jsonify(success=False, error="Password must include a special character.")

    if not any(c.isdigit() for c in password):
        return jsonify(success=False, error="Password must include a number.")

    if password != repeat_password:
        return jsonify(success=False, error="Passwords do not match.")

    if any(user['email'] == email or user['phone'] == phone for user in users):
        return jsonify(success=False, error="User already exists with this email or phone.")

    new_id = max([user.get("id", 0) for user in users], default=0) + 1
    new_user = {
        "id": new_id,
        "firstname": firstname,
        "lastname": lastname,
        "email": email,
        "phone": phone,
        "country": country,
        "password": password,
        "role": role
    }
    users.append(new_user)
    save_users(users)
    return jsonify(success=True)

@app.route('/Forgot_Password')
def Forgot_Password():
    return render_template('ForgotPassword.html')

@app.route('/Email-Identifier', methods=['POST'])
def verify_identifier():
    data = request.get_json()
    identifier = data.get("identifier", "")

    users = load_users()
    for user in users:
        if user['email'].lower() == identifier.lower() or user['phone'] == identifier:
            return {"success": True, "redirect": "/"}

    return {"success": False, "message": "❌ Error Email/Cellphone number Not Registered."}

@app.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    identifier = data.get("identifier", '').lower()
    new_password = data.get("new_password")

    users = load_users()
    for user in users:
        if user['email'] == identifier or user['phone'] == identifier:
            user['password'] = new_password
            save_users(users)
            return {"success": True, "redirect": "/"}

    return {"success": False, "message": "User not found"}

@app.route('/logout', methods=['POST'])
def logout():
    session.clear()  # Clear the session
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(debug=True)
