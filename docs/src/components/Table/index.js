import './index.css';

export default function Table({ type, defaults }) {
  return (
    <table class="docs-table">
      <tbody>
        <tr>
          <th>Type</th>
          <td>
            <code>{type}</code>
          </td>
          {!defaults ? null : (
            <>
              <th style={{ color: 'rgb(200, 130, 130)' }}>Default</th>
              <td>
                <code>{defaults}</code>
              </td>
            </>
          )}
        </tr>
      </tbody>
    </table>
  );
}
