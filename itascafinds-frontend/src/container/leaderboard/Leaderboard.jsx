import React from "react";
import "./leaderboard.css";

/**MUI styles */
import Table from "@mui/joy/Table";
import Sheet from "@mui/joy/Sheet";

function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}

const rows = [
  createData("Frozen yoghurt", 159, 6.0, 24, 4.0),
  createData("Ice cream sandwich", 237, 9.0, 37, 4.3),
  createData("Eclair", 262, 16.0, 24, 6.0),
  createData("Cupcake", 305, 3.7, 67, 4.3),
  createData("Gingerbread", 356, 16.0, 49, 3.9),
];

const Leaderboard = () => {
  return (
    <div>
      Leaderboard
      {/**Leaderboard sheet with users and their scores for this game */}
      <Sheet
        variant="solid"
        color="primary"
        invertedColors
        sx={{
          pt: 1,
          borderRadius: "sm",
          transition: "0.3s",
          background: (theme) =>
            `linear-gradient(45deg, ${theme.vars.palette.primary[500]}, ${theme.vars.palette.primary[400]})`,
          "& tr:last-child": {
            "& td:first-child": {
              borderBottomLeftRadius: "8px",
            },
            "& td:last-child": {
              borderBottomRightRadius: "8px",
            },
          },
        }}
      >
        <Table stripe="odd" hoverRow>
          <caption>View your ranking among your community</caption>
          <thead>
            <tr>
              <th style={{ width: "40%" }}>User </th>
              <th>Discoveries</th>
              <th>Contributions</th>
              <th>Time Lived Here</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <td>{row.name}</td>
                <td>{row.calories}</td>
                <td>{row.fat}</td>
                <td>{row.carbs}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Sheet>
    </div>
  );
};

export default Leaderboard;
