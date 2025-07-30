import tkinter as tk
from tkinter import filedialog, simpledialog, messagebox
import webbrowser

# Choose your preferred base name
BASE_NAME = "yourname"  # Change as needed

def load_usernames(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        return [line.strip() for line in f if line.strip()]

def generate_variants(base, top_names):
    return [f"{base}_{name}" for name in top_names]

def open_youtube(username):
    url = f"https://www.youtube.com/@{username}"
    webbrowser.open_new_tab(url)

def approve_variant(username, btn_frame):
    approved.add(username)
    btn_frame.destroy()

def reject_variant(username, btn_frame):
    rejected.add(username)
    btn_frame.destroy()

def add_variant():
    new_var = simpledialog.askstring("Add Variant", "Enter new username variant:")
    if new_var and new_var not in all_variants:
        all_variants.add(new_var)
        show_variant(new_var)

def show_variant(username):
    frame = tk.Frame(variant_frame)
    frame.pack(fill='x', pady=2)
    tk.Label(frame, text=username, width=32).pack(side='left')
    tk.Button(frame, text='Open', command=lambda: open_youtube(username)).pack(side='left')
    tk.Button(frame, text='Approve', command=lambda: approve_variant(username, frame)).pack(side='left')
    tk.Button(frame, text='Reject', command=lambda: reject_variant(username, frame)).pack(side='left')

def export_approved():
    with open('approved_usernames.txt', 'w', encoding='utf-8') as f:
        for u in approved:
            f.write(u + '\n')
    messagebox.showinfo("Export", "Approved usernames exported!")

# GUI setup
root = tk.Tk()
root.title("Username Variant Merger")

variant_frame = tk.Frame(root)
variant_frame.pack(padx=10, pady=10)

# Load top usernames from file dialog
filename = filedialog.askopenfilename(title="Select Top Usernames File", filetypes=[("Text files","*.txt *.csv")])
top_usernames = load_usernames(filename)
all_variants = set(generate_variants(BASE_NAME, top_usernames))
approved = set()
rejected = set()

for variant in sorted(all_variants):
    show_variant(variant)

tk.Button(root, text="Add Variant", command=add_variant).pack(pady=5)
tk.Button(root, text="Export Approved", command=export_approved).pack(pady=5)

root.mainloop()