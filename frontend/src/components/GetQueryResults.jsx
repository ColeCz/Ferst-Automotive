function QueryResults() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/api/query', {
        method: 'POST',
        body: JSON.stringify({ queryName: 'my_query' })
      });
      const data = await response.json();
      setResults(data);
    };
    fetchData();
  }, []);

  return (
    <div>
      {results.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}