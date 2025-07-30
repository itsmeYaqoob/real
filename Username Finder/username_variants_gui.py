import tkinter as tk
from tkinter import simpledialog, messagebox
import webbrowser

# Example starting usernames
usernames = ['yaqoob']

# Variant generator
def generate_variants(base):
    return [
        base,
        base + 'pk',
        base + '.official',
        'real' + base,
        'iam' + base,
        base + 'online'
    ]

# Holds all variants and user decisions
all_variants = set()
approved = set()
rejected = set()

for uname in usernames:
    all_variants.update(generate_variants(uname))

def open_youtube(username):
    url = f'https://www.youtube.com/@{username}'
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
    tk.Label(frame, text=username, width=25).pack(side='left')
    tk.Button(frame, text='Open', command=lambda: open_youtube(username)).pack(side='left')
    tk.Button(frame, text='Approve', command=lambda: approve_variant(username, frame)).pack(side='left')
    tk.Button(frame, text='Reject', command=lambda: reject_variant(username, frame)).pack(side='left')

root = tk.Tk()
root.title("Username Variant Approver")

variant_frame = tk.Frame(root)
variant_frame.pack(padx=10, pady=10)

for variant in sorted(all_variants):
    show_variant(variant)

tk.Button(root, text="Add Variant", command=add_variant).pack(pady=5)

def export_approved():
    with open('approved_usernames.txt', 'w') as f:
        for u in approved:
            f.write(u + '\n')
    messagebox.showinfo("Export", "Approved usernames exported!")

tk.Button(root, text="Export Approved", command=export_approved).pack(pady=5)

root.mainloop()