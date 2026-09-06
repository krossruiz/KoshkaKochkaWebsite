

import sys
import argparse
import struct
from pathlib import Path

def query_name(filename):
    def get_string(f, off, length):
        string = None
        try:
            location = f.tell()
            f.seek(off)
            string = f.read(length)
            f.seek(location)
            return string.decode("UTF-16BE")
        except UnicodeDecodeError:
            try:
                return string.decode("UTF8")
            except UnicodeDecodeError:
                return string

    with open(filename, "rb") as f:
        (
            sfnt_version,
            num_tables,
            search_range,
            entry_selector,
            range_shift,
        ) = struct.unpack(">LHHHH", f.read(12))

        name_table = False
        for i in range(num_tables):
            tag, checksum, offset, length = struct.unpack(">4sLLL", f.read(16))
            if tag == b"name":
                f.seek(offset)
                name_table = True
                break
        if not name_table:
            return None, None, None

        # We are now at the name table.
        table_start = f.tell()
        (
            fmt,
            count,
            strings_offset,
        ) = struct.unpack(">HHH", f.read(6))
        if fmt == 1:
            (langtag_count,) = struct.unpack(">H", f.read(2))
            for langtag_record in range(langtag_count):
                (langtag_len, langtag_offset) = struct.unpack(">HH", f.read(4))

        font_family = None
        font_subfamily = None
        font_name = None
        for record_index in range(count):
            (
                platform_id,
                platform_specific_id,
                language_id,
                name_id,
                length,
                record_offset,
            ) = struct.unpack(">HHHHHH", f.read(2 * 6))
            pos = table_start + strings_offset + record_offset
            if name_id == 1:
                font_family = get_string(f, pos, length)
            elif name_id == 2:
                font_family = get_string(f, pos, length)
            elif name_id == 4:
                font_name = get_string(f, pos, length)
            if font_family and font_subfamily and font_name:
                break
        return font_family, font_subfamily, font_name


def main():
    parser = argparse.ArgumentParser(description="Find font name from file path.")
    parser.add_argument("file", help="Path to the file to query")
    args = parser.parse_args()

    p = Path(args.file)
    if not p.is_file():
        print(f"Error: file not found: {p}", file=sys.stderr)
        sys.exit(1)

    result = query_name(str(p))
    print(result)

if __name__ == "__main__":
    main()