import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Row, Col, Card, Pagination } from 'react-bootstrap';
import validObjectIDList from '@/public/data/validObjectIDList.json'
import useSWR from 'swr';
import ArtworkCard from '../../navigationbar/ArtworkCard';
import Error from 'next/error';

const PER_PAGE = 12; 

export default function Artwork() {
  const router = useRouter();
  const [artworkList, setArtworkList] = useState(null);
  const [page, setPage] = useState(1);

  const finalQuery = router.asPath.split('?')[1]; 
  console.log(finalQuery);

  const { data, error } = useSWR(
    `https://collectionapi.metmuseum.org/public/collection/v1/search?${finalQuery}`
  );
  useEffect(() => {
    if (data?.objectIDs) {  
      const results = [];
      const filteredResults = validObjectIDList.objectIDs.filter(x => data.objectIDs.includes(x)); 
  
      for (let i = 0; i < filteredResults.length; i += PER_PAGE) {
        results.push(filteredResults.slice(i, i + PER_PAGE));
      }
  
      setArtworkList(results);
      setPage(1); 
    }
  }, [data]); 
  
  const previousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const nextPage = () => {
    if (page < artworkList.length) setPage(page + 1);
  };

  if (error) return <Error statusCode={404} />; 

  if (!artworkList) return null; 

  return (
    <>
      {artworkList.length > 0 ? (
        <Row className="gy-4">
          {artworkList[page - 1].map((objectID) => (
            <Col lg={3} key={objectID}>
              <ArtworkCard objectID={objectID} />
            </Col>
          ))}
        </Row>
      ) : (
        <Card>
          <Card.Body>
            <h4>Nothing Here</h4>
            <p>Try searching for something else.</p>
          </Card.Body>
        </Card>
      )}

      {artworkList.length > 0 && (
        <Row>
          <Col>
            <Pagination>
              <Pagination.Prev onClick={previousPage} />
              <Pagination.Item>{page}</Pagination.Item>
              <Pagination.Next onClick={nextPage} />
            </Pagination>
          </Col>
        </Row>
      )}
    </>
  );
}
